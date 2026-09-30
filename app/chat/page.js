"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ReactMarkdown from "react-markdown";

// ── Icons ────────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [mode, setMode] = useState("web"); // "pdf" | "web"
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! Choose a mode:\n\n📄 **PDF Chat** — upload a document and ask questions about it using RAG + Chroma\n🔍 **Web Search** — I'll search Google for real-time context before answering",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll: instant during streaming to avoid slide-down jank,
  // smooth only when a brand-new message appears.
  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    const lastMsg = messages[messages.length - 1];
    el.scrollIntoView({ behavior: lastMsg?.streaming ? "instant" : "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  // ── File Handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be under 20 MB.");
      return;
    }
    setError("");
    setPdfFile(file);
    setPdfName(file.name);
    setMessages([
      {
        role: "assistant",
        content: `📄 **${file.name}** uploaded successfully! I've processed this document and I'm ready to answer your questions about it using RAG. What would you like to know?`,
      },
    ]);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removePdf = () => {
    setPdfFile(null);
    setPdfName("");
    setMessages([
      {
        role: "assistant",
        content: "PDF removed. You can upload a new document or continue chatting without one.",
      },
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Send Message ────────────────────────────────────────────────────────────

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setError("");

    const userMsg = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Placeholder for streaming assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      abortControllerRef.current = new AbortController();

      const formData = new FormData();
      formData.append("mode", mode);
      formData.append("message", trimmed);
      formData.append(
        "history",
        JSON.stringify(
          newMessages
            .filter((m) => !m.streaming)
            .slice(-10)
            .map(({ role, content }) => ({ role, content }))
        )
      );
      if (mode === "pdf" && pdfFile) {
        formData.append("pdf", pdfFile);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const wait = errData.retryAfter ? `Try again in ${errData.retryAfter}s.` : "Please slow down.";
          throw new Error(`⏱️ Rate limit reached. ${wait}`);
        }
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulated,
            streaming: true,
          };
          return updated;
        });
      }

      // Finalise
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: accumulated };
        return updated;
      });
    } catch (err) {
      if (err.name === "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + " *(stopped)*",
          };
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `❌ Error: ${err.message}`,
          };
          return updated;
        });
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessages([
      {
        role: "assistant",
        content:
          newMode === "pdf"
            ? "📄 **PDF mode** — Upload a PDF and I'll answer questions using only its content via RAG + Chroma."
            : "🔍 **Web Search mode** — Ask me anything and I'll search Google for real-time context.",
      },
    ]);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          mode === "pdf" && pdfFile
            ? `Chat cleared. **${pdfName}** is still loaded.`
            : mode === "web"
            ? "Chat cleared. Still in web search mode."
            : "Chat cleared.",
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="chat-page-root">
        {/* ── Animated background orbs ── */}
        <div className="chat-bg-orb chat-bg-orb-1" />
        <div className="chat-bg-orb chat-bg-orb-2" />
        <div className="chat-bg-orb chat-bg-orb-3" />

        {mobileSidebarOpen && (
          <div className="mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
        )}

        <div className="chat-layout">
          {/* ── Left Sidebar ─────────────────────────────────────── */}
          <aside className={`chat-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}>
            <div className="sidebar-header">
              <div className="sidebar-title-row">
                <div className="sidebar-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="sidebar-title">AI Chat</span>
              </div>
              <p className="sidebar-subtitle">Choose a mode to get started</p>
            </div>

            {/* Mode selector — PDF | Web */}
            <div className="mode-selector">
              <button
                id="mode-btn-pdf"
                className={`mode-btn${mode === "pdf" ? " mode-btn-active mode-btn-active-pdf" : ""}`}
                onClick={() => switchMode("pdf")}
              >
                <span>📄</span> PDF Chat
              </button>
              <button
                id="mode-btn-web"
                className={`mode-btn${mode === "web" ? " mode-btn-active mode-btn-active-web" : ""}`}
                onClick={() => switchMode("web")}
              >
                <span>🔍</span> Web Search
              </button>
            </div>

            {/* Drop zone — only visible in PDF mode */}
            {mode === "pdf" && (
            <div
              className={`pdf-dropzone${isDragging ? " pdf-dropzone-dragging" : ""}${pdfFile ? " pdf-dropzone-has-file" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !pdfFile && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload PDF document"
              onKeyDown={(e) => e.key === "Enter" && !pdfFile && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden-file-input"
                onChange={(e) => handleFile(e.target.files[0])}
                id="pdf-file-input"
              />
              {pdfFile ? (
                <div className="pdf-file-info">
                  <div className="pdf-file-icon">
                    <PdfIcon />
                  </div>
                  <div className="pdf-file-details">
                    <span className="pdf-file-name">{pdfName}</span>
                    <span className="pdf-file-size">
                      {(pdfFile.size / 1024).toFixed(0)} KB · Ready
                    </span>
                  </div>
                  <button
                    className="pdf-remove-btn"
                    onClick={(e) => { e.stopPropagation(); removePdf(); }}
                    aria-label="Remove PDF"
                    title="Remove PDF"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ) : (
                <div className="pdf-dropzone-empty">
                  <div className="dropzone-upload-icon">
                    <UploadIcon />
                  </div>
                  <p className="dropzone-main-text">Drop PDF here</p>
                  <p className="dropzone-sub-text">or click to browse</p>
                  <p className="dropzone-limit-text">Max 20 MB</p>
                </div>
              )}
            </div>
            )}

            {/* Web search mode info */}
            {mode === "web" && (
              <div className="web-mode-info">
                <div className="web-mode-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="web-mode-title">Google Search</p>
                <p className="web-mode-desc">Your question is searched on Google via Serper. Top results are used as context before answering.</p>
              </div>
            )}

            {/* General mode info */}
            {mode === "general" && (
              <div className="web-mode-info">
                <div className="web-mode-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="web-mode-title">General Chat</p>
                <p className="web-mode-desc">Chat freely with GPT-4o-mini. No document or search context — answers come from the model's training data.</p>
              </div>
            )}

            {/* Info Cards — mode-specific */}
            <div className="sidebar-info-cards">
              {mode === "pdf" && (
                <>
                  <div className="info-card info-card-blue">
                    <div className="info-card-dot info-card-dot-blue" />
                    <div>
                      <p className="info-card-title">Chroma Cloud RAG</p>
                      <p className="info-card-body">PDF chunks are stored in your Chroma Cloud DB. Same PDF won't be re-embedded.</p>
                    </div>
                  </div>
                  <div className="info-card info-card-purple">
                    <div className="info-card-dot info-card-dot-purple" />
                    <div>
                      <p className="info-card-title">Strict Context-Only</p>
                      <p className="info-card-body">Answers are restricted to document content. "Not in document" if not found.</p>
                    </div>
                  </div>
                </>
              )}
              {mode === "web" && (
                <>
                  <div className="info-card info-card-blue">
                    <div className="info-card-dot info-card-dot-blue" />
                    <div>
                      <p className="info-card-title">Google Search</p>
                      <p className="info-card-body">Fetches top Google results for your query via Serper, used as context for the LLM.</p>
                    </div>
                  </div>
                  <div className="info-card info-card-purple">
                    <div className="info-card-dot info-card-dot-purple" />
                    <div>
                      <p className="info-card-title">Real-time Results</p>
                      <p className="info-card-body">Live Google search results — answer boxes, knowledge graphs, and organic links included.</p>
                    </div>
                  </div>
                </>
              )}
              {mode === "general" && (
                <div className="info-card info-card-pink">
                  <div className="info-card-dot info-card-dot-pink" />
                  <div>
                    <p className="info-card-title">GPT-4o-mini</p>
                    <p className="info-card-body">Streaming responses, supports markdown, code, tables, and multi-turn conversation.</p>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── Chat Panel ──────────────────────────────────────────────── */}
          <main className="chat-main">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <button
                  className="mobile-sidebar-btn"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
                <div className="chat-header-avatar">
                  <BotIcon />
                </div>
                <div>
                  <h1 className="chat-header-title">
                    {pdfFile ? pdfName : "AI Assistant"}
                  </h1>
                  <p className="chat-header-status">
                    <span className="status-dot" />
                    {pdfFile ? "RAG mode active · Powered by LangChain" : "General mode · Ready to chat"}
                  </p>
                </div>
              </div>
              <button
                className="clear-chat-btn"
                onClick={clearChat}
                title="Clear chat"
                aria-label="Clear conversation"
              >
                <TrashIcon />
                <span>Clear</span>
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages" id="chat-messages-container">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message-row ${msg.role === "user" ? "message-row-user" : "message-row-assistant"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="message-avatar message-avatar-bot">
                      <BotIcon />
                    </div>
                  )}

                  <div className={`message-bubble ${msg.role === "user" ? "message-bubble-user" : "message-bubble-assistant"}`}>
                    {msg.role === "assistant" ? (
                      <div className="message-markdown">
                        <ReactMarkdown>{msg.content || ""}</ReactMarkdown>
                        {msg.streaming && (
                          <span className="streaming-cursor" aria-label="Streaming" />
                        )}
                      </div>
                    ) : (
                      <p className="message-text">{msg.content}</p>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="message-avatar message-avatar-user">
                      <UserIcon />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="chat-error-banner" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
                <button onClick={() => setError("")} aria-label="Dismiss error">✕</button>
              </div>
            )}

            {/* Input Area */}
            <div className="chat-input-area">
              {pdfFile && (
                <div className="chat-pdf-badge">
                  <PdfIcon />
                  <span>{pdfName}</span>
                </div>
              )}
              <div className="chat-input-row">
                <textarea
                  ref={textareaRef}
                  id="chat-input"
                  className="chat-textarea"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={pdfFile ? `Ask anything about "${pdfName}"…` : "Ask me anything…"}
                  rows={1}
                  disabled={isLoading}
                  aria-label="Chat message input"
                />
                {isLoading ? (
                  <button
                    className="chat-send-btn chat-stop-btn"
                    onClick={stopGeneration}
                    aria-label="Stop generation"
                    title="Stop generation"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </button>
                ) : (
                  <button
                    className="chat-send-btn"
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    aria-label="Send message"
                    id="chat-send-button"
                  >
                    <SendIcon />
                  </button>
                )}
              </div>
              <p className="chat-input-hint">
                Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
              </p>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        body {
          overflow: hidden !important;
          height: 100dvh !important; /* Fixes mobile browser cutoff */
          display: flex;
          flex-direction: column;
        }
        @supports not (height: 100dvh) {
          body { height: 100vh !important; }
        }
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
      `}</style>

      <style jsx>{`
        /* ── Root & Background ─────────────────────────────────── */
        .chat-page-root {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          background: #050508;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* ── Mode Selector ─────────────────────────────────────── */
        .mode-selector {
          display: flex;
          gap: 6px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 6px;
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 4px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.4);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .mode-btn:hover {
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.05);
        }
        .mode-btn-active {
          color: white !important;
          font-weight: 600;
        }
        .mode-btn-active-general {
          background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.2));
          box-shadow: 0 2px 10px rgba(99,102,241,0.2);
        }
        .mode-btn-active-pdf {
          background: linear-gradient(135deg, rgba(6,182,212,0.25), rgba(99,102,241,0.2));
          box-shadow: 0 2px 10px rgba(6,182,212,0.2);
        }
        .mode-btn-active-web {
          background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(6,182,212,0.2));
          box-shadow: 0 2px 10px rgba(16,185,129,0.2);
        }

        /* ── Web / General Mode Info Panel ─────────────────────── */
        .web-mode-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          text-align: center;
        }
        .web-mode-icon {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1));
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          color: #818cf8;
        }
        .web-mode-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
          margin: 0;
        }
        .web-mode-desc {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          margin: 0;
          line-height: 1.5;
        }

        .chat-bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
          pointer-events: none;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .chat-bg-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #6366f1, transparent);
          top: -150px; left: -100px;
          animation-delay: 0s;
        }
        .chat-bg-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #a855f7, transparent);
          bottom: -100px; right: -100px;
          animation-delay: -3s;
        }
        .chat-bg-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #ec4899, transparent);
          top: 50%; right: 30%;
          animation-delay: -5s;

        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(20px, -30px) scale(1.05); }
          66%       { transform: translate(-15px, 20px) scale(0.95); }
        }

        /* ── Layout ─────────────────────────────────────────────── */
        .chat-layout {
          flex: 1;
          display: flex;
          min-height: 0;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          height: 100%;
          padding: 20px 24px 24px;
          gap: 24px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* ── Sidebar ─────────────────────────────────────────────── */
        .chat-sidebar {
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .chat-sidebar::-webkit-scrollbar { width: 0px; }

        .mobile-sidebar-btn {
          display: none;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          margin-left: -8px;
          border-radius: 8px;
        }
        .mobile-sidebar-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .mobile-sidebar-overlay {
          display: none;
        }

        .sidebar-header {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(20px);
        }

        .sidebar-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .sidebar-icon-wrap {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 4px 15px rgba(99,102,241,0.3);
        }

        .sidebar-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #a5b4fc, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-subtitle {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin: 0;
          line-height: 1.4;
        }

        /* ── Drop Zone ─────────────────────────────────────────────── */
        .pdf-dropzone {
          background: rgba(255,255,255,0.03);
          border: 2px dashed rgba(99,102,241,0.3);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .pdf-dropzone:hover,
        .pdf-dropzone-dragging {
          border-color: rgba(99,102,241,0.7);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 30px rgba(99,102,241,0.1);
        }
        .pdf-dropzone-has-file {
          border-style: solid;
          border-color: rgba(99,102,241,0.4);
          cursor: default;
        }

        .hidden-file-input {
          display: none;
        }

        .pdf-dropzone-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .dropzone-upload-icon {
          color: rgba(99,102,241,0.6);
          margin-bottom: 4px;
        }

        .dropzone-main-text {
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          margin: 0;
        }

        .dropzone-sub-text {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }

        .dropzone-limit-text {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.25);
          margin: 0;
        }

        /* Uploaded file state */
        .pdf-file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pdf-file-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #818cf8;
          flex-shrink: 0;
        }

        .pdf-file-details {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .pdf-file-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-file-size {
          font-size: 0.72rem;
          color: rgba(129,140,248,0.8);
        }

        .pdf-remove-btn {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          color: #f87171;
          padding: 6px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .pdf-remove-btn:hover {
          background: rgba(239,68,68,0.2);
          border-color: rgba(239,68,68,0.4);
        }

        /* ── Info Cards ─────────────────────────────────────────────── */
        .sidebar-info-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .info-card {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid;
        }
        .info-card-blue {
          background: rgba(99,102,241,0.05);
          border-color: rgba(99,102,241,0.15);
        }
        .info-card-purple {
          background: rgba(168,85,247,0.05);
          border-color: rgba(168,85,247,0.15);
        }
        .info-card-pink {
          background: rgba(236,72,153,0.05);
          border-color: rgba(236,72,153,0.15);
        }

        .info-card-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }
        .info-card-dot-blue  { background: #818cf8; box-shadow: 0 0 6px #818cf8; }
        .info-card-dot-purple{ background: #c084fc; box-shadow: 0 0 6px #c084fc; }
        .info-card-dot-pink  { background: #f472b6; box-shadow: 0 0 6px #f472b6; }

        .info-card-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
          margin: 0 0 3px;
        }

        .info-card-body {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.4);
          margin: 0;
          line-height: 1.5;
        }

        /* ── Chat Main ────────────────────────────────────────────── */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          backdrop-filter: blur(20px);
        }

        /* ── Chat Header ─────────────────────────────────────────────── */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.2);
        }

        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .chat-header-avatar {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 4px 15px rgba(99,102,241,0.3);
        }

        .chat-header-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
          margin: 0;
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-header-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }

        .status-dot {
          width: 6px; height: 6px;
          background: #4ade80;
          border-radius: 50%;
          box-shadow: 0 0 6px #4ade80;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }

        .clear-chat-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(255,255,255,0.5);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-chat-btn:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.2);
          color: #f87171;
        }

        /* ── Messages ─────────────────────────────────────────────── */
        .chat-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overscroll-behavior: contain;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .message-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: messageIn 0.3s ease;
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .message-row-user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .message-avatar-bot {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          box-shadow: 0 4px 10px rgba(99,102,241,0.3);
        }

        .message-avatar-user {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white;
          box-shadow: 0 4px 10px rgba(99,102,241,0.25);
        }

        .message-bubble {
          max-width: 75%;
          padding: 14px 18px;
          border-radius: 18px;
          line-height: 1.6;
          font-size: 0.875rem;
        }

        .message-bubble-assistant {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-top-left-radius: 4px;
          color: rgba(255,255,255,0.85);
        }

        .message-bubble-user {
          background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.2));
          border: 1px solid rgba(99,102,241,0.25);
          border-top-right-radius: 4px;
          color: white;
        }

        .message-text { margin: 0; }

        .message-markdown { color: rgba(255,255,255,0.85); }
        .message-markdown :global(p) { margin: 0 0 8px; }
        .message-markdown :global(p:last-child) { margin-bottom: 0; }
        .message-markdown :global(strong) { color: #a5b4fc; }
        .message-markdown :global(code) {
          background: rgba(99,102,241,0.15);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.82em;
          color: #c084fc;
        }
        .message-markdown :global(pre) {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 14px;
          overflow-x: auto;
          margin: 8px 0;
        }
        .message-markdown :global(pre code) {
          background: none;
          padding: 0;
          color: rgba(255,255,255,0.8);
        }
        .message-markdown :global(ul), .message-markdown :global(ol) {
          margin: 8px 0;
          padding-left: 20px;
        }
        .message-markdown :global(li) { margin-bottom: 4px; }
        .message-markdown :global(blockquote) {
          border-left: 3px solid #818cf8;
          padding-left: 12px;
          margin: 8px 0;
          color: rgba(255,255,255,0.6);
        }
        .message-markdown :global(h1), .message-markdown :global(h2), .message-markdown :global(h3) {
          color: #c4b5fd;
          margin: 12px 0 6px;
        }

        .streaming-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #818cf8;
          vertical-align: text-bottom;
          border-radius: 1px;
          margin-left: 2px;
          animation: blink 0.7s steps(1) infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        /* ── Error Banner ──────────────────────────────────────────── */
        .chat-error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          margin: 0 16px 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 0.8rem;
        }
        .chat-error-banner button {
          margin-left: auto;
          background: none;
          border: none;
          color: #fca5a5;
          cursor: pointer;
          font-size: 1rem;
          padding: 0 4px;
        }

        /* ── Input Area ─────────────────────────────────────────────── */
        .chat-input-area {
          padding: 16px 20px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .chat-pdf-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          color: #a5b4fc;
          font-size: 0.72rem;
          align-self: flex-start;
        }
        .chat-pdf-badge svg { width: 12px; height: 12px; }

        .chat-input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
        }

        .chat-textarea {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 13px 16px;
          color: white;
          font-size: 0.875rem;
          resize: none;
          font-family: inherit;
          line-height: 1.5;
          min-height: 48px;
          max-height: 160px;
          transition: border-color 0.2s, box-shadow 0.2s;
          overflow-y: auto;
        }
        .chat-textarea::placeholder { color: rgba(255,255,255,0.3); }
        .chat-textarea:focus {
          outline: none;
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .chat-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

        .chat-send-btn {
          width: 46px; height: 46px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          box-shadow: 0 4px 15px rgba(99,102,241,0.3);
        }
        .chat-send-btn:hover:not(:disabled) {
          transform: scale(1.05) translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .chat-send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .chat-stop-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 4px 15px rgba(239,68,68,0.3);
        }
        .chat-stop-btn:hover {
          box-shadow: 0 6px 20px rgba(239,68,68,0.4);
        }

        .chat-input-hint {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.2);
          margin: 0;
          text-align: center;
        }
        .chat-input-hint kbd {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 1px 5px;
          font-family: inherit;
          font-size: 0.68rem;
        }

        /* ── Responsive ─────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .chat-layout {
            padding: 8px;
            gap: 8px;
            /* Keep it flex-row but the sidebar becomes absolute */
          }
          .mobile-sidebar-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            top: 64px; /* below navbar */
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            z-index: 40;
          }
          .chat-sidebar {
            position: fixed;
            top: 64px;
            bottom: 0;
            left: 0;
            width: 300px;
            max-width: 85vw;
            background: #09090b; /* dark bg so it's opaque */
            z-index: 50;
            transform: translateX(-100%);
            border-right: 1px solid rgba(255,255,255,0.1);
            padding: 20px;
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
          }
          .chat-sidebar.mobile-open {
            transform: translateX(0);
          }
          .chat-main {
            flex: 1;
            min-height: 0;
          }
          .sidebar-info-cards {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .chat-header-title { font-size: 0.85rem; max-width: 180px; }
          .message-bubble { max-width: 90%; }
          .chat-input-wrapper { padding: 12px; gap: 8px; }
          .chat-messages { padding: 12px; }
        }
      `}</style>
    </>
  );
}
