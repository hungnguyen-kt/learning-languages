import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type RequestBody = {
  vn: string;
  en?: string;
  jp?: string;
};

const systemPrompt = `
You are a professional English and Japanese language teacher.

Your task:
- Analyze student translations
- Correct grammar
- Improve naturalness
- Provide alternative sentences
- Give short grammar notes
- If the translation is correct, no need to return improved version, alternatives and grammar note

Always return STRICT JSON.
Do NOT return markdown.
Do NOT explain outside JSON.
`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { vn, en, jp } = body;

    if (!vn || (!en && !jp)) {
      return NextResponse.json(
        { error: "Missing required fields vn + (en or jp)." },
        { status: 400 },
      );
    }

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
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const targetLang = en ? "English" : "Japanese";
    const learnerText = en ?? jp ?? "";

    const userPrompt = `
      Source sentence (Vietnamese):
      ${vn}

      Learner's translation (${targetLang}):
      ${learnerText}

      Return a single JSON object with this shape:
      {
        "overall": string,              // short comment on meaning correctness
        "correction": string,           // corrected version
        "alternatives": string[],       // 1–2 natural alternative sentences
        "grammarNote": string           // short grammar note
      }
    `;

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();

    try {
      const json = JSON.parse(cleaned);
      return NextResponse.json(json);
    } catch {
      // If Gemini doesn't obey strict JSON, return raw text for debugging.
      return NextResponse.json({ raw: text });
    }
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);

    return NextResponse.json(
      { error: "Failed to get feedback from Gemini.", detail: message },
      { status: 500 },
    );
  }
}


