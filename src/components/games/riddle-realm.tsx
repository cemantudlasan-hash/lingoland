
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
                <div className="flex flex-col items-center gap-6">
                    <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Consult the AI Oracle to solve mystical linguistic puzzles.</p>
                    <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black shadow-xl scale-110", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Summon the Oracle
                    </Button>
                </div>
              );
          case 'instructions':
              return (
                <div className={cn(
                    "flex flex-col items-center justify-center gap-4 text-center bg-purple-900/20 backdrop-blur-md rounded-[2.5rem] mx-auto border-4 border-amber-500/20 shadow-2xl animate-in zoom-in duration-300",
                    isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
                )}>
                    <h3 className={cn("font-black uppercase tracking-[0.3em] text-amber-400 mb-4", isFullscreen ? "text-4xl" : "text-xl")}>Oracle's Protocol</h3>
                    <div className={cn("text-left space-y-4 font-bold italic text-foreground", isFullscreen ? "text-2xl" : "text-base")}>
                        <p>1. The Oracle will speak in metaphors and riddles.</p>
                        <p>2. Analyze the descriptors to unveil the secret word.</p>
                        <p>3. Choose the correct vessel for the Oracle's answer.</p>
                    </div>
                    <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Step Forward</Button>
                </div>
              );
          case 'selecting_difficulty':
              return (
                <div className="flex flex-col items-center gap-8 w-full max-w-md">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-[0.2em]", isFullscreen ? "text-3xl" : "text-sm")}>Choose Your Path</p>
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {["beginner", "intermediate", "advanced"].map((level) => (
                            <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-20 text-2xl font-black uppercase tracking-widest border-4 transition-all hover:scale-105 hover:bg-amber-500/10 hover:border-amber-500/50", isFullscreen && "h-24 rounded-3xl")}>
                                {level}
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'selecting_rounds':
              return (
                <div className="flex flex-col items-center gap-8 w-full max-w-md animate-in zoom-in-95 duration-300">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-[0.2em]", isFullscreen ? "text-3xl" : "text-sm")}>Select Game Duration</p>
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {[10, 20, 30].map((rounds) => (
                            <Button key={rounds} onClick={() => handleSelectRounds(rounds)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("h-20 text-2xl font-black uppercase tracking-widest border-4 transition-all hover:scale-105 hover:bg-amber-500/10 hover:border-amber-500/50", isFullscreen && "h-24 rounded-3xl")}>
                                {rounds} Riddles
                            </Button>
                        ))}
                    </div>
                </div>
              );
          case 'loading':
              return (
                <div className="flex flex-col items-center justify-center gap-6">
                    <Loader2 className={cn("animate-spin text-amber-500", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                    <p className={cn("text-muted-foreground animate-pulse font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-lg")}>Whispering to the winds...</p>
                </div>
              );
          case 'playing':
          case 'answered':
              if (!challenge) return null;
              return (
                <div className="space-y-8 w-full max-w-5xl animate-in fade-in duration-700">
                    <div className="flex justify-between items-center w-full text-sm font-bold text-muted-foreground uppercase mb-2">
                        <span>Riddle: {currentRound + 1} / {roundsChoice}</span>
                        <span>Score: {score}</span>
                    </div>

                    <div className={cn(
                        "p-12 rounded-[4rem] bg-gradient-to-br from-purple-900/20 to-amber-900/20 backdrop-blur-md border-4 border-amber-500/20 text-center shadow-[0_0_50px_rgba(245,158,11,0.1)]",
                        isFullscreen ? "p-16 min-h-[300px]" : "p-8"
                    )}>
                        <p className={cn("font-black uppercase tracking-[0.5em] text-amber-400 mb-6", isFullscreen ? "text-2xl" : "text-xs")}>THE RIDDLE:</p>
                        <p className={cn("font-black italic text-white leading-tight", isFullscreen ? "text-[4.5vw]" : "text-3xl md:text-4xl")}>"{challenge.riddle}"</p>
                    </div>

                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10", isFullscreen && "gap-8")}>
                    {challenge.options.map((option, index) => (
                        <Button
                        key={index}
                        variant={getButtonVariant(option)}
                        className={cn(
                            "h-auto whitespace-normal justify-start text-left transition-all duration-300 shadow-xl border-4",
                            isFullscreen ? "py-10 px-12 text-4xl font-black rounded-[2rem]" : "py-6 px-8 font-bold rounded-2xl",
                            { "bg-green-600 hover:bg-green-700 text-white border-green-400 scale-105 shadow-green-500/20": gameState === 'answered' && option === challenge.answer }
                        )}
                        onClick={() => gameState === 'playing' && setSelectedOption(option)}
                        disabled={gameState === 'answered'}
                        >
                        {gameState === 'answered' && option === challenge.answer && <Wand2 className={cn("mr-4", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                        {gameState === 'answered' && option !== challenge.answer && selectedOption === option && <Ghost className={cn("mr-4", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                        {option}
                        </Button>
                    ))}
                    </div>

                    {gameState === 'answered' && (
                        <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                            "border-4 rounded-[3rem] shadow-2xl text-left transition-all duration-500",
                            isFullscreen ? "p-16 mt-12" : "mt-8",
                            isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                        )}>
                            <Moon className={cn("text-amber-400", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />
                            <AlertTitle className={cn("font-black tracking-tight uppercase mb-4", isFullscreen ? "text-5xl" : "text-xl")}>
                                {isCorrect ? "TRUE VISION!" : "CLOUDED MIND!"}
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
                <div className="flex flex-col items-center gap-6 w-full max-w-md animate-in zoom-in-95 duration-500">
                    <div className="h-24 w-24 rounded-full bg-amber-500/10 border-4 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                        <Trophy className={cn(isFullscreen ? "h-16 w-16" : "h-10 w-10")} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className={cn("font-black tracking-widest text-amber-400 uppercase", isFullscreen ? "text-5xl" : "text-2xl")}>{title}</h3>
                        <p className={cn("text-muted-foreground font-medium", isFullscreen ? "text-2xl" : "text-base")}>{evaluation}</p>
                    </div>

                    <div className="w-full bg-purple-950/20 rounded-3xl p-6 border border-amber-500/10 shadow-inner text-center space-y-4">
                        <div>
                            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">Accuracy</p>
                            <p className={cn("font-black text-amber-400", isFullscreen ? "text-6xl" : "text-4xl")}>{accuracy}%</p>
                        </div>
                        <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase pt-2">
                            <span>Riddles: {roundsChoice}</span>
                            <span>Correct: {score}</span>
                        </div>
                    </div>

                    <Button 
                        onClick={() => setGameState('selecting_difficulty')} 
                        size={isFullscreen ? "lg" : "default"} 
                        className={cn("w-full bg-gradient-to-r from-amber-500 to-purple-600 text-white font-black shadow-xl", isFullscreen && "h-20 text-2xl rounded-2xl")}
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
        "w-full transition-all duration-500 flex flex-col bg-background text-white",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none justify-center" 
            : "max-w-4xl mx-auto rounded-[2.5rem] border-4 border-amber-500/10 shadow-[0_0_100px_rgba(139,92,246,0.1)]"
      )}>
      <CardHeader className="text-center relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-amber-500 z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-4">
                <Icon className="w-16 h-16 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase italic", isFullscreen ? "text-7xl text-white" : "text-4xl")}>{game.title}</CardTitle>
        <CardDescription className={cn("text-amber-500/70 font-black tracking-widest", isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn("border-amber-500 text-amber-500", isFullscreen && "text-xl px-6 py-1")}>{(difficulty || game.level).toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center relative",
          isFullscreen ? "min-h-[60vh] max-w-7xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {renderContent()}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8 border-t border-white/5 bg-black/20", isFullscreen && "max-w-7xl mx-auto w-full pb-16 bg-transparent border-none")}>
        <Button variant="ghost" asChild size={isFullscreen ? "lg" : "default"} className={cn("text-amber-500/50 hover:text-amber-500", isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Leave Realm</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} size={isFullscreen ? "lg" : "default"} className={cn("bg-amber-500 hover:bg-amber-600 text-black font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>Unveil Answer</Button>}
            {gameState === 'answered' && (
              <Button 
                onClick={handleNextStep} 
                size={isFullscreen ? "lg" : "default"} 
                className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}
              >
                {currentRound + 1 >= roundsChoice ? "Leave Oracle" : "Next Vision"}
              </Button>
            )}
            {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty' && gameState !== 'selecting_rounds' && (
                <Button variant="ghost" onClick={() => setGameState('selecting_difficulty')} size={isFullscreen ? "lg" : "default"} className={cn("text-purple-400 hover:text-purple-300", isFullscreen && "h-16 px-10 text-xl font-bold")}>Change Tier</Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
