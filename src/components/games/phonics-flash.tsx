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
import { Input } from "../ui/input";
import {
  generatePhonicsWords,
} from "@/ai/flows/generate-phonics-word";
import { Loader2, Sparkles,
  ArrowLeft,
  XOctagon, Repeat, Timer, Check, X, HelpCircle, RotateCcw, SkipForward, Maximize, Minimize, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GeneratePhonicsWordOutput } from "@/ai/flows/schemas/phonics-schema";

type GameState = 'idle' | 'loading' | 'playing' | 'finished' | 'instructions';

type Box = {
  id: number;
  word: string;
  hint: string;
  revealed: boolean;
  correct: boolean | null;
};

const PHONICS_SOUNDS = ['ch', 'sh', 'th', 'ph', 'wh', 'kn', 'wr', 'ar', 'or', 'er', 'ir', 'ur', 'igh', 'tion', 'sion'];
const BOX_COUNT = 20;
const TIME_PER_BOX = 30;

export function PhonicsFlash({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [phonicsSound, setPhonicsSound] = React.useState('');
  const [boxes, setBoxes] = React.useState<Box[]>([]);
  const [currentBoxIndex, setCurrentBoxIndex] = React.useState(0);
  const [userGuess, setUserGuess] = React.useState('');
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIME_PER_BOX);
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

  const handleStartGame = async () => {
    setGameState('loading');
    setScore(0);
    setUserGuess('');
    setCurrentBoxIndex(0);
    
    const sound = PHONICS_SOUNDS[Math.floor(Math.random() * PHONICS_SOUNDS.length)];
    setPhonicsSound(sound);
    
    try {
      const result: GeneratePhonicsWordOutput = await generatePhonicsWords({
        phonicsSound: sound,
        difficulty: 'intermediate',
        count: BOX_COUNT,
        usedWords: usedWords
      });
  
      setBoxes(
        result.words.map((box, index) => ({ ...box, id: index, revealed: false, correct: null }))
      );
      setUsedWords(prev => [...prev, ...result.words.map(w => w.word)]);
      setTimeLeft(TIME_PER_BOX);
      setGameState('playing');
    } catch (e) {
      console.error('Failed to generate words:', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate words for the game. Please try again.',
      });
      setGameState('idle');
    }
  };

  const advanceToNextBox = React.useCallback((wasCorrect: boolean, timedOut: boolean = false) => {
    if (gameState !== 'playing') return;

    setBoxes(prevBoxes => {
      const newBoxes = [...prevBoxes];
      const currentBox = newBoxes[currentBoxIndex];
      if (currentBox) {
        newBoxes[currentBoxIndex] = { ...currentBox, revealed: true, correct: wasCorrect };
        if (timedOut) {
           toast({
              variant: "destructive",
              title: "Time's Up!",
              description: `The correct word was "${currentBox.word}".`,
          });
        }
      }
      return newBoxes;
    });

    if (currentBoxIndex < BOX_COUNT - 1) {
      setCurrentBoxIndex(prevIndex => prevIndex + 1);
      setTimeLeft(TIME_PER_BOX);
    } else {
      setGameState('finished');
    }
  }, [currentBoxIndex, gameState, toast]);

  React.useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    if (timeLeft <= 0) {
      advanceToNextBox(false, true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, timeLeft, advanceToNextBox]);


  const handleGuess = () => {
    const currentBox = boxes[currentBoxIndex];
    if (!currentBox || !userGuess.trim() || gameState !== 'playing') return;
  
    const isCorrect = userGuess.trim().toLowerCase() === currentBox.word.toLowerCase();
  
    if (isCorrect) {
      setScore(prev => prev + 1);
      toast({
        title: 'Correct!',
        description: `The word was "${currentBox.word}".`,
        className: 'bg-green-600 text-white border-green-700',
      });
      advanceToNextBox(true);
    } else {
      toast({ variant: 'destructive', title: 'Incorrect, please try again!' });
    }
    setUserGuess('');
  };
  
  const handlePass = () => {
    if (gameState !== 'playing') return;
    setUserGuess('');
    advanceToNextBox(false);
  };

  const resetGame = () => {
    setGameState('idle');
    setUsedWords([]);
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
            <Badge variant="outline" className={cn("text-xs sm:text-sm px-3 py-0.5", isFullscreen && "text-base px-4 py-1")}>{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto overflow-x-hidden custom-scrollbar">
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md text-center py-6">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base")}>Identify words by their phonics sound!</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl shadow-lg", isFullscreen && "h-16 px-10 text-xl")}>
                <Sparkles className="mr-2 h-5 w-5" /> Initialize Game
              </Button>
              <Button variant="outline" onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl font-bold border-2", isFullscreen && "h-16 px-10 text-xl")}>
                <HelpCircle className="mr-2 h-5 w-5" /> How to Play
              </Button>
            </div>
          </div>
        )}
        {gameState === 'instructions' && (
          <div className={cn(
              "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full max-w-lg p-5 sm:p-8",
              isFullscreen && "max-w-2xl p-8 sm:p-12"
          )}>
            <h3 className={cn("font-bold text-center", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>How to Play</h3>
            <div className={cn("text-left space-y-3 text-muted-foreground", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
              <p>1. A specific phonics sound (e.g., 'sh', 'ch') will be your target.</p>
              <p>2. A contextual hint will appear. Guess the word containing the target sound.</p>
              <p>3. You have {TIME_PER_BOX} seconds per word. Type and submit quickly!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
              <Button onClick={handleStartGame} size="lg" className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 rounded-xl">Initialize Scan</Button>
              <Button variant="outline" onClick={() => setGameState('idle')} size="lg" className="h-12 rounded-xl">Back</Button>
            </div>
          </div>
        )}
        {gameState === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-10 w-10 sm:h-12 sm:w-12")} />
                <p className={cn("text-muted-foreground animate-pulse text-sm sm:text-base", isFullscreen && "text-xl")}>Loading phonetic tokens...</p>
            </div>
        )}
        {gameState === 'playing' && boxes.length > 0 && (
          <div className="w-full flex flex-col items-center gap-4 sm:gap-6 max-w-4xl">
             <div className={cn("w-full flex justify-between items-center bg-muted/20 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border-2 border-primary/20", isFullscreen && "p-6")}>
                <p className={cn("font-black uppercase tracking-wider text-xs sm:text-sm", isFullscreen && "text-base sm:text-lg")}>Score: <span className="text-primary">{score} / {BOX_COUNT}</span></p>
                <p className={cn("font-black text-primary uppercase italic text-lg sm:text-2xl", isFullscreen && "text-2xl sm:text-3xl")}>Sound: "{phonicsSound}"</p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-primary"/>
                    <span className={cn("font-mono font-black text-base sm:text-xl", isFullscreen && "text-2xl")}>{timeLeft}s</span>
                </div>
            </div>

            <div className={cn("grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2.5 max-w-full overflow-x-auto p-1", isFullscreen && "gap-3 sm:gap-4")}>
                {boxes.map((box, index) => (
                    <div key={box.id} className={cn(
                        "flex items-center justify-center rounded-xl border-2 sm:border-3 transition-all duration-300 shadow-sm",
                        "h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 text-xs sm:text-sm",
                        index === currentBoxIndex ? "border-primary bg-primary/20 ring-2 ring-primary/40 scale-105" : "border-border/60",
                        box.revealed && box.correct === true && "bg-green-500 border-green-400 text-white font-bold",
                        box.revealed && box.correct === false && "bg-red-500 border-red-400 text-white font-bold",
                    )}>
                        {box.revealed ? (box.correct ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>) : <span className="font-bold opacity-70">{index + 1}</span>}
                    </div>
                ))}
            </div>
            
            <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
                <div className={cn("flex items-start sm:items-center gap-3 p-4 sm:p-6 bg-muted/20 backdrop-blur-sm rounded-2xl border-2 border-dashed border-primary/30", isFullscreen && "p-8")}>
                    <HelpCircle className="text-primary shrink-0 h-6 w-6 sm:h-8 sm:w-8 mt-0.5 sm:mt-0"/>
                    <p className={cn("font-bold italic text-left text-sm sm:text-base md:text-lg", isFullscreen && "text-xl sm:text-2xl")}>{boxes[currentBoxIndex]?.hint}</p>
                </div>
                <Input
                    type="text"
                    placeholder="Identify word..."
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                    className={cn("text-center font-black uppercase tracking-widest bg-card border-2 sm:border-3 h-12 sm:h-14 text-lg sm:text-2xl rounded-xl", isFullscreen && "h-16 text-3xl")}
                    autoFocus
                    spellCheck="false"
                />
                 <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 w-full">
                    <Button onClick={handleGuess} size="lg" className={cn("w-full sm:flex-1 font-black uppercase shadow-md h-12 sm:h-14 rounded-xl", isFullscreen && "h-16 text-xl")}>Confirm</Button>
                    <Button onClick={handlePass} variant="secondary" size="lg" className={cn("w-full sm:flex-1 font-black uppercase shadow-md h-12 sm:h-14 rounded-xl", isFullscreen && "h-16 text-xl")}>
                        <SkipForward className="mr-2 h-5 w-5"/>
                        Pass
                    </Button>
                 </div>
            </div>
          </div>
        )}
        {gameState === 'finished' && (
            <div className="flex flex-col items-center gap-6 sm:gap-8 animate-in zoom-in duration-500 py-6 max-w-lg w-full text-center">
                <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-32 w-32" : "h-20 w-20 sm:h-24 sm:w-24")} />
                <div className="space-y-2">
                    <h2 className={cn("font-black uppercase tracking-tight text-foreground", isFullscreen ? "text-4xl sm:text-5xl" : "text-2xl sm:text-4xl")}>Analysis Complete!</h2>
                    <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-2xl")}>Final Score: {score} / {BOX_COUNT}</p>
                </div>
                 <div className={cn("w-full p-4 sm:p-6 bg-card/50 rounded-2xl border-2 border-primary/20 text-left")}>
                    <h3 className="font-black uppercase tracking-wider text-muted-foreground mb-3 text-xs sm:text-sm">Missed Phonemes:</h3>
                    {boxes.filter(b => b.correct === false).length === 0 ? (
                      <p className="text-sm text-green-500 font-bold">Perfect score! No missed words.</p>
                    ) : (
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-bold text-xs sm:text-sm">
                          {boxes.filter(b => b.correct === false).map(b => <li key={b.id} className="text-destructive truncate">• {b.word}</li>)}
                      </ul>
                    )}
                </div>
                <Button onClick={handleStartGame} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg h-12 sm:h-14 px-8 rounded-2xl">
                    <Repeat className="mr-2 h-5 w-5" />
                    Re-Initialize
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
          <Link href="/games">Exit Game</Link>
        </Button>
        {gameState !== 'idle' && gameState !== 'instructions' && (
          <Button variant="secondary" onClick={resetGame} className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Sequence
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
