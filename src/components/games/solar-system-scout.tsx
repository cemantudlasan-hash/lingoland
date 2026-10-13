
"use client";

import { shuffleArray } from "@/lib/shuffle";

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
import { Loader2, Sparkles, CheckCircle, XCircle, Repeat, Maximize, Minimize, Rocket, Trophy, Orbit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";

type GameState = "idle" | "playing" | "answered" | "finished" | "instructions" | "loading";

interface CelestialBody {
  name: string;
  description: string;
  level: number;
}

const CELESTIAL_BODIES: CelestialBody[] = [
  { name: "Mercury", description: "The smallest planet in our solar system and closest to the Sun.", level: 1 },
  { name: "Venus", description: "Often called Earth's twin, it is the hottest planet in our solar system.", level: 1 },
  { name: "Earth", description: "Our home planet and the only one known to support life.", level: 1 },
  { name: "Mars", description: "Known as the 'Red Planet' due to iron oxide on its surface.", level: 1 },
  { name: "Jupiter", description: "The largest planet in our solar system, famous for its Great Red Spot.", level: 1 },
  { name: "Saturn", description: "A gas giant known for its complex and beautiful ring system.", level: 1 },
  { name: "Uranus", description: "An ice giant that rotates on its side.", level: 2 },
  { name: "Neptune", description: "The most distant planet from the Sun, known for its deep blue color.", level: 2 },
  { name: "Pluto", description: "Formerly considered the ninth planet, it is now classified as a dwarf planet.", level: 2 },
  { name: "The Moon", description: "Earth's only natural satellite.", level: 1 },
  { name: "Titan", description: "Saturn's largest moon, which has a thick atmosphere.", level: 3 },
  { name: "Europa", description: "One of Jupiter's moons, believed to have a subsurface ocean.", level: 3 },
  { name: "The Sun", description: "The star at the center of our solar system.", level: 1 },
  { name: "Io", description: "A moon of Jupiter and the most volcanically active body in the solar system.", level: 3 },
  { name: "Enceladus", description: "An icy moon of Saturn known for its water-rich geysers.", level: 3 },
];

export function SolarSystemScout({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [currentTarget, setCurrentTarget] = React.useState<CelestialBody | null>(null);
  const [options, setOptions] = React.useState<string[]>([]);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [usedBodies, setUsedBodies] = React.useState<string[]>([]);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateRound = (level: SkillLevel) => {
    const levelThreshold = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;
    const pool = CELESTIAL_BODIES.filter(b => b.level <= levelThreshold && !usedBodies.includes(b.name));
    const effectivePool = pool.length > 0 ? pool : CELESTIAL_BODIES.filter(b => b.level <= levelThreshold);
    
    const target = effectivePool[Math.floor(Math.random() * effectivePool.length)];
    const opts = [target.name];
    
    while (opts.length < 4) {
      const randomBody = CELESTIAL_BODIES[Math.floor(Math.random() * CELESTIAL_BODIES.length)].name;
      if (!opts.includes(randomBody)) opts.push(randomBody);
    }

    setCurrentTarget(target);
    setOptions(shuffleArray(opts));
    setIsCorrect(null);
    setUsedBodies(prev => [...prev, target.name]);
    setGameState("playing");
  };

  const handleStartGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    setUsedBodies([]);
    generateRound(level);
  };

  const handleAnswer = (choice: string) => {
    if (gameState !== "playing" || !currentTarget) return;
    const correct = choice === currentTarget.name;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setGameState("answered");

    setTimeout(() => {
      if (round < 10) {
        setRound(r => r + 1);
        generateRound(difficulty);
      } else {
        setGameState("finished");
      }
    }, 2000);
  };

  if (!game) return null;

  return (
    <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-blue-500/20 shadow-xl bg-[#05050a] text-white transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-[#05050a]"
      )}
      style={{
        backgroundImage: 'radial-gradient(circle at center, #1e1e3f 0%, #05050a 100%)'
      }}>
      <CardHeader className="text-center relative border-b border-blue-500/10 bg-black/20 p-4 sm:p-6 pb-3">
        <Button variant="ghost" size="sm" className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-1.5 sm:p-2 gap-1 text-blue-400 hover:text-white z-[100]" onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        <Rocket className="w-10 h-10 sm:w-14 sm:h-14 text-blue-400 mx-auto mb-2 animate-pulse" />
        <CardTitle className={cn("font-black uppercase italic tracking-widest", isFullscreen ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-3xl")}>{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-blue-200/70 max-w-md mx-auto">{game.description}</CardDescription>
        {(gameState !== 'idle' && gameState !== 'instructions') && (
            <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="border-blue-500 text-blue-400 uppercase text-xs sm:text-sm">{difficulty}</Badge>
                <Badge variant="secondary" className="bg-blue-900/50 text-blue-100 text-xs sm:text-sm">Sector {round}/10</Badge>
            </div>
        )}
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6 text-center max-w-md">
            <Orbit className="w-16 h-16 sm:w-24 sm:h-24 text-blue-500/30 animate-spin-slow" />
            <p className="text-xs sm:text-base text-blue-200/80">Embark across the cosmos and scout celestial bodies using planetary sensor intelligence.</p>
            <Button onClick={() => setGameState('instructions')} className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-xl">
              <Sparkles className="mr-2 h-5 w-5" />
              Begin Expedition
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-4 text-center bg-blue-900/20 backdrop-blur-md rounded-2xl border-2 border-blue-500/30 shadow-inner p-4 sm:p-8 max-w-lg w-full animate-in fade-in duration-300">
                <h3 className="font-black uppercase tracking-widest text-blue-400 text-lg sm:text-2xl">MISSION PROTOCOL</h3>
                <div className="text-left space-y-3 text-blue-100 text-xs sm:text-base">
                    <p className="flex items-start gap-2"><span className="font-bold text-blue-400">1.</span> Analyze the sensor data (description) provided by the ship's computer.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-blue-400">2.</span> Identify the celestial body that matches the unique signatures.</p>
                    <p className="flex items-start gap-2"><span className="font-bold text-blue-400">3.</span> Successfully identify 10 bodies to complete the star chart.</p>
                </div>
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mt-2">Select Sector Difficulty</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                        <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} variant="outline" className="h-11 sm:h-12 border-blue-500/50 text-blue-300 font-black uppercase hover:bg-blue-500/20 rounded-xl text-xs sm:text-sm">
                            {level}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {(gameState === "playing" || gameState === "answered") && currentTarget && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-4 sm:gap-6">
            <div className="w-full bg-blue-900/30 backdrop-blur-md border-2 sm:border-4 border-blue-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em] mb-2 block">SENSOR DATA DETECTED</span>
                <p className="font-bold italic text-white leading-relaxed text-sm sm:text-xl md:text-2xl">
                    "{currentTarget.description}"
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full">
                {options.map(name => (
                    <Button
                        key={name}
                        variant={gameState === 'answered' ? (name === currentTarget.name ? 'secondary' : 'destructive') : 'outline'}
                        onClick={() => handleAnswer(name)}
                        className={cn(
                            "h-auto min-h-[50px] sm:min-h-[60px] py-3 px-4 text-sm sm:text-lg md:text-xl font-black rounded-xl sm:rounded-2xl transition-all border-2 shadow-md uppercase tracking-wider whitespace-normal break-words",
                            gameState === 'answered' && name === currentTarget.name && "bg-blue-500 text-white border-blue-400 scale-[1.02] shadow-blue-500/50",
                            gameState !== 'answered' && "hover:border-blue-400 hover:bg-blue-500/10 text-white border-blue-500/40"
                        )}
                        disabled={gameState === 'answered'}
                    >
                        {name}
                    </Button>
                ))}
            </div>

            {gameState === 'answered' && (
                <div className={cn(
                    "text-center p-3 sm:p-4 rounded-xl border-2 font-black uppercase transition-all animate-in zoom-in w-full text-xs sm:text-base",
                    isCorrect ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/20 border-red-500/50 text-red-400"
                )}>
                    {isCorrect ? "COORDINATES CONFIRMED!" : `SCAN ERROR: TARGET IS ${currentTarget.name}`}
                </div>
            )}
          </div>
        )}

        {gameState === "finished" && (
            <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-300 max-w-md w-full">
                <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-blue-400 animate-pulse drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                <h2 className="font-black uppercase tracking-tight text-white text-2xl sm:text-4xl">EXPEDITION COMPLETE</h2>
                <div className="p-6 sm:p-8 bg-blue-900/20 rounded-2xl border-2 sm:border-4 border-blue-500/50 shadow-xl w-full">
                    <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Discovery Rating</p>
                    <p className="text-5xl sm:text-7xl font-black text-white">{score}<span className="text-2xl sm:text-3xl text-blue-500">/10</span></p>
                </div>
                <Button onClick={() => setGameState('idle')} className="w-full sm:w-auto h-12 px-8 text-base font-black rounded-xl bg-blue-600 hover:bg-blue-500 uppercase shadow-lg shadow-blue-500/30"><Repeat className="mr-2 w-5 h-5"/> Next Quadrant</Button>
            </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-blue-500/10 p-4 sm:p-6 bg-black/20 w-full shrink-0">
        <Button variant="ghost" asChild className="w-full sm:w-auto text-blue-400/70 hover:text-blue-400"><Link href="/games">Abort Mission</Link></Button>
        {(gameState !== 'idle' && gameState !== 'instructions') && <p className="font-black text-blue-400 tracking-wider text-xs sm:text-sm">SCORE: {score}/10</p>}
      </CardFooter>
    </Card>
  );
}
