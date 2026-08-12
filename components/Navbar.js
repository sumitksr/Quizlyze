'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/summarize', label: 'Summarize', color: 'indigo' },
  { href: '/quiz', label: 'Generate Quiz', color: 'purple' },
  { href: '/flashcards', label: 'Flashcards', color: 'pink' },
  { href: '/about', label: 'About', color: 'emerald' },
]

const colorMap = {
  indigo: {
    text: 'hover:text-indigo-400',
    shadow: 'hover:shadow-indigo-500/20',
    gradientFrom: 'from-indigo-500/10',
    gradientTo: 'to-purple-500/10',
    mobileBorder: 'border-indigo-500/30',
    mobileGlow: 'hover:shadow-indigo-500/10',
    activeText: 'text-indigo-400',
  },
  purple: {
    text: 'hover:text-purple-400',
    shadow: 'hover:shadow-purple-500/20',
    gradientFrom: 'from-purple-500/10',
    gradientTo: 'to-pink-500/10',
    mobileBorder: 'border-purple-500/30',
    mobileGlow: 'hover:shadow-purple-500/10',
    activeText: 'text-purple-400',
  },
  pink: {
    text: 'hover:text-pink-400',
    shadow: 'hover:shadow-pink-500/20',
    gradientFrom: 'from-pink-500/10',
    gradientTo: 'to-rose-500/10',
    mobileBorder: 'border-pink-500/30',
    mobileGlow: 'hover:shadow-pink-500/10',
    activeText: 'text-pink-400',
  },
  emerald: {
    text: 'hover:text-emerald-400',
    shadow: 'hover:shadow-emerald-500/20',
    gradientFrom: 'from-emerald-500/10',
    gradientTo: 'to-teal-500/10',
    mobileBorder: 'border-emerald-500/30',
    mobileGlow: 'hover:shadow-emerald-500/10',
    activeText: 'text-emerald-400',
  },
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

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

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => {
                const colors = colorMap[link.color]
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${isActive ? colors.activeText : 'text-gray-300'} ${colors.text} px-3 py-2 rounded-md text-sm font-medium transition-all transition-slower hover:scale-105 hover:bg-gray-900/50 hover:shadow-lg ${colors.shadow} relative overflow-hidden group`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} rounded-md transform scale-x-0 group-hover:scale-x-100 transition-transform transition-slower origin-left`}></div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="relative text-gray-300 hover:text-indigo-400 p-2 rounded-lg hover:bg-gray-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 w-10 h-10 flex items-center justify-center"
            >
              {/* Animated hamburger → X */}
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out origin-center ${
                    mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-200 ease-in-out ${
                    mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out origin-center ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <div
        id="mobile-menu-panel"
        className={`absolute left-0 right-0 top-16 z-50 md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-black/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl shadow-black/50">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link, index) => {
              const colors = colorMap[link.color]
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ease-in-out border border-transparent ${
                    isActive
                      ? `${colors.activeText} bg-gray-900/80 ${colors.mobileBorder}`
                      : `text-gray-300 ${colors.text} hover:bg-gray-900/50 hover:${colors.mobileBorder}`
                  } hover:shadow-lg ${colors.mobileGlow} hover:translate-x-1`}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
