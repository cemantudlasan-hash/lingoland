"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Rocket, Satellite, Maximize, Minimize, Crosshair } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Difficulty = "easy" | "intermediate" | "pro";

export function NewtonsNightmare({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<{q: string, a: string, options: string[]} | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(15);
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

    if (diff === "easy") {
      const types = ["F=ma", "s=d/t", "W=Fd"];
      const type = types[Math.floor(Math.random() * types.length)];
      if (type === "F=ma") {
        const m = Math.floor(Math.random() * 10) + 1;
        const acc = Math.floor(Math.random() * 10) + 1;
        const force = m * acc;
        q = `Find Force (F=ma) if m=${m}kg and a=${acc}m/s²`;
        a = `${force} N`;
        wrong = [`${force + 5} N`, `${force - 2} N`, `${m + acc} N`];
      } else if (type === "s=d/t") {
        const d = (Math.floor(Math.random() * 10) + 1) * 10;
        const t = Math.floor(Math.random() * 5) + 1;
        const speed = d / t;
        q = `Find Speed (s=d/t) if d=${d}m and t=${t}s`;
        a = `${speed} m/s`;
        wrong = [`${speed + 10} m/s`, `${speed / 2} m/s`, `${d * t} m/s`];
      } else {
        const f = Math.floor(Math.random() * 10) + 1;
        const d = Math.floor(Math.random() * 10) + 1;
        const work = f * d;
        q = `Find Work (W=Fd) if F=${f}N and d=${d}m`;
        a = `${work} J`;
        wrong = [`${f + d} J`, `${work * 2} J`, `${work - 5} J`];
      }
    } else if (diff === "intermediate") {
      const types = ["p=mv", "P=W/t", "F=ma_dec"];
      const type = types[Math.floor(Math.random() * types.length)];
      if (type === "p=mv") {
        const m = Math.floor(Math.random() * 20) + 5;
        const v = Math.floor(Math.random() * 10) + 2;
        const p = m * v;
        q = `Momentum (p=mv): m=${m}kg, v=${v}m/s. p=?`;
        a = `${p} kg·m/s`;
        wrong = [`${p + m} kg·m/s`, `${p - v} kg·m/s`, `${m / v} kg·m/s`];
      } else if (type === "P=W/t") {
        const w = (Math.floor(Math.random() * 50) + 10) * 10;
        const t = Math.floor(Math.random() * 10) + 2;
        const power = (w / t).toFixed(1);
        q = `Power (P=W/t): W=${w}J, t=${t}s. P=?`;
        a = `${power} W`;
        wrong = [`${(Number(power) + 5).toFixed(1)} W`, `${(Number(power) * 1.5).toFixed(1)} W`, `${(w * t).toFixed(1)} W`];
      } else {
        const m = (Math.random() * 10 + 1).toFixed(1);
        const acc = Math.floor(Math.random() * 10) + 1;
        const force = (Number(m) * acc).toFixed(1);
        q = `Force (F=ma): m=${m}kg, a=${acc}m/s². F=?`;
        a = `${force} N`;
        wrong = [`${(Number(force) + 2).toFixed(1)} N`, `${(Number(force) - 1).toFixed(1)} N`, `${(Number(m) + acc).toFixed(1)} N`];
      }
    } else {
      const types = ["KE=1/2mv2", "PE=mgh", "Weight=mg"];
      const type = types[Math.floor(Math.random() * types.length)];
      if (type === "KE=1/2mv2") {
        const m = Math.floor(Math.random() * 10) + 2;
        const v = Math.floor(Math.random() * 6) + 2;
        const ke = 0.5 * m * (v * v);
        q = `Kinetic Energy: m=${m}kg, v=${v}m/s. KE=?`;
        a = `${ke} J`;
        wrong = [`${m * v} J`, `${ke * 2} J`, `${ke / 2} J`];
      } else if (type === "PE=mgh") {
        const m = Math.floor(Math.random() * 5) + 1;
        const h = Math.floor(Math.random() * 20) + 5;
        const pe = (m * 9.8 * h).toFixed(1);
        q = `Potential Energy (PE=mgh, g=9.8): m=${m}kg, h=${h}m. PE=?`;
        a = `${pe} J`;
        wrong = [`${(m * 10 * h).toFixed(1)} J`, `${(Number(pe) + 50).toFixed(1)} J`, `${(pe)} J_2`].map(x => x === pe ? x+"_bad" : x);
      } else {
        const m = Math.floor(Math.random() * 100) + 10;
        const w = (m * 9.8).toFixed(1);
        q = `Weight on Earth (W=mg, g=9.8): m=${m}kg. W=?`;
        a = `${w} N`;
        wrong = [`${(m * 10).toFixed(1)} N`, `${(m * 1.6).toFixed(1)} N`, `${(Number(w) / 2).toFixed(1)} N`];
      }
    }

    return { q, a: a.toString(), options: [a.toString(), ...wrong].sort(() => Math.random() - 0.5) };
  };

  const getTimerLimit = () => {
    if (difficulty === "easy") return 20;
    if (difficulty === "intermediate") return 15;
    return 10;
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
      "w-full transition-all duration-500 bg-[#0a0f1c] flex flex-col relative border-none overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[700px]"
    )}>
      <div className="absolute inset-0 z-0">
        {[...Array(30)].map((_, i) => (
           <div key={i} className="absolute rounded-full bg-white opacity-40" style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 5 + 3}s infinite linear alternate`
           }} />
        ))}
      </div>

      <CardHeader className="z-10 bg-[#0a0f1c]/90 backdrop-blur-md relative border-b border-indigo-900/50">
        <div className="flex justify-between items-center text-indigo-100">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-indigo-400/50 hover:text-indigo-300">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <Rocket className="h-8 w-8 text-indigo-400" />
              <div>
                <CardTitle className="text-2xl font-black uppercase text-indigo-300 font-mono tracking-tighter">Newton&apos;s Nightmare</CardTitle>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-500 mt-1">Orbit {round}/10</Badge>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] uppercase text-indigo-800 font-bold tracking-widest">Altitude Score</p>
                 <p className="text-2xl font-black text-indigo-400 tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-400" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Minimize /> : <Maximize />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col z-10 relative p-6 items-center justify-center">
         <AnimatePresence mode="wait">
            {gameState === "idle" && (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="text-center w-full max-w-md">
                    <Satellite className="w-32 h-32 text-indigo-500 mx-auto mb-8 animate-bounce" />
                    <h2 className="text-5xl font-black text-white uppercase mb-4 font-mono">Impending Collision</h2>
                    <p className="text-indigo-200/60 mb-10 mx-auto lowercase">Select calculation engine difficulty level.</p>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => startGame("easy")} className="h-16 px-12 text-xl font-bold bg-[#0f172a] border border-green-500/50 hover:border-green-400 text-green-500 rounded-none font-mono uppercase tracking-widest transition-all">Basic Physics (Easy)</Button>
                        <Button onClick={() => startGame("intermediate")} className="h-16 px-12 text-xl font-bold bg-[#0f172a] border border-indigo-500/50 hover:border-indigo-400 text-indigo-400 rounded-none font-mono uppercase tracking-widest transition-all">Classical Mechanics (Intermediate)</Button>
                        <Button onClick={() => startGame("pro")} className="h-16 px-12 text-xl font-bold bg-[#0f172a] border border-red-500/50 hover:border-red-400 text-red-500 rounded-none font-mono uppercase tracking-widest transition-all">Advanced Theory (Pro)</Button>
                        <Button variant="ghost" asChild className="mt-4 text-indigo-800 hover:text-indigo-600 uppercase tracking-widest font-mono">
                           <Link href="/games">Back to Space Station</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "playing" && currentProblem && (
                <div className="w-full max-w-2xl text-center flex flex-col items-center">
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="mb-12 bg-[#121b33] p-8 border-2 border-indigo-900 shadow-2xl relative w-full">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                        
                        <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm mb-4 font-mono">Sensors Read:</p>
                        <h1 className="text-2xl md:text-3xl font-bold text-indigo-100 font-mono tracking-tight">{currentProblem.q}</h1>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {currentProblem.options.map((opt, i) => (
                            <motion.div key={opt} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i*0.1}}>
                                <Button onClick={() => handleChoice(opt)} className="w-full h-20 text-2xl font-bold font-mono bg-[#0f172a] hover:bg-indigo-600 text-indigo-100 border border-indigo-800 hover:border-indigo-400 transition-all rounded-none uppercase">
                                    {opt}
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 w-full max-w-md">
                        <div className="flex justify-between text-xs font-black uppercase text-red-500 mb-2 font-mono">
                           <span>Impact In</span>
                           <span>{timeLeft.toFixed(1)}s</span>
                        </div>
                        <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-1 bg-[#0f172a] rounded-none">
                           <div className="h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]" />
                        </Progress>
                    </div>
                </div>
            )}

            {gameState === "showing_result" && (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}} className="bg-[#0f172a]/95 p-16 rounded-none text-center border-2 border-indigo-500 shadow-2xl w-full max-w-2xl">
                    {resultStatus === "correct" && (
                        <>
                           <Rocket className="w-24 h-24 text-green-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                           <h2 className="text-4xl font-black text-green-400 uppercase tracking-widest font-mono">Orbit Adjusted!</h2>
                           <p className="text-3xl text-indigo-200 mt-6 tabular-nums">+{score} UNITS</p>
                        </>
                    )}
                    {resultStatus === "incorrect" && (
                        <>
                           <Crosshair className="w-24 h-24 text-red-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                           <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest font-mono">Trajectory Error!</h2>
                           <p className="text-xl text-indigo-200 mt-4 font-mono">True value: <span className="text-indigo-400 font-bold bg-black/40 px-4 py-2 ml-2">{currentProblem?.a}</span></p>
                        </>
                    )}
                    {resultStatus === "timeout" && (
                        <>
                           <Crosshair className="w-24 h-24 text-orange-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                           <h2 className="text-4xl font-black text-orange-500 uppercase tracking-widest font-mono">Too Slow!</h2>
                           <p className="text-xl text-indigo-200 mt-4 font-mono">True value: <span className="text-indigo-400 font-bold bg-black/40 px-4 py-2 ml-2">{currentProblem?.a}</span></p>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-4 mt-10">
                        <Button onClick={nextRound} className="h-16 px-12 text-2xl font-black bg-indigo-600 text-white hover:bg-indigo-500 rounded-none border border-indigo-400 shadow-2xl transition-all hover:scale-105 font-mono uppercase tracking-widest">
                            {round >= 10 ? "Verify Orbit" : "Next Orbit"}
                        </Button>
                        <Button variant="ghost" onClick={() => setGameState("idle")} className="text-indigo-800 hover:text-indigo-600 uppercase tracking-widest font-mono">
                            Re-initialize Sensors
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "finished" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center w-full max-w-xl mx-auto">
                    <h2 className="text-5xl font-black text-indigo-400 uppercase font-mono tracking-widest mb-8">Mission Complete</h2>
                    <div className="bg-[#0f172a] border border-indigo-900 rounded-none p-12 mb-12 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                       <p className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-4 font-mono">Total Altitude Score</p>
                       <p className="text-7xl font-black text-white font-mono tabular-nums">{score}</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-16 px-10 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white font-mono uppercase tracking-widest rounded-none border border-indigo-400 transition-all">Engage Again</Button>
                        <Button variant="outline" asChild className="h-16 px-10 text-lg font-bold border-indigo-900 text-indigo-400 hover:bg-[#0f172a] rounded-none font-mono uppercase tracking-widest"><Link href="/games">Abort Mission</Link></Button>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </CardContent>
    </Card>
  );
}
