"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthTextField } from '@/components/ui/AuthTextField';
import { AuthButton } from '@/components/ui/AuthButton';
import { SelectInput } from '@/components/ui/SelectInput';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('Freshman');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/login');
  };

  return (
    <form className="flex flex-col w-full" onSubmit={handleRegister}>
      <AuthTextField
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        label="Full Name"
        placeholder="Jane Doe"
        className="mb-6"
      />
      
      <AuthTextField
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
        placeholder="jane@college.edu"
        className="mb-6"
      />
      
      <AuthTextField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        placeholder="••••••••"
        isPassword
        className="mb-6"
      />
      
      <AuthTextField
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        label="Confirm Password"
        placeholder="••••••••"
        isPassword
        className="mb-6"
      />
      
      <AuthTextField
        value={college}
        onChange={(e) => setCollege(e.target.value)}
        label="College Name"
        placeholder="State University"
        className="mb-6"
      />

      <div className="flex w-full space-x-4 mb-6">
        <AuthTextField
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          label="Department"
          placeholder="Design"
          className="flex-1"
        />
        <SelectInput
          value={year}
          onChange={(v) => setYear(v)}
          label="Year"
          placeholder="Select year"
          options={["Freshman", "Sophomore", "Junior", "Senior"]}
          className="flex-1"
        />
      </div>

      <AuthButton label="Register" type="submit" />

      <div className="w-full pt-6 pb-10 flex justify-center items-center">
        <span className="text-[#F2F3F1]/60 text-base">Already have an account? </span>
        <Link 
          href="/login" 
          className="text-[#E7E9E6]/80 font-semibold text-base ml-1 hover:text-[var(--primary)] transition-colors"
        >
          Login
        </Link>
      </div>
    </form>
  );
}
