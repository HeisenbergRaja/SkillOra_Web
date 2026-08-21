import React from 'react';
import { ThumbsUp } from 'lucide-react';

interface RequestCardProps {
  title: string;
  requestedBy: string;
  bounty: number;
  upvotes: number;
  onClick?: () => void;
}

export const RequestCard = ({ title, requestedBy, bounty, upvotes, onClick }: RequestCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="w-full mb-4 bg-[#E7E9E6]/15 border border-[#F2F3F1]/10 rounded-[18px] p-4 px-6 flex justify-between items-center cursor-pointer hover:bg-[#E7E9E6]/25 transition-colors"
    >
      <div className="flex-1 flex flex-col mr-4">
        <h3 className="text-[var(--primary)] text-sm font-semibold line-clamp-1">{title}</h3>
        <p className="text-[#F2F3F1]/55 text-xs font-medium mt-1">
          requested by {requestedBy} &middot; Bounty: {bounty} cr
        </p>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <span className="text-[#F2F3F1]/55 text-xs font-medium">{upvotes} Upvotes</span>
        <div className="w-[34px] h-[34px] bg-[#E7E9E6]/15 rounded-full flex items-center justify-center">
          <ThumbsUp className="text-[var(--primary)] w-[18px] h-[18px]" />
        </div>
      </div>
    </div>
  );
};
