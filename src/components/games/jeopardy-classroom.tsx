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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { generateJeopardyBoard } from "@/ai/flows/generate-jeopardy-board";
import type { GenerateJeopardyBoardOutput } from "@/ai/flows/schemas/jeopardy-schema";
import { Loader2, Sparkles, UserPlus, Trash2, Repeat, Check, X, HelpCircle, Trophy, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

type GameState = "setup" | "loading" | "playing" | "finished" | "instructions" | "idle";
type Team = { name: string; score: number };
type Question = GenerateJeopardyBoardOutput["categories"][0]["questions"][0] & { answered: boolean };
type Category = { categoryName: string; questions: Question[] };

export function JeopardyClassroom({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [teams, setTeams] = React.useState<Team[]>([
    { name: "Team 1", score: 0 },
    { name: "Team 2", score: 0 },
  ]);
  const [board, setBoard] = React.useState<Category[]>([]);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [activeQuestion, setActiveQuestion] = React.useState<{ catIndex: number; qIndex: number } | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [highlightedQuestion, setHighlightedQuestion] = React.useState<{ catIndex: number; qIndex: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = async () => {
    if (teams.length < 1) {
      toast({ variant: "destructive", title: "Add at least one team." });
      return;
    }
    setGameState("loading");
    setTeams(teams.map(t => ({ ...t, score: 0 })));
    try {
      const { categories } = await generateJeopardyBoard({ difficulty: 'intermediate' });
      const boardWithState = categories.map(cat => ({
        ...cat,
        questions: cat.questions.map(q => ({ ...q, answered: false })),
      }));
      setBoard(boardWithState);
      setCurrentTurn(0);
      setGameState("playing");
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Could not generate the game board." });
      setGameState("setup");
    }
  };
  
  const handleQuestionClick = React.useCallback((catIndex: number, qIndex: number) => {
    if (board[catIndex]?.questions[qIndex]?.answered) return;
    setActiveQuestion({ catIndex, qIndex });
    setIsAnswerRevealed(false);
  }, [board]);


  const startTurnAnimation = React.useCallback(() => {
    let availableQuestionsForLowestPoints: { catIndex: number; qIndex: number }[] = [];
    const pointValues = [100, 200, 300, 400, 500];
    
    for (const points of pointValues) {
        const qIndex = board[0].questions.findIndex(q => q.points === points);
        if (qIndex === -1) continue;

        const questionsAtThisLevel = board
            .map((cat, catIndex) => ({ cat, catIndex }))
            .filter(({ cat }) => !cat.questions[qIndex].answered)
            .map(({ catIndex }) => ({ catIndex, qIndex }));
        
        if (questionsAtThisLevel.length > 0) {
            availableQuestionsForLowestPoints = questionsAtThisLevel;
            break;
        }
    }

    if (availableQuestionsForLowestPoints.length === 0) {
        setGameState("finished");
        return;
    }

    setIsAnimating(true);

    const winner = availableQuestionsForLowestPoints[Math.floor(Math.random() * availableQuestionsForLowestPoints.length)];
    const scanPath = availableQuestionsForLowestPoints;
    const cycles = 2;
    let animationSequence = [];
    for (let i = 0; i < cycles; i++) {
      animationSequence.push(...[...scanPath].sort(() => Math.random() - 0.5));
    }
    
    const winnerIndexInScanPath = scanPath.findIndex(p => p.catIndex === winner.catIndex && p.qIndex === winner.qIndex);
    if (winnerIndexInScanPath !== -1) {
        animationSequence.push(...scanPath.slice(0, winnerIndexInScanPath + 1));
    } else {
        animationSequence.push(winner);
    }
    
    let step = 0;
    const animate = () => {
      if (step >= animationSequence.length) {
        setIsAnimating(false);
        setHighlightedQuestion(winner);
        setTimeout(() => {
          setHighlightedQuestion(null);
          handleQuestionClick(winner.catIndex, winner.qIndex);
        }, 500);
        return;
      }
      
      setHighlightedQuestion(animationSequence[step]);
      step++;
      const progress = step / animationSequence.length;
      const delay = 30 + Math.pow(progress, 2) * 150;
      setTimeout(animate, delay);
    };
    animate();
  }, [board, handleQuestionClick]);


  const handleAnswerAdjudication = (wasCorrect: boolean) => {
    if (!activeQuestion) return;
    const { catIndex, qIndex } = activeQuestion;
    const points = board[catIndex].questions[qIndex].points;

    const newTeams = [...teams];
    if (wasCorrect) {
      newTeams[currentTurn].score += points;
    } else {
      newTeams[currentTurn].score -= points;
    }
    setTeams(newTeams);
    
    const newBoard = [...board];
    newBoard[catIndex].questions[qIndex].answered = true;
    setBoard(newBoard);
    
    setActiveQuestion(null);

    if (newBoard.every(cat => cat.questions.every(q => q.answered))) {
      setGameState("finished");
    } else {
      setCurrentTurn((prev) => (prev + 1) % teams.length);
    }
  };

  const handleTeamNameChange = (index: number, name: string) => {
    const newTeams = [...teams];
    newTeams[index].name = name;
    setTeams(newTeams);
  };
  
  const addTeam = () => {
    if (teams.length < 4) {
      setTeams([...teams, { name: `Team ${teams.length + 1}`, score: 0 }]);
    }
  };

  const removeTeam = (index: number) => {
    if (teams.length > 1) {
      setTeams(teams.filter((_, i) => i !== index));
    }
  };

  const resetGame = () => {
      setGameState('setup');
  }

  const Icon = game.icon;
  const currentQuestion = activeQuestion ? board[activeQuestion.catIndex].questions[activeQuestion.qIndex] : null;

  return (
    <>
      <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" 
            : "max-w-6xl mx-auto bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
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
        </CardHeader>
        <CardContent className={cn(
            "space-y-6 text-center flex flex-col items-center justify-center",
            isFullscreen ? "min-h-[60vh] max-w-7xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
        )}>
          {gameState === 'idle' && (
            <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready for a classroom clash of wits?</p>
                <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                    <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} /> Initialize
                </Button>
            </div>
          )}
          {gameState === 'instructions' && (
             <div className={cn(
                 "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                 isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
             )}>
                <h3 className={cn("font-bold text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                    <p>1. Set up your teams (1 to 4 players/teams).</p>
                    <p>2. On your turn, click the "Select Question" button to start the animation.</p>
                    <p>3. The game will randomly select a question from the lowest point value available.</p>
                    <p>4. The team answers the question.</p>
                    <p>5. The game master awards or deducts points based on the answer.</p>
                </div>
                <Button onClick={() => setGameState('setup')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Initialize Board</Button>
            </div>
          )}
          {gameState === 'setup' && (
            <div className="w-full max-w-md space-y-6">
                <h3 className="text-xl font-bold text-center">Setup Teams</h3>
                 <div className="space-y-2">
                    {teams.map((team, index) => (
                        <div key={index} className="flex items-center gap-2">
                        <Input value={team.name} onChange={(e) => handleTeamNameChange(index, e.target.value)} />
                        <Button variant="ghost" size="icon" onClick={() => removeTeam(index)} disabled={teams.length <= 1}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </div>
                    ))}
                 </div>
                <div className="flex flex-col gap-3">
                    <Button variant="outline" onClick={addTeam} className="w-full" disabled={teams.length >= 4}>
                        <UserPlus className="mr-2" /> Add Team
                    </Button>
                    <Button onClick={handleStartGame} size="lg" className="w-full h-14 font-black uppercase text-xl rounded-2xl shadow-lg mt-4">Begin Competition</Button>
                </div>
            </div>
          )}
          {gameState === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-6">
                <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                <p className={cn("text-muted-foreground animate-pulse font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-lg")}>Compiling trivia database...</p>
            </div>
          )}
          
          {gameState === 'playing' && (
            <div className="w-full space-y-10 flex flex-col items-center">
               <div className={cn(
                   "w-full grid gap-4 text-center font-black uppercase tracking-widest",
                   teams.length === 2 && "grid-cols-2",
                   teams.length === 3 && "grid-cols-3",
                   teams.length >= 4 && "grid-cols-4",
                   isFullscreen && "max-w-5xl"
               )}>
                {teams.map((team, index) => (
                  <div key={team.name} className={cn(
                      "p-4 rounded-2xl border-4 transition-all",
                      currentTurn === index ? "border-primary bg-primary/10 scale-105 shadow-xl shadow-primary/20" : "bg-muted border-transparent opacity-70",
                      isFullscreen && "p-6"
                  )}>
                    <p className={cn("truncate", isFullscreen ? "text-2xl" : "text-sm")}>{team.name}</p>
                    <p className={cn("text-primary", isFullscreen ? "text-4xl" : "text-xl")}>{team.score} pts</p>
                  </div>
                ))}
              </div>

               <div className="text-center p-4">
                  <h3 className={cn("font-black uppercase tracking-widest mb-6", isFullscreen ? "text-4xl" : "text-xl")}>
                    IT'S <span className="text-primary italic">"{teams[currentTurn].name}"</span> MISSION!
                  </h3>
                  <Button onClick={startTurnAnimation} disabled={isAnimating} size={isFullscreen ? "lg" : "default"} className={cn("font-black uppercase shadow-xl", isFullscreen && "h-20 px-16 text-2xl rounded-3xl")}>
                      {isAnimating ? <Loader2 className="mr-3 animate-spin" /> : <Sparkles className="mr-3" />}
                      Select Next Target
                  </Button>
              </div>

              <div className={cn("grid gap-3 w-full", isFullscreen && "gap-6 max-w-7xl")} style={{gridTemplateColumns: `repeat(${board.length}, 1fr)`}}>
                {board.map((cat, catIndex) => (
                  <div key={cat.categoryName} className="space-y-3 flex flex-col">
                    <div className={cn(
                        "bg-primary text-primary-foreground flex items-center justify-center text-center p-3 rounded-2xl font-black uppercase tracking-tighter border-4 border-white/10 shadow-lg",
                        isFullscreen ? "h-28 text-2xl" : "h-20 text-xs"
                    )}>
                        {cat.categoryName}
                    </div>
                    {cat.questions.map((q, qIndex) => (
                      <Button
                        key={q.points}
                        disabled={q.answered || isAnimating}
                        className={cn(
                            "font-black bg-secondary hover:bg-secondary/80 border-4 border-black/5 transition-all duration-100 shadow-md",
                            isFullscreen ? "h-24 text-4xl rounded-2xl" : "h-16 text-xl rounded-xl",
                            highlightedQuestion?.catIndex === catIndex && highlightedQuestion?.qIndex === qIndex && "ring-8 ring-yellow-400 scale-110 z-50",
                            q.answered && "opacity-20 grayscale border-none shadow-none"
                        )}
                      >
                        {q.points}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {gameState === 'finished' && (
            <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
                <div className="space-y-2">
                    <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Game Over!</h2>
                    <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>🎉 {teams.reduce((p, c) => p.score > c.score ? p : c).name} wins! 🎉</p>
                </div>
                <Card className={cn("w-full max-w-sm p-6 bg-card/50", isFullscreen && "max-w-xl p-12")}>
                    <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Final Ledger</h3>
                    <div className="flex flex-col gap-4">
                        {[...teams].sort((a,b) => b.score - a.score).map((team, index) => (
                            <div key={team.name} className={cn("flex justify-between font-bold", isFullscreen ? "text-3xl" : "text-xl")}>
                                <span>{index + 1}. {team.name}:</span>
                                <span className="text-primary">{team.score} points</span>
                            </div>
                        ))}
                    </div>
                </Card>
                <Button onClick={resetGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}><Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")}/>New Session</Button>
            </div>
          )}
        </CardContent>
        <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-7xl mx-auto w-full pb-16")}>
            <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
                <Link href="/games">Back to Library</Link>
            </Button>
            {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'setup' && (
                <Button variant="secondary" onClick={resetGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Abort Session</Button>
            )}
        </CardFooter>
      </Card>
      
      <Dialog open={!!activeQuestion} onOpenChange={() => setActiveQuestion(null)}>
        <DialogContent className={cn(isFullscreen ? "sm:max-w-4xl rounded-[3rem] p-16" : "")}>
            <DialogHeader>
                <DialogTitle className={cn("font-black uppercase tracking-widest text-primary", isFullscreen && "text-3xl")}>{currentQuestion && `${board[activeQuestion!.catIndex].categoryName} for ${currentQuestion.points}`}</DialogTitle>
                <DialogDescription className={cn("font-bold text-foreground leading-tight py-8", isFullscreen ? "text-[4vw]" : "text-3xl")}>{currentQuestion?.question}</DialogDescription>
            </DialogHeader>
            {isAnswerRevealed && (
                 <div className={cn("p-8 rounded-3xl bg-green-500/10 border-4 border-green-500/50 text-center animate-in zoom-in duration-300", isFullscreen ? "my-10" : "my-4")}>
                    <p className={cn("font-black uppercase tracking-widest text-green-600 mb-2", isFullscreen ? "text-2xl" : "text-xs")}>Confirmed Answer:</p>
                    <p className={cn("font-black uppercase italic text-green-700", isFullscreen ? "text-6xl" : "text-3xl")}>{currentQuestion?.answer}</p>
                 </div>
            )}
            <DialogFooter className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4", isFullscreen && "mt-10")}>
                <Button variant="outline" onClick={() => setIsAnswerRevealed(true)} className={cn("font-black uppercase", isFullscreen && "h-20 text-xl rounded-2xl border-4")}><HelpCircle className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Reveal Intel</Button>
                <Button variant="destructive" onClick={() => handleAnswerAdjudication(false)} className={cn("font-black uppercase", isFullscreen && "h-20 text-xl rounded-2xl")}><X className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Incorrect</Button>
                <Button className={cn("bg-green-600 hover:bg-green-700 text-white font-black uppercase", isFullscreen && "h-20 text-xl rounded-2xl")} onClick={() => handleAnswerAdjudication(true)}><Check className={cn("mr-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")}/>Correct</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}