'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { getGameBySlug } from '@/lib/games';
import { Button } from '../ui/button';
import {
  Trophy,
  Maximize,
  Minimize,
  Coins,
  RotateCcw,
  Gamepad2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ChevronRight,
  Crown,
  Link2,
  Copy,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { getDailyBonusGame, logAnalyticsEvent } from '@/lib/analytics';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import confetti from 'canvas-confetti';

type GameState = 'idle' | 'playing' | 'gameover' | 'finished';
type GameOverReason = 'wrong' | 'hit';

interface ObstacleData {
  mesh: THREE.Mesh;
  vx: number;
  vz: number;
}

interface SphereOption {
  mesh: THREE.Mesh;
  colorName: 'red' | 'green' | 'blue';
}

const DESK_POSITIONS = [
  { x: -15, z: -10 },
  { x: -15, z: 0 },
  { x: -15, z: 10 },
  { x: -15, z: 20 },
  { x: -5, z: -10 },
  { x: -5, z: 0 },
  { x: -5, z: 10 },
  { x: -5, z: 20 },
  { x: 5, z: -10 },
  { x: 5, z: 0 },
  { x: 5, z: 10 },
  { x: 5, z: 20 },
  { x: 15, z: -10 },
  { x: 15, z: 0 },
  { x: 15, z: 10 },
  { x: 15, z: 20 },
];

const selectRandomIndices = (): [number, number, number] => {
  const indices: number[] = [];
  while (indices.length < 3) {
    const r = Math.floor(Math.random() * 16);
    if (!indices.includes(r)) {
      indices.push(r);
    }
  }
  return [indices[0], indices[1], indices[2]];
};

export function MathDash3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [score, setScore] = React.useState(0);
  const [solvedCount, setSolvedCount] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [gameOverReason, setGameOverReason] = React.useState<GameOverReason>('hit');

  React.useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Let Three.js re-evaluate viewport size after transition
      setTimeout(() => {
        handleResizeRef.current?.();
      }, 100);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Math Question States
  const [questionText, setQuestionText] = React.useState('Solve: 5 + 3 = ?');
  const [answers, setAnswers] = React.useState<{ red: number; green: number; blue: number }>({ red: 8, green: 6, blue: 10 });
  const [correctAnswerColor, setCorrectAnswerColor] = React.useState<'red' | 'green' | 'blue'>('red');
  const [feedback, setFeedback] = React.useState<{ text: string; color: string } | null>(null);

  // Multiplayer States
  const [gameMode, setGameMode] = React.useState<'single' | 'multi'>('single');
  const [multiplayerState, setMultiplayerState] = React.useState<'mode_select' | 'join_room' | 'lobby' | 'playing' | 'finished'>('mode_select');
  const [roomCode, setRoomCode] = React.useState('');
  const [myUid, setMyUid] = React.useState('');
  const [isHost, setIsHost] = React.useState(false);
  const [roomData, setRoomData] = React.useState<any>(null);
  const [roomPlayers, setRoomPlayers] = React.useState<any[]>([]);
  const [nickname, setNickname] = React.useState('');
  const [codeVal, setCodeVal] = React.useState('');
  const [roundsCount, setRoundsCount] = React.useState(10); // Default 10 for multi
  const [difficulty, setDifficulty] = React.useState<'easy' | 'medium' | 'hard'>('medium');
  const [operation, setOperation] = React.useState<'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed' | 'algebra' | 'exponents'>('mixed');

  const [currentRoundIndex, setCurrentRoundIndex] = React.useState(0);
  const currentRoundIndexRef = React.useRef(0);
  const spherePositionsRef = React.useRef<{ redIdx: number; greenIdx: number; blueIdx: number } | null>(null);
  const resetPlayerPositionRef = React.useRef(false);
  const roomCodeRef = React.useRef('');
  const firestoreRef = React.useRef<any>(null);


  const ROUNDS_TO_WIN = gameMode === 'multi' ? roundsCount : 10;

  // Key tracking refs and handlers
  const keysRef = React.useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  const pressKey = (key: string) => {
    if (key === 'ArrowUp' || key === 'w' || key === 'W') keysRef.current.ArrowUp = keysRef.current.w = true;
    if (key === 'ArrowDown' || key === 's' || key === 'S') keysRef.current.ArrowDown = keysRef.current.s = true;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') keysRef.current.ArrowLeft = keysRef.current.a = true;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') keysRef.current.ArrowRight = keysRef.current.d = true;
  };

  const releaseKey = (key: string) => {
    if (key === 'ArrowUp' || key === 'w' || key === 'W') keysRef.current.ArrowUp = keysRef.current.w = false;
    if (key === 'ArrowDown' || key === 's' || key === 'S') keysRef.current.ArrowDown = keysRef.current.s = false;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') keysRef.current.ArrowLeft = keysRef.current.a = false;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') keysRef.current.ArrowRight = keysRef.current.d = false;
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        pressKey(e.key);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        releaseKey(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const showFeedback = (text: string, color: string) => {
    setFeedback({ text, color });
    setTimeout(() => {
      setFeedback(null);
    }, 800);
  };

  // Refs for Three.js
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
  const handleResizeRef = React.useRef<(() => void) | null>(null);

  // References to pass into the animation loop dynamically without recreating it
  const gameStateRef = React.useRef<GameState>('idle');
  const scoreRef = React.useRef(0);
  const solvedCountRef = React.useRef(0);
  const correctAnswerColorRef = React.useRef<'red' | 'green' | 'blue'>('red');
  const gameModeRef = React.useRef<'single' | 'multi'>('single');
  const myUidRef = React.useRef<string>('');
  const roundsCountRef = React.useRef(10);
  const roomDataRef = React.useRef<any>(null);

  // Keep refs up-to-date
  React.useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  React.useEffect(() => { scoreRef.current = score; }, [score]);
  React.useEffect(() => { solvedCountRef.current = solvedCount; }, [solvedCount]);
  React.useEffect(() => { correctAnswerColorRef.current = correctAnswerColor; }, [correctAnswerColor]);
  React.useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  React.useEffect(() => { myUidRef.current = myUid; }, [myUid]);
  React.useEffect(() => { roundsCountRef.current = roundsCount; }, [roundsCount]);
  React.useEffect(() => { roomDataRef.current = roomData; }, [roomData]);
  React.useEffect(() => { currentRoundIndexRef.current = currentRoundIndex; }, [currentRoundIndex]);
  React.useEffect(() => { roomCodeRef.current = roomCode; }, [roomCode]);


  const { user, userProfile } = useAuth();
  const firestore = useFirestore();
  React.useEffect(() => { firestoreRef.current = firestore; }, [firestore]);
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

  const isCreator = React.useMemo(() => {
    if (gameMode !== 'multi') return false;
    return roomData && roomData.hostId && myUid ? roomData.hostId === myUid : isHost;
  }, [gameMode, roomData, myUid, isHost]);

  // Sync nickname on user context load
  React.useEffect(() => {
    if (user) {
      const name = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || '';
      setNickname(name);
    } else {
      setNickname(`Player_${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [user, userProfile]);

  // Read invite code parameters from URL on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomVal = params.get('room');
      if (roomVal) {
        setCodeVal(roomVal.toUpperCase());
        setGameMode('multi');
        setMultiplayerState('join_room');
      }
    }
  }, []);

  // Session Recovery
  React.useEffect(() => {
    if (typeof window === 'undefined' || !firestore) return;
    
    const savedRoom = sessionStorage.getItem("lingoland_active_roomCode_math-dash-3d");
    const savedUid = sessionStorage.getItem("lingoland_active_myUid_math-dash-3d");
    const savedMode = sessionStorage.getItem("lingoland_active_gameMode_math-dash-3d");
    
    if (savedRoom && savedUid && savedMode === 'multi') {
      const roomRef = doc(firestore, "stats", "md_room_" + savedRoom);
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
              setGameState('idle');
            } else if (data.status === 'playing') {
              const solved = playerObj.solvedCount || 0;
              const savedScore = playerObj.score || 0;
              setScore(savedScore);
              setSolvedCount(solved);
              setMultiplayerState('playing');
              setGameState('playing');
            }
            
            toast({
              title: "Reconnected 🎮",
              description: `Resumed active session in room ${savedRoom}.`,
            });
            return;
          }
        }
        sessionStorage.removeItem("lingoland_active_roomCode_math-dash-3d");
        sessionStorage.removeItem("lingoland_active_myUid_math-dash-3d");
        sessionStorage.removeItem("lingoland_active_gameMode_math-dash-3d");
      }).catch((err) => {
        console.warn("Session recovery failed:", err);
      });
    }
  }, [firestore]);

  // Sync Room Updates in Lobby and Play (Multiplayer)
  React.useEffect(() => {
    if (gameMode !== 'multi' || !roomCode || !firestore) return;
    
    const roomRef = doc(firestore, "stats", "md_room_" + roomCode);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        toast({
          title: "Room Closed 🚨",
          description: "The room has been disbanded or closed.",
          variant: "destructive"
        });
        resetMultiplayerState();
        return;
      }
      
      const data = snapshot.data();
      setRoomData(data);
      
      const list = Object.values(data.players || {}) as any[];
      setRoomPlayers(list);
      
      if (data.difficulty) setDifficulty(data.difficulty);
      if (data.operation) setOperation(data.operation);
      if (data.roundsCount) setRoundsCount(data.roundsCount);
      
      if (myUid && data.hostId) {
        setIsHost(data.hostId === myUid);
      }
      
      if (data.status === 'disbanded') {
        toast({
          title: "Room Disbanded 🚨",
          description: "The host has disbanded the game.",
          variant: "destructive"
        });
        resetMultiplayerState();
        return;
      }

      // Auto-transition playing states
      if (data.status === 'playing' && multiplayerState === 'lobby') {
        setMultiplayerState('playing');
        setGameState('playing');
        setScore(0);
        setSolvedCount(0);
        setCurrentRoundIndex(0);
        currentRoundIndexRef.current = 0;
      }

      if (data.status === 'playing' && myUid) {
        const me = data.players?.[myUid];
        if (me) {
          setScore(me.score || 0);
          const nextSolved = me.solvedCount || 0;
          setSolvedCount(nextSolved);

          if (data.questions && data.questions[nextSolved]) {
            const activeQ = data.questions[nextSolved];
            setQuestionText(activeQ.questionText);
            setAnswers(activeQ.answers);
            setCorrectAnswerColor(activeQ.correctAnswerColor);
            
            spherePositionsRef.current = {
              redIdx: activeQ.redIdx ?? 0,
              greenIdx: activeQ.greenIdx ?? 1,
              blueIdx: activeQ.blueIdx ?? 2,
            };

            if (nextSolved !== currentRoundIndexRef.current) {
              setCurrentRoundIndex(nextSolved);
              resetPlayerPositionRef.current = true;
            }
          }
        }
      }
      
      if (data.status === 'finished' && multiplayerState !== 'finished') {
        setMultiplayerState('finished');
        setGameState('finished');
      }
    }, (error) => {
      console.error("Firestore rooms snapshot error:", error);
    });
    
    return () => unsubscribe();
  }, [firestore, roomCode, gameMode, multiplayerState, myUid]);

  // Sync finished status: declare finished once everyone completes (run on Host client)
  React.useEffect(() => {
    if (gameMode === 'multi' && roomCode && roomData && roomData.status === 'playing' && isCreator) {
      const list = Object.values(roomData.players || {}) as any[];
      if (list.length > 0 && list.every((p: any) => p.finished)) {
        const sorted = [...list].sort((a, b) => b.score - a.score);
        const winner = sorted[0];
        const roomRef = doc(firestore!, "stats", "md_room_" + roomCode);
        updateDoc(roomRef, {
          status: 'finished',
          winnerId: winner?.uid || '',
          winnerName: winner?.name || ''
        }).catch(e => console.error("Error setting winner:", e));
      }
    }
  }, [gameMode, roomCode, roomData, isCreator, firestore]);

  // ─── Math problem generator ───────────────────────────────────────────────
  const generateMathProblemData = (diff: string, opType: string): {
    question: string;
    answer: number;
    options: { red: number; green: number; blue: number };
    correctColor: 'red' | 'green' | 'blue';
  } => {
    let num1 = 0;
    let num2 = 0;
    let answer = 0;
    let question = "";
    
    // Decide which operation to generate
    let op = opType;
    if (opType === 'mixed') {
      const mixedOps = ['addition', 'subtraction', 'multiplication', 'division', 'algebra', 'exponents'];
      if (diff === 'easy') {
        op = mixedOps[Math.floor(Math.random() * 3)]; // + - *
      } else {
        op = mixedOps[Math.floor(Math.random() * mixedOps.length)];
      }
    }
    
    if (op === 'addition') {
      if (diff === 'easy') {
        num1 = Math.floor(Math.random() * 15) + 1;
        num2 = Math.floor(Math.random() * 15) + 1;
      } else if (diff === 'medium') {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
      } else {
        num1 = Math.floor(Math.random() * 100) + 50;
        num2 = Math.floor(Math.random() * 100) + 50;
      }
      answer = num1 + num2;
      question = `Solve: ${num1} + ${num2} = ?`;
    } else if (op === 'subtraction') {
      if (diff === 'easy') {
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * num1);
      } else if (diff === 'medium') {
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * num1);
      } else {
        num1 = Math.floor(Math.random() * 200) + 50;
        num2 = Math.floor(Math.random() * num1);
      }
      answer = num1 - num2;
      question = `Solve: ${num1} - ${num2} = ?`;
    } else if (op === 'multiplication') {
      if (diff === 'easy') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
      } else if (diff === 'medium') {
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
      } else {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * 15) + 5;
      }
      answer = num1 * num2;
      question = `Solve: ${num1} × ${num2} = ?`;
    } else if (op === 'division') {
      if (diff === 'easy') {
        num2 = Math.floor(Math.random() * 5) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
      } else if (diff === 'medium') {
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 12) + 2;
      } else {
        num2 = Math.floor(Math.random() * 15) + 3;
        answer = Math.floor(Math.random() * 15) + 5;
      }
      num1 = num2 * answer;
      question = `Solve: ${num1} ÷ ${num2} = ?`;
    } else if (op === 'algebra') {
      if (diff === 'easy') {
        answer = Math.floor(Math.random() * 8) + 1;
        num1 = Math.floor(Math.random() * 3) + 2;
        num2 = Math.floor(Math.random() * 5) + 1;
      } else if (diff === 'medium') {
        answer = Math.floor(Math.random() * 12) + 2;
        num1 = Math.floor(Math.random() * 5) + 2;
        num2 = Math.floor(Math.random() * 15) + 1;
      } else {
        answer = Math.floor(Math.random() * 20) + 5;
        num1 = Math.floor(Math.random() * 8) + 3;
        num2 = Math.floor(Math.random() * 30) + 5;
      }
      const usePlus = Math.random() > 0.5;
      if (usePlus) {
        const c = num1 * answer + num2;
        question = `Solve for x: ${num1}x + ${num2} = ${c}`;
      } else {
        const c = num1 * answer - num2;
        question = `Solve for x: ${num1}x - ${num2} = ${c}`;
      }
    } else if (op === 'exponents') {
      let base = 2;
      let exp = 2;
      if (diff === 'easy') {
        base = Math.floor(Math.random() * 10) + 2;
        exp = 2;
      } else if (diff === 'medium') {
        const useCube = Math.random() > 0.4;
        if (useCube) {
          base = Math.floor(Math.random() * 5) + 2;
          exp = 3;
        } else {
          base = Math.floor(Math.random() * 12) + 2;
          exp = 2;
        }
      } else {
        const r = Math.random();
        if (r < 0.3) {
          base = Math.floor(Math.random() * 4) + 2;
          exp = 4;
        } else if (r < 0.6) {
          base = Math.floor(Math.random() * 6) + 2;
          exp = 3;
        } else {
          base = Math.floor(Math.random() * 20) + 2;
          exp = 2;
        }
      }
      answer = Math.pow(base, exp);
      const superScripts = ["⁰", "¹", "²", "³", "⁴", "⁵"];
      question = `Solve: ${base}${superScripts[exp] || `^${exp}`} = ?`;
    }
    
    let wrong1 = answer + Math.floor(Math.random() * 5) + 1;
    let wrong2 = answer - Math.floor(Math.random() * 5) - 1;
    if (wrong2 === answer || wrong2 <= 0) {
      wrong2 = answer + Math.floor(Math.random() * 5) + 6;
    }
    
    const answersList = [answer, wrong1, wrong2];
    for (let i = answersList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answersList[i], answersList[j]] = [answersList[j], answersList[i]];
    }
    
    let correctColor: 'red' | 'green' | 'blue' = 'red';
    if (answersList[0] === answer) correctColor = 'red';
    else if (answersList[1] === answer) correctColor = 'green';
    else correctColor = 'blue';
    
    return {
      question,
      answer,
      options: { red: answersList[0], green: answersList[1], blue: answersList[2] },
      correctColor
    };
  };

  const generateMathProblem = () => {
    const prob = generateMathProblemData(difficulty, operation);
    setQuestionText(prob.question);
    setAnswers(prob.options);
    setCorrectAnswerColor(prob.correctColor);
  };

  // Lobby Matchmaking actions
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
        x: 0,
        z: 20,
        lastActive: Date.now()
      }
    };

    try {
      const roomRef = doc(firestore, "stats", "md_room_" + code);
      await setDoc(roomRef, {
        code,
        hostId: hostUid,
        hostName: nickname,
        difficulty: "medium",
        operation: "mixed",
        roundsCount: 10,
        status: 'lobby',
        players: initialPlayers,
        createdAt: Date.now()
      });

      setRoomCode(code);
      setIsHost(true);
      setMultiplayerState('lobby');
      sessionStorage.setItem("lingoland_active_roomCode_math-dash-3d", code);
      sessionStorage.setItem("lingoland_active_myUid_math-dash-3d", hostUid);
      sessionStorage.setItem("lingoland_active_gameMode_math-dash-3d", 'multi');
      toast({
        title: "Room Created! 🚪🔑",
        description: `Your code is ${code}. Share it with friends!`,
      });
    } catch (e) {
      console.error("Failed to create room:", e);
      toast({
        title: "Database Error",
        description: "Could not create room on server. Try again.",
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
        description: "Room codes must be exactly 5 letters.",
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
      const roomRef = doc(firestore, "stats", "md_room_" + cleanCode);
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
      if (list.length >= 5) {
        toast({
          title: "Room Full 👥",
          description: "This lobby is full (max 5 players).",
          variant: "destructive"
        });
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
          x: 0,
          z: 20,
          lastActive: Date.now()
        }
      };

      await updateDoc(roomRef, {
        players: updatedPlayers
      });

      setRoomCode(cleanCode);
      setIsHost(false);
      setMultiplayerState('lobby');
      sessionStorage.setItem("lingoland_active_roomCode_math-dash-3d", cleanCode);
      sessionStorage.setItem("lingoland_active_myUid_math-dash-3d", playerUid);
      sessionStorage.setItem("lingoland_active_gameMode_math-dash-3d", 'multi');
      toast({
        title: "Connected! 🤝",
        description: `Joined room ${cleanCode}. Waiting for host to start.`,
      });
    } catch (e) {
      console.error("Failed to join room:", e);
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
      const roomRef = doc(firestore, "stats", "md_room_" + roomCode);
      if (isCreator) {
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
      console.warn("Leave room error:", e);
    } finally {
      resetMultiplayerState();
    }
  };

  const handleUpdateLobbySettings = async (
    op: typeof operation,
    diff: typeof difficulty,
    rounds: number
  ) => {
    if (!firestore || !roomCode || !isCreator) return;
    const roomRef = doc(firestore, "stats", "md_room_" + roomCode);
    try {
      await updateDoc(roomRef, {
        operation: op,
        difficulty: diff,
        roundsCount: rounds
      });
    } catch (e) {
      console.error("Failed to update lobby settings:", e);
    }
  };

  const cleanSavedSession = () => {
    sessionStorage.removeItem("lingoland_active_roomCode_math-dash-3d");
    sessionStorage.removeItem("lingoland_active_myUid_math-dash-3d");
    sessionStorage.removeItem("lingoland_active_gameMode_math-dash-3d");
  };

  const resetMultiplayerState = () => {
    cleanSavedSession();
    setRoomCode('');
    setMyUid('');
    setIsHost(false);
    setRoomData(null);
    setRoomPlayers([]);
    setCodeVal('');
    setMultiplayerState('mode_select');
    setGameMode('single');
    setGameState('idle');
  };

  const handleStartMultiplayerGame = async () => {
    if (!firestore || !roomCode || !isCreator) return;
    if (roomPlayers.length < 2) {
      toast({
        title: "Need Competitors 👥",
        description: "Need at least 1 other player to join the room to start multiplayer.",
        variant: "destructive"
      });
      return;
    }

    try {
      const roomRef = doc(firestore, "stats", "md_room_" + roomCode);
      const updatedPlayers = { ...roomData.players };
      Object.keys(updatedPlayers).forEach((uid) => {
        updatedPlayers[uid].score = 0;
        updatedPlayers[uid].solvedCount = 0;
        updatedPlayers[uid].finished = false;
        updatedPlayers[uid].x = 0;
        updatedPlayers[uid].z = 20;
      });

      const questionsList = [];
      for (let i = 0; i < roundsCount; i++) {
        const prob = generateMathProblemData(difficulty, operation);
        const [rIdx, gIdx, bIdx] = selectRandomIndices();
        questionsList.push({
          questionText: prob.question,
          answers: prob.options,
          correctAnswerColor: prob.correctColor,
          redIdx: rIdx,
          greenIdx: gIdx,
          blueIdx: bIdx,
          roundIndex: i
        });
      }

      await updateDoc(roomRef, {
        status: 'playing',
        players: updatedPlayers,
        startedAt: Date.now(),
        questions: questionsList,
        lastSolverName: "",
      });
    } catch (e) {
      console.error("Start multiplayer failed:", e);
      toast({
        title: "Launch Failed",
        description: "Could not start the game. Try again.",
        variant: "destructive"
      });
    }
  };

  const startGame = () => {
    setScore(0);
    setSolvedCount(0);
    generateMathProblem();
    setGameState('playing');
  };

  const triggerGameOver = (reason: GameOverReason) => {
    setGameOverReason(reason);
    setGameState('gameover');
  };

  const handleCorrectAnswerMultiplayer = async (localRoundIndex: number) => {
    if (!firestore || !roomCode || !myUid) return;
    const roomRef = doc(firestore, "stats", "md_room_" + roomCode);

    try {
      const nextScore = scoreRef.current + 10;
      const nextSolved = solvedCountRef.current + 1;
      const maxRounds = roundsCountRef.current || 10;
      const myFinished = nextSolved >= maxRounds;

      await updateDoc(roomRef, {
        [`players.${myUid}.score`]: nextScore,
        [`players.${myUid}.solvedCount`]: nextSolved,
        [`players.${myUid}.finished`]: myFinished,
        [`players.${myUid}.lastActive`]: Date.now()
      });
    } catch (e) {
      console.error("Multiplayer solve update failed:", e);
    }
  };

  const handleCorrectAnswerMultiplayerRef = React.useRef(handleCorrectAnswerMultiplayer);
  React.useEffect(() => {
    handleCorrectAnswerMultiplayerRef.current = handleCorrectAnswerMultiplayer;
  }, [handleCorrectAnswerMultiplayer]);


  // ─── Three.js game loop ───────────────────────────────────────────────────
  React.useEffect(() => {
    if (gameState !== 'playing' || !containerRef.current) return;

    // Clean up old canvases
    containerRef.current.innerHTML = '';

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0f4f7);
    scene.fog = new THREE.Fog(0xd0f4f7, 20, 60);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, 1.0, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Resize handler – stored in ref so it can be called externally on fullscreen toggle
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth || containerRef.current.clientWidth;
      const h = containerRef.current.offsetHeight || containerRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false); // false = don't update canvas CSS size (we control it with CSS)
    };
    handleResizeRef.current = handleResize;

    // Initial size
    handleResize();

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    scene.add(dirLight);

    // 5. Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Blackboard
    const boardGeo = new THREE.BoxGeometry(30, 10, 1);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 5, -28);
    board.castShadow = true;
    scene.add(board);

    // 7. Desks
    const desks: THREE.Mesh[] = [];
    const deskGeo = new THREE.BoxGeometry(4, 3, 4);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xffcc80, roughness: 0.7 });
    for (let x = -15; x <= 15; x += 10) {
      for (let z = -10; z <= 20; z += 10) {
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.set(x, 1.5, z);
        desk.castShadow = true;
        desk.receiveShadow = true;
        scene.add(desk);
        desks.push(desk);
      }
    }

    // 8. Player
    const playerGeo = new THREE.CylinderGeometry(1, 1, 3, 16);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x9c27b0, metalness: 0.2, roughness: 0.5 });
    const player = new THREE.Mesh(playerGeo, playerMat);
    player.position.set(0, 1.5, 20);
    player.castShadow = true;
    scene.add(player);

    // 9. Answer spheres
    const sphereGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xE53935, metalness: 0.3, roughness: 0.2 });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x43A047, metalness: 0.3, roughness: 0.2 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x1E88E5, metalness: 0.3, roughness: 0.2 });
    const redSphere = new THREE.Mesh(sphereGeo, redMat);
    const greenSphere = new THREE.Mesh(sphereGeo, greenMat);
    const blueSphere = new THREE.Mesh(sphereGeo, blueMat);
    redSphere.castShadow = true;
    greenSphere.castShadow = true;
    blueSphere.castShadow = true;

    const optionSpheres: SphereOption[] = [
      { mesh: redSphere, colorName: 'red' },
      { mesh: greenSphere, colorName: 'green' },
      { mesh: blueSphere, colorName: 'blue' },
    ];
    optionSpheres.forEach(s => scene.add(s.mesh));

    const repositionSpheres = () => {
      if (gameModeRef.current === 'multi') {
        const positions = spherePositionsRef.current;
        if (positions) {
          const redPos = DESK_POSITIONS[positions.redIdx] || DESK_POSITIONS[0];
          const greenPos = DESK_POSITIONS[positions.greenIdx] || DESK_POSITIONS[1];
          const bluePos = DESK_POSITIONS[positions.blueIdx] || DESK_POSITIONS[2];

          optionSpheres[0].mesh.position.set(redPos.x, 4.5, redPos.z);
          optionSpheres[1].mesh.position.set(greenPos.x, 4.5, greenPos.z);
          optionSpheres[2].mesh.position.set(bluePos.x, 4.5, bluePos.z);
        }
      } else {
        const available = [...desks];
        for (let i = available.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [available[i], available[j]] = [available[j], available[i]];
        }
        optionSpheres[0].mesh.position.set(available[0].position.x, 4.5, available[0].position.z);
        optionSpheres[1].mesh.position.set(available[1].position.x, 4.5, available[1].position.z);
        optionSpheres[2].mesh.position.set(available[2].position.x, 4.5, available[2].position.z);
      }
    };
    repositionSpheres();

    // 10. Obstacles
    let obstaclesList: ObstacleData[] = [];
    const obsGeo = new THREE.ConeGeometry(1, 3, 4);
    obsGeo.rotateX(Math.PI / 2);
    const obsMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.5, roughness: 0.5 });

    const createObstacle = () => {
      const mesh = new THREE.Mesh(obsGeo, obsMat);
      mesh.castShadow = true;
      const edge = Math.floor(Math.random() * 4);
      let sx = 0, sz = 0, vx = 0, vz = 0;
      // Convert speed from per-frame to per-second (scaled by 60 for 60fps base)
      const speed = 9.0 + Math.random() * 9.0 + solvedCountRef.current * 1.2;
      if (edge === 0) { sx = -28; sz = Math.random() * 50 - 20; vx = speed; vz = (Math.random() - 0.5) * speed; }
      else if (edge === 1) { sx = 28; sz = Math.random() * 50 - 20; vx = -speed; vz = (Math.random() - 0.5) * speed; }
      else if (edge === 2) { sx = Math.random() * 50 - 25; sz = -28; vx = (Math.random() - 0.5) * speed; vz = speed; }
      else { sx = Math.random() * 50 - 25; sz = 28; vx = (Math.random() - 0.5) * speed; vz = -speed; }
      mesh.position.set(sx, 2, sz);
      mesh.lookAt(sx + vx, 2, sz + vz);
      scene.add(mesh);
      obstaclesList.push({ mesh, vx, vz });
    };

    for (let i = 0; i < 3; i++) createObstacle();

    window.addEventListener('resize', handleResize);

    // 10.5. Other players meshes map (multiplayer)
    const otherPlayers = new Map<string, THREE.Mesh>();
    
    const getPlayerColor = (uid: string) => {
      let hash = 0;
      for (let i = 0; i < uid.length; i++) {
        hash = uid.charCodeAt(i) + ((hash << 5) - hash);
      }
      const h = Math.abs(hash) % 360;
      return new THREE.Color(`hsl(${h}, 75%, 60%)`);
    };

    // 11. Animation loop
    const playerSpeed = 15.0; // units per second
    let frameId = 0;
    let isColliding = false; // debounce collisions
    let lastTime = performance.now();

    let lastWriteTime = 0;
    let lastWrittenX = player.position.x;
    let lastWrittenZ = player.position.z;

    const animate = () => {
      if (gameStateRef.current !== 'playing') return;
      frameId = requestAnimationFrame(animate);

      if (resetPlayerPositionRef.current) {
        player.position.set(0, 1.5, 20);
        resetPlayerPositionRef.current = false;
        keysRef.current = {
          w: false,
          a: false,
          s: false,
          d: false,
          ArrowUp: false,
          ArrowDown: false,
          ArrowLeft: false,
          ArrowRight: false,
        };
      }

      if (gameModeRef.current === 'multi') {
        const positions = spherePositionsRef.current;
        if (positions) {
          const redPos = DESK_POSITIONS[positions.redIdx];
          const greenPos = DESK_POSITIONS[positions.greenIdx];
          const bluePos = DESK_POSITIONS[positions.blueIdx];
          if (redPos && greenPos && bluePos) {
            optionSpheres[0].mesh.position.x = redPos.x;
            optionSpheres[0].mesh.position.z = redPos.z;
            optionSpheres[1].mesh.position.x = greenPos.x;
            optionSpheres[1].mesh.position.z = greenPos.z;
            optionSpheres[2].mesh.position.x = bluePos.x;
            optionSpheres[2].mesh.position.z = bluePos.z;
          }
        }
      }

      // Delta time tracking
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(deltaTime, 0.1); // clamp to max 100ms to avoid huge jumps on lag spikes

      // Movement
      const keys = keysRef.current;
      let moveX = 0, moveZ = 0;
      if (keys.w || keys.ArrowUp) moveZ -= playerSpeed * dt;
      if (keys.s || keys.ArrowDown) moveZ += playerSpeed * dt;
      if (keys.a || keys.ArrowLeft) moveX -= playerSpeed * dt;
      if (keys.d || keys.ArrowRight) moveX += playerSpeed * dt;

      player.position.x = Math.max(-28, Math.min(28, player.position.x + moveX));
      player.position.z = Math.max(-25, Math.min(28, player.position.z + moveZ));

      // 1. Sync own position to Firestore (throttled)
      if (gameModeRef.current === 'multi' && roomCodeRef.current && myUidRef.current) {
        const now = Date.now();
        const distMoved = Math.sqrt(
          Math.pow(player.position.x - lastWrittenX, 2) +
          Math.pow(player.position.z - lastWrittenZ, 2)
        );
        if (now - lastWriteTime > 200 && (distMoved > 0.2 || now - lastWriteTime > 1000)) {
          lastWriteTime = now;
          lastWrittenX = player.position.x;
          lastWrittenZ = player.position.z;
          
          const roomRef = doc(firestoreRef.current!, "stats", "md_room_" + roomCodeRef.current);
          updateDoc(roomRef, {
            [`players.${myUidRef.current}.x`]: player.position.x,
            [`players.${myUidRef.current}.z`]: player.position.z,
            [`players.${myUidRef.current}.lastActive`]: now
          }).catch(console.warn);
        }
      }

      // 2. Spawn / Interpolate other players
      if (gameModeRef.current === 'multi' && roomDataRef.current?.players) {
        const players = roomDataRef.current.players;
        
        // Remove meshes of players who left or finished
        for (const [uid, mesh] of otherPlayers.entries()) {
          if (!players[uid] || players[uid].finished) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(m => m.dispose());
            } else {
              mesh.material.dispose();
            }
            otherPlayers.delete(uid);
          }
        }
        
        // Spawn/Update other players
        for (const uid of Object.keys(players)) {
          if (uid === myUidRef.current) continue;
          const p = players[uid];
          if (p.finished) continue;
          
          let otherMesh = otherPlayers.get(uid);
          if (!otherMesh) {
            const otherGeo = new THREE.CylinderGeometry(1, 1, 3, 16);
            const otherMat = new THREE.MeshStandardMaterial({
              color: getPlayerColor(uid),
              metalness: 0.2,
              roughness: 0.5
            });
            otherMesh = new THREE.Mesh(otherGeo, otherMat);
            otherMesh.castShadow = true;
            otherMesh.position.set(p.x ?? 0, 1.5, p.z ?? 20);
            scene.add(otherMesh);
            otherPlayers.set(uid, otherMesh);
          } else {
            const tx = p.x ?? 0;
            const tz = p.z ?? 20;
            otherMesh.position.x = THREE.MathUtils.lerp(otherMesh.position.x, tx, 1 - Math.exp(-12 * dt));
            otherMesh.position.z = THREE.MathUtils.lerp(otherMesh.position.z, tz, 1 - Math.exp(-12 * dt));
          }
        }
      } else {
        // If single player, clear other players
        for (const [uid, mesh] of otherPlayers.entries()) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        otherPlayers.clear();
      }

      // Hover spheres
      const time = Date.now() * 0.003;
      optionSpheres.forEach(s => {
        s.mesh.position.y = 4.5 + Math.sin(time + s.mesh.position.x) * 0.5;
      });

      // Move + recycle obstacles (scaled by dt)
      for (let i = obstaclesList.length - 1; i >= 0; i--) {
        const obs = obstaclesList[i];
        obs.mesh.position.x += obs.vx * dt;
        obs.mesh.position.z += obs.vz * dt;
        if (Math.abs(obs.mesh.position.x) > 35 || Math.abs(obs.mesh.position.z) > 35) {
          scene.remove(obs.mesh);
          obstaclesList.splice(i, 1);
          createObstacle();
        }
      }

      if (!isColliding) {
        // Sphere collision (2D horizontal)
        for (const sphere of optionSpheres) {
          const dx = player.position.x - sphere.mesh.position.x;
          const dz = player.position.z - sphere.mesh.position.z;
          if (Math.sqrt(dx * dx + dz * dz) < 2.5) {
            isColliding = true;
            if (sphere.colorName === correctAnswerColorRef.current) {
              const nextScore = scoreRef.current + 10;
              const nextSolved = solvedCountRef.current + 1;
              const maxRounds = gameModeRef.current === 'multi' ? roundsCountRef.current : 10;
              
              setScore(nextScore);
              setSolvedCount(nextSolved);
              
              if (gameModeRef.current === 'multi') {
                showFeedback('✓ Correct! +10', '#4CAF50');
                handleCorrectAnswerMultiplayerRef.current(currentRoundIndexRef.current);
                if (nextSolved >= maxRounds) {
                  showFeedback('✓ Finished! 🏁', '#4CAF50');
                }
              } else {
                showFeedback('✓ Correct! +10', '#4CAF50');
                window.dispatchEvent(new CustomEvent('lingoland_game_answered_hijack'));
                if (nextSolved >= maxRounds) {
                  setGameState('finished');
                  window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', { detail: { state: 'finished' } }));
                  toast({ title: 'Math Dash Champion! 🏆⭐', description: "You've solved all targets! Coins awarded." });
                } else {
                  if (nextSolved % 3 === 0) createObstacle();
                  generateMathProblem();
                  repositionSpheres();
                  player.position.set(0, 1.5, 20);
                }
              }
            } else {
              if (gameModeRef.current === 'multi') {
                const nextScore = Math.max(0, scoreRef.current - 5);
                setScore(nextScore);
                showFeedback('✗ Penalty -5', '#F44336');
                player.position.set(0, 1.5, 20);
                
                if (firestoreRef.current && roomCodeRef.current && myUidRef.current) {
                  const roomRef = doc(firestoreRef.current!, "stats", "md_room_" + roomCodeRef.current);
                  updateDoc(roomRef, {
                    [`players.${myUidRef.current}.score`]: nextScore
                  }).catch(console.warn);
                }
              } else {
                triggerGameOver('wrong');
              }
            }
            setTimeout(() => { isColliding = false; }, 800);
            break;
          }
        }

        // Obstacle collision (2D horizontal)
        for (const obs of obstaclesList) {
          const dx = player.position.x - obs.mesh.position.x;
          const dz = player.position.z - obs.mesh.position.z;
          if (Math.sqrt(dx * dx + dz * dz) < 2.0) {
            isColliding = true;
            if (gameModeRef.current === 'multi') {
              const nextScore = Math.max(0, scoreRef.current - 5);
              setScore(nextScore);
              showFeedback('✗ Hit! -5', '#FF9800');
              player.position.set(0, 1.5, 20);
              
              if (firestoreRef.current && roomCodeRef.current && myUidRef.current) {
                const roomRef = doc(firestoreRef.current!, "stats", "md_room_" + roomCodeRef.current);
                updateDoc(roomRef, {
                  [`players.${myUidRef.current}.score`]: nextScore
                }).catch(console.warn);
              }
            } else {
              triggerGameOver('hit');
            }
            setTimeout(() => { isColliding = false; }, 800);
            break;
          }
        }
      }

      // Camera — smooth lerp behind player (framerate independent lerp)
      const isPortrait = camera.aspect < 1.0;
      const camZ = isPortrait ? 26 : 20;
      const camY = isPortrait ? 28 : 25;
      camera.position.lerp(new THREE.Vector3(player.position.x, camY, player.position.z + camZ), 1 - Math.exp(-10 * dt));
      camera.lookAt(player.position.x, 0, player.position.z - 5);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      handleResizeRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      scene.clear();
      renderer.dispose();
      
      otherPlayers.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      otherPlayers.clear();
      
      [obsGeo, obsMat, sphereGeo, redMat, greenMat, blueMat, playerGeo, playerMat, deskGeo, deskMat, boardGeo, boardMat, floorGeo, floorMat].forEach(x => x.dispose());
    };
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyInviteLink = () => {
    if (typeof window !== 'undefined') {
      const code = roomCode || roomData?.code || '';
      const inviteUrl = `${window.location.origin}/games/${slug}?room=${code}`;
      navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Link Copied! 📋",
        description: "Direct invitation link copied to clipboard.",
      });
    }
  };

  const renderLiveScoreboard = () => {
    const sorted = [...roomPlayers].sort((a, b) => b.score - a.score);
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:space-y-2 w-full text-left">
        {sorted.map((p, idx) => (
          <div
            key={p.uid}
            className={cn(
              "flex justify-between items-center p-2.5 rounded-xl border transition-all duration-300",
              p.uid === myUid
                ? "bg-purple-950/40 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                : "bg-slate-900/60 border-slate-800"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-black font-mono text-purple-400 shrink-0">#{idx + 1}</span>
              <span className={cn(
                "text-xs font-bold truncate max-w-[100px]",
                p.uid === myUid ? "text-purple-200" : "text-slate-300"
              )}>{p.name}</span>
              {p.uid === myUid && <span className="text-[9px] font-bold text-purple-400 shrink-0">(You)</span>}
            </div>
            <div className="flex items-center gap-2 font-mono text-xs shrink-0 text-white">
              <span className="text-slate-400 text-[10px]">R{p.solvedCount || 0}/{roundsCount}</span>
              <span className="font-black text-purple-300">{p.score || 0} pts</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMultiModeSelect = () => (
    <div className="flex flex-col items-center gap-6 w-full max-w-md bg-slate-950/80 p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
      <Users className="w-16 h-16 text-purple-400 animate-bounce" style={{ animationDuration: '3s' }} />
      <h3 className="text-3xl font-black uppercase text-center tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
        BATTLE ROOM
      </h3>
      
      <div className="w-full space-y-2 text-left">
        <label className="text-[10px] font-black uppercase tracking-wider text-purple-300">Pilot Call Sign</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter call sign"
          className="w-full h-12 px-4 rounded-xl border border-purple-500/20 bg-purple-950/20 text-white placeholder-purple-400/30 focus:border-purple-400 focus:outline-none font-bold text-sm"
          maxLength={15}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 w-full pt-2">
        <Button 
          onClick={handleCreateRoom}
          className="h-14 text-sm font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-white shadow-lg shadow-purple-500/20 rounded-xl cursor-pointer"
        >
          Create Room
        </Button>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={codeVal}
            onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
            placeholder="INVITE CODE"
            className="flex-1 h-14 text-center text-xl font-mono font-black tracking-widest uppercase rounded-xl border border-purple-500/20 bg-purple-950/20 text-white placeholder-purple-400/20 focus:border-purple-400 focus:outline-none"
            maxLength={5}
          />
          <Button 
            onClick={() => handleJoinRoom(codeVal)}
            className="h-14 px-6 text-sm font-black uppercase bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer"
          >
            Join
          </Button>
        </div>
      </div>

      <Button variant="ghost" onClick={resetMultiplayerState} className="uppercase font-bold text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 text-xs tracking-wider cursor-pointer">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Solo Mode
      </Button>
    </div>
  );

  const renderMultiJoinRoom = () => (
    <div className="flex flex-col items-center gap-6 w-full max-w-md bg-slate-950/80 p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
      <Users className="w-16 h-16 text-purple-400 animate-pulse" />
      <h3 className="text-2xl font-black uppercase text-center tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
        JOIN ROOM
      </h3>
      
      <div className="w-full space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-purple-300">Pilot Call Sign</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter call sign"
            className="w-full h-12 px-4 rounded-xl border border-purple-500/20 bg-purple-950/20 text-white placeholder-purple-400/30 focus:border-purple-400 focus:outline-none font-bold text-sm"
            maxLength={15}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-purple-300">Room Code</label>
          <input
            type="text"
            value={codeVal}
            onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
            placeholder="5-LETTER CODE"
            className="w-full h-14 text-center text-xl font-mono font-black tracking-widest uppercase rounded-xl border border-purple-500/20 bg-purple-950/20 text-white placeholder-purple-400/20 focus:border-purple-400 focus:outline-none"
            maxLength={5}
          />
        </div>
      </div>

      <div className="flex gap-3 w-full pt-2">
        <Button 
          variant="outline" 
          onClick={() => setMultiplayerState('mode_select')}
          className="flex-1 h-14 text-xs font-black uppercase border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => handleJoinRoom(codeVal)}
          className="flex-1 h-14 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/10 cursor-pointer"
        >
          Join Room
        </Button>
      </div>
    </div>
  );

  const renderMultiLobby = () => {
    const sortedPlayers = [...roomPlayers].sort((a, b) => (a.isHost ? -1 : b.isHost ? 1 : 0));

    return (
      <div className="flex flex-col gap-6 w-full max-w-2xl bg-slate-950/80 p-6 rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-xl text-left max-h-[85vh] overflow-y-auto">
        <div className="text-center p-6 bg-purple-950/30 border border-purple-500/20 rounded-2xl relative overflow-hidden shrink-0">
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Room Invitation Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)] select-all">{roomCode || roomData?.code || ''}</span>
            <Button
              size="icon"
              variant="ghost"
              className="hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
              onClick={handleCopyInviteLink}
            >
              <Link2 className="w-5 h-5 text-purple-400" />
            </Button>
          </div>
          <p className="text-[10px] text-purple-300/60 uppercase font-black tracking-wider mt-3">
            Invite up to 4 other pilots to race!
          </p>
        </div>

        {/* Settings Card */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 shrink-0">
          <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">
            Game Configurations
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Difficulty Level</label>
              {isCreator ? (
                <div className="flex gap-1">
                  {['easy', 'medium', 'hard'].map((lvl) => (
                    <Button
                      key={lvl}
                      size="sm"
                      variant={difficulty === lvl ? 'default' : 'outline'}
                      onClick={() => {
                        setDifficulty(lvl as any);
                        handleUpdateLobbySettings(operation, lvl as any, roundsCount);
                      }}
                      className={cn(
                        "text-[10px] font-bold uppercase flex-1 rounded-lg cursor-pointer",
                        difficulty === lvl ? "bg-purple-600 text-white" : "border-slate-800 text-slate-400 hover:bg-slate-800"
                      )}
                    >
                      {lvl}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="h-10 flex items-center px-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs font-bold text-slate-300 capitalize">
                  {difficulty}
                </div>
              )}
            </div>

            {/* Rounds */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Rounds Count</label>
              {isCreator ? (
                <div className="flex gap-1">
                  {[5, 10, 15, 20].map((cnt) => (
                    <Button
                      key={cnt}
                      size="sm"
                      variant={roundsCount === cnt ? 'default' : 'outline'}
                      onClick={() => {
                        setRoundsCount(cnt);
                        handleUpdateLobbySettings(operation, difficulty, cnt);
                      }}
                      className={cn(
                        "text-[10px] font-bold uppercase flex-1 rounded-lg cursor-pointer",
                        roundsCount === cnt ? "bg-purple-600 text-white" : "border-slate-800 text-slate-400 hover:bg-slate-800"
                      )}
                    >
                      {cnt} R
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="h-10 flex items-center px-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs font-bold text-slate-300">
                  {roundsCount} Rounds
                </div>
              )}
            </div>
          </div>

          {/* Operation selection (New settings feature) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Math Operation</label>
            {isCreator ? (
              <div className="flex flex-wrap gap-1">
                {['addition', 'subtraction', 'multiplication', 'division', 'mixed', 'algebra', 'exponents'].map((op) => (
                  <Button
                    key={op}
                    size="sm"
                    variant={operation === op ? 'default' : 'outline'}
                    onClick={() => {
                      setOperation(op as any);
                      handleUpdateLobbySettings(op as any, difficulty, roundsCount);
                    }}
                    className={cn(
                      "text-[9px] font-bold uppercase rounded-lg px-2.5 py-1 cursor-pointer",
                      operation === op ? "bg-purple-600 text-white" : "border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    {op}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="h-10 flex items-center px-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs font-bold text-slate-300 capitalize">
                {operation}
              </div>
            )}
          </div>
        </div>

        {/* Players list */}
        <div className="space-y-2 shrink-0">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Pilots in Lobby ({sortedPlayers.length}/5)</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-slate-800/40 border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/40">
            {sortedPlayers.map((player) => (
              <div key={player.uid} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-2">
                  {player.isHost ? (
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-200 text-sm truncate max-w-[150px]">{player.name}</span>
                  {player.uid === myUid && <span className="text-[10px] font-bold text-purple-400 shrink-0">(You)</span>}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  {player.isHost ? (
                    <span className="text-amber-400">Simulation Commander</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">Ready</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-800/40 shrink-0">
          <Button 
            variant="outline" 
            onClick={handleLeaveRoom}
            className="flex-1 h-14 text-xs font-black uppercase text-rose-500 border-rose-500/20 hover:bg-rose-500/10 rounded-xl cursor-pointer"
          >
            {isCreator ? 'Disband Room' : 'Leave Lobby'}
          </Button>

          {isCreator ? (
            <Button 
              onClick={handleStartMultiplayerGame}
              disabled={sortedPlayers.length < 2}
              className="flex-1 h-14 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-white rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Start Game ({sortedPlayers.length})
            </Button>
          ) : (
            <div className="flex-1 h-14 rounded-xl border border-slate-800 bg-slate-900/30 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">
              Waiting for commander...
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMultiFinished = () => {
    const sorted = [...roomPlayers].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    // Award coins locally for confetti and victory
    React.useEffect(() => {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, []);

    return (
      <div className="text-center flex flex-col items-center gap-6 animate-in zoom-in duration-500 max-w-lg w-full bg-slate-950/80 p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-xl">
        <Trophy className="w-20 h-20 text-amber-400 mathdash-glow-trophy animate-bounce" />
        <h2 className="text-3xl font-black uppercase tracking-tight text-white">RACE COMPLETED</h2>
        
        {winner && (
          <div className="p-5 bg-purple-950/30 border border-purple-500/20 rounded-2xl w-full text-center relative overflow-hidden">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> Champion
            </p>
            <p className="text-2xl font-black text-white">{winner.name}</p>
            <p className="text-xs text-purple-300 font-mono mt-1">Final Score: {winner.score} pts</p>
            <div className="absolute -bottom-2 -right-4 text-purple-500/10 font-black text-6xl tracking-wider select-none transform -rotate-12">OVER</div>
          </div>
        )}

        <div className="w-full space-y-2 text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Standings</p>
          <div className="divide-y divide-slate-800/40 border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/40">
            {sorted.map((player, idx) => (
              <div key={player.uid} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black font-mono text-purple-400">#{idx + 1}</span>
                  <span className="font-bold text-slate-200">{player.name}</span>
                  {player.uid === myUid && <span className="text-[10px] font-bold text-purple-400 shrink-0">(You)</span>}
                </div>
                <div className="font-mono text-sm font-black text-purple-300">{player.score} pts</div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleLeaveRoom}
          className="h-14 px-12 text-sm font-black uppercase bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] text-white rounded-xl shadow-lg mt-4 cursor-pointer"
        >
          Return to Hub
        </Button>
      </div>
    );
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'w-full relative select-none text-white flex flex-col',
        isFullscreen
          ? 'fixed inset-0 z-[9999] bg-slate-950'
          : 'py-4'
      )}
    >
      <style>{`
        @keyframes mathdash-glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8)); }
        }
        .mathdash-glow-trophy { animation: mathdash-glow 2s infinite ease-in-out; }
        .md3d-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(15,17,27,0.92);
          border: 1.5px solid rgba(139,92,246,0.15);
          box-shadow: 0 8px 48px rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
          transition: all 0.4s ease;
        }
      `}</style>

      <div
        className={cn(
          'md3d-card w-full',
          isFullscreen
            ? 'rounded-none border-none h-full'
            : 'max-w-[95%] xl:max-w-[90%] 2xl:max-w-[1440px] mx-auto rounded-3xl'
        )}
        style={isFullscreen ? { height: '100%' } : {}}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 text-center pb-2 pt-4 px-4 relative border-b border-purple-500/10">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 h-auto p-2 gap-1 text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/10 z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>

          <div className="flex justify-center mb-1">
            <div className="p-2 bg-purple-500/10 rounded-full border border-purple-500/20">
              <Gamepad2 className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Math Dash 3D
          </h1>
          <p className="text-purple-200/60 font-medium text-sm">
            Maneuver in the classroom space to collect math sums. Dodge the paper planes!
          </p>
        </div>

        {/* ── Game Content (fills remaining vertical space) ── */}
        <div
          className={cn(
            'relative w-full overflow-hidden flex flex-col items-center justify-center bg-slate-950',
            isFullscreen ? 'flex-1' : 'h-[360px] sm:h-[450px] md:h-[520px] lg:h-[600px] xl:h-[680px] 2xl:h-[760px]'
          )}
        >
          {gameMode === 'multi' ? (
            <>
              {multiplayerState === 'mode_select' && renderMultiModeSelect()}
              {multiplayerState === 'join_room' && renderMultiJoinRoom()}
              {multiplayerState === 'lobby' && renderMultiLobby()}
              {multiplayerState === 'playing' && (
                roomData?.players?.[myUid]?.finished ? (
                  // Early finisher waiting screen
                  <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in fade-in duration-500 max-w-md w-full">
                    <div className="mathdash-glow-trophy bg-gradient-to-tr from-purple-400 to-indigo-500 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 animate-bounce">
                      <Trophy className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black uppercase text-purple-300">Round Completed!</h3>
                    <p className="text-sm font-semibold text-slate-400 leading-relaxed">
                      You finished all calculation rounds. Waiting for other racers to cross the finish line...
                    </p>
                    <div className="w-full pt-4 max-h-[200px] overflow-y-auto">{renderLiveScoreboard()}</div>
                  </div>
                ) : (
                  // Active Gameplay Screen (3D Canvas + HUD with Live Standings)
                  <div className="w-full h-full absolute inset-0 flex flex-col">
                    {/* Top HUD bar */}
                    <div className="absolute top-2 left-2 right-2 z-[50] flex justify-between items-center bg-black/75 border border-purple-500/20 px-3 py-2 rounded-xl gap-2 shadow-lg flex-shrink-0">
                      <div className="flex flex-col shrink-0">
                        <span className="text-[8px] uppercase font-black tracking-widest text-purple-400">Score</span>
                        <span className="text-base md:text-xl font-black">{score}</span>
                      </div>
                      <div className="bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/30 truncate max-w-[45%]">
                        <span className="text-sm md:text-lg font-black text-purple-300">{questionText}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="bg-red-600/90 border border-red-400 px-2 py-0.5 rounded-md text-[9px] md:text-xs font-black">R: {answers.red}</span>
                        <span className="bg-green-600/90 border border-green-400 px-2 py-0.5 rounded-md text-[9px] md:text-xs font-black">G: {answers.green}</span>
                        <span className="bg-blue-600/90 border border-blue-400 px-2 py-0.5 rounded-md text-[9px] md:text-xs font-black">B: {answers.blue}</span>
                      </div>
                    </div>

                    {/* Live Standings HUD overlay during gameplay */}
                    <div className="absolute top-16 right-2 z-[50] w-48 hidden md:block bg-black/70 border border-purple-500/25 p-2.5 rounded-xl shadow-xl space-y-1.5 max-h-[160px] overflow-y-auto">
                      <p className="text-[8px] font-black uppercase text-purple-400 tracking-wider">Live Standings</p>
                      {roomPlayers.sort((a,b) => b.score - a.score).map((p, idx) => (
                        <div key={p.uid} className="flex justify-between items-center text-[10px] font-medium border-b border-slate-800/40 pb-1 last:border-b-0">
                          <span className="truncate max-w-[90px] text-slate-300">
                            {idx + 1}. {p.name} {p.uid === myUid && <span className="text-purple-400 font-bold">(You)</span>}
                          </span>
                          <span className="font-mono text-purple-300 font-bold">{p.score} pts</span>
                        </div>
                      ))}
                    </div>

                    {/* Feedback overlay */}
                    <AnimatePresence>
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: -20 }}
                          animate={{ opacity: 1, scale: 1.2, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -40 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none"
                        >
                          <div
                            className="px-6 py-3 bg-slate-950/90 border-4 rounded-2xl shadow-2xl font-black text-2xl uppercase tracking-tighter"
                            style={{ borderColor: feedback.color, color: feedback.color }}
                          >
                            {feedback.text}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Keyboard hint */}
                    <div className="absolute bottom-16 left-2 z-[50] bg-black/50 px-3 py-1 border border-purple-500/10 rounded-lg text-[9px] font-black tracking-wide text-purple-200 hidden sm:block">
                      Move: W A S D or Arrow Keys
                    </div>

                    {/* Mobile on-screen D-pad */}
                    <div className="absolute bottom-2 right-2 z-[50] flex flex-col items-center gap-1 sm:hidden">
                      <button
                        className="w-12 h-12 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center text-white active:bg-purple-700/40"
                        onPointerDown={() => pressKey('ArrowUp')} onPointerUp={() => releaseKey('ArrowUp')} onPointerLeave={() => releaseKey('ArrowUp')}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <div className="flex gap-1">
                        <button
                          className="w-12 h-12 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center text-white active:bg-purple-700/40"
                          onPointerDown={() => pressKey('ArrowLeft')} onPointerUp={() => releaseKey('ArrowLeft')} onPointerLeave={() => releaseKey('ArrowLeft')}
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                          className="w-12 h-12 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center text-white active:bg-purple-700/40"
                          onPointerDown={() => pressKey('ArrowDown')} onPointerUp={() => releaseKey('ArrowDown')} onPointerLeave={() => releaseKey('ArrowDown')}
                        >
                          <ArrowDown className="w-5 h-5" />
                        </button>
                        <button
                          className="w-12 h-12 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center text-white active:bg-purple-700/40"
                          onPointerDown={() => pressKey('ArrowRight')} onPointerUp={() => releaseKey('ArrowRight')} onPointerLeave={() => releaseKey('ArrowRight')}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Three.js canvas injection point */}
                    <div
                      ref={containerRef}
                      className="absolute inset-0 w-full h-full z-0"
                      style={{ background: '#87ceeb' }}
                    />
                  </div>
                )
              )}
              {multiplayerState === 'finished' && renderMultiFinished()}
            </>
          ) : (
            <>
              {/* Playing state: Three.js canvas + HUD */}
              {gameState === 'playing' && (
                <div className="w-full h-full absolute inset-0 flex flex-col">
                  {/* Top HUD bar */}
                  <div className="absolute top-2 left-2 right-2 z-[50] flex justify-between items-center bg-black/75 border border-purple-500/20 px-3 py-2 rounded-xl gap-2 shadow-lg flex-shrink-0">
                    <div className="flex flex-col shrink-0">
                      <span className="text-[8px] uppercase font-black tracking-widest text-purple-400">Score</span>
                      <span className="text-base md:text-xl font-black">{score}</span>
                    </div>
                    <div className="bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/30 truncate max-w-[45%]">
                      <span className="text-sm md:text-lg font-black text-purple-300">{questionText}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="bg-red-600/90 border border-red-400 px-2 py-0.5 rounded-md text-[9px] md:text-xs font-black">R: {answers.red}</span>
                      <span className="bg-green-600/90 border border-green-400 px-2 py-0.5 rounded-md text-[9px] md:text-xs font-black">G: {answers.green}</span>
                      <span className="bg-blue-600/90 border border-blue-400 px-2 py-0.5 rounded-md text-[9px] md:text-xs font-black">B: {answers.blue}</span>
                    </div>
                  </div>

                  {/* Feedback overlay */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ opacity: 1, scale: 1.2, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -40 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none"
                      >
                        <div
                          className="px-6 py-3 bg-slate-950/90 border-4 rounded-2xl shadow-2xl font-black text-2xl uppercase tracking-tighter"
                          style={{ borderColor: feedback.color, color: feedback.color }}
                        >
                          {feedback.text}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Keyboard hint */}
                  <div className="absolute bottom-16 left-2 z-[50] bg-black/50 px-3 py-1 border border-purple-500/10 rounded-lg text-[9px] font-black tracking-wide text-purple-200 hidden sm:block">
                    Move: W A S D or Arrow Keys
                  </div>

                  {/* Mobile on-screen D-pad */}
                  <div className="absolute bottom-2 right-2 z-[50] flex flex-col items-center gap-1 sm:hidden">
                    <button
                      className="w-12 h-12 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center text-white active:bg-purple-700/40"
                      onPointerDown={() => pressKey('ArrowUp')} onPointerUp={() => releaseKey('ArrowUp')} onPointerLeave={() => releaseKey('ArrowUp')}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1">
                      <button
                        className="w-12 h-12 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center text-white active:bg-purple-700/40"
                        onPointerDown={() => pressKey('ArrowLeft')} onPointerUp={() => releaseKey('ArrowLeft')} onPointerLeave={() => releaseKey('ArrowLeft')}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button
                        className="w-12 h-12 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center text-white active:bg-purple-700/40"
                        onPointerDown={() => pressKey('ArrowDown')} onPointerUp={() => releaseKey('ArrowDown')} onPointerLeave={() => releaseKey('ArrowDown')}
                      >
                        <ArrowDown className="w-5 h-5" />
                      </button>
                      <button
                        className="w-12 h-12 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center text-white active:bg-purple-700/40"
                        onPointerDown={() => pressKey('ArrowRight')} onPointerUp={() => releaseKey('ArrowRight')} onPointerLeave={() => releaseKey('ArrowRight')}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Three.js canvas injection point */}
                  <div
                    ref={containerRef}
                    className="absolute inset-0 w-full h-full z-0"
                    style={{ background: '#87ceeb' }}
                  />
                </div>
              )}

              {/* Idle / Start screen */}
              {gameState === 'idle' && (
                <div className="flex flex-col items-center gap-6 p-8 text-center animate-in fade-in duration-300">
                  {isDailyBonus && (
                    <Badge className="bg-gradient-to-r from-purple-400 to-indigo-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-purple-500/20 animate-pulse">
                      <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                      ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
                    </Badge>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={startGame}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-indigo-650 hover:scale-105 transition-all duration-300 font-black tracking-widest text-white shadow-xl shadow-purple-500/10 border border-purple-400/20 px-8 py-6 rounded-2xl text-base cursor-pointer"
                    >
                      SOLO SIMULATION
                    </Button>
                    <Button
                      onClick={() => {
                        setGameMode('multi');
                        setMultiplayerState('mode_select');
                      }}
                      size="lg"
                      className="bg-slate-900 border border-purple-500/30 text-purple-300 hover:bg-slate-800 hover:scale-105 transition-all duration-300 font-black tracking-widest px-8 py-6 rounded-2xl text-base flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="w-5 h-5" /> MULTIPLAYER LOBBY
                    </Button>
                  </div>
                </div>
              )}

              {/* Game Over screen */}
              {gameState === 'gameover' && (
                <div className="flex flex-col items-center gap-6 p-8 text-center animate-in zoom-in duration-500 max-w-md">
                  <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-500">
                    <AlertCircle className="w-16 h-16" />
                  </div>
                  <h2 className="text-4xl font-black uppercase text-rose-500">
                    {gameOverReason === 'wrong' ? 'Wrong Answer!' : 'Crash!'}
                  </h2>
                  <p className="text-slate-300 font-medium">
                    {gameOverReason === 'wrong' ? 'Double check your calculations next time!' : 'You got hit by a rogue paper airplane!'}
                  </p>
                  <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 w-full">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Final Score</span>
                    <p className="text-5xl font-black text-purple-400 mt-1">{score} pts</p>
                    <p className="text-xs text-slate-400 mt-2">Solved: {solvedCount} / {ROUNDS_TO_WIN} targets</p>
                  </div>
                  <div className="flex gap-4 w-full">
                    <Button onClick={startGame} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 rounded-xl cursor-pointer">
                      <RotateCcw className="mr-2 w-4 h-4" /> Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Win / Finished screen */}
              {gameState === 'finished' && (
                <div className="flex flex-col items-center gap-8 px-6 text-center w-full max-w-xl mx-auto py-8 animate-in fade-in duration-500">
                  <Trophy className="w-28 h-28 text-purple-400 mathdash-glow-trophy animate-bounce" />
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter uppercase text-white">SIMULATION COMPLETED</h2>
                    <p className="text-slate-300 font-medium text-lg">
                      Solved Score: <span className="text-purple-400 text-3xl font-black">{score} pts</span>
                    </p>
                  </div>

                  {isDailyBonus && (
                    <div className="relative w-full bg-gradient-to-r from-purple-500/10 via-indigo-500/20 to-purple-500/10 border-2 border-purple-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 overflow-hidden animate-in zoom-in-95 duration-500">
                      <div className="mathdash-glow-trophy bg-gradient-to-tr from-purple-400 to-indigo-500 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 relative">
                        <Coins className="h-10 w-10 fill-purple-950 text-purple-950 animate-spin" style={{ animationDuration: '5s' }} />
                        <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-900 shadow">CLAIMED</span>
                      </div>
                      <h3 className="text-lg font-black text-purple-400 tracking-wide uppercase">Daily Bonus Claimed!</h3>
                      <p className="text-sm font-semibold text-slate-400 text-center max-w-xs leading-relaxed">
                        You earned <span className="text-purple-400 font-black">+{dailyBonusAmount} Lingo-Coins</span> for your pet!
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4 z-10 relative">
                    <Button onClick={startGame} size="lg" className="rounded-full px-8 font-bold bg-purple-600 text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/25 border border-purple-500/30 cursor-pointer">
                      <RotateCcw className="mr-2 w-5 h-5" /> RE-DASH
                    </Button>
                    <Button variant="outline" asChild size="lg" className="rounded-full px-8 font-bold border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                      <Link href="/games">RETURN TO BASE</Link>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 bg-slate-950/90 px-4 py-3 flex justify-between items-center border-t border-purple-500/10">
          <div className="flex gap-2">
            <Button variant="ghost" asChild className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-sm">
              <Link href="/games">EXIT SIMULATION</Link>
            </Button>
            {gameState === 'idle' && (
              <Button
                variant="ghost"
                onClick={() => {
                  toast({
                    title: 'How to Play',
                    description: 'Use WASD or Arrow Keys to move. Collect the correct-colored sphere that matches the answer. Dodge gray paper planes!',
                  });
                }}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-sm animate-pulse"
              >
                INSTRUCTIONS
              </Button>
            )}
          </div>

          {gameState === 'playing' && (
            <div className="flex items-center gap-3 text-xs font-black text-purple-400">
              <span>SOLVED {solvedCount} / {ROUNDS_TO_WIN}</span>
              <div className="w-24 h-2.5 bg-slate-950/50 rounded-full overflow-hidden border border-purple-500/10">
                <motion.div
                  className="h-full bg-purple-500 shadow-[0_0_10px_#a855f7]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(solvedCount / ROUNDS_TO_WIN) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
