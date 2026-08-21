import React from 'react';

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const TabButton = ({ label, active, onClick }: TabButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 rounded-2xl flex items-center justify-center transition-colors
        ${active ? 'bg-[var(--primary)]' : 'bg-transparent'}`}
    >
      <span 
        className={`text-sm font-bold
        ${active ? 'text-white' : 'text-white/60'}`}
      >
        {label}
      </span>
    </button>
  );
};
