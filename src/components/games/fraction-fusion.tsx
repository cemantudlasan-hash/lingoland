'use client';

import { shuffleArray } from '@/lib/shuffle';
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
import { Loader2, Sparkles, CheckCircle, XCircle, Repeat, Maximize, Minimize, PieChart, Trophy, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SkillLevel } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';

type GameState = 'idle' | 'selecting_difficulty' | 'playing' | 'answered' | 'finished' | 'instructions';

interface Problem {
  numerator: number;
  denominator: number;
  options: string[];
}

const ROUND_TIME_LIMIT = 15;

const backgroundFloats = [
  { emoji: '➕', left: '8%', size: '20px', duration: '12s', delay: '0s' },
  { emoji: '➖', left: '20%', size: '22px', duration: '14s', delay: '3s' },
  { emoji: '✖️', left: '80%', size: '18px', duration: '10s', delay: '1s' },
  { emoji: '➗', left: '92%', size: '24px', duration: '15s', delay: '5s' },
  { emoji: '📐', left: '12%', size: '26px', duration: '13s', delay: '6s' },
  { emoji: '📏', left: '78%', size: '28px', duration: '16s', delay: '2s' },
  { emoji: '⭐', left: '25%', size: '20px', duration: '9s', delay: '4s' },
  { emoji: '🪙', left: '70%', size: '28px', duration: '14s', delay: '7s' }
];

export function FractionFusion({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [difficulty, setDifficulty] = React.useState<SkillLevel>('beginner');
  const [problem, setProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [usedInSession, setUsedInSession] = React.useState<string[]>([]);
  const [timeLeft, setTimeLeft] = React.useState(ROUND_TIME_LIMIT);
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

  const generateProblem = (level: SkillLevel, history: string[]): Problem => {
    let den: number;
    let num: number;
    let fractionStr: string;
    let attempts = 0;

    const getRandomFraction = () => {
      let d: number;
      switch (level) {
        case 'beginner':
          d = [2, 3, 4, 5, 6, 8, 10][Math.floor(Math.random() * 7)];
          break;
        case 'intermediate':
          d = [7, 9, 11, 12, 15, 16, 20, 24, 25][Math.floor(Math.random() * 9)];
          break;
        case 'advanced':
          d = [13, 14, 17, 18, 19, 21, 22, 23, 26, 27, 28, 29, 30, 32, 40, 50, 60, 75, 80, 100][Math.floor(Math.random() * 20)];
          break;
        default:
          d = 4;
      }
      const n = Math.floor(Math.random() * (d - 1)) + 1;
      return { n, d };
    };

    do {
      const { n, d } = getRandomFraction();
      num = n;
      den = d;
      fractionStr = `${num}/${den}`;
      attempts++;
    } while (history.includes(fractionStr) && attempts < 50);

    const correct = `${num}/${den}`;
    const options = [correct];
    while (options.length < 4) {
      const { n: wNum, d: wDen } = getRandomFraction();
      const opt = `${wNum}/${wDen}`;
      if (!options.includes(opt)) options.push(opt);
    }

    return {
      numerator: num,
      denominator: den,
      options: shuffleArray(options),
    };
  };

  const handleStartGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    setUsedInSession([]);
    nextRound(level, []);
  };

  const nextRound = (level: SkillLevel, history: string[]) => {
    const newProblem = generateProblem(level, history);
    setProblem(newProblem);
    setUsedInSession((prev) => [...prev, `${newProblem.numerator}/${newProblem.denominator}`]);
    setIsCorrect(null);
    setParticles([]);
    setTimeLeft(ROUND_TIME_LIMIT);
    setGameState('playing');
  };

  const handleTimeUp = React.useCallback(() => {
    if (gameState !== 'playing') return;
    setIsCorrect(false);
    setTriggerShake(true);
    setTimeout(() => setTriggerShake(false), 500);
    setGameState('answered');
    
    setTimeout(() => {
      if (round < 10) {
        setRound((r) => r + 1);
        nextRound(difficulty, usedInSession);
      } else {
        setGameState('finished');
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { 
            slug: game?.slug || 'fraction-fusion', 
            score, 
            difficulty 
          }
        });
        toast({
          title: "Fusion Completed! 🏆🍕",
          description: "You've successfully solved 10 fraction problems! Coins and pet XP awarded.",
        });
      }
    }, 2000);
  }, [gameState, round, difficulty, usedInSession, score, firestore, user, game, toast]);

  React.useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeUp();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft, handleTimeUp]);

  const handleAnswer = (choice: string) => {
    if (gameState !== 'playing' || !problem) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const correct = choice === `${problem.numerator}/${problem.denominator}`;
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 10);

      // Generate particles
      const emojisPool = ['➕', '➖', '✖️', '➗', '📐', '📏', '⭐', '🪙'];
      const colorsPool = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#a855f7', '#06b6d4'];
      const newParticles = Array.from({ length: 30 }).map((_, i) => {
        const angle = (i * 12 * Math.PI) / 180 + (Math.random() * 0.2 - 0.1);
        const distance = Math.floor(Math.random() * 120) + 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 80;
        
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

    setTimeout(() => {
      if (round < 10) {
        setRound((r) => r + 1);
        nextRound(difficulty, usedInSession);
      } else {
        setGameState('finished');
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { 
            slug: game?.slug || 'fraction-fusion', 
            score: score + (correct ? 10 : 0), 
            difficulty 
          }
        });
        toast({
          title: 'Fusion Completed! 🏆🍕',
          description: 'You completed Fraction Fusion. Earned Lingo-Coins and pet stats.',
        });
      }
    }, 2000);
  };

  const renderPie = (num: number, den: number) => {
    const radius = 100;
    const center = 110;
    const slices = [];
    
    for (let i = 0; i < den; i++) {
      const startAngle = (i * 360) / den;
      const endAngle = ((i + 1) * 360) / den;
      const x1 = center + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = center + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = center + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = center + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
      
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      slices.push(
        <path
          key={i}
          d={d}
          fill={i < num ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
          stroke="white"
          strokeWidth="2"
          className="transition-colors duration-500"
        />
      );
    }
    
    return (
      <svg viewBox="0 0 220 220" className={cn("drop-shadow-2xl relative transition-all duration-300", isCorrect === true ? "scale-105" : "", isFullscreen ? "w-96 h-96" : "w-48 h-48 md:w-64 md:h-64")}>
        {slices}
      </svg>
    );
  };

  if (!game) return null;

  return (
    <div className={cn(
      "w-full relative min-h-[40rem] flex flex-col justify-center items-center",
      isFullscreen ? "min-h-screen bg-slate-950 p-4 sm:p-8" : "py-4"
    )}>
      <style>{`
        @keyframes math-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes math-pop {
          0% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes math-float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.35; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
        }
        @keyframes math-particle-fly {
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
        @keyframes math-pulse-warning {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.8; }
        }
        @keyframes math-glow-coin {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)); }
        }
        .math-animate-shake {
          animation: math-shake 0.5s ease-in-out;
        }
        .math-animate-pop {
          animation: math-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .math-animate-float {
          animation: math-float 15s ease-in-out infinite;
        }
        .math-pulse-warning {
          animation: math-pulse-warning 1s infinite ease-in-out;
        }
        .math-glow-coin {
          animation: math-glow-coin 2s infinite ease-in-out;
        }
        .math-particle {
          position: absolute;
          animation: math-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 50;
        }
      `}</style>

      {/* Floating Background Math Operators */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        {backgroundFloats.map((item, i) => (
          <div
            key={i}
            className="math-animate-float absolute bottom-[-40px]"
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
          "w-full transition-all duration-500 flex flex-col overflow-hidden z-10 relative",
          isFullscreen 
              ? "min-h-[90vh] rounded-2xl border-border/20 max-w-5xl bg-card/95 justify-center shadow-2xl" 
              : "max-w-4xl mx-auto bg-card/85 backdrop-blur-sm border-border/25 shadow-xl",
          triggerShake && "math-animate-shake"
        )}>
        <CardHeader className="text-center relative border-b border-white/5">
          <Button variant="ghost" size="sm" className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]" onClick={onToggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
          {!isFullscreen && <PieChart className="w-12 h-12 text-primary mx-auto mb-2" />}
          <CardTitle className={cn("font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500", isFullscreen ? "text-5xl" : "text-3xl")}>{game.title}</CardTitle>
          <CardDescription className={cn(isFullscreen && "text-xl mt-2")}>{game.description}</CardDescription>
          {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty') && (
              <div className="flex justify-center gap-2 pt-2">
                  <Badge variant="outline" className={cn("font-bold uppercase", isFullscreen && "text-lg px-6 py-1")}>{difficulty}</Badge>
                  <Badge variant="secondary" className={cn("font-bold", isFullscreen && "text-lg px-6 py-1")}>Round {round}/10</Badge>
              </div>
          )}
        </CardHeader>

        <CardContent className={cn("flex flex-col items-center justify-center relative", isFullscreen ? "min-h-[55vh] max-w-4xl mx-auto w-full px-12" : "min-h-[28rem] p-6")}>
          {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
              {isDailyBonus && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-amber-500/20 animate-pulse mb-2">
                  <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                  ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
                </Badge>
              )}
              <p className={cn("text-muted-foreground font-semibold", isFullscreen ? "text-2xl" : "text-base")}>Match pie chart representations to their numeric fractions.</p>
              <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg hover:scale-105 active:scale-95 transition-all", isFullscreen && "h-14 rounded-xl text-xl px-12")}>
                <Sparkles className={cn("mr-3", isFullscreen ? "h-6 w-6" : "h-4 w-4")} />
                Initialize
              </Button>
            </div>
          )}

          {gameState === "instructions" && (
               <div className={cn(
                   "flex flex-col items-center justify-center gap-6 text-center bg-muted/60 backdrop-blur-sm rounded-2xl border border-border/20 shadow-xl mx-auto animate-in fade-in duration-300",
                   isFullscreen ? "p-12 max-w-2xl scale-105" : "p-8 max-w-xl"
               )}>
                  <h3 className={cn("font-black uppercase tracking-wider text-center text-primary", isFullscreen ? "text-3xl" : "text-xl")}>MISSION BRIEFING</h3>
                  <div className={cn("text-left space-y-3 font-medium text-muted-foreground", isFullscreen ? "text-lg" : "text-sm")}>
                      <p className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">1</span>
                        <span>Observe the visual fraction pie chart at the center.</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">2</span>
                        <span>The colored slice represents the numerator (top number).</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">3</span>
                        <span>The total slices represent the denominator (bottom number).</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">4</span>
                        <span>Choose the correct fraction expression before the 15-second timer runs out.</span>
                      </p>
                  </div>
                  <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold", isFullscreen && "h-14 rounded-xl text-xl")}>Select Difficulty</Button>
              </div>
          )}

          {gameState === "selecting_difficulty" && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in duration-300">
              <p className={cn("text-muted-foreground font-black uppercase tracking-widest text-xs", isFullscreen ? "text-xl" : "text-xs")}>Choose Challenge Level</p>
              <div className="grid grid-cols-1 gap-3 w-full">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} className={cn("h-16 text-xl font-bold uppercase tracking-widest border-2 hover:border-primary hover:bg-primary/5 transition-all shadow-md", isFullscreen && "h-20 rounded-xl text-2xl")}>
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {(gameState === "playing" || gameState === "answered") && problem && (
            <div className="w-full flex flex-col items-center gap-8 max-w-4xl relative">
              {/* Confetti Particles Container */}
              {particles.map((p) => (
                <span
                  key={p.id}
                  className="math-particle"
                  style={{
                    '--tx-end': p.tx,
                    '--ty-end': p.ty,
                    '--dur': p.duration,
                    '--delay': p.delay,
                    fontSize: `${p.size}px`,
                    color: p.color,
                    left: '50%',
                    top: '30%',
                  } as React.CSSProperties}
                >
                  {p.emoji}
                </span>
              ))}

              {/* Timer Bar */}
              <div className="w-full max-w-lg space-y-1.5 z-10 relative">
                  <div className="flex justify-between font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                      <span>Time Sync</span>
                      <span className={cn(timeLeft <= 3 ? "text-red-500 animate-pulse font-black" : "")}>{timeLeft}s</span>
                  </div>
                  <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden border border-border/10">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300 ease-out rounded-full",
                        timeLeft > 8 
                          ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                          : timeLeft > 3 
                            ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                            : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse"
                      )}
                      style={{ width: `${(timeLeft / ROUND_TIME_LIMIT) * 100}%` }}
                    />
                  </div>
              </div>

              <div className="animate-in zoom-in duration-500 z-10 relative">
                  {renderPie(problem.numerator, problem.denominator)}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl z-10 relative">
                  {problem.options.map(opt => (
                      <Button
                          key={opt}
                          variant={gameState === 'answered' ? (opt === `${problem.numerator}/${problem.denominator}` ? 'secondary' : 'destructive') : 'outline'}
                          onClick={() => handleAnswer(opt)}
                          className={cn(
                              "h-20 text-3xl font-black rounded-2xl transition-all border-2 shadow-md",
                              gameState === 'answered' && opt === `${problem.numerator}/${problem.denominator}` && "bg-green-500 text-white border-green-400 scale-105",
                              gameState === 'playing' && "hover:scale-105 hover:border-primary active:scale-95",
                              isFullscreen && "h-28 text-5xl"
                          )}
                          disabled={gameState === 'answered'}
                      >
                          {opt}
                      </Button>
                  ))}
              </div>

              {gameState === 'answered' && (
                  <div className={cn(
                      "w-full max-w-lg p-5 rounded-2xl border-2 animate-in zoom-in duration-300 shadow-lg flex items-center justify-center gap-3 z-10 relative",
                      isCorrect ? "bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400" : "bg-destructive/10 border-destructive/40 text-destructive"
                  )}>
                      {isCorrect ? <CheckCircle className="h-6 w-6 shrink-0" /> : <XCircle className="h-6 w-6 shrink-0" />}
                      <span className={cn("font-black uppercase tracking-wider text-lg")}>
                          {isCorrect ? "FUSION SUCCESSFUL" : "EQUATION OVERFLOW"}
                      </span>
                  </div>
              )}
            </div>
          )}

          {gameState === "finished" && (
              <div className="text-center flex flex-col items-center gap-6 w-full max-w-xl mx-auto px-4 py-6 animate-in fade-in duration-500">
                  <Trophy className={cn("text-amber-400 animate-bounce", isFullscreen ? "h-36 w-36" : "h-20 w-20")} />
                  <div className="space-y-1">
                      <h2 className={cn("font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse", isFullscreen ? "text-5xl" : "text-4xl")}>Analysis Complete</h2>
                      <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-2xl" : "text-xl")}>Final Score: {score}</p>
                  </div>

                  {/* Daily Bonus Claimed Banner */}
                  {isDailyBonus && (
                    <div className="relative w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-2 z-10">
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-2 left-6 text-sm animate-bounce" style={{ animationDelay: '100ms' }}>🪙</div>
                        <div className="absolute bottom-4 right-12 text-sm animate-bounce" style={{ animationDelay: '300ms' }}>⭐</div>
                        <div className="absolute top-6 right-8 text-sm animate-bounce" style={{ animationDelay: '500ms' }}>🪙</div>
                        <div className="absolute bottom-2 left-10 text-sm animate-bounce" style={{ animationDelay: '700ms' }}>⭐</div>
                      </div>
                      <div className="math-glow-coin bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
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

                  <Button onClick={() => setGameState('idle')} size="lg" className={cn("bg-gradient-to-r from-primary to-indigo-600 font-bold z-10 shadow-lg hover:scale-105 active:scale-95 transition-all", isFullscreen && "h-14 px-10 text-lg rounded-xl")}>
                      <Repeat className={cn("mr-3", isFullscreen ? "h-5 w-5" : "h-4 w-4")} /> Restart System
                  </Button>
              </div>
          )}
        </CardContent>

        <CardFooter className={cn("flex justify-between border-t border-white/5 p-6 z-10 relative", isFullscreen && "pb-10 max-w-5xl mx-auto w-full")}>
          <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-12 px-8 text-lg font-bold rounded-xl")}>
            <Link href="/games">Abort Mission</Link>
          </Button>
          {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty') && <p className="font-black text-primary uppercase tracking-widest">Score: {score}</p>}
        </CardFooter>
      </Card>
    </div>
  );
}
