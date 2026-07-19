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

      // Add to database as a pending "lead" with a temporary locked status (no password yet)
      const pendingLead = {
        id: `user-${Date.now()}`,
        email: email,
        fullName: fullName,
        password: '', // Locked - Admin must assign password in admin panel
        role: 'lead' as const, // Lead role (does not have full course access)
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
      {/* Background calibration lights */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-tealAccent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-goldAccent/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl border border-cardBorder/60 shadow-2xl relative z-10">
        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight font-display text-textPrimary">
              Request Submitted!
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              Your registration request has been sent to Sonali Kothari. Once approved, she will create your password credentials and notify you.
            </p>
            <div className="pt-4">
              <Link href="/" className="text-tealAccent hover:underline font-semibold text-xs flex items-center justify-center gap-1">
                Back to Home page
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tealAccent/10 text-tealAccent">
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
              <div className="p-3 text-xs bg-red-950/40 border border-red-500/30 text-red-300 rounded-md">
                {error}
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
                      className="block w-full pl-10 pr-3 py-3 border border-cardBorder rounded-lg bg-background/60 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-tealAccent focus:ring-1 focus:ring-tealAccent transition-all text-sm"
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
                      className="block w-full pl-10 pr-3 py-3 border border-cardBorder rounded-lg bg-background/60 text-textPrimary placeholder-textSecondary focus:outline-none focus:border-tealAccent focus:ring-1 focus:ring-tealAccent transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-textSecondary bg-cardBg/40 border border-cardBorder/40 p-3 rounded-lg leading-relaxed text-left">
                <strong>Important:</strong> Accounts are locked upon submission. Only Sonali Kothari can activate your credentials. Once active, your login details will be shared.
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex w-full justify-center rounded-lg bg-tealAccent px-4 py-3 text-sm font-semibold text-background hover:bg-tealAccent/80 focus:outline-none focus:ring-2 focus:ring-tealAccent focus:ring-offset-2 focus:ring-offset-background transition-all font-display items-center gap-1 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting request...' : 'Send Access Request'}
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            <div className="text-center text-xs text-textSecondary pt-4 border-t border-cardBorder/40">
              <p>
                Have active login credentials?{' '}
                <Link href="/login" className="text-tealAccent hover:underline font-semibold">
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
