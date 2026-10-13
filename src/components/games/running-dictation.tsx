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
  generateDictationSentence,
} from "@/ai/flows/generate-dictation-sentence";
import { Loader2, Sparkles, Timer, CheckCircle, XCircle, Eye, RotateCcw, Repeat, Maximize, Minimize } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GameState = "idle" | "loading" | "memorizing" | "writing" | "finished" | "instructions";

const getMemorizeTime = (difficulty: SkillLevel) => {
  switch (difficulty) {
    case 'advanced':
      return 10;
    case 'intermediate':
      return 15;
    case 'beginner':
    default:
      return 20;
  }
};

export function RunningDictation({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [sentence, setSentence] = React.useState<string | null>(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [difficulty, setDifficulty] = React.useState<SkillLevel>('intermediate');
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [usedSentences, setUsedSentences] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartMemorizing = async (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    setSentence(null);
    setUserAnswer("");
    setIsCorrect(null);
    try {
      const { sentence: newSentence } = await generateDictationSentence({
        difficulty: level,
        usedSentences: usedSentences,
      });
      setSentence(newSentence);
      setUsedSentences(prev => [...prev, newSentence]);
      setTimeLeft(getMemorizeTime(level));
      setGameState("memorizing");
    } catch (error) {
      console.error("Failed to generate sentence:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start the game. Please try again.",
      });
      setGameState("idle");
    }
  };

  React.useEffect(() => {
    if (gameState === "memorizing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === "memorizing" && timeLeft === 0) {
      setGameState("writing");
    }
    return () => clearTimeout(timerRef.current!);
  }, [gameState, timeLeft]);


  const handleCheckAnswer = () => {
    if (!sentence) return;
    const normalizedUserAnswer = userAnswer.trim().replace(/[.,!?]/g, '').toLowerCase();
    const normalizedCorrectAnswer = sentence.trim().replace(/[.,!?]/g, '').toLowerCase();
    
    setIsCorrect(normalizedUserAnswer === normalizedCorrectAnswer);
    setGameState("finished");
  };

  const handleNext = () => {
    handleStartMemorizing(difficulty);
  }

  const renderFeedback = () => {
    if (gameState !== "finished" || isCorrect === null) return null;

    return (
      <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
          "border-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4",
          isFullscreen ? "p-12 mt-12" : "mt-6",
          isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
      )}>
        {isCorrect ? <CheckCircle className={cn("text-green-500", isFullscreen ? "h-12 w-12" : "h-6 w-6")} /> : <XCircle className={cn("text-red-500", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
        <AlertTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>
            {isCorrect ? "MEMORY MASTER!" : "DECODING ERROR!"}
        </AlertTitle>
        <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
            {isCorrect ? "You remembered the sentence perfectly." : (
                <div className="space-y-4">
                    <p>The correct sentence was:</p>
                    <p className="font-bold text-xl italic">"{sentence}"</p>
                </div>
            )}
        </AlertDescription>
      </Alert>
    );
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
            <Badge variant="outline" className={cn("text-xs sm:text-sm px-3 py-0.5", isFullscreen && "text-base px-4 py-1")}>{difficulty.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md text-center py-6">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base")}>Ready to test your collective memory?</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl shadow-lg", isFullscreen && "h-16 px-10 text-xl")}>
                    <Sparkles className="mr-2 h-5 w-5" /> Start Mission
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
                    <p>1. <strong>Runners:</strong> Memorize the sentence that will flash on screen.</p>
                    <p>2. <strong>Writers:</strong> Type exactly what the runners tell you.</p>
                    <p>3. Accuracy is everything. Every comma and capital counts!</p>
                </div>
                <div className="self-center mt-6 w-full">
                    <p className="text-muted-foreground font-black uppercase tracking-wider text-center mb-3 text-xs sm:text-sm">Choose Mission Level</p>
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center w-full">
                        {["beginner", "intermediate", "advanced"].map(level => (
                            <Button key={level} onClick={() => handleStartMemorizing(level as SkillLevel)} size="lg" variant="outline" className="flex-1 font-black uppercase h-12 sm:h-14 rounded-xl border-2 hover:bg-primary/10 text-xs sm:text-sm">{level}</Button>
                        ))}
                    </div>
                </div>
                <Button variant="ghost" onClick={() => setGameState('idle')} className="mt-2 text-xs">Back</Button>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-10 w-10 sm:h-12 sm:w-12")} />
                <p className={cn("text-muted-foreground animate-pulse text-sm sm:text-base", isFullscreen && "text-xl")}>Encrypting mission data...</p>
            </div>
        )}
        {gameState === "memorizing" && sentence && (
            <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-3xl">
                <div className="flex items-center gap-3 text-primary bg-primary/10 px-6 py-3 rounded-full border-2 border-primary/20">
                    <Timer className="h-5 w-5 sm:h-6 sm:w-6"/>
                    <p className="font-black text-sm sm:text-lg">MEMORIZE: {timeLeft}s</p>
                </div>
                <div className={cn(
                    "font-bold p-6 sm:p-10 bg-muted/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-primary shadow-lg w-full text-center text-lg sm:text-2xl md:text-3xl leading-snug",
                    isFullscreen && "text-2xl sm:text-4xl"
                )}>
                    "{sentence}"
                </div>
            </div>
        )}
        {(gameState === "writing" || gameState === "finished") && (
            <div className="w-full space-y-4 sm:space-y-6 text-left max-w-3xl mx-auto">
                <p className="font-black text-muted-foreground uppercase tracking-wider text-xs sm:text-sm">
                    {gameState === 'writing' ? 'The window has closed! Transcribe the sentence:' : 'Mission debrief:'}
                </p>
                <Textarea 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="font-bold bg-muted/20 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 focus-visible:ring-primary shadow-inner text-base sm:text-xl p-4 sm:p-6 min-h-[120px] sm:min-h-[160px]"
                    disabled={gameState === "finished"}
                    placeholder="Type the memorized sentence here..."
                    spellCheck="false"
                />
                {renderFeedback()}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            <Link href="/games">Exit Game</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 w-full sm:w-auto">
            {gameState === 'writing' && <Button onClick={handleCheckAnswer} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md h-11 sm:h-12 px-8 rounded-xl">Check Transcript</Button>}
            {gameState === 'finished' && <Button onClick={handleNext} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md h-11 sm:h-12 px-8 rounded-xl"><Repeat className="mr-2 h-4 w-4" />Next Sentence</Button>}
            {(gameState === 'memorizing' || gameState === 'writing') && <Button onClick={handleNext} variant="secondary" className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold"><Repeat className="mr-2 h-4 w-4" />Skip</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
