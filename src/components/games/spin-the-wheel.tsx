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
import { Loader2, Trophy, Check, X, Disc, Sparkles, UserPlus, Trash2, Repeat, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { generateSpinQuestion } from "@/ai/flows/generate-spin-question";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import Link from "next/link";

type GameState = "setup" | "loading" | "spinning" | "spinning_animation" | "spun" | "question" | "finished" | "instructions" | "idle";
type Team = { name: string; score: number };
type Question = { question: string; answer: string; used: boolean };
type QuestionsByColor = Record<string, Question[]>;

const wheelColors = [
  "#8B5CF6", "#10B981", "#FBBF24", "#38BDF8", "#EF4444", "#22C55E", 
  "#EC4899", "#F97316", "#14532D", "#1E3A8A", "#F59E0B", "#6D28D9",
];

export function SpinTheWheel({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>("setup");
  const [teams, setTeams] = React.useState<Team[]>([{ name: "Team A", score: 0 }, { name: "Team B", score: 0 }]);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [rotation, setRotation] = React.useState(0);
  const [landedColor, setLandedColor] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<QuestionsByColor>({});
  const [activeQuestion, setActiveQuestion] = React.useState<Question | null>(null);
  const [usedQuestionKeys, setUsedQuestionKeys] = React.useState<string[]>([]);
  const [isAnswerRevealed, setIsAnswerRevealed] = React.useState(false);
  const [allTimeUsedQuestions, setAllTimeUsedQuestions] = React.useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { toast } = useToast();

  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = () => {
    if (teams.length < 2) {
      toast({ variant: "destructive", title: "Add at least two teams." });
      return;
    }
    setGameState("spinning");
    setTeams(teams.map(t => ({...t, score: 0})));
    setCurrentTurn(0);
    setQuestions({});
    setUsedQuestionKeys([]);
    setRotation(0);
    setLandedColor(null);
    setIsAnswerRevealed(false);
  };

  const resetGame = () => {
    setGameState("setup");
    setRotation(0);
    setLandedColor(null);
    setActiveQuestion(null);
    setIsAnswerRevealed(false);
  };

  const handleSpin = () => {
    if (gameState !== "spinning") return;
    setGameState("spinning_animation");
    setLandedColor(null);

    const spinCycles = 5;
    const segmentAngle = 360 / wheelColors.length;
    const randomSegmentIndex = Math.floor(Math.random() * wheelColors.length);
    const newLandedColor = wheelColors[randomSegmentIndex];
    const targetAngle = (randomSegmentIndex * segmentAngle);
    const newRotation = (spinCycles * 360) + rotation + targetAngle;
    setRotation(newRotation);

    setTimeout(async () => {
      setLandedColor(newLandedColor);
      if (!questions[newLandedColor]) {
        try {
          const { questions: newQuestions } = await generateSpinQuestion({
            count: teams.length,
            usedQuestions: allTimeUsedQuestions,
          });
          setAllTimeUsedQuestions(prev => [...prev, ...newQuestions.map(q => q.question)]);
          setQuestions(prev => ({ ...prev, [newLandedColor]: newQuestions.map(q => ({ ...q, used: false })) }));
        } catch (e) {
          toast({ variant: "destructive", title: "Error", description: "Spin Error. Try again." });
          setGameState("spinning");
          return;
        }
      }
      setGameState("spun");
    }, 5000);
  };

  const handleQuestionSelect = (color: string, teamIndex: number) => {
    const questionKey = `${color}-${teamIndex}`;
    if (!questions[color]?.[teamIndex] || usedQuestionKeys.includes(questionKey)) return;
    setActiveQuestion(questions[color][teamIndex]);
    setIsAnswerRevealed(false);
  };

  const handleScoring = (isCorrect: boolean) => {
    const newTeams = [...teams];
    if (isCorrect) {
      newTeams[currentTurn].score += 1;
    } else {
      const opponentIndex = (currentTurn + 1) % teams.length;
      newTeams[opponentIndex].score += 1;
    }
    setTeams(newTeams);
    if(landedColor) setUsedQuestionKeys(prev => [...prev, `${landedColor}-${currentTurn}`]);
    setActiveQuestion(null);
    setIsAnswerRevealed(false);
    setGameState("spinning");
    setCurrentTurn((prev) => (prev + 1) % teams.length);
    if (usedQuestionKeys.length >= wheelColors.length * teams.length - 1) setGameState("finished");
  };
  
  const addTeam = () => { if (teams.length < 4) setTeams([...teams, { name: `Team ${String.fromCharCode(65 + teams.length)}`, score: 0 }]); };
  const removeTeam = (index: number) => { if (teams.length > 2) setTeams(teams.filter((_, i) => i !== index)); };
  const handleTeamNameChange = (index: number, newName: string) => { const newTeams = [...teams]; newTeams[index].name = newName; setTeams(newTeams); };

  const Icon = game.icon;

  return (
    <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
      )}>
      <CardHeader className="text-center relative p-4 sm:p-6 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-auto p-1.5 sm:p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        <div className="flex justify-center mb-2">
            <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
        </div>
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-3xl")}>{game.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base max-w-xl mx-auto">{game.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto">
        {gameState === "setup" && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
                {/* How to Play Guide */}
                <div className="bg-muted/40 rounded-2xl border border-border/30 p-4 sm:p-5 w-full text-left space-y-2">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-primary">How to Play</h4>
                    <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                        <li>Spin the rainbow wheel to select a random challenge color.</li>
                        <li>Each team answers grammar questions matching the landed sector.</li>
                        <li>Earn points for correct answers or claim steal points!</li>
                    </ul>
                </div>

                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider">TEAM SETUP</h3>
                <div className="w-full space-y-2.5">
                    {teams.map((team, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input value={team.name} onChange={(e) => handleTeamNameChange(index, e.target.value)} className="bg-background font-bold text-sm h-11 rounded-xl" />
                            <Button variant="ghost" size="icon" onClick={() => removeTeam(index)} disabled={teams.length <= 2} className="h-11 w-11 rounded-xl">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addTeam} className="w-full font-bold h-11 rounded-xl border-dashed" disabled={teams.length >= 4}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Team
                    </Button>
                </div>
                <Button onClick={handleStartGame} className="text-lg sm:text-xl h-14 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl hover:opacity-90 transition-all font-black uppercase rounded-xl">Start Competition</Button>
            </div>
        )}
        
        {gameState === "loading" && <div className="flex flex-col items-center gap-4 text-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /><p className="font-black text-sm uppercase tracking-wider animate-pulse">GENERATING CHALLENGES...</p></div>}

        {(gameState !== "setup" && gameState !== "loading" && gameState !== "finished") && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative transition-all duration-500 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80">
                        <div className="absolute inset-0 border-[1rem] sm:border-[1.5rem] border-yellow-400 rounded-full shadow-inner z-10"></div>
                        <div className="w-full h-full rounded-full transition-transform duration-[5000ms] ease-out shadow-xl" style={{ transform: `rotate(${rotation}deg)` }}>
                            {wheelColors.map((color, index) => (
                                <div key={index} className="absolute w-1/2 h-1/2 top-1/2 left-1/2" style={{ transformOrigin: '0% 0%', transform: `rotate(${(360 / wheelColors.length) * index}deg)`, clipPath: `polygon(0 0, 100% 0, 100% 100%)` }}>
                                    <div style={{ backgroundColor: color, width: '100%', height: '100%', clipPath: `polygon(0 0, 50% 100%, 100% 0)`}}></div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[12px] border-x-transparent border-b-[24px] border-b-yellow-600 rotate-180 z-20 shadow-md"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full border-4 sm:border-8 border-yellow-500 z-30 shadow-md"></div>
                    </div>
                    <Button onClick={handleSpin} disabled={gameState !== 'spinning'} className="font-black shadow-lg bg-yellow-500 text-black hover:bg-yellow-400 transition-all uppercase tracking-wider h-12 sm:h-14 px-8 text-base sm:text-lg rounded-xl">
                        {gameState === 'spinning_animation' ? (<> <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Spinning... </>) : 'SPIN THE WHEEL'}
                    </Button>
                </div>

                <div className={cn("grid gap-4 self-start items-start w-full", teams.length === 2 ? "grid-cols-2" : teams.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4")}>
                    {teams.map((team, teamIndex) => (
                        <div key={teamIndex} className="flex flex-col items-center gap-3">
                            <div className={cn(
                                "p-3 sm:p-4 rounded-2xl shadow-md border-2 border-border/40 bg-card w-full transition-all text-center",
                                currentTurn === teamIndex && gameState !== 'spinning_animation' ? 'ring-4 ring-primary scale-[1.02]' : 'opacity-80'
                            )}>
                                <h3 className="font-black text-xs sm:text-sm truncate mb-1">{team.name}</h3>
                                <div className="bg-primary/10 text-primary font-black text-center py-1 px-2 rounded-xl text-lg sm:text-2xl">{team.score}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 w-full">
                                {wheelColors.map((color) => {
                                    const isUsed = usedQuestionKeys.includes(`${color}-${teamIndex}`);
                                    return (
                                        <Button
                                            key={`${color}-${teamIndex}`}
                                            className={cn(
                                                "aspect-square h-auto text-xs sm:text-base font-black border transition-all text-white rounded-xl p-1",
                                                isUsed && "bg-muted opacity-20 cursor-not-allowed",
                                                !isUsed && currentTurn === teamIndex && landedColor === color && "animate-bounce ring-2 ring-yellow-400"
                                            )}
                                            style={!isUsed ? { backgroundColor: color } : {}}
                                            onClick={() => handleQuestionSelect(color, teamIndex)}
                                            disabled={gameState !== 'spun' || landedColor !== color || isUsed || currentTurn !== teamIndex}
                                        >
                                            {isUsed ? <X className="h-3 w-3" /> : "•"}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-border/10 w-full shrink-0">
        <Button variant="outline" asChild className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
          <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== 'setup' && gameState !== 'loading' && (
            <Button variant="destructive" onClick={resetGame} className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl font-bold">
              Restart Sequence
            </Button>
        )}
      </CardFooter>

       <Dialog open={!!activeQuestion} onOpenChange={(open) => {if(!open){ setActiveQuestion(null); setIsAnswerRevealed(false);}}}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-2xl p-6 sm:p-8 border-2 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-wider text-primary text-base sm:text-lg">Color Sector Challenge</DialogTitle>
            <DialogDescription className="font-bold text-foreground leading-relaxed py-4 text-sm sm:text-xl">{activeQuestion?.question}</DialogDescription>
            {isAnswerRevealed && (
             <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 mt-2 animate-in zoom-in">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Expected Answer:</p>
                <p className="font-black text-primary text-base sm:text-xl uppercase italic">{activeQuestion?.answer}</p>
             </div>
            )}
          </DialogHeader>
          <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsAnswerRevealed(true)} className="font-bold uppercase h-11 rounded-xl text-xs sm:text-sm">Reveal Answer</Button>
            <Button variant="destructive" onClick={() => handleScoring(false)} className="font-bold uppercase h-11 rounded-xl text-xs sm:text-sm">Incorrect</Button>
            <Button className="bg-green-600 text-white hover:bg-green-700 font-bold uppercase h-11 rounded-xl text-xs sm:text-sm" onClick={() => handleScoring(true)}>Correct (+1)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-card p-6 sm:p-8 rounded-3xl border-2 shadow-2xl text-center">
                    <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-4">
                        {teams.every(t => t.score === teams[0].score) ? "DRAW!" : "VICTORY!"}
                    </h2>
                    <div className="space-y-2 mb-6">
                        {teams.map(team => (
                            <div key={team.name} className="flex justify-between items-center bg-muted/40 p-3 sm:p-4 rounded-xl border">
                                <span className="text-sm sm:text-lg font-black uppercase">{team.name}</span>
                                <span className="text-xl sm:text-2xl font-black text-primary">{team.score} pts</span>
                            </div>
                        ))}
                    </div>
                    <Button onClick={resetGame} className="w-full h-12 bg-primary text-primary-foreground text-base font-black rounded-xl uppercase">Play Again</Button>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}