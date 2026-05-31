"use client";

import React, { useRef } from "react";
import { allGames } from "@/lib/games";
import dynamic from 'next/dynamic';
import { LoadingPlaceholder } from "@/components/layout/loading-placeholder";
import { useParams, useRouter } from "next/navigation";
import { gameComponentMap } from "../page";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { logAnalyticsEvent, getDailyMissions, getDailyBonusGame } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const NATIVELY_TRACKED_GAMES = new Set([
  'algebraic-abyss', 'anatomy-academy', 'arithmetic-ace', 'bio-hazard', 
  'coordinate-cosmos', 'daily-verse', 'dialogue-dojo', 'evolution-expedition', 
  'gene-genius', 'grammar-gladiator', 'grammar-guru', 'idiom-inferno', 
  'literary-device-legend', 'math-matrix', 'molecule-maker', 'quantum-quest', 
  'synonym-sniper', 'syntax-skyline', 'vocab-vortex', 'cosmic-word-voyager', 
  'spellcaster-defense', 'exploration-quest-3d', 'living-puzzles-3d', 
  'character-conversations-3d', 'ai-storyteller-adventure'
]);

export default function GamePage() {
  const params = useParams();
  const slug = params.slug as string;
  const game = allGames.find((g) => g.slug === slug);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const answeredCountRef = React.useRef(0);
  const rewardedRef = React.useRef(false);
  const [rewarded, setRewarded] = React.useState(false);

  // New Mission Timer States
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [totalDuration, setTotalDuration] = React.useState<number>(60);
  const [timerActive, setTimerActive] = React.useState(false);
  const [timerCompleted, setTimerCompleted] = React.useState(false);
  const [isDailyGame, setIsDailyGame] = React.useState(false);

  const handleFullScreen = () => {
    const elem = gameContainerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Initialize and load saved timer from localStorage
  React.useEffect(() => {
    if (!game || NATIVELY_TRACKED_GAMES.has(game.slug)) return;

    // Verify if this is an active daily mission or daily bonus game
    const dailyMissions = getDailyMissions();
    const { slug: dailyBonusSlug } = getDailyBonusGame();
    const isDaily = dailyMissions.some(m => m.slug === game.slug) || dailyBonusSlug === game.slug;
    setIsDailyGame(isDaily);

    if (!isDaily) return;

    // Check if there is already a saved total duration for this game session
    const savedTotal = localStorage.getItem(`lingoland_game_timer_total_${game.slug}`);
    let duration = 60;

    if (savedTotal) {
      duration = parseInt(savedTotal, 10);
    } else {
      // Generate randomized duration around 1-3 minutes (60s to 180s)
      // "the higher the coins the higher the timer"
      const matchedMission = dailyMissions.find(m => m.slug === game.slug);
      const coins = matchedMission ? matchedMission.reward : 5; // Default to 5 coins if no daily mission

      if (coins >= 8) {
        // High reward: random between 140s and 180s (approx 2.3 - 3.0 mins)
        duration = Math.floor(Math.random() * 41) + 140;
      } else if (coins >= 4) {
        // Medium reward: random between 95s and 135s (approx 1.6 - 2.25 mins)
        duration = Math.floor(Math.random() * 41) + 95;
      } else {
        // Low reward: random between 60s and 90s (approx 1.0 - 1.5 mins)
        duration = Math.floor(Math.random() * 31) + 60;
      }

      localStorage.setItem(`lingoland_game_timer_total_${game.slug}`, duration.toString());
    }

    setTotalDuration(duration);

    // Retrieve previous remaining time for this specific game
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

  // Handle countdown interval and save remaining seconds dynamically
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

  // Pause the timer when user unmounts or leaves the game
  React.useEffect(() => {
    return () => {
      setTimerActive(false);
    };
  }, []);

  // Trigger timer when user interacts with the game
  const startTimerOnInteraction = React.useCallback(() => {
    if (!timerActive && !timerCompleted && !rewarded && timeLeft !== null && timeLeft > 0) {
      setTimerActive(true);
    }
  }, [timerActive, timerCompleted, rewarded, timeLeft]);

  // Bind capture-phase listeners globally to ensure ANY user interaction starts the timer
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

  // Centralized State Interceptor Hijacking
  React.useEffect(() => {
    if (!game || NATIVELY_TRACKED_GAMES.has(game.slug)) return;

    const originalUseState = React.useState;

    // Hijack React.useState
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

        // Completion states for non-endless games
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

        // Question answered in endless modes or general state update indicates playing
        if (resolvedValue === 'answered' || resolvedValue === 'playing' || resolvedValue === 'quiz' || resolvedValue === 'start') {
          window.dispatchEvent(new CustomEvent('lingoland_game_started_hijack'));
        }
      };

      return [state, wrappedSetState];
    };

    return () => {
      // Restore React.useState on unmount
      React.useState = originalUseState;
    };
  }, [game]);

  // Unified completion logic
  const handleCompleted = React.useCallback(() => {
    if (!game || rewardedRef.current) return;
    rewardedRef.current = true;
    setRewarded(true);
    setTimerCompleted(true);
    setTimerActive(false);
    localStorage.removeItem(`lingoland_game_timer_left_${game.slug}`);
    localStorage.removeItem(`lingoland_game_timer_total_${game.slug}`);

    // Trigger analytics coin reward
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

  // Set up listeners for the custom completion events
  React.useEffect(() => {
    if (!game) return;

    const handleCompletedEvent = () => {
      // For endless/classroom games, we only allow completion once the timer is done if it is a daily game!
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
      // Every 10 answers, trigger a minor milestone (no coin drop)!
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

    window.addEventListener('lingoland_game_completed_hijack', handleCompletedEvent);
    window.addEventListener('lingoland_game_started_hijack', handleStartedEvent);
    window.addEventListener('lingoland_game_answered_hijack', handleAnswered);
    window.addEventListener('lingoland_daily_mission_completed', handleDailyMission);

    return () => {
      window.removeEventListener('lingoland_game_completed_hijack', handleCompletedEvent);
      window.removeEventListener('lingoland_game_started_hijack', handleStartedEvent);
      window.removeEventListener('lingoland_game_answered_hijack', handleAnswered);
      window.removeEventListener('lingoland_daily_mission_completed', handleDailyMission);
    };
  }, [game, firestore, user, handleCompleted, startTimerOnInteraction, timerCompleted, isDailyGame, toast]);

  if (!game) {
    return <div>Game not found</div>;
  }
  
  const GameComponent = gameComponentMap[game.slug as keyof typeof gameComponentMap] || dynamic<any>(() => import('@/components/game-placeholder').then(mod => mod.GamePlaceholder), { ssr: false });

  return (
    <div
      ref={gameContainerRef}
      className={cn(
        "relative transition-colors duration-500",
        isFullscreen && "bg-background w-screen h-screen overflow-hidden"
      )}
      data-fullscreen-container={isFullscreen}
      onMouseDown={startTimerOnInteraction}
      onTouchStart={startTimerOnInteraction}
    >
      <div className={cn("w-full transition-all duration-500", isFullscreen ? "h-full overflow-y-auto" : "p-0")}>
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
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto cursor-move select-none touch-none"
        >
          {/* Active Timer Box */}
          {!timerCompleted && (
            <div className="flex flex-col gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white p-3.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] w-64 transition-all duration-300">
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

          {/* Claim Button - Appears only when timer is completed */}
          {timerCompleted && (
            <button
              onClick={handleCompleted}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm py-3 px-5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 animate-bounce border border-amber-300/30"
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>Claim Mission Coins & Finish</span>
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
