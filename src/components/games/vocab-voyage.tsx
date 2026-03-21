
"use client";

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
  generateVocabExercise,
  type GenerateVocabExerciseOutput,
} from "@/ai/flows/generate-vocab-exercise";
import { Loader2, Sparkles, Check, X, Repeat, Trophy, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "finished" | "selecting_difficulty" | "instructions";
type WordDefinitionPair = GenerateVocabExerciseOutput["pairs"][0];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function VocabVoyage({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [words, setWords] = React.useState<WordDefinitionPair[]>([]);
  const [definitions, setDefinitions] = React.useState<WordDefinitionPair[]>([]);
  const [selectedWord, setSelectedWord] = React.useState<WordDefinitionPair | null>(null);
  const [selectedDefinition, setSelectedDefinition] = React.useState<WordDefinitionPair | null>(null);
  const [correctMatches, setCorrectMatches] = React.useState<string[]>([]);
  const [incorrectMatches, setIncorrectMatches] = React.useState<string[]>([]);
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleStartGame = async (level: SkillLevel) => {
    setDifficulty(level);
    setGameState("loading");
    setCorrectMatches([]);
    setIncorrectMatches([]);
    setSelectedWord(null);
    setSelectedDefinition(null);
    try {
      if (!game) return;
      const newExercise = await generateVocabExercise({
        difficulty: level,
        count: isFullscreen ? 10 : 8,
        usedWords: usedWords,
      });
      const newWords = newExercise.pairs.map(p => p.word);
      setUsedWords(prev => [...prev, ...newWords]);
      setWords(shuffleArray(newExercise.pairs));
      setDefinitions(shuffleArray(newExercise.pairs));
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
  
  React.useEffect(() => {
    if (selectedWord && selectedDefinition) {
      if (selectedWord.word === selectedDefinition.word) {
        setCorrectMatches((prev) => [...prev, selectedWord.word]);
      } else {
        setIncorrectMatches((prev) => [...prev, selectedWord.word, selectedDefinition.word]);
        setTimeout(() => {
            setIncorrectMatches((prev) => prev.filter(w => w !== selectedWord.word && w !== selectedDefinition.word));
        }, 500);
      }
      setSelectedWord(null);
      setSelectedDefinition(null);
    }
  }, [selectedWord, selectedDefinition]);

  React.useEffect(() => {
    if (words.length > 0 && correctMatches.length === words.length) {
      setGameState("finished");
    }
  }, [correctMatches, words]);

  const getButtonState = (item: WordDefinitionPair, type: 'word' | 'definition') => {
    if (correctMatches.includes(item.word)) return "correct";
    if (incorrectMatches.includes(item.word)) return "incorrect";
    if (type === 'word' && selectedWord?.word === item.word) return "selected";
    if (type === 'definition' && selectedDefinition?.word === item.word) return "selected";
    return "default";
  }

  const Icon = game.icon;

  const handlePlayAgain = () => {
    if (difficulty) {
        handleStartGame(difficulty);
    } else {
        setGameState("selecting_difficulty");
    }
  }

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
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty || game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-8" : "min-h-[20rem]"
      )}>
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Match the words to their definitions!</p>
            <Button onClick={() => setGameState("instructions")} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
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
                    <p>1. Select a word from the left column.</p>
                    <p>2. Match it with its correct definition on the right.</p>
                    <p>3. Clear all pairs to win the voyage!</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>Launch Voyage</Button>
            </div>
        )}
        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-8">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Choose Mission Level</p>
                <div className={cn("flex flex-wrap gap-4 justify-center", isFullscreen && "gap-8")}>
                    {["beginner", "intermediate", "advanced"].map((level) => (
                        <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black shadow-xl", isFullscreen && "h-24 px-12 text-3xl rounded-3xl border-4")}>
                            {level.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>
        )}
        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground font-medium animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Synchronizing vocabulary data...</p>
          </div>
        )}
        {(gameState === "playing") && (
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full", isFullscreen && "gap-16")}>
                <div className="space-y-4">
                    <h3 className={cn("font-black uppercase tracking-tighter text-primary", isFullscreen ? "text-4xl text-center" : "text-lg")}>Words</h3>
                    <div className="space-y-3">
                        {words.map((pair) => (
                            <Button
                                key={pair.word}
                                variant={
                                    getButtonState(pair, 'word') === 'correct' ? "secondary" : 
                                    getButtonState(pair, 'word') === 'incorrect' ? "destructive" :
                                    getButtonState(pair, 'word') === 'selected' ? "default" : "outline"
                                }
                                className={cn(
                                    "w-full justify-start text-left h-auto py-3 whitespace-normal transition-all duration-300 shadow-lg",
                                    isFullscreen ? "p-8 text-3xl font-bold rounded-2xl border-4" : "p-4 font-bold border-2",
                                    {"opacity-30 cursor-not-allowed scale-95": correctMatches.includes(pair.word)},
                                    {"bg-green-500 text-white hover:bg-green-600": getButtonState(pair, 'word') === 'correct'},
                                    {"animate-shake ring-4 ring-red-500": getButtonState(pair, 'word') === 'incorrect'},
                                    {"ring-4 ring-primary scale-105": getButtonState(pair, 'word') === 'selected'}
                                )}
                                onClick={() => !correctMatches.includes(pair.word) && setSelectedWord(pair)}
                                disabled={correctMatches.includes(pair.word)}
                            >
                               {correctMatches.includes(pair.word) && <Check className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />}
                               {pair.word}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className={cn("font-black uppercase tracking-tighter text-primary", isFullscreen ? "text-4xl text-center" : "text-lg")}>Definitions</h3>
                    <div className="space-y-3">
                        {definitions.map((pair) => (
                            <Button
                                key={pair.word}
                                variant={
                                    getButtonState(pair, 'definition') === 'correct' ? "secondary" : 
                                    getButtonState(pair, 'definition') === 'incorrect' ? "destructive" :
                                    getButtonState(pair, 'definition') === 'selected' ? "default" : "outline"
                                }
                                className={cn(
                                    "w-full justify-start text-left h-auto py-3 whitespace-normal transition-all duration-300 shadow-lg",
                                    isFullscreen ? "p-8 text-2xl font-medium rounded-2xl border-4" : "p-4 font-bold border-2",
                                    {"opacity-30 cursor-not-allowed scale-95": correctMatches.includes(pair.word)},
                                    {"bg-green-500 text-white": getButtonState(pair, 'definition') === 'correct'},
                                    {"animate-shake ring-4 ring-red-500": getButtonState(pair, 'definition') === 'incorrect'},
                                    {"ring-4 ring-primary scale-105": getButtonState(pair, 'definition') === 'selected'}
                                )}
                                onClick={() => !correctMatches.includes(pair.word) && setSelectedDefinition(pair)}
                                disabled={correctMatches.includes(pair.word)}
                            >
                                {correctMatches.includes(pair.word) && <Check className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />}
                                {pair.definition}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        {gameState === "finished" && (
             <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")}/>
                <div className="space-y-2">
                    <p className={cn("font-black uppercase tracking-tighter text-green-500", isFullscreen ? "text-6xl" : "text-3xl")}>VOYAGE COMPLETE!</p>
                    <p className={cn("text-muted-foreground", isFullscreen ? "text-2xl" : "text-lg")}>You have successfully matched every signal.</p>
                </div>
                <Button onClick={handlePlayAgain} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Launch New Mission
                </Button>
            </div>
        )}
      </CardContent>
       <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
         <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Abort Voyage</Link>
        </Button>
        {gameState === "playing" && (
            <div className={cn("font-black text-primary uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>
                Progress: {correctMatches.length} / {words.length}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
