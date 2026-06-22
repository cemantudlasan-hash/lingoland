
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
import { generateAtmosphereChallenge } from "@/ai/flows/generate-atmosphere-challenge";
import type { GenerateAtmosphereChallengeOutput } from "@/ai/flows/schemas/atmosphere-schema";
import { Loader2, Sparkles, Check, X, Repeat, Maximize, Minimize, CloudRain, Wind, Radar, Trophy } from "lucide-react";
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
        title: "Radar Interference...",
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
                <div className="flex flex-col items-center gap-6">
                    <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Identify Earth's layers and weather phenomena using satellite intel.</p>
                    <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-sky-600 hover:bg-sky-500 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Launch Satellites
                    </Button>
                </div>
              );
          case 'instructions':
              return (
                <div className={cn(
                    "flex flex-col items-center justify-center gap-4 text-center bg-sky-900/20 rounded-3xl mx-auto border-2 border-sky-500/20 shadow-inner",
                    isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
                )}>
                    <h3 className={cn("font-black uppercase tracking-widest text-sky-400 mb-4", isFullscreen ? "text-4xl" : "text-xl")}>Mission Brief</h3>
                    <div className={cn("text-left space-y-4 font-bold text-sky-50", isFullscreen ? "text-2xl" : "text-base")}>
                        <p>1. Analyze the atmospheric sensor data provided.</p>
                        <p>2. Match the description to the correct layer or phenomenon.</p>
                        <p>3. Clear the sector by providing accurate telemetry.</p>
                    </div>
                    <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-sky-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Select Altitude</Button>
                </div>
              );
          case 'selecting_difficulty':
              return (
                <div className="flex flex-col items-center gap-8 w-full max-w-md">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Target Mission Complexity</p>
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {["beginner", "intermediate", "advanced"].map((level) => (
                            <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-20 text-2xl font-black uppercase border-4 transition-all hover:scale-105 hover:bg-sky-500/10 hover:border-sky-500/50", isFullscreen && "h-24 rounded-3xl")}>
                                {level}
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'selecting_rounds':
              return (
                <div className="flex flex-col items-center gap-8 w-full max-w-md">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Select Sector Telemetry Rounds</p>
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {[10, 20, 30].map((rounds) => (
                            <Button key={rounds} onClick={() => handleSelectRounds(rounds)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-20 text-2xl font-black uppercase border-4 transition-all hover:scale-105 hover:bg-sky-500/10 hover:border-sky-500/50", isFullscreen && "h-24 rounded-3xl")}>
                                {rounds} Sectors
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'loading':
              return (
                <div className="flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <Radar className={cn("text-sky-500 animate-pulse", isFullscreen ? "h-32 w-32" : "h-16 w-16")} />
                        <div className="absolute inset-0 border-4 border-sky-500 rounded-full animate-ping opacity-20" />
                    </div>
                    <p className={cn("text-muted-foreground font-black animate-pulse uppercase tracking-[0.2em]", isFullscreen ? "text-3xl" : "text-lg")}>Syncing satellite arrays...</p>
                </div>
              );
          case 'playing':
          case 'answered':
              if (!challenge) return null;
              return (
                <div className="space-y-8 w-full max-w-5xl animate-in fade-in duration-500">
                    <div className="flex justify-between items-center w-full text-sm font-bold text-muted-foreground uppercase mb-2">
                        <span>Sector: {currentRound + 1} / {roundsChoice}</span>
                        <span>Score: {score}</span>
                    </div>

                    <div className={cn(
                        "p-12 rounded-[2.5rem] bg-sky-500/5 border-4 border-sky-500/20 text-center shadow-inner",
                        isFullscreen ? "p-16 min-h-[350px]" : "p-8"
                    )}>
                        <p className={cn("font-black uppercase tracking-[0.3em] text-sky-400 mb-4", isFullscreen ? "text-2xl" : "text-xs")}>SENSOR TELEMETRY:</p>
                        <p className={cn("font-bold italic text-foreground leading-relaxed", isFullscreen ? "text-[4.5vw]" : "text-2xl")}>"{challenge.description}"</p>
                    </div>

                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8", isFullscreen && "gap-8")}>
                    {challenge.options.map((option, index) => (
                        <Button
                        key={index}
                        variant={getButtonVariant(option)}
                        className={cn(
                            "h-auto whitespace-normal justify-start text-left transition-all duration-300 shadow-lg",
                            isFullscreen ? "py-10 px-12 text-4xl font-bold rounded-[2rem] border-4" : "py-4 px-6 font-bold border-2 rounded-xl",
                            { "bg-sky-600 hover:bg-sky-700 text-white border-sky-400 scale-105": gameState === 'answered' && option === challenge.targetName }
                        )}
                        onClick={() => gameState === 'playing' && setSelectedOption(option)}
                        disabled={gameState === 'answered'}
                        >
                        {gameState === 'answered' && option === challenge.targetName && <Check className={cn("mr-4", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                        {gameState === 'answered' && option !== challenge.targetName && selectedOption === option && <X className={cn("mr-4", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                        {option}
                        </Button>
                    ))}
                    </div>

                    {gameState === 'answered' && (
                        <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                            "border-4 rounded-[2rem] shadow-2xl text-left",
                            isFullscreen ? "p-12 mt-12" : "mt-8",
                            isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                        )}>
                            <Wind className={cn("text-sky-400", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />
                            <AlertTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>
                                {isCorrect ? "TELEMETRY VERIFIED!" : "SIGNAL ERROR!"}
                            </AlertTitle>
                            <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                            {challenge.explanation}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
              );
          case 'finished':
              const accuracy = Math.round((score / roundsChoice) * 100);
              let title = "ORBITAL DECAY";
              let evaluation = "Telemetry lost in the clouds. Re-analyze atmospheric profiles.";
              if (accuracy === 100) {
                title = "METEOROLOGIST SUPREME";
                evaluation = "Flawless telemetry! You possess perfect knowledge of Earth's atmosphere.";
              } else if (accuracy >= 80) {
                title = "CHIEF METEOROLOGIST";
                evaluation = "Excellent accuracy! You easily bypassed radar clutter and interference.";
              } else if (accuracy >= 50) {
                title = "SATELLITE TECH";
                evaluation = "Decent signal alignment, but watch out for atmospheric disturbances.";
              }

              return (
                <div className="flex flex-col items-center gap-6 w-full max-w-md animate-in zoom-in-95 duration-500">
                    <div className="h-24 w-24 rounded-full bg-sky-500/10 border-4 border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
                        <Trophy className={cn(isFullscreen ? "h-16 w-16" : "h-10 w-10")} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className={cn("font-black tracking-widest text-sky-400 uppercase", isFullscreen ? "text-5xl" : "text-2xl")}>{title}</h3>
                        <p className={cn("text-muted-foreground font-medium", isFullscreen ? "text-2xl" : "text-base")}>{evaluation}</p>
                    </div>

                    <div className="w-full bg-sky-950/20 rounded-3xl p-6 border border-sky-500/10 shadow-inner text-center space-y-4">
                        <div>
                            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">Accuracy</p>
                            <p className={cn("font-black text-sky-400", isFullscreen ? "text-6xl" : "text-4xl")}>{accuracy}%</p>
                        </div>
                        <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase pt-2">
                            <span>Sectors: {roundsChoice}</span>
                            <span>Correct: {score}</span>
                        </div>
                    </div>

                    <Button 
                        onClick={() => setGameState('selecting_difficulty')} 
                        size={isFullscreen ? "lg" : "default"} 
                        className={cn("w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 text-2xl rounded-2xl")}
                    >
                        Restart Satellite Stream
                    </Button>
                </div>
              );
          default:
              return null;
      }
  }

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      <CardHeader className="text-center relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-sky-600 z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-4">
                <Icon className="w-16 h-16 text-sky-500" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl text-white" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen ? "text-2xl mt-2 text-white/80" : "mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn("border-sky-500 text-sky-600", isFullscreen && "text-xl px-6 py-1")}>{(difficulty || game.level).toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-7xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {renderContent()}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8 border-t border-sky-100", isFullscreen && "max-w-7xl mx-auto w-full pb-16 bg-transparent border-none")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn("border-sky-200 text-sky-600", isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Abort Mission</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} size={isFullscreen ? "lg" : "default"} className={cn("bg-sky-600 hover:bg-sky-700 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>Confirm Signal</Button>}
            {gameState === 'answered' && (
              <Button 
                onClick={handleNextStep} 
                size={isFullscreen ? "lg" : "default"} 
                className={cn("bg-sky-600 hover:bg-sky-700 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}
              >
                {currentRound + 1 >= roundsChoice ? "Finish Mission" : "Next Sector"}
              </Button>
            )}
            {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty' && gameState !== 'selecting_rounds' && (
                <Button variant="secondary" onClick={() => setGameState('selecting_difficulty')} size={isFullscreen ? "lg" : "default"} className={cn("bg-sky-100 text-sky-700 hover:bg-sky-200", isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Re-Deploy</Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
