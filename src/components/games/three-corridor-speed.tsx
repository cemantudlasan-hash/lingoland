"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Question, GameConfig } from "@/lib/game-types-corridor";
import { audioEngine } from "../AudioEngine";
import { Sparkles, Trophy, Heart, ArrowLeft, ArrowRight, ShieldAlert, Sparkle, RotateCcw } from "lucide-react";

interface ThreeGameProps {
  config: GameConfig;
  playerRole?: "single" | "p1" | "p2";
  onGameCompleted: (score: number, correctCount: number, totalCount: number) => void;
  onExit: () => void;
}

export default function ThreeGame({ 
  config, 
  playerRole = "single", 
  onGameCompleted, 
  onExit 
}: ThreeGameProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Quiz and game state synced to React (for this specific player)
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

  // Constants
  const questionsList = config.activeQuestions;
  const currentQuestion = questionsList[currentIdx];

  // Role details mapping:
  const isP1 = playerRole === "p1";
  const isP2 = playerRole === "p2";
  const isSolo = playerRole === "single";

  // Palette definitions:
  // p1 = pink, p2 = cyan, single = teal
  const themeHexColor = isP1 ? 0xff007f : isP2 ? 0x00f2ff : 0x2dd4bf;
  const themeTailwindText = isP1 ? "text-pink-400" : isP2 ? "text-cyan-400" : "text-teal-400";
  const themeTailwindBg = isP1 ? "bg-pink-500/10 border-pink-500/20" : isP2 ? "bg-cyan-500/10 border-cyan-500/20" : "bg-teal-500/10 border-teal-500/20";
  const themeTailwindTextBright = isP1 ? "text-pink-300" : isP2 ? "text-cyan-300" : "text-teal-300";
  const themeLabel = isP1 ? "PLAYER 1" : isP2 ? "PLAYER 2" : "SOLO CORRIDOR";

  // Game internal refs for ThreeJS cycle
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
    targetLane: number; // 0, 1, 2
    playerY: number;
    playerVelocityY: number;
    isJumping: boolean;
    speedFactor: number;
    gatesDistance: number; // position of current gate set in Z
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
    targetLane: 1, // center
    playerY: 0,
    playerVelocityY: 0,
    isJumping: false,
    speedFactor: config.speed * 0.02 + 0.012, // Comfortable slower speed for reading & thinking
    gatesDistance: -100, // Starts far back (100 units) to allow ample thinking time
    requestFrameId: 0,
    isPaused: false,
  });

  // Keep React state in sync with refs for the animation loop
  const currentIdxRef = useRef(0);
  const correctCountRef = useRef(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  useEffect(() => {
    isPausedRef.current = selectedFeedBack !== null || isGameOver || isVictory;
    gameRef.current.isPaused = isPausedRef.current;
  }, [selectedFeedBack, isGameOver, isVictory]);

  // Timer Countdown
  useEffect(() => {
    if (selectedFeedBack || isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedFeedBack, isGameOver, isVictory]);

  // Monitor Timer to End Game
  useEffect(() => {
    if (timeLeft <= 0 && !isVictory && !isGameOver) {
      setIsVictory(true);
      audioEngine.playLevelSuccess();
      onGameCompleted(score, correctCountRef.current, questionsList.length);
    }
  }, [timeLeft, isVictory, isGameOver, score, questionsList.length, onGameCompleted]);

  // Monitor Health to Trigger Game Over
  useEffect(() => {
    if (health <= 0 && !isGameOver && !isVictory && !config.continueOnZeroHealth && !config.invincible) {
      setIsGameOver(true);
      audioEngine.playIncorrect();
      onGameCompleted(score, correctCountRef.current, questionsList.length);
    }
  }, [health, isGameOver, isVictory, score, questionsList.length, onGameCompleted, config.continueOnZeroHealth, config.invincible]);

  // Handle Lane switches
  const moveLeft = () => {
    if (isPausedRef.current || (health <= 0 && !config.invincible && !config.continueOnZeroHealth)) return;
    if (gameRef.current.targetLane > 0) {
      gameRef.current.targetLane -= 1;
      audioEngine.playMove();
    }
  };

  const moveRight = () => {
    if (isPausedRef.current || (health <= 0 && !config.invincible && !config.continueOnZeroHealth)) return;
    if (gameRef.current.targetLane < 2) {
      gameRef.current.targetLane += 1;
      audioEngine.playMove();
    }
  };

  const triggerJump = () => {
    if (isPausedRef.current || (health <= 0 && !config.invincible && !config.continueOnZeroHealth)) return;
    if (!gameRef.current.isJumping) {
      gameRef.current.isJumping = true;
      gameRef.current.playerVelocityY = 0.22; // upward velocity
      audioEngine.playMove();
    }
  };

  // Keyboard Event Listeners filtered by player role mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || isVictory) return;
      if (selectedFeedBack) {
        if (e.key === "Enter" || e.key === " ") {
          dismissFeedback();
        }
        return;
      }

      // 1. Player 1 (WASD Controls)
      if (isP1) {
        switch (e.key) {
          case "a":
          case "A":
            moveLeft();
            break;
          case "d":
          case "D":
            moveRight();
            break;
          case "w":
          case "W":
          case " ":
            triggerJump();
            break;
        }
      }

      // 2. Player 2 (Arrow Key Controls)
      else if (isP2) {
        switch (e.key) {
          case "ArrowLeft":
            moveLeft();
            break;
          case "ArrowRight":
            moveRight();
            break;
          case "ArrowUp":
            triggerJump();
            break;
        }
      }

      // 3. Single Player (Both keyboard bindings are active)
      else if (isSolo) {
        switch (e.key) {
          case "a":
          case "A":
          case "ArrowLeft":
            moveLeft();
            break;
          case "d":
          case "D":
          case "ArrowRight":
            moveRight();
            break;
          case "w":
          case "W":
          case "ArrowUp":
          case " ":
            triggerJump();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFeedBack, isGameOver, isVictory, health, playerRole]);

  // Create dynamically stylized text sprite helper (avoids three.js font files loader fallback)
  const createTextSprite = (text: string, color: string, bgColor: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Sprite();

    // Round rect background
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 20);
    ctx.fill();

    // Neon border
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Text configuration
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px 'Space Grotesk', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Multi-line formatting if string is long
    const limit = 26;
    if (text.length > limit) {
      const firstLine = text.substring(0, limit) + "-";
      const secondLine = text.substring(limit);
      ctx.fillText(firstLine, 256, 45);
      ctx.fillText(secondLine, 256, 85);
    } else {
      ctx.fillText(text, 256, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    // Adjusted width scale from 7 -> 2.8 so option banners do not overlap and crash visually
    sprite.scale.set(2.8, 0.7, 1);
    return sprite;
  };

  // Trigger visual explosion particle effects
  const spawnExplosionParticles = (pos: THREE.Vector3, colorVal: number, count: number = 40) => {
    const groupParts = gameRef.current.particles;
    const geom = new THREE.SphereGeometry(0.1, 4, 4);
    
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: colorVal,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      
      // Random directions
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.28,
        (Math.random() - 0.2) * 0.25 + 0.1,
        (Math.random() - 0.5) * 0.28
      );
      
      gameRef.current.scene?.add(mesh);
      groupParts.push({
        mesh,
        velocity,
        life: 1.0 // opacity life
      });
    }
  };

  // Re-spawn crystals on lanes
  const setupCrystals = (zOffset: number) => {
    if (!gameRef.current.scene) return;
    gameRef.current.crystals.forEach((c) => gameRef.current.scene?.remove(c));
    gameRef.current.crystals = [];

    const lanes = [-3.0, 0.0, 3.0];
    const geom = new THREE.IcosahedronGeometry(0.3, 0);
    const colors = [0x00f2ff, 0x00ff87, 0xff007f];

    lanes.forEach((xPos, idx) => {
      if (Math.random() > 0.4) {
        const mat = new THREE.MeshStandardMaterial({
          color: colors[idx % colors.length],
          emissive: colors[idx % colors.length],
          emissiveIntensity: 0.7,
          roughness: 0.1,
          metalness: 0.9,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(xPos, 0.5, zOffset + (Math.random() - 0.5) * 6);
        gameRef.current.scene?.add(mesh);
        gameRef.current.crystals.push(mesh);
      }
    });
  };

  // Build the 3D gates frame meshes
  const setupGates = (question: Question) => {
    if (!gameRef.current.scene) return;
    if (!question || !question.options) return;

    if (gameRef.current.gatesGroup) {
      gameRef.current.scene.remove(gameRef.current.gatesGroup);
    }

    const mainGroup = new THREE.Group();
    const lPos = [-3.0, 0.0, 3.0];
    const neonColors = [0x00f2ff, 0x00ff87, 0xff007f];

    const pillarGeom = new THREE.BoxGeometry(0.2, 3.2, 0.2);
    const topGeom = new THREE.BoxGeometry(2.6, 0.2, 0.2);

    question.options.forEach((optText, idx) => {
      const gateSubGroup = new THREE.Group();
      gateSubGroup.position.set(lPos[idx], 0, 0);

      const color = neonColors[idx];
      const gateMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.5,
        roughness: 0.1,
      });

      // Pillars
      const leftPillar = new THREE.Mesh(pillarGeom, gateMat);
      leftPillar.position.set(-1.2, 1.6, 0);
      gateSubGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeom, gateMat);
      rightPillar.position.set(1.2, 1.6, 0);
      gateSubGroup.add(rightPillar);

      // Top bar
      const topBar = new THREE.Mesh(topGeom, gateMat);
      topBar.position.set(0, 3.1, 0);
      gateSubGroup.add(topBar);

      // Add Option Text Billboard
      const prefix = idx === 0 ? "A" : idx === 1 ? "B" : "C";
      const sprite = createTextSprite(
        `${prefix}: ${optText}`,
        `#${new THREE.Color(color).getHexString()}`,
        "rgba(15, 23, 42, 0.9)"
      );
      sprite.position.set(0, 3.9, 0);
      gateSubGroup.add(sprite);

      // Energy Field inside gate
      const fieldGeom = new THREE.PlaneGeometry(2.2, 3.0);
      const fieldMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const field = new THREE.Mesh(fieldGeom, fieldMat);
      field.position.set(0, 1.5, 0);
      gateSubGroup.add(field);

      mainGroup.add(gateSubGroup);
    });

    mainGroup.position.set(0, 0, gameRef.current.gatesDistance);
    gameRef.current.scene.add(mainGroup);
    gameRef.current.gatesGroup = mainGroup;
  };

  const handleGateCollision = () => {
    const activeQ = questionsList[currentIdxRef.current];
    if (!activeQ) return;

    // Detect player's closest lane
    const xPos = gameRef.current.player?.position.x || 0;
    let selectedLaneIdx = 1; // Middle default
    if (xPos < -1.5) selectedLaneIdx = 0; // Left
    else if (xPos > 1.5) selectedLaneIdx = 2; // Right

    const isCorrect = selectedLaneIdx === activeQ.correctIdx;

    // Pause rendering loop
    isPausedRef.current = true;

    if (isCorrect) {
      audioEngine.playCorrect();
      spawnExplosionParticles(new THREE.Vector3(xPos, 1.0, 4), themeHexColor, 40);
      
      correctCountRef.current += 1;
      const points = 100 * multiplier;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setMultiplier((prev) => Math.min(prev + 1, 8));

      // Trigger feedback panel
      setSelectedFeedBack({
        show: true,
        isCorrect: true,
        selectedText: activeQ.options[selectedLaneIdx],
        correctText: activeQ.options[activeQ.correctIdx],
        explanation: activeQ.explanation || "Marvelous job! That is completely accurate."
      });
    } else {
      audioEngine.playIncorrect();
      spawnExplosionParticles(new THREE.Vector3(xPos, 1.0, 4), 0xff0000, 40);
      
      if (!config.invincible) {
        setHealth((prev) => Math.max(0, prev - (config.lifeLossPerMistake ?? 1)));
      }
      setStreak(0);
      setMultiplier(1);

      setSelectedFeedBack({
        show: true,
        isCorrect: false,
        selectedText: activeQ.options[selectedLaneIdx],
        correctText: activeQ.options[activeQ.correctIdx],
        explanation: activeQ.explanation || "Keep practice learning! Passing correct corridors guides your droid safely."
      });
    }
  };

  const dismissFeedback = () => {
    // Save current index transition
    const nextIndex = currentIdx + 1;
    setSelectedFeedBack(null);

    if (nextIndex >= questionsList.length) {
      setIsVictory(true);
      audioEngine.playLevelSuccess();
      onGameCompleted(score, correctCountRef.current, questionsList.length);
      return;
    }

    // Reset gates position far back to give student ample thinking time in the next portal!
    gameRef.current.gatesDistance = -100; // Recedes 100 units back for max thinking duration!
    setCurrentIdx(nextIndex);

    // Setup next set
    setupGates(questionsList[nextIndex]);
    setupCrystals(gameRef.current.gatesDistance + 40);

    // Unpause
    isPausedRef.current = false;
  };

  // Main Canvas Setup Hooks
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 500;

    // Create scene with glowing deep skybox background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);
    scene.fog = new THREE.FogExp2(0x060814, 0.015);
    gameRef.current.scene = scene;

    // Camera perspective
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    camera.position.set(0, 3.5, 9); // Hover viewing angle looking down
    camera.lookAt(0, 1.2, 1);
    gameRef.current.camera = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    // Dynamic lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const floorLight = new THREE.PointLight(themeHexColor, 2, 25);
    floorLight.position.set(0, 0.5, 3);
    scene.add(floorLight);

    // Grid System
    const gridHelper = new THREE.GridHelper(80, 40, themeHexColor, 0x1e293b);
    gridHelper.position.set(0, 0, 0);
    scene.add(gridHelper);
    gameRef.current.gridFloor = gridHelper;

    // Fast moving road boundaries
    const roadLineGeom = new THREE.BoxGeometry(0.08, 0.02, 40);
    const roadLineMat = new THREE.MeshBasicMaterial({ color: themeHexColor });
    const lineRoot = new THREE.Group();
    const boundaryX = [-4.5, -1.5, 1.5, 4.5];

    boundaryX.forEach((x) => {
      const laneLineMesh = new THREE.Mesh(roadLineGeom, roadLineMat);
      laneLineMesh.position.set(x, 0, -10);
      lineRoot.add(laneLineMesh);
    });
    scene.add(lineRoot);
    gameRef.current.roadLineMeshesRoot = lineRoot;

    // Ambient floating starfield space glow
    const starCount = 180;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 60;
      starPos[i+1] = Math.random() * 20 + 2;
      starPos[i+2] = -Math.random() * 80;
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });
    const starfield = new THREE.Points(starGeom, starMat);
    scene.add(starfield);
    gameRef.current.starfield = starfield;

    // Single Player model initialization (Teal/Pink/Cyan depending on role)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0.8, 4); // Target centered at x=0
    scene.add(playerGroup);
    gameRef.current.player = playerGroup;

    const coreGeom = new THREE.SphereGeometry(0.35, 20, 20);
    const coreMat = new THREE.MeshStandardMaterial({
      color: themeHexColor,
      emissive: themeHexColor,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreSphere = new THREE.Mesh(coreGeom, coreMat);
    playerGroup.add(coreSphere);

    const ringGeom = new THREE.TorusGeometry(0.48, 0.02, 6, 25);
    const ringMat = new THREE.MeshBasicMaterial({ color: themeHexColor });
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    playerGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(0.55, 0.02, 6, 25);
    const ring2 = new THREE.Mesh(ring2Geom, ringMat);
    ring2.rotation.x = Math.PI / 2;
    playerGroup.add(ring2);

    gameRef.current.orbitRings = [ring1, ring2];

    // Gate Setup & placing initial obstacles
    if (questionsList && questionsList.length > 0) {
      setupGates(questionsList[0]);
    }
    setupCrystals(-45);

    // Dynamic resize handler
    const handleResize = () => {
      if (!container || !gameRef.current.renderer || !gameRef.current.camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      gameRef.current.camera.aspect = w / h;
      gameRef.current.camera.updateProjectionMatrix();
      gameRef.current.renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Tick Frame Loop
    const animate = () => {
      gameRef.current.requestFrameId = requestAnimationFrame(animate);

      // Sphere core & torus micro-rotations
      if (coreSphere) coreSphere.rotation.y += 0.015;
      if (ring1) {
        ring1.rotation.y += 0.02;
        ring1.rotation.x += 0.01;
      }
      if (ring2) {
        ring2.rotation.x += 0.025;
        ring2.rotation.z += 0.01;
      }

      // Starfield drift
      if (starfield) {
        starfield.rotation.y += 0.00035;
        starfield.rotation.x += 0.0001;
      }

      // Floating items animation
      gameRef.current.crystals.forEach((crystal, idx) => {
        crystal.rotation.y += 0.02;
        crystal.rotation.x += 0.01;
        crystal.position.y = 0.5 + Math.sin(Date.now() * 0.003 + idx) * 0.1;
      });

      // Handle Particle systems fade & move
      for (let i = gameRef.current.particles.length - 1; i >= 0; i--) {
        const p = gameRef.current.particles[i];
        p.mesh.position.add(p.velocity);
        p.life -= 0.022;
        const m = p.mesh.material as THREE.Material;
        m.opacity = p.life;
        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          if (Array.isArray(m)) {
            m.forEach((mat) => mat.dispose());
          } else {
            m.dispose();
          }
          gameRef.current.particles.splice(i, 1);
        }
      }

      if (isPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      // Smooth horizontal lane positioning
      if (playerGroup) {
        const targetX = (gameRef.current.targetLane - 1) * 3.0;
        playerGroup.position.x += (targetX - playerGroup.position.x) * 0.22;
        
        // Banking body visual roll on lane shifts
        const bankingAngle = (targetX - playerGroup.position.x) * -0.15;
        playerGroup.rotation.z += (bankingAngle - playerGroup.rotation.z) * 0.2;
        
        // Jump gravity physics equations
        if (gameRef.current.isJumping) {
          gameRef.current.playerY += gameRef.current.playerVelocityY;
          gameRef.current.playerVelocityY -= 0.015; // Gravity drop factor
          
          if (gameRef.current.playerY <= 0) {
            gameRef.current.playerY = 0;
            gameRef.current.playerVelocityY = 0;
            gameRef.current.isJumping = false;
          }
          playerGroup.position.y = 0.8 + gameRef.current.playerY;
        }
      }

      // Roll floor grid infinitely
      if (gridHelper) {
        gridHelper.position.z += gameRef.current.speedFactor;
        if (gridHelper.position.z >= 20) {
          gridHelper.position.z = 0;
        }
      }

      // Roll borders lines infinitely
      if (lineRoot) {
        lineRoot.children.forEach((l) => {
          l.position.z += gameRef.current.speedFactor;
          if (l.position.z >= 20) {
            l.position.z = -20;
          }
        });
      }

      // Scroll crystals towards camera
      for (let i = gameRef.current.crystals.length - 1; i >= 0; i--) {
        const crystal = gameRef.current.crystals[i];
        crystal.position.z += gameRef.current.speedFactor;

        const distance = playerGroup.position.distanceTo(crystal.position);
        if (distance < 0.85) {
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

      // Progress gate closer
      if (gameRef.current.gatesGroup) {
        gameRef.current.gatesGroup.position.z += gameRef.current.speedFactor;
        
        if (gameRef.current.gatesGroup.position.z >= 4.0) {
          handleGateCollision();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(gameRef.current.requestFrameId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      scene.clear();
      renderer.dispose();
    };
  }, [currentQuestion, playerRole]);

  if (!questionsList || questionsList.length === 0) {
    return (
      <div className="w-full h-full min-h-[480px] bg-[#060814] flex flex-col items-center justify-center p-6 text-center text-white font-sans">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black font-mono text-rose-400">NO QUESTIONS DETECTED</h2>
        <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">
          Please select a preset category or add custom grammar questions in the Teacher Panel before starting the droids.
        </p>
        <button
          onClick={onExit}
          className="mt-6 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer shadow-lg"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[480px] flex flex-col bg-[#060814] overflow-hidden font-sans select-none" id="three-game-playground">
      
      {/* 3D Game Canvas mount point container */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full" id="threejs-canvas" />

      {/* Top HUD Panel header */}
      <div className="relative z-10 w-full p-4 flex items-center justify-between pointer-events-none">
        
        {/* Active Player HUD Card */}
        <div className="backdrop-blur-md bg-slate-950/90 p-3 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto flex items-center justify-between gap-4 text-white min-w-[200px]">
          <div className="flex flex-col text-left">
            <span className={`text-[10px] ${themeTailwindText} font-bold tracking-widest font-mono uppercase`}>
              {themeLabel}
            </span>
            <span className={`text-base font-black ${themeTailwindTextBright}`}>
              PTS: {score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Hearts List */}
            <div className="flex gap-0.5">
              {config.invincible ? (
                <span className={`text-xs ${themeTailwindText} font-black tracking-widest font-mono`}>∞</span>
              ) : (
                Array.from({ length: config.startingLives ?? 3 }, (_, i) => i + 1).map((h) => (
                  <Heart
                    key={h}
                    className={`w-3.5 h-3.5 transition-all ${
                      h <= health 
                        ? `fill-current ${themeTailwindText} scale-110 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]` 
                        : "text-slate-800"
                    }`}
                  />
                ))
              )}
            </div>
            {/* Streak Multiplier */}
            <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${themeTailwindBg} ${themeTailwindText}`}>
              {multiplier}x
            </div>
          </div>
        </div>

        {/* Global session Info & Exit */}
        <div className="backdrop-blur-md bg-slate-950/80 p-2.5 rounded-xl border border-white/5 shadow-md pointer-events-auto flex items-center gap-2.5">
          {/* Only render Exit button if not split-screen to allow proper back menuing */}
          {playerRole === "single" && (
            <button
              onClick={onExit}
              className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider text-slate-300 hover:text-white bg-slate-900 hover:bg-rose-950/40 rounded-lg transition-all border border-slate-800 cursor-pointer uppercase"
              id="exit-game-btn"
            >
              Quit
            </button>
          )}
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            {currentQuestion?.category || "Vocabulary"}
          </span>
          <div className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold font-mono text-[9px] border border-white/10">
            {currentIdx + 1}/{questionsList.length}
          </div>
        </div>

      </div>

      {/* Main Bottom Quiz Frame Prompt displays */}
      <div className="relative z-10 w-full mt-auto p-4 pointer-events-none">
        
        {/* Prompt Card */}
        <div className="w-full bg-slate-950/95 border border-white/10 backdrop-blur-md p-4 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between items-center relative overflow-hidden">
          
          <div className="w-full text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              CORRIDOR ENIGMA PROMPT
            </span>
            <h2 className="text-white text-sm md:text-base font-bold font-sans tracking-wide leading-relaxed p-1">
              {currentQuestion?.prompt || "Solve the challenge to pass through the correct gate!"}
            </h2>
          </div>

          {/* Option details map */}
          <div className="w-full grid grid-cols-3 gap-2 mt-2.5">
            {currentQuestion?.options.map((opt, idx) => {
              const colors = ["border-cyan-500/20 text-cyan-200", "border-emerald-500/20 text-emerald-200", "border-pink-500/20 text-pink-200"];
              const activeColor = colors[idx] || "border-white/5 text-slate-300";
              const label = idx === 0 ? "A (Left)" : idx === 1 ? "B (Middle)" : "C (Right)";
              const isUserHere = gameRef.current.targetLane === idx;

              return (
                <div 
                  key={idx}
                  className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-center min-h-[75px] bg-slate-900/60 ${activeColor}`}
                >
                  <span className="text-[8px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">
                    {label}
                  </span>
                  
                  <span className="text-xs font-black text-center leading-tight mb-1">
                    {opt}
                  </span>

                  {isUserHere && (
                    <span className={`animate-pulse px-2 py-0.5 mt-auto rounded-full text-[8px] border font-mono font-bold ${isP1 ? 'bg-pink-500/20 border-pink-500 text-pink-300' : isP2 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-teal-500/20 border-teal-500 text-teal-300'}`}>
                      STEERING
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Slower/Thinking helpers notice label */}
          <div className="text-[8px] text-slate-500 font-mono tracking-tight text-center mt-2 flex items-center gap-1">
            <Sparkle className="w-2.5 h-2.5 text-teal-500 shrink-0" />
            Lanes space is spread 3.0 to prevent layout overlaps. Move droid to preferred lane!
          </div>

        </div>

      </div>

      {/* FLOATING CHOICE FEEDBACK INTERFACE (Portal Transition Modal) */}
      {selectedFeedBack && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-white/10 max-w-md w-full p-6 rounded-[32px] text-center shadow-2xl relative overflow-hidden font-sans animate-scale-up">
            
            {/* Glow backing indicators */}
            <div className={`absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-25 ${selectedFeedBack.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3.5 border ${
                selectedFeedBack.isCorrect 
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500 text-rose-400"
              }`}>
                {selectedFeedBack.isCorrect ? <Sparkles className="w-6 h-6 animate-spin-slow" /> : <ShieldAlert className="w-6 h-6 animate-bounce" />}
              </div>

              <h3 className={`text-xl font-bold font-mono tracking-tight uppercase ${selectedFeedBack.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                {selectedFeedBack.isCorrect ? "Gate Passed Successfully" : "Portal Deflection Detected"}
              </h3>

              <div className="w-full bg-slate-950/60 p-4 rounded-xl border border-white/5 my-4 text-left text-xs font-mono">
                <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-1">Your Selection:</p>
                <p className={`font-bold mb-3 ${selectedFeedBack.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {selectedFeedBack.selectedText}
                </p>

                <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-1">Correct Corridor Answer:</p>
                <p className="font-bold text-white mb-2">
                  {selectedFeedBack.correctText}
                </p>
              </div>

              {/* Explanatory insights compiled */}
              <p className="text-slate-300 text-xs leading-relaxed font-sans px-2 mb-5">
                {selectedFeedBack.explanation}
              </p>

              {/* Confirm trigger button */}
              <button
                onClick={dismissFeedback}
                className={`py-3 px-6 rounded-2xl w-full text-xs font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedFeedBack.isCorrect 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400" 
                    : "bg-slate-800 hover:bg-slate-750 text-white"
                }`}
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                Resume Corridor Run (Space/Enter)
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Victory overlays if solitary timer runs out */}
      {isVictory && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
          <Trophy className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-black font-mono text-amber-300">SESSION TRIUMPHED</h2>
          <p className="text-slate-400 text-xs mt-1">Gaining high intelligence scores on this corridor run!</p>
          <div className="loading mt-4 font-mono text-[10px] text-teal-400 animate-pulse">
            TRANSMITTING METRICS...
          </div>
        </div>
      )}

      {/* Death overlay */}
      {isGameOver && (
        <div className="absolute inset-0 z-40 bg-red-950/95 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-black font-mono text-rose-400">Droid Defect Status</h2>
          <p className="text-slate-400 text-xs mt-1">Your shields are exhausted. Direct your droid carefully on correct portals next!</p>
          <div className="loading mt-4 font-mono text-[10px] text-red-400 animate-pulse">
            TRANSMITTING SCORE METRICS...
          </div>
        </div>
      )}

    </div>
  );
}
