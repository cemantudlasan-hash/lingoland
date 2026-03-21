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
import { generateCrosswordPuzzle } from "@/ai/flows/generate-crossword-puzzle";
import { Loader2, Sparkles, HelpCircle, Check, Repeat, RotateCcw, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";
import type { CrosswordData } from "@/ai/flows/schemas/crossword-schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";

type GameState = 'idle' | 'loading' | 'playing' | 'finished' | 'instructions' | 'selecting_difficulty';
type Cell = { letter: string | null; input: string; isCorrect: boolean | null };
type Grid = (Cell | null)[][];
type Clue = { clue: string; answer: string; direction: 'across' | 'down'; row: number; col: number; number: number };

const THEMES = ["General Knowledge", "Animals", "Food & Cooking", "Science & Nature", "World Travel", "History"];

export function CrosswordConnect({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [grid, setGrid] = React.useState<Grid>([]);
  const [clues, setClues] = React.useState<{ across: Clue[]; down: Clue[] }>({ across: [], down: [] });
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [theme, setTheme] = React.useState<string>(THEMES[0]);
  const [usedAnswers, setUsedAnswers] = React.useState<string[]>([]);
  const [activeCell, setActiveCell] = React.useState<{ row: number; col: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);
  const inputRefs = React.useRef<(HTMLInputElement | null)[][]>([]);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    if (!difficulty) {
        toast({
            variant: 'destructive',
            title: 'No difficulty selected',
            description: 'Please choose a difficulty level first.',
        });
        return;
    }
    setGameState('loading');
    try {
      const puzzleData = await generateCrosswordPuzzle({ difficulty, theme, usedAnswers });
      const newAnswers = puzzleData.clues.map(c => c.answer.toUpperCase());
      setUsedAnswers(prev => [...new Set([...prev, ...newAnswers])]);
      initializePuzzle(puzzleData);
      setGameState('playing');
    } catch (error) {
      console.error('Failed to generate puzzle:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate a crossword puzzle. Please try again.',
      });
      setGameState('idle');
    }
  };

  const initializePuzzle = (puzzle: CrosswordData) => {
    const size = Math.max(...puzzle.clues.map(c => (c.direction === 'across' ? c.col + c.answer.length : c.row + c.answer.length)), ...puzzle.clues.map(c => (c.direction === 'down' ? c.row + c.answer.length : c.col + c.answer.length)));
    
    const newGrid: Grid = Array.from({ length: size }, () => Array(size).fill(null));
    const clueMap: { [key: string]: number } = {};
    let clueCounter = 1;
    const numberedClues = puzzle.clues.map(clue => {
        const key = `${clue.row}-${clue.col}`;
        if (!clueMap[key]) {
            clueMap[key] = clueCounter++;
        }
        return { ...clue, number: clueMap[key] };
    });

    const acrossClues: Clue[] = [];
    const downClues: Clue[] = [];

    numberedClues.forEach((clue) => {
      if (clue.direction === 'across') {
        acrossClues.push(clue);
        for (let i = 0; i < clue.answer.length; i++) {
            if (!newGrid[clue.row][clue.col + i]) {
                newGrid[clue.row][clue.col + i] = { letter: clue.answer[i], input: '', isCorrect: null };
            }
        }
      } else {
        downClues.push(clue);
        for (let i = 0; i < clue.answer.length; i++) {
           if (!newGrid[clue.row + i][clue.col]) {
                newGrid[clue.row + i][clue.col] = { letter: clue.answer[i], input: '', isCorrect: null };
           }
        }
      }
    });

    setGrid(newGrid);
    setClues({ across: acrossClues.sort((a,b) => a.number - b.number), down: downClues.sort((a,b) => a.number - b.number) });
    setActiveCell(null);
    inputRefs.current = Array.from({ length: size }, () => Array(size).fill(null));
  };
  
  const handleInputChange = (row: number, col: number, value: string) => {
    const newGrid = [...grid];
    if (newGrid[row]?.[col]) {
      newGrid[row]![col]!.input = value.toUpperCase();
      setGrid(newGrid);

      if (value && col + 1 < grid[0]!.length && grid[row]?.[col + 1]) {
        inputRefs.current[row]?.[col+1]?.focus();
      }
    }
  };

  const handleCellClick = (row: number, col: number) => {
      setActiveCell({row, col});
  }

  const handleCheckAnswers = () => {
    let allCorrect = true;
    const newGrid = grid.map(row => 
      row.map(cell => {
        if (!cell) return null;
        const isCorrect = cell.input === cell.letter;
        if (cell.input && !isCorrect) allCorrect = false;
        if (!cell.input) allCorrect = false;
        return { ...cell, isCorrect };
      })
    );
    setGrid(newGrid);
    if (allCorrect) {
        toast({ title: 'Congratulations!', description: 'You solved the entire puzzle!', className: 'bg-green-500 text-white' });
        setGameState('finished');
    } else {
        toast({ variant: 'destructive', title: 'Not Quite!', description: 'Some letters are incorrect. Keep trying!' });
    }
  };
  
  const handleRevealLetter = () => {
    if(!activeCell) {
        toast({variant: 'destructive', title: 'No cell selected', description: 'Click a cell to reveal its letter.'});
        return;
    }
    const { row, col } = activeCell;
    const newGrid = [...grid];
    if (newGrid[row]?.[col]) {
        newGrid[row]![col]!.input = newGrid[row]![col]!.letter!;
        setGrid(newGrid);
    }
  }
  
  const resetGame = () => {
    setGameState("idle");
    setDifficulty(null);
    setTheme(THEMES[0]);
    setUsedAnswers([]);
    setGrid([]);
    setClues({ across: [], down: [] });
  };

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
        {gameState !== 'idle' && gameState !== 'instructions' && (
            <div className="flex justify-center gap-2 pt-2">
                {difficulty && <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty.toUpperCase()}</Badge>}
                {theme && <Badge variant="secondary" className={cn(isFullscreen && "text-xl px-6 py-1")}>{theme}</Badge>}
            </div>
        )}
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-7xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to connect the words?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Start Game
            </Button>
          </div>
        )}
        {gameState === 'instructions' && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. The AI generates a crossword puzzle based on your difficulty and theme.</p>
                    <p>2. Read the "Across" and "Down" clues to figure out the words.</p>
                    <p>3. Click on a square in the grid and type your letter.</p>
                    <p>4. Click "Check Puzzle" to verify. Correct letters turn green.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>Let's Play!</Button>
            </div>
        )}
        {gameState === 'selecting_difficulty' && (
              <div className="flex flex-col items-center gap-8">
                <div className="space-y-4 text-center">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>1. Choose Difficulty</p>
                    <div className="flex gap-4">
                        {["beginner", "intermediate", "advanced"].map(level => (
                            <Button key={level} onClick={() => setDifficulty(level as SkillLevel)} variant={difficulty === level ? 'default' : 'outline'} className={cn("font-black uppercase", isFullscreen && "h-16 px-10 text-xl rounded-2xl border-4")}>{level}</Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-4 text-center">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>2. Choose Theme</p>
                    <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className={cn("w-[280px]", isFullscreen && "w-[400px] h-16 text-xl")}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {THEMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleStartGame} size="lg" disabled={!difficulty} className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Generate Puzzle</Button>
              </div>
        )}
        {gameState === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Mapping interconnected vocabulary...</p>
            </div>
        )}
        
        {(gameState === 'playing' || gameState === 'finished') && (
          <div className={cn("flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center", isFullscreen && "max-w-7xl")}>
            <div className="mx-auto flex-shrink-0 lg:mx-0">
              <div
                className={cn("grid gap-1 rounded-3xl border-4 bg-background p-4 shadow-2xl", isFullscreen && "gap-2 p-6")}
                style={{
                  gridTemplateColumns: `repeat(${grid[0]?.length || 10}, 1fr)`,
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    if (!cell) {
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={cn("bg-transparent", isFullscreen ? "h-14 w-14" : "h-8 w-8 md:h-10 md:w-10")}
                        />
                      );
                    }
                    const clueNumber =
                      clues.across.find(
                        (c) => c.row === rowIndex && c.col === colIndex
                      )?.number ||
                      clues.down.find(
                        (c) => c.row === rowIndex && c.col === colIndex
                      )?.number;
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={cn("relative", isFullscreen ? "h-14 w-14" : "h-8 w-8 md:h-10 md:w-10")}
                      >
                        {clueNumber && (
                          <span className={cn("absolute top-0 left-0.5 font-black text-muted-foreground", isFullscreen ? "text-sm" : "text-[8px] md:text-[10px]")}>
                            {clueNumber}
                          </span>
                        )}
                        <input
                          ref={(el) => {
                            if (!inputRefs.current[rowIndex])
                              inputRefs.current[rowIndex] = [];
                            inputRefs.current[rowIndex]![colIndex] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={cell.input}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          onChange={(e) =>
                            handleInputChange(rowIndex, colIndex, e.target.value)
                          }
                          className={cn(
                            'h-full w-full bg-white text-center font-black uppercase text-black dark:bg-card-foreground/10 border-2 rounded-md transition-all',
                            isFullscreen ? "text-3xl" : "text-lg",
                            cell.isCorrect === true && 'bg-green-500 text-white border-green-600',
                            cell.isCorrect === false && 'bg-red-500 text-white border-red-600',
                            activeCell?.row === rowIndex && activeCell?.col === colIndex && 'ring-4 ring-primary border-primary'
                          )}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className={cn("w-full flex-1 rounded-3xl bg-muted/20 border-4 p-6 shadow-inner", isFullscreen ? "h-[60vh] max-w-xl" : "lg:max-w-md h-96")}>
                <ScrollArea className="h-full pr-4">
                    <div className={cn("flex flex-col gap-8", isFullscreen && "gap-12")}>
                        <div className="text-left">
                             <h3 className={cn("border-b-4 border-primary font-black uppercase tracking-widest text-primary mb-4", isFullscreen ? "text-2xl" : "text-lg")}>Across</h3>
                             <div className={cn("space-y-3", isFullscreen ? "text-xl" : "text-sm")}>
                                {clues.across.map((c) => (
                                <p key={c.number}>
                                    <strong className="text-primary">{c.number}.</strong> {c.clue}
                                </p>
                                ))}
                            </div>
                        </div>
                         <div className="text-left">
                             <h3 className={cn("border-b-4 border-primary font-black uppercase tracking-widest text-primary mb-4", isFullscreen ? "text-2xl" : "text-lg")}>Down</h3>
                             <div className={cn("space-y-3", isFullscreen ? "text-xl" : "text-sm")}>
                                {clues.down.map((c) => (
                                <p key={c.number}>
                                    <strong className="text-primary">{c.number}.</strong> {c.clue}
                                </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-7xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex items-center gap-4">
            {gameState === 'playing' && (
                <>
                    <Button variant="secondary" onClick={handleRevealLetter} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}><HelpCircle className="mr-2"/>Reveal</Button>
                    <Button onClick={handleCheckAnswers} size={isFullscreen ? "lg" : "default"} className={cn("bg-green-600 hover:bg-green-700 text-white font-black", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}><Check className="mr-2"/>Analyze Grid</Button>
                    <Button onClick={handleStartGame} variant="secondary" size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}><Repeat className="mr-2"/>Reroll</Button>
                </>
            )}
            {gameState === 'finished' && <Button onClick={handleStartGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}><Repeat className="mr-2"/>New Puzzle</Button>}
            {gameState !== 'idle' && gameState !== 'instructions' && (
                <Button variant="outline" size="icon" onClick={resetGame} className={cn(isFullscreen && "h-16 w-16")}><RotateCcw className={cn(isFullscreen && "h-8 w-8")}/></Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}