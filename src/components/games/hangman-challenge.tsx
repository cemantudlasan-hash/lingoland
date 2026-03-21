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
        <svg viewBox="0 0 200 250" className={cn("text-foreground", isFullscreen ? "w-64 h-80" : "w-32 h-40 md:w-48 md:h-60")}>
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
        <div className="flex justify-center items-center gap-2 pt-2">
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty.toUpperCase()}</Badge>
            {(gameState === 'playing' || gameState === 'finished') && <Badge variant="secondary" className={cn(isFullscreen && "text-xl px-6 py-1")}>{category.toUpperCase()}</Badge>}
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[20rem] p-6"
      )}>
        {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to decipher the hidden word?</p>
                <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Start Game</Button>
            </div>
        )}
         {gameState === "instructions" && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. A secret word is masked by underscores. Your goal is to reveal it.</p>
                    <p>2. Guess letters using the digital keyboard. Correct guesses appear; incorrect ones build the hangman.</p>
                    <p>3. You have {MAX_INCORRECT_GUESSES} chances before the mission fails.</p>
                </div>
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Let's Go!</Button>
            </div>
        )}
        {gameState === "selecting_difficulty" && (
             <div className="flex flex-col items-center gap-8">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Choose Difficulty</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    {["beginner", "intermediate", "advanced"].map(level => (
                        <Button key={level} onClick={() => { setDifficulty(level as SkillLevel); setGameState('selecting_category'); }} size={isFullscreen ? "lg" : "default"} variant="outline" className={cn("font-black uppercase", isFullscreen && "h-20 px-12 text-2xl rounded-3xl border-4")}>{level}</Button>
                    ))}
                </div>
            </div>
        )}
        {gameState === 'selecting_category' && (
            <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
                <p className={cn("text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Select Research Category</p>
                <ScrollArea className={cn("w-full border-4 rounded-3xl bg-muted/20 p-4", isFullscreen ? "h-[50vh]" : "h-72")}>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
                        {CATEGORIES.map(cat => (
                            <Button key={cat} onClick={() => handleStartGame(cat)} variant="outline" className={cn("font-bold", isFullscreen && "text-xl h-16")}>
                                {cat}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        )}
        {gameState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Selecting secret word...</p>
            </div>
        )}
        
        {(gameState === "playing" || gameState === "finished") && word && (
            <div className="flex flex-col items-center gap-8 w-full">
                <HangmanFigure incorrectGuesses={incorrectGuesses} isFullscreen={isFullscreen} />
                
                <div className={cn("flex flex-wrap justify-center gap-3 font-black tracking-[0.2em] text-foreground", isFullscreen ? "text-[6vw]" : "text-4xl md:text-5xl")}>
                    {word.split("").map((letter, index) => (
                        <span key={index} className={cn("border-b-8 border-primary flex items-center justify-center", isFullscreen ? "min-w-[8vw] h-[10vw]" : "w-12 h-14 md:w-16 md:h-20")}>
                            {guessedLetters.includes(letter) || gameState === 'finished' ? letter : "_"}
                        </span>
                    ))}
                </div>

                <div className={cn("flex items-center gap-4 text-muted-foreground font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-lg")}>
                    <Lightbulb className={cn("text-amber-400", isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                    <p>{hint}</p>
                </div>

                {gameState === 'playing' ? (
                     <div className={cn("space-y-3 w-full max-w-4xl", isFullscreen && "mt-10")}>
                        {keyboardRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-2">
                                {row.map(letter => {
                                    const isGuessed = guessedLetters.includes(letter);
                                    return (
                                        <Button
                                            key={letter}
                                            variant={isGuessed ? "secondary" : "outline"}
                                            className={cn(
                                                "font-black shadow-md transition-all duration-200",
                                                isFullscreen ? "w-20 h-20 text-3xl rounded-2xl border-4" : "w-10 h-10 md:w-12 md:h-12 text-lg",
                                                isGuessed && "opacity-30 scale-90"
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
                     <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                        <p className={cn("font-black uppercase tracking-tighter", isWinner ? "text-green-500 text-6xl" : "text-destructive text-6xl")}>
                            {isWinner ? "MISSION SUCCESS!" : "CRITICAL FAILURE!"}
                        </p>
                        {!isWinner && (
                            <div className={cn("p-8 rounded-3xl bg-muted/20 border-4 border-primary/20 text-center", isFullscreen ? "p-12" : "p-6")}>
                                <p className="text-muted-foreground font-black mb-2 uppercase tracking-widest">The word was:</p>
                                <p className={cn("font-black text-primary uppercase italic", isFullscreen ? "text-7xl" : "text-4xl")}>{word}</p>
                            </div>
                        )}
                        <Button onClick={() => setGameState('selecting_category')} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}><Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")}/>New Game</Button>
                    </div>
                )}
            </div>
        )}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Exit Challenge</Link>
        </Button>
        {gameState === 'playing' && 
            <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setGameState('selecting_category')} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Switch Category</Button>
                <Button variant="secondary" onClick={() => handleNewWord(difficulty, category)} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}><Shuffle className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Reroll Word</Button>
            </div>
        }
      </CardFooter>
    </Card>
  );
}
