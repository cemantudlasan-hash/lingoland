"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  Award, 
  BookOpen, 
  Play, 
  Flame, 
  Compass, 
  HelpCircle, 
  Heart, 
  CheckCircle2, 
  Target, 
  Clock, 
  Settings2, 
  Zap, 
  Shuffle, 
  Gamepad2, 
  User, 
  Users, 
  GraduationCap 
} from "lucide-react";
import { Question, Team, GameConfig, PRESET_CATEGORIES } from "@/lib/game-types-corridor";
import { generateDynamicQuestions } from "@/lib/questionGenerator-corridor";
import ThreeGame from "./ThreeGame";
import TeacherPanel from "../TeacherPanel";
import Leaderboard from "../Leaderboard";
import { audioEngine } from "../AudioEngine";
import { useFirestore } from "@/firebase";
import { useAuth } from "@/context/auth-context";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

// Seed default classroom teams list
const DEFAULT_TEAMS: Team[] = [
  { id: "team-1", name: "Grammar Wizards (Row A)", score: 850, multiplier: 1, questionsAnswered: 10, correctAnswers: 8 },
  { id: "team-2", name: "Lexi-Knights (Row B)", score: 1200, multiplier: 1, questionsAnswered: 12, correctAnswers: 11 },
  { id: "team-3", name: "Phonic Dragons (Row C)", score: 620, multiplier: 1, questionsAnswered: 8, correctAnswers: 6 }
];

export default function ThreeCorridorSpeed({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const firestore = useFirestore();
  const { user } = useAuth();
  // Screens state: "MENU" | "PLAYING" | "TEACHER" | "LEADERBOARD" | "POST_GAME"
  const [screen, setScreen] = useState<"MENU" | "PLAYING" | "TEACHER" | "LEADERBOARD" | "POST_GAME">("MENU");

  // Game active config
  const [questions, setQuestions] = useState<Question[]>([...PRESET_CATEGORIES[0].questions]);
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // Setup real-time listener to Firestore classroom_teams
  useEffect(() => {
    if (!firestore) return;
    const unsubscribe = onSnapshot(collection(firestore, "classroom_teams"), (snapshot) => {
      if (snapshot.empty) {
        // Seed default teams if Firestore collection is empty
        DEFAULT_TEAMS.forEach(async (t) => {
          try {
            await setDoc(doc(firestore, "classroom_teams", t.id), t);
          } catch (e) {
            console.error("Firestore seeding error:", e);
          }
        });
      } else {
        const list: Team[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Team);
        });
        list.sort((a, b) => b.score - a.score);
        setTeams(list);
      }
    }, (error) => {
      console.error("Firestore classroom_teams onSnapshot error:", error);
    });

    return () => unsubscribe();
  }, [firestore]);

  // Runner difficulty sliders
  const [speed, setSpeed] = useState<number>(2.5); // 1 = easy/slow, 3 = normal, 5 = hyper
  const [duration, setDuration] = useState<number>(90); // 90 seconds default
  const [invincible, setInvincible] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(false);
  const [maxQuestionsPerGame, setMaxQuestionsPerGame] = useState<number>(10); // rounds/items limit
  const [startingLives, setStartingLives] = useState<number>(3);
  const [lifeLossPerMistake, setLifeLossPerMistake] = useState<number>(1);
  const [continueOnZeroHealth, setContinueOnZeroHealth] = useState<boolean>(false);

  // Optional Multiplayer & Singleplayer mode states
  const [gameMode, setGameMode] = useState<"single" | "multi">("single");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport for responsive split-screen layout
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [p1Questions, setP1Questions] = useState<Question[]>([]);
  const [p2Questions, setP2Questions] = useState<Question[]>([]);

  // Split-screen individual completion statistics
  const [p1Stats, setP1Stats] = useState<{ score: number; correctCount: number; totalCount: number; completed: boolean; obstacleHits: number } | null>(null);
  const [p2Stats, setP2Stats] = useState<{ score: number; correctCount: number; totalCount: number; completed: boolean; obstacleHits: number } | null>(null);

  // Post game stats
  const [lastGameStats, setLastGameStats] = useState<{
    score: number;
    correctCount: number;
    totalCount: number;
    teamName: string | null;
    obstacleHits: number;
  } | null>(null);

  // Shuffle questions array helper to ensure players get "different questions" simultaneously
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startPlaying = () => {
    // If the question bank is smaller than the requested count, auto-augment with dynamic questions
    let activeBank = questions;
    if (questions.length < maxQuestionsPerGame) {
      const extra = generateDynamicQuestions(maxQuestionsPerGame * 3); // generate a big pool
      // Combine preset + dynamic, deduplicate by id
      const combined = [...questions, ...extra.filter(q => !questions.find(e => e.id === q.id))];
      activeBank = combined;
    }

    // Generate distinct randomized question sets for different runners, sliced to round length constraint
    const shuffledP1 = shuffleArray(activeBank).slice(0, maxQuestionsPerGame);
    const shuffledP2 = shuffleArray(activeBank).slice(0, maxQuestionsPerGame);
    setP1Questions(shuffledP1);
    setP2Questions(shuffledP2);

    setP1Stats(null);
    setP2Stats(null);

    setScreen("PLAYING");
  };

  // Save teams locally
  const saveTeams = (newTeams: Team[]) => {
    setTeams(newTeams);
    localStorage.setItem("classroom_teams", JSON.stringify(newTeams));
  };

  const handleLevelSave = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
  };

  // Add a new classroom group/row
  const handleAddTeam = async (name: string) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      score: 0,
      multiplier: 1,
      questionsAnswered: 0,
      correctAnswers: 0
    };
    try {
      await setDoc(doc(firestore, "classroom_teams", newTeam.id), newTeam);
    } catch (e) {
      console.error("Firebase error during adding team:", e);
      const next = [...teams, newTeam];
      saveTeams(next);
    }
  };

  // Remove a classroom group/row
  const handleRemoveTeam = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, "classroom_teams", id));
      if (activeTeamId === id) setActiveTeamId(null);
    } catch (e) {
      console.error("Firebase error during removing team:", e);
      const next = teams.filter((t) => t.id !== id);
      if (activeTeamId === id) setActiveTeamId(null);
      saveTeams(next);
    }
  };

  const handleResetScores = async () => {
    try {
      for (const team of teams) {
        await updateDoc(doc(firestore, "classroom_teams", team.id), {
          score: 0,
          questionsAnswered: 0,
          correctAnswers: 0
        });
      }
    } catch (e) {
      console.error("Firebase error resetting scores:", e);
      const reset = teams.map((t) => ({ ...t, score: 0, questionsAnswered: 0, correctAnswers: 0 }));
      saveTeams(reset);
    }
  };

  const toggleSound = () => {
    const status = audioEngine.toggleMute();
    setIsMuted(status);
  };

  // Callback when a 3D run completes in Single Player mode
  const handleGameCompleted = async (achievedScore: number, correctCount: number, totalQuestions: number, obstacleHits: number = 0) => {
    // If an active session team is registered, update their row statistics
    let currentTeamName: string | null = null;
    if (activeTeamId) {
      const teamToUpdate = teams.find(t => t.id === activeTeamId);
      if (teamToUpdate) {
        currentTeamName = teamToUpdate.name;
        try {
          await updateDoc(doc(firestore, "classroom_teams", activeTeamId), {
            score: teamToUpdate.score + achievedScore,
            questionsAnswered: teamToUpdate.questionsAnswered + totalQuestions,
            correctAnswers: teamToUpdate.correctAnswers + correctCount
          });
        } catch (e) {
          console.error("Firestore update score error:", e);
          const updated = teams.map((team) => {
            if (team.id === activeTeamId) {
              return {
                ...team,
                score: team.score + achievedScore,
                questionsAnswered: team.questionsAnswered + totalQuestions,
                correctAnswers: team.correctAnswers + correctCount
              };
            }
            return team;
          });
          saveTeams(updated);
        }
      }
    }

    setLastGameStats({
      score: achievedScore,
      correctCount,
      totalCount: totalQuestions,
      teamName: currentTeamName,
      obstacleHits,
    });

    // Display rich rewards screens
    setScreen("POST_GAME");

    // Splash gorgeous celebratory confetti
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    if (accuracy >= 65) {
      // Fire double side confetti canons!
      const end = Date.now() + (3 * 1000); // 3 seconds streak
      const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }, 200);
    }
  };

  // Callback when Player 1 finishes in Multiplayer
  const handleP1Completed = (achievedScore: number, correctCount: number, totalQuestions: number, obstacleHits: number = 0) => {
    setP1Stats({ score: achievedScore, correctCount, totalCount: totalQuestions, completed: true, obstacleHits });
  };

  // Callback when Player 2 finishes in Multiplayer
  const handleP2Completed = (achievedScore: number, correctCount: number, totalQuestions: number, obstacleHits: number = 0) => {
    setP2Stats({ score: achievedScore, correctCount, totalCount: totalQuestions, completed: true, obstacleHits });
  };

  // Coordinate multiplayer completion via useEffect to completely bypass stale closure state bugs
  useEffect(() => {
    const processMultiplayerCompleted = async () => {
      if (p1Stats?.completed && p2Stats?.completed && screen === "PLAYING") {
        let currentTeamName: string | null = null;
        const winningScore = Math.max(p1Stats.score, p2Stats.score);
        
        try {
          if (activeTeamId) {
            const teamToUpdate = teams.find(t => t.id === activeTeamId);
            if (teamToUpdate) {
              currentTeamName = teamToUpdate.name;
              try {
                await updateDoc(doc(firestore, "classroom_teams", activeTeamId), {
                  score: teamToUpdate.score + winningScore,
                  questionsAnswered: (teamToUpdate.questionsAnswered || 0) + (p1Stats.totalCount || 0) + (p2Stats.totalCount || 0),
                  correctAnswers: (teamToUpdate.correctAnswers || 0) + (p1Stats.correctCount || 0) + (p2Stats.correctCount || 0)
                });
              } catch (e) {
                console.error("Firestore multiplayer update score error:", e);
                // Fallback
                const updated = teams.map((team) => {
                  if (team.id === activeTeamId) {
                    return {
                      ...team,
                      score: team.score + winningScore,
                      questionsAnswered: (team.questionsAnswered || 0) + (p1Stats.totalCount || 0) + (p2Stats.totalCount || 0),
                      correctAnswers: (team.correctAnswers || 0) + (p1Stats.correctCount || 0) + (p2Stats.correctCount || 0)
                    };
                  }
                  return team;
                });
                saveTeams(updated);
              }
            }
          }
        } catch (err) {
          console.warn("Storage or Map exception during multiplayer completion score assignment:", err);
        }

        setLastGameStats({
          score: winningScore,
          correctCount: (p1Stats.correctCount || 0) + (p2Stats.correctCount || 0),
          totalCount: (p1Stats.totalCount || 0) + (p2Stats.totalCount || 0),
          teamName: currentTeamName,
          obstacleHits: (p1Stats.obstacleHits || 0) + (p2Stats.obstacleHits || 0),
        });

        setScreen("POST_GAME");

        // Celebrate victory!
        if (p1Stats.score > 0 || p2Stats.score > 0) {
          try {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });
          } catch (err) {
            console.warn("Confetti ignored on sandbox iframe: ", err);
          }
        }
      }
    };

    processMultiplayerCompleted();
  }, [p1Stats, p2Stats, screen, activeTeamId, teams]);

  const activeTeam = teams.find((t) => t.id === activeTeamId);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-slate-900 relative overflow-hidden font-sans">
      
      {/* Background Deco Letters - Artistic Flair Theme */}
      <div className="absolute -top-16 -left-16 text-[220px] md:text-[340px] font-black text-slate-800/10 select-none pointer-events-none tracking-tighter">ABC</div>
      <div className="absolute -bottom-16 -right-16 text-[220px] md:text-[340px] font-black text-slate-800/10 select-none pointer-events-none tracking-tighter">XYZ</div>

      {/* Decorative starry skies top gradient */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-teal-950/10 to-transparent pointer-events-none" />

      {/* Main navigation menu header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-805/60 bg-slate-950/20 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-teal-400">English Lab // Interactive Runner</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
            LEXI<span className="text-teal-400">RUN 3D</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs border-l-2 border-slate-700 pl-3 uppercase tracking-wider hidden sm:block">
            Subject: Grammar & Vocabulary Chambers
          </p>
        </div>

        {/* Global Sound Toggles and current Team stats block */}
        <div className="flex gap-4 items-center self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className="p-3 bg-slate-800 hover:bg-slate-705 text-teal-400 hover:text-teal-350 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-md"
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="h-10 w-[1px] bg-slate-800" />
          </div>

          <div className="flex gap-4 items-center">
            <div className="text-right">
              <div className="text-[9px] uppercase opacity-55 font-bold mb-0.5 tracking-wider font-mono">ACTIVE ROOM PLAYER</div>
              <div className="text-xs font-mono font-bold tracking-wide bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-teal-350">
                👥 {activeTeam ? activeTeam.name : "Solo Guest (Practice)"}
              </div>
            </div>
            <div className="bg-white text-slate-900 px-4 py-2.5 rounded-xl flex flex-col items-center justify-center min-w-[90px] shadow-[0_5px_0_#CBD5E1]">
              <span className="text-[9px] font-black uppercase tracking-wider">ROOM SPEED</span>
              <span className="text-xl font-black tabular-nums">{speed}X</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Orchestration Dashboard Router */}
      <main className="relative z-20 flex-grow flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          
          {screen === "MENU" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              {/* Outer card frame styled with rounded-[40px] and border border-white/10 matching design */}
              <div className="bg-slate-800/40 border border-white/10 rounded-[40px] p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col gap-6 md:gap-8">
                
                {/* Theme colored visual glows */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 relative z-10">
                  
                  {/* Left Column: Interactive play launcher */}
                  <div className="md:col-span-7 flex flex-col justify-between gap-6">
                    <div>
                      {/* Sub-header icon tag */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono text-[10px] font-bold tracking-wider uppercase mb-5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                        Interactive 3D Corridor Gaming
                      </div>

                      <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white leading-none mb-4">
                        WORD<span className="text-teal-400">QUEST 3D</span>
                      </h1>

                      <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed mb-6 border-l-2 border-teal-550/40 pl-4 font-sans">
                        Challenge students to steer droids high-speed through grammar, tense, and vocabulary portals. Tap left/right or use keyboard keys to pass correct response gates!
                      </p>
                    </div>

                    {/* Button actions layout with block shadow effects */}
                    <div className="flex flex-col gap-4">
                      {/* Interactive Play Mode Selector to make Multiplayer optional */}
                      <div className="bg-slate-900/60 p-4 rounded-3xl border border-white/5 space-y-3">
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest font-mono block">
                          🎮 Select Game Mode
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playMove();
                              setGameMode("single");
                            }}
                            className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                              gameMode === "single"
                                ? "bg-teal-500/10 border-teal-500 text-teal-300"
                                : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-750"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider font-sans">Single Player</span>
                              <User className="w-3.5 h-3.5 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 leading-tight">Practice solo on a full-screen cyberway</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playMove();
                              setGameMode("multi");
                            }}
                            className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                              gameMode === "multi"
                                ? "bg-pink-500/10 border-pink-500 text-pink-300"
                                : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-750"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider font-sans">Classroom Duel</span>
                              <Users className="w-3.5 h-3.5 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 leading-tight">2-Player split-screen simultaneous racing</span>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          audioEngine.playMove();
                          startPlaying();
                        }}
                        className="w-full py-4 px-6 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-350 hover:to-emerald-400 text-slate-950 font-black tracking-widest text-sm rounded-2xl transition-all shadow-[0_6px_0_#064e3b] active:translate-y-1 active:shadow-[0_2px_0_#064e3b] flex items-center justify-center gap-2 cursor-pointer uppercase font-sans"
                        id="play-solo-btn"
                      >
                        <Play className="w-5 h-5 fill-current text-slate-950" />
                        {gameMode === "single" ? "Launch Solo Run" : "Launch Split-Screen Duel"}
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            audioEngine.playMove();
                            setScreen("TEACHER");
                          }}
                          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Settings2 className="w-4 h-4 text-teal-400" />
                          Teacher Room
                        </button>
                        
                        <button
                          onClick={() => {
                            audioEngine.playMove();
                            setScreen("LEADERBOARD");
                          }}
                          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Trophy className="w-4 h-4 text-orange-400" />
                          Class Board
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Speed Control & Level presets previews widget */}
                  <div className="md:col-span-5 flex flex-col justify-between gap-6 p-5 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-md">
                    <div>
                      <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-teal-400 mb-4 flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <Settings className="w-4 h-4 text-teal-400" />
                        RUNNER CONFIGURATION
                      </h2>

                      {/* Speed tuning slider */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center text-xs font-mono mb-1">
                            <span className="text-slate-400">Class speed flow</span>
                            <span className="text-teal-400 font-bold">
                              {speed <= 1.5 ? "Elementary / Slow" : speed <= 3.5 ? "Standard" : "Hyper / Fast"} ({speed}x)
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="5.0"
                            step="0.5"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-teal-400"
                          />
                        </div>

                        {/* Play duration tuning slider */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-mono mb-1">
                            <span className="text-slate-400">Session Timer</span>
                            <span className="text-orange-400 font-bold">{duration} seconds</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="180"
                            step="15"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-orange-400"
                          />
                        </div>

                        {/* Questions per Game tuning slider */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-mono mb-1">
                            <span className="text-slate-400">Questions per Game</span>
                            <span className="text-teal-400 font-bold">{maxQuestionsPerGame} Items</span>
                          </div>
                          <input
                            type="range"
                            min="3"
                            max="30"
                            step="1"
                            value={maxQuestionsPerGame}
                            onChange={(e) => setMaxQuestionsPerGame(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-teal-400"
                          />
                          <p className="text-[9px] mt-1 font-mono"> 
                            {maxQuestionsPerGame > questions.length
                              ? <span className="text-amber-400">⚡ Bank has {questions.length} questions — extra will be auto-generated on launch.</span>
                              : <span className="text-slate-500">Bank: {questions.length} questions available.</span>
                            }
                          </p>
                        </div>

                        {/* Starting Health / Lives */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-mono mb-1">
                            <span className="text-slate-400">Starting Lives</span>
                            <span className="text-rose-400 font-bold">{startingLives} Hearts</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={startingLives}
                            onChange={(e) => setStartingLives(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-rose-400"
                          />
                        </div>

                        {/* Penalty per error */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-mono mb-1">
                            <span className="text-slate-400">Life Loss per Error</span>
                            <span className="text-yellow-400 font-bold">-{lifeLossPerMistake} Heart{lifeLossPerMistake !== 1 ? 's' : ''}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="1"
                            value={lifeLossPerMistake}
                            onChange={(e) => setLifeLossPerMistake(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                          />
                          <p className="text-[9px] text-slate-500 mt-1 font-mono">
                            Set to 0 to prevent any life reduction.
                          </p>
                        </div>

                        {/* Continue on zero lives */}
                        <div className="pt-1">
                          <label className="flex items-center gap-3 bg-slate-950/40 border border-white/5 p-3 rounded-2xl cursor-pointer hover:bg-slate-800/40 transition-all">
                            <input
                              type="checkbox"
                              checked={continueOnZeroHealth}
                              onChange={(e) => setContinueOnZeroHealth(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-400 w-4 h-4 cursor-pointer"
                            />
                            <div className="text-left font-sans">
                              <p className="text-xs font-bold text-slate-100">Ignore Zero Lives</p>
                              <p className="text-[10px] text-slate-400 leading-tight">Keep playing until last round even on empty health</p>
                            </div>
                          </label>
                        </div>

                        {/* Invincible bypass health */}
                        <div className="pt-1">
                          <label className="flex items-center gap-3 bg-slate-950/40 border border-white/5 p-3 rounded-2xl cursor-pointer hover:bg-slate-800/40 transition-all">
                            <input
                              type="checkbox"
                              checked={invincible}
                              onChange={(e) => setInvincible(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-400 w-4 h-4 cursor-pointer"
                            />
                            <div className="text-left font-sans">
                              <p className="text-xs font-bold text-slate-100">Endless Mode</p>
                              <p className="text-[10px] text-slate-400 leading-tight">Disable collision Game Over (ideal for learning loops)</p>
                            </div>
                          </label>
                        </div>
                      </div>

                    </div>

                    {/* Custom Quiz Metadata indicator */}
                    <div className="pt-4 border-t border-slate-800 text-left space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>ACTIVE QUIZ BANK:</span>
                        <span className="text-teal-400 font-bold">{questions.length} Questions</span>
                      </div>
                      
                      <div className="p-3 bg-teal-950/20 border border-teal-500/20 rounded-xl flex items-center gap-2 text-slate-300 text-xs">
                        <BookOpen className="w-4 h-4 text-teal-400 shrink-0" />
                        <span className="truncate block font-semibold leading-tight text-white font-sans">
                          Topic: {questions[0]?.category || "General English Vocabulary"}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          audioEngine.playScorePopup();
                          const generated = generateDynamicQuestions(20);
                          setQuestions(generated);
                        }}
                        className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-750 text-teal-300 hover:text-white rounded-xl font-bold font-mono tracking-wide text-[10px] uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                        id="quick-randomize-btn"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-teal-400" />
                        Auto-Generate Random Deck
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {screen === "PLAYING" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full fixed inset-0 z-30"
              style={{ touchAction: "none" }}
            >
              {gameMode === "single" ? (
                <div className="relative w-full h-full">
                  <ThreeGame
                    playerRole="single"
                    config={{
                      speed,
                      duration,
                      invincible,
                      activeQuestions: p1Questions.length > 0 ? p1Questions : questions,
                      currentTeamId: activeTeamId,
                      startingLives,
                      lifeLossPerMistake,
                      continueOnZeroHealth,
                    }}
                    onGameCompleted={handleGameCompleted}
                    onExit={() => setScreen("MENU")}
                  />
                </div>
              ) : (
                <div className={`w-full h-full grid ${isMobile ? 'grid-rows-2 grid-cols-1' : 'grid-cols-2 grid-rows-1'} bg-slate-950 p-1 gap-1 relative`} style={{ maxWidth: '100vw', maxHeight: '100vh', overflow: 'hidden' }}>
                  {/* Left Column: Player 1 (Pink) */}
                  <div className="relative w-full h-full border border-pink-500/20 rounded-2xl overflow-hidden bg-slate-900">
                    {p1Stats?.completed ? (
                      <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md font-sans">
                        <CheckCircle2 className="w-12 h-12 text-pink-400 animate-pulse mb-3" />
                        <h3 className="text-xl font-bold font-mono text-pink-300">P1 FINISHED</h3>
                        <p className="text-slate-400 text-xs mt-1">Score: {p1Stats.score.toLocaleString()}</p>
                        
                        {p2Stats?.completed ? (
                          <div className="mt-5 p-4 rounded-xl border border-dashed border-pink-500/30 bg-slate-900/80 max-w-xs w-full">
                            <p className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest mb-1.5">DUEL COMPLETED</p>
                            <p className="text-xs font-bold text-white mb-3">
                              {p1Stats.score > p2Stats.score 
                                ? "🏆 PLAYER 1 VICTORIOUS!" 
                                : p2Stats.score > p1Stats.score 
                                  ? "Player 2 Won!" 
                                  : "🤝 Match Tied!"}
                            </p>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  audioEngine.playMove();
                                  setScreen("POST_GAME");
                                }}
                                className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-slate-950 font-black tracking-wider uppercase text-[10.5px] rounded-lg transition-all shadow-md cursor-pointer"
                              >
                                View Detailed Board
                              </button>
                              <button
                                onClick={() => {
                                  audioEngine.playMove();
                                  setScreen("MENU");
                                }}
                                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono font-bold uppercase text-[9.5px] rounded-lg transition-all border border-slate-700 cursor-pointer shadow-sm"
                              >
                                ⬅️ Back to Main Menu
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500 text-[10px] mt-2 animate-pulse">Waiting for Player 2 to complete...</p>
                        )}
                      </div>
                    ) : (
                      <ThreeGame
                        playerRole="p1"
                        config={{
                          speed,
                          duration,
                          invincible,
                          activeQuestions: p1Questions,
                          currentTeamId: activeTeamId,
                          startingLives,
                          lifeLossPerMistake,
                          continueOnZeroHealth,
                        }}
                        onGameCompleted={(sc, corr, tot, hits) => handleP1Completed(sc, corr, tot, hits)}
                        onExit={() => setScreen("MENU")}
                      />
                    )}
                  </div>

                  {/* Right Column: Player 2 (Cyan) */}
                  <div className="relative w-full h-full border border-cyan-500/20 rounded-2xl overflow-hidden bg-slate-900">
                    {p2Stats?.completed ? (
                      <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md font-sans">
                        <CheckCircle2 className="w-12 h-12 text-cyan-400 animate-pulse mb-3" />
                        <h3 className="text-xl font-bold font-mono text-cyan-300">P2 FINISHED</h3>
                        <p className="text-slate-400 text-xs mt-1">Score: {p2Stats.score.toLocaleString()}</p>
                        
                        {p1Stats?.completed ? (
                          <div className="mt-5 p-4 rounded-xl border border-dashed border-cyan-500/30 bg-slate-900/80 max-w-xs w-full">
                            <p className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1.5">DUEL COMPLETED</p>
                            <p className="text-xs font-bold text-white mb-3">
                              {p2Stats.score > p1Stats.score 
                                ? "🏆 PLAYER 2 VICTORIOUS!" 
                                : p1Stats.score > p2Stats.score 
                                  ? "Player 1 Won!" 
                                  : "🤝 Match Tied!"}
                            </p>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  audioEngine.playMove();
                                  setScreen("POST_GAME");
                                }}
                                className="w-full py-2 bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-350 hover:to-teal-400 text-slate-950 font-black tracking-wider uppercase text-[10.5px] rounded-lg transition-all shadow-md cursor-pointer"
                              >
                                View Detailed Board
                              </button>
                              <button
                                onClick={() => {
                                  audioEngine.playMove();
                                  setScreen("MENU");
                                }}
                                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono font-bold uppercase text-[9.5px] rounded-lg transition-all border border-slate-700 cursor-pointer shadow-sm"
                              >
                                ⬅️ Back to Main Menu
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500 text-[10px] mt-2 animate-pulse">Waiting for Player 1 to complete...</p>
                        )}
                      </div>
                    ) : (
                      <ThreeGame
                        playerRole="p2"
                        config={{
                          speed,
                          duration,
                          invincible,
                          activeQuestions: p2Questions,
                          currentTeamId: activeTeamId,
                          startingLives,
                          lifeLossPerMistake,
                          continueOnZeroHealth,
                        }}
                        onGameCompleted={(sc, corr, tot, hits) => handleP2Completed(sc, corr, tot, hits)}
                        onExit={() => setScreen("MENU")}
                      />
                    )}
                  </div>

                  {/* Desktop: Vertical divider */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700/60 hidden md:block z-20 pointer-events-none transform -translate-x-1/2" />

                  {/* Mobile: Horizontal divider */}
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-700/60 block md:hidden z-20 pointer-events-none transform -translate-y-1/2" />

                  {/* EXIT DUEL — floats at top center above both screens */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                    <button
                      onClick={() => setScreen("MENU")}
                      className="bg-rose-600/90 backdrop-blur-md border-2 border-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-[11px] font-black font-mono tracking-widest uppercase cursor-pointer transition-all shadow-[0_4px_0_#991b1b] active:translate-y-1 active:shadow-none"
                    >
                      ⬅ BACK TO MENU
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {screen === "TEACHER" && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-6xl"
            >
              <TeacherPanel
                activeQuestions={questions}
                onSaveQuestions={handleLevelSave}
                onBack={() => setScreen("MENU")}
                onLaunchGame={() => {
                  audioEngine.playMove();
                  setScreen("PLAYING");
                }}
              />
            </motion.div>
          )}

          {screen === "LEADERBOARD" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-4xl"
            >
              <Leaderboard
                teams={teams}
                activeTeamId={activeTeamId}
                onSelectActiveTeam={setActiveTeamId}
                onAddTeam={handleAddTeam}
                onRemoveTeam={handleRemoveTeam}
                onResetScores={handleResetScores}
                onBack={() => setScreen("MENU")}
              />
            </motion.div>
          )}

          {screen === "POST_GAME" && (
            <motion.div
              key="post-game"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`w-full ${gameMode === "multi" ? "max-w-3xl" : "max-w-xl"}`}
            >
              <div className="bg-slate-900/90 border-2 border-teal-500/30 p-6 md:p-8 rounded-[36px] shadow-2xl flex flex-col items-center text-center font-sans backdrop-blur-md relative overflow-hidden">
                
                {/* Futuristic ambient light streaks */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Scoreboard visual header */}
                <div className="w-16 h-16 rounded-2xl bg-teal-500/25 text-teal-400 flex items-center justify-center border-2 border-teal-400/30 mb-4 animate-bounce shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                  <Trophy className="w-8 h-8 filter drop-shadow-[0_2px_8px_rgba(20,184,166,0.5)]" />
                </div>

                <div className="mb-2">
                  <span className="text-[10px] tracking-[0.3em] font-black uppercase text-teal-400 font-mono bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/50">
                    🏆 OFFICIAL SCOREBOARD 🏆
                  </span>
                </div>

                {/* Ignore Life Loss Active HUD Notification */}
                {(continueOnZeroHealth || invincible) && (
                  <div className="w-full max-w-md mx-auto mb-5 py-2 px-3 bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-mono rounded-xl flex items-center justify-center gap-2 animate-pulse">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>IGNORE LIFE LOSS ACTIVE — COMPLETED ALL ROUND ITEMS</span>
                  </div>
                )}

                {gameMode === "multi" && p1Stats && p2Stats ? (
                  <>
                    <h1 className="text-3xl md:text-4xl font-extrabold italic tracking-tighter text-white mb-2 uppercase">
                      DUEL<span className="text-pink-400"> SHOWDOWN</span>
                    </h1>
                    
                    {/* Winner announcement banner */}
                    <div className="w-full py-3 px-4 mb-6 rounded-2xl border-2 border-dashed border-teal-400/30 text-base font-black tracking-widest font-mono uppercase bg-slate-950/90 shadow-inner">
                      {p1Stats.score > p2Stats.score ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-pink-400 animate-pulse text-lg">🏆 PLAYER 1 VICTORIOUS! 🏆</span>
                          <span className="text-[10px] text-slate-400 font-normal">Outperformed Player 2 by {(p1Stats.score - p2Stats.score).toLocaleString()} points</span>
                        </div>
                      ) : p2Stats.score > p1Stats.score ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-cyan-400 animate-pulse text-lg">🏆 PLAYER 2 VICTORIOUS! 🏆</span>
                          <span className="text-[10px] text-slate-400 font-normal">Outperformed Player 1 by {(p2Stats.score - p1Stats.score).toLocaleString()} points</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-amber-400 text-lg">🤝 IT'S A PERFECT DRAW TIE! 🤝</span>
                          <span className="text-[10px] text-slate-400 font-normal">Exact match with identical scores! Perfect coordination.</span>
                        </div>
                      )}
                    </div>

                    {/* Dual player scorecards side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mb-6">
                      {/* Player 1 card (Pink) */}
                      <div className={`p-5 rounded-3xl flex flex-col items-center text-center relative overflow-hidden transition-all border ${
                        p1Stats.score >= p2Stats.score 
                          ? "bg-pink-950/20 border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/20" 
                          : "bg-slate-900/60 border-slate-800 opacity-60"
                      }`}>
                        {p1Stats.score >= p2Stats.score && (
                          <div className="absolute top-2 left-3 bg-pink-500 text-slate-950 font-black font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Winner
                          </div>
                        )}
                        <span className="absolute top-2 right-3 font-mono text-[9px] font-bold text-pink-500 bg-pink-950/50 px-1.5 py-0.5 rounded">WASD</span>
                        <div className="w-1.5 h-12 bg-pink-500 absolute left-0 top-1/2 -translate-y-1/2 rounded-r-md" />
                        <span className="text-xs font-black tracking-widest text-pink-400 uppercase mb-3">Player 1 (Pink)</span>
                        
                        <div className="text-4xl font-extrabold text-white mb-3 font-mono tabular-nums tracking-tight">
                          {p1Stats.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-300 space-y-2 font-sans w-full bg-slate-950/40 p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">Accuracy:</span>
                            <strong className="text-pink-300 font-mono text-[11px]">{p1Stats.totalCount > 0 ? Math.round((p1Stats.correctCount / p1Stats.totalCount) * 100) : 0}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">Correct Ans:</span>
                            <strong className="text-slate-200 text-[11px]">{p1Stats.correctCount}/{p1Stats.totalCount}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">Mistakes:</span>
                            <strong className="text-rose-400 text-[11px]">{p1Stats.totalCount - p1Stats.correctCount}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Player 2 card (Cyan) */}
                      <div className={`p-5 rounded-3xl flex flex-col items-center text-center relative overflow-hidden transition-all border ${
                        p2Stats.score >= p1Stats.score 
                          ? "bg-cyan-950/20 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20" 
                          : "bg-slate-900/60 border-slate-800 opacity-60"
                      }`}>
                        {p2Stats.score >= p1Stats.score && (
                          <div className="absolute top-2 left-3 bg-cyan-400 text-slate-950 font-black font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Winner
                          </div>
                        )}
                        <span className="absolute top-2 right-3 font-mono text-[9px] font-bold text-cyan-500 bg-cyan-950/50 px-1.5 py-0.5 rounded">ARROWS</span>
                        <div className="w-1.5 h-12 bg-cyan-400 absolute left-0 top-1/2 -translate-y-1/2 rounded-r-md" />
                        <span className="text-xs font-black tracking-widest text-cyan-400 uppercase mb-3">Player 2 (Cyan)</span>
                        
                        <div className="text-4xl font-extrabold text-white mb-3 font-mono tabular-nums tracking-tight">
                          {p2Stats.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-300 space-y-2 font-sans w-full bg-slate-950/40 p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">Accuracy:</span>
                            <strong className="text-cyan-300 font-mono text-[11px]">{p2Stats.totalCount > 0 ? Math.round((p2Stats.correctCount / p2Stats.totalCount) * 100) : 0}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">Correct Ans:</span>
                            <strong className="text-slate-200 text-[11px]">{p2Stats.correctCount}/{p2Stats.totalCount}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[11px]">Mistakes:</span>
                            <strong className="text-rose-400 text-[11px]">{p2Stats.totalCount - p2Stats.correctCount}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : lastGameStats ? (
                  <>
                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white mb-1 uppercase">
                      RUN<span className="text-teal-400"> REPORT CARD</span>
                    </h1>
                    
                    <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-teal-400 mb-6 font-mono">
                      {p1Questions.length > 0 ? "Practice Loop Completed Successfully" : "Session Accomplished"}
                    </p>

                    {/* Score & accuracy formatted like premium high-contrast widgets */}
                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                      
                      <div className="bg-white text-slate-905 p-5 rounded-3xl flex flex-col items-start justify-center shadow-[0_6px_0_#94A3B8] border border-white">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">FINAL SCORE</span>
                        <span className="text-3xl font-extrabold text-slate-950 tabular-nums">
                          {lastGameStats.score.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-teal-600 font-bold font-mono mt-0.5">Points Unlocked</p>
                      </div>

                      <div className="bg-slate-950/80 border border-teal-500/20 p-5 rounded-3xl flex flex-col items-start justify-center shadow-lg">
                        <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider font-mono">ACCURACY RATE</span>
                        <span className="text-3xl font-black text-teal-350 tracking-wider flex items-center gap-1.5 font-mono">
                          {lastGameStats.totalCount > 0 ? Math.round((lastGameStats.correctCount / lastGameStats.totalCount) * 100) : 0}%
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {lastGameStats.correctCount} of {lastGameStats.totalCount} Gates
                        </p>
                      </div>

                    </div>

                    <div className="w-full bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-left space-y-3">
                      <div className="flex justify-between items-center text-xs pb-2.5 border-b border-slate-800">
                        <span className="text-slate-400 font-mono">Study Group Role:</span>
                        <span className="font-bold text-teal-350 uppercase text-[11px] bg-teal-950/50 px-2 py-0.5 rounded border border-teal-900">
                          👥 {lastGameStats.teamName || "Solo Practice Runner"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[9.5px] uppercase font-mono mb-0.5">Success Gates</span>
                          <span className="text-emerald-400 font-bold font-mono text-sm">{lastGameStats.correctCount} Solved</span>
                        </div>
                        <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[9.5px] uppercase font-mono mb-0.5">Mistakes / Collisions</span>
                          <span className="text-rose-400 font-bold font-mono text-sm">{lastGameStats.totalCount - lastGameStats.correctCount} Total</span>
                        </div>
                      </div>
                      {/* Obstacle hits stat */}
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-orange-500/20">
                        <span className="text-slate-500 block text-[9.5px] uppercase font-mono mb-0.5">Obstacles Hit</span>
                        <span className="text-orange-400 font-bold font-mono text-sm">
                          {lastGameStats.obstacleHits} {lastGameStats.obstacleHits === 1 ? 'Crash' : 'Crashes'}
                          {lastGameStats.obstacleHits === 0 && <span className="text-emerald-400 ml-1">✓ Clean Run!</span>}
                        </span>
                      </div>

                      {/* Explicitly state score achievement sentence */}
                      <div className="text-center pt-1">
                        <p className="text-xs text-slate-300 italic font-medium">
                          "Congratulations! You completed the quiz with an impressive score of <strong className="text-teal-400 font-mono text-sm not-italic font-black">{lastGameStats.score}</strong>!"
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}

                {/* Back navigators */}
                <div className="flex flex-col gap-3.5 w-full pr-1 mt-6">
                  <button
                    onClick={() => {
                      audioEngine.playMove();
                      setScreen("LEADERBOARD");
                    }}
                    className="w-full py-4 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-350 hover:to-emerald-400 text-slate-950 rounded-2xl font-black tracking-wider uppercase text-xs transition-all shadow-[0_5px_0_#134e4a] active:translate-y-1 active:shadow-[0_1px_0_#134e4a] cursor-pointer"
                  >
                    View Room Rankings & Leaderboard
                  </button>

                  <button
                    onClick={() => {
                      audioEngine.playMove();
                      setScreen("MENU");
                    }}
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white rounded-2xl text-xs font-mono font-black uppercase transition-all border border-slate-700 hover:border-slate-600 cursor-pointer shadow-md"
                  >
                    ⬅️ Back to Main Menu
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Main Footer credits */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto py-4 px-6 text-center border-t border-slate-900 bg-slate-950/20">
        <p className="text-[10px] text-slate-500 font-mono tracking-wider">
          LEXI-RUN 3D &bull; POWERED BY THREE.JS WEBGL ENGINE &bull; GEMINI CO-TEACHER AGENT
        </p>
      </footer>

    </div>
  );
}
