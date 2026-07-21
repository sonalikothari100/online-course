import { firestore } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  videoUrl: string;
  contentType: 'video' | 'pdf' | 'text';
  description: string;
  duration: string; // e.g., "5:30"
  resources: { name: string; url: string }[];
  orderIndex: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  modules: Module[];
}

export interface Testimonial {
  id: string;
  clientName: string;
  videoUrl?: string; // YouTube embed URL
  textContent: string;
  rating: number;
  role: string; // e.g., "Yoga Teacher", "Homemaker"
  approved: boolean;
  pinned: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  password?: string;
  role: 'student' | 'lead' | 'admin';
  points: number;
  streak: number;
  lastLoginDate?: string; // YYYY-MM-DD
  badges: string[]; // List of badge IDs
  completedLessons: string[]; // List of lesson IDs
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
}

// 1. Core Badges defined
export const BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', description: 'Watched your first video', icon: 'Compass', color: 'text-tealAccent border-tealAccent/30' },
  { id: 'streaker', name: 'Streak Starter', description: 'Studied 3 days in a row', icon: 'Flame', color: 'text-orange-400 border-orange-400/30' },
  { id: 'breakthrough_queen', name: 'Breakthrough Queen', description: 'Shared your first win in the feed', icon: 'Sparkles', color: 'text-yellow-400 border-yellow-400/30' },
  { id: 'super_student', name: 'Super Student', description: 'Earned 100 learning points', icon: 'Award', color: 'text-indigo-400 border-indigo-400/30' },
  { id: 'complete', name: 'Graduated', description: 'Completed the entire curriculum', icon: 'GraduationCap', color: 'text-success border-success/30' }
];

// 2. Default Course Data (10 video lessons across 3 modules)
const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Align & Awaken: The Identity Shift Program',
    description: 'A premium 10-part masterclass designed to rewire your subconscious blocks, raise your frequency, and build a sustainable aligned daily practice.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
    modules: [
      {
        id: 'mod-1',
        courseId: 'course-1',
        title: 'Module 1: Subconscious Grounding & Clarity',
        orderIndex: 1,
        lessons: [
          {
            id: 'les-1',
            moduleId: 'mod-1',
            title: '1. Introduction to Aligned Living',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            contentType: 'video',
            description: 'In this session, we lay the foundation of the identity shift framework and explore how to align your focus for growth.',
            duration: '6:15',
            orderIndex: 1,
            resources: [
              { name: 'Module 1 Grounding Handbook.pdf', url: '#' },
              { name: 'Self-Reflection Worksheet.docx', url: '#' }
            ]
          },
          {
            id: 'les-2',
            moduleId: 'mod-1',
            title: '2. Deconstructing Subconscious Blocks',
            videoUrl: 'https://www.youtube.com/embed/EngW7tLk6R8',
            contentType: 'video',
            description: 'Identify and write down the invisible limiting beliefs holding your habits back.',
            duration: '7:40',
            orderIndex: 2,
            resources: [
              { name: 'Limiting Beliefs Inventory.pdf', url: '#' }
            ]
          },
          {
            id: 'les-3',
            moduleId: 'mod-1',
            title: '3. The Frequency Threshold',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            contentType: 'video',
            description: 'Understand the physics of emotional frequency and how to elevate your daily vibration.',
            duration: '5:20',
            orderIndex: 3,
            resources: []
          }
        ]
      },
      {
        id: 'mod-2',
        courseId: 'course-1',
        title: 'Module 2: Daily Aligned Routines (Streaks & Habitation)',
        orderIndex: 2,
        lessons: [
          {
            id: 'les-4',
            moduleId: 'mod-2',
            title: '4. Establishing the Morning Calibration',
            videoUrl: 'https://www.youtube.com/embed/EngW7tLk6R8',
            contentType: 'video',
            description: 'Create a 5-minute morning sequence that resets your nervous system and builds consistency.',
            duration: '6:45',
            orderIndex: 4,
            resources: [
              { name: 'Morning Calibration Tracker.pdf', url: '#' }
            ]
          },
          {
            id: 'les-5',
            moduleId: 'mod-2',
            title: '5. Calming Breathwork & Body Activation',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            contentType: 'video',
            description: 'A physical breath and yoga routine designed to release stored tension and ground your body.',
            duration: '7:10',
            orderIndex: 5,
            resources: []
          },
          {
            id: 'les-6',
            moduleId: 'mod-2',
            title: '6. Navigating Mid-Day Burnout',
            videoUrl: 'https://www.youtube.com/embed/EngW7tLk6R8',
            contentType: 'video',
            description: 'How to transition from stressful work blocks back into heart-centered awareness.',
            duration: '5:50',
            orderIndex: 6,
            resources: []
          },
          {
            id: 'les-7',
            moduleId: 'mod-2',
            title: '7. Nightly Gratitude Re-programming',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            contentType: 'video',
            description: 'Rewiring your subconscious mind right before sleep using specific visualization cues.',
            duration: '6:05',
            orderIndex: 7,
            resources: [
              { name: 'Night Journaling Prompts.pdf', url: '#' }
            ]
          }
        ]
      },
      {
        id: 'mod-3',
        courseId: 'course-1',
        title: 'Module 3: Elevating Your Outer Identity',
        orderIndex: 3,
        lessons: [
          {
            id: 'les-8',
            moduleId: 'mod-3',
            title: '8. Boundaries as Energy Safeguards',
            videoUrl: 'https://www.youtube.com/embed/EngW7tLk6R8',
            contentType: 'video',
            description: 'Learn the exact scripting to set healthy personal and professional boundaries without guilt.',
            duration: '7:15',
            orderIndex: 8,
            resources: []
          },
          {
            id: 'les-9',
            moduleId: 'mod-3',
            title: '9. Integration and Aligned Community',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            contentType: 'video',
            description: 'Surrounding yourself with the right frequencies. Using accountability groups to stay active.',
            duration: '5:35',
            orderIndex: 9,
            resources: []
          },
          {
            id: 'les-10',
            moduleId: 'mod-3',
            title: '10. The Graduation: Sustaining Your Shift',
            videoUrl: 'https://www.youtube.com/embed/EngW7tLk6R8',
            contentType: 'video',
            description: 'Your roadmap for the next 90 days of self-coaching and lifestyle integration.',
            duration: '8:20',
            orderIndex: 10,
            resources: [
              { name: '90-Day Aligned Action Plan.pdf', url: '#' }
            ]
          }
        ]
      }
    ]
  }
];

// 3. Default Testimonials & Breakthrough Grid (25 real-world style items)
const DEFAULT_TESTIMONIALS: Testimonial[] = Array.from({ length: 25 }, (_, i) => ({
  id: `test-${i + 1}`,
  clientName: [
    'Priya Sharma', 'Anjali Desai', 'Neha Patel', 'Meera Rao', 'Shalini Iyer',
    'Aishwarya Nair', 'Ritika Sen', 'Komal Gupta', 'Sunita Joshi', 'Pooja Reddy',
    'Deepika Kapur', 'Tanvi Mehta', 'Shruti Verma', 'Simran Kaur', 'Kirti Solanki',
    'Nisha Kapoor', 'Sneha Pillai', 'Geeta Hegde', 'Divya Saxena', 'Rashi Taneja',
    'Preeti Bansal', 'Aditi Roy', 'Bhavna Shah', 'Swati Mishra', 'Richa Choudhary'
  ][i],
  videoUrl: i % 3 === 0 ? 'https://www.youtube.com/embed/EngW7tLk6R8' : undefined, // Some have video embeds
  textContent: [
    "I was suffering from severe professional burnout as an IT manager. Applying the morning calibration sequence helped me regain my peace of mind and focus.",
    "The identity shift module changed how I speak to myself. I unlocked limiting beliefs I had since childhood. Truly life-transforming!",
    "Completing my 15-day streak felt amazing! The badges kept me motivated daily, and the secure player is beautiful.",
    "This was my favorite online community ever. Seeing others share breakthroughs inspired me to record my own video win.",
    "Highly recommend this course! The boundaries lesson saved my relationships. Sonali's coaching has a very calming, clear approach.",
    "This is exactly like having a personal coach in your pocket. The Daily Yoga app-style dashboard feels so clean and motivating.",
    "I've earned 3 badges so far and I'm pushing for the Graduation Badge next week! It's so addictive to watch fully and build streaks.",
    "The resources worksheets are gold. The night journaling prompts helped me fall asleep without anxiety for the first time in years.",
    "Amazing and completely private. I love that I can upload my video breakthroughs and get feedback from Sonali directly.",
    "This curriculum is beautifully organized. Each video is short and digestible, perfect for busy schedules."
  ][i % 10],
  rating: 5,
  role: ['Corporate Professional', 'Homemaker', 'Yoga Practitioner', 'Business Owner', 'Graphic Designer', 'Freelancer'][i % 6],
  approved: true,
  pinned: i < 6 // Pin first 6 for the home layout
}));

export const db = {
  initialize: async (): Promise<void> => {
    // 1. Seed courses if collection is empty
    const coursesCol = collection(firestore, 'courses');
    const coursesSnapshot = await getDocs(coursesCol);
    if (coursesSnapshot.empty) {
      for (const course of DEFAULT_COURSES) {
        await setDoc(doc(firestore, 'courses', course.id), course);
      }
    }

    // 2. Seed testimonials if collection is empty
    const testimonialsCol = collection(firestore, 'testimonials');
    const testimonialsSnapshot = await getDocs(testimonialsCol);
    if (testimonialsSnapshot.empty) {
      for (const testimonial of DEFAULT_TESTIMONIALS) {
        await setDoc(doc(firestore, 'testimonials', testimonial.id), testimonial);
      }
    }
  },

  getCourses: async (): Promise<Course[]> => {
    const coursesCol = collection(firestore, 'courses');
    const snapshot = await getDocs(coursesCol);
    if (snapshot.empty) {
      return DEFAULT_COURSES;
    }
    return snapshot.docs.map(doc => doc.data() as Course);
  },

  updateCourses: async (courses: Course[]): Promise<void> => {
    for (const course of courses) {
      await setDoc(doc(firestore, 'courses', course.id), course);
    }
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    const testimonialsCol = collection(firestore, 'testimonials');
    const snapshot = await getDocs(testimonialsCol);
    if (snapshot.empty) {
      return DEFAULT_TESTIMONIALS;
    }
    return snapshot.docs.map(doc => doc.data() as Testimonial);
  },

  addTestimonial: async (t: Omit<Testimonial, 'id' | 'approved' | 'pinned'>): Promise<Testimonial> => {
    const id = `test-${Date.now()}`;
    const newTestimonial: Testimonial = {
      ...t,
      id,
      approved: false, // Admin approval required
      pinned: false
    };
    await setDoc(doc(firestore, 'testimonials', id), newTestimonial);
    return newTestimonial;
  },

  approveTestimonial: async (id: string, approve: boolean): Promise<void> => {
    const testimonialRef = doc(firestore, 'testimonials', id);
    await updateDoc(testimonialRef, { approved: approve });
  },

  pinTestimonial: async (id: string, pin: boolean): Promise<void> => {
    const testimonialRef = doc(firestore, 'testimonials', id);
    await updateDoc(testimonialRef, { pinned: pin });
  },

  getUsers: async (): Promise<User[]> => {
    const usersCol = collection(firestore, 'users');
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(doc => doc.data() as User);
  },

  getUser: async (id: string): Promise<User | undefined> => {
    const userRef = doc(firestore, 'users', id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return undefined;
  },

  updateUser: async (user: User): Promise<void> => {
    const userRef = doc(firestore, 'users', user.id);
    // Destructure password out of User object to prevent storing plain-text passwords in Firestore
    const { password, ...userWithoutPassword } = user;
    await setDoc(userRef, userWithoutPassword, { merge: true });
  },

  completeLesson: async (userId: string, lessonId: string): Promise<{ pointsAdded: number; newBadgeUnlocked?: Badge }> => {
    const user = await db.getUser(userId);
    if (!user) return { pointsAdded: 0 };

    if (user.completedLessons.includes(lessonId)) {
      return { pointsAdded: 0 }; // Already completed
    }

    // Add to completed list
    user.completedLessons.push(lessonId);
    let pointsAdded = 10; // +10 points for completing a lesson
    user.points += pointsAdded;

    let newBadgeUnlocked: Badge | undefined;

    // Check for "First Step" badge
    if (user.completedLessons.length === 1 && !user.badges.includes('first_step')) {
      user.badges.push('first_step');
      newBadgeUnlocked = BADGES.find(b => b.id === 'first_step');
    }

    // Check for "Super Student" badge (>= 100 points)
    if (user.points >= 100 && !user.badges.includes('super_student')) {
      user.badges.push('super_student');
      newBadgeUnlocked = BADGES.find(b => b.id === 'super_student');
    }

    // Check for Course Completion (all lessons completed)
    const courses = await db.getCourses();
    const allLessonIds = courses.flatMap(c => c.modules.flatMap(m => m.lessons.map(l => l.id)));
    const hasCompletedAll = allLessonIds.every(id => user.completedLessons.includes(id));
    
    if (hasCompletedAll && !user.badges.includes('complete')) {
      user.badges.push('complete');
      newBadgeUnlocked = BADGES.find(b => b.id === 'complete');
    }

    await db.updateUser(user);
    return { pointsAdded, newBadgeUnlocked };
  },

  triggerStreakLogin: async (userId: string): Promise<{ streakUpdated: boolean; newBadgeUnlocked?: Badge }> => {
    const user = await db.getUser(userId);
    if (!user) return { streakUpdated: false };

    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastLoginDate === todayStr) {
      return { streakUpdated: false }; // Already checked in today
    }

    let streakUpdated = false;
    let newBadgeUnlocked: Badge | undefined;

    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive login! Increase streak
        user.streak += 1;
        user.points += 5; // +5 points for daily login streak
        streakUpdated = true;
      } else if (diffDays > 1) {
        // Broke the streak, reset to 1
        user.streak = 1;
        streakUpdated = true;
      }
    } else {
      user.streak = 1;
      streakUpdated = true;
    }

    user.lastLoginDate = todayStr;

    // Check for Streak Badge (3 days in a row)
    if (user.streak >= 3 && !user.badges.includes('streaker')) {
      user.badges.push('streaker');
      newBadgeUnlocked = BADGES.find(b => b.id === 'streaker');
    }

    await db.updateUser(user);
    return { streakUpdated, newBadgeUnlocked };
  }
};
