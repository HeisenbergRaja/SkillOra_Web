import React from 'react';
import Image from 'next/image';

interface CreatorAvatarProps {
  imageUrl: string;
  name: string;
  credits: number;
  rank: number;
}

export const CreatorAvatar = ({ imageUrl, name, credits, rank }: CreatorAvatarProps) => {
  return (
    <div className="w-[88px] mr-4 shrink-0 flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-[#E7E9E6]/25 overflow-hidden">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-0 right-0 w-[22px] h-[22px] translate-x-1 translate-y-1 bg-[var(--primary)] rounded-full border-2 border-[var(--background)] flex items-center justify-center">
          <span className="text-[var(--surface)] text-[10px] font-bold">{rank}</span>
        </div>
      </div>
      <span className="text-[var(--primary)] text-sm font-semibold mt-2 truncate w-full text-center">
        {name}
      </span>
      <span className="text-[#F2F3F1]/55 text-xs font-medium truncate w-full text-center">
        {credits} cr
      </span>
    </div>
  );
};
