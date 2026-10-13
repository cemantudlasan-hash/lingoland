
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
        "w-full transition-all duration-500 flex flex-col overflow-y-auto overflow-x-hidden justify-between",
        isFullscreen 
            ? "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none bg-background p-2 sm:p-6" 
            : "flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full bg-card/80 backdrop-blur-sm border-border/20 shadow-lg rounded-2xl md:rounded-3xl"
      )}>
      <CardHeader className="text-center relative p-3 sm:p-6 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 px-2 gap-1 text-muted-foreground hover:text-foreground z-20"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        <div className="flex justify-center mb-2 sm:mb-4">
            <Icon className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
        </div>
        <CardTitle className="font-black tracking-tight uppercase text-xl sm:text-3xl md:text-5xl">{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-base mt-1 max-w-xl mx-auto">{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5 sm:px-4 sm:py-1">{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-3 sm:gap-4 text-center my-auto">
            <p className="text-muted-foreground text-sm sm:text-xl">Ready to test your grammar skills?</p>
            <Button onClick={() => setGameState('instructions')} className="h-11 sm:h-14 px-6 sm:px-12 text-sm sm:text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black rounded-xl">
              <Sparkles className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              Start Game
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
                <h3 className="font-bold text-center text-lg sm:text-2xl">How to Play</h3>
                <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-base text-muted-foreground w-full bg-background/50 p-3 sm:p-4 rounded-xl border border-border/20">
                    <p>1. Find the grammatical error in the AI-generated sentence.</p>
                    <p>2. Edit and type the corrected sentence into the text box.</p>
                    <p>3. Submit to verify against the correct rule and receive explanations.</p>
                </div>
                <Button onClick={handleStartGame} className="w-full h-11 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 font-black rounded-xl">Initialize Mission</Button>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 my-auto">
            <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-16 sm:w-16" />
            <p className="text-muted-foreground font-black animate-pulse uppercase tracking-wider text-xs sm:text-lg">Analyzing syntax...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-4 sm:space-y-6 text-left w-full my-auto">
            <p className="font-black text-muted-foreground uppercase tracking-wider text-xs sm:text-sm">Fix the sentence:</p>
            <Textarea 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="font-bold bg-muted/20 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 sm:border-4 focus-visible:ring-primary shadow-inner transition-all text-base sm:text-2xl p-3 sm:p-6 min-h-[120px] sm:min-h-[160px] leading-relaxed break-words"
                disabled={gameState === "answered"}
                spellCheck="false"
            />
            {renderFeedback()}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 sm:p-6 w-full shrink-0 max-w-4xl mx-auto">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 text-xs sm:text-sm font-bold rounded-xl">
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex gap-3 w-full sm:w-auto">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!userAnswer.trim()} className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 font-black rounded-xl">Check Answer</Button>}
            {gameState === 'answered' && <Button onClick={handleStartGame} className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 font-black rounded-xl"><Repeat className="mr-2 h-4 w-4"/>Next Mission</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
