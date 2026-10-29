"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  generateCharadesPrompt,
  type GenerateCharadesPromptOutput,
} from "@/ai/flows/generate-charades-prompt";
import { 
  Loader2, 
  Sparkles, 
  Timer, 
  Play, 
  Repeat, 
  Check, 
  Eye, 
  EyeOff, 
  Maximize, 
  Minimize, 
  BookOpen, 
  ArrowLeft,
  LogOut,
  Theater,
  HelpCircle,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GameState = "idle" | "loading" | "ready" | "playing" | "finished" | "selecting_difficulty" | "instructions";
const TIMER_SECONDS = 60;

export function CharadesChallenge({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [prompt, setPrompt] = React.useState<GenerateCharadesPromptOutput | null>(null);
  const [usedPrompts, setUsedPrompts] = React.useState<string[]>([]);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_SECONDS);
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("intermediate");
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [solvedCount, setSolvedCount] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleGetNewPrompt = async (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    setPrompt(null);
    setShowPrompt(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);
    try {
      const newPrompt = await generateCharadesPrompt({ difficulty: level, usedPrompts });
      setPrompt(newPrompt);
      setUsedPrompts(prev => [...prev, newPrompt.prompt]);
      setGameState("ready");
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get a new prompt. Please try again.",
      });
      setGameState("idle");
    }
  };
  
  const startTimer = () => {
    setShowPrompt(false); 
    setGameState("playing");
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  React.useEffect(() => {
    return () => {
      if(timerRef.current) clearInterval(timerRef.current);
    }; 
  }, []);
  
  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("idle");
    setPrompt(null);
    setShowPrompt(false);
    toast({
      title: "Stage Session Aborted",
      description: "Returned to the Charades Green Room.",
    });
  };

  const handleSolved = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSolvedCount(prev => prev + 1);
    setGameState("finished");
  };

  const isGameActive = ["ready", "playing", "finished"].includes(gameState);

  return (
    <Card className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] transition-all duration-500 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-zinc-950/95 backdrop-blur-2xl border border-rose-500/20 shadow-2xl text-white",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-black" : "rounded-2xl md:rounded-3xl"
    )}>
      {/* Universal Header with Back to Games & In-game Abort */}
      <CardHeader className="z-20 bg-zinc-950/80 backdrop-blur-md border-b border-rose-500/20 px-3 sm:px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border-rose-500/30 hover:border-rose-400 rounded-xl"
            >
              <Link href="/games" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Games</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Theater className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-pink-300 to-amber-300">
                  {game.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-[11px] font-medium text-rose-300/70">
                  <span>Silent Acting & Kinetic Wordplay</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {isGameActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40 rounded-xl flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                <span>Abort Game</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 text-rose-300/70 hover:text-white rounded-xl"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Main Content: items-stretch to fix mobile scroll clipping */}
      <CardContent className="flex-1 flex flex-col items-stretch justify-start p-3 sm:p-6 lg:p-8 z-10 relative overflow-y-auto w-full max-w-6xl mx-auto space-y-6 pb-16">
        {gameState === "idle" && (
          <div className="w-full space-y-6 py-2">
            {/* Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/60 border border-rose-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-mono uppercase text-rose-300/60">Stage Countdown</p>
                <p className="text-sm sm:text-base font-black text-white">{TIMER_SECONDS} SECONDS</p>
              </div>
              <div className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-mono uppercase text-amber-300/60">Stage Mode</p>
                <p className="text-sm sm:text-base font-black text-white">SILENT ACTING</p>
              </div>
              <div className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-mono uppercase text-emerald-300/60">Solved Prompts</p>
                <p className="text-sm sm:text-base font-black text-emerald-300">{solvedCount} GUESSED</p>
              </div>
              <div className="bg-zinc-900/60 border border-purple-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-mono uppercase text-purple-300/60">Acting Level</p>
                <p className="text-sm sm:text-base font-black text-purple-300 uppercase">{difficulty}</p>
              </div>
            </div>

            {/* Main Stage Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-gradient-to-b from-rose-950/20 via-zinc-900/40 to-black/60 border border-rose-500/30 rounded-3xl p-5 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                    <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                    <span>CHARADES THEATER STAGE</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                    Express Yourself <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300">
                      Without Spoken Words
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-rose-100/70 leading-relaxed max-w-xl">
                    Step onto the spotlight. Peek at the secret word prompt, conceal it from the audience, and act it out before the 60-second timer hits zero!
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-mono uppercase text-rose-300/80">Select Stage Complexity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all capitalize",
                          difficulty === level
                            ? "bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                            : "bg-zinc-900/50 border-white/10 text-white/60 hover:border-rose-500/30 hover:text-white"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleGetNewPrompt(difficulty)}
                    className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-black bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.35)] transition-all hover:scale-[1.02] border border-rose-300/40 uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    <span>Take The Stage</span>
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

              {/* Theater Guidelines Deck */}
              <div className="lg:col-span-5 bg-zinc-900/50 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-rose-300">
                    <HelpCircle className="h-5 w-5 text-rose-400" />
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                      Stage Directives
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-rose-100/80 font-normal">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">01</span>
                      <div>
                        <p className="font-bold text-white">The Secret Actor</p>
                        <p className="text-[12px] text-rose-200/60">Peek at the prompt confidentially using the &quot;Show Word&quot; button.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">02</span>
                      <div>
                        <p className="font-bold text-white">Strict Silence</p>
                        <p className="text-[12px] text-rose-200/60">Act solely through gestures and mime. No vocal sounds or lip-syncing allowed.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">03</span>
                      <div>
                        <p className="font-bold text-white">Instant Abort Safety</p>
                        <p className="text-[12px] text-rose-200/60">Abort the countdown and return to green room anytime with the header button.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setGameState('instructions')} 
                  variant="outline" 
                  className="w-full border-rose-500/30 text-rose-200 hover:bg-rose-950/40 rounded-xl font-bold text-xs"
                >
                  View Actor Guidebook
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl max-w-2xl w-full mx-auto text-center space-y-6">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-3">
              <BookOpen className="text-rose-400" /> How to Play Charades
            </h3>
            <div className="text-left space-y-3 font-normal text-rose-100/90 text-sm sm:text-base">
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">1. <strong>The Actor:</strong> Receives a secret prompt. Show the word to yourself only!</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">2. <strong>The Action:</strong> Act out the word using <strong>no speech or sounds</strong>.</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">3. <strong>The Guessers:</strong> Identify the prompt before the 60-second timer expires.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setGameState('idle')} 
                variant="outline"
                className="flex-1 border-white/20 text-white font-bold h-12 rounded-xl"
              >
                Back to Green Room
              </Button>
              <Button 
                onClick={() => handleGetNewPrompt(difficulty)} 
                className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black h-12 rounded-xl"
              >
                Start Prompt
              </Button>
            </div>
          </div>
        )}

        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="animate-spin text-rose-400 h-12 w-12" />
            <p className="text-rose-200 animate-pulse text-sm sm:text-base font-mono">Synthesizing action prompt...</p>
          </div>
        )}

        {(gameState === "ready" || gameState === "playing" || gameState === "finished") && prompt && (
          <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
            {/* Prompt Display Box */}
            <div className="text-center p-6 sm:p-12 rounded-3xl bg-zinc-900/80 backdrop-blur-md border-2 border-rose-500/30 shadow-xl w-full flex flex-col justify-center min-h-[140px]">
              <span className="font-mono text-xs uppercase tracking-widest text-rose-400 mb-2">
                Category: {prompt.category}
              </span>
              {(showPrompt && gameState === 'ready') || gameState === 'finished' ? (
                <p className="font-black text-rose-300 italic text-3xl sm:text-5xl leading-tight">
                  &ldquo;{prompt.prompt}&rdquo;
                </p>
              ) : (
                <p className="font-mono font-black text-white/30 uppercase text-2xl sm:text-3xl tracking-widest">
                  [CONFIDENTIAL PROMPT HIDDEN]
                </p>
              )}
            </div>

            {/* Ready Controls */}
            {gameState === 'ready' && (
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                <Button 
                  onClick={() => setShowPrompt(p => !p)} 
                  variant="outline"
                  className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-black uppercase rounded-xl border-white/20"
                >
                  {showPrompt ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showPrompt ? 'Hide Word' : 'Peek Word'}
                </Button>
                <Button 
                  onClick={startTimer} 
                  disabled={!showPrompt} 
                  className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-black uppercase bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl shadow-lg"
                >
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Start Timer
                </Button>
              </div>
            )}

            {/* Playing Countdown */}
            {gameState === 'playing' && (
              <div className="w-full max-w-2xl space-y-3">
                <div className="flex justify-between items-center text-sm font-mono font-bold">
                  <div className="flex items-center gap-2 text-rose-300">
                    <Timer className={cn("h-5 w-5", timeLeft <= 10 && "text-red-400 animate-spin")} />
                    <span>STAGE TIMER</span>
                  </div>
                  <span className={cn("text-2xl font-black tabular-nums", timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white")}>
                    {timeLeft}s
                  </span>
                </div>
                <Progress value={(timeLeft / TIMER_SECONDS) * 100} className="h-3" />

                <div className="flex justify-center pt-6">
                  <Button 
                    onClick={handleSolved} 
                    size="lg" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl h-14 sm:h-16 px-10 sm:px-14 text-lg sm:text-xl rounded-2xl flex items-center gap-2"
                  >
                    <Check className="h-6 w-6" />
                    <span>Audience Solved It!</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Finished Debrief */}
            {gameState === 'finished' && (
              <div className="text-center flex flex-col items-center gap-4 animate-in zoom-in duration-500 w-full max-w-md py-4">
                <p className="font-black uppercase tracking-wider text-amber-400 text-2xl sm:text-3xl">
                  {timeLeft === 0 ? "STAGE TIMEOUT!" : "TARGET IDENTIFIED!"}
                </p>
                <div className="flex gap-3 w-full">
                  <Button 
                    onClick={() => handleGetNewPrompt(difficulty)} 
                    className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black h-12 rounded-xl"
                  >
                    <Repeat className="mr-2 h-4 w-4" />
                    Next Prompt
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetGame} 
                    className="flex-1 border-white/20 text-white font-bold h-12 rounded-xl"
                  >
                    Return to Green Room
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="z-20 bg-zinc-950/80 backdrop-blur-md border-t border-rose-500/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-rose-300/60 shrink-0">
        <div className="flex items-center gap-2">
          <Theater className="h-3.5 w-3.5 text-rose-400" />
          <span>CHARADES CHALLENGE // THEATER TERMINAL</span>
        </div>
        <Link href="/games" className="hover:text-rose-200 transition-colors">
          ← Exit to Games Hub
        </Link>
      </CardFooter>
    </Card>
  );
}
