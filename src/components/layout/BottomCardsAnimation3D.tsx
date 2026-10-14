'use client';

import React, { useRef, useEffect } from 'react';

// ============================================================================
// 1. ALIEN MARKET ANIMATION (Floating Energy Orbs, Magic Dust, Lantern Glow)
// ============================================================================
export function AlienMarketAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 400;
      height = rect.height || 200;
      canvas.width = width * 1.5;
      canvas.height = height * 1.5;
      ctx.scale(1.5, 1.5);
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating orbs corresponding to the orbs held by the alien in the artwork
    // Left blue orb, right yellow orb, lower purple orb
    const orbs = [
      { rx: 0.28, ry: 0.38, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)', size: 9, phase: 0 },
      { rx: 0.52, ry: 0.34, color: '#facc15', glow: 'rgba(250, 204, 21, 0.85)', size: 10, phase: 1.5 },
      { rx: 0.58, ry: 0.48, color: '#c084fc', glow: 'rgba(192, 132, 252, 0.8)', size: 8, phase: 3.1 },
    ];

    // Magic dust particles
    const particles = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#38bdf8' : '#facc15',
      alpha: Math.random(),
    }));

    let t = 0;

    const render = () => {
      t += 0.03;
      ctx.clearRect(0, 0, width, height);

      // Draw floating glowing orbs with hover motion
      orbs.forEach((orb) => {
        const ox = orb.rx * width + Math.sin(t + orb.phase) * 3;
        const oy = orb.ry * height + Math.cos(t * 1.2 + orb.phase) * 4;
        const pulse = 1 + Math.sin(t * 2 + orb.phase) * 0.15;

        // Outer glow
        const grad = ctx.createRadialGradient(ox, oy, 1, ox, oy, orb.size * 3 * pulse);
        grad.addColorStop(0, orb.glow);
        grad.addColorStop(0.5, orb.glow.replace('0.8', '0.2').replace('0.85', '0.25'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.size * 3 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, orb.size * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Shimmer ring
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.size * 1.4 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw floating magic dust
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(t + p.x) * 0.02;

        if (p.y < 0) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.8, p.alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ============================================================================
// 2. ROCKET LAUNCH ANIMATION (Dynamic Moving Fire Thrust on Tail, Speed Dust)
// ============================================================================
export function RocketLaunchAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 400;
      height = rect.height || 200;
      canvas.width = width * 1.5;
      canvas.height = height * 1.5;
      ctx.scale(1.5, 1.5);
    };
    resize();
    window.addEventListener('resize', resize);

    // Rocket nozzle position in the artwork:
    // The rocket points up-right (~45 deg), nozzle is located around (width * 0.44, height * 0.68)
    // Exhaust thrust shoots down-left (-135 deg direction)
    const nozzleXRatio = 0.45;
    const nozzleYRatio = 0.66;
    const exhaustAngle = Math.PI * 0.76; // Direction down and to the left

    // Fire flame particle system
    interface FlameParticle {
      dist: number;
      lateral: number;
      speed: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }

    const flames: FlameParticle[] = [];
    const maxFlames = 45;

    // Streaking space speed debris particles
    interface SpeedDebris {
      x: number;
      y: number;
      length: number;
      speed: number;
      alpha: number;
    }

    const debrisList: SpeedDebris[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 12 + Math.random() * 24,
      speed: 4 + Math.random() * 6,
      alpha: 0.3 + Math.random() * 0.6,
    }));

    const flameColors = [
      '#ffffff',
      '#fef08a', // bright yellow
      '#f59e0b', // amber
      '#ef4444', // vibrant red-orange
      '#38bdf8', // blue plasma core
    ];

    const spawnFlame = (nozzleX: number, nozzleY: number) => {
      flames.push({
        dist: 0,
        lateral: (Math.random() - 0.5) * 6,
        speed: 3.5 + Math.random() * 4.5,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        size: 3 + Math.random() * 6,
        color: flameColors[Math.floor(Math.random() * flameColors.length)],
      });
    };

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const nozzleX = width * nozzleXRatio;
      const nozzleY = height * nozzleYRatio;

      // 1. Draw Streaking Space Speed Dust (racing down-left past rocket)
      ctx.lineWidth = 1.2;
      debrisList.forEach((d) => {
        d.x -= d.speed * Math.cos(Math.PI * 0.24);
        d.y += d.speed * Math.sin(Math.PI * 0.24);

        if (d.x < -40 || d.y > height + 40) {
          d.x = width + Math.random() * 40;
          d.y = -20 + Math.random() * (height * 0.7);
        }

        ctx.strokeStyle = `rgba(224, 231, 255, ${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(
          d.x - d.length * Math.cos(Math.PI * 0.24),
          d.y + d.length * Math.sin(Math.PI * 0.24)
        );
        ctx.stroke();
      });

      // 2. Spawn and Update Exhaust Flames
      if (flames.length < maxFlames) {
        spawnFlame(nozzleX, nozzleY);
        spawnFlame(nozzleX, nozzleY);
      }

      // 3. Engine Thruster Core Glow
      const coreGlow = ctx.createRadialGradient(nozzleX, nozzleY, 2, nozzleX, nozzleY, 28);
      coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreGlow.addColorStop(0.2, 'rgba(56, 189, 248, 0.8)');
      coreGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)');
      coreGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(nozzleX, nozzleY, 28, 0, Math.PI * 2);
      ctx.fill();

      // 4. Render Dynamic Rocket Flame Exhaust Stream
      for (let i = flames.length - 1; i >= 0; i--) {
        const f = flames[i];
        f.life++;
        f.dist += f.speed;
        f.lateral += (Math.random() - 0.5) * 1.5;

        const progress = f.life / f.maxLife;
        if (progress >= 1) {
          flames.splice(i, 1);
          continue;
        }

        // Calculate position along the exhaust plume angle
        const curX = nozzleX - f.dist * Math.cos(exhaustAngle) + f.lateral * Math.sin(exhaustAngle);
        const curY = nozzleY + f.dist * Math.sin(exhaustAngle) + f.lateral * Math.cos(exhaustAngle);

        const currentSize = f.size * (1 + progress * 1.8);
        const alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 12;

        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(curX, curY, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ============================================================================
// 3. CONSTELLATION ANIMATION (Twinkling Stars, Glowing Lines, Stardust)
// ============================================================================
export function ConstellationAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 400;
      height = rect.height || 200;
      canvas.width = width * 1.5;
      canvas.height = height * 1.5;
      ctx.scale(1.5, 1.5);
    };
    resize();
    window.addEventListener('resize', resize);

    // Primary constellation star nodes (aligned with CONSTELLATION letter stars in artwork)
    const starNodes = [
      { rx: 0.12, ry: 0.52, size: 3.5, pulseSpeed: 2.2, phase: 0 },
      { rx: 0.22, ry: 0.48, size: 4.0, pulseSpeed: 1.8, phase: 1.2 },
      { rx: 0.32, ry: 0.55, size: 3.2, pulseSpeed: 2.5, phase: 2.4 },
      { rx: 0.42, ry: 0.46, size: 4.5, pulseSpeed: 1.5, phase: 0.8 },
      { rx: 0.50, ry: 0.50, size: 5.0, pulseSpeed: 1.2, phase: 3.0 }, // center brightest star
      { rx: 0.58, ry: 0.45, size: 4.2, pulseSpeed: 2.0, phase: 1.7 },
      { rx: 0.68, ry: 0.53, size: 3.6, pulseSpeed: 1.6, phase: 2.8 },
      { rx: 0.78, ry: 0.47, size: 4.0, pulseSpeed: 2.4, phase: 0.5 },
      { rx: 0.88, ry: 0.51, size: 3.4, pulseSpeed: 1.9, phase: 1.9 },
    ];

    // Background twinkling stars
    const bgStars = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.8 + Math.random() * 1.8,
      speed: 1 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    const render = () => {
      t += 0.025;
      ctx.clearRect(0, 0, width, height);

      // 1. Render Background Twinkling Micro-Stars
      bgStars.forEach((star) => {
        const twinkle = 0.2 + (Math.sin(t * star.speed + star.phase) + 1) * 0.4;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Glowing Constellation Interconnecting Lines
      ctx.lineWidth = 1;
      for (let i = 0; i < starNodes.length - 1; i++) {
        const s1 = starNodes[i];
        const s2 = starNodes[i + 1];
        const x1 = s1.rx * width;
        const y1 = s1.ry * height;
        const x2 = s2.rx * width;
        const y2 = s2.ry * height;

        const lineAlpha = 0.25 + (Math.sin(t * 1.5 + i) + 1) * 0.25;
        ctx.strokeStyle = `rgba(165, 243, 252, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Moving pulse dot along the constellation line
        const pulseProgress = (t * 0.4 + i * 0.2) % 1;
        const px = x1 + (x2 - x1) * pulseProgress;
        const py = y1 + (y2 - y1) * pulseProgress;
        ctx.fillStyle = '#67e8f9';
        ctx.globalAlpha = lineAlpha * 1.2;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Constellation Stars with 4-Point Glint Flares
      starNodes.forEach((node) => {
        const x = node.rx * width;
        const y = node.ry * height;
        const pulse = 1 + (Math.sin(t * node.pulseSpeed + node.phase) + 1) * 0.35;
        const radius = node.size * pulse;

        // Outer glow
        const glow = ctx.createRadialGradient(x, y, 1, x, y, radius * 3.5);
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        glow.addColorStop(0.3, 'rgba(103, 232, 249, 0.7)');
        glow.addColorStop(0.7, 'rgba(168, 85, 247, 0.3)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glow;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(x, y, radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 4-Point Diamond Cross Star Glint
        const flareLen = radius * 4.2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1;

        // Horizontal flare
        ctx.beginPath();
        ctx.moveTo(x - flareLen, y);
        ctx.lineTo(x + flareLen, y);
        ctx.stroke();

        // Vertical flare
        ctx.beginPath();
        ctx.moveTo(x, y - flareLen);
        ctx.lineTo(x, y + flareLen);
        ctx.stroke();

        // White hot center core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
