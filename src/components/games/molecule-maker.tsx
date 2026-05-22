"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { FlaskConical, Atom, RefreshCw, Maximize, Minimize, AlertOctagon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

type Difficulty = "easy" | "intermediate" | "pro";

interface MoleculeProblem {
  name: string;
  formula: string;
  wrong: string[];
}

export function MoleculeMaker({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<{name: string, formula: string, options: string[]} | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(15);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [resultStatus, setResultStatus] = React.useState<"correct" | "incorrect" | "timeout">("correct");
  
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const moleculesByDifficulty: Record<Difficulty, MoleculeProblem[]> = {
    easy: [
      { name: "Water", formula: "H2O", wrong: ["HO2", "H3O", "H2O2"] },
      { name: "Carbon Dioxide", formula: "CO2", wrong: ["CO", "C2O", "C2O2"] },
      { name: "Sodium Chloride", formula: "NaCl", wrong: ["Na2Cl", "NaCl2", "SCl"] },
      { name: "Oxygen Gas", formula: "O2", wrong: ["O", "O3", "O4"] },
      { name: "Nitrogen Gas", formula: "N2", wrong: ["N", "N3", "N2O"] },
      { name: "Hydrogen Gas", formula: "H2", wrong: ["H", "H3", "He"] },
      { name: "Carbon Monoxide", formula: "CO", wrong: ["CO2", "C2O", "C"] },
      { name: "Methane", formula: "CH4", wrong: ["CH3", "C2H4", "CH2"] },
      { name: "Ozone", formula: "O3", wrong: ["O2", "O", "O4"] },
      { name: "Hydrochloric Acid", formula: "HCl", wrong: ["H2Cl", "HCl2", "ClH"] }
    ],
    intermediate: [
      { name: "Ammonia", formula: "NH3", wrong: ["NH2", "NH4", "N2H3"] },
      { name: "Sulfuric Acid", formula: "H2SO4", wrong: ["HSO4", "H2SO3", "SO4"] },
      { name: "Nitric Acid", formula: "HNO3", wrong: ["HNO2", "H2NO3", "NO3"] },
      { name: "Ethanol", formula: "C2H5OH", wrong: ["CH3OH", "C2H6O", "C2H4OH"] },
      { name: "Glucose", formula: "C6H12O6", wrong: ["C6H10O6", "C5H12O5", "C6H6O6"] },
      { name: "Calcium Carbonate", formula: "CaCO3", wrong: ["CaC", "Ca2CO3", "CaCO2"] },
      { name: "Sodium Bicarbonate", formula: "NaHCO3", wrong: ["NaCO3", "Na2CO3", "NaHCO2"] },
      { name: "Propane", formula: "C3H8", wrong: ["C3H6", "C4H10", "C2H6"] },
      { name: "Potassium Permanganate", formula: "KMnO4", wrong: ["KMnO3", "K2MnO4", "MnKO4"] },
      { name: "Silver Nitrate", formula: "AgNO3", wrong: ["AgNO2", "Ag2NO3", "AgN"] }
    ],
    pro: [
      { name: "Caffeine", formula: "C8H10N4O2", wrong: ["C8H12N4O2", "C7H10N4O2", "C8H10N3O2"] },
      { name: "Aspirin", formula: "C9H8O4", wrong: ["C8H8O4", "C9H10O4", "C9H8O3"] },
      { name: "Acetaminophen", formula: "C8H9NO2", wrong: ["C8H10NO2", "C7H9NO2", "C8H9N2O2"] },
      { name: "Penicillin G", formula: "C16H18N2O4S", wrong: ["C16H16N2O4S", "C15H18N2O4S", "C16H18N2O5S"] },
      { name: "Adenosine Triphosphate", formula: "C10H16N5O13P3", wrong: ["C10H15N5O13P3", "C11H16N5O13P3", "C10H16N4O13P3"] },
      { name: "Cholesterol", formula: "C27H46O", wrong: ["C27H44O", "C26H46O", "C27H46O2"] },
      { name: "Dopamine", formula: "C8H11NO2", wrong: ["C8H12NO2", "C7H11NO2", "C8H11N2O2"] },
      { name: "Serotonin", formula: "C10H12N2O", wrong: ["C10H10N2O", "C11H12N2O", "C10H12N2O2"] },
      { name: "Adrenaline", formula: "C9H13NO3", wrong: ["C9H12NO3", "C8H13NO3", "C9H13N2O3"] },
      { name: "Chlorophyll a", formula: "C55H72MgN4O5", wrong: ["C55H70MgN4O5", "C54H72MgN4O5", "C55H72MgN4O6"] }
    ]
  };

  const getTimerLimit = () => {
    if (difficulty === "easy") return 15;
    if (difficulty === "intermediate") return 10;
    return 7;
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setRound(1);
    setScore(0);
    setGameState("playing");
    const pool = moleculesByDifficulty[diff];
    const item = pool[Math.floor(Math.random() * pool.length)];
    setCurrentProblem({ name: item.name, formula: item.formula, options: shuffleArray([item.formula, ...item.wrong]) });
    setTimeLeft(getTimerLimit());
  };

  const nextRound = () => {
    if (round >= 10) {
      setGameState("finished");
      if (firestore && game) {
        logAnalyticsEvent(firestore, user?.uid || 'guest', { type: 'game_played', details: { slug: game.slug, score, difficulty } });
      }
      return;
    }
    const pool = moleculesByDifficulty[difficulty];
    const item = pool[Math.floor(Math.random() * pool.length)];
    setCurrentProblem({ name: item.name, formula: item.formula, options: shuffleArray([item.formula, ...item.wrong]) });
    setRound(r => r + 1);
    setTimeLeft(getTimerLimit());
    setGameState("playing");
  };

  const handleChoice = (ans: string | null) => {
    if (gameState !== "playing" || !currentProblem) return;
    if (ans === currentProblem.formula) {
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
      "w-full transition-all duration-500 bg-slate-900 flex flex-col relative border-none overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[700px]"
    )}>
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 1))" }}></div>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

      <CardHeader className="z-10 bg-slate-950/80 backdrop-blur-md relative border-b border-violet-500/20">
        <div className="flex justify-between items-center text-violet-100">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-violet-500/50 hover:text-violet-400">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <FlaskConical className="h-8 w-8 text-violet-400" />
              <div>
                <CardTitle className="text-2xl font-black uppercase text-violet-300 tracking-widest font-mono">Molecule Maker</CardTitle>
                <Badge variant="outline" className="border-violet-500/30 text-violet-400 mt-1">Synthesis {round}/10</Badge>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] uppercase text-violet-500 font-bold tracking-widest">Yield</p>
                 <p className="text-2xl font-black text-violet-300 tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-violet-500" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Minimize /> : <Maximize />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col z-10 relative p-6 items-center justify-center">
         <AnimatePresence mode="wait">
            {gameState === "idle" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, y:-20}} className="text-center bg-slate-900/60 p-12 rounded-[40px] backdrop-blur-sm border border-violet-500/30 shadow-[0_0_50px_rgba(139,92,246,0.15)] w-full max-w-md">
                    <Atom className="w-32 h-32 text-violet-400 mx-auto animate-spin-slow mb-6" style={{ animationDuration: '10s' }} />
                    <h2 className="text-4xl font-black text-white uppercase mb-4 font-mono tracking-widest">Lab System Offline</h2>
                    <p className="text-violet-300/60 mb-10 mx-auto lowercase">Select complexity level to initialize synthesizer.</p>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => startGame("easy")} className="h-16 px-12 text-xl font-bold bg-slate-950 border-2 border-green-500/30 hover:border-green-500 text-green-400 rounded-xl font-mono uppercase tracking-widest transition-all">Basic Compounds (Easy)</Button>
                        <Button onClick={() => startGame("intermediate")} className="h-16 px-12 text-xl font-bold bg-slate-950 border-2 border-violet-500/30 hover:border-violet-500 text-violet-400 rounded-xl font-mono uppercase tracking-widest transition-all">Organic Chemistry (Intermediate)</Button>
                        <Button onClick={() => startGame("pro")} className="h-16 px-12 text-xl font-bold bg-slate-950 border-2 border-red-500/30 hover:border-red-500 text-red-400 rounded-xl font-mono uppercase tracking-widest transition-all">Biochemistry (Pro)</Button>
                        <Button variant="ghost" asChild className="mt-4 text-violet-500/50 hover:text-violet-300 uppercase tracking-widest font-mono">
                           <Link href="/games">Back to Lab Entrance</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "playing" && currentProblem && (
                <div className="w-full max-w-3xl text-center">
                    <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="bg-slate-950 border border-violet-500/50 p-8 rounded-[32px] mb-12 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                        <p className="text-violet-500 font-bold uppercase tracking-widest text-sm mb-4">Target Compound</p>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{currentProblem.name}</h1>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentProblem.options.map((opt, i) => (
                            <motion.div key={opt} initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay: i*0.1}}>
                                <Button onClick={() => handleChoice(opt)} className="w-full min-h-[80px] h-auto py-4 text-3xl font-mono font-bold bg-slate-800/80 hover:bg-violet-600 hover:scale-105 text-violet-100 border border-violet-500/30 transition-all rounded-2xl">
                                    {opt.split(/([0-9]+)/).map((part, index) => 
                                        part.match(/[0-9]+/) ? <sub key={index} className="text-xl relative top-2">{part}</sub> : <span key={index}>{part}</span>
                                    )}
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 max-w-md mx-auto relative">
                        <div className="flex justify-between text-xs font-black uppercase text-violet-500 mb-2">
                           <span>Containment Strength</span>
                           <span>{timeLeft.toFixed(1)}s</span>
                        </div>
                        <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-2 bg-slate-800 border border-violet-900 overflow-hidden">
                           <div className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,1)] transition-all duration-100 ease-linear" />
                        </Progress>
                    </div>
                </div>
            )}

            {gameState === "showing_result" && (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:1.2, opacity:0}} className="bg-slate-900/95 p-12 rounded-[40px] text-center border-2 border-violet-500/50 shadow-[0_0_50px_rgba(139,92,246,0.3)] backdrop-blur-xl w-full max-w-2xl">
                    {resultStatus === "correct" && (
                        <>
                           <FlaskConical className="w-24 h-24 text-green-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]" />
                           <h2 className="text-4xl font-black text-green-400 uppercase tracking-widest font-mono">Synthesis Stable</h2>
                           <p className="text-3xl text-green-200 mt-4 tabular-nums">+{score} UNITS</p>
                        </>
                    )}
                    {resultStatus === "incorrect" && (
                        <>
                           <AlertOctagon className="w-24 h-24 text-red-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                           <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest font-mono">Synthesis Failed</h2>
                           <p className="text-xl text-slate-300 mt-4">Correct Formula: <span className="text-violet-400 font-bold bg-slate-800 px-4 py-2 rounded-xl">{currentProblem?.formula}</span></p>
                        </>
                    )}
                    {resultStatus === "timeout" && (
                        <>
                           <AlertOctagon className="w-24 h-24 text-orange-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
                           <h2 className="text-4xl font-black text-orange-500 uppercase tracking-widest font-mono">Containment Breach</h2>
                           <p className="text-xl text-slate-300 mt-4">Correct Formula: <span className="text-violet-400 font-bold bg-slate-800 px-4 py-2 rounded-xl">{currentProblem?.formula}</span></p>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-4 mt-10">
                        <Button onClick={nextRound} className="h-16 px-12 text-2xl font-black bg-violet-600 text-white hover:bg-violet-500 rounded-xl shadow-2xl transition-all hover:scale-105 font-mono uppercase tracking-widest">
                            {round >= 10 ? "Finish Synthesis" : "Next Molecule"}
                        </Button>
                        <Button variant="ghost" onClick={() => setGameState("idle")} className="text-violet-500/50 hover:text-violet-300 uppercase tracking-widest font-mono">
                            Change Complexity
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "finished" && (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="text-center max-w-xl mx-auto">
                    <Atom className="w-32 h-32 text-violet-400 mx-auto mb-8 animate-spin-slow" style={{ animationDuration: '5s' }} />
                    <h2 className="text-5xl font-black text-white uppercase font-mono tracking-widest mb-4">Batch Complete</h2>
                    <div className="bg-slate-900 border border-violet-500/50 rounded-3xl p-12 mb-12 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                       <p className="text-sm font-black uppercase tracking-widest text-violet-500 mb-2">Total Lab Yield</p>
                       <p className="text-7xl font-black text-white tabular-nums">{score}</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-16 px-10 text-lg font-bold bg-violet-600 hover:bg-violet-500 text-white font-mono uppercase tracking-widest rounded-xl transition-all hover:scale-105"><RefreshCw className="mr-2 h-5 w-5"/> New Batch</Button>
                        <Button variant="outline" asChild className="h-16 px-10 text-lg font-bold border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl font-mono uppercase tracking-widest"><Link href="/games">Shutdown</Link></Button>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </CardContent>
    </Card>
  );
}
