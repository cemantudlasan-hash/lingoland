"use client";

import { shuffleArray } from "@/lib/shuffle";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { generateGrammarPair } from '@/ai/flows/generate-verb-pair';
import type { GenerateGrammarPairOutput } from '@/ai/flows/schemas/verb-pair-schema';
import { Loader2, Sparkles, UserPlus, Trash2, Repeat, Gift, Bomb, Timer, Maximize, Minimize, Trophy, BookOpen, ArrowLeft, XOctagon, ShieldCheck, Flame, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


type GameState = 'setup' | 'loading' | 'playing' | 'result' | 'finished' | 'instructions' | 'idle';
type Team = { name: string; score: number };
type GiftChoice = {
    isGood: boolean;
    sentence: string;
    points: number;
    explanation?: string;
};

const POSITIVE_POINTS = [100, 200, 300, 400, 500];
const NEGATIVE_POINTS = [-100, -200, -300, -400, -500];

const GRAMMAR_CATEGORIES = [
    "Verbs", 
    "Adjectives", 
    "Prepositions", 
    "Articles", 
    "Noun Agreement",
    "Personalities",
    "Physical Appearance",
    "Clothes",
    "Chores"
];

export function ChooseYourGift({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('setup');
  const [teams, setTeams] = React.useState<Team[]>([
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ]);
  const [round, setRound] = React.useState(0);
  const [totalRounds, setTotalRounds] = React.useState(10);
  const [category, setCategory] = React.useState<string>(GRAMMAR_CATEGORIES[0]);
  const [currentTurn, setCurrentTurn] = React.useState(0);
  const [gifts, setGifts] = React.useState<GiftChoice[]>([]);
  const [chosenGift, setChosenGift] = React.useState<GiftChoice | null>(null);
  const [usedItems, setUsedItems] = React.useState<string[]>([]);
  const [currentItem, setCurrentItem] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!game) return <div>Game not found</div>;

  const handleStartGame = () => {
      if (teams.length < 1) {
          toast({ variant: 'destructive', title: "Add at least one team."});
          return;
      }
      setTeams(teams.map(t => ({...t, score: 0})));
      setGameState('instructions');
  }

  const prepareNextRound = async () => {
    setGameState('loading');
    setChosenGift(null);
    setGifts([]);
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
        const { goodSentence, badSentence, explanation, item } = await generateGrammarPair({ 
            difficulty: 'intermediate', 
            usedItems: usedItems,
            grammarTopic: category,
        });
        setUsedItems(prev => [...prev, item]);
        setCurrentItem(item);
        
        const goodPoints = POSITIVE_POINTS[Math.floor(Math.random() * POSITIVE_POINTS.length)];
        const badPoints = NEGATIVE_POINTS[Math.floor(Math.random() * NEGATIVE_POINTS.length)];

        const newGifts = [
            { isGood: true, sentence: goodSentence, points: goodPoints },
            { isGood: false, sentence: badSentence, points: badPoints, explanation: explanation },
        ];
        
        setGifts(shuffleArray(newGifts)); // Shuffle the gifts
        setRound(prev => prev + 1);
        setTimeLeft(30);
        setGameState('playing');
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate a new round.'});
        setGameState('setup');
    }
  }

  const handleChooseGift = (gift: GiftChoice) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setChosenGift(gift);
    
    const newTeams = [...teams];
    newTeams[currentTurn].score += gift.points;
    setTeams(newTeams);
    
    setGameState('result');
  }
  
  const handleTimeUp = React.useCallback(() => {
    if (gameState !== 'playing') return;
    toast({ title: "Time's up!", description: "A gift has been chosen for you." });
    const randomGift = gifts[Math.floor(Math.random() * gifts.length)];
    handleChooseGift(randomGift);
  }, [gameState, gifts]);

  React.useEffect(() => {
    if (gameState === 'playing') {
      if (timeLeft <= 0) {
        handleTimeUp();
      } else {
        timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [gameState, timeLeft, handleTimeUp]);

  const handleNextTurn = () => {
      if (round >= totalRounds) {
          setGameState('finished');
      } else {
          setCurrentTurn(prev => (prev + 1) % teams.length);
          prepareNextRound();
      }
  }

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
    setTeams([{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }]);
    setRound(0);
  };

  const Icon = game.icon;

  const renderContent = () => {
    switch (gameState) {
        case 'setup':
            return (
                 <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
                    {/* Telemetry Metric Pods */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full">
                      <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-primary/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mb-1" />
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Category</span>
                        <span className="text-xs sm:text-sm font-black text-foreground truncate max-w-full">{category}</span>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-cyan-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 mb-1" />
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Total Rounds</span>
                        <span className="text-sm sm:text-base font-black text-cyan-300">{totalRounds} Rounds</span>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-purple-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mb-1" />
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Squad Roster</span>
                        <span className="text-sm sm:text-base font-black text-purple-300">{teams.length} Squads</span>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-card/60 border border-emerald-500/20 backdrop-blur flex flex-col items-center justify-center text-center shadow-sm">
                        <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 mb-1" />
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">Turn Window</span>
                        <span className="text-sm sm:text-base font-black text-emerald-300">30s / Choice</span>
                      </div>
                    </div>

                    {/* Main Split Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full text-left">
                      <div className="p-4 sm:p-6 rounded-2xl bg-muted/30 border border-border/40 flex flex-col gap-4">
                        <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-primary flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary" /> Configuration Deck
                        </h4>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grammar Category</label>
                          <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {GRAMMAR_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rounds to Win</label>
                          <Select value={String(totalRounds)} onValueChange={(v) => setTotalRounds(Number(v))}>
                            <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 Rounds (Quick Clash)</SelectItem>
                              <SelectItem value="20">20 Rounds (Standard)</SelectItem>
                              <SelectItem value="30">30 Rounds (Championship)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Roster</label>
                          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                            {teams.map((team, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input 
                                  value={team.name} 
                                  onChange={(e) => handleTeamNameChange(index, e.target.value)} 
                                  className="bg-background/80 text-sm"
                                  placeholder={`Team ${index + 1}`}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeTeam(index)} disabled={teams.length <= 1} className="shrink-0">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" onClick={addTeam} className="w-full text-xs font-bold" disabled={teams.length >= 4}>
                            <UserPlus className="mr-2 h-3.5 w-3.5" /> Add Squad (Max 4)
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6 rounded-2xl bg-muted/30 border border-border/40 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-primary flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" /> Mystery Rules & Protocol
                          </h4>
                          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                            <p className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">1.</span>
                              <span>Each round reveals a target vocabulary or grammar focus item.</span>
                            </p>
                            <p className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold">2.</span>
                              <span>Two mystery gift vaults appear on screen. One contains valid grammar (+pts), the other holds syntax traps (-pts).</span>
                            </p>
                            <p className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold">3.</span>
                              <span>Select within 30 seconds. Higher precision yields maximum scoreboard capital.</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
                          <Button onClick={handleStartGame} size="lg" className="w-full sm:w-1/2 h-11 sm:h-12 font-black uppercase text-xs sm:text-sm rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                            Begin Mission
                          </Button>
                          <Button onClick={() => setGameState('instructions')} variant="outline" size="lg" className="w-full sm:w-1/2 h-11 sm:h-12 font-bold uppercase rounded-xl text-xs sm:text-sm">
                            <BookOpen className="mr-2 h-4 w-4" /> Briefing
                          </Button>
                        </div>
                      </div>
                    </div>
                </div>
            );
        case 'instructions':
             return (
                <div className={cn(
                    "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-2xl mx-auto border border-border/20 shadow-inner w-full max-w-lg p-4 sm:p-8",
                    isFullscreen && "p-8 sm:p-16 max-w-5xl"
                )}>
                    <h3 className={cn("font-black uppercase tracking-widest text-center mb-2 sm:mb-4 text-base sm:text-xl", isFullscreen && "text-xl sm:text-4xl")}>How to Play</h3>
                    <div className={cn("text-left space-y-3 sm:space-y-4 text-xs sm:text-base", isFullscreen && "sm:text-2xl")}>
                       <p>1. The game will show a focus word for the round. Discuss its usage with your class.</p>
                        <p>2. You have 30 seconds to choose one of the two mystery gifts.</p>
                        <p>3. One gift contains a <strong>correct</strong> sentence (+ Points), and the other is <strong>incorrect</strong> (- Points).</p>
                        <p>4. The team with the highest capital at the end wins!</p>
                    </div>
                    <Button onClick={() => { setRound(0); prepareNextRound(); }} size="lg" className={cn("mt-4 sm:mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black h-11 sm:h-12 text-sm sm:text-base w-full rounded-xl sm:rounded-2xl shadow-lg", isFullscreen && "sm:h-20 sm:text-3xl sm:rounded-3xl shadow-xl")}>Let's Play!</Button>
                </div>
            );
        case 'loading':
            return (
                <div className="flex flex-col items-center justify-center gap-6">
                    <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-16 w-16 sm:h-24 sm:w-24" : "h-12 w-12")} />
                    <p className={cn("text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs sm:text-base", isFullscreen && "text-sm sm:text-3xl")}>Packaging linguistic gifts...</p>
                </div>
            );
        case 'playing':
            return (
                <div className="w-full flex flex-col items-center gap-3 sm:gap-8 max-w-5xl px-2">
                    <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground text-center text-xs sm:text-xl", isFullscreen && "text-sm sm:text-3xl")}>Round {round}: The word is <span className="text-primary italic">"{currentItem}"</span></h3>
                    <div className={cn("flex flex-col items-center gap-1.5 sm:gap-2", isFullscreen && "gap-2 sm:gap-4")}>
                        <p className={cn("font-black uppercase tracking-widest text-primary text-center text-sm sm:text-2xl", isFullscreen && "text-base sm:text-4xl")}>{teams[currentTurn].name}, choose your prize!</p>
                        <div className="flex items-center gap-2.5 sm:gap-4">
                            <div className="flex items-center gap-1.5 sm:gap-3 text-muted-foreground bg-muted p-1 sm:p-2 px-2.5 sm:px-4 rounded-full border-2 border-primary/10">
                                <Timer className={cn(isFullscreen ? "h-4 w-4 sm:h-8 sm:w-8" : "h-4 w-4 sm:h-5 sm:w-5")}/>
                                <span className={cn("font-mono font-black text-xs sm:text-xl", isFullscreen && "text-sm sm:text-4xl")}>{timeLeft}s</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={resetGame} className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1 rounded-lg h-8 px-2.5">
                                <XOctagon className="h-3.5 w-3.5" /> Abort Game
                            </Button>
                        </div>
                    </div>
                     <div className={cn("flex gap-4 sm:gap-12 mt-2 sm:mt-10 justify-center items-center", isFullscreen && "gap-6 sm:gap-24")}>
                        <button key={0} onClick={() => handleChooseGift(gifts[0])} className="transition-all duration-300 hover:scale-110 active:scale-95 hover:drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                            <Gift className={cn("text-yellow-400 drop-shadow-lg", isFullscreen ? "w-24 h-24 sm:w-64 sm:h-64" : "w-20 h-20 sm:w-40 sm:h-40")} />
                        </button>
                        <button key={1} onClick={() => handleChooseGift(gifts[1])} className="transition-all duration-300 hover:scale-110 active:scale-95 hover:drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                            <Gift className={cn("text-red-500 drop-shadow-lg", isFullscreen ? "w-24 h-24 sm:w-64 sm:h-64" : "w-20 h-20 sm:w-40 sm:h-40")} />
                        </button>
                    </div>
                </div>
            );
        case 'result':
            if (!chosenGift) return null;
            return (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <Card className={cn("w-full bg-card p-4 sm:p-12 rounded-2xl sm:rounded-[3rem] border-4 text-center shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto", isFullscreen ? "max-w-4xl" : "max-w-2xl")}>
                        <h2 className={cn("font-black uppercase tracking-tighter mb-4 sm:mb-8 text-xl sm:text-4xl", isFullscreen && "sm:text-6xl")}>
                            {chosenGift.isGood ? 'A GOOD GIFT!' : 'A TRAPPED GIFT!'}
                        </h2>
                        <div className="flex flex-col items-center gap-4 sm:gap-8">
                            {chosenGift.isGood ? <Gift className={cn("text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]", isFullscreen ? "w-24 h-24 sm:w-48 sm:h-48" : "w-20 h-20 sm:w-32 sm:h-32")} /> : <Bomb className={cn("text-destructive drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]", isFullscreen ? "w-24 h-24 sm:w-48 sm:h-48" : "w-20 h-20 sm:w-32 sm:h-32")} />}
                            <p className={cn('font-black tracking-tighter text-4xl sm:text-7xl', isFullscreen && "sm:text-9xl", chosenGift.isGood ? 'text-green-500' : 'text-destructive')}>
                                {chosenGift.points > 0 ? `+${chosenGift.points}` : chosenGift.points}
                            </p>
                             <div className={cn("p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-muted/20 border-2 border-primary/20 italic font-bold leading-tight text-sm sm:text-2xl", isFullscreen && "sm:text-4xl")}>
                                "{chosenGift.sentence}"
                             </div>
                             {!chosenGift.isGood && chosenGift.explanation && (
                                 <p className={cn("text-muted-foreground font-medium text-xs sm:text-sm", isFullscreen && "sm:text-2xl")}><strong>Correction:</strong> {chosenGift.explanation}</p>
                             )}
                        </div>
                        <Button onClick={handleNextTurn} size="lg" className={cn("mt-6 sm:mt-12 font-black uppercase w-full sm:w-auto h-11 sm:h-16 px-6 sm:px-16 text-sm sm:text-2xl rounded-xl sm:rounded-2xl")}>Proceed</Button>
                    </Card>
                </div>
            );
        case 'finished':
            const sortedTeams = [...teams].sort((a,b) => b.score - a.score);
            return (
                <div className="text-center flex flex-col items-center gap-4 sm:gap-8 animate-in zoom-in duration-500 w-full max-w-xl mx-auto">
                    <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-20 w-20 sm:h-48 sm:w-48" : "h-16 w-16 sm:h-24 sm:w-24")} />
                    <div className="space-y-1 sm:space-y-2">
                        <h2 className={cn("font-black uppercase tracking-tighter text-white text-2xl sm:text-4xl", isFullscreen && "sm:text-7xl")}>Game Over!</h2>
                        <p className={cn("font-black text-primary uppercase text-base sm:text-2xl", isFullscreen && "sm:text-4xl")}>🎉 {sortedTeams[0].name} wins! 🎉</p>
                    </div>
                    <Card className={cn("w-full max-w-sm p-4 sm:p-6 bg-card/50", isFullscreen && "sm:max-w-xl sm:p-12")}>
                        <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-2 sm:mb-4 text-xs sm:text-sm", isFullscreen && "sm:text-2xl")}>Final Ledger</h3>
                        <div className="flex flex-col gap-2 sm:gap-4">
                            {sortedTeams.map(team => (
                                <div key={team.name} className={cn("flex justify-between font-bold text-sm sm:text-xl", isFullscreen && "sm:text-3xl")}>
                                    <span>{team.name}:</span>
                                    <span className="text-primary">{team.score} points</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Button onClick={resetGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl w-full sm:w-auto h-12 sm:h-20 px-8 sm:px-16 text-base sm:text-3xl rounded-xl sm:rounded-3xl")}><Repeat className={cn("mr-2 sm:mr-3", isFullscreen ? "h-5 w-5 sm:h-10 sm:w-10" : "h-4 w-4 sm:h-5 sm:w-5")}/>Play Again</Button>
                </div>
            );
        default:
             return (
                <div className="flex flex-col items-center gap-4">
                    <p className={cn("text-muted-foreground text-center text-sm sm:text-base", isFullscreen && "sm:text-3xl")}>Choose a gift, test your luck, and master English!</p>
                    <Button onClick={() => setGameState('setup')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl w-full sm:w-auto h-12 sm:h-20 px-8 sm:px-16 text-base sm:text-3xl rounded-xl sm:rounded-3xl")}>
                        <Sparkles className={cn("mr-2 h-4 w-4 sm:h-5 sm:w-5", isFullscreen && "sm:h-10 sm:w-10")} /> Initialize
                    </Button>
                </div>
            );
    }
  }

  return (
      <Card className={cn(
        "w-full transition-all duration-500 flex flex-col justify-between overflow-y-auto overflow-x-hidden max-w-full",
        isFullscreen 
            ? "min-h-screen rounded-none border-none max-w-none bg-background justify-between p-3 sm:p-6" 
            : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl bg-card/80 backdrop-blur-sm border-border/20 shadow-lg"
      )}>
          {/* Universal Game Nav Header */}
          <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-border/20 bg-muted/20">
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/games">
                <ArrowLeft className="h-4 w-4" /> Games
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              {gameState !== 'setup' && gameState !== 'idle' && (
                <Button variant="outline" size="sm" onClick={resetGame} className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-8">
                  <XOctagon className="h-3.5 w-3.5" /> Abort Game
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1 text-muted-foreground hover:text-foreground"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
              </Button>
            </div>
          </div>

          <CardHeader className="text-center relative p-3 sm:p-6">
              {!isFullscreen && (
                  <div className="flex justify-center mb-1 sm:mb-4">
                      <Icon className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
                  </div>
              )}
              <CardTitle className={cn("font-black tracking-tight uppercase text-xl sm:text-2xl md:text-3xl", isFullscreen && "text-xl sm:text-5xl md:text-6xl")}>{game.title}</CardTitle>
              <CardDescription className={cn("text-xs sm:text-sm", isFullscreen && "text-xs sm:text-2xl mt-1 sm:mt-2")}>{game.description}</CardDescription>
          </CardHeader>
          <CardContent className={cn(
              "space-y-4 sm:space-y-6 text-center flex flex-col items-stretch justify-start w-full max-w-full overflow-y-auto overflow-x-hidden pb-16",
              isFullscreen ? "min-h-0 flex-1 max-w-6xl mx-auto w-full px-2 sm:px-12" : "w-full flex-1 min-h-[calc(100dvh-16rem)] p-3 sm:p-6 lg:p-8"
          )}>
              {gameState !== 'setup' && gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'loading' && (
                  <div className={cn(
                      "w-full grid gap-2 sm:gap-4 mb-4 sm:mb-8",
                      teams.length === 2 && "grid-cols-2",
                      teams.length === 3 && "grid-cols-3",
                      teams.length >= 4 && "grid-cols-2 sm:grid-cols-4",
                      isFullscreen && "max-w-5xl mx-auto"
                  )}>
                      {teams.map((team, index) => (
                          <div key={team.name} className={cn(
                              "p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 sm:border-4 transition-all duration-300 shadow-md",
                              currentTurn === index && gameState === 'playing' ? "border-primary bg-primary/10 scale-105" : "border-transparent bg-muted/50 opacity-70",
                              isFullscreen && "sm:p-6"
                          )}>
                              <p className={cn("truncate font-black uppercase tracking-widest text-xs sm:text-sm", isFullscreen && "sm:text-2xl")}>{team.name}</p>
                              <p className={cn("text-primary font-black text-sm sm:text-xl", isFullscreen && "sm:text-4xl")}>{team.score} pts</p>
                          </div>
                      ))}
                  </div>
              )}
              <div className="flex-grow flex items-center justify-center w-full">
                {renderContent()}
              </div>
          </CardContent>
          <CardFooter className={cn("flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-4 pt-4 sm:pt-6 w-full max-w-full border-t border-border/20", isFullscreen && "max-w-6xl mx-auto w-full pb-4 sm:pb-6")}>
              <Button variant="outline" asChild size="default" className={cn("w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-bold rounded-xl", isFullscreen && "sm:h-16 sm:px-10 sm:text-xl sm:rounded-2xl")}>
                  <Link href="/games">Back to Games</Link>
              </Button>
              {gameState !== 'setup' && gameState !== 'idle' && (
                  <Button variant="destructive" onClick={resetGame} size="default" className={cn("w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-bold rounded-xl gap-2", isFullscreen && "sm:h-16 sm:px-10 sm:text-xl sm:rounded-2xl")}>
                    <XOctagon className="h-4 w-4" /> Abort Game
                  </Button>
              )}
          </CardFooter>
      </Card>
  )
}
