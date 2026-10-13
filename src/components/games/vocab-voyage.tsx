
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
import { Loader2, Sparkles, Check, X, Repeat, Trophy, Maximize, Minimize, HelpCircle } from "lucide-react";
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

  if (!game) return null;
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
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}>
      <CardHeader className="text-center relative p-4 sm:p-6 shrink-0">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 sm:gap-2 z-[100]">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 px-2 gap-1 text-muted-foreground hover:text-foreground text-xs"
            onClick={() => setGameState(gameState === 'instructions' ? 'idle' : 'instructions')}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">How to Play</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 p-1.5 sm:p-2 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
        </div>
        {!isFullscreen && (
            <div className="flex justify-center mb-2 sm:mb-3">
                <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
            </div>
        )}
        <CardTitle className="font-black tracking-tight uppercase text-xl sm:text-3xl md:text-4xl">{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base max-w-xl mx-auto">{game.description}</CardDescription>
        <div className="flex justify-center pt-2">
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">{difficulty || game.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-4 text-center my-auto">
            <p className="text-muted-foreground text-sm sm:text-lg">Match the words to their definitions!</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setGameState("instructions")} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 font-black h-12 sm:h-14 px-8 text-base sm:text-lg rounded-2xl shadow-xl">
                <Sparkles className="mr-2 h-5 w-5" />
                How to Play & Start
              </Button>
              <Button onClick={() => setGameState('selecting_difficulty')} variant="outline" size="lg" className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-2xl font-bold">
                Direct Select
              </Button>
            </div>
          </div>
        )}

        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
                <h3 className="font-bold text-center text-lg sm:text-2xl">Voyage Directives / How to Play</h3>
                <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-base text-muted-foreground">
                    <p>1. Select a vocabulary word from the left column.</p>
                    <p>2. Match it with its correct semantic definition on the right.</p>
                    <p>3. Clear all pairs to successfully navigate and complete the voyage!</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="mt-4 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 text-base rounded-xl shadow-lg">
                  Launch Voyage
                </Button>
            </div>
        )}

        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-6 my-auto text-center w-full max-w-md">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs sm:text-sm">Choose Mission Level</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                        <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} variant="outline" className="font-black uppercase h-12 sm:h-14 text-xs sm:text-sm rounded-xl border-2 hover:border-primary shadow-md">
                            {level}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 my-auto">
            <Loader2 className="animate-spin text-primary h-12 w-12 sm:h-16 sm:h-16" />
            <p className="text-muted-foreground font-medium animate-pulse text-sm sm:text-lg">Synchronizing vocabulary data...</p>
          </div>
        )}

        {(gameState === "playing") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start w-full my-auto">
                <div className="space-y-3">
                    <h3 className="font-black uppercase tracking-wider text-primary text-sm sm:text-base text-center md:text-left">Words</h3>
                    <div className="space-y-2">
                        {words.map((pair) => (
                            <Button
                                key={pair.word}
                                variant={
                                    getButtonState(pair, 'word') === 'correct' ? "secondary" : 
                                    getButtonState(pair, 'word') === 'incorrect' ? "destructive" :
                                    getButtonState(pair, 'word') === 'selected' ? "default" : "outline"
                                }
                                className={cn(
                                    "w-full justify-start text-left h-auto py-2.5 px-3.5 sm:py-3.5 sm:px-4 whitespace-normal transition-all duration-300 shadow-md rounded-xl font-bold text-xs sm:text-base border-2",
                                    {"opacity-30 cursor-not-allowed scale-95": correctMatches.includes(pair.word)},
                                    {"bg-green-500 text-white hover:bg-green-600": getButtonState(pair, 'word') === 'correct'},
                                    {"animate-shake ring-4 ring-red-500": getButtonState(pair, 'word') === 'incorrect'},
                                    {"ring-4 ring-primary scale-[1.02]": getButtonState(pair, 'word') === 'selected'}
                                )}
                                onClick={() => !correctMatches.includes(pair.word) && setSelectedWord(pair)}
                                disabled={correctMatches.includes(pair.word)}
                            >
                               {correctMatches.includes(pair.word) && <Check className="mr-2 h-4 w-4 shrink-0" />}
                               {pair.word}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <h3 className="font-black uppercase tracking-wider text-primary text-sm sm:text-base text-center md:text-left">Definitions</h3>
                    <div className="space-y-2">
                        {definitions.map((pair) => (
                            <Button
                                key={pair.word}
                                variant={
                                    getButtonState(pair, 'definition') === 'correct' ? "secondary" : 
                                    getButtonState(pair, 'definition') === 'incorrect' ? "destructive" :
                                    getButtonState(pair, 'definition') === 'selected' ? "default" : "outline"
                                }
                                className={cn(
                                    "w-full justify-start text-left h-auto py-2.5 px-3.5 sm:py-3.5 sm:px-4 whitespace-normal transition-all duration-300 shadow-md rounded-xl font-medium text-xs sm:text-sm border-2",
                                    {"opacity-30 cursor-not-allowed scale-95": correctMatches.includes(pair.word)},
                                    {"bg-green-500 text-white": getButtonState(pair, 'definition') === 'correct'},
                                    {"animate-shake ring-4 ring-red-500": getButtonState(pair, 'definition') === 'incorrect'},
                                    {"ring-4 ring-primary scale-[1.02]": getButtonState(pair, 'definition') === 'selected'}
                                )}
                                onClick={() => !correctMatches.includes(pair.word) && setSelectedDefinition(pair)}
                                disabled={correctMatches.includes(pair.word)}
                            >
                                {correctMatches.includes(pair.word) && <Check className="mr-2 h-4 w-4 shrink-0" />}
                                {pair.definition}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {gameState === "finished" && (
             <div className="flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-300 my-auto text-center">
                <Trophy className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] h-20 w-20 sm:h-28 sm:w-28"/>
                <div className="space-y-1">
                    <p className="font-black uppercase tracking-tight text-green-500 text-2xl sm:text-4xl">VOYAGE COMPLETE!</p>
                    <p className="text-muted-foreground text-xs sm:text-base">You have successfully matched every signal.</p>
                </div>
                <Button onClick={handlePlayAgain} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 sm:h-14 px-8 text-base rounded-2xl shadow-xl">
                    <Repeat className="mr-2 h-4 w-4" />
                    Launch New Mission
                </Button>
            </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
         <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            <Link href="/games">Abort Voyage</Link>
        </Button>
        {gameState === "playing" && (
            <div className="font-black text-primary uppercase tracking-widest text-xs sm:text-sm">
                Progress: {correctMatches.length} / {words.length}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
