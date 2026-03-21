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
import { Loader2, Sparkles, Send, Bot, Timer, Repeat, CheckCircle, Maximize, Minimize } from "lucide-react";
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
    
    const newStoryChain = [...storyChain, { player: "Human", sentence: userSentence }];
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
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-6">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Collaborate with AI to craft a legend!</p>
                <div className={cn("w-full max-w-xs space-y-2", isFullscreen && "max-w-md")}>
                    <label className={cn("font-bold uppercase tracking-widest", isFullscreen ? "text-xl" : "text-sm")}>Select Genre</label>
                     <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger className={cn(isFullscreen && "h-16 text-xl")}><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Start Story
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
                    <p>1. The AI provides the opening scene.</p>
                    <p>2. Take turns adding one sentence each to the chain.</p>
                    <p>3. Keep the flow consistent until the timer expires.</p>
                    <p>4. Get a final grammar and narrative coherence score.</p>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Begin Narrative</Button>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-lg")}>Forging original beginning...</p>
            </div>
        )}
        {(gameState === "playing" || gameState === "scoring" || gameState === "finished") && (
            <div className="w-full h-full text-left flex flex-col gap-6 max-w-5xl mx-auto">
                { (gameState === 'playing') &&
                    <div className="flex items-center gap-4">
                        <Timer className={cn("text-primary", isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                        <Progress value={(timeLeft / GAME_TIME_SECONDS) * 100} className={cn("flex-grow h-4", isFullscreen && "h-6")} />
                        <span className={cn("font-mono font-black", isFullscreen ? "text-3xl" : "text-sm")}>{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
                    </div>
                }

                <div ref={storyContainerRef} className={cn(
                    "flex-grow overflow-y-auto p-8 bg-muted/20 backdrop-blur-sm rounded-[2rem] border-4 border-primary/10 space-y-6 shadow-inner",
                    isFullscreen ? "h-[50vh]" : "h-64 max-h-96"
                )}>
                    {storyChain.map((turn, index) => (
                        <div key={index} className={cn("flex items-start gap-4", {"justify-end": turn.player === 'Human'})}>
                            {turn.player === 'AI' && <div className={cn("flex-shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center", isFullscreen ? "w-12 h-12" : "w-8 h-8")}><Bot className={isFullscreen ? "w-8 h-8" : "w-5 h-5"}/></div>}
                            <p className={cn(
                                "max-w-[80%] p-4 rounded-2xl shadow-md leading-relaxed",
                                turn.player === 'AI' ? "bg-card text-foreground" : "bg-primary text-primary-foreground font-bold",
                                isFullscreen ? "text-2xl p-6" : "text-base"
                            )}>
                                {turn.sentence}
                            </p>
                        </div>
                    ))}
                     {isAiTurn && (
                        <div className="flex items-start gap-4">
                            <div className={cn("flex-shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center", isFullscreen ? "w-12 h-12" : "w-8 h-8")}><Bot className={isFullscreen ? "w-8 h-8" : "w-5 h-5"}/></div>
                            <div className="max-w-prose p-4 rounded-2xl bg-card border flex items-center">
                                <Loader2 className="w-5 h-5 animate-spin"/>
                            </div>
                        </div>
                    )}
                </div>

                {(gameState === 'scoring' || gameState === 'finished') && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                         {gameState === 'scoring' && (
                             <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                 <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-12 w-12" : "h-8 w-8")} />
                                 <p className={cn("font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-lg")}>Running linguistic audit...</p>
                             </div>
                         )}
                         {gameState === 'finished' && score && (
                             <Alert className={cn("border-4 rounded-[2rem] shadow-2xl bg-primary/10 border-primary/30", isFullscreen && "p-12")}>
                                <CheckCircle className={cn("text-primary", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />
                                <AlertTitle className={cn("font-black uppercase tracking-tighter", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>Mission Debriefing</AlertTitle>
                                <AlertDescription className={cn("space-y-4", isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                                    <div className="flex items-center gap-4">
                                        <p className="font-bold text-muted-foreground">Grammar Integrity:</p>
                                        <p className="font-black text-3xl text-primary">{score.score}%</p>
                                    </div>
                                    <p className="italic text-foreground/80">"{score.feedback}"</p>
                                </AlertDescription>
                            </Alert>
                         )}
                    </div>
                )}
                
                {gameState === 'playing' && (
                     <div className={cn("flex gap-4 items-end", isFullscreen && "mt-4")}>
                        <Textarea 
                            value={userSentence}
                            onChange={(e) => setUserSentence(e.target.value)}
                            placeholder="Forge the next sentence..."
                            className={cn(
                                "flex-grow bg-card border-4 focus-visible:ring-primary rounded-2xl shadow-inner",
                                isFullscreen ? "text-2xl p-6 min-h-[100px]" : "p-4 min-h-[60px]"
                            )}
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
                            className={cn("shadow-xl h-auto aspect-square", isFullscreen ? "w-24 p-0 rounded-3xl" : "w-16 p-0 rounded-2xl")}
                        >
                            <Send className={cn(isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                        </Button>
                    </div>
                )}
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== 'idle' && gameState !== 'instructions' && (
            <Button variant="secondary" onClick={() => setGameState('idle')} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}><Repeat className="mr-2"/>Reset Narrative</Button>
        )}
      </CardFooter>
    </Card>
  );
}