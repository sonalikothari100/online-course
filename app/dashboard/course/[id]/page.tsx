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
      setTimeout(() => {
        setRewardNotification(null);
        triggerAutoAdvance();
      }, 4000);
    } else {
      triggerAutoAdvance();
    }
  };

  const triggerAutoAdvance = () => {
    const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
      setCountdown(3);
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
      textContent: breakthroughText,
      rating: 5,
      role: 'Academy Student'
    });

    user.points += 20;
    if (!user.badges.includes('breakthrough_queen')) {
      user.badges.push('breakthrough_queen');
    }
    db.updateUser(user);
    refreshUser();

    setBreakthroughText('');
    setBreakthroughSuccess(true);
    setTimeout(() => {
      setBreakthroughSuccess(false);
    }, 3000);
  };

  const handleRecordVideoBreakthrough = () => {
    setIsSimulatingVideoRecord(true);
    setTimeout(() => {
      setIsSimulatingVideoRecord(false);
      user.points += 30; // +30 points for recording video win
      if (!user.badges.includes('alignment_champion')) {
        user.badges.push('alignment_champion');
      }
      db.updateUser(user);
      refreshUser();
      
      setBreakthroughSuccess(true);
      setTimeout(() => {
        setBreakthroughSuccess(false);
      }, 3000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col font-sans">
      
      {/* 1. Header with Course Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-cardBorder bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-slate-105 rounded-lg text-textSecondary hover:text-textPrimary transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-plumAccent" />
            </Link>
            <div className="text-left">
              <h3 className="font-bold text-sm text-textPrimary leading-tight">{course.title}</h3>
              <p className="text-[10px] text-textSecondary">Lesson: {activeLesson.title}</p>
            </div>
          </div>

          {/* Overall Course Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-textSecondary uppercase block">Overall Progress</span>
              <span className="text-xs font-bold text-plumAccent">{progressPercent}% Completed</span>
            </div>
            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-250">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Master Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto relative items-stretch">
        
        {/* Left Side: Video & Under-Player Tabs (Cols 8) */}
        <div className="lg:col-span-8 p-4 sm:p-6 space-y-6 flex flex-col justify-start">
          
          {/* Simulated Video Player */}
          <div className="relative w-full aspect-video rounded-3xl bg-slate-900 overflow-hidden shadow-lg border border-cardBorder">
            
            {/* Auto advance overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-4">
                <span className="text-[10px] font-bold text-plumAccent uppercase tracking-widest animate-pulse">Session Finished</span>
                <h3 className="text-2xl font-bold font-display text-textPrimary mt-2">Next Lesson Starts in {countdown}...</h3>
                <button 
                  onClick={loadNextLesson}
                  className="mt-4 px-6 py-2.5 bg-plumAccent text-white hover:bg-plumAccent/90 rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Play Next Immediately
                </button>
              </div>
            )}

            {/* Reward Points notification popups */}
            {rewardNotification && (
              <div className="absolute top-4 left-4 right-4 z-30 p-4 bg-white border border-goldAccent/30 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                <div className="h-10 w-10 rounded-full bg-goldAccent/10 text-goldAccent flex items-center justify-center font-bold">
                  +{rewardNotification.points}
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-bold text-xs text-textPrimary">Well Done, sister!</h4>
                  <p className="text-[10px] text-textSecondary">You earned {rewardNotification.points} XP for finishing this lesson.</p>
                  {rewardNotification.badge && (
                    <span className="inline-block mt-1 text-[9px] bg-goldAccent/10 text-goldAccent font-bold px-2 py-0.5 rounded-full border border-goldAccent/25">
                      🏆 Badge Unlocked: {rewardNotification.badge.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Custom styled video frame */}
            <iframe 
              src={activeLesson.videoUrl}
              title={activeLesson.title}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Simulated play complete trigger */}
            <div className="absolute bottom-4 right-4 z-10">
              <button 
                onClick={handleSimulateVideoCompletion}
                className="px-3 py-1.5 bg-white/90 hover:bg-white border border-cardBorder text-plumAccent hover:text-plumAccent/80 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle className="h-3.5 w-3.5 text-plumAccent" />
                Simulate Video Finished
              </button>
            </div>
          </div>

          {/* Under Player Tabs */}
          <div className="space-y-4 text-left">
            <div className="flex border-b border-cardBorder gap-6">
              {[
                { id: 'resources', label: 'Resources', icon: FileDown },
                { id: 'comments', label: 'Comments', icon: MessageSquare },
                { id: 'breakthrough', label: 'Share Breakthrough', icon: Sparkles },
                { id: 'rewards', label: 'Achievements', icon: Trophy }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-xs font-semibold uppercase tracking-wider relative flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'text-plumAccent font-bold' 
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

            {/* Tab content container */}
            <div className="min-h-[150px] p-5 bg-white border border-cardBorder rounded-2xl shadow-sm">
              
              {/* Tab: Resources */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-textPrimary font-display">Lesson Description</h4>
                  <p className="text-xs text-textSecondary leading-relaxed">{activeLesson.description}</p>
                  
                  {activeLesson.resources.length > 0 ? (
                    <div className="space-y-2 pt-4 border-t border-cardBorder">
                      <h5 className="font-bold text-xs text-textPrimary uppercase tracking-wider">Lesson Attachments</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeLesson.resources.map((res, i) => (
                          <a 
                            key={i}
                            href={res.url}
                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-cardBorder rounded-xl flex items-center justify-between text-xs text-textSecondary hover:border-plumAccent/30 transition-all shadow-sm"
                          >
                            <span className="flex items-center gap-2 text-textPrimary">
                              <FileDown className="h-4 w-4 text-plumAccent" />
                              {res.name}
                            </span>
                            <span className="text-[10px] text-plumAccent uppercase font-bold">Download</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-textSecondary italic pt-4 border-t border-cardBorder">No resource downloads for this lesson.</p>
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
                      className="flex-1 bg-slate-50 border border-cardBorder rounded-xl p-3 text-xs text-textPrimary placeholder-textSecondary/70 focus:outline-none focus:border-plumAccent transition-all shadow-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 bg-plumAccent text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold hover:bg-plumAccent/90 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5 text-white" />
                    </button>
                  </form>

                  <div className="space-y-3 pt-4 border-t border-cardBorder">
                    {comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-slate-50 border border-cardBorder rounded-xl space-y-1 text-left shadow-sm">
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
                    <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Win submitted! Points and achievements updated.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Text Breakthrough */}
                    <form onSubmit={handleBreakthroughSubmit} className="space-y-2 text-left border-b md:border-b-0 md:border-r border-cardBorder pb-4 md:pb-0 md:pr-4">
                      <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">Write your Breakthrough</label>
                      <textarea 
                        placeholder="What shifted for you during this session?"
                        value={breakthroughText}
                        onChange={(e) => setBreakthroughText(e.target.value)}
                        className="w-full bg-slate-50 border border-cardBorder rounded-xl p-3 text-xs text-textPrimary placeholder-textSecondary/70 focus:outline-none focus:border-plumAccent h-24 resize-none transition-all shadow-sm"
                      />
                      <button
                        type="submit"
                        disabled={!breakthroughText.trim()}
                        className="px-4 py-2 bg-plumAccent text-white rounded-lg text-xs font-bold hover:bg-plumAccent/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        Submit Win (+20 XP)
                      </button>
                    </form>

                    {/* Video win */}
                    <div className="space-y-3 flex flex-col justify-center text-left">
                      <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">Record Video win</label>
                      <p className="text-[11px] text-textSecondary font-display">Use your webcam to record a quick 60-second win directly onto your page feed.</p>
                      
                      <button
                        onClick={handleRecordVideoBreakthrough}
                        disabled={isSimulatingVideoRecord}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSimulatingVideoRecord 
                            ? 'bg-peachAccent/10 text-plumAccent border-peachAccent/40 animate-pulse font-semibold'
                            : 'bg-peachAccent text-plumAccent hover:bg-peachAccent/80 border-peachAccent shadow-sm peach-glow font-bold'
                        }`}
                      >
                        <Sparkles className="h-4 w-4 text-plumAccent" />
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
                              ? 'border-peachAccent/40 bg-slate-50 shadow-sm peach-glow'
                              : 'border-cardBorder opacity-30 grayscale'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-white border border-cardBorder flex items-center justify-center shrink-0 text-peachAccent shadow-sm">
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
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-cardBorder bg-white flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-cardBorder text-left">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest flex items-center gap-1.5 font-display">
              <BookOpen className="h-4 w-4 text-plumAccent" /> Course Curriculum Outline
            </span>
          </div>

          <div className="p-2 space-y-4 overflow-y-auto flex-1">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-1.5 text-left">
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-cardBorder">
                  <h4 className="font-display font-bold text-xs text-textPrimary flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-plumAccent/10 text-plumAccent text-[10px] flex items-center justify-center font-bold">
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
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-plumAccent/10 border-plumAccent/30 text-plumAccent font-bold' 
                            : 'bg-white border-cardBorder text-textSecondary hover:border-cardBorder/80 hover:text-textPrimary'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate mr-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <CircleDot className="h-4 w-4 text-textSecondary/40 shrink-0" />
                          )}
                          <span className="font-medium truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] bg-slate-50 border border-cardBorder px-1.5 py-0.5 rounded flex items-center gap-1 whitespace-nowrap shrink-0 text-textSecondary font-semibold">
                          <Clock className="h-3 w-3" /> {les.duration}m
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
