
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
  generateSentenceScramble,
} from "@/ai/flows/generate-sentence-scramble";
import type { GenerateSentenceScrambleOutput } from "@/ai/flows/generate-sentence-scramble";
import { Loader2, Sparkles, CheckCircle, XCircle, Shuffle, RotateCcw, Repeat, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions" | "selecting_difficulty";

export function SentenceScramble({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<GenerateSentenceScrambleOutput | null>(null);
  const [scrambled, setScrambled] = React.useState<string[]>([]);
  const [answer, setAnswer] = React.useState<string[]>([]);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [usedSentences, setUsedSentences] = React.useState<string[]>([]);
  const [difficulty, setDifficulty] = React.useState<SkillLevel>('beginner');
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
    setScrambled([]);
    setAnswer([]);
    setIsCorrect(null);
    try {
      const newExercise = await generateSentenceScramble({
        difficulty: level,
        usedSentences: usedSentences,
      });
      setExercise(newExercise);
      setUsedSentences(prev => [...prev, newExercise.correctSentence]);
      setScrambled(newExercise.scrambledSentence);
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

  const handleWordClick = (word: string, from: 'scrambled' | 'answer', index: number) => {
    if (gameState !== 'playing') return;

    if (from === 'scrambled') {
        setAnswer([...answer, word]);
        const newScrambled = [...scrambled];
        newScrambled.splice(index, 1);
        setScrambled(newScrambled);
    } else {
        setScrambled([...scrambled, word]);
        const newAnswer = [...answer];
        newAnswer.splice(index, 1);
        setAnswer(newAnswer);
    }
  };

  const handleCheckAnswer = () => {
    if (!exercise) return;
    const userAnswer = answer.join(" ").replace(/[.,!?]/g, '').toLowerCase();
    const isAnswerCorrect = userAnswer === exercise.correctSentence.replace(/[.,!?]/g, '').toLowerCase();
    setIsCorrect(isAnswerCorrect);
    setGameState("answered");
  };

  const handleReset = () => {
      if (!exercise) return;
      setAnswer([]);
      setScrambled(exercise.scrambledSentence);
  }
  
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
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-5xl mx-auto w-full px-8" : "min-h-[20rem]"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to unscramble some sentences?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Game
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-4xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Tap the words in the correct order to form a proper sentence.</p>
                    <p>2. Tap a word in the answer box to send it back to the pile.</p>
                    <p>3. Unscramble the whole message to win the round!</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>Unscramble Now</Button>
            </div>
        )}
        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-8">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Choose Challenge Difficulty</p>
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
            <p className={cn("text-muted-foreground font-medium animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Shuffling linguistic tokens...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
            <div className="space-y-8 w-full">
                <p className={cn("font-bold text-muted-foreground uppercase tracking-widest text-left", isFullscreen ? "text-2xl" : "text-xs")}>Form the sentence:</p>
                
                <div className={cn(
                    "flex items-center justify-center flex-wrap gap-3 p-8 rounded-3xl bg-muted/20 border-4 border-dashed border-primary/30 min-h-[10rem] transition-all shadow-inner",
                    isFullscreen && "p-12 gap-6 min-h-[15rem]"
                )}>
                    {answer.map((word, index) => (
                        <Button key={`${word}-${index}`} variant="secondary" onClick={() => handleWordClick(word, 'answer', index)} className={cn(
                            "shadow-md animate-in zoom-in-95",
                            isFullscreen ? "h-24 px-10 text-[3.5vw] md:text-[3.5vw] font-black rounded-2xl" : "h-12 px-4 font-bold"
                        )}>
                            {word}
                        </Button>
                    ))}
                </div>

                <div className={cn("flex items-center justify-center flex-wrap gap-3 pt-8", isFullscreen && "gap-6")}>
                    {scrambled.map((word, index) => (
                        <Button key={`${word}-${index}`} variant="outline" onClick={() => handleWordClick(word, 'scrambled', index)} className={cn(
                            "shadow-md transition-all duration-300 hover:scale-110",
                            isFullscreen ? "h-24 px-10 text-[3.5vw] md:text-[3.5vw] font-black rounded-2xl border-4" : "h-12 px-4 font-bold border-2"
                        )}>
                            {word}
                        </Button>
                    ))}
                </div>

                {gameState === 'answered' && (
                    <Alert variant={isCorrect ? 'default' : 'destructive'} className={cn(
                        "border-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4",
                        isFullscreen ? "p-12 mt-12" : "mt-8",
                        isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                    )}>
                        {isCorrect ? <CheckCircle className={cn("text-green-500", isFullscreen ? "h-12 w-12" : "h-6 w-6")} /> : <XCircle className={cn("text-red-500", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                        <AlertTitle className={cn("font-black tracking-tight", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>
                            {isCorrect ? "PERFECTLY UNSCRAMBLED!" : "DECODING ERROR!"}
                        </AlertTitle>
                        <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                           {isCorrect ? "You formed the sentence exactly right." : `The correct order was: "${exercise.correctSentence}"`}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-5xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'playing' && (
                <>
                    <Button variant="ghost" onClick={handleReset} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 text-xl font-bold")}>
                        <RotateCcw className="mr-2 h-5 w-5" /> Reset
                    </Button>
                    <Button onClick={handleCheckAnswer} disabled={scrambled.length > 0} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
                        Analyze Order
                    </Button>
                </>
            )}
            {gameState === 'answered' && <Button onClick={() => handleStartGame(difficulty)} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
                <Shuffle className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")} /> Next Sentence
            </Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
