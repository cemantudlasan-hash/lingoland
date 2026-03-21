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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { generateGrammarPair } from '@/ai/flows/generate-verb-pair';
import type { GenerateGrammarPairOutput } from '@/ai/flows/schemas/verb-pair-schema';
import { Loader2, Sparkles, UserPlus, Trash2, Repeat, Gift, Bomb, Timer, Maximize, Minimize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


type GameState = 'setup' | 'loading' | 'playing' | 'result' | 'finished' | 'instructions';
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
        
        setGifts(newGifts.sort(() => Math.random() - 0.5)); // Shuffle the gifts
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
                 <div className="flex flex-col items-center gap-6 w-full max-w-md">
                    <h3 className="text-xl font-bold">Game Setup</h3>
                    <div className="w-full space-y-2 text-left">
                      <label className="text-sm font-bold">Grammar Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {GRAMMAR_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full space-y-2 text-left">
                      <label className="text-sm font-bold">Number of Rounds</label>
                      <Select value={String(totalRounds)} onValueChange={(v) => setTotalRounds(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 Rounds</SelectItem>
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
                            <UserPlus className="mr-2" />
                            Add Team
                        </Button>
                    </div>
                    <Button onClick={handleStartGame} size="lg" className="w-full h-14 font-black uppercase text-xl rounded-2xl shadow-lg mt-4">Begin Mission</Button>
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
                       <p>1. The game will show a focus word for the round. Discuss its usage with your class.</p>
                        <p>2. You have 30 seconds to choose one of the two mystery gifts.</p>
                        <p>3. One gift contains a <strong>correct</strong> sentence (+ Points), and the other is <strong>incorrect</strong> (- Points).</p>
                        <p>4. The team with the highest capital at the end wins!</p>
                    </div>
                    <Button onClick={() => { setRound(0); prepareNextRound(); }} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Let's Play!</Button>
                </div>
            );
        case 'loading':
            return (
                <div className="flex flex-col items-center justify-center gap-6">
                    <Loader2 className={cn("animate-spin text-primary", isFullscreen ? "h-24 w-24" : "h-12 w-12")} />
                    <p className={cn("text-muted-foreground animate-pulse font-black uppercase tracking-widest", isFullscreen ? "text-3xl" : "text-lg")}>Packaging linguistic gifts...</p>
                </div>
            );
        case 'playing':
            return (
                <div className="w-full flex flex-col items-center gap-8 max-w-5xl">
                    <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground", isFullscreen ? "text-3xl" : "text-xl")}>Round {round}: The word is <span className="text-primary italic">"{currentItem}"</span></h3>
                    <div className={cn("flex flex-col items-center gap-2", isFullscreen && "gap-4")}>
                        <p className={cn("font-black uppercase tracking-widest text-primary", isFullscreen ? "text-4xl" : "text-2xl")}>{teams[currentTurn].name}, choose your prize!</p>
                        <div className="flex items-center gap-3 text-muted-foreground bg-muted p-2 px-4 rounded-full border-2 border-primary/10">
                            <Timer className={cn(isFullscreen ? "h-8 w-8" : "h-5 w-5")}/>
                            <span className={cn("font-mono font-black", isFullscreen ? "text-4xl" : "text-xl")}>{timeLeft}s</span>
                        </div>
                    </div>
                     <div className={cn("flex gap-12 mt-10 justify-center", isFullscreen && "gap-24")}>
                        <button key={0} onClick={() => handleChooseGift(gifts[0])} className="transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                            <Gift className={cn("text-yellow-400 drop-shadow-lg", isFullscreen ? "w-64 h-64" : "w-40 h-40")} />
                        </button>
                        <button key={1} onClick={() => handleChooseGift(gifts[1])} className="transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                            <Gift className={cn("text-red-500 drop-shadow-lg", isFullscreen ? "w-64 h-64" : "w-40 h-40")} />
                        </button>
                    </div>
                </div>
            );
        case 'result':
            if (!chosenGift) return null;
            return (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className={cn("w-full bg-card p-12 rounded-[3rem] border-4 text-center shadow-2xl animate-in zoom-in duration-300", isFullscreen ? "max-w-4xl" : "max-w-2xl")}>
                        <h2 className={cn("font-black uppercase tracking-tighter mb-8", isFullscreen ? "text-6xl" : "text-4xl")}>
                            {chosenGift.isGood ? 'A GOOD GIFT!' : 'A TRAPPED GIFT!'}
                        </h2>
                        <div className="flex flex-col items-center gap-8">
                            {chosenGift.isGood ? <Gift className={cn("text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]", isFullscreen ? "w-48 h-48" : "w-32 h-32")} /> : <Bomb className={cn("text-destructive drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]", isFullscreen ? "w-48 h-48" : "w-32 h-32")} />}
                            <p className={cn('font-black tracking-tighter', isFullscreen ? "text-9xl" : "text-7xl", chosenGift.isGood ? 'text-green-500' : 'text-destructive')}>
                                {chosenGift.points > 0 ? `+${chosenGift.points}` : chosenGift.points}
                            </p>
                             <div className={cn("p-8 rounded-3xl bg-muted/20 border-2 border-primary/20 italic font-bold leading-tight", isFullscreen ? "text-4xl" : "text-2xl")}>
                                "{chosenGift.sentence}"
                             </div>
                             {!chosenGift.isGood && chosenGift.explanation && (
                                 <p className={cn("text-muted-foreground font-medium", isFullscreen ? "text-2xl" : "text-sm")}><strong>Correction:</strong> {chosenGift.explanation}</p>
                             )}
                        </div>
                        <Button onClick={handleNextTurn} size="lg" className={cn("mt-12 font-black uppercase", isFullscreen && "h-20 px-16 text-2xl rounded-2xl")}>Proceed</Button>
                    </Card>
                </div>
            );
        case 'finished':
            const sortedTeams = [...teams].sort((a,b) => b.score - a.score);
            return (
                <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                    <Trophy className={cn("text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]", isFullscreen ? "h-48 w-48" : "h-24 w-24")} />
                    <div className="space-y-2">
                        <h2 className={cn("font-black uppercase tracking-tighter text-white", isFullscreen ? "text-7xl" : "text-4xl")}>Game Over!</h2>
                        <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-4xl" : "text-2xl")}>🎉 {sortedTeams[0].name} wins! 🎉</p>
                    </div>
                    <Card className={cn("w-full max-w-sm p-6 bg-card/50", isFullscreen && "max-w-xl p-12")}>
                        <h3 className={cn("font-black uppercase tracking-widest text-muted-foreground mb-4", isFullscreen ? "text-2xl" : "text-sm")}>Final Ledger</h3>
                        <div className="flex flex-col gap-4">
                            {sortedTeams.map(team => (
                                <div key={team.name} className={cn("flex justify-between font-bold", isFullscreen ? "text-3xl" : "text-xl")}>
                                    <span>{team.name}:</span>
                                    <span className="text-primary">{team.score} points</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Button onClick={resetGame} size="lg" className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}><Repeat className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")}/>Play Again</Button>
                </div>
            );
        default:
             return (
                <div className="flex flex-col items-center gap-4">
                    <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Choose a gift, test your luck, and master English!</p>
                    <Button onClick={() => setGameState('setup')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-16 text-3xl rounded-3xl")}>
                        <Sparkles className={cn("mr-2 h-5 w-5", isFullscreen && "h-10 w-10")} /> Initialize
                    </Button>
                </div>
            );
    }
  }

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
          </CardHeader>
          <CardContent className={cn(
              "space-y-6 text-center flex flex-col items-center justify-center",
              isFullscreen ? "min-h-[60vh] max-w-6xl mx-auto w-full px-12" : "min-h-[24rem] p-6"
          )}>
              {gameState !== 'setup' && gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'loading' && (
                  <div className={cn(
                      "w-full grid gap-4 mb-10",
                      teams.length === 2 && "grid-cols-2",
                      teams.length === 3 && "grid-cols-3",
                      teams.length >= 4 && "grid-cols-4",
                      isFullscreen && "max-w-5xl mx-auto"
                  )}>
                      {teams.map((team, index) => (
                          <div key={team.name} className={cn(
                              "p-4 rounded-2xl border-4 transition-all duration-300 shadow-lg",
                              currentTurn === index && gameState === 'playing' ? "border-primary bg-primary/10 scale-105" : "border-transparent bg-muted/50 opacity-70",
                              isFullscreen && "p-6"
                          )}>
                              <p className={cn("truncate font-black uppercase tracking-widest", isFullscreen ? "text-2xl" : "text-sm")}>{team.name}</p>
                              <p className={cn("text-primary font-black", isFullscreen ? "text-4xl" : "text-xl")}>{team.score} pts</p>
                          </div>
                      ))}
                  </div>
              )}
              <div className="flex-grow flex items-center justify-center w-full">
                {renderContent()}
              </div>
          </CardContent>
          <CardFooter className={cn("flex justify-between items-center gap-4 pt-8", isFullscreen && "max-w-6xl mx-auto w-full pb-16")}>
              <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>
                  <Link href="/games">Back to Games</Link>
              </Button>
              {gameState !== 'setup' && gameState !== 'idle' && (
                  <Button variant="secondary" onClick={resetGame} size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-16 px-10 text-xl font-bold rounded-2xl")}>Reset Game</Button>
              )}
          </CardFooter>
      </Card>
  )
}
