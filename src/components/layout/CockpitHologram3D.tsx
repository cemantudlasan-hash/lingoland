'use client';

import React, { useRef, useEffect } from 'react';

interface CockpitHologram3DProps {
  className?: string;
}

export function CockpitHologram3D({ className = "" }: CockpitHologram3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouse.targetX = Math.max(-1, Math.min(1, x));
      mouse.targetY = Math.max(-1, Math.min(1, y));
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width || canvas.offsetWidth || 800;
      height = rect.height || canvas.offsetHeight || 500;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // 3D Point Interface
    interface Point3D {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      label?: string;
      glow?: string;
    }

    // Generate 3D Holographic Constellation Nodes
    const globeRadius = Math.min(width, height) * 0.28;
    const numNodes = 48;
    const nodes: Point3D[] = [];

    // Prominent named nodes
    const prominentNodes: { label: string; color: string; lat: number; lon: number }[] = [
      { label: "Focus Node", color: "#38bdf8", lat: 0.2, lon: 0.5 },
      { label: "Constellation", color: "#a855f7", lat: -0.3, lon: 1.8 },
      { label: "Meditation", color: "#2dd4bf", lat: 0.5, lon: 3.2 },
      { label: "Lexicon Hub", color: "#fbbf24", lat: -0.4, lon: 4.5 },
    ];

    prominentNodes.forEach((p) => {
      const cosLat = Math.cos(p.lat);
      nodes.push({
        x: globeRadius * cosLat * Math.cos(p.lon),
        y: globeRadius * Math.sin(p.lat),
        z: globeRadius * cosLat * Math.sin(p.lon),
        size: 4,
        color: p.color,
        label: p.label,
        glow: p.color,
      });
    });

    // Random constellation points on globe surface
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numNodes; i++) {
      const y = 1 - (i / (numNodes - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      nodes.push({
        x: Math.cos(theta) * radiusAtY * globeRadius,
        y: y * globeRadius,
        z: Math.sin(theta) * radiusAtY * globeRadius,
        size: 1.5 + Math.random() * 1.5,
        color: i % 4 === 0 ? '#38bdf8' : i % 3 === 0 ? '#a855f7' : '#2dd4bf',
      });
    }

    // 3D Starfield particles floating in depth
    const stars: Point3D[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 1.6,
        y: (Math.random() - 0.5) * height * 1.6,
        z: (Math.random() - 0.5) * 600,
        size: 0.8 + Math.random() * 1.6,
        color: Math.random() > 0.4 ? '#38bdf8' : '#e0e7ff',
      });
    }

    // 3D Orbital Rings
    interface Ring3D {
      radius: number;
      tiltX: number;
      tiltY: number;
      tiltZ: number;
      speed: number;
      color: string;
      satellites: { angle: number; speed: number; size: number; color: string }[];
    }

    const rings: Ring3D[] = [
      {
        radius: globeRadius * 1.35,
        tiltX: 0.5,
        tiltY: 0.3,
        tiltZ: 0.1,
        speed: 0.008,
        color: 'rgba(56, 189, 248, 0.45)',
        satellites: [
          { angle: 0, speed: 0.015, size: 3.5, color: '#38bdf8' },
          { angle: Math.PI, speed: 0.015, size: 2.8, color: '#2dd4bf' },
        ],
      },
      {
        radius: globeRadius * 1.6,
        tiltX: -0.4,
        tiltY: 0.6,
        tiltZ: -0.2,
        speed: -0.006,
        color: 'rgba(168, 85, 247, 0.35)',
        satellites: [
          { angle: 0.8, speed: -0.012, size: 3.2, color: '#fbbf24' },
          { angle: 0.8 + Math.PI, speed: -0.012, size: 2.5, color: '#ec4899' },
        ],
      },
    ];

    let globeAngle = 0;
    const fov = 450;

    // Project 3D point to 2D screen coordinates
    const project = (x: number, y: number, z: number, cx: number, cy: number) => {
      const scale = fov / (fov + z);
      return {
        x: cx + x * scale,
        y: cy + y * scale,
        scale,
      };
    };

    // Main 3D Animation Loop
    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse parallax interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      globeAngle += 0.006;

      // Center of globe positioned slightly in right-center to align with cockpit artwork hologram
      const centerX = width * 0.58;
      const centerY = height * 0.46;

      const rotY = globeAngle + mouse.x * 0.35;
      const rotX = mouse.y * 0.25;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 1. Render Floating 3D Starfield
      stars.forEach((star) => {
        star.z -= 0.4;
        if (star.z < -250) star.z = 350;

        const p = project(star.x + mouse.x * 30, star.y + mouse.y * 20, star.z, centerX, centerY);
        if (p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height) {
          const alpha = Math.max(0.1, Math.min(0.8, (p.scale * 0.6)));
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, star.size * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Render Holographic Horizon & Core Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        globeRadius * 0.2,
        centerX,
        centerY,
        globeRadius * 1.5
      );
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      glowGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = 0.85;
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Transform Globe Nodes
      const transformedNodes = nodes.map((n) => {
        // Rotate Y
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;
        // Rotate X
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;

        return {
          ...n,
          proj: project(x1, y2, z2, centerX, centerY),
          origZ: z2,
        };
      });

      // Sort by Z for realistic depth
      transformedNodes.sort((a, b) => b.origZ - a.origZ);

      // 4. Draw 3D Constellation Connecting Lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < transformedNodes.length; i++) {
        const n1 = transformedNodes[i];
        if (n1.origZ < -globeRadius * 0.6) continue; // Occlude far back

        for (let j = i + 1; j < transformedNodes.length; j++) {
          const n2 = transformedNodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < globeRadius * 0.58) {
            const alpha = Math.max(0.05, Math.min(0.45, (1 - dist3D / (globeRadius * 0.58)) * (n1.proj.scale * 0.8)));
            ctx.strokeStyle = n1.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(n1.proj.x, n1.proj.y);
            ctx.lineTo(n2.proj.x, n2.proj.y);
            ctx.stroke();
          }
        }
      }

      // 5. Draw 3D Nodes & Holographic Labels
      transformedNodes.forEach((node) => {
        const { x, y, scale } = node.proj;
        const alpha = Math.max(0.15, Math.min(1, (node.origZ + globeRadius) / (globeRadius * 1.8)));
        ctx.globalAlpha = alpha;

        // Glowing outer halo
        if (node.glow) {
          ctx.shadowColor = node.glow;
          ctx.shadowBlur = 14;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(x, y, node.size * scale, 0, Math.PI * 2);
        ctx.fill();

        // Label for prominent constellation nodes
        if (node.label && alpha > 0.45) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#000000';
          ctx.font = `bold ${Math.max(9, Math.round(11 * scale))}px monospace`;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(node.label, x + 8, y + 3);

          // Connection indicator dot
          ctx.fillStyle = node.color;
          ctx.fillRect(x + 5, y - 1, 2, 2);
        }
      });
      ctx.shadowBlur = 0;

      // 6. Draw 3D Orbital Rings with Moving Satellites
      rings.forEach((ring) => {
        ring.satellites.forEach((sat) => {
          sat.angle += sat.speed;
        });

        // Sample points along the tilted ellipse ring
        const ringSegments = 64;
        ctx.beginPath();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.55;

        for (let i = 0; i <= ringSegments; i++) {
          const theta = (i / ringSegments) * Math.PI * 2;
          const rx = Math.cos(theta) * ring.radius;
          const rz = Math.sin(theta) * ring.radius;

          // Apply ring tilt + mouse rotation
          const x1 = rx * Math.cos(ring.tiltY + rotY) + rz * Math.sin(ring.tiltY + rotY);
          const z1 = -rx * Math.sin(ring.tiltY + rotY) + rz * Math.cos(ring.tiltY + rotY);
          const y2 = z1 * Math.sin(ring.tiltX + rotX);
          const z2 = z1 * Math.cos(ring.tiltX + rotX);

          const p = project(x1, y2, z2, centerX, centerY);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        // Render ring satellites
        ring.satellites.forEach((sat) => {
          const rx = Math.cos(sat.angle) * ring.radius;
          const rz = Math.sin(sat.angle) * ring.radius;

          const x1 = rx * Math.cos(ring.tiltY + rotY) + rz * Math.sin(ring.tiltY + rotY);
          const z1 = -rx * Math.sin(ring.tiltY + rotY) + rz * Math.cos(ring.tiltY + rotY);
          const y2 = z1 * Math.sin(ring.tiltX + rotX);
          const z2 = z1 * Math.cos(ring.tiltX + rotX);

          const p = project(x1, y2, z2, centerX, centerY);
          ctx.globalAlpha = 0.9;
          ctx.shadowColor = sat.color;
          ctx.shadowBlur = 12;
          ctx.fillStyle = sat.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, sat.size * p.scale, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
