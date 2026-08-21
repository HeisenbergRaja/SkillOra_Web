import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GoogleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const GoogleButton = React.forwardRef<HTMLButtonElement, GoogleButtonProps>(
  ({ className, disabled, loading, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "w-full h-14 mt-4 rounded-[22px] bg-[var(--google-btn-bg)] border border-[var(--google-btn-border)] flex items-center justify-center transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--google-btn-bg)]/80",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 text-[var(--foreground)] animate-spin" />
        ) : (
          <div className="flex items-center justify-center">
            <span className="text-[var(--foreground)] text-xl font-bold pr-2">G</span>
            <span className="text-[var(--foreground)] text-base font-semibold">Continue with Google</span>
          </div>
        )}
      </button>
    );
  }
);
GoogleButton.displayName = "GoogleButton";
