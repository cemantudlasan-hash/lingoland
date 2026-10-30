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
import { Loader2, Sparkles, Volume2, MoveUp, MoveDown, MoveLeft, MoveRight, Rabbit, Snail, Repeat, CheckCircle, Maximize, Minimize, ArrowLeft, XOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "finished" | "instructions";
type Direction = "Up" | "Down" | "Left" | "Right";

const MAZE_SIZE = 7;

const generateMaze = (): { maze: (0 | 1 | 2 | 3)[][], path: { x: number, y: number }[] } => {
    const maze = Array.from({ length: MAZE_SIZE }, () => Array(MAZE_SIZE).fill(1));
    const path: { x: number, y: number }[] = [];
    
    let x = Math.floor(Math.random() * MAZE_SIZE);
    let y = 0;
    maze[y][x] = 0;
    path.push({ x, y });

    const directions: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    let attempts = 0;
    while (y < MAZE_SIZE - 1 && attempts < 50) {
        const potentialDirs = directions.map(dir => ({ x: x + dir[0], y: y + dir[1] }))
            .filter(pos => pos.x >= 0 && pos.x < MAZE_SIZE && pos.y >=0 && pos.y < MAZE_SIZE && maze[pos.y][pos.x] === 1);
        
        if (potentialDirs.length === 0) {
            if(path.length > 1) {
              path.pop();
              const lastPos = path[path.length - 1];
              x = lastPos.x;
              y = lastPos.y;
            } else {
                 break;
            }
            attempts++;
            continue;
        }

        const nextMove = potentialDirs[Math.floor(Math.random() * potentialDirs.length)];
        x = nextMove.x;
        y = nextMove.y;
        maze[y][x] = 0;
        path.push({ x, y });
    }
    
    maze[path[0].y][path[0].x] = 2;
    maze[y][x] = 3;
    
    return { maze: maze as (0 | 1 | 2 | 3)[][], path };
};

const getDirectionSequence = (path: { x: number, y: number }[]): Direction[] => {
    const directions: Direction[] = [];
    for (let i = 1; i < path.length; i++) {
        const prev = path[i-1];
        const curr = path[i];
        if (curr.y > prev.y) directions.push("Down");
        else if (curr.y < prev.y) directions.push("Up");
        else if (curr.x > prev.x) directions.push("Right");
        else if (curr.x < prev.x) directions.push("Left");
    }
    return directions;
};


export function ListeningLabyrinth({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [maze, setMaze] = React.useState<(0 | 1 | 2 | 3)[][]>([]);
  const [path, setPath] = React.useState<{ x: number, y: number }[]>([]);
  const [directions, setDirections] = React.useState<Direction[]>([]);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [playerPosition, setPlayerPosition] = React.useState({ x: 0, y: 0 });
  const [audioSrc, setAudioSrc] = React.useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleAbortGame = () => {
    setGameState("idle");
    setDirections([]);
    setCurrentStep(0);
    toast({
      title: "Navigation Aborted",
      description: "Returned to the auditory navigation deck.",
    });
  };

  const handleStartGame = () => {
    setGameState("loading");
    const { maze: newMaze, path: newPath } = generateMaze();
    const startPos = newPath[0];
    setMaze(newMaze);
    setPath(newPath);
    setDirections(getDirectionSequence(newPath));
    setCurrentStep(0);
    setPlayerPosition(startPos);
    setGameState("playing");
  };

  const speakDirection = async (index: number) => {
    if (isSpeaking || index >= directions.length) return;
    setIsSpeaking(true);
    try {
        const { audio } = await textToSpeech(`Step ${index + 1}: Go ${directions[index]}`);
        setAudioSrc(audio);
    } catch (error) {
        toast({ variant: "destructive", title: "Audio Error", description: "Could not play direction." });
        setIsSpeaking(false);
    }
  }
  
  React.useEffect(() => {
    if(audioSrc) {
        const audio = new Audio(audioSrc);
        audio.play();
        audio.onended = () => {
            setIsSpeaking(false);
            setAudioSrc(null);
        };
    }
  }, [audioSrc]);

  const handleUserMove = (direction: Direction) => {
    if (gameState !== 'playing' || isSpeaking) return;

    if (direction === directions[currentStep]) {
        const nextPlayerPos = path[currentStep + 1];
        setPlayerPosition(nextPlayerPos);
        setCurrentStep(currentStep + 1);
        if (currentStep + 1 === directions.length) {
            setGameState("finished");
        }
    } else {
        toast({ variant: "destructive", title: "Wrong Way!", description: "That's not the right direction." });
    }
  };

  const Icon = game.icon;

  const renderCell = (cell: number, x: number, y: number) => {
    const isPlayerHere = playerPosition.x === x && playerPosition.y === y;
    const baseClasses = "flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm border-2 sm:border-4 w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14";
    
    if (isPlayerHere) {
        return <div className={cn(baseClasses, "bg-primary text-primary-foreground border-primary scale-105 z-10")}><Rabbit className="w-4 h-4 sm:w-6 sm:h-6"/></div>;
    }

    const hasBeenVisited = path.slice(0, currentStep + 1).some(p => p.x === x && p.y === y);

    switch(cell) {
        case 0:
            return <div className={cn(baseClasses, hasBeenVisited ? "bg-muted/50 border-white/10" : "bg-card border-white/5")}></div>;
        case 1:
            return <div className={cn(baseClasses, "bg-slate-800 border-slate-900 shadow-inner")}></div>;
        case 2:
            return <div className={cn(baseClasses, "bg-amber-400 border-amber-500 text-amber-900")}><Snail className="w-4 h-4 sm:w-6 sm:h-6"/></div>;
        case 3:
            return <div className={cn(baseClasses, "bg-green-500 border-green-600 text-white")}><CheckCircle className="w-4 h-4 sm:w-6 sm:h-6"/></div>;
        default:
             return <div className={cn(baseClasses, "bg-white")}></div>;
    }
  }

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col overflow-y-auto overflow-x-hidden justify-between",
        isFullscreen 
            ? "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none bg-background p-2 sm:p-6" 
            : "flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full bg-card/80 backdrop-blur-sm border-border/20 shadow-lg rounded-2xl md:rounded-3xl"
      )}>
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-border/20 bg-muted/20 shrink-0">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4" /> Games
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {gameState === "playing" && (
            <Button variant="outline" size="sm" onClick={handleAbortGame} className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-8 font-bold">
              <XOctagon className="h-3.5 w-3.5" /> Abort Game
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
        </div>
      </div>

      <CardHeader className="text-center relative p-3 sm:p-6 shrink-0">
        <div className="flex justify-center mb-1 sm:mb-2">
          <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
        </div>
        <CardTitle className="font-black tracking-tight uppercase text-lg sm:text-2xl md:text-3xl">{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm max-w-xl mx-auto">{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
          <Badge variant="outline" className="text-xs uppercase">{game.level}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 text-center flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto p-2 sm:p-6 overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6 text-center my-auto w-full max-w-3xl">
            {/* Labyrinth Telemetry Pods */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full text-left">
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-primary/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Audio Engine</span>
                <span className="text-xs sm:text-sm font-black text-foreground">TTS Synthesizer</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-cyan-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Maze Grid</span>
                <span className="text-xs sm:text-sm font-black text-cyan-300">7x7 Procedural</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-purple-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Rabbit className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Sensory Target</span>
                <span className="text-xs sm:text-sm font-black text-purple-300">Exit Extraction</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-amber-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Skill Tier</span>
                <span className="text-xs sm:text-sm font-black text-amber-300 capitalize">{game.level}</span>
              </div>
            </div>

            <p className="text-muted-foreground text-xs sm:text-base max-w-md">
              Listen carefully to spoken auditory instructions and guide your avatar safely through the labyrinth.
            </p>

            <Button onClick={() => setGameState('instructions')} className="h-11 sm:h-14 px-6 sm:px-12 text-sm sm:text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl rounded-xl">
                    <Sparkles className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                    Initialize Game
                </Button>
            </div>
        )}
        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
                <h3 className="font-bold text-center text-lg sm:text-2xl">How to Play</h3>
                <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground bg-background/50 p-3 sm:p-4 rounded-xl border border-border/20 w-full">
                    <p>1. Click 'Listen' to hear the next audio navigation command.</p>
                    <p>2. Use the arrow D-pad to move your rabbit character through the corridor.</p>
                    <p>3. Reach the green marker to clear the labyrinth!</p>
                </div>
                <Button onClick={handleStartGame} className="w-full h-11 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl shadow-xl">Enter Maze</Button>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 my-auto">
                <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-16 sm:w-16" />
                <p className="text-muted-foreground animate-pulse text-xs sm:text-base">Constructing procedural maze...</p>
            </div>
        )}
        {(gameState === "playing" || gameState === "finished") && (
            <div className="flex flex-col items-center gap-4 sm:gap-8 w-full my-auto">
                <div className="grid gap-1 sm:gap-2 p-2 sm:p-4 bg-muted/20 rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 border-primary/20 shadow-inner" style={{gridTemplateColumns: `repeat(${MAZE_SIZE}, minmax(0, 1fr))`}}>
                    {maze.map((row, y) => row.map((cell, x) => (
                        <div key={`${x}-${y}`}>{renderCell(cell, x, y)}</div>
                    )))}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full justify-center">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <p className="font-black uppercase tracking-wider text-muted-foreground text-[10px] sm:text-xs">Step {currentStep + 1} / {directions.length + 1}</p>
                        <Button 
                            onClick={() => speakDirection(currentStep)} 
                            disabled={isSpeaking || gameState === 'finished'}
                            className="font-black uppercase shadow-lg h-11 sm:h-14 px-5 sm:px-8 text-xs sm:text-sm rounded-xl"
                        >
                            {isSpeaking ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
                            Listen to Direction
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-36 sm:w-44">
                        <div />
                        <Button size="icon" onClick={() => handleUserMove("Up")} disabled={isSpeaking} className="shadow-md h-10 w-10 sm:h-12 sm:w-12 rounded-xl"><MoveUp className="h-4 w-4 sm:h-5 sm:w-5"/></Button>
                        <div />
                        <Button size="icon" onClick={() => handleUserMove("Left")} disabled={isSpeaking} className="shadow-md h-10 w-10 sm:h-12 sm:w-12 rounded-xl"><MoveLeft className="h-4 w-4 sm:h-5 sm:w-5"/></Button>
                        <Button size="icon" onClick={() => handleUserMove("Down")} disabled={isSpeaking} className="shadow-md h-10 w-10 sm:h-12 sm:w-12 rounded-xl"><MoveDown className="h-4 w-4 sm:h-5 sm:w-5"/></Button>
                        <Button size="icon" onClick={() => handleUserMove("Right")} disabled={isSpeaking} className="shadow-md h-10 w-10 sm:h-12 sm:w-12 rounded-xl"><MoveRight className="h-4 w-4 sm:h-5 sm:w-5"/></Button>
                    </div>
                </div>
            </div>
        )}
         {gameState === "finished" && (
             <div className="flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-300 my-auto">
                <CheckCircle className="text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] h-16 w-16 sm:h-24 sm:w-24"/>
                <div className="space-y-1">
                    <h2 className="font-black uppercase tracking-tight text-white text-2xl sm:text-4xl">Path Cleared!</h2>
                    <p className="font-black text-primary uppercase text-base sm:text-xl">Mission Accomplished</p>
                </div>
                <Button onClick={handleStartGame} className="h-11 sm:h-14 px-6 sm:px-12 text-xs sm:text-base bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl rounded-xl">
                    <Repeat className="mr-2 h-4 w-4" />
                    Play Again
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 sm:p-6 w-full shrink-0 max-w-4xl mx-auto border-t border-border/20">
        <Button variant="outline" asChild className="w-full sm:w-auto h-10 sm:h-11 text-xs sm:text-sm font-bold rounded-xl">
          <Link href="/games" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Link>
        </Button>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {gameState === 'playing' && (
            <Button variant="outline" onClick={handleAbortGame} className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-10 sm:h-11 font-bold rounded-xl">
              <XOctagon className="h-3.5 w-3.5" /> Abort Game
            </Button>
          )}
          {gameState !== 'idle' && gameState !== 'instructions' && (
            <Button variant="secondary" onClick={handleStartGame} className="w-full sm:w-auto h-10 sm:h-11 text-xs sm:text-sm font-bold rounded-xl"><Repeat className="mr-2 h-4 w-4"/>Reset Maze</Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}