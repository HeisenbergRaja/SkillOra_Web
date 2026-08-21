"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AuthLayoutClientProps {
  children: React.ReactNode;
}

export const AuthLayoutClient: React.FC<AuthLayoutClientProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isLogin = pathname.includes('/login');
  const isRegister = pathname.includes('/register');
  const isForgotPassword = pathname.includes('/forgot-password');

  // If forgot password, don't show the tabs
  const showTabs = !isForgotPassword;
  const activeTab = isLogin ? 'login' : 'register';

  return (
    <div className="min-h-screen w-full bg-[var(--background)] overflow-y-auto flex justify-center">
      <div className="w-full max-w-md flex flex-col">
        {/* Top Section */}
        <div className="px-6 pt-10 pb-6 flex flex-col items-center">
          {/* Brand Wrap */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-[76px] h-[76px] bg-[var(--surface)] rounded-[14px] flex items-center justify-center mb-4 relative">
              {/* Handshake placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--foreground)]">
                <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
                <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
                <path d="m21 3 1 11h-2"/>
                <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
                <path d="3 4h8"/>
              </svg>
              {/* Star placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--foreground)] absolute translate-x-[10px] -translate-y-[6px]">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            
            <p className="text-[var(--text-muted)] text-xs tracking-[1.2px] mb-2 font-medium">LUMINARY EXCHANGE</p>
            <h1 className="text-[var(--primary)] text-[44px] font-bold leading-[52px]">Skillora</h1>
          </div>

          {/* Tabs Wrap */}
          {showTabs && (
            <div className="w-full h-14 bg-[var(--tab-bg)] rounded-[26px] p-1.5 relative flex mt-2">
              <motion.div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[var(--tab-indicator)] rounded-[22px]"
                initial={false}
                animate={{
                  x: activeTab === 'login' ? 0 : '100%',
                }}
                transition={{ type: "tween", ease: [0.215, 0.61, 0.355, 1], duration: 0.26 }}
              />
              
              <button
                className="flex-1 h-full z-10 flex items-center justify-center font-medium text-base transition-colors"
                style={{ color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-muted)' }}
                onClick={() => router.push('/login')}
              >
                Login
              </button>
              <button
                className="flex-1 h-full z-10 flex items-center justify-center font-medium text-base transition-colors"
                style={{ color: activeTab === 'register' ? 'var(--primary)' : 'var(--text-muted)' }}
                onClick={() => router.push('/register')}
              >
                Register
              </button>
            </div>
          )}

          {showTabs && (
            <div className="w-full mt-6 flex flex-col">
              <h2 className="text-[var(--primary)] text-[32px] font-bold text-left">
                {activeTab === 'login' ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-[#F2F3F1]/60 text-base text-left mt-1 mb-6">
                {activeTab === 'login' ? "Sign in to continue learning" : "Join your campus learning community"}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="w-full px-6 pb-12 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
