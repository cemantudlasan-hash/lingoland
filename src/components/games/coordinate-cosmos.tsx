"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Maximize, Minimize, Trophy, Sparkles, Repeat, Compass, CheckCircle2, XCircle, BookOpen, ArrowLeft, XOctagon, ShieldCheck, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { shuffleArray } from "@/lib/shuffle";

interface CoordinateQuestion {
  id: number;
  type: 'quadrant' | 'distance' | 'reflection' | 'midpoint' | 'axis';
  question: string;
  correctAnswer: string;
  options: string[];
  point1?: { x: number; y: number };
  point2?: { x: number; y: number };
}

const QUESTION_POOL: CoordinateQuestion[] = [
  // Quadrants
  { id: 1, type: 'quadrant', question: "Which quadrant is the point (3, 5) located in?", correctAnswer: "Quadrant I", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: 3, y: 5 } },
  { id: 2, type: 'quadrant', question: "Which quadrant is the point (-4, 2) located in?", correctAnswer: "Quadrant II", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: -4, y: 2 } },
  { id: 3, type: 'quadrant', question: "Which quadrant is the point (-6, -3) located in?", correctAnswer: "Quadrant III", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: -6, y: -3 } },
  { id: 4, type: 'quadrant', question: "Which quadrant is the point (5, -7) located in?", correctAnswer: "Quadrant IV", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: 5, y: -7 } },
  { id: 5, type: 'quadrant', question: "Which quadrant is the point (-2, 8) located in?", correctAnswer: "Quadrant II", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: -2, y: 8 } },
  { id: 6, type: 'quadrant', question: "Which quadrant is the point (-9, -9) located in?", correctAnswer: "Quadrant III", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: -9, y: -9 } },
  { id: 7, type: 'quadrant', question: "Which quadrant is the point (7, -3) located in?", correctAnswer: "Quadrant IV", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: 7, y: -3 } },
  { id: 8, type: 'quadrant', question: "Which quadrant is the point (10, 10) located in?", correctAnswer: "Quadrant I", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: 10, y: 10 } },
  { id: 9, type: 'quadrant', question: "Which quadrant is the point (-1, 5) located in?", correctAnswer: "Quadrant II", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: -1, y: 5 } },
  { id: 10, type: 'quadrant', question: "Which quadrant is the point (3, -4) located in?", correctAnswer: "Quadrant IV", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], point1: { x: 3, y: -4 } },
  // Distances
  { id: 11, type: 'distance', question: "What is the distance between (3, 4) and (3, -2)?", correctAnswer: "6 units", options: ["4 units", "5 units", "6 units", "8 units"], point1: { x: 3, y: 4 }, point2: { x: 3, y: -2 } },
  { id: 12, type: 'distance', question: "What is the distance between (-2, 5) and (4, 5)?", correctAnswer: "6 units", options: ["4 units", "6 units", "7 units", "8 units"], point1: { x: -2, y: 5 }, point2: { x: 4, y: 5 } },
  { id: 13, type: 'distance', question: "What is the distance between (-5, -3) and (-5, 5)?", correctAnswer: "8 units", options: ["6 units", "8 units", "10 units", "12 units"], point1: { x: -5, y: -3 }, point2: { x: -5, y: 5 } },
  { id: 14, type: 'distance', question: "What is the distance between (1, -6) and (1, 3)?", correctAnswer: "9 units", options: ["5 units", "7 units", "9 units", "11 units"], point1: { x: 1, y: -6 }, point2: { x: 1, y: 3 } },
  { id: 15, type: 'distance', question: "What is the distance between (-4, 2) and (2, 2)?", correctAnswer: "6 units", options: ["4 units", "5 units", "6 units", "8 units"], point1: { x: -4, y: 2 }, point2: { x: 2, y: 2 } },
  { id: 16, type: 'distance', question: "What is the distance between (7, -1) and (7, -8)?", correctAnswer: "7 units", options: ["5 units", "6 units", "7 units", "8 units"], point1: { x: 7, y: -1 }, point2: { x: 7, y: -8 } },
  { id: 17, type: 'distance', question: "What is the distance between (-3, -3) and (5, -3)?", correctAnswer: "8 units", options: ["6 units", "8 units", "9 units", "10 units"], point1: { x: -3, y: -3 }, point2: { x: 5, y: -3 } },
  { id: 18, type: 'distance', question: "What is the distance between (0, 4) and (0, -4)?", correctAnswer: "8 units", options: ["4 units", "6 units", "8 units", "10 units"], point1: { x: 0, y: 4 }, point2: { x: 0, y: -4 } },
  { id: 19, type: 'distance', question: "What is the distance between (-8, -2) and (-2, -2)?", correctAnswer: "6 units", options: ["4 units", "6 units", "8 units", "10 units"], point1: { x: -8, y: -2 }, point2: { x: -2, y: -2 } },
  { id: 20, type: 'distance', question: "What is the distance between (5, 9) and (5, 0)?", correctAnswer: "9 units", options: ["4 units", "5 units", "9 units", "14 units"], point1: { x: 5, y: 9 }, point2: { x: 5, y: 0 } },
  // Reflections
  { id: 21, type: 'reflection', question: "Reflect the point (3, 4) over the x-axis. What are the new coordinates?", correctAnswer: "(3, -4)", options: ["(-3, 4)", "(3, -4)", "(-3, -4)", "(4, 3)"], point1: { x: 3, y: 4 }, point2: { x: 3, y: -4 } },
  { id: 22, type: 'reflection', question: "Reflect the point (-2, 5) over the y-axis. What are the new coordinates?", correctAnswer: "(2, 5)", options: ["(2, 5)", "(-2, -5)", "(2, -5)", "(5, -2)"], point1: { x: -2, y: 5 }, point2: { x: 2, y: 5 } },
  { id: 23, type: 'reflection', question: "Reflect the point (-6, -3) over the x-axis. What are the new coordinates?", correctAnswer: "(-6, 3)", options: ["(6, -3)", "(-6, 3)", "(6, 3)", "(-3, -6)"], point1: { x: -6, y: -3 }, point2: { x: -6, y: 3 } },
  { id: 24, type: 'reflection', question: "Reflect the point (5, -7) over the y-axis. What are the new coordinates?", correctAnswer: "(-5, -7)", options: ["(5, 7)", "(-5, 7)", "(-5, -7)", "(-7, 5)"], point1: { x: 5, y: -7 }, point2: { x: -5, y: -7 } },
  { id: 25, type: 'reflection', question: "Reflect the point (-8, 2) over the x-axis. What are the new coordinates?", correctAnswer: "(-8, -2)", options: ["(8, 2)", "(-8, -2)", "(8, -2)", "(2, -8)"], point1: { x: -8, y: 2 }, point2: { x: -8, y: -2 } },
  { id: 26, type: 'reflection', question: "Reflect the point (4, -9) over the y-axis. What are the new coordinates?", correctAnswer: "(-4, -9)", options: ["(4, 9)", "(-4, 9)", "(-4, -9)", "(-9, 4)"], point1: { x: 4, y: -9 }, point2: { x: -4, y: -9 } },
  { id: 27, type: 'reflection', question: "Reflect the point (0, 3) over the x-axis. What are the new coordinates?", correctAnswer: "(0, -3)", options: ["(3, 0)", "(0, -3)", "(0, 3)", "(-3, 0)"], point1: { x: 0, y: 3 }, point2: { x: 0, y: -3 } },
  { id: 28, type: 'reflection', question: "Reflect the point (-7, 0) over the y-axis. What are the new coordinates?", correctAnswer: "(7, 0)", options: ["(0, -7)", "(7, 0)", "(-7, 0)", "(0, 7)"], point1: { x: -7, y: 0 }, point2: { x: 7, y: 0 } },
  { id: 29, type: 'reflection', question: "Reflect (6, 6) over both the x-axis and y-axis. What are the new coordinates?", correctAnswer: "(-6, -6)", options: ["(-6, 6)", "(6, -6)", "(-6, -6)", "(-6, 0)"], point1: { x: 6, y: 6 }, point2: { x: -6, y: -6 } },
  { id: 30, type: 'reflection', question: "Reflect (-3, -5) over both the x-axis and y-axis. What are the new coordinates?", correctAnswer: "(3, 5)", options: ["(3, -5)", "(-3, 5)", "(3, 5)", "(5, 3)"], point1: { x: -3, y: -5 }, point2: { x: 3, y: 5 } },
  // Midpoints
  { id: 31, type: 'midpoint', question: "What is the midpoint between (2, 4) and (8, 4)?", correctAnswer: "(5, 4)", options: ["(5, 4)", "(10, 8)", "(6, 4)", "(4, 5)"], point1: { x: 2, y: 4 }, point2: { x: 8, y: 4 } },
  { id: 32, type: 'midpoint', question: "What is the midpoint between (-4, -2) and (-4, 6)?", correctAnswer: "(-4, 2)", options: ["(-4, 4)", "(-4, 2)", "(0, 2)", "(-8, 4)"], point1: { x: -4, y: -2 }, point2: { x: -4, y: 6 } },
  { id: 33, type: 'midpoint', question: "What is the midpoint between (1, 3) and (5, 3)?", correctAnswer: "(3, 3)", options: ["(2, 3)", "(3, 3)", "(4, 3)", "(3, 0)"], point1: { x: 1, y: 3 }, point2: { x: 5, y: 3 } },
  { id: 34, type: 'midpoint', question: "What is the midpoint between (-6, -5) and (2, -5)?", correctAnswer: "(-2, -5)", options: ["(-4, -5)", "(-2, -5)", "(2, -5)", "(-2, 0)"], point1: { x: -6, y: -5 }, point2: { x: 2, y: -5 } },
  { id: 35, type: 'midpoint', question: "What is the midpoint between (3, -8) and (3, 2)?", correctAnswer: "(3, -3)", options: ["(3, -5)", "(3, -3)", "(3, -6)", "(0, -3)"], point1: { x: 3, y: -8 }, point2: { x: 3, y: 2 } },
  // Axis
  { id: 36, type: 'axis', question: "Which axis does the point (0, -5) lie on?", correctAnswer: "y-axis", options: ["x-axis", "y-axis", "Both axes", "Neither axis"], point1: { x: 0, y: -5 } },
  { id: 37, type: 'axis', question: "Which axis does the point (8, 0) lie on?", correctAnswer: "x-axis", options: ["x-axis", "y-axis", "Both axes", "Neither axis"], point1: { x: 8, y: 0 } },
  { id: 38, type: 'axis', question: "Which axis does the point (0, 12) lie on?", correctAnswer: "y-axis", options: ["x-axis", "y-axis", "Both axes", "Neither axis"], point1: { x: 0, y: 10 } },
  { id: 39, type: 'axis', question: "Which axis does the point (-3, 0) lie on?", correctAnswer: "x-axis", options: ["x-axis", "y-axis", "Both axes", "Neither axis"], point1: { x: -3, y: 0 } },
  { id: 40, type: 'axis', question: "What are the coordinates of the origin?", correctAnswer: "(0, 0)", options: ["(1, 1)", "(0, 0)", "(1, 0)", "(0, 1)"], point1: { x: 0, y: 0 } },
];

const ROUNDS_COUNT = 10;
const TIMER_LIMIT = 15;

const getFormulaIntel = (type: string) => {
  switch (type) {
    case 'midpoint':
      return { formula: 'M = ((x₁ + x₂)/2, (y₁ + y₂)/2)', label: 'Midpoint Synthesis' };
    case 'distance':
      return { formula: 'd = |y₂ - y₁| or |x₂ - x₁| (axis-parallel)', label: 'Linear Vector Distance' };
    case 'reflection':
      return { formula: 'Over X: (x, -y) • Over Y: (-x, y)', label: 'Axial Reflection' };
    case 'quadrant':
      return { formula: 'QI (+,+) • QII (-,+) • QIII (-,-) • QIV (+,-)', label: 'Quadrant Detection' };
    case 'axis':
      return { formula: 'x-axis: (x, 0) • y-axis: (0, y) • Origin: (0, 0)', label: 'Axis / Intercepts' };
    default:
      return { formula: 'Coordinate plane vector analysis', label: 'Vector Geometry' };
  }
};

const getPointLocation = (p?: { x: number; y: number }) => {
  if (!p) return null;
  if (p.x > 0 && p.y > 0) return 'Quad I';
  if (p.x < 0 && p.y > 0) return 'Quad II';
  if (p.x < 0 && p.y < 0) return 'Quad III';
  if (p.x > 0 && p.y < 0) return 'Quad IV';
  if (p.x === 0 && p.y === 0) return 'Origin';
  if (p.y === 0) return 'X-Axis';
  if (p.x === 0) return 'Y-Axis';
  return 'Plane';
};

export function CoordinateCosmos({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "instructions" | "playing" | "answered" | "finished">("idle");
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(1);
  const [questions, setQuestions] = React.useState<CoordinateQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = React.useState(0);
  const [shuffledOptions, setShuffledOptions] = React.useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_LIMIT);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleStartGame = () => {
    // Pick 10 random questions from the pool of 40 to avoid repetition
    const shuffledPool = shuffleArray([...QUESTION_POOL]);
    const selected = shuffledPool.slice(0, ROUNDS_COUNT);
    setQuestions(selected);
    setScore(0);
    setRound(1);
    setCurrentQuestionIdx(0);
    setupQuestion(selected[0]);
    setGameState("playing");
  };

  const abortGame = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState("idle");
    setScore(0);
    setRound(1);
  };

  const setupQuestion = (question: CoordinateQuestion) => {
    // Shuffle options dynamically on every question render so correct answer isn't in same position
    setShuffledOptions(shuffleArray([...question.options]));
    setSelectedAnswer(null);
    setTimeLeft(TIMER_LIMIT);
  };

  const handleAnswer = (ans: string) => {
    if (gameState !== "playing") return;
    setSelectedAnswer(ans);
    const currentQ = questions[currentQuestionIdx];
    const correct = ans === currentQ.correctAnswer;
    if (correct) {
      setScore((s) => s + 10);
    }
    setGameState("answered");

    setTimeout(() => {
      if (round < ROUNDS_COUNT) {
        setRound((r) => r + 1);
        const nextIdx = currentQuestionIdx + 1;
        setCurrentQuestionIdx(nextIdx);
        setupQuestion(questions[nextIdx]);
        setGameState("playing");
      } else {
        setGameState("finished");
        if (firestore && game) {
          logAnalyticsEvent(firestore, user?.uid || "guest", {
            type: "game_played",
            details: { slug: game.slug, title: game.title, score: score + (correct ? 10 : 0) },
          });
        }
      }
    }, 2000);
  };

  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      handleAnswer("TIMEOUT");
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft]);

  if (!game) return null;

  const currentQ = questions[currentQuestionIdx];

  // SVG grid coordinate calculations
  // Center is at 100, 100. Grid is -10 to 10.
  const toSvgX = (x: number) => 100 + x * 8;
  const toSvgY = (y: number) => 100 - y * 8;

  return (
    <Card
      className={cn(
        "w-full transition-all duration-500 flex flex-col justify-between bg-slate-950 text-slate-50 border-indigo-500/20 overflow-y-auto overflow-x-hidden max-w-full",
        isFullscreen
          ? "min-h-screen rounded-none border-none max-w-none justify-start sm:justify-between p-3 sm:p-8"
          : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl shadow-2xl shadow-indigo-500/10 border"
      )}
    >
      {/* Universal Game Nav Header */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-indigo-950/60 bg-slate-900/40">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-slate-400 hover:text-slate-100">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4" /> Games
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {gameState !== "idle" && (
            <Button variant="outline" size="sm" onClick={abortGame} className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-8">
              <XOctagon className="h-3.5 w-3.5" /> Abort Game
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1 text-slate-400 hover:text-slate-100"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
        </div>
      </div>

      <CardHeader className="text-center relative border-b border-indigo-950 p-3 sm:p-6 pb-4">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 animate-spin" style={{ animationDuration: "10s" }} />
        </div>
        <CardTitle
          className={cn(
            "font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-xl sm:text-2xl md:text-3xl",
            isFullscreen && "text-2xl sm:text-4xl md:text-5xl"
          )}
        >
          {game.title}
        </CardTitle>
        {gameState !== "idle" && gameState !== "instructions" && (
          <div className="flex justify-center gap-3 mt-2 sm:mt-4">
            <Badge variant="secondary" className="bg-indigo-900/50 text-indigo-200 border-indigo-800 text-xs">
              Round {round}/{ROUNDS_COUNT}
            </Badge>
            <Badge variant="outline" className="border-purple-800 text-purple-300 text-xs">
              Score: {score}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex flex-col items-stretch justify-start p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-y-auto overflow-x-hidden pb-16", isFullscreen ? "min-h-0 flex-1" : "w-full flex-1 min-h-[calc(100dvh-16rem)]")}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto py-2">
            {/* Astronavigation Telemetry Pods */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full">
              <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-indigo-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">Cartesian Plane</span>
                <span className="text-xs sm:text-sm font-black text-slate-100">[-10, 10] Grid</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">Voyage Quota</span>
                <span className="text-sm sm:text-base font-black text-cyan-300">10 Vectors</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-purple-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">Vector Pool</span>
                <span className="text-sm sm:text-base font-black text-purple-300">40 Scenarios</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">Nav Window</span>
                <span className="text-sm sm:text-base font-black text-amber-300">15s / Vector</span>
              </div>
            </div>

            {/* Split Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full text-left">
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/50 border border-indigo-950 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-indigo-400" /> Astrogation Controls
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Unlock coordinates, align vectors, and navigate through the quadrants of deep space. Study real-time SVG plots to calculate distance, reflection, and midpoint transformations.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between py-1 border-b border-indigo-950/40">
                      <span>Voyage Difficulty</span>
                      <span className="text-indigo-300 font-bold">Standard Stellar</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-indigo-950/40">
                      <span>Vector Types</span>
                      <span className="text-purple-300 font-bold">Quadrants, Distance, Reflections</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
                  <Button
                    onClick={handleStartGame}
                    size="lg"
                    className="w-full sm:w-1/2 h-11 sm:h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-black uppercase text-xs sm:text-sm rounded-xl shadow-lg"
                  >
                    Initialize Voyage
                  </Button>
                  <Button
                    onClick={() => setGameState("instructions")}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-1/2 h-11 sm:h-12 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950 font-bold uppercase rounded-xl text-xs sm:text-sm"
                  >
                    <BookOpen className="mr-2 h-4 w-4" /> Flight Intel
                  </Button>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/50 border border-indigo-950 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-400" /> Stellar Quadrant Directives
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <p className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">I.</span>
                      <span>Quadrant I: (+x, +y) Top-Right | Quadrant II: (-x, +y) Top-Left</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-pink-400 font-bold">II.</span>
                      <span>Quadrant III: (-x, -y) Bottom-Left | Quadrant IV: (+x, -y) Bottom-Right</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">III.</span>
                      <span>Reflect over X-axis flips y-sign; reflect over Y-axis flips x-sign.</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-center">
                  <span className="text-[11px] font-mono text-indigo-300">Synchronized Vector Engine Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-6 text-center bg-indigo-950/20 rounded-3xl border border-indigo-500/10 shadow-inner w-full",
              isFullscreen ? "p-16 max-w-4xl" : "p-8 max-w-2xl"
            )}
          >
            <h3 className={cn("font-black uppercase tracking-widest text-indigo-400 mb-2", isFullscreen ? "text-4xl" : "text-2xl")}>
              How to Play (Navigational Briefing)
            </h3>
            <div className={cn("text-left space-y-4 text-slate-300 font-medium", isFullscreen ? "text-xl" : "text-sm md:text-base")}>
              <p>🛰️ **Identify Quadrants**: Correctly locate points in Quadrants I, II, III, or IV.</p>
              <p>📏 **Measure Distance**: Calculate the length of a vector between two coordinate points.</p>
              <p>🪞 **Calculate Reflections**: Mirror points over the x-axis, y-axis, or origin coordinates.</p>
              <p>📍 **Plot Points**: Study the active coordinate plane rendering to formulate your answer.</p>
            </div>
            <Button
              onClick={handleStartGame}
              size="lg"
              className={cn(
                "mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black uppercase tracking-widest",
                isFullscreen && "h-20 px-16 text-2xl rounded-2xl"
              )}
            >
              Launch Voyage
            </Button>
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && currentQ && (
          <div className="w-full max-w-6xl xl:max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6 mt-1">
            {/* Real-time In-Game Telemetry Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-indigo-500/20 backdrop-blur flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Compass className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block truncate">Vector Operation</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-300 block truncate">{getFormulaIntel(currentQ.type).label}</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block truncate">Telemetry Plot</span>
                  <span className="text-xs sm:text-sm font-black text-cyan-300 block truncate">
                    {currentQ.point1 ? `P₁(${currentQ.point1.x}, ${currentQ.point1.y})` : 'Origin'}
                    {currentQ.point2 ? ` • P₂(${currentQ.point2.x}, ${currentQ.point2.y})` : ''}
                  </span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-amber-500/20 backdrop-blur flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <span>Navigation Sync</span>
                    <span className={cn("font-bold", timeLeft <= 5 && "text-rose-400 animate-pulse")}>{timeLeft}s</span>
                  </div>
                  <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-1.5 bg-slate-950 border border-slate-800 mt-1" />
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-purple-500/20 backdrop-blur flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block truncate">Voyage Quota</span>
                  <span className="text-xs sm:text-sm font-black text-purple-300 block truncate">Round {round}/{ROUNDS_COUNT} • {score} pts</span>
                </div>
              </div>
            </div>

            {/* Main Battle Station Grid (Interactive Radar + Command Terminal) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch w-full">
              {/* Left Column: Interactive Radar Plane (5 cols on lg, 5 cols on xl) */}
              <div className="lg:col-span-5 flex flex-col gap-3 items-center justify-center p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-indigo-900/40 backdrop-blur shadow-2xl">
                <div className="w-full flex items-center justify-between px-1">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping inline-block" />
                    2D Space Navigation Radar
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Scale: -10 to +10</span>
                </div>

                {/* SVG Canvas - commanding & centered */}
                <div className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] aspect-square border-2 border-indigo-500/40 rounded-2xl bg-slate-950/80 p-3 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Concentric radar rings */}
                    <circle cx="100" cy="100" r="40" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="0.8" fill="none" />
                    <circle cx="100" cy="100" r="75" stroke="rgba(99, 102, 241, 0.06)" strokeWidth="0.8" fill="none" />

                    {/* Grid Lines */}
                    {Array.from({ length: 21 }).map((_, i) => {
                      const val = toSvgX(-10 + i);
                      return (
                        <React.Fragment key={i}>
                          <line x1={val} y1="0" x2={val} y2="200" stroke="rgba(99, 102, 241, 0.09)" strokeWidth="0.5" />
                          <line x1="0" y1={val} x2="200" y2={val} stroke="rgba(99, 102, 241, 0.09)" strokeWidth="0.5" />
                        </React.Fragment>
                      );
                    })}

                    {/* X & Y Axes */}
                    <line x1="100" y1="0" x2="100" y2="200" stroke="#6366f1" strokeWidth="1.8" />
                    <line x1="0" y1="100" x2="200" y2="100" stroke="#6366f1" strokeWidth="1.8" />

                    {/* Quadrant Labels */}
                    <text x="170" y="24" fill="rgba(99, 102, 241, 0.55)" fontSize="9" fontWeight="bold">QI (+,+)</text>
                    <text x="10" y="24" fill="rgba(99, 102, 241, 0.55)" fontSize="9" fontWeight="bold">QII (-,+)</text>
                    <text x="10" y="190" fill="rgba(99, 102, 241, 0.55)" fontSize="9" fontWeight="bold">QIII (-,-)</text>
                    <text x="165" y="190" fill="rgba(99, 102, 241, 0.55)" fontSize="9" fontWeight="bold">QIV (+,-)</text>

                    {/* Vector line for distance questions */}
                    {currentQ.point1 && currentQ.point2 && currentQ.type === "distance" && (
                      <line
                        x1={toSvgX(currentQ.point1.x)}
                        y1={toSvgY(currentQ.point1.y)}
                        x2={toSvgX(currentQ.point2.x)}
                        y2={toSvgY(currentQ.point2.y)}
                        stroke="#ec4899"
                        strokeWidth="2.5"
                        strokeDasharray="4"
                      />
                    )}

                    {/* Point 1 dot */}
                    {currentQ.point1 && (
                      <g>
                        <circle
                          cx={toSvgX(currentQ.point1.x)}
                          cy={toSvgY(currentQ.point1.y)}
                          r="6"
                          fill="#a855f7"
                          className="animate-ping"
                          style={{ animationDuration: "2.5s" }}
                        />
                        <circle cx={toSvgX(currentQ.point1.x)} cy={toSvgY(currentQ.point1.y)} r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
                        <rect
                          x={toSvgX(currentQ.point1.x) + (currentQ.point1.x >= 0 ? 5 : -45)}
                          y={toSvgY(currentQ.point1.y) - 15}
                          width="40"
                          height="12"
                          rx="3"
                          fill="rgba(15, 23, 42, 0.85)"
                          stroke="rgba(99, 102, 241, 0.5)"
                          strokeWidth="0.5"
                        />
                        <text
                          x={toSvgX(currentQ.point1.x) + (currentQ.point1.x >= 0 ? 8 : -42)}
                          y={toSvgY(currentQ.point1.y) - 6}
                          fill="#c7d2fe"
                          fontSize="7"
                          fontWeight="bold"
                        >
                          ({currentQ.point1.x}, {currentQ.point1.y})
                        </text>
                      </g>
                    )}

                    {/* Point 2 dot */}
                    {currentQ.point2 && (
                      <g>
                        <circle
                          cx={toSvgX(currentQ.point2.x)}
                          cy={toSvgY(currentQ.point2.y)}
                          r="6"
                          fill="#ec4899"
                          className="animate-ping"
                          style={{ animationDuration: "2.5s" }}
                        />
                        <circle cx={toSvgX(currentQ.point2.x)} cy={toSvgY(currentQ.point2.y)} r="4.5" fill="#db2777" stroke="#ffffff" strokeWidth="1" />
                        <rect
                          x={toSvgX(currentQ.point2.x) + (currentQ.point2.x >= 0 ? 5 : -45)}
                          y={toSvgY(currentQ.point2.y) - 15}
                          width="40"
                          height="12"
                          rx="3"
                          fill="rgba(15, 23, 42, 0.85)"
                          stroke="rgba(236, 72, 153, 0.5)"
                          strokeWidth="0.5"
                        />
                        <text
                          x={toSvgX(currentQ.point2.x) + (currentQ.point2.x >= 0 ? 8 : -42)}
                          y={toSvgY(currentQ.point2.y) - 6}
                          fill="#fbcfe8"
                          fontSize="7"
                          fontWeight="bold"
                        >
                          ({currentQ.point2.x}, {currentQ.point2.y})
                        </text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Radar Readout Pills */}
                <div className="w-full grid grid-cols-2 gap-2 text-center text-xs">
                  {currentQ.point1 && (
                    <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20">
                      <span className="text-[10px] text-slate-400 font-mono block">Point Alpha (P₁)</span>
                      <span className="font-bold text-indigo-300">({currentQ.point1.x}, {currentQ.point1.y}) • {getPointLocation(currentQ.point1)}</span>
                    </div>
                  )}
                  {currentQ.point2 ? (
                    <div className="p-2 rounded-lg bg-pink-950/40 border border-pink-500/20">
                      <span className="text-[10px] text-slate-400 font-mono block">Point Beta (P₂)</span>
                      <span className="font-bold text-pink-300">({currentQ.point2.x}, {currentQ.point2.y}) • {getPointLocation(currentQ.point2)}</span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono block">Analysis Mode</span>
                      <span className="font-bold text-slate-300">{getFormulaIntel(currentQ.type).label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Question & Answers Command Terminal (7 cols on lg, 7 cols on xl) */}
              <div className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-indigo-900/40 backdrop-blur shadow-2xl gap-5">
                <div className="space-y-4">
                  {/* Category & Formula Intel Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/20">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs uppercase px-2.5 py-0.5">
                        {currentQ.type}
                      </Badge>
                      <span className="text-xs font-mono text-indigo-200 font-bold">{getFormulaIntel(currentQ.type).label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 italic">
                      Formula: <strong className="text-slate-200 not-italic font-bold">{getFormulaIntel(currentQ.type).formula}</strong>
                    </span>
                  </div>

                  {/* Main Question Display */}
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase font-mono tracking-widest text-slate-400 block">Stellar Vector Target</span>
                    <h3 className={cn("font-black text-slate-100 leading-snug tracking-tight", isFullscreen ? "text-2xl sm:text-3xl md:text-4xl" : "text-xl sm:text-2xl md:text-3xl")}>
                      {currentQ.question}
                    </h3>
                  </div>
                </div>

                {/* Answers 2x2 Grid with high-tech responsive cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                  {shuffledOptions.map((opt, idx) => {
                    const isCorrectAnswer = opt === currentQ.correctAnswer;
                    const isSelected = opt === selectedAnswer;

                    return (
                      <Button
                        key={opt}
                        variant="outline"
                        onClick={() => handleAnswer(opt)}
                        disabled={gameState === "answered"}
                        className={cn(
                          "min-h-[3.75rem] sm:min-h-[4.5rem] p-3 sm:p-4 text-base sm:text-lg font-black border-2 transition-all duration-200 rounded-xl hover:scale-[1.02] shadow-md w-full text-left justify-start relative overflow-hidden",
                          gameState === "playing"
                            ? "border-slate-800 bg-slate-950/80 hover:bg-indigo-950/50 hover:border-indigo-400 hover:text-white"
                            : isCorrectAnswer
                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]"
                            : isSelected
                            ? "bg-rose-950/80 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                            : "border-slate-900 bg-slate-950/40 opacity-40 text-slate-500"
                        )}
                      >
                        <span className="flex items-center justify-between w-full gap-2">
                          <span className="flex items-center gap-2.5 truncate">
                            <span className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[11px] font-mono font-bold text-indigo-300 flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-mono truncate">{opt}</span>
                          </span>
                          {gameState === "answered" && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                          {gameState === "answered" && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                        </span>
                      </Button>
                    );
                  })}
                </div>

                {/* Sub-bar with abort / telemetry notice */}
                <div className="flex items-center justify-between pt-2 border-t border-indigo-950/40 text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-slate-500">Coordinate Engine v2.4 • Active Vector Scan</span>
                  <Button variant="ghost" size="sm" onClick={abortGame} className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1 h-7 px-2">
                    <XOctagon className="h-3 w-3" /> Abort Vector
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
            <Trophy className="w-28 h-28 text-yellow-400 animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400">
              Voyage Complete
            </h2>
            <div className="p-8 bg-indigo-950/20 rounded-3xl border-2 border-indigo-500/20 max-w-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Final Coordinates Score</p>
              <p className="text-6xl font-black text-indigo-400">{score}</p>
            </div>
            <Button
              onClick={handleStartGame}
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-16 px-6 sm:px-12 text-sm sm:text-lg font-black rounded-2xl uppercase shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            >
              <Repeat className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" /> Reset System
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-4 border-t border-indigo-950 pt-4 sm:pt-6 p-4 sm:p-6 w-full">
        <Button variant="outline" className="w-full sm:w-auto border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-slate-100" asChild>
          <Link href="/games">Back to Games</Link>
        </Button>
        <div className="flex items-center gap-3">
          {gameState !== "idle" && gameState !== "instructions" && (
            <>
              <p className="font-black text-indigo-400 uppercase tracking-widest text-xs sm:text-sm">
                Score: {score}
              </p>
              <Button variant="destructive" size="sm" onClick={abortGame} className="gap-1.5 font-bold h-9 text-xs">
                <XOctagon className="h-3.5 w-3.5" /> Abort Game
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
