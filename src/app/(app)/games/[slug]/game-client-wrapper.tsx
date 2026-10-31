"use client";

import React, { useRef, useState } from "react";
import { allGames } from "@/lib/games";
import dynamic from 'next/dynamic';
import { LoadingPlaceholder } from "@/components/layout/loading-placeholder";
import { gameComponentMap } from "@/lib/game-components";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { logAnalyticsEvent, getDailyMissions, getDailyBonusGame } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, BookOpen, GraduationCap, Target, Users, Compass, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const NATIVELY_TRACKED_GAMES = new Set([
  'algebraic-abyss', 'anatomy-academy', 'arithmetic-ace', 'bio-hazard', 
  'coordinate-cosmos', 'daily-verse', 'dialogue-dojo', 'evolution-expedition', 
  'gene-genius', 'grammar-gladiator', 'grammar-guru', 'idiom-inferno', 
  'literary-device-legend', 'math-matrix', 'molecule-maker', 'quantum-quest', 
  'synonym-sniper', 'syntax-skyline', 'vocab-vortex', 'cosmic-word-voyager', 
  'spellcaster-defense', 'exploration-quest-3d', 'living-puzzles-3d', 
  'character-conversations-3d', 'ai-storyteller-adventure', 'emoji-enigma',
  'states-of-matter', 'fraction-fusion', 'lexi-sphere', 'cellular-explorer-3d',
  'geometry-galaxy-3d', 'vocab-flipper-3d', 'math-vault-3d', 'math-dash-3d', 'action-detector-3d',
  'time-traveler', 'riddle-realm', 'probability-pilot', 'equation-alchemist',
  'circuit-crafter', 'etymology-expedition', 'pronunciation-pro',
  'arena-showdown-math', 'arena-showdown-science', 'arena-showdown-english',
  'draw-the-word', 'draw-the-math', 'math-tug-of-war', 'english-tug-of-war', 'vocab-snake',
  'genius-guesser', 'tense-runner', 'speed-debater', 'spelling-bee'
]);

export function GameClientWrapper({ slug }: { slug: string }) {
  const game = allGames.find((g) => g.slug === slug);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isLessonGuideOpen, setIsLessonGuideOpen] = useState(false);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const answeredCountRef = React.useRef(0);
  const rewardedRef = React.useRef(false);
  const [rewarded, setRewarded] = React.useState(false);

  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [totalDuration, setTotalDuration] = React.useState<number>(60);
  const [timerActive, setTimerActive] = React.useState(false);
  const [timerCompleted, setTimerCompleted] = React.useState(false);
  const [isDailyGame, setIsDailyGame] = React.useState(false);

  const getFullscreenElement = () => {
    if (typeof document === 'undefined') return null;
    return (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement ||
      null
    );
  };

  const handleFullScreen = async () => {
    const elem = gameContainerRef.current as any;
    if (!elem) return;

    const fsElement = getFullscreenElement();

    if (!fsElement && !isFullscreen) {
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn("Native fullscreen unavailable, falling back to CSS fullscreen:", err);
        setIsFullscreen(true);
      }
    } else {
      try {
        if (getFullscreenElement()) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            await (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          }
        }
      } catch (err) {
        console.warn("Error exiting native fullscreen:", err);
      }
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (!('fullscreenElement' in document) && 'webkitFullscreenElement' in document) {
        try {
          Object.defineProperty(document, 'fullscreenElement', {
            get: () => (document as any).webkitFullscreenElement,
            configurable: true,
          });
        } catch (e) {}
      }
    }

    const onFullscreenChange = () => {
      const fsElem = getFullscreenElement();
      setIsFullscreen(!!fsElem);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lingoland_fullscreen_change', {
          detail: { isFullscreen: !!fsElem }
        }));
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      try {
        document.dispatchEvent(new Event('fullscreenchange'));
      } catch (e) {}
    }
  }, [isFullscreen]);

  React.useEffect(() => {
    if (!game || NATIVELY_TRACKED_GAMES.has(game.slug)) return;

    const dailyMissions = getDailyMissions();
    const { slug: dailyBonusSlug } = getDailyBonusGame();
    const isDaily = dailyMissions.some(m => m.slug === game.slug) || dailyBonusSlug === game.slug;
    setIsDailyGame(isDaily);

    if (!isDaily) return;

    const savedTotal = localStorage.getItem(`lingoland_game_timer_total_${game.slug}`);
    let duration = 60;

    if (savedTotal) {
      duration = parseInt(savedTotal, 10);
    } else {
      const matchedMission = dailyMissions.find(m => m.slug === game.slug);
      const coins = matchedMission ? matchedMission.reward : 5;

      if (coins >= 8) {
        duration = Math.floor(Math.random() * 41) + 140;
      } else if (coins >= 4) {
        duration = Math.floor(Math.random() * 41) + 95;
      } else {
        duration = Math.floor(Math.random() * 31) + 60;
      }

      localStorage.setItem(`lingoland_game_timer_total_${game.slug}`, duration.toString());
    }

    setTotalDuration(duration);

    const savedLeft = localStorage.getItem(`lingoland_game_timer_left_${game.slug}`);
    if (savedLeft) {
      const parsedLeft = parseInt(savedLeft, 10);
      if (parsedLeft > 0) {
        setTimeLeft(parsedLeft);
        return;
      }
    }

    setTimeLeft(duration);
  }, [game]);

  React.useEffect(() => {
    if (!timerActive || timeLeft === null || timeLeft <= 0 || rewarded || !game) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          setTimerCompleted(true);
          localStorage.removeItem(`lingoland_game_timer_left_${game.slug}`);
          localStorage.removeItem(`lingoland_game_timer_total_${game.slug}`);
          return 0;
        }

        const nextValue = prev - 1;
        localStorage.setItem(`lingoland_game_timer_left_${game.slug}`, nextValue.toString());
        return nextValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, rewarded, game]);

  React.useEffect(() => {
    return () => {
      setTimerActive(false);
    };
  }, []);

  const startTimerOnInteraction = React.useCallback(() => {
    if (!timerActive && !timerCompleted && !rewarded && timeLeft !== null && timeLeft > 0) {
      setTimerActive(true);
    }
  }, [timerActive, timerCompleted, rewarded, timeLeft]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousedown', startTimerOnInteraction, true);
    window.addEventListener('touchstart', startTimerOnInteraction, true);
    window.addEventListener('keydown', startTimerOnInteraction, true);

    return () => {
      window.removeEventListener('mousedown', startTimerOnInteraction, true);
      window.removeEventListener('touchstart', startTimerOnInteraction, true);
      window.removeEventListener('keydown', startTimerOnInteraction, true);
    };
  }, [startTimerOnInteraction]);

  React.useEffect(() => {
    if (!game || NATIVELY_TRACKED_GAMES.has(game.slug)) return;

    const originalUseState = React.useState;

    // @ts-ignore
    React.useState = function<S>(initialState: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>] {
      const [state, setState] = originalUseState(initialState);

      const wrappedSetState = (value: any) => {
        setState(value);

        let resolvedValue = value;
        if (typeof value === 'function') {
          try {
            resolvedValue = value(state);
          } catch (e) {}
        }

        if (
          resolvedValue === 'finished' || 
          resolvedValue === 'all_spun' || 
          resolvedValue === 'feedback' || 
          resolvedValue === 'results'
        ) {
          window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
            detail: { state: resolvedValue }
          }));
        }

        if (resolvedValue === 'answered' || resolvedValue === 'playing' || resolvedValue === 'quiz' || resolvedValue === 'start') {
          window.dispatchEvent(new CustomEvent('lingoland_game_started_hijack'));
        }
      };

      return [state, wrappedSetState];
    };

    return () => {
      React.useState = originalUseState;
    };
  }, [game]);

  const handleCompleted = React.useCallback(() => {
    if (!game || rewardedRef.current) return;
    rewardedRef.current = true;
    setRewarded(true);
    setTimerCompleted(true);
    setTimerActive(false);
    localStorage.removeItem(`lingoland_game_timer_left_${game.slug}`);
    localStorage.removeItem(`lingoland_game_timer_total_${game.slug}`);

    logAnalyticsEvent(firestore, user?.uid || 'guest', {
      type: 'game_played',
      details: { slug: game.slug, title: game.title }
    });

    const dailyMissions = getDailyMissions();
    const { slug: dailyBonusSlug, bonusAmount } = getDailyBonusGame();
    const matchedMission = dailyMissions.find(m => m.slug === game.slug);
    const isDailyBonus = dailyBonusSlug === game.slug;

    const checkAndToast = async () => {
      let isMissionClaimed = false;
      let isBonusClaimed = false;

      if (user && firestore) {
        try {
          const today = new Date();
          const todayUTC = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
          const petSnap = await getDoc(doc(firestore, 'user_pets', user.uid));
          if (petSnap.exists()) {
            const pet = petSnap.data();
            const completedMissions = pet.completedDailyMissions || [];
            const isMissionsDateCurrent = pet.lastDailyMissionsDate === todayUTC;
            
            if (matchedMission && isMissionsDateCurrent && completedMissions.includes(matchedMission.slug)) {
              isMissionClaimed = true;
            }
            if (isDailyBonus && pet.lastDailyBonusClaimedDate === todayUTC) {
              isBonusClaimed = true;
            }
          }
        } catch (e) {
          console.error("Error reading pet data for toast:", e);
        }
      }

      let toastTitle = "Game Completed! 🎉";
      let toastDesc = "You've successfully completed the game!";

      if (matchedMission && isDailyBonus) {
        if (isMissionClaimed && isBonusClaimed) {
          toastTitle = "Game Completed! 🎮";
          toastDesc = "You've completed today's daily mission and bonus game (rewards already claimed)!";
        } else {
          toastTitle = "Double Reward! 🌟🎉";
          toastDesc = `Completed today's Daily Mission and Daily Coin game! Earned ${matchedMission.reward + bonusAmount} coins!`;
        }
      } else if (matchedMission) {
        if (isMissionClaimed) {
          toastTitle = "Game Completed! 🎮";
          toastDesc = "You've completed today's daily mission (reward already claimed)!";
        } else {
          toastTitle = "Daily Mission Cleared! 🚀";
          toastDesc = `Completed the Daily Mission and earned ${matchedMission.reward} Lingo-Coins!`;
        }
      } else if (isDailyBonus) {
        if (isBonusClaimed) {
          toastTitle = "Game Completed! 🎮";
          toastDesc = "You've completed today's daily bonus game (reward already claimed)!";
        } else {
          toastTitle = "Daily Bonus Claimed! 🪙";
          toastDesc = `Completed today's Daily Coin game and earned ${bonusAmount} Lingo-Coins!`;
        }
      } else {
        toastTitle = "Game Completed! 🎮";
        toastDesc = "You've successfully completed the game! Keep playing to level up your pet!";
      }

      toast({
        title: toastTitle,
        description: toastDesc,
      });
    };

    checkAndToast();
  }, [game, firestore, user, toast]);

  React.useEffect(() => {
    if (!game) return;

    const handleCompletedEvent = () => {
      if (!NATIVELY_TRACKED_GAMES.has(game.slug)) {
        if (!isDailyGame || timerCompleted) {
          handleCompleted();
        }
      } else {
        handleCompleted();
      }
    };

    const handleStartedEvent = () => {
      startTimerOnInteraction();
    };

    const handleAnswered = () => {
      startTimerOnInteraction();
      answeredCountRef.current += 1;
      if (answeredCountRef.current >= 10) {
        answeredCountRef.current = 0;
        
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game.slug, title: game.title, mode: 'endless', isMilestone: true }
        });
 
        toast({
          title: "Endless Milestone Reached! 🚀",
          description: "Answered 10 questions! Keep up the great work!",
        });
      }
    };

    const handleDailyMission = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      toast({
        title: "Daily Mission Complete! 🏆",
        description: `Successfully finished Today's Flight Mission for "${detail.title}"! Earned an extra +${detail.reward} drop coins!`,
        className: "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold",
      });
    };

    const handleOpenLessonGuide = () => {
      setIsLessonGuideOpen(true);
    };

    window.addEventListener('lingoland_game_completed_hijack', handleCompletedEvent);
    window.addEventListener('lingoland_game_started_hijack', handleStartedEvent);
    window.addEventListener('lingoland_game_answered_hijack', handleAnswered);
    window.addEventListener('lingoland_daily_mission_completed', handleDailyMission);
    window.addEventListener('lingoland_open_lesson_guide', handleOpenLessonGuide);

    return () => {
      window.removeEventListener('lingoland_game_completed_hijack', handleCompletedEvent);
      window.removeEventListener('lingoland_game_started_hijack', handleStartedEvent);
      window.removeEventListener('lingoland_game_answered_hijack', handleAnswered);
      window.removeEventListener('lingoland_daily_mission_completed', handleDailyMission);
      window.removeEventListener('lingoland_open_lesson_guide', handleOpenLessonGuide);
    };
  }, [game, firestore, user, handleCompleted, startTimerOnInteraction, timerCompleted, isDailyGame, toast]);

  if (!game) {
    return <div>Game not found</div>;
  }
  
  const GameComponent = gameComponentMap[game.slug as keyof typeof gameComponentMap] || dynamic<any>(() => import('@/components/game-placeholder').then(mod => mod.GamePlaceholder), { ssr: false });

  const relatedGames = allGames
    .filter((g) => g.slug !== game.slug && (g.focus === game.focus || g.subject === game.subject))
    .slice(0, 4);

  const cefrBadge =
    game.level === "beginner"
      ? "CEFR A1–A2 (Beginner)"
      : game.level === "intermediate"
      ? "CEFR B1–B2 (Intermediate)"
      : "CEFR C1–C2 (Advanced)";

  return (
    <React.Fragment>
      <div
        ref={gameContainerRef}
        className={cn(
          "relative transition-all duration-300 flex flex-col w-full max-w-full overflow-x-hidden",
          isFullscreen
            ? "fixed inset-0 z-50 bg-background w-full h-[100dvh] max-h-[100dvh] overflow-y-auto overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
            : "-m-3 md:-m-4 lg:-m-5 min-h-[calc(100dvh-4rem)] flex-1 max-w-[calc(100%+1.5rem)] md:max-w-[calc(100%+2rem)] lg:max-w-[calc(100%+2.5rem)] overflow-x-hidden"
        )}
        data-fullscreen-container={isFullscreen}
        onMouseDown={startTimerOnInteraction}
        onTouchStart={startTimerOnInteraction}
      >
        <div
          data-game-stage="true"
          className={cn(
            "w-full max-w-full transition-all duration-300 flex-1 flex flex-col overflow-x-hidden",
            isFullscreen ? "min-h-[100dvh]" : "min-h-[calc(100dvh-4rem)] flex-1"
          )}
        >
          <React.Suspense fallback={<LoadingPlaceholder />}>
            <GameComponent slug={game.slug} onToggleFullscreen={handleFullScreen} />
          </React.Suspense>
        </div>

        {/* Modern Floating Timer Status & Claim Widget */}
        {!NATIVELY_TRACKED_GAMES.has(game.slug) && isDailyGame && !rewarded && (
          <motion.div 
            drag
            dragMomentum={false}
            dragElastic={0.05}
            className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3 pointer-events-auto cursor-move select-none touch-none"
          >
            {!timerCompleted && (
              <div className="flex flex-col gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white p-2.5 sm:p-3.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] w-52 sm:w-64 transition-all duration-300">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className={cn("h-3.5 w-3.5 text-amber-500", timerActive && "animate-spin")} />
                    {timerActive ? "Mission Active" : "Mission Paused"}
                  </span>
                  <span className="text-amber-400 text-xs font-black">
                    {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : "0:00"}
                  </span>
                </div>
                
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500"
                    style={{ width: `${timeLeft !== null ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0}%` }}
                  />
                </div>
                
                <p className="text-[9px] text-slate-500 font-bold leading-tight mt-1.5">
                  {timerActive 
                    ? "Mission in progress! Drag me anywhere or exit safely (progress pauses)." 
                    : "Click inside the game or press Start to begin the mission timer!"}
                </p>
              </div>
            )}

            {timerCompleted && (
              <button
                onClick={handleCompleted}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm py-3 px-5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 animate-bounce border border-amber-300/30"
              >
                <Sparkles className="h-4 w-4 text-slate-950" />
                <span>Claim Mission Coins &amp; Finish</span>
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* SEO / AdSense Crawlable Semantic Article (Visually hidden unless modal is opened, zero layout intrusion) */}
      <article
        aria-label={`Pedagogical and Classroom Guide for ${game.title}`}
        className="sr-only fixed top-0 left-0 w-px h-px overflow-hidden pointer-events-none"
      >
        <h1>{game.title} — {cefrBadge} Interactive {game.subject} &amp; {game.focus} Learning Module</h1>
        <p>
          {game.description} Designed as part of the LingoLandVerse interactive curriculum, {game.title} reinforces {game.focus} mastery within {game.subject.toUpperCase()} for {cefrBadge} learners through low-anxiety, active retrieval practice.
        </p>
        <h2>Core Learning Objectives</h2>
        <p>
          Students develop automaticity in {game.focus} by responding to timed contextual prompts, strengthening working-memory retrieval and error self-correction in alignment with {cefrBadge} standards.
        </p>
        <h2>Classroom Smartboard Implementation</h2>
        <p>
          Project {game.title} in full-screen mode on a classroom projector or interactive whiteboard. Divide students into cooperative teams and rotate spokespersons to explain their grammatical or lexical reasoning before locking in each answer.
        </p>
        <h2>Suggested 45-Minute ESL Lesson Plan Using {game.title}</h2>
        <ol>
          <li>Warm-Up and Schema Activation (10 mins): Introduce the target {game.focus} patterns on the board and elicit 3–4 example sentences from students.</li>
          <li>Guided Interactive Practice (20 mins): Launch {game.title}. Have students justify their choices aloud using complete sentences before selecting an option.</li>
          <li>Production and Consolidation (15 mins): Ask learners to record the 5 most challenging items from their session in their notebook or LingoLandVerse Flashcard Deck and write original dialogue lines using them.</li>
        </ol>
      </article>

      {/* Clean Modal Dialog when user clicks "Lesson & Teacher Guide" in Header */}
      <Dialog open={isLessonGuideOpen} onOpenChange={setIsLessonGuideOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-950/95 border border-cyan-500/35 text-slate-100 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          <DialogHeader className="space-y-2 border-b border-white/10 pb-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                <GraduationCap className="w-3.5 h-3.5" /> {cefrBadge}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 border border-indigo-400/40 text-indigo-200">
                Focus: {game.focus}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                Subject: {game.subject}
              </span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black text-white">
              {game.title} — Classroom &amp; Study Guide
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {game.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/80 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <h3>Learning Objectives</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Develops automaticity in <strong>{game.focus}</strong> through timed contextual prompts and active retrieval aligned with {cefrBadge}.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs sm:text-sm">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3>Smartboard Mode</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Project in full-screen mode and divide students into cooperative teams. Have spokespersons justify their choice before locking in each answer.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <h3>Self-Study Review</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Pair this game with <Link href="/flashcards" className="text-cyan-300 underline">SM-2 Flashcards</Link> and the <Link href="/reader" className="text-cyan-300 underline">Graded Reader</Link> to reinforce new vocabulary.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 sm:p-5 space-y-2.5">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Suggested 45-Minute ESL Lesson Plan
              </h3>
              <ol className="space-y-1.5 text-xs text-slate-200 leading-relaxed list-decimal list-inside">
                <li><strong>Warm-Up (10 mins):</strong> Introduce the target {game.focus} patterns on the board and elicit 3–4 example sentences.</li>
                <li><strong>Guided Play (20 mins):</strong> Launch <em>{game.title}</em> and have students explain their reasoning aloud in complete sentences.</li>
                <li><strong>Consolidation (15 mins):</strong> Record 5 challenging items from the session and write original sentences or dialogue lines.</li>
              </ol>
            </div>

            {relatedGames.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Related {game.subject.toUpperCase()} Modules
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {relatedGames.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/games/${rel.slug}`}
                      onClick={() => setIsLessonGuideOpen(false)}
                      className="p-3 rounded-xl border border-white/10 bg-slate-900/80 hover:border-cyan-400/50 transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{rel.title}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{rel.level} • {rel.focus}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
