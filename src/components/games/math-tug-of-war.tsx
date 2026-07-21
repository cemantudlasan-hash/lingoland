"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Trophy, Play, UserPlus, Sparkles, Volume2, VolumeX, Maximize,
  UserCheck, Award, ArrowRight, Wifi, WifiOff, Users, Copy,
  CheckCircle2, Loader2, RefreshCw, LogOut, Swords, Timer, Check, X, Shield, Zap, AlertCircle, BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useTugRoom,
  useTugRoomListener,
  getOrCreateTugPlayerId,
  type TugRoom,
  type TugPlayer,
  type TugRoomConfig,
} from "@/hooks/use-tug-room";

// ---------------------------------------------------------
// SOUND SYNTHESIS (Web Audio API)
// ---------------------------------------------------------
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

  playDing() {
    this.playBeep(523.25, 0.1);
    setTimeout(() => this.playBeep(659.25, 0.15), 100);
  }

  playBuzz() {
    this.playBeep(180, 0.25, "triangle");
  }

  playPull() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  playCheer() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Crowd cheer noise generation
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter to sound like a crowd
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      filter.Q.value = 1;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
      noise.stop(this.ctx.currentTime + 1.5);
    } catch {}
  }

  playFanfare() {
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playBeep(f, 0.25, "square"), idx * 120);
    });
  }
}

const sfx = new SoundEffects();

// ---------------------------------------------------------
// PROBLEM GENERATION
// ---------------------------------------------------------
interface TugProblem {
  question: string;
  answer: string;
  options: string[];
  solutionHint?: string;
}

const CATEGORIES = [
  { id: "addition", name: "Addition", emoji: "➕", desc: "Basic to multi-step addition" },
  { id: "subtraction", name: "Subtraction", emoji: "➖", desc: "Basic to multi-step subtraction" },
  { id: "multiplication", name: "Multiplication", emoji: "✖️", desc: "Multiplication practice" },
  { id: "division", name: "Division", emoji: "➗", desc: "Integer division & remainders" },
  { id: "fractions", name: "Fractions", emoji: "🍕", desc: "Fraction addition, subtraction & conversion" },
  { id: "decimals", name: "Decimals", emoji: "🪙", desc: "Decimal math and comparison" },
  { id: "percentages", name: "Percentages", emoji: "📊", desc: "Percentage calculations" },
  { id: "algebra", name: "Algebraic Equations", emoji: "📐", desc: "Solve for variables like x" },
  { id: "geometry", name: "Geometry Basics", emoji: "🛑", desc: "Perimeter, area, and shape angles" },
  { id: "mixed", name: "Mixed Mathematics", emoji: "🎲", desc: "All categories combined" },
];

function generateTugProblem(categoryId: string, difficulty: TugRoomConfig['difficulty'], askedSet?: Set<string>): TugProblem {
  let cat = categoryId;
  if (cat === "mixed") {
    const list = CATEGORIES.filter((c) => c.id !== "mixed");
    cat = list[Math.floor(Math.random() * list.length)].id;
  }

  let question = "";
  let answerVal = 0;
  let answerStr = "";
  let hint = "";

  // Helper ranges based on difficulty
  const easyMax = 12;
  const medMax = 50;
  const hardMax = 100;

  let attempts = 0;
  do {
    attempts++;
    switch (cat) {
      case "addition": {
        let a = 0, b = 0;
        if (difficulty === "easy") {
          a = 3 + Math.floor(Math.random() * 15);
          b = 3 + Math.floor(Math.random() * 15);
        } else if (difficulty === "medium" || difficulty === "adaptive") {
          a = 15 + Math.floor(Math.random() * 85);
          b = 15 + Math.floor(Math.random() * 85);
        } else {
          a = 100 + Math.floor(Math.random() * 900);
          b = 100 + Math.floor(Math.random() * 900);
        }
        answerVal = a + b;
        question = `${a} + ${b}`;
        hint = `Line up the digits: ${a} + ${b} = ${answerVal}`;
        answerStr = answerVal.toString();
        break;
      }
      case "subtraction": {
        let a = 0, b = 0;
        if (difficulty === "easy") {
          a = 10 + Math.floor(Math.random() * 20);
          b = 1 + Math.floor(Math.random() * a);
        } else if (difficulty === "medium" || difficulty === "adaptive") {
          a = 50 + Math.floor(Math.random() * 150);
          b = 10 + Math.floor(Math.random() * (a - 10));
        } else {
          a = 300 + Math.floor(Math.random() * 700);
          b = 100 + Math.floor(Math.random() * (a - 100));
        }
        answerVal = a - b;
        question = `${a} - ${b}`;
        hint = `Subtract digits carefully: ${a} - ${b} = ${answerVal}`;
        answerStr = answerVal.toString();
        break;
      }
      case "multiplication": {
        let a = 0, b = 0;
        if (difficulty === "easy") {
          a = 2 + Math.floor(Math.random() * 8);
          b = 2 + Math.floor(Math.random() * 10);
        } else if (difficulty === "medium" || difficulty === "adaptive") {
          a = 6 + Math.floor(Math.random() * 14);
          b = 4 + Math.floor(Math.random() * 12);
        } else {
          a = 12 + Math.floor(Math.random() * 38);
          b = 6 + Math.floor(Math.random() * 20);
        }
        answerVal = a * b;
        question = `${a} × ${b}`;
        hint = `Multiply ${a} by ${b} to get ${answerVal}`;
        answerStr = answerVal.toString();
        break;
      }
      case "division": {
        let divisor = 0, quotient = 0;
        if (difficulty === "easy") {
          divisor = 2 + Math.floor(Math.random() * 7);
          quotient = 2 + Math.floor(Math.random() * 8);
        } else if (difficulty === "medium" || difficulty === "adaptive") {
          divisor = 4 + Math.floor(Math.random() * 9);
          quotient = 5 + Math.floor(Math.random() * 12);
        } else {
          divisor = 6 + Math.floor(Math.random() * 19);
          quotient = 12 + Math.floor(Math.random() * 28);
        }
        const dividend = divisor * quotient;
        answerVal = quotient;
        question = `${dividend} ÷ ${divisor}`;
        hint = `Find how many times ${divisor} fits into ${dividend}: ${dividend} ÷ ${divisor} = ${quotient}`;
        answerStr = answerVal.toString();
        break;
      }
      case "fractions": {
        // Pick a denominator between 3 and 16
        const d = 3 + Math.floor(Math.random() * 14);
        // Pick numerators such that the sum is less than d
        const a = 1 + Math.floor(Math.random() * (d - 2));
        const b = 1 + Math.floor(Math.random() * (d - a - 1));
        
        const isSub = Math.random() > 0.5;
        if (isSub && a > b) {
          question = `${a}/${d} - ${b}/${d}`;
          const diffNum = a - b;
          const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
          const common = gcd(diffNum, d);
          answerStr = `${diffNum / common}/${d / common}`;
          if (diffNum / common === d / common) answerStr = "1";
          hint = `Subtract the numerators: (${a} - ${b})/${d} = ${diffNum}/${d}`;
        } else {
          question = `${a}/${d} + ${b}/${d}`;
          const sumNum = a + b;
          const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
          const common = gcd(sumNum, d);
          answerStr = `${sumNum / common}/${d / common}`;
          if (sumNum / common === d / common) answerStr = "1";
          hint = `Add the numerators: (${a} + ${b})/${d} = ${sumNum}/${d}`;
        }
        break;
      }
      case "decimals": {
        let a = 0, b = 0;
        if (difficulty === "easy") {
          a = 1 + Math.floor(Math.random() * 9);
          b = 1 + Math.floor(Math.random() * 9);
          question = `${(a / 10).toFixed(1)} + ${(b / 10).toFixed(1)}`;
          answerStr = ((a + b) / 10).toFixed(1);
        } else {
          a = 10 + Math.floor(Math.random() * 90);
          b = 10 + Math.floor(Math.random() * 90);
          question = `${(a / 100).toFixed(2)} + ${(b / 100).toFixed(2)}`;
          answerStr = ((a + b) / 100).toFixed(2);
        }
        hint = `Add decimals just like whole numbers, keeping the decimal point aligned.`;
        break;
      }
      case "percentages": {
        const bases = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 250, 300, 350, 400, 450, 500, 600, 800, 1000];
        const percents = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const pct = percents[Math.floor(Math.random() * percents.length)];
        answerVal = (base * pct) / 100;
        question = `${pct}% of ${base}`;
        hint = `${pct}% is the same as ${pct}/100 or ${pct/100}. ${pct/100} × ${base} = ${answerVal}`;
        answerStr = answerVal.toString();
        break;
      }
      case "algebra": {
        const x = 3 + Math.floor(Math.random() * 12);
        const coeff = 2 + Math.floor(Math.random() * 5);
        const constant = 2 + Math.floor(Math.random() * 20);
        const right = coeff * x + constant;
        question = `Solve for x: ${coeff}x + ${constant} = ${right}`;
        answerStr = `x = ${x}`;
        hint = `Subtract ${constant} from both sides: ${coeff}x = ${right - constant}. Divide by ${coeff}: x = ${x}`;
        break;
      }
      case "geometry": {
        const types = ["rectangle", "square", "triangle"];
        const type = types[Math.floor(Math.random() * types.length)];
        if (type === "rectangle") {
          const w = 4 + Math.floor(Math.random() * 8);
          const l = w + 2 + Math.floor(Math.random() * 6);
          question = `Area of rectangle: length = ${l}, width = ${w}`;
          answerVal = l * w;
          hint = `Area = length × width = ${l} × ${w} = ${answerVal}`;
        } else if (type === "square") {
          const s = 4 + Math.floor(Math.random() * 10);
          question = `Perimeter of square: side = ${s}`;
          answerVal = s * 4;
          hint = `Perimeter = 4 × side = 4 × ${s} = ${answerVal}`;
        } else {
          const base = 6 + Math.floor(Math.random() * 12);
          const height = 4 + Math.floor(Math.random() * 6);
          question = `Area of triangle: base = ${base}, height = ${height}`;
          answerVal = 0.5 * base * height;
          hint = `Area = 0.5 × base × height = 0.5 × ${base} × ${height} = ${answerVal}`;
        }
        answerStr = answerVal.toString();
        break;
      }
      default: {
        question = "2 + 2";
        answerStr = "4";
        break;
      }
    }
  } while (askedSet && askedSet.has(question) && attempts < 50);

  if (askedSet) {
    askedSet.add(question);
  }

  // Generate 3 incorrect distractors
  const optionsSet = new Set<string>();
  optionsSet.add(answerStr);

  const numAns = parseFloat(answerStr);
  const isFraction = answerStr.includes("/");
  const isAlgebra = answerStr.startsWith("x = ");

  while (optionsSet.size < 4) {
    if (isAlgebra) {
      const wrongX = Math.max(1, Math.round(numAns + (-3 + Math.floor(Math.random() * 7))));
      optionsSet.add(`x = ${wrongX}`);
    } else if (isFraction) {
      const [num, den] = answerStr.split("/").map(Number);
      const wrongNum = Math.max(1, num + (-2 + Math.floor(Math.random() * 5)));
      optionsSet.add(`${wrongNum}/${den}`);
    } else if (isNaN(numAns)) {
      optionsSet.add(answerStr + Math.floor(Math.random() * 10));
    } else {
      // Whole numbers or decimals
      let offset = -15 + Math.floor(Math.random() * 31);
      if (offset === 0) offset = Math.random() > 0.5 ? 5 : -5;
      const wrongVal = Math.round((numAns + offset) * 10) / 10;
      if (wrongVal > 0) {
        optionsSet.add(wrongVal.toString());
      }
    }
  }

  const options = Array.from(optionsSet);
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    question,
    answer: answerStr,
    options,
    solutionHint: hint,
  };
}

// ---------------------------------------------------------
// LOCAL PLAY TYPES
// ---------------------------------------------------------
interface LocalTeamState {
  name: string;
  score: number;
  playersCount: number;
  streak: number;
}

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------
export function MathTugOfWar({ onToggleFullscreen }: { onToggleFullscreen?: () => void }) {
  const { toast } = useToast();

  // Screen states
  type Screen = "modeSelect" | "localConfig" | "localPlay" | "onlineConfig" | "onlinePlay" | "gameOver";
  const [screen, setScreen] = React.useState<Screen>("modeSelect");

  // Options
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  React.useEffect(() => {
    sfx.enabled = isAudioEnabled;
  }, [isAudioEnabled]);

  // -------------------------------------------------------
  // LOCAL GAME STATE
  // -------------------------------------------------------
  const [localMode, setLocalMode] = React.useState<"pvp" | "team">("pvp");
  const [localCategory, setLocalCategory] = React.useState("addition");
  const [localDifficulty, setLocalDifficulty] = React.useState<TugRoomConfig['difficulty']>("easy");
  const [localWinPulls, setLocalWinPulls] = React.useState(5);
  const [localTimerLimit, setLocalTimerLimit] = React.useState(15);
  const [localRoundsLimit, setLocalRoundsLimit] = React.useState(10);
  const [localRound, setLocalRound] = React.useState(1);

  const [blueTeam, setBlueTeam] = React.useState<LocalTeamState>({ name: "Team Blue", score: 0, playersCount: 1, streak: 0 });
  const [redTeam, setRedTeam] = React.useState<LocalTeamState>({ name: "Team Red", score: 0, playersCount: 1, streak: 0 });

  const [ropePosition, setRopePosition] = React.useState(0); // Left is positive (Blue), Right is negative (Red)
  const [currentProblem, setCurrentProblem] = React.useState<TugProblem | null>(null);
  const [timer, setTimer] = React.useState(15);
  const [timerActive, setTimerActive] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Lockouts (single-screen key bashing prevention)
  const [blueLocked, setBlueLocked] = React.useState(false);
  const [redLocked, setRedLocked] = React.useState(false);
  const [shake, setShake] = React.useState<"none" | "left" | "right" | "fail">("none");

  // Dust particles for rope pulling
  const [particles, setParticles] = React.useState<{ id: number; x: number; y: number; color: string }[]>([]);

  // Session asked question history tracking (to prevent repetition)
  const localAskedQuestionsRef = React.useRef<Set<string>>(new Set());
  const onlineAskedQuestionsRef = React.useRef<Set<string>>(new Set());

  // -------------------------------------------------------
  // ONLINE GAME STATE
  // -------------------------------------------------------
  const { createRoom, joinRoom, selectTeam, setPlayerReady, startGame, submitAnswer, handleTimeout, startNextRound, resetRoom, closeRoom, leaveRoom, endOnlineGameByScore } = useTugRoom();
  const [myRoomCode, setMyRoomCode] = React.useState<string | null>(null);
  const [myPlayerId] = React.useState(() => getOrCreateTugPlayerId());
  const [myPlayerName, setMyPlayerName] = React.useState("Player");
  const [joinCodeInput, setJoinCodeInput] = React.useState("");
  const [isCreator, setIsCreator] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState(false);
  const [onlineError, setOnlineError] = React.useState("");
  const [onlineCategory, setOnlineCategory] = React.useState("addition");
  const [onlineDifficulty, setOnlineDifficulty] = React.useState<TugRoomConfig['difficulty']>("easy");
  const [onlineWinPulls, setOnlineWinPulls] = React.useState(5);
  const [onlineTimerLimit, setOnlineTimerLimit] = React.useState(15);
  const [onlineRoundsLimit, setOnlineRoundsLimit] = React.useState(10);
  const [onlineTimer, setOnlineTimer] = React.useState(15);

  const { room, loading: roomLoading, error: roomError } = useTugRoomListener(myRoomCode);

  // Trigger sound effect on online rope changes
  const lastRopePosRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!room || room.status !== "playing") return;
    if (lastRopePosRef.current !== null && lastRopePosRef.current !== room.ropePosition) {
      sfx.playPull();
      sfx.playCheer();
      // Generate particles
      triggerParticles();
      // Shake
      setShake(room.ropePosition > lastRopePosRef.current ? "left" : "right");
      setTimeout(() => setShake("none"), 800);
    }
    lastRopePosRef.current = room.ropePosition;
  }, [room?.ropePosition]);

  // Online timer countdown syncing with Firestore timestamp
  React.useEffect(() => {
    if (!room || room.status !== "playing" || !room.timerStartedAt) {
      return;
    }

    const timerLimit = room.config.timerLimit || 15;
    
    // Firestore timestamp could be serverTimestamp (which resolves as null initially)
    const timestamp = room.timerStartedAt as any;
    const startMillis = (timestamp && typeof timestamp.toMillis === 'function') 
      ? timestamp.toMillis() 
      : Date.now();

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startMillis) / 1000);
      const remaining = Math.max(0, timerLimit - elapsedSeconds);
      setOnlineTimer(remaining);

      if (remaining <= 0) {
        // Any active client to notice timeout triggers handleTimeout in firestore
        handleTimeout(room.roomCode);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [room?.status, room?.timerStartedAt, room?.roomCode, handleTimeout]);

  // -------------------------------------------------------
  // LOCAL TIMER TICK
  // -------------------------------------------------------
  React.useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer((p) => {
          if (p <= 4 && p > 1) sfx.playBeep(330, 0.08, "triangle");
          else if (p === 1) sfx.playBeep(660, 0.4, "sawtooth");
          return p - 1;
        });
      }, 1000);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
      handleLocalTimeout();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timer, timerActive]);

  // -------------------------------------------------------
  // LOCAL CORE ACTIONS
  // -------------------------------------------------------
  const triggerParticles = () => {
    const list = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30, // center area
      y: 40 + Math.random() * 20,
      color: Math.random() > 0.5 ? "#3B82F6" : "#EF4444",
    }));
    setParticles(list);
    setTimeout(() => setParticles([]), 1000);
  };

  const handleStartLocalGame = () => {
    sfx.playBeep(440, 0.1);
    localAskedQuestionsRef.current.clear();
    setBlueTeam({ name: localMode === "pvp" ? "Player Blue" : "Team Blue", score: 0, playersCount: 1, streak: 0 });
    setRedTeam({ name: localMode === "pvp" ? "Player Red" : "Team Red", score: 0, playersCount: 1, streak: 0 });
    setRopePosition(0);
    setLocalRound(1);
    setBlueLocked(false);
    setRedLocked(false);

    // Initial problem
    const prob = generateTugProblem(localCategory, localDifficulty, localAskedQuestionsRef.current);
    setCurrentProblem(prob);

    setTimer(localTimerLimit);
    setTimerActive(true);
    setScreen("localPlay");
  };

  const handleLocalAnswer = (team: "blue" | "red", choice: string) => {
    if (!currentProblem || !timerActive) return;
    if (team === "blue" && blueLocked) return;
    if (team === "red" && redLocked) return;

    const isCorrect = choice === currentProblem.answer;

    if (isCorrect) {
      sfx.playDing();
      sfx.playCheer();
      triggerParticles();

      const shift = team === "blue" ? 1 : -1;
      const nextPos = ropePosition + shift;
      setRopePosition(nextPos);

      // Shake animation
      setShake(team === "blue" ? "left" : "right");
      setTimeout(() => setShake("none"), 800);

      // Adjust scores/streaks
      if (team === "blue") {
        setBlueTeam((prev) => ({ ...prev, score: prev.score + 10, streak: prev.streak + 1 }));
        setRedTeam((prev) => ({ ...prev, streak: 0 }));
      } else {
        setRedTeam((prev) => ({ ...prev, score: prev.score + 10, streak: prev.streak + 1 }));
        setBlueTeam((prev) => ({ ...prev, streak: 0 }));
      }

      // Check win condition
      if (Math.abs(nextPos) >= localWinPulls) {
        setTimerActive(false);
        sfx.playCheer();
        sfx.playFanfare();
        setScreen("gameOver");
        return;
      }

      // Check rounds limit
      if (localRoundsLimit > 0 && localRound >= localRoundsLimit) {
        setTimerActive(false);
        sfx.playCheer();
        sfx.playFanfare();
        setScreen("gameOver");
        return;
      }

      setLocalRound((r) => r + 1);

      // Load next problem
      const prob = generateTugProblem(localCategory, localDifficulty, localAskedQuestionsRef.current);
      setCurrentProblem(prob);
      setTimer(localTimerLimit);
      setBlueLocked(false);
      setRedLocked(false);
    } else {
      sfx.playBuzz();
      setShake("fail");
      setTimeout(() => setShake("none"), 400);

      // Lockout team for 2.5 seconds
      if (team === "blue") {
        setBlueLocked(true);
        setTimeout(() => setBlueLocked(false), 2500);
        // Opponent pulls slightly
        setRopePosition((p) => Math.max(-localWinPulls, p - 0.5));
      } else {
        setRedLocked(true);
        setTimeout(() => setRedLocked(false), 2500);
        // Opponent pulls slightly
        setRopePosition((p) => Math.min(localWinPulls, p + 0.5));
      }
    }
  };

  // Keyboard Hotkeys support for local shared-screen play
  React.useEffect(() => {
    if (screen !== "localPlay" || !timerActive || !currentProblem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // Blue controls: Q, W, E, R (corresponding to option indices 0, 1, 2, 3)
      if (["q", "w", "e", "r"].includes(key)) {
        const idx = ["q", "w", "e", "r"].indexOf(key);
        if (currentProblem.options[idx]) {
          handleLocalAnswer("blue", currentProblem.options[idx]);
        }
      }
      // Red controls: u, i, o, p (corresponding to option indices 0, 1, 2, 3)
      if (["u", "i", "o", "p"].includes(key)) {
        const idx = ["u", "i", "o", "p"].indexOf(key);
        if (currentProblem.options[idx]) {
          handleLocalAnswer("red", currentProblem.options[idx]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen, timerActive, currentProblem, ropePosition, blueLocked, redLocked, localRound]);

  const handleLocalTimeout = () => {
    sfx.playBuzz();
    toast({ title: "⏰ Time is up!", description: "Rope shifts slightly towards center.", duration: 2500 });
    
    // Shift rope slightly back to center
    let nextPos = ropePosition;
    if (ropePosition > 0) nextPos = Math.max(0, ropePosition - 0.5);
    else if (ropePosition < 0) nextPos = Math.min(0, ropePosition + 0.5);
    setRopePosition(nextPos);

    // Check rounds limit
    if (localRoundsLimit > 0 && localRound >= localRoundsLimit) {
      setTimerActive(false);
      sfx.playCheer();
      sfx.playFanfare();
      setScreen("gameOver");
      return;
    }

    setLocalRound((r) => r + 1);

    // Next round
    const prob = generateTugProblem(localCategory, localDifficulty, localAskedQuestionsRef.current);
    setCurrentProblem(prob);
    setTimer(localTimerLimit);
    setTimerActive(true);
    setBlueLocked(false);
    setRedLocked(false);
  };

  // -------------------------------------------------------
  // ONLINE MODE ACTIONS
  // -------------------------------------------------------
  const handleCreateRoom = async () => {
    setIsBusy(true); setOnlineError("");
    try {
      const config: TugRoomConfig = {
        rounds: onlineRoundsLimit,
        timerLimit: onlineTimerLimit,
        categoryId: onlineCategory,
        difficulty: onlineDifficulty,
        winPullsRequired: onlineWinPulls,
      };
      const code = await createRoom(myPlayerId, myPlayerName.trim() || "Host", config);
      setMyRoomCode(code);
      setIsCreator(true);
      setScreen("onlinePlay");
      sfx.playDing();
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
        setScreen("onlinePlay");
        sfx.playDing();
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

  const handleSwitchTeam = async (team: 'blue' | 'red') => {
    if (!room || !myRoomCode) return;
    await selectTeam(myRoomCode, myPlayerId, team);
    sfx.playBeep(440, 0.05);
  };

  const handleStartOnlineGame = async () => {
    if (!room || !myRoomCode || !isCreator) return;
    onlineAskedQuestionsRef.current.clear();
    const prob = generateTugProblem(room.config.categoryId, room.config.difficulty, onlineAskedQuestionsRef.current);
    await startGame(myRoomCode, prob);
    sfx.playFanfare();
  };

  const handleOnlineAnswer = async (choice: string) => {
    if (!room || !myRoomCode || room.status !== "playing") return;
    const me = room.players[myPlayerId];
    if (!me || me.lastAnsweredCorrectly !== null) return; // Locked out or already answered

    const isCorrect = choice === room.currentProblem?.answer;
    
    if (isCorrect) {
      await submitAnswer(myRoomCode, myPlayerId, true);
    } else {
      sfx.playBuzz();
      await submitAnswer(myRoomCode, myPlayerId, false);
      toast({ title: "❌ Incorrect Answer!", description: "Locked out for this round", variant: "destructive" });
    }
  };

  const handleOnlineNextRound = async () => {
    if (!room || !myRoomCode || !isCreator) return;
    if (room.config.rounds > 0 && room.currentRound >= room.config.rounds) {
      await endOnlineGameByScore(myRoomCode);
      return;
    }
    const prob = generateTugProblem(room.config.categoryId, room.config.difficulty, onlineAskedQuestionsRef.current);
    await startNextRound(myRoomCode, prob, room.currentRound + 1);
  };

  const handleOnlineRestart = async () => {
    if (!room || !myRoomCode || !isCreator) return;
    onlineAskedQuestionsRef.current.clear();
    await resetRoom(myRoomCode);
  };

  const handleLeaveRoom = async () => {
    if (!myRoomCode) return;
    if (isCreator) {
      await closeRoom(myRoomCode);
    } else {
      await leaveRoom(myRoomCode, myPlayerId);
    }
    setMyRoomCode(null);
    setIsCreator(false);
    setScreen("modeSelect");
    sfx.playBeep(350, 0.1);
  };

  // -------------------------------------------------------
  // RENDER SELECTION SCREEN
  // -------------------------------------------------------
  const renderModeSelect = () => {
    return (
      <div className="max-w-3xl mx-auto w-full p-6 space-y-8 text-center bg-slate-950/40 border border-slate-900 rounded-3xl p-8 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/5">
            <Swords className="h-12 w-12" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display">Tug of War Math</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">Knowledge is power! Pull the rope to your side and claim victory by solving math equations faster than your opponent.</p>
        </div>

        <div className="grid gap-4 pt-2">
          <button onClick={() => { sfx.playBeep(440, 0.08); setScreen("localConfig"); }}
            className="w-full py-6 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850/80 rounded-3xl flex items-center gap-5 px-8 text-left transition-all group hover:scale-[1.02] shadow-md">
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Play className="h-7 w-7" />
            </div>
            <div>
              <p className="font-extrabold text-white text-lg sm:text-xl">Local Shared Screen</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Play PVP or Team vs Team on a single computer using hotkeys</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-500 ml-auto group-hover:text-cyan-400 transition-colors" />
          </button>

          <button onClick={() => { sfx.playBeep(440, 0.08); setScreen("onlineConfig"); }}
            className="w-full py-6 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850/80 rounded-3xl flex items-center gap-5 px-8 text-left transition-all group hover:scale-[1.02] shadow-md">
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="font-extrabold text-white text-lg sm:text-xl">Online Multiplayer</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Create or join rooms to compete with classmates live on separate screens</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-500 ml-auto group-hover:text-purple-400 transition-colors" />
          </button>
        </div>

        {/* Game Mechanics Description / How to Play */}
        <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-3xl text-left space-y-4 max-w-2xl mx-auto mt-6">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" /> Game Mechanics & How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="space-y-1.5">
              <p className="font-black text-slate-200">🚩 The Objective</p>
              <p className="leading-relaxed">Pull the rope to your side! Each correct answer pulls the rope 1 step closer to your team. The team wins when their opponent's boundary marker crosses the RED LINE in the middle, or when they have more points at the round limit.</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-black text-slate-200">⚡ Penalties & Lockouts</p>
              <p className="leading-relaxed">Answering incorrectly locks you or your team out for 2.5 seconds, giving the opposing team an advantage to pull the rope towards their side. Solve carefully but quickly!</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-black text-slate-200">🕹️ Local Hotkeys</p>
              <p className="leading-relaxed">
                • <span className="font-mono text-cyan-400">Blue Team (Left)</span>: keys <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">Q</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">W</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">E</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">R</kbd><br />
                • <span className="font-mono text-rose-400">Red Team (Right)</span>: keys <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">U</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">I</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">O</kbd> <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">P</kbd>
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="font-black text-slate-200">🌐 Online Play</p>
              <p className="leading-relaxed">Join or create rooms. Every correct answer from any teammate adds pulls for your team. Synchronize live timers and win as a team!</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER LOCAL CONFIG SCREEN
  // -------------------------------------------------------
  const renderLocalConfig = () => {
    return (
      <div className="max-w-3xl mx-auto w-full p-8 space-y-6 bg-slate-950/60 border border-slate-900 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-900">
          <Swords className="h-6 w-6 text-indigo-400" />
          <h3 className="font-black text-white text-xl">Local Arena Setup</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-black text-slate-200">Choose Math Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => { sfx.playBeep(380, 0.05); setLocalCategory(c.id); }}
                  className={cn("p-3.5 text-left border rounded-2xl flex items-center gap-3 transition-all",
                    localCategory === c.id ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900/90")}>
                  <span className="text-xl">{c.emoji}</span>
                  <div className="truncate">
                    <p className="text-sm font-black">{c.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-black text-slate-200">Difficulty Level</Label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1.5 rounded-xl">
                {["easy", "medium", "hard"].map((d) => (
                  <button key={d} onClick={() => { sfx.playBeep(380, 0.05); setLocalDifficulty(d as any); }}
                    className={cn("py-2.5 text-xs font-black capitalize rounded-lg transition-all",
                      localDifficulty === d ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black text-slate-200">Pulls to Win</Label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1.5 rounded-xl">
                {[3, 5, 8].map((n) => (
                  <button key={n} onClick={() => { sfx.playBeep(380, 0.05); setLocalWinPulls(n); }}
                    className={cn("py-2.5 text-xs font-black rounded-lg transition-all",
                      localWinPulls === n ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-black text-slate-200">Question Timer</Label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1.5 rounded-xl">
                {[10, 15, 20].map((t) => (
                  <button key={t} onClick={() => { sfx.playBeep(380, 0.05); setLocalTimerLimit(t); }}
                    className={cn("py-2.5 text-xs font-black rounded-lg transition-all",
                      localTimerLimit === t ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}>
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black text-slate-200">Game Mode</Label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1.5 rounded-xl">
                {["pvp", "team"].map((m) => (
                  <button key={m} onClick={() => { sfx.playBeep(380, 0.05); setLocalMode(m as any); }}
                    className={cn("py-2.5 text-xs font-black capitalize rounded-lg transition-all",
                      localMode === m ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}>
                    {m === "pvp" ? "Player vs Player" : "Teams"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black text-slate-200">Total Rounds</Label>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <input type="checkbox" id="localUnlimitedRounds" checked={localRoundsLimit === 0}
                    onChange={(e) => setLocalRoundsLimit(e.target.checked ? 0 : 10)}
                    className="rounded border-slate-800 bg-slate-900 text-indigo-600" />
                  <label htmlFor="localUnlimitedRounds" className="cursor-pointer font-bold select-none">Unlimited</label>
                </div>
              </div>
              <input type="number" min={1} max={100} value={localRoundsLimit === 0 ? "" : localRoundsLimit} disabled={localRoundsLimit === 0}
                onChange={(e) => setLocalRoundsLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                placeholder="Unlimited"
                className="w-full bg-slate-900 border border-slate-800 text-sm text-white p-3 px-4 rounded-xl focus:border-indigo-500 outline-none font-bold text-center h-[52px] disabled:opacity-50 disabled:cursor-not-allowed" />
            </div>

            <div className="space-y-2" />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-900">
          <Button variant="ghost" onClick={() => { sfx.playBeep(380, 0.08); setScreen("modeSelect"); }} className="flex-1 py-6 border border-slate-800 text-slate-300 rounded-2xl text-xs uppercase font-black tracking-wider">
            Back
          </Button>
          <Button onClick={handleStartLocalGame} className="flex-1 py-6 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-2xl text-xs uppercase font-black tracking-wider hover:scale-[1.03] transition-all shadow-lg">
            Enter Arena
          </Button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER TUG OF WAR ANIMATED ARENA
  // -------------------------------------------------------
  const renderArena = (position: number, winTarget: number) => {
    // calculate shift pixels (max win offset in pixels)
    const maxShiftPx = 140;
    const offsetPx = -(position / winTarget) * maxShiftPx; // Shifts left for positive (Blue), right for negative (Red)

    return (
      <div className={cn("relative w-full h-64 rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden transition-all duration-300 shadow-inner",
        shake === "left" && "animate-[bounce_0.3s_infinite]",
        shake === "right" && "animate-[bounce_0.3s_infinite]",
        shake === "fail" && "animate-[ping_0.2s_1]")}>
        
        {/* Dirt ground background lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-[2px] h-full bg-slate-100" />
          <div className="w-[300px] h-[300px] rounded-full border-2 border-slate-100" />
        </div>

        {/* Center line (Red Line on the ground) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-red-600 -translate-x-1/2 flex flex-col justify-between items-center text-xs text-red-500 font-black py-2 z-10">
          <span className="bg-slate-950 px-2 py-0.5 border border-red-500/30 rounded-md">RED</span>
          <span className="bg-slate-950 px-2 py-0.5 border border-red-550/30 rounded-md">LINE</span>
        </div>

        {/* Win Zones */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-blue-600/30 to-transparent border-r-2 border-blue-500/30 flex items-center justify-center">
          <div className="text-xs text-blue-400 font-black origin-center -rotate-90 select-none uppercase tracking-widest whitespace-nowrap">BLUE GOAL</div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-red-600/30 to-transparent border-l-2 border-red-500/30 flex items-center justify-center">
          <div className="text-xs text-red-400 font-black origin-center rotate-90 select-none uppercase tracking-widest whitespace-nowrap">RED GOAL</div>
        </div>

        {/* Emitters (dust/smoke particles) */}
        {particles.map((p) => (
          <div key={p.id} className="absolute w-4.5 h-4.5 rounded-full animate-ping opacity-60"
            style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.color }} />
        ))}

        {/* The Rope System (including characters and markers) */}
        <div className="absolute inset-x-0 top-1/2 h-16 -translate-y-1/2 flex items-center transition-transform duration-700 ease-out"
          style={{ transform: `translateX(${offsetPx}px)` }}>
          
          {/* Rope line */}
          <div className="absolute inset-x-0 top-1/2 h-4.5 -translate-y-1/2 bg-[repeating-linear-gradient(45deg,#78350f,#78350f_15px,#b45309_15px,#b45309_30px)] border-2 border-yellow-950 shadow-lg shadow-black/60" />

          {/* Left pulling team (Blue) */}
          <div className="absolute right-[53%] flex items-center gap-3 pr-4">
            <div className="flex items-center gap-2.5 animate-[pulse_0.8s_infinite]">
              <span className="text-5xl filter drop-shadow-[0_4px_10px_rgba(59,130,246,0.7)]">🏋️‍♂️</span>
              <span className="text-[40px] filter drop-shadow-[0_3px_8px_rgba(59,130,246,0.6)]">🏃‍♂️</span>
              <span className="text-[32px] filter drop-shadow-[0_2px_6px_rgba(59,130,246,0.5)]">🧑‍💻</span>
            </div>
            <div className="text-xs bg-blue-600 text-white font-black px-2.5 py-1 rounded-xl uppercase tracking-wider select-none animate-bounce shadow-md">Blue Team</div>
          </div>

          {/* Blue Boundary Marker (on rope) */}
          <div className="absolute left-[calc(50%-140px)] top-1/2 -translate-y-1/2 w-4 h-10 bg-cyan-400 border-2 border-white rounded shadow-lg shadow-cyan-500/50 animate-pulse z-20" title="Blue Team Boundary Marker" />

          {/* Center Flag on Rope (Yellow Pointer) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-16 flex flex-col items-center justify-center z-20">
            <div className="w-1.5 bg-black h-12" />
            <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white -mt-7 animate-pulse shadow-lg shadow-yellow-500/80" />
          </div>

          {/* Red Boundary Marker (on rope) */}
          <div className="absolute left-[calc(50%+140px)] top-1/2 -translate-y-1/2 w-4 h-10 bg-rose-500 border-2 border-white rounded shadow-lg shadow-rose-500/50 animate-pulse z-20" title="Red Team Boundary Marker" />

          {/* Right pulling team (Red) */}
          <div className="absolute left-[53%] flex items-center gap-3 pl-4">
            <div className="text-xs bg-red-600 text-white font-black px-2.5 py-1 rounded-xl uppercase tracking-wider select-none animate-bounce shadow-md">Red Team</div>
            <div className="flex items-center gap-2.5 animate-[pulse_0.8s_infinite]">
              <span className="text-[32px] filter drop-shadow-[0_2px_6px_rgba(239,68,68,0.5)]">🧑‍🔬</span>
              <span className="text-[40px] filter drop-shadow-[0_3px_8px_rgba(239,68,68,0.6)]">🏃‍♀️</span>
              <span className="text-5xl filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.7)]">🏋️‍♀️</span>
            </div>
          </div>

        </div>

        {/* Pull Force Indicator Bar (Top overlay) */}
        <div className="absolute bottom-4 inset-x-16 h-10 flex items-center justify-between text-xs font-black tracking-wider text-slate-300 bg-slate-900/90 px-6 rounded-2xl border border-slate-800 shadow-md">
          <span>BLUE TEAM</span>
          <div className="flex-1 max-w-md mx-6 h-3.5 bg-slate-950 rounded-full overflow-hidden flex relative">
            <div className="absolute inset-y-0 left-1/2 right-1/2 h-full bg-slate-850" />
            {/* Dynamic offset filling */}
            <div className={cn("h-full transition-all duration-500", position >= 0 ? "bg-blue-500 mr-[50%] ml-auto" : "bg-red-500 ml-[50%]")}
              style={{ width: `${Math.abs(position / winTarget) * 50}%` }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-red-600" />
          </div>
          <span>RED TEAM</span>
        </div>

      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER LOCAL GAME ARENA
  // -------------------------------------------------------
  const renderLocalPlay = () => {
    if (!currentProblem) return null;
    const timerPct = (timer / localTimerLimit) * 100;

    return (
      <div className="max-w-[98%] mx-auto w-full p-4 space-y-6">
        {/* Header toolbar */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => { sfx.playBeep(380, 0.1); setTimerActive(false); setScreen("localConfig"); }}
            className="bg-slate-950 border border-slate-900 text-slate-300 text-sm font-black uppercase rounded-2xl h-12 px-6">
            Exit Game
          </Button>

          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-extrabold text-sm px-4 py-1.5 rounded-xl">
              Category: {CATEGORIES.find((c) => c.id === localCategory)?.name}
            </Badge>
            <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-extrabold text-sm px-4 py-1.5 rounded-xl capitalize">
              {localDifficulty}
            </Badge>
          </div>

          <div className={cn("text-5xl font-black tabular-nums tracking-tight",
            timerPct > 50 ? "text-emerald-400" : timerPct > 20 ? "text-amber-400" : "text-red-500 animate-pulse")}>
            {timer}s
          </div>
        </div>

        {/* Animated Rope Arena */}
        {renderArena(ropePosition, localWinPulls)}

        {/* Central Question Display */}
        <div className="bg-gradient-to-b from-indigo-950/20 to-slate-950 border border-indigo-500/25 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          <span className="text-xs text-indigo-400 font-black uppercase tracking-widest block mb-2">Active Question</span>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">{currentProblem.question}</h2>
        </div>

        {/* Control Areas for single screen PVP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Blue Side Control */}
          <Card className={cn("p-6 bg-blue-950/10 border-blue-500/20 flex flex-col justify-between space-y-6 relative rounded-3xl",
            blueLocked && "opacity-40 pointer-events-none")}>
            {blueLocked && (
              <div className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20">
                <AlertCircle className="h-8 w-8 text-red-500 animate-bounce mb-2" />
                <p className="text-lg font-black text-red-500 uppercase">Incorrect Penalty Lockout</p>
                <p className="text-sm text-slate-400 mt-1">Unlock in 2s...</p>
              </div>
            )}
            
            <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
              <div>
                <p className="text-lg font-black text-blue-400 uppercase tracking-widest">{blueTeam.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Pulls: {ropePosition > 0 ? ropePosition : 0}/{localWinPulls}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-300 font-extrabold text-sm px-3 py-1 rounded-lg">Score: {blueTeam.score}</Badge>
                {blueTeam.streak >= 3 && <Badge className="bg-amber-500/20 text-amber-300 text-xs font-black px-2 py-1 rounded-lg">🔥 {blueTeam.streak} Streak</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {currentProblem.options.map((option, idx) => {
                const keys = ["Q", "W", "E", "R"];
                return (
                  <Button key={option} onClick={() => handleLocalAnswer("blue", option)} variant="outline"
                    className="h-24 sm:h-28 border-slate-800 bg-slate-950/60 hover:bg-blue-600/10 hover:border-blue-500/35 text-white font-extrabold flex flex-col items-center justify-center p-3 group rounded-2xl shadow-sm transition-all hover:scale-[1.02]">
                    <span className="text-2xl sm:text-3xl font-black text-slate-100">{option}</span>
                    <span className="text-xs text-blue-400 font-black bg-blue-500/10 px-3 py-1 rounded-md mt-2 group-hover:bg-blue-500 group-hover:text-white transition-all">Key: {keys[idx]}</span>
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Red Side Control */}
          <Card className={cn("p-6 bg-red-950/10 border-red-500/20 flex flex-col justify-between space-y-6 relative rounded-3xl",
            redLocked && "opacity-40 pointer-events-none")}>
            {redLocked && (
              <div className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20">
                <AlertCircle className="h-8 w-8 text-red-500 animate-bounce mb-2" />
                <p className="text-lg font-black text-red-500 uppercase">Incorrect Penalty Lockout</p>
                <p className="text-sm text-slate-400 mt-1">Unlock in 2s...</p>
              </div>
            )}
            
            <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
              <div>
                <p className="text-lg font-black text-red-400 uppercase tracking-widest">{redTeam.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Pulls: {ropePosition < 0 ? Math.abs(ropePosition) : 0}/{localWinPulls}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-red-500/20 text-red-300 font-extrabold text-sm px-3 py-1 rounded-lg">Score: {redTeam.score}</Badge>
                {redTeam.streak >= 3 && <Badge className="bg-amber-500/20 text-amber-300 text-xs font-black px-2 py-1 rounded-lg">🔥 {redTeam.streak} Streak</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {currentProblem.options.map((option, idx) => {
                const keys = ["U", "I", "O", "P"];
                return (
                  <Button key={option} onClick={() => handleLocalAnswer("red", option)} variant="outline"
                    className="h-24 sm:h-28 border-slate-800 bg-slate-950/60 hover:bg-red-600/10 hover:border-red-500/35 text-white font-extrabold flex flex-col items-center justify-center p-3 group rounded-2xl shadow-sm transition-all hover:scale-[1.02]">
                    <span className="text-2xl sm:text-3xl font-black text-slate-100">{option}</span>
                    <span className="text-xs text-red-400 font-black bg-red-500/10 px-3 py-1 rounded-md mt-2 group-hover:bg-red-500 group-hover:text-white transition-all">Key: {keys[idx]}</span>
                  </Button>
                );
              })}
            </div>
          </Card>

        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER ONLINE CONFIG/SETUP SCREEN
  // -------------------------------------------------------
  const renderOnlineConfig = () => {
    return (
      <div className="max-w-3xl mx-auto w-full p-8 space-y-6 bg-slate-950/60 border border-slate-900 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="text-center space-y-2">
          <Wifi className="h-10 w-10 text-purple-400 mx-auto animate-pulse" />
          <h3 className="text-3xl font-black text-white font-display">Online Arena Setup</h3>
          <p className="text-sm text-slate-400">Play with other players on the internet</p>
        </div>

        {onlineError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold rounded-2xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{onlineError}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-black text-slate-200">Your Nickname</Label>
            <Input value={myPlayerName} onChange={(e) => setMyPlayerName(e.target.value)} maxLength={15}
              className="bg-slate-900 border-slate-800 text-white rounded-2xl py-6 px-4 text-lg font-black focus:border-purple-500" />
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
            <Label className="text-sm font-black uppercase text-purple-400 tracking-wider">Host a Room</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400">Math Topic</span>
                <select value={onlineCategory} onChange={(e) => setOnlineCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none">
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400">Difficulty</span>
                <select value={onlineDifficulty} onChange={(e) => setOnlineDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400">Winning Pulls (3-8)</span>
                <input type="number" min={3} max={8} value={onlineWinPulls} onChange={(e) => setOnlineWinPulls(Math.max(3, Math.min(8, parseInt(e.target.value) || 5)))}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400">Timer Limit (10-30s)</span>
                <input type="number" min={10} max={30} value={onlineTimerLimit} onChange={(e) => setOnlineTimerLimit(Math.max(10, Math.min(30, parseInt(e.target.value) || 15)))}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">Total Rounds</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <input type="checkbox" id="onlineUnlimitedRounds" checked={onlineRoundsLimit === 0}
                      onChange={(e) => setOnlineRoundsLimit(e.target.checked ? 0 : 10)}
                      className="rounded border-slate-800 bg-slate-900 text-purple-650" />
                    <label htmlFor="onlineUnlimitedRounds" className="cursor-pointer font-bold select-none">Unlimited</label>
                  </div>
                </div>
                <input type="number" min={1} max={100} value={onlineRoundsLimit === 0 ? "" : onlineRoundsLimit} disabled={onlineRoundsLimit === 0}
                  onChange={(e) => setOnlineRoundsLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                  placeholder="Unlimited"
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white p-3 rounded-xl focus:border-purple-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
            </div>
            <Button onClick={handleCreateRoom} disabled={isBusy || !myPlayerName.trim()}
              className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs uppercase font-black tracking-wider flex items-center justify-center gap-2 mt-2 shadow-lg">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create Room
            </Button>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
            <Label className="text-sm font-black uppercase text-cyan-400 tracking-wider">Join Existing Room</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="ENTER INVITE CODE" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                className="bg-slate-950 border-slate-800 text-white rounded-2xl py-6 px-4 text-center font-black text-lg tracking-widest placeholder:tracking-normal flex-1" />
              <Button onClick={handleJoinRoom} disabled={isBusy || !myPlayerName.trim() || joinCodeInput.length !== 6}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xs rounded-2xl py-6 px-8 tracking-wider shadow-lg">
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Game"}
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button variant="ghost" onClick={() => { sfx.playBeep(380, 0.08); setScreen("modeSelect"); }} className="w-full py-5 border border-slate-800 text-slate-300 rounded-2xl text-xs uppercase font-black tracking-wider">
            Back to mode selection
          </Button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // RENDER ONLINE GAMEPLAY (Lobby + Playing Arena)
  // -------------------------------------------------------
  const renderOnlinePlay = () => {
    if (roomLoading) {
      return (
        <div className="max-w-md mx-auto w-full p-8 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto" />
          <p className="text-sm font-bold text-slate-400">Syncing with Arena Room...</p>
        </div>
      );
    }

    if (roomError || !room) {
      return (
        <div className="max-w-md mx-auto w-full p-6 text-center space-y-4 bg-slate-950/80 border border-slate-900 rounded-3xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h4 className="font-black text-white text-lg">Failed to Join Room</h4>
          <p className="text-slate-400 text-xs">{roomError || "Room connection lost or closed."}</p>
          <Button onClick={() => setScreen("onlineConfig")} className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold uppercase text-xs">
            Return Setup
          </Button>
        </div>
      );
    }

    const me = room.players[myPlayerId];
    const playerList = Object.values(room.players || {});
    const blueTeamList = playerList.filter((p) => p.team === "blue");
    const redTeamList = playerList.filter((p) => p.team === "red");

    // LOBBY VIEW
    if (room.status === "lobby") {
      const allReady = playerList.length >= 2 && playerList.every((p) => p.isReady);

      return (
        <div className="max-w-5xl mx-auto w-full p-4 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800 rounded-3xl">
            <div>
              <span className="text-xs font-black uppercase text-purple-400 tracking-wider">Online Lobby</span>
              <h3 className="text-2xl font-black text-white">Invite Code: <span className="text-purple-400 underline font-mono select-all ml-1">{room.roomCode}</span></h3>
              <p className="text-xs text-slate-400 mt-0.5">Share this code with teammates so they can join.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => {
                navigator.clipboard.writeText(room.roomCode);
                toast({ title: "📋 Code Copied!", description: "Invite code copied to clipboard", duration: 1500 });
              }} variant="outline" className="border-slate-800 text-slate-350 text-sm font-black uppercase rounded-2xl h-11 px-5">
                <Copy className="h-4 w-4 mr-1.5" /> Copy Code
              </Button>
              <Button onClick={handleLeaveRoom} variant="ghost" className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-black uppercase rounded-2xl h-11 px-5">
                <LogOut className="h-4 w-4 mr-1.5" /> Leave Room
              </Button>
            </div>
          </div>

          {/* Config Summary Card */}
          <Card className="p-6 bg-slate-900/40 border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center rounded-3xl shadow-lg">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Category</span>
              <span className="text-sm font-black text-white capitalize">{CATEGORIES.find((c) => c.id === room.config.categoryId)?.emoji} {room.config.categoryId}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Difficulty</span>
              <span className="text-sm font-black text-white capitalize">{room.config.difficulty}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Pulls</span>
              <span className="text-sm font-black text-white">{room.config.winPullsRequired} pulls</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Time Limit</span>
              <span className="text-sm font-black text-white">{room.config.timerLimit}s</span>
            </div>
          </Card>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Team Blue Lobby */}
            <div className="space-y-4 p-6 bg-blue-950/10 border border-blue-500/10 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
                <div>
                  <h4 className="font-black text-blue-400 text-base uppercase tracking-widest">Team Blue ({blueTeamList.length})</h4>
                  <p className="text-xs text-slate-500">Pulls Left (Left Side)</p>
                </div>
                {me?.team !== "blue" && (
                  <Button onClick={() => handleSwitchTeam("blue")} size="sm" variant="outline" className="border-blue-500/30 text-blue-400 text-xs font-extrabold hover:bg-blue-600/10 rounded-xl px-4 py-2">
                    Join Team
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {blueTeamList.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-900 rounded-2xl">
                    <span className="text-sm text-slate-200 font-extrabold">{p.name} {p.id === room.creatorId && "👑"}</span>
                    {p.isReady ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs font-black border-transparent px-3 py-1 rounded-md">Ready</Badge>
                    ) : (
                      <Badge className="bg-slate-900 text-slate-500 text-xs font-bold border-transparent px-3 py-1 rounded-md">Waiting</Badge>
                    )}
                  </div>
                ))}
                {blueTeamList.length === 0 && <p className="text-center text-xs text-slate-500 py-6">No players on Team Blue yet.</p>}
              </div>
            </div>

            {/* Team Red Lobby */}
            <div className="space-y-4 p-6 bg-red-950/10 border border-red-500/10 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
                <div>
                  <h4 className="font-black text-red-400 text-base uppercase tracking-widest">Team Red ({redTeamList.length})</h4>
                  <p className="text-xs text-slate-500">Pulls Right (Right Side)</p>
                </div>
                {me?.team !== "red" && (
                  <Button onClick={() => handleSwitchTeam("red")} size="sm" variant="outline" className="border-red-500/30 text-red-400 text-xs font-extrabold hover:bg-red-600/10 rounded-xl px-4 py-2">
                    Join Team
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {redTeamList.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-900 rounded-2xl">
                    <span className="text-sm text-slate-200 font-extrabold">{p.name} {p.id === room.creatorId && "👑"}</span>
                    {p.isReady ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs font-black border-transparent px-3 py-1 rounded-md">Ready</Badge>
                    ) : (
                      <Badge className="bg-slate-900 text-slate-500 text-xs font-bold border-transparent px-3 py-1 rounded-md">Waiting</Badge>
                    )}
                  </div>
                ))}
                {redTeamList.length === 0 && <p className="text-center text-xs text-slate-500 py-6">No players on Team Red yet.</p>}
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="text-center p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl space-y-4 shadow-sm">
            <div className="flex justify-center gap-4">
              <Button onClick={handleToggleReady}
                className={cn("px-10 py-5 font-black uppercase text-xs rounded-xl tracking-wider hover:scale-105 transition-all shadow-md",
                  me?.isReady ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white")}>
                {me?.isReady ? "Not Ready ❌" : "I am Ready! ✓"}
              </Button>

              {isCreator && (
                <Button onClick={handleStartOnlineGame} disabled={!allReady}
                  className="px-12 py-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-105 transition-all disabled:opacity-40 disabled:scale-100 flex items-center gap-2 shadow-lg shadow-purple-500/20">
                  <Play className="h-4 w-4" /> Start Battle
                </Button>
              )}
            </div>
            {!isCreator && <p className="text-xs text-slate-500">Wait for the room creator to start once everyone is ready.</p>}
            {isCreator && !allReady && <p className="text-xs text-amber-500 font-bold">Needs at least 2 players in the room, and all players must be Ready.</p>}
          </div>

        </div>
      );
    }

    // GAMEPLAY VIEW (playing, round_end, game_over)
    if (room.status === "playing" && room.currentProblem) {
      const correctWinner = playerList.find((p) => p.id === room.pullWinnerId);

      return (
        <div className="max-w-[98%] mx-auto w-full p-4 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <Button onClick={handleLeaveRoom} variant="ghost" className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-black uppercase rounded-2xl h-12 px-6">
              Leave Game
            </Button>
            <div className="flex items-center gap-3 text-sm font-extrabold text-slate-300">
              <span className="bg-purple-600/20 text-purple-300 px-4 py-1.5 rounded-xl border border-purple-500/20">Round {room.currentRound}</span>
              <span className="bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-xl">Invite Code: {room.roomCode}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 text-2xl font-black tabular-nums",
              onlineTimer > 5 ? "text-emerald-400" : "text-red-500 animate-pulse")}>
              <Timer className="h-6 w-6 text-purple-400 animate-pulse" />
              <span>{onlineTimer}s</span>
            </div>
          </div>

          {/* Animated Tug of War Field */}
          {renderArena(room.ropePosition, room.config.winPullsRequired)}

          {/* Problem Display */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-10 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            <span className="text-xs text-purple-400 font-black uppercase tracking-widest block">Topic: {room.config.categoryId}</span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">{room.currentProblem.question}</h2>
          </div>

          {/* Answer Choice Panel */}
          <div className="max-w-4xl mx-auto w-full">
            {me?.lastAnsweredCorrectly !== null ? (
              <Card className="p-8 bg-slate-900/60 border-slate-800 text-center rounded-3xl space-y-4 shadow-xl">
                {me?.lastAnsweredCorrectly === true ? (
                  <div className="space-y-2">
                    <Check className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                    <p className="text-2xl font-black text-emerald-400 tracking-tight">CORRECT!</p>
                    <p className="text-sm text-slate-400">You pulled the rope! Waiting for opponents or host...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <X className="h-12 w-12 text-red-500 mx-auto animate-pulse" />
                    <p className="text-2xl font-black text-red-500 tracking-tight">INCORRECT</p>
                    <p className="text-sm text-slate-400">You are locked out for this round. Teammates can still answer!</p>
                  </div>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {room.currentProblem.options.map((option) => (
                  <Button key={option} onClick={() => handleOnlineAnswer(option)} variant="outline"
                    className="h-24 sm:h-28 border-slate-800 bg-slate-950/60 hover:bg-purple-600/10 hover:border-purple-500/35 text-white font-black text-2xl sm:text-3xl rounded-2xl transition-all hover:scale-[1.02] shadow-sm">
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Active players scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
            <div className="p-4 bg-blue-950/5 border border-blue-500/10 rounded-2xl space-y-3">
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest block">Blue Solvers</span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {blueTeamList.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>{p.name} {p.id === myPlayerId && "★"}</span>
                    <span>{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-red-950/5 border border-red-500/10 rounded-2xl space-y-3">
              <span className="text-xs font-black text-red-400 uppercase tracking-widest block">Red Solvers</span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {redTeamList.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>{p.name} {p.id === myPlayerId && "★"}</span>
                    <span>{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      );
    }

    // ROUND END / PULL RESOLUTION SCREEN
    if (room.status === "round_end") {
      const pullWinner = playerList.find((p) => p.id === room.pullWinnerId);

      return (
        <div className="max-w-4xl mx-auto w-full p-4 space-y-6 text-center">
          {renderArena(room.ropePosition, room.config.winPullsRequired)}

          <div className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="text-5xl">💪</div>
            {room.pullWinnerId === 'all_failed' ? (
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-red-400 font-display">❌ All Players Failed!</h3>
                <p className="text-base text-slate-300 max-w-md mx-auto">Every player submitted an incorrect answer. The rope remains in position.</p>
              </div>
            ) : pullWinner ? (
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white font-display">
                  <span className={cn(pullWinner.team === "blue" ? "text-blue-400" : "text-red-400")}>{pullWinner.name}</span> Answered Correctly!
                </h3>
                <p className="text-base text-slate-300 max-w-md mx-auto">
                  Rope pulled 1 segment towards the <span className={cn("font-black capitalize", pullWinner.team === "blue" ? "text-blue-400" : "text-red-400")}>{pullWinner.team}</span> team!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white font-display">⏰ Round Ended in Timeout</h3>
                <p className="text-base text-slate-300 max-w-md mx-auto">Nobody answered correctly before the timer ran out. The rope remains in position.</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 max-w-md mx-auto space-y-2.5 text-left">
              <span className="text-xs font-black uppercase text-indigo-400 tracking-wider block">Solution details</span>
              <p className="text-sm font-black text-slate-200">Question: <span className="font-mono ml-1">{room.currentProblem?.question}</span></p>
              <p className="text-sm font-black text-emerald-400">Answer: <span className="font-mono ml-1">{room.currentProblem?.answer}</span></p>
              {room.currentProblem?.solutionHint && (
                <p className="text-xs text-slate-400 font-medium">Hint: {room.currentProblem.solutionHint}</p>
              )}
            </div>

            {isCreator && (
              room.config.rounds > 0 && room.currentRound >= room.config.rounds ? (
                <Button onClick={() => endOnlineGameByScore(myRoomCode!)}
                  className="w-full max-w-md mx-auto py-5 bg-gradient-to-r from-amber-500 to-red-600 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-[1.03] transition-all mt-6 flex items-center justify-center gap-2 shadow-lg">
                  <Trophy className="h-4 w-4" /> View Verdict
                </Button>
              ) : (
                <Button onClick={handleOnlineNextRound}
                  className="w-full max-w-md mx-auto py-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-[1.03] transition-all mt-6 flex items-center justify-center gap-2 shadow-lg">
                  <ArrowRight className="h-4 w-4" /> Next Round
                </Button>
              )
            )}
            {!isCreator && (
              room.config.rounds > 0 && room.currentRound >= room.config.rounds ? (
                <p className="text-xs font-bold text-slate-400 mt-6">Waiting for host to reveal the final verdict...</p>
              ) : (
                <p className="text-xs font-bold text-slate-400 mt-6">Waiting for host to start the next round...</p>
              )
            )}
          </div>
        </div>
      );
    }

    // GAME OVER VIEW (Online)
    if (room.status === "game_over") {
      const winningTeamName = room.winnerTeam === "blue" ? "Team Blue" : "Team Red";
      const winTeamList = room.winnerTeam === "blue" ? blueTeamList : redTeamList;

      // Find player with highest score to make MVP
      let mvp: TugPlayer | null = null;
      let hiScore = -1;
      playerList.forEach((p) => {
        if (p.score > hiScore) {
          hiScore = p.score;
          mvp = p;
        }
      });

      return (
        <div className="max-w-2xl mx-auto w-full p-4 space-y-6 text-center">
          <div className="space-y-2">
            <Trophy className="h-14 w-14 text-amber-400 mx-auto animate-bounce drop-shadow-[0_4px_12px_rgba(250,204,21,0.4)]" />
            <h2 className="text-3xl font-black text-white font-display uppercase tracking-tight">🏆 {winningTeamName} Wins the Battle!</h2>
            <p className="text-slate-400 text-xs">
              {Math.abs(room.ropePosition) >= room.config.winPullsRequired
                ? "The boundary marker crossed the red line!"
                : "Battle ended by rounds limit. Winner decided by team points!"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* MVP Panel */}
            <Card className="p-5 bg-slate-900/60 border-slate-800 rounded-3xl flex flex-col justify-between items-center text-center">
              <div>
                <Award className="h-8 w-8 text-indigo-400 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Battle MVP</span>
                <p className="text-lg font-black text-white mt-1">{mvp ? (mvp as TugPlayer).name : "N/A"}</p>
                <p className="text-xs text-slate-400 mt-1">Score: {mvp ? (mvp as TugPlayer).score : 0} points</p>
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-400 font-extrabold text-[10px] border-transparent mt-4">Stellar Performance</Badge>
            </Card>

            {/* Score List */}
            <Card className="p-4 bg-slate-900/40 border-slate-800 rounded-3xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block text-left">Player Scores</span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...playerList].sort((a, b) => b.score - a.score).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl">
                    <span className="text-xs text-slate-200 font-extrabold">#{i + 1} {p.name} <span className="text-[10px] text-slate-500">({p.team})</span></span>
                    <span className="text-xs font-black text-amber-400">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-3">
            {isCreator ? (
              <Button onClick={handleOnlineRestart}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-105 transition-all">
                Return Lobby
              </Button>
            ) : (
              <p className="text-xs font-bold text-slate-400 flex items-center justify-center flex-1">Waiting for host to reset room...</p>
            )}
            <Button onClick={handleLeaveRoom} variant="outline" className="border-slate-800 text-slate-300 text-xs font-black uppercase rounded-xl py-3 px-8">
              Leave Arena
            </Button>
          </div>

        </div>
      );
    }

    return null;
  };

  // -------------------------------------------------------
  // RENDER GAME OVER (LOCAL SCREEN)
  // -------------------------------------------------------
  const renderLocalGameOver = () => {
    let isBlueWin = false;
    let winReason = "The boundary marker crossed the red line!";
    
    if (Math.abs(ropePosition) >= localWinPulls) {
      isBlueWin = ropePosition > 0;
    } else {
      if (blueTeam.score > redTeam.score) {
        isBlueWin = true;
        winReason = `Winner decided by higher points (${blueTeam.score} vs ${redTeam.score})!`;
      } else if (redTeam.score > blueTeam.score) {
        isBlueWin = false;
        winReason = `Winner decided by higher points (${redTeam.score} vs ${blueTeam.score})!`;
      } else {
        isBlueWin = ropePosition >= 0;
        winReason = isBlueWin 
          ? "Points were tied! Blue team wins by rope position advantage." 
          : "Points were tied! Red team wins by rope position advantage.";
      }
    }
    const winnerName = isBlueWin ? blueTeam.name : redTeam.name;

    return (
      <div className="max-w-md mx-auto w-full p-4 space-y-6 text-center">
        <div className="space-y-2">
          <Trophy className="h-16 w-16 text-amber-400 mx-auto animate-bounce drop-shadow-[0_4px_12px_rgba(250,204,21,0.4)]" />
          <h2 className="text-3xl font-black text-white font-display tracking-tight uppercase">🏆 {winnerName} Wins!</h2>
          <p className="text-slate-400 text-xs">{winReason}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-blue-950/10 border-blue-500/20 text-center rounded-2xl">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Blue Score</span>
            <p className="text-2xl font-black text-white mt-1">{blueTeam.score}</p>
          </Card>

          <Card className="p-4 bg-red-950/10 border-red-500/20 text-center rounded-2xl">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Red Score</span>
            <p className="text-2xl font-black text-white mt-1">{redTeam.score}</p>
          </Card>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-3">
          <Button onClick={handleStartLocalGame}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black uppercase text-xs rounded-xl tracking-wider hover:scale-105 transition-all">
            Play Again
          </Button>
          <Button onClick={() => setScreen("localConfig")} variant="outline" className="w-full border-slate-800 text-slate-300 text-xs font-black uppercase rounded-xl py-3">
            Change Settings
          </Button>
          <Button onClick={() => setScreen("modeSelect")} variant="ghost" className="w-full text-slate-500 hover:text-slate-300 text-xs font-bold uppercase py-2">
            Exit Menu
          </Button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // MASTER RENDER
  // -------------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-between py-6">
      
      {/* Top Header Section */}
      <div className="max-w-[95%] mx-auto w-full px-4 flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white font-display">MATH TUG OF WAR</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Battle of the Brains</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <button onClick={() => setIsAudioEnabled((p) => !p)}
            className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
            title="Toggle Audio">
            {isAudioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button onClick={onToggleFullscreen}
              className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
              title="Toggle Fullscreen">
              <Maximize className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Screen Content */}
      <div className="flex-1 max-w-[95%] mx-auto w-full px-4 py-8 flex flex-col justify-center">
        {screen === "modeSelect" && renderModeSelect()}
        {screen === "localConfig" && renderLocalConfig()}
        {screen === "localPlay" && renderLocalPlay()}
        {screen === "onlineConfig" && renderOnlineConfig()}
        {screen === "onlinePlay" && renderOnlinePlay()}
        {screen === "gameOver" && renderLocalGameOver()}
      </div>

      {/* Footer Branding */}
      <div className="max-w-[95%] mx-auto w-full px-4 text-center border-t border-slate-900 pt-4 text-[10px] text-slate-600 font-black tracking-wider uppercase select-none">
        LingoLand Interactive Arena Modules
      </div>

    </div>
  );
}
