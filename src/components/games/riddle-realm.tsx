
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
import { generateRiddle } from "@/ai/flows/generate-riddle";
import type { GenerateRiddleOutput } from "@/ai/flows/schemas/riddle-schema";
import { Loader2, Sparkles, Check, X, Repeat, Maximize, Minimize, Ghost, Moon, Wand2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { RIDDLE_DATA } from "@/lib/game-data";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions" | "selecting_difficulty" | "selecting_rounds" | "finished";

export function RiddleRealm({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [challenge, setChallenge] = React.useState<GenerateRiddleOutput | null>(null);
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
      const questions = RIDDLE_DATA[level] || [];
      const available = questions.filter(q => !currentUsedAnswers.includes(q.answer));

      if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        const selectedQuestion = available[randomIndex];

        setChallenge({
          riddle: selectedQuestion.riddle,
          answer: selectedQuestion.answer,
          options: shuffleArray([...selectedQuestion.options]),
          explanation: selectedQuestion.explanation
        });
        setUsedAnswers(prev => [...prev, selectedQuestion.answer]);
        setGameState("playing");
      } else {
        const result = await generateRiddle({
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
        title: "The Oracle is silent...",
        description: "Could not load the next riddle. Please try again.",
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
                    <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base")}>Consult the AI Oracle to solve mystical linguistic puzzles.</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                      <Button onClick={() => setGameState('selecting_difficulty')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl shadow-lg", isFullscreen && "h-16 px-10 text-xl")}>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Summon Oracle
                      </Button>
                      <Button variant="outline" onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl font-bold border-2 border-amber-500/30", isFullscreen && "h-16 px-10 text-xl")}>
                        Oracle's Protocol
                      </Button>
                    </div>
                </div>
              );
          case 'instructions':
              return (
                <div className={cn(
                    "flex flex-col items-center justify-center gap-4 text-center bg-purple-900/20 backdrop-blur-md rounded-2xl mx-auto border-2 border-amber-500/30 shadow-xl w-full max-w-lg p-5 sm:p-8 animate-in zoom-in duration-300",
                    isFullscreen && "p-10 max-w-2xl"
                )}>
                    <h3 className={cn("font-black uppercase tracking-wider text-amber-400", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>Oracle's Protocol</h3>
                    <div className={cn("text-left space-y-3 font-medium text-foreground", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
                        <p>1. The Oracle will speak in metaphors and riddles.</p>
                        <p>2. Analyze the descriptors to unveil the secret word.</p>
                        <p>3. Choose the correct vessel for the Oracle's answer.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                      <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="flex-1 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black h-12 rounded-xl">Step Forward</Button>
                      <Button variant="outline" onClick={() => setGameState('idle')} size="lg" className="h-12 rounded-xl">Back</Button>
                    </div>
                </div>
              );
          case 'selecting_difficulty':
              return (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md py-4">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-wider text-xs sm:text-sm", isFullscreen && "text-base")}>Choose Your Path</p>
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {["beginner", "intermediate", "advanced"].map((level) => (
                            <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-14 sm:h-16 text-lg sm:text-xl font-black uppercase border-2 transition-all hover:scale-[1.02] hover:bg-amber-500/10 hover:border-amber-500/50 rounded-2xl", isFullscreen && "h-20 text-2xl")}>
                                {level}
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'selecting_rounds':
              return (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md animate-in zoom-in-95 duration-300 py-4">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-wider text-xs sm:text-sm", isFullscreen && "text-base")}>Select Game Duration</p>
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {[10, 20, 30].map((rounds) => (
                            <Button key={rounds} onClick={() => handleSelectRounds(rounds)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-14 sm:h-16 text-lg sm:text-xl font-black uppercase border-2 transition-all hover:scale-[1.02] hover:bg-amber-500/10 hover:border-amber-500/50 rounded-2xl", isFullscreen && "h-20 text-2xl")}>
                                {rounds} Riddles
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'loading':
              return (
                <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
                    <Loader2 className={cn("animate-spin text-amber-500", isFullscreen ? "h-16 w-16" : "h-10 w-10 sm:h-12 sm:w-12")} />
                    <p className={cn("text-muted-foreground animate-pulse font-black uppercase tracking-wider text-sm sm:text-base", isFullscreen && "text-xl")}>Whispering to the winds...</p>
                </div>
              );
          case 'playing':
          case 'answered':
              if (!challenge) return null;
              return (
                <div className="space-y-4 sm:space-y-6 w-full max-w-4xl animate-in fade-in duration-700">
                    <div className="flex justify-between items-center w-full text-xs sm:text-sm font-bold text-muted-foreground uppercase px-1">
                        <span>Riddle: {currentRound + 1} / {roundsChoice}</span>
                        <span>Score: {score}</span>
                    </div>

                    <div className={cn(
                        "p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-900/20 to-amber-900/20 backdrop-blur-md border-2 border-amber-500/30 text-center shadow-lg",
                        isFullscreen && "p-8 sm:p-12"
                    )}>
                        <p className="font-black uppercase tracking-wider text-amber-400 mb-2 sm:mb-4 text-xs sm:text-sm">THE RIDDLE:</p>
                        <p className={cn("font-bold italic text-foreground leading-snug text-base sm:text-2xl md:text-3xl", isFullscreen && "text-3xl sm:text-4xl")}>"{challenge.riddle}"</p>
                    </div>

                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mt-4", isFullscreen && "gap-6")}>
                    {challenge.options.map((option, index) => (
                        <Button
                        key={index}
                        variant={getButtonVariant(option)}
                        className={cn(
                            "h-auto min-h-[50px] sm:min-h-[64px] whitespace-normal justify-start text-left transition-all duration-300 shadow-sm border-2 py-3 px-4 sm:px-6 rounded-xl text-xs sm:text-sm md:text-base font-bold",
                            { "bg-green-600 hover:bg-green-700 text-white border-green-400 scale-[1.02] shadow-green-500/20": gameState === 'answered' && option === challenge.answer }
                        )}
                        onClick={() => gameState === 'playing' && setSelectedOption(option)}
                        disabled={gameState === 'answered'}
                        >
                        {gameState === 'answered' && option === challenge.answer && <Wand2 className="mr-2 sm:mr-3 h-4 w-4 shrink-0" />}
                        {gameState === 'answered' && option !== challenge.answer && selectedOption === option && <Ghost className="mr-2 sm:mr-3 h-4 w-4 shrink-0" />}
                        <span>{option}</span>
                        </Button>
                    ))}
                    </div>

                    {gameState === 'answered' && (
                        <Alert variant={isCorrect ? "default" : "destructive"} className="border-2 rounded-2xl shadow-lg text-left p-4 sm:p-6">
                            <Moon className="text-amber-400 h-5 w-5" />
                            <AlertTitle className="font-black tracking-tight uppercase text-sm sm:text-base mb-1">
                                {isCorrect ? "TRUE VISION!" : "CLOUDED MIND!"}
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
              let title = "REALM OF THE FORGOTTEN";
              let evaluation = "The Oracle has cast you out. Meditate on the riddles and return.";
              if (accuracy === 100) {
                title = "LEGENDARY MYSTIC";
                evaluation = "Flawless riddle solving! You have achieved absolute enlightenment.";
              } else if (accuracy >= 80) {
                title = "HIGH ARCHMAGE";
                evaluation = "Superb intellect! The mysteries of the realm are clear to you.";
              } else if (accuracy >= 50) {
                title = "APPRENTICE SCRIBE";
                evaluation = "A reasonable attempt, but some secrets remain hidden from you.";
              }

              return (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md animate-in zoom-in-95 duration-500 py-6 text-center">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                        <Trophy className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black tracking-wider text-amber-400 uppercase text-xl sm:text-2xl">{title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">{evaluation}</p>
                    </div>

                    <div className="w-full bg-purple-950/20 rounded-2xl p-4 sm:p-6 border border-amber-500/20 shadow-inner text-center space-y-3">
                        <div>
                            <p className="text-muted-foreground text-xs font-black uppercase tracking-wider">Accuracy</p>
                            <p className="font-black text-amber-400 text-3xl sm:text-4xl">{accuracy}%</p>
                        </div>
                        <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase pt-1">
                            <span>Riddles: {roundsChoice}</span>
                            <span>Correct: {score}</span>
                        </div>
                    </div>

                    <Button 
                        onClick={() => setGameState('selecting_difficulty')} 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black shadow-lg h-12 sm:h-14 rounded-xl"
                    >
                        Restart Oracle Protocol
                    </Button>
                </div>
              );
          default:
              return null;
      }
  }

  return (
    <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-amber-500/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}>
      <CardHeader className="text-center relative shrink-0 p-4 sm:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-amber-500 z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-2 sm:mb-4">
                <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase italic text-xl sm:text-3xl md:text-4xl", isFullscreen && "text-3xl sm:text-5xl")}>{game.title}</CardTitle>
        <CardDescription className={cn("text-xs sm:text-sm max-w-xl mx-auto text-amber-500/80 font-bold", isFullscreen && "text-base sm:text-xl mt-1")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn("text-xs sm:text-sm px-3 py-0.5 border-amber-500 text-amber-500", isFullscreen && "text-base px-4 py-1")}>{(difficulty || game.level).toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto relative">
        {renderContent()}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="ghost" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold text-amber-500/70 hover:text-amber-500">
          <Link href="/games">Leave Realm</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 w-full sm:w-auto">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-black shadow-md h-11 sm:h-12 px-8 rounded-xl">Unveil Answer</Button>}
            {gameState === 'answered' && (
              <Button 
                onClick={handleNextStep} 
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md h-11 sm:h-12 px-8 rounded-xl"
              >
                {currentRound + 1 >= roundsChoice ? "Leave Oracle" : "Next Vision"}
              </Button>
            )}
            {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty' && gameState !== 'selecting_rounds' && (
                <Button variant="ghost" onClick={() => setGameState('selecting_difficulty')} className="w-full sm:w-auto text-purple-400 hover:text-purple-300 h-11 sm:h-12 px-6 rounded-xl font-bold">Change Tier</Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
