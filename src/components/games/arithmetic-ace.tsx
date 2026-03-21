
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
import { Loader2, Sparkles, Timer, CheckCircle, XCircle, Repeat, Maximize, Minimize, Calculator, Trophy, Plus, Minus, X, Divide, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

type Operation = "Addition" | "Subtraction" | "Multiplication" | "Division" | "Mixed";
type GameState = "idle" | "selecting_category" | "selecting_difficulty" | "playing" | "answered" | "finished" | "instructions";

interface Problem {
  question: string;
  answer: number;
  options: number[];
}

const TIMER_LIMIT = 10;

const CATEGORIES: { label: Operation; icon: any; color: string }[] = [
    { label: "Addition", icon: Plus, color: "bg-blue-500" },
    { label: "Subtraction", icon: Minus, color: "bg-red-500" },
    { label: "Multiplication", icon: X, color: "bg-amber-500" },
    { label: "Division", icon: Divide, color: "bg-emerald-500" },
    { label: "Mixed", icon: Shuffle, color: "bg-purple-500" },
];

export function ArithmeticAce({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [operation, setOperation] = React.useState<Operation>("Mixed");
  const [problem, setProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_LIMIT);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [round, setRound] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateProblem = (level: SkillLevel, opType: Operation): Problem => {
    let a, b, op, ans;
    
    // Determine the actual operator based on category
    let actualOp = opType;
    if (opType === "Mixed") {
        const ops: Operation[] = level === 'beginner' ? ['Addition', 'Subtraction'] : level === 'intermediate' ? ['Addition', 'Subtraction', 'Multiplication'] : ['Addition', 'Subtraction', 'Multiplication', 'Division'];
        actualOp = ops[Math.floor(Math.random() * ops.length)];
    }

    switch (actualOp) {
      case 'Addition':
        a = Math.floor(Math.random() * (level === 'beginner' ? 20 : level === 'intermediate' ? 100 : 500));
        b = Math.floor(Math.random() * (level === 'beginner' ? 20 : level === 'intermediate' ? 100 : 500));
        ans = a + b;
        op = '+';
        break;
      case 'Subtraction':
        a = Math.floor(Math.random() * (level === 'beginner' ? 20 : 100)) + 10;
        b = Math.floor(Math.random() * a);
        ans = a - b;
        op = '-';
        break;
      case 'Multiplication':
        a = Math.floor(Math.random() * (level === 'intermediate' ? 12 : 20)) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        ans = a * b;
        op = '×';
        break;
      case 'Division':
        ans = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        a = ans * b;
        op = '÷';
        break;
      default:
        a = 1; b = 1; ans = 2; op = '+';
    }

    const options = [ans];
    while (options.length < 4) {
      const wrong = ans + (Math.floor(Math.random() * 10) - 5);
      if (!options.includes(wrong) && wrong >= 0) options.push(wrong);
    }

    return {
      question: `${a} ${op} ${b}`,
      answer: ans,
      options: options.sort(() => Math.random() - 0.5),
    };
  };

  const handleSelectCategory = (op: Operation) => {
      setOperation(op);
      setGameState('selecting_difficulty');
  }

  const handleStartGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    nextRound(level, operation);
  };

  const nextRound = (level: SkillLevel, op: Operation) => {
    const newProblem = generateProblem(level, op);
    setProblem(newProblem);
    setIsCorrect(null);
    setTimeLeft(TIMER_LIMIT);
    setGameState("playing");
  };

  const handleAnswer = (val: number) => {
    if (gameState !== "playing") return;
    const correct = val === problem?.answer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 10);
    setGameState("answered");
    
    setTimeout(() => {
        if (round < 10) {
            setRound(r => r + 1);
            nextRound(difficulty, operation);
        } else {
            setGameState("finished");
            if (firestore && game) {
                logAnalyticsEvent(firestore, user?.uid || 'guest', {
                    type: 'game_played',
                    details: { slug: game.slug, title: game.title, score: score + (correct ? 10 : 0) }
                });
            }
        }
    }, 1500);
  };

  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      handleAnswer(-999); // Timeout
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft]);

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
        {!isFullscreen && <Calculator className="w-12 h-12 text-primary mx-auto mb-2" />}
        <CardTitle className={cn("font-black uppercase tracking-tight", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_category' && gameState !== 'selecting_difficulty') && (
            <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="uppercase">{operation}</Badge>
                <Badge variant="outline" className="uppercase">{difficulty}</Badge>
                <Badge variant="outline">Round {round}/10</Badge>
            </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex flex-col items-center justify-center p-6", isFullscreen ? "min-h-[60vh]" : "min-h-[350px]")}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to crunch some numbers?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Mission
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Select a math category to focus your practice.</p>
                    <p>2. Mental math problems will appear on the screen.</p>
                    <p>3. Choose the correct answer from the options provided.</p>
                    <p>4. Work quickly! You have a limited time for each calculation.</p>
                </div>
                <Button onClick={() => setGameState('selecting_category')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Proceed</Button>
            </div>
        )}

        {gameState === "selecting_category" && (
            <div className={cn("flex flex-col gap-6 w-full items-center", isFullscreen ? "max-w-5xl" : "max-w-2xl")}>
                <p className={cn("text-center text-muted-foreground uppercase font-black tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Select Operation:</p>
                <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 w-full", isFullscreen && "grid-cols-2 gap-8")}>
                    {CATEGORIES.map((cat, idx) => (
                        <Button 
                            key={cat.label} 
                            onClick={() => handleSelectCategory(cat.label)} 
                            className={cn(
                                "h-20 text-xl font-black uppercase tracking-widest border-4 shadow-lg transition-transform hover:scale-105",
                                cat.color,
                                isFullscreen && "h-32 text-4xl rounded-3xl",
                                idx === 4 && "sm:col-span-2"
                            )}
                        >
                            <cat.icon className={cn("mr-3 shrink-0", isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                            <span className="truncate">{cat.label}</span>
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {gameState === "selecting_difficulty" && (
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <p className={cn("text-center text-muted-foreground uppercase font-black tracking-widest", isFullscreen ? "text-2xl" : "text-sm")}>Choose Challenge Level:</p>
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} className={cn("h-16 text-xl font-bold uppercase tracking-widest", isFullscreen && "h-24 text-3xl rounded-2xl")}>
                {level}
              </Button>
            ))}
            <Button variant="ghost" onClick={() => setGameState('selecting_category')} className="uppercase font-bold opacity-50">Back to Operations</Button>
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && problem && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-12">
            <div className="w-full space-y-2">
                <div className="flex justify-between font-black uppercase text-xs tracking-widest text-muted-foreground">
                    <span>Time Sync</span>
                    <span>{timeLeft}s</span>
                </div>
                <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-3" />
            </div>

            <div className={cn(
                "font-black text-center tabular-nums transition-all",
                isFullscreen ? "text-[15vw] leading-none" : "text-7xl md:text-8xl"
            )}>
                {problem.question}
            </div>

            <div className="grid grid-cols-2 gap-6 w-full">
                {problem.options.map(opt => (
                    <Button
                        key={opt}
                        variant={gameState === 'answered' ? (opt === problem.answer ? 'secondary' : 'destructive') : 'outline'}
                        onClick={() => handleAnswer(opt)}
                        className={cn(
                            "h-24 text-4xl font-black rounded-3xl transition-all border-4 shadow-lg",
                            gameState === 'answered' && opt === problem.answer && "bg-green-500 text-white border-green-400 scale-105",
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
                <h2 className="text-6xl font-black uppercase">Mission Complete</h2>
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
        {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_category' && gameState !== 'selecting_difficulty') && <p className="font-black text-primary">SCORE: {score}</p>}
      </CardFooter>
    </Card>
  );
}
