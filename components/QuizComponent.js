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

  return (
    <div className="space-y-6">
      {!showResults ? (
        // Display active quiz
        <div>
          {/* Question Navigation */}
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
          </div>

          {/* Current Question */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {currentQuestion + 1}.{" "}
              {quizData.questions[currentQuestion].question}
            </h3>

            {quizData.questions[currentQuestion].explanation && (
              <p className="text-sm text-gray-700 dark:bg-gray-700 bg-gray-50 p-2 rounded mb-4">
                {quizData.questions[currentQuestion].explanation}
              </p>
            )}

            {/* Answer Options */}
            <div className="space-y-2">
              {quizData.questions[currentQuestion].options.map(
                (option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="flex items-center space-x-3 cursor-pointer p-3 rounded border hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option.charAt(0)}
                      checked={
                        selectedAnswers[currentQuestion] === option.charAt(0)
                      }
                      onChange={() =>
                        handleAnswerSelect(currentQuestion, option.charAt(0))
                      }
                      className="text-indigo-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {option}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>

            {currentQuestion === quizData.questions.length - 1 ? (
              <button
                onClick={() => setShowResults(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
              >
                Show Results
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(quizData.questions.length - 1, currentQuestion + 1)
                  )
                }
                disabled={currentQuestion === quizData.questions.length - 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        // Display quiz results
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Results
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            You scored {calculateScore()} out of {quizData.questions.length}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-4">
            <div
              className="bg-green-600 h-4 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (calculateScore() / quizData.questions.length) * 100
                }%`,
              }}
            ></div>
          </div>

          {/* Detailed Results */}
          <div className="mt-6 space-y-4">
            {quizData.questions.map((question, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4"
              >
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  {index + 1}. {question.question}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Your answer: {selectedAnswers[index] || "Not answered"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Correct answer: {question.correctAnswer}
                </p>
                {question.explanation && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded mt-2">
                    {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={resetQuiz}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
