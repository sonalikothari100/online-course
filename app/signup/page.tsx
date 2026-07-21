"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, User, Mail, ChevronRight, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/db';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      db.initialize();
      const users = db.getUsers();
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      if (exists) {
        setError('This email has already requested access. Please contact Sonali to get your password.');
        setIsSubmitting(false);
        return;
      }

      const pendingLead = {
        id: `user-${Date.now()}`,
        email: email,
        fullName: fullName,
        password: '',
        role: 'lead' as const,
        points: 0,
        streak: 0,
        badges: [],
        completedLessons: []
      };

      const updatedUsers = [...users, pendingLead];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-peachAccent/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-plumAccent/5 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl border border-cardBorder shadow-xl relative z-10">
        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight font-display text-textPrimary">
              Request Submitted!
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              Your registration request has been sent to Sonali Kothari. Once approved, she will create your password credentials and notify you.
            </p>
            <div className="pt-4">
              <Link href="/" className="text-plumAccent hover:underline font-semibold text-xs flex items-center justify-center gap-1">
                Back to Home page
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plumAccent/10 text-plumAccent">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight font-display text-textPrimary">
                Request Access Link
              </h2>
              <p className="mt-2 text-sm text-textSecondary">
                Submit details to get private portal credentials
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl text-left">
                ⚠️ {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="full-name" className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-2 text-left">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-textSecondary">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      id="full-name"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-cardBorder rounded-xl bg-white text-textPrimary placeholder-textSecondary/70 focus:outline-none focus:border-plumAccent focus:ring-1 focus:ring-plumAccent transition-all text-sm shadow-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email-address" className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-2 text-left">
                    Your Email Address
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
              </div>

              <div className="text-xs text-textSecondary bg-slate-50 border border-cardBorder p-3 rounded-xl leading-relaxed text-left">
                <strong>Important:</strong> Accounts are locked upon submission. Only Sonali Kothari can activate your credentials. Once active, your login details will be shared.
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex w-full justify-center rounded-xl bg-plumAccent px-4 py-3.5 text-sm font-semibold text-white hover:bg-plumAccent/90 focus:outline-none focus:ring-2 focus:ring-plumAccent focus:ring-offset-2 focus:ring-offset-background transition-all font-display items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isSubmitting ? 'Submitting request...' : 'Send Access Request'}
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-white" />
                </button>
              </div>
            </form>

            <div className="text-center text-xs text-textSecondary pt-4 border-t border-cardBorder">
              <p>
                Have active login credentials?{' '}
                <Link href="/login" className="text-plumAccent hover:underline font-semibold">
                  Login Here
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
