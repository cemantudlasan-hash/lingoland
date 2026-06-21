import { useState, useEffect } from "react";
import { Sparkles, BookOpen, Brain, Languages } from "lucide-react";
import { Lesson, UserStats, TargetLanguage, LC_Category, LC_Level } from "./types";
import LanguageSelector, { LANGUAGES } from "./components/LanguageSelector";
import ProgressDashboard from "./components/ProgressDashboard";
import CategoryNavigator from "./components/CategoryNavigator";
import ContentViewer from "./components/ContentViewer";
import StudyRoom from "./components/StudyRoom";
import ExamContainer from "./components/ExamContainer";
import { auth } from "./lib/firebase";
import { User as FirebaseUser } from "firebase/auth";

export default function App() {
  // Lessons and State lists
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [stats, setStats] = useState<UserStats>({
    completedLessons: [],
    streakCount: 0,
    lastActiveDate: "",
    points: 0,
    timeSpentMinutes: 0,
    history: [],
    passedExams: [],
    examAttempts: {},
  });
  const [currentLanguage, setCurrentLanguage] = useState<TargetLanguage>(LANGUAGES[0]); // default Thai

  // Active navigator selection states
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LC_Category | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<LC_Level | "all">("all");

  // Selection tab state ("syllabus", "study-room", or "exams")
  const [activeTab, setActiveTab] = useState<"syllabus" | "study-room" | "exams">("syllabus");

  // Loading indicator states
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Auth state shifts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial user progress stats on mount / user shift
  useEffect(() => {
    const userKey = user ? `study_room_${user.uid}_stats` : "study_room_guest_stats";
    try {
      const stored = localStorage.getItem(userKey);
      if (stored) {
        setStats(JSON.parse(stored));
      } else {
        setStats({
          completedLessons: [],
          streakCount: 0,
          lastActiveDate: "",
          points: 0,
          timeSpentMinutes: 0,
          history: [],
          passedExams: [],
          examAttempts: {},
        });
      }
    } catch (err) {
      console.error("Failed loading user stats from localStorage:", err);
    }
  }, [user]);

  // Refetch lessons when selected language shifts
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lessons?lang=${currentLanguage.code}`);
        if (res.ok) {
          const lessonsData = await res.json();
          setLessons(lessonsData);
        }
      } catch (err) {
        console.error("Failed fetching lessons for language:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [currentLanguage.code]);

  // Sync user completed lesson points locally
  const handleLessonCompleted = async (xpReward: number) => {
    if (!selectedLesson) return;
    const userKey = user ? `study_room_${user.uid}_stats` : "study_room_guest_stats";

    setStats(prev => {
      const completedLessons = prev.completedLessons.includes(selectedLesson.id)
        ? prev.completedLessons
        : [...prev.completedLessons, selectedLesson.id];

      const points = prev.points + (xpReward || 100);
      const timeSpentMinutes = prev.timeSpentMinutes + (selectedLesson.estimatedMinutes || 5);

      // Manage Streak count
      const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const lastActiveStr = prev.lastActiveDate;
      let streakCount = prev.streakCount;

      if (lastActiveStr === "") {
        streakCount = 1;
      } else if (lastActiveStr !== todayStr) {
        const lastActive = new Date(lastActiveStr);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streakCount += 1;
        } else if (diffDays > 1) {
          streakCount = 1;
        }
      }

      const history = [
        ...prev.history,
        {
          lessonId: selectedLesson.id,
          completedAt: new Date().toISOString(),
          score: 100,
          xpEarned: xpReward || 100,
        }
      ];

      const nextStats = {
        ...prev,
        completedLessons,
        points,
        timeSpentMinutes,
        streakCount,
        lastActiveDate: todayStr,
        history,
      };

      try {
        localStorage.setItem(userKey, JSON.stringify(nextStats));
      } catch (err) {
        console.error("Failed saving stats to localStorage:", err);
      }

      return nextStats;
    });
  };

  // Sync user completed exam points and status locally
  const handleExamCompleted = async (langCode: string, score: number, passed: boolean) => {
    const userKey = user ? `study_room_${user.uid}_stats` : "study_room_guest_stats";

    setStats(prev => {
      const passedExams = prev.passedExams ? [...prev.passedExams] : [];
      const examAttempts = prev.examAttempts ? { ...prev.examAttempts } : {};

      const todayStr = new Date().toISOString().split("T")[0];

      // Update best attempt or add attempt record
      const prevAttempt = examAttempts[langCode];
      if (!prevAttempt || score > prevAttempt.score) {
        examAttempts[langCode] = {
          score,
          passed,
          date: todayStr
        };
      }

      let points = prev.points;
      if (passed && !passedExams.includes(langCode)) {
        passedExams.push(langCode);
        points += 500; // Credit 500 XP bonus for passing the exam!
      }

      const nextStats = {
        ...prev,
        passedExams,
        examAttempts,
        points
      };

      try {
        localStorage.setItem(userKey, JSON.stringify(nextStats));
      } catch (err) {
        console.error("Failed saving stats to localStorage:", err);
      }

      return nextStats;
    });
  };

  // Reset progress stats entirely locally
  const handleResetStats = async () => {
    const userKey = user ? `study_room_${user.uid}_stats` : "study_room_guest_stats";
    const defaultStats = {
      completedLessons: [],
      streakCount: 0,
      lastActiveDate: "",
      points: 0,
      timeSpentMinutes: 0,
      history: [],
      passedExams: [],
      examAttempts: {},
    };
    try {
      localStorage.setItem(userKey, JSON.stringify(defaultStats));
    } catch (err) {
      console.error("Failed saving reset stats to localStorage:", err);
    }
    setStats(defaultStats);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans p-4 sm:p-6 pb-12 gap-6">
      {/* Upper Navigation Header bar inside the Bento wrapper */}
      <header className="max-w-7xl w-full mx-auto bg-white border-2 border-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Logo Brand Title */}
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-indigo-600 border-2 border-slate-900 text-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] shrink-0">
            <Brain className="w-5 h-5 fill-indigo-100/20" />
          </span>
          <div>
            <h1 className="font-display font-black tracking-tight text-slate-900 text-base leading-none uppercase flex items-center gap-1.5">
              lingolandverse<span className="text-indigo-600">.com</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
              Acoustic Study Room
            </span>
          </div>
        </div>

        {/* Dynamic Navigation tabs and LanguageSelector trigger bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Neobrutalist tab selector buttons */}
          <div className="flex bg-slate-100 p-1 border-2 border-slate-900 rounded-xl gap-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <button
              onClick={() => {
                setActiveTab("syllabus");
                setSelectedLesson(null);
              }}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === "syllabus"
                  ? "bg-slate-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Syllabus
            </button>
            <button
              onClick={() => {
                setActiveTab("exams");
                setSelectedLesson(null);
              }}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === "exams"
                  ? "bg-slate-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Exams
            </button>
            <button
              onClick={() => {
                setActiveTab("study-room");
                setSelectedLesson(null);
              }}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === "study-room"
                  ? "bg-slate-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Study Room
            </button>
          </div>

          <div className="flex items-center justify-center">
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
          </div>
        </div>
      </header>

      {/* Main Container Layout content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <span className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest font-display">
              Assembling Study Room Cabinets...
            </p>
          </div>
        ) : selectedLesson ? (
          /* ACTIVE ROOM CONTAINER VIEWER */
          <ContentViewer
            lesson={selectedLesson}
            targetLanguage={currentLanguage}
            onBack={() => setSelectedLesson(null)}
            onLessonCompleted={handleLessonCompleted}
          />
        ) : activeTab === "exams" ? (
          <ExamContainer
            currentLanguage={currentLanguage}
            stats={stats}
            onExamCompleted={handleExamCompleted}
            onBack={() => setActiveTab("syllabus")}
          />
        ) : activeTab === "study-room" ? (
          /* STUDY ROOM PORTAL PANEL (with Firebase, Realtime Bulletin and TTS Audio integrations) */
          <StudyRoom
            stats={stats}
            onStatsSynced={(cloudStats) => setStats(cloudStats)}
          />
        ) : (
          /* MAIN DIRECTORY VIEW SYLLABUS LIST */
          <div className="space-y-6 flex flex-col">
            {/* Ambient greeting hero card */}
            <div className="bg-slate-950 text-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="absolute right-12 bottom-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl" />

              <div className="space-y-3.5 relative">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider bg-indigo-950 border border-indigo-500/30 px-3 py-1 rounded-full inline-block">
                  {currentLanguage.greetingCode}! Welcome back
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-display">
                  Syllabus Gateway Hub
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Enhance your grammar correctness, grow word banks, listen to situational baristas, and perfect mouth shapes. Toggle side-by-side translation key matrices for instant comparisons.
                </p>
              </div>
            </div>

            {/* Dashboard grid panel updates */}
            <ProgressDashboard
              stats={stats}
              allLessons={lessons}
              onReset={handleResetStats}
            />

            {/* Syllabus categorised tab navigator cards list */}
            <CategoryNavigator
              lessons={lessons}
              stats={stats}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              onSelectLesson={setSelectedLesson}
            />
          </div>
        )}
      </main>

      {/* Footer footer element */}
      <footer className="max-w-7xl w-full mx-auto border-2 border-slate-900 bg-white p-5 rounded-2xl text-center text-slate-500 font-bold text-xs shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
        <p className="font-display uppercase tracking-wider">
          © 2026 lingolandverse.com • Crafted for dual language english proficiency immersion.
        </p>
      </footer>
    </div>
  );
}
