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
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[20rem] p-6"
      )}>
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to test your collective memory?</p>
                <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>Initialize</Button>
            </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. <strong>Runners:</strong> Memorize the sentence that will flash on screen.</p>
                    <p>2. <strong>Writers:</strong> Type exactly what the runners tell you.</p>
                    <p>3. Accuracy is everything. Every comma and capital counts!</p>
                </div>
                <div className="self-center mt-8">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Choose Mission Level</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {["beginner", "intermediate", "advanced"].map(level => (
                            <Button key={level} onClick={() => handleStartMemorizing(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>{level}</Button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Encrypting mission data...</p>
            </div>
        )}
        {gameState === "memorizing" && sentence && (
            <div className="flex flex-col items-center gap-8 w-full max-w-5xl">
                <div className="flex items-center gap-4 text-primary bg-primary/10 px-8 py-4 rounded-full border-4 border-primary/20">
                    <Timer className={cn(isFullscreen ? "h-12 w-12" : "h-6 w-6")}/>
                    <p className={cn("font-black", isFullscreen ? "text-4xl" : "text-xl")}>MEMORIZE: {timeLeft}s</p>
                </div>
                <div className={cn(
                    "font-black p-12 bg-muted/20 backdrop-blur-sm rounded-[3rem] border-4 border-primary shadow-xl w-full",
                    isFullscreen ? "text-[5.5vw] leading-tight" : "text-3xl"
                )}>
                    {sentence}
                </div>
            </div>
        )}
        {(gameState === "writing" || gameState === "finished") && (
            <div className="w-full space-y-8 text-left max-w-5xl mx-auto">
                <p className={cn("font-black text-muted-foreground uppercase tracking-widest", isFullscreen ? "text-4xl mb-10" : "text-xs")}>
                    {gameState === 'writing' ? 'The window has closed! Transcribe the sentence:' : 'Mission debrief:'}
                </p>
                <Textarea 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className={cn(
                        "font-black bg-muted/20 backdrop-blur-sm rounded-[2rem] border-4 focus-visible:ring-primary shadow-inner transition-all",
                        isFullscreen 
                          ? "text-[5vw] p-12 min-h-[350px] text-center leading-tight flex items-center justify-center" 
                          : "text-2xl p-6 min-h-[150px]"
                    )}
                    disabled={gameState === "finished"}
                    placeholder="Type the memorized sentence here..."
                    spellCheck="false"
                />
                {renderFeedback()}
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'writing' && <Button onClick={handleCheckAnswer} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>Check Transcript</Button>}
            {gameState === 'finished' && <Button onClick={handleNext} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}><Repeat className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />Next Sentence</Button>}
            {(gameState === 'memorizing' || gameState === 'writing') && <Button onClick={handleNext} variant="secondary" size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}><Repeat className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />Skip</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
