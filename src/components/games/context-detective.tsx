"use client";

import * as React from 'react';
import { getGameBySlug } from '@/lib/games';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { generateContextDetective, type GenerateContextDetectiveOutput } from '@/ai/flows/generate-context-detective';
import {
  Loader2,
  Sparkles,
  UserPlus,
  Trash2,
  Repeat,
  Check,
  X,
  Timer,
  Trophy,
  RotateCcw,
  Lightbulb,
  Send,
  Fingerprint,
  Maximize,
  Minimize,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type GameState = 'setup' | 'loading' | 'playing' | 'answered' | 'finished' | 'instructions';
type Team = { name: string; score: number };

const TURN_TIME_SECONDS = 60;
const LOCAL_STORAGE_KEY = 'lingoland_context_detective_used_answers';

export function ContextDetective({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('setup');
  const [teams, setTeams] = React.useState<Team[]>([
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ]);
  const [totalRounds, setTotalRounds] = React.useState(10);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [challenge, setChallenge] = React.useState<GenerateContextDetectiveOutput | null>(null);
  const [userGuess, setUserGuess] = React.useState('');
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [difficulty, setDifficulty] = React.useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [usedAnswers, setUsedAnswers] = React.useState<string[]>([]);
  const [timeLeft, setTimeLeft] = React.useState(TURN_TIME_SECONDS);
  const [showHint, setShowHint] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) setUsedAnswers(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load used answers', e);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usedAnswers));
    } catch (e) {
      console.error('Failed to save used answers', e);
    }
  }, [usedAnswers]);

  const fetchNextChallenge = React.useCallback(async () => {
    setGameState('loading');
    setChallenge(null);
    setUserGuess('');
    setIsCorrect(null);
    setShowHint(false);
    setTimeLeft(TURN_TIME_SECONDS);

    try {
      const result = await generateContextDetective({
        difficulty,
        usedAnswers,
      });
      setChallenge(result);
      setUsedAnswers((prev) => [...prev, result.answer]);
      setGameState('playing');
    } catch (e) {
      console.error('Error generating challenge:', e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate a new case.' });
      setGameState('setup');
    }
  }, [difficulty, usedAnswers, toast]);

  const handleStartGame = () => {
    if (teams.length < 1) {
      toast({ variant: 'destructive', title: 'Add at least one team' });
      return;
    }
    setTeams(teams.map((t) => ({ ...t, score: 0 })));
    setCurrentRound(1);
    setCurrentTurn(0);
    fetchNextChallenge();
  };

  const handleTimeUp = React.useCallback(() => {
    if (gameState !== 'playing') return;
    setIsCorrect(false);
    setGameState('answered');
  }, [gameState]);

  React.useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, handleTimeUp]);

  const handleCheckAnswer = () => {
    if (!challenge || gameState !== 'playing' || !userGuess.trim()) return;
    
    const normalizedGuess = userGuess.trim().toLowerCase();
    const normalizedAnswer = challenge.answer.trim().toLowerCase();
    
    const correct = normalizedGuess === normalizedAnswer;
    setIsCorrect(correct);
    if (correct) {
      const newTeams = [...teams];
      newTeams[currentTurn].score += 1;
      setTeams(newTeams);
    }
    setGameState('answered');
  };

  const handleNextTurn = () => {
    if (currentRound >= totalRounds && currentTurn === teams.length - 1) {
      setGameState('finished');
      return;
    }

    const nextTurn = (currentTurn + 1) % teams.length;
    setCurrentTurn(nextTurn);
    if (nextTurn === 0) {
      setCurrentRound((prev) => prev + 1);
    }
    fetchNextChallenge();
  };

  const handleTeamNameChange = (index: number, newName: string) => {
    const newTeams = [...teams];
    newTeams[index].name = newName;
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
    setUsedAnswers([]);
  };

  if (!game) return <div>Game not found</div>;
  const Icon = game.icon;

  const renderContent = () => {
    switch (gameState) {
      case 'setup':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <h3 className="text-xl font-bold">Game Setup</h3>
            <div className="w-full space-y-2 text-left">
              <label className="text-sm font-bold">Difficulty</label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-2 text-left">
              <label className="text-sm font-bold">Rounds</label>
              <Select value={String(totalRounds)} onValueChange={(v) => setTotalRounds(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Rounds</SelectItem>
                  <SelectItem value="15">15 Rounds</SelectItem>
                  <SelectItem value="20">20 Rounds</SelectItem>
                  <SelectItem value="30">30 Rounds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-2 text-left">
              <h4 className="font-bold text-sm">Teams</h4>
              {teams.map((team, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={team.name} onChange={(e) => handleTeamNameChange(index, e.target.value)} />
                  <Button variant="ghost" size="icon" onClick={() => removeTeam(index)} disabled={teams.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addTeam} className="w-full" disabled={teams.length >= 4}>
                <UserPlus className="mr-2" /> Add Team
              </Button>
            </div>
            <Button onClick={() => setGameState('instructions')} size="lg" className="w-full mt-4 h-14 font-black uppercase text-xl rounded-2xl shadow-lg">Next</Button>
          </div>
        );
      case 'instructions':
        return (
          <div className={cn(
              "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
              isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
          )}>
            <h3 className={cn("font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
            <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
              <p>1. The AI will show a short paragraph with a missing word (represented by ____).</p>
              <p>2. Read the paragraph carefully and use the surrounding words as "clues".</p>
              <p>3. Guess the English word that correctly completes the story!</p>
              <p>4. You have 60 seconds. Type your guess and press Enter or Send.</p>
            </div>
            <Button onClick={handleStartGame} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Start Investigation</Button>
          </div>
        );
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center gap-6">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn("text-muted-foreground animate-pulse", isFullscreen ? "text-3xl" : "text-lg")}>Scanning database for a new case...</p>
          </div>
        );
      case 'playing':
      case 'answered':
        if (!challenge) return null;
        return (
          <div className="w-full flex flex-col items-center gap-8 max-w-5xl">
            <div className={cn("w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-black uppercase tracking-widest", isFullscreen && "max-w-4xl")}>
              <div className="p-4 bg-muted/20 rounded-2xl shadow-inner border-2 border-primary/10">
                <p className="text-xs opacity-60">Round</p>
                <p className={cn(isFullscreen ? "text-4xl" : "text-lg")}>{currentRound}/{totalRounds}</p>
              </div>
              <div className={cn("p-4 rounded-2xl border-4 transition-all", gameState === 'playing' ? "border-primary bg-primary/10 scale-105 shadow-xl" : "bg-muted border-transparent opacity-70")}>
                <p className="text-xs opacity-80">Active Detective</p>
                <p className={cn("truncate", isFullscreen ? "text-4xl" : "text-lg")}>{teams[currentTurn].name}</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-2xl shadow-inner border-2 border-primary/10">
                <p className="text-xs opacity-60">Time Left</p>
                <p className={cn("font-mono font-black", isFullscreen ? "text-4xl" : "text-lg")}>{timeLeft}s</p>
              </div>
            </div>
            <Progress value={(timeLeft / TURN_TIME_SECONDS) * 100} className={cn("w-full h-4 rounded-full", isFullscreen && "max-w-4xl")} />

            <div className={cn(
                "w-full bg-card p-12 rounded-[3rem] shadow-2xl border-4 border-primary/20 animate-in fade-in zoom-in duration-500 flex items-center justify-center",
                isFullscreen ? "min-h-[40vh] p-16" : "min-h-[15rem]"
            )}>
                <p className={cn("text-center font-bold leading-relaxed", isFullscreen ? "text-[4vw]" : "text-2xl md:text-3xl")}>
                    {challenge.paragraphWithBlank}
                </p>
            </div>

            {gameState === 'playing' ? (
                <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
                    <div className="flex gap-4 w-full">
                        <Input 
                            value={userGuess}
                            onChange={(e) => setUserGuess(e.target.value)}
                            placeholder="Type the missing word..."
                            className={cn("text-center font-black uppercase bg-card border-4 shadow-inner", isFullscreen ? "h-24 text-[4vw] rounded-3xl" : "h-16 text-2xl")}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                            autoFocus
                            spellCheck="false"
                        />
                        <Button onClick={handleCheckAnswer} size="lg" className={cn("shadow-xl", isFullscreen ? "h-24 w-24 rounded-3xl" : "h-16 w-16 p-0")}>
                            <Send className={cn(isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                        </Button>
                    </div>
                    <div className="flex gap-4 w-full">
                        <Button variant="outline" onClick={() => setShowHint(true)} className={cn("flex-1 font-black uppercase shadow-md", isFullscreen && "h-16 text-xl rounded-2xl")}>
                            <Lightbulb className={cn("mr-2 h-5 w-5", isFullscreen && "h-8 w-8")} /> Hint
                        </Button>
                        <Button variant="ghost" onClick={handleNextTurn} className={cn("flex-1 font-black uppercase", isFullscreen && "h-16 text-xl")}>
                            Skip Case
                        </Button>
                    </div>
                    {showHint && (
                        <Alert className="bg-amber-100/50 border-amber-500 text-black rounded-2xl border-4 shadow-xl animate-in slide-in-from-top-4">
                            <Lightbulb className="h-6 w-6 text-amber-600" />
                            <AlertTitle className="font-black">INTEL RECEIVED</AlertTitle>
                            <AlertDescription className={cn("font-bold italic", isFullscreen ? "text-3xl" : "text-lg")}>{challenge.hint}</AlertDescription>
                        </Alert>
                    )}
                </div>
            ) : (
                <Alert className={cn(
                    "text-center border-4 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in duration-300",
                    isFullscreen ? "p-12 mt-12" : "mt-6",
                    isCorrect ? "bg-green-500/20 border-green-500/50 text-foreground" : "bg-red-500/20 border-red-500/50 text-foreground"
                )}>
                    {isCorrect ? <Check className={cn(isFullscreen ? "h-12 w-12" : "h-6 w-6")} /> : <X className={cn(isFullscreen ? "h-12 w-12" : "h-6 w-6")} />}
                    <AlertTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-5xl mb-4" : "text-xl mb-2")}>{isCorrect ? "CASE SOLVED!" : "CASE COLD!"}</AlertTitle>
                    <AlertDescription className={cn(isFullscreen ? "text-3xl leading-relaxed" : "text-lg")}>
                        <p className="mb-4">The correct word was: <strong className="uppercase italic text-primary">{challenge.answer}</strong></p>
                        <p className={cn("opacity-80 border-t-2 border-current/10 pt-4", isFullscreen ? "text-xl" : "text-sm")}><strong>Forensics:</strong> {challenge.explanation}</p>
                    </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 'finished':
        const sorted = [...teams].sort((a, b) => b.score - a.score);
        return (
          <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
            <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
            <div className="space-y-2">
                <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Investigation Over!</h2>
                <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>🎉 {sorted[0].name} is the Top Detective! 🎉</p>
            </div>
            <Card className={cn("w-full max-w-sm p-6 bg-card/50", isFullscreen && "max-w-xl p-12")}>
              <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Final Ledger</h3>
              <div className="flex flex-col gap-4">
                {sorted.map((team) => (
                  <div key={team.name} className={cn("flex justify-between font-bold", isFullscreen ? "text-3xl" : "text-xl")}>
                    <span>{team.name}:</span>
                    <span className="text-primary">{team.score} cases</span>
                  </div>
                ))}
              </div>
            </Card>
            <Button onClick={resetGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                <Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                New Investigation
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
          <Badge variant="outline" className={cn(isFullscreen && "text-xl px-6 py-1")}>{difficulty.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn(
          "space-y-6 text-center flex flex-col items-center justify-center",
          isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[30rem] p-6"
      )}>
        {renderContent()}
      </CardContent>
      <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
        <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
          <Link href="/games">Back to Games</Link>
        </Button>
        {gameState === 'answered' && (
          <Button onClick={handleNextTurn} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
            Next Case <Repeat className={cn("ml-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
          </Button>
        )}
        {gameState !== 'setup' && (
          <Button variant="ghost" onClick={() => {
            try {
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              setUsedAnswers([]);
              toast({ title: "History Cleared", description: "You can now solve previous cases again." });
            } catch (e) {}
          }} title="Reset case history" size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "text-xl")}>
            <RotateCcw className={cn("mr-2", isFullscreen ? "h-6 w-6" : "h-4 w-4")} /> Clear History
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
