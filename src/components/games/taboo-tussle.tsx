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
  generateTabooCard,
} from "@/ai/flows/generate-taboo-card";
import type { GenerateTabooCardOutput } from "@/ai/flows/generate-taboo-card";
import { Loader2, Sparkles, Timer, Play, Repeat, Check, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GameState = "idle" | "loading" | "ready" | "playing" | "finished" | "selecting_difficulty" | "instructions";
const TIMER_SECONDS = 90;

export function TabooTussle({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [card, setCard] = React.useState<GenerateTabooCardOutput | null>(null);
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_SECONDS);
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
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

  const handleGetNewCard = async (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    setCard(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);
    try {
      const newCard = await generateTabooCard({ difficulty: level, usedWords });
      setCard(newCard);
      setUsedWords(prev => [...prev, newCard.guessWord]);
      setGameState("ready");
    } catch (error) {
      console.error("Failed to generate card:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get a new card. Please try again.",
      });
      setGameState("idle");
    }
  };
  
  const startTimer = () => {
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  const resetGame = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState("idle");
      setDifficulty(null);
      setUsedWords([]);
  }

  const handlePlayAgain = () => {
    if (difficulty) {
        handleGetNewCard(difficulty);
    } else {
        setGameState("selecting_difficulty");
    }
  }


  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      <CardHeader className="text-center relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-4">
                <Icon className="w-16 h-16 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty || game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[20rem] p-6"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Get your team to guess the word!</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Tussle
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. The clue-giver receives a target word and several forbidden "taboo" words.</p>
                    <p>2. Describe the target WITHOUT using any of the taboo words.</p>
                    <p>3. Teams score as many points as possible before time runs out!</p>
                </div>
                <div className="self-center mt-8">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Choose Mission Level</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {["beginner", "intermediate", "advanced"].map(level => (
                            <Button key={level} onClick={() => handleGetNewCard(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>{level}</Button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Encrypting sensitive vocabulary...</p>
            </div>
        )}
        {(gameState === "ready" || gameState === "playing" || gameState === "finished") && card && (
          <div className="flex flex-col items-center gap-10 w-full max-w-5xl">
            
            <Card className={cn("w-full bg-card shadow-2xl border-4 rounded-[3rem] overflow-hidden transition-all", isFullscreen ? "max-w-4xl" : "max-w-sm")}>
                <CardHeader className="bg-primary text-primary-foreground p-8">
                    <CardTitle className={cn("text-center font-black uppercase tracking-tighter", isFullscreen ? "text-7xl" : "text-4xl")}>{card.guessWord}</CardTitle>
                </CardHeader>
                <CardContent className={cn("p-8 bg-muted/20", isFullscreen && "p-12")}>
                    <p className={cn("font-black uppercase tracking-widest text-muted-foreground text-center mb-6", isFullscreen ? "text-3xl" : "text-sm")}>Forbidden Intel:</p>
                    <div className={cn("grid gap-4 text-center", isFullscreen ? "grid-cols-2 gap-8" : "grid-cols-2")}>
                        {card.tabooWords.map(word => (
                            <div key={word} className={cn("bg-card p-4 rounded-2xl font-black uppercase border-2 shadow-inner", isFullscreen ? "text-3xl py-8" : "text-base")}>
                                {word}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className={cn("w-full space-y-4", isFullscreen ? "max-w-4xl" : "max-w-sm")}>
                <div className="flex justify-between items-center mb-2">
                    <Timer className={cn("text-primary", isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                    <p className={cn("font-mono font-black", isFullscreen ? "text-5xl" : "text-2xl")}>{timeLeft}s</p>
                </div>
                <Progress value={(timeLeft / TIMER_SECONDS) * 100} className={cn("h-4", isFullscreen && "h-6")} />
            </div>

            {gameState === 'ready' && <Button onClick={startTimer} size="lg" className={cn("bg-primary text-white font-black uppercase shadow-xl", isFullscreen && "h-20 px-16 text-2xl rounded-3xl")}>Initialize Timer</Button>}
            
            {gameState === 'playing' && (
                <div className="flex gap-6">
                    <Button onClick={() => handlePlayAgain()} size="lg" variant="outline" className={cn("font-black uppercase border-4", isFullscreen && "h-20 px-12 text-2xl rounded-2xl")}>
                        <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")}/> Skip
                    </Button>
                    <Button onClick={() => handlePlayAgain()} size="lg" variant="secondary" className={cn("bg-green-600 hover:bg-green-700 text-white font-black uppercase shadow-xl", isFullscreen && "h-24 px-16 text-3xl rounded-3xl")}>
                        <Check className={cn("mr-3", isFullscreen ? "h-12 w-12" : "h-8 w-8")}/> Mission Solved
                    </Button>
                </div>
            )}
            
            {gameState === 'finished' && (
                <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                    <p className={cn("font-black uppercase tracking-tighter text-amber-500", isFullscreen ? "text-7xl" : "text-3xl")}>{timeLeft === 0 ? "MISSION TIMEOUT!" : "TARGET IDENTIFIED!"}</p>
                    <Button onClick={handlePlayAgain} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                        <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                        New Objective
                    </Button>
                </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
            <Button variant="secondary" onClick={resetGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Abort Session</Button>
        )}
      </CardFooter>
    </Card>
  );
}