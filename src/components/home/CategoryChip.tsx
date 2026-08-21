"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Code, Cpu, Globe, Smartphone, Layout } from 'lucide-react';

interface CategoryChipProps {
  label: string;
  iconName?: string;
  selected?: boolean;
  onClick?: () => void;
}

const IconMap: Record<string, React.ElementType> = {
  Code, Cpu, Globe, Smartphone, Layout
};

export const CategoryChip = ({ label, iconName, selected = false, onClick }: CategoryChipProps) => {
  const IconComponent = iconName ? IconMap[iconName] : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 mr-4 px-6 py-2 rounded-[18px] border transition-colors flex-shrink-0",
        selected
          ? "bg-[#AEC279]/30 border-transparent text-[var(--primary)]"
          : "bg-[#E7E9E6]/15 border-[#F2F3F1]/10 text-[#F2F3F1]/75 hover:bg-[#E7E9E6]/25"
      )}
    >
      {IconComponent && <IconComponent size={16} />}
      <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
    </button>
  );
};
