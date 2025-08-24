import React from 'react'

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-black dark:via-black dark:to-gray-900 py-12 transition-all duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Quiz Generator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Create interactive quizzes from your content to test knowledge and reinforce learning
          </p>
        </div>

        {/* Quiz Creation Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* From Summary */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/20 dark:border-gray-800/20">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">From Summary</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Generate a quiz based on a previously created summary or content analysis.
            </p>
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Use Summary
            </button>
          </div>

          {/* From New Content */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/20 dark:border-gray-800/20">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">From New Content</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create a quiz directly from PDFs, YouTube videos, or text content.
            </p>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Add Content
            </button>
          </div>
        </div>

        {/* Quiz Configuration */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-800/20 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quiz Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                <option>5 questions</option>
                <option>10 questions</option>
                <option>15 questions</option>
                <option>20 questions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Types
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 text-purple-600 dark:text-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white/50 dark:bg-gray-800/50" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Multiple Choice</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 text-purple-600 dark:text-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white/50 dark:bg-gray-800/50" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">True/False</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 text-purple-600 dark:text-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white/50 dark:bg-gray-800/50" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Fill in the Blank</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                defaultValue="15"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Generate Quiz Button */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white py-4 px-12 rounded-2xl font-semibold text-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 mx-auto shadow-xl hover:shadow-2xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generate Quiz</span>
          </button>
        </div>
      </div>
    </div>
  )
}
