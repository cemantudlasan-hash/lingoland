"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Swords, Shield, Trophy, Repeat, Maximize, Minimize, AlertTriangle, Timer, BookOpen } from "lucide-react";
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
  sentence: string;
  options: string[];
  answer: string;
}

type GameState = "idle" | "playing" | "finished" | "instructions" | "showing_result";
type Difficulty = "easy" | "intermediate" | "pro";

export function GrammarGladiator({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(10);
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

  const problemsByDifficulty: Record<Difficulty, Problem[]> = {
    easy: [
      { id: "e1", sentence: "She ___ to the store yesterday.", options: ["go", "goes", "went", "gone"], answer: "went" },
      { id: "e2", sentence: "They ___ playing soccer right now.", options: ["is", "are", "am", "be"], answer: "are" },
      { id: "e3", sentence: "I ___ a good book last night.", options: ["read", "reading", "reads", "will read"], answer: "read" },
      { id: "e4", sentence: "He ___ an apple every morning.", options: ["eat", "eats", "eating", "ate"], answer: "eats" },
      { id: "e5", sentence: "My dog ___ very fast.", options: ["runs", "run", "running", "ran"], answer: "runs" },
      { id: "e6", sentence: "We ___ happy to see you.", options: ["am", "is", "are", "be"], answer: "are" },
      { id: "e7", sentence: "The cat ___ sleeping on the bed.", options: ["are", "is", "were", "am"], answer: "is" },
      { id: "e8", sentence: "Did you ___ your homework?", options: ["do", "does", "did", "done"], answer: "do" },
      { id: "e9", sentence: "Look! A bird ___ flying.", options: ["are", "am", "is", "be"], answer: "is" },
      { id: "e10", sentence: "I ___ a new bike for my birthday.", options: ["get", "gets", "got", "getting"], answer: "got" },
      { id: "e11", sentence: "She ___ carefully on the ice.", options: ["walks", "walk", "walking", "walked"], answer: "walks" },
      { id: "e12", sentence: "The sun ___ in the east.", options: ["rise", "rises", "rose", "rising"], answer: "rises" }
    ],
    intermediate: [
      { id: "i1", sentence: "They have been waiting ___ three hours.", options: ["since", "for", "from", "by"], answer: "for" },
      { id: "i2", sentence: "I look forward to ___ you.", options: ["see", "seeing", "saw", "seen"], answer: "seeing" },
      { id: "i3", sentence: "She is not used to ___ early.", options: ["wake up", "wakes up", "waking up", "woke up"], answer: "waking up" },
      { id: "i4", sentence: "Despite ___ tired, he kept working.", options: ["be", "is", "being", "been"], answer: "being" },
      { id: "i5", sentence: "The book was written ___ a famous author.", options: ["by", "with", "from", "of"], answer: "by" },
      { id: "i6", sentence: "I haven't seen him ___ last Monday.", options: ["for", "since", "from", "in"], answer: "since" },
      { id: "i7", sentence: "Are you interested ___ learning French?", options: ["in", "on", "at", "about"], answer: "in" },
      { id: "i8", sentence: "He apologized ___ being late.", options: ["for", "to", "about", "on"], answer: "for" },
      { id: "i9", sentence: "This is the best movie I have ___ seen.", options: ["never", "always", "ever", "yet"], answer: "ever" },
      { id: "i10", sentence: "We must ___ a decision soon.", options: ["do", "make", "take", "have"], answer: "make" },
      { id: "i11", sentence: "She ___ already left when I arrived.", options: ["has", "have", "had", "would"], answer: "had" },
      { id: "i12", sentence: "I'm thinking ___ moving to another city.", options: ["of", "to", "at", "for"], answer: "of" }
    ],
    pro: [
      { id: "p1", sentence: "If I ___ you, I would study harder.", options: ["am", "was", "were", "be"], answer: "were" },
      { id: "p2", sentence: "He is the man ___ stole my car.", options: ["who", "whom", "which", "whose"], answer: "who" },
      { id: "p3", sentence: "By next year, I ___ graduated.", options: ["will have", "have", "will be", "had"], answer: "will have" },
      { id: "p4", sentence: "I wish I ___ more money.", options: ["have", "has", "had", "having"], answer: "had" },
      { id: "p5", sentence: "Little ___ about the surprise awaiting him.", options: ["he knew", "did he know", "he knows", "knew he"], answer: "did he know" },
      { id: "p6", sentence: "___ the weather been better, we would have gone sailing.", options: ["If", "Had", "Were", "Should"], answer: "Had" },
      { id: "p7", sentence: "It is imperative that he ___ here on time.", options: ["is", "was", "be", "were"], answer: "be" },
      { id: "p8", sentence: "Scarcely ___ entered the room when the phone rang.", options: ["had I", "I had", "did I", "I did"], answer: "had I" },
      { id: "p9", sentence: "He works diligently lest he ___ fired.", options: ["is", "be", "was", "would be"], answer: "be" },
      { id: "p10", sentence: "I would rather you ___ not tell anyone.", options: ["do", "did", "have", "were"], answer: "did" },
      { id: "p11", sentence: "Not only ___ win, but she also broke the record.", options: ["she did", "did she", "she does", "does she"], answer: "did she" },
      { id: "p12", sentence: "The more you study, ___ you will become.", options: ["the smarter", "smarter", "the smartest", "smart"], answer: "the smarter" }
    ]
  };

  const getTimerLimit = () => {
     if (difficulty === "easy") return 15;
     if (difficulty === "intermediate") return 10;
     return 6;
  };

  const startGame = (diff: Difficulty) => {
     setDifficulty(diff);
     setGameState("instructions");
  }

  const startNextRound = () => {
    if (round >= 10) {
      setGameState("finished");
      if (firestore && game) {
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game.slug, title: game.title, score, difficulty }
        });
      }
      return;
    }
    setRound(prev => prev + 1);
    const pool = problemsByDifficulty[difficulty];
    const problem = pool[Math.floor(Math.random() * pool.length)];
    setCurrentProblem({
      ...problem,
      options: shuffleArray([...problem.options])
    });
    setTimeLeft(getTimerLimit());
    setGameState("playing");
  };

  const handleAnswer = (selected: string | null) => {
    if (gameState !== "playing" || !currentProblem) return;

    const correct = selected === currentProblem.answer;
    let pointsEarned = 0;
    let status: "correct" | "incorrect" | "timeout" = "incorrect";

    if (correct) {
      status = "correct";
      const bonus = Math.floor(timeLeft * 10);
      const diffMultiplier = difficulty === "easy" ? 1 : difficulty === "intermediate" ? 1.5 : 2;
      pointsEarned = Math.floor((100 + bonus) * diffMultiplier);
      setScore(prev => prev + pointsEarned);
      setCombo(prev => prev + 1);
    } else if (selected === null) {
      status = "timeout";
      setCombo(0);
    } else {
      status = "incorrect";
      setCombo(0);
    }
    
    setResultData({ status, points: pointsEarned, trueAnswer: currentProblem.answer });
    setGameState("showing_result");
  };

  React.useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 0.1), 100);
    } else if (gameState === "playing" && timeLeft <= 0) {
      handleAnswer(null);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft]);

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 flex flex-col relative border-none shadow-2xl overflow-y-auto overflow-x-hidden bg-stone-900",
      isFullscreen ? "fixed inset-0 z-50 rounded-none min-h-screen" : "flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl"
    )}>
      {/* Colosseum Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900/40 via-stone-900 to-black" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-orange-900/60 to-transparent blur-2xl" />
        <div className="w-full h-full flex items-center justify-center -mt-20">
          <div className="w-[800px] h-[400px] border-[40px] border-orange-900/20 rounded-[100%] absolute transform rotate-x-60 pointer-events-none" />
        </div>
      </div>

      <CardHeader className="z-10 bg-black/60 backdrop-blur-md border-b border-orange-900/30 relative p-3 sm:p-6 shrink-0">
        <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Button variant="ghost" size="icon" asChild className="text-white/50 hover:text-white shrink-0">
                    <Link href="/games">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                </Button>
                <div className="bg-orange-600/20 p-1.5 sm:p-2 rounded-full border border-orange-500/30 shrink-0">
                  <Swords className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                </div>
                <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-2xl font-black text-stone-200 tracking-wider sm:tracking-widest uppercase font-serif truncate">Grammar Gladiator</CardTitle>
                    <div className="flex gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                        <Badge variant="outline" className="text-orange-400 border-orange-800/50 bg-orange-900/20 text-[10px] sm:text-xs">WAVE {round}/10</Badge>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-800/50 bg-yellow-900/20 text-[10px] sm:text-xs">STREAK x{combo}</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGameState(gameState === "instructions" ? "idle" : "instructions")}
                  className="border-orange-700/50 text-orange-300 hover:bg-orange-900/30 text-xs px-2 sm:px-3 h-8 sm:h-9"
                >
                  <BookOpen className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">{gameState === "instructions" ? "Close Guide" : "How to Play"}</span>
                </Button>
                <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] font-bold text-stone-500 uppercase tracking-wider sm:tracking-widest">Glory</p>
                    <p className="text-lg sm:text-2xl font-black text-stone-200 tabular-nums">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-stone-200 h-8 w-8 sm:h-9 sm:w-9" onClick={onToggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
            </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 z-10 relative overflow-y-auto w-full max-w-full">
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4 sm:space-y-6 w-full max-w-lg mx-auto py-4"
            >
              <div className="relative inline-block">
                <Shield className="absolute -left-8 -top-6 sm:-left-12 sm:-top-8 h-16 w-16 sm:h-24 sm:w-24 text-orange-900/50 -z-10 rotate-12" />
                <Swords className="absolute -right-8 -bottom-6 sm:-right-12 sm:-bottom-8 h-16 w-16 sm:h-24 sm:w-24 text-orange-900/50 -z-10 -rotate-12" />
                <h2 className="text-3xl sm:text-6xl font-black text-stone-200 uppercase tracking-tighter leading-none mb-2 sm:mb-4 font-serif drop-shadow-2xl">
                    Enter the<br/><span className="text-4xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600">Arena</span>
                </h2>
              </div>
              <p className="text-stone-400 max-w-md mx-auto text-xs sm:text-base uppercase tracking-wider sm:tracking-widest">
                Select your combat difficulty to begin.
              </p>
              
              <div className="flex flex-col gap-2.5 sm:gap-4 mt-4 sm:mt-6 w-full max-w-sm mx-auto">
                 <Button onClick={() => startGame("easy")} className="h-11 sm:h-14 text-xs sm:text-lg font-bold bg-stone-800 hover:bg-stone-700 text-green-400 border-2 border-green-900/50 hover:border-green-500 uppercase tracking-wide rounded-xl transition-all font-serif shadow-lg">Easy (15s)</Button>
                 <Button onClick={() => startGame("intermediate")} className="h-11 sm:h-14 text-xs sm:text-lg font-bold bg-stone-800 hover:bg-stone-700 text-yellow-400 border-2 border-yellow-900/50 hover:border-yellow-500 uppercase tracking-wide rounded-xl transition-all font-serif shadow-lg">Intermediate (10s)</Button>
                 <Button onClick={() => startGame("pro")} className="h-11 sm:h-14 text-xs sm:text-lg font-bold bg-stone-800 hover:bg-stone-700 text-red-500 border-2 border-red-900/50 hover:border-red-500 uppercase tracking-wide rounded-xl transition-all font-serif shadow-lg">Pro (6s)</Button>
                 <Button variant="outline" onClick={() => setGameState("instructions")} className="border-orange-700/50 text-orange-300 hover:bg-orange-900/20 text-xs sm:text-sm h-10 sm:h-11 rounded-xl">
                    <BookOpen className="w-4 h-4 mr-2" /> How to Play Guide
                 </Button>
                 <Button variant="ghost" asChild className="text-stone-500 hover:text-stone-300 uppercase tracking-widest font-serif text-[11px] sm:text-xs">
                    <Link href="/games">Back to Games</Link>
                 </Button>
              </div>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-stone-800/90 backdrop-blur-xl border-2 border-orange-900/30 p-4 sm:p-8 rounded-2xl max-w-xl w-full text-center shadow-2xl space-y-4"
            >
              <h3 className="text-xl sm:text-2xl font-black text-stone-200 uppercase flex items-center justify-center gap-2 font-serif">
                <Swords className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" /> Pre-Battle Briefing
              </h3>
              <div className="space-y-3 text-xs sm:text-base text-stone-300 font-medium text-left bg-stone-900/70 p-4 rounded-xl border border-stone-700">
                <p>1. You will face a sentence with missing or broken armor (grammar).</p>
                <p>2. Select the correct grammatical patch before the combat timer expires.</p>
                <p>3. Faster strikes earn more glory points and maintain your combo streak.</p>
                <p>4. 10 waves per combat expedition.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button onClick={() => { if (round === 0) startNextRound(); else setGameState("playing"); }} className="flex-1 h-11 sm:h-14 text-xs sm:text-base font-black bg-stone-200 text-stone-900 hover:bg-white uppercase tracking-wider rounded-xl font-serif">
                  To the Colosseum
                </Button>
                <Button variant="ghost" onClick={() => setGameState("idle")} className="text-stone-400 hover:text-stone-200 text-xs sm:text-sm h-10 sm:h-14 uppercase font-serif">
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === "playing" && currentProblem && (
            <div className="w-full flex flex-col items-center justify-center relative max-w-3xl mx-auto py-2">
               <motion.div
                  key={currentProblem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 sm:mb-10 w-full text-center px-2"
               >
                  <div className="text-xl sm:text-3xl md:text-4xl font-medium text-stone-200 leading-relaxed drop-shadow-md break-words">
                     {currentProblem.sentence.split('___').map((part, i, arr) => (
                       <React.Fragment key={i}>
                         {part}
                         {i < arr.length - 1 && (
                           <span className="inline-block mx-1.5 sm:mx-3 w-16 sm:w-28 border-b-2 sm:border-b-4 border-dashed border-orange-500/70 pb-1 relative top-1"></span>
                         )}
                       </React.Fragment>
                     ))}
                  </div>
               </motion.div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Button
                            onClick={() => handleAnswer(opt)}
                            className="w-full h-14 sm:h-20 text-lg sm:text-2xl font-bold bg-stone-800/80 hover:bg-orange-600 text-stone-200 border-2 border-stone-600 hover:border-orange-400 rounded-xl transition-all shadow-lg hover:shadow-orange-600/30 uppercase tracking-wider break-words"
                        >
                            {opt}
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="mt-6 sm:mt-10 w-full max-w-md px-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-stone-400 text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Timer className="w-3.5 h-3.5"/> Combat Time</span>
                    <span className="text-orange-400 font-black tabular-nums text-xs sm:text-sm">{timeLeft.toFixed(1)}s</span>
                  </div>
                  <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-2 bg-stone-800 border border-stone-700/50">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-100 ease-linear" />
                  </Progress>
               </div>
            </div>
          )}

          {gameState === "showing_result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center p-4"
            >
                {resultData.status === "correct" && (
                    <div className="w-full bg-stone-800/90 border-2 sm:border-4 border-green-600/50 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl">
                        <Shield className="w-14 h-14 sm:w-20 sm:h-20 text-green-500 mx-auto mb-3 sm:mb-4" />
                        <h2 className="text-2xl sm:text-4xl font-black text-green-400 uppercase tracking-wider font-serif">
                            Victorious Strike
                        </h2>
                        <p className="text-xl sm:text-2xl text-stone-200 mt-2 sm:mt-4 font-bold">+{resultData.points} Glory</p>
                    </div>
                )}
                {resultData.status === "incorrect" && (
                    <div className="w-full bg-stone-800/90 border-2 sm:border-4 border-red-600/50 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl">
                        <AlertTriangle className="w-14 h-14 sm:w-20 sm:h-20 text-red-500 mx-auto mb-3 sm:mb-4" />
                        <h2 className="text-2xl sm:text-4xl font-black text-red-500 uppercase tracking-wider font-serif">
                            Armor Pierced
                        </h2>
                        <p className="text-sm sm:text-lg text-stone-300 mt-2 sm:mt-4">Correct form: <span className="font-bold text-orange-400 uppercase tracking-wider bg-stone-900 px-3 py-1 rounded-lg ml-1">{resultData.trueAnswer}</span></p>
                    </div>
                )}
                {resultData.status === "timeout" && (
                    <div className="w-full bg-stone-800/90 border-2 sm:border-4 border-orange-500/50 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl">
                        <Timer className="w-14 h-14 sm:w-20 sm:h-20 text-orange-500 mx-auto mb-3 sm:mb-4" />
                        <h2 className="text-2xl sm:text-4xl font-black text-orange-500 uppercase tracking-wider font-serif">
                            Too Slow!
                        </h2>
                        <p className="text-sm sm:text-lg text-stone-300 mt-2 sm:mt-4">Correct form: <span className="font-bold text-orange-400 uppercase tracking-wider bg-stone-900 px-3 py-1 rounded-lg ml-1">{resultData.trueAnswer}</span></p>
                    </div>
                )}
                
                <div className="flex flex-col items-center gap-2.5 sm:gap-3 mt-5 sm:mt-6 w-full">
                    <Button onClick={startNextRound} className="w-full h-12 sm:h-14 text-base sm:text-xl font-black bg-stone-200 text-stone-900 hover:bg-white rounded-xl shadow-2xl transition-all font-serif uppercase tracking-wider">
                        {round >= 10 ? "Finish Battle" : "Next Round"}
                    </Button>
                    <Button variant="ghost" onClick={() => setGameState("idle")} className="text-stone-400 hover:text-stone-200 uppercase tracking-wider font-serif text-[11px] sm:text-xs">
                        Change Difficulty
                    </Button>
                </div>
            </motion.div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-stone-800/60 p-6 sm:p-12 rounded-2xl sm:rounded-[36px] border border-orange-900/30 backdrop-blur-md max-w-xl w-full mx-auto"
            >
              <Trophy className="h-20 w-20 sm:h-32 sm:w-32 text-yellow-500 mx-auto mb-4 sm:mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
              <h2 className="text-3xl sm:text-5xl font-black text-stone-100 uppercase mb-2 font-serif">Battle Concluded</h2>
              <p className="text-orange-400/80 text-sm sm:text-xl font-bold uppercase tracking-wider mb-6 sm:mb-10">The Emperor is Amused</p>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-10 max-w-lg mx-auto">
                <div className="bg-stone-900/80 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-stone-700">
                    <p className="text-[10px] sm:text-xs font-black text-stone-400 uppercase tracking-wider mb-1">Total Glory</p>
                    <p className="text-3xl sm:text-5xl font-black text-white tabular-nums drop-shadow-md">{score}</p>
                </div>
                <div className="bg-stone-900/80 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-stone-700">
                    <p className="text-[10px] sm:text-xs font-black text-stone-400 uppercase tracking-wider mb-1">Max Streak</p>
                    <p className="text-3xl sm:text-5xl font-black text-yellow-500 tabular-nums drop-shadow-md">{combo}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                 <Button onClick={() => { setScore(0); setRound(0); setCombo(0); setGameState('idle'); }} className="h-12 sm:h-14 px-6 text-base sm:text-lg font-black bg-stone-200 text-stone-900 hover:bg-white rounded-xl flex items-center justify-center gap-2 transition-all font-serif uppercase">
                    <Repeat className="w-5 h-5" /> Re-enter Arena
                 </Button>
                 <Button variant="outline" asChild className="h-12 sm:h-14 px-6 text-base sm:text-lg font-black border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white rounded-xl font-serif uppercase">
                    <Link href="/games">Retire</Link>
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
