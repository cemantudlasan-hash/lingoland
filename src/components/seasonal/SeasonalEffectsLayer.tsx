'use client';

import React, { useMemo, useState } from 'react';
import { useSeasonalTheme } from '@/context/seasonal-theme-context';
import { Sparkles, EyeOff, Eye } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
  symbol?: string;
}

export function SeasonalEffectsLayer() {
  const {
    activeTheme,
    isThemeActiveForUser,
    settings,
    isDismissed,
    toggleDismiss,
    adminPreviewThemeId,
    setAdminPreviewThemeId,
  } = useSeasonalTheme();

  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);

  // Generate lightweight deterministic particle items
  const particles: Particle[] = useMemo(() => {
    if (!isThemeActiveForUser || !settings.floatingParticles || isDismissed) {
      return [];
    }

    const type = activeTheme.particleType;
    if (type === 'none') return [];

    let count = 18; // Keep count modest for optimal performance and no lag
    let symbols: string[] = [];

    switch (type) {
      case 'snow':
        symbols = ['❄', '❅', '•', '·'];
        count = 24;
        break;
      case 'water_splashes':
        // Songkran water festival
        symbols = ['💧', '💦', '🫧', '🌊', '•'];
        count = 20;
        break;
      case 'halloween_bats':
        symbols = ['🦇', '🎃', '✨', '🕷️', '·'];
        count = 18;
        break;
      case 'confetti':
        symbols = ['✨', '🎉', '⭐', '🎊', '•'];
        count = 22;
        break;
      case 'hearts':
        symbols = ['💖', '💕', '✨', '🌸', '·'];
        count = 18;
        break;
      case 'lanterns':
        symbols = ['🏮', '✨', '🧧', '•'];
        count = 16;
        break;
      default:
        symbols = ['✨'];
    }

    const items: Particle[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        x: (i * 100) / count + (i % 5) * 2, // Distributed across 0-100% width
        y: (i * 23) % 100,
        size: 10 + (i % 12),
        speed: 8 + (i % 8) * 1.5, // 8-20s duration
        delay: -(i * 1.3),
        opacity: 0.35 + ((i % 5) * 0.12),
        symbol: symbols[i % symbols.length],
      });
    }
    return items;
  }, [isThemeActiveForUser, settings.floatingParticles, isDismissed, activeTheme]);

  if (!isThemeActiveForUser) {
    return null;
  }

  return (
    <>
      {/* 1. Subtle Ambient Top/Background Glow */}
      {settings.ambientGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 inset-x-0 h-64 blur-3xl opacity-35 z-[1] transition-all duration-1000 ease-in-out"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${activeTheme.glowColor}, transparent 70%)`,
          }}
        />
      )}

      {/* 2. Floating Festive Particles */}
      {settings.floatingParticles && !isDismissed && particles.length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden z-[2] select-none"
        >
          {particles.map((p) => {
            const isSongkranWater = activeTheme.particleType === 'water_splashes';

            return (
              <span
                key={p.id}
                className="absolute transform-gpu animate-seasonal-drift"
                style={{
                  left: `${p.x}%`,
                  top: '-5%',
                  fontSize: `${p.size}px`,
                  opacity: p.opacity,
                  animationDuration: `${p.speed}s`,
                  animationDelay: `${p.delay}s`,
                  filter: isSongkranWater
                    ? 'drop-shadow(0 0 4px rgba(56,189,248,0.5))'
                    : 'drop-shadow(0 0 3px rgba(255,255,255,0.3))',
                }}
              >
                {p.symbol}
              </span>
            );
          })}
        </div>
      )}

      {/* 3. Non-Intrusive Floating Theme Dismiss/Control Pill */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 print:hidden">
        {adminPreviewThemeId && (
          <button
            onClick={() => setAdminPreviewThemeId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/90 hover:bg-amber-400 text-slate-950 shadow-lg border border-amber-300 transition-all hover:scale-105 active:scale-95"
            title="Exit Admin Theme Preview"
          >
            <span>Exit Preview ({activeTheme.emoji})</span>
          </button>
        )}

        {isWidgetMinimized ? (
          <button
            onClick={() => setIsWidgetMinimized(false)}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 shadow-md backdrop-blur-md transition-all hover:scale-110 active:scale-95"
            title={`Festival Theme: ${activeTheme.name}`}
          >
            <span className="text-sm">{activeTheme.emoji}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/85 hover:bg-slate-900/95 text-slate-300 border border-white/10 shadow-lg backdrop-blur-md transition-all">
            <span className="text-xs">{activeTheme.emoji}</span>
            <span className="hidden sm:inline text-slate-200">{activeTheme.name}</span>
            <button
              onClick={toggleDismiss}
              className="ml-1 p-1 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title={isDismissed ? 'Turn on holiday effects' : 'Turn off holiday particles'}
            >
              {isDismissed ? (
                <span className="flex items-center gap-1 text-cyan-400">
                  <Eye className="w-3 h-3" />
                  <span className="text-[10px]">Show Effects</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400 hover:text-slate-200">
                  <EyeOff className="w-3 h-3" />
                  <span className="text-[10px]">Hide</span>
                </span>
              )}
            </button>
            <button
              onClick={() => setIsWidgetMinimized(true)}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
              title="Minimize"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </>
  );
}
