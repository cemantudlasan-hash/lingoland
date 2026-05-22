'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface LingoPetVisualProps {
  petType: 'owl' | 'dino' | 'kitty';
  level: number;
  energy: number;
  mood: number;
  equippedCosmetics: {
    hat?: string;
    glasses?: string;
  };
  currentBackground: string;
  isPetting?: boolean;
  isSleeping?: boolean;
  isTalking?: boolean;
}

export function LingoPetVisual({
  petType,
  level,
  energy,
  mood,
  equippedCosmetics,
  currentBackground,
  isPetting = false,
  isSleeping = false,
  isTalking = false,
}: LingoPetVisualProps) {
  // Determine pet animation state
  const isTired = energy < 30;
  const isSad = mood < 30;

  // Background environment renderer
  const renderBackground = () => {
    switch (currentBackground) {
      case 'london-study':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden transition-all duration-700">
            {/* Big Ben window silhouette */}
            <div className="absolute inset-y-0 left-6 w-32 border-r border-indigo-900/30 flex flex-col justify-between p-4 opacity-20">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-700/30 flex items-center justify-center">
                <div className="w-10 h-1 bg-indigo-700/30 transform rotate-45 Origin-left" />
              </div>
              <div className="w-24 h-48 border-t-4 border-x-4 border-indigo-700/30 rounded-t-full" />
            </div>
            {/* Soft raindrops */}
            <div className="absolute inset-0 opacity-30 pointer-events-none rain-animation" />
            {/* Warm tea cup steam overlay */}
            <div className="absolute bottom-4 right-10 flex flex-col items-center opacity-60">
              <div className="w-8 h-6 bg-amber-900/30 rounded-b-lg border-t-2 border-amber-600/30" />
              <div className="w-1 h-3 bg-slate-400/20 rounded-full animate-pulse" />
            </div>
          </div>
        );
      case 'tokyo-garden':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950 via-emerald-900 to-emerald-950 overflow-hidden transition-all duration-700">
            {/* Cherry Blossom silhouette & petals */}
            <div className="absolute top-2 right-4 w-40 h-40 border-b-4 border-l-4 border-teal-800/20 rounded-bl-full opacity-35" />
            <div className="absolute inset-0 petals-container pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2.5 h-1.5 bg-pink-400/40 rounded-full animate-ping"
                  style={{
                    top: `${15 + i * 14}%`,
                    left: `${20 + (i * 12) % 70}%`,
                    animationDuration: `${3 + i}s`,
                  }}
                />
              ))}
            </div>
            {/* Torii Gate frame silhouette */}
            <div className="absolute bottom-0 left-10 w-24 h-24 border-t-8 border-x-4 border-teal-800/10 opacity-30" />
          </div>
        );
      case 'nyc-cafe':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 overflow-hidden transition-all duration-700">
            {/* Cafe brick wall texture mock */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-100 via-transparent to-transparent bg-grid-stone-400" />
            {/* Hanging ambient string lights */}
            <div className="absolute top-0 inset-x-0 h-8 flex justify-around px-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
              ))}
            </div>
            {/* Coffee board silhouette */}
            <div className="absolute bottom-6 left-6 w-20 h-28 bg-stone-950/60 border border-stone-800 rounded-md p-2 text-[5px] text-stone-500/70 font-mono opacity-50">
              COFFEE MENU<br/>• Espresso<br/>• Latte<br/>• Matcha
            </div>
          </div>
        );
      case 'cozy-room':
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 overflow-hidden transition-all duration-700">
            {/* Bookshelf lines */}
            <div className="absolute top-4 left-4 w-48 h-20 border-b border-indigo-950/40 opacity-40 flex gap-2 items-end px-2">
              <div className="w-3 h-12 bg-indigo-900/20 rounded-sm" />
              <div className="w-4 h-14 bg-purple-900/25 rounded-sm transform -rotate-12 Origin-bottom" />
              <div className="w-3 h-10 bg-blue-900/20 rounded-sm" />
            </div>
            {/* Fireplace glow */}
            <div className="absolute bottom-0 right-10 w-28 h-20 bg-orange-600/10 rounded-t-full blur-xl animate-pulse" />
            <div className="absolute bottom-0 right-14 w-20 h-10 bg-amber-950/50 rounded-t-md border-t-2 border-orange-500/20 flex justify-center gap-1.5 items-end py-1">
              <div className="w-1.5 h-3 bg-orange-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-3.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        );
    }
  };

  // SVG Render of Mascot Owl
  const renderOwl = () => {
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Shadow */}
        <ellipse cx="100" cy="170" rx="45" ry="8" fill="rgba(0,0,0,0.3)" />

        {/* Body Base */}
        <g className={cn(
          "transition-all duration-500 origin-bottom",
          isPetting && "animate-bounce",
          isTalking && "scale-y-105",
          isSleeping && "translate-y-1",
          !isPetting && !isTalking && !isSleeping && "animate-breathing"
        )}>
          {/* Wings */}
          <path d="M 50 110 C 35 110, 30 135, 45 150 C 48 140, 52 120, 60 115" fill="#4f46e5" />
          <path d="M 150 110 C 165 110, 170 135, 155 150 C 152 140, 148 120, 140 115" fill="#4f46e5" />

          {/* Main Body */}
          <circle cx="100" cy="115" r="50" fill="#6366f1" />
          {/* Tummy */}
          <circle cx="100" cy="125" r="35" fill="#e0e7ff" />
          {/* Tummy chest feathers */}
          <path d="M 90 115 L 95 120 L 100 115 L 105 120 L 110 115" stroke="#c7d2fe" strokeWidth="2.5" fill="none" />
          <path d="M 85 128 L 92 135 L 100 128 L 108 135 L 115 128" stroke="#c7d2fe" strokeWidth="2.5" fill="none" />

          {/* Ears/Tufts */}
          <polygon points="55,75 50,55 75,70" fill="#4f46e5" />
          <polygon points="145,75 150,55 125,70" fill="#4f46e5" />

          {/* Feet */}
          <ellipse cx="80" cy="164" rx="10" ry="6" fill="#f59e0b" />
          <ellipse cx="120" cy="164" rx="10" ry="6" fill="#f59e0b" />

          {/* Eyes Group */}
          <g className={cn("transition-all duration-300", isSleeping && "opacity-80")}>
            {/* Eye Sockets */}
            <circle cx="78" cy="100" r="16" fill="white" />
            <circle cx="122" cy="100" r="16" fill="white" />

            {isSleeping ? (
              // Sleeping eyes (lines)
              <>
                <path d="M 68 100 Q 78 108 88 100" stroke="#1e1b4b" strokeWidth="3" fill="none" />
                <path d="M 112 100 Q 122 108 132 100" stroke="#1e1b4b" strokeWidth="3" fill="none" />
              </>
            ) : isSad ? (
              // Sad / tired eyes
              <>
                <circle cx="78" cy="102" r="8" fill="#1e1b4b" />
                <circle cx="122" cy="102" r="8" fill="#1e1b4b" />
                <path d="M 65 90 L 85 95" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 135 90 L 115 95" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" />
                {/* Under eye bags */}
                <path d="M 70 114 Q 78 119 86 114" stroke="#818cf8" strokeWidth="1.5" fill="none" />
                <path d="M 114 114 Q 122 119 130 114" stroke="#818cf8" strokeWidth="1.5" fill="none" />
              </>
            ) : (
              // Normal / Happy eyes
              <>
                <circle cx="78" cy="100" r="9" fill="#1e1b4b" className={cn(isTalking && "animate-pulse")} />
                <circle cx="122" cy="100" r="9" fill="#1e1b4b" className={cn(isTalking && "animate-pulse")} />
                {/* Pupils */}
                <circle cx="75" cy="97" r="3" fill="white" />
                <circle cx="119" cy="97" r="3" fill="white" />
              </>
            )}
          </g>

          {/* Beak */}
          <polygon points="94,107 106,107 100,121" fill="#fbbf24" />

          {/* LEVEL BADGE AT BOTTOM */}
          <g transform="translate(100, 155)">
            <rect x="-18" y="-8" width="36" height="16" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#c7d2fe" fontSize="10" fontWeight="bold">Lvl {level}</text>
          </g>

          {/* Outfits Overlay Anchors */}
          {/* Hat slot centered around cx=100, cy=65 */}
          {renderHat(100, 64)}
          
          {/* Glasses slot centered around cy=100, eye width cx=78 to 122 */}
          {renderGlasses(100, 100)}
        </g>
      </svg>
    );
  };

  // SVG Render of Mascot Dino
  const renderDino = () => {
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Shadow */}
        <ellipse cx="95" cy="170" rx="50" ry="8" fill="rgba(0,0,0,0.3)" />

        <g className={cn(
          "transition-all duration-500 origin-bottom",
          isPetting && "animate-bounce",
          isTalking && "scale-y-105",
          isSleeping && "translate-y-1",
          !isPetting && !isTalking && !isSleeping && "animate-breathing"
        )}>
          {/* Tail */}
          <path d="M 60 135 C 30 145, 20 120, 15 130 C 10 140, 30 160, 65 150" fill="#059669" />
          
          {/* Back plates */}
          <polygon points="50,90 40,82 55,80" fill="#10b981" />
          <polygon points="58,110 46,102 62,100" fill="#10b981" />
          <polygon points="62,125 50,118 68,115" fill="#10b981" />

          {/* Main Dino Body */}
          <path d="M 70 85 C 70 50, 130 50, 130 85 C 130 100, 120 120, 115 140 C 110 155, 120 160, 110 165 C 95 168, 75 165, 75 145 C 75 130, 70 105, 70 85" fill="#10b981" />
          
          {/* Dino Belly */}
          <path d="M 85 95 C 85 80, 115 80, 115 95 C 115 110, 110 130, 105 145 C 98 152, 90 148, 88 135 C 85 120, 85 110, 85 95" fill="#a7f3d0" />

          {/* Tiny Arms */}
          <path d="M 72 108 Q 62 105 60 111" stroke="#059669" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 124 108 Q 134 105 136 111" stroke="#059669" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Feet */}
          <path d="M 75 160 Q 75 168 85 168 Q 90 160 85 158" fill="#059669" />
          <path d="M 105 160 Q 105 168 115 168 Q 120 160 115 158" fill="#059669" />

          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M 85 75 Q 92 82 100 75" stroke="#064e3b" strokeWidth="3" fill="none" />
              <path d="M 110 75 Q 118 82 125 75" stroke="#064e3b" strokeWidth="3" fill="none" />
            </>
          ) : isSad ? (
            <>
              <ellipse cx="92" cy="74" rx="7" ry="9" fill="#064e3b" />
              <ellipse cx="118" cy="74" rx="7" ry="9" fill="#064e3b" />
              <path d="M 82 63 L 95 67" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
              <path d="M 128 63 L 115 67" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="92" cy="74" r="8" fill="#064e3b" />
              <circle cx="118" cy="74" r="8" fill="#064e3b" />
              <circle cx="90" cy="71" r="2.5" fill="white" />
              <circle cx="116" cy="71" r="2.5" fill="white" />
            </>
          )}

          {/* Cheeks */}
          <circle cx="82" cy="80" r="4" fill="#f87171" opacity="0.6" />
          <circle cx="126" cy="80" r="4" fill="#f87171" opacity="0.6" />

          {/* Cute Mouth */}
          {isSleeping ? (
            <path d="M 102 85 Q 106 87 110 85" stroke="#064e3b" strokeWidth="2" fill="none" />
          ) : isTalking ? (
            <ellipse cx="106" cy="88" rx="5" ry="4" fill="#7f1d1d" />
          ) : (
            <path d="M 102 85 Q 106 90 110 85" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}

          {/* LEVEL BADGE */}
          <g transform="translate(100, 155)">
            <rect x="-18" y="-8" width="36" height="16" rx="6" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="bold">Lvl {level}</text>
          </g>

          {/* Accessories Anchors */}
          {renderHat(100, 48)}
          {renderGlasses(105, 74)}
        </g>
      </svg>
    );
  };

  // SVG Render of Mascot Kitty
  const renderKitty = () => {
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Shadow */}
        <ellipse cx="100" cy="170" rx="45" ry="7" fill="rgba(0,0,0,0.3)" />

        <g className={cn(
          "transition-all duration-500 origin-bottom",
          isPetting && "animate-bounce",
          isTalking && "scale-y-105",
          isSleeping && "translate-y-1",
          !isPetting && !isTalking && !isSleeping && "animate-breathing"
        )}>
          {/* Tail */}
          <path d="M 140 140 C 165 140, 175 110, 170 100 C 165 90, 155 110, 143 130" fill="#ea580c" />

          {/* Main Body */}
          <ellipse cx="100" cy="130" rx="45" ry="35" fill="#f97316" />
          
          {/* Tummy/Chest patch */}
          <ellipse cx="100" cy="138" rx="28" ry="20" fill="#ffedd5" />

          {/* Head */}
          <circle cx="100" cy="92" r="38" fill="#f97316" />

          {/* Ears */}
          <polygon points="68,75 58,45 85,68" fill="#d97706" />
          <polygon points="68,75 62,52 80,68" fill="#fecaca" />
          
          <polygon points="132,75 142,45 115,68" fill="#d97706" />
          <polygon points="132,75 138,52 120,68" fill="#fecaca" />

          {/* Feet */}
          <ellipse cx="78" cy="162" rx="10" ry="7" fill="#ea580c" />
          <ellipse cx="122" cy="162" rx="10" ry="7" fill="#ea580c" />
          {/* Paws front */}
          <circle cx="88" cy="148" r="8" fill="#ffedd5" />
          <circle cx="112" cy="148" r="8" fill="#ffedd5" />

          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M 78 92 Q 86 98 94 92" stroke="#78350f" strokeWidth="2.5" fill="none" />
              <path d="M 106 92 Q 114 98 122 92" stroke="#78350f" strokeWidth="2.5" fill="none" />
            </>
          ) : isSad ? (
            <>
              <circle cx="85" cy="91" r="7" fill="#78350f" />
              <circle cx="115" cy="91" r="7" fill="#78350f" />
              <path d="M 77 82 Q 85 85 93 82" stroke="#78350f" strokeWidth="2" fill="none" />
              <path d="M 123 82 Q 115 85 107 82" stroke="#78350f" strokeWidth="2" fill="none" />
            </>
          ) : (
            <>
              <circle cx="85" cy="91" r="8" fill="#78350f" />
              <circle cx="115" cy="91" r="8" fill="#78350f" />
              <circle cx="83" cy="88" r="2.5" fill="white" />
              <circle cx="113" cy="88" r="2.5" fill="white" />
            </>
          )}

          {/* Nose & Mouth */}
          <polygon points="98,98 102,98 100,101" fill="#f43f5e" />
          <path d="M 97 103 Q 100 106 103 103" stroke="#78350f" strokeWidth="1.5" fill="none" />

          {/* Whiskers */}
          <line x1="58" y1="98" x2="42" y2="96" stroke="#78350f" strokeWidth="1.5" />
          <line x1="58" y1="104" x2="40" y2="105" stroke="#78350f" strokeWidth="1.5" />
          
          <line x1="142" y1="98" x2="158" y2="96" stroke="#78350f" strokeWidth="1.5" />
          <line x1="142" y1="104" x2="160" y2="105" stroke="#78350f" strokeWidth="1.5" />

          {/* LEVEL BADGE */}
          <g transform="translate(100, 155)">
            <rect x="-18" y="-8" width="36" height="16" rx="6" fill="#78350f" stroke="#ea580c" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffedd5" fontSize="10" fontWeight="bold">Lvl {level}</text>
          </g>

          {/* Accessories Anchors */}
          {renderHat(100, 58)}
          {renderGlasses(100, 91)}
        </g>
      </svg>
    );
  };

  // Cosmetic Renderer: Hat
  const renderHat = (cx: number, cy: number) => {
    const hat = equippedCosmetics.hat;
    if (!hat) return null;

    switch (hat) {
      case 'angel_halo':
        return (
          <g transform={`translate(${cx}, ${cy - 12})`} className="drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-halo">
            {/* Oval ring of the halo */}
            <ellipse cx="0" cy="0" rx="20" ry="6" fill="none" stroke="#fbbf24" strokeWidth="4.5" />
            <ellipse cx="0" cy="0" rx="20" ry="6" fill="none" stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />
            {/* Glow particles */}
            <circle cx="-15" cy="-2" r="1.2" fill="#fff" className="animate-ping" />
            <circle cx="15" cy="2" r="1.2" fill="#fff" className="animate-ping" />
          </g>
        );
      case 'dragon_horns':
        return (
          <g transform={`translate(${cx}, ${cy})`} className="drop-shadow-[0_0_10px_rgba(239,68,68,0.85)] animate-fire-glow">
            {/* Left horn */}
            <path d="M -18 4 Q -35 -15 -28 -32 Q -22 -20 -10 -2 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
            <path d="M -18 4 Q -30 -12 -25 -26 C -22 -16 -12 -2 -18 4" fill="#f87171" opacity="0.6" />
            
            {/* Right horn */}
            <path d="M 18 4 Q 35 -15 28 -32 Q 22 -20 10 -2 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
            <path d="M 18 4 Q 30 -12 25 -26 C 22 -16 12 -2 18 4" fill="#f87171" opacity="0.6" />
          </g>
        );
      case 'aurora_crown':
        return (
          <g transform={`translate(${cx}, ${cy - 2})`} className="drop-shadow-[0_0_12px_rgba(168,85,247,0.85)] animate-aurora">
            {/* Multi-point crown base and spikes */}
            <path d="M -22 2 L -25 -16 L -12 -5 L 0 -22 L 12 -5 L 25 -16 L 22 2 Z" fill="#a855f7" stroke="#3b82f6" strokeWidth="1.5" />
            <ellipse cx="0" cy="0" rx="14" ry="2.5" fill="#1e1b4b" opacity="0.5" />
            {/* Crown Jewels on tips */}
            <circle cx="0" cy="-22" r="3" fill="#ec4899" className="animate-pulse" />
            <circle cx="-25" cy="-16" r="2.5" fill="#3b82f6" className="animate-pulse" />
            <circle cx="25" cy="-16" r="2.5" fill="#10b981" className="animate-pulse" />
          </g>
        );
      case 'crown':
        return (
          <g transform={`translate(${cx}, ${cy})`} className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] animate-float">
            <path d="M -22 0 L -25 -20 L -10 -8 L 0 -25 L 10 -8 L 25 -20 L 22 0 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            {/* Crown Jewels */}
            <circle cx="0" cy="-25" r="2.5" fill="#ef4444" />
            <circle cx="-25" cy="-20" r="2" fill="#3b82f6" />
            <circle cx="25" cy="-20" r="2" fill="#3b82f6" />
            <ellipse cx="0" cy="-3" rx="15" ry="3" fill="#ef4444" />
          </g>
        );
      case 'wizard_hat':
        return (
          <g transform={`translate(${cx - 5}, ${cy})`} className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
            {/* Hat Cone */}
            <path d="M -20 0 L -12 -38 C -4 -50, 10 -45, 18 -32 L 20 0 Z" fill="#4338ca" stroke="#312e81" strokeWidth="1.5" />
            {/* Stars */}
            <polygon points="-2,-24 0,-30 2,-24 -3,-28 3,-28" fill="#fef08a" />
            <polygon points="5,-14 7,-20 9,-14 4,-18 10,-18" fill="#fef08a" />
            {/* Hat Brim */}
            <ellipse cx="0" cy="1" rx="28" ry="4" fill="#312e81" />
            <ellipse cx="0" cy="-1" rx="22" ry="3.5" fill="#f59e0b" />
          </g>
        );
      case 'detective_cap':
        return (
          <g transform={`translate(${cx}, ${cy})`} className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
            <path d="M -22 2 C -22 -18, 22 -18, 22 2 Z" fill="#78716c" stroke="#44403c" strokeWidth="1.5" />
            {/* Brim visor */}
            <path d="M -22 2 C -20 8, 20 8, 22 2 Z" fill="#44403c" />
            {/* Ribbon */}
            <rect x="-21" y="-2" width="42" height="4" fill="#a8a29e" />
          </g>
        );
      case 'party_hat':
        return (
          <g transform={`translate(${cx}, ${cy})`} className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
            <polygon points="0,-35 -15,0 15,0" fill="#ec4899" stroke="#db2777" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Stripes */}
            <path d="M -8 -18 L 8 -18" stroke="#3b82f6" strokeWidth="3" />
            <path d="M -12 -8 L 12 -8" stroke="#yellow" strokeWidth="3" />
            {/* Pom pom */}
            <circle cx="0" cy="-36" r="4.5" fill="#fbbf24" className="animate-pulse" />
          </g>
        );
      default:
        return null;
    }
  };

  // Cosmetic Renderer: Glasses
  const renderGlasses = (cx: number, cy: number) => {
    const glasses = equippedCosmetics.glasses;
    if (!glasses) return null;

    switch (glasses) {
      case 'laser_visor':
        return (
          <g transform={`translate(${cx}, ${cy})`} className="drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]">
            {/* Visor Frame */}
            <polygon points="-28,-5 28,-5 25,6 -25,6" fill="rgba(6,182,212,0.25)" stroke="#0891b2" strokeWidth="2" />
            {/* Cybernetics / Laser scan line */}
            <line x1="-24" y1="0" x2="24" y2="0" stroke="#22d3ee" strokeWidth="2.5" className="animate-scan" />
            <line x1="-27" y1="-5" x2="-25" y2="6" stroke="#0891b2" strokeWidth="1.5" />
            <line x1="27" y1="-5" x2="25" y2="6" stroke="#0891b2" strokeWidth="1.5" />
          </g>
        );
      case 'monocle':
        return (
          <g transform={`translate(${cx - 18}, ${cy})`} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            <circle cx="0" cy="0" r="11" fill="rgba(147,197,253,0.3)" stroke="#fbbf24" strokeWidth="2.5" />
            {/* Chain */}
            <path d="M 11 0 Q 25 15 35 28" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="2,2" />
          </g>
        );
      case 'cool_shades':
        return (
          <g transform={`translate(${cx}, ${cy})`} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            {/* Left lens */}
            <polygon points="-25,-6 -5,-6 -8,8 -22,8" fill="#1e293b" stroke="#000" strokeWidth="1.5" />
            {/* Right lens */}
            <polygon points="5,-6 25,-6 22,8 8,8" fill="#1e293b" stroke="#000" strokeWidth="1.5" />
            {/* Bridge */}
            <rect x="-5" y="-6" width="10" height="2" fill="#000" />
            {/* Lens glare reflections */}
            <line x1="-20" y1="-2" x2="-14" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="-2" x2="16" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'gold_glasses':
        return (
          <g transform={`translate(${cx}, ${cy})`} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            {/* Left rim */}
            <circle cx="-20" cy="0" r="10" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
            {/* Right rim */}
            <circle cx="20" cy="0" r="10" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
            {/* Bridge */}
            <path d="M -10 0 C -5 -3, 5 -3, 10 0" fill="none" stroke="#f59e0b" strokeWidth="2" />
            {/* Side frames */}
            <line x1="-30" y1="0" x2="-35" y2="-4" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="30" y1="0" x2="35" y2="-4" stroke="#f59e0b" strokeWidth="1.5" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderPetMascot = () => {
    switch (petType) {
      case 'dino':
        return renderDino();
      case 'kitty':
        return renderKitty();
      case 'owl':
      default:
        return renderOwl();
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center min-h-[300px]">
      {/* Background Layer */}
      {renderBackground()}

      {/* Sleep overlays */}
      {isSleeping && (
        <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10 transition-all duration-700">
          <div className="absolute top-1/4 right-1/3 flex flex-col gap-1 text-slate-300 font-bold text-lg select-none">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>Z</span>
            <span className="animate-bounce ml-2 text-xl" style={{ animationDelay: '300ms' }}>z</span>
            <span className="animate-bounce ml-4 text-2xl" style={{ animationDelay: '600ms' }}>z</span>
          </div>
        </div>
      )}

      {/* Mascot Layer */}
      <div className={cn(
        "relative w-64 h-64 z-20 transition-all duration-300 select-none",
        isSleeping && "brightness-75"
      )}>
        {renderPetMascot()}
      </div>
    </div>
  );
}
