"use client";

import React, { useState, useEffect } from 'react';
import { Package, Trophy, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileStatBlock } from '@/components/profile/ProfileStatBlock';
import { CreatedSkillCard } from '@/components/profile/CreatedSkillCard';
import { LearnedSkillCard } from '@/components/profile/LearnedSkillCard';
import { subscribeToUserEnrollments, subscribeToSkillsByCreator, getSkillById } from '@/lib/firebase/skills';
import { Enrollment, Skill } from '@/types/skill';

export default function ProfilePage() {
  const { user, profile, profileLoading, logout } = useAuth();
  const router = useRouter();
  
  const [createdSkills, setCreatedSkills] = useState<Skill[]>([]);
  const [enrolledSkills, setEnrolledSkills] = useState<(Enrollment & { skill?: Skill | null })[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to created skills
    const unsubscribeCreated = subscribeToSkillsByCreator(user.uid, (skills) => {
      setCreatedSkills(skills);
    });

    // Fetch enrolled skills
    const unsubscribeEnrollments = subscribeToUserEnrollments(user.uid, async (enrollments) => {
      const withSkills = await Promise.all(
        enrollments.map(async (e) => {
          const s = await getSkillById(e.skillId);
          return { ...e, skill: s };
        })
      );
      setEnrolledSkills(withSkills);
    });

    return () => {
      unsubscribeCreated();
      unsubscribeEnrollments();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const completedCount = enrolledSkills.filter(s => s.completed).length;
  const inProgressCount = Math.max(0, enrolledSkills.length - completedCount);

  return (
    <div className="w-full min-h-full pb-24 pt-6">
      {/* Header */}
      <div className="flex w-full px-6 pb-6 items-center space-x-2">
        <Package className="text-white w-5 h-5" />
        <h1 className="text-white text-xl font-bold">Profile</h1>
      </div>

      {profileLoading ? (
        <div className="w-full px-6 py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#AEC279] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/50 text-sm font-medium">Loading profile...</span>
        </div>
      ) : (
        <div className="w-full px-6 flex flex-col">
          <ProfileCard 
            name={profile?.name || "Anonymous"}
          dept={profile?.dept || "Computer Science"}
          college={profile?.college || "Skillora Academy"}
          credits={profile?.credits || 0}
          profileImageUrl={profile?.profileImageUrl || undefined}
        />

        <div className="w-full mt-6 flex justify-between space-x-2">
          <ProfileStatBlock number={createdSkills.length.toString()} label="Skills\nCreated" />
          <ProfileStatBlock number={inProgressCount.toString()} label="Skills\nIn Progress" />
          <ProfileStatBlock number={completedCount.toString()} label="Skills\nCompleted" />
        </div>

        {profile?.rank && profile.rank > 0 && (
          <div className="w-full mt-6 bg-[#3F483A]/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="text-[#AEC279] w-6 h-6" />
              <span className="text-white text-sm font-medium">Global Rank</span>
            </div>
            <span className="text-[#AEC279] text-lg font-bold">#{profile.rank}</span>
          </div>
        )}

        <div className="w-full mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-base font-bold">Skills I Created</h2>
            <button 
              onClick={() => router.push('/chat/list')}
              className="text-[var(--primary)] text-sm font-medium"
            >
              Learner Chats
            </button>
          </div>
          
          <div className="flex flex-col space-y-3">
            {createdSkills.map(skill => (
              <CreatedSkillCard 
                key={skill.id}
                title={skill.title}
                learners={0}
                credits={skill.creditsRequired}
                rating={"0"}
              />
            ))}
            {createdSkills.length === 0 && (
              <div className="text-white/50 text-sm py-4">You haven't created any skills yet.</div>
            )}
          </div>
        </div>

        <div className="w-full mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-base font-bold">Skills I Learned</h2>
            <button className="text-[var(--primary)] text-sm font-medium">See All</button>
          </div>
          
          <div className="w-full overflow-x-auto hide-scrollbar flex space-x-4 pb-2">
            {enrolledSkills.map(enrollment => (
              <LearnedSkillCard 
                key={enrollment.skillId}
                title={enrollment.skill?.title || 'Unknown Skill'}
                status={enrollment.completed ? "Completed" : "In Progress"}
                completed={enrollment.completed}
              />
            ))}
            {enrolledSkills.length === 0 && (
              <div className="text-white/50 text-sm py-4">You haven't enrolled in any skills yet.</div>
            )}
          </div>
        </div>

        <div className="w-full mt-6 py-2 flex justify-between items-center">
          <span className="text-white/60 text-sm">Total Credits Earned</span>
          <span className="text-[#AEC279] text-sm font-bold">{profile?.totalCreditsEarned || 0} Credits</span>
        </div>

        <button 
          className="w-full h-14 bg-red-500/20 text-red-500 font-bold rounded-[14px] flex items-center justify-center space-x-2 mt-8 mb-6 hover:bg-red-500/30 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        </div>
      )}

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
