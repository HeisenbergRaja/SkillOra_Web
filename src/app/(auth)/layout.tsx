import React from 'react';
import { AuthLayoutClient } from '@/components/layout/AuthLayoutClient';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
