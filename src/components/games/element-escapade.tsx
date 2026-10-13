
"use client";

import { shuffleArray } from "@/lib/shuffle";

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
import { Loader2, Sparkles, Check, X, Repeat, Maximize, Minimize, Atom, FlaskConical, Trophy, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";

type GameState = "idle" | "selecting_difficulty" | "playing" | "answered" | "finished" | "instructions";

interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  category: string;
  level: number;
}

const ELEMENTS: Element[] = [
  { symbol: "H", name: "Hydrogen", atomicNumber: 1, category: "Nonmetal", level: 1 },
  { symbol: "He", name: "Helium", atomicNumber: 2, category: "Noble Gas", level: 1 },
  { symbol: "Li", name: "Lithium", atomicNumber: 3, category: "Alkali Metal", level: 1 },
  { symbol: "O", name: "Oxygen", atomicNumber: 8, category: "Nonmetal", level: 1 },
  { symbol: "C", name: "Carbon", atomicNumber: 6, category: "Nonmetal", level: 1 },
  { symbol: "Au", name: "Gold", atomicNumber: 79, category: "Transition Metal", level: 1 },
  { symbol: "Ag", name: "Silver", atomicNumber: 47, category: "Transition Metal", level: 1 },
  { symbol: "Fe", name: "Iron", atomicNumber: 26, category: "Transition Metal", level: 1 },
  { symbol: "Cu", name: "Copper", atomicNumber: 29, category: "Transition Metal", level: 1 },
  { symbol: "Na", name: "Sodium", atomicNumber: 11, category: "Alkali Metal", level: 1 },
  { symbol: "Cl", name: "Chlorine", atomicNumber: 17, category: "Halogen", level: 2 },
  { symbol: "Mg", name: "Magnesium", atomicNumber: 12, category: "Alkaline Earth Metal", level: 2 },
  { symbol: "Si", name: "Silicon", atomicNumber: 14, category: "Metalloid", level: 2 },
  { symbol: "P", name: "Phosphorus", atomicNumber: 15, category: "Nonmetal", level: 2 },
  { symbol: "S", name: "Sulfur", atomicNumber: 16, category: "Nonmetal", level: 2 },
  { symbol: "K", name: "Potassium", atomicNumber: 19, category: "Alkali Metal", level: 2 },
  { symbol: "Ca", name: "Calcium", atomicNumber: 20, category: "Alkaline Earth Metal", level: 2 },
  { symbol: "Zn", name: "Zinc", atomicNumber: 30, category: "Transition Metal", level: 2 },
  { symbol: "Xe", name: "Xenon", atomicNumber: 54, category: "Noble Gas", level: 3 },
  { symbol: "Rn", name: "Radon", atomicNumber: 86, category: "Noble Gas", level: 3 },
  { symbol: "Pt", name: "Platinum", atomicNumber: 78, category: "Transition Metal", level: 3 },
  { symbol: "Hg", name: "Mercury", atomicNumber: 80, category: "Transition Metal", level: 3 },
  { symbol: "Pb", name: "Lead", atomicNumber: 82, category: "Post-transition Metal", level: 3 },
  { symbol: "U", name: "Uranium", atomicNumber: 92, category: "Actinide", level: 3 },
];

export function ElementEscapade({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [currentElement, setCurrentElement] = React.useState<Element | null>(null);
  const [options, setOptions] = React.useState<string[]>([]);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [usedInSession, setUsedInSession] = React.useState<string[]>([]);

  const game = getGameBySlug(slug);
  const { toast } = useToast();

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const startNewGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    setUsedInSession([]);
    nextRound(level, []);
  };

  const nextRound = (level: SkillLevel, history: string[]) => {
    const levelVal = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;
    
    // Filter to avoid repeating elements within the same game
    const pool = ELEMENTS.filter(e => e.level <= levelVal && !history.includes(e.name));
    const effectivePool = pool.length > 0 ? pool : ELEMENTS.filter(e => e.level <= levelVal);
    const target = effectivePool[Math.floor(Math.random() * effectivePool.length)];
    
    // Minimize repeating choices by selecting unique distractors from the whole table
    const distractorPool = ELEMENTS.filter(e => e.name !== target.name);
    const shuffledDistractors = shuffleArray([...distractorPool]);
    
    const opts = [target.name];
    let i = 0;
    while (opts.length < 4 && i < shuffledDistractors.length) {
        opts.push(shuffledDistractors[i].name);
        i++;
    }

    setCurrentElement(target);
    setOptions(shuffleArray(opts));
    setIsCorrect(null);
    setUsedInSession([...history, target.name]);
    setGameState("playing");
  };

  const handleAnswer = (choice: string) => {
    if (gameState !== 'playing' || !currentElement) return;
    const correct = choice === currentElement.name;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setGameState("answered");

    setTimeout(() => {
      if (round < 10) {
        setRound(r => r + 1);
        nextRound(difficulty, [...usedInSession]);
      } else {
        setGameState("finished");
      }
    }, 2000);
  };

  const Icon = game?.icon || Atom;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col justify-between overflow-y-auto overflow-x-hidden max-w-full",
        isFullscreen ? "min-h-screen rounded-none border-none max-w-none bg-[#0f172a] justify-center text-white" : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl bg-card shadow-2xl"
      )}>
      <CardHeader className="text-center relative border-b border-white/10 bg-black/20 pr-14 sm:pr-16 p-4 sm:p-6">
        <Button variant="ghost" size="sm" className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/50 hover:text-white" onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-1 sm:mb-2">
                <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-sky-400" />
            </div>
        )}
        <CardTitle className={cn("font-black uppercase italic tracking-widest", isFullscreen ? "text-3xl sm:text-5xl md:text-6xl" : "text-xl sm:text-2xl md:text-3xl")}>{game?.title}</CardTitle>
        {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty') && <div className="flex justify-center gap-2 mt-2"><Badge variant="outline" className="border-sky-500 text-sky-400 text-xs">{difficulty.toUpperCase()}</Badge><Badge variant="secondary" className="text-xs">Round {round}/10</Badge></div>}
      </CardHeader>

      <CardContent className={cn("flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-y-auto overflow-x-hidden", isFullscreen ? "min-h-[70vh] gap-8 sm:gap-12" : "w-full flex-1 min-h-[calc(100dvh-16rem)] gap-4 sm:gap-6")}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-3xl" : "text-sm sm:text-base")}>Ready to identify elements by their atomic signatures?</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button onClick={() => setGameState('selecting_difficulty')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-16 sm:h-20 px-8 sm:px-16 text-xl sm:text-3xl rounded-2xl sm:rounded-3xl")}>
                <Sparkles className={cn("mr-2 sm:mr-3", isFullscreen ? "h-6 w-6 sm:h-10 sm:w-10" : "h-4 w-4 sm:h-5 sm:w-5")} />
                Start Mission
              </Button>
              <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} variant="secondary" className={cn("font-bold shadow-md", isFullscreen && "h-16 sm:h-20 px-8 sm:px-16 text-xl sm:text-3xl rounded-2xl sm:rounded-3xl")}>
                <BookOpen className={cn("mr-2 sm:mr-3", isFullscreen ? "h-6 w-6 sm:h-10 sm:w-10" : "h-4 w-4 sm:h-5 sm:w-5")} />
                How to Play
              </Button>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full",
                 isFullscreen ? "p-6 sm:p-16 max-w-5xl" : "p-4 sm:p-8 max-w-lg"
             )}>
                <h3 className={cn("font-black uppercase tracking-widest text-center mb-2 sm:mb-4", isFullscreen ? "text-2xl sm:text-4xl" : "text-lg sm:text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-3 sm:space-y-4", isFullscreen ? "text-base sm:text-2xl" : "text-xs sm:text-base")}>
                    <p>1. An atomic symbol and its number will be detected by our sensors.</p>
                    <p>2. Identify the correct element name associated with that symbol.</p>
                    <p>3. Match 10 unique elements to complete your chemical reconnaissance.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-4 sm:mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black w-full sm:w-auto", isFullscreen && "h-16 sm:h-20 px-8 sm:px-16 text-xl sm:text-3xl rounded-2xl sm:rounded-3xl shadow-xl")}>Initialize</Button>
            </div>
        )}

        {gameState === "selecting_difficulty" && (
          <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-sm">
            <p className="text-center text-muted-foreground uppercase tracking-widest font-black text-xs sm:text-sm">Select Mission Parameters:</p>
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <Button key={level} onClick={() => startNewGame(level as SkillLevel)} className={cn("h-14 sm:h-20 text-lg sm:text-2xl font-black uppercase tracking-widest bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-900/20 border-b-4 border-sky-800 rounded-xl sm:rounded-2xl", isFullscreen && "h-16 sm:h-24 sm:rounded-2xl")}>
                {level}
              </Button>
            ))}
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && currentElement && (
          <div className="w-full max-w-5xl flex flex-col items-center gap-6 sm:gap-12 animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-2 sm:gap-4">
                <div className={cn(
                    "flex flex-col items-center justify-center border-4 sm:border-8 border-sky-500 bg-black/40 rounded-3xl sm:rounded-[2.5rem] shadow-[0_0_50px_rgba(14,165,233,0.3)] transition-all",
                    isFullscreen ? "w-48 h-48 sm:w-80 sm:h-80" : "w-32 h-32 sm:w-48 sm:h-48"
                )}>
                    <span className={cn("font-black text-sky-400 leading-none", isFullscreen ? "text-6xl sm:text-[12vw]" : "text-5xl sm:text-8xl")}>{currentElement.symbol}</span>
                    <span className={cn("font-bold text-sky-200/50 mt-1 sm:mt-2 uppercase tracking-[0.2em] sm:tracking-[0.3em]", isFullscreen ? "text-base sm:text-2xl" : "text-xs sm:text-sm")}>{currentElement.atomicNumber}</span>
                </div>
                <div className={cn("text-center uppercase font-black tracking-[0.3em] sm:tracking-[0.5em] text-muted-foreground", isFullscreen ? "text-sm sm:text-2xl mt-2 sm:mt-4" : "text-[10px] sm:text-xs mt-1 sm:mt-2")}>Atomic Signal Detected</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full">
                {options.map(name => (
                    <Button
                        key={name}
                        variant={gameState === 'answered' ? (name === currentElement.name ? 'secondary' : 'destructive') : 'outline'}
                        onClick={() => handleAnswer(name)}
                        className={cn(
                            "h-14 sm:h-24 text-base sm:text-3xl font-black rounded-xl sm:rounded-[1.5rem] transition-all border-2 sm:border-4 shadow-lg uppercase tracking-wider",
                            gameState === 'answered' && name === currentElement.name && "bg-green-600 text-white border-green-400 scale-[1.02] sm:scale-105",
                            isFullscreen && "h-16 sm:h-32 text-xl sm:text-5xl rounded-2xl sm:rounded-[2rem]"
                        )}
                        disabled={gameState === 'answered'}
                    >
                        {name}
                    </Button>
                ))}
            </div>

            {gameState === 'answered' && (
                <div className={cn(
                    "text-center p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 font-black uppercase transition-all animate-in zoom-in",
                    isCorrect ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/20 border-red-500/50 text-red-400",
                    isFullscreen ? "text-xl sm:text-4xl px-6 sm:px-12" : "text-sm sm:text-lg"
                )}>
                    {isCorrect ? "Element Correctly Identified!" : `Signal Misinterpreted: ${currentElement.name}`}
                </div>
            )}
          </div>
        )}

        {gameState === "finished" && (
            <div className="text-center flex flex-col items-center gap-4 sm:gap-8 animate-in zoom-in duration-500">
                <Trophy className="w-20 h-20 sm:w-40 sm:h-40 text-sky-400 animate-pulse drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
                <h2 className={cn("font-black uppercase tracking-tighter", isFullscreen ? "text-4xl sm:text-8xl" : "text-3xl sm:text-5xl")}>LAB COMPLETE</h2>
                <div className="p-6 sm:p-12 bg-sky-900/20 rounded-3xl sm:rounded-[3rem] border-4 sm:border-8 border-sky-500 shadow-2xl">
                    <p className="text-xs sm:text-sm font-bold text-sky-300 uppercase tracking-[0.3em] sm:tracking-[0.5em] mb-2 sm:mb-4">Accuracy Rating</p>
                    <p className="text-6xl sm:text-9xl font-black text-white">{score}<span className="text-2xl sm:text-4xl text-sky-500">/10</span></p>
                </div>
                <Button onClick={() => setGameState('idle')} size="lg" className="h-14 sm:h-24 px-8 sm:px-16 text-lg sm:text-3xl font-black rounded-2xl sm:rounded-[2rem] bg-sky-600 hover:bg-sky-500 border-b-4 sm:border-b-8 border-sky-800 uppercase tracking-widest"><Repeat className="mr-2 sm:mr-4 w-5 h-5 sm:w-10 sm:h-10"/> Re-Enter Lab</Button>
            </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 p-4 sm:p-8 border-t border-white/10 bg-black/20 text-center sm:text-left">
        <Button variant="ghost" asChild className="text-white/50 hover:text-white"><Link href="/games">Terminate Session</Link></Button>
        {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty') && <p className="font-black text-sky-400 tracking-widest text-xs sm:text-base">RESEARCH POINTS: {score}</p>}
      </CardFooter>
    </Card>
  );
}
