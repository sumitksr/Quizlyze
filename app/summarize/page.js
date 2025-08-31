"use client";
import React, { useState } from "react";
import { generateSummary } from "../../lib/generateSummary";

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
      // Get form inputs
      const file = document.getElementById("file-upload").files[0];
      const youtubeUrl = document.getElementById("youtube-url").value;
      const textContent = document.getElementById("text-content").value;

      // Generate summary using the dedicated function
      const result = await generateSummary(file, youtubeUrl, textContent);
      setSummary(result);

    } catch (err) {
      console.error("Error:", err);
      setError(
        err.message || "An error occurred while processing your request"
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black dark:via-black dark:to-gray-900 py-12 transition-all transition-slow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow">
            Content Summarizer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-all transition-slow">
            Upload PDFs, paste YouTube URLs, or input text to get AI-powered
            summaries
          </p>
        </div>

        {/* Input Form */}
        <form className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-800/20 transition-all transition-slow">
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-all transition-slow">
                Upload PDF Document
              </label>
              <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-all transition-slow bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <svg
                  className="mx-auto h-12 w-12 text-indigo-400 dark:text-indigo-500 transition-all transition-slow"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all transition-slow transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Choose PDF file
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-all transition-slow">
                  PDF up to 10MB
                </p>
              </div>
            </div>

            {/* YouTube URL */}
            <div>
              <label
                htmlFor="youtube-url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-all transition-slow"
              >
                YouTube Video URL
              </label>
              <input
                type="url"
                id="youtube-url"
                name="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all transition-slow bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Text Input */}
            <div>
              <label
                htmlFor="text-content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-all transition-slow"
              >
                Or paste your text content
              </label>
              <textarea
                id="text-content"
                name="text-content"
                rows={6}
                placeholder="Paste your text content here..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all transition-slow resize-none bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transition-slow transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 transition-all transition-slow"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="transition-all transition-slow">
                      Generate Summary
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Summary Output */}
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
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
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
