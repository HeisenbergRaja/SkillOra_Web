import React from 'react';
import { Layers, Star } from 'lucide-react';

interface CreatedSkillCardProps {
  title: string;
  learners: number;
  credits: number;
  rating: string;
}

export const CreatedSkillCard = ({ title, learners, credits, rating }: CreatedSkillCardProps) => {
  return (
    <div className="w-full bg-[#3F483A] rounded-xl p-3 flex items-center">
      <div className="w-12 h-12 rounded-lg bg-[#20271E] flex items-center justify-center shrink-0">
        <Layers className="text-[var(--surface)] w-6 h-6" />
      </div>
      
      <div className="flex-1 flex flex-col pl-3">
        <span className="text-white text-sm font-bold line-clamp-1">{title}</span>
        <span className="text-white/60 text-[10px] mt-0.5">
          {learners} Learners  +{credits} Credits
        </span>
      </div>

      <div className="flex flex-col items-end justify-between h-10 shrink-0">
        <div className="flex items-center space-x-0.5">
          <span className="text-[#AEC279] text-[11px] font-bold">{rating}</span>
          <Star className="text-[#AEC279] fill-[#AEC279] w-2.5 h-2.5" />
        </div>
        <div className="bg-[var(--primary)] rounded px-2 py-0.5 mt-1">
          <span className="text-[var(--background)] text-[9px] font-bold">ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
