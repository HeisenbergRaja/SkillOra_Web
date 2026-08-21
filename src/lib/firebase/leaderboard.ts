import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './config';

export interface LeaderboardUser {
  userId: string;
  displayName: string;
  profileImageUrl: string | null;
  totalCreditsEarned: number;
  skillsCompleted: number;
  rank: number;
  dept: string;
  isCurrent: boolean;
}

export const subscribeToLeaderboard = (
  sortBy: 'credits' | 'skills',
  currentUserId: string | null | undefined,
  callback: (users: LeaderboardUser[]) => void
) => {
  const field = sortBy === 'credits' ? 'totalCreditsEarned' : 'skillsCompleted';
  
  const q = query(
    collection(db, 'users'),
    orderBy(field, 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const users: LeaderboardUser[] = [];
    let currentRank = 1;
    let prevValue = -1;
    let usersAtSameRank = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const userId = doc.id;
      const name = data.name || 'Anonymous';
      const avatar = data.profileImageUrl || null;
      const credits = data.totalCreditsEarned || 0;
      const skills = data.skillsCompleted || 0;
      const dept = data.dept || '';

      const currentValue = sortBy === 'credits' ? credits : skills;

      if (currentValue !== prevValue) {
        currentRank += usersAtSameRank;
        usersAtSameRank = 1;
      } else {
        usersAtSameRank++;
      }
      prevValue = currentValue;

      users.push({
        userId,
        displayName: name,
        profileImageUrl: avatar,
        totalCreditsEarned: credits,
        skillsCompleted: skills,
        rank: currentRank,
        dept,
        isCurrent: userId === currentUserId,
      });
    });

    callback(users);
  }, (error) => {
    console.error("Error subscribing to leaderboard:", error);
    callback([]);
  });
};
