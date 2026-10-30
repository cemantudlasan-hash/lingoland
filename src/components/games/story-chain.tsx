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
import { generateStoryPrompt } from "@/ai/flows/generate-story-prompt";
import { continueStoryChain } from "@/ai/flows/continue-story-chain";
import { scoreStoryGrammar } from "@/ai/flows/score-story-grammar";
import type { ScoreStoryGrammarOutput } from "@/ai/flows/score-story-grammar";
import { Loader2, Sparkles,
  ArrowLeft,
  XOctagon, Send, Bot, Timer, Repeat, CheckCircle, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "scoring" | "finished" | "instructions";
type Player = "Human" | "AI";
type StoryTurn = {
  player: Player;
  sentence: string;
};

const GAME_TIME_SECONDS = 120;
const GENRES = ["Fantasy", "Sci-Fi", "Mystery", "Comedy", "Adventure"];

export function StoryChain({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [genre, setGenre] = React.useState<string>(GENRES[0]);
  const [storyChain, setStoryChain] = React.useState<StoryTurn[]>([]);
  const [userSentence, setUserSentence] = React.useState("");
  const [isAiTurn, setIsAiTurn] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(GAME_TIME_SECONDS);
  const [score, setScore] = React.useState<ScoreStoryGrammarOutput | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const game = getGameBySlug(slug);
  const storyContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const cleanUpTimer = () => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
  }

  React.useEffect(() => {
    return () => cleanUpTimer();
  }, []);

  React.useEffect(() => {
    if (storyContainerRef.current) {
        storyContainerRef.current.scrollTop = storyContainerRef.current.scrollHeight;
    }
  }, [storyChain]);
  
  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      handleTimeUp();
    }
  }, [gameState, timeLeft]);


  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    setGameState("loading");
    setStoryChain([]);
    setUserSentence("");
    setScore(null);
    try {
      const { prompt } = await generateStoryPrompt({ genre });
      setStoryChain([{ player: "AI", sentence: prompt }]);
      setTimeLeft(GAME_TIME_SECONDS);
      setGameState("playing");
    } catch (error) {
      console.error("Failed to start game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new story. Please try again.",
      });
      setGameState("idle");
    }
  };
  
  const handleAiTurn = async (currentStory: string) => {
    setIsAiTurn(true);
    try {
        const { nextSentence } = await continueStoryChain({ story: currentStory, genre });
        if (gameState === "playing") {
            setStoryChain(prev => [...prev, { player: "AI", sentence: nextSentence }]);
        }
    } catch (error) {
         toast({ variant: "destructive", title: "AI Error", description: "The AI is taking a nap." });
    } finally {
        setIsAiTurn(false);
    }
  };

  const handleAddSentence = async () => {
    if (!userSentence.trim() || isAiTurn || gameState !== 'playing') return;
    
    const newStoryChain: StoryTurn[] = [...storyChain, { player: "Human", sentence: userSentence }];
    setStoryChain(newStoryChain);
    setUserSentence("");

    const fullStory = newStoryChain.map(s => s.sentence).join(" ");
    await handleAiTurn(fullStory);
  };
  
  const handleTimeUp = async () => {
    cleanUpTimer();
    setGameState("scoring");
    const fullStory = storyChain.map(s => s.sentence).join(" ");
    
    try {
        const result = await scoreStoryGrammar({ story: fullStory });
        setScore(result);
    } catch (e) {
        setScore({ score: 0, feedback: "Failed to score story."});
    } finally {
        setGameState("finished");
    }
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
        <CardDescription className="text-xs sm:text-sm md:text-base max-w-xl mx-auto">{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto overflow-x-hidden custom-scrollbar">
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
                <p className="text-sm sm:text-base text-muted-foreground">Collaborate with AI to craft an epic story, sentence by sentence!</p>
                <div className="w-full space-y-2 text-left">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Genre</label>
                     <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setGameState('instructions')} className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg rounded-xl">
                    <Sparkles className="mr-2 h-5 w-5" /> Start Story
                </Button>
            </div>
        )}
        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full">
                <h3 className="font-bold text-lg sm:text-2xl text-center">How to Play</h3>
                <div className="text-left space-y-3 text-xs sm:text-base text-muted-foreground">
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">1.</span> The AI provides the opening sentence.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">2.</span> Take turns adding one sentence each to continue the story.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">3.</span> Keep the narrative going until the timer expires.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-primary">4.</span> Receive a grammar and narrative score when finished!</p>
                </div>
                <Button onClick={handleStartGame} className="w-full sm:w-auto mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 px-8 rounded-xl shadow-lg">Begin Narrative</Button>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-14 sm:h-14" />
                <p className="text-muted-foreground animate-pulse font-black uppercase tracking-wider text-xs sm:text-sm">Forging original beginning...</p>
            </div>
        )}
        {(gameState === "playing" || gameState === "scoring" || gameState === "finished") && (
            <div className="w-full h-full text-left flex flex-col gap-4 max-w-3xl mx-auto">
                { (gameState === 'playing') &&
                    <div className="flex items-center gap-3">
                        <Timer className="text-primary h-5 w-5 shrink-0" />
                        <Progress value={(timeLeft / GAME_TIME_SECONDS) * 100} className="flex-grow h-2.5 rounded-full" />
                        <span className="font-mono font-black text-xs sm:text-sm">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
                    </div>
                }

                <div ref={storyContainerRef} className="flex-grow overflow-y-auto p-4 sm:p-6 bg-muted/20 backdrop-blur-sm rounded-2xl border-2 border-primary/10 space-y-3 shadow-inner h-64 sm:h-80 max-h-96">
                    {storyChain.map((turn, index) => (
                        <div key={index} className={cn("flex items-start gap-2.5", {"justify-end": turn.player === 'Human'})}>
                            {turn.player === 'AI' && <div className="flex-shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 mt-1"><Bot className="w-4 h-4"/></div>}
                            <div className={cn(
                                "max-w-[85%] p-3 sm:p-4 rounded-2xl shadow-sm text-xs sm:text-sm md:text-base leading-relaxed break-words",
                                turn.player === 'AI' ? "bg-card text-foreground border" : "bg-primary text-primary-foreground font-medium"
                            )}>
                                {turn.sentence}
                            </div>
                        </div>
                    ))}
                     {isAiTurn && (
                        <div className="flex items-start gap-2.5">
                            <div className="flex-shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8"><Bot className="w-4 h-4"/></div>
                            <div className="p-3 rounded-2xl bg-card border flex items-center">
                                <Loader2 className="w-4 h-4 animate-spin text-primary"/>
                            </div>
                        </div>
                    )}
                </div>

                {(gameState === 'scoring' || gameState === 'finished') && (
                    <div className="space-y-4 animate-in fade-in">
                         {gameState === 'scoring' && (
                             <div className="flex flex-col items-center gap-3 text-muted-foreground text-center">
                                 <Loader2 className="animate-spin text-primary h-8 w-8" />
                                 <p className="font-black uppercase tracking-wider text-xs sm:text-sm">Running linguistic audit...</p>
                             </div>
                         )}
                         {gameState === 'finished' && score && (
                             <Alert className="border-2 rounded-2xl shadow-xl bg-primary/10 border-primary/30 p-4 sm:p-6">
                                <CheckCircle className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                                <AlertTitle className="font-black uppercase tracking-tight text-base sm:text-xl mb-2">Narrative Debriefing</AlertTitle>
                                <AlertDescription className="space-y-2 text-xs sm:text-base">
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-muted-foreground">Grammar Integrity:</p>
                                        <p className="font-black text-2xl text-primary">{score.score}%</p>
                                    </div>
                                    <p className="italic text-foreground/80">"{score.feedback}"</p>
                                </AlertDescription>
                            </Alert>
                         )}
                    </div>
                )}
                
                {gameState === 'playing' && (
                     <div className="flex gap-2 sm:gap-3 items-end">
                        <Textarea 
                            value={userSentence}
                            onChange={(e) => setUserSentence(e.target.value)}
                            placeholder="Write the next sentence..."
                            className="flex-grow bg-card border-2 focus-visible:ring-primary rounded-xl p-3 min-h-[50px] sm:min-h-[60px] text-xs sm:text-base"
                            disabled={isAiTurn}
                            onKeyDown={(e) => {
                                if(e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddSentence();
                                }
                            }}
                        />
                        <Button 
                            onClick={handleAddSentence} 
                            disabled={isAiTurn || !userSentence.trim()}
                            className="h-11 sm:h-12 w-11 sm:w-12 rounded-xl shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== 'idle' && gameState !== 'instructions' && (
            <Button variant="secondary" onClick={() => setGameState('idle')} className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold"><Repeat className="mr-2 h-4 w-4"/>Reset Story</Button>
        )}
      </CardFooter>
    </Card>
  );
}