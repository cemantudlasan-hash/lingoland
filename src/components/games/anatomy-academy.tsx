"use client";

import { shuffleArray } from "@/lib/shuffle";
import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { generateAnatomyChallenge } from "@/ai/flows/generate-anatomy-challenge";
import type { GenerateAnatomyChallengeOutput } from "@/ai/flows/schemas/anatomy-schema";
import { 
  Loader2, 
  Sparkles, 
  Check, 
  X, 
  Repeat, 
  Maximize, 
  Minimize, 
  HeartPulse, 
  Trophy, 
  ArrowLeft, 
  LogOut, 
  Activity, 
  ShieldCheck, 
  Stethoscope,
  HelpCircle,
  Dna,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { ANATOMY_DATA } from "@/lib/game-data";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions" | "selecting_difficulty" | "selecting_rounds" | "finished";

export function AnatomyAcademy({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [challenge, setChallenge] = React.useState<GenerateAnatomyChallengeOutput | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [usedAnswers, setUsedAnswers] = React.useState<string[]>([]);
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("intermediate");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [roundsChoice, setRoundsChoice] = React.useState<number>(10);
  const [currentRound, setCurrentRound] = React.useState<number>(0);
  const [score, setScore] = React.useState<number>(0);
  
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("selecting_rounds");
  };

  const handleSelectRounds = (rounds: number) => {
    setRoundsChoice(rounds);
    setCurrentRound(0);
    setScore(0);
    const emptyAnswers: string[] = [];
    setUsedAnswers(emptyAnswers);
    handleLoadNextQuestion(difficulty, rounds, 0, emptyAnswers);
  };

  const handleAbortGame = () => {
    setGameState("idle");
    setChallenge(null);
    setSelectedOption(null);
    setIsCorrect(null);
    setCurrentRound(0);
    toast({
      title: "Lab Mission Aborted",
      description: "Returned to the Anatomy Academy Diagnostics Deck.",
    });
  };

  const handleLoadNextQuestion = async (level: SkillLevel, rounds: number, roundNum: number, currentUsedAnswers: string[]) => {
    setGameState("loading");
    setChallenge(null);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const questions = ANATOMY_DATA[level] || [];
      const available = questions.filter(q => !currentUsedAnswers.includes(q.answer));

      if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        const selectedQuestion = available[randomIndex];

        setChallenge({
          description: selectedQuestion.description,
          answer: selectedQuestion.answer,
          options: shuffleArray([...selectedQuestion.options]),
          explanation: selectedQuestion.explanation
        });
        setUsedAnswers(prev => [...prev, selectedQuestion.answer]);
        setGameState("playing");
      } else {
        const result = await generateAnatomyChallenge({
          difficulty: level,
          usedAnswers: currentUsedAnswers,
        });
        setChallenge({
          ...result,
          options: shuffleArray([...result.options])
        });
        setUsedAnswers(prev => [...prev, result.answer]);
        setGameState("playing");
      }
    } catch (error) {
      console.error("Failed to load question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the next scan. Please try again.",
      });
      setGameState("selecting_difficulty");
    }
  };

  const handleCheckAnswer = () => {
    if (!challenge || !selectedOption) return;
    const correct = selectedOption === challenge.answer;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
    setGameState("answered");

    if (firestore && game) {
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: { slug: game.slug, title: game.title, correct }
      });
    }
  };

  const handleNextStep = () => {
    const nextRound = currentRound + 1;
    if (nextRound >= roundsChoice) {
      setGameState("finished");
    } else {
      setCurrentRound(nextRound);
      handleLoadNextQuestion(difficulty, roundsChoice, nextRound, usedAnswers);
    }
  };

  const getButtonVariant = (option: string) => {
    if (gameState !== "answered") {
      return selectedOption === option ? "default" : "outline";
    }
    if (option === challenge?.answer) {
      return "secondary";
    }
    if (option === selectedOption) {
      return "destructive";
    }
    return "outline";
  };
  
  const Icon = game.icon;

  const renderContent = () => {
    switch(gameState) {
      case 'idle':
        return (
          <div className="w-full space-y-6 py-2">
            {/* Status Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/60 border border-purple-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse text-rose-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-purple-300/60">Bio-Sensors</p>
                  <p className="text-sm sm:text-base font-black text-white">ACTIVE 100%</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-indigo-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Dna className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-indigo-300/60">Anatomy Database</p>
                  <p className="text-sm sm:text-base font-black text-white">40+ SYSTEMS</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-emerald-300/60">Research Tier</p>
                  <p className="text-sm sm:text-base font-black text-emerald-300 uppercase">{difficulty}</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-amber-300/60">Protocol Duration</p>
                  <p className="text-sm sm:text-base font-black text-amber-300">{roundsChoice} SCANS</p>
                </div>
              </div>
            </div>

            {/* Main Interactive Lab Setup Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-gradient-to-b from-purple-950/20 via-zinc-900/40 to-black/60 border border-purple-500/30 rounded-3xl p-5 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
                    <Stethoscope className="h-3.5 w-3.5 text-purple-400" />
                    <span>BIOLOGICAL SCAN TERMINAL // LEVEL 4 LAB</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                    Anatomy Academy <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                      Diagnostic Laboratory
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-purple-100/70 leading-relaxed max-w-xl">
                    Analyze biological signals and physiological function telemetry. Decrypt complex clinical descriptions to accurately diagnose organs and body systems.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-purple-300/80 flex items-center justify-between">
                      <span>Research Complexity Tier</span>
                      <span className="text-purple-400 font-bold">{difficulty.toUpperCase()}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all",
                            difficulty === level
                              ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                              : "bg-zinc-900/50 border-white/10 text-white/60 hover:border-purple-500/30 hover:text-white"
                          )}
                        >
                          <div className="capitalize">{level}</div>
                          <div className="text-[10px] font-mono text-purple-400/60 font-normal">
                            {level === "beginner" ? "Core Organs" : level === "intermediate" ? "Complex Systems" : "Specialized Histology"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-purple-300/80">Diagnostic Protocol Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 20, 30].map((rounds) => (
                        <button
                          key={rounds}
                          type="button"
                          onClick={() => setRoundsChoice(rounds)}
                          className={cn(
                            "py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold font-mono transition-all",
                            roundsChoice === rounds
                              ? "bg-indigo-500/30 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                              : "bg-zinc-900/40 border-white/10 text-white/50 hover:text-white"
                          )}
                        >
                          {rounds} Scans
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleSelectRounds(roundsChoice)} 
                    className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-black bg-gradient-to-r from-purple-500 via-pink-600 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-purple-300/30 uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span>Initialize Lab Scanner</span>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="h-14 sm:h-16 px-6 text-sm sm:text-base font-bold border-white/15 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Link href="/games">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Games</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Tactical Medical Protocol Intel */}
              <div className="lg:col-span-5 bg-zinc-900/50 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-purple-300">
                    <HelpCircle className="h-5 w-5 text-purple-400" />
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                      Lab Protocol & Guidelines
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-purple-100/80 font-normal">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">01</span>
                      <div>
                        <p className="font-bold text-white">Analyze Organ Function</p>
                        <p className="text-[12px] text-purple-200/60">Study the physiological clues and clinical telemetry provided by the scanner.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">02</span>
                      <div>
                        <p className="font-bold text-white">Confirm Identification</p>
                        <p className="text-[12px] text-purple-200/60">Pick the organ from the options and lock in your diagnosis.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">03</span>
                      <div>
                        <p className="font-bold text-white">Safety Abort Protocol</p>
                        <p className="text-[12px] text-purple-200/60">Exit or abort the scan session at any time with the header Abort button.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setGameState('instructions')} 
                  variant="outline" 
                  className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-950/40 rounded-xl font-bold text-xs"
                >
                  View Full Anatomical Briefing
                </Button>
              </div>
            </div>
          </div>
        );

      case 'instructions':
        return (
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl max-w-2xl w-full text-center space-y-6">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-3">
              <Sparkles className="text-purple-400" /> Anatomy Lab Protocol
            </h3>
            <div className="text-left space-y-3 sm:space-y-4 font-normal text-purple-100/90 text-sm sm:text-base">
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">1. Analyze the biological function description provided by the lab computer.</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">2. Identify the matching human organ or body system.</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">3. Correct identification clears the terminal for the next scan.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setGameState('idle')} 
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 rounded-xl"
              >
                Return to Lab Deck
              </Button>
              <Button 
                onClick={() => handleSelectRounds(roundsChoice)} 
                variant="outline"
                className="flex-1 border-white/20 text-white font-bold h-12 rounded-xl"
              >
                Start Scans Directly
              </Button>
            </div>
          </div>
        );

      case 'selecting_difficulty':
        return (
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md bg-zinc-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-purple-300 font-mono uppercase tracking-widest text-xs sm:text-sm">Choose Research Complexity</p>
            <div className="grid grid-cols-1 gap-3 w-full">
              {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((level) => (
                <Button 
                  key={level} 
                  onClick={() => handleStartGame(level)} 
                  variant="outline" 
                  className="h-14 text-base sm:text-lg font-black uppercase tracking-wider border-2 hover:border-purple-400 rounded-xl transition-all"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'selecting_rounds':
        return (
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md bg-zinc-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-purple-300 font-mono uppercase tracking-widest text-xs sm:text-sm">Select Scan Session Duration</p>
            <div className="grid grid-cols-1 gap-3 w-full">
              {[10, 20, 30].map((rounds) => (
                <Button 
                  key={rounds} 
                  onClick={() => handleSelectRounds(rounds)} 
                  variant="outline" 
                  className="h-14 text-base sm:text-lg font-black uppercase tracking-wider border-2 hover:border-indigo-400 rounded-xl transition-all"
                >
                  {rounds} Scans
                </Button>
              ))}
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
            <Loader2 className="animate-spin text-purple-400 h-12 w-12 sm:h-16 sm:w-16" />
            <p className="text-purple-200 animate-pulse text-sm sm:text-base font-mono">Calibrating molecular sensors...</p>
          </div>
        );

      case 'playing':
      case 'answered':
        if (!challenge) return null;
        return (
          <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
            {/* Live Progress HUD */}
            <div className="flex justify-between items-center w-full text-xs sm:text-sm font-mono font-bold bg-zinc-900/60 border border-purple-500/20 px-4 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-purple-300">SCAN: {currentRound + 1} / {roundsChoice}</span>
              <span className="text-emerald-400">SCORE: {score}</span>
            </div>

            {/* Target Diagnostic Prompt */}
            <div className="p-6 sm:p-10 rounded-3xl bg-zinc-900/80 backdrop-blur-md border-2 border-purple-500/30 text-center shadow-xl w-full space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs uppercase tracking-widest">
                <HeartPulse className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                IDENTIFY TARGET ORGAN
              </span>
              <p className="font-bold italic text-white leading-relaxed text-base sm:text-2xl md:text-3xl">
                &ldquo;{challenge.description}&rdquo;
              </p>
            </div>

            {/* 4 Organ Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              {challenge.options.map((option, index) => (
                <Button
                  key={index}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-auto whitespace-normal justify-start text-left transition-all duration-200 shadow-md break-words py-4 px-5 text-sm sm:text-base md:text-lg font-bold rounded-2xl border-2",
                    gameState === 'answered' && option === challenge.answer && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400"
                  )}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === challenge.answer && <Check className="mr-3 h-5 w-5 text-white shrink-0" />}
                  {gameState === 'answered' && option !== challenge.answer && selectedOption === option && <X className="mr-3 h-5 w-5 text-white shrink-0" />}
                  <span className="break-words flex-1 min-w-0">{option}</span>
                </Button>
              ))}
            </div>

            {/* Answer Explanation */}
            {gameState === 'answered' && (
              <Alert className={cn(
                "border-2 rounded-2xl shadow-xl text-left p-4 sm:p-6",
                isCorrect ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-100" : "bg-rose-950/80 border-rose-500/50 text-rose-100"
              )}>
                <HeartPulse className="text-purple-400 h-5 w-5 shrink-0" />
                <AlertTitle className="font-black uppercase text-base sm:text-lg mb-1">
                  {isCorrect ? "SCAN SUCCESS!" : "DIAGNOSTIC ERROR!"}
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                  {challenge.explanation}
                </AlertDescription>
              </Alert>
            )}

            {/* In-Game Abort & Confirm Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAbortGame}
                className="h-10 px-4 text-xs sm:text-sm font-bold bg-red-950/30 hover:bg-red-900/50 text-red-300 border-red-500/40 rounded-xl flex items-center gap-2"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Abort Game</span>
              </Button>

              <div className="flex gap-2 ml-auto">
                {gameState === 'playing' && (
                  <Button 
                    onClick={handleCheckAnswer} 
                    disabled={!selectedOption} 
                    className="h-10 px-6 font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg"
                  >
                    Confirm Identification
                  </Button>
                )}
                {gameState === 'answered' && (
                  <Button 
                    onClick={handleNextStep} 
                    className="h-10 px-6 font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg"
                  >
                    {currentRound + 1 >= roundsChoice ? "Finish Mission" : "Next Scan →"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 'finished':
        const accuracy = Math.round((score / roundsChoice) * 100);
        let title = "RECONSTRUCTION FAILED";
        let evaluation = "Needs improvement. Review anatomical systems and scan again.";
        if (accuracy === 100) {
          title = "LEGENDARY SURGEON";
          evaluation = "Flawless diagnostics! Your anatomical expertise is absolute.";
        } else if (accuracy >= 80) {
          title = "EXPERT SCIENTIST";
          evaluation = "Superb scanning accuracy! You've mastered human biology basics.";
        } else if (accuracy >= 50) {
          title = "LAB TECHNICIAN";
          evaluation = "Decent results, but there's room to improve. Keep researching!";
        }

        return (
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md mx-auto text-center py-6 animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl">
              <Trophy className="h-10 w-10 text-yellow-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black tracking-widest text-white uppercase text-2xl sm:text-3xl">{title}</h3>
              <p className="text-purple-200/60 font-medium text-xs sm:text-sm">{evaluation}</p>
            </div>

            <div className="w-full bg-zinc-900/60 rounded-3xl p-5 border border-white/10 shadow-inner text-center space-y-3">
              <div>
                <p className="text-purple-300/60 text-xs font-mono uppercase tracking-widest">Diagnostic Accuracy</p>
                <p className="font-black text-white text-4xl sm:text-5xl">{accuracy}%</p>
              </div>
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
              </div>
              <div className="flex justify-between text-xs font-mono text-purple-300/70 pt-1">
                <span>Scans: {roundsChoice}</span>
                <span>Correct: {score}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={() => setGameState('idle')} 
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 rounded-xl shadow-lg"
              >
                Restart Protocol
              </Button>
              <Button 
                variant="outline" 
                asChild 
                className="flex-1 border-white/20 text-white font-bold h-12 rounded-xl"
              >
                <Link href="/games">Back to Games</Link>
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] transition-all duration-500 flex flex-col justify-between bg-zinc-950/95 backdrop-blur-2xl border border-purple-500/20 shadow-2xl overflow-y-auto overflow-x-hidden text-white",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-black" : "rounded-2xl md:rounded-3xl"
    )}>
      {/* Header with Back to Games & In-Game Abort */}
      <CardHeader className="z-20 bg-zinc-950/80 backdrop-blur-md border-b border-purple-500/20 px-3 sm:px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-bold bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 border-purple-500/30 hover:border-purple-400 rounded-xl"
            >
              <Link href="/games" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Games</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">
                  {game.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-[11px] font-medium text-purple-300/70">
                  <span>Human Biology & Physiology Scanner</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {(gameState === 'playing' || gameState === 'answered') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAbortGame}
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40 rounded-xl flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                <span>Abort Game</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 text-purple-300/70 hover:text-white rounded-xl"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Main Content: items-stretch & justify-start to ensure smooth mobile scrolling */}
      <CardContent className="flex-1 flex flex-col items-stretch justify-start p-3 sm:p-6 lg:p-8 z-10 relative overflow-y-auto w-full max-w-6xl mx-auto space-y-6 pb-16">
        {renderContent()}
      </CardContent>

      <CardFooter className="z-20 bg-zinc-950/80 backdrop-blur-md border-t border-purple-500/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-purple-300/60 shrink-0">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-3.5 w-3.5 text-purple-400" />
          <span>ANATOMY ACADEMY // BIO-SCAN TELEMETRY</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/games" className="hover:text-purple-200 transition-colors">
            ← Exit to Games Hub
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
