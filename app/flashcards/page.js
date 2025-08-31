"use client";
import React, { useState } from "react";
import { processContent } from "../../lib/contentFetcher";
import ContentForm from "../../components/ContentForm";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFlashcards(null);

    try {
      // Get form inputs
      const file = document.getElementById("file-upload").files[0];
      const youtubeUrl = document.getElementById("youtube-url").value;
      const textContent = document.getElementById("text-content").value;

      // Use shared utility to process content
      const result = await processContent(file, youtubeUrl, textContent, 'flashcards', {
        numCards: 15
      });
      setFlashcards(result);

    } catch (err) {
      console.error("Error:", err);
      setError(
        err.message || "An error occurred while generating flashcards"
      );
    } finally {
      setLoading(false);
    }
  }

  const flashcardIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black dark:via-black dark:to-gray-900 py-12 transition-all transition-slow">
      <ContentForm
        onSubmit={handleSubmit}
        loading={loading}
        buttonText="Generate Flashcards"
        buttonIcon={flashcardIcon}
        title="AI Flashcard Generator"
        description="Upload PDFs, paste YouTube URLs, or input text to generate study flashcards"
      />

      {/* Flashcards Output */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-800/20 transition-all transition-slow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow">
            Generated Flashcards
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
                  Creating your flashcards...
                </p>
              </div>
            )}

            {flashcards && !loading && (
              <div className="space-y-4">
                <p className="text-gray-800 dark:text-gray-200">
                  Flashcards generated successfully! (You'll need to create the /api/flashcards endpoint)
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(flashcards, null, 2)}
                </pre>
              </div>
            )}

            {!flashcards && !loading && !error && (
              <div className="flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Your AI-generated flashcards will appear here after processing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}