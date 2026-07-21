"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        const currentUser = JSON.parse(localStorage.getItem('users') || '[]')
          .find((u: any) => u.email.toLowerCase() === email.toLowerCase());

        if (currentUser && currentUser.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Invalid email address or password. Please verify your credentials.');
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative brand blur elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-peachAccent/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-plumAccent/5 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl border border-cardBorder shadow-xl relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plumAccent/10 text-plumAccent">
            <Compass className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight font-display text-textPrimary">
            Academy Login
          </h2>
          <p className="mt-2 text-sm text-textSecondary">
            Sign in with the credentials provided by Sonali
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl text-left">
            ⚠️ {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-2 text-left">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-textSecondary">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-cardBorder rounded-xl bg-white text-textPrimary placeholder-textSecondary/70 focus:outline-none focus:border-plumAccent focus:ring-1 focus:ring-plumAccent transition-all text-sm shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-2 text-left">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-textSecondary">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-cardBorder rounded-xl bg-white text-textPrimary placeholder-textSecondary/70 focus:outline-none focus:border-plumAccent focus:ring-1 focus:ring-plumAccent transition-all text-sm shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-textSecondary flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-peachAccent" />
              Private Student Access Only
            </span>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-xl bg-plumAccent px-4 py-3.5 text-sm font-semibold text-white hover:bg-plumAccent/90 focus:outline-none focus:ring-2 focus:ring-plumAccent focus:ring-offset-2 focus:ring-offset-background transition-all font-display items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-white" />
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-textSecondary pt-4 border-t border-cardBorder">
          <p className="mb-2 font-medium">
            Default credentials for testing:
          </p>
          <p className="font-mono text-[10px] text-plumAccent font-bold">
            Admin: sonali@kothari.com / sonaliadmin123
          </p>
          <p className="font-mono text-[10px] text-plumAccent font-bold mt-1">
            Student: student@example.com / student123
          </p>
        </div>
      </div>
    </div>
  );
}
