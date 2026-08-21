import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full bg-[var(--background)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto pb-[72px] md:pb-0">
        <div className="max-w-7xl mx-auto w-full h-full relative">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
