export interface QuizQuestion {
    questionId: string;
    question: string;
    options: string[];
    correctAnswer: number; // 0=A, 1=B, 2=C, 3=D
    explanation: string;
    difficulty: string;
    topic: string;
    dayNumber: number;
}

export interface FinalQuiz {
    quizId: string;
    quizTitle: string;
    totalQuestions: number;
    passingScore: number;
    quizVersion: number;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
    questions: QuizQuestion[];
    status: string; // NOT_GENERATED, GENERATED, VALIDATED, APPROVED, PUBLISHED
}

export interface QuizAttempt {
    attemptId: string;
    userId: string;
    skillId: string;
    quizVersion: number;
    score: number;
    scorePercentage: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
    attemptedAt: number;
    answers: Record<string, number>; // questionId to selectedOptionIndex
}
