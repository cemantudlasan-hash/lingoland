"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Binary, Sparkles, Timer, Trophy, Repeat, Maximize, Minimize, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  equation: string;
  answer: number;
  options: number[];
  startTime: number;
}

type GameState = "idle" | "playing" | "finished" | "instructions";

const TIMER_LIMIT = 8;

export function AlgebraicAbyss({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [currentProblem, setCurrentProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_LIMIT);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [combo, setCombo] = React.useState(0);
  
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateProblem = (): Problem => {
    const a = Math.floor(Math.random() * 15) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const x = Math.floor(Math.random() * 10) + 2;
    
    // Create equation like: ax + b = ?
    const answer = a * x + b;
    const equation = `${a}x + ${b} = ${answer}`;
    
    const options = [x];
    while (options.length < 4) {
      const wrong = x + (Math.floor(Math.random() * 5) - 2);
      if (!options.includes(wrong) && wrong > 0) options.push(wrong);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      equation: `${a}x + ${b} = ${answer}`,
      answer: x,
      options: options.sort(() => Math.random() - 0.5),
      startTime: Date.now(),
    };
  };

  const startNextRound = () => {
    if (round >= 10) {
      setGameState("finished");
      if (firestore && game) {
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game.slug, title: game.title, score }
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

    if (selected === currentProblem.answer) {
      const bonus = Math.floor(timeLeft * 2);
      setScore(prev => prev + 100 + bonus);
      setCombo(prev => prev + 1);
      toast({
        title: "Correct!",
        description: `+${100 + bonus} points!`,
        className: "bg-green-500 text-white",
      });
    } else {
      setCombo(0);
      toast({
        title: "Incorrect",
        description: `The answer was ${currentProblem.answer}`,
        variant: "destructive",
      });
    }
    startNextRound();
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
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-black" : "max-w-4xl mx-auto h-[700px] bg-slate-950"
    )}>
      {/* Background Starfield Effect */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 bg-white rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%", 
                z: -1000,
                opacity: 0 
              }}
              animate={{ 
                z: 0,
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{ 
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              style={{ transformStyle: 'preserve-3d' }}
            />
          ))}
        </div>
      </div>

      <CardHeader className="z-10 bg-black/40 backdrop-blur-md border-b border-white/10 relative">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Binary className="h-8 w-8 text-blue-400 animate-pulse" />
                <div>
                    <CardTitle className="text-2xl font-black text-white tracking-widest uppercase">Algebraic Abyss</CardTitle>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400/50">LEVEL {round}/10</Badge>
                        <Badge variant="outline" className="text-purple-400 border-purple-400/50">COMBO x{combo}</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-white/50 uppercase">Score</p>
                    <p className="text-2xl font-black text-white tabular-nums">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-white/50 hover:text-white" onClick={onToggleFullscreen}>
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
              <div className="relative">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"
                />
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4 relative">
                    Master the<br/><span className="text-7xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Infinite</span>
                </h2>
              </div>
              <p className="text-blue-200/60 max-w-md mx-auto text-lg italic">
                Equations are collapsing from the void. Solve for X to stabilize the rift.
              </p>
              <Button 
                onClick={() => setGameState('instructions')} 
                className="h-20 px-12 text-2xl font-black bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
              >
                ENGAGE SYSTEMS
              </Button>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[40px] max-w-2xl w-full"
            >
              <h3 className="text-3xl font-black text-white uppercase mb-8 flex items-center gap-3">
                <Sparkles className="text-yellow-400" /> Mission Brief
              </h3>
              <div className="space-y-6 text-xl text-blue-100/80">
                <p className="flex gap-4">
                  <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">1</span>
                  <span>Equations will emerge from the abyss. Identify the value of <span className="text-blue-400 font-bold">x</span>.</span>
                </p>
                <p className="flex gap-4">
                  <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">2</span>
                  <span>Each second lost reduces your potential score. Be swift.</span>
                </p>
                <p className="flex gap-4">
                  <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">3</span>
                  <span>Correct streaks build combos for massive multipliers.</span>
                </p>
              </div>
              <Button onClick={startNextRound} className="w-full mt-12 h-16 text-xl font-black bg-white text-black hover:bg-blue-400 hover:text-white transition-colors uppercase tracking-widest rounded-2xl">
                Ready for Insertion
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && currentProblem && (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
               <motion.div
                  key={currentProblem.id}
                  initial={{ opacity: 0, scale: 0, z: -1000 }}
                  animate={{ opacity: 1, scale: 1, z: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 100 }}
                  className="mb-12"
               >
                  <div className="relative group">
                    <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500/20 blur-3xl"
                    />
                    <div className="text-8xl md:text-9xl font-black text-white tracking-widest tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        {currentProblem.equation}
                    </div>
                  </div>
               </motion.div>

               <div className="grid grid-cols-2 gap-4 w-full max-w-2xl px-4">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Button
                            onClick={() => handleAnswer(opt)}
                            className="w-full h-24 text-4xl font-black bg-white/5 hover:bg-white/20 text-white border-2 border-white/10 hover:border-blue-400 rounded-3xl transition-all group overflow-hidden relative"
                        >
                            <span className="relative z-10">{opt}</span>
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="absolute bottom-8 left-0 right-0 px-12">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/40 text-xs font-black uppercase tracking-widest">Time Synchronicity</span>
                    <span className="text-blue-400 font-black tabular-nums">{timeLeft.toFixed(1)}s</span>
                  </div>
                  <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-1 bg-white/10">
                    <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  </Progress>
               </div>
            </div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Trophy className="h-32 w-32 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]" />
              <h2 className="text-6xl font-black text-white uppercase mb-2">Stability Restored</h2>
              <p className="text-blue-200/50 text-xl font-bold uppercase tracking-widest mb-12">Universal Calibration Complete</p>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 flex gap-12 justify-center backdrop-blur-md">
                <div className="text-center">
                    <p className="text-xs font-black text-white/30 uppercase mb-1">Total Points</p>
                    <p className="text-5xl font-black text-white tabular-nums">{score}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs font-black text-white/30 uppercase mb-1">Max Combo</p>
                    <p className="text-5xl font-black text-blue-400 tabular-nums">{combo}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => { setScore(0); setRound(0); setCombo(0); setGameState('idle'); }} className="h-16 px-12 text-xl font-black bg-white text-black hover:bg-blue-400 hover:text-white rounded-2xl flex items-center gap-2">
                    <Repeat /> REINITIALIZE
                </Button>
                <Button variant="outline" asChild className="h-16 px-12 text-xl font-black border-white/20 text-white hover:bg-white/10 rounded-2xl">
                    <Link href="/games">EXIT VOID</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="z-10 bg-black/40 backdrop-blur-md border-t border-white/10 py-4 flex justify-between">
        <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Algebraic Abyss // System Terminal
        </div>
        <div className="flex items-center gap-2">
            <Rocket className="h-3 w-3 text-blue-400" />
            <span className="text-blue-400 text-[10px] font-black uppercase">Status: Connected</span>
        </div>
      </CardFooter>
    </Card>
  );
}
