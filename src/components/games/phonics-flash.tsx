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
import { Loader2, Sparkles, Repeat, Timer, Check, X, HelpCircle, RotateCcw, SkipForward, Maximize, Minimize } from "lucide-react";
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
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Identify words by their phonics sound!</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Initialize Game
            </Button>
          </div>
        )}
        {gameState === 'instructions' && (
          <div className={cn(
              "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
              isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
          )}>
            <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
            <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
              <p>1. A specific phonics sound (e.g., 'sh', 'ch') will be your target.</p>
              <p>2. A contextual hint will appear. Guess the word containing the target sound.</p>
              <p>3. You have {TIME_PER_BOX} seconds per word. Type and submit quickly!</p>
            </div>
            <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>Initialize Scan</Button>
          </div>
        )}
        {gameState === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Loading phonetic tokens...</p>
            </div>
        )}
        {gameState === 'playing' && boxes.length > 0 && (
          <div className="w-full flex flex-col items-center gap-8 max-w-5xl">
             <div className={cn("w-full flex justify-between items-center bg-muted/20 backdrop-blur-sm p-4 rounded-3xl border-4 border-primary/20", isFullscreen && "p-8")}>
                <p className={cn("font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Score: <span className="text-primary">{score} / {BOX_COUNT}</span></p>
                <p className={cn("font-black text-primary uppercase italic", isFullscreen ? "text-[5vw]" : "text-3xl")}>Sound: "{phonicsSound}"</p>
                <div className="flex items-center gap-3">
                    <Timer className={cn(isFullscreen ? "h-10 w-10" : "h-6 w-6")}/>
                    <span className={cn("font-mono font-black", isFullscreen ? "text-4xl" : "text-2xl")}>{timeLeft}s</span>
                </div>
            </div>

            <div className={cn("grid grid-cols-5 sm:grid-cols-10 gap-3", isFullscreen && "gap-6")}>
                {boxes.map((box, index) => (
                    <div key={box.id} className={cn(
                        "flex items-center justify-center rounded-2xl border-4 transition-all duration-300 shadow-lg",
                        isFullscreen ? "h-16 w-16" : "h-10 w-10",
                        index === currentBoxIndex ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-110" : "border-border",
                        box.revealed && box.correct === true && "bg-green-500 border-green-400 text-white",
                        box.revealed && box.correct === false && "bg-red-500 border-red-400 text-white",
                    )}>
                        {box.revealed ? (box.correct ? <Check className="h-6 w-6"/> : <X className="h-6 w-6"/>) : <span className="text-xs font-bold opacity-50">{index + 1}</span>}
                    </div>
                ))}
            </div>
            
            <div className="w-full max-w-3xl space-y-8">
                <div className={cn("flex items-center gap-4 p-8 bg-muted/20 backdrop-blur-sm rounded-3xl border-4 border-dashed border-primary/30 shadow-inner", isFullscreen && "p-12")}>
                    <HelpCircle className={cn("text-primary shrink-0", isFullscreen ? "h-12 w-12" : "h-8 w-8")}/>
                    <p className={cn("font-bold italic text-left", isFullscreen ? "text-4xl" : "text-xl")}>{boxes[currentBoxIndex]?.hint}</p>
                </div>
                <Input
                    type="text"
                    placeholder="Identify word..."
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                    className={cn("text-center font-black uppercase tracking-widest bg-card border-4", isFullscreen ? "h-24 text-[4vw] rounded-3xl" : "h-16 text-2xl")}
                    autoFocus
                    spellCheck="false"
                />
                 <div className="flex gap-4 w-full">
                    <Button onClick={handleGuess} size="lg" className={cn("flex-1 font-black uppercase shadow-xl", isFullscreen && "h-20 text-3xl rounded-2xl")}>Confirm</Button>
                    <Button onClick={handlePass} variant="secondary" size="lg" className={cn("flex-1 font-black uppercase shadow-xl", isFullscreen && "h-20 text-3xl rounded-2xl")}>
                        <SkipForward className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-6 w-6")}/>
                        Pass
                    </Button>
                 </div>
            </div>
          </div>
        )}
        {gameState === 'finished' && (
            <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
                <div className="space-y-2">
                    <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Analysis Complete!</h2>
                    <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>Final Score: {score} / {BOX_COUNT}</p>
                </div>
                 <div className={cn("w-full max-w-lg p-8 bg-card/50 rounded-3xl border-4 border-primary/20", isFullscreen && "max-w-2xl")}>
                    <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Missed Phonemes:</h3>
                    <ul className={cn("grid grid-cols-2 gap-x-8 gap-y-2 text-left font-bold", isFullscreen ? "text-2xl" : "text-base")}>
                        {boxes.filter(b => b.correct === false).map(b => <li key={b.id} className="text-destructive">• {b.word}</li>)}
                    </ul>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Re-Initialize
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Abort Mission</Link>
        </Button>
        {gameState !== 'idle' && gameState !== 'instructions' && (
          <Button variant="secondary" onClick={resetGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}><RotateCcw className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />Reset Sequence</Button>
        )}
      </CardFooter>
    </Card>
  );
}
