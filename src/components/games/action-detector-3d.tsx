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
  {
    id: 'reach_sky',
    name: 'Reach for the Sky',
    desc: 'Reach both arms up high towards the clouds!',
    tip: 'Stretch both hands into the top-left and top-right zones.',
    regions: ['top_left', 'top_right'],
    animation: 'reach_sky',
    difficulty: ['beginner', 'intermediate', 'hard']
  },
  {
    id: 'peace_out',
    name: 'Peace Sign Pose',
    desc: 'Hold your hand up in a victory peace sign!',
    tip: 'Raise your right hand into the upper-left region.',
    regions: ['top_left'],
    animation: 'peace_out',
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
    id: 'victory_v',
    name: 'Victory V Pose',
    desc: 'Raise both arms high in a proud V shape!',
    tip: 'Extend arms diagonally up into top-left and top-right.',
    regions: ['top_left', 'top_right'],
    animation: 'victory_v',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'flex_biceps',
    name: 'Double Bicep Flex',
    desc: 'Flex both arms at 90 degrees like a champion!',
    tip: 'Raise elbows to shoulder height and flex hands into the top zones.',
    regions: ['top_left', 'top_right', 'center'],
    animation: 'flex_biceps',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'cross_arms',
    name: 'Crossed Arms Guard',
    desc: 'Cross both arms tightly across your chest!',
    tip: 'Keep your arms crossed over your chest in the center zone.',
    regions: ['center'],
    animation: 'cross_arms',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'hands_on_head',
    name: 'Hands Behind Head',
    desc: 'Place both hands behind your head!',
    tip: 'Lift both elbows wide and place hands at top-left and top-right.',
    regions: ['top_left', 'top_right', 'center'],
    animation: 'hands_on_head',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'right_hand_chest',
    name: 'Right Hand Over Heart',
    desc: 'Place your right hand over your chest!',
    tip: 'Move your right hand to your upper chest region.',
    regions: ['center', 'mid_left'],
    animation: 'right_hand_chest',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'left_hand_chest',
    name: 'Left Hand Over Heart',
    desc: 'Place your left hand over your chest!',
    tip: 'Move your left hand to your upper chest region.',
    regions: ['center', 'mid_right'],
    animation: 'left_hand_chest',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'clapping_high',
    name: 'High Overhead Clap',
    desc: 'Clap both hands together high above your head!',
    tip: 'Bring both hands together in the top-center zone.',
    regions: ['top_left', 'top_right', 'center'],
    animation: 'clapping_high',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'touch_shoulders',
    name: 'Touch Shoulders',
    desc: 'Touch your fingers to your shoulders!',
    tip: 'Bend your elbows and place hands near shoulder level.',
    regions: ['mid_left', 'mid_right', 'center'],
    animation: 'touch_shoulders',
    difficulty: ['intermediate', 'hard']
  },
  {
    id: 'zombie_walk',
    name: 'Zombie Arms Forward',
    desc: 'Extend both arms straight out in front of you!',
    tip: 'Hold both arms parallel forward into the center region.',
    regions: ['center', 'mid_left', 'mid_right'],
    animation: 'zombie_walk',
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
    id: 'superhero_landing',
    name: 'Hero Crouch Stance',
    desc: 'Crouch low with one arm guarding high!',
    tip: 'Get low in the center-bottom and hold your guard.',
    regions: ['bottom_mid', 'center'],
    animation: 'superhero_landing',
    difficulty: ['hard']
  },
  {
    id: 'airplane_left',
    name: 'Airplane Tilt Left',
    desc: 'Extend arms wide and tilt your body to the left!',
    tip: 'Keep arms parallel and lean your upper body into top-left.',
    regions: ['mid_left', 'top_left', 'bottom_mid'],
    animation: 'airplane_left',
    difficulty: ['hard']
  },
  {
    id: 'airplane_right',
    name: 'Airplane Tilt Right',
    desc: 'Extend arms wide and tilt your body to the right!',
    tip: 'Keep arms parallel and lean your upper body into top-right.',
    regions: ['mid_right', 'top_right', 'bottom_mid'],
    animation: 'airplane_right',
    difficulty: ['hard']
  },
  {
    id: 'bow_down',
    name: 'Respectful Bow',
    desc: 'Bend forward at the waist in a deep bow!',
    tip: 'Hinge forward into the lower center region.',
    regions: ['center', 'bottom_mid'],
    animation: 'bow_down',
    difficulty: ['hard']
  },
  {
    id: 'sumo_squat',
    name: 'Sumo Squat Stance',
    desc: 'Take a wide squat with elbows bent out!',
    tip: 'Lower your hips wide into bottom-mid while holding elbows wide.',
    regions: ['bottom_mid', 'mid_left', 'mid_right'],
    animation: 'sumo_squat',
    difficulty: ['hard']
  },
  {
    id: 'archery_right',
    name: 'Bow & Arrow Right',
    desc: 'Pull back an imaginary bow pointing right!',
    tip: 'Extend left hand into top-right and pull right elbow back.',
    regions: ['mid_right', 'top_left'],
    animation: 'archery_right',
    difficulty: ['hard']
  },
  {
    id: 'archery_left',
    name: 'Bow & Arrow Left',
    desc: 'Pull back an imaginary bow pointing left!',
    tip: 'Extend right hand into top-left and pull left elbow back.',
    regions: ['mid_left', 'top_right'],
    animation: 'archery_left',
    difficulty: ['hard']
  },
  {
    id: 'tree_balance_left',
    name: 'Tree Balance Left',
    desc: 'Balance on your right leg with hands high!',
    tip: 'Stand centered and hold hands overhead in top regions.',
    regions: ['bottom_mid', 'center'],
    animation: 'tree_balance_left',
    difficulty: ['hard']
  },
  {
    id: 'tree_balance_right',
    name: 'Tree Balance Right',
    desc: 'Balance on your left leg with hands high!',
    tip: 'Stand centered and hold hands overhead in top regions.',
    regions: ['bottom_mid', 'center'],
    animation: 'tree_balance_right',
    difficulty: ['hard']
  },
  {
    id: 'cheerleader_t',
    name: 'Touchdown High Arms',
    desc: 'Raise both arms straight up in parallel!',
    tip: 'Reach straight up into top-left and top-right.',
    regions: ['top_left', 'top_right'],
    animation: 'cheerleader_t',
    difficulty: ['hard']
  },
  {
    id: 'side_stretch_left',
    name: 'Side Stretch Left',
    desc: 'Reach your right arm overhead to the left side!',
    tip: 'Reach right hand deep into the top-left region.',
    regions: ['top_left', 'mid_left'],
    animation: 'side_stretch_left',
    difficulty: ['hard']
  },
  {
    id: 'side_stretch_right',
    name: 'Side Stretch Right',
    desc: 'Reach your left arm overhead to the right side!',
    tip: 'Reach left hand deep into the top-right region.',
    regions: ['top_right', 'mid_right'],
    animation: 'side_stretch_right',
    difficulty: ['hard']
  },
  {
    id: 'x_factor',
    name: 'X Pose',
    desc: 'Spread arms and legs out to form a giant X!',
    tip: 'Extend hands into top-left & top-right and feet wide.',
    regions: ['top_left', 'top_right', 'bottom_mid'],
    animation: 'x_factor',
    difficulty: ['hard']
  },
  {
    id: 'thinker_pose',
    name: 'The Thinker Pose',
    desc: 'Rest your chin on your fist in deep thought!',
    tip: 'Lean forward low in the center zone.',
    regions: ['center', 'bottom_mid'],
    animation: 'thinker_pose',
    difficulty: ['hard']
  },
  {
    id: 'ninja_kick',
    name: 'Ninja Flying Kick',
    desc: 'Kick one leg high into the side region!',
    tip: 'Extend your kick into the lower and side region.',
    regions: ['bottom_mid', 'mid_right'],
    animation: 'ninja_kick',
    difficulty: ['hard']
  },
  {
    id: 'crown_pose',
    name: 'Crown On Head',
    desc: 'Place both hands above your head like a crown!',
    tip: 'Join hands at the top center of your head.',
    regions: ['top_left', 'top_right', 'center'],
    animation: 'crown_pose',
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
            title: data.lastRoundWinner === 'Skipped' ? `Round Skipped ⏩` : `Round Complete! 🎉`,
            description: data.lastRoundWinner === 'Skipped' ? `The action was skipped by players.` : `${data.lastRoundWinner} completed the action first!`,
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

  const isTransitioningRef = React.useRef(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [countdownSec, setCountdownSec] = React.useState<number | null>(null);
  const progressValRef = React.useRef(0);

  const regionHoldRef = React.useRef({
    top_left: 0,
    top_right: 0,
    mid_left: 0,
    mid_right: 0,
    center: 0,
    bottom_mid: 0
  });

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const triggerRoundTransitionCooldown = (durationSec = 3, onComplete?: () => void) => {
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setCountdownSec(durationSec);

    // Reset all region hold memory, frame delta history, and motion states
    progressValRef.current = 0;
    prevPixelsRef.current = null;
    regionHoldRef.current = {
      top_left: 0,
      top_right: 0,
      mid_left: 0,
      mid_right: 0,
      center: 0,
      bottom_mid: 0
    };
    setActiveRegions({
      top_left: false,
      top_right: false,
      mid_left: false,
      mid_right: false,
      center: false,
      bottom_mid: false
    });
    setDetectionProgress(0);

    let currentSec = durationSec;
    const interval = setInterval(() => {
      currentSec -= 1;
      if (currentSec > 0) {
        setCountdownSec(currentSec);
      } else {
        clearInterval(interval);
        setCountdownSec(null);
        progressValRef.current = 0;
        prevPixelsRef.current = null;
        regionHoldRef.current = {
          top_left: 0,
          top_right: 0,
          mid_left: 0,
          mid_right: 0,
          center: 0,
          bottom_mid: 0
        };
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        if (onComplete) onComplete();
      }
    }, 1000);
  };

  // ── Custom Motion Detection Engine (Canvas Delta Tracker) ────────────
  const runMotionDetection = () => {
    if (!canvasRef.current || !videoRef.current || isTransitioningRef.current) return;
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

    const threshold = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 22;

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

    // Apply scaling factor to normalize activity thresholds & pose-hold persistence
    const triggerLimit = difficulty === 'beginner' ? 100 : difficulty === 'intermediate' ? 150 : 220;
    const holdFrames = 25; // Maintain active status for ~1.25s while holding pose still

    const hold = regionHoldRef.current;
    if (motionScores.top_left > triggerLimit) hold.top_left = holdFrames; else hold.top_left = Math.max(0, hold.top_left - 1);
    if (motionScores.top_right > triggerLimit) hold.top_right = holdFrames; else hold.top_right = Math.max(0, hold.top_right - 1);
    if (motionScores.mid_left > triggerLimit) hold.mid_left = holdFrames; else hold.mid_left = Math.max(0, hold.mid_left - 1);
    if (motionScores.mid_right > triggerLimit) hold.mid_right = holdFrames; else hold.mid_right = Math.max(0, hold.mid_right - 1);
    if (motionScores.center > triggerLimit) hold.center = holdFrames; else hold.center = Math.max(0, hold.center - 1);
    if (motionScores.bottom_mid > triggerLimit) hold.bottom_mid = holdFrames; else hold.bottom_mid = Math.max(0, hold.bottom_mid - 1);

    const activity = {
      top_left: hold.top_left > 0,
      top_right: hold.top_right > 0,
      mid_left: hold.mid_left > 0,
      mid_right: hold.mid_right > 0,
      center: hold.center > 0,
      bottom_mid: hold.bottom_mid > 0
    };

    setActiveRegions(activity);

    // Validate the current action requirements
    if (activeAction && !isTransitioningRef.current) {
      let isActionValid = true;
      activeAction.regions.forEach(reg => {
        if (!activity[reg]) {
          isActionValid = false;
        }
      });

      if (isActionValid) {
        const increment = difficulty === 'beginner' ? 12 : difficulty === 'intermediate' ? 8 : 5.5;
        progressValRef.current += increment;

        if (progressValRef.current >= 100) {
          progressValRef.current = 0;
          setDetectionProgress(0);
          handleActionSuccess();
        } else {
          setDetectionProgress(progressValRef.current);
        }
      } else {
        progressValRef.current = Math.max(0, progressValRef.current - 1.5);
        setDetectionProgress(progressValRef.current);
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
    if (isTransitioningRef.current) return;

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
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      } else {
        setCurrentRoundIdx(nextRound);
        triggerRoundTransitionCooldown(3);
      }
    } else {
      // Multiplayer progression via Firestore transaction/atomicity check
      if (!firestore || !roomCode) {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        return;
      }
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
          }
        }
      } catch (err) {
        console.error("Multiplayer round update failed:", err);
      } finally {
        triggerRoundTransitionCooldown(3);
      }
    }
  };

  const handleSkipAction = async () => {
    if (isTransitioningRef.current) return;

    audioEngine.playCorrect();
    if (gameMode === 'single') {
      const nextRound = currentRoundIdx + 1;
      if (nextRound >= roundsCount) {
        setGameState('finished');
        audioEngine.playLevelSuccess();
        stopCamera();
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      } else {
        setCurrentRoundIdx(nextRound);
        triggerRoundTransitionCooldown(3);
      }
    } else {
      if (!firestore || !roomCode) {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        return;
      }
      const roomRef = doc(firestore, "stats", "am_room_" + roomCode);
      try {
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.currentRound === currentRoundIdx && data.status === 'playing') {
            const nextRound = currentRoundIdx + 1;
            const isLastRound = nextRound >= roundsCount;

            await updateDoc(roomRef, {
              currentRound: isLastRound ? currentRoundIdx : nextRound,
              lastRoundWinner: 'Skipped',
              status: isLastRound ? 'finished' : 'playing'
            });
          }
        }
      } catch (err) {
        console.error("Multiplayer skip failed:", err);
      } finally {
        triggerRoundTransitionCooldown(3);
      }
    }
  };

  // ── Start / Stop Game Triggers ──────────────────────────────────────
  const startGameSingle = () => {
    // Shuffle and pick actions based on difficulty and rounds count
    const filtered = ACTION_DATABASE.filter(act => act.difficulty.includes(difficulty));
    const shuffled = shuffleArray(filtered);
    const list: ActionItem[] = [];
    for (let i = 0; i < roundsCount; i++) {
      list.push(shuffled[i % shuffled.length]);
    }
    setActiveActions(list);
    setGameMode('single');
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
    const shuffled = shuffleArray(filtered);
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
      setGameMode('multi');
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
      setGameMode('multi');
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
    setGameMode('single');
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
    scene.background = new THREE.Color(0x050716);
    scene.fog = new THREE.FogExp2(0x050716, 0.04);
    robotRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.8, 5.5);
    camera.lookAt(0, 1.2, 0);
    robotRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    robotRef.current.renderer = renderer;

    // Advanced Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xe0e7ff, 0x0f172a, 0.7);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const purpleRimLight = new THREE.PointLight(0xc084fc, 4, 10);
    purpleRimLight.position.set(-2, 3, -1);
    scene.add(purpleRimLight);

    const cyanRimLight = new THREE.PointLight(0x06b6d4, 3, 10);
    cyanRimLight.position.set(2, 2, 2);
    scene.add(cyanRimLight);

    // Floor Platform & Grid
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.7, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.9 })
    );
    platform.position.y = -0.08;
    scene.add(platform);

    const grid = new THREE.GridHelper(3.2, 14, 0xc084fc, 0x1e293b);
    grid.position.y = 0.001;
    scene.add(grid);

    // Humanoid Puppet Assembly (Articulated High-Detail Model)
    const puppet = new THREE.Group();
    scene.add(puppet);
    robotRef.current.puppet = puppet;

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.2,
      roughness: 0.25,
      metalness: 0.75
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.9
    });

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xe0e7ff,
      emissive: 0xa855f7,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });

    // ── Torso (Chest & Waist Armor) ──
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.1;
    puppet.add(torsoGroup);
    robotRef.current.torso = torsoGroup as any;

    // Upper Chest Armor
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.55, 0.36), bodyMat);
    chest.position.y = 0.25;
    torsoGroup.add(chest);

    // Chest Core Reactor Emblem
    const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 24), glowMat);
    reactor.rotation.x = Math.PI * 0.5;
    reactor.position.set(0, 0.28, 0.19);
    torsoGroup.add(reactor);

    // Lower Waist / Abdomen
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.38, 16), jointMat);
    waist.position.y = -0.15;
    torsoGroup.add(waist);

    // Pelvis Hip Armor
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.2, 0.34), bodyMat);
    pelvis.position.y = -0.38;
    torsoGroup.add(pelvis);

    // ── Head & Visor ──
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.85, 0);
    puppet.add(headGroup);
    robotRef.current.head = headGroup as any;

    // Skull
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), bodyMat);
    headGroup.add(skull);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 16), jointMat);
    neck.position.y = -0.22;
    headGroup.add(neck);

    // Visor Mask (Glowing Arc)
    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.14, 24, 1, false, -Math.PI * 0.4, Math.PI * 0.8),
      glowMat
    );
    visor.rotation.y = Math.PI * 0.5;
    visor.position.set(0, 0.02, 0.02);
    headGroup.add(visor);

    // ── Shoulders & Arms ──
    // Right Arm Pivot
    const rightArm = new THREE.Group();
    rightArm.position.set(-0.44, 1.55, 0);
    puppet.add(rightArm);
    robotRef.current.rightArm = rightArm;

    const rightShoulderPad = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), jointMat);
    rightArm.add(rightShoulderPad);

    const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.42, 16), bodyMat);
    rightUpperArm.position.y = -0.24;
    rightArm.add(rightUpperArm);

    const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), jointMat);
    rightElbow.position.y = -0.48;
    rightArm.add(rightElbow);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 16), bodyMat);
    rightForearm.position.y = -0.72;
    rightArm.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.06), jointMat);
    rightHand.position.y = -0.96;
    rightArm.add(rightHand);

    // Left Arm Pivot
    const leftArm = new THREE.Group();
    leftArm.position.set(0.44, 1.55, 0);
    puppet.add(leftArm);
    robotRef.current.leftArm = leftArm;

    const leftShoulderPad = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), jointMat);
    leftArm.add(leftShoulderPad);

    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.42, 16), bodyMat);
    leftUpperArm.position.y = -0.24;
    leftArm.add(leftUpperArm);

    const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), jointMat);
    leftElbow.position.y = -0.48;
    leftArm.add(leftElbow);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 16), bodyMat);
    leftForearm.position.y = -0.72;
    leftArm.add(leftForearm);

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.06), jointMat);
    leftHand.position.y = -0.96;
    leftArm.add(leftHand);

    // ── Hips & Legs ──
    // Right Leg Pivot
    const rightLeg = new THREE.Group();
    rightLeg.position.set(-0.22, 0.6, 0);
    puppet.add(rightLeg);
    robotRef.current.rightLeg = rightLeg;

    const rightHip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), jointMat);
    rightLeg.add(rightHip);

    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.45, 16), bodyMat);
    rightThigh.position.y = -0.26;
    rightLeg.add(rightThigh);

    const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), jointMat);
    rightKnee.position.y = -0.51;
    rightLeg.add(rightKnee);

    const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.42, 16), bodyMat);
    rightCalf.position.y = -0.74;
    rightLeg.add(rightCalf);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.26), jointMat);
    rightFoot.position.set(0, -0.98, 0.06);
    rightLeg.add(rightFoot);

    // Left Leg Pivot
    const leftLeg = new THREE.Group();
    leftLeg.position.set(0.22, 0.6, 0);
    puppet.add(leftLeg);
    robotRef.current.leftLeg = leftLeg;

    const leftHip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), jointMat);
    leftLeg.add(leftHip);

    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.45, 16), bodyMat);
    leftThigh.position.y = -0.26;
    leftLeg.add(leftThigh);

    const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), jointMat);
    leftKnee.position.y = -0.51;
    leftLeg.add(leftKnee);

    const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.42, 16), bodyMat);
    leftCalf.position.y = -0.74;
    leftLeg.add(leftCalf);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.26), jointMat);
    leftFoot.position.set(0, -0.98, 0.06);
    leftLeg.add(leftFoot);

    const clock = new THREE.Clock();

    const animateThree = () => {
      robotRef.current.requestFrameId = requestAnimationFrame(animateThree);
      const time = clock.getElapsedTime();
      const actionId = activeAction?.id || 'idle';

      // Reset base poses
      if (puppet) puppet.position.set(0, 0, 0);
      if (torsoGroup) { torsoGroup.rotation.set(0, 0, 0); torsoGroup.position.set(0, 1.1, 0); }
      if (headGroup) headGroup.rotation.set(0, 0, 0);
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
          torsoGroup.rotation.z = 0.25;
          headGroup.rotation.z = 0.1;
          leftArm.rotation.z = Math.PI * 0.2;
          break;
        case 'lean_right':
          torsoGroup.rotation.z = -0.25;
          headGroup.rotation.z = -0.1;
          rightArm.rotation.z = -Math.PI * 0.2;
          break;
        case 'hands_on_hips':
          leftArm.rotation.z = Math.PI * 0.15;
          leftArm.rotation.x = -Math.PI * 0.1;
          rightArm.rotation.z = -Math.PI * 0.15;
          rightArm.rotation.x = -Math.PI * 0.1;
          break;
        case 'look_up':
          headGroup.rotation.x = -0.4;
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
        case 'reach_sky':
          leftArm.rotation.z = Math.PI * 0.95;
          rightArm.rotation.z = -Math.PI * 0.95;
          puppet.position.y = 0.05 + Math.sin(time * 3) * 0.04;
          break;
        case 'peace_out':
          rightArm.rotation.z = -Math.PI * 0.8;
          rightArm.rotation.y = -Math.PI * 0.2;
          headGroup.rotation.z = -0.1;
          break;
        case 'victory_v':
          leftArm.rotation.z = Math.PI * 0.7;
          rightArm.rotation.z = -Math.PI * 0.7;
          torsoGroup.position.y = 1.15;
          break;
        case 'flex_biceps':
          leftArm.rotation.z = Math.PI * 0.45;
          leftArm.rotation.y = Math.PI * 0.4;
          rightArm.rotation.z = -Math.PI * 0.45;
          rightArm.rotation.y = -Math.PI * 0.4;
          break;
        case 'cross_arms':
          leftArm.rotation.x = -Math.PI * 0.4;
          leftArm.rotation.y = -Math.PI * 0.3;
          rightArm.rotation.x = -Math.PI * 0.4;
          rightArm.rotation.y = Math.PI * 0.3;
          break;
        case 'hands_on_head':
          leftArm.rotation.z = Math.PI * 0.8;
          leftArm.rotation.y = -Math.PI * 0.4;
          rightArm.rotation.z = -Math.PI * 0.8;
          rightArm.rotation.y = Math.PI * 0.4;
          break;
        case 'right_hand_chest':
          rightArm.rotation.z = -Math.PI * 0.35;
          rightArm.rotation.x = -Math.PI * 0.3;
          rightArm.rotation.y = -Math.PI * 0.4;
          leftArm.rotation.z = 0.1;
          break;
        case 'left_hand_chest':
          leftArm.rotation.z = Math.PI * 0.35;
          leftArm.rotation.x = -Math.PI * 0.3;
          leftArm.rotation.y = Math.PI * 0.4;
          rightArm.rotation.z = -0.1;
          break;
        case 'clapping_high':
          leftArm.rotation.z = Math.PI * 0.8;
          leftArm.rotation.y = -Math.PI * 0.2;
          rightArm.rotation.z = -Math.PI * 0.8;
          rightArm.rotation.y = Math.PI * 0.2;
          break;
        case 'touch_shoulders':
          leftArm.rotation.z = Math.PI * 0.35;
          leftArm.rotation.x = -Math.PI * 0.5;
          rightArm.rotation.z = -Math.PI * 0.35;
          rightArm.rotation.x = -Math.PI * 0.5;
          break;
        case 'zombie_walk':
          leftArm.rotation.x = -Math.PI * 0.48;
          rightArm.rotation.x = -Math.PI * 0.48;
          headGroup.rotation.y = Math.sin(time * 3) * 0.15;
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
        case 'superhero_landing':
          puppet.position.y = -0.3;
          torsoGroup.rotation.x = Math.PI * 0.3;
          rightArm.rotation.x = -Math.PI * 0.5;
          leftArm.rotation.z = Math.PI * 0.3;
          leftLeg.rotation.x = -Math.PI * 0.4;
          rightLeg.rotation.x = -Math.PI * 0.1;
          break;
        case 'airplane_left':
          torsoGroup.rotation.z = 0.35;
          leftArm.rotation.z = Math.PI * 0.5;
          rightArm.rotation.z = -Math.PI * 0.5;
          headGroup.rotation.z = 0.1;
          break;
        case 'airplane_right':
          torsoGroup.rotation.z = -0.35;
          leftArm.rotation.z = Math.PI * 0.5;
          rightArm.rotation.z = -Math.PI * 0.5;
          headGroup.rotation.z = -0.1;
          break;
        case 'bow_down':
          torsoGroup.rotation.x = Math.PI * 0.35;
          headGroup.rotation.x = Math.PI * 0.1;
          leftArm.rotation.x = -Math.PI * 0.15;
          rightArm.rotation.x = -Math.PI * 0.15;
          break;
        case 'sumo_squat':
          puppet.position.y = -0.25;
          leftLeg.rotation.z = Math.PI * 0.25;
          rightLeg.rotation.z = -Math.PI * 0.25;
          leftArm.rotation.z = Math.PI * 0.35;
          rightArm.rotation.z = -Math.PI * 0.35;
          break;
        case 'archery_right':
          leftArm.rotation.z = Math.PI * 0.48;
          rightArm.rotation.x = -Math.PI * 0.35;
          rightArm.rotation.y = -Math.PI * 0.5;
          torsoGroup.rotation.y = -Math.PI * 0.25;
          break;
        case 'archery_left':
          rightArm.rotation.z = -Math.PI * 0.48;
          leftArm.rotation.x = -Math.PI * 0.35;
          leftArm.rotation.y = Math.PI * 0.5;
          torsoGroup.rotation.y = Math.PI * 0.25;
          break;
        case 'tree_balance_left':
          leftLeg.rotation.z = Math.PI * 0.25;
          leftLeg.rotation.x = -Math.PI * 0.15;
          leftArm.rotation.z = Math.PI * 0.6;
          rightArm.rotation.z = -Math.PI * 0.6;
          break;
        case 'tree_balance_right':
          rightLeg.rotation.z = -Math.PI * 0.25;
          rightLeg.rotation.x = -Math.PI * 0.15;
          leftArm.rotation.z = Math.PI * 0.6;
          rightArm.rotation.z = -Math.PI * 0.6;
          break;
        case 'cheerleader_t':
          leftArm.rotation.z = Math.PI * 0.9;
          rightArm.rotation.z = -Math.PI * 0.9;
          torsoGroup.position.y = 1.15;
          break;
        case 'side_stretch_left':
          torsoGroup.rotation.z = 0.3;
          rightArm.rotation.z = Math.PI * 0.75;
          leftArm.rotation.z = 0.1;
          break;
        case 'side_stretch_right':
          torsoGroup.rotation.z = -0.3;
          leftArm.rotation.z = -Math.PI * 0.75;
          rightArm.rotation.z = -0.1;
          break;
        case 'x_factor':
          leftArm.rotation.z = Math.PI * 0.65;
          rightArm.rotation.z = -Math.PI * 0.65;
          leftLeg.rotation.z = Math.PI * 0.2;
          rightLeg.rotation.z = -Math.PI * 0.2;
          break;
        case 'thinker_pose':
          puppet.position.y = -0.2;
          torsoGroup.rotation.x = Math.PI * 0.25;
          rightArm.rotation.x = -Math.PI * 0.5;
          rightArm.rotation.y = -Math.PI * 0.3;
          headGroup.rotation.x = Math.PI * 0.2;
          break;
        case 'ninja_kick':
          rightLeg.rotation.z = -Math.PI * 0.45;
          leftLeg.rotation.z = Math.PI * 0.1;
          puppet.position.y = 0.15;
          leftArm.rotation.z = Math.PI * 0.3;
          rightArm.rotation.z = -Math.PI * 0.5;
          break;
        case 'crown_pose':
          leftArm.rotation.z = Math.PI * 0.85;
          leftArm.rotation.y = -Math.PI * 0.3;
          rightArm.rotation.z = -Math.PI * 0.85;
          rightArm.rotation.y = Math.PI * 0.3;
          break;
        case 'raise_left_lean_right':
          torsoGroup.rotation.z = -0.2;
          leftArm.rotation.z = Math.PI * 0.85;
          rightArm.rotation.z = -0.1;
          break;
        case 'raise_right_lean_left':
          torsoGroup.rotation.z = 0.2;
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
          torsoGroup.rotation.y = Math.PI * 0.15;
          torsoGroup.rotation.z = 0.1;
          leftArm.rotation.z = Math.PI * 0.75;
          leftArm.rotation.y = -Math.PI * 0.1;
          rightArm.rotation.z = -Math.PI * 0.15;
          rightArm.rotation.x = -Math.PI * 0.35;
          headGroup.rotation.y = Math.PI * 0.25;
          break;
        case 'dab_right':
          torsoGroup.rotation.y = -Math.PI * 0.15;
          torsoGroup.rotation.z = -0.1;
          rightArm.rotation.z = -Math.PI * 0.75;
          rightArm.rotation.y = Math.PI * 0.1;
          leftArm.rotation.z = Math.PI * 0.15;
          leftArm.rotation.x = -Math.PI * 0.35;
          headGroup.rotation.y = -Math.PI * 0.25;
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
          torsoGroup.rotation.x = Math.PI * 0.2;
          torsoGroup.rotation.y = Math.PI * 0.15;
          rightArm.rotation.x = -Math.PI * 0.45;
          rightArm.rotation.y = Math.PI * 0.35;
          break;
        case 'crossover_right':
          torsoGroup.rotation.x = Math.PI * 0.2;
          torsoGroup.rotation.y = -Math.PI * 0.15;
          leftArm.rotation.x = -Math.PI * 0.45;
          leftArm.rotation.y = -Math.PI * 0.35;
          break;
        case 'helicopter':
          torsoGroup.rotation.y = Math.sin(time * 6) * 0.6;
          leftArm.rotation.z = Math.PI * 0.5;
          rightArm.rotation.z = -Math.PI * 0.5;
          break;
        case 'ninja_stance':
          puppet.position.y = -0.25;
          torsoGroup.rotation.y = Math.PI * 0.25;
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
          torsoGroup.rotation.z = 0.15;
          rightArm.rotation.z = -Math.PI * 0.75;
          leftArm.rotation.z = 0.15;
          break;
        case 'disco_right':
          torsoGroup.rotation.z = -0.15;
          leftArm.rotation.z = Math.PI * 0.75;
          rightArm.rotation.z = -0.15;
          break;
        case 'matrix_lean':
          torsoGroup.rotation.x = Math.PI * 0.3;
          puppet.position.y = -0.2;
          leftArm.rotation.x = -Math.PI * 0.2;
          rightArm.rotation.x = -Math.PI * 0.2;
          break;
        default:
          // Idle breathing
          leftArm.rotation.z = 0.1 + Math.sin(time * 2) * 0.04;
          rightArm.rotation.z = -0.1 - Math.sin(time * 2) * 0.04;
          headGroup.rotation.y = Math.sin(time * 1.5) * 0.1;
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

  const getWinnerInfo = () => {
    if (roomPlayers.length === 0) return { name: '', isTie: false };
    const sorted = [...roomPlayers].sort((a, b) => b.score - a.score);
    if (sorted.length > 1 && sorted[0].score === sorted[1].score) {
      return { name: '', isTie: true };
    }
    return { name: sorted[0].name, isTie: false, uid: sorted[0].uid };
  };
  const winnerInfo = getWinnerInfo();

  return (
    <div className={cn(
      "relative w-full flex flex-col bg-[#05060f] font-sans select-none text-slate-100 overflow-hidden",
      isFullscreen ? "h-screen p-6" : "min-h-[calc(100vh-100px)] rounded-t-3xl rounded-b-none p-4 md:p-6 border-t border-x border-slate-800/80 shadow-2xl"
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-slate-950/80 border border-slate-850 p-3 rounded-2xl backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2.5 md:gap-3 justify-between md:justify-start w-full md:w-auto">
              <div className="flex items-center gap-2">
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
              </div>
              <div className="text-right md:text-left">
                <h2 className="font-mono text-[9px] text-purple-400 font-black uppercase tracking-widest truncate max-w-[150px] md:max-w-none">
                  {gameMode === 'single' ? 'Solo Mode' : `Room ${roomCode}`}
                </h2>
                <div className="text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2 justify-end md:justify-start">
                  <span>Round {currentRoundIdx + 1}/{roundsCount}</span>
                  <Badge variant="outline" className="text-[8px] md:text-[9px] uppercase px-1.5 py-0 border-slate-800 text-slate-400">
                    {difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Scoreboard HUD */}
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t border-slate-900 md:border-none pt-2 md:pt-0">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-black md:hidden">Scoreboard</span>
              {gameMode === 'single' ? (
                <div className="text-right flex items-center gap-2 md:block">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-black hidden md:inline">Score</span>
                  <p className="text-base md:text-lg font-black text-indigo-400 font-mono tabular-nums leading-none">{score.toLocaleString()}</p>
                </div>
              ) : (
                <div className="flex gap-4">
                  {roomPlayers.map(p => (
                    <div key={p.uid} className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-bold leading-none truncate max-w-[80px] block">
                        {p.name} {p.uid === myUid && ' (You)'}
                      </span>
                      <p className={cn(
                        "text-xs md:text-sm font-black font-mono tabular-nums leading-none mt-1",
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

            <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
              <Button 
                onClick={handleSkipAction}
                variant="outline"
                className="bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-amber-950/20 hover:border-amber-900/40 text-xs font-bold uppercase rounded-xl py-3 px-4 flex items-center gap-1.5 transition-all duration-200"
              >
                <ArrowRight className="h-3.5 w-3.5" /> Skip Pose
              </Button>

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
          </div>

          {/* Dual Panel Split: Camera + 3D puppet */}
          <div className="grid md:grid-cols-2 gap-6 flex-grow relative min-h-[320px]">
            {/* 3D Puppet viewport */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-850 flex flex-col justify-end aspect-[4/3] w-full h-full min-h-[260px] md:min-h-[360px] shadow-lg">
              <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full" />
              
              {/* Round transition overlay banner with 3-second countdown */}
              <AnimatePresence>
                {isTransitioning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
                  >
                    <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-2 animate-bounce">
                      <CheckCircle className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">POSE COMPLETE! 🎉</h3>
                    <p className="text-xs font-semibold text-emerald-300 mt-0.5 mb-3">Get into position for the next action pose...</p>
                    
                    {countdownSec !== null && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Next Pose Begins In</span>
                        <motion.div
                          key={countdownSec}
                          initial={{ scale: 1.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-6xl font-black font-mono bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                        >
                          {countdownSec}
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

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
              {gameMode === 'single' ? (
                <>
                  <h2 className="text-3xl font-black uppercase bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                    Session Complete!
                  </h2>
                  <p className="text-xs text-slate-400">You successfully finished all {roundsCount} rounds.</p>
                </>
              ) : (
                <>
                  {winnerInfo.isTie ? (
                    <h2 className="text-3xl font-black uppercase bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent tracking-tight">
                      It's a Tie! 🤝
                    </h2>
                  ) : (
                    <h2 className="text-3xl font-black uppercase bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent tracking-tight">
                      Winner: {winnerInfo.name} 🏆
                    </h2>
                  )}
                  <p className="text-xs text-slate-400">
                    {winnerInfo.isTie ? "Both players scored the exact same points!" : `${winnerInfo.name} completed the most actions!`}
                  </p>
                </>
              )}
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
