import React from 'react';
import Image from 'next/image';

interface PodiumItemProps {
  rank: number;
  name: string;
  stats: string;
  imageUrl: string;
  isFirst?: boolean;
}

export const PodiumItem = ({ rank, name, stats, imageUrl, isFirst = false }: PodiumItemProps) => {
  return (
    <div className="flex flex-col items-center px-2">
      <div 
        className={`rounded-full overflow-hidden border-[3px] 
        ${isFirst ? 'w-[70px] h-[70px] border-[var(--primary)]' : 'w-[50px] h-[50px] border-white/40'}`}
      >
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="h-2" />
      
      <div 
        className={`flex justify-center items-start rounded-t-lg border
        ${isFirst 
          ? 'w-[70px] h-[100px] bg-[var(--primary)] border-transparent' 
          : 'w-[60px] h-[80px] bg-white/10 border-white/20'}`}
      >
        <span 
          className={`text-xl font-bold mt-2
          ${isFirst ? 'text-[var(--background)]' : 'text-white/50'}`}
        >
          {rank}
        </span>
      </div>

      <span className={`text-sm font-bold mt-2 ${isFirst ? 'text-[var(--primary)]' : 'text-white'}`}>
        {name}
      </span>
      <span className={`text-[10px] ${isFirst ? 'text-[var(--primary)]/80' : 'text-white/60'}`}>
        {stats}
      </span>
    </div>
  );
};
