import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChromaClient } from "chromadb";
import OpenAI from "openai";
import { createHash } from "crypto";
import { checkRateLimit } from "@/lib/ratelimit";
import { ChatOpenAI } from "@langchain/openai";


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
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) {
      console.error("[WebSearch] SERP_API_KEY is not set in environment variables.");
      return [];
    }

    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: maxResults }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[WebSearch] Serper API error ${res.status}:`, errText);
      return [];
    }

    const data = await res.json();
    const results = [];

    // Answer box (direct answer for factual queries)
    if (data.answerBox) {
      const ab = data.answerBox;
      const text = ab.answer || ab.snippet || ab.snippetHighlighted?.join(" ") || "";
      if (text) results.push(`**${ab.title || "Answer"}**\n${text}`);
    }

    // Knowledge graph
    if (data.knowledgeGraph?.description && results.length < maxResults) {
      results.push(`**${data.knowledgeGraph.title}**\n${data.knowledgeGraph.description}`);
    }

    // Organic results
    for (const item of data.organic || []) {
      if (results.length >= maxResults) break;
      const snippet = item.snippet || "";
      if (snippet) {
        results.push(`**${item.title}**\n${snippet}`);
      }
    }

    console.log(`[WebSearch] Serper returned ${results.length} results for "${query}"`);
    return results;
  } catch (err) {
    console.error("[WebSearch] Serper error:", err);
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
      // ── Step 1: Reformulate the query using conversation history ──────────
      // Turns vague follow-ups ("tell me more", "what date?") into
      // fully self-contained Google search queries.
      let searchQuery = message;
      const conversationHistory = history.slice(-8);

      if (conversationHistory.length > 0) {
        try {
          const reformulationRes = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            max_tokens: 80,
            messages: [
              {
                role: "system",
                content: `You are a search query reformulator. Given a conversation history and a user's latest message, rewrite the user's message as a standalone, specific Google search query that captures the full context.

RULES:
- Output ONLY the search query — no explanation, no quotes, no extra text.
- Make it specific enough to return useful Google results.
- If the message is already a clear standalone question, return it as-is (cleaned up).
- Incorporate relevant context from history (topics, names, places, dates) to make the query self-contained.`,
              },
              ...conversationHistory.map(({ role, content }) => ({
                role,
                content: String(content).slice(0, 500),
              })),
              {
                role: "user",
                content: `Reformulate this as a standalone search query: "${message}"`,
              },
            ],
          });

          const reformulated = reformulationRes.choices[0]?.message?.content?.trim();
          if (reformulated) {
            searchQuery = reformulated;
            console.log(`[WebSearch] Reformulated: "${message}" → "${searchQuery}"`);
          }
        } catch (reformErr) {
          console.warn("[WebSearch] Query reformulation failed, using original:", reformErr.message);
        }
      }

      // ── Step 2: Search with the reformulated query ────────────────────────
      const searchResults = await webSearch(searchQuery);
      contextBlock = searchResults.length
        ? searchResults.join("\n\n---\n\n")
        : "No search results found.";

      systemPrompt = `You are a web-search assistant. Answer using ONLY the search results below.

STRICT RULES:
- Base your answer exclusively on the provided search results.
- If the results don't clearly answer the question, say: "The search results don't clearly answer this — try rephrasing."
- Cite source titles when possible.

WEB SEARCH RESULTS for: "${searchQuery}"
${contextBlock}`;
    }

    // ── Stream ────────────────────────────────────────────────────────────────
    // ChatOpenAI auto-traces to LangSmith via LANGSMITH_TRACING env var
    const chatModel = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.1,
      streaming: true,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const lcMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    const encoder = new TextEncoder();
    const stream  = new ReadableStream({
      async start(controller) {
        try {
          const lcStream = await chatModel.stream(lcMessages);
          for await (const chunk of lcStream) {
            const text = chunk.content;
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
