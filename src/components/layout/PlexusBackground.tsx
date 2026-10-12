'use client';

import React, { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Metaverse3DCanvas } from './Metaverse3DCanvas';

// Lingolandverse Living Celestial Cosmic Backdrop
export default function PlexusBackground() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pathname === '/auth' || pathname === '/login') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    // Mouse coordinates & interaction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 170,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Dynamic sizing with device pixel ratio support
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle nodes for cyber constellation
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      glowColor: string;
      pulsePhase: number;
      pulseSpeed: number;
    }

    interface DataPulse {
      fromIndex: number;
      toIndex: number;
      progress: number;
      speed: number;
      color: string;
    }

    interface StarEmber {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      vy: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }

    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      color: string;
      active: boolean;
    }

    // 3D Polyhedron wireframe crystal (matching the glowing icosahedrons in the artwork)
    interface Polyhedron {
      x: number;
      y: number;
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

    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 30 : 60;
    const emberCount = isMobile ? 25 : 50;

    // Palette matching the uploaded artwork (neon cyan, electric violet, celestial gold, aurora emerald)
    const nodeColors = [
      { fill: 'rgba(56, 189, 248, 0.9)', glow: 'rgba(56, 189, 248, 0.7)' },   // Cyan
      { fill: 'rgba(192, 132, 252, 0.9)', glow: 'rgba(192, 132, 252, 0.7)' }, // Purple / Violet
      { fill: 'rgba(147, 197, 253, 0.9)', glow: 'rgba(147, 197, 253, 0.6)' }, // Ice Blue
      { fill: 'rgba(52, 211, 153, 0.9)', glow: 'rgba(52, 211, 153, 0.65)' },  // Aurora Mint
      { fill: 'rgba(253, 224, 71, 0.95)', glow: 'rgba(253, 224, 71, 0.7)' },   // Celestial Gold
    ];

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const c = nodeColors[Math.floor(Math.random() * nodeColors.length)];
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.2,
        color: c.fill,
        glowColor: c.glow,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // Star embers
    const embers: StarEmber[] = [];
    for (let i = 0; i < emberCount; i++) {
      embers.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        vy: -(Math.random() * 0.25 + 0.1),
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Data pulses traveling along connections
    const dataPulses: DataPulse[] = [];

    // Periodic shooting stars
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + 3000 + Math.random() * 4000;

    const spawnShootingStar = () => {
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25; // ~45 deg diagonal
      const startX = Math.random() * (window.innerWidth * 0.85);
      const startY = Math.random() * (window.innerHeight * 0.35);
      shootingStars.push({
        x: startX,
        y: startY,
        length: 140 + Math.random() * 90,
        speed: 11 + Math.random() * 8,
        angle,
        opacity: 0.95,
        color: Math.random() > 0.5 ? '#38bdf8' : '#c084fc',
        active: true,
      });
    };

    // Polyhedral crystals (Octahedron/Icosahedron wireframe)
    const createOctahedron = (x: number, y: number, size: number, color: string): Polyhedron => {
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
        x,
        y,
        size,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        speedX: 0.005 + Math.random() * 0.007,
        speedY: 0.006 + Math.random() * 0.007,
        speedZ: 0.004 + Math.random() * 0.005,
        vertices,
        edges,
        color,
      };
    };

    const polyhedrons: Polyhedron[] = [
      createOctahedron(window.innerWidth * 0.16, window.innerHeight * 0.26, 26, 'rgba(192, 132, 252, 0.85)'),
      createOctahedron(window.innerWidth * 0.78, window.innerHeight * 0.32, 32, 'rgba(56, 189, 248, 0.85)'),
      createOctahedron(window.innerWidth * 0.48, window.innerHeight * 0.68, 22, 'rgba(253, 224, 71, 0.85)'),
    ];

    const maxConnectionDist = isMobile ? 120 : 160;

    // Visibility management to save battery
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // 1. Render Floating Star Embers
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y += e.vy;
        e.twinklePhase += e.twinkleSpeed;
        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }

        const twinkle = 0.5 + Math.sin(e.twinklePhase) * 0.5;
        const alpha = e.alpha * twinkle;

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.shadowColor = 'rgba(167, 139, 250, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Update & Draw Constellation Nodes & Connections
      for (let i = 0; i < nodes.length; i++) {
        const p1 = nodes[i];
        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.pulsePhase += p1.pulseSpeed;

        // Bounce gently near borders
        if (p1.x < 10) { p1.x = 10; p1.vx *= -1; }
        if (p1.x > width - 10) { p1.x = width - 10; p1.vx *= -1; }
        if (p1.y < 10) { p1.y = 10; p1.vy *= -1; }
        if (p1.y > height - 10) { p1.y = height - 10; p1.vy *= -1; }

        // Interactive mouse attraction
        const dxMouse = p1.x - mouse.x;
        const dyMouse = p1.y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < mouse.radius && distMouse > 0) {
          const force = (1 - distMouse / mouse.radius) * 1.6;
          p1.x += (dxMouse / distMouse) * force;
          p1.y += (dyMouse / distMouse) * force;

          // Soft laser filament to cursor
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${(0.65 * (1 - distMouse / mouse.radius)).toFixed(3)})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }

        // Draw connecting plexus lines
        for (let j = i + 1; j < nodes.length; j++) {
          const p2 = nodes[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDist) {
            const lineAlpha = (1 - dist / maxConnectionDist) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Spawn data pulses along connections
            if (dataPulses.length < 18 && Math.random() < 0.003) {
              dataPulses.push({
                fromIndex: i,
                toIndex: j,
                progress: 0,
                speed: 0.016 + Math.random() * 0.02,
                color: Math.random() > 0.5 ? '#38bdf8' : '#c084fc',
              });
            }
          }
        }

        // Draw Node
        const pulse = 1 + Math.sin(p1.pulsePhase) * 0.25;
        const currentRadius = p1.radius * pulse;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.shadowColor = p1.glowColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Render Traveling Data Pulses (Neural Beams)
      for (let i = dataPulses.length - 1; i >= 0; i--) {
        const pulse = dataPulses[i];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          dataPulses.splice(i, 1);
          continue;
        }

        const pStart = nodes[pulse.fromIndex];
        const pEnd = nodes[pulse.toIndex];
        if (!pStart || !pEnd) {
          dataPulses.splice(i, 1);
          continue;
        }

        const px = pStart.x + (pEnd.x - pStart.x) * pulse.progress;
        const py = pStart.y + (pEnd.y - pStart.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. Render 3D Rotating Polyhedrons (Crystalline Holograms)
      polyhedrons.forEach(poly => {
        poly.rotX += poly.speedX;
        poly.rotY += poly.speedY;
        poly.rotZ += poly.speedZ;

        // 3D rotation projection
        const cosX = Math.cos(poly.rotX), sinX = Math.sin(poly.rotX);
        const cosY = Math.cos(poly.rotY), sinY = Math.sin(poly.rotY);
        const cosZ = Math.cos(poly.rotZ), sinZ = Math.sin(poly.rotZ);

        const projected = poly.vertices.map(([vx, vy, vz]) => {
          let x1 = vx * cosY + vz * sinY;
          let y1 = vy;
          let z1 = -vx * sinY + vz * cosY;

          let x2 = x1;
          let y2 = y1 * cosX - z1 * sinX;
          let z2 = y1 * sinX + z1 * cosX;

          let x3 = x2 * cosZ - y2 * sinZ;
          let y3 = x2 * sinZ + y2 * cosZ;

          const scale = poly.size;
          return {
            x: poly.x + x3 * scale,
            y: poly.y + y3 * scale,
          };
        });

        // Draw edges
        ctx.beginPath();
        poly.edges.forEach(([i, j]) => {
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
        });
        ctx.strokeStyle = poly.color;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = poly.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw glowing vertices
        projected.forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      });

      // 5. Render Shooting Stars / Comets
      if (currentTime > nextShootingStarTime) {
        spawnShootingStar();
        nextShootingStarTime = currentTime + 7000 + Math.random() * 8000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        if (!star.active) continue;

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.012;

        if (star.opacity <= 0 || star.x > width + 200 || star.y > height + 200) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, star.color);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.4;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (pathname === '/auth' || pathname === '/login') {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 bg-[#030712]"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Layer 1: Artwork Background (3rd Uploaded Image) with Smooth Ambient Drifting Animation */}
      <img
        src="/lingolandverse-logged-in-bg.jpg"
        alt="Lingolandverse Celestial Backdrop"
        className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover object-center pointer-events-none select-none will-change-transform"
        style={{
          width: '100%',
          height: '100%',
          animation: 'lingoland-ambient-drift 35s ease-in-out infinite alternate',
          transformOrigin: 'center center',
          opacity: 1,
        }}
      />

      {/* Layer 2: Shimmering Aurora Borealis Lights (Emerald & Violet Glow matching the artwork) */}
      <div
        className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full blur-[120px] opacity-60 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.65) 0%, rgba(6, 182, 212, 0.4) 45%, transparent 70%)',
          animation: 'lingoland-aurora-glow 14s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute top-1/4 -left-24 w-[550px] h-[550px] rounded-full blur-[130px] opacity-55 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(99, 102, 241, 0.35) 50%, transparent 70%)',
          animation: 'lingoland-nebula-pulse 18s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute bottom-[-100px] right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-45 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, rgba(139, 92, 246, 0.3) 50%, transparent 70%)',
          animation: 'lingoland-aurora-glow 20s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Layer 3: Contrast & Anti-Glare Shield (dampens center globe glare so text & cards stay ultra-sharp) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(3, 7, 18, 0.65) 0%, rgba(3, 7, 18, 0.45) 45%, rgba(2, 4, 14, 0.75) 100%)',
        }}
      />
      {/* Central anti-glare shield directly dampening the white core of the hologram */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(2, 6, 23, 0.72) 0%, rgba(2, 6, 23, 0.4) 40%, transparent 75%)',
        }}
      />

      {/* Layer 4: Living Cyber Constellation & Neural Plexus Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Layer 5: Ultra-Realistic 3D Holographic Globe & Orbital Satellites */}
      <Metaverse3DCanvas intensity={0.9} />
    </div>
  );
}
