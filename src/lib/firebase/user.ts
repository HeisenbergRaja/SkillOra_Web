import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from '@/types/user';
import { User } from 'firebase/auth';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const createUserProfileIfMissing = async (user: User): Promise<void> => {
  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const defaultProfile: UserProfile = {
        userId: user.uid,
        name: user.displayName || 'Anonymous',
        email: user.email || '',
        profileImageUrl: user.photoURL || null,
        dept: 'Student',
        college: 'Skillora Academy',
        credits: 0,
        totalCreditsEarned: 0,
        skillsCompleted: 0,
        skillsCreated: 0,
        skillsEnrolled: 0,
        rank: 0,
      };

      // Use merge: true to avoid overwriting existing data by accident
      await setDoc(docRef, defaultProfile, { merge: true });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const subscribeToUserProfile = (uid: string, callback: (profile: UserProfile | null) => void) => {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in user profile subscription:', error);
    callback(null);
  });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
