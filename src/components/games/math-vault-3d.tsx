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
  ArrowLeft,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Trash2,
  Users,
  User,
  Clock,
  Play,
  Gamepad2,
  Volume2,
  VolumeX,
  ShieldCheck,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronRight,
  Activity,
  Sliders
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';
import confetti from 'canvas-confetti';

type GameState = 'idle' | 'instructions' | 'playing' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';
type MultiplayerState = 'mode_select' | 'create_room' | 'join_room' | 'lobby' | 'playing' | 'finished';

interface MathProblem {
  q: string;
  a: number | string;
  choices: (number | string)[];
}

const BACKGROUND_FLOATS = [
  { char: '+', left: '6%', size: '24px', duration: '12s', delay: '0s' },
  { char: '−', left: '18%', size: '26px', duration: '14s', delay: '3s' },
  { char: '×', left: '82%', size: '22px', duration: '11s', delay: '1s' },
  { char: '÷', left: '94%', size: '28px', duration: '15s', delay: '5s' },
  { char: '=', left: '12%', size: '30px', duration: '13s', delay: '6s' },
  { char: '√', left: '76%', size: '32px', duration: '16s', delay: '2s' },
  { char: 'π', left: '28%', size: '24px', duration: '10s', delay: '4s' },
  { char: '∑', left: '88%', size: '28px', duration: '17s', delay: '7s' },
  { char: '∫', left: '4%', size: '30px', duration: '18s', delay: '2.5s' },
  { char: 'x²', left: '65%', size: '24px', duration: '13s', delay: '5.5s' },
  { char: '∞', left: '38%', size: '26px', duration: '15s', delay: '1.5s' },
];

export function MathVault3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  // Classic Singleplayer vs Multiplayer state
  const [gameMode, setGameMode] = React.useState<'single' | 'multi'>('single');
  const [multiplayerState, setMultiplayerState] = React.useState<MultiplayerState>('mode_select');

  // Unified Game progress states
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('medium');
  const [roundsCount, setRoundsCount] = React.useState<number>(8);
  const [solvedCount, setSolvedCount] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [particles, setParticles] = React.useState<any[]>([]);
  const [usedQuestions, setUsedQuestions] = React.useState<string[]>([]);

  // Sound & Streak & Preview States
  const [isMuted, setIsMuted] = React.useState(false);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Upgraded Multiple Choice Selection states
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | string | null>(null);
  const [hasAnswered, setHasAnswered] = React.useState(false);
  const [singleQuestions, setSingleQuestions] = React.useState<MathProblem[]>([]);

  // Web Audio SFX Engine
  const playSfx = React.useCallback((type: 'click' | 'correct' | 'wrong' | 'door' | 'win') => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'correct') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.15, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.2);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.18);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'door') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'win') {
        [440, 554.37, 659.25, 880, 1108.7].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.2, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.32);
        });
      }
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  }, [isMuted]);

  // Multiplayer Room states
  const [myUid, setMyUid] = React.useState<string>('');
  const [nickname, setNickname] = React.useState<string>('');
  const [roomCode, setRoomCode] = React.useState<string>('');
  const [isHost, setIsHost] = React.useState<boolean>(false);
  const [roomData, setRoomData] = React.useState<any>(null);

  const [roomPlayers, setRoomPlayers] = React.useState<any[]>([]);
  const [codeVal, setCodeVal] = React.useState<string>('');
  const [questionMode, setQuestionMode] = React.useState<'auto' | 'custom'>('auto');
  const [customQuestions, setCustomQuestions] = React.useState<any[]>([{ q: '', choices: ['', '', '', ''], correctIndex: 0 }]);
  const [isEditingQuestions, setIsEditingQuestions] = React.useState<boolean>(false);

  // Local Toast notification state (visible in Fullscreen mode)
  const [localToast, setLocalToast] = React.useState<{ title: string; description: string; variant?: 'default' | 'destructive' } | null>(null);

  const { user, userProfile } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  const isCreator = React.useMemo(() => {
    if (gameMode !== 'multi') return false;
    return roomData && roomData.hostId && myUid ? roomData.hostId === myUid : isHost;
  }, [gameMode, roomData, myUid, isHost]);

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

  const showLocalToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    setLocalToast({ title, description, variant });
    setTimeout(() => {
      setLocalToast(null);
    }, 4500);
  };

  // Sync profile/auth nickname
  React.useEffect(() => {
    if (user) {
      const name = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || '';
      setNickname(name);
    } else {
      setNickname(`Player_${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [user, userProfile]);

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

  // Session Recovery
  React.useEffect(() => {
    if (typeof window === 'undefined' || !firestore) return;
    
    const savedRoom = sessionStorage.getItem("lingoland_active_roomCode_math-vault-3d");
    const savedUid = sessionStorage.getItem("lingoland_active_myUid_math-vault-3d");
    const savedMode = sessionStorage.getItem("lingoland_active_gameMode_math-vault-3d");
    
    if (savedRoom && savedUid && savedMode === 'multi') {
      const roomRef = doc(firestore, "stats", "mv_room_" + savedRoom);
      getDoc(roomRef).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.players && data.players[savedUid] && data.status !== 'disbanded' && data.status !== 'finished') {
            setMyUid(savedUid);
            setRoomCode(savedRoom);
            setGameMode('multi');
            
            const playerObj = data.players[savedUid];
            if (playerObj.name) {
              setNickname(playerObj.name);
            }
            setIsHost(data.hostId === savedUid);
            
            if (data.status === 'lobby') {
              setMultiplayerState('lobby');
              setGameState('playing');
            } else if (data.status === 'playing') {
              const solved = playerObj.solvedCount || 0;
              const savedScore = playerObj.score || 0;
              setSolvedCount(solved);
              setMultiplayerState('playing');
              setGameState('playing');
              setIsOpen(false);
              setSelectedAnswer(null);
              setHasAnswered(false);
            }
            
            showLocalToast(
              "Reconnected 🎮",
              `Resumed active session in room ${savedRoom}.`,
              "default"
            );
            return;
          }
        }
        sessionStorage.removeItem("lingoland_active_roomCode_math-vault-3d");
        sessionStorage.removeItem("lingoland_active_myUid_math-vault-3d");
        sessionStorage.removeItem("lingoland_active_gameMode_math-vault-3d");
      }).catch((err) => {
        console.warn("Session recovery failed:", err);
      });
    }
  }, [firestore]);

  // Sync Room Updates in Lobby and Play (Multiplayer)
  React.useEffect(() => {
    if (!firestore || !roomCode || gameMode !== 'multi') return;
    
    // Using stats collection with room prefix to bypass rules limitations
    const roomRef = doc(firestore, "stats", "mv_room_" + roomCode);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        showLocalToast(
          "Room Disbanded 🚨",
          "The host has closed this room.",
          "destructive"
        );
        resetMultiplayerState();
        return;
      }
      
      const data = snapshot.data();
      setRoomData(data);
      
      const list = Object.values(data.players || {}) as any[];
      setRoomPlayers(list);
      
      if (data.difficulty) setDifficulty(data.difficulty as Difficulty);
      if (data.roundsCount) setRoundsCount(data.roundsCount);
      if (data.questionMode) setQuestionMode(data.questionMode);
      if (data.customQuestions && !isEditingQuestions) {
        setCustomQuestions(data.customQuestions);
      }
      
      // Check if room was disbanded via status
      if (data.status === 'disbanded') {
        showLocalToast(
          "Room Disbanded 🚨",
          "The host has disbanded the game.",
          "destructive"
        );
        resetMultiplayerState();
        return;
      }

      // Auto-transition playing states
      if (data.status === 'playing' && multiplayerState === 'lobby') {
        setMultiplayerState('playing');
        setSolvedCount(0);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setIsOpen(false);
      }
      
      if (data.status === 'finished' && multiplayerState !== 'finished') {
        setMultiplayerState('finished');
      }
    }, (error) => {
      console.error("Firestore math vault rooms snapshot error:", error);
    });
    
    return () => unsubscribe();
  }, [firestore, roomCode, gameMode, multiplayerState, isEditingQuestions]);

  // Celebrate with Confetti for the Winner
  React.useEffect(() => {
    if (multiplayerState === 'finished' && roomPlayers.length > 0) {
      const sorted = [...roomPlayers].sort((a, b) => b.score - a.score);
      const winner = sorted[0];
      if (winner && winner.uid === myUid) {
        const end = Date.now() + (4 * 1000);
        const interval = setInterval(() => {
          if (Date.now() > end) return clearInterval(interval);
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { x: Math.random(), y: Math.random() - 0.2 }
          });
        }, 250);
      }
    }
  }, [multiplayerState, roomPlayers, myUid]);

  // Choice generator (creates 3 close plausible distractors)
  const generateChoices = (answer: number): number[] => {
    const choicesSet = new Set<number>([answer]);
    const offsets = Math.abs(answer) > 20 
      ? [-20, -10, -5, -2, -1, 1, 2, 5, 10, 20] 
      : [-3, -2, -1, 1, 2, 3, 5, 10];
    
    let attempts = 0;
    while (choicesSet.size < 4 && attempts < 100) {
      const randomOffset = offsets[Math.floor(Math.random() * offsets.length)];
      const choice = answer + randomOffset;
      if (choice >= 0) {
        choicesSet.add(choice);
      }
      attempts++;
    }
    
    let fallback = 1;
    while (choicesSet.size < 4) {
      if (answer - fallback >= 0) {
        choicesSet.add(answer - fallback);
      }
      choicesSet.add(answer + fallback);
      fallback++;
    }
    
    return Array.from(choicesSet).sort(() => Math.random() - 0.5);
  };

  // Expanded dynamic equation generator (Easy, Medium, Hard categories)
  const generateMath = (diff: Difficulty): MathProblem => {
    let q = '';
    let a = 0;
    
    if (diff === 'easy') {
      const types = ['arithmetic', 'triple', 'algebra', 'double_half'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      if (type === 'arithmetic') {
        const isAdd = Math.random() > 0.5;
        if (isAdd) {
          const num1 = Math.floor(Math.random() * 20) + 1;
          const num2 = Math.floor(Math.random() * 20) + 1;
          q = `${num1} + ${num2}`;
          a = num1 + num2;
        } else {
          const num1 = Math.floor(Math.random() * 20) + 5;
          const num2 = Math.floor(Math.random() * num1) + 1;
          q = `${num1} − ${num2}`;
          a = num1 - num2;
        }
      } else if (type === 'triple') {
        const num1 = Math.floor(Math.random() * 8) + 1;
        const num2 = Math.floor(Math.random() * 8) + 1;
        const num3 = Math.floor(Math.random() * 8) + 1;
        q = `${num1} + ${num2} + ${num3}`;
        a = num1 + num2 + num3;
      } else if (type === 'algebra') {
        const xVal = Math.floor(Math.random() * 9) + 1;
        const offset = Math.floor(Math.random() * 7) + 1;
        const isAdd = Math.random() > 0.5;
        if (isAdd) {
          q = `x + ${offset} = ${xVal + offset}  (Find x)`;
          a = xVal;
        } else {
          q = `x − ${offset} = ${xVal}  (Find x)`;
          a = xVal + offset;
        }
      } else { // double_half
        const num = (Math.floor(Math.random() * 8) + 1) * 2;
        const isDouble = Math.random() > 0.5;
        if (isDouble) {
          q = `Double of ${num / 2}`;
          a = num;
        } else {
          q = `Half of ${num}`;
          a = num / 2;
        }
      }
    } 
    else if (diff === 'medium') {
      const types = ['arithmetic', 'pemdas', 'algebra', 'square_root', 'percentage'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      if (type === 'arithmetic') {
        const ops = ['+', '-', 'x', '/'];
        const operator = ops[Math.floor(Math.random() * ops.length)];
        if (operator === '+') {
          const num1 = Math.floor(Math.random() * 40) + 15;
          const num2 = Math.floor(Math.random() * 40) + 15;
          q = `${num1} + ${num2}`;
          a = num1 + num2;
        } else if (operator === '-') {
          const num1 = Math.floor(Math.random() * 80) + 20;
          const num2 = Math.floor(Math.random() * num1) + 1;
          q = `${num1} − ${num2}`;
          a = num1 - num2;
        } else if (operator === 'x') {
          const num1 = Math.floor(Math.random() * 10) + 2;
          const num2 = Math.floor(Math.random() * 10) + 2;
          q = `${num1} × ${num2}`;
          a = num1 * num2;
        } else { // division
          const num2 = Math.floor(Math.random() * 10) + 2;
          const answer = Math.floor(Math.random() * 10) + 2;
          const num1 = num2 * answer;
          q = `${num1} ÷ ${num2}`;
          a = answer;
        }
      } else if (type === 'pemdas') {
        const aVal = Math.floor(Math.random() * 9) + 1;
        const bVal = Math.floor(Math.random() * 5) + 2;
        const cVal = Math.floor(Math.random() * 5) + 2;
        const isBrackets = Math.random() > 0.5;
        if (isBrackets) {
          q = `(${aVal} + ${bVal}) × ${cVal}`;
          a = (aVal + bVal) * cVal;
        } else {
          q = `${aVal} + ${bVal} × ${cVal}`;
          a = aVal + bVal * cVal;
        }
      } else if (type === 'algebra') {
        const xVal = Math.floor(Math.random() * 8) + 2;
        const coeff = Math.floor(Math.random() * 3) + 2;
        q = `${coeff}x = ${coeff * xVal}  (Find x)`;
        a = xVal;
      } else if (type === 'square_root') {
        const isRoot = Math.random() > 0.5;
        const num = Math.floor(Math.random() * 9) + 3; // 3 to 11
        if (isRoot) {
          q = `√${num * num}`;
          a = num;
        } else {
          q = `${num}²`;
          a = num * num;
        }
      } else { // percentage
        const pct = [10, 25, 50, 100][Math.floor(Math.random() * 4)];
        const total = (Math.floor(Math.random() * 8) + 1) * 20; // 20 to 160
        q = `${pct}% of ${total}`;
        a = (pct * total) / 100;
      }
    } 
    else { // hard
      const types = ['arithmetic', 'algebra_2step', 'pemdas_hard', 'power_root', 'percentage_hard', 'fraction'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      if (type === 'arithmetic') {
        const isMul = Math.random() > 0.5;
        if (isMul) {
          const num1 = Math.floor(Math.random() * 12) + 7; // 7 to 18
          const num2 = Math.floor(Math.random() * 12) + 7;
          q = `${num1} × ${num2}`;
          a = num1 * num2;
        } else {
          const num2 = Math.floor(Math.random() * 12) + 7;
          const answer = Math.floor(Math.random() * 12) + 7;
          const num1 = num2 * answer;
          q = `${num1} ÷ ${num2}`;
          a = answer;
        }
      } else if (type === 'algebra_2step') {
        const xVal = Math.floor(Math.random() * 9) + 2;
        const coeff = Math.floor(Math.random() * 4) + 2;
        const constVal = Math.floor(Math.random() * 8) + 1;
        const isAdd = Math.random() > 0.5;
        if (isAdd) {
          q = `${coeff}x + ${constVal} = ${coeff * xVal + constVal}  (Find x)`;
          a = xVal;
        } else {
          q = `${coeff}x − ${constVal} = ${coeff * xVal - constVal}  (Find x)`;
          a = xVal;
        }
      } else if (type === 'pemdas_hard') {
        const aVal = Math.floor(Math.random() * 15) + 5;
        const bVal = Math.floor(Math.random() * 4) + 2;
        const cVal = Math.floor(Math.random() * 7) + 3;
        const dVal = Math.floor(Math.random() * (cVal - 2)) + 1;
        q = `${aVal} + ${bVal} × (${cVal} − ${dVal})`;
        a = aVal + bVal * (cVal - dVal);
      } else if (type === 'power_root') {
        const rootOptions = [11, 12, 13, 14, 15, 20];
        const num = rootOptions[Math.floor(Math.random() * rootOptions.length)];
        const isRoot = Math.random() > 0.4;
        if (isRoot) {
          q = `√${num * num}`;
          a = num;
        } else {
          const isCube = Math.random() > 0.5;
          if (isCube) {
            const cubeNum = Math.floor(Math.random() * 3) + 2; // 2 to 4
            q = `${cubeNum}³`;
            a = cubeNum * cubeNum * cubeNum;
          } else {
            q = `${num}²`;
            a = num * num;
          }
        }
      } else if (type === 'percentage_hard') {
        const pct = [15, 20, 30, 40, 75, 120][Math.floor(Math.random() * 6)];
        const total = (Math.floor(Math.random() * 9) + 2) * 20; // 40 to 200
        q = `${pct}% of ${total}`;
        a = (pct * total) / 100;
      } else { // fraction
        const denom = [3, 4, 5, 8][Math.floor(Math.random() * 4)];
        const numer = Math.floor(Math.random() * (denom - 1)) + 1;
        const total = denom * (Math.floor(Math.random() * 8) + 2);
        q = `${numer}/${denom} of ${total}`;
        a = (numer * total) / denom;
      }
    }
    
    const choices = generateChoices(a);
    return { q, a, choices };
  };

  const totalRounds = React.useMemo(() => {
    return gameMode === 'multi' ? roundsCount : (singleQuestions.length || 8);
  }, [gameMode, roundsCount, singleQuestions]);

  const activeQuestionData = React.useMemo(() => {
    if (gameMode === 'multi') {
      return (roomData?.questions?.[solvedCount]) || { q: 'Loading...', a: 0, choices: [] };
    } else {
      return (singleQuestions?.[solvedCount]) || { q: '', a: 0, choices: [] };
    }
  }, [gameMode, roomData, singleQuestions, solvedCount]);

  const handleCreateRoom = async () => {
    if (!firestore) return;
    if (!nickname.trim()) {
      showLocalToast(
        "Nickname Required ✏️",
        "Please enter your name before creating a room.",
        "destructive"
      );
      return;
    }

    if (questionMode === 'custom') {
      if (customQuestions.length === 0) {
        showLocalToast("Incomplete Lobby", "Please add at least 1 custom question.", "destructive");
        return;
      }
      for (let i = 0; i < customQuestions.length; i++) {
        const cq = customQuestions[i];
        if (!cq.q.trim()) {
          showLocalToast("Incomplete Question", `Round ${i + 1} question is empty.`, "destructive");
          return;
        }
        for (let j = 0; j < cq.choices.length; j++) {
          if (!cq.choices[j].trim()) {
            showLocalToast("Incomplete Choices", `Round ${i + 1} choice ${String.fromCharCode(65 + j)} is empty.`, "destructive");
            return;
          }
        }
      }
    }
    
    const code = Array.from({ length: 5 }, () => 
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    
    const hostUid = user ? `${user.uid}_${Math.random().toString(36).substring(2, 7)}` : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setMyUid(hostUid);
    
    const initialPlayers = {
      [hostUid]: {
        uid: hostUid,
        name: nickname,
        score: 0,
        solvedCount: 0,
        finished: false,
        isHost: true,
        lastActive: Date.now()
      }
    };
    
    try {
      // Create room inside open "stats" collection to bypass rules restriction
      const roomRef = doc(firestore, "stats", "mv_room_" + code);
      await setDoc(roomRef, {
        code,
        hostId: hostUid,
        hostName: nickname,
        difficulty,
        roundsCount: questionMode === 'custom' ? customQuestions.length : roundsCount,
        status: 'lobby',
        players: initialPlayers,
        questions: [],
        questionMode,
        customQuestions: questionMode === 'custom' ? customQuestions : [],
        createdAt: Date.now()
      });
      
      setRoomCode(code);
      setIsHost(true);
      setMultiplayerState('lobby');
      setGameState('playing');
      sessionStorage.setItem("lingoland_active_roomCode_math-vault-3d", code);
      sessionStorage.setItem("lingoland_active_myUid_math-vault-3d", hostUid);
      sessionStorage.setItem("lingoland_active_gameMode_math-vault-3d", 'multi');
      showLocalToast(
        "Room Created! 🚪🔑",
        `Your code is ${code}. Share with up to 2 friends!`,
        "default"
      );
    } catch (e) {
      console.error("Failed to create room", e);
      showLocalToast(
        "Database Error",
        "Could not initialize room on server. Try again.",
        "destructive"
      );
    }
  };

  const handleJoinRoom = async (codeToJoin: string) => {
    if (!firestore) return;
    const cleanCode = codeToJoin.trim().toUpperCase();
    if (cleanCode.length !== 5) {
      showLocalToast(
        "Invalid Code",
        "Invitation codes must be exactly 5 letters.",
        "destructive"
      );
      return;
    }
    if (!nickname.trim()) {
      showLocalToast(
        "Nickname Required ✏️",
        "Please enter your name before joining.",
        "destructive"
      );
      return;
    }
    
    try {
      const roomRef = doc(firestore, "stats", "mv_room_" + cleanCode);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        showLocalToast(
          "Room Not Found 🔍",
          `No active room exists with code: ${cleanCode}`,
          "destructive"
        );
        return;
      }
      
      const data = roomSnap.data();
      if (data.status !== 'lobby') {
        showLocalToast(
          "Game In Progress 🏎️",
          "This room is currently playing or has already finished.",
          "destructive"
        );
        return;
      }
      
      const list = Object.values(data.players || {});
      if (list.length >= 3) {
        showLocalToast(
          "Room Full 👥",
          "This lobby has reached the maximum of 3 players.",
          "destructive"
        );
        return;
      }
      
      const playerUid = user ? `${user.uid}_${Math.random().toString(36).substring(2, 7)}` : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setMyUid(playerUid);
      
      const updatedPlayers = {
        ...data.players,
        [playerUid]: {
          uid: playerUid,
          name: nickname,
          score: 0,
          solvedCount: 0,
          finished: false,
          isHost: false,
          lastActive: Date.now()
        }
      };
      
      await updateDoc(roomRef, {
        players: updatedPlayers
      });
      
      setRoomCode(cleanCode);
      setIsHost(false);
      setMultiplayerState('lobby');
      setGameState('playing');
      sessionStorage.setItem("lingoland_active_roomCode_math-vault-3d", cleanCode);
      sessionStorage.setItem("lingoland_active_myUid_math-vault-3d", playerUid);
      sessionStorage.setItem("lingoland_active_gameMode_math-vault-3d", 'multi');
      showLocalToast(
        "Connected! 🤝",
        `Joined room ${cleanCode}. Waiting for the host to launch.`,
        "default"
      );
    } catch (e) {
      console.error("Failed to join room", e);
      showLocalToast(
        "Connection Failed",
        "Could not connect to room. Check connection.",
        "destructive"
      );
    }
  };

  const handleLeaveRoom = async () => {
    if (!firestore || !roomCode) {
      resetMultiplayerState();
      return;
    }
    
    try {
      const roomRef = doc(firestore, "stats", "mv_room_" + roomCode);
      if (isCreator) {
        // Disband room by writing disbanded status, then delete
        await updateDoc(roomRef, { status: 'disbanded' });
        await deleteDoc(roomRef);
      } else if (roomData && roomData.players) {
        const updatedPlayers = { ...roomData.players };
        delete updatedPlayers[myUid];
        await updateDoc(roomRef, {
          players: updatedPlayers
        });
      }
    } catch (e) {
      console.warn("Clean disconnect error:", e);
    } finally {
      resetMultiplayerState();
    }
  };

  const cleanSavedSession = () => {
    sessionStorage.removeItem("lingoland_active_roomCode_math-vault-3d");
    sessionStorage.removeItem("lingoland_active_myUid_math-vault-3d");
    sessionStorage.removeItem("lingoland_active_gameMode_math-vault-3d");
  };

  const resetMultiplayerState = () => {
    cleanSavedSession();
    setRoomCode('');
    setMyUid('');
    setIsHost(false);
    setRoomData(null);
    setRoomPlayers([]);
    setCodeVal('');
    setQuestionMode('auto');
    setCustomQuestions([{ q: '', choices: ['', '', '', ''], correctIndex: 0 }]);
    setIsEditingQuestions(false);
    setMultiplayerState('mode_select');
    setGameState('idle');
  };

  const addCustomQuestion = () => {
    setCustomQuestions([...customQuestions, { q: '', choices: ['', '', '', ''], correctIndex: 0 }]);
  };

  const removeCustomQuestion = (index: number) => {
    if (customQuestions.length <= 1) return;
    const list = [...customQuestions];
    list.splice(index, 1);
    setCustomQuestions(list);
  };

  const updateCustomQuestion = (index: number, field: string, value: any) => {
    const list = [...customQuestions];
    if (field === 'q') {
      list[index].q = value;
    } else if (field === 'correctIndex') {
      list[index].correctIndex = value;
    }
    setCustomQuestions(list);
  };

  const updateCustomChoice = (qIndex: number, choiceIndex: number, value: string) => {
    const list = [...customQuestions];
    list[qIndex].choices[choiceIndex] = value;
    setCustomQuestions(list);
  };

  const handleSaveCustomQuestions = async (updatedList: any[]) => {
    if (!firestore || !roomCode || !isCreator) return;
    try {
      const roomRef = doc(firestore, "stats", "mv_room_" + roomCode);
      await updateDoc(roomRef, {
        customQuestions: updatedList,
        roundsCount: updatedList.length
      });
      showLocalToast("Questions Saved", "Custom question database updated successfully.", "default");
    } catch (e) {
      console.error(e);
      showLocalToast("Error Saving", "Could not update questions on server.", "destructive");
    }
  };

  const handleStartGameMultiplayer = async () => {
    if (!firestore || !roomCode || !isCreator) return;
    if (roomPlayers.length < 2) {
      showLocalToast(
        "Waiting for Competitors 👥",
        "Need at least 2 players in the lobby to start.",
        "destructive"
      );
      return;
    }
    
    try {
      let questionsList: any[] = [];
      const mode = roomData?.questionMode || 'auto';
      const rounds = mode === 'custom' ? (roomData?.customQuestions?.length || 0) : roundsCount;

      if (mode === 'custom') {
        const rawList = roomData?.customQuestions || [];
        if (rawList.length === 0) {
          showLocalToast("No Questions", "Please add custom questions first.", "destructive");
          return;
        }
        questionsList = rawList.map((cq: any) => {
          const processedChoices = cq.choices.map((c: string) => {
            const num = Number(c);
            return isNaN(num) || c.trim() === '' ? c : num;
          });
          const correctVal = processedChoices[cq.correctIndex];
          return {
            q: cq.q,
            a: correctVal,
            choices: processedChoices
          };
        });
      } else {
        const tempUsed: string[] = [];
        for (let i = 0; i < rounds; i++) {
          let newProb = generateMath(difficulty);
          let attempts = 15;
          while (tempUsed.includes(newProb.q) && attempts > 0) {
            newProb = generateMath(difficulty);
            attempts--;
          }
          tempUsed.push(newProb.q);
          questionsList.push({
            q: newProb.q,
            a: newProb.a,
            choices: newProb.choices
          });
        }
      }
      
      const roomRef = doc(firestore, "stats", "mv_room_" + roomCode);
      const updatedPlayers = { ...roomData.players };
      Object.keys(updatedPlayers).forEach((uid) => {
        updatedPlayers[uid].score = 0;
        updatedPlayers[uid].solvedCount = 0;
        updatedPlayers[uid].finished = false;
      });
      
      await updateDoc(roomRef, {
        status: 'playing',
        questions: questionsList,
        players: updatedPlayers,
        startedAt: Date.now()
      });
    } catch (e) {
      console.error("Start multiplayer failed:", e);
      showLocalToast(
        "Launch Failed",
        "Error launching the race. Try again.",
        "destructive"
      );
    }
  };

  const startSinglePlayer = (selectedDiff: Difficulty) => {
    playSfx('click');
    setDifficulty(selectedDiff);
    setSolvedCount(0);
    setStreak(0);
    setIsOpen(false);
    setIsAnimating(false);
    setParticles([]);
    
    const questionsList: MathProblem[] = [];
    const tempUsed: string[] = [];
    for (let i = 0; i < roundsCount; i++) {
      let newProb = generateMath(selectedDiff);
      let attempts = 15;
      while (tempUsed.includes(newProb.q) && attempts > 0) {
        newProb = generateMath(selectedDiff);
        attempts--;
      }
      tempUsed.push(newProb.q);
      questionsList.push(newProb);
    }
    
    setSingleQuestions(questionsList);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setGameState('playing');
  };

  const handleAnswerSubmit = async (choice: number | string) => {
    if (hasAnswered || isAnimating) return;
    
    setSelectedAnswer(choice);
    setHasAnswered(true);
    
    const isCorrect = choice === activeQuestionData.a;
    
    setIsAnimating(true);
    setIsOpen(true);
    
    if (isCorrect) {
      playSfx('correct');
      setStreak(prev => {
        const next = prev + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
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
    } else {
      playSfx('wrong');
      setStreak(0);
    }
    
    if (gameMode === 'multi' && firestore && roomCode) {
      try {
        const roomRef = doc(firestore, "stats", "mv_room_" + roomCode);
        const newScore = (roomData?.players?.[myUid]?.score || 0) + (isCorrect ? 100 : 0);
        await updateDoc(roomRef, {
          [`players.${myUid}.score`]: newScore,
          [`players.${myUid}.solvedCount`]: solvedCount + 1
        });
      } catch (e) {
        console.error("Failed to update score", e);
      }
    }
    
    const updatedUsed = [...usedQuestions];
    if (!updatedUsed.includes(activeQuestionData.q)) {
      updatedUsed.push(activeQuestionData.q);
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

  const handleNextRound = async () => {
    if (isAnimating || !isOpen) return;
    setIsAnimating(true);
    
    const nextCount = solvedCount + 1;
    if (nextCount >= totalRounds) {
      playSfx('win');
      if (gameMode === 'multi') {
        setSolvedCount(nextCount);
        if (firestore && roomCode) {
          try {
            const roomRef = doc(firestore, "stats", "mv_room_" + roomCode);
            await updateDoc(roomRef, {
              [`players.${myUid}.finished`]: true
            });
            
            const updatedPlayers = { ...roomData.players };
            updatedPlayers[myUid].finished = true;
            
            const allFinished = Object.values(updatedPlayers).every((p: any) => p.finished);
            if (allFinished) {
              const sorted = Object.values(updatedPlayers).sort((a: any, b: any) => b.score - a.score);
              const winner = sorted[0] as any;
              await updateDoc(roomRef, {
                status: 'finished',
                winnerId: winner.uid,
                winnerName: winner.name
              });
            }
          } catch (e) {
            console.error("Finished flag update error:", e);
          }
        }
      } else {
        setSolvedCount(nextCount);
        setGameState('finished');
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { slug: game?.slug || 'math-vault-3d', score: nextCount * 100, difficulty }
        });
        showLocalToast(
          "Vault Decrypted! 🏆💎",
          "You've successfully solved all math barriers! Lingo-Coins awarded.",
          "default"
        );
      }
      setIsAnimating(false);
    } else {
      playSfx('door');
      setIsOpen(false);
      setTimeout(() => {
        setSolvedCount(nextCount);
        setParticles([]);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setIsAnimating(false);
      }, 1000);
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
      showLocalToast(
        "Memory Cleared",
        "Vault database combination cache has been purged.",
        "default"
      );
    }
  };

  // Rendering Helper Components
  const renderLiveHUD = () => {
    if (gameMode !== 'multi') return null;
    return (
      <div className="w-full max-w-2xl bg-slate-950/90 px-3 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl border border-cyan-500/20 shadow-xl flex flex-col gap-2 mb-3 sm:mb-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-cyan-400 border-b border-cyan-500/10 pb-1 font-bold">
          <span>👥 Live Race Standings</span>
          <span>ROOM: {roomCode}</span>
        </div>
        <div className="flex flex-col gap-2">
          {roomPlayers.map((player) => {
            const isMe = player.uid === myUid;
            const progress = (player.solvedCount / roundsCount) * 100;
            return (
              <div key={player.uid} className={cn(
                "flex flex-col gap-1 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all",
                isMe ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-slate-900/40"
              )}>
                <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-white truncate max-w-[150px] sm:max-w-none">
                    {player.name} {isMe && <span className="text-[7px] sm:text-[8px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded uppercase font-black">You</span>}
                    {player.finished && ' 🏁'}
                  </span>
                  <span className="text-cyan-300 font-mono text-[10px] sm:text-[11px] shrink-0">
                    {Math.min(player.solvedCount, roundsCount)}/{roundsCount} • {player.score} pts
                  </span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className={cn("h-full transition-all duration-500", isMe ? "bg-cyan-400" : "bg-slate-500")}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMultiplayerSetup = () => {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-8 animate-in fade-in zoom-in-95 duration-300 px-3 sm:px-8 py-4 sm:py-10">
        <div className="bg-slate-950/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-4 sm:gap-6">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest font-mono text-[9px] px-2.5 py-1 mb-1">
              Setup Multiplayer
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase">
              Math Race
            </h3>
            <p className="text-cyan-200/50 text-xs">Set up a race and share codes with friends</p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/85 block font-bold">
              Enter Nickname
            </label>
            <input
              type="text"
              maxLength={15}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-slate-900 border border-cyan-500/20 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-1 sm:mt-2">
            <Button
              onClick={() => setMultiplayerState('create_room')}
              className="h-24 sm:h-32 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
              CREATE ROOM
            </Button>
            <Button
              onClick={() => setMultiplayerState('join_room')}
              className="h-24 sm:h-32 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-slate-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8" />
              JOIN ROOM
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setGameMode('single');
              setGameState('idle');
            }}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 mt-1 sm:mt-2 font-bold cursor-pointer py-2.5 sm:py-3 text-xs sm:text-sm"
          >
            ← Back to Main Menu
          </Button>
        </div>
      </div>
    );
  };

  const renderCreateRoom = () => {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-8 animate-in fade-in zoom-in-95 duration-300 px-3 sm:px-8 py-4 sm:py-10">
        <div className="bg-slate-950/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-4 sm:gap-6">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase">
              Room Parameters
            </h3>
            <p className="text-cyan-200/50 text-xs">Configure your multiplayer game parameters</p>
          </div>

          {/* Question Mode Option */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/80 block font-bold">
              Question Mode
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setQuestionMode('auto')}
                className={cn(
                  "py-2.5 sm:py-3.5 px-2 rounded-xl border font-black text-[11px] sm:text-xs uppercase transition-all cursor-pointer text-center",
                  questionMode === 'auto'
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                )}
              >
                🤖 Auto Math
              </button>
              <button
                type="button"
                onClick={() => setQuestionMode('custom')}
                className={cn(
                  "py-2.5 sm:py-3.5 px-2 rounded-xl border font-black text-[11px] sm:text-xs uppercase transition-all cursor-pointer text-center",
                  questionMode === 'custom'
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                )}
              >
                ✏️ Custom Items
              </button>
            </div>
          </div>

          {/* Difficulty Option */}
          {questionMode === 'auto' && (
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/80 block font-bold">
                Select Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={cn(
                      "py-2.5 sm:py-3.5 rounded-xl border font-black text-xs uppercase transition-all cursor-pointer",
                      difficulty === diff
                        ? diff === 'easy'
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                          : diff === 'medium'
                            ? "bg-yellow-500/20 border-yellow-500 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                            : "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rounds Option */}
          {questionMode === 'auto' && (
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/80 block font-bold">
                Number of Rounds
              </label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
                {[5, 8, 10, 15, 20].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoundsCount(r)}
                    className={cn(
                      "py-2 sm:py-3 rounded-lg border font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer",
                      roundsCount === r
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Question Builder Option */}
          {questionMode === 'custom' && (
            <div className="space-y-3 border-t border-white/5 pt-3 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  ✏️ Custom Questions ({customQuestions.length} Rounds)
                </span>
                <Button
                  type="button"
                  onClick={addCustomQuestion}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer text-xs"
                >
                  + Add Round
                </Button>
              </div>

              <div className="max-h-[40vh] md:max-h-[30rem] overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {customQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-white/5 space-y-2.5 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-cyan-400">Round {qIdx + 1}</span>
                      {customQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCustomQuestion(qIdx)}
                          className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">
                        Question / Problem
                      </label>
                      <input
                        type="text"
                        value={q.q}
                        onChange={(e) => updateCustomQuestion(qIdx, 'q', e.target.value)}
                        placeholder="e.g. 15 x 3 - 5"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">
                        Choices & Correct Answer
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {q.choices.map((choice: string, cIdx: number) => (
                          <div
                            key={cIdx}
                            className={cn(
                              "flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all duration-200",
                              q.correctIndex === cIdx
                                ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-emerald-250"
                                : "bg-slate-950/80 border-white/5 text-slate-300"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => updateCustomQuestion(qIdx, 'correctIndex', cIdx)}
                              className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm",
                                q.correctIndex === cIdx
                                  ? "border-emerald-400 bg-emerald-500 text-slate-950"
                                  : "border-slate-700 hover:border-slate-500 hover:bg-white/5"
                              )}
                            >
                              {q.correctIndex === cIdx && (
                                <span className="w-1.5 bg-slate-950 rounded-full h-1.5" />
                              )}
                            </button>
                            <input
                              type="text"
                              value={choice}
                              onChange={(e) => updateCustomChoice(qIdx, cIdx, e.target.value)}
                              placeholder={`Opt ${String.fromCharCode(65 + cIdx)}`}
                              className="w-full bg-transparent border-none p-0.5 text-xs text-white placeholder-slate-700 focus:outline-none font-semibold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 mt-2">
            <Button
              onClick={handleCreateRoom}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest py-4 sm:py-6 rounded-xl transition-all shadow-lg cursor-pointer text-xs sm:text-sm"
            >
              GENERATE INVITATION CODE
            </Button>
            <Button
              variant="ghost"
              onClick={() => setMultiplayerState('mode_select')}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold cursor-pointer py-2 text-xs sm:text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderJoinRoom = () => {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-8 animate-in fade-in zoom-in-95 duration-300 px-3 sm:px-8 py-4 sm:py-10">
        <div className="bg-slate-950/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-4 sm:gap-6">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase">
              Enter Invitation Code
            </h3>
            <p className="text-cyan-200/50 text-xs">Enter invitation code to join game</p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/80 block font-bold">
              Enter 5-Letter Code
            </label>
            <input
              type="text"
              maxLength={5}
              value={codeVal}
              onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
              placeholder="e.g. ABCDE"
              className="w-full bg-slate-900 border border-cyan-500/20 rounded-xl px-4 py-3 sm:py-4 text-center text-2xl sm:text-3xl font-mono font-black text-white placeholder-slate-800 tracking-[0.25em] focus:outline-none focus:border-cyan-500 transition-all uppercase"
            />
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <Button
              onClick={() => handleJoinRoom(codeVal)}
              disabled={codeVal.trim().length !== 5}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest py-4 sm:py-6 rounded-xl transition-all shadow-lg cursor-pointer text-xs sm:text-sm"
            >
              CONNECT TO ROOM
            </Button>
            <Button
              variant="ghost"
              onClick={() => setMultiplayerState('mode_select')}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold cursor-pointer py-2 text-xs sm:text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderLobbyQuestionEditor = () => {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-8 animate-in fade-in zoom-in-95 duration-300 px-3 sm:px-8 py-4 sm:py-10">
        <div className="bg-slate-950/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-4 sm:gap-6">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest font-mono text-[9px] px-2.5 py-1 mb-1">
              Lobby Editor
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase">
              Edit Custom Questions
            </h3>
            <p className="text-cyan-200/50 text-xs">Tweak your questions before starting the game</p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                ✏️ Questions ({customQuestions.length} Rounds)
              </span>
              <Button
                type="button"
                onClick={addCustomQuestion}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer text-xs"
              >
                + Add Round
              </Button>
            </div>

            <div className="max-h-[40vh] md:max-h-[30rem] overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {customQuestions.map((q, qIdx) => (
                <div key={qIdx} className="bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-white/5 space-y-2.5 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-cyan-400">Round {qIdx + 1}</span>
                    {customQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCustomQuestion(qIdx)}
                        className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">
                      Question / Problem
                    </label>
                    <input
                      type="text"
                      value={q.q}
                      onChange={(e) => updateCustomQuestion(qIdx, 'q', e.target.value)}
                      placeholder="e.g. 15 x 3 - 5"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">
                      Choices & Correct Answer
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {q.choices.map((choice: string, cIdx: number) => (
                        <div
                          key={cIdx}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all duration-200",
                            q.correctIndex === cIdx
                              ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-emerald-250"
                              : "bg-slate-950/80 border-white/5 text-slate-300"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => updateCustomQuestion(qIdx, 'correctIndex', cIdx)}
                            className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm",
                              q.correctIndex === cIdx
                                ? "border-emerald-400 bg-emerald-500 text-slate-950"
                                : "border-slate-700 hover:border-slate-500 hover:bg-white/5"
                            )}
                          >
                            {q.correctIndex === cIdx && (
                              <span className="w-1.5 bg-slate-950 rounded-full h-1.5" />
                            )}
                          </button>
                          <input
                            type="text"
                            value={choice}
                            onChange={(e) => updateCustomChoice(qIdx, cIdx, e.target.value)}
                            placeholder={`Opt ${String.fromCharCode(65 + cIdx)}`}
                            className="w-full bg-transparent border-none p-0.5 text-xs text-white placeholder-slate-700 focus:outline-none font-semibold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
            <Button
              onClick={async () => {
                // Validation
                for (let i = 0; i < customQuestions.length; i++) {
                  const cq = customQuestions[i];
                  if (!cq.q.trim()) {
                    showLocalToast("Incomplete Question", `Round ${i + 1} question is empty.`, "destructive");
                    return;
                  }
                  for (let j = 0; j < cq.choices.length; j++) {
                    if (!cq.choices[j].trim()) {
                      showLocalToast("Incomplete Choices", `Round ${i + 1} choice ${String.fromCharCode(65 + j)} is empty.`, "destructive");
                      return;
                    }
                  }
                }
                // Save to Firestore
                await handleSaveCustomQuestions(customQuestions);
                setIsEditingQuestions(false);
              }}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest py-4 sm:py-6 rounded-xl transition-all shadow-lg cursor-pointer text-xs sm:text-sm"
            >
              SAVE & APPLY CHANGES
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                // Revert to database state
                if (roomData?.customQuestions) {
                  setCustomQuestions(JSON.parse(JSON.stringify(roomData.customQuestions)));
                }
                setIsEditingQuestions(false);
              }}
              className="text-slate-400 hover:text-white hover:bg-white/5 font-bold cursor-pointer py-2 px-6 text-xs sm:text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderLobby = () => {
    if (isEditingQuestions) {
      return renderLobbyQuestionEditor();
    }

    return (
      <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-8 animate-in fade-in zoom-in-95 duration-300 px-3 sm:px-8 py-4 sm:py-10">
        <div className="bg-slate-950/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-4 sm:gap-6">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest font-mono text-[9px] px-2.5 py-1">
              Multiplayer Lobby
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase mt-1">
              Invitation Code
            </h3>
            <p className="text-slate-400 text-xs">Share this code with your competitors</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-900/80 py-4 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl border border-cyan-500/10 shadow-inner">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/60 mb-1 font-bold">Room Code</span>
            <span className="text-3xl sm:text-5xl font-mono font-black text-cyan-300 tracking-[0.2em]">{roomCode}</span>
          </div>

          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono block">
              👥 Connected Players ({roomPlayers.length} / 3)
            </span>
            <div className="flex flex-col gap-2">
              {roomPlayers.map((player, idx) => (
                <div key={player.uid || idx} className="flex justify-between items-center bg-slate-900/60 px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white truncate">{player.name}</span>
                    {player.uid === myUid && (
                      <span className="text-[7px] sm:text-[8px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded uppercase font-black font-mono shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  {player.isHost ? (
                    <span className="text-[8px] sm:text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase font-mono font-bold shrink-0">
                      Host
                    </span>
                  ) : (
                    <span className="text-[8px] sm:text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase font-mono font-bold shrink-0">
                      Ready
                    </span>
                  )}
                </div>
              ))}
              {roomPlayers.length < 2 && (
                <p className="text-[11px] text-yellow-400/80 italic text-center mt-1 animate-pulse font-medium">
                  Waiting for at least 1 competitor to connect...
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs space-y-2 font-medium text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Question Mode:</span>
              <span className={cn("font-bold uppercase", roomData?.questionMode === 'custom' ? "text-purple-400" : "text-cyan-400")}>
                {roomData?.questionMode === 'custom' ? 'Custom Created' : `Auto (${difficulty})`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Rounds:</span>
              <span className="text-cyan-400 font-bold">{roundsCount} Rounds</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-1 sm:mt-2">
            {isCreator && roomData?.questionMode === 'custom' && (
              <Button
                onClick={() => setIsEditingQuestions(true)}
                className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold py-3 sm:py-3.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm"
              >
                ✏️ Edit Custom Questions
              </Button>
            )}
            {isCreator ? (
              <Button
                onClick={handleStartGameMultiplayer}
                disabled={roomPlayers.length < 2}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black tracking-widest py-4 sm:py-6 rounded-xl transition-all shadow-lg cursor-pointer text-xs sm:text-sm"
              >
                START GAME 🚀
              </Button>
            ) : (
              <div className="w-full py-3.5 sm:py-4 text-center bg-slate-900/60 border border-white/5 rounded-xl text-slate-400 text-xs font-semibold animate-pulse">
                Waiting for host to start the game...
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLeaveRoom}
              className="w-full border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-bold cursor-pointer text-xs sm:text-sm py-2.5"
            >
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderMultiplayerResults = () => {
    const sortedPlayers = [...roomPlayers].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    
    return (
      <div className="flex flex-col items-center gap-5 sm:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <Trophy className="w-20 h-20 sm:w-32 sm:h-32 text-cyan-400 drop-shadow-[0_0_20px_rgba(0,229,255,0.6)] animate-bounce" />
        
        <div className="text-center space-y-1 sm:space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase text-white">
            Race Completed!
          </h2>
          <p className="text-slate-300 font-medium text-sm sm:text-lg">
            Winner: <span className="text-cyan-400 text-xl sm:text-3xl font-black">{winner?.name || 'Unknown'} ({winner?.score || 0} pts)</span>
          </p>
        </div>

        <div className="w-full bg-slate-950/80 rounded-2xl border border-cyan-500/20 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 shadow-inner">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono block border-b border-white/5 pb-2">
            🏆 Final Standings
          </span>
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {sortedPlayers.map((player, idx) => {
              const isMe = player.uid === myUid;
              const isCurrentWinner = player.uid === winner?.uid;
              return (
                <div 
                  key={player.uid || idx} 
                  className={cn(
                    "flex justify-between items-center px-3.5 sm:px-5 py-3 sm:py-4 rounded-xl border transition-all",
                    isCurrentWinner 
                      ? "bg-cyan-500/10 border-cyan-500/40 text-white" 
                      : "bg-slate-900/60 border-white/5 text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5">
                    <span className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                      idx === 0 ? "bg-amber-500 text-slate-950" : idx === 1 ? "bg-slate-300 text-slate-950" : "bg-orange-850 text-white"
                    )}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs sm:text-sm">{player.name}</span>
                    {isMe && <span className="text-[7px] sm:text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-black font-mono">You</span>}
                  </div>
                  <span className="font-mono font-bold text-cyan-300 text-sm sm:text-lg">{player.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          {isCreator ? (
            <Button 
              onClick={async () => {
                try {
                  const roomRef = doc(firestore, "stats", "mv_room_" + roomCode);
                  const resetPlayers = { ...roomData.players };
                  Object.keys(resetPlayers).forEach((uid) => {
                    resetPlayers[uid].score = 0;
                    resetPlayers[uid].solvedCount = 0;
                    resetPlayers[uid].finished = false;
                  });
                  await updateDoc(roomRef, {
                    status: 'lobby',
                    questions: [],
                    players: resetPlayers,
                    winnerId: null,
                    winnerName: null
                  });
                  setMultiplayerState('lobby');
                } catch (e) {
                  console.error("Reset room to lobby error:", e);
                }
              }} 
              size="lg" 
              className="rounded-full px-8 py-4 sm:py-6 font-bold bg-cyan-600 text-white hover:scale-105 transition-transform shadow-lg shadow-cyan-500/25 border border-cyan-500/30 cursor-pointer text-xs sm:text-sm"
            >
              Play Again (Lobby)
            </Button>
          ) : (
            <div className="text-xs font-mono text-slate-400 py-3 sm:py-4 animate-pulse bg-slate-900/40 px-6 border border-white/5 rounded-full text-center">
              Waiting for host to recreate lobby...
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={handleLeaveRoom} 
            size="lg" 
            className="rounded-full px-8 py-4 sm:py-6 font-bold border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer text-xs sm:text-sm"
          >
            Leave Room
          </Button>
        </div>
      </div>
    );
  };

  if (!game) return null;

  const isWaitingForOthers = gameMode === 'multi' && solvedCount >= roundsCount && roomData?.status === 'playing';

  // Keyboard navigation for active decryption stage
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        return;
      }
      const isPlaying = (gameMode === 'single' && gameState === 'playing' && singleQuestions.length > 0) ||
                        (gameMode === 'multi' && multiplayerState === 'playing' && !isWaitingForOthers);
      if (!isPlaying) return;

      if (!hasAnswered && !isAnimating) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          if (activeQuestionData.choices && activeQuestionData.choices[index] !== undefined) {
            e.preventDefault();
            handleAnswerSubmit(activeQuestionData.choices[index]);
          }
        }
      } else if (hasAnswered && isOpen && !isAnimating) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextRound();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, gameState, multiplayerState, isWaitingForOthers, hasAnswered, isOpen, isAnimating, activeQuestionData, handleAnswerSubmit, handleNextRound]);

  // Reusable Widescreen 3D Vault Stage for both Single Player and Multiplayer (Fully Mobile Responsive)
  const renderVaultGameStage = (isMulti: boolean = false) => {
    const currentScore = isMulti ? (roomData?.players?.[myUid]?.score || 0) : solvedCount * 100;

    return (
      <div className={cn(
        "w-full flex flex-col items-center gap-3 sm:gap-6 relative transition-all duration-300",
        isFullscreen ? "max-w-6xl" : "max-w-5xl"
      )}>
        {/* Cockpit Telemetry Header - Single Row Mobile First */}
        <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 backdrop-blur-xl shadow-xl flex items-center justify-between gap-2">
          {/* Left: Barrier counter & Tier */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-2 sm:px-3 py-1 rounded-lg text-cyan-300 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>BARRIER {Math.min(solvedCount + 1, totalRounds)}/{totalRounds}</span>
            </div>
            <Badge className="bg-slate-800/80 text-cyan-300 border border-cyan-500/20 uppercase font-mono text-[9px] sm:text-[10px] tracking-wider py-0.5 sm:py-1 px-1.5 sm:px-2.5">
              {difficulty}
            </Badge>
          </div>

          {/* Center: Segmented Progress Track (desktop/tablet only) */}
          <div className="hidden sm:flex items-center gap-1 flex-1 max-w-xs mx-3">
            {Array.from({ length: totalRounds }).map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300 border",
                  idx < solvedCount 
                    ? "bg-cyan-400 border-cyan-300 shadow-[0_0_8px_#00e5ff]" 
                    : idx === solvedCount
                    ? "bg-cyan-500/40 border-cyan-400 animate-pulse"
                    : "bg-slate-950/80 border-slate-800"
                )}
              />
            ))}
          </div>

          {/* Right: Streak & Score */}
          <div className="flex items-center gap-1.5 sm:gap-3 ml-auto shrink-0">
            {streak >= 2 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-orange-500/40 px-2 py-0.5 rounded-lg text-orange-400 font-mono text-[10px] sm:text-xs font-black uppercase animate-pulse">
                <Flame className="w-3 h-3 fill-orange-500" />
                <span>{streak}x</span>
              </div>
            )}
            <div className="bg-slate-950/90 border border-cyan-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-black font-mono text-white">
              SCORE: <span className="text-cyan-400 text-xs sm:text-sm">{currentScore}</span>
            </div>
          </div>
        </div>

        {/* 3D Vault Door Container - Responsive Aspect Ratio */}
        <div
          className={cn(
            "w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border-2 border-cyan-500/30 transition-all duration-500 shadow-[0_0_50px_rgba(6,182,212,0.15)]",
            isFullscreen ? "aspect-[21/9] min-h-[260px] sm:min-h-[380px]" : "aspect-[16/10] sm:aspect-[2/1] min-h-[190px] sm:min-h-[320px]"
          )}
          style={{ perspective: '1400px' }}
        >
          {/* Cyber Hazard Borders */}
          <div className="absolute top-0 inset-x-0 h-1.5 sm:h-2 bg-[repeating-linear-gradient(45deg,#06b6d4,#06b6d4_10px,#0f172a_10px,#0f172a_20px)] opacity-60 z-20 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-1.5 sm:h-2 bg-[repeating-linear-gradient(45deg,#06b6d4,#06b6d4_10px,#0f172a_10px,#0f172a_20px)] opacity-60 z-20 pointer-events-none" />

          {/* Left & Right Piston Hardware - Outer Hinges */}
          <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-4 pointer-events-none">
            <div className="w-2 sm:w-2.5 h-8 sm:h-10 bg-slate-700 rounded-full border border-cyan-500/40 shadow-inner" />
            <div className="w-2 sm:w-2.5 h-8 sm:h-10 bg-slate-700 rounded-full border border-cyan-500/40 shadow-inner" />
          </div>
          <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-4 pointer-events-none">
            <div className="w-2 sm:w-2.5 h-8 sm:h-10 bg-slate-700 rounded-full border border-cyan-500/40 shadow-inner" />
            <div className="w-2 sm:w-2.5 h-8 sm:h-10 bg-slate-700 rounded-full border border-cyan-500/40 shadow-inner" />
          </div>

          {/* Vault Core (Revealed when blast doors open) */}
          <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center z-0 p-4">
            <div className="absolute w-48 sm:w-72 h-48 sm:h-72 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '24s' }} />
            <div className="absolute w-36 sm:w-52 h-36 sm:h-52 rounded-full border border-cyan-400/30 border-dashed animate-spin" style={{ animationDuration: '12s' }} />
            
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[9px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-3">
              <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span>ACCESS GRANTED • CIPHER CLEARED</span>
            </div>
            <h2 
              className={cn(
                "font-black tracking-tight text-white transition-all select-text font-mono",
                isFullscreen ? "text-5xl sm:text-8xl" : "text-4xl sm:text-7xl"
              )} 
              style={{ textShadow: '0 0 35px rgba(0, 229, 255, 0.9), 0 0 70px rgba(0, 229, 255, 0.4)' }}
            >
              {activeQuestionData.a}
            </h2>
            <span className="text-[10px] sm:text-xs font-mono text-cyan-300/60 uppercase tracking-widest mt-1 sm:mt-2">
              DECRYPTED QUANTUM SOLUTION
            </span>
          </div>

          {/* Left Blast Door */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-r-2 border-cyan-400/80 z-10 shadow-2xl"
            style={{ originX: 0 }}
            animate={{ rotateY: isOpen ? -108 : 0 }}
            transition={{ duration: 1.05, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="absolute left-0 top-0 w-[200%] h-full flex flex-col items-center justify-center p-3 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300/80 font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3">
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                <span>DECRYPT CIPHER EQUATION</span>
              </div>
              <h1 
                className={cn(
                  "font-black text-cyan-50 transition-all font-mono tracking-tight",
                  isFullscreen ? "text-3xl sm:text-6xl" : "text-2xl sm:text-4xl md:text-5xl"
                )} 
                style={{ textShadow: '0 0 20px rgba(0,229,255,0.7), 2px 2px 10px rgba(0,0,0,0.9)' }}
              >
                {activeQuestionData.q}
              </h1>
            </div>
            
            {/* Left door LEDs moved to OUTER edge (left-2.5) so they NEVER overlap equation text */}
            <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-20">
              <div className={cn("w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border transition-colors shadow", isOpen ? "bg-emerald-400 border-emerald-300 shadow-emerald-400" : "bg-cyan-400/50 border-cyan-300")} />
              <div className={cn("w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border transition-colors shadow", isOpen ? "bg-emerald-400 border-emerald-300 shadow-emerald-400" : "bg-cyan-400/50 border-cyan-300")} />
              <div className={cn("w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border transition-colors shadow", isOpen ? "bg-emerald-400 border-emerald-300 shadow-emerald-400" : "bg-cyan-400/50 border-cyan-300")} />
            </div>
          </motion.div>

          {/* Right Blast Door */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden bg-gradient-to-bl from-slate-800 via-slate-900 to-slate-950 border-l-2 border-cyan-400/80 z-10 shadow-2xl"
            style={{ originX: 1 }}
            animate={{ rotateY: isOpen ? 108 : 0 }}
            transition={{ duration: 1.05, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="absolute right-0 top-0 w-[200%] h-full flex flex-col items-center justify-center p-3 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300/80 font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3">
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                <span>DECRYPT CIPHER EQUATION</span>
              </div>
              <h1 
                className={cn(
                  "font-black text-cyan-50 transition-all font-mono tracking-tight",
                  isFullscreen ? "text-3xl sm:text-6xl" : "text-2xl sm:text-4xl md:text-5xl"
                )} 
                style={{ textShadow: '0 0 20px rgba(0,229,255,0.7), 2px 2px 10px rgba(0,0,0,0.9)' }}
              >
                {activeQuestionData.q}
              </h1>
            </div>

            {/* Right door LEDs moved to OUTER edge (right-2.5) so they NEVER overlap equation text */}
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-20">
              <div className={cn("w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border transition-colors shadow", isOpen ? "bg-emerald-400 border-emerald-300 shadow-emerald-400" : "bg-cyan-400/50 border-cyan-300")} />
              <div className={cn("w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border transition-colors shadow", isOpen ? "bg-emerald-400 border-emerald-300 shadow-emerald-400" : "bg-cyan-400/50 border-cyan-300")} />
              <div className={cn("w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border transition-colors shadow", isOpen ? "bg-emerald-400 border-emerald-300 shadow-emerald-400" : "bg-cyan-400/50 border-cyan-300")} />
            </div>
          </motion.div>
        </div>

        {/* Tactical Keypad & Next Actions - Compact on Mobile */}
        <div className="flex flex-col items-center gap-3 sm:gap-5 w-full max-w-3xl">
          {!hasAnswered ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
              {activeQuestionData.choices?.map((choice: number | string, index: number) => (
                <button
                  key={choice}
                  onClick={() => handleAnswerSubmit(choice)}
                  disabled={isAnimating}
                  className="group relative flex items-center justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 hover:bg-gradient-to-r hover:from-cyan-950/80 hover:to-slate-900 border-2 border-cyan-500/25 hover:border-cyan-400 text-cyan-200 hover:text-white transition-all duration-200 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:scale-[1.02] active:scale-[0.96] cursor-pointer"
                >
                  <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center font-mono text-[11px] sm:text-xs font-black text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                    {index + 1}
                  </span>
                  <span className="font-mono font-black text-lg sm:text-2xl tracking-tight">
                    {choice}
                  </span>
                  <span className="w-6 sm:w-8 opacity-0 group-hover:opacity-100 text-cyan-400 text-xs font-mono font-bold transition-opacity text-right">
                    ↵
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 sm:gap-5 w-full">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
                {activeQuestionData.choices?.map((choice: number | string, index: number) => {
                  const isCorrect = choice === activeQuestionData.a;
                  const isSelected = choice === selectedAnswer;
                  let btnClass = "bg-slate-950/50 border-slate-800 text-slate-500 opacity-60";
                  if (isCorrect) {
                    btnClass = "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]";
                  } else if (isSelected) {
                    btnClass = "bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)]";
                  }
                  return (
                    <div
                      key={choice}
                      className={cn(
                        "flex items-center justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 font-mono font-black text-base sm:text-2xl transition-all",
                        btnClass
                      )}
                    >
                      <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-bold">
                        [{index + 1}]
                      </span>
                      <span>{choice}</span>
                      <span className="text-xs sm:text-sm">
                        {isCorrect && "✓"}
                        {isSelected && !isCorrect && "✗"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Next Barrier Button */}
              <button
                onClick={handleNextRound}
                disabled={isAnimating}
                className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-black uppercase text-xs sm:text-base tracking-widest rounded-xl sm:rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 border border-indigo-400/40 cursor-pointer animate-pulse"
              >
                <span>{solvedCount + 1 >= totalRounds ? "BREACH COMPLETE 🏁" : "NEXT BARRIER ➡️"}</span>
                <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded bg-black/30 border border-white/20">
                  SPACE / ENTER
                </span>
              </button>
            </div>
          )}

          {/* Quick Keyboard Hint Footer (desktop only) */}
          <div className="hidden sm:flex items-center justify-center gap-2 text-[11px] font-mono text-cyan-300/50 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shortcuts: Press [1], [2], [3], [4] on keyboard to crack barrier • [Space/Enter] to advance</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] flex flex-col justify-start items-center select-none relative",
      isFullscreen ? "h-screen max-h-screen overflow-hidden bg-slate-950 p-0" : "p-0"
    )}>
      <style>{`
        @keyframes vault-float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.35; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-260px) rotate(360deg); opacity: 0; }
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
          50% { filter: drop-shadow(0 0 25px rgba(0, 229, 255, 0.95)); }
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
        .cyber-grid-floor {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px);
        }
      `}</style>

      {/* Cyber Grid Background Ambient Field */}
      <div className="absolute inset-0 cyber-grid-floor pointer-events-none z-0 opacity-40" />

      {/* Radial Atmospheric Ambient Spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-[130px] pointer-events-none z-0" />

      {/* Floating Mathematical Glyphs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        {BACKGROUND_FLOATS.map((item, i) => (
          <div
            key={i}
            className="vault-animate-float absolute bottom-[-50px] text-cyan-400 font-mono font-black"
            style={{
              left: item.left,
              fontSize: item.size,
              animationDuration: item.duration,
              animationDelay: item.delay,
              textShadow: '0 0 12px rgba(6,182,212,0.6)'
            }}
          >
            {item.char}
          </div>
        ))}
      </div>

      <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] bg-slate-950/85 backdrop-blur-2xl border-cyan-500/30 shadow-2xl relative transition-all duration-500 z-10 flex flex-col justify-between overflow-hidden",
        isFullscreen ? "h-screen w-screen rounded-none border-none" : "rounded-2xl md:rounded-3xl border-2"
      )}>
        {/* Futuristic Cyber Header - Mobile Responsive */}
        <CardHeader className="p-2.5 sm:p-5 relative border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md shrink-0">
          {/* Top Row: Back to Games + System Tag + Action Controls inline without overlapping */}
          <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 px-2 text-cyan-400 hover:text-white hover:bg-cyan-500/15 rounded-lg border border-cyan-500/25 text-xs font-bold shrink-0"
              >
                <Link href="/games" className="flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono uppercase font-black">Games</span>
                </Link>
              </Button>

              <div className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider truncate max-w-[220px] sm:max-w-none">
                <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0 animate-pulse" />
                <span className="truncate">3D CRYPTO-VAULT</span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 sm:px-2 text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-xs"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-500" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
                <span className="text-[9px] font-mono uppercase hidden sm:inline ml-1">{isMuted ? 'Muted' : 'Sound'}</span>
              </Button>

              {onToggleFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 sm:px-2 text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-xs"
                  onClick={onToggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                  <span className="text-[9px] font-mono uppercase hidden sm:inline ml-1">{isFullscreen ? 'Exit' : 'Full'}</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-2 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
                <Rotate3d className="w-4 h-4 sm:w-7 sm:h-7 text-cyan-400 animate-pulse" />
              </div>
              <CardTitle className="text-lg sm:text-3xl md:text-4xl font-black tracking-tight italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                {gameMode === 'multi' ? '3D Math Race' : '3D Math Vault'}
              </CardTitle>
            </div>

            <CardDescription className={cn(
              "text-cyan-200/70 font-medium text-[11px] sm:text-xs mt-1 max-w-xl",
              gameState === 'playing' ? "hidden sm:block" : "block"
            )}>
              {gameMode === 'multi' 
                ? 'Race your friends to solve equations, split security doors, and breach the core!'
                : 'Crack computational equations to split pneumatic blast doors & claim vault rewards.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-start relative p-3 sm:p-6 transition-all duration-300 flex-1 overflow-y-auto w-full">
          {/* Particles Explosion */}
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

          {/* Lobby HUD during playing state in multiplayer */}
          {multiplayerState === 'playing' && renderLiveHUD()}

          {/* Router based on Game Mode and States */}
          {gameMode === 'single' ? (
            // ================== SINGLE PLAYER ROUTING ==================
            <>
              {/* BRAND NEW WIDESCREEN 3-COLUMN COMMAND DECK LOBBY */}
              {gameState === 'idle' && (
                <div className="w-full max-w-6xl flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-500 py-2 sm:py-4">
                  {/* Daily Bonus Banner if active */}
                  {isDailyBonus && (
                    <div className="w-full bg-gradient-to-r from-cyan-500/15 via-blue-500/20 to-purple-500/15 border-2 border-cyan-400/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 rounded-2xl shadow-lg shadow-cyan-500/30 flex items-center justify-center shrink-0">
                          <Coins className="h-8 w-8 fill-slate-950 animate-bounce" />
                        </div>
                        <div className="space-y-1 text-left">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-[10px] font-black uppercase text-cyan-300 tracking-wider">
                            ⭐ DAILY FLIGHT DIRECTIVE ACTIVE
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                            Quantum Vault Daily Drop
                          </h3>
                          <p className="text-xs sm:text-sm text-cyan-200/70 font-medium">
                            Crack the security barrier today to harvest <span className="text-cyan-300 font-black">+{dailyBonusAmount} Lingo-Coins</span> for your companion pet!
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-cyan-500 text-slate-950 font-black px-4 py-2 text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/30 shrink-0">
                        +{dailyBonusAmount} COINS REWARD
                      </Badge>
                    </div>
                  )}

                  {/* Telemetry Stat Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
                    <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300/60 font-bold">Total Cracked</div>
                        <div className="text-lg font-black text-white font-mono">{usedQuestions.length} Barriers</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300/60 font-bold">Speed Rating</div>
                        <div className="text-lg font-black text-white font-mono">&lt; 3.8s Quantum</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-400">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300/60 font-bold">System Status</div>
                        <div className="text-lg font-black text-emerald-400 font-mono">100% OPERATIONAL</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300/60 font-bold">Best Streak</div>
                        <div className="text-lg font-black text-white font-mono">{bestStreak}x Multiplier</div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Command Cards Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                    
                    {/* CARD 1: SOLO INFILTRATION */}
                    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-cyan-500/30 hover:border-cyan-400/60 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-all duration-300 group">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                            <User className="w-6 h-6" />
                          </div>
                          <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono text-[10px] uppercase tracking-wider">
                            Single Agent
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                            Solo Infiltration
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Solve mathematical equations to crack heavy 3D blast doors at your own rhythm.
                          </p>
                        </div>

                        {/* Difficulty Quick Selector */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-cyan-400">
                            <span>Select Difficulty</span>
                            <span className="text-slate-500">{difficulty.toUpperCase()}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => {
                                  playSfx('click');
                                  setDifficulty(d);
                                }}
                                className={cn(
                                  "py-2 rounded-xl border text-xs font-mono font-black uppercase transition-all cursor-pointer",
                                  difficulty === d
                                    ? d === 'easy'
                                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                      : d === 'medium'
                                      ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                                      : "bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                                )}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium h-4">
                            {difficulty === 'easy' && "🟢 Addition, Subtraction & Division"}
                            {difficulty === 'medium' && "🟡 PEMDAS Order of Ops & Square Roots"}
                            {difficulty === 'hard' && "🔴 Exponents, Compound Algebra & Powers"}
                          </div>
                        </div>

                        {/* Rounds Quick Selector */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-cyan-400">
                            <span>Number of Vaults</span>
                            <span className="text-slate-500">{roundsCount} DOORS</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[5, 8, 10, 15, 20].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => {
                                  playSfx('click');
                                  setRoundsCount(r);
                                }}
                                className={cn(
                                  "py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer",
                                  roundsCount === r
                                    ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                )}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mt-6 pt-4 border-t border-slate-800">
                        <button
                          onClick={() => startSinglePlayer(difficulty)}
                          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-slate-950" />
                          <span>INITIALIZE SOLO BREACH</span>
                        </button>
                        <button
                          onClick={() => {
                            playSfx('click');
                            setGameState('instructions');
                          }}
                          className="w-full py-2 text-xs font-mono font-bold text-cyan-400/70 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          View Mission Protocol & Rules →
                        </button>
                      </div>
                    </div>

                    {/* CARD 2: MULTIPLAYER CIPHER RACE */}
                    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-purple-500/30 hover:border-purple-400/60 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-all duration-300 group">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                          </div>
                          <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono text-[10px] uppercase tracking-wider">
                            Live PvP Race
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                            Multiplayer Race
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Battle friends or students in real-time. First operative to solve all barriers wins!
                          </p>
                        </div>

                        {/* Callsign Input */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <label className="text-[10px] uppercase font-mono tracking-widest text-purple-400 block font-bold">
                            Operative Callsign
                          </label>
                          <input
                            type="text"
                            maxLength={15}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Enter callsign..."
                            className="w-full bg-slate-950 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-400 font-mono font-bold"
                          />
                        </div>

                        {/* Room Code Quick Join */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <label className="text-[10px] uppercase font-mono tracking-widest text-purple-400 block font-bold">
                            Have a Room Code?
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={codeVal}
                              onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
                              placeholder="CODE"
                              className="flex-1 bg-slate-950 border border-purple-500/30 rounded-xl px-3 py-2 text-center text-sm font-mono font-black text-purple-300 placeholder-slate-700 tracking-widest uppercase focus:outline-none focus:border-purple-400"
                            />
                            <button
                              onClick={() => {
                                playSfx('click');
                                setGameMode('multi');
                                setMultiplayerState('join_room');
                              }}
                              className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600 border border-purple-400/40 text-purple-200 hover:text-white rounded-xl font-mono text-xs font-bold transition-all cursor-pointer"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mt-6 pt-4 border-t border-slate-800">
                        <button
                          onClick={() => {
                            playSfx('click');
                            setGameMode('multi');
                            setMultiplayerState('create_room');
                          }}
                          className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 via-fuchsia-600 to-indigo-600 hover:from-purple-400 hover:via-fuchsia-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Gamepad2 className="w-4 h-4" />
                          <span>HOST MULTIPLAYER RACE</span>
                        </button>
                        <div className="text-center text-[10px] font-mono text-purple-300/60 py-1">
                          Auto-generated or custom questions supported
                        </div>
                      </div>
                    </div>

                    {/* CARD 3: 3D VAULT MECHANICS & HOLO-PREVIEW */}
                    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-indigo-500/30 hover:border-indigo-400/60 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-all duration-300 group">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                            <Rotate3d className="w-6 h-6 animate-pulse" />
                          </div>
                          <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono text-[10px] uppercase tracking-wider">
                            Interactive 3D
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                            Vault Mechanics
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Watch heavy pneumatic blast doors swing open in 3D perspective when breached!
                          </p>
                        </div>

                        {/* Interactive Mini-Vault Preview Model */}
                        <div 
                          onClick={() => {
                            playSfx('door');
                            setPreviewOpen(!previewOpen);
                          }}
                          className="w-full h-32 rounded-2xl bg-slate-950 border border-indigo-500/30 overflow-hidden relative cursor-pointer select-none group/mini shadow-inner"
                          style={{ perspective: '800px' }}
                          title="Click to test door mechanics"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/60 via-purple-950/60 to-cyan-950/60 flex flex-col items-center justify-center z-0">
                            <span className="text-[10px] font-mono font-bold text-cyan-300">CORE REVEALED</span>
                            <span className="text-2xl font-black text-white font-mono">7 × 8 = 56</span>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold">✓ TEST UNLOCKED</span>
                          </div>

                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-slate-800 to-slate-900 border-r border-indigo-400/50 z-10 flex items-center justify-center shadow-lg"
                            style={{ originX: 0 }}
                            animate={{ rotateY: previewOpen ? -100 : 0 }}
                            transition={{ duration: 0.8 }}
                          >
                            <span className="text-xs font-mono font-black text-indigo-300">7 ×</span>
                          </motion.div>

                          <motion.div
                            className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-slate-800 to-slate-900 border-l border-indigo-400/50 z-10 flex items-center justify-center shadow-lg"
                            style={{ originX: 1 }}
                            animate={{ rotateY: previewOpen ? 100 : 0 }}
                            transition={{ duration: 0.8 }}
                          >
                            <span className="text-xs font-mono font-black text-indigo-300">8</span>
                          </motion.div>

                          <div className="absolute bottom-1 inset-x-0 text-center text-[9px] font-mono text-slate-400 z-20 pointer-events-none group-hover/mini:text-cyan-300">
                            {previewOpen ? "Click to lock doors" : "Click to test 3D blast doors"}
                          </div>
                        </div>

                        {/* 3 Tactical Intel Bullet Points */}
                        <div className="space-y-2.5 text-xs text-slate-300">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">1</span>
                            <span>Equations projected across twin hydraulic blast doors.</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">2</span>
                            <span>Calculate answer & press keys <strong>[1], [2], [3], [4]</strong>.</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">3</span>
                            <span>Harvest Lingo-Coins to feed & evolve your companion pet.</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-indigo-300/80">
                        <span>Pneumatic Lock Engine</span>
                        <span className="font-bold">3D Perspective v2.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MISSION INSTRUCTIONS TERMINAL */}
              {gameState === 'instructions' && (
                <div className="w-full max-w-4xl space-y-6 text-center animate-in fade-in zoom-in duration-300 px-4 py-4">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-3xl border-2 border-cyan-500/30 shadow-2xl relative overflow-hidden text-left">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                            Decryptor Mission Protocol
                          </h3>
                          <p className="text-xs text-cyan-300/60 font-mono">
                            TACTICAL OPERATIVE BRIEFING & ARITHMETIC LOCK SPECIFICATION
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-[10px]">
                        VERSION 2.5
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase font-mono">
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs">1</span>
                          <span>Observe The Equation</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Mathematical problems are split across the blast doors. Compute the exact solution before entering your answer.
                        </p>
                      </div>

                      <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase font-mono">
                          <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs">2</span>
                          <span>Keypad or Hotkeys</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Click any of the 4 illuminated choices or press numeric keys <strong>[1], [2], [3], [4]</strong> on your physical keyboard.
                        </p>
                      </div>

                      <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase font-mono">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                          <span>3D Hydraulic Override</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          A correct calculation disengages pneumatic locks, swinging both blast doors open to reveal the vault core.
                        </p>
                      </div>

                      <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase font-mono">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs">4</span>
                          <span>Streak Rewards & Multipliers</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Maintain continuous correct solutions to build your streak multiplier and maximize Lingo-Coin rewards.
                        </p>
                      </div>
                    </div>

                    {/* Difficulty and Rounds Configurator */}
                    <div className="bg-slate-900/80 p-5 rounded-2xl border border-cyan-500/20 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">
                          Configure Vault Sequence
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono">Tier:</span>
                          <div className="flex gap-1.5">
                            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => {
                                  playSfx('click');
                                  setDifficulty(d);
                                }}
                                className={cn(
                                  "px-3 py-1 rounded-lg border text-xs font-mono font-bold uppercase cursor-pointer",
                                  difficulty === d
                                    ? "bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                )}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                        <span className="text-xs text-slate-400 font-mono">Number of Vault Barriers:</span>
                        <div className="grid grid-cols-5 gap-2">
                          {[5, 8, 10, 15, 20].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                playSfx('click');
                                setRoundsCount(r);
                              }}
                              className={cn(
                                "py-1.5 px-3 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer text-center",
                                roundsCount === r 
                                  ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow"
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-slate-800">
                      <Button 
                        onClick={() => startSinglePlayer(difficulty)} 
                        size="lg" 
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-widest py-6 border border-cyan-400/40 shadow-lg cursor-pointer text-base rounded-2xl"
                      >
                        <Play className="w-5 h-5 fill-slate-950 mr-2" />
                        COMMENCE DECRYPTION ({roundsCount} VAULTS)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setGameState('idle')}
                        className="border-slate-800 text-slate-400 hover:text-white rounded-2xl py-6 px-6 font-bold cursor-pointer"
                      >
                        ← Back to Command Deck
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TIER PICKER IF DIRECTED TO PLAYING BEFORE GENERATING QUESTIONS */}
              {gameState === 'playing' && singleQuestions.length === 0 && (
                <div className="w-full max-w-3xl flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 px-4 py-6">
                  <div className="text-center space-y-2">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase font-mono text-[10px]">
                      CIPHER TIER SELECTION
                    </Badge>
                    <h3 className="text-3xl font-black text-white tracking-tight uppercase">Choose Computing Difficulty</h3>
                    <p className="text-cyan-200/60 text-sm">Select the mathematical computational complexity tier for this infiltration run.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-2">
                    <button
                      onClick={() => startSinglePlayer('easy')}
                      className="group p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border-2 border-emerald-500/30 hover:border-emerald-400 text-left transition-all duration-200 shadow-xl hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-black text-sm">
                          01
                        </div>
                        <h4 className="text-lg font-black text-white uppercase">EASY TIER</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Basic arithmetic, quick sums, subtraction and clean integer division.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400 font-bold flex items-center justify-between">
                        <span>Multiplier: 1.0x</span>
                        <span>Start →</span>
                      </div>
                    </button>

                    <button
                      onClick={() => startSinglePlayer('medium')}
                      className="group p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border-2 border-amber-500/30 hover:border-amber-400 text-left transition-all duration-200 shadow-xl hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-black text-sm">
                          02
                        </div>
                        <h4 className="text-lg font-black text-white uppercase">MEDIUM TIER</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          PEMDAS order of operations, square roots, parentheses and mixed algebra.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-amber-400 font-bold flex items-center justify-between">
                        <span>Multiplier: 1.5x</span>
                        <span>Start →</span>
                      </div>
                    </button>

                    <button
                      onClick={() => startSinglePlayer('hard')}
                      className="group p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border-2 border-rose-500/30 hover:border-rose-400 text-left transition-all duration-200 shadow-xl hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-black text-sm">
                          03
                        </div>
                        <h4 className="text-lg font-black text-white uppercase">HARD TIER</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Exponents, multi-step compound equations, negative roots and powers.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-rose-400 font-bold flex items-center justify-between">
                        <span>Multiplier: 2.0x</span>
                        <span>Start →</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE SINGLE PLAYER STAGE */}
              {gameState === 'playing' && singleQuestions.length > 0 && renderVaultGameStage(false)}

              {/* VICTORY CELEBRATION SCREEN */}
              {gameState === 'finished' && (
                <div className="flex flex-col items-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
                  <div className="p-3 sm:p-4 bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl border border-cyan-400/40 shadow-2xl relative">
                    <Trophy className="w-16 h-16 sm:w-28 sm:h-28 text-cyan-400 drop-shadow-[0_0_30px_rgba(0,229,255,0.8)] animate-bounce" />
                  </div>

                  <div className="text-center space-y-1.5 sm:space-y-2">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest px-3 py-0.5 sm:py-1">
                      SECURITY OVERRIDDEN • SYSTEM CLEARED
                    </Badge>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-white">
                      Vault Decrypted
                    </h2>
                    <p className="text-slate-400 font-medium text-xs sm:text-base">
                      Completed {totalRounds} barriers on <span className="text-cyan-300 font-bold uppercase">{difficulty}</span> tier.
                    </p>
                  </div>

                  {/* Score & Streak Stats Card */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full bg-slate-900/80 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-xl text-center">
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-400 font-bold">Total Score</div>
                      <div className="text-lg sm:text-2xl font-black text-cyan-400 font-mono">{solvedCount * 100}</div>
                    </div>
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-400 font-bold">Best Streak</div>
                      <div className="text-lg sm:text-2xl font-black text-amber-400 font-mono">{bestStreak}x</div>
                    </div>
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-400 font-bold">Accuracy</div>
                      <div className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">100%</div>
                    </div>
                  </div>

                  {isDailyBonus && (
                    <div className="relative w-full bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-cyan-500/10 border-2 border-cyan-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-2 sm:gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-1 z-10">
                      <div className="vault-glow-coin bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 p-3 sm:p-4 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 relative">
                        <Coins className="h-7 w-7 sm:h-10 sm:w-10 fill-cyan-950 text-cyan-950 animate-spin" style={{ animationDuration: '5s' }} />
                        <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-900 shadow">
                          CLAIMED
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-cyan-400 tracking-wide uppercase">Daily Bonus Harvested!</h3>
                      <p className="text-xs sm:text-sm font-semibold text-slate-400 text-center max-w-xs leading-relaxed">
                        You cracked the Daily Vault and earned <span className="text-cyan-400 font-black">+{dailyBonusAmount} Lingo-Coins</span> for your companion pet!
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center z-10 relative mt-1 sm:mt-2 w-full sm:w-auto">
                    <Button 
                      onClick={() => startSinglePlayer(difficulty)} 
                      size="lg" 
                      className="rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-6 font-bold bg-cyan-600 hover:bg-cyan-500 text-white hover:scale-105 transition-transform shadow-lg shadow-cyan-500/25 border border-cyan-500/30 cursor-pointer text-xs sm:text-sm"
                    >
                      <RotateCcw className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> RE-DECRYPT ({difficulty.toUpperCase()})
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setGameState('idle')} 
                      size="lg" 
                      className="rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-6 font-bold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer text-xs sm:text-sm"
                    >
                      ← Back to Command Deck
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // ================== MULTIPLAYER ROUTING ==================
            <>
              {multiplayerState === 'mode_select' && renderMultiplayerSetup()}
              {multiplayerState === 'create_room' && renderCreateRoom()}
              {multiplayerState === 'join_room' && renderJoinRoom()}
              {multiplayerState === 'lobby' && renderLobby()}
              {multiplayerState === 'finished' && renderMultiplayerResults()}

              {multiplayerState === 'playing' && (
                isWaitingForOthers ? (
                  <div className="flex flex-col items-center justify-center gap-6 py-16 animate-pulse text-center w-full max-w-2xl bg-slate-950/40 p-10 border border-white/5 rounded-3xl backdrop-blur-sm">
                    <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/30">
                      <Rotate3d className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider">All Barriers Cleared! 🏁</h3>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-semibold">
                      You finished the race! Waiting for other operatives to finish their decrypt runs...
                    </p>
                  </div>
                ) : (
                  renderVaultGameStage(true)
                )
              )}
            </>
          )}
        </CardContent>

        {/* Tactical Cockpit Footer - Mobile First Single Row */}
        <CardFooter className="bg-slate-950/90 p-2.5 sm:p-4 flex items-center justify-between gap-2 border-t border-cyan-500/20">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {gameMode === 'multi' ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLeaveRoom} 
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold cursor-pointer rounded-xl text-xs h-8 px-2.5"
              >
                LEAVE
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold cursor-pointer rounded-xl text-xs h-8 px-2.5">
                <Link href="/games">EXIT</Link>
              </Button>
            )}
            {gameState === 'playing' && gameMode === 'single' && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => startSinglePlayer(difficulty)} 
                className="font-bold border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer rounded-xl text-xs h-8 px-2"
              >
                <RotateCcw className="mr-1 w-3 h-3" /> <span className="hidden sm:inline">RESTART BARRIER</span><span className="sm:hidden">RESTART</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {gameMode === 'single' && (
              <Button 
                variant="outline" 
                onClick={clearMemory} 
                size="sm" 
                className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-mono text-[11px] sm:text-xs rounded-xl h-8 px-2"
                title="Reset History"
              >
                <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Reset History</span>
              </Button>
            )}

            {gameState === 'playing' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400/80 uppercase">
                <span className="text-[10px] sm:text-xs">{solvedCount}/{totalRounds}</span>
                <div className="w-16 sm:w-28 h-2 bg-cyan-950/60 rounded-full overflow-hidden border border-cyan-500/20">
                  <motion.div 
                    className="h-full bg-cyan-400 shadow-[0_0_10px_#00e5ff]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(solvedCount / totalRounds) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Local Toast overlay inside fullscreen container */}
      <AnimatePresence>
        {localToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "absolute bottom-10 right-10 z-[99999] max-w-sm rounded-2xl p-5 border-2 shadow-2xl backdrop-blur-md transition-all duration-300",
              localToast.variant === 'destructive'
                ? "bg-rose-950/95 border-rose-500/40 text-rose-250"
                : "bg-slate-950/95 border-cyan-500/40 text-cyan-200"
            )}
          >
            <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              {localToast.variant === 'destructive' ? '⚠️' : '✨'} {localToast.title}
            </h4>
            <p className="text-xs mt-1 text-slate-300 leading-relaxed font-semibold">{localToast.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
