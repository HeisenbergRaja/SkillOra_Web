import React from 'react';

interface UploadLabelProps {
  text: string;
}

export const UploadLabel = ({ text }: UploadLabelProps) => {
  return (
    <div className="text-white/65 text-[11px] font-medium mb-2">
      {text}
    </div>
  );
};
