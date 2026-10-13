
"use client";

import { shuffleArray } from "@/lib/shuffle";

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
import { generateProbabilityChallenge } from "@/ai/flows/generate-probability-challenge";
import type { GenerateProbabilityChallengeOutput } from "@/ai/flows/schemas/probability-schema";
import { Loader2, Sparkles, Check, X, Repeat, Maximize, Minimize, Plane, Info, Target, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { PROBABILITY_DATA } from "@/lib/game-data";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions" | "selecting_difficulty" | "selecting_rounds" | "finished";

export function ProbabilityPilot({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [challenge, setChallenge] = React.useState<GenerateProbabilityChallengeOutput | null>(null);
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

  const handleLoadNextQuestion = async (level: SkillLevel, rounds: number, roundNum: number, currentUsedAnswers: string[]) => {
    setGameState("loading");
    setChallenge(null);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const questions = PROBABILITY_DATA[level] || [];
      const available = questions.filter(q => !currentUsedAnswers.includes(q.answer));

      if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        const selectedQuestion = available[randomIndex];

        setChallenge({
          scenario: "Flight parameters loaded. Determine the probability of the path anomaly.",
          question: selectedQuestion.scenario,
          answer: selectedQuestion.answer,
          options: shuffleArray([...selectedQuestion.options]),
          explanation: selectedQuestion.explanation
        });
        setUsedAnswers(prev => [...prev, selectedQuestion.answer]);
        setGameState("playing");
      } else {
        const result = await generateProbabilityChallenge({
          difficulty: level,
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
        title: "Flight Computer Error...",
        description: "Could not load the next trajectory assessment. Please try again.",
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
                <div className="flex flex-col items-center gap-4 w-full max-w-md text-center py-6">
                    <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base")}>Calculate odds and probabilities to navigate your mission path.</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                      <Button onClick={() => setGameState('selecting_difficulty')} size={isFullscreen ? "lg" : "default"} className={cn("bg-emerald-600 hover:bg-emerald-500 text-white font-black h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl shadow-lg", isFullscreen && "h-16 px-10 text-xl")}>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Initialize Flight
                      </Button>
                      <Button variant="outline" onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl font-bold border-2 border-emerald-500/30", isFullscreen && "h-16 px-10 text-xl")}>
                        Flight Handbook
                      </Button>
                    </div>
                </div>
              );
          case 'instructions':
              return (
                <div className={cn(
                    "flex flex-col items-center justify-center gap-4 text-center bg-emerald-900/20 rounded-2xl mx-auto border-2 border-emerald-500/20 shadow-inner w-full max-w-lg p-5 sm:p-8",
                    isFullscreen && "p-10 max-w-2xl"
                )}>
                    <h3 className={cn("font-black uppercase tracking-wider text-emerald-400", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>Pilot's Handbook</h3>
                    <div className={cn("text-left space-y-3 font-medium text-emerald-100", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
                        <p>1. Analyze the situational scenario presented on the flight deck.</p>
                        <p>2. Calculate the exact probability requested by the mission controller.</p>
                        <p>3. Submit your data to ensure a safe landing.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                      <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="flex-1 bg-emerald-600 text-white font-black h-12 rounded-xl">Select Mission Path</Button>
                      <Button variant="outline" onClick={() => setGameState('idle')} size="lg" className="h-12 rounded-xl">Back</Button>
                    </div>
                </div>
              );
          case 'selecting_difficulty':
              return (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md py-4">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-wider text-xs sm:text-sm", isFullscreen && "text-base")}>Mission Difficulty Tier</p>
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {["beginner", "intermediate", "advanced"].map((level) => (
                            <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-14 sm:h-16 text-lg sm:text-xl font-black uppercase border-2 transition-all hover:scale-[1.02] hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-2xl", isFullscreen && "h-20 text-2xl")}>
                                {level}
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'selecting_rounds':
              return (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md py-4">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-wider text-xs sm:text-sm", isFullscreen && "text-base")}>Select Flight Segments</p>
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {[10, 20, 30].map((rounds) => (
                            <Button key={rounds} onClick={() => handleSelectRounds(rounds)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-14 sm:h-16 text-lg sm:text-xl font-black uppercase border-2 transition-all hover:scale-[1.02] hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-2xl", isFullscreen && "h-20 text-2xl")}>
                                {rounds} Legs
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'loading':
              return (
                <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
                    <div className="relative">
                        <Plane className={cn("text-emerald-500 animate-bounce", isFullscreen ? "h-20 w-20" : "h-12 w-12 sm:h-16 sm:w-16")} />
                    </div>
                    <p className={cn("text-muted-foreground font-black animate-pulse uppercase tracking-wider text-sm sm:text-base", isFullscreen && "text-xl")}>Calculating Trajectory...</p>
                </div>
              );
          case 'playing':
          case 'answered':
              if (!challenge) return null;
              return (
                <div className="space-y-4 sm:space-y-6 w-full max-w-4xl animate-in fade-in duration-500">
                    <div className="flex justify-between items-center w-full text-xs sm:text-sm font-bold text-muted-foreground uppercase px-1">
                        <span>Leg: {currentRound + 1} / {roundsChoice}</span>
                        <span>Score: {score}</span>
                    </div>

                    <div className={cn(
                        "p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-emerald-500/5 border-2 border-emerald-500/20 text-left shadow-inner",
                        isFullscreen && "p-8 sm:p-12"
                    )}>
                        <Badge className="bg-emerald-600 mb-3 text-xs uppercase">Mission Briefing</Badge>
                        <p className={cn("font-medium text-foreground leading-relaxed mb-4 text-xs sm:text-sm md:text-base", isFullscreen && "text-lg")}>{challenge.scenario}</p>
                        <div className="border-t border-emerald-500/10 pt-4">
                            <p className="font-black text-emerald-400 uppercase tracking-wider mb-1 text-xs sm:text-sm">Challenge Objective:</p>
                            <p className={cn("font-black leading-snug text-foreground text-base sm:text-xl md:text-2xl", isFullscreen && "text-3xl")}>{challenge.question}</p>
                        </div>
                    </div>

                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4", isFullscreen && "gap-6")}>
                    {challenge.options.map((option, index) => (
                        <Button
                        key={index}
                        variant={getButtonVariant(option)}
                        className={cn(
                            "h-auto min-h-[50px] sm:min-h-[64px] py-3 px-4 sm:px-6 text-center transition-all duration-300 shadow-sm rounded-xl text-sm sm:text-base font-bold border-2 whitespace-normal break-words",
                            { "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400 scale-[1.02]": gameState === 'answered' && option === challenge.answer }
                        )}
                        onClick={() => gameState === 'playing' && setSelectedOption(option)}
                        disabled={gameState === 'answered'}
                        >
                        {option}
                        </Button>
                    ))}
                    </div>

                    {gameState === 'answered' && (
                        <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                            "border-2 rounded-2xl shadow-lg text-left p-4 sm:p-6",
                            isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                        )}>
                            <Info className="text-emerald-400 h-5 w-5" />
                            <AlertTitle className="font-black tracking-tight uppercase text-sm sm:text-base mb-1">
                                {isCorrect ? "PATH SECURED!" : "NAVIGATIONAL ERROR!"}
                            </AlertTitle>
                            <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                            {challenge.explanation}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
              );
          case 'finished':
              const accuracy = Math.round((score / roundsChoice) * 100);
              let title = "MISSION CRASHED";
              let evaluation = "Flight mechanics compromised. Study probability laws and start a new flight.";
              if (accuracy === 100) {
                title = "LEGENDARY ACE";
                evaluation = "Flawless piloting! You bypassed all navigational hazards perfectly.";
              } else if (accuracy >= 80) {
                title = "SENIOR PILOT";
                evaluation = "Superb flight stats! Your navigational logic is highly reliable.";
              } else if (accuracy >= 50) {
                title = "FLIGHT CADET";
                evaluation = "Decent navigation path, but keep practicing secondary calculations.";
              }

              return (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md animate-in zoom-in-95 duration-500 py-6 text-center">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                        <Trophy className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black tracking-wider text-emerald-400 uppercase text-xl sm:text-2xl">{title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">{evaluation}</p>
                    </div>

                    <div className="w-full bg-emerald-950/20 rounded-2xl p-4 sm:p-6 border border-emerald-500/10 shadow-inner text-center space-y-3">
                        <div>
                            <p className="text-muted-foreground text-xs font-black uppercase tracking-wider">Accuracy</p>
                            <p className="font-black text-emerald-400 text-3xl sm:text-4xl">{accuracy}%</p>
                        </div>
                        <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase pt-1">
                            <span>Legs: {roundsChoice}</span>
                            <span>Correct: {score}</span>
                        </div>
                    </div>

                    <Button 
                        onClick={() => setGameState('selecting_difficulty')} 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-lg h-12 sm:h-14 rounded-xl"
                    >
                        Restart Flight Control
                    </Button>
                </div>
              );
          default:
              return null;
      }
  }

  return (
    <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}>
      <CardHeader className="text-center relative shrink-0 p-4 sm:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-2 sm:mb-4">
                <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-500" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase text-xl sm:text-3xl md:text-4xl", isFullscreen && "text-3xl sm:text-5xl")}>{game.title}</CardTitle>
        <CardDescription className={cn("text-xs sm:text-sm max-w-xl mx-auto", isFullscreen && "text-base sm:text-xl mt-1")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn("text-xs sm:text-sm px-3 py-0.5 border-emerald-500 text-emerald-600", isFullscreen && "text-base px-4 py-1")}>{(difficulty || game.level).toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
        {renderContent()}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold border-emerald-500/30 text-emerald-600">
          <Link href="/games">Exit Game</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 w-full sm:w-auto">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md h-11 sm:h-12 px-8 rounded-xl">Verify Path</Button>}
            {gameState === 'answered' && (
              <Button 
                onClick={handleNextStep} 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md h-11 sm:h-12 px-8 rounded-xl"
              >
                {currentRound + 1 >= roundsChoice ? "Finish Mission" : "Next Leg"}
              </Button>
            )}
            {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty' && gameState !== 'selecting_rounds' && (
                <Button variant="secondary" onClick={() => setGameState('selecting_difficulty')} className="w-full sm:w-auto bg-emerald-100 text-emerald-700 hover:bg-emerald-200 h-11 sm:h-12 px-6 rounded-xl font-bold">New Route</Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
