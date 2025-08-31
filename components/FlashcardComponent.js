"use client";
import React, { useState } from "react";

export default function FlashcardComponent({ flashcardsData }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());

  if (!flashcardsData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 dark:text-gray-400">
          No flashcards data provided.
        </p>
      </div>
    );
  }

  // Handle multiple data structures
  let flashcards = null;
  
  if (Array.isArray(flashcardsData)) {
    flashcards = flashcardsData;
  } else if (flashcardsData.flashcards && Array.isArray(flashcardsData.flashcards)) {
    flashcards = flashcardsData.flashcards;
  } else if (flashcardsData.raw) {
    // Try to parse the raw JSON string
    try {
      const cleanedRaw = flashcardsData.raw.replace(/```json\n?|\n?```/g, '').trim();
      const parsedData = JSON.parse(cleanedRaw);
      flashcards = parsedData.flashcards || parsedData;
    } catch (parseError) {
      console.error('Error parsing raw JSON in component:', parseError);
    }
  }

  if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 dark:text-gray-400">
          No valid flashcards found.
        </p>
      </div>
    );
  }

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setStudiedCards(prev => new Set([...prev, currentCard]));
  };

  const resetCards = () => {
    setCurrentCard(0);
    setShowAnswer(false);
    setStudiedCards(new Set());
  };

  const currentFlashcard = flashcards[currentCard];

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Card {currentCard + 1} of {flashcards.length}
        </span>
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          Studied: {studiedCards.size}/{flashcards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
        ></div>
      </div>

      {/* Flashcard */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50">
        {/* Question */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wider">
            Question
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
            {currentFlashcard.front}
          </h3>
        </div>

        {/* Answer Section */}
        {showAnswer ? (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-4 uppercase tracking-wider">
                Answer
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
                {currentFlashcard.back}
              </h3>
              {currentFlashcard.explanation && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/50 rounded-xl p-4 mt-6">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>💡 Explanation:</strong> {currentFlashcard.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={handleShowAnswer}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-medium text-lg"
            >
              Show Answer
            </button>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentCard === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="flex space-x-3">
          {currentCard === flashcards.length - 1 && (
            <button
              onClick={resetCards}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
            >
              Study Again
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={currentCard === flashcards.length - 1}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          <span>Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Study Progress */}
      <div className="bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-900/20 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Study Progress
        </h4>
        <div className="grid grid-cols-10 gap-2 mb-3">
          {flashcards.map((_, index) => (
            <div
              key={index}
              className={`h-4 rounded-full transition-all duration-300 cursor-pointer ${
                studiedCards.has(index)
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg scale-110"
                  : index === currentCard
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg scale-110"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              title={`Card ${index + 1}${studiedCards.has(index) ? " (Studied)" : ""}`}
              onClick={() => {
                setCurrentCard(index);
                setShowAnswer(false);
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            <span>Studied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <span>Not studied</span>
          </div>
        </div>
      </div>
    </div>
  );
}