"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, getRedirectResult, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';
import { UserProfile } from '@/types/user';
import { createUserProfileIfMissing, subscribeToUserProfile } from '@/lib/firebase/user';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: true,
  signInWithGoogle: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Error with Google redirect sign-in", error);
      }
    };
    handleRedirect();

    let unsubscribeProfile: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        setProfileLoading(true);
        try {
          await createUserProfileIfMissing(currentUser);
          unsubscribeProfile = subscribeToUserProfile(currentUser.uid, (newProfile) => {
            setProfile(newProfile);
            setProfileLoading(false);
          });
        } catch (error) {
          console.error("Error loading user profile", error);
          setProfileLoading(false);
        }
      } else {
        setProfile(null);
        setProfileLoading(false);
        if (unsubscribeProfile) {
          unsubscribeProfile();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
