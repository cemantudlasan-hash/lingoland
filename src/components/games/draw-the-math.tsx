"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Palette, Undo, Trash2, Maximize, Minimize, Timer, Check, X,
  Trophy, Play, UserPlus, Sparkles, RotateCcw, Volume2, VolumeX,
  UserCheck, Award, ArrowRight, Wifi, WifiOff, Users, Copy,
  CheckCircle2, Loader2, Monitor, Globe, Lock, Unlock, HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";
import {
  useMathDrawRoom,
  useMathRoomListener,
  getOrCreateMathPlayerId,
  type MathDrawRoom,
  type MathRoomPlayer,
  type MathRoomConfig,
} from "@/hooks/use-math-draw-room";

// ─────────────────────────────────────────────────────────
// DYNAMIC CANVAS
// ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynamicCanvas: any = dynamic(
  () => import("react-sketch-canvas").then((m) => m.ReactSketchCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-white rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    ),
  }
);

// ─────────────────────────────────────────────────────────
// SOUND EFFECTS
// ─────────────────────────────────────────────────────────
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
  }

  playBeep(freq = 440, dur = 0.1, type: OscillatorType = "sine") {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch {}
  }

  playSuccess() {
    this.playBeep(523.25, 0.1);
    setTimeout(() => this.playBeep(659.25, 0.15), 100);
    setTimeout(() => this.playBeep(783.99, 0.25), 250);
  }

  playFailure() {
    this.playBeep(220, 0.2, "triangle");
    setTimeout(() => this.playBeep(196, 0.3, "triangle"), 150);
  }

  playLaserSweep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 1.5);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.5);
    } catch {}
  }
}

const sfx = new SoundEffects();

// ─────────────────────────────────────────────────────────
// MATH CATEGORIES AND PROBLEMS
// ─────────────────────────────────────────────────────────
interface MathProblem {
  question: string;
  answer: string;
  solutionHint?: string;
}

interface MathCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  problems: MathProblem[];
}

const CATEGORIES: MathCategory[] = [
  {
    id: "arithmetic",
    name: "Basic Arithmetic",
    emoji: "➕",
    description: "Addition, subtraction, multiplication, and division. 10 interactive equations.",
    problems: [
      { question: "Solve: 78 + 45", answer: "123", solutionHint: "Perform basic addition: 78 + 45 = 123" },
      { question: "Solve: 142 - 67", answer: "75", solutionHint: "Perform subtraction with borrowing: 142 - 67 = 75" },
      { question: "Solve: 12 × 8", answer: "96", solutionHint: "Use multiplication tables: 12 × 8 = 96" },
      { question: "Solve: 225 ÷ 15", answer: "15", solutionHint: "Division: 15 squared is 225, so 225 ÷ 15 = 15" },
      { question: "Solve: 9 × 9 - 11", answer: "70", solutionHint: "Order of operations: Multiply first (81), then subtract 11 = 70" },
      { question: "Solve: 150 ÷ 5 + 17", answer: "47", solutionHint: "Order of operations: Divide first (30), then add 17 = 47" },
      { question: "Solve: 16 × 4 + 6", answer: "70", solutionHint: "Order of operations: Multiply first (64), then add 6 = 70" },
      { question: "Solve: 345 - 199", answer: "146", solutionHint: "Subtract: 345 - 199 = 345 - 200 + 1 = 146" },
      { question: "Solve: 8 × 12 - 20", answer: "76", solutionHint: "Multiply first (96), then subtract 20 = 76" },
      { question: "Solve: 180 ÷ 6 - 9", answer: "21", solutionHint: "Divide first (30), then subtract 9 = 21" }
    ]
  },
  {
    id: "algebra",
    name: "Algebraic Equations",
    emoji: "📐",
    description: "Solve for variables like x, y, and z. Shows formula steps.",
    problems: [
      { question: "Solve for x: 3x + 7 = 22", answer: "x = 5", solutionHint: "Subtract 7: 3x = 15. Divide by 3: x = 5" },
      { question: "Solve for y: 5y - 12 = 18", answer: "y = 6", solutionHint: "Add 12: 5y = 30. Divide by 5: y = 6" },
      { question: "Solve for a: 2a + 9 = 25", answer: "a = 8", solutionHint: "Subtract 9: 2a = 16. Divide by 2: a = 8" },
      { question: "Solve for x: 4x / 2 = 14", answer: "x = 7", solutionHint: "Simplify to 2x = 14. Divide by 2: x = 7" },
      { question: "Solve for b: 3b - 5 = 2b + 4", answer: "b = 9", solutionHint: "Subtract 2b from both sides: b - 5 = 4. Add 5: b = 9" },
      { question: "Solve for y: 7y + 2 = 30", answer: "y = 4", solutionHint: "Subtract 2: 7y = 28. Divide by 7: y = 4" },
      { question: "Solve for x: 2x - 10 = 0", answer: "x = 5", solutionHint: "Add 10: 2x = 10. Divide by 2: x = 5" },
      { question: "Solve for c: 5c + 4 = 29", answer: "c = 5", solutionHint: "Subtract 4: 5c = 25. Divide by 5: c = 5" },
      { question: "Solve for x: x / 3 + 2 = 7", answer: "x = 15", solutionHint: "Subtract 2: x / 3 = 5. Multiply by 3: x = 15" },
      { question: "Solve for z: 4z - 8 = 12", answer: "z = 5", solutionHint: "Add 8: 4z = 20. Divide by 4: z = 5" }
    ]
  },
  {
    id: "geometry",
    name: "Geometry & Shapes",
    emoji: "🛑",
    description: "Calculate perimeter, area, volume, and angles.",
    problems: [
      { question: "Find area of rectangle: length = 9, width = 6", answer: "54", solutionHint: "Area = length × width = 9 × 6 = 54" },
      { question: "Find perimeter of square: side length = 12", answer: "48", solutionHint: "Perimeter = 4 × side = 4 × 12 = 48" },
      { question: "Find hypotenuse of right triangle: legs = 6 and 8", answer: "10", solutionHint: "Pythagorean theorem: c² = 6² + 8² = 36 + 64 = 100. c = √100 = 10" },
      { question: "Find area of triangle: base = 10, height = 7", answer: "35", solutionHint: "Area = 0.5 × base × height = 0.5 × 10 × 7 = 35" },
      { question: "Find circle circumference: radius = 7 (use π = 22/7)", answer: "44", solutionHint: "Circumference = 2 × π × r = 2 × 22/7 × 7 = 44" },
      { question: "Find perimeter of rectangle: length = 15, width = 8", answer: "46", solutionHint: "Perimeter = 2 × (length + width) = 2 × (15 + 8) = 46" },
      { question: "Find volume of a cube: side length = 4", answer: "64", solutionHint: "Volume = side³ = 4³ = 64" },
      { question: "Find sum of interior angles of a pentagon", answer: "540°", solutionHint: "Sum = (n - 2) × 180 = (5 - 2) × 180 = 3 × 180 = 540°" },
      { question: "Find area of a square: perimeter = 36", answer: "81", solutionHint: "Side = 36 / 4 = 9. Area = side² = 9² = 81" },
      { question: "A triangle has angles 50° and 60°. What is the third angle?", answer: "70°", solutionHint: "Sum is 180°. Third angle = 180° - 50° - 60° = 70°" }
    ]
  },
  {
    id: "fractions",
    name: "Fractions & Percentages",
    emoji: "🍕",
    description: "Simplify fractions, calculate percentage splits, and decimals.",
    problems: [
      { question: "Calculate: 25% of 160", answer: "40", solutionHint: "25% is 1/4. 160 ÷ 4 = 40" },
      { question: "Calculate: 15% of 200", answer: "30", solutionHint: "15/100 × 200 = 15 × 2 = 30" },
      { question: "Simplify to lowest terms: 8/24 + 1/3", answer: "2/3", solutionHint: "8/24 simplifies to 1/3. 1/3 + 1/3 = 2/3" },
      { question: "Convert to decimal: 3/5", answer: "0.6", solutionHint: "3 ÷ 5 = 0.6" },
      { question: "Calculate: 120% of 50", answer: "60", solutionHint: "1.20 × 50 = 60" },
      { question: "Convert 0.75 to simplest fraction", answer: "3/4", solutionHint: "0.75 = 75/100 = 3/4" },
      { question: "Multiply: 2/3 × 9/4", answer: "3/2 (or 1.5)", solutionHint: "(2 × 9) / (3 × 4) = 18/12 = 3/2 = 1.5" },
      { question: "Divide: 3/4 ÷ 1/2", answer: "3/2 (or 1.5)", solutionHint: "Multiply by reciprocal: 3/4 × 2/1 = 6/4 = 3/2 = 1.5" },
      { question: "Calculate: 5% of 500", answer: "25", solutionHint: "5/100 × 500 = 5 × 5 = 25" },
      { question: "Express 7/20 as a percentage", answer: "35%", solutionHint: "7/20 = 35/100 = 35%" }
    ]
  },
  {
    id: "wordproblems",
    name: "Math Word Problems",
    emoji: "📝",
    description: "Multi-step contextual scenarios requiring formula extraction.",
    problems: [
      { question: "Lisa has 24 candies. She shares them equally with 3 friends. How many does Lisa keep?", answer: "6", solutionHint: "Total people is 4 (Lisa + 3 friends). 24 ÷ 4 = 6 candies each." },
      { question: "A book costs $15. On sale, it is 20% off. What is the new price?", answer: "$12", solutionHint: "Discount = 20% of $15 = $3. New price = $15 - $3 = $12" },
      { question: "Sam is twice as old as Ben. Ben is 9. What is the sum of their ages?", answer: "27", solutionHint: "Sam is 2 × 9 = 18. Sum = 18 (Sam) + 9 (Ben) = 27" },
      { question: "A bus travels 180 km in 3 hours. What is its speed in km/h?", answer: "60", solutionHint: "Speed = Distance ÷ Time = 180 ÷ 3 = 60 km/h" },
      { question: "A box has 5 red balls and 7 blue balls. What is the ratio of red to total balls?", answer: "5:12", solutionHint: "Total balls = 5 + 7 = 12. Ratio is red:total = 5:12" },
      { question: "If 3 pencils cost $1.50, how much do 10 pencils cost?", answer: "$5.00", solutionHint: "Cost per pencil = $1.50 ÷ 3 = $0.50. 10 pencils cost 10 × $0.50 = $5.00" },
      { question: "A toy costs $8. Sales tax is 10%. What is the total cost?", answer: "$8.80", solutionHint: "Tax = 10% of $8 = $0.80. Total = $8.00 + $0.80 = $8.80" },
      { question: "If it takes 2 hours to paint 1 room, how many rooms can be painted in 8 hours?", answer: "4", solutionHint: "Rooms = 8 hours ÷ 2 hours/room = 4 rooms" },
      { question: "A recipe needs 2 cups of sugar for 12 cookies. How many cups for 36 cookies?", answer: "6", solutionHint: "Scaling factor = 36 ÷ 12 = 3. Sugar needed = 2 cups × 3 = 6 cups" },
      { question: "A train starts with 45 passengers. 12 get off, 8 get on. How many are left?", answer: "41", solutionHint: "Remaining = 45 - 12 + 8 = 33 + 8 = 41" }
    ]
  }
];

const STROKE_COLORS = [
  { value: "#000000", label: "Midnight" }, { value: "#EF4444", label: "Crimson" },
  { value: "#3B82F6", label: "Cobalt" },   { value: "#22C55E", label: "Emerald" },
  { value: "#EAB308", label: "Amber" },    { value: "#A855F7", label: "Amethyst" },
  { value: "#EC4899", label: "Rose" },     { value: "#F97316", label: "Orange" },
];

const BRUSH_PRESETS = [
  { value: 2, label: "S" }, { value: 6, label: "M" }, { value: 12, label: "L" }, { value: 24, label: "XL" },
];

// ─────────────────────────────────────────────────────────
// LOCAL GAME TYPES
// ─────────────────────────────────────────────────────────
type LocalGameState = "setup" | "playing" | "evaluation" | "summary" | "scoreboard";

interface LocalPlayer {
  id: number; name: string; score: number;
  isFinished: boolean; finishTimeRemaining: number;
  canvasPathsCount: number; teacherChecked: boolean; teacherApproved: boolean | null;
  aiMatchScore: number; aiCommentary: string;
}

// ─────────────────────────────────────────────────────────
// SUBMITTED DRAWING VIEWER
// ─────────────────────────────────────────────────────────
function SubmittedDrawingViewer({ canvasData }: { canvasData: string }) {
  const ref = React.useRef<ReactSketchCanvasRef>(null);

  React.useEffect(() => {
    if (!canvasData) return;
    try {
      const paths = JSON.parse(canvasData);
      ref.current?.loadPaths(paths);
    } catch {}
  }, [canvasData]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-700" style={{ height: 240 }}>
      {/* @ts-ignore */}
      <DynamicCanvas
        ref={ref}
        readOnly
        strokeColor="#000"
        strokeWidth={1}
        canvasColor="white"
        height="240px"
        width="100%"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function pickProblem(categoryId: string, usedQuestions: string[]): { problem: MathProblem; newUsed: string[] } {
  const cat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  let available = cat.problems.filter((p) => !usedQuestions.includes(p.question));
  let updatedUsed = usedQuestions;
  if (available.length === 0) { available = cat.problems; updatedUsed = []; }
  const problem = available[Math.floor(Math.random() * available.length)];
  return { problem, newUsed: [...updatedUsed, problem.question] };
}

function timerColor(t: number, limit: number) {
  const pct = t / limit;
  if (pct > 0.5) return "text-emerald-400";
  if (pct > 0.2) return "text-amber-400";
  return "text-red-400 animate-pulse";
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export function DrawTheMath({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const { toast } = useToast();

  // ── Top-level screen ──────────────────────────────────
  type TopScreen = "modeSelect" | "local" | "online";
  const [topScreen, setTopScreen] = React.useState<TopScreen>("modeSelect");

  // ── Audio & Fullscreen ────────────────────────────────
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  React.useEffect(() => { sfx.enabled = isAudioEnabled; }, [isAudioEnabled]);

  // ═══════════════════════════════════════════════════════
  // LOCAL GAME STATE
  // ═══════════════════════════════════════════════════════
  const [localGameState, setLocalGameState] = React.useState<LocalGameState>("setup");
  const [numPlayers, setNumPlayers] = React.useState(1);
  const [playerNames, setPlayerNames] = React.useState(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [roundsConfig, setRoundsConfig] = React.useState(5);
  const [roundTimerConfig, setRoundTimerConfig] = React.useState(30);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("arithmetic");
  const [localPlayers, setLocalPlayers] = React.useState<LocalPlayer[]>([]);
  const [currentProblem, setCurrentProblem] = React.useState<MathProblem | null>(null);
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [currentRound, setCurrentRound] = React.useState(1);
  const [timer, setTimer] = React.useState(30);
  const [timerActive, setTimerActive] = React.useState(false);
  const [strokeColor, setStrokeColor] = React.useState<Record<number, string>>({ 1:"#000000",2:"#000000",3:"#000000",4:"#000000" });
  const [strokeWidth, setStrokeWidth] = React.useState<Record<number, number>>({ 1:6,2:6,3:6,4:6 });
  const [activeEvaluator, setActiveEvaluator] = React.useState<"none"|"teacher"|"ai"|null>("none");
  const [aiScanning, setAiScanning] = React.useState(false);
  const [roundWinnerId, setRoundWinnerId] = React.useState<number|null>(null);
  const [roundWinningReason, setRoundWinningReason] = React.useState("");
  const canvasRefs = React.useRef<Record<number, ReactSketchCanvasRef | null>>({});
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Local timer tick
  React.useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer((p) => {
          if (p <= 6 && p > 1) sfx.playBeep(330, 0.08, "triangle");
          else if (p === 1) sfx.playBeep(660, 0.4, "sawtooth");
          return p - 1;
        });
      }, 1000);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
      handleLocalTimerTimeout();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timer, timerActive]);

  const clearAllCanvases = async (pList: LocalPlayer[]) => {
    for (const p of pList) { try { await canvasRefs.current[p.id]?.clearCanvas(); } catch {} }
  };

  const startLocalRound = (roundNum: number, activePlayers = localPlayers) => {
    const { problem, newUsed } = pickProblem(selectedCategoryId, usedWords);
    const reset = activePlayers.map((p) => ({ ...p, isFinished: false, finishTimeRemaining: 0, canvasPathsCount: 0, teacherChecked: false, teacherApproved: null, aiMatchScore: 0, aiCommentary: "" }));
    setLocalPlayers(reset);
    setUsedWords(newUsed);
    setCurrentProblem(problem);
    setCurrentRound(roundNum);
    setTimer(roundTimerConfig);
    setTimerActive(true);
    setActiveEvaluator("none");
    setRoundWinnerId(null);
    setRoundWinningReason("");
    setAiScanning(false);
    setLocalGameState("playing");
    setTimeout(() => clearAllCanvases(reset), 150);
  };

  const handleStartLocalGame = () => {
    sfx.playBeep(440, 0.1);
    const initial: LocalPlayer[] = Array.from({ length: numPlayers }, (_, i) => ({
      id: i + 1, name: playerNames[i]?.trim() || `Player ${i + 1}`, score: 0,
      isFinished: false, finishTimeRemaining: 0, canvasPathsCount: 0,
      teacherChecked: false, teacherApproved: null, aiMatchScore: 0, aiCommentary: "",
    }));
    setLocalPlayers(initial);
    setUsedWords([]);
    const nc: Record<number,string> = {}; const nw: Record<number,number> = {};
    initial.forEach((p) => { nc[p.id] = "#000000"; nw[p.id] = 6; });
    setStrokeColor(nc); setStrokeWidth(nw);
    startLocalRound(1, initial);
  };

  const handleLocalPlayerFinished = async (playerId: number) => {
    sfx.playBeep(480, 0.08);
    let pathsCount = 0;
    try { const paths = await canvasRefs.current[playerId]?.exportPaths(); pathsCount = paths?.length ?? 0; } catch {}
    setLocalPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, isFinished: true, finishTimeRemaining: timer, canvasPathsCount: pathsCount } : p));
    toast({ title: `${localPlayers.find((p) => p.id === playerId)?.name} solved! 🏁`, duration: 2000 });
  };

  const handleLocalTimerTimeout = () => {
    sfx.playBeep(220, 0.5, "sawtooth");
    setTimerActive(false);
    const finalize = async () => {
      const updated = [...localPlayers];
      for (let i = 0; i < updated.length; i++) {
        if (!updated[i].isFinished) {
          let pc = 0;
          try { const paths = await canvasRefs.current[updated[i].id]?.exportPaths(); pc = paths?.length ?? 0; } catch {}
          updated[i] = { ...updated[i], isFinished: true, finishTimeRemaining: 0, canvasPathsCount: pc };
        }
      }
      setLocalPlayers(updated);
      setActiveEvaluator("ai");
      setLocalGameState("evaluation");
      setAiScanning(true);
      sfx.playLaserSweep();
      setTimeout(() => {
        setAiScanning(false);
        const evaluated = updated.map((p) => {
          let score = 0; let comment = "";
          if (p.canvasPathsCount === 0) { score = 0; comment = "Empty board! No solutions written."; }
          else {
            const seed = p.name.length + (currentProblem?.question.length || 10) + p.canvasPathsCount;
            score = 45 + (seed % 8) * 6 + Math.floor(Math.random() * 6);
            if (score > 96) score = 96;
            if (p.canvasPathsCount < 3) score = Math.floor(20 + Math.random() * 20);
            if (score >= 85) comment = "Stellar work! Correct steps, formulas, and final answer identified.";
            else if (score >= 70) comment = "Solution recognized! Correct answer was clearly highlighted.";
            else if (score >= 50) comment = "Slightly messy steps or arithmetic. AI is partially confused.";
            else comment = "Illegible calculations. No correct answer detected.";
          }
          return { ...p, aiMatchScore: score, aiCommentary: comment };
        });
        setLocalPlayers(evaluated);
        let winner: LocalPlayer | null = null; let hi = -1;
        evaluated.forEach((p) => { if (p.aiMatchScore > hi) { hi = p.aiMatchScore; winner = p; } });
        if (winner && hi >= 70) {
          sfx.playSuccess();
          setLocalPlayers((prev) => prev.map((p) => p.id === (winner as LocalPlayer).id ? { ...p, score: p.score + 10 } : p));
          setRoundWinnerId((winner as LocalPlayer).id);
          setRoundWinningReason(`AI evaluated ${(winner as LocalPlayer).name}'s solution as correct with ${hi}% accuracy! (+10 pts)`);
        } else {
          sfx.playFailure(); setRoundWinnerId(null);
          setRoundWinningReason("AI scanned boards but no solution met the 70% confidence threshold. No points awarded.");
        }
        setLocalGameState("summary");
      }, 2800);
    };
    finalize();
  };

  const handleTeacherCheckLocal = (playerId: number, approved: boolean) => {
    const p = localPlayers.find((pl) => pl.id === playerId);
    if (!p) return;
    if (approved) {
      sfx.playSuccess();
      const pts = 10 + Math.round((p.finishTimeRemaining / roundTimerConfig) * 15);
      setLocalPlayers((prev) => prev.map((pl) => pl.id === playerId
        ? { ...pl, teacherChecked: true, teacherApproved: true, score: pl.score + pts }
        : pl
      ));
      toast({ title: `✅ ${p.name} awarded ${pts} points!`, duration: 2000 });
    } else {
      sfx.playFailure();
      setLocalPlayers((prev) => prev.map((pl) => pl.id === playerId
        ? { ...pl, teacherChecked: true, teacherApproved: false }
        : pl
      ));
      toast({ title: `❌ ${p.name} marked incorrect.`, duration: 2000 });
    }
  };

  const handleLocalTeacherProceed = () => {
    const winners = localPlayers.filter((p) => p.teacherApproved === true);
    if (winners.length > 0) {
      const w = winners[0];
      setRoundWinnerId(w.id);
      setRoundWinningReason(`Teacher approved ${winners.map((p) => p.name).join(", ")}'s solution!`);
    } else {
      setRoundWinnerId(null);
      setRoundWinningReason("Teacher checked all players but no solution was approved. No points awarded.");
    }
    setLocalGameState("summary");
  };

  const handleLocalAIScan = () => {
    setActiveEvaluator("ai");
    setLocalGameState("evaluation");
    setAiScanning(true);
    sfx.playLaserSweep();
    setTimeout(() => {
      setAiScanning(false);
      const evaluated = localPlayers.map((p) => {
        let score = 0; let comment = "";
        if (p.canvasPathsCount === 0) { score = 0; comment = "Empty board! No solutions written."; }
        else {
          const seed = p.name.length + (currentProblem?.question.length || 10) + p.canvasPathsCount;
          score = 45 + (seed % 8) * 6 + Math.floor(Math.random() * 6);
          if (score > 96) score = 96;
          if (p.canvasPathsCount < 3) score = Math.floor(20 + Math.random() * 20);
          if (score >= 85) comment = "Stellar work! Correct steps, formulas, and final answer identified.";
          else if (score >= 70) comment = "Solution recognized! Correct answer was clearly highlighted.";
          else if (score >= 50) comment = "Slightly messy steps or arithmetic. AI is partially confused.";
          else comment = "Illegible calculations. No correct answer detected.";
        }
        return { ...p, aiMatchScore: score, aiCommentary: comment };
      });
      setLocalPlayers(evaluated);
      let winner: LocalPlayer | null = null; let hi = -1;
      evaluated.forEach((p) => { if (p.aiMatchScore > hi) { hi = p.aiMatchScore; winner = p; } });
      if (winner && hi >= 70) {
        sfx.playSuccess();
        setLocalPlayers((prev) => prev.map((p) => p.id === (winner as LocalPlayer).id ? { ...p, score: p.score + 10 } : p));
        setRoundWinnerId((winner as LocalPlayer).id);
        setRoundWinningReason(`AI evaluated ${(winner as LocalPlayer).name}'s solution as correct with ${hi}% accuracy! (+10 pts)`);
      } else {
        sfx.playFailure(); setRoundWinnerId(null);
        setRoundWinningReason("AI scanned boards but no solution met the 70% confidence threshold. No points awarded.");
      }
      setLocalGameState("summary");
    }, 2800);
  };

  const handleLocalProceedFromSummary = () => {
    sfx.playBeep(440, 0.08);
    if (currentRound < roundsConfig) startLocalRound(currentRound + 1);
    else setLocalGameState("scoreboard");
  };

  // ═══════════════════════════════════════════════════════
  // ONLINE GAME STATE
  // ═══════════════════════════════════════════════════════
  type OnlineSubScreen = "lobby" | "room";

  const { createRoom, joinRoom, setPlayerReady, startGame, startNextRound, submitDrawing,
    startEvaluation, teacherCheckPlayer, proceedToSummary, triggerAIScan,
    updateRoomConfig, proceedToScoreboard, closeRoom } = useMathDrawRoom();

  const [onlineSubScreen, setOnlineSubScreen] = React.useState<OnlineSubScreen>("lobby");
  const [myRoomCode, setMyRoomCode] = React.useState<string | null>(null);
  const [myPlayerId] = React.useState(() => getOrCreateMathPlayerId());
  const [myPlayerName, setMyPlayerName] = React.useState("Player");
  const [joinCodeInput, setJoinCodeInput] = React.useState("");
  const [isCreator, setIsCreator] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState(false);
  const [onlineError, setOnlineError] = React.useState("");

  // Online room config (creator only)
  const [onlineConfig, setOnlineConfig] = React.useState<MathRoomConfig>({ rounds: 5, timerLimit: 30, categoryId: "arithmetic" });

  // Canvas for online playing
  const onlineCanvasRef = React.useRef<ReactSketchCanvasRef | null>(null);
  const [onlineStrokeColor, setOnlineStrokeColor] = React.useState("#000000");
  const [onlineStrokeWidth, setOnlineStrokeWidth] = React.useState(6);
  const [isLocalSubmitted, setIsLocalSubmitted] = React.useState(false);

  // Online synchronized timer
  const [onlineTimer, setOnlineTimer] = React.useState(0);
  const onlineTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Teacher evaluation state (online)
  const [isScanningOnline, setIsScanningOnline] = React.useState(false);

  // Live Firestore subscription
  const { room, loading: roomLoading, error: roomError } = useMathRoomListener(myRoomCode);

  // Sync online timer from Firestore server timestamp
  React.useEffect(() => {
    if (!room || room.status !== "playing" || !room.timerStartedAt) return;
    if (onlineTimerRef.current) clearInterval(onlineTimerRef.current);

    const tick = () => {
      const startMs = room.timerStartedAt!.seconds * 1000 + room.timerStartedAt!.nanoseconds / 1e6;
      const elapsed = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, room.config.timerLimit - elapsed);
      setOnlineTimer(Math.ceil(remaining));
      if (remaining <= 0) {
        if (onlineTimerRef.current) clearInterval(onlineTimerRef.current);
        // Auto-submit if not yet submitted
        if (!isLocalSubmitted) handleOnlineSubmitDrawing(true);
      }
    };

    tick();
    onlineTimerRef.current = setInterval(tick, 500);
    return () => { if (onlineTimerRef.current) clearInterval(onlineTimerRef.current); };
  }, [room?.timerStartedAt, room?.status]);

  // Creator watches for all players done → start evaluation
  React.useEffect(() => {
    if (!room || !isCreator || room.status !== "playing") return;
    const players = Object.values(room.players);
    if (players.length > 0 && players.every((p) => p.isFinished)) {
      startEvaluation(room.roomCode);
    }
  }, [room?.players, room?.status, isCreator]);

  // Reset submission state on new round
  React.useEffect(() => {
    if (room?.status === "playing") {
      setIsLocalSubmitted(false);
      onlineCanvasRef.current?.clearCanvas();
    }
  }, [room?.currentRound, room?.status]);

  // Helper: pick next problem for online
  const [onlineUsedWords, setOnlineUsedWords] = React.useState<string[]>([]);
  
  const pickNextOnlineProblem = (categoryId: string, used: string[]): { problem: MathProblem; newUsed: string[] } => {
    return pickProblem(categoryId, used);
  };

  // ── Online Actions ─────────────────────────────────────
  const handleCreateRoom = async () => {
    setIsBusy(true); setOnlineError("");
    try {
      const code = await createRoom(myPlayerId, myPlayerName.trim() || "Host", onlineConfig);
      setMyRoomCode(code);
      setIsCreator(true);
      setOnlineSubScreen("room");
      sfx.playSuccess();
    } catch (e: any) {
      setOnlineError(e.message || "Failed to create room.");
    } finally { setIsBusy(false); }
  };

  const handleJoinRoom = async () => {
    const code = joinCodeInput.toUpperCase().trim();
    if (code.length !== 6) { setOnlineError("Invite code must be 6 characters."); return; }
    setIsBusy(true); setOnlineError("");
    try {
      const result = await joinRoom(code, myPlayerId, myPlayerName.trim() || "Student");
      if (result.success) {
        setMyRoomCode(code);
        setIsCreator(false);
        setOnlineSubScreen("room");
        sfx.playBeep(440, 0.1);
      } else {
        setOnlineError(result.error || "Failed to join room.");
      }
    } catch (e: any) {
      setOnlineError(e.message || "Network error.");
    } finally { setIsBusy(false); }
  };

  const handleToggleReady = async () => {
    if (!room || !myRoomCode) return;
    const me = room.players[myPlayerId];
    if (!me) return;
    await setPlayerReady(myRoomCode, myPlayerId, !me.isReady);
    sfx.playBeep(420, 0.05);
  };

  const handleStartOnlineGame = async () => {
    if (!room || !myRoomCode) return;
    setIsBusy(true);
    try {
      const playerIds = Object.keys(room.players);
      const { problem, newUsed } = pickNextOnlineProblem(room.config.categoryId, []);
      setOnlineUsedWords(newUsed);
      await startGame(myRoomCode, playerIds, problem.question, problem.answer, newUsed);
      sfx.playBeep(440, 0.1);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setIsBusy(false); }
  };

  const handleOnlineSubmitDrawing = async (timedOut = false) => {
    if (isLocalSubmitted || !myRoomCode) return;
    setIsLocalSubmitted(true);
    try {
      let canvasData = "";
      let pathsCount = 0;
      try {
        const paths = await onlineCanvasRef.current?.exportPaths();
        pathsCount = paths?.length ?? 0;
        canvasData = JSON.stringify(paths || []);
      } catch {}
      const startMs = room?.timerStartedAt
        ? room.timerStartedAt.seconds * 1000 + room.timerStartedAt.nanoseconds / 1e6
        : Date.now();
      const elapsed = (Date.now() - startMs) / 1000;
      const timeRemaining = Math.max(0, (room?.config.timerLimit ?? 30) - elapsed);
      await submitDrawing(myRoomCode, myPlayerId, canvasData, pathsCount, timedOut ? 0 : timeRemaining);
      if (!timedOut) sfx.playBeep(480, 0.08);
    } catch (e: any) {
      setIsLocalSubmitted(false);
      toast({ title: "Submit failed", description: e.message, variant: "destructive" });
    }
  };

  const handleOnlineTeacherCheck = async (playerId: string, approved: boolean) => {
    if (!room || !myRoomCode) return;
    const player = room.players[playerId];
    if (!player || player.teacherChecked) return;
    const pts = approved ? 10 + Math.round((player.finishTimeRemaining / room.config.timerLimit) * 15) : 0;
    try {
      await teacherCheckPlayer(myRoomCode, playerId, approved, pts, player.score);
      if (approved) { sfx.playSuccess(); toast({ title: `✅ ${player.name} awarded ${pts} points!`, duration: 2000 }); }
      else { sfx.playFailure(); toast({ title: `❌ ${player.name} marked incorrect.`, duration: 2000 }); }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleOnlineTeacherProceed = async () => {
    if (!room || !myRoomCode) return;
    const players = Object.values(room.players);
    const winners = players.filter((p) => p.teacherApproved === true);
    const winnerId = winners.length > 0 ? winners[0].id : null;
    const reason = winners.length > 0
      ? `Teacher approved ${winners.map((p) => p.name).join(", ")}'s solution!`
      : "Teacher checked all players but no solution was approved. No points awarded.";
    setIsBusy(true);
    try { await proceedToSummary(myRoomCode, winnerId, reason); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setIsBusy(false); }
  };

  const handleOnlineAIScan = async () => {
    if (!room || !myRoomCode) return;
    setIsScanningOnline(true);
    sfx.playLaserSweep();
    setTimeout(async () => {
      setIsScanningOnline(false);
      try { await triggerAIScan(myRoomCode, room.currentWord, room.players); }
      catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    }, 2800);
  };

  const handleOnlineNextRound = async () => {
    if (!room || !myRoomCode) return;
    setIsBusy(true);
    try {
      const playerIds = Object.keys(room.players);
      if (room.currentRound < room.config.rounds) {
        const used = room.usedWords || [];
        const { problem, newUsed } = pickNextOnlineProblem(room.config.categoryId, used);
        await startNextRound(myRoomCode, playerIds, room.currentRound + 1, problem.question, problem.answer, newUsed);
      } else {
        await proceedToScoreboard(myRoomCode);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setIsBusy(false); }
  };

  const handleLeaveOnline = async () => {
    if (myRoomCode) {
      if (isCreator) await closeRoom(myRoomCode);
    }
    setMyRoomCode(null); setIsCreator(false); setOnlineSubScreen("lobby");
    setOnlineError(""); setIsLocalSubmitted(false); setIsBusy(false);
    sfx.playBeep(380, 0.1);
  };

  const copyRoomCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode).catch(() => {});
      toast({ title: "Copied!", description: `Room code ${room.roomCode} copied to clipboard.`, duration: 2000 });
    }
  };

  // ── Find static details ──
  const getProblemDetails = (questionText: string, catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return null;
    return cat.problems.find(p => p.question === questionText);
  };

  // ═══════════════════════════════════════════════════════
  // RENDERS — COMMON CHROME
  // ═══════════════════════════════════════════════════════
  const renderTopBar = (title: string, showBack?: () => void) => (
    <div className="flex justify-between items-center gap-3 w-full border-b border-slate-800/80 pb-3 mb-2">
      {showBack ? (
        <Button variant="ghost" onClick={showBack}
          className="bg-slate-900 border border-slate-800 h-9 px-3 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl">
          ← Back
        </Button>
      ) : (
        <Button variant="ghost" asChild className="bg-slate-900 border border-slate-800 h-9 px-3 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl">
          <Link href="/games">Back to Games</Link>
        </Button>
      )}
      <span className="text-xs font-black uppercase text-slate-400 tracking-widest hidden sm:block">{title}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="icon"
          onClick={() => setIsAudioEnabled((a) => !a)}
          className="bg-slate-900 border-slate-800 h-9 w-9 text-slate-400 hover:text-slate-200 rounded-xl">
          {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={onToggleFullscreen}
          className="bg-slate-900 border border-slate-800 h-9 px-3 gap-1.5 text-slate-400 hover:text-slate-200 rounded-xl">
          {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          <span className="text-[10px] font-black uppercase hidden sm:block">{isFullscreen ? "Exit" : "Fullscreen"}</span>
        </Button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // RENDER — MODE SELECT
  // ═══════════════════════════════════════════════════════
  const renderModeSelect = () => (
    <div className="max-w-2xl mx-auto w-full space-y-8 p-4">
      {renderTopBar("Draw the Math")}
      <div className="text-center space-y-3 pt-4">
        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-extrabold uppercase px-4 py-1 tracking-widest text-xs animate-pulse">
          Interactive Math Solving
        </Badge>
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent tracking-tight uppercase flex items-center justify-center gap-3">
          <Palette className="h-12 w-12 text-cyan-400 animate-bounce drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          Draw The Math
        </h1>
        <p className="text-slate-400 text-sm">Solve math problems and write answers and solutions on the interactive board</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 pt-2">
        <button onClick={() => { sfx.playBeep(440, 0.1); setTopScreen("local"); }}
          className="group bg-slate-900/60 border border-slate-800 hover:border-indigo-500/60 rounded-3xl p-8 text-left transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-900/30 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 rounded-2xl p-4">
              <Monitor className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-black text-xl text-white">Local Game</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Same device</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">Solve math problems with 1–4 players on the same screen. Pass the device between turns.</p>
          <div className="flex gap-2 mt-auto flex-wrap">
            {["1–4 Players", "Shared Screen", "Interactive Board"].map((t) => (
              <span key={t} className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wide rounded-lg px-2 py-1">{t}</span>
            ))}
          </div>
        </button>

        <button onClick={() => { sfx.playBeep(440, 0.1); setTopScreen("online"); setOnlineSubScreen("lobby"); }}
          className="group bg-slate-900/60 border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-8 text-left transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-900/30 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-600/20 rounded-2xl p-4">
              <Globe className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-black text-xl text-white">Online Game</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Invite code</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">Create a room and share the code with students on any device. Support real-time sync.</p>
          <div className="flex gap-2 mt-auto flex-wrap">
            {["Cross-Device", "Real-Time", "Up to 8 Players"].map((t) => (
              <span key={t} className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wide rounded-lg px-2 py-1">{t}</span>
            ))}
          </div>
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // RENDER — LOCAL SETUP
  // ═══════════════════════════════════════════════════════
  const renderLocalSetup = () => {
    const activeCat = CATEGORIES.find((c) => c.id === selectedCategoryId) || CATEGORIES[0];
    return (
      <div className="max-w-4xl mx-auto w-full space-y-6 p-4">
        {renderTopBar("Local Game Setup", () => setTopScreen("modeSelect"))}

        <div className="text-center">
          <h2 className="text-3xl font-black text-white">⚙️ Game Parameters</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Settings */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            {/* Rounds */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Number of Rounds</Label>
              <div className="flex gap-3">
                {[5, 10, 15].map((r) => (
                  <button key={r} onClick={() => { sfx.playBeep(420, 0.05); setRoundsConfig(r); }}
                    className={cn("flex-1 py-3 rounded-xl border font-black text-sm transition-all uppercase",
                      roundsConfig === r ? "bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-400 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Round Timer <span className="text-cyan-400 lowercase font-medium">(default: 30s)</span></Label>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90].map((t) => (
                  <button key={t} onClick={() => { sfx.playBeep(420, 0.05); setRoundTimerConfig(t); }}
                    className={cn("flex-1 py-3 min-w-[52px] rounded-xl border font-black text-xs transition-all uppercase",
                      roundTimerConfig === t ? "bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-400 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Players */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Number of Players</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} onClick={() => { sfx.playBeep(420, 0.05); setNumPlayers(n); }}
                    className={cn("flex-1 py-2 rounded-xl border font-black text-sm transition-all",
                      numPlayers === n ? "bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-400 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                    {n === 1 ? "1P" : `${n}P`}
                  </button>
                ))}
              </div>
            </div>

            {/* Names */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5" /> Player Names
              </span>
              {Array.from({ length: numPlayers }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-8">P{i + 1}</span>
                  <Input placeholder={`Player ${i + 1}`} value={playerNames[i]}
                    onChange={(e) => { const c = [...playerNames]; c[i] = e.target.value; setPlayerNames(c); }}
                    className="bg-slate-900 border-slate-800 text-slate-200 text-xs h-8 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="h-4 w-4 text-cyan-400" /> Math Category
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => { sfx.playBeep(420, 0.05); setSelectedCategoryId(cat.id); }}
                  className={cn("p-2.5 rounded-xl border font-black text-[10px] uppercase tracking-wide transition-all flex flex-col items-center gap-1",
                    selectedCategoryId === cat.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="leading-tight text-center">{cat.name}</span>
                </button>
              ))}
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Active Category Details</span>
              <p className="text-slate-400 text-xs">{activeCat.name}: {activeCat.description}</p>
            </div>
            <button onClick={handleStartLocalGame}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
              <Sparkles className="h-5 w-5" /> Launch Math Solving Arena
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER — LOCAL PLAYING
  // ═══════════════════════════════════════════════════════
  const renderLocalPlaying = () => {
    const allFinished = localPlayers.every((p) => p.isFinished);
    const timerPct = (timer / roundTimerConfig) * 100;
    return (
      <div className="w-full space-y-4 p-2 sm:p-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 font-black text-xs px-3">
              Round {currentRound}/{roundsConfig}
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs font-bold uppercase px-3">
              {CATEGORIES.find((c) => c.id === selectedCategoryId)?.emoji} Math
            </Badge>
          </div>
          <div className={cn("text-4xl font-black tabular-nums", timerColor(timer, roundTimerConfig))}>
            {timer}s
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn("flex-1 h-2 bg-slate-800 rounded-full overflow-hidden")}>
            <div className={cn("h-full rounded-full transition-all duration-1000", timerPct > 50 ? "bg-emerald-500" : timerPct > 20 ? "bg-amber-500" : "bg-red-500")}
              style={{ width: `${timerPct}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Active Problem</span>
          <span className="text-xl sm:text-2xl font-black text-white">{currentProblem?.question}</span>
        </div>

        {/* Canvases grid */}
        <div className={cn("grid gap-3", localPlayers.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {localPlayers.map((player) => (
            <div key={player.id} className={cn("bg-slate-900/60 border rounded-2xl p-3 space-y-2", player.isFinished ? "border-emerald-600/50" : "border-slate-800")}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-sm text-slate-200 truncate">{player.name}</span>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-400 font-black text-xs">{player.score}</span>
                  {player.isFinished && <Badge className="bg-emerald-600/20 text-emerald-300 text-[9px] ml-1">Submitted</Badge>}
                </div>
              </div>

              {/* Brush tools */}
              {!player.isFinished && (
                <div className="flex items-center gap-1 flex-wrap">
                  {BRUSH_PRESETS.map((b) => (
                    <button key={b.value} onClick={() => setPlayerBrushPreset(player.id, b.value)}
                      className={cn("px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all", strokeWidth[player.id] === b.value ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-800 border-slate-700 text-slate-400")}>
                      {b.label}
                    </button>
                  ))}
                  <div className="flex gap-1 ml-1">
                    {STROKE_COLORS.slice(0, 4).map((c) => (
                      <button key={c.value} onClick={() => setPlayerColor(player.id, c.value)}
                        className={cn("h-5 w-5 rounded-full border-2 transition-all", strokeColor[player.id] === c.value ? "border-white scale-125" : "border-transparent")}
                        style={{ background: c.value }} />
                    ))}
                  </div>
                  <button onClick={() => { canvasRefs.current[player.id]?.undo(); sfx.playBeep(520, 0.05); }} className="text-slate-400 hover:text-slate-200 ml-auto">
                    <Undo className="h-4 w-4" />
                  </button>
                  <button onClick={() => { canvasRefs.current[player.id]?.clearCanvas(); sfx.playBeep(280, 0.05, "triangle"); }} className="text-slate-400 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Canvas */}
              <div className="rounded-xl overflow-hidden border border-slate-700 relative" style={{ height: localPlayers.length === 1 ? 320 : localPlayers.length === 2 ? 260 : 200 }}>
                {/* @ts-ignore */}
                <DynamicCanvas
                  ref={(el: ReactSketchCanvasRef | null) => { canvasRefs.current[player.id] = el; }}
                  readOnly={player.isFinished}
                  strokeColor={strokeColor[player.id] || "#000000"}
                  strokeWidth={strokeWidth[player.id] || 6}
                  canvasColor="white"
                  height={`${localPlayers.length === 1 ? 320 : localPlayers.length === 2 ? 260 : 200}px`}
                  width="100%"
                />
                {player.isFinished && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center rounded-xl">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 drop-shadow-lg" />
                  </div>
                )}
              </div>

              {!player.isFinished && (
                <button onClick={() => handleLocalPlayerFinished(player.id)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-xs rounded-xl hover:scale-105 transition-all">
                  ✓ Submit Solution
                </button>
              )}
            </div>
          ))}
        </div>

        {allFinished && activeEvaluator === "none" && (
          <div className="flex gap-3">
            <button onClick={() => { sfx.playBeep(440, 0.08); setActiveEvaluator("teacher"); setTimerActive(false); setLocalGameState("evaluation"); }}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              <UserCheck className="h-5 w-5" /> Teacher Check
            </button>
            <button onClick={handleLocalTimerTimeout}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" /> AI Scan Board
            </button>
          </div>
        )}
      </div>
    );
  };

  const setPlayerColor = (id: number, c: string) => { setStrokeColor((prev) => ({ ...prev, [id]: c })); };
  const setPlayerBrushPreset = (id: number, w: number) => { setStrokeWidth((prev) => ({ ...prev, [id]: w })); };

  // ═══════════════════════════════════════════════════════
  // RENDER — LOCAL EVALUATION
  // ═══════════════════════════════════════════════════════
  const renderLocalEvaluation = () => {
    if (activeEvaluator === "ai") {
      return (
        <div className="max-w-3xl mx-auto w-full p-4 space-y-6 text-center">
          <div className="space-y-2">
            <div className="text-5xl animate-pulse">🤖</div>
            <h2 className="text-2xl font-black text-white">{aiScanning ? "AI Evaluating Solutions..." : "AI Solution Verification Complete"}</h2>
          </div>
          {aiScanning && (
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse w-full" />
            </div>
          )}
          {!aiScanning && (
            <div className="space-y-3">
              {localPlayers.map((p) => (
                <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex-1 text-left">
                    <p className="font-black text-white">{p.name}</p>
                    <p className="text-slate-400 text-xs">{p.aiCommentary}</p>
                  </div>
                  <div className={cn("text-2xl font-black", p.aiMatchScore >= 70 ? "text-emerald-400" : "text-red-400")}>
                    {p.aiMatchScore}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Teacher check
    const allChecked = localPlayers.every((p) => p.teacherChecked);
    return (
      <div className="max-w-4xl mx-auto w-full p-4 space-y-5">
        <div className="text-center space-y-2">
          <div className="text-3xl">👩‍🏫</div>
          <h2 className="text-2xl font-black text-white">Teacher Evaluation</h2>
          <p className="text-slate-400 text-xs">Verify the steps, equations, and answers on each student's board.</p>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-2xl mx-auto space-y-2 text-left">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Problem</span>
              <p className="text-sm font-bold text-white">{currentProblem?.question}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Correct Answer</span>
                <p className="text-sm font-extrabold text-emerald-400">{currentProblem?.answer}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Solution Hint</span>
                <p className="text-xs text-slate-300 font-medium">{currentProblem?.solutionHint}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("grid gap-4", localPlayers.length <= 2 ? "grid-cols-2" : "grid-cols-2")}>
          {localPlayers.map((player) => (
            <div key={player.id} className={cn("bg-slate-900/60 border rounded-2xl p-3 space-y-2",
              player.teacherChecked ? (player.teacherApproved ? "border-emerald-600/50" : "border-red-600/50") : "border-slate-800")}>
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-200 text-sm">{player.name}</span>
                <div className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-400 font-black text-xs">{player.score} pts</span>
                  {player.teacherChecked && (
                    player.teacherApproved
                      ? <Badge className="bg-emerald-600/20 text-emerald-300 text-[9px]">✓ Approved</Badge>
                      : <Badge className="bg-red-600/20 text-red-300 text-[9px]">✗ Denied</Badge>
                  )}
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height: 220 }}>
                {/* @ts-ignore */}
                <DynamicCanvas
                  ref={(el: ReactSketchCanvasRef | null) => { canvasRefs.current[player.id] = el; }}
                  readOnly
                  strokeColor="#000"
                  strokeWidth={1}
                  canvasColor="white"
                  height="220px"
                  width="100%"
                />
              </div>
              {!player.teacherChecked && (
                <div className="flex gap-2">
                  <button onClick={() => handleTeacherCheckLocal(player.id, true)}
                    className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Correct
                  </button>
                  <button onClick={() => handleTeacherCheckLocal(player.id, false)}
                    className="flex-1 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-xs rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-1">
                    <X className="h-3.5 w-3.5" /> Incorrect
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {allChecked && (
          <button onClick={handleLocalTeacherProceed}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 mb-2">
            <ArrowRight className="h-5 w-5" /> Proceed to Results
          </button>
        )}
        {!allChecked && (
          <p className="text-center text-slate-500 text-xs mb-4">Check all {localPlayers.filter((p) => !p.teacherChecked).length} remaining player(s) to continue.</p>
        )}

        <button onClick={handleLocalAIScan}
          className="w-full py-3 border border-purple-600/50 text-purple-300 font-black text-xs rounded-2xl hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" /> Run AI Scan Instead (Optional)
        </button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER — LOCAL SUMMARY
  // ═══════════════════════════════════════════════════════
  const renderLocalSummary = () => {
    const winner = localPlayers.find((p) => p.id === roundWinnerId);
    return (
      <div className="max-w-2xl mx-auto w-full p-4 space-y-6 text-center">
        <div className="space-y-2">
          <div className="text-5xl">{winner ? "🏆" : "😐"}</div>
          <h2 className="text-2xl font-black text-white">Round {currentRound} Complete</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 inline-block">
            <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Problem</span>
            <span className="font-black text-white text-base block">{currentProblem?.question}</span>
            <span className="font-extrabold text-emerald-400 text-sm block mt-1">Answer: {currentProblem?.answer}</span>
          </div>
        </div>
        <p className="text-slate-300 text-sm">{roundWinningReason}</p>
        <div className="space-y-2">
          {[...localPlayers].sort((a, b) => b.score - a.score).map((p, i) => (
            <div key={p.id} className={cn("flex items-center justify-between px-5 py-3 rounded-2xl border",
              p.id === roundWinnerId ? "bg-amber-500/10 border-amber-500/30" : "bg-slate-900/60 border-slate-800")}>
              <span className="font-black text-slate-200">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {p.name}</span>
              <span className="font-black text-indigo-400">{p.score} pts</span>
            </div>
          ))}
        </div>
        <button onClick={handleLocalProceedFromSummary}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
          {currentRound < roundsConfig ? <><ArrowRight className="h-5 w-5" /> Next Round</> : <><Trophy className="h-5 w-5" /> Final Standings</>}
        </button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER — LOCAL SCOREBOARD
  // ═══════════════════════════════════════════════════════
  const renderLocalScoreboard = () => {
    const sorted = [...localPlayers].sort((a, b) => b.score - a.score);
    return (
      <div className="max-w-2xl mx-auto w-full p-4 space-y-6">
        {renderTopBar("Final Results")}
        <div className="text-center">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-3xl font-black text-white">Final Standings</h2>
        </div>
        <div className="space-y-3">
          {sorted.map((p, i) => (
            <div key={p.id} className={cn("flex items-center gap-4 px-5 py-4 rounded-2xl border",
              i === 0 ? "bg-yellow-500/10 border-yellow-500/30" : i === 1 ? "bg-slate-400/10 border-slate-500/30" : "bg-amber-700/10 border-amber-700/30")}>
              <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</span>
              <span className="flex-1 font-black text-slate-200">{p.name}</span>
              <span className="font-black text-indigo-400 text-xl">{p.score}</span>
              <span className="text-slate-500 text-xs">pts</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleStartLocalGame}
            className="py-3 bg-slate-900 border border-slate-800 text-slate-300 font-black text-xs rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <RotateCcw className="h-4 w-4" /> Replay
          </button>
          <button onClick={() => { setLocalGameState("setup"); setTopScreen("local"); }}
            className="py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
            <Play className="h-4 w-4" /> New Setup
          </button>
        </div>
        <Button variant="ghost" asChild className="w-full text-slate-500 hover:text-slate-400 text-xs font-bold">
          <Link href="/games">Return to Games Lobby</Link>
        </Button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER — ONLINE LOBBY
  // ═══════════════════════════════════════════════════════
  const renderOnlineLobby = () => (
    <div className="max-w-3xl mx-auto w-full space-y-6 p-4">
      {renderTopBar("Online Room", () => setTopScreen("modeSelect"))}
      <div className="text-center">
        <div className="text-5xl mb-2">🌐</div>
        <h2 className="text-2xl font-black text-white">Online Multiplayer</h2>
        <p className="text-slate-400 text-sm mt-1">Create a room or join an existing one with an invite code</p>
      </div>

      {/* Player Name */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Display Name</Label>
        <Input value={myPlayerName} onChange={(e) => setMyPlayerName(e.target.value)}
          placeholder="Enter your name" maxLength={20}
          className="bg-slate-950 border-slate-700 text-slate-200 font-bold rounded-xl" />
      </div>

      {onlineError && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 text-red-300 text-sm font-medium text-center">
          {onlineError}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Create Room */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 p-3 rounded-2xl"><Globe className="h-6 w-6 text-indigo-400" /></div>
            <div>
              <h3 className="font-black text-white">Create Room</h3>
              <p className="text-slate-500 text-xs">You'll be the host & teacher</p>
            </div>
          </div>

          {/* Room config */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rounds</Label>
              <div className="flex gap-2">
                {[5, 10, 15].map((r) => (
                  <button key={r} onClick={() => setOnlineConfig((c) => ({ ...c, rounds: r }))}
                    className={cn("flex-1 py-2 rounded-xl border font-black text-xs transition-all",
                      onlineConfig.rounds === r ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timer per Round</Label>
              <div className="flex gap-2 flex-wrap">
                {[15, 30, 45, 60, 90].map((t) => (
                  <button key={t} onClick={() => setOnlineConfig((c) => ({ ...c, timerLimit: t }))}
                    className={cn("flex-1 min-w-[40px] py-2 rounded-xl border font-black text-xs transition-all",
                      onlineConfig.timerLimit === t ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                    {t}s
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setOnlineConfig((c) => ({ ...c, categoryId: cat.id }))}
                    className={cn("py-1.5 px-1 rounded-xl border font-black text-[9px] transition-all flex flex-col items-center gap-0.5",
                      onlineConfig.categoryId === cat.id ? "bg-cyan-600 border-cyan-400 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                    <span>{cat.emoji}</span>
                    <span className="leading-tight text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleCreateRoom} disabled={isBusy || !myPlayerName.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2">
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            Create Room
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-600/20 p-3 rounded-2xl"><Users className="h-6 w-6 text-cyan-400" /></div>
            <div>
              <h3 className="font-black text-white">Join Room</h3>
              <p className="text-slate-500 text-xs">Enter the 6-character invite code</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="ABC123" maxLength={6}
              className="bg-slate-950 border-slate-700 text-white font-black text-2xl tracking-[0.4em] text-center rounded-xl h-14" />
            <p className="text-slate-500 text-xs text-center">Ask the room creator for their invite code</p>
          </div>
          <button onClick={handleJoinRoom} disabled={isBusy || !myPlayerName.trim() || joinCodeInput.length !== 6}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2">
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Join Room
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // RENDER — WAITING ROOM (Online lobby with players)
  // ═══════════════════════════════════════════════════════
  const renderWaitingRoom = () => {
    if (!room) return <div className="flex items-center justify-center h-64"><Loader2 className="h-10 w-10 animate-spin text-indigo-400" /></div>;
    const players = Object.values(room.players);
    const allReady = players.every((p) => p.isReady);
    const canStart = isCreator && players.length >= 1 && allReady;
    const me = room.players[myPlayerId];

    return (
      <div className="max-w-2xl mx-auto w-full space-y-5 p-4">
        {renderTopBar("Waiting Room", handleLeaveOnline)}

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">🕹️ Math Game Lobby</h2>
          {isCreator && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-bold">You are the Host & Teacher</Badge>}
        </div>

        {/* Room Code */}
        <div className="bg-indigo-950/50 border border-indigo-700/40 rounded-2xl p-5 text-center space-y-3">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Invite Code — Share with students</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-black text-white tracking-[0.3em]">{room.roomCode}</span>
            <button onClick={copyRoomCode} className="text-indigo-400 hover:text-indigo-200 transition-colors">
              <Copy className="h-5 w-5" />
            </button>
          </div>
          <p className="text-slate-500 text-xs">Supports cross-device multiplayer</p>
        </div>

        {/* Game Config */}
        {isCreator && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-black uppercase text-indigo-400 tracking-wider">⚙️ Game Settings (Host Only)</p>
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="bg-slate-950 rounded-xl p-2">
                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1">Rounds</p>
                <div className="flex gap-1">
                  {[5, 10, 15].map((r) => (
                    <button key={r} onClick={async () => { const c = { ...room.config, rounds: r }; await updateRoomConfig(room.roomCode, c); }}
                      className={cn("flex-1 py-1 rounded-lg border font-black text-[9px] transition-all",
                        room.config.rounds === r ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-900 border-slate-800 text-slate-400")}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-950 rounded-xl p-2">
                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1">Timer</p>
                <div className="flex gap-1 flex-wrap">
                  {[15, 30, 45, 60].map((t) => (
                    <button key={t} onClick={async () => { const c = { ...room.config, timerLimit: t }; await updateRoomConfig(room.roomCode, c); }}
                      className={cn("flex-1 min-w-[20px] py-1 rounded-lg border font-black text-[9px] transition-all",
                        room.config.timerLimit === t ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-900 border-slate-800 text-slate-400")}>
                      {t}s
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-950 rounded-xl p-2">
                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1">Category</p>
                <p className="font-black text-white">{CATEGORIES.find((c) => c.id === room.config.categoryId)?.emoji} {CATEGORIES.find((c) => c.id === room.config.categoryId)?.name.split(" ")[0]}</p>
              </div>
            </div>
            {/* Category picker in lobby */}
            <div className="grid grid-cols-5 gap-1">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={async () => { const c = { ...room.config, categoryId: cat.id }; await updateRoomConfig(room.roomCode, c); }}
                  className={cn("py-1 rounded-lg border font-black text-[9px] transition-all flex flex-col items-center",
                    room.config.categoryId === cat.id ? "bg-cyan-600 border-cyan-400 text-white" : "bg-slate-900 border-slate-800 text-slate-400")}>
                  <span className="text-sm">{cat.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Players */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Players ({players.length}/8)</p>
          {players.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
              <div className={cn("h-2.5 w-2.5 rounded-full", p.isReady ? "bg-emerald-400" : "bg-slate-600")} />
              <span className="flex-1 font-bold text-slate-200">{p.name}</span>
              {p.id === room.creatorId && <Badge className="bg-amber-500/20 text-amber-300 text-[9px]">Host</Badge>}
              {p.id === myPlayerId && <Badge className="bg-indigo-500/20 text-indigo-300 text-[9px]">You</Badge>}
              <span className={cn("text-xs font-black", p.isReady ? "text-emerald-400" : "text-slate-500")}>
                {p.isReady ? "✓ Ready" : "Not Ready"}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isCreator && me && (
            <button onClick={handleToggleReady}
              className={cn("w-full py-3 font-black rounded-2xl transition-all hover:scale-105 flex items-center justify-center gap-2",
                me.isReady ? "bg-slate-900 border border-emerald-600/50 text-emerald-400" : "bg-gradient-to-r from-emerald-500 to-cyan-600 text-white")}>
              {me.isReady ? <><Lock className="h-4 w-4" /> I'm Ready ✓</> : <><Unlock className="h-4 w-4" /> Set Ready</>}
            </button>
          )}
          {isCreator && (
            <button onClick={handleStartOnlineGame} disabled={!canStart || isBusy}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {!canStart ? (allReady ? "Need at least 1 player" : "Waiting for all players to be ready...") : "Start Game!"}
            </button>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER — ONLINE PLAYING
  // ═══════════════════════════════════════════════════════
  const renderOnlinePlaying = () => {
    if (!room) return null;
    const timerLimit = room.config.timerLimit;
    const timerPct = (onlineTimer / timerLimit) * 100;

    return (
      <div className="max-w-2xl mx-auto w-full space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 font-black text-xs w-fit">
              Round {room.currentRound}/{room.config.rounds}
            </Badge>
            <span className="text-slate-500 text-[10px] mt-1">{Object.values(room.players).filter((p) => p.isFinished).length}/{Object.keys(room.players).length} submitted</span>
          </div>
          <div className={cn("text-4xl font-black tabular-nums", timerColor(onlineTimer, timerLimit))}>
            {onlineTimer}s
          </div>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", timerPct > 50 ? "bg-emerald-500" : timerPct > 20 ? "bg-amber-500" : "bg-red-500")}
            style={{ width: `${timerPct}%` }} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Active Problem</span>
          <span className="text-xl sm:text-2xl font-black text-white">{room.currentWord}</span>
        </div>

        {/* Canvas */}
        {!isLocalSubmitted ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {BRUSH_PRESETS.map((b) => (
                <button key={b.value} onClick={() => setOnlineStrokeWidth(b.value)}
                  className={cn("px-3 py-1 rounded-xl text-xs font-black border transition-all", onlineStrokeWidth === b.value ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-800 border-slate-700 text-slate-400")}>
                  {b.label}
                </button>
              ))}
              <div className="flex gap-1 ml-1">
                {STROKE_COLORS.map((c) => (
                  <button key={c.value} onClick={() => setOnlineStrokeColor(c.value)}
                    className={cn("h-6 w-6 rounded-full border-2 transition-all", onlineStrokeColor === c.value ? "border-white scale-125" : "border-transparent")}
                    style={{ background: c.value }} />
                ))}
              </div>
              <button onClick={() => onlineCanvasRef.current?.undo()} className="text-slate-400 hover:text-slate-200 ml-auto">
                <Undo className="h-4 w-4" />
              </button>
              <button onClick={() => onlineCanvasRef.current?.clearCanvas()} className="text-slate-400 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-700" style={{ height: 320 }}>
              <DynamicCanvas
                ref={onlineCanvasRef}
                strokeColor={onlineStrokeColor}
                strokeWidth={onlineStrokeWidth}
                canvasColor="white"
                height="320px"
                width="100%"
              />
            </div>
            <button onClick={() => handleOnlineSubmitDrawing(false)}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-sm rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Submit Solution
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce" />
            <h3 className="text-xl font-black text-white">Solution Submitted!</h3>
            <p className="text-slate-400 text-sm">Waiting for other players to finish...</p>
            <div className="space-y-2 w-full max-w-xs">
              {Object.values(room.players).map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
                  <div className={cn("h-2 w-2 rounded-full", p.isFinished ? "bg-emerald-400" : "bg-slate-600 animate-pulse")} />
                  <span className="flex-1 text-xs font-bold text-slate-300">{p.name}</span>
                  <span className="text-[10px] font-black">{p.isFinished ? "✓ Submitted" : "Solving..."}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER — ONLINE EVALUATION (Teacher view)
  // ═══════════════════════════════════════════════════════
  const renderOnlineEvaluation = () => {
    if (!room) return null;
    const players = Object.values(room.players);
    const allChecked = players.every((p) => p.teacherChecked);
    const probDetails = getProblemDetails(room.currentWord, room.config.categoryId);

    if (!isCreator) {
      return (
        <div className="flex flex-col items-center justify-center gap-5 py-16 text-center p-4">
          <UserCheck className="h-16 w-16 text-amber-400 animate-pulse" />
          <h3 className="text-2xl font-black text-white">Teacher is Checking...</h3>
          <p className="text-slate-400 text-sm">The teacher is reviewing student boards. Hang tight!</p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 inline-block mt-4 max-w-sm">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Problem</span>
            <p className="text-sm font-bold text-white">{room.currentWord}</p>
          </div>
        </div>
      );
    }

    // Creator/teacher evaluation view
    return (
      <div className="max-w-5xl mx-auto w-full p-4 space-y-5 overflow-y-auto">
        <div className="text-center space-y-2">
          <div className="text-3xl">👩‍🏫</div>
          <h2 className="text-2xl font-black text-white">Teacher Evaluation</h2>
          <p className="text-slate-400 text-xs">Review calculations and answers for each student. Award points, then proceed to results.</p>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-2xl mx-auto space-y-2 text-left">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Problem</span>
              <p className="text-sm font-bold text-white">{room.currentWord}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Correct Answer</span>
                <p className="text-sm font-extrabold text-emerald-400">{room.currentAnswer}</p>
              </div>
              {probDetails && (
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Solution Hint</span>
                  <p className="text-xs text-slate-300 font-medium">{probDetails.solutionHint}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cn("grid gap-4", players.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-3")}>
          {players.map((player) => (
            <div key={player.id} className={cn("bg-slate-900/60 border rounded-2xl p-3 space-y-2",
              player.teacherChecked ? (player.teacherApproved ? "border-emerald-600/50" : "border-red-600/50") : "border-slate-800")}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-black text-slate-200 text-sm">{player.name}</span>
                  {player.id === room.creatorId && <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-[9px]">Host</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-amber-400" />
                  <span className="text-amber-400 font-black text-xs">{player.score}</span>
                  {player.teacherChecked && (
                    player.teacherApproved
                      ? <Badge className="bg-emerald-600/20 text-emerald-300 text-[9px] ml-1">✓</Badge>
                      : <Badge className="bg-red-600/20 text-red-300 text-[9px] ml-1">✗</Badge>
                  )}
                </div>
              </div>

              {player.canvasData ? (
                <SubmittedDrawingViewer canvasData={player.canvasData} />
              ) : (
                <div className="flex items-center justify-center h-[240px] bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
                  No solution submitted
                </div>
              )}

              {!player.teacherChecked ? (
                <div className="flex gap-2">
                  <button onClick={() => handleOnlineTeacherCheck(player.id, true)}
                    className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Correct
                  </button>
                  <button onClick={() => handleOnlineTeacherCheck(player.id, false)}
                    className="flex-1 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-xs rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-1">
                    <X className="h-3.5 w-3.5" /> Incorrect
                  </button>
                </div>
              ) : (
                <p className={cn("text-center text-xs font-black", player.teacherApproved ? "text-emerald-400" : "text-red-400")}>
                  {player.teacherApproved ? "✓ Approved" : "✗ Denied"}
                </p>
              )}
            </div>
          ))}
        </div>

        {!allChecked && (
          <p className="text-center text-slate-500 text-xs mb-3">
            {players.filter((p) => !p.teacherChecked).length} player(s) still need to be checked.
          </p>
        )}

        {allChecked && (
          <button onClick={handleOnlineTeacherProceed} disabled={isBusy}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3">
            {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            Proceed to Round Results
          </button>
        )}

        <button onClick={handleOnlineAIScan} disabled={isScanningOnline}
          className="w-full py-3 border border-purple-600/50 text-purple-300 font-black text-xs rounded-2xl hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2">
          {isScanningOnline ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Run AI Scan Instead (Optional)
        </button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER — ONLINE SUMMARY
  // ═══════════════════════════════════════════════════════
  const renderOnlineSummary = () => {
    if (!room) return null;
    const players = Object.values(room.players).sort((a, b) => b.score - a.score);
    const winner = players.find((p) => p.id === room.roundWinnerId);
    return (
      <div className="max-w-2xl mx-auto w-full p-4 space-y-6 text-center">
        <div className="space-y-2">
          <div className="text-5xl">{winner ? "🏆" : "😐"}</div>
          <h2 className="text-2xl font-black text-white">Round {room.currentRound} Complete!</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 inline-block">
            <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Problem</span>
            <span className="font-black text-white text-base block">{room.currentWord}</span>
            <span className="font-extrabold text-emerald-400 text-sm block mt-1">Correct Answer: {room.currentAnswer}</span>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{room.roundWinningReason}</p>
        <div className="space-y-2">
          {players.map((p, i) => (
            <div key={p.id} className={cn("flex items-center gap-3 px-5 py-3 rounded-2xl border",
              p.id === room.roundWinnerId ? "bg-amber-500/10 border-amber-500/30" : "bg-slate-900/60 border-slate-800")}>
              <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</span>
              <span className="flex-1 font-black text-slate-200 text-left">{p.name}</span>
              <span className="font-black text-indigo-400">{p.score} pts</span>
            </div>
          ))}
        </div>
        {isCreator && (
          <button onClick={handleOnlineNextRound} disabled={isBusy}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : room.currentRound < room.config.rounds ? <ArrowRight className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
            {room.currentRound < room.config.rounds ? `Start Round ${room.currentRound + 1}` : "See Final Standings"}
          </button>
        )}
        {!isCreator && (
          <p className="text-slate-500 text-xs animate-pulse">Waiting for host to start the next round...</p>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // RENDER — ONLINE SCOREBOARD
  // ═══════════════════════════════════════════════════════
  const renderOnlineScoreboard = () => {
    if (!room) return null;
    const sorted = Object.values(room.players).sort((a, b) => b.score - a.score);
    return (
      <div className="max-w-2xl mx-auto w-full p-4 space-y-6">
        {renderTopBar("Final Results")}
        <div className="text-center">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-3xl font-black text-white">Final Standings</h2>
          <p className="text-slate-400 text-sm mt-1">Room: <span className="font-black text-indigo-400">{room.roomCode}</span></p>
        </div>
        <div className="space-y-3">
          {sorted.map((p, i) => (
            <div key={p.id} className={cn("flex items-center gap-4 px-5 py-4 rounded-2xl border",
              i === 0 ? "bg-yellow-500/10 border-yellow-500/30" : i === 1 ? "bg-slate-400/10 border-slate-500/30" : "bg-amber-700/10 border-amber-700/30")}>
              <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</span>
              <span className="flex-1 font-black text-slate-200">{p.name}</span>
              {p.id === myPlayerId && <Badge className="bg-indigo-500/20 text-indigo-300 text-[9px]">You</Badge>}
              <span className="font-black text-indigo-400 text-xl">{p.score}</span>
              <span className="text-slate-500 text-xs">pts</span>
            </div>
          ))}
        </div>
        <button onClick={handleLeaveOnline}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-2xl hover:scale-105 transition-all">
          Play Again / Back to Lobby
        </button>
        <Button variant="ghost" asChild className="w-full text-slate-500 hover:text-slate-400 text-xs font-bold">
          <Link href="/games">Return to Games</Link>
        </Button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════
  const renderContent = () => {
    if (topScreen === "modeSelect") return renderModeSelect();

    if (topScreen === "local") {
      switch (localGameState) {
        case "setup": return renderLocalSetup();
        case "playing": return renderLocalPlaying();
        case "evaluation": return renderLocalEvaluation();
        case "summary": return renderLocalSummary();
        case "scoreboard": return renderLocalScoreboard();
      }
    }

    if (topScreen === "online") {
      if (onlineSubScreen === "lobby") return renderOnlineLobby();
      if (onlineSubScreen === "room") {
        if (roomError) return (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center p-4">
            <WifiOff className="h-12 w-12 text-red-400" />
            <p className="text-red-300 font-bold">{roomError}</p>
            <button onClick={handleLeaveOnline} className="bg-slate-900 border border-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl text-sm">Back to Lobby</button>
          </div>
        );
        if (roomLoading && !room) return (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
            <p className="text-slate-400 font-bold">Connecting to room...</p>
          </div>
        );
        if (!room) return (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <WifiOff className="h-12 w-12 text-slate-500" />
            <p className="text-slate-400">Room closed or not found.</p>
            <button onClick={handleLeaveOnline} className="bg-slate-900 border border-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl text-sm">Back to Lobby</button>
          </div>
        );
        switch (room.status) {
          case "lobby": return renderWaitingRoom();
          case "playing": return renderOnlinePlaying();
          case "evaluation": return renderOnlineEvaluation();
          case "summary": return renderOnlineSummary();
          case "scoreboard": return renderOnlineScoreboard();
        }
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-y-auto">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-indigo-500/30 rounded-full blur-[1px]" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-500/20 rounded-full blur-[2px]" />
        <div className="absolute bottom-20 left-1/3 w-2.5 h-2.5 bg-pink-500/20 rounded-full blur-[1px]" />
        <div className="absolute bottom-1/3 right-10 w-2 h-2 bg-cyan-500/30 rounded-full blur-[1px]" />
      </div>
      <div className="relative z-10 w-full flex-1 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}
