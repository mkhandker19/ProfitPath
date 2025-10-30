import { NextResponse } from "next/server";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const question =
      body.question ||
      (Array.isArray(body.messages)
        ? body.messages.map((m) => m.content).join("\n")
        : "");

    if (!question)
      return NextResponse.json({ error: "Missing input" }, { status: 400 });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY)
      return NextResponse.json(
        { error: "Server missing GEMINI_API_KEY" },
        { status: 500 }
      );

    const resp = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: question }] }],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("❌ Gemini API error:", err);
      return NextResponse.json(
        { error: "Gemini API error", detail: err },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No AI insight available.";

    console.log("✅ Gemini AI answer:", answer.slice(0, 120));

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("❌ /api/ai server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
