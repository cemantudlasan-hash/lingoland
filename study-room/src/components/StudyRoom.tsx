import { useState, useEffect, useRef, FormEvent } from "react";
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
  Award,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  Sliders,
  CheckCircle2,
  Send
} from "lucide-react";
import { UserStats } from "../types";

interface StudyRoomProps {
  stats: UserStats;
  onStatsSynced: (cloudStats: UserStats) => void;
  user?: any;
}

interface StudyNote {
  id: string;
  userId: string;
  userEmail: string;
  content: string;
  createdAt: any;
  language?: string;
}

const DEFAULT_STUDY_NOTES: StudyNote[] = [
  {
    id: "seed-1",
    userId: "mentor-alex",
    userEmail: "alex.esl@lingolandverse.com",
    content: "English Tip: When describing past events connected to now, use Present Perfect: 'I have studied Thai for 6 months' (still studying) vs 'I studied Thai for 6 months' (finished).",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
    language: "General English"
  },
  {
    id: "seed-2",
    userId: "mentor-somchai",
    userEmail: "somchai.thai@lingolandverse.com",
    content: "Thai Tones Rule: High consonants + short vowel + dead ending always produce a LOW tone (e.g. ขะ - kha). Listen to native cadence by clicking the voice speaker!",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 7200 },
    language: "Thai"
  },
  {
    id: "seed-3",
    userId: "scholar-minji",
    userEmail: "minji.hangul@lingolandverse.com",
    content: "Korean Batchim: When final consonants (ㄱ, ㄷ, ㅂ) are followed by a vowel, they carry over to the next syllable! 한국어 is pronounced [한구거].",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 12000 },
    language: "Korean"
  },
  {
    id: "seed-4",
    userId: "scholar-kenji",
    userEmail: "kenji.nihon@lingolandverse.com",
    content: "Japanese Particles: は (wa) defines the topical frame, while が (ga) pinpoints the actor or answers 'who specifically'. Memorizing this clarifies every sentence!",
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 18000 },
    language: "Japanese"
  }
];

export default function StudyRoom({ stats, onStatsSynced, user: propUser }: StudyRoomProps) {
  const [user, setUser] = useState<any>(propUser || null);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  
  // Whiteboard Notes State (Initialized with LocalStorage or rich defaults)
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    try {
      const cached = localStorage.getItem("study_room_notes");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_STUDY_NOTES;
  });
  const [notesLoading, setNotesLoading] = useState(false);
  
  // New Note fields
  const [noteContent, setNoteContent] = useState("");
  const [noteLang, setNoteLang] = useState("General English");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // TTS audio playback states
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);

  // ── Pomodoro Focus Timer States ──
  const [timerMode, setTimerMode] = useState<"study" | "break">("study");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // ── Acoustic Focus Soundscape States ──
  const [activeSound, setActiveSound] = useState<"none" | "binaural" | "rain" | "cafe">("none");
  const [soundVolume, setSoundVolume] = useState(0.4);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ source?: any; gain?: GainNode; filter?: BiquadFilterNode } | null>(null);

  // Sync propUser if changed
  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      setAuthLoading(false);
    }
  }, [propUser]);

  // 1. Subscribe to Auth status shifts and external LingoLand sync
  useEffect(() => {
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

    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "SYNC_USER" && e.data?.user?.uid) {
        setUser(e.data.user);
      }
    };
    window.addEventListener("message", handleMsg);

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
            await setDoc(statsDocRef, {
              ...stats,
              lastSyncTimestamp: serverTimestamp()
            }, { merge: true });
          }
        } else {
          await setDoc(statsDocRef, {
            ...stats,
            lastSyncTimestamp: serverTimestamp()
          });
        }
        if (active) setSyncStatus("synced");
      } catch (err) {
        console.warn("Firestore sync error (offline or limited):", err);
        if (active) setSyncStatus("error");
      }
    };

    syncUserStats();
    return () => { active = false; };
  }, [user, stats.points, stats.completedLessons.length]);

  // 3. Real-Time Shared Bulletin listener (onSnapshot with graceful merge)
  useEffect(() => {
    if (!user?.uid) return;

    try {
      const notesQuery = query(
        collection(db, "studyNotes"),
        orderBy("createdAt", "desc"),
        limit(25)
      );

      const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
        const cloudItems: StudyNote[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          cloudItems.push({
            id: docSnap.id,
            userId: d.userId || "",
            userEmail: d.userEmail || "student@lingolandverse.com",
            content: d.content || "",
            createdAt: d.createdAt,
            language: d.language || "General English"
          });
        });

        if (cloudItems.length > 0) {
          setNotes((prev) => {
            // Merge cloud items avoiding duplicates
            const existingIds = new Set(cloudItems.map(c => c.id));
            const merged = [...cloudItems, ...prev.filter(p => !existingIds.has(p.id))];
            try {
              localStorage.setItem("study_room_notes", JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      }, (error) => {
        console.warn("Firestore snapshot subscription fallback to local cache:", error);
      });

      return () => unsubscribe();
    } catch (_) {}
  }, [user?.uid]);

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
      setUser(null);
    } catch (err) {
      console.error("Logout issue:", err);
    }
  };

  // ── SUBMIT STUDY NOTE (Instant Local Update + Persistent LocalStorage + Cloud Sync) ──
  const handleSubmitNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || submittingNote) return;

    setSubmittingNote(true);

    const authorEmail = user?.email || "scholar@lingolandverse.com";
    const newNoteId = "note-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);

    const newNote: StudyNote = {
      id: newNoteId,
      userId: user?.uid || "guest-scholar",
      userEmail: authorEmail,
      content: noteContent.trim(),
      language: noteLang,
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    };

    // 1. Immediately prepend note to local React state
    setNotes((prev) => {
      const updated = [newNote, ...prev.filter(n => n.id !== newNoteId)];
      try {
        localStorage.setItem("study_room_notes", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    // 2. Clear input and show instant positive feedback badge
    setNoteContent("");
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 3500);

    // 3. Background cloud write if Firebase user exists
    if (user?.uid) {
      try {
        await addDoc(collection(db, "studyNotes"), {
          userId: user.uid,
          userEmail: authorEmail,
          content: newNote.content,
          language: noteLang,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Cloud note sync fallback (stored locally):", err);
      }
    }

    setSubmittingNote(false);
  };

  // ── POMODORO TIMER LOGIC ──
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Play chime
      playTimerChime();
      if (timerMode === "study") {
        setTimerMode("break");
        setTimeLeft(5 * 60);
      } else {
        setTimerMode("study");
        setTimeLeft(25 * 60);
      }
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerMode === "study" ? 25 * 60 : 5 * 60);
  };
  const switchTimerMode = (mode: "study" | "break") => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    setTimeLeft(mode === "study" ? 25 * 60 : 5 * 60);
  };

  const playTimerChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (_) {}
  };

  // ── ACOUSTIC FOCUS SOUNDSCAPES (Web Audio API Synthesizer) ──
  const stopSoundscape = () => {
    if (soundNodesRef.current) {
      try {
        if (soundNodesRef.current.source) {
          if (soundNodesRef.current.source.stop) soundNodesRef.current.source.stop();
          if (soundNodesRef.current.source.disconnect) soundNodesRef.current.source.disconnect();
        }
      } catch (_) {}
      soundNodesRef.current = null;
    }
    setActiveSound("none");
  };

  const startSoundscape = (soundType: "binaural" | "rain" | "cafe") => {
    stopSoundscape();

    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(soundVolume, ctx.currentTime);
      mainGain.connect(ctx.destination);

      if (soundType === "binaural") {
        // Binaural 40Hz Gamma Focus: Left ear 200Hz, Right ear 240Hz
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);

        oscLeft.type = "sine";
        oscLeft.frequency.value = 210;
        oscRight.type = "sine";
        oscRight.frequency.value = 250;

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(mainGain);

        oscLeft.start();
        oscRight.start();

        soundNodesRef.current = {
          source: {
            stop: () => {
              oscLeft.stop();
              oscRight.stop();
            }
          },
          gain: mainGain
        };
      } else if (soundType === "rain") {
        // Gentle Rain Pink Noise Buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(mainGain);
        whiteNoise.start();

        soundNodesRef.current = { source: whiteNoise, gain: mainGain, filter };
      } else if (soundType === "cafe") {
        // Cafe Soft Ambiance Resonator
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(260, ctx.currentTime);
        filter.Q.setValueAtTime(3.0, ctx.currentTime);

        osc.connect(filter);
        filter.connect(mainGain);
        osc.start();

        soundNodesRef.current = { source: osc, gain: mainGain, filter };
      }

      setActiveSound(soundType);
    } catch (e) {
      console.warn("Could not start soundscape:", e);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setSoundVolume(newVol);
    if (soundNodesRef.current?.gain && audioCtxRef.current) {
      soundNodesRef.current.gain.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  // Play pronunciation via target language acoustic TTS
  const playSpeech = async (text: string, noteId: string, noteLang?: string) => {
    if (playingNoteId) return;
    setPlayingNoteId(noteId);

    const codeMap: Record<string, string> = {
      "General English": "en",
      English: "en",
      Thai: "th",
      Korean: "ko",
      Japanese: "ja",
      Spanish: "es",
      French: "fr",
      Vietnamese: "vi",
      Chinese: "zh",
      German: "de",
    };
    const targetLang = noteLang ? (codeMap[noteLang] || "en") : "en";

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          lang: targetLang,
          speakerName: "Zephyr" 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const mime = data.mime || "audio/mpeg";
          const audioUrl = `data:${mime};base64,${data.audio}`;
          const audio = new Audio(audioUrl);
          audio.onended = () => setPlayingNoteId(null);
          audio.onerror = () => setPlayingNoteId(null);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Speech Synthesis fallback failing:", e);
    }

    // Browser WebSpeech backup fallback if API fails
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const localeMap: Record<string, string> = {
          th: "th-TH",
          ko: "ko-KR",
          ja: "ja-JP",
          es: "es-ES",
          fr: "fr-FR",
          vi: "vi-VN",
          zh: "zh-CN",
          de: "de-DE",
          en: "en-US",
        };
        utterance.lang = localeMap[targetLang] || "en-US";
        utterance.rate = 0.9;
        utterance.onend = () => setPlayingNoteId(null);
        utterance.onerror = () => setPlayingNoteId(null);
        window.speechSynthesis.speak(utterance);
      } catch (_) {
        setPlayingNoteId(null);
      }
    } else {
      setPlayingNoteId(null);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Upper info panel banner with neobrutalist styling */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="space-y-2.5 relative">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-display flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Interactive Acoustic Study Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">Acoustic Study Room</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Your collaborative language workstation. Pin study notes to the collective whiteboard, play native acoustic TTS pronunciation, focus with synthesized binaural soundscapes, and structure study blocks with the Pomodoro timer.
          </p>
        </div>
      </div>

      {/* TOP WORKSPACE: 3 BENTO CARDS (Account Sync, Pomodoro Timer, Focus Soundscapes) */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* CARD 1: USER ACCOUNT & CLOUD PROGRESS */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <span className="text-xs font-black uppercase text-slate-900 font-display flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Student Account
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-slate-900 ${
                user ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
              }`}>
                {user ? "Cloud Synced" : "Guest Scholar"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img 
                referrerPolicy="no-referrer"
                src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                className="w-10 h-10 rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0" 
                alt="user avatar"
              />
              <div className="overflow-hidden">
                <h4 className="font-display font-black text-xs uppercase tracking-tight text-slate-900 truncate">
                  {user?.displayName || "Lingo Scholar"}
                </h4>
                <p className="text-[10px] text-slate-500 font-bold truncate">
                  {user?.email || "scholar@lingolandverse.com"}
                </p>
              </div>
            </div>

            {/* Quick stats highlights */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 border-2 border-slate-900 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest font-display block">Total XP</span>
                  <span className="text-sm font-black text-indigo-700 font-display">{stats.points}</span>
                </div>
                <Award className="w-4 h-4 text-indigo-600 shrink-0" />
              </div>
              <div className="bg-slate-50 border-2 border-slate-900 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest font-display block">Streak</span>
                  <span className="text-sm font-black text-amber-600 font-display">{stats.streakCount} days</span>
                </div>
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
            </div>
          </div>

          <div>
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-slate-800 bg-slate-50 hover:bg-slate-100 font-extrabold text-[10px] uppercase tracking-wider py-2.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Cloud Session</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer"
              >
                <span>Connect Google Account</span>
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: POMODORO FOCUS TIMER */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <span className="text-xs font-black uppercase text-slate-900 font-display flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Pomodoro Focus Timer
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => switchTimerMode("study")}
                  className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-900 cursor-pointer ${
                    timerMode === "study" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  25m Study
                </button>
                <button
                  onClick={() => switchTimerMode("break")}
                  className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-900 cursor-pointer ${
                    timerMode === "break" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  5m Break
                </button>
              </div>
            </div>

            <div className="text-center py-2">
              <span className="text-4xl font-black font-mono tracking-tight text-slate-900 block">
                {formatTimer(timeLeft)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                {timerMode === "study" ? "Deep Language Immersion" : "Rest & Hydrate"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTimer}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider font-display shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                isTimerRunning 
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? "Pause" : "Start Focus"}</span>
            </button>
            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="px-3 py-2.5 rounded-xl border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: ACOUSTIC FOCUS SOUNDSCAPES */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <span className="text-xs font-black uppercase text-slate-900 font-display flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-indigo-600" />
                Focus Soundscapes
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-slate-900 ${
                activeSound !== "none" ? "bg-indigo-100 text-indigo-900" : "bg-slate-100 text-slate-500"
              }`}>
                {activeSound !== "none" ? "Playing 🎵" : "Muted"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => activeSound === "binaural" ? stopSoundscape() : startSoundscape("binaural")}
                className={`p-2.5 rounded-xl border-2 border-slate-900 text-center transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none ${
                  activeSound === "binaural" ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                }`}
              >
                <span className="text-base block mb-0.5">🧠</span>
                <span className="text-[9px] font-black uppercase font-display block">40Hz Beat</span>
              </button>

              <button
                onClick={() => activeSound === "rain" ? stopSoundscape() : startSoundscape("rain")}
                className={`p-2.5 rounded-xl border-2 border-slate-900 text-center transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none ${
                  activeSound === "rain" ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                }`}
              >
                <span className="text-base block mb-0.5">🌧️</span>
                <span className="text-[9px] font-black uppercase font-display block">Rain Noise</span>
              </button>

              <button
                onClick={() => activeSound === "cafe" ? stopSoundscape() : startSoundscape("cafe")}
                className={`p-2.5 rounded-xl border-2 border-slate-900 text-center transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none ${
                  activeSound === "cafe" ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                }`}
              >
                <span className="text-base block mb-0.5">☕</span>
                <span className="text-[9px] font-black uppercase font-display block">Cafe Warmth</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
            <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={soundVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            {activeSound !== "none" && (
              <button 
                onClick={stopSoundscape}
                className="text-[9px] font-black uppercase text-rose-600 hover:underline shrink-0"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN SECTION: WHITEBOARD POSTING FORM & BULLETIN GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT COLUMN: PIN NEW NOTE FORM */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5 font-display">
                <Plus className="w-4 h-4 text-indigo-600" />
                Pin Note to Whiteboard
              </h3>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Interactive</span>
            </div>

            <form onSubmit={handleSubmitNote} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="note-content" className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-display block">
                  Study Note / Phrase / Grammar Rule:
                </label>
                <textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="e.g., Just mastered Korean batchim pronunciation! 한국어 sounds like [한구거]."
                  required
                  maxLength={1000}
                  className="w-full h-28 bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400 text-slate-900 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="note-lang" className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-display block">
                  Language Tag:
                </label>
                <select
                  id="note-lang"
                  value={noteLang}
                  onChange={(e) => setNoteLang(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 rounded-xl text-xs font-black p-2.5 uppercase tracking-wider font-display focus:outline-none cursor-pointer"
                >
                  <option value="General English">🇬🇧 General English</option>
                  <option value="Thai">🇹🇭 Thai</option>
                  <option value="Korean">🇰🇷 Korean</option>
                  <option value="Japanese">🇯🇵 Japanese</option>
                  <option value="French">🇫🇷 French</option>
                  <option value="Spanish">🇪🇸 Spanish</option>
                  <option value="Chinese">🇨🇳 Chinese</option>
                  <option value="Vietnamese">🇻🇳 Vietnamese</option>
                  <option value="German">🇩🇪 German</option>
                </select>
              </div>

              {noteSuccess && (
                <div className="bg-emerald-50 border-2 border-slate-900 p-2.5 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Note pinned to the collective whiteboard! 📌</span>
                </div>
              )}

              <button
                type="submit"
                id="post-note-button"
                disabled={submittingNote || !noteContent.trim()}
                className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest py-3 px-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none duration-150 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingNote ? "Pinning..." : "Post Note"}</span>
              </button>
            </form>
          </div>

          {/* QUICK ACOUSTIC TIP */}
          <div className="bg-indigo-50 border-2 border-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-2">
            <span className="font-display font-black text-[10px] uppercase tracking-widest text-indigo-900 block">
              💡 Acoustic Voice Synthesis
            </span>
            <p className="text-[11px] text-indigo-950 font-bold leading-normal">
              Click the speaker icon <Volume2 className="w-3 h-3 text-indigo-700 inline" /> next to any note to hear native voice pronunciation powered by acoustic TTS synthesis.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: BULLETIN BOARD NOTES FEED */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white border-2 border-slate-900 p-3 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
              Shared Collective Whiteboard ({notes.length} Pinned)
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase">
              All Languages
            </span>
          </div>

          <div className="grid gap-3.5 max-h-[700px] overflow-y-auto pr-1">
            {notes.map((note) => {
              const isPlaying = playingNoteId === note.id;
              const ownerEmailPrefix = note.userEmail.includes("@") ? note.userEmail.split("@")[0] : "scholar";

              return (
                <div 
                  key={note.id} 
                  className="bg-white border-2 border-slate-900 rounded-2xl p-4.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 duration-100 transition-all flex flex-col justify-between gap-3.5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">
                        👤 {ownerEmailPrefix}
                      </span>
                      <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full font-display font-black text-[9px] uppercase tracking-wider">
                        {note.language || "General English"}
                      </span>
                    </div>

                    <p className="text-slate-900 text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200">
                    <span className="text-[8px] font-bold text-slate-400 font-display">
                      {note.createdAt?.seconds 
                        ? new Date(note.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "Just now"
                      }
                    </span>

                    <button
                      id={`listen-${note.id}`}
                      onClick={() => playSpeech(note.content, note.id, note.language)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-900 text-[10px] font-black uppercase tracking-wider font-display shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px] cursor-pointer transition-all ${
                        isPlaying 
                          ? "bg-indigo-600 text-white animate-pulse" 
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
        </div>
      </div>
    </div>
  );
}
