import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChromaClient } from "chromadb";
import OpenAI from "openai";
import { createHash } from "crypto";
import { checkRateLimit } from "@/lib/ratelimit";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getChromaClient() {
  return new ChromaClient({
    ssl: true,
    host: "api.trychroma.com",
    headers: { "x-chroma-token": process.env.CHROMA_API_KEY },
    tenant: "91184c98-8d78-409c-83e7-bd2a64d7f360",
    database: "quizlyze",
  });
}

function makeEmbeddingFn(openai) {
  return {
    generate: async (texts) => {
      const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
      });
      return res.data.map((d) => d.embedding);
    },
  };
}

async function webSearch(query, maxResults = 6) {
  try {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=${maxResults + 2}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
      },
    });

    if (!res.ok) {
      console.error("[WebSearch] Bing HTTP error:", res.status);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];

    // Bing organic results live inside li.b_algo
    $("li.b_algo").each((_, el) => {
      if (results.length >= maxResults) return false;

      const title = $(el).find("h2 a").first().text().trim();
      // Bing snippets are in .b_caption p or .b_caption .b_snippetBigText
      const snippet =
        $(el).find(".b_caption p, .b_caption .b_snippetBigText").first().text().trim() ||
        $(el).find(".b_caption").first().text().trim();

      if (snippet) {
        results.push(title ? `**${title}**\n${snippet}` : snippet);
      } else if (title) {
        results.push(`**${title}**`);
      }
    });

    // Fallback: try alternate Bing selectors if b_algo yielded nothing
    if (results.length === 0) {
      console.warn("[WebSearch] Primary Bing selectors empty, trying fallback.");
      $(".b_ans, .b_top, .b_xlText, .b_paractl").each((_, el) => {
        if (results.length >= maxResults) return false;
        const text = $(el).text().trim();
        if (text.length > 30) results.push(text.slice(0, 500));
      });
    }

    console.log(`[WebSearch] Bing returned ${results.length} results for "${query}"`);
    return results;
  } catch (err) {
    console.error("[WebSearch] Bing search error:", err);
    return [];
  }
}

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
 * Modes: "pdf" | "web"
 * Rate limited: 10 req/min · 40 req/hr per IP
 */
export async function POST(request) {
  try {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "anonymous";

  console.log(`[Chat API] Rate-limit identifier: "${ip}"`);

  const rl = await checkRateLimit(ip);
  if (!rl.success) return rateLimitResponse(rl);

  // ── Parse body ────────────────────────────────────────────────────────────
    const formData   = await request.formData();
    const mode       = formData.get("mode") || "web"; // "pdf" | "web"
    const pdfFile    = formData.get("pdf");
    const message    = formData.get("message");
    const historyRaw = formData.get("history");
    const history    = historyRaw ? JSON.parse(historyRaw) : [];

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let systemPrompt = "";
    let contextBlock = "";

    // ── PDF mode ──────────────────────────────────────────────────────────────
    if (mode === "pdf") {
      if (!pdfFile || pdfFile.size === 0) {
        return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const buffer      = Buffer.from(arrayBuffer);
      const collectionName =
        "pdf" + createHash("sha256").update(buffer).digest("hex").slice(0, 40);

      const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
      const data    = await pdfParse(buffer);
      const pdfText = (data.text || "")
        .replace(/ +/g, " ")
        .replace(/\r\n|\r/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (pdfText) {
        const chroma      = getChromaClient();
        const embeddingFn = makeEmbeddingFn(openai);
        const existingNames = (await chroma.listCollections()).map((c) => c.name);
        let collection;

        if (existingNames.includes(collectionName)) {
          collection = await chroma.getCollection({
            name: collectionName,
            embeddingFunction: embeddingFn,
          });
        } else {
          collection = await chroma.createCollection({
            name: collectionName,
            embeddingFunction: embeddingFn,
            metadata: { "hnsw:space": "cosine" },
          });

          const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
          });
          const docs   = await splitter.createDocuments([pdfText]);
          const chunks = docs.map((d) => d.pageContent);

          for (let i = 0; i < chunks.length; i += 100) {
            const batch = chunks.slice(i, i + 100);
            const embs  = await embeddingFn.generate(batch);
            await collection.add({
              ids:        batch.map((_, j) => `chunk-${i + j}`),
              documents:  batch,
              embeddings: embs,
            });
          }
        }

        const [queryEmbedding] = await embeddingFn.generate([message]);
        const count   = await collection.count();
        const results = await collection.query({
          queryEmbeddings: [queryEmbedding],
          nResults: Math.min(5, count),
          include: ["documents", "distances"],
        });

        const retrievedDocs   = results.documents?.[0] ?? [];
        const distances       = results.distances?.[0] ?? [];

        // Cosine distance: 0 = identical, 1 = orthogonal, 2 = opposite.
        // For text-embedding-3-small, distances are tightly clustered. 
        // 0.82 is a good threshold: allows generic queries like "what topics are here" 
        // but blocks completely off-topic queries like "write dijkstra code".
        const RELEVANCE_THRESHOLD = 0.82;
        const bestDistance = distances.length > 0 ? Math.min(...distances) : 1;
        const isInContext  = bestDistance < RELEVANCE_THRESHOLD;

        contextBlock = retrievedDocs.join("\n\n---\n\n");

        if (isInContext) {
          // ✅ Question is related to the PDF — answer strictly from document
          systemPrompt = `You are a document assistant. The user's question is relevant to the uploaded PDF.

Answer using the PDF context below. Be accurate and cite specific parts of the document.
If something is only partially covered, say what the document says and note any gaps.

PDF DOCUMENT CONTEXT:
${contextBlock}`;
        } else {
          // 🚫 Question is completely off-topic — strictly refuse to answer
          systemPrompt = `You are a strict document assistant. The user's question is completely off-topic from the uploaded PDF document. 

Do NOT answer the question. Do NOT provide any code, explanations, or general knowledge.
Respond politely with exactly this message or something similar:
"This question is completely unrelated to the uploaded document. Please ask a question that is relevant to the PDF's content."`;
        }
      }

    }

    // ── Web search mode ───────────────────────────────────────────────────────
    else {
      const searchResults = await webSearch(message);
      contextBlock = searchResults.length
        ? searchResults.join("\n\n---\n\n")
        : "No search results found.";

      systemPrompt = `You are a web-search assistant. Answer using ONLY the search results below.

STRICT RULES:
- Base your answer exclusively on the provided search results.
- If the results don't clearly answer the question, say: "The search results don't clearly answer this — try rephrasing."
- Cite source titles when possible.

WEB SEARCH RESULTS for: "${message}"
${contextBlock}`;
    }

    // ── Stream ────────────────────────────────────────────────────────────────
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    const encoder = new TextEncoder();
    const stream  = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.1,
            stream: true,
          });
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Limit": String(rl.limit),
      },
    });
  } catch (error) {
    console.error("Chat RAG error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
