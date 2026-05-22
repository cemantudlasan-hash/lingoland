
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
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
import { Input } from "../ui/input";
import { Loader2, Sparkles, Timer, CheckCircle, XCircle, Repeat, Maximize, Minimize, Eraser, Undo, ScrollText, Send, SkipForward, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const DynamicCanvas = dynamic(
  () => import("react-sketch-canvas").then((mod) => mod.ReactSketchCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Loader2 className="animate-spin" />
      </div>
    ),
  }
);

type GameState = "idle" | "instructions" | "selecting_difficulty" | "loading" | "playing" | "answered" | "finished";

interface MathProblem {
  id: number;
  text: string;
  answer: string;
  explanation: string;
  level: SkillLevel;
}

const PROBLEMS: MathProblem[] = [
  // BEGINNER
  {
    id: 1,
    level: "beginner",
    text: "Farmer Joe has 15 red apples and 12 green apples. He gives 7 red apples to his neighbor. How many apples does Joe have left in total?",
    answer: "20",
    explanation: "Joe starts with 15 + 12 = 27 apples. After giving away 7, he has 27 - 7 = 20 apples.",
  },
  {
    id: 2,
    level: "beginner",
    text: "A school bus has 24 seats. 18 students are already on the bus. At the next stop, 5 more students get on. How many empty seats are left? (Enter 0 if the bus is full or over capacity)",
    answer: "1",
    explanation: "Total students: 18 + 5 = 23. Empty seats: 24 - 23 = 1.",
  },
  {
    id: 7,
    level: "beginner",
    text: "A baker made 30 cupcakes. She sold 12 in the morning and 8 in the afternoon. How many cupcakes does she have left?",
    answer: "10",
    explanation: "Total sold: 12 + 8 = 20. Remaining: 30 - 20 = 10.",
  },
  {
    id: 8,
    level: "beginner",
    text: "Tim has 4 boxes of crayons. Each box has 8 crayons. He loses 5 crayons. How many crayons does he have now?",
    answer: "27",
    explanation: "Initial crayons: 4 boxes × 8 = 32. After losing 5: 32 - 5 = 27.",
  },
  {
    id: 9,
    level: "beginner",
    text: "In a garden, there are 14 yellow flowers and 16 blue flowers. If 9 flowers are picked, how many flowers are still in the garden?",
    answer: "21",
    explanation: "Total flowers: 14 + 16 = 30. Remaining: 30 - 9 = 21.",
  },
  {
    id: 10,
    level: "beginner",
    text: "Lucy had $25. She bought a book for $9 and a snack for $4. How much money does she have left?",
    answer: "12",
    explanation: "Total spent: $9 + $4 = $13. Remaining: $25 - $13 = $12.",
  },
  {
    id: 11,
    level: "beginner",
    text: "A cat caught 3 mice on Monday, 4 on Tuesday, and 2 on Wednesday. How many mice did it catch in total?",
    answer: "9",
    explanation: "Total caught: 3 + 4 + 2 = 9.",
  },
  {
    id: 22,
    level: "beginner",
    text: "A pet shop has 12 fish tanks. Each tank has 5 fish. If the shop sells 15 fish, how many fish are left in total?",
    answer: "45",
    explanation: "Total fish = 12 tanks × 5 = 60 fish. After selling 15: 60 - 15 = 45 fish.",
  },
  {
    id: 23,
    level: "beginner",
    text: "Emma has 40 marbles. She gives 12 to her best friend and 8 to her brother. How many marbles does Emma have now?",
    answer: "20",
    explanation: "Total given away: 12 + 8 = 20. Remaining: 40 - 20 = 20.",
  },
  {
    id: 24,
    level: "beginner",
    text: "A library had 55 books on a shelf. 14 books were borrowed, and 6 were returned. How many books are on the shelf now?",
    answer: "47",
    explanation: "Starting: 55. Borrowed: 55 - 14 = 41. Returned: 41 + 6 = 47.",
  },
  {
    id: 25,
    level: "beginner",
    text: "A farmer picked 18 strawberries in the morning and 24 in the afternoon. He ate 5 of them. How many strawberries does he have left?",
    answer: "37",
    explanation: "Total picked: 18 + 24 = 42. After eating 5: 42 - 5 = 37.",
  },
  {
    id: 26,
    level: "beginner",
    text: "A soccer team scored 3 goals in their first game, 2 goals in their second, and 5 goals in their third. What is the total number of goals scored?",
    answer: "10",
    explanation: "Sum: 3 + 2 + 5 = 10.",
  },

  // INTERMEDIATE
  {
    id: 3,
    level: "intermediate",
    text: "Sarah buys 3 notebooks for $4 each and 2 packs of pencils for $3 each. She pays with a $20 bill. How much change should she receive?",
    answer: "2",
    explanation: "Total cost: (3 × $4) + (2 × $3) = $12 + $6 = $18. Change: $20 - $18 = $2.",
  },
  {
    id: 4,
    level: "intermediate",
    text: "A rectangular garden is 8 meters long and 5 meters wide. A fence is built around the entire garden. What is the total length of the fence in meters?",
    answer: "26",
    explanation: "Perimeter = 2 × (length + width) = 2 × (8 + 5) = 2 × 13 = 26 meters.",
  },
  {
    id: 12,
    level: "intermediate",
    text: "A pizza is cut into 12 equal slices. If Mark eats 1/4 of the pizza and Julie eats 1/3 of the pizza, how many slices are left?",
    answer: "5",
    explanation: "Mark: 12 × 1/4 = 3 slices. Julie: 12 × 1/3 = 4 slices. Total eaten: 3 + 4 = 7. Left: 12 - 7 = 5.",
  },
  {
    id: 13,
    level: "intermediate",
    text: "A theater has 15 rows of seats, and each row has 12 seats. During a show, 45 seats are empty. How many people are watching the show?",
    answer: "135",
    explanation: "Total seats: 15 × 12 = 180. People: 180 - 45 = 135.",
  },
  {
    id: 14,
    level: "intermediate",
    text: "A car travels 180 miles in 3 hours. If it continues at the same average speed, how many miles will it travel in 5 hours?",
    answer: "300",
    explanation: "Speed: 180 / 3 = 60 mph. Distance in 5 hours: 60 × 5 = 300 miles.",
  },
  {
    id: 15,
    level: "intermediate",
    text: "A water tank holds 500 liters. A pump fills it at a rate of 25 liters per minute. How many minutes will it take to fill the tank if it is currently half full?",
    answer: "10",
    explanation: "Tank is half full, so 250 liters are needed. Time: 250 / 25 = 10 minutes.",
  },
  {
    id: 16,
    level: "intermediate",
    text: "The price of a jacket was $80. It was on sale for 20% off. What was the sale price?",
    answer: "64",
    explanation: "Discount: 80 × 0.20 = 16. Sale price: 80 - 16 = 64.",
  },
  {
    id: 27,
    level: "intermediate",
    text: "A room is 6 meters long and 4 meters wide. How many liters of paint are needed to cover the floor if one liter covers 8 square meters?",
    answer: "3",
    explanation: "Area = 6 × 4 = 24 sq meters. Liters needed = 24 / 8 = 3 liters.",
  },
  {
    id: 28,
    level: "intermediate",
    text: "A teacher has 48 pieces of candy. She wants to divide them equally among 6 students. However, 2 students are absent. How many pieces will each present student get now?",
    answer: "12",
    explanation: "Present students: 6 - 2 = 4. Candy per student: 48 / 4 = 12.",
  },
  {
    id: 29,
    level: "intermediate",
    text: "A plane flies 2,400 miles in 4 hours. How many miles will it fly in 7 hours at the same speed?",
    answer: "4200",
    explanation: "Speed = 2,400 / 4 = 600 mph. Distance = 600 × 7 = 4,200 miles.",
  },
  {
    id: 30,
    level: "intermediate",
    text: "A grocery store sells a bag of 5 apples for $3. How much would it cost to buy 25 apples?",
    answer: "15",
    explanation: "Bags needed: 25 / 5 = 5 bags. Cost: 5 × $3 = $15.",
  },
  {
    id: 31,
    level: "intermediate",
    text: "In a garden, a gardener plants 8 rows of flowers with 12 flowers in each row. If 15 flowers die, how many flowers are left?",
    answer: "81",
    explanation: "Total planted: 8 × 12 = 96. Remaining: 96 - 15 = 81.",
  },

  // ADVANCED
  {
    id: 5,
    level: "advanced",
    text: "A train travels at a constant speed of 80 kilometers per hour. If the train travels for 3 hours and 45 minutes, how many total kilometers will it cover?",
    answer: "300",
    explanation: "3 hours and 45 minutes is 3.75 hours. Distance = Speed × Time = 80 × 3.75 = 300 km.",
  },
  {
    id: 6,
    level: "advanced",
    text: "The regular price of a video game is $60. During a summer sale, it is discounted by 25%. What is the sale price of the game in dollars?",
    answer: "45",
    explanation: "Discount amount: 25% of $60 = 0.25 × 60 = $15. Sale price: $60 - $15 = $45.",
  },
  {
    id: 17,
    level: "advanced",
    text: "A company's revenue increased from $120,000 to $150,000. What was the percentage increase in revenue?",
    answer: "25",
    explanation: "Increase: 150,000 - 120,000 = 30,000. Percentage: (30,000 / 120,000) × 100 = 25%.",
  },
  {
    id: 18,
    level: "advanced",
    text: "A cylindrical container has a radius of 3cm and a height of 10cm. Using 3 for the value of Pi (π), what is the volume of the container in cubic centimeters?",
    answer: "270",
    explanation: "Volume = Pi × r² × h. Volume = 3 × (3²) × 10 = 3 × 9 × 10 = 270 cm³.",
  },
  {
    id: 19,
    level: "advanced",
    text: "An athlete runs 100 meters in 12.5 seconds. What is their average speed in meters per second?",
    answer: "8",
    explanation: "Speed = Distance / Time. Speed = 100 / 12.5 = 8 m/s.",
  },
  {
    id: 20,
    level: "advanced",
    text: "If a computer can process 2.5 million instructions per second, how many total instructions can it process in 4 minutes? (Answer in millions)",
    answer: "600",
    explanation: "4 minutes = 240 seconds. Total: 2.5 million × 240 = 600 million.",
  },
  {
    id: 21,
    level: "advanced",
    text: "A group of 5 students took a test. Their scores were 85, 92, 78, 90, and 85. What was the average score of the group?",
    answer: "86",
    explanation: "Total sum: 85+92+78+90+85 = 430. Average: 430 / 5 = 86.",
  },
  {
    id: 32,
    level: "advanced",
    text: "John deposits $2,000 into a savings account with a simple annual interest rate of 5%. How much total money will be in the account after 3 years?",
    answer: "2300",
    explanation: "Interest = Principal × Rate × Time. Interest = 2000 × 0.05 × 3 = $300. Total = 2000 + 300 = $2,300.",
  },
  {
    id: 33,
    level: "advanced",
    text: "A recipe for 4 people requires 2.5 cups of flour. If you want to make the same recipe for 10 people, how many cups of flour do you need?",
    answer: "6.25",
    explanation: "Flour per person = 2.5 / 4 = 0.625. For 10 people = 0.625 × 10 = 6.25 cups.",
  },
  {
    id: 34,
    level: "advanced",
    text: "An object is dropped from a height. Its velocity increases by 9.8 meters per second every second. What will its velocity be after 4.5 seconds? (Ignore air resistance)",
    answer: "44.1",
    explanation: "Velocity = acceleration × time. Velocity = 9.8 × 4.5 = 44.1 m/s.",
  },
  {
    id: 35,
    level: "advanced",
    text: "The median of a set of 5 numbers is 12. If the numbers are 8, 10, 12, x, and 20, and they are in increasing order, what is the smallest possible integer value for x?",
    answer: "12",
    explanation: "In an increasing set of 5, the median is the 3rd number. Since the 3rd number is 12, x must be greater than or equal to 12. The smallest integer is 12.",
  },
  {
    id: 36,
    level: "advanced",
    text: "An L-shaped room is made of two rectangles. One is 5m x 4m and the other is 3m x 2m. They do not overlap. What is the total area of the floor in square meters?",
    answer: "26",
    explanation: "Area 1 = 5 × 4 = 20. Area 2 = 3 × 2 = 6. Total area = 20 + 6 = 26 sq meters.",
  },
];

const MISSION_TIME = 180; // 3 minutes

export function MathMissionSituations({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [problem, setProblem] = React.useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(MISSION_TIME);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [usedIds, setUsedIds] = React.useState<number[]>([]);
  
  const canvasRef = React.useRef<ReactSketchCanvasRef>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const startRound = (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    
    setTimeout(() => {
        const pool = PROBLEMS.filter(p => p.level === level && !usedIds.includes(p.id));
        const finalPool = pool.length > 0 ? pool : PROBLEMS.filter(p => p.level === level);
        const selected = finalPool[Math.floor(Math.random() * finalPool.length)];
        
        setProblem(selected);
        setUsedIds(prev => [...prev, selected.id]);
        setUserAnswer("");
        setIsCorrect(null);
        setTimeLeft(MISSION_TIME);
        setGameState("playing");
        canvasRef.current?.clearCanvas();
    }, 1000);
  };

  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      handleCheckAnswer();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, timeLeft]);

  const handleCheckAnswer = () => {
    if (!problem) return;
    const correct = userAnswer.trim() === problem.answer;
    setIsCorrect(correct);
    setGameState("answered");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSkip = () => {
    if (!problem) return;
    setIsCorrect(false);
    setGameState("answered");
    if (timerRef.current) clearInterval(timerRef.current);
    toast({ title: "Mission Skipped", description: "Review the correct answer before proceeding." });
  };

  const Icon = game?.icon || ScrollText;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-5xl mx-auto bg-card shadow-xl"
      )}>
      <CardHeader className="text-center relative border-b border-white/5">
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
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{game?.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game?.description}</CardDescription>
        {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty' && (
            <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="uppercase">{difficulty}</Badge>
                <div className={cn("flex items-center gap-2 font-mono font-bold", timeLeft < 30 ? "text-red-500 animate-pulse" : "text-primary")}>
                    <Timer className="h-4 w-4" />
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
            </div>
        )}
      </CardHeader>

      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center p-6",
          isFullscreen ? "min-h-[75vh]" : "min-h-[35rem]"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Are you ready to crack the situational codes?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Initialize Mission
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-[2rem] border-4 border-primary/20 shadow-inner mx-auto",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-xl"
             )}>
                <h3 className={cn("font-black uppercase tracking-widest text-center mb-4 text-primary", isFullscreen ? "text-4xl" : "text-xl")}>OPERATIONAL MANUAL</h3>
                <div className={cn("text-left space-y-4 font-medium", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Read the situational problem carefully.</p>
                    <p>2. Use the digital sketchpad to map out your calculations.</p>
                    <p>3. You have exactly <strong>3 minutes</strong> to input your final answer.</p>
                    <p>4. Only numerical answers are required.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Proceed to Selection</Button>
            </div>
        )}

        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-8 w-full max-md">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Choose Challenge Tier</p>
                <div className="grid grid-cols-1 gap-4 w-full">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button key={level} onClick={() => startRound(level as SkillLevel)} size="lg" variant="outline" className={cn("h-20 text-2xl font-black uppercase tracking-widest border-4 transition-all hover:scale-105", isFullscreen && "h-24 rounded-3xl")}>{level}</Button>
                    ))}
                </div>
            </div>
        )}

        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse font-black uppercase tracking-[0.2em]", isFullscreen ? "text-3xl" : "text-lg")}>Synthesizing word problem...</p>
            </div>
        )}

        {(gameState === "playing" || gameState === "answered") && problem && (
            <div className={cn("w-full flex flex-col gap-6", isFullscreen ? "max-w-7xl h-full" : "max-w-5xl h-full")}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                    {/* Left Side: Problem */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className={cn(
                            "bg-muted/20 backdrop-blur-sm p-8 rounded-[2rem] border-4 border-primary/20 text-left shadow-inner",
                            isFullscreen ? "min-h-[300px]" : "min-h-[200px]"
                        )}>
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest mb-2 block">Mission Briefing:</span>
                            <p className={cn("font-bold leading-relaxed", isFullscreen ? "text-3xl" : "text-lg")}>{problem.text}</p>
                            
                            {gameState === 'answered' && (
                                <div className="mt-6 pt-6 border-t-2 border-primary/20 animate-in fade-in slide-in-from-top-4">
                                    <span className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-2 block">Mission Objective Answer:</span>
                                    <p className={cn("font-black text-green-600 italic", isFullscreen ? "text-6xl" : "text-4xl")}>{problem.answer}</p>
                                </div>
                            )}
                        </div>

                        {gameState === 'playing' ? (
                            <div className="space-y-4 animate-in slide-in-from-left duration-500 delay-200">
                                <label className="font-black uppercase tracking-widest text-xs text-muted-foreground">Input Final Result:</label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder="Value..."
                                        className={cn("text-center font-black text-2xl h-16 border-4 focus-visible:ring-primary shadow-lg bg-card", isFullscreen && "h-20 text-4xl")}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                                    />
                                    <Button onClick={handleCheckAnswer} size="lg" className={cn("h-16 w-16 p-0 shadow-lg", isFullscreen && "h-20 w-20")}>
                                        <Send className={cn(isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                                    </Button>
                                </div>
                                <Button variant="ghost" onClick={handleSkip} className={cn("w-full font-black uppercase text-xs tracking-widest opacity-50 hover:opacity-100", isFullscreen && "text-xl h-12")}>
                                    <SkipForward className="mr-2 h-4 w-4" /> Skip Mission
                                </Button>
                            </div>
                        ) : (
                            <Alert variant={isCorrect ? "default" : "destructive"} className={cn("border-4 rounded-[2rem] shadow-2xl animate-in zoom-in", isFullscreen && "p-10")}>
                                {isCorrect ? <CheckCircle className={cn(isFullscreen ? "h-12 w-12" : "h-6 w-6")} /> : <XCircle className={cn(isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                                <AlertTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>{isCorrect ? "MISSION SUCCESS!" : "CALCULATION ERROR!"}</AlertTitle>
                                <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                                    <p className="mb-4">Expected Result: <strong className="text-primary text-2xl">{problem.answer}</strong></p>
                                    <p className="opacity-80 border-t-2 border-current/10 pt-4 font-medium"><strong>Forensics:</strong> {problem.explanation}</p>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Right Side: Sketchpad */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="flex justify-between items-center px-4">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Scratchpad Interface</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => canvasRef.current?.undo()} className="h-8 px-2"><Undo className="h-4 w-4 mr-1"/> Undo</Button>
                                <Button variant="outline" size="sm" onClick={() => canvasRef.current?.clearCanvas()} className="h-8 px-2 text-destructive"><Eraser className="h-4 w-4 mr-1"/> Wipe</Button>
                            </div>
                        </div>
                        <div className={cn(
                            "w-full bg-white rounded-[2rem] border-4 border-foreground/10 overflow-hidden shadow-2xl",
                            isFullscreen ? "h-[55vh]" : "h-[30rem]"
                        )}>
                            <DynamicCanvas
                                ref={canvasRef}
                                strokeColor="#000000"
                                strokeWidth={4}
                                className="!h-full !w-full"
                                width="100%"
                                height="100%"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {gameState === "finished" && (
            <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className={cn("text-amber-400 drop-shadow-xl", isFullscreen ? "h-48 w-48" : "h-24 w-24")}/>
                <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-8xl" : "text-5xl")}>Simulation Over</h2>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-24 px-20 text-4xl rounded-3xl")}>
                    <Repeat className="mr-4 w-10 h-10" /> New Scenario
                </Button>
            </div>
        )}
      </CardContent>

      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8 border-t border-white/5 bg-black/5 p-8", isFullscreen && "max-w-7xl mx-auto w-full pb-16 bg-transparent border-none")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Abort Mission</Link>
        </Button>
        {gameState === 'answered' && (
            <Button onClick={() => startRound(difficulty)} size={isFullscreen ? "lg" : "default"} className={cn("bg-primary text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
                Next Scenario <Repeat className={cn("ml-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
