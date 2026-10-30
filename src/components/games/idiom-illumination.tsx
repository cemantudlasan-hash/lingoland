
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
import {
  generateIdiomExercise,
  type GenerateIdiomExerciseOutput,
} from "@/ai/flows/generate-idiom-exercise";
import { Loader2, Sparkles, Check, X, ThumbsUp, Repeat, Maximize, Minimize, Trophy, Star, Zap, ArrowLeft, XOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions" | "finished";

const TOTAL_ROUNDS = 10;

const DIFFICULTY_SCHEDULE: SkillLevel[] = [
  'beginner', 'beginner', 'beginner',
  'intermediate', 'intermediate', 'intermediate', 'intermediate',
  'advanced', 'advanced', 'advanced',
];

export function IdiomIllumination({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<GenerateIdiomExerciseOutput | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [usedIdioms, setUsedIdioms] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [roundResults, setRoundResults] = React.useState<{ idiom: string; correct: boolean; difficulty: SkillLevel }[]>([]);
  
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const currentDifficulty = DIFFICULTY_SCHEDULE[currentRound] || 'advanced';

  const currentDifficultyBadgeColor =
    currentDifficulty === 'beginner'
      ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
      : currentDifficulty === 'intermediate'
      ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
      : 'border-rose-500/50 text-rose-400 bg-rose-500/10';

  const handleAbortGame = () => {
    setGameState("idle");
    setExercise(null);
    setSelectedOption(null);
    setIsCorrect(null);
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
  };

  const loadNextRound = async () => {
    setGameState("loading");
    setExercise(null);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const newExercise = await generateIdiomExercise({ difficulty: currentDifficulty, usedIdioms });
      setExercise({
        ...newExercise,
        options: shuffleArray([...newExercise.options])
      });
      setUsedIdioms(prev => [...prev, newExercise.idiom]);
      setGameState("playing");
    } catch (error) {
      console.error("Failed to generate exercise:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the next round. Please try again.",
      });
      setGameState("idle");
    }
  };

  const handleStartGame = () => {
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRoundResults([]);
    setUsedIdioms([]);
    loadNextRound();
  };

  const handleCheckAnswer = () => {
    if (!exercise || !selectedOption) return;
    const correct = selectedOption === exercise.meaning;
    setIsCorrect(correct);
    setGameState("answered");

    const difficultyMultiplier = currentDifficulty === 'beginner' ? 1 : currentDifficulty === 'intermediate' ? 2 : 3;
    
    if (correct) {
      const pointsEarned = 100 * difficultyMultiplier;
      setScore(prev => prev + pointsEarned);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(best => Math.max(best, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setRoundResults(prev => [...prev, {
      idiom: exercise.idiom,
      correct,
      difficulty: currentDifficulty,
    }]);
  };

  const handleNextRound = () => {
    const nextRound = currentRound + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      setGameState("finished");
      return;
    }
    setCurrentRound(nextRound);
    // Need to manually call loadNextRound with updated round
    setGameState("loading");
    setExercise(null);
    setSelectedOption(null);
    setIsCorrect(null);
    
    const nextDifficulty = DIFFICULTY_SCHEDULE[nextRound] || 'advanced';
    generateIdiomExercise({ difficulty: nextDifficulty, usedIdioms }).then(newExercise => {
      setExercise({
        ...newExercise,
        options: shuffleArray([...newExercise.options])
      });
      setUsedIdioms(prev => [...prev, newExercise.idiom]);
      setGameState("playing");
    }).catch(error => {
      console.error("Failed to generate exercise:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the next round. Please try again.",
      });
      setGameState("idle");
    });
  };

  const getButtonVariant = (option: string) => {
    if (gameState !== "answered") {
      return selectedOption === option ? "default" : "outline";
    }
    if (option === exercise?.meaning) {
      return "secondary";
    }
    if (option === selectedOption) {
      return "destructive";
    }
    return "outline";
  };

  const getGrade = () => {
    const correctCount = roundResults.filter(r => r.correct).length;
    const pct = (correctCount / TOTAL_ROUNDS) * 100;
    if (pct >= 90) return { grade: 'S', color: 'text-amber-400', label: 'LEGENDARY' };
    if (pct >= 80) return { grade: 'A', color: 'text-emerald-400', label: 'EXCELLENT' };
    if (pct >= 70) return { grade: 'B', color: 'text-blue-400', label: 'GREAT' };
    if (pct >= 60) return { grade: 'C', color: 'text-purple-400', label: 'GOOD' };
    if (pct >= 50) return { grade: 'D', color: 'text-orange-400', label: 'FAIR' };
    return { grade: 'F', color: 'text-red-400', label: 'KEEP TRYING' };
  };
  
  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col overflow-y-auto overflow-x-hidden justify-between",
        isFullscreen 
            ? "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none bg-background p-2 sm:p-6" 
            : "flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full bg-card/80 backdrop-blur-sm border-border/20 shadow-lg rounded-2xl md:rounded-3xl"
      )}>
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-border/20 bg-muted/20 shrink-0">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4" /> Games
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {(gameState === "playing" || gameState === "loading" || gameState === "answered") && (
            <Button variant="outline" size="sm" onClick={handleAbortGame} className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-8 font-bold">
              <XOctagon className="h-3.5 w-3.5" /> Abort Game
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
        </div>
      </div>

      <CardHeader className="text-center relative p-3 sm:p-6 shrink-0">
        <div className="flex justify-center mb-1 sm:mb-2">
          <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
        </div>
        <CardTitle className="font-black tracking-tight uppercase text-lg sm:text-2xl md:text-3xl">{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1 max-w-xl mx-auto">{game.description}</CardDescription>
        {gameState !== 'idle' && gameState !== 'instructions' && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className={cn("text-xs font-black uppercase", currentDifficultyBadgeColor)}>
              {DIFFICULTY_SCHEDULE[currentRound]}
            </Badge>
            <Badge variant="secondary" className="text-xs uppercase">
              Round {currentRound + 1}/{TOTAL_ROUNDS}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 text-center flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto p-3 sm:p-6 overflow-y-auto">
        {/* Round & Score HUD */}
        {(gameState === 'playing' || gameState === 'answered' || gameState === 'loading') && (
          <div className="w-full flex items-center justify-between gap-2 sm:gap-4 bg-muted/30 rounded-xl sm:rounded-2xl border border-border/20 shadow-inner p-2.5 sm:p-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 font-black uppercase tracking-wider text-muted-foreground">
              <Zap className="text-amber-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Round {currentRound + 1}/{TOTAL_ROUNDS}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {streak > 1 && (
                <div className="flex items-center gap-1 text-orange-400 font-black animate-pulse text-xs sm:text-sm">
                  🔥 {streak}x
                </div>
              )}
              <div className="flex items-center gap-1 font-black text-primary text-xs sm:text-sm">
                <Star className="fill-primary h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {score} pts
              </div>
            </div>
          </div>
        )}

        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6 text-center my-auto w-full max-w-3xl">
            {/* Idiom Telemetry Pods */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full text-left">
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-primary/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Idiom Bank</span>
                <span className="text-xs sm:text-sm font-black text-foreground">Adaptive AI Deck</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-cyan-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Session Size</span>
                <span className="text-xs sm:text-sm font-black text-cyan-300">10 Challenges</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-purple-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Streak Bonus</span>
                <span className="text-xs sm:text-sm font-black text-purple-300">Combo Multiplier</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-amber-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mb-1" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Tier Curve</span>
                <span className="text-xs sm:text-sm font-black text-amber-300">Beg → Adv</span>
              </div>
            </div>

            <p className="text-muted-foreground text-xs sm:text-base max-w-md">
              Demystify figurative phrases and colloquial expressions through smart contextual deductions.
            </p>

            <Button onClick={() => setGameState('instructions')} className="h-11 sm:h-14 px-6 sm:px-12 text-sm sm:text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black rounded-xl">
              <Sparkles className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              Start Game
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
                <h3 className="font-bold text-center text-lg sm:text-2xl">How to Play</h3>
                <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground bg-background/50 p-3 sm:p-4 rounded-xl border border-border/20 w-full">
                    <p>1. You'll play <strong>{TOTAL_ROUNDS} rounds</strong> of idiom challenges.</p>
                    <p>2. Each round shows a common English idiom with an example sentence.</p>
                    <p>3. Choose the correct definition from the options below.</p>
                    <p>4. Difficulty increases: <span className="text-emerald-400 font-bold">Beginner</span> → <span className="text-amber-400 font-bold">Intermediate</span> → <span className="text-red-400 font-bold">Advanced</span></p>
                    <p>5. Earn more points for harder idioms and maintain streaks!</p>
                </div>
                <Button onClick={handleStartGame} className="w-full h-11 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 font-black rounded-xl">Illuminate</Button>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 my-auto">
            <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-16 sm:w-16" />
            <p className="text-muted-foreground font-medium animate-pulse text-xs sm:text-base">Fetching rare linguistic phrases...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-4 sm:space-y-6 text-left w-full my-auto">
            <p className="font-bold text-muted-foreground uppercase tracking-wider text-center text-xs sm:text-sm">What does this mean?</p>
            <div className="text-center font-black italic text-primary bg-muted/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-primary/20 shadow-xl text-xl sm:text-3xl md:text-4xl p-4 sm:p-8 break-words leading-snug">
              &ldquo;{exercise.idiom}&rdquo;
            </div>
             <p className="text-center text-muted-foreground italic bg-card p-3 sm:p-4 rounded-xl shadow-inner text-xs sm:text-sm break-words">
                e.g., &ldquo;{exercise.exampleSentence}&rdquo;
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:gap-4 w-full">
              {exercise.options.map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-auto whitespace-normal justify-start text-left transition-all duration-300 shadow-md py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-base font-bold rounded-xl sm:rounded-2xl border-2 break-words",
                    { "bg-green-500 hover:bg-green-600 text-white border-green-400": gameState === 'answered' && option === exercise.meaning }
                  )}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === exercise.meaning && <Check className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
                  {gameState === 'answered' && option !== exercise.meaning && selectedOption === option && <X className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
                  <span>{option}</span>
                </Button>
              ))}
            </div>
            {gameState === 'answered' && (
                <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                    "border-2 sm:border-4 rounded-2xl sm:rounded-3xl shadow-xl mt-4 sm:mt-6 p-4 sm:p-6",
                    isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                )}>
                    <ThumbsUp className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                    <AlertTitle className="font-black tracking-tight text-base sm:text-xl mb-1 sm:mb-2">
                        {isCorrect ? "BRILLIANT!" : "KEEP SEARCHING!"}
                    </AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                        The idiom <strong>&ldquo;{exercise.idiom}&rdquo;</strong> means: {exercise.meaning}
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}

        {/* Finished / Results Screen */}
        {gameState === "finished" && (
          <div className="text-center flex flex-col items-center gap-4 sm:gap-6 w-full max-w-lg mx-auto my-auto p-2">
            <Trophy className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] h-16 w-16 sm:h-24 sm:w-24" />
            <div className="space-y-1">
              <h2 className="font-black uppercase tracking-tight text-white text-2xl sm:text-4xl">Illuminated!</h2>
              <p className={cn("font-black uppercase text-lg sm:text-2xl", getGrade().color)}>
                Grade: {getGrade().grade} — {getGrade().label}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
              <div className="bg-muted/50 rounded-xl sm:rounded-2xl border border-border/20 p-2.5 sm:p-4 text-center">
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] sm:text-xs">Score</p>
                <p className="font-black text-primary text-xl sm:text-3xl">{score}</p>
              </div>
              <div className="bg-muted/50 rounded-xl sm:rounded-2xl border border-border/20 p-2.5 sm:p-4 text-center">
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] sm:text-xs">Correct</p>
                <p className="font-black text-emerald-400 text-xl sm:text-3xl">
                  {roundResults.filter(r => r.correct).length}/{TOTAL_ROUNDS}
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl sm:rounded-2xl border border-border/20 p-2.5 sm:p-4 text-center">
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] sm:text-xs">Best Streak</p>
                <p className="font-black text-orange-400 text-xl sm:text-3xl">🔥 {bestStreak}</p>
              </div>
            </div>

            {/* Round-by-round breakdown */}
            <Card className="w-full p-3 sm:p-4 bg-card/50 max-h-48 overflow-y-auto">
              <h3 className="font-black uppercase tracking-wider text-muted-foreground mb-2 text-[10px] sm:text-xs">Round Breakdown</h3>
              <div className="flex flex-col gap-1.5">
                {roundResults.map((result, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs",
                    result.correct ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {result.correct
                        ? <Check className="text-emerald-400 shrink-0 h-3.5 w-3.5" />
                        : <X className="text-red-400 shrink-0 h-3.5 w-3.5" />
                      }
                      <span className="font-bold truncate">&ldquo;{result.idiom}&rdquo;</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "shrink-0 text-[9px] uppercase font-black",
                      result.difficulty === 'beginner' && "border-emerald-500/50 text-emerald-400",
                      result.difficulty === 'intermediate' && "border-amber-500/50 text-amber-400",
                      result.difficulty === 'advanced' && "border-red-500/50 text-red-400",
                    )}>
                      {result.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Button onClick={handleStartGame} className="w-full h-11 sm:h-12 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl rounded-xl">
              <Repeat className="mr-2 h-4 w-4" />New Session
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 sm:p-6 w-full shrink-0 max-w-4xl mx-auto border-t border-border/20">
        <Button variant="outline" asChild className="w-full sm:w-auto h-10 sm:h-11 text-xs sm:text-sm font-bold rounded-xl">
          <Link href="/games" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {(gameState === "playing" || gameState === "loading" || gameState === "answered") && (
            <Button variant="outline" onClick={handleAbortGame} className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-10 sm:h-11 font-bold rounded-xl">
              <XOctagon className="h-3.5 w-3.5" /> Abort Game
            </Button>
          )}
          {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full sm:w-auto h-10 sm:h-11 px-6 sm:px-8 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 font-black rounded-xl">Verify meaning</Button>}
          {gameState === 'answered' && <Button onClick={handleNextRound} className="w-full sm:w-auto h-10 sm:h-11 px-6 sm:px-8 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 font-black rounded-xl">
            <Repeat className="mr-2 h-4 w-4" />
            {currentRound + 1 >= TOTAL_ROUNDS ? 'See Results' : `Next Round (${currentRound + 2}/${TOTAL_ROUNDS})`}
          </Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
