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
      "w-full transition-all duration-500 flex flex-col overflow-y-auto relative border-none shadow-2xl",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-slate-950" : "max-w-4xl mx-auto h-[700px] bg-slate-950"
    )}>
      {/* Bio-Sci Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      </div>

      <CardHeader className="z-10 bg-slate-950/60 backdrop-blur-md border-b border-cyan-500/20 relative">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="text-cyan-500/50 hover:text-cyan-400 mr-2">
                    <Link href="/games">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                </Button>
                <div className="relative">
                    <Atom className="h-8 w-8 text-cyan-400" />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full opacity-50" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-black text-white tracking-widest uppercase font-mono">Quantum Quest</CardTitle>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">ISOTOPE {round}/{ROUNDS}</Badge>
                        <Badge variant="outline" className="text-blue-400 border-blue-400/50">ENERGY x{combo}</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-cyan-500/50 uppercase tracking-widest">Resonance</p>
                    <p className="text-2xl font-black text-white tabular-nums drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-900/40" onClick={onToggleFullscreen}>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              className="text-center space-y-8 max-w-2xl px-4"
            >
              <div className="relative">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"
                />
                <FlaskConical className="h-32 w-32 text-cyan-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
                <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4 font-mono">
                    Harness the<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-sm">Elements</span>
                </h2>
              </div>
              <p className="text-cyan-200/60 text-lg md:text-xl max-w-lg mx-auto font-mono">
                Unknown isotopes are destabilizing. Identify their elemental nature before critical mass.
              </p>
              <Button 
                onClick={() => setGameState('instructions')} 
                className="h-20 px-12 text-2xl font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all hover:-translate-y-1 block mx-auto font-mono uppercase tracking-[0.2em]"
              >
                Start Reaction
              </Button>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, rotateX: 90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 p-10 rounded-2xl max-w-2xl w-full mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-3xl font-black text-white uppercase mb-8 flex items-center gap-3 font-mono">
                <ShieldAlert className="text-cyan-400" /> Lab Procedures
              </h3>
              <div className="space-y-6 text-xl text-cyan-100/90 font-mono">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-400 flex items-center justify-center text-sm font-bold shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.2)]">1</div>
                  <span>Analyze the chemical symbol inside the containment field.</span>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-400 flex items-center justify-center text-sm font-bold shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.2)]">2</div>
                  <span>Select the correct Element Name from the data modules.</span>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-400 flex items-center justify-center text-sm font-bold shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.2)]">3</div>
                  <span><span className="text-red-400 font-bold">WARNING:</span> Containment fails in {TIMER_LIMIT} seconds. React quickly.</span>
                </div>
              </div>
              <Button onClick={startNextRound} className="w-full mt-10 h-16 text-xl font-black bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors uppercase tracking-widest rounded-lg">
                Confirm Protocols
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && currentProblem && (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
               <motion.div
                  key={currentProblem.id}
                  initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", damping: 20 }}
                  className="mb-12 relative"
               >
                  <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-[spin_4s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-blue-500/30 animate-[spin_3s_linear_infinite_reverse]" />
                  <div className="h-44 w-44 md:h-56 md:w-56 bg-slate-900/60 backdrop-blur-sm rounded-full flex flex-col items-center justify-center shadow-[inset_0_0_50px_rgba(34,211,238,0.2)] border border-cyan-500/50">
                    <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Symbol</span>
                    <span className="text-7xl md:text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                      {currentProblem.symbol}
                    </span>
                  </div>
               </motion.div>

               <div className="grid grid-cols-2 gap-4 w-full max-w-3xl px-4">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Button
                            onClick={() => handleAnswer(opt)}
                            className="w-full h-20 md:h-24 text-2xl md:text-3xl font-bold font-mono bg-slate-900/80 hover:bg-cyan-950/60 text-cyan-50 border border-slate-700 hover:border-cyan-400 rounded-xl transition-all group overflow-hidden relative shadow-lg"
                        >
                            <span className="relative z-10">{opt}</span>
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {/* Scanning line effect */}
                            <motion.div 
                                className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 opacity-0 group-hover:opacity-50"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="absolute bottom-8 left-0 right-0 px-8 w-full max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-cyan-500/60 text-xs font-black uppercase tracking-widest font-mono">Containment Shield</span>
                    <span className={cn("font-black tabular-nums font-mono drop-shadow-md", timeLeft < 3 ? "text-red-400 animate-pulse" : "text-cyan-400")}>
                        {timeLeft.toFixed(1)}s
                    </span>
                  </div>
                  <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-1 bg-slate-800 rounded-none overflow-visible">
                    <div className={cn("h-full relative shadow-[0_0_10px_currentColor]", timeLeft < 3 ? "bg-red-500 text-red-500" : "bg-cyan-400 text-cyan-400")}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_currentColor]" />
                    </div>
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
              className="w-full h-full flex flex-col items-center justify-center relative text-center px-4"
            >
                {resultData.status === "correct" && (
                    <div className="bg-slate-900/80 border border-cyan-500/40 p-16 rounded-[2rem] backdrop-blur-md shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                        <h2 className="text-5xl md:text-7xl font-black text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] font-mono">
                            Contained
                        </h2>
                        <p className="text-2xl text-cyan-100 mt-6 font-bold font-mono">+{resultData.points} units</p>
                    </div>
                )}
                {resultData.status === "incorrect" && (
                    <div className="bg-slate-900/80 border border-red-500/40 p-16 rounded-[2rem] backdrop-blur-md shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <h2 className="text-5xl md:text-7xl font-black text-red-500 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] font-mono">
                            Mismatch
                        </h2>
                        <p className="text-xl md:text-2xl text-white mt-8 font-mono">Correct Element: <br/><span className="text-4xl font-bold text-red-400 block mt-2">{resultData.trueAnswer}</span></p>
                    </div>
                )}
                {resultData.status === "timeout" && (
                    <div className="bg-slate-900/80 border border-orange-500/40 p-16 rounded-[2rem] backdrop-blur-md shadow-[0_0_50px_rgba(249,115,22,0.2)]">
                        <h2 className="text-5xl md:text-7xl font-black text-orange-500 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(249,115,22,0.5)] font-mono">
                            Overload
                        </h2>
                        <p className="text-xl md:text-2xl text-white mt-8 font-mono">Correct Element: <br/><span className="text-4xl font-bold text-orange-400 block mt-2">{resultData.trueAnswer}</span></p>
                    </div>
                )}
            </motion.div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full max-w-2xl px-4"
            >
              <div className="relative inline-block mb-8">
                <Atom className="h-32 w-32 text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-[-20%] border-2 border-dashed border-cyan-400/30 rounded-full" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase mb-2 font-mono">Laboratory Secured</h2>
              <p className="text-cyan-400/60 text-lg md:text-xl font-bold uppercase tracking-widest mb-12 font-mono">Reaction Complete</p>
              
              <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-8 mb-12 flex flex-col md:flex-row gap-8 justify-center backdrop-blur-lg">
                <div className="text-center flex-1">
                    <p className="text-xs font-black text-slate-500 uppercase mb-2 tracking-widest font-mono">Total Resonance</p>
                    <p className="text-5xl lg:text-6xl font-black text-white tabular-nums font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{score}</p>
                </div>
                <div className="hidden md:block w-px bg-slate-700" />
                <div className="text-center flex-1">
                    <p className="text-xs font-black text-slate-500 uppercase mb-2 tracking-widest font-mono">Energy Peak</p>
                    <p className="text-5xl lg:text-6xl font-black text-cyan-400 tabular-nums font-mono drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">{combo}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => { setScore(0); setRound(0); setCombo(0); setGameState('idle'); }} className="h-16 px-10 text-xl font-black bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-lg font-mono uppercase tracking-widest">
                    <Repeat className="mr-2" /> RESTART LAB
                </Button>
                <Button variant="outline" asChild className="h-16 px-10 text-xl font-black border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-mono uppercase tracking-widest">
                    <Link href="/games">EXIT FACILITY</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="z-10 bg-slate-950/80 backdrop-blur-md border-t border-cyan-500/20 py-4 flex justify-between px-6">
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
            Quantum Quest // LingoLabs Hub
        </div>
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_5px_currentColor]" />
            <span className="text-cyan-500 text-[10px] font-black uppercase font-mono tracking-widest">Online</span>
        </div>
      </CardFooter>
    </Card>
  );
}
