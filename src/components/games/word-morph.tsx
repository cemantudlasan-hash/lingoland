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
import { generateWordMorph } from '@/ai/flows/generate-word-morph';
import type { GenerateWordMorphOutput } from '@/ai/flows/schemas/word-morph-schema';
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
  Zap,
  Send,
  SkipForward,
  Maximize,
  Minimize,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type GameState = 'setup' | 'loading' | 'playing' | 'answered' | 'finished' | 'instructions' | 'idle';
type Team = { name: string; score: number };

const TURN_TIME_SECONDS = 60;
const LOCAL_STORAGE_KEY = 'lingoland_word_morph_used_words';

export function WordMorph({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [teams, setTeams] = React.useState<Team[]>([
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ]);
  const [totalRounds, setTotalRounds] = React.useState(10);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [challenge, setChallenge] = React.useState<GenerateWordMorphOutput | null>(null);
  const [userGuess, setUserGuess] = React.useState('');
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [difficulty, setDifficulty] = React.useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [timeLeft, setTimeLeft] = React.useState(TURN_TIME_SECONDS);
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
      if (stored) setUsedWords(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load used words', e);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usedWords));
    } catch (e) {
      console.error('Failed to save used words', e);
    }
  }, [usedWords]);

  const fetchNextChallenge = React.useCallback(async () => {
    setGameState('loading');
    setChallenge(null);
    setUserGuess('');
    setIsCorrect(null);
    setTimeLeft(TURN_TIME_SECONDS);

    try {
      const result = await generateWordMorph({
        difficulty,
        usedWords,
      });
      setChallenge(result);
      setUsedWords((prev) => [...prev, result.targetWord]);
      setGameState('playing');
    } catch (e) {
      console.error('Error generating challenge:', e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate a new word morph.' });
      setGameState('setup');
    }
  }, [difficulty, usedWords, toast]);

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
    const normalizedAnswer = challenge.targetWord.trim().toLowerCase();
    
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
    setUsedWords([]);
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
            <div className="flex gap-2 w-full mt-4">
              <Button onClick={() => setGameState('instructions')} variant="outline" className="flex-1 h-11 sm:h-12 rounded-xl font-bold">
                <HelpCircle className="mr-2 h-4 w-4" /> Rules
              </Button>
              <Button onClick={handleStartGame} className="flex-1 h-11 sm:h-12 font-black uppercase text-base sm:text-lg rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                Start Game
              </Button>
            </div>
          </div>
        );
      case 'instructions':
        return (
          <div className={cn(
            "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full",
            isFullscreen ? "p-6 sm:p-12 max-w-3xl" : "p-5 sm:p-8 max-w-lg"
          )}>
            <h3 className={cn("font-bold text-center", isFullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl")}>How to Play</h3>
            <div className={cn("text-left space-y-3 text-muted-foreground w-full", isFullscreen ? "text-base sm:text-lg" : "text-xs sm:text-sm")}>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>You will be given a <strong>Root Word</strong> and a <strong>Definition</strong>.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Add an appropriate prefix or suffix to the root word to create the target word.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Type your answer and submit before the timer expires to score points!</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
              <Button onClick={() => setGameState(challenge ? 'playing' : 'setup')} variant="outline" className="h-10 sm:h-11 px-5 rounded-xl font-bold">
                Back
              </Button>
              <Button onClick={handleStartGame} className="h-10 sm:h-11 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                Begin Morphing
              </Button>
            </div>
          </div>
        );
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="animate-spin text-primary h-10 w-10 sm:h-14 sm:w-14" />
            <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs sm:text-sm">Synthesizing morphology challenges...</p>
          </div>
        );
      case 'playing':
      case 'answered':
        if (!challenge) return null;
        return (
          <div className="w-full max-w-5xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
            {/* Main Stage (Desktop Left / Center) */}
            <div className="w-full lg:col-span-8 flex flex-col items-center gap-4">
              {/* HUD Bar (Round, Turn, Time) */}
              <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 text-center font-black uppercase tracking-wider text-xs sm:text-sm">
                <div className="p-2 sm:p-3 bg-muted/40 rounded-xl border border-primary/20 shadow-sm">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Round</p>
                  <p className="text-sm sm:text-lg font-black">{currentRound}/{totalRounds}</p>
                </div>
                <div className={cn("p-2 sm:p-3 rounded-xl border-2 transition-all shadow-sm", gameState === 'playing' ? "border-primary bg-primary/10 shadow-primary/10" : "bg-muted/40 border-border/30")}>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Active Turn</p>
                  <p className="truncate text-sm sm:text-lg font-black text-primary">{teams[currentTurn].name}</p>
                </div>
                <div className="p-2 sm:p-3 bg-muted/40 rounded-xl border border-primary/20 shadow-sm">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Time Left</p>
                  <p className="font-mono text-sm sm:text-lg font-black text-amber-500">{timeLeft}s</p>
                </div>
              </div>
              <Progress value={(timeLeft / TURN_TIME_SECONDS) * 100} className="w-full h-2 rounded-full" />

              {/* Mobile Quick Team Score Strip */}
              <div className="flex lg:hidden items-center justify-center gap-2 flex-wrap w-full">
                {teams.map((t, idx) => (
                  <Badge
                    key={t.name}
                    variant={idx === currentTurn ? "default" : "outline"}
                    className={cn(
                      "text-xs px-2.5 py-0.5 font-bold transition-all",
                      idx === currentTurn ? "shadow-sm" : "opacity-75"
                    )}
                  >
                    <span>{t.name}:</span>
                    <span className="font-mono ml-1 font-black">{t.score} pts</span>
                  </Badge>
                ))}
              </div>

              {/* Morphology Target Root Word Pod */}
              <div className="flex flex-col items-center gap-2 sm:gap-3 w-full mt-1">
                <span className="font-bold text-muted-foreground uppercase tracking-widest text-[11px] sm:text-xs">
                  Morph This Root Word:
                </span>
                <div className="font-black px-6 py-4 sm:px-12 sm:py-6 bg-card rounded-2xl sm:rounded-3xl shadow-xl border-2 sm:border-4 border-primary/30 uppercase italic text-3xl sm:text-5xl md:text-6xl text-primary text-center tracking-wide w-full max-w-lg">
                  {challenge.rootWord}
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/40 border border-primary/15 max-w-lg w-full text-center italic font-semibold text-xs sm:text-sm md:text-base text-foreground/90">
                  &quot;{challenge.definition}&quot;
                </div>
              </div>

              {/* Input Action Zone or Answer Alert */}
              {gameState === 'playing' ? (
                <div className="flex flex-col items-center gap-3 w-full max-w-md mt-2">
                  <div className="flex gap-2 sm:gap-3 w-full">
                    <Input 
                      value={userGuess}
                      onChange={(e) => setUserGuess(e.target.value)}
                      placeholder="Type morphed word..."
                      className="text-center font-black uppercase tracking-wider bg-card border-2 h-11 sm:h-13 text-base sm:text-xl rounded-xl"
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                      autoFocus
                      spellCheck="false"
                    />
                    <Button onClick={handleCheckAnswer} className="shadow-lg h-11 sm:h-13 px-4 sm:px-6 rounded-xl font-bold bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Press Enter or tap Send to submit answer</p>
                </div>
              ) : (
                <div className="w-full max-w-lg flex flex-col items-center gap-3 mt-2">
                  <Alert className={cn(
                    "text-center border-2 rounded-2xl shadow-lg animate-in fade-in zoom-in-95 duration-200 w-full",
                    isCorrect ? "bg-emerald-500/15 border-emerald-500/40 text-foreground" : "bg-rose-500/15 border-rose-500/40 text-foreground"
                  )}>
                    {isCorrect ? <Check className="h-5 w-5 text-emerald-500 mx-auto mb-1" /> : <X className="h-5 w-5 text-rose-500 mx-auto mb-1" />}
                    <AlertTitle className="font-black uppercase tracking-tight text-base sm:text-lg mb-1">
                      {isCorrect ? "MISSION SUCCESS! (+10 PTS)" : "DECODING ERROR!"}
                    </AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm">
                      <p className="mb-2">Target morphed word: <strong className="uppercase italic text-primary font-black ml-1">{challenge.targetWord}</strong></p>
                      <p className="opacity-80 border-t border-border/20 pt-2 text-[11px] sm:text-xs">
                        <strong>Rule:</strong> {challenge.morphType}. {challenge.explanation}
                      </p>
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleNextTurn}
                    className="w-full h-11 sm:h-12 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Continue to Next Turn ➔
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop Teams Scoreboard Sidebar */}
            <div className="hidden lg:flex lg:col-span-4 flex-col gap-3 w-full p-4 rounded-2xl bg-card border border-border/30 shadow-md">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Live Team Standings</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>

              <div className="flex flex-col gap-2">
                {teams.map((t, idx) => (
                  <div
                    key={t.name}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      idx === currentTurn
                        ? "bg-primary/10 border-primary text-foreground font-black shadow-sm"
                        : "bg-muted/30 border-border/20 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold w-5">{idx + 1}.</span>
                      <span className="text-sm font-bold truncate max-w-[120px]">{t.name}</span>
                      {idx === currentTurn && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">Active</Badge>
                      )}
                    </div>
                    <span className="font-mono text-sm font-black text-primary">{t.score} pts</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border/20 text-[11px] text-muted-foreground">
                <p>Turn rotation occurs after every guess or timeout.</p>
              </div>
            </div>
          </div>
        );
      case 'finished':
        const sorted = [...teams].sort((a, b) => b.score - a.score);
        return (
          <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in-95 duration-300 w-full max-w-md mx-auto py-4">
            <Trophy className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] h-16 w-16 sm:h-20 sm:w-20" />
            <div className="space-y-1">
              <h2 className="font-black uppercase tracking-tight text-xl sm:text-3xl">Game Complete!</h2>
              <p className="font-bold text-primary uppercase text-sm sm:text-lg">🎉 {sorted[0].name} is the Morph Master! 🎉</p>
            </div>
            <Card className="w-full p-4 sm:p-5 bg-card/60 rounded-2xl border border-border/20">
              <h3 className="font-bold uppercase tracking-wider text-muted-foreground mb-3 text-xs sm:text-sm">Final Score</h3>
              <div className="flex flex-col gap-2">
                {sorted.map((team) => (
                  <div key={team.name} className="flex justify-between font-bold text-sm sm:text-base">
                    <span>{team.name}:</span>
                    <span className="text-primary">{team.score} pts</span>
                  </div>
                ))}
              </div>
            </Card>
            <Button onClick={resetGame} className="h-11 sm:h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-lg">
              <Repeat className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto py-6">
            <p className="text-muted-foreground text-xs sm:text-base">
              Transform words using prefixes and suffixes. Master English morphology!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button onClick={() => setGameState('instructions')} variant="outline" className="h-11 sm:h-12 px-6 rounded-xl font-bold">
                <HelpCircle className="mr-2 h-4 w-4" /> How to Play
              </Button>
              <Button onClick={() => setGameState('setup')} className="h-11 sm:h-12 px-8 rounded-xl font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                <Sparkles className="mr-2 h-5 w-5" /> Setup Game
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] max-w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden rounded-2xl md:rounded-3xl border border-border/20 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300",
      isFullscreen && "fixed inset-0 z-50 min-h-screen rounded-none border-none max-w-none p-2 sm:p-6 bg-background"
    )}>
      <CardHeader className="text-center relative px-4 pt-4 sm:pt-6 pb-2">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 z-20">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setGameState(gameState === 'instructions' ? 'idle' : 'instructions')}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Guide</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
        </div>

        <div className="flex justify-center mb-2">
          <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
        </div>
        <CardTitle className={cn("font-black tracking-tight uppercase", isFullscreen ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-3xl md:text-4xl")}>
          {game.title}
        </CardTitle>
        <CardDescription className={cn("text-xs sm:text-sm md:text-base max-w-xl mx-auto", isFullscreen && "text-sm sm:text-base")}>
          {game.description}
        </CardDescription>
        <div className="flex justify-center pt-2">
          <Badge variant="outline" className="text-xs sm:text-sm px-3 py-0.5">{difficulty.toUpperCase()}</Badge>
        </div>
      </CardHeader>

      <CardContent className={cn(
        "flex-grow flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto overflow-y-auto",
        isFullscreen ? "min-h-[60vh] max-w-6xl" : "min-h-[24rem]"
      )}>
        {renderContent()}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between items-center gap-2 p-3 sm:p-6 border-t border-border/10">
        <Button variant="outline" asChild size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl">
          <Link href="/games">Back to Library</Link>
        </Button>

        {gameState === 'answered' && (
          <Button onClick={handleNextTurn} size="sm" className="h-9 sm:h-10 px-4 sm:px-5 font-bold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md">
            Next Morph <Repeat className="ml-1.5 h-4 w-4" />
          </Button>
        )}

        {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'setup' && (
          <div className="flex gap-1.5">
            <Button variant="ghost" onClick={handleNextTurn} title="Skip this word" size="sm" className="h-9 px-2.5 text-xs font-semibold">
              <SkipForward className="mr-1 h-3.5 w-3.5" /> Skip
            </Button>
            <Button variant="ghost" onClick={() => {
              try {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                setUsedWords([]);
                toast({ title: "History Cleared", description: "You can now see previous words again." });
              } catch (e) {}
            }} title="Reset challenge history" size="sm" className="h-9 px-2.5 text-xs font-semibold">
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}