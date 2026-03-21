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
import { Loader2, Sparkles, Volume2, MoveUp, MoveDown, MoveLeft, MoveRight, Rabbit, Snail, Repeat, CheckCircle, Maximize, Minimize } from "lucide-react";
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
    const baseClasses = cn(
        "flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg border-4",
        isFullscreen ? "w-20 h-20" : "w-10 h-10 md:w-12 md:h-12"
    );
    
    if (isPlayerHere) {
        return <div className={cn(baseClasses, "bg-primary text-primary-foreground border-primary scale-110 z-10")}><Rabbit className={cn(isFullscreen ? "w-12 h-12" : "w-6 h-6")}/></div>;
    }

    const hasBeenVisited = path.slice(0, currentStep + 1).some(p => p.x === x && p.y === y);

    switch(cell) {
        case 0:
            return <div className={cn(baseClasses, hasBeenVisited ? "bg-muted/50 border-white/10" : "bg-card border-white/5")}></div>;
        case 1:
            return <div className={cn(baseClasses, "bg-slate-800 border-slate-900 shadow-inner")}></div>;
        case 2:
            return <div className={cn(baseClasses, "bg-amber-400 border-amber-500 text-amber-900")}><Snail className={cn(isFullscreen ? "w-12 h-12" : "w-6 h-6")}/></div>;
        case 3:
            return <div className={cn(baseClasses, "bg-green-500 border-green-600 text-white")}><CheckCircle className={cn(isFullscreen ? "w-12 h-12" : "w-6 h-6")}/></div>;
        default:
             return <div className={cn(baseClasses, "bg-white")}></div>;
    }
  }

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
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[20rem] p-6"
      )}>
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Follow the voice to escape the maze!</p>
                <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Initialize Game
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
                    <p>1. Click 'Listen' to hear the next navigation command.</p>
                    <p>2. Use the controls to move your character across the grid.</p>
                    <p>3. Reach the green marker to clear the labyrinth!</p>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Enter Maze</Button>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Constructing procedural maze...</p>
            </div>
        )}
        {(gameState === "playing" || gameState === "finished") && (
            <div className={cn("flex flex-col items-center gap-10 w-full", isFullscreen && "max-w-5xl")}>
                <div className={cn("grid gap-2 p-4 bg-muted/20 rounded-[2rem] border-4 border-primary/20 shadow-inner", isFullscreen && "gap-4 p-8")} style={{gridTemplateColumns: `repeat(${MAZE_SIZE}, minmax(0, 1fr))`}}>
                    {maze.map((row, y) => row.map((cell, x) => (
                        <div key={`${x}-${y}`}>{renderCell(cell, x, y)}</div>
                    )))}
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-12 w-full justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <p className={cn("font-black uppercase tracking-widest text-muted-foreground", isFullscreen ? "text-2xl" : "text-xs")}>Step {currentStep + 1} / {directions.length + 1}</p>
                        <Button 
                            onClick={() => speakDirection(currentStep)} 
                            disabled={isSpeaking || gameState === 'finished'}
                            size="lg"
                            className={cn("font-black uppercase shadow-xl h-16 px-10", isFullscreen && "h-24 px-16 text-2xl rounded-3xl")}
                        >
                            {isSpeaking ? <Loader2 className="mr-3 animate-spin" /> : <Volume2 className="mr-3" />}
                            Listen to Direction
                        </Button>
                    </div>

                    <div className={cn("grid grid-cols-3 gap-3", isFullscreen ? "w-80 gap-6" : "w-48")}>
                        <div />
                        <Button size="icon" onClick={() => handleUserMove("Up")} disabled={isSpeaking} className={cn("shadow-lg", isFullscreen ? "h-20 w-20" : "h-12 w-12")}><MoveUp/></Button>
                        <div />
                        <Button size="icon" onClick={() => handleUserMove("Left")} disabled={isSpeaking} className={cn("shadow-lg", isFullscreen ? "h-20 w-20" : "h-12 w-12")}><MoveLeft/></Button>
                        <Button size="icon" onClick={() => handleUserMove("Down")} disabled={isSpeaking} className={cn("shadow-lg", isFullscreen ? "h-20 w-20" : "h-12 w-12")}><MoveDown/></Button>
                        <Button size="icon" onClick={() => handleUserMove("Right")} disabled={isSpeaking} className={cn("shadow-lg", isFullscreen ? "h-20 w-20" : "h-12 w-12")}><MoveRight/></Button>
                    </div>
                </div>
            </div>
        )}
         {gameState === "finished" && (
             <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <CheckCircle className={cn("text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")}/>
                <div className="space-y-2">
                    <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Path Cleared!</h2>
                    <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>Mission Accomplished</p>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Play Again
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== 'idle' && gameState !== 'instructions' && (
            <Button variant="secondary" onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}><Repeat className="mr-2"/>Reset Maze</Button>
        )}
      </CardFooter>
    </Card>
  );
}