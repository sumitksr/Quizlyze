import OpenAI from "openai";

// ── Web Search Tool Definition ────────────────────────────────────────────────

const WEB_SEARCH_TOOL = {
  type: "function",
  function: {
    name: "web_search",
    description:
      "Search Google for real-time information. Use this when the user asks about current events, recent news, facts you're unsure about, or anything that needs up-to-date information. Do NOT call this for casual greetings, opinions, or simple knowledge questions you can answer from training data.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "A clear, specific Google search query. Incorporate relevant context from conversation history to make it self-contained. For example, instead of 'tell me more', use 'more people detained at October 10 Delhi protest'.",
        },
      },
      required: ["query"],
    },
  },
};

// ── Serper Google Search ──────────────────────────────────────────────────────

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

// ── Web Chat Handler (Tool Calling) ───────────────────────────────────────────

/**
 * Handles Web Search mode using OpenAI tool calling.
 *
 * Flow:
 *   1. Send user message + history to LLM with web_search tool available.
 *   2. LLM decides: answer directly OR call web_search(query).
 *   3. If tool called → execute Serper search → feed results back → stream final answer.
 *   4. If no tool called → stream the direct answer.
 *
 * @param {{ openai: OpenAI, message: string, history: Array, rl: object }} opts
 * @returns {Response} Streaming text response
 */
export async function handleWebChat({ openai, message, history, rl }) {
  const systemPrompt = `You are a helpful AI assistant with access to a web_search tool for looking up real-time information on Google.

WHEN TO SEARCH:
- Current events, news, recent happenings
- Facts, dates, statistics you're unsure about
- Anything that might have changed after your training data cutoff
- Follow-up questions about topics discussed earlier that need fresh data

WHEN NOT TO SEARCH:
- Casual greetings ("hi", "hello", "how are you")
- Simple knowledge questions you're confident about
- Opinions or creative tasks (writing, brainstorming)
- Follow-up questions you can answer from the conversation context alone

IMPORTANT:
- When calling web_search, write a specific, self-contained query. Use context from the conversation to make the query complete (e.g., don't just search "tell me more" — search "more details about [specific topic from conversation]").
- When answering with search results, cite source titles in your response.
- If search results don't clearly answer the question, say so honestly.`;

  const messagesForLLM = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map(({ role, content }) => ({ role, content })),
    { role: "user", content: message },
  ];

  // ── Step 1: Initial LLM call — let it decide whether to search ──────────
  console.log(`[WebChat] Initial call with message: "${message}"`);

  const initialResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: messagesForLLM,
    tools: [WEB_SEARCH_TOOL],
    tool_choice: "auto",
  });

  const assistantMessage = initialResponse.choices[0].message;

  // ── Step 2: Check if LLM wants to call web_search ───────────────────────
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    const toolCall = assistantMessage.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);
    const searchQuery = args.query;

    console.log(`[WebChat] LLM decided to search: "${searchQuery}"`);

    // Execute the search
    const searchResults = await webSearch(searchQuery);
    const searchContext = searchResults.length
      ? searchResults.join("\n\n---\n\n")
      : "No search results found for this query.";

    console.log(`[WebChat] Got ${searchResults.length} results, streaming final answer...`);

    // ── Step 3: Feed search results back and stream the final answer ──────
    const finalMessages = [
      ...messagesForLLM,
      assistantMessage, // includes the tool_call
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: searchContext,
      },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completionStream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            messages: finalMessages,
            stream: true,
          });

          for await (const chunk of completionStream) {
            const text = chunk.choices[0]?.delta?.content;
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

  // ── No tool call — LLM answered directly, stream it ─────────────────────
  console.log("[WebChat] LLM answered directly (no search needed)");

  // Re-call with streaming since the initial call was non-streaming
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completionStream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: messagesForLLM,
          stream: true,
        });

        for await (const chunk of completionStream) {
          const text = chunk.choices[0]?.delta?.content;
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
