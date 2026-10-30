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
import {
  Loader2,
  Sparkles,
  Check,
  X,
  Repeat,
  Maximize,
  Minimize,
  Atom,
  FlaskConical,
  Trophy,
  BookOpen,
  ArrowLeft,
  XOctagon,
} from "lucide-react";
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
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleAbortGame = () => {
    setGameState("idle");
    setCurrentElement(null);
    setScore(0);
    setRound(0);
    setIsCorrect(null);
    toast({
      title: "Reconnaissance Aborted",
      description: "Returned to the elemental research deck.",
    });
  };

  const startNewGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    setUsedInSession([]);
    nextRound(level, []);
  };

  const nextRound = (level: SkillLevel, history: string[]) => {
    const levelVal = level === "beginner" ? 1 : level === "intermediate" ? 2 : 3;
    
    // Filter to avoid repeating elements within the same game
    const pool = ELEMENTS.filter((e) => e.level <= levelVal && !history.includes(e.name));
    const effectivePool = pool.length > 0 ? pool : ELEMENTS.filter((e) => e.level <= levelVal);
    const target = effectivePool[Math.floor(Math.random() * effectivePool.length)];
    
    // Minimize repeating choices by selecting unique distractors from the whole table
    const distractorPool = ELEMENTS.filter((e) => e.name !== target.name);
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
    if (gameState !== "playing" || !currentElement) return;
    const correct = choice === currentElement.name;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
    setGameState("answered");

    setTimeout(() => {
      if (round < 10) {
        setRound((r) => r + 1);
        nextRound(difficulty, [...usedInSession]);
      } else {
        setGameState("finished");
      }
    }, 2000);
  };

  const Icon = game?.icon || Atom;

  return (
    <Card
      className={cn(
        "w-full transition-all duration-500 flex flex-col justify-between overflow-hidden max-w-full",
        isFullscreen
          ? "min-h-screen rounded-none border-none max-w-none bg-[#0f172a] text-white p-0"
          : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl bg-card shadow-2xl border border-white/10"
      )}
    >
      {/* Universal Game Nav Header */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-border/20 bg-muted/20 shrink-0">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4" /> Games
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {(gameState === "playing" || gameState === "answered") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAbortGame}
              className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-8 font-bold"
            >
              <XOctagon className="h-3.5 w-3.5" /> Abort Game
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
        </div>
      </div>

      <CardHeader className="text-center relative border-b border-white/10 bg-black/20 p-3 sm:p-6 shrink-0">
        {!isFullscreen && (
          <div className="flex justify-center mb-1 sm:mb-2">
            <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-sky-400" />
          </div>
        )}
        <CardTitle
          className={cn(
            "font-black uppercase italic tracking-widest text-lg sm:text-2xl md:text-3xl",
            isFullscreen && "text-xl sm:text-4xl md:text-5xl"
          )}
        >
          {game?.title}
        </CardTitle>
        <CardDescription
          className={cn(
            "text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto",
            isFullscreen && "text-sm sm:text-base text-slate-300"
          )}
        >
          {game?.description || "Identify chemical elements by their symbols, numbers, and atomic configurations."}
        </CardDescription>
        {gameState !== "idle" && gameState !== "instructions" && gameState !== "selecting_difficulty" && (
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="outline" className="border-sky-500 text-sky-400 text-xs uppercase">
              {difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Round {round}/10
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent
        className={cn(
          "flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-y-auto overflow-x-hidden custom-scrollbar",
          isFullscreen
            ? "min-h-0 flex-1 gap-4 sm:gap-8 max-w-5xl mx-auto"
            : "w-full flex-1 min-h-[calc(100dvh-16rem)] gap-4 sm:gap-6"
        )}
      >
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6 text-center w-full max-w-4xl mx-auto py-2">
            {/* Atomic Telemetry Pods */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full">
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-sky-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Atom className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Elemental Bank
                </span>
                <span className="text-xs sm:text-sm font-black text-foreground">24 Signatures</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-indigo-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Mission Target
                </span>
                <span className="text-xs sm:text-sm font-black text-indigo-300">10 Identifications</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-purple-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Recon Tiers
                </span>
                <span className="text-xs sm:text-sm font-black text-purple-300">3 Difficulties</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-emerald-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Lab Protocol
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-300">Atomic Radar</span>
              </div>
            </div>

            <p className={cn("text-muted-foreground text-xs sm:text-base max-w-md", isFullscreen && "sm:text-xl text-slate-300")}>
              Ready to identify elements by their atomic signatures and electron structures?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
              <Button
                onClick={() => setGameState("selecting_difficulty")}
                size={isFullscreen ? "lg" : "default"}
                className={cn(
                  "bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-black shadow-xl h-11 sm:h-12 w-full sm:w-auto px-6 sm:px-8 rounded-xl",
                  isFullscreen && "sm:h-14 sm:px-10 sm:text-lg sm:rounded-2xl"
                )}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Mission
              </Button>
              <Button
                onClick={() => setGameState("instructions")}
                size={isFullscreen ? "lg" : "default"}
                variant="secondary"
                className={cn(
                  "font-bold shadow-md h-11 sm:h-12 w-full sm:w-auto px-6 sm:px-8 rounded-xl",
                  isFullscreen && "sm:h-14 sm:px-10 sm:text-lg sm:rounded-2xl"
                )}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                How to Play
              </Button>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full",
              isFullscreen ? "p-4 sm:p-12 max-w-3xl" : "p-4 sm:p-8 max-w-lg"
            )}
          >
            <h3
              className={cn(
                "font-black uppercase tracking-widest text-center mb-2 sm:mb-4 text-base sm:text-xl",
                isFullscreen ? "text-xl sm:text-3xl" : ""
              )}
            >
              How to Play
            </h3>
            <div className={cn("text-left space-y-3 sm:space-y-4 text-xs sm:text-base", isFullscreen && "sm:text-lg")}>
              <p>1. An atomic symbol and its number will be detected by our sensors.</p>
              <p>2. Identify the correct element name associated with that symbol.</p>
              <p>3. Match 10 unique elements to complete your chemical reconnaissance.</p>
            </div>
            <Button
              onClick={() => setGameState("selecting_difficulty")}
              size="lg"
              className={cn(
                "mt-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base rounded-xl shadow-xl",
                isFullscreen && "sm:h-14 sm:px-12 sm:text-xl"
              )}
            >
              Initialize
            </Button>
          </div>
        )}

        {gameState === "selecting_difficulty" && (
          <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-sm mx-auto my-auto">
            <p className="text-center text-muted-foreground uppercase tracking-widest font-black text-xs sm:text-sm">
              Select Mission Parameters:
            </p>
            {["beginner", "intermediate", "advanced"].map((level) => (
              <Button
                key={level}
                onClick={() => startNewGame(level as SkillLevel)}
                className={cn(
                  "h-12 sm:h-16 text-base sm:text-xl font-black uppercase tracking-widest bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-900/20 border-b-4 border-sky-800 rounded-xl",
                  isFullscreen && "sm:h-20 sm:text-2xl"
                )}
              >
                {level}
              </Button>
            ))}
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && currentElement && (
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4 sm:gap-8 animate-in fade-in duration-500 py-2">
            <div className="flex flex-col items-center gap-1.5 sm:gap-3">
              <div
                className={cn(
                  "flex flex-col items-center justify-center border-4 sm:border-6 border-sky-500 bg-black/40 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(14,165,233,0.3)] transition-all",
                  isFullscreen ? "w-28 h-28 sm:w-56 sm:h-56" : "w-24 h-24 sm:w-44 sm:h-44"
                )}
              >
                <span
                  className={cn(
                    "font-black text-sky-400 leading-none",
                    isFullscreen ? "text-4xl sm:text-7xl" : "text-4xl sm:text-6xl"
                  )}
                >
                  {currentElement.symbol}
                </span>
                <span
                  className={cn(
                    "font-bold text-sky-200/60 mt-1 uppercase tracking-[0.2em]",
                    isFullscreen ? "text-xs sm:text-base" : "text-[10px] sm:text-xs"
                  )}
                >
                  #{currentElement.atomicNumber}
                </span>
              </div>
              <div
                className={cn(
                  "text-center uppercase font-black tracking-[0.25em] text-muted-foreground",
                  isFullscreen ? "text-[10px] sm:text-sm mt-1" : "text-[9px] sm:text-xs mt-1"
                )}
              >
                Atomic Signature: {currentElement.category}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full">
              {options.map((name) => (
                <Button
                  key={name}
                  variant={
                    gameState === "answered"
                      ? name === currentElement.name
                        ? "secondary"
                        : "destructive"
                      : "outline"
                  }
                  onClick={() => handleAnswer(name)}
                  className={cn(
                    "h-12 sm:h-16 text-sm sm:text-xl font-black rounded-xl transition-all border-2 shadow-md uppercase tracking-wider",
                    gameState === "answered" &&
                      name === currentElement.name &&
                      "bg-green-600 text-white border-green-400 scale-[1.02]",
                    isFullscreen && "sm:h-20 sm:text-2xl"
                  )}
                  disabled={gameState === "answered"}
                >
                  {name}
                </Button>
              ))}
            </div>

            {gameState === "answered" && (
              <div
                className={cn(
                  "text-center p-2.5 sm:p-4 rounded-xl border-2 font-black uppercase transition-all animate-in zoom-in w-full max-w-md",
                  isCorrect
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-red-500/20 border-red-500/50 text-red-400",
                  isFullscreen ? "text-sm sm:text-xl" : "text-xs sm:text-base"
                )}
              >
                {isCorrect ? "Element Correctly Identified!" : `Signal Misinterpreted: ${currentElement.name}`}
              </div>
            )}
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-500 my-auto">
            <Trophy className="w-16 h-16 sm:w-28 sm:h-28 text-sky-400 animate-pulse drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
            <h2 className={cn("font-black uppercase tracking-tight text-2xl sm:text-4xl", isFullscreen && "sm:text-6xl")}>
              LAB COMPLETE
            </h2>
            <div className="p-4 sm:p-8 bg-sky-900/20 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-sky-500 shadow-xl max-w-sm w-full">
              <p className="text-xs sm:text-sm font-bold text-sky-300 uppercase tracking-widest mb-1 sm:mb-2">
                Accuracy Rating
              </p>
              <p className="text-4xl sm:text-6xl font-black text-white">
                {score}
                <span className="text-xl sm:text-3xl text-sky-500">/10</span>
              </p>
            </div>
            <Button
              onClick={() => setGameState("idle")}
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-xl font-black rounded-xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 uppercase tracking-wider w-full sm:w-auto"
            >
              <Repeat className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Re-Enter Lab
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter
        className={cn(
          "flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-3 p-3 sm:p-6 border-t border-white/10 bg-black/20 shrink-0",
          isFullscreen && "max-w-6xl mx-auto w-full pb-4 sm:pb-6"
        )}
      >
        <Button
          variant="outline"
          asChild
          size={isFullscreen ? "lg" : "default"}
          className={cn("w-full sm:w-auto h-10 sm:h-11 font-bold", isFullscreen && "sm:h-12 sm:px-6 sm:text-base rounded-xl")}
        >
          <Link href="/games" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {(gameState === "playing" || gameState === "answered") && (
            <Button
              variant="outline"
              onClick={handleAbortGame}
              size={isFullscreen ? "lg" : "default"}
              className={cn(
                "flex-1 sm:flex-none h-10 sm:h-11 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 font-bold",
                isFullscreen && "sm:h-12 sm:px-6 sm:text-base"
              )}
            >
              <XOctagon className="h-4 w-4" /> Abort Game
            </Button>
          )}
          {gameState !== "idle" && gameState !== "instructions" && gameState !== "selecting_difficulty" && (
            <p className="font-black text-sky-400 tracking-widest text-xs sm:text-base ml-2">RESEARCH POINTS: {score}</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
