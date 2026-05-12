"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Maximize2, Minimize2, ArrowLeft, Flame, Sparkles, Trophy, ListChecks, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Difficulty = "easy" | "medium" | "hard";

interface Question {
  word: string;
  type: "Synonym" | "Antonym";
  options: string[];
  answer: string;
}

interface HistoryItem {
  questionDisplay: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  type: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 30+ questions per difficulty to avoid repetition during a full 30-round game
const englishQuestions: Record<Difficulty, Question[]> = {
  easy: [
    { word: "Happy", type: "Synonym", options: ["Joyful", "Sad", "Angry", "Bored"], answer: "Joyful" },
    { word: "Big", type: "Synonym", options: ["Large", "Small", "Tiny", "Fast"], answer: "Large" },
    { word: "Hot", type: "Antonym", options: ["Cold", "Warm", "Boiling", "Red"], answer: "Cold" },
    { word: "Fast", type: "Synonym", options: ["Quick", "Slow", "Heavy", "Loud"], answer: "Quick" },
    { word: "Good", type: "Antonym", options: ["Bad", "Nice", "Great", "Fine"], answer: "Bad" },
    { word: "Easy", type: "Synonym", options: ["Simple", "Hard", "Difficult", "Long"], answer: "Simple" },
    { word: "Start", type: "Antonym", options: ["Finish", "Begin", "Go", "Run"], answer: "Finish" },
    { word: "Loud", type: "Synonym", options: ["Noisy", "Quiet", "Soft", "Silent"], answer: "Noisy" },
    { word: "Clean", type: "Antonym", options: ["Dirty", "Neat", "Clear", "Wash"], answer: "Dirty" },
    { word: "Strong", type: "Antonym", options: ["Weak", "Tough", "Hard", "Heavy"], answer: "Weak" },
    { word: "Old", type: "Antonym", options: ["Young", "Ancient", "Past", "History"], answer: "Young" },
    { word: "Small", type: "Synonym", options: ["Tiny", "Huge", "Wide", "Tall"], answer: "Tiny" },
    { word: "Smart", type: "Synonym", options: ["Clever", "Dull", "Slow", "Quiet"], answer: "Clever" },
    { word: "Rich", type: "Antonym", options: ["Poor", "Wealthy", "Money", "Coin"], answer: "Poor" },
    { word: "Brave", type: "Synonym", options: ["Fearless", "Scared", "Timid", "Weak"], answer: "Fearless" },
    { word: "Right", type: "Antonym", options: ["Wrong", "Correct", "True", "Left"], answer: "Wrong" },
    { word: "Beautiful", type: "Synonym", options: ["Pretty", "Ugly", "Scary", "Bad"], answer: "Pretty" },
    { word: "Tired", type: "Synonym", options: ["Sleepy", "Awake", "Active", "Fast"], answer: "Sleepy" },
    { word: "Full", type: "Antonym", options: ["Empty", "Packed", "Heavy", "Light"], answer: "Empty" },
    { word: "Near", type: "Antonym", options: ["Far", "Close", "Beside", "Under"], answer: "Far" },
    { word: "Funny", type: "Synonym", options: ["Hilarious", "Serious", "Boring", "Sad"], answer: "Hilarious" },
    { word: "Light", type: "Antonym", options: ["Dark", "Bright", "Shine", "Glow"], answer: "Dark" },
    { word: "Hard", type: "Synonym", options: ["Difficult", "Soft", "Easy", "Simple"], answer: "Difficult" },
    { word: "Thin", type: "Antonym", options: ["Thick", "Slim", "Narrow", "Tall"], answer: "Thick" },
    { word: "Slow", type: "Antonym", options: ["Fast", "Creep", "Crawl", "Walk"], answer: "Fast" },
    { word: "Cold", type: "Synonym", options: ["Chilly", "Hot", "Warm", "Boil"], answer: "Chilly" },
    { word: "Soft", type: "Antonym", options: ["Hard", "Smooth", "Gentle", "Silk"], answer: "Hard" },
    { word: "High", type: "Antonym", options: ["Low", "Tall", "Up", "Above"], answer: "Low" },
    { word: "Under", type: "Antonym", options: ["Over", "Below", "Beneath", "Bottom"], answer: "Over" },
    { word: "New", type: "Synonym", options: ["Recent", "Old", "Used", "Stale"], answer: "Recent" },
  ],
  medium: [
    { word: "Abundant", type: "Synonym", options: ["Plentiful", "Scarce", "Rare", "Empty"], answer: "Plentiful" },
    { word: "Expand", type: "Antonym", options: ["Shrink", "Grow", "Increase", "Swell"], answer: "Shrink" },
    { word: "Genuine", type: "Synonym", options: ["Authentic", "Fake", "Artificial", "False"], answer: "Authentic" },
    { word: "Conceal", type: "Antonym", options: ["Reveal", "Hide", "Cover", "Mask"], answer: "Reveal" },
    { word: "Obstacle", type: "Synonym", options: ["Barrier", "Help", "Advantage", "Opening"], answer: "Barrier" },
    { word: "Vague", type: "Antonym", options: ["Clear", "Unclear", "Blurry", "Dim"], answer: "Clear" },
    { word: "Industrious", type: "Synonym", options: ["Hardworking", "Lazy", "Idle", "Tired"], answer: "Hardworking" },
    { word: "Pessimistic", type: "Antonym", options: ["Optimistic", "Negative", "Gloomy", "Sad"], answer: "Optimistic" },
    { word: "Lucid", type: "Synonym", options: ["Clear", "Confusing", "Dark", "Muddy"], answer: "Clear" },
    { word: "Amateur", type: "Antonym", options: ["Professional", "Beginner", "Novice", "Rookie"], answer: "Professional" },
    { word: "Courageous", type: "Synonym", options: ["Fearless", "Timid", "Scared", "Cowardly"], answer: "Fearless" },
    { word: "Diligent", type: "Antonym", options: ["Lazy", "Careful", "Attentive", "Active"], answer: "Lazy" },
    { word: "Eager", type: "Synonym", options: ["Enthusiastic", "Reluctant", "Bored", "Tired"], answer: "Enthusiastic" },
    { word: "Fictitious", type: "Antonym", options: ["Real", "Fake", "Imaginary", "False"], answer: "Real" },
    { word: "Grandiose", type: "Synonym", options: ["Magnificent", "Modest", "Simple", "Plain"], answer: "Magnificent" },
    { word: "Hinder", type: "Antonym", options: ["Help", "Obstruct", "Block", "Delay"], answer: "Help" },
    { word: "Ignite", type: "Synonym", options: ["Kindle", "Extinguish", "Quench", "Smother"], answer: "Kindle" },
    { word: "Jovial", type: "Antonym", options: ["Miserable", "Cheerful", "Merry", "Joyful"], answer: "Miserable" },
    { word: "Keen", type: "Synonym", options: ["Sharp", "Dull", "Blunt", "Slow"], answer: "Sharp" },
    { word: "Lenient", type: "Antonym", options: ["Strict", "Forgiving", "Mild", "Merciful"], answer: "Strict" },
    { word: "Meticulous", type: "Synonym", options: ["Careful", "Sloppy", "Careless", "Messy"], answer: "Careful" },
    { word: "Notorious", type: "Antonym", options: ["Unknown", "Famous", "Infamous", "Well-known"], answer: "Unknown" },
    { word: "Obsolete", type: "Synonym", options: ["Outdated", "Modern", "Current", "New"], answer: "Outdated" },
    { word: "Placid", type: "Antonym", options: ["Turbulent", "Calm", "Peaceful", "Quiet"], answer: "Turbulent" },
    { word: "Quaint", type: "Synonym", options: ["Charming", "Ugly", "Modern", "Common"], answer: "Charming" },
    { word: "Robust", type: "Antonym", options: ["Frail", "Strong", "Sturdy", "Healthy"], answer: "Frail" },
    { word: "Superficial", type: "Synonym", options: ["Shallow", "Deep", "Thorough", "Profound"], answer: "Shallow" },
    { word: "Tangible", type: "Antonym", options: ["Abstract", "Real", "Solid", "Concrete"], answer: "Abstract" },
    { word: "Unique", type: "Synonym", options: ["Distinctive", "Common", "Ordinary", "Normal"], answer: "Distinctive" },
    { word: "Vital", type: "Antonym", options: ["Unimportant", "Crucial", "Essential", "Key"], answer: "Unimportant" },
  ],
  hard: [
    { word: "Ephemeral", type: "Synonym", options: ["Fleeting", "Permanent", "Eternal", "Endless"], answer: "Fleeting" },
    { word: "Cacophony", type: "Antonym", options: ["Harmony", "Noise", "Racket", "Din"], answer: "Harmony" },
    { word: "Sycophant", type: "Synonym", options: ["Flatterer", "Leader", "Rebel", "Critic"], answer: "Flatterer" },
    { word: "Enervate", type: "Antonym", options: ["Energize", "Exhaust", "Weaken", "Drain"], answer: "Energize" },
    { word: "Obfuscate", type: "Synonym", options: ["Confuse", "Clarify", "Explain", "Simplify"], answer: "Confuse" },
    { word: "Mellifluous", type: "Antonym", options: ["Harsh", "Smooth", "Sweet", "Musical"], answer: "Harsh" },
    { word: "Sagacious", type: "Synonym", options: ["Wise", "Foolish", "Stupid", "Ignorant"], answer: "Wise" },
    { word: "Pusillanimous", type: "Antonym", options: ["Brave", "Cowardly", "Timid", "Fearful"], answer: "Brave" },
    { word: "Alacrity", type: "Synonym", options: ["Eagerness", "Apathy", "Sluggishness", "Delay"], answer: "Eagerness" },
    { word: "Bellicose", type: "Antonym", options: ["Peaceful", "Hostile", "Aggressive", "Combative"], answer: "Peaceful" },
    { word: "Capricious", type: "Synonym", options: ["Fickle", "Stable", "Constant", "Reliable"], answer: "Fickle" },
    { word: "Defamation", type: "Antonym", options: ["Commendation", "Slander", "Libel", "Smear"], answer: "Commendation" },
    { word: "Ebullient", type: "Synonym", options: ["Exuberant", "Depressed", "Lethargic", "Sad"], answer: "Exuberant" },
    { word: "Fastidious", type: "Antonym", options: ["Sloppy", "Meticulous", "Punctilious", "Fussy"], answer: "Sloppy" },
    { word: "Garrulous", type: "Synonym", options: ["Loquacious", "Taciturn", "Silent", "Quiet"], answer: "Loquacious" },
    { word: "Hackneyed", type: "Antonym", options: ["Original", "Cliché", "Trite", "Banal"], answer: "Original" },
    { word: "Idiosyncrasy", type: "Synonym", options: ["Peculiarity", "Normality", "Standard", "Usual"], answer: "Peculiarity" },
    { word: "Juxtapose", type: "Antonym", options: ["Separate", "Compare", "Connect", "Pair"], answer: "Separate" },
    { word: "Knell", type: "Synonym", options: ["Toll", "Cheer", "Silence", "Whisper"], answer: "Toll" },
    { word: "Lachrymose", type: "Antonym", options: ["Joyful", "Tearful", "Sad", "Weeping"], answer: "Joyful" },
    { word: "Magnanimous", type: "Synonym", options: ["Generous", "Petty", "Selfish", "Mean"], answer: "Generous" },
    { word: "Nefarious", type: "Antonym", options: ["Virtuous", "Wicked", "Evil", "Sinister"], answer: "Virtuous" },
    { word: "Obdurate", type: "Synonym", options: ["Stubborn", "Yielding", "Flexible", "Soft"], answer: "Stubborn" },
    { word: "Palliate", type: "Antonym", options: ["Aggravate", "Soothe", "Alleviate", "Ease"], answer: "Aggravate" },
    { word: "Querulous", type: "Synonym", options: ["Petulant", "Content", "Happy", "Satisfied"], answer: "Petulant" },
    { word: "Reticent", type: "Antonym", options: ["Talkative", "Silent", "Reserved", "Quiet"], answer: "Talkative" },
    { word: "Scurrilous", type: "Synonym", options: ["Defamatory", "Polite", "Respectful", "Clean"], answer: "Defamatory" },
    { word: "Trenchant", type: "Antonym", options: ["Vague", "Incisive", "Sharp", "Keen"], answer: "Vague" },
    { word: "Ubiquitous", type: "Synonym", options: ["Omnipresent", "Rare", "Scarce", "Absent"], answer: "Omnipresent" },
    { word: "Vacillate", type: "Antonym", options: ["Decide", "Waver", "Hesitate", "Fluctuate"], answer: "Decide" },
  ]
};

export function MysticSynonymSpire() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questionPool, setQuestionPool] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<{ selected: string; correct: string } | null>(null);
  const [stairsBuilt, setStairsBuilt] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const startGame = (diff: Difficulty) => {
      setTotalRounds(diff === "easy" ? 10 : diff === "medium" ? 20 : 30);
      setCurrentRound(1);
      setScore(0);
      setStairsBuilt(0);
      setHistory([]);
      setIsGameOver(false);

      const pool = shuffleArray(englishQuestions[diff]).map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
      setQuestionPool(pool);
      setCurrentQ(pool[0]);
  };

  useEffect(() => {
    if (difficulty) {
      startGame(difficulty);
    }
  }, [difficulty]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(e => console.error(e));
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  const proceedToNextRound = (hItem: HistoryItem) => {
    setHistory(prev => [...prev, hItem]);
    setCurrentRound(prevRound => {
      if (prevRound >= totalRounds) {
        setIsGameOver(true);
        return prevRound;
      }
      setQuestionPool(prevPool => {
        const newPool = prevPool.slice(1);
        setCurrentQ(newPool[0]);
        return newPool;
      });
      return prevRound + 1;
    });
  };

  const handleOptionClick = (opt: string) => {
    if (wrongAnswer || !currentQ || isGameOver) return;

    if (opt === currentQ.answer) {
      setStairsBuilt(prev => prev + 1);
      setScore(s => s + 50);
      
      proceedToNextRound({
        questionDisplay: currentQ.word,
        type: currentQ.type,
        userAnswer: opt,
        correctAnswer: currentQ.answer,
        isCorrect: true
      });
    } else {
      setWrongAnswer({ selected: opt, correct: currentQ.answer });
    }
  };

  const closeWrongModal = () => {
    if (wrongAnswer && currentQ) {
      setStairsBuilt(Math.max(0, stairsBuilt - 1)); // Penalty: lose a stair
      proceedToNextRound({
        questionDisplay: currentQ.word,
        type: currentQ.type,
        userAnswer: wrongAnswer.selected,
        correctAnswer: currentQ.answer,
        isCorrect: false
      });
    }
    setWrongAnswer(null);
  };

  if (!difficulty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 bg-indigo-950 p-8 rounded-xl border border-purple-500/30">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] text-center">
          Mystic Synonym Spire
        </h1>
        <p className="text-purple-100/70 text-center max-w-md">
          Build a magical bridge by selecting the correct synonyms and antonyms. How high can you climb?
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button onClick={() => setDifficulty("easy")} className="bg-indigo-900 border border-purple-500 text-purple-300 hover:bg-purple-900 transition-all uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            Easy (10 Rnds)
          </Button>
          <Button onClick={() => setDifficulty("medium")} className="bg-indigo-900 border border-purple-500 text-purple-300 hover:bg-purple-900 transition-all uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            Medium (20 Rnds)
          </Button>
          <Button onClick={() => setDifficulty("hard")} className="bg-indigo-900 border border-purple-500 text-purple-300 hover:bg-purple-900 transition-all uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            Hard (30 Rnds)
          </Button>
        </div>
        <Link href="/games">
          <Button variant="ghost" className="text-indigo-400 hover:text-indigo-200">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative flex flex-col items-center w-full min-h-[70vh] bg-[#0b0c10] font-serif transition-all overflow-hidden ${isFullscreen ? 'h-screen overflow-y-auto' : 'rounded-xl border border-purple-500/30'}`}
    >
      {/* Magical Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(107,33,168,0.2),transparent_70%)] pointer-events-none" />
      
      {/* Floating particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_5px_#c084fc] pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-[#0b0c10]/80 backdrop-blur-sm border-b border-purple-500/20">
        <div className="flex items-center gap-4">
          {!isFullscreen && (
            <Button variant="ghost" size="icon" onClick={() => setDifficulty(null)} className="text-purple-500 hover:bg-indigo-900 hover:text-purple-300">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Badge variant="outline" className="text-purple-300 border-purple-500/50 uppercase tracking-widest">
            {difficulty}
          </Badge>
          {!isGameOver && (
            <span className="text-purple-300 font-bold tracking-widest">Round: {currentRound}/{totalRounds} | Score: {score}</span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-purple-500 hover:bg-indigo-900">
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>
      </div>

      {!isGameOver && (
        <>
          {/* Visual Tower/Stairs area */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-1/2 flex flex-col-reverse items-center justify-start pb-4 z-0 opacity-50">
             <AnimatePresence>
                {Array.from({ length: Math.min(stairsBuilt, 5) }).map((_, i) => (
                  <motion.div
                    key={stairsBuilt - i}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1 - (i * 0.15), y: 0, scale: 1 - (i * 0.05) }}
                    className="w-48 h-6 bg-gradient-to-r from-purple-800 to-indigo-800 border-t border-purple-400 rounded-sm mb-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  />
                ))}
             </AnimatePresence>
             {stairsBuilt > 5 && (
                <div className="w-48 h-6 bg-transparent border-t border-dashed border-purple-500/30 mb-2 flex justify-center items-center">
                  <Sparkles className="w-4 h-4 text-purple-500/50" />
                </div>
             )}
          </div>

          {/* Question Card */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mt-24 px-4">
            {currentQ && !wrongAnswer && (
              <motion.div
                key={currentQ.word}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                className="w-full bg-indigo-950/60 backdrop-blur-xl border border-purple-500/40 p-8 rounded-2xl shadow-[0_0_40px_rgba(107,33,168,0.4)] flex flex-col items-center"
              >
                <div className="flex items-center gap-2 mb-2 text-purple-300/80 uppercase tracking-[0.2em] text-sm">
                  <Flame className="w-4 h-4 text-pink-500" />
                  Find the {currentQ.type}
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-300 text-center mb-8 pb-2 drop-shadow-md">
                  {currentQ.word}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {currentQ.options.map((opt, i) => (
                    <Button
                      key={i}
                      onClick={() => handleOptionClick(opt)}
                      className="h-14 text-lg bg-indigo-900/40 border border-purple-500/30 text-purple-100 hover:bg-purple-600 hover:text-white hover:border-pink-400 transition-all shadow-md hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 flex flex-col items-center w-full max-w-3xl mt-16 p-4"
          >
            <Trophy className="w-20 h-20 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h2 className="text-4xl font-bold text-purple-300 mb-2">Spire Conquered!</h2>
            <p className="text-xl text-purple-200/70 mb-8">Final Score: {score} / {totalRounds * 50}</p>
            
            <Card className="w-full bg-[#0b0c10]/80 backdrop-blur-md border border-purple-500/30 p-6 shadow-xl max-h-[400px] overflow-y-auto custom-scrollbar">
              <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5" /> Ascension Log
              </h3>
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${h.isCorrect ? 'bg-indigo-900/30 border-purple-500/30' : 'bg-pink-900/30 border-pink-500/30'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div className="flex-1">
                      <p className="text-purple-200 font-medium mb-1">
                        Q{i + 1}: <span className="text-pink-400 uppercase text-xs mr-2">[{h.type}]</span> {h.questionDisplay}
                      </p>
                      <p className="text-sm text-purple-400/80">
                        Selected: <span className={h.isCorrect ? 'text-purple-300' : 'text-pink-400 line-through'}>{h.userAnswer}</span>
                      </p>
                    </div>
                    {!h.isCorrect && (
                      <div className="bg-[#0b0c10]/50 p-2 rounded px-4 text-center">
                        <p className="text-xs text-purple-500/70 uppercase">True Word</p>
                        <p className="text-purple-300 font-bold text-sm">{h.correctAnswer}</p>
                      </div>
                    )}
                    {h.isCorrect && <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-4 mt-8">
              <Button onClick={() => setDifficulty(null)} className="bg-indigo-950 border border-purple-500 text-purple-300 hover:bg-indigo-900 transition-all">
                Change Difficulty
              </Button>
              <Button onClick={() => startGame(difficulty!)} className="bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                Climb Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrong Answer Modal */}
      <AnimatePresence>
        {wrongAnswer && !isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0c10]/90 backdrop-blur-md p-4"
          >
            <Card className="p-8 max-w-md w-full bg-indigo-950 border-pink-500/50 shadow-[0_0_40px_rgba(236,72,153,0.3)] flex flex-col items-center text-center">
              <Flame className="w-16 h-16 text-pink-500 mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-pink-400 mb-2">The Magic Fades</h2>
              <p className="text-purple-200 mb-6 text-lg">
                You selected <span className="text-pink-400 font-semibold">{wrongAnswer.selected}</span>. <br/>
                The correct {currentQ?.type.toLowerCase()} is <span className="text-purple-300 font-bold">{wrongAnswer.correct}</span>.
              </p>
              <Button 
                onClick={closeWrongModal}
                className="w-full bg-indigo-900 border border-purple-700 hover:bg-purple-800 text-white"
              >
                Rebuild Bridge
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
