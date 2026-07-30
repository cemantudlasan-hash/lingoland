"use client";

import * as React from "react";
import { createPortal, flushSync } from "react-dom";
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
  const [wordPool, setWordPool] = React.useState<WordDefinitionPair[]>([]);
  const [autoPrint, setAutoPrint] = React.useState(false);
  const [currentDefinitionIndex, setCurrentDefinitionIndex] = React.useState(0);
  const [reviewList, setReviewList] = React.useState<WordDefinitionPair[]>([]);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [bingoLines, setBingoLines] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [printData, setPrintData] = React.useState<{
    level: string;
    winnerIndices: Set<number>;
    sortedDrawnPairs: WordDefinitionPair[];
    cards: string[][];
  } | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Load session from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem("lingoland_bingo_active_session");
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.gameState) setGameState(session.gameState);
          if (session.difficulty) setDifficulty(session.difficulty);
          if (session.board) setBoard(session.board);
          if (session.definitions) setDefinitions(session.definitions);
          if (session.wordPool) setWordPool(session.wordPool);
          if (typeof session.currentDefinitionIndex === 'number') setCurrentDefinitionIndex(session.currentDefinitionIndex);
          if (session.reviewList) setReviewList(session.reviewList);
          if (typeof session.showAnswer === 'boolean') setShowAnswer(session.showAnswer);
          if (typeof session.bingoLines === 'number') setBingoLines(session.bingoLines);
        } catch (e) {
          console.error("Failed to restore saved bingo session:", e);
        }
      }
    }
  }, []);

  // Save session to localStorage when states change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (gameState !== "idle" && gameState !== "loading" && gameState !== "generating_cards") {
        const session = {
          gameState,
          difficulty,
          board,
          definitions,
          wordPool,
          currentDefinitionIndex,
          reviewList,
          showAnswer,
          bingoLines,
        };
        localStorage.setItem("lingoland_bingo_active_session", JSON.stringify(session));
      }
    }
  }, [gameState, difficulty, board, definitions, wordPool, currentDefinitionIndex, reviewList, showAnswer, bingoLines]);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async (level: SkillLevel, triggerAutoPrint = false) => {
    setDifficulty(level);
    setGameState("loading");
    setBingoLines(0);
    setReviewList([]);
    if (triggerAutoPrint) {
      setAutoPrint(true);
    }
    try {
      let seenWords: string[] = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem("lingoland_bingo_seen_words");
          if (stored) {
            seenWords = JSON.parse(stored);
          }
        } catch (e) {}
      }

      const result = await generateVocabExercise({
        difficulty: level,
        count: GAMEPLAY_WORD_POOL_SIZE,
        usedWords: seenWords,
      });
      const allPairs = result.pairs;

      if (!allPairs || allPairs.length < 24) {
        throw new Error("Insufficient vocab words returned by AI");
      }

      if (typeof window !== 'undefined') {
        try {
          const newSeen = Array.from(new Set([...seenWords, ...allPairs.map(p => p.word)]));
          localStorage.setItem("lingoland_bingo_seen_words", JSON.stringify(newSeen.slice(-150)));
        } catch (e) {}
      }

      setWordPool(allPairs);

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

      // Shuffling exactly the 24 board word pairs to be drawn one by one
      setDefinitions(shuffleArray(boardPairs));
      setCurrentDefinitionIndex(0);
      setShowAnswer(false);
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
  
  const handlePrintCurrentGameCards = () => {
    if (!difficulty || definitions.length === 0 || wordPool.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Game data is not fully loaded yet. Please wait.",
      });
      return;
    }

    toast({
      title: "Generating Cards...",
      description: "Creating the classroom set with 2-3 guaranteed BINGO winners.",
    });

    try {
      const level = difficulty;
      // Drawn words in this game
      const drawnWords = definitions.map(p => p.word);
      const drawnWordsLower = drawnWords.map(w => w.toLowerCase());

      // Non-drawn words from the 50-word pool
      const nonDrawnPairs = wordPool.filter(p => !drawnWordsLower.includes(p.word.toLowerCase()));
      const nonDrawnWords = nonDrawnPairs.map(p => p.word);

      // Determine winning card indices (2-3 cards)
      const numWinners = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const cardIndices = Array.from({ length: 30 }, (_, i) => i);
      const shuffledIndices = shuffleArray(cardIndices);
      const winnerIndices = new Set(shuffledIndices.slice(0, numWinners));

      // Helper to check if cell is blocking
      const isBlockingCell = (row: number, col: number): boolean => {
        return (row === 0 && col === 0) ||
               (row === 1 && col === 1) ||
               (row === 2 && col === 3) ||
               (row === 3 && col === 4) ||
               (row === 4 && col === 2) ||
               (row === 4 && col === 0);
      };

      const sortedDrawnPairs = [...definitions].sort((a, b) => a.word.localeCompare(b.word));

      const cards: string[][] = [];
      for (let i = 0; i < 30; i++) {
        const isWinner = winnerIndices.has(i);
        let cardWords: string[] = [];

        if (isWinner) {
          // Winning card: fill with all 24 drawn words
          cardWords = shuffleArray(drawnWords);
        } else {
          // Losing card: fill blocking cells with non-drawn words, others with drawn words
          const shuffledNonDrawn = shuffleArray(nonDrawnWords);
          const shuffledDrawn = shuffleArray(drawnWords);
          
          let blockingIdx = 0;
          let drawnIdx = 0;

          for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
              if (r === 2 && c === 2) continue; // FREE space
              if (isBlockingCell(r, c)) {
                cardWords.push(shuffledNonDrawn[blockingIdx++] || "");
              } else {
                cardWords.push(shuffledDrawn[drawnIdx++] || "");
              }
            }
          }
        }
        cards.push(cardWords);
      }

      const printGameCards = () => {
        flushSync(() => {
          setPrintData({
            level,
            winnerIndices,
            sortedDrawnPairs,
            cards,
          });
          setIsPrinting(true);
        });
        setTimeout(() => {
          window.print();
        }, 150);
      };

      if (document.fullscreenElement) {
        const onFullscreenChange = () => {
          if (!document.fullscreenElement) {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            printGameCards();
          }
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.exitFullscreen();
      } else {
        printGameCards();
      }

    } catch (error) {
      console.error("Failed to generate cards:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate bingo cards. Please try again.",
      });
    }
  };

  React.useEffect(() => {
    if (gameState === "playing" && autoPrint) {
      setAutoPrint(false);
      handlePrintCurrentGameCards();
    }
  }, [gameState, autoPrint]);

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
      setShowAnswer(false);
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
    setBoard([]);
    setDefinitions([]);
    setWordPool([]);
    setCurrentDefinitionIndex(0);
    setReviewList([]);
    setShowAnswer(false);
    setBingoLines(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("lingoland_bingo_active_session");
    }
  };

  const renderPrintPortal = () => {
    if (!isMounted || !isPrinting || !printData) return null;

    const { level, winnerIndices, sortedDrawnPairs, cards } = printData;

    const content = (
      <div id="print-root" className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-start text-slate-900">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: portrait;
              margin: 0 !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: 100% !important;
              background-color: #ffffff !important;
              color: #1e293b !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body > *:not(#print-root) {
              display: none !important;
            }
            #print-root {
              display: block !important;
              position: relative !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
            }
            .bingo-page-break {
              width: 100vw !important;
              height: 100vh !important;
              page-break-after: always !important;
              break-after: page !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
              padding: 40px !important;
              position: relative !important;
            }
            
            /* Call sheet styles */
            .teacher-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 3px double #6366f1;
              padding-bottom: 10px;
              width: 100%;
            }
            .teacher-header h1 {
              margin: 0;
              font-size: 28px;
              color: #4f46e5;
            }
            .teacher-header p {
              margin: 5px 0 0 0;
              font-size: 14px;
              color: #64748b;
            }
            .winners-badge {
              margin-top: 10px;
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              color: #b45309;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: bold;
              display: inline-block;
            }
            .call-sheet {
              column-count: 2;
              column-gap: 30px;
              margin-top: 20px;
              width: 100%;
            }
            .call-sheet-item {
              break-inside: avoid-column;
              margin-bottom: 12px;
              padding: 8px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              font-size: 12px;
            }
            .call-sheet-item strong {
              color: #4f46e5;
              font-size: 13px;
            }
            /* Card styles */
            .card-container {
              border: 2px solid #e2e8f0;
              border-radius: 20px;
              padding: 24px;
              background-color: #ffffff;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
              display: flex;
              flex-direction: column;
              align-items: center;
              max-width: 580px;
              width: 100%;
            }
            .card-header-info {
              display: flex;
              justify-content: space-between;
              width: 100%;
              margin-bottom: 15px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 10px;
            }
            .card-header-info h2 {
              margin: 0;
              font-size: 22px;
              color: #1e293b;
              font-weight: 800;
            }
            .card-meta {
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .bingo-card-table {
               border-collapse: separate;
               border-spacing: 8px;
               width: 100%;
               max-width: 500px;
            }
            .bingo-card-table th {
              background-color: #4f46e5;
              color: #ffffff;
              font-size: 24px;
              font-weight: 900;
              width: 80px;
              height: 50px;
              text-align: center;
              vertical-align: middle;
              border-radius: 8px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            .bingo-card-table td {
              border: 2px solid #cbd5e1;
              background-color: #f8fafc;
              width: 80px;
              height: 80px;
              text-align: center;
              font-size: 13px;
              font-weight: 700;
              color: #334155;
              word-break: break-word;
              vertical-align: middle;
              border-radius: 12px;
              padding: 6px;
            }
            .bingo-card-table .free-space {
              background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
              border: 2px dashed #6366f1;
              color: #4338ca;
              font-weight: 900;
              font-size: 14px;
            }
            .footer-print {
              margin-top: 20px;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              width: 100%;
              max-width: 500px;
              font-weight: 500;
            }
          }
        `}} />

        {/* 1. Teacher's Call Sheet */}
        <div className="bingo-page-break">
          <div className="teacher-header">
            <h1>Teacher's Bingo Call Sheet</h1>
            <p>Difficulty: <strong>{level.toUpperCase()}</strong> | Words in Current Game Session</p>
            <div className="winners-badge">
              Winning Cards in this set: Card {Array.from(winnerIndices).map(idx => idx + 1).join(', Card ')}
            </div>
          </div>
          <div className="call-sheet">
            {sortedDrawnPairs.map((pair, idx) => (
              <div key={idx} className="call-sheet-item">
                <strong>{pair.word.toUpperCase()}</strong><br />
                {pair.definition}
              </div>
            ))}
          </div>
          <div className="footer-print">www.lingolandverse.com &bull; Teachers Guide &bull; Keep Secret from Students</div>
        </div>

        {/* 2. 30 Cards */}
        {cards.map((cardWords, cardIdx) => {
          let wordIndex = 0;
          return (
            <div key={cardIdx} className="bingo-page-break">
              <div className="card-container">
                <div className="card-header-info">
                  <h2>LingoLand Bingo</h2>
                  <div className="card-meta">
                    <span>Card {cardIdx + 1} of 30</span>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>{level}</span>
                  </div>
                </div>
                <table className="bingo-card-table">
                  <thead>
                    <tr>
                      <th>B</th>
                      <th>I</th>
                      <th>N</th>
                      <th>G</th>
                      <th>O</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(5)].map((_, colIndex) => {
                          if (rowIndex === 2 && colIndex === 2) {
                            return <td key={colIndex} className="free-space">FREE SPACE</td>;
                          } else {
                            const word = cardWords[wordIndex++];
                            return <td key={colIndex}>{word ? word.toUpperCase() : ''}</td>;
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="footer-print">www.lingolandverse.com &bull; Scan words carefully as they are read!</div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return createPortal(content, document.body);
  };

  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col relative overflow-hidden",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-slate-950 justify-center p-8" 
            : "max-w-6xl mx-auto bg-slate-900/40 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl"
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
                          onClick={() => handleStartGame(level as SkillLevel, true)} 
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
            
            {/* Left/Center Column: Bingo board and gameplay (8 cols) */}
            <div className="lg:col-span-8 flex flex-col items-center gap-8 w-full">
              
              {/* Centered Question / Correct Answer Call Card - Enlarged & Longer */}
              <div className="p-10 md:p-12 rounded-[2rem] bg-slate-900/60 border border-slate-800 backdrop-blur-sm w-full text-center shadow-lg relative min-h-[280px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1.5 text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4 w-full">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      <span>Drawn question {currentDefinitionIndex + 1} / {definitions.length}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePrintCurrentGameCards}
                      className="h-8 gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Cards</span>
                    </Button>
                  </div>
                  <h4 className="font-extrabold text-white text-2xl md:text-3xl lg:text-4xl leading-relaxed italic px-4 min-h-[100px] flex items-center justify-center">
                    "{definitions[currentDefinitionIndex].definition}"
                  </h4>
                </div>
                
                <div className="flex flex-col items-center gap-4 mt-6">
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button size="sm" variant="ghost" onClick={() => speakDefinition(definitions[currentDefinitionIndex].definition)} disabled={isSpeaking} className="h-12 w-12 rounded-full bg-slate-850 hover:bg-slate-800 text-indigo-300" title="Speak Definition">
                      <Volume2 className="h-6 w-6" />
                    </Button>
                    
                    {/* Dynamic Correct Answer Indicator (Hides by default, reveals on toggle) */}
                    {showAnswer ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 shadow-md">
                        <span className="text-xs uppercase font-black tracking-widest text-emerald-450">Correct Word:</span>
                        <span className="text-xl md:text-2xl font-black text-emerald-350 uppercase tracking-wide">{definitions[currentDefinitionIndex].word}</span>
                        <Button size="sm" variant="ghost" onClick={() => speakDefinition(definitions[currentDefinitionIndex].word)} disabled={isSpeaking} className="h-8 w-8 rounded-full hover:bg-emerald-500/20 text-emerald-400 p-0 ml-1.5" title="Speak Word">
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="lg" 
                        onClick={() => setShowAnswer(true)} 
                        className="bg-indigo-650 hover:bg-indigo-600 text-white font-black h-13 px-8 rounded-2xl text-base flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                      >
                        <Sparkles className="h-5 w-5" />
                        <span>Reveal Answer</span>
                      </Button>
                    )}
                  </div>

                  <div className="w-full pt-4 border-t border-slate-850/60 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 font-bold max-w-sm text-left leading-normal">
                      {showAnswer ? (
                        <span className="text-emerald-450 font-extrabold">📌 Find "{definitions[currentDefinitionIndex].word}" on your grid, mark it, and click draw to proceed.</span>
                      ) : (
                        <span>💡 Students guess the target word first. Teacher click Reveal to verify.</span>
                      )}
                    </div>
                    
                    {/* Draw Next word button */}
                    <Button 
                      onClick={handleNextWord} 
                      className="h-12 px-6 bg-gradient-to-r from-indigo-650 to-indigo-850 hover:opacity-90 font-black rounded-xl text-sm flex items-center gap-2 text-white shadow-lg active:scale-95"
                    >
                      <span>Next Word</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Resized Widescreen 5x5 Grid */}
              <div className="p-6 rounded-[2.5rem] bg-slate-950/40 border border-slate-850/80 shadow-inner flex justify-center items-center w-full max-w-[620px]">
                <div className="grid gap-3 w-full" style={{ gridTemplateColumns: `repeat(${BINGO_SIZE}, 1fr)` }}>
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isFree = cell.word === "FREE";
                      
                      return (
                        <Button
                          key={`${rowIndex}-${colIndex}`}
                          variant={cell.marked ? "default" : "outline"}
                          className={cn(
                            "h-20 sm:h-24 w-full text-[10px] sm:text-xs md:text-sm font-black uppercase text-center break-words whitespace-normal shadow-lg transition-all rounded-2xl p-2",
                            isFree && "bg-gradient-to-br from-indigo-500 to-indigo-650 text-white border-none cursor-default shadow-indigo-500/10",
                            cell.marked && !isFree && "bg-gradient-to-br from-emerald-500 to-emerald-650 border-none text-white scale-[0.96] cursor-default shadow-emerald-500/10"
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

              {/* Glowing Manual BINGO Trigger (Requested BINGO button - ALWAYS clickable!) */}
              <div className="w-full flex justify-center pt-2">
                <Button 
                  onClick={() => setGameState("finished")} 
                  className={cn(
                    "w-full max-w-[360px] h-14 text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border cursor-pointer hover:brightness-110",
                    "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 border-amber-300",
                    (bingoLines > 0 || reviewList.length >= 5) ? "animate-bounce shadow-amber-500/30" : "shadow-lg shadow-amber-500/10"
                  )}
                >
                  <Trophy className="h-5 w-5" />
                  <span>Declare BINGO! ({bingoLines} lines)</span>
                </Button>
              </div>

            </div>

            {/* Right Column: Review Word Bank panel (4 cols) - Restored! */}
            <div className="lg:col-span-4 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-sm space-y-4 h-full min-h-[400px] flex flex-col shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-350">Review Word Bank</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-indigo-300 bg-indigo-500/5 border-indigo-500/10">Called: {reviewList.length}</Badge>
              </div>

              <div className="flex-grow overflow-y-auto max-h-[450px] pr-1 space-y-2.5">
                {reviewList.length > 0 ? (
                  reviewList.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1 hover:border-slate-800 transition-all">
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
                  <div className="h-[250px] flex flex-col items-center justify-center text-center text-slate-500 p-4 border border-dashed border-slate-850 rounded-2xl">
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
      {renderPrintPortal()}
    </Card>
  );
}
