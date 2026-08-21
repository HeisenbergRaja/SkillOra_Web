import React from 'react';

interface ProfileStatBlockProps {
  number: string;
  label: string;
}

export const ProfileStatBlock = ({ number, label }: ProfileStatBlockProps) => {
  return (
    <div className="flex-1 max-w-[100px] rounded-xl bg-[#3F483A]/50 py-3 flex flex-col items-center">
      <span className="text-[#20271E] text-xl font-bold">{number}</span>
      <span className="text-white/60 text-[10px] leading-3 text-center mt-1 whitespace-pre-wrap">
        {label}
      </span>
    </div>
  );
};
