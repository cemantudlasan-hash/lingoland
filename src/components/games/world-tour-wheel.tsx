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
import { Loader2, Sparkles, Repeat, Trophy, Globe, Key, Maximize, Minimize, HelpCircle } from "lucide-react";
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
          box-shadow: 0 0 30px rgba(0,0,0,0.3);
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
          transform: rotate(292.5deg) translate(-4px, calc(var(--wheel-size, 280px) / 6.5));
          font-weight: 900;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.6);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: calc(var(--wheel-size, 280px) / 29);
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
          <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
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
              Spin the globe wheel to test countries and nationalities!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button onClick={() => setGameState('instructions')} variant="outline" className="h-11 sm:h-12 px-6 rounded-xl font-bold">
                <HelpCircle className="mr-2 h-4 w-4" /> How to Play
              </Button>
              <Button onClick={handleSpin} className="h-11 sm:h-12 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                <Sparkles className="mr-2 h-5 w-5" /> Spin Wheel
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
                <span>Spin the wheel to land on a random nation.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Identify the country and pronounce its nationality before revealing intel.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Construct a sentence with the nationality (e.g., &quot;They are [Nationality]&quot;).</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
              <Button onClick={() => setGameState("idle")} variant="outline" className="h-10 sm:h-11 px-5 rounded-xl font-bold">
                Back
              </Button>
              <Button onClick={handleSpin} className="h-10 sm:h-11 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                Launch Mission
              </Button>
            </div>
          </div>
        )}

        {(gameState === "spinning" || gameState === "result" || gameState === "revealed") && (
          <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-xl mx-auto py-2">
            <div 
              className="relative" 
              style={{ '--wheel-size': isFullscreen ? 'min(55vh, 420px, 80vw)' : 'min(300px, 78vw)' } as React.CSSProperties}
            >
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
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary h-8 w-8 sm:h-10 sm:w-10" />
                <p className="font-black uppercase tracking-widest animate-pulse text-xs sm:text-sm">Calibrating coordinates...</p>
              </div>
            )}
            
            {(gameState === 'result' || gameState === 'revealed') && result && (
              <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in-95 duration-300 w-full">
                <div className="p-4 sm:p-6 rounded-2xl bg-muted/30 border-2 border-primary/30 shadow-xl w-full">
                  <p className="font-bold uppercase tracking-widest text-muted-foreground text-xs sm:text-sm mb-1">Landed in:</p>
                  <p className="font-black text-primary uppercase italic text-2xl sm:text-4xl md:text-5xl leading-tight">{result.name}</p>
                  {gameState === 'revealed' && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <p className="font-bold uppercase tracking-widest text-muted-foreground text-xs mb-1">Nationality:</p>
                      <p className="font-black text-amber-500 uppercase text-2xl sm:text-4xl md:text-5xl">{result.nationality}</p>
                    </div>
                  )}
                </div>

                {gameState === 'result' && (
                  <Button onClick={handleReveal} className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl font-black uppercase shadow-lg bg-secondary text-secondary-foreground">
                    <Key className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Reveal Nationality
                  </Button>
                )}
               
                {gameState === 'revealed' && (
                  <Button onClick={handleSpin} className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                    <Repeat className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Next Destination
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {gameState === "all_spun" && (
          <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in-95 duration-300 w-full max-w-md mx-auto py-4">
            <Trophy className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] h-16 w-16 sm:h-20 sm:w-20" />
            <div className="space-y-1">
              <h3 className="font-black uppercase tracking-tight text-xl sm:text-3xl">World Tour Complete!</h3>
              <p className="font-bold text-primary uppercase text-sm sm:text-base">All 50 Nations Surveyed</p>
            </div>
            <Button onClick={resetGame} className="h-11 sm:h-12 px-6 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
              <Repeat className="mr-2 h-4 w-4" />
              New Expedition
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10">
        <Button variant="outline" asChild size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl">
          <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== "idle" && gameState !== "instructions" && (
          <Button variant="secondary" onClick={resetGame} size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl">
            Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}