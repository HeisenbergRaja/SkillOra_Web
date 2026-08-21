'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizService } from '@/services/quizService';
import { FinalQuiz, QuizAttempt } from '@/types/quiz';
import { ArrowLeft, Trophy, XCircle } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const { skillId } = useParams();
  
  const [quiz, setQuiz] = useState<FinalQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (!skillId) return;

    const fetchQuiz = async () => {
      try {
        const fetchedQuiz = await quizService.getQuizForSkill(skillId as string);
        if (fetchedQuiz) {
          setQuiz(fetchedQuiz);
        } else {
          setErrorMessage('No quiz found for this skill.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load quiz.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [skillId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#20271E]">
        <div className="w-8 h-8 border-4 border-[#AEC279]/30 border-t-[#AEC279] rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#20271E]">
        <p className="text-white text-center mb-6">{errorMessage}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-[#AEC279] text-[#20271E] font-bold rounded-2xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (quizResult) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#20271E]">
        {quizResult.passed ? (
          <>
            <Trophy className="w-24 h-24 text-[#AEC279] mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Congratulations!</h1>
            <p className="text-white/70 text-base mb-12">Skill Completed Successfully</p>
          </>
        ) : (
          <>
            <XCircle className="w-24 h-24 text-red-500 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Failed</h1>
            <p className="text-white/70 text-base mb-12">Keep learning and try again!</p>
          </>
        )}

        <div className="w-full bg-[#3F483A] rounded-2xl p-6 flex flex-col items-center mb-12">
          <span className="text-white/60 text-sm mb-2">Your Score</span>
          <span className={`text-5xl font-bold mb-2 ${quizResult.passed ? 'text-[#AEC279]' : 'text-red-500'}`}>
            {quizResult.scorePercentage}%
          </span>
          <span className="text-white text-base">
            {quizResult.correctAnswers} / {quizResult.totalQuestions} Correct
          </span>
        </div>

        {quizResult.passed ? (
          <button
            onClick={() => router.push(`/learning/${skillId}`)}
            className="w-full h-14 bg-[#AEC279] text-[#20271E] font-bold rounded-full"
          >
            Continue
          </button>
        ) : (
          <div className="w-full flex space-x-4">
            <button
              onClick={() => router.push(`/learning/${skillId}`)}
              className="flex-1 h-14 border border-white/30 text-white font-bold rounded-full"
            >
              Exit
            </button>
            <button
              onClick={() => {
                setQuizResult(null);
                setCurrentIndex(0);
                setUserAnswers({});
              }}
              className="flex-1 h-14 bg-[#AEC279] text-[#20271E] font-bold rounded-full"
            >
              Retry Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  const handleOptionClick = (index: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionId]: index,
    }));
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let correctCount = 0;
      quiz.questions.forEach((q) => {
        if (userAnswers[q.questionId] === q.correctAnswer) {
          correctCount++;
        }
      });
      const scorePercentage = Math.floor((correctCount * 100) / quiz.questions.length);
      const passed = scorePercentage >= quiz.passingScore;

      const attempt: Omit<QuizAttempt, 'attemptId' | 'userId' | 'attemptedAt'> = {
        quizVersion: quiz.quizVersion,
        skillId: skillId as string,
        score: correctCount,
        scorePercentage,
        correctAnswers: correctCount,
        totalQuestions: quiz.questions.length,
        passed,
        answers: userAnswers,
      };

      const result = await quizService.submitQuizAttempt(skillId as string, attempt);
      setQuizResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#20271E] overflow-y-auto px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="text-white w-6 h-6" />
          </button>
          <h1 className="text-white text-xl font-bold">Final Quiz</h1>
        </div>
        <div className="bg-[#AEC279]/50 rounded-full px-3 py-1">
          <span className="text-[var(--primary)] text-xs font-bold">
            {currentIndex + 1}/{quiz.questions.length}
          </span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-[#3F483A] rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white text-sm font-bold">Question Progress</span>
          <span className="text-[#AEC279] text-sm font-bold">
            {currentIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        <div className="w-full h-2 bg-[#20271E] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#AEC279] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#3F483A] rounded-2xl p-6 flex flex-col items-center mb-6">
        <span className="text-[#AEC279] text-xs font-bold tracking-widest mb-4">
          QUESTION {currentIndex + 1}
        </span>
        <h2 className="text-white text-lg font-bold text-center leading-relaxed">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Options */}
      <div className="flex flex-col space-y-3 mb-8">
        {currentQuestion.options.map((option, index) => {
          const isSelected = userAnswers[currentQuestion.questionId] === index;
          return (
            <div
              key={index}
              onClick={() => handleOptionClick(index)}
              className={`w-full rounded-xl p-4 flex items-center space-x-4 cursor-pointer transition-colors border ${
                isSelected ? 'bg-[#AEC279]/20 border-[#AEC279]' : 'bg-[#3F483A] border-transparent hover:bg-[#4a5544]'
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${
                  isSelected ? 'bg-[#AEC279] text-[#20271E]' : 'bg-white/10 text-white'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-white text-base">{option}</span>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-10">
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="flex-1 h-14 rounded-full border border-[#AEC279] text-[#AEC279] font-bold"
          >
            Previous
          </button>
        )}

        {currentIndex < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={userAnswers[currentQuestion.questionId] === undefined}
            className="flex-1 h-14 rounded-full bg-[#AEC279] text-[#20271E] font-bold disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={
              Object.keys(userAnswers).length !== quiz.questions.length || isSubmitting
            }
            className="flex-1 h-14 rounded-full bg-[var(--primary)] text-white font-bold flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Submit Quiz'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
