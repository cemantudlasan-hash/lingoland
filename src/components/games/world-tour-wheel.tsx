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
import { Loader2, Sparkles, Repeat, Trophy, Globe, Key, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GameState = "idle" | "spinning" | "result" | "revealed" | "instructions" | "all_spun";

const countries = [
  { name: "Japan", nationality: "Japanese" }, { name: "Brazil", nationality: "Brazilian" }, { name: "Canada", nationality: "Canadian" }, { name: "Egypt", nationality: "Egyptian" }, { name: "Australia", nationality: "Australian" }, { name: "Germany", nationality: "German" }, { name: "India", nationality: "Indian" }, { name: "Mexico", nationality: "Mexican" }, { name: "China", nationality: "Chinese" }, { name: "South Africa", nationality: "South African" }, { name: "Italy", nationality: "Italian" }, { name: "Russia", nationality: "Russian" }, { name: "Spain", nationality: "Spanish" }, { name: "Argentina", nationality: "Argentinian" }, { name: "Thailand", nationality: "Thai" }, { name: "United States", nationality: "American" }, { name: "France", nationality: "French" }, { name: "Nigeria", nationality: "Nigerian" }, { name: "South Korea", nationality: "South Korean" }, { name: "Turkey", nationality: "Turkish" }, { name: "Vietnam", nationality: "Vietnamese" }, { name: "United Kingdom", nationality: "British" }, { name: "Kenya", nationality: "Kenyan" }, { name: "Colombia", nationality: "Colombian" }, { name: "Pakistan", nationality: "Pakistani" }, { name: "Indonesia", nationality: "Indonesian" }, { name: "Poland", nationality: "Polish" }, { name: "Saudi Arabia", nationality: "Saudi" }, { name: "New Zealand", nationality: "New Zealander" }, { name: "Chile", nationality: "Chilean" }, { name: "Sweden", nationality: "Swedish" }, { name: "Switzerland", nationality: "Swiss" }, { name: "Norway", nationality: "Norwegian" }, { name: "Finland", nationality: "Finnish" }, { name: "Denmark", nationality: "Danish" }, { name: "Ireland", nationality: "Irish" }, { name: "Greece", nationality: "Greek" }, { name: "Portugal", nationality: "Portuguese" }, { name: "Netherlands", nationality: "Dutch" }, { name: "Belgium", nationality: "Belgian" }, { name: "Austria", nationality: "Austrian" }, { name: "Hungary", nationality: "Hungarian" }, { name: "Czech Republic", nationality: "Czech" }, { name: "Romania", nationality: "Romanian" }, { name: "Israel", nationality: "Israeli" }, { name: "Philippines", nationality: "Filipino" }, { name: "Malaysia", nationality: "Malaysian" }, { name: "Singapore", nationality: "Singaporean" }, { name: "Peru", nationality: "Peruvian" }, { name: "Venezuela", nationality: "Venezuelan" },
];


const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#9B5DE5", "#F15BB5", "#00F5D4", "#00BBF9", "#FEE440", "#F3722C", "#F94144", "#90BE6D", "#3D405B", "#81B29A", "#F2CC8F", "#E07A5F", "#6A4C93", "#1982C4", "#FFCA3A", "#8AC926", "#FF595E", "#6D6875", "#B5838D", "#E5989B", "#FFB4A2", "#7B2CBF", "#560BAD", "#480CA8", "#3A0CA3", "#3F37C9", "#D9ED92", "#B5E48C", "#99D98C", "#76C893", "#52B69A", "#34A0A4", "#168AAD", "#1A759F", "#1E6091", "#184E77", "#F94144", "#F3722C", "#F8961E", "#F9844A", "#F9C74F", "#90BE6D", "#43AA8B", "#4D908E", "#577590", "#277DA1",
];

export function WorldTourWheel({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [result, setResult] = React.useState<{ name: string; nationality: string } | null>(null);
  const [rotation, setRotation] = React.useState(0);
  const [usedCountries, setUsedCountries] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const game = getGameBySlug(slug);
  const { toast } = useToast();

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleSpin = () => {
    const availableCountries = countries.filter(c => !usedCountries.includes(c.name));
    if (availableCountries.length === 0) { setGameState("all_spun"); return; }
    setGameState("spinning");
    setResult(null);
    const randomCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
    const winningIndex = countries.findIndex(c => c.name === randomCountry.name);
    const spinCycles = 5;
    const segmentAngle = 360 / countries.length;
    const targetAngle = (winningIndex * segmentAngle) + (segmentAngle / 2);
    const newRotation = (spinCycles * 360) + rotation - targetAngle;
    setRotation(newRotation);
    setTimeout(() => {
      setResult(randomCountry);
      setUsedCountries(prev => [...prev, randomCountry.name]);
      setGameState("result");
    }, 4000);
  };

  const handleReveal = () => setGameState("revealed");
  const resetGame = () => { setGameState("idle"); setResult(null); setUsedCountries([]); };
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
          box-shadow: 0 0 40px rgba(0,0,0,0.4);
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
          clip-path: polygon(0 0, 100% 0, 100% 7.2%, 50% 100%, 7.2% 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .segment-label {
          transform: rotate(292.5deg) translate(-5px, calc(var(--wheel-size, 300px) / 6));
          font-weight: 900;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: calc(var(--wheel-size, 300px) / 28);
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
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Initiate global reconnaissance mission!</p>
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
                    <p>1. Spin the wheel to deploy to a random nation.</p>
                    <p>2. Identify the country and reveal its nationality classification.</p>
                    <p>3. Construct a localized greeting or fact to complete the round.</p>
                </div>
                <Button onClick={handleSpin} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Launch Mission</Button>
            </div>
        )}
        {(gameState === "spinning" || gameState === "result" || gameState === "revealed") && (
          <div className="flex flex-col items-center gap-10 w-full">
            <div className="relative" style={{ '--wheel-size': isFullscreen ? 'min(70vh, 600px)' : '300px' } as any}>
              <div className="pointer"></div>
              <div className="wheel-container">
                <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
                  {countries.map((country, index) => {
                    const angle = (360 / countries.length) * index;
                    return (
                      <div key={country.name} className="segment" style={{ transform: `rotate(${angle}deg)`, backgroundColor: colors[index % colors.length], filter: usedCountries.includes(country.name) ? 'grayscale(80%) opacity(30%)' : 'none' }}>
                        <span className="segment-label">{country.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {gameState === 'spinning' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-10 w-10")} />
                    <p className={cn("font-black uppercase tracking-widest animate-pulse", isFullscreen ? "text-2xl" : "text-sm")}>Calibrating coordinates...</p>
                </div>
            )}
            
            {(gameState === 'result' || gameState === 'revealed') && result && (
                <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500 w-full max-w-4xl">
                    <div className={cn("p-8 rounded-[3rem] bg-muted/20 border-4 border-primary shadow-2xl w-full", isFullscreen && "p-12")}>
                      <p className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-3xl" : "text-sm")}>Landed in:</p>
                      <p className={cn("font-black text-primary uppercase italic leading-tight", isFullscreen ? "text-[8vw]" : "text-5xl")}>{result.name}</p>
                      {gameState === 'revealed' && (
                          <div className={cn("mt-6 pt-6 border-t-4 border-primary/20", isFullscreen && "mt-10 pt-10")}>
                            <p className={cn("font-black uppercase tracking-widest text-muted-foreground mb-2", isFullscreen ? "text-2xl" : "text-xs")}>Nationality Class:</p>
                            <p className={cn("font-black text-amber-500 uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{result.nationality}</p>
                          </div>
                      )}
                    </div>

                    {gameState === 'result' && (
                         <Button onClick={handleReveal} size="lg" variant="secondary" className={cn("font-black uppercase shadow-xl", isFullscreen && "h-20 px-16 text-2xl rounded-3xl")}>
                            <Key className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                            Reveal Intel
                        </Button>
                    )}
                   
                    {gameState === 'revealed' && (
                        <Button onClick={handleSpin} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                            <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                            Next Deployment
                        </Button>
                    )}
                </div>
            )}
          </div>
        )}
        {gameState === "all_spun" && (
            <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
                <div className="space-y-2">
                    <h3 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>World Tour Complete!</h3>
                    <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>All Territories Surveyed</p>
                </div>
                <Button onClick={resetGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    New Expedition
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
            <Button variant="secondary" onClick={resetGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Abort Mission</Button>
        )}
      </CardFooter>
    </Card>
  );
}