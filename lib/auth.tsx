"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, User } from './db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (fullName: string, email: string, password?: string) => Promise<boolean>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.initialize();
    const storedUserId = localStorage.getItem('current_user_id');
    if (storedUserId) {
      const foundUser = db.getUser(storedUserId);
      if (foundUser) {
        setUser(foundUser);
        // Automatically check/update daily login streak on active session load
        db.triggerStreakLogin(foundUser.id);
        const updatedUser = db.getUser(foundUser.id);
        if (updatedUser) setUser(updatedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = db.getUsers();
    // Validate both email and password match in the local database
    const foundUser = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      return false; // Authentication failed
    }

    localStorage.setItem('current_user_id', foundUser.id);
    setUser(foundUser);
    db.triggerStreakLogin(foundUser.id);
    const refreshed = db.getUser(foundUser.id);
    if (refreshed) setUser(refreshed);
    return true;
  };

  const signup = async (fullName: string, email: string, password?: string): Promise<boolean> => {
    const users = db.getUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const newStudent: User = {
      id: `user-${Date.now()}`,
      email: email,
      fullName: fullName,
      password: password || 'student123', // Admin specified password or default
      role: 'student', // Defaults to student enrollment
      points: 10, // Start with welcome points
      streak: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],
      badges: ['first_step'], // First step badge automatically unlocked on signup
      completedLessons: []
    };

    const allUsers = [...users, newStudent];
    localStorage.setItem('users', JSON.stringify(allUsers));
    return true; // Return true to indicate account created (no autologin for admin actions)
  };

  const logout = () => {
    localStorage.removeItem('current_user_id');
    setUser(null);
  };

  const refreshUser = () => {
    if (user) {
      const refreshed = db.getUser(user.id);
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
