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
import { startTwentyQuestions } from "@/ai/flows/start-twenty-questions";
import { guessTwentyQuestions } from "@/ai/flows/guess-twenty-questions";
import { Loader2, Sparkles, Send, HelpCircle, Repeat, Lightbulb, Key, Shuffle, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/lib/types";
import Link from "next/link";

type GameState = "idle" | "loading" | "playing" | "finished" | "instructions";
type Question = {
  question: string;
  answer: "Yes" | "No" | "Maybe" | "I don't know";
  comment?: string | null;
};

const MAX_QUESTIONS = 20;

export function TwentyQuestions({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard">("easy");
  const [secretObject, setSecretObject] = React.useState<string | null>(null);
  const [usedObjects, setUsedObjects] = React.useState<string[]>([]);
  const [initialClue, setInitialClue] = React.useState<string | null>(null);
  const [questionHistory, setQuestionHistory] = React.useState<Question[]>([]);
  const [userQuestion, setUserQuestion] = React.useState("");
  const [isAiThinking, setIsAiThinking] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  React.useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [questionHistory, isAiThinking]);


  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    setGameState("loading");
    setSecretObject(null);
    setInitialClue(null);
    setQuestionHistory([]);
    setUserQuestion("");
    try {
      const result = await startTwentyQuestions({ difficulty, usedObjects });
      setSecretObject(result.secretObject);
      setInitialClue(result.initialClue);
      setUsedObjects(prev => [...prev, result.secretObject]);
      setGameState("playing");
    } catch (error) {
      console.error("Failed to start game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
      setGameState("idle");
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || isAiThinking || !secretObject) return;
    if (questionHistory.length >= MAX_QUESTIONS) {
        toast({ title: "Game Over", description: "You've used all 20 questions!" });
        setGameState("finished");
        return;
    }
    
    const currentQuestion = userQuestion;
    setIsAiThinking(true);
    setUserQuestion("");

    try {
        const result = await guessTwentyQuestions({
            secretObject,
            questionHistory: questionHistory.map(h => ({question: h.question, answer: h.answer})),
            userQuestion: currentQuestion,
        });
        setQuestionHistory(prev => [...prev, { question: currentQuestion, ...result }]);
    } catch(e) {
        toast({ variant: "destructive", title: "Error", description: "The AI seems to be stumped. Try asking again." });
    } finally {
        setIsAiThinking(false);
    }
  };
  
  const handleFinalGuess = () => {
      const guess = userQuestion.trim().toLowerCase();
      const secret = secretObject?.toLowerCase();
      if (!guess) {
          toast({ variant: "destructive", title: "Empty Guess", description: `Please type your guess in the box.`});
          return;
      };

      if (guess === secret) {
          toast({ title: "You got it!", description: `The secret object was "${secretObject}". Starting next round...`, className: "bg-green-200 dark:bg-green-800" });
          setTimeout(() => {
            handleStartGame();
          }, 1500);
      } else {
          toast({ variant: "destructive", title: "Not quite!", description: `Your guess of "${userQuestion}" was incorrect.`});
          setGameState("finished");
      }
  }


  const Icon = game.icon;

  const renderContent = () => {
    switch (gameState) {
      case "idle":
        return (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>I'm thinking of an object. Can you guess it?</p>
                <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Sparkles className={cn("mr-2", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Start Game
                </Button>
            </div>
        );
      case "instructions":
        return (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-3", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. The AI will think of a secret object and give you a clue about its category.</p>
                    <p>2. You can ask up to {MAX_QUESTIONS} "yes" or "no" questions to try and figure it out.</p>
                    <p>3. Type your question in the box and click the question mark button (<HelpCircle className="inline h-4 w-4"/>).</p>
                    <p>4. When you think you know the answer, type your guess in the box and click the key button (<Key className="inline h-4 w-4"/>) to make your final guess!</p>
                </div>
                <div className={cn("w-full max-w-xs space-y-2 self-center mt-4", isFullscreen && "max-w-md")}>
                    <label className={cn("font-medium", isFullscreen && "text-xl")}>Select Difficulty</label>
                     <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                        <SelectTrigger className={cn(isFullscreen && "h-16 text-xl")}><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>Initialize</Button>
            </div>
        );
      case "loading":
        return (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-base")}>Thinking of a secret object...</p>
            </div>
        );
      case "playing":
        return (
             <div className="w-full h-full text-left flex flex-col gap-4">
                <div className={cn("flex justify-between items-center p-4 bg-muted rounded-2xl shadow-inner", isFullscreen && "p-8")}>
                    <div className="flex items-center gap-4">
                        <Lightbulb className={cn("text-amber-400", isFullscreen ? "h-12 w-12" : "h-6 w-6")}/>
                        <p className={cn("font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-base")}>{initialClue}</p>
                    </div>
                    <Badge variant="secondary" className={cn(isFullscreen && "text-2xl px-6 py-2")}>{questionHistory.length} / {MAX_QUESTIONS}</Badge>
                </div>
                <div ref={chatContainerRef} className={cn("flex-grow overflow-y-auto p-2 space-y-6", isFullscreen ? "h-[50vh]" : "h-64 max-h-80")}>
                    {questionHistory.map((q, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-end">
                                <p className={cn("bg-primary text-primary-foreground p-4 rounded-3xl max-w-xs shadow-lg", isFullscreen ? "text-2xl max-w-xl" : "text-base")}>{q.question}</p>
                           </div>
                           <div className="flex justify-start">
                                <div className={cn("p-4 rounded-3xl max-w-xs shadow-lg", q.answer === 'Yes' ? 'bg-green-500 text-white' : q.answer === 'No' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white', isFullscreen ? "text-2xl max-w-xl" : "text-base")}>
                                    <strong className={cn("font-black block uppercase tracking-widest", isFullscreen ? "text-4xl" : "text-lg")}>{q.answer}</strong>
                                    {q.comment && <span className={cn("block italic mt-2 opacity-90", isFullscreen ? "text-xl" : "text-xs")}>{q.comment}</span>}
                                </div>
                           </div>
                        </div>
                    ))}
                    {isAiThinking && <div className="flex justify-start p-4"><Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-12 w-12" : "h-6 w-6")}/></div>}
                </div>
                <div className={cn("flex gap-3 pt-4 border-t-4 border-muted", isFullscreen && "p-8")}>
                    <Input 
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        placeholder="Ask a yes/no question or make a guess..."
                        className={cn(isFullscreen ? "h-20 text-3xl rounded-2xl px-8" : "h-12")}
                        disabled={isAiThinking}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAskQuestion();
                            }
                        }}
                    />
                    <Button onClick={handleAskQuestion} disabled={isAiThinking || !userQuestion.trim()} className={cn(isFullscreen ? "h-20 w-20" : "h-12 w-12", "p-0")}><HelpCircle className={cn(isFullscreen ? "h-10 w-10" : "h-6 w-6")}/></Button>
                    <Button onClick={handleFinalGuess} disabled={isAiThinking || !userQuestion.trim()} variant="secondary" className={cn("bg-amber-500 hover:bg-amber-600 text-white shadow-xl", isFullscreen ? "h-20 w-20" : "h-12 w-12", "p-0")}><Key className={cn(isFullscreen ? "h-10 w-10" : "h-6 w-6")}/></Button>
                </div>
             </div>
        );
      case "finished":
        return (
             <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                 <h3 className={cn("font-black uppercase tracking-tighter text-destructive", isFullscreen ? "text-7xl" : "text-3xl")}>Game Over!</h3>
                 <div className={cn("p-8 rounded-3xl bg-muted/20 border-4 border-primary/20 shadow-inner text-center", isFullscreen ? "p-16" : "p-6")}>
                    <p className={cn("text-muted-foreground uppercase tracking-widest font-black mb-4", isFullscreen ? "text-2xl" : "text-sm")}>The secret object was:</p>
                    <strong className={cn("text-primary font-black uppercase italic", isFullscreen ? "text-[8vw]" : "text-4xl")}>{secretObject}</strong>
                 </div>
                 <Button onClick={handleStartGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Try Again
                </Button>
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
            : "max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
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
            <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[24rem] flex flex-col items-center justify-center"
      )}>
        {renderContent()}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Link href="/games">Abort Game</Link>
        </Button>
        {gameState === 'playing' && (
          <Button variant="secondary" onClick={handleStartGame} disabled={isAiThinking} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
            <Shuffle className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
            Skip Object
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
