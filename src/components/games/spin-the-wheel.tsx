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
import { 
  Loader2, Trophy, Check, X, Disc, Sparkles, UserPlus, Trash2, Repeat, 
  Maximize, Minimize, HelpCircle, Volume2, Flame, Zap, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { generateSpinQuestion } from "@/ai/flows/generate-spin-question";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import Link from "next/link";
import { Badge } from "../ui/badge";
import confetti from "canvas-confetti";

type GameState = "setup" | "loading" | "spinning" | "spinning_animation" | "spun" | "question" | "finished" | "instructions" | "idle";
type Team = { name: string; score: number };
type Question = { question: string; answer: string; used: boolean };
type QuestionsByColor = Record<string, Question[]>;

export type SectorInfo = {
  id: number;
  color: string;
  name: string;
  points: number;
  icon: string;
};

// 12 Distinct High-Vibrance Challenge Sectors
const WHEEL_SECTORS: SectorInfo[] = [
  { id: 1, color: "#8B5CF6", name: "Purple", points: 100, icon: "⚡" },
  { id: 2, color: "#10B981", name: "Emerald", points: 200, icon: "💎" },
  { id: 3, color: "#F59E0B", name: "Gold", points: 300, icon: "👑" },
  { id: 4, color: "#0EA5E9", name: "Sky", points: 150, icon: "🌊" },
  { id: 5, color: "#EF4444", name: "Ruby", points: 250, icon: "🔥" },
  { id: 6, color: "#84CC16", name: "Lime", points: 350, icon: "🍀" },
  { id: 7, color: "#EC4899", name: "Rose", points: 400, icon: "🌸" },
  { id: 8, color: "#F97316", name: "Orange", points: 150, icon: "☀️" },
  { id: 9, color: "#0D9488", name: "Teal", points: 200, icon: "🪐" },
  { id: 10, color: "#4F46E5", name: "Indigo", points: 500, icon: "🔮" },
  { id: 11, color: "#FB7185", name: "Coral", points: 300, icon: "🌺" },
  { id: 12, color: "#7C3AED", name: "Violet", points: 450, icon: "⭐" },
];

// Offline fallback question bank in case AI endpoint encounters rate-limits or network pauses
const FALLBACK_QUESTIONS: { question: string; answer: string }[] = [
  { question: "What is the past tense of the verb 'catch'?", answer: "caught" },
  { question: "Choose the correct form: 'Neither of the boys brought (his/their) lunch.'", answer: "his" },
  { question: "What is the antonym (opposite) of 'expand'?", answer: "contract (or shrink)" },
  { question: "Fill in the preposition: 'She is genuinely interested ___ world history.'", answer: "in" },
  { question: "What is the plural form of 'criterion'?", answer: "criteria" },
  { question: "Identify the adverb in: 'The runner accelerated exceptionally fast.'", answer: "exceptionally" },
  { question: "What is the comparative form of 'good'?", answer: "better" },
  { question: "Correct this sentence: 'He don't have the dictionary.'", answer: "He doesn't have the dictionary." },
  { question: "What is the past participle of 'fly' (has ___)?", answer: "flown" },
  { question: "Which word is a conjunction: 'although', 'rapidly', 'happy'?", answer: "although" },
  { question: "What is the superlative form of 'far'?", answer: "farthest (or furthest)" },
  { question: "Complete the idiom: 'Actions speak louder than ___.'", answer: "words" },
];

export function SpinTheWheel({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("setup");
  const [teams, setTeams] = React.useState<Team[]>([{ name: "Team A", score: 0 }, { name: "Team B", score: 0 }]);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [rotation, setRotation] = React.useState(0);
  const [landedSector, setLandedSector] = React.useState<SectorInfo | null>(null);
  const [questions, setQuestions] = React.useState<QuestionsByColor>({});
  const [activeQuestion, setActiveQuestion] = React.useState<Question | null>(null);
  const [usedQuestionKeys, setUsedQuestionKeys] = React.useState<string[]>([]);
  const [isAnswerRevealed, setIsAnswerRevealed] = React.useState(false);
  const [allTimeUsedQuestions, setAllTimeUsedQuestions] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { toast } = useToast();

  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = () => {
    if (teams.length < 2) {
      toast({ variant: "destructive", title: "Add at least two teams." });
      return;
    }
    setGameState("spinning");
    setTeams(teams.map((t) => ({ ...t, score: 0 })));
    setCurrentTurn(0);
    setQuestions({});
    setUsedQuestionKeys([]);
    setRotation(0);
    setLandedSector(null);
    setIsAnswerRevealed(false);
  };

  const resetGame = () => {
    setGameState("setup");
    setRotation(0);
    setLandedSector(null);
    setActiveQuestion(null);
    setIsAnswerRevealed(false);
  };

  // Realistic synthetic click sound via Web Audio API
  const playRealisticTickSequence = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      let elapsed = 0;
      let delay = 35;
      const ticks: number[] = [];
      while (elapsed < 3700) {
        ticks.push(elapsed);
        elapsed += delay;
        if (elapsed > 1000) delay += 7;
        if (elapsed > 2200) delay += 18;
        if (elapsed > 3000) delay += 40;
      }

      ticks.forEach((t) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1350, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.02);
            gain.gain.setValueAtTime(0.09, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.02);
          } catch (e) {}
        }, t);
      });
    } catch (e) {}
  };

  const handleSpin = () => {
    if (gameState !== "spinning") return;
    setGameState("spinning_animation");
    setLandedSector(null);
    playRealisticTickSequence();

    // Pick target randomly from the 12 sectors
    const winningIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const targetSector = WHEEL_SECTORS[winningIndex];

    // Mathematical precision: slice midpoint lands 100.00% under top 12 o'clock needle
    const total = WHEEL_SECTORS.length;
    const segmentAngle = 360 / total;
    const midAngle = (winningIndex + 0.5) * segmentAngle;

    const spinCycles = 6;
    const currentRotationMod = ((rotation % 360) + 360) % 360;
    const targetOffset = (360 - midAngle) % 360;
    const diff = (((targetOffset - currentRotationMod) % 360) + 360) % 360;
    const newRotation = rotation + spinCycles * 360 + diff;

    setRotation(newRotation);

    setTimeout(async () => {
      setLandedSector(targetSector);
      const sectorKey = targetSector.color;

      if (!questions[sectorKey]) {
        try {
          const { questions: newQuestions } = await generateSpinQuestion({
            count: teams.length,
            usedQuestions: allTimeUsedQuestions,
          });
          setAllTimeUsedQuestions((prev) => [...prev, ...newQuestions.map((q) => q.question)]);
          setQuestions((prev) => ({
            ...prev,
            [sectorKey]: newQuestions.map((q) => ({ ...q, used: false })),
          }));
        } catch (e) {
          // Robust fallback to ensure seamless gameplay even if API is slow or rate-limited
          const fallbackSlice = FALLBACK_QUESTIONS.slice(0, teams.length).map((q) => ({ ...q, used: false }));
          setQuestions((prev) => ({
            ...prev,
            [sectorKey]: fallbackSlice,
          }));
        }
      }
      setGameState("spun");
    }, 4000);
  };

  const handleQuestionSelect = (color: string, teamIndex: number) => {
    const questionKey = `${color}-${teamIndex}`;
    if (!questions[color]?.[teamIndex] || usedQuestionKeys.includes(questionKey)) return;
    setActiveQuestion(questions[color][teamIndex]);
    setIsAnswerRevealed(false);
  };

  const handleScoring = (isCorrect: boolean) => {
    const newTeams = [...teams];
    const pointsAwarded = landedSector?.points || 100;

    if (isCorrect) {
      newTeams[currentTurn].score += pointsAwarded;
    } else {
      const opponentIndex = (currentTurn + 1) % teams.length;
      newTeams[opponentIndex].score += Math.floor(pointsAwarded / 2);
    }

    setTeams(newTeams);
    if (landedSector) {
      setUsedQuestionKeys((prev) => [...prev, `${landedSector.color}-${currentTurn}`]);
    }

    setActiveQuestion(null);
    setIsAnswerRevealed(false);
    setGameState("spinning");
    setCurrentTurn((prev) => (prev + 1) % teams.length);

    if (usedQuestionKeys.length >= WHEEL_SECTORS.length * teams.length - 1) {
      setGameState("finished");
      try {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const addTeam = () => {
    if (teams.length < 4) {
      setTeams([...teams, { name: `Team ${String.fromCharCode(65 + teams.length)}`, score: 0 }]);
    }
  };

  const removeTeam = (index: number) => {
    if (teams.length > 2) {
      setTeams(teams.filter((_, i) => i !== index));
    }
  };

  const handleTeamNameChange = (index: number, newName: string) => {
    const newTeams = [...teams];
    newTeams[index].name = newName;
    setTeams(newTeams);
  };

  const Icon = game.icon;

  return (
    <Card
      className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-start overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}
    >
      <CardHeader className={cn(
        "text-center relative px-4 transition-all",
        gameState !== "setup" ? "pt-2 sm:pt-4 pb-1 sm:pb-2" : "pt-4 sm:pt-6 pb-2"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 h-auto p-1.5 sm:p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
        </Button>
        <div className={cn("flex justify-center mb-1", gameState !== "setup" && "hidden sm:flex")}>
          <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
        </div>
        <CardTitle className={cn(
          "font-black tracking-tight uppercase",
          gameState !== "setup" ? "text-lg sm:text-2xl md:text-3xl" : "text-xl sm:text-3xl md:text-4xl"
        )}>
          {game.title}
        </CardTitle>
        <CardDescription className={cn(
          "text-xs sm:text-sm max-w-xl mx-auto",
          gameState !== "setup" && "hidden sm:block"
        )}>
          {game.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 w-full max-w-6xl mx-auto overflow-visible">
        {gameState === "setup" && (
          <div className="flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in duration-200">
            {/* How to Play Guide */}
            <div className="bg-muted/40 rounded-2xl border border-border/30 p-4 sm:p-5 w-full text-left space-y-2">
              <h4 className="font-bold text-sm uppercase tracking-wider text-primary flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> How to Play
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Spin the realistic 12-sector rainbow prize wheel.</li>
                <li>The needle lands with precision on an active challenge sector.</li>
                <li>Tap your team's flashing sector button to answer grammar questions and claim points!</li>
              </ul>
            </div>

            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider">TEAM CONFIGURATION</h3>
            <div className="w-full space-y-2.5">
              {teams.map((team, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={team.name}
                    onChange={(e) => handleTeamNameChange(index, e.target.value)}
                    className="bg-background font-bold text-sm h-11 rounded-xl"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeam(index)}
                    disabled={teams.length <= 2}
                    className="h-11 w-11 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addTeam} className="w-full font-bold h-11 rounded-xl border-dashed" disabled={teams.length >= 4}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Team
              </Button>
            </div>
            <Button
              onClick={handleStartGame}
              className="text-base sm:text-lg h-14 w-full bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 text-white shadow-xl hover:opacity-90 transition-all font-black uppercase rounded-2xl"
            >
              <Sparkles className="mr-2 h-5 w-5" /> Start Competition
            </Button>
          </div>
        )}

        {gameState === "loading" && (
          <div className="flex flex-col items-center gap-4 text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-black text-sm uppercase tracking-wider animate-pulse">GENERATING CHALLENGES...</p>
          </div>
        )}

        {gameState !== "setup" && gameState !== "loading" && gameState !== "finished" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-6xl">
            {/* Realistic Arcade Wheel (Desktop Left / Mobile Top) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-start w-full pt-8 sm:pt-10 pb-2">
              <div
                className="relative flex items-center justify-center select-none w-[270px] h-[270px] xs:w-[290px] xs:h-[290px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] max-w-[92vw] max-h-[92vw] shrink-0"
              >
                {/* 3D Realistic Physical Needle / Flapper Pin at 12 o'clock */}
                <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  <div className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-amber-400/80 text-[9px] font-black tracking-widest text-amber-300 uppercase shadow-md mb-0.5">
                    ▼ TARGET ▼
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-950 shadow-inner" />
                  </div>
                  <div
                    className={cn(
                      "w-0 h-0 border-l-[14px] sm:border-l-[16px] border-l-transparent border-r-[14px] sm:border-r-[16px] border-r-transparent border-t-[32px] sm:border-t-[36px] border-t-amber-400 -mt-1 drop-shadow-[0_5px_8px_rgba(0,0,0,0.6)] origin-top transition-transform",
                      gameState === "spinning_animation" && "animate-[wiggle_0.1s_ease-in-out_infinite]"
                    )}
                  />
                </div>

                {/* Outer Realistic Metallic Bezel Container */}
                <div className="w-full h-full rounded-full p-2.5 sm:p-3.5 bg-gradient-to-tr from-amber-700 via-amber-400 to-yellow-200 shadow-[0_10px_35px_rgba(0,0,0,0.4)] border-2 border-amber-600/60 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-4 border-slate-900 shadow-inner overflow-hidden bg-slate-950 relative">
                    <div
                      className="w-full h-full relative"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: "transform 4s cubic-bezier(0.15, 0.95, 0.35, 1.0)",
                      }}
                    >
                      <svg viewBox="-220 -220 440 440" className="w-full h-full select-none overflow-visible">
                        <defs>
                          <filter id="spinBadgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
                          </filter>
                          <radialGradient id="spinPegGradient" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="40%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#78350f" />
                          </radialGradient>
                          <radialGradient id="spinOuterHub" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="50%" stopColor="#ca8a04" />
                            <stop offset="100%" stopColor="#78350f" />
                          </radialGradient>
                          <radialGradient id="spinInnerHub" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="50%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#64748b" />
                          </radialGradient>
                        </defs>

                        {/* 12 Precise Slices */}
                        {WHEEL_SECTORS.map((sector, index) => {
                          const total = WHEEL_SECTORS.length;
                          const startAngle = (index * 360) / total;
                          const endAngle = ((index + 1) * 360) / total;
                          const midAngle = (startAngle + endAngle) / 2;

                          // Trigonometric slice coordinates (-90deg for 12 o'clock top origin)
                          const rad1 = ((startAngle - 90) * Math.PI) / 180;
                          const rad2 = ((endAngle - 90) * Math.PI) / 180;
                          const x1 = Math.cos(rad1) * 196;
                          const y1 = Math.sin(rad1) * 196;
                          const x2 = Math.cos(rad2) * 196;
                          const y2 = Math.sin(rad2) * 196;
                          const largeArc = 360 / total > 180 ? 1 : 0;
                          const d = `M 0 0 L ${x1} ${y1} A 196 196 0 ${largeArc} 1 ${x2} ${y2} Z`;
                          const isLanded = landedSector?.id === sector.id && gameState === "spun";

                          return (
                            <g key={sector.id}>
                              <path
                                d={d}
                                fill={sector.color}
                                stroke={isLanded ? "#fef08a" : "#ffffff"}
                                strokeWidth={isLanded ? "3.5" : "1.5"}
                                className={cn(isLanded && "filter drop-shadow-[0_0_12px_rgba(254,240,138,0.9)]")}
                              />

                              {/* Sector Content (Icon Badge + Points) */}
                              <g transform={`rotate(${midAngle})`}>
                                <g transform="translate(0, -150)">
                                  <circle r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" filter="url(#spinBadgeShadow)" />
                                  <text
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="18"
                                    className="select-none pointer-events-none"
                                  >
                                    {sector.icon}
                                  </text>
                                </g>

                                <g transform="translate(0, -116)">
                                  <text
                                    transform={midAngle > 90 && midAngle < 270 ? "rotate(90)" : "rotate(-90)"}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="font-black fill-white text-[11px] sm:text-[13px] uppercase tracking-wider select-none pointer-events-none"
                                    style={{
                                      textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 2px #000000",
                                    }}
                                  >
                                    {sector.points} PTS
                                  </text>
                                </g>
                              </g>
                            </g>
                          );
                        })}

                        {/* Physical 3D Brass Pegs (Studs) along slice boundaries */}
                        {WHEEL_SECTORS.map((_, index) => {
                          const total = WHEEL_SECTORS.length;
                          const startAngle = (index * 360) / total;
                          const rad = ((startAngle - 90) * Math.PI) / 180;
                          const px = Math.cos(rad) * 196;
                          const py = Math.sin(rad) * 196;
                          return (
                            <g key={`spin-peg-${index}`}>
                              <circle cx={px} cy={py} r="4.5" fill="url(#spinPegGradient)" stroke="#78350f" strokeWidth="1" filter="url(#spinBadgeShadow)" />
                              <circle cx={px - 1} cy={py - 1} r="1.5" fill="#fef08a" opacity="0.8" />
                            </g>
                          );
                        })}

                        {/* Center Realistic Metallic Hub */}
                        <circle cx="0" cy="0" r="42" fill="url(#spinOuterHub)" stroke="#fef08a" strokeWidth="2.5" filter="url(#spinBadgeShadow)" />
                        <circle cx="0" cy="0" r="30" fill="url(#spinInnerHub)" stroke="#ca8a04" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                        <text cx="0" cy="0" textAnchor="middle" dominantBaseline="central" fontSize="13" className="select-none pointer-events-none">
                          🎯
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Banner & Spin CTA */}
              <div className="flex flex-col items-center gap-3 mt-5 w-full max-w-sm">
                {landedSector && gameState === "spun" && (
                  <div
                    className="w-full p-3 rounded-2xl border-2 flex items-center justify-between shadow-lg animate-in zoom-in-95 duration-200"
                    style={{ backgroundColor: `${landedSector.color}20`, borderColor: landedSector.color }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{landedSector.icon}</span>
                      <div className="text-left">
                        <p className="font-bold text-xs uppercase opacity-80">Sector Locked:</p>
                        <p className="font-black text-sm uppercase" style={{ color: landedSector.color }}>
                          {landedSector.name} ({landedSector.points} Pts)
                        </p>
                      </div>
                    </div>
                    <Badge className="font-black text-xs" style={{ backgroundColor: landedSector.color }}>
                      {teams[currentTurn].name}&apos;s Turn
                    </Badge>
                  </div>
                )}

                <Button
                  onClick={handleSpin}
                  disabled={gameState !== "spinning"}
                  className="font-black shadow-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white uppercase tracking-wider h-13 sm:h-14 px-8 text-base sm:text-lg rounded-2xl w-full"
                >
                  {gameState === "spinning_animation" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Spinning Wheel...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" /> Spin Rainbow Wheel
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Team Leaderboard & Sector Grid (Desktop Right / Mobile Bottom) */}
            <div className="lg:col-span-6 flex flex-col gap-5 w-full">
              <div
                className={cn(
                  "grid gap-4 w-full",
                  teams.length === 2 ? "grid-cols-2" : teams.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
                )}
              >
                {teams.map((team, teamIndex) => (
                  <div key={teamIndex} className="flex flex-col items-center gap-3">
                    <div
                      className={cn(
                        "p-3 sm:p-4 rounded-2xl shadow-md border-2 bg-card w-full transition-all text-center",
                        currentTurn === teamIndex && gameState !== "spinning_animation"
                          ? "border-primary ring-4 ring-primary/20 scale-[1.02]"
                          : "border-border/40 opacity-80"
                      )}
                    >
                      <h3 className="font-black text-xs sm:text-sm truncate mb-1">{team.name}</h3>
                      <div className="bg-primary/10 text-primary font-black text-center py-1 px-2 rounded-xl text-lg sm:text-2xl font-mono">
                        {team.score}
                      </div>
                    </div>

                    {/* Sector Color Matrix */}
                    <div className="grid grid-cols-3 gap-1.5 w-full">
                      {WHEEL_SECTORS.map((sector) => {
                        const isUsed = usedQuestionKeys.includes(`${sector.color}-${teamIndex}`);
                        const isTarget = gameState === "spun" && landedSector?.color === sector.color && currentTurn === teamIndex;

                        return (
                          <Button
                            key={`${sector.color}-${teamIndex}`}
                            className={cn(
                              "aspect-square h-auto text-xs font-black border transition-all text-white rounded-xl p-1 relative",
                              isUsed && "bg-muted opacity-25 cursor-not-allowed",
                              isTarget && "animate-bounce ring-4 ring-amber-400 shadow-lg scale-105"
                            )}
                            style={!isUsed ? { backgroundColor: sector.color } : {}}
                            onClick={() => handleQuestionSelect(sector.color, teamIndex)}
                            disabled={gameState !== "spun" || landedSector?.color !== sector.color || isUsed || currentTurn !== teamIndex}
                            title={`${sector.name} (${sector.points} pts)`}
                          >
                            {isUsed ? (
                              <X className="h-3.5 w-3.5 text-foreground" />
                            ) : (
                              <span className="text-xs sm:text-sm">{sector.icon}</span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
          <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== "setup" && gameState !== "loading" && (
          <Button variant="destructive" onClick={resetGame} className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            Restart Sequence
          </Button>
        )}
      </CardFooter>

      {/* Challenge Question Dialog */}
      <Dialog
        open={!!activeQuestion}
        onOpenChange={(open) => {
          if (!open) {
            setActiveQuestion(null);
            setIsAnswerRevealed(false);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-3xl p-6 sm:p-8 border-2 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-wider text-primary text-base sm:text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              {landedSector ? `${landedSector.name} Sector Challenge (${landedSector.points} Pts)` : "Color Sector Challenge"}
            </DialogTitle>
            <DialogDescription className="font-bold text-foreground leading-relaxed py-4 text-base sm:text-xl">
              {activeQuestion?.question}
            </DialogDescription>
            {isAnswerRevealed && (
              <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 mt-2 animate-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Expected Answer:</p>
                <p className="font-black text-primary text-base sm:text-xl uppercase italic">{activeQuestion?.answer}</p>
              </div>
            )}
          </DialogHeader>
          <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAnswerRevealed(true)}
              className="font-bold uppercase h-11 sm:h-12 rounded-xl text-xs sm:text-sm"
            >
              Reveal Answer
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleScoring(false)}
              className="font-bold uppercase h-11 sm:h-12 rounded-xl text-xs sm:text-sm"
            >
              Incorrect (Steal)
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase h-11 sm:h-12 rounded-xl text-xs sm:text-sm shadow-md"
              onClick={() => handleScoring(true)}
            >
              Correct (+{landedSector?.points || 100})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finished Podium Modal */}
      <AnimatePresence>
        {gameState === "finished" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-card p-6 sm:p-8 rounded-3xl border-2 shadow-2xl text-center">
              <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-amber-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-4">
                {teams.every((t) => t.score === teams[0].score) ? "DRAW CHAMPIONSHIP!" : "TOURNAMENT VICTORY!"}
              </h2>
              <div className="space-y-2.5 mb-6">
                {[...teams]
                  .sort((a, b) => b.score - a.score)
                  .map((team, idx) => (
                    <div key={team.name} className="flex justify-between items-center bg-muted/40 p-3 sm:p-4 rounded-2xl border">
                      <span className="text-sm sm:text-base font-black uppercase flex items-center gap-2">
                        <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️"}</span>
                        <span>{team.name}</span>
                      </span>
                      <span className="text-lg sm:text-xl font-black text-primary font-mono">{team.score} pts</span>
                    </div>
                  ))}
              </div>
              <Button onClick={resetGame} className="w-full h-12 bg-primary text-primary-foreground text-base font-black rounded-xl uppercase">
                Play Again
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
