import { useState, useEffect, FormEvent } from "react";
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logoutUser, 
  handleFirestoreError,
  OperationType 
} from "../lib/firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Plus, 
  LogOut, 
  ShieldCheck, 
  RefreshCw, 
  Activity, 
  HelpCircle,
  Clock,
  Award
} from "lucide-react";
import { UserStats } from "../types";

interface StudyRoomProps {
  stats: UserStats;
  onStatsSynced: (cloudStats: UserStats) => void;
}

interface StudyNote {
  id: string;
  userId: string;
  userEmail: string;
  content: string;
  createdAt: any;
  language?: string;
}

export default function StudyRoom({ stats, onStatsSynced }: StudyRoomProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  
  // New Note fields
  const [noteContent, setNoteContent] = useState("");
  const [noteLang, setNoteLang] = useState("English");
  const [submittingNote, setSubmittingNote] = useState(false);

  // TTS audio playback states
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);

  // 1. Subscribe to Auth status shifts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch/Write stats whenever user logs in or local stats update
  useEffect(() => {
    if (!user) return;

    let active = true;
    const syncUserStats = async () => {
      setSyncStatus("syncing");
      try {
        const statsDocRef = doc(db, "users", user.uid, "progress", "stats");
        const statsSnap = await getDoc(statsDocRef);

        if (statsSnap.exists()) {
          const cloudData = statsSnap.data();
          
          // If Firestore has higher or newer statistics, update local React state
          if (cloudData.points > stats.points || (cloudData.completedLessons || []).length > stats.completedLessons.length) {
            if (active) {
              const updatedLocalStats: UserStats = {
                completedLessons: cloudData.completedLessons || [],
                streakCount: cloudData.streakCount || 0,
                lastActiveDate: cloudData.lastActiveDate || "",
                points: cloudData.points || 0,
                timeSpentMinutes: cloudData.timeSpentMinutes || 0,
                history: cloudData.history || [],
                passedExams: cloudData.passedExams || [],
                examAttempts: cloudData.examAttempts || {}
              };
              onStatsSynced(updatedLocalStats);
            }
          } else {
            // Otherwise, backup our current local stats up to the cloud!
            await setDoc(statsDocRef, {
              userId: user.uid,
              points: stats.points,
              streakCount: stats.streakCount,
              lastActiveDate: stats.lastActiveDate,
              timeSpentMinutes: stats.timeSpentMinutes,
              completedLessons: stats.completedLessons,
              history: stats.history,
              passedExams: stats.passedExams || [],
              examAttempts: stats.examAttempts || {},
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
          if (active) setSyncStatus("synced");
        } else {
          // Initialize user's first statistics document in cloud
          await setDoc(statsDocRef, {
            userId: user.uid,
            points: stats.points,
            streakCount: stats.streakCount,
            lastActiveDate: stats.lastActiveDate,
            timeSpentMinutes: stats.timeSpentMinutes,
            completedLessons: stats.completedLessons,
            history: stats.history,
            passedExams: stats.passedExams || [],
            examAttempts: stats.examAttempts || {},
            updatedAt: serverTimestamp()
          });
          if (active) setSyncStatus("synced");
        }
      } catch (err) {
        console.error("Firestore sync fail:", err);
        if (active) setSyncStatus("error");
        // Conform to strict system handler specs
        try {
          handleFirestoreError(err, OperationType.GET, `/users/${user.uid}/progress/stats`);
        } catch (_) {}
      }
    };

    syncUserStats();
    return () => { active = false; };
  }, [user, stats.points, stats.completedLessons.length]);

  // 3. Real-Time Shared Bulletin listener (onSnapshot)
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setNotesLoading(false);
      return;
    }

    setNotesLoading(true);
    const notesQuery = query(
      collection(db, "studyNotes"),
      orderBy("createdAt", "desc"),
      limit(25)
    );

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const items: StudyNote[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: d.userId || "",
          userEmail: d.userEmail || "anonymous@lingolandverse.com",
          content: d.content || "",
          createdAt: d.createdAt,
          language: d.language || "English"
        });
      });
      setNotes(items);
      setNotesLoading(false);
    }, (error) => {
      console.error("Failed subscription:", error);
      setNotesLoading(false);
      try {
        handleFirestoreError(error, OperationType.LIST, "studyNotes");
      } catch (_) {}
    });

    return () => unsubscribe();
  }, [user]);

  // Handle Google Login action
  const handleLogin = async () => {
    try {
      setSyncStatus("syncing");
      await loginWithGoogle();
    } catch (err) {
      console.error("Google login rejected:", err);
      setSyncStatus("error");
    }
  };

  // Handle Logout action
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout issue:", err);
    }
  };

  // Submit Study Note
  const handleSubmitNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !noteContent.trim() || submittingNote) return;

    setSubmittingNote(true);
    try {
      const noteDocData = {
        userId: user.uid,
        userEmail: user.email || "student@lingolandverse.com",
        content: noteContent.trim(),
        language: noteLang,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "studyNotes"), noteDocData);
      setNoteContent("");
    } catch (err) {
      console.error("Failed creating Study Room note:", err);
      try {
        handleFirestoreError(err, OperationType.CREATE, "studyNotes");
      } catch (_) {}
    } finally {
      setSubmittingNote(false);
    }
  };

  // Play pronunciation via target language acoustic TTS
  const playSpeech = async (text: string, noteId: string) => {
    if (playingNoteId) return; // Prevent double trigger
    setPlayingNoteId(noteId);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          speakerName: "Zephyr" 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const audioUrl = `data:audio/wav;base64,${data.audio}`;
          const audio = new Audio(audioUrl);
          audio.onended = () => setPlayingNoteId(null);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Speech Synthesis fallback failing:", e);
    }

    // Browser WebSpeech backup fallback if API fails
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingNoteId(null);
      utterance.onerror = () => setPlayingNoteId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingNoteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper info panel banner with neobrutalist thick borders */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />
        <div className="space-y-2.5 relative">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-display flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            Live Full-Stack Sandbox
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">Acoustic Study Room</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome to the live interactive center. Here you can back up your points permanently to the cloud, chat with other students in real-time, and trigger Gemini Text-to-Speech voices directly on student bulletin notes!
          </p>
        </div>
      </div>

      {authLoading ? (
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-12 text-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Unlocking security lockers...</p>
        </div>
      ) : !user ? (
        /* LOCKED OUT VIEW - PROMPT USER LOGIN */
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 border-2 border-slate-900 px-3 py-1 rounded-full w-fit inline-block">
                Authentication Required
              </span>
              <h3 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight font-display">
                Synchronise Your Progress & Unlock the Collective Board!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                By logging in with your secure Google accounts, LingoLand will instantly sync your current points ({stats.points} XP) and completed lessons. This allows you to learn from multiple devices without losing your consecutive streaks.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pb-2">
                <div className="bg-slate-50 border-2 border-slate-900 p-3.5 rounded-xl text-left space-y-1">
                  <span className="font-extrabold text-slate-850 text-xs flex items-center gap-1.5 font-display uppercase">
                    🔒 Multi-device Sync
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Instantly save streaks, points, completed histories to the cloud.
                  </p>
                </div>
                <div className="bg-slate-50 border-2 border-slate-900 p-3.5 rounded-xl text-left space-y-1">
                  <span className="font-extrabold text-slate-850 text-xs flex items-center gap-1.5 font-display uppercase">
                    💬 Real-time Bulletin
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Write interactive notes, practice speaking, and read other students' notes.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.856 0-8.8-3.943-8.8-9.0s3.944-9.0 8.8-9.0c2.41 0 4.417.857 6.012 2.378L21.4 1.13C18.945-.965 15.65 0 12.24 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12c6.685 0 12-4.8 12-12 0-.829-.074-1.636-.214-2.378H12.24Z"/>
              </svg>
              <span>Verify Log in with Google</span>
            </button>
          </div>

          {/* RIGHT COL: MOCKUP BULLETIN PANEL PREVIEW */}
          <div className="md:col-span-2 bg-slate-100 border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4 flex flex-col justify-between opacity-80 select-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider font-display flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Bulletin Preview
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <div className="space-y-3">
                <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 text-xs font-semibold text-slate-550 space-y-1">
                  <p className="font-extrabold text-slate-800">"Sawasdee khrup! Perfecting Thai vocabulary pronunciation."</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>by thai.student@gmail.com</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-indigo-600 text-[8px] font-bold uppercase tracking-wider">Thai</span>
                  </div>
                </div>
                <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 text-xs font-semibold text-slate-555 space-y-1">
                  <p className="font-extrabold text-slate-850">"Spanish Present Perfect is super fun! He estudiado..."</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>by learn22@gmail.com</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-indigo-650 text-[8px] font-bold uppercase">Spanish</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-[10px] font-black text-indigo-600 uppercase tracking-widest font-display bg-indigo-50 border border-indigo-200 p-2 rounded-lg">
              Sign in to view real-time posts
            </div>
          </div>
        </div>
      ) : (
        /* LOGGED IN USER INTERFACE */
        <div className="grid md:grid-cols-3 gap-6">
          {/* USER DATABASE SYNC STATUS COLUMN */}
          <div className="space-y-6">
            {/* Authenticated user control card */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-900">
                <img 
                  referrerPolicy="no-referrer"
                  src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                  className="w-10 h-10 rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0" 
                  alt="user avatar"
                />
                <div className="overflow-hidden">
                  <h4 className="font-display font-black text-xs uppercase tracking-tight text-slate-900 truncate leading-none mb-1">
                    {user.displayName || "Lingo Student"}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold truncate leading-none">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-450 uppercase font-black tracking-widest font-display block">Total XP</span>
                    <span className="text-sm font-black text-rose-600 font-display leading-none">{stats.points}</span>
                  </div>
                  <Award className="w-5 h-5 text-rose-500 shrink-0" />
                </div>
                <div className="bg-slate-50 border-2 border-slate-900 p-3 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-455 uppercase font-black tracking-widest font-display block">Streak</span>
                    <span className="text-sm font-black text-amber-650 font-display leading-none">{stats.streakCount} days</span>
                  </div>
                  <Clock className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                </div>
              </div>

              {/* Sync check display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs font-bold text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[10px] uppercase font-display font-black">Cloud Backup Enabled</span>
                  </div>
                  {syncStatus === "syncing" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-650" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  )}
                </div>

                <div className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                  Progress coordinates are atomically linked to Firestore node sequence: <span className="font-mono text-[9px] bg-slate-100 p-1 rounded font-normal text-slate-600">{user.uid.slice(0, 8)}...</span>
                </div>
              </div>

              {/* Logout mechanism button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-slate-800 bg-slate-50 hover:bg-slate-100 font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Account</span>
              </button>
            </div>

            {/* Quick study metrics or tips cards */}
            <div className="bg-indigo-50 border-2 border-slate-900 p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-3">
              <h4 className="font-display font-black text-[10px] uppercase tracking-widest text-indigo-900">🔔 Student Room tip card</h4>
              <p className="text-[11px] text-indigo-950 font-bold leading-normal">
                Click on the speaker symbol <Volume2 className="w-3 h-3 text-indigo-700 inline shrink-0" /> next to any note card on the whiteboard! Gemini Speech Synthesis will read the note content aloud so you can check correct phonetics, pronunciation speed, and mouth articulation.
              </p>
            </div>
          </div>

          {/* MAIN CHAT & BULLETIN BOARD COLUMN */}
          <div className="md:col-span-2 space-y-6">
            {/* Whiteboard posting note form */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="text-xs font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-3 mb-4 flex items-center gap-2 font-display">
                <Plus className="w-4 h-4 text-indigo-600" />
                Pin New Note to Whiteboard
              </h3>

              <form onSubmit={handleSubmitNote} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="note-content" className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-display">
                    Note / Studied phrase (max 1000 characters)
                  </label>
                  <textarea
                    id="note-content"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="e.g., Just mastered Present Perfect! 'I have lived in Seville for five years.'"
                    required
                    maxLength={1000}
                    className="w-full h-24 bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400 text-slate-900"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                  <div className="flex items-center gap-3 shrink-0">
                    <label htmlFor="note-lang" className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-display shrink-0">
                      Focus Area:
                    </label>
                    <select
                      id="note-lang"
                      value={noteLang}
                      onChange={(e) => setNoteLang(e.target.value)}
                      className="bg-white border-2 border-slate-900 rounded-lg text-xs font-black px-2.5 py-1 uppercase tracking-wider font-display focus:outline-none"
                    >
                      <option value="English">General English</option>
                      <option value="Thai">Thai</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Japanese">Japanese</option>
                      <option value="French">French</option>
                      <option value="Korean">Korean</option>
                      <option value="German">German</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingNote || !noteContent.trim()}
                    className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            </div>

            {/* BULLETIN GRID WALL (REALTIME) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-display flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
                  Live Wall Bulletin Board ({notes.length} pinned)
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Real-time synced</span>
              </div>

              {notesLoading ? (
                <div className="bg-white border-2 border-slate-900 rounded-2xl p-12 text-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Dusting off the blackboard...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="bg-white border-2 border-slate-900 rounded-2xl p-12 text-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-2">
                  <HelpCircle className="w-8 h-8 text-indigo-300 mx-auto" />
                  <p className="text-xs text-slate-800 font-extrabold uppercase font-display">Whiteboard is entirely empty!</p>
                  <p className="text-[10px] text-slate-500 leading-normal max-w-sm mx-auto font-medium">
                    Be the very first language pioneer. Type what you are studying above and hit 'Post Note' to synchronize and pin your note.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4.5">
                  {notes.map((note) => {
                    const isPlaying = playingNoteId === note.id;
                    const ownerEmailPrefix = note.userEmail.includes("@") ? note.userEmail.split("@")[0] : "student";
                    return (
                      <div 
                        key={note.id} 
                        className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 duration-100 transition-all flex flex-col justify-between gap-4.5"
                      >
                        <div className="space-y-2.5">
                          {/* Header label */}
                          <div className="flex items-center justify-between border-b border-indigo-50/50 pb-2">
                            <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider font-mono">
                              💡 student: {ownerEmailPrefix}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded font-display font-black text-[9px] uppercase tracking-wider">
                              {note.language}
                            </span>
                          </div>

                          <p className="text-slate-900 text-xs font-semibold leading-relaxed font-sans">{note.content}</p>
                        </div>

                        {/* Speech Synthesis activator and state indicators */}
                        <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-100">
                          <span className="text-[8px] font-bold text-slate-400 font-display">
                            {note.createdAt?.seconds 
                              ? new Date(note.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : "Just now"
                            }
                          </span>

                          <button
                            id={`listen-${note.id}`}
                            onClick={() => playSpeech(note.content, note.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-900 text-[10px] font-black uppercase tracking-wider font-display shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px] cursor-pointer transition-all ${
                              isPlaying 
                                ? "bg-indigo-650 text-white animate-pulse" 
                                : "bg-white text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{isPlaying ? "Speaking..." : "Listen Voice"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
