
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
import { Loader2, Sparkles, CheckCircle, XCircle, Repeat, Maximize, Minimize, PieChart, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";

type GameState = "idle" | "selecting_difficulty" | "playing" | "answered" | "finished" | "instructions";

interface Problem {
  numerator: number;
  denominator: number;
  options: string[];
}

export function FractionFusion({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [problem, setProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [usedInSession, setUsedInSession] = React.useState<string[]>([]);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateProblem = (level: SkillLevel, history: string[]): Problem => {
    let den: number;
    let num: number;
    let fractionStr: string;
    let attempts = 0;

    const getRandomFraction = () => {
        let d: number;
        switch (level) {
          case 'beginner':
            d = [2, 3, 4, 5, 6, 8, 10][Math.floor(Math.random() * 7)];
            break;
          case 'intermediate':
            d = [7, 9, 11, 12, 15, 16, 20, 24, 25][Math.floor(Math.random() * 9)];
            break;
          case 'advanced':
            d = [13, 14, 17, 18, 19, 21, 22, 23, 26, 27, 28, 29, 30, 32, 40, 50, 60, 75, 80, 100][Math.floor(Math.random() * 20)];
            break;
          default:
            d = 4;
        }
        const n = Math.floor(Math.random() * (d - 1)) + 1;
        return { n, d };
    };

    do {
        const { n, d } = getRandomFraction();
        num = n;
        den = d;
        fractionStr = `${num}/${den}`;
        attempts++;
    } while (history.includes(fractionStr) && attempts < 50);

    const correct = `${num}/${den}`;
    const options = [correct];
    while (options.length < 4) {
      const { n: wNum, d: wDen } = getRandomFraction();
      const opt = `${wNum}/${wDen}`;
      if (!options.includes(opt)) options.push(opt);
    }

    return {
      numerator: num,
      denominator: den,
      options: options.sort(() => Math.random() - 0.5),
    };
  };

  const handleStartGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    setUsedInSession([]);
    nextRound(level, []);
  };

  const nextRound = (level: SkillLevel, history: string[]) => {
    const newProblem = generateProblem(level, history);
    setProblem(newProblem);
    setUsedInSession(prev => [...prev, `${newProblem.numerator}/${newProblem.denominator}`]);
    setIsCorrect(null);
    setGameState("playing");
  };

  const handleAnswer = (choice: string) => {
    if (gameState !== "playing" || !problem) return;
    const correct = choice === `${problem.numerator}/${problem.denominator}`;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 10);
    setGameState("answered");

    setTimeout(() => {
      if (round < 10) {
        setRound(r => r + 1);
        nextRound(difficulty, usedInSession);
      } else {
        setGameState("finished");
      }
    }, 1500);
  };

  const renderPie = (num: number, den: number) => {
    const radius = 100;
    const center = 110;
    const slices = [];
    
    for (let i = 0; i < den; i++) {
      const startAngle = (i * 360) / den;
      const endAngle = ((i + 1) * 360) / den;
      const x1 = center + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = center + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = center + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = center + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
      
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      slices.push(
        <path
          key={i}
          d={d}
          fill={i < num ? "hsl(var(--primary))" : "hsl(var(--muted))"}
          stroke="white"
          strokeWidth="2"
          className="transition-colors duration-500"
        />
      );
    }
    
    return (
      <svg viewBox="0 0 220 220" className={cn("drop-shadow-2xl", isFullscreen ? "w-96 h-96" : "w-48 h-48 md:w-64 md:h-64")}>
        {slices}
      </svg>
    );
  };

  if (!game) return null;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" : "max-w-3xl mx-auto bg-card shadow-xl"
      )}>
      <CardHeader className="text-center relative">
        <Button variant="ghost" size="sm" className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]" onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && <PieChart className="w-12 h-12 text-primary mx-auto mb-2" />}
        <CardTitle className={cn("font-black uppercase tracking-tight", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty') && (
            <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="uppercase">{difficulty}</Badge>
                <Badge variant="outline">Round {round}/10</Badge>
            </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex flex-col items-center justify-center p-6", isFullscreen ? "min-h-[60vh]" : "min-h-[350px]")}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Master the art of fractions!</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Initialize
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>MISSION BRIEFING</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Observe the visual fraction model (pie chart).</p>
                    <p>2. The highlighted section represents the <strong>Numerator</strong>.</p>
                    <p>3. The total segments represent the <strong>Denominator</strong>.</p>
                    <p>4. Select the matching numeric fraction to score points.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Select Difficulty</Button>
            </div>
        )}

        {gameState === "selecting_difficulty" && (
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <p className={cn("text-center text-muted-foreground uppercase font-black tracking-widest", isFullscreen ? "text-2xl" : "text-sm")}>Choose Challenge Level:</p>
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} className={cn("h-16 text-xl font-bold uppercase tracking-widest shadow-lg transition-transform hover:scale-105", isFullscreen && "h-24 text-3xl rounded-2xl")}>
                {level}
              </Button>
            ))}
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && problem && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-12">
            <div className="animate-in zoom-in duration-500">
                {renderPie(problem.numerator, problem.denominator)}
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                {problem.options.map(opt => (
                    <Button
                        key={opt}
                        variant={gameState === 'answered' ? (opt === `${problem.numerator}/${problem.denominator}` ? 'secondary' : 'destructive') : 'outline'}
                        onClick={() => handleAnswer(opt)}
                        className={cn(
                            "h-24 text-4xl font-black rounded-3xl transition-all border-4 shadow-lg",
                            gameState === 'answered' && opt === `${problem.numerator}/${problem.denominator}` && "bg-green-500 text-white border-green-400 scale-105",
                            isFullscreen && "h-32 text-6xl"
                        )}
                        disabled={gameState === 'answered'}
                    >
                        {opt}
                    </Button>
                ))}
            </div>
          </div>
        )}

        {gameState === "finished" && (
            <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className="w-32 h-32 text-yellow-400 animate-bounce" />
                <h2 className="text-6xl font-black uppercase">Analysis Complete</h2>
                <div className="p-8 bg-muted/20 rounded-3xl border-4 border-primary">
                    <p className="text-sm font-bold text-muted-foreground uppercase mb-2">Final Score</p>
                    <p className="text-7xl font-black text-primary">{score}</p>
                </div>
                <Button onClick={() => setGameState('idle')} size="lg" className={cn("h-20 px-12 text-2xl font-black rounded-3xl uppercase shadow-xl")}><Repeat className="mr-3"/> Restart System</Button>
            </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" asChild><Link href="/games">Abort Mission</Link></Button>
        {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty') && <p className="font-black text-primary uppercase tracking-widest">Score: {score}</p>}
      </CardFooter>
    </Card>
  );
}
