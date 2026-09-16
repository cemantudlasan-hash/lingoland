'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Zap, Flame, RotateCcw, Play, Pause, Volume2, VolumeX,
  Trophy, Sparkles, Heart, Shield, ArrowUp, ArrowDown, HelpCircle,
  BookOpen, CheckCircle2, XCircle, Maximize, Minimize, Compass,
  Sliders, Award, RefreshCw, ChevronRight, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import {
  GrammarCategory,
  TenseQuestion,
  CATEGORY_INFO,
  getQuestionsForCategory,
  shuffleArray,
} from '@/lib/tense-runner-data';

// ─── Sound Synthesizer (Web Audio API) ───────────────────────────────────────
class RunnerAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // Lazy initialized on user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  public playDoubleJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  public playSlide() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } catch (e) {}
  }

  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.2, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.26);
      });
    } catch (e) {}
  }

  public playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  public playStreakUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [659.25, 783.99, 987.77, 1318.51].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.25, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.36);
      });
    } catch (e) {}
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 392, 349, 293].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.22, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.32);
      });
    } catch (e) {}
  }

  public startMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;
    this.isMusicPlaying = true;
    const bassline = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    let step = 0;
    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassline[step % bassline.length], now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
        step++;
      } catch (e) {}
    }, 220);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

// ─── Game Types & Interfaces ────────────────────────────────────────────────
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ChoiceOrb {
  x: number;
  y: number;
  radius: number;
  text: string;
  isCorrect: boolean;
  color: string;
  glowColor: string;
  collected: boolean;
  questionId: string;
  lane: 'high' | 'low';
}

interface AttemptRecord {
  question: TenseQuestion;
  userChoice: string;
  isCorrect: boolean;
  timestamp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
}

export function TenseRunner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Audio system ref
  const audioRef = useRef<RunnerAudio>(new RunnerAudio());
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Game Lifecycle States: "start" | "playing" | "paused" | "gameover"
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'gameover'>('start');
  const [selectedCategory, setSelectedCategory] = useState<GrammarCategory>('all');
  const [difficulty, setDifficulty] = useState<'normal' | 'turbo'>('normal');

  // Gameplay HUD States
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<TenseQuestion | null>(null);
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [recentNotice, setRecentNotice] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Game Engine Internal Refs
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const questionsQueueRef = useRef<TenseQuestion[]>([]);

  // Avatar State
  const playerRef = useRef({
    x: 140,
    y: 300,
    width: 38,
    height: 60,
    vy: 0,
    isGrounded: false,
    jumpCount: 0,
    maxJumps: 2,
    isSliding: false,
    slideTimer: 0,
    invincibleTimer: 0,
    runFrame: 0,
  });

  // World & Obstacles State
  const worldRef = useRef({
    scrollSpeed: 5.5,
    gravity: 0.72,
    groundY: 380,
    platforms: [] as Platform[],
    orbs: [] as ChoiceOrb[],
    particles: [] as Particle[],
    bgStars: [] as { x: number; y: number; size: number; speed: number; alpha: number }[],
    distanceMeters: 0,
    nextEncounterX: 700,
    shake: 0,
  });

  // Load high score from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lingoland_tense_runner_highscore');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch (e) {}
  }, []);

  // Sync mute with sound synthesizer
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioRef.current.setMuted(next);
    if (!next && gameState === 'playing') {
      audioRef.current.startMusic();
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Initialize Starfield
  const initStarfield = useCallback((width: number, height: number) => {
    const stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height - 120),
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
    worldRef.current.bgStars = stars;
  }, []);

  // Spawn Next Question Encounter
  const spawnQuestionEncounter = useCallback((spawnX: number) => {
    if (questionsQueueRef.current.length === 0) {
      questionsQueueRef.current = getQuestionsForCategory(selectedCategory);
    }
    const nextQ = questionsQueueRef.current.shift()!;
    setCurrentQuestion(nextQ);

    // Pick 1 wrong distractor (or 2)
    const shuffledWrongs = shuffleArray(nextQ.wrongOptions);
    const wrongChoice = shuffledWrongs[0];

    const options = [
      { text: nextQ.correctOption, isCorrect: true },
      { text: wrongChoice, isCorrect: false },
    ];
    // Randomize whether high lane is correct or low lane is correct
    const randomizedOptions = shuffleArray(options);

    const groundY = worldRef.current.groundY;
    // High Orb (Jump / Double Jump lane): around y = groundY - 140
    // Low Orb (Ground / Slide lane): around y = groundY - 30
    const orbRadius = 30;

    const newOrbs: ChoiceOrb[] = [
      {
        x: spawnX,
        y: groundY - 150,
        radius: orbRadius,
        text: randomizedOptions[0].text,
        isCorrect: randomizedOptions[0].isCorrect,
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.65)',
        collected: false,
        questionId: nextQ.id,
        lane: 'high',
      },
      {
        x: spawnX + 70,
        y: groundY - 35,
        radius: orbRadius,
        text: randomizedOptions[1].text,
        isCorrect: randomizedOptions[1].isCorrect,
        color: '#f43f5e',
        glowColor: 'rgba(244, 63, 94, 0.65)',
        collected: false,
        questionId: nextQ.id,
        lane: 'low',
      },
    ];

    worldRef.current.orbs.push(...newOrbs);
    // Schedule next encounter after 750 pixels
    worldRef.current.nextEncounterX = spawnX + 750;
  }, [selectedCategory]);

  // Reset & Start Game
  const startGame = useCallback(() => {
    // Reset state
    setScore(0);
    setDistance(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(3);
    setHistory([]);
    setRecentNotice(null);
    setGameState('playing');

    // Fresh questions pool
    questionsQueueRef.current = getQuestionsForCategory(selectedCategory);

    // Initial base speed
    const baseSpeed = difficulty === 'turbo' ? 7.2 : 5.4;
    worldRef.current.scrollSpeed = baseSpeed;
    worldRef.current.distanceMeters = 0;
    worldRef.current.nextEncounterX = 750;
    worldRef.current.orbs = [];
    worldRef.current.particles = [];
    worldRef.current.shake = 0;

    // Reset player
    const groundY = 380;
    worldRef.current.groundY = groundY;
    playerRef.current = {
      x: 140,
      y: groundY - 60,
      width: 38,
      height: 60,
      vy: 0,
      isGrounded: true,
      jumpCount: 0,
      maxJumps: 2,
      isSliding: false,
      slideTimer: 0,
      invincibleTimer: 0,
      runFrame: 0,
    };

    // Spawn first encounter
    spawnQuestionEncounter(820);

    // Start music
    if (!isMuted) {
      audioRef.current.startMusic();
    }
  }, [selectedCategory, difficulty, isMuted, spawnQuestionEncounter]);

  // Jump Action
  const handleJump = useCallback(() => {
    if (gameState !== 'playing') return;
    const player = playerRef.current;
    if (player.jumpCount < player.maxJumps) {
      player.isSliding = false;
      player.slideTimer = 0;
      if (player.jumpCount === 0) {
        player.vy = -13.6;
        audioRef.current.playJump();
      } else {
        // Double jump with flip
        player.vy = -12.4;
        audioRef.current.playDoubleJump();
        // Emit jump ring particles
        for (let i = 0; i < 10; i++) {
          worldRef.current.particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 2 + 1,
            color: '#38bdf8',
            radius: Math.random() * 3 + 1.5,
            alpha: 1,
            decay: 0.04,
          });
        }
      }
      player.jumpCount++;
      player.isGrounded = false;
    }
  }, [gameState]);

  // Slide Action (or Fast Fall in air)
  const handleSlide = useCallback(() => {
    if (gameState !== 'playing') return;
    const player = playerRef.current;
    if (player.isGrounded) {
      if (!player.isSliding) {
        player.isSliding = true;
        player.slideTimer = 25; // frames
        audioRef.current.playSlide();
      }
    } else {
      // Fast fall
      player.vy = Math.max(player.vy, 14);
      audioRef.current.playSlide();
    }
  }, [gameState]);

  // Direct Button Choice (Accessibility / Tap from HUD)
  const handleDirectChoice = useCallback((chosenText: string) => {
    if (gameState !== 'playing' || !currentQuestion) return;
    const isCorrect = chosenText.trim().toLowerCase() === currentQuestion.correctOption.trim().toLowerCase();

    // Trigger visual collection for the matching orb
    worldRef.current.orbs.forEach((orb) => {
      if (orb.questionId === currentQuestion.id && !orb.collected) {
        orb.collected = true;
      }
    });

    handleOrbCollisionResult(isCorrect, chosenText);
  }, [gameState, currentQuestion]);

  // Collision Particle Explosion
  const createBurstParticles = (x: number, y: number, color: string, count: number = 24) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      worldRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
      });
    }
  };

  // Result Handling on Orb Hit
  const handleOrbCollisionResult = (isCorrect: boolean, chosenText: string) => {
    if (!currentQuestion) return;

    // Record attempt
    setHistory((prev) => [
      {
        question: currentQuestion,
        userChoice: chosenText,
        isCorrect,
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    if (isCorrect) {
      // Sound & score
      audioRef.current.playCorrect();
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        if (next > 0 && next % 5 === 0) {
          audioRef.current.playStreakUp();
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        }
        return next;
      });

      // Calculate multiplier: 1x, 2x (3+ streak), 3x (6+ streak), 5x (10+ streak)
      const multiplier = streak >= 10 ? 5 : streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
      const pointsEarned = 100 * multiplier;
      setScore((s) => {
        const updated = s + pointsEarned;
        if (updated > highScore) {
          setHighScore(updated);
          try {
            localStorage.setItem('lingoland_tense_runner_highscore', updated.toString());
          } catch (e) {}
        }
        return updated;
      });

      setRecentNotice({
        text: `PERFECT! +${pointsEarned} (${multiplier}x Streak)`,
        isCorrect: true,
      });

      // Slight speed boost
      worldRef.current.scrollSpeed = Math.min(
        worldRef.current.scrollSpeed + 0.15,
        difficulty === 'turbo' ? 10.5 : 8.8
      );
    } else {
      // Wrong orb hit
      audioRef.current.playWrong();
      worldRef.current.shake = 18;
      playerRef.current.invincibleTimer = 45; // Invulnerable for 45 frames
      setStreak(0);

      setRecentNotice({
        text: `Oops! "${currentQuestion.baseWord}" ➔ ${currentQuestion.correctOption}`,
        isCorrect: false,
      });

      setLives((l) => {
        const nextLives = l - 1;
        if (nextLives <= 0) {
          // Game Over!
          setTimeout(() => {
            endGame();
          }, 300);
        }
        return nextLives;
      });
    }

    // Clear recent notice after 2.5s
    setTimeout(() => {
      setRecentNotice((curr) => (curr ? null : null));
    }, 2500);
  };

  // End Game
  const endGame = useCallback(async () => {
    setGameState('gameover');
    audioRef.current.stopMusic();
    audioRef.current.playGameOver();

    // Trigger celebration confetti if score is high
    if (score > 300) {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } });
    }

    // Award pet coins if user is logged in
    const coinsEarned = Math.floor(score / 35);
    if (coinsEarned > 0) {
      if (user) {
        try {
          const { firestore } = initializeFirebase();
          if (firestore) {
            const petRef = doc(firestore, 'user_pets', user.uid);
            await updateDoc(petRef, {
              coins: increment(coinsEarned),
              experience: increment(coinsEarned * 2),
            });
          }
        } catch (e) {}
      } else {
        // Guest local pet update
        try {
          const localPet = localStorage.getItem('lingoland_guest_pet');
          if (localPet) {
            const parsed = JSON.parse(localPet);
            parsed.coins = (parsed.coins || 0) + coinsEarned;
            parsed.experience = (parsed.experience || 0) + coinsEarned * 2;
            localStorage.setItem('lingoland_guest_pet', JSON.stringify(parsed));
          }
        } catch (e) {}
      }
    }
  }, [score, user]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'start' || gameState === 'gameover') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          startGame();
          return;
        }
      }
      if (gameState === 'playing') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          handleJump();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          handleSlide();
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          e.preventDefault();
          setGameState((s) => (s === 'playing' ? 'paused' : 'playing'));
        }
      } else if (gameState === 'paused') {
        if (e.code === 'KeyP' || e.code === 'Space' || e.code === 'Escape') {
          e.preventDefault();
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleJump, handleSlide, startGame]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Init canvas size
    const width = 960;
    const height = 480;
    canvas.width = width;
    canvas.height = height;
    initStarfield(width, height);

    let animationId: number;

    const render = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      lastTimeRef.current = time;

      // Update if playing
      if (gameState === 'playing') {
        updateGameLogic(width, height);
      }

      // Draw Screen
      drawGame(ctx, width, height);

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    gameLoopRef.current = animationId;

    return () => {
      cancelAnimationFrame(animationId);
      audioRef.current.stopMusic();
    };
  }, [gameState]);

  // Game Logic Tick
  const updateGameLogic = (width: number, height: number) => {
    const world = worldRef.current;
    const player = playerRef.current;

    // Camera shake decay
    if (world.shake > 0) world.shake *= 0.88;
    if (world.shake < 0.5) world.shake = 0;

    // Distance & Score progression
    world.distanceMeters += world.scrollSpeed * 0.05;
    setDistance(Math.floor(world.distanceMeters));

    // Player physics
    player.vy += world.gravity;
    player.y += player.vy;

    // Ground check
    const currentGroundY = world.groundY - (player.isSliding ? 34 : player.height);
    if (player.y >= currentGroundY) {
      player.y = currentGroundY;
      player.vy = 0;
      player.isGrounded = true;
      player.jumpCount = 0;
    } else {
      player.isGrounded = false;
    }

    // Sliding timer
    if (player.isSliding) {
      player.slideTimer--;
      if (player.slideTimer <= 0) {
        player.isSliding = false;
      }
    }

    // Invincibility flicker timer
    if (player.invincibleTimer > 0) {
      player.invincibleTimer--;
    }

    // Running animation frame counter
    player.runFrame++;

    // Scroll Starfield
    world.bgStars.forEach((star) => {
      star.x -= star.speed * (world.scrollSpeed * 0.3);
      if (star.x < 0) {
        star.x = width + Math.random() * 20;
        star.y = Math.random() * (height - 120);
      }
    });

    // Check if we need to spawn next encounter
    if (world.nextEncounterX <= width + 100) {
      spawnQuestionEncounter(width + 250);
    } else {
      world.nextEncounterX -= world.scrollSpeed;
    }

    // Update & check Choice Orbs
    for (let i = world.orbs.length - 1; i >= 0; i--) {
      const orb = world.orbs[i];
      orb.x -= world.scrollSpeed;

      // Hitbox check with player
      if (!orb.collected && player.invincibleTimer === 0) {
        const playerBox = {
          x: player.x,
          y: player.y,
          width: player.width,
          height: player.isSliding ? 34 : player.height,
        };

        // Circle vs Box collision
        const closestX = Math.max(playerBox.x, Math.min(orb.x, playerBox.x + playerBox.width));
        const closestY = Math.max(playerBox.y, Math.min(orb.y, playerBox.y + playerBox.height));
        const distX = orb.x - closestX;
        const distY = orb.y - closestY;
        const distanceSquared = distX * distX + distY * distY;

        if (distanceSquared < orb.radius * orb.radius) {
          orb.collected = true;
          createBurstParticles(orb.x, orb.y, orb.isCorrect ? '#38bdf8' : '#f43f5e', 24);
          handleOrbCollisionResult(orb.isCorrect, orb.text);
        }
      }

      // Remove orbs that scrolled past screen
      if (orb.x < -120) {
        world.orbs.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = world.particles.length - 1; i >= 0; i--) {
      const p = world.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        world.particles.splice(i, 1);
      }
    }

    // Running Trail Particles
    if (player.isGrounded && player.runFrame % 4 === 0) {
      world.particles.push({
        x: player.x + (player.isSliding ? 5 : 10),
        y: world.groundY - 2,
        vx: -world.scrollSpeed * 0.4 - Math.random() * 2,
        vy: -Math.random() * 2,
        color: streak >= 5 ? '#f59e0b' : 'rgba(255, 255, 255, 0.4)',
        radius: Math.random() * 3 + 1,
        alpha: 0.8,
        decay: 0.05,
      });
    }
  };

  // Draw Game onto Canvas
  const drawGame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const world = worldRef.current;
    const player = playerRef.current;

    ctx.save();

    // Camera Shake
    if (world.shake > 0) {
      const sx = (Math.random() - 0.5) * world.shake;
      const sy = (Math.random() - 0.5) * world.shake;
      ctx.translate(sx, sy);
    }

    // 1. Cyber Synthwave Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.5, '#111827');
    skyGrad.addColorStop(0.85, '#1e1b4b');
    skyGrad.addColorStop(1, '#2e1065');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Distant Parallax Stars & Grid Sun
    world.bgStars.forEach((star) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Glowing Synth Sun in Horizon
    const sunGrad = ctx.createRadialGradient(width / 2, 260, 20, width / 2, 260, 140);
    sunGrad.addColorStop(0, 'rgba(236, 72, 153, 0.5)');
    sunGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width / 2, 260, 140, 0, Math.PI * 2);
    ctx.fill();

    // 3. Parallax Mountains / Cyber Grid Skyline
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.35)';
    ctx.lineWidth = 1.5;
    const mountainOffset = (world.distanceMeters * 1.5) % 200;
    ctx.beginPath();
    for (let x = -200; x < width + 200; x += 100) {
      const mx = x - mountainOffset;
      ctx.moveTo(mx, 380);
      ctx.lineTo(mx + 50, 290);
      ctx.lineTo(mx + 100, 380);
    }
    ctx.stroke();

    // 4. Ground Platform & Cyber Grid Flooring
    const groundY = world.groundY;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
    groundGrad.addColorStop(0, '#0f172a');
    groundGrad.addColorStop(0.2, '#030712');
    groundGrad.addColorStop(1, '#020617');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Neon Ground Edge Line
    ctx.strokeStyle = streak >= 5 ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = streak >= 5 ? '#f59e0b' : '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Animated Perspective Grid Lines on Floor
    const gridSpeedOffset = (world.distanceMeters * 25) % 40;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    for (let x = -40; x < width + 40; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x - gridSpeedOffset, groundY);
      ctx.lineTo((x - gridSpeedOffset - width / 2) * 1.6 + width / 2, height);
      ctx.stroke();
    }

    // 4.5 In-Canvas Question Prompt Banner (Guaranteed always visible on canvas!)
    if (currentQuestion) {
      ctx.save();
      const promptX = width / 2;
      const promptY = 36;
      const boxW = 540;
      const boxH = 42;

      // Glow Container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(promptX - boxW / 2, promptY - boxH / 2, boxW, boxH, 12);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Prompt Instruction Text
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentQuestion.prompt.toUpperCase()} ➔`, promptX - 8, promptY);

      // Target Verb Badge
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText(currentQuestion.baseWord.toUpperCase(), promptX + 8, promptY);

      ctx.restore();
    }

    // 5. Choice Portals & Orbs
    world.orbs.forEach((orb) => {
      if (orb.collected) return;

      ctx.save();
      // Outer Orbital Energy Rings
      const ringAngle = Date.now() * 0.003;
      ctx.strokeStyle = orb.glowColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius + 7, ringAngle, ringAngle + Math.PI * 1.4);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius + 12, -ringAngle, -ringAngle + Math.PI * 1.2);
      ctx.stroke();

      // Glowing Center Orb
      const orbGrad = ctx.createRadialGradient(
        orb.x - 6,
        orb.y - 6,
        4,
        orb.x,
        orb.y,
        orb.radius
      );
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.35, orb.color);
      orbGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = orbGrad;
      ctx.shadowColor = orb.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Badge is placed strictly ABOVE each orb
      const isHighLane = orb.lane === 'high' || orb.y < 280;
      const badgeY = orb.y - orb.radius - 22;

      // Draw Action Lane Indicator (▲ JUMP vs ▼ RUN)
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const actionTag = isHighLane ? '▲ JUMP' : '▼ RUN';
      const tagColor = isHighLane ? '#38bdf8' : '#fb7185';
      ctx.fillStyle = tagColor;
      ctx.fillText(actionTag, orb.x, badgeY - 18);

      // Badge Container Box
      ctx.font = 'bold 16px system-ui, sans-serif';
      const textMetrics = ctx.measureText(orb.text);
      const badgeWidth = Math.max(textMetrics.width + 26, 82);
      const badgeHeight = 30;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = orb.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = orb.glowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(orb.x - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Text Inside Badge
      ctx.fillStyle = '#ffffff';
      ctx.fillText(orb.text, orb.x, badgeY);

      ctx.restore();
    });

    // 6. Particles
    world.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // 7. Draw 2D Runner Avatar
    drawPlayerAvatar(ctx, player, world);

    ctx.restore();
  };

  // Draw Runner Avatar (Vector / Canvas)
  const drawPlayerAvatar = (
    ctx: CanvasRenderingContext2D,
    player: typeof playerRef.current,
    world: typeof worldRef.current
  ) => {
    // Invincibility flicker
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    const isHighStreak = streak >= 5;
    const bodyColor = isHighStreak ? '#f59e0b' : '#38bdf8';
    const suitGlow = isHighStreak ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.5)';

    // Shadow on Ground
    if (!player.isGrounded) {
      const shadowY = world.groundY - player.y;
      const shadowScale = Math.max(0.3, 1 - (shadowY / 200));
      ctx.fillStyle = `rgba(0, 0, 0, ${0.4 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(player.width / 2, shadowY, 20 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (player.isSliding) {
      // ─── SLIDING POSTURE ───
      // Sparkles/Dust at slide base
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(38, 30, 4, 0, Math.PI * 2);
      ctx.fill();

      // Torso Leaning Back
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = suitGlow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(0, 12, 44, 20, 8);
      ctx.fill();
      ctx.stroke();

      // Cyber Visor / Head
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(38, 14, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing Neon Visor Line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(38, 14);
      ctx.lineTo(48, 14);
      ctx.stroke();
    } else {
      // ─── RUNNING / JUMPING POSTURE ───
      const runCycle = Math.sin(player.runFrame * 0.28);

      // Trailing Cape with Dynamic Wave
      const capeWave = Math.sin(player.runFrame * 0.3) * 6;
      ctx.fillStyle = isHighStreak ? '#ef4444' : '#6366f1';
      ctx.beginPath();
      ctx.moveTo(8, 22);
      ctx.quadraticCurveTo(-18, 24 + capeWave, -26, 44 + capeWave);
      ctx.lineTo(-18, 48);
      ctx.lineTo(8, 28);
      ctx.closePath();
      ctx.fill();

      // Legs Animation
      const leg1Angle = player.isGrounded ? runCycle * 0.7 : -0.4;
      const leg2Angle = player.isGrounded ? -runCycle * 0.7 : 0.6;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      // Back Leg
      ctx.save();
      ctx.translate(14, 38);
      ctx.rotate(leg2Angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 22);
      ctx.stroke();
      // Back Shoe Glow
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-2, 19, 8, 4);
      ctx.restore();

      // Front Leg
      ctx.save();
      ctx.translate(22, 38);
      ctx.rotate(leg1Angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 22);
      ctx.stroke();
      // Front Shoe Glow
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-2, 19, 8, 4);
      ctx.restore();

      // Torso / Runner Jacket
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = suitGlow;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(8, 16, 22, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Jacket Neon Zipper Stripe
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(19, 16);
      ctx.lineTo(19, 38);
      ctx.stroke();

      // Head & Cyber Visor
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(20, 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Neon Visor
      ctx.strokeStyle = isHighStreak ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(20, 10);
      ctx.lineTo(30, 10);
      ctx.stroke();

      // Running Arms
      const armAngle = -runCycle * 0.8;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.save();
      ctx.translate(19, 20);
      ctx.rotate(armAngle);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 14);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full max-w-5xl mx-auto flex flex-col items-center select-none font-sans transition-all duration-300',
        isFullscreen ? 'h-screen justify-center p-2 bg-slate-950' : 'p-4'
      )}
    >
      {/* ─── Top Control Bar ─── */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black px-3 py-1 text-sm tracking-wide shadow-md flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-current" />
            TENSE RUNNER
          </Badge>
          <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {CATEGORY_INFO[selectedCategory].name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </Button>

          {gameState === 'playing' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs font-semibold"
              onClick={() => setGameState('paused')}
            >
              <Pause className="w-3.5 h-3.5 mr-1" /> Pause
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* ─── Main Game Canvas Box ─── */}
      <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          onClick={handleJump}
        />

        {/* ─── Active HUD (Score, Hearts, Combo, Prompt) ─── */}
        {gameState === 'playing' && (
          <>
            {/* Top-Left Stats: Score & Distance */}
            <div className="absolute top-3 left-4 flex items-center gap-4 z-10 pointer-events-none">
              <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-2 text-white">
                <Trophy className="w-4 h-4 text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Score</span>
                  <span className="text-sm font-black font-mono tracking-tight text-amber-300">{score}</span>
                </div>
              </div>

              <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-2 text-white">
                <Compass className="w-4 h-4 text-cyan-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Distance</span>
                  <span className="text-sm font-black font-mono tracking-tight text-cyan-300">{distance}m</span>
                </div>
              </div>
            </div>

            {/* Top-Right Stats: Shields/Lives & Combo Multiplier */}
            <div className="absolute top-3 right-4 flex items-center gap-3 z-10 pointer-events-none">
              {/* Combo Multiplier */}
              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    'px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono font-black text-xs shadow-lg backdrop-blur-md',
                    streak >= 10
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : streak >= 5
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  )}
                >
                  <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span>{streak}x COMBO</span>
                </motion.div>
              )}

              {/* Lives / Shields */}
              <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-1.5 text-rose-400">
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    className={cn(
                      'w-4 h-4 transition-all duration-300',
                      heartIndex <= lives
                        ? 'fill-rose-500 text-rose-500 scale-100'
                        : 'text-slate-600 scale-75 opacity-40'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Top-Center Encounter Prompt Banner */}
            {currentQuestion && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none max-w-[80%] text-center">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-slate-900/90 backdrop-blur-md px-5 py-1.5 rounded-2xl border border-cyan-500/40 shadow-xl flex items-center gap-2.5"
                >
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {currentQuestion.prompt}
                  </span>
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm px-2.5 py-0.5 tracking-wide uppercase">
                    {currentQuestion.baseWord}
                  </Badge>
                </motion.div>
              </div>
            )}

            {/* Floating Feedback Notice Banner */}
            <AnimatePresence>
              {recentNotice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  className={cn(
                    'absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-xl font-black text-sm tracking-wide shadow-2xl border backdrop-blur-md pointer-events-none',
                    recentNotice.isCorrect
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-rose-500/30 border-rose-400 text-rose-200'
                  )}
                >
                  {recentNotice.text}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ─── Start / Category Selection Overlay ─── */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-xl shadow-rose-500/25 mb-3">
                <Zap className="w-8 h-8 text-white fill-current" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                RUN & JUMP: TENSE RUNNER
              </h1>
              <p className="text-xs text-slate-300 mb-4 max-w-sm">
                Sprint across platforms and leap into the correct grammar portals to keep running and build massive combo streaks!
              </p>

              {/* Category Selector Buttons */}
              <div className="w-full mb-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-left">
                  Select Grammar Training:
                </label>
                <div className="grid grid-cols-2 gap-2 text-left">
                  {(Object.keys(CATEGORY_INFO) as GrammarCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center gap-2',
                        selectedCategory === cat
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      )}
                    >
                      <span className="text-base">{CATEGORY_INFO[cat].icon}</span>
                      <span className="truncate">{CATEGORY_INFO[cat].name.split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Speed Selector */}
              <div className="flex items-center gap-2 mb-5">
                <Button
                  size="sm"
                  variant={difficulty === 'normal' ? 'default' : 'outline'}
                  className={cn(
                    'h-8 text-xs font-bold rounded-lg px-4',
                    difficulty === 'normal' ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-slate-700 text-slate-400'
                  )}
                  onClick={() => setDifficulty('normal')}
                >
                  Normal Speed
                </Button>
                <Button
                  size="sm"
                  variant={difficulty === 'turbo' ? 'default' : 'outline'}
                  className={cn(
                    'h-8 text-xs font-bold rounded-lg px-4',
                    difficulty === 'turbo' ? 'bg-amber-600 hover:bg-amber-500' : 'border-slate-700 text-slate-400'
                  )}
                  onClick={() => setDifficulty('turbo')}
                >
                  <Flame className="w-3.5 h-3.5 mr-1 fill-current" /> Turbo Mode
                </Button>
              </div>

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base rounded-xl shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
                onClick={startGame}
              >
                <Play className="w-5 h-5 mr-2 fill-current" /> START RUNNING
              </Button>

              <div className="mt-3 text-[11px] text-slate-400 font-medium">
                Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-white">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-white">▲</kbd> to Jump (Double-jump in air!), <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-white">▼</kbd> to Slide.
              </div>
            </motion.div>
          </div>
        )}

        {/* ─── Pause Overlay ─── */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
            <h2 className="text-2xl font-black text-white mb-2">GAME PAUSED</h2>
            <p className="text-xs text-slate-300 mb-5">Take a breather, the runner will wait for you!</p>
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="h-11 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl"
                onClick={() => setGameState('playing')}
              >
                <Play className="w-4 h-4 mr-2 fill-current" /> Resume
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 border-slate-700 text-slate-300 font-bold rounded-xl"
                onClick={startGame}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Restart
              </Button>
            </div>
          </div>
        )}

        {/* ─── Game Over Overlay ─── */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-2">
                <Trophy className="w-7 h-7 text-white fill-current" />
              </div>

              <h2 className="text-2xl font-black text-white mb-1">RUN COMPLETE!</h2>
              <p className="text-xs text-slate-400 mb-4">Great run! Here is your performance breakdown:</p>

              {/* Score Stats Grid */}
              <div className="grid grid-cols-3 gap-2 w-full mb-4">
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Final Score</span>
                  <span className="text-lg font-black text-amber-300 font-mono">{score}</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance</span>
                  <span className="text-lg font-black text-cyan-300 font-mono">{distance}m</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Streak</span>
                  <span className="text-lg font-black text-rose-300 font-mono">{maxStreak}x</span>
                </div>
              </div>

              {/* Pet Coins Reward */}
              {score > 0 && (
                <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 mb-4 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">LingoLand Pet Rewards</span>
                  </div>
                  <span className="text-xs font-black text-amber-200">+{Math.floor(score / 35)} Coins</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <Button
                  size="lg"
                  className="flex-1 h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-md"
                  onClick={startGame}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> PLAY AGAIN
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-4 border-slate-700 text-slate-300 font-semibold rounded-xl"
                  onClick={() => setGameState('start')}
                >
                  Categories
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ─── Bottom Mobile Controls & Direct Choice Bar ─── */}
      <div className="w-full mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Direct Option Tap Bar (for accessibility and fast touch) */}
        {gameState === 'playing' && currentQuestion && (
          <div className="w-full sm:flex-1 bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex items-center justify-center gap-3">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden md:inline">Quick Tap:</span>
            {(() => {
              const activeOrbs = worldRef.current.orbs.filter(
                (o) => o.questionId === currentQuestion.id && !o.collected
              );
              const choices =
                activeOrbs.length >= 2
                  ? activeOrbs.map((o) => ({ text: o.text, lane: o.lane }))
                  : [
                      { text: currentQuestion.correctOption, lane: 'high' as const },
                      { text: currentQuestion.wrongOptions[0], lane: 'low' as const },
                    ];
              return choices.map((choice, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  className={cn(
                    'flex-1 h-9 border text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                    choice.lane === 'high'
                      ? 'border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-600 text-cyan-200 hover:text-white'
                      : 'border-rose-500/50 bg-rose-950/40 hover:bg-rose-600 text-rose-200 hover:text-white'
                  )}
                  onClick={() => handleDirectChoice(choice.text)}
                >
                  <span className="text-[10px] font-black uppercase opacity-75">
                    {choice.lane === 'high' ? '▲ JUMP:' : '▼ RUN:'}
                  </span>
                  <span>{choice.text}</span>
                </Button>
              ));
            })()}
          </div>
        )}

        {/* On-Screen Jump / Slide Touch Buttons for Mobile/Tablet */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 sm:w-32 h-11 border-slate-700 bg-slate-900 text-slate-200 font-bold active:bg-cyan-600 active:text-white rounded-xl text-xs"
            onClick={handleSlide}
          >
            <ArrowDown className="w-4 h-4 mr-1.5" /> SLIDE (▼)
          </Button>
          <Button
            size="lg"
            className="flex-1 sm:w-36 h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black active:scale-95 rounded-xl text-xs shadow-md shadow-cyan-500/20"
            onClick={handleJump}
          >
            <ArrowUp className="w-4 h-4 mr-1.5 fill-current" /> JUMP (▲)
          </Button>
        </div>
      </div>

      {/* ─── Learning Review Section (Missed Questions & Rules) ─── */}
      {history.length > 0 && (
        <div className="w-full mt-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Grammar Learning Review ({history.filter((h) => h.isCorrect).length}/{history.length} Correct)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Review your answers and explanations below:
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {history.slice(0, 16).map((item, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-xl border text-xs flex flex-col justify-between transition-colors',
                  item.isCorrect
                    ? 'bg-slate-950/60 border-emerald-500/25 text-slate-300'
                    : 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="font-bold text-white capitalize">{item.question.baseWord}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0 border',
                      item.isCorrect
                        ? 'border-emerald-500/40 text-emerald-400'
                        : 'border-rose-500/40 text-rose-400'
                    )}
                  >
                    {item.isCorrect ? 'Correct' : 'Needs Practice'}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  <p className="mb-0.5">
                    Your choice: <span className="font-bold text-white">{item.userChoice}</span>{' '}
                    {!item.isCorrect && (
                      <span>
                        ➔ Correct: <span className="font-bold text-emerald-400">{item.question.correctOption}</span>
                      </span>
                    )}
                  </p>
                  <p className="italic text-slate-400 text-[10px]">{item.question.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
