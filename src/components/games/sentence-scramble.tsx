
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
        <CardDescription className={cn("text-xs sm:text-sm md:text-base max-w-xl mx-auto", isFullscreen && "sm:text-lg mt-1")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-sm sm:text-base px-4 py-1")}>{difficulty.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <p className="text-sm sm:text-lg text-muted-foreground">Ready to unscramble some sentences? Test your grammar and word order skills!</p>
            <Button onClick={() => setGameState('instructions')} className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black rounded-xl">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Game
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full">
                <h3 className="font-bold text-lg sm:text-2xl text-center">How to Play</h3>
                <div className="text-left space-y-3 text-xs sm:text-base text-muted-foreground">
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">1.</span> Tap the words in the correct order to form a proper sentence.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">2.</span> Tap a word in the answer box to send it back to the pile.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">3.</span> Unscramble the whole message and tap Analyze to verify!</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="w-full sm:w-auto mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black rounded-xl">Choose Difficulty</Button>
            </div>
        )}
        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
                <p className="text-muted-foreground font-black uppercase tracking-wider text-xs sm:text-sm">Choose Challenge Difficulty</p>
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
            <p className="text-muted-foreground font-medium animate-pulse text-sm sm:text-lg">Shuffling linguistic tokens...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
            <div className="space-y-6 w-full">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs sm:text-sm">Constructed Sentence:</p>
                    <span className="text-xs text-muted-foreground">Tap words to remove</span>
                </div>
                
                <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl bg-muted/20 border-2 border-dashed border-primary/30 min-h-[6rem] sm:min-h-[8rem] transition-all shadow-inner">
                    {answer.length === 0 ? (
                        <p className="text-xs sm:text-sm text-muted-foreground/60 italic">Tap words below to place them here</p>
                    ) : (
                        answer.map((word, index) => (
                            <Button key={`${word}-${index}`} variant="secondary" onClick={() => handleWordClick(word, 'answer', index)} className="shadow-sm animate-in zoom-in-95 h-9 sm:h-11 px-3 sm:px-4 font-bold rounded-xl text-xs sm:text-base">
                                {word}
                            </Button>
                        ))
                    )}
                </div>

                <div className="space-y-2">
                    <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs sm:text-sm">Available Words:</p>
                    <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 p-2">
                        {scrambled.map((word, index) => (
                            <Button key={`${word}-${index}`} variant="outline" onClick={() => handleWordClick(word, 'scrambled', index)} className="shadow-sm transition-all duration-200 hover:scale-105 h-9 sm:h-11 px-3 sm:px-4 font-bold border-2 rounded-xl text-xs sm:text-base">
                                {word}
                            </Button>
                        ))}
                    </div>
                </div>

                {gameState === 'answered' && (
                    <Alert variant={isCorrect ? 'default' : 'destructive'} className={cn(
                        "border-2 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 p-4 sm:p-6",
                        isCorrect ? "bg-green-500/15 border-green-500/40 text-foreground" : "bg-red-500/15 border-red-500/40 text-foreground"
                    )}>
                        {isCorrect ? <CheckCircle className="text-green-500 h-5 w-5 sm:h-6 sm:w-6" /> : <XCircle className="text-red-500 h-5 w-5 sm:h-6 sm:w-6" />}
                        <AlertTitle className="font-black tracking-tight text-base sm:text-xl mb-1">
                            {isCorrect ? "PERFECTLY UNSCRAMBLED!" : "DECODING ERROR!"}
                        </AlertTitle>
                        <AlertDescription className="text-xs sm:text-base leading-relaxed">
                           {isCorrect ? "You formed the sentence exactly right." : `The correct order was: "${exercise.correctSentence}"`}
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
            {gameState === 'playing' && (
                <>
                    <Button variant="ghost" onClick={handleReset} className="w-full sm:w-auto h-11 sm:h-12 px-4 rounded-xl font-bold">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    <Button onClick={handleCheckAnswer} disabled={scrambled.length > 0} className="w-full sm:w-auto h-11 sm:h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all font-black shadow-lg rounded-xl">
                        Analyze Order
                    </Button>
                </>
            )}
            {gameState === 'answered' && <Button onClick={() => handleStartGame(difficulty)} className="w-full sm:w-auto h-11 sm:h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all font-black shadow-lg rounded-xl">
                <Shuffle className="mr-2 h-4 w-4" /> Next Sentence
            </Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
