"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Crosshair, Target,
  ArrowLeft,
  XOctagon, Zap, Repeat, Maximize, Minimize, HelpCircle, Info } from "lucide-react";
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
  const [showHowToPlay, setShowHowToPlay] = React.useState(false);
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
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between transition-all duration-500 bg-slate-950 relative border-none shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-y-auto overflow-x-hidden",
      isFullscreen && "fixed inset-0 z-50 rounded-none min-h-screen max-w-none p-2 sm:p-6"
    )}>
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#020617_80%)] pointer-events-none" />

      <CardHeader className="z-10 bg-slate-900/80 backdrop-blur-md border-b border-emerald-500/20 relative p-3 sm:p-6">
        <div className="flex justify-between items-center text-emerald-100 flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
               <Button variant="ghost" size="icon" asChild className="text-emerald-500/50 hover:text-emerald-400 h-8 w-8 sm:h-10 sm:w-10">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
               </Button>
               <Crosshair className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 animate-pulse" />
               <div>
                 <CardTitle className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-widest text-emerald-400">Synonym Sniper</CardTitle>
                 <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] sm:text-xs">TARGET {round}/10</Badge>
               </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" onClick={() => setShowHowToPlay(!showHowToPlay)} className="text-emerald-400 hover:text-emerald-300 gap-1 text-xs sm:text-sm h-8 sm:h-9">
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">How to Play</span>
                </Button>
                <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Score</p>
                    <p className="text-lg sm:text-2xl font-black text-emerald-400 tabular-nums">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-emerald-500/50 hover:text-emerald-400 h-8 w-8 sm:h-10 sm:w-10" onClick={onToggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
            </div>
        </div>

        {showHowToPlay && (
          <div className="mt-3 p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm flex flex-col gap-1.5 animate-in fade-in">
            <div className="font-bold text-emerald-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Mission Briefing / How to Play
            </div>
            <p>1. A priority target word is projected on your HUD.</p>
            <p>2. Identify and shoot the target containing its exact synonym before your lock-on timer runs out.</p>
            <p>3. Faster hits award higher precision bonus points across 10 rounds.</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 z-10 relative overflow-y-auto">
        <AnimatePresence mode="wait">
           {gameState === "idle" && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center w-full max-w-xl mx-auto py-4">
               <Crosshair className="w-20 h-20 sm:w-28 sm:h-28 text-emerald-500 mx-auto mb-4 sm:mb-6 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]" />
               <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-2 sm:mb-3">Lock On Target</h2>
               <p className="text-xs sm:text-base text-emerald-200/70 max-w-md mx-auto mb-6">Select radar frequency & speed lock to begin.</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-6">
                 <Button onClick={() => startGame("easy")} className="h-14 sm:h-20 text-sm sm:text-base font-black bg-slate-900 border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-900/40 text-emerald-400 uppercase tracking-wider relative overflow-hidden group rounded-xl">
                     <Target className="absolute -left-3 -bottom-3 w-12 h-12 text-emerald-500/10 group-hover:text-emerald-500/30 transition-all" />
                     <span>Easy<br /><span className="text-[10px] sm:text-xs font-normal text-emerald-300/70">10s lock</span></span>
                 </Button>
                 <Button onClick={() => startGame("intermediate")} className="h-14 sm:h-20 text-sm sm:text-base font-black bg-slate-900 border-2 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-900/40 text-yellow-400 uppercase tracking-wider relative overflow-hidden group rounded-xl">
                     <Target className="absolute -left-3 -bottom-3 w-12 h-12 text-yellow-500/10 group-hover:text-yellow-500/30 transition-all" />
                     <span>Medium<br /><span className="text-[10px] sm:text-xs font-normal text-yellow-300/70">7s lock</span></span>
                 </Button>
                 <Button onClick={() => startGame("pro")} className="h-14 sm:h-20 text-sm sm:text-base font-black bg-slate-900 border-2 border-red-500/50 hover:border-red-400 hover:bg-red-900/40 text-red-500 uppercase tracking-wider relative overflow-hidden group rounded-xl">
                     <Target className="absolute -left-3 -bottom-3 w-12 h-12 text-red-500/10 group-hover:text-red-500/30 transition-all" />
                     <span>Pro<br /><span className="text-[10px] sm:text-xs font-normal text-red-300/70">4s lock</span></span>
                 </Button>
               </div>

               <Button variant="ghost" asChild className="text-emerald-500/50 hover:text-emerald-400 uppercase tracking-widest text-xs sm:text-sm">
                  <Link href="/games">Back to Games</Link>
               </Button>
             </motion.div>
           )}

           {gameState === "playing" && currentProblem && currentProblem.baseWord !== "" && (
             <div className="w-full flex-grow flex flex-col items-center justify-between py-2 sm:py-6">
                <div className="flex flex-col items-center text-center">
                   <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1">Priority Target</p>
                   <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] border-b-2 border-emerald-500/50 pb-2 sm:pb-3 px-4">{currentProblem.baseWord}</h1>
                </div>

                <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 my-4">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div key={opt} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                       <Button onClick={() => handleShot(opt)} className="group relative w-full h-16 sm:h-24 bg-slate-900/70 border-2 border-emerald-900/60 hover:border-emerald-400 rounded-xl hover:bg-emerald-900/30 text-lg sm:text-2xl font-black text-emerald-100 uppercase overflow-hidden transition-all duration-300">
                          <Target className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-20 sm:h-20 text-emerald-500/10 group-hover:text-emerald-500/30 transition-all duration-300 group-hover:scale-110" />
                          <span className="relative z-10 px-2 truncate">{opt}</span>
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                       </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="w-full max-w-xl px-2">
                   <div className="flex justify-between mb-1">
                       <span className="text-emerald-600 text-[10px] sm:text-xs font-black tracking-widest uppercase">Target Lock Timeout</span>
                       <span className="text-emerald-400 text-xs sm:text-sm font-black tabular-nums">{timeLeft.toFixed(1)}s</span>
                   </div>
                   <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-2 bg-slate-800 rounded-full">
                     <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                   </Progress>
                </div>
             </div>
           )}

           {gameState === "showing_result" && (
             <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center w-full max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-center flex-col my-auto">
               {resultData.status === "hit" && (
                 <>
                   <Crosshair className="w-20 h-20 sm:w-28 sm:h-28 text-emerald-400 mb-4 animate-pulse drop-shadow-[0_0_40px_rgba(16,185,129,0.8)]" />
                   <h2 className="text-3xl sm:text-5xl font-black text-emerald-400 uppercase tracking-widest">Target Hit</h2>
                   <p className="text-xl sm:text-2xl text-emerald-100 mt-2">+{resultData.points} SCORE</p>
                 </>
               )}
               {resultData.status !== "hit" && (
                 <>
                   <Zap className="w-20 h-20 sm:w-28 sm:h-28 text-red-500 mb-4 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]" />
                   <h2 className="text-3xl sm:text-5xl font-black text-red-500 uppercase tracking-widest">{resultData.status === "miss" ? "Missed" : "Time Out"}</h2>
                   <p className="text-sm sm:text-lg text-slate-300 mt-3 uppercase tracking-widest">Correct Target: <span className="text-emerald-400 font-bold ml-1 text-base sm:text-xl">{resultData.trueAnswer}</span></p>
                 </>
               )}
               
               <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full">
                   <Button onClick={nextRound} className="w-full h-12 sm:h-14 text-base sm:text-xl font-black bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl border border-emerald-400 uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                       {round >= 10 ? "End Mission" : "Next Target"}
                   </Button>
                   <Button variant="ghost" onClick={() => setGameState("idle")} className="w-full sm:w-auto text-emerald-500/50 hover:text-emerald-400 uppercase tracking-widest text-xs">
                       Abort
                   </Button>
               </div>
             </motion.div>
           )}

           {gameState === "finished" && (
             <div className="text-center w-full max-w-md mx-auto py-4">
               <h2 className="text-3xl sm:text-5xl font-black text-emerald-400 uppercase mb-2 tracking-widest">Mission Complete</h2>
               <div className="bg-slate-900 border border-emerald-500/20 p-6 sm:p-8 mt-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                   <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-1">Final Score</p>
                   <p className="text-5xl sm:text-7xl font-black text-white">{score}</p>
               </div>
               <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                 <Button onClick={() => { setGameState("idle"); setScore(0); setRound(0); }} className="h-12 px-8 text-base font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl border border-emerald-400 uppercase tracking-widest"><Repeat className="mr-2 h-4 w-4" /> RESTART</Button>
                 <Button variant="outline" asChild className="h-12 px-8 text-base font-black border-slate-700 text-slate-300 hover:text-white rounded-xl uppercase tracking-widest"><Link href="/games">EXIT</Link></Button>
               </div>
             </div>
           )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
