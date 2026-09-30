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

async function duckDuckGoSearch(query, maxResults = 6) {
  try {
    // POST to the legacy HTML endpoint — more reliable than GET for server-side use
    const body = new URLSearchParams({ q: query, b: "", kl: "us-en" }).toString();
    const res = await fetch("https://html.duckduckgo.com/html/", {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Referer: "https://duckduckgo.com/",
      },
      body,
    });

    if (!res.ok) {
      console.error("DuckDuckGo search HTTP error:", res.status);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];

    // Try multiple selector strategies to handle DuckDuckGo HTML variations
    const resultContainers = $(
      ".result, [class*='result__body'], .web-result, .nrn-react-div"
    );

    resultContainers.each((_, el) => {
      if (results.length >= maxResults) return false;

      // Title: try several known class patterns
      const titleEl =
        $(el).find(".result__a, .result__title a, [data-testid='result-title-a'], h2 a").first();
      const snippetEl =
        $(el).find(".result__snippet, [data-result='snippet'], .result__body, .OgdwYG").first();

      const title = titleEl.text().trim();
      const snippet = snippetEl.text().trim();

      if (snippet) {
        results.push(title ? `**${title}**\n${snippet}` : snippet);
      } else if (title) {
        // At minimum, include the title if no snippet
        results.push(`**${title}**`);
      }
    });

    // Fallback: if Cheerio selectors returned nothing, try raw text extraction
    if (results.length === 0) {
      console.warn("DuckDuckGo: Cheerio selectors returned no results, trying fallback.");
      // Extract any visible text blocks between result separators
      $(".result__snippet, .snippet, [class*='snippet']").each((_, el) => {
        if (results.length >= maxResults) return false;
        const text = $(el).text().trim();
        if (text.length > 20) results.push(text);
      });
    }

    return results;
  } catch (err) {
    console.error("DuckDuckGo search error:", err);
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
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const rl = await checkRateLimit(ip);
  if (!rl.success) return rateLimitResponse(rl);

  // ── Parse body ────────────────────────────────────────────────────────────
  try {
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
      const searchResults = await duckDuckGoSearch(message);
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
