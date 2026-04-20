import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type PracticeSentence = {
  id: number;
  vietnamese: string;
  english: "";
  japanese: "";
};

type PracticeSentencesResponse = {
  sentences: PracticeSentence[];
};

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [700, 1500, 3000] as const;

const prompt = `
You are generating practice sentences for a language learning website.

Task:
Generate 20 natural Vietnamese sentences for translation practice.

Requirements:
- Sentences should be common daily-life conversations.
- Difficulty: beginner to intermediate.
- Sentences should be clear and natural Vietnamese.
- Each sentence should be different.
- Do NOT include translations.

Return ONLY valid JSON.
Do NOT include explanations.
Do NOT include markdown.

JSON format must be exactly:

{
  "sentences": [
    {
      "id": number,
      "vietnamese": string,
      "english": "",
      "japanese": ""
    }
  ]
}

Rules:
- Generate exactly 20 items.
- id must start from 1 and increase sequentially.
- english and japanese must be empty strings.
`;

function isValidResponse(data: unknown): data is PracticeSentencesResponse {
  if (typeof data !== "object" || data === null) return false;
  const sentences = (data as { sentences?: unknown }).sentences;
  if (!Array.isArray(sentences) || sentences.length !== 20) return false;

  for (let i = 0; i < sentences.length; i++) {
    const item = sentences[i] as Partial<PracticeSentence>;
    if (typeof item !== "object" || item === null) return false;
    if (item.id !== i + 1) return false;
    if (typeof item.vietnamese !== "string" || !item.vietnamese.trim())
      return false;
    if (item.english !== "" || item.japanese !== "") return false;
  }

  return true;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : JSON.stringify(error);
}

function isQuotaError(message: string): boolean {
  return (
    message.includes("429 Too Many Requests") ||
    message.toLowerCase().includes("quota exceeded")
  );
}

function isTransientModelError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    message.includes("503 Service Unavailable") ||
    lower.includes("high demand") ||
    lower.includes("temporarily unavailable") ||
    lower.includes("internal error")
  );
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "models/gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  let lastErrorMessage = "";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();

      try {
        const json = JSON.parse(cleaned) as unknown;
        if (isValidResponse(json)) {
          return NextResponse.json(json, {
            headers: { "Cache-Control": "no-store" },
          });
        }

        return NextResponse.json(
          { error: "Invalid response shape from Gemini.", raw: text },
          { status: 502 },
        );
      } catch {
        return NextResponse.json({ raw: text }, { status: 502 });
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      lastErrorMessage = message;

      if (isQuotaError(message)) {
        return NextResponse.json(
          {
            error:
              "AI daily quota has been exceeded. Please try again later or tomorrow.",
          },
          { status: 429 },
        );
      }

      const canRetry = isTransientModelError(message) && attempt < MAX_RETRIES;
      if (!canRetry) {
        break;
      }

      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  if (isTransientModelError(lastErrorMessage)) {
    return NextResponse.json(
      {
        error:
          "Gemini is currently overloaded. Please try again in a few seconds.",
        detail: lastErrorMessage,
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      error: "Failed to generate practice sentences.",
      detail: lastErrorMessage,
    },
    { status: 500 },
  );
}

