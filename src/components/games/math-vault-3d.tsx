'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { 
  Trophy, 
  Sparkles, 
  Maximize, 
  Minimize, 
  Rotate3d,
  Coins,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Undo2,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';

type GameState = 'idle' | 'instructions' | 'difficulty_selection' | 'playing' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

interface MathProblem {
  q: string;
  a: number;
}

const GAME_ROUNDS_COUNT = 8;

const BACKGROUND_FLOATS = [
  { char: '+', left: '8%', size: '22px', duration: '12s', delay: '0s' },
  { char: '−', left: '20%', size: '24px', duration: '14s', delay: '3s' },
  { char: '×', left: '80%', size: '20px', duration: '10s', delay: '1s' },
  { char: '÷', left: '92%', size: '26px', duration: '15s', delay: '5s' },
  { char: '=', left: '12%', size: '28px', duration: '13s', delay: '6s' },
  { char: '√', left: '78%', size: '30px', duration: '16s', delay: '2s' },
  { char: 'π', left: '25%', size: '22px', duration: '9s', delay: '4s' },
];

export function MathVault3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('medium');
  const [currentQuestion, setCurrentQuestion] = React.useState<string>('');
  const [currentAnswer, setCurrentAnswer] = React.useState<number | string>('?');
  const [solvedCount, setSolvedCount] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [particles, setParticles] = React.useState<any[]>([]);
  const [usedQuestions, setUsedQuestions] = React.useState<string[]>([]);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

  // Sync memory on load
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('mathVaultMemory');
      if (saved) {
        setUsedQuestions(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load math vault memory", e);
    }
  }, []);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Equation generator logic (guarantees integer outcomes)
  const generateMath = (diff: Difficulty): MathProblem => {
    let num1 = 0;
    let num2 = 0;
    let operator = '+';
    let answer = 0;
    
    if (diff === 'easy') {
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '+') {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 20) + 5; 
        num2 = Math.floor(Math.random() * num1) + 1; 
        answer = num1 - num2;
      }
    } 
    else if (diff === 'medium') {
      const ops = ['+', '-', 'x', '/'];
      operator = ops[Math.floor(Math.random() * ops.length)];
      
      if (operator === '+') {
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * 50) + 20;
        answer = num1 + num2;
      } else if (operator === '-') {
        num1 = Math.floor(Math.random() * 100) + 30;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      } else if (operator === 'x') {
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = num1 * num2;
      } else { // division
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 10) + 2;
        num1 = num2 * answer;
        operator = '/';
      }
    } 
    else { // hard
      const ops = ['x', '/'];
      operator = ops[Math.floor(Math.random() * ops.length)];
      
      if (operator === 'x') {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * 15) + 5;
        answer = num1 * num2;
      } else { // division
        num2 = Math.floor(Math.random() * 15) + 3;
        answer = Math.floor(Math.random() * 15) + 3;
        num1 = num2 * answer;
        operator = '/';
      }
    }

    let operatorDisplay = operator;
    if (operator === 'x') operatorDisplay = '×';
    if (operator === '/') operatorDisplay = '÷';
    if (operator === '-') operatorDisplay = '−';

    return {
      q: `${num1} ${operatorDisplay} ${num2}`,
      a: answer
    };
  };

  const loadNewProblem = (diff: Difficulty, updatedUsed: string[] = usedQuestions) => {
    let maxAttempts = 500;
    let foundUnique = false;
    let newProblem: MathProblem = { q: '', a: 0 };
    let tempUsed = [...updatedUsed];

    while (!foundUnique && maxAttempts > 0) {
      newProblem = generateMath(diff);
      if (!tempUsed.includes(newProblem.q)) {
        foundUnique = true;
      }
      maxAttempts--;
    }

    if (maxAttempts === 0) {
      toast({
        title: "Memory Limit Reached",
        description: "Math combination memory reset to prevent repeats.",
      });
      tempUsed = [];
      newProblem = generateMath(diff);
    }

    setCurrentQuestion(newProblem.q);
    setCurrentAnswer(newProblem.a);
    setUsedQuestions(tempUsed);
  };

  const startGame = (selectedDiff: Difficulty) => {
    setDifficulty(selectedDiff);
    setSolvedCount(0);
    setIsOpen(false);
    setIsAnimating(false);
    setParticles([]);
    loadNewProblem(selectedDiff);
    setGameState('playing');
  };

  const openVault = () => {
    if (isAnimating || isOpen) return;
    setIsAnimating(true);
    setIsOpen(true);

    // Generate cyan/blue matrix particle burst
    const emojisPool = ['⚡', '💎', '🔑', '🔓', '✨', '⚙️', '🔢', '🤖'];
    const colorsPool = ['#00e5ff', '#18ffff', '#3b82f6', '#8b5cf6', '#a855f7', '#6366f1'];
    const newParticles = Array.from({ length: 30 }).map((_, i) => {
      const angle = (i * 12 * Math.PI) / 180 + (Math.random() * 0.2 - 0.1);
      const distance = Math.floor(Math.random() * 140) + 90;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 40;
      
      return {
        id: Math.random() + i,
        tx: `${tx}px`,
        ty: `${ty}px`,
        color: colorsPool[Math.floor(Math.random() * colorsPool.length)],
        emoji: emojisPool[Math.floor(Math.random() * emojisPool.length)],
        size: Math.floor(Math.random() * 16) + 16,
        delay: `${Math.random() * 0.1}s`,
        duration: `${Math.random() * 0.8 + 1.2}s`
      };
    });
    setParticles(newParticles);

    // Save to memory
    const updatedUsed = [...usedQuestions];
    if (!updatedUsed.includes(currentQuestion)) {
      updatedUsed.push(currentQuestion);
      setUsedQuestions(updatedUsed);
      try {
        localStorage.setItem('mathVaultMemory', JSON.stringify(updatedUsed));
      } catch (e) {
        console.error(e);
      }
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  const nextProblem = () => {
    if (isAnimating || !isOpen) return;
    setIsAnimating(true);

    const nextCount = solvedCount + 1;
    if (nextCount >= GAME_ROUNDS_COUNT) {
      // Game completion
      setSolvedCount(nextCount);
      setGameState('finished');
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: { slug: game?.slug || 'math-vault-3d', score: nextCount * 100, difficulty }
      });
      toast({
        title: "Vault System Fully Decrypted! 🏆💎",
        description: "You've successfully solved all math barriers! Lingo-Coins awarded.",
      });
      setIsAnimating(false);
    } else {
      // Swing doors shut
      setIsOpen(false);
      
      setTimeout(() => {
        setSolvedCount(nextCount);
        setParticles([]);
        loadNewProblem(difficulty);
        setIsAnimating(false);
      }, 1000); // matching animation length
    }
  };

  const clearMemory = () => {
    if (confirm("Reset math decryptor history? Problem combinations will reset.")) {
      setUsedQuestions([]);
      try {
        localStorage.removeItem('mathVaultMemory');
      } catch (e) {
        console.error(e);
      }
      toast({
        title: "Memory Cleared",
        description: "Vault database combination cache has been purged.",
      });
    }
  };

  if (!game) return null;

  return (
    <div className={cn(
      "w-full relative min-h-[40rem] flex flex-col justify-center items-center select-none",
      isFullscreen ? "min-h-screen bg-slate-950 p-4 sm:p-8" : "py-4"
    )}>
      <style>{`
        @keyframes vault-float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.25; }
          90% { opacity: 0.25; }
          100% { transform: translateY(-220px) rotate(360deg); opacity: 0; }
        }
        @keyframes vault-particle-fly {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translate(0, 0) scale(1.5) rotate(45deg);
          }
          100% {
            transform: translate(var(--tx-end), var(--ty-end)) scale(0.3) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes vault-glow-coin {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 22px rgba(0, 229, 255, 0.9)); }
        }
        .vault-animate-float {
          animation: vault-float 14s ease-in-out infinite;
        }
        .vault-glow-coin {
          animation: vault-glow-coin 2s infinite ease-in-out;
        }
        .vault-particle {
          position: absolute;
          animation: vault-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>

      {/* Background Floats */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
        {BACKGROUND_FLOATS.map((item, i) => (
          <div
            key={i}
            className="vault-animate-float absolute bottom-[-40px] text-cyan-400 font-extrabold"
            style={{
              left: item.left,
              fontSize: item.size,
              animationDuration: item.duration,
              animationDelay: item.delay,
            }}
          >
            {item.char}
          </div>
        ))}
      </div>

      <Card className={cn(
        "w-full overflow-hidden bg-slate-900/90 backdrop-blur-md border-cyan-500/20 shadow-2xl relative transition-all duration-500 z-10",
        isFullscreen ? "h-screen rounded-none border-none" : "max-w-4xl mx-auto rounded-xl border-2 border-cyan-500/10"
      )}>
        <CardHeader className="text-center pb-2 relative border-b border-cyan-500/10">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-cyan-400/70 hover:text-cyan-300 hover:bg-cyan-500/10 z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>

          <div className="flex justify-center mb-2">
            <div className="p-3 bg-cyan-500/10 rounded-full border border-cyan-500/20">
              <Rotate3d className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            3D Math Vault
          </CardTitle>
          <CardDescription className="text-cyan-200/60 font-medium">
            Crack computational equations to split the security doors and claim content access.
          </CardDescription>
        </CardHeader>

        <CardContent className={cn(
          "flex flex-col items-center justify-center relative p-6 overflow-hidden",
          isFullscreen ? "min-h-[calc(100vh-200px)]" : "min-h-[480px]"
        )}>
          {/* Particles */}
          {particles.map((p) => (
            <span
              key={p.id}
              className="vault-particle"
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

          {gameState === 'idle' && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
              {isDailyBonus && (
                <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-cyan-500/20 animate-pulse mb-2">
                  <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                  ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
                </Badge>
              )}
              <Button 
                onClick={() => setGameState('instructions')} 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-300 font-bold text-white shadow-xl shadow-cyan-500/10 border border-cyan-400/20"
              >
                INITIALIZE DECRYPTOR
              </Button>
            </div>
          )}

          {gameState === 'instructions' && (
            <div className="max-w-md space-y-6 text-center animate-in fade-in zoom-in duration-300 px-6">
              <div className="bg-slate-950/80 p-6 rounded-2xl border-2 border-cyan-500/20 shadow-inner">
                <h3 className="text-xl font-bold mb-4 text-cyan-400 uppercase tracking-widest">DECRYPT PROTOCOL</h3>
                <ul className="text-left space-y-3 text-sm font-medium text-slate-300">
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xs text-cyan-400 shrink-0">1</span>
                    <span>Observe the **Math Equation** split across the security doors.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xs text-cyan-400 shrink-0">2</span>
                    <span>Calculate the final answer in your head or scratch pad.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xs text-cyan-400 shrink-0">3</span>
                    <span>Click **Unlock Answer** to swing open the 3D doors and verify access.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xs text-cyan-400 shrink-0">4</span>
                    <span>Unlock all **{GAME_ROUNDS_COUNT} vaults** to successfully bypass security!</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => setGameState('difficulty_selection')} size="lg" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest border border-cyan-400/30 shadow-lg">
                CHOOSE DIFFICULTY
              </Button>
            </div>
          )}

          {gameState === 'difficulty_selection' && (
            <div className="w-full max-w-md flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 px-6 py-4">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black text-cyan-300 tracking-tighter uppercase">Decrypt Level</h3>
                <p className="text-cyan-200/50 text-sm">Choose the computing difficulty tier</p>
              </div>

              <div className="flex flex-col gap-3 w-full mt-4">
                <Button
                  onClick={() => startGame('easy')}
                  variant="outline"
                  className="h-16 border-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-black text-lg transition-all"
                >
                  EASY (Sums & Subtracts)
                </Button>
                <Button
                  onClick={() => startGame('medium')}
                  variant="outline"
                  className="h-16 border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-slate-950 font-black text-lg transition-all"
                >
                  MEDIUM (Mix Calculations)
                </Button>
                <Button
                  onClick={() => startGame('hard')}
                  variant="outline"
                  className="h-16 border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white font-black text-lg transition-all"
                >
                  HARD (Multiplies & Divides)
                </Button>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className={cn(
              "w-full flex flex-col items-center gap-8 relative transition-all duration-300",
              isFullscreen ? "max-w-5xl" : "max-w-xl"
            )}>
              {/* Stats & Difficulty Info */}
              <div className="flex gap-2 items-center justify-between w-full max-w-lg bg-slate-950/80 px-6 py-2.5 rounded-full border border-cyan-500/10 shadow-lg text-sm text-cyan-200/80 font-bold uppercase tracking-wider">
                <span className="text-cyan-400 text-xs">Level: {difficulty}</span>
                <span>Unlocked: {solvedCount} / {GAME_ROUNDS_COUNT}</span>
              </div>

              {/* 3D Vault Door Container */}
              <div
                className={cn(
                  "w-full relative rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 transition-all duration-300",
                  isFullscreen ? "aspect-[16/9]" : "aspect-[5/3]"
                )}
                style={{ perspective: '1200px' }}
              >
                {/* Vault Core (Underneath the doors) */}
                <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center z-0">
                  <span className={cn("font-black uppercase text-cyan-400 tracking-[0.2em] transition-all", isFullscreen ? "text-lg mb-6" : "text-xs mb-3")}>
                    ACCESS GRANTED
                  </span>
                  <h2 className={cn("font-black tracking-tight text-white transition-all select-text", isFullscreen ? "text-8xl" : "text-6xl")} style={{ textShadow: '0 0 25px rgba(0, 229, 255, 0.8)' }}>
                    {currentAnswer}
                  </h2>
                </div>

                {/* Left Door */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden bg-slate-900 border-r border-cyan-500/50 z-10"
                  style={{ originX: 0 }}
                  animate={{ rotateY: isOpen ? -105 : 0 }}
                  transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1] }}
                >
                  <div className="absolute left-0 top-0 w-[200%] h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-950 shadow-inner">
                    <span className={cn("font-bold text-cyan-200/50 uppercase tracking-widest transition-all", isFullscreen ? "text-base mb-6" : "text-xs mb-3")}>
                      DECRYPT THE EQUATION
                    </span>
                    <h1 className={cn("font-black text-cyan-100 transition-all", isFullscreen ? "text-7xl" : "text-4xl")} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                      {currentQuestion}
                    </h1>
                  </div>
                  {/* Handle locking rivets */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                    <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                    <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                  </div>
                </motion.div>

                {/* Right Door */}
                <motion.div
                  className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden bg-slate-900 border-l border-cyan-500/50 z-10"
                  style={{ originX: 1 }}
                  animate={{ rotateY: isOpen ? 105 : 0 }}
                  transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1] }}
                >
                  <div className="absolute right-0 top-0 w-[200%] h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-950 shadow-inner">
                    <span className={cn("font-bold text-cyan-200/50 uppercase tracking-widest transition-all", isFullscreen ? "text-base mb-6" : "text-xs mb-3")}>
                      DECRYPT THE EQUATION
                    </span>
                    <h1 className={cn("font-black text-cyan-100 transition-all", isFullscreen ? "text-7xl" : "text-4xl")} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                      {currentQuestion}
                    </h1>
                  </div>
                  {/* Handle locking rivets */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                    <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                    <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                  </div>
                </motion.div>
              </div>

              {/* Action Area */}
              <div className="h-16 flex items-center justify-center w-full">
                {!isOpen ? (
                  <Button
                    onClick={openVault}
                    disabled={isAnimating}
                    size="lg"
                    className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-extrabold px-12 py-7 rounded-xl text-xl border border-cyan-300/30 shadow-lg shadow-cyan-500/20 uppercase tracking-wider hover:scale-105 transition-all duration-300"
                  >
                    UNLOCK ANSWER
                  </Button>
                ) : (
                  <Button
                    onClick={nextProblem}
                    disabled={isAnimating}
                    size="lg"
                    className="bg-purple-600 text-white hover:bg-purple-500 font-extrabold px-12 py-7 rounded-xl text-xl border border-purple-400/30 shadow-lg shadow-purple-500/20 uppercase tracking-wider hover:scale-105 transition-all duration-300"
                  >
                    <span>{solvedCount + 1 >= GAME_ROUNDS_COUNT ? "COMPLETE SYSTEM" : "NEXT BARRIER ➡️"}</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-xl mx-auto py-6">
              <Trophy className="w-32 h-32 text-cyan-400 drop-shadow-[0_0_20px_rgba(0,229,255,0.6)] animate-bounce" />
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white">VAULT SYSTEM DECRYPTED</h2>
                <p className="text-slate-300 font-medium text-lg">Completed: <span className="text-cyan-400 text-3xl font-black">{solvedCount * 100} pts</span></p>
              </div>

              {/* Daily Bonus Claimed Banner */}
              {isDailyBonus && (
                <div className="relative w-full bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-cyan-500/10 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-2 z-10">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 left-6 text-sm animate-bounce" style={{ animationDelay: '100ms' }}>💎</div>
                    <div className="absolute bottom-4 right-12 text-sm animate-bounce" style={{ animationDelay: '300ms' }}>⭐</div>
                    <div className="absolute top-6 right-8 text-sm animate-bounce" style={{ animationDelay: '500ms' }}>💎</div>
                    <div className="absolute bottom-2 left-10 text-sm animate-bounce" style={{ animationDelay: '700ms' }}>⭐</div>
                  </div>
                  <div className="vault-glow-coin bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 relative">
                    <Coins className="h-10 w-10 fill-cyan-950 text-cyan-950 animate-spin" style={{ animationDuration: '5s' }} />
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-900 shadow">
                      CLAIMED
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-cyan-400 tracking-wide uppercase">Daily Bonus Claimed!</h3>
                  <p className="text-sm font-semibold text-slate-400 text-center max-w-xs leading-relaxed">
                    You decrypted the Daily Vault and earned <span className="text-cyan-400 font-black">+{dailyBonusAmount} Lingo-Coins</span> for your pet!
                  </p>
                </div>
              )}

              <div className="flex gap-4 z-10 relative">
                <Button onClick={() => startGame(difficulty)} size="lg" className="rounded-full px-8 font-bold bg-cyan-600 text-white hover:scale-105 transition-transform shadow-lg shadow-cyan-500/25 border border-cyan-500/30">
                  <RotateCcw className="mr-2 w-5 h-5" /> RE-DECRYPT
                </Button>
                <Button variant="outline" onClick={() => setGameState('difficulty_selection')} size="lg" className="rounded-full px-8 font-bold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                  <RotateCcw className="mr-2 w-5 h-5" /> RE-CONFIGURE
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-950/90 p-6 flex justify-between items-center border-t border-cyan-500/10">
          <div className="flex gap-2">
            <Button variant="ghost" asChild className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
              <Link href="/games">EXIT TO MENU</Link>
            </Button>
            {gameState === 'playing' && (
              <Button variant="secondary" onClick={() => startGame(difficulty)} className="font-bold border border-cyan-500/10 text-cyan-400 hover:bg-cyan-500/10">
                <RotateCcw className="mr-2 w-4 h-4" /> RESTART BARRIER
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={clearMemory} 
              size="sm" 
              className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Purge Cache
            </Button>
          </div>

          {gameState === 'playing' && (
            <div className="flex items-center gap-4 text-xs font-black text-cyan-400/70 uppercase tracking-widest">
              <span>UNLOCKED {solvedCount} / {GAME_ROUNDS_COUNT}</span>
              <div className="w-32 h-3 bg-cyan-950/50 rounded-full overflow-hidden border border-cyan-500/10">
                <motion.div 
                  className="h-full bg-cyan-500 shadow-[0_0_10px_#00e5ff]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(solvedCount / GAME_ROUNDS_COUNT) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
