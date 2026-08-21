import React from 'react';
import { PlayCircle, CheckCircle, GraduationCap } from 'lucide-react';

interface LearnedSkillCardProps {
  title: string;
  status: string;
  completed: boolean;
}

export const LearnedSkillCard = ({ title, status, completed }: LearnedSkillCardProps) => {
  return (
    <div className="w-[140px] bg-[#3F483A] rounded-xl p-3 flex flex-col shrink-0">
      <div className="w-9 h-9 rounded-lg bg-[#20271E] flex items-center justify-center">
        <GraduationCap className="text-[var(--surface)] w-[18px] h-[18px]" />
      </div>
      
      <span className="text-white text-sm font-bold line-clamp-1 mt-3 mb-1">
        {title}
      </span>
      
      <div className="flex items-center space-x-1">
        {completed ? (
          <CheckCircle className="text-[#AEC279] w-3 h-3 shrink-0" />
        ) : (
          <PlayCircle className="text-white/60 w-3 h-3 shrink-0" />
        )}
        <span className={`text-[10px] ${completed ? 'text-white/80' : 'text-white/80'}`}>
          {status}
        </span>
      </div>
    </div>
  );
};
