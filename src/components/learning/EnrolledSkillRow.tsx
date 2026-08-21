import React from 'react';
import { Code, Play } from 'lucide-react';

interface EnrolledSkillRowProps {
  title: string;
  progress: number;
  onPlay: () => void;
}

export const EnrolledSkillRow = ({ title, progress, onPlay }: EnrolledSkillRowProps) => {
  return (
    <div className="w-full mb-3 bg-[#3F483A] rounded-xl p-3 flex items-center">
      <div className="w-10 h-10 bg-[#20271E] rounded-lg flex items-center justify-center shrink-0">
        <Code className="text-[var(--primary)] w-5 h-5" />
      </div>

      <div className="flex-1 px-3 flex flex-col">
        <div className="w-full flex justify-between items-center">
          <span className="text-white text-sm font-bold line-clamp-1">{title}</span>
          <span className="text-[var(--primary)] text-[10px] ml-2">{progress}%</span>
        </div>
        <div className="w-full h-1 bg-[#20271E] rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-[var(--primary)] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button 
        onClick={onPlay}
        className="w-8 h-8 rounded-full border border-[#F2F3F1]/20 flex items-center justify-center shrink-0 hover:bg-[#F2F3F1]/10 transition-colors"
      >
        <Play className="text-[#F2F3F1]/80 w-3 h-3 ml-0.5" />
      </button>
    </div>
  );
};
