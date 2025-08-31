'use client'

import React from 'react'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-black/90 backdrop-blur-md shadow-lg border-b border-gray-800/50 sticky top-0 z-50 transition-all transition-slower">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg transition-all transition-slower group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/25">
                <span className="text-white font-bold text-lg transition-all transition-slower group-hover:scale-110">Q</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all transition-slower group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300">
                Quizlyze
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/summarize"
                className="text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-all transition-slower hover:scale-105 hover:bg-gray-900/50 hover:shadow-lg hover:shadow-indigo-500/20 relative overflow-hidden group"
              >
                <span className="relative z-10">Summarize</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-md transform scale-x-0 group-hover:scale-x-100 transition-transform transition-slower origin-left"></div>
              </Link>
              <Link
                href="/quiz"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all transition-slower hover:scale-105 hover:bg-gray-900/50 hover:shadow-lg hover:shadow-purple-500/20 relative overflow-hidden group"
              >
                <span className="relative z-10">Generate Quiz</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-md transform scale-x-0 group-hover:scale-x-100 transition-transform transition-slower origin-left"></div>
              </Link>
              <Link
                href="/flashcards"
                className="text-gray-300 hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium transition-all transition-slower hover:scale-105 hover:bg-gray-900/50 hover:shadow-lg hover:shadow-pink-500/20 relative overflow-hidden group"
              >
                <span className="relative z-10">Flashcards</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-md transform scale-x-0 group-hover:scale-x-100 transition-transform transition-slower origin-left"></div>
              </Link>
            </div>
          </div>

          {/* Right side - Mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-indigo-400 p-2 rounded-lg hover:bg-gray-900/50 transition-all transition-slower hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20">
                <svg className="w-6 h-6 transition-all transition-slower" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
