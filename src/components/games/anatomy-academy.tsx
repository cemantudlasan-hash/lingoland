
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
import { generateAnatomyChallenge } from "@/ai/flows/generate-anatomy-challenge";
import type { GenerateAnatomyChallengeOutput } from "@/ai/flows/schemas/anatomy-schema";
import { Loader2, Sparkles, Check, X, Repeat, Maximize, Minimize, HeartPulse, Trophy } from "lucide-react";
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
                <div className="flex flex-col items-center gap-3 sm:gap-4 max-w-md w-full">
                    <p className={cn("text-muted-foreground text-xs sm:text-base", isFullscreen && "sm:text-2xl")}>Scan biological signals to identify human organs.</p>
                    <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-11 sm:h-14 px-6 sm:px-12 text-sm sm:text-lg rounded-xl sm:rounded-2xl", isFullscreen && "sm:h-16 sm:px-16 sm:text-2xl")}>
                    <Sparkles className={cn("mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5")} />
                    Initialize Lab
                    </Button>
                </div>
              );
          case 'instructions':
              return (
                <div className={cn(
                    "flex flex-col items-center justify-center gap-3 sm:gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full",
                    isFullscreen ? "p-4 sm:p-12 max-w-4xl" : "p-4 sm:p-8 max-w-lg"
                )}>
                    <h3 className={cn("font-black uppercase tracking-widest text-center mb-2 sm:mb-4 text-primary", isFullscreen ? "text-xl sm:text-3xl" : "text-lg sm:text-xl")}>Anatomy Protocol</h3>
                    <div className={cn("text-left space-y-2.5 sm:space-y-4 font-bold text-foreground text-xs sm:text-base", isFullscreen && "sm:text-xl")}>
                        <p>1. Analyze the biological function description provided by the lab computer.</p>
                        <p>2. Identify the matching human organ or body system.</p>
                        <p>3. Correct identification clears the terminal for the next scan.</p>
                    </div>
                    <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-4 sm:mt-8 w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-11 sm:h-14 px-6 sm:px-12 text-sm sm:text-lg rounded-xl sm:rounded-2xl shadow-xl", isFullscreen && "sm:h-16 sm:px-16 sm:text-2xl")}>Select Research Level</Button>
                </div>
              );
          case 'selecting_difficulty':
              return (
                <div className="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-md">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest text-xs sm:text-sm", isFullscreen && "sm:text-xl")}>Choose Research Complexity</p>
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-4 w-full">
                        {["beginner", "intermediate", "advanced"].map((level) => (
                            <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-12 sm:h-16 text-base sm:text-xl font-black uppercase tracking-widest border-2 sm:border-4 transition-all hover:scale-105 rounded-xl sm:rounded-2xl", isFullscreen && "sm:h-20 sm:text-2xl")}>
                                {level}
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'selecting_rounds':
              return (
                <div className="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-md">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest text-xs sm:text-sm", isFullscreen && "sm:text-xl")}>Select Game Duration</p>
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-4 w-full">
                        {[10, 20, 30].map((rounds) => (
                            <Button key={rounds} onClick={() => handleSelectRounds(rounds)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-12 sm:h-16 text-base sm:text-xl font-black uppercase tracking-widest border-2 sm:border-4 transition-all hover:scale-105 rounded-xl sm:rounded-2xl", isFullscreen && "sm:h-20 sm:text-2xl")}>
                                {rounds} Scans
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'loading':
              return (
                <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
                    <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-14 w-14 sm:h-24 sm:w-24" : "h-10 w-10 sm:h-12 sm:w-12")} />
                    <p className={cn("text-muted-foreground animate-pulse text-xs sm:text-base", isFullscreen && "sm:text-2xl")}>Calibrating molecular sensors...</p>
                </div>
              );
          case 'playing':
          case 'answered':
              if (!challenge) return null;
              return (
                <div className="space-y-4 sm:space-y-8 w-full max-w-5xl animate-in fade-in duration-500">
                    <div className="flex justify-between items-center w-full text-xs sm:text-sm font-bold text-muted-foreground uppercase mb-1 sm:mb-2">
                        <span>Scan: {currentRound + 1} / {roundsChoice}</span>
                        <span>Score: {score}</span>
                    </div>

                    <div className={cn(
                        "p-4 sm:p-10 rounded-2xl sm:rounded-[3rem] bg-muted/20 backdrop-blur-sm border-2 sm:border-4 border-primary/20 text-center shadow-xl w-full",
                        isFullscreen ? "p-4 sm:p-14 min-h-0 sm:min-h-[220px]" : "p-4 sm:p-8"
                    )}>
                        <p className={cn("font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary mb-2 sm:mb-3 text-[10px] sm:text-xs", isFullscreen && "sm:text-lg")}>IDENTIFY TARGET:</p>
                        <p className={cn("font-bold italic text-white leading-relaxed break-words text-sm sm:text-2xl md:text-3xl")}>"{challenge.description}"</p>
                    </div>

                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mt-4 sm:mt-8 w-full", isFullscreen && "sm:gap-6")}>
                    {challenge.options.map((option, index) => (
                        <Button
                        key={index}
                        variant={getButtonVariant(option)}
                        className={cn(
                            "h-auto whitespace-normal justify-start text-left transition-all duration-300 shadow-lg break-words py-3 px-4 sm:py-5 sm:px-6 text-sm sm:text-lg md:text-xl font-bold rounded-xl sm:rounded-2xl border-2 sm:border-4",
                            isFullscreen && "sm:py-6 sm:px-8 sm:text-2xl",
                            { "bg-green-500 hover:bg-green-600 text-white border-green-400": gameState === 'answered' && option === challenge.answer }
                        )}
                        onClick={() => gameState === 'playing' && setSelectedOption(option)}
                        disabled={gameState === 'answered'}
                        >
                        {gameState === 'answered' && option === challenge.answer && <Check className={cn("mr-2 sm:mr-4 h-4 w-4 sm:h-6 sm:w-6 shrink-0")} />}
                        {gameState === 'answered' && option !== challenge.answer && selectedOption === option && <X className={cn("mr-2 sm:mr-4 h-4 w-4 sm:h-6 sm:w-6 shrink-0")} />}
                        <span className="break-words flex-1 min-w-0">{option}</span>
                        </Button>
                    ))}
                    </div>

                    {gameState === 'answered' && (
                        <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                            "border-2 sm:border-4 rounded-xl sm:rounded-[2rem] shadow-2xl text-left p-3 sm:p-6 mt-4 sm:mt-8",
                            isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                        )}>
                            <HeartPulse className={cn("text-primary h-5 w-5 sm:h-6 sm:w-6 shrink-0")} />
                            <AlertTitle className={cn("font-black tracking-tight uppercase text-sm sm:text-xl mb-1 sm:mb-2")}>
                                {isCorrect ? "SCAN SUCCESS!" : "DIAGNOSTIC ERROR!"}
                            </AlertTitle>
                            <AlertDescription className={cn("text-xs sm:text-base leading-relaxed break-words")}>
                            {challenge.explanation}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
              );
          case 'finished':
              const accuracy = Math.round((score / roundsChoice) * 100);
              let title = "RECONSTRUCTION FAILED";
              let evaluation = "Needs improvement. Review the anatomy files and try again.";
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
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md animate-in zoom-in-95 duration-500">
                    <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-indigo-500/10 border-2 sm:border-4 border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                        <Trophy className={cn(isFullscreen ? "h-8 w-8 sm:h-14 sm:w-14" : "h-8 w-8 sm:h-10 sm:w-10")} />
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                        <h3 className={cn("font-black tracking-widest text-primary uppercase text-xl sm:text-3xl", isFullscreen && "sm:text-4xl")}>{title}</h3>
                        <p className={cn("text-muted-foreground font-medium text-xs sm:text-base")}>{evaluation}</p>
                    </div>

                    <div className="w-full bg-muted/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-border/20 shadow-inner text-center space-y-3 sm:space-y-4">
                        <div>
                            <p className="text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-widest">Accuracy</p>
                            <p className={cn("font-black text-white text-3xl sm:text-5xl")}>{accuracy}%</p>
                        </div>
                        <div className="w-full bg-zinc-800 h-2.5 sm:h-3 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] sm:text-xs font-bold text-muted-foreground uppercase pt-1">
                            <span>Scans: {roundsChoice}</span>
                            <span>Correct: {score}</span>
                        </div>
                    </div>

                    <Button 
                        onClick={() => setGameState('selecting_difficulty')} 
                        size={isFullscreen ? "lg" : "default"} 
                        className={cn("w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-11 sm:h-14 text-sm sm:text-xl rounded-xl sm:rounded-2xl")}
                    >
                        Restart Scan Protocol
                    </Button>
                </div>
              );
          default:
              return null;
      }
  }

  return (
    <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] transition-all duration-500 flex flex-col justify-between bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-y-auto overflow-x-hidden max-w-full",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-start sm:justify-between p-2 sm:p-6" 
            : "rounded-2xl md:rounded-3xl"
      )}>
      <CardHeader className="text-center relative p-3 sm:p-6 pb-2 sm:pb-4 pr-12 sm:pr-16 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-1.5 sm:p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-2 sm:mb-4">
                <Icon className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-xl sm:text-4xl md:text-5xl text-white" : "text-xl sm:text-2xl md:text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen ? "text-xs sm:text-lg mt-1 sm:mt-2 text-white/80" : "mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-300 font-medium")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-1 sm:pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xs sm:text-base px-3 sm:px-6 py-0.5 sm:py-1")}>{(difficulty || game.level).toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-4 sm:space-y-6 text-center flex-1 flex flex-col items-center justify-start sm:justify-center w-full max-w-full overflow-y-auto overflow-x-hidden p-3 sm:p-6",
          isFullscreen ? "min-h-0 max-w-7xl mx-auto w-full px-2 sm:px-12" : "min-h-[calc(100dvh-16rem)]"
      )}>
        {renderContent()}
      </CardContent>
      <CardFooter className={cn("flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-4 pt-4 sm:pt-8 p-3 sm:p-6 w-full max-w-full shrink-0", isFullscreen && "max-w-7xl mx-auto w-full pb-4 sm:pb-12")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn("w-full sm:w-auto h-10 sm:h-12 text-xs sm:text-base font-bold rounded-xl", isFullscreen && "sm:h-14 sm:px-8 sm:text-lg sm:rounded-2xl")}>
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} size={isFullscreen ? "lg" : "default"} className={cn("w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-10 sm:h-12 text-xs sm:text-base rounded-xl", isFullscreen && "sm:h-14 sm:px-10 sm:text-xl sm:rounded-2xl")}>Confirm Identification</Button>}
            {gameState === 'answered' && (
              <Button 
                onClick={handleNextStep} 
                size={isFullscreen ? "lg" : "default"} 
                className={cn("w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-10 sm:h-12 text-xs sm:text-base rounded-xl", isFullscreen && "sm:h-14 sm:px-10 sm:text-xl sm:rounded-2xl")}
              >
                {currentRound + 1 >= roundsChoice ? "Finish Mission" : "Next Scan"}
              </Button>
            )}
            {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty' && gameState !== 'selecting_rounds' && (
                <Button variant="secondary" onClick={() => setGameState('selecting_difficulty')} size={isFullscreen ? "lg" : "default"} className={cn("w-full sm:w-auto h-10 sm:h-12 text-xs sm:text-base font-bold rounded-xl", isFullscreen && "sm:h-14 sm:px-8 sm:text-lg sm:rounded-2xl")}>Change Tier</Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
