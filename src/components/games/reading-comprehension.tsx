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
  generateReadingComprehension,
  type GenerateReadingComprehensionOutput,
} from "@/ai/flows/generate-reading-comprehension";
import { Loader2, Sparkles, Check, X, ThumbsUp, Repeat, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions";

export function ReadingComprehension({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<GenerateReadingComprehensionOutput | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [usedTopics, setUsedTopics] = React.useState<string[]>([]);
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
      const newExercise = await generateReadingComprehension({ difficulty: level, usedTopics });
      setExercise({
        ...newExercise,
        options: shuffleArray([...newExercise.options])
      });
      setUsedTopics(prev => [...prev, newExercise.topic]);
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
    const correct = selectedOption === exercise.correctAnswer;
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
    if (option === exercise?.correctAnswer) {
      return "secondary"; // Correct answer
    }
    if (option === selectedOption) {
      return "destructive"; // Incorrect selected answer
    }
    return "outline";
  };
  
  const Icon = game.icon;

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
                <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase text-xl sm:text-3xl md:text-4xl", isFullscreen && "text-3xl sm:text-5xl")}>{game.title}</CardTitle>
        <CardDescription className={cn("text-xs sm:text-sm max-w-xl mx-auto", isFullscreen && "text-base sm:text-xl mt-1")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn("text-xs sm:text-sm px-3 py-0.5", isFullscreen && "text-base px-4 py-1")}>{difficulty || game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md text-center py-6">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base")}>Ready to sharpen your comprehension?</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl shadow-lg", isFullscreen && "h-16 px-10 text-xl")}>
                <Sparkles className="mr-2 h-5 w-5" />
                Start Reading
              </Button>
            </div>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full max-w-lg p-5 sm:p-8",
                 isFullscreen && "max-w-2xl p-8 sm:p-12"
             )}>
                <h3 className={cn("font-bold text-center", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-3 text-muted-foreground", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
                    <p>1. Carefully read the text passage provided.</p>
                    <p>2. Analyze the context to answer the deep comprehension question.</p>
                    <p>3. Confirm your understanding to advance through the levels.</p>
                </div>
                <div className="self-center mt-6 w-full">
                    <p className="text-muted-foreground font-black uppercase tracking-wider text-center mb-3 text-xs sm:text-sm">Choose Mission Level</p>
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center w-full">
                        {["beginner", "intermediate", "advanced"].map(level => (
                            <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size="lg" variant="outline" className="flex-1 font-black uppercase h-12 sm:h-14 rounded-xl border-2 hover:bg-primary/10 text-xs sm:text-sm">{level}</Button>
                        ))}
                    </div>
                </div>
                <Button variant="ghost" onClick={() => setGameState('idle')} className="mt-2 text-xs">Back</Button>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-10 w-10 sm:h-12 sm:w-12")} />
            <p className={cn("text-muted-foreground animate-pulse text-sm sm:text-base", isFullscreen && "text-xl")}>Analyzing textual database...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-4 sm:space-y-6 text-left w-full max-w-3xl mx-auto">
            <ScrollArea className={cn(
                "w-full rounded-2xl border-2 sm:border-3 p-4 sm:p-6 bg-muted/20 backdrop-blur-sm shadow-inner",
                isFullscreen ? "h-[35vh] p-8" : "h-40 sm:h-52"
            )}>
                <p className={cn("whitespace-pre-line leading-relaxed text-foreground font-medium", isFullscreen ? "text-xl sm:text-2xl" : "text-xs sm:text-sm md:text-base")}>{exercise.passage}</p>
            </ScrollArea>
            
            <p className={cn("font-black text-primary uppercase tracking-wider text-sm sm:text-lg md:text-xl", isFullscreen && "text-2xl")}>
                {exercise.question}
            </p>

            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {exercise.options.map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-auto whitespace-normal justify-start text-left py-3 px-4 sm:py-4 sm:px-5 border-2 transition-all duration-300 shadow-sm rounded-xl text-xs sm:text-sm leading-snug",
                    {
                    "bg-green-500 hover:bg-green-600 text-white border-green-400 font-bold": gameState === 'answered' && option === exercise.correctAnswer,
                    "ring-2 ring-primary": gameState === 'playing' && selectedOption === option
                  })}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === exercise.correctAnswer && <Check className="mr-2 sm:mr-3 h-4 w-4 shrink-0" />}
                   {gameState === 'answered' && option !== exercise.correctAnswer && selectedOption === option && <X className="mr-2 sm:mr-3 h-4 w-4 shrink-0" />}
                  <span>{option}</span>
                </Button>
              ))}
            </div>

            {gameState === 'answered' && (
                <Alert variant={isCorrect ? "default" : "destructive"} className="border-2 rounded-2xl shadow-lg p-4 sm:p-6">
                    <ThumbsUp className="text-primary h-5 w-5" />
                    <AlertTitle className="font-black tracking-tight uppercase text-sm sm:text-base mb-1">
                        {isCorrect ? "INSIGHTFUL!" : "RE-READ REQUIRED!"}
                    </AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                       {isCorrect ? "You've correctly interpreted the passage." : `The correct answer was: ${exercise.correctAnswer}`}
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
          <Link href="/games">Exit Game</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 w-full sm:w-auto">
            {gameState === 'playing' && 
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handleNextQuestion} variant="secondary" className="flex-1 sm:flex-initial h-11 sm:h-12 px-6 rounded-xl font-bold"><Repeat className="mr-2 h-4 w-4"/>Skip</Button>
                    <Button onClick={handleCheckAnswer} disabled={!selectedOption} className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md h-11 sm:h-12 px-8 rounded-xl">Verify Intel</Button>
                </div>
            }
            {gameState === 'answered' && <Button onClick={handleNextQuestion} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md h-11 sm:h-12 px-8 rounded-xl"><Repeat className="mr-2 h-4 w-4"/>Next Passage</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
