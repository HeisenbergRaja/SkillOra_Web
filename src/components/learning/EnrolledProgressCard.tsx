import React from 'react';

interface EnrolledProgressCardProps {
  percent: number;
  completed: number;
  total: number;
}

export const EnrolledProgressCard = ({ percent, completed, total }: EnrolledProgressCardProps) => {
  return (
    <div className="w-full bg-[#3F483A] rounded-2xl p-4 flex flex-col">
      <span className="text-white/60 text-[11px] font-bold tracking-wider">YOUR PROGRESS</span>
      <div className="w-full flex justify-between items-end mt-2">
        <span className="text-white text-[32px] font-bold leading-none">{percent}%</span>
        <div className="flex flex-col items-end">
          <span className="text-white text-sm font-bold">{completed} of {total} topics completed</span>
          <span className="text-white/60 text-xs">{total - completed} remaining</span>
        </div>
      </div>
      <div className="w-full h-2 bg-[#20271E] rounded-full mt-4 overflow-hidden">
        <div 
          className="h-full bg-[var(--primary)] rounded-full transition-all duration-500" 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
