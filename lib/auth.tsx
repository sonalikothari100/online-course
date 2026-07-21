"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, User, Badge, BADGES } from './db';
import { auth, firestore } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (fullName: string, email: string, password?: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize DB (Seeding default courses/testimonials in Firestore)
    db.initialize().catch(console.error);

    // 2. Track Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch Firestore profile document
        let foundUser = await db.getUser(firebaseUser.uid);
        
        if (!foundUser) {
          // Fallback: If user is authenticated in Firebase Auth but has no Firestore doc, create a default student
          const todayStr = new Date().toISOString().split('T')[0];
          foundUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || 'Student',
            role: 'student',
            points: 10,
            streak: 1,
            lastLoginDate: todayStr,
            badges: ['first_step'],
            completedLessons: []
          };
          await db.updateUser(foundUser);
        } else {
          // Trigger daily login streak logic
          await db.triggerStreakLogin(firebaseUser.uid);
          // Reload user after streak calculation
          const refreshed = await db.getUser(firebaseUser.uid);
          if (refreshed) foundUser = refreshed;
        }
        
        setUser(foundUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Admin Auto-Registration Check:
      // If logging in as admin and it is the first time (does not exist in Firebase Auth),
      // we auto-create the account to preserve out-of-the-box local login functionality.
      if (email.toLowerCase() === 'sonali@kothari.com' && password === 'sonaliadmin123') {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          return true;
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            // Auto-signup the default admin account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const adminUser: User = {
              id: userCredential.user.uid,
              email: email,
              fullName: 'Sonali Kothari',
              role: 'admin',
              points: 1000,
              streak: 15,
              badges: ['first_step', 'streaker', 'super_student'],
              completedLessons: []
            };
            await db.updateUser(adminUser);
            // Re-authenticate
            await signInWithEmailAndPassword(auth, email, password);
            return true;
          }
          throw signInErr;
        }
      }

      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Authentication Error:', error);
      return false;
    }
  };

  const signup = async (fullName: string, email: string, password?: string): Promise<boolean> => {
    try {
      const studentPassword = password || 'student123';

      // Use a secondary Firebase app instance to create the user.
      // This prevents the Admin's active login session from being overwritten/logged out.
      const secondaryApp = initializeApp(auth.app.options, 'SecondaryAdminApp');
      const secondaryAuth = auth.app.options ? getAuth(secondaryApp) : auth;

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        email, 
        studentPassword
      );

      const newStudent: User = {
        id: userCredential.user.uid,
        email: email,
        fullName: fullName,
        role: 'student',
        points: 10,
        streak: 1,
        lastLoginDate: new Date().toISOString().split('T')[0],
        badges: ['first_step'],
        completedLessons: []
      };

      // Write user profile to Firestore
      await db.updateUser(newStudent);

      // Sign out from the secondary instance and delete it
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      return true;
    } catch (error) {
      console.error('Registration Error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const refreshed = await db.getUser(auth.currentUser.uid);
      if (refreshed) setUser(refreshed);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
