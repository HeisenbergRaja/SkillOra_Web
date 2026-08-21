import React from 'react';
import { ChevronRight, FileText, PlayCircle } from 'lucide-react';

interface EnrolledResourceCardProps {
  title: string;
  type: 'file' | 'video';
  onClick: () => void;
}

export const EnrolledResourceCard = ({ title, type, onClick }: EnrolledResourceCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="w-full mb-3 bg-[#3F483A]/40 border border-white/5 rounded-2xl p-4 flex items-center cursor-pointer hover:bg-[#3F483A]/60 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        {type === 'file' ? (
          <FileText className="text-white/70 w-5 h-5" />
        ) : (
          <PlayCircle className="text-white/70 w-5 h-5" />
        )}
      </div>
      
      <span className="flex-1 px-4 text-white text-sm font-medium line-clamp-2">
        {title}
      </span>

      <ChevronRight className="text-white/30 w-5 h-5 shrink-0" />
    </div>
  );
};
