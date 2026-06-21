'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { getGameBySlug } from '@/lib/games';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import {
  Trophy,
  Sparkles,
  Maximize,
  Minimize,
  Coins,
  ArrowRight,
  RotateCcw,
  Users,
  User,
  Play,
  Gamepad2,
  Camera,
  Activity,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  CheckCircle,
  Copy,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { audioEngine } from '../AudioEngine';

type GameState = 'idle' | 'instructions' | 'playing' | 'finished';
type Difficulty = 'beginner' | 'intermediate' | 'hard';
type MultiplayerState = 'mode_select' | 'create_room' | 'join_room' | 'lobby' | 'playing' | 'finished';

interface ActionItem {
  id: string;
  name: string;
  desc: string;
  tip: string;
  regions: ('top_left' | 'top_right' | 'bottom_mid' | 'center' | 'mid_left' | 'mid_right')[];
  animation: string;
  difficulty: Difficulty[];
}

const ACTION_DATABASE: ActionItem[] = [
  // --- BEGINNER ACTIONS (also in Intermediate and Hard) ---
  {
    id: 'raise_right',
    name: 'Raise Right Hand',
    desc: 'Raise your right hand straight up!',
    tip: 'Lift your right hand into the highlighted upper-left box (webcam is mirrored).',
    regions: ['top_left'],
    animation: 'raise_right',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'raise_left',
    name: 'Raise Left Hand',
    desc: 'Raise your left hand straight up!',
    tip: 'Lift your left hand into the highlighted upper-right box (webcam is mirrored).',
    regions: ['top_right'],
    animation: 'raise_left',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'lean_left',
    name: 'Lean Left',
    desc: 'Tilt your upper body to the left side!',
    tip: 'Keep your lower body still and shift your shoulders into the left box.',
    regions: ['mid_left'],
    animation: 'lean_left',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'lean_right',
    name: 'Lean Right',
    desc: 'Tilt your upper body to the right side!',
    tip: 'Keep your lower body still and shift your shoulders into the right box.',
    regions: ['mid_right'],
    animation: 'lean_right',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 't_pose',
    name: 'T-Pose / Arms Wide',
    desc: 'Extend both arms straight out to the sides!',
    tip: 'Keep your torso centered and stretch both arms horizontally into the left and right boxes.',
    regions: ['mid_left', 'mid_right'],
    animation: 't_pose',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'hands_on_hips',
    name: 'Hands on Hips',
    desc: 'Stand straight with hands on your hips!',
    tip: 'Keep your torso in the center and position your arms down and out.',
    regions: ['mid_left', 'mid_right'],
    animation: 'hands_on_hips',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'look_up',
    name: 'Look Up High',
    desc: 'Tilt your head up towards the ceiling!',
    tip: 'Tilt your head up while keeping your body in the center region.',
    regions: ['center'],
    animation: 'look_up',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'salute_right',
    name: 'Right Hand Salute',
    desc: 'Salute with your right hand near your head!',
    tip: 'Bring your right hand up near the upper-left of your head.',
    regions: ['top_left'],
    animation: 'salute_right',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'salute_left',
    name: 'Left Hand Salute',
    desc: 'Salute with your left hand near your head!',
    tip: 'Bring your left hand up near the upper-right of your head.',
    regions: ['top_right'],
    animation: 'salute_left',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'right_hand_out',
    name: 'Right Arm Out',
    desc: 'Point your right arm straight to the side!',
    tip: 'Extend your right arm into the mid-left box.',
    regions: ['mid_left'],
    animation: 'right_hand_out',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'left_hand_out',
    name: 'Left Arm Out',
    desc: 'Point your left arm straight to the side!',
    tip: 'Extend your left arm into the mid-right box.',
    regions: ['mid_right'],
    animation: 'left_hand_out',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'stand_still',
    name: 'Stand Attention',
    desc: 'Stand perfectly centered and still!',
    tip: 'Align your body in the central active zone with arms down.',
    regions: ['center'],
    animation: 'idle',
    difficulty: ['beginner', 'intermediate', 'hard']
  },

  // --- INTERMEDIATE ACTIONS (also in Hard) ---
  {
    id: 'wave_hands',
    name: 'Wave Both Hands',
    desc: 'Raise both hands above your head and wave them!',
    tip: 'Place both of your hands in the top corners and move them back and forth.',
    regions: ['top_left', 'top_right'],
    animation: 'wave_hands',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'squat',
    name: 'Squat / Crouch Down',
    desc: 'Lower your body into a squat position!',
    tip: 'Bend your knees and lower your entire body so your torso enters the lower region.',
    regions: ['bottom_mid'],
    animation: 'squat',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'high_v',
    name: 'High V Pose',
    desc: 'Raise both arms diagonally up in a V shape!',
    tip: 'Hold both hands high and wide in the top-left and top-right zones.',
    regions: ['top_left', 'top_right'],
    animation: 'high_v',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'low_v',
    name: 'Low V Pose',
    desc: 'Extend both arms diagonally down in an inverted V!',
    tip: 'Keep your hands wide in the mid-left and mid-right regions.',
    regions: ['mid_left', 'mid_right'],
    animation: 'low_v',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'boxer_defense',
    name: 'Boxer Defense Guard',
    desc: 'Bring your fists up to guard your face!',
    tip: 'Keep your body and hands tight in the center region.',
    regions: ['center'],
    animation: 'boxer_defense',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'raise_left_lean_right',
    name: 'Raise Left, Lean Right',
    desc: 'Tilt your body to the right while raising your left hand!',
    tip: 'Tilt your shoulders to the right and lift your left hand high.',
    regions: ['top_right', 'mid_right'],
    animation: 'raise_left_lean_right',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'raise_right_lean_left',
    name: 'Raise Right, Lean Left',
    desc: 'Tilt your body to the left while raising your right hand!',
    tip: 'Tilt your shoulders to the left and lift your right hand high.',
    regions: ['top_left', 'mid_left'],
    animation: 'raise_right_lean_left',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'right_kick',
    name: 'Right Leg Kick',
    desc: 'Balance on one leg and lift your right leg!',
    tip: 'Stand on your left leg and lift your right leg into the lower center region.',
    regions: ['bottom_mid'],
    animation: 'right_kick',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'left_kick',
    name: 'Left Leg Kick',
    desc: 'Balance on one leg and lift your left leg!',
    tip: 'Stand on your right leg and lift your left leg into the lower center region.',
    regions: ['bottom_mid'],
    animation: 'left_kick',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'funky_chicken_right',
    name: 'Right Wing Pose',
    desc: 'Bent elbow up with your hand on your hip!',
    tip: 'Form a wing shape with your right arm pointing into the mid-left zone.',
    regions: ['mid_left'],
    animation: 'funky_chicken_right',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'funky_chicken_left',
    name: 'Left Wing Pose',
    desc: 'Bent elbow up with your hand on your hip!',
    tip: 'Form a wing shape with your left arm pointing into the mid-right zone.',
    regions: ['mid_right'],
    animation: 'funky_chicken_left',
    difficulty: ['intermediate', 'hard']
  },

  // --- HARD ACTIONS ONLY ---
  {
    id: 'star_jump',
    name: 'Star Jump',
    desc: 'Jump up high with arms and legs spread!',
    tip: 'Leap dynamically in the center of the camera frame.',
    regions: ['center', 'top_left', 'top_right'],
    animation: 'star_jump',
    difficulty: ['hard']
  },
  {
    id: 'dab_left',
    name: 'Dabbing Left',
    desc: 'Strike a dab pose pointing to the left!',
    tip: 'Point both arms diagonally up to the left (your top-left region).',
    regions: ['top_left', 'mid_right'],
    animation: 'dab_left',
    difficulty: ['hard']
  },
  {
    id: 'dab_right',
    name: 'Dabbing Right',
    desc: 'Strike a dab pose pointing to the right!',
    tip: 'Point both arms diagonally up to the right (your top-right region).',
    regions: ['top_right', 'mid_left'],
    animation: 'dab_right',
    difficulty: ['hard']
  },
  {
    id: 'lunge_left',
    name: 'Lunge Left',
    desc: 'Take a deep side lunge to the left!',
    tip: 'Shift your entire body weight into the left lower region.',
    regions: ['bottom_mid', 'mid_left'],
    animation: 'lunge_left',
    difficulty: ['hard']
  },
  {
    id: 'lunge_right',
    name: 'Lunge Right',
    desc: 'Take a deep side lunge to the right!',
    tip: 'Shift your entire body weight into the right lower region.',
    regions: ['bottom_mid', 'mid_right'],
    animation: 'lunge_right',
    difficulty: ['hard']
  },
  {
    id: 'crossover_left',
    name: 'Left Knee Tap',
    desc: 'Cross your right hand down to touch your left knee!',
    tip: 'Bend forward and move your right hand into the lower-right side.',
    regions: ['mid_left', 'bottom_mid'],
    animation: 'crossover_left',
    difficulty: ['hard']
  },
  {
    id: 'crossover_right',
    name: 'Right Knee Tap',
    desc: 'Cross your left hand down to touch your right knee!',
    tip: 'Bend forward and move your left hand into the lower-left side.',
    regions: ['mid_right', 'bottom_mid'],
    animation: 'crossover_right',
    difficulty: ['hard']
  },
  {
    id: 'helicopter',
    name: 'Helicopter Twist',
    desc: 'Twist your torso with arms wide open!',
    tip: 'Extend arms horizontally and rotate your torso back and forth.',
    regions: ['mid_left', 'mid_right', 'center'],
    animation: 'helicopter',
    difficulty: ['hard']
  },
  {
    id: 'ninja_stance',
    name: 'Ninja Crouch Stance',
    desc: 'Crouch down low with one arm guarding high!',
    tip: 'Get low in the center-bottom and raise one hand to the top corner.',
    regions: ['bottom_mid', 'top_left'],
    animation: 'ninja_stance',
    difficulty: ['hard']
  },
  {
    id: 'power_up',
    name: 'Power Up Charge',
    desc: 'Crouch down with both arms raised high!',
    tip: 'Squat low in the center while keeping both hands in the upper corners.',
    regions: ['bottom_mid', 'top_left', 'top_right'],
    animation: 'power_up',
    difficulty: ['hard']
  },
  {
    id: 'weightlifter',
    name: 'Olympic Barbell Lift',
    desc: 'Hold a deep squat with arms fully locked high!',
    tip: 'Perform a clean squat while holding both hands straight up.',
    regions: ['bottom_mid', 'top_left', 'top_right'],
    animation: 'weightlifter',
    difficulty: ['hard']
  },
  {
    id: 'disco_left',
    name: 'Disco Finger Left',
    desc: 'Point diagonally up-left while leaning right!',
    tip: 'Keep your feet centered and point your right hand to the top-left.',
    regions: ['top_left', 'bottom_mid'],
    animation: 'disco_left',
    difficulty: ['hard']
  },
  {
    id: 'disco_right',
    name: 'Disco Finger Right',
    desc: 'Point diagonally up-right while leaning left!',
    tip: 'Keep your feet centered and point your left hand to the top-right.',
    regions: ['top_right', 'bottom_mid'],
    animation: 'disco_right',
    difficulty: ['hard']
  },
  {
    id: 'matrix_lean',
    name: 'Matrix Bullet Dodge',
    desc: 'Lean your upper body back while bending your knees!',
    tip: 'Bend your knees slightly and lean your torso back into the center zone.',
    regions: ['center', 'bottom_mid'],
    animation: 'matrix_lean',
    difficulty: ['hard']
  }
];

export function ActionDetector3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  // Game Configuration States
  const [gameMode, setGameMode] = React.useState<'single' | 'multi'>('single');
  const [multiplayerState, setMultiplayerState] = React.useState<MultiplayerState>('mode_select');
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('intermediate');
  const [roundsCount, setRoundsCount] = React.useState<number>(10);
  const [currentRoundIdx, setCurrentRoundIdx] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showTip, setShowTip] = React.useState(false);
  const [tipTimer, setTipTimer] = React.useState<number>(0);
  const [detectionProgress, setDetectionProgress] = React.useState(0); // 0 to 100%
  const [activeActions, setActiveActions] = React.useState<ActionItem[]>([]);

  // Camera & Motion States
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const prevPixelsRef = React.useRef<Uint8ClampedArray | null>(null);
  const detectionIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Region Activity states for UI visual feedback
  const [activeRegions, setActiveRegions] = React.useState({
    top_left: false,
    top_right: false,
    bottom_mid: false,
    center: false,
    mid_left: false,
    mid_right: false
  });

  // Multiplayer Matchmaking States
  const [myUid, setMyUid] = React.useState<string>('');
  const [nickname, setNickname] = React.useState<string>('');
  const [roomCode, setRoomCode] = React.useState<string>('');
  const [isHost, setIsHost] = React.useState<boolean>(false);
  const [roomData, setRoomData] = React.useState<any>(null);
  const [roomPlayers, setRoomPlayers] = React.useState<any[]>([]);
  const [codeVal, setCodeVal] = React.useState<string>('');

  const [localToast, setLocalToast] = React.useState<{ title: string; description: string; variant?: 'default' | 'destructive' } | null>(null);

  const { user, userProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const mountRef = React.useRef<HTMLDivElement>(null);
  const robotRef = React.useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    puppet: THREE.Group | null;
    leftArm: THREE.Group | null;
    rightArm: THREE.Group | null;
    leftLeg: THREE.Group | null;
    rightLeg: THREE.Group | null;
    head: THREE.Mesh | null;
    torso: THREE.Mesh | null;
    requestFrameId: number;
  }>({
    scene: null, camera: null, renderer: null, puppet: null,
    leftArm: null, rightArm: null, leftLeg: null, rightLeg: null,
    head: null, torso: null, requestFrameId: 0
  });

  const showLocalToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    setLocalToast({ title, description, variant });
    setTimeout(() => setLocalToast(null), 4000);
  };

  // Sync profile nickname
  React.useEffect(() => {
    if (user) {
      const name = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || '';
      setNickname(name);
    } else {
      setNickname(`Player_${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [user, userProfile]);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Webcam Stream Handler ──────────────────────────────────────────
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
        };
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Camera blocked or unavailable. Please grant webcam permissions to play.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // ── Session Recovery ──────────────────────────────────────────────
  React.useEffect(() => {
    if (typeof window === 'undefined' || !firestore) return;
    const savedRoom = sessionStorage.getItem("lingoland_active_roomCode_action-detector");
    const savedUid = sessionStorage.getItem("lingoland_active_myUid_action-detector");
    const savedMode = sessionStorage.getItem("lingoland_active_gameMode_action-detector");
    
    if (savedRoom && savedUid && savedMode === 'multi') {
      const roomRef = doc(firestore, "stats", "am_room_" + savedRoom);
      getDoc(roomRef).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.players && data.players[savedUid] && data.status !== 'disbanded' && data.status !== 'finished') {
            setMyUid(savedUid);
            setRoomCode(savedRoom);
            setGameMode('multi');
            setIsHost(data.hostId === savedUid);
            setNickname(data.players[savedUid].name);
            
            if (data.status === 'lobby') {
              setMultiplayerState('lobby');
              setGameState('playing');
            } else if (data.status === 'playing') {
              setMultiplayerState('playing');
              setGameState('playing');
              setCurrentRoundIdx(data.currentRound || 0);
            }
            showLocalToast("Reconnected 🎮", `Resumed active session in room ${savedRoom}.`);
          }
        }
      });
    }
  }, [firestore]);

  // ── Realtime Multiplayer Sync ──────────────────────────────────────
  React.useEffect(() => {
    if (!firestore || !roomCode || gameMode !== 'multi') return;
    const roomRef = doc(firestore, "stats", "am_room_" + roomCode);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        showLocalToast("Room Disbanded 🚨", "The host has closed this room.", "destructive");
        resetMultiplayerState();
        return;
      }
      const data = snapshot.data();
      setRoomData(data);
      const list = Object.values(data.players || {}) as any[];
      setRoomPlayers(list);
      
      if (data.difficulty) setDifficulty(data.difficulty as Difficulty);
      if (data.roundsCount) setRoundsCount(data.roundsCount);
      if (data.actionsList) setActiveActions(data.actionsList);
      
      if (data.status === 'disbanded') {
        showLocalToast("Room Disbanded 🚨", "The host closed this lobby.", "destructive");
        resetMultiplayerState();
        return;
      }

      if (data.status === 'playing' && multiplayerState === 'lobby') {
        setMultiplayerState('playing');
        setCurrentRoundIdx(0);
        setScore(0);
        startCamera();
      }
      
      if (data.status === 'playing') {
        setCurrentRoundIdx(data.currentRound);
        // Show winner toast for the round
        if (data.lastRoundWinner && data.currentRound !== currentRoundIdx) {
          toast({
            title: `Round Complete! 🎉`,
            description: `${data.lastRoundWinner} completed the action first!`,
            duration: 3000
          });
        }
      }

      if (data.status === 'finished' && multiplayerState !== 'finished') {
        setMultiplayerState('finished');
        setGameState('finished');
        stopCamera();
      }
    });
    return () => unsubscribe();
  }, [firestore, roomCode, gameMode, multiplayerState]);

  // Podium Confetti for Winner
  React.useEffect(() => {
    if (multiplayerState === 'finished' && roomPlayers.length > 0) {
      const sorted = [...roomPlayers].sort((a, b) => b.score - a.score);
      const winner = sorted[0];
      if (winner && winner.uid === myUid) {
        const end = Date.now() + 4000;
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
  }, [multiplayerState, roomPlayers]);

  const activeAction: ActionItem | undefined = activeActions[currentRoundIdx];

  // Tip timer loop
  React.useEffect(() => {
    if (gameState !== 'playing') return;
    setShowTip(false);
    const delay = difficulty === 'beginner' ? 4000 : difficulty === 'intermediate' ? 8000 : 14000;
    const timer = setTimeout(() => {
      setShowTip(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [currentRoundIdx, gameState, difficulty]);

  // ── Custom Motion Detection Engine (Canvas Delta Tracker) ────────────
  const runMotionDetection = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Small low-res canvas for motion calculations (high performance)
    const cw = 32;
    const ch = 24;

    ctx.drawImage(video, 0, 0, cw, ch);
    const imgData = ctx.getImageData(0, 0, cw, ch);
    const pixels = imgData.data;

    // Region configuration bounds
    const regions = {
      top_left: { xStart: 0, xEnd: 11, yStart: 0, yEnd: 8 },
      top_right: { xStart: 21, xEnd: 31, yStart: 0, yEnd: 8 },
      mid_left: { xStart: 0, xEnd: 9, yStart: 8, yEnd: 15 },
      mid_right: { xStart: 23, xEnd: 31, yStart: 8, yEnd: 15 },
      center: { xStart: 10, xEnd: 22, yStart: 7, yEnd: 16 },
      bottom_mid: { xStart: 10, xEnd: 22, yStart: 16, yEnd: 23 }
    };

    let motionScores = {
      top_left: 0,
      top_right: 0,
      mid_left: 0,
      mid_right: 0,
      center: 0,
      bottom_mid: 0
    };

    const threshold = difficulty === 'beginner' ? 12 : difficulty === 'intermediate' ? 18 : 25;

    if (prevPixelsRef.current) {
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const idx = (y * cw + x) * 4;
          const rDiff = Math.abs(pixels[idx] - prevPixelsRef.current[idx]);
          const gDiff = Math.abs(pixels[idx + 1] - prevPixelsRef.current[idx + 1]);
          const bDiff = Math.abs(pixels[idx + 2] - prevPixelsRef.current[idx + 2]);
          const diff = (rDiff + gDiff + bDiff) / 3;

          if (diff > threshold) {
            // Classify motion coordinates into regions
            if (x >= regions.top_left.xStart && x <= regions.top_left.xEnd && y >= regions.top_left.yStart && y <= regions.top_left.yEnd) {
              motionScores.top_left += diff;
            }
            if (x >= regions.top_right.xStart && x <= regions.top_right.xEnd && y >= regions.top_right.yStart && y <= regions.top_right.yEnd) {
              motionScores.top_right += diff;
            }
            if (x >= regions.mid_left.xStart && x <= regions.mid_left.xEnd && y >= regions.mid_left.yStart && y <= regions.mid_left.yEnd) {
              motionScores.mid_left += diff;
            }
            if (x >= regions.mid_right.xStart && x <= regions.mid_right.xEnd && y >= regions.mid_right.yStart && y <= regions.mid_right.yEnd) {
              motionScores.mid_right += diff;
            }
            if (x >= regions.center.xStart && x <= regions.center.xEnd && y >= regions.center.yStart && y <= regions.center.yEnd) {
              motionScores.center += diff;
            }
            if (x >= regions.bottom_mid.xStart && x <= regions.bottom_mid.xEnd && y >= regions.bottom_mid.yStart && y <= regions.bottom_mid.yEnd) {
              motionScores.bottom_mid += diff;
            }
          }
        }
      }
    }

    prevPixelsRef.current = pixels;

    // Apply scaling factor to normalize activity thresholds
    const triggerLimit = difficulty === 'beginner' ? 180 : difficulty === 'intermediate' ? 240 : 320;
    
    const activity = {
      top_left: motionScores.top_left > triggerLimit,
      top_right: motionScores.top_right > triggerLimit,
      mid_left: motionScores.mid_left > triggerLimit,
      mid_right: motionScores.mid_right > triggerLimit,
      center: motionScores.center > triggerLimit,
      bottom_mid: motionScores.bottom_mid > triggerLimit
    };

    setActiveRegions(activity);

    // Validate the current action requirements
    if (activeAction) {
      let isActionValid = true;
      activeAction.regions.forEach(reg => {
        if (!activity[reg]) {
          isActionValid = false;
        }
      });

      if (isActionValid) {
        // Increment progress (requires holding the pose/doing the action for a brief duration)
        setDetectionProgress(prev => {
          const next = prev + (difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 5 : 3.5);
          if (next >= 100) {
            handleActionSuccess();
            return 0;
          }
          return next;
        });
      } else {
        // Slow decay of progress if pose is broken
        setDetectionProgress(prev => Math.max(0, prev - 2));
      }
    }
  };

  React.useEffect(() => {
    if (gameState === 'playing' && cameraActive) {
      detectionIntervalRef.current = setInterval(runMotionDetection, 1000 / 20); // 20 FPS sampling
    } else {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    }
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [gameState, cameraActive, activeAction, difficulty]);

  // ── Handling Action Success ────────────────────────────────────────
  const handleActionSuccess = async () => {
    audioEngine.playCorrect();
    confetti({ particleCount: 30, spread: 60 });

    if (gameMode === 'single') {
      // Single player progression
      setScore(prev => prev + 100);
      const nextRound = currentRoundIdx + 1;
      if (nextRound >= roundsCount) {
        setGameState('finished');
        audioEngine.playLevelSuccess();
        stopCamera();
      } else {
        setCurrentRoundIdx(nextRound);
        setDetectionProgress(0);
      }
    } else {
      // Multiplayer progression via Firestore transaction/atomicity check
      if (!firestore || !roomCode) return;
      const roomRef = doc(firestore, "stats", "am_room_" + roomCode);
      try {
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.currentRound === currentRoundIdx && data.status === 'playing') {
            const nextRound = currentRoundIdx + 1;
            const isLastRound = nextRound >= roundsCount;

            const updatedPlayers = { ...data.players };
            updatedPlayers[myUid].score = (updatedPlayers[myUid].score || 0) + 100;

            await updateDoc(roomRef, {
              currentRound: isLastRound ? currentRoundIdx : nextRound,
              lastRoundWinner: nickname,
              players: updatedPlayers,
              status: isLastRound ? 'finished' : 'playing'
            });
            setDetectionProgress(0);
          }
        }
      } catch (err) {
        console.error("Multiplayer round update failed:", err);
      }
    }
  };

  // ── Start / Stop Game Triggers ──────────────────────────────────────
  const startGameSingle = () => {
    // Shuffle and pick actions based on difficulty and rounds count
    const filtered = ACTION_DATABASE.filter(act => act.difficulty.includes(difficulty));
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const list: ActionItem[] = [];
    for (let i = 0; i < roundsCount; i++) {
      list.push(shuffled[i % shuffled.length]);
    }
    setActiveActions(list);
    setCurrentRoundIdx(0);
    setScore(0);
    setGameState('playing');
    startCamera();
  };

  const handleCreateRoom = async () => {
    if (!firestore || !nickname.trim()) {
      showLocalToast("Name Required", "Please enter a display name first.", "destructive");
      return;
    }
    const code = Array.from({ length: 5 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const hostUid = user ? `${user.uid}_${Math.random().toString(36).substring(2, 6)}` : `guest_${Date.now()}`;
    setMyUid(hostUid);

    const initialPlayers = {
      [hostUid]: {
        uid: hostUid,
        name: nickname,
        score: 0,
        isHost: true,
        lastActive: Date.now()
      }
    };

    // Prepare action queue based on difficulty
    const filtered = ACTION_DATABASE.filter(act => act.difficulty.includes(difficulty));
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const list: ActionItem[] = [];
    for (let i = 0; i < roundsCount; i++) {
      list.push(shuffled[i % shuffled.length]);
    }

    try {
      const roomRef = doc(firestore, "stats", "am_room_" + code);
      await setDoc(roomRef, {
        code,
        hostId: hostUid,
        hostName: nickname,
        difficulty,
        roundsCount,
        status: 'lobby',
        players: initialPlayers,
        actionsList: list,
        currentRound: 0,
        lastRoundWinner: '',
        createdAt: Date.now()
      });

      setRoomCode(code);
      setIsHost(true);
      setActiveActions(list);
      setMultiplayerState('lobby');
      setGameState('playing');
      sessionStorage.setItem("lingoland_active_roomCode_action-detector", code);
      sessionStorage.setItem("lingoland_active_myUid_action-detector", hostUid);
      sessionStorage.setItem("lingoland_active_gameMode_action-detector", 'multi');
    } catch (e) {
      console.error(e);
      showLocalToast("Server Error", "Could not initialize matchmaking lobby.", "destructive");
    }
  };

  const handleJoinRoom = async (codeToJoin: string) => {
    if (!firestore || !nickname.trim() || codeToJoin.trim().length !== 5) {
      showLocalToast("Input Error", "Please fill in your name and a 5-letter room code.", "destructive");
      return;
    }
    const cleanCode = codeToJoin.trim().toUpperCase();
    try {
      const roomRef = doc(firestore, "stats", "am_room_" + cleanCode);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        showLocalToast("Lobby Not Found", "No active lobby matches this code.", "destructive");
        return;
      }
      const data = roomSnap.data();
      if (data.status !== 'lobby') {
        showLocalToast("Lobby Closed", "The game has already started or finished.", "destructive");
        return;
      }
      const list = Object.values(data.players || {});
      if (list.length >= 2) {
        showLocalToast("Lobby Full", "This battle room is full (max 2 players).", "destructive");
        return;
      }

      const playerUid = user ? `${user.uid}_${Math.random().toString(36).substring(2, 6)}` : `guest_${Date.now()}`;
      setMyUid(playerUid);

      const updatedPlayers = {
        ...data.players,
        [playerUid]: {
          uid: playerUid,
          name: nickname,
          score: 0,
          isHost: false,
          lastActive: Date.now()
        }
      };

      await updateDoc(roomRef, { players: updatedPlayers });
      setRoomCode(cleanCode);
      setIsHost(false);
      setMultiplayerState('lobby');
      setGameState('playing');
      sessionStorage.setItem("lingoland_active_roomCode_action-detector", cleanCode);
      sessionStorage.setItem("lingoland_active_myUid_action-detector", playerUid);
      sessionStorage.setItem("lingoland_active_gameMode_action-detector", 'multi');
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartMultiGame = async () => {
    if (!firestore || !roomCode || !isHost) return;
    if (roomPlayers.length < 2) {
      showLocalToast("Lobby Empty", "Need a second player in the room to launch.", "destructive");
      return;
    }
    const roomRef = doc(firestore, "stats", "am_room_" + roomCode);
    await updateDoc(roomRef, { status: 'playing' });
  };

  const handleLeaveRoom = async () => {
    if (firestore && roomCode) {
      const roomRef = doc(firestore, "stats", "am_room_" + roomCode);
      if (isHost) {
        await updateDoc(roomRef, { status: 'disbanded' });
        await deleteDoc(roomRef);
      } else if (roomData?.players) {
        const updatedPlayers = { ...roomData.players };
        delete updatedPlayers[myUid];
        await updateDoc(roomRef, { players: updatedPlayers });
      }
    }
    resetMultiplayerState();
  };

  const resetMultiplayerState = () => {
    sessionStorage.removeItem("lingoland_active_roomCode_action-detector");
    sessionStorage.removeItem("lingoland_active_myUid_action-detector");
    sessionStorage.removeItem("lingoland_active_gameMode_action-detector");
    stopCamera();
    setRoomCode('');
    setMyUid('');
    setIsHost(false);
    setRoomData(null);
    setRoomPlayers([]);
    setCodeVal('');
    setMultiplayerState('mode_select');
    setGameState('idle');
  };

  const exitGame = () => {
    stopCamera();
    resetMultiplayerState();
    setGameState('idle');
  };

  // ── Three.js Puppet Animation Engine ───────────────────────────────
  const initThreeScene = () => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c1a);
    scene.fog = new THREE.FogExp2(0x0a0c1a, 0.045);
    robotRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.8, 5.5);
    camera.lookAt(0, 1.2, 0);
    robotRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    robotRef.current.renderer = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(2, 6, 4);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 3, 10);
    pointLight.position.set(0, 1.5, 1.5);
    scene.add(pointLight);

    // Floor Platform
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.6, 0.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.8 })
    );
    platform.position.y = -0.1;
    scene.add(platform);

    const grid = new THREE.GridHelper(3, 12, 0xa855f7, 0x374151);
    grid.position.y = 0.01;
    scene.add(grid);

    // Humanoid Puppet Assembly
    const puppet = new THREE.Group();
    scene.add(puppet);
    robotRef.current.puppet = puppet;

    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.15,
      roughness: 0.2,
      metalness: 0.8
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.4), material);
    torso.position.y = 1.1;
    puppet.add(torso);
    robotRef.current.torso = torso;

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.3,
      roughness: 0.1
    }));
    head.position.set(0, 1.85, 0);
    puppet.add(head);
    robotRef.current.head = head;

    // Shoulders / Limbs Pivot Points for natural rotation
    const rightArm = new THREE.Group();
    rightArm.position.set(-0.48, 1.5, 0);
    puppet.add(rightArm);
    robotRef.current.rightArm = rightArm;

    const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.8, 8), material);
    rightArmMesh.position.y = -0.4;
    rightArm.add(rightArmMesh);

    const leftArm = new THREE.Group();
    leftArm.position.set(0.48, 1.5, 0);
    puppet.add(leftArm);
    robotRef.current.leftArm = leftArm;

    const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.8, 8), material);
    leftArmMesh.position.y = -0.4;
    leftArm.add(leftArmMesh);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(-0.24, 0.6, 0);
    puppet.add(rightLeg);
    robotRef.current.rightLeg = rightLeg;

    const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), material);
    rightLegMesh.position.y = -0.35;
    rightLeg.add(rightLegMesh);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(0.24, 0.6, 0);
    puppet.add(leftLeg);
    robotRef.current.leftLeg = leftLeg;

    const leftLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), material);
    leftLegMesh.position.y = -0.35;
    leftLeg.add(leftLegMesh);

    const clock = new THREE.Clock();

    const animateThree = () => {
      robotRef.current.requestFrameId = requestAnimationFrame(animateThree);
      const time = clock.getElapsedTime();
      const actionId = activeAction?.id || 'idle';

      // Reset base poses
      if (puppet) puppet.position.y = 0;
      if (torso) { torso.rotation.set(0, 0, 0); torso.position.y = 1.1; }
      if (head) head.rotation.set(0, 0, 0);
      if (leftArm) leftArm.rotation.set(0, 0, 0);
      if (rightArm) rightArm.rotation.set(0, 0, 0);
      if (leftLeg) leftLeg.rotation.set(0, 0, 0);
      if (rightLeg) rightLeg.rotation.set(0, 0, 0);

      // Perform animations based on active instruction
      switch (actionId) {
        case 'wave_hands':
          leftArm.rotation.z = Math.PI * 0.75 + Math.sin(time * 8) * 0.3;
          rightArm.rotation.z = -Math.PI * 0.75 + Math.cos(time * 8) * 0.3;
          break;
        case 'raise_right':
          rightArm.rotation.z = -Math.PI * 0.85 + Math.sin(time * 3) * 0.05;
          leftArm.rotation.z = 0.1;
          break;
        case 'raise_left':
          leftArm.rotation.z = Math.PI * 0.85 + Math.sin(time * 3) * 0.05;
          rightArm.rotation.z = -0.1;
          break;
        case 'squat':
          puppet.position.y = -0.3 + Math.sin(time * 2) * 0.1;
          leftArm.rotation.x = -Math.PI * 0.3;
          rightArm.rotation.x = -Math.PI * 0.3;
          leftLeg.rotation.x = -Math.PI * 0.2;
          rightLeg.rotation.x = -Math.PI * 0.2;
          break;
        case 't_pose':
          leftArm.rotation.z = Math.PI * 0.5;
          rightArm.rotation.z = -Math.PI * 0.5;
          break;
        case 'lean_left':
          torso.rotation.z = 0.25;
          head.rotation.z = 0.1;
          leftArm.rotation.z = Math.PI * 0.2;
          break;
        case 'lean_right':
          torso.rotation.z = -0.25;
          head.rotation.z = -0.1;
          rightArm.rotation.z = -Math.PI * 0.2;
          break;
        case 'hands_on_hips':
          leftArm.rotation.z = Math.PI * 0.15;
          leftArm.rotation.x = -Math.PI * 0.1;
          rightArm.rotation.z = -Math.PI * 0.15;
          rightArm.rotation.x = -Math.PI * 0.1;
          break;
        case 'look_up':
          head.rotation.x = -0.4;
          leftArm.rotation.z = 0.1;
          rightArm.rotation.z = -0.1;
          break;
        case 'salute_right':
          rightArm.rotation.z = -Math.PI * 0.8;
          rightArm.rotation.y = -Math.PI * 0.35;
          leftArm.rotation.z = 0.1;
          break;
        case 'salute_left':
          leftArm.rotation.z = Math.PI * 0.8;
          leftArm.rotation.y = Math.PI * 0.35;
          rightArm.rotation.z = -0.1;
          break;
        case 'right_hand_out':
          rightArm.rotation.z = -Math.PI * 0.45;
          leftArm.rotation.z = 0.1;
          break;
        case 'left_hand_out':
          leftArm.rotation.z = Math.PI * 0.45;
          rightArm.rotation.z = -0.1;
          break;
        case 'high_v':
          leftArm.rotation.z = Math.PI * 0.7;
          rightArm.rotation.z = -Math.PI * 0.7;
          break;
        case 'low_v':
          leftArm.rotation.z = Math.PI * 0.25;
          rightArm.rotation.z = -Math.PI * 0.25;
          break;
        case 'boxer_defense':
          leftArm.rotation.x = -Math.PI * 0.4;
          leftArm.rotation.y = Math.PI * 0.2;
          rightArm.rotation.x = -Math.PI * 0.4;
          rightArm.rotation.y = -Math.PI * 0.2;
          break;
        case 'raise_left_lean_right':
          torso.rotation.z = -0.2;
          leftArm.rotation.z = Math.PI * 0.85;
          rightArm.rotation.z = -0.1;
          break;
        case 'raise_right_lean_left':
          torso.rotation.z = 0.2;
          rightArm.rotation.z = -Math.PI * 0.85;
          leftArm.rotation.z = 0.1;
          break;
        case 'right_kick':
          rightLeg.rotation.x = -Math.PI * 0.35;
          leftLeg.rotation.x = 0.05;
          puppet.position.y = 0.05;
          break;
        case 'left_kick':
          leftLeg.rotation.x = -Math.PI * 0.35;
          rightLeg.rotation.x = 0.05;
          puppet.position.y = 0.05;
          break;
        case 'funky_chicken_right':
          rightArm.rotation.z = -Math.PI * 0.35;
          rightArm.rotation.x = -Math.PI * 0.2;
          break;
        case 'funky_chicken_left':
          leftArm.rotation.z = Math.PI * 0.35;
          leftArm.rotation.x = -Math.PI * 0.2;
          break;
        case 'star_jump':
          const jumpVal = Math.max(0, Math.sin(time * 5));
          puppet.position.y = jumpVal * 0.8;
          leftArm.rotation.z = Math.PI * 0.25 + jumpVal * (Math.PI * 0.3);
          rightArm.rotation.z = -Math.PI * 0.25 - jumpVal * (Math.PI * 0.3);
          leftLeg.rotation.z = jumpVal * 0.25;
          rightLeg.rotation.z = -jumpVal * 0.25;
          break;
        case 'dab_left':
          torso.rotation.y = Math.PI * 0.15;
          torso.rotation.z = 0.1;
          leftArm.rotation.z = Math.PI * 0.75;
          leftArm.rotation.y = -Math.PI * 0.1;
          rightArm.rotation.z = -Math.PI * 0.15;
          rightArm.rotation.x = -Math.PI * 0.35;
          head.rotation.y = Math.PI * 0.25;
          break;
        case 'dab_right':
          torso.rotation.y = -Math.PI * 0.15;
          torso.rotation.z = -0.1;
          rightArm.rotation.z = -Math.PI * 0.75;
          rightArm.rotation.y = Math.PI * 0.1;
          leftArm.rotation.z = Math.PI * 0.15;
          leftArm.rotation.x = -Math.PI * 0.35;
          head.rotation.y = -Math.PI * 0.25;
          break;
        case 'lunge_left':
          puppet.position.y = -0.2;
          puppet.position.x = -0.3;
          leftLeg.rotation.z = Math.PI * 0.15;
          rightLeg.rotation.z = Math.PI * 0.25;
          break;
        case 'lunge_right':
          puppet.position.y = -0.2;
          puppet.position.x = 0.3;
          rightLeg.rotation.z = -Math.PI * 0.15;
          leftLeg.rotation.z = -Math.PI * 0.25;
          break;
        case 'crossover_left':
          torso.rotation.x = Math.PI * 0.2;
          torso.rotation.y = Math.PI * 0.15;
          rightArm.rotation.x = -Math.PI * 0.45;
          rightArm.rotation.y = Math.PI * 0.35;
          break;
        case 'crossover_right':
          torso.rotation.x = Math.PI * 0.2;
          torso.rotation.y = -Math.PI * 0.15;
          leftArm.rotation.x = -Math.PI * 0.45;
          leftArm.rotation.y = -Math.PI * 0.35;
          break;
        case 'helicopter':
          torso.rotation.y = Math.sin(time * 6) * 0.6;
          leftArm.rotation.z = Math.PI * 0.5;
          rightArm.rotation.z = -Math.PI * 0.5;
          break;
        case 'ninja_stance':
          puppet.position.y = -0.25;
          torso.rotation.y = Math.PI * 0.25;
          rightArm.rotation.z = -Math.PI * 0.85;
          leftArm.rotation.z = Math.PI * 0.15;
          leftLeg.rotation.x = -Math.PI * 0.3;
          rightLeg.rotation.x = -Math.PI * 0.1;
          break;
        case 'power_up':
          puppet.position.y = -0.15 + Math.sin(time * 15) * 0.03;
          leftArm.rotation.z = Math.PI * 0.75;
          rightArm.rotation.z = -Math.PI * 0.75;
          leftLeg.rotation.x = -Math.PI * 0.15;
          rightLeg.rotation.x = -Math.PI * 0.15;
          break;
        case 'weightlifter':
          puppet.position.y = -0.35;
          leftArm.rotation.z = Math.PI * 0.9;
          rightArm.rotation.z = -Math.PI * 0.9;
          leftLeg.rotation.x = -Math.PI * 0.25;
          rightLeg.rotation.x = -Math.PI * 0.25;
          break;
        case 'disco_left':
          torso.rotation.z = 0.15;
          rightArm.rotation.z = -Math.PI * 0.75;
          leftArm.rotation.z = 0.15;
          break;
        case 'disco_right':
          torso.rotation.z = -0.15;
          leftArm.rotation.z = Math.PI * 0.75;
          rightArm.rotation.z = -0.15;
          break;
        case 'matrix_lean':
          torso.rotation.x = Math.PI * 0.3;
          puppet.position.y = -0.2;
          leftArm.rotation.x = -Math.PI * 0.2;
          rightArm.rotation.x = -Math.PI * 0.2;
          break;
        default:
          // Idle breathing
          leftArm.rotation.z = 0.1 + Math.sin(time * 2) * 0.04;
          rightArm.rotation.z = -0.1 - Math.sin(time * 2) * 0.04;
          head.rotation.y = Math.sin(time * 1.5) * 0.1;
          break;
      }

      renderer.render(scene, camera);
    };

    animateThree();

    const handleResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (camera && renderer) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(robotRef.current.requestFrameId);
      scene.clear();
      renderer.dispose();
    };
  };

  React.useEffect(() => {
    if (gameState === 'playing') {
      const cleanup = initThreeScene();
      return cleanup;
    }
  }, [gameState, activeAction]);

  return (
    <div className={cn(
      "relative w-full flex flex-col bg-[#05060f] font-sans select-none text-slate-100 overflow-hidden",
      isFullscreen ? "h-screen p-6" : "min-h-[650px] md:min-h-[780px] rounded-3xl p-4 md:p-6 border border-slate-800/80 shadow-2xl"
    )} id="action-detector-game">
      {/* Dynamic particles background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,#6b21a8_0%,transparent_70%)]" />

      {/* Universal Floating Fullscreen Button (visible when not playing) */}
      {onToggleFullscreen && gameState !== 'playing' && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
      )}

      {/* ── MODE SELECT SCREEN ── */}
      {gameState === 'idle' && multiplayerState === 'mode_select' && (
        <div className="relative z-10 max-w-2xl mx-auto my-auto p-4 w-full flex flex-col gap-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-tight flex items-center justify-center gap-3">
              <Camera className="h-10 w-10 text-purple-400 animate-pulse" />
              Action Detector 3D
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Test your physical vocabulary in front of the camera. Do the actions matching the 3D puppet instructions to score points!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Solo Mode Setup */}
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md p-6 flex flex-col justify-between gap-6">
              <CardHeader className="p-0">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-6 w-6 text-indigo-400" />
                  <CardTitle className="text-lg">Single Player</CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Mimic actions solo, progress through rounds and improve your time and accuracy.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Select Difficulty</label>
                  <div className="flex gap-2">
                    {(['beginner', 'intermediate', 'hard'] as Difficulty[]).map(diff => (
                      <Button
                        key={diff}
                        size="sm"
                        variant="outline"
                        onClick={() => setDifficulty(diff)}
                        className={cn(
                          "flex-1 capitalize text-xs font-bold border-slate-800",
                          difficulty === diff ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-950/40 text-slate-400"
                        )}
                      >
                        {diff}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Rounds Count</label>
                  <div className="flex gap-2">
                    {[10, 20, 30].map(rounds => (
                      <Button
                        key={rounds}
                        size="sm"
                        variant="outline"
                        onClick={() => setRoundsCount(rounds)}
                        className={cn(
                          "flex-1 text-xs font-bold border-slate-800",
                          roundsCount === rounds ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-950/40 text-slate-400"
                        )}
                      >
                        {rounds} Rounds
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-0">
                <Button onClick={startGameSingle} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold uppercase py-5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <Play className="h-4 w-4" /> Start Solo Mission
                </Button>
              </CardFooter>
            </Card>

            {/* Battle Mode Setup */}
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md p-6 flex flex-col justify-between gap-6">
              <CardHeader className="p-0">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-lg">2-Player Duel</CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Invite a friend to join a real-time lobby. The player to complete each pose fastest scores the round point!
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Your Nickname</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={15}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codeVal}
                      onChange={(e) => setCodeVal(e.target.value)}
                      maxLength={5}
                      placeholder="5-LETTER CODE"
                      className="w-1/2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-slate-200 uppercase outline-none focus:border-purple-500 transition-all"
                    />
                    <Button onClick={() => handleJoinRoom(codeVal)} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-xl">
                      Join Room
                    </Button>
                  </div>
                  <span className="text-[10px] text-slate-500 text-center font-bold">OR</span>
                  <Button onClick={handleCreateRoom} variant="outline" className="w-full bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs font-black uppercase rounded-xl py-4">
                    Create Invite Room
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="p-0">
                <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-2.5 w-full flex items-center justify-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-slate-500 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-[10px] text-slate-400">Uses AdSense profile configurations.</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Instructions Modal button */}
          <Button onClick={() => setGameState('instructions')} variant="ghost" className="text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 mx-auto">
            <HelpCircle className="h-4 w-4" /> How to Play instructions
          </Button>
        </div>
      )}

      {/* ── INSTRUCTIONS LOBBY ── */}
      {gameState === 'instructions' && (
        <Card className="relative z-10 max-w-xl mx-auto my-auto p-6 bg-slate-900/80 border-slate-800 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-center uppercase tracking-wider font-mono text-purple-400">Action Detector Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span> 
                Setup your Space
              </h3>
              <p className="text-xs text-slate-400 pl-7">
                Stand back from your webcam so that your head, shoulders, and arms are clearly visible in the preview block. Ensure you are in a well-lit room.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span> 
                Single Player Mode
              </h3>
              <p className="text-xs text-slate-400 pl-7">
                Watch the 3D puppet robot in the center. Read the target action (e.g., "Raise Left Hand") and move your limbs into the highlighted camera regions. Keep doing the action until your detection progress ring fills to 100%!
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span> 
                2-Player Duel Match
              </h3>
              <p className="text-xs text-slate-400 pl-7">
                Invite a friend by sharing the 5-letter room code. Once both players join the lobby, the host launches the battle. Both of you will see the same target action. The player to complete the action first wins the round and earns 100 points!
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span> 
                Help & Corrections
              </h3>
              <p className="text-xs text-slate-400 pl-7">
                If the camera detects partial motion, your progress ring will fill. If you struggle or make incorrect poses, a glowing Tip Bulb will appear with step-by-step guidance!
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-0 pt-4 flex gap-3">
            <Button onClick={() => setGameState('idle')} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase rounded-xl py-3">
              I'm Ready to Play!
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ── MULTIPLAYER LOBBY SCREEN ── */}
      {gameState === 'playing' && gameMode === 'multi' && multiplayerState === 'lobby' && (
        <div className="relative z-10 max-w-md mx-auto my-auto p-4 w-full">
          <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md p-6 flex flex-col gap-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Multiplayer Room</span>
              <h2 className="text-2xl font-black text-slate-100">Waiting for Duel</h2>
              <div className="bg-slate-950 border border-slate-850 py-3 rounded-2xl flex flex-col items-center gap-1 justify-center mt-3 cursor-pointer hover:border-purple-500/40 transition-all" onClick={() => {
                navigator.clipboard.writeText(roomCode);
                toast({ title: "Copied!", description: "Room code copied to clipboard." });
              }}>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Room Code</span>
                <span className="text-3xl font-black tracking-widest font-mono text-purple-300 flex items-center gap-2">
                  {roomCode} <Copy className="h-4 w-4 text-slate-500" />
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connected Players ({roomPlayers.length}/2)</h3>
              <div className="space-y-2">
                {roomPlayers.map((p, i) => (
                  <div key={p.uid || i} className="bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-purple-500/10 text-purple-400 p-1.5 rounded-lg border border-purple-500/20">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-200">{p.name} {p.isHost && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-black ml-1">HOST</span>}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-bold text-slate-500 uppercase">Ready</Badge>
                  </div>
                ))}
                {roomPlayers.length < 2 && (
                  <div className="bg-slate-950/20 border border-dashed border-slate-800 px-4 py-6 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                    <Users className="h-8 w-8 text-slate-700 animate-pulse" />
                    <span className="text-xs text-slate-500 font-bold">Waiting for second player to connect...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-800/60 pt-4">
              <Button onClick={handleLeaveRoom} variant="outline" className="flex-1 bg-slate-950 border-slate-800 text-slate-400 text-xs font-bold uppercase rounded-xl">
                <LogOut className="h-4 w-4 mr-1.5" /> Leave Lobby
              </Button>
              {isHost && (
                <Button onClick={handleStartMultiGame} disabled={roomPlayers.length < 2} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-black uppercase rounded-xl">
                  <Play className="h-4 w-4 mr-1.5" /> Launch Duel
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── PLAYING HUD & DUAL CANVAS ── */}
      {gameState === 'playing' && (gameMode === 'single' || (gameMode === 'multi' && multiplayerState === 'playing')) && (
        <div className="relative z-10 w-full h-full flex flex-col flex-grow p-4 gap-4">
          
          {/* Header HUD */}
          <div className="flex items-center justify-between gap-4 bg-slate-950/80 border border-slate-850 p-3 rounded-2xl backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3">
              <button 
                onClick={exitGame} 
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/50 transition-all duration-200"
                title="Exit Game"
              >
                <LogOut className="h-4 w-4" />
              </button>
              {onToggleFullscreen && (
                <button 
                  onClick={onToggleFullscreen} 
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 hover:border-indigo-900/50 transition-all duration-200"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              )}
              <div>
                <h2 className="font-mono text-[9px] text-purple-400 font-black uppercase tracking-widest">
                  {gameMode === 'single' ? 'Solo Mode' : `Battle Duel • Room ${roomCode}`}
                </h2>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Round {currentRoundIdx + 1} of {roundsCount}</span>
                  <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 border-slate-800 text-slate-400">
                    {difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Scoreboard HUD */}
            <div className="flex items-center gap-4">
              {gameMode === 'single' ? (
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Score</span>
                  <p className="text-lg font-black text-indigo-400 font-mono tabular-nums leading-none">{score.toLocaleString()}</p>
                </div>
              ) : (
                <div className="flex gap-4">
                  {roomPlayers.map(p => (
                    <div key={p.uid} className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-bold leading-none truncate max-w-[80px] block">
                        {p.name} {p.uid === myUid && ' (You)'}
                      </span>
                      <p className={cn(
                        "text-sm font-black font-mono tabular-nums leading-none",
                        p.uid === myUid ? "text-purple-300" : "text-slate-400"
                      )}>{p.score || 0} pts</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Prompt Card */}
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center md:text-left flex-grow">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">Current Action Requirement</span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center justify-center md:justify-start gap-2">
                <Activity className="h-6 w-6 text-purple-400 animate-pulse" />
                {activeAction?.name || 'Loading...'}
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">{activeAction?.desc}</p>
            </div>

            {/* Progress Circle overlay */}
            <div className="relative shrink-0 flex items-center justify-center w-20 h-20 bg-slate-900 rounded-full border border-slate-800">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="rgba(147, 51, 234, 0.1)" strokeWidth="4" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#a855f7"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={176}
                  strokeDashoffset={176 - (176 * detectionProgress) / 100}
                  className="transition-all duration-200"
                />
              </svg>
              <div className="absolute font-black text-xs font-mono">{Math.floor(detectionProgress)}%</div>
            </div>
          </div>

          {/* Dual Panel Split: Camera + 3D puppet */}
          <div className="grid md:grid-cols-2 gap-6 flex-grow relative min-h-[320px]">
            {/* 3D Puppet viewport */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-850 flex flex-col justify-end aspect-[4/3] w-full h-full min-h-[260px] md:min-h-[360px] shadow-lg">
              <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full" />
              <div className="relative z-10 bg-slate-950/80 border-t border-slate-850/40 p-3 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-500 font-bold uppercase tracking-wider">3D Mimic Instructions</span>
                <Badge variant="outline" className="bg-purple-950/30 border-purple-500/30 text-purple-300 font-black animate-pulse">Puppet Guidance</Badge>
              </div>
            </div>

            {/* Camera input viewport */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-850 bg-slate-950 flex items-center justify-center aspect-[4/3] w-full h-full min-h-[260px] md:min-h-[360px] shadow-lg">
              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto animate-bounce" />
                  <p className="text-xs text-slate-400 max-w-xs">{cameraError}</p>
                  <Button onClick={startCamera} size="sm" className="bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase text-[10px] rounded-lg">
                    Retry Permissions
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mirrored webcam feed */}
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] z-0"
                  />
                  <canvas ref={canvasRef} className="hidden" width="32" height="24" />

                  {/* Active overlays matching targeted regions */}
                  <div className="absolute inset-0 z-10 grid grid-cols-3 grid-rows-3 gap-2 p-2 pointer-events-none">
                    {/* Top Left */}
                    <div className={cn(
                      "rounded-xl border-2 transition-all duration-300",
                      activeAction?.regions.includes('top_left')
                        ? (activeRegions.top_left ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse" : "border-purple-500/40 bg-purple-500/5")
                        : "border-transparent"
                    )}>
                      {activeAction?.regions.includes('top_left') && (
                        <div className="p-1 text-[8px] font-black uppercase text-purple-300 tracking-wider">L Region</div>
                      )}
                    </div>
                    {/* Top Mid */}
                    <div className="border-transparent" />
                    {/* Top Right */}
                    <div className={cn(
                      "rounded-xl border-2 transition-all duration-300",
                      activeAction?.regions.includes('top_right')
                        ? (activeRegions.top_right ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse" : "border-purple-500/40 bg-purple-500/5")
                        : "border-transparent"
                    )}>
                      {activeAction?.regions.includes('top_right') && (
                        <div className="p-1 text-[8px] font-black uppercase text-purple-300 tracking-wider text-right">R Region</div>
                      )}
                    </div>

                    {/* Mid Left */}
                    <div className={cn(
                      "rounded-xl border-2 transition-all duration-300",
                      activeAction?.regions.includes('mid_left')
                        ? (activeRegions.mid_left ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse" : "border-purple-500/40 bg-purple-500/5")
                        : "border-transparent"
                    )} />
                    {/* Center */}
                    <div className={cn(
                      "rounded-xl border-2 transition-all duration-300",
                      activeAction?.regions.includes('center')
                        ? (activeRegions.center ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse" : "border-purple-500/40 bg-purple-500/5")
                        : "border-transparent"
                    )} />
                    {/* Mid Right */}
                    <div className={cn(
                      "rounded-xl border-2 transition-all duration-300",
                      activeAction?.regions.includes('mid_right')
                        ? (activeRegions.mid_right ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse" : "border-purple-500/40 bg-purple-500/5")
                        : "border-transparent"
                    )} />

                    {/* Bottom Left */}
                    <div className="border-transparent" />
                    {/* Bottom Mid */}
                    <div className={cn(
                      "rounded-xl border-2 transition-all duration-300",
                      activeAction?.regions.includes('bottom_mid')
                        ? (activeRegions.bottom_mid ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse" : "border-purple-500/40 bg-purple-500/5")
                        : "border-transparent"
                    )}>
                      {activeAction?.regions.includes('bottom_mid') && (
                        <div className="p-1 text-[8px] font-black uppercase text-purple-300 tracking-wider text-center mt-auto">Squat Zone</div>
                      )}
                    </div>
                    {/* Bottom Right */}
                    <div className="border-transparent" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tips Guidance Overlay */}
          <AnimatePresence>
            {showTip && activeAction && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-start gap-3 backdrop-blur-sm">
                <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider font-mono">Correction Tip</span>
                  <p className="text-xs text-amber-200">{activeAction.tip}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── VICTORY & SUMMARY SCREEN ── */}
      {gameState === 'finished' && (
        <div className="relative z-10 max-w-md mx-auto my-auto p-4 w-full">
          <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md p-6 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <Trophy className="h-16 w-16 text-amber-400 animate-bounce" />
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase text-slate-100">Battle Finished!</h2>
              <p className="text-xs text-slate-400">All rounds completed. High score registered.</p>
            </div>

            {/* Score summary panel */}
            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl w-full">
              {gameMode === 'single' ? (
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Your Score</span>
                  <p className="text-4xl font-mono font-black text-indigo-400">{score.toLocaleString()}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Results Standings</span>
                  <div className="space-y-2">
                    {[...roomPlayers].sort((a,b) => b.score - a.score).map((p, i) => (
                      <div key={p.uid} className={cn(
                        "flex items-center justify-between border px-4 py-2.5 rounded-xl",
                        i === 0 ? "border-amber-500/20 bg-amber-500/[0.02]" : "border-slate-800 bg-slate-950/40"
                      )}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-slate-500">#{i+1}</span>
                          <span className="text-xs font-bold text-slate-200">{p.name} {p.uid === myUid && ' (You)'}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-purple-300">{p.score || 0} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={exitGame} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold uppercase rounded-xl py-4 flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" /> Exit to Games Lobby
            </Button>
          </Card>
        </div>
      )}

      {/* Floating local notifications */}
      {localToast && (
        <div className="absolute bottom-5 right-5 z-50 animate-slide-in pointer-events-none">
          <div className={cn(
            "p-4 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md max-w-sm",
            localToast.variant === 'destructive' ? "bg-rose-950/90 border-rose-500 text-rose-200" : "bg-slate-900/90 border-slate-800 text-slate-200"
          )}>
            {localToast.variant === 'destructive' ? (
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            )}
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider">{localToast.title}</h4>
              <p className="text-[10px] opacity-80 leading-normal">{localToast.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
