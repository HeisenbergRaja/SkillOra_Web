export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  dept: string;
  college: string;
  credits: number;
  totalCreditsEarned: number;
  skillsCompleted: number;
  skillsCreated: number;
  skillsEnrolled: number;
  rank: number;
}
