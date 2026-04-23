"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Castle, Shield, Target, Crosshair, Maximize, Minimize, Repeat } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Difficulty = "easy" | "intermediate" | "pro";

export function FractionFortress({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<{q: string, a: string, options: string[]} | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(10);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [resultStatus, setResultStatus] = React.useState<"correct" | "incorrect" | "timeout">("correct");
  
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateProblem = (diff: Difficulty) => {
    let q = "";
    let a = "";
    let wrong: string[] = [];

    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

    if (diff === "easy") {
      const basic = [{n:1,d:2}, {n:1,d:3}, {n:1,d:4}, {n:2,d:3}, {n:3,d:4}];
      const base = basic[Math.floor(Math.random() * basic.length)];
      const multiplier = Math.floor(Math.random() * 4) + 2;
      q = `${base.n}/${base.d}`;
      a = `${base.n * multiplier}/${base.d * multiplier}`;
      wrong = [
        `${base.n * multiplier + 1}/${base.d * multiplier}`,
        `${base.n}/${base.d * multiplier}`,
        `${base.n * multiplier}/${base.d * multiplier + 2}`
      ];
    } else if (diff === "intermediate") {
      const n = Math.floor(Math.random() * 8) + 2;
      const d = Math.floor(Math.random() * 8) + n + 1;
      const common = gcd(n, d);
      const simpN = n / common;
      const simpD = d / common;
      const multiplier = Math.floor(Math.random() * 3) + 2;
      q = `${n * multiplier}/${d * multiplier}`;
      a = `${n}/${d}`;
      wrong = [`${n+1}/${d}`, `${n}/${d+1}`, `${simpN}/${simpD + 1}`];
    } else {
      const n = Math.floor(Math.random() * 15) + 5;
      const d = Math.floor(Math.random() * 20) + n + 2;
      const multiplier = Math.floor(Math.random() * 5) + 3;
      q = `${n}/${d}`;
      a = `${n * multiplier}/${d * multiplier}`;
      wrong = [
        `${n * (multiplier-1)}/${d * multiplier}`,
        `${n + multiplier}/${d + multiplier}`,
        `${n * multiplier}/${d * (multiplier-1)}`
      ];
    }

    return { q, a, options: [a, ...wrong].sort(() => Math.random() - 0.5) };
  };

  const getTimerLimit = () => {
    if (difficulty === "easy") return 15;
    if (difficulty === "intermediate") return 10;
    return 6;
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setRound(1);
    setScore(0);
    setGameState("playing");
    setCurrentProblem(generateProblem(diff));
    setTimeLeft(getTimerLimit());
  };

  const nextRound = () => {
    if (round >= 10) {
      setGameState("finished");
      return;
    }
    setCurrentProblem(generateProblem(difficulty));
    setRound(r => r + 1);
    setTimeLeft(getTimerLimit());
    setGameState("playing");
  };

  const handleChoice = (ans: string | null) => {
    if (gameState !== "playing" || !currentProblem) return;
    if (ans === currentProblem.a) {
        setResultStatus("correct");
        const diffMultiplier = difficulty === "easy" ? 1 : difficulty === "intermediate" ? 1.5 : 2;
        setScore(prev => prev + Math.floor((100 + Math.floor(timeLeft * 10)) * diffMultiplier));
    } else if (ans === null) {
        setResultStatus("timeout");
    } else {
        setResultStatus("incorrect");
    }
    setGameState("showing_result");
  };

  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(p => p - 0.1), 100);
    } else if (gameState === "playing" && timeLeft <= 0) {
      handleChoice(null);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft]);

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 bg-[#3a2f28] flex flex-col relative border-none overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[700px]"
    )}>
      <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay" style={{
         backgroundImage: "linear-gradient(45deg, #1c1511 25%, transparent 25%, transparent 75%, #1c1511 75%, #1c1511), linear-gradient(45deg, #1c1511 25%, transparent 25%, transparent 75%, #1c1511 75%, #1c1511)",
         backgroundPosition: "0 0, 20px 20px",
         backgroundSize: "40px 40px"
      }} />
      <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0" />

      <CardHeader className="z-10 bg-[#2d241d]/90 backdrop-blur-md relative border-b border-[#5c4f42]">
        <div className="flex justify-between items-center text-[#e8dcc4]">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-[#8c7a61] hover:text-[#cca766]">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <Castle className="h-8 w-8 text-[#b89f78]" />
              <div>
                <CardTitle className="text-2xl font-black uppercase text-[#e8dcc4] font-serif tracking-widest">Fraction Fortress</CardTitle>
                <Badge variant="outline" className="border-[#8c7a61] text-[#b89f78] mt-1 bg-[#1a1511]">Wave {round}/10</Badge>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] uppercase text-[#8c7a61] font-bold tracking-widest">Defense Points</p>
                 <p className="text-2xl font-black text-[#cca766] tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-[#8c7a61] hover:text-[#cca766]" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Minimize /> : <Maximize />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col z-10 relative p-6 items-center justify-center">
         <AnimatePresence mode="wait">
            {gameState === "idle" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} className="text-center w-full max-w-md">
                    <Shield className="w-32 h-32 text-[#cca766] mx-auto mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                    <h2 className="text-4xl font-black text-white uppercase mb-4 font-serif">Defend The Keep</h2>
                    <p className="text-[#b89f78] mb-10 mx-auto lowercase font-serif">Select your defensive formation difficulty.</p>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => startGame("easy")} className="h-16 text-xl font-bold bg-[#1c1511] hover:bg-[#3a6e34] text-[#e8dcc4] border-2 border-[#5c4f42] rounded-md font-serif uppercase tracking-widest transition-all shadow-lg">Squire (Easy)</Button>
                        <Button onClick={() => startGame("intermediate")} className="h-16 text-xl font-bold bg-[#1c1511] hover:bg-[#6e6334] text-[#e8dcc4] border-2 border-[#5c4f42] rounded-md font-serif uppercase tracking-widest transition-all shadow-lg">Knight (Intermediate)</Button>
                        <Button onClick={() => startGame("pro")} className="h-16 text-xl font-bold bg-[#1c1511] hover:bg-[#8c3123] text-[#e8dcc4] border-2 border-[#5c4f42] rounded-md font-serif uppercase tracking-widest transition-all shadow-lg">Royal Elite (Pro)</Button>
                        <Button variant="ghost" asChild className="mt-4 text-[#8c7a61] hover:text-[#cca766] uppercase tracking-widest font-serif">
                           <Link href="/games">Back to Kingdom</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "playing" && currentProblem && (
                <div className="w-full max-w-xl text-center flex flex-col items-center">
                    <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="mb-12 bg-[#2d241d]/90 p-8 rounded-xl border-4 border-[#5c4f42] shadow-2xl w-full">
                        <p className="text-[#b89f78] font-bold uppercase tracking-widest text-xs mb-4 font-serif">Incoming Target Equivalent</p>
                        <h1 className="text-6xl font-black text-white drop-shadow-md font-serif tracking-widest">{currentProblem.q}</h1>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {currentProblem.options.map((opt, i) => (
                            <motion.div key={opt} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{delay: i*0.1}}>
                                <Button onClick={() => handleChoice(opt)} className="group w-full h-24 text-3xl font-black font-serif bg-[#1c1511] hover:bg-[#8c3123] text-[#e8dcc4] border-2 border-[#5c4f42] hover:border-[#a63a2a] transition-all rounded-md flex items-center justify-center relative overflow-hidden shadow-lg">
                                    <Target className="absolute w-24 h-24 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity rotate-45" />
                                    <span className="relative z-10">{opt}</span>
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 w-full max-w-md bg-[#1c1511] p-2 rounded-md border border-[#5c4f42]">
                        <div className="flex justify-between text-xs font-black uppercase text-[#cca766] mb-2 font-serif">
                           <span>Breach In</span>
                           <span>{timeLeft.toFixed(1)}s</span>
                        </div>
                        <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-2 bg-[#1c1511] rounded-sm overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-red-600 to-[#cca766] drop-shadow-md transition-all duration-100 ease-linear" />
                        </Progress>
                    </div>
                </div>
            )}

            {gameState === "showing_result" && (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}} className="bg-[#2d241d]/95 p-16 rounded-xl text-center border-4 border-[#5c4f42] shadow-2xl w-full max-w-2xl">
                    {resultStatus === "correct" && (
                        <>
                           <Crosshair className="w-24 h-24 text-green-500 mx-auto mb-6 drop-shadow-md" />
                           <h2 className="text-4xl font-black text-green-500 uppercase tracking-widest font-serif">Target Destroyed!</h2>
                           <p className="text-3xl text-[#cca766] mt-6 tabular-nums">+{score} POINTS</p>
                        </>
                    )}
                    {resultStatus === "incorrect" && (
                        <>
                           <Shield className="w-24 h-24 text-red-500 mx-auto mb-6 drop-shadow-md rotate-180" />
                           <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest font-serif">Direct Hit Sustained!</h2>
                           <p className="text-xl text-[#b89f78] mt-4 font-serif">Correct Armor: <span className="text-white font-bold bg-black/40 px-4 py-2 ml-2 text-2xl">{currentProblem?.a}</span></p>
                        </>
                    )}
                    {resultStatus === "timeout" && (
                        <>
                           <Shield className="w-24 h-24 text-orange-500 mx-auto mb-6 drop-shadow-md" />
                           <h2 className="text-4xl font-black text-orange-500 uppercase tracking-widest font-serif">Walls Breached!</h2>
                           <p className="text-xl text-[#b89f78] mt-4 font-serif">Correct Armor: <span className="text-white font-bold bg-black/40 px-4 py-2 ml-2 text-2xl">{currentProblem?.a}</span></p>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-4 mt-10">
                        <Button onClick={nextRound} className="h-16 px-12 text-2xl font-black bg-[#cca766] text-[#1c1511] hover:bg-[#b89f78] rounded-md shadow-2xl transition-all hover:scale-105 font-serif uppercase tracking-widest">
                            {round >= 10 ? "Finish Siege" : "Next Wave"}
                        </Button>
                        <Button variant="ghost" onClick={() => setGameState("idle")} className="text-[#8c7a61] hover:text-[#cca766] uppercase tracking-widest font-serif">
                            Change Formation
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "finished" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center w-full max-w-xl mx-auto bg-[#2d241d] p-16 rounded-xl border-4 border-[#5c4f42] shadow-2xl">
                    <h2 className="text-5xl font-black text-[#cca766] uppercase font-serif tracking-widest mb-8">Siege Ended</h2>
                    <div className="bg-[#1c1511] border-2 border-[#5c4f42] rounded-md p-10 mb-12 shadow-inner">
                       <p className="text-sm font-black uppercase tracking-widest text-[#8c7a61] mb-4 font-serif">Total Defense Score</p>
                       <p className="text-7xl font-black text-white font-serif tabular-nums">{score}</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-16 px-10 text-lg font-bold bg-[#cca766] hover:bg-[#b89f78] text-[#1c1511] font-serif uppercase tracking-widest rounded-md border-b-4 border-[#8c7a61] transition-all hover:scale-105"><Repeat className="mr-2 h-5 w-5"/> New Siege</Button>
                        <Button variant="outline" asChild className="h-16 px-10 text-lg font-bold border-2 border-[#5c4f42] text-[#cca766] hover:bg-[#1c1511] rounded-md font-serif uppercase tracking-widest"><Link href="/games">Retreat</Link></Button>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </CardContent>
    </Card>
  );
}
