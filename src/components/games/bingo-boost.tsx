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
import { generateVocabExercise } from "@/ai/flows/generate-vocab-exercise";
import { Loader2, Sparkles, Check, Repeat, Volume2, Star, Printer, Maximize, Minimize, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";
import { textToSpeech } from "@/ai/flows/text-to-speech";

type GameState = "idle" | "loading" | "generating_cards" | "playing" | "finished" | "instructions" | "selecting_difficulty" | "selecting_print_difficulty";
type WordDefinitionPair = {
  word: string;
  definition: string;
};
type BingoCell = {
  word: string;
  marked: boolean;
};

const BINGO_SIZE = 5;
const CLASSROOM_CARD_COUNT = 30;
const CLASSROOM_WORD_POOL_SIZE = 50;

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function BingoBoost({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [board, setBoard] = React.useState<BingoCell[][]>([]);
  const [definitions, setDefinitions] = React.useState<WordDefinitionPair[]>([]);
  const [currentDefinitionIndex, setCurrentDefinitionIndex] = React.useState(0);
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [bingoLines, setBingoLines] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    setBingoLines(0);
    try {
      const neededWords = BINGO_SIZE * BINGO_SIZE - 1; // -1 for free space
      const result = await generateVocabExercise({
        difficulty: level,
        count: neededWords,
        usedWords: usedWords,
      });

      const newWords = result.pairs.map(p => p.word);
      setUsedWords(prev => [...prev, ...newWords]);

      const shuffledWords = shuffleArray(result.pairs.map(p => p.word));
      const newBoard: BingoCell[][] = [];
      for (let i = 0; i < BINGO_SIZE; i++) {
        const row: BingoCell[] = [];
        for (let j = 0; j < BINGO_SIZE; j++) {
          const index = i * BINGO_SIZE + j;
          if (i === 2 && j === 2) {
            row.push({ word: "FREE", marked: true });
          } else {
            const wordIndex = index > 12 ? index -1 : index;
            row.push({ word: shuffledWords[wordIndex], marked: false });
          }
        }
        newBoard.push(row);
      }
      setBoard(newBoard);
      setDefinitions(shuffleArray(result.pairs));
      setCurrentDefinitionIndex(0);
      setGameState("playing");
    } catch (error) {
      console.error("Failed to start game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
      setGameState("idle");
    }
  };
  
  const handlePrintCards = async (level: SkillLevel) => {
    setGameState("generating_cards");
    setDifficulty(level);
     toast({
        title: "Generating Cards...",
        description: "Please wait while we create the classroom set.",
    });

    const generateAndPrint = async () => {
        try {
          const { pairs: wordPool } = await generateVocabExercise({
            difficulty: level,
            count: CLASSROOM_WORD_POOL_SIZE,
            usedWords: [],
          });

          if (!wordPool || wordPool.length === 0) {
            throw new Error("AI did not return any words.");
          }

          let htmlContent = `
            <html>
            <head>
              <title>Bingo Cards - ${level}</title>
              <style>
                body { font-family: sans-serif; }
                .page { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
                .bingo-card { border-collapse: collapse; margin: 20px; }
                .bingo-card th, .bingo-card td { border: 2px solid black; width: 100px; height: 100px; text-align: center; font-size: 14px; word-break: break-word; vertical-align: middle; }
                .bingo-card th { background-color: #eee; font-size: 24px; }
                .bingo-card .free-space { background-color: #ccc; font-weight: bold; }
                h1, h2 { text-align: center; }
                .call-sheet { column-count: 2; column-gap: 20px; margin: 20px; }
                .call-sheet-item { break-inside: avoid-column; margin-bottom: 10px; }
                @media print {
                    .no-print { display: none; }
                }
              </style>
            </head>
            <body>
                <div class="page">
                    <h1>Teacher's Call Sheet (${level})</h1>
                    <div class="call-sheet">
            `;

          wordPool.forEach(pair => {
            htmlContent += `<div class="call-sheet-item"><strong>${pair.word}:</strong> ${pair.definition}</div>`;
          });
          htmlContent += `</div><div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px; text-align: center; font-size: 12px; color: #aaa;">www.lingolandverse.com</div></div>`;
          
          for (let i = 0; i < CLASSROOM_CARD_COUNT; i++) {
            const cardWords = shuffleArray(wordPool).slice(0, 24);
            htmlContent += `
              <div class="page">
                <h2>LingoLandVerse Bingo! (Card ${i + 1})</h2>
                <table class="bingo-card">
                  <thead>
                    <tr><th>B</th><th>I</th><th>N</th><th>G</th><th>O</th></tr>
                  </thead>
                  <tbody>
            `;
            for (let row = 0; row < BINGO_SIZE; row++) {
              htmlContent += '<tr>';
              for (let col = 0; col < BINGO_SIZE; col++) {
                if (row === 2 && col === 2) {
                  htmlContent += '<td class="free-space">FREE</td>';
                } else {
                  const index = row * BINGO_SIZE + col;
                  const wordIndex = index > 12 ? index - 1 : index;
                  htmlContent += `<td>${cardWords[wordIndex]?.word || ''}</td>`;
                }
              }
              htmlContent += '</tr>';
            }
            htmlContent += `</tbody></table><div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 5px; text-align: center; font-size: 12px; color: #aaa; width: 500px;">www.lingolandverse.com</div></div>`;
          }
          
          htmlContent += '</body></html>';
          
          const newWindow = window.open("", "_blank");
          if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
            newWindow.focus(); 
            // Delay print slightly to allow content to render
            setTimeout(() => {
              newWindow.print();
            }, 500);
          } else {
            toast({
                variant: "destructive",
                title: "Popup Blocked",
                description: "Please allow popups for this site to print the bingo cards."
            });
          }

        } catch (error) {
          console.error("Failed to generate cards:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not generate bingo cards. Please try again.",
          });
        } finally {
            setGameState("idle");
        }
    };

    if (document.fullscreenElement) {
        const onFullscreenChange = () => {
            if (!document.fullscreenElement) {
                document.removeEventListener('fullscreenchange', onFullscreenChange);
                generateAndPrint();
            }
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.exitFullscreen();
    } else {
        generateAndPrint();
    }
  };


  const speakDefinition = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const { audio } = await textToSpeech(text);
      const audioEl = new Audio(audio);
      audioEl.play();
      audioEl.onended = () => setIsSpeaking(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Audio Error", description: "Could not play audio." });
      setIsSpeaking(false);
    }
  }

  const markCell = (row: number, col: number) => {
    const cell = board[row][col];
    if (cell.word !== definitions[currentDefinitionIndex].word) {
      toast({ variant: "destructive", title: "Oops!", description: "That's not the right word." });
      return;
    }

    const newBoard = [...board];
    newBoard[row][col].marked = true;
    setBoard(newBoard);
    checkBingo(newBoard);
    
    if (currentDefinitionIndex < definitions.length - 1) {
        setCurrentDefinitionIndex(prev => prev + 1);
    } else {
        setGameState("finished");
    }
  };

  const checkBingo = (currentBoard: BingoCell[][]) => {
    let lines = 0;
    // Check rows
    for (let i = 0; i < BINGO_SIZE; i++) {
      if (currentBoard[i].every(cell => cell.marked)) lines++;
    }
    // Check columns
    for (let j = 0; j < BINGO_SIZE; j++) {
      if (currentBoard.every(row => row[j].marked)) lines++;
    }
    // Check diagonals
    if (currentBoard.every((row, i) => row[i].marked)) lines++;
    if (currentBoard.every((row, i) => row[BINGO_SIZE - 1 - i].marked)) lines++;
    
    if(lines > bingoLines) {
        toast({ title: "BINGO!", description: `You've completed ${lines} line(s)!`, className: "bg-green-500 text-white" });
    }
    setBingoLines(lines);
  };
  
  const resetGame = () => {
    setGameState("idle");
    setDifficulty(null);
    setUsedWords([]);
  }

  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
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
        {difficulty && (
            <div className="flex justify-center pt-2">
                <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty.toUpperCase()}</Badge>
            </div>
        )}
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready for a game of vocabulary bingo?</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                        <Sparkles className={cn("mr-2", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Start Solo Game
                    </Button>
                     <Button onClick={() => setGameState('selecting_print_difficulty')} size={isFullscreen ? "lg" : "default"} variant="secondary" className={cn("font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                        <Printer className={cn("mr-2", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Print Card Set
                    </Button>
                </div>
            </div>
        )}
         {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. The AI will give you a bingo card with vocabulary words.</p>
                    <p>2. Listen to the definition provided by the AI.</p>
                    <p>3. Find the matching word on your bingo card and click it to mark it off.</p>
                    <p>4. The first to get five words in a row (horizontally, vertically, or diagonally) wins!</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Initialize</Button>
            </div>
        )}
         {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-8">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Choose Challenge Level</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>{level}</Button>
                    ))}
                </div>
            </div>
        )}
        {gameState === "selecting_print_difficulty" && (
             <div className="flex flex-col items-center gap-8">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Set for Classroom Print</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button key={level} onClick={() => handlePrintCards(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>{level}</Button>
                    ))}
                </div>
            </div>
        )}
        { (gameState === "loading" || gameState === "generating_cards") && 
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>{gameState === 'loading' ? "Synchronizing bingo data..." : "Compiling classroom cards..."}</p>
            </div>
        }
        {gameState === "playing" && board.length > 0 && (
          <div className="flex flex-col items-center gap-8 w-full max-w-5xl">
             <div className={cn("p-8 rounded-[2rem] bg-muted/20 backdrop-blur-sm w-full text-center border-4 border-primary/20 shadow-inner", isFullscreen && "p-12")}>
                <p className={cn("font-black uppercase tracking-[0.3em] text-muted-foreground mb-4", isFullscreen ? "text-2xl" : "text-xs")}>IDENTIFY THE TARGET:</p>
                <p className={cn("font-bold italic text-white leading-tight", isFullscreen ? "text-[4vw]" : "text-2xl")}>{definitions[currentDefinitionIndex].definition}</p>
                 <Button size="lg" variant="ghost" onClick={() => speakDefinition(definitions[currentDefinitionIndex].definition)} disabled={isSpeaking} className={cn("mt-6", isFullscreen && "h-16 w-16")}>
                    <Volume2 className={cn(isFullscreen ? "h-12 w-12" : "h-6 w-6")} />
                </Button>
            </div>
            <div className={cn("grid gap-3", isFullscreen ? "gap-6" : "")} style={{ gridTemplateColumns: `repeat(${BINGO_SIZE}, 1fr)` }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Button
                    key={`${rowIndex}-${colIndex}`}
                    variant={cell.marked ? "default" : "outline"}
                    className={cn(
                      "transition-all duration-300 font-black uppercase text-center break-words whitespace-normal shadow-lg",
                      isFullscreen ? "h-32 w-32 text-xl rounded-2xl border-4" : "h-16 w-16 md:h-20 md:w-20 text-[10px] md:text-xs",
                      cell.word === "FREE" && "bg-primary text-white border-primary",
                      cell.marked && cell.word !== "FREE" && "bg-amber-400 border-amber-500 text-white scale-95 opacity-80"
                    )}
                    onClick={() => cell.word !== "FREE" && markCell(rowIndex, colIndex)}
                    disabled={cell.marked}
                  >
                    {cell.word}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
        {gameState === "finished" && (
             <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
                <div className="space-y-2">
                    <h3 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Victory!</h3>
                    <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-xl")}>Lines Completed: {bingoLines}</p>
                </div>
                <Button onClick={() => handleStartGame(difficulty!)} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Play Again
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Back to Games</Link>
        </Button>
        {gameState !== "idle" && (
            <Button variant="secondary" onClick={resetGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Abort Session</Button>
        )}
      </CardFooter>
    </Card>
  );
}
