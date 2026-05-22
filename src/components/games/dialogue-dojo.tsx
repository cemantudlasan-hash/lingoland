
"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { generateConversationChallenge } from "@/ai/flows/generate-conversation-challenge";
import type { GenerateConversationChallengeOutput } from "@/ai/flows/schemas/conversation-schema";
import { Loader2, Sparkles, Check, X, Repeat, Maximize, Minimize, User, Utensils, Plane, Briefcase, GraduationCap, Users, HeartPulse, RotateCcw, ShoppingBag, Home, Bike, Laptop, Coins, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent, getDailyBonusGame } from "@/lib/analytics";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions" | "selecting_category";

const CATEGORIES = [
    { label: "Restaurant", icon: Utensils, value: "Restaurant" },
    { label: "Travel", icon: Plane, value: "Travel" },
    { label: "Work", icon: Briefcase, value: "Work" },
    { label: "School", icon: GraduationCap, value: "School" },
    { label: "Social", icon: Users, value: "Social" },
    { label: "Health", icon: HeartPulse, value: "Emergency" },
    { label: "Shopping", icon: ShoppingBag, value: "Shopping" },
    { label: "Family", icon: Home, value: "Family" },
    { label: "Hobbies", icon: Bike, value: "Hobbies" },
    { label: "Tech", icon: Laptop, value: "Technology" },
] as const;

const HISTORY_KEY = 'lingoland_dialogue_dojo_used_scenarios';

export function DialogueDojo({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [challenge, setChallenge] = React.useState<GenerateConversationChallengeOutput | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = React.useState<number | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [usedScenarios, setUsedScenarios] = React.useState<string[]>([]);
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("intermediate");
  const [category, setCategory] = React.useState<typeof CATEGORIES[number]['value']>("Social");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { user } = useAuth();
  const firestore = useFirestore();

  const [maxRounds, setMaxRounds] = React.useState<number>(10);
  const [currentRound, setCurrentRound] = React.useState<number>(0);
  const [score, setScore] = React.useState<number>(0);
  const [showGameOver, setShowGameOver] = React.useState<boolean>(false);
  const [earnedCoins, setEarnedCoins] = React.useState<number>(0);
  const [isDailyBonus, setIsDailyBonus] = React.useState<boolean>(false);
  const [dailyBonusAmount, setDailyBonusAmount] = React.useState<number>(0);
  const [lastClaimedDate, setLastClaimedDate] = React.useState<string | null>(null);
  
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  React.useEffect(() => {
    const fetchClaimedDate = async () => {
      if (!firestore || !user) {
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('lingoland_guest_pet');
          if (local) {
            try {
              const parsed = JSON.parse(local);
              setLastClaimedDate(parsed.lastDailyBonusClaimedDate || null);
            } catch (e) {}
          }
        }
        return;
      }
      try {
        const petRef = doc(firestore, 'user_pets', user.uid);
        const docSnap = await getDoc(petRef);
        if (docSnap.exists()) {
          setLastClaimedDate(docSnap.data().lastDailyBonusClaimedDate || null);
        }
      } catch (e) {
        console.error("Error fetching pet claimed date:", e);
      }
    };
    if (gameState === "playing" || gameState === "instructions") {
      fetchClaimedDate();
    }
  }, [user, firestore, gameState]);

  // Load history on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setUsedScenarios(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load scenario history", e);
    }
  }, []);

  // Save history (limited to last 50 to avoid prompt bloat)
  React.useEffect(() => {
    if (usedScenarios.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(usedScenarios.slice(-50)));
    }
  }, [usedScenarios]);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async (selectedCategory: typeof category) => {
    setCategory(selectedCategory);
    setGameState("loading");
    setChallenge(null);
    setSelectedOptionIndex(null);
    setIsCorrect(null);
    try {
      const result = await generateConversationChallenge({
        difficulty: difficulty,
        category: selectedCategory,
        usedScenarios: usedScenarios,
      });
      setChallenge({
        ...result,
        options: shuffleArray([...result.options])
      });
      setUsedScenarios(prev => [...prev, result.scenario]);
      
      if (currentRound === 0 || gameState === "selecting_category") {
        setCurrentRound(1);
        setScore(0);
      } else {
        setCurrentRound(prev => prev + 1);
      }
      
      setGameState("playing");
    } catch (error) {
      console.error("Failed to generate challenge:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new mission. Please try again.",
      });
      setGameState("selecting_category");
    }
  };

  const handleCheckAnswer = (index: number) => {
    if (!challenge) return;
    setSelectedOptionIndex(index);
    const correct = challenge.options[index].isCorrect;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
    setGameState("answered");
  };

  const handleClearHistory = () => {
    setUsedScenarios([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({
      title: "History Cleared",
      description: "You can now experience previous scenarios again.",
    });
  };

  const handleEndGame = async () => {
    const today = new Date();
    const todayUTC = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
    const { slug: bonusSlug, bonusAmount } = getDailyBonusGame();
    
    const isBonus = slug === bonusSlug;
    const isBonusAvailable = isBonus && lastClaimedDate !== todayUTC;
    const extraCoins = isBonusAvailable ? bonusAmount : 0;
    const totalEarnedCoins = 10 + extraCoins;

    setIsDailyBonus(isBonusAvailable);
    setDailyBonusAmount(bonusAmount);
    setEarnedCoins(totalEarnedCoins);

    if (firestore && user) {
      logAnalyticsEvent(firestore, user.uid, {
        type: 'game_played',
        details: {
          slug: slug,
          title: game.title,
          score: score,
          totalQuestions: maxRounds
        }
      });
    } else {
      if (typeof window !== 'undefined') {
        const petKey = 'lingoland_guest_pet';
        const petRaw = localStorage.getItem(petKey);
        if (petRaw) {
          try {
            const pet = JSON.parse(petRaw);
            pet.coins = parseFloat(((pet.coins || 0) + totalEarnedCoins).toFixed(2));
            pet.xp = (pet.xp || 0) + 100;
            pet.energy = Math.min(100, (pet.energy || 100) + 10);
            pet.intelligence = Math.min(100, (pet.intelligence || 50) + 15);
            pet.lastActive = new Date().toISOString();
            
            if (isBonusAvailable) {
              pet.lastDailyBonusClaimedDate = todayUTC;
            }

            let xpNeeded = pet.level * 500;
            if (pet.xp >= xpNeeded) {
              pet.xp -= xpNeeded;
              pet.level += 1;
            }
            localStorage.setItem(petKey, JSON.stringify(pet));
          } catch (e) {
            console.error("Failed to update guest pet manually:", e);
          }
        }
      }
    }

    setShowGameOver(true);
  };

  const handleRestartGame = () => {
    setCurrentRound(0);
    setScore(0);
    setShowGameOver(false);
    setGameState("selecting_category");
  };

  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      <CardHeader className="text-center relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && (
            <div className="flex justify-center mb-4">
                <Icon className="w-16 h-16 text-primary" />
            </div>
        )}
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-6xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen && "text-2xl mt-2")}>{game.description}</CardDescription>
        <div className="flex justify-center pt-2 gap-2 flex-wrap">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty.toUpperCase()}</Badge>
            {(gameState === 'playing' || gameState === 'answered') && (
              <>
                <Badge variant="secondary" className={cn(isFullscreen && "text-xl px-6 py-1")}>{category.toUpperCase()}</Badge>
                <Badge className={cn("bg-indigo-600 hover:bg-indigo-700 text-white font-black", isFullscreen && "text-xl px-6 py-1")}>ROUND {currentRound} OF {maxRounds}</Badge>
                <Badge variant="outline" className={cn("border-amber-500/50 text-amber-500 font-black", isFullscreen && "text-xl px-6 py-1")}>SCORE: {score}/{currentRound - (gameState === 'playing' ? 1 : 0)}</Badge>
              </>
            )}
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-7xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Master the art of conversation with AI.</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Enter Dojo
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Choose a conversational category that you want to practice.</p>
                    <p>2. A scenario will be presented with a character speaking to you.</p>
                    <p>3. Choose the <strong>most natural, polite, and accurate</strong> response from the options.</p>
                    <p>4. Learn from the explanations provided for each choice!</p>
                </div>
                <div className="w-full flex flex-col items-center gap-2 mt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Set Skill Tier</p>
                    <div className="flex gap-2">
                        {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                            <Button key={lvl} variant={difficulty === lvl ? "default" : "outline"} size="sm" onClick={() => setDifficulty(lvl as SkillLevel)} className="uppercase font-black text-[10px]">{lvl}</Button>
                        ))}
                    </div>
                </div>
                <div className="w-full flex flex-col items-center gap-2 mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Set Game Rounds</p>
                    <div className="flex gap-2">
                        {[10, 20, 30].map((rounds) => (
                            <Button key={rounds} variant={maxRounds === rounds ? "default" : "outline"} size="sm" onClick={() => setMaxRounds(rounds)} className="uppercase font-black text-[10px]">{rounds} Rounds</Button>
                        ))}
                    </div>
                </div>
                <Button onClick={() => setGameState('selecting_category')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Choose Category</Button>
            </div>
        )}

        {gameState === "selecting_category" && (
             <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Select Mission Sector</p>
                <div className={cn("grid grid-cols-2 md:grid-cols-5 gap-4 w-full", isFullscreen && "gap-8")}>
                    {CATEGORIES.map((cat) => (
                        <Button 
                            key={cat.value} 
                            onClick={() => handleStartGame(cat.value)} 
                            variant="outline" 
                            className={cn(
                                "h-auto flex flex-col gap-4 py-8 rounded-3xl border-4 transition-all shadow-xl font-black uppercase tracking-widest hover:border-primary hover:bg-primary/10 hover:scale-105",
                                isFullscreen ? "text-xl" : "text-[10px]"
                            )}
                        >
                            <cat.icon className={cn(isFullscreen ? "h-12 w-12" : "h-8 w-8")} />
                            {cat.label}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground font-medium animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Synthesizing realistic scenario...</p>
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && challenge && (
          <div className="space-y-8 w-full max-w-5xl animate-in fade-in duration-500">
            <div className={cn(
                "p-6 rounded-3xl bg-primary/5 border-2 border-primary/20 text-left italic font-medium",
                isFullscreen ? "text-3xl p-10" : "text-lg"
            )}>
                <Badge className="mb-2 uppercase">Scenario</Badge>
                <p>"{challenge.scenario}"</p>
            </div>

            <div className="flex flex-col gap-6 items-start">
                <div className="flex items-end gap-4 w-full max-w-3xl">
                    <div className={cn("flex-shrink-0 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary", isFullscreen ? "w-20 h-20" : "w-12 h-12")}>
                        <User className={cn(isFullscreen ? "w-12 h-12" : "w-6 w-6")} />
                    </div>
                    <div className={cn(
                        "relative bg-card p-6 rounded-3xl rounded-bl-none shadow-xl border-2 border-border/50 text-left flex-grow",
                        isFullscreen ? "p-10" : ""
                    )}>
                        <p className={cn("font-black text-primary uppercase text-xs tracking-widest mb-2", isFullscreen && "text-xl")}>{challenge.characterName}</p>
                        <p className={cn("font-bold leading-tight", isFullscreen ? "text-4xl" : "text-xl")}>"{challenge.characterLine}"</p>
                    </div>
                </div>
            </div>

            <div className={cn("grid grid-cols-1 gap-4 mt-8", isFullscreen && "gap-6")}>
              {challenge.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                      gameState === 'answered' 
                        ? (option.isCorrect ? 'secondary' : (selectedOptionIndex === index ? 'destructive' : 'outline')) 
                        : (selectedOptionIndex === index ? 'default' : 'outline')
                  }
                  className={cn(
                    "h-auto whitespace-normal justify-start text-left transition-all duration-300 shadow-lg",
                    isFullscreen ? "py-8 px-10 text-3xl font-bold rounded-2xl border-4" : "py-4 px-6 font-bold border-2",
                    { "bg-green-500 hover:bg-green-600 text-white border-green-400": gameState === 'answered' && option.isCorrect }
                  )}
                  onClick={() => gameState === 'playing' && handleCheckAnswer(index)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option.isCorrect && <Check className={cn("mr-4", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />}
                  {gameState === 'answered' && !option.isCorrect && selectedOptionIndex === index && <X className={cn("mr-4", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />}
                  {option.text}
                </Button>
              ))}
            </div>

            {gameState === 'answered' && selectedOptionIndex !== null && (
                 <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                     "border-4 rounded-3xl shadow-2xl text-left",
                     isFullscreen ? "p-12 mt-12" : "mt-8",
                     isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                 )}>
                    {isCorrect ? <Sparkles className={cn("text-primary", isFullscreen ? "h-12 w-12" : "h-6 w-6")} /> : <X className={cn("text-primary", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                    <AlertTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>
                        {isCorrect ? "PERFECT RESPONSE!" : "ANALYSIS"}
                    </AlertTitle>
                    <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                       {challenge.options[selectedOptionIndex].explanation}
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-7xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'answered' && (
              currentRound < maxRounds ? (
                <Button onClick={() => handleStartGame(category)} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
                  <Repeat className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />Next Scenario
                </Button>
              ) : (
                <Button onClick={handleEndGame} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
                  <Trophy className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />Finish Game
                </Button>
              )
            )}
            {(gameState === 'playing' || gameState === 'answered' || gameState === 'selecting_category') && (
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleClearHistory} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
                        <RotateCcw className="mr-2 h-4 w-4"/> Clear History
                    </Button>
                    <Button variant="secondary" onClick={() => setGameState('selecting_category')} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Switch Category</Button>
                </div>
            )}
        </div>
      </CardFooter>
      <AnimatePresence>
        {showGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card/95 border-2 border-primary/30 max-w-lg w-full rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Animated sparkles background effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
              
              <div className="bg-primary/10 p-6 rounded-full border-4 border-primary mb-6 animate-bounce">
                <Trophy className="h-16 w-16 text-primary" />
              </div>

              <h2 className="text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                Dojo Training Complete!
              </h2>
              
              <p className="text-muted-foreground font-bold mb-6">
                You successfully completed {maxRounds} rounds of conversational English.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mb-8 bg-muted/30 p-6 rounded-3xl border border-border/20">
                <div className="flex flex-col items-center">
                  <span className="text-xs uppercase font-black text-muted-foreground tracking-wider">Score</span>
                  <span className="text-2xl font-black text-foreground">{score} / {maxRounds}</span>
                </div>
                <div className="flex flex-col items-center border-l border-border/50">
                  <span className="text-xs uppercase font-black text-muted-foreground tracking-wider flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-500" /> Coins Earned
                  </span>
                  <span className="text-2xl font-black text-amber-400">+{earnedCoins.toFixed(2)}</span>
                </div>
              </div>

              {isDailyBonus ? (
                <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-4 mb-8 w-full">
                  <p className="text-amber-500 font-black text-xs uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-spin" /> Daily Bonus Applied!
                  </p>
                  <p className="text-sm font-semibold text-foreground/90 leading-snug">
                    Daily coins received with the amount of coins transferred to the Lingo-Pet tab. :)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Base: +10.00 | Daily Match Bonus: +{dailyBonusAmount.toFixed(2)})
                  </p>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-4 mb-8 w-full">
                  <p className="text-primary font-black text-xs uppercase tracking-widest mb-1">
                    Reward Transferred!
                  </p>
                  <p className="text-sm font-semibold text-foreground/90">
                    10.00 Lingo-Coins have been automatically transferred to your Lingo-Pet!
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={handleRestartGame} 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Play Again
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  className="flex-1 h-12 rounded-2xl border-2 font-bold"
                >
                  <Link href="/games">Exit to Library</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
