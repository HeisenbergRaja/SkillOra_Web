import React from 'react';

interface LearningStatBlockProps {
  number: string;
  label: string;
}

export const LearningStatBlock = ({ number, label }: LearningStatBlockProps) => {
  return (
    <div className="w-[100px] rounded-xl bg-[#3F483A] py-3 flex flex-col items-center">
      <span className="text-[var(--primary)] text-xl font-bold">{number}</span>
      <span className="text-[#F2F3F1]/80 text-[10px] leading-[14px] text-center mt-1 whitespace-pre-wrap">
        {label}
      </span>
    </div>
  );
};
