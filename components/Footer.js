import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-purple-500/30 transition-all transition-slow">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transition-all transition-slow group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/25">
                <span className="text-white font-bold text-xl transition-all transition-slow group-hover:scale-110">Q</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all transition-slow group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300">
                Quizlyze
              </span>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg transition-all transition-slow">
              Transform your learning experience with AI-powered content summarization, 
              quiz generation, and interactive flashcards.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="https://github.com/sumitksr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 hover:bg-purple-600 rounded-xl flex items-center justify-center transition-all transition-slow hover:scale-110 hover:shadow-xl hover:shadow-purple-500/25 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl transform scale-0 group-hover:scale-100 transition-transform transition-slow"></div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-all transition-slow relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/in/sumitksr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 hover:bg-purple-600 rounded-xl flex items-center justify-center transition-all transition-slow hover:scale-110 hover:shadow-xl hover:shadow-purple-500/25 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl transform scale-0 group-hover:scale-100 transition-transform transition-slow"></div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-all transition-slow relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-purple-500/30 transition-all transition-slow">Features</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/summarize" className="text-gray-400 hover:text-indigo-400 transition-all transition-slow hover:translate-x-3 inline-flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:bg-indigo-400 transition-all transition-slow group-hover:scale-150"></span>
                  <span className="transition-all transition-slow group-hover:translate-x-1">Content Summarizer</span>
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-gray-400 hover:text-purple-400 transition-all transition-slow hover:translate-x-3 inline-flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:bg-purple-400 transition-all transition-slow group-hover:scale-150"></span>
                  <span className="transition-all transition-slow group-hover:translate-x-1">Quiz Generator</span>
                </Link>
              </li>
              <li>
                <Link href="/flashcards" className="text-gray-400 hover:text-pink-400 transition-all transition-slow hover:translate-x-3 inline-flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:bg-pink-400 transition-all transition-slow group-hover:scale-150"></span>
                  <span className="transition-all transition-slow group-hover:translate-x-1">Interactive Flashcards</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-purple-500/30 transition-all transition-slow">Support</h3>
            <ul className="space-y-4">
              <li>
                <a href="https://github.com/sumitksr" className="text-gray-400 hover:text-indigo-400 transition-all transition-slow hover:translate-x-3 inline-flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:bg-indigo-400 transition-all transition-slow group-hover:scale-150"></span>
                  <span className="transition-all transition-slow group-hover:translate-x-1">Github</span>
                </a>
              </li>
              <li>
                <a href="http://sumitksr.vercel.app/" className="text-gray-400 hover:text-purple-400 transition-all transition-slow hover:translate-x-3 inline-flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:bg-purple-400 transition-all transition-slow group-hover:scale-150"></span>
                  <span className="transition-all transition-slow group-hover:translate-x-1">Contact Us</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-all transition-slow hover:translate-x-3 inline-flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:bg-pink-400 transition-all transition-slow group-hover:scale-150"></span>
                  <span className="transition-all transition-slow group-hover:translate-x-1">Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-all transition-slow hover:translate-x-3 inline-flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:bg-emerald-400 transition-all transition-slow group-hover:scale-150"></span>
                  <span className="transition-all transition-slow group-hover:translate-x-1">Terms of Service</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-purple-500/20 transition-all transition-slow">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            <p className="text-gray-500 flex items-center space-x-2 transition-all transition-slow group hover:text-pink-400">
              <span>Made with</span>
              <span className="text-pink-500 text-xl transition-all transition-slow group-hover:scale-125 group-hover:animate-pulse">❤️</span>
              <span>for better learning</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
