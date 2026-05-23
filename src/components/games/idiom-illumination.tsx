
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
import { Loader2, Sparkles, Check, X, ThumbsUp, Repeat, Maximize, Minimize, Trophy, Star, Zap } from "lucide-react";
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
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
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
        <div className="flex justify-center gap-2 pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{game.level.toUpperCase()}</Badge>
            {(gameState === 'playing' || gameState === 'answered' || gameState === 'loading') && (
              <Badge variant="outline" className={cn(
                "font-black uppercase",
                isFullscreen && "text-xl px-6 py-1",
                currentDifficulty === 'beginner' && "border-emerald-500/50 text-emerald-400",
                currentDifficulty === 'intermediate' && "border-amber-500/50 text-amber-400",
                currentDifficulty === 'advanced' && "border-red-500/50 text-red-400",
              )}>
                {currentDifficulty}
              </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-5xl mx-auto w-full px-8" : "min-h-[20rem]"
      )}>
        {/* Round & Score HUD */}
        {(gameState === 'playing' || gameState === 'answered' || gameState === 'loading') && (
          <div className={cn(
            "w-full flex items-center justify-between gap-4 bg-muted/30 rounded-2xl border border-border/20 shadow-inner",
            isFullscreen ? "p-6 text-2xl" : "p-3 text-sm"
          )}>
            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-muted-foreground">
              <Zap className={cn("text-amber-400", isFullscreen ? "h-6 w-6" : "h-4 w-4")} />
              Round {currentRound + 1}/{TOTAL_ROUNDS}
            </div>
            <div className="flex items-center gap-4">
              {streak > 1 && (
                <div className="flex items-center gap-1 text-orange-400 font-black animate-pulse">
                  🔥 {streak}x Streak
                </div>
              )}
              <div className="flex items-center gap-1.5 font-black text-primary">
                <Star className={cn("fill-primary", isFullscreen ? "h-6 w-6" : "h-4 w-4")} />
                {score} pts
              </div>
            </div>
          </div>
        )}

        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to illuminate some idioms?</p>
            <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
              Start Game
            </Button>
          </div>
        )}
        {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-4xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. You'll play <strong>{TOTAL_ROUNDS} rounds</strong> of idiom challenges.</p>
                    <p>2. Each round shows a common English idiom with an example sentence.</p>
                    <p>3. Choose the correct definition from the options below.</p>
                    <p>4. Difficulty increases: <span className="text-emerald-400 font-bold">Beginner</span> → <span className="text-amber-400 font-bold">Intermediate</span> → <span className="text-red-400 font-bold">Advanced</span></p>
                    <p>5. Earn more points for harder idioms. Build streaks for glory!</p>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>Illuminate</Button>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground font-medium animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Fetching rare linguistic phrases...</p>
          </div>
        )}
        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-8 text-left w-full">
            <p className={cn("font-bold text-muted-foreground uppercase tracking-widest text-center", isFullscreen ? "text-2xl" : "text-xs")}>What does this mean?</p>
            <div className={cn(
                "text-center font-black italic text-primary bg-muted/20 backdrop-blur-sm rounded-3xl border-4 border-primary/20 shadow-xl",
                isFullscreen ? "text-[6vw] md:text-[6vw] p-16 leading-tight" : "text-3xl p-8"
            )}>
              &ldquo;{exercise.idiom}&rdquo;
            </div>
             <p className={cn("text-center text-muted-foreground italic bg-card p-4 rounded-xl shadow-inner", isFullscreen ? "text-3xl" : "text-sm")}>
                e.g., &ldquo;{exercise.exampleSentence}&rdquo;
            </p>
            <div className={cn("grid grid-cols-1 gap-4", isFullscreen && "gap-6")}>
              {exercise.options.map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-auto whitespace-normal justify-start text-left transition-all duration-300 shadow-lg",
                    isFullscreen ? "py-8 px-10 text-3xl font-bold rounded-2xl border-4" : "py-4 px-6 font-bold border-2",
                    { "bg-green-500 hover:bg-green-600 text-white border-green-400": gameState === 'answered' && option === exercise.meaning }
                  )}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === exercise.meaning && <Check className={cn("mr-4", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />}
                  {gameState === 'answered' && option !== exercise.meaning && selectedOption === option && <X className={cn("mr-4", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />}
                  {option}
                </Button>
              ))}
            </div>
            {gameState === 'answered' && (
                <Alert variant={isCorrect ? "default" : "destructive"} className={cn(
                    "border-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4",
                    isFullscreen ? "p-12 mt-12" : "mt-8",
                    isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                )}>
                    <ThumbsUp className={cn("text-primary", isFullscreen ? "h-12 w-12" : "h-6 w-6")} />
                    <AlertTitle className={cn("font-black tracking-tight", isFullscreen ? "text-4xl mb-4" : "text-xl mb-2")}>
                        {isCorrect ? "BRILLIANT!" : "KEEP SEARCHING!"}
                    </AlertTitle>
                    <AlertDescription className={cn(isFullscreen ? "text-2xl leading-relaxed" : "text-base")}>
                        The idiom <strong>&ldquo;{exercise.idiom}&rdquo;</strong> means: {exercise.meaning}
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}

        {/* Finished / Results Screen */}
        {gameState === "finished" && (
          <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500 w-full">
            <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
            <div className="space-y-2">
              <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Illuminated!</h2>
              <p className={cn("font-black uppercase", isFullscreen ? "text-5xl" : "text-3xl", getGrade().color)}>
                Grade: {getGrade().grade} — {getGrade().label}
              </p>
            </div>

            <div className={cn(
              "grid grid-cols-3 gap-4 w-full max-w-md",
              isFullscreen && "max-w-2xl gap-8"
            )}>
              <div className={cn(
                "bg-muted/50 rounded-2xl border border-border/20 p-4 text-center",
                isFullscreen && "p-8"
              )}>
                <p className={cn("text-muted-foreground font-bold uppercase tracking-widest", isFullscreen ? "text-lg" : "text-[10px]")}>Score</p>
                <p className={cn("font-black text-primary", isFullscreen ? "text-5xl" : "text-2xl")}>{score}</p>
              </div>
              <div className={cn(
                "bg-muted/50 rounded-2xl border border-border/20 p-4 text-center",
                isFullscreen && "p-8"
              )}>
                <p className={cn("text-muted-foreground font-bold uppercase tracking-widest", isFullscreen ? "text-lg" : "text-[10px]")}>Correct</p>
                <p className={cn("font-black text-emerald-400", isFullscreen ? "text-5xl" : "text-2xl")}>
                  {roundResults.filter(r => r.correct).length}/{TOTAL_ROUNDS}
                </p>
              </div>
              <div className={cn(
                "bg-muted/50 rounded-2xl border border-border/20 p-4 text-center",
                isFullscreen && "p-8"
              )}>
                <p className={cn("text-muted-foreground font-bold uppercase tracking-widest", isFullscreen ? "text-lg" : "text-[10px]")}>Best Streak</p>
                <p className={cn("font-black text-orange-400", isFullscreen ? "text-5xl" : "text-2xl")}>🔥 {bestStreak}</p>
              </div>
            </div>

            {/* Round-by-round breakdown */}
            <Card className={cn("w-full max-w-md p-4 bg-card/50", isFullscreen && "max-w-2xl p-8")}>
              <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-xl" : "text-xs")}>Round Breakdown</h3>
              <div className="flex flex-col gap-2">
                {roundResults.map((result, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                    isFullscreen && "px-6 py-4 text-xl",
                    result.correct ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    <div className="flex items-center gap-2 min-w-0">
                      {result.correct
                        ? <Check className={cn("text-emerald-400 shrink-0", isFullscreen ? "h-6 w-6" : "h-4 w-4")} />
                        : <X className={cn("text-red-400 shrink-0", isFullscreen ? "h-6 w-6" : "h-4 w-4")} />
                      }
                      <span className={cn("font-bold truncate", isFullscreen ? "text-lg" : "text-sm")}>&ldquo;{result.idiom}&rdquo;</span>
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

            <Button onClick={handleStartGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
              <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />New Session
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-5xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Back to Library</Link>
        </Button>
        <div className="flex gap-4">
            {gameState === 'playing' && <Button onClick={handleCheckAnswer} disabled={!selectedOption} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>Verify meaning</Button>}
            {gameState === 'answered' && <Button onClick={handleNextRound} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
              <Repeat className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
              {currentRound + 1 >= TOTAL_ROUNDS ? 'See Results' : `Next Round (${currentRound + 2}/${TOTAL_ROUNDS})`}
            </Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
