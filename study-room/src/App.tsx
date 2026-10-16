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
  const [user, setUser] = useState<any>(null);
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
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LC_Category | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<LC_Level | "all">("all");
  const [activeTab, setActiveTab] = useState<"syllabus" | "study-room" | "exams">("syllabus");
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Auth state shifts and LingoLand parent sync
  useEffect(() => {
    // 1. Check URL parameters from parent iframe
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get("uid");
    if (urlUid) {
      setUser({
        uid: urlUid,
        email: params.get("email") || "",
        displayName: params.get("name") || "Lingo Student",
        photoURL: params.get("photo") || "",
      });
    } else {
      // 2. Check localStorage for synchronized session
      try {
        const stored = localStorage.getItem("study_room_sync_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.uid) {
            setUser(parsed);
          }
        }
      } catch (_) {}
    }

    // 3. Listen to message events from parent Next.js container
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "SYNC_USER" && e.data?.user?.uid) {
        setUser(e.data.user);
      }
    };
    window.addEventListener("message", handleMsg);

    // 4. Firebase Auth local subscription
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener("message", handleMsg);
    };
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
    <div
      className="min-h-screen text-slate-900 flex flex-col font-sans p-3 sm:p-6 pb-16 gap-6 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('./study-room-wallpaper.jpg')" }}
    >
      {/* Subtle translucent dark overlay for contrast and depth */}
      <div className="fixed inset-0 bg-slate-950/25 pointer-events-none backdrop-blur-[0.5px]" />

      <div className="relative z-10 flex flex-col gap-6 w-full max-w-[1780px] mx-auto flex-1">
        {/* Upper Navigation Header bar inside the Bento wrapper */}
        <header className="w-full bg-white/95 backdrop-blur-md border-2 border-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col lg:flex-row gap-4 justify-between items-center">
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
            <div className="flex bg-slate-100/90 p-1 border-2 border-slate-900 rounded-xl gap-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
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
        <main className="flex-1 w-full mx-auto flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white/95 backdrop-blur-md border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                <span className="text-xl">🎧</span>
              </div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-display">
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
              user={user}
            />
          ) : (
            /* MAIN DIRECTORY VIEW SYLLABUS LIST */
            <div className="space-y-6 flex flex-col">
              {/* Ambient greeting hero card */}
              <div className="bg-slate-950/90 backdrop-blur-md text-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
                <div className="absolute right-12 bottom-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl" />

                <div className="space-y-3.5 relative">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider bg-indigo-950/90 border border-indigo-500/30 px-3 py-1 rounded-full inline-block">
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
        <footer className="w-full border-2 border-slate-900 bg-white/95 backdrop-blur-md p-5 rounded-2xl text-center text-slate-500 font-bold text-xs shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          <p className="font-display uppercase tracking-wider">
            © 2026 lingolandverse.com • Crafted for dual language english proficiency immersion.
          </p>
        </footer>
      </div>
    </div>
  );
}
