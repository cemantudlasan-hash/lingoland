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
import { Loader2, Sparkles, Check, Repeat, Volume2, Star, Printer, Maximize, Minimize, Trophy, ArrowRight, BookOpen, Layers } from "lucide-react";
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
const GAMEPLAY_WORD_POOL_SIZE = 50;

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
  const [reviewList, setReviewList] = React.useState<WordDefinitionPair[]>([]);
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
    setReviewList([]);
    try {
      // Generate a rich vocabulary pool of 50 words
      const result = await generateVocabExercise({
        difficulty: level,
        count: GAMEPLAY_WORD_POOL_SIZE,
        usedWords: [],
      });

      const allPairs = result.pairs;
      if (!allPairs || allPairs.length < 24) {
        throw new Error("Insufficient vocab words returned by AI");
      }

      // Populate 5x5 board with 24 random selections from this 50-word pool
      const boardPairs = shuffleArray(allPairs).slice(0, 24);
      const boardWords = boardPairs.map(p => p.word);

      const newBoard: BingoCell[][] = [];
      for (let i = 0; i < BINGO_SIZE; i++) {
        const row: BingoCell[] = [];
        for (let j = 0; j < BINGO_SIZE; j++) {
          const index = i * BINGO_SIZE + j;
          if (i === 2 && j === 2) {
            row.push({ word: "FREE", marked: true });
          } else {
            const wordIndex = index > 12 ? index - 1 : index;
            row.push({ word: boardWords[wordIndex], marked: false });
          }
        }
        newBoard.push(row);
      }
      setBoard(newBoard);

      // Shuffling the 50 definitions to call them randomely one by one
      setDefinitions(shuffleArray(allPairs));
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
  };

  const markCell = (row: number, col: number) => {
    const cell = board[row][col];
    
    // Validate matching the correct answer
    if (cell.word.toLowerCase() !== definitions[currentDefinitionIndex].word.toLowerCase()) {
      toast({ variant: "destructive", title: "Oops!", description: "That is not the correct word for the active question." });
      return;
    }

    const newBoard = [...board];
    newBoard[row][col].marked = true;
    setBoard(newBoard);
    checkBingo(newBoard);
    toast({
      title: "Cell Marked!",
      description: `"${cell.word}" marked on your board.`,
      className: "bg-emerald-500 text-white border-none",
    });
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
    
    if (lines > bingoLines) {
        toast({ title: "BINGO!", description: `Completed ${lines} line(s)! Click "BINGO!" below to declare victory!`, className: "bg-amber-500 text-slate-950 font-bold" });
    }
    setBingoLines(lines);
  };

  const handleNextWord = () => {
    // Add current word to the review list
    const currentPair = definitions[currentDefinitionIndex];
    if (!reviewList.some(item => item.word.toLowerCase() === currentPair.word.toLowerCase())) {
      setReviewList(prev => [currentPair, ...prev]);
    }

    if (currentDefinitionIndex < definitions.length - 1) {
      setCurrentDefinitionIndex(prev => prev + 1);
    } else {
      toast({
        title: "Drawn All Words",
        description: "You have successfully finished drawing all words from the vocab bank.",
      });
    }
  };
  
  const resetGame = () => {
    setGameState("idle");
    setDifficulty(null);
    setReviewList([]);
  };

  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col relative overflow-hidden",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-slate-950 justify-center p-8" 
            : "max-w-5xl mx-auto bg-slate-900/40 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl"
      )}>
      
      {/* Decorative glows */}
      <div className="absolute top-0 left-[20%] w-72 h-72 rounded-full blur-[120px] bg-purple-500/10 pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-[20%] w-72 h-72 rounded-full blur-[120px] bg-indigo-500/10 pointer-events-none -z-10" />

      <CardHeader className="text-center relative border-b border-slate-850/60 pb-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1.5 text-slate-450 hover:text-white hover:bg-slate-800 rounded-xl z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-2">
                <Icon className="w-14 h-14 text-indigo-400 animate-pulse" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight text-white uppercase", isFullscreen ? "text-5xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn("text-slate-400 text-sm mt-1", isFullscreen && "text-lg")}>{game.description}</CardDescription>
        {difficulty && (
            <div className="flex justify-center pt-2">
                <Badge variant="outline" className={cn("bg-indigo-500/10 border-indigo-500/20 text-indigo-300 font-extrabold uppercase", isFullscreen && "text-base px-6 py-1")}>{difficulty}</Badge>
            </div>
        )}
      </CardHeader>

      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center flex-grow p-6 md:p-8",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[26rem]"
      )}>
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-6 max-w-md py-6">
                <p className={cn("text-slate-300 font-medium leading-relaxed", isFullscreen ? "text-2xl" : "text-base")}>
                  Ready for a premium game of interactive vocabulary Bingo? Re-engineered with modern review sheets, dynamic word banks, and custom reward states.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button onClick={() => setGameState('instructions')} className={cn("bg-gradient-to-r from-purple-500 to-indigo-650 hover:from-purple-400 hover:to-indigo-550 text-white font-black shadow-xl rounded-xl h-12 px-6", isFullscreen && "h-16 px-12 text-xl rounded-2xl")}>
                        <Sparkles className="mr-2 h-5 w-5" /> Start Solo Game
                    </Button>
                     <Button onClick={() => setGameState('selecting_print_difficulty')} variant="outline" className={cn("border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white font-black rounded-xl h-12 px-6", isFullscreen && "h-16 px-12 text-xl rounded-2xl")}>
                        <Printer className="mr-2 h-5 w-5" /> Print Card Set
                    </Button>
                </div>
            </div>
        )}

         {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-6 text-center bg-slate-950/40 backdrop-blur-sm rounded-3xl mx-auto border border-slate-850 p-6 md:p-8 max-w-xl shadow-lg"
             )}>
                <h3 className="font-black uppercase tracking-widest text-white text-xl">How to Play</h3>
                <div className="text-left space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>The AI generates a customized 50-word bank and places 24 random cells on your board.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Observe the definition at the top. The correct word answer is highlighted underneath.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>Locate that exact word on your board and click to mark it green.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>Click <strong>"Next Word"</strong> to draw the next question. Completed words will slide into your study Word Bank.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">5</span>
                      <span>Get a line (row, column, diagonal), then hit the massive <strong>"BINGO!"</strong> button to win!</span>
                    </p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} className="w-full bg-gradient-to-r from-purple-500 to-indigo-650 hover:opacity-90 font-black h-12 rounded-xl mt-4">
                  Proceed to Setup
                </Button>
            </div>
        )}

         {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-6 py-6">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Choose Challenge Level</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button 
                          key={level} 
                          onClick={() => handleStartGame(level as SkillLevel)} 
                          variant="outline" 
                          className="font-black uppercase border-slate-800 text-slate-350 hover:bg-slate-850 hover:text-white rounded-xl h-12 px-6"
                        >
                          {level}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {gameState === "selecting_print_difficulty" && (
             <div className="flex flex-col items-center gap-6 py-6">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Set for Classroom Print</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button 
                          key={level} 
                          onClick={() => handlePrintCards(level as SkillLevel)} 
                          variant="outline" 
                          className="font-black uppercase border-slate-800 text-slate-350 hover:bg-slate-850 hover:text-white rounded-xl h-12 px-6"
                        >
                          {level}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        { (gameState === "loading" || gameState === "generating_cards") && 
            <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Loader2 className="animate-spin text-indigo-400 h-12 w-12" />
                <p className="text-slate-400 text-sm font-medium animate-pulse">{gameState === 'loading' ? "Synchronizing vocabulary data..." : "Compiling classroom cards..."}</p>
            </div>
        }

        {gameState === "playing" && board.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full text-left items-start">
            
            {/* Left Column: Board and Active drawn Question (8 cols) */}
            <div className="lg:col-span-8 space-y-6 flex flex-col items-center">
              
              {/* Question / Correct Answer Call Card */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm w-full text-center shadow-lg relative">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">
                  <BookOpen className="h-4 w-4" />
                  <span>Drawn question {currentDefinitionIndex + 1} / {definitions.length}</span>
                </div>
                <h4 className="font-extrabold text-white text-lg md:text-xl leading-relaxed italic px-4 min-h-[50px] flex items-center justify-center">
                  "{definitions[currentDefinitionIndex].definition}"
                </h4>
                
                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                  <Button size="sm" variant="ghost" onClick={() => speakDefinition(definitions[currentDefinitionIndex].definition)} disabled={isSpeaking} className="h-9 w-9 rounded-full bg-slate-850 hover:bg-slate-800 text-indigo-300">
                    <Volume2 className="h-4.5 w-4.5" />
                  </Button>
                  
                  {/* Dynamic Correct Answer Indicator (Requested highlight) */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-xl flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-450">Correct Word:</span>
                    <span className="text-sm font-black text-emerald-350 uppercase">{definitions[currentDefinitionIndex].word}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-850/60 flex items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-550 font-bold max-w-[200px] text-left leading-normal">
                    📌 Find "{definitions[currentDefinitionIndex].word}" on your grid, mark it, and click draw to proceed.
                  </div>
                  
                  {/* Draw Next word button */}
                  <Button 
                    onClick={handleNextWord} 
                    className="h-10 px-4 bg-gradient-to-r from-indigo-650 to-indigo-850 hover:opacity-90 font-bold rounded-xl text-xs flex items-center gap-1.5 text-white"
                  >
                    <span>Next Word</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bingo 5x5 Grid */}
              <div className="p-4 rounded-3xl bg-slate-950/40 border border-slate-850/80 shadow-inner flex justify-center items-center w-full max-w-[480px]">
                <div className="grid gap-2 md:gap-3 w-full" style={{ gridTemplateColumns: `repeat(${BINGO_SIZE}, 1fr)` }}>
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isFree = cell.word === "FREE";
                      const isCorrectAnswer = cell.word.toLowerCase() === definitions[currentDefinitionIndex].word.toLowerCase();
                      
                      return (
                        <Button
                          key={`${rowIndex}-${colIndex}`}
                          variant={cell.marked ? "default" : "outline"}
                          className={cn(
                            "h-14 w-full text-[9px] sm:text-xs font-black uppercase text-center break-all whitespace-normal shadow-md transition-all rounded-xl",
                            isFree && "bg-gradient-to-br from-indigo-500 to-indigo-650 text-white border-none cursor-default shadow-indigo-500/10",
                            cell.marked && !isFree && "bg-gradient-to-br from-emerald-500 to-emerald-650 border-none text-white scale-[0.96] cursor-default shadow-emerald-500/10",
                            !cell.marked && isCorrectAnswer && "border-indigo-500/50 bg-indigo-500/5 text-indigo-200 animate-pulse border-2"
                          )}
                          onClick={() => !isFree && markCell(rowIndex, colIndex)}
                          disabled={cell.marked}
                        >
                          {cell.word}
                        </Button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Glowing Manual BINGO Trigger (Requested BINGO button) */}
              <div className="w-full flex justify-center pt-2">
                <Button 
                  onClick={() => setGameState("finished")} 
                  className={cn(
                    "w-full max-w-[320px] h-12 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                    bingoLines > 0 
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 shadow-amber-500/30 animate-bounce border border-amber-300"
                      : "bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed hover:bg-slate-800 hover:text-slate-500"
                  )}
                  disabled={bingoLines === 0}
                >
                  <Trophy className="h-4.5 w-4.5" />
                  <span>Declare BINGO! ({bingoLines} lines)</span>
                </Button>
              </div>

            </div>

            {/* Right Column: Review Word Bank panel (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm space-y-4 h-full min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-350">Review Word Bank</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-indigo-300 bg-indigo-500/5 border-indigo-500/10">Called: {reviewList.length}</Badge>
              </div>

              <div className="flex-grow overflow-y-auto max-h-[360px] pr-1 space-y-2.5">
                {reviewList.length > 0 ? (
                  reviewList.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1 hover:border-slate-800 transition-all">
                      <p className="text-xs font-black uppercase text-emerald-450 tracking-wider flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        <span>{item.word}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 leading-normal italic">
                        "{item.definition}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-center text-slate-500 p-4 border border-dashed border-slate-850 rounded-2xl">
                    <BookOpen className="h-8 w-8 text-slate-650 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">Empty bank</p>
                    <p className="text-[10px] text-slate-550 leading-normal max-w-[150px] mt-1">Finished vocab items appear here for study.</p>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-500 font-bold leading-normal pt-2 border-t border-slate-850">
                📖 Review drawn terms to identify skipped or missed definitions.
              </div>
            </div>

          </div>
        )}

        {gameState === "finished" && (
             <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500 py-6 max-w-md">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
                  <Trophy className="h-32 w-32 text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.65)] relative animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                
                <div className="space-y-2.5 text-center">
                    <h3 className="font-black uppercase tracking-tighter text-white text-3xl sm:text-4xl leading-tight">Congratulations! <br />you got it BINGO!</h3>
                    <p className="text-sm font-black text-indigo-400 uppercase tracking-widest">Completed lines count: {bingoLines}</p>
                </div>

                <div className="flex flex-col gap-3 w-full pt-4">
                  {/* Retry Game button */}
                  <Button 
                    onClick={() => handleStartGame(difficulty!)} 
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-650 hover:from-purple-400 hover:to-indigo-550 text-white font-black shadow-lg rounded-xl flex items-center justify-center gap-2 text-sm"
                  >
                    <Repeat className="h-4.5 w-4.5" />
                    <span>Retry Game</span>
                  </Button>

                  {/* Back to difficulty selector */}
                  <Button 
                    onClick={() => setGameState('selecting_difficulty')} 
                    variant="secondary" 
                    className="w-full h-12 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 font-bold rounded-xl text-sm"
                  >
                    Back to Difficulty
                  </Button>

                  {/* Back to games lobby */}
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full h-12 border-slate-800 text-slate-350 hover:bg-slate-850 hover:text-white font-bold rounded-xl text-sm"
                  >
                    <Link href="/games">Back to Classroom Games</Link>
                  </Button>
                </div>
            </div>
        )}
      </CardContent>

      <CardFooter className={cn("flex justify-between items-center gap-4 pt-6 border-t border-slate-850/60 pb-6 p-6 md:p-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild className="h-10 border-slate-850 text-slate-400 hover:bg-slate-850 hover:text-white rounded-xl">
          <Link href="/games">Back to Games</Link>
        </Button>
        {gameState !== "idle" && (
            <Button variant="secondary" onClick={resetGame} className="h-10 bg-slate-850 text-slate-300 hover:bg-slate-800 rounded-xl">Abort Session</Button>
        )}
      </CardFooter>
    </Card>
  );
}
