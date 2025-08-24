import Image from "next/image";
import Navbar from "@/component/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black dark:via-black dark:to-gray-900 transition-all transition-slow">
      {/* Hero Section */}
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-all transition-slow">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all transition-slow">
            Quizlyze
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-all transition-slow">
          Transform your learning experience with AI-powered content summarization, 
          quiz generation, and interactive flashcards from YouTube videos, PDFs, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/summarize"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition-all transition-slow transform hover:scale-110 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 group relative overflow-hidden"
          >
            <span className="relative z-10 transition-all transition-slow">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform transition-slow"></div>
          </Link>
          <Link 
            href="/quiz"
            className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-gray-700 px-8 py-3 rounded-xl font-semibold transition-all transition-slow transform hover:scale-110 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 backdrop-blur-sm group relative overflow-hidden"
          >
            <span className="relative z-10 transition-all transition-slow">Try Quiz</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform transition-slow origin-left"></div>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Summarize Feature */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transition-slow transform hover:scale-105 hover:-translate-y-2 border border-white/20 dark:border-gray-800/20 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl transform scale-0 group-hover:scale-100 transition-transform transition-slow"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all transition-slow group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/25">
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400 transition-all transition-slow group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Summarize Content</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-all transition-slow">
                Upload PDFs, paste YouTube URLs, or input text to get concise, 
                AI-generated summaries that capture the key points.
              </p>
              <Link 
                href="/summarize"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-all transition-slow hover:scale-105 group/link"
              >
                <span className="transition-all transition-slow group-hover/link:translate-x-1">Start Summarizing</span>
                <svg className="w-4 h-4 ml-2 transition-all transition-slow group-hover/link:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quiz Feature */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transition-slow transform hover:scale-105 hover:-translate-y-2 border border-white/20 dark:border-gray-800/20 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl transform scale-0 group-hover:scale-100 transition-transform transition-slow"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all transition-slow group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/25">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 transition-all transition-slow group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow group-hover:text-purple-600 dark:group-hover:text-purple-400">Generate Quizzes</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-all transition-slow">
                Create interactive quizzes from any content to test your knowledge 
                and reinforce learning with AI-generated questions.
              </p>
              <Link 
                href="/quiz"
                className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-all transition-slow hover:scale-105 group/link"
              >
                <span className="transition-all transition-slow group-hover/link:translate-x-1">Create Quiz</span>
                <svg className="w-4 h-4 ml-2 transition-all transition-slow group-hover/link:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Flashcards Feature */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transition-slow transform hover:scale-105 hover:-translate-y-2 border border-white/20 dark:border-gray-800/20 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-2xl transform scale-0 group-hover:scale-100 transition-transform transition-slow"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all transition-slow group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-pink-500/25">
                <svg className="w-8 h-8 text-pink-600 dark:text-pink-400 transition-all transition-slow group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-all transition-slow group-hover:text-pink-600 dark:group-hover:text-pink-400">Interactive Flashcards</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-all transition-slow">
                Build personalized flashcards from your content for effective 
                memorization and spaced repetition learning.
              </p>
              <Link 
                href="/flashcards"
                className="inline-flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-semibold transition-all transition-slow hover:scale-105 group/link"
              >
                <span className="transition-all transition-slow group-hover/link:translate-x-1">Make Flashcards</span>
                <svg className="w-4 h-4 ml-2 transition-all transition-slow group-hover/link:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
