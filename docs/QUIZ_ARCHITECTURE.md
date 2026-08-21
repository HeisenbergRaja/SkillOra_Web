# Quiz Architecture

## Overview
This document describes the implementation of the Skillora Quiz System, explaining how the Web app interfaces securely and reliably with the canonical quiz data established by the Android application.

## 1. Firestore Quiz Collection
Quizzes are stored natively inside the `Skill` document. There is no separate `quizzes` collection. Each `Skill` document in the `skills` collection may contain a `finalQuiz` property if a quiz has been generated for that skill.

## 2. Quiz Document Structure
The `finalQuiz` object follows this schema:
```json
{
  "quizId": "uuid-string",
  "quizTitle": "Skill Final Assessment",
  "totalQuestions": 10,
  "passingScore": 70,
  "quizVersion": 1,
  "createdBy": "user-uid",
  "createdAt": 1690000000000,
  "updatedAt": 1690000000000,
  "questions": [ ... ],
  "status": "PUBLISHED"
}
```

## 3. Skill/Day/Quiz Relationship
- **Android Architecture:** Android creates a single Final Quiz per Skill. Individual days do not have standalone, separately evaluated quizzes. Instead, the final quiz aggregates questions.
- **Web Architecture:** Web mimics this behavior precisely. The "Final Assessment" button unlocks only when the user completes all days in the learning roadmap (`completedDays == totalTopics`). The button routes to the single Quiz interface passing the `skillId`.

## 4. Question Schema
Each question in the `questions` array follows this schema:
```json
{
  "questionId": "uuid-string",
  "question": "What is a variable?",
  "options": ["A data container", "A function", "A loop", "None of the above"],
  "correctAnswer": 0,
  "explanation": "Variables are used to store data.",
  "difficulty": "medium",
  "topic": "Variables",
  "dayNumber": 1
}
```

## 5. Answer Schema
The `correctAnswer` is an integer representing the zero-based index of the correct string inside the `options` array (e.g., `0` for A, `1` for B, etc.). 

## 6. Score Calculation
Both Android and Web calculate the score locally upon submission, matching answers against the `correctAnswer` indices. 
`scorePercentage = Math.floor((correctAnswers / totalQuestions) * 100)`
The quiz is passed if `scorePercentage >= passingScore`.

## 7. Quiz Submission
When the user clicks "Submit Quiz":
- Web validates that all questions have been answered.
- The `QuizAttempt` object is created.
- A Firebase Transaction writes the attempt to Firestore and updates the enrollment record.

## 8. Completion/Progress Storage
Quiz attempts are stored in a subcollection under the specific `enrollment` record.
Path: `enrollments/${userId}_${skillId}/quizAttempts/${attemptId}`

The `enrollment` document itself is updated in the same transaction:
- `quizPassed: true`
- `finalQuizScore: scorePercentage`
- `finalQuizAttemptId: attemptId`
- `completed: true`
- `completedAt: Date.now()`
- `progress: 100`

This ensures that both the Web app and Android app see the exact same enrollment progress.

## 9. Android/Web Compatibility
The Web app is fully compatible with Android because:
1. It queries the same `Skill` document.
2. It parses the same `finalQuiz` property.
3. It creates an identical `QuizAttempt` object.
4. It uses a Firestore Transaction that updates the same `enrollment` document fields that Android relies on.

## 10. Security Rules
Users can only modify their own `enrollments` document and the corresponding `quizAttempts` subcollections. They have read-only access to the `skills` document containing the quiz data. 

## 11. Error Handling
The UI elegantly catches all errors. Missing quizzes default to a "No quiz found" error message, preventing crashes. Malformed questions are handled cleanly through optional chaining. If a network request fails during submission, the Submit button reenables so the user can try again, preserving their local answers.
