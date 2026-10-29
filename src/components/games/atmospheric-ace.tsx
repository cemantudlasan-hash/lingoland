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
import { generateAtmosphereChallenge } from "@/ai/flows/generate-atmosphere-challenge";
import type { GenerateAtmosphereChallengeOutput } from "@/ai/flows/schemas/atmosphere-schema";
import { 
  Loader2, 
  Sparkles, 
  Check, 
  X, 
  Repeat, 
  Maximize, 
  Minimize, 
  CloudRain, 
  Wind, 
  Radar, 
  Trophy, 
  ArrowLeft, 
  LogOut, 
  Compass, 
  ShieldCheck, 
  HelpCircle,
  Activity
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
import { ATMOSPHERE_DATA } from "@/lib/game-data";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions" | "selecting_difficulty" | "selecting_rounds" | "finished";

export function AtmosphericAce({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [challenge, setChallenge] = React.useState<GenerateAtmosphereChallengeOutput | null>(null);
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
      title: "Atmospheric Mission Aborted",
      description: "Returned to the Meteorological Command Deck.",
    });
  };

  const handleLoadNextQuestion = async (level: SkillLevel, rounds: number, roundNum: number, currentUsedAnswers: string[]) => {
    setGameState("loading");
    setChallenge(null);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const questions = ATMOSPHERE_DATA[level] || [];
      const available = questions.filter(q => !currentUsedAnswers.includes(q.targetName));

      if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        const selectedQuestion = available[randomIndex];

        setChallenge({
          description: selectedQuestion.description,
          targetName: selectedQuestion.targetName,
          options: shuffleArray([...selectedQuestion.options]),
          explanation: selectedQuestion.explanation
        });
        setUsedAnswers(prev => [...prev, selectedQuestion.targetName]);
        setGameState("playing");
      } else {
        const result = await generateAtmosphereChallenge({
          difficulty: level,
        });
        setChallenge({
          ...result,
          options: shuffleArray([...result.options])
        });
        setUsedAnswers(prev => [...prev, result.targetName]);
        setGameState("playing");
      }
    } catch (error) {
      console.error("Failed to load question:", error);
      toast({
        variant: "destructive",
        title: "Radar Interference",
        description: "Could not load the next sector telemetry. Please try again.",
      });
      setGameState("selecting_difficulty");
    }
  };

  const handleCheckAnswer = () => {
    if (!challenge || !selectedOption) return;
    const correct = selectedOption === challenge.targetName;
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
    if (option === challenge?.targetName) {
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
            {/* Meteorological Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/60 border border-sky-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  <Radar className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-sky-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-sky-300/60">Doppler Radar</p>
                  <p className="text-sm sm:text-base font-black text-white">ONLINE 100%</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-blue-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Wind className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-blue-300/60">Troposphere Core</p>
                  <p className="text-sm sm:text-base font-black text-white">CALIBRATED</p>
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
                  <p className="text-[10px] sm:text-xs font-mono uppercase text-amber-300/60">Sector Targets</p>
                  <p className="text-sm sm:text-base font-black text-amber-300">{roundsChoice} TELEMETRIES</p>
                </div>
              </div>
            </div>

            {/* Main Interactive Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-gradient-to-b from-sky-950/20 via-zinc-900/40 to-black/60 border border-sky-500/30 rounded-3xl p-5 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(14,165,233,0.1)]">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono">
                    <CloudRain className="h-3.5 w-3.5 text-sky-400" />
                    <span>METEOROLOGICAL TELEMETRY // SECTOR ANALYSIS</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                    Atmospheric Ace <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
                      Weather & Climate Radar
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-sky-100/70 leading-relaxed max-w-xl">
                    Decode atmospheric phenomena, weather patterns, and planetary climate layers. Analyze Doppler sensor clues to identify critical weather systems.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-sky-300/80 flex items-center justify-between">
                      <span>Research Complexity Tier</span>
                      <span className="text-sky-400 font-bold">{difficulty.toUpperCase()}</span>
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
                              ? "bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                              : "bg-zinc-900/50 border-white/10 text-white/60 hover:border-sky-500/30 hover:text-white"
                          )}
                        >
                          <div className="capitalize">{level}</div>
                          <div className="text-[10px] font-mono text-sky-400/60 font-normal">
                            {level === "beginner" ? "Core Weather" : level === "intermediate" ? "Atmosphere Layers" : "Climate Science"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-sky-300/80">Diagnostic Protocol Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 20, 30].map((rounds) => (
                        <button
                          key={rounds}
                          type="button"
                          onClick={() => setRoundsChoice(rounds)}
                          className={cn(
                            "py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold font-mono transition-all",
                            roundsChoice === rounds
                              ? "bg-sky-500/30 border-sky-400 text-white shadow-[0_0_10px_rgba(14,165,233,0.3)]"
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
                    className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-black bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-sky-300/30 uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Radar className="h-5 w-5 text-white animate-spin" />
                    <span>Engage Atmospheric Radar</span>
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

              {/* Climate Intel Deck */}
              <div className="lg:col-span-5 bg-zinc-900/50 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-sky-300">
                    <HelpCircle className="h-5 w-5 text-sky-400" />
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                      Radar Protocol Guidelines
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-sky-100/80 font-normal">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">01</span>
                      <div>
                        <p className="font-bold text-white">Analyze Atmospheric Clues</p>
                        <p className="text-[12px] text-sky-200/60">Examine temperature, pressure, cloud types, and elevation indications.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">02</span>
                      <div>
                        <p className="font-bold text-white">Select Weather Target</p>
                        <p className="text-[12px] text-sky-200/60">Lock in the correct atmospheric phenomenon or layer to clear sector telemetry.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="h-6 w-6 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">03</span>
                      <div>
                        <p className="font-bold text-white">Abort Capability</p>
                        <p className="text-[12px] text-sky-200/60">Disengage safely anytime with the prominent header Abort Game button.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setGameState('instructions')} 
                  variant="outline" 
                  className="w-full border-sky-500/30 text-sky-200 hover:bg-sky-950/40 rounded-xl font-bold text-xs"
                >
                  View Full Meteorological Brief
                </Button>
              </div>
            </div>
          </div>
        );

      case 'instructions':
        return (
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl max-w-2xl w-full mx-auto text-center space-y-6">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-3">
              <Compass className="text-sky-400" /> Atmospheric Ace Protocol
            </h3>
            <div className="text-left space-y-3 font-normal text-sky-100/90 text-sm sm:text-base">
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">1. Read the meteorological telemetry and sensor readings.</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">2. Identify the matching weather system, cloud type, or atmospheric layer.</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">3. Complete all radar sectors to achieve Legendary Meteorologist status.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setGameState('idle')} 
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black h-12 rounded-xl"
              >
                Return to Radar Deck
              </Button>
              <Button 
                onClick={() => handleSelectRounds(roundsChoice)} 
                variant="outline"
                className="flex-1 border-white/20 text-white font-bold h-12 rounded-xl"
              >
                Start Radar Directly
              </Button>
            </div>
          </div>
        );

      case 'selecting_difficulty':
        return (
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md mx-auto bg-zinc-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-sky-300 font-mono uppercase tracking-widest text-xs sm:text-sm">Choose Research Complexity</p>
            <div className="grid grid-cols-1 gap-3 w-full">
              {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((level) => (
                <Button 
                  key={level} 
                  onClick={() => handleStartGame(level)} 
                  variant="outline" 
                  className="h-14 text-base sm:text-lg font-black uppercase tracking-wider border-2 hover:border-sky-400 rounded-xl transition-all"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'selecting_rounds':
        return (
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md mx-auto bg-zinc-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-sky-300 font-mono uppercase tracking-widest text-xs sm:text-sm">Select Sector Scans Duration</p>
            <div className="grid grid-cols-1 gap-3 w-full">
              {[10, 20, 30].map((rounds) => (
                <Button 
                  key={rounds} 
                  onClick={() => handleSelectRounds(rounds)} 
                  variant="outline" 
                  className="h-14 text-base sm:text-lg font-black uppercase tracking-wider border-2 hover:border-cyan-400 rounded-xl transition-all"
                >
                  {rounds} Telemetries
                </Button>
              ))}
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="animate-spin text-sky-400 h-12 w-12" />
            <p className="text-sky-200 animate-pulse text-sm sm:text-base font-mono">Calibrating Doppler atmospheric radar...</p>
          </div>
        );

      case 'playing':
      case 'answered':
        if (!challenge) return null;
        return (
          <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
            {/* Live Progress HUD */}
            <div className="flex justify-between items-center w-full text-xs sm:text-sm font-mono font-bold bg-zinc-900/60 border border-sky-500/20 px-4 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-sky-300">TELEMETRY: {currentRound + 1} / {roundsChoice}</span>
              <span className="text-emerald-400">SCORE: {score}</span>
            </div>

            {/* Prompt Container */}
            <div className="p-6 sm:p-10 rounded-3xl bg-zinc-900/80 backdrop-blur-md border-2 border-sky-500/30 text-center shadow-xl w-full space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono text-xs uppercase tracking-widest">
                <Radar className="h-3.5 w-3.5 text-sky-400 animate-spin" />
                IDENTIFY ATMOSPHERIC TARGET
              </span>
              <p className="font-bold italic text-white leading-relaxed text-base sm:text-2xl md:text-3xl">
                &ldquo;{challenge.description}&rdquo;
              </p>
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              {challenge.options.map((option, index) => (
                <Button
                  key={index}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-auto whitespace-normal justify-start text-left transition-all duration-200 shadow-md break-words py-4 px-5 text-sm sm:text-base md:text-lg font-bold rounded-2xl border-2",
                    gameState === 'answered' && option === challenge.targetName && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400"
                  )}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === challenge.targetName && <Check className="mr-3 h-5 w-5 text-white shrink-0" />}
                  {gameState === 'answered' && option !== challenge.targetName && selectedOption === option && <X className="mr-3 h-5 w-5 text-white shrink-0" />}
                  <span className="break-words flex-1 min-w-0">{option}</span>
                </Button>
              ))}
            </div>

            {/* Explanation Alert */}
            {gameState === 'answered' && (
              <Alert className={cn(
                "border-2 rounded-2xl shadow-xl p-4 sm:p-6",
                isCorrect ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-100" : "bg-rose-950/80 border-rose-500/50 text-rose-100"
              )}>
                <Wind className="text-sky-400 h-5 w-5 shrink-0" />
                <AlertTitle className="font-black uppercase text-base sm:text-lg mb-1">
                  {isCorrect ? "RADAR TELEMETRY CONFIRMED!" : "METEOROLOGICAL MISREAD!"}
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                  {challenge.explanation}
                </AlertDescription>
              </Alert>
            )}

            {/* In-Game Action Bar */}
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
                    className="h-10 px-6 font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow-lg"
                  >
                    Confirm Telemetry
                  </Button>
                )}
                {gameState === 'answered' && (
                  <Button 
                    onClick={handleNextStep} 
                    className="h-10 px-6 font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow-lg"
                  >
                    {currentRound + 1 >= roundsChoice ? "Complete Mission" : "Next Telemetry →"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 'finished':
        const accuracy = Math.round((score / roundsChoice) * 100);
        let title = "RADAR CALIBRATION FAILED";
        let evaluation = "Weather telemetry inconclusive. Review atmospheric patterns and scan again.";
        if (accuracy === 100) {
          title = "LEGENDARY METEOROLOGIST";
          evaluation = "Perfect atmospheric foresight! You have mastered planetary weather science.";
        } else if (accuracy >= 80) {
          title = "EXPERT CLIMATOLOGIST";
          evaluation = "Superb radar decoding accuracy! Your climate insight is exceptional.";
        } else if (accuracy >= 50) {
          title = "STATION APPRENTICE";
          evaluation = "Respectable observations, but further sector scans are recommended.";
        }

        return (
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md mx-auto text-center py-6 animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-full bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl">
              <Trophy className="h-10 w-10 text-yellow-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black tracking-widest text-white uppercase text-2xl sm:text-3xl">{title}</h3>
              <p className="text-sky-200/60 font-medium text-xs sm:text-sm">{evaluation}</p>
            </div>

            <div className="w-full bg-zinc-900/60 rounded-3xl p-5 border border-white/10 shadow-inner text-center space-y-3">
              <div>
                <p className="text-sky-300/60 text-xs font-mono uppercase tracking-widest">Radar Accuracy</p>
                <p className="font-black text-white text-4xl sm:text-5xl">{accuracy}%</p>
              </div>
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
              </div>
              <div className="flex justify-between text-xs font-mono text-sky-300/70 pt-1">
                <span>Scans: {roundsChoice}</span>
                <span>Correct: {score}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={() => setGameState('idle')} 
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black h-12 rounded-xl shadow-lg"
              >
                Restart Radar
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
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] transition-all duration-500 flex flex-col justify-between bg-zinc-950/95 backdrop-blur-2xl border border-sky-500/20 shadow-2xl overflow-y-auto overflow-x-hidden text-white",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-black" : "rounded-2xl md:rounded-3xl"
    )}>
      {/* Header with Back to Games & In-Game Abort */}
      <CardHeader className="z-20 bg-zinc-950/80 backdrop-blur-md border-b border-sky-500/20 px-3 sm:px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-bold bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 border-sky-500/30 hover:border-sky-400 rounded-xl"
            >
              <Link href="/games" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Games</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <CloudRain className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-300">
                  {game.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-[11px] font-medium text-sky-300/70">
                  <span>Doppler Radar & Climate Layer Station</span>
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
              className="h-8 w-8 sm:h-9 sm:w-9 text-sky-300/70 hover:text-white rounded-xl"
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

      <CardFooter className="z-20 bg-zinc-950/80 backdrop-blur-md border-t border-sky-500/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-sky-300/60 shrink-0">
        <div className="flex items-center gap-2">
          <Wind className="h-3.5 w-3.5 text-sky-400" />
          <span>ATMOSPHERIC ACE // CLIMATE RADAR TELEMETRY</span>
        </div>
        <Link href="/games" className="hover:text-sky-200 transition-colors">
          ← Exit to Games Hub
        </Link>
      </CardFooter>
    </Card>
  );
}
