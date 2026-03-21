'use client';

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
import { generateEmojiEnigma, type GenerateEmojiEnigmaOutput } from '@/ai/flows/generate-emoji-enigma';
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
const LOCAL_STORAGE_KEY = 'lingoland_emoji_enigma_used_answers';

export function EmojiEnigma({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('setup');
  const [teams, setTeams] = React.useState<Team[]>([
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ]);
  const [totalRounds, setTotalRounds] = React.useState(10);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [enigma, setEnigma] = React.useState<GenerateEmojiEnigmaOutput | null>(null);
  const [userGuess, setUserGuess] = React.useState('');
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [difficulty, setDifficulty] = React.useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [category, setCategory] = React.useState<'Random' | 'Movies' | 'Idioms' | 'Everyday Activities' | 'Famous Places' | 'Objects'>('Random');
  const [usedAnswers, setUsedAnswers] = React.useState<string[]>([]);
  const [timeLeft, setTimeLeft] = React.useState(TURN_TIME_SECONDS);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [firstScorer, setFirstScorer] = React.useState<string | null>(null);
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

  const fetchNextEnigma = React.useCallback(async () => {
    setGameState('loading');
    setEnigma(null);
    setUserGuess('');
    setIsCorrect(null);
    setTimeLeft(TURN_TIME_SECONDS);

    try {
      const result = await generateEmojiEnigma({
        difficulty,
        category,
        usedAnswers,
      });
      setEnigma(result);
      setUsedAnswers((prev) => [...prev, result.answer]);
      setGameState('playing');
    } catch (e) {
      console.error('Error generating enigma:', e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate an emoji riddle.' });
      setGameState('setup');
    }
  }, [difficulty, category, usedAnswers, toast]);

  const handleStartGame = () => {
    if (teams.length < 1) {
      toast({ variant: 'destructive', title: 'Add at least one team' });
      return;
    }
    setTeams(teams.map((t) => ({ ...t, score: 0 })));
    setFirstScorer(null);
    setCurrentRound(1);
    setCurrentTurn(0);
    fetchNextEnigma();
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
    if (!enigma || gameState !== 'playing' || !userGuess.trim()) return;
    
    const normalizedGuess = userGuess.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const normalizedAnswer = enigma.answer.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
    
    const correct = normalizedGuess === normalizedAnswer;
    setIsCorrect(correct);
    if (correct) {
      const newTeams = [...teams];
      newTeams[currentTurn].score += 1;
      setTeams(newTeams);
      if (!firstScorer) {
        setFirstScorer(newTeams[currentTurn].name);
      }
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
    fetchNextEnigma();
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
    setFirstScorer(null);
  };

  if (!game) return <div>Game not found</div>;
  const Icon = game.icon;

  const renderContent = () => {
    switch (gameState) {
      case 'setup':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <h3 className="text-xl font-bold">Game Setup</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <label className="text-sm font-bold">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Random">Random</SelectItem>
                    <SelectItem value="Movies">Movies</SelectItem>
                    <SelectItem value="Idioms">Idioms</SelectItem>
                    <SelectItem value="Everyday Activities">Activities</SelectItem>
                    <SelectItem value="Famous Places">Famous Places</SelectItem>
                    <SelectItem value="Objects">Objects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <Button onClick={() => setGameState('instructions')} size="lg" className="w-full">Next</Button>
          </div>
        );
      case 'instructions':
        return (
          <div className="flex flex-col items-center gap-4 text-center p-4 bg-muted rounded-lg max-w-lg">
            <h3 className="font-bold text-lg">How to Play</h3>
            <div className="text-left space-y-2">
              <p>1. The AI will show a sequence of emojis representing a secret word or phrase.</p>
              <p>2. A category clue will be provided to help you.</p>
              <p>3. On your team's turn, guess the English phrase before the timer runs out!</p>
              <p>4. Type your guess and press Enter or the Send button.</p>
            </div>
            <Button onClick={handleStartGame} size="lg">Start Game</Button>
          </div>
        );
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
            <p className={cn(isFullscreen ? "text-3xl" : "text-base")}>Decoding emojis with AI...</p>
          </div>
        );
      case 'playing':
      case 'answered':
        if (!enigma) return null;
        return (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-muted rounded-md">
                <p className="text-sm font-bold">Round</p>
                <p className="text-lg">{currentRound}/{totalRounds}</p>
              </div>
              <div className={cn("p-2 rounded-md border-2", gameState === 'playing' ? "border-primary bg-primary/10" : "bg-muted border-transparent")}>
                <p className="text-sm font-bold">Current Turn</p>
                <p className="text-lg truncate">{teams[currentTurn].name}</p>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <p className="text-sm font-bold">Time Left</p>
                <p className="text-lg font-mono">{timeLeft}s</p>
              </div>
            </div>
            <Progress value={(timeLeft / TURN_TIME_SECONDS) * 100} className="w-full max-w-lg" />

            <div className="flex flex-col items-center gap-4 mt-4 w-full">
                <div className={cn("font-black text-muted-foreground uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>
                    Category: {enigma.clue}
                </div>
                <div className={cn(
                    "font-black p-8 bg-card rounded-2xl shadow-xl border-4 border-primary/20 animate-in fade-in zoom-in duration-500",
                    isFullscreen ? "text-[10vw] p-16" : "text-7xl md:text-8xl"
                )}>
                    {enigma.emojis}
                </div>
            </div>

            {gameState === 'playing' ? (
                <div className="flex gap-2 w-full max-md mt-4">
                    <Input 
                        value={userGuess}
                        onChange={(e) => setUserGuess(e.target.value)}
                        placeholder="Type your translation here..."
                        className={cn("text-center", isFullscreen ? "text-3xl h-20" : "text-lg h-12")}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                        autoFocus
                    />
                    <Button onClick={handleCheckAnswer} size="lg" className={cn(isFullscreen ? "h-20 w-20" : "h-12 w-12", "p-0")}>
                        <Send className={cn(isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    </Button>
                </div>
            ) : (
                <Alert className={cn("mt-6 text-black", isCorrect ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500", isFullscreen && "p-12 rounded-[2rem]")}>
                    <Check className={cn(isFullscreen ? "h-12 w-12" : "h-4 w-4", isCorrect ? "text-green-600" : "text-red-600")} />
                    <AlertTitle className={cn("font-black", isFullscreen ? "text-4xl mb-4" : "font-bold text-black")}>{isCorrect ? "Correct!" : "Not Quite!"}</AlertTitle>
                    <AlertDescription className={cn(isFullscreen ? "text-3xl" : "text-lg text-black")}>
                        <p>The answer was: <strong>{enigma.answer}</strong></p>
                        <p className={cn("opacity-80", isFullscreen ? "mt-4 text-2xl" : "mt-1 text-sm")}>{enigma.explanation}</p>
                    </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 'finished':
        const sorted = [...teams].sort((a, b) => b.score - a.score);
        return (
          <div className="text-center flex flex-col items-center gap-6">
            <Trophy className={cn("text-amber-400", isFullscreen ? "h-48 w-48" : "h-20 w-20")} />
            <h2 className={cn("font-black uppercase", isFullscreen ? "text-7xl" : "text-4xl")}>Game Over!</h2>
            <p className={cn("font-semibold text-primary", isFullscreen ? "text-4xl" : "text-2xl")}>{sorted[0].name} wins!</p>
            {firstScorer && (
                <div className={cn("bg-primary/10 border-2 border-primary/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2", isFullscreen && "p-8 rounded-3xl")}>
                    <Sparkles className={cn("text-primary", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    <p className={cn("font-bold text-foreground", isFullscreen ? "text-3xl" : "text-sm")}>
                        First Correct Guess: <span className="text-primary italic">{firstScorer}</span>
                    </p>
                </div>
            )}
            <Card className={cn("w-full max-w-sm", isFullscreen && "max-w-xl")}>
              <CardContent className={cn("pt-6 space-y-2", isFullscreen && "p-12")}>
                {sorted.map((team) => (
                  <div key={team.name} className={cn("flex justify-between", isFullscreen ? "text-3xl" : "text-xl")}>
                    <span>{team.name}:</span>
                    <span className="font-bold">{team.score} pts</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button onClick={resetGame} size="lg" className={cn(isFullscreen && "h-20 px-12 text-2xl rounded-2xl")}>
                <Repeat className={cn("mr-3", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
                Play Again
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
          <Link href="/games">Back to Library</Link>
        </Button>
        {gameState === 'answered' && (
          <Button onClick={handleNextTurn} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-16 px-12 text-2xl rounded-2xl")}>
            Next Enigma <Repeat className={cn("ml-2", isFullscreen ? "h-8 w-8" : "h-4 w-4")} />
          </Button>
        )}
        {gameState !== 'setup' && (
          <Button variant="ghost" onClick={() => {
            try {
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              setUsedAnswers([]);
              toast({ title: "History Cleared", description: "You can now see previous enigmas again." });
            } catch (e) {}
          }} title="Reset riddle history" size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "text-xl")}>
            <RotateCcw className={cn("mr-2", isFullscreen ? "h-6 w-6" : "h-4 w-4")} /> Clear History
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
