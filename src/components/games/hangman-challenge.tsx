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
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-between overflow-y-auto px-4 md:px-8 py-3" 
            : "max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
      <CardHeader className={cn("text-center relative shrink-0", isFullscreen ? "pb-2 pt-2" : "")}>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 md:top-4 md:right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
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
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-2xl md:text-3xl" : "text-3xl")}>{game.title}</CardTitle>
        <CardDescription className={cn(isFullscreen ? "text-sm md:text-base mt-1" : "")}>{game.description}</CardDescription>
        <div className="flex justify-center items-center gap-2 pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xs px-3 py-0.5")}>{difficulty.toUpperCase()}</Badge>
            {(gameState === 'playing' || gameState === 'finished') && <Badge variant="secondary" className={cn(isFullscreen && "text-xs px-3 py-0.5")}>{category.toUpperCase()}</Badge>}
        </div>
      </CardHeader>
      <CardContent className={cn(
          "text-center flex flex-col items-center justify-center flex-1 w-full",
          isFullscreen ? "max-w-5xl mx-auto px-4 py-2 space-y-3" : "min-h-[20rem] p-6 space-y-6"
      )}>
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-2xl" : "text-base")}>Ready to decipher the hidden word?</p>
                <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-14 px-10 text-xl rounded-2xl shadow-xl")}>Start Game</Button>
            </div>
        )}
         {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-10 max-w-3xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-2", isFullscreen ? "text-2xl md:text-3xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-3", isFullscreen ? "text-base md:text-lg" : "text-base")}>
                    <p>1. A secret word is masked by underscores. Your goal is to reveal it.</p>
                    <p>2. Guess letters using the digital keyboard. Correct guesses appear; incorrect ones build the hangman.</p>
                    <p>3. You have {MAX_INCORRECT_GUESSES} chances before the mission fails.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-14 px-10 text-xl rounded-2xl shadow-xl")}>Let's Go!</Button>
            </div>
        )}
        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-6">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-xl" : "text-sm")}>Choose Difficulty</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button key={level} onClick={() => { setDifficulty(level as SkillLevel); setGameState('selecting_category'); }} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-14 px-8 text-lg rounded-2xl border-2")}>{level}</Button>
                    ))}
                </div>
            </div>
        )}
        {gameState === 'selecting_category' && (
            <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-xl" : "text-sm")}>Select Research Category</p>
                <ScrollArea className={cn("w-full border-2 rounded-2xl bg-muted/20 p-3", isFullscreen ? "h-[45vh]" : "h-72")}>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
                        {CATEGORIES.map(cat => (
                            <Button key={cat} onClick={() => handleStartGame(cat)} variant="outline" className={cn("font-bold", isFullscreen && "text-sm h-12")}>
                                {cat}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-xl" : "text-lg")}>Selecting secret word...</p>
            </div>
        )}
        
        {(gameState === "playing" || gameState === "finished") && word && (
            <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
                <HangmanFigure incorrectGuesses={incorrectGuesses} isFullscreen={isFullscreen} />
                
                <div className={cn("flex flex-wrap justify-center gap-2 md:gap-3 font-black tracking-[0.15em] text-foreground")}>
                    {word.split("").map((letter, index) => (
                        <span key={index} className={cn(
                          "border-b-4 md:border-b-6 border-primary flex items-center justify-center font-black",
                          isFullscreen ? "w-8 h-10 sm:w-11 sm:h-14 md:w-14 md:h-16 text-xl sm:text-2xl md:text-3xl" : "w-10 h-12 md:w-14 md:h-16 text-2xl md:text-3xl"
                        )}>
                            {guessedLetters.includes(letter) || gameState === 'finished' ? letter : "_"}
                        </span>
                    ))}
                </div>

                <div className={cn("flex items-center justify-center gap-2 text-muted-foreground font-bold uppercase tracking-wider max-w-2xl px-4", isFullscreen ? "text-sm md:text-base" : "text-sm")}>
                    <Lightbulb className="text-amber-400 h-5 w-5 shrink-0" />
                    <p className="line-clamp-2">{hint}</p>
                </div>

                {gameState === 'playing' ? (
                     <div className="space-y-1.5 sm:space-y-2 w-full max-w-3xl pt-1">
                        {keyboardRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5 md:gap-2">
                                {row.map(letter => {
                                    const isGuessed = guessedLetters.includes(letter);
                                    return (
                                        <Button
                                            key={letter}
                                            variant={isGuessed ? "secondary" : "outline"}
                                            className={cn(
                                                "font-black shadow-sm transition-all duration-200",
                                                isFullscreen 
                                                  ? "w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-13 text-sm sm:text-base md:text-lg rounded-xl border" 
                                                  : "w-8 h-10 md:w-10 md:h-12 text-sm md:text-base",
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
                     <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500 py-2">
                        <p className={cn("font-black uppercase tracking-tighter", isWinner ? "text-green-500 text-3xl md:text-4xl" : "text-destructive text-3xl md:text-4xl")}>
                            {isWinner ? "MISSION SUCCESS!" : "CRITICAL FAILURE!"}
                        </p>
                        {!isWinner && (
                            <div className={cn("p-4 rounded-2xl bg-muted/20 border-2 border-primary/20 text-center", isFullscreen ? "px-8 py-4" : "p-4")}>
                                <p className="text-muted-foreground font-black text-xs uppercase tracking-widest">The word was:</p>
                                <p className={cn("font-black text-primary uppercase italic", isFullscreen ? "text-4xl" : "text-3xl")}>{word}</p>
                            </div>
                        )}
                        <Button onClick={() => setGameState('selecting_category')} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-12 px-8 text-lg rounded-xl shadow-lg")}><Repeat className={cn("mr-2 h-4 w-4")}/>New Game</Button>
                    </div>
                )}
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 shrink-0", isFullscreen ? "max-w-5xl mx-auto w-full pt-2 pb-2" : "pt-8")}>
        <Button variant="outline" asChild size={isFullscreen ? "default" : "default"} className={cn(isFullscreen && "h-10 px-5 text-xs font-bold rounded-xl")}>
            <Link href="/games">Exit Challenge</Link>
        </Button>
        {gameState === 'playing' && 
            <div className="flex gap-2 sm:gap-3">
                <Button variant="secondary" onClick={() => setGameState('selecting_category')} size={isFullscreen ? "default" : "default"} className={cn(isFullscreen && "h-10 px-4 text-xs font-bold rounded-xl")}>Switch Category</Button>
                <Button variant="secondary" onClick={() => handleNewWord(difficulty, category)} size={isFullscreen ? "default" : "default"} className={cn(isFullscreen && "h-10 px-4 text-xs font-bold rounded-xl")}><Shuffle className="mr-1.5 h-3.5 w-3.5"/>Reroll Word</Button>
            </div>
        }
      </CardFooter>
    </Card>
  );
}
