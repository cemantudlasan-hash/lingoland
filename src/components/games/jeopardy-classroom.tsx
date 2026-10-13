"use client";

import { shuffleArray } from "@/lib/shuffle";

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
    let animationSequence: { catIndex: number; qIndex: number }[] = [];
    for (let i = 0; i < cycles; i++) {
      animationSequence.push(...shuffleArray([...scanPath]));
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
        "w-full transition-all duration-500 flex flex-col overflow-y-auto overflow-x-hidden justify-between",
        isFullscreen 
            ? "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none bg-background p-2 sm:p-6" 
            : "flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full bg-card/80 backdrop-blur-sm border-border/20 shadow-lg rounded-2xl md:rounded-3xl"
      )}>
        <CardHeader className="text-center relative p-3 sm:p-6 shrink-0">
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
          <CardTitle className="font-black tracking-tight uppercase text-xl sm:text-3xl md:text-5xl">{game.title}</CardTitle>
          <CardDescription className="text-xs sm:text-base mt-1 max-w-xl mx-auto">{game.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 text-center flex flex-col items-center justify-center flex-1 w-full max-w-5xl mx-auto p-3 sm:p-6 overflow-y-auto">
          {gameState === 'idle' && (
            <div className="flex flex-col items-center gap-3 sm:gap-4 my-auto">
                <p className="text-muted-foreground text-sm sm:text-xl">Ready for a classroom clash of wits?</p>
                <Button onClick={() => setGameState('instructions')} className="h-11 sm:h-14 px-6 sm:px-12 text-sm sm:text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl rounded-xl">
                    <Sparkles className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" /> Initialize
                </Button>
            </div>
          )}
          {gameState === 'instructions' && (
             <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner p-4 sm:p-8 max-w-lg w-full my-auto">
                <h3 className="font-bold text-center text-lg sm:text-2xl">How to Play</h3>
                <div className="text-left space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground bg-background/50 p-3 sm:p-4 rounded-xl border border-border/20 w-full">
                    <p>1. Set up your teams (1 to 4 players/teams).</p>
                    <p>2. On your turn, click "Select Next Target" to spin the random target selector.</p>
                    <p>3. The game randomly highlights available questions starting from lowest point values.</p>
                    <p>4. Answer the prompt aloud, then adjudicate points accordingly.</p>
                </div>
                <Button onClick={() => setGameState('setup')} className="w-full h-11 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-xl shadow-xl">Initialize Board</Button>
            </div>
          )}
          {gameState === 'setup' && (
            <div className="w-full max-w-md space-y-4 sm:space-y-6 my-auto">
                <h3 className="text-lg sm:text-xl font-bold text-center">Setup Teams</h3>
                 <div className="space-y-2">
                    {teams.map((team, index) => (
                        <div key={index} className="flex items-center gap-2">
                        <Input value={team.name} onChange={(e) => handleTeamNameChange(index, e.target.value)} className="h-10 sm:h-11 text-xs sm:text-sm" />
                        <Button variant="ghost" size="icon" onClick={() => removeTeam(index)} disabled={teams.length <= 1} className="h-10 w-10">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </div>
                    ))}
                 </div>
                <div className="flex flex-col gap-2.5 sm:gap-3">
                    <Button variant="outline" onClick={addTeam} className="w-full h-10 sm:h-11 text-xs sm:text-sm font-bold rounded-xl" disabled={teams.length >= 4}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Team
                    </Button>
                    <Button onClick={handleStartGame} className="w-full h-12 sm:h-14 font-black uppercase text-sm sm:text-lg rounded-xl shadow-lg mt-2 bg-primary text-primary-foreground">Begin Competition</Button>
                </div>
            </div>
          )}
          {gameState === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 my-auto">
                <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-16 sm:w-16" />
                <p className="text-muted-foreground animate-pulse font-black uppercase tracking-wider text-xs sm:text-sm">Compiling trivia database...</p>
            </div>
          )}
          
          {gameState === 'playing' && (
            <div className="w-full space-y-4 sm:space-y-8 flex flex-col items-center my-auto">
               <div className={cn(
                   "w-full grid gap-2 sm:gap-4 text-center font-black uppercase tracking-wider",
                   teams.length === 2 && "grid-cols-2",
                   teams.length === 3 && "grid-cols-3",
                   teams.length >= 4 && "grid-cols-2 sm:grid-cols-4",
                   "max-w-4xl"
               )}>
                {teams.map((team, index) => (
                  <div key={team.name} className={cn(
                      "p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 sm:border-4 transition-all",
                      currentTurn === index ? "border-primary bg-primary/10 scale-102 shadow-lg shadow-primary/20" : "bg-muted border-transparent opacity-70"
                  )}>
                    <p className="truncate text-xs sm:text-sm">{team.name}</p>
                    <p className="text-primary text-sm sm:text-xl">{team.score} pts</p>
                  </div>
                ))}
              </div>

               <div className="text-center p-2">
                  <h3 className="font-black uppercase tracking-wider mb-3 sm:mb-4 text-sm sm:text-xl">
                    IT'S <span className="text-primary italic">"{teams[currentTurn].name}"</span> MISSION!
                  </h3>
                  <Button onClick={startTurnAnimation} disabled={isAnimating} className="h-11 sm:h-14 px-6 sm:px-12 text-xs sm:text-base font-black uppercase shadow-xl rounded-xl">
                      {isAnimating ? <Loader2 className="mr-2 sm:mr-3 animate-spin h-4 w-4" /> : <Sparkles className="mr-2 sm:mr-3 h-4 w-4" />}
                      Select Next Target
                  </Button>
              </div>

              {/* Horizontally scrollable board wrapper for small screens */}
              <div className="w-full overflow-x-auto pb-2 pt-1">
                <div className="grid gap-2 sm:gap-3 w-full min-w-[480px] sm:min-w-0" style={{gridTemplateColumns: `repeat(${board.length}, 1fr)`}}>
                  {board.map((cat, catIndex) => (
                    <div key={cat.categoryName} className="space-y-2 sm:space-y-3 flex flex-col">
                      <div className="bg-primary text-primary-foreground flex items-center justify-center text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-tight border-2 border-white/10 shadow-md h-14 sm:h-20 text-[11px] sm:text-xs">
                          <span className="line-clamp-2">{cat.categoryName}</span>
                      </div>
                      {cat.questions.map((q, qIndex) => (
                        <Button
                          key={q.points}
                          disabled={q.answered || isAnimating}
                          className={cn(
                              "font-black bg-secondary hover:bg-secondary/80 border-2 border-black/5 transition-all duration-100 shadow-sm h-11 sm:h-16 text-sm sm:text-xl rounded-lg sm:rounded-xl",
                              highlightedQuestion?.catIndex === catIndex && highlightedQuestion?.qIndex === qIndex && "ring-4 sm:ring-8 ring-yellow-400 scale-105 z-20",
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
            </div>
          )}
          {gameState === 'finished' && (
            <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-300 my-auto">
                <Trophy className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] h-16 w-16 sm:h-24 sm:w-24" />
                <div className="space-y-1">
                    <h2 className="font-black uppercase tracking-tight text-white text-2xl sm:text-4xl">Game Over!</h2>
                    <p className="font-black text-primary uppercase text-lg sm:text-2xl">🎉 {teams.reduce((p, c) => p.score > c.score ? p : c).name} wins! 🎉</p>
                </div>
                <Card className="w-full max-w-sm p-4 sm:p-6 bg-card/50 rounded-xl sm:rounded-2xl">
                    <h3 className="font-black uppercase tracking-wider text-muted-foreground mb-3 text-xs sm:text-sm">Final Ledger</h3>
                    <div className="flex flex-col gap-2">
                        {[...teams].sort((a,b) => b.score - a.score).map((team, index) => (
                            <div key={team.name} className="flex justify-between font-bold text-sm sm:text-lg">
                                <span>{index + 1}. {team.name}:</span>
                                <span className="text-primary">{team.score} points</span>
                            </div>
                        ))}
                    </div>
                </Card>
                <Button onClick={resetGame} className="h-11 sm:h-14 px-6 sm:px-12 text-xs sm:text-base bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl rounded-xl"><Repeat className="mr-2 h-4 w-4"/>New Session</Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 sm:p-6 w-full shrink-0 max-w-5xl mx-auto">
            <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 text-xs sm:text-sm font-bold rounded-xl">
                <Link href="/games">Back to Library</Link>
            </Button>
            {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'setup' && (
                <Button variant="secondary" onClick={resetGame} className="w-full sm:w-auto h-11 sm:h-12 text-xs sm:text-sm font-bold rounded-xl">Abort Session</Button>
            )}
        </CardFooter>
      </Card>
      
      <Dialog open={!!activeQuestion} onOpenChange={() => setActiveQuestion(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="font-black uppercase tracking-wider text-primary text-xs sm:text-base">{currentQuestion && `${board[activeQuestion!.catIndex].categoryName} for ${currentQuestion.points}`}</DialogTitle>
                <DialogDescription className="font-bold text-foreground leading-snug py-3 sm:py-6 text-base sm:text-2xl break-words">{currentQuestion?.question}</DialogDescription>
            </DialogHeader>
            {isAnswerRevealed && (
                 <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-green-500/10 border-2 border-green-500/50 text-center animate-in zoom-in duration-200 my-2 sm:my-4">
                    <p className="font-black uppercase tracking-wider text-green-600 mb-1 text-[10px] sm:text-xs">Confirmed Answer:</p>
                    <p className="font-black uppercase italic text-green-700 text-lg sm:text-2xl break-words">{currentQuestion?.answer}</p>
                 </div>
            )}
            <DialogFooter className="flex flex-col sm:flex-row gap-2.5 mt-3 sm:mt-6 w-full">
                <Button variant="outline" onClick={() => setIsAnswerRevealed(true)} className="w-full sm:flex-1 h-11 font-black uppercase text-xs rounded-xl border-2"><HelpCircle className="mr-1.5 h-4 w-4"/>Reveal Intel</Button>
                <Button variant="destructive" onClick={() => handleAnswerAdjudication(false)} className="w-full sm:flex-1 h-11 font-black uppercase text-xs rounded-xl"><X className="mr-1.5 h-4 w-4"/>Incorrect</Button>
                <Button className="w-full sm:flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs rounded-xl" onClick={() => handleAnswerAdjudication(true)}><Check className="mr-1.5 h-4 w-4"/>Correct</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
