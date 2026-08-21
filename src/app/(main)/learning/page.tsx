"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { LearningStatBlock } from '@/components/learning/LearningStatBlock';
import { ContinueLearningCardLarge } from '@/components/home/ContinueLearningCardLarge';
import { EnrolledSkillRow } from '@/components/learning/EnrolledSkillRow';
import { CompletedSkillRow } from '@/components/learning/CompletedSkillRow';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserEnrollments, getSkillById } from '@/lib/firebase/skills';
import { Enrollment, Skill } from '@/types/skill';

export default function MyLearningPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [skillsDict, setSkillsDict] = useState<Record<string, Skill>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserEnrollments(user.uid, async (fetchedEnrollments) => {
      setEnrollments(fetchedEnrollments);
      
      // Fetch skills for these enrollments if we don't have them yet
      const newSkillsDict = { ...skillsDict };
      let fetchedNew = false;
      
      for (const enrollment of fetchedEnrollments) {
        if (!newSkillsDict[enrollment.skillId]) {
          try {
            const skillData = await getSkillById(enrollment.skillId);
            if (skillData) {
              newSkillsDict[enrollment.skillId] = skillData;
              fetchedNew = true;
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      
      if (fetchedNew) {
        setSkillsDict(newSkillsDict);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const skillsEnrolled = enrollments.length;
  const skillsCompleted = enrollments.filter(s => s.completed || s.roadmapCompleted).length;
  // Android users doc tracks totalCreditsEarned, we can use that from profile
  const creditsEarned = profile?.totalCreditsEarned || 0;


  return (
    <div className="w-full min-h-full pb-24 pt-6 px-6">
      {/* Header */}
      <div className="flex w-full justify-between items-center pb-6">
        <h1 className="text-white text-xl font-bold">My Learning</h1>
        <div className="flex items-center space-x-2 bg-[#AEC279] rounded-[20px] px-3 py-1">
          <span className="text-sm">💰</span>
          <span className="text-[#20271E] text-[11px] font-bold">
            {profile?.credits || 0} Credits
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex w-full justify-between items-start mb-8">
        <LearningStatBlock number={skillsEnrolled.toString()} label="Skills\nEnrolled" />
        <LearningStatBlock number={skillsCompleted.toString()} label="Skills\nCompleted" />
        <LearningStatBlock number={creditsEarned.toString()} label="Credits\nEarned" />
      </div>

      {loading ? (
        <div className="w-full flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 border-4 border-[#AEC279] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--primary)]/50 text-sm font-medium">Loading My Learning...</span>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="w-full h-[100px] flex items-center justify-center">
          <span className="text-white/50 text-sm">No skills enrolled yet</span>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {/* Continue Learning */}
          {enrollments.filter(s => !(s.completed || s.roadmapCompleted)).length > 0 && (
            <div className="w-full mb-8">
              <h2 className="text-white text-sm font-bold tracking-[1px] mb-4 uppercase">
                Continue Learning
              </h2>
              <div className="w-full overflow-x-auto hide-scrollbar flex pb-2 space-x-4">
                {enrollments.filter(s => !(s.completed || s.roadmapCompleted)).map(enrollment => {
                  const skill = skillsDict[enrollment.skillId];
                  if (!skill) return null;
                  
                  return (
                    <div key={enrollment.skillId} className="w-[280px] shrink-0">
                      <ContinueLearningCardLarge
                        category={skill.category}
                        title={skill.title}
                        progress={enrollment.progress}
                        onContinue={() => router.push(`/learning/${skill.id}`)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enrolled Skills */}
          <div className="w-full mb-8">
            <h2 className="text-white text-sm font-bold tracking-[1px] mb-4 uppercase">
              Enrolled Skills
            </h2>
            <div className="w-full flex flex-col space-y-4">
              {enrollments.map(enrollment => {
                const skill = skillsDict[enrollment.skillId];
                if (!skill) return null;
                
                return (
                  <EnrolledSkillRow
                    key={enrollment.skillId}
                    title={skill.title}
                    progress={enrollment.progress}
                    onPlay={() => router.push(`/learning/${skill.id}`)}
                  />
                );
              })}
            </div>
          </div>

          {/* Completed Skills */}
          {skillsCompleted > 0 && (
            <div className="w-full mb-8">
              <h2 className="text-white text-sm font-bold tracking-[1px] mb-4 uppercase">
                Completed Skills
              </h2>
              <div className="w-full flex flex-col space-y-4">
                {enrollments.filter(s => s.completed || s.roadmapCompleted).map(enrollment => {
                  const skill = skillsDict[enrollment.skillId];
                  if (!skill) return null;
                  
                  return (
                    <CompletedSkillRow
                      key={enrollment.skillId}
                      title={skill.title}
                    />
                  );
                })}
              </div>
            </div>
          )}
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
