"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Maximize, Minimize, Trophy, Sparkles, Repeat, Compass, CheckCircle2, XCircle } from "lucide-react";
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
        "w-full transition-all duration-500 flex flex-col bg-slate-950 text-slate-50 border-indigo-500/20",
        isFullscreen
          ? "min-h-screen rounded-none border-none max-w-none justify-center p-8"
          : "max-w-4xl mx-auto shadow-2xl shadow-indigo-500/10 border"
      )}
    >
      <CardHeader className="text-center relative border-b border-indigo-950 pb-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1 text-slate-400 hover:text-slate-100 z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
        </Button>
        <div className="flex items-center justify-center gap-3 mb-2">
          <Compass className="w-10 h-10 text-indigo-400 animate-spin" style={{ animationDuration: "10s" }} />
        </div>
        <CardTitle
          className={cn(
            "font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400",
            isFullscreen ? "text-5xl" : "text-3xl"
          )}
        >
          {game.title}
        </CardTitle>
        {gameState !== "idle" && gameState !== "instructions" && (
          <div className="flex justify-center gap-3 mt-4">
            <Badge variant="secondary" className="bg-indigo-900/50 text-indigo-200 border-indigo-800">
              Round {round}/{ROUNDS_COUNT}
            </Badge>
            <Badge variant="outline" className="border-purple-800 text-purple-300">
              Score: {score}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex flex-col items-center justify-center p-6", isFullscreen ? "min-h-[65vh]" : "min-h-[450px]")}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6 text-center max-w-lg">
            <p className={cn("text-slate-300", isFullscreen ? "text-2xl" : "text-base")}>
              Unlock coordinates, align vectors, and navigate through the quadrants of deep space.
            </p>
            <Button
              onClick={() => setGameState("instructions")}
              size={isFullscreen ? "lg" : "default"}
              className={cn(
                "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105",
                isFullscreen && "h-20 px-16 text-2xl rounded-2xl"
              )}
            >
              Initialize System
            </Button>
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
              Navigational Briefing
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
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mt-4">
            
            {/* SVG Interactive Coordinate Grid */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 border-2 border-indigo-500/30 rounded-2xl bg-slate-900/60 p-2 shadow-inner">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Grid Lines */}
                {Array.from({ length: 21 }).map((_, i) => {
                  const val = toSvgX(-10 + i);
                  return (
                    <React.Fragment key={i}>
                      {/* Vertical line */}
                      <line x1={val} y1="0" x2={val} y2="200" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="0.5" />
                      {/* Horizontal line */}
                      <line x1="0" y1={val} x2="200" y2={val} stroke="rgba(99, 102, 241, 0.08)" strokeWidth="0.5" />
                    </React.Fragment>
                  );
                })}

                {/* X & Y Axes */}
                <line x1="100" y1="0" x2="100" y2="200" stroke="#6366f1" strokeWidth="1.5" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="#6366f1" strokeWidth="1.5" />

                {/* Quadrant Labels */}
                <text x="175" y="25" fill="rgba(99, 102, 241, 0.4)" fontSize="10" fontWeight="bold">I</text>
                <text x="25" y="25" fill="rgba(99, 102, 241, 0.4)" fontSize="10" fontWeight="bold">II</text>
                <text x="20" y="180" fill="rgba(99, 102, 241, 0.4)" fontSize="10" fontWeight="bold">III</text>
                <text x="175" y="180" fill="rgba(99, 102, 241, 0.4)" fontSize="10" fontWeight="bold">IV</text>

                {/* Vector line for distance questions */}
                {currentQ.point1 && currentQ.point2 && currentQ.type === "distance" && (
                  <line
                    x1={toSvgX(currentQ.point1.x)}
                    y1={toSvgY(currentQ.point1.y)}
                    x2={toSvgX(currentQ.point2.x)}
                    y2={toSvgY(currentQ.point2.y)}
                    stroke="#ec4899"
                    strokeWidth="2"
                    strokeDasharray="3"
                  />
                )}

                {/* Point 1 dot */}
                {currentQ.point1 && (
                  <g>
                    <circle
                      cx={toSvgX(currentQ.point1.x)}
                      cy={toSvgY(currentQ.point1.y)}
                      r="5"
                      fill="#a855f7"
                      className="animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                    <circle cx={toSvgX(currentQ.point1.x)} cy={toSvgY(currentQ.point1.y)} r="4" fill="#6366f1" />
                    <text
                      x={toSvgX(currentQ.point1.x) + (currentQ.point1.x >= 0 ? 6 : -36)}
                      y={toSvgY(currentQ.point1.y) - 6}
                      fill="#818cf8"
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
                      r="5"
                      fill="#ec4899"
                      className="animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                    <circle cx={toSvgX(currentQ.point2.x)} cy={toSvgY(currentQ.point2.y)} r="4" fill="#db2777" />
                    <text
                      x={toSvgX(currentQ.point2.x) + (currentQ.point2.x >= 0 ? 6 : -36)}
                      y={toSvgY(currentQ.point2.y) - 6}
                      fill="#f472b6"
                      fontSize="7"
                      fontWeight="bold"
                    >
                      ({currentQ.point2.x}, {currentQ.point2.y})
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Question / Options panel */}
            <div className="flex-1 w-full space-y-6 flex flex-col">
              {/* Timer Progress */}
              <div className="space-y-1">
                <div className="flex justify-between font-black uppercase text-xs tracking-widest text-slate-400">
                  <span>Navigation Sync</span>
                  <span className={cn(timeLeft <= 5 && "text-rose-500 animate-pulse")}>{timeLeft}s</span>
                </div>
                <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-2 bg-slate-900 border border-slate-800" />
              </div>

              {/* Question Text */}
              <div className={cn("font-bold text-slate-100", isFullscreen ? "text-3xl" : "text-xl md:text-2xl")}>
                {currentQ.question}
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shuffledOptions.map((opt) => {
                  const isCorrectAnswer = opt === currentQ.correctAnswer;
                  const isSelected = opt === selectedAnswer;

                  return (
                    <Button
                      key={opt}
                      variant="outline"
                      onClick={() => handleAnswer(opt)}
                      disabled={gameState === "answered"}
                      className={cn(
                        "h-16 text-lg font-black border-2 transition-all rounded-xl hover:scale-[1.02] shadow-md",
                        gameState === "playing"
                          ? "border-slate-800 bg-slate-900 hover:bg-indigo-950/30 hover:border-indigo-500 hover:text-indigo-200"
                          : isCorrectAnswer
                          ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 scale-105"
                          : isSelected
                          ? "bg-rose-950/60 border-rose-500 text-rose-200"
                          : "border-slate-800 bg-slate-900/30 opacity-60"
                      )}
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>{opt}</span>
                        {gameState === "answered" && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />}
                        {gameState === "answered" && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />}
                      </span>
                    </Button>
                  );
                })}
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
              className="h-16 px-12 text-lg font-black rounded-2xl uppercase shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            >
              <Repeat className="mr-3 h-5 w-5" /> Reset System
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-indigo-950 pt-6">
        <Button variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-slate-100" asChild>
          <Link href="/games">Abort System</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
          <p className="font-black text-indigo-400 uppercase tracking-widest">
            Score: {score}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
