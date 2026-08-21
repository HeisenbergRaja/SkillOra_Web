"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, LayoutGrid, BookOpen, BarChart2, User } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/home', icon: Home },
  { key: 'marketplace', label: 'Marketplace', path: '/marketplace', icon: LayoutGrid },
  { key: 'learning', label: 'Learning', path: '/learning', icon: BookOpen },
  { key: 'leaders', label: 'Leaders', path: '/leaders', icon: BarChart2 },
  { key: 'profile', label: 'Profile', path: '/profile', icon: User },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 h-screen border-r border-[var(--outline)] bg-[var(--surface)] p-6">
      <div className="flex items-center space-x-3 mb-10">
        <div className="w-10 h-10 bg-[var(--background)] rounded-lg flex items-center justify-center">
          <span className="text-[var(--primary)] text-xl font-bold">S</span>
        </div>
        <span className="text-[var(--primary)] text-2xl font-bold">Skillora</span>
      </div>

      <nav className="flex-1 flex flex-col space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.key}
              href={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium",
                isActive 
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]" 
                  : "text-[#F2F3F1]/50 hover:bg-[var(--primary)]/5 hover:text-[#F2F3F1]/80"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
