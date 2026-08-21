import React from 'react';
import { BookOpen } from 'lucide-react';

interface ContinueLearningCardLargeProps {
  category: string;
  title: string;
  progress: number; // 0.0 to 1.0
  onContinue: () => void;
}

export const ContinueLearningCardLarge = ({
  category,
  title,
  progress,
  onContinue
}: ContinueLearningCardLargeProps) => {
  return (
    <div className="w-[260px] mr-4 shrink-0 bg-[#3F483A] rounded-[16px] p-4 flex flex-col">
      <div className="flex w-full justify-between items-start">
        <div className="w-12 h-12 bg-[#20271E] rounded-xl flex items-center justify-center">
          <BookOpen className="text-[var(--primary)] w-6 h-6" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-white/80 text-[10px]">{category}</span>
          <span className="text-white text-sm font-bold mt-1">{title}</span>
        </div>
      </div>
      
      <div className="mt-6 mb-2 flex w-full justify-between items-center">
        <span className="text-white/60 text-[10px]">Progress</span>
        <span className="text-[#AEC279] text-[10px] font-bold">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <div className="w-full h-1 bg-[#20271E] rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-[#AEC279] rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <button
        onClick={onContinue}
        className="w-full py-2 bg-[var(--primary)] text-[var(--surface)] text-xs font-bold rounded-full hover:bg-[var(--primary)]/90 transition-colors"
      >
        Continue
      </button>
    </div>
  );
};
