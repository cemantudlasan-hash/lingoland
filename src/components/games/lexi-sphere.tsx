'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
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
import { generateVocabExercise } from '@/ai/flows/generate-vocab-exercise';
import { 
  Loader2, 
  Trophy, 
  Repeat, 
  Timer, 
  RotateCcw, 
  BrainCircuit,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  History,
  Maximize,
  Minimize,
  Coins,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';

type GameState = 'idle' | 'loading' | 'playing' | 'finished' | 'instructions' | 'category_selection';

interface WordNode {
  word: string;
  definition: string;
  x: number;
  y: number;
  z: number;
  id: string;
}

const HISTORY_KEY = 'lingoland_lexi_sphere_word_history';
const SESSION_KEY = 'lingoland_lexi_sphere_session';

const CATEGORY_OPTIONS = [
  { label: "Mix Category", value: "Random" },
  { label: "Things (Objects)", value: "Common Objects and Household Items" },
  { label: "Clothes", value: "Clothing and Apparel" },
  { label: "Animals", value: "Animals and Wildlife" },
  { label: "Feelings & Emotions", value: "Feelings and Emotions" },
  { label: "Adjectives", value: "Descriptive Adjectives" },
  { label: "Verbs", value: "Action Verbs" },
  { label: "Food & Drinks", value: "Food and Beverages" },
  { label: "Places", value: "Locations and Buildings" },
  { label: "Transportation", value: "Vehicles and Transportation" },
  { label: "Technology", value: "Modern Technology" },
  { label: "Space", value: "Space and Astronomy" },
];

const GAME_TIMER_LIMIT = 120;

export function LexiSphere({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [nodes, setNodes] = React.useState<WordNode[]>([]);
  const [targetIndex, setTargetIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(GAME_TIMER_LIMIT);
  const [difficulty, setDifficulty] = React.useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [categorySelection, setCategorySelection] = React.useState<string>("Random");
  const [currentCategory, setCurrentCategory] = React.useState<string>("");
  const [usedWords, setUsedWords] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [particles, setParticles] = React.useState<any[]>([]);
  const [triggerShake, setTriggerShake] = React.useState(false);
  
  const dragStartPos = React.useRef({ x: 0, y: 0 });
  const hasMovedSignificantly = React.useRef(false);
  const lastMousePos = React.useRef({ x: 0, y: 0 });
  
  const [feedback, setFeedback] = React.useState<{ type: 'correct' | 'wrong', text: string } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
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
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setUsedWords(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(usedWords.slice(-200)));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }, [usedWords]);

  React.useEffect(() => {
    const savedSession = sessionStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setNodes(session.nodes);
        setTargetIndex(session.targetIndex);
        setScore(session.score);
        setTimeLeft(session.timeLeft);
        setDifficulty(session.difficulty);
        setCategorySelection(session.categorySelection || "Random");
        setCurrentCategory(session.currentCategory);
        setGameState(session.gameState);
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  React.useEffect(() => {
    if (gameState === 'playing' || gameState === 'loading') {
      const sessionData = {
        nodes,
        targetIndex,
        score,
        timeLeft,
        difficulty,
        categorySelection,
        currentCategory,
        gameState
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } else if (gameState === 'finished' || gameState === 'idle' || gameState === 'instructions' || gameState === 'category_selection') {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [nodes, targetIndex, score, timeLeft, difficulty, categorySelection, currentCategory, gameState]);

  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  
  const springX = useSpring(rotX, { stiffness: 100, damping: 30 });
  const springY = useSpring(rotY, { stiffness: 100, damping: 30 });
  
  const rotateXValue = useTransform(springX, (val) => -val);
  const rotateYValue = useTransform(springY, (val) => val);

  const invRotateX = useTransform(rotateXValue, (val) => -val);
  const invRotateY = useTransform(rotateYValue, (val) => val);

  const handleStartDrag = (clientX: number, clientY: number) => {
    if (gameState !== 'playing') return;
    setIsDragging(true);
    hasMovedSignificantly.current = false;
    dragStartPos.current = { x: clientX, y: clientY };
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleDrag = React.useCallback((clientX: number, clientY: number) => {
    if (!isDragging || gameState !== 'playing') return;
    
    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;
    
    const dist = Math.sqrt(Math.pow(clientX - dragStartPos.current.x, 2) + Math.pow(clientY - dragStartPos.current.y, 2));
    if (dist > 15) {
        hasMovedSignificantly.current = true;
    }

    const sensitivity = 0.4; 
    rotY.set(rotY.get() + deltaX * sensitivity);
    rotX.set(rotX.get() + deltaY * sensitivity);
    lastMousePos.current = { x: clientX, y: clientY };
  }, [isDragging, gameState, rotX, rotY]);

  const handleEndDrag = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
        if (isDragging) handleDrag(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
        if (isDragging && e.touches.length > 0) handleDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    if (isDragging) {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', handleEndDrag);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', handleEndDrag);
    }

    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', handleEndDrag);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', handleEndDrag);
    };
  }, [isDragging, handleDrag, handleEndDrag]);

  const manualRotate = (dir: 'up' | 'down' | 'left' | 'right') => {
    const step = 45;
    if (dir === 'up') rotX.set(rotX.get() - step);
    if (dir === 'down') rotX.set(rotX.get() + step);
    if (dir === 'left') rotY.set(rotY.get() - step);
    if (dir === 'right') rotY.set(rotY.get() + step);
  };

  const startNewGame = async (level: typeof difficulty) => {
    setGameState('loading');
    setDifficulty(level);
    setScore(0);
    setTimeLeft(GAME_TIMER_LIMIT);
    setFeedback(null);
    setParticles([]);
    setIsDragging(false);
    rotX.set(0);
    rotY.set(0);
    
    let activeCategory = categorySelection;
    if (activeCategory === "Random") {
        const otherCats = CATEGORY_OPTIONS.filter(c => c.value !== "Random");
        activeCategory = otherCats[Math.floor(Math.random() * otherCats.length)].value;
    }
    setCurrentCategory(activeCategory);

    try {
      const nodeCount = level === 'beginner' ? 6 : level === 'intermediate' ? 9 : 12;
      const result = await generateVocabExercise({
        difficulty: level,
        count: nodeCount,
        usedWords: usedWords,
        category: activeCategory
      });

      const pairs = result.pairs;
      setUsedWords(prev => [...prev, ...pairs.map(p => p.word)]);

      const newNodes: WordNode[] = pairs.map((pair, i) => {
        const phi = Math.acos(-1 + (2 * i) / (pairs.length - 1));
        const theta = Math.sqrt(pairs.length * Math.PI) * phi;
        const radius = 240;

        return {
          ...pair,
          id: `${pair.word}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          x: radius * Math.cos(theta) * Math.sin(phi),
          y: radius * Math.sin(theta) * Math.sin(phi),
          z: radius * Math.cos(phi),
        };
      });

      setNodes(newNodes);
      setTargetIndex(0);
      setGameState('playing');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate Lexi-Sphere.' });
      setGameState('idle');
    }
  };

  const handleWordClick = (node: WordNode) => {
    if (hasMovedSignificantly.current) return;
    if (gameState !== 'playing' || feedback) return;

    const cleanStr = (s: string) => s.replace(/[^a-zA-Z0-9]/gi, '').toLowerCase();
    const clickedWord = cleanStr(node.word);
    const currentTarget = nodes[targetIndex];
    if (!currentTarget) return;
    const targetWord = cleanStr(currentTarget.word);

    if (clickedWord === targetWord) {
      const newScore = score + 100;
      setScore(newScore);
      setFeedback({ type: 'correct', text: 'CORRECT!' });
      
      // Generate particles
      const emojisPool = ['📚', '✏️', '📖', '🌟', '🪙', '✨', '🧠', '🎓'];
      const colorsPool = ['#a855f7', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];
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
      
      const nextIndex = targetIndex + 1;
      if (nextIndex < nodes.length) {
        setTargetIndex(nextIndex);
      } else {
        setGameState('finished');
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game?.slug || 'lexi-sphere', score: newScore, difficulty }
        });
        toast({
          title: "Mission Completed! 🏆📚",
          description: "You've successfully solved all vocabulary nodes! Coins and pet XP awarded.",
        });
      }
      
      setTimeout(() => setFeedback(null), 600);
    } else {
      setScore(s => Math.max(0, s - 50));
      setFeedback({ type: 'wrong', text: 'WRONG WORD!' });
      setTriggerShake(true);
      setTimeout(() => setTriggerShake(false), 500);
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const clearHistory = () => {
    setUsedWords([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({ title: "History Cleared", description: "All encountered words have been forgotten." });
  };

  const handleAbort = () => {
    setGameState('category_selection');
    sessionStorage.removeItem(SESSION_KEY);
    toast({ title: "Mission Aborted", description: "Returning to mission setup." });
  }

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: { slug: game?.slug || 'lexi-sphere', score, difficulty }
      });
      toast({
        title: "Time is Up! ⏰",
        description: "Your session time expired. Coins and pet stats updated.",
      });
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, firestore, user, game, score, difficulty, toast]);

  if (!game) return null;
  const Icon = game.icon;

  return (
    <div className={cn(
      "w-full relative min-h-[40rem] flex flex-col justify-center items-center",
      isFullscreen ? "min-h-screen bg-slate-950 p-4 sm:p-8" : "py-4"
    )}>
      <style>{`
        @keyframes english-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes english-particle-fly {
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
        @keyframes english-glow-coin {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)); }
        }
        .english-animate-shake {
          animation: english-shake 0.5s ease-in-out;
        }
        .english-glow-coin {
          animation: english-glow-coin 2s infinite ease-in-out;
        }
        .english-particle {
          position: absolute;
          animation: english-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>

      <Card className={cn(
        "w-full overflow-hidden bg-card/90 backdrop-blur-md border-border/20 shadow-2xl relative transition-all duration-500 z-10",
        isFullscreen ? "h-screen rounded-none border-none" : "max-w-4xl mx-auto rounded-xl border",
        triggerShake && "english-animate-shake"
      )}>
        <CardHeader className="text-center pb-2 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/20 rounded-full">
              <Icon className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter italic uppercase text-white">3D LEXI-SPHERE</CardTitle>
          <CardDescription className="text-gray-300 font-medium">Grab and spin to find the matching word.</CardDescription>
        </CardHeader>

        <CardContent className={cn(
          "flex flex-col items-center justify-center relative p-0 overflow-hidden select-none touch-none",
          isFullscreen ? "min-h-[calc(100vh-200px)]" : "min-h-[600px]"
        )}>
          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -50 }}
                className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none"
              >
                <div className={cn(
                  "p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border-8 backdrop-blur-md",
                  feedback.type === 'correct' ? "bg-green-600/90 border-green-400" : "bg-red-600/90 border-red-400"
                )}>
                  {feedback.type === 'correct' ? <CheckCircle2 className="w-20 h-20 text-white" /> : <XCircle className="w-20 h-20 text-white" />}
                  <span className="text-5xl font-black text-white tracking-tighter uppercase">{feedback.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particle System */}
          {particles.map((p) => (
            <span
              key={p.id}
              className="english-particle"
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
            <div className="flex flex-col items-center gap-6">
              {isDailyBonus && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-amber-500/20 animate-pulse mb-2">
                  <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                  ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
                </Badge>
              )}
              <BrainCircuit className="w-20 h-20 text-primary/30" />
              <Button onClick={() => setGameState('instructions')} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-transform font-bold text-white shadow-xl shadow-indigo-500/20">
                INITIALIZE INTERFACE
              </Button>
            </div>
          )}

          {gameState === 'instructions' && (
            <div className="max-w-md space-y-6 text-center animate-in fade-in zoom-in duration-300 px-6">
              <div className="bg-muted/50 p-6 rounded-2xl border-2 border-primary/20 backdrop-blur-sm shadow-inner">
                <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-widest">MISSION PROTOCOL</h3>
                <ul className="text-left space-y-3 text-sm font-medium text-gray-200">
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/40 flex items-center justify-center text-xs text-white shrink-0">1</span>
                    <span>Match the definition at the top to a floating word.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/40 flex items-center justify-center text-xs text-white shrink-0">2</span>
                    <span><strong>Drag anywhere</strong> to rotate the sphere.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/40 flex items-center justify-center text-xs text-white shrink-0">3</span>
                    <span>Find all words before the 2-minute timer hits zero!</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => setGameState('category_selection')} size="lg" className="w-full bg-primary hover:bg-primary/90 font-black tracking-widest">
                NEXT PHASE
              </Button>
            </div>
          )}

          {gameState === 'category_selection' && (
            <div className="w-full max-w-2xl flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 px-6">
              <div className="text-center space-y-1">
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Select Mission Category</h3>
                  <p className="text-muted-foreground text-sm">Which sector of vocabulary will you navigate?</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  {CATEGORY_OPTIONS.map((cat) => (
                      <Button
                          key={cat.value}
                          variant={categorySelection === cat.value ? "default" : "outline"}
                          onClick={() => setCategorySelection(cat.value)}
                          className={cn(
                              "h-auto py-4 text-xs font-bold uppercase transition-all duration-200 border-2",
                              categorySelection === cat.value ? "bg-primary border-primary scale-105 shadow-lg shadow-primary/20" : "border-white/10 hover:border-primary/50"
                          )}
                      >
                          {cat.label}
                      </Button>
                  ))}
              </div>
              
              <div className="w-full h-px bg-white/10 my-2" />

              <div className="text-center space-y-4 w-full">
                  <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Choose Difficulty</p>
                  <div className="grid grid-cols-3 gap-3">
                      <Button onClick={() => startNewGame('beginner')} variant="outline" className="font-bold border-green-500/50 text-white hover:bg-green-500/20">BEGINNER</Button>
                      <Button onClick={() => startNewGame('intermediate')} variant="outline" className="font-bold border-yellow-500/50 text-white hover:bg-yellow-500/20">NORMAL</Button>
                      <Button onClick={() => startNewGame('advanced')} variant="outline" className="font-bold border-red-500/50 text-white hover:bg-red-500/20">EXPERT</Button>
                  </div>
              </div>
            </div>
          )}

          {gameState === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p className="font-mono text-xs uppercase tracking-widest animate-pulse text-white">Generating Neural Net...</p>
            </div>
          )}

          {gameState === 'playing' && nodes[targetIndex] && (
            <div className="w-full h-full flex flex-col items-center p-4">
              <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4 bg-black/40 p-3 rounded-2xl border border-white/10 shadow-lg relative z-[60]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">Target: {currentCategory}</span>
                  <span className="text-3xl font-black text-white">{score}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">Remaining</span>
                  <div className="flex items-center gap-2">
                    <Timer className={cn("w-6 h-6", timeLeft < 10 ? "text-red-500 animate-bounce" : "text-primary")} />
                    <span className={cn("text-3xl font-black text-white", timeLeft < 10 && "text-red-500")}>{timeLeft}s</span>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-2xl border-4 p-6 rounded-3xl text-center mb-8 shadow-2xl bg-white/5 border-primary/40 backdrop-blur-sm relative z-[60]">
                <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-2 block">Definition Mission</span>
                <p className="text-xl md:text-2xl font-bold italic text-white leading-tight">
                  "{nodes[targetIndex].definition}"
                </p>
              </div>

              <div 
                ref={containerRef}
                onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
                onTouchStart={(e) => handleStartDrag(e.touches[0].clientX, e.touches[0].clientY)}
                className={cn(
                  "relative w-full aspect-square max-w-[450px] select-none touch-none bg-transparent",
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{ perspective: '1200px' }}
              >
                <motion.div 
                  className="w-full h-full relative flex items-center justify-center pointer-events-none"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    rotateX: rotateXValue,
                    rotateY: rotateYValue
                  }}
                >
                  {nodes.map((node, i) => {
                    const isCompleted = i < targetIndex;
                    
                    return (
                      <motion.button
                        key={node.id}
                        onClick={() => handleWordClick(node)}
                        className={cn(
                          "absolute p-4 rounded-xl text-lg font-black transition-all duration-500 border-4 whitespace-nowrap shadow-2xl pointer-events-auto",
                          isCompleted ? "bg-green-500/20 border-green-500/40 text-green-500/40 scale-75 pointer-events-none" : 
                          "bg-white text-black border-primary/50 hover:border-primary hover:bg-primary hover:text-white"
                        )}
                        style={{
                          x: node.x,
                          y: node.y,
                          z: node.z,
                          rotateX: invRotateX,
                          rotateY: invRotateY,
                          transformStyle: 'preserve-3d',
                          zIndex: Math.round(node.z + 500),
                          scale: (node.z + 600) / 600,
                          opacity: (node.z + 400) / 600,
                        }}
                        whileHover={!isCompleted ? { scale: 1.1 } : {}}
                        whileTap={!isCompleted ? { scale: 0.95 } : {}}
                      >
                        {node.word.toUpperCase()}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              <div className="absolute bottom-6 left-6 flex flex-col items-center gap-2 bg-black/60 p-4 rounded-3xl backdrop-blur-md border border-white/20 z-[70] shadow-2xl">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 text-center">Rotate</p>
                <Button variant="outline" size="icon" onClick={() => manualRotate('up')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-primary border-white/20"><ArrowUp/></Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => manualRotate('left')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-primary border-white/20"><ArrowLeft/></Button>
                  <Button variant="outline" size="icon" onClick={() => manualRotate('down')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-primary border-white/20"><ArrowDown/></Button>
                  <Button variant="outline" size="icon" onClick={() => manualRotate('right')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-primary border-white/20"><ArrowRight/></Button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-xl mx-auto py-6">
              <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce" />
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white">MISSION CLEARED</h2>
                <p className="text-gray-300 font-medium text-lg">Mission Stats: <span className="text-primary text-3xl font-black">{score} pts</span></p>
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
                  <div className="english-glow-coin bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
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

              <div className="flex gap-4 z-10 relative">
                <Button onClick={() => startNewGame(difficulty)} size="lg" className="rounded-full px-8 font-bold bg-primary text-white hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                  <Repeat className="mr-2 w-5 h-5" /> NEW MISSION
                </Button>
                <Button variant="outline" onClick={() => setGameState('category_selection')} size="lg" className="rounded-full px-8 font-bold border-white/20 text-white hover:bg-white/10">
                  <RotateCcw className="mr-2 w-5 h-5" /> RE-CONFIGURE
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-black/40 p-6 flex justify-between items-center border-t border-white/10">
          <div className="flex gap-2">
              {(gameState === 'playing' || gameState === 'loading' || gameState === 'category_selection') && (
                <Button variant="ghost" onClick={handleAbort} className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Repeat className="mr-2 w-4 h-4 rotate-180" /> ABORT
                </Button>
              )}
              <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
                <Link href="/games">EXIT TO MENU</Link>
              </Button>
              {gameState === 'playing' && (
                <Button variant="secondary" onClick={() => startNewGame(difficulty)} className="font-bold">
                  <RotateCcw className="mr-2 w-4 h-4" /> NEW MISSION
                </Button>
              )}
              <Button variant="ghost" onClick={clearHistory} className="text-gray-400 hover:text-white">
                  <History className="mr-2 w-4 h-4" /> Clear Cache
              </Button>
          </div>
          {gameState === 'playing' && (
            <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest">
              <span>NODE {targetIndex + 1} / {nodes.length}</span>
              <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_10px_#8b5cf6]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(targetIndex / nodes.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
