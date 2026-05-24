"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Swords, Shield, Trophy, Repeat, Maximize, Minimize, AlertTriangle, Timer } from "lucide-react";
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
      "w-full transition-all duration-500 flex flex-col relative border-none shadow-2xl overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-stone-900" : "max-w-4xl mx-auto h-[600px] sm:h-[700px] bg-stone-900"
    )}>
      {/* Colosseum Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900/40 via-stone-900 to-black" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-orange-900/60 to-transparent blur-2xl" />
        <div className="w-full h-full flex items-center justify-center -mt-20">
          <div className="w-[800px] h-[400px] border-[40px] border-orange-900/20 rounded-[100%] absolute transform rotate-x-60 pointer-events-none" />
        </div>
      </div>

      <CardHeader className="z-10 bg-black/60 backdrop-blur-md border-b border-orange-900/30 relative">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="text-white/50 hover:text-white mr-2">
                    <Link href="/games">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                </Button>
                <div className="bg-orange-600/20 p-2 rounded-full border border-orange-500/30">
                  <Swords className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-black text-stone-200 tracking-widest uppercase font-serif">Grammar Gladiator</CardTitle>
                    <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-orange-400 border-orange-800/50 bg-orange-900/20">WAVE {round}/10</Badge>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-800/50 bg-yellow-900/20">STREAK x{combo}</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Glory</p>
                    <p className="text-2xl font-black text-stone-200 tabular-nums">{score}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-stone-200" onClick={onToggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
            </div>
        </div>
      </CardHeader>

      <CardContent className={cn("flex-grow flex flex-col items-center justify-center p-6 z-10 relative", isFullscreen ? "min-h-[60vh]" : "min-h-[350px]")}>
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <Shield className="absolute -left-12 -top-8 h-24 w-24 text-orange-900/50 -z-10 rotate-12" />
                <Swords className="absolute -right-12 -bottom-8 h-24 w-24 text-orange-900/50 -z-10 -rotate-12" />
                <h2 className="text-6xl font-black text-stone-200 uppercase tracking-tighter leading-none mb-4 font-serif text-shadow-xl relative drop-shadow-2xl">
                    Enter the<br/><span className="text-7xl text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600">Arena</span>
                </h2>
              </div>
              <p className="text-stone-400 max-w-md mx-auto text-lg uppercase tracking-widest">
                Select your combat difficulty to begin.
              </p>
              
              <div className="flex flex-col gap-3 sm:gap-4 mt-6 sm:mt-8 w-full max-w-sm mx-auto">
                 <Button onClick={() => startGame("easy")} className="h-12 sm:h-16 text-sm sm:text-xl font-bold bg-stone-800 hover:bg-stone-700 text-green-400 border-2 border-green-900/50 hover:border-green-500 uppercase tracking-wide sm:tracking-widest rounded-xl transition-all font-serif shadow-lg">Easy (15s)</Button>
                 <Button onClick={() => startGame("intermediate")} className="h-12 sm:h-16 text-sm sm:text-xl font-bold bg-stone-800 hover:bg-stone-700 text-yellow-400 border-2 border-yellow-900/50 hover:border-yellow-500 uppercase tracking-wide sm:tracking-widest rounded-xl transition-all font-serif shadow-lg">Intermediate (10s)</Button>
                 <Button onClick={() => startGame("pro")} className="h-12 sm:h-16 text-sm sm:text-xl font-bold bg-stone-800 hover:bg-stone-700 text-red-500 border-2 border-red-900/50 hover:border-red-500 uppercase tracking-wide sm:tracking-widest rounded-xl transition-all font-serif shadow-lg">Pro (6s)</Button>
                 <Button variant="ghost" asChild className="mt-2 sm:mt-4 text-stone-500 hover:text-stone-300 uppercase tracking-widest font-serif text-xs sm:text-sm">
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
              className="bg-stone-800/80 backdrop-blur-xl border-2 border-orange-900/30 p-6 sm:p-12 rounded-xl sm:rounded-2xl max-w-2xl w-full text-center shadow-2xl"
            >
              <h3 className="text-2xl sm:text-3xl font-black text-stone-200 uppercase mb-6 sm:mb-8 flex items-center justify-center gap-3 font-serif">
                <Swords className="text-orange-500" /> Pre-Battle Briefing
              </h3>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-xl text-stone-400 font-medium">
                <p>1. You will face a sentence with missing or broken armor (grammar).</p>
                <p>2. Select the correct patch before the combat timer expires.</p>
                <p>3. Faster strikes earn more glory.</p>
                <p className="text-xs sm:text-sm text-orange-400 uppercase mt-2 sm:mt-4">Selected Difficulty: {difficulty}</p>
              </div>
              <Button onClick={startNextRound} className="w-full mt-6 sm:mt-12 h-12 sm:h-16 text-sm sm:text-xl font-black bg-stone-200 text-stone-900 hover:bg-white uppercase tracking-wide sm:tracking-widest rounded-xl font-serif">
                To the Colosseum
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && currentProblem && (
            <div className="w-full h-full flex flex-col items-center justify-center relative max-w-4xl mx-auto">
               <motion.div
                  key={currentProblem.id}
                  initial={{ opacity: 0, y: 50, rotateX: 30 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  className="mb-16 w-full text-center"
                  style={{ perspective: "1000px" }}
               >
                  <div className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-200 leading-tight drop-shadow-md">
                     {currentProblem.sentence.split('___').map((part, i, arr) => (
                       <React.Fragment key={i}>
                         {part}
                         {i < arr.length - 1 && (
                           <span className="inline-block mx-4 w-32 border-b-4 border-dashed border-orange-500/50 pb-2 relative top-2"></span>
                         )}
                       </React.Fragment>
                     ))}
                  </div>
               </motion.div>

               <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
                  {currentProblem.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                    >
                        <Button
                            onClick={() => handleAnswer(opt)}
                            className="w-full h-24 text-3xl font-bold bg-stone-800/80 hover:bg-orange-600 text-stone-200 border-2 border-stone-600 hover:border-orange-400 rounded-xl transition-all shadow-lg hover:shadow-orange-600/30 uppercase tracking-widest"
                        >
                            {opt}
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="absolute bottom-8 left-0 right-0 px-12 md:px-24">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-stone-500 text-sm font-black uppercase tracking-widest flex items-center gap-2"><Timer className="w-4 h-4"/> Combat Time</span>
                    <span className="text-orange-400 font-black tabular-nums">{timeLeft.toFixed(1)}s</span>
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
              initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
              className="w-full h-full flex flex-col items-center justify-center text-center backdrop-blur-sm bg-stone-900/50 absolute inset-0 rounded-xl"
            >
                {resultData.status === "correct" && (
                    <div className="bg-stone-800/90 border-4 border-green-600/50 p-12 rounded-3xl shadow-2xl shadow-green-900/50 backdrop-blur-xl">
                        <Shield className="w-24 h-24 text-green-500 mx-auto mb-6" />
                        <h2 className="text-6xl font-black text-green-400 uppercase tracking-widest font-serif">
                            Victorious Strike
                        </h2>
                        <p className="text-3xl text-stone-200 mt-6 font-bold">+{resultData.points} Glory</p>
                    </div>
                )}
                {resultData.status === "incorrect" && (
                    <div className="bg-stone-800/90 border-4 border-red-600/50 p-12 rounded-3xl shadow-2xl shadow-red-900/50 backdrop-blur-xl">
                        <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                        <h2 className="text-6xl font-black text-red-500 uppercase tracking-widest font-serif">
                            Armor Pierced
                        </h2>
                        <p className="text-2xl text-stone-300 mt-6">Correct form: <span className="font-bold text-orange-400 uppercase tracking-widest bg-stone-900 px-4 py-2 rounded-lg ml-2">{resultData.trueAnswer}</span></p>
                    </div>
                )}
                {resultData.status === "timeout" && (
                    <div className="bg-stone-800/90 border-4 border-orange-500/50 p-12 rounded-3xl shadow-2xl shadow-orange-900/50 backdrop-blur-xl">
                        <Timer className="w-24 h-24 text-orange-500 mx-auto mb-6" />
                        <h2 className="text-6xl font-black text-orange-500 uppercase tracking-widest font-serif">
                            Too Slow!
                        </h2>
                        <p className="text-2xl text-stone-300 mt-6">Correct form: <span className="font-bold text-orange-400 uppercase tracking-widest bg-stone-900 px-4 py-2 rounded-lg ml-2">{resultData.trueAnswer}</span></p>
                    </div>
                )}
                
                <div className="flex flex-col items-center gap-4 mt-8">
                    <Button onClick={startNextRound} className="h-16 px-12 text-2xl font-black bg-stone-200 text-stone-900 hover:bg-white rounded-xl shadow-2xl transition-all hover:scale-105 font-serif uppercase tracking-widest">
                        {round >= 10 ? "Finish Battle" : "Next Round"}
                    </Button>
                    <Button variant="ghost" onClick={() => setGameState("idle")} className="text-stone-500 hover:text-stone-300 uppercase tracking-widest font-serif">
                        Change Difficulty
                    </Button>
                </div>
            </motion.div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-stone-800/60 p-16 rounded-[40px] border border-orange-900/30 backdrop-blur-md"
            >
              <Trophy className="h-40 w-40 text-yellow-500 mx-auto mb-8 drop-shadow-[0_0_40px_rgba(234,179,8,0.5)]" />
              <h2 className="text-7xl font-black text-stone-100 uppercase mb-4 font-serif">Battle Concluded</h2>
              <p className="text-orange-400/80 text-2xl font-bold uppercase tracking-widest mb-16">The Emperor is Amused</p>
              
              <div className="grid grid-cols-2 gap-8 mb-16 max-w-2xl mx-auto">
                <div className="bg-stone-900/80 p-8 rounded-2xl border border-stone-700">
                    <p className="text-sm font-black text-stone-500 uppercase tracking-widest mb-2">Total Glory</p>
                    <p className="text-6xl font-black text-white tabular-nums drop-shadow-md">{score}</p>
                </div>
                <div className="bg-stone-900/80 p-8 rounded-2xl border border-stone-700">
                    <p className="text-sm font-black text-stone-500 uppercase tracking-widest mb-2">Max Streak</p>
                    <p className="text-6xl font-black text-yellow-500 tabular-nums drop-shadow-md">{combo}</p>
                </div>
              </div>

              <div className="flex justify-center gap-6">
                 <Button onClick={() => { setScore(0); setRound(0); setCombo(0); setGameState('idle'); }} className="h-20 px-12 text-2xl font-black bg-stone-200 text-stone-900 hover:bg-white rounded-xl flex items-center gap-4 transition-all hover:scale-105 font-serif uppercase">
                    <Repeat className="w-8 h-8" /> Re-enter Arena
                 </Button>
                 <Button variant="outline" asChild className="h-20 px-12 text-2xl font-black border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white rounded-xl font-serif uppercase">
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
