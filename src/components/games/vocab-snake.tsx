'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Play, RotateCcw, Trophy, Crown, Medal, ShieldAlert, Clock,
  Users, UserCheck, AlertTriangle, ArrowRight, Zap, CheckCircle2, XCircle,
  SkipForward, Lock, Info, Volume2, VolumeX, Eye, BookOpen, Flame, Hash, Copy, Check,
  Maximize, Minimize, ArrowLeft, Home, UserPlus, LogIn, User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';

// ─── Theme Dictionaries & Valid Word Lists ───────────────────────────────────
const THEME_CATEGORIES: Record<string, { label: string; icon: string; words: string[] }> = {
  general: {
    label: 'General Vocabulary',
    icon: '🌐',
    words: [
      'apple', 'elephant', 'tiger', 'rabbit', 'turtle', 'eagle', 'earth', 'happy', 'yellow', 'window',
      'water', 'river', 'rocket', 'tent', 'tree', 'energy', 'giant', 'thunder', 'rain', 'night', 'tiger',
      'robot', 'tower', 'radio', 'ocean', 'nature', 'engine', 'emerald', 'desert', 'dragon', 'nest',
      'table', 'eagle', 'eleven', 'novel', 'lemon', 'music', 'castle', 'earthquake', 'element', 'travel',
      'light', 'train', 'north', 'house', 'space', 'earth', 'heart', 'train', 'nature', 'explore', 'island'
    ]
  },
  animals: {
    label: 'Animals & Wildlife',
    icon: '🦁',
    words: [
      'alligator', 'bear', 'cheetah', 'dolphin', 'elephant', 'falcon', 'giraffe', 'hippopotamus',
      'iguana', 'jaguar', 'koala', 'lemur', 'monkey', 'narwhal', 'octopus', 'penguin', 'quail',
      'rabbit', 'snake', 'tiger', 'urchin', 'vulture', 'walrus', 'yak', 'zebra', 'antelope', 'bison',
      'chameleon', 'donkey', 'eagle', 'flamingo', 'gorilla', 'hedgehog', 'impala', 'jackal', 'kangaroo',
      'leopard', 'meerkats', 'newt', 'ostrich', 'panther', 'rooster', 'squirrel', 'toucan', 'wolf'
    ]
  },
  food: {
    label: 'Food & Drinks',
    icon: '🍎',
    words: [
      'apple', 'banana', 'cherry', 'donut', 'eggplant', 'fig', 'grape', 'honey', 'icecream', 'jam',
      'kiwi', 'lemon', 'mango', 'noodle', 'orange', 'pizza', 'quiche', 'rice', 'soup', 'taco',
      'ube', 'vanilla', 'waffle', 'yam', 'zucchini', 'avocado', 'bread', 'cheese', 'dumpling', 'espresso',
      'hamburger', 'lasagna', 'meatball', 'pancake', 'salads', 'sandwich', 'tomato', 'yogurt'
    ]
  },
  school: {
    label: 'School Supplies',
    icon: '📚',
    words: [
      'backpack', 'binder', 'calculator', 'chalk', 'compass', 'crayon', 'desk', 'eraser', 'folder',
      'glue', 'highlighter', 'laptop', 'marker', 'notebook', 'paper', 'pencil', 'protractor', 'ruler',
      'scissors', 'stapler', 'textbook', 'whiteboard', 'blackboard', 'clipboard', 'dictionary', 'envelope'
    ]
  },
  places: {
    label: 'Places & Countries',
    icon: '🗺️',
    words: [
      'america', 'brazil', 'canada', 'denmark', 'egypt', 'france', 'germany', 'hungary', 'india',
      'japan', 'kenya', 'london', 'mexico', 'nepal', 'oslo', 'paris', 'qatar', 'rome', 'spain',
      'thailand', 'uganda', 'vietnam', 'washington', 'yemen', 'zambia', 'australia', 'belgium', 'china'
    ]
  },
  sports: {
    label: 'Sports & Hobbies',
    icon: '⚽',
    words: [
      'archery', 'baseball', 'cricket', 'dancing', 'exercise', 'football', 'golf', 'hiking',
      'icehockey', 'jogging', 'karate', 'lacrosse', 'marathon', 'netball', 'origami', 'painting',
      'rowing', 'swimming', 'tennis', 'volleyball', 'wrestling', 'yoga', 'cycling', 'skating', 'surfing'
    ]
  },
  nature: {
    label: 'Nature & Science',
    icon: '🌿',
    words: [
      'atmosphere', 'biome', 'cloud', 'desert', 'ecosystem', 'forest', 'glacier', 'humidity',
      'island', 'jungle', 'krill', 'lava', 'mountain', 'nebula', 'ocean', 'planet', 'quartz',
      'river', 'star', 'tornado', 'uranium', 'volcano', 'waterfall', 'thunder', 'lightning', 'galaxy'
    ]
  }
};

const DIFFICULTY_CONFIG = {
  easy: { name: 'Easy', minLength: 3, turnTime: 30, bonusMult: 1 },
  medium: { name: 'Medium', minLength: 4, turnTime: 20, bonusMult: 1.5 },
  hard: { name: 'Hard', minLength: 5, turnTime: 12, bonusMult: 2.2 }
};

interface Player {
  id: string;
  name: string;
  score: number;
  wordCount: number;
  isPassed: boolean;
  warningsCount: number;
  avatar: string;
}

interface ChainItem {
  id: string;
  word: string;
  playerId: string;
  playerName: string;
  points: number;
  startLetter: string;
  endLetter: string;
}

export function VocabSnake() {
  const router = useRouter();
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Fullscreen Container Ref
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ─── Setup & Lobby States ───
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'ended'>('lobby');
  const [lobbyMode, setLobbyMode] = useState<'solo' | 'host' | 'join'>('solo');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTheme, setSelectedTheme] = useState<string>('general');
  const [totalMatchTime, setTotalMatchTime] = useState<number>(180); // 3 mins default
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [roomCode, setRoomCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Join Room Form States
  const [joinInputCode, setJoinInputCode] = useState<string>('');
  const [joinPlayerName, setJoinPlayerName] = useState<string>('');

  // ─── Match States ───
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [wordChain, setWordChain] = useState<ChainItem[]>([]);
  const [inputWord, setInputWord] = useState<string>('');
  const [matchTimeLeft, setMatchTimeLeft] = useState<number>(180);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(20);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  // Input & Anti-cheat Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const matchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Mute
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Toggle Fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // Generate random room code on mount
  useEffect(() => {
    const code = 'VS-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(code);
  }, []);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    toast({ title: 'Room Code Copied!', description: `Shared ${roomCode} with your classmates.` });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Current target starting letter
  const currentTargetLetter = useMemo(() => {
    if (wordChain.length === 0) return '';
    const lastWord = wordChain[wordChain.length - 1].word;
    return lastWord.charAt(lastWord.length - 1).toUpperCase();
  }, [wordChain]);

  const activePlayer = useMemo(() => players[currentTurnIndex] || null, [players, currentTurnIndex]);

  // ─── Play Sound Helper ───
  const playSoundEffect = useCallback((type: 'correct' | 'wrong' | 'pass' | 'win') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'pass') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch {}
  }, [soundEnabled]);

  // ─── Initialize Game Session (Solo or Host) ───
  const startNewGame = useCallback(() => {
    const avatars = ['🦊', '🦉', '🦁', '🐯', '🦄', '🐼', '🐲'];
    const userName = user?.displayName || user?.email?.split('@')[0] || 'Player 1';

    const newPlayers: Player[] = [];

    if (lobbyMode === 'solo') {
      newPlayers.push({
        id: 'p-solo-1',
        name: userName,
        score: 0,
        wordCount: 0,
        isPassed: false,
        warningsCount: 0,
        avatar: '👤'
      });
    } else {
      // Host multiplayer room for human players
      newPlayers.push({
        id: 'p1',
        name: `${userName} (Host)`,
        score: 0,
        wordCount: 0,
        isPassed: false,
        warningsCount: 0,
        avatar: '👑'
      });

      for (let i = 2; i <= playerCount; i++) {
        newPlayers.push({
          id: `p${i}`,
          name: `Player ${i}`,
          score: 0,
          wordCount: 0,
          isPassed: false,
          warningsCount: 0,
          avatar: avatars[(i - 2) % avatars.length]
        });
      }
    }

    const themePool = THEME_CATEGORIES[selectedTheme]?.words || THEME_CATEGORIES.general.words;
    const initialWord = themePool[Math.floor(Math.random() * themePool.length)];

    const firstChainItem: ChainItem = {
      id: 'initial-1',
      word: initialWord,
      playerId: 'system',
      playerName: 'Starting Word',
      points: 0,
      startLetter: initialWord.charAt(0).toUpperCase(),
      endLetter: initialWord.charAt(initialWord.length - 1).toUpperCase()
    };

    setPlayers(newPlayers);
    setCurrentTurnIndex(0);
    setWordChain([firstChainItem]);
    setUsedWords(new Set([initialWord.toLowerCase()]));
    setMatchTimeLeft(totalMatchTime);
    setTurnTimeLeft(DIFFICULTY_CONFIG[difficulty].turnTime);
    setInputWord('');
    setGameState('playing');

    toast({
      title: lobbyMode === 'solo' ? '🐍 Solo Vocab Snake Started!' : `🐍 Room ${roomCode} Started!`,
      description: `First word is "${initialWord.toUpperCase()}". Next word must start with "${initialWord.slice(-1).toUpperCase()}"!`
    });
  }, [user, lobbyMode, playerCount, selectedTheme, totalMatchTime, difficulty, roomCode, toast]);

  // ─── Join Game Room via Code ───
  const handleJoinRoom = () => {
    const code = joinInputCode.trim().toUpperCase();
    const name = joinPlayerName.trim() || user?.displayName || 'Joined Student';

    if (!code) {
      toast({ variant: 'destructive', title: 'Room Code Required', description: 'Please enter a valid room code (e.g. VS-9800).' });
      return;
    }

    const formattedCode = code.startsWith('VS-') ? code : `VS-${code}`;
    setRoomCode(formattedCode);

    const avatars = ['🦊', '🦉', '🦁', '🐯', '🦄', '🐼'];
    const joinedPlayer: Player = {
      id: `p-joined-${Date.now()}`,
      name: `${name} (Joined)`,
      score: 0,
      wordCount: 0,
      isPassed: false,
      warningsCount: 0,
      avatar: avatars[Math.floor(Math.random() * avatars.length)]
    };

    const hostPlayer: Player = {
      id: 'p-host-1',
      name: 'Room Host Teacher',
      score: 0,
      wordCount: 0,
      isPassed: false,
      warningsCount: 0,
      avatar: '👑'
    };

    const roomPlayers = [hostPlayer, joinedPlayer];

    const themePool = THEME_CATEGORIES[selectedTheme]?.words || THEME_CATEGORIES.general.words;
    const initialWord = themePool[Math.floor(Math.random() * themePool.length)];

    const firstChainItem: ChainItem = {
      id: 'initial-joined-1',
      word: initialWord,
      playerId: 'system',
      playerName: 'Starting Word',
      points: 0,
      startLetter: initialWord.charAt(0).toUpperCase(),
      endLetter: initialWord.charAt(initialWord.length - 1).toUpperCase()
    };

    setPlayers(roomPlayers);
    setCurrentTurnIndex(0);
    setWordChain([firstChainItem]);
    setUsedWords(new Set([initialWord.toLowerCase()]));
    setMatchTimeLeft(totalMatchTime);
    setTurnTimeLeft(DIFFICULTY_CONFIG[difficulty].turnTime);
    setInputWord('');
    setGameState('playing');

    toast({
      title: `🎮 Joined Room ${formattedCode}!`,
      description: `Welcome ${name}! Starting word is "${initialWord.toUpperCase()}".`
    });
  };

  // ─── Advance Turn / Pass Logic ───
  const advanceTurn = useCallback(() => {
    setInputWord('');
    setTurnTimeLeft(DIFFICULTY_CONFIG[difficulty].turnTime);

    if (lobbyMode === 'solo') {
      // In solo mode, passing or resetting draws a new random starting word for the player
      const themePool = THEME_CATEGORIES[selectedTheme]?.words || THEME_CATEGORIES.general.words;
      const availableWords = themePool.filter(w => !usedWords.has(w.toLowerCase()));
      const newWord = (availableWords.length > 0 ? availableWords : themePool)[Math.floor(Math.random() * (availableWords.length || themePool.length))];

      const newChainItem: ChainItem = {
        id: `solo-reset-${Date.now()}`,
        word: newWord,
        playerId: 'system',
        playerName: 'New Chain Start',
        points: 0,
        startLetter: newWord.charAt(0).toUpperCase(),
        endLetter: newWord.charAt(newWord.length - 1).toUpperCase()
      };

      setWordChain(prev => [...prev, newChainItem]);
      setUsedWords(prev => new Set([...prev, newWord.toLowerCase()]));
      toast({
        title: '🔀 New Starting Word Drawn!',
        description: `New starting word is "${newWord.toUpperCase()}". Target letter: "${newWord.slice(-1).toUpperCase()}"`
      });
    } else {
      setCurrentTurnIndex(prev => (prev + 1) % players.length);
    }
  }, [difficulty, lobbyMode, selectedTheme, usedWords, players.length, toast]);

  // ─── Handle Match & Turn Timers ───
  useEffect(() => {
    if (gameState !== 'playing') return;

    matchTimerRef.current = setInterval(() => {
      setMatchTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(matchTimerRef.current!);
          setGameState('ended');
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          playSoundEffect('correct');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    };
  }, [gameState, playSoundEffect]);

  // Individual Turn Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    turnTimerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          playSoundEffect('pass');
          toast({
            variant: 'destructive',
            title: lobbyMode === 'solo' ? '⏳ Word Timer Expired!' : `⏳ Turn Expired for ${activePlayer?.name}!`,
            description: lobbyMode === 'solo' ? 'Drawing new starting word...' : 'Passing turn to the next player.'
          });
          advanceTurn();
          return DIFFICULTY_CONFIG[difficulty].turnTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    };
  }, [gameState, activePlayer, advanceTurn, difficulty, lobbyMode, playSoundEffect, toast]);

  // ─── Anti-Cheat Detection ───
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleVisibilityChange = () => {
      if (document.hidden && activePlayer) {
        setPlayers(prev => prev.map((p, idx) =>
          idx === currentTurnIndex ? { ...p, warningsCount: p.warningsCount + 1 } : p
        ));
        toast({
          variant: 'destructive',
          title: '⚠️ Anti-Cheat Warning!',
          description: 'Tab switching / leaving the game window is recorded in your match stats.'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameState, activePlayer, currentTurnIndex, toast]);

  // ─── Handle Word Submission ───
  const handleWordSubmit = (submittedWord?: string) => {
    const rawWord = (submittedWord || inputWord).trim().toLowerCase();
    if (!rawWord || !activePlayer || gameState !== 'playing') return;

    const config = DIFFICULTY_CONFIG[difficulty];
    const lastWord = wordChain[wordChain.length - 1]?.word.toLowerCase() || '';
    const requiredStartLetter = lastWord.slice(-1);

    if (rawWord.charAt(0) !== requiredStartLetter) {
      playSoundEffect('wrong');
      toast({
        variant: 'destructive',
        title: 'Invalid Start Letter!',
        description: `Your word must start with letter "${requiredStartLetter.toUpperCase()}".`
      });
      return;
    }

    if (rawWord.length < config.minLength) {
      playSoundEffect('wrong');
      toast({
        variant: 'destructive',
        title: 'Word Too Short!',
        description: `Words in ${config.name} mode must be at least ${config.minLength} letters long.`
      });
      return;
    }

    if (usedWords.has(rawWord)) {
      playSoundEffect('wrong');
      toast({
        variant: 'destructive',
        title: 'Word Already Used!',
        description: `"${rawWord.toUpperCase()}" has already been played in this snake chain.`
      });
      return;
    }

    const categoryInfo = THEME_CATEGORIES[selectedTheme];
    if (selectedTheme !== 'general' && categoryInfo) {
      const isThemeMatch = categoryInfo.words.some(w => w.toLowerCase() === rawWord);
      if (!isThemeMatch) {
        playSoundEffect('wrong');
        toast({
          variant: 'destructive',
          title: 'Theme Mismatch!',
          description: `"${rawWord.toUpperCase()}" does not fit the selected theme (${categoryInfo.label}).`
        });
        return;
      }
    }

    const timeBonus = Math.max(1, Math.floor(turnTimeLeft / 2));
    const wordPoints = Math.round((rawWord.length * 10 + timeBonus * 5) * config.bonusMult);

    const newChainItem: ChainItem = {
      id: `chain-${Date.now()}`,
      word: rawWord,
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      points: wordPoints,
      startLetter: rawWord.charAt(0).toUpperCase(),
      endLetter: rawWord.charAt(rawWord.length - 1).toUpperCase()
    };

    setWordChain(prev => [...prev, newChainItem]);
    setUsedWords(prev => new Set([...prev, rawWord]));

    setPlayers(prev => prev.map((p, idx) =>
      idx === currentTurnIndex
        ? { ...p, score: p.score + wordPoints, wordCount: p.wordCount + 1 }
        : p
    ));

    playSoundEffect('correct');
    toast({
      title: `✨ +${wordPoints} Pts! (${rawWord.toUpperCase()})`,
      description: `Connected "${rawWord.toUpperCase()}". Next letter: "${rawWord.slice(-1).toUpperCase()}"`
    });

    advanceTurn();
  };

  const sortedLeaderboard = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full min-h-screen relative overflow-hidden bg-gradient-to-br from-zinc-950 via-emerald-950/30 to-teal-950/60 p-4 sm:p-8 flex flex-col items-center justify-center transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 p-6 overflow-y-auto min-h-screen bg-zinc-950"
      )}
    >
      {/* Ambient Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950/80 to-zinc-950 pointer-events-none" />

      {/* Navigation & Fullscreen Header Bar */}
      <div className="w-full max-w-[1380px] flex justify-between items-center gap-4 mb-6 relative z-30 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/games')}
            variant="outline"
            className="bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white rounded-2xl h-11 px-5 backdrop-blur-md transition-all hover:scale-105 shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Games Hub</span>
          </Button>

          {gameState === 'playing' && (
            <Button
              onClick={() => {
                if (confirm('Are you sure you want to leave the active match and return to the lobby?')) {
                  setGameState('lobby');
                }
              }}
              variant="ghost"
              className="bg-rose-950/50 border border-rose-500/40 text-rose-300 hover:bg-rose-900/70 rounded-2xl h-11 px-4 backdrop-blur-md text-xs font-bold uppercase"
            >
              <Home className="h-4 w-4 mr-2" /> Leave Match
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            className="bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white rounded-2xl h-11 px-4 backdrop-blur-md"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400 mr-2" /> : <VolumeX className="h-4 w-4 text-zinc-500 mr-2" />}
            <span className="text-xs font-bold uppercase">{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </Button>
          <Button
            onClick={toggleFullscreen}
            className="bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-extrabold rounded-2xl h-11 px-5 shadow-lg shadow-emerald-950/50 backdrop-blur-md transition-all hover:scale-105"
          >
            {isFullscreen ? <Minimize className="h-4 w-4 text-emerald-400 mr-2" /> : <Maximize className="h-4 w-4 text-emerald-400 mr-2" />}
            <span className="text-xs tracking-wider uppercase">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}</span>
          </Button>
        </div>
      </div>

      {/* ─── LOBBY VIEW ─── */}
      {gameState === 'lobby' && (
        <div className="w-full max-w-[1380px] mx-auto space-y-8 relative z-20">
          
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 bg-gradient-to-r from-emerald-950/80 via-teal-900/80 to-cyan-950/80 p-8 sm:p-10 rounded-3xl border border-emerald-500/40 shadow-2xl relative overflow-hidden backdrop-blur-2xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl pointer-events-none">🐍</div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-4 py-1.5 font-bold text-xs uppercase tracking-widest">
              Word Chain Arena
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight italic flex items-center justify-center gap-4">
              <span>🐍 Vocab Snake</span>
            </h1>
            <p className="text-emerald-200/90 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Take turns connecting words in an endless snake chain! Each new word must start with the final letter of the previous word.
            </p>

            {/* Mode Switcher: Solo vs Host vs Join Room */}
            <div className="pt-4 flex justify-center gap-3 sm:gap-4 flex-wrap">
              <button
                onClick={() => setLobbyMode('solo')}
                className={cn(
                  "px-6 sm:px-8 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition-all border flex items-center gap-2 shadow-lg",
                  lobbyMode === 'solo'
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-emerald-600/30 scale-105"
                    : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                )}
              >
                👤 Solo Player Mode
              </button>
              <button
                onClick={() => setLobbyMode('host')}
                className={cn(
                  "px-6 sm:px-8 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition-all border flex items-center gap-2 shadow-lg",
                  lobbyMode === 'host'
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400 shadow-amber-600/30 scale-105"
                    : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                )}
              >
                👑 Create Room (Host)
              </button>
              <button
                onClick={() => setLobbyMode('join')}
                className={cn(
                  "px-6 sm:px-8 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition-all border flex items-center gap-2 shadow-lg",
                  lobbyMode === 'join'
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-indigo-600/30 scale-105"
                    : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                )}
              >
                🎮 Join Room with Code
              </button>
            </div>
          </motion.div>

          {/* ── MODE 1: SOLO PLAYER & MULTIPLAYER HOST SETUP ── */}
          {(lobbyMode === 'solo' || lobbyMode === 'host') && (
            <>
              {lobbyMode === 'host' && (
                <div className="flex justify-center items-center">
                  <div className="bg-zinc-950/90 border border-emerald-500/40 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
                    <span className="text-xs text-emerald-400 font-black uppercase tracking-wider">Generated Room Code:</span>
                    <span className="text-2xl font-black tracking-widest text-emerald-200">{roomCode}</span>
                    <Button size="icon" variant="ghost" onClick={copyRoomCode} className="h-9 w-9 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-xl">
                      {copiedCode ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Configuration Options */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-6 bg-zinc-950/80 border-zinc-800 backdrop-blur-2xl p-7 rounded-3xl space-y-6 shadow-2xl">
                  <h3 className="text-xl font-black text-white flex items-center gap-2.5 border-b border-zinc-800 pb-3">
                    <Zap className="h-6 w-6 text-emerald-400" /> Difficulty & Match Settings
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300 font-extrabold uppercase tracking-wider block">Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['easy', 'medium', 'hard'] as const).map(level => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={cn(
                            'py-4 px-3 rounded-2xl text-sm font-extrabold capitalize transition-all border text-center',
                            difficulty === level
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-600/30 scale-[1.02]'
                              : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                          )}
                        >
                          {level}
                          <span className="block text-xs opacity-75 font-normal mt-1">
                            {DIFFICULTY_CONFIG[level].minLength}+ letters ({DIFFICULTY_CONFIG[level].turnTime}s)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-300 font-extrabold uppercase tracking-wider block">Total Match Duration</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[180, 240, 300].map(seconds => (
                        <button
                          key={seconds}
                          onClick={() => setTotalMatchTime(seconds)}
                          className={cn(
                            'py-3.5 px-4 rounded-2xl text-sm font-extrabold transition-all border',
                            totalMatchTime === seconds
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                              : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                          )}
                        >
                          {seconds / 60} Minutes
                        </button>
                      ))}
                    </div>
                  </div>

                  {lobbyMode === 'host' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-zinc-300 font-extrabold uppercase tracking-wider">Human Players (Multiplayer Roster)</label>
                        <span className="font-black text-emerald-400 text-xl bg-emerald-950/80 px-4 py-1 rounded-xl border border-emerald-500/30">
                          {playerCount} Players
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={8}
                        value={playerCount}
                        onChange={(e) => setPlayerCount(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-3 rounded-lg bg-zinc-900"
                      />
                    </div>
                  )}
                </Card>

                <Card className="lg:col-span-6 bg-zinc-950/80 border-zinc-800 backdrop-blur-2xl p-7 rounded-3xl space-y-5 shadow-2xl">
                  <h3 className="text-xl font-black text-white flex items-center gap-2.5 border-b border-zinc-800 pb-3">
                    <BookOpen className="h-6 w-6 text-teal-400" /> Category & Theme Mode
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                    {Object.entries(THEME_CATEGORIES).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTheme(key)}
                        className={cn(
                          'p-4 rounded-2xl border text-left transition-all flex items-center gap-4',
                          selectedTheme === key
                            ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-emerald-500 text-white shadow-lg'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
                        )}
                      >
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-extrabold leading-tight">{item.label}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{item.words.length} vocabulary words</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="pt-4 text-center">
                <Button
                  onClick={startNewGame}
                  className="w-full sm:w-auto px-20 h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-xl rounded-2xl shadow-2xl shadow-emerald-500/30 transform transition duration-300 hover:scale-105"
                >
                  <Play className="h-6 w-6 fill-current mr-3" />
                  {lobbyMode === 'solo' ? 'Start Solo Game Match' : 'Start Vocab Snake Room Match'}
                </Button>
              </div>
            </>
          )}

          {/* ── MODE 2: JOIN ROOM WITH CODE ── */}
          {lobbyMode === 'join' && (
            <Card className="max-w-2xl mx-auto bg-zinc-950/90 border-indigo-500/40 p-8 sm:p-10 rounded-3xl space-y-6 shadow-2xl backdrop-blur-2xl">
              <div className="text-center space-y-2">
                <div className="inline-block p-4 bg-indigo-500/20 rounded-full border border-indigo-500/40 text-indigo-300 mb-1">
                  <LogIn className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-white italic tracking-tight">Join Active Game Room</h3>
                <p className="text-zinc-400 text-sm">Enter the Room Code generated by your teacher or classmate host.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider block mb-2">
                    Room Code (e.g. VS-9800)
                  </label>
                  <Input
                    value={joinInputCode}
                    onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                    placeholder="VS-9800"
                    className="h-16 bg-zinc-900 border-zinc-800 text-white font-mono text-2xl font-black tracking-widest text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider block mb-2">
                    Your Player Nickname
                  </label>
                  <Input
                    value={joinPlayerName}
                    onChange={(e) => setJoinPlayerName(e.target.value)}
                    placeholder={user?.displayName || "Student Name"}
                    className="h-14 bg-zinc-900 border-zinc-800 text-white font-bold text-lg rounded-2xl px-5"
                  />
                </div>
              </div>

              <div className="pt-4 text-center">
                <Button
                  onClick={handleJoinRoom}
                  className="w-full h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xl rounded-2xl shadow-2xl shadow-indigo-500/30 transform transition duration-300 hover:scale-105"
                >
                  <UserPlus className="h-6 w-6 mr-3" /> Enter Room & Join Match
                </Button>
              </div>
            </Card>
          )}

        </div>
      )}

      {/* ─── END GAME VIEW ─── */}
      {gameState === 'ended' && (
        <div className="w-full max-w-[1100px] mx-auto p-4 space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4 bg-gradient-to-b from-amber-950/80 via-zinc-950 to-zinc-950 border border-amber-500/40 p-10 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden"
          >
            <div className="inline-block p-4 bg-amber-500/20 rounded-full border border-amber-500/40 text-amber-400 mb-2">
              <Trophy className="h-14 w-14 animate-bounce" />
            </div>
            <h2 className="text-5xl font-black text-white italic tracking-tight uppercase">Game Over!</h2>
            <p className="text-zinc-300 text-base">Match timer expired. Here are your final game results!</p>

            {/* Winner Banner */}
            {sortedLeaderboard[0] && (
              <div className="bg-gradient-to-r from-amber-500/30 via-amber-400/40 to-amber-500/30 border border-amber-400/50 p-6 rounded-3xl max-w-lg mx-auto shadow-xl">
                <Crown className="h-10 w-10 text-amber-400 mx-auto mb-1 animate-pulse" />
                <p className="text-xs font-black text-amber-300 uppercase tracking-widest">
                  {lobbyMode === 'solo' ? '🏆 Solo Match Result' : '🏆 1st Place Winner'}
                </p>
                <h3 className="text-3xl font-black text-white">{sortedLeaderboard[0].name}</h3>
                <p className="text-amber-200 font-extrabold text-xl mt-1">
                  {sortedLeaderboard[0].score} Pts · {sortedLeaderboard[0].wordCount} Words Played
                </p>
              </div>
            )}
          </motion.div>

          {/* Final Standings */}
          <Card className="bg-zinc-950/80 border-zinc-800 p-8 rounded-3xl backdrop-blur-2xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-white text-xl font-black flex items-center gap-2">
                <Medal className="h-6 w-6 text-amber-400" /> Final Scoreboard Standings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {sortedLeaderboard.map((p, rank) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center justify-between p-5 rounded-2xl border transition-all',
                    rank === 0
                      ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                      : rank === 1
                      ? 'bg-zinc-800/50 border-zinc-400/40 text-zinc-200'
                      : rank === 2
                      ? 'bg-orange-950/40 border-orange-500/40 text-orange-200'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-black text-xl w-8 text-center">
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                    </span>
                    <span className="text-3xl">{p.avatar}</span>
                    <div>
                      <p className="font-extrabold text-base text-white">{p.name}</p>
                      <p className="text-xs text-zinc-400">{p.wordCount} words submitted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xl text-emerald-400">{p.score} Pts</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 pt-2">
            <Button
              onClick={() => setGameState('lobby')}
              className="px-10 h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl text-base"
            >
              <RotateCcw className="h-5 w-5 mr-2" /> Back to Lobby
            </Button>
            <Button
              onClick={startNewGame}
              className="px-10 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-base"
            >
              <Play className="h-5 w-5 mr-2" /> Play Again
            </Button>
          </div>
        </div>
      )}

      {/* ─── MAIN ACTIVE MATCH VIEW ─── */}
      {gameState === 'playing' && (
        <div className="w-full max-w-[1380px] mx-auto space-y-6 relative z-20">

          {/* Top Header Controls & Match Timer */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-800 p-5 rounded-3xl backdrop-blur-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🐍</span>
              <div>
                <h2 className="text-xl font-black text-white italic tracking-tight">Vocab Snake Arena</h2>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/40 capitalize font-bold">
                    {difficulty} Mode
                  </Badge>
                  <span>•</span>
                  <span className="capitalize">{THEME_CATEGORIES[selectedTheme]?.label || 'General'}</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-bold uppercase">{lobbyMode === 'solo' ? 'Solo Mode' : 'Multiplayer'}</span>
                </div>
              </div>
            </div>

            {/* Overall Match Timer */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-indigo-950/80 border border-indigo-500/40 px-5 py-2.5 rounded-2xl">
                <Clock className="h-5 w-5 text-indigo-400 animate-spin" />
                <div>
                  <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider">Match Time</p>
                  <p className="text-lg font-black text-white font-mono">
                    {Math.floor(matchTimeLeft / 60)}:{String(matchTimeLeft % 60).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Visual Snake Chain & Turn Control (8 cols) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Active Turn Header Indicator */}
              <Card className="bg-gradient-to-r from-emerald-950/60 via-zinc-950 to-teal-950/60 border-emerald-500/40 p-6 rounded-3xl relative overflow-hidden backdrop-blur-2xl shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <span className="text-5xl">{activePlayer?.avatar}</span>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-ping" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        🟢 Active Player Turn
                      </p>
                      <h3 className="text-2xl font-black text-white">{activePlayer?.name}</h3>
                    </div>
                  </div>

                  {/* Turn Countdown Timer */}
                  <div className="flex items-center gap-3 bg-zinc-900/90 px-5 py-2.5 rounded-2xl border border-zinc-800">
                    <Clock className="h-6 w-6 text-amber-400" />
                    <div>
                      <p className="text-[10px] text-zinc-400 font-extrabold uppercase">Turn Timer</p>
                      <p className={cn("text-xl font-black font-mono", turnTimeLeft <= 5 ? "text-rose-400 animate-bounce" : "text-amber-300")}>
                        {turnTimeLeft}s
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Dynamic Visual Snake Chain View */}
              <Card className="bg-zinc-950/80 border-zinc-800 p-7 rounded-3xl space-y-4 backdrop-blur-2xl shadow-xl">
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    🐍 Connected Word Snake ({wordChain.length} Words)
                  </h3>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-sm py-1 px-3">
                    Target Letter: <span className="text-lg font-black text-emerald-400 ml-1">{currentTargetLetter || '?'}</span>
                  </Badge>
                </div>

                {/* Scrollable Visual Snake Stream */}
                <div className="flex items-center gap-4 overflow-x-auto p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800/80 min-h-[130px] scrollbar-thin scrollbar-thumb-zinc-700">
                  {wordChain.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                          'flex-shrink-0 p-4 rounded-2xl border text-center relative font-mono shadow-lg',
                          idx === wordChain.length - 1
                            ? 'bg-gradient-to-br from-emerald-950/90 to-teal-900/90 border-emerald-400 text-white shadow-emerald-500/20'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        )}
                      >
                        <p className="text-xs text-zinc-400 font-bold mb-1 truncate max-w-[120px]">{item.playerName}</p>
                        <p className="text-lg font-black tracking-wider uppercase">
                          <span className="text-emerald-400 font-extrabold">{item.startLetter}</span>
                          {item.word.slice(1, -1)}
                          <span className="text-amber-400 font-extrabold">{item.endLetter}</span>
                        </p>
                        {item.points > 0 && (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                            +{item.points} pts
                          </span>
                        )}
                      </motion.div>
                      {idx < wordChain.length - 1 && (
                        <ArrowRight className="h-5 w-5 text-emerald-500 flex-shrink-0 opacity-70" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </Card>

              {/* Turn Input & Controls */}
              <Card className="bg-zinc-950/80 border-zinc-800 p-7 rounded-3xl space-y-4 relative overflow-hidden backdrop-blur-2xl shadow-xl">
                <div className="space-y-4">
                  <label className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Enter Next Word (Must Start With &quot;<span className="text-emerald-400 font-black">{currentTargetLetter}</span>&quot;)</span>
                    <span className="text-[11px] text-rose-400 flex items-center gap-1 font-bold">
                      <ShieldAlert className="h-3.5 w-3.5" /> Anti-Cheat Active (No Paste / Tab Switch)
                    </span>
                  </label>

                  <div className="flex gap-4">
                    <Input
                      ref={inputRef}
                      value={inputWord}
                      onChange={(e) => setInputWord(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleWordSubmit()}
                      onPaste={(e) => {
                        e.preventDefault();
                        toast({
                          variant: 'destructive',
                          title: '⛔ Paste Blocked!',
                          description: 'Copy-pasting is disabled in Vocab Snake.'
                        });
                      }}
                      placeholder={`Type word starting with '${currentTargetLetter}'...`}
                      className="h-16 bg-zinc-900 border-zinc-800 text-white text-xl font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl px-5"
                      autoFocus
                    />
                    <Button
                      onClick={() => handleWordSubmit()}
                      className="h-16 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-600/30"
                    >
                      Submit
                    </Button>
                    <Button
                      onClick={() => {
                        playSoundEffect('pass');
                        advanceTurn();
                      }}
                      variant="outline"
                      className="h-16 px-5 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-2xl"
                      title={lobbyMode === 'solo' ? 'Draw new starting word' : 'Pass turn to next player'}
                    >
                      <SkipForward className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Live Leaderboard & Player Monitor (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-zinc-950/80 border-zinc-800 p-6 rounded-3xl space-y-5 backdrop-blur-2xl shadow-xl">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" /> Match Leaderboard
                  </span>
                  <span className="text-xs text-emerald-400 font-extrabold">{players.length} Player{players.length > 1 ? 's' : ''}</span>
                </h3>

                {/* Leaderboard List */}
                <div className="space-y-3">
                  {sortedLeaderboard.map((player, idx) => {
                    const isActiveTurn = players[currentTurnIndex]?.id === player.id;
                    return (
                      <div
                        key={player.id}
                        className={cn(
                          'p-4 rounded-2xl border transition-all flex items-center justify-between',
                          isActiveTurn
                            ? 'bg-emerald-950/60 border-emerald-500/70 shadow-lg shadow-emerald-500/20'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-zinc-500 w-6 text-center">
                            {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </span>
                          <span className="text-2xl">{player.avatar}</span>
                          <div>
                            <p className="font-extrabold text-sm text-white flex items-center gap-1.5">
                              {player.name}
                              {isActiveTurn && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />}
                            </p>
                            <p className="text-xs text-zinc-400">{player.wordCount} words played</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-base text-emerald-400">{player.score} Pts</p>
                          {player.warningsCount > 0 && (
                            <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {player.warningsCount} Warn
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Rules Box */}
              <Card className="bg-zinc-950/50 border-zinc-800 p-5 rounded-3xl text-xs space-y-2 text-zinc-400 backdrop-blur-xl">
                <h4 className="font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-indigo-400" /> Vocab Snake Rules
                </h4>
                <ul className="space-y-1.5 text-xs list-disc list-inside text-zinc-400 leading-relaxed">
                  <li>Next word must start with the final letter of the previous word.</li>
                  <li>No duplicate words allowed in a single session.</li>
                  <li>In Solo mode, passing draws a new starting word to build on.</li>
                  <li>Tab switching / pasting triggers anti-cheat warning logs.</li>
                </ul>
              </Card>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
