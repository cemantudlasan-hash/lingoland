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
import { Loader2, Sparkles, Repeat, Trophy, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GameState = "idle" | "spinning" | "result" | "instructions";

const verbs = [
  "travel", "learn", "read", "write", "cook", "sing",
  "dance", "play", "run", "swim", "paint", "explore",
  "eat", "drink", "sleep", "work", "study", "watch",
  "listen", "drive", "walk", "help", "visit", "buy",
  "sell", "draw", "clean", "organize", "start", "finish",
  "create", "build", "design", "invent", "discover", "dream",
];

const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766",
  "#9B5DE5", "#F15BB5", "#00F5D4", "#00BBF9",
  "#FEE440", "#F3722C", "#F94144", "#90BE6D",
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766",
  "#9B5DE5", "#F15BB5", "#00F5D4", "#00BBF9",
  "#FEE440", "#F3722C", "#F94144", "#90BE6D",
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766",
  "#9B5DE5", "#F15BB5", "#00F5D4", "#00BBF9",
  "#FEE440", "#F3722C", "#F94144", "#90BE6D",
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766",
];

export function WheelOfFortune({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [result, setResult] = React.useState<string | null>(null);
  const [rotation, setRotation] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleSpin = () => {
    setGameState("spinning");
    setResult(null);

    const spinCycles = 5;
    const segmentAngle = 360 / verbs.length;
    const randomSegmentIndex = Math.floor(Math.random() * verbs.length);
    const targetAngle = (randomSegmentIndex * segmentAngle) + (segmentAngle / 2);
    const newRotation = (spinCycles * 360) - targetAngle + rotation;
    setRotation(newRotation);

    setTimeout(() => {
      setResult(verbs[randomSegmentIndex]);
      setGameState("result");
    }, 4000);
  };

  const resetGame = () => {
    setGameState("idle");
    setResult(null);
  };
  
  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      <style jsx>{`
        .wheel-container {
          position: relative;
          width: var(--wheel-size, 300px);
          height: var(--wheel-size, 300px);
          border-radius: 50%;
          overflow: hidden;
          margin: 2rem auto;
          border: 8px solid white;
          box-shadow: 0 0 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.2);
        }
        .wheel {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          transition: transform 4s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .segment {
          position: absolute;
          width: 50%;
          height: 50%;
          top: 50%;
          left: 50%;
          transform-origin: 0 0;
          clip-path: polygon(0 0, 100% 0, 100% 10%, 50% 100%, 10% 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .segment-label {
          transform: rotate(292.5deg) translate(-5px, calc(var(--wheel-size, 300px) / 6));
          font-weight: 900;
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: calc(var(--wheel-size, 300px) / 25);
          text-transform: uppercase;
        }
        .pointer {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 25px solid transparent;
          border-right: 25px solid transparent;
          border-top: 40px solid hsl(var(--primary));
          z-index: 50;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }
      `}</style>
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
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[28rem] p-6"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Spin for high-stakes future tense practice!</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Game
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
                    <p>1. Initiate the spin to select a target verb.</p>
                    <p>2. Construct a sentence in the future tense (e.g., "I <strong>will</strong> [verb]").</p>
                    <p>3. Articulate your response clearly to gain points!</p>
                </div>
                <Button onClick={handleSpin} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Initialize Spin</Button>
            </div>
        )}
        {(gameState === "spinning" || gameState === "result") && (
          <div className="flex flex-col items-center gap-10 w-full">
            <div className="relative" style={{ '--wheel-size': isFullscreen ? 'min(70vh, 600px)' : '300px' } as any}>
              <div className="pointer"></div>
              <div className="wheel-container">
                <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
                  {verbs.map((verb, index) => {
                    const angle = (360 / verbs.length) * index;
                    return (
                      <div
                        key={verb}
                        className="segment"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          backgroundColor: colors[index % colors.length],
                        }}
                      >
                        <span className="segment-label">{verb}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {gameState === 'spinning' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-10 w-10")} />
                    <p className={cn("font-black uppercase tracking-widest animate-pulse", isFullscreen ? "text-2xl" : "text-sm")}>Randomizing results...</p>
                </div>
            )}
            
            {gameState === 'result' && result && (
                <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500 w-full max-w-4xl">
                    <div className={cn("p-8 rounded-3xl bg-primary/10 border-4 border-primary shadow-2xl w-full", isFullscreen && "p-12")}>
                      <p className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-3xl" : "text-sm")}>Target Verb Identified:</p>
                      <p className={cn("font-black text-primary uppercase italic leading-none", isFullscreen ? "text-[10vw]" : "text-6xl")}>{result}</p>
                    </div>
                    <div className="space-y-4">
                        <p className={cn("font-bold text-muted-foreground uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Challenge:</p>
                        <p className={cn("font-black leading-tight", isFullscreen ? "text-5xl" : "text-2xl")}>
                          Construct: "I <span className="text-primary italic">will {result}</span> tonight."
                        </p>
                    </div>
                    <Button onClick={handleSpin} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                        <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                        Re-Spin
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
        {(gameState === 'spinning' || gameState === 'result') && (
            <Button variant="secondary" onClick={resetGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Abort Mission</Button>
        )}
      </CardFooter>
    </Card>
  );
}