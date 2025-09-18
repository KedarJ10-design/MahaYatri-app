import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { mockTouristUser, mockGuideUser, mockAdminUser } from '../services/mockData';
// FIX: Updated imports to match the v8 namespaced API provided by the modified firebase.ts.
import { 
  auth,
  db, 
  browserLocalPersistence,
  browserSessionPersistence,
  type FirebaseUser
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

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

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = db.collection('users').doc(firebaseUser.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
            // This is an edge case for users who existed in Auth but not Firestore.
            // We create a profile for them on-the-fly.
            console.warn(`No profile found for user ${firebaseUser.uid}, creating one.`);
            const newUserProfile = createNewUserProfile(firebaseUser);
            await userDocRef.set(newUserProfile);
            setUser(newUserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
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

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      if (!firebaseUser) throw new Error("User creation failed.");

      // Create and save the new user's profile to Firestore
      const newUserProfile = createNewUserProfile(firebaseUser, name);
      await db.collection('users').doc(firebaseUser.uid).set(newUserProfile);
      
      // The onAuthStateChanged listener will automatically pick up the new user,
      // but we can set it here for a faster UI update.
      setUser(newUserProfile);

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
      } else {
        await auth.signOut();
        // The onAuthStateChanged listener will set the user to null
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
    
    // Handle mock user update in local/session storage
    const mockUserSession = localStorage.getItem('mockUser') || sessionStorage.getItem('mockUser');
    if (mockUserSession) {
        const updatedUser = { ...user, ...updatedData };
        const storage = localStorage.getItem('mockUser') ? localStorage : sessionStorage;
        storage.setItem('mockUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return;
    }

    // Handle real user update in Firestore
    try {
      const userDocRef = db.collection('users').doc(user.id);
      await userDocRef.update(updatedData);
      setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, ...updatedData };
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      setError("Failed to update profile. Please try again.");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut: signOutUser,
    updateUser,
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