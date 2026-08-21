"use client";

import React, { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnrolledProgressCard } from '@/components/learning/EnrolledProgressCard';
import { RoadmapNodeSmall } from '@/components/learning/RoadmapNodeSmall';
import { EnrolledResourceCard } from '@/components/learning/EnrolledResourceCard';
import { ArrowLeft, CheckCircle, Trophy, Lock, ChevronRight, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserEnrollments, getSkillById, updateEnrollmentProgress } from '@/lib/firebase/skills';
import { Enrollment, Skill } from '@/types/skill';

export default function EnrolledSkillPage({ params }: { params: Promise<{ skillId: string }> }) {
  const router = useRouter();
  const { skillId } = use(params);
  const { user, profile } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch skill data
    if (skillId) {
      getSkillById(skillId).then((data) => {
        setSkill(data);
        if (!user) setLoading(false);
      }).catch(console.error);
    }
  }, [skillId, user]);

  useEffect(() => {
    // Subscribe to enrollment data
    if (!user || !skillId) return;

    const unsubscribe = subscribeToUserEnrollments(user.uid, (enrollments) => {
      const currentEnrollment = enrollments.find(e => e.skillId === skillId);
      setEnrollment(currentEnrollment || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, skillId]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4 pt-20">
        <div className="w-8 h-8 border-4 border-[#AEC279] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white/50 text-sm">Loading learning content...</span>
      </div>
    );
  }

  if (!enrollment || !skill) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white p-6">
        Skill not found
      </div>
    );
  }

  const roadmapData = skill.roadmap || [];
  const completedDays = enrollment.completedDays || 0;
  const totalTopics = roadmapData.length || 1; // Prevent div by zero
  const progressPercent = enrollment.progress || 0;
  const isCompleted = enrollment.completed || enrollment.roadmapCompleted;

  const handleMarkComplete = async () => {
    if (isSaving || !user || !currentDay) return;
    setIsSaving(true);
    try {
      await updateEnrollmentProgress(user.uid, skillId, currentDay.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const currentDay = completedDays < roadmapData.length ? roadmapData[completedDays] : null;

  return (
    <div className="w-full min-h-full pb-24 pt-6 px-6">
      {/* Header */}
      <div className="flex w-full justify-between items-center pb-6">
        <div className="flex items-center space-x-3 flex-1">
          <button onClick={() => router.back()} className="text-white shrink-0 hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold line-clamp-1 max-w-[200px]">
            {skill.title}
          </h1>
        </div>
        <div className="flex items-center space-x-1 bg-[#AEC279] rounded-[20px] px-3 py-1 shrink-0">
          <span className="text-[#20271E] text-[11px] font-bold">
            {profile?.credits || 0} Credits
          </span>
        </div>
      </div>

      <EnrolledProgressCard 
        percent={progressPercent} 
        completed={completedDays} 
        total={totalTopics} 
      />

      <div className="mt-8 mb-5">
        <h2 className="text-white text-base font-bold">Learning Roadmap</h2>
      </div>

      <div className="w-full flex flex-col">
        {roadmapData.map((day, index) => {
          let status: 'done' | 'active' | 'locked' = 'locked';
          if (index < completedDays) status = 'done';
          else if (index === completedDays) status = 'active';

          return (
            <RoadmapNodeSmall
              key={day.id}
              dayNumber={day.dayNumber}
              title={day.title}
              status={status}
              isLast={index === totalTopics - 1}
            />
          );
        })}
      </div>

      {currentDay ? (
        <div className="w-full mt-8">
          <h2 className="text-white text-base font-bold mb-4">
            Day {currentDay.dayNumber} Resources
          </h2>

          <div className="flex flex-col w-full">
            {currentDay.fileResources?.map((res, i) => (
              <EnrolledResourceCard
                key={`file-${i}`}
                title={res.title}
                type="file"
                onClick={() => {
                  if (res.url) {
                    window.open(res.url, '_blank', 'noopener,noreferrer');
                  }
                }}
              />
            ))}
            {currentDay.videoResources?.map((res, i) => (
              <EnrolledResourceCard
                key={`video-${i}`}
                title={res.title}
                type="video"
                onClick={() => {
                  if (res.url) {
                    window.open(res.url, '_blank', 'noopener,noreferrer');
                  }
                }}
              />
            ))}
          </div>

          <button
            onClick={handleMarkComplete}
            disabled={isSaving}
            className="w-full h-14 bg-[#AEC279] text-[#20271E] font-bold text-base rounded-2xl flex items-center justify-center mt-6 hover:bg-[#9AB063] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center space-x-2">
                <span className="w-5 h-5 border-2 border-[#20271E]/30 border-t-[#20271E] rounded-full animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Mark as Complete</span>
              </span>
            )}
          </button>
        </div>
      ) : isCompleted ? (
        <div className="w-full mt-8 bg-[#AEC279]/10 rounded-2xl p-6 flex flex-col items-center justify-center">
          <Trophy className="text-[#AEC279] w-12 h-12 mb-4" />
          <h2 className="text-[#AEC279] text-xl font-bold mb-1">Roadmap Completed!</h2>
          {enrollment.completed && (
            <>
              <span className="text-white text-base mb-1">Final Score: {enrollment.finalQuizScore || 0}%</span>
              <span className="text-[var(--primary)] text-sm">+ {skill.completionCredits} Credits Earned</span>
            </>
          )}
        </div>
      ) : null}

      <div className="w-full mt-8 mb-4">
        <h2 className="text-white text-base font-bold">Final Assessment</h2>
      </div>

      <div 
        onClick={() => {
          if (isCompleted) {
            router.push(`/learning/${skillId}/quiz`);
          }
        }}
        className={`w-full rounded-2xl p-5 border flex items-center justify-between transition-colors
          ${isCompleted 
            ? 'bg-[#3F483A]/50 border-[var(--primary)] cursor-pointer hover:bg-[#3F483A]' 
            : 'bg-[#3F483A]/20 border-transparent cursor-not-allowed'}`}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center
            ${isCompleted ? 'bg-[var(--primary)]' : 'bg-white/5'}`}
          >
            {isCompleted ? (
              <CheckCircle className="text-white w-6 h-6" />
            ) : (
              <Lock className="text-white/30 w-6 h-6" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-base font-bold ${isCompleted ? 'text-white' : 'text-white/40'}`}>
              Final Quiz
            </span>
            <span className={`text-xs ${isCompleted ? 'text-white/60' : 'text-white/30'}`}>
              {enrollment.completed ? `Passed with ${enrollment.finalQuizScore}%` : (isCompleted ? 'Ready to take' : 'Complete all days to unlock')}
            </span>
          </div>
        </div>
        {isCompleted && (
          <ChevronRight className="text-[#AEC279] w-4 h-4" />
        )}
      </div>

      <div className="w-full flex space-x-4 mt-8">
        <div 
          onClick={() => router.push(`/chat?skillId=${skillId}`)}
          className="flex-1 bg-[#3F483A]/30 border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-[#3F483A]/50 transition-colors"
        >
          <MessageSquare className="text-white/80 w-6 h-6 mb-3" />
          <h3 className="text-white text-sm font-bold">Chat Creator</h3>
          <span className="text-white/60 text-[11px]">Ask {skill.creatorName}</span>
        </div>
        <div className="flex-1" />
      </div>
    </div>
  );
}
