"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface AuthTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const AuthTextField = React.forwardRef<HTMLInputElement, AuthTextFieldProps>(
  ({ label, error, isPassword, className, type, ...props }, ref) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const inputType = isPassword ? (passwordVisible ? 'text' : 'password') : type || 'text';

    return (
      <div className={cn("w-full flex flex-col", className)}>
        {label && (
          <label className="text-[var(--text-muted)] text-sm pb-2">
            {label}
          </label>
        )}
        
        <div className={cn(
          "w-full min-h-14 bg-[var(--surface)] rounded-[14px] border px-5 flex items-center transition-colors",
          error ? "border-[var(--primary)]/50" : "border-[var(--input-border)] focus-within:border-[var(--foreground)]/50"
        )}>
          <input
            ref={ref}
            type={inputType}
            className="flex-1 bg-transparent text-[var(--foreground)] text-base placeholder:text-[var(--input-placeholder)] outline-none w-full py-3"
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="ml-2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none"
            >
              {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {error && (
          <span className="text-[var(--primary)] text-xs pt-2">
            {error}
          </span>
        )}
      </div>
    );
  }
);
AuthTextField.displayName = "AuthTextField";
