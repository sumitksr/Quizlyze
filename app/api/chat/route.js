import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit } from "@/lib/ratelimit";
import { handlePdfChat } from "@/lib/handlers/pdfHandler";
import { handleWebChat } from "@/lib/handlers/webHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Rate limit response helper ────────────────────────────────────────────────
function rateLimitResponse(result) {
  const resetDate = new Date(result.reset);
  const retryAfterSec = Math.ceil((result.reset - Date.now()) / 1000);
  const reason =
    result.reason === "per_minute"
      ? "You've hit the per-minute limit (10 requests/min)."
      : "You've hit the hourly limit (40 requests/hr).";

  return NextResponse.json(
    {
      error: "Rate limit exceeded",
      message: `${reason} Please try again in ${retryAfterSec}s.`,
      retryAfter: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetDate.toISOString(),
      },
    }
  );
}

/**
 * POST /api/chat
 * Thin router — rate limits, parses request, delegates to the right handler.
 *
 * Modes:
 *   "pdf" → lib/handlers/pdfHandler.js  (RAG + Chroma)
 *   "web" → lib/handlers/webHandler.js  (Tool-calling + Serper)
 *
 * Rate limited: 10 req/min · 40 req/hr per IP
 */
export async function POST(request) {
  try {
    // ── Rate limiting ───────────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "anonymous";

    console.log(`[Chat API] Rate-limit identifier: "${ip}"`);

    const rl = await checkRateLimit(ip);
    if (!rl.success) return rateLimitResponse(rl);

    // ── Parse body ──────────────────────────────────────────────────────────
    const formData = await request.formData();
    const mode = formData.get("mode") || "web";
    const message = formData.get("message");
    const historyRaw = formData.get("history");
    const history = historyRaw ? JSON.parse(historyRaw) : [];

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log(`[Chat API] mode=${mode}, message="${message.slice(0, 80)}…"`);

    // ── Delegate to handler ─────────────────────────────────────────────────
    if (mode === "pdf") {
      const pdfFile = formData.get("pdf");
      return handlePdfChat({ openai, message, history, pdfFile, rl });
    }

    // Default: web mode
    return handleWebChat({ openai, message, history, rl });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
