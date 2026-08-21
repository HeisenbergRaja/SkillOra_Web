export interface ResourceLink {
  id: string;
  title: string;
  url: string;
}

export interface RoadmapDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  fileResources: ResourceLink[];
  videoResources: ResourceLink[];
  // isExpanded is excluded in Android Firestore model, but useful for UI state
}

export interface FinalQuiz {
  createdBy: string;
  updatedAt: number;
  // Let's keep it simple or add fields if known
  [key: string]: any;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  whatYoullLearn: string;
  category: string;
  creditsRequired: number;
  completionCredits: number;
  creatorId: string;
  creatorName: string;
  createdAt: number;
  updatedAt: number;
  status: string;
  requestedSkillId?: string | null;
  roadmap: RoadmapDay[];
  finalQuiz?: FinalQuiz | null;
  // To match the UI requirements if they exist on Android but are missing from the model
  thumbnail?: string; // Often added to skills dynamically or handled separately
}

export interface DayProgress {
  dayId: string;
  completed: boolean;
  completedAt?: number;
}

export interface Enrollment {
  userId: string;
  skillId: string;
  enrolledAt: number;
  totalDays: number;
  completedDays: number;
  progress: number;
  dayProgress: DayProgress[];
  roadmapCompleted: boolean;
  completed: boolean;
  completedAt?: number;
  quizPassed: boolean;
  finalQuizScore?: number;
  finalQuizAttemptId?: string;
  completionRewardClaimed?: boolean;
}
