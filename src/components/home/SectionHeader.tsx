import React from 'react';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const SectionHeader = ({ title, actionLabel, onActionClick }: SectionHeaderProps) => {
  return (
    <div className="flex w-full justify-between items-center pb-4">
      <h2 className="text-[var(--primary)] text-base font-semibold">
        {title}
      </h2>
      {actionLabel && (
        <button 
          onClick={onActionClick}
          className="text-[#F2F3F1]/55 text-sm font-medium hover:text-[var(--primary)] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
