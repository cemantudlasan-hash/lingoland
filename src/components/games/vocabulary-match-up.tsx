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
} from "@/ai/flows/generate-vocab-exercise";
import { Loader2, Sparkles, Check, Repeat, Trophy, Maximize, Minimize, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "finished" | "instructions" | "selecting_difficulty";

type CardData = {
  id: number;
  type: 'word' | 'definition';
  content: string;
  pairId: string;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function VocabularyMatchUp({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [cards, setCards] = React.useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = React.useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = React.useState<string[]>([]);
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [moves, setMoves] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleStartGame = async (level: SkillLevel, size: number) => {
    setDifficulty(level);
    setGameState("loading");
    setMatchedPairs([]);
    setFlippedCards([]);
    setCards([]);
    setMoves(0);
    try {
      if (!game) return;
      const result = await generateVocabExercise({
        difficulty: level,
        count: size,
        usedWords: usedWords,
      });

      const newUsed = result.pairs.map(p => p.word);
      setUsedWords(prev => [...prev, ...newUsed]);

      const newCards: CardData[] = [];
      result.pairs.forEach((pair, index) => {
        newCards.push({ id: index * 2, type: 'word', content: pair.word, pairId: pair.word });
        newCards.push({ id: index * 2 + 1, type: 'definition', content: pair.definition, pairId: pair.word });
      });

      setCards(shuffleArray(newCards));
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
    if (flippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const firstCard = cards.find(c => c.id === flippedCards[0]);
      const secondCard = cards.find(c => c.id === flippedCards[1]);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        setMatchedPairs(prev => [...prev, firstCard.pairId]);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  React.useEffect(() => {
    if (cards.length > 0 && matchedPairs.length === cards.length / 2) {
        setTimeout(() => {
             setGameState("finished");
        }, 500);
    }
  }, [matchedPairs, cards]);

  const handleCardClick = (cardId: number) => {
    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard) return;
    if (flippedCards.length < 2 && !flippedCards.includes(cardId) && !matchedPairs.includes(clickedCard.pairId)) {
      setFlippedCards(prev => [...prev, cardId]);
    }
  };
  
  const handlePlayAgain = () => {
      if(difficulty) {
          handleStartGame(difficulty, cards.length / 2);
      } else {
          setGameState("selecting_difficulty");
      }
  }

  if (!game) return <div>Game not found</div>;
  const Icon = game.icon;

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
                <p className="text-muted-foreground text-sm sm:text-lg">Ready to test your memory?</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => setGameState("instructions")} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl h-12 sm:h-14 px-8 text-base sm:text-lg rounded-2xl">
                      <Sparkles className="mr-2 h-5 w-5" /> How to Play & Start
                  </Button>
                  <Button onClick={() => setGameState('selecting_difficulty')} variant="outline" size="lg" className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-2xl font-bold">
                      Direct Select
                  </Button>
                </div>
            </div>
        )}

        {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-4 text-center bg-muted/40 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
                <h3 className="font-bold text-center text-lg sm:text-2xl">Mission Briefing / How to Play</h3>
                <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-base text-muted-foreground">
                    <p>1. Flip two cards to find matching pairs of words and definitions.</p>
                    <p>2. Successfully matched pairs remain revealed on the grid.</p>
                    <p>3. Clear the entire grid to complete the reconnaissance mission!</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="mt-4 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 text-base rounded-xl shadow-lg">
                  Choose Level
                </Button>
            </div>
        )}

        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-6 my-auto text-center w-full max-w-md">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs sm:text-sm">Choose Mission Level</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                    <Button onClick={() => handleStartGame('beginner', 6)} variant="outline" className="font-black uppercase h-12 sm:h-14 text-xs sm:text-sm rounded-xl border-2 hover:border-primary shadow-md">Beginner (12)</Button>
                    <Button onClick={() => handleStartGame('intermediate', 8)} variant="outline" className="font-black uppercase h-12 sm:h-14 text-xs sm:text-sm rounded-xl border-2 hover:border-primary shadow-md">Normal (16)</Button>
                    <Button onClick={() => handleStartGame('advanced', 10)} variant="outline" className="font-black uppercase h-12 sm:h-14 text-xs sm:text-sm rounded-xl border-2 hover:border-primary shadow-md">Expert (20)</Button>
                </div>
            </div>
        )}

        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 my-auto">
                <Loader2 className="animate-spin text-primary h-12 w-12 sm:h-16 sm:h-16" />
                <p className="text-muted-foreground animate-pulse text-sm sm:text-lg">Synchronizing neural tiles...</p>
            </div>
        )}

        {gameState === "playing" && (
            <div className="w-full flex flex-col items-center gap-4 sm:gap-6 max-w-4xl my-auto">
                <div className="flex justify-between w-full font-black uppercase tracking-widest text-muted-foreground text-xs sm:text-sm px-2">
                    <p>Intel Moves: <span className="text-primary">{moves}</span></p>
                    <p>Signals Found: <span className="text-primary">{matchedPairs.length} / {cards.length / 2}</span></p>
                </div>
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 justify-center w-full">
                    {cards.map((card) => {
                        const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.pairId);
                        return (
                            <div key={card.id} className="perspective-[1000px] w-full h-24 sm:h-32" onClick={() => handleCardClick(card.id)}>
                                <div className={cn(
                                    "relative w-full h-full transform-style-preserve-3d transition-transform duration-500 rounded-xl sm:rounded-2xl cursor-pointer shadow-md",
                                    isFlipped ? "rotate-y-180" : ""
                                )}>
                                    <div className="absolute w-full h-full backface-hidden bg-primary border-2 border-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary-foreground text-3xl sm:text-4xl font-black">?</div>
                                    <div className="absolute w-full h-full rotate-y-180 backface-hidden bg-card border-2 border-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 text-center overflow-hidden font-bold leading-tight text-[10px] sm:text-xs">
                                        {card.content}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {gameState === "finished" && (
             <div className="flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-300 my-auto text-center">
                <Trophy className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] h-20 w-20 sm:h-28 sm:w-28"/>
                <div className="space-y-1">
                    <h3 className="font-black uppercase tracking-tight text-white text-2xl sm:text-4xl">Mission Success!</h3>
                    <p className="font-black text-primary uppercase text-base sm:text-xl">Signal Unlocked in {moves} Moves</p>
                </div>
                <Button onClick={handlePlayAgain} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-12 sm:h-14 px-8 text-base rounded-2xl shadow-xl">
                    <Repeat className="mr-2 h-4 w-4" />
                    Re-Engage
                </Button>
            </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
         <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
            <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== 'idle' && gameState !== 'instructions' && (
            <Button variant="secondary" onClick={() => setGameState('selecting_difficulty')} className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">Abort Sequence</Button>
        )}
      </CardFooter>
      <style jsx>{`
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </Card>
  );
}