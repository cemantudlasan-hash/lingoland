'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Puzzle, 
  Sparkles, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Volume2, 
  ArrowRight, 
  Play, 
  ArrowLeft, 
  LogOut, 
  Box, 
  Zap, 
  Trophy, 
  HelpCircle,
  Layers,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';

interface PuzzleObject {
  id: string;
  name: string;
  emoji: string;
  letters: string[];
  animationType: 'car-drive' | 'rocket-launch';
  description: string;
  color: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const PUZZLES: PuzzleObject[] = [
  { id: 'car', name: 'Car', emoji: '🚗', letters: ['C', 'A', 'R'], animationType: 'car-drive', description: 'A road vehicle with four wheels.', color: 'from-red-500 to-rose-700' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', letters: ['R', 'O', 'C', 'K', 'E', 'T'], animationType: 'rocket-launch', description: 'A powerful spacecraft.', color: 'from-cyan-500 to-blue-700' },
  { id: 'apple', name: 'Apple', emoji: '🍎', letters: ['A', 'P', 'P', 'L', 'E'], animationType: 'car-drive', description: 'A sweet, crunchy fruit.', color: 'from-red-400 to-red-600' },
  { id: 'tree', name: 'Tree', emoji: '🌳', letters: ['T', 'R', 'E', 'E'], animationType: 'rocket-launch', description: 'A tall plant with a wooden trunk.', color: 'from-green-500 to-emerald-700' },
  { id: 'house', name: 'House', emoji: '🏠', letters: ['H', 'O', 'U', 'S', 'E'], animationType: 'car-drive', description: 'A building for human habitation.', color: 'from-amber-500 to-orange-700' },
  { id: 'boat', name: 'Boat', emoji: '⛵', letters: ['B', 'O', 'A', 'T'], animationType: 'car-drive', description: 'A small vessel for travelling on water.', color: 'from-blue-400 to-blue-600' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', letters: ['P', 'I', 'Z', 'Z', 'A'], animationType: 'rocket-launch', description: 'A savory dish of Italian origin.', color: 'from-yellow-400 to-orange-500' },
  { id: 'ghost', name: 'Ghost', emoji: '👻', letters: ['G', 'H', 'O', 'S', 'T'], animationType: 'rocket-launch', description: 'An apparition of a dead person.', color: 'from-slate-200 to-slate-400' },
  { id: 'alien', name: 'Alien', emoji: '👽', letters: ['A', 'L', 'I', 'E', 'N'], animationType: 'car-drive', description: 'A being from another planet.', color: 'from-lime-400 to-green-600' },
  { id: 'clock', name: 'Clock', emoji: '⏰', letters: ['C', 'L', 'O', 'C', 'K'], animationType: 'rocket-launch', description: 'Measures time.', color: 'from-rose-400 to-pink-600' },
  { id: 'sword', name: 'Sword', emoji: '🗡️', letters: ['S', 'W', 'O', 'R', 'D'], animationType: 'car-drive', description: 'A weapon with a long metal blade.', color: 'from-zinc-400 to-zinc-600' },
  { id: 'crown', name: 'Crown', emoji: '👑', letters: ['C', 'R', 'O', 'W', 'N'], animationType: 'rocket-launch', description: 'A circular ornamental headdress worn by a monarch.', color: 'from-yellow-300 to-amber-500' },
  { id: 'heart', name: 'Heart', emoji: '❤️', letters: ['H', 'E', 'A', 'R', 'T'], animationType: 'car-drive', description: 'A hollow muscular organ that pumps blood.', color: 'from-red-500 to-pink-600' },
  { id: 'star', name: 'Star', emoji: '⭐', letters: ['S', 'T', 'A', 'R'], animationType: 'rocket-launch', description: 'A luminous point in the night sky.', color: 'from-yellow-200 to-yellow-400' },
  { id: 'moon', name: 'Moon', emoji: '🌙', letters: ['M', 'O', 'O', 'N'], animationType: 'car-drive', description: 'The natural satellite of the earth.', color: 'from-blue-200 to-indigo-300' },
  { id: 'plane', name: 'Plane', emoji: '✈️', letters: ['P', 'L', 'A', 'N', 'E'], animationType: 'rocket-launch', description: 'A powered flying vehicle.', color: 'from-sky-400 to-blue-600' },
  { id: 'train', name: 'Train', emoji: '🚂', letters: ['T', 'R', 'A', 'I', 'N'], animationType: 'car-drive', description: 'A series of connected railway carriages.', color: 'from-stone-600 to-stone-800' },
  { id: 'key', name: 'Key', emoji: '🔑', letters: ['K', 'E', 'Y'], animationType: 'rocket-launch', description: 'A small piece of shaped metal used to open a lock.', color: 'from-yellow-300 to-amber-400' },
  { id: 'lamp', name: 'Lamp', emoji: '💡', letters: ['L', 'A', 'M', 'P'], animationType: 'rocket-launch', description: 'A device for giving light.', color: 'from-yellow-300 to-orange-400' },
  { id: 'door', name: 'Door', emoji: '🚪', letters: ['D', 'O', 'O', 'R'], animationType: 'car-drive', description: 'A hinged barrier used to close an entrance.', color: 'from-amber-800 to-stone-800' },
  { id: 'window', name: 'Window', emoji: '🪟', letters: ['W', 'I', 'N', 'D', 'O', 'W'], animationType: 'rocket-launch', description: 'An opening in a wall to let in light and air.', color: 'from-sky-400 to-blue-500' }
];

export function LivingPuzzles3D({ onToggleFullscreen }: { slug?: string; onToggleFullscreen?: () => void }) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = React.useState(0);
  const [assembledLetters, setAssembledLetters] = React.useState<string[]>([]);
  const [gameState, setGameState] = React.useState<'idle' | 'playing' | 'animating' | 'completed'>('idle');
  const [activePuzzles, setActivePuzzles] = React.useState<PuzzleObject[]>([]);
  
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  React.useEffect(() => {
    setActivePuzzles(shuffleArray(PUZZLES).slice(0, 5));
  }, []);
  
  const activePuzzle = activePuzzles[currentPuzzleIdx] || PUZZLES[0];

  const handleStart = () => {
    setActivePuzzles(shuffleArray(PUZZLES).slice(0, 5));
    setCurrentPuzzleIdx(0);
    setAssembledLetters([]);
    setGameState('playing');
  };

  const handleAbortGame = () => {
    setGameState('idle');
    setAssembledLetters([]);
    setCurrentPuzzleIdx(0);
  };

  const handleLetterClick = (letter: string) => {
    if (gameState !== 'playing') return;

    const nextIndex = assembledLetters.length;
    const expectedLetter = activePuzzle.letters[nextIndex];

    if (letter === expectedLetter) {
      const updated = [...assembledLetters, letter];
      setAssembledLetters(updated);

      // Play phonetic sound
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(letter.toLowerCase());
          utterance.rate = 1.1;
          window.speechSynthesis.speak(utterance);
        } catch {
          // ignore
        }
      }

      if (updated.length === activePuzzle.letters.length) {
        setGameState('animating');
        
        setTimeout(() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
              const utterance = new SpeechSynthesisUtterance(activePuzzle.name);
              utterance.rate = 0.9;
              window.speechSynthesis.speak(utterance);
            } catch {
              // ignore
            }
          }
        }, 500);

        setTimeout(() => {
          if (currentPuzzleIdx < activePuzzles.length - 1) {
            setCurrentPuzzleIdx(prev => prev + 1);
            setAssembledLetters([]);
            setGameState('playing');
          } else {
            setGameState('completed');
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
                detail: { state: 'finished' }
              }));
            }
          }
        }, 3000);
      }
    }
  };

  const handleRestart = () => {
    setActivePuzzles(shuffleArray(PUZZLES).slice(0, 5));
    setCurrentPuzzleIdx(0);
    setAssembledLetters([]);
    setGameState('playing');
  };

  // Get scrambled letters for selection
  const selectionLetters = React.useMemo(() => {
    if (!activePuzzle) return [];
    return shuffleArray(activePuzzle.letters);
  }, [activePuzzle, currentPuzzleIdx]);

  return (
    <div className={cn(
      "w-full transition-all duration-500 flex flex-col justify-between bg-slate-950 text-white relative overflow-y-auto overflow-x-hidden",
      isFullscreen 
        ? "fixed inset-0 z-50 rounded-none h-screen bg-black p-3 sm:p-6" 
        : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl border border-cyan-500/20 bg-slate-950/95 backdrop-blur-2xl shadow-2xl"
    )}>
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Persistent Universal Top Header */}
      <div className="w-full flex flex-wrap items-center justify-between border-b border-cyan-500/20 p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md z-20 shrink-0 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-bold bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 border-cyan-500/30 hover:border-cyan-400 rounded-xl"
          >
            <Link href="/games" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Games</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl">
              <Puzzle className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-xl font-black uppercase tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Animated &quot;Living&quot; Puzzles
              </h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">Assemble 3D spelling blocks to bring objects to life</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {(gameState === 'playing' || gameState === 'animating') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAbortGame}
              className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40 rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5 text-red-400" />
              <span>Abort Game</span>
            </Button>
          )}

          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800/50"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Arena: items-stretch to fix mobile scroll clipping */}
      <div className="flex-1 flex flex-col items-stretch justify-start p-3 sm:p-6 lg:p-8 z-10 relative overflow-y-auto w-full max-w-6xl mx-auto space-y-6 pb-16">
        <AnimatePresence mode="wait">
          {/* LOBBY / WORKSHOP DECK */}
          {gameState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full space-y-6 py-2"
            >
              {/* Telemetry Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Box className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono uppercase text-cyan-300/60">3D Models</p>
                    <p className="text-sm sm:text-base font-black text-white">20+ OBJECTS</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono uppercase text-blue-300/60">Animation Engine</p>
                    <p className="text-sm sm:text-base font-black text-white">ACTIVE 60FPS</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono uppercase text-purple-300/60">Session Goal</p>
                    <p className="text-sm sm:text-base font-black text-purple-200">5 PUZZLES</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-mono uppercase text-emerald-300/60">Audio Speech</p>
                    <p className="text-sm sm:text-base font-black text-emerald-300">PHONETICS ON</p>
                  </div>
                </div>
              </div>

              {/* Main Workshop Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 bg-gradient-to-b from-cyan-950/20 via-slate-900/50 to-black/60 border border-cyan-500/30 rounded-3xl p-5 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span>3D SPATIAL PUZZLE WORKSHOP</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                      Construct & Bring <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                        3D Word Puzzles to Life
                      </span>
                    </h2>

                    <p className="text-sm sm:text-base text-cyan-100/70 leading-relaxed max-w-xl">
                      Select spelling letter blocks in precise sequence. Once the word is completely constructed, watch the object awaken with living motion and speech synthesis!
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleStart}
                      className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02] border border-cyan-300/30 uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      <span>Start 3D Puzzles</span>
                    </Button>

                    <Button
                      variant="outline"
                      asChild
                      className="h-14 sm:h-16 px-6 text-sm sm:text-base font-bold border-white/15 bg-slate-900/50 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2"
                    >
                      <Link href="/games">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Games</span>
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900/50 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 text-cyan-300">
                      <HelpCircle className="h-5 w-5 text-cyan-400" />
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                        Workshop Rules
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-cyan-100/80">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">01</span>
                        <div>
                          <p className="font-bold text-white">Assemble Sequential Letters</p>
                          <p className="text-[12px] text-cyan-200/60">Tap scrambled blocks from left to right to build the object name.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">02</span>
                        <div>
                          <p className="font-bold text-white">Phonetics Audio</p>
                          <p className="text-[12px] text-cyan-200/60">Listen to clear speech pronunciation as each letter and word locks in.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">03</span>
                        <div>
                          <p className="font-bold text-white">Full In-Game Control</p>
                          <p className="text-[12px] text-cyan-200/60">Abort or restart your workshop puzzle session anytime from the top bar.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE PLAYING ARENA */}
          {(gameState === 'playing' || gameState === 'animating') && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6 z-10"
            >
              {/* Left HUD Information Box */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full shadow-lg backdrop-blur-md space-y-4">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-400">Object Intel</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {gameState === 'playing' ? '???' : activePuzzle.name}
                      </h3>
                      <p className="text-sm text-slate-300 italic mt-2 leading-relaxed">
                        &ldquo;{activePuzzle.description}&rdquo;
                      </p>
                    </div>

                    <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl">
                      <p className="text-[11px] font-mono uppercase text-cyan-300/70">Assembled Length</p>
                      <p className="text-sm font-bold text-white">{assembledLetters.length} / {activePuzzle.letters.length} Letters</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="border-t border-slate-800 pt-3 text-xs text-slate-400 leading-relaxed font-bold">
                      {gameState === 'playing' 
                        ? "Click the letter blocks in correct spelling order to assemble the 3D model!"
                        : "Spelling complete! 3D animation sequence playing..."}
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleAbortGame}
                      className="w-full text-xs font-bold text-red-300 border-red-500/30 hover:bg-red-950/40 rounded-xl flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5 text-red-400" />
                      <span>Abort Game</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Central 3D Puzzle Workbench */}
              <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-between min-h-[420px] relative overflow-hidden backdrop-blur-md">
                {/* Progress indicator */}
                <div className="text-[11px] uppercase font-mono font-bold tracking-widest text-cyan-300 bg-slate-950 border border-cyan-500/30 px-3.5 py-1 rounded-full z-20">
                  Puzzle {currentPuzzleIdx + 1} of {activePuzzles.length}
                </div>

                {/* The 3D workbench viewport: Responsive width */}
                <div className="w-full max-w-[420px] h-[250px] sm:h-[280px] flex items-center justify-center [perspective:800px] relative my-2">
                  <div 
                    className="relative [transform-style:preserve-3d] transition-all duration-300 w-full h-full flex items-center justify-center"
                    style={{ transform: 'rotateX(20deg) rotateY(-15deg)' }}
                  >
                    {/* Grid base workbench floor */}
                    <div 
                      className="absolute w-[300px] sm:w-[360px] h-[240px] sm:h-[280px] bg-slate-900/40 border border-cyan-500/20 [transform:rotateX(90deg)_translateZ(-90px)]"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)',
                        backgroundSize: '15px 15px',
                      }}
                    />

                    {/* MOCK ASSEMBLY / ANIMATED OBJECT */}
                    <motion.div
                      animate={gameState === 'animating' ? (
                        activePuzzle.animationType === 'car-drive' 
                          ? { 
                              x: [0, -10, 260], 
                              y: [0, -5, 0], 
                              rotateZ: [0, 5, -2],
                              scale: [1, 1.05, 0.2],
                              transition: { duration: 2.8, ease: 'easeInOut' }
                            } 
                          : { 
                              y: [0, 15, -350], 
                              rotateY: [0, 180, 720],
                              scale: [1, 0.9, 0.1],
                              transition: { duration: 2.8, ease: 'easeIn' }
                            }
                      ) : {}}
                      className="relative [transform-style:preserve-3d] w-40 sm:w-48 h-28 sm:h-32 rounded-2xl flex flex-col items-center justify-center"
                    >
                      {/* Outline Wireframe placeholder */}
                      {gameState === 'playing' && (
                        <div className="absolute inset-0 border border-dashed border-cyan-500/30 rounded-2xl bg-cyan-500/5 flex items-center justify-center select-none pointer-events-none">
                          <span className="text-4xl sm:text-5xl font-extrabold opacity-25">❓</span>
                        </div>
                      )}

                      {/* Fully Assembled Living block */}
                      {gameState === 'animating' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center [transform-style:preserve-3d]">
                          <div className={`p-4 sm:p-6 bg-gradient-to-r ${activePuzzle.color} border border-cyan-400/40 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20`}>
                            <span className="text-5xl sm:text-6xl animate-bounce">{activePuzzle.emoji}</span>
                          </div>
                        </div>
                      )}

                      {/* Sequential built letter blocks */}
                      <div className="absolute -bottom-10 flex gap-1.5 sm:gap-2 [transform-style:preserve-3d] z-10">
                        {activePuzzle.letters.map((letObj, idx) => {
                          const isFilled = idx < assembledLetters.length;

                          return (
                            <div 
                              key={idx}
                              className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg border font-black text-lg sm:text-xl transition-all duration-300 [transform-style:preserve-3d] [transform:translateZ(15px)] ${
                                isFilled 
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20 scale-105' 
                                  : 'border-slate-800 bg-slate-900/60 text-slate-600'
                              }`}
                            >
                              {isFilled ? letObj : '_'}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Scrambled Letter Blocks Selection Panel */}
                <div className="w-full mt-4">
                  {gameState === 'playing' ? (
                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center">
                      {selectionLetters.map((letObj, index) => (
                        <button
                          key={index}
                          onClick={() => handleLetterClick(letObj)}
                          className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-cyan-400 text-cyan-200 hover:text-white font-black rounded-2xl text-xl sm:text-2xl transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center relative overflow-hidden"
                        >
                          <span className="relative z-10">{letObj}</span>
                          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-14 text-cyan-300 font-bold uppercase text-xs sm:text-sm tracking-wider animate-pulse gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      <span>Living animation playing...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* COMPLETED VICTORY SCREEN */}
          {gameState === 'completed' && (
            <motion.div 
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 z-10 py-8"
            >
              <div className="relative p-6 bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">All Puzzles Assembled!</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Superb 3D spelling craft! You assembled all word puzzles and activated full spatial animations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <Button
                  onClick={handleRestart}
                  className="px-8 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Play Again</span>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="px-8 h-12 border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800 rounded-xl text-xs font-bold"
                >
                  <Link href="/games">
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    <span>Back to Games</span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="w-full flex items-center justify-between border-t border-cyan-500/20 px-4 sm:px-6 py-2.5 bg-slate-950/80 text-[11px] font-mono text-cyan-300/60 z-20 shrink-0">
        <span>ANIMATED LIVING PUZZLES // 3D SPATIAL ENGINE</span>
        <Link href="/games" className="hover:text-cyan-200 transition-colors">
          ← Exit to Games Hub
        </Link>
      </div>
    </div>
  );
}
