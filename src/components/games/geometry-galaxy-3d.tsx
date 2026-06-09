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
  Trophy, 
  Timer, 
  CheckCircle2,
  XCircle,
  Telescope,
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

interface ShapeNode {
  name: string;
  property: string;
  level: number;
  x: number;
  y: number;
  z: number;
  id: string;
}

// Reclassified SHAPE_DATA: Beginner has exactly 9 core solids with highly simplified, child-friendly descriptions
const SHAPE_DATA = [
  { name: "Cube", property: "A 3D box with 6 equal square faces (like a dice).", level: 1 },
  { name: "Sphere", property: "A perfectly round 3D ball (like a marble or planet).", level: 1 },
  { name: "Cone", property: "A shape with a flat circular base that tapers to a point (like an ice cream cone).", level: 1 },
  { name: "Cylinder", property: "A tube shape with two flat circular ends (like a soda can).", level: 1 },
  { name: "Rectangular Prism", property: "A 3D box with 6 rectangular faces (like a shoe box).", level: 1 },
  { name: "Hemisphere", property: "A perfect half of a sphere (like a cereal bowl).", level: 1 },
  { name: "Capsule", property: "A cylinder shape with hemispherical caps at both ends (like a medical pill).", level: 1 },
  { name: "Cuboid", property: "A 3D solid with rectangular faces, similar to a rectangular prism.", level: 1 },
  { name: "Prism", property: "A solid with parallel and identical ends and flat rectangular sides.", level: 1 },
  { name: "Pyramid", property: "A solid object with a square base and four triangular sides that meet at a point.", level: 2 },
  { name: "Triangular Prism", property: "A prism with two parallel triangular bases.", level: 2 },
  { name: "Hexagonal Prism", property: "A prism with two parallel hexagonal bases.", level: 2 },
  { name: "Tetrahedron", property: "The simplest pyramid, having 4 triangular faces.", level: 2 },
  { name: "Triangular Pyramid", property: "A pyramid with a triangular base and 3 triangular faces.", level: 2 },
  { name: "Pentagonal Pyramid", property: "A pyramid with a pentagonal base and 5 triangular faces.", level: 2 },
  { name: "Hexagonal Pyramid", property: "A pyramid with a hexagonal base and 6 triangular faces.", level: 2 },
  { name: "Pentagonal Prism", property: "A prism with two parallel pentagonal bases and 5 rectangular sides.", level: 2 },
  { name: "Octagonal Prism", property: "A prism with two parallel octagonal bases and 8 rectangular sides.", level: 2 },
  { name: "Square Pyramid", property: "A pyramid with a square base and 4 triangular sides.", level: 2 },
  { name: "Heptagonal Prism", property: "A prism with two parallel heptagonal bases and 7 rectangular sides.", level: 2 },
  { name: "Torus", property: "A doughnut-shaped 3D solid formed by rotating a circle around an axis.", level: 3 },
  { name: "Octahedron", property: "A polyhedron with 8 faces (often equilateral triangles).", level: 3 },
  { name: "Dodecahedron", property: "A regular polyhedron with 12 pentagonal faces.", level: 3 },
  { name: "Icosahedron", property: "A regular polyhedron with 20 triangular faces.", level: 3 },
  { name: "Ellipsoid", property: "A 3D shape formed by stretching or squishing a sphere (like an egg or rugby ball).", level: 3 },
  { name: "Frustum", property: "A cone or pyramid with its top cut off parallel to the base.", level: 3 },
  { name: "Dipyramid", property: "A shape made by joining two pyramids base-to-base.", level: 3 },
  { name: "Oblique Cylinder", property: "A cylinder where the circular bases are not directly aligned over each other.", level: 3 },
  { name: "Decahedron", property: "A polyhedron with exactly 10 faces.", level: 3 },
  { name: "Prismatoid", property: "A polyhedron whose vertices lie in two parallel planes.", level: 3 },
];

const GAME_TIMER_LIMIT = 120;

export function GeometryGalaxy3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [nodes, setNodes] = React.useState<ShapeNode[]>([]);
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
    const filteredData = SHAPE_DATA.filter(item => item.level <= levelThreshold);
    const shuffled = shuffleArray([...filteredData]);

    // Pick dynamic random subset
    const count = level === 'beginner' ? 4 : level === 'intermediate' ? 6 : 8;
    const subset = shuffled.slice(0, count);

    const newNodes: ShapeNode[] = subset.map((item, i) => {
      const phi = Math.acos(-1 + (2 * i) / (subset.length - 1));
      const theta = Math.sqrt(subset.length * Math.PI) * phi;
      const radius = 240;
      return {
        ...item,
        id: `shape-${i}-${Math.random()}`,
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

  const handleNodeClick = (node: ShapeNode) => {
    if (hasMovedSignificantly.current || gameState !== 'playing' || feedback) return;
    if (node.name === nodes[targetIndex].name) {
      const newScore = score + 100;
      setScore(newScore);
      setFeedback({ type: 'correct', text: 'MATCHED!' });
      
      // Generate particles
      const emojisPool = ['📐', '📏', '⭐', '🪙', '✨', '🛸', '🛰️', '🌌'];
      const colorsPool = ['#38bdf8', '#0ea5e9', '#3b82f6', '#6366f1', '#f59e0b', '#fbbf24'];
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
          details: { slug: game?.slug || 'geometry-galaxy-3d', score: newScore, difficulty }
        });
        toast({
          title: "Sector Cleared! 🏆🌌",
          description: "You've successfully scanned and matched all shapes! Coins and pet XP awarded.",
        });
      }
      setTimeout(() => setFeedback(null), 600);
    } else {
      setScore(s => Math.max(0, s - 50));
      setFeedback({ type: 'wrong', text: 'INCORRECT SHAPE!' });
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
        details: { slug: game?.slug || 'geometry-galaxy-3d', score, difficulty }
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
        @keyframes galaxy-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes galaxy-particle-fly {
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
        @keyframes galaxy-glow-coin {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)); }
        }
        .galaxy-animate-shake {
          animation: galaxy-shake 0.5s ease-in-out;
        }
        .galaxy-glow-coin {
          animation: galaxy-glow-coin 2s infinite ease-in-out;
        }
        .galaxy-particle {
          position: absolute;
          animation: galaxy-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>

      <Card className={cn(
        "w-full overflow-hidden bg-slate-950/90 backdrop-blur-md border-sky-500/20 shadow-2xl relative text-white transition-all duration-500 z-10",
        isFullscreen ? "h-screen rounded-none border-none" : "max-w-4xl mx-auto rounded-xl border",
        triggerShake && "galaxy-animate-shake"
      )}>
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-sky-400/70 hover:text-sky-400 z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
          <div className="flex justify-center mb-2">
            <Telescope className="w-12 h-12 text-sky-400" />
          </div>
          <CardTitle className="text-3xl font-black italic uppercase">GEOMETRY GALAXY 3D</CardTitle>
          <CardDescription className="text-sky-200">Scan the galaxy to identify 3D shapes by their properties.</CardDescription>
          {difficulty && (
            <div className="flex justify-center pt-2">
              <Badge variant="outline" className="border-sky-500 text-sky-400">{difficulty.toUpperCase()}</Badge>
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
                <div className={cn("p-10 rounded-3xl shadow-2xl border-8 backdrop-blur-md flex flex-col items-center gap-4", feedback.type === 'correct' ? "bg-sky-600/90 border-sky-400" : "bg-red-600/90 border-red-400")}>
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
              className="galaxy-particle"
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
              <Button onClick={() => setGameState('instructions')} size="lg" className="bg-sky-600 hover:bg-sky-500 text-white font-bold">INITIALIZE SENSORS</Button>
            </div>
          )}

          {gameState === 'instructions' && (
            <div className="max-w-md space-y-6 text-center px-6">
              <div className="bg-sky-900/50 p-6 rounded-2xl border-2 border-sky-500/30">
                <h3 className="text-xl font-bold mb-4 uppercase">NAVIGATIONAL PROTOCOL</h3>
                <ul className="text-left space-y-3 text-sm">
                  <li>1. Read the <strong>Geometric Property</strong> at the top.</li>
                  <li>2. Drag to rotate the 3D shape cloud.</li>
                  <li>3. Click the correct shape name to confirm identity.</li>
                </ul>
              </div>
              <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="w-full bg-sky-500 font-black">CONTINUE TO SELECTION</Button>
            </div>
          )}

          {gameState === 'selecting_difficulty' && (
            <div className="max-w-md w-full space-y-6 text-center px-6">
              <h3 className="text-2xl font-black uppercase text-sky-400">SELECT SCAN RANGE</h3>
              <div className="grid gap-4">
                <Button onClick={() => startNewGame('beginner')} variant="outline" className="h-16 text-xl font-bold border-sky-500/50 hover:bg-sky-500/20">BEGINNER (Basic Solids)</Button>
                <Button onClick={() => startNewGame('intermediate')} variant="outline" className="h-16 text-xl font-bold border-sky-500/50 hover:bg-sky-500/20">INTERMEDIATE (Prisms & Pyramids)</Button>
                <Button onClick={() => startNewGame('advanced')} variant="outline" className="h-16 text-xl font-bold border-sky-500/50 hover:bg-sky-500/20">ADVANCED (Polyhedrons)</Button>
              </div>
            </div>
          )}

          {gameState === 'playing' && nodes[targetIndex] && (
            <div className="w-full h-full flex flex-col items-center p-4">
              <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4 bg-black/40 p-3 rounded-2xl border border-sky-500/20 shadow-lg relative z-[60]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest">DATA POINTS</span>
                  <span className="text-3xl font-black">{score}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest">OXYGEN REMAINING</span>
                  <div className="flex items-center gap-2">
                    <Timer className={cn("w-6 h-6", timeLeft < 10 ? "text-red-500 animate-bounce" : "text-sky-400")} />
                    <span className={cn("text-3xl font-black", timeLeft < 10 && "text-red-500")}>{timeLeft}s</span>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-2xl border-4 p-6 rounded-3xl text-center mb-8 shadow-2xl bg-sky-900/40 border-sky-500/40 backdrop-blur-sm relative z-[60]">
                <span className="text-[10px] font-black uppercase text-sky-400 tracking-[0.3em] mb-2 block">IDENTIFY THIS SOLID</span>
                <p className="text-xl font-bold italic leading-tight">"{nodes[targetIndex].property}"</p>
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
                          isCompleted ? "bg-sky-500/20 border-sky-500/40 text-sky-500/40 scale-75 pointer-events-none" : "bg-white text-slate-950 border-sky-500 hover:bg-sky-500 hover:text-white"
                        )}
                        style={{ x: node.x, y: node.y, z: node.z, rotateX: invRotateX, rotateY: invRotateY, transformStyle: 'preserve-3d', zIndex: Math.round(node.z + 500), scale: (node.z + 600) / 600, opacity: (node.z + 400) / 600 }}
                      >
                        {node.name.toUpperCase()}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              <div className="absolute bottom-6 left-6 flex flex-col items-center gap-2 bg-black/60 p-4 rounded-3xl backdrop-blur-md border border-sky-500/20 z-[70] shadow-2xl">
                <Button variant="outline" size="icon" onClick={() => manualRotate('up')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-sky-500 border-white/20"><ArrowUp className="w-4 h-4"/></Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => manualRotate('left')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-sky-500 border-white/20"><ArrowLeft className="w-4 h-4"/></Button>
                  <Button variant="outline" size="icon" onClick={() => manualRotate('down')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-sky-500 border-white/20"><ArrowDown className="w-4 h-4"/></Button>
                  <Button variant="outline" size="icon" onClick={() => manualRotate('right')} className="h-10 w-10 rounded-full border-2 bg-white/10 text-white hover:bg-sky-500 border-white/20"><ArrowRight className="w-4 h-4"/></Button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="flex flex-col items-center gap-8 px-6 text-center w-full max-w-xl mx-auto py-6 animate-in fade-in duration-500">
              <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
              <h2 className="text-4xl font-black uppercase">SECTOR CLEARED</h2>
              <p className="text-xl">Mission Score: <span className="text-sky-400 text-3xl font-black">{score} pts</span></p>

              {/* Daily Bonus Claimed Banner */}
              {isDailyBonus && (
                <div className="relative w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-2 z-10">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 left-6 text-sm animate-bounce" style={{ animationDelay: '100ms' }}>🪙</div>
                    <div className="absolute bottom-4 right-12 text-sm animate-bounce" style={{ animationDelay: '300ms' }}>⭐</div>
                    <div className="absolute top-6 right-8 text-sm animate-bounce" style={{ animationDelay: '500ms' }}>🪙</div>
                    <div className="absolute bottom-2 left-10 text-sm animate-bounce" style={{ animationDelay: '700ms' }}>⭐</div>
                  </div>
                  <div className="galaxy-glow-coin bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
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
                <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="rounded-full bg-sky-500 text-white font-bold">NEW SECTOR</Button>
                <Button variant="outline" onClick={() => setGameState('idle')} size="lg" className="rounded-full border-sky-500 text-sky-400 hover:bg-sky-500/10">RETURN TO BASE</Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-black/40 p-6 flex justify-between border-t border-sky-500/20">
          <Button variant="ghost" asChild className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"><Link href="/games">EXIT GALAXY</Link></Button>
          {gameState === 'playing' && (
            <div className="flex items-center gap-4 text-xs font-black text-sky-400">
              <span>SHAPE {targetIndex + 1} / {nodes.length}</span>
              <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden border border-sky-500/20">
                <motion.div className="h-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" initial={{ width: 0 }} animate={{ width: `${(targetIndex / nodes.length) * 100}%` }} />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
