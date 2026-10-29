"use client";

import { shuffleArray } from "@/lib/shuffle";
import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { generateArticleExercise } from "@/ai/flows/generate-article-exercise";
import type { GenerateArticleExerciseOutput } from "@/ai/flows/schemas/article-exercise-schema";
import { 
  Loader2, 
  Sparkles, 
  Check, 
  X, 
  Repeat, 
  Maximize, 
  Minimize, 
  ArrowLeft, 
  LogOut, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  FileText,
  Activity,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "answered" | "instructions";

export function ArticleArchitect({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [exercise, setExercise] = React.useState<GenerateArticleExerciseOutput | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [usedSentences, setUsedSentences] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [solvedCount, setSolvedCount] = React.useState(0);
  
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    setGameState("loading");
    setExercise(null);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const newExercise = await generateArticleExercise({
        difficulty: game.level,
        usedSentences: usedSentences,
      });
      const originalSentence = newExercise.sentenceWithBlank.replace('___', newExercise.correctAnswer);
      setUsedSentences(prev => [...prev, originalSentence]);
      setExercise({
        ...newExercise,
        options: shuffleArray([...newExercise.options])
      });
      setGameState("playing");
    } catch (error) {
      console.error("Failed to generate exercise:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
      setGameState("idle");
    }
  };

  const handleAbortGame = () => {
    setGameState("idle");
    setExercise(null);
    setSelectedOption(null);
    setIsCorrect(null);
    toast({
      title: "Session Aborted",
      description: "Returned to Article Architect Studio.",
    });
  };

  const handleCheckAnswer = () => {
    if (!exercise || !selectedOption) return;
    const correct = selectedOption === exercise.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setSolvedCount(prev => prev + 1);
    }
    setGameState("answered");
  };

  const getButtonVariant = (option: string) => {
    if (gameState !== "answered") {
      return selectedOption === option ? "default" : "outline";
    }
    if (option === exercise?.correctAnswer) {
      return "secondary";
    }
    if (option === selectedOption) {
      return "destructive";
    }
    return "outline";
  };
  
  const Icon = game.icon;

  return (
    <Card className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] transition-all duration-500 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-zinc-950/95 backdrop-blur-2xl border border-indigo-500/20 shadow-2xl text-white",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-black" : "rounded-2xl md:rounded-3xl"
    )}>
      {/* Header with Back to Games & In-game Abort */}
      <CardHeader className="z-20 bg-zinc-950/80 backdrop-blur-md border-b border-indigo-500/20 px-3 sm:px-6 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-bold bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 border-indigo-500/30 hover:border-indigo-400 rounded-xl"
            >
              <Link href="/games" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Games</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                  {game.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-[11px] font-medium text-indigo-300/70">
                  <span>English Syntax & Article Studio</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {(gameState === 'playing' || gameState === 'answered') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAbortGame}
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40 rounded-xl flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                <span>Abort Game</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-300/70 hover:text-white rounded-xl"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Main Content: items-stretch & justify-start to ensure smooth mobile scrolling */}
      <CardContent className="flex-1 flex flex-col items-stretch justify-start p-3 sm:p-6 lg:p-8 z-10 relative overflow-y-auto w-full max-w-6xl mx-auto space-y-6 pb-16">
        {gameState === "idle" && (
          <div className="w-full space-y-6 py-2">
            {/* Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/60 border border-indigo-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-mono uppercase text-indigo-300/60">Grammar Focus</p>
                <p className="text-sm sm:text-base font-black text-white">A, AN, THE, Ø</p>
              </div>
              <div className="bg-zinc-900/60 border border-purple-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-mono uppercase text-purple-300/60">AI Generator</p>
                <p className="text-sm sm:text-base font-black text-white">ACTIVE & DYNAMIC</p>
              </div>
              <div className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-mono uppercase text-emerald-300/60">Solved Sentences</p>
                <p className="text-sm sm:text-base font-black text-emerald-300">{solvedCount} COMPLETED</p>
              </div>
              <div className="bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs font-mono uppercase text-amber-300/60">Mastery Level</p>
                <p className="text-sm sm:text-base font-black text-amber-300 uppercase">{game.level}</p>
              </div>
            </div>

            {/* Main Interactive Studio Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-gradient-to-b from-indigo-950/20 via-zinc-900/40 to-black/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>ARTICLE ARCHITECT STUDIO</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                    Master Definite & <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                      Indefinite Articles
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-indigo-100/70 leading-relaxed max-w-xl">
                    Build flawless English sentences by selecting the correct article: <span className="text-indigo-300 font-bold">&quot;a&quot;</span>, <span className="text-indigo-300 font-bold">&quot;an&quot;</span>, <span className="text-indigo-300 font-bold">&quot;the&quot;</span>, or <span className="text-indigo-300 font-bold">&quot;no article (Ø)&quot;</span>.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleStartGame}
                    className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-all hover:scale-[1.02] border border-indigo-300/30 uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span>Start Architect Session</span>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="h-14 sm:h-16 px-6 text-sm sm:text-base font-bold border-white/15 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Link href="/games">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Games</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Grammar Guidelines Deck */}
              <div className="lg:col-span-5 bg-zinc-900/50 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-indigo-300">
                    <HelpCircle className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                      Quick Article Rules
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-indigo-100/80 font-normal">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs shrink-0 mt-0.5">A / AN</span>
                      <p className="text-[12px] text-indigo-200/70">Used with singular, countable nouns when mentioned for the first time or non-specific.</p>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-xs shrink-0 mt-0.5">THE</span>
                      <p className="text-[12px] text-indigo-200/70">Used when both speaker and listener know the specific noun being referred to.</p>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs shrink-0 mt-0.5">Ø NO</span>
                      <p className="text-[12px] text-indigo-200/70">Used for plural or uncountable nouns in general contexts, cities, and countries.</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setGameState('instructions')} 
                  variant="outline" 
                  className="w-full border-indigo-500/30 text-indigo-200 hover:bg-indigo-950/40 rounded-xl font-bold text-xs"
                >
                  View Full Instructions
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl max-w-2xl w-full mx-auto text-center space-y-6">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-3">
              <BookOpen className="text-indigo-400" /> How to Play Article Architect
            </h3>
            <div className="text-left space-y-3 font-normal text-indigo-100/90 text-sm sm:text-base">
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">1. You will be given a complete sentence with a missing article slot (<span className="text-indigo-400 font-bold">___</span>).</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">2. Choose the correct article from the four options (<span className="font-mono">a, an, the, no article</span>).</p>
              <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">3. Check your answer to receive detailed grammatical explanations and rule insights.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setGameState('idle')} 
                variant="outline"
                className="flex-1 border-white/20 text-white font-bold h-12 rounded-xl"
              >
                Back to Studio
              </Button>
              <Button 
                onClick={handleStartGame} 
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black h-12 rounded-xl"
              >
                Let&apos;s Build!
              </Button>
            </div>
          </div>
        )}

        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="animate-spin text-indigo-400 h-12 w-12" />
            <p className="text-indigo-200 animate-pulse text-sm sm:text-base font-mono">Synthesizing syntactic challenge...</p>
          </div>
        )}

        {(gameState === "playing" || gameState === "answered") && exercise && (
          <div className="space-y-6 text-left w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-indigo-300">
              <span className="uppercase tracking-widest">COMPLETE THE SENTENCE:</span>
              <span className="text-emerald-400 font-bold">{solvedCount} SOLVED</span>
            </div>

            {/* Sentence Container */}
            <div className="text-center font-bold bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-indigo-500/30 p-6 sm:p-12 shadow-xl">
              <p className="text-xl sm:text-3xl md:text-4xl leading-relaxed text-white">
                {exercise.sentenceWithBlank.split('___').map((part, index) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < exercise.sentenceWithBlank.split('___').length - 1 && (
                      <span className="inline-block border-b-4 border-indigo-400 mx-2 sm:mx-3 px-3 min-w-[3rem] text-indigo-300 font-black">
                        {gameState === 'answered' ? exercise.correctAnswer : (selectedOption || '___')}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {exercise.options.map((option) => (
                <Button
                  key={option}
                  variant={getButtonVariant(option)}
                  className={cn(
                    "h-14 sm:h-20 text-base sm:text-2xl font-black rounded-2xl border-2 transition-all shadow-md capitalize",
                    gameState === 'answered' && option === exercise.correctAnswer && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400",
                    gameState === 'answered' && option === selectedOption && option !== exercise.correctAnswer && "bg-rose-600/80 border-rose-500 text-white"
                  )}
                  onClick={() => gameState === 'playing' && setSelectedOption(option)}
                  disabled={gameState === 'answered'}
                >
                  {gameState === 'answered' && option === exercise.correctAnswer && <Check className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />}
                  {gameState === 'answered' && option !== exercise.correctAnswer && selectedOption === option && <X className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />}
                  {option}
                </Button>
              ))}
            </div>

            {/* Explanation Alert */}
            {gameState === 'answered' && (
              <Alert className={cn(
                "border-2 rounded-2xl shadow-xl p-4 sm:p-6",
                isCorrect ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-100" : "bg-rose-950/80 border-rose-500/50 text-rose-100"
              )}>
                <AlertTitle className="font-black uppercase text-base sm:text-lg mb-1">
                  {isCorrect ? "EXCELLENT WORK!" : "NOT QUITE RIGHT!"}
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                  {exercise.explanation}
                </AlertDescription>
              </Alert>
            )}

            {/* In-Game Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAbortGame}
                className="h-10 px-4 text-xs sm:text-sm font-bold bg-red-950/30 hover:bg-red-900/50 text-red-300 border-red-500/40 rounded-xl flex items-center gap-2"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Abort Game</span>
              </Button>

              <div className="flex gap-2 ml-auto">
                {gameState === 'playing' && (
                  <Button 
                    onClick={handleCheckAnswer} 
                    disabled={!selectedOption} 
                    className="h-10 px-6 font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg"
                  >
                    Check Answer
                  </Button>
                )}
                {gameState === 'answered' && (
                  <Button 
                    onClick={handleStartGame} 
                    className="h-10 px-6 font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg flex items-center gap-1.5"
                  >
                    <Repeat className="h-4 w-4" />
                    <span>Next Question</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="z-20 bg-zinc-950/80 backdrop-blur-md border-t border-indigo-500/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-indigo-300/60 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
          <span>ARTICLE ARCHITECT // GRAMMAR CORE</span>
        </div>
        <Link href="/games" className="hover:text-indigo-200 transition-colors">
          ← Exit to Games Hub
        </Link>
      </CardFooter>
    </Card>
  );
}
