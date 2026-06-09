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
  Trophy,
  RotateCcw,
  Send,
  Maximize,
  Minimize,
  Coins,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';

type GameState = 'setup' | 'loading' | 'playing' | 'answered' | 'finished' | 'instructions';
type Team = { name: string; score: number };

const TURN_TIME_SECONDS = 60;
const LOCAL_STORAGE_KEY = 'lingoland_emoji_enigma_used_answers';

const backgroundEmojis = [
  { emoji: '💡', left: '5%', size: '24px', duration: '12s', delay: '0s' },
  { emoji: '🧩', left: '15%', size: '32px', duration: '16s', delay: '3s' },
  { emoji: '🎬', left: '85%', size: '28px', duration: '14s', delay: '1s' },
  { emoji: '🗽', left: '92%', size: '36px', duration: '18s', delay: '5s' },
  { emoji: '✈️', left: '10%', size: '22px', duration: '10s', delay: '6s' },
  { emoji: '⏰', left: '80%', size: '26px', duration: '15s', delay: '2s' },
  { emoji: '⭐', left: '25%', size: '20px', duration: '9s', delay: '4s' },
  { emoji: '🪙', left: '75%', size: '30px', duration: '13s', delay: '7s' },
  { emoji: '🧠', left: '48%', size: '28px', duration: '17s', delay: '1.5s' },
  { emoji: '🎭', left: '60%', size: '34px', duration: '20s', delay: '4.5s' }
];

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
  const [particles, setParticles] = React.useState<any[]>([]);
  const [triggerShake, setTriggerShake] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const game = getGameBySlug(slug);
  const { user } = useAuth();
  const firestore = useFirestore();
  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

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
    setParticles([]);
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

      // Sparkle Confetti Particles Explosion
      const emojisPool = ['🎉', '✨', '⭐', '🪙', '🏆', '🎈', '💖'];
      const colorsPool = ['#eab308', '#ec4899', '#3b82f6', '#10b981', '#a855f7', '#f97316'];
      const newParticles = Array.from({ length: 30 }).map((_, i) => {
        const angle = (i * 12 * Math.PI) / 180 + (Math.random() * 0.2 - 0.1);
        const distance = Math.floor(Math.random() * 120) + 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 60;
        
        return {
          id: Math.random() + i,
          tx: `${tx}px`,
          ty: `${ty}px`,
          color: colorsPool[Math.floor(Math.random() * colorsPool.length)],
          emoji: emojisPool[Math.floor(Math.random() * emojisPool.length)],
          size: Math.floor(Math.random() * 16) + 16,
          delay: `${Math.random() * 0.15}s`,
          duration: `${Math.random() * 0.8 + 1.2}s`
        };
      });
      setParticles(newParticles);
    } else {
      setTriggerShake(true);
      setTimeout(() => setTriggerShake(false), 500);
    }
    setGameState('answered');
  };

  const handleNextTurn = () => {
    if (currentRound >= totalRounds && currentTurn === teams.length - 1) {
      setGameState('finished');
      const sorted = [...teams].sort((a, b) => b.score - a.score);
      const winningScore = sorted[0]?.score || 0;
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: {
          slug: game?.slug || 'emoji-enigma',
          score: winningScore,
          difficulty,
        }
      });
      toast({
        title: "Game Completed! 🏆🎉",
        description: "You've completed Emoji Enigma! Earned Lingo-Coins and pet stats.",
      });
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
    setParticles([]);
  };

  if (!game) return <div>Game not found</div>;
  const Icon = game.icon;

  const renderContent = () => {
    switch (gameState) {
      case 'setup':
        return (
          <div className={cn("flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in duration-300", isFullscreen && "scale-105")}>
            {isDailyBonus && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-amber-500/20 animate-pulse">
                <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
              </Badge>
            )}
            <h3 className={cn("font-black uppercase tracking-tight", isFullscreen ? "text-4xl" : "text-xl")}>Game Setup</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
              <div className="space-y-2">
                <label className="text-sm font-bold">Difficulty</label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                  <SelectTrigger className={cn(isFullscreen && "h-12 text-lg rounded-xl")}><SelectValue /></SelectTrigger>
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
                  <SelectTrigger className={cn(isFullscreen && "h-12 text-lg rounded-xl")}><SelectValue /></SelectTrigger>
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
                <SelectTrigger className={cn(isFullscreen && "h-12 text-lg rounded-xl")}><SelectValue /></SelectTrigger>
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
                  <Input 
                    value={team.name} 
                    onChange={(e) => handleTeamNameChange(index, e.target.value)} 
                    className={cn(isFullscreen && "h-12 text-lg rounded-xl")}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeTeam(index)} disabled={teams.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addTeam} className={cn("w-full border-dashed", isFullscreen && "h-12 rounded-xl text-lg")} disabled={teams.length >= 4}>
                <UserPlus className="mr-2" /> Add Team
              </Button>
            </div>
            <Button onClick={() => setGameState('instructions')} size="lg" className={cn("w-full bg-primary font-bold mt-2", isFullscreen && "h-14 rounded-xl text-xl")}>Next</Button>
          </div>
        );
      case 'instructions':
        return (
          <div className={cn("flex flex-col items-center gap-6 text-center p-8 bg-muted/80 backdrop-blur rounded-2xl max-w-xl border border-border/20 shadow-xl animate-in fade-in duration-300", isFullscreen && "p-12 max-w-2xl scale-105")}>
            <h3 className={cn("font-black uppercase text-primary tracking-wide", isFullscreen ? "text-3xl" : "text-xl")}>How to Play</h3>
            <div className={cn("text-left space-y-3 font-medium text-muted-foreground", isFullscreen ? "text-lg" : "text-sm")}>
              <p className="flex items-start gap-2.5">
                <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">1</span>
                <span>The AI will show a sequence of emojis representing a secret word or phrase.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">2</span>
                <span>A category clue will be provided at the top to help guide your thoughts.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">3</span>
                <span>On your team's turn, guess the English phrase before the timer runs out!</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">4</span>
                <span>Type your guess and press Enter or the Send button to lock in your answer.</span>
              </p>
            </div>
            <Button onClick={handleStartGame} size="lg" className={cn("w-full bg-gradient-to-r from-primary to-indigo-600 font-bold", isFullscreen && "h-14 rounded-xl text-xl")}>Start Game</Button>
          </div>
        );
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-20 w-20" : "h-12 w-12")} />
            <p className={cn(isFullscreen ? "text-2xl font-bold" : "text-base")}>Decoding emojis with AI...</p>
          </div>
        );
      case 'playing':
      case 'answered':
        if (!enigma) return null;
        return (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-3 text-center z-10 relative">
              <div className="p-3 bg-muted/60 backdrop-blur rounded-xl border border-border/10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Round</p>
                <p className="text-xl font-extrabold">{currentRound}/{totalRounds}</p>
              </div>
              <div className={cn("p-3 rounded-xl border-2 transition-all duration-300", gameState === 'playing' ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" : "bg-muted/60 border-transparent")}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Turn</p>
                <p className="text-xl font-extrabold truncate text-primary">{teams[currentTurn].name}</p>
              </div>
              <div className={cn(
                "p-3 rounded-xl border transition-all duration-300", 
                timeLeft <= 10 ? "bg-red-500/10 border-red-500/30 text-red-500 enigma-pulse-warning" : "bg-muted/60 border-border/10"
              )}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time Left</p>
                <p className={cn(
                  "text-xl font-mono font-black",
                  timeLeft <= 10 && "scale-110"
                )}>{timeLeft}s</p>
              </div>
            </div>

            {/* Custom Premium Progress Bar */}
            <div className="w-full max-w-lg bg-muted/60 h-3 rounded-full overflow-hidden border border-border/10 z-10 relative">
              <div 
                className={cn(
                  "h-full transition-all duration-300 ease-out rounded-full",
                  timeLeft > 30 
                    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                    : timeLeft > 10 
                      ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                      : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse"
                )}
                style={{ width: `${(timeLeft / TURN_TIME_SECONDS) * 100}%` }}
              />
            </div>

            <div className="flex flex-col items-center gap-4 mt-4 w-full relative z-10">
                {/* Confetti Particles Container */}
                {particles.map((p) => (
                  <span
                    key={p.id}
                    className="enigma-particle"
                    style={{
                      '--tx-end': p.tx,
                      '--ty-end': p.ty,
                      '--dur': p.duration,
                      '--delay': p.delay,
                      fontSize: `${p.size}px`,
                      color: p.color,
                      left: '50%',
                      top: '50%',
                    } as React.CSSProperties}
                  >
                    {p.emoji}
                  </span>
                ))}

                <div className={cn("font-black text-muted-foreground uppercase tracking-widest text-xs sm:text-sm")}>
                    Category: {enigma.clue}
                </div>
                <div className={cn(
                    "font-black p-8 bg-card rounded-2xl shadow-2xl border-4 transition-all duration-300 relative select-none",
                    isCorrect === true ? "border-green-500 bg-green-500/10 enigma-animate-pop" : "border-primary/20",
                    isCorrect === false ? "border-red-500 bg-red-500/10" : "",
                    isFullscreen ? "text-[8vw] p-12 px-20 rounded-3xl" : "text-7xl md:text-8xl"
                )}>
                    {enigma.emojis}
                </div>
            </div>

            {gameState === 'playing' ? (
                <div className="flex gap-2.5 w-full max-w-md mt-4 z-10 relative">
                    <Input 
                        value={userGuess}
                        onChange={(e) => setUserGuess(e.target.value)}
                        placeholder="Type your translation here..."
                        className={cn("text-center shadow-lg font-semibold", isFullscreen ? "text-2xl h-16 rounded-xl" : "text-lg h-12 rounded-xl")}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                        autoFocus
                    />
                    <Button onClick={handleCheckAnswer} size="lg" className={cn(isFullscreen ? "h-16 w-16 rounded-xl" : "h-12 w-12 rounded-xl", "p-0 bg-primary shadow-lg hover:scale-105 active:scale-95 transition-all")}>
                        <Send className={cn(isFullscreen ? "h-8 w-8" : "h-5 w-5")} />
                    </Button>
                </div>
            ) : (
                <Alert className={cn("mt-6 border-2 transition-all duration-300 max-w-lg z-10 relative shadow-xl text-left", isCorrect ? "bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400" : "bg-destructive/10 border-destructive/40 text-destructive", isFullscreen && "p-6 rounded-2xl")}>
                    {isCorrect ? <Check className={cn(isFullscreen ? "h-8 w-8 shrink-0" : "h-5 w-5 shrink-0")} /> : <X className={cn(isFullscreen ? "h-8 w-8 shrink-0" : "h-5 w-5 shrink-0")} />}
                    <AlertTitle className={cn("font-black tracking-tight", isFullscreen ? "text-2xl mb-1" : "font-bold")}>{isCorrect ? "Correct!" : "Not Quite!"}</AlertTitle>
                    <AlertDescription className={cn(isFullscreen ? "text-lg leading-relaxed" : "text-sm")}>
                        <p className="text-foreground font-semibold">The answer was: <strong className="underline decoration-2 text-primary">{enigma.answer}</strong></p>
                        <p className={cn("opacity-80 font-medium text-muted-foreground mt-1.5")}>{enigma.explanation}</p>
                    </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 'finished':
        const sorted = [...teams].sort((a, b) => b.score - a.score);
        return (
          <div className="text-center flex flex-col items-center gap-6 w-full max-w-xl mx-auto px-4 py-6 animate-in fade-in duration-500">
            <Trophy className={cn("text-amber-400 animate-bounce", isFullscreen ? "h-36 w-36" : "h-20 w-20")} />
            <h2 className={cn("font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse", isFullscreen ? "text-5xl" : "text-4xl")}>Game Over!</h2>
            <p className={cn("font-extrabold text-primary", isFullscreen ? "text-2xl" : "text-xl")}>{sorted[0].name} wins!</p>
            
            {/* Daily Bonus Claimed Banner */}
            {isDailyBonus && (
              <div className="relative w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-2 z-10">
                <div className="absolute inset-0 pointer-events-none">
                  {/* Floating visual coins and stars */}
                  <div className="absolute top-2 left-6 text-sm animate-bounce" style={{ animationDelay: '100ms' }}>🪙</div>
                  <div className="absolute bottom-4 right-12 text-sm animate-bounce" style={{ animationDelay: '300ms' }}>⭐</div>
                  <div className="absolute top-6 right-8 text-sm animate-bounce" style={{ animationDelay: '500ms' }}>🪙</div>
                  <div className="absolute bottom-2 left-10 text-sm animate-bounce" style={{ animationDelay: '700ms' }}>⭐</div>
                </div>
                <div className="enigma-glow-coin bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
                  <Coins className="h-10 w-10 fill-amber-950 text-amber-950 animate-spin" style={{ animationDuration: '5s' }} />
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-background shadow">
                    CLAIMED
                  </span>
                </div>
                <h3 className="text-lg font-black text-amber-400 tracking-wide uppercase">Daily Bonus Coins Claimed!</h3>
                <p className="text-sm font-semibold text-muted-foreground text-center max-w-xs leading-relaxed">
                  You completed the Daily Game and earned <span className="text-yellow-400 font-black">+{dailyBonusAmount} Lingo-Coins</span> for your pet!
                </p>
              </div>
            )}

            {firstScorer && (
                <div className={cn("bg-primary/10 border-2 border-primary/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 z-10", isFullscreen && "p-6 rounded-2xl")}>
                    <Sparkles className={cn("text-primary", isFullscreen ? "h-6 w-6 animate-pulse" : "h-5 w-5")} />
                    <p className={cn("font-bold text-foreground", isFullscreen ? "text-xl" : "text-sm")}>
                        First Correct Guess: <span className="text-primary italic">{firstScorer}</span>
                    </p>
                </div>
            )}
            
            <Card className={cn("w-full max-w-md z-10", isFullscreen && "max-w-lg")}>
              <CardContent className={cn("pt-6 space-y-2.5", isFullscreen && "p-8")}>
                {sorted.map((team) => (
                  <div key={team.name} className={cn("flex justify-between items-center border-b border-border/10 pb-2.5 last:border-0 last:pb-0", isFullscreen ? "text-xl" : "text-lg")}>
                    <span className="font-semibold text-muted-foreground">{team.name}:</span>
                    <span className="font-black text-primary">{team.score} pts</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Button onClick={resetGame} size="lg" className={cn("bg-gradient-to-r from-primary to-indigo-600 font-bold z-10 shadow-lg hover:scale-105 active:scale-95 transition-all", isFullscreen && "h-14 px-10 text-lg rounded-xl")}>
                <Repeat className={cn("mr-3", isFullscreen ? "h-5 w-5" : "h-4 w-4")} />
                Play Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "w-full relative min-h-[40rem] flex flex-col justify-center items-center",
      isFullscreen ? "min-h-screen bg-slate-950 p-4 sm:p-8" : "py-4"
    )}>
      <style>{`
        @keyframes enigma-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes enigma-pop {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes enigma-float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.35; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
        }
        @keyframes enigma-particle-fly {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translate(0, 0) scale(1.4) rotate(45deg);
          }
          100% {
            transform: translate(var(--tx-end), var(--ty-end)) scale(0.3) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes enigma-pulse-warning {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.8; }
        }
        @keyframes enigma-glow-coin {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)); }
        }
        .enigma-animate-shake {
          animation: enigma-shake 0.5s ease-in-out;
        }
        .enigma-animate-pop {
          animation: enigma-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .enigma-animate-float {
          animation: enigma-float 15s ease-in-out infinite;
        }
        .enigma-pulse-warning {
          animation: enigma-pulse-warning 1s infinite ease-in-out;
        }
        .enigma-glow-coin {
          animation: enigma-glow-coin 2s infinite ease-in-out;
        }
        .enigma-particle {
          position: absolute;
          animation: enigma-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 50;
        }
      `}</style>

      {/* Floating Background Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        {backgroundEmojis.map((item, i) => (
          <div
            key={i}
            className="enigma-animate-float absolute bottom-[-40px]"
            style={{
              left: item.left,
              fontSize: item.size,
              animationDuration: item.duration,
              animationDelay: item.delay,
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      <Card className={cn(
          "w-full transition-all duration-500 flex flex-col z-10 relative overflow-hidden",
          isFullscreen 
              ? "min-h-[90vh] rounded-2xl border-border/20 max-w-5xl bg-card/95 justify-center shadow-2xl" 
              : "max-w-4xl mx-auto bg-card/85 backdrop-blur-sm border-border/25 shadow-xl",
          triggerShake && "enigma-animate-shake"
        )}>
        <CardHeader className="text-center relative border-b border-border/5">
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
              <div className="flex justify-center mb-2">
                  <Icon className="w-12 h-12 text-primary" />
              </div>
          )}
          <CardTitle className={cn("font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500", isFullscreen ? "text-5xl" : "text-3xl")}>{game.title}</CardTitle>
          <CardDescription className={cn(isFullscreen && "text-xl mt-2")}>{game.description}</CardDescription>
          <div className="flex justify-center pt-2">
            <Badge variant="outline" className={cn("font-bold", isFullscreen && "text-lg px-6 py-1")}>{difficulty.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className={cn(
            "space-y-6 text-center flex flex-col items-center justify-center relative",
            isFullscreen ? "min-h-[55vh] max-w-4xl mx-auto w-full px-12" : "min-h-[28rem] p-6"
        )}>
          {renderContent()}
        </CardContent>
        <CardFooter className={cn("flex justify-between items-center gap-4 pt-6 border-t border-border/5 z-10 relative", isFullscreen && "max-w-4xl mx-auto w-full pb-10")}>
          <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-12 px-8 text-lg font-bold rounded-xl")}>
            <Link href="/games">Back to Library</Link>
          </Button>
          {gameState === 'answered' && (
            <Button onClick={handleNextTurn} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black hover:scale-105 active:scale-95 transition-all shadow-lg", isFullscreen && "h-12 px-10 text-lg rounded-xl")}>
              Next Enigma <Repeat className={cn("ml-2", isFullscreen ? "h-5 w-5" : "h-4 w-4")} />
            </Button>
          )}
          {gameState !== 'setup' && (
            <Button variant="ghost" onClick={() => {
              try {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                setUsedAnswers([]);
                toast({ title: "History Cleared", description: "You can now see previous enigmas again." });
              } catch (e) {}
            }} title="Reset riddle history" size={isFullscreen ? "lg" : "default"} className={cn("text-muted-foreground hover:text-foreground", isFullscreen && "text-lg")}>
              <RotateCcw className={cn("mr-2", isFullscreen ? "h-5 w-5" : "h-4 w-4")} /> Clear History
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
