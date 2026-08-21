import React from 'react';
import { CheckCircle, Star } from 'lucide-react';

interface CompletedSkillRowProps {
  title: string;
  rating?: number;
}

export const CompletedSkillRow = ({ title, rating = 5 }: CompletedSkillRowProps) => {
  return (
    <div className="w-full mb-3 bg-[#3F483A] rounded-xl p-3 flex items-center">
      <div className="relative pr-3 shrink-0">
        <div className="w-10 h-10 bg-[#20271E] rounded-lg flex items-center justify-center">
          <CheckCircle className="text-white w-5 h-5" />
        </div>
        <div className="absolute bottom-0 right-3 translate-x-1 translate-y-1 w-4 h-4 bg-[var(--primary)] rounded-full flex items-center justify-center border-2 border-[#3F483A]">
          <CheckCircle className="text-[var(--surface)] w-2.5 h-2.5" strokeWidth={4} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <span className="text-white text-sm font-bold line-clamp-1">{title}</span>
        <div className="flex space-x-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              className={`w-3 h-3 ${i < rating ? 'text-[var(--primary)] fill-[var(--primary)]' : 'text-[#F2F3F1]/20'}`}
            />
          ))}
        </div>
      </div>

      <span className="text-[var(--primary)] text-[10px] ml-2 shrink-0">Completed</span>
    </div>
  );
};
