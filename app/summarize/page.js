"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { generateSummary } from "../../lib/generateSummary";
import ContentForm from "../../components/ContentForm";

export default function SummarizePage() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSummary("");

    try {
      const file = event.target["file-upload"].files[0];
      const youtubeUrl = event.target["youtube-url"].value;
      const textContent = event.target["text-content"].value;

      const result = await generateSummary(file, youtubeUrl, textContent, null);
      setSummary(result);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred while processing your request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black dark:via-black dark:to-gray-900 py-12 transition-all transition-slow">
      <ContentForm
        onSubmit={handleSubmit}
        loading={loading}
        buttonText="Generate Summary"
        title="Content Summarizer"
        description="Upload PDFs, paste YouTube URLs, or input text to get AI-powered summaries"
      />

      {/* Summary Output */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-800/20 transition-all transition-slow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow">
            Generated Summary
          </h2>
          <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-900/20 rounded-xl p-6 min-h-[200px] border border-gray-200/50 dark:border-gray-700/50 transition-all transition-slow">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-400 mt-0.5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-600 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-300">
                  Processing your content...
                </p>
              </div>
            )}

            {summary && !loading && (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900 dark:text-white">
                        {children}
                      </strong>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        {children}
                      </h2>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 mb-4 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-800 dark:text-gray-200">
                        {children}
                      </li>
                    ),
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            )}

            {!summary && !loading && !error && (
              <div className="flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Your AI-generated summary will appear here after processing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
