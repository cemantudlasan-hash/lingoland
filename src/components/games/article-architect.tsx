
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
import { generateArticleExercise } from "@/ai/flows/generate-article-exercise";
import type { GenerateArticleExerciseOutput } from "@/ai/flows/schemas/article-exercise-schema";
import { Loader2, Sparkles, Check, X, Repeat, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions";

export function ArticleArchitect({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<GenerateArticleExerciseOutput | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [usedSentences, setUsedSentences] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    setGameState("loading");
    setExercise(null);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const newExercise = await generateArticleExercise({
        difficulty: game.level,
        usedSentences: usedSentences,
      });
      const originalSentence = newExercise.sentenceWithBlank.replace('___', newExercise.correctAnswer);
      setUsedSentences(prev => [...prev, originalSentence]);
      setExercise(newExercise);
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

  const getButtonVariant = (option: string) => {
    if (gameState !== "answered") {
      return selectedOption === option ? "default" : "outline";
    }
    if (option === exercise?.correctAnswer) {
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
            : "max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
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
        <CardTitle className={cn("font-black tracking-tight", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-5xl mx-auto w-full px-8" : "min-h-[20rem]"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to build some sentences?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg", isFullscreen && "h-20 px-16 text-3xl font-black rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Game
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20",
                 isFullscreen ? "p-16 max-w-4xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play Article Architect</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. You'll be given a sentence with a missing article (a, an, the, or no article).</p>
                    <p>2. Choose the correct article from the four options to complete the sentence.</p>
                    <p>3. Check your answer to see if you are right and learn the rule!</p>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg", isFullscreen && "h-20 px-16 text-3xl font-black rounded-3xl")}>Let's Play!</Button>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground font-medium animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Building a new challenge...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-8 text-left w-full">
            <p className={cn("font-bold text-muted-foreground uppercase tracking-widest", isFullscreen ? "text-2xl" : "text-xs")}>Complete the sentence:</p>
            <div className={cn(
                "text-center font-bold bg-muted/20 backdrop-blur-sm rounded-3xl border border-border/20 shadow-inner",
                isFullscreen ? "text-[5vw] md:text-[5vw] p-16 leading-relaxed" : "text-2xl p-8"
            )}>
                {exercise.sentenceWithBlank.split('___').map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < exercise.sentenceWithBlank.split('___').length - 1 && (
                             <span className={cn(
                                 "inline-block border-b-4 border-primary mx-3",
                                 isFullscreen ? "w-40 h-16" : "w-20 h-8"
                             )}></span>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className={cn("grid grid-cols-2 gap-4", isFullscreen && "gap-8")}>
              {exercise.options.map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option)}
                  className={cn("h-auto whitespace-normal justify-center text-center transition-all duration-300 hover:scale-105 shadow-xl", 
                    isFullscreen ? "py-10 text-4xl font-black rounded-3xl border-4" : "py-4 font-bold border-2",
                    {
                    "bg-green-600 hover:bg-green-700 text-white border-green-400": gameState === 'answered' && option === exercise.correctAnswer,
                    "text-white border-red-400": gameState === 'answered' && option === selectedOption && option !== exercise.correctAnswer,
                    "ring-4 ring-primary": gameState === 'playing' && selectedOption === option
                  })}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === exercise.correctAnswer && <Check className={cn("mr-3", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                  {gameState === 'answered' && option !== exercise.correctAnswer && selectedOption === option && <X className={cn("mr-3", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                  {option}
                </Button>
              ))}
            </div>
            {gameState === 'answered' && (
                 <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                     "border-4 rounded-3xl shadow-2xl",
                     isFullscreen ? "p-12" : "",
                     isCorrect
                        ? "bg-green-500/20 border-green-500/50 text-foreground"
                        : "bg-red-500/20 border-red-500/50 text-foreground"
                 )}>
                    <AlertTitle className={cn("font-black tracking-tight", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>{isCorrect ? "EXCELLENT!" : "NOT QUITE!"}</AlertTitle>
                    <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                       {exercise.explanation}
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-5xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Back to Games</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>Check Answer</Button>}
            {gameState === 'answered' && <Button onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}><Repeat className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Next Question</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
