"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSkillById, subscribeToUserEnrollments, enrollInSkill } from '@/lib/firebase/skills';
import { Skill, Enrollment } from '@/types/skill';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Star, School, Clock, CreditCard } from 'lucide-react';

import { quizService } from '@/services/quizService';

export default function SkillDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const skillId = params.id as string;
  const [skill, setSkill] = useState<Skill | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');
  
  // Quiz Generation State
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizGenerationSuccess, setQuizGenerationSuccess] = useState(false);
  const [quizGenerationError, setQuizGenerationError] = useState('');

  useEffect(() => {
    if (!skillId) return;

    getSkillById(skillId).then((fetchedSkill) => {
      setSkill(fetchedSkill);
      setLoading(false);
    }).catch(console.error);
  }, [skillId]);

  useEffect(() => {
    if (!user || !skillId) return;

    const unsubscribe = subscribeToUserEnrollments(user.uid, (enrollments) => {
      const currentEnrollment = enrollments.find(e => e.skillId === skillId);
      setEnrollment(currentEnrollment || null);
    });

    return () => unsubscribe();
  }, [user, skillId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-[#AEC279] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[var(--primary)]/50 text-sm font-medium">Loading skill details...</span>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <span className="text-[var(--primary)] text-xl font-bold">Skill Not Found</span>
        <button 
          onClick={() => router.back()}
          className="bg-[#AEC279]/20 text-[#AEC279] px-6 py-2 rounded-xl font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isCreator = skill.creatorId === user?.uid;
  const isPurchased = !!enrollment;
  const isCompleted = enrollment?.completed;

  let buttonText = "Enroll for " + skill.creditsRequired + " Credits";
  if (isCreator) {
    buttonText = "Your Skill";
  } else if (isPurchased) {
    buttonText = isCompleted ? "Completed" : "Continue Learning";
  }

  const handleEnroll = async () => {
    if (isCreator) return;
    if (isPurchased) {
      // Continue Learning / Completed -> In a real app this routes to learning page
      router.push(`/mylearning`);
      return;
    }
    
    if (!user) {
      alert("Please login to enroll.");
      return;
    }

    try {
      setIsEnrolling(true);
      setError('');
      await enrollInSkill(user.uid, skill.id, skill.creditsRequired);
      // After success, the subscription will automatically update the enrollment state
      alert("Successfully enrolled!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to enroll');
      alert(err.message || 'Failed to enroll');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!skill) return;
    setIsGeneratingQuiz(true);
    setQuizGenerationError('');
    setQuizGenerationSuccess(false);

    try {
      await quizService.generateQuiz(skill.id);
      setQuizGenerationSuccess(true);
    } catch (err: any) {
      console.error(err);
      setQuizGenerationError(err.message || 'Generation failed');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="w-full min-h-full pb-32">
      {/* Header Image Area */}
      <div className="w-full h-64 bg-[#E7E9E6]/10 relative">
        {skill.thumbnail ? (
          <img src={skill.thumbnail} alt={skill.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <School className="text-[var(--primary)]/30 w-24 h-24" />
          </div>
        )}
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 -mt-8 relative z-10">
        {/* Main Info Card */}
        <div className="w-full bg-[#252D21] rounded-[24px] p-6 shadow-xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#AEC279] text-xs font-bold uppercase tracking-wider">{skill.category}</span>
            <div className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-full">
              <Star className="text-[#AEC279] w-3 h-3" />
              <span className="text-white/80 text-xs font-semibold">New</span>
            </div>
          </div>
          
          <h1 className="text-white text-2xl font-bold leading-tight mb-2">{skill.title}</h1>
          <p className="text-white/60 text-sm mb-6">By <span className="text-white/90 font-medium">{skill.creatorName}</span></p>

          <div className="flex items-center space-x-6 pb-6 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <CreditCard className="text-white/40 w-4 h-4" />
              <span className="text-white/80 text-sm">{skill.creditsRequired} Credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="text-white/40 w-4 h-4" />
              <span className="text-white/80 text-sm">{skill.roadmap.length || 0} Days</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-white text-base font-bold mb-2">Description</h3>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
              {skill.description || "No description provided."}
            </p>
          </div>

          {/* What You'll Learn */}
          <div className="mt-8">
            <h3 className="text-white text-base font-bold mb-2">What you'll learn</h3>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
              {skill.whatYoullLearn || "No learning objectives specified."}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#20271E] border-t border-white/5 md:hidden z-50 flex flex-col space-y-4">
        {quizGenerationError && (
          <div className="text-red-400 text-sm font-medium text-center">{quizGenerationError}</div>
        )}
        {isCreator && (
          <button
            className="w-full py-4 rounded-2xl flex items-center justify-center transition-colors font-bold text-lg disabled:opacity-50"
            style={{ backgroundColor: '#AEC279', color: '#20271E' }}
            disabled={isGeneratingQuiz || quizGenerationSuccess || !!skill.finalQuiz}
            onClick={handleGenerateQuiz}
          >
            {skill.finalQuiz ? 'Quiz Already Generated' : isGeneratingQuiz ? 'Generating Quiz...' : quizGenerationSuccess ? 'Quiz Generated' : 'Generate Quiz'}
          </button>
        )}
        <button
          className="w-full py-4 rounded-2xl flex items-center justify-center transition-colors font-bold text-lg disabled:opacity-50"
          style={{
            backgroundColor: isCreator || isPurchased ? '#E7E9E633' : '#AEC279',
            color: isCreator || isPurchased ? 'white' : '#20271E'
          }}
          disabled={isCreator || isEnrolling}
          onClick={handleEnroll}
        >
          {isEnrolling ? 'Enrolling...' : buttonText}
        </button>
      </div>
      
      {/* Desktop Bottom Bar (for non-mobile views) */}
      <div className="hidden md:flex flex-col items-end p-6 mt-4 max-w-4xl mx-auto space-y-4">
        {quizGenerationError && (
          <div className="text-red-400 text-sm font-medium">{quizGenerationError}</div>
        )}
        <div className="flex space-x-4">
          {isCreator && (
            <button
              className="w-auto px-10 py-4 rounded-2xl flex items-center justify-center transition-colors font-bold text-lg disabled:opacity-50"
              style={{ backgroundColor: '#AEC279', color: '#20271E' }}
              disabled={isGeneratingQuiz || quizGenerationSuccess || !!skill.finalQuiz}
              onClick={handleGenerateQuiz}
            >
              {skill.finalQuiz ? 'Quiz Already Generated' : isGeneratingQuiz ? 'Generating Quiz...' : quizGenerationSuccess ? 'Quiz Generated' : 'Generate Quiz'}
            </button>
          )}
          <button
            className="w-auto px-10 py-4 rounded-2xl flex items-center justify-center transition-colors font-bold text-lg disabled:opacity-50"
            style={{
              backgroundColor: isCreator || isPurchased ? '#E7E9E633' : '#AEC279',
              color: isCreator || isPurchased ? 'white' : '#20271E'
            }}
            disabled={isCreator || isEnrolling}
            onClick={handleEnroll}
          >
          {isEnrolling ? 'Enrolling...' : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
