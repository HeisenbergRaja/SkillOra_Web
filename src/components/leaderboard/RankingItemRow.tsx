import React from 'react';
import Image from 'next/image';

interface RankingItemRowProps {
  rank: number;
  name: string;
  dept: string;
  credits: number;
  skills: number;
  imageUrl: string;
  isCurrent?: boolean;
}

export const RankingItemRow = ({ rank, name, dept, credits, skills, imageUrl, isCurrent = false }: RankingItemRowProps) => {
  return (
    <div 
      className={`w-full mb-3 bg-[#3F483A] rounded-xl p-3 flex items-center
      ${isCurrent ? 'border border-[var(--primary)]' : 'border border-transparent'}`}
    >
      <span 
        className={`w-6 text-center text-sm font-bold
        ${isCurrent ? 'text-[var(--primary)]' : 'text-white/60'}`}
      >
        {rank}
      </span>
      
      <div className="w-2" />
      
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>

      <div className="w-3" />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-bold line-clamp-1 ${isCurrent ? 'text-[var(--primary)]' : 'text-white'}`}>
            {name}
          </span>
          {isCurrent && (
            <div className="bg-[var(--primary)]/20 rounded px-1.5 py-0.5">
              <span className="text-[var(--primary)] text-[8px] font-bold">CURRENT</span>
            </div>
          )}
        </div>
        <span className="text-white/60 text-[11px] line-clamp-1">{dept}</span>
      </div>

      <div className="flex flex-col items-end shrink-0 pl-2">
        <span className={`text-sm font-bold ${isCurrent ? 'text-[var(--primary)]' : 'text-white'}`}>
          {credits} Cr
        </span>
        <span className="text-white/60 text-[11px]">{skills} Skills</span>
      </div>
    </div>
  );
};
