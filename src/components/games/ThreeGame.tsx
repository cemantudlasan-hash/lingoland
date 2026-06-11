"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Question, GameConfig } from "@/lib/game-types-corridor";
import { audioEngine } from "../AudioEngine";
import { Sparkles, Trophy, Heart, ShieldAlert, Sparkle, RotateCcw, LogOut } from "lucide-react";

interface ThreeGameProps {
  config: GameConfig;
  playerRole?: "single" | "p1" | "p2";
  onGameCompleted: (score: number, correctCount: number, totalCount: number, obstacleHits?: number) => void;
  onExit: () => void;
}

export default function ThreeGame({
  config,
  playerRole = "single",
  onGameCompleted,
  onExit,
}: ThreeGameProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // ── React state ──────────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [streak, setStreak] = useState(0);
  const [health, setHealth] = useState(config.startingLives ?? 3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [selectedFeedBack, setSelectedFeedBack] = useState<{
    show: boolean;
    isCorrect: boolean;
    selectedText: string;
    correctText: string;
    explanation: string;
  } | null>(null);
  const [obstacleFlash, setObstacleFlash] = useState(false);
  const [obstacleHitsCount, setObstacleHitsCount] = useState(0);
  const [floatingPenalty, setFloatingPenalty] = useState<{ pts: number; id: number } | null>(null);
  const [exitConfirmActive, setExitConfirmActive] = useState(false);

  // ── Constants / derived ──────────────────────────────────────────
  const questionsList = config.activeQuestions;
  const currentQuestion = questionsList[currentIdx];

  const isP1 = playerRole === "p1";
  const isP2 = playerRole === "p2";
  const isSolo = playerRole === "single";

  const themeHexColor = isP1 ? 0xff007f : isP2 ? 0x00f2ff : 0x2dd4bf;
  const themeTailwindText = isP1 ? "text-pink-400" : isP2 ? "text-cyan-400" : "text-teal-400";
  const themeTailwindBg = isP1
    ? "bg-pink-500/10 border-pink-500/20"
    : isP2
    ? "bg-cyan-500/10 border-cyan-500/20"
    : "bg-teal-500/10 border-teal-500/20";
  const themeTailwindTextBright = isP1 ? "text-pink-300" : isP2 ? "text-cyan-300" : "text-teal-300";
  const themeLabel = isP1 ? "PLAYER 1" : isP2 ? "PLAYER 2" : "SOLO CORRIDOR";

  // ── Refs ─────────────────────────────────────────────────────────
  const currentIdxRef = useRef(0);
  const correctCountRef = useRef(0);
  const isPausedRef = useRef(false);
  const obstacleHitsRef = useRef(0);
  const exitConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const multiplierRef = useRef(1);

  // Keep multiplierRef synced so the animation loop can read current multiplier
  useEffect(() => { multiplierRef.current = multiplier; }, [multiplier]);

  // ── 3D engine refs ───────────────────────────────────────────────
  const gameRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    player: THREE.Group | null;
    orbitRings: THREE.Mesh[];
    gridFloor: THREE.GridHelper | null;
    roadLineMeshesRoot: THREE.Group | null;
    gatesGroup: THREE.Group | null;
    starfield: THREE.Points | null;
    crystals: THREE.Mesh[];
    particles: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[];
    obstacles: { obj: THREE.Group; lane: number }[];
    obstacleHitCooldown: number;
    nextObstacleTime: number;
    targetLane: number;
    playerY: number;
    playerVelocityY: number;
    isJumping: boolean;
    speedFactor: number;
    gatesDistance: number;
    requestFrameId: number;
    isPaused: boolean;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    orbitRings: [],
    gridFloor: null,
    roadLineMeshesRoot: null,
    gatesGroup: null,
    starfield: null,
    crystals: [],
    particles: [],
    obstacles: [],
    obstacleHitCooldown: 0,
    nextObstacleTime: 0,
    targetLane: 1,
    playerY: 0,
    playerVelocityY: 0,
    isJumping: false,
    speedFactor: config.speed * 0.06 + 0.01,
    gatesDistance: -100,
    requestFrameId: 0,
    isPaused: false,
  });

  // ── Sync refs with state ─────────────────────────────────────────
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);

  useEffect(() => {
    isPausedRef.current = selectedFeedBack !== null || isGameOver || isVictory;
    gameRef.current.isPaused = isPausedRef.current;
  }, [selectedFeedBack, isGameOver, isVictory]);

  // ✅ SPEED FIX: directly sync speedFactor whenever config.speed changes
  // Formula: 1x=0.07, 2x=0.13, 3x=0.19, 4x=0.25, 5x=0.31 (very fast)
  useEffect(() => {
    gameRef.current.speedFactor = config.speed * 0.06 + 0.01;
  }, [config.speed]);

  // ── Timer countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (selectedFeedBack || isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedFeedBack, isGameOver, isVictory]);

  // ── Monitor timer → end game ─────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0 && !isVictory && !isGameOver) {
      setIsVictory(true);
      audioEngine.playLevelSuccess();
      onGameCompleted(score, correctCountRef.current, questionsList.length, obstacleHitsRef.current);
    }
  }, [timeLeft, isVictory, isGameOver, score, questionsList.length, onGameCompleted]);

  // ── Monitor health → game over ───────────────────────────────────
  useEffect(() => {
    if (health <= 0 && !isGameOver && !isVictory && !config.continueOnZeroHealth && !config.invincible) {
      setIsGameOver(true);
      audioEngine.playIncorrect();
      onGameCompleted(score, correctCountRef.current, questionsList.length, obstacleHitsRef.current);
    }
  }, [health, isGameOver, isVictory, score, questionsList.length, onGameCompleted, config.continueOnZeroHealth, config.invincible]);

  // ── Exit with 2-tap confirm ──────────────────────────────────────
  const handleExitClick = () => {
    if (exitConfirmActive) {
      if (exitConfirmTimerRef.current) clearTimeout(exitConfirmTimerRef.current);
      setExitConfirmActive(false);
      onExit();
    } else {
      setExitConfirmActive(true);
      exitConfirmTimerRef.current = setTimeout(() => setExitConfirmActive(false), 2000);
    }
  };

  // ── Lane & jump controls ─────────────────────────────────────────
  const canMove = () =>
    !isPausedRef.current && !(health <= 0 && !config.invincible && !config.continueOnZeroHealth);

  const moveLeft = () => {
    if (!canMove()) return;
    if (gameRef.current.targetLane > 0) { gameRef.current.targetLane -= 1; audioEngine.playMove(); }
  };

  const moveRight = () => {
    if (!canMove()) return;
    if (gameRef.current.targetLane < 2) { gameRef.current.targetLane += 1; audioEngine.playMove(); }
  };

  const setLane = (lane: number) => {
    if (!canMove()) return;
    if (lane >= 0 && lane <= 2 && lane !== gameRef.current.targetLane) {
      gameRef.current.targetLane = lane;
      audioEngine.playMove();
    }
  };

  const triggerJump = () => {
    if (!canMove()) return;
    if (!gameRef.current.isJumping) {
      gameRef.current.isJumping = true;
      gameRef.current.playerVelocityY = 0.22;
      audioEngine.playMove();
    }
  };

  // ── Keyboard bindings ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || isVictory) return;
      if (e.key === "Escape") { onExit(); return; }
      if (selectedFeedBack) {
        if (e.key === "Enter" || e.key === " ") dismissFeedback();
        return;
      }
      if (isP1) {
        switch (e.key) {
          case "a": case "A": moveLeft(); break;
          case "d": case "D": moveRight(); break;
          case "w": case "W": case " ": triggerJump(); break;
        }
      } else if (isP2) {
        switch (e.key) {
          case "ArrowLeft": moveLeft(); break;
          case "ArrowRight": moveRight(); break;
          case "ArrowUp": triggerJump(); break;
        }
      } else {
        switch (e.key) {
          case "a": case "A": case "ArrowLeft": moveLeft(); break;
          case "d": case "D": case "ArrowRight": moveRight(); break;
          case "w": case "W": case "ArrowUp": case " ": triggerJump(); break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFeedBack, isGameOver, isVictory, health, playerRole]);

  // ── Helpers ──────────────────────────────────────────────────────
  const createTextSprite = (text: string, color: string, bgColor: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Sprite();
    ctx.fillStyle = bgColor;
    ctx.beginPath(); ctx.roundRect(10, 10, 492, 108, 20); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = color; ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px 'Space Grotesk', system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (text.length > 26) {
      ctx.fillText(text.substring(0, 26) + "-", 256, 45);
      ctx.fillText(text.substring(26), 256, 85);
    } else {
      ctx.fillText(text, 256, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(2.8, 0.7, 1);
    return sprite;
  };

  const spawnExplosionParticles = (pos: THREE.Vector3, colorVal: number, count = 40) => {
    const geom = new THREE.SphereGeometry(0.1, 4, 4);
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colorVal, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.28,
        (Math.random() - 0.2) * 0.25 + 0.1,
        (Math.random() - 0.5) * 0.28
      );
      gameRef.current.scene?.add(mesh);
      gameRef.current.particles.push({ mesh, velocity, life: 1.0 });
    }
  };

  const setupCrystals = (zOffset: number) => {
    if (!gameRef.current.scene) return;
    gameRef.current.crystals.forEach((c) => gameRef.current.scene?.remove(c));
    gameRef.current.crystals = [];
    const lanes = [-3.0, 0.0, 3.0];
    const colors = [0x00f2ff, 0x00ff87, 0xff007f];
    const geom = new THREE.IcosahedronGeometry(0.3, 0);
    lanes.forEach((xPos, idx) => {
      if (Math.random() > 0.4) {
        const mat = new THREE.MeshStandardMaterial({ color: colors[idx], emissive: colors[idx], emissiveIntensity: 0.7, roughness: 0.1, metalness: 0.9 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(xPos, 0.5, zOffset + (Math.random() - 0.5) * 6);
        gameRef.current.scene?.add(mesh);
        gameRef.current.crystals.push(mesh);
      }
    });
  };

  const setupGates = (question: Question) => {
    if (!gameRef.current.scene || !question?.options) return;
    if (gameRef.current.gatesGroup) gameRef.current.scene.remove(gameRef.current.gatesGroup);

    const mainGroup = new THREE.Group();
    const lPos = [-3.0, 0.0, 3.0];
    const neonColors = [0x00f2ff, 0x00ff87, 0xff007f];
    const pillarGeom = new THREE.BoxGeometry(0.2, 3.2, 0.2);
    const topGeom = new THREE.BoxGeometry(2.6, 0.2, 0.2);

    question.options.forEach((optText, idx) => {
      const gateSubGroup = new THREE.Group();
      gateSubGroup.position.set(lPos[idx], 0, 0);
      const color = neonColors[idx];
      const gateMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.5, roughness: 0.1 });

      const lp = new THREE.Mesh(pillarGeom, gateMat); lp.position.set(-1.2, 1.6, 0); gateSubGroup.add(lp);
      const rp = new THREE.Mesh(pillarGeom, gateMat); rp.position.set(1.2, 1.6, 0); gateSubGroup.add(rp);
      const tb = new THREE.Mesh(topGeom, gateMat); tb.position.set(0, 3.1, 0); gateSubGroup.add(tb);

      const prefix = ["A", "B", "C"][idx];
      const sprite = createTextSprite(`${prefix}: ${optText}`, `#${new THREE.Color(color).getHexString()}`, "rgba(15,23,42,0.9)");
      sprite.position.set(0, 3.9, 0); gateSubGroup.add(sprite);

      const field = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 3.0),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
      );
      field.position.set(0, 1.5, 0); gateSubGroup.add(field);
      mainGroup.add(gateSubGroup);
    });

    mainGroup.position.set(0, 0, gameRef.current.gatesDistance);
    gameRef.current.scene.add(mainGroup);
    gameRef.current.gatesGroup = mainGroup;
  };

  const handleGateCollision = () => {
    const activeQ = questionsList[currentIdxRef.current];
    if (!activeQ) return;
    const xPos = gameRef.current.player?.position.x || 0;
    let selectedLaneIdx = 1;
    if (xPos < -1.5) selectedLaneIdx = 0;
    else if (xPos > 1.5) selectedLaneIdx = 2;
    const isCorrect = selectedLaneIdx === activeQ.correctIdx;
    isPausedRef.current = true;

    if (isCorrect) {
      audioEngine.playCorrect();
      spawnExplosionParticles(new THREE.Vector3(xPos, 1.0, 4), themeHexColor, 40);
      correctCountRef.current += 1;
      const pts = 100 * multiplierRef.current;
      setScore((prev) => prev + pts);
      setStreak((prev) => prev + 1);
      setMultiplier((prev) => Math.min(prev + 1, 8));
      setSelectedFeedBack({ show: true, isCorrect: true, selectedText: activeQ.options[selectedLaneIdx], correctText: activeQ.options[activeQ.correctIdx], explanation: activeQ.explanation || "Marvelous job! That is completely accurate." });
    } else {
      audioEngine.playIncorrect();
      spawnExplosionParticles(new THREE.Vector3(xPos, 1.0, 4), 0xff0000, 40);
      if (!config.invincible) setHealth((prev) => Math.max(0, prev - (config.lifeLossPerMistake ?? 1)));
      setStreak(0);
      setMultiplier(1);
      setSelectedFeedBack({ show: true, isCorrect: false, selectedText: activeQ.options[selectedLaneIdx], correctText: activeQ.options[activeQ.correctIdx], explanation: activeQ.explanation || "Keep practicing! Passing correct corridors guides your droid safely." });
    }
  };

  const dismissFeedback = () => {
    const nextIndex = currentIdx + 1;
    setSelectedFeedBack(null);
    if (nextIndex >= questionsList.length) {
      setIsVictory(true);
      audioEngine.playLevelSuccess();
      onGameCompleted(score, correctCountRef.current, questionsList.length, obstacleHitsRef.current);
      return;
    }
    gameRef.current.gatesDistance = -100;
    setCurrentIdx(nextIndex);
    setupGates(questionsList[nextIndex]);
    setupCrystals(gameRef.current.gatesDistance + 40);
    isPausedRef.current = false;
  };

  // ── Main 3D scene setup ──────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    scene.fog = new THREE.FogExp2(0x060814, 0.015);
    gameRef.current.scene = scene;

    // Use wider FOV on narrow/portrait screens so all 3 lanes are visible
    const aspect = w / h;
    const fov = aspect < 0.8 ? 82 : aspect < 1.2 ? 72 : 60;
    const camZ = aspect < 0.8 ? 12 : 9;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 200);
    camera.position.set(0, 3.5, camZ);
    camera.lookAt(0, 1.2, 1);
    gameRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    const floorLight = new THREE.PointLight(themeHexColor, 2, 25);
    floorLight.position.set(0, 0.5, 3);
    scene.add(floorLight);

    const gridHelper = new THREE.GridHelper(80, 40, themeHexColor, 0x1e293b);
    scene.add(gridHelper);
    gameRef.current.gridFloor = gridHelper;

    const roadLineMat = new THREE.MeshBasicMaterial({ color: themeHexColor });
    const roadLineGeom = new THREE.BoxGeometry(0.08, 0.02, 40);
    const lineRoot = new THREE.Group();
    [-4.5, -1.5, 1.5, 4.5].forEach((x) => {
      const m = new THREE.Mesh(roadLineGeom, roadLineMat);
      m.position.set(x, 0, -10);
      lineRoot.add(m);
    });
    scene.add(lineRoot);
    gameRef.current.roadLineMeshesRoot = lineRoot;

    const starCount = 180;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 60;
      starPos[i + 1] = Math.random() * 20 + 2;
      starPos[i + 2] = -Math.random() * 80;
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starfield = new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.7 }));
    scene.add(starfield);
    gameRef.current.starfield = starfield;

    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0.8, 4);
    scene.add(playerGroup);
    gameRef.current.player = playerGroup;

    const coreMat = new THREE.MeshStandardMaterial({ color: themeHexColor, emissive: themeHexColor, emissiveIntensity: 1.2, roughness: 0.2, metalness: 0.8 });
    const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 20), coreMat);
    playerGroup.add(coreSphere);

    const ringMat = new THREE.MeshBasicMaterial({ color: themeHexColor });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.02, 6, 25), ringMat);
    playerGroup.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.02, 6, 25), ringMat);
    ring2.rotation.x = Math.PI / 2;
    playerGroup.add(ring2);
    gameRef.current.orbitRings = [ring1, ring2];

    // Schedule first obstacle after 12-18 seconds from game start
    gameRef.current.nextObstacleTime = Date.now() + 12000 + Math.random() * 6000;

    if (questionsList?.length > 0) setupGates(questionsList[0]);
    setupCrystals(-45);

    // ── ResizeObserver (accurate for split-screen) ───────────────
    const resizeObserver = new ResizeObserver(() => {
      if (!gameRef.current.renderer || !gameRef.current.camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (!nw || !nh) return;
      const newAspect = nw / nh;
      gameRef.current.camera.aspect = newAspect;
      // Recompute FOV on orientation change too
      gameRef.current.camera.fov = newAspect < 0.8 ? 82 : newAspect < 1.2 ? 72 : 60;
      gameRef.current.camera.updateProjectionMatrix();
      gameRef.current.renderer.setSize(nw, nh);
    });
    resizeObserver.observe(container);

    // ── Animation loop ───────────────────────────────────────────
    const animate = () => {
      gameRef.current.requestFrameId = requestAnimationFrame(animate);

      // Cosmetic rotations
      coreSphere.rotation.y += 0.015;
      ring1.rotation.y += 0.02; ring1.rotation.x += 0.01;
      ring2.rotation.x += 0.025; ring2.rotation.z += 0.01;
      starfield.rotation.y += 0.00035; starfield.rotation.x += 0.0001;

      gameRef.current.crystals.forEach((crystal, idx) => {
        crystal.rotation.y += 0.02; crystal.rotation.x += 0.01;
        crystal.position.y = 0.5 + Math.sin(Date.now() * 0.003 + idx) * 0.1;
      });

      // Rotate obstacles for visual flair
      for (const obs of gameRef.current.obstacles) {
        obs.obj.rotation.x += 0.04;
        obs.obj.rotation.y += 0.06;
        obs.obj.rotation.z += 0.02;
      }

      // Particle fade + move
      for (let i = gameRef.current.particles.length - 1; i >= 0; i--) {
        const p = gameRef.current.particles[i];
        p.mesh.position.add(p.velocity);
        p.life -= 0.022;
        (p.mesh.material as THREE.Material).opacity = p.life;
        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          const m = p.mesh.material as THREE.Material;
          Array.isArray(m) ? m.forEach((x) => x.dispose()) : m.dispose();
          gameRef.current.particles.splice(i, 1);
        }
      }

      if (isPausedRef.current) { renderer.render(scene, camera); return; }

      // ── Player smooth movement ──────────────────────────────
      const targetX = (gameRef.current.targetLane - 1) * 3.0;
      playerGroup.position.x += (targetX - playerGroup.position.x) * 0.22;
      const bankingAngle = (targetX - playerGroup.position.x) * -0.15;
      playerGroup.rotation.z += (bankingAngle - playerGroup.rotation.z) * 0.2;

      // Camera soft-follows player X → ball always visible on left/right lanes
      camera.position.x += (playerGroup.position.x * 0.38 - camera.position.x) * 0.07;

      // Jump physics
      if (gameRef.current.isJumping) {
        gameRef.current.playerY += gameRef.current.playerVelocityY;
        gameRef.current.playerVelocityY -= 0.015;
        if (gameRef.current.playerY <= 0) {
          gameRef.current.playerY = 0;
          gameRef.current.playerVelocityY = 0;
          gameRef.current.isJumping = false;
        }
        playerGroup.position.y = 0.8 + gameRef.current.playerY;
      }

      // ── Scroll floor + lines ────────────────────────────────
      gridHelper.position.z += gameRef.current.speedFactor;
      if (gridHelper.position.z >= 20) gridHelper.position.z = 0;

      lineRoot.children.forEach((l) => {
        l.position.z += gameRef.current.speedFactor;
        if (l.position.z >= 20) l.position.z = -20;
      });

      // ── Crystals ────────────────────────────────────────────
      for (let i = gameRef.current.crystals.length - 1; i >= 0; i--) {
        const crystal = gameRef.current.crystals[i];
        crystal.position.z += gameRef.current.speedFactor;
        if (playerGroup.position.distanceTo(crystal.position) < 0.85) {
          audioEngine.playScorePopup();
          spawnExplosionParticles(crystal.position, themeHexColor, 15);
          setScore((prev) => prev + 35);
          scene.remove(crystal);
          gameRef.current.crystals.splice(i, 1);
        } else if (crystal.position.z > 12) {
          scene.remove(crystal);
          gameRef.current.crystals.splice(i, 1);
        }
      }

      // ── Gates ───────────────────────────────────────────────
      if (gameRef.current.gatesGroup) {
        gameRef.current.gatesGroup.position.z += gameRef.current.speedFactor;
        if (gameRef.current.gatesGroup.position.z >= 4.0) {
          handleGateCollision();
        }
      }

      // ── Obstacle spawning ───────────────────────────────────
      const nowTime = Date.now();
      const gateNearby = gameRef.current.gatesGroup
        ? gameRef.current.gatesGroup.position.z > -25
        : false;

      if (gameRef.current.nextObstacleTime > 0 && nowTime > gameRef.current.nextObstacleTime && !gateNearby) {
        const obsLane = Math.floor(Math.random() * 3);
        if (gameRef.current.scene) {
          // ── Spike Mine: dark boulder + red cone spikes + warning rings ──
          const mineGroup = new THREE.Group();
          mineGroup.position.set((obsLane - 1) * 3.0, 1.0, -50);

          // Dark stone body
          const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3d1a1a, roughness: 0.85, metalness: 0.15 });
          const bodyMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), bodyMat);
          mineGroup.add(bodyMesh);

          // Red glowing spikes (10 cones in all directions)
          const spikeMat = new THREE.MeshStandardMaterial({
            color: 0xff1a00, emissive: 0xff1a00,
            emissiveIntensity: 3.0, roughness: 0.1, metalness: 0.8,
          });
          const spikeGeom = new THREE.ConeGeometry(0.14, 1.0, 6);
          [
            [0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],
            [0.7,0.7,0],[-0.7,0.7,0],[0.7,-0.7,0],[-0.7,-0.7,0],
          ].forEach(([dx, dy, dz]) => {
            const spike = new THREE.Mesh(spikeGeom, spikeMat);
            const dir = new THREE.Vector3(dx, dy, dz).normalize();
            spike.position.copy(dir.clone().multiplyScalar(0.72));
            spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
            mineGroup.add(spike);
          });

          // Warning glow rings
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
          const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.07, 8, 32), ringMat);
          const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.07, 8, 32), ringMat);
          ring2.rotation.x = Math.PI / 2;
          mineGroup.add(ring1);
          mineGroup.add(ring2);

          gameRef.current.scene.add(mineGroup);
          gameRef.current.obstacles.push({ obj: mineGroup, lane: obsLane });
        }
        // Next obstacle: 8-15 seconds later
        gameRef.current.nextObstacleTime = nowTime + 8000 + Math.random() * 7000;
      }

      // ── Obstacle movement + collision ───────────────────────
      for (let i = gameRef.current.obstacles.length - 1; i >= 0; i--) {
        const obs = gameRef.current.obstacles[i];
        obs.obj.position.z += gameRef.current.speedFactor;

        // Remove if past player
        if (obs.obj.position.z > 12) {
          scene.remove(obs.obj);
          obs.obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              (child.material as THREE.Material).dispose();
            }
          });
          gameRef.current.obstacles.splice(i, 1);
          continue;
        }

        // Collision window: obstacle is near player Z
        if (obs.obj.position.z > 3.0 && obs.obj.position.z < 5.8 && nowTime > gameRef.current.obstacleHitCooldown) {
          const playerX = playerGroup.position.x;
          const playerYPos = playerGroup.position.y;
          const xOverlap = Math.abs(playerX - obs.obj.position.x) < 1.3;
          const notJumpingOver = playerYPos < 1.9; // player can jump over obstacle

          if (xOverlap && notJumpingOver) {
            // ── HIT! ──────────────────────────────────────────
            gameRef.current.obstacleHitCooldown = nowTime + 1500; // 1.5s immunity
            obstacleHitsRef.current += 1;
            setObstacleHitsCount((p) => p + 1);

            // Flash screen red
            setObstacleFlash(true);
            setTimeout(() => setObstacleFlash(false), 380);

            // Particles
            spawnExplosionParticles(obs.obj.position.clone(), 0xff2200, 30);
            audioEngine.playIncorrect();

            // Remove obstacle group
            scene.remove(obs.obj);
            obs.obj.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                (child.material as THREE.Material).dispose();
              }
            });
            gameRef.current.obstacles.splice(i, 1);

            // Apply penalty based on game mode
            if (!config.invincible) {
              if (config.continueOnZeroHealth) {
                // Ignore Zero Lives mode → deduct random 50-200 pts
                const penalty = Math.floor(Math.random() * 151) + 50;
                setScore((prev) => Math.max(0, prev - penalty));
                const penId = nowTime;
                setFloatingPenalty({ pts: penalty, id: penId });
                setTimeout(() => setFloatingPenalty((p) => (p?.id === penId ? null : p)), 1400);
              } else {
                // Normal mode → lose 1 life
                setHealth((prev) => Math.max(0, prev - 1));
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(gameRef.current.requestFrameId);
      resizeObserver.disconnect();

      // Clean up all obstacle groups
      gameRef.current.obstacles.forEach((obs) => {
        scene.remove(obs.obj);
        obs.obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      });
      gameRef.current.obstacles = [];

      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      scene.clear();
      renderer.dispose();
    };
  }, [currentQuestion, playerRole]);

  // ── No questions guard ───────────────────────────────────────────
  if (!questionsList?.length) {
    return (
      <div className="w-full h-full min-h-[200px] bg-[#060814] flex flex-col items-center justify-center p-6 text-center text-white font-sans">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black font-mono text-rose-400">NO QUESTIONS DETECTED</h2>
        <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">
          Please select a preset category or add custom grammar questions in the Teacher Panel.
        </p>
        <button onClick={onExit} className="mt-6 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer shadow-lg">
          Return to Menu
        </button>
      </div>
    );
  }

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full h-full min-h-[200px] flex flex-col bg-[#060814] font-sans select-none"
      id="three-game-playground"
      style={{ touchAction: "none", overflow: "hidden", maxWidth: "100vw" }}
      onTouchStart={() => {
        // Touching the 3D canvas area triggers jump.
        // Answer buttons / HUD divs stop propagation to prevent this.
        triggerJump();
      }}
    >
      {/* 3D Canvas mount */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ width: "100%", height: "100%" }} id="threejs-canvas" />

      {/* ── Obstacle hit flash ─────────────────────────────── */}
      {obstacleFlash && (
        <div className="absolute inset-0 z-30 pointer-events-none bg-red-600/50" />
      )}

      {/* ── Floating point penalty (Ignore Zero Lives mode) ─── */}
      {floatingPenalty && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
          <div className="bg-red-900/95 border border-red-500 text-red-200 font-black font-mono text-base md:text-lg px-4 py-2 rounded-2xl shadow-2xl">
            −{floatingPenalty.pts} pts
          </div>
        </div>
      )}

      {/* ── TOP HUD ──────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full px-2 pt-2 pb-1 flex items-center justify-between gap-2"
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Player stats */}
        <div className="backdrop-blur-md bg-slate-950/90 px-2.5 py-1.5 md:px-3 md:py-2 rounded-2xl border border-white/10 shadow-xl pointer-events-auto flex items-center gap-2 text-white shrink-0">
          <div className="flex flex-col text-left min-w-0">
            <span className={`text-[8px] md:text-[10px] ${themeTailwindText} font-bold tracking-widest font-mono uppercase leading-none`}>
              {themeLabel}
            </span>
            <span className={`text-sm md:text-base font-black ${themeTailwindTextBright} tabular-nums leading-tight`}>
              {score.toLocaleString()} pts
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex gap-0.5 items-center">
              {config.invincible ? (
                <span className={`text-sm ${themeTailwindText} font-black`}>∞</span>
              ) : (
                Array.from({ length: Math.min(config.startingLives ?? 3, 10) }, (_, i) => i + 1).map((h) => (
                  <Heart
                    key={h}
                    className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-all ${
                      h <= health ? `fill-current ${themeTailwindText}` : "text-slate-800"
                    }`}
                  />
                ))
              )}
            </div>
            <div className={`px-1.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black ${themeTailwindBg} ${themeTailwindText}`}>
              {multiplier}x
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="backdrop-blur-md bg-slate-950/80 px-2 py-1 rounded-xl border border-white/5 shadow-md pointer-events-none flex flex-col items-center shrink-0">
          <span className="text-[7px] md:text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">TIME</span>
          <span className={`text-sm md:text-lg font-black font-mono tabular-nums leading-tight ${timeLeft <= 15 ? "text-rose-400 animate-pulse" : "text-white"}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Progress + Exit */}
        <div
          className="backdrop-blur-md bg-slate-950/80 p-1.5 rounded-xl border border-white/5 shadow-md pointer-events-auto flex items-center gap-1.5 shrink-0"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-bold font-mono text-[8px] border border-white/10">
            {currentIdx + 1}/{questionsList.length}
          </div>
          {/* Obstacle hit indicator */}
          {obstacleHitsCount > 0 && (
            <div className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-400 font-bold font-mono text-[8px] border border-red-800/50">
              💥{obstacleHitsCount}
            </div>
          )}
          {/* ← MENU button — prominent rose-red, always visible */}
          <button
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); handleExitClick(); }}
            onClick={handleExitClick}
            className={`min-h-[40px] px-3 py-1.5 text-[10px] font-black font-mono tracking-wider rounded-xl transition-all border-2 cursor-pointer uppercase flex items-center gap-1.5 shadow-lg ${
              exitConfirmActive
                ? "bg-rose-500 border-rose-400 text-white animate-pulse scale-105"
                : "bg-rose-950/80 border-rose-600 text-rose-300 hover:bg-rose-600 hover:text-white hover:border-rose-400"
            }`}
            id="exit-game-btn"
            title="Back to Menu"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>{exitConfirmActive ? "Confirm?" : "Menu"}</span>
          </button>
        </div>
      </div>

      {/* ── BOTTOM HUD: Question + Answers + Jump ─────────────── */}
      <div
        className="relative z-10 w-full mt-auto px-2 pt-1"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))' }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="w-full bg-slate-950/95 border border-white/10 backdrop-blur-md p-2.5 md:p-4 rounded-3xl shadow-2xl pointer-events-auto flex flex-col items-center gap-2">

          {/* Question prompt */}
          <div className="w-full text-center">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">CORRIDOR ENIGMA</span>
            <h2 className="text-white text-xs md:text-sm font-bold font-sans leading-snug px-1">
              {currentQuestion?.prompt || "Solve the challenge to pass through the correct gate!"}
            </h2>
          </div>

          {/* Answer option buttons — tap to steer ball to that lane */}
          <div className="w-full grid grid-cols-3 gap-1.5">
            {currentQuestion?.options.map((opt, idx) => {
              const palette = [
                { border: "border-cyan-500/40", text: "text-cyan-300", activeBg: "bg-cyan-500/20 border-cyan-400", glow: "shadow-[0_0_14px_rgba(6,182,212,0.4)]" },
                { border: "border-emerald-500/40", text: "text-emerald-300", activeBg: "bg-emerald-500/20 border-emerald-400", glow: "shadow-[0_0_14px_rgba(52,211,153,0.4)]" },
                { border: "border-pink-500/40", text: "text-pink-300", activeBg: "bg-pink-500/20 border-pink-400", glow: "shadow-[0_0_14px_rgba(244,114,182,0.4)]" },
              ];
              const p = palette[idx];
              const label = ["A", "B", "C"][idx];
              const dir = ["← LEFT", "● MID", "RIGHT →"][idx];
              const isActive = gameRef.current.targetLane === idx;

              return (
                <button
                  key={idx}
                  onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); setLane(idx); }}
                  onClick={() => setLane(idx)}
                  className={`relative p-2 rounded-xl border flex flex-col items-center justify-center min-h-[62px] md:min-h-[72px] bg-slate-900/60 transition-all active:scale-95 cursor-pointer ${
                    isActive ? `${p.activeBg} ${p.glow} ring-1` : `${p.border} hover:bg-slate-800/60`
                  }`}
                >
                  <span className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase font-mono leading-none mb-0.5">{label}</span>
                  <span className="text-[9px] md:text-[11px] font-black text-center leading-tight">{opt}</span>
                  <span className={`text-[7px] font-mono ${p.text} opacity-70 mt-0.5`}>{dir}</span>
                  {isActive && (
                    <span className={`absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse ${isP1 ? "bg-pink-400" : isP2 ? "bg-cyan-400" : "bg-teal-400"}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* JUMP button — tall and easy to tap on mobile */}
          <button
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); triggerJump(); }}
            onClick={triggerJump}
            className={`w-full py-3.5 rounded-2xl border-2 font-black text-sm tracking-widest uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg ${themeTailwindBg} ${themeTailwindText}`}
            style={{ minHeight: '52px' }}
          >
            ↑ JUMP
          </button>

          <p className="text-[7px] md:text-[8px] text-slate-600 font-mono text-center leading-relaxed">
            Tap answer to steer · Tap 3D area or JUMP button to leap · <span className="text-orange-500/70">Jump over red obstacles!</span>
          </p>
        </div>
      </div>

      {/* ── FEEDBACK MODAL ────────────────────────────────────── */}
      {selectedFeedBack && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-4">
          <div className="bg-slate-900/95 border border-white/10 max-w-sm md:max-w-md w-full p-4 md:p-6 rounded-[28px] text-center shadow-2xl relative overflow-hidden font-sans">
            <div className={`absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-25 ${selectedFeedBack.isCorrect ? "bg-emerald-500" : "bg-rose-500"}`} />
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 border ${selectedFeedBack.isCorrect ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-rose-500/10 border-rose-500 text-rose-400"}`}>
                {selectedFeedBack.isCorrect ? <Sparkles className="w-5 h-5 md:w-6 md:h-6" /> : <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />}
              </div>
              <h3 className={`text-base md:text-xl font-bold font-mono tracking-tight uppercase ${selectedFeedBack.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                {selectedFeedBack.isCorrect ? "Gate Passed!" : "Portal Deflected!"}
              </h3>
              <div className="w-full bg-slate-950/60 p-3 rounded-xl border border-white/5 my-3 text-left text-xs font-mono">
                <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-1">Your Selection:</p>
                <p className={`font-bold mb-2 ${selectedFeedBack.isCorrect ? "text-emerald-300" : "text-rose-300"}`}>{selectedFeedBack.selectedText}</p>
                <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-1">Correct Answer:</p>
                <p className="font-bold text-white">{selectedFeedBack.correctText}</p>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed px-1 mb-4">{selectedFeedBack.explanation}</p>
              <button
                onTouchStart={(e) => { e.preventDefault(); dismissFeedback(); }}
                onClick={dismissFeedback}
                className={`py-3 px-6 rounded-2xl w-full text-xs font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 min-h-[48px] ${
                  selectedFeedBack.isCorrect
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400"
                    : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                Resume Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VICTORY overlay ──────────────────────────────────── */}
      {isVictory && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
          <Trophy className="w-14 h-14 md:w-16 md:h-16 text-amber-400 mb-4 animate-bounce" />
          <h2 className="text-xl md:text-2xl font-black font-mono text-amber-300">SESSION TRIUMPHED</h2>
          <p className="text-slate-400 text-xs mt-1">Excellent corridor navigation!</p>
          <div className="mt-4 font-mono text-[10px] text-teal-400 animate-pulse">TRANSMITTING METRICS...</div>
        </div>
      )}

      {/* ── GAME OVER overlay ─────────────────────────────────── */}
      {isGameOver && (
        <div className="absolute inset-0 z-40 bg-red-950/95 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
          <ShieldAlert className="w-14 h-14 md:w-16 md:h-16 text-rose-500 mb-4 animate-pulse" />
          <h2 className="text-xl md:text-2xl font-black font-mono text-rose-400">Droid Defect Status</h2>
          <p className="text-slate-400 text-xs mt-1">Shields exhausted — steer correctly next run!</p>
          <div className="mt-4 font-mono text-[10px] text-red-400 animate-pulse">TRANSMITTING SCORE METRICS...</div>
        </div>
      )}
    </div>
  );
}
