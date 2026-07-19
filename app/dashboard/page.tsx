"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { db, Course, BADGES, Testimonial } from '@/lib/db';
import Link from 'next/link';
import { 
  Flame, Award, Compass, LogOut, BookOpen, Lock, 
  MessageSquare, Sparkles, Send, CheckCircle, ChevronRight, UserCheck 
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [communityFeed, setCommunityFeed] = useState<Testimonial[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    db.initialize();
    setCourses(db.getCourses());
    
    // In our community feed, we display approved breakthroughs
    const feed = db.getTestimonials().filter(t => t.approved);
    setCommunityFeed(feed);
  }, [user, router]);

  if (!user) return null;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    // Add testimonial to database as student breakthrough
    db.addTestimonial({
      clientName: user.fullName,
      textContent: newPost,
      rating: 5,
      role: user.role === 'admin' ? 'Coach' : 'Academy Student'
    });

    // Reward points for sharing breakthrough
    user.points += 20; // +20 points for breakthrough posting
    
    // Check if breakthrough_queen badge is unlocked
    if (!user.badges.includes('breakthrough_queen')) {
      user.badges.push('breakthrough_queen');
    }
    
    db.updateUser(user);
    refreshUser();

    setNewPost('');
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      // Reload feed
      setCommunityFeed(db.getTestimonials().filter(t => t.approved));
    }, 1500);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Helper to check if a specific course is locked for the user
  const isCourseLocked = (courseId: string) => {
    if (user.role === 'admin' || user.role === 'student') return false;
    // Leads only get access to specific free items
    return courseId !== 'course-free'; 
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary relative pb-16">
      {/* 1. Dashboard Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-cardBorder/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-tealAccent animate-spin-slow" />
            <span className="font-display font-bold text-base tracking-wider text-textPrimary uppercase">
              Sonali Kothari Academy
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {user.role === 'admin' && (
              <Link 
                href="/admin" 
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-goldAccent/10 text-goldAccent border border-goldAccent/30 hover:bg-goldAccent/15 transition-all"
              >
                Go to Admin
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Welcome & Daily Yoga Gamified Stats Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Welcome User Card */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-cardBorder/60 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-tealAccent/5 blur-xl pointer-events-none" />
            <div className="h-16 w-16 rounded-full bg-tealAccent/15 flex items-center justify-center text-tealAccent font-display text-2xl font-bold border border-tealAccent/30 uppercase">
              {user.fullName.substring(0, 2)}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-textPrimary">
                Namaste, {user.fullName}!
              </h2>
              <p className="text-xs text-textSecondary leading-relaxed">
                {user.role === 'admin' 
                  ? 'Welcome to your master administration dashboard.' 
                  : 'Your daily nervous system calibration is waiting. Step into alignment.'}
              </p>
              <div className="pt-2 flex items-center gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tealAccent/10 text-tealAccent text-[10px] font-bold border border-tealAccent/20">
                  <UserCheck className="h-3 w-3" /> Account Role: {user.role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Calming Daily Streaks & Points block (Inspired by Daily Yoga) */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder/60 flex items-center justify-around relative">
            <div className="flex flex-col items-center space-y-1">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25 flex items-center justify-center relative group">
                <Flame className="h-6 w-6 animate-pulse" />
                <span className="absolute top-[-5px] right-[-5px] bg-orange-500 text-background text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {user.streak}
                </span>
              </div>
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Streak</span>
              <span className="text-sm font-bold text-textPrimary">{user.streak} Days</span>
            </div>

            <div className="h-10 w-px bg-cardBorder/60" />

            <div className="flex flex-col items-center space-y-1">
              <div className="h-12 w-12 rounded-full bg-goldAccent/10 text-goldAccent border border-goldAccent/25 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Points</span>
              <span className="text-sm font-bold text-textPrimary">{user.points} XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Badges Gallery Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder/60">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-goldAccent" /> Earned Academy Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = user.badges.includes(badge.id);
              return (
                <div 
                  key={badge.id} 
                  className={`p-4 rounded-xl border flex flex-col items-center text-center justify-center space-y-2 transition-all duration-300 ${
                    isUnlocked 
                      ? `${badge.color} bg-background/40 shadow-lg gold-glow` 
                      : 'border-cardBorder/40 opacity-40 grayscale'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-[11px] text-textPrimary tracking-tight">{badge.name}</h4>
                    <p className="text-[9px] text-textSecondary leading-snug">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Main Body: Course Library + Community Win-Share Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Course Curriculum Library */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-tealAccent" /> Your Learning Curriculum
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {courses.map((course) => {
              const locked = isCourseLocked(course.id);
              return (
                <div 
                  key={course.id} 
                  className="glass-panel overflow-hidden rounded-2xl border border-cardBorder/60 flex flex-col md:flex-row hover:border-cardBorder transition-all shadow-md group relative"
                >
                  {/* Thumbnail */}
                  <div className="w-full md:w-48 h-36 relative bg-cardBg overflow-hidden">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {locked && (
                      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-2">
                        <Lock className="h-6 w-6 text-goldAccent mb-1" />
                        <span className="text-[10px] font-bold text-goldAccent tracking-wider uppercase">Premium Course</span>
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="font-display font-bold text-base text-textPrimary leading-snug">{course.title}</h4>
                      <p className="text-xs text-textSecondary leading-relaxed mt-1.5 line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-cardBorder/40 mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-textSecondary uppercase flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-tealAccent" /> 
                        {course.modules.length} Modules &bull; {course.modules.flatMap(m => m.lessons).length} Sessions
                      </span>

                      {locked ? (
                        <Link 
                          href="/#identity-kit"
                          className="px-3 py-1.5 bg-goldAccent/10 text-goldAccent border border-goldAccent/30 rounded-lg text-xs font-semibold hover:bg-goldAccent/15 transition-all"
                        >
                          Request Upgrade
                        </Link>
                      ) : (
                        <Link 
                          href={`/dashboard/course/${course.id}`}
                          className="px-4 py-1.5 bg-tealAccent text-background rounded-lg text-xs font-bold hover:bg-tealAccent/80 transition-all font-display flex items-center gap-1 cursor-pointer"
                        >
                          Enter Course
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Community win-share Social feed */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-tealAccent" /> Breakthrough Feed
          </h3>

          <div className="glass-panel p-5 rounded-2xl border border-cardBorder/60 space-y-4">
            
            {/* Share win form */}
            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  placeholder="Had a realization or win today? Share it with the sisters..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full bg-background/50 border border-cardBorder rounded-xl p-3 text-xs text-textPrimary placeholder-textSecondary focus:outline-none focus:border-tealAccent h-20 resize-none transition-all"
                />
              </div>

              {postSuccess && (
                <div className="text-[10px] font-semibold text-success flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Post shared +20 points earned!
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-textSecondary flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-goldAccent" /> Wins reward 20 XP
                </span>
                <button
                  type="submit"
                  disabled={!newPost.trim()}
                  className="px-3 py-1.5 bg-tealAccent text-background disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold hover:bg-tealAccent/80 transition-all flex items-center gap-1 cursor-pointer"
                >
                  Share Post
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </form>

            <div className="h-px bg-cardBorder/40 my-2" />

            {/* Feed stream */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {communityFeed.map((post) => (
                <div key={post.id} className="p-3 bg-background/40 border border-cardBorder/30 rounded-xl space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-display text-[10px] text-textPrimary">{post.clientName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-tealAccent/10 text-tealAccent text-[8px] font-bold uppercase">
                      {post.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary leading-relaxed italic">
                    "{post.textContent}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
