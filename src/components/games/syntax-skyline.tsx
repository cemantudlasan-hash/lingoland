"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Building2, Sparkles, Timer, Trophy, Repeat, Maximize, Minimize, Building, Landmark, Warehouse, Castle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

interface Sentence {
  parts: string[];
  correctOrder: string[];
  difficulty: "Simple" | "Compound" | "Complex";
}

const ALL_SENTENCES: Sentence[] = [
  { parts: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog."], correctOrder: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog."], difficulty: "Simple" },
  { parts: ["he", "Because", "was", "hungry,", "ate", "pizza.", "he"], correctOrder: ["Because", "he", "was", "hungry,", "he", "ate", "pizza."], difficulty: "Complex" },
  { parts: ["and", "She", "went", "to", "the", "park,", "played", "she", "football."], correctOrder: ["She", "went", "to", "the", "park,", "and", "she", "played", "football."], difficulty: "Compound" },
  { parts: ["Although", "it", "was", "raining,", "outside.", "they", "went"], correctOrder: ["Although", "it", "was", "raining,", "they", "went", "outside."], difficulty: "Complex" },
  { parts: ["wanted", "I", "to", "go,", "I", "but", "was", "too", "tired."], correctOrder: ["I", "wanted", "to", "go,", "but", "I", "was", "too", "tired."], difficulty: "Compound" },
  { parts: ["The", "sun", "is", "shining", "brightly", "today."], correctOrder: ["The", "sun", "is", "shining", "brightly", "today."], difficulty: "Simple" },
  { parts: ["When", "the", "bell", "rings,", "will", "leave.", "students", "the"], correctOrder: ["When", "the", "bell", "rings,", "the", "students", "will", "leave."], difficulty: "Complex" },
  { parts: ["He", "studied", "hard,", "failed", "the", "test.", "yet", "he"], correctOrder: ["He", "studied", "hard,", "yet", "he", "failed", "the", "test."], difficulty: "Compound" },
  { parts: ["If", "you", "study,", "will", "pass", "the", "exam.", "you"], correctOrder: ["If", "you", "study,", "you", "will", "pass", "the", "exam."], difficulty: "Complex" },
  { parts: ["She", "likes", "coffee,", "and", "he", "likes", "tea."], correctOrder: ["She", "likes", "coffee,", "and", "he", "likes", "tea."], difficulty: "Compound" },
  { parts: ["The", "tall", "building", "scraped", "the", "sky."], correctOrder: ["The", "tall", "building", "scraped", "the", "sky."], difficulty: "Simple" },
  { parts: ["Since", "it", "is", "late,", "should", "go", "to", "bed.", "we"], correctOrder: ["Since", "it", "is", "late,", "we", "should", "go", "to", "bed."], difficulty: "Complex" },
  { parts: ["I", "have", "a", "dog,", "and", "my", "sister", "has", "a", "cat."], correctOrder: ["I", "have", "a", "dog,", "and", "my", "sister", "has", "a", "cat."], difficulty: "Compound" },
  { parts: ["Unless", "you", "hurry,", "will", "miss", "the", "train.", "you"], correctOrder: ["Unless", "you", "hurry,", "you", "will", "miss", "the", "train."], difficulty: "Complex" },
  { parts: ["The", "birds", "are", "singing", "in", "the", "trees."], correctOrder: ["The", "birds", "are", "singing", "in", "the", "trees."], difficulty: "Simple" }
];

export function SyntaxSkyline({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "finished" | "instructions">("idle");
  const [currentSentenceIndex, setCurrentSentenceIndex] = React.useState(0);
  const [selectedWords, setSelectedWords] = React.useState<string[]>([]);
  const [buildings, setBuildings] = React.useState<string[]>([]);
  const [score, setScore] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const [sessionSentences, setSessionSentences] = React.useState<Sentence[]>(ALL_SENTENCES.slice(0, 5));
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    if (gameState === "idle") {
      const shuffled = [...ALL_SENTENCES].sort(() => Math.random() - 0.5).slice(0, 5);
      setSessionSentences(shuffled);
    }
  }, [gameState]);

  const currentSentence = sessionSentences[currentSentenceIndex];
  
  // Prevent crash if currentSentence is completely missing
  if (!currentSentence && gameState === "playing") return null;
  const availableWords = React.useMemo(() => {
    return currentSentence ? [...currentSentence.parts].sort(() => Math.random() - 0.5) : [];
  }, [currentSentenceIndex, currentSentence]);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleWordClick = (word: string, index: number) => {
    setSelectedWords(prev => [...prev, word]);
  };

  const removeWord = (index: number) => {
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
  };

  const checkSentence = () => {
    const isCorrect = JSON.stringify(selectedWords) === JSON.stringify(currentSentence.correctOrder);
    
    if (isCorrect) {
      setScore(prev => prev + (currentSentence.difficulty === "Simple" ? 100 : currentSentence.difficulty === "Compound" ? 200 : 300));
      setBuildings(prev => [...prev, currentSentence.difficulty]);
      toast({
        title: "Construction Complete!",
        description: "Your grammar was flawless. A new skyscraper has been added to the skyline.",
        className: "bg-indigo-600 text-white",
      });
      
      if (currentSentenceIndex < sessionSentences.length - 1) {
        setCurrentSentenceIndex(prev => prev + 1);
        setSelectedWords([]);
      } else {
        setGameState("finished");
        if (firestore && game) {
          logAnalyticsEvent(firestore, user?.uid || 'guest', {
            type: 'game_played',
            details: { slug: game.slug, title: game.title, score: score + 300 }
          });
        }
      }
    } else {
      toast({
        title: "Structural Failure",
        description: "The sentence structure is invalid. Please try again.",
        variant: "destructive",
      });
      setSelectedWords([]);
    }
  };

  const BuildingIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "Simple": return <Warehouse className="h-full w-full text-blue-400" />;
      case "Compound": return <Building className="h-full w-full text-purple-400" />;
      case "Complex": return <Landmark className="h-full w-full text-amber-400" />;
      default: return <Building2 className="h-full w-full text-indigo-400" />;
    }
  };

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 flex flex-col overflow-y-auto bg-slate-950 border-none",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[800px] shadow-2xl"
    )}>
      {/* Neon City Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-950 to-transparent opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e1b4b_0%,#020617_100%)]" />
        
        {/* Animated Grid Floor */}
        <div className="absolute inset-x-0 bottom-0 h-64 perspective-[1000px]">
            <motion.div 
                animate={{ backgroundPosition: '0 100%' }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[linear-gradient(rgba(71,85,105,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(71,85,105,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)] origin-bottom" 
            />
        </div>

        {/* Skyline Display */}
        <div className="absolute inset-x-0 bottom-32 h-64 flex items-end justify-center gap-2 px-12 overflow-hidden">
          <AnimatePresence>
            {buildings.map((type, i) => (
              <motion.div
                key={i}
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className={cn(
                    "w-12 md:w-16 flex-shrink-0 relative group",
                    type === "Simple" ? "h-24" : type === "Compound" ? "h-40" : "h-56"
                )}
              >
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-400/30 transition-all" />
                <BuildingIcon type={type} />
                <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <CardHeader className="z-10 bg-slate-900/60 backdrop-blur-xl border-b border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" asChild className="text-white/50 hover:text-white mr-2">
                <Link href="/games">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
             </Button>
             <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <Building2 className="text-white h-6 w-6" />
             </div>
             <div>
                <CardTitle className="text-2xl font-black text-white uppercase tracking-widest italic">Syntax Skyline</CardTitle>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-400/40">CITY LEVEL {buildings.length + 1}</Badge>
                    <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-400/40">{currentSentence?.difficulty || 'INIT'}</Badge>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Urban Score</p>
                <p className="text-3xl font-black text-indigo-400 tabular-nums">{score}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white" onClick={onToggleFullscreen}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-start pt-12 p-8 z-10 relative overflow-y-auto">
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="mt-20 text-center space-y-12"
            >
              <div className="relative">
                <motion.div 
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute inset-0 bg-indigo-500/20 blur-[150px] rounded-full scale-150"
                />
                <h2 className="text-8xl font-black text-white uppercase tracking-tighter leading-[0.75]">
                    Build the<br/><span className="text-indigo-500 italic">Future</span>
                </h2>
              </div>
              <p className="text-slate-400 max-w-sm mx-auto text-lg font-bold uppercase tracking-widest">
                Construct perfect syntax to expand the glowing neon metropolis.
              </p>
              <Button 
                onClick={() => setGameState('instructions')} 
                className="h-24 px-16 text-3xl font-black bg-white text-slate-950 hover:bg-indigo-500 hover:text-white rounded-[40px] shadow-[0_20px_60px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95 uppercase"
              >
                Launch Architect
              </Button>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="mt-10 bg-slate-900 shadow-2xl border border-white/10 p-16 rounded-[60px] max-w-2xl w-full"
            >
              <h3 className="text-4xl font-black text-white uppercase mb-10 italic underline underline-offset-8 decoration-indigo-500">The Blueprint</h3>
              <div className="space-y-8 text-xl text-slate-300 font-bold uppercase tracking-tight">
                <div className="flex gap-6 items-center">
                  <div className="h-12 w-12 bg-white text-slate-950 flex items-center justify-center rounded-2xl font-black shrink-0">01</div>
                  <p>Order the word shards to create grammatically correct sentences.</p>
                </div>
                <div className="flex gap-6 items-center">
                  <div className="h-12 w-12 bg-white text-slate-950 flex items-center justify-center rounded-2xl font-black shrink-0">02</div>
                  <p>Each success architecturalizes a new building in the skyline.</p>
                </div>
                <div className="flex gap-6 items-center">
                  <div className="h-12 w-12 bg-white text-slate-950 flex items-center justify-center rounded-2xl font-black shrink-0">03</div>
                  <p>Complex sentences create taller, more prestigious skyscrapers.</p>
                </div>
              </div>
              <Button onClick={() => setGameState('playing')} className="w-full mt-12 h-20 text-2xl font-black bg-indigo-600 text-white hover:bg-indigo-500 transition-all uppercase rounded-3xl shadow-xl shadow-indigo-900/20">
                Begin Construction
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && (
            <div className="w-full h-full flex flex-col items-center justify-between">
               {/* Selection Area */}
               <div className="w-full space-y-8">
                  <div className={cn(
                    "min-h-32 w-full p-8 bg-slate-900/40 backdrop-blur-md rounded-[40px] border-2 border-dashed border-white/10 flex flex-wrap gap-3 items-center justify-center transition-all",
                    selectedWords.length > 0 ? "border-indigo-500/30" : ""
                  )}>
                    {selectedWords.length === 0 && (
                        <p className="text-slate-500 font-black uppercase tracking-widest animate-pulse">Select shards to build sentence...</p>
                    )}
                    <AnimatePresence>
                        {selectedWords.map((word, i) => (
                            <motion.button
                                key={`${word}-${i}`}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                onClick={() => removeWord(i)}
                                className="px-6 py-3 bg-indigo-600 text-white text-xl font-black rounded-2xl shadow-lg shadow-indigo-900/40 hover:bg-red-500 transition-colors"
                            >
                                {word}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center py-8">
                    {availableWords.map((word, i) => {
                        const isUsed = selectedWords.filter(w => w === word).length >= currentSentence.parts.filter(w => w === word).length;
                        return (
                            <motion.button
                                key={`${word}-${i}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                disabled={isUsed}
                                onClick={() => handleWordClick(word, i)}
                                className={cn(
                                    "px-8 py-4 text-2xl font-black rounded-3xl transition-all border-2",
                                    isUsed 
                                        ? "bg-slate-900 text-slate-700 border-white/5 opacity-50 cursor-not-allowed" 
                                        : "bg-white/5 text-white border-white/10 hover:border-indigo-500 hover:bg-white/10"
                                )}
                            >
                                {word}
                            </motion.button>
                        );
                    })}
                  </div>
               </div>

               <div className="flex gap-4 mb-20">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedWords([])}
                    className="h-16 px-10 text-xl font-black border-white/10 text-white hover:bg-white/5 rounded-2xl uppercase"
                  >
                    Clear All
                  </Button>
                  <Button 
                    onClick={checkSentence}
                    disabled={selectedWords.length === 0}
                    className="h-16 px-20 text-xl font-black bg-indigo-600 text-white hover:bg-indigo-500 rounded-2xl uppercase shadow-2xl shadow-indigo-900/50"
                  >
                    Authorize Structure
                  </Button>
               </div>
            </div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-10"
            >
              <div className="relative mb-12">
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-indigo-500/30 blur-[100px] rounded-full"
                />
                <Trophy className="h-48 w-48 text-indigo-400 mx-auto relative drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]" />
              </div>
              <h2 className="text-8xl font-black text-white uppercase italic tracking-tighter mb-4">Metropolis Maxima</h2>
              <p className="text-indigo-400 text-2xl font-bold uppercase tracking-[0.4em] mb-16">The Skyline is Immortal</p>
              
              <div className="flex gap-6 justify-center">
                <div className="bg-slate-900/60 p-10 rounded-[40px] border border-white/10 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Final Infrastructure Score</p>
                    <p className="text-7xl font-black text-white tabular-nums">{score}</p>
                </div>
                <div className="bg-slate-900/60 p-10 rounded-[40px] border border-white/10 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Buildings Constructed</p>
                    <p className="text-7xl font-black text-indigo-400 tabular-nums">{buildings.length}</p>
                </div>
              </div>

              <div className="flex gap-6 mt-16 justify-center">
                <Button onClick={() => { setScore(0); setCurrentSentenceIndex(0); setSelectedWords([]); setBuildings([]); setGameState('idle'); }} className="h-20 px-16 text-2xl font-black bg-white text-slate-950 hover:bg-indigo-500 hover:text-white rounded-[32px] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                    <Repeat className="h-8 w-8 mr-4" /> Rebuild City
                </Button>
                <Button variant="outline" asChild className="h-20 px-16 text-2xl font-black border-white/10 text-white hover:bg-white/5 rounded-[32px] transition-all hover:scale-105 uppercase tracking-widest">
                    <Link href="/games">Command Center</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="z-10 bg-slate-950/80 backdrop-blur-md border-t border-white/5 py-6 flex justify-between items-center px-12">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_#6366f1]" />
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.6em]">Syntax Skyline // Neural Architect v4.0</span>
        </div>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            {currentSentenceIndex + 1} OF {sessionSentences.length} MODULES REMAINING
        </div>
      </CardFooter>
    </Card>
  );
}
