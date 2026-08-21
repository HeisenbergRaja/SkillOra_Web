import React from 'react';
import { ThumbsUp } from 'lucide-react';

interface SkillRequestCardProps {
  userAvatarUrl: string;
  userName: string;
  title: string;
  likes: number;
  requestedAgo: string;
  onPress: () => void;
  onPressUpload: () => void;
}

export const SkillRequestCard = ({
  userAvatarUrl,
  userName,
  title,
  likes,
  requestedAgo,
  onPress,
  onPressUpload
}: SkillRequestCardProps) => {
  return (
    <div 
      onClick={onPress}
      className="w-[220px] mr-4 shrink-0 bg-[#E7E9E6]/15 border border-[#F2F3F1]/10 rounded-[18px] p-6 cursor-pointer hover:bg-[#E7E9E6]/25 transition-colors flex flex-col justify-between"
    >
      <div className="flex items-center space-x-2 w-full">
        <img src={userAvatarUrl} alt={userName} className="w-7 h-7 rounded-full object-cover bg-[var(--surface)] shrink-0" />
        <span className="text-[#F2F3F1]/75 text-xs font-semibold truncate">{userName}</span>
      </div>
      
      <h3 className="text-[var(--primary)] text-base font-semibold mt-4 mb-4 line-clamp-2 min-h-[40px]">
        {title}
      </h3>
      
      <div className="flex w-full justify-between items-center mb-4">
        <div className="flex items-center space-x-2 bg-[#20271E]/55 rounded-full px-3 py-1">
          <ThumbsUp className="text-[var(--primary)] w-4 h-4" />
          <span className="text-[var(--primary)] text-xs font-semibold">{likes}</span>
        </div>
        <span className="text-[#F2F3F1]/50 text-[10px] font-medium whitespace-nowrap ml-2">Req. {requestedAgo}</span>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPressUpload();
        }}
        className="self-end px-4 py-2 bg-[#AEC279]/35 rounded-xl transition-colors hover:bg-[#AEC279]/50"
      >
        <span className="text-[var(--primary)] text-sm font-semibold">Upload Skill</span>
      </button>
    </div>
  );
};
