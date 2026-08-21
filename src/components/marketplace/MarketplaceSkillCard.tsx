import React from 'react';
import { Star, School } from 'lucide-react';

interface MarketplaceSkillCardProps {
  imageUrl?: string;
  title: string;
  instructor: string;
  category: string;
  rating: string;
  credits: number;
  enrollmentStatus?: string;
  onPress: () => void;
  onPressEnroll: () => void;
}

export const MarketplaceSkillCard = ({
  imageUrl,
  title,
  instructor,
  category,
  rating,
  credits,
  enrollmentStatus,
  onPress,
  onPressEnroll
}: MarketplaceSkillCardProps) => {
  return (
    <div 
      onClick={onPress}
      className="w-full mb-6 bg-[#E7E9E6]/15 border border-[#F2F3F1]/10 rounded-[18px] p-6 cursor-pointer hover:bg-[#E7E9E6]/25 transition-colors flex flex-col"
    >
      <div className="flex w-full items-center">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-14 h-14 rounded-xl object-cover bg-[var(--surface)] shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-[var(--surface)]/20 flex items-center justify-center shrink-0">
            <School className="text-[var(--primary)] w-7 h-7" />
          </div>
        )}
        <div className="flex-1 ml-4 flex flex-col">
          <h3 className="text-[var(--primary)] text-base font-semibold line-clamp-1">{title}</h3>
          <p className="text-[#F2F3F1]/55 text-xs font-medium my-1">
            {instructor} &middot; {category}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1">
              <Star className="text-[var(--primary)] w-3.5 h-3.5" />
              <span className="text-[#F2F3F1]/70 text-xs font-semibold">{rating}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#F2F3F1]/30" />
            <span className="text-[#F2F3F1]/70 text-xs font-semibold">{credits} Credits</span>
          </div>
        </div>
      </div>
      
      <div className="w-full mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPressEnroll();
          }}
          className="w-full py-3 rounded-2xl flex items-center justify-center transition-colors"
          style={{
            backgroundColor: enrollmentStatus ? '#E7E9E633' : '#AEC2798C',
          }}
        >
          <span className="text-[var(--primary)] text-sm font-semibold">
            {enrollmentStatus || "Enroll"}
          </span>
        </button>
      </div>
    </div>
  );
};
