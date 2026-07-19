"use client";

import React, { useState, useEffect } from 'react';
import { db, Course, Testimonial } from '@/lib/db';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { 
  Compass, Sparkles, Play, Star, ArrowRight, BookOpen, 
  MessageSquare, Users, Award, X, CheckCircle 
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    db.initialize();
    setCourses(db.getCourses());
    // Filter only approved testimonials, sorting pinned first
    const items = db.getTestimonials().filter(t => t.approved);
    const sorted = [...items].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
    setTestimonials(sorted);
  }, []);

  return (
    <div className="min-h-screen bg-background text-textPrimary relative overflow-hidden font-sans">
      {/* Visual Design Elements (Daily Yoga Calming Gradients) */}
      <div className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] rounded-full bg-tealAccent/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-25%] w-[800px] h-[800px] rounded-full bg-goldAccent/5 blur-[150px] pointer-events-none" />

      {/* 1. Header/Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-cardBorder/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-tealAccent" />
            <span className="font-display font-bold text-lg tracking-wider text-textPrimary">
              SONALI KOTHARI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-textSecondary">
            <a href="#about" className="hover:text-tealAccent transition-colors">About</a>
            <a href="#curriculum" className="hover:text-tealAccent transition-colors">Curriculum</a>
            <a href="#testimonials" className="hover:text-tealAccent transition-colors">Breakthroughs</a>
            <a href="#identity-kit" className="hover:text-tealAccent transition-colors">Free Tools</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-tealAccent/15 text-tealAccent border border-tealAccent/30 hover:bg-tealAccent/20 transition-all font-display"
              >
                Go to Portal
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors">
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-tealAccent text-background hover:bg-tealAccent/80 transition-all font-display shadow-lg teal-glow cursor-pointer"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tealAccent/10 text-tealAccent text-xs font-semibold border border-tealAccent/20">
              <Sparkles className="h-3 w-3" />
              Bespoke Aligned Coaching Portal
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-display text-textPrimary leading-tight">
              Shift Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-tealAccent to-cyan-300">Identity</span>. <br />
              Elevate Your Habits.
            </h1>
            <p className="text-base sm:text-lg text-textSecondary max-w-xl leading-relaxed">
              Design a calm mindset, calibrate your daily frequencies, and unlock professional growth using our custom-designed secure curriculum.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-1.5 px-6 py-3.5 bg-tealAccent text-background rounded-xl font-semibold text-sm hover:bg-tealAccent/80 transition-all shadow-lg font-display teal-glow cursor-pointer"
              >
                Get Free Identity Kit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#curriculum"
                className="flex items-center justify-center gap-1 px-6 py-3.5 bg-cardBg/50 text-textPrimary border border-cardBorder rounded-xl font-semibold text-sm hover:bg-cardBg transition-all font-display"
              >
                View 10-Part Syllabus
              </a>
            </div>
          </div>

          {/* Right Hero Card Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="glass-panel p-6 rounded-2xl border border-cardBorder shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-tealAccent/5 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between pb-6 border-b border-cardBorder/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-tealAccent/10 flex items-center justify-center text-tealAccent">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-textPrimary">Identity Shift Course</h4>
                    <p className="text-xs text-textSecondary">Active Academy Portal</p>
                  </div>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-tealAccent animate-pulse" />
              </div>
              <div className="space-y-4 pt-6">
                <div className="p-4 bg-background/50 rounded-xl border border-cardBorder/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-textSecondary">Syllabus Length</span>
                  <span className="text-xs font-bold text-tealAccent flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> 10 Video Sessions
                  </span>
                </div>
                <div className="p-4 bg-background/50 rounded-xl border border-cardBorder/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-textSecondary">Student Success Rate</span>
                  <span className="text-xs font-bold text-goldAccent flex items-center gap-1">
                    <Users className="h-3 w-3" /> 97% Aligned Shift
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stat Blocks */}
      <section className="bg-cardBg/20 border-y border-cardBorder/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold font-display text-tealAccent">100% Secure</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Protected Video Streaming</div>
          </div>
          <div className="space-y-2 border-y md:border-y-0 md:border-x border-cardBorder/30 py-6 md:py-0">
            <div className="text-3xl font-bold font-display text-goldAccent">Gamified UI</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Badges & Daily Login Streaks</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold font-display text-textPrimary">25+ Stories</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Verified Video Breakthroughs</div>
          </div>
        </div>
      </section>

      {/* 4. Curriculum Outline */}
      <section id="curriculum" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-textPrimary">
            Curriculum Structure
          </h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            Ten core modules designed similarly to a modern LMS interface. Track your progress visually as you progress through each lesson.
          </p>
        </div>

        {courses.map((course) => (
          <div key={course.id} className="space-y-8">
            <div className="glass-panel p-8 rounded-2xl border border-cardBorder shadow-xl text-left">
              <h3 className="text-xl font-bold text-tealAccent font-display mb-2">{course.title}</h3>
              <p className="text-sm text-textSecondary leading-relaxed mb-6">{course.description}</p>
              
              <div className="space-y-6">
                {course.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="p-5 bg-background/40 border border-cardBorder/60 rounded-xl space-y-4">
                    <h4 className="font-display font-semibold text-sm text-textPrimary flex items-center gap-2">
                      <span className="h-5 w-5 rounded bg-tealAccent/15 text-tealAccent text-xs flex items-center justify-center font-bold">
                        {modIdx + 1}
                      </span>
                      {mod.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
                      {mod.lessons.map((les) => (
                        <div key={les.id} className="p-3 bg-cardBg/45 border border-cardBorder/40 rounded-lg flex items-center justify-between text-xs text-textSecondary hover:border-tealAccent/25 transition-all">
                          <span className="font-medium text-textPrimary truncate mr-2">{les.title}</span>
                          <span className="px-2 py-0.5 bg-background border border-cardBorder rounded text-[10px] whitespace-nowrap">
                            {les.duration} mins
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 5. Breakthrough Video Testimonials Wall */}
      <section id="testimonials" className="py-20 bg-cardBg/10 border-t border-cardBorder/40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-goldAccent/10 text-goldAccent text-xs font-semibold border border-goldAccent/20">
              <Award className="h-3 w-3" />
              Verified Client Journeys
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-textPrimary">
              Breakthrough Board
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              Explore 25+ real stories of alignment, habit consistency, and self-mastery from our closed student network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div 
                key={test.id} 
                className={`glass-panel p-6 rounded-2xl border text-left flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 ${
                  test.pinned ? 'border-tealAccent/30' : 'border-cardBorder/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-textPrimary font-display">{test.clientName}</h4>
                      <p className="text-[11px] text-textSecondary">{test.role}</p>
                    </div>
                    <div className="flex text-goldAccent gap-0.5">
                      {Array.from({ length: test.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-goldAccent" />
                      ))}
                    </div>
                  </div>

                  {test.videoUrl && (
                    <div className="relative aspect-video w-full rounded-lg bg-background overflow-hidden border border-cardBorder/60 mb-4 group">
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <button 
                          onClick={() => setActiveVideo(test.videoUrl || null)}
                          className="h-10 w-10 rounded-full bg-tealAccent text-background flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all cursor-pointer"
                        >
                          <Play className="h-5 w-5 fill-background pl-0.5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 z-20 text-[10px] font-semibold text-tealAccent flex items-center gap-1 bg-background/60 px-2 py-0.5 rounded-full border border-tealAccent/20">
                        <Play className="h-3 w-3" /> Play Video Win
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-textSecondary leading-relaxed italic mb-4">
                    "{test.textContent}"
                  </p>
                </div>

                <div className="pt-3 border-t border-cardBorder/40 flex items-center justify-between text-[10px] text-textSecondary font-semibold">
                  <span className="flex items-center gap-1 text-tealAccent">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified Breakthrough
                  </span>
                  <span>Enrolled Student</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lead Capture Section */}
      <section id="identity-kit" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cardBorder shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-tealAccent/5 blur-2xl pointer-events-none" />
          
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tealAccent/15 text-tealAccent">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold font-display text-textPrimary">
            Get Sonali's Free Identity Kit
          </h2>
          <p className="text-sm text-textSecondary max-w-lg mx-auto leading-relaxed">
            Access free workbook routines, habit sheets, and subconscious calibration worksheets. Join the network to start tracking your daily progress.
          </p>

          <div className="pt-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-tealAccent text-background rounded-xl font-semibold text-sm hover:bg-tealAccent/80 transition-all shadow-lg font-display teal-glow cursor-pointer"
            >
              Sign Up & Access Free Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-[11px] text-textSecondary">
            Zero subscription fee. Instantly unlocks access to the free module dashboard.
          </p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-cardBorder/40 py-10 bg-background px-4 sm:px-6 lg:px-8 text-center text-xs text-textSecondary space-y-4">
        <p>&copy; {new Date().getFullYear()} Sonali Kothari Academy. All rights reserved.</p>
        <p className="max-w-md mx-auto leading-relaxed opacity-75">
          Curriculum delivery and breakthroughs are securely encrypted and protected against unauthorized sharing.
        </p>
      </footer>

      {/* Video Lightbox Overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl aspect-video glass-panel rounded-2xl overflow-hidden border border-cardBorder shadow-2xl">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-background/80 border border-cardBorder flex items-center justify-center text-textPrimary hover:bg-background transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <iframe 
              src={activeVideo}
              title="Breakthrough Video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
