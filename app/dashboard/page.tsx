"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { db, Course, BADGES, Testimonial } from '@/lib/db';
import Link from 'next/link';
import { 
  Flame, Award, Compass, LogOut, BookOpen, Lock, 
  MessageSquare, Sparkles, Send, CheckCircle, ChevronRight, UserCheck, Search, ChevronDown 
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [communityFeed, setCommunityFeed] = useState<Testimonial[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'In Progress' | 'Completed' | 'Paid'>('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    db.initialize();
    setCourses(db.getCourses());
    
    // Load breakthroughs feed
    const feed = db.getTestimonials().filter(t => t.approved);
    setCommunityFeed(feed);
  }, [user, router]);

  if (!user) return null;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    db.addTestimonial({
      clientName: user.fullName,
      textContent: newPost,
      rating: 5,
      role: user.role === 'admin' ? 'Coach' : 'Academy Student'
    });

    user.points += 20; // +20 XP for breakthrough
    
    if (!user.badges.includes('breakthrough_queen')) {
      user.badges.push('breakthrough_queen');
    }
    
    db.updateUser(user);
    refreshUser();

    setNewPost('');
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      setCommunityFeed(db.getTestimonials().filter(t => t.approved));
    }, 1500);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Check if course is premium-locked for this user
  const isCourseLocked = (courseId: string) => {
    if (user.role === 'admin' || user.role === 'student') return false;
    return courseId !== 'course-free'; // Leads only get access to free portal kit
  };

  // Calculate course completion percentage
  const getCourseProgress = (course: Course) => {
    const courseLessons = course.modules.flatMap(m => m.lessons);
    if (courseLessons.length === 0) return 0;
    
    const completedCount = courseLessons.filter(l => user.completedLessons.includes(l.id)).length;
    return Math.round((completedCount / courseLessons.length) * 100);
  };

  // Filter and Search Courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const locked = isCourseLocked(course.id);
    const matchesCategory = selectedCategory === 'All Categories' || 
                            (selectedCategory === 'Premium' && locked) ||
                            (selectedCategory === 'Free Access' && !locked);

    const progress = getCourseProgress(course);
    let matchesTab = true;
    if (activeFilter === 'In Progress') {
      matchesTab = progress > 0 && progress < 100;
    } else if (activeFilter === 'Completed') {
      matchesTab = progress === 100;
    } else if (activeFilter === 'Paid') {
      matchesTab = locked; 
    }

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="min-h-screen bg-background text-textPrimary relative pb-16 font-sans">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-cardBorder bg-white/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-plumAccent animate-spin-slow" />
            <span className="font-display font-bold text-base tracking-wider text-textPrimary uppercase">
              Sonali Kothari Academy
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {user.role === 'admin' && (
              <Link 
                href="/admin" 
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-plumAccent/10 text-plumAccent border border-plumAccent/30 hover:bg-plumAccent/20 transition-all font-display"
              >
                Go to Admin
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-textSecondary" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Welcome Banner & Streaks Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Welcome User Card */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-cardBorder flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-peachAccent/10 blur-xl pointer-events-none animate-pulse" />
            <div className="h-16 w-16 rounded-full bg-plumAccent/10 flex items-center justify-center text-plumAccent font-display text-2xl font-bold border border-plumAccent/20 uppercase shrink-0">
              {user.fullName.substring(0, 2)}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-textPrimary">
                Namaste, {user.fullName}!
              </h2>
              <p className="text-xs text-textSecondary leading-relaxed font-display">
                {user.role === 'admin' 
                  ? 'Welcome to your master administration dashboard.' 
                  : 'Your daily nervous system calibration is waiting. Step into alignment.'}
              </p>
              <div className="pt-2 flex items-center gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-plumAccent/10 text-plumAccent text-[10px] font-bold border border-plumAccent/25">
                  <UserCheck className="h-3 w-3" /> Account Role: {user.role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Calming Daily Streaks & Points block (Inspired by Daily Yoga) */}
          <div className="glass-panel p-6 rounded-2xl border border-cardBorder flex items-center justify-around relative">
            <div className="flex flex-col items-center space-y-1">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/25 flex items-center justify-center relative group">
                <Flame className="h-6 w-6 animate-pulse" />
                <span className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {user.streak}
                </span>
              </div>
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Streak</span>
              <span className="text-xs font-bold text-textPrimary">{user.streak} Days</span>
            </div>

            <div className="h-10 w-px bg-cardBorder" />

            <div className="flex flex-col items-center space-y-1">
              <div className="h-12 w-12 rounded-full bg-peachAccent/15 text-plumAccent border border-peachAccent/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-plumAccent" />
              </div>
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Points</span>
              <span className="text-xs font-bold text-textPrimary">{user.points} XP</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Badges Collection Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4 flex items-center gap-1.5 text-left">
            <Award className="h-4 w-4 text-peachAccent" /> Earned Academy Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = user.badges.includes(badge.id);
              return (
                <div 
                  key={badge.id} 
                  className={`p-4 rounded-xl border flex flex-col items-center text-center justify-center space-y-2 transition-all duration-300 ${
                    isUnlocked 
                      ? 'border-peachAccent/40 bg-white shadow-sm peach-glow' 
                      : 'border-cardBorder opacity-40 grayscale'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-peachAccent">
                    <Award className="h-5 w-5" />
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

      {/* 4. Full-Width Courses Search, Filter & 3-Column Grid Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Title & Search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <h2 className="text-3xl font-bold font-display text-textPrimary">Courses</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl justify-end">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-textSecondary" />
              <input
                type="text"
                placeholder="search by course title or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-cardBorder rounded-xl text-xs text-textPrimary placeholder-textSecondary/70 focus:outline-none focus:border-plumAccent focus:ring-1 focus:ring-plumAccent transition-all shadow-sm"
              />
            </div>
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-cardBorder rounded-xl pl-4 pr-10 py-3 text-xs text-textPrimary focus:outline-none focus:border-plumAccent font-semibold shadow-sm cursor-pointer min-w-[160px]"
              >
                <option value="All">Course</option>
                <option value="Free Access">Free Access</option>
                <option value="Premium">Premium Tiers</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-textSecondary pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-wrap gap-2 text-left">
          {(['All', 'In Progress', 'Completed', 'Paid'] as const).map((filter) => {
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'border-plumAccent bg-plumAccent/10 text-plumAccent font-bold' 
                    : 'border-cardBorder bg-white text-textSecondary hover:border-textSecondary/50 hover:text-textPrimary'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const locked = isCourseLocked(course.id);
            const percent = getCourseProgress(course);
            const totalLessons = course.modules.flatMap(m => m.lessons).length;

            return (
              <div 
                key={course.id}
                className="bg-white rounded-3xl border border-cardBorder shadow-sm p-4 hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left group relative"
              >
                <div>
                  {/* Poster Image */}
                  <div className="aspect-video w-full rounded-2xl bg-background overflow-hidden relative mb-4 border border-cardBorder">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    
                    {/* Locked Premium overlay */}
                    {locked && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-2">
                        <Lock className="h-6 w-6 text-peachAccent mb-1" />
                        <span className="text-[9px] font-bold text-peachAccent tracking-wider uppercase">Premium Course</span>
                      </div>
                    )}
                  </div>

                  {/* Badges / Status Info */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                      {course.modules.length} sections &bull; {totalLessons} lectures
                    </span>
                    {!locked && percent === 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-peachAccent/15 text-plumAccent text-[8px] font-bold uppercase tracking-wider border border-peachAccent/30">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Title & Author */}
                  <h4 className="font-display font-bold text-base text-textPrimary leading-snug group-hover:text-plumAccent transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-xs text-textSecondary mt-1">Sonali Kothari</p>
                </div>

                {/* Bottom actions and Progress */}
                <div className="mt-4 pt-3 border-t border-cardBorder">
                  {/* Progress tracker bar */}
                  {!locked && (
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between items-center text-[10px] font-bold text-textSecondary">
                        <span>Progress</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA Actions */}
                  {locked ? (
                    <Link 
                      href="/#identity-kit"
                      className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-cardBorder text-textSecondary rounded-xl text-xs font-semibold text-center font-display tracking-wide block transition-all"
                    >
                      Request Upgrade
                    </Link>
                  ) : (
                    <Link 
                      href={`/dashboard/course/${course.id}`}
                      className="w-full py-3 bg-plumAccent text-white hover:bg-plumAccent/90 rounded-xl text-xs font-bold text-center font-display tracking-wide block transition-all shadow-sm"
                    >
                      {percent > 0 ? 'Continue' : 'Start learning'}
                    </Link>
                  )}
                </div>

              </div>
            );
          })}

          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white border border-dashed border-cardBorder rounded-2xl text-xs text-textSecondary">
              📭 No courses matched your filters or search keywords.
            </div>
          )}
        </div>

      </section>

      {/* 5. Breakthrough Share & Community Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-cardBorder mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          
          {/* Feed List (Cols 7) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-plumAccent" /> Breakthrough Feed
            </h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {communityFeed.map((post) => (
                <div key={post.id} className="p-4 bg-white border border-cardBorder rounded-xl space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-display text-[10px] text-textPrimary">{post.clientName}</span>
                    <span className="px-2 py-0.5 rounded bg-plumAccent/10 text-plumAccent text-[8px] font-bold uppercase tracking-wider">
                      {post.role}
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed italic">
                    "{post.textContent}"
                  </p>
                </div>
              ))}
              {communityFeed.length === 0 && (
                <p className="text-xs text-textSecondary italic py-8 text-center bg-white border border-dashed border-cardBorder rounded-xl">No breakthrough posts active.</p>
              )}
            </div>
          </div>

          {/* Share form (Cols 5) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-plumAccent animate-pulse" /> Share Your Breakthrough
            </h3>
            
            <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-4">
              <form onSubmit={handlePostSubmit} className="space-y-3">
                <textarea
                  placeholder="Had a realization or win today? Share it with the sisters..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full bg-white border border-cardBorder rounded-xl p-3 text-xs text-textPrimary placeholder-textSecondary/70 focus:outline-none focus:border-plumAccent h-24 resize-none transition-all shadow-sm"
                />
                
                {postSuccess && (
                  <div className="text-[10px] font-semibold text-emerald-655 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Win posted successfully! +20 XP awarded.
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-textSecondary flex items-center gap-1">
                    🎁 Wins reward 20 XP
                  </span>
                  <button
                    type="submit"
                    disabled={!newPost.trim()}
                    className="px-4 py-2 bg-plumAccent text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold hover:bg-plumAccent/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    Share Post
                    <Send className="h-3 w-3 text-white" />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
