"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { db, Course, Lesson, Module, Testimonial, User, BADGES } from '@/lib/db';
import Link from 'next/link';
import { 
  ShieldAlert, BookOpen, Users, Sparkles, Plus, 
  Trash2, Pin, CheckCircle, XCircle, ChevronLeft, ShieldCheck, Flame, Award, Lock, Save, FolderPlus, Eye, X
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface RecycleBinItem {
  id: string;
  type: 'course' | 'module';
  title: string;
  courseTitle?: string; // If module, store target course title
  data: any; // The original course/module details
}

export default function AdminDashboardPage() {
  const { user, signup } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'breakthroughs' | 'trash'>('content');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [breakthroughs, setBreakthroughs] = useState<Testimonial[]>([]);
  const [recycleBin, setRecycleBin] = useState<RecycleBinItem[]>([]);

  // Course Builder Form inputs
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonDur, setNewLessonDur] = useState('5:00');
  const [formSuccess, setFormSuccess] = useState('');

  // New Course Creator inputs
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseImg, setNewCourseImg] = useState('');
  const [courseCreateSuccess, setCourseCreateSuccess] = useState('');

  // Add Module Form inputs
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [moduleSuccess, setModuleSuccess] = useState('');

  // Student Account Creator Form inputs
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [studentFormSuccess, setStudentFormSuccess] = useState('');

  // Student Monitoring Preview state
  const [previewStudent, setPreviewStudent] = useState<User | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Security check: strictly redirect non-admins
    if (user.role !== 'admin') {
      return;
    }

    const init = async () => {
      await db.initialize();
      await loadAdminData();
    };
    init().catch(console.error);
  }, [user, router]);

  const loadAdminData = async () => {
    const list = await db.getCourses();
    setCourses(list);
    if (list.length > 0) {
      setSelectedCourseId(list[0].id);
      if (list[0].modules.length > 0) {
        setSelectedModuleId(list[0].modules[0].id);
      }
    }
    const usersList = await db.getUsers();
    setStudents(usersList);
    
    const testimonialsList = await db.getTestimonials();
    setBreakthroughs(testimonialsList);

    // Load Recycle Bin from localStorage
    const binStr = localStorage.getItem('recycleBin');
    if (binStr) {
      setRecycleBin(JSON.parse(binStr));
    }
  };

  // If user is not admin, render a security wall
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4 p-8 glass-panel rounded-2xl border-red-200">
          <ShieldAlert className="h-16 w-16 text-red-600 mx-auto" />
          <h2 className="text-xl font-bold font-display text-textPrimary">Access Denied</h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            You do not have administrative permissions to view this dashboard page.
          </p>
          <div className="pt-2">
            <Link 
              href="/dashboard"
              className="px-4 py-2 bg-plumAccent text-white rounded-lg text-xs font-bold hover:bg-plumAccent/80 transition-all font-display inline-block"
            >
              Return to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Save Recycle Bin helper
  const saveRecycleBin = (updatedBin: RecycleBinItem[]) => {
    setRecycleBin(updatedBin);
    localStorage.setItem('recycleBin', JSON.stringify(updatedBin));
  };

  // Handle creating a new course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseDesc) return;

    const newCourseId = `course-${Date.now()}`;
    const newCourse: Course = {
      id: newCourseId,
      title: newCourseTitle,
      description: newCourseDesc,
      thumbnailUrl: newCourseImg || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
      modules: [] // Starts completely empty with zero default modules!
    };

    const updatedCourses = [...courses, newCourse];
    await db.updateCourses(updatedCourses);
    setCourses(updatedCourses);

    // Default selection to new course
    setSelectedCourseId(newCourseId);
    setSelectedModuleId('');

    setNewCourseTitle('');
    setNewCourseDesc('');
    setNewCourseImg('');
    setCourseCreateSuccess('New course created successfully! You can now add modules and lessons below.');
    setTimeout(() => setCourseCreateSuccess(''), 3000);
  };

  // Handle deleting a course (moves to Recycle Bin)
  const handleDeleteCourse = async (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    if (!courseToDelete) return;

    if (!confirm(`Are you sure you want to move the course "${courseToDelete.title}" to the Recycle Bin?`)) return;

    const newItem: RecycleBinItem = {
      id: `trash-c-${Date.now()}`,
      type: 'course',
      title: courseToDelete.title,
      data: courseToDelete
    };

    const updatedCourses = courses.filter(c => c.id !== courseId);
    await db.updateCourses(updatedCourses);
    setCourses(updatedCourses);
    saveRecycleBin([...recycleBin, newItem]);

    // Update selected course reference
    if (selectedCourseId === courseId) {
      const nextC = updatedCourses.length > 0 ? updatedCourses[0].id : '';
      setSelectedCourseId(nextC);
      const nextMod = updatedCourses.length > 0 && updatedCourses[0].modules.length > 0 ? updatedCourses[0].modules[0].id : '';
      setSelectedModuleId(nextMod);
    }
  };

  // Handle adding a new module
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle || !selectedCourseId) return;

    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourseId) {
        const newMod: Module = {
          id: `mod-${Date.now()}`,
          courseId: selectedCourseId,
          title: newModuleTitle,
          orderIndex: course.modules.length + 1,
          lessons: []
        };
        return {
          ...course,
          modules: [...course.modules, newMod]
        };
      }
      return course;
    });

    await db.updateCourses(updatedCourses);
    setCourses(updatedCourses);

    // Set active module to newly created one
    const activeC = updatedCourses.find(c => c.id === selectedCourseId);
    if (activeC && activeC.modules.length > 0) {
      setSelectedModuleId(activeC.modules[activeC.modules.length - 1].id);
    }

    setNewModuleTitle('');
    setModuleSuccess('New module/chapter added successfully to this course!');
    setTimeout(() => setModuleSuccess(''), 3000);
  };

  // Handle deleting a module (moves to Recycle Bin)
  const handleDeleteModule = async (moduleId: string) => {
    const activeCourse = courses.find(c => c.id === selectedCourseId);
    if (!activeCourse) return;

    const modToDelete = activeCourse.modules.find(m => m.id === moduleId);
    if (!modToDelete) return;

    const newItem: RecycleBinItem = {
      id: `trash-m-${Date.now()}`,
      type: 'module',
      title: modToDelete.title,
      courseTitle: activeCourse.title,
      data: { ...modToDelete, courseId: selectedCourseId }
    };

    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourseId) {
        return {
          ...course,
          modules: course.modules.filter(m => m.id !== moduleId)
        };
      }
      return course;
    });

    await db.updateCourses(updatedCourses);
    setCourses(updatedCourses);
    saveRecycleBin([...recycleBin, newItem]);

    // Reset selected module if deleted
    if (selectedModuleId === moduleId) {
      const activeC = updatedCourses.find(c => c.id === selectedCourseId);
      setSelectedModuleId(activeC && activeC.modules.length > 0 ? activeC.modules[0].id : '');
    }
  };

  // Handle restoring items
  const handleRestoreItem = async (item: RecycleBinItem) => {
    if (item.type === 'course') {
      const restoredCourse = item.data as Course;
      // Prevent duplicates
      if (courses.some(c => c.id === restoredCourse.id)) {
        alert("A course with this content already exists on your dashboard!");
        return;
      }
      const updatedCourses = [...courses, restoredCourse];
      await db.updateCourses(updatedCourses);
      setCourses(updatedCourses);
      setSelectedCourseId(restoredCourse.id);
    } else {
      const restoredMod = item.data as Module;
      const updatedCourses = courses.map(course => {
        if (course.id === restoredMod.courseId) {
          if (course.modules.some(m => m.id === restoredMod.id)) return course;
          return {
            ...course,
            modules: [...course.modules, restoredMod]
          };
        }
        return course;
      });
      await db.updateCourses(updatedCourses);
      setCourses(updatedCourses);
      setSelectedCourseId(restoredMod.courseId);
      setSelectedModuleId(restoredMod.id);
    }

    const updatedBin = recycleBin.filter(b => b.id !== item.id);
    saveRecycleBin(updatedBin);
  };

  // Permanently delete item
  const handlePermanentDelete = (itemId: string) => {
    if (!confirm("Are you sure you want to permanently delete this item? All nested data will be lost forever.")) return;
    const updatedBin = recycleBin.filter(b => b.id !== itemId);
    saveRecycleBin(updatedBin);
  };

  // Handle adding a new video lesson to a module
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonUrl || !selectedModuleId) return;

    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourseId) {
        return {
          ...course,
          modules: course.modules.map(mod => {
            if (mod.id === selectedModuleId) {
              const newLesson: Lesson = {
                id: `les-${Date.now()}`,
                moduleId: selectedModuleId,
                title: newLessonTitle,
                videoUrl: newLessonUrl,
                contentType: 'video',
                description: newLessonDesc,
                duration: newLessonDur,
                resources: [],
                orderIndex: mod.lessons.length + 1
              };
              return {
                ...mod,
                lessons: [...mod.lessons, newLesson]
              };
            }
            return mod;
          })
        };
      }
      return course;
    });

    await db.updateCourses(updatedCourses);
    setCourses(updatedCourses);

    // Reset inputs
    setNewLessonTitle('');
    setNewLessonUrl('');
    setNewLessonDesc('');
    setNewLessonDur('5:00');
    setFormSuccess('Video lesson added successfully! Instantly updated in student portal.');
    setTimeout(() => setFormSuccess(''), 3000);
  };

  // Delete a lesson
  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourseId) {
        return {
          ...course,
          modules: course.modules.map(mod => {
            if (mod.id === moduleId) {
              return {
                ...mod,
                lessons: mod.lessons.filter(l => l.id !== lessonId)
              };
            }
            return mod;
          })
        };
      }
      return course;
    });

    await db.updateCourses(updatedCourses);
    setCourses(updatedCourses);
  };

  // Manually create student account
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail || !newStudentPassword) return;

    const signupSuccess = await signup(newStudentName, newStudentEmail, newStudentPassword);
    if (!signupSuccess) {
      alert("Failed to create student account. The email may already be registered or invalid.");
      return;
    }

    const usersList = await db.getUsers();
    setStudents(usersList);

    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentPassword('');
    setStudentFormSuccess('Student account created successfully! You can share the password with them.');
    setTimeout(() => setStudentFormSuccess(''), 3000);
  };

  // Toggle student role (Grant or Revoke paid access)
  const handleToggleUserRole = async (student: User) => {
    const newRole = student.role === 'student' ? 'lead' : 'student';
    const updated = {
      ...student,
      role: newRole as any
    };
    await db.updateUser(updated);
    const usersList = await db.getUsers();
    setStudents(usersList);
  };

  // Send student password reset email
  const handleSendResetEmail = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset link successfully emailed to: ${email}`);
    } catch (error) {
      console.error(error);
      alert("Failed to send password reset email.");
    }
  };

  // Approve Breakthrough
  const handleApproveBreakthrough = async (id: string, isApproved: boolean) => {
    await db.approveTestimonial(id, isApproved);
    const list = await db.getTestimonials();
    setBreakthroughs(list);
  };

  // Pin Breakthrough to homepage
  const handlePinBreakthrough = async (id: string, isPinned: boolean) => {
    await db.pinTestimonial(id, isPinned);
    const list = await db.getTestimonials();
    setBreakthroughs(list);
  };

  // Fetch modules for currently selected course
  const activeCourseModules = courses.find(c => c.id === selectedCourseId)?.modules || [];

  return (
    <div className="min-h-screen bg-background text-textPrimary relative pb-16">
      
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-cardBorder bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-cardBg rounded-lg text-textSecondary hover:text-textPrimary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-peachAccent" />
              <span className="font-display font-bold text-base tracking-wider text-textPrimary uppercase">
                Admin Panel Dashboard
              </span>
            </div>
          </div>
          <Link 
            href="/dashboard" 
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-plumAccent/10 text-plumAccent border border-plumAccent/30 hover:bg-plumAccent/15 transition-all font-display"
          >
            Student View
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Navigation (Cols 3) */}
        <div className="lg:col-span-3 space-y-2 text-left">
          {[
            { id: 'content', label: 'Course Content Builder', icon: BookOpen },
            { id: 'students', label: 'Student Registry', icon: Users },
            { id: 'breakthroughs', label: 'Breakthrough Moderator', icon: Sparkles },
            { id: 'trash', label: 'Recycle Bin', icon: Trash2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === tab.id ? 'bg-plumAccent/10 border-plumAccent/30 text-plumAccent font-bold'
                  : 'bg-white border-cardBorder shadow-sm text-textSecondary hover:border-cardBorder/80 hover:text-textPrimary'
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Side Tab Panels (Cols 9) */}
        <div className="lg:col-span-9">
          
          {/* Tab Panel: Course Content Builder */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              
              {/* Form: Create a whole new course */}
              <div className="glass-panel p-6 rounded-2xl border border-cardBorder text-left">
                <h3 className="font-display font-bold text-sm text-textPrimary mb-4 flex items-center gap-1.5">
                  <FolderPlus className="h-4.5 w-4.5 text-plumAccent" /> Create New Course
                </h3>

                {courseCreateSuccess && (
                  <div className="p-3 text-xs bg-success/10 border border-success/30 text-success rounded-xl mb-4">
                    {courseCreateSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateCourse} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Course Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aligned Manifestation Mastery"
                      value={newCourseTitle}
                      onChange={(e) => setNewCourseTitle(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Course Poster Image URL</label>
                    <input
                      type="text"
                      placeholder="Paste Unsplash image or leave blank for default"
                      value={newCourseImg}
                      onChange={(e) => setNewCourseImg(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Course Description</label>
                    <textarea
                      required
                      placeholder="Briefly summarize what students will learn in this course..."
                      value={newCourseDesc}
                      onChange={(e) => setNewCourseDesc(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent h-20 resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2 text-right">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-goldAccent text-white rounded-lg text-xs font-bold hover:bg-goldAccent/80 transition-all font-display inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Initialize Course
                    </button>
                  </div>
                </form>
              </div>

              {/* Form: Add a new module dynamically */}
              <div className="glass-panel p-6 rounded-2xl border border-cardBorder text-left">
                <h3 className="font-display font-bold text-sm text-textPrimary mb-4 flex items-center gap-1.5">
                  <FolderPlus className="h-4.5 w-4.5 text-plumAccent" /> Add Module to Course
                </h3>

                {moduleSuccess && (
                  <div className="p-3 text-xs bg-success/10 border border-success/30 text-success rounded-xl mb-4">
                    {moduleSuccess}
                  </div>
                )}

                <form onSubmit={handleAddModule} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Select Target Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        const firstMod = courses.find(c => c.id === e.target.value)?.modules[0];
                        setSelectedModuleId(firstMod ? firstMod.id : '');
                      }}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">New Module / Chapter Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Module 4: Manifesting Wealth Frequency"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div className="sm:col-span-2 text-right">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-plumAccent text-white rounded-lg text-xs font-bold hover:bg-plumAccent/80 transition-all font-display inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Save New Module
                    </button>
                  </div>
                </form>
              </div>

              {/* Form: Add a new video lesson */}
              <div className="glass-panel p-6 rounded-2xl border border-cardBorder text-left">
                <h3 className="font-display font-bold text-sm text-textPrimary mb-4 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-plumAccent" /> Add New Video Lesson
                </h3>

                {formSuccess && (
                  <div className="p-3 text-xs bg-success/10 border border-success/30 text-success rounded-xl mb-4">
                    {formSuccess}
                  </div>
                )}

                <form onSubmit={handleAddLesson} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Select Course Target</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        const firstMod = courses.find(c => c.id === e.target.value)?.modules[0];
                        setSelectedModuleId(firstMod ? firstMod.id : '');
                      }}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Select Target Module</label>
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    >
                      {activeCourseModules.map(mod => (
                        <option key={mod.id} value={mod.id}>{mod.title}</option>
                      ))}
                      {activeCourseModules.length === 0 && (
                        <option value="">No modules initialized yet</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Lesson Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 11. Manifestation Blueprint"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Video Stream URL (YouTube or Bunny.net)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://www.youtube.com/embed/XXXXX"
                      value={newLessonUrl}
                      onChange={(e) => setNewLessonUrl(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Lesson Duration (mins)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 6:30"
                      value={newLessonDur}
                      onChange={(e) => setNewLessonDur(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Synopsis / Description</label>
                    <textarea
                      placeholder="Type a brief summary of the video topic..."
                      value={newLessonDesc}
                      onChange={(e) => setNewLessonDesc(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent h-20 resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2 text-right">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-plumAccent text-white rounded-lg text-xs font-bold hover:bg-plumAccent/80 transition-all font-display inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Save Video Lesson
                    </button>
                  </div>
                </form>
              </div>

              {/* View/Delete Active Curriculum Content with Dropdown Search/Selector */}
              <div className="glass-panel p-6 rounded-2xl border border-cardBorder text-left">
                
                {/* Search Dropdown Selector */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-cardBorder">
                  <h3 className="font-display font-bold text-sm text-textPrimary flex items-center gap-1.5">
                    <BookOpen className="h-4.5 w-4.5 text-plumAccent animate-pulse" /> Current Active Curriculum
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Select Course:</label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => {
                          setSelectedCourseId(e.target.value);
                          const firstMod = courses.find(c => c.id === e.target.value)?.modules[0];
                          setSelectedModuleId(firstMod ? firstMod.id : '');
                        }}
                        className="bg-background border border-cardBorder rounded-lg p-2 text-xs text-textPrimary focus:outline-none focus:border-plumAccent font-semibold"
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    {selectedCourseId && (
                      <button
                        onClick={() => handleDeleteCourse(selectedCourseId)}
                        className="p-2 text-textSecondary hover:text-red-600 hover:bg-red-950/20 rounded-lg border border-cardBorder transition-colors cursor-pointer"
                        title="Delete Course to Recycle Bin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Show modules and lessons of selected course only */}
                {courses.filter(c => c.id === selectedCourseId).map(course => (
                  <div key={course.id} className="space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                      <img src={course.thumbnailUrl} alt={course.title} className="w-16 h-10 object-cover rounded border border-cardBorder" />
                      <div>
                        <h4 className="font-bold text-sm text-textPrimary font-display">{course.title}</h4>
                        <p className="text-[10px] text-textSecondary mt-0.5 line-clamp-1">{course.description}</p>
                      </div>
                    </div>

                    {course.modules.map(mod => (
                      <div key={mod.id} className="border border-cardBorder rounded-xl overflow-hidden bg-background/20 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-cardBorder/25 pb-2">
                          <h5 className="font-bold text-xs text-plumAccent uppercase tracking-wide">{mod.title}</h5>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 text-textSecondary hover:text-red-600 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Delete Module"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {mod.lessons.map(les => (
                            <div key={les.id} className="p-3 bg-cardBg/30 border border-cardBorder/25 rounded-lg flex items-center justify-between text-xs hover:border-cardBorder transition-all">
                              <div>
                                <span className="font-bold text-textPrimary block">{les.title}</span>
                                <span className="text-[10px] text-textSecondary truncate block max-w-sm sm:max-w-md">{les.videoUrl}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteLesson(mod.id, les.id)}
                                className="p-2 text-textSecondary hover:text-red-600 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Delete Lesson"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {mod.lessons.length === 0 && (
                            <p className="text-xs text-textSecondary italic">No lessons in this module.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Tab Panel: Student Registry */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              
              {/* Form: Create student manually */}
              <div className="glass-panel p-6 rounded-2xl border border-cardBorder text-left">
                <h3 className="font-display font-bold text-sm text-textPrimary mb-4 flex items-center gap-1.5">
                  <Plus className="h-4.5 w-4.5 text-plumAccent" /> Create Student Login Credentials
                </h3>

                {studentFormSuccess && (
                  <div className="p-3 text-xs bg-success/10 border border-success/30 text-success rounded-xl mb-4">
                    {studentFormSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Student Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Email Address (Login ID)</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. priya@example.com"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Assign Login Password</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. priya123"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      className="block w-full bg-background border border-cardBorder rounded-lg p-2.5 text-xs text-textPrimary focus:outline-none focus:border-plumAccent"
                    />
                  </div>

                  <div className="sm:col-span-3 text-right">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-plumAccent text-white rounded-lg text-xs font-bold hover:bg-plumAccent/80 transition-all font-display inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Create Student Account
                    </button>
                  </div>
                </form>
              </div>

              {/* Student registry list */}
              <div className="glass-panel p-6 rounded-2xl border border-cardBorder text-left">
                <h3 className="font-display font-bold text-sm text-textPrimary mb-4 flex items-center gap-1.5">
                  <Users className="h-5 w-5 text-plumAccent" /> Active Student Database & Passwords
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-cardBorder/40 text-xs">
                    <thead>
                      <tr className="text-textSecondary font-semibold uppercase tracking-wider text-left border-b border-cardBorder">
                        <th className="pb-3 pr-4">Student Info</th>
                        <th className="pb-3 px-4">Role</th>
                        <th className="pb-3 px-4">Portal Password (Editable)</th>
                        <th className="pb-3 px-4 text-center">Streak</th>
                        <th className="pb-3 px-4 text-center">XP</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cardBorder/20 text-textSecondary">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          
                          {/* Student Info */}
                          <td className="py-4 pr-4 text-left">
                            <span className="font-bold text-textPrimary block">{student.fullName}</span>
                            <span className="text-[10px] text-textSecondary block">{student.email}</span>
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-4 text-left">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              student.role === 'admin' 
                                ? 'bg-goldAccent/15 text-peachAccent'
                                : student.role === 'student'
                                ? 'bg-plumAccent/10 text-plumAccent'
                                : 'bg-cardBorder text-textSecondary'
                            }`}>
                              {student.role}
                            </span>
                          </td>

                          {/* Editable Password field */}
                          <td className="py-4 px-4 text-left">
                            {student.role !== 'admin' ? (
                              <button
                                onClick={() => handleSendResetEmail(student.email)}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-plumAccent/10 text-plumAccent border border-plumAccent/20 hover:bg-plumAccent/20 transition-all font-display shrink-0"
                              >
                                Send Reset Link
                              </button>
                            ) : (
                              <span className="text-peachAccent font-mono">••••••••</span>
                            )}
                          </td>

                          {/* Streak */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-orange-400 font-bold">
                              <Flame className="h-3.5 w-3.5" /> {student.streak}
                            </span>
                          </td>

                          {/* Points */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-peachAccent font-bold">
                              <Award className="h-3.5 w-3.5" /> {student.points}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 pl-4 text-right flex items-center justify-end gap-2">
                            {student.role !== 'admin' && (
                              <button
                                onClick={() => setPreviewStudent(student)}
                                className="px-2.5 py-1.5 bg-cardBg text-textPrimary border border-cardBorder rounded-lg text-[10px] font-bold hover:bg-cardBg/80 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-plumAccent" /> Preview Progress
                              </button>
                            )}
                            {student.role !== 'admin' ? (
                              <button
                                onClick={() => handleToggleUserRole(student)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                  student.role === 'student'
                                    ? 'bg-red-950/20 text-red-600 border-red-500/20 hover:bg-red-950/40'
                                    : 'bg-plumAccent text-white border-plumAccent hover:bg-plumAccent/80 shadow-md'
                                }`}
                              >
                                {student.role === 'student' ? 'Revoke Paid Access' : 'Activate Access'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-textSecondary italic">System Master</span>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Panel: Breakthrough win Moderator */}
          {activeTab === 'breakthroughs' && (
            <div className="glass-panel p-6 rounded-2xl border border-cardBorder text-left">
              <h3 className="font-display font-bold text-sm text-textPrimary mb-4 flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-plumAccent" /> Client Breakthrough moderator
              </h3>

              <div className="space-y-4">
                {breakthroughs.map((t) => (
                  <div key={t.id} className="p-4 bg-white border border-cardBorder shadow-sm/40 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-textPrimary font-display text-xs">{t.clientName}</span>
                        <span className="text-[9px] text-textSecondary">{t.role}</span>
                        {t.videoUrl && (
                          <span className="px-1.5 py-0.5 rounded bg-plumAccent/10 text-plumAccent text-[8px] font-bold uppercase">Video win</span>
                        )}
                      </div>
                      <p className="text-xs text-textSecondary italic">"{t.textContent}"</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      
                      {/* Approve button */}
                      <button
                        onClick={() => handleApproveBreakthrough(t.id, !t.approved)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          t.approved 
                            ? 'bg-success/15 border-success/35 text-success hover:bg-success/20'
                            : 'bg-cardBg/30 border-cardBorder text-textSecondary hover:text-textPrimary'
                        }`}
                        title={t.approved ? "Disapprove Post" : "Approve Post"}
                      >
                        {t.approved ? <CheckCircle className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
                      </button>

                      {/* Pin button */}
                      <button
                        onClick={() => handlePinBreakthrough(t.id, !t.pinned)}
                        disabled={!t.approved}
                        className={`p-2 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                          t.pinned
                            ? 'bg-goldAccent/15 border-goldAccent/35 text-peachAccent hover:bg-goldAccent/20 shadow-sm'
                            : 'bg-cardBg/30 border-cardBorder text-textSecondary hover:text-textPrimary'
                        }`}
                        title={t.pinned ? "Unpin from Homepage" : "Pin to Homepage"}
                      >
                        <Pin className={`h-4.5 w-4.5 ${t.pinned ? 'fill-goldAccent' : ''}`} />
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Panel: Recycle Bin */}
          {activeTab === 'trash' && (
            <div className="glass-panel p-6 rounded-2xl border border-cardBorder text-left">
              <h3 className="font-display font-bold text-sm text-textPrimary mb-4 flex items-center gap-1.5">
                <Trash2 className="h-5 w-5 text-red-600" /> Recycle Bin
              </h3>
              <p className="text-xs text-textSecondary mb-6 leading-relaxed">
                Restore deleted courses or modules. Deleted video lessons are not kept in the bin; to recover deleted lessons, restore their parent modules.
              </p>

              {recycleBin.length === 0 ? (
                <div className="text-center py-12 text-xs text-textSecondary bg-cardBg/10 border border-dashed border-cardBorder/45 rounded-xl">
                  📭 The Recycle Bin is empty.
                </div>
              ) : (
                <div className="space-y-3">
                  {recycleBin.map((item) => (
                    <div key={item.id} className="p-4 bg-white border border-cardBorder shadow-sm/40 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                      <div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mb-1 ${
                          item.type === 'course' ? 'bg-goldAccent/15 text-peachAccent' : 'bg-plumAccent/10 text-plumAccent'
                        }`}>
                          {item.type}
                        </span>
                        <h4 className="font-bold text-xs text-textPrimary">{item.title}</h4>
                        {item.courseTitle && (
                          <p className="text-[10px] text-textSecondary mt-0.5">Belonged to course: <strong className="text-textPrimary">{item.courseTitle}</strong></p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleRestoreItem(item)}
                          className="px-3 py-1.5 bg-plumAccent/10 text-plumAccent border border-plumAccent/30 hover:bg-plumAccent/20 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/80 shadow-sm rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Permanently Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Student progress monitoring modal overlay */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto glass-panel p-6 sm:p-8 rounded-2xl border border-cardBorder shadow-2xl flex flex-col justify-between text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cardBorder mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-plumAccent/10 flex items-center justify-center text-plumAccent font-display text-lg font-bold">
                  {previewStudent.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-plumAccent uppercase tracking-widest block">Dashboard Monitoring</span>
                  <h2 className="font-display font-bold text-base text-textPrimary">
                    Viewing Portal of: {previewStudent.fullName}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setPreviewStudent(null)}
                className="h-8 w-8 rounded-full bg-background/60 hover:bg-background border border-cardBorder flex items-center justify-center text-textPrimary hover:text-red-600 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Dashboard Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              
              {/* Gamified stats panel (Simulating user dashboard views) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-cardBorder flex items-center justify-around">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-textSecondary uppercase block mb-1">Daily Streak</span>
                    <div className="text-lg font-bold text-orange-400 flex items-center justify-center gap-1">
                      <Flame className="h-5 w-5 fill-orange-400/20" /> {previewStudent.streak} Days
                    </div>
                  </div>
                  <div className="h-8 w-px bg-cardBorder" />
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-textSecondary uppercase block mb-1">Total Points</span>
                    <div className="text-lg font-bold text-peachAccent flex items-center justify-center gap-1">
                      <Award className="h-5 w-5 fill-goldAccent/20" /> {previewStudent.points} XP
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-cardBorder text-left">
                  <span className="text-[10px] font-bold text-textSecondary uppercase block mb-2">Unlocked Badges</span>
                  <div className="flex flex-wrap gap-2">
                    {BADGES.map(b => {
                      const unlocked = previewStudent.badges.includes(b.id);
                      return (
                        <span key={b.id} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 border ${
                          unlocked 
                            ? 'bg-goldAccent/10 border-goldAccent/30 text-peachAccent' 
                            : 'bg-background/80 border-cardBorder text-textSecondary opacity-40'
                        }`}>
                          🏅 {b.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Progress Syllabus details */}
              <div className="space-y-4 text-left">
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Course Completion Checklist</h3>
                
                {courses.map(course => (
                  <div key={course.id} className="p-4 bg-white border border-cardBorder shadow-sm rounded-xl space-y-3">
                    <h4 className="font-display font-semibold text-xs text-textPrimary pb-2 border-b border-cardBorder/30">{course.title}</h4>
                    
                    <div className="space-y-3">
                      {course.modules.map(mod => (
                        <div key={mod.id} className="space-y-1.5 pl-2">
                          <h5 className="font-bold text-[10px] text-plumAccent uppercase">{mod.title}</h5>
                          <div className="space-y-1 pl-3">
                            {mod.lessons.map(les => {
                              const done = previewStudent.completedLessons.includes(les.id);
                              return (
                                <div key={les.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-cardBorder/30 rounded-lg text-xs">
                                  <span className="text-textPrimary font-medium">{les.title}</span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    done ? 'bg-success/15 text-success border border-success/30' : 'bg-background text-textSecondary border border-cardBorder'
                                  }`}>
                                    {done ? 'Completed' : 'Incomplete'}
                                  </span>
                                </div>
                              );
                            })}
                            {mod.lessons.length === 0 && (
                              <p className="text-[10px] text-textSecondary italic pl-2">No video sessions added.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-cardBorder mt-6 text-right shrink-0">
              <button 
                onClick={() => setPreviewStudent(null)}
                className="px-4 py-2 bg-plumAccent text-white rounded-lg text-xs font-bold hover:bg-plumAccent/80 transition-all font-display cursor-pointer"
              >
                Close Monitoring Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
