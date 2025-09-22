import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Reward } from '../types';
import { mockTouristUser, mockGuideUser, mockAdminUser } from '../services/mockData';
import { 
  auth,
  db, 
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
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  redeemReward: (reward: Reward) => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createNewUserProfile = (firebaseUser: FirebaseUser, name?: string): User => {
  return {
    ...mockTouristUser, // Use as a template for default values
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: name || firebaseUser.displayName || 'New Traveler',
    avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200/200`,
    role: 'user',
    status: 'active',
  };
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(firebaseInitializationError);

  useEffect(() => {
    try {
      const mockUserSession = localStorage.getItem('mockUser') || sessionStorage.getItem('mockUser');
      if (mockUserSession) {
        setUser(JSON.parse(mockUserSession));
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("Could not parse mock user session", e);
      localStorage.removeItem('mockUser'); 
      sessionStorage.removeItem('mockUser');
    }

    if (!auth || !db) {
        setLoading(false);
        return;
    }

    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      // Clean up previous user's doc listener before setting up a new one
      unsubscribeUserDoc?.();

      if (firebaseUser) {
        setLoading(true);
        const userDocRef = db.collection('users').doc(firebaseUser.uid);
        
        // --- REAL-TIME LISTENER FOR USER PROFILE ---
        // This subscription ensures the user object in the app is always
        // in sync with the database.
        unsubscribeUserDoc = userDocRef.onSnapshot(
          (doc) => {
            if (doc.exists) {
              setUser({ id: doc.id, ...doc.data() } as User);
            } else {
              console.warn(`No profile found for user ${firebaseUser.uid}, creating one.`);
              const newUserProfile = createNewUserProfile(firebaseUser);
              userDocRef.set(newUserProfile).catch(setErr => {
                console.error("Failed to create new user profile:", setErr);
                setError("Could not create your user profile.");
              });
              // The listener will automatically set the user state with the new profile.
            }
            setLoading(false);
          },
          (err) => {
            console.error("Error listening to user document:", err);
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
    const demoPassword = 'password123';

    const isDemoAdmin = email === mockAdminUser.email && password === demoPassword;
    const isDemoGuide = email === mockGuideUser.email && password === demoPassword;
    const isDemoTourist = email === mockTouristUser.email && password === demoPassword;

    if (isDemoAdmin || isDemoGuide || isDemoTourist) {
      let mockUser;
      if (isDemoAdmin) mockUser = mockAdminUser;
      else if (isDemoGuide) mockUser = mockGuideUser;
      else mockUser = mockTouristUser;

      try {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
      } catch (e) {
         setError('Failed to create a demo session. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!auth) {
        const authError = "Authentication service is unavailable due to a configuration error.";
        setError(authError);
        setLoading(false);
        throw new Error(authError);
    }

    try {
      await auth.setPersistence(rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    if (email === mockAdminUser.email || email === mockGuideUser.email || email === mockTouristUser.email) {
        const errMessage = "This email is reserved for a demo account. Please use a different email to sign up.";
        setError(errMessage);
        setLoading(false);
        throw new Error(errMessage);
    }

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
      // The real-time listener will now set the user state.

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const isMockUser = localStorage.getItem('mockUser') || sessionStorage.getItem('mockUser');
      if (isMockUser) {
        localStorage.removeItem('mockUser');
        sessionStorage.removeItem('mockUser');
        setUser(null);
      } else if (auth) {
        await auth.signOut();
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) throw new Error("No user is signed in to update.");
    
    const mockUserSession = localStorage.getItem('mockUser') || sessionStorage.getItem('mockUser');
    if (mockUserSession) {
        const updatedUser = { ...user, ...updatedData };
        const storage = localStorage.getItem('mockUser') ? localStorage : sessionStorage;
        storage.setItem('mockUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return;
    }

    if (!db) {
        setError("Cannot update profile. Database is not connected.");
        throw new Error("Database not connected");
    }

    try {
      const userDocRef = db.collection('users').doc(user.id);
      await userDocRef.update(updatedData);
      // State will update automatically via the onSnapshot listener.
    } catch (error) {
      console.error("Error updating user profile:", error);
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
