"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { 
  Palette, Undo, Trash2, Maximize, Minimize, Timer, Check, X, 
  Trophy, Play, UserPlus, Sparkles, RotateCcw, Volume2, VolumeX, 
  HelpCircle, UserCheck, ShieldAlert, Award, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";

// Dynamically import sketch canvas to avoid SSR issues
const DynamicCanvas = dynamic(
  () => import("react-sketch-canvas").then((mod) => mod.ReactSketchCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 rounded-2xl">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    ),
  }
);

// ----------------------------------------------------
// SOUND UTILITIES (Web Audio API)
// ----------------------------------------------------
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public playBeep(freq = 440, duration = 0.1, type: OscillatorType = "sine") {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  }

  public playSuccess() {
    this.playBeep(523.25, 0.1); // C5
    setTimeout(() => this.playBeep(659.25, 0.15), 100); // E5
    setTimeout(() => this.playBeep(783.99, 0.25), 250); // G5
  }

  public playFailure() {
    this.playBeep(220, 0.2, "triangle"); // A3
    setTimeout(() => this.playBeep(196, 0.3, "triangle"), 150); // G3
  }

  public playLaserSweep() {
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
    } catch (e) {}
  }
}

const sfx = new SoundEffects();

// ----------------------------------------------------
// GAME DATA: CATEGORIES & WORDS
// ----------------------------------------------------
interface WordCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  words: string[];
}

const CATEGORIES: WordCategory[] = [
  {
    id: "emotions",
    name: "Emotions & Feelings",
    emoji: "😊",
    description: "Emotions, feelings, and expressions",
    words: [
      "happy", "sad", "angry", "surprised", "scared", "excited", "tired", "bored",
      "confused", "proud", "shy", "embarrassed", "jealous", "shocked", "sleepy", "worried",
      "calm", "lonely", "silly", "hungry", "thirsty", "anxious", "nervous", "cheerful",
      "grumpy", "curious", "frightened", "disappointed", "hopeful", "peaceful"
    ]
  },
  {
    id: "animals",
    name: "Animals",
    emoji: "🦁",
    description: "Creatures from land, sea, and sky",
    words: [
      "elephant", "giraffe", "lion", "monkey", "penguin", "kangaroo", "dolphin", "shark",
      "octopus", "butterfly", "owl", "tiger", "rabbit", "turtle", "panda", "frog",
      "snake", "bee", "fox", "koala", "zebra", "bear", "crocodile", "duck",
      "parrot", "squirrel", "whale", "crab", "horse", "sheep"
    ]
  },
  {
    id: "food",
    name: "Food & Drinks",
    emoji: "🍕",
    description: "Delicious snacks, fruits, and meals",
    words: [
      "pizza", "hamburger", "sushi", "ice cream", "banana", "apple", "cupcake", "coffee",
      "taco", "watermelon", "donut", "cheese", "sandwich", "salad", "cookie", "spaghetti",
      "orange", "strawberry", "milk", "french fries", "bread", "carrot", "cake", "tea",
      "juice", "cherry", "egg", "popcorn", "grapes", "pineapple"
    ]
  },
  {
    id: "vehicles",
    name: "Vehicles & Transport",
    emoji: "🚀",
    description: "Ways of traveling on roads, tracks, water, and air",
    words: [
      "airplane", "bicycle", "submarine", "rocket", "helicopter", "train", "ship", "ambulance",
      "fire truck", "police car", "motorcycle", "skateboard", "hot air balloon", "tractor", "truck", "bus",
      "boat", "scooter", "taxi", "spaceship", "van", "jet", "cruise ship"
    ]
  },
  {
    id: "household",
    name: "Household Items",
    emoji: "🛋️",
    description: "Common things found around the house",
    words: [
      "clock", "chair", "table", "television", "key", "lamp", "telephone", "mirror",
      "umbrella", "sofa", "toothbrush", "cup", "pillow", "book", "computer", "refrigerator",
      "bed", "spoon", "broom", "fork", "plate", "knife", "window", "door", "soap",
      "towel", "shelf", "bin", "cabinet", "comb"
    ]
  },
  {
    id: "nature",
    name: "Nature & Weather",
    emoji: "🌈",
    description: "Elements of the earth, space, and atmospheric weather",
    words: [
      "rainbow", "cloud", "lightning", "volcano", "mountain", "flower", "tree", "sun",
      "moon", "star", "snowflake", "river", "desert", "mushroom", "leaf", "cactus",
      "ocean", "tornado", "wind", "rain", "fire", "waterfall", "forest", "island",
      "sky", "earth", "cave", "grass", "rock", "lake"
    ]
  },
  {
    id: "sports",
    name: "Sports & Hobbies",
    emoji: "⚽",
    description: "Equipment and elements of physical play and hobbies",
    words: [
      "soccer ball", "basketball", "tennis racket", "guitar", "camera", "fishing rod", "drum",
      "violin", "piano", "microphone", "golf club", "baseball bat", "surf board", "ski", "tent",
      "trophy", "medal", "bicycle", "skateboard", "roller skates", "dartboard", "target"
    ]
  },
  {
    id: "jobs",
    name: "Jobs & Occupations",
    emoji: "👨‍🍳",
    description: "Professions and careers people do",
    words: [
      "doctor", "teacher", "astronaut", "chef", "firefighter", "police officer", "artist", "pilot",
      "scientist", "farmer", "builder", "dancer", "singer", "detective", "nurse", "dentist",
      "soldier", "actor", "writer", "veterinarian"
    ]
  },
  {
    id: "fantasy",
    name: "Fantasy & Magic",
    emoji: "🐉",
    description: "Mythical creatures and items of wizardry and legends",
    words: [
      "dragon", "unicorn", "wizard hat", "castle", "fairy", "ghost", "alien", "magic wand",
      "treasure chest", "pirate ship", "mermaid", "crown", "monster", "mummy", "witch",
      "giant", "genie", "superhero", "vampire", "potion", "crystal ball"
    ]
  }
];

// ----------------------------------------------------
// STYLING/COLOR SETTINGS
// ----------------------------------------------------
const STROKE_COLORS = [
  { value: "#000000", label: "Midnight" },
  { value: "#EF4444", label: "Crimson" },
  { value: "#3B82F6", label: "Cobalt" },
  { value: "#22C55E", label: "Emerald" },
  { value: "#EAB308", label: "Amber" },
  { value: "#A855F7", label: "Amethyst" },
  { value: "#EC4899", label: "Rose" },
  { value: "#F97316", label: "Orange" }
];

const BRUSH_PRESETS = [
  { value: 2, label: "Sketch" },
  { value: 6, label: "Draw" },
  { value: 12, label: "Paint" },
  { value: 24, label: "Fill" }
];

// ----------------------------------------------------
// COMPONENT INTERFACES
// ----------------------------------------------------
type GameState = "setup" | "playing" | "evaluation" | "summary" | "scoreboard";

interface Player {
  id: number;
  name: string;
  score: number;
  isFinished: boolean;
  finishTimeRemaining: number;
  canvasPathsCount: number;
  aiMatchScore: number;
  aiCommentary: string;
}

export function DrawTheWord({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const { toast } = useToast();
  
  // Game Setup Settings
  const [gameState, setGameState] = React.useState<GameState>("setup");
  const [numPlayers, setNumPlayers] = React.useState<number>(1);
  const [playerNames, setPlayerNames] = React.useState<string[]>(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [roundsConfig, setRoundsConfig] = React.useState<number>(5);
  const [currentRound, setCurrentRound] = React.useState<number>(1);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("emotions");
  
  // Gameplay States
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [currentWord, setCurrentWord] = React.useState<string>("");
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [timer, setTimer] = React.useState<number>(30);
  const [timerActive, setTimerActive] = React.useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = React.useState<boolean>(true);
  
  // Drawing configurations per player
  const [strokeColor, setStrokeColor] = React.useState<{ [key: number]: string }>({ 1: "#000000", 2: "#000000", 3: "#000000", 4: "#000000" });
  const [strokeWidth, setStrokeWidth] = React.useState<{ [key: number]: number }>({ 1: 6, 2: 6, 3: 6, 4: 6 });
  
  // Evaluation States
  const [activeEvaluator, setActiveEvaluator] = React.useState<"none" | "teacher" | "ai">("none");
  const [teacherTargetPlayerId, setTeacherTargetPlayerId] = React.useState<number | null>(null);
  const [aiScanning, setAiScanning] = React.useState<boolean>(false);
  const [roundWinnerId, setRoundWinnerId] = React.useState<number | null>(null);
  const [roundWinningReason, setRoundWinningReason] = React.useState<string>("");
  
  // Fullscreen detection
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  
  // Refs
  const canvasRefs = React.useRef<{ [key: number]: ReactSketchCanvasRef | null }>({});
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync fullscreen state
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Update audio utility setting
  React.useEffect(() => {
    sfx.enabled = isAudioEnabled;
  }, [isAudioEnabled]);

  // Round Timer Effect
  React.useEffect(() => {
    if (timerActive && timer > 0) {
      timerIntervalRef.current = setTimeout(() => {
        setTimer((prev) => {
          // Play warning beeps in final 5 seconds
          if (prev <= 6 && prev > 1) {
            sfx.playBeep(330, 0.08, "triangle");
          } else if (prev === 1) {
            sfx.playBeep(660, 0.4, "sawtooth");
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
      handleTimerTimeout();
    }

    return () => {
      if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    };
  }, [timer, timerActive]);

  // Reset all drawings helper
  const clearAllCanvases = async (playerList: Player[]) => {
    for (const player of playerList) {
      try {
        await canvasRefs.current[player.id]?.clearCanvas();
      } catch (e) {}
    }
  };

  // Get active category helper
  const getActiveCategory = () => {
    return CATEGORIES.find(c => c.id === selectedCategoryId) || CATEGORIES[0];
  };

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------

  // 1. Initialize and Start Game
  const handleStartGame = () => {
    sfx.playBeep(440, 0.1);
    
    // Create initial players state
    const initialPlayers: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
      id: i + 1,
      name: playerNames[i]?.trim() || `Player ${i + 1}`,
      score: 0,
      isFinished: false,
      finishTimeRemaining: 0,
      canvasPathsCount: 0,
      aiMatchScore: 0,
      aiCommentary: ""
    }));

    setPlayers(initialPlayers);
    setUsedWords([]);
    setCurrentRound(1);
    
    // Setup drawing presets
    const newColors: { [key: number]: string } = {};
    const newWidths: { [key: number]: number } = {};
    initialPlayers.forEach(p => {
      newColors[p.id] = "#000000";
      newWidths[p.id] = 6;
    });
    setStrokeColor(newColors);
    setStrokeWidth(newWidths);

    // Pick first word and transition
    startNewRound(1, initialPlayers);
  };

  // 2. Start a New Round
  const startNewRound = (roundNumber: number, activePlayers = players) => {
    const category = getActiveCategory();
    
    // Select a word from category, avoiding duplicates
    let availableWords = category.words.filter(w => !usedWords.includes(w));
    if (availableWords.length === 0) {
      // Clear used words for this category if all have been exhausted
      availableWords = category.words;
      setUsedWords([]);
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const chosenWord = availableWords[randomIndex];

    // Reset players for drawing
    const resetPlayers = activePlayers.map(p => ({
      ...p,
      isFinished: false,
      finishTimeRemaining: 0,
      canvasPathsCount: 0,
      aiMatchScore: 0,
      aiCommentary: ""
    }));

    setPlayers(resetPlayers);
    setUsedWords(prev => [...prev, chosenWord]);
    setCurrentWord(chosenWord);
    setCurrentRound(roundNumber);
    setTimer(30);
    setTimerActive(true);
    setActiveEvaluator("none");
    setTeacherTargetPlayerId(null);
    setRoundWinnerId(null);
    setRoundWinningReason("");
    setAiScanning(false);
    setGameState("playing");
    
    // Clear the drawing boards
    setTimeout(() => clearAllCanvases(resetPlayers), 150);
  };

  // 3. Mark a specific player as Finished Drawing
  const handlePlayerFinished = async (playerId: number) => {
    sfx.playBeep(480, 0.08);

    // Grab canvas paths to verify player drew something
    let pathsCount = 0;
    try {
      const paths = await canvasRefs.current[playerId]?.exportPaths();
      pathsCount = paths ? paths.length : 0;
    } catch (e) {
      console.error(e);
    }

    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          isFinished: true,
          finishTimeRemaining: timer,
          canvasPathsCount: pathsCount
        };
      }
      return p;
    }));

    toast({
      title: `${players.find(p => p.id === playerId)?.name} finished! 🏁`,
      description: "Canvas is now locked. Teacher can manually grade.",
      duration: 3000
    });

    // Check if ALL players are finished
    const updatedPlayers = players.map(p => p.id === playerId ? { ...p, isFinished: true } : p);
    const allFinished = updatedPlayers.every(p => p.isFinished);
    
    if (allFinished) {
      setTimerActive(false);
      // If everyone finished, automatically trigger AI evaluation if no one was manually graded yet
      triggerAIEvaluation(updatedPlayers);
    }
  };

  // 4. Handle Timer Timeout
  const handleTimerTimeout = () => {
    sfx.playBeep(220, 0.5, "sawtooth");
    setTimerActive(false);

    // Lock all unfinished players and count their paths
    const finalizeTimeouts = async () => {
      const updatedPlayers = [...players];
      for (let i = 0; i < updatedPlayers.length; i++) {
        if (!updatedPlayers[i].isFinished) {
          let pathsCount = 0;
          try {
            const paths = await canvasRefs.current[updatedPlayers[i].id]?.exportPaths();
            pathsCount = paths ? paths.length : 0;
          } catch (e) {}
          updatedPlayers[i] = {
            ...updatedPlayers[i],
            isFinished: true,
            finishTimeRemaining: 0,
            canvasPathsCount: pathsCount
          };
        }
      }
      setPlayers(updatedPlayers);
      triggerAIEvaluation(updatedPlayers);
    };

    finalizeTimeouts();
  };

  // 5. Teacher Evaluation Dialog Handler
  const openTeacherGradeDialog = (playerId: number) => {
    setTeacherTargetPlayerId(playerId);
    setActiveEvaluator("teacher");
  };

  const handleTeacherGrade = (isCorrect: boolean) => {
    if (!teacherTargetPlayerId) return;

    const targetPlayer = players.find(p => p.id === teacherTargetPlayerId);
    if (!targetPlayer) return;

    if (isCorrect) {
      // Award score to the player!
      sfx.playSuccess();
      const basePoints = 10;
      const speedBonus = Math.round(targetPlayer.finishTimeRemaining * 0.5);
      const totalRoundScore = basePoints + speedBonus;

      setPlayers(prev => prev.map(p => {
        if (p.id === teacherTargetPlayerId) {
          return { ...p, score: p.score + totalRoundScore };
        }
        return p;
      }));

      setRoundWinnerId(teacherTargetPlayerId);
      setRoundWinningReason(`${targetPlayer.name} drew it correctly and was verified by the Teacher! (+${totalRoundScore} points, including speed bonus)`);
      setTimerActive(false);
      setGameState("summary");
    } else {
      // Mark wrong, canvas stays locked, teacher check closes
      sfx.playFailure();
      toast({
        variant: "destructive",
        title: "Evaluation Incorrect",
        description: `${targetPlayer.name}'s drawing is marked incorrect. Other players can continue.`,
      });
      
      setActiveEvaluator("none");
      setTeacherTargetPlayerId(null);
      
      // If all players are locked / finished and teacher graded the last one incorrect, trigger AI evaluation
      const allFinished = players.every(p => p.isFinished);
      if (allFinished) {
        triggerAIEvaluation();
      }
    }
  };

  // 6. AI Evaluation Handler
  const triggerAIEvaluation = (currentPlayersList = players) => {
    setGameState("evaluation");
    setActiveEvaluator("ai");
    setAiScanning(true);
    sfx.playLaserSweep();

    // After 2.5s laser scan animation, compute scores
    setTimeout(() => {
      setAiScanning(false);

      // Compute match score and commentary for each player
      const evaluatedPlayers = currentPlayersList.map(p => {
        if (p.canvasPathsCount === 0) {
          return {
            ...p,
            aiMatchScore: 0,
            aiCommentary: "Empty canvas! Did you fall asleep or run out of time?"
          };
        }

        // Draw a realistic percentage based on path count and a pseudo-random hash of their name & round word
        const seed = p.name.length + currentWord.length + p.canvasPathsCount;
        let matchScore = 45 + (seed % 8) * 6 + Math.floor(Math.random() * 6);
        
        // Cap score
        if (matchScore > 96) matchScore = 96;
        if (p.canvasPathsCount < 3) {
          matchScore = Math.floor(20 + Math.random() * 20); // Not enough drawing detail
        }

        // Comments database
        let comment = "";
        if (matchScore >= 85) {
          comment = "Stellar work! The AI recognizes clear structural features and excellent shape proportions.";
        } else if (matchScore >= 70) {
          comment = "Recognizable shape! Decent brush density. The AI is confident this is correct.";
        } else if (matchScore >= 50) {
          comment = "Slightly abstract. Looks a bit like a squiggly cloud. The AI is confused.";
        } else {
          comment = "Fascinating modern art attempt, but it bears no resemblance to the word.";
        }

        return {
          ...p,
          aiMatchScore: matchScore,
          aiCommentary: comment
        };
      });

      setPlayers(evaluatedPlayers);

      // Find player with highest match score
      let highestPlayer: Player | null = null;
      let highestScore = -1;

      evaluatedPlayers.forEach(p => {
        if (p.aiMatchScore > highestScore) {
          highestScore = p.aiMatchScore;
          highestPlayer = p;
        }
      });

      // AI Victory Threshold is 70%
      if (highestPlayer && highestScore >= 70) {
        sfx.playSuccess();
        const winnerId = (highestPlayer as Player).id;
        const winnerName = (highestPlayer as Player).name;
        
        setPlayers(prev => prev.map(p => {
          if (p.id === winnerId) {
            return { ...p, score: p.score + 10 };
          }
          return p;
        }));

        setRoundWinnerId(winnerId);
        setRoundWinningReason(`AI scanned the canvases and declared ${winnerName}'s drawing the closest match with ${highestScore}% accuracy! (+10 points)`);
      } else {
        sfx.playFailure();
        setRoundWinnerId(null);
        setRoundWinningReason(`AI scanned the drawings but none exceeded the 70% accuracy threshold. No points awarded this round.`);
      }

    }, 2800);
  };

  // 7. Proceed to next round or final scoreboard
  const handleProceedFromSummary = () => {
    sfx.playBeep(440, 0.08);
    if (currentRound < roundsConfig) {
      startNewRound(currentRound + 1);
    } else {
      setGameState("scoreboard");
    }
  };

  // 8. Restart / Reset Game settings
  const handleResetGame = () => {
    sfx.playBeep(380, 0.1);
    setGameState("setup");
  };

  // ----------------------------------------------------
  // CANVAS TOOL CONTROLS
  // ----------------------------------------------------
  const handleUndo = (playerId: number) => {
    canvasRefs.current[playerId]?.undo();
    sfx.playBeep(520, 0.05);
  };

  const handleClear = (playerId: number) => {
    canvasRefs.current[playerId]?.clearCanvas();
    sfx.playBeep(280, 0.05, "triangle");
  };

  const setPlayerColor = (playerId: number, color: string) => {
    setStrokeColor(prev => ({ ...prev, [playerId]: color }));
    sfx.playBeep(600, 0.05);
  };

  const setPlayerBrushPreset = (playerId: number, size: number) => {
    setStrokeWidth(prev => ({ ...prev, [playerId]: size }));
    sfx.playBeep(580, 0.05);
  };

  // ----------------------------------------------------
  // RENDER INTERFACES
  // ----------------------------------------------------

  // A. LOBBY/SETUP SCREEN
  const renderSetup = () => {
    const activeCategory = getActiveCategory();
    return (
      <div className="max-w-4xl mx-auto w-full space-y-8 select-none p-4">
        {/* Animated Background Gradiant elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3">
          <Badge className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-extrabold uppercase px-4 py-1 tracking-widest text-xs border border-violet-400/30 animate-pulse">
            New Interactive Game
          </Badge>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent tracking-tight uppercase flex items-center justify-center gap-3">
            <Palette className="h-12 w-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-bounce" />
            Draw The Word
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Choose a category and compete with friends in this fast-paced local multiplayer drawing race. Show the teacher or face the AI scanner!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Game Settings Card */}
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 shadow-xl p-6 space-y-6">
            <h2 className="text-lg font-black text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-indigo-400" />
              Game Parameters
            </h2>

            {/* Rounds Selector */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Number of Rounds</Label>
              <div className="flex gap-4">
                {[5, 10, 15].map((r) => (
                  <button
                    key={r}
                    onClick={() => { sfx.playBeep(420, 0.05); setRoundsConfig(r); }}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border font-black text-sm transition-all uppercase tracking-wide",
                      roundsConfig === r
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400 text-white shadow-lg shadow-indigo-500/10 scale-102"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {r} Rounds
                  </button>
                ))}
              </div>
            </div>

            {/* Players Count Selector */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Number of Players</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => { sfx.playBeep(420, 0.05); setNumPlayers(n); }}
                    className={cn(
                      "flex-1 py-2 rounded-xl border font-black text-sm transition-all",
                      numPlayers === n
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400 text-white shadow-lg shadow-indigo-500/10 scale-102"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {n === 1 ? "1 Player" : `${n} Players`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Player Names Input */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5 mb-1">
                <UserPlus className="h-3.5 w-3.5" />
                Customize Competitors
              </span>
              <div className="space-y-3">
                {Array.from({ length: numPlayers }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-500 w-16">P{idx + 1} Name:</span>
                    <Input
                      placeholder={`Player ${idx + 1}`}
                      value={playerNames[idx]}
                      onChange={(e) => {
                        const copy = [...playerNames];
                        copy[idx] = e.target.value;
                        setPlayerNames(copy);
                      }}
                      className="bg-slate-900 border-slate-800 text-slate-200 text-xs h-9 focus-visible:ring-indigo-500 rounded-lg"
                      maxLength={15}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Categories Selector Card */}
          <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 shadow-xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-indigo-400" />
                Word Category
              </h2>
              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[22rem] pr-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { sfx.playBeep(450, 0.05); setSelectedCategoryId(cat.id); }}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all",
                      selectedCategoryId === cat.id
                        ? "bg-slate-800 border-cyan-500/50 shadow-md shadow-cyan-500/5 scale-102"
                        : "bg-slate-950 border-slate-800 hover:border-slate-855 hover:bg-slate-900/30"
                    )}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-[10px] font-black uppercase text-slate-200 leading-none truncate w-full">
                      {cat.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="bg-indigo-950/20 border border-indigo-950/50 rounded-xl p-3 text-left space-y-1 mt-2">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                  Active Category details
                </span>
                <p className="text-xs text-slate-300 font-medium">
                  {activeCategory.name}: {activeCategory.description}. Contains {activeCategory.words.length} secret vocabulary words.
                </p>
              </div>
            </div>

            <Button
              onClick={handleStartGame}
              className="w-full mt-6 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-600 text-white font-black uppercase tracking-wider py-6 rounded-2xl shadow-xl shadow-indigo-600/20 hover:opacity-95 hover:scale-[1.01] transition-all"
            >
              <Sparkles className="h-5 w-5 mr-2 text-yellow-300 fill-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
              Launch Drawing Arena
            </Button>
          </Card>
        </div>
      </div>
    );
  };

  // B. DRAWING GAME BOARD
  const renderPlaying = () => {
    const isMulti = numPlayers > 1;

    // Grid layout CSS depends on player count
    let gridClass = "grid-cols-1";
    if (numPlayers === 2) gridClass = "md:grid-cols-2";
    else if (numPlayers >= 3) gridClass = "md:grid-cols-2 lg:grid-cols-2";

    return (
      <div className="w-full h-full flex flex-col justify-between select-none">
        {/* Style block for scanning laser and confettis */}
        <style>{`
          @keyframes laser-scan-anim {
            0% { top: 0%; opacity: 0.8; }
            50% { top: 98%; opacity: 1; }
            100% { top: 0%; opacity: 0.8; }
          }
          .animate-laser-scan {
            animation: laser-scan-anim 2.5s infinite ease-in-out;
          }
        `}</style>

        {/* Top Game Navigation / Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-6 py-3.5 rounded-2xl mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-black uppercase text-indigo-400">Round</span>
              <span className="text-sm font-black text-slate-100">{currentRound} / {roundsConfig}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] uppercase bg-slate-950 border-slate-850 px-2.5 py-1">
                Category: {getActiveCategory().name}
              </Badge>
            </div>
          </div>

          {/* Word prompt in center */}
          <div className="bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-6 py-2 rounded-2xl text-center shadow-inner">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block leading-tight">Word to Draw</span>
            <span className="text-xl font-black uppercase text-white tracking-widest leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">
              {currentWord}
            </span>
          </div>

          {/* Timer and Controls */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="bg-slate-950 border-slate-850 h-9 w-9 text-slate-400 hover:text-slate-200"
            >
              {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            {/* Timer circle or box */}
            <div className={cn(
              "px-4 py-1.5 rounded-xl border font-black text-sm flex items-center gap-2 transition-all shadow-md shrink-0",
              timer <= 5
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse"
                : "bg-slate-950 border-slate-850 text-amber-400"
            )}>
              <Timer className="h-4 w-4 shrink-0" />
              <span>{timer}s</span>
            </div>

            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              className="bg-slate-950 border border-slate-850 h-9 px-3 gap-1.5 text-slate-400 hover:text-slate-200"
            >
              {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
              <span className="hidden md:inline text-[9px] font-black uppercase">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
            </Button>
          </div>
        </div>

        {/* Canvases grid */}
        <div className={cn("grid gap-4 flex-grow relative items-stretch", gridClass)}>
          {players.map((player) => {
            const pColor = strokeColor[player.id] || "#000000";
            const pWidth = strokeWidth[player.id] || 6;

            return (
              <Card 
                key={player.id} 
                className="bg-slate-900/40 backdrop-blur-sm border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                {/* Canvas Title card */}
                <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" />
                    <span className="font-extrabold text-sm text-slate-200">{player.name}</span>
                    {isMulti && (
                      <Badge variant="outline" className="text-[8px] uppercase tracking-wider border-slate-800 bg-slate-900 text-slate-500 px-1 py-0 h-4">
                        Score: {player.score}
                      </Badge>
                    )}
                  </div>

                  {/* Teacher Verification trigger button */}
                  {player.isFinished && (
                    <Button
                      size="sm"
                      onClick={() => openTeacherGradeDialog(player.id)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase h-6 px-2.5 rounded-lg border border-amber-300/20 shadow-md flex items-center gap-1 hover:scale-103"
                    >
                      <UserCheck className="h-3 w-3" />
                      Teacher Check
                    </Button>
                  )}
                </div>

                {/* Main Drawing Canvas Board Container */}
                <div className="flex-grow bg-slate-950 relative overflow-hidden flex items-center justify-center p-3 h-52 sm:h-auto min-h-[14rem]">
                  {/* Laser Scanning overlay line (AI Evaluation) */}
                  {aiScanning && (
                    <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser-scan z-20 pointer-events-none" />
                  )}

                  {/* Canvas Lock overlays */}
                  {player.isFinished && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-2xl select-none pointer-events-none z-10">
                      <Badge className="bg-emerald-500/90 text-slate-950 font-black text-xs uppercase px-4 py-1.5 shadow-lg border border-emerald-400">
                        Finished ({player.finishTimeRemaining}s Left)
                      </Badge>
                    </div>
                  )}

                  {timer === 0 && !player.isFinished && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-2xl select-none pointer-events-none z-10">
                      <span className="text-rose-500 font-extrabold text-sm uppercase tracking-wider mb-1">Time is Over! ⏰</span>
                      <span className="text-slate-400 text-[10px] font-bold">Locked for AI evaluation</span>
                    </div>
                  )}

                  {/* Draw canvas component */}
                  <div className={cn(
                    "w-full h-full rounded-xl bg-white border border-slate-800 transition-all shadow-inner overflow-hidden",
                    player.isFinished && "pointer-events-none"
                  )}>
                    <DynamicCanvas
                      ref={(el) => { canvasRefs.current[player.id] = el; }}
                      strokeColor={pColor}
                      strokeWidth={pWidth}
                      className="!h-full !w-full"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>

                {/* Controls toolbar */}
                <div className="bg-slate-950/90 px-4 py-2.5 border-t border-slate-800/80 space-y-2 select-none">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Colors & Brush presets */}
                    <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-[70%] scrollbar-none">
                      {/* Color dots */}
                      <div className="flex items-center gap-1 shrink-0">
                        {STROKE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            disabled={player.isFinished}
                            onClick={() => setPlayerColor(player.id, color.value)}
                            className={cn(
                              "rounded-full border border-slate-800 w-5 h-5 transition-all shadow-sm shrink-0",
                              pColor === color.value ? "scale-125 ring-2 ring-indigo-500" : "hover:scale-105"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                      </div>

                      <div className="h-4 w-px bg-slate-800 shrink-0" />

                      {/* Brush Presets buttons */}
                      <div className="flex items-center gap-1 shrink-0 bg-slate-900 border border-slate-850 p-0.5 rounded-lg">
                        {BRUSH_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            disabled={player.isFinished}
                            onClick={() => setPlayerBrushPreset(player.id, preset.value)}
                            className={cn(
                              "text-[8px] font-black uppercase px-2 py-1 rounded transition-all shrink-0",
                              pWidth === preset.value
                                ? "bg-indigo-500 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-300"
                            )}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Canvas utility buttons (Undo, Clear, Finished) */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={player.isFinished}
                        onClick={() => handleUndo(player.id)}
                        className="h-7 w-7 bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                        title="Undo"
                      >
                        <Undo className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={player.isFinished}
                        onClick={() => handleClear(player.id)}
                        className="h-7 w-7 bg-slate-900 border-slate-850 text-slate-400 hover:text-rose-400"
                        title="Clear Canvas"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>

                      {/* Finished Button */}
                      {!player.isFinished ? (
                        <Button
                          size="sm"
                          onClick={() => handlePlayerFinished(player.id)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-[10px] uppercase h-7 px-3 rounded-lg flex items-center gap-1 shadow-md shadow-indigo-500/10"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Done!
                        </Button>
                      ) : (
                        <div className="h-7 px-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02] text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1 select-none">
                          <Check className="h-3 w-3" />
                          Locked
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Abort confirmation bar */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3.5">
          <Button
            variant="outline"
            onClick={handleResetGame}
            className="bg-slate-955 border-slate-850 hover:bg-slate-900 text-xs font-bold text-slate-400 px-4 rounded-xl"
          >
            Abort Drawing Session
          </Button>

          {/* Teacher Grade Modal Overlay */}
          {activeEvaluator === "teacher" && teacherTargetPlayerId !== null && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="max-w-md w-full bg-slate-900 border-slate-850 shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <UserCheck className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">Teacher Manual Check</h3>
                </div>
                <div className="space-y-2 text-center py-2">
                  <p className="text-sm text-slate-300">
                    Did <span className="font-extrabold text-indigo-400">{players.find(p => p.id === teacherTargetPlayerId)?.name}</span> draw the word correctly?
                  </p>
                  <p className="text-xl font-black uppercase tracking-widest text-emerald-400 bg-slate-950/80 py-2.5 rounded-xl border border-slate-800 mt-2">
                    {currentWord}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleTeacherGrade(false)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-extrabold py-5 rounded-xl uppercase text-xs"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Incorrect
                  </Button>
                  <Button
                    onClick={() => handleTeacherGrade(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-5 rounded-xl uppercase text-xs shadow-lg shadow-emerald-500/10"
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Correct!
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => { setActiveEvaluator("none"); setTeacherTargetPlayerId(null); }}
                  className="w-full text-slate-500 hover:text-slate-400 hover:bg-transparent text-xs font-bold pt-2 uppercase"
                >
                  Cancel Grade
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  };

  // C. AI SCANNING / EVALUATION SCREEN
  const renderEvaluation = () => {
    return (
      <div className="max-w-4xl mx-auto w-full space-y-6 text-center select-none py-8">
        <Card className="bg-slate-900 border-slate-850 p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {aiScanning ? (
            <div className="space-y-6 py-12 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                <div className="w-20 h-20 rounded-full border-4 border-t-cyan-400 border-r-indigo-400 border-b-purple-400 border-l-slate-800 animate-spin flex items-center justify-center">
                  <Palette className="h-8 w-8 text-cyan-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-cyan-300 uppercase tracking-widest animate-pulse">AI Laser Scan In Progress</h2>
                <p className="text-slate-400 text-xs max-w-sm mx-auto font-medium">
                  Analyzing drawing path geometries, canvas coordinates, brush stroke density, and vector shape approximations...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 font-extrabold uppercase text-[10px] tracking-widest">
                Scan Report Completed
              </Badge>
              <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tight">AI Scoring Report</h2>

              {/* Scanned breakdown */}
              <div className="grid gap-4 mt-6 sm:grid-cols-2 md:grid-cols-2 justify-center">
                {players.map((player) => (
                  <div key={player.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-between text-center gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-slate-400 uppercase">{player.name}</span>
                      <p className="text-[10px] text-indigo-400 font-bold">Strokes Analyzed: {player.canvasPathsCount}</p>
                    </div>

                    <div className="relative flex items-center justify-center w-24 h-24 mt-2">
                      {/* Radial Progress indicator */}
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          className={cn(
                            player.aiMatchScore >= 70 ? "stroke-emerald-400" : "stroke-rose-500"
                          )} 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - player.aiMatchScore / 100)}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-white">{player.aiMatchScore}%</span>
                        <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Match</span>
                      </div>
                    </div>

                    <div className="space-y-1 mt-1">
                      <Badge variant="outline" className={cn(
                        "text-[9px] uppercase tracking-wider px-2 py-0.5",
                        player.aiMatchScore >= 70 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-900 text-slate-500 border-slate-855"
                      )}>
                        {player.aiMatchScore >= 70 ? "Match Approved" : "Match Rejected"}
                      </Badge>
                      <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed italic px-2 pt-1.5">
                        "{player.aiCommentary}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Winner declaration */}
              <div className="border-t border-slate-800 pt-6 mt-6 bg-slate-950/40 p-4 rounded-2xl max-w-lg mx-auto">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block mb-1">Scoring Verdict</span>
                <p className="text-sm font-semibold text-slate-200">
                  {roundWinningReason}
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setGameState("summary")}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-xs px-8 py-5 rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  Proceed to Leaderboard
                  <ArrowRight className="h-4 w-4 ml-2 animate-bounce" style={{ animationDirection: '1s' }} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // D. ROUND SUMMARY SCREEN
  const renderSummary = () => {
    return (
      <div className="max-w-md mx-auto w-full space-y-6 select-none py-8">
        <Card className="bg-slate-900 border-slate-855 p-6 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Round Complete</span>
            <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Round Recap</h2>
            <div className="bg-slate-950 border border-slate-855 py-2.5 rounded-xl mt-3">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block leading-tight">Prompt Drawn</span>
              <span className="text-lg font-black uppercase text-indigo-400 tracking-widest">{currentWord}</span>
            </div>
          </div>

          {/* Winner description */}
          <div className="bg-slate-950/60 p-4 border border-slate-855 rounded-2xl text-center space-y-1.5">
            {roundWinnerId !== null ? (
              <>
                <div className="flex justify-center">
                  <Award className="h-10 w-10 text-yellow-400 animate-bounce" />
                </div>
                <h3 className="font-extrabold text-sm text-yellow-300">Round Winner Declared!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {roundWinningReason}
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <ShieldAlert className="h-10 w-10 text-rose-400 animate-pulse" />
                </div>
                <h3 className="font-extrabold text-sm text-rose-400">No Winners</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {roundWinningReason}
                </p>
              </>
            )}
          </div>

          {/* Standings table */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Leaderboard Standings</span>
            <div className="bg-slate-950 border border-slate-855 rounded-2xl overflow-hidden divide-y divide-slate-855">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, rank) => (
                  <div key={player.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-500 w-5">#{rank + 1}</span>
                      <span className="font-extrabold text-slate-200">{player.name}</span>
                    </div>
                    <span className="font-black text-indigo-400">{player.score} pts</span>
                  </div>
                ))}
            </div>
          </div>

          <Button
            onClick={handleProceedFromSummary}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black uppercase tracking-wider py-5 rounded-xl shadow-lg hover:scale-101 transition-all"
          >
            {currentRound < roundsConfig ? "Next Round" : "Calculate Final Scores"}
          </Button>
        </Card>
      </div>
    );
  };

  // E. FINAL SCOREBOARD / PODIUM SCREEN
  const renderScoreboard = () => {
    // Sort players to determine places
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const goldWinner = sorted[0];
    const silverWinner = sorted[1];
    const bronzeWinner = sorted[2];

    return (
      <div className="max-w-2xl mx-auto w-full space-y-8 select-none p-4 relative">
        {/* CSS Confetti keyframes */}
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
          }
          .confetti-particle {
            position: absolute;
            width: 8px;
            height: 12px;
            background-color: var(--confetti-color, #f43f5e);
            top: -20px;
            z-index: 100;
            animation: confetti-fall 4s infinite linear;
          }
        `}</style>

        {/* Generate HTML/CSS confetti */}
        {Array.from({ length: 45 }).map((_, i) => {
          const colors = ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#A855F7", "#F97316"];
          const color = colors[i % colors.length];
          const left = `${(i * 2.2) % 100}%`;
          const delay = `${(i * 0.15) % 3}s`;
          const duration = `${2.5 + (i * 0.08) % 2.5}s`;
          return (
            <div
              key={i}
              className="confetti-particle pointer-events-none"
              style={{
                left,
                animationDelay: delay,
                animationDuration: duration,
                "--confetti-color": color
              } as any}
            />
          );
        })}

        <div className="text-center space-y-2">
          <Badge className="bg-yellow-400 text-slate-950 font-black px-4 py-1.5 tracking-widest text-xs uppercase shadow-md shadow-yellow-500/10">
            Tournament Over
          </Badge>
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent uppercase tracking-tight">
            Final Standings
          </h1>
          <p className="text-xs text-slate-400">
            Congratulations to all artists! You completed {roundsConfig} rounds of drawing.
          </p>
        </div>

        {/* The Podium structure */}
        <Card className="bg-slate-900 border-slate-855 p-8 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-end justify-center gap-6 sm:gap-2 pb-6 border-b border-slate-800/80">
            
            {/* 2nd Place (Silver) */}
            {silverWinner && (
              <div className="flex flex-col items-center w-full sm:w-28 order-2 sm:order-1 mt-4">
                <span className="text-[10px] font-black text-slate-500 uppercase mb-1">2nd Place</span>
                <span className="font-extrabold text-sm text-slate-350 truncate max-w-full mb-2">{silverWinner.name}</span>
                <div className="bg-gradient-to-t from-slate-850 to-slate-800 border-t-2 border-slate-500 w-full rounded-t-xl h-24 flex flex-col items-center justify-center shadow-lg relative">
                  <div className="absolute -top-4 bg-slate-700 text-slate-300 rounded-full h-8 w-8 flex items-center justify-center border-2 border-slate-500 font-black text-xs">
                    2
                  </div>
                  <span className="font-black text-slate-300 text-base mt-2">{silverWinner.score}</span>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase">Points</span>
                </div>
              </div>
            )}

            {/* 1st Place (Gold Winner) */}
            {goldWinner && (
              <div className="flex flex-col items-center w-full sm:w-36 order-1 sm:order-2">
                <div className="flex justify-center mb-1">
                  <Trophy className="h-10 w-10 text-yellow-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.5)] animate-bounce" />
                </div>
                <span className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1">Champion</span>
                <span className="font-black text-lg text-white truncate max-w-full mb-2">{goldWinner.name}</span>
                <div className="bg-gradient-to-t from-slate-900 via-indigo-950/80 to-indigo-900 border-t-4 border-yellow-400 w-full rounded-t-2xl h-32 flex flex-col items-center justify-center shadow-2xl relative">
                  <div className="absolute -top-5 bg-yellow-500 text-slate-950 rounded-full h-10 w-10 flex items-center justify-center border-2 border-yellow-300 font-black text-sm shadow-md">
                    1
                  </div>
                  <span className="font-black text-yellow-300 text-xl mt-3">{goldWinner.score}</span>
                  <span className="text-[10px] text-indigo-300 font-black uppercase">Points</span>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {bronzeWinner && (
              <div className="flex flex-col items-center w-full sm:w-28 order-3 sm:order-3 mt-6">
                <span className="text-[10px] font-black text-amber-600 uppercase mb-1">3rd Place</span>
                <span className="font-extrabold text-sm text-slate-450 truncate max-w-full mb-2">{bronzeWinner.name}</span>
                <div className="bg-gradient-to-t from-slate-850 to-slate-800 border-t-2 border-amber-700 w-full rounded-t-xl h-20 flex flex-col items-center justify-center shadow-lg relative">
                  <div className="absolute -top-4 bg-amber-700 text-amber-200 rounded-full h-8 w-8 flex items-center justify-center border-2 border-amber-600 font-black text-xs">
                    3
                  </div>
                  <span className="font-black text-amber-400 text-base mt-2">{bronzeWinner.score}</span>
                  <span className="text-[9px] text-slate-450 font-extrabold uppercase">Points</span>
                </div>
              </div>
            )}
          </div>

          {/* Full List Standings */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Tournament Results</span>
            <div className="bg-slate-950 border border-slate-855 rounded-2xl overflow-hidden divide-y divide-slate-855">
              {sorted.map((player, rank) => (
                <div key={player.id} className="flex items-center justify-between px-6 py-3.5 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black w-6 h-6 flex items-center justify-center rounded-full border-none",
                      rank === 0 && "bg-yellow-400/10 text-yellow-400",
                      rank === 1 && "bg-slate-400/10 text-slate-300",
                      rank === 2 && "bg-amber-600/10 text-amber-400",
                      rank > 2 && "bg-slate-900 text-slate-500"
                    )}>
                      #{rank + 1}
                    </Badge>
                    <span className="font-extrabold text-slate-200">{player.name}</span>
                  </div>
                  <span className="font-black text-indigo-400">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              onClick={handleStartGame} // restart with same setup
              className="bg-slate-955 border border-slate-855 hover:bg-slate-900 text-xs font-bold text-slate-300 py-6 rounded-xl flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Replay Tournament
            </Button>
            <Button
              onClick={handleResetGame} // new setup
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs py-6 rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
            >
              <Play className="h-4 w-4" />
              New Game Setup
            </Button>
          </div>
          
          <Button
            variant="ghost"
            asChild
            className="w-full text-slate-500 hover:text-slate-400 hover:bg-transparent text-xs font-bold pt-2 uppercase"
          >
            <Link href="/games">Return to Games Lobby</Link>
          </Button>
        </Card>
      </div>
    );
  };

  // Main wrapper layout stretching background in fullscreen
  return (
    <div
      className={cn(
        "w-full flex flex-col transition-all duration-500 relative",
        isFullscreen 
          ? "h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 justify-between select-none" 
          : "max-w-7xl mx-auto bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl my-4"
      )}
      style={isFullscreen ? { zIndex: 9999 } : {}}
    >
      {/* Floating particles effect in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-indigo-500/30 rounded-full blur-[1px] particle-slow" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-500/20 rounded-full blur-[2px] particle-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-20 left-1/3 w-2.5 h-2.5 bg-pink-500/20 rounded-full blur-[1px] particle-slow" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-1/3 right-10 w-2 h-2 bg-cyan-500/30 rounded-full blur-[1px] particle-slow" style={{ animationDelay: '9s' }} />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        {gameState === "setup" && renderSetup()}
        {gameState === "playing" && renderPlaying()}
        {gameState === "evaluation" && renderEvaluation()}
        {gameState === "summary" && renderSummary()}
        {gameState === "scoreboard" && renderScoreboard()}
      </div>
    </div>
  );
}
