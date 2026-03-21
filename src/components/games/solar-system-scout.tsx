
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
    setOptions(opts.sort(() => Math.random() - 0.5));
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
        "w-full transition-all duration-500 flex flex-col bg-[#05050a] text-white overflow-hidden",
        isFullscreen ? "min-h-screen rounded-none border-none max-w-none justify-center" : "max-w-4xl mx-auto rounded-xl border border-blue-500/20 shadow-2xl"
      )}
      style={{
        backgroundImage: 'radial-gradient(circle at center, #1e1e3f 0%, #05050a 100%)'
      }}>
      <CardHeader className="text-center relative border-b border-blue-500/10 bg-black/20">
        <Button variant="ghost" size="sm" className="absolute top-4 right-4 h-auto p-2 gap-1 text-blue-400 hover:text-white z-[100]" onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && <Rocket className="w-12 h-12 text-blue-400 mx-auto mb-2 animate-pulse" />}
        <CardTitle className={cn("font-black uppercase italic tracking-widest", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        {(gameState !== 'idle' && gameState !== 'instructions') && (
            <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="border-blue-500 text-blue-400 uppercase">{difficulty}</Badge>
                <Badge variant="secondary" className="bg-blue-900/50 text-blue-100">Sector {round}/10</Badge>
            </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex flex-col items-center justify-center p-8", isFullscreen ? "min-h-[60vh]" : "min-h-[450px]")}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6">
            <Orbit className="w-24 h-24 text-blue-500/30 animate-spin-slow" />
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_0_20px_rgba(37,99,235,0.4)]", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Begin Expedition
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-6 text-center bg-blue-900/20 backdrop-blur-md rounded-[2.5rem] border-2 border-blue-500/30 shadow-inner mx-auto animate-in fade-in zoom-in duration-300",
                 isFullscreen ? "p-20 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-black uppercase tracking-widest text-blue-400 mb-4", isFullscreen ? "text-4xl" : "text-xl")}>MISSION PROTOCOL</h3>
                <div className={cn("text-left space-y-4 text-blue-100", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Analyze the sensor data (description) provided by the ship's computer.</p>
                    <p>2. Identify the celestial body that matches the unique signatures.</p>
                    <p>3. Successfully identify 10 bodies to complete the star chart.</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-8">
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                        <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} variant="outline" className={cn("border-blue-500/50 text-blue-400 font-black uppercase hover:bg-blue-500/20", isFullscreen && "h-20 px-12 text-2xl rounded-2xl border-4")}>
                            {level}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {(gameState === "playing" || gameState === "answered") && currentTarget && (
          <div className="w-full max-w-5xl flex flex-col items-center gap-12">
            <div className={cn(
                "w-full bg-blue-900/30 backdrop-blur-md border-4 border-blue-500/40 rounded-[3rem] p-12 text-center shadow-[0_0_50px_rgba(37,99,235,0.2)]",
                isFullscreen ? "min-h-[300px]" : "min-h-[150px]"
            )}>
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.5em] mb-4 block">SENSOR DATA DETECTED</span>
                <p className={cn("font-bold italic text-white leading-relaxed", isFullscreen ? "text-[4vw]" : "text-2xl")}>
                    "{currentTarget.description}"
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {options.map(name => (
                    <Button
                        key={name}
                        variant={gameState === 'answered' ? (name === currentTarget.name ? 'secondary' : 'destructive') : 'outline'}
                        onClick={() => handleAnswer(name)}
                        className={cn(
                            "h-24 text-3xl font-black rounded-3xl transition-all border-4 shadow-lg uppercase tracking-wider",
                            gameState === 'answered' && name === currentTarget.name && "bg-blue-500 text-white border-blue-400 scale-105 shadow-blue-500/50",
                            isFullscreen && "h-32 text-5xl"
                        )}
                        disabled={gameState === 'answered'}
                    >
                        {name}
                    </Button>
                ))}
            </div>

            {gameState === 'answered' && (
                <div className={cn(
                    "text-center p-6 rounded-2xl border-4 font-black uppercase transition-all animate-in zoom-in",
                    isCorrect ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/20 border-red-500/50 text-red-400",
                    isFullscreen ? "text-4xl px-12" : "text-lg"
                )}>
                    {isCorrect ? "COORDINATES CONFIRMED!" : `SCAN ERROR: TARGET IS ${currentTarget.name}`}
                </div>
            )}
          </div>
        )}

        {gameState === "finished" && (
            <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className="w-40 h-40 text-blue-400 animate-pulse drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-8xl" : "text-5xl")}>EXPEDITION COMPLETE</h2>
                <div className="p-12 bg-blue-900/20 rounded-[3rem] border-8 border-blue-500/50 shadow-2xl">
                    <p className="text-sm font-bold text-blue-300 uppercase tracking-[0.5em] mb-4">Discovery Rating</p>
                    <p className="text-9xl font-black text-white">{score}<span className="text-4xl text-blue-500">/10</span></p>
                </div>
                <Button onClick={() => setGameState('idle')} size="lg" className={cn("h-24 px-16 text-3xl font-black rounded-[2rem] bg-blue-600 hover:bg-blue-500 uppercase shadow-2xl shadow-blue-500/30")}><Repeat className="mr-4 w-10 h-10"/> Next Quadrant</Button>
            </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-blue-500/10 p-8 bg-black/20">
        <Button variant="ghost" asChild className="text-blue-400/70 hover:text-blue-400"><Link href="/games">Abort Mission</Link></Button>
        {(gameState !== 'idle' && gameState !== 'instructions') && <p className="font-black text-blue-400 tracking-[0.2em]">INTELLIGENCE: {score}</p>}
      </CardFooter>
    </Card>
  );
}
