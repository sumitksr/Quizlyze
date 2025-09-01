"use client";
import React from "react";
import Link from "next/link";

export default function ContentForm({
  onSubmit,
  loading,
  buttonText = "Generate",
  buttonIcon = null,
  title = "Content Processor",
  description = "Upload PDFs, paste YouTube URLs, or input text",
  showNumberInput = false,
  numberInputLabel = "Number of Items",
  numberInputValue = 10,
  onNumberChange = () => {},
  minNumber = 1,
  maxNumber = 50,
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow">
          {title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 transition-all transition-slow">
          {description}
        </p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={onSubmit}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-800/20 transition-all transition-slow"
      >
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

          {/* YouTube URL Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                If YouTube URL doesn't work, 
                <Link href="/about#youtube-integration" className="font-medium underline hover:text-amber-800 dark:hover:text-amber-200 ml-1">
                  see manual workaround instructions
                </Link>
              </p>
            </div>
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

          {/* Number Input */}
          {showNumberInput && (
            <div>
              <label
                htmlFor="number-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-all transition-slow"
              >
                {numberInputLabel}
              </label>
              <input
                type="number"
                id="number-input"
                name="number-input"
                min={minNumber}
                max={maxNumber}
                value={numberInputValue}
                onChange={(e) =>
                  onNumberChange(parseInt(e.target.value) || minNumber)
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all transition-slow bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose between {minNumber} and {maxNumber}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
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
                  {buttonIcon || (
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
                  )}
                  <span className="transition-all transition-slow">
                    {buttonText}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
