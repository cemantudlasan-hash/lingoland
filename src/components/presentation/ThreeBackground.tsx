'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  themeStyle?: string;
  activeSlideIndex: number;
  threeDStyle?: string;
  enabled: boolean;
}

export function ThreeBackground({
  themeStyle = '',
  activeSlideIndex,
  threeDStyle = '',
  enabled
}: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);

  // References to meshes for animation
  const mainMeshRef = useRef<THREE.Mesh | null>(null);
  const secondaryMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  // Mouse coords for 3D parallax
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || !mountRef.current) {
      return;
    }

    const currentMount = mountRef.current;
    const width = currentMount.clientWidth || window.innerWidth;
    const height = currentMount.clientHeight || 480;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8;

    // 3. Renderer setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) {
      console.warn("WebGL is not supported or enabled in this browser. ThreeBackground disabled.", e);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 20);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 5. Build dynamic 3D Geometry based on slide recommendations
    const parse3DStyle = (styleStr: string) => {
      const lower = styleStr.toLowerCase();
      let geometry: THREE.BufferGeometry;
      let color = 0xa855f7; // default purple
      let isWireframe = false;

      // Geometries
      if (lower.includes('cube') || lower.includes('box')) {
        geometry = new THREE.BoxGeometry(2, 2, 2);
      } else if (lower.includes('sphere')) {
        geometry = new THREE.SphereGeometry(1.3, 32, 32);
      } else if (lower.includes('torus') || lower.includes('ring')) {
        geometry = new THREE.TorusGeometry(1.1, 0.4, 16, 100);
      } else if (lower.includes('cone')) {
        geometry = new THREE.ConeGeometry(1.3, 2.5, 32);
      } else {
        // default nice shape
        geometry = new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16);
      }

      // Colors
      if (lower.includes('gold') || lower.includes('yellow')) {
        color = 0xd4af37;
      } else if (lower.includes('cyan') || lower.includes('teal')) {
        color = 0x06b6d4;
      } else if (lower.includes('blue')) {
        color = 0x3b82f6;
      } else if (lower.includes('green')) {
        color = 0x10b981;
      } else if (lower.includes('pink') || lower.includes('magenta')) {
        color = 0xec4899;
      } else if (lower.includes('orange')) {
        color = 0xf97316;
      } else if (lower.includes('red')) {
        color = 0xef4444;
      } else if (lower.includes('violet') || lower.includes('purple')) {
        color = 0x8b5cf6;
      }

      if (lower.includes('wireframe') || lower.includes('grid')) {
        isWireframe = true;
      }

      return { geometry, color, isWireframe };
    };

    const parsed = parse3DStyle(threeDStyle);

    // Main 3D Object
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: parsed.color,
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.6, // Glassmorphic look
      thickness: 1.2,
      transparent: true,
      opacity: 0.8,
      wireframe: parsed.isWireframe,
    });
    const mainMesh = new THREE.Mesh(parsed.geometry, mainMaterial);
    mainMesh.position.set(2, 0.5, 0);
    scene.add(mainMesh);
    mainMeshRef.current = mainMesh;

    // Secondary Helper Object
    const secGeometry = new THREE.OctahedronGeometry(0.7);
    const secMaterial = new THREE.MeshStandardMaterial({
      color: parsed.color ^ 0xffffff, // inverse color
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const secondaryMesh = new THREE.Mesh(secGeometry, secMaterial);
    secondaryMesh.position.set(-2.5, -1, -1);
    scene.add(secondaryMesh);
    secondaryMeshRef.current = secondaryMesh;

    // Particle field
    const particlesCount = 80;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 15;     // X
      positions[i + 1] = (Math.random() - 0.5) * 10; // Y
      positions[i + 2] = (Math.random() - 0.5) * 10; // Z
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      color: parsed.color,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // 6. Handle resizing
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse movement listener
    const handleMouseMove = (event: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetMouseRef.current = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation loop
    const animate = () => {
      // Smooth mouse easing
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      // Gentle camera parallax tilt
      camera.position.x = mouseRef.current.x * 1.5;
      camera.position.y = mouseRef.current.y * 1.5;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      const time = Date.now() * 0.0005;

      // Animate main mesh
      if (mainMeshRef.current) {
        mainMeshRef.current.rotation.x = time * 0.3;
        mainMeshRef.current.rotation.y = time * 0.4;
        // Floating wave animation
        mainMeshRef.current.position.y = Math.sin(time) * 0.4 + 0.5;
      }

      // Animate secondary mesh
      if (secondaryMeshRef.current) {
        secondaryMeshRef.current.rotation.x = -time * 0.2;
        secondaryMeshRef.current.rotation.y = time * 0.3;
        secondaryMeshRef.current.position.y = Math.cos(time * 0.8) * 0.3 - 1.0;
      }

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.05;
      }

      // Pulse light brightness
      if (pointLightRef.current) {
        pointLightRef.current.intensity = Math.sin(time * 2) * 0.5 + 2.0;
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      // dispose geometries and materials
      parsed.geometry.dispose();
      mainMaterial.dispose();
      secGeometry.dispose();
      secMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [enabled, threeDStyle, themeStyle]);

  // When active slide index changes, trigger a quick visual pulse/jerk in Three.js objects
  useEffect(() => {
    if (!enabled) return;

    if (mainMeshRef.current) {
      // Spin the mesh rapidly for a moment
      mainMeshRef.current.rotation.x += Math.PI / 2;
      mainMeshRef.current.rotation.y += Math.PI / 2;
    }

    if (pointLightRef.current) {
      // Flash point light
      pointLightRef.current.intensity = 5;
    }
  }, [activeSlideIndex, enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-40 transition-opacity duration-1000"
    />
  );
}
