import React from 'react';

interface UploadTextFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  placeholder: string;
  isTextArea?: boolean;
}

export const UploadTextField = ({ value, onChange, placeholder, isTextArea = false, ...props }: UploadTextFieldProps) => {
  const commonClasses = "w-full bg-transparent border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#AEC279] placeholder:text-white/40 text-sm";
  
  if (isTextArea) {
    return (
      <textarea 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${commonClasses} min-h-[100px] resize-none`}
        {...props}
      />
    );
  }

  return (
    <input 
      type="text"
      value={value}
      onChange={onChange as any}
      placeholder={placeholder}
      className={commonClasses}
    />
  );
};
