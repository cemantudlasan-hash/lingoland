"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Question, GameConfig, AnswerRecord } from "@/lib/game-types-corridor";
import { audioEngine } from "../AudioEngine";
import { Trophy, Heart, ShieldAlert, LogOut } from "lucide-react";

interface ThreeGameProps {
  config: GameConfig;
  playerRole?: "single" | "p1" | "p2";
  onGameCompleted: (score: number, correctCount: number, totalCount: number, obstacleHits?: number, history?: AnswerRecord[]) => void;
  onExit: () => void;
}

export default function ThreeGame({ config, playerRole = "single", onGameCompleted, onExit }: ThreeGameProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // ── React state ──────────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [health, setHealth] = useState(config.startingLives ?? 3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [toastFeedback, setToastFeedback] = useState<{ isCorrect: boolean; points: number; correctAnswer: string; selectedAnswer: string; id: number } | null>(null);
  const [obstacleFlash, setObstacleFlash] = useState(false);
  const [obstacleHitsCount, setObstacleHitsCount] = useState(0);
  const [floatingPenalty, setFloatingPenalty] = useState<{ pts: number; id: number } | null>(null);
  const [exitConfirmActive, setExitConfirmActive] = useState(false);

  // ── Constants ────────────────────────────────────────────────────
  const questionsList = config.activeQuestions;
  const currentQuestion = questionsList[currentIdx];
  const isP1 = playerRole === "p1";
  const isP2 = playerRole === "p2";
  const themeHexColor = isP1 ? 0xff007f : isP2 ? 0x00f2ff : 0x2dd4bf;
  const themeTailwindText = isP1 ? "text-pink-400" : isP2 ? "text-cyan-400" : "text-teal-400";
  const themeTailwindBg = isP1 ? "bg-pink-500/10 border-pink-500/20" : isP2 ? "bg-cyan-500/10 border-cyan-500/20" : "bg-teal-500/10 border-teal-500/20";
  const themeTailwindTextBright = isP1 ? "text-pink-300" : isP2 ? "text-cyan-300" : "text-teal-300";
  const themeLabel = isP1 ? "PLAYER 1" : isP2 ? "PLAYER 2" : "SOLO CORRIDOR";

  // ── Refs ─────────────────────────────────────────────────────────
  const currentIdxRef = useRef(0);
  const correctCountRef = useRef(0);
  const isPausedRef = useRef(false);
  const obstacleHitsRef = useRef(0);
  const exitConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const multiplierRef = useRef(1);
  const scoreRef = useRef(0);
  const gameEndedRef = useRef(false);
  const answerHistoryRef = useRef<AnswerRecord[]>([]);
  const configRef = useRef(config);
  const onGameCompletedRef = useRef(onGameCompleted);
  const gateCollisionRef = useRef<() => void>(() => {});

  useEffect(() => { multiplierRef.current = multiplier; }, [multiplier]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { onGameCompletedRef.current = onGameCompleted; }, [onGameCompleted]);

  // ── 3D engine refs ───────────────────────────────────────────────
  const gameRef = useRef<{
    scene: THREE.Scene | null; camera: THREE.PerspectiveCamera | null; renderer: THREE.WebGLRenderer | null;
    player: THREE.Group | null; orbitRings: THREE.Mesh[]; gridFloor: THREE.GridHelper | null;
    roadLineMeshesRoot: THREE.Group | null; gatesGroup: THREE.Group | null; starfield: THREE.Points | null;
    crystals: THREE.Mesh[]; particles: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[];
    obstacles: { obj: THREE.Group; lane?: number; type: "mine" | "firewall"; safeLane?: number }[]; obstacleHitCooldown: number; nextObstacleTime: number;
    targetLane: number; playerY: number; playerVelocityY: number; isJumping: boolean;
    speedFactor: number; gatesDistance: number; requestFrameId: number; isPaused: boolean;
  }>({
    scene: null, camera: null, renderer: null, player: null, orbitRings: [], gridFloor: null,
    roadLineMeshesRoot: null, gatesGroup: null, starfield: null, crystals: [], particles: [],
    obstacles: [], obstacleHitCooldown: 0, nextObstacleTime: 0, targetLane: 1, playerY: 0,
    playerVelocityY: 0, isJumping: false, speedFactor: config.speed * 0.06 + 0.01,
    gatesDistance: -100, requestFrameId: 0, isPaused: false,
  });

  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { isPausedRef.current = isGameOver || isVictory; gameRef.current.isPaused = isPausedRef.current; }, [isGameOver, isVictory]);
  useEffect(() => { gameRef.current.speedFactor = config.speed * 0.06 + 0.01; }, [config.speed]);

  // ── Timer countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (isGameOver || isVictory) return;
    const interval = setInterval(() => setTimeLeft((p) => (p <= 1 ? 0 : p - 1)), 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isVictory]);

  // ── Timer end ────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0 && !isVictory && !isGameOver && !gameEndedRef.current) {
      gameEndedRef.current = true;
      setIsVictory(true);
      audioEngine.playLevelSuccess();
      onGameCompleted(scoreRef.current, correctCountRef.current, questionsList.length, obstacleHitsRef.current, [...answerHistoryRef.current]);
    }
  }, [timeLeft, isVictory, isGameOver, score, questionsList.length, onGameCompleted]);

  // ── Health end ───────────────────────────────────────────────────
  useEffect(() => {
    if (health <= 0 && !isGameOver && !isVictory && !config.continueOnZeroHealth && !config.invincible && !gameEndedRef.current) {
      gameEndedRef.current = true;
      setIsGameOver(true);
      audioEngine.playIncorrect();
      onGameCompleted(scoreRef.current, correctCountRef.current, questionsList.length, obstacleHitsRef.current, [...answerHistoryRef.current]);
    }
  }, [health, isGameOver, isVictory, score, questionsList.length, onGameCompleted, config.continueOnZeroHealth, config.invincible]);

  // ── Exit confirm ─────────────────────────────────────────────────
  const handleExitClick = () => {
    if (exitConfirmActive) {
      if (exitConfirmTimerRef.current) clearTimeout(exitConfirmTimerRef.current);
      setExitConfirmActive(false); onExit();
    } else {
      setExitConfirmActive(true);
      exitConfirmTimerRef.current = setTimeout(() => setExitConfirmActive(false), 2500);
    }
  };

  // ── Controls ─────────────────────────────────────────────────────
  const canMove = () => !isPausedRef.current && !(health <= 0 && !config.invincible && !config.continueOnZeroHealth);
  const moveLeft = () => { if (canMove() && gameRef.current.targetLane > 0) { gameRef.current.targetLane -= 1; audioEngine.playMove(); } };
  const moveRight = () => { if (canMove() && gameRef.current.targetLane < 2) { gameRef.current.targetLane += 1; audioEngine.playMove(); } };
  const setLane = (lane: number) => { if (canMove() && lane >= 0 && lane <= 2 && lane !== gameRef.current.targetLane) { gameRef.current.targetLane = lane; audioEngine.playMove(); } };
  const triggerJump = () => { if (canMove() && !gameRef.current.isJumping) { gameRef.current.isJumping = true; gameRef.current.playerVelocityY = 0.22; audioEngine.playMove(); } };

  // ── Keyboard ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isGameOver || isVictory) return;
      if (e.key === "Escape") { onExit(); return; }
      if (isP1) { if (e.key === "a" || e.key === "A") moveLeft(); else if (e.key === "d" || e.key === "D") moveRight(); else if (e.key === "w" || e.key === "W" || e.key === " ") triggerJump(); }
      else if (isP2) { if (e.key === "ArrowLeft") moveLeft(); else if (e.key === "ArrowRight") moveRight(); else if (e.key === "ArrowUp") triggerJump(); }
      else { if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") moveLeft(); else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") moveRight(); else if (e.key === "w" || e.key === "W" || e.key === "ArrowUp" || e.key === " ") triggerJump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isGameOver, isVictory, health, playerRole]);

  // ── 3D Helpers ───────────────────────────────────────────────────
  const createTextSprite = (text: string, color: string, bgColor: string) => {
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext("2d"); if (!ctx) return new THREE.Sprite();
    ctx.fillStyle = bgColor; ctx.beginPath(); ctx.roundRect(10, 10, 492, 108, 20); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = color; ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 32px 'Space Grotesk', system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (text.length > 26) { ctx.fillText(text.substring(0, 26) + "-", 256, 45); ctx.fillText(text.substring(26), 256, 85); }
    else { ctx.fillText(text, 256, 64); }
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(2.8, 0.7, 1); return sprite;
  };

  const spawnExplosionParticles = (pos: THREE.Vector3, colorVal: number, count = 40) => {
    const geom = new THREE.SphereGeometry(0.1, 4, 4);
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colorVal, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geom, mat); mesh.position.copy(pos);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 0.28, (Math.random() - 0.2) * 0.25 + 0.1, (Math.random() - 0.5) * 0.28);
      gameRef.current.scene?.add(mesh); gameRef.current.particles.push({ mesh, velocity: vel, life: 1.0 });
    }
  };

  const setupCrystals = (zOffset: number) => {
    if (!gameRef.current.scene) return;
    gameRef.current.crystals.forEach((c) => gameRef.current.scene?.remove(c)); gameRef.current.crystals = [];
    const lanes = [-3.0, 0.0, 3.0]; const colors = [0x00f2ff, 0x00ff87, 0xff007f];
    const geom = new THREE.IcosahedronGeometry(0.3, 0);
    lanes.forEach((xPos, idx) => {
      if (Math.random() > 0.4) {
        const mat = new THREE.MeshStandardMaterial({ color: colors[idx], emissive: colors[idx], emissiveIntensity: 0.7, roughness: 0.1, metalness: 0.9 });
        const mesh = new THREE.Mesh(geom, mat); mesh.position.set(xPos, 0.5, zOffset + (Math.random() - 0.5) * 6);
        gameRef.current.scene?.add(mesh); gameRef.current.crystals.push(mesh);
      }
    });
  };

  const setupGates = (question: Question) => {
    if (!gameRef.current.scene || !question?.options) return;
    if (gameRef.current.gatesGroup) gameRef.current.scene.remove(gameRef.current.gatesGroup);

    // Clear obstacles near the gate zone to prevent visual overlap
    for (let i = gameRef.current.obstacles.length - 1; i >= 0; i--) {
      const obs = gameRef.current.obstacles[i];
      if (obs.obj.position.z > -30) {
        gameRef.current.scene.remove(obs.obj);
        obs.obj.traverse((child) => { if (child instanceof THREE.Mesh) { child.geometry.dispose(); (child.material as THREE.Material).dispose(); } });
        gameRef.current.obstacles.splice(i, 1);
      }
    }

    const mainGroup = new THREE.Group();
    const lPos = [-3.0, 0.0, 3.0]; const neonColors = [0x00f2ff, 0x00ff87, 0xff007f];
    const pillarGeom = new THREE.BoxGeometry(0.2, 3.2, 0.2); const topGeom = new THREE.BoxGeometry(2.6, 0.2, 0.2);
    question.options.forEach((optText, idx) => {
      const gateSubGroup = new THREE.Group(); gateSubGroup.position.set(lPos[idx], 0, 0);
      const color = neonColors[idx];
      const gateMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.5, roughness: 0.1 });
      const lp = new THREE.Mesh(pillarGeom, gateMat); lp.position.set(-1.2, 1.6, 0); gateSubGroup.add(lp);
      const rp = new THREE.Mesh(pillarGeom, gateMat); rp.position.set(1.2, 1.6, 0); gateSubGroup.add(rp);
      const tb = new THREE.Mesh(topGeom, gateMat); tb.position.set(0, 3.1, 0); gateSubGroup.add(tb);
      const sprite = createTextSprite(`${["A","B","C"][idx]}: ${optText}`, `#${new THREE.Color(color).getHexString()}`, "rgba(15,23,42,0.9)");
      sprite.position.set(0, 3.9, 0); gateSubGroup.add(sprite);
      const field = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.0), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
      field.position.set(0, 1.5, 0); gateSubGroup.add(field); mainGroup.add(gateSubGroup);
    });
    mainGroup.position.set(0, 0, gameRef.current.gatesDistance);
    gameRef.current.scene.add(mainGroup); gameRef.current.gatesGroup = mainGroup;
  };

  // ── Gate collision — NO PAUSE, continuous gameplay ────────────────
  const handleGateCollision = () => {
    if (gameEndedRef.current) return;
    const activeQ = questionsList[currentIdxRef.current];
    if (!activeQ) return;
    const xPos = gameRef.current.player?.position.x || 0;
    let selectedLaneIdx = 1;
    if (xPos < -1.5) selectedLaneIdx = 0;
    else if (xPos > 1.5) selectedLaneIdx = 2;
    const isCorrect = selectedLaneIdx === activeQ.correctIdx;
    const selectedText = activeQ.options[selectedLaneIdx];
    const correctText = activeQ.options[activeQ.correctIdx];
    const toastId = Date.now();

    if (isCorrect) {
      audioEngine.playCorrect();
      spawnExplosionParticles(new THREE.Vector3(xPos, 1.0, 4), themeHexColor, 40);
      correctCountRef.current += 1;
      const pts = 100 * multiplierRef.current;
      scoreRef.current += pts;
      setScore((prev) => prev + pts);
      setMultiplier((prev) => Math.min(prev + 1, 8));
      answerHistoryRef.current.push({ questionPrompt: activeQ.prompt, selectedAnswer: selectedText, correctAnswer: correctText, isCorrect: true, pointsEarned: pts, questionIndex: currentIdxRef.current });
      setToastFeedback({ isCorrect: true, points: pts, correctAnswer: correctText, selectedAnswer: selectedText, id: toastId });
    } else {
      audioEngine.playIncorrect();
      spawnExplosionParticles(new THREE.Vector3(xPos, 1.0, 4), 0xff0000, 40);
      if (!configRef.current.invincible) setHealth((prev) => Math.max(0, prev - (configRef.current.lifeLossPerMistake ?? 1)));
      setMultiplier(1);
      answerHistoryRef.current.push({ questionPrompt: activeQ.prompt, selectedAnswer: selectedText, correctAnswer: correctText, isCorrect: false, pointsEarned: 0, questionIndex: currentIdxRef.current });
      setToastFeedback({ isCorrect: false, points: 0, correctAnswer: correctText, selectedAnswer: selectedText, id: toastId });
    }

    setTimeout(() => setToastFeedback((p) => (p?.id === toastId ? null : p)), 1800);

    const nextIdx = currentIdxRef.current + 1;
    currentIdxRef.current = nextIdx;
    setCurrentIdx(nextIdx);

    if (nextIdx >= questionsList.length) {
      // All questions done — end game after final toast
      setTimeout(() => {
        if (!gameEndedRef.current) {
          gameEndedRef.current = true;
          setIsVictory(true);
          audioEngine.playLevelSuccess();
          onGameCompletedRef.current(scoreRef.current, correctCountRef.current, questionsList.length, obstacleHitsRef.current, [...answerHistoryRef.current]);
        }
      }, 2000);
      return;
    }

    // Setup next gate — game keeps rolling
    const nextQ = questionsList[nextIdx];
    setTimeout(() => {
      gameRef.current.gatesDistance = -100;
      if (gameRef.current.scene) { setupGates(nextQ); setupCrystals(gameRef.current.gatesDistance + 40); }
    }, 100);
  };

  // Always keep ref current so animation loop gets latest closure
  gateCollisionRef.current = handleGateCollision;

  // ── Main 3D scene setup (runs ONCE per playerRole) ────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const w = container.clientWidth || 400;
    const h = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    scene.fog = new THREE.FogExp2(0x060814, 0.015);
    gameRef.current.scene = scene;

    const aspect = w / h;
    const fov = aspect < 0.8 ? 82 : aspect < 1.2 ? 72 : 60;
    const camZ = aspect < 0.8 ? 12 : 9;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 200);
    camera.position.set(0, 3.5, camZ); camera.lookAt(0, 1.2, 1);
    gameRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = ""; container.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); dirLight.position.set(5, 10, 7); scene.add(dirLight);
    const floorLight = new THREE.PointLight(themeHexColor, 2, 25); floorLight.position.set(0, 0.5, 3); scene.add(floorLight);

    const gridHelper = new THREE.GridHelper(80, 40, themeHexColor, 0x1e293b); scene.add(gridHelper); gameRef.current.gridFloor = gridHelper;

    const roadLineMat = new THREE.MeshBasicMaterial({ color: themeHexColor });
    const roadLineGeom = new THREE.BoxGeometry(0.08, 0.02, 40);
    const lineRoot = new THREE.Group();
    [-4.5, -1.5, 1.5, 4.5].forEach((x) => { const m = new THREE.Mesh(roadLineGeom, roadLineMat); m.position.set(x, 0, -10); lineRoot.add(m); });
    scene.add(lineRoot); gameRef.current.roadLineMeshesRoot = lineRoot;

    const starCount = 180; const starGeom = new THREE.BufferGeometry(); const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) { starPos[i] = (Math.random() - 0.5) * 60; starPos[i + 1] = Math.random() * 20 + 2; starPos[i + 2] = -Math.random() * 80; }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starfield = new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.7 }));
    scene.add(starfield); gameRef.current.starfield = starfield;

    const playerGroup = new THREE.Group(); playerGroup.position.set(0, 0.8, 4); scene.add(playerGroup); gameRef.current.player = playerGroup;
    const coreMat = new THREE.MeshStandardMaterial({ color: themeHexColor, emissive: themeHexColor, emissiveIntensity: 1.2, roughness: 0.2, metalness: 0.8 });
    const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 20), coreMat); playerGroup.add(coreSphere);
    const ringMat = new THREE.MeshBasicMaterial({ color: themeHexColor });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.02, 6, 25), ringMat); playerGroup.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.02, 6, 25), ringMat); ring2.rotation.x = Math.PI / 2; playerGroup.add(ring2);
    gameRef.current.orbitRings = [ring1, ring2];

    gameRef.current.nextObstacleTime = Date.now() + 12000 + Math.random() * 6000;
    if (questionsList?.length > 0) setupGates(questionsList[0]);
    setupCrystals(-45);

    const resizeObserver = new ResizeObserver(() => {
      if (!gameRef.current.renderer || !gameRef.current.camera) return;
      const nw = container.clientWidth; const nh = container.clientHeight; if (!nw || !nh) return;
      const na = nw / nh;
      gameRef.current.camera.aspect = na;
      gameRef.current.camera.fov = na < 0.8 ? 82 : na < 1.2 ? 72 : 60;
      gameRef.current.camera.updateProjectionMatrix(); gameRef.current.renderer.setSize(nw, nh);
    });
    resizeObserver.observe(container);

    const animate = () => {
      gameRef.current.requestFrameId = requestAnimationFrame(animate);
      coreSphere.rotation.y += 0.015; ring1.rotation.y += 0.02; ring1.rotation.x += 0.01;
      ring2.rotation.x += 0.025; ring2.rotation.z += 0.01;
      starfield.rotation.y += 0.00035; starfield.rotation.x += 0.0001;
      gameRef.current.crystals.forEach((c, i) => { c.rotation.y += 0.02; c.rotation.x += 0.01; c.position.y = 0.5 + Math.sin(Date.now() * 0.003 + i) * 0.1; });
      for (const obs of gameRef.current.obstacles) { obs.obj.rotation.x += 0.04; obs.obj.rotation.y += 0.06; obs.obj.rotation.z += 0.02; }
      for (let i = gameRef.current.particles.length - 1; i >= 0; i--) {
        const p = gameRef.current.particles[i]; p.mesh.position.add(p.velocity); p.life -= 0.022;
        (p.mesh.material as THREE.Material).opacity = p.life;
        if (p.life <= 0) { scene.remove(p.mesh); p.mesh.geometry.dispose(); (p.mesh.material as THREE.Material).dispose(); gameRef.current.particles.splice(i, 1); }
      }
      if (isPausedRef.current) { renderer.render(scene, camera); return; }

      const targetX = (gameRef.current.targetLane - 1) * 3.0;
      playerGroup.position.x += (targetX - playerGroup.position.x) * 0.22;
      const bankingAngle = (targetX - playerGroup.position.x) * -0.15;
      playerGroup.rotation.z += (bankingAngle - playerGroup.rotation.z) * 0.2;
      camera.position.x += (playerGroup.position.x * 0.38 - camera.position.x) * 0.07;

      if (gameRef.current.isJumping) {
        gameRef.current.playerY += gameRef.current.playerVelocityY; gameRef.current.playerVelocityY -= 0.015;
        if (gameRef.current.playerY <= 0) { gameRef.current.playerY = 0; gameRef.current.playerVelocityY = 0; gameRef.current.isJumping = false; }
        playerGroup.position.y = 0.8 + gameRef.current.playerY;
      }

      gridHelper.position.z += gameRef.current.speedFactor; if (gridHelper.position.z >= 20) gridHelper.position.z = 0;
      lineRoot.children.forEach((l) => { l.position.z += gameRef.current.speedFactor; if (l.position.z >= 20) l.position.z = -20; });

      for (let i = gameRef.current.crystals.length - 1; i >= 0; i--) {
        const crystal = gameRef.current.crystals[i]; crystal.position.z += gameRef.current.speedFactor;
        if (playerGroup.position.distanceTo(crystal.position) < 0.85) {
          audioEngine.playScorePopup(); spawnExplosionParticles(crystal.position, themeHexColor, 15);
          scoreRef.current += 35; setScore((prev) => prev + 35); scene.remove(crystal); gameRef.current.crystals.splice(i, 1);
        } else if (crystal.position.z > 12) { scene.remove(crystal); gameRef.current.crystals.splice(i, 1); }
      }

      // ── Gates: remove on pass-through, call handler, keep rolling ──
      if (gameRef.current.gatesGroup) {
        gameRef.current.gatesGroup.position.z += gameRef.current.speedFactor;
        if (gameRef.current.gatesGroup.position.z >= 4.0) {
          scene.remove(gameRef.current.gatesGroup);
          gameRef.current.gatesGroup = null;
          gateCollisionRef.current(); // always latest closure via ref
        }
      }

      const nowTime = Date.now();
      // Only spawn obstacles when gate is far away (prevents overlap)
      const gateNearby = gameRef.current.gatesGroup ? gameRef.current.gatesGroup.position.z > -45 : false;
      if (gameRef.current.nextObstacleTime > 0 && nowTime > gameRef.current.nextObstacleTime && !gateNearby) {
        const spawnFirewall = Math.random() > 0.45; // 45% chance of a dual-lane firewall obstacle
        if (gameRef.current.scene) {
          if (spawnFirewall) {
            // Create a Dual-Lane Laser Firewall!
            const firewallGroup = new THREE.Group();
            const safeLane = Math.floor(Math.random() * 3); // 0 = Left, 1 = Mid, 2 = Right
            firewallGroup.position.set(0, 0, -65); // Spawns centered on track

            // Create glowing laser grid block(s) to show which lanes are blocked
            const wallGeom = new THREE.BoxGeometry(2.4, 3.2, 0.4);
            const wallMat = new THREE.MeshStandardMaterial({
              color: 0xff0055,
              emissive: 0xff0055,
              emissiveIntensity: 2.5,
              transparent: true,
              opacity: 0.65,
              roughness: 0.2,
              metalness: 0.8
            });

            // Construct walls blocking the other two lanes
            if (safeLane === 0) {
              // Block Mid (x=0) and Right (x=3.0) -> a single wide wall at x=1.5
              const wall = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 0.4), wallMat);
              wall.position.set(1.5, 1.6, 0);
              firewallGroup.add(wall);
              // Add some vertical border pillars for aesthetic high-tech look
              const pillarGeom = new THREE.BoxGeometry(0.15, 3.2, 0.15);
              const pillarMat = new THREE.MeshBasicMaterial({ color: 0xff0088 });
              [-0.9, 3.9].forEach(px => {
                const p = new THREE.Mesh(pillarGeom, pillarMat);
                p.position.set(px, 1.6, 0);
                firewallGroup.add(p);
              });
            } else if (safeLane === 2) {
              // Block Left (x=-3.0) and Mid (x=0) -> a single wide wall at x=-1.5
              const wall = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 0.4), wallMat);
              wall.position.set(-1.5, 1.6, 0);
              firewallGroup.add(wall);
              const pillarGeom = new THREE.BoxGeometry(0.15, 3.2, 0.15);
              const pillarMat = new THREE.MeshBasicMaterial({ color: 0xff0088 });
              [-3.9, 0.9].forEach(px => {
                const p = new THREE.Mesh(pillarGeom, pillarMat);
                p.position.set(px, 1.6, 0);
                firewallGroup.add(p);
              });
            } else {
              // safeLane === 1 (Mid is safe) -> block Left (x=-3.0) and Right (x=3.0) with separate walls
              const wallLeft = new THREE.Mesh(wallGeom, wallMat);
              wallLeft.position.set(-3.0, 1.6, 0);
              firewallGroup.add(wallLeft);
              const wallRight = new THREE.Mesh(wallGeom, wallMat);
              wallRight.position.set(3.0, 1.6, 0);
              firewallGroup.add(wallRight);

              const pillarGeom = new THREE.BoxGeometry(0.15, 3.2, 0.15);
              const pillarMat = new THREE.MeshBasicMaterial({ color: 0xff0088 });
              [-4.2, -1.8, 1.8, 4.2].forEach(px => {
                const p = new THREE.Mesh(pillarGeom, pillarMat);
                p.position.set(px, 1.6, 0);
                firewallGroup.add(p);
              });
            }

            // Add a floating warning sign sprite above the firewall
            const warningSprite = createTextSprite("⚡ DUAL FIREWALL ⚡", "#ff0055", "rgba(60,10,20,0.95)");
            warningSprite.position.set((safeLane === 1 ? 0.0 : safeLane === 0 ? 1.5 : -1.5), 3.8, 0);
            firewallGroup.add(warningSprite);

            gameRef.current.scene.add(firewallGroup);
            gameRef.current.obstacles.push({ obj: firewallGroup, type: "firewall", safeLane });
          } else {
            // Spawn standard mine (jumpable, single lane)
            const obsLane = Math.floor(Math.random() * 3);
            const mineGroup = new THREE.Group();
            mineGroup.position.set((obsLane - 1) * 3.0, 1.0, -65); // spawn further back
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3d1a1a, roughness: 0.85, metalness: 0.15 });
            mineGroup.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), bodyMat));
            const spikeMat = new THREE.MeshStandardMaterial({ color: 0xff1a00, emissive: 0xff1a00, emissiveIntensity: 3.0, roughness: 0.1, metalness: 0.8 });
            const spikeGeom = new THREE.ConeGeometry(0.14, 1.0, 6);
            [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0.7,0.7,0],[-0.7,0.7,0],[0.7,-0.7,0],[-0.7,-0.7,0]].forEach(([dx,dy,dz]) => {
              const spike = new THREE.Mesh(spikeGeom, spikeMat); const dir = new THREE.Vector3(dx, dy, dz).normalize();
              spike.position.copy(dir.clone().multiplyScalar(0.72)); spike.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir); mineGroup.add(spike);
            });
            const rMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
            const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.07, 8, 32), rMat);
            const r2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.07, 8, 32), rMat); r2.rotation.x = Math.PI / 2;
            mineGroup.add(r1); mineGroup.add(r2);
            gameRef.current.scene.add(mineGroup);
            gameRef.current.obstacles.push({ obj: mineGroup, lane: obsLane, type: "mine" });
          }
        }
        gameRef.current.nextObstacleTime = nowTime + 6500 + Math.random() * 5500;
      }

      for (let i = gameRef.current.obstacles.length - 1; i >= 0; i--) {
        const obs = gameRef.current.obstacles[i]; obs.obj.position.z += gameRef.current.speedFactor;
        if (obs.obj.position.z > 12) {
          scene.remove(obs.obj); obs.obj.traverse((c) => { if (c instanceof THREE.Mesh) { c.geometry.dispose(); (c.material as THREE.Material).dispose(); } });
          gameRef.current.obstacles.splice(i, 1); continue;
        }
        if (obs.obj.position.z > 3.0 && obs.obj.position.z < 5.8 && nowTime > gameRef.current.obstacleHitCooldown) {
          const px = playerGroup.position.x;
          const py = playerGroup.position.y;
          let isHit = false;

          if (obs.type === "firewall") {
            let playerLane = 1;
            if (px < -1.5) playerLane = 0;
            else if (px > 1.5) playerLane = 2;
            
            // Firewall blocks two lanes and is too tall to jump over normally
            if (playerLane !== obs.safeLane && py < 3.5) {
              isHit = true;
            }
          } else {
            // Standard jumpable mine
            if (Math.abs(px - obs.obj.position.x) < 1.3 && py < 1.9) {
              isHit = true;
            }
          }

          if (isHit) {
            gameRef.current.obstacleHitCooldown = nowTime + 1500;
            obstacleHitsRef.current += 1; setObstacleHitsCount((p) => p + 1);
            setObstacleFlash(true); setTimeout(() => setObstacleFlash(false), 380);
            
            const explodePos = new THREE.Vector3(px, py, obs.obj.position.z);
            spawnExplosionParticles(explodePos, 0xff2200, 30);
            audioEngine.playIncorrect();
            
            scene.remove(obs.obj); 
            obs.obj.traverse((c) => { if (c instanceof THREE.Mesh) { c.geometry.dispose(); (c.material as THREE.Material).dispose(); } });
            gameRef.current.obstacles.splice(i, 1);
            
            if (!configRef.current.invincible) {
              if (configRef.current.continueOnZeroHealth) {
                const penalty = Math.floor(Math.random() * 151) + 50;
                scoreRef.current = Math.max(0, scoreRef.current - penalty);
                setScore((prev) => Math.max(0, prev - penalty));
                const penId = nowTime; setFloatingPenalty({ pts: penalty, id: penId });
                setTimeout(() => setFloatingPenalty((p) => (p?.id === penId ? null : p)), 1400);
              } else { setHealth((prev) => Math.max(0, prev - 1)); }
            }
          }
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(gameRef.current.requestFrameId); resizeObserver.disconnect();
      gameRef.current.obstacles.forEach((obs) => { scene.remove(obs.obj); obs.obj.traverse((c) => { if (c instanceof THREE.Mesh) { c.geometry.dispose(); (c.material as THREE.Material).dispose(); } }); });
      gameRef.current.obstacles = [];
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      scene.clear(); renderer.dispose();
    };
  }, [playerRole]); // ← Scene init ONCE; questions advanced via handleGateCollision

  if (!questionsList?.length) {
    return (
      <div className="w-full h-full min-h-[200px] bg-[#060814] flex flex-col items-center justify-center p-6 text-center text-white font-sans">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black font-mono text-rose-400">NO QUESTIONS DETECTED</h2>
        <p className="text-slate-400 text-sm mt-3 max-w-sm">Please add questions in the Teacher Panel.</p>
        <button onClick={onExit} className="mt-6 px-6 py-3 bg-teal-500 text-slate-950 font-bold uppercase text-xs rounded-xl cursor-pointer">Return to Menu</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[200px] flex flex-col bg-[#060814] font-sans select-none" id="three-game-playground" style={{ touchAction: "none", overflow: "hidden", maxWidth: "100vw" }} onTouchStart={triggerJump}>
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ width: "100%", height: "100%" }} id="threejs-canvas" />

      {obstacleFlash && <div className="absolute inset-0 z-30 pointer-events-none bg-red-600/50" />}

      {floatingPenalty && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
          <div className="bg-red-900/95 border border-red-500 text-red-200 font-black font-mono text-base px-4 py-2 rounded-2xl shadow-2xl">−{floatingPenalty.pts} pts</div>
        </div>
      )}

      {/* ── GATE RESULT TOAST — floats above HUD, game keeps rolling ── */}
      <AnimatePresence>
        {toastFeedback && (
          <motion.div key={toastFeedback.id} initial={{ opacity: 0, y: -20, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -28, scale: 0.85 }} transition={{ duration: 0.2 }} className="absolute top-[70px] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <div className={`px-5 py-3 rounded-2xl border-2 shadow-2xl backdrop-blur-md text-center min-w-[230px] ${toastFeedback.isCorrect ? "bg-emerald-950/95 border-emerald-400" : "bg-rose-950/95 border-rose-400"}`}>
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <span className="text-2xl">{toastFeedback.isCorrect ? "✅" : "❌"}</span>
                <span className={`text-sm font-black font-mono uppercase tracking-wider ${toastFeedback.isCorrect ? "text-emerald-200" : "text-rose-200"}`}>
                  {toastFeedback.isCorrect ? `+${toastFeedback.points} PTS!` : "WRONG!"}
                </span>
              </div>
              {toastFeedback.isCorrect ? (
                <p className="text-[10px] text-emerald-300 font-mono">{multiplier > 1 ? `🔥 ${multiplier}x Multiplier active!` : "Correct! Keep going!"}</p>
              ) : (
                <p className="text-[10px] text-slate-300 font-mono">✓ Correct: <strong className="text-emerald-300">{toastFeedback.correctAnswer}</strong></p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP HUD ── */}
      <div className="relative z-10 w-full px-2 pt-2 pb-1 flex items-center justify-between gap-2" onTouchStart={(e) => e.stopPropagation()}>
        {/* Score + Lives */}
        <div className="backdrop-blur-md bg-slate-950/90 px-2.5 py-1.5 rounded-2xl border border-white/10 shadow-xl pointer-events-auto flex items-center gap-2 text-white shrink-0">
          <div className="flex flex-col text-left min-w-0">
            <span className={`text-[8px] md:text-[10px] ${themeTailwindText} font-bold tracking-widest font-mono uppercase leading-none`}>{themeLabel}</span>
            <span className={`text-sm md:text-base font-black ${themeTailwindTextBright} tabular-nums leading-tight`}>{score.toLocaleString()} pts</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex gap-0.5">
              {config.invincible ? <span className={`text-sm ${themeTailwindText} font-black`}>∞</span> :
                Array.from({ length: Math.min(config.startingLives ?? 3, 10) }, (_, i) => i + 1).map((h) => (
                  <Heart key={h} className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-all ${h <= health ? `fill-current ${themeTailwindText}` : "text-slate-800"}`} />
                ))
              }
            </div>
            <div className={`px-1.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black ${themeTailwindBg} ${themeTailwindText}`}>{multiplier}x</div>
          </div>
        </div>

        {/* Timer */}
        <div className="backdrop-blur-md bg-slate-950/80 px-2 py-1 rounded-xl border border-white/5 shadow-md pointer-events-none flex flex-col items-center shrink-0">
          <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest leading-none">TIME</span>
          <span className={`text-sm md:text-lg font-black font-mono tabular-nums leading-tight ${timeLeft <= 15 ? "text-rose-400 animate-pulse" : "text-white"}`}>{timeLeft}s</span>
        </div>

        {/* Progress + MENU BUTTON */}
        <div className="backdrop-blur-md bg-slate-950/80 p-1.5 rounded-xl border border-white/5 shadow-md pointer-events-auto flex items-center gap-1.5 shrink-0" onTouchStart={(e) => e.stopPropagation()}>
          <div className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-bold font-mono text-[8px] border border-white/10">{Math.min(currentIdx + 1, questionsList.length)}/{questionsList.length}</div>
          {obstacleHitsCount > 0 && <div className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-400 font-bold font-mono text-[8px] border border-red-800/50">💥{obstacleHitsCount}</div>}
          {/* Prominent always-visible rose MENU button - Hidden in duel mode to prevent overlapping HUD elements */}
          {playerRole === "single" && (
            <button
              onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); handleExitClick(); }}
              onClick={handleExitClick}
              className={`min-h-[40px] px-3 py-1.5 text-[11px] font-black font-mono tracking-wider rounded-xl transition-all border-2 cursor-pointer uppercase flex items-center gap-1.5 shadow-lg ${exitConfirmActive ? "bg-rose-500 border-rose-300 text-white animate-pulse scale-105" : "bg-rose-700 border-rose-500 text-white hover:bg-rose-500 hover:border-rose-300"}`}
              id="exit-game-btn" title="Back to Menu"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{exitConfirmActive ? "Confirm?" : "MENU"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM HUD ── */}
      <div className="relative z-10 w-full mt-auto px-2 pt-1" style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))' }} onTouchStart={(e) => e.stopPropagation()}>
        <div className="w-full bg-slate-950/95 border border-white/10 backdrop-blur-md p-2.5 md:p-4 rounded-3xl shadow-2xl pointer-events-auto flex flex-col items-center gap-2">
          <div className="w-full text-center">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">Q{Math.min(currentIdx + 1, questionsList.length)}/{questionsList.length} • CORRIDOR ENIGMA</span>
            <h2 className="text-white text-xs md:text-sm font-bold leading-snug px-1">{currentQuestion?.prompt || "Steer through the correct gate!"}</h2>
          </div>
          <div className="w-full grid grid-cols-3 gap-1.5">
            {currentQuestion?.options.map((opt, idx) => {
              const palette = [
                { border: "border-cyan-500/40", text: "text-cyan-300", activeBg: "bg-cyan-500/20 border-cyan-400", glow: "shadow-[0_0_14px_rgba(6,182,212,0.4)]" },
                { border: "border-emerald-500/40", text: "text-emerald-300", activeBg: "bg-emerald-500/20 border-emerald-400", glow: "shadow-[0_0_14px_rgba(52,211,153,0.4)]" },
                { border: "border-pink-500/40", text: "text-pink-300", activeBg: "bg-pink-500/20 border-pink-400", glow: "shadow-[0_0_14px_rgba(244,114,182,0.4)]" },
              ];
              const p = palette[idx]; const label = ["A","B","C"][idx]; const dir = ["← LEFT","● MID","RIGHT →"][idx]; const isActive = gameRef.current.targetLane === idx;
              return (
                <button key={idx} onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); setLane(idx); }} onClick={() => setLane(idx)}
                  className={`relative p-2 rounded-xl border flex flex-col items-center justify-center min-h-[62px] md:min-h-[72px] bg-slate-900/60 transition-all active:scale-95 cursor-pointer ${isActive ? `${p.activeBg} ${p.glow} ring-1` : `${p.border} hover:bg-slate-800/60`}`}>
                  <span className="text-[7px] font-bold text-slate-500 uppercase font-mono leading-none mb-0.5">{label}</span>
                  <span className="text-[9px] md:text-[11px] font-black text-center leading-tight">{opt}</span>
                  <span className={`text-[7px] font-mono ${p.text} opacity-70 mt-0.5`}>{dir}</span>
                  {isActive && <span className={`absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse ${isP1 ? "bg-pink-400" : isP2 ? "bg-cyan-400" : "bg-teal-400"}`} />}
                </button>
              );
            })}
          </div>
          <button onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); triggerJump(); }} onClick={triggerJump}
            className={`w-full py-3.5 rounded-2xl border-2 font-black text-sm tracking-widest uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg ${themeTailwindBg} ${themeTailwindText}`} style={{ minHeight: '52px' }}>
            ↑ JUMP
          </button>
          <p className="text-[7px] text-slate-600 font-mono text-center">Tap answer to steer · Tap 3D area / JUMP button to leap · <span className="text-orange-500/70">Jump over red obstacles!</span></p>
        </div>
      </div>

      {/* ── VICTORY ── */}
      {isVictory && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
          <Trophy className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-black font-mono text-amber-300">ALL ROUNDS COMPLETE!</h2>
          <p className="text-slate-400 text-xs mt-1">Loading scoreboard...</p>
          <div className="mt-4 font-mono text-[10px] text-teal-400 animate-pulse">TRANSMITTING METRICS...</div>
        </div>
      )}

      {/* ── GAME OVER ── */}
      {isGameOver && (
        <div className="absolute inset-0 z-40 bg-red-950/95 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-black font-mono text-rose-400">Droid Defect!</h2>
          <p className="text-slate-400 text-xs mt-1">Shields exhausted — try again!</p>
          <div className="mt-4 font-mono text-[10px] text-red-400 animate-pulse">TRANSMITTING SCORE...</div>
        </div>
      )}
    </div>
  );
}
