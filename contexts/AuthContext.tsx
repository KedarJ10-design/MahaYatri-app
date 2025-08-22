import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { User } from '../types';
import { getUserProfileByEmail } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoUser: (userProfile: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Gracefully handle missing Firebase configuration by enabling Demo Mode
    if (!auth) {
      setIsDemoMode(true);
      setLoading(false);
      return () => {}; // Return an empty function for cleanup
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      setError(null);
      if (firebaseUser && firebaseUser.email) {
        // Find the corresponding rich user profile from our mock data
        const userProfile = getUserProfileByEmail(firebaseUser.email);
        if (userProfile) {
          setUser(userProfile);
        } else {
          // In a real app, you might create a new user profile here.
          // For this app, we create a default tourist profile.
          const defaultTouristProfile: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New Tourist',
              email: firebaseUser.email,
              avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200/200`,
              preferences: [],
              emergencyContact: { name: '', phone: '' },
              isPro: false,
              points: 0,
              unlockedGuideIds: [],
              role: 'user',
          }
          setUser(defaultTouristProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (isDemoMode || !auth) {
      setError("Cannot sign in: Firebase is not configured correctly.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting the user
    } catch (err: any) {
      console.error("Firebase sign-in error:", err);
      setError(err.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  };
  
  const signInAsDemoUser = (userProfile: User) => {
    if (!isDemoMode) return;
    setLoading(true);
    setError(null);
    setUser(userProfile);
    setLoading(false);
  }

  const signOutUser = async () => {
    if (isDemoMode) {
        setUser(null);
        return;
    }
    if (!auth) {
        setError("Cannot sign out: Firebase is not configured correctly.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle clearing the user
    } catch (err: any)
    {
      console.error("Firebase sign-out error:", err);
      setError(err.message || 'Failed to sign out.');
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isDemoMode,
    signInWithGoogle,
    signInAsDemoUser,
    signOut: signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
