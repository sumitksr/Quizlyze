import React from 'react'

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-black dark:via-black dark:to-gray-900 py-12 transition-all duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Interactive Flashcards
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Create personalized flashcards from your content for effective memorization and learning
          </p>
        </div>

        {/* Flashcard Creation Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Create New Set */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/20 dark:border-gray-800/20">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Set</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Generate flashcards from PDFs, YouTube videos, or text content with AI assistance.
            </p>
            <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Create Set
            </button>
          </div>

          {/* Study Existing */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/20 dark:border-gray-800/20">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Study Existing</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Review and study flashcards from previously created sets with spaced repetition.
            </p>
            <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Study Now
            </button>
          </div>
        </div>

        {/* Flashcard Configuration */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-800/20 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Flashcard Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Cards
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                <option>10 cards</option>
                <option>20 cards</option>
                <option>30 cards</option>
                <option>50 cards</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Style
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                <option>Question & Answer</option>
                <option>Term & Definition</option>
                <option>Concept & Example</option>
                <option>Custom Format</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Study Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="study-mode" className="text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white/50 dark:bg-gray-800/50" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Spaced Repetition</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="study-mode" className="text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white/50 dark:bg-gray-800/50" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Random Order</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="study-mode" className="text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white/50 dark:bg-gray-800/50" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Sequential</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Include Images
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="images" className="text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white/50 dark:bg-gray-800/50" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Yes</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="images" className="text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white/50 dark:bg-gray-800/50" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Flashcard Preview */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-800/20 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preview</h2>
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30 rounded-2xl p-8 text-center shadow-inner border border-emerald-200/50 dark:border-emerald-700/30">
              <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Front</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">What is the capital of France?</div>
              <div className="text-xs text-emerald-500 dark:text-emerald-400">Tap to flip</div>
            </div>
            <div className="text-center mt-4">
              <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                Flip Card
              </button>
            </div>
          </div>
        </div>

        {/* Generate Flashcards Button */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white py-4 px-12 rounded-2xl font-semibold text-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 mx-auto shadow-xl hover:shadow-2xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generate Flashcards</span>
          </button>
        </div>
      </div>
    </div>
  )
}
