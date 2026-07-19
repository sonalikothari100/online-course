"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { db, Course, Lesson, Module, BADGES, Badge } from '@/lib/db';
import Link from 'next/link';
import { 
  ChevronLeft, Play, CheckCircle, FileDown, 
  MessageSquare, Sparkles, Trophy, Award, ArrowRight, BookOpen, Send, Clock, CircleDot
} from 'lucide-react';

interface Params {
  params: {
    id: string;
  };
}

export default function CoursePlayerPage({ params }: Params) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'resources' | 'comments' | 'breakthrough' | 'rewards'>('resources');
  
  // Custom tab inputs
  const [comments, setComments] = useState<{ id: string; name: string; text: string; date: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [breakthroughText, setBreakthroughText] = useState('');
  const [isSimulatingVideoRecord, setIsSimulatingVideoRecord] = useState(false);
  const [breakthroughSuccess, setBreakthroughSuccess] = useState(false);

  // Auto-advance and reward states
  const [countdown, setCountdown] = useState<number | null>(null);
  const [rewardNotification, setRewardNotification] = useState<{ points: number; badge?: Badge } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    db.initialize();
    const coursesList = db.getCourses();
    const foundCourse = coursesList.find(c => c.id === params.id);
    
    if (!foundCourse) {
      router.push('/dashboard');
      return;
    }

    // Security Check: If a 'lead' tries to access a premium course, block them
    if (user.role !== 'admin' && user.role !== 'student' && foundCourse.id !== 'course-free') {
      router.push('/dashboard');
      return;
    }

    setCourse(foundCourse);

    // Default to the first lesson in the first module
    if (foundCourse.modules.length > 0 && foundCourse.modules[0].lessons.length > 0) {
      setActiveLesson(foundCourse.modules[0].lessons[0]);
    }
  }, [user, params.id, router]);

  // Load custom comments for the active lesson
  useEffect(() => {
    if (activeLesson) {
      setComments([
        { id: 'c-1', name: 'Neha Patel', text: 'This lesson was exactly what I needed today. Calming and grounding.', date: 'Yesterday' },
        { id: 'c-2', name: 'Aishwarya Nair', text: 'Struggled a bit with writing down my triggers, but completed the worksheet. Feeling lighter!', date: '2 days ago' }
      ]);
      setNewComment('');
      setBreakthroughText('');
      setBreakthroughSuccess(false);
      setCountdown(null);
    }
  }, [activeLesson]);

  // Countdown timer effect for auto-advance
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      loadNextLesson();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  if (!user || !course || !activeLesson) return null;

  // Calculate percentage of course completed
  const allLessons = course.modules.flatMap(m => m.lessons);
  const completedCount = allLessons.filter(l => user.completedLessons.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);

  const handleLessonSelect = (lesson: Lesson) => {
    setCountdown(null);
    setActiveLesson(lesson);
  };

  // Triggers video completion points and fires the auto-advance countdown
  const handleSimulateVideoCompletion = () => {
    if (user.completedLessons.includes(activeLesson.id)) {
      // Already completed, just proceed to auto-advance countdown
      triggerAutoAdvance();
      return;
    }

    const result = db.completeLesson(user.id, activeLesson.id);
    refreshUser();

    if (result.pointsAdded > 0) {
      setRewardNotification({
        points: result.pointsAdded,
        badge: result.newBadgeUnlocked || undefined
      });
      // Hide reward popup after 4 seconds
      setTimeout(() => {
        setRewardNotification(null);
        triggerAutoAdvance();
      }, 4000);
    } else {
      triggerAutoAdvance();
    }
  };

  const triggerAutoAdvance = () => {
    // Find next lesson
    const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
      setCountdown(3); // Start 3-second countdown
    }
  };

  const loadNextLesson = () => {
    const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIdx + 1]);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: `comm-${Date.now()}`,
      name: user.fullName,
      text: newComment,
      date: 'Just now'
    };

    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  const handleBreakthroughSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakthroughText.trim()) return;

    db.addTestimonial({
      clientName: user.fullName,
      textContent: `[Win on Lesson: ${activeLesson.title}] ${breakthroughText}`,
      rating: 5,
      role: 'Academy Student'
    });

    user.points += 20; // +20 points for sharing breakthrough
    if (!user.badges.includes('breakthrough_queen')) {
      user.badges.push('breakthrough_queen');
    }
    db.updateUser(user);
    refreshUser();

    setBreakthroughText('');
    setBreakthroughSuccess(true);
    setTimeout(() => setBreakthroughSuccess(false), 2500);
  };

  const handleRecordVideoBreakthrough = () => {
    setIsSimulatingVideoRecord(true);
    setTimeout(() => {
      setIsSimulatingVideoRecord(false);
      db.addTestimonial({
        clientName: user.fullName,
        textContent: `[Video Win on Lesson: ${activeLesson.title}] Shared direct camera video breakthrough.`,
        videoUrl: 'https://www.youtube.com/embed/EngW7tLk6R8', // Mock video
        rating: 5,
        role: 'Academy Student'
      });

      user.points += 30; // +30 points for video breakthroughs
      if (!user.badges.includes('breakthrough_queen')) {
        user.badges.push('breakthrough_queen');
      }
      db.updateUser(user);
      refreshUser();

      setBreakthroughSuccess(true);
      setTimeout(() => setBreakthroughSuccess(false), 2500);
    }, 3000); // 3 seconds camera simulation
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary relative flex flex-col">
      {/* 1. Header */}
      <header className="h-16 border-b border-cardBorder/40 bg-background/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-cardBg rounded-lg text-textSecondary hover:text-textPrimary transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-left">
            <span className="text-[10px] font-bold text-tealAccent uppercase tracking-widest block">Active Course</span>
            <h1 className="font-display font-bold text-sm sm:text-base text-textPrimary truncate max-w-[200px] sm:max-w-md">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Dynamic Progress indicator */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <span className="text-xs font-semibold text-textSecondary">{progressPercent}% Completed</span>
            <div className="w-32 bg-cardBorder h-1.5 rounded-full overflow-hidden mt-1 border border-cardBorder/30">
              <div 
                className="bg-tealAccent h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="h-8 w-px bg-cardBorder/40 hidden md:block" />
          <div className="flex items-center gap-1 bg-goldAccent/10 text-goldAccent border border-goldAccent/20 px-3 py-1 rounded-full text-xs font-semibold">
            <Trophy className="h-3.5 w-3.5" />
            <span>{user.points} XP</span>
          </div>
        </div>
      </header>

      {/* 2. Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        
        {/* Left Side: Video & Under Player Interaction (Cols 8) */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Main Video Box */}
          <div className="relative w-full aspect-video rounded-2xl bg-cardBg overflow-hidden border border-cardBorder shadow-xl group">
            
            {/* Auto advance Countdown overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 z-20 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4">
                <Sparkles className="h-10 w-10 text-tealAccent animate-spin-slow" />
                <h3 className="font-display font-bold text-xl text-textPrimary">Session Completed!</h3>
                <p className="text-sm text-textSecondary">
                  Next video starting in <span className="font-bold text-tealAccent text-lg">{countdown}</span> seconds...
                </p>
                <button 
                  onClick={loadNextLesson}
                  className="px-4 py-2 bg-tealAccent text-background rounded-lg text-xs font-bold hover:bg-tealAccent/80 transition-all font-display cursor-pointer"
                >
                  Skip Countdown
                </button>
              </div>
            )}

            {/* Video completed reward notification overlay */}
            {rewardNotification && (
              <div className="absolute inset-x-4 top-4 z-20 glass-panel p-4 rounded-xl border-success/30 flex items-center justify-between text-left animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/20 text-success flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-textPrimary">Lesson Fully Complete!</h4>
                    <p className="text-[10px] text-textSecondary">
                      Earned +{rewardNotification.points} points. 
                      {rewardNotification.badge && ` Unlocked "${rewardNotification.badge.name}" Badge!`}
                    </p>
                  </div>
                </div>
                {rewardNotification.badge && (
                  <div className="h-10 w-10 rounded-lg border border-goldAccent/30 flex items-center justify-center text-goldAccent bg-goldAccent/10">
                    <Award className="h-6 w-6" />
                  </div>
                )}
              </div>
            )}

            <iframe
              src={activeLesson.videoUrl}
              title={activeLesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Simulated Playback complete button for demonstration since iFrames don't bubble events locally */}
            <div className="absolute bottom-4 right-4 z-10">
              <button 
                onClick={handleSimulateVideoCompletion}
                className="px-3 py-1.5 bg-background/80 hover:bg-background border border-cardBorder text-tealAccent hover:text-tealAccent/80 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Simulate Video Finished
              </button>
            </div>
          </div>

          {/* Under Player Tabs */}
          <div className="space-y-4 text-left">
            <div className="flex border-b border-cardBorder/40 gap-6">
              {[
                { id: 'resources', label: 'Resources', icon: FileDown },
                { id: 'comments', label: 'Comments', icon: MessageSquare },
                { id: 'breakthrough', label: 'Share Breakthrough', icon: Sparkles },
                { id: 'rewards', label: 'Achievements', icon: Trophy }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-xs font-semibold uppercase tracking-wider relative flex items-center gap-1.5 transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-tealAccent' 
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 inset-x-0 tab-underline" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content area */}
            <div className="min-h-[150px] p-5 bg-cardBg/30 border border-cardBorder/40 rounded-2xl">
              
              {/* Tab: Resources */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-textPrimary font-display">Lesson Description</h4>
                  <p className="text-xs text-textSecondary leading-relaxed">{activeLesson.description}</p>
                  
                  {activeLesson.resources.length > 0 ? (
                    <div className="space-y-2 pt-4 border-t border-cardBorder/40">
                      <h5 className="font-bold text-xs text-textPrimary uppercase tracking-wider">Lesson Attachments</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeLesson.resources.map((res, i) => (
                          <a 
                            key={i}
                            href={res.url}
                            className="p-3 bg-background/40 hover:bg-background border border-cardBorder/60 rounded-xl flex items-center justify-between text-xs text-textSecondary hover:border-tealAccent/20 transition-all"
                          >
                            <span className="flex items-center gap-2 text-textPrimary">
                              <FileDown className="h-4 w-4 text-tealAccent" />
                              {res.name}
                            </span>
                            <span className="text-[10px] text-tealAccent uppercase font-bold">Download</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-textSecondary italic pt-4 border-t border-cardBorder/40">No resource downloads for this lesson.</p>
                  )}
                </div>
              )}

              {/* Tab: Comments */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Add a comment or ask a question..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-background/50 border border-cardBorder rounded-xl p-3 text-xs text-textPrimary placeholder-textSecondary focus:outline-none focus:border-tealAccent transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 bg-tealAccent text-background disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold hover:bg-tealAccent/80 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  <div className="space-y-3 pt-4 border-t border-cardBorder/40">
                    {comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-background/30 border border-cardBorder/30 rounded-xl space-y-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-display text-[10px] text-textPrimary">{comm.name}</span>
                          <span className="text-[9px] text-textSecondary">{comm.date}</span>
                        </div>
                        <p className="text-xs text-textSecondary">{comm.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Share Breakthrough */}
              {activeTab === 'breakthrough' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-textPrimary font-display">Had a breakthrough? Earn points!</h4>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Sharing breakthroughs reinforces your learnings. Submit a text breakthrough or upload/record a short video win to earn up to **+30 XP Points**.
                  </p>

                  {breakthroughSuccess && (
                    <div className="p-3 text-xs bg-success/10 border border-success/30 text-success rounded-xl flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Win submitted! Points and achievements updated.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    {/* Text Breakthrough */}
                    <form onSubmit={handleBreakthroughSubmit} className="space-y-2 text-left border-b md:border-b-0 md:border-r border-cardBorder/40 pb-4 md:pb-0 md:pr-4">
                      <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">Write your Breakthrough</label>
                      <textarea 
                        placeholder="What shifted for you during this session?"
                        value={breakthroughText}
                        onChange={(e) => setBreakthroughText(e.target.value)}
                        className="w-full bg-background/50 border border-cardBorder rounded-xl p-3 text-xs text-textPrimary placeholder-textSecondary focus:outline-none focus:border-tealAccent h-24 resize-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!breakthroughText.trim()}
                        className="px-4 py-2 bg-tealAccent text-background rounded-lg text-xs font-bold hover:bg-tealAccent/80 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Submit Win (+20 XP)
                      </button>
                    </form>

                    {/* Video win */}
                    <div className="space-y-3 flex flex-col justify-center text-left">
                      <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">Record Video win</label>
                      <p className="text-[11px] text-textSecondary">Use your webcam to record a quick 60-second win directly onto your page feed.</p>
                      
                      <button
                        onClick={handleRecordVideoBreakthrough}
                        disabled={isSimulatingVideoRecord}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSimulatingVideoRecord 
                            ? 'bg-goldAccent/10 text-goldAccent border-goldAccent/40 animate-pulse'
                            : 'bg-goldAccent text-background hover:bg-goldAccent/80 border-goldAccent shadow-lg gold-glow'
                        }`}
                      >
                        <Sparkles className="h-4 w-4" />
                        {isSimulatingVideoRecord ? 'Recording from camera...' : 'Record Video Win (+30 XP)'}
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab: Achievements */}
              {activeTab === 'rewards' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-textPrimary font-display">Points & Badges Unlocked</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {BADGES.map((b) => {
                      const unlocked = user.badges.includes(b.id);
                      return (
                        <div 
                          key={b.id} 
                          className={`p-3 rounded-xl border flex items-center gap-2.5 text-left ${
                            unlocked 
                              ? `${b.color} bg-background/30 shadow-md`
                              : 'border-cardBorder/40 opacity-30 grayscale'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center shrink-0">
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-[10px] text-textPrimary tracking-tight">{b.name}</h5>
                            <span className="text-[8px] text-textSecondary">{unlocked ? 'Unlocked' : 'Locked'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Side: Syllabus Sidebar (Cols 4) */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-cardBorder/40 bg-cardBg/15 flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-cardBorder/40 text-left">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-tealAccent" /> Course Curriculum Outline
            </span>
          </div>

          <div className="p-2 space-y-4 overflow-y-auto flex-1">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-1.5 text-left">
                <div className="px-3 py-2 bg-background/50 rounded-lg border border-cardBorder/40">
                  <h4 className="font-display font-bold text-xs text-textPrimary flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-tealAccent/10 text-tealAccent text-[10px] flex items-center justify-center font-bold">
                      {modIdx + 1}
                    </span>
                    {mod.title}
                  </h4>
                </div>
                
                <div className="space-y-1 pl-3">
                  {mod.lessons.map((les) => {
                    const isActive = les.id === activeLesson.id;
                    const isCompleted = user.completedLessons.includes(les.id);
                    return (
                      <button
                        key={les.id}
                        onClick={() => handleLessonSelect(les)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isActive 
                            ? 'bg-tealAccent/15 border-tealAccent/30 text-tealAccent' 
                            : 'bg-cardBg/25 border-cardBorder/30 text-textSecondary hover:border-cardBorder/60 hover:text-textPrimary'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate mr-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-success shrink-0" />
                          ) : (
                            <CircleDot className="h-4 w-4 text-textSecondary/40 shrink-0" />
                          )}
                          <span className="font-medium truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] bg-background border border-cardBorder px-1.5 py-0.5 rounded flex items-center gap-1 whitespace-nowrap shrink-0 text-textSecondary">
                          <Clock className="h-3 w-3" /> {les.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
