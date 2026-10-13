"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { FlaskConical, Timer, Trophy, Repeat, Maximize, Minimize, Atom, ShieldAlert } from "lucide-react";
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
  symbol: string;
  answer: string;
  options: string[];
  startTime: number;
}

type GameState = "idle" | "playing" | "finished" | "instructions" | "showing_result";

const TIMER_LIMIT = 6;
const ROUNDS = 10;

const ELEMENTS = [
    { symbol: "Fe", name: "Iron" },
    { symbol: "Au", name: "Gold" },
    { symbol: "Ag", name: "Silver" },
    { symbol: "Na", name: "Sodium" },
    { symbol: "K", name: "Potassium" },
    { symbol: "Pb", name: "Lead" },
    { symbol: "Cu", name: "Copper" },
    { symbol: "Hg", name: "Mercury" },
    { symbol: "Sn", name: "Tin" },
    { symbol: "W", name: "Tungsten" },
    { symbol: "He", name: "Helium" },
    { symbol: "C", name: "Carbon" },
    { symbol: "O", name: "Oxygen" },
    { symbol: "Rn", name: "Radon" },
    { symbol: "U", name: "Uranium" },
    { symbol: "H", name: "Hydrogen" },
    { symbol: "Li", name: "Lithium" },
    { symbol: "Be", name: "Beryllium" },
    { symbol: "B", name: "Boron" },
    { symbol: "N", name: "Nitrogen" },
    { symbol: "F", name: "Fluorine" },
    { symbol: "Ne", name: "Neon" },
    { symbol: "Mg", name: "Magnesium" },
    { symbol: "Al", name: "Aluminum" },
    { symbol: "Si", name: "Silicon" },
    { symbol: "P", name: "Phosphorus" },
    { symbol: "S", name: "Sulfur" },
    { symbol: "Cl", name: "Chlorine" },
    { symbol: "Ar", name: "Argon" },
    { symbol: "Ca", name: "Calcium" },
    { symbol: "Sc", name: "Scandium" },
    { symbol: "Ti", name: "Titanium" },
    { symbol: "V", name: "Vanadium" },
    { symbol: "Cr", name: "Chromium" },
    { symbol: "Mn", name: "Manganese" },
    { symbol: "Co", name: "Cobalt" },
    { symbol: "Ni", name: "Nickel" },
    { symbol: "Zn", name: "Zinc" },
    { symbol: "Ga", name: "Gallium" },
    { symbol: "Ge", name: "Germanium" },
    { symbol: "As", name: "Arsenic" },
    { symbol: "Se", name: "Selenium" },
    { symbol: "Br", name: "Bromine" },
    { symbol: "Kr", name: "Krypton" },
    { symbol: "Rb", name: "Rubidium" },
    { symbol: "Sr", name: "Strontium" },
    { symbol: "Y", name: "Yttrium" },
    { symbol: "Zr", name: "Zirconium" },
    { symbol: "Nb", name: "Niobium" },
    { symbol: "Mo", name: "Molybdenum" }
];

export function QuantumQuest({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [currentProblem, setCurrentProblem] = React.useState<Problem | null>(null);
  const [sessionElements, setSessionElements] = React.useState<typeof ELEMENTS>([]);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_LIMIT);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [combo, setCombo] = React.useState(0);
  const [resultData, setResultData] = React.useState<{ status: "correct" | "incorrect" | "timeout", points?: number, trueAnswer?: string }>({ status: "correct" });
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateProblem = (element: typeof ELEMENTS[0]): Problem => {
    const options = [element.name];
    
    // Select 3 random distractors
    const availableDistractors = shuffleArray(ELEMENTS.filter(e => e.symbol !== element.symbol));
    while (options.length < 4 && availableDistractors.length > 0) {
      options.push(availableDistractors.pop()!.name);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      symbol: element.symbol,
      answer: element.name,
      options: shuffleArray(options),
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

    let currentPool = sessionElements;
    if (round === 0) {
      const shuffled = shuffleArray([...ELEMENTS]);
      currentPool = shuffled;
      setSessionElements(shuffled);
    }

    const element = currentPool[round] || ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    setCurrentProblem(generateProblem(element));
    setRound(prev => prev + 1);
    setTimeLeft(TIMER_LIMIT);
    setGameState("playing");
  };

  const handleAnswer = (selected: string) => {
    if (gameState !== "playing" || !currentProblem) return;

    const correct = selected === currentProblem.answer;
    let pointsEarned = 0;
    let status: "correct" | "incorrect" | "timeout" = "incorrect";

    if (correct) {
      status = "correct";
      const bonus = Math.floor(timeLeft * 15);
      pointsEarned = 250 + bonus;
      setScore(prev => prev + pointsEarned);
      setCombo(prev => prev + 1);
    } else if (selected === "TIMEOUT") {
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
      handleAnswer("TIMEOUT");
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft]);

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-cyan-500/20 shadow-2xl bg-slate-950 transition-all duration-300 relative",
      isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-slate-950"
    )}>
      {/* Bio-Sci Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      </div>

      <CardHeader className="z-10 bg-slate-950/60 backdrop-blur-md border-b border-cyan-500/20 relative p-3 sm:p-6 shrink-0">
        <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Button variant="ghost" size="icon" asChild className="text-cyan-500/50 hover:text-cyan-400 shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                    <Link href="/games">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                </Button>
                <div className="relative shrink-0">
                    <Atom className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full opacity-50" />
                </div>
                <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-2xl font-black text-white tracking-wider uppercase font-mono truncate">Quantum Quest</CardTitle>
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                        <Badge variant="outline" className="text-cyan-400 border-cyan-400/50 text-[10px] sm:text-xs">ISOTOPE {round}/{ROUNDS}</Badge>
                        <Badge variant="outline" className="text-blue-400 border-blue-400/50 text-[10px] sm:text-xs">ENERGY x{combo}</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] font-bold text-cyan-500/50 uppercase tracking-widest">Resonance</p>
                    <p className="text-lg sm:text-2xl font-black text-white tabular-nums drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-900/40 h-8 w-8 sm:h-10 sm:w-10" onClick={onToggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
            </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 z-10 relative overflow-y-auto w-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              className="text-center space-y-6 sm:space-y-8 max-w-2xl px-3 py-6"
            >
              <div className="relative">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"
                />
                <FlaskConical className="h-20 w-20 sm:h-32 sm:w-32 text-cyan-400 mx-auto mb-4 sm:mb-6 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-3 sm:mb-4 font-mono">
                    Harness the<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-sm">Elements</span>
                </h2>
              </div>
              <p className="text-cyan-200/60 text-sm sm:text-lg md:text-xl max-w-lg mx-auto font-mono">
                Unknown isotopes are destabilizing. Identify their elemental nature before critical mass.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-md mx-auto">
                <Button 
                  onClick={startNextRound} 
                  className="w-full sm:flex-1 h-12 sm:h-16 px-6 sm:px-8 text-base sm:text-xl font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all font-mono uppercase tracking-wider"
                >
                  Start Reaction
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setGameState('instructions')} 
                  className="w-full sm:flex-1 h-12 sm:h-16 px-6 sm:px-8 text-base sm:text-xl font-black border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/40 rounded-xl font-mono uppercase tracking-wider"
                >
                  Lab Procedures
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, rotateX: 90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 p-5 sm:p-10 rounded-2xl max-w-2xl w-full mx-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-xl sm:text-3xl font-black text-white uppercase mb-4 sm:mb-8 flex items-center gap-3 font-mono">
                <ShieldAlert className="text-cyan-400 h-6 w-6" /> Lab Procedures
              </h3>
              <div className="space-y-4 sm:space-y-6 text-sm sm:text-lg text-cyan-100/90 font-mono">
                <div className="flex gap-3 sm:gap-4">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-400 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.2)]">1</div>
                  <span>Analyze the chemical symbol inside the containment field.</span>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-400 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.2)]">2</div>
                  <span>Select the correct Element Name from the data modules.</span>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-400 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.2)]">3</div>
                  <span><span className="text-red-400 font-bold">WARNING:</span> Containment fails in {TIMER_LIMIT} seconds. React quickly.</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-6 sm:mt-10">
                <Button onClick={startNextRound} className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-black bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors uppercase tracking-wider rounded-xl">
                  Confirm Protocols
                </Button>
                <Button variant="outline" onClick={() => setGameState('idle')} className="h-12 sm:h-14 text-base border-cyan-500/40 text-cyan-400 rounded-xl">
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === "playing" && currentProblem && (
            <div className="w-full flex-grow flex flex-col items-center justify-center relative py-4">
               <motion.div
                  key={currentProblem.id}
                  initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", damping: 20 }}
                  className="mb-6 sm:mb-10 relative"
               >
                  <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-[spin_4s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-blue-500/30 animate-[spin_3s_linear_infinite_reverse]" />
                  <div className="h-32 w-32 sm:h-44 sm:w-44 md:h-52 md:w-52 bg-slate-900/60 backdrop-blur-sm rounded-full flex flex-col items-center justify-center shadow-[inset_0_0_50px_rgba(34,211,238,0.2)] border border-cyan-500/50">
                    <span className="text-zinc-500 font-mono text-[10px] sm:text-xs uppercase tracking-widest mb-1">Symbol</span>
                    <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                      {currentProblem.symbol}
                    </span>
                  </div>
               </motion.div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-2xl px-2">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Button
                            onClick={() => handleAnswer(opt)}
                            className="w-full h-14 sm:h-20 text-lg sm:text-2xl font-bold font-mono bg-slate-900/80 hover:bg-cyan-950/60 text-cyan-50 border border-slate-700 hover:border-cyan-400 rounded-xl transition-all group overflow-hidden relative shadow-lg"
                        >
                            <span className="relative z-10">{opt}</span>
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <motion.div 
                                className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 opacity-0 group-hover:opacity-50"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="mt-6 sm:mt-8 px-4 w-full max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <span className="text-cyan-500/60 text-[10px] sm:text-xs font-black uppercase tracking-wider font-mono">Containment Shield</span>
                    <span className={cn("font-black tabular-nums font-mono drop-shadow-md text-xs sm:text-sm", timeLeft < 3 ? "text-red-400 animate-pulse" : "text-cyan-400")}>
                        {timeLeft.toFixed(1)}s
                    </span>
                  </div>
                  <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full relative shadow-[0_0_10px_currentColor]", timeLeft < 3 ? "bg-red-500 text-red-500" : "bg-cyan-400 text-cyan-400")} />
                  </Progress>
               </div>
            </div>
          )}

          {gameState === "showing_result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              className="w-full flex-grow flex flex-col items-center justify-center relative text-center px-4 py-8"
            >
                {resultData.status === "correct" && (
                    <div className="bg-slate-900/80 border border-cyan-500/40 p-8 sm:p-14 rounded-2xl backdrop-blur-md shadow-[0_0_50px_rgba(34,211,238,0.2)] max-w-md w-full">
                        <h2 className="text-3xl sm:text-5xl font-black text-cyan-400 uppercase tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] font-mono">
                            Contained
                        </h2>
                        <p className="text-lg sm:text-2xl text-cyan-100 mt-4 font-bold font-mono">+{resultData.points} units</p>
                    </div>
                )}
                {resultData.status === "incorrect" && (
                    <div className="bg-slate-900/80 border border-red-500/40 p-8 sm:p-14 rounded-2xl backdrop-blur-md shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-md w-full">
                        <h2 className="text-3xl sm:text-5xl font-black text-red-500 uppercase tracking-wider drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] font-mono">
                            Mismatch
                        </h2>
                        <p className="text-base sm:text-xl text-white mt-4 font-mono">Correct Element: <br/><span className="text-2xl sm:text-3xl font-bold text-red-400 block mt-2">{resultData.trueAnswer}</span></p>
                    </div>
                )}
                {resultData.status === "timeout" && (
                    <div className="bg-slate-900/80 border border-orange-500/40 p-8 sm:p-14 rounded-2xl backdrop-blur-md shadow-[0_0_50px_rgba(249,115,22,0.2)] max-w-md w-full">
                        <h2 className="text-3xl sm:text-5xl font-black text-orange-500 uppercase tracking-wider drop-shadow-[0_0_20px_rgba(249,115,22,0.5)] font-mono">
                            Overload
                        </h2>
                        <p className="text-base sm:text-xl text-white mt-4 font-mono">Correct Element: <br/><span className="text-2xl sm:text-3xl font-bold text-orange-400 block mt-2">{resultData.trueAnswer}</span></p>
                    </div>
                )}
            </motion.div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full max-w-2xl px-4 py-8"
            >
              <div className="relative inline-block mb-6 sm:mb-8">
                <Atom className="h-20 w-20 sm:h-32 sm:w-32 text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-[-20%] border-2 border-dashed border-cyan-400/30 rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase mb-2 font-mono">Laboratory Secured</h2>
              <p className="text-cyan-400/60 text-sm sm:text-lg font-bold uppercase tracking-wider mb-6 sm:mb-8 font-mono">Reaction Complete</p>
              
              <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 flex flex-row gap-4 justify-center backdrop-blur-lg">
                <div className="text-center flex-1">
                    <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase mb-1 tracking-wider font-mono">Total Resonance</p>
                    <p className="text-3xl sm:text-5xl font-black text-white tabular-nums font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{score}</p>
                </div>
                <div className="w-px bg-slate-700" />
                <div className="text-center flex-1">
                    <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase mb-1 tracking-wider font-mono">Energy Peak</p>
                    <p className="text-3xl sm:text-5xl font-black text-cyan-400 tabular-nums font-mono drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">{combo}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => { setScore(0); setRound(0); setCombo(0); setGameState('idle'); }} className="h-12 sm:h-14 px-8 text-base sm:text-lg font-black bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xl font-mono uppercase tracking-wider">
                    <Repeat className="mr-2 h-4 w-4" /> RESTART LAB
                </Button>
                <Button variant="outline" asChild className="h-12 sm:h-14 px-8 text-base sm:text-lg font-black border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl font-mono uppercase tracking-wider">
                    <Link href="/games">EXIT FACILITY</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="z-10 bg-slate-950/80 backdrop-blur-md border-t border-cyan-500/20 py-3 sm:py-4 flex justify-between px-4 sm:px-6 shrink-0">
        <div className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider font-mono">
            Quantum Quest // LingoLabs Hub
        </div>
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_5px_currentColor]" />
            <span className="text-cyan-500 text-[9px] sm:text-[10px] font-black uppercase font-mono tracking-wider">Online</span>
        </div>
      </CardFooter>
    </Card>
  );
}
