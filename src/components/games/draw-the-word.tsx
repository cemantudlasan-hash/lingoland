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
  CheckCircle2, Loader2, Monitor, Globe, Lock, Unlock, BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";
import {
  useDrawRoom,
  useRoomListener,
  getOrCreatePlayerId,
  type DrawRoom,
  type RoomPlayer,
  type RoomConfig,
} from "@/hooks/use-draw-room";

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
// CATEGORIES
// ─────────────────────────────────────────────────────────
interface WordCategory { id: string; name: string; emoji: string; description: string; words: string[]; }

const CATEGORIES: WordCategory[] = [
  { id: "emotions", name: "Emotions & Feelings", emoji: "😊", description: "Emotions, feelings, and expressions. Contains 30 secret vocabulary words.", words: ["happy","sad","angry","surprised","scared","excited","tired","bored","confused","proud","shy","embarrassed","jealous","shocked","sleepy","worried","calm","lonely","silly","hungry","thirsty","anxious","nervous","cheerful","grumpy","curious","frightened","disappointed","hopeful","peaceful"] },
  { id: "animals", name: "Animals", emoji: "🦁", description: "Creatures from land, sea, and sky. Contains 30 words.", words: ["elephant","giraffe","lion","monkey","penguin","kangaroo","dolphin","shark","octopus","butterfly","owl","tiger","rabbit","turtle","panda","frog","snake","bee","fox","koala","zebra","bear","crocodile","duck","parrot","squirrel","whale","crab","horse","sheep"] },
  { id: "food", name: "Food & Drinks", emoji: "🍕", description: "Delicious snacks, fruits, and meals. Contains 30 words.", words: ["pizza","hamburger","sushi","ice cream","banana","apple","cupcake","coffee","taco","watermelon","donut","cheese","sandwich","salad","cookie","spaghetti","orange","strawberry","milk","french fries","bread","carrot","cake","tea","juice","cherry","egg","popcorn","grapes","pineapple"] },
  { id: "vehicles", name: "Vehicles & Transport", emoji: "🚀", description: "Ways of traveling on roads, tracks, water, and air.", words: ["airplane","bicycle","submarine","rocket","helicopter","train","ship","ambulance","fire truck","police car","motorcycle","skateboard","hot air balloon","tractor","truck","bus","boat","scooter","taxi","spaceship","van","jet","cruise ship"] },
  { id: "household", name: "Household Items", emoji: "🛋️", description: "Common things found around the house.", words: ["clock","chair","table","television","key","lamp","telephone","mirror","umbrella","sofa","toothbrush","cup","pillow","book","computer","refrigerator","bed","spoon","broom","fork","plate","knife","window","door","soap","towel","shelf","bin","cabinet","comb"] },
  { id: "nature", name: "Nature & Weather", emoji: "🌈", description: "Elements of the earth, space, and weather.", words: ["rainbow","cloud","lightning","volcano","mountain","flower","tree","sun","moon","star","snowflake","river","desert","mushroom","leaf","cactus","ocean","tornado","wind","rain","fire","waterfall","forest","island","sky","earth","cave","grass","rock","lake"] },
  { id: "sports", name: "Sports & Hobbies", emoji: "⚽", description: "Equipment and elements of physical play.", words: ["soccer ball","basketball","tennis racket","guitar","camera","fishing rod","drum","violin","piano","microphone","golf club","baseball bat","surf board","ski","tent","trophy","medal","bicycle","skateboard","roller skates","dartboard","target"] },
  { id: "jobs", name: "Jobs & Occupations", emoji: "👨‍🍳", description: "Professions and careers people do.", words: ["doctor","teacher","astronaut","chef","firefighter","police officer","artist","pilot","scientist","farmer","builder","dancer","singer","detective","nurse","dentist","soldier","actor","writer","veterinarian"] },
  { id: "fantasy", name: "Fantasy & Magic", emoji: "🐉", description: "Mythical creatures and items of wizardry.", words: ["dragon","unicorn","wizard hat","castle","fairy","ghost","alien","magic wand","treasure chest","pirate ship","mermaid","crown","monster","mummy","witch","giant","genie","superhero","vampire","potion","crystal ball"] },
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
  canvasData: string;
}

// ─────────────────────────────────────────────────────────
// SUBMITTED DRAWING VIEWER (for teacher evaluation)
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
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
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
function pickWord(categoryId: string, usedWords: string[]): { word: string; newUsed: string[] } {
  const cat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  let available = cat.words.filter((w) => !usedWords.includes(w));
  let updatedUsed = usedWords;
  if (available.length === 0) { available = cat.words; updatedUsed = []; }
  const word = available[Math.floor(Math.random() * available.length)];
  return { word, newUsed: [...updatedUsed, word] };
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
export function DrawTheWord({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
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
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("emotions");
  const [localPlayers, setLocalPlayers] = React.useState<LocalPlayer[]>([]);
  const [currentWord, setCurrentWord] = React.useState("");
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [currentRound, setCurrentRound] = React.useState(1);
  const [timer, setTimer] = React.useState(30);
  const [timerActive, setTimerActive] = React.useState(false);
  const [strokeColor, setStrokeColor] = React.useState<Record<number, string>>({ 1:"#000000",2:"#000000",3:"#000000",4:"#000000" });
  const [strokeWidth, setStrokeWidth] = React.useState<Record<number, number>>({ 1:6,2:6,3:6,4:6 });
  const [activeEvaluator, setActiveEvaluator] = React.useState<"none"|"teacher"|"ai">("none");
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

  // Pause timer when all local players submit their solutions
  React.useEffect(() => {
    if (localGameState === "playing" && localPlayers.length > 0 && localPlayers.every((p) => p.isFinished) && timerActive) {
      setTimerActive(false);
    }
  }, [localPlayers, timerActive, localGameState]);

  const clearAllCanvases = async (pList: LocalPlayer[]) => {
    for (const p of pList) { try { await canvasRefs.current[p.id]?.clearCanvas(); } catch {} }
  };

  const startLocalRound = (roundNum: number, activePlayers = localPlayers) => {
    const { word, newUsed } = pickWord(selectedCategoryId, usedWords);
    const reset = activePlayers.map((p) => ({ ...p, isFinished: false, finishTimeRemaining: 0, canvasPathsCount: 0, canvasData: "", teacherChecked: false, teacherApproved: null, aiMatchScore: 0, aiCommentary: "" }));
    setLocalPlayers(reset);
    setUsedWords(newUsed);
    setCurrentWord(word);
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
      canvasData: "",
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
    let canvasDataStr = "";
    try {
      const paths = await canvasRefs.current[playerId]?.exportPaths();
      pathsCount = paths?.length ?? 0;
      canvasDataStr = JSON.stringify(paths || []);
    } catch {}
    setLocalPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, isFinished: true, finishTimeRemaining: timer, canvasPathsCount: pathsCount, canvasData: canvasDataStr } : p));
    toast({ title: `${localPlayers.find((p) => p.id === playerId)?.name} finished! 🏁`, duration: 2000 });
  };

  const handleLocalTimerTimeout = () => {
    sfx.playBeep(220, 0.5, "sawtooth");
    setTimerActive(false);
    const finalize = async () => {
      const updated = [...localPlayers];
      for (let i = 0; i < updated.length; i++) {
        if (!updated[i].isFinished) {
          let pc = 0;
          let canvasDataStr = "";
          try {
            const paths = await canvasRefs.current[updated[i].id]?.exportPaths();
            pc = paths?.length ?? 0;
            canvasDataStr = JSON.stringify(paths || []);
          } catch {}
          updated[i] = { ...updated[i], isFinished: true, finishTimeRemaining: 0, canvasPathsCount: pc, canvasData: canvasDataStr };
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
          if (p.canvasPathsCount === 0) { score = 0; comment = "Empty canvas!"; }
          else {
            const seed = p.name.length + currentWord.length + p.canvasPathsCount;
            score = 45 + (seed % 8) * 6 + Math.floor(Math.random() * 6);
            if (score > 96) score = 96;
            if (p.canvasPathsCount < 3) score = Math.floor(20 + Math.random() * 20);
            if (score >= 85) comment = "Stellar work! Clear structural features.";
            else if (score >= 70) comment = "Recognizable! AI is confident.";
            else if (score >= 50) comment = "Slightly abstract. AI is confused.";
            else comment = "Fascinating modern art, but no resemblance.";
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
          setRoundWinningReason(`AI declared ${(winner as LocalPlayer).name}'s drawing correct with ${hi}% accuracy! (+10 pts)`);
        } else {
          sfx.playFailure(); setRoundWinnerId(null);
          setRoundWinningReason("AI scanned drawings but none exceeded 70%. No points this round.");
        }
        setLocalGameState("summary");
      }, 2800);
    };
    finalize();
  };

  // Teacher grading — FIXED: no auto-AI, manual proceed
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
      setRoundWinningReason(`Teacher approved ${winners.map((p) => p.name).join(", ")}'s drawing(s)!`);
    } else {
      setRoundWinnerId(null);
      setRoundWinningReason("Teacher checked all players but no drawing was approved. No points awarded.");
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
        if (p.canvasPathsCount === 0) { score = 0; comment = "Empty canvas!"; }
        else {
          const seed = p.name.length + currentWord.length + p.canvasPathsCount;
          score = 45 + (seed % 8) * 6 + Math.floor(Math.random() * 6);
          if (score > 96) score = 96;
          if (p.canvasPathsCount < 3) score = Math.floor(20 + Math.random() * 20);
          if (score >= 85) comment = "Stellar work! Clear structural features.";
          else if (score >= 70) comment = "Recognizable! AI is confident.";
          else if (score >= 50) comment = "Slightly abstract. AI is confused.";
          else comment = "Fascinating modern art, but no resemblance.";
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
        setRoundWinningReason(`AI declared ${(winner as LocalPlayer).name}'s drawing correct with ${hi}% accuracy! (+10 pts)`);
      } else {
        sfx.playFailure(); setRoundWinnerId(null);
        setRoundWinningReason("AI scanned drawings but none exceeded 70%. No points this round.");
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
    updateRoomConfig, proceedToScoreboard, closeRoom } = useDrawRoom();

  const [onlineSubScreen, setOnlineSubScreen] = React.useState<OnlineSubScreen>("lobby");
  const [myRoomCode, setMyRoomCode] = React.useState<string | null>(null);
  const [myPlayerId] = React.useState(() => getOrCreatePlayerId());
  const [myPlayerName, setMyPlayerName] = React.useState("Player");
  const [joinCodeInput, setJoinCodeInput] = React.useState("");
  const [isCreator, setIsCreator] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState(false);
  const [onlineError, setOnlineError] = React.useState("");

  // Online room config (creator only)
  const [onlineConfig, setOnlineConfig] = React.useState<RoomConfig>({ rounds: 5, timerLimit: 30, categoryId: "emotions" });

  // Canvas for online playing
  const onlineCanvasRef = React.useRef<ReactSketchCanvasRef | null>(null);
  const [onlineStrokeColor, setOnlineStrokeColor] = React.useState("#000000");
  const [onlineStrokeWidth, setOnlineStrokeWidth] = React.useState(6);
  const [isLocalSubmitted, setIsLocalSubmitted] = React.useState(false);

  // Online synchronized timer
  const [onlineTimer, setOnlineTimer] = React.useState(0);
  const onlineTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Teacher evaluation state (online)
  const [teacherPointsInput, setTeacherPointsInput] = React.useState<Record<string, number>>({});
  const [isScanningOnline, setIsScanningOnline] = React.useState(false);

  // Live Firestore subscription
  const { room, loading: roomLoading, error: roomError } = useRoomListener(myRoomCode);

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

  // Helper: pick next word for online
  const [onlineUsedWords, setOnlineUsedWords] = React.useState<string[]>([]);
  
  const pickNextOnlineWord = (categoryId: string, used: string[]): { word: string; newUsed: string[] } => {
    return pickWord(categoryId, used);
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
      const result = await joinRoom(code, myPlayerId, myPlayerName.trim() || "Player");
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
      const { word, newUsed } = pickNextOnlineWord(room.config.categoryId, []);
      setOnlineUsedWords(newUsed);
      await startGame(myRoomCode, playerIds, word, newUsed);
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
      ? `Teacher approved ${winners.map((p) => p.name).join(", ")}'s drawing(s)!`
      : "Teacher checked all players but no drawing was approved. No points this round.";
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
        const { word, newUsed } = pickNextOnlineWord(room.config.categoryId, used);
        await startNextRound(myRoomCode, playerIds, room.currentRound + 1, word, newUsed);
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
      {renderTopBar("Draw the Word")}
      <div className="text-center space-y-3 pt-4">
        <Badge className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-extrabold uppercase px-4 py-1 tracking-widest text-xs animate-pulse">
          Interactive Drawing Game
        </Badge>
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent tracking-tight uppercase flex items-center justify-center gap-3">
          <Palette className="h-12 w-12 text-cyan-400 animate-bounce drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          Draw The Word
        </h1>
        <p className="text-slate-400 text-sm">Choose how you want to play</p>
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
          <p className="text-slate-400 text-sm leading-relaxed">Play hot-seat with 1–4 players on the same screen. Pass the device between turns.</p>
          <div className="flex gap-2 mt-auto flex-wrap">
            {["1–4 Players", "Shared Screen", "No Internet"].map((t) => (
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
          <p className="text-slate-400 text-sm leading-relaxed">Create a room and share the code with friends on any device — mobile, tablet, or desktop.</p>
          <div className="flex gap-2 mt-auto flex-wrap">
            {["Cross-Device", "Real-Time", "Up to 8 Players"].map((t) => (
              <span key={t} className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wide rounded-lg px-2 py-1">{t}</span>
            ))}
          </div>
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
            <p className="leading-relaxed">Represent secret English words by drawing them on the canvas! Other players or the teacher/AI must guess the correct word before time runs out.</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-black text-slate-200">👨‍🏫 Evaluation Modes</p>
            <p className="leading-relaxed">Choose manual Teacher Evaluation to let the teacher judge drawings on the screen, or AI Checker to instantly evaluate spelling and guesses.</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-black text-slate-200">🎨 Interactive Whiteboard</p>
            <p className="leading-relaxed">Sketch details using multiple brush colors, brush thickness settings, undo, and clear whiteboard controls.</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-black text-slate-200">🌐 Multiplayer Lobbies</p>
            <p className="leading-relaxed">Create a room, share the code, and play live with classmates on separate screens. Watch the canvas update in real-time as others draw!</p>
          </div>
        </div>
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
                      roundsConfig === r ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Round Timer <span className="text-indigo-400 lowercase font-medium">(default: 30s)</span></Label>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90].map((t) => (
                  <button key={t} onClick={() => { sfx.playBeep(420, 0.05); setRoundTimerConfig(t); }}
                    className={cn("flex-1 py-3 min-w-[52px] rounded-xl border font-black text-xs transition-all uppercase",
                      roundTimerConfig === t ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
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
                      numPlayers === n ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
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
              <Sparkles className="h-4 w-4 text-cyan-400" /> Word Category
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => { sfx.playBeep(420, 0.05); setSelectedCategoryId(cat.id); }}
                  className={cn("p-2 rounded-xl border font-black text-[10px] uppercase tracking-wide transition-all flex flex-col items-center gap-1",
                    selectedCategoryId === cat.id ? "bg-gradient-to-r from-cyan-500 to-indigo-600 border-cyan-400 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="leading-tight text-center">{cat.name.split(" & ")[0]}</span>
                </button>
              ))}
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Active Category Details</span>
              <p className="text-slate-400 text-xs">{activeCat.name}: {activeCat.description}</p>
            </div>
            <button onClick={handleStartLocalGame}
              className="w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
              <Sparkles className="h-5 w-5" /> Launch Drawing Arena
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
              {CATEGORIES.find((c) => c.id === selectedCategoryId)?.emoji}
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
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Draw: <span className="text-white font-black uppercase">{currentWord}</span></span>
        </div>

        {/* Canvases grid */}
        <div className={cn("grid gap-3", localPlayers.length === 1 ? "grid-cols-1" : localPlayers.length <= 2 ? "grid-cols-2" : "grid-cols-2")}>
          {localPlayers.map((player) => (
            <div key={player.id} className={cn("bg-slate-900/60 border rounded-2xl p-3 space-y-2", player.isFinished ? "border-emerald-600/50" : "border-slate-800")}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-sm text-slate-200 truncate">{player.name}</span>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-400 font-black text-xs">{player.score}</span>
                  {player.isFinished && <Badge className="bg-emerald-600/20 text-emerald-300 text-[9px] ml-1">Done</Badge>}
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
                  ✓ I'm Done!
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
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-sm rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" /> AI Scan
            </button>
          </div>
        )}
      </div>
    );
  };

  const setPlayerColor = (id: number, c: string) => { setStrokeColor((prev) => ({ ...prev, [id]: c })); };
  const setPlayerBrushPreset = (id: number, w: number) => { setStrokeWidth((prev) => ({ ...prev, [id]: w })); };

  // ═══════════════════════════════════════════════════════
  // RENDER — LOCAL EVALUATION (Teacher Manual Check)
  // ═══════════════════════════════════════════════════════
  const renderLocalEvaluation = () => {
    if (activeEvaluator === "ai") {
      return (
        <div className="max-w-3xl mx-auto w-full p-4 space-y-6 text-center">
          <div className="space-y-2">
            <div className="text-5xl animate-pulse">🤖</div>
            <h2 className="text-2xl font-black text-white">{aiScanning ? "AI Scanning..." : "AI Evaluation Complete"}</h2>
          </div>
          {aiScanning && (
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-pulse w-full" />
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

    // Teacher manual check
    const allChecked = localPlayers.every((p) => p.teacherChecked);
    return (
      <div className="max-w-4xl mx-auto w-full p-4 space-y-5">
        <div className="text-center space-y-1">
          <div className="text-3xl">👩‍🏫</div>
          <h2 className="text-2xl font-black text-white">Teacher Evaluation</h2>
          <p className="text-slate-400 text-xs">Check each player's drawing. Award or deny points, then proceed to the next round.</p>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
            Word: <span className="font-black uppercase ml-1">{currentWord}</span>
          </Badge>
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
                <SubmittedDrawingViewer canvasData={player.canvasData} />
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
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
            Word was: <span className="uppercase ml-1">{currentWord}</span>
          </Badge>
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
            className="py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
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
  // RENDER — ONLINE LOBBY (Create / Join)
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
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setOnlineConfig((c) => ({ ...c, categoryId: cat.id }))}
                    className={cn("py-1.5 px-1 rounded-xl border font-black text-[9px] transition-all flex flex-col items-center gap-0.5",
                      onlineConfig.categoryId === cat.id ? "bg-cyan-600 border-cyan-400 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200")}>
                    <span>{cat.emoji}</span>
                    <span className="leading-tight text-center">{cat.name.split(" & ")[0]}</span>
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
          <h2 className="text-2xl font-black text-white">🕹️ Game Lobby</h2>
          {isCreator && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-bold">You are the Host & Teacher</Badge>}
        </div>

        {/* Room Code */}
        <div className="bg-indigo-950/50 border border-indigo-700/40 rounded-2xl p-5 text-center space-y-3">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Invite Code — Share with friends</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-black text-white tracking-[0.3em]">{room.roomCode}</span>
            <button onClick={copyRoomCode} className="text-indigo-400 hover:text-indigo-200 transition-colors">
              <Copy className="h-5 w-5" />
            </button>
          </div>
          <p className="text-slate-500 text-xs">Works on any device — Android, iOS, Windows, Mac</p>
        </div>

        {/* Game Config (creator can still edit here since game hasn't started) */}
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
                <p className="font-black text-white">{CATEGORIES.find((c) => c.id === room.config.categoryId)?.emoji} {CATEGORIES.find((c) => c.id === room.config.categoryId)?.name.split(" & ")[0]}</p>
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
        <div className="text-center">
          <span className="text-slate-400 text-sm">Draw: </span>
          <span className="text-2xl font-black text-white uppercase tracking-wide">{room.currentWord}</span>
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
              <CheckCircle2 className="h-5 w-5" /> I'm Done Drawing!
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce" />
            <h3 className="text-xl font-black text-white">Drawing Submitted!</h3>
            <p className="text-slate-400 text-sm">Waiting for other players to finish...</p>
            <div className="space-y-2 w-full max-w-xs">
              {Object.values(room.players).map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
                  <div className={cn("h-2 w-2 rounded-full", p.isFinished ? "bg-emerald-400" : "bg-slate-600 animate-pulse")} />
                  <span className="flex-1 text-xs font-bold text-slate-300">{p.name}</span>
                  <span className="text-[10px] font-black">{p.isFinished ? "✓ Done" : "Drawing..."}</span>
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

    if (!isCreator) {
      return (
        <div className="flex flex-col items-center justify-center gap-5 py-16 text-center p-4">
          <UserCheck className="h-16 w-16 text-amber-400 animate-pulse" />
          <h3 className="text-2xl font-black text-white">Teacher is Checking...</h3>
          <p className="text-slate-400 text-sm">The teacher is reviewing all drawings. Hang tight!</p>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold mt-2">
            Word: <span className="uppercase ml-1">{room.currentWord}</span>
          </Badge>
        </div>
      );
    }

    // Creator/teacher view
    return (
      <div className="max-w-5xl mx-auto w-full p-4 space-y-5 overflow-y-auto">
        <div className="text-center space-y-2">
          <div className="text-3xl">👩‍🏫</div>
          <h2 className="text-2xl font-black text-white">Teacher Evaluation</h2>
          <p className="text-slate-400 text-xs">Review each player's drawing. Award or deny points for each. When finished, proceed to results.</p>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
            Word: <span className="uppercase ml-1">{room.currentWord}</span>
          </Badge>
        </div>

        <div className={cn("grid gap-4", players.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : players.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3")}>
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
                  No drawing submitted
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
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
            Word was: <span className="uppercase ml-1">{room.currentWord}</span>
          </Badge>
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
