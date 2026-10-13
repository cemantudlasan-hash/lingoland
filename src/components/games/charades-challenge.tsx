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
  generateCharadesPrompt,
  type GenerateCharadesPromptInput,
  type GenerateCharadesPromptOutput,
} from "@/ai/flows/generate-charades-prompt";
import { Loader2, Sparkles, Timer, Play, Repeat, Check, Eye, EyeOff, Maximize, Minimize, BookOpen } from "lucide-react";
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
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
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
        if(timerRef.current) clearInterval(timerRef.current!)
    }; 
  }, []);
  
  const resetGame = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState("idle");
      setDifficulty(null);
      setUsedPrompts([]);
  }

  const handlePlayAgain = () => {
    if (difficulty) {
        handleGetNewPrompt(difficulty);
    } else {
        setGameState("selecting_difficulty");
    }
  }


  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col justify-between overflow-y-auto overflow-x-hidden max-w-full",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-start p-3 sm:p-8" 
            : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      <CardHeader className="text-center relative p-3 sm:p-6 pr-14 sm:pr-16">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-1 sm:mb-4">
                <Icon className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase text-xl sm:text-2xl md:text-3xl", isFullscreen && "text-xl sm:text-5xl md:text-6xl")}>{game.title}</CardTitle>
        <CardDescription className={cn("text-xs sm:text-sm", isFullscreen && "text-xs sm:text-2xl mt-1 sm:mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn("text-xs", isFullscreen && "text-xs sm:text-xl px-3 sm:px-6 py-0.5 sm:py-1")}>{difficulty || game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-4 sm:space-y-6 text-center flex flex-col items-center justify-center w-full max-w-full overflow-y-auto overflow-x-hidden",
          isFullscreen ? "min-h-[55vh] max-w-6xl mx-auto w-full px-2 sm:px-12" : "w-full flex-1 min-h-[calc(100dvh-16rem)] p-3 sm:p-6 lg:p-8"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md py-4">
            <p className={cn("text-muted-foreground text-sm sm:text-base", isFullscreen && "sm:text-2xl")}>Ready to express yourself without words?</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-11 sm:h-12 w-full sm:w-auto", isFullscreen && "sm:h-20 sm:px-16 sm:text-3xl sm:rounded-3xl")}>
                <Sparkles className={cn("mr-2 sm:mr-3", isFullscreen ? "h-5 w-5 sm:h-10 sm:w-10" : "h-4 w-4 sm:h-5 sm:w-5")} />
                Start Challenge
              </Button>
              <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} variant="secondary" className={cn("font-bold shadow-md h-11 sm:h-12 w-full sm:w-auto", isFullscreen && "sm:h-20 sm:px-16 sm:text-3xl sm:rounded-3xl")}>
                <BookOpen className={cn("mr-2 sm:mr-3", isFullscreen ? "h-5 w-5 sm:h-10 sm:w-10" : "h-4 w-4 sm:h-5 sm:w-5")} />
                How to Play
              </Button>
            </div>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full max-w-lg p-4 sm:p-8",
                 isFullscreen ? "sm:p-16 sm:max-w-5xl" : ""
             )}>
                <h3 className={cn("font-bold text-center mb-2 sm:mb-4 text-lg sm:text-xl", isFullscreen ? "text-xl sm:text-4xl" : "")}>How to Play</h3>
                <div className={cn("text-left space-y-3 sm:space-y-4 text-xs sm:text-base", isFullscreen && "sm:text-2xl")}>
                    <p>1. <strong>The Actor:</strong> Receives a secret prompt. Show the word to yourself only!</p>
                    <p>2. <strong>The Action:</strong> Act out the word using <strong>no speech or sounds</strong>.</p>
                    <p>3. <strong>The Guessers:</strong> Identify the prompt before the {TIMER_SECONDS}-second timer expires.</p>
                </div>
                <div className="self-center mt-4 sm:mt-8 w-full">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest text-center mb-3 sm:mb-4 text-xs sm:text-sm", isFullscreen && "sm:text-2xl")}>Choose Challenge Level</p>
                    <div className="flex flex-wrap gap-2.5 sm:gap-4 justify-center">
                        {["beginner", "intermediate", "advanced"].map(level => (
                            <Button key={level} onClick={() => handleGetNewPrompt(level as SkillLevel)} size="default" variant="outline" className={cn("font-black uppercase h-11 sm:h-14 px-4 sm:px-8 text-xs sm:text-base rounded-xl", isFullscreen && "sm:h-20 sm:px-12 sm:text-2xl sm:rounded-3xl sm:border-4")}>{level}</Button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16 sm:h-24 sm:w-24" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground animate-pulse text-xs sm:text-base", isFullscreen && "sm:text-3xl")}>Synthesizing action prompt...</p>
          </div>
        )}
        {(gameState === "ready" || gameState === "playing" || gameState === "finished") && prompt && (
          <div className="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-5xl px-2">
             <div className={cn(
                 "text-center p-6 sm:p-12 rounded-2xl sm:rounded-[3rem] bg-muted/20 backdrop-blur-sm border-2 sm:border-4 border-primary/20 shadow-inner w-full flex flex-col justify-center",
                 isFullscreen ? "min-h-[10rem] sm:min-h-[15rem]" : "min-h-[7rem] sm:min-h-[8rem]"
             )}>
                <p className={cn("font-black uppercase tracking-widest text-muted-foreground mb-2 sm:mb-4 text-xs sm:text-sm", isFullscreen && "sm:text-2xl")}>
                    Category: {prompt.category}
                </p>
                {(showPrompt && gameState === 'ready') || gameState === 'finished' ? (
                     <p className={cn("font-black text-primary italic text-2xl sm:text-4xl", isFullscreen && "text-3xl sm:text-[8vw] leading-none")}>
                        {prompt.prompt}
                    </p>
                ) : (
                     <p className={cn("font-black text-muted-foreground uppercase opacity-30 text-xl sm:text-2xl", isFullscreen && "sm:text-[6vw]")}>
                        [HIDDEN INTEL]
                    </p>
                )}
            </div>

            {gameState === 'ready' && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full max-w-md justify-center">
                    <Button onClick={() => setShowPrompt(p => !p)} size="lg" variant="secondary" className={cn("w-full sm:w-auto h-11 sm:h-14 px-4 sm:px-8 text-xs sm:text-base font-black uppercase shadow-xl rounded-xl sm:rounded-2xl", isFullscreen && "sm:h-20 sm:px-12 sm:text-2xl")}>
                        {showPrompt ? <EyeOff className={cn("mr-2 sm:mr-3", isFullscreen ? "h-5 w-5 sm:h-8 sm:w-8" : "h-4 w-4 sm:h-5 sm:w-5")}/> : <Eye className={cn("mr-2 sm:mr-3", isFullscreen ? "h-5 w-5 sm:h-8 sm:w-8" : "h-4 w-4 sm:h-5 sm:w-5")}/> }
                        {showPrompt ? 'Hide Word' : 'Show Word'}
                    </Button>
                    <Button onClick={startTimer} size="lg" disabled={!showPrompt} className={cn("w-full sm:w-auto h-11 sm:h-14 px-4 sm:px-8 text-xs sm:text-base font-black uppercase shadow-xl bg-primary text-white rounded-xl sm:rounded-2xl", isFullscreen && "sm:h-20 sm:px-12 sm:text-2xl")}>
                        <Play className={cn("mr-2 sm:mr-3", isFullscreen ? "h-5 w-5 sm:h-8 sm:w-8" : "h-4 w-4 sm:h-5 sm:w-5")}/>Start Countdown
                    </Button>
                </div>
            )}
            
            { (gameState === 'playing') &&
                <div className={cn("w-full max-w-2xl space-y-2 sm:space-y-4", isFullscreen && "mt-4 sm:mt-10")}>
                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <Timer className={cn("text-primary", isFullscreen ? "h-6 w-6 sm:h-10 sm:w-10" : "h-5 w-5 sm:h-6 sm:w-6")} />
                        <p className={cn("font-mono font-black text-xl sm:text-2xl", isFullscreen && "sm:text-5xl")}>{timeLeft}s</p>
                    </div>
                    <Progress value={(timeLeft / TIMER_SECONDS) * 100} className={cn("h-3 sm:h-4", isFullscreen && "sm:h-6")} />
                </div>
            }

            {gameState === 'playing' && (
                <div className="flex gap-4 mt-4 sm:mt-10 w-full sm:w-auto justify-center">
                    <Button onClick={() => {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setGameState('finished');
                    }} size="lg" variant="secondary" className={cn("bg-green-600 hover:bg-green-700 text-white font-black uppercase shadow-xl w-full sm:w-auto h-12 sm:h-20 px-6 sm:px-16 text-base sm:text-3xl rounded-2xl sm:rounded-3xl")}>
                        <Check className={cn("mr-2 sm:mr-4", isFullscreen ? "h-6 w-6 sm:h-12 sm:w-12" : "h-5 w-5 sm:h-8 sm:w-8")}/> Mission Solved!
                    </Button>
                </div>
            )}
            
            {gameState === 'finished' && (
                <div className="text-center flex flex-col items-center gap-4 sm:gap-8 animate-in zoom-in duration-500 w-full max-w-xl mx-auto">
                    <p className={cn("font-black uppercase tracking-tighter text-amber-500 text-2xl sm:text-3xl", isFullscreen && "sm:text-7xl")}>{timeLeft === 0 ? "STATION TIMEOUT!" : "TARGET IDENTIFIED!"}</p>
                    <Button onClick={handlePlayAgain} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl w-full sm:w-auto h-12 sm:h-20 px-8 sm:px-16 text-base sm:text-3xl rounded-xl sm:rounded-3xl")}>
                        <Repeat className={cn("mr-2 sm:mr-3", isFullscreen ? "h-5 w-5 sm:h-10 sm:w-10" : "h-4 w-4 sm:h-5 sm:w-5")} />
                        Next Mission
                    </Button>
                </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-4 pt-4 sm:pt-8 w-full max-w-full", isFullscreen && "max-w-6xl mx-auto w-full pb-6 sm:pb-16")}>
        <Button variant="outline" asChild size="default" className={cn("w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-bold rounded-xl", isFullscreen && "sm:h-16 sm:px-10 sm:text-xl sm:rounded-2xl")}>
            <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== 'idle' && gameState !== 'instructions' && (
            <Button variant="secondary" onClick={resetGame} size="default" className={cn("w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-bold rounded-xl", isFullscreen && "sm:h-16 sm:px-10 sm:text-xl sm:rounded-2xl")}>Abort Session</Button>
        )}
      </CardFooter>
    </Card>
  );
}
