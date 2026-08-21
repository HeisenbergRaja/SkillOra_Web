"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Plus, Copy } from 'lucide-react';
import { UploadLabel } from '@/components/upload/UploadLabel';
import { UploadTextField } from '@/components/upload/UploadTextField';
import { RoadmapDayCard } from '@/components/upload/RoadmapDayCard';
import { useAuth } from '@/contexts/AuthContext';
import { createSkill } from '@/lib/firebase/skills';
import { FinalQuiz } from '@/types/quiz';
import { QuizReviewDialog } from '@/components/upload/QuizReviewDialog';

interface RoadmapDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  isExpanded: boolean;
}

export default function UploadSkillPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('20');
  const [selectedCategory, setSelectedCategory] = useState('Programming');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  const categories = ['Programming', 'Design', 'Business', 'AI & ML', 'Cloud'];
  
  const [roadmap, setRoadmap] = useState<RoadmapDay[]>([
    { id: '1', dayNumber: 1, title: '', description: '', isExpanded: true }
  ]);
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // AI Quiz Generation State
  const [questionCount, setQuestionCount] = useState('10');
  const [passingScore, setPassingScore] = useState('70');
  const [pastedQuizPrompt, setPastedQuizPrompt] = useState('');
  const [validatedQuiz, setValidatedQuiz] = useState<FinalQuiz | null>(null);
  const [quizStatus, setQuizStatus] = useState('NOT_GENERATED');
  const [showQuizReview, setShowQuizReview] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');

  const validate = () => {
    if (!title.trim()) return "Please enter a skill title";
    if (!description.trim()) return "Please enter a description";
    const parsedCredits = parseInt(credits);
    if (isNaN(parsedCredits) || parsedCredits <= 0) return "Credits to Buy must be a valid positive number";
    if (roadmap.length === 0) return "Please add at least one roadmap day";
    
    for (const day of roadmap) {
      if (!day.title.trim() || !day.description.trim()) {
        return `Please fill in all details for Day ${day.dayNumber}`;
      }
    }

    if (quizStatus !== 'APPROVED') return "Please approve the AI-generated quiz first.";
    
    return null;
  };

  const handleCopyPrompt = () => {
    const promptText = `==================================================
RESOURCE ANALYSIS PROMPT
==================================================
Skill: ${title}
Target: ${questionCount} Questions

TASK:
Analyze the course resources and roadmap.
Create a compact, self-contained QUIZ GENERATION PROMPT.
Include all key facts, definitions, and concepts needed to generate ${questionCount} MCQs.
Do NOT generate the quiz yet.
Return ONLY the self-contained prompt text.
==================================================`;
    navigator.clipboard.writeText(promptText);
    alert('Resource analysis prompt copied.');
  };

  const handleGenerateQuiz = async () => {
    if (!user) return;
    if (!pastedQuizPrompt.trim()) {
      setError("Please paste a self-contained quiz prompt.");
      return;
    }
    const count = parseInt(questionCount);
    if (isNaN(count) || count < 1 || count > 20) {
      setError("Question count must be between 1 and 20.");
      return;
    }
    const passScore = parseInt(passingScore);
    if (isNaN(passScore) || passScore < 0 || passScore > 100) {
      setError("Passing score must be between 0 and 100.");
      return;
    }

    setError('');
    setGenerationPhase('Generating quiz locally...');

    try {
      // In the web app, we save a draft or generate without saving first.
      // But the Next.js API requires a skillId to fetch context. Wait, the API requires a created skill.
      // Since this is during upload, the skill doesn't exist yet!
      // This is a crucial difference. I need to modify the generation to pass data directly.
      // Let's check how the web API works. It expects skillId to fetch data from Firestore.
      // BUT for "Upload Skill", there's no skillId yet. 
      // I will send the prompt directly or create a draft. But Android passes the prompt directly.
      
      const response = await fetch('/api/quiz/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: pastedQuizPrompt,
          questionCount: count,
          title: title
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      
      if (data.quiz) {
        setValidatedQuiz({
          ...data.quiz,
          passingScore: passScore
        });
        setQuizStatus('GENERATED');
        setShowQuizReview(true);
        setSuccessMessage('Quiz Generated Successfully ✓');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      console.error(err);
      let displayMsg = "Quiz generation stopped before the quiz was complete. Please try again.";
      if (err.message.includes('JSON')) displayMsg = "The local AI returned an invalid quiz. Please try again.";
      if (err.message.includes('unavailable')) displayMsg = "Local AI engine failed to generate the quiz.";
      setError(displayMsg);
    } finally {
      setGenerationPhase('');
    }
  };

  const handlePublish = async () => {
    setError('');
    
    if (!user || !profile) {
      setError('You must be logged in to upload a skill.');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsPublishing(true);
    
    try {
      await createSkill(
        {
          title,
          description,
          whatYoullLearn: '',
          category: selectedCategory,
          creditsRequired: parseInt(credits),
          roadmap: roadmap.map(day => ({
            id: day.id,
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            fileResources: [],
            videoResources: []
          })),
          finalQuiz: validatedQuiz ? { ...validatedQuiz, status: "PUBLISHED" } : null
        },
        user.uid,
        profile.name || "Anonymous"
      );

      setSuccessMessage('Skill published successfully!');
      
      setTimeout(() => {
        router.push('/marketplace');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to publish skill');
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full min-h-full pb-24 pt-6 px-6">
      <div className="flex w-full pb-6 items-center">
        <button onClick={() => router.back()} className="mr-4 text-[var(--primary)]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-[var(--primary)] text-xl font-bold text-center">Upload Skill</h1>
        <div className="bg-[#AEC279] rounded-full px-3 py-1">
          <span className="text-[#20271E] text-[11px] font-bold">{profile?.credits || 0} Credits</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-[#AEC279]/20 border border-[#AEC279]/50 text-[#AEC279] p-3 rounded-xl mb-6 text-sm font-bold text-center">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <div>
          <UploadLabel text="Skill Title" />
          <UploadTextField value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kotlin Coroutines" />
        </div>

        <div>
          <UploadLabel text="Description" />
          <UploadTextField value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this skill..." isTextArea />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <UploadLabel text="Category" />
            <div 
              className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-4 flex items-center justify-between cursor-pointer"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <span className="text-white text-sm">{selectedCategory}</span>
              <ChevronDown className="text-white w-5 h-5" />
            </div>
            
            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--background)] border border-white/10 rounded-xl overflow-hidden z-50 max-h-[200px] overflow-y-auto">
                {categories.map(cat => (
                  <div key={cat} className="px-4 py-3 text-white text-sm hover:bg-white/5 cursor-pointer" onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false); }}>
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <UploadLabel text="Credits to Buy" />
            <UploadTextField value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="e.g. 50" />
          </div>
        </div>

        <div className="mt-8 mb-2">
          <h2 className="text-white font-bold">Roadmap</h2>
        </div>

        <div className="flex flex-col space-y-4">
          {roadmap.map((day, idx) => (
            <RoadmapDayCard
              key={day.id} dayNumber={day.dayNumber} title={day.title} description={day.description} isExpanded={day.isExpanded}
              onTitleChange={(v) => { const n = [...roadmap]; n[idx].title = v; setRoadmap(n); }}
              onDescriptionChange={(v) => { const n = [...roadmap]; n[idx].description = v; setRoadmap(n); }}
              onToggleExpand={() => { const n = [...roadmap]; n[idx].isExpanded = !n[idx].isExpanded; setRoadmap(n); }}
              onDelete={() => { const n = roadmap.filter(d => d.id !== day.id); n.forEach((d, i) => { d.dayNumber = i + 1; }); setRoadmap(n); }}
            />
          ))}
        </div>

        <button 
          onClick={() => { setRoadmap([...roadmap, { id: Math.random().toString(), dayNumber: roadmap.length + 1, title: '', description: '', isExpanded: true }]); }}
          className="w-full border-2 border-dashed border-white/20 rounded-2xl py-4 flex items-center justify-center space-x-2 mt-4 hover:border-white/40 transition-colors text-white/70 hover:text-white"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-sm">Add Day</span>
        </button>

        <div className="mt-8 mb-2">
          <h2 className="text-white font-bold uppercase">AI Quiz Generation</h2>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <UploadLabel text="Questions / Count" />
            <UploadTextField value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} placeholder="10" />
          </div>
          <div className="flex-1">
            <UploadLabel text="Passing Score (%)" />
            <UploadTextField value={passingScore} onChange={(e) => setPassingScore(e.target.value)} placeholder="70" />
          </div>
        </div>

        <button 
          onClick={handleCopyPrompt}
          className="w-full h-14 bg-[var(--gray-green)] rounded-[14px] flex items-center justify-center font-bold text-black text-sm transition-colors mt-4"
        >
          1. Get Resource Analysis Prompt
        </button>

        <div className="mt-2">
          <UploadTextField 
            value={pastedQuizPrompt} 
            onChange={(e) => setPastedQuizPrompt(e.target.value)} 
            placeholder="2. Paste self-contained quiz prompt here..." 
            isTextArea 
          />
          <p className="text-gray-400 text-xs mt-1">Hint: Paste the self-contained quiz prompt generated by an external AI.</p>
        </div>

        {generationPhase ? (
          <button 
            onClick={() => setGenerationPhase('')}
            className="w-full h-14 bg-red-500 rounded-[14px] flex items-center justify-center font-bold text-white text-sm transition-colors mt-4"
          >
            {generationPhase}
          </button>
        ) : (
          <button 
            onClick={handleGenerateQuiz}
            className="w-full h-14 bg-[var(--avatar-bg)] rounded-[14px] flex items-center justify-center font-bold text-black text-sm transition-colors mt-4 hover:bg-[#9AB063]"
          >
            3. Generate Quiz Locally
          </button>
        )}

        <div className="w-full p-2 mt-4">
          <h4 className="text-gray-400 text-xs font-bold uppercase">Local AI</h4>
          <p className="text-white text-sm">Qwen3 1.7B</p>
          <p className="text-green-400 text-xs font-bold">Status: READY</p>
        </div>

        {validatedQuiz && (
          <div className="w-full bg-[var(--gray-green)]/20 rounded-2xl p-4 mt-4">
            <p className="text-[var(--primary)] font-bold text-sm">Quiz Status: {quizStatus}</p>
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={() => setShowQuizReview(true)}
                className="flex-1 bg-[var(--avatar-bg)] text-black font-medium py-2 rounded-xl text-sm"
              >
                Review/Edit
              </button>
              <button 
                onClick={() => setQuizStatus('APPROVED')}
                className="flex-1 bg-white/10 text-white font-medium py-2 rounded-xl text-sm hover:bg-white/20 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        )}

        <div className="pt-8">
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full h-14 rounded-[14px] flex items-center justify-center font-bold text-base transition-colors ${
              isPublishing
                ? 'bg-[var(--primary)]/50 text-[var(--background)]/50 cursor-not-allowed' 
                : 'bg-[var(--primary)] text-[var(--background)] hover:bg-[#9AB063]'
            }`}
          >
            {isPublishing ? 'Publishing...' : 'Publish Skill'}
          </button>
        </div>
      </div>

      {showQuizReview && validatedQuiz && (
        <QuizReviewDialog 
          quiz={validatedQuiz}
          skillTitle={title}
          onDismiss={() => setShowQuizReview(false)}
          onSave={(q) => {
            setValidatedQuiz(q);
            setQuizStatus('APPROVED');
          }}
          onRegenerate={handleGenerateQuiz}
        />
      )}
    </div>
  );
}
