import React from 'react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ label, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full rounded-[22px] bg-[var(--button-bg)] text-[var(--primary)] py-4 text-base font-semibold transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--button-bg)]/80",
          className
        )}
        {...props}
      >
        {label}
      </button>
    );
  }
);
AuthButton.displayName = "AuthButton";
