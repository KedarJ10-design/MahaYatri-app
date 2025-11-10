import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Reward } from '../types';
import { 
  auth,
  db, 
  googleProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  type FirebaseUser,
  firebaseInitializationError
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  redeemReward: (reward: Reward) => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createNewUserProfile = (firebaseUser: FirebaseUser, name?: string): User => {
  // A default new user profile template
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: name || firebaseUser.displayName || 'New Traveler',
    avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200/200`,
    role: 'user',
    status: 'active',
    preferences: [],
    emergencyContact: { name: '', phone: '' },
    isPro: false,
    points: 0,
    unlockedGuideIds: [],
    redeemedRewardIds: [],
    hasPendingApplication: false,
    wishlist: [],
    followingGuideIds: [],
    friends: [],
  };
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(firebaseInitializationError);

  useEffect(() => {
    if (!auth || !db) {
        setLoading(false);
        return;
    }

    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      unsubscribeUserDoc?.();

      if (firebaseUser) {
        setLoading(true);
        const userDocRef = db.collection('users').doc(firebaseUser.uid);
        
        unsubscribeUserDoc = userDocRef.onSnapshot(
          (doc) => {
            if (doc.exists) {
              setUser({ id: doc.id, ...doc.data() } as User);
            } else {
              // This handles the case where a user signs in with Google for the first time
              // but their document hasn't been created yet.
              const newUserProfile = createNewUserProfile(firebaseUser);
              userDocRef.set(newUserProfile).catch(setErr => {
                setError("Could not create your user profile.");
              });
            }
            setLoading(false);
          },
          (err) => {
            setError("Could not load your profile data.");
            setUser(null);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserDoc?.();
    };
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    setError(null);

    if (!auth) {
        const authError = "Authentication service is unavailable due to a configuration error.";
        setError(authError);
        setLoading(false);
        throw new Error(authError);
    }

    try {
      await auth.setPersistence(rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred during sign-in.';
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    if (!auth || !db) {
        const authError = "Google Sign-In is unavailable due to a configuration error.";
        setError(authError);
        setLoading(false);
        throw new Error(authError);
    }
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const isNewUser = result.additionalUserInfo?.isNewUser;
        const firebaseUser = result.user;

        if (isNewUser && firebaseUser) {
            const newUserProfile = createNewUserProfile(firebaseUser);
            await db.collection('users').doc(firebaseUser.uid).set(newUserProfile);
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred during Google sign-in.';
        setError(message);
        setLoading(false);
        throw err;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    if (!auth || !db) {
        const authError = "Sign up is unavailable due to a configuration error.";
        setError(authError);
        setLoading(false);
        throw new Error(authError);
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      if (!firebaseUser) throw new Error("User creation failed.");

      const newUserProfile = createNewUserProfile(firebaseUser, name);
      await db.collection('users').doc(firebaseUser.uid).set(newUserProfile);

    } catch (err: unknown)
 {
      const message = err instanceof Error ? err.message : 'An unknown error occurred during sign-up.';
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      if (auth) {
        await auth.signOut();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred during sign-out.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user || !db) throw new Error("No user is signed in to update.");

    try {
      const userDocRef = db.collection('users').doc(user.id);
      await userDocRef.update(updatedData);
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      throw error;
    }
  };
  
  const redeemReward = async (reward: Reward) => {
      if (!user || user.points < reward.pointsRequired) {
          throw new Error("Cannot redeem reward.");
      }
      const updatedUserData = { 
        points: user.points - reward.pointsRequired,
        redeemedRewardIds: [...user.redeemedRewardIds, reward.id]
      };
      await updateUser(updatedUserData);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut: signOutUser,
    signInWithGoogle,
    updateUser,
    redeemReward,
    error,
    setError,
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