"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { 
  Loader2, Sparkles, Repeat, Trophy, Maximize, Minimize, HelpCircle, 
  Volume2, CheckCircle2, Zap, Flame, Star, Key, Eye, EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import confetti from "canvas-confetti";

type GameState = "idle" | "spinning" | "result" | "instructions";

export type VerbCategory = "All" | "Action" | "Creative" | "Mind" | "Daily";

export type VerbEntry = {
  verb: string;
  past: string;
  continuous: string;
  isIrregular: boolean;
  category: Exclude<VerbCategory, "All">;
  example: string;
  icon: string;
};

// Rich vocabulary collection of 28 high-utility English verbs
const MASTER_VERBS: VerbEntry[] = [
  // Action & Movement
  { verb: "travel", past: "traveled", continuous: "traveling", isIrregular: false, category: "Action", example: "I will travel to exciting new places.", icon: "✈️" },
  { verb: "run", past: "ran", continuous: "running", isIrregular: true, category: "Action", example: "I will run five kilometers tomorrow morning.", icon: "🏃" },
  { verb: "swim", past: "swam", continuous: "swimming", isIrregular: true, category: "Action", example: "I will swim across the lake with my team.", icon: "🏊" },
  { verb: "dance", past: "danced", continuous: "dancing", isIrregular: false, category: "Action", example: "I will dance at the celebration tonight.", icon: "💃" },
  { verb: "fly", past: "flew", continuous: "flying", isIrregular: true, category: "Action", example: "I will fly above the clouds in an airplane.", icon: "🦅" },
  { verb: "drive", past: "drove", continuous: "driving", isIrregular: true, category: "Action", example: "I will drive safely along the scenic road.", icon: "🚗" },
  { verb: "explore", past: "explored", continuous: "exploring", isIrregular: false, category: "Action", example: "I will explore the hidden mountain trail.", icon: "🧭" },

  // Creative & Expression
  { verb: "write", past: "wrote", continuous: "writing", isIrregular: true, category: "Creative", example: "I will write an inspiring story this weekend.", icon: "✍️" },
  { verb: "draw", past: "drew", continuous: "drawing", isIrregular: true, category: "Creative", example: "I will draw a detailed landscape sketch.", icon: "🎨" },
  { verb: "paint", past: "painted", continuous: "painting", isIrregular: false, category: "Creative", example: "I will paint a vibrant sunset on canvas.", icon: "🖌️" },
  { verb: "sing", past: "sang", continuous: "singing", isIrregular: true, category: "Creative", example: "I will sing with the choir in the concert.", icon: "🎤" },
  { verb: "build", past: "built", continuous: "building", isIrregular: true, category: "Creative", example: "I will build a sustainable solar home.", icon: "🏗️" },
  { verb: "create", past: "created", continuous: "creating", isIrregular: false, category: "Creative", example: "I will create a fantastic new mobile app.", icon: "💡" },
  { verb: "design", past: "designed", continuous: "designing", isIrregular: false, category: "Creative", example: "I will design an elegant modern website.", icon: "📐" },

  // Mind & Cognition
  { verb: "learn", past: "learned", continuous: "learning", isIrregular: false, category: "Mind", example: "I will learn fluent English conversational skills.", icon: "🧠" },
  { verb: "read", past: "read", continuous: "reading", isIrregular: true, category: "Mind", example: "I will read two captivating novels this month.", icon: "📖" },
  { verb: "study", past: "studied", continuous: "studying", isIrregular: false, category: "Mind", example: "I will study grammar rules before the test.", icon: "📚" },
  { verb: "speak", past: "spoke", continuous: "speaking", isIrregular: true, category: "Mind", example: "I will speak with clarity and confidence.", icon: "🗣️" },
  { verb: "teach", past: "taught", continuous: "teaching", isIrregular: true, category: "Mind", example: "I will teach my classmate how to code.", icon: "🧑‍🏫" },
  { verb: "discover", past: "discovered", continuous: "discovering", isIrregular: false, category: "Mind", example: "I will discover new fascinating historical facts.", icon: "🔍" },
  { verb: "choose", past: "chose", continuous: "choosing", isIrregular: true, category: "Mind", example: "I will choose the healthiest options.", icon: "🎯" },

  // Daily Life & Energy
  { verb: "cook", past: "cooked", continuous: "cooking", isIrregular: false, category: "Daily", example: "I will cook a wholesome dinner tonight.", icon: "🍳" },
  { verb: "eat", past: "ate", continuous: "eating", isIrregular: true, category: "Daily", example: "I will eat balanced and nutritious meals.", icon: "🥗" },
  { verb: "drink", past: "drank", continuous: "drinking", isIrregular: true, category: "Daily", example: "I will drink plenty of fresh water every day.", icon: "💧" },
  { verb: "sleep", past: "slept", continuous: "sleeping", isIrregular: true, category: "Daily", example: "I will sleep for eight restful hours.", icon: "🌙" },
  { verb: "play", past: "played", continuous: "playing", isIrregular: false, category: "Daily", example: "I will play soccer with my friends on Saturday.", icon: "⚽" },
  { verb: "clean", past: "cleaned", continuous: "cleaning", isIrregular: false, category: "Daily", example: "I will clean and organize my study room.", icon: "🧹" },
  { verb: "help", past: "helped", continuous: "helping", isIrregular: false, category: "Daily", example: "I will help my community with charity work.", icon: "🤝" },
];

const WHEEL_COLORS = [
  "#2563EB", "#DB2777", "#059669", "#D97706", "#7C3AED", "#0891B2",
  "#DC2626", "#0D9488", "#EA580C", "#4F46E5", "#65A30D", "#C026D3",
];

const CATEGORIES: { id: VerbCategory; label: string; icon: string }[] = [
  { id: "All", label: "All Verbs", icon: "⚡" },
  { id: "Action", label: "Action", icon: "🏃" },
  { id: "Creative", label: "Creative", icon: "🎨" },
  { id: "Mind", label: "Mind", icon: "🧠" },
  { id: "Daily", label: "Daily Life", icon: "🍳" },
];

// Helper to initialize a balanced 12-verb active stage
function initStageVerbs(category: VerbCategory, used: string[]): VerbEntry[] {
  const pool = category === "All" ? MASTER_VERBS : MASTER_VERBS.filter((v) => v.category === category);
  const unvisited = pool.filter((v) => !used.includes(v.verb));

  if (pool.length <= 12) {
    return pool;
  }

  if (unvisited.length <= 12) {
    const visited = pool.filter((v) => used.includes(v.verb));
    return [...unvisited, ...visited].slice(0, 12);
  }

  return unvisited.slice(0, 12);
}

export function WheelOfFortune({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [selectedCategory, setSelectedCategory] = React.useState<VerbCategory>("All");
  const [result, setResult] = React.useState<VerbEntry | null>(null);
  const [rotation, setRotation] = React.useState(0);
  const [usedVerbs, setUsedVerbs] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = React.useState(false);
  const [userSentence, setUserSentence] = React.useState("");

  // STABLE active wheel stage: guarantees wheel never reshuffles under the needle!
  const [activeStageVerbs, setActiveStageVerbs] = React.useState<VerbEntry[]>(() => initStageVerbs("All", []));

  const game = getGameBySlug(slug);
  const { toast } = useToast();

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const currentPool = React.useMemo(() => {
    if (selectedCategory === "All") return MASTER_VERBS;
    return MASTER_VERBS.filter((v) => v.category === selectedCategory);
  }, [selectedCategory]);

  const availableVerbs = React.useMemo(() => {
    return currentPool.filter((v) => !usedVerbs.includes(v.verb));
  }, [currentPool, usedVerbs]);

  const handleCategoryChange = (newCat: VerbCategory) => {
    if (gameState === "spinning") return;
    const initialStage = initStageVerbs(newCat, []);
    setSelectedCategory(newCat);
    setActiveStageVerbs(initialStage);
    setUsedVerbs([]);
    setGameState("idle");
    setResult(null);
    setIsAnswerRevealed(false);
    setUserSentence("");
  };

  // Realistic synthetic click sound via Web Audio API
  const playRealisticTickSequence = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      let elapsed = 0;
      let delay = 35;
      const ticks: number[] = [];
      while (elapsed < 3700) {
        ticks.push(elapsed);
        elapsed += delay;
        if (elapsed > 1000) delay += 7;
        if (elapsed > 2200) delay += 18;
        if (elapsed > 3000) delay += 40;
      }

      ticks.forEach((t) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.02);
            gain.gain.setValueAtTime(0.09, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.02);
          } catch (e) {}
        }, t);
      });
    } catch (e) {}
  };

  const handleSpin = () => {
    if (availableVerbs.length === 0) {
      setUsedVerbs([]);
    }

    // Check unvisited verbs on the current active wheel
    let activeWheel = activeStageVerbs;
    let unvisitedOnWheel = activeWheel.filter((v) => !usedVerbs.includes(v.verb));

    if (unvisitedOnWheel.length === 0) {
      activeWheel = initStageVerbs(selectedCategory, usedVerbs);
      setActiveStageVerbs(activeWheel);
      unvisitedOnWheel = activeWheel.filter((v) => !usedVerbs.includes(v.verb));
    }

    setGameState("spinning");
    setResult(null);
    setIsAnswerRevealed(false);
    setUserSentence("");
    playRealisticTickSequence();

    // Pick target strictly from unvisited on this exact active wheel
    const targetVerb = unvisitedOnWheel[Math.floor(Math.random() * unvisitedOnWheel.length)];
    const winningIndex = activeWheel.findIndex((v) => v.verb === targetVerb.verb);

    // Exact mathematical target angle: lands 100.00% under top 12 o'clock pointer
    const total = activeWheel.length;
    const segmentAngle = 360 / total;
    const midAngle = (winningIndex + 0.5) * segmentAngle;

    const spinCycles = 6;
    const currentRotationMod = ((rotation % 360) + 360) % 360;
    const targetOffset = (360 - midAngle) % 360;
    const diff = (((targetOffset - currentRotationMod) % 360) + 360) % 360;
    const newRotation = rotation + spinCycles * 360 + diff;

    setRotation(newRotation);

    setTimeout(() => {
      setResult(targetVerb);
      setUsedVerbs((prev) => [...prev, targetVerb.verb]);
      setGameState("result");
    }, 4000);
  };

  const resetGame = () => {
    const initialStage = initStageVerbs(selectedCategory, []);
    setActiveStageVerbs(initialStage);
    setGameState("idle");
    setResult(null);
    setUsedVerbs([]);
    setIsAnswerRevealed(false);
    setUserSentence("");
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const { audio } = await textToSpeech(text);
      const audioEl = new Audio(audio);
      audioEl.play();
      audioEl.onended = () => setIsSpeaking(false);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const Icon = game.icon;

  return (
    <Card
      className={cn(
        "w-full max-w-5xl mx-auto flex flex-col justify-between rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300 min-h-[calc(100dvh-4.5rem)]",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background overflow-y-auto"
      )}
    >
      <CardHeader className={cn(
        "text-center relative px-4 transition-all",
        gameState !== "idle" && gameState !== "instructions" ? "pt-2 sm:pt-4 pb-1 sm:pb-2" : "pt-4 sm:pt-6 pb-2"
      )}>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1.5 z-20">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setGameState(gameState === "instructions" ? "idle" : "instructions")}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Guide</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
        </div>

        <div className={cn("flex justify-center mb-1", gameState !== "idle" && gameState !== "instructions" && "hidden sm:flex")}>
          <Icon className={cn("text-primary transition-all", isFullscreen ? "w-8 h-8 sm:w-12 sm:h-12" : "w-8 h-8 sm:w-12 sm:h-12")} />
        </div>
        <CardTitle className={cn(
          "font-black tracking-tight uppercase",
          gameState !== "idle" && gameState !== "instructions" ? "text-lg sm:text-2xl md:text-3xl" : "text-xl sm:text-3xl md:text-4xl"
        )}>
          {game.title}
        </CardTitle>
        <CardDescription className={cn(
          "text-xs sm:text-sm max-w-xl mx-auto",
          gameState !== "idle" && gameState !== "instructions" && "hidden sm:block"
        )}>
          {game.description}
        </CardDescription>

        {/* Category Filter Selection Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full max-w-xl mx-auto pt-2 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              disabled={gameState === "spinning"}
              className={cn(
                "px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 border",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/40"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "w-full flex-grow flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 pb-8 sm:pb-12 max-w-5xl mx-auto",
          isFullscreen ? "min-h-[60vh] max-w-6xl" : ""
        )}
      >
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-5 text-center max-w-md mx-auto py-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black uppercase tracking-tight text-xl sm:text-2xl">
                {selectedCategory === "All" ? "Master Fortune Wheel" : `${selectedCategory} Verbs`}
              </h3>
              <p className={cn("text-muted-foreground text-xs sm:text-sm")}>
                Spin the realistic fortune wheel for fast-paced verb tense conjugation and sentence building!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button onClick={() => setGameState("instructions")} variant="outline" className="h-11 sm:h-12 px-6 rounded-xl font-bold">
                <HelpCircle className="mr-2 h-4 w-4" /> How to Play
              </Button>
              <Button
                onClick={handleSpin}
                className="h-11 sm:h-12 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Spin Wheel Now
              </Button>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full animate-in zoom-in-95 duration-200",
              isFullscreen ? "p-6 sm:p-12 max-w-3xl" : "p-5 sm:p-8 max-w-lg"
            )}
          >
            <h3 className={cn("font-black uppercase tracking-wider text-center", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>
              How to Play
            </h3>
            <div className={cn("text-left space-y-3 text-muted-foreground w-full", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Select a verb focus category or spin the Master Wheel.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Initiate the spin — watch the words spin past the top ticker pin.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>When the needle stops on a verb, practice formulating the Past Simple, Present Continuous, and Future Tenses.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>Listen to native pronunciation to master regular and irregular verb inflection!</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
              <Button onClick={() => setGameState("idle")} variant="outline" className="h-10 sm:h-11 px-5 rounded-xl font-bold">
                Back
              </Button>
              <Button
                onClick={handleSpin}
                className="h-10 sm:h-11 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
              >
                Spin the Wheel!
              </Button>
            </div>
          </div>
        )}

        {(gameState === "spinning" || gameState === "result") && (
          <div className="w-full max-w-5xl mx-auto py-2 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-center justify-center">
            {/* Realistic Fortune Wheel (Desktop Left / Mobile Top) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-start w-full pt-6 sm:pt-10 pb-2">
              <div
                className="relative flex items-center justify-center select-none w-[210px] h-[210px] xs:w-[240px] xs:h-[240px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px] lg:w-[420px] lg:h-[420px] max-w-[90vw] max-h-[90vw] shrink-0"
              >
                {/* 3D Realistic Physical Needle / Flapper Pin at 12 o'clock */}
                <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  <div className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-amber-400/80 text-[8px] sm:text-[9px] font-black tracking-widest text-amber-300 uppercase shadow-md mb-0.5">
                    ▼ TARGET ▼
                  </div>
                  {/* Brass mounting bracket */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-950 shadow-inner" />
                  </div>
                  {/* Tapered Needle pointing straight down into 12 o'clock */}
                  <div
                    className={cn(
                      "w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-r-[12px] sm:border-r-[16px] border-r-transparent border-t-[28px] sm:border-t-[36px] border-t-amber-400 -mt-1 drop-shadow-[0_5px_8px_rgba(0,0,0,0.6)] origin-top transition-transform",
                      gameState === "spinning" && "animate-[wiggle_0.1s_ease-in-out_infinite]"
                    )}
                  />
                </div>

                {/* Outer Realistic Metallic Bezel Container */}
                <div className="w-full h-full rounded-full p-2.5 sm:p-3.5 bg-gradient-to-tr from-amber-700 via-amber-400 to-yellow-200 shadow-[0_10px_35px_rgba(0,0,0,0.4)] border-2 border-amber-600/60 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-4 border-slate-900 shadow-inner overflow-hidden bg-slate-950 relative">
                    <div
                      className="w-full h-full relative"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: "transform 4s cubic-bezier(0.15, 0.95, 0.35, 1.0)",
                      }}
                    >
                      <svg viewBox="-220 -220 440 440" className="w-full h-full select-none overflow-visible">
                        <defs>
                          <filter id="fortuneBadgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
                          </filter>
                          <radialGradient id="fortunePegGradient" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="40%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#78350f" />
                          </radialGradient>
                          <radialGradient id="fortuneOuterHub" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="50%" stopColor="#ca8a04" />
                            <stop offset="100%" stopColor="#78350f" />
                          </radialGradient>
                          <radialGradient id="fortuneInnerHub" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="50%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#64748b" />
                          </radialGradient>
                        </defs>

                        {/* Wheel Slices with Icons and Clear Verb Labels */}
                        {activeStageVerbs.map((item, index) => {
                          const total = activeStageVerbs.length;
                          const startAngle = (index * 360) / total;
                          const endAngle = ((index + 1) * 360) / total;
                          const midAngle = (startAngle + endAngle) / 2;

                          // Trigonometric slice coordinates (-90deg for 12 o'clock top origin)
                          const rad1 = ((startAngle - 90) * Math.PI) / 180;
                          const rad2 = ((endAngle - 90) * Math.PI) / 180;
                          const x1 = Math.cos(rad1) * 196;
                          const y1 = Math.sin(rad1) * 196;
                          const x2 = Math.cos(rad2) * 196;
                          const y2 = Math.sin(rad2) * 196;
                          const largeArc = 360 / total > 180 ? 1 : 0;
                          const d = `M 0 0 L ${x1} ${y1} A 196 196 0 ${largeArc} 1 ${x2} ${y2} Z`;
                          const isUsed = usedVerbs.includes(item.verb);
                          const isLanded = result?.verb === item.verb && gameState === "result";

                          return (
                            <g key={item.verb}>
                              {/* Colored slice sector */}
                              <path
                                d={d}
                                fill={WHEEL_COLORS[index % WHEEL_COLORS.length]}
                                className={cn(
                                  "transition-opacity duration-300",
                                  isUsed && "opacity-20 grayscale",
                                  isLanded && "filter drop-shadow-[0_0_12px_rgba(254,240,138,0.9)]"
                                )}
                                stroke={isLanded ? "#fef08a" : "#ffffff"}
                                strokeWidth={isLanded ? "3.5" : "1.5"}
                              />

                              {/* Slice Content (Verb Icon Badge + Bold Verb Text) */}
                              <g transform={`rotate(${midAngle})`}>
                                {/* Crisp Icon Badge near outer rim */}
                                <g transform="translate(0, -150)">
                                  <circle r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" filter="url(#fortuneBadgeShadow)" />
                                  <text
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="18"
                                    className="select-none pointer-events-none"
                                  >
                                    {item.icon}
                                  </text>
                                </g>

                                {/* Verb Name radially readable towards center */}
                                <g transform="translate(0, -116)">
                                  <text
                                    transform={midAngle > 90 && midAngle < 270 ? "rotate(90)" : "rotate(-90)"}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="font-black fill-white text-[11px] sm:text-[13px] uppercase tracking-wider select-none pointer-events-none"
                                    style={{
                                      textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 2px #000000",
                                    }}
                                  >
                                    {item.verb}
                                  </text>
                                </g>
                              </g>
                            </g>
                          );
                        })}

                        {/* Physical 3D Brass Pegs (Studs) along slice boundaries */}
                        {activeStageVerbs.map((_, index) => {
                          const total = activeStageVerbs.length;
                          const startAngle = (index * 360) / total;
                          const rad = ((startAngle - 90) * Math.PI) / 180;
                          const px = Math.cos(rad) * 196;
                          const py = Math.sin(rad) * 196;
                          return (
                            <g key={`fortune-peg-${index}`}>
                              <circle cx={px} cy={py} r="4.5" fill="url(#fortunePegGradient)" stroke="#78350f" strokeWidth="1" filter="url(#fortuneBadgeShadow)" />
                              <circle cx={px - 1} cy={py - 1} r="1.5" fill="#fef08a" opacity="0.8" />
                            </g>
                          );
                        })}

                        {/* Center Realistic Metallic Hub */}
                        <circle cx="0" cy="0" r="42" fill="url(#fortuneOuterHub)" stroke="#fef08a" strokeWidth="2.5" filter="url(#fortuneBadgeShadow)" />
                        <circle cx="0" cy="0" r="30" fill="url(#fortuneInnerHub)" stroke="#ca8a04" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                        <text cx="0" cy="0" textAnchor="middle" dominantBaseline="central" fontSize="13" className="select-none pointer-events-none">
                          ⭐
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verb Intelligence & Challenge Side (Desktop Right / Mobile Bottom) */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left gap-4 w-full">
              {/* Mastery Progress Tracker */}
              <div className="w-full p-3 sm:p-4 rounded-2xl bg-card border border-border/30 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Verb Mastery: {selectedCategory}
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs font-black">
                    {usedVerbs.length} / {currentPool.length} Practiced
                  </Badge>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 transition-all duration-300 rounded-full"
                    style={{ width: `${(usedVerbs.length / currentPool.length) * 100}%` }}
                  />
                </div>
              </div>

              {gameState === "spinning" && (
                <div className="flex flex-col items-center lg:items-start gap-3 w-full p-6 rounded-2xl bg-muted/30 border border-primary/20 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-primary h-6 w-6 sm:h-8 sm:w-8" />
                    <span className="font-black uppercase tracking-widest text-sm sm:text-base animate-pulse text-primary">
                      Randomizing Verb Matrix...
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get ready to formulate sentences in past, future, and continuous tenses!
                  </p>
                </div>
              )}

              {gameState === "result" && result && (
                <div className="flex flex-col items-center lg:items-start gap-4 animate-in zoom-in-95 duration-300 w-full">
                  <div className="p-5 sm:p-7 rounded-2xl bg-primary/10 border-2 border-primary/40 shadow-xl w-full">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-bold uppercase tracking-widest text-muted-foreground text-xs sm:text-sm">
                        Target Verb Selected:
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] font-bold uppercase",
                          result.isIrregular ? "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10" : "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                        )}
                      >
                        {result.isIrregular ? "Irregular Verb" : "Regular Verb"}
                      </Badge>
                    </div>

                    {/* Matching Verb and Icon matching the wheel slice 100% */}
                    <div className="flex items-center gap-3.5 my-2">
                      <span className="text-4xl sm:text-6xl drop-shadow-md select-none">{result.icon}</span>
                      <p className="font-black text-primary uppercase italic text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none">
                        {result.verb}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSpeak(isAnswerRevealed ? `${result.verb}. Past tense: ${result.past}.` : `${result.verb}.`)}
                        disabled={isSpeaking}
                        className="ml-auto h-8 px-2.5 rounded-lg text-xs font-bold gap-1"
                      >
                        {isSpeaking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5 text-primary" />}
                        Listen
                      </Button>
                    </div>
                  </div>

                  {/* Grammar Challenge Section (Covered first, revealed upon user action) */}
                  {!isAnswerRevealed ? (
                    <div className="w-full space-y-3.5 p-5 sm:p-6 rounded-2xl bg-card border-2 border-border/40 shadow-sm text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-muted-foreground uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-500" /> Grammar Tense Challenge:
                        </p>
                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-wider">
                          Test Yourself First
                        </Badge>
                      </div>

                      {/* Covered Practice Prompts with Interactive Sentence Writer */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border-2 border-dashed border-primary/30 space-y-3">
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          1. What is the <strong className="text-primary font-bold">Past Simple</strong> form of <span className="underline font-black uppercase text-base">{result.verb}</span>?
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          2. How do you spell its <strong className="text-amber-500 font-bold">Present Continuous (-ing)</strong> form?
                        </p>
                        <div className="space-y-1.5 pt-1">
                          <p className="text-xs sm:text-sm font-semibold text-foreground">
                            3. Construct a <strong className="text-primary font-bold">Future Tense</strong> sentence: <span className="italic opacity-80">&quot;I will {result.verb}...&quot;</span>
                          </p>
                          <input
                            type="text"
                            value={userSentence}
                            onChange={(e) => setUserSentence(e.target.value)}
                            placeholder={`Type your practice sentence here... (e.g. "I will ${result.verb}...")`}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-primary/30 bg-background text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-inner placeholder:text-muted-foreground/60"
                          />
                        </div>
                      </div>

                      {/* Click to Reveal Answers Button */}
                      <Button
                        type="button"
                        onClick={() => setIsAnswerRevealed(true)}
                        className="w-full h-12 rounded-xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                      >
                        <Key className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Reveal Grammar Answers
                      </Button>
                    </div>
                  ) : (
                    /* Revealed Grammar Solutions */
                    <div className="w-full space-y-3.5 p-5 sm:p-6 rounded-2xl bg-card border-2 border-primary/40 shadow-xl text-left animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-muted-foreground uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Official Grammar Answers:
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAnswerRevealed(false)}
                          className="h-7 px-2.5 text-xs font-bold uppercase text-muted-foreground hover:text-foreground"
                        >
                          <EyeOff className="w-3.5 h-3.5 mr-1" />
                          Hide Answers
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Past Simple</span>
                          <span className="font-black text-base text-foreground capitalize">{result.past}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Present Continuous</span>
                          <span className="font-black text-base text-foreground capitalize">{result.continuous}</span>
                        </div>
                      </div>

                      {userSentence && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm">
                          <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Your Practice Sentence</span>
                          <span className="font-semibold text-foreground italic">&quot;{userSentence}&quot;</span>
                        </div>
                      )}

                      <div className="space-y-2 text-xs sm:text-sm bg-muted/20 p-4 rounded-xl border border-border/30">
                        <p className="font-medium text-foreground leading-relaxed">
                          • Future Tense: <span className="text-primary font-bold italic">&quot;{result.example}&quot;</span>
                        </p>
                        <p className="font-medium text-foreground leading-relaxed">
                          • Right Now: <span className="text-amber-500 font-bold italic">&quot;I am {result.continuous} right now.&quot;</span>
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={handleSpin}
                        className="w-full h-12 rounded-xl font-black bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 text-white shadow-xl hover:from-purple-600 hover:to-indigo-700 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider mt-4"
                      >
                        <Repeat className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Next Verb ({availableVerbs.length} left)
                      </Button>
                    </div>
                  )}

                  {!isAnswerRevealed && (
                    <Button
                      type="button"
                      onClick={handleSpin}
                      variant="outline"
                      className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold border-2 mt-2 mb-2"
                    >
                      <Repeat className="mr-2 h-4 w-4" />
                      Skip / Spin Next Verb
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="w-full shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 bg-card/90">
        <Button variant="outline" asChild size="sm" className="w-full sm:w-auto h-9 sm:h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl">
          <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
          <Button variant="secondary" onClick={resetGame} size="sm" className="w-full sm:w-auto h-9 sm:h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl">
            Reset Wheel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
