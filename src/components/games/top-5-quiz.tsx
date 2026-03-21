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
import { Eye, EyeOff, ListChecks, Pencil, Save, X, Sparkles, Maximize, Minimize } from "lucide-react";
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
        return (
          <div className={cn("w-full flex flex-col items-center", isFullscreen ? "max-w-7xl" : "max-w-3xl")}>
            <div className="flex justify-end items-center gap-4 mb-8 w-full">
                {gameState === 'editing' ? (
                    <Button onClick={handleSaveChanges} className={cn("bg-green-600 hover:bg-green-700 text-white font-black shadow-lg", isFullscreen && "h-16 px-10 text-xl rounded-2xl")}>
                        <Save className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Commit Data
                    </Button>
                ) : (
                    <Button variant="secondary" onClick={() => setGameState('editing')} className={cn("font-black", isFullscreen && "h-16 px-10 text-xl rounded-2xl")}>
                        <Pencil className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Modify Matrix
                    </Button>
                )}
            </div>
            
            <div className={cn(
                "w-full bg-muted/20 backdrop-blur-sm border-4 border-primary rounded-[3rem] flex items-center justify-center p-8 shadow-2xl mb-10",
                isFullscreen ? "min-h-[250px] p-16" : "min-h-[120px]"
            )}>
                {gameState === 'editing' ? (
                    <Input 
                        value={quizData.question}
                        onChange={(e) => handleQuestionChange(e.target.value)}
                        className={cn("font-black text-center bg-transparent border-none focus-visible:ring-0", isFullscreen ? "text-[5vw]" : "text-4xl")}
                    />
                ) : (
                    <h2 className={cn("font-black text-center leading-tight uppercase italic", isFullscreen ? "text-[6vw]" : "text-4xl")}>{quizData.question}</h2>
                )}
            </div>

            <div className={cn("w-full space-y-4", isFullscreen && "space-y-8")}>
                {quizData.answers.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-6 group">
                        <div className="flex items-center gap-6 flex-grow">
                            <div className={cn(
                                "flex-shrink-0 rounded-full flex items-center justify-center font-black border-4 shadow-xl", 
                                answerColors[index].bg, answerColors[index].text,
                                isFullscreen ? "h-24 w-24 text-5xl" : "h-14 w-14 text-3xl"
                            )}>
                                {index + 1}
                            </div>
                            <div className={cn(
                                "w-full bg-card border-4 border-foreground/20 rounded-[2rem] flex items-center justify-center relative px-8 shadow-lg transition-all",
                                isFullscreen ? "h-24" : "h-16",
                                answersVisible[index] && "border-primary bg-primary/5"
                            )}>
                                {gameState === 'editing' ? (
                                    <Input 
                                        value={item.text}
                                        onChange={(e) => handleQuizItemChange(index, e.target.value)}
                                        className={cn("font-black text-center border-none focus-visible:ring-0 bg-transparent", isFullscreen ? "text-4xl" : "text-2xl")}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className={cn(
                                            "font-black uppercase tracking-widest transition-all duration-500", 
                                            isFullscreen ? "text-4xl" : "text-2xl",
                                            answersVisible[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                        )}>
                                            {item.text}
                                        </span>
                                        {!answersVisible[index] && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute inset-0 w-full h-full flex items-center justify-center hover:bg-primary/5 rounded-[2rem] transition-colors"
                                                onClick={() => handleToggleAnswer(index)}
                                            >
                                                <Eye className={cn("text-primary/40 group-hover:text-primary transition-colors", isFullscreen ? "h-12 w-12" : "h-8 w-8")}/>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={cn(
                            "font-black tabular-nums transition-all duration-500", 
                            isFullscreen ? "text-6xl w-32" : "text-3xl w-20",
                            answersVisible[index] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4', 
                            answerColors[index].pointsText
                        )}>
                            +{item.points}
                        </div >
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
                <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{game.level.toUpperCase()}</Badge>
            </div>
        </CardHeader>
        <CardContent className={cn(
            "space-y-6 text-center flex flex-col items-center justify-center",
            isFullscreen ? "min-h-[60vh] max-w-7xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
        )}>
          {renderContent()}
        </CardContent>
        <CardFooter className={cn("flex justify-center gap-4 pt-8", isFullscreen && "pb-16")}>
             <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
                <Link href="/games">Back to Library</Link>
            </Button>
            {(gameState === 'playing' || gameState === 'editing') && (
                <Button variant="secondary" onClick={() => { setGameState('idle'); setAnswersVisible(Array(5).fill(false)); }} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
                    Reset Session
                </Button>
            )}
        </CardFooter>
    </Card>
  );
}