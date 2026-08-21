import { db, auth } from '@/lib/firebase/config';
import { doc, getDoc, runTransaction, collection, setDoc } from 'firebase/firestore';
import { FinalQuiz, QuizAttempt } from '@/types/quiz';


export const quizService = {
  /**
   * Fetch the quiz for a given skill.
   * Matches Android's implementation of fetching `finalQuiz` from the skill document.
   */
  async getQuizForSkill(skillId: string): Promise<FinalQuiz | null> {
    const skillRef = doc(db, 'skills', skillId);
    const skillSnap = await getDoc(skillRef);

    if (!skillSnap.exists()) {
      throw new Error('Skill not found');
    }

    const skillData = skillSnap.data();
    if (skillData.finalQuiz) {
      return skillData.finalQuiz as FinalQuiz;
    }

    return null;
  },

  /**
   * Submit a quiz attempt.
   * Matches Android's implementation:
   * - Validates roadmap completion via enrollment doc.
   * - Saves the attempt in enrollments/{enrollmentId}/quizAttempts/{attemptId}.
   * - Updates enrollment progress and status if passed.
   */
  async submitQuizAttempt(
    skillId: string, 
    attempt: Omit<QuizAttempt, 'attemptId' | 'userId' | 'attemptedAt'>
  ): Promise<QuizAttempt> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const enrollmentDocId = `${user.uid}_${skillId}`;
    const enrollmentRef = doc(db, 'enrollments', enrollmentDocId);
    const skillRef = doc(db, 'skills', skillId);
    // Note: Android also gets userDoc for transactions but doesn't modify it in this specific block in SkillRepository, 
    // it likely uses a trigger or another process to add credits, or does it later. Let's include userRef to match.
    const userRef = doc(db, 'users', user.uid);

    const attemptRef = doc(collection(enrollmentRef, 'quizAttempts'));
    const attemptId = attemptRef.id;
    const finalAttempt: QuizAttempt = {
      ...attempt,
      attemptId,
      userId: user.uid,
      skillId,
      attemptedAt: Date.now()
    };

    await runTransaction(db, async (transaction) => {
      const enrollmentSnap = await transaction.get(enrollmentRef);
      const skillSnap = await transaction.get(skillRef);
      
      // We read userSnap to lock it if needed, matching Android
      await transaction.get(userRef);

      if (!enrollmentSnap.exists()) {
        throw new Error('Enrollment not found');
      }
      if (!skillSnap.exists()) {
        throw new Error('Skill not found');
      }

      const enrollmentData = enrollmentSnap.data();
      const skillData = skillSnap.data();

      if (!enrollmentData.roadmapCompleted) {
        throw new Error('Complete the roadmap before taking the quiz.');
      }

      // Save attempt in subcollection
      const txAttemptRef = doc(collection(enrollmentRef, 'quizAttempts'), attemptId);
      transaction.set(txAttemptRef, finalAttempt);

      // Update enrollment if passed
      if (finalAttempt.passed) {
        const updateData: any = {
          quizPassed: true,
          finalQuizScore: finalAttempt.scorePercentage,
          finalQuizAttemptId: attemptId,
          completed: true,
          progress: 100
        };

        if (!enrollmentData.completedAt) {
          updateData.completedAt = Date.now();
        }

        transaction.update(enrollmentRef, updateData);
        
        // Note: Credits might be handled here or via a Cloud Function in Android depending on the exact credits flow.
        // Android seems to do this in `usersCollection` updates but Android's `SkillRepository.kt` only updates the enrollment.
        // The `com.simats.skillora.data.CreditsManager` might listen to enrollment completion.
      }
    });

    return finalAttempt;
  },

  /**
   * Generates a final quiz for a skill using the local Ollama instance via Next.js API.
   * Matches Android's generation flow.
   */
  async generateQuiz(skillId: string): Promise<{ success: boolean; quizId?: string; error?: string }> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        skillId,
        userId: user.uid
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate quiz');
    }

    return data;
  }
};
