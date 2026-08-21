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

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[var(--surface)] border-t border-[var(--outline)] px-2 z-50">
      <div className="flex w-full h-full justify-around items-center pt-2 pb-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.key}
              href={item.path}
              className="flex flex-col items-center justify-center space-y-1 w-16"
            >
              <item.icon 
                size={20} 
                className={cn(isActive ? "text-[var(--primary)]" : "text-[#F2F3F1]/50")}
              />
              <span 
                className={cn(
                  "text-[12px] font-medium leading-none mt-1",
                  isActive ? "text-[var(--primary)]" : "text-[#F2F3F1]/50"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
