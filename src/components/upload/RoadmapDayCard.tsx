import React from 'react';
import { UploadLabel } from './UploadLabel';
import { UploadTextField } from './UploadTextField';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface RoadmapDayCardProps {
  dayNumber: number;
  title: string;
  description: string;
  isExpanded: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onToggleExpand: () => void;
  onDelete: () => void;
}

export const RoadmapDayCard = ({
  dayNumber,
  title,
  description,
  isExpanded,
  onTitleChange,
  onDescriptionChange,
  onToggleExpand,
  onDelete
}: RoadmapDayCardProps) => {
  return (
    <div className="w-full border border-white/10 rounded-2xl overflow-hidden mt-4 bg-[var(--background)]">
      <div 
        className="w-full flex items-center justify-between p-4 bg-[#3F483A]/30 cursor-pointer"
        onClick={onToggleExpand}
      >
        <span className="text-[var(--primary)] font-bold text-sm">Day {dayNumber}</span>
        <div className="flex items-center space-x-4">
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-500/80 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? <ChevronUp className="text-white/50 w-5 h-5" /> : <ChevronDown className="text-white/50 w-5 h-5" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 flex flex-col space-y-4">
          <div>
            <UploadLabel text="Day Title" />
            <UploadTextField 
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Introduction"
            />
          </div>
          <div>
            <UploadLabel text="Description" />
            <UploadTextField 
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="What will learners accomplish on this day?"
              isTextArea
            />
          </div>
        </div>
      )}
    </div>
  );
};
