'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { getGameBySlug } from '@/lib/games';
import { Button } from '../ui/button';
import {
  Trophy,
  Sparkles,
  Maximize,
  Minimize,
  Coins,
  ArrowRight,
  RotateCcw,
  Gamepad2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { getDailyBonusGame } from '@/lib/analytics';

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

const ROUNDS_TO_WIN = 8;

export function MathDash3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [score, setScore] = React.useState(0);
  const [solvedCount, setSolvedCount] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [gameOverReason, setGameOverReason] = React.useState<GameOverReason>('hit');

  // Math Question States
  const [questionText, setQuestionText] = React.useState('Solve: 5 + 3 = ?');
  const [answers, setAnswers] = React.useState<{ red: number; green: number; blue: number }>({ red: 8, green: 6, blue: 10 });
  const [correctAnswerColor, setCorrectAnswerColor] = React.useState<'red' | 'green' | 'blue'>('red');
  const [feedback, setFeedback] = React.useState<{ text: string; color: string } | null>(null);

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

  // Keep refs up-to-date
  React.useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  React.useEffect(() => { scoreRef.current = score; }, [score]);
  React.useEffect(() => { solvedCountRef.current = solvedCount; }, [solvedCount]);
  React.useEffect(() => { correctAnswerColorRef.current = correctAnswerColor; }, [correctAnswerColor]);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

  // ─── Fullscreen sync + canvas resize on fullscreen toggle ─────────────────
  React.useEffect(() => {
    const handler = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      // Give the browser one frame to apply new dimensions, then resize
      requestAnimationFrame(() => {
        if (handleResizeRef.current) handleResizeRef.current();
        // Second frame for safety (browser sometimes needs two reflows)
        requestAnimationFrame(() => {
          if (handleResizeRef.current) handleResizeRef.current();
        });
      });
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ─── Keyboard controls ────────────────────────────────────────────────────
  const keysRef = React.useRef<Record<string, boolean>>({
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
  });

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent arrow keys from scrolling the page
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
      const k = e.key.toLowerCase();
      if (k === 'w' || e.code === 'KeyW') keysRef.current.w = true;
      else if (k === 'a' || e.code === 'KeyA') keysRef.current.a = true;
      else if (k === 's' || e.code === 'KeyS') keysRef.current.s = true;
      else if (k === 'd' || e.code === 'KeyD') keysRef.current.d = true;
      else if (e.key === 'ArrowUp') keysRef.current.ArrowUp = true;
      else if (e.key === 'ArrowLeft') keysRef.current.ArrowLeft = true;
      else if (e.key === 'ArrowDown') keysRef.current.ArrowDown = true;
      else if (e.key === 'ArrowRight') keysRef.current.ArrowRight = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.code === 'KeyW') keysRef.current.w = false;
      else if (k === 'a' || e.code === 'KeyA') keysRef.current.a = false;
      else if (k === 's' || e.code === 'KeyS') keysRef.current.s = false;
      else if (k === 'd' || e.code === 'KeyD') keysRef.current.d = false;
      else if (e.key === 'ArrowUp') keysRef.current.ArrowUp = false;
      else if (e.key === 'ArrowLeft') keysRef.current.ArrowLeft = false;
      else if (e.key === 'ArrowDown') keysRef.current.ArrowDown = false;
      else if (e.key === 'ArrowRight') keysRef.current.ArrowRight = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ─── Touch / on-screen button helpers ────────────────────────────────────
  const pressKey = (key: string) => { keysRef.current[key] = true; };
  const releaseKey = (key: string) => { keysRef.current[key] = false; };

  // ─── Feedback helper ──────────────────────────────────────────────────────
  const showFeedback = (text: string, color: string) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 1200);
  };

  // ─── Math problem generator ───────────────────────────────────────────────
  const generateMathProblem = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let num1 = 0, num2 = 0, correctAns = 0;

    if (op === '+') {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      correctAns = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * num1);
      correctAns = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      correctAns = num1 * num2;
    }

    const operatorDisplay = op === '*' ? '×' : op;
    setQuestionText(`Solve: ${num1} ${operatorDisplay} ${num2} = ?`);

    let wrong1 = correctAns + Math.floor(Math.random() * 5) + 1;
    let wrong2 = correctAns - Math.floor(Math.random() * 5) - 1;
    if (wrong2 < 0) wrong2 = correctAns + Math.floor(Math.random() * 5) + 6;

    const answersList = [correctAns, wrong1, wrong2];
    for (let i = answersList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answersList[i], answersList[j]] = [answersList[j], answersList[i]];
    }

    setAnswers({ red: answersList[0], green: answersList[1], blue: answersList[2] });

    let correctColor: 'red' | 'green' | 'blue' = 'red';
    if (answersList[0] === correctAns) correctColor = 'red';
    else if (answersList[1] === correctAns) correctColor = 'green';
    else correctColor = 'blue';
    setCorrectAnswerColor(correctColor);
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
      const available = [...desks];
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      optionSpheres[0].mesh.position.set(available[0].position.x, 4.5, available[0].position.z);
      optionSpheres[1].mesh.position.set(available[1].position.x, 4.5, available[1].position.z);
      optionSpheres[2].mesh.position.set(available[2].position.x, 4.5, available[2].position.z);
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

    // 11. Animation loop
    const playerSpeed = 15.0; // units per second
    let frameId = 0;
    let isColliding = false; // debounce collisions
    let lastTime = performance.now();

    const animate = () => {
      if (gameStateRef.current !== 'playing') return;
      frameId = requestAnimationFrame(animate);

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
              setScore(nextScore);
              setSolvedCount(nextSolved);
              showFeedback('✓ Correct! +10', '#4CAF50');
              window.dispatchEvent(new CustomEvent('lingoland_game_answered_hijack'));
              if (nextSolved >= ROUNDS_TO_WIN) {
                setGameState('finished');
                window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', { detail: { state: 'finished' } }));
                toast({ title: 'Math Dash Champion! 🏆⭐', description: "You've solved all targets! Coins awarded." });
              } else {
                if (nextSolved % 3 === 0) createObstacle();
                generateMathProblem();
                repositionSpheres();
              }
            } else {
              triggerGameOver('wrong');
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
            triggerGameOver('hit');
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
      [obsGeo, obsMat, sphereGeo, redMat, greenMat, blueMat, playerGeo, playerMat, deskGeo, deskMat, boardGeo, boardMat, floorGeo, floorMat].forEach(x => x.dispose());
    };
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

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
            : 'max-w-4xl mx-auto rounded-3xl'
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
            isFullscreen ? 'flex-1' : 'h-[360px] sm:h-[450px] md:h-[520px]'
          )}
        >
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
              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 transition-all duration-300 font-black tracking-widest text-white shadow-xl shadow-purple-500/10 border border-purple-400/20 px-12 py-6 rounded-2xl text-lg"
              >
                INITIALIZE SIMULATION
              </Button>
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
                <Button onClick={startGame} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 rounded-xl">
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
                <Button onClick={startGame} size="lg" className="rounded-full px-8 font-bold bg-purple-600 text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/25 border border-purple-500/30">
                  <RotateCcw className="mr-2 w-5 h-5" /> RE-DASH
                </Button>
                <Button variant="outline" asChild size="lg" className="rounded-full px-8 font-bold border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                  <Link href="/games">RETURN TO BASE</Link>
                </Button>
              </div>
            </div>
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
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-sm"
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
