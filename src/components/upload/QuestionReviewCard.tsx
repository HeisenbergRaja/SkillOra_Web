import React from 'react';
import { Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { QuizQuestion } from '@/types/quiz';

interface Props {
  index: number;
  question: QuizQuestion;
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionReviewCard({ index, question, onEdit, onDelete }: Props) {
  return (
    <div className="w-full bg-[var(--gray-green)]/15 border border-white/5 rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[var(--primary)] font-bold text-sm">Question {index + 1}</h3>
        <div className="flex space-x-2">
          <button onClick={onEdit} className="p-1 hover:bg-white/5 rounded-full text-[var(--avatar-bg)] transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-white/5 rounded-full text-red-400/70 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-white text-sm mb-3">{question.question}</p>
      
      <div className="flex flex-col space-y-1">
        {question.options.map((opt, i) => {
          const isCorrect = question.correctAnswer === i;
          return (
            <div 
              key={i} 
              className={`flex items-center w-full rounded p-1.5 ${isCorrect ? 'bg-[var(--avatar-bg)]/10' : 'bg-transparent'}`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-[var(--avatar-bg)] shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-white/30 shrink-0" />
              )}
              <span className={`ml-2 text-[13px] ${isCorrect ? 'text-[var(--avatar-bg)]' : 'text-white/70'}`}>
                {String.fromCharCode(65 + i)}. {opt}
              </span>
            </div>
          );
        })}
      </div>
      
      {question.explanation && (
        <div className="mt-3">
          <span className="text-[var(--primary)] text-[11px] font-bold block mb-0.5">Explanation:</span>
          <p className="text-white/60 text-[12px]">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
