import React from 'react'

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-indigo-100 dark:from-black dark:via-black dark:to-gray-900 py-12 transition-all transition-slow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow">
            <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 dark:from-pink-400 dark:via-rose-400 dark:to-indigo-400 bg-clip-text text-transparent hover:from-pink-500 hover:via-rose-500 hover:to-indigo-500 transition-all transition-slow">
              Interactive Flashcards
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-all transition-slow">
            Build personalized flashcards from your content for effective memorization and spaced repetition learning
          </p>
        </div>

        {/* Flashcard Creation Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* From Summary */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transition-slow transform hover:scale-105 border border-white/20 dark:border-gray-800/20">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all transition-slow">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400 transition-all transition-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow">From Summary</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 transition-all transition-slow">
              Create flashcards based on a previously generated summary or content analysis.
            </p>
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transition-slow transform hover:scale-105 shadow-lg hover:shadow-xl">
              Use Summary
            </button>
          </div>

          {/* From New Content */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transition-slow transform hover:scale-105 border border-white/20 dark:border-gray-800/20">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all transition-slow">
              <svg className="w-8 h-8 text-pink-600 dark:text-pink-400 transition-all transition-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow">From New Content</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 transition-all transition-slow">
              Generate flashcards directly from PDFs, YouTube videos, or text content.
            </p>
            <button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transition-slow transform hover:scale-105 shadow-lg hover:shadow-xl">
              Add Content
            </button>
          </div>
        </div>

        {/* Flashcard Configuration */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-800/20 transition-all transition-slow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-all transition-slow">Flashcard Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-all transition-slow">
                Number of Cards
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 transition-all transition-slow bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                <option>10 cards</option>
                <option>20 cards</option>
                <option>30 cards</option>
                <option>50 cards</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-all transition-slow">
                Difficulty Level
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 transition-all transition-slow bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-all transition-slow">
                Card Types
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 text-pink-600 dark:text-pink-400 focus:ring-pink-500 dark:focus:ring-pink-400 bg-white/50 dark:bg-gray-800/50 transition-all transition-slow" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 transition-all transition-slow">Text-based</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 text-pink-600 dark:text-pink-400 focus:ring-pink-500 dark:focus:ring-pink-400 bg-white/50 dark:bg-gray-800/50 transition-all transition-slow" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 transition-all transition-slow">Image-based</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 text-pink-600 dark:text-pink-400 focus:ring-pink-500 dark:focus:ring-pink-400 bg-white/50 dark:bg-gray-800/50 transition-all transition-slow" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 transition-all transition-slow">Audio-based</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-all transition-slow">
                Spaced Repetition
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-pink-500 dark:focus:border-pink-400 transition-all transition-slow bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Flashcards Button */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:via-rose-700 hover:to-indigo-700 text-white py-4 px-12 rounded-2xl font-semibold text-xl transition-all transition-slow transform hover:scale-105 flex items-center justify-center space-x-3 mx-auto shadow-xl hover:shadow-2xl">
            <svg className="w-6 h-6 transition-all transition-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="transition-all transition-slow">Generate Flashcards</span>
          </button>
        </div>
      </div>
    </div>
  )
}
