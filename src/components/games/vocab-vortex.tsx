"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Sparkles, Trophy, Repeat, Maximize, Minimize, Orbit, Star, Timer } from "lucide-react";
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
  word: string;
  answer: string;
  options: string[];
  startTime: number;
}

type GameState = "idle" | "playing" | "finished" | "instructions" | "showing_result";

const TIMER_LIMIT = 8;
const ROUNDS = 10;

const DICTIONARY = [
    { word: "Abundant", synonym: "Copious", distractors: ["Scarce", "Empty", "Light", "Brief"] },
    { word: "Clandestine", synonym: "Secret", distractors: ["Public", "Noisy", "Bright", "Clear"] },
    { word: "Ephemeral", synonym: "Fleeting", distractors: ["Eternal", "Heavy", "Solid", "Loud"] },
    { word: "Lucid", synonym: "Clear", distractors: ["Murky", "Confused", "Dark", "Dense"] },
    { word: "Profound", synonym: "Deep", distractors: ["Shallow", "Simple", "Mild", "Basic"] },
    { word: "Tenacious", synonym: "Persistent", distractors: ["Weak", "Yielding", "Soft", "Frail"] },
    { word: "Venerate", synonym: "Respect", distractors: ["Despise", "Mock", "Ignore", "Hate"] },
    { word: "Zealous", synonym: "Passionate", distractors: ["Apathetic", "Cold", "Dull", "Lazy"] },
    { word: "Meticulous", synonym: "Careful", distractors: ["Sloppy", "Reckless", "Wild", "Rush"] },
    { word: "Obscure", synonym: "Hidden", distractors: ["Obvious", "Famous", "Loved", "Seen"] },
    { word: "Pristine", synonym: "Pure", distractors: ["Dirty", "Spoiled", "Used", "Old"] },
    { word: "Resilient", synonym: "Tough", distractors: ["Fragile", "Brittle", "Weak", "Soft"] },
    { word: "Alacrity", synonym: "Eagerness", distractors: ["Apathy", "Hesitation", "Sadness", "Dullness"] },
    { word: "Benevolent", synonym: "Kind", distractors: ["Cruel", "Greedy", "Hateful", "Selfish"] },
    { word: "Candid", synonym: "Frank", distractors: ["Deceitful", "Shy", "Quiet", "Sneaky"] },
    { word: "Diligent", synonym: "Hardworking", distractors: ["Lazy", "Idle", "Careless", "Slow"] },
    { word: "Eloquent", synonym: "Articulate", distractors: ["Mute", "Silent", "Inarticulate", "Slow"] },
    { word: "Frugal", synonym: "Thrifty", distractors: ["Wasteful", "Rich", "Lavish", "Careless"] },
    { word: "Gregarious", synonym: "Outgoing", distractors: ["Shy", "Quiet", "Reclusive", "Wild"] },
    { word: "Haughty", synonym: "Proud", distractors: ["Humble", "Shy", "Lowly", "Mild"] },
    { word: "Impetuous", synonym: "Rash", distractors: ["Careful", "Slow", "Calm", "Wise"] },
    { word: "Jovial", synonym: "Cheerful", distractors: ["Sad", "Gloomy", "Serious", "Quiet"] },
    { word: "Knack", synonym: "Talent", distractors: ["Inability", "Clumsiness", "Weakness", "Failure"] },
    { word: "Loquacious", synonym: "Talkative", distractors: ["Quiet", "Silent", "Taciturn", "Mute"] },
    { word: "Magnanimous", synonym: "Generous", distractors: ["Stingy", "Mean", "Selfish", "Cruel"] },
    { word: "Nefarious", synonym: "Wicked", distractors: ["Noble", "Good", "Honest", "Holy"] },
    { word: "Ostentatious", synonym: "Showy", distractors: ["Humble", "Simple", "Quiet", "Plain"] },
    { word: "Pacify", synonym: "Calm", distractors: ["Angers", "Irritates", "Excites", "Harms"] },
    { word: "Quell", synonym: "Suppress", distractors: ["Encourage", "Spark", "Start", "Grow"] },
    { word: "Recondite", synonym: "Abstruse", distractors: ["Simple", "Clear", "Direct", "Easy"] },
    { word: "Sagacious", synonym: "Wise", distractors: ["Foolish", "Silly", "Ignorant", "Wild"] },
    { word: "Taciturn", synonym: "Reserved", distractors: ["Talkative", "Loud", "Friendly", "Bold"] },
    { word: "Ubiquitous", synonym: "Widespread", distractors: ["Rare", "Scarce", "Isolated", "Few"] },
    { word: "Vacillate", synonym: "Waver", distractors: ["Decide", "Stand", "Remain", "Persist"] },
    { word: "Wary", synonym: "Cautious", distractors: ["Careless", "Rash", "Bold", "Foolish"] },
    { word: "Xenophobic", synonym: "Intolerant", distractors: ["Welcoming", "Tolerant", "Friendly", "Kind"] },
    { word: "Yearn", synonym: "Long", distractors: ["Hate", "Dislike", "Reject", "Avoid"] },
    { word: "Zenith", synonym: "Peak", distractors: ["Bottom", "Base", "Valley", "Low"] },
    { word: "Acrimony", synonym: "Bitterness", distractors: ["Goodwill", "Kindness", "Love", "Peace"] },
    { word: "Cacophony", synonym: "Noise", distractors: ["Silence", "Music", "Quiet", "Melody"] },
    { word: "Debilitate", synonym: "Weaken", distractors: ["Strengthen", "Heal", "Grow", "Build"] },
    { word: "Eclectic", synonym: "Diverse", distractors: ["Uniform", "Narrow", "Simple", "Same"] },
    { word: "Fabricate", synonym: "Create", distractors: ["Destroy", "Ruin", "Break", "Stop"] },
    { word: "Garish", synonym: "Gaudy", distractors: ["Plain", "Simple", "Modest", "Dark"] },
    { word: "Hapless", synonym: "Unlucky", distractors: ["Lucky", "Happy", "Rich", "Safe"] },
];

export function VocabVortex({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [currentProblem, setCurrentProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_LIMIT);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [combo, setCombo] = React.useState(0);
  const [resultData, setResultData] = React.useState<{ status: "correct" | "incorrect" | "timeout", points?: number, trueAnswer?: string }>({ status: "correct" });
  const [sessionWords, setSessionWords] = React.useState<typeof DICTIONARY>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateProblem = (index: number, pool: typeof DICTIONARY): Problem => {
    const item = pool[index];
    const options = [item.synonym];
    const availableDistractors = shuffleArray([...item.distractors]);
    
    while (options.length < 4 && availableDistractors.length > 0) {
      options.push(availableDistractors.pop()!);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      word: item.word,
      answer: item.synonym,
      options: shuffleArray(options),
      startTime: Date.now(),
    };
  };

  const startNextRound = (currentRoundPool?: typeof DICTIONARY) => {
    const activePool = currentRoundPool || sessionWords;
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
    setCurrentProblem(generateProblem(round, activePool));
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
      const bonus = Math.floor(timeLeft * 10);
      pointsEarned = 200 + bonus;
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
      "w-full transition-all duration-500 flex flex-col overflow-y-auto relative border-none shadow-2xl bg-indigo-950/20",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[700px]"
    )}>
      {/* Cosmic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black" />
        {[...Array(30)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
              animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
            />
        ))}
      </div>

      <CardHeader className="z-10 bg-indigo-950/40 backdrop-blur-md border-b border-indigo-500/20 relative">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="text-indigo-300 hover:text-indigo-100 mr-2">
                    <Link href="/games">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                </Button>
                <Orbit className="h-8 w-8 text-fuchsia-400 animate-[spin_10s_linear_infinite]" />
                <div>
                    <CardTitle className="text-2xl font-black text-white tracking-widest uppercase">Vocab Vortex</CardTitle>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-indigo-300 border-indigo-500/50">PHASE {round}/{ROUNDS}</Badge>
                        <Badge variant="outline" className="text-fuchsia-400 border-fuchsia-500/50">MULTIPLIER x{combo}</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Aethereal Energy</p>
                    <p className="text-2xl font-black text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-indigo-300 hover:text-white hover:bg-white/10" onClick={onToggleFullscreen}>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8 max-w-2xl"
            >
              <div className="relative inline-block">
                <motion.div 
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-10 bg-gradient-to-r from-indigo-500/30 to-fuchsia-500/30 blur-3xl rounded-full"
                />
                <h2 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-fuchsia-300 to-white uppercase tracking-tighter leading-none mb-4 relative drop-shadow-lg">
                    Enter the<br/>Vortex
                </h2>
              </div>
              <p className="text-indigo-200/80 text-lg md:text-xl font-medium">
                Words are being pulled into the synaptic black hole. Find their true synonyms to stabilize the core.
              </p>
              <Button 
                onClick={() => {
                  const shuffled = shuffleArray([...DICTIONARY]);
                  setSessionWords(shuffled);
                  setGameState('instructions');
                }} 
                className="h-20 px-12 text-2xl font-black bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white rounded-full shadow-[0_0_40px_rgba(192,38,211,0.4)] transition-all hover:scale-105 uppercase tracking-widest border border-white/20"
              >
                OPEN PORTAL
              </Button>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-indigo-950/60 backdrop-blur-xl border border-indigo-500/30 p-8 md:p-12 rounded-[2rem] max-w-2xl w-full shadow-[0_0_50px_rgba(79,70,229,0.3)]"
            >
              <h3 className="text-3xl font-black text-white uppercase mb-8 flex items-center gap-3">
                <Star className="text-fuchsia-400 fill-fuchsia-400" /> Mission Directives
              </h3>
              <div className="space-y-6 text-xl text-indigo-100">
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-1">1</div>
                  <span>A complex target word will appear in the cosmic vortex.</span>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-1">2</div>
                  <span>Select the <strong className="text-fuchsia-300">Synonym</strong> (a word with the identical meaning) from the planetary orbs.</span>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-1">3</div>
                  <span>Gravity is increasing; solve it before the time collapses.</span>
                </div>
              </div>
              <Button onClick={() => startNextRound(sessionWords)} className="w-full mt-12 h-16 text-xl font-black bg-white text-indigo-950 hover:bg-indigo-100 transition-colors uppercase tracking-widest rounded-xl">
                Initiate Sequence
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && currentProblem && (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
               <motion.div
                  key={currentProblem.id}
                  initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="mb-16 relative"
               >
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-16 bg-[conic-gradient(var(--tw-gradient-stops))] from-indigo-500/20 via-fuchsia-500/20 to-indigo-500/20 blur-2xl rounded-full"
                  />
                  <div className="relative h-40 w-40 md:h-48 md:w-48 bg-slate-950/80 backdrop-blur border-4 border-indigo-500/50 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                    <span className="text-3xl md:text-4xl font-black text-white px-4 text-center break-words drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                      {currentProblem.word}
                    </span>
                  </div>
               </motion.div>

               <div className="grid grid-cols-2 gap-4 w-full max-w-2xl px-4">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                    >
                        <Button
                            onClick={() => handleAnswer(opt)}
                            className="w-full h-24 text-2xl md:text-3xl font-black bg-indigo-950/60 hover:bg-fuchsia-900/60 text-indigo-100 border border-indigo-500/30 hover:border-fuchsia-400 rounded-full transition-all group relative overflow-hidden backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(192,38,211,0.4)] hover:-translate-y-1"
                        >
                            <span className="relative z-10">{opt}</span>
                            <motion.div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="absolute bottom-6 left-0 right-0 px-8 w-full max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-indigo-300 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Core Stability
                    </span>
                    <span className="text-fuchsia-400 font-black tabular-nums">{timeLeft.toFixed(1)}s</span>
                  </div>
                  <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-3 bg-indigo-950/50 border border-indigo-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full shadow-[0_0_10px_rgba(192,38,211,0.8)]" />
                  </Progress>
               </div>
            </div>
          )}

          {gameState === "showing_result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
              className="w-full h-full flex flex-col items-center justify-center relative text-center"
            >
                {resultData.status === "correct" && (
                    <div className="bg-gradient-to-b from-indigo-500/20 to-transparent p-16 rounded-[3rem] border border-indigo-400/30 backdrop-blur-md">
                        <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(99,102,241,0.8)]">
                            Synapse Linked
                        </h2>
                        <p className="text-3xl text-fuchsia-300 mt-6 font-bold">+{resultData.points} Power</p>
                    </div>
                )}
                {resultData.status === "incorrect" && (
                    <div className="bg-red-950/40 p-16 rounded-[3rem] border border-red-500/30 backdrop-blur-md">
                        <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-400 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                            Void Collapse
                        </h2>
                        <p className="text-2xl text-white mt-8">The correct synonym was <br/><span className="text-5xl font-black text-red-400 mt-2 block drop-shadow-md">{resultData.trueAnswer}</span></p>
                    </div>
                )}
                {resultData.status === "timeout" && (
                    <div className="bg-orange-950/40 p-16 rounded-[3rem] border border-orange-500/30 backdrop-blur-md">
                        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-orange-400 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]">
                            Event Horizon Crossed
                        </h2>
                        <p className="text-2xl text-white mt-8">The correct synonym was <br/><span className="text-5xl font-black text-orange-400 mt-2 block drop-shadow-md">{resultData.trueAnswer}</span></p>
                    </div>
                )}
            </motion.div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full max-w-3xl px-4"
            >
              <Orbit className="h-40 w-40 text-fuchsia-400 mx-auto mb-8 drop-shadow-[0_0_40px_rgba(192,38,211,0.6)] animate-[spin_20s_linear_infinite]" />
              <h2 className="text-6xl font-black text-white uppercase mb-2 drop-shadow-lg">Nexus Stabilized</h2>
              <p className="text-indigo-300 text-xl font-bold uppercase tracking-widest mb-12">Vocabulary integration complete</p>
              
              <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-3xl p-10 mb-12 flex flex-col md:flex-row gap-8 justify-center backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="text-center flex-1">
                    <p className="text-sm font-black text-indigo-400/80 uppercase mb-2 tracking-widest">Aethereal Energy</p>
                    <p className="text-6xl font-black text-white tabular-nums drop-shadow-sm">{score}</p>
                </div>
                <div className="hidden md:block w-px bg-indigo-500/30" />
                <div className="text-center flex-1">
                    <p className="text-sm font-black text-indigo-400/80 uppercase mb-2 tracking-widest">Max Multiplier</p>
                    <p className="text-6xl font-black text-fuchsia-400 tabular-nums drop-shadow-sm">{combo}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button onClick={() => { setScore(0); setRound(0); setCombo(0); setGameState('idle'); }} className="h-16 px-12 text-xl font-black bg-white text-indigo-950 hover:bg-indigo-100 rounded-xl uppercase tracking-widest shadow-xl">
                    <Repeat className="mr-2" /> PLAY AGAIN
                </Button>
                <Button variant="outline" asChild className="h-16 px-12 text-xl font-black border-indigo-500/30 text-indigo-100 hover:bg-indigo-900/50 hover:text-white rounded-xl uppercase tracking-widest">
                    <Link href="/games">EXIT VORTEX</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="z-10 bg-indigo-950/60 backdrop-blur-md border-t border-indigo-500/20 py-4 flex justify-between px-8">
        <div className="text-indigo-400/50 text-[10px] font-black uppercase tracking-widest">
            Vocab Vortex // LingoVerse Relay
        </div>
        <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-fuchsia-400 animate-pulse" />
            <span className="text-fuchsia-400 text-[10px] font-black uppercase tracking-widest">Active</span>
        </div>
      </CardFooter>
    </Card>
  );
}
