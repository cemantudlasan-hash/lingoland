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
import { Input } from "../ui/input";
import { Eye, EyeOff, ListChecks, Pencil, Save, X, Sparkles, Maximize, Minimize, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

type GameState = "idle" | "instructions" | "playing" | "editing";

type QuizItem = {
  question: string;
  answers: { text: string; points: number }[];
};

const initialQuiz: QuizItem = {
  question: "Name an anime movie",
  answers: [
    { text: "My Hero Academia", points: 10 },
    { text: "Jujutsu Kaisen", points: 7 },
    { text: "Demon Slayer", points: 5 },
    { text: "Bleach", points: 3 },
    { text: "Reincarnated as a Slime", points: 2 },
  ],
};

const answerColors = [
    { bg: 'bg-green-500', text: 'text-white', pointsText: 'text-green-500' },
    { bg: 'bg-yellow-400', text: 'text-black', pointsText: 'text-yellow-400' },
    { bg: 'bg-red-500', text: 'text-white', pointsText: 'text-red-500' },
    { bg: 'bg-pink-400', text: 'text-white', pointsText: 'text-pink-500' },
    { bg: 'bg-purple-500', text: 'text-white', pointsText: 'text-purple-500' },
]


export function Top5Quiz({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [quizData, setQuizData] = React.useState<QuizItem>(initialQuiz);
  const [answersVisible, setAnswersVisible] = React.useState<boolean[]>(Array(5).fill(false));
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleToggleAnswer = (index: number) => {
    const newAnswersVisible = [...answersVisible];
    newAnswersVisible[index] = !newAnswersVisible[index];
    setAnswersVisible(newAnswersVisible);
  };
  
  const handleQuizItemChange = (index: number, value: string) => {
    const newAnswers = [...quizData.answers];
    newAnswers[index].text = value;
    setQuizData({...quizData, answers: newAnswers});
  }

  const handleQuestionChange = (value: string) => {
    setQuizData({...quizData, question: value});
  }
  
  const handleSaveChanges = () => {
      setGameState("playing");
      setAnswersVisible(Array(5).fill(false));
  }

  const Icon = game.icon;

  const renderContent = () => {
    switch (gameState) {
      case "idle":
      case "instructions":
        const isInstructions = gameState === 'instructions';
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            {isInstructions ? (
              <div className={cn(
                  "flex flex-col items-center justify-center gap-6 text-center bg-muted/50 rounded-[2rem] border-4 border-primary/20 shadow-inner",
                  isFullscreen ? "p-20 max-w-5xl" : "p-8 max-w-lg"
              )}>
                <h3 className={cn("font-black uppercase tracking-widest mb-6", isFullscreen ? "text-5xl" : "text-2xl")}>HOW TO PLAY:</h3>
                <div className={cn("space-y-6 text-left font-bold", isFullscreen ? "text-3xl" : "text-xl")}>
                  <p>1. Each question has multiple secret answers.</p>
                  <p>2. Brainstorm and submit <span className="text-primary underline">ONE</span> guess.</p>
                  <p>3. If your guess is in the "Top 5", you earn massive points!</p>
                </div>
                <Button onClick={() => setGameState('playing')} size="lg" className={cn("mt-10 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-24 px-20 text-4xl rounded-3xl")}>Initialize</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-4xl" : "text-base")}>Ready to climb the rankings?</p>
                <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                  <Sparkles className={cn("mr-2 h-5 w-5", isFullscreen && "h-10 w-10")} /> Initialize
                </Button>
              </div>
            )}
          </div>
        );
      case "playing":
      case "editing":
        const totalPointsRevealed = quizData.answers.reduce(
          (sum, item, idx) => (answersVisible[idx] ? sum + item.points : sum),
          0
        );
        const allRevealed = answersVisible.every(Boolean);

        return (
          <div className={cn("w-full flex flex-col items-center max-w-5xl mx-auto", isFullscreen && "max-w-7xl")}>
            {/* Top Action & Session Score Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 sm:mb-6 w-full">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1 font-bold text-xs sm:text-sm bg-primary/10 border-primary/30 text-primary">
                    Revealed Points: <span className="font-mono font-black ml-1.5 text-sm sm:text-base">{totalPointsRevealed} pts</span>
                  </Badge>
                  {gameState === 'playing' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setAnswersVisible(Array(5).fill(!allRevealed))}
                    >
                      {allRevealed ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                      <span className="hidden sm:inline">{allRevealed ? "Hide All" : "Reveal All"}</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                    {gameState === 'editing' ? (
                        <Button onClick={handleSaveChanges} className={cn("bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg rounded-xl h-9 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm")}>
                            <Save className="mr-1.5 h-4 w-4" /> Commit Data
                        </Button>
                    ) : (
                        <Button variant="secondary" onClick={() => setGameState('editing')} className={cn("font-bold rounded-xl h-9 sm:h-11 px-3 sm:px-5 text-xs sm:text-sm")}>
                            <Pencil className="mr-1.5 h-4 w-4" /> Edit Quiz
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Question Display Billboard */}
            <div className={cn(
                "w-full bg-muted/30 backdrop-blur-sm border-2 sm:border-4 border-primary/40 rounded-2xl sm:rounded-3xl flex items-center justify-center p-4 sm:p-8 shadow-xl mb-4 sm:mb-6",
                isFullscreen ? "min-h-[160px] p-8 sm:p-12" : "min-h-[90px] sm:min-h-[120px]"
            )}>
                {gameState === 'editing' ? (
                    <Input 
                        value={quizData.question}
                        onChange={(e) => handleQuestionChange(e.target.value)}
                        className={cn("font-black text-center bg-transparent border-none focus-visible:ring-0 text-xl sm:text-3xl md:text-4xl text-foreground uppercase italic tracking-wide")}
                    />
                ) : (
                    <h2 className={cn("font-black text-center leading-snug uppercase italic tracking-wide text-xl sm:text-3xl md:text-4xl text-foreground")}>
                      {quizData.question}
                    </h2>
                )}
            </div>

            {/* Answers List (No Horizontal Overflows on Mobile, Gorgeous Spacing on Desktop) */}
            <div className="w-full space-y-2.5 sm:space-y-4">
                {quizData.answers.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 sm:gap-4 group w-full">
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                            {/* Rank Circle */}
                            <div className={cn(
                                "flex-shrink-0 rounded-full flex items-center justify-center font-black border-2 sm:border-4 shadow-md", 
                                answerColors[index].bg, answerColors[index].text,
                                "h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 text-base sm:text-2xl md:text-3xl"
                            )}>
                                {index + 1}
                            </div>

                            {/* Answer Box */}
                            <div className={cn(
                                "flex-1 min-w-0 bg-card border-2 sm:border-3 border-foreground/20 rounded-xl sm:rounded-2xl flex items-center justify-center relative px-3 sm:px-6 shadow-md transition-all",
                                "h-11 sm:h-14 md:h-16",
                                answersVisible[index] && "border-primary bg-primary/10 shadow-primary/10"
                            )}>
                                {gameState === 'editing' ? (
                                    <Input 
                                        value={item.text}
                                        onChange={(e) => handleQuizItemChange(index, e.target.value)}
                                        className={cn("font-black text-center border-none focus-visible:ring-0 bg-transparent text-sm sm:text-xl md:text-2xl w-full")}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className={cn(
                                            "font-black uppercase tracking-wide transition-all duration-300 truncate px-1", 
                                            "text-xs sm:text-lg md:text-xl",
                                            answersVisible[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                        )}>
                                            {item.text}
                                        </span>
                                        {!answersVisible[index] && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute inset-0 w-full h-full flex items-center justify-center hover:bg-primary/5 rounded-xl sm:rounded-2xl transition-colors cursor-pointer group"
                                                onClick={() => handleToggleAnswer(index)}
                                                title="Click to reveal answer"
                                            >
                                                <Eye className="h-5 w-5 sm:h-7 sm:w-7 text-primary/40 group-hover:text-primary transition-colors"/>
                                                <span className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground ml-1.5 opacity-60 group-hover:opacity-100">Reveal</span>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Points Indicator */}
                        <div className={cn(
                            "font-black tabular-nums transition-all duration-300 shrink-0 w-12 sm:w-16 md:w-20 text-right", 
                            "text-base sm:text-2xl md:text-3xl",
                            answersVisible[index] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2', 
                            answerColors[index].pointsText
                        )}>
                            +{item.points}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
                <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">{game.level.toUpperCase()}</Badge>
            </div>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
          {renderContent()}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
             <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
                <Link href="/games">Back to Library</Link>
            </Button>
            {(gameState === 'playing' || gameState === 'editing') && (
                <Button variant="secondary" onClick={() => { setGameState('idle'); setAnswersVisible(Array(5).fill(false)); }} className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
                    Reset Session
                </Button>
            )}
        </CardFooter>
    </Card>
  );
}