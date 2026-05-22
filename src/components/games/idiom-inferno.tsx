"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Flame, Droplets, Bone, Repeat, Maximize, Minimize } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

type Difficulty = "easy" | "intermediate" | "pro";

interface IdiomProblem {
  idiom: string;
  meaning: string;
  wrong: string[];
}

export function IdiomInferno({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentIdiom, setCurrentIdiom] = React.useState<{idiom: string, meaning: string, options: string[]} | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [lavaLevel, setLavaLevel] = React.useState(0); // 0 to 100
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [resultStatus, setResultStatus] = React.useState<"correct" | "incorrect" | "burned">("correct");
  
  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const idiomsByDifficulty: Record<Difficulty, IdiomProblem[]> = {
    easy: [
      { idiom: "Piece of cake", meaning: "Very easy", wrong: ["A dessert", "A small slice", "Something sweet"] },
      { idiom: "Break a leg", meaning: "Good luck", wrong: ["Get injured", "Fall down", "Dance well"] },
      { idiom: "Hit the sack", meaning: "Go to sleep", wrong: ["Punch a bag", "Pack a bag", "Win a game"] },
      { idiom: "Under the weather", meaning: "Feeling ill", wrong: ["Standing in rain", "Checking the forecast", "Feeling very hot"] },
      { idiom: "Spill the beans", meaning: "Reveal a secret", wrong: ["Drop your food", "Make a mess", "Cook dinner"] },
      { idiom: "Costs an arm and a leg", meaning: "Very expensive", wrong: ["A bodily injury", "Hospital bill", "Buying prosthetics"] },
      { idiom: "Call it a day", meaning: "Stop working", wrong: ["Look at calendar", "Name a holiday", "Go outside"] },
      { idiom: "Miss the boat", meaning: "Miss an opportunity", wrong: ["Drop your ticket", "Fail to swim", "Wait at the dock"] },
      { idiom: "See eye to eye", meaning: "Agree with someone", wrong: ["Stare closely", "Stand together", "Check vision"] },
      { idiom: "Once in a blue moon", meaning: "Very rarely", wrong: ["During the night", "Every month", "A lunar event"] }
    ],
    intermediate: [
      { idiom: "Bite the bullet", meaning: "Endure a painful situation", wrong: ["Eat something hard", "Shoot an animal", "Run very fast"] },
      { idiom: "Cut corners", meaning: "Do something poorly to save time", wrong: ["Use scissors", "Drive dangerously", "Build a square"] },
      { idiom: "On the fence", meaning: "Undecided", wrong: ["Sitting outside", "Building a wall", "Trapped"] },
      { idiom: "Steal my thunder", meaning: "Take attention away from someone", wrong: ["Steal electricity", "Be loud", "Predict a storm"] },
      { idiom: "Through thick and thin", meaning: "Under all circumstances", wrong: ["Cutting wood", "Dieting", "Squeezing through spaces"] },
      { idiom: "Best of both worlds", meaning: "Ideal situation", wrong: ["Two planets", "Traveling far", "Being greedy"] },
      { idiom: "Jumping on the bandwagon", meaning: "Joining a popular trend", wrong: ["Playing instruments", "Riding a wagon", "Starting a band"] },
      { idiom: "Pulling my leg", meaning: "Joking with someone", wrong: ["Stretching", "Tripping someone", "Hurting me"] },
      { idiom: "Wrap my head around it", meaning: "Understand something complex", wrong: ["Wear a hat", "Spin around", "Get a headache"] },
      { idiom: "Hit the nail on the head", meaning: "Exactly right", wrong: ["Use a hammer", "Hurt your finger", "Build a house"] }
    ],
    pro: [
      { idiom: "Kick the bucket", meaning: "To die", wrong: ["Play soccer", "Spill water", "Stub a toe"] },
      { idiom: "Barking up the wrong tree", meaning: "Pursuing a false lead", wrong: ["Lost in woods", "Being an animal", "Cutting wood"] },
      { idiom: "Bite off more than you can chew", meaning: "Take on too much responsibility", wrong: ["Eat too fast", "Choking hazard", "Order much food"] },
      { idiom: "By the skin of your teeth", meaning: "Just barely", wrong: ["Dental hygiene", "Eating tough food", "Smiling wide"] },
      { idiom: "Every cloud has a silver lining", meaning: "Good in every bad situation", wrong: ["Rain is coming", "Looking at sky", "Finding money"] },
      { idiom: "Go back to the drawing board", meaning: "Start over completely", wrong: ["Buy art supplies", "Erase a picture", "Become a student"] },
      { idiom: "Hear it on the grapevine", meaning: "Hear rumors", wrong: ["Drink wine", "Visit a farm", "Listen to radio"] },
      { idiom: "It takes two to tango", meaning: "Actions need two people to happen", wrong: ["Dancing lessons", "Going to a club", "Learning Spanish"] },
      { idiom: "Kill two birds with one stone", meaning: "Achieve two things at once", wrong: ["Hunting animals", "Throwing rocks", "Being cruel"] },
      { idiom: "Method to my madness", meaning: "A specific purpose in strange actions", wrong: ["Being crazy", "Losing your mind", "Acting angrily"] }
    ]
  };

  const getLavaSpeed = () => {
     if (difficulty === "easy") return 0.5;
     if (difficulty === "intermediate") return 1;
     return 1.8;
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setRound(1);
    const pool = idiomsByDifficulty[diff];
    const item = pool[Math.floor(Math.random() * pool.length)];
    setCurrentIdiom({ idiom: item.idiom, meaning: item.meaning, options: shuffleArray([item.meaning, ...item.wrong]) });
    setLavaLevel(0);
    setGameState("playing");
  };

  const nextRound = () => {
    if (round >= 10) {
      setGameState("finished");
      if (firestore && game) {
        logAnalyticsEvent(firestore, user?.uid || 'guest', { type: 'game_played', details: { slug: game.slug, score, difficulty } });
      }
      return;
    }
    const pool = idiomsByDifficulty[difficulty];
    const item = pool[Math.floor(Math.random() * pool.length)];
    setCurrentIdiom({ idiom: item.idiom, meaning: item.meaning, options: shuffleArray([item.meaning, ...item.wrong]) });
    setRound(r => r + 1);
    setLavaLevel(0);
    setGameState("playing");
  };

  const handleChoice = (ans: string | null) => {
    if (gameState !== "playing" || !currentIdiom) return;
    if (ans === currentIdiom.meaning) {
        setResultStatus("correct");
        const diffMultiplier = difficulty === "easy" ? 1 : difficulty === "intermediate" ? 1.5 : 2;
        setScore(prev => prev + Math.floor((100 - Math.floor(lavaLevel)) * diffMultiplier));
    } else if (ans === null) {
        setResultStatus("burned");
    } else {
        setResultStatus("incorrect");
    }
    setGameState("showing_result");
  };

  React.useEffect(() => {
    if (gameState === "playing") {
        const timer = setInterval(() => {
            setLavaLevel(prev => {
                const next = prev + getLavaSpeed();
                if (next >= 100) { clearInterval(timer); handleChoice(null); return 100; }
                return next; 
            });
        }, 100);
        return () => clearInterval(timer);
    }
  }, [gameState, difficulty]);

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 bg-neutral-950 flex flex-col relative border-none overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[700px]"
    )}>
      <motion.div 
         animate={{ y: `${100 - (gameState === 'playing' ? lavaLevel : 0)}%` }}
         transition={{ ease: "linear", duration: 0.1 }}
         className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 opacity-40 z-0 pointer-events-none"
         style={{ filter: "url(#displacement-filter)" }}
      >
          <div className="absolute top-0 inset-x-0 h-10 bg-white/20 backdrop-blur-md border-t-4 border-yellow-200" />
      </motion.div>

      <CardHeader className="z-10 bg-black/80 backdrop-blur-md relative border-b border-red-900/30">
        <div className="flex justify-between items-center text-orange-100">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-red-500/50 hover:text-red-400">
                 <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <CardTitle className="text-2xl font-black uppercase text-orange-400 font-mono tracking-tighter">Idiom Inferno</CardTitle>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-red-500/30 text-red-400 mt-1">Level {round}/10</Badge>
                </div>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] uppercase text-orange-700 font-bold">Safe Points</p>
                 <p className="text-2xl font-black text-orange-400 tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-red-500" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Minimize /> : <Maximize />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col z-10 relative p-6">
         <AnimatePresence mode="wait">
            {gameState === "idle" && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="m-auto text-center w-full max-w-md">
                    <Flame className="w-32 h-32 text-orange-500 mx-auto animate-pulse drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]" />
                    <h2 className="text-5xl font-black text-white uppercase mt-4 mb-2 font-mono">Escape the Heat</h2>
                    <p className="text-orange-200/60 mb-8 mx-auto">Select your survival difficulty.</p>
                    
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => startGame("easy")} className="h-16 px-12 text-xl font-black bg-neutral-900 border-2 border-orange-500/30 hover:border-orange-500 text-orange-400 shadow-xl shadow-red-900/10 rounded-xl font-mono uppercase tracking-widest inline-flex gap-2 relative overflow-hidden group">
                           Easy (Slow) <Flame className="absolute right-4 text-orange-500/20 group-hover:text-orange-500/50 w-8 h-8" />
                        </Button>
                        <Button onClick={() => startGame("intermediate")} className="h-16 px-12 text-xl font-black bg-neutral-900 border-2 border-red-500/30 hover:border-red-500 text-red-400 shadow-xl shadow-red-900/10 rounded-xl font-mono uppercase tracking-widest inline-flex gap-2 relative overflow-hidden group">
                           Intermediate <Flame className="absolute right-4 text-red-500/20 group-hover:text-red-500/50 w-8 h-8" />
                        </Button>
                        <Button onClick={() => startGame("pro")} className="h-16 px-12 text-xl font-black bg-neutral-900 border-2 border-fuchsia-500/30 hover:border-fuchsia-500 text-fuchsia-400 shadow-xl shadow-red-900/10 rounded-xl font-mono uppercase tracking-widest inline-flex gap-2 relative overflow-hidden group">
                           Pro (Fast) <Flame className="absolute right-4 text-fuchsia-500/20 group-hover:text-fuchsia-500/50 w-8 h-8" />
                        </Button>
                        <Button variant="ghost" asChild className="mt-4 text-orange-700 hover:text-orange-500 uppercase tracking-widest font-mono">
                           <Link href="/games">Back to Games</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "playing" && currentIdiom && (
                <div className="m-auto w-full max-w-2xl text-center">
                    <div className="bg-neutral-900/80 border-2 border-red-900/50 p-8 rounded-3xl mb-12 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                        <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-red-500 mix-blend-overlay pointer-events-none" />
                        <p className="text-red-500 font-black uppercase tracking-widest text-sm mb-4">What does this mean?</p>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase">&ldquo;{currentIdiom.idiom}&rdquo;</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentIdiom.options.map(opt => (
                            <Button key={opt} onClick={() => handleChoice(opt)} className="text-xl font-bold bg-neutral-900/80 hover:bg-orange-600 text-orange-100 border border-orange-900/50 hover:border-orange-300 transition-all rounded-2xl whitespace-normal min-h-[80px] h-auto py-6 px-4">
                                {opt}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === "showing_result" && (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:1.2, opacity:0}} className="m-auto text-center bg-black/80 p-12 rounded-3xl backdrop-blur-md border border-neutral-800 w-full max-w-2xl">
                    {resultStatus === "correct" && (
                        <>
                           <Droplets className="w-32 h-32 text-blue-400 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(96,165,250,0.5)]" />
                           <h2 className="text-6xl font-black text-blue-400 uppercase tracking-widest font-mono">Cooled Down!</h2>
                           <p className="text-2xl text-stone-300 mt-6 font-medium">Meaning: <span className="text-orange-400 font-black bg-neutral-900 px-4 py-2 rounded-xl">{currentIdiom?.meaning}</span></p>
                        </>
                    )}
                    {resultStatus === "incorrect" && (
                        <>
                           <Flame className="w-32 h-32 text-red-500 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
                           <h2 className="text-6xl font-black text-red-500 uppercase tracking-widest font-mono">Burned!</h2>
                           <p className="text-2xl text-stone-300 mt-6 font-medium">Meaning: <span className="text-orange-400 font-black bg-neutral-900 px-4 py-2 rounded-xl">{currentIdiom?.meaning}</span></p>
                        </>
                    )}
                    {resultStatus === "burned" && (
                        <>
                           <Bone className="w-32 h-32 text-stone-400 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(168,162,158,0.5)]" />
                           <h2 className="text-6xl font-black text-stone-400 uppercase tracking-widest font-mono">Consumed!</h2>
                           <p className="text-2xl text-stone-300 mt-6 font-medium">Meaning: <span className="text-orange-400 font-black bg-neutral-900 px-4 py-2 rounded-xl">{currentIdiom?.meaning}</span></p>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-4 mt-10">
                        <Button onClick={nextRound} className="h-16 px-12 text-2xl font-black bg-orange-600 text-white hover:bg-orange-500 rounded-xl shadow-2xl transition-all hover:scale-105 font-mono uppercase tracking-widest">
                            {round >= 10 ? "Extinguish" : "Next Idiom"}
                        </Button>
                        <Button variant="ghost" onClick={() => setGameState("idle")} className="text-orange-700 hover:text-orange-500 uppercase tracking-widest">
                            Reset Heat
                        </Button>
                    </div>
                </motion.div>
            )}

            {gameState === "finished" && (
                <div className="m-auto text-center">
                    <h2 className="text-7xl font-black text-white uppercase font-mono mb-8 text-shadow-lg">Out of the Fire</h2>
                    <p className="text-3xl text-orange-400 font-bold mb-12 bg-neutral-900 border border-orange-900/50 p-8 rounded-2xl inline-block shadow-2xl">Total Score: <span className="text-white text-5xl ml-4">{score}</span></p>
                    <div className="flex gap-4 justify-center">
                       <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-16 px-12 text-xl font-bold bg-white text-black hover:bg-neutral-200 font-mono uppercase tracking-widest rounded-xl"><Repeat className="mr-2"/> Play Again</Button>
                       <Button variant="outline" asChild className="h-16 px-12 text-xl font-bold border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white rounded-xl font-mono uppercase tracking-widest"><Link href="/games">Esc</Link></Button>
                    </div>
                </div>
            )}
         </AnimatePresence>
      </CardContent>
    </Card>
  );
}
