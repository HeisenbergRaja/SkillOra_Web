import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Search skills, creators..." }: SearchBarProps) => {
  return (
    <div className="w-full bg-[var(--surface)] border border-[#F2F3F1]/10 rounded-[18px] px-4 py-3 flex items-center focus-within:border-[var(--primary)]/50 transition-colors">
      <Search className="text-[#F2F3F1]/55 w-[18px] h-[18px] mr-2 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] text-sm placeholder:text-[#F2F3F1]/45"
      />
    </div>
  );
};
