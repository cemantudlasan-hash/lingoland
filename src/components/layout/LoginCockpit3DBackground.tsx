'use client';

import React, { useRef, useEffect, useState } from 'react';

export function LoginCockpit3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;

    // Mouse coordinates with smooth lerping
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      mouse.targetX = normX;
      mouse.targetY = normY;
      setMousePos({ x: normX, y: normY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const normX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        const normY = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
        mouse.targetX = normX;
        mouse.targetY = normY;
        setMousePos({ x: normX, y: normY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    // 1. Center 3D Constellation Sphere Nodes (Aligning with center globe in artwork)
    interface SphereNode {
      baseX: number;
      baseY: number;
      baseZ: number;
      size: number;
      color: string;
      glowColor: string;
      phase: number;
      speed: number;
    }

    const sphereRadius = Math.min(130, width * 0.11);
    const sphereNodes: SphereNode[] = [];
    const numSphereNodes = 85;

    // Golden spiral distribution on sphere surface
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numSphereNodes; i++) {
      const y = 1 - (i / (numSphereNodes - 1)) * 2;
      const rAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * rAtY;
      const z = Math.sin(theta) * rAtY;

      sphereNodes.push({
        baseX: x * sphereRadius,
        baseY: y * sphereRadius,
        baseZ: z * sphereRadius,
        size: Math.random() * 1.8 + 1.2,
        color: i % 4 === 0 ? '#38bdf8' : i % 3 === 0 ? '#22d3ee' : '#a855f7',
        glowColor: i % 2 === 0 ? 'rgba(56, 189, 248, 0.8)' : 'rgba(168, 85, 247, 0.8)',
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
      });
    }

    // 2. Swirling Galactic Accretion Disk Particles (Center panel)
    interface GalaxyParticle {
      radius: number;
      angle: number;
      speed: number;
      verticalOffset: number;
      color: string;
      size: number;
      alpha: number;
    }

    const galaxyParticles: GalaxyParticle[] = [];
    const numGalaxyParticles = 110;
    const galaxyPalette = ['#38bdf8', '#c084fc', '#f43f5e', '#fbbf24', '#ffffff', '#2dd4bf'];

    for (let i = 0; i < numGalaxyParticles; i++) {
      const r = Math.pow(Math.random(), 0.6) * (sphereRadius * 2.1) + 20;
      galaxyParticles.push({
        radius: r,
        angle: Math.random() * Math.PI * 2,
        speed: (0.008 + (1 - r / (sphereRadius * 2.2)) * 0.012),
        verticalOffset: (Math.random() - 0.5) * 16,
        color: galaxyPalette[Math.floor(Math.random() * galaxyPalette.length)],
        size: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    // 3. Right Window 3D Polyhedral Constellation Crystals ("CONSELATION" Floating Gems)
    interface Crystal3D {
      relX: number;
      relY: number;
      size: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      speedX: number;
      speedY: number;
      speedZ: number;
      vertices: [number, number, number][];
      edges: [number, number][];
      color: string;
    }

    const createOctahedron = (relX: number, relY: number, size: number, color: string): Crystal3D => {
      const vertices: [number, number, number][] = [
        [0, -1, 0],
        [1, 0, 0],
        [0, 0, 1],
        [-1, 0, 0],
        [0, 0, -1],
        [0, 1, 0],
      ];
      const edges: [number, number][] = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [5, 1], [5, 2], [5, 3], [5, 4],
        [1, 2], [2, 3], [3, 4], [4, 1],
      ];
      return {
        relX,
        relY,
        size,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        speedX: 0.006 + Math.random() * 0.005,
        speedY: 0.007 + Math.random() * 0.006,
        speedZ: 0.005 + Math.random() * 0.004,
        vertices,
        edges,
        color,
      };
    };

    const crystals: Crystal3D[] = [
      createOctahedron(0.88, 0.46, 36, 'rgba(56, 189, 248, 0.85)'), // Main right "CONSELATION" dodecahedron
      createOctahedron(0.81, 0.68, 22, 'rgba(168, 85, 247, 0.8)'),  // Lower floating crystal
      createOctahedron(0.94, 0.28, 24, 'rgba(34, 211, 238, 0.8)'),  // Upper right gem
      createOctahedron(0.83, 0.32, 18, 'rgba(253, 224, 71, 0.85)'), // Small rune stone
    ];

    // 4. Left Window Floating Monolith Cyber Sparks & Saturn Orbital Dust
    interface MonolithSpark {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vy: number;
      alpha: number;
      size: number;
      color: string;
    }

    const sparks: MonolithSpark[] = [];
    const numSparks = 35;
    for (let i = 0; i < numSparks; i++) {
      const rx = 0.05 + Math.random() * 0.15;
      const ry = 0.52 + Math.random() * 0.35;
      sparks.push({
        x: rx * width,
        y: ry * height,
        baseX: rx,
        baseY: ry,
        vy: -(0.3 + Math.random() * 0.5),
        alpha: Math.random() * 0.8 + 0.2,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? '#38bdf8' : '#2dd4bf',
      });
    }

    // 5. Deep Space Stars & Shooting Comets
    interface DeepStar {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      radius: number;
      alpha: number;
      twinkleSpeed: number;
      phase: number;
    }

    const deepStars: DeepStar[] = [];
    const numDeepStars = 70;
    for (let i = 0; i < numDeepStars; i++) {
      const rx = Math.random();
      const ry = Math.random();
      deepStars.push({
        x: rx * width,
        y: ry * height,
        baseX: rx,
        baseY: ry,
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Shooting comets
    interface Comet {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      color: string;
      active: boolean;
    }

    const comets: Comet[] = [];
    let nextCometTime = Date.now() + 2500;

    const spawnComet = () => {
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
      comets.push({
        x: Math.random() * (width * 0.75),
        y: Math.random() * (height * 0.3),
        length: 120 + Math.random() * 80,
        speed: 10 + Math.random() * 7,
        angle,
        opacity: 0.9,
        color: Math.random() > 0.5 ? '#38bdf8' : '#e0e7ff',
        active: true,
      });
    };

    // 3D Rotation variables
    let globeAngleY = 0;
    const fov = 400;

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse parallax lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Dynamic Centers matching 3-window layout
      const centerWindowX = width * 0.5 + mouse.x * 16;
      const centerWindowY = height * 0.40 + mouse.y * 12;

      globeAngleY += 0.007;
      const rotX = mouse.y * 0.15;
      const rotY = globeAngleY + mouse.x * 0.2;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      // A. Draw Deep Stars
      deepStars.forEach((star) => {
        star.phase += star.twinkleSpeed;
        const twinkle = 0.4 + Math.sin(star.phase) * 0.6;
        const px = star.baseX * width + mouse.x * 8;
        const py = star.baseY * height + mouse.y * 6;

        ctx.beginPath();
        ctx.arc(px, py, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${(star.alpha * twinkle).toFixed(3)})`;
        ctx.fill();
      });

      // B. Center: 3D Swirling Galaxy Accretion Disk (Tilted Ellipse)
      const galaxyTiltX = 0.85; // Perspective tilt
      galaxyParticles.forEach((gp) => {
        gp.angle += gp.speed;

        // 3D orbit around center nucleus
        const rawX = Math.cos(gp.angle) * gp.radius;
        const rawZ = Math.sin(gp.angle) * gp.radius;
        const rawY = gp.verticalOffset;

        // Apply perspective tilt
        const tiltedY = rawY * Math.cos(galaxyTiltX) - rawZ * Math.sin(galaxyTiltX);
        const tiltedZ = rawZ * Math.cos(galaxyTiltX) + rawY * Math.sin(galaxyTiltX);

        const scale = fov / (fov + tiltedZ + 180);
        const px = centerWindowX + rawX * scale;
        const py = centerWindowY + (sphereRadius * 0.55) + tiltedY * scale;

        const alpha = Math.max(0.15, Math.min(0.9, gp.alpha * scale));

        ctx.beginPath();
        ctx.arc(px, py, gp.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = gp.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = gp.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // C. Center: 3D Holographic Constellation Wireframe Sphere
      interface ProjectedSpherePt {
        x: number;
        y: number;
        z: number;
        size: number;
        color: string;
        glowColor: string;
        alpha: number;
      }

      const projectedSphere: ProjectedSpherePt[] = [];

      for (let i = 0; i < sphereNodes.length; i++) {
        const pt = sphereNodes[i];
        pt.phase += pt.speed;

        // Rotate Y
        const x1 = pt.baseX * cosY - pt.baseZ * sinY;
        const z1 = pt.baseZ * cosY + pt.baseX * sinY;

        // Rotate X
        const y2 = pt.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + pt.baseY * sinX;

        // Perspective
        const scale = fov / (fov + z2);
        const px = centerWindowX + x1 * scale;
        const py = centerWindowY + y2 * scale;

        const normZ = (z2 + sphereRadius) / (2 * sphereRadius);
        const alpha = Math.max(0.15, Math.min(1, 0.25 + normZ * 0.75));

        projectedSphere.push({
          x: px,
          y: py,
          z: z2,
          size: pt.size * scale,
          color: pt.color,
          glowColor: pt.glowColor,
          alpha,
        });
      }

      // Draw constellation connecting filaments
      for (let i = 0; i < projectedSphere.length; i++) {
        const p1 = projectedSphere[i];
        for (let j = i + 1; j < projectedSphere.length; j++) {
          const p2 = projectedSphere[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 45) {
            const lineAlpha = (1 - dist / 45) * 0.4 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw glowing node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.alpha;
        if (p1.z > 0) {
          ctx.shadowColor = p1.glowColor;
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // D. Right Window: 3D Rotating Polyhedral Crystals
      crystals.forEach((poly) => {
        poly.rotX += poly.speedX;
        poly.rotY += poly.speedY;
        poly.rotZ += poly.speedZ;

        const cCosX = Math.cos(poly.rotX), cSinX = Math.sin(poly.rotX);
        const cCosY = Math.cos(poly.rotY), cSinY = Math.sin(poly.rotY);
        const cCosZ = Math.cos(poly.rotZ), cSinZ = Math.sin(poly.rotZ);

        const crystalCenterX = poly.relX * width + mouse.x * 22;
        const crystalCenterY = poly.relY * height + mouse.y * 16;

        const projected = poly.vertices.map(([vx, vy, vz]) => {
          let x1 = vx * cCosY + vz * cSinY;
          let y1 = vy;
          let z1 = -vx * cSinY + vz * cCosY;

          let x2 = x1;
          let y2 = y1 * cCosX - z1 * cSinX;
          let z2 = y1 * cSinX + z1 * cCosX;

          let x3 = x2 * cCosZ - y2 * cSinZ;
          let y3 = x2 * cSinZ + y2 * cCosZ;

          const scale = poly.size;
          return {
            x: crystalCenterX + x3 * scale,
            y: crystalCenterY + y3 * scale,
            z: z2,
          };
        });

        // Draw edges
        ctx.beginPath();
        poly.edges.forEach(([i, j]) => {
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
        });
        ctx.strokeStyle = poly.color;
        ctx.lineWidth = 1.3;
        ctx.shadowColor = poly.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw crystal vertices (glowing constellation nodes)
        projected.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // E. Left Window: Monolith Cyber Sparks & Energy Glyphs
      sparks.forEach((spark) => {
        spark.y += spark.vy;
        if (spark.y < height * 0.45) {
          spark.y = height * 0.85;
          spark.x = (spark.baseX + (Math.random() - 0.5) * 0.05) * width;
        }

        const px = spark.x + mouse.x * 12;
        const py = spark.y + mouse.y * 8;

        ctx.beginPath();
        ctx.arc(px, py, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = spark.color;
        ctx.globalAlpha = spark.alpha;
        ctx.shadowColor = spark.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // F. Shooting Star Comets
      if (currentTime > nextCometTime) {
        spawnComet();
        nextCometTime = currentTime + 4500 + Math.random() * 5500;
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        if (!comet.active) continue;

        comet.x += Math.cos(comet.angle) * comet.speed;
        comet.y += Math.sin(comet.angle) * comet.speed;
        comet.opacity -= 0.012;

        if (comet.opacity <= 0 || comet.x > width + 200 || comet.y > height + 200) {
          comets.splice(i, 1);
          continue;
        }

        const tailX = comet.x - Math.cos(comet.angle) * comet.length;
        const tailY = comet.y - Math.sin(comet.angle) * comet.length;

        const grad = ctx.createLinearGradient(tailX, tailY, comet.x, comet.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, comet.color);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(comet.x, comet.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = comet.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 bg-[#030712]"
      style={{ perspective: '1400px' }}
    >
      {/* Layer 1: Ultra-Realistic 4K Panoramic Spaceship Cockpit Image with 3D Tilt Parallax */}
      <div
        className="absolute inset-[-20px] w-[calc(100%+40px)] h-[calc(100%+40px)] will-change-transform transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1400px) rotateX(${(-mousePos.y * 3.5).toFixed(2)}deg) rotateY(${(mousePos.x * 4.5).toFixed(2)}deg) scale(1.03)`,
          transformOrigin: 'center center',
        }}
      >
        <img
          src="/images/login-cosmic-panoramic.jpg"
          alt="LingoLandVerse 4K Spaceship Panoramic Observatory"
          className="w-full h-full object-cover object-center select-none"
          style={{
            filter: 'contrast(1.15) saturate(1.25) brightness(1.08)',
            animation: 'lingoland-ambient-drift 32s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Layer 2: Volumetric Interstellar Nebular Lighting (Teal & Magenta Blooms) */}
      <div
        className="absolute top-[20%] left-[36%] w-[480px] h-[380px] rounded-full blur-[110px] opacity-75 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.85) 0%, rgba(168, 85, 247, 0.55) 50%, transparent 75%)',
          animation: 'lingoland-aurora-glow 12s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute top-[30%] right-[8%] w-[420px] h-[420px] rounded-full blur-[120px] opacity-65 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(192, 132, 252, 0.75) 0%, rgba(56, 189, 248, 0.4) 60%, transparent 80%)',
          animation: 'lingoland-nebula-pulse 16s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute bottom-[20%] left-[6%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-60 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.75) 0%, rgba(56, 189, 248, 0.45) 55%, transparent 75%)',
          animation: 'lingoland-aurora-glow 18s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Layer 3: Ultra-Realistic 3D Cyber Constellation, Swirling Galaxy & Floating Crystals Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10"
      />

      {/* Layer 4: Subtle Soft Vignette to maintain ultra quality and readability */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(3, 7, 18, 0.05) 0%, rgba(3, 7, 18, 0.25) 60%, rgba(2, 6, 23, 0.55) 100%)',
        }}
      />
    </div>
  );
}
