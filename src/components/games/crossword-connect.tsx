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
import { Loader2, Sparkles, HelpCircle, Check, Repeat, RotateCcw, Maximize, Minimize, BookOpen, ArrowLeft, XOctagon, ShieldCheck, Zap } from "lucide-react";
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
        "w-full transition-all duration-500 flex flex-col justify-between overflow-y-auto overflow-x-hidden max-w-full",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-between p-3 sm:p-6" 
            : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      {/* Universal Game Nav Header */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-border/20 bg-muted/20">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4" /> Games
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {gameState !== 'idle' && (
            <Button variant="outline" size="sm" onClick={resetGame} className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-8">
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
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
        </div>
      </div>

      <CardHeader className="text-center relative p-4 sm:p-6">
        {!isFullscreen && (
            <div className="flex justify-center mb-2 sm:mb-4">
                <Icon className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-3xl sm:text-5xl md:text-6xl" : "text-xl sm:text-2xl md:text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn("text-xs sm:text-sm", isFullscreen && "text-lg sm:text-2xl mt-2")}>{game.description}</CardDescription>
        {gameState !== 'idle' && gameState !== 'instructions' && (
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-2">
                {difficulty && <Badge variant="outline" className={cn("text-xs", isFullscreen && "text-base sm:text-xl px-4 sm:px-6 py-1")}>{difficulty.toUpperCase()}</Badge>}
                {theme && <Badge variant="secondary" className={cn("text-xs", isFullscreen && "text-base sm:text-xl px-4 sm:px-6 py-1")}>{theme}</Badge>}
            </div>
        )}
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-stretch justify-start p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-y-auto overflow-x-hidden pb-16",
          isFullscreen ? "min-h-0 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-12" : "w-full flex-1 min-h-[calc(100dvh-16rem)]"
      )}>
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto py-2">
            {/* Crossword Telemetry Pods */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full">
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-primary/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Generator</span>
                <span className="text-xs sm:text-sm font-black text-foreground">AI Semantic</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-cyan-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Themes</span>
                <span className="text-sm sm:text-base font-black text-cyan-300">6 Domains</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-purple-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Tiers</span>
                <span className="text-sm sm:text-base font-black text-purple-300">3 Levels</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-emerald-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Assistance</span>
                <span className="text-sm sm:text-base font-black text-emerald-300">Letter Reveal</span>
              </div>
            </div>

            {/* Split Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full text-left">
              <div className="p-4 sm:p-6 rounded-2xl bg-muted/30 border border-border/40 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Puzzle Setup
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Select a skill tier and semantic theme to compile an interactive interconnected crossword grid in real-time.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skill Difficulty</label>
                    <div className="flex flex-wrap gap-2">
                      {["beginner", "intermediate", "advanced"].map(level => (
                        <Button 
                          key={level} 
                          onClick={() => setDifficulty(level as SkillLevel)} 
                          variant={difficulty === level ? 'default' : 'outline'} 
                          size="sm"
                          className="font-black uppercase text-xs rounded-xl"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Puzzle Theme</label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {THEMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
                  <Button 
                    onClick={() => {
                      if (!difficulty) setDifficulty('intermediate');
                      handleStartGame();
                    }} 
                    size="lg" 
                    className="w-full sm:w-1/2 h-11 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black uppercase text-xs sm:text-sm rounded-xl shadow-lg"
                  >
                    Start Puzzle
                  </Button>
                  <Button 
                    onClick={() => setGameState('instructions')} 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-1/2 h-11 sm:h-12 font-bold uppercase rounded-xl text-xs sm:text-sm"
                  >
                    <BookOpen className="mr-2 h-4 w-4" /> How to Play
                  </Button>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-muted/30 border border-border/40 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Crossword Directives
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">1.</span>
                      <span>Read across and down definitions to decipher vocabulary words.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">2.</span>
                      <span>Click any cell to type a letter. The cursor automatically advances rightwards.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">3.</span>
                      <span>Stuck? Click a cell and use "Reveal" to uncover a difficult letter.</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <span className="text-[11px] font-mono text-primary font-bold">Semantic Vocabulary Nexus Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {gameState === 'instructions' && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full",
                 isFullscreen ? "p-4 sm:p-16 max-w-5xl" : "p-4 sm:p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-2 sm:mb-4", isFullscreen ? "text-xl sm:text-4xl" : "text-lg sm:text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-3 sm:space-y-4", isFullscreen ? "text-sm sm:text-2xl" : "text-xs sm:text-base")}>
                    <p>1. The AI generates a crossword puzzle based on your difficulty and theme.</p>
                    <p>2. Read the "Across" and "Down" clues to figure out the words.</p>
                    <p>3. Click on a square in the grid and type your letter.</p>
                    <p>4. Click "Check Puzzle" to verify. Correct letters turn green.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-4 sm:mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base rounded-xl sm:rounded-2xl", isFullscreen && "sm:h-20 sm:px-16 sm:text-3xl sm:rounded-3xl")}>Let's Play!</Button>
            </div>
        )}
        {gameState === 'selecting_difficulty' && (
              <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-md">
                <div className="space-y-3 sm:space-y-4 text-center w-full">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-sm sm:text-3xl" : "text-xs sm:text-sm")}>1. Choose Difficulty</p>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        {["beginner", "intermediate", "advanced"].map(level => (
                            <Button key={level} onClick={() => setDifficulty(level as SkillLevel)} variant={difficulty === level ? 'default' : 'outline'} className={cn("font-black uppercase text-xs sm:text-sm h-10 sm:h-12 px-3 sm:px-6 rounded-xl", isFullscreen && "sm:h-16 sm:px-10 sm:text-xl sm:rounded-2xl sm:border-4")}>{level}</Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-center w-full">
                    <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-sm sm:text-3xl" : "text-xs sm:text-sm")}>2. Choose Theme</p>
                    <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className={cn("w-full max-w-[280px] mx-auto", isFullscreen && "sm:w-[400px] sm:h-16 sm:text-xl")}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {THEMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleStartGame} size="lg" disabled={!difficulty} className={cn("mt-2 sm:mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black w-full sm:w-auto h-11 sm:h-14 text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl", isFullscreen && "sm:h-20 sm:px-16 sm:text-3xl sm:rounded-3xl")}>Generate Puzzle</Button>
              </div>
        )}
        {gameState === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-14 w-14 sm:h-24 sm:w-24" : "h-10 w-10 sm:h-12 sm:w-12")} />
                <p className={cn("text-muted-foreground animate-pulse text-xs sm:text-base", isFullscreen ? "text-base sm:text-3xl" : "text-base sm:text-lg")}>Mapping interconnected vocabulary...</p>
            </div>
        )}
        
        {(gameState === 'playing' || gameState === 'finished') && (
          <div className={cn("flex w-full max-w-full flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-center overflow-x-hidden", isFullscreen && "max-w-7xl")}>
            <div className="w-full max-w-full overflow-x-auto flex justify-center py-2">
              <div
                className={cn("grid gap-1 rounded-2xl sm:rounded-3xl border-2 sm:border-4 bg-background p-2 sm:p-4 shadow-2xl", isFullscreen && "gap-1 sm:gap-2 p-2 sm:p-6")}
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
                          className={cn("bg-transparent", isFullscreen ? "h-7 w-7 sm:h-11 sm:w-11 md:h-14 md:w-14" : "h-6 w-6 sm:h-8 sm:h-8 md:h-10 md:w-10")}
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
                        className={cn("relative", isFullscreen ? "h-7 w-7 sm:h-11 sm:w-11 md:h-14 md:w-14" : "h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10")}
                      >
                        {clueNumber && (
                          <span className={cn("absolute top-0 left-0.5 font-black text-muted-foreground", isFullscreen ? "text-[8px] sm:text-sm" : "text-[7px] sm:text-[8px] md:text-[10px]")}>
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
                            'h-full w-full bg-white text-center font-black uppercase text-black dark:bg-card-foreground/10 border sm:border-2 rounded transition-all',
                            isFullscreen ? "text-xs sm:text-2xl md:text-3xl" : "text-xs sm:text-base md:text-lg",
                            cell.isCorrect === true && 'bg-green-500 text-white border-green-600',
                            cell.isCorrect === false && 'bg-red-500 text-white border-red-600',
                            activeCell?.row === rowIndex && activeCell?.col === colIndex && 'ring-2 sm:ring-4 ring-primary border-primary'
                          )}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className={cn("w-full flex-1 rounded-2xl sm:rounded-3xl bg-muted/20 border-2 sm:border-4 p-3 sm:p-6 shadow-inner", isFullscreen ? "h-56 sm:h-[60vh] max-w-xl" : "lg:max-w-md h-64 sm:h-80 md:h-96")}>
                <ScrollArea className="h-full pr-2 sm:pr-4">
                    <div className={cn("flex flex-col gap-4 sm:gap-8", isFullscreen && "gap-6 sm:gap-12")}>
                        <div className="text-left">
                             <h3 className={cn("border-b-2 sm:border-b-4 border-primary font-black uppercase tracking-widest text-primary mb-2 sm:mb-4", isFullscreen ? "text-base sm:text-2xl" : "text-sm sm:text-lg")}>Across</h3>
                             <div className={cn("space-y-1.5 sm:space-y-3", isFullscreen ? "text-xs sm:text-xl" : "text-xs sm:text-sm")}>
                                {clues.across.map((c) => (
                                <p key={c.number}>
                                    <strong className="text-primary">{c.number}.</strong> {c.clue}
                                </p>
                                ))}
                            </div>
                        </div>
                         <div className="text-left">
                             <h3 className={cn("border-b-2 sm:border-b-4 border-primary font-black uppercase tracking-widest text-primary mb-2 sm:mb-4", isFullscreen ? "text-base sm:text-2xl" : "text-sm sm:text-lg")}>Down</h3>
                             <div className={cn("space-y-1.5 sm:space-y-3", isFullscreen ? "text-xs sm:text-xl" : "text-xs sm:text-sm")}>
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
      <CardFooter className={cn("flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-4 p-3 sm:p-6 pt-3 sm:pt-6 w-full max-w-full border-t border-border/20", isFullscreen && "max-w-7xl mx-auto w-full pb-4 sm:pb-6")}>
        <Button variant="outline" asChild size="default" className={cn("w-full sm:w-auto h-9 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-bold rounded-xl", isFullscreen && "sm:h-16 sm:px-10 sm:text-xl sm:rounded-2xl")}>
          <Link href="/games">Back to Games</Link>
        </Button>
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 w-full sm:w-auto">
            {gameState === 'playing' && (
                <>
                    <Button variant="secondary" onClick={handleRevealLetter} size="default" className={cn("h-9 sm:h-12 px-2.5 sm:px-5 text-xs sm:text-sm font-bold rounded-xl", isFullscreen && "sm:h-16 sm:px-10 sm:text-xl sm:rounded-2xl")}><HelpCircle className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4"/>Reveal</Button>
                    <Button onClick={handleCheckAnswers} size="default" className={cn("bg-green-600 hover:bg-green-700 text-white font-black h-9 sm:h-12 px-3 sm:px-6 text-xs sm:text-sm rounded-xl", isFullscreen && "sm:h-16 sm:px-12 sm:text-2xl sm:rounded-2xl")}><Check className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4"/>Analyze Grid</Button>
                    <Button onClick={handleStartGame} variant="secondary" size="default" className={cn("h-9 sm:h-12 px-2.5 sm:px-5 text-xs sm:text-sm font-bold rounded-xl", isFullscreen && "sm:h-16 sm:px-10 sm:text-xl sm:rounded-2xl")}><Repeat className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4"/>Reroll</Button>
                </>
            )}
            {gameState === 'finished' && <Button onClick={handleStartGame} size="default" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-10 sm:h-14 px-4 sm:px-8 text-xs sm:text-lg rounded-xl", isFullscreen && "sm:h-16 sm:px-12 sm:text-2xl sm:rounded-2xl")}><Repeat className="mr-1.5 sm:mr-2 h-4 w-4"/>New Puzzle</Button>}
            {gameState !== 'idle' && (
                <Button variant="destructive" onClick={resetGame} size="default" className={cn("h-9 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm font-bold rounded-xl gap-1.5", isFullscreen && "sm:h-16 sm:px-8 sm:text-xl sm:rounded-2xl")}>
                  <XOctagon className="h-4 w-4" /> Abort Game
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}