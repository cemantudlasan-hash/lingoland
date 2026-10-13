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
import { Loader2, Sparkles, Repeat, Trophy, Maximize, Minimize, HelpCircle } from "lucide-react";
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
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
      isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
    )}>
      <style jsx>{`
        .wheel-container {
          position: relative;
          width: var(--wheel-size, 280px);
          height: var(--wheel-size, 280px);
          border-radius: 50%;
          overflow: hidden;
          margin: 1rem auto;
          border: 6px solid white;
          box-shadow: 0 0 30px rgba(0,0,0,0.3), inset 0 0 15px rgba(0,0,0,0.2);
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
          transform: rotate(292.5deg) translate(-4px, calc(var(--wheel-size, 280px) / 6.5));
          font-weight: 900;
          color: white;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: calc(var(--wheel-size, 280px) / 26);
          text-transform: uppercase;
        }
        .pointer {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 18px solid transparent;
          border-right: 18px solid transparent;
          border-top: 32px solid hsl(var(--primary));
          z-index: 50;
          filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
        }
      `}</style>
      <CardHeader className="text-center relative px-4 pt-4 sm:pt-6 pb-2">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 z-20">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setGameState(gameState === "instructions" ? "idle" : "instructions")}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Guide</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
        </div>

        <div className="flex justify-center mb-2">
          <Icon className={cn("text-primary transition-all", isFullscreen ? "w-10 h-10 sm:w-14 sm:h-14" : "w-10 h-10 sm:w-14 sm:h-14")} />
        </div>
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-3xl md:text-4xl")}>
          {game.title}
        </CardTitle>
        <CardDescription className={cn("text-xs sm:text-sm md:text-base max-w-xl mx-auto", isFullscreen && "text-sm sm:text-base")}>
          {game.description}
        </CardDescription>
        <div className="flex justify-center pt-2">
          <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">{game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>

      <CardContent className={cn(
        "flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto",
        isFullscreen ? "min-h-[60vh] max-w-5xl" : "min-h-[24rem]"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto py-6">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base")}>
              Spin the fortune wheel for fast-paced verb tense practice!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => setGameState('instructions')} 
                variant="outline"
                className="h-11 sm:h-12 px-6 rounded-xl font-bold"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                How to Play
              </Button>
              <Button 
                onClick={handleSpin} 
                className="h-11 sm:h-12 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Spin Now!
              </Button>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
          <div className={cn(
            "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full",
            isFullscreen ? "p-6 sm:p-12 max-w-3xl" : "p-5 sm:p-8 max-w-lg"
          )}>
            <h3 className={cn("font-bold text-center", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>How to Play</h3>
            <div className={cn("text-left space-y-3 text-muted-foreground w-full", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Initiate the spin to randomly select a target verb.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Construct a sentence in the future tense (e.g., &quot;I <strong>will</strong> [verb]&quot;).</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Say your response aloud or test yourself with peers to build mastery!</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
              <Button onClick={() => setGameState("idle")} variant="outline" className="h-10 sm:h-11 px-5 rounded-xl font-bold">
                Back
              </Button>
              <Button onClick={handleSpin} className="h-10 sm:h-11 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                Spin the Wheel!
              </Button>
            </div>
          </div>
        )}

        {(gameState === "spinning" || gameState === "result") && (
          <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-xl mx-auto py-2">
            <div 
              className="relative" 
              style={{ '--wheel-size': isFullscreen ? 'min(55vh, 420px, 80vw)' : 'min(300px, 78vw)' } as React.CSSProperties}
            >
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
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary h-8 w-8 sm:h-10 sm:w-10" />
                <p className="font-black uppercase tracking-widest animate-pulse text-xs sm:text-sm">Randomizing verb...</p>
              </div>
            )}
            
            {gameState === 'result' && result && (
              <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in-95 duration-300 w-full">
                <div className="p-4 sm:p-6 rounded-2xl bg-primary/10 border-2 border-primary/40 shadow-xl w-full">
                  <p className="font-bold uppercase tracking-widest text-muted-foreground text-xs sm:text-sm mb-1">Target Verb:</p>
                  <p className="font-black text-primary uppercase italic text-3xl sm:text-5xl md:text-6xl tracking-tight">{result}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs sm:text-sm">Challenge:</p>
                  <p className="font-bold text-base sm:text-xl md:text-2xl">
                    Construct: &quot;I <span className="text-primary italic font-black">will {result}</span> tonight.&quot;
                  </p>
                </div>
                <Button 
                  onClick={handleSpin} 
                  className="h-11 sm:h-12 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl hover:from-purple-600 hover:to-indigo-700"
                >
                  <Repeat className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Spin Again
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10">
        <Button variant="outline" asChild size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl">
          <Link href="/games">Back to Library</Link>
        </Button>
        {(gameState === 'spinning' || gameState === 'result') && (
          <Button variant="secondary" onClick={resetGame} size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl">
            Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}