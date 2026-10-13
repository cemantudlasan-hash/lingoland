"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Hexagon, Triangle, Square, Circle, Maximize, Minimize, Pickaxe, RefreshCw, BookOpen } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Difficulty = "easy" | "intermediate" | "pro";

export function GeometryGenius({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "instructions" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<{type: string, q: string, a: string, options: string[]} | null>(null);
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

  const generateData = (diff: Difficulty) => {
    let t = "";
    let q = "";
    let ans = 0;
    let wrong: number[] = [];

    if (diff === "easy") {
        t = Math.random() > 0.5 ? "Area" : "Perimeter";
        const w = Math.floor(Math.random() * 8) + 2;
        const h = Math.random() > 0.5 ? w : Math.floor(Math.random() * 8) + 2;
        const shape = w === h ? "Square" : "Rectangle";
        if (t === "Area") ans = w * h;
        else ans = 2 * (w + h);
        q = `Find the ${t} of a ${shape} with side/width ${w} and height ${h}`;
        wrong = [ans + 2, ans - 2, ans + 4, w + h];
    } else if (diff === "intermediate") {
        const type = Math.floor(Math.random() * 3);
        if (type === 0) { // Triangle Area
            const b = Math.floor(Math.random() * 10) + 4;
            const h = Math.floor(Math.random() * 10) + 4;
            ans = 0.5 * b * h;
            q = `Find the Area of a Triangle with base=${b} and height=${h}`;
        } else if (type === 1) { // Circle Circumference
            const r = Math.floor(Math.random() * 5) + 1;
            ans = Math.round(2 * 3.14 * r);
            q = `Find the Circumference of a Circle with radius=${r} (π=3.14)`;
        } else { // Rectangle Area with Decimals
            const w = Number((Math.random() * 5 + 2).toFixed(1));
            const h = Math.floor(Math.random() * 5) + 2;
            ans = Number((w * h).toFixed(1));
            q = `Find the Area of a Rectangle with width=${w} and height=${h}`;
        }
        wrong = [ans + 1.5, ans - 1, ans * 2];
    } else {
        const type = Math.floor(Math.random() * 3);
        if (type === 0) { // Cylinder Volume
            const r = Math.floor(Math.random() * 4) + 1;
            const h = Math.floor(Math.random() * 5) + 2;
            ans = Math.round(3.14 * r * r * h);
            q = `Volume of a Cylinder: r=${r}, h=${h} (π=3.14)`;
        } else if (type === 1) { // Cube Volume
            const s = Math.floor(Math.random() * 6) + 2;
            ans = s * s * s;
            q = `Volume of a Cube with side length=${s}`;
        } else { // Circle Area
            const r = Math.floor(Math.random() * 6) + 1;
            ans = Math.round(3.14 * r * r);
            q = `Area of a Circle with radius=${r} (π=3.14)`;
        }
        wrong = [ans + 10, ans - 5, ans * 1.2];
    }

    const wrongStrs = Array.from(new Set(wrong.map(Math.round).map(String))).filter(w => w !== String(Math.round(ans)));
    while(wrongStrs.length < 3) {
        wrongStrs.push(String(Math.round(ans) + Math.floor(Math.random() * 10) + 1));
    }

    return { 
        type: t, 
        q, 
        a: String(Math.round(ans)), 
        options: shuffleArray([String(Math.round(ans)), ...wrongStrs.slice(0, 3)]) 
    };
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
    setCurrentProblem(generateData(diff));
    setTimeLeft(getTimerLimit());
  };

  const nextRound = () => {
    if (round >= 10) {
      setGameState("finished");
      return;
    }
    setCurrentProblem(generateData(difficulty));
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
      "w-full transition-all duration-500 bg-[#1e293b] flex flex-col relative border-none overflow-y-auto overflow-x-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none min-h-screen" : "flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl shadow-2xl"
    )}>
      <div className="absolute inset-0 z-0 opacity-10">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 40 L 40 0 M 0 0 L 40 40" fill="none" stroke="#fff" strokeWidth="0.5"/>
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>

      <CardHeader className="z-10 bg-[#0f172a]/90 backdrop-blur-md relative border-b border-[#334155] p-3 sm:p-6 shrink-0">
        <div className="flex justify-between items-center text-slate-100 gap-2">
           <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" asChild className="text-cyan-400/50 hover:text-cyan-300 shrink-0">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <Hexagon className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-2xl font-black uppercase text-cyan-300 tracking-wider sm:tracking-widest font-sans truncate">Geometry Genius</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs">Expedition {round}/10</Badge>
                  {difficulty && <Badge variant="secondary" className="bg-cyan-950/60 text-cyan-300 text-[10px] uppercase">{difficulty}</Badge>}
                </div>
              </div>
           </div>
           <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameState(gameState === "instructions" ? "idle" : "instructions")}
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs px-2 sm:px-3 h-8 sm:h-9"
              >
                <BookOpen className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{gameState === "instructions" ? "Close Guide" : "How to Play"}</span>
              </Button>
              <div className="text-right">
                 <p className="text-[9px] sm:text-[10px] uppercase text-cyan-500 font-bold tracking-wider sm:tracking-widest">Artifacts</p>
                 <p className="text-lg sm:text-2xl font-black text-white tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-cyan-600 hover:text-cyan-400 h-8 w-8 sm:h-9 sm:w-9" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col z-10 relative p-3 sm:p-6 items-center justify-center overflow-y-auto w-full max-w-full">
         <AnimatePresence mode="wait">
            {gameState === "instructions" && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-slate-900/90 p-5 sm:p-8 rounded-3xl border border-cyan-800/60 max-w-2xl w-full text-slate-200 space-y-4">
                <div className="flex items-center gap-3 border-b border-cyan-800/40 pb-3">
                  <BookOpen className="w-6 h-6 text-cyan-400 shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-black text-cyan-300 uppercase tracking-wider">How to Play: Geometry Genius</h3>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <p><strong className="text-cyan-300">Objective:</strong> Solve archaeological geometry puzzles across 10 expedition rounds to recover ancient geometric relics.</p>
                  <div className="bg-slate-800/80 p-3 sm:p-4 rounded-xl border border-slate-700/80 space-y-2">
                    <p className="font-bold text-cyan-400">Expedition Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>Read the shape problem: calculate perimeters, areas, hypotenuses, or angles.</li>
                      <li>Select the correct numeric value from the multi-choice artifact dials before the countdown expires.</li>
                      <li>Earn units for every correct answer; faster answers save excavation resources.</li>
                      <li>Select your survey difficulty: Easy, Intermediate, or Forbidden Pro!</li>
                    </ul>
                  </div>
                </div>
                <Button onClick={() => setGameState("idle")} className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider rounded-xl">
                  Ready for Expedition
                </Button>
              </motion.div>
            )}

            {gameState === "idle" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} className="text-center bg-slate-900/60 p-4 sm:p-10 rounded-2xl sm:rounded-[36px] backdrop-blur-sm border border-slate-700 w-full max-w-xl">
                    <div className="relative w-16 h-16 sm:w-28 sm:h-28 mx-auto mb-3 sm:mb-6">
                       <Triangle className="absolute inset-0 w-full h-full text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse" />
                       <Circle className="absolute inset-2 w-12 h-12 sm:w-24 sm:h-24 text-pink-500/80 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black text-white uppercase mb-2 tracking-wider">Unlock Ruins</h2>
                    <p className="text-slate-400 mb-4 sm:mb-6 mx-auto text-xs sm:text-sm">Select archaeological survey difficulty.</p>
                    <div className="flex flex-col gap-2.5 sm:gap-3">
                        <Button onClick={() => startGame("easy")} className="h-11 sm:h-14 px-4 sm:px-12 text-xs sm:text-base font-black bg-slate-900 border-2 border-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-xl transition-all uppercase tracking-wider">Field Survey (Easy)</Button>
                        <Button onClick={() => startGame("intermediate")} className="h-11 sm:h-14 px-4 sm:px-12 text-xs sm:text-base font-black bg-slate-900 border-2 border-indigo-500/30 hover:border-indigo-400 text-indigo-400 rounded-xl transition-all uppercase tracking-wider">Excavation (Intermediate)</Button>
                        <Button onClick={() => startGame("pro")} className="h-11 sm:h-14 px-4 sm:px-12 text-xs sm:text-base font-black bg-slate-900 border-2 border-orange-500/30 hover:border-orange-400 text-orange-400 rounded-xl transition-all uppercase tracking-wider">Forbidden Theory (Pro)</Button>
                        <Button variant="outline" onClick={() => setGameState("instructions")} className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs sm:text-sm h-10 sm:h-11 rounded-xl">
                           <BookOpen className="w-4 h-4 mr-2" /> How to Play Guide
                        </Button>
                        <Button variant="ghost" asChild className="text-slate-500 hover:text-slate-300 uppercase tracking-widest text-[11px] sm:text-xs">
                           <Link href="/games">Back to Archeology Camp</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "playing" && currentProblem && (
                <div className="w-full max-w-2xl text-center flex flex-col items-center">
                    <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-4 sm:mb-8 w-full">
                        <div className="bg-slate-800/95 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-cyan-900 shadow-xl relative overflow-hidden">
                           <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-2 sm:mb-3">Geometric Puzzle</p>
                           <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-relaxed relative z-10 break-words">{currentProblem.q}</h1>
                        </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full">
                        {currentProblem.options.map((opt, i) => (
                            <motion.div key={opt} initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay: i*0.05}}>
                                <Button onClick={() => handleChoice(opt)} className="group w-full h-14 sm:h-20 text-lg sm:text-3xl font-black bg-slate-900/80 hover:bg-cyan-900 text-white border-2 border-slate-700 hover:border-cyan-400 transition-all rounded-xl sm:rounded-2xl relative overflow-hidden break-words">
                                    <span className="relative z-10">{opt}</span>
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-6 sm:mt-10 w-full max-w-md">
                        <div className="flex justify-between text-[11px] sm:text-xs font-black uppercase text-slate-400 mb-1.5">
                           <span>Excavation Time</span>
                           <span className="text-cyan-400">{timeLeft.toFixed(1)}s</span>
                        </div>
                        <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-2 bg-slate-800 border border-slate-700">
                           <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-100 ease-linear" />
                        </Progress>
                    </div>
                </div>
            )}

            {gameState === "showing_result" && (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}} className="bg-slate-900/95 p-5 sm:p-12 rounded-2xl sm:rounded-[36px] text-center border border-slate-700 shadow-2xl relative overflow-hidden backdrop-blur-xl w-full max-w-xl">
                    {resultStatus === "correct" && (
                        <>
                           <Hexagon className="w-12 h-12 sm:w-20 sm:h-20 text-cyan-400 mx-auto mb-3 sm:mb-5 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
                           <h2 className="text-xl sm:text-3xl font-black text-cyan-400 uppercase tracking-wide">Artifact Discovered!</h2>
                           <p className="text-xl sm:text-2xl text-white mt-1.5 sm:mt-3">+{score} UNITS</p>
                        </>
                    )}
                    {resultStatus === "incorrect" && (
                        <>
                           <Triangle className="w-12 h-12 sm:w-20 sm:h-20 text-pink-500 mx-auto mb-3 sm:mb-5 drop-shadow-[0_0_20px_rgba(236,72,153,0.4)] rotate-180" />
                           <h2 className="text-xl sm:text-3xl font-black text-pink-500 uppercase tracking-wide">Survey Failed!</h2>
                           <p className="text-sm sm:text-lg text-slate-300 mt-1.5 sm:mt-3">True Value: <span className="text-cyan-400 font-bold ml-2 bg-black/40 px-3 py-1 rounded-lg">{currentProblem?.a}</span></p>
                        </>
                    )}
                    {resultStatus === "timeout" && (
                        <>
                           <Circle className="w-12 h-12 sm:w-20 sm:h-20 text-orange-500 mx-auto mb-3 sm:mb-5 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]" />
                           <h2 className="text-xl sm:text-3xl font-black text-orange-500 uppercase tracking-wide">Time Ran Out!</h2>
                           <p className="text-sm sm:text-lg text-slate-300 mt-1.5 sm:mt-3">True Value: <span className="text-cyan-400 font-bold ml-2 bg-black/40 px-3 py-1 rounded-lg">{currentProblem?.a}</span></p>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-2.5 sm:gap-3 mt-5 sm:mt-8">
                        <Button onClick={nextRound} className="w-full sm:w-auto h-11 sm:h-14 px-6 sm:px-10 text-base sm:text-xl font-black bg-cyan-600 text-white hover:bg-cyan-500 rounded-xl shadow-2xl transition-all uppercase tracking-wide">
                            {round >= 10 ? "Close Dig" : "Next Artifact"}
                        </Button>
                        <Button variant="ghost" onClick={() => setGameState("idle")} className="text-slate-500 hover:text-slate-300 uppercase tracking-widest text-[11px] sm:text-xs">
                            Reset Survey Tools
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "finished" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center w-full max-w-xl mx-auto p-4 sm:p-8">
                    <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider mb-4 sm:mb-6">Expedition Ended</h2>
                    <div className="bg-slate-800 border border-cyan-900/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-6 sm:mb-8 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden">
                       <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-500 mb-2">Total Artifacts Recovered</p>
                       <p className="text-5xl sm:text-7xl font-black text-white tabular-nums">{score}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-12 sm:h-14 px-6 sm:px-8 text-base font-bold bg-cyan-600 hover:bg-cyan-500 text-white uppercase tracking-wider rounded-xl"><RefreshCw className="mr-2 h-4 w-4"/> New Dig</Button>
                        <Button variant="outline" asChild className="h-12 sm:h-14 px-6 sm:px-8 text-base font-bold border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl uppercase tracking-wider"><Link href="/games">File Results</Link></Button>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </CardContent>
    </Card>
  );
}
