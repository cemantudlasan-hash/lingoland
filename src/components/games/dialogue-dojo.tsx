
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
    const checkFs = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    const customHandler = (e: any) => {
      if (e?.detail?.isFullscreen !== undefined) {
        setIsFullscreen(e.detail.isFullscreen);
      } else {
        checkFs();
      }
    };

    checkFs();
    document.addEventListener('fullscreenchange', checkFs);
    document.addEventListener('webkitfullscreenchange', checkFs);
    document.addEventListener('mozfullscreenchange', checkFs);
    document.addEventListener('MSFullscreenChange', checkFs);
    window.addEventListener('lingoland_fullscreen_change', customHandler);

    return () => {
      document.removeEventListener('fullscreenchange', checkFs);
      document.removeEventListener('webkitfullscreenchange', checkFs);
      document.removeEventListener('mozfullscreenchange', checkFs);
      document.removeEventListener('MSFullscreenChange', checkFs);
      window.removeEventListener('lingoland_fullscreen_change', customHandler);
    };
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
  const isPlaying = gameState === "playing" || gameState === "answered" || gameState === "loading";

  return (
    <Card className={cn(
        "w-full transition-all duration-300 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-start p-3 sm:p-5 md:p-8 overflow-y-auto" 
            : "max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      {/* Top Header: Compact HUD in fullscreen or during active gameplay; Standard banner on idle/instructions */}
      {isFullscreen || isPlaying ? (
        <div className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-foreground">
                  {game.title}
                </h2>
                <Badge variant="outline" className="text-[10px] sm:text-xs font-bold uppercase border-primary/40 text-primary px-2 py-0">
                  {difficulty}
                </Badge>
                {(gameState === 'playing' || gameState === 'answered') && (
                  <>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs font-bold px-2 py-0">
                      {category}
                    </Badge>
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] sm:text-xs px-2 py-0">
                      Round {currentRound} of {maxRounds}
                    </Badge>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-500 font-black text-[10px] sm:text-xs px-2 py-0">
                      Score: {score}/{currentRound - (gameState === 'playing' ? 1 : 0)}
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground hidden md:block">
                {game.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(gameState === 'playing' || gameState === 'answered') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGameState('selecting_category')}
                className="text-xs h-8 sm:h-9 px-2.5 sm:px-3 text-muted-foreground hover:text-foreground"
              >
                <span className="hidden sm:inline">Switch</span> Category
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-2.5 sm:px-3 gap-1.5 font-bold text-xs"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
              <span className="uppercase">{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
            </Button>
          </div>
        </div>
      ) : (
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
          <div className="flex justify-center mb-4">
            <Icon className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="font-black tracking-tight uppercase text-3xl md:text-4xl">{game.title}</CardTitle>
          <CardDescription className="text-base md:text-lg max-w-xl mx-auto">{game.description}</CardDescription>
          <div className="flex justify-center pt-2 gap-2 flex-wrap">
            <Badge variant="outline">{difficulty.toUpperCase()}</Badge>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(
          "w-full max-w-4xl mx-auto flex flex-col items-center justify-start flex-1 gap-5",
          isFullscreen ? "p-0 pt-2" : "p-4 sm:p-6 pt-0 min-h-[20rem]"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Master the art of conversation with AI.</p>
            <Button onClick={() => setGameState('instructions')} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl rounded-2xl h-14 px-8 text-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Enter Dojo
            </Button>
          </div>
        )}

        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/40 shadow-inner p-6 sm:p-8 max-w-xl w-full">
                <h3 className="font-bold text-center text-xl sm:text-2xl mb-2">How to Play</h3>
                <div className="text-left space-y-3 text-sm sm:text-base text-muted-foreground">
                    <p>1. Choose a conversational category that you want to practice.</p>
                    <p>2. A scenario will be presented with a character speaking to you.</p>
                    <p>3. Choose the <strong className="text-foreground">most natural, polite, and accurate</strong> response from the options.</p>
                    <p>4. Learn from the explanations provided for each choice!</p>
                </div>
                <div className="w-full flex flex-col items-center gap-2 mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Set Skill Tier</p>
                    <div className="flex gap-2">
                        {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                            <Button key={lvl} variant={difficulty === lvl ? "default" : "outline"} size="sm" onClick={() => setDifficulty(lvl as SkillLevel)} className="uppercase font-black text-[10px]">{lvl}</Button>
                        ))}
                    </div>
                </div>
                <div className="w-full flex flex-col items-center gap-2 mt-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Set Game Rounds</p>
                    <div className="flex gap-2">
                        {[10, 20, 30].map((rounds) => (
                            <Button key={rounds} variant={maxRounds === rounds ? "default" : "outline"} size="sm" onClick={() => setMaxRounds(rounds)} className="uppercase font-black text-[10px]">{rounds} Rounds</Button>
                        ))}
                    </div>
                </div>
                <Button onClick={() => setGameState('selecting_category')} size="lg" className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl shadow-lg h-12 px-8">Choose Category</Button>
            </div>
        )}

        {gameState === "selecting_category" && (
             <div className="flex flex-col items-center gap-6 w-full max-w-4xl py-4">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs sm:text-sm">Select Mission Sector</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 w-full">
                    {CATEGORIES.map((cat) => (
                        <Button 
                            key={cat.value} 
                            onClick={() => handleStartGame(cat.value)} 
                            variant="outline" 
                            className="h-auto flex flex-col gap-3 py-5 sm:py-6 rounded-2xl border-2 transition-all shadow-md font-black uppercase tracking-wider text-xs hover:border-primary hover:bg-primary/10 hover:scale-105"
                        >
                            <cat.icon className="h-7 w-7 text-primary" />
                            {cat.label}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-5 py-16">
            <Loader2 className="animate-spin text-primary h-12 w-12 sm:h-16 sm:w-16" />
            <p className="text-muted-foreground font-medium animate-pulse text-base sm:text-lg">Synthesizing realistic scenario...</p>
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && challenge && (
          <div className="space-y-5 w-full max-w-4xl animate-in fade-in duration-300">
            {/* Scenario Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-primary/5 border-2 border-primary/20 text-left italic font-medium w-full text-sm sm:text-base md:text-lg shadow-sm">
                <Badge className="mb-2 uppercase text-[10px] sm:text-xs">Scenario</Badge>
                <p className="leading-relaxed">"{challenge.scenario}"</p>
            </div>

            {/* Character Speech Bubble */}
            <div className="flex flex-col gap-4 items-start w-full">
                <div className="flex items-start sm:items-end gap-3 sm:gap-4 w-full max-w-3xl">
                    <div className="flex-shrink-0 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary w-10 h-10 sm:w-12 sm:h-12 mt-1 sm:mt-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="relative bg-card p-4 sm:p-6 rounded-2xl rounded-tl-none sm:rounded-tl-2xl sm:rounded-bl-none shadow-xl border-2 border-border/50 text-left flex-grow">
                        <p className="font-black text-primary uppercase text-[10px] sm:text-xs tracking-widest mb-1">{challenge.characterName}</p>
                        <p className="font-bold text-base sm:text-lg md:text-xl leading-snug">"{challenge.characterLine}"</p>
                    </div>
                </div>
            </div>

            {/* Response Options */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full mt-2">
              {challenge.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                      gameState === 'answered' 
                        ? (option.isCorrect ? 'secondary' : (selectedOptionIndex === index ? 'destructive' : 'outline')) 
                        : (selectedOptionIndex === index ? 'default' : 'outline')
                  }
                  className={cn(
                    "h-auto whitespace-normal justify-start text-left transition-all duration-200 shadow-md py-3.5 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-semibold rounded-xl border-2 leading-snug",
                    { "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-900/30": gameState === 'answered' && option.isCorrect }
                  )}
                  onClick={() => gameState === 'playing' && handleCheckAnswer(index)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option.isCorrect && <Check className="mr-3 h-5 w-5 shrink-0 text-white" />}
                  {gameState === 'answered' && !option.isCorrect && selectedOptionIndex === index && <X className="mr-3 h-5 w-5 shrink-0 text-destructive-foreground" />}
                  <span className="flex-1">{option.text}</span>
                </Button>
              ))}
            </div>

            {/* Answer Feedback Alert Box with Integrated Next Scenario Action */}
            {gameState === 'answered' && selectedOptionIndex !== null && (
                 <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                     "border-2 rounded-2xl shadow-xl text-left w-full p-4 sm:p-6 mt-4 transition-all duration-300",
                     isCorrect ? "bg-emerald-950/40 border-emerald-500/50 text-foreground" : "bg-red-950/40 border-red-500/50 text-foreground"
                 )}>
                    {isCorrect ? <Sparkles className="text-emerald-400 h-5 w-5 sm:h-6 sm:w-6" /> : <X className="text-red-400 h-5 w-5 sm:h-6 sm:w-6" />}
                    <div className="pl-2 sm:pl-3 w-full">
                      <AlertTitle className="font-black tracking-tight uppercase text-base sm:text-lg mb-1.5">
                          {isCorrect ? "PERFECT RESPONSE!" : "ANALYSIS"}
                      </AlertTitle>
                      <AlertDescription className="text-sm sm:text-base leading-relaxed opacity-90">
                         {challenge.options[selectedOptionIndex].explanation}
                      </AlertDescription>
                      
                      {/* Integrated Action Row: NEVER collides with or blocks bottom buttons */}
                      <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-muted-foreground">
                          {isCorrect ? "✨ Great job! Ready for the next round?" : "💡 Learn from this feedback and try the next one!"}
                        </div>
                        {currentRound < maxRounds ? (
                          <Button 
                            onClick={() => handleStartGame(category)} 
                            size="default" 
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black shadow-lg rounded-xl h-10 px-5 gap-2 transition-all hover:scale-105 active:scale-95"
                          >
                            <Repeat className="h-4 w-4" />
                            <span>Next Scenario</span>
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleEndGame} 
                            size="default" 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black shadow-lg rounded-xl h-10 px-5 gap-2 transition-all hover:scale-105 active:scale-95"
                          >
                            <Trophy className="h-4 w-4" />
                            <span>Finish Game</span>
                          </Button>
                        )}
                      </div>
                    </div>
                </Alert>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className={cn(
        "flex flex-wrap justify-between items-center gap-3 pt-6 w-full max-w-4xl mx-auto shrink-0",
        isFullscreen ? "p-0 pt-6 pb-12" : "p-4 sm:p-6 pt-4"
      )}>
        <Button variant="outline" asChild size="default" className="rounded-xl font-bold text-xs sm:text-sm h-9 sm:h-10">
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
            {(gameState === 'playing' || gameState === 'answered' || gameState === 'selecting_category') && (
              <>
                <Button variant="ghost" onClick={handleClearHistory} size="sm" className="rounded-xl font-bold text-xs h-9 text-muted-foreground hover:text-foreground">
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5"/> Clear History
                </Button>
                <Button variant="secondary" onClick={() => setGameState('selecting_category')} size="sm" className="rounded-xl font-bold text-xs h-9">
                    Switch Category
                </Button>
              </>
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
