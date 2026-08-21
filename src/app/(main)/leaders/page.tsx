"use client";

import React, { useState, useEffect } from 'react';
import { PodiumItem } from '@/components/leaderboard/PodiumItem';
import { RankingItemRow } from '@/components/leaderboard/RankingItemRow';
import { TabButton } from '@/components/leaderboard/TabButton';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToLeaderboard, LeaderboardUser } from '@/lib/firebase/leaderboard';

export default function LeaderboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'credits' | 'skills'>('credits');
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToLeaderboard(activeTab, user?.uid, (users) => {
      setLeaderboardUsers(users);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [activeTab, user?.uid]);

  const top3 = leaderboardUsers.slice(0, 3);
  const remaining = leaderboardUsers.slice(3);
  const myRank = leaderboardUsers.find(u => u.isCurrent);

  return (
    <div className="w-full min-h-full pb-24 pt-6 px-6">
      {/* Header */}
      <div className="flex w-full justify-between items-center pb-6">
        <h1 className="text-white text-xl font-bold">Leaderboard</h1>
        <div className="flex items-center space-x-2 bg-[#AEC279] rounded-[20px] px-3 py-1">
          <span className="text-sm">💰</span>
          <span className="text-[#20271E] text-[11px] font-bold">
            {profile?.credits || 0} Credits
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AEC279]"></div>
        </div>
      ) : leaderboardUsers.length === 0 ? (
        <div className="w-full h-[200px] flex items-center justify-center">
          <span className="text-white/50 text-sm">No leaderboard data yet.</span>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {/* Podium Section */}
          <div className="w-full h-[280px] bg-[#3F483A] rounded-[24px] pt-6 pb-4 flex justify-center items-end">
            {top3.length >= 2 && (
              <PodiumItem
                rank={top3[1].rank}
                name={top3[1].displayName}
                stats={activeTab === 'credits' ? `${top3[1].totalCreditsEarned} Cr` : `${top3[1].skillsCompleted} Skills`}
                imageUrl={top3[1].profileImageUrl || `https://picsum.photos/seed/${top3[1].userId}/100`}
              />
            )}
            
            {top3.length >= 1 && (
              <PodiumItem
                rank={top3[0].rank}
                name={top3[0].displayName}
                stats={activeTab === 'credits' ? `${top3[0].totalCreditsEarned} Cr` : `${top3[0].skillsCompleted} Skills`}
                imageUrl={top3[0].profileImageUrl || `https://picsum.photos/seed/${top3[0].userId}/100`}
                isFirst
              />
            )}
            
            {top3.length >= 3 && (
              <PodiumItem
                rank={top3[2].rank}
                name={top3[2].displayName}
                stats={activeTab === 'credits' ? `${top3[2].totalCreditsEarned} Cr` : `${top3[2].skillsCompleted} Skills`}
                imageUrl={top3[2].profileImageUrl || `https://picsum.photos/seed/${top3[2].userId}/100`}
              />
            )}
          </div>

          {/* Current User Summary */}
          {myRank && (
            <div className="w-full mt-6 bg-[#3F483A]/40 rounded-xl p-3 flex items-center">
              <img 
                src={myRank.profileImageUrl || `https://picsum.photos/seed/${myRank.userId}/100`} 
                alt="Me" 
                className="w-10 h-10 rounded-lg bg-[#3F483A] object-cover" 
              />
              <div className="flex-1 flex flex-col px-4">
                <span className="text-white text-sm font-bold">
                  You're ranked #{myRank.rank}!
                </span>
                <span className="text-white/65 text-[11px]">
                  {activeTab === 'credits' 
                    ? "Keep earning to climb higher!" 
                    : "Complete more skills to reach the top!"}
                </span>
              </div>
              <div className="flex items-center space-x-1 shrink-0">
                <span className="text-white text-sm font-bold leading-4 text-right">
                  Keep<br/>Going
                </span>
                <ArrowRight className="text-white w-4 h-4 ml-1" />
              </div>
            </div>
          )}

          {/* Tab Buttons */}
          <div className="w-full mt-6 bg-[#3F483A]/30 rounded-[20px] p-1 flex">
            <TabButton 
              label="By Credits" 
              active={activeTab === 'credits'} 
              onClick={() => setActiveTab('credits')} 
            />
            <TabButton 
              label="By Skills Completed" 
              active={activeTab === 'skills'} 
              onClick={() => setActiveTab('skills')} 
            />
          </div>

          {/* All Rankings */}
          <div className="w-full mt-6">
            <h2 className="text-white text-xl font-bold mb-4">All Rankings</h2>
            <div className="w-full flex flex-col">
              {remaining.map(ranking => (
                <RankingItemRow
                  key={ranking.userId}
                  rank={ranking.rank}
                  name={ranking.displayName}
                  dept={ranking.dept}
                  credits={ranking.totalCreditsEarned}
                  skills={ranking.skillsCompleted}
                  imageUrl={ranking.profileImageUrl || `https://picsum.photos/seed/${ranking.userId}/100`}
                  isCurrent={ranking.isCurrent}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
