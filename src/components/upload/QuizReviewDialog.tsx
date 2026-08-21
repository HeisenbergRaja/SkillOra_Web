import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { FinalQuiz, QuizQuestion } from '@/types/quiz';
import { QuestionReviewCard } from './QuestionReviewCard';
import { QuestionEditDialog } from './QuestionEditDialog';

interface Props {
  quiz: FinalQuiz;
  skillTitle: string;
  onDismiss: () => void;
  onSave: (quiz: FinalQuiz) => void;
  onRegenerate: () => void;
}

export function QuizReviewDialog({ quiz, skillTitle, onDismiss, onSave, onRegenerate }: Props) {
  const [editedQuiz, setEditedQuiz] = useState<FinalQuiz>(quiz);
  const [questionToEdit, setQuestionToEdit] = useState<{ index: number, q: QuizQuestion } | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--background)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <h2 className="text-[var(--primary)] text-lg font-bold">Review Quiz</h2>
          <button onClick={() => setShowConfirmClose(true)} className="p-2 text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="w-full bg-[var(--gray-green)]/10 border border-white/5 rounded-2xl p-4 mb-4">
            <span className="text-[var(--primary)] text-[11px] font-bold block mb-1">Skill: {skillTitle}</span>
            <h3 className="text-white font-bold text-base mb-1">{editedQuiz.quizTitle}</h3>
            <p className="text-white/60 text-xs">{editedQuiz.questions.length} Questions • Passing: {editedQuiz.passingScore}%</p>
          </div>

          <div className="flex flex-col space-y-0">
            {editedQuiz.questions.map((q, index) => (
              <QuestionReviewCard 
                key={q.questionId || index} 
                index={index} 
                question={q} 
                onEdit={() => setQuestionToEdit({ index, q })} 
                onDelete={() => setQuestionToDelete(index)} 
              />
            ))}
            
            <button 
              onClick={() => setShowAddQuestion(true)}
              className="w-full h-12 bg-[var(--gray-green)] rounded-xl flex items-center justify-center space-x-2 text-white font-medium hover:bg-[#5a6c62] transition-colors mt-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 shrink-0 flex items-center space-x-3 bg-[var(--background)]">
          <button 
            onClick={() => { onRegenerate(); onDismiss(); }} 
            className="flex-1 h-12 text-red-400 font-medium hover:bg-white/5 rounded-xl transition-colors"
          >
            Regenerate
          </button>
          <button 
            onClick={() => { onSave(editedQuiz); onDismiss(); }} 
            className="flex-1 h-12 bg-[var(--avatar-bg)] text-[#20271E] font-bold rounded-xl hover:bg-[#9AB063] transition-colors"
          >
            Approve & Save
          </button>
        </div>
      </div>

      {showConfirmClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[var(--background)] w-full max-w-sm rounded-2xl p-5">
            <h2 className="text-white text-lg font-bold mb-2">Leave without saving?</h2>
            <p className="text-white/60 text-sm mb-6">Your generated quiz and edits will be lost.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowConfirmClose(false)} className="px-4 py-2 text-white/70 hover:text-white font-medium">
                Stay
              </button>
              <button onClick={() => { setShowConfirmClose(false); onDismiss(); }} className="px-4 py-2 text-red-400 hover:text-red-300 font-medium">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {questionToEdit && (
        <QuestionEditDialog 
          question={questionToEdit.q} 
          onDismiss={() => setQuestionToEdit(null)} 
          onSave={(updated) => {
            const nl = [...editedQuiz.questions];
            nl[questionToEdit.index] = updated;
            setEditedQuiz({ ...editedQuiz, questions: nl });
            setQuestionToEdit(null);
          }} 
        />
      )}

      {showAddQuestion && (
        <QuestionEditDialog 
          question={{ questionId: Math.random().toString(), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', difficulty: 'medium', topic: '', dayNumber: 1 }} 
          onDismiss={() => setShowAddQuestion(false)} 
          onSave={(newQ) => {
            const nl = [...editedQuiz.questions, newQ];
            setEditedQuiz({ ...editedQuiz, questions: nl, totalQuestions: nl.length });
            setShowAddQuestion(false);
          }} 
        />
      )}

      {questionToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[var(--background)] w-full max-w-sm rounded-2xl p-5">
            <h2 className="text-white text-lg font-bold mb-6">Delete question?</h2>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setQuestionToDelete(null)} className="px-4 py-2 text-white/70 hover:text-white font-medium">
                Cancel
              </button>
              <button onClick={() => {
                const nl = [...editedQuiz.questions];
                nl.splice(questionToDelete, 1);
                setEditedQuiz({ ...editedQuiz, questions: nl, totalQuestions: nl.length });
                setQuestionToDelete(null);
              }} className="px-4 py-2 text-red-400 hover:text-red-300 font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
