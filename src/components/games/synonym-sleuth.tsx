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
import {
  generateSynonymExercise,
  type GenerateSynonymExerciseOutput,
} from "@/ai/flows/generate-synonym-exercise";
import { Loader2, Sparkles,
  ArrowLeft,
  XOctagon, Check, X, Repeat, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions" | "selecting_difficulty";

export function SynonymSleuth({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<GenerateSynonymExerciseOutput | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    setExercise(null);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const newExercise = await generateSynonymExercise({ difficulty: level, usedWords });
      setExercise({
        ...newExercise,
        options: shuffleArray([...newExercise.options])
      });
      setUsedWords(prev => [...prev, newExercise.word]);
      setGameState("playing");
    } catch (error) {
      console.error("Failed to generate exercise:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
      setGameState("idle");
    }
  };

  const handleCheckAnswer = () => {
    if (!exercise || !selectedOption) return;
    const correct = selectedOption === exercise.correctSynonym;
    setIsCorrect(correct);
    setGameState("answered");
  };

  const handleNextQuestion = () => {
    if (difficulty) {
        handleStartGame(difficulty);
    }
  };

  const getButtonVariant = (option: string) => {
    if (gameState !== "answered") {
      return selectedOption === option ? "default" : "outline";
    }
    if (option === exercise?.correctSynonym) {
      return "secondary";
    }
    if (option === selectedOption) {
      return "destructive";
    }
    return "outline";
  };
  
  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}>
      <CardHeader className="text-center relative p-4 sm:p-6 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-1.5 sm:p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        <div className="flex justify-center mb-2">
            <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
        </div>
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-3xl")}>{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base max-w-xl mx-auto">{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">{difficulty || game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto overflow-x-hidden custom-scrollbar">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <p className="text-sm sm:text-base text-muted-foreground">Ready to deduce linguistic parallels? Find matching words!</p>
            <Button onClick={() => setGameState('instructions')} className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg rounded-xl">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Mission
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full">
                <h3 className="font-bold text-lg sm:text-2xl text-center">How to Play</h3>
                <div className="text-left space-y-3 text-xs sm:text-base text-muted-foreground">
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">1.</span> A target word will be highlighted in the center console.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">2.</span> Choose the word that shares the same meaning from the options.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">3.</span> Correct matches build your vocabulary expertise!</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} className="w-full sm:w-auto mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 px-8 rounded-xl shadow-lg">Choose Difficulty</Button>
            </div>
        )}
         {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
                <p className="text-muted-foreground font-black uppercase tracking-wider text-xs sm:text-sm">Choose Mission Level</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((level) => (
                        <Button key={level} onClick={() => handleStartGame(level)} variant="outline" className="h-12 sm:h-14 font-black shadow-md rounded-xl hover:border-primary border-2 text-sm sm:text-base capitalize">
                            {level}
                        </Button>
                    ))}
                </div>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-14 sm:h-14" />
                <p className="text-muted-foreground animate-pulse font-medium text-xs sm:text-sm">Searching for linguistic parallels...</p>
            </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-6 text-left w-full max-w-2xl mx-auto">
            <p className="font-black text-muted-foreground uppercase tracking-widest text-center text-xs sm:text-sm">Identify the synonym for:</p>
            <div className="text-center font-black italic text-primary bg-muted/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-primary/20 shadow-lg text-2xl sm:text-4xl md:text-5xl p-4 sm:p-8">
              {exercise.word}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full">
              {exercise.options.map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-auto min-h-[50px] sm:min-h-[58px] py-3 px-4 whitespace-normal break-words justify-center text-center transition-all duration-200 shadow-md font-bold text-xs sm:text-base rounded-xl sm:rounded-2xl border-2",
                    gameState === 'answered' && option === exercise.correctSynonym && "bg-green-500 hover:bg-green-600 text-white border-green-400"
                  )}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === exercise.correctSynonym && <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                  {gameState === 'answered' && option !== exercise.correctSynonym && selectedOption === option && <X className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                  <span>{option}</span>
                </Button>
              ))}
            </div>
            {gameState === 'answered' && (
                 <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                     "border-2 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 p-4 sm:p-6",
                     isCorrect ? "bg-green-500/15 border-green-500/40 text-foreground" : "bg-red-500/15 border-red-500/40 text-foreground"
                 )}>
                    {isCorrect ? <Check className="text-green-500 h-5 w-5 sm:h-6 sm:w-6" /> : <X className="text-red-500 h-5 w-5 sm:h-6 sm:w-6" />}
                    <AlertTitle className="font-black tracking-tight uppercase text-base sm:text-xl mb-1">
                        {isCorrect ? "MISSION SUCCESS!" : "NOT QUITE!"}
                    </AlertTitle>
                    <AlertDescription className="text-xs sm:text-base leading-relaxed">
                       The best synonym for <strong>{exercise.word}</strong> is <strong>{exercise.correctSynonym}</strong>.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full sm:w-auto h-11 sm:h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg rounded-xl">Verify Intel</Button>}
            {gameState === 'answered' && <Button onClick={handleNextQuestion} className="w-full sm:w-auto h-11 sm:h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg rounded-xl"><Repeat className="mr-2 h-4 w-4"/>Next Mission</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}