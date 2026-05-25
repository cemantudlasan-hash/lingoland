'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, RotateCcw, Search, Coins, Sparkles, Maximize, Minimize, Volume2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface QuestItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  phonetics: string;
  // CSS 3D Positioning inside our room
  rotateY: number;
  translateZ: number;
  translateX: number;
  translateY: number;
  width: string;
  height: string;
  color: string;
}

const KITCHEN_OBJECTS: QuestItem[] = [
  {
    id: 'fridge',
    name: 'Refrigerator',
    emoji: ' fridge',
    description: 'A large appliance used to keep food cold and fresh.',
    phonetics: '/rɪˈfrɪdʒəreɪtər/',
    rotateY: 0,
    translateX: -110,
    translateY: -30,
    translateZ: -120,
    width: '70px',
    height: '130px',
    color: 'from-blue-600 to-indigo-800 border-blue-400',
  },
  {
    id: 'toaster',
    name: 'Toaster',
    emoji: '🍞 toaster',
    description: 'An electrical appliance used to brown sliced bread.',
    phonetics: '/ˈtoʊstər/',
    rotateY: 0,
    translateX: 60,
    translateY: 40,
    translateZ: -120,
    width: '40px',
    height: '35px',
    color: 'from-amber-500 to-orange-600 border-amber-400',
  },
  {
    id: 'clock',
    name: 'Clock',
    emoji: '⏰ clock',
    description: 'An instrument used to measure and display time.',
    phonetics: '/klɑːk/',
    rotateY: -90,
    translateX: 140, // wall position
    translateY: -80,
    translateZ: 0,
    width: '50px',
    height: '50px',
    color: 'from-rose-500 to-pink-600 border-pink-400',
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    emoji: '🗄️ cabinet',
    description: 'A cupboard with shelves or drawers for storing items.',
    phonetics: '/ˈkæbɪnət/',
    rotateY: 0,
    translateX: 0,
    translateY: -90,
    translateZ: -120,
    width: '100px',
    height: '50px',
    color: 'from-purple-500 to-violet-750 border-purple-400',
  },
  {
    id: 'sink',
    name: 'Sink',
    emoji: '🚰 sink',
    description: 'A basin used for washing hands and dishes.',
    phonetics: '/sɪŋk/',
    rotateY: 90,
    translateX: -140, // wall position
    translateY: 50,
    translateZ: 0,
    width: '60px',
    height: '60px',
    color: 'from-teal-500 to-cyan-600 border-teal-400',
  },
  {
    id: 'window',
    name: 'Window',
    emoji: '🪟 window',
    description: 'An opening in a wall to let in light and air.',
    phonetics: '/ˈwɪndoʊ/',
    rotateY: 0,
    translateX: 100,
    translateY: -50,
    translateZ: -120,
    width: '80px',
    height: '90px',
    color: 'from-sky-400 to-indigo-600 border-sky-300',
  }
];

export function ExplorationQuest3D({ onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [rotation, setRotation] = React.useState(0);
  const [selectedItem, setSelectedItem] = React.useState<QuestItem | null>(null);
  const [targetItems, setTargetItems] = React.useState<string[]>([]);
  const [foundItems, setFoundItems] = React.useState<string[]>([]);
  const [gameState, setGameState] = React.useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = React.useState(0);
  const [speakActive, setSpeakActive] = React.useState(false);

  // Initialize targets
  React.useEffect(() => {
    // Select 4 random items to find
    const shuffled = [...KITCHEN_OBJECTS].sort(() => 0.5 - Math.random());
    setTargetItems(shuffled.slice(0, 4).map(item => item.id));
  }, []);

  const handleStartGame = () => {
    setGameState('playing');
    setFoundItems([]);
    setScore(0);
    setSelectedItem(null);
  };

  const handleSelectItem = (item: QuestItem) => {
    setSelectedItem(item);
    
    // Play simple synthetic sound
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeakActive(true);
      const utterance = new SpeechSynthesisUtterance(item.name);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakActive(false);
      window.speechSynthesis.speak(utterance);
    }

    if (gameState === 'playing' && targetItems.includes(item.id) && !foundItems.includes(item.id)) {
      const nextFound = [...foundItems, item.id];
      setFoundItems(nextFound);
      setScore(prev => prev + 25);

      if (nextFound.length === targetItems.length) {
        setGameState('finished');
        // Dispatch completion events for Lingo-Coins logic
        window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
          detail: { state: 'finished' }
        }));
      }
    }
  };

  const handleRotateLeft = () => setRotation(r => r - 45);
  const handleRotateRight = () => setRotation(r => r + 45);

  const currentTargetId = targetItems.find(id => !foundItems.includes(id));
  const currentTargetItem = KITCHEN_OBJECTS.find(i => i.id === currentTargetId);

  return (
    <div className="flex flex-col items-center bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[550px]">
      {/* Premium background gradient elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-900 pb-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
            <Search className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">3D Exploration & Questing</h2>
            <p className="text-xs text-slate-400">Interact with the 3D room to discover vocabulary and complete quests!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <button onClick={onToggleFullscreen} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800/50 transition-colors">
              <Maximize className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md my-auto space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur opacity-40 animate-pulse" />
              <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
                <Search className="h-16 w-16 text-indigo-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Vocabulary Quest</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Step into a full 3D interactive classroom kitchen! Find objects, click on them to hear their pronunciation, and complete the daily explorer quest.
              </p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black uppercase text-sm tracking-widest rounded-2xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Begin Quest
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-6 z-10"
          >
            {/* Left Control Panel / Active Quest */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between h-full">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400">Current Objective</span>
                  {currentTargetItem ? (
                    <div className="mt-2 space-y-2">
                      <h4 className="text-lg font-black text-white flex items-center gap-1.5 animate-pulse">
                        Find: {currentTargetItem.name}
                      </h4>
                      <p className="text-xs text-slate-400 italic">"{currentTargetItem.description}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">All items found! Completing quest...</p>
                  )}
                </div>

                <div className="border-t border-slate-900 pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Progress</span>
                    <span className="text-indigo-400 font-black">{foundItems.length}/4 Found</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${(foundItems.length / 4) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl mt-3">
                    <Coins className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span>+{score} Lingo-Coins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D World Stage */}
            <div className="md:col-span-2 flex flex-col items-center justify-center relative bg-slate-950/60 border border-slate-900 rounded-3xl p-4 overflow-hidden min-h-[350px]">
              {/* Rotation HUD Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                <button 
                  onClick={handleRotateLeft}
                  className="pointer-events-auto p-2 bg-slate-900/90 border border-slate-800 hover:text-indigo-400 rounded-xl hover:scale-105 active:scale-95 transition-all"
                  title="Rotate Left"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-full">
                  Orbit Yaw: {rotation}°
                </span>
                <button 
                  onClick={handleRotateRight}
                  className="pointer-events-auto p-2 bg-slate-900/90 border border-slate-800 hover:text-indigo-400 rounded-xl hover:scale-105 active:scale-95 transition-all"
                  title="Rotate Right"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              {/* 3D Scene Viewport */}
              <div className="w-[300px] h-[300px] flex items-center justify-center [perspective:800px] overflow-hidden select-none mt-4">
                <div 
                  className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-out"
                  style={{ transform: `rotateX(-12deg) rotateY(${rotation}deg)` }}
                >
                  {/* The Room Walls / floor (rendered in mock CSS 3D coordinates) */}
                  
                  {/* FLOOR */}
                  <div 
                    className="absolute w-[350px] h-[350px] bg-slate-900 border border-slate-800/40 opacity-70 [transform:rotateX(90deg)_translateZ(-150px)_translateX(-25px)]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* BACK WALL */}
                  <div className="absolute w-[350px] h-[250px] bg-slate-950/80 border border-slate-800/20 [transform:translateZ(-150px)_translateX(-25px)_translateY(-20px)] flex items-center justify-center">
                    {/* Back wall panel line */}
                    <div className="w-full h-[1px] bg-slate-800/20" />
                  </div>

                  {/* LEFT WALL */}
                  <div className="absolute w-[300px] h-[250px] bg-slate-950/90 border border-slate-800/20 [transform:rotateY(90deg)_translateZ(-175px)_translateY(-20px)_translateX(25px)]" />

                  {/* RIGHT WALL */}
                  <div className="absolute w-[300px] h-[250px] bg-slate-950/90 border border-slate-800/20 [transform:rotateY(-90deg)_translateZ(-125px)_translateY(-20px)_translateX(-25px)]" />

                  {/* The 3D placed Interactive objects */}
                  {KITCHEN_OBJECTS.map(obj => {
                    const isFound = foundItems.includes(obj.id);
                    const isTarget = targetItems.includes(obj.id);
                    const isCurrentlySeeking = currentTargetId === obj.id;

                    return (
                      <div
                        key={obj.id}
                        onClick={() => handleSelectItem(obj)}
                        className={cn(
                          "absolute cursor-pointer [transform-style:preserve-3d] transition-all duration-300 flex items-center justify-center border-2 rounded-2xl group",
                          isFound
                            ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                            : isCurrentlySeeking
                            ? "bg-indigo-500/20 border-indigo-500 animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-500 hover:scale-105 hover:bg-slate-800/80"
                        )}
                        style={{
                          width: obj.width,
                          height: obj.height,
                          transform: `translateX(${obj.translateX}px) translateY(${obj.translateY}px) translateZ(${obj.translateZ}px) rotateY(${obj.rotateY}deg)`,
                        }}
                      >
                        {/* 3D Box faces representation */}
                        <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                          <span className={cn("text-xl transition-transform", !isFound && "group-hover:scale-125 duration-200")}>
                            {obj.emoji}
                          </span>
                          <span className={cn(
                            "text-[8px] font-black uppercase text-center truncate w-full px-1",
                            isFound ? "text-emerald-400" : isCurrentlySeeking ? "text-indigo-300 animate-pulse" : "text-slate-400"
                          )}>
                            {obj.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Information Display Panel */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 h-full flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {selectedItem ? (
                    <motion.div 
                      key={selectedItem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500">Explorer Logs</span>
                        <h4 className="text-lg font-black text-white mt-1 flex items-center gap-1.5">
                          {selectedItem.name}
                          <Volume2 className={cn("h-4 w-4 text-indigo-400 cursor-pointer", speakActive && "animate-bounce")} />
                        </h4>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold block">{selectedItem.phonetics}</span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-900/60 pt-3">{selectedItem.description}</p>
                      
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-[10px] text-slate-500 font-bold leading-normal">
                        Click the speaker icon to play pronunciation. Space / Arrow Keys rotate room.
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-4">
                      <Search className="h-10 w-10 text-slate-700 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-wider">Logs Empty</p>
                      <p className="text-[10px] text-slate-600 mt-1 leading-normal">Click any 3D room object to inspect its linguistic roots.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md my-auto space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur opacity-40 animate-pulse" />
              <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Explorer Quest Cleared!</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Outstanding work! You successfully identified all kitchen targets in full 3D, mastered their spelling and pronunciation, and cleared the daily quest.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 flex items-center justify-center gap-3">
              <Coins className="h-6 w-6 text-amber-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Total Coins Earned</span>
                <span className="text-xl font-black text-amber-300 block leading-tight">+{score} Lingo-Coins</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="px-8 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Explore Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
