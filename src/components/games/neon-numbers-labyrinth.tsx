"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Maximize2, Minimize2, ArrowLeft, RefreshCw, XCircle, CheckCircle2, Trophy, ListChecks } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Difficulty = "easy" | "medium" | "hard";

interface Sequence {
  sequence: number[];
  options: number[];
  answer: number;
}

interface HistoryItem {
  questionDisplay: string;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateSequence = (difficulty: Difficulty): Sequence => {
  const seq: number[] = [];
  let answer = 0;
  
  if (difficulty === "easy") {
    const start = Math.floor(Math.random() * 20) + 1;
    const step = Math.floor(Math.random() * 10) + 2;
    const isAdd = Math.random() > 0.5;
    for (let i = 0; i < 4; i++) {
      seq.push(isAdd ? start + i * step : start - i * step);
    }
    answer = isAdd ? start + 4 * step : start - 4 * step;
  } else if (difficulty === "medium") {
    const start = Math.floor(Math.random() * 10) + 2;
    const isMult = Math.random() > 0.5;
    if (isMult) {
      const mult = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < 4; i++) seq.push(start * Math.pow(mult, i));
      answer = start * Math.pow(mult, 4);
    } else {
      // Mixed: +A, -B
      const add = Math.floor(Math.random() * 10) + 5;
      const sub = Math.floor(Math.random() * 5) + 1;
      let curr = start;
      for (let i = 0; i < 4; i++) {
        seq.push(curr);
        curr = i % 2 === 0 ? curr + add : curr - sub;
      }
      answer = curr;
    }
  } else {
    // Hard: x^2 or Fibonacci-like
    const isSquare = Math.random() > 0.5;
    if (isSquare) {
      const start = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < 4; i++) seq.push(Math.pow(start + i, 2));
      answer = Math.pow(start + 4, 2);
    } else {
      let a = Math.floor(Math.random() * 5) + 1;
      let b = Math.floor(Math.random() * 5) + a;
      seq.push(a, b);
      for (let i = 2; i < 4; i++) {
        const next = a + b;
        seq.push(next);
        a = b;
        b = next;
      }
      answer = a + b;
    }
  }

  const options = new Set<number>();
  options.add(answer);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10;
    if (offset !== 0 && answer + offset > -100) {
      options.add(answer + offset);
    }
  }

  return {
    sequence: seq,
    answer,
    options: shuffleArray(Array.from(options)),
  };
};

export function NeonNumbersLabyrinth() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentSeq, setCurrentSeq] = useState<Sequence | null>(null);
  const [score, setScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<{ selected: number; correct: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const startGame = (diff: Difficulty) => {
      setTotalRounds(diff === "easy" ? 10 : diff === "medium" ? 20 : 30);
      setCurrentRound(1);
      setScore(0);
      setHistory([]);
      setIsGameOver(false);
      setCurrentSeq(generateSequence(diff));
  };

  useEffect(() => {
    if (difficulty) {
      startGame(difficulty);
    }
  }, [difficulty]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const proceedToNextRound = (hItem: HistoryItem) => {
    setHistory(prev => [...prev, hItem]);
    if (currentRound >= totalRounds) {
      setIsGameOver(true);
    } else {
      setCurrentRound(prev => prev + 1);
      setCurrentSeq(generateSequence(difficulty!));
    }
  };

  const handleOptionClick = (opt: number) => {
    if (wrongAnswer || isGameOver) return;

    if (currentSeq && opt === currentSeq.answer) {
      setScore(s => s + 10);
      proceedToNextRound({
        questionDisplay: currentSeq.sequence.join(", ") + ", ?",
        userAnswer: opt,
        correctAnswer: currentSeq.answer,
        isCorrect: true
      });
    } else if (currentSeq) {
      setWrongAnswer({ selected: opt, correct: currentSeq.answer });
    }
  };

  const closeWrongModal = () => {
    if (wrongAnswer && currentSeq) {
      proceedToNextRound({
        questionDisplay: currentSeq.sequence.join(", ") + ", ?",
        userAnswer: wrongAnswer.selected,
        correctAnswer: currentSeq.answer,
        isCorrect: false
      });
    }
    setWrongAnswer(null);
  };

  if (!difficulty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 bg-zinc-950 p-8 rounded-xl border border-cyan-500/30">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          Neon Numbers Labyrinth
        </h1>
        <p className="text-cyan-100/70 text-center max-w-md">
          Navigate the retro-futuristic grid by decoding the mathematical sequence. Choose your difficulty to begin.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button onClick={() => setDifficulty("easy")} className="bg-cyan-950 border border-cyan-500 text-cyan-400 hover:bg-cyan-900 transition-all uppercase tracking-widest">
            Easy (10 Rnds)
          </Button>
          <Button onClick={() => setDifficulty("medium")} className="bg-cyan-950 border border-cyan-500 text-cyan-400 hover:bg-cyan-900 transition-all uppercase tracking-widest">
            Medium (20 Rnds)
          </Button>
          <Button onClick={() => setDifficulty("hard")} className="bg-cyan-950 border border-cyan-500 text-cyan-400 hover:bg-cyan-900 transition-all uppercase tracking-widest">
            Hard (30 Rnds)
          </Button>
        </div>
        <Link href="/games">
          <Button variant="ghost" className="text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative flex flex-col items-center justify-center w-full min-h-[70vh] bg-zinc-950 font-mono transition-all overflow-hidden ${isFullscreen ? 'h-screen overflow-y-auto' : 'rounded-xl border border-cyan-500/30'}`}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-zinc-950/80 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="flex items-center gap-4">
          {!isFullscreen && (
            <Button variant="ghost" size="icon" onClick={() => setDifficulty(null)} className="text-cyan-500 hover:bg-cyan-950 hover:text-cyan-300">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 uppercase tracking-widest">
            {difficulty}
          </Badge>
          {!isGameOver && (
            <span className="text-cyan-400 font-bold">Round: {currentRound}/{totalRounds} | Score: {score}</span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-cyan-500 hover:bg-cyan-950">
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>
      </div>

      {/* Game Content */}
      <AnimatePresence mode="wait">
        {!isGameOver && currentSeq && !wrongAnswer && (
          <motion.div
            key={currentSeq.answer}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="z-10 flex flex-col items-center gap-12 mt-16"
          >
            <div className="flex gap-4 sm:gap-8 items-center justify-center flex-wrap">
              {currentSeq.sequence.map((num, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-cyan-950/50 border-2 border-cyan-500 text-cyan-300 text-2xl font-bold rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    {num}
                  </div>
                  <div className="w-4 h-1 sm:w-8 sm:h-1 bg-cyan-500/50 mx-2 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </div>
              ))}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-zinc-900 border-2 border-dashed border-cyan-500 text-cyan-500/50 text-3xl font-bold rounded-lg animate-pulse">
                ?
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md px-4">
              {currentSeq.options.map((opt, i) => (
                <Button
                  key={i}
                  onClick={() => handleOptionClick(opt)}
                  className="h-16 text-xl bg-cyan-950/30 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500 hover:text-zinc-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all duration-300 rounded-xl"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 flex flex-col items-center w-full max-w-2xl mt-16 p-4"
          >
            <Trophy className="w-20 h-20 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h2 className="text-4xl font-bold text-cyan-300 mb-2">Sequence Completed</h2>
            <p className="text-xl text-cyan-100/70 mb-8">Final Score: {score} / {totalRounds * 10}</p>
            
            <Card className="w-full bg-zinc-900/80 border border-cyan-500/30 p-6 shadow-xl max-h-[400px] overflow-y-auto custom-scrollbar">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5" /> Mission Log
              </h3>
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${h.isCorrect ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-red-950/30 border-red-500/30'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div>
                      <p className="text-zinc-300 font-medium mb-1">Q{i + 1}: {h.questionDisplay}</p>
                      <p className="text-sm text-zinc-500">
                        Your answer: <span className={h.isCorrect ? 'text-emerald-400' : 'text-red-400 line-through'}>{h.userAnswer}</span>
                      </p>
                    </div>
                    {!h.isCorrect && (
                      <div className="bg-zinc-950/50 p-2 rounded px-4 text-center">
                        <p className="text-xs text-zinc-500 uppercase">Correct</p>
                        <p className="text-cyan-400 font-bold">{h.correctAnswer}</p>
                      </div>
                    )}
                    {h.isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-4 mt-8">
              <Button onClick={() => setDifficulty(null)} className="bg-cyan-950 border border-cyan-500 text-cyan-400 hover:bg-cyan-900 transition-all">
                Change Difficulty
              </Button>
              <Button onClick={() => startGame(difficulty!)} className="bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrong Answer Modal */}
      <AnimatePresence>
        {wrongAnswer && !isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          >
            <Card className="p-8 max-w-md w-full bg-zinc-900 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] flex flex-col items-center text-center">
              <XCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">System Failure</h2>
              <p className="text-zinc-300 mb-6 text-lg">
                You selected <span className="text-red-400 font-bold">{wrongAnswer.selected}</span>. <br/>
                The correct sequence value was <span className="text-cyan-400 font-bold">{wrongAnswer.correct}</span>.
              </p>
              <Button 
                onClick={closeWrongModal}
                className="w-full bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Continue
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
