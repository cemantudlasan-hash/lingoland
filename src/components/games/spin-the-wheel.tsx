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
        "w-full transition-all duration-500 flex flex-col overflow-hidden",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-[#EFEFEF] justify-center" 
            : "max-w-6xl mx-auto bg-[#EFEFEF] border-2 border-gray-300 shadow-lg"
      )} style={{ fontFamily: 'Comic Sans MS, cursive' }}>
      <CardHeader className="text-center relative bg-white/20 backdrop-blur-sm border-b-2 border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-auto p-2 gap-1 text-black/50 hover:text-black z-[100]"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        <CardTitle className={cn("font-bold text-green-600", isFullscreen ? "text-6xl" : "text-4xl")}>Future (Going to)</CardTitle>
      </CardHeader>
      
      <CardContent className={cn(
          "flex-grow flex flex-col items-center justify-center p-6",
          isFullscreen ? "min-h-[70vh] gap-12" : "min-h-[28rem] gap-6"
      )}>
        {gameState === "setup" && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <h3 className="text-2xl font-black text-black">TEAM DEPLOYMENT</h3>
                <div className="w-full space-y-3">
                    {teams.map((team, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input value={team.name} onChange={(e) => handleTeamNameChange(index, e.target.value)} className="bg-white text-black border-2 border-black/20 font-bold" />
                            <Button variant="ghost" size="icon" onClick={() => removeTeam(index)} disabled={teams.length <= 2}>
                                <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addTeam} className="w-full border-2 border-black/20 font-bold" disabled={teams.length >= 4}>
                        <UserPlus className="mr-2 h-5 w-5" /> Add Team
                    </Button>
                </div>
                <Button onClick={handleStartGame} className="text-2xl h-20 w-full bg-yellow-400 text-black border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all font-black uppercase">Start Game</Button>
            </div>
        )}
        
        {gameState === "loading" && <div className="flex flex-col items-center gap-4"><Loader2 className="w-16 h-16 animate-spin text-purple-600" /><p className="font-black animate-pulse">GENERATING CHALLENGES...</p></div>}

        {(gameState !== "setup" && gameState !== "loading" && gameState !== "finished") && (
            <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full", isFullscreen && "max-w-7xl")}>
                <div className="flex flex-col items-center gap-8">
                    <div className={cn("relative transition-all duration-500", isFullscreen ? "w-[30vw] h-[30vw]" : "w-64 h-64 md:w-80 md:h-80")}>
                        <div className="absolute inset-0 border-[1.5rem] border-yellow-400 rounded-full shadow-inner z-10"></div>
                        <div className="w-full h-full rounded-full transition-transform duration-[5000ms] ease-out shadow-2xl" style={{ transform: `rotate(${rotation}deg)` }}>
                            {wheelColors.map((color, index) => (
                                <div key={index} className="absolute w-1/2 h-1/2 top-1/2 left-1/2" style={{ transformOrigin: '0% 0%', transform: `rotate(${(360 / wheelColors.length) * index}deg)`, clipPath: `polygon(0 0, 100% 0, 100% 100%)` }}>
                                    <div style={{ backgroundColor: color, width: '100%', height: '100%', clipPath: `polygon(0 0, 50% 100%, 100% 0)`}}></div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[15px] border-x-transparent border-b-[30px] border-b-yellow-600 rotate-180 z-20 shadow-lg"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400 rounded-full border-8 border-yellow-500 z-30 shadow-md"></div>
                    </div>
                    <Button onClick={handleSpin} disabled={gameState !== 'spinning'} className={cn(
                        "font-black border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-yellow-500 text-black hover:scale-105 transition-all uppercase tracking-widest",
                        isFullscreen ? "h-24 px-16 text-3xl rounded-3xl" : "h-16 px-8 text-lg rounded-2xl"
                    )}>
                        {gameState === 'spinning_animation' ? (<> <Loader2 className="mr-3 animate-spin"/> Spinning... </>) : 'SPIN THE WHEEL'}
                    </Button>
                </div>

                <div className={cn("grid gap-6 self-start items-start", teams.length === 2 ? "grid-cols-2" : teams.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4")}>
                    {teams.map((team, teamIndex) => (
                        <div key={teamIndex} className="flex flex-col items-center gap-4">
                            <div className={cn(
                                "p-6 rounded-3xl shadow-xl border-4 border-black/20 bg-orange-400 w-full transition-all",
                                currentTurn === teamIndex && gameState !== 'spinning_animation' ? 'ring-8 ring-yellow-400 scale-110' : 'opacity-70'
                            )}>
                                <h3 className={cn("font-black text-white mb-2 truncate text-center", isFullscreen ? "text-2xl" : "text-sm")}>{team.name}</h3>
                                <div className={cn("bg-yellow-200 text-black font-black text-center p-2 rounded-2xl border-4 border-black/10", isFullscreen ? "text-5xl" : "text-3xl")}>{team.score}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {wheelColors.map((color) => {
                                    const isUsed = usedQuestionKeys.includes(`${color}-${teamIndex}`);
                                    return (
                                        <Button
                                            key={`${color}-${teamIndex}`}
                                            className={cn(
                                                "aspect-square h-auto text-3xl font-black border-4 border-black/20 transition-all text-white rounded-2xl",
                                                isUsed && "bg-slate-800 opacity-20 cursor-not-allowed grayscale",
                                                !isUsed && currentTurn === teamIndex && landedColor === color && "animate-bounce ring-4 ring-yellow-400"
                                            )}
                                            style={!isUsed ? { backgroundColor: color } : {}}
                                            onClick={() => handleQuestionSelect(color, teamIndex)}
                                            disabled={gameState !== 'spun' || landedColor !== color || isUsed || currentTurn !== teamIndex}
                                        >
                                            {isUsed ? <X /> : "1"}
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
      
      <CardFooter className="bg-white/20 p-6 flex justify-between border-t-2 border-gray-200">
        <Button variant="outline" asChild className="border-2 border-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]">
          <Link href="/games">Back to Library</Link>
        </Button>
        {gameState !== 'setup' && gameState !== 'loading' && (
            <Button variant="destructive" onClick={resetGame} className="border-2 border-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              Restart Sequence
            </Button>
        )}
      </CardFooter>

       <Dialog open={!!activeQuestion} onOpenChange={(open) => {if(!open){ setActiveQuestion(null); setIsAnswerRevealed(false);}}}>
        <DialogContent className={cn("rounded-[3rem] p-12 border-4 border-black shadow-[15px_15px_0px_rgba(0,0,0,1)]", isFullscreen ? "sm:max-w-4xl" : "sm:max-w-lg")}>
          <DialogHeader>
            <DialogTitle className={cn("font-black uppercase tracking-widest text-purple-600", isFullscreen && "text-3xl")}>Neural Question</DialogTitle>
            <DialogDescription className={cn("font-black text-black leading-tight py-10", isFullscreen ? "text-[5vw]" : "text-3xl")}>{activeQuestion?.question}</DialogDescription>
            {isAnswerRevealed && (
             <div className="bg-yellow-200 p-6 rounded-2xl border-4 border-black/10 mt-4 animate-in zoom-in">
                <p className="text-xs font-black uppercase text-gray-500 mb-1">Expected Decryption:</p>
                <p className={cn("font-black text-green-700 uppercase italic", isFullscreen ? "text-5xl" : "text-2xl")}>{activeQuestion?.answer}</p>
             </div>
            )}
          </DialogHeader>
          <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <Button variant="outline" onClick={() => setIsAnswerRevealed(true)} className="border-4 border-black font-black uppercase h-16 rounded-2xl">Intel</Button>
            <Button variant="destructive" onClick={() => handleScoring(false)} className="border-4 border-black font-black uppercase h-16 rounded-2xl">Error</Button>
            <Button className="bg-green-600 text-white border-4 border-black font-black uppercase h-16 rounded-2xl" onClick={() => handleScoring(true)}>Correct</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl bg-yellow-400 p-12 rounded-[4rem] border-8 border-black shadow-[20px_20px_0px_rgba(0,0,0,0.5)] text-center">
                    <Trophy className="w-48 h-48 text-black mx-auto mb-8 animate-bounce" />
                    <h2 className="text-7xl font-black uppercase tracking-tighter text-black mb-10 leading-none">
                        {teams.every(t => t.score === teams[0].score) ? "DRAW!" : "VICTORY!"}
                    </h2>
                    <div className="space-y-6 mb-12">
                        {teams.map(team => (
                            <div key={team.name} className="flex justify-between items-center bg-white/20 p-6 rounded-3xl border-4 border-black">
                                <span className="text-3xl font-black uppercase">{team.name}</span>
                                <span className="text-5xl font-black">{team.score}</span>
                            </div>
                        ))}
                    </div>
                    <Button onClick={resetGame} size="lg" className="w-full h-24 bg-black text-yellow-400 text-4xl font-black rounded-[2rem] hover:scale-105 transition-transform uppercase">Re-Engage</Button>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}