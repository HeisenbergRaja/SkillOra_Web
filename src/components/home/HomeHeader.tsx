import React from 'react';
import { CreditCard } from 'lucide-react';
export interface HeaderUser {
  id: string;
  name: string;
  credits: number;
  avatar?: string;
  rank?: number;
}

export const HomeHeader = ({ user }: { user: HeaderUser }) => {
  const hour = new Date().getHours();
  let greeting = "Good Night";
  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17 && hour < 20) greeting = "Good Evening";

  return (
    <div className="flex w-full justify-between items-start pb-6">
      <div className="flex-1 flex flex-col">
        <h1 className="text-[var(--primary)] text-xl font-semibold truncate">
          {greeting}, {user.name} 👋
        </h1>
        <p className="text-[#F2F3F1]/55 text-sm mt-1">
          What are you learning today?
        </p>
      </div>
      <div className="flex items-center space-x-2 bg-[#AEC279]/25 rounded-[18px] px-4 py-2 ml-4 shrink-0">
        <CreditCard className="text-[var(--primary)] w-4 h-4" />
        <span className="text-[var(--primary)] text-sm font-semibold">
          {user.credits} Credits
        </span>
      </div>
    </div>
  );
};
