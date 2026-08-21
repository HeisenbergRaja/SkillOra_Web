"use client";

import React from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <h2 className="text-[var(--primary)] text-2xl font-bold mb-4">Forgot Password</h2>
      <p className="text-white/60 text-center mb-8">
        Placeholder screen. UI will be implemented next.
      </p>
      
      <Link 
        href="/login"
        className="text-[var(--primary)] text-base font-semibold hover:underline"
      >
        Back to Login
      </Link>
    </div>
  );
}
