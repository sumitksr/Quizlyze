import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChromaClient } from "chromadb";
import { createHash } from "crypto";
import { ChatOpenAI } from "@langchain/openai";

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

// ── PDF Handler ───────────────────────────────────────────────────────────────

/**
 * Handles PDF mode: parse PDF → embed in Chroma → RAG query → stream answer.
 * @param {{ openai: OpenAI, message: string, history: Array, pdfFile: File, rl: object }} opts
 * @returns {Response} Streaming text response
 */
export async function handlePdfChat({ openai, message, history, pdfFile, rl }) {
  if (!pdfFile || pdfFile.size === 0) {
    const { NextResponse } = await import("next/server");
    return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
  }

  const arrayBuffer = await pdfFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const collectionName =
    "pdf" + createHash("sha256").update(buffer).digest("hex").slice(0, 40);

  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(buffer);
  const pdfText = (data.text || "")
    .replace(/ +/g, " ")
    .replace(/\r\n|\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  let systemPrompt = "";
  let contextBlock = "";

  if (pdfText) {
    const chroma = getChromaClient();
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
      const docs = await splitter.createDocuments([pdfText]);
      const chunks = docs.map((d) => d.pageContent);

      for (let i = 0; i < chunks.length; i += 100) {
        const batch = chunks.slice(i, i + 100);
        const embs = await embeddingFn.generate(batch);
        await collection.add({
          ids: batch.map((_, j) => `chunk-${i + j}`),
          documents: batch,
          embeddings: embs,
        });
      }
    }

    const [queryEmbedding] = await embeddingFn.generate([message]);
    const count = await collection.count();
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: Math.min(5, count),
      include: ["documents", "distances"],
    });

    const retrievedDocs = results.documents?.[0] ?? [];
    const distances = results.distances?.[0] ?? [];

    // Cosine distance: 0 = identical, 1 = orthogonal, 2 = opposite.
    // 0.82 is a good threshold for text-embedding-3-small.
    const RELEVANCE_THRESHOLD = 0.82;
    const bestDistance = distances.length > 0 ? Math.min(...distances) : 1;
    const isInContext = bestDistance < RELEVANCE_THRESHOLD;

    contextBlock = retrievedDocs.join("\n\n---\n\n");

    if (isInContext) {
      systemPrompt = `You are a document assistant. The user's question is relevant to the uploaded PDF.

Answer using the PDF context below. Be accurate and cite specific parts of the document.
If something is only partially covered, say what the document says and note any gaps.

PDF DOCUMENT CONTEXT:
${contextBlock}`;
    } else {
      systemPrompt = `You are a strict document assistant. The user's question is completely off-topic from the uploaded PDF document. 

Do NOT answer the question. Do NOT provide any code, explanations, or general knowledge.
Respond politely with exactly this message or something similar:
"This question is completely unrelated to the uploaded document. Please ask a question that is relevant to the PDF's content."`;
    }
  }

  // ── Stream ──────────────────────────────────────────────────────────────────
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
  const stream = new ReadableStream({
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
}
