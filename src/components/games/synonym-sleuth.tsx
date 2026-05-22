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
  generateSynonymExercise,
  type GenerateSynonymExerciseOutput,
} from "@/ai/flows/generate-synonym-exercise";
import { Loader2, Sparkles, Check, X, Repeat, Maximize, Minimize } from "lucide-react";
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
        options: [...newExercise.options].sort(() => Math.random() - 0.5)
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
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[20rem] p-6"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to find some synonyms?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Game
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
                    <p>1. A target word will be highlighted in the mission center.</p>
                    <p>2. Choose the word that shares the same meaning from the options provided.</p>
                    <p>3. Correct matches advance you to higher complexity levels.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Initialize Scan</Button>
            </div>
        )}
         {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-8">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Choose Mission Level</p>
                <div className={cn("flex flex-wrap gap-4 justify-center", isFullscreen && "gap-8")}>
                    {["beginner", "intermediate", "advanced"].map((level) => (
                        <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black shadow-xl", isFullscreen && "h-24 px-12 text-3xl rounded-3xl border-4")}>
                            {level.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Searching for linguistic parallels...</p>
            </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-8 text-left w-full">
            <p className={cn("font-black text-muted-foreground uppercase tracking-widest text-center", isFullscreen ? "text-2xl" : "text-xs")}>Identify the synonym for:</p>
            <div className={cn(
                "text-center font-black italic text-primary bg-muted/20 backdrop-blur-sm rounded-[3rem] border-4 border-primary/20 shadow-xl",
                isFullscreen ? "text-[8vw] p-16 leading-none" : "text-4xl p-8"
            )}>
              {exercise.word}
            </div>
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", isFullscreen && "gap-8 mt-10")}>
              {exercise.options.map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-auto whitespace-normal justify-center text-center transition-all duration-300 shadow-lg",
                    isFullscreen ? "py-10 text-4xl font-black rounded-3xl border-4" : "py-4 font-bold border-2",
                    { "bg-green-500 hover:bg-green-600 text-white border-green-400": gameState === 'answered' && option === exercise.correctSynonym }
                  )}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === exercise.correctSynonym && <Check className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />}
                  {gameState === 'answered' && option !== exercise.correctSynonym && selectedOption === option && <X className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />}
                  {option}
                </Button>
              ))}
            </div>
            {gameState === 'answered' && (
                 <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                     "border-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4",
                     isFullscreen ? "p-12 mt-12" : "mt-8",
                     isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                 )}>
                    {isCorrect ? <Check className={cn("text-primary", isFullscreen ? "h-12 w-12" : "h-6 w-6")} /> : <X className={cn("text-primary", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                    <AlertTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>
                        {isCorrect ? "MISSION SUCCESS!" : "NOT QUITE!"}
                    </AlertTitle>
                    <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                       The best synonym for <strong>{exercise.word}</strong> is <strong>{exercise.correctSynonym}</strong>.
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
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>Verify Intel</Button>}
            {gameState === 'answered' && <Button onClick={handleNextQuestion} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}><Repeat className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Next Mission</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}