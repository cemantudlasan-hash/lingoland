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
import { Loader2, Sparkles, Timer, Play, Repeat, Check, Maximize, Minimize, HelpCircle } from "lucide-react";
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
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}>
      <CardHeader className="text-center relative p-4 sm:p-6 shrink-0">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 sm:gap-2 z-[100]">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 px-2 gap-1 text-muted-foreground hover:text-foreground text-xs"
            onClick={() => setGameState(gameState === 'instructions' ? 'idle' : 'instructions')}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">How to Play</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 p-1.5 sm:p-2 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
        </div>

        <div className="flex justify-center mb-2 sm:mb-3">
            <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
        </div>
        <CardTitle className="font-black tracking-tight uppercase text-xl sm:text-3xl md:text-4xl">{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base max-w-xl mx-auto">{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">{difficulty || game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 text-center my-auto">
            <p className="text-muted-foreground text-sm sm:text-lg">Get your team to guess the word without using forbidden clues!</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setGameState('instructions')} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-12 sm:h-14 px-8 text-base sm:text-lg rounded-2xl">
                <Sparkles className="mr-2 h-5 w-5" />
                How to Play & Start
              </Button>
              <Button onClick={() => setGameState('selecting_difficulty')} variant="outline" size="lg" className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-2xl font-bold">
                Direct Select
              </Button>
            </div>
          </div>
        )}

        {(gameState === "instructions" || gameState === "selecting_difficulty") && (
          <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
            <h3 className="font-bold text-center text-lg sm:text-2xl">Mission Briefing / How to Play</h3>
            <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-base text-muted-foreground">
                <p>1. The clue-giver receives a target word and several forbidden "taboo" words.</p>
                <p>2. Describe the target WITHOUT saying any of the taboo words.</p>
                <p>3. Teams score as many points as possible before time runs out!</p>
            </div>
            <div className="self-center mt-4 w-full">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-center mb-3 text-xs sm:text-sm">Choose Mission Level</p>
                <div className="grid grid-cols-3 gap-2 w-full">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button key={level} onClick={() => handleGetNewCard(level as SkillLevel)} variant="outline" className="font-black uppercase h-11 sm:h-12 text-xs sm:text-sm rounded-xl border-2 hover:border-primary">
                          {level}
                        </Button>
                    ))}
                </div>
            </div>
          </div>
        )}

        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 my-auto">
                <Loader2 className="animate-spin text-primary h-12 w-12 sm:h-16 sm:h-16" />
                <p className="text-muted-foreground animate-pulse text-sm sm:text-lg">Encrypting sensitive vocabulary...</p>
            </div>
        )}

        {(gameState === "ready" || gameState === "playing" || gameState === "finished") && card && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-xl mx-auto my-auto">
            <Card className="w-full bg-card shadow-xl border-2 sm:border-4 border-primary/20 rounded-2xl sm:rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground p-4 sm:p-6">
                    <CardTitle className="text-center font-black uppercase tracking-tight text-2xl sm:text-4xl md:text-5xl">{card.guessWord}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 bg-muted/20">
                    <p className="font-black uppercase tracking-widest text-muted-foreground text-center mb-3 sm:mb-4 text-xs sm:text-sm">Forbidden Taboo Words:</p>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
                        {card.tabooWords.map(word => (
                            <div key={word} className="bg-card p-2.5 sm:p-3.5 rounded-xl font-black uppercase border border-border/40 shadow-sm text-xs sm:text-base text-foreground">
                                {word}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="w-full space-y-2 max-w-md px-2">
                <div className="flex justify-between items-center">
                    <Timer className="text-primary h-5 w-5" />
                    <p className="font-mono font-black text-xl sm:text-3xl">{timeLeft}s</p>
                </div>
                <Progress value={(timeLeft / TIMER_SECONDS) * 100} className="h-3 rounded-full" />
            </div>

            {gameState === 'ready' && (
              <Button onClick={startTimer} size="lg" className="bg-primary text-white font-black uppercase shadow-xl h-12 sm:h-14 px-8 text-base sm:text-lg rounded-xl">
                Initialize Timer
              </Button>
            )}
            
            {gameState === 'playing' && (
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button onClick={() => handlePlayAgain()} variant="outline" className="font-black uppercase h-12 text-sm sm:text-base rounded-xl flex-1 border-2">
                        <Repeat className="mr-2 h-4 w-4"/> Pass / Skip
                    </Button>
                    <Button onClick={() => handlePlayAgain()} className="bg-green-600 hover:bg-green-700 text-white font-black uppercase shadow-lg h-12 text-sm sm:text-base rounded-xl flex-1">
                        <Check className="mr-2 h-4 w-4"/> Solved (+1)
                    </Button>
                </div>
            )}
            
            {gameState === 'finished' && (
                <div className="text-center flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                    <p className="font-black uppercase tracking-tight text-amber-500 text-xl sm:text-3xl">{timeLeft === 0 ? "MISSION TIMEOUT!" : "TARGET IDENTIFIED!"}</p>
                    <Button onClick={handlePlayAgain} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-12 sm:h-14 px-8 text-base rounded-xl">
                        <Repeat className="mr-2 h-4 w-4" />
                        Next Card
                    </Button>
                </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
            <Button variant="secondary" onClick={resetGame} className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
              Abort Session
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}