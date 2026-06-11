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
  Trash2,
  Users,
  User,
  Clock,
  Play,
  Gamepad2
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
  a: number;
  choices: number[];
}

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

  // Upgraded Multiple Choice Selection states
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = React.useState(false);
  const [singleQuestions, setSingleQuestions] = React.useState<MathProblem[]>([]);

  // Multiplayer Room states
  const [myUid, setMyUid] = React.useState<string>('');
  const [nickname, setNickname] = React.useState<string>('');
  const [roomCode, setRoomCode] = React.useState<string>('');
  const [isHost, setIsHost] = React.useState<boolean>(false);
  const [roomData, setRoomData] = React.useState<any>(null);
  const [roomPlayers, setRoomPlayers] = React.useState<any[]>([]);

  const { user, userProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

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

  // Sync Room Updates in Lobby and Play (Multiplayer)
  React.useEffect(() => {
    if (!firestore || !roomCode || gameMode !== 'multi') return;
    
    const roomRef = doc(firestore, "math_vault_rooms", roomCode);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        toast({
          title: "Room Disbanded 🚨",
          description: "The host has closed this room.",
          variant: "destructive"
        });
        resetMultiplayerState();
        return;
      }
      
      const data = snapshot.data();
      setRoomData(data);
      
      const list = Object.values(data.players || {}) as any[];
      setRoomPlayers(list);
      
      if (data.difficulty) setDifficulty(data.difficulty as Difficulty);
      if (data.roundsCount) setRoundsCount(data.roundsCount);
      
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
      console.error("Firestore math_vault_rooms snapshot error:", error);
    });
    
    return () => unsubscribe();
  }, [firestore, roomCode, gameMode, multiplayerState]);

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
      toast({
        title: "Nickname Required ✏️",
        description: "Please enter your name before creating a room.",
        variant: "destructive"
      });
      return;
    }
    
    const code = Array.from({ length: 5 }, () => 
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    
    const hostUid = user?.uid || `guest_${Date.now()}`;
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
      const roomRef = doc(firestore, "math_vault_rooms", code);
      await setDoc(roomRef, {
        code,
        hostId: hostUid,
        hostName: nickname,
        difficulty,
        roundsCount,
        status: 'lobby',
        players: initialPlayers,
        questions: [],
        createdAt: Date.now()
      });
      
      setRoomCode(code);
      setIsHost(true);
      setMultiplayerState('lobby');
      setGameState('playing');
      toast({
        title: "Room Created! 🚪🔑",
        description: `Your code is ${code}. Share with up to 2 friends!`,
      });
    } catch (e) {
      console.error("Failed to create room", e);
      toast({
        title: "Database Error",
        description: "Could not initialize room on server. Try again.",
        variant: "destructive"
      });
    }
  };

  const handleJoinRoom = async (codeToJoin: string) => {
    if (!firestore) return;
    const cleanCode = codeToJoin.trim().toUpperCase();
    if (cleanCode.length !== 5) {
      toast({
        title: "Invalid Code",
        description: "Invitation codes must be exactly 5 letters.",
        variant: "destructive"
      });
      return;
    }
    if (!nickname.trim()) {
      toast({
        title: "Nickname Required ✏️",
        description: "Please enter your name before joining.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const roomRef = doc(firestore, "math_vault_rooms", cleanCode);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        toast({
          title: "Room Not Found 🔍",
          description: `No active room exists with code: ${cleanCode}`,
          variant: "destructive"
        });
        return;
      }
      
      const data = roomSnap.data();
      if (data.status !== 'lobby') {
        toast({
          title: "Game In Progress 🏎️",
          description: "This room is currently playing or has already finished.",
          variant: "destructive"
        });
        return;
      }
      
      const list = Object.values(data.players || {});
      if (list.length >= 3) {
        toast({
          title: "Room Full 👥",
          description: "This lobby has reached the maximum of 3 players.",
          variant: "destructive"
        });
        return;
      }
      
      const playerUid = user?.uid || `guest_${Date.now()}`;
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
      toast({
        title: "Connected! 🤝",
        description: `Joined room ${cleanCode}. Waiting for the host to launch.`,
      });
    } catch (e) {
      console.error("Failed to join room", e);
      toast({
        title: "Connection Failed",
        description: "Could not connect to room. Check connection.",
        variant: "destructive"
      });
    }
  };

  const handleLeaveRoom = async () => {
    if (!firestore || !roomCode) {
      resetMultiplayerState();
      return;
    }
    
    try {
      const roomRef = doc(firestore, "math_vault_rooms", roomCode);
      if (isHost) {
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

  const resetMultiplayerState = () => {
    setRoomCode('');
    setMyUid('');
    setIsHost(false);
    setRoomData(null);
    setRoomPlayers([]);
    setMultiplayerState('mode_select');
    setGameState('idle');
  };

  const handleStartGameMultiplayer = async () => {
    if (!firestore || !roomCode || !isHost) return;
    if (roomPlayers.length < 2) {
      toast({
        title: "Waiting for Competitors 👥",
        description: "Need at least 2 players in the lobby to start.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const questionsList: any[] = [];
      const tempUsed: string[] = [];
      for (let i = 0; i < roundsCount; i++) {
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
      
      const roomRef = doc(firestore, "math_vault_rooms", roomCode);
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
      toast({
        title: "Launch Failed",
        description: "Error launching the race. Try again.",
        variant: "destructive"
      });
    }
  };

  const startSinglePlayer = (selectedDiff: Difficulty) => {
    setDifficulty(selectedDiff);
    setSolvedCount(0);
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

  const handleAnswerSubmit = async (choice: number) => {
    if (hasAnswered || isAnimating) return;
    
    setSelectedAnswer(choice);
    setHasAnswered(true);
    
    const isCorrect = choice === activeQuestionData.a;
    
    setIsAnimating(true);
    setIsOpen(true);
    
    if (isCorrect) {
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
    }
    
    if (gameMode === 'multi' && firestore && roomCode) {
      try {
        const roomRef = doc(firestore, "math_vault_rooms", roomCode);
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
      if (gameMode === 'multi') {
        if (firestore && roomCode) {
          try {
            const roomRef = doc(firestore, "math_vault_rooms", roomCode);
            await updateDoc(roomRef, {
              [`players.${myUid}.finished`]: true
            });
            
            const updatedPlayers = { ...roomData.players };
            updatedPlayers[myUid].finished = true;
            
            const allFinished = Object.values(updatedPlayers).every((p: any) => p.finished);
            if (allFinished) {
              const sorted = Object.values(updatedPlayers).sort((a: any, b: any) => b.score - a.score);
              const winner = sorted[0];
              await updateDoc(roomRef, {
                status: 'finished',
                winnerId: winner.uid,
                winnerName: winner.name
              });
            } else {
              setMultiplayerState('finished');
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
        toast({
          title: "Vault System Fully Decrypted! 🏆💎",
          description: "You've successfully solved all math barriers! Lingo-Coins awarded.",
        });
      }
      setIsAnimating(false);
    } else {
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
      toast({
        title: "Memory Cleared",
        description: "Vault database combination cache has been purged.",
      });
    }
  };

  // Rendering Helper Components
  const renderLiveHUD = () => {
    if (gameMode !== 'multi') return null;
    return (
      <div className="w-full max-w-lg bg-slate-950/90 px-6 py-3.5 rounded-2xl border border-cyan-500/20 shadow-xl flex flex-col gap-2.5 mb-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-cyan-400 border-b border-cyan-500/10 pb-1.5 font-bold">
          <span>👥 Live Race Standings</span>
          <span>ROOM: {roomCode}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {roomPlayers.map((player) => {
            const isMe = player.uid === myUid;
            const progress = (player.solvedCount / roundsCount) * 100;
            return (
              <div key={player.uid} className={cn(
                "flex flex-col gap-1 p-2 rounded-xl transition-all",
                isMe ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-slate-900/40"
              )}>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-white">
                    {player.name} {isMe && <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-black">You</span>}
                    {player.finished && ' 🏁'}
                  </span>
                  <span className="text-cyan-300 font-mono text-[11px]">
                    Round {Math.min(player.solvedCount, roundsCount)}/{roundsCount} • {player.score} pts
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
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
      <div className="w-full max-w-md flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 px-6 py-4">
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-5">
          <div className="text-center space-y-1">
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest font-mono text-[9px] px-2.5 py-1 mb-2">
              Setup Multiplayer
            </Badge>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">
              Math Race
            </h3>
            <p className="text-cyan-200/50 text-xs">Set up a race and share codes with friends</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/85 block font-bold">
              Enter Nickname
            </label>
            <input
              type="text"
              maxLength={15}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-slate-900 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              onClick={() => setMultiplayerState('create_room')}
              className="h-28 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-black text-sm flex flex-col items-center justify-center gap-2 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Users className="w-7 h-7" />
              CREATE ROOM
            </Button>
            <Button
              onClick={() => setMultiplayerState('join_room')}
              className="h-28 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-slate-950 font-black text-sm flex flex-col items-center justify-center gap-2 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Gamepad2 className="w-7 h-7" />
              JOIN ROOM
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setGameMode('single');
              setGameState('idle');
            }}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 mt-2 font-bold cursor-pointer"
          >
            ← Back to Main Menu
          </Button>
        </div>
      </div>
    );
  };

  const renderCreateRoom = () => {
    return (
      <div className="w-full max-w-md flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 px-6 py-4">
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-5">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">
              Room Parameters
            </h3>
            <p className="text-cyan-200/50 text-xs">Configure your multiplayer game parameters</p>
          </div>

          {/* Difficulty Option */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/80 block font-bold">
              Select Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={cn(
                    "py-2.5 rounded-xl border font-bold text-xs uppercase transition-all cursor-pointer",
                    difficulty === diff
                      ? diff === 'easy'
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : diff === 'medium'
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-300"
                          : "bg-rose-500/20 border-rose-500 text-rose-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Rounds Option */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/80 block font-bold">
              Number of Rounds
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 8, 10, 15, 20].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoundsCount(r)}
                  className={cn(
                    "py-2 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer",
                    roundsCount === r
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-4">
            <Button
              onClick={handleCreateRoom}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest py-6 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              GENERATE INVITATION CODE
            </Button>
            <Button
              variant="ghost"
              onClick={() => setMultiplayerState('mode_select')}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderJoinRoom = () => {
    const [codeVal, setCodeVal] = React.useState('');
    return (
      <div className="w-full max-w-md flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 px-6 py-4">
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-5">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">
              Enter Code
            </h3>
            <p className="text-cyan-200/50 text-xs">Enter invitation code to join game</p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/80 block font-bold">
              Enter 5-Letter Code
            </label>
            <input
              type="text"
              maxLength={5}
              value={codeVal}
              onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
              placeholder="e.g. ABCDE"
              className="w-full bg-slate-900 border border-cyan-500/20 rounded-xl px-4 py-3 text-center text-2xl font-mono font-black text-white placeholder-slate-800 tracking-[0.3em] focus:outline-none focus:border-cyan-500 transition-all uppercase"
            />
          </div>

          <div className="flex flex-col gap-2.5 mt-4">
            <Button
              onClick={() => handleJoinRoom(codeVal)}
              disabled={codeVal.trim().length !== 5}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest py-6 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              CONNECT TO ROOM
            </Button>
            <Button
              variant="ghost"
              onClick={() => setMultiplayerState('mode_select')}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderLobby = () => {
    return (
      <div className="w-full max-w-md flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 px-6 py-4">
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col gap-5">
          <div className="text-center space-y-1">
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest font-mono text-[9px] px-2.5 py-1">
              Multiplayer Lobby
            </Badge>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase mt-2">
              Invitation Code
            </h3>
            <p className="text-slate-400 text-xs">Share this code with your competitors</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-900/80 py-4 px-6 rounded-2xl border border-cyan-500/10 shadow-inner">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/60 mb-1 font-bold">Room Code</span>
            <span className="text-4xl font-mono font-black text-cyan-300 tracking-[0.2em]">{roomCode}</span>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono block">
              👥 Connected Players ({roomPlayers.length} / 3)
            </span>
            <div className="flex flex-col gap-2">
              {roomPlayers.map((player, idx) => (
                <div key={player.uid || idx} className="flex justify-between items-center bg-slate-900/60 px-4 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{player.name}</span>
                    {player.uid === myUid && (
                      <span className="text-[8px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded uppercase font-black">
                        You
                      </span>
                    )}
                  </div>
                  {player.isHost ? (
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-mono font-bold">
                      Host
                    </span>
                  ) : (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-mono font-bold">
                      Ready
                    </span>
                  )}
                </div>
              ))}
              {roomPlayers.length < 2 && (
                <p className="text-[11px] text-yellow-400/80 italic text-center mt-1">
                  Waiting for at least 1 competitor to connect...
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl text-xs space-y-2 font-medium text-slate-350">
            <div className="flex justify-between">
              <span className="text-slate-500">Difficulty:</span>
              <span className="text-cyan-400 font-bold uppercase">{difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Rounds:</span>
              <span className="text-cyan-400 font-bold">{roundsCount} Rounds</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            {isHost ? (
              <Button
                onClick={handleStartGameMultiplayer}
                disabled={roomPlayers.length < 2}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black tracking-widest py-6 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                START GAME 🚀
              </Button>
            ) : (
              <div className="w-full py-4 text-center bg-slate-900/60 border border-white/5 rounded-xl text-slate-450 text-xs font-semibold animate-pulse">
                Waiting for host to start the game...
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLeaveRoom}
              className="w-full border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-bold cursor-pointer"
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
    const isWinnerMe = winner?.uid === myUid;
    
    return (
      <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-xl mx-auto py-6">
        <Trophy className="w-32 h-32 text-cyan-400 drop-shadow-[0_0_20px_rgba(0,229,255,0.6)] animate-bounce" />
        
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-white">
            Race Completed!
          </h2>
          <p className="text-slate-350 font-medium text-lg">
            Winner: <span className="text-cyan-400 text-3xl font-black">{winner?.name || 'Unknown'} ({winner?.score || 0} pts)</span>
          </p>
        </div>

        <div className="w-full bg-slate-950/80 rounded-2xl border border-cyan-500/20 p-5 flex flex-col gap-3 shadow-inner">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono block border-b border-white/5 pb-2">
            🏆 Final Standings
          </span>
          <div className="flex flex-col gap-2">
            {sortedPlayers.map((player, idx) => {
              const isMe = player.uid === myUid;
              const isCurrentWinner = player.uid === winner?.uid;
              return (
                <div 
                  key={player.uid || idx} 
                  className={cn(
                    "flex justify-between items-center px-4 py-3.5 rounded-xl border transition-all",
                    isCurrentWinner 
                      ? "bg-cyan-500/10 border-cyan-500/40 text-white" 
                      : "bg-slate-900/60 border-white/5 text-slate-350"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black",
                      idx === 0 ? "bg-amber-500 text-slate-950" : idx === 1 ? "bg-slate-300 text-slate-950" : "bg-orange-850 text-white"
                    )}>
                      {idx + 1}
                    </span>
                    <span className="font-bold">{player.name}</span>
                    {isMe && <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-black font-mono">You</span>}
                  </div>
                  <span className="font-mono font-bold text-cyan-300 text-lg">{player.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          {isHost ? (
            <Button 
              onClick={async () => {
                try {
                  const roomRef = doc(firestore, "math_vault_rooms", roomCode);
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
              className="rounded-full px-8 font-bold bg-cyan-600 text-white hover:scale-105 transition-transform shadow-lg shadow-cyan-500/25 border border-cyan-500/30 cursor-pointer"
            >
              Play Again (Lobby)
            </Button>
          ) : (
            <div className="text-xs font-mono text-slate-400 py-3 animate-pulse bg-slate-900/40 px-6 border border-white/5 rounded-full">
              Waiting for host to recreate lobby...
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={handleLeaveRoom} 
            size="lg" 
            className="rounded-full px-8 font-bold border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
          >
            Leave Room
          </Button>
        </div>
      </div>
    );
  };

  if (!game) return null;

  const isWaitingForOthers = gameMode === 'multi' && solvedCount >= roundsCount && roomData?.status === 'playing';

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
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-cyan-400/70 hover:text-cyan-300 hover:bg-cyan-500/10 z-[100] cursor-pointer"
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
            {gameMode === 'multi' ? '3D Math Race' : '3D Math Vault'}
          </CardTitle>
          <CardDescription className="text-cyan-200/60 font-medium">
            {gameMode === 'multi' 
              ? 'Race your friends to solve equations, bypass security, and hack the vaults!'
              : 'Crack computational equations to split the security doors and claim content access.'}
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

          {/* Lobby HUD during playing state in multiplayer */}
          {multiplayerState === 'playing' && renderLiveHUD()}

          {/* Router based on Game Mode and States */}
          {gameMode === 'single' ? (
            // ================== SINGLE PLAYER ROUTING ==================
            <>
              {gameState === 'idle' && (
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
                  {isDailyBonus && (
                    <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-cyan-500/20 animate-pulse mb-2">
                      <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                      ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
                    </Badge>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm">
                    <Button 
                      onClick={() => setGameState('instructions')} 
                      size="lg" 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-300 font-bold text-white shadow-xl shadow-cyan-500/10 border border-cyan-400/20 cursor-pointer"
                    >
                      PLAY SOLO
                    </Button>
                    <Button 
                      onClick={() => {
                        setGameMode('multi');
                        setMultiplayerState('mode_select');
                      }} 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 transition-all duration-300 font-bold text-white shadow-xl shadow-purple-500/10 border border-purple-400/20 cursor-pointer"
                    >
                      PLAY MULTIPLAYER
                    </Button>
                  </div>
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
                        <span>Calculate the correct answer and click the matching choice below.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xs text-cyan-400 shrink-0">3</span>
                        <span>Clicking a choice swings open the 3D doors to show the vault core.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xs text-cyan-400 shrink-0">4</span>
                        <span>Solve all **{roundsCount} vaults** to successfully bypass security!</span>
                      </li>
                    </ul>
                  </div>

                  {/* Rounds configuration option */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-cyan-500/10 space-y-2 text-left">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">Configure Rounds</span>
                    <div className="grid grid-cols-5 gap-2">
                      {[5, 8, 10, 15, 20].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRoundsCount(r)}
                          className={cn(
                            "py-1.5 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer",
                            roundsCount === r 
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => setGameState('playing')} size="lg" className="w-full bg-cyan-605 hover:bg-cyan-500 text-white font-black tracking-widest border border-cyan-400/30 shadow-lg cursor-pointer">
                    CHOOSE DIFFICULTY
                  </Button>
                </div>
              )}

              {gameState === 'playing' && singleQuestions.length === 0 && (
                <div className="w-full max-w-md flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 px-6 py-4">
                  <div className="text-center space-y-1">
                    <h3 className="text-2xl font-black text-cyan-300 tracking-tighter uppercase">Select Difficulty</h3>
                    <p className="text-cyan-200/50 text-sm">Choose the computing difficulty tier</p>
                  </div>

                  <div className="flex flex-col gap-3 w-full mt-4">
                    <Button
                      onClick={() => startSinglePlayer('easy')}
                      variant="outline"
                      className="h-16 border-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-black text-lg transition-all cursor-pointer"
                    >
                      EASY (Sums & Simple Algebra)
                    </Button>
                    <Button
                      onClick={() => startSinglePlayer('medium')}
                      variant="outline"
                      className="h-16 border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-slate-950 font-black text-lg transition-all cursor-pointer"
                    >
                      MEDIUM (PEMDAS & Square Roots)
                    </Button>
                    <Button
                      onClick={() => startSinglePlayer('hard')}
                      variant="outline"
                      className="h-16 border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white font-black text-lg transition-all cursor-pointer"
                    >
                      HARD (Exponents & Multi-Step algebra)
                    </Button>
                  </div>
                </div>
              )}

              {gameState === 'playing' && singleQuestions.length > 0 && (
                <div className={cn(
                  "w-full flex flex-col items-center gap-6 relative transition-all duration-300",
                  isFullscreen ? "max-w-5xl" : "max-w-xl"
                )}>
                  {/* Stats & Difficulty Info */}
                  <div className="flex gap-2 items-center justify-between w-full max-w-lg bg-slate-950/80 px-6 py-2.5 rounded-full border border-cyan-500/10 shadow-lg text-sm text-cyan-200/80 font-bold uppercase tracking-wider">
                    <span className="text-cyan-400 text-xs font-bold">Level: {difficulty}</span>
                    <span>Unlocked: {solvedCount} / {totalRounds}</span>
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
                        {activeQuestionData.a}
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
                        <h1 className={cn("font-black text-cyan-100 transition-all", isFullscreen ? "text-6xl" : "text-3xl")} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                          {activeQuestionData.q}
                        </h1>
                      </div>
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
                        <h1 className={cn("font-black text-cyan-100 transition-all", isFullscreen ? "text-6xl" : "text-3xl")} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                          {activeQuestionData.q}
                        </h1>
                      </div>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                        <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                        <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                        <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Multiple Choice Action Area */}
                  <div className="flex flex-col items-center gap-4 w-full">
                    {!hasAnswered ? (
                      <div className="grid grid-cols-2 gap-3.5 w-full max-w-lg mt-2">
                        {activeQuestionData.choices?.map((choice) => (
                          <Button
                            key={choice}
                            onClick={() => handleAnswerSubmit(choice)}
                            disabled={isAnimating}
                            className="py-6 bg-slate-950 border-2 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 font-black text-lg transition-all rounded-xl shadow-lg cursor-pointer hover:scale-[1.02]"
                          >
                            {choice}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="grid grid-cols-2 gap-3.5 w-full max-w-lg mt-2">
                          {activeQuestionData.choices?.map((choice) => {
                            const isCorrect = choice === activeQuestionData.a;
                            const isSelected = choice === selectedAnswer;
                            let btnClass = "bg-slate-950 border-2 border-cyan-500/20 text-cyan-350";
                            if (isCorrect) {
                              btnClass = "bg-emerald-500 text-slate-950 border-emerald-400 font-black";
                            } else if (isSelected) {
                              btnClass = "bg-rose-500 text-white border-rose-400 font-black";
                            } else {
                              btnClass = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-60";
                            }
                            return (
                              <Button
                                key={choice}
                                disabled
                                className={cn("py-6 text-lg transition-all rounded-xl shadow-lg font-black", btnClass)}
                              >
                                {choice} {isCorrect && " ✓"} {isSelected && !isCorrect && " ✗"}
                              </Button>
                            );
                          })}
                        </div>
                        <div className="h-16 flex items-center justify-center w-full mt-2">
                          <Button
                            onClick={handleNextRound}
                            disabled={isAnimating}
                            size="lg"
                            className="bg-purple-600 text-white hover:bg-purple-500 font-extrabold px-12 py-7 rounded-xl text-xl border border-purple-400/30 shadow-lg shadow-purple-500/20 uppercase tracking-wider hover:scale-105 transition-all duration-300 cursor-pointer"
                          >
                            <span>{solvedCount + 1 >= totalRounds ? "COMPLETE SYSTEM" : "NEXT BARRIER ➡️"}</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {gameState === 'finished' && (
                <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-xl mx-auto py-6">
                  <Trophy className="w-32 h-32 text-cyan-400 drop-shadow-[0_0_20px_rgba(0,229,255,0.6)] animate-bounce" />
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter uppercase text-white">VAULT DECRYPTED</h2>
                    <p className="text-slate-350 font-medium text-lg">Completed: <span className="text-cyan-400 text-3xl font-black">{solvedCount * 100} pts</span></p>
                  </div>

                  {isDailyBonus && (
                    <div className="relative w-full bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-cyan-500/10 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-2 z-10">
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
                    <Button onClick={() => startSinglePlayer(difficulty)} size="lg" className="rounded-full px-8 font-bold bg-cyan-600 text-white hover:scale-105 transition-transform shadow-lg shadow-cyan-500/25 border border-cyan-500/30 cursor-pointer">
                      <RotateCcw className="mr-2 w-5 h-5" /> RE-DECRYPT
                    </Button>
                    <Button variant="outline" onClick={() => setSingleQuestions([])} size="lg" className="rounded-full px-8 font-bold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer">
                      <RotateCcw className="mr-2 w-5 h-5" /> RE-CONFIGURE
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
                <div className={cn(
                  "w-full flex flex-col items-center gap-6 relative transition-all duration-300",
                  isFullscreen ? "max-w-5xl" : "max-w-xl"
                )}>
                  {isWaitingForOthers ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-12 animate-pulse text-center w-full max-w-md bg-slate-950/40 p-8 border border-white/5 rounded-3xl backdrop-blur-sm">
                      <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/30">
                        <Rotate3d className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-wider">All Barriers Cleared! 🏁</h3>
                      <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-semibold">
                        You finished the race! Waiting for other decryptors to finish their vaults...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* 3D Vault Door Container */}
                      <div
                        className={cn(
                          "w-full relative rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 transition-all duration-300",
                          isFullscreen ? "aspect-[16/9]" : "aspect-[5/3]"
                        )}
                        style={{ perspective: '1200px' }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center z-0">
                          <span className={cn("font-black uppercase text-cyan-400 tracking-[0.2em] transition-all", isFullscreen ? "text-lg mb-6" : "text-xs mb-3")}>
                            ACCESS GRANTED
                          </span>
                          <h2 className={cn("font-black tracking-tight text-white transition-all select-text", isFullscreen ? "text-8xl" : "text-6xl")} style={{ textShadow: '0 0 25px rgba(0, 229, 255, 0.8)' }}>
                            {activeQuestionData.a}
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
                            <h1 className={cn("font-black text-cyan-100 transition-all", isFullscreen ? "text-6xl" : "text-3xl")} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                              {activeQuestionData.q}
                            </h1>
                          </div>
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
                            <h1 className={cn("font-black text-cyan-100 transition-all", isFullscreen ? "text-6xl" : "text-3xl")} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                              {activeQuestionData.q}
                            </h1>
                          </div>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                            <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                            <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                            <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/60" />
                          </div>
                        </motion.div>
                      </div>

                      {/* Multiple Choice Action Area */}
                      <div className="flex flex-col items-center gap-4 w-full">
                        {!hasAnswered ? (
                          <div className="grid grid-cols-2 gap-3.5 w-full max-w-lg mt-2">
                            {activeQuestionData.choices?.map((choice: number) => (
                              <Button
                                key={choice}
                                onClick={() => handleAnswerSubmit(choice)}
                                disabled={isAnimating}
                                className="py-6 bg-slate-950 border-2 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 font-black text-lg transition-all rounded-xl shadow-lg cursor-pointer hover:scale-[1.02]"
                              >
                                {choice}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4 w-full">
                            <div className="grid grid-cols-2 gap-3.5 w-full max-w-lg mt-2">
                              {activeQuestionData.choices?.map((choice: number) => {
                                const isCorrect = choice === activeQuestionData.a;
                                const isSelected = choice === selectedAnswer;
                                let btnClass = "bg-slate-950 border-2 border-cyan-500/20 text-cyan-350";
                                if (isCorrect) {
                                  btnClass = "bg-emerald-500 text-slate-950 border-emerald-400 font-black";
                                } else if (isSelected) {
                                  btnClass = "bg-rose-500 text-white border-rose-400 font-black";
                                } else {
                                  btnClass = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-60";
                                }
                                return (
                                  <Button
                                    key={choice}
                                    disabled
                                    className={cn("py-6 text-lg transition-all rounded-xl shadow-lg font-black", btnClass)}
                                  >
                                    {choice} {isCorrect && " ✓"} {isSelected && !isCorrect && " ✗"}
                                  </Button>
                                );
                              })}
                            </div>
                            <div className="h-16 flex items-center justify-center w-full mt-2">
                              <Button
                                onClick={handleNextRound}
                                disabled={isAnimating}
                                size="lg"
                                className="bg-purple-600 text-white hover:bg-purple-500 font-extrabold px-12 py-7 rounded-xl text-xl border border-purple-400/30 shadow-lg shadow-purple-500/20 uppercase tracking-wider hover:scale-105 transition-all duration-300 cursor-pointer"
                              >
                                <span>{solvedCount + 1 >= totalRounds ? "COMPLETE SYSTEM" : "NEXT BARRIER ➡️"}</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="bg-slate-950/90 p-6 flex justify-between items-center border-t border-cyan-500/10">
          <div className="flex gap-2">
            {gameMode === 'multi' ? (
              <Button 
                variant="ghost" 
                onClick={handleLeaveRoom} 
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold cursor-pointer"
              >
                LEAVE ROOM
              </Button>
            ) : (
              <Button variant="ghost" asChild className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold cursor-pointer">
                <Link href="/games">EXIT TO MENU</Link>
              </Button>
            )}
            {gameState === 'playing' && gameMode === 'single' && (
              <Button variant="secondary" onClick={() => startSinglePlayer(difficulty)} className="font-bold border border-cyan-500/10 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer">
                <RotateCcw className="mr-2 w-4 h-4" /> RESTART BARRIER
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {gameMode === 'single' && (
              <Button 
                variant="outline" 
                onClick={clearMemory} 
                size="sm" 
                className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Cache
              </Button>
            )}
          </div>

          {gameState === 'playing' && (
            <div className="flex items-center gap-4 text-xs font-black text-cyan-400/70 uppercase tracking-widest">
              <span>UNLOCKED {solvedCount} / {totalRounds}</span>
              <div className="w-32 h-3 bg-cyan-950/50 rounded-full overflow-hidden border border-cyan-500/10">
                <motion.div 
                  className="h-full bg-cyan-500 shadow-[0_0_10px_#00e5ff]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(solvedCount / totalRounds) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
