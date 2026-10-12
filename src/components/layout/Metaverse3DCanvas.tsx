'use client';

import React, { useRef, useEffect } from 'react';

interface Metaverse3DCanvasProps {
  className?: string;
  intensity?: number;
}

export function Metaverse3DCanvas({ className = "", intensity = 1.0 }: Metaverse3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;

    // Mouse coordinates for 3D parallax tilt
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
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

    // 3D Sphere Points for Holographic Globe
    interface Point3D {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      color: string;
      size: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    const spherePoints: Point3D[] = [];
    const sphereRadius = 145; // Matches the hologram globe in artwork
    const numPoints = 180;

    // Golden spiral distribution on sphere surface
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      spherePoints.push({
        x: x * sphereRadius,
        y: y * sphereRadius,
        z: z * sphereRadius,
        baseX: x * sphereRadius,
        baseY: y * sphereRadius,
        baseZ: z * sphereRadius,
        color: i % 5 === 0 ? '#fbbf24' : i % 3 === 0 ? '#38bdf8' : '#2dd4bf',
        size: 1.2 + Math.random() * 1.5,
        pulseSpeed: 1 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // 3D Orbital Rings around the Globe
    interface OrbitalRing {
      tiltX: number;
      tiltY: number;
      tiltZ: number;
      radius: number;
      color: string;
      speed: number;
      angle: number;
      satellites: { angleOffset: number; size: number; color: string }[];
    }

    const rings: OrbitalRing[] = [
      {
        tiltX: 0.55,
        tiltY: 0.35,
        tiltZ: 0.1,
        radius: sphereRadius * 1.35,
        color: 'rgba(56, 189, 248, 0.45)',
        speed: 0.008,
        angle: 0,
        satellites: [
          { angleOffset: 0, size: 3.5, color: '#38bdf8' },
          { angleOffset: Math.PI, size: 2.8, color: '#2dd4bf' },
        ]
      },
      {
        tiltX: -0.45,
        tiltY: 0.65,
        tiltZ: -0.2,
        radius: sphereRadius * 1.5,
        color: 'rgba(245, 158, 11, 0.35)',
        speed: -0.006,
        angle: 0.8,
        satellites: [
          { angleOffset: 0.5, size: 3, color: '#fbbf24' },
          { angleOffset: 0.5 + Math.PI, size: 2.5, color: '#a855f7' },
        ]
      },
      {
        tiltX: 0.2,
        tiltY: -0.5,
        tiltZ: 0.6,
        radius: sphereRadius * 1.2,
        color: 'rgba(168, 85, 247, 0.4)',
        speed: 0.012,
        angle: 1.5,
        satellites: [
          { angleOffset: 1.2, size: 3.2, color: '#ec4899' },
        ]
      }
    ];

    // Landmark Neural Hubs on Globe Surface
    const landmarks = [
      { name: "Paris", rx: 0.38, ry: 0.68, color: "#38bdf8" },
      { name: "Pagoda", rx: 0.72, ry: 0.64, color: "#2dd4bf" },
      { name: "TajMahal", rx: 0.82, ry: 0.70, color: "#fbbf24" },
      { name: "Dubai", rx: 0.49, ry: 0.56, color: "#38bdf8" },
      { name: "NewYork", rx: 0.22, ry: 0.68, color: "#a855f7" },
      { name: "Bangkok", rx: 0.68, ry: 0.76, color: "#34d399" },
    ];

    // Neural Traveling Pulses
    interface NeuralPulse {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      progress: number;
      speed: number;
      color: string;
      trail: { x: number; y: number }[];
    }

    const pulses: NeuralPulse[] = [];

    const spawnPulse = () => {
      if (landmarks.length < 2) return;
      const i1 = Math.floor(Math.random() * landmarks.length);
      let i2 = Math.floor(Math.random() * landmarks.length);
      while (i2 === i1) i2 = Math.floor(Math.random() * landmarks.length);

      const l1 = landmarks[i1];
      const l2 = landmarks[i2];

      pulses.push({
        x: l1.rx * width,
        y: l1.ry * height,
        targetX: l2.rx * width,
        targetY: l2.ry * height,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        color: Math.random() > 0.5 ? '#22d3ee' : '#fbbf24',
        trail: [],
      });
    };

    // Shooting Stars
    interface ShootingStar {
      x: number;
      y: number;
      vx: number;
      vy: number;
      len: number;
      alpha: number;
      color: string;
    }
    const stars: ShootingStar[] = [];
    let nextStarTime = Date.now() + 2000;

    let rotY = 0;
    let rotX = 0.2;

    const focalLength = 380;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse parallax lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // 3D globe center coordinates: centered around middle of viewport
      const globeCenterX = width * 0.5 + mouse.x * 18;
      const globeCenterY = height * 0.53 + mouse.y * 14;

      // Rotation updates
      rotY += 0.007;
      const currentRotX = rotX + mouse.y * 0.15;
      const currentRotY = rotY + mouse.x * 0.2;

      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);
      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);

      // 1. Draw Hologram Back Bloom (Ambient 3D Glow behind globe)
      const glowGrad = ctx.createRadialGradient(
        globeCenterX,
        globeCenterY,
        15,
        globeCenterX,
        globeCenterY,
        sphereRadius * 1.55
      );
      glowGrad.addColorStop(0, 'rgba(34, 211, 238, 0.28)');
      glowGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      glowGrad.addColorStop(0.85, 'rgba(168, 85, 247, 0.06)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, sphereRadius * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // 2. Project and sort 3D sphere points
      interface ProjectedPoint {
        px: number;
        py: number;
        pz: number;
        color: string;
        size: number;
        alpha: number;
      }

      const projected: ProjectedPoint[] = [];

      for (let i = 0; i < spherePoints.length; i++) {
        const pt = spherePoints[i];

        // 3D Rotation Y
        const x1 = pt.baseX * cosY - pt.baseZ * sinY;
        const z1 = pt.baseZ * cosY + pt.baseX * sinY;

        // 3D Rotation X
        const y2 = pt.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + pt.baseY * sinX;

        // Perspective projection
        const scale = focalLength / (focalLength + z2);
        const px = globeCenterX + x1 * scale;
        const py = globeCenterY + y2 * scale;

        // Depth-based opacity: front is crisp & bright, back is soft & translucent
        const normZ = (z2 + sphereRadius) / (2 * sphereRadius);
        const alpha = Math.max(0.12, Math.min(1, 0.2 + normZ * 0.8));

        projected.push({
          px,
          py,
          pz: z2,
          color: pt.color,
          size: pt.size * scale,
          alpha,
        });
      }

      // Sort by Z for proper 3D rendering
      projected.sort((a, b) => a.pz - b.pz);

      // Draw Sphere Wireframe Longitude and Latitude Rings
      const numLatRings = 7;
      for (let i = 1; i < numLatRings; i++) {
        const ringLat = (i / numLatRings) * Math.PI - Math.PI / 2;
        const ringY = Math.sin(ringLat) * sphereRadius;
        const ringRad = Math.cos(ringLat) * sphereRadius;

        ctx.beginPath();
        let first = true;
        for (let a = 0; a <= Math.PI * 2; a += 0.25) {
          const rx = Math.cos(a) * ringRad;
          const rz = Math.sin(a) * ringRad;

          const rx1 = rx * cosY - rz * sinY;
          const rz1 = rz * cosY + rx * sinY;

          const ry2 = ringY * cosX - rz1 * sinX;
          const rz2 = rz1 * cosX + ringY * sinX;

          const scale = focalLength / (focalLength + rz2);
          const px = globeCenterX + rx1 * scale;
          const py = globeCenterY + ry2 * scale;

          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      // Draw sorted 3D points
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.8, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * intensity;
        if (p.pz > 0) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // 3. Draw 3D Orbital Rings with Traveling Satellites
      for (let r = 0; r < rings.length; r++) {
        const ring = rings[r];
        ring.angle += ring.speed;

        ctx.beginPath();
        let first = true;
        const step = 0.15;
        for (let a = 0; a <= Math.PI * 2 + step; a += step) {
          const rawX = Math.cos(a) * ring.radius;
          const rawY = 0;
          const rawZ = Math.sin(a) * ring.radius;

          const y1 = rawY * Math.cos(ring.tiltX) - rawZ * Math.sin(ring.tiltX);
          const z1 = rawZ * Math.cos(ring.tiltX) + rawY * Math.sin(ring.tiltX);

          const x2 = rawX * Math.cos(ring.tiltY) + z1 * Math.sin(ring.tiltY);
          const z2 = z1 * Math.cos(ring.tiltY) - rawX * Math.sin(ring.tiltY);

          const x3 = x2 * cosY - z2 * sinY;
          const z3 = z2 * cosY + x2 * sinY;
          const y4 = y1 * cosX - z3 * sinX;
          const z4 = z3 * cosX + y1 * sinX;

          const scale = focalLength / (focalLength + z4);
          const px = globeCenterX + x3 * scale;
          const py = globeCenterY + y4 * scale;

          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Draw Satellites on this ring
        for (let s = 0; s < ring.satellites.length; s++) {
          const sat = ring.satellites[s];
          const a = ring.angle + sat.angleOffset;
          const rawX = Math.cos(a) * ring.radius;
          const rawY = 0;
          const rawZ = Math.sin(a) * ring.radius;

          const y1 = rawY * Math.cos(ring.tiltX) - rawZ * Math.sin(ring.tiltX);
          const z1 = rawZ * Math.cos(ring.tiltX) + rawY * Math.sin(ring.tiltX);
          const x2 = rawX * Math.cos(ring.tiltY) + z1 * Math.sin(ring.tiltY);
          const z2 = z1 * Math.cos(ring.tiltY) - rawX * Math.sin(ring.tiltY);

          const x3 = x2 * cosY - z2 * sinY;
          const z3 = z2 * cosY + x2 * sinY;
          const y4 = y1 * cosX - z3 * sinX;
          const z4 = z3 * cosX + y1 * sinX;

          const scale = focalLength / (focalLength + z4);
          const px = globeCenterX + x3 * scale;
          const py = globeCenterY + y4 * scale;

          const satAlpha = Math.max(0.2, (z4 + ring.radius) / (2 * ring.radius));
          ctx.beginPath();
          ctx.arc(px, py, sat.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = sat.color;
          ctx.shadowColor = sat.color;
          ctx.shadowBlur = 10;
          ctx.globalAlpha = satAlpha * intensity;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      }

      // 4. Update and Draw Neural Traveling Pulses
      if (Math.random() < 0.04) {
        spawnPulse();
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const currX = p.x + (p.targetX - p.x) * p.progress;
        const arcHeight = Math.sin(p.progress * Math.PI) * 45;
        const currY = p.y + (p.targetY - p.y) * p.progress - arcHeight;

        p.trail.push({ x: currX, y: currY });
        if (p.trail.length > 8) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = (1 - p.progress * 0.4) * intensity;
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Shooting Stars
      if (Date.now() > nextStarTime) {
        stars.push({
          x: Math.random() * (width * 0.8),
          y: Math.random() * (height * 0.3),
          vx: 12 + Math.random() * 6,
          vy: 6 + Math.random() * 4,
          len: 120 + Math.random() * 60,
          alpha: 1,
          color: Math.random() > 0.5 ? '#38bdf8' : '#2dd4bf',
        });
        nextStarTime = Date.now() + 5000 + Math.random() * 6000;
      }

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.015;

        if (s.alpha <= 0 || s.x > width + 100 || s.y > height + 100) {
          stars.splice(i, 1);
          continue;
        }

        const tailX = s.x - (s.vx / 14) * s.len;
        const tailY = s.y - (s.vy / 14) * s.len;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, s.color);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = s.alpha * intensity;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
