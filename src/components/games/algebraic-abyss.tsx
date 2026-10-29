"use client";

import * as React from "react";
import { shuffleArray } from "@/lib/shuffle";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { 
  Binary, 
  Sparkles, 
  Timer, 
  Trophy, 
  Repeat, 
  Maximize, 
  Minimize, 
  Rocket, 
  ArrowLeft, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Zap, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Gauge
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import confetti from "canvas-confetti";

interface Problem {
  id: string;
  equation: string;
  answer: number;
  options: number[];
  startTime: number;
  stepsExplanation: string;
}

type GameState = "idle" | "playing" | "finished" | "instructions" | "showing_result";
type DifficultyTier = "recruit" | "operator" | "singularity";

export function AlgebraicAbyss({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<DifficultyTier>("operator");
  const [totalRounds, setTotalRounds] = React.useState<number>(10);
  const [timerLimit, setTimerLimit] = React.useState<number>(8);
  const [isMuted, setIsMuted] = React.useState(false);
  
  const [currentProblem, setCurrentProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(timerLimit);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [combo, setCombo] = React.useState(0);
  const [highestCombo, setHighestCombo] = React.useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = React.useState(0);
  
  const [resultData, setResultData] = React.useState<{ 
    status: "correct" | "incorrect" | "timeout"; 
    points?: number; 
    trueAnswer?: number;
    explanation?: string;
  }>({ status: "correct" });

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  // Fullscreen event listener
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Web Audio SFX Engine
  const playSfx = React.useCallback((type: "click" | "correct" | "wrong" | "alert" | "door" | "win") => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "correct") {
        [587.33, 739.99, 880.0, 1174.66].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.04);
          gain.gain.setValueAtTime(0.12, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.18);
        });
      } else if (type === "wrong") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.2);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "alert") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "door") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "win") {
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.15, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.38);
        });
      }
    } catch {
      // AudioContext unavailable or blocked by browser autoplay policy
    }
  }, [isMuted]);

  // Procedural Problem Generator based on Difficulty Tier
  const generateProblem = React.useCallback((): Problem => {
    let equationString = "";
    let answer = 0;
    let stepsExplanation = "";

    if (difficulty === "recruit") {
      // 1-step equations: ax = c, x + b = c, or x - b = c
      const form = Math.floor(Math.random() * 3);
      if (form === 0) {
        // x + b = c
        const x = Math.floor(Math.random() * 18) + 2;
        const b = Math.floor(Math.random() * 25) + 3;
        const c = x + b;
        answer = x;
        equationString = `x + ${b} = ${c}`;
        stepsExplanation = `x + ${b} = ${c}  →  x = ${c} - ${b}  →  x = ${x}`;
      } else if (form === 1) {
        // x - b = c
        const x = Math.floor(Math.random() * 20) + 5;
        const b = Math.floor(Math.random() * 15) + 2;
        const c = x - b;
        answer = x;
        equationString = `x - ${b} = ${c}`;
        stepsExplanation = `x - ${b} = ${c}  →  x = ${c} + ${b}  →  x = ${x}`;
      } else {
        // ax = c
        const a = Math.floor(Math.random() * 8) + 2;
        const x = Math.floor(Math.random() * 12) + 2;
        const c = a * x;
        answer = x;
        equationString = `${a}x = ${c}`;
        stepsExplanation = `${a}x = ${c}  →  x = ${c} ÷ ${a}  →  x = ${x}`;
      }
    } else if (difficulty === "singularity") {
      // Advanced: a(x + b) = c or ax + b = cx + d
      const form = Math.floor(Math.random() * 2);
      if (form === 0) {
        // a(x + b) = c
        const a = Math.floor(Math.random() * 6) + 2;
        const b = Math.floor(Math.random() * 10) + 1;
        const x = Math.floor(Math.random() * 12) + 2;
        const c = a * (x + b);
        answer = x;
        equationString = `${a}(x + ${b}) = ${c}`;
        stepsExplanation = `${a}(x + ${b}) = ${c}  →  x + ${b} = ${c / a}  →  x = ${c / a} - ${b}  →  x = ${x}`;
      } else {
        // ax + b = cx + d -> (a - c)x = d - b
        const a = Math.floor(Math.random() * 5) + 5; // 5..9
        const c = Math.floor(Math.random() * 3) + 2; // 2..4
        const x = Math.floor(Math.random() * 9) + 2; // 2..10
        const b = Math.floor(Math.random() * 15) + 1;
        const d = (a - c) * x + b;
        answer = x;
        equationString = `${a}x + ${b} = ${c}x + ${d}`;
        stepsExplanation = `${a}x - ${c}x = ${d} - ${b}  →  ${a - c}x = ${d - b}  →  x = ${x}`;
      }
    } else {
      // Standard Operator (2-step): ax + b = c or ax - b = c
      const type = Math.floor(Math.random() * 2);
      const a = Math.floor(Math.random() * 14) + 2;
      const b = Math.floor(Math.random() * 25) + 1;
      const x = Math.floor(Math.random() * 12) + 2;

      if (type === 0) {
        const c = a * x + b;
        answer = x;
        equationString = `${a}x + ${b} = ${c}`;
        stepsExplanation = `${a}x + ${b} = ${c}  →  ${a}x = ${c - b}  →  x = ${x}`;
      } else {
        const c = a * x - b;
        answer = x;
        equationString = `${a}x - ${b} = ${c}`;
        stepsExplanation = `${a}x - ${b} = ${c}  →  ${a}x = ${c + b}  →  x = ${x}`;
      }
    }

    // Generate 4 plausible distractor options
    const options = [answer];
    const offsets = [-3, -2, -1, 1, 2, 3, 4, 5, -4];
    shuffleArray(offsets);
    for (const offset of offsets) {
      if (options.length >= 4) break;
      const wrong = answer + offset;
      if (wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    // Safety fallback if options is not 4
    let fallback = answer + 1;
    while (options.length < 4) {
      if (!options.includes(fallback) && fallback > 0) options.push(fallback);
      fallback++;
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      equation: equationString,
      answer,
      options: shuffleArray(options),
      startTime: Date.now(),
      stepsExplanation
    };
  }, [difficulty]);

  const startNextRound = React.useCallback(() => {
    if (round >= totalRounds) {
      setGameState("finished");
      playSfx("win");
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      if (firestore && game) {
        logAnalyticsEvent(firestore, user?.uid || "guest", {
          type: "game_played",
          details: { slug: game.slug, title: game.title, score, difficulty, totalRounds }
        });
      }
      return;
    }
    const nextRound = round + 1;
    setRound(nextRound);
    setCurrentProblem(generateProblem());
    setTimeLeft(timerLimit);
    setGameState("playing");
  }, [round, totalRounds, generateProblem, timerLimit, firestore, game, user, score, difficulty, playSfx]);

  const handleStartGame = () => {
    playSfx("click");
    setScore(0);
    setRound(0);
    setCombo(0);
    setHighestCombo(0);
    setCorrectAnswersCount(0);
    startNextRound();
  };

  const handleAbortGame = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    playSfx("door");
    setGameState("idle");
    setCurrentProblem(null);
    setRound(0);
    setCombo(0);
    setTimeLeft(timerLimit);
    toast({
      title: "Mission Aborted",
      description: "Returned to the Quantum Rift Command Deck.",
    });
  }, [timerLimit, playSfx, toast]);

  const handleAnswer = React.useCallback((selected: number) => {
    if (gameState !== "playing" || !currentProblem) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const correct = selected === currentProblem.answer;
    let pointsEarned = 0;
    let status: "correct" | "incorrect" | "timeout" = "incorrect";

    if (correct) {
      status = "correct";
      playSfx("correct");
      const timeBonus = Math.floor(timeLeft * 15);
      const comboMultiplier = 1 + combo * 0.2;
      pointsEarned = Math.floor((100 + timeBonus) * comboMultiplier);
      
      setScore(prev => prev + pointsEarned);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setHighestCombo(prev => Math.max(prev, newCombo));
      setCorrectAnswersCount(prev => prev + 1);
    } else if (selected === -1) {
      status = "timeout";
      playSfx("wrong");
      setCombo(0);
    } else {
      status = "incorrect";
      playSfx("wrong");
      setCombo(0);
    }

    setResultData({
      status,
      points: pointsEarned,
      trueAnswer: currentProblem.answer,
      explanation: currentProblem.stepsExplanation
    });
    setGameState("showing_result");

    timerRef.current = setTimeout(() => {
      startNextRound();
    }, 1800);
  }, [gameState, currentProblem, timeLeft, combo, playSfx, startNextRound]);

  // Live Timer Countdown Effect
  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          const next = Number((prev - 0.1).toFixed(1));
          if (next <= 2.0 && next > 1.8) {
            playSfx("alert");
          }
          return next;
        });
      }, 100);
    } else if (gameState === "playing" && timeLeft <= 0) {
      handleAnswer(-1);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft, handleAnswer, playSfx]);

  // Hotkey support: keys 1-4 for options, Escape to abort
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState === "playing") {
        if (e.key === "Escape") {
          e.preventDefault();
          handleAbortGame();
        } else if (["1", "2", "3", "4"].includes(e.key) && currentProblem) {
          e.preventDefault();
          const index = parseInt(e.key, 10) - 1;
          if (index >= 0 && index < currentProblem.options.length) {
            handleAnswer(currentProblem.options[index]);
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, currentProblem, handleAnswer, handleAbortGame]);

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] transition-all duration-500 flex flex-col justify-between overflow-x-hidden overflow-y-auto relative border border-cyan-500/20 shadow-2xl bg-zinc-950/95 backdrop-blur-2xl text-white selection:bg-cyan-500/30",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-black" : "rounded-2xl md:rounded-3xl"
    )}>
      {/* Background Quantum Grid & Singularity Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-35">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/25 via-blue-950/20 to-black" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        {/* Floating Quantum Particles */}
        <div className="absolute inset-0">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 bg-cyan-400 rounded-full"
              initial={{
                x: `${(i * 17) % 100}%`,
                y: `${(i * 23) % 100}%`,
                opacity: 0.1,
                scale: 0.8
              }}
              animate={{
                y: [`${(i * 23) % 100}%`, `${((i * 23 + 40) % 100)}%`],
                opacity: [0.1, 0.7, 0.1],
                scale: [0.8, 1.6, 0.8]
              }}
              transition={{
                duration: 6 + (i % 5),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Persistent Quantum Command Header */}
      <CardHeader className="z-20 bg-zinc-950/80 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back to Games + Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-bold bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-xl"
            >
              <Link href="/games" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Games</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <Binary className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-base sm:text-xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-purple-300">
                    Algebraic Abyss
                  </CardTitle>
                  <Badge variant="outline" className="hidden md:inline-flex text-[10px] font-mono border-cyan-500/40 text-cyan-400 bg-cyan-950/40 py-0 px-1.5">
                    RIFT STABILIZER
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-cyan-300/70">
                  <span>Singularity Decryption Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center / Right: Live Gameplay Telemetry & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Live Stats Pill when In-Game */}
            {(gameState === "playing" || gameState === "showing_result") && (
              <div className="flex items-center gap-2 sm:gap-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl px-2.5 py-1 backdrop-blur-md">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-cyan-300/60 uppercase">Anomaly</p>
                  <p className="text-xs sm:text-sm font-black text-cyan-200 tabular-nums">{round}/{totalRounds}</p>
                </div>
                <div className="w-[1px] h-6 bg-cyan-500/20" />
                <div className="text-center">
                  <p className="text-[9px] font-bold text-purple-300/60 uppercase">Combo</p>
                  <p className="text-xs sm:text-sm font-black text-purple-300 tabular-nums">x{combo}</p>
                </div>
                <div className="w-[1px] h-6 bg-cyan-500/20" />
                <div className="text-center">
                  <p className="text-[9px] font-bold text-emerald-300/60 uppercase">Score</p>
                  <p className="text-xs sm:text-sm font-black text-emerald-300 tabular-nums">{score}</p>
                </div>
              </div>
            )}

            {/* In-Game "Abort Game" Button */}
            {(gameState === "playing" || gameState === "showing_result") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAbortGame}
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40 hover:border-red-400 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center gap-1.5"
                title="Abort Game (Esc)"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                <span className="hidden sm:inline">Abort Game</span>
                <span className="sm:hidden">Abort</span>
              </Button>
            )}

            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMuted(!isMuted);
                playSfx("click");
              }}
              className="h-8 w-8 sm:h-9 sm:w-9 text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-950/40 rounded-xl"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                playSfx("click");
                if (onToggleFullscreen) onToggleFullscreen();
              }}
              className="h-8 w-8 sm:h-9 sm:w-9 text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-950/40 rounded-xl"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Main Play Area with Safe Mobile Scrolling (justify-start to prevent top cutoffs) */}
      <CardContent className="flex-1 flex flex-col items-stretch justify-start p-3 sm:p-6 lg:p-8 z-10 relative overflow-y-auto w-full max-w-6xl mx-auto space-y-6 pb-16">
        <AnimatePresence mode="wait">
          {/* LOBBY / COMMAND DECK (gameState === 'idle') */}
          {gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full space-y-6 py-2"
            >
              {/* Telemetry Status Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-zinc-900/60 border border-cyan-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono uppercase text-cyan-300/60">Quantum Core</p>
                    <p className="text-sm sm:text-base font-black text-cyan-200">ONLINE 99.8%</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-purple-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono uppercase text-purple-300/60">Record Combo</p>
                    <p className="text-sm sm:text-base font-black text-purple-200">x{highestCombo} STREAK</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono uppercase text-emerald-300/60">Solved Ratio</p>
                    <p className="text-sm sm:text-base font-black text-emerald-200">{correctAnswersCount} STABILIZED</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Gauge className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono uppercase text-amber-300/60">Rift Tier</p>
                    <p className="text-sm sm:text-base font-black text-amber-200 uppercase">{difficulty}</p>
                  </div>
                </div>
              </div>

              {/* Main Mission Operations Center */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left/Center Deck: Rift Visualizer & Mission Config (7 cols) */}
                <div className="lg:col-span-7 bg-gradient-to-b from-cyan-950/20 via-zinc-900/40 to-black/60 border border-cyan-500/30 rounded-3xl p-5 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                  {/* Decorative Singularity Rings */}
                  <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                      <Zap className="h-3.5 w-3.5 text-cyan-400" />
                      <span>MISSION PROTOCOL // RIFT STABILIZATION</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-tight">
                      Master The <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                        Algebraic Singularity
                      </span>
                    </h2>

                    <p className="text-sm sm:text-base text-cyan-100/70 leading-relaxed max-w-xl">
                      Space-time equations are destabilizing the quantum rift. Calculate the missing value of{" "}
                      <span className="text-cyan-300 font-bold font-mono">x</span> with precision before chronal collapse occurs.
                    </p>
                  </div>

                  {/* Mission Configuration Selectors */}
                  <div className="space-y-4 pt-2">
                    {/* Difficulty Tier Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-cyan-300/80 flex items-center justify-between">
                        <span>Select Threat Level (Difficulty)</span>
                        <span className="text-cyan-400 font-bold">{difficulty.toUpperCase()}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDifficulty("recruit");
                            playSfx("click");
                          }}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all",
                            difficulty === "recruit"
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                              : "bg-zinc-900/50 border-white/10 text-white/60 hover:border-cyan-500/30 hover:text-white"
                          )}
                        >
                          <div>Recruit</div>
                          <div className="text-[10px] font-mono text-cyan-400/60 font-normal">1-Step (ax=c)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDifficulty("operator");
                            playSfx("click");
                          }}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all",
                            difficulty === "operator"
                              ? "bg-blue-500/20 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                              : "bg-zinc-900/50 border-white/10 text-white/60 hover:border-blue-500/30 hover:text-white"
                          )}
                        >
                          <div>Operator</div>
                          <div className="text-[10px] font-mono text-blue-400/60 font-normal">2-Step (ax±b=c)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDifficulty("singularity");
                            playSfx("click");
                          }}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all",
                            difficulty === "singularity"
                              ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                              : "bg-zinc-900/50 border-white/10 text-white/60 hover:border-purple-500/30 hover:text-white"
                          )}
                        >
                          <div>Singularity</div>
                          <div className="text-[10px] font-mono text-purple-400/60 font-normal">Advanced a(x+b)</div>
                        </button>
                      </div>
                    </div>

                    {/* Rounds and Timer Pace Controls */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase text-cyan-300/70">Anomalies</label>
                        <div className="grid grid-cols-4 gap-1">
                          {[5, 10, 15, 20].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                setTotalRounds(n);
                                playSfx("click");
                              }}
                              className={cn(
                                "py-1.5 rounded-lg border text-xs font-bold font-mono transition-all",
                                totalRounds === n
                                  ? "bg-cyan-500/30 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                  : "bg-zinc-900/40 border-white/10 text-white/50 hover:text-white"
                              )}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase text-cyan-300/70">Chronal Limit</label>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { label: "12s", val: 12 },
                            { label: "8s", val: 8 },
                            { label: "5s", val: 5 }
                          ].map(t => (
                            <button
                              key={t.val}
                              type="button"
                              onClick={() => {
                                setTimerLimit(t.val);
                                playSfx("click");
                              }}
                              className={cn(
                                "py-1.5 rounded-lg border text-xs font-bold font-mono transition-all",
                                timerLimit === t.val
                                  ? "bg-purple-500/30 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                                  : "bg-zinc-900/40 border-white/10 text-white/50 hover:text-white"
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleStartGame}
                      className="flex-1 h-14 sm:h-16 text-base sm:text-xl font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-cyan-300/40 uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Zap className="h-5 w-5 text-yellow-300" />
                      <span>Engage Quantum Rift</span>
                    </Button>

                    <Button
                      variant="outline"
                      asChild
                      className="h-14 sm:h-16 px-6 text-sm sm:text-base font-bold border-white/15 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-2xl flex items-center justify-center gap-2"
                    >
                      <Link href="/games">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Games</span>
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Right Deck: Tactical Brief & Hotkeys (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  {/* Tactical Intelligence Card */}
                  <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 text-cyan-300">
                      <HelpCircle className="h-5 w-5 text-cyan-400" />
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                        Tactical Intel & Rules
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-cyan-100/80 font-normal">
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                          01
                        </span>
                        <div>
                          <p className="font-bold text-white">Solve for X Fast</p>
                          <p className="text-[12px] text-cyan-200/60">Identify the unknown value of X. Faster answers yield higher chronal bonus multipliers.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                          02
                        </span>
                        <div>
                          <p className="font-bold text-white">Build Streak Resonance</p>
                          <p className="text-[12px] text-cyan-200/60">Consecutive correct answers build streak multipliers up to 3x total points per round.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                          03
                        </span>
                        <div>
                          <p className="font-bold text-white">Keyboard Hotkeys Active</p>
                          <p className="text-[12px] text-cyan-200/60">Press keys <kbd className="px-1.5 py-0.5 bg-black/60 border border-cyan-500/30 rounded text-cyan-300 font-mono text-[10px]">1</kbd> - <kbd className="px-1.5 py-0.5 bg-black/60 border border-cyan-500/30 rounded text-cyan-300 font-mono text-[10px]">4</kbd> on your keyboard for instantaneous responses.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="h-6 w-6 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                          04
                        </span>
                        <div>
                          <p className="font-bold text-white">Instant Abort Safety</p>
                          <p className="text-[12px] text-cyan-200/60">Tap &quot;Abort Game&quot; or press <kbd className="px-1.5 py-0.5 bg-black/60 border border-red-500/30 rounded text-red-300 font-mono text-[10px]">ESC</kbd> anytime during gameplay to disengage safely.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audio Status Card */}
                  <div className="bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Tactile SFX Engine</p>
                        <p className="text-[11px] text-cyan-300/60">Audio cues for correct locks and alerts</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsMuted(!isMuted);
                        playSfx("click");
                      }}
                      className="h-8 px-3 text-xs font-bold border-cyan-500/30 text-cyan-200 hover:bg-cyan-950/60 rounded-xl"
                    >
                      {isMuted ? "Unmute" : "Muted"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE IN-GAME ARENA (gameState === 'playing' || gameState === 'showing_result') */}
          {(gameState === "playing" || gameState === "showing_result") && currentProblem && (
            <motion.div
              key="playing-arena"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              className="w-full max-w-4xl mx-auto space-y-5"
            >
              {/* Chronal Countdown & Time Synchronicity Bar */}
              <div className="bg-zinc-900/70 border border-cyan-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.1)] space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Timer className={cn("h-4 w-4", timeLeft <= 2.5 ? "text-red-400 animate-spin" : "text-cyan-400")} />
                    <span>TIME SYNCHRONICITY</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-sm sm:text-base font-black tabular-nums transition-colors",
                      timeLeft <= 2.0 ? "text-red-400 animate-pulse" : timeLeft <= 4.0 ? "text-amber-400" : "text-cyan-300"
                    )}>
                      {timeLeft.toFixed(1)}s
                    </span>
                  </div>
                </div>

                <div className="h-2 sm:h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <motion.div
                    className={cn(
                      "h-full rounded-full transition-all duration-100",
                      timeLeft <= 2.0
                        ? "bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                        : timeLeft <= 4.0
                        ? "bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                        : "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    )}
                    style={{ width: `${Math.max(0, Math.min(100, (timeLeft / timerLimit) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Quantum Containment Chamber (Equation Stage) */}
              <div className="bg-gradient-to-b from-zinc-900/80 via-black/80 to-zinc-950/90 border border-cyan-500/40 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center text-center space-y-6">
                {/* Tech Bracket Accents in Corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />

                {/* Subtitle / Objective Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-mono tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>DECRYPT FOR X TO STABILIZE RIFT</span>
                </div>

                {/* Big Dynamic Equation Display */}
                <motion.div
                  key={currentProblem.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 140 }}
                  className="py-2 sm:py-6 px-4"
                >
                  <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-wide tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200 drop-shadow-[0_0_35px_rgba(6,182,212,0.5)] select-none">
                    {currentProblem.equation}
                  </h1>
                </motion.div>

                {/* Showing Result Overlay Feedback */}
                {gameState === "showing_result" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "w-full max-w-xl p-4 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-2xl",
                      resultData.status === "correct"
                        ? "bg-emerald-950/70 border-emerald-400/50 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                        : resultData.status === "timeout"
                        ? "bg-amber-950/70 border-amber-400/50 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                        : "bg-red-950/70 border-red-400/50 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2 text-lg sm:text-2xl font-black uppercase tracking-wider">
                      {resultData.status === "correct" && (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                          <span>Rift Stabilized! +{resultData.points} PTS</span>
                        </>
                      )}
                      {resultData.status === "incorrect" && (
                        <>
                          <XCircle className="h-6 w-6 text-red-400" />
                          <span>Fluctuation Detected! X = {resultData.trueAnswer}</span>
                        </>
                      )}
                      {resultData.status === "timeout" && (
                        <>
                          <Clock className="h-6 w-6 text-amber-400" />
                          <span>Chronal Collapse! X = {resultData.trueAnswer}</span>
                        </>
                      )}
                    </div>
                    {resultData.explanation && (
                      <p className="mt-2 text-xs sm:text-sm font-mono text-center text-white/80">
                        {resultData.explanation}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* 4 Tactile Cyber Keypad Choices */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {currentProblem.options.map((option, index) => {
                  const isCorrect = option === currentProblem.answer;
                  const isShowing = gameState === "showing_result";
                  
                  return (
                    <Button
                      key={`${currentProblem.id}-${option}-${index}`}
                      type="button"
                      disabled={isShowing}
                      onClick={() => handleAnswer(option)}
                      className={cn(
                        "h-20 sm:h-24 md:h-28 text-2xl sm:text-3xl md:text-4xl font-black font-mono rounded-2xl sm:rounded-3xl border-2 transition-all duration-150 flex flex-col items-center justify-center relative overflow-hidden group shadow-lg active:scale-95",
                        isShowing && isCorrect
                          ? "bg-emerald-600/40 border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                          : isShowing && !isCorrect
                          ? "bg-zinc-900/40 border-white/5 text-white/30"
                          : "bg-zinc-900/80 hover:bg-cyan-950/40 border-cyan-500/30 hover:border-cyan-400 text-white hover:text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                      )}
                    >
                      {/* Keyboard Keycap Badge [1], [2], [3], [4] */}
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 border border-white/10 text-[10px] sm:text-xs font-mono font-bold text-cyan-300/70 group-hover:text-cyan-200 group-hover:border-cyan-500/40">
                        [{index + 1}]
                      </span>

                      <span className="relative z-10 tabular-nums">{option}</span>

                      {/* Glowing Accent Shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </Button>
                  );
                })}
              </div>

              {/* Bottom In-Game Navigation & Hotkey Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleAbortGame}
                    className="h-10 px-4 text-xs sm:text-sm font-bold bg-red-950/30 hover:bg-red-900/50 text-red-300 border-red-500/40 hover:border-red-400 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    <span>Abort Game & Return to Menu</span>
                  </Button>

                  <Button
                    variant="ghost"
                    asChild
                    className="h-10 px-3 text-xs sm:text-sm font-bold text-white/60 hover:text-white rounded-xl"
                  >
                    <Link href="/games" className="flex items-center gap-1.5">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Games</span>
                    </Link>
                  </Button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-cyan-300/60">
                  <span>Hotkeys:</span>
                  <span className="px-1.5 py-0.5 bg-black/40 border border-cyan-500/30 rounded text-cyan-300 text-[11px]">1 - 4</span>
                  <span>Answer</span>
                  <span className="text-white/20">•</span>
                  <span className="px-1.5 py-0.5 bg-black/40 border border-red-500/30 rounded text-red-300 text-[11px]">ESC</span>
                  <span>Abort</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* FINISHED / DEBRIEF SCREEN (gameState === 'finished') */}
          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-2xl mx-auto text-center space-y-6 py-6"
            >
              <div className="relative inline-block mx-auto">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"
                />
                <div className="relative p-6 rounded-3xl bg-gradient-to-b from-yellow-500/20 to-amber-950/40 border border-yellow-500/40 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                  <Trophy className="h-20 w-20 sm:h-24 sm:w-24 text-yellow-400 mx-auto drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
                  Universal Stability Restored
                </h2>
                <p className="text-sm sm:text-base text-cyan-200/70 font-mono">
                  Quantum Rift Sealed // Threat Level {difficulty.toUpperCase()} Neutralized
                </p>
              </div>

              {/* Scorecard Grid */}
              <div className="grid grid-cols-3 gap-3 bg-zinc-900/60 border border-cyan-500/30 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
                <div className="text-center p-2">
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-cyan-300/60 mb-1">Total Points</p>
                  <p className="text-2xl sm:text-4xl font-black text-white tabular-nums">{score}</p>
                </div>
                <div className="text-center p-2 border-x border-white/10">
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-purple-300/60 mb-1">Max Combo</p>
                  <p className="text-2xl sm:text-4xl font-black text-purple-300 tabular-nums">x{highestCombo}</p>
                </div>
                <div className="text-center p-2">
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-emerald-300/60 mb-1">Accuracy</p>
                  <p className="text-2xl sm:text-4xl font-black text-emerald-300 tabular-nums">
                    {totalRounds > 0 ? Math.round((correctAnswersCount / totalRounds) * 100) : 0}%
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={handleStartGame}
                  className="h-14 px-8 text-base font-black bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Repeat className="h-5 w-5" />
                  <span>Re-Engage Rift</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setGameState("idle")}
                  className="h-14 px-8 text-base font-bold border-cyan-500/30 bg-zinc-900/60 hover:bg-zinc-800 text-cyan-200 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Layers className="h-5 w-5" />
                  <span>Command Deck</span>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="h-14 px-8 text-base font-bold border-white/15 bg-zinc-900/60 hover:bg-zinc-800 text-white rounded-2xl flex items-center justify-center gap-2"
                >
                  <Link href="/games">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Games</span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Futuristic Quantum Footer */}
      <CardFooter className="z-20 bg-zinc-950/80 backdrop-blur-md border-t border-cyan-500/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-cyan-300/60 shrink-0">
        <div className="flex items-center gap-2">
          <Rocket className="h-3.5 w-3.5 text-cyan-400" />
          <span>ALGEBRAIC ABYSS // QUANTUM TELEMETRY CORE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            STABLE
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <Link href="/games" className="hover:text-cyan-200 transition-colors hidden sm:inline">
            ← Exit to Games Hub
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
