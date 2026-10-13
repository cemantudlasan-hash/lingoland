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
import { generateHangmanWord } from "@/ai/flows/generate-hangman-word";
import { Loader2, Sparkles, Repeat, Lightbulb, Shuffle, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

type GameState = "idle" | "loading" | "playing" | "finished" | "instructions" | "selecting_difficulty" | "selecting_category";
const MAX_INCORRECT_GUESSES = 6;

const CATEGORIES = [
    "Adjectives", "Animals", "Art", "Body Parts", "Clothing", "Colors", "Common Nouns", 
    "Countries", "Emotions", "Family Members", "Food", "Fruits", "Furniture", 
    "Future Tense Verbs", "History", "Hobbies", "Irregular Verbs", "Jobs", 
    "Kitchen Items", "Movies", "Music", "Musical Instruments", "Nationalities", 
    "Nature", "Past Tense Verbs", "Pharsal Verbs", "Places in a City", 
    "Present Tense Verbs", "School Subjects", "Science", "Shapes", "Space", 
    "Sports", "Technology", "Tools", "Transportation", "Verbs", "Weather",
].sort();


const HangmanFigure = ({ incorrectGuesses, isFullscreen }: { incorrectGuesses: number; isFullscreen: boolean }) => {
    const parts = [
      <circle key="head" cx="100" cy="70" r="20" stroke="currentColor" strokeWidth="4" fill="none" />,
      <line key="body" x1="100" y1="90" x2="100" y2="150" stroke="currentColor" strokeWidth="4" />,
      <line key="arm1" x1="100" y1="110" x2="70" y2="90" stroke="currentColor" strokeWidth="4" />,
      <line key="arm2" x1="100" y1="110" x2="130" y2="90" stroke="currentColor" strokeWidth="4" />,
      <line key="leg1" x1="100" y1="150" x2="70" y2="180" stroke="currentColor" strokeWidth="4" />,
      <line key="leg2" x1="100" y1="150" x2="130" y2="180" stroke="currentColor" strokeWidth="4" />,
    ];

    return (
        <svg viewBox="0 0 200 250" className={cn("text-foreground shrink-0 transition-all", isFullscreen ? "w-40 h-48 sm:w-48 sm:h-56" : "w-32 h-40 md:w-44 md:h-52")}>
            {/* Gallows */}
            <line x1="20" y1="230" x2="180" y2="230" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="230" x2="60" y2="50" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="50" x2="100" y2="70" stroke="currentColor" strokeWidth="4" />
            {parts.slice(0, incorrectGuesses)}
        </svg>
    )
}

export function HangmanChallenge({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [word, setWord] = React.useState<string>("");
  const [hint, setHint] = React.useState<string>("");
  const [guessedLetters, setGuessedLetters] = React.useState<string[]>([]);
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [category, setCategory] = React.useState<string>(CATEGORIES[0]);
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const incorrectGuesses = guessedLetters.filter(letter => !word.includes(letter)).length;
  const isWinner = word ? word.split('').every(letter => guessedLetters.includes(letter)) : false;
  const isLoser = incorrectGuesses >= MAX_INCORRECT_GUESSES;

  React.useEffect(() => {
    if(word && (isWinner || isLoser)) {
        setGameState("finished");
    }
  }, [isWinner, isLoser, word])

  const handleNewWord = async (level: SkillLevel, cat: string) => {
    setGameState("loading");
    setGuessedLetters([]);
    setWord("");
    setHint("");
    try {
      const { word: newWord, hint: newHint } = await generateHangmanWord({
        difficulty: level,
        category: cat,
        usedWords: usedWords
      });
      setWord(newWord.toUpperCase());
      setHint(newHint);
      setUsedWords(prev => [...prev, newWord]);
      setGameState("playing");
    } catch (error) {
      console.error("Failed to generate new word:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get a new word. Please try again.",
      });
      setGameState("selecting_category");
    }
  };

  const handleStartGame = (selectedCategory: string) => {
    setCategory(selectedCategory);
    handleNewWord(difficulty, selectedCategory);
  };

  const handleGuess = (letter: string) => {
    if (gameState !== "playing" || guessedLetters.includes(letter)) return;
    setGuessedLetters(prev => [...prev, letter]);
  };

  const keyboardRows = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    "ZXCVBNM".split(""),
  ];

  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col overflow-y-auto overflow-x-hidden justify-between",
        isFullscreen 
            ? "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none bg-background p-2 sm:p-6" 
            : "flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full bg-card/80 backdrop-blur-sm border-border/20 shadow-lg rounded-2xl md:rounded-3xl"
      )}>
      <CardHeader className="text-center relative shrink-0 p-3 sm:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 px-2 gap-1 text-muted-foreground hover:text-foreground z-20"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        <div className="flex justify-center mb-2 sm:mb-4">
            <Icon className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
        </div>
        <CardTitle className="font-black tracking-tight uppercase text-xl sm:text-3xl">{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-base mt-0.5 sm:mt-1 max-w-xl mx-auto">{game.description}</CardDescription>
        <div className="flex justify-center items-center gap-2 pt-2 flex-wrap">
            <Badge variant="outline" className="text-xs px-2.5 py-0.5">{difficulty.toUpperCase()}</Badge>
            {(gameState === 'playing' || gameState === 'finished') && <Badge variant="secondary" className="text-xs px-2.5 py-0.5">{category.toUpperCase()}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="text-center flex flex-col items-center justify-center flex-1 w-full p-2 sm:p-6 max-w-4xl mx-auto overflow-y-auto">
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-3 sm:gap-4 my-auto">
                <p className="text-muted-foreground text-sm sm:text-xl">Ready to decipher the hidden word?</p>
                <Button onClick={() => setGameState('instructions')} className="h-11 sm:h-14 px-8 sm:px-12 text-sm sm:text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl">Start Game</Button>
            </div>
        )}
         {gameState === "instructions" && (
             <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
                <h3 className="font-bold text-center text-lg sm:text-2xl">How to Play</h3>
                <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground bg-background/50 p-3 sm:p-4 rounded-xl border border-border/20 w-full">
                    <p>1. A secret word is masked by underscores. Your goal is to reveal it.</p>
                    <p>2. Guess letters using the digital keyboard. Correct guesses appear; incorrect ones build the hangman.</p>
                    <p>3. You have {MAX_INCORRECT_GUESSES} chances before the mission fails.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} className="w-full h-11 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl">Let's Go!</Button>
            </div>
        )}
        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-4 sm:gap-6 my-auto">
                <p className="text-muted-foreground font-black uppercase tracking-wider text-xs sm:text-sm">Choose Difficulty</p>
                <div className="flex flex-wrap gap-2.5 sm:gap-4 justify-center">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button key={level} onClick={() => { setDifficulty(level as SkillLevel); setGameState('selecting_category'); }} variant="outline" className="font-black uppercase h-11 sm:h-14 px-5 sm:px-8 text-xs sm:text-base rounded-xl border-2">{level}</Button>
                    ))}
                </div>
            </div>
        )}
        {gameState === 'selecting_category' && (
            <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-2xl my-auto">
                <p className="text-muted-foreground font-black uppercase tracking-wider text-xs sm:text-sm">Select Research Category</p>
                <ScrollArea className="w-full border-2 rounded-2xl bg-muted/20 p-2 sm:p-3 h-60 sm:h-72">
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 p-1">
                        {CATEGORIES.map(cat => (
                            <Button key={cat} onClick={() => handleStartGame(cat)} variant="outline" className="font-bold text-xs sm:text-sm h-10 sm:h-12 truncate">
                                {cat}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 my-auto">
                <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-14 sm:w-14" />
                <p className="text-muted-foreground animate-pulse text-xs sm:text-base">Selecting secret word...</p>
            </div>
        )}
        
        {(gameState === "playing" || gameState === "finished") && word && (
            <div className="flex flex-col items-center gap-2.5 sm:gap-4 w-full my-auto">
                <HangmanFigure incorrectGuesses={incorrectGuesses} isFullscreen={isFullscreen} />
                
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5 font-black tracking-wider text-foreground">
                    {word.split("").map((letter, index) => (
                        <span key={index} className="border-b-4 sm:border-b-6 border-primary flex items-center justify-center font-black w-7 h-9 sm:w-10 sm:h-12 md:w-12 md:h-14 text-lg sm:text-2xl md:text-3xl">
                            {guessedLetters.includes(letter) || gameState === 'finished' ? letter : "_"}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-muted-foreground font-bold uppercase tracking-wider max-w-xl px-2 text-xs sm:text-sm">
                    <Lightbulb className="text-amber-400 h-4 w-4 shrink-0" />
                    <p className="line-clamp-2">{hint}</p>
                </div>

                {gameState === 'playing' ? (
                     <div className="space-y-1 sm:space-y-1.5 w-full max-w-2xl pt-1">
                        {keyboardRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
                                {row.map(letter => {
                                    const isGuessed = guessedLetters.includes(letter);
                                    return (
                                        <Button
                                            key={letter}
                                            variant={isGuessed ? "secondary" : "outline"}
                                            className={cn(
                                                "font-black shadow-sm transition-all p-0 w-7 h-9 sm:w-9 sm:h-11 md:w-11 md:h-12 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl",
                                                isGuessed && "opacity-25 scale-90"
                                            )}
                                            onClick={() => handleGuess(letter)}
                                            disabled={isGuessed}
                                        >
                                            {letter}
                                        </Button>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="flex flex-col items-center gap-3 animate-in zoom-in duration-300 py-1">
                        <p className={cn("font-black uppercase tracking-tight text-xl sm:text-3xl", isWinner ? "text-green-500" : "text-destructive")}>
                            {isWinner ? "MISSION SUCCESS!" : "CRITICAL FAILURE!"}
                        </p>
                        {!isWinner && (
                            <div className="p-3 sm:p-4 rounded-xl bg-muted/20 border-2 border-primary/20 text-center">
                                <p className="text-muted-foreground font-black text-[10px] sm:text-xs uppercase tracking-wider">The word was:</p>
                                <p className="font-black text-primary uppercase italic text-2xl sm:text-3xl">{word}</p>
                            </div>
                        )}
                        <Button onClick={() => setGameState('selecting_category')} className="h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl shadow-lg"><Repeat className="mr-1.5 h-4 w-4"/>New Game</Button>
                    </div>
                )}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2.5 p-3 sm:p-6 w-full shrink-0 max-w-4xl mx-auto">
        <Button variant="outline" asChild className="w-full sm:w-auto h-10 sm:h-11 text-xs font-bold rounded-xl">
            <Link href="/games">Exit Challenge</Link>
        </Button>
        {gameState === 'playing' && 
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" onClick={() => setGameState('selecting_category')} className="flex-1 sm:flex-none h-10 sm:h-11 px-3 sm:px-4 text-xs font-bold rounded-xl">Switch Category</Button>
                <Button variant="secondary" onClick={() => handleNewWord(difficulty, category)} className="flex-1 sm:flex-none h-10 sm:h-11 px-3 sm:px-4 text-xs font-bold rounded-xl"><Shuffle className="mr-1.5 h-3.5 w-3.5"/>Reroll Word</Button>
            </div>
        }
      </CardFooter>
    </Card>
  );
}
