"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthTextField } from '@/components/ui/AuthTextField';
import { AuthButton } from '@/components/ui/AuthButton';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/home');
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // Redirect handled by useEffect
    } catch (err: any) {
      console.error(err);
      setError('Unable to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col w-full" onSubmit={handleLogin}>
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}
      <AuthTextField
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
        placeholder="student@campus.edu"
        className="mb-6"
      />
      
      <AuthTextField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        placeholder="••••••••"
        isPassword
      />

      <div className="w-full py-4 flex justify-end">
        <Link 
          href="/forgot-password"
          className="text-[#E7E9E6]/55 text-sm font-medium hover:text-[var(--primary)] transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <AuthButton label="Login" type="submit" />

      <div className="w-full py-8 flex items-center">
        <div className="flex-1 h-px bg-white/10" />
        <span className="px-4 text-white/50 text-sm">OR</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <GoogleButton
        loading={isLoading}
        onClick={handleGoogleSignIn}
        type="button"
      />

      <div className="w-full pt-6 pb-10 flex justify-center items-center">
        <span className="text-[#F2F3F1]/60 text-base">Don't have an account? </span>
        <Link 
          href="/register" 
          className="text-[#E7E9E6]/80 font-semibold text-base ml-1 hover:text-[var(--primary)] transition-colors"
        >
          Register
        </Link>
      </div>
    </form>
  );
}
