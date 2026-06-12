"use client";

import { shuffleArray } from "@/lib/shuffle";
import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { 
  Search, 
  Glasses, 
  CheckCircle2, 
  Fingerprint, 
  FileSearch, 
  HelpCircle, 
  RefreshCw,
  Users,
  Copy,
  ArrowLeft,
  Crown,
  Plus,
  Trash2,
  Settings,
  Loader2,
  Trophy
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";
import confetti from "canvas-confetti";

type Difficulty = "easy" | "intermediate" | "pro";

interface CustomQuestion {
  type: string;
  dataStr: string;
  answer: string;
  options: string[];
}

const calculateCustomAnswer = (type: string, numsStr: string) => {
  const data = numsStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
  if (data.length === 0) return { answer: '0', options: ['0', '1', '2', '3'] };

  let answer = 0;
  if (type === "Mean") {
    const sum = data.reduce((a, b) => a + b, 0);
    answer = Math.round(sum / data.length);
  } else if (type === "Median") {
    const sorted = [...data].sort((a,b) => a-b);
    if (sorted.length % 2 === 0) {
      answer = Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);
    } else {
      answer = sorted[Math.floor(sorted.length / 2)];
    }
  } else if (type === "Mode") {
    const counts: Record<number, number> = {};
    data.forEach(x => counts[x] = (counts[x] || 0) + 1);
    let maxCount = 0;
    let mode = data[0];
    for (const val in counts) {
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        mode = Number(val);
      }
    }
    answer = mode;
  } else if (type === "Range") {
    const min = Math.min(...data);
    const max = Math.max(...data);
    answer = max - min;
  }

  const wrongPool = new Set<number>();
  while (wrongPool.size < 3) {
    const w = answer + (Math.floor(Math.random() * 10) - 5);
    if (w !== answer && w > 0) wrongPool.add(w);
  }

  const options = shuffleArray([String(answer), ...Array.from(wrongPool).map(String)]);
  return { answer: String(answer), options };
};

export function DataDetective({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  // Main mode selector
  const [gameMode, setGameMode] = React.useState<'single' | 'multi'>('single');

  // Single player states
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "showing_result" | "finished">("idle");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = React.useState<{type: string, data: number[], a: string, options: string[]} | null>(null);
  const [score, setScore] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(20);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [resultStatus, setResultStatus] = React.useState<"correct" | "incorrect" | "timeout">("correct");

  // Multiplayer states
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
  const [roundsCount, setRoundsCount] = React.useState(10);
  const [isEditingQuestions, setIsEditingQuestions] = React.useState(false);
  const [customQuestions, setCustomQuestions] = React.useState<CustomQuestion[]>([
    { type: "Mean", dataStr: "5, 10, 15, 20, 25", answer: "15", options: ["15", "10", "20", "12"] }
  ]);

  const isCreator = React.useMemo(() => {
    if (gameMode !== 'multi') return false;
    const currentUid = user?.uid || myUid;
    return roomData && roomData.hostId && currentUid ? roomData.hostId === currentUid : isHost;
  }, [gameMode, roomData, user, myUid, isHost]);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Session Recovery
  React.useEffect(() => {
    if (typeof window === 'undefined' || !firestore) return;
    
    const savedRoom = localStorage.getItem("lingoland_active_roomCode_data-detective");
    const savedUid = localStorage.getItem("lingoland_active_myUid_data-detective");
    const savedMode = localStorage.getItem("lingoland_active_gameMode_data-detective");
    
    if (savedRoom && savedUid && savedMode === 'multi') {
      const roomRef = doc(firestore, "stats", "dd_room_" + savedRoom);
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
        localStorage.removeItem("lingoland_active_roomCode_data-detective");
        localStorage.removeItem("lingoland_active_myUid_data-detective");
        localStorage.removeItem("lingoland_active_gameMode_data-detective");
      }).catch((err) => {
        console.warn("Session recovery failed:", err);
      });
    }
  }, [firestore]);

  // Sync nickname
  React.useEffect(() => {
    if (user?.displayName) {
      setNickname(user.displayName);
    } else {
      setNickname(`Detective_${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [user]);

  // Sync Room Updates in Lobby and Play (Multiplayer)
  React.useEffect(() => {
    if (!firestore || !roomCode || gameMode !== 'multi') return;
    
    // Using stats collection with room prefix to bypass rules limitations
    const roomRef = doc(firestore, "stats", "dd_room_" + roomCode);
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
      
      if (data.difficulty) setDifficulty(data.difficulty as Difficulty);
      if (data.roundsCount) setRoundsCount(data.roundsCount);
      if (data.questionMode) setQuestionMode(data.questionMode);
      if (data.customQuestions && !isEditingQuestions) {
        setCustomQuestions(data.customQuestions);
      }
      
      const currentUid = user?.uid || myUid;
      if (currentUid && data.hostId) {
        setIsHost(data.hostId === currentUid);
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
        setRound(1);
        setTimeLeft(getTimerLimit());
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
        const roomRef = doc(firestore, "stats", "dd_room_" + roomCode);
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

  const generateData = (diff: Difficulty) => {
    const types = ["Mean", "Median", "Mode", "Range"];
    const t = types[Math.floor(Math.random() * types.length)];
    let data: number[] = [];
    let answer = 0;
    
    let count = 5;
    let rangeTop = 10;
    if (diff === "intermediate") { count = 7; rangeTop = 30; }
    if (diff === "pro") { count = 9; rangeTop = 100; }

    for(let i=0; i<count; i++) {
        data.push(Math.floor(Math.random() * rangeTop) + 1);
    }

    if (t === "Mean") {
        if (diff === "easy") data = [2, 4, 6, 8, 10];
        const sum = data.reduce((a, b) => a + b, 0);
        answer = Math.round(sum / data.length);
    } else if (t === "Median") {
        const sorted = [...data].sort((a,b) => a-b);
        if (sorted.length % 2 === 0) {
            answer = Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);
        } else {
            answer = sorted[Math.floor(sorted.length / 2)];
        }
    } else if (t === "Mode") {
        if (diff === "easy") {
            data = [data[0], data[0], ...data.slice(2)];
        }
        const counts: Record<number, number> = {};
        data.forEach(x => counts[x] = (counts[x] || 0) + 1);
        let maxCount = 0;
        let mode = data[0];
        for(const val in counts) {
            if (counts[val] > maxCount) {
                maxCount = counts[val];
                mode = Number(val);
            }
        }
        answer = mode;
    } else if (t === "Range") {
        const min = Math.min(...data);
        const max = Math.max(...data);
        answer = max - min;
    }

    const wrongPool = new Set<number>();
    while(wrongPool.size < 3) {
        const w = answer + (Math.floor(Math.random() * 10) - 5);
        if (w !== answer && w > 0) wrongPool.add(w);
    }

    return { 
        type: t, 
        data, 
        a: String(answer), 
        options: shuffleArray([String(answer), ...Array.from(wrongPool).map(String)]) 
    };
  };

  const getTimerLimit = () => {
    if (difficulty === "easy") return 25;
    if (difficulty === "intermediate") return 20;
    return 15;
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setRound(1);
    setScore(0);
    setGameState("playing");
    setCurrentProblem(generateData(diff));
    setTimeLeft(getTimerLimit());
  };

  const nextRound = () => {
    const totalRounds = gameMode === 'multi' ? roundsCount : 10;
    if (round >= totalRounds) {
      setGameState("finished");
      return;
    }
    setCurrentProblem(generateData(difficulty));
    setRound(r => r + 1);
    setTimeLeft(getTimerLimit());
    setGameState("playing");
  };

  const activeProblem = React.useMemo(() => {
    if (gameMode === 'multi') {
      return (roomData?.questions?.[round - 1]) || null;
    } else {
      return currentProblem;
    }
  }, [gameMode, round, roomData, currentProblem]);

  const handleChoice = async (ans: string | null) => {
    if (gameMode === 'single' && gameState !== "playing") return;
    if (gameMode === 'multi' && (multiplayerState !== "playing" || localAnswered)) return;
    if (!activeProblem) return;

    const correct = ans === activeProblem.a;
    setResultStatus(correct ? "correct" : ans === null ? "timeout" : "incorrect");
    
    let addedPoints = 0;
    if (correct) {
      const diffMultiplier = difficulty === "easy" ? 1 : difficulty === "intermediate" ? 1.5 : 2;
      addedPoints = Math.floor((100 + Math.floor(timeLeft * 5)) * diffMultiplier);
    }

    const newScore = score + addedPoints;
    setScore(newScore);

    if (gameMode === 'single') {
      setGameState("showing_result");
    } else {
      // Multiplayer answer reporting
      setLocalAnswered(true);
      setResultStatus(correct ? "correct" : ans === null ? "timeout" : "incorrect");

      if (firestore && roomCode) {
        try {
          const roomRef = doc(firestore, "stats", "dd_room_" + roomCode);
          await updateDoc(roomRef, {
            [`players.${myUid}.score`]: newScore,
            [`players.${myUid}.solvedCount`]: round
          });
        } catch (e) {
          console.error("Failed to update multiplayer score:", e);
        }
      }

      setTimeout(async () => {
        setLocalAnswered(false);
        const totalRounds = roundsCount;
        if (round < totalRounds) {
          setRound(r => r + 1);
          setTimeLeft(getTimerLimit());
        } else {
          // Finalize locally
          if (firestore && roomCode) {
            try {
              const roomRef = doc(firestore, "stats", "dd_room_" + roomCode);
              await updateDoc(roomRef, {
                [`players.${myUid}.finished`]: true
              });
            } catch (e) {
              console.error("Error setting finished flag:", e);
            }
          }
        }
      }, 2000);
    }
  };

  // Timer runner
  React.useEffect(() => {
    const isPlaying = gameMode === 'multi'
      ? (multiplayerState === 'playing' && !localAnswered && !roomData?.players?.[myUid]?.finished)
      : (gameState === "playing");

    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(p => p - 0.1), 100);
    } else if (isPlaying && timeLeft <= 0) {
      handleChoice(null);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, multiplayerState, timeLeft, gameMode, localAnswered, roomData, myUid]);

  // Multiplayer actions
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
      const roomRef = doc(firestore, "stats", "dd_room_" + code);
      await setDoc(roomRef, {
        code,
        hostId: hostUid,
        hostName: nickname,
        difficulty: "easy",
        roundsCount: 10,
        questionMode: "auto",
        status: 'lobby',
        players: initialPlayers,
        questions: [],
        customQuestions: customQuestions,
        createdAt: Date.now()
      });

      setRoomCode(code);
      setIsHost(true);
      setMultiplayerState('lobby');
      localStorage.setItem("lingoland_active_roomCode_data-detective", code);
      localStorage.setItem("lingoland_active_myUid_data-detective", hostUid);
      localStorage.setItem("lingoland_active_gameMode_data-detective", 'multi');
      toast({
        title: "Room Created! 🚪🔑",
        description: `Your code is ${code}. Share it with friends.`,
      });
    } catch (e) {
      console.error("Failed to create room:", e);
      toast({
        title: "Database Error",
        description: "Could not initialize room on server.",
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
      const roomRef = doc(firestore, "stats", "dd_room_" + cleanCode);
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
          description: "This room is playing or has already finished.",
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
      localStorage.setItem("lingoland_active_roomCode_data-detective", cleanCode);
      localStorage.setItem("lingoland_active_myUid_data-detective", playerUid);
      localStorage.setItem("lingoland_active_gameMode_data-detective", 'multi');
      toast({
        title: "Connected! 🤝",
        description: `Joined room ${cleanCode}. Waiting for host to start.`,
      });
    } catch (e) {
      console.error("Failed to join room:", e);
      toast({
        title: "Connection Failed",
        description: "Could not connect to room.",
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
      const roomRef = doc(firestore, "stats", "dd_room_" + roomCode);
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
    localStorage.removeItem("lingoland_active_roomCode_data-detective");
    localStorage.removeItem("lingoland_active_myUid_data-detective");
    localStorage.removeItem("lingoland_active_gameMode_data-detective");
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
    setQuestionMode('auto');
    setRoundsCount(10);
    setIsEditingQuestions(false);
    setMultiplayerState('mode_select');
    setGameState('idle');
    setGameMode('single');
  };

  const handleUpdateLobbySettings = async (selectedDiff: Difficulty, mode: 'auto' | 'custom', count: number) => {
    if (!firestore || !roomCode || !isCreator) return;
    try {
      const roomRef = doc(firestore, "stats", "dd_room_" + roomCode);
      await updateDoc(roomRef, {
        difficulty: selectedDiff,
        questionMode: mode,
        roundsCount: count
      });
    } catch (e) {
      console.error("Failed to update settings:", e);
    }
  };

  const handleSaveCustomQuestions = async (updatedList: CustomQuestion[]) => {
    if (!firestore || !roomCode || !isCreator) return;
    try {
      const roomRef = doc(firestore, "stats", "dd_room_" + roomCode);
      await updateDoc(roomRef, {
        customQuestions: updatedList,
        roundsCount: updatedList.length
      });
      setCustomQuestions(updatedList);
      setRoundsCount(updatedList.length);
      toast({
        title: "Case File Saved 📁",
        description: "Custom questions database updated.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error Saving",
        description: "Could not update questions on server.",
        variant: "destructive"
      });
    }
  };

  const handleStartMultiplayerGame = async () => {
    if (!firestore || !roomCode || !isCreator) return;
    if (roomPlayers.length < 1) {
      toast({
        title: "Waiting for Competitors 👥",
        description: "Need at least 1 player in the lobby to start.",
        variant: "destructive"
      });
      return;
    }

    try {
      let questionsList: any[] = [];
      if (questionMode === 'custom') {
        const rawList = roomData?.customQuestions || [];
        if (rawList.length === 0) {
          toast({
            title: "No Questions",
            description: "Please add custom questions first.",
            variant: "destructive"
          });
          return;
        }
        questionsList = rawList.map((cq: any) => {
          const parsedData = cq.dataStr.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
          const calc = calculateCustomAnswer(cq.type, cq.dataStr);
          return {
            type: cq.type,
            data: parsedData,
            a: cq.answer || calc.answer,
            options: cq.options || calc.options
          };
        });
      } else {
        for (let i = 0; i < roundsCount; i++) {
          questionsList.push(generateData(difficulty));
        }
      }

      const roomRef = doc(firestore, "stats", "dd_room_" + roomCode);
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
      console.error("Start battle failed:", e);
      toast({
        title: "Launch Failed",
        description: "Error launching the race. Try again.",
        variant: "destructive"
      });
    }
  };

  const renderMultiModeSelect = () => (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md bg-white/40 p-4 sm:p-8 rounded-3xl border border-[#8b8273]/40 shadow-lg">
      <Users className="w-12 h-12 sm:w-16 sm:h-16 text-[#5c5448] mx-auto" />
      <h3 className="text-2xl sm:text-3xl font-black uppercase text-center font-serif tracking-widest text-[#2c2a27]">Case Room</h3>
      
      <div className="w-full space-y-2 text-left">
        <label className="text-[10px] font-black uppercase tracking-wider text-[#5c5448]">Detective Alias</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter alias"
          className="w-full h-11 sm:h-12 px-4 rounded-xl border border-[#8b8273] bg-[#e4dfd5]/40 text-[#2c2a27] font-bold text-sm sm:text-base"
          maxLength={15}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full pt-2 sm:pt-4">
        <Button 
          onClick={handleCreateRoom}
          className="h-12 sm:h-14 text-xs sm:text-sm font-black uppercase tracking-widest bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] font-serif shadow-lg border border-[#8b8273]"
        >
          Create Room File
        </Button>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={codeVal}
            onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
            placeholder="INVITE CODE"
            className="flex-1 h-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black tracking-widest uppercase rounded-xl border border-[#8b8273] bg-[#e4dfd5]/60 text-[#2c2a27]"
            maxLength={5}
          />
          <Button 
            onClick={() => handleJoinRoom(codeVal)}
            className="h-12 sm:h-14 px-4 sm:px-6 text-xs sm:text-sm font-black uppercase bg-[#8b8273] hover:bg-[#5c5448] text-white font-serif"
          >
            Join
          </Button>
        </div>
      </div>

      <Button variant="ghost" onClick={resetMultiplayerState} className="uppercase font-bold opacity-60 text-[#5c5448] hover:text-[#2c2a27] font-serif tracking-wider text-xs sm:text-sm">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Solo Mode
      </Button>
    </div>
  );

  const renderMultiJoinRoom = () => (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-md bg-white/40 p-4 sm:p-8 rounded-3xl border border-[#8b8273]/40 shadow-lg">
      <Users className="w-12 h-12 sm:w-16 sm:h-16 text-[#5c5448] mx-auto" />
      <h3 className="text-xl sm:text-2xl font-black uppercase text-center font-serif">Join Room</h3>
      
      <div className="w-full space-y-3 sm:space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#5c5448]">Detective Alias</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter alias"
            className="w-full h-11 sm:h-12 px-4 rounded-xl border border-[#8b8273] bg-[#e4dfd5]/40 text-[#2c2a27] font-bold text-sm sm:text-base"
            maxLength={15}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#5c5448]">Case Code</label>
          <input
            type="text"
            value={codeVal}
            onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
            placeholder="5-LETTER CODE"
            className="w-full h-12 sm:h-14 text-center text-xl font-mono font-black tracking-widest uppercase rounded-xl border border-[#8b8273] bg-[#e4dfd5]/60 text-[#2c2a27]"
            maxLength={5}
          />
        </div>
      </div>

      <div className="flex gap-3 w-full pt-2 sm:pt-4">
        <Button 
          variant="outline" 
          onClick={() => setMultiplayerState('mode_select')}
          className="flex-1 h-12 sm:h-14 text-xs font-black uppercase border-[#8b8273] text-[#5c5448] font-serif cursor-pointer"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => handleJoinRoom(codeVal)}
          className="flex-1 h-12 sm:h-14 text-xs font-black uppercase tracking-wider bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] font-serif cursor-pointer"
        >
          Join Room
        </Button>
      </div>
    </div>
  );

  const renderCustomQuestionsEditor = () => {
    const addQuestion = () => {
      setCustomQuestions([...customQuestions, { type: "Mean", dataStr: "10, 20, 30", answer: "20", options: ["20", "15", "25", "10"] }]);
    };

    const removeQuestion = (idx: number) => {
      if (customQuestions.length <= 1) return;
      setCustomQuestions(customQuestions.filter((_, i) => i !== idx));
    };

    const updateQuestionType = (idx: number, type: string) => {
      const updated = [...customQuestions];
      updated[idx].type = type;
      const calc = calculateCustomAnswer(type, updated[idx].dataStr);
      updated[idx].answer = calc.answer;
      updated[idx].options = calc.options;
      setCustomQuestions(updated);
    };

    const updateQuestionData = (idx: number, dataStr: string) => {
      const updated = [...customQuestions];
      updated[idx].dataStr = dataStr;
      const calc = calculateCustomAnswer(updated[idx].type, dataStr);
      updated[idx].answer = calc.answer;
      updated[idx].options = calc.options;
      setCustomQuestions(updated);
    };

    return (
      <div className="w-full max-w-2xl bg-white p-4 sm:p-6 rounded-3xl border-2 sm:border-4 border-[#2c2a27] space-y-4 max-h-[500px] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-sm sm:text-lg font-black uppercase font-serif text-[#2c2a27] flex items-center gap-1.5">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> Customize Case File
          </h3>
          <Button 
            size="sm" 
            onClick={addQuestion} 
            className="bg-[#2c2a27] hover:bg-[#4a4740] text-white text-[10px] sm:text-xs font-bold font-serif px-2 sm:px-3 h-8 sm:h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Round
          </Button>
        </div>

        <div className="space-y-4">
          {customQuestions.map((cq, idx) => (
            <div key={idx} className="p-3 sm:p-4 bg-[#e4dfd5]/40 border border-[#8b8273] rounded-2xl relative space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black font-serif text-[#2c2a27]">Round {idx + 1}</span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => removeQuestion(idx)}
                  disabled={customQuestions.length <= 1}
                  className="text-red-700 hover:text-red-950 w-8 h-8 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#5c5448]">Operation Type</label>
                  <select
                    value={cq.type}
                    onChange={(e) => updateQuestionType(idx, e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-[#8b8273] bg-white text-sm font-serif"
                  >
                    {["Mean", "Median", "Mode", "Range"].map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#5c5448]">Data Set (Comma Separated)</label>
                  <input
                    type="text"
                    value={cq.dataStr}
                    onChange={(e) => updateQuestionData(idx, e.target.value)}
                    placeholder="e.g. 5, 10, 15, 20"
                    className="w-full h-10 px-3 rounded-xl border border-[#8b8273] bg-white text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-serif text-[#5c5448]">
                <span>Computed Answer:</span>
                <span className="font-bold font-mono text-[#2c2a27] bg-[#e4dfd5] px-2 py-0.5 rounded border border-[#8b8273]/30">
                  {cq.answer}
                </span>
                <span className="text-[10px] opacity-75">(Distractors generated automatically)</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setIsEditingQuestions(false)}
            className="flex-1 h-10 sm:h-12 text-xs font-black uppercase border-[#8b8273] text-[#5c5448] font-serif"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              handleSaveCustomQuestions(customQuestions);
              setIsEditingQuestions(false);
            }}
            className="flex-1 h-10 sm:h-12 text-xs font-black uppercase bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] font-serif"
          >
            Apply & Save
          </Button>
        </div>
      </div>
    );
  };

  const renderMultiLobby = () => {
    if (isEditingQuestions) {
      return renderCustomQuestionsEditor();
    }

    const sortedPlayers = [...roomPlayers].sort((a, b) => (a.isHost ? -1 : b.isHost ? 1 : 0));

    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl bg-white/40 p-4 sm:p-6 rounded-3xl border border-[#8b8273]/30 shadow-lg text-left">
        <div className="text-center p-4 sm:p-6 bg-[#e4dfd5]/65 border border-[#8b8273]/40 rounded-3xl relative overflow-hidden">
          <p className="text-[10px] font-black text-[#5c5448] uppercase tracking-widest mb-1">Case Invitation Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-5xl font-mono font-black tracking-wider text-[#2c2a27] select-all">{roomCode}</span>
            <Button
              size="icon"
              variant="ghost"
              className="hover:text-[#2c2a27] cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                toast({ title: "Code Copied! 📋", description: "Invitation code copied to clipboard." });
              }}
            >
              <Copy className="w-5 h-5 text-[#5c5448]" />
            </Button>
          </div>
          <p className="text-[10px] text-[#5c5448] uppercase font-black tracking-wider mt-3">
            Transmit this file key to up to 3 detectives.
          </p>
        </div>

        {/* Lobby Parameter Card */}
        <div className="p-4 sm:p-6 bg-white/60 border border-[#8b8273]/30 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-[#2c2a27] font-serif flex items-center gap-1.5">
              <Settings className="w-4 h-4" /> Parameters
            </h4>

            {isCreator && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={questionMode === 'auto' ? 'default' : 'outline'}
                  onClick={() => {
                    setQuestionMode('auto');
                    handleUpdateLobbySettings(difficulty, 'auto', roundsCount);
                  }}
                  className="text-[10px] font-bold font-serif"
                >
                  Auto
                </Button>
                <Button
                  size="sm"
                  variant={questionMode === 'custom' ? 'default' : 'outline'}
                  onClick={() => {
                    setQuestionMode('custom');
                    handleUpdateLobbySettings(difficulty, 'custom', customQuestions.length);
                  }}
                  className="text-[10px] font-bold font-serif"
                >
                  Custom
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left side settings */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[#5c5448] tracking-wider">Difficulty Level</label>
              {isCreator && questionMode === 'auto' ? (
                <div className="flex gap-1 sm:gap-1.5">
                  {['easy', 'intermediate', 'pro'].map((lvl) => (
                    <Button
                      key={lvl}
                      size="sm"
                      variant={difficulty === lvl ? 'default' : 'outline'}
                      onClick={() => {
                        setDifficulty(lvl as Difficulty);
                        handleUpdateLobbySettings(lvl as Difficulty, questionMode, roundsCount);
                      }}
                      className="text-xs font-bold uppercase flex-1 font-serif px-1.5 sm:px-3"
                    >
                      {lvl === 'easy' ? 'Easy' : lvl === 'intermediate' ? (<span><span className="hidden sm:inline">Medium</span><span className="inline sm:hidden">Med</span></span>) : 'Pro'}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="h-10 flex items-center px-3 rounded-xl bg-[#e4dfd5]/40 border border-[#8b8273]/30">
                  <Badge variant="outline" className="uppercase font-serif border-[#8b8273] text-[#5c5448]">
                    {questionMode === 'custom' ? 'Custom Dataset' : difficulty}
                  </Badge>
                </div>
              )}
            </div>

            {/* Right side settings */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-[10px] font-black uppercase text-[#5c5448] tracking-wider">Rounds count</label>
              {isCreator ? (
                questionMode === 'custom' ? (
                  <Button 
                    onClick={() => setIsEditingQuestions(true)}
                    className="h-10 text-xs font-black uppercase tracking-wider bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] font-serif"
                  >
                    Edit Custom Cases ({customQuestions.length})
                  </Button>
                ) : (
                  <div className="flex gap-1.5">
                    {[5, 10, 15].map((cnt) => (
                      <Button
                        key={cnt}
                        size="sm"
                        variant={roundsCount === cnt ? 'default' : 'outline'}
                        onClick={() => {
                          setRoundsCount(cnt);
                          handleUpdateLobbySettings(difficulty, questionMode, cnt);
                        }}
                        className="text-xs font-bold uppercase flex-1 font-serif px-1 sm:px-3"
                      >
                        {cnt}<span className="hidden sm:inline"> Rounds</span><span className="inline sm:hidden"> R</span>
                      </Button>
                    ))}
                  </div>
                )
              ) : (
                <div className="h-10 flex items-center px-3 rounded-xl bg-[#e4dfd5]/40 border border-[#8b8273]/30">
                  <span className="text-xs font-bold text-[#2c2a27] font-serif">
                    {roundsCount} Rounds
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Players list */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#5c5448] font-serif">
            <span>Active Agents ({sortedPlayers.length}/4)</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-[#8b8273]/20 border border-[#8b8273]/20 rounded-2xl overflow-hidden bg-white/40">
            {sortedPlayers.map((player) => (
              <div key={player.uid} className="flex justify-between items-center p-4">
                <div className="flex items-center gap-2">
                  {player.isHost ? (
                    <Crown className="w-4 h-4 text-yellow-700 shrink-0" />
                  ) : (
                    <Users className="w-4 h-4 text-[#5c5448] shrink-0" />
                  )}
                  <span className="font-bold text-[#2c2a27] text-sm font-serif truncate max-w-[120px] sm:max-w-[200px]">{player.name}</span>
                  {player.uid === myUid && <span className="text-[10px] font-bold text-[#8b8273] shrink-0">(You)</span>}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#5c5448] font-serif">
                  {player.isHost ? (
                    <span className="text-yellow-700 font-black">Lead Detective</span>
                  ) : (
                    <span className="text-green-700">Reporting</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-[#8b8273]/20">
          <Button 
            variant="outline" 
            onClick={handleLeaveRoom}
            className="flex-1 h-14 text-xs font-black uppercase text-red-800 border-red-800/20 hover:bg-red-500/10 font-serif cursor-pointer"
          >
            {isCreator ? 'Disband Case' : 'Leave Room'}
          </Button>

          {isCreator && (
            <Button 
              onClick={handleStartMultiplayerGame}
              disabled={sortedPlayers.length < 1}
              className="flex-1 h-14 text-xs font-black uppercase tracking-wider bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] font-serif cursor-pointer shadow-lg border border-[#8b8273]"
            >
              Launch Investigation
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
          <div key={p.uid} className="flex justify-between items-center p-2.5 rounded-xl bg-white border border-[#8b8273]/30">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-black font-mono text-[#5c5448] shrink-0">#{idx + 1}</span>
              <span className="text-xs font-bold text-[#2c2a27] font-serif truncate max-w-[100px]">{p.name}</span>
              {p.uid === myUid && <span className="text-[9px] font-bold text-[#8b8273] shrink-0">(You)</span>}
            </div>
            <div className="flex items-center gap-2 font-mono text-xs shrink-0 text-[#2c2a27]">
              <span className="text-[#5c5448] text-[10px]">C{p.solvedCount}/{roundsCount}</span>
              <span className="font-black">{p.score}</span>
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
          <Loader2 className="w-12 h-12 text-[#5c5448] animate-spin" />
          <p className="text-xs font-bold text-[#5c5448] uppercase tracking-widest font-serif">Configuring Case File...</p>
        </div>
      );
    }

    const myPlayerData = roomData.players?.[myUid];
    const isFinishedLocally = myPlayerData?.finished;

    if (isFinishedLocally) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center animate-in fade-in duration-500">
          <Loader2 className="w-16 h-16 text-[#5c5448] animate-spin" />
          <h3 className="text-3xl font-black uppercase text-[#2c2a27] font-serif">Investigation Complete</h3>
          <p className="text-sm font-medium text-[#5c5448] max-w-sm font-serif">
            You processed all evidence files. Waiting for other detectives to finalize their analysis...
          </p>
          
          <div className="w-full max-w-md pt-4">{renderLiveScoreboard()}</div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 md:gap-8 items-stretch text-center">
        {/* Main math calculation view */}
        <div className="flex-1 flex flex-col items-center">
          <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="mb-3 sm:mb-8 bg-white/60 p-3 sm:p-8 rounded border border-[#8b8273] shadow-md transform -rotate-1 relative w-full">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-red-800/30 -rotate-3" />
            <p className="text-[#8b8273] font-bold uppercase tracking-[0.2em] text-xs sm:text-sm mb-2 sm:mb-4 font-serif">
              Find the <span className="text-[#2c2a27] font-black underline">{activeProblem.type}</span> of this set:
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-4 bg-[#e4dfd5] p-3 sm:p-6 border-2 border-dashed border-[#8b8273]">
              {activeProblem.data.map((n: number, i: number) => (
                <span key={i} className="text-lg sm:text-3xl font-black text-[#2c2a27] font-mono tracking-tighter">{n}</span>
              ))}
            </div>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
            {activeProblem.options.map((opt: string) => {
              const hasAnswered = localAnswered;
              const isCorrectOpt = opt === activeProblem.a;
              return (
                <Button
                  key={opt}
                  variant={hasAnswered ? (isCorrectOpt ? 'secondary' : 'destructive') : 'outline'}
                  onClick={() => handleChoice(opt)}
                  className={cn(
                    "w-full h-12 sm:h-20 text-lg sm:text-3xl font-black font-mono bg-white text-[#2c2a27] border-2 border-[#8b8273] transition-all rounded shadow-[2px_2px_0_0_#8b8273] sm:shadow-[4px_4px_0_0_#8b8273]",
                    hasAnswered && isCorrectOpt && "bg-green-700 text-white border-green-800 scale-105 shadow-none",
                    hasAnswered && !isCorrectOpt && "opacity-50"
                  )}
                  disabled={hasAnswered}
                >
                  {opt}
                </Button>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-8 w-full max-w-sm">
            <div className="flex justify-between text-xs font-black uppercase text-[#8b8273] mb-1 sm:mb-2 font-serif tracking-widest">
              <span>Investigation Clock</span>
              <span>{timeLeft.toFixed(1)}s</span>
            </div>
            <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-2 bg-[#cfc5b4] rounded-none border border-[#8b8273]">
              <div className="h-full bg-[#2c2a27] transition-all duration-100 ease-linear" />
            </Progress>
          </div>
        </div>

        {/* Standings Side bar */}
        <div className="w-full md:w-64 bg-white/40 border border-[#8b8273]/30 p-3 md:p-5 rounded-3xl shrink-0 flex flex-col md:justify-between gap-3 md:gap-0 mt-3 md:mt-0 text-left">
          <div>
            <h4 className="text-xs font-black uppercase text-[#2c2a27] tracking-wider mb-1.5 md:mb-4 flex items-center gap-1.5 border-b border-[#8b8273]/20 pb-2 font-serif">
              <Users className="w-4 h-4 text-[#5c5448]" />
              Agents Standings
            </h4>
            <div className="space-y-3">{renderLiveScoreboard()}</div>
          </div>
          <div className="pt-4 border-t border-[#8b8273]/20 text-center font-serif">
            <p className="text-[10px] font-bold text-[#5c5448] uppercase tracking-widest">
              Evidence File {round}/{roundsCount}
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
      <div className="text-center flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in duration-500 max-w-lg w-full bg-white p-4 sm:p-8 border-2 border-[#2c2a27] shadow-[8px_8px_0_0_#2c2a27]">
        <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-650 animate-bounce" />
        <h2 className="text-2xl sm:text-4xl font-black uppercase font-serif text-[#2c2a27]">Investigation Closed</h2>
        
        {winner && (
          <div className="p-4 sm:p-6 bg-[#e4dfd5] border border-[#8b8273] rounded-2xl w-full text-center relative">
            <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-1 flex items-center justify-center gap-1 font-serif">
              <Crown className="w-3.5 h-3.5 fill-yellow-600 stroke-none" /> Lead Investigator
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#2c2a27] font-serif">{winner.name}</p>
            <p className="text-xs text-[#5c5448] font-mono mt-1">Clues Discovered: {winner.score} points</p>
            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-red-800/30 font-serif text-base sm:text-xl border border-red-800/30 px-1 rounded uppercase tracking-wider select-none transform -rotate-12">Closed</div>
          </div>
        )}

        <div className="w-full space-y-2 text-left">
          <p className="text-xs font-bold text-[#5c5448] uppercase tracking-widest font-serif">Final Standings</p>
          <div className="divide-y divide-[#8b8273]/20 border border-[#8b8273]/20 rounded-xl overflow-hidden bg-[#e4dfd5]/25">
            {sorted.map((player, idx) => (
              <div key={player.uid} className="flex justify-between items-center p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black font-mono text-[#5c5448]">#{idx + 1}</span>
                  <span className="font-bold text-[#2c2a27] text-sm font-serif">{player.name}</span>
                  {player.uid === myUid && <span className="text-[10px] font-bold text-[#8b8273] shrink-0">(You)</span>}
                </div>
                <div className="font-mono text-sm font-black text-[#2c2a27]">{player.score} clues</div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleLeaveRoom}
          className="h-12 sm:h-14 px-12 text-sm font-black rounded-none uppercase bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] font-serif border border-[#8b8273] mt-2 sm:mt-4 cursor-pointer"
        >
          Return to Office
        </Button>
      </div>
    );
  };

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 bg-[#e4dfd5] text-[#2c2a27] flex flex-col relative border-4 sm:border-8 border-[#3c3831] overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-auto min-h-[600px] md:h-[700px]"
    )}>
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(60,56,49,0.3)_100%)] pointer-events-none z-0" />

      <CardHeader className="z-10 bg-[#cfc5b4]/80 backdrop-blur-sm relative border-b-2 border-[#8b8273] p-3 sm:p-6">
        <div className="flex justify-between items-center text-[#2c2a27]">
           <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" asChild className="text-[#5c5448] hover:text-[#2c2a27] w-8 h-8 sm:w-10 sm:h-10">
                  <Link href="/games"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></Link>
              </Button>
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-[#5c5448] hidden sm:block" />
              <div>
                <CardTitle className="text-sm sm:text-2xl font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] font-serif">Data Detective</CardTitle>
                {gameMode === 'single' ? (
                  (gameState !== 'idle') && <Badge variant="outline" className="border-[#8b8273] text-[#5c5448] mt-1 text-[8px] sm:text-xs uppercase font-bold tracking-widest bg-white/20 px-1 py-0 sm:px-2.5 sm:py-0.5">Case {round}/10</Badge>
                ) : (
                  (multiplayerState === 'playing' || multiplayerState === 'finished') && <Badge variant="outline" className="border-[#8b8273] text-[#5c5448] mt-1 text-[8px] sm:text-xs uppercase font-bold tracking-widest bg-white/20 px-1 py-0 sm:px-2.5 sm:py-0.5">Case {round}/{roundsCount}</Badge>
                )}
              </div>
           </div>
           <div className="flex items-center gap-2 sm:gap-6">
              <div className="text-right">
                 <p className="text-[8px] sm:text-[10px] uppercase text-[#5c5448] font-bold tracking-[0.1em] sm:tracking-[0.2em]">Evidence</p>
                 <p className="text-lg sm:text-2xl font-black font-serif tabular-nums">{score}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-[#5c5448] w-8 h-8 sm:w-10 sm:h-10" onClick={onToggleFullscreen}>
                 {isFullscreen ? <Glasses /> : <Search />}
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto min-h-0 w-full flex flex-col z-10 relative p-4 sm:p-6 items-center justify-start md:justify-center">
         <AnimatePresence mode="wait">
            {gameMode === 'multi' ? (
              <>
                {multiplayerState === 'mode_select' && renderMultiModeSelect()}
                {multiplayerState === 'join_room' && renderMultiJoinRoom()}
                {multiplayerState === 'lobby' && renderMultiLobby()}
                {multiplayerState === 'playing' && renderMultiPlaying()}
                {multiplayerState === 'finished' && renderMultiFinished()}
              </>
            ) : (
              <>
                {gameState === "idle" && (
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, y:20}} className="text-center w-full max-w-md">
                        <Fingerprint className="w-20 h-20 sm:w-32 sm:h-32 text-[#5c5448] mx-auto mb-4 sm:mb-8 drop-shadow-md opacity-80" />
                        <h2 className="text-2xl sm:text-5xl font-black uppercase mb-2 sm:mb-4 font-serif tracking-widest text-[#2c2a27]">Solve The Case</h2>
                        <p className="text-[#5c5448] text-xs sm:text-base mb-6 sm:mb-10 mx-auto lowercase font-serif">Choose single player mission or multiplayer battle room.</p>
                        <div className="flex flex-col gap-4">
                            <Button 
                              onClick={() => {
                                setGameMode('single');
                                setGameState('idle');
                                startGame("easy");
                              }} 
                              className="h-12 sm:h-16 px-6 sm:px-12 text-sm sm:text-xl font-bold bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] border-2 border-transparent font-serif uppercase tracking-[0.2em] transition-all"
                            >
                              Solo Investigation
                            </Button>
                            <Button 
                              onClick={() => {
                                setGameMode('multi');
                                setMultiplayerState('mode_select');
                              }} 
                              className="h-12 sm:h-16 px-6 sm:px-12 text-sm sm:text-xl font-bold bg-white hover:bg-[#cfc5b4] text-[#2c2a27] border-2 border-[#8b8273] font-serif uppercase tracking-[0.2em] transition-all rounded shadow-[4px_4px_0_0_#8b8273]"
                            >
                              Multiplayer Case
                            </Button>
                            <Button variant="ghost" asChild className="mt-2 text-[#5c5448] hover:text-[#2c2a27] uppercase tracking-widest font-serif transition-colors text-xs sm:text-sm">
                               <Link href="/games">Back to Agency</Link>
                            </Button>
                        </div>
                    </motion.div>
                )}

                {gameState === "playing" && currentProblem && (
                    <div className="w-full max-w-2xl text-center flex flex-col items-center">
                        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="mb-3 sm:mb-8 md:mb-12 bg-white/50 p-3 sm:p-8 rounded border border-[#8b8273] shadow-md transform -rotate-1 relative w-full">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-red-800/30 -rotate-3" />
                            <p className="text-[#8b8273] font-bold uppercase tracking-[0.2em] text-xs sm:text-sm mb-2 sm:mb-4 font-serif text-center">Find the <span className="text-[#2c2a27] font-black underline">{currentProblem.type}</span> of this set:</p>
                            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-4 bg-[#e4dfd5] p-3 sm:p-6 border-2 border-dashed border-[#8b8273]">
                                {currentProblem.data.map((n, i) => (
                                     <span key={i} className="text-lg sm:text-3xl font-black text-[#2c2a27] font-mono tracking-tighter">{n}</span>
                                ))}
                            </div>
                        </motion.div>
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-6 w-full">
                            {currentProblem.options.map((opt, i) => (
                                <motion.div key={opt} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{delay: i*0.1}} className="w-full">
                                    <Button onClick={() => handleChoice(opt)} className="w-full h-12 sm:h-20 text-lg sm:text-3xl font-black font-mono bg-white hover:bg-[#cfc5b4] text-[#2c2a27] border-2 border-[#8b8273] transition-all rounded shadow-[2px_2px_0_0_#8b8273] sm:shadow-[4px_4px_0_0_#8b8273] hover:translate-y-1 hover:shadow-[0px_0px_0_0_#8b8273]">
                                        {opt}
                                    </Button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-4 sm:mt-10 md:mt-16 w-full max-w-sm">
                            <div className="flex justify-between text-xs font-black uppercase text-[#8b8273] mb-1 sm:mb-2 font-serif tracking-widest">
                               <span>Investigation Time</span>
                               <span>{timeLeft.toFixed(1)}s</span>
                            </div>
                            <Progress value={(timeLeft / getTimerLimit()) * 100} className="h-2 bg-[#cfc5b4] rounded-none border border-[#8b8273]">
                               <div className="h-full bg-[#2c2a27] transition-all duration-100 ease-linear" />
                            </Progress>
                        </div>
                    </div>
                )}

                {gameState === "showing_result" && (
                    <motion.div initial={{scale:0.8, opacity:0, rotate: -5}} animate={{scale:1, opacity:1, rotate: 2}} exit={{scale:0.8, opacity:0}} className="bg-white p-6 sm:p-12 rounded border-4 border-[#2c2a27] text-center shadow-2xl relative max-w-md w-full">
                        {resultStatus === "correct" && (
                            <>
                               <CheckCircle2 className="w-16 h-16 sm:w-24 sm:h-24 text-green-700 mx-auto mb-4 sm:mb-6" />
                               <h2 className="text-xl sm:text-4xl font-black text-green-800 uppercase tracking-widest font-serif border-y-4 border-double border-green-800 py-2 sm:py-4">Evidence Accepted</h2>
                               <p className="text-xl sm:text-2xl text-green-700 mt-4 sm:mt-6 font-mono tabular-nums">+{score} CLUES</p>
                            </>
                        )}
                        {resultStatus === "incorrect" && (
                            <>
                               <HelpCircle className="w-16 h-16 sm:w-24 sm:h-24 text-red-800 mx-auto mb-4 sm:mb-6" />
                               <h2 className="text-xl sm:text-4xl font-black text-red-800 uppercase tracking-widest font-serif border-y-4 border-double border-red-800 py-2 sm:py-4">False Lead</h2>
                               <p className="text-base sm:text-xl text-[#5c5448] mt-4 sm:mt-6 font-serif">True value: <span className="text-[#2c2a27] font-black ml-2 font-mono text-xl sm:text-2xl bg-[#e4dfd5] px-3 py-0.5 sm:px-4 sm:py-1">{currentProblem?.a}</span></p>
                            </>
                        )}
                        {resultStatus === "timeout" && (
                            <>
                               <FileSearch className="w-16 h-16 sm:w-24 sm:h-24 text-[#8b8273] mx-auto mb-4 sm:mb-6" />
                               <h2 className="text-xl sm:text-4xl font-black text-[#5c5448] uppercase tracking-widest font-serif border-y-4 border-double border-[#8b8273] py-2 sm:py-4">Trail Cold</h2>
                               <p className="text-base sm:text-xl text-[#5c5448] mt-4 sm:mt-6 font-serif">True value: <span className="text-[#2c2a27] font-black ml-2 font-mono text-xl sm:text-2xl bg-[#e4dfd5] px-3 py-0.5 sm:px-4 sm:py-1">{currentProblem?.a}</span></p>
                            </>
                        )}

                        <div className="flex flex-col items-center gap-3 mt-6 sm:mt-10 relative z-20">
                            <Button onClick={nextRound} className="h-12 sm:h-16 px-6 sm:px-12 text-sm sm:text-2xl font-black bg-[#2c2a27] text-[#e4dfd5] hover:bg-[#4a4740] rounded shadow-2xl transition-all hover:scale-105 font-serif uppercase tracking-widest border-2 border-[#8b8273]">
                                {round >= 10 ? "Close Case" : "Next Evidence"}
                            </Button>
                            <Button variant="ghost" onClick={() => setGameState("idle")} className="text-[#8b8273] hover:text-[#5c5448] uppercase tracking-widest font-serif font-bold text-xs sm:text-sm">
                                Reset Intelligence
                            </Button>
                        </div>
                    </motion.div>
                )}

                {gameState === "finished" && (
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center w-full max-w-xl mx-auto bg-white p-6 sm:p-12 border-2 border-[#2c2a27] shadow-[8px_8px_0_0_#2c2a27] transform -rotate-1 relative">
                        <h2 className="text-3xl sm:text-5xl font-black text-[#2c2a27] uppercase font-serif tracking-[0.1em] sm:tracking-[0.2em] mb-2 border-b-4 border-double border-[#2c2a27] pb-4">Case Closed</h2>
                        <div className="bg-[#e4dfd5] border border-[#8b8273] p-4 sm:p-8 my-4 sm:my-8 relative">
                           <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#5c5448] mb-2 sm:mb-4 font-serif">Investigation Summary Score</p>
                           <p className="text-5xl sm:text-7xl font-black text-[#2c2a27] font-mono tabular-nums">{score}</p>
                           <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 text-red-800/80 font-serif text-xl sm:text-3xl transform -rotate-12 border-2 sm:border-4 border-red-800/80 p-1 sm:p-2 rounded tracking-widest uppercase">Verified</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center mt-6 sm:mt-10">
                            <Button onClick={() => {setGameState("idle"); setScore(0); setRound(0);}} className="h-12 sm:h-16 px-6 sm:px-8 text-sm sm:text-lg font-bold bg-[#2c2a27] hover:bg-[#4a4740] text-[#e4dfd5] font-serif uppercase tracking-widest rounded-none transition-all hover:scale-105"><RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Reopen File</Button>
                            <Button variant="outline" asChild className="h-12 sm:h-16 px-6 sm:px-8 text-sm sm:text-lg font-bold border-2 border-[#8b8273] text-[#2c2a27] hover:bg-[#cfc5b4] font-serif uppercase tracking-widest rounded-none"><Link href="/games">File Away</Link></Button>
                        </div>
                    </motion.div>
                )}
              </>
            )}
         </AnimatePresence>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-[#8b8273]/30 p-4 sm:p-6 z-10 bg-[#cfc5b4]/20">
        <Button variant="outline" asChild className="border-[#8b8273] text-[#2c2a27] hover:bg-[#cfc5b4] font-serif uppercase tracking-widest"><Link href="/games">Abort Mission</Link></Button>
        {gameMode === 'single' ? (
          (gameState !== 'idle' && gameState !== 'finished') && <p className="font-black font-serif text-[#2c2a27]">CLUES: {score}</p>
        ) : (
          (multiplayerState === 'playing' || multiplayerState === 'finished') && <p className="font-black font-serif text-[#2c2a27]">CLUES: {score}</p>
        )}
      </CardFooter>
    </Card>
  );
}
