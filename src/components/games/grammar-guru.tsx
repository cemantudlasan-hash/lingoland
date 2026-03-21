
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
import { Textarea } from "../ui/textarea";
import {
  generateGrammarExercise,
} from "@/ai/flows/generate-grammar-exercise";
import type { GenerateGrammarExerciseOutput } from "@/ai/flows/generate-grammar-exercise";
import { Loader2, CheckCircle, XCircle, Sparkles, Repeat, Maximize, Minimize } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions";

export function GrammarGuru({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<GenerateGrammarExerciseOutput | null>(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [usedSentences, setUsedSentences] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

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
    setUserAnswer("");
    setIsCorrect(null);
    try {
      const newExercise = await generateGrammarExercise({
        difficulty: game.level,
        usedSentences: usedSentences,
      });
      setExercise(newExercise);
      setUsedSentences(prev => [...prev, newExercise.correctSentence]);
      setUserAnswer(newExercise.incorrectSentence);
      setGameState("playing");
      if (firestore) {
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game.slug, title: game.title }
        });
      }
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
    if (!exercise) return;
    const isAnswerCorrect = userAnswer.trim().toLowerCase() === exercise.correctSentence.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    setGameState("answered");
  };

  const renderFeedback = () => {
    if (gameState !== "answered" || isCorrect === null) return null;

    return (
      <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
          "border-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4",
          isFullscreen ? "p-12 mt-12" : "mt-6",
          isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
      )}>
        {isCorrect ? <CheckCircle className={cn("text-green-500", isFullscreen ? "h-12 w-12" : "h-6 w-6")} /> : <XCircle className={cn("text-red-500", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
        <AlertTitle className={cn("font-black tracking-tight", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>
            {isCorrect ? "EXCELLENT!" : "NOT QUITE!"}
        </AlertTitle>
        <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
            <p className="mb-2">{exercise?.explanation}</p>
            {!isCorrect && <p className="font-bold">Correct: {exercise?.correctSentence}</p>}
        </AlertDescription>
      </Alert>
    );
  };
  
  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
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
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-7xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-3xl mt-4 opacity-80")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-2xl px-8 py-2 border-2")}>{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[20rem]"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-4xl mb-8" : "text-base")}>Ready to test your grammar skills?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-24 px-20 text-4xl rounded-3xl")}>
              <Sparkles className={cn("mr-4", isFullscreen ? "h-12 w-12" : "h-5 w-5")} />
              Start Game
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-20 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-6", isFullscreen ? "text-5xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-6", isFullscreen ? "text-3xl" : "text-base")}>
                    <p>1. Find the mistake in the sentence provided by the AI.</p>
                    <p>2. Type the correct version of the sentence in the box.</p>
                    <p>3. Check your answer to see the rule and learn!</p>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("mt-12 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-24 px-20 text-4xl rounded-3xl")}>Initialize</Button>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-8">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-32 w-32" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground font-black animate-pulse uppercase tracking-widest", isFullscreen ? "text-4xl" : "text-lg")}>Analyzing syntax...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-8 text-left w-full">
            <p className={cn("font-black text-muted-foreground uppercase tracking-widest", isFullscreen ? "text-5xl mb-10" : "text-xs")}>Fix the sentence:</p>
            <Textarea 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className={cn(
                    "font-black bg-muted/20 backdrop-blur-sm rounded-[2rem] border-4 focus-visible:ring-primary shadow-inner transition-all",
                    isFullscreen 
                      ? "text-[6vw] md:text-[6vw] p-12 min-h-[400px] text-center leading-tight flex items-center justify-center" 
                      : "text-2xl p-6 min-h-[150px]"
                )}
                disabled={gameState === "answered"}
                spellCheck="false"
            />
            {renderFeedback()}
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-20")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-20 px-12 text-2xl font-bold rounded-[1.5rem]")}>
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!userAnswer.trim()} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-[1.5rem]")}>Check Answer</Button>}
            {gameState === 'answered' && <Button onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-[1.5rem]")}><Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-4 w-4")}/>Next Mission</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
