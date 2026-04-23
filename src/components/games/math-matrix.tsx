"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Grid3X3, Timer, Trophy, Repeat, Maximize, Minimize, Activity } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

interface Problem {
  id: string;
  grid: (number | null)[]; // 4 elements, 3 numbers, 1 null (the missing one)
  answer: number;
  options: number[];
  startTime: number;
}

type GameState = "idle" | "playing" | "finished" | "instructions" | "showing_result";

const TIMER_LIMIT = 10;
const ROUNDS = 10;

export function MathMatrix({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [currentProblem, setCurrentProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_LIMIT);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [combo, setCombo] = React.useState(0);
  const [resultData, setResultData] = React.useState<{ status: "correct" | "incorrect" | "timeout", points?: number, trueAnswer?: number }>({ status: "correct" });
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateProblem = (): Problem => {
    // Sequence types: addition, multiplication
    const type = Math.random() > 0.5 ? 'add' : 'mult';
    const start = Math.floor(Math.random() * 10) + 2;
    let seq = [];
    
    if (type === 'add') {
        const step = Math.floor(Math.random() * 10) + 2;
        seq = [start, start + step, start + step * 2, start + step * 3];
    } else {
        const factor = Math.floor(Math.random() * 3) + 2;
        seq = [start, start * factor, start * Math.pow(factor, 2), start * Math.pow(factor, 3)];
    }

    const missingIndex = Math.floor(Math.random() * 4);
    const answer = seq[missingIndex];
    
    const grid: (number | null)[] = [...seq];
    grid[missingIndex] = null;
    
    const options = [answer];
    while (options.length < 4) {
      const variance = Math.floor(Math.random() * 15) - 7;
      const wrong = answer + variance;
      if (!options.includes(wrong) && wrong > 0 && wrong !== answer) options.push(wrong);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      grid,
      answer,
      options: options.sort(() => Math.random() - 0.5),
      startTime: Date.now(),
    };
  };

  const startNextRound = () => {
    if (round >= ROUNDS) {
      setGameState("finished");
      if (firestore && game) {
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game?.slug, title: game?.title, score }
        });
      }
      return;
    }
    setRound(prev => prev + 1);
    setCurrentProblem(generateProblem());
    setTimeLeft(TIMER_LIMIT);
    setGameState("playing");
  };

  const handleAnswer = (selected: number) => {
    if (gameState !== "playing" || !currentProblem) return;

    const correct = selected === currentProblem.answer;
    let pointsEarned = 0;
    let status: "correct" | "incorrect" | "timeout" = "incorrect";

    if (correct) {
      status = "correct";
      const bonus = Math.floor(timeLeft * 5);
      pointsEarned = 150 + bonus;
      setScore(prev => prev + pointsEarned);
      setCombo(prev => prev + 1);
    } else if (selected === -1) {
      status = "timeout";
      setCombo(0);
    } else {
      status = "incorrect";
      setCombo(0);
    }
    
    setResultData({ status, points: pointsEarned, trueAnswer: currentProblem.answer });
    setGameState("showing_result");

    setTimeout(() => {
      startNextRound();
    }, 2000);
  };

  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 0.1), 100);
    } else if (gameState === "playing" && timeLeft <= 0) {
      handleAnswer(-1);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft]);

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 flex flex-col overflow-y-auto relative border-none shadow-2xl",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-black" : "max-w-4xl mx-auto h-[700px] bg-zinc-950"
    )}>
      {/* Cyberpunk Grid Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      <CardHeader className="z-10 bg-black/60 backdrop-blur-md border-b border-green-500/20 relative">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="text-green-500/50 hover:text-green-400 mr-2">
                    <Link href="/games">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                </Button>
                <Grid3X3 className="h-8 w-8 text-green-500 shadow-green-500/50 drop-shadow-md" />
                <div>
                    <CardTitle className="text-2xl font-black text-white tracking-[0.2em] uppercase font-mono">Math Matrix</CardTitle>
                    <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-green-400 border-green-400/50 font-mono">SECTOR {round}/{ROUNDS}</Badge>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 font-mono">CHAIN x{combo}</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-green-500/50 uppercase tracking-widest">Score</p>
                    <p className="text-2xl font-black text-white tabular-nums font-mono">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-green-500/50 hover:text-green-400" onClick={onToggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
            </div>
        </div>
      </CardHeader>

      <CardContent className={cn("flex-grow flex flex-col items-center justify-center p-6 z-10 relative overflow-y-auto", isFullscreen ? "min-h-[60vh]" : "min-h-[350px]")}>
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 bg-green-500/20 blur-2xl rounded-full"
                />
                <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4 relative font-mono">
                    Crack the<br/><span className="text-7xl md:text-8xl text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]">Matrix</span>
                </h2>
              </div>
              <p className="text-green-200/60 max-w-md mx-auto text-lg font-mono">
                Identify the missing sequence code to unlock the core mainframe.
              </p>
              <Button 
                onClick={() => setGameState('instructions')} 
                className="h-20 px-12 text-2xl font-black bg-green-600 hover:bg-green-500 text-black rounded-sm shadow-[0_0_30px_rgba(22,163,74,0.4)] transition-all hover:scale-105 uppercase tracking-widest border-2 border-green-400"
              >
                INITIALIZE
              </Button>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-black/80 backdrop-blur-xl border border-green-500/30 p-10 md:p-12 rounded-xl max-w-2xl w-full mx-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <h3 className="text-3xl font-black text-green-400 uppercase mb-8 flex items-center gap-3 font-mono">
                <Activity className="text-green-400" /> System Protocol
              </h3>
              <div className="space-y-6 text-xl text-zinc-300 font-mono">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-sm border border-green-500 text-green-500 bg-green-500/10 flex items-center justify-center text-sm font-bold shrink-0">01</div>
                  <span>Analyze the 2x2 data grid. The numbers follow a strict mathematical sequence.</span>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-sm border border-green-500 text-green-500 bg-green-500/10 flex items-center justify-center text-sm font-bold shrink-0">02</div>
                  <span>Deduce the pattern (addition or multiplication) to find the corrupted block <span className="text-red-400 font-bold">[?]</span>.</span>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-sm border border-green-500 text-green-500 bg-green-500/10 flex items-center justify-center text-sm font-bold shrink-0">03</div>
                  <span>Input the correct value before the connection times out.</span>
                </div>
              </div>
              <Button onClick={startNextRound} className="w-full mt-12 h-16 text-xl font-black bg-green-500 text-black hover:bg-green-400 transition-colors uppercase tracking-[0.2em] rounded-sm border border-green-300 shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                Access Mainframe
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && currentProblem && (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
               <motion.div
                  key={currentProblem.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="mb-12 w-full max-w-md px-4"
               >
                  <div className="grid grid-cols-2 gap-4">
                    {currentProblem.grid.map((val, idx) => (
                        <div key={idx} className={cn(
                            "aspect-square flex items-center justify-center text-5xl md:text-7xl font-bold font-mono border-2 rounded-xl backdrop-blur-sm",
                            val === null 
                                ? "border-red-500 bg-red-500/10 text-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)] animate-pulse" 
                                : "border-green-500/40 bg-green-900/20 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                        )}>
                            {val === null ? "?" : val}
                        </div>
                    ))}
                  </div>
               </motion.div>

               <div className="grid grid-cols-2 gap-4 w-full max-w-xl px-4">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Button
                            onClick={() => handleAnswer(opt)}
                            className="w-full h-20 md:h-24 text-3xl md:text-4xl font-black font-mono bg-zinc-900/80 hover:bg-green-900/40 text-white border border-zinc-700 hover:border-green-400 rounded-lg transition-all group overflow-hidden relative"
                        >
                            <span className="relative z-10">{opt}</span>
                            <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="absolute bottom-8 left-0 right-0 px-8 md:px-12">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-500 text-xs font-black uppercase tracking-widest font-mono">Uplink Stability</span>
                    <span className="text-green-400 font-black tabular-nums font-mono">{timeLeft.toFixed(1)}s</span>
                  </div>
                  <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-2 bg-zinc-900 border border-zinc-800 rounded-none">
                    <div className="h-full bg-green-500 rounded-none shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                  </Progress>
               </div>
            </div>
          )}

          {gameState === "showing_result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full h-full flex flex-col items-center justify-center relative text-center px-4"
            >
                {resultData.status === "correct" && (
                    <div className="bg-green-500/10 border border-green-500/30 p-12 rounded-2xl backdrop-blur-lg">
                        <h2 className="text-5xl md:text-6xl font-black text-green-400 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(74,222,128,0.5)] font-mono">
                            Decrypted
                        </h2>
                        <p className="text-2xl text-green-100 mt-4 font-bold font-mono">+{resultData.points} Bytes</p>
                    </div>
                )}
                {resultData.status === "incorrect" && (
                    <div className="bg-red-500/10 border border-red-500/30 p-12 rounded-2xl backdrop-blur-lg">
                        <h2 className="text-5xl md:text-6xl font-black text-red-500 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] font-mono">
                            Breach Detected
                        </h2>
                        <p className="text-xl md:text-2xl text-white mt-6 font-mono">Valid fragment was <span className="font-bold text-red-400 bg-red-900/40 px-3 py-1 rounded">{resultData.trueAnswer}</span></p>
                    </div>
                )}
                {resultData.status === "timeout" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-12 rounded-2xl backdrop-blur-lg">
                        <h2 className="text-5xl md:text-6xl font-black text-yellow-500 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(234,179,8,0.5)] font-mono">
                            Uplink Lost
                        </h2>
                        <p className="text-xl md:text-2xl text-white mt-6 font-mono">Valid fragment was <span className="font-bold text-yellow-400 bg-yellow-900/40 px-3 py-1 rounded">{resultData.trueAnswer}</span></p>
                    </div>
                )}
            </motion.div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full max-w-2xl px-4"
            >
              <Trophy className="h-32 w-32 text-green-400 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(74,222,128,0.4)]" />
              <h2 className="text-5xl md:text-6xl font-black text-white uppercase mb-2 font-mono tracking-tighter">System Secured</h2>
              <p className="text-green-400/60 text-xl font-bold uppercase tracking-widest mb-12 font-mono">All sectors operational</p>
              
              <div className="bg-black/50 border border-green-500/30 rounded-lg p-8 mb-12 flex flex-col md:flex-row gap-8 justify-center backdrop-blur-md">
                <div className="text-center flex-1">
                    <p className="text-xs font-black text-zinc-500 uppercase mb-2 tracking-widest font-mono">Total Data Extracted</p>
                    <p className="text-5xl lg:text-6xl font-black text-white tabular-nums font-mono">{score}</p>
                </div>
                <div className="hidden md:block w-px bg-zinc-800" />
                <div className="text-center flex-1">
                    <p className="text-xs font-black text-zinc-500 uppercase mb-2 tracking-widest font-mono">Max Chain Link</p>
                    <p className="text-5xl lg:text-6xl font-black text-green-400 tabular-nums font-mono">{combo}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => { setScore(0); setRound(0); setCombo(0); setGameState('idle'); }} className="h-16 px-10 text-xl font-black bg-green-500 text-black hover:bg-green-400 rounded-sm font-mono uppercase tracking-widest">
                    <Repeat className="mr-2" /> REBOOT
                </Button>
                <Button variant="outline" asChild className="h-16 px-10 text-xl font-black border-zinc-700 text-white hover:bg-zinc-800 hover:text-white rounded-sm font-mono uppercase tracking-widest">
                    <Link href="/games">DISCONNECT</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="z-10 bg-black/80 backdrop-blur-md border-t border-green-500/20 py-4 flex justify-between px-6">
        <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
            Math Matrix_v1.0 // Mainframe
        </div>
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 text-[10px] font-black uppercase font-mono tracking-widest">Secure</span>
        </div>
      </CardFooter>
    </Card>
  );
}
