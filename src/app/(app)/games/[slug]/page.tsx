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
import { logAnalyticsEvent } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

const NATIVELY_TRACKED_GAMES = new Set([
  'algebraic-abyss', 'anatomy-academy', 'arithmetic-ace', 'bio-hazard', 
  'coordinate-cosmos', 'daily-verse', 'dialogue-dojo', 'evolution-expedition', 
  'gene-genius', 'grammar-gladiator', 'grammar-guru', 'idiom-inferno', 
  'literary-device-legend', 'math-matrix', 'molecule-maker', 'quantum-quest', 
  'synonym-sniper', 'syntax-skyline', 'vocab-vortex', 'cosmic-word-voyager', 
  'spellcaster-defense'
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

  // Centralized State Interceptor Hijacking
  React.useEffect(() => {
    if (!game || NATIVELY_TRACKED_GAMES.has(game.slug)) return;

    const originalUseState = React.useState;

    // Hijack React.useState
    // @ts-ignore
    React.useState = function<S>(initialState: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>] {
      const [state, setState] = originalUseState(initialState);

      const wrappedSetState = (value: any) => {
        // Run original state update
        setState(value);

        // Resolve value if functional update
        let resolvedValue = value;
        if (typeof value === 'function') {
          try {
            resolvedValue = value(state);
          } catch (e) {}
        }

        // Completion states
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

        // Question answered in endless modes
        if (resolvedValue === 'answered') {
          window.dispatchEvent(new CustomEvent('lingoland_game_answered_hijack'));
        }
      };

      return [state, wrappedSetState];
    };

    return () => {
      // Restore React.useState on unmount
      React.useState = originalUseState;
    };
  }, [game]);

  // Set up listeners for the custom completion event
  React.useEffect(() => {
    if (!game) return;

    const handleCompleted = () => {
      if (rewardedRef.current) return;
      rewardedRef.current = true;

      // Trigger analytics coin reward
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: { slug: game.slug, title: game.title }
      });

      toast({
        title: "Game Completed! 🎉",
        description: "You've successfully completed the game and earned 10 Lingo-Coins!",
      });
    };

    const handleAnswered = () => {
      answeredCountRef.current += 1;
      // Every 10 answers, trigger a minor coin drop!
      if (answeredCountRef.current >= 10) {
        answeredCountRef.current = 0;
        
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game.slug, title: game.title, mode: 'endless' }
        });

        toast({
          title: "Endless Milestone Reached! 🚀",
          description: "Answered 10 questions! Earned 10 Lingo-Coins!",
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

    window.addEventListener('lingoland_game_completed_hijack', handleCompleted);
    window.addEventListener('lingoland_game_answered_hijack', handleAnswered);
    window.addEventListener('lingoland_daily_mission_completed', handleDailyMission);

    return () => {
      window.removeEventListener('lingoland_game_completed_hijack', handleCompleted);
      window.removeEventListener('lingoland_game_answered_hijack', handleAnswered);
      window.removeEventListener('lingoland_daily_mission_completed', handleDailyMission);
    };
  }, [game, firestore, user]);

  if (!game) {
    return <div>Game not found</div>;
  }
  
  const GameComponent = gameComponentMap[game.slug as keyof typeof gameComponentMap] || dynamic(() => import('@/components/game-placeholder').then(mod => mod.GamePlaceholder), { ssr: false });

  return (
    <div
      ref={gameContainerRef}
      className={cn(
        "relative transition-colors duration-500",
        isFullscreen && "bg-background w-screen h-screen overflow-hidden"
      )}
      data-fullscreen-container={isFullscreen}
    >
      <div className={cn("w-full transition-all duration-500", isFullscreen ? "h-full overflow-y-auto" : "p-0")}>
        <React.Suspense fallback={<LoadingPlaceholder />}>
          <GameComponent slug={game.slug} onToggleFullscreen={handleFullScreen} />
        </React.Suspense>
      </div>
    </div>
  );
}
