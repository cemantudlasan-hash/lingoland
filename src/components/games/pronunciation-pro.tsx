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
            window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
                detail: { state: 'finished' }
            }));
            window.dispatchEvent(new CustomEvent('lingoland_game_answered_hijack'));
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
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md text-center py-6">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base")}>Ready to perfect your accent?</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl shadow-lg", isFullscreen && "h-16 px-10 text-xl")}>
                <Sparkles className="mr-2 h-5 w-5" />
                Start Session
              </Button>
              <Button variant="outline" onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("h-12 sm:h-14 px-6 text-sm sm:text-base rounded-2xl font-bold border-2", isFullscreen && "h-16 px-10 text-xl")}>
                How to Play
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
                    <p>1. A target phrase will be presented on the screen.</p>
                    <p>2. Record yourself speaking the phrase clearly.</p>
                    <p>3. AI analysis will provide real-time accuracy scoring and phonetic feedback.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                  <Button onClick={handleStartGame} size="lg" className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 rounded-xl">Initialize Mic</Button>
                  <Button variant="outline" onClick={() => setGameState('idle')} size="lg" className="h-12 rounded-xl">Back</Button>
                </div>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-10 w-10 sm:h-12 sm:w-12")} />
                <p className={cn("text-muted-foreground animate-pulse text-sm sm:text-base", isFullscreen && "text-xl")}>Calibrating voice sensors...</p>
            </div>
        )}
        
        {(gameState === "ready" || gameState === "recording") && phrase && (
            <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-3xl">
                <p className="font-black uppercase tracking-wider text-muted-foreground text-xs sm:text-sm">Vocalize the following:</p>
                <div className={cn(
                    "font-black p-6 sm:p-10 bg-muted/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-primary shadow-lg w-full text-center text-lg sm:text-2xl md:text-3xl leading-snug",
                    isFullscreen && "text-2xl sm:text-4xl"
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
                <div className="flex justify-center mt-2 w-full max-w-xs">
                    {gameState === "ready" ? (
                        <Button onClick={handleStartRecording} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-black shadow-lg h-12 sm:h-14 text-sm sm:text-base rounded-2xl">
                            <Mic className="mr-2 h-5 w-5" /> Start Recording
                        </Button>
                    ) : (
                        <Button onClick={handleStopRecording} size="lg" variant="destructive" className="w-full font-black shadow-lg animate-pulse h-12 sm:h-14 text-sm sm:text-base rounded-2xl">
                            <Square className="mr-2 h-5 w-5" /> Stop Recording
                        </Button>
                    )}
                </div>
            </div>
        )}
        {gameState === "evaluating" && (
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-12">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-10 w-10 sm:h-12 sm:w-12")} />
                <p className={cn("text-muted-foreground animate-pulse text-sm sm:text-base", isFullscreen && "text-xl")}>Running deep vocal analysis...</p>
            </div>
        )}

        {gameState === "feedback" && feedback && (
            <div className="w-full space-y-6 sm:space-y-8 text-left max-w-3xl mx-auto">
                <h3 className="font-black uppercase tracking-wider text-center text-lg sm:text-xl md:text-2xl">Debriefing Report</h3>
                <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-end">
                        <p className="font-black uppercase tracking-wider text-muted-foreground text-xs sm:text-sm">Accuracy Intel</p>
                        <p className="font-black text-primary text-2xl sm:text-4xl">{feedback.score}%</p>
                    </div>
                    <Progress value={feedback.score} className="h-3 sm:h-4" />
                </div>
                
                <div className="grid gap-4 sm:gap-6 grid-cols-1">
                    <div className="p-4 sm:p-6 rounded-2xl bg-muted/20 border-2 border-primary/20">
                        <h4 className="font-black uppercase tracking-wider text-primary mb-3 text-xs sm:text-sm">Word Analysis:</h4>
                        {renderWordFeedback()}
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-card shadow-inner border border-border/20">
                        <h4 className="font-black uppercase tracking-wider text-muted-foreground mb-2 text-xs sm:text-sm">Coach's Intel:</h4>
                        <p className="font-bold italic text-foreground leading-relaxed text-sm sm:text-base">"{feedback.feedback}"</p>
                    </div>
                </div>
            </div>
        )}

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
         <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            <Link href="/games">Exit Game</Link>
        </Button>
        {gameState === 'feedback' && (
            <Button onClick={handleStartGame} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg h-11 sm:h-12 px-8 rounded-xl">
                <Repeat className="mr-2 h-4 w-4" /> Try Another Target
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}