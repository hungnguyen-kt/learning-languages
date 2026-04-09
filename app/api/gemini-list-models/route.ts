import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1/models";

export async function GET(_req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const url = `${GEMINI_MODELS_URL}?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: "Failed to list Gemini models.",
          status: res.status,
          detail: text,
        },
        { status: 500 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);

    return NextResponse.json(
      {
        error: "Unexpected error while listing Gemini models.",
        detail: message,
      },
      { status: 500 },
    );
  }
}

