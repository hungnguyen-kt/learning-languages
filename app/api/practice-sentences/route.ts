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

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

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
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);

    const isQuotaError =
      typeof message === "string" &&
      (message.includes("429 Too Many Requests") ||
        message.toLowerCase().includes("quota exceeded"));

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            "AI daily quota has been exceeded. Please try again later or tomorrow.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Failed to generate practice sentences.", detail: message },
      { status: 500 },
    );
  }
}

