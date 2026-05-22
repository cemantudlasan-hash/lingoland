"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Search, Glasses, CheckCircle2, Fingerprint, FolderSearch, FileSearch, HelpCircle, RefreshCw } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Difficulty = "easy" | "intermediate" | "pro";

export function DataDetective({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<{type: string, data: number[], a: string, options: string[]} | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(20);
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
    const types = ["Mean", "Median", "Mode", "Range"];
    const t = types[Math.floor(Math.random() * types.length)];
    let data: number[] = [];
    let answer = 0;
    
    let count = 5;
    let rangeTop = 10;
    if (diff === "intermediate") { count = 7; rangeTop = 30; }
    if (diff === "pro") { count = 9; rangeTop = 100; }

    for(let i=0; i<count; i++) {
        data.push(Math.floor(Math.random() * rangeTop) + 1);
    }

    if (t === "Mean") {
        if (diff === "easy") data = [2, 4, 6, 8, 10]; // Nice integers
        const sum = data.reduce((a, b) => a + b, 0);
        answer = Math.round(sum / data.length);
    } else if (t === "Median") {
        const sorted = [...data].sort((a,b) => a-b);
        if (sorted.length % 2 === 0) {
            answer = Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);
        } else {
            answer = sorted[Math.floor(sorted.length / 2)];
        }
    } else if (t === "Mode") {
        if (diff === "easy") {
            data = [data[0], data[0], ...data.slice(2)];
        }
        const counts: Record<number, number> = {};
        data.forEach(x => counts[x] = (counts[x] || 0) + 1);
        let maxCount = 0;
        let mode = data[0];
        for(const val in counts) {
            if (counts[val] > maxCount) {
                maxCount = counts[val];
                mode = Number(val);
            }
        }
        answer = mode;
    } else if (t === "Range") {
        const min = Math.min(...data);
        const max = Math.max(...data);
        answer = max - min;
    }

    const wrongPool = new Set<number>();
    while(wrongPool.size < 3) {
        const w = answer + (Math.floor(Math.random() * 10) - 5);
        if (w !== answer && w > 0) wrongPool.add(w);
    }

    return { 
        type: t, 
        data, 
        a: String(answer), 
        options: shuffleArray([String(answer), ...Array.from(wrongPool).map(String)]) 
    };
  };

  const getTimerLimit = () => {
    if (difficulty === "easy") return 25;
    if (difficulty === "intermediate") return 20;
    return 15;
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
        setScore(prev => prev + Math.floor((100 + Math.floor(timeLeft * 5)) * diffMultiplier));
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
      "w-full transition-all duration-500 bg-[#e4dfd5] text-[#2c2a27] flex flex-col relative border-8 border-[#3c3831] overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[700px]"
    )}>
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(60,56,49,0.3)_100%)] pointer-events-none z-0" />

      <CardHeader className="z-10 bg-[#cfc5b4]/80 backdrop-blur-sm relative border-b-2 border-[#8b8273]">
        <div className="flex justify-between items-center text-[#2c2a27]">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-[#5c5448] hover:text-[#2c2a27]">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <Search className="h-8 w-8 text-[#5c5448]" />
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-[0.2em] font-serif">Data Detective</CardTitle>
                <Badge variant="outline" className="border-[#8b8273] text-[#5c5448] mt-1 uppercase font-bold tracking-widest bg-white/20">Case File {round}/10</Badge>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] uppercase text-[#5c5448] font-bold tracking-[0.2em]">Evidence</p>
                 <p className="text-2xl font-black font-serif tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-[#5c5448]" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Glasses /> : <Search />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col z-10 relative p-6 items-center justify-center">
         <AnimatePresence mode="wait">
            {gameState === "idle" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, y:20}} className="text-center w-full max-w-md">
                    <Fingerprint className="w-32 h-32 text-[#5c5448] mx-auto mb-8 drop-shadow-md opacity-80" />
                    <h2 className="text-5xl font-black uppercase mb-4 font-serif tracking-widest text-[#2c2a27]">Solve The Case</h2>
                    <p className="text-[#5c5448] mb-10 mx-auto lowercase font-serif">Select case difficulty level to begin analysis.</p>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => startGame("easy")} className="h-16 px-12 text-xl font-bold bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] border-2 border-transparent hover:border-green-700 font-serif uppercase tracking-[0.2em] transition-all">Street Crime (Easy)</Button>
                        <Button onClick={() => startGame("intermediate")} className="h-16 px-12 text-xl font-bold bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] border-2 border-transparent hover:border-yellow-700 font-serif uppercase tracking-[0.2em] transition-all">White Collar (Intermediate)</Button>
                        <Button onClick={() => startGame("pro")} className="h-16 px-12 text-xl font-bold bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] border-2 border-transparent hover:border-red-700 font-serif uppercase tracking-[0.2em] transition-all">Cyber Espionage (Pro)</Button>
                        <Button variant="ghost" asChild className="mt-4 text-[#5c5448] hover:text-[#2c2a27] uppercase tracking-widest font-serif transition-colors">
                           <Link href="/games">Back to Agency</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "playing" && currentProblem && (
                <div className="w-full max-w-2xl text-center flex flex-col items-center">
                    <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="mb-12 bg-white/50 p-8 rounded border border-[#8b8273] shadow-md transform -rotate-1 relative w-full">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-red-800/30 -rotate-3" />
                        <p className="text-[#8b8273] font-bold uppercase tracking-[0.2em] text-sm mb-4 font-serif text-center">Find the <span className="text-[#2c2a27] font-black underline">{currentProblem.type}</span> of this set:</p>
                        <div className="flex flex-wrap justify-center gap-4 bg-[#e4dfd5] p-6 border-2 border-dashed border-[#8b8273]">
                            {currentProblem.data.map((n, i) => (
                                <span key={i} className="text-3xl font-black text-[#2c2a27] font-mono tracking-tighter">{n}</span>
                            ))}
                        </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-2 gap-6 w-full">
                        {currentProblem.options.map((opt, i) => (
                            <motion.div key={opt} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{delay: i*0.1}}>
                                <Button onClick={() => handleChoice(opt)} className="w-full h-20 text-3xl font-black font-mono bg-white hover:bg-[#cfc5b4] text-[#2c2a27] border-2 border-[#8b8273] transition-all rounded shadow-[4px_4px_0_0_#8b8273] hover:translate-y-1 hover:shadow-[0px_0px_0_0_#8b8273]">
                                    {opt}
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 w-full max-w-sm">
                        <div className="flex justify-between text-xs font-black uppercase text-[#8b8273] mb-2 font-serif tracking-widest">
                           <span>Investigation Time</span>
                           <span>{timeLeft.toFixed(1)}s</span>
                        </div>
                        <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-2 bg-[#cfc5b4] rounded-none border border-[#8b8273]">
                           <div className="h-full bg-[#2c2a27] transition-all duration-100 ease-linear" />
                        </Progress>
                    </div>
                </div>
            )}

            {gameState === "showing_result" && (
                <motion.div initial={{scale:0.8, opacity:0, rotate: -5}} animate={{scale:1, opacity:1, rotate: 2}} exit={{scale:0.8, opacity:0}} className="bg-white p-12 rounded border-4 border-[#2c2a27] text-center shadow-2xl relative max-w-md w-full">
                    {resultStatus === "correct" && (
                        <>
                           <CheckCircle2 className="w-24 h-24 text-green-700 mx-auto mb-6" />
                           <h2 className="text-4xl font-black text-green-800 uppercase tracking-widest font-serif border-y-4 border-double border-green-800 py-4">Evidence Accepted</h2>
                           <p className="text-2xl text-green-700 mt-6 font-mono tabular-nums">+{score} CLUES</p>
                        </>
                    )}
                    {resultStatus === "incorrect" && (
                        <>
                           <HelpCircle className="w-24 h-24 text-red-800 mx-auto mb-6" />
                           <h2 className="text-4xl font-black text-red-800 uppercase tracking-widest font-serif border-y-4 border-double border-red-800 py-4">False Lead</h2>
                           <p className="text-xl text-[#5c5448] mt-6 font-serif">True value: <span className="text-[#2c2a27] font-black ml-2 font-mono text-2xl bg-[#e4dfd5] px-4 py-1">{currentProblem?.a}</span></p>
                        </>
                    )}
                    {resultStatus === "timeout" && (
                        <>
                           <FileSearch className="w-24 h-24 text-[#8b8273] mx-auto mb-6" />
                           <h2 className="text-4xl font-black text-[#5c5448] uppercase tracking-widest font-serif border-y-4 border-double border-[#8b8273] py-4">Trail Cold</h2>
                           <p className="text-xl text-[#5c5448] mt-6 font-serif">True value: <span className="text-[#2c2a27] font-black ml-2 font-mono text-2xl bg-[#e4dfd5] px-4 py-1">{currentProblem?.a}</span></p>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-4 mt-10 relative z-20">
                        <Button onClick={nextRound} className="h-16 px-12 text-2xl font-black bg-[#2c2a27] text-[#e4dfd5] hover:bg-[#4a4740] rounded shadow-2xl transition-all hover:scale-105 font-serif uppercase tracking-widest border-2 border-[#8b8273]">
                            {round >= 10 ? "Close Case" : "Next Evidence"}
                        </Button>
                        <Button variant="ghost" onClick={() => setGameState("idle")} className="text-[#8b8273] hover:text-[#5c5448] uppercase tracking-widest font-serif font-bold">
                            Reset Intelligence
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "finished" && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center w-full max-w-xl mx-auto bg-white p-12 border-2 border-[#2c2a27] shadow-[8px_8px_0_0_#2c2a27] transform -rotate-1 relative">
                    <h2 className="text-5xl font-black text-[#2c2a27] uppercase font-serif tracking-[0.2em] mb-2 border-b-4 border-double border-[#2c2a27] pb-4">Case Closed</h2>
                    <div className="bg-[#e4dfd5] border border-[#8b8273] p-8 my-8 relative">
                       <p className="text-sm font-bold uppercase tracking-widest text-[#5c5448] mb-4 font-serif">Investigation Summary Score</p>
                       <p className="text-7xl font-black text-[#2c2a27] font-mono tabular-nums">{score}</p>
                       <div className="absolute bottom-4 right-4 text-red-800/80 font-serif text-3xl transform -rotate-12 border-4 border-red-800/80 p-2 rounded tracking-widest uppercase">Verified</div>
                    </div>
                    <div className="flex gap-6 justify-center mt-10">
                        <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-16 px-8 text-lg font-bold bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] font-serif uppercase tracking-widest rounded-none transition-all hover:scale-105"><RefreshCw className="mr-2 h-5 w-5"/> Reopen File</Button>
                        <Button variant="outline" asChild className="h-16 px-8 text-lg font-bold border-2 border-[#8b8273] text-[#2c2a27] hover:bg-[#cfc5b4] font-serif uppercase tracking-widest rounded-none"><Link href="/games">File Away</Link></Button>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </CardContent>
    </Card>
  );
}
