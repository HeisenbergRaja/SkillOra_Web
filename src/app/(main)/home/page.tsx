"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HomeHeader } from '@/components/home/HomeHeader';
import { CategoryChip } from '@/components/home/CategoryChip';
import { SectionHeader } from '@/components/home/SectionHeader';
import { ContinueLearningCardLarge as ContinueLearningCard } from '@/components/home/ContinueLearningCardLarge';
import { CreatorAvatar } from '@/components/home/CreatorAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToLeaderboard, LeaderboardUser } from '@/lib/firebase/leaderboard';
import { subscribeToUserEnrollments, getSkillById } from '@/lib/firebase/skills';
import { Enrollment, Skill } from '@/types/skill';
import { Code2, Palette, TrendingUp, Brain, Cloud, Search } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [activeEnrollments, setActiveEnrollments] = useState<(Enrollment & { skill?: Skill | null })[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeLeaderboard = subscribeToLeaderboard('credits', user?.uid, (users) => {
      setLeaderboardUsers(users.slice(0, 3));
    });

    let unsubscribeEnrollments = () => {};
    if (user) {
      unsubscribeEnrollments = subscribeToUserEnrollments(user.uid, async (enrollments) => {
        const inProgress = enrollments.filter(e => !e.completed);
        const enrollmentsWithSkills = await Promise.all(
          inProgress.map(async (enrollment) => {
            const skill = await getSkillById(enrollment.skillId);
            return { ...enrollment, skill };
          })
        );
        setActiveEnrollments(enrollmentsWithSkills);
      });
    }

    return () => {
      unsubscribeLeaderboard();
      unsubscribeEnrollments();
    };
  }, [user]);

  const categories = [
    { id: '1', label: 'Programming', icon: <Code2 className="w-5 h-5 text-white" /> },
    { id: '2', label: 'Design', icon: <Palette className="w-5 h-5 text-white" /> },
    { id: '3', label: 'Business', icon: <TrendingUp className="w-5 h-5 text-white" /> },
    { id: '4', label: 'AI & ML', icon: <Brain className="w-5 h-5 text-white" /> },
    { id: '5', label: 'Cloud', icon: <Cloud className="w-5 h-5 text-white" /> }
  ];

  return (
    <div className="w-full min-h-full pb-24 pt-6 px-6 relative">
      <HomeHeader user={{
        id: user?.uid || "mock-id",
        name: profile?.name || "Anonymous",
        avatar: profile?.profileImageUrl || undefined,
        credits: profile?.credits || 0,
        rank: profile?.rank || 0
      }} />

      <div className="w-full overflow-x-auto pb-8 hide-scrollbar flex space-x-3">
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              iconName={cat.label}
              selected={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
      </div>

      {activeEnrollments.length > 0 && (
        <div className="w-full pb-8">
          <SectionHeader 
            title="Continue Learning" 
            actionLabel="View All" 
            onActionClick={() => router.push('/learning')}
          />
          <div className="w-full overflow-x-auto hide-scrollbar flex">
            {activeEnrollments.map((enrollment: any) => (
              <ContinueLearningCard
                key={enrollment.skillId}
                category={enrollment.skill?.category || 'General'}
                title={enrollment.skill?.title || "Unknown Skill"}
                progress={enrollment.progress}
                onContinue={() => router.push(`/learning/${enrollment.skillId}`)}
              />
            ))}
          </div>
        </div>
      )}

      {leaderboardUsers.length > 0 && (
        <div className="w-full pb-8">
          <SectionHeader title="Top Learners" />
          <div className="w-full overflow-x-auto hide-scrollbar flex">
            {leaderboardUsers.map((learner: any) => (
              <CreatorAvatar
                key={learner.userId}
                name={learner.displayName}
                credits={learner.totalCreditsEarned}
                rank={learner.rank}
                imageUrl={learner.profileImageUrl || `https://picsum.photos/seed/${learner.userId}/100`}
              />
            ))}
          </div>
        </div>
      )}

      <button 
        className="fixed bottom-[96px] right-6 md:absolute md:bottom-6 md:right-6 w-[54px] h-[54px] bg-[var(--primary)] text-[var(--surface)] rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--primary)]/90 transition-colors z-40"
        onClick={() => router.push('/marketplace')}
      >
        <Search size={20} />
      </button>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
