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
import { Loader2, Sparkles, Check, Repeat, Trophy, Maximize, Minimize } from "lucide-react";
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

      if (firstCard?.pairId === secondCard?.pairId) {
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
    if (flippedCards.length < 2 && !flippedCards.includes(cardId) && !matchedPairs.includes(cards.find(c => c.id === cardId)!.pairId)) {
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
          isFullscreen ? "min-h-[60vh] max-w-7xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
      )}>
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to test your memory?</p>
                <Button onClick={() => setGameState("instructions")} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Start Mission
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
                    <p>1. Flip two cards to find matching pairs of words and definitions.</p>
                    <p>2. Successfully matched pairs remain visible.</p>
                    <p>3. Clear the entire grid to complete the reconnaissance mission.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Let's Play!</Button>
            </div>
        )}
        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-8">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Choose Mission Level</p>
                <div className={cn("flex flex-wrap gap-4 justify-center", isFullscreen && "gap-8")}>
                    <Button onClick={() => handleStartGame('beginner', 6)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>Beginner (12)</Button>
                    <Button onClick={() => handleStartGame('intermediate', 8)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>Normal (16)</Button>
                    <Button onClick={() => handleStartGame('advanced', 10)} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>Expert (20)</Button>
                </div>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Synchronizing neural tiles...</p>
            </div>
        )}
        {gameState === "playing" && (
            <div className="w-full flex flex-col items-center gap-8 max-w-6xl">
                <div className={cn("flex justify-between w-full font-black uppercase tracking-widest text-muted-foreground", isFullscreen ? "text-2xl" : "text-xs")}>
                    <p>Intel Moves: <span className="text-primary">{moves}</span></p>
                    <p>Signals Found: <span className="text-primary">{matchedPairs.length} / {cards.length / 2}</span></p>
                </div>
                 <div className={cn(
                    "grid gap-4 justify-center",
                    cards.length === 12 && "grid-cols-4",
                    cards.length === 16 && "grid-cols-4",
                    cards.length === 20 && "grid-cols-5",
                    isFullscreen && "gap-8"
                    )}>
                    {cards.map((card) => {
                        const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.pairId);
                        return (
                            <div key={card.id} className={cn("perspective-[1000px]", isFullscreen ? "w-40 h-52" : "w-24 h-32")} onClick={() => handleCardClick(card.id)}>
                                <div className={cn(
                                    "relative w-full h-full transform-style-preserve-3d transition-transform duration-500 rounded-3xl cursor-pointer shadow-xl",
                                    isFlipped ? "rotate-y-180" : ""
                                )}>
                                    <div className="absolute w-full h-full backface-hidden bg-primary border-4 border-white/20 rounded-[1.5rem] flex items-center justify-center text-primary-foreground text-5xl font-black">?</div>
                                    <div className={cn(
                                        "absolute w-full h-full rotate-y-180 backface-hidden bg-card border-4 border-primary/20 rounded-[1.5rem] flex items-center justify-center p-4 text-center overflow-hidden font-bold leading-tight",
                                        isFullscreen ? "text-xl" : "text-[10px]"
                                    )}>
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
             <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")}/>
                <div className="space-y-2">
                    <h3 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Mission Success!</h3>
                    <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>Signal Unlocked in {moves} Moves</p>
                </div>
                <Button onClick={handlePlayAgain} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Re-Engage
                </Button>
            </div>
        )}
      </CardContent>
       <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-7xl mx-auto w-full pb-16")}>
         <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== 'idle' && gameState !== 'instructions' && (
            <Button variant="secondary" onClick={() => setGameState('selecting_difficulty')} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Abort Sequence</Button>
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