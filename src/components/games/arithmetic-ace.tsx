"use client";

import { shuffleArray } from "@/lib/shuffle";
import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Loader2,
  Sparkles,
  Timer,
  CheckCircle,
  XCircle,
  Repeat,
  Maximize,
  Minimize,
  Calculator,
  Trophy,
  Plus,
  Minus,
  X,
  Divide,
  Shuffle,
  Users,
  Copy,
  ArrowLeft,
  Crown,
  Trash2,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SkillLevel } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";
import confetti from "canvas-confetti";

type Operation = "Addition" | "Subtraction" | "Multiplication" | "Division" | "Mixed";
type GameState = "idle" | "selecting_category" | "selecting_difficulty" | "playing" | "answered" | "finished" | "instructions";

interface Problem {
  question: string;
  answer: number;
  options: number[];
}

const TIMER_LIMIT = 10;

const CATEGORIES: { label: Operation; icon: any; color: string }[] = [
    { label: "Addition", icon: Plus, color: "bg-blue-500" },
    { label: "Subtraction", icon: Minus, color: "bg-red-500" },
    { label: "Multiplication", icon: X, color: "bg-amber-500" },
    { label: "Division", icon: Divide, color: "bg-emerald-500" },
    { label: "Mixed", icon: Shuffle, color: "bg-purple-500" },
];

const generateWrongOptions = (ans: number): number[] => {
  const options = [ans];
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = ans + offset;
    if (!options.includes(wrong) && wrong >= 0) {
      options.push(wrong);
    }
  }
  return shuffleArray(options);
};

export function ArithmeticAce({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();
  const game = getGameBySlug(slug);

  // Main Game Mode Selection
  const [gameMode, setGameMode] = React.useState<'single' | 'multi'>('single');

  // Single Player states
  const [gameState, setGameState] = React.useState<GameState>("idle");
  const [difficulty, setDifficulty] = React.useState<SkillLevel>("beginner");
  const [operation, setOperation] = React.useState<Operation>("Mixed");
  const [problem, setProblem] = React.useState<Problem | null>(null);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(TIMER_LIMIT);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [round, setRound] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Multiplayer Room states
  const [multiplayerState, setMultiplayerState] = React.useState<'mode_select' | 'join_room' | 'lobby' | 'playing' | 'finished'>('mode_select');
  const [nickname, setNickname] = React.useState('');
  const [roomCode, setRoomCode] = React.useState('');
  const [roomData, setRoomData] = React.useState<any>(null);
  const [roomPlayers, setRoomPlayers] = React.useState<any[]>([]);
  const [isHost, setIsHost] = React.useState(false);
  const [myUid, setMyUid] = React.useState('');
  const [codeVal, setCodeVal] = React.useState('');
  const [localAnswered, setLocalAnswered] = React.useState(false);
  const [questionMode, setQuestionMode] = React.useState<'auto' | 'custom'>('auto');
  const [customQuestions, setCustomQuestions] = React.useState<Problem[]>([
    { question: "10 + 20", answer: 30, options: [30, 20, 40, 25] }
  ]);
  const [isEditingQuestions, setIsEditingQuestions] = React.useState(false);

  const isCreator = React.useMemo(() => {
    if (gameMode !== 'multi') return false;
    const currentUid = user?.uid || myUid;
    return roomData && roomData.hostId && currentUid ? roomData.hostId === currentUid : isHost;
  }, [gameMode, roomData, user, myUid, isHost]);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Session Recovery
  React.useEffect(() => {
    if (typeof window === 'undefined' || !firestore) return;
    
    const savedRoom = localStorage.getItem("lingoland_active_roomCode_arithmetic-ace");
    const savedUid = localStorage.getItem("lingoland_active_myUid_arithmetic-ace");
    const savedMode = localStorage.getItem("lingoland_active_gameMode_arithmetic-ace");
    
    if (savedRoom && savedUid && savedMode === 'multi') {
      const roomRef = doc(firestore, "stats", "aa_room_" + savedRoom);
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
            } else if (data.status === 'playing') {
              const solved = playerObj.solvedCount || 0;
              const savedScore = playerObj.score || 0;
              setScore(savedScore);
              setRound(solved + 1);
              setMultiplayerState('playing');
            }
            
            toast({
              title: "Reconnected 🎮",
              description: `Resumed active session in room ${savedRoom}.`,
            });
            return;
          }
        }
        localStorage.removeItem("lingoland_active_roomCode_arithmetic-ace");
        localStorage.removeItem("lingoland_active_myUid_arithmetic-ace");
        localStorage.removeItem("lingoland_active_gameMode_arithmetic-ace");
      }).catch((err) => {
        console.warn("Session recovery failed:", err);
      });
    }
  }, [firestore]);

  // Sync nickname on user context load
  React.useEffect(() => {
    if (user?.displayName) {
      setNickname(user.displayName);
    } else {
      setNickname(`Player_${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [user]);

  // Sync Room Updates in Lobby and Play (Multiplayer)
  React.useEffect(() => {
    if (!firestore || !roomCode || gameMode !== 'multi') return;
    
    // Using stats collection with room prefix to bypass rules limitations
    const roomRef = doc(firestore, "stats", "aa_room_" + roomCode);
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
      
      if (data.difficulty) setDifficulty(data.difficulty as SkillLevel);
      if (data.operation) setOperation(data.operation as Operation);
      if (data.questionMode) setQuestionMode(data.questionMode as 'auto' | 'custom');
      if (data.customQuestions && !isEditingQuestions) setCustomQuestions(data.customQuestions);
      
      const currentUid = user?.uid || myUid;
      if (currentUid && data.hostId) {
        setIsHost(data.hostId === currentUid);
      }
      
      // Check if room was disbanded via status
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
        setRound(1);
        setTimeLeft(TIMER_LIMIT);
        setIsCorrect(null);
        setLocalAnswered(false);
      }
      
      if (data.status === 'finished' && multiplayerState !== 'finished') {
        setMultiplayerState('finished');
      }
    }, (error) => {
      console.error("Firestore rooms snapshot error:", error);
    });
    
    return () => unsubscribe();
  }, [firestore, roomCode, gameMode, multiplayerState, isEditingQuestions, user, myUid]);

  // Sync finished status: declare finished once everyone completes
  React.useEffect(() => {
    if (gameMode === 'multi' && roomCode && roomData && roomData.status === 'playing') {
      const list = Object.values(roomData.players || {}) as any[];
      if (list.length > 0 && list.every((p: any) => p.finished)) {
        // Everyone is finished, declare winner and end game
        const sorted = [...list].sort((a, b) => b.score - a.score);
        const winner = sorted[0];
        const roomRef = doc(firestore, "stats", "aa_room_" + roomCode);
        updateDoc(roomRef, {
          status: 'finished',
          winnerId: winner.uid,
          winnerName: winner.name
        }).catch(e => console.error("Error setting winner:", e));
      }
    }
  }, [gameMode, roomCode, roomData]);

  // Celebrate with Confetti for the Winner
  React.useEffect(() => {
    if (gameMode === 'multi' && multiplayerState === 'finished' && roomPlayers.length > 0 && roomData) {
      if (roomData.winnerId === myUid) {
        const end = Date.now() + (3 * 1000);
        const interval = setInterval(() => {
          if (Date.now() > end) return clearInterval(interval);
          confetti({
            particleCount: 50,
            spread: 65,
            origin: { x: Math.random(), y: Math.random() - 0.2 }
          });
        }, 250);
        return () => clearInterval(interval);
      }
    }
  }, [multiplayerState, roomPlayers, roomData, myUid, gameMode]);

  const generateProblem = (level: SkillLevel, opType: Operation): Problem => {
    let a, b, op, ans;
    
    let actualOp = opType;
    if (opType === "Mixed") {
        const ops: Operation[] = level === 'beginner' ? ['Addition', 'Subtraction'] : level === 'intermediate' ? ['Addition', 'Subtraction', 'Multiplication'] : ['Addition', 'Subtraction', 'Multiplication', 'Division'];
        actualOp = ops[Math.floor(Math.random() * ops.length)];
    }

    switch (actualOp) {
      case 'Addition':
        a = Math.floor(Math.random() * (level === 'beginner' ? 20 : level === 'intermediate' ? 100 : 500));
        b = Math.floor(Math.random() * (level === 'beginner' ? 20 : level === 'intermediate' ? 100 : 500));
        ans = a + b;
        op = '+';
        break;
      case 'Subtraction':
        a = Math.floor(Math.random() * (level === 'beginner' ? 20 : 100)) + 10;
        b = Math.floor(Math.random() * a);
        ans = a - b;
        op = '-';
        break;
      case 'Multiplication':
        a = Math.floor(Math.random() * (level === 'intermediate' ? 12 : 20)) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        ans = a * b;
        op = '×';
        break;
      case 'Division':
        ans = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        a = ans * b;
        op = '÷';
        break;
      default:
        a = 1; b = 1; ans = 2; op = '+';
    }

    const options = [ans];
    while (options.length < 4) {
      const wrong = ans + (Math.floor(Math.random() * 10) - 5);
      if (!options.includes(wrong) && wrong >= 0) options.push(wrong);
    }

    return {
      question: `${a} ${op} ${b}`,
      answer: ans,
      options: shuffleArray(options),
    };
  };

  const handleSelectCategory = (op: Operation) => {
      setOperation(op);
      setGameState('selecting_difficulty');
  }

  const handleStartGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    nextRound(level, operation);
  };

  const nextRound = (level: SkillLevel, op: Operation) => {
    const newProblem = generateProblem(level, op);
    setProblem(newProblem);
    setIsCorrect(null);
    setTimeLeft(TIMER_LIMIT);
    setGameState("playing");
  };

  const activeProblem = React.useMemo(() => {
    if (gameMode === 'multi') {
      return (roomData?.questions?.[round - 1]) || null;
    } else {
      return problem;
    }
  }, [gameMode, round, roomData, problem]);

  const handleAnswer = async (val: number) => {
    if (gameMode === 'single' && gameState !== "playing") return;
    if (gameMode === 'multi' && (multiplayerState !== "playing" || localAnswered)) return;

    const currentProb = gameMode === 'multi' ? activeProblem : problem;
    if (!currentProb) return;

    const correct = val === currentProb.answer;
    setIsCorrect(correct);
    
    let newScore = score;
    if (correct) {
      newScore = score + 10;
      setScore(newScore);
    }

    if (gameMode === 'single') {
      setGameState("answered");
      setTimeout(() => {
          if (round < 10) {
              setRound(r => r + 1);
              nextRound(difficulty, operation);
          } else {
              setGameState("finished");
              if (firestore && game) {
                  logAnalyticsEvent(firestore, user?.uid || 'guest', {
                      type: 'game_played',
                      details: { slug: game.slug, title: game.title, score: newScore }
                  });
              }
          }
      }, 1500);
    } else {
      // Multiplayer mode answer
      setLocalAnswered(true);
      if (firestore && roomCode) {
        try {
          const roomRef = doc(firestore, "stats", "aa_room_" + roomCode);
          await updateDoc(roomRef, {
            [`players.${myUid}.score`]: newScore,
            [`players.${myUid}.solvedCount`]: round
          });
        } catch (e) {
          console.error("Failed to update multiplayer progress:", e);
        }
      }

      setTimeout(async () => {
        setLocalAnswered(false);
        setIsCorrect(null);
        if (round < (roomData?.questions?.length || 10)) {
          setRound(r => r + 1);
          setTimeLeft(TIMER_LIMIT);
        } else {
          // Finish battle locally
          if (firestore && roomCode) {
            try {
              const roomRef = doc(firestore, "stats", "aa_room_" + roomCode);
              await updateDoc(roomRef, {
                [`players.${myUid}.finished`]: true
              });
            } catch (e) {
              console.error("Error updating finished status:", e);
            }
          }
        }
      }, 1500);
    }
  };

  // Timer runner
  React.useEffect(() => {
    const isPlaying = gameMode === 'multi' 
      ? (multiplayerState === 'playing' && !localAnswered && !roomData?.players?.[myUid]?.finished)
      : (gameState === "playing");

    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      handleAnswer(-999); // Timeout
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, multiplayerState, timeLeft, gameMode, localAnswered, roomData, myUid]);

  // Multiplayer room helpers
  const handleCreateRoom = async () => {
    if (!firestore) return;
    if (!nickname.trim()) {
      toast({
        title: "Nickname Required ✏️",
        description: "Please enter a name before creating a room.",
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
      const roomRef = doc(firestore, "stats", "aa_room_" + code);
      await setDoc(roomRef, {
        code,
        hostId: hostUid,
        hostName: nickname,
        difficulty: "beginner",
        operation: "Mixed",
        questionMode: "auto",
        customQuestions: [
          { question: "10 + 20", answer: 30, options: [30, 20, 40, 25] }
        ],
        status: 'lobby',
        players: initialPlayers,
        questions: [],
        createdAt: Date.now()
      });

      setRoomCode(code);
      setIsHost(true);
      setMultiplayerState('lobby');
      localStorage.setItem("lingoland_active_roomCode_arithmetic-ace", code);
      localStorage.setItem("lingoland_active_myUid_arithmetic-ace", hostUid);
      localStorage.setItem("lingoland_active_gameMode_arithmetic-ace", 'multi');
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
      const roomRef = doc(firestore, "stats", "aa_room_" + cleanCode);
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
      if (list.length >= 4) {
        toast({
          title: "Room Full 👥",
          description: "This lobby is full (max 4 players).",
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
      localStorage.setItem("lingoland_active_roomCode_arithmetic-ace", cleanCode);
      localStorage.setItem("lingoland_active_myUid_arithmetic-ace", playerUid);
      localStorage.setItem("lingoland_active_gameMode_arithmetic-ace", 'multi');
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
      const roomRef = doc(firestore, "stats", "aa_room_" + roomCode);
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

  const cleanSavedSession = () => {
    localStorage.removeItem("lingoland_active_roomCode_arithmetic-ace");
    localStorage.removeItem("lingoland_active_myUid_arithmetic-ace");
    localStorage.removeItem("lingoland_active_gameMode_arithmetic-ace");
  };

  const resetMultiplayerState = () => {
    cleanSavedSession();
    setRoomCode('');
    setMyUid('');
    setIsHost(false);
    setRoomData(null);
    setRoomPlayers([]);
    setCodeVal('');
    setScore(0);
    setRound(0);
    setLocalAnswered(false);
    setMultiplayerState('mode_select');
    setGameState('idle');
    setGameMode('single');
  };

  const handleUpdateLobbySettings = async (selectedOp: Operation, selectedDiff: SkillLevel, qMode?: 'auto' | 'custom') => {
    if (!firestore || !roomCode || !isCreator) return;
    try {
      const roomRef = doc(firestore, "stats", "aa_room_" + roomCode);
      const updates: any = {
        operation: selectedOp,
        difficulty: selectedDiff
      };
      if (qMode) updates.questionMode = qMode;
      await updateDoc(roomRef, updates);
    } catch (e) {
      console.error("Failed to update settings:", e);
    }
  };

  const handleSaveCustomQuestions = async (updatedList: Problem[]) => {
    if (!firestore || !roomCode || !isCreator) return;
    try {
      const roomRef = doc(firestore, "stats", "aa_room_" + roomCode);
      await updateDoc(roomRef, {
        customQuestions: updatedList
      });
      toast({
        title: "Calculations Saved 💾",
        description: `Custom question list updated (${updatedList.length} rounds).`
      });
    } catch (e) {
      console.error("Failed to save custom questions:", e);
      toast({
        title: "Database Error",
        description: "Could not save custom questions to server.",
        variant: "destructive"
      });
    }
  };

  const handleStartMultiplayerGame = async () => {
    if (!firestore || !roomCode || !isCreator) return;
    if (roomPlayers.length < 1) {
      toast({
        title: "Waiting for Players 👥",
        description: "Need at least 1 player in the lobby to start.",
        variant: "destructive"
      });
      return;
    }

    try {
      let questionsList = [];
      if (questionMode === 'custom') {
        const rawList = roomData?.customQuestions || [];
        if (rawList.length === 0) {
          toast({
            title: "No Calculations configured 📄",
            description: "Please configure custom questions first or use auto mode.",
            variant: "destructive"
          });
          return;
        }
        questionsList = [...rawList];
      } else {
        for (let i = 0; i < 10; i++) {
          questionsList.push(generateProblem(difficulty, operation));
        }
      }

      const roomRef = doc(firestore, "stats", "aa_room_" + roomCode);
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

  // Rendering Sub-sections
  const renderMultiModeSelect = () => (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md p-4 sm:p-6 bg-slate-900/40 rounded-3xl border border-border/20 shadow-lg">
      <Users className="w-12 h-12 sm:w-16 sm:h-16 text-teal-400 mx-auto" />
      <h3 className="text-xl sm:text-2xl font-black uppercase text-center">Multiplayer Lobby</h3>
      
      <div className="w-full space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Nickname</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter nickname"
          className="w-full h-11 sm:h-12 px-4 rounded-xl border border-border bg-slate-900/50 text-white text-sm sm:text-base font-bold"
          maxLength={15}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full pt-2 sm:pt-4">
        <Button 
          onClick={handleCreateRoom}
          className="h-11 sm:h-14 text-sm sm:text-lg font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20"
        >
          Create Battle Room
        </Button>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={codeVal}
            onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
            placeholder="INVITE CODE"
            className="flex-1 h-11 sm:h-14 text-center text-sm sm:text-xl font-black tracking-widest uppercase rounded-2xl border border-border bg-slate-900/50"
            maxLength={5}
          />
          <Button 
            onClick={() => handleJoinRoom(codeVal)}
            className="h-11 sm:h-14 px-4 sm:px-6 text-sm sm:text-lg font-black uppercase bg-teal-500 hover:bg-teal-400 text-slate-950"
          >
            Join
          </Button>
        </div>
      </div>

      <Button variant="ghost" onClick={resetMultiplayerState} className="uppercase font-bold opacity-60 text-xs sm:text-sm">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Solo Mode
      </Button>
    </div>
  );

  const renderMultiJoinRoom = () => (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md p-4 sm:p-6 bg-slate-900/40 rounded-3xl border border-border/20 shadow-lg">
      <Users className="w-12 h-12 sm:w-16 sm:h-16 text-teal-400 mx-auto" />
      <h3 className="text-xl sm:text-2xl font-black uppercase text-center">Join Battle Room</h3>
      
      <div className="w-full space-y-3 sm:space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname"
            className="w-full h-11 sm:h-12 px-4 rounded-xl border border-border bg-slate-900/50 text-white text-sm sm:text-base font-bold"
            maxLength={15}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invite Code</label>
          <input
            type="text"
            value={codeVal}
            onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
            placeholder="5-LETTER CODE"
            className="w-full h-11 sm:h-14 text-center text-sm sm:text-2xl font-black tracking-widest uppercase rounded-2xl border border-border bg-slate-900/50"
            maxLength={5}
          />
        </div>
      </div>

      <div className="flex gap-3 w-full pt-2 sm:pt-4">
        <Button 
          variant="outline" 
          onClick={() => setMultiplayerState('mode_select')}
          className="flex-1 h-11 sm:h-14 text-xs sm:text-sm font-black uppercase border-border cursor-pointer"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => handleJoinRoom(codeVal)}
          className="flex-1 h-11 sm:h-14 text-xs sm:text-sm font-black uppercase tracking-wider bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer"
        >
          Join Room
        </Button>
      </div>
    </div>
  );

  const renderCustomQuestionsEditor = () => {
    const addQuestion = () => {
      setCustomQuestions([...customQuestions, { question: "10 + 10", answer: 20, options: [20, 15, 25, 18] }]);
    };

    const removeQuestion = (idx: number) => {
      if (customQuestions.length <= 1) return;
      setCustomQuestions(customQuestions.filter((_, i) => i !== idx));
    };

    const updateQuestionText = (idx: number, question: string) => {
      const updated = [...customQuestions];
      updated[idx].question = question;
      setCustomQuestions(updated);
    };

    const updateQuestionAnswer = (idx: number, answerStr: string) => {
      const updated = [...customQuestions];
      const ansNum = Number(answerStr.trim());
      updated[idx].answer = isNaN(ansNum) ? 0 : ansNum;
      updated[idx].options = generateWrongOptions(updated[idx].answer);
      setCustomQuestions(updated);
    };

    return (
      <div className="w-full max-w-2xl bg-slate-900/90 p-6 rounded-3xl border border-border space-y-4 max-h-[550px] overflow-y-auto text-left">
        <div className="flex justify-between items-center border-b border-border/30 pb-3">
          <h3 className="text-lg font-black uppercase text-teal-400 flex items-center gap-1.5">
            <Settings className="w-5 h-5" /> Customize Calculations
          </h3>
          <Button 
            size="sm" 
            onClick={addQuestion} 
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Round
          </Button>
        </div>

        <div className="space-y-4">
          {customQuestions.map((cq, idx) => (
            <div key={idx} className="p-4 bg-slate-950/40 border border-border/20 rounded-2xl relative space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-teal-400">Round {idx + 1}</span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => removeQuestion(idx)}
                  disabled={customQuestions.length <= 1}
                  className="text-rose-400 hover:text-rose-350 hover:bg-rose-950/20 w-8 h-8 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Math Equation / Question</label>
                  <input
                    type="text"
                    value={cq.question}
                    onChange={(e) => updateQuestionText(idx, e.target.value)}
                    placeholder="e.g. 15 + 25 or 12 x 12"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-slate-950 text-sm font-bold text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Correct Answer (Number)</label>
                  <input
                    type="text"
                    value={cq.answer || ''}
                    onChange={(e) => updateQuestionAnswer(idx, e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-slate-950 text-sm font-bold text-white"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Computed Options:</span>
                <span className="font-bold text-teal-400 bg-slate-950 px-2 py-0.5 rounded border border-border/30 font-mono">
                  {cq.options.join(', ')}
                </span>
                <span className="text-[10px] opacity-75">(Distractors generated automatically)</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/30">
          <Button 
            variant="outline" 
            onClick={() => setIsEditingQuestions(false)}
            className="flex-1 h-12 text-xs font-black uppercase border-border text-muted-foreground"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              handleSaveCustomQuestions(customQuestions);
              setIsEditingQuestions(false);
            }}
            className="flex-1 h-12 text-xs font-black uppercase bg-teal-500 hover:bg-teal-400 text-slate-950"
          >
            Apply & Save
          </Button>
        </div>
      </div>
    );
  };

  const renderMultiLobby = () => {
    const playersList = roomPlayers;
    const sortedPlayers = [...playersList].sort((a, b) => (a.isHost ? -1 : b.isHost ? 1 : 0));

    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl">
        <div className="text-center p-4 sm:p-6 bg-slate-950/40 border border-border/40 rounded-3xl relative overflow-hidden">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-5xl font-black tracking-wider text-teal-400 font-mono select-all">{roomCode}</span>
            <Button
              size="icon"
              variant="ghost"
              className="hover:text-teal-400 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                toast({ title: "Code Copied! 📋", description: "Invitation code copied to clipboard." });
              }}
            >
              <Copy className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mt-3">
            Share this code with up to 3 friends to join!
          </p>
        </div>

        {/* Game Settings Card */}
        <div className="p-4 sm:p-6 bg-slate-900/20 border border-border/20 rounded-3xl space-y-4">
          <h4 className="text-sm font-black uppercase text-teal-400 flex items-center gap-1.5">
            Battle Parameters
          </h4>

          <div className="grid grid-cols-1 gap-4">
            {/* Question Mode selection */}
            <div className="space-y-1.5 border-b border-border/10 pb-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Question Mode</label>
              {isCreator ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={questionMode === 'auto' ? 'default' : 'outline'}
                    onClick={() => {
                      setQuestionMode('auto');
                      handleUpdateLobbySettings(operation, difficulty, 'auto');
                    }}
                    className="text-xs font-bold uppercase flex-1"
                  >
                    Auto Generated
                  </Button>
                  <Button
                    size="sm"
                    variant={questionMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => {
                      setQuestionMode('custom');
                      handleUpdateLobbySettings(operation, difficulty, 'custom');
                    }}
                    className="text-xs font-bold uppercase flex-1"
                  >
                    Custom Equations
                  </Button>
                </div>
              ) : (
                <div className="h-10 flex items-center px-3 rounded-xl bg-slate-950/40 border border-border/40 justify-between">
                  <Badge variant="outline" className="uppercase font-bold">{questionMode === 'auto' ? 'Auto Generated' : 'Custom Equations'}</Badge>
                  {questionMode === 'custom' && (
                    <span className="text-xs font-bold text-teal-400 font-mono">
                      {customQuestions.length} Questions
                    </span>
                  )}
                </div>
              )}
            </div>

            {questionMode === 'auto' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Operations selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Math Operation</label>
                  {isCreator ? (
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <Button
                          key={cat.label}
                          size="sm"
                          variant={operation === cat.label ? 'default' : 'outline'}
                          onClick={() => {
                            setOperation(cat.label);
                            handleUpdateLobbySettings(cat.label, difficulty, 'auto');
                          }}
                          className="text-xs font-bold uppercase"
                        >
                          {cat.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-10 flex items-center px-3 rounded-xl bg-slate-950/40 border border-border/40">
                      <Badge variant="secondary" className="uppercase font-bold">{operation}</Badge>
                    </div>
                  )}
                </div>

                {/* Difficulty selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Difficulty Level</label>
                  {isCreator ? (
                    <div className="flex gap-1.5">
                      {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                        <Button
                          key={lvl}
                          size="sm"
                          variant={difficulty === lvl ? 'default' : 'outline'}
                          onClick={() => {
                            setDifficulty(lvl as SkillLevel);
                            handleUpdateLobbySettings(operation, lvl as SkillLevel, 'auto');
                          }}
                          className="text-xs font-bold uppercase flex-1"
                        >
                          {lvl}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-10 flex items-center px-3 rounded-xl bg-slate-950/40 border border-border/40">
                      <Badge variant="outline" className="uppercase font-bold">{difficulty}</Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center bg-slate-950/40 border border-border/40 p-3 rounded-xl">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Active Rounds</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">{customQuestions.length} Custom Calculations</p>
                  </div>
                  {isCreator && (
                    <Button 
                      size="sm" 
                      onClick={() => setIsEditingQuestions(true)}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 mr-1" /> Edit Calculations ({customQuestions.length})
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connected Players list */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Contenders ({playersList.length}/4)</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-border/20 border border-border/20 rounded-2xl overflow-hidden bg-slate-950/20">
            {sortedPlayers.map((player) => (
              <div key={player.uid} className="flex justify-between items-center p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  {player.isHost ? (
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-white text-sm">{player.name}</span>
                  {player.uid === myUid && <span className="text-[10px] font-bold text-teal-400">(You)</span>}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {player.isHost ? (
                    <span className="text-amber-500 font-black">Lobby Host</span>
                  ) : (
                    <span className="text-teal-400">Ready</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/20">
          <Button 
            variant="outline" 
            onClick={handleLeaveRoom}
            className="flex-1 h-11 sm:h-14 text-xs sm:text-sm font-black uppercase text-rose-400 border-rose-500/20 hover:bg-rose-950/10 cursor-pointer"
          >
            {isCreator ? 'Disband Room' : 'Leave Lobby'}
          </Button>

          {isCreator && (
            <Button 
              onClick={handleStartMultiplayerGame}
              disabled={playersList.length < 1}
              className="flex-1 h-11 sm:h-14 text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:from-teal-400 hover:to-emerald-450 cursor-pointer shadow-lg shadow-teal-500/10"
            >
              Start Math Race
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderLiveScoreboard = () => {
    const sorted = [...roomPlayers].sort((a, b) => b.score - a.score);
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:space-y-2 w-full text-left">
        {sorted.map((p, idx) => (
          <div key={p.uid} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 border border-border/25">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-black font-mono text-muted-foreground flex-shrink-0">#{idx + 1}</span>
              <span className="text-xs font-bold text-white truncate max-w-[100px]">{p.name}</span>
              {p.uid === myUid && <span className="text-[9px] font-bold text-teal-400 shrink-0">(You)</span>}
            </div>
            <div className="flex items-center gap-2 font-mono text-xs shrink-0">
              <span className="text-muted-foreground text-[10px]">Q{p.solvedCount}/10</span>
              <span className="text-teal-400 font-black">{p.score}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMultiPlaying = () => {
    if (!roomData || !activeProblem) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Configuring Race Course...</p>
        </div>
      );
    }

    const myPlayerData = roomData.players?.[myUid];
    const isFinishedLocally = myPlayerData?.finished;

    if (isFinishedLocally) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center animate-in fade-in duration-500">
          <Loader2 className="w-16 h-16 text-teal-400 animate-spin" />
          <h3 className="text-3xl font-black uppercase text-white">Race Completed!</h3>
          <p className="text-sm font-medium text-muted-foreground max-w-sm">
            You solved all 10 math challenges. Waiting for other competitors to cross the finish line...
          </p>
          
          {/* Live Standings panel */}
          <div className="w-full max-w-md pt-4">{renderLiveScoreboard()}</div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 md:gap-8 items-stretch">
        {/* Main calculation card */}
        <div className="flex-1 flex flex-col items-center gap-4 md:gap-8">
          <div className="w-full space-y-2">
            <div className="flex justify-between font-black uppercase text-xs tracking-widest text-muted-foreground">
              <span>Syncing calculations</span>
              <span>{timeLeft}s</span>
            </div>
            <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-3" />
          </div>

          <div className={cn(
            "font-black text-center tabular-nums transition-all my-2 md:my-4",
            isFullscreen ? "text-[15vw] md:text-[12vw] leading-none" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
          )}>
            {activeProblem.question}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
            {activeProblem.options.map((opt: number) => {
              const hasAnswered = localAnswered;
              return (
                <Button
                  key={opt}
                  variant={hasAnswered ? (opt === activeProblem.answer ? 'secondary' : 'destructive') : 'outline'}
                  onClick={() => handleAnswer(opt)}
                  className={cn(
                    "h-14 sm:h-16 md:h-20 text-xl sm:text-2xl md:text-3xl font-black rounded-2xl transition-all border-4 shadow-md",
                    hasAnswered && opt === activeProblem.answer && "bg-green-500 text-white border-green-400 scale-105",
                    isFullscreen && "h-16 sm:h-20 md:h-28 text-2xl sm:text-3xl md:text-5xl"
                  )}
                  disabled={hasAnswered}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Live Scoreboard Side panel */}
        <div className="w-full md:w-64 bg-slate-900/30 border border-border/20 p-4 md:p-5 rounded-3xl shrink-0 flex flex-col md:justify-between gap-4 md:gap-0 mt-4 md:mt-0">
          <div>
            <h4 className="text-xs font-black uppercase text-teal-400 tracking-wider mb-2 md:mb-4 flex items-center gap-1.5 border-b border-border/20 pb-2">
              <Users className="w-4 h-4 text-teal-400" />
              Live Standings
            </h4>
            <div className="space-y-3">{renderLiveScoreboard()}</div>
          </div>
          <div className="pt-4 border-t border-border/20 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Battle Round {round}/{roomData?.questions?.length || 10}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderMultiFinished = () => {
    const sorted = [...roomPlayers].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    return (
      <div className="text-center flex flex-col items-center gap-6 animate-in zoom-in duration-500 max-w-lg w-full">
        <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" />
        <h2 className="text-4xl font-black uppercase text-white">Battle Finished</h2>
        
        {winner && (
          <div className="p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/15 border border-yellow-500/30 rounded-3xl w-full text-center">
            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-yellow-500" /> Arithmetic Champion
            </p>
            <p className="text-2xl font-black text-white">{winner.name}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">Winning Score: {winner.score} points</p>
          </div>
        )}

        <div className="w-full space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left">Final Standings</p>
          <div className="divide-y divide-border/20 border border-border/20 rounded-2xl overflow-hidden bg-slate-950/20">
            {sorted.map((player, idx) => (
              <div key={player.uid} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black font-mono text-muted-foreground">#{idx + 1}</span>
                  <span className="font-bold text-white text-sm">{player.name}</span>
                  {player.uid === myUid && <span className="text-[10px] font-bold text-teal-400">(You)</span>}
                </div>
                <div className="font-mono text-sm font-black text-teal-400">{player.score} pts</div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleLeaveRoom}
          className="h-16 px-12 text-lg font-black rounded-3xl uppercase bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 mt-4 cursor-pointer"
        >
          Return to Lobby
        </Button>
      </div>
    );
  };

  if (!game) return null;

  return (
    <Card className={cn(
        "w-full transition-all duration-500 flex flex-col",
        isFullscreen ? "min-h-screen rounded-none border-none max-w-none bg-background justify-center" : "max-w-3xl mx-auto bg-card shadow-xl"
      )}>
      <CardHeader className="text-center relative px-4 sm:px-10">
        <Button variant="ghost" size="sm" className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]" onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
        </Button>
        {!isFullscreen && <Calculator className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-2" />}
        <CardTitle className={cn("font-black uppercase tracking-tight px-12 sm:px-0", isFullscreen ? "text-2xl sm:text-4xl md:text-6xl" : "text-xl sm:text-2xl md:text-3xl")}>{game.title}</CardTitle>
        {(gameMode === 'single' && gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_category' && gameState !== 'selecting_difficulty') && (
            <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="uppercase">{operation}</Badge>
                <Badge variant="outline" className="uppercase">{difficulty}</Badge>
                <Badge variant="outline">Round {round}/10</Badge>
            </div>
        )}
        {(gameMode === 'multi' && multiplayerState === 'playing') && (
            <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="uppercase">{operation}</Badge>
                <Badge variant="outline" className="uppercase">{difficulty}</Badge>
                <Badge variant="outline">Round {round}/{roomData?.questions?.length || 10}</Badge>
            </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex flex-col items-center justify-center p-6", isFullscreen ? "min-h-[60vh]" : "min-h-[350px]")}>
        {gameMode === 'multi' ? (
          <>
            {isEditingQuestions ? (
              renderCustomQuestionsEditor()
            ) : (
              <>
                {multiplayerState === 'mode_select' && renderMultiModeSelect()}
                {multiplayerState === 'join_room' && renderMultiJoinRoom()}
                {multiplayerState === 'lobby' && renderMultiLobby()}
                {multiplayerState === 'playing' && renderMultiPlaying()}
                {multiplayerState === 'finished' && renderMultiFinished()}
              </>
            )}
          </>
        ) : (
          <>
            {gameState === "idle" && (
              <div className="flex flex-col items-center gap-4">
                <p className={cn("text-muted-foreground", isFullscreen ? "text-3xl" : "text-base")}>Ready to crunch some numbers?</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
                  <Button 
                    onClick={() => {
                      setGameMode('single');
                      setGameState('instructions');
                    }} 
                    size={isFullscreen ? "lg" : "default"} 
                    className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-xl", isFullscreen && "h-20 px-10 text-2xl rounded-3xl")}
                  >
                    <Sparkles className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Single Player
                  </Button>
                  <Button 
                    onClick={() => {
                      setGameMode('multi');
                      setMultiplayerState('mode_select');
                    }} 
                    size={isFullscreen ? "lg" : "default"} 
                    variant="outline"
                    className={cn("font-black shadow-xl border-2 hover:bg-slate-800/40", isFullscreen && "h-20 px-10 text-2xl rounded-3xl")}
                  >
                    <Users className={cn("mr-3", isFullscreen ? "h-10 w-10" : "h-5 w-5")} />
                    Multiplayer Battle
                  </Button>
                </div>
              </div>
            )}

            {gameState === "instructions" && (
                 <div className={cn(
                     "flex flex-col items-center justify-center gap-4 text-center bg-muted/50 rounded-lg mx-auto border border-border/20 shadow-inner",
                     isFullscreen ? "p-16 max-w-5xl" : "p-8 max-w-lg"
                 )}>
                    <h3 className={cn("font-black uppercase tracking-widest text-center mb-4", isFullscreen ? "text-4xl" : "text-xl")}>How to Play</h3>
                    <div className={cn("text-left space-y-4", isFullscreen ? "text-2xl" : "text-base")}>
                        <p>1. Select a math category to focus your practice.</p>
                        <p>2. Mental math problems will appear on the screen.</p>
                        <p>3. Choose the correct answer from the options provided.</p>
                        <p>4. Work quickly! You have a limited time for each calculation.</p>
                    </div>
                    <Button onClick={() => setGameState('selecting_category')} size="lg" className={cn("mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black", isFullscreen && "h-20 px-16 text-3xl rounded-3xl shadow-xl")}>Proceed</Button>
                </div>
            )}

            {gameState === "selecting_category" && (
                <div className={cn("flex flex-col gap-6 w-full items-center", isFullscreen ? "max-w-5xl" : "max-w-2xl")}>
                    <p className={cn("text-center text-muted-foreground uppercase font-black tracking-widest", isFullscreen ? "text-3xl" : "text-sm")}>Select Operation:</p>
                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 w-full", isFullscreen && "grid-cols-2 gap-8")}>
                        {CATEGORIES.map((cat, idx) => (
                            <Button 
                                key={cat.label} 
                                onClick={() => handleSelectCategory(cat.label)} 
                                className={cn(
                                    "h-20 text-xl font-black uppercase tracking-widest border-4 shadow-lg transition-transform hover:scale-105",
                                    cat.color,
                                    isFullscreen && "h-32 text-4xl rounded-3xl",
                                    idx === 4 && "sm:col-span-2"
                                )}
                            >
                                <cat.icon className={cn("mr-3 shrink-0", isFullscreen ? "h-10 w-10" : "h-6 w-6")} />
                                <span className="truncate">{cat.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === "selecting_difficulty" && (
              <div className="flex flex-col gap-6 w-full max-w-sm">
                <p className={cn("text-center text-muted-foreground uppercase font-black tracking-widest", isFullscreen ? "text-2xl" : "text-sm")}>Choose Challenge Level:</p>
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} className={cn("h-16 text-xl font-bold uppercase tracking-widest", isFullscreen && "h-24 text-3xl rounded-2xl")}>
                    {level}
                  </Button>
                ))}
                <Button variant="ghost" onClick={() => setGameState('selecting_category')} className="uppercase font-bold opacity-50">Back to Operations</Button>
              </div>
            )}

            {(gameState === "playing" || gameState === "answered") && problem && (
              <div className="w-full max-w-4xl flex flex-col items-center gap-4 sm:gap-8 md:gap-12">
                <div className="w-full space-y-2">
                    <div className="flex justify-between font-black uppercase text-xs tracking-widest text-muted-foreground">
                        <span>Time Sync</span>
                        <span>{timeLeft}s</span>
                    </div>
                    <Progress value={(timeLeft / TIMER_LIMIT) * 100} className="h-3" />
                </div>

                <div className={cn(
                    "font-black text-center tabular-nums transition-all my-2 sm:my-4",
                    isFullscreen ? "text-[15vw] leading-none" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                )}>
                    {problem.question}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-6 w-full">
                    {problem.options.map(opt => (
                        <Button
                            key={opt}
                            variant={gameState === 'answered' ? (opt === problem.answer ? 'secondary' : 'destructive') : 'outline'}
                            onClick={() => handleAnswer(opt)}
                            className={cn(
                                "h-14 sm:h-16 md:h-24 text-xl sm:text-2xl md:text-4xl font-black rounded-3xl transition-all border-4 shadow-lg",
                                gameState === 'answered' && opt === problem.answer && "bg-green-500 text-white border-green-400 scale-105",
                                isFullscreen && "h-16 sm:h-20 md:h-32 text-2xl sm:text-3xl md:text-6xl"
                            )}
                            disabled={gameState === 'answered'}
                        >
                            {opt}
                        </Button>
                    ))}
                </div>
              </div>
            )}

            {gameState === "finished" && (
                <div className="text-center flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                    <Trophy className="w-32 h-32 text-yellow-400 animate-bounce" />
                    <h2 className="text-6xl font-black uppercase">Mission Complete</h2>
                    <div className="p-8 bg-muted/20 rounded-3xl border-4 border-primary">
                        <p className="text-sm font-bold text-muted-foreground uppercase mb-2">Final Score</p>
                        <p className="text-7xl font-black text-primary">{score}</p>
                    </div>
                    <Button onClick={() => setGameState('idle')} size="lg" className={cn("h-20 px-12 text-2xl font-black rounded-3xl uppercase shadow-xl")}><Repeat className="mr-3"/> Restart System</Button>
                </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" asChild><Link href="/games">Abort Mission</Link></Button>
        {gameMode === 'single' ? (
          (gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_category' && gameState !== 'selecting_difficulty') && <p className="font-black text-primary">SCORE: {score}</p>
        ) : (
          (multiplayerState === 'playing' || multiplayerState === 'finished') && <p className="font-black text-primary">SCORE: {score}</p>
        )}
      </CardFooter>
    </Card>
  );
}
