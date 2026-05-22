"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Activity, ShieldAlert, Maximize, Minimize, Crosshair } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

type Difficulty = "easy" | "intermediate" | "pro";

interface BioProblem {
  q: string;
  a: string;
  wrong: string[];
}

export function BioHazard({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<{q: string, a: string, options: string[]} | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(12);
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

  const questionsByDifficulty: Record<Difficulty, BioProblem[]> = {
    easy: [
      { q: "What organelle is the powerhouse of the cell?", a: "Mitochondria", wrong: ["Nucleus", "Ribosome", "Golgi Apparatus"] },
      { q: "Which blood cells are responsible for fighting infection?", a: "White Blood Cells", wrong: ["Red Blood Cells", "Platelets", "Plasma"] },
      { q: "What is the genetic material found in most organisms called?", a: "DNA", wrong: ["RNA", "Protein", "Lipid"] },
      { q: "Where does photosynthesis primarily take place in a plant cell?", a: "Chloroplast", wrong: ["Vacuole", "Cell Wall", "Mitochondria"] },
      { q: "What is the largest organ of the human body?", a: "Skin", wrong: ["Liver", "Heart", "Brain"] },
      { q: "Which part of the plant absorbs water from the soil?", a: "Roots", wrong: ["Leaves", "Stem", "Flowers"] },
      { q: "What do we breathe in that our bodies need to survive?", a: "Oxygen", wrong: ["Carbon Dioxide", "Nitrogen", "Argon"] },
      { q: "How many bones are in the adult human skeleton?", a: "206", wrong: ["106", "306", "406"] },
      { q: "Which animal is a mammal?", a: "Whale", wrong: ["Shark", "Tuna", "Salmon"] },
      { q: "What is the main function of the heart?", a: "Pump blood", wrong: ["Breathe air", "Digest food", "Think clearly"] }
    ],
    intermediate: [
      { q: "Which organ is primarily responsible for filtering blood?", a: "Kidneys", wrong: ["Heart", "Lungs", "Stomach"] },
      { q: "What part of the brain controls balance and coordination?", a: "Cerebellum", wrong: ["Cerebrum", "Brainstem", "Thalamus"] },
      { q: "What is the process by which cells divide to form two identical daughter cells?", a: "Mitosis", wrong: ["Meiosis", "Apoptosis", "Osmosis"] },
      { q: "Which gas is released by plants during photosynthesis?", a: "Oxygen", wrong: ["Carbon Dioxide", "Nitrogen", "Methane"] },
      { q: "What is the name of the pigment that gives skin its color?", a: "Melanin", wrong: ["Keratin", "Hemoglobin", "Chlorophyll"] },
      { q: "Which vitamin is produced when skin is exposed to sunlight?", a: "Vitamin D", wrong: ["Vitamin A", "Vitamin C", "Vitamin K"] },
      { q: "What are the building blocks of proteins?", a: "Amino Acids", wrong: ["Glucose", "Fatty Acids", "Nucleotides"] },
      { q: "Which system is responsible for transporting nutrients throughout the body?", a: "Circulatory System", wrong: ["Nervous System", "Digestive System", "Endocrine System"] },
      { q: "Where is the smallest bone in the human body located?", a: "Ear", wrong: ["Nose", "Finger", "Toe"] },
      { q: "What type of organism can make its own food?", a: "Autotroph", wrong: ["Heterotroph", "Saprophyte", "Parasite"] }
    ],
    pro: [
      { q: "What is the programmed death of a cell called?", a: "Apoptosis", wrong: ["Necrosis", "Phagocytosis", "Endocytosis"] },
      { q: "Which enzyme is responsible for unwinding DNA during replication?", a: "Helicase", wrong: ["Polymerase", "Ligase", "Primase"] },
      { q: "What is the name of the cycle that produces ATP in mitochondria?", a: "Krebs Cycle", wrong: ["Calvin Cycle", "Glycolysis", "Urea Cycle"] },
      { q: "Which hormone regulates sleep-wake cycles?", a: "Melatonin", wrong: ["Insulin", "Adrenaline", "Thyroxine"] },
      { q: "What is the functional unit of the kidney?", a: "Nephron", wrong: ["Neuron", "Alveoli", "Villous"] },
      { q: "Which part of the neuron receives signals from other cells?", a: "Dendrites", wrong: ["Axon", "Myelin Sheath", "Synapse"] },
      { q: "What is the term for an organism's observable characteristics?", a: "Phenotype", wrong: ["Genotype", "Allele", "Locus"] },
      { q: "Which protein is the main component of hair and nails?", a: "Keratin", wrong: ["Collagen", "Elastin", "Fibrin"] },
      { q: "What is the name of the fluid that surrounds the brain and spinal cord?", a: "Cerebrospinal Fluid", wrong: ["Plasma", "Lymph", "Synovial Fluid"] },
      { q: "Which infectious agent consists only of protein?", a: "Prion", wrong: ["Virus", "Bacterium", "Viroid"] }
    ]
  };

  const getTimerLimit = () => {
    if (difficulty === "easy") return 12;
    if (difficulty === "intermediate") return 8;
    return 5;
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setRound(1);
    setScore(0);
    setGameState("playing");
    const pool = questionsByDifficulty[diff];
    const item = pool[Math.floor(Math.random() * pool.length)];
    setCurrentProblem({ q: item.q, a: item.a, options: shuffleArray([item.a, ...item.wrong]) });
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
    const pool = questionsByDifficulty[difficulty];
    const item = pool[Math.floor(Math.random() * pool.length)];
    setCurrentProblem({ q: item.q, a: item.a, options: shuffleArray([item.a, ...item.wrong]) });
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
      "w-full transition-all duration-500 bg-[#0f1710] flex flex-col relative border-none overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[700px]"
    )}>
      <div className="absolute inset-0 z-0 opacity-10" style={{ 
          backgroundImage: "radial-gradient(circle at center, #22c55e 2px, transparent 2px)", 
          backgroundSize: "40px 40px" 
      }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0f1710_80%)] pointer-events-none z-0" />

      <CardHeader className="z-10 bg-[#0f1710]/90 backdrop-blur-md relative border-b border-green-900/50">
        <div className="flex justify-between items-center text-green-100">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-green-500/50 hover:text-green-400">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <CardTitle className="text-2xl font-black uppercase text-green-400 font-mono tracking-tighter">Bio Hazard</CardTitle>
                <Badge variant="outline" className="border-green-500/30 text-green-500 mt-1">Sample {round}/10</Badge>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] uppercase text-green-800 font-bold tracking-widest">Immunity Score</p>
                 <p className="text-2xl font-black text-green-400 tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-400" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Minimize /> : <Maximize />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col z-10 relative p-6 items-center justify-center">
         <AnimatePresence mode="wait">
            {gameState === "idle" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} className="text-center w-full max-w-md">
                    <ShieldAlert className="w-32 h-32 text-green-500 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(34,197,94,0.4)]" />
                    <h2 className="text-5xl font-black text-white uppercase mb-4 font-mono">Microscopic Threat</h2>
                    <p className="text-green-200/60 mb-10 mx-auto lowercase">Select containment protocol level to begin scan.</p>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => startGame("easy")} className="h-16 px-12 text-xl font-bold bg-[#142215] border-2 border-green-500/30 hover:border-green-500 text-green-400 rounded-full font-mono uppercase tracking-widest transition-all">Level 1 Protocol (Easy)</Button>
                        <Button onClick={() => startGame("intermediate")} className="h-16 px-12 text-xl font-bold bg-[#142215] border-2 border-yellow-500/30 hover:border-yellow-500 text-yellow-400 rounded-full font-mono uppercase tracking-widest transition-all">Level 2 Protocol (Intermediate)</Button>
                        <Button onClick={() => startGame("pro")} className="h-16 px-12 text-xl font-bold bg-[#142215] border-2 border-red-500/30 hover:border-red-500 text-red-400 rounded-full font-mono uppercase tracking-widest transition-all">Pro Protocol (Extreme)</Button>
                        <Button variant="ghost" asChild className="mt-4 text-green-700 hover:text-green-500 uppercase tracking-widest font-mono">
                           <Link href="/games">Back to Sector Entrance</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "playing" && currentProblem && (
                <div className="w-full max-w-2xl text-center flex flex-col items-center">
                    <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-12 bg-[#142215]/80 p-8 rounded-3xl border border-green-500/30 w-full shadow-2xl">
                        <p className="text-green-600 font-black uppercase tracking-widest text-xs mb-4">Sample Query</p>
                        <h1 className="text-3xl md:text-4xl font-bold text-green-100 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)] leading-tight">{currentProblem.q}</h1>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {currentProblem.options.map((opt, i) => (
                            <motion.div key={opt} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: i*0.1}}>
                                <Button onClick={() => handleChoice(opt)} className="group w-full h-auto min-h-[70px] py-4 px-6 text-xl font-bold bg-[#142215]/80 hover:bg-green-800 text-green-50 border border-green-800 hover:border-green-400 transition-all rounded-[30px] flex items-center justify-center gap-4 relative overflow-hidden">
                                    <Crosshair className="w-5 h-5 text-green-600 group-hover:text-green-300 relative z-10 hidden sm:block" />
                                    <span className="relative z-10">{opt}</span>
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 w-full max-w-md">
                        <div className="flex justify-between text-[10px] font-black uppercase text-green-600 mb-2">
                           <span>Mutation Countdown</span>
                           <span>{timeLeft.toFixed(1)}s</span>
                        </div>
                        <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-1 bg-[#142215] rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,1)]" />
                        </Progress>
                    </div>
                </div>
            )}

            {gameState === "showing_result" && (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}} className="bg-[#0f1710]/95 p-16 rounded-[50px] text-center border border-green-900/50 shadow-[0_0_50px_rgba(34,197,94,0.2)] w-full max-w-2xl">
                    {resultStatus === "correct" && (
                        <>
                           <Activity className="w-24 h-24 text-green-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                           <h2 className="text-4xl font-black text-green-400 uppercase tracking-widest font-mono">Neutralized!</h2>
                           <p className="text-3xl text-green-100 mt-6 tabular-nums">+{score} IMMUNITY</p>
                        </>
                    )}
                    {resultStatus === "incorrect" && (
                        <>
                           <ShieldAlert className="w-24 h-24 text-red-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                           <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest font-mono">Infection Spread</h2>
                           <p className="text-xl text-green-100/50 mt-4">Correct Answer: <span className="text-green-400 font-bold bg-black/40 px-4 py-2 rounded-xl">{currentProblem?.a}</span></p>
                        </>
                    )}
                    {resultStatus === "timeout" && (
                        <>
                           <ShieldAlert className="w-24 h-24 text-orange-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
                           <h2 className="text-4xl font-black text-orange-500 uppercase tracking-widest font-mono">Mutated!</h2>
                           <p className="text-xl text-green-100/50 mt-4">Correct Answer: <span className="text-green-400 font-bold bg-black/40 px-4 py-2 rounded-xl">{currentProblem?.a}</span></p>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-4 mt-10">
                        <Button onClick={nextRound} className="h-16 px-12 text-2xl font-black bg-green-700 text-white hover:bg-green-600 rounded-full shadow-2xl transition-all hover:scale-105 font-mono uppercase tracking-widest">
                            {round >= 10 ? "Purify Sector" : "Next Sample"}
                        </Button>
                        <Button variant="ghost" onClick={() => setGameState("idle")} className="text-green-700 hover:text-green-500 uppercase tracking-widest font-mono">
                            Reconfigure Protocol
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "finished" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center max-w-xl mx-auto">
                    <h2 className="text-5xl font-black text-green-400 uppercase font-mono tracking-widest mb-8">Scan Complete</h2>
                    <div className="bg-[#142215] border border-green-900/50 rounded-3xl p-12 mb-12 shadow-2xl relative overflow-hidden">
                       <motion.div animate={{ opacity: [0.05, 0.1, 0.05] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute inset-0 bg-green-500 pointer-events-none" />
                       <p className="text-sm font-black uppercase tracking-widest text-green-600 mb-4">Total Immunity Score</p>
                       <p className="text-7xl font-black text-white tabular-nums">{score}</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-16 px-10 text-lg font-bold bg-green-700 hover:bg-green-600 text-white font-mono uppercase tracking-widest rounded-full transition-all hover:scale-105"><Activity className="mr-2 h-5 w-5"/> Rescan</Button>
                        <Button variant="outline" asChild className="h-16 px-10 text-lg font-bold border-green-900/50 text-green-400 hover:bg-[#142215] rounded-full font-mono uppercase tracking-widest"><Link href="/games">Close Results</Link></Button>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </CardContent>
    </Card>
  );
}
