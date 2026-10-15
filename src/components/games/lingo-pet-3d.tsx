'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LingoPetType } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface LingoPet3DProps {
  petType: LingoPetType;
  level?: number;
  energy?: number;
  mood?: number;
  equippedCosmetics?: {
    hat?: string;
    glasses?: string;
    necklace?: string;
    shoes?: string;
    wings?: string;
    costume?: string;
    aura?: string;
  };
  isPetting?: boolean;
  isSleeping?: boolean;
  isTalking?: boolean;
  className?: string;
  hideHint?: boolean;
}

export function LingoPet3D({
  petType,
  level = 1,
  energy = 100,
  mood = 100,
  equippedCosmetics = {},
  isPetting = false,
  isSleeping = false,
  isTalking = false,
  className,
  hideHint = false,
}: LingoPet3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic mesh anchors and animated parts
  const petRootRef = useRef<THREE.Group | null>(null);
  const bodyMeshRef = useRef<THREE.Object3D | null>(null);
  const headMeshRef = useRef<THREE.Object3D | null>(null);
  const leftWingRef = useRef<THREE.Object3D | null>(null);
  const rightWingRef = useRef<THREE.Object3D | null>(null);
  const tailRef = useRef<THREE.Object3D | null>(null);
  const leftEyeRef = useRef<THREE.Object3D | null>(null);
  const rightEyeRef = useRef<THREE.Object3D | null>(null);
  const leftEarRef = useRef<THREE.Object3D | null>(null);
  const rightEarRef = useRef<THREE.Object3D | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Attachment anchors for 3D costumes/accessories
  const hatAnchorRef = useRef<THREE.Group | null>(null);
  const glassesAnchorRef = useRef<THREE.Group | null>(null);
  const neckAnchorRef = useRef<THREE.Group | null>(null);
  const chestAnchorRef = useRef<THREE.Group | null>(null);
  const backAnchorRef = useRef<THREE.Group | null>(null);
  const feetAnchorRef = useRef<THREE.Group | null>(null);
  const wingsAnchorRef = useRef<THREE.Group | null>(null);
  const auraAnchorRef = useRef<THREE.Group | null>(null);

  // Mouse interaction for 3D rotation & hover parallax
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const rotVelocity = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const [hintVisible, setHintVisible] = useState(true);

  // Hide the "Drag to rotate" hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 5.8);
    camera.lookAt(0, 0.15, 0);

    // 3. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch (e) {
      console.warn('WebGL not supported for LingoPet3D', e);
      return;
    }

    const actualW = width > 0 ? width : 360;
    const actualH = height > 0 ? height : 360;
    renderer.setSize(actualW, actualH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xcceeff, 0.85);
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffeedd, 1.4, 10);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Ground Shadow (Soft circle)
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.25;
    scene.add(shadowMesh);

    // 5. Build Pet Hierarchy
    const petRoot = new THREE.Group();
    petRootRef.current = petRoot;
    scene.add(petRoot);

    // Create attachment anchors
    const hatAnchor = new THREE.Group();
    const glassesAnchor = new THREE.Group();
    const neckAnchor = new THREE.Group();
    const chestAnchor = new THREE.Group();
    const backAnchor = new THREE.Group();
    const feetAnchor = new THREE.Group();
    const wingsAnchor = new THREE.Group();
    const auraAnchor = new THREE.Group();

    hatAnchorRef.current = hatAnchor;
    glassesAnchorRef.current = glassesAnchor;
    neckAnchorRef.current = neckAnchor;
    chestAnchorRef.current = chestAnchor;
    backAnchorRef.current = backAnchor;
    feetAnchorRef.current = feetAnchor;
    wingsAnchorRef.current = wingsAnchor;
    auraAnchorRef.current = auraAnchor;

    petRoot.add(auraAnchor);

    // Build specific 3D Pet model
    build3DPetModel(petRoot, petType, level, {
      bodyMeshRef,
      headMeshRef,
      leftWingRef,
      rightWingRef,
      tailRef,
      leftEyeRef,
      rightEyeRef,
      leftEarRef,
      rightEarRef,
      hatAnchor,
      glassesAnchor,
      neckAnchor,
      chestAnchor,
      backAnchor,
      feetAnchor,
      wingsAnchor,
    });

    // Build equipped 3D Costumes & Accessories
    build3DCostumes({
      equippedCosmetics,
      hatAnchor,
      glassesAnchor,
      neckAnchor,
      chestAnchor,
      backAnchor,
      feetAnchor,
      wingsAnchor,
      auraAnchor,
      petType,
    });

    // Ambient floating magic particles
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3 + 0] = (Math.random() - 0.5) * 3.5;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      color: getPetParticleColor(petType),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 6. Animation Loop
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth rotation dampening (interactive drag + return to center)
      if (!isDraggingRef.current) {
        targetRotation.current.x *= 0.94;
        targetRotation.current.y *= 0.94;
      }
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.12;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.12;

      petRoot.rotation.y = currentRotation.current.x;
      petRoot.rotation.x = currentRotation.current.y;

      // Idle breathing & bobbing
      const breathSpeed = isSleeping ? 1.8 : 3.0;
      const breathFactor = Math.sin(time * breathSpeed);
      const bobbing = Math.sin(time * breathSpeed) * 0.045;

      if (bodyMeshRef.current) {
        bodyMeshRef.current.position.y = bobbing;
        bodyMeshRef.current.scale.set(
          1 + breathFactor * 0.015,
          1 + breathFactor * 0.025,
          1 + breathFactor * 0.015
        );
      }

      // Petting bounce
      if (isPetting) {
        petRoot.position.y = Math.abs(Math.sin(time * 9)) * 0.28;
      } else if (isTalking) {
        petRoot.position.y = Math.sin(time * 6) * 0.08;
      } else {
        petRoot.position.y = isSleeping ? -0.1 : 0;
      }

      // Sleeping head droop
      if (isSleeping && headMeshRef.current) {
        headMeshRef.current.rotation.x = 0.22;
      } else if (headMeshRef.current) {
        headMeshRef.current.rotation.x = Math.sin(time * 2.2) * 0.04;
      }

      // Eye blinking every ~3.6 seconds
      blinkTimer += delta;
      if (blinkTimer > 3.6) {
        isBlinking = true;
        if (blinkTimer > 3.75) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }
      const eyeScaleY = isSleeping ? 0.08 : isBlinking ? 0.1 : 1.0;
      if (leftEyeRef.current) leftEyeRef.current.scale.y = eyeScaleY;
      if (rightEyeRef.current) rightEyeRef.current.scale.y = eyeScaleY;

      // Wing fluttering
      if (leftWingRef.current && rightWingRef.current) {
        const flapRate = isPetting ? 14 : 3.5;
        const flapAngle = Math.sin(time * flapRate) * 0.24;
        leftWingRef.current.rotation.z = 0.2 + flapAngle;
        rightWingRef.current.rotation.z = -0.2 - flapAngle;
      }

      // Tail sway
      if (tailRef.current) {
        const wagRate = isPetting ? 12 : 3.2;
        tailRef.current.rotation.y = Math.sin(time * wagRate) * 0.28;
        tailRef.current.rotation.z = Math.cos(time * wagRate) * 0.1;
      }

      // Ears twitch
      if (leftEarRef.current && rightEarRef.current) {
        const earTwitch = Math.sin(time * 2.0) * 0.08;
        leftEarRef.current.rotation.z = earTwitch;
        rightEarRef.current.rotation.z = -earTwitch;
      }

      // Floating ambient particles rotation
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.08;
      }

      // Dynamic Aura Rotation Animation
      if (auraAnchorRef.current) {
        auraAnchorRef.current.rotation.y = time * 0.45;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Mouse drag rotation and container-confined hover parallax
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
      setHintVisible(false);
    };

    // Parallax ONLY triggers when cursor is inside the 3D box
    const handleContainerMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotation.current.x = nx * 0.35;
      targetRotation.current.y = -ny * 0.25;
    };

    // When cursor leaves the 3D box, smoothly reset rotation to center
    const handleContainerMouseLeave = () => {
      if (isDraggingRef.current) return;
      targetRotation.current.x = 0;
      targetRotation.current.y = 0;
    };

    // Drag rotation tracking across window so dragging is never lost
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      targetRotation.current.x += dx * 0.015;
      targetRotation.current.y += dy * 0.012;
      // Clamp vertical tilt
      targetRotation.current.y = Math.max(-0.6, Math.min(0.6, targetRotation.current.y));
    };

    const handleWindowMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setHintVisible(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMousePos.current.x;
      const dy = e.touches[0].clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      targetRotation.current.x += dx * 0.018;
      targetRotation.current.y += dy * 0.014;
      targetRotation.current.y = Math.max(-0.6, Math.min(0.6, targetRotation.current.y));
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleContainerMouseMove);
    container.addEventListener('mouseleave', handleContainerMouseLeave);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 8. Resize listener
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    setTimeout(handleResize, 60);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleContainerMouseMove);
      container.removeEventListener('mouseleave', handleContainerMouseLeave);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [petType, level, equippedCosmetics, isPetting, isSleeping, isTalking]);

  return (
    <div className={cn('relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none', className)}>
      <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
      
      {/* Interactive 3D drag hint */}
      {!hideHint && hintVisible && (
        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none transition-opacity duration-700">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-slate-300 shadow-lg flex items-center gap-1.5 animate-pulse">
            <span>✨</span> 3D Animated • Drag to Rotate
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3D PROCEDURAL PET MODEL BUILDER
// ---------------------------------------------------------------------------

interface PetRefs {
  bodyMeshRef: React.MutableRefObject<THREE.Object3D | null>;
  headMeshRef: React.MutableRefObject<THREE.Object3D | null>;
  leftWingRef: React.MutableRefObject<THREE.Object3D | null>;
  rightWingRef: React.MutableRefObject<THREE.Object3D | null>;
  tailRef: React.MutableRefObject<THREE.Object3D | null>;
  leftEyeRef: React.MutableRefObject<THREE.Object3D | null>;
  rightEyeRef: React.MutableRefObject<THREE.Object3D | null>;
  leftEarRef: React.MutableRefObject<THREE.Object3D | null>;
  rightEarRef: React.MutableRefObject<THREE.Object3D | null>;
  hatAnchor: THREE.Group;
  glassesAnchor: THREE.Group;
  neckAnchor: THREE.Group;
  chestAnchor: THREE.Group;
  backAnchor: THREE.Group;
  feetAnchor: THREE.Group;
  wingsAnchor: THREE.Group;
}

function build3DPetModel(parent: THREE.Group, petType: LingoPetType, level: number, refs: PetRefs) {
  // Common smooth shiny toon/standard materials
  const createMat = (color: number, roughness = 0.35, metalness = 0.1) => {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
    });
  };

  const bodyGroup = new THREE.Group();
  refs.bodyMeshRef.current = bodyGroup;
  parent.add(bodyGroup);

  // Position Anchors in 3D relative to the pet body
  refs.hatAnchor.position.set(0, 1.25, 0);
  refs.glassesAnchor.position.set(0, 0.52, 0.72);
  refs.neckAnchor.position.set(0, 0.1, 0.5);
  refs.chestAnchor.position.set(0, -0.15, 0.65);
  refs.backAnchor.position.set(0, 0, -0.7);
  refs.feetAnchor.position.set(0, -1.05, 0.15);
  refs.wingsAnchor.position.set(0, 0.25, -0.6);

  bodyGroup.add(refs.hatAnchor);
  bodyGroup.add(refs.glassesAnchor);
  bodyGroup.add(refs.neckAnchor);
  bodyGroup.add(refs.chestAnchor);
  bodyGroup.add(refs.backAnchor);
  bodyGroup.add(refs.feetAnchor);
  bodyGroup.add(refs.wingsAnchor);

  // ---------------------------------------------------------
  // EARTH / VOCABULARY LINE
  // ---------------------------------------------------------
  if (petType === 'floby') {
    // Floby: Cute acorn creature with head sprouts, leaf backpack, letter A
    const bodyGeo = new THREE.SphereGeometry(0.78, 32, 28);
    bodyGeo.scale(1, 1.08, 0.95);
    const bodyMat = createMat(0xd97706, 0.45); // Warm acorn brown
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    bodyGroup.add(body);

    // Acorn Cap Top
    const capGeo = new THREE.SphereGeometry(0.82, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const capMat = createMat(0x78350f, 0.6);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0, 0.35, 0);
    bodyGroup.add(cap);

    // Green Head Sprout (Two curved leaves)
    const sproutStemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.3, 12);
    const sproutMat = createMat(0x22c55e, 0.3);
    const stem = new THREE.Mesh(sproutStemGeo, sproutMat);
    stem.position.set(0, 1.05, 0);
    bodyGroup.add(stem);

    const leafGeo = new THREE.ConeGeometry(0.18, 0.45, 12);
    const leftLeaf = new THREE.Mesh(leafGeo, sproutMat);
    leftLeaf.rotation.set(0.2, 0, -0.6);
    leftLeaf.position.set(-0.16, 1.15, 0);
    bodyGroup.add(leftLeaf);

    const rightLeaf = new THREE.Mesh(leafGeo, sproutMat);
    rightLeaf.rotation.set(-0.2, 0, 0.6);
    rightLeaf.position.set(0.16, 1.18, 0);
    bodyGroup.add(rightLeaf);

    // Rosy Cheeks
    const cheekMat = createMat(0xf43f5e, 0.6);
    const cheekGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.48, 0.18, 0.62);
    bodyGroup.add(leftCheek);
    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.48, 0.18, 0.62);
    bodyGroup.add(rightCheek);

    // 3D Eyes
    add3DEyes(bodyGroup, 0.32, 0.36, 0.66, refs);

    // Leaf backpack on back
    const packGeo = new THREE.BoxGeometry(0.5, 0.6, 0.3);
    const packMat = createMat(0x15803d, 0.4);
    const backpack = new THREE.Mesh(packGeo, packMat);
    backpack.position.set(0, 0.05, -0.85);
    bodyGroup.add(backpack);

    // Clutched Letter 'A'
    const aGeo = new THREE.TorusGeometry(0.18, 0.05, 12, 24);
    const aMat = createMat(0xfacc15, 0.2, 0.3);
    const aMesh = new THREE.Mesh(aGeo, aMat);
    aMesh.position.set(0, -0.3, 0.75);
    aMesh.rotation.x = 0.3;
    bodyGroup.add(aMesh);

    // Little feet
    addLittleFeet(bodyGroup, 0x92400e);

    // Adjust anchors
    refs.hatAnchor.position.set(0, 1.25, 0);
    refs.glassesAnchor.position.set(0, 0.38, 0.74);
    refs.neckAnchor.position.set(0, -0.05, 0.7);
    refs.chestAnchor.position.set(0, -0.35, 0.72);
    refs.feetAnchor.position.set(0, -0.88, 0.15);
  } else if (petType === 'tome-tortoise') {
    // Tome-Tortoise: Chunky armored tortoise, scroll shell, magnifying glass
    const shellGeo = new THREE.SphereGeometry(0.95, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const shellMat = createMat(0x166534, 0.4);
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.set(0, -0.05, -0.2);
    shell.rotation.x = -0.25;
    bodyGroup.add(shell);

    // Scroll plates on shell
    const plateGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.8, 16);
    const scrollMat = createMat(0xfef3c7, 0.5);
    const scroll1 = new THREE.Mesh(plateGeo, scrollMat);
    scroll1.rotation.set(0, 0, Math.PI / 2);
    scroll1.position.set(0, 0.7, -0.25);
    bodyGroup.add(scroll1);

    // Chunky head
    const headGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const skinMat = createMat(0x84cc16, 0.4);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0.32, 0.72);
    bodyGroup.add(head);
    refs.headMeshRef.current = head;

    add3DEyes(bodyGroup, 0.24, 0.42, 1.15, refs);

    // Explorer pack & magnifying glass
    const lensGeo = new THREE.TorusGeometry(0.22, 0.04, 16, 24);
    const brassMat = createMat(0xf59e0b, 0.2, 0.7);
    const lens = new THREE.Mesh(lensGeo, brassMat);
    lens.position.set(0.58, 0.1, 0.85);
    lens.rotation.set(0.3, 0.6, 0);
    bodyGroup.add(lens);

    addLittleFeet(bodyGroup, 0x65a30d, 0.5, 0.45);

    refs.hatAnchor.position.set(0, 0.95, 0.7);
    refs.glassesAnchor.position.set(0, 0.42, 1.2);
    refs.neckAnchor.position.set(0, 0.05, 0.9);
    refs.chestAnchor.position.set(0, -0.25, 0.8);
    refs.feetAnchor.position.set(0, -0.92, 0.3);
  } else if (petType === 'lore-drake') {
    // Lore-Drake: Majestic gentle emerald dragon, wings, horns, holding glowing book
    const bodyGeo = new THREE.ConeGeometry(0.72, 1.45, 24);
    const drakeMat = createMat(0x047857, 0.35);
    const body = new THREE.Mesh(bodyGeo, drakeMat);
    body.position.set(0, -0.15, 0);
    bodyGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.58, 28, 28);
    const head = new THREE.Mesh(headGeo, drakeMat);
    head.position.set(0, 0.75, 0.25);
    bodyGroup.add(head);
    refs.headMeshRef.current = head;

    // Golden Dragon Horns
    const hornGeo = new THREE.ConeGeometry(0.12, 0.6, 16);
    const hornMat = createMat(0xfbbf24, 0.2, 0.6);
    const leftHorn = new THREE.Mesh(hornGeo, hornMat);
    leftHorn.rotation.set(-0.4, 0, -0.5);
    leftHorn.position.set(-0.35, 1.25, 0.1);
    bodyGroup.add(leftHorn);
    const rightHorn = new THREE.Mesh(hornGeo, hornMat);
    rightHorn.rotation.set(-0.4, 0, 0.5);
    rightHorn.position.set(0.35, 1.25, 0.1);
    bodyGroup.add(rightHorn);

    // Dragon Wings
    addDragonWings(bodyGroup, 0x10b981, refs);

    // Glowing ancient book
    const bookGeo = new THREE.BoxGeometry(0.65, 0.45, 0.18);
    const bookMat = createMat(0xb45309, 0.3);
    const book = new THREE.Mesh(bookGeo, bookMat);
    book.position.set(0, -0.05, 0.85);
    book.rotation.set(0.4, 0, 0);
    bodyGroup.add(book);

    add3DEyes(bodyGroup, 0.25, 0.82, 0.72, refs);
    addDragonTail(bodyGroup, 0x047857, refs);

    refs.hatAnchor.position.set(0, 1.45, 0.2);
    refs.glassesAnchor.position.set(0, 0.82, 0.76);
    refs.neckAnchor.position.set(0, 0.38, 0.55);
    refs.chestAnchor.position.set(0, 0.05, 0.7);
    refs.feetAnchor.position.set(0, -0.98, 0.2);
  } else if (petType === 'seed-rooter') {
    // Seed-Rooter: Cute forest squirrel runner holding open study book, with explorer pack & giant bushy tail
    const furBrown = 0x92400e; // Warm chestnut fur
    const furCream = 0xfef3c7; // Soft cream belly
    const leafGreen = 0x22c55e; // Forest leaf green

    // 1. Squirrel Body (Plump round body with cream tummy)
    const bodyGeo = new THREE.SphereGeometry(0.72, 32, 28);
    bodyGeo.scale(1, 1.15, 0.95);
    const bodyMat = createMat(furBrown, 0.45);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    bodyGroup.add(body);

    // Cream Belly Patch
    const bellyGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const bellyMat = createMat(furCream, 0.4);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.scale.set(0.85, 1.1, 0.45);
    belly.position.set(0, -0.1, 0.45);
    bodyGroup.add(belly);

    // 2. Green Leaf Head Crest
    const crestMat = createMat(leafGreen, 0.35);
    const crestCenter = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 16), crestMat);
    crestCenter.position.set(0, 0.98, 0.05);
    crestCenter.rotation.set(-0.25, 0, 0);
    bodyGroup.add(crestCenter);

    const crestLeft = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 16), crestMat);
    crestLeft.position.set(-0.22, 0.92, 0.05);
    crestLeft.rotation.set(-0.2, 0, -0.4);
    bodyGroup.add(crestLeft);

    const crestRight = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 16), crestMat);
    crestRight.position.set(0.22, 0.92, 0.05);
    crestRight.rotation.set(-0.2, 0, 0.4);
    bodyGroup.add(crestRight);

    // 3. Squirrel Ears (Pointed with green tufts)
    const earGeo = new THREE.ConeGeometry(0.16, 0.45, 16);
    const earMat = createMat(furBrown, 0.4);
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.42, 0.88, -0.05);
    leftEar.rotation.set(0, 0, 0.35);
    bodyGroup.add(leftEar);
    refs.leftEarRef.current = leftEar;

    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.42, 0.88, -0.05);
    rightEar.rotation.set(0, 0, -0.35);
    bodyGroup.add(rightEar);
    refs.rightEarRef.current = rightEar;

    // Rosy Cheeks
    const cheekMat = createMat(0xf43f5e, 0.6);
    const cheekGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.46, 0.22, 0.62);
    bodyGroup.add(leftCheek);
    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.46, 0.22, 0.62);
    bodyGroup.add(rightCheek);

    // 4. Sparkly 3D Eyes & Little Snout
    add3DEyes(bodyGroup, 0.28, 0.38, 0.64, refs);

    const noseGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const noseMat = createMat(0x451a03, 0.2);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.28, 0.72);
    bodyGroup.add(nose);

    // 5. Open Green Study Book (Held in front)
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, -0.15, 0.78);
    bookGroup.rotation.set(0.35, 0, 0);

    const coverGeo = new THREE.BoxGeometry(0.65, 0.45, 0.04);
    const coverMat = createMat(0x15803d, 0.35);
    const bookCover = new THREE.Mesh(coverGeo, coverMat);
    bookGroup.add(bookCover);

    const pagesGeo = new THREE.BoxGeometry(0.6, 0.4, 0.08);
    const pagesMat = createMat(0xf8fafc, 0.5);
    const bookPages = new THREE.Mesh(pagesGeo, pagesMat);
    bookPages.position.set(0, 0.02, 0.03);
    bookGroup.add(bookPages);

    bodyGroup.add(bookGroup);

    // 6. Explorer Bedroll / Backpack on Back
    const packGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.65, 16);
    const packMat = createMat(0x78350f, 0.5);
    const pack = new THREE.Mesh(packGeo, packMat);
    pack.rotation.set(0, 0, Math.PI / 2);
    pack.position.set(0, 0.15, -0.8);
    bodyGroup.add(pack);

    // 7. Giant Majestic Bushy Squirrel Tail with Green Leaf Highlights
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.3, -0.7);

    const tailBaseGeo = new THREE.SphereGeometry(0.45, 20, 20);
    tailBaseGeo.scale(0.8, 1.4, 1.1);
    const tailBase = new THREE.Mesh(tailBaseGeo, bodyMat);
    tailBase.position.set(0, 0.4, -0.2);
    tailBase.rotation.x = -0.4;
    tailGroup.add(tailBase);

    const tailUpperGeo = new THREE.SphereGeometry(0.55, 24, 24);
    tailUpperGeo.scale(0.9, 1.5, 1.2);
    const tailUpper = new THREE.Mesh(tailUpperGeo, bodyMat);
    tailUpper.position.set(0, 1.05, -0.1);
    tailUpper.rotation.x = 0.35;
    tailGroup.add(tailUpper);

    const tailTipGeo = new THREE.ConeGeometry(0.3, 0.75, 16);
    const tailTip = new THREE.Mesh(tailTipGeo, crestMat);
    tailTip.position.set(0, 1.7, 0.1);
    tailTip.rotation.set(0.65, 0, 0);
    tailGroup.add(tailTip);

    bodyGroup.add(tailGroup);
    refs.tailRef.current = tailGroup;

    // 8. Little Paws & Feet
    addLittleFeet(bodyGroup, 0x78350f, 0.35, -0.85);

    // 9. Attachment Anchors (Precisely tuned so hats, glasses, wings, etc. fit perfectly)
    refs.hatAnchor.position.set(0, 1.22, 0.05);
    refs.glassesAnchor.position.set(0, 0.38, 0.72);
    refs.neckAnchor.position.set(0, 0.05, 0.65);
    refs.chestAnchor.position.set(0, -0.22, 0.72);
    refs.feetAnchor.position.set(0, -0.88, 0.2);
    refs.wingsAnchor.position.set(0, 0.25, -0.6);
  } else if (petType === 'terra-keeper') {
    // Terra-Keeper: Massive stone moss dragon golem with glowing gem
    const bodyGeo = new THREE.DodecahedronGeometry(0.92, 1);
    const stoneMat = createMat(0x475569, 0.6, 0.2);
    const body = new THREE.Mesh(bodyGeo, stoneMat);
    bodyGroup.add(body);

    // Glowing Gem Heart
    const gemGeo = new THREE.OctahedronGeometry(0.32);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.5,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 0.1, 0.82);
    bodyGroup.add(gem);

    // Shoulder moss pauldrons
    const mossMat = createMat(0x15803d, 0.7);
    const pLeft = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), mossMat);
    pLeft.position.set(-0.95, 0.4, 0);
    bodyGroup.add(pLeft);
    const pRight = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), mossMat);
    pRight.position.set(0.95, 0.4, 0);
    bodyGroup.add(pRight);

    add3DEyes(bodyGroup, 0.28, 0.52, 0.78, refs);
    addDragonWings(bodyGroup, 0x334155, refs);

    refs.hatAnchor.position.set(0, 1.28, 0);
    refs.glassesAnchor.position.set(0, 0.54, 0.84);
    refs.neckAnchor.position.set(0, 0.2, 0.78);
    refs.chestAnchor.position.set(0, -0.15, 0.85);
  }

  // ---------------------------------------------------------
  // WIND / PHONICS & LISTENING LINE
  // ---------------------------------------------------------
  else if (petType === 'pip') {
    // Pip: Fluffy wind avian chick / baby griffin with crest, beak & iconic DJ studio headphones
    const bodyGeo = new THREE.SphereGeometry(0.72, 32, 28);
    const pipMat = createMat(0x0ea5e9, 0.35); // Sky cyan
    const body = new THREE.Mesh(bodyGeo, pipMat);
    bodyGroup.add(body);

    // Golden Beak
    const beakGeo = new THREE.ConeGeometry(0.16, 0.35, 16);
    const beakMat = createMat(0xf59e0b, 0.2, 0.3);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.rotation.set(1.5, 0, 0);
    beak.position.set(0, 0.18, 0.75);
    bodyGroup.add(beak);

    // Wind Feather Crest
    const crestGeo = new THREE.ConeGeometry(0.12, 0.5, 12);
    const crestMat = createMat(0x38bdf8, 0.3);
    const crest1 = new THREE.Mesh(crestGeo, crestMat);
    crest1.rotation.set(-0.5, 0, 0);
    crest1.position.set(0, 0.95, -0.1);
    bodyGroup.add(crest1);

    // Pip Studio Headphones (Iconic from poster)
    const phoneMat = createMat(0x0369a1, 0.3, 0.5);
    const earPadMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    
    // Headband
    const bandGeo = new THREE.TorusGeometry(0.75, 0.05, 12, 24, Math.PI);
    const headband = new THREE.Mesh(bandGeo, phoneMat);
    headband.rotation.set(0, 0, Math.PI);
    headband.position.set(0, 0.45, 0);
    bodyGroup.add(headband);

    // Left Ear Cup
    const cupGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 20);
    const leftCup = new THREE.Mesh(cupGeo, earPadMat);
    leftCup.rotation.z = Math.PI / 2;
    leftCup.position.set(-0.76, 0.45, 0);
    bodyGroup.add(leftCup);

    // Right Ear Cup
    const rightCup = new THREE.Mesh(cupGeo, earPadMat);
    rightCup.rotation.z = Math.PI / 2;
    rightCup.position.set(0.76, 0.45, 0);
    bodyGroup.add(rightCup);

    // Fluffy Baby Avian Wings
    addBirdWings(bodyGroup, 0x0284c7, refs);
    add3DEyes(bodyGroup, 0.3, 0.34, 0.62, refs);
    addLittleFeet(bodyGroup, 0xf59e0b);

    refs.hatAnchor.position.set(0, 1.15, 0);
    refs.glassesAnchor.position.set(0, 0.36, 0.68);
    refs.neckAnchor.position.set(0, 0.02, 0.65);
    refs.chestAnchor.position.set(0, -0.28, 0.68);
    refs.wingsAnchor.position.set(0, 0.2, -0.5);
    refs.feetAnchor.position.set(0, -0.85, 0.15);
  } else if (petType === 'echo-grif') {
    // Echo-Grif: Sleek aerodynamic griffin, soundwave ear tufts
    const bodyGeo = new THREE.CapsuleGeometry(0.65, 0.8, 20, 24);
    const grifMat = createMat(0x0284c7, 0.3);
    const body = new THREE.Mesh(bodyGeo, grifMat);
    bodyGroup.add(body);

    // Feathered Griffin Ears (Refs for animation)
    const earGeo = new THREE.ConeGeometry(0.18, 0.55, 16);
    const earMat = createMat(0x38bdf8, 0.25);
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.48, 0.95, 0);
    leftEar.rotation.set(0, 0, 0.4);
    bodyGroup.add(leftEar);
    refs.leftEarRef.current = leftEar;

    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.48, 0.95, 0);
    rightEar.rotation.set(0, 0, -0.4);
    bodyGroup.add(rightEar);
    refs.rightEarRef.current = rightEar;

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.18, 0.4, 16);
    const beak = new THREE.Mesh(beakGeo, createMat(0xf59e0b, 0.3));
    beak.rotation.set(1.5, 0, 0);
    beak.position.set(0, 0.32, 0.72);
    bodyGroup.add(beak);

    addBirdWings(bodyGroup, 0x0369a1, refs, 1.4);
    add3DEyes(bodyGroup, 0.28, 0.46, 0.64, refs);
    addDragonTail(bodyGroup, 0x0284c7, refs);

    refs.hatAnchor.position.set(0, 1.3, 0);
    refs.glassesAnchor.position.set(0, 0.48, 0.72);
    refs.neckAnchor.position.set(0, 0.15, 0.68);
    refs.chestAnchor.position.set(0, -0.15, 0.72);
  } else if (petType === 'acu-maestro') {
    // Acu-Maestro: Royal griffin with acoustic halo ring and conductor wings
    const bodyGeo = new THREE.CapsuleGeometry(0.72, 0.9, 24, 28);
    const mMat = createMat(0x0369a1, 0.3);
    const body = new THREE.Mesh(bodyGeo, mMat);
    bodyGroup.add(body);

    // Floating Acoustic Halo
    const haloGeo = new THREE.TorusGeometry(0.75, 0.05, 16, 32);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 1.35, 0);
    bodyGroup.add(halo);

    addBirdWings(bodyGroup, 0x0284c7, refs, 1.8);
    add3DEyes(bodyGroup, 0.3, 0.52, 0.7, refs);
    addDragonTail(bodyGroup, 0x0369a1, refs);

    refs.hatAnchor.position.set(0, 1.45, 0);
    refs.glassesAnchor.position.set(0, 0.54, 0.78);
    refs.neckAnchor.position.set(0, 0.18, 0.72);
    refs.chestAnchor.position.set(0, -0.18, 0.78);
  } else if (petType === 'chirp-wing') {
    // Chirp-Wing: Shimmering hummingbird
    const bodyGeo = new THREE.SphereGeometry(0.68, 28, 24);
    const body = new THREE.Mesh(bodyGeo, createMat(0x06b6d4, 0.25, 0.3));
    bodyGroup.add(body);

    // Long slender beak
    const beakGeo = new THREE.ConeGeometry(0.08, 0.65, 16);
    const beak = new THREE.Mesh(beakGeo, createMat(0x0f172a, 0.2));
    beak.rotation.set(1.5, 0, 0);
    beak.position.set(0, 0.22, 0.92);
    bodyGroup.add(beak);

    addBirdWings(bodyGroup, 0x22d3ee, refs, 1.2);
    add3DEyes(bodyGroup, 0.26, 0.36, 0.58, refs);

    refs.hatAnchor.position.set(0, 1.08, 0);
    refs.glassesAnchor.position.set(0, 0.38, 0.65);
    refs.neckAnchor.position.set(0, 0.05, 0.65);
    refs.chestAnchor.position.set(0, -0.22, 0.68);
  } else if (petType === 'sonic-storm') {
    // Sonic-Storm: Lightning hawk with sonic wings
    const bodyGeo = new THREE.CapsuleGeometry(0.68, 0.95, 24, 28);
    const body = new THREE.Mesh(bodyGeo, createMat(0x1e293b, 0.3, 0.4));
    bodyGroup.add(body);

    // Lightning crest
    const crestGeo = new THREE.ConeGeometry(0.15, 0.75, 12);
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
    });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.rotation.set(-0.6, 0, 0);
    crest.position.set(0, 1.2, -0.2);
    bodyGroup.add(crest);

    addBirdWings(bodyGroup, 0x0284c7, refs, 1.9);
    add3DEyes(bodyGroup, 0.28, 0.52, 0.68, refs);

    refs.hatAnchor.position.set(0, 1.38, 0);
    refs.glassesAnchor.position.set(0, 0.54, 0.74);
    refs.neckAnchor.position.set(0, 0.2, 0.7);
    refs.chestAnchor.position.set(0, -0.15, 0.75);
  }

  // ---------------------------------------------------------
  // FIRE / GRAMMAR & WRITING LINE
  // ---------------------------------------------------------
  else if (petType === 'igni') {
    // Igni: Flaming fire salamander with glowing ember crest
    const bodyGeo = new THREE.CapsuleGeometry(0.68, 0.75, 24, 24);
    const igniMat = createMat(0xe11d48, 0.35); // Crimson
    const body = new THREE.Mesh(bodyGeo, igniMat);
    bodyGroup.add(body);

    // Glowing Magma Tummy
    const bellyGeo = new THREE.SphereGeometry(0.52, 20, 20);
    const bellyMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, -0.15, 0.38);
    belly.scale.set(1, 1.2, 0.6);
    bodyGroup.add(belly);

    // Flaming Head Crest (3 fire cones)
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xe11d48,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 12), flameMat);
    f1.position.set(0, 0.95, -0.1);
    f1.rotation.set(-0.3, 0, 0);
    bodyGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.4, 12), flameMat);
    f2.position.set(-0.25, 0.88, -0.1);
    f2.rotation.set(-0.3, 0, -0.4);
    bodyGroup.add(f2);

    const f3 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.4, 12), flameMat);
    f3.position.set(0.25, 0.88, -0.1);
    f3.rotation.set(-0.3, 0, 0.4);
    bodyGroup.add(f3);

    add3DEyes(bodyGroup, 0.28, 0.38, 0.65, refs);
    addDragonTail(bodyGroup, 0xf97316, refs);
    addLittleFeet(bodyGroup, 0xbe123c);

    refs.hatAnchor.position.set(0, 1.18, 0);
    refs.glassesAnchor.position.set(0, 0.4, 0.72);
    refs.neckAnchor.position.set(0, 0.08, 0.68);
    refs.chestAnchor.position.set(0, -0.22, 0.72);
  } else if (petType === 'spark-fox') {
    // Spark-Fox: Sleek fire kitsune with glowing ears and tail
    const bodyGeo = new THREE.CapsuleGeometry(0.65, 0.82, 24, 24);
    const foxMat = createMat(0xea580c, 0.35);
    const body = new THREE.Mesh(bodyGeo, foxMat);
    bodyGroup.add(body);

    // Fox Snout
    const snoutGeo = new THREE.ConeGeometry(0.2, 0.45, 16);
    const snout = new THREE.Mesh(snoutGeo, createMat(0xffedd5, 0.4));
    snout.rotation.set(1.45, 0, 0);
    snout.position.set(0, 0.25, 0.75);
    bodyGroup.add(snout);

    // Big Fox Ears
    const earGeo = new THREE.ConeGeometry(0.22, 0.65, 16);
    const earMat = createMat(0xc2410c, 0.3);
    const lEar = new THREE.Mesh(earGeo, earMat);
    lEar.position.set(-0.45, 0.95, 0.1);
    lEar.rotation.set(0, 0, 0.35);
    bodyGroup.add(lEar);
    refs.leftEarRef.current = lEar;

    const rEar = new THREE.Mesh(earGeo, earMat);
    rEar.position.set(0.45, 0.95, 0.1);
    rEar.rotation.set(0, 0, -0.35);
    bodyGroup.add(rEar);
    refs.rightEarRef.current = rEar;

    add3DEyes(bodyGroup, 0.26, 0.45, 0.68, refs);
    addDragonTail(bodyGroup, 0xf97316, refs);

    refs.hatAnchor.position.set(0, 1.25, 0);
    refs.glassesAnchor.position.set(0, 0.46, 0.75);
    refs.neckAnchor.position.set(0, 0.12, 0.7);
    refs.chestAnchor.position.set(0, -0.18, 0.75);
  } else if (petType === 'rune-stalker') {
    // Rune-Stalker: Mystical nine-tailed Kitsune with arcane floating runes
    const bodyGeo = new THREE.CapsuleGeometry(0.7, 0.9, 24, 28);
    const stalkMat = createMat(0x881337, 0.3, 0.3);
    const body = new THREE.Mesh(bodyGeo, stalkMat);
    bodyGroup.add(body);

    // Floating Arcane Runic Ring
    const runeRingGeo = new THREE.TorusGeometry(0.85, 0.04, 16, 32);
    const runeMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.9,
    });
    const runeRing = new THREE.Mesh(runeRingGeo, runeMat);
    runeRing.position.set(0, 0.1, 0);
    bodyGroup.add(runeRing);

    add3DEyes(bodyGroup, 0.28, 0.52, 0.72, refs);
    addDragonTail(bodyGroup, 0xe11d48, refs);

    refs.hatAnchor.position.set(0, 1.35, 0);
    refs.glassesAnchor.position.set(0, 0.54, 0.78);
    refs.neckAnchor.position.set(0, 0.18, 0.72);
    refs.chestAnchor.position.set(0, -0.18, 0.78);
  } else if (petType === 'ember-scribe') {
    // Ember-Scribe: Quill-tailed fire wyrm scribe
    const bodyGeo = new THREE.CapsuleGeometry(0.68, 0.85, 24, 24);
    const wyrmMat = createMat(0xc2410c, 0.35);
    const body = new THREE.Mesh(bodyGeo, wyrmMat);
    bodyGroup.add(body);

    // Glowing Quill Tail
    const quillGeo = new THREE.ConeGeometry(0.12, 0.8, 16);
    const quillMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
    });
    const quill = new THREE.Mesh(quillGeo, quillMat);
    quill.position.set(0, -0.4, -0.9);
    quill.rotation.set(-1.2, 0, 0);
    bodyGroup.add(quill);
    refs.tailRef.current = quill;

    addDragonWings(bodyGroup, 0xea580c, refs);
    add3DEyes(bodyGroup, 0.28, 0.44, 0.68, refs);

    refs.hatAnchor.position.set(0, 1.25, 0);
    refs.glassesAnchor.position.set(0, 0.46, 0.74);
    refs.neckAnchor.position.set(0, 0.12, 0.7);
    refs.chestAnchor.position.set(0, -0.18, 0.74);
  } else if (petType === 'pyro-phoenix') {
    // Pyro-Phoenix: Regal bird of flame with blazing wings & phoenix crest
    const bodyGeo = new THREE.ConeGeometry(0.72, 1.5, 28);
    const phoMat = createMat(0xe11d48, 0.3); // Deep red
    const body = new THREE.Mesh(bodyGeo, phoMat);
    body.position.set(0, -0.15, 0);
    bodyGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.55, 28, 28);
    const head = new THREE.Mesh(headGeo, phoMat);
    head.position.set(0, 0.72, 0.22);
    bodyGroup.add(head);
    refs.headMeshRef.current = head;

    // Golden Phoenix Beak
    const beakGeo = new THREE.ConeGeometry(0.15, 0.45, 16);
    const beakMat = createMat(0xfbbf24, 0.2, 0.4);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.rotation.set(1.5, 0, 0);
    beak.position.set(0, 0.72, 0.75);
    bodyGroup.add(beak);

    // Flaming Phoenix Crown Crest
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf97316,
      emissiveIntensity: 0.9,
    });
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.65, 12), crestMat);
    c1.position.set(0, 1.35, 0.1);
    c1.rotation.set(-0.4, 0, 0);
    bodyGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 12), crestMat);
    c2.position.set(-0.25, 1.25, 0.1);
    c2.rotation.set(-0.4, 0, -0.4);
    bodyGroup.add(c2);

    const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 12), crestMat);
    c3.position.set(0.25, 1.25, 0.1);
    c3.rotation.set(-0.4, 0, 0.4);
    bodyGroup.add(c3);

    // Magnificent Phoenix Wings
    addPhoenixWings(bodyGroup, refs);
    add3DEyes(bodyGroup, 0.24, 0.8, 0.68, refs);

    // Fiery Phoenix Tail Feathers
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xe11d48,
      emissiveIntensity: 0.7,
    });
    const tailGeo = new THREE.CylinderGeometry(0.08, 0.22, 1.4, 16);
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.rotation.set(0.7, 0, 0);
    tail.position.set(0, -0.85, -0.7);
    bodyGroup.add(tail);
    refs.tailRef.current = tail;

    refs.hatAnchor.position.set(0, 1.5, 0.2);
    refs.glassesAnchor.position.set(0, 0.8, 0.72);
    refs.neckAnchor.position.set(0, 0.45, 0.58);
    refs.chestAnchor.position.set(0, 0.1, 0.68);
    refs.feetAnchor.position.set(0, -0.98, 0.2);
  }

  // ---------------------------------------------------------
  // CLASSIC PETS (Owl, Dino, Kitty, Phoenix, Morphy, Godly)
  // ---------------------------------------------------------
  else if (petType === 'owl') {
    // Owl: Classic wise royal owl
    const bodyGeo = new THREE.SphereGeometry(0.8, 32, 28);
    const owlMat = createMat(0x4f46e5, 0.35); // Indigo
    const body = new THREE.Mesh(bodyGeo, owlMat);
    bodyGroup.add(body);

    // Cream tummy
    const tumGeo = new THREE.SphereGeometry(0.6, 24, 24);
    const tumMat = createMat(0xe0e7ff, 0.5);
    const tummy = new THREE.Mesh(tumGeo, tumMat);
    tummy.position.set(0, -0.15, 0.38);
    tummy.scale.set(1, 1.15, 0.65);
    bodyGroup.add(tummy);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.14, 0.32, 16);
    const beak = new THREE.Mesh(beakGeo, createMat(0xf59e0b, 0.3));
    beak.rotation.set(1.5, 0, 0);
    beak.position.set(0, 0.18, 0.82);
    bodyGroup.add(beak);

    // Ear Tufts
    const earGeo = new THREE.ConeGeometry(0.18, 0.5, 16);
    const earMat = createMat(0x3730a3, 0.4);
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.48, 0.82, 0);
    leftEar.rotation.set(0, 0, 0.45);
    bodyGroup.add(leftEar);
    refs.leftEarRef.current = leftEar;

    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.48, 0.82, 0);
    rightEar.rotation.set(0, 0, -0.45);
    bodyGroup.add(rightEar);
    refs.rightEarRef.current = rightEar;

    addBirdWings(bodyGroup, 0x4338ca, refs);
    add3DEyes(bodyGroup, 0.32, 0.36, 0.72, refs);
    addLittleFeet(bodyGroup, 0xf59e0b);

    refs.hatAnchor.position.set(0, 1.15, 0);
    refs.glassesAnchor.position.set(0, 0.38, 0.78);
    refs.neckAnchor.position.set(0, 0.05, 0.72);
    refs.chestAnchor.position.set(0, -0.25, 0.75);
  } else if (petType === 'dino') {
    // Dino: Playful green dinosaur with yellow belly, snout, and back spikes
    const bodyGeo = new THREE.SphereGeometry(0.8, 32, 28);
    const dinoMat = createMat(0x10b981, 0.35); // Emerald green
    const body = new THREE.Mesh(bodyGeo, dinoMat);
    bodyGroup.add(body);

    // Lime/yellow soft tummy
    const tumGeo = new THREE.SphereGeometry(0.58, 24, 24);
    const tumMat = createMat(0xfef08a, 0.45);
    const tum = new THREE.Mesh(tumGeo, tumMat);
    tum.position.set(0, -0.15, 0.42);
    tum.scale.set(0.9, 1.15, 0.6);
    bodyGroup.add(tum);

    // Muzzle / Snout
    const snoutGeo = new THREE.BoxGeometry(0.42, 0.28, 0.35);
    const snoutMat = createMat(0x059669, 0.35);
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0, 0.05, 0.78);
    bodyGroup.add(snout);

    // Back spikes (Dorsal ridge)
    for (let i = 0; i < 3; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.12, 0.28, 12);
      const spikeMat = createMat(0xf59e0b, 0.3);
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(0, 0.75 - i * 0.45, -0.65 - i * 0.1);
      spike.rotation.x = -0.55;
      bodyGroup.add(spike);
    }

    // Dino tail
    const tailGeo = new THREE.ConeGeometry(0.24, 0.85, 16);
    const tail = new THREE.Mesh(tailGeo, dinoMat);
    tail.position.set(0, -0.45, -0.85);
    tail.rotation.x = -1.2;
    bodyGroup.add(tail);
    refs.tailRef.current = tail;

    add3DEyes(bodyGroup, 0.32, 0.34, 0.7, refs);
    addLittleFeet(bodyGroup, 0x059669);

    refs.hatAnchor.position.set(0, 1.15, 0);
    refs.glassesAnchor.position.set(0, 0.32, 0.82);
    refs.neckAnchor.position.set(0, 0.05, 0.75);
    refs.chestAnchor.position.set(0, -0.25, 0.75);
  } else if (petType === 'kitty') {
    // Kitty: Adorable playful cat with ears, paws, and tail
    const bodyGeo = new THREE.SphereGeometry(0.78, 32, 28);
    const catMat = createMat(0xfbbf24, 0.4); // Golden amber
    const body = new THREE.Mesh(bodyGeo, catMat);
    bodyGroup.add(body);

    // Cream tummy
    const tumGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const tumMat = createMat(0xffedd5, 0.4);
    const tum = new THREE.Mesh(tumGeo, tumMat);
    tum.position.set(0, -0.15, 0.42);
    tum.scale.set(0.9, 1.15, 0.6);
    bodyGroup.add(tum);

    // Pointed Cat Ears
    const earGeo = new THREE.ConeGeometry(0.22, 0.48, 16);
    const earMat = createMat(0xf59e0b, 0.35);
    const innerEarMat = createMat(0xf472b6, 0.3);

    const leftEar = new THREE.Group();
    leftEar.position.set(-0.48, 0.82, 0.1);
    leftEar.rotation.set(-0.1, 0, 0.4);
    const leftEarMesh = new THREE.Mesh(earGeo, earMat);
    const leftInner = new THREE.Mesh(earGeo, innerEarMat);
    leftInner.scale.set(0.65, 0.65, 0.65);
    leftInner.position.set(0, -0.04, 0.05);
    leftEar.add(leftEarMesh);
    leftEar.add(leftInner);
    bodyGroup.add(leftEar);
    refs.leftEarRef.current = leftEar;

    const rightEar = new THREE.Group();
    rightEar.position.set(0.48, 0.82, 0.1);
    rightEar.rotation.set(-0.1, 0, -0.4);
    const rightEarMesh = new THREE.Mesh(earGeo, earMat);
    const rightInner = new THREE.Mesh(earGeo, innerEarMat);
    rightInner.scale.set(0.65, 0.65, 0.65);
    rightInner.position.set(0, -0.04, 0.05);
    rightEar.add(rightEarMesh);
    rightEar.add(rightInner);
    bodyGroup.add(rightEar);
    refs.rightEarRef.current = rightEar;

    // Cat Nose
    const noseGeo = new THREE.ConeGeometry(0.06, 0.08, 12);
    const nose = new THREE.Mesh(noseGeo, createMat(0xf43f5e, 0.3));
    nose.rotation.x = 1.57;
    nose.position.set(0, 0.15, 0.78);
    bodyGroup.add(nose);

    // Curving Cat Tail
    const tailCurve = new THREE.CylinderGeometry(0.08, 0.1, 0.95, 12);
    const tail = new THREE.Mesh(tailCurve, catMat);
    tail.position.set(0, -0.2, -0.8);
    tail.rotation.set(0.8, 0, 0.3);
    bodyGroup.add(tail);
    refs.tailRef.current = tail;

    add3DEyes(bodyGroup, 0.3, 0.34, 0.7, refs);
    addLittleFeet(bodyGroup, 0xd97706);

    refs.hatAnchor.position.set(0, 1.15, 0);
    refs.glassesAnchor.position.set(0, 0.34, 0.78);
    refs.neckAnchor.position.set(0, 0.05, 0.75);
    refs.chestAnchor.position.set(0, -0.25, 0.75);
  } else if (petType === 'phoenix') {
    // Phoenix: Radiant celestial flame bird
    const bodyGeo = new THREE.SphereGeometry(0.76, 32, 28);
    const fireMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Flame crimson
      emissive: 0xb91c1c,
      emissiveIntensity: 0.35,
      roughness: 0.25,
    });
    const body = new THREE.Mesh(bodyGeo, fireMat);
    bodyGroup.add(body);

    // Radiant Gold Breast
    const goldMat = createMat(0xf59e0b, 0.25, 0.3);
    const breastGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const breast = new THREE.Mesh(breastGeo, goldMat);
    breast.position.set(0, -0.15, 0.42);
    breast.scale.set(0.95, 1.1, 0.55);
    bodyGroup.add(breast);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.12, 0.38, 16);
    const beak = new THREE.Mesh(beakGeo, createMat(0xfbbf24, 0.2));
    beak.rotation.set(1.5, 0, 0);
    beak.position.set(0, 0.18, 0.82);
    bodyGroup.add(beak);

    // Head Fire Plumes
    for (let i = 0; i < 3; i++) {
      const plumeGeo = new THREE.ConeGeometry(0.12 - i * 0.02, 0.65 - i * 0.08, 12);
      const plumeMat = createMat(i === 1 ? 0xfacc15 : 0xf97316, 0.2);
      const plume = new THREE.Mesh(plumeGeo, plumeMat);
      plume.position.set((i - 1) * 0.22, 0.95, -0.05 - i * 0.06);
      plume.rotation.set(-0.35, 0, (i - 1) * 0.25);
      bodyGroup.add(plume);
    }

    addBirdWings(bodyGroup, 0xf97316, refs);
    add3DEyes(bodyGroup, 0.3, 0.36, 0.7, refs);
    addLittleFeet(bodyGroup, 0xf59e0b);

    refs.hatAnchor.position.set(0, 1.15, 0);
    refs.glassesAnchor.position.set(0, 0.38, 0.76);
    refs.neckAnchor.position.set(0, 0.05, 0.72);
    refs.chestAnchor.position.set(0, -0.25, 0.75);
  } else if (petType === 'morphling') {
    // Morphy the Morphling: Dota Fluid Water Elemental
    // Shimmering translucent fluid water body
    const bodyGeo = new THREE.SphereGeometry(0.82, 32, 28);
    bodyGeo.scale(1, 1.15, 0.92);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4, // Cyan water
      emissive: 0x0891b2,
      emissiveIntensity: 0.3,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      transmission: 0.6,
      ior: 1.33,
    });
    const body = new THREE.Mesh(bodyGeo, waterMat);
    bodyGroup.add(body);

    // Morphling Water Crest / Swirling fluid waves on head
    const waveGeo = new THREE.ConeGeometry(0.35, 0.7, 16);
    const wave = new THREE.Mesh(waveGeo, waterMat);
    wave.position.set(0, 0.95, -0.15);
    wave.rotation.set(-0.4, 0, 0);
    bodyGroup.add(wave);

    // Floating water droplet hands
    const handGeo = new THREE.SphereGeometry(0.24, 20, 20);
    handGeo.scale(1, 1.4, 0.8);
    const leftHand = new THREE.Mesh(handGeo, waterMat);
    leftHand.position.set(-0.95, 0.05, 0.2);
    leftHand.rotation.z = -0.3;
    bodyGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, waterMat);
    rightHand.position.set(0.95, 0.05, 0.2);
    rightHand.rotation.z = 0.3;
    bodyGroup.add(rightHand);

    // Glowing Hydro Aqua Aura Ring around base
    const ringGeo = new THREE.TorusGeometry(0.9, 0.08, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
    });
    const auraRing = new THREE.Mesh(ringGeo, ringMat);
    auraRing.rotation.x = Math.PI / 2;
    auraRing.position.y = -0.65;
    bodyGroup.add(auraRing);

    add3DEyes(bodyGroup, 0.32, 0.36, 0.74, refs);

    refs.hatAnchor.position.set(0, 1.25, 0);
    refs.glassesAnchor.position.set(0, 0.38, 0.8);
    refs.neckAnchor.position.set(0, 0.05, 0.76);
    refs.chestAnchor.position.set(0, -0.2, 0.78);
  } else if (petType === 'godly') {
    // Godly (Aether): Divine radiant celestial starlight entity
    const bodyGeo = new THREE.SphereGeometry(0.8, 32, 28);
    const godMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfae8ff,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, godMat);
    bodyGroup.add(body);

    // Divine floating halo
    const haloGeo = new THREE.TorusGeometry(0.65, 0.07, 16, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2.3;
    halo.position.set(0, 1.25, -0.1);
    bodyGroup.add(halo);

    addBirdWings(bodyGroup, 0xfef08a, refs);
    add3DEyes(bodyGroup, 0.3, 0.34, 0.72, refs);
    addLittleFeet(bodyGroup, 0xfacc15);

    refs.hatAnchor.position.set(0, 1.35, 0);
    refs.glassesAnchor.position.set(0, 0.36, 0.78);
    refs.neckAnchor.position.set(0, 0.05, 0.74);
    refs.chestAnchor.position.set(0, -0.25, 0.76);
  } else {
    // Default fallback
    const bodyGeo = new THREE.SphereGeometry(0.78, 32, 28);
    const bodyMat = createMat(0x10b981, 0.35);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    bodyGroup.add(body);

    add3DEyes(bodyGroup, 0.3, 0.34, 0.68, refs);
    addLittleFeet(bodyGroup, 0x059669);
  }
}

// ---------------------------------------------------------------------------
// 3D EYE AND LIMB BUILDERS
// ---------------------------------------------------------------------------

function add3DEyes(parent: THREE.Object3D, spacing: number, y: number, z: number, refs: PetRefs) {
  // Sclera
  const scleraGeo = new THREE.SphereGeometry(0.18, 20, 20);
  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

  // Pupil
  const pupilGeo = new THREE.SphereGeometry(0.11, 16, 16);
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });

  // Gloss highlight
  const glossGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const glossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Left Eye Group
  const leftEye = new THREE.Group();
  leftEye.position.set(-spacing, y, z);
  const leftSclera = new THREE.Mesh(scleraGeo, scleraMat);
  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(0, 0, 0.11);
  const leftGloss = new THREE.Mesh(glossGeo, glossMat);
  leftGloss.position.set(0.04, 0.04, 0.18);
  leftEye.add(leftSclera);
  leftEye.add(leftPupil);
  leftEye.add(leftGloss);
  parent.add(leftEye);
  refs.leftEyeRef.current = leftEye;

  // Right Eye Group
  const rightEye = new THREE.Group();
  rightEye.position.set(spacing, y, z);
  const rightSclera = new THREE.Mesh(scleraGeo, scleraMat);
  const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.position.set(0, 0, 0.11);
  const rightGloss = new THREE.Mesh(glossGeo, glossMat);
  rightGloss.position.set(0.04, 0.04, 0.18);
  rightEye.add(rightSclera);
  rightEye.add(rightPupil);
  rightEye.add(rightGloss);
  parent.add(rightEye);
  refs.rightEyeRef.current = rightEye;
}

function addLittleFeet(parent: THREE.Object3D, color: number, spread = 0.35, y = -0.78) {
  const footGeo = new THREE.SphereGeometry(0.2, 16, 16);
  footGeo.scale(1, 0.6, 1.4);
  const footMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });

  const leftFoot = new THREE.Mesh(footGeo, footMat);
  leftFoot.position.set(-spread, y, 0.25);
  parent.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, footMat);
  rightFoot.position.set(spread, y, 0.25);
  parent.add(rightFoot);
}

function addBirdWings(parent: THREE.Object3D, color: number, refs: PetRefs, scale = 1.0) {
  const wingGeo = new THREE.BoxGeometry(0.85 * scale, 0.45 * scale, 0.08);
  const wingMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-0.85 * scale, 0.1, 0);
  leftWing.rotation.set(0, -0.3, 0.2);
  parent.add(leftWing);
  refs.leftWingRef.current = leftWing;

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.85 * scale, 0.1, 0);
  rightWing.rotation.set(0, 0.3, -0.2);
  parent.add(rightWing);
  refs.rightWingRef.current = rightWing;
}

function addDragonWings(parent: THREE.Object3D, color: number, refs: PetRefs) {
  const wingGeo = new THREE.ConeGeometry(0.65, 1.2, 16);
  const wingMat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, side: THREE.DoubleSide });

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-0.95, 0.45, -0.3);
  leftWing.rotation.set(-0.2, 0, 1.2);
  parent.add(leftWing);
  refs.leftWingRef.current = leftWing;

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.95, 0.45, -0.3);
  rightWing.rotation.set(-0.2, 0, -1.2);
  parent.add(rightWing);
  refs.rightWingRef.current = rightWing;
}

function addPhoenixWings(parent: THREE.Object3D, refs: PetRefs) {
  const wingGeo = new THREE.ConeGeometry(0.75, 1.6, 16);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xe11d48,
    emissiveIntensity: 0.75,
    roughness: 0.2,
    side: THREE.DoubleSide,
  });

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-1.1, 0.5, -0.2);
  leftWing.rotation.set(-0.2, 0, 1.15);
  parent.add(leftWing);
  refs.leftWingRef.current = leftWing;

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(1.1, 0.5, -0.2);
  rightWing.rotation.set(-0.2, 0, -1.15);
  parent.add(rightWing);
  refs.rightWingRef.current = rightWing;
}

function addDragonTail(parent: THREE.Object3D, color: number, refs: PetRefs) {
  const tailGeo = new THREE.CylinderGeometry(0.08, 0.22, 1.0, 16);
  const tailMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(0, -0.45, -0.75);
  tail.rotation.set(0.9, 0, 0);
  parent.add(tail);
  refs.tailRef.current = tail;
}

// ---------------------------------------------------------------------------
// 3D COSTUMES & ACCESSORIES BUILDER
// ---------------------------------------------------------------------------

interface CostumeAnchors {
  equippedCosmetics: {
    hat?: string;
    glasses?: string;
    necklace?: string;
    shoes?: string;
    wings?: string;
    costume?: string;
    aura?: string;
  };
  hatAnchor: THREE.Group;
  glassesAnchor: THREE.Group;
  neckAnchor: THREE.Group;
  chestAnchor: THREE.Group;
  backAnchor: THREE.Group;
  feetAnchor: THREE.Group;
  wingsAnchor: THREE.Group;
  auraAnchor?: THREE.Group;
  petType?: LingoPetType;
}

function build3DCostumes({
  equippedCosmetics,
  hatAnchor,
  glassesAnchor,
  neckAnchor,
  chestAnchor,
  backAnchor,
  feetAnchor,
  wingsAnchor,
  auraAnchor,
  petType,
}: CostumeAnchors) {
  // Clear existing items in anchors
  [hatAnchor, glassesAnchor, neckAnchor, chestAnchor, backAnchor, feetAnchor, wingsAnchor, auraAnchor].forEach((anchor) => {
    if (!anchor) return;
    while (anchor.children.length > 0) {
      anchor.remove(anchor.children[0]);
    }
  });

  const createMat = (color: number, roughness = 0.35, metalness = 0.1) => {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  };

  const norm = (id?: string) => (id || '').toLowerCase().replace(/[-_]/g, '');

  // 1. FULL BODY COSTUMES & CHEST RELICS
  if (equippedCosmetics.costume) {
    const c = norm(equippedCosmetics.costume);

    if (c.includes('botanical') || c.includes('satchel') || c.includes('relicleaf')) {
      // 🌿 RELIC: Botanical Explorer Vest & Satchel
      const relicGroup = new THREE.Group();

      // Tailored vest sizing based on pet body shape
      const isSquirrel = petType === 'seed-rooter';
      const isFloby = petType === 'floby';
      const isTortoise = petType === 'tome-tortoise';
      const isDrake = petType === 'lore-drake';

      const vestWidth = isFloby ? 0.88 : isTortoise ? 0.92 : isSquirrel ? 0.74 : 0.72;
      const vestDepth = isSquirrel ? 0.36 : 0.44; // Stay behind Seed-Rooter's held study book!

      // 1. Emerald Tunic with Golden Embroidered Edging
      const vestGeo = new THREE.BoxGeometry(vestWidth, 0.62, vestDepth);
      const vestMat = createMat(0x14532d, 0.45);
      const vest = new THREE.Mesh(vestGeo, vestMat);
      vest.position.set(0, 0, isSquirrel ? -0.12 : 0);
      relicGroup.add(vest);

      // Golden lapels / stitch trim
      const lapelGeo = new THREE.BoxGeometry(0.12, 0.58, 0.04);
      const goldTrimMat = createMat(0xfacc15, 0.2, 0.8);
      const leftLapel = new THREE.Mesh(lapelGeo, goldTrimMat);
      leftLapel.position.set(-vestWidth * 0.3, 0, (vestDepth / 2) + 0.02 + (isSquirrel ? -0.12 : 0));
      relicGroup.add(leftLapel);
      const rightLapel = new THREE.Mesh(lapelGeo, goldTrimMat);
      rightLapel.position.set(vestWidth * 0.3, 0, (vestDepth / 2) + 0.02 + (isSquirrel ? -0.12 : 0));
      relicGroup.add(rightLapel);

      // 2. Diagonal Cross-Body Leather Harness Strap
      const strapGeo = new THREE.CylinderGeometry(0.045, 0.045, vestWidth * 1.25, 12);
      const leatherMat = createMat(0x78350f, 0.5);
      const strap = new THREE.Mesh(strapGeo, leatherMat);
      strap.rotation.set(0, 0, 0.78);
      strap.position.set(0, 0.05, (vestDepth / 2) + 0.03 + (isSquirrel ? -0.12 : 0));
      relicGroup.add(strap);

      // Metallic Buckle on the strap
      const buckleGeo = new THREE.TorusGeometry(0.08, 0.02, 12, 20);
      const buckleMat = createMat(0xfbbf24, 0.2, 0.9);
      const buckle = new THREE.Mesh(buckleGeo, buckleMat);
      buckle.position.set(0, 0.05, (vestDepth / 2) + 0.04 + (isSquirrel ? -0.12 : 0));
      relicGroup.add(buckle);

      // 3. Hanging Brass Magnifying Glass with Glass Lens
      const glassGroup = new THREE.Group();
      glassGroup.position.set(-vestWidth * 0.42, 0.08, (vestDepth / 2) + (isSquirrel ? -0.08 : 0.05));

      const ringGeo = new THREE.TorusGeometry(0.11, 0.022, 16, 24);
      const brassMat = createMat(0xd97706, 0.25, 0.85);
      const ring = new THREE.Mesh(ringGeo, brassMat);
      glassGroup.add(ring);

      const handleGeo = new THREE.CylinderGeometry(0.02, 0.022, 0.18, 12);
      const handle = new THREE.Mesh(handleGeo, brassMat);
      handle.position.set(0, -0.16, 0);
      glassGroup.add(handle);

      const lensGeo = new THREE.CircleGeometry(0.095, 20);
      const clearGlassMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.45,
      });
      const lens = new THREE.Mesh(lensGeo, clearGlassMat);
      glassGroup.add(lens);
      glassGroup.rotation.set(0.2, -0.4, -0.2);
      relicGroup.add(glassGroup);

      // 4. Expedition Satchel on Right Hip with Rolled Ancient Vocabulary Scroll
      const satchelGroup = new THREE.Group();
      const satchelX = isSquirrel ? 0.58 : (vestWidth / 2) + 0.12;
      const satchelY = isSquirrel ? -0.05 : -0.15;
      const satchelZ = isSquirrel ? -0.05 : 0.08;
      satchelGroup.position.set(satchelX, satchelY, satchelZ);

      // Satchel pouch
      const pouchGeo = new THREE.BoxGeometry(0.32, 0.36, 0.22);
      const pouchMat = createMat(0x5c2b09, 0.45);
      const pouch = new THREE.Mesh(pouchGeo, pouchMat);
      satchelGroup.add(pouch);

      // Flap & latch
      const flapGeo = new THREE.BoxGeometry(0.33, 0.16, 0.23);
      const flap = new THREE.Mesh(flapGeo, createMat(0x451a03, 0.5));
      flap.position.set(0, 0.11, 0.01);
      satchelGroup.add(flap);

      const latchGeo = new THREE.SphereGeometry(0.035, 12, 12);
      const latch = new THREE.Mesh(latchGeo, buckleMat);
      latch.position.set(0, 0.04, 0.12);
      satchelGroup.add(latch);

      // Rolled Ancient Vocabulary Scroll in side pouch
      const scrollGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.36, 16);
      const parchmentMat = createMat(0xfef3c7, 0.6);
      const scroll = new THREE.Mesh(scrollGeo, parchmentMat);
      scroll.position.set(-0.16, 0.08, 0);
      scroll.rotation.set(0, 0, 0.3);
      satchelGroup.add(scroll);

      // Green ribbon tied on scroll
      const ribbonGeo = new THREE.TorusGeometry(0.05, 0.012, 8, 16);
      const ribbonMat = createMat(0x16a34a, 0.3);
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.rotation.x = Math.PI / 2;
      ribbon.position.set(-0.16, 0.08, 0);
      satchelGroup.add(ribbon);

      relicGroup.add(satchelGroup);

      // 5. Glowing Runic Leaf Emblem on Breast
      const leafBadgeGeo = new THREE.OctahedronGeometry(0.09);
      const leafBadgeMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x34d399,
        emissiveIntensity: 1.2,
      });
      const badge = new THREE.Mesh(leafBadgeGeo, leafBadgeMat);
      badge.position.set(0.18, 0.16, (vestDepth / 2) + 0.04 + (isSquirrel ? -0.12 : 0));
      relicGroup.add(badge);

      chestAnchor.add(relicGroup);
    } else if (c.includes('tempest') || c.includes('relicwind')) {
      // 🦅 RELIC: Sky Tempest Mantle
      const mantleGroup = new THREE.Group();

      // Pauldrons (Aerodynamic feather shoulders)
      const pauldronMat = createMat(0x0284c7, 0.35, 0.3);
      const featherGlowMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.1,
      });

      [-0.52, 0.52].forEach((xSide) => {
        const pGroup = new THREE.Group();
        pGroup.position.set(xSide, 0.22, 0);

        // Curved pauldron cap
        const capGeo = new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const pCap = new THREE.Mesh(capGeo, pauldronMat);
        pGroup.add(pCap);

        // Segmented feather blades
        for (let i = 0; i < 3; i++) {
          const bladeGeo = new THREE.ConeGeometry(0.08, 0.35, 8);
          const blade = new THREE.Mesh(bladeGeo, i === 1 ? featherGlowMat : pauldronMat);
          blade.rotation.set(0, 0, xSide > 0 ? -0.8 - i * 0.2 : 0.8 + i * 0.2);
          blade.position.set(xSide > 0 ? 0.12 + i * 0.06 : -0.12 - i * 0.06, -0.08 - i * 0.04, 0);
          pGroup.add(blade);
        }
        mantleGroup.add(pGroup);
      });

      // Golden Griffin Throat Clasp with Pulsing Wind Sapphire
      const claspGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.06, 16);
      const goldMat = createMat(0xfacc15, 0.2, 0.85);
      const clasp = new THREE.Mesh(claspGeo, goldMat);
      clasp.rotation.x = Math.PI / 2;
      clasp.position.set(0, 0.24, 0.35);
      mantleGroup.add(clasp);

      const sapphireGeo = new THREE.OctahedronGeometry(0.085);
      const sapphireMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 1.4,
      });
      const sapphire = new THREE.Mesh(sapphireGeo, sapphireMat);
      sapphire.position.set(0, 0.24, 0.4);
      mantleGroup.add(sapphire);

      // Twin Silk Cape Tails Flowing Backwards
      const capeGeo = new THREE.BoxGeometry(0.3, 0.85, 0.04);
      const silkMat = createMat(0x0369a1, 0.4);
      const leftCape = new THREE.Mesh(capeGeo, silkMat);
      leftCape.position.set(-0.28, -0.25, -0.32);
      leftCape.rotation.set(0.25, 0, 0.12);
      mantleGroup.add(leftCape);

      const rightCape = new THREE.Mesh(capeGeo, silkMat);
      rightCape.position.set(0.28, -0.25, -0.32);
      rightCape.rotation.set(0.25, 0, -0.12);
      mantleGroup.add(rightCape);

      chestAnchor.add(mantleGroup);
    } else if (c.includes('magma') || c.includes('relicfire')) {
      // 🐉 RELIC: Volcanic Dragon Plate
      const magmaGroup = new THREE.Group();

      // Obsidian Dragon Breastplate
      const obsidianMat = createMat(0x18181b, 0.2, 0.85);
      const lavaGlowMat = new THREE.MeshStandardMaterial({
        color: 0xff3b30,
        emissive: 0xef4444,
        emissiveIntensity: 1.5,
      });

      const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.64, 0.42), obsidianMat);
      magmaGroup.add(chestPlate);

      // Molten Lava Fissure Veins
      const fissure1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.05), lavaGlowMat);
      fissure1.position.set(-0.15, 0.02, 0.22);
      fissure1.rotation.z = -0.3;
      magmaGroup.add(fissure1);

      const fissure2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.05), lavaGlowMat);
      fissure2.position.set(0.15, 0.02, 0.22);
      fissure2.rotation.z = 0.3;
      magmaGroup.add(fissure2);

      // Glowing Dragon Rune Core
      const coreGeo = new THREE.OctahedronGeometry(0.12);
      const core = new THREE.Mesh(coreGeo, lavaGlowMat);
      core.position.set(0, 0.08, 0.23);
      magmaGroup.add(core);

      // Spiked Dragon-Head Pauldrons
      [-0.54, 0.54].forEach((xSide) => {
        const pGeo = new THREE.ConeGeometry(0.18, 0.42, 16);
        const pSpike = new THREE.Mesh(pGeo, obsidianMat);
        pSpike.rotation.set(0, 0, xSide > 0 ? -1.1 : 1.1);
        pSpike.position.set(xSide, 0.22, 0);
        magmaGroup.add(pSpike);

        const gemEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), lavaGlowMat);
        gemEye.position.set(xSide, 0.2, 0.12);
        magmaGroup.add(gemEye);
      });

      chestAnchor.add(magmaGroup);
    } else if (c.includes('mecha') || c.includes('cyber')) {
      // Cyber Mecha Titan
      const chestArmorGeo = new THREE.BoxGeometry(0.75, 0.65, 0.45);
      const mechaMat = createMat(0x0f172a, 0.3, 0.85);
      const chestArmor = new THREE.Mesh(chestArmorGeo, mechaMat);
      chestAnchor.add(chestArmor);

      const reactorGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24);
      const reactorMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x22d3ee,
        emissiveIntensity: 1.2,
      });
      const reactor = new THREE.Mesh(reactorGeo, reactorMat);
      reactor.rotation.x = Math.PI / 2;
      reactor.position.set(0, 0.05, 0.24);
      chestAnchor.add(reactor);

      const pauldronGeo = new THREE.BoxGeometry(0.35, 0.25, 0.35);
      const leftP = new THREE.Mesh(pauldronGeo, mechaMat);
      leftP.position.set(-0.52, 0.22, 0);
      chestAnchor.add(leftP);
      const rightP = new THREE.Mesh(pauldronGeo, mechaMat);
      rightP.position.set(0.52, 0.22, 0);
      chestAnchor.add(rightP);
    } else if (c.includes('archmage') || c.includes('astral')) {
      const robeGeo = new THREE.CylinderGeometry(0.48, 0.65, 0.8, 24, 1, true);
      const robeMat = createMat(0x4c1d95, 0.4, 0.2);
      const robe = new THREE.Mesh(robeGeo, robeMat);
      chestAnchor.add(robe);

      const collarGeo = new THREE.TorusGeometry(0.38, 0.06, 16, 32);
      const goldMat = createMat(0xfbbf24, 0.2, 0.8);
      const collar = new THREE.Mesh(collarGeo, goldMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 0.38, 0);
      chestAnchor.add(collar);
    } else if (c.includes('royal') || c.includes('sovereign')) {
      const capeGeo = new THREE.BoxGeometry(0.85, 1.1, 0.08);
      const velvetMat = createMat(0x991b1b, 0.6);
      const cape = new THREE.Mesh(capeGeo, velvetMat);
      cape.position.set(0, -0.25, -0.25);
      backAnchor.add(cape);

      const medGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 20);
      const med = new THREE.Mesh(medGeo, createMat(0xfacc15, 0.2, 0.8));
      med.rotation.x = Math.PI / 2;
      med.position.set(0, 0.12, 0.2);
      chestAnchor.add(med);
    } else if (c.includes('shinobi') || c.includes('ninja')) {
      const vestGeo = new THREE.BoxGeometry(0.68, 0.6, 0.38);
      const ninjaMat = createMat(0x09090b, 0.7);
      const vest = new THREE.Mesh(vestGeo, ninjaMat);
      chestAnchor.add(vest);
    } else if (c.includes('astro') || c.includes('space')) {
      const packGeo = new THREE.BoxGeometry(0.7, 0.65, 0.4);
      const astroMat = createMat(0xf8fafc, 0.3);
      const chestPack = new THREE.Mesh(packGeo, astroMat);
      chestAnchor.add(chestPack);
    } else if (c.includes('astral_codex') || c.includes('codex') || c.includes('spellbook')) {
      // 📖 RELIC: Astral Codex of Ancient Runes (Hovering Grimoire)
      const codexGroup = new THREE.Group();
      codexGroup.position.set(0.68, 0.4, -0.35);
      codexGroup.rotation.set(0.2, -0.5, 0.15);

      const coverGeo = new THREE.BoxGeometry(0.6, 0.75, 0.12);
      const coverMat = createMat(0x1e1b4b, 0.35, 0.6);
      const cover = new THREE.Mesh(coverGeo, coverMat);
      codexGroup.add(cover);

      const goldMat = createMat(0xfacc15, 0.2, 0.85);
      [-0.26, 0.26].forEach((x) => {
        [-0.32, 0.32].forEach((y) => {
          const corner = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.14), goldMat);
          corner.position.set(x, y, 0);
          codexGroup.add(corner);
        });
      });

      const pagesGeo = new THREE.BoxGeometry(0.55, 0.7, 0.08);
      const pagesMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfacc15,
        emissiveIntensity: 1.2,
      });
      const pages = new THREE.Mesh(pagesGeo, pagesMat);
      pages.position.set(0.02, 0, 0.03);
      codexGroup.add(pages);

      backAnchor.add(codexGroup);
    } else if (c.includes('aegis') || c.includes('shield')) {
      // 🛡️ RELIC: Botanical Runic Aegis (Floating Shield)
      const aegisGroup = new THREE.Group();
      aegisGroup.position.set(-0.72, 0.1, 0.15);
      aegisGroup.rotation.set(0, 0.65, 0);

      const shieldGeo = new THREE.CylinderGeometry(0.38, 0.28, 0.85, 6);
      const shieldMat = createMat(0x15803d, 0.4, 0.4);
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      aegisGroup.add(shield);

      const bossGeo = new THREE.OctahedronGeometry(0.14);
      const bossMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x34d399,
        emissiveIntensity: 1.5,
      });
      const boss = new THREE.Mesh(bossGeo, bossMat);
      boss.position.set(0, 0, 0.2);
      aegisGroup.add(boss);

      chestAnchor.add(aegisGroup);
    }
  }

  // 2. HATS & HEADWEAR RELICS
  if (equippedCosmetics.hat) {
    const h = norm(equippedCosmetics.hat);

    if (h.includes('relicacorn') || h.includes('goldenacorn')) {
      // 🌰 RELIC: Golden Acorn Crown
      const crownGroup = new THREE.Group();

      // Lift crown slightly above Pip's DJ headphones headband
      const isPip = petType === 'pip';
      const isFox = petType === 'spark-fox' || petType === 'rune-stalker';
      const yOffset = isPip ? 0.28 : isFox ? 0.15 : 0.05;

      // Base Circlet Ring
      const ringGeo = new THREE.TorusGeometry(0.48, 0.045, 16, 32);
      const goldMat = createMat(0xfacc15, 0.18, 0.88);
      const ring = new THREE.Mesh(ringGeo, goldMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, yOffset, 0);
      crownGroup.add(ring);

      // 5 Gilded Oak Leaves Circling the Rim
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const leafGeo = new THREE.ConeGeometry(0.12, 0.38, 12);
        const leaf = new THREE.Mesh(leafGeo, goldMat);
        leaf.position.set(Math.cos(angle) * 0.48, yOffset + 0.18, Math.sin(angle) * 0.48);
        leaf.rotation.set(0, -angle, 0);
        crownGroup.add(leaf);
      }

      // Center Acorn Finial with Radiant Facet-Cut Emerald
      const acornCapGeo = new THREE.SphereGeometry(0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const acornCap = new THREE.Mesh(acornCapGeo, goldMat);
      acornCap.position.set(0, yOffset + 0.35, 0);
      crownGroup.add(acornCap);

      const emeraldGeo = new THREE.OctahedronGeometry(0.12);
      const emeraldMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x34d399,
        emissiveIntensity: 1.5,
      });
      const emerald = new THREE.Mesh(emeraldGeo, emeraldMat);
      emerald.position.set(0, yOffset + 0.48, 0);
      crownGroup.add(emerald);

      hatAnchor.add(crownGroup);
    } else if (h.includes('soniccrest')) {
      // ⚡ RELIC: Sonic Feather Crest
      const crestGroup = new THREE.Group();

      const isPip = petType === 'pip';
      const yOffset = isPip ? 0.15 : 0;

      // Swept-back aerodynamic triple plumes
      const plumeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.3,
        roughness: 0.25,
      });

      const centerPlume = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.85, 16), plumeMat);
      centerPlume.rotation.set(-0.65, 0, 0);
      centerPlume.position.set(0, yOffset + 0.38, -0.22);
      crestGroup.add(centerPlume);

      const leftPlume = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.68, 14), plumeMat);
      leftPlume.rotation.set(-0.55, 0, -0.32);
      leftPlume.position.set(-0.24, yOffset + 0.32, -0.16);
      crestGroup.add(leftPlume);

      const rightPlume = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.68, 14), plumeMat);
      rightPlume.rotation.set(-0.55, 0, 0.32);
      rightPlume.position.set(0.24, yOffset + 0.32, -0.16);
      crestGroup.add(rightPlume);

      // Soundwave Equalizer Band Mount
      const bandGeo = new THREE.TorusGeometry(0.46, 0.035, 16, 28);
      const bandMat = createMat(0x0f172a, 0.2, 0.9);
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.set(0, yOffset + 0.1, 0);
      crestGroup.add(band);

      hatAnchor.add(crestGroup);
    } else if (h.includes('flamecirclet')) {
      // 🔥 RELIC: Solar Flame Circlet
      const circletGroup = new THREE.Group();

      const goldMat = createMat(0xf59e0b, 0.18, 0.88);
      const rubyMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xff3b30,
        emissiveIntensity: 1.6,
      });

      // Sun-wheel circlet ring
      const ringGeo = new THREE.TorusGeometry(0.48, 0.04, 16, 32);
      const ring = new THREE.Mesh(ringGeo, goldMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.1, 0);
      circletGroup.add(ring);

      // 7 Radiating Solar Flares
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const flareGeo = new THREE.ConeGeometry(0.08, 0.34, 12);
        const flare = new THREE.Mesh(flareGeo, goldMat);
        flare.position.set(Math.cos(angle) * 0.48, 0.24, Math.sin(angle) * 0.48);
        flare.rotation.set(0, -angle, 0);
        circletGroup.add(flare);
      }

      // Suspended Solar Core Ruby
      const rubyGeo = new THREE.OctahedronGeometry(0.14);
      const ruby = new THREE.Mesh(rubyGeo, rubyMat);
      ruby.position.set(0, 0.28, 0.46);
      circletGroup.add(ruby);

      hatAnchor.add(circletGroup);
    } else if (h.includes('wizard')) {
      const coneGeo = new THREE.ConeGeometry(0.42, 0.95, 20);
      const brimGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.06, 24);
      const hatMat = createMat(0x312e81, 0.4);
      const brim = new THREE.Mesh(brimGeo, hatMat);
      const cone = new THREE.Mesh(coneGeo, hatMat);
      cone.position.set(0, 0.48, -0.05);
      cone.rotation.x = -0.15;
      hatAnchor.add(brim);
      hatAnchor.add(cone);
    } else if (h.includes('crown') || h.includes('tiara')) {
      const crownGeo = new THREE.CylinderGeometry(0.52, 0.46, 0.35, 5);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
      });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(0, 0.16, 0);
      hatAnchor.add(crown);
    } else if (h.includes('halo') || h.includes('laurel')) {
      const haloGeo = new THREE.TorusGeometry(0.55, 0.045, 16, 32);
      const haloMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xfacc15,
        emissiveIntensity: 1.0,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.set(0, 0.45, 0);
      hatAnchor.add(halo);
    } else if (h.includes('dragon') || h.includes('horn')) {
      const hornGeo = new THREE.ConeGeometry(0.12, 0.6, 16);
      const hornMat = createMat(0xf97316, 0.3, 0.5);
      const lH = new THREE.Mesh(hornGeo, hornMat);
      lH.position.set(-0.55, 0.25, 0);
      lH.rotation.set(0, 0, 0.7);
      hatAnchor.add(lH);
      const rH = new THREE.Mesh(hornGeo, hornMat);
      rH.position.set(0.55, 0.25, 0);
      rH.rotation.set(0, 0, -0.7);
      hatAnchor.add(rH);
    }
  }

  // 3. EYEWEAR & VISOR RELICS
  if (equippedCosmetics.glasses) {
    const g = norm(equippedCosmetics.glasses);

    // Adjust Z offset for protruding snouts so glasses never clip inside face
    const isSnoutPet = petType === 'spark-fox' || petType === 'rune-stalker' || petType === 'lore-drake';
    const zOffset = isSnoutPet ? 0.18 : 0;

    if (g.includes('aerovisor') || g.includes('aero_visor') || g.includes('vr') || g.includes('visor')) {
      // 🥽 RELIC: Aero Visor of Listening
      const visorGroup = new THREE.Group();
      visorGroup.position.set(0, 0, zOffset);

      // Curved HUD Polarized Lens
      const hudGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 24, 1, true, -Math.PI * 0.45, Math.PI * 0.9);
      const hudMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x22d3ee,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
      });
      const hud = new THREE.Mesh(hudGeo, hudMat);
      hud.rotation.y = Math.PI;
      visorGroup.add(hud);

      // Carbon-Fiber Brow Frame & Temple Arms
      const frameGeo = new THREE.TorusGeometry(0.43, 0.025, 12, 24, Math.PI * 0.85);
      const frameMat = createMat(0x0f172a, 0.3, 0.9);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.rotation.set(Math.PI / 2, 0, Math.PI * 0.08);
      frame.position.set(0, 0.11, 0);
      visorGroup.add(frame);

      // Gold Hinge Accents
      [-0.43, 0.43].forEach((x) => {
        const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 12), createMat(0xfbbf24, 0.2, 0.8));
        hinge.position.set(x, 0.08, 0);
        visorGroup.add(hinge);
      });

      glassesAnchor.add(visorGroup);
    } else if (g.includes('steampunk') || g.includes('goggle') || g.includes('monocle')) {
      // ⚙️ RELIC: Explorer Monocle Goggles
      const goggleGroup = new THREE.Group();
      goggleGroup.position.set(0, 0, zOffset);

      const brassMat = createMat(0xd97706, 0.25, 0.85);
      const amberLensMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.75,
        roughness: 0.15,
      });

      // Machined Brass Bezels
      [-0.26, 0.26].forEach((xSide, idx) => {
        const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.14, 20), brassMat);
        bezel.rotation.x = Math.PI / 2;
        bezel.position.set(xSide, 0, 0);
        goggleGroup.add(bezel);

        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), amberLensMat);
        lens.position.set(xSide, 0, 0.075);
        goggleGroup.add(lens);

        // Right eye has articulated flip-down jeweler's loupe
        if (idx === 1) {
          const loupeGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.16, 16);
          const loupe = new THREE.Mesh(loupeGeo, brassMat);
          loupe.rotation.x = Math.PI / 2;
          loupe.position.set(xSide + 0.06, 0.05, 0.14);
          goggleGroup.add(loupe);
        }
      });

      // Leather Brow Bridge
      const bridgeGeo = new THREE.BoxGeometry(0.16, 0.04, 0.06);
      const bridge = new THREE.Mesh(bridgeGeo, createMat(0x451a03, 0.5));
      bridge.position.set(0, 0, 0.05);
      goggleGroup.add(bridge);

      glassesAnchor.add(goggleGroup);
    } else {
      // Standard Glasses
      const frameGeo = new THREE.TorusGeometry(0.18, 0.03, 12, 24);
      const frameMat = createMat(0xfbbf24, 0.3, 0.6);
      const lLens = new THREE.Mesh(frameGeo, frameMat);
      lLens.position.set(-0.25, 0, zOffset);
      const rLens = new THREE.Mesh(frameGeo, frameMat);
      rLens.position.set(0.25, 0, zOffset);
      glassesAnchor.add(lLens);
      glassesAnchor.add(rLens);
    }
  }

  // 4. NECKLACES & TALISMANS
  if (equippedCosmetics.necklace) {
    const n = norm(equippedCosmetics.necklace);
    const neckGroup = new THREE.Group();

    if (n.includes('dragon') || n.includes('pearl')) {
      // 📿 RELIC: Dragon Pearl of Wisdom
      // Antique bronze dragon-claw torc
      const torcGeo = new THREE.TorusGeometry(0.42, 0.04, 16, 32);
      const bronzeMat = createMat(0x78350f, 0.4, 0.8);
      const torc = new THREE.Mesh(torcGeo, bronzeMat);
      torc.rotation.x = Math.PI / 2;
      neckGroup.add(torc);

      // Mystical Glowing Dragon Pearl
      const pearlGeo = new THREE.SphereGeometry(0.16, 24, 24);
      const pearlMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x34d399,
        emissiveIntensity: 1.4,
        roughness: 0.15,
        metalness: 0.2,
      });
      const pearl = new THREE.Mesh(pearlGeo, pearlMat);
      pearl.position.set(0, -0.16, 0.44);
      neckGroup.add(pearl);

      neckAnchor.add(neckGroup);
    } else if (n.includes('phoenix') || n.includes('heart') || n.includes('amulet')) {
      // 💖 RELIC: Phoenix Heart Pendant
      const chainGeo = new THREE.TorusGeometry(0.44, 0.03, 12, 32);
      const goldMat = createMat(0xfacc15, 0.2, 0.85);
      const chain = new THREE.Mesh(chainGeo, goldMat);
      chain.rotation.x = Math.PI / 2;
      neckGroup.add(chain);

      // Faceted Ruby Heart
      const heartGeo = new THREE.OctahedronGeometry(0.16);
      const rubyMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 1.5,
        roughness: 0.15,
      });
      const heart = new THREE.Mesh(heartGeo, rubyMat);
      heart.position.set(0, -0.18, 0.45);
      neckGroup.add(heart);

      neckAnchor.add(neckGroup);
    } else if (n.includes('hourglass') || n.includes('chronos')) {
      // ⏳ RELIC: Chronos Time Hourglass
      const hgGroup = new THREE.Group();
      hgGroup.position.set(0, -0.15, 0.45);

      const brassMat = createMat(0xd97706, 0.25, 0.85);
      const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), brassMat);
      topCap.position.set(0, 0.18, 0);
      hgGroup.add(topCap);
      const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), brassMat);
      botCap.position.set(0, -0.18, 0);
      hgGroup.add(botCap);

      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 1.4,
        transparent: true,
        opacity: 0.8,
      });
      const bulb1 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 12), glassMat);
      bulb1.rotation.x = Math.PI;
      bulb1.position.set(0, 0.08, 0);
      hgGroup.add(bulb1);
      const bulb2 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 12), glassMat);
      bulb2.position.set(0, -0.08, 0);
      hgGroup.add(bulb2);

      neckAnchor.add(hgGroup);
    } else {
      const chainGeo = new THREE.TorusGeometry(0.42, 0.03, 12, 32);
      const chain = new THREE.Mesh(chainGeo, createMat(0xfacc15, 0.2, 0.8));
      chain.rotation.x = Math.PI / 2;
      neckGroup.add(chain);
      neckAnchor.add(neckGroup);
    }
  }

  // 5. WINGS RELICS (With wide-stance clearance for tails & shells)
  if (equippedCosmetics.wings) {
    const w = norm(equippedCosmetics.wings);
    const wingsGroup = new THREE.Group();

    // Stance spread: Seed-Rooter's tail & Floby's backpack need wide stance
    const isSquirrel = petType === 'seed-rooter';
    const xSpread = isSquirrel ? 0.95 : 0.82;
    const zOffset = isSquirrel ? -0.2 : 0;

    if (w.includes('archangel') || w.includes('celestial') || w.includes('griffin')) {
      // 🪽 RELIC: Celestial Griffin Wings
      const wingMat = createMat(0xffffff, 0.25, 0.1);
      const glowTipMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.4,
      });

      [-xSpread, xSpread].forEach((xSide) => {
        const wing = new THREE.Group();
        wing.position.set(xSide, 0.35, zOffset);

        // 3 tiers of swept-back sculpted feathers
        for (let t = 0; t < 3; t++) {
          const featherGeo = new THREE.BoxGeometry(0.85 - t * 0.15, 0.24, 0.06);
          const fMesh = new THREE.Mesh(featherGeo, t === 0 ? glowTipMat : wingMat);
          fMesh.position.set(xSide > 0 ? 0.35 : -0.35, t * 0.18, -t * 0.08);
          fMesh.rotation.set(0, xSide > 0 ? 0.35 : -0.35, xSide > 0 ? -0.38 - t * 0.1 : 0.38 + t * 0.1);
          wing.add(fMesh);
        }
        wingsGroup.add(wing);
      });

      wingsAnchor.add(wingsGroup);
    } else if (w.includes('phoenix') || w.includes('flame') || w.includes('blazing')) {
      // 🔥 RELIC: Blazing Phoenix Wings
      const redMat = createMat(0x991b1b, 0.4);
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xff3b30,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9,
      });

      [-xSpread, xSpread].forEach((xSide) => {
        const wing = new THREE.Group();
        wing.position.set(xSide, 0.35, zOffset);

        for (let t = 0; t < 3; t++) {
          const featherGeo = new THREE.ConeGeometry(0.18, 0.9 - t * 0.15, 12);
          const fMesh = new THREE.Mesh(featherGeo, t === 0 ? flameMat : redMat);
          fMesh.position.set(xSide > 0 ? 0.4 : -0.4, t * 0.18, -t * 0.08);
          fMesh.rotation.set(0, 0, xSide > 0 ? -1.1 - t * 0.15 : 1.1 + t * 0.15);
          wing.add(fMesh);
        }
        wingsGroup.add(wing);
      });

      wingsAnchor.add(wingsGroup);
    } else if (w.includes('dragon') || w.includes('loredrake')) {
      // 🦇 RELIC: Lore-Drake Emerald Wings
      const boneMat = createMat(0xf59e0b, 0.2, 0.8);
      const membraneMat = new THREE.MeshStandardMaterial({
        color: 0x047857,
        emissive: 0x10b981,
        emissiveIntensity: 0.6,
        roughness: 0.4,
      });

      [-xSpread, xSpread].forEach((xSide) => {
        const wing = new THREE.Group();
        wing.position.set(xSide, 0.35, zOffset);

        const batGeo = new THREE.ConeGeometry(0.65, 1.35, 16);
        const batMesh = new THREE.Mesh(batGeo, membraneMat);
        batMesh.rotation.set(-0.25, 0, xSide > 0 ? -1.25 : 1.25);
        wing.add(batMesh);

        // Golden Claw Spur
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 12), boneMat);
        claw.position.set(xSide > 0 ? 0.3 : -0.3, 0.5, 0);
        wing.add(claw);

        wingsGroup.add(wing);
      });

      wingsAnchor.add(wingsGroup);
    } else {
      // Default Shimmering Wings
      const fairyGeo = new THREE.CylinderGeometry(0.2, 0.5, 1.1, 16);
      const fairyMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.75,
      });
      const lW = new THREE.Mesh(fairyGeo, fairyMat);
      lW.position.set(-xSpread, 0.35, zOffset);
      lW.rotation.set(0, 0, 0.65);
      wingsGroup.add(lW);

      const rW = new THREE.Mesh(fairyGeo, fairyMat);
      rW.position.set(xSpread, 0.35, zOffset);
      rW.rotation.set(0, 0, -0.65);
      wingsGroup.add(rW);

      wingsAnchor.add(wingsGroup);
    }
  }

  // 6. GREAVES & SHOES RELICS
  if (equippedCosmetics.shoes) {
    const s = norm(equippedCosmetics.shoes);
    const shoesGroup = new THREE.Group();

    const isSquirrel = petType === 'seed-rooter';
    const feetSpread = isSquirrel ? 0.36 : 0.35;

    if (s.includes('lightning') || s.includes('strider') || s.includes('cleat')) {
      // ⚡ RELIC: Sonic Cloud Striders
      const bootMat = createMat(0x0284c7, 0.3, 0.4);
      const glowMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.3,
      });

      [-feetSpread, feetSpread].forEach((xSide) => {
        const boot = new THREE.Group();
        boot.position.set(xSide, 0, 0);

        // Aerodynamic boot hull
        const hull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.46), bootMat);
        boot.add(hull);

        // Neon underglow sole
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.48), glowMat);
        sole.position.set(0, -0.11, 0);
        boot.add(sole);

        // Ankle lightning bolt winglet
        const boltGeo = new THREE.ConeGeometry(0.06, 0.25, 8);
        const bolt = new THREE.Mesh(boltGeo, glowMat);
        bolt.rotation.set(0.6, 0, xSide > 0 ? -0.8 : 0.8);
        bolt.position.set(xSide > 0 ? 0.16 : -0.16, 0.1, -0.12);
        boot.add(bolt);

        shoesGroup.add(boot);
      });

      feetAnchor.add(shoesGroup);
    } else if (s.includes('gold') || s.includes('hermes') || s.includes('sneaker')) {
      // 👟 RELIC: Hermes Speed Greaves
      const goldMat = createMat(0xfacc15, 0.2, 0.88);
      const wingMat = createMat(0xffffff, 0.3);

      [-feetSpread, feetSpread].forEach((xSide) => {
        const boot = new THREE.Group();
        boot.position.set(xSide, 0, 0);

        const greave = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.48), goldMat);
        boot.add(greave);

        // Hermes ankle feather wing
        const fWing = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 12), wingMat);
        fWing.rotation.set(0.4, 0, xSide > 0 ? -0.9 : 0.9);
        fWing.position.set(xSide > 0 ? 0.18 : -0.18, 0.12, -0.1);
        boot.add(fWing);

        shoesGroup.add(boot);
      });

      feetAnchor.add(shoesGroup);
    } else {
      // Standard Shoes
      const shoeGeo = new THREE.BoxGeometry(0.28, 0.22, 0.48);
      const shoeMat = createMat(0x3b82f6, 0.3, 0.2);

      const lShoe = new THREE.Mesh(shoeGeo, shoeMat);
      lShoe.position.set(-feetSpread, 0, 0);
      shoesGroup.add(lShoe);

      const rShoe = new THREE.Mesh(shoeGeo, shoeMat);
      rShoe.position.set(feetSpread, 0, 0);
      shoesGroup.add(rShoe);

      feetAnchor.add(shoesGroup);
    }
  }

  // 7. AURA EFFECTS
  if (auraAnchor && (equippedCosmetics.aura || (equippedCosmetics as any).equippedAura)) {
    const a = norm(equippedCosmetics.aura || (equippedCosmetics as any).equippedAura);
    const auraGroup = new THREE.Group();

    if (a.includes('celestial') || a.includes('halo') || a.includes('starlight')) {
      // 🌟 Celestial Starlight Gyro-Aura
      // Outer Astrolabe Gold Ring (tilted 35 deg)
      const r1Geo = new THREE.TorusGeometry(1.35, 0.035, 16, 48);
      const r1Mat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.5,
      });
      const r1 = new THREE.Mesh(r1Geo, r1Mat);
      r1.rotation.set(0.6, 0.4, 0);
      auraGroup.add(r1);

      // Inner Cosmic Cyan Ring (tilted -35 deg)
      const r2Geo = new THREE.TorusGeometry(1.15, 0.03, 16, 48);
      const r2Mat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 1.6,
      });
      const r2 = new THREE.Mesh(r2Geo, r2Mat);
      r2.rotation.set(-0.6, -0.4, 0);
      auraGroup.add(r2);

      // 6 Orbiting Radiant Star Octahedrons
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const starGeo = new THREE.OctahedronGeometry(0.12);
        const starMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xfde047,
          emissiveIntensity: 1.8,
        });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(Math.cos(angle) * 1.35, 0.1 + Math.sin(angle * 2) * 0.3, Math.sin(angle) * 1.35);
        auraGroup.add(star);
      }

      // Ground Sacred Light Disc
      const discGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.02, 32);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.35,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(0, -0.95, 0);
      auraGroup.add(disc);

      auraAnchor.add(auraGroup);
    } else if (a.includes('dragon') || a.includes('flame') || a.includes('inferno') || a.includes('fire')) {
      // 🔥 Inferno Dragon Flame Aura
      // Molten magma ground ring
      const ringGeo = new THREE.TorusGeometry(1.25, 0.06, 16, 40);
      const magmaMat = new THREE.MeshStandardMaterial({
        color: 0xff3b30,
        emissive: 0xef4444,
        emissiveIntensity: 1.6,
      });
      const ring = new THREE.Mesh(ringGeo, magmaMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, -0.92, 0);
      auraGroup.add(ring);

      // 8 Sculpted Rising Flame Tongues
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const flameGeo = new THREE.ConeGeometry(0.16, 0.75 + (i % 2) * 0.25, 12);
        const flameMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xff4500 : 0xfbbf24,
          emissive: 0xef4444,
          emissiveIntensity: 1.8,
          transparent: true,
          opacity: 0.85,
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(Math.cos(angle) * 1.25, -0.55 + (i % 2) * 0.1, Math.sin(angle) * 1.25);
        flame.rotation.set((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2);
        auraGroup.add(flame);
      }

      auraAnchor.add(auraGroup);
    } else if (a.includes('sonic') || a.includes('tempest') || a.includes('wind')) {
      // 🎵 Sonic Tempest Wind Aura
      // 3 Expanding Concentric Cyan Acoustic Shockwave Rings
      [0.95, 1.25, 1.55].forEach((radius, idx) => {
        const waveGeo = new THREE.TorusGeometry(radius, 0.035, 16, 40);
        const waveMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x22d3ee,
          emissiveIntensity: 1.5 - idx * 0.3,
          transparent: true,
          opacity: 0.75 - idx * 0.15,
        });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        wave.rotation.x = Math.PI / 2;
        wave.position.set(0, -0.3 + idx * 0.35, 0);
        auraGroup.add(wave);
      });

      // 4 Floating Holographic Acoustic Notes / Crystals
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const noteGeo = new THREE.OctahedronGeometry(0.14);
        const noteMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0ea5e9,
          emissiveIntensity: 1.8,
        });
        const note = new THREE.Mesh(noteGeo, noteMat);
        note.position.set(Math.cos(angle) * 1.35, 0.3, Math.sin(angle) * 1.35);
        auraGroup.add(note);
      }

      auraAnchor.add(auraGroup);
    } else if (a.includes('nature') || a.includes('bloom') || a.includes('spore') || a.includes('emerald')) {
      // 🌿 Ancient Emerald Spore Aura
      // 5 Orbiting Botanical Runic Stones
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const runeGeo = new THREE.DodecahedronGeometry(0.14);
        const runeMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x34d399,
          emissiveIntensity: 1.6,
        });
        const rune = new THREE.Mesh(runeGeo, runeMat);
        rune.position.set(Math.cos(angle) * 1.3, 0.15 + (i % 2) * 0.2, Math.sin(angle) * 1.3);
        auraGroup.add(rune);
      }

      // Emerald Spore Ring
      const sporeGeo = new THREE.TorusGeometry(1.3, 0.035, 16, 40);
      const sporeMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x15803d,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.7,
      });
      const sporeRing = new THREE.Mesh(sporeGeo, sporeMat);
      sporeRing.rotation.x = Math.PI / 2;
      sporeRing.position.set(0, -0.6, 0);
      auraGroup.add(sporeRing);

      auraAnchor.add(auraGroup);
    } else if (a.includes('void') || a.includes('abyss') || a.includes('cosmic') || a.includes('nebula')) {
      // 🌌 Cosmic Void Nebula Aura
      const voidRingGeo = new THREE.TorusGeometry(1.3, 0.05, 16, 40);
      const voidMat = new THREE.MeshStandardMaterial({
        color: 0x581c87,
        emissive: 0xa855f7,
        emissiveIntensity: 1.6,
      });
      const voidRing = new THREE.Mesh(voidRingGeo, voidMat);
      voidRing.rotation.x = Math.PI / 2;
      voidRing.position.set(0, -0.2, 0);
      auraGroup.add(voidRing);

      // 4 Void Moons
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const moonGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({
          color: 0x1e1b4b,
          emissive: 0xc084fc,
          emissiveIntensity: 1.4,
        });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(Math.cos(angle) * 1.3, 0.1, Math.sin(angle) * 1.3);
        auraGroup.add(moon);
      }

      auraAnchor.add(auraGroup);
    } else if (a.includes('lightning') || a.includes('thunder') || a.includes('surge')) {
      // ⚡ Supercharged Thunder Aura
      const boltMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x00f0ff,
        emissiveIntensity: 2.0,
      });

      // 6 Arcing Lightning Segments around perimeter
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const boltGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(Math.cos(angle) * 1.25, 0.1 + (i % 2) * 0.25, Math.sin(angle) * 1.25);
        bolt.rotation.set((i % 2) * 0.6, angle, 0.4);
        auraGroup.add(bolt);
      }

      auraAnchor.add(auraGroup);
    }
  }
}

// Particle color based on pet elemental affinity
function getPetParticleColor(petType: LingoPetType): number {
  if (['floby', 'tome-tortoise', 'lore-drake', 'seed-rooter', 'terra-keeper'].includes(petType)) {
    return 0x22c55e; // Nature Green
  }
  if (['pip', 'echo-grif', 'acu-maestro', 'chirp-wing', 'sonic-storm'].includes(petType)) {
    return 0x38bdf8; // Wind Cyan
  }
  if (['igni', 'spark-fox', 'rune-stalker', 'ember-scribe', 'pyro-phoenix'].includes(petType)) {
    return 0xf97316; // Fire Orange
  }
  return 0xa855f7; // Mystic Purple
}
