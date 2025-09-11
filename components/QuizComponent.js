"use client";
import React, { useState } from "react";

export default function QuizComponent({ quizData }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!quizData || !quizData.questions) {
    return null;
  }

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const calculateScore = () => {
    if (!quizData?.questions) return 0;

    let correct = 0;
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const getOptionClass = (questionIndex, option) => {
    if (!showResults) {
      return selectedAnswers[questionIndex] === option.charAt(0)
        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-100 dark:bg-gray-700 ring-2 ring-indigo-500 dark:ring-indigo-400"
        : "border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700/50";
    }

    const correctAnswer = quizData.questions[questionIndex].correctAnswer;
    const selectedAnswer = selectedAnswers[questionIndex];
    const optionLetter = option.charAt(0);

    if (optionLetter === correctAnswer) {
      return "border-green-600 dark:border-green-500 bg-green-100 dark:bg-gray-700 ring-2 ring-green-500 dark:ring-green-400";
    }
    if (optionLetter === selectedAnswer) {
      return "border-red-600 dark:border-red-500 bg-red-100 dark:bg-gray-700 ring-2 ring-red-500 dark:ring-red-400";
    }
    return "border-gray-200 dark:border-gray-700 opacity-60";
  };

  return (
    <div className="space-y-8">
      {!showResults ? (
        // Display active quiz
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300">
          <div className="mb-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Time!</h2>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              Question {currentQuestion + 1} / {quizData.questions.length}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 leading-tight">
              {quizData.questions[currentQuestion].question}
            </h3>
            <div className="space-y-3">
              {quizData.questions[currentQuestion].options.map(
                (option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-center space-x-4 cursor-pointer p-4 rounded-lg border transition-all duration-200 ${getOptionClass(currentQuestion, option)}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option.charAt(0)}
                      checked={selectedAnswers[currentQuestion] === option.charAt(0)}
                      onChange={() => handleAnswerSelect(currentQuestion, option.charAt(0))}
                      className="sr-only"
                    />
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${selectedAnswers[currentQuestion] === option.charAt(0) ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                      {selectedAnswers[currentQuestion] === option.charAt(0) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 flex-1">
                      {option.substring(2).trim()}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>

            {currentQuestion === quizData.questions.length - 1 ? (
              <button
                onClick={() => setShowResults(true)}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Show Results
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(Math.min(quizData.questions.length - 1, currentQuestion + 1))}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        // Display quiz results
        <div className="text-center bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            You scored <span className="font-bold text-indigo-600 dark:text-indigo-400">{calculateScore()}</span> out of <span className="font-bold text-indigo-600 dark:text-indigo-400">{quizData.questions.length}</span>
          </p>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-8">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(calculateScore() / quizData.questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="mt-8 space-y-4 text-left">
            {quizData.questions.map((question, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {index + 1}. {question.question}
                </h4>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className={`flex items-start space-x-3 p-2 rounded-md ${getOptionClass(index, option)}`}>
                      <span>
                        {option.charAt(0) === question.correctAnswer ? '✅' : (option.charAt(0) === selectedAnswers[index] ? '❌' : ' ')}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-md mt-3 border border-gray-200 dark:border-gray-700">
                    <span className="font-semibold">Explanation:</span> {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={resetQuiz}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
