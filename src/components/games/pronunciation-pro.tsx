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
  generatePronunciationPhrase,
  evaluatePronunciation,
  type EvaluatePronunciationOutput,
} from "@/ai/flows/generate-pronunciation-exercise";
import { Loader2, Sparkles, Mic, Square, Check, X, Repeat, MicOff, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { useRecorder } from "@/hooks/use-recorder";
import { Progress } from "../ui/progress";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import Link from "next/link";


type GameState = "idle" | "loading" | "ready" | "recording" | "evaluating" | "feedback" | "instructions";

export function PronunciationPro({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [phrase, setPhrase] = React.useState<string | null>(null);
  const [usedPhrases, setUsedPhrases] = React.useState<string[]>([]);
  const [feedback, setFeedback] = React.useState<EvaluatePronunciationOutput | null>(null);
  const [micPermission, setMicPermission] = React.useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { toast } = useToast();
  const game = getGameBySlug(slug);
  const { recording, startRecording, stopRecording } = useRecorder();

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    setGameState("loading");
    setPhrase(null);
    setFeedback(null);
    try {
      const { phrase: newPhrase } = await generatePronunciationPhrase({
        difficulty: game.level,
        usedPhrases: usedPhrases,
      });
      setPhrase(newPhrase);
      setUsedPhrases(prev => [...prev, newPhrase]);
      setGameState("ready");
    } catch (error) {
      console.error("Failed to generate phrase:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
      setGameState("idle");
    }
  };

  const handleStartRecording = async () => {
    const { success } = await startRecording();
    if (success) {
      setGameState("recording");
    } else {
         toast({
            variant: "destructive",
            title: "Microphone Error",
            description: "Could not access the microphone. Please check your browser permissions.",
        });
    }
    setMicPermission(success);
  }

  const handleStopRecording = async () => {
      const audioData = await stopRecording();
      if (phrase && audioData) {
        setGameState("evaluating");
        try {
            const evaluationResult = await evaluatePronunciation({
                phrase,
                audioDataUri: audioData
            });
            setFeedback(evaluationResult);
            setGameState("feedback");
        } catch (error) {
            console.error("Failed to evaluate pronunciation:", error);
            toast({ variant: "destructive", title: "Evaluation Error", description: "Could not evaluate your pronunciation."});
            setGameState("ready");
        }
      }
  };

  const Icon = game.icon;

  const renderWordFeedback = () => {
      if (!feedback) return null;
      return (
          <div className={cn("flex flex-wrap gap-3", isFullscreen ? "text-4xl" : "text-xl")}>
              {feedback.wordFeedback.map(({word, correct}, index) => (
                  <span key={`${word}-${index}`} className={cn("flex items-center gap-2 rounded-2xl px-4 py-2 border-2", correct ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200")}>
                      {word}
                      {correct ? <Check className={cn(isFullscreen ? "h-8 w-8" : "h-4 w-4")} /> : <X className={cn(isFullscreen ? "h-8 w-8" : "h-4 w-4")} />}
                  </span>
              ))}
          </div>
      )
  }

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
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[20rem] p-6"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to perfect your accent?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Session
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
                    <p>1. A target phrase will be presented on the screen.</p>
                    <p>2. Record yourself speaking the phrase clearly.</p>
                    <p>3. AI analysis will provide real-time accuracy scoring and phonetic feedback.</p>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Initialize Mic</Button>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Calibrating voice sensors...</p>
            </div>
        )}
        
        {(gameState === "ready" || gameState === "recording") && phrase && (
            <div className="flex flex-col items-center gap-10 w-full max-w-5xl">
                <p className={cn("font-black uppercase tracking-widest text-muted-foreground", isFullscreen ? "text-3xl" : "text-sm")}>Vocalize the following:</p>
                <div className={cn(
                    "font-black p-12 bg-muted/20 backdrop-blur-sm rounded-[3rem] border-4 border-primary shadow-xl w-full",
                    isFullscreen ? "text-[6vw] leading-tight" : "text-3xl"
                )}>
                    "{phrase}"
                </div>
                {micPermission === false && (
                    <Alert variant="destructive" className="max-w-md">
                        <MicOff className="h-4 w-4" />
                        <AlertTitle>Microphone Access Denied</AlertTitle>
                        <AlertDescription>
                            Please enable microphone permissions in your browser settings to continue.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex justify-center mt-4">
                    {gameState === "ready" ? (
                        <Button onClick={handleStartRecording} size="lg" className={cn("bg-green-600 hover:bg-green-700 text-white font-black shadow-xl", isFullscreen ? "h-24 px-16 text-3xl rounded-3xl" : "h-16 px-8")}>
                            <Mic className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-6 w-6")} /> Start Recording
                        </Button>
                    ) : (
                        <Button onClick={handleStopRecording} size="lg" variant="destructive" className={cn("font-black shadow-xl animate-pulse", isFullscreen ? "h-24 px-16 text-3xl rounded-3xl" : "h-16 px-8")}>
                            <Square className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-6 w-6")} /> Stop Recording
                        </Button>
                    )}
                </div>
            </div>
        )}
        {gameState === "evaluating" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Running deep vocal analysis...</p>
            </div>
        )}

        {gameState === "feedback" && feedback && (
            <div className={cn("w-full space-y-10 text-left max-w-5xl mx-auto", isFullscreen && "p-8")}>
                <h3 className={cn("font-black uppercase tracking-widest text-center", isFullscreen ? "text-4xl" : "text-xl")}>Debriefing Report</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <p className={cn("font-black uppercase tracking-widest text-muted-foreground", isFullscreen ? "text-2xl" : "text-xs")}>Accuracy Intel</p>
                        <p className={cn("font-black text-primary", isFullscreen ? "text-6xl" : "text-3xl")}>{feedback.score}%</p>
                    </div>
                    <Progress value={feedback.score} className={cn("h-4", isFullscreen && "h-8")} />
                </div>
                
                <div className={cn("grid gap-6", isFullscreen ? "grid-cols-1" : "grid-cols-1")}>
                    <div className={cn("p-8 rounded-3xl bg-muted/20 border-4 border-primary/20", isFullscreen && "p-12")}>
                        <h4 className={cn("font-black uppercase tracking-widest text-primary mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Word Analysis:</h4>
                        {renderWordFeedback()}
                    </div>
                    <div className={cn("p-8 rounded-3xl bg-card shadow-inner border-2 border-border/20", isFullscreen && "p-12")}>
                        <h4 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Coach's Intel:</h4>
                        <p className={cn("font-bold italic text-foreground leading-relaxed", isFullscreen ? "text-3xl" : "text-lg")}>"{feedback.feedback}"</p>
                    </div>
                </div>
            </div>
        )}

      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
         <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Abort Mission</Link>
        </Button>
        {gameState === 'feedback' && (
            <Button onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
                <Repeat className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} /> Try Another Target
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}