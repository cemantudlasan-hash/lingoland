
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
import { Loader2, Sparkles, CheckCircle, XCircle, Repeat, Maximize, Minimize, Thermometer, Trophy, Droplets, Box, Wind, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";

type State = "Solid" | "Liquid" | "Gas" | "Plasma";
type GameState = "idle" | "instructions" | "selecting_difficulty" | "playing" | "answered" | "finished";

interface Substance {
  name: string;
  state: State;
  description: string;
  explanation: string;
  level: number;
}

const SUBSTANCES: Substance[] = [
  // LEVEL 1: BEGINNER
  { name: "Ice Cube", state: "Solid", description: "Water in a frozen state at 0°C.", explanation: "Solids have a definite shape and volume because particles are closely packed.", level: 1 },
  { name: "Juice", state: "Liquid", description: "A refreshing drink found in a glass.", explanation: "Liquids have a definite volume but take the shape of their container.", level: 1 },
  { name: "Oxygen", state: "Gas", description: "The air we breathe to survive.", explanation: "Gases have no definite shape or volume and expand to fill any space.", level: 1 },
  { name: "Iron Bar", state: "Solid", description: "A heavy metal rod used in construction.", explanation: "Metal at room temperature is a solid with strong intermolecular forces.", level: 1 },
  { name: "Milk", state: "Liquid", description: "A white fluid produced by mammals.", explanation: "Milk is a liquid that flows and can be poured.", level: 1 },
  { name: "Steam", state: "Gas", description: "Visible water vapor coming from a boiling kettle.", explanation: "Steam is water in its gaseous phase.", level: 1 },
  { name: "Wooden Table", state: "Solid", description: "A common piece of furniture made from trees.", explanation: "Wood is a solid material with a rigid structure.", level: 1 },
  { name: "Rainwater", state: "Liquid", description: "Water falling from clouds in the sky.", explanation: "Rain is liquid water that forms when water vapor condenses.", level: 1 },
  { name: "Helium", state: "Gas", description: "The invisible stuff inside a floating party balloon.", explanation: "Helium is a light gas that is less dense than air.", level: 1 },
  { name: "Granite Rock", state: "Solid", description: "A hard, natural stone found in mountains.", explanation: "Rocks are solids composed of minerals.", level: 1 },

  // LEVEL 2: INTERMEDIATE
  { name: "Lava", state: "Liquid", description: "Molten rock expelled from a volcano.", explanation: "Lava is rock so hot that it has melted into a flowing liquid.", level: 2 },
  { name: "Dry Ice", state: "Solid", description: "Frozen carbon dioxide that turns straight into gas.", explanation: "Dry ice is solid CO2 that undergoes sublimation.", level: 2 },
  { name: "Mercury", state: "Liquid", description: "The only metal that is liquid at room temperature.", explanation: "Mercury is unique among metals for being liquid at 25°C.", level: 2 },
  { name: "Neon Sign Glow", state: "Plasma", description: "The bright light inside a neon tube when electrified.", explanation: "Plasma is ionized gas, common in neon signs and fluorescent lights.", level: 2 },
  { name: "Honey", state: "Liquid", description: "A thick, sticky substance made by bees.", explanation: "Honey is a high-viscosity liquid.", level: 2 },
  { name: "Propane", state: "Gas", description: "A fuel often used for portable stoves and grills.", explanation: "Propane is stored as a liquid under pressure but used as a gas.", level: 2 },
  { name: "Molten Gold", state: "Liquid", description: "Gold heated to over 1,064°C until it flows.", explanation: "Even metals become liquid when they reach their melting point.", level: 2 },
  { name: "Compressed Air", state: "Gas", description: "Air kept at high pressure in a steel tank.", explanation: "Gas can be compressed into smaller volumes.", level: 2 },

  // LEVEL 3: ADVANCED
  { name: "Lightning Bolt", state: "Plasma", description: "A massive discharge of electricity in the atmosphere.", explanation: "Lightning is a naturally occurring plasma on Earth.", level: 3 },
  { name: "The Sun's Core", state: "Plasma", description: "The center of our star where fusion occurs.", explanation: "Stars are primarily composed of plasma due to extreme heat.", level: 3 },
  { name: "Aurora Borealis", state: "Plasma", description: "The 'Northern Lights' seen in the polar skies.", explanation: "Auroras are caused by ionized particles in the upper atmosphere, forming plasma.", level: 3 },
  { name: "Molten Glass", state: "Liquid", description: "Glass heated to over 1000°C so it can be shaped.", explanation: "Glass becomes a liquid when heated sufficiently.", level: 3 },
  { name: "Diamond", state: "Solid", description: "One of the hardest known natural materials.", explanation: "Diamonds are solid carbon arranged in a crystal lattice.", level: 3 },
  { name: "Welding Arc", state: "Plasma", description: "The super-hot spark used to join pieces of metal.", explanation: "The intense heat of an electric arc ionizes air into plasma.", level: 3 },
];

const STATE_ICONS = {
    Solid: Box,
    Liquid: Droplets,
    Gas: Wind,
    Plasma: Zap
};

export function StatesOfMatter({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [round, setRound] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [currentSubstance, setCurrentSubstance] = React.useState<Substance | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [usedSubstances, setUsedSubstances] = React.useState<string[]>([]);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateRound = (level: SkillLevel, history: string[]) => {
    const levelThreshold = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;
    const pool = SUBSTANCES.filter(s => s.level <= levelThreshold && !history.includes(s.name));
    
    // If we ran out of unique items, reset the local history for this mission
    const finalPool = pool.length > 0 ? pool : SUBSTANCES.filter(s => s.level <= levelThreshold);
    
    const target = finalPool[Math.floor(Math.random() * finalPool.length)];
    setCurrentSubstance(target);
    setIsCorrect(null);
    setUsedSubstances([...history, target.name]);
    setGameState("playing");
  };

  const handleStartGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    setUsedSubstances([]);
    generateRound(level, []);
  };

  const handleAnswer = (choice: State) => {
    if (gameState !== "playing" || !currentSubstance) return;
    const correct = choice === currentSubstance.state;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 10);
    setGameState("answered");

    setTimeout(() => {
      if (round < 10) {
        setRound(r => r + 1);
        generateRound(difficulty, usedSubstances);
      } else {
        setGameState("finished");
      }
    }, 2500);
  };

  if (!game) return null;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col overflow-hidden",
        isFullscreen ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" : "max-w-4xl mx-auto bg-card shadow-xl"
      )}>
      <CardHeader className="text-center relative border-b border-white/5">
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
                <Thermometer className="w-16 h-16 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty' && (
            <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="uppercase">{difficulty}</Badge>
                <Badge variant="secondary">Round {round}/10</Badge>
            </div>
        )}
      </CardHeader>

      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center p-6",
          isFullscreen ? "min-h-[70vh]" : "min-h-[30rem]"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Identify substances and their molecular structures.</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Initialize Laboratory
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-[2rem] border-4 border-primary/20 shadow-inner mx-auto",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-xl"
             )}>
                <h3 className={cn("font-black uppercase tracking-widest text-center mb-4 text-primary", isFullscreen ? "text-4xl" : "text-xl")}>MISSION BRIEFING</h3>
                <div className={cn("text-left space-y-4 font-medium", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. You will be presented with a scientific substance or phenomenon.</p>
                    <p>2. Analyze its properties and determine its current <strong>State of Matter</strong>.</p>
                    <p>3. Choose between <strong>Solid</strong>, <strong>Liquid</strong>, <strong>Gas</strong>, or <strong>Plasma</strong>.</p>
                    <p>4. Complete 10 successful identifications to clear the laboratory session.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Enter Lab</Button>
            </div>
        )}

        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-8 w-full max-w-md">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Choose Analysis Tier</p>
                <div className="grid grid-cols-1 gap-4 w-full">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size="lg" variant="outline" className={cn("h-20 text-2xl font-black uppercase tracking-widest border-4 transition-all hover:scale-105", isFullscreen && "h-24 rounded-3xl")}>{level}</Button>
                    ))}
                </div>
            </div>
        )}

        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse font-black uppercase tracking-[0.2em]", isFullscreen ? "text-3xl" : "text-lg")}>Synthesizing molecular structure...</p>
            </div>
        )}

        {(gameState === "playing" || gameState === "answered") && currentSubstance && (
            <div className="w-full flex flex-col items-center gap-10 max-w-5xl">
                <div className={cn(
                    "w-full bg-muted/20 backdrop-blur-sm p-12 rounded-[3rem] border-4 border-primary/20 text-center shadow-2xl flex flex-col items-center",
                    isFullscreen ? "min-h-[350px]" : "min-h-[200px]"
                )}>
                    <span className="text-[10px] font-black uppercase text-primary tracking-[0.5em] mb-4 block">IDENTIFY THE STATE:</span>
                    <h2 className={cn("font-black uppercase italic leading-none mb-4", isFullscreen ? "text-[8vw]" : "text-5xl")}>{currentSubstance.name}</h2>
                    <p className={cn("font-medium opacity-80", isFullscreen ? "text-3xl" : "text-lg")}>{currentSubstance.description}</p>
                </div>

                <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4 w-full", isFullscreen && "gap-8")}>
                    {(["Solid", "Liquid", "Gas", "Plasma"] as State[]).map(state => {
                        const IconComponent = STATE_ICONS[state];
                        return (
                            <Button
                                key={state}
                                variant={gameState === 'answered' ? (state === currentSubstance.state ? 'secondary' : 'outline') : 'outline'}
                                onClick={() => handleAnswer(state)}
                                className={cn(
                                    "h-auto flex flex-col gap-4 py-8 rounded-3xl border-4 transition-all shadow-xl font-black uppercase tracking-widest",
                                    isFullscreen ? "h-48 text-3xl" : "h-32 text-sm",
                                    gameState === 'answered' && state === currentSubstance.state && "bg-green-500 text-white border-green-400 scale-105",
                                    gameState === 'playing' && "hover:scale-105 hover:border-primary"
                                )}
                                disabled={gameState === 'answered'}
                            >
                                <IconComponent className={cn(isFullscreen ? "h-12 w-12" : "h-8 w-8")} />
                                {state}
                            </Button>
                        )
                    })}
                </div>

                {gameState === 'answered' && (
                    <div className={cn(
                        "w-full p-8 rounded-[2.5rem] border-4 animate-in zoom-in duration-300 shadow-2xl",
                        isCorrect ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"
                    )}>
                        <div className="flex items-center justify-center gap-4 mb-4">
                            {isCorrect ? <CheckCircle className="text-green-500 h-10 w-10" /> : <XCircle className="text-red-500 h-10 w-10" />}
                            <span className={cn("font-black uppercase tracking-widest", isFullscreen ? "text-4xl" : "text-2xl")}>
                                {isCorrect ? "SYNCHRONIZATION COMPLETE" : "DATA CORRUPTION DETECTED"}
                            </span>
                        </div>
                        <p className={cn("font-bold italic opacity-90", isFullscreen ? "text-3xl" : "text-lg")}>{currentSubstance.explanation}</p>
                    </div>
                )}
            </div>
        )}

        {gameState === "finished" && (
            <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-32 w-32")} />
                <div className="space-y-2">
                    <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-8xl" : "text-5xl")}>RESEARCH COMPLETE</h2>
                    <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>Score: {score}/100</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Repeat className="mr-3" /> Re-Initialize Session
                </Button>
            </div>
        )}
      </CardContent>

      <CardFooter className={cn("flex justify-between border-t border-white/5 p-8", isFullscreen && "pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Abort Mission</Link>
        </Button>
        {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty') && <p className="font-black text-primary uppercase tracking-[0.2em]">Research Points: {score}</p>}
      </CardFooter>
    </Card>
  );
}
