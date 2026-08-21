"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface SelectInputProps {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (val: string) => void;
  error?: string;
  className?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  error,
  className
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("w-full flex flex-col", className)}>
      <label className="text-[var(--text-muted)] text-sm pb-2">
        {label}
      </label>

      <div
        className={cn(
          "w-full h-14 bg-[var(--surface)] rounded-[14px] border px-5 flex items-center cursor-pointer transition-colors",
          error ? "border-[var(--primary)]/50" : "border-[var(--input-border)] hover:border-[var(--foreground)]/50"
        )}
        onClick={() => setOpen(true)}
      >
        <div className="flex-1">
          {value ? (
            <span className="text-[var(--foreground)] text-base">{value}</span>
          ) : (
            <span className="text-[var(--input-placeholder)] text-base">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="text-[var(--text-muted)] w-5 h-5" />
      </div>

      {error && (
        <span className="text-[var(--primary)] text-xs pt-2">
          {error}
        </span>
      )}

      {/* Modal / Dialog for Select */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--modal-overlay)]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[var(--surface)] rounded-2xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[var(--primary)] text-xl font-semibold">Select {label.toLowerCase()}</h3>
                <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--foreground)]">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col max-h-[60vh] overflow-y-auto">
                {options.map((opt, idx) => (
                  <React.Fragment key={opt}>
                    <button
                      className="w-full text-left py-4 text-[var(--foreground)] text-base font-medium transition-colors hover:bg-[var(--primary)]/5 px-2 rounded-lg"
                      onClick={() => {
                        onChange(opt);
                        setOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                    {idx < options.length - 1 && (
                      <div className="w-full h-px bg-[#F2F3F1] opacity-[0.08]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
