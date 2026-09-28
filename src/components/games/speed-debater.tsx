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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { logAnalyticsEvent } from "@/lib/analytics";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  Gavel,
  Mic,
  Timer,
  ShieldAlert,
  Send,
  Sparkles,
  Trophy,
  Scale,
  RefreshCw,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Maximize2,
  Bot,
  User,
  Zap,
  Sliders,
  Minus,
  Plus,
} from "lucide-react";
import {
  submitDebateTurn,
  judgeDebate,
  DebateJudgeOutput,
} from "@/ai/flows/speed-debater";

const DEFAULT_TOPICS = [
  "Should physical currency and cash be completely phased out in favor of digital money?",
  "Is space exploration worth the multi-billion dollar cost, or should funds be spent entirely on Earth's problems?",
  "Should social media platforms ban anonymous accounts to eliminate online bullying?",
  "Will artificial intelligence completely replace human teachers in the next twenty years?",
];

const WORD_LIMIT_MODES = [
  { value: 20, label: "20 Words", tag: "Ultra Blitz", desc: "Extreme brevity & punchy soundbites" },
  { value: 30, label: "30 Words", tag: "Sprint", desc: "Fast, sharp counter-strikes" },
  { value: 50, label: "50 Words", tag: "Speed Duel", desc: "Balanced, focused arguments" },
  { value: 100, label: "100 Words", tag: "Classic", desc: "Standard collegiate debate depth" },
] as const;

type Stance = "PRO" | "CON";
type RoundType = "Opening" | "Rebuttal" | "Closing";

interface TurnMessage {
  round: number;
  roundType: RoundType;
  speaker: "player" | "ai";
  text: string;
  wordCount: number;
  wordLimit: number;
  isOverLimit?: boolean;
}

// Audio Synthesizer helper for zero-dependency sound FX
const playSoundEffect = (type: "gavel" | "tick" | "chime" | "warning" | "win") => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "gavel") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } else if (type === "tick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "warning") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "chime") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } else if (type === "win") {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, now + i * 0.1);
        g.gain.setValueAtTime(0.3, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.31);
      });
    }
  } catch (e) {
    // AudioContext blocked or not supported
  }
};

export function SpeedDebater({
  slug,
  onToggleFullscreen,
}: {
  slug: string;
  onToggleFullscreen?: () => void;
}) {
  const game = getGameBySlug(slug) || {
    title: "Speed Debater",
    description: "Fast-paced 3-round AI debate arena!",
  };

  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  // Setup States
  const [gameState, setGameState] = React.useState<
    "setup" | "debating" | "ai_thinking" | "judging" | "finished"
  >("setup");
  const [selectedTopic, setSelectedTopic] = React.useState(DEFAULT_TOPICS[0]);
  const [customTopic, setCustomTopic] = React.useState("");
  const [playerStance, setPlayerStance] = React.useState<Stance>("PRO");
  const [timerDuration, setTimerDuration] = React.useState<number>(90); // seconds per turn
  const [audioEnabled, setAudioEnabled] = React.useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = React.useState<boolean>(false);

  // Word Limit Mode State (e.g. 20, 30, 50, 100, or custom)
  const [wordLimit, setWordLimit] = React.useState<number>(50);
  const [isCustomWordLimit, setIsCustomWordLimit] = React.useState<boolean>(false);

  // In-Game Debate States
  const [currentRound, setCurrentRound] = React.useState<1 | 2 | 3>(1);
  const [debateHistory, setDebateHistory] = React.useState<TurnMessage[]>([]);
  const [currentDraft, setCurrentDraft] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState(90);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);

  // Final Results
  const [judgingResult, setJudgingResult] = React.useState<DebateJudgeOutput | null>(null);
  const [coinsClaimed, setCoinsClaimed] = React.useState(false);

  const turnsEndRef = React.useRef<HTMLDivElement>(null);

  // Round type helper
  const getRoundType = (rnd: number): RoundType => {
    if (rnd === 1) return "Opening";
    if (rnd === 2) return "Rebuttal";
    return "Closing";
  };

  // Word count helper
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const draftWordCount = countWords(currentDraft);
  const isDraftOverLimit = draftWordCount > wordLimit;

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [debateHistory, gameState]);

  // Turn timer countdown
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0 && gameState === "debating") {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 6 && prev > 1 && audioEnabled) {
            playSoundEffect("tick");
          } else if (prev === 1 && audioEnabled) {
            playSoundEffect("warning");
          }
          return Math.max(0, prev - 1);
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, gameState, audioEnabled]);

  // TTS Speech Synthesis for AI replies
  const speakAIText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleaned = text
        .replace(/\*.*?\*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\[Round \d\] AI Opponent:/g, "")
        .trim();
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  // Start the debate session
  const handleStartGame = () => {
    const activeTopic = customTopic.trim() ? customTopic.trim() : selectedTopic;
    setSelectedTopic(activeTopic);
    setCurrentRound(1);
    setDebateHistory([]);
    setCurrentDraft("");
    setTimeLeft(timerDuration);
    setIsTimerRunning(true);
    setJudgingResult(null);
    setCoinsClaimed(false);
    setGameState("debating");

    if (audioEnabled) playSoundEffect("gavel");

    toast({
      title: "Debate Commenced! 🎤",
      description: `Round 1/3: Opening Arguments (${wordLimit} words limit). Defend your ${playerStance} stance!`,
    });
  };

  // Submit player's turn
  const handleSubmitTurn = async () => {
    if (!currentDraft.trim()) {
      toast({
        title: "Empty Argument",
        description: "Please type your argument before submitting.",
        variant: "destructive",
      });
      return;
    }

    const roundType = getRoundType(currentRound);
    const playerTurn: TurnMessage = {
      round: currentRound,
      roundType,
      speaker: "player",
      text: currentDraft.trim(),
      wordCount: draftWordCount,
      wordLimit,
      isOverLimit: isDraftOverLimit,
    };

    const newHistory = [...debateHistory, playerTurn];
    setDebateHistory(newHistory);
    setCurrentDraft("");
    setIsTimerRunning(false);
    setGameState("ai_thinking");

    if (audioEnabled) playSoundEffect("chime");

    try {
      // Call AI Opponent flow with active word limit
      const aiTurnResult = await submitDebateTurn({
        topic: selectedTopic,
        playerStance,
        aiStance: playerStance === "PRO" ? "CON" : "PRO",
        round: currentRound,
        roundType,
        playerArgument: playerTurn.text,
        playerWordCount: playerTurn.wordCount,
        wordLimit,
        history: newHistory,
      });

      const aiTurn: TurnMessage = {
        round: currentRound,
        roundType,
        speaker: "ai",
        text: aiTurnResult.aiResponse,
        wordCount: aiTurnResult.wordCount,
        wordLimit,
      };

      const updatedHistory = [...newHistory, aiTurn];
      setDebateHistory(updatedHistory);
      speakAIText(aiTurn.text);

      if (currentRound < 3) {
        // Move to next round
        setCurrentRound((prev) => (prev + 1) as 2 | 3);
        setTimeLeft(timerDuration);
        setIsTimerRunning(true);
        setGameState("debating");
        if (audioEnabled) playSoundEffect("chime");
      } else {
        // Final Round complete -> Move to Judging Phase!
        setGameState("judging");
        if (audioEnabled) playSoundEffect("gavel");

        const judgeVerdict = await judgeDebate({
          topic: selectedTopic,
          playerStance,
          aiStance: playerStance === "PRO" ? "CON" : "PRO",
          wordLimit,
          history: updatedHistory,
        });

        setJudgingResult(judgeVerdict);
        setGameState("finished");

        if (judgeVerdict.totalScore >= 70) {
          if (audioEnabled) playSoundEffect("win");
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        // Log analytics event
        if (firestore) {
          logAnalyticsEvent(firestore, user?.uid || "guest", {
            type: "game_played",
            details: {
              slug: "speed-debater",
              score: judgeVerdict.totalScore,
              topic: selectedTopic,
              wordLimit,
              winner: judgeVerdict.winner,
            },
          });
        }
      }
    } catch (err) {
      console.error("Debate turn processing error:", err);
      toast({
        title: "Communication Error",
        description: "Failed to process debate turn. Please try again.",
        variant: "destructive",
      });
      setGameState("debating");
      setIsTimerRunning(true);
    }
  };

  // Claim reward coins
  const handleClaimReward = async () => {
    if (coinsClaimed || !judgingResult) return;
    const earned = Math.max(5, Math.round(judgingResult.totalScore / 10));

    if (user && firestore) {
      try {
        const petRef = doc(firestore, "user_pets", user.uid);
        const snap = await getDoc(petRef);
        if (snap.exists()) {
          await updateDoc(petRef, {
            xp: increment(earned * 10),
            energy: increment(5),
          });
        }
      } catch (e) {
        console.warn("Failed updating pet rewards:", e);
      }
    }

    setCoinsClaimed(true);
    toast({
      title: "Reward Claimed! 🪙",
      description: `Awarded ${earned} Debate Master Coins and XP!`,
    });
  };

  return (
    // FULL-BLEED ARENA BACKGROUND (Stretches edge-to-edge top to bottom, left to right)
    <div className="w-full min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] flex-1 flex flex-col justify-between bg-gradient-to-b from-[#080d19] via-[#0d1424] to-[#060911] text-foreground relative overflow-hidden select-text">
      {/* Immersive Arena Spotlights & Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-1/4 -left-36 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-36 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Subtle Debate Arena Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      {/* Main Container - Expands wide across the viewport */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between p-3 sm:p-5 md:p-6 space-y-4">
        {/* Top Header / Arena HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card/70 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-border/50 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-xl text-white shadow-md shadow-orange-500/25">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-300 to-red-400 bg-clip-text text-transparent">
                  Speed Debater
                </h1>
                <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-300 px-2 py-0">
                  <Zap className="w-3 h-3 mr-1 text-amber-400" />
                  {wordLimit} Words Limit
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                3-Round High-Pressure Verbal Duel • Strictly {wordLimit} Words Or Less
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Word Limit Quick Switcher in Header during debate */}
            {gameState !== "setup" && (
              <div className="flex items-center gap-1 bg-background/50 border border-border/60 rounded-xl p-1 text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground px-1.5 hidden md:inline">
                  Limit:
                </span>
                {[20, 30, 50, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => setWordLimit(num)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                      wordLimit === num
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={`Switch limit to ${num} words`}
                  >
                    {num}w
                  </button>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`gap-1.5 text-xs ${ttsEnabled ? "border-amber-500/50 bg-amber-500/10 text-amber-400" : ""}`}
              title="Voice reader for AI responses"
            >
              {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              TTS {ttsEnabled ? "On" : "Off"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="text-xs"
              title="Audio Effects"
            >
              {audioEnabled ? "🔊 Sound" : "🔇 Mute"}
            </Button>

            {onToggleFullscreen && (
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleFullscreen}
                className="w-8 h-8 rounded-xl border-border/60 hover:bg-card"
                title="Fullscreen Toggle"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* SETUP PHASE SCREEN */}
        {gameState === "setup" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center"
          >
            <Card className="border-border/60 bg-gradient-to-b from-card/90 via-card/75 to-card/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  LingoLandVerse Debate Arena
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">
                  Configure Your Verbal Duel
                </CardTitle>
                <CardDescription className="text-sm max-w-lg mx-auto">
                  Sharpen your critical thinking, persuasive rhetoric, and concise English. 
                  Select your stance, topic, and exact word count limit!
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-4 max-w-4xl mx-auto w-full">
                {/* 1. Stance Picker */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    1. Choose Your Stance
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPlayerStance("PRO")}
                      className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all font-bold text-sm ${
                        playerStance === "PRO"
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/15 scale-[1.01]"
                          : "border-border/60 bg-card/40 hover:border-border text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>PRO (Support / Affirmative)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerStance("CON")}
                      className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all font-bold text-sm ${
                        playerStance === "CON"
                          ? "border-rose-500 bg-rose-500/15 text-rose-400 shadow-lg shadow-rose-500/15 scale-[1.01]"
                          : "border-border/60 bg-card/40 hover:border-border text-muted-foreground"
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <span>CON (Oppose / Negative)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Word Limit Modes (Customizable 20, 30, 50, 100, or Custom) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      2. Word Limit Constraint Mode
                    </label>
                    <Badge variant="outline" className="font-mono text-xs font-bold bg-amber-500/15 text-amber-300 border-amber-500/40 px-3 py-1 shadow-sm">
                      🎯 Active: <span className="text-amber-200 font-black ml-1 text-sm">{wordLimit}</span> words max / turn
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {WORD_LIMIT_MODES.map((mode) => {
                      const isSelected = wordLimit === mode.value && !isCustomWordLimit;
                      return (
                        <div
                          key={mode.value}
                          onClick={() => {
                            setWordLimit(mode.value);
                            setIsCustomWordLimit(false);
                          }}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/15 text-foreground shadow-md shadow-amber-500/10 scale-[1.02]"
                              : "border-border/60 bg-card/40 hover:border-border text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-extrabold text-sm">{mode.label}</span>
                            <Badge
                              className={`text-[9px] px-1.5 py-0 ${
                                isSelected ? "bg-amber-500 text-slate-950 font-bold" : "bg-muted"
                              }`}
                            >
                              {mode.tag}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-tight">
                            {mode.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Word Count Stepper */}
                  <div className="mt-3 p-3.5 rounded-xl bg-card/40 border border-border/70 flex flex-wrap items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          Custom Word Count Limit
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Adjust any limit from 10 to 200 words
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-9 h-9 rounded-xl border-border/80 hover:bg-amber-500/20 hover:border-amber-500/50 active:scale-95 transition-all text-amber-300"
                        onClick={() => {
                          setIsCustomWordLimit(true);
                          setWordLimit((prev) => Math.max(10, prev - 5));
                        }}
                        title="Decrease by 5 words"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center justify-center gap-2 font-mono bg-background/90 px-4 py-2 rounded-xl border-2 border-amber-500/50 shadow-md min-w-[130px]">
                        <input
                          type="number"
                          min={10}
                          max={200}
                          value={wordLimit}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) {
                              setIsCustomWordLimit(true);
                              setWordLimit(val);
                            }
                          }}
                          className="w-16 bg-transparent text-center focus:outline-none text-amber-300 font-black text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0 p-0"
                        />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                          words
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-9 h-9 rounded-xl border-border/80 hover:bg-amber-500/20 hover:border-amber-500/50 active:scale-95 transition-all text-amber-300"
                        onClick={() => {
                          setIsCustomWordLimit(true);
                          setWordLimit((prev) => Math.min(200, prev + 5));
                        }}
                        title="Increase by 5 words"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 3. Debate Topic Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    3. Select Debate Topic
                  </label>
                  <div className="space-y-2">
                    {DEFAULT_TOPICS.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedTopic(t);
                          setCustomTopic("");
                        }}
                        className={`p-3 rounded-xl border cursor-pointer text-sm transition-all flex items-start gap-3 ${
                          selectedTopic === t && !customTopic
                            ? "border-amber-500/80 bg-amber-500/10 text-foreground font-medium shadow-sm"
                            : "border-border/50 bg-card/30 hover:bg-card/60 text-muted-foreground"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Or type your own custom debate topic..."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-card/40 border border-border/60 focus:outline-none focus:border-amber-500 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* 4. Timer Duration */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    4. Turn Timer Duration
                  </label>
                  <div className="flex gap-2">
                    {[60, 90, 120].map((sec) => (
                      <Button
                        key={sec}
                        type="button"
                        variant={timerDuration === sec ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimerDuration(sec)}
                        className="flex-1 text-xs"
                      >
                        <Timer className="w-3.5 h-3.5 mr-1" />
                        {sec} Seconds
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-6 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStartGame}
                  className="w-full max-w-md bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold text-base shadow-xl shadow-orange-500/25 gap-2"
                >
                  <Mic className="w-5 h-5" /> Start Speed Debate ({wordLimit} Words)
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* ACTIVE DEBATE ARENA */}
        {(gameState === "debating" || gameState === "ai_thinking") && (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            {/* Status HUD Header */}
            <Card className="border-border/60 bg-card/70 backdrop-blur-xl p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="border-amber-500/50 text-amber-400 font-extrabold text-xs">
                      Round {currentRound} / 3: {getRoundType(currentRound)}
                    </Badge>
                    <Badge
                      className={
                        playerStance === "PRO"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold"
                      }
                    >
                      You: {playerStance}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      AI: {playerStance === "PRO" ? "CON" : "PRO"}
                    </Badge>
                    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-xs font-mono">
                      Max {wordLimit} Words
                    </Badge>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground line-clamp-2">
                    &ldquo;{selectedTopic}&rdquo;
                  </h2>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                      timeLeft <= 15
                        ? "border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse"
                        : "border-border bg-card/60 text-foreground"
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
              </div>

              {/* Visual Round Progress Bar */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((r) => {
                  const isPassed = currentRound > r;
                  const isCurrent = currentRound === r;
                  return (
                    <div
                      key={r}
                      className={`h-2 rounded-full transition-all ${
                        isPassed
                          ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                          : isCurrent
                          ? "bg-amber-500 animate-pulse shadow-sm shadow-amber-500/50"
                          : "bg-muted/40"
                      }`}
                    />
                  );
                })}
              </div>
            </Card>

            {/* Transcript / Podium Stage - Fills available vertical height */}
            <div className="flex-1 min-h-[340px] sm:min-h-[420px] max-h-[58vh] overflow-y-auto p-4 rounded-2xl bg-card/35 border border-border/40 backdrop-blur-md space-y-3.5">
              {debateHistory.length === 0 && (
                <div className="text-center py-16 text-muted-foreground space-y-2">
                  <Mic className="w-12 h-12 mx-auto opacity-50 text-amber-400 animate-pulse" />
                  <p className="font-bold text-base text-foreground">The Floor Is Yours!</p>
                  <p className="text-xs sm:text-sm max-w-md mx-auto">
                    Deliver your <strong>Opening Argument</strong> (Round 1). Stay under{" "}
                    <strong>{wordLimit} words</strong> or face point penalties!
                  </p>
                </div>
              )}

              {debateHistory.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    item.speaker === "player" ? "justify-end" : "justify-start"
                  }`}
                >
                  {item.speaker === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm space-y-1.5 ${
                      item.speaker === "player"
                        ? "bg-gradient-to-br from-amber-600/25 to-orange-600/25 border border-amber-500/50 text-foreground ml-auto rounded-tr-none"
                        : "bg-card/85 border border-border/70 text-foreground mr-auto rounded-tl-none shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold opacity-75">
                      <span>
                        {item.speaker === "player" ? "You (Player)" : "AI Opponent"} • Round{" "}
                        {item.round} ({item.roundType})
                      </span>
                      <span
                        className={`font-mono text-[11px] ${
                          item.isOverLimit ? "text-rose-400 font-bold" : "text-muted-foreground"
                        }`}
                      >
                        {item.wordCount} / {item.wordLimit} words
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap leading-relaxed">{item.text}</p>

                    {item.isOverLimit && (
                      <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mt-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Exceeded {item.wordLimit}-word limit penalty!
                      </div>
                    )}
                  </div>

                  {item.speaker === "player" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* AI Opponent Thinking Indicator */}
              {gameState === "ai_thinking" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-xs p-3 bg-card/60 rounded-xl border border-indigo-500/30 max-w-sm shadow-md"
                >
                  <Bot className="w-5 h-5 text-indigo-400 animate-spin" />
                  <span className="text-indigo-200">
                    AI Opponent is formulating counter-argument (under {wordLimit} words)...
                  </span>
                </motion.div>
              )}

              <div ref={turnsEndRef} />
            </div>

            {/* Player Input Area with Dynamic Word Counter */}
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl p-3.5 sm:p-4 space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  Your {getRoundType(currentRound)} Argument:
                </span>

                {/* Dynamic Word Count Meter */}
                <div className="flex items-center gap-2 font-mono">
                  <span
                    className={`font-black text-xs transition-colors ${
                      isDraftOverLimit
                        ? "text-rose-400"
                        : draftWordCount >= wordLimit * 0.85
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {draftWordCount} / {wordLimit} words
                  </span>
                  {isDraftOverLimit && (
                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-5">
                      +{draftWordCount - wordLimit} Over Limit
                    </Badge>
                  )}
                </div>
              </div>

              {/* Live word usage mini-progress line */}
              <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDraftOverLimit
                      ? "bg-rose-500"
                      : draftWordCount >= wordLimit * 0.85
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (draftWordCount / wordLimit) * 100)}%` }}
                />
              </div>

              <Textarea
                rows={3}
                value={currentDraft}
                onChange={(e) => setCurrentDraft(e.target.value)}
                disabled={gameState === "ai_thinking"}
                placeholder={
                  currentRound === 1
                    ? `Open with your core argument and evidence (strictly under ${wordLimit} words)...`
                    : currentRound === 2
                    ? `Dismantle the AI's premise and defend your stance (under ${wordLimit} words)...`
                    : `Deliver your final winning summary (under ${wordLimit} words)...`
                }
                className={`resize-none bg-background/60 focus:bg-background transition-colors text-sm ${
                  isDraftOverLimit ? "border-rose-500 focus-visible:ring-rose-500" : ""
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSubmitTurn();
                  }
                }}
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Ctrl</kbd> +{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Enter</kbd> to submit
                </span>

                <Button
                  onClick={handleSubmitTurn}
                  disabled={gameState === "ai_thinking" || !currentDraft.trim()}
                  className="ml-auto bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold gap-1.5 shadow-md shadow-orange-500/20"
                >
                  <Send className="w-4 h-4" />
                  Submit Turn {currentRound}/3
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* JUDGING PHASE DELIBERATION */}
        {gameState === "judging" && (
          <div className="flex-1 flex flex-col justify-center">
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl p-12 text-center space-y-4 max-w-lg mx-auto w-full shadow-2xl">
              <Gavel className="w-14 h-14 mx-auto text-amber-400 animate-bounce" />
              <h2 className="text-2xl font-black tracking-tight">The Judges Are Deliberating...</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Evaluating argument logic, linguistic precision, and strict adherence to the{" "}
                <span className="text-amber-400 font-bold">{wordLimit}-word limit</span>.
              </p>
            </Card>
          </div>
        )}

        {/* FINAL RESULTS & JUDGING SCORECARD */}
        {gameState === "finished" && judgingResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col justify-center"
          >
            <Card className="border-border/60 bg-gradient-to-b from-card/95 via-card/85 to-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto w-full">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-b border-border/40 p-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-3 border border-amber-500/40">
                  <Trophy className="w-4 h-4" />
                  Official Verdict • {wordLimit} Words Mode
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {judgingResult.winner === "Player"
                    ? "🏆 Victory! You Won the Debate!"
                    : judgingResult.winner === "Tie"
                    ? "🤝 A Heated Draw!"
                    : "⚔️ AI Opponent Edged the Victory"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                  {judgingResult.feedbackSummary}
                </p>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Total Score Meter */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-card/40 border border-border/60 gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                      Overall Score ({wordLimit} Words Arena)
                    </span>
                    <div className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      {judgingResult.totalScore}{" "}
                      <span className="text-xl font-normal text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-sm px-3.5 py-1.5 font-bold border-amber-500/40 text-amber-400"
                    >
                      Grade:{" "}
                      {judgingResult.totalScore >= 90
                        ? "A+ (Debate Master)"
                        : judgingResult.totalScore >= 80
                        ? "A (Persuasive Orator)"
                        : judgingResult.totalScore >= 70
                        ? "B (Solid Debater)"
                        : "C (Apprentice)"}
                    </Badge>
                  </div>
                </div>

                {/* 3-Part Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-card/30 border border-border/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-muted-foreground">Logic & Persuasion</span>
                      <span className="text-amber-400 font-bold">{judgingResult.logicScore} / 40</span>
                    </div>
                    <Progress value={(judgingResult.logicScore / 40) * 100} className="h-2" />
                    <p className="text-[11px] text-muted-foreground">
                      Premise strength, logical coherence, and rebuttal precision.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-card/30 border border-border/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-muted-foreground">Grammar & Vocabulary</span>
                      <span className="text-indigo-400 font-bold">{judgingResult.grammarScore} / 30</span>
                    </div>
                    <Progress value={(judgingResult.grammarScore / 30) * 100} className="h-2" />
                    <p className="text-[11px] text-muted-foreground">
                      Lexical variety, syntax correctness, and punchy expression.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-card/30 border border-border/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-muted-foreground">Constraint ({wordLimit}w Limit)</span>
                      <span className="text-emerald-400 font-bold">{judgingResult.constraintsScore} / 30</span>
                    </div>
                    <Progress value={(judgingResult.constraintsScore / 30) * 100} className="h-2" />
                    <p className="text-[11px] text-muted-foreground">
                      Discipline in keeping every turn under {wordLimit} words.
                    </p>
                  </div>
                </div>

                {/* Coach's Tip Box */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                    <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
                    Coach&apos;s Tip for Your Next Debate
                  </div>
                  <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                    {judgingResult.coachingTip}
                  </p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Noted Strengths
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {judgingResult.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs space-y-1.5">
                    <span className="font-bold text-orange-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> Next Level Focus
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {judgingResult.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-card/40 border-t border-border/40 p-6 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setGameState("setup")}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Switch Topic / Mode
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleClaimReward}
                    disabled={coinsClaimed}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    {coinsClaimed ? "Coins Claimed!" : "Claim Rewards & XP"}
                  </Button>

                  <Button
                    onClick={handleStartGame}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold gap-1.5 shadow-md shadow-orange-500/20"
                  >
                    <Gavel className="w-4 h-4" /> Rematch
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
