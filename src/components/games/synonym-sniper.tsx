"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Crosshair, Target, Zap, Repeat, Maximize, Minimize } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

interface Problem {
  word: string;
  synonym: string;
  wrong: string[];
}

type Difficulty = "easy" | "intermediate" | "pro";

export function SynonymSniper({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<{ baseWord: string; synonym: string; options: string[] } | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(7);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [resultData, setResultData] = React.useState<{ status: "hit" | "miss" | "timeout", points?: number, trueAnswer?: string }>({ status: "hit" });
  const [sessionProblems, setSessionProblems] = React.useState<Problem[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const problemsByDifficulty: Record<Difficulty, Problem[]> = {
    easy: [
      { word: "Happy", synonym: "Joyful", wrong: ["Sad", "Angry", "Bored"] },
      { word: "Big", synonym: "Large", wrong: ["Small", "Tiny", "Little"] },
      { word: "Fast", synonym: "Quick", wrong: ["Slow", "Lazy", "Still"] },
      { word: "Sad", synonym: "Unhappy", wrong: ["Glad", "Cheerful", "Excited"] },
      { word: "Cold", synonym: "Chilly", wrong: ["Hot", "Warm", "Boiling"] },
      { word: "Smart", synonym: "Clever", wrong: ["Dull", "Foolish", "Slow"] },
      { word: "Good", synonym: "Fine", wrong: ["Bad", "Evil", "Awful"] },
      { word: "Small", synonym: "Tiny", wrong: ["Huge", "Giant", "Massive"] },
      { word: "Loud", synonym: "Noisy", wrong: ["Quiet", "Silent", "Calm"] },
      { word: "Hard", synonym: "Difficult", wrong: ["Easy", "Simple", "Soft"] },
      { word: "Easy", synonym: "Simple", wrong: ["Hard", "Tough", "Complex"] },
      { word: "Rich", synonym: "Wealthy", wrong: ["Poor", "Broke", "Needy"] },
      { word: "Bright", synonym: "Radiant", wrong: ["Dim", "Dark", "Gloomy"] },
      { word: "Dark", synonym: "Shadowy", wrong: ["Light", "Bright", "Shiny"] },
      { word: "Quiet", synonym: "Silent", wrong: ["Loud", "Noisy", "Rowdy"] },
      { word: "Angry", synonym: "Furious", wrong: ["Calm", "Pleased", "Peaceful"] },
      { word: "Brave", synonym: "Courageous", wrong: ["Cowardly", "Fearful", "Afraid"] },
      { word: "Clean", synonym: "Neat", wrong: ["Dirty", "Messy", "Filthy"] },
      { word: "Dirty", synonym: "Soiled", wrong: ["Pure", "Spotless", "Fresh"] },
      { word: "Near", synonym: "Close", wrong: ["Far", "Distant", "Remote"] },
      { word: "Far", synonym: "Distant", wrong: ["Close", "Nearby", "Local"] },
      { word: "Strong", synonym: "Powerful", wrong: ["Weak", "Frail", "Feeble"] },
      { word: "Weak", synonym: "Feeble", wrong: ["Strong", "Mighty", "Robust"] },
      { word: "Sweet", synonym: "Sugary", wrong: ["Sour", "Bitter", "Salty"] },
      { word: "Sour", synonym: "Tart", wrong: ["Sweet", "Mild", "Bland"] },
      { word: "Begin", synonym: "Start", wrong: ["End", "Finish", "Stop"] },
      { word: "Finish", synonym: "Complete", wrong: ["Start", "Begin", "Open"] },
      { word: "Choose", synonym: "Select", wrong: ["Refuse", "Reject", "Keep"] },
      { word: "Keep", synonym: "Hold", wrong: ["Lose", "Drop", "Discard"] },
      { word: "Cry", synonym: "Weep", wrong: ["Laugh", "Smile", "Cheer"] },
      { word: "Laugh", synonym: "Giggle", wrong: ["Cry", "Sob", "Frown"] },
      { word: "Pretty", synonym: "Beautiful", wrong: ["Ugly", "Plain", "Hideous"] },
      { word: "Ugly", synonym: "Hideous", wrong: ["Lovely", "Pretty", "Cute"] },
      { word: "Old", synonym: "Ancient", wrong: ["New", "Young", "Modern"] },
      { word: "New", synonym: "Modern", wrong: ["Old", "Ancient", "Antique"] },
      { word: "Safe", synonym: "Secure", wrong: ["Risky", "Unsafe", "Dangerous"] },
      { word: "Dangerous", synonym: "Risky", wrong: ["Safe", "Harmless", "Protected"] },
      { word: "Fat", synonym: "Plump", wrong: ["Thin", "Slim", "Skinny"] },
      { word: "Thin", synonym: "Slender", wrong: ["Fat", "Thick", "Heavy"] },
      { word: "Tall", synonym: "Lofty", wrong: ["Short", "Low", "Tiny"] }
    ],
    intermediate: [
      { word: "Abundant", synonym: "Plentiful", wrong: ["Scarce", "Small", "Empty"] },
      { word: "Accurate", synonym: "Correct", wrong: ["Wrong", "Silly", "Messy"] },
      { word: "Brave", synonym: "Courageous", wrong: ["Timid", "Weak", "Sad"] },
      { word: "Candid", synonym: "Honest", wrong: ["Sneaky", "Loud", "Fast"] },
      { word: "Distant", synonym: "Remote", wrong: ["Close", "Warm", "Near"] },
      { word: "Evident", synonym: "Clear", wrong: ["Hidden", "Dark", "Murky"] },
      { word: "Fierce", synonym: "Ferocious", wrong: ["Gentle", "Tame", "Quiet"] },
      { word: "Genuine", synonym: "Authentic", wrong: ["Fake", "False", "Copy"] },
      { word: "Harmonious", synonym: "Amiable", wrong: ["Hostile", "Rude", "Angry"] },
      { word: "Intricate", synonym: "Complex", wrong: ["Simple", "Plain", "Basic"] },
      { word: "Obstinate", synonym: "Stubborn", wrong: ["Flexible", "Yielding", "Soft"] },
      { word: "Serene", synonym: "Peaceful", wrong: ["Chaotic", "Loud", "Busy"] },
      { word: "Apparent", synonym: "Obvious", wrong: ["Hidden", "Unclear", "Secret"] },
      { word: "Bizarre", synonym: "Weird", wrong: ["Normal", "Common", "Regular"] },
      { word: "Brief", synonym: "Short", wrong: ["Long", "Extended", "Endless"] },
      { word: "Calm", synonym: "Tranquil", wrong: ["Stormy", "Angry", "Agitated"] },
      { word: "Cautious", synonym: "Careful", wrong: ["Careless", "Rash", "Bold"] },
      { word: "Complex", synonym: "Complicated", wrong: ["Plain", "Simple", "Easy"] },
      { word: "Defiant", synonym: "Rebellious", wrong: ["Obedient", "Submissive", "Mild"] },
      { word: "Diverse", synonym: "Varied", wrong: ["Uniform", "Same", "Identical"] },
      { word: "Eager", synonym: "Enthusiastic", wrong: ["Indifferent", "Bored", "Apathetic"] },
      { word: "Fragile", synonym: "Delicate", wrong: ["Sturdy", "Tough", "Strong"] },
      { word: "Grateful", synonym: "Thankful", wrong: ["Thankless", "Unappreciative", "Rude"] },
      { word: "Hostile", synonym: "Aggressive", wrong: ["Friendly", "Kind", "Warm"] },
      { word: "Idle", synonym: "Inactive", wrong: ["Busy", "Active", "Working"] },
      { word: "Jolly", synonym: "Cheerful", wrong: ["Gloomy", "Sad", "Serious"] },
      { word: "Keen", synonym: "Sharp", wrong: ["Dull", "Blunt", "Slow"] },
      { word: "Loyal", synonym: "Faithful", wrong: ["Disloyal", "Treacherous", "False"] },
      { word: "Mutual", synonym: "Shared", wrong: ["Individual", "Single", "Private"] },
      { word: "Nimble", synonym: "Agile", wrong: ["Clumsy", "Slow", "Stiff"] },
      { word: "Obvious", synonym: "Clear", wrong: ["Vague", "Hidden", "Dark"] },
      { word: "Peculiar", synonym: "Strange", wrong: ["Ordinary", "Normal", "Common"] },
      { word: "Polite", synonym: "Courteous", wrong: ["Rude", "Impolite", "Mean"] },
      { word: "Prompt", synonym: "Punctual", wrong: ["Late", "Tardy", "Delayed"] },
      { word: "Reluctant", synonym: "Unwilling", wrong: ["Eager", "Ready", "Willing"] },
      { word: "Solitary", synonym: "Alone", wrong: ["Social", "Grouped", "Together"] },
      { word: "Tense", synonym: "Strained", wrong: ["Relaxed", "Calm", "Loose"] },
      { word: "Vague", synonym: "Unclear", wrong: ["Specific", "Definite", "Clear"] },
      { word: "Vivid", synonym: "Bright", wrong: ["Dull", "Pale", "Dim"] },
      { word: "Weary", synonym: "Tired", wrong: ["Fresh", "Energetic", "Active"] }
    ],
    pro: [
      { word: "Ephemeral", synonym: "Transitory", wrong: ["Permanent", "Eternal", "Endless"] },
      { word: "Obfuscate", synonym: "Confuse", wrong: ["Clarify", "Explain", "Reveal"] },
      { word: "Cacophony", synonym: "Discord", wrong: ["Harmony", "Melody", "Silence"] },
      { word: "Esoteric", synonym: "Arcane", wrong: ["Common", "Obvious", "Familiar"] },
      { word: "Fastidious", synonym: "Meticulous", wrong: ["Careless", "Sloppy", "Messy"] },
      { word: "Gregarious", synonym: "Sociable", wrong: ["Reclusive", "Introverted", "Shy"] },
      { word: "Ineffable", synonym: "Indescribable", wrong: ["Common", "Mundane", "Definable"] },
      { word: "Languid", synonym: "Sluggish", wrong: ["Energetic", "Vigorous", "Active"] },
      { word: "Mellifluous", synonym: "Harmonious", wrong: ["Harsh", "Grating", "Piercing"] },
      { word: "Nefarious", synonym: "Wicked", wrong: ["Noble", "Virtuous", "Heroic"] },
      { word: "Obsequious", synonym: "Sycophantic", wrong: ["Defiant", "Rebellious", "Proud"] },
      { word: "Pernicious", synonym: "Harmful", wrong: ["Beneficial", "Helpful", "Healing"] },
      { word: "Alacrity", synonym: "Eagerness", wrong: ["Apathy", "Lethargy", "Delay"] },
      { word: "Anachronism", synonym: "Misplacement", wrong: ["Accuracy", "Chronology", "Sync"] },
      { word: "Bellicose", synonym: "Hostile", wrong: ["Peaceful", "Friendly", "Calm"] },
      { word: "Capricious", synonym: "Fickle", wrong: ["Constant", "Stable", "Predictable"] },
      { word: "Chicanery", synonym: "Deception", wrong: ["Honesty", "Truth", "Candor"] },
      { word: "Dearth", synonym: "Scarcity", wrong: ["Abundance", "Surplus", "Plenty"] },
      { word: "Diatribe", synonym: "Tirade", wrong: ["Praise", "Eulogy", "Compliment"] },
      { word: "Equivocate", synonym: "Prevaricate", wrong: ["Confront", "Declare", "Simplify"] },
      { word: "Garrulous", synonym: "Talkative", wrong: ["Silent", "Taciturn", "Quiet"] },
      { word: "Iconoclast", synonym: "Maverick", wrong: ["Conformist", "Follower", "Traditionalist"] },
      { word: "Inimical", synonym: "Hostile", wrong: ["Friendly", "Warm", "Welcoming"] },
      { word: "Loquacious", synonym: "Wordy", wrong: ["Quiet", "Silent", "Mute"] },
      { word: "Lugubrious", synonym: "Mournful", wrong: ["Joyful", "Cheerful", "Lively"] },
      { word: "Magnanimous", synonym: "Generous", wrong: ["Mean", "Petty", "Stingy"] },
      { word: "Mendacious", synonym: "Untruthful", wrong: ["Honest", "Frank", "Sincere"] },
      { word: "Munificent", synonym: "Generous", wrong: ["Parsimonious", "Miserly", "Greedy"] },
      { word: "Ostentatious", synonym: "Showy", wrong: ["Humble", "Modest", "Plain"] },
      { word: "Parsimonious", synonym: "Stingy", wrong: ["Generous", "Lavish", "Giving"] },
      { word: "Querulous", synonym: "Complaining", wrong: ["Content", "Happy", "Easygoing"] },
      { word: "Recondite", synonym: "Abstruse", wrong: ["Simple", "Direct", "Easy"] },
      { word: "Sagacious", synonym: "Wise", wrong: ["Foolish", "Ignorant", "Silly"] },
      { word: "Sinecure", synonym: "Soft-job", wrong: ["Hardship", "Chore", "Labor"] },
      { word: "Specious", synonym: "Plausible-but-false", wrong: ["Valid", "Genuine", "True"] },
      { word: "Taciturn", synonym: "Silent", wrong: ["Talkative", "Garrulous", "Loud"] },
      { word: "Ubiquitous", synonym: "Omnipresent", wrong: ["Rare", "Scarce", "Isolated"] },
      { word: "Vacillate", synonym: "Waver", wrong: ["Decide", "Stand", "Persist"] },
      { word: "Vociferous", synonym: "Clamorous", wrong: ["Quiet", "Silent", "Soft"] },
      { word: "Zenith", synonym: "Pinnacle", wrong: ["Nadir", "Bottom", "Base"] }
    ]
  };

  const getTimerLimit = () => {
     if (difficulty === "easy") return 10;
     if (difficulty === "intermediate") return 7;
     return 4;
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setRound(1);
    setScore(0);
    const pool = problemsByDifficulty[diff];
    const shuffled = shuffleArray([...pool]);
    setSessionProblems(shuffled);
    const item = shuffled[0];
    setCurrentProblem({ baseWord: item.word, synonym: item.synonym, options: shuffleArray([item.synonym, ...item.wrong]) });
    setTimeLeft(diff === "easy" ? 10 : diff === "intermediate" ? 7 : 4);
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
    const item = sessionProblems[round];
    setCurrentProblem({ baseWord: item.word, synonym: item.synonym, options: shuffleArray([item.synonym, ...item.wrong]) });
    setRound(prev => prev + 1);
    setTimeLeft(getTimerLimit());
    setGameState("playing");
  };

  const handleShot = (val: string | null) => {
    if (gameState !== "playing" || !currentProblem) return;
    
    const isHit = val === currentProblem.synonym;
    let points = 0;
    let status: "hit" | "miss" | "timeout" = "miss";

    if (isHit) {
      status = "hit";
      const bonus = Math.floor(timeLeft * 10);
      const diffMultiplier = difficulty === "easy" ? 1 : difficulty === "intermediate" ? 1.5 : 2;
      points = Math.floor((100 + bonus) * diffMultiplier);
      setScore(prev => prev + points);
    } else if (val === null) {
      status = "timeout";
    }

    setResultData({ status, points, trueAnswer: currentProblem.synonym });
    setGameState("showing_result");
  };

  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(p => p - 0.1), 100);
    } else if (gameState === "playing" && timeLeft <= 0) {
      handleShot(null);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft]);

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 bg-slate-950 flex flex-col relative border-none shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[700px]"
    )}>
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#020617_80%)] pointer-events-none" />

      <CardHeader className="z-10 bg-slate-900/80 backdrop-blur-md border-b border-emerald-500/20 relative">
        <div className="flex justify-between items-center text-emerald-100">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" asChild className="text-emerald-500/50 hover:text-emerald-400">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
               </Button>
               <Crosshair className="h-8 w-8 text-emerald-500 animate-pulse" />
               <div>
                 <CardTitle className="text-2xl font-black uppercase tracking-widest text-emerald-400">Synonym Sniper</CardTitle>
                 <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 mt-1">TARGET {round}/10</Badge>
               </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Score</p>
                    <p className="text-2xl font-black text-emerald-400 tabular-nums">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-emerald-500/50 hover:text-emerald-400" onClick={onToggleFullscreen}>
                    {isFullscreen ? <Minimize /> : <Maximize />}
                </Button>
            </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-6 z-10 relative">
        <AnimatePresence mode="wait">
           {gameState === "idle" && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center">
               <Crosshair className="w-32 h-32 text-emerald-500 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]" />
               <h2 className="text-5xl font-black text-white uppercase tracking-widest mb-6">Lock On Target</h2>
               <p className="text-emerald-200/60 max-w-sm mx-auto mb-8">Select target speed and complexity.</p>
               
               <div className="flex flex-col gap-4 max-w-sm mx-auto">
                 <Button onClick={() => startGame("easy")} className="h-16 px-12 text-xl font-black bg-slate-900 border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-900/40 text-emerald-400 transition-all uppercase tracking-widest relative overflow-hidden group">
                     <Target className="absolute -left-4 -bottom-4 w-20 h-20 text-emerald-500/10 group-hover:text-emerald-500/30 transition-all" />
                     Easy (10s lock)
                 </Button>
                 <Button onClick={() => startGame("intermediate")} className="h-16 px-12 text-xl font-black bg-slate-900 border-2 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-900/40 text-yellow-400 transition-all uppercase tracking-widest relative overflow-hidden group">
                     <Target className="absolute -left-4 -bottom-4 w-20 h-20 text-yellow-500/10 group-hover:text-yellow-500/30 transition-all" />
                     Intermediate (7s lock)
                 </Button>
                 <Button onClick={() => startGame("pro")} className="h-16 px-12 text-xl font-black bg-slate-900 border-2 border-red-500/50 hover:border-red-400 hover:bg-red-900/40 text-red-500 transition-all uppercase tracking-widest relative overflow-hidden group">
                     <Target className="absolute -left-4 -bottom-4 w-20 h-20 text-red-500/10 group-hover:text-red-500/30 transition-all" />
                     Pro (4s lock)
                 </Button>
                 <Button variant="ghost" asChild className="mt-4 text-emerald-500/50 hover:text-emerald-400 uppercase tracking-widest transition-all">
                    <Link href="/games">Back to Games</Link>
                 </Button>
               </div>
             </motion.div>
           )}

           {gameState === "playing" && currentProblem && currentProblem.baseWord !== "" && (
             <div className="w-full h-full relative flex items-center justify-center">
                <div className="absolute top-10 flex flex-col items-center">
                   <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-2">Priority Target</p>
                   <h1 className="text-6xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] border-b-2 border-emerald-500/50 pb-4">{currentProblem.baseWord}</h1>
                </div>

                <div className="w-full max-w-4xl grid grid-cols-2 gap-8 mt-20">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div key={opt} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}>
                       <Button onClick={() => handleShot(opt)} className="group relative w-full h-32 bg-slate-900/50 border-2 border-emerald-900/50 hover:border-emerald-400 rounded-none hover:bg-emerald-900/20 text-3xl font-black text-emerald-100 uppercase overflow-hidden transition-all duration-300">
                          <Target className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/10 group-hover:text-emerald-500/30 transition-all duration-300 group-hover:scale-110" />
                          <span className="relative z-10">{opt}</span>
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                       </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="absolute bottom-8 left-12 right-12">
                   <div className="flex justify-between mb-2">
                       <span className="text-emerald-600 text-xs font-black tracking-widest uppercase">Target Lock Timeout</span>
                       <span className="text-emerald-400 font-black tabular-nums">{timeLeft.toFixed(1)}s</span>
                   </div>
                   <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-1 bg-slate-800 rounded-none">
                     <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                   </Progress>
                </div>
             </div>
           )}

           {gameState === "showing_result" && (
             <motion.div initial={{ opacity: 0, scale: 1.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col">
               {resultData.status === "hit" && (
                 <>
                   <Crosshair className="w-40 h-40 text-emerald-400 mb-8 animate-pulse drop-shadow-[0_0_40px_rgba(16,185,129,0.8)]" />
                   <h2 className="text-7xl font-black text-emerald-400 uppercase tracking-widest">Target Hit</h2>
                   <p className="text-3xl text-emerald-100 mt-4">+{resultData.points} SCORE</p>
                 </>
               )}
               {resultData.status !== "hit" && (
                 <>
                   <Zap className="w-40 h-40 text-red-500 mb-8 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]" />
                   <h2 className="text-7xl font-black text-red-500 uppercase tracking-widest">{resultData.status === "miss" ? "Missed" : "Time Out"}</h2>
                   <p className="text-2xl text-slate-300 mt-6 uppercase tracking-widest">Correct Target: <span className="text-emerald-400 font-bold ml-2 text-3xl">{resultData.trueAnswer}</span></p>
                 </>
               )}
               
               <div className="flex flex-col items-center gap-4 mt-12">
                   <Button onClick={nextRound} className="h-16 px-12 text-2xl font-black bg-emerald-600 text-white hover:bg-emerald-500 rounded-none border border-emerald-400 uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                       {round >= 10 ? "End Mission" : "Next Target"}
                   </Button>
                   <Button variant="ghost" onClick={() => setGameState("idle")} className="text-emerald-500/50 hover:text-emerald-400 uppercase tracking-widest transition-all">
                       Abort & Reset
                   </Button>
               </div>
             </motion.div>
           )}

           {gameState === "finished" && (
             <div className="text-center">
               <h2 className="text-6xl font-black text-emerald-400 uppercase mb-4 tracking-widest">Mission Complete</h2>
               <div className="bg-slate-900 border border-emerald-500/20 p-12 mt-8 inline-block shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                   <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-2">Final Score</p>
                   <p className="text-8xl font-black text-white">{score}</p>
               </div>
               <div className="mt-12 flex gap-6 justify-center">
                 <Button onClick={() => { setGameState("idle"); setScore(0); setRound(0); }} className="h-16 px-12 text-xl font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-none border border-emerald-400 uppercase tracking-widest"><Repeat className="mr-2" /> RESTART</Button>
                 <Button variant="outline" asChild className="h-16 px-12 text-xl font-black border-slate-700 text-slate-300 hover:text-white rounded-none uppercase tracking-widest"><Link href="/games">EXIT</Link></Button>
               </div>
             </div>
           )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
