'use client';

import { shuffleArray } from "@/lib/shuffle";
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
import { 
  Loader2, 
  Trophy, 
  Timer, 
  CheckCircle2,
  XCircle,
  Microscope,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  Coins,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { SkillLevel } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';

type GameState = 'idle' | 'loading' | 'playing' | 'finished' | 'instructions' | 'selecting_difficulty';

interface OrganelleNode {
  name: string;
  function: string;
  level: number;
  x: number;
  y: number;
  z: number;
  id: string;
}

// Reclassified CELL_DATA: Beginner has exactly 5 core components (Nucleus, Mitochondria, Membrane, Cytoplasm, Cytosol)
const CELL_DATA = [
  { name: "Nucleus", function: "The brain of the cell. It contains DNA and coordinates cell activities.", level: 1 },
  { name: "Mitochondria", function: "The powerhouse of the cell. It generates energy (ATP) through respiration.", level: 1 },
  { name: "Cell Membrane", function: "The security guard. It controls what enters and exits the cell.", level: 1 },
  { name: "Cytoplasm", function: "The jelly-like fluid that fills the cell and holds organelles.", level: 1 },
  { name: "Cytosol", function: "The liquid part of the cytoplasm, excluding the organelles.", level: 1 },
  { name: "Vacuole", function: "The storage tank. It stores water, nutrients, or waste products.", level: 2 },
  { name: "Cell Wall", function: "Found in plant cells. It provides structure and protection.", level: 2 },
  { name: "Ribosomes", function: "The protein factories. They synthesize proteins for the cell.", level: 2 },
  { name: "Endoplasmic Reticulum", function: "The transport network. It processes and moves proteins and lipids.", level: 2 },
  { name: "Golgi Apparatus", function: "The post office. It packages and distributes proteins.", level: 2 },
  { name: "Chloroplast", function: "Found in plant cells. It converts sunlight into food (photosynthesis).", level: 2 },
  { name: "Nucleolus", function: "A small dense spherical structure inside the nucleus where ribosomes are made.", level: 2 },
  { name: "Cytoskeleton", function: "A network of protein fibers that helps the cell keep its shape and move.", level: 2 },
  { name: "Vesicle", function: "A small membrane-bound sac that transports materials within or outside the cell.", level: 2 },
  { name: "Plastid", function: "Double-membrane organelles in plant cells that store food or pigments.", level: 2 },
  { name: "Nuclear Envelope", function: "The double membrane that encloses the cell nucleus.", level: 2 },
  { name: "Chromatin", function: "The material that makes up chromosomes, consisting of DNA and proteins.", level: 2 },
  { name: "Amyoplast", function: "Non-pigmented plastids in plant cells that synthesize and store starch.", level: 2 },
  { name: "Nucleoplasm", function: "The fluid inside the nucleus, supporting chromatin and nucleolus.", level: 2 },
  { name: "Lysosomes", function: "The recycling center. They break down waste and cellular debris.", level: 3 },
  { name: "Centrioles", function: "Organelles that help with cell division in animal cells.", level: 3 },
  { name: "Microtubules", function: "Thick, hollow protein tubes that maintain shape and help cell division.", level: 3 },
  { name: "Cilia", function: "Hair-like structures on the cell surface that clear fluids or help movement.", level: 3 },
  { name: "Flagella", function: "Long, whip-like tails that help single-celled organisms move or swim.", level: 3 },
  { name: "Plasmodesmata", function: "Microscopic channels through plant cell walls that allow transport.", level: 3 },
  { name: "Peroxisome", function: "Organelles that break down fatty acids and protect the cell from toxins.", level: 3 },
  { name: "Microfilaments", function: "Thin, solid protein fibers that help with cell shape and division.", level: 3 },
  { name: "Tonoplast", function: "The semi-permeable membrane that surrounds the vacuole in plant cells.", level: 3 },
  { name: "Desmosome", function: "Intercellular junctions that hold adjacent animal cells tightly together.", level: 3 },
  { name: "Tight Junctions", function: "Membranes of neighboring animal cells pressed together to prevent leakage.", level: 3 },
];

const GAME_TIMER_LIMIT = 120;

export function CellularExplorer3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [nodes, setNodes] = React.useState<OrganelleNode[]>([]);
  const [targetIndex, setTargetIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(GAME_TIMER_LIMIT);
  const [difficulty, setDifficulty] = React.useState<SkillLevel | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'correct' | 'wrong', text: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [particles, setParticles] = React.useState<any[]>([]);
  const [triggerShake, setTriggerShake] = React.useState(false);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 100, damping: 30 });
  const springY = useSpring(rotY, { stiffness: 100, damping: 30 });
  const rotateXValue = useTransform(springX, (val) => -val);
  const rotateYValue = useTransform(springY, (val) => val);
  const invRotateX = useTransform(rotateXValue, (val) => -val);
  const invRotateY = useTransform(rotateYValue, (val) => val);

  const dragStartPos = React.useRef({ x: 0, y: 0 });
  const hasMovedSignificantly = React.useRef(false);
  const lastMousePos = React.useRef({ x: 0, y: 0 });

  const startNewGame = (level: SkillLevel) => {
    setGameState('loading');
    setDifficulty(level);
    setScore(0);
    setTimeLeft(GAME_TIMER_LIMIT);
    setFeedback(null);
    setParticles([]);
    rotX.set(0);
    rotY.set(0);

    const levelThreshold = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;
    const filteredData = CELL_DATA.filter(item => item.level <= levelThreshold);
    const shuffled = shuffleArray([...filteredData]);
    
    // Pick dynamic random subset
    const count = level === 'beginner' ? 4 : level === 'intermediate' ? 6 : 8;
    const subset = shuffled.slice(0, count);
    
    const newNodes: OrganelleNode[] = subset.map((item, i) => {
      const phi = Math.acos(-1 + (2 * i) / (subset.length - 1));
      const theta = Math.sqrt(subset.length * Math.PI) * phi;
      const radius = 240;
      return {
        ...item,
        id: `organelle-${i}-${Math.random()}`,
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
      };
    });

    setNodes(newNodes);
    setTargetIndex(0);
    setGameState('playing');
  };

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
    if (dist > 15) hasMovedSignificantly.current = true;
    const sensitivity = 0.4;
    rotY.set(rotY.get() + deltaX * sensitivity);
    rotX.set(rotX.get() + deltaY * sensitivity);
    lastMousePos.current = { x: clientX, y: clientY };
  }, [isDragging, gameState, rotX, rotY]);

  const handleEndDrag = () => setIsDragging(false);

  const manualRotate = (dir: 'up' | 'down' | 'left' | 'right') => {
    const step = 45;
    if (dir === 'up') rotX.set(rotX.get() - step);
    if (dir === 'down') rotX.set(rotX.get() + step);
    if (dir === 'left') rotY.set(rotY.get() - step);
    if (dir === 'right') rotY.set(rotY.get() + step);
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => { if (isDragging) handleDrag(e.clientX, e.clientY); };
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleEndDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
    };
  }, [isDragging, handleDrag]);

  const handleNodeClick = (node: OrganelleNode) => {
    if (hasMovedSignificantly.current || gameState !== 'playing' || feedback) return;
    if (node.name === nodes[targetIndex].name) {
      const newScore = score + 100;
      setScore(newScore);
      setFeedback({ type: 'correct', text: 'IDENTIFIED!' });
      
      // Generate particles
      const emojisPool = ['🔬', '🧬', '🌿', '🌟', '🪙', '✨', '🧫', '🧪'];
      const colorsPool = ['#10b981', '#34d399', '#3b82f6', '#60a5fa', '#f59e0b', '#fbbf24'];
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

      const next = targetIndex + 1;
      if (next < nodes.length) {
        setTargetIndex(next);
      } else {
        setGameState('finished');
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game?.slug || 'cellular-explorer-3d', score: newScore, difficulty }
        });
        toast({
          title: "Research Complete! 🏆🔬",
          description: "You've successfully scanned and identified all organelles! Coins and pet XP awarded.",
        });
      }
      setTimeout(() => setFeedback(null), 600);
    } else {
      setScore(s => Math.max(0, s - 50));
      setFeedback({ type: 'wrong', text: 'INCORRECT ORGANELLE!' });
      setTriggerShake(true);
      setTimeout(() => setTriggerShake(false), 500);
      setTimeout(() => setFeedback(null), 600);
    }
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: { slug: game?.slug || 'cellular-explorer-3d', score, difficulty }
      });
      toast({
        title: "Time is Up! ⏰",
        description: "Your session time expired. Coins and pet stats updated.",
      });
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, firestore, user, game, score, difficulty, toast]);

  if (!game) return null;

  return (
    <div className={cn(
      "w-full relative min-h-[40rem] flex flex-col justify-center items-center",
      isFullscreen ? "min-h-screen bg-slate-950 p-4 sm:p-8" : "py-4"
    )}>
      <style>{`
        @keyframes science-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes science-particle-fly {
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
        @keyframes science-glow-coin {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)); }
        }
        .science-animate-shake {
          animation: science-shake 0.5s ease-in-out;
        }
        .science-glow-coin {
          animation: science-glow-coin 2s infinite ease-in-out;
        }
        .science-particle {
          position: absolute;
          animation: science-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>

      <Card 
        className={cn(
          "w-full overflow-hidden bg-[#020617] border-emerald-500/20 shadow-2xl relative text-white transition-all duration-500 z-10",
          isFullscreen ? "h-screen rounded-none border-none" : "max-w-4xl mx-auto rounded-xl border",
          triggerShake && "science-animate-shake"
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0),
            radial-gradient(at 20% 30%, hsla(160, 84%, 39%, 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 70%, hsla(210, 100%, 50%, 0.1) 0px, transparent 50%)
          `,
          backgroundSize: '40px 40px, 100% 100%, 100% 100%'
        }}
      >
        <CardHeader className="text-center bg-black/20 backdrop-blur-sm border-b border-emerald-500/10 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-emerald-400/70 hover:text-emerald-400 z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
          <div className="flex justify-center mb-2">
            <Microscope className="w-12 h-12 text-emerald-400" />
          </div>
          <CardTitle className="text-3xl font-black italic uppercase tracking-wider">CELLULAR EXPLORER 3D</CardTitle>
          <CardDescription className="text-emerald-200/70">Navigate the biological void to identify organelles.</CardDescription>
          {difficulty && (
            <div className="flex justify-center pt-2">
              <Badge variant="outline" className="border-emerald-500 text-emerald-400">{difficulty.toUpperCase()}</Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className={cn(
          "flex flex-col items-center justify-center relative p-0 overflow-hidden select-none touch-none",
          isFullscreen ? "min-h-[calc(100vh-200px)]" : "min-h-[600px]"
        )}>
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
                <div className={cn("p-10 rounded-3xl shadow-2xl border-8 backdrop-blur-md flex flex-col items-center gap-4", feedback.type === 'correct' ? "bg-emerald-600/90 border-emerald-400" : "bg-red-600/90 border-red-400")}>
                  {feedback.type === 'correct' ? <CheckCircle2 className="w-20 h-20" /> : <XCircle className="w-20 h-20" />}
                  <span className="text-4xl font-black uppercase tracking-tighter">{feedback.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particle System */}
          {particles.map((p) => (
            <span
              key={p.id}
              className="science-particle"
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
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
              {isDailyBonus && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-amber-500/20 animate-pulse mb-2">
                  <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                  ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
                </Badge>
              )}
              <Button onClick={() => setGameState('instructions')} size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">INITIALIZE SCANNER</Button>
            </div>
          )}

          {gameState === 'instructions' && (
            <div className="max-w-md space-y-6 text-center px-6">
              <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border-2 border-emerald-500/30">
                <h3 className="text-xl font-bold mb-4 uppercase text-emerald-400">LAB PROTOCOL</h3>
                <ul className="text-left space-y-3 text-sm text-emerald-50/90">
                  <li>1. Read the <strong>Organelle Function</strong> at the top.</li>
                  <li>2. Drag to rotate the 3D cell structure.</li>
                  <li>3. Click the correct organelle to identify it.</li>
                </ul>
              </div>
              <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="w-full bg-emerald-500 font-black hover:bg-emerald-400">CONTINUE TO SELECTION</Button>
            </div>
          )}

          {gameState === 'selecting_difficulty' && (
            <div className="max-w-md w-full space-y-6 text-center px-6">
              <h3 className="text-2xl font-black uppercase text-emerald-400">SELECT RESEARCH LEVEL</h3>
              <div className="grid gap-4">
                <Button onClick={() => startNewGame('beginner')} variant="outline" className="h-16 text-xl font-bold border-emerald-500/50 hover:bg-emerald-500/20">BEGINNER (Core Components)</Button>
                <Button onClick={() => startNewGame('intermediate')} variant="outline" className="h-16 text-xl font-bold border-emerald-500/50 hover:bg-emerald-500/20">INTERMEDIATE (Standard Cell)</Button>
                <Button onClick={() => startNewGame('advanced')} variant="outline" className="h-16 text-xl font-bold border-emerald-500/50 hover:bg-emerald-500/20">ADVANCED (Specialized Organelles)</Button>
              </div>
            </div>
          )}

          {gameState === 'playing' && nodes[targetIndex] && (
            <div className="w-full h-full flex flex-col items-center p-4">
              <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4 bg-black/60 p-3 rounded-2xl border border-emerald-500/20 shadow-lg relative z-[60] backdrop-blur-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">RESEARCH SCORE</span>
                  <span className="text-3xl font-black text-white">{score}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">TIME REMAINING</span>
                  <div className="flex items-center gap-2">
                    <Timer className={cn("w-6 h-6", timeLeft < 10 ? "text-red-500 animate-bounce" : "text-emerald-400")} />
                    <span className={cn("text-3xl font-black", timeLeft < 10 ? "text-red-500" : "text-white")}>{timeLeft}s</span>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-2xl border-4 p-6 rounded-3xl text-center mb-8 shadow-2xl bg-emerald-900/20 border-emerald-500/40 backdrop-blur-md relative z-[60]">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-2 block">IDENTIFY THIS ORGANELLE</span>
                <p className="text-xl font-bold italic leading-tight text-white">"{nodes[targetIndex].function}"</p>
              </div>

              <div 
                onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
                className={cn("relative w-full aspect-square max-w-[450px] select-none touch-none", isDragging ? "cursor-grabbing" : "cursor-grab")}
                style={{ perspective: '1200px' }}
              >
                <motion.div className="w-full h-full relative flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d', rotateX: rotateXValue, rotateY: rotateYValue }}>
                  {nodes.map((node, i) => {
                    const isCompleted = i < targetIndex;
                    return (
                      <motion.button
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        className={cn(
                          "absolute p-4 rounded-xl text-lg font-black transition-all duration-500 border-4 whitespace-nowrap shadow-2xl pointer-events-auto",
                          isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500/20 scale-75 pointer-events-none" : "bg-white text-emerald-950 border-emerald-500 hover:bg-emerald-500 hover:text-white"
                        )}
                        style={{ x: node.x, y: node.y, z: node.z, rotateX: invRotateX, rotateY: invRotateY, transformStyle: 'preserve-3d', zIndex: Math.round(node.z + 500), scale: (node.z + 600) / 600, opacity: (node.z + 400) / 600 }}
                      >
                        {node.name.toUpperCase()}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              <div className="absolute bottom-6 left-6 flex flex-col items-center gap-2 bg-black/60 p-4 rounded-3xl backdrop-blur-md border border-emerald-500/20 z-[70] shadow-2xl">
                <Button variant="outline" size="icon" onClick={() => manualRotate('up')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-emerald-500 border-white/20"><ArrowUp className="w-4 h-4"/></Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => manualRotate('left')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-emerald-500 border-white/20"><ArrowLeft className="w-4 h-4"/></Button>
                  <Button variant="outline" size="icon" onClick={() => manualRotate('down')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-emerald-500 border-white/20"><ArrowDown className="w-4 h-4"/></Button>
                  <Button variant="outline" size="icon" onClick={() => manualRotate('right')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-emerald-500 border-white/20"><ArrowRight className="w-4 h-4"/></Button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="flex flex-col items-center gap-8 px-6 text-center w-full max-w-xl mx-auto py-6 animate-in fade-in duration-500">
              <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
              <h2 className="text-4xl font-black uppercase text-white">RESEARCH COMPLETE</h2>
              <p className="text-xl text-emerald-100">Final Accuracy: <span className="text-emerald-400 text-3xl font-black">{score} pts</span></p>

              {/* Daily Bonus Claimed Banner */}
              {isDailyBonus && (
                <div className="relative w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-2 z-10">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 left-6 text-sm animate-bounce" style={{ animationDelay: '100ms' }}>🪙</div>
                    <div className="absolute bottom-4 right-12 text-sm animate-bounce" style={{ animationDelay: '300ms' }}>⭐</div>
                    <div className="absolute top-6 right-8 text-sm animate-bounce" style={{ animationDelay: '500ms' }}>🪙</div>
                    <div className="absolute bottom-2 left-10 text-sm animate-bounce" style={{ animationDelay: '700ms' }}>⭐</div>
                  </div>
                  <div className="science-glow-coin bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
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
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold">NEW MISSION</Button>
                <Button variant="outline" onClick={() => setGameState('idle')} size="lg" className="rounded-full border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">RE-INITIALIZE</Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-black/40 p-6 flex justify-between border-t border-emerald-500/20">
          <Button variant="ghost" asChild className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"><Link href="/games">EXIT LAB</Link></Button>
          {gameState === 'playing' && (
            <div className="flex items-center gap-4 text-xs font-black text-emerald-400">
              <span>ORGANELLE {targetIndex + 1} / {nodes.length}</span>
              <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden border border-emerald-500/20">
                <motion.div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" initial={{ width: 0 }} animate={{ width: `${(targetIndex / nodes.length) * 100}%` }} />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
