import React from 'react';
import { Check, Play, Lock } from 'lucide-react';

interface RoadmapNodeSmallProps {
  dayNumber: number;
  title: string;
  status: 'done' | 'active' | 'locked';
  isLast?: boolean;
}

export const RoadmapNodeSmall = ({ dayNumber, title, status, isLast = false }: RoadmapNodeSmallProps) => {
  return (
    <div className="flex w-full min-h-[100px]">
      {/* Timeline Column */}
      <div className="w-12 h-full flex flex-col items-center">
        <div 
          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 z-10
            ${status === 'done' ? 'bg-[var(--primary)]/20 border-[var(--primary)]' : 
              status === 'active' ? 'bg-[#20271E] border-[var(--primary)]' : 
              'bg-transparent border-white/20'}`}
        >
          {status === 'done' && (
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <Check className="text-[var(--background)] w-3.5 h-3.5" strokeWidth={3} />
            </div>
          )}
          {status === 'active' && <Play className="text-[var(--background)] fill-[var(--background)] w-3.5 h-3.5" />}
          {status === 'locked' && <Lock className="text-white/40 w-3.5 h-3.5" />}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 ${status === 'done' ? 'bg-[var(--primary)]' : 'bg-white/10'} -mt-1`} />
        )}
      </div>

      {/* Card Column */}
      <div className="flex-1 pb-6 pl-2">
        <div 
          className={`w-full rounded-[18px] p-4 flex justify-between items-start border
            ${status === 'active' ? 'bg-black/30 border-[var(--primary)]/30' : 'bg-[#3F483A]/30 border-transparent'}`}
        >
          <div className="flex flex-col flex-1 pr-2">
            <span className={`text-[11px] font-bold ${status === 'locked' ? 'text-white/30' : 'text-white/60'}`}>
              Day {dayNumber}
            </span>
            <span className={`text-[15px] font-bold leading-5 mt-1 ${status === 'locked' ? 'text-white/40' : 'text-white'}`}>
              {title}
            </span>
          </div>

          <div 
            className={`px-2.5 py-1 rounded-lg border flex shrink-0
              ${status === 'done' ? 'bg-[var(--primary)] border-transparent' : 
                status === 'active' ? 'bg-[var(--primary)]/15 border-transparent' : 
                'bg-transparent border-white/15'}`}
          >
            <span 
              className={`text-[10px] font-bold ${status === 'done' ? 'text-[var(--background)]' : status === 'active' ? 'text-[var(--primary)]' : 'text-white/40'}`}
            >
              {status === 'done' ? 'Completed' : status === 'active' ? 'In Progress' : 'Locked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
