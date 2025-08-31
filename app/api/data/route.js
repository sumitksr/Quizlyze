import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { data } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize the following text:\n\n${data}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();

    const summary =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary generated";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Error in summarization:", err);
    return NextResponse.json(
      { error: "Failed to summarize data" },
      { status: 500 }
    );
  }
}
