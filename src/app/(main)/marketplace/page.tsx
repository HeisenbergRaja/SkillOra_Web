"use client";

import React, { useState, useEffect } from 'react';
import { CategoryChip } from '@/components/home/CategoryChip';
import { MarketplaceSkillCard } from '@/components/marketplace/MarketplaceSkillCard';
import { SkillRequestCard } from '@/components/marketplace/SkillRequestCard';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { SectionHeader } from '@/components/home/SectionHeader';
import { CreditCard, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToPublishedSkills, subscribeToUserEnrollments } from '@/lib/firebase/skills';
import { Skill, Enrollment } from '@/types/skill';

export default function MarketplacePage() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  
  const [skills, setSkills] = useState<Skill[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to published skills
    const unsubscribeSkills = subscribeToPublishedSkills((publishedSkills) => {
      setSkills(publishedSkills);
      setLoading(false);
    });

    return () => unsubscribeSkills();
  }, []);

  useEffect(() => {
    // Subscribe to enrollments if user is logged in
    if (!user) {
      setEnrollments([]);
      return;
    }
    const unsubscribeEnrollments = subscribeToUserEnrollments(user.uid, (userEnrollments) => {
      setEnrollments(userEnrollments);
    });

    return () => unsubscribeEnrollments();
  }, [user]);

  // Derive categories from skills or use default mock categories for UI consistency
  const uniqueCategories = Array.from(new Set(skills.map(s => s.category))).filter(Boolean);
  const dynamicCategories = [
    { id: 'all', label: 'All' },
    ...uniqueCategories.map(cat => ({ id: cat.toLowerCase(), label: cat }))
  ];

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryId === 'all' || skill.category.toLowerCase() === activeCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-full pb-24 pt-6 px-6 relative">
      {/* Header */}
      <div className="flex w-full justify-between items-center pb-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-[34px] h-[34px] rounded-full overflow-hidden bg-[var(--surface)] border border-white/10 flex items-center justify-center">
            {profile?.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{profile?.name?.charAt(0).toUpperCase() || 'A'}</span>
            )}
          </div>
          <h1 className="text-[var(--primary)] text-xl font-semibold truncate">
            Marketplace
          </h1>
        </div>
        <div className="flex items-center space-x-2 bg-[#AEC279]/25 rounded-[18px] px-4 py-2 ml-4 shrink-0">
          <CreditCard className="text-[var(--primary)] w-4 h-4" />
          <span className="text-[var(--primary)] text-sm font-semibold">
            {profile?.credits || 0} Credits
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="pb-8">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Categories */}
      <div className="pb-8">
        <div className="w-full overflow-x-auto hide-scrollbar flex space-x-3 mt-6 pb-2">
          {dynamicCategories.map(cat => (
            <CategoryChip 
              key={cat.id}
              label={cat.label}
              selected={activeCategoryId === cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Skills List */}
      <div className="pb-8">
        <SectionHeader title="Published Skills" />
        <div className="w-full mt-6">
          {loading ? (
            <div className="w-full flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 border-4 border-[#AEC279] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[var(--primary)]/50 text-sm font-medium">Loading skills...</span>
            </div>
          ) : filteredSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
              {filteredSkills.map(skill => {
                const enrollment = enrollments.find(e => e.skillId === skill.id);
                const isCreator = skill.creatorId === user?.uid;
                let enrollmentStatus = undefined;
                if (isCreator) {
                  enrollmentStatus = "Your Skill";
                } else if (enrollment) {
                  enrollmentStatus = enrollment.completed ? "Completed" : "Continue Learning";
                }
                
                return (
                  <MarketplaceSkillCard 
                    key={skill.id}
                    title={skill.title}
                    instructor={skill.creatorName}
                    category={skill.category}
                    rating={"New"} // Rating feature isn't in base model yet
                    credits={skill.creditsRequired}
                    imageUrl={skill.thumbnail}
                    enrollmentStatus={enrollmentStatus}
                    onPress={() => router.push(`/marketplace/skill/${skill.id}`)}
                    onPressEnroll={() => router.push(`/marketplace/skill/${skill.id}`)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-2xl">
              <span className="text-[var(--primary)]/60 text-sm font-medium">No skills found</span>
            </div>
          )}
        </div>
      </div>

      {/* Skill Requests */}
      <div className="pb-8">
        <SectionHeader title="Skill Requests" />
        <div className="w-full py-4 text-white/50 text-sm">
          No skill requests yet.
        </div>
      </div>

      {/* Floating Action Button (Upload Skill) */}
      <button 
        className="fixed bottom-[96px] right-6 md:absolute md:bottom-6 md:right-6 w-[54px] h-[54px] bg-[#AEC279] text-[#20271EE6] rounded-full flex items-center justify-center shadow-lg hover:bg-[#9AB063] transition-colors z-40"
        onClick={() => router.push('/marketplace/upload')}
      >
        <Plus size={24} />
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
