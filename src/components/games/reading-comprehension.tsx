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
        options: [...newExercise.options].sort(() => Math.random() - 0.5)
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
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      <CardHeader className="text-center relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-4">
                <Icon className="w-16 h-16 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty || game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to sharpen your comprehension?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-2", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Reading
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Carefully read the text passage provided.</p>
                    <p>2. Analyze the context to answer the deep comprehension question.</p>
                    <p>3. Confirm your understanding to advance through the levels.</p>
                </div>
                <div className="self-center mt-8">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Choose Mission Level</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {["beginner", "intermediate", "advanced"].map(level => (
                            <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>{level}</Button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Analyzing textual database...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className={cn("space-y-8 text-left w-full", isFullscreen && "max-w-5xl")}>
            <ScrollArea className={cn(
                "w-full rounded-3xl border-4 p-8 bg-muted/20 backdrop-blur-sm shadow-inner",
                isFullscreen ? "h-[40vh] p-12" : "h-48"
            )}>
                <p className={cn("whitespace-pre-line leading-relaxed", isFullscreen ? "text-3xl" : "text-lg")}>{exercise.passage}</p>
            </ScrollArea>
            
            <p className={cn("font-black text-primary uppercase tracking-widest", isFullscreen ? "text-4xl mt-10" : "text-xl")}>
                {exercise.question}
            </p>

            <div className={cn("grid grid-cols-1 gap-4", isFullscreen && "gap-6")}>
              {exercise.options.map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-auto whitespace-normal justify-start text-left py-4 px-6 border-2 transition-all duration-300 shadow-md",
                    isFullscreen ? "text-3xl p-10 rounded-2xl border-4" : "rounded-xl",
                    {
                    "bg-green-500 hover:bg-green-600 text-white border-green-400": gameState === 'answered' && option === exercise.correctAnswer,
                    "ring-4 ring-primary": gameState === 'playing' && selectedOption === option
                  })}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === exercise.correctAnswer && <Check className={cn("mr-4", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />}
                   {gameState === 'answered' && option !== exercise.correctAnswer && selectedOption === option && <X className={cn("mr-4", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />}
                  {option}
                </Button>
              ))}
            </div>

            {gameState === 'answered' && (
                <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                    "border-4 rounded-3xl shadow-2xl",
                    isFullscreen ? "p-12 mt-12" : "mt-8",
                    isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                )}>
                    <ThumbsUp className={cn("text-primary", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />
                    <AlertTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>
                        {isCorrect ? "INSIGHTFUL!" : "RE-READ REQUIRED!"}
                    </AlertTitle>
                    <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                       {isCorrect ? "You've correctly interpreted the passage." : `The correct answer was: ${exercise.correctAnswer}`}
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'playing' && 
                <div className="flex gap-2">
                    <Button onClick={handleNextQuestion} variant="secondary" size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}><Repeat className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Skip</Button>
                    <Button onClick={handleCheckAnswer} disabled={!selectedOption} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>Verify Intel</Button>
                </div>
            }
            {gameState === 'answered' && <Button onClick={handleNextQuestion} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}><Repeat className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Next Passage</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
