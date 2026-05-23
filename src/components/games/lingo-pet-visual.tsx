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
    necklace?: string;
    shoes?: string;
    wings?: string;
  };
  currentBackground: string;
  isPetting?: boolean;
  isSleeping?: boolean;
  isTalking?: boolean;
  className?: string;
}

export function LingoPetVisual({
  petType,
  level,
  energy,
  mood,
  equippedCosmetics: equippedCosmeticsRaw,
  currentBackground,
  isPetting = false,
  isSleeping = false,
  isTalking = false,
  className,
}: LingoPetVisualProps) {
  const equippedCosmetics = equippedCosmeticsRaw || {};
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
                <div className="w-10 h-1 bg-indigo-700/30 transform rotate-45 origin-left" />
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
      case 'cosmic-nebula':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 overflow-hidden transition-all duration-700">
            {/* Nebula Dust Clouds */}
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-pink-500/20 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 rounded-full bg-indigo-500/25 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/3 right-1/4 w-36 h-36 rounded-full bg-purple-500/20 blur-2xl animate-nebula-pulse" />
            
            {/* Spinning Starfield */}
            <div className="absolute inset-[-50px] opacity-40 animate-nebula-spin pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-white rounded-full"
                  style={{
                    top: `${10 + (i * 17) % 80}%`,
                    left: `${10 + (i * 23) % 80}%`,
                    boxShadow: '0 0 4px #fff, 0 0 8px #a855f7',
                  }}
                />
              ))}
            </div>

            {/* Shooting Comets */}
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                style={{
                  top: `${15 + i * 40}%`,
                  left: `${-20}%`,
                  width: '80px',
                  transform: 'rotate(-25deg)',
                  animation: `ufo-beam-pulse ${3 + i}s infinite linear`,
                }}
              />
            ))}
          </div>
        );
      case 'volcanic-core':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-red-950 overflow-hidden transition-all duration-700">
            {/* Molten Glow at Bottom */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-red-600/30 to-orange-500/0 blur-md" />
            <div className="absolute bottom-[-20px] left-1/4 w-40 h-20 bg-orange-600/20 rounded-full blur-xl animate-lava-flow" />
            <div className="absolute bottom-[-30px] right-1/4 w-48 h-24 bg-red-600/20 rounded-full blur-xl animate-lava-flow" style={{ animationDelay: '1.5s' }} />
            
            {/* Volcanic Sparks / Embers */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-orange-400 rounded-full animate-lava-ember"
                  style={{
                    left: `${10 + (i * 12.5)}%`,
                    bottom: '0px',
                    boxShadow: '0 0 6px #f97316',
                    animationDuration: `${2 + (i % 3) * 0.7}s`,
                    animationDelay: `${i * 300}ms`,
                  }}
                />
              ))}
            </div>

            {/* Glowing Volcanic Veins on the sides */}
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-red-800/10 to-transparent border-l border-red-500/10" />
            <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-red-800/10 to-transparent border-r border-red-500/10" />
          </div>
        );
      case 'ancient-temple':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950 via-slate-900 to-amber-950 overflow-hidden transition-all duration-700">
            {/* Shafts of holy light */}
            <div className="absolute inset-0 pointer-events-none flex justify-around">
              <div className="w-16 h-full bg-gradient-to-r from-transparent via-amber-400/5 to-transparent transform -rotate-12 animate-light-beam" />
              <div className="w-24 h-full bg-gradient-to-r from-transparent via-teal-300/5 to-transparent transform rotate-12 animate-light-beam" style={{ animationDelay: '2.5s' }} />
            </div>

            {/* Floating Runic Stones / Glyphs */}
            <div className="absolute inset-0 pointer-events-none">
              {[
                { top: '20%', left: '15%', symbol: '✴', color: 'text-teal-400/40', delay: '0s' },
                { top: '35%', right: '12%', symbol: '✦', color: 'text-amber-400/40', delay: '1s' },
                { top: '60%', left: '10%', symbol: '❂', color: 'text-teal-300/35', delay: '2s' },
                { top: '70%', right: '15%', symbol: '❈', color: 'text-amber-300/35', delay: '1.5s' },
              ].map((rune, idx) => (
                <div
                  key={idx}
                  className={cn("absolute text-xl font-bold animate-temple-float", rune.color)}
                  style={{
                    top: rune.top,
                    left: rune.left,
                    right: rune.right,
                    animationDelay: rune.delay,
                    textShadow: '0 0 8px rgba(251,191,36,0.3)',
                  }}
                >
                  {rune.symbol}
                </div>
              ))}
            </div>
            {/* Shrine structure silhouette */}
            <div className="absolute bottom-0 inset-x-0 h-6 bg-slate-950/80 border-t border-teal-500/20" />
          </div>
        );
      case 'neon-grid':
        return (
          <div className="absolute inset-0 bg-slate-950 overflow-hidden transition-all duration-700">
            {/* Cyber Grid Base */}
            <div className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Glowing horizon line */}
            <div className="absolute bottom-[20%] inset-x-0 h-[1px] bg-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            
            {/* Neon Sunset / Skyline glow */}
            <div className="absolute bottom-[20%] inset-x-0 h-40 bg-gradient-to-t from-pink-500/10 via-purple-500/0 to-transparent blur-md" />
            
            {/* Cyber scan / grid lines */}
            <div className="absolute top-[20%] bottom-0 inset-x-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent animate-cyber-laser" />
            </div>

            {/* Flying digital bytes */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute text-[8px] font-mono text-cyan-400/20"
                style={{
                  top: `${30 + i * 15}%`,
                  left: `${15 + i * 20}%`,
                  animation: `ufo-beam-pulse ${2 + i}s infinite alternate ease-in-out`,
                }}
              >
                {i % 2 === 0 ? '0101' : '1010'}
              </div>
            ))}
          </div>
        );
      case 'cozy-room':
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 overflow-hidden transition-all duration-700">
            {/* Bookshelf lines */}
            <div className="absolute top-4 left-4 w-48 h-20 border-b border-indigo-950/40 opacity-40 flex gap-2 items-end px-2">
              <div className="w-3 h-12 bg-indigo-900/20 rounded-sm" />
              <div className="w-4 h-14 bg-purple-900/25 rounded-sm transform -rotate-12 origin-bottom" />
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
    const isLvl15 = level >= 15;
    const isLvl30 = level >= 30;
    const isLvl45 = level >= 45;
    const isLvl60 = level >= 60;
    const isLvl75 = level >= 75;
    const isLvl90 = level >= 90;
    const isLvl100 = level >= 100;

    let bodyColor = "#6366f1";
    let wingColor = "#4f46e5";
    let tummyColor = "#e0e7ff";
    let earsColor = "#4f46e5";

    if (isLvl100) {
      bodyColor = "#0f172a";
      wingColor = "#3b0764";
      tummyColor = "#cbd5e1";
      earsColor = "#3b0764";
    } else if (isLvl90) {
      bodyColor = "#1e1b4b";
      wingColor = "#312e81";
      tummyColor = "#e0e7ff";
      earsColor = "#312e81";
    } else if (isLvl75) {
      bodyColor = "#0f172a";
      wingColor = "#1e293b";
      tummyColor = "#e2e8f0";
      earsColor = "#1e293b";
    } else if (isLvl60) {
      bodyColor = "#5b21b6";
      wingColor = "#4c1d95";
      tummyColor = "#f5f3ff";
      earsColor = "#4c1d95";
    } else if (isLvl45) {
      bodyColor = "#3730a3";
      wingColor = "#312e81";
      tummyColor = "#e0e7ff";
      earsColor = "#312e81";
    } else if (isLvl30) {
      bodyColor = "#6d28d9";
      wingColor = "#5b21b6";
      tummyColor = "#f5f3ff";
      earsColor = "#5b21b6";
    } else if (isLvl15) {
      bodyColor = "#4f46e5";
      wingColor = "#3730a3";
      tummyColor = "#e0e7ff";
      earsColor = "#3730a3";
    }

    // Dynamic coordinates for cosmetics based on physical evolution
    let hatX = 100, hatY = 58;
    let glassesX = 100, glassesY = 91;
    let necklaceX = 100, necklaceY = 112;
    let feetLeftX = 80, feetRightX = 120, feetY = 164;

    if (isLvl100) {
      hatY = 48;
      glassesY = 91;
      necklaceY = 114;
      feetY = 164;
    } else if (isLvl90) {
      hatY = 46;
      glassesY = 88;
      necklaceY = 112;
      feetY = 164;
    } else if (isLvl75) {
      hatY = 48;
      glassesY = 88;
      necklaceY = 112;
      feetY = 164;
    } else if (isLvl60) {
      hatY = 52;
      glassesY = 90;
      necklaceY = 114;
      feetY = 164;
    } else if (isLvl45) {
      hatY = 54;
      glassesY = 92;
      necklaceY = 115;
    } else if (isLvl30) {
      hatY = 56;
      glassesY = 94;
      necklaceY = 116;
    } else if (isLvl15) {
      hatY = 57;
      glassesY = 92;
    }

    // Dynamic viewBox to prevent wing/tail clipping
    let viewBox = "0 0 200 200";
    if (isLvl100) {
      viewBox = "-60 -60 320 320";
    } else if (isLvl90) {
      viewBox = "-45 -45 290 290";
    } else if (isLvl60) {
      viewBox = "-30 -30 260 260";
    }

    return (
      <svg viewBox={viewBox} style={{ overflow: 'visible' }} className="w-full h-full">
        <defs>
          <radialGradient id="owlDragonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.45"/>
            <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#020617" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="100" cy="170" rx="45" ry="8" fill="rgba(0,0,0,0.3)" />

        {/* Ambient Dragon Aura for level 100 */}
        {isLvl100 && (
          <circle cx="100" cy="115" r="75" fill="url(#owlDragonGlow)" className="animate-pulse" />
        )}

        {/* Body Group */}
        <g className={cn(
          "transition-all duration-500 origin-bottom",
          isPetting && "animate-bounce",
          isTalking && "scale-y-105",
          isSleeping && "translate-y-1",
          !isPetting && !isTalking && !isSleeping && "animate-breathing"
        )}>
          {/* Dragon wings behind body (lvl 100+) */}
          {isLvl100 && !equippedCosmetics.wings && (
            <g className="animate-dragon-wings">
              {/* Left massive wing */}
              <path d="M 50,115 C -10,65 -20,115 -45,95 C -30,135 10,140 50,115 Z" fill="#2e0854" stroke="#d946ef" strokeWidth="2" />
              {/* Right massive wing */}
              <path d="M 150,115 C 210,65 220,115 245,95 C 230,135 190,140 150,115 Z" fill="#2e0854" stroke="#d946ef" strokeWidth="2" />
            </g>
          )}

          {/* Phoenix wings behind body (lvl 60+) */}
          {isLvl60 && !isLvl100 && !equippedCosmetics.wings && (
            <g className="animate-phoenix">
              <path d="M 50,115 C 10,80 -10,105 -25,130 C -5,140 25,130 50,115" fill="#ea580c" stroke="#f97316" strokeWidth="1.5" />
              <path d="M 150,115 C 190,80 210,105 225,130 C 205,140 175,130 150,115" fill="#ea580c" stroke="#f97316" strokeWidth="1.5" />
            </g>
          )}

          {/* Dragon tail behind body (lvl 100+) */}
          {isLvl100 && (
            <g className="animate-dragon-wings" transform="translate(100, 125)">
              <path d="M 40,25 C 75,30 95,65 105,75 C 110,65 95,45 60,30 Z" fill="#0f172a" stroke="#d946ef" strokeWidth="2" />
              <polygon points="105,75 118,70 110,83" fill="#d946ef" />
            </g>
          )}

          {/* Phoenix flame tail (lvl 60+) */}
          {isLvl60 && !isLvl100 && (
            <g className="animate-fire-glow" transform="translate(100, 130)">
              <path d="M -15,20 C -25,50 0,65 0,65 C 0,65 25,50 15,20" fill="#ea580c" opacity="0.8" />
              <path d="M -8,20 C -15,40 0,50 0,50 C 0,50 15,40 8,20" fill="#fbbf24" />
            </g>
          )}

          {/* Equipped Wings */}
          {renderWings(100, 125)}

          {/* Default baby wings (not equipped, lvl < 60) */}
          {!equippedCosmetics.wings && !isLvl60 && !isLvl100 && (
            <>
              <path d="M 50 110 C 35 110, 30 135, 45 150 C 48 140, 52 120, 60 115" fill={wingColor} />
              <path d="M 150 110 C 165 110, 170 135, 155 150 C 152 140, 148 120, 140 115" fill={wingColor} />
            </>
          )}

          {/* PHYSICAL BODY EVOLUTION */}
          {isLvl100 ? (
            // Dragon-Owl Body
            <path d="M 50,115 C 40,65 160,65 150,115 C 155,145 145,165 100,168 C 55,165 45,145 50,115" fill={bodyColor} stroke="#d946ef" strokeWidth="1.5" />
          ) : isLvl90 ? (
            // Sage Cloaked Body
            <path d="M 50,115 C 42,65 158,65 150,115 C 160,150 145,168 100,169 C 55,168 40,150 50,115" fill={bodyColor} />
          ) : isLvl75 ? (
            // Storm Spiky Body
            <path d="M 50,115 L 45,95 L 65,82 L 100,72 L 135,82 L 155,95 L 150,115 C 160,145 142,165 100,168 C 58,165 40,145 50,115" fill={bodyColor} />
          ) : isLvl60 ? (
            // Phoenix Flame Body
            <path d="M 50,115 C 45,75 155,75 150,115 C 156,144 136,160 100,167 C 64,160 44,144 50,115" fill={bodyColor} />
          ) : isLvl45 ? (
            // Warrior Body (Stout/Polygonal shoulders)
            <path d="M 52,118 L 48,102 L 68,90 L 132,90 L 152,102 L 148,118 C 154,142 144,165 100,167 C 56,165 46,142 52,118" fill={bodyColor} />
          ) : isLvl30 ? (
            // Noble Body (Head + Body separation)
            <>
              <circle cx="100" cy="95" r="44" fill={bodyColor} />
              <ellipse cx="100" cy="138" rx="48" ry="28" fill={bodyColor} />
            </>
          ) : isLvl15 ? (
            // Fledgling taller oval body
            <ellipse cx="100" cy="112" rx="46" ry="55" fill={bodyColor} />
          ) : (
            // Baby round body
            <circle cx="100" cy="115" r="50" fill={bodyColor} />
          )}

          {/* TUMMY EVOLUTION */}
          {isLvl100 ? (
            // Scaly Dragon Tummy
            <g>
              <path d="M 70,128 Q 100,152 130,128 L 120,158 Q 100,166 80,158 Z" fill={tummyColor} stroke="#3b0764" strokeWidth="1.5" />
              {/* Scaly details */}
              <path d="M 90,135 Q 100,140 110,135" stroke="#3b0764" strokeWidth="1.5" fill="none" />
              <path d="M 85,145 Q 100,152 115,145" stroke="#3b0764" strokeWidth="1.5" fill="none" />
            </g>
          ) : isLvl90 ? (
            <g>
              <ellipse cx="100" cy="138" rx="36" ry="24" fill={tummyColor} />
              {/* Wizard runic mark */}
              <path d="M 96,134 Q 100,126 104,134 Q 108,142 100,146 Q 92,142 96,134" stroke="#a855f7" strokeWidth="1.5" fill="none" />
            </g>
          ) : isLvl75 ? (
            <g>
              <ellipse cx="100" cy="138" rx="38" ry="24" fill={tummyColor} />
              {/* Lightning bolt mark */}
              <polygon points="98,126 106,134 100,136 104,146 96,136 100,134" fill="#06b6d4" />
            </g>
          ) : isLvl60 ? (
            <g>
              <ellipse cx="100" cy="138" rx="38" ry="24" fill={tummyColor} />
              {/* Flame mark */}
              <path d="M 97,146 C 92,136 98,126 100,124 C 102,126 108,136 103,146 Z" fill="#ea580c" />
            </g>
          ) : isLvl45 ? (
            // Warrior Armor Chest Plate
            <path d="M 78,122 Q 100,148 122,122 L 114,148 Q 100,160 86,148 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
          ) : isLvl30 ? (
            // Noble Tummy
            <ellipse cx="100" cy="140" rx="34" ry="22" fill={tummyColor} />
          ) : isLvl15 ? (
            // Fledgling Tummy
            <ellipse cx="100" cy="122" rx="34" ry="38" fill={tummyColor} />
          ) : (
            // Baby Tummy
            <circle cx="100" cy="125" r="35" fill={tummyColor} />
          )}

          {/* Chest feather details for lower levels */}
          {!isLvl45 && !isLvl60 && !isLvl75 && !isLvl90 && (
            <>
              <path d="M 90,118 L 95,123 L 100,118 L 105,123 L 110,118" stroke={isLvl30 ? "#c084fc" : "#c7d2fe"} strokeWidth="2.5" fill="none" />
              <path d="M 85,128 L 92,135 L 100,128 L 108,135 L 115,128" stroke={isLvl30 ? "#c084fc" : "#c7d2fe"} strokeWidth="2.5" fill="none" />
            </>
          )}

          {/* Necklace slot */}
          {renderNecklace(necklaceX, necklaceY)}

          {/* EARS/TUFTS EVOLUTION */}
          {isLvl100 ? (
            // Sweeping Dragon Crest/Ears
            <>
              <path d="M 60,70 L 30,35 Q 50,55 70,66 Z" fill={earsColor} stroke="#d946ef" strokeWidth="1.5" />
              <path d="M 140,70 L 170,35 Q 150,55 130,66 Z" fill={earsColor} stroke="#d946ef" strokeWidth="1.5" />
            </>
          ) : isLvl75 ? (
            // Storm Lightning Ear Tufts
            <>
              <polygon points="56,70 34,42 66,60" fill={earsColor} stroke="#22d3ee" strokeWidth="1.5" />
              <polygon points="144,70 166,42 134,60" fill={earsColor} stroke="#22d3ee" strokeWidth="1.5" />
            </>
          ) : isLvl30 ? (
            // Noble Feathered Ears
            <>
              <polygon points="56,72 40,48 72,66" fill={earsColor} />
              <polygon points="144,72 160,48 128,66" fill={earsColor} />
            </>
          ) : (
            // Baby Ears
            <>
              <polygon points="55,75 50,55 75,70" fill={earsColor} />
              <polygon points="145,75 150,55 125,70" fill={earsColor} />
            </>
          )}

          {/* HEAD CREST FEATHER (lvl 15+) */}
          {isLvl15 && !isLvl75 && !isLvl100 && (
            <polygon points="97,68 100,42 103,68" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          )}

          {/* FOREHEAD CRESCENT MOON / GEM (lvl 30+) */}
          {isLvl30 && (
            <path d="M 97,80 A 3,3 0 0,0 103,80 A 2.2,2.2 0 0,1 97,80" fill={isLvl75 ? "#22d3ee" : "#fef08a"} opacity="0.95" />
          )}

          {/* LIGHTNING CROWN (lvl 75+) */}
          {isLvl75 && !isLvl100 && (
            <g className="animate-spark-flash">
              <polygon points="92,42 100,20 108,42 103,42 100,32 97,42" fill="#22d3ee" stroke="#0891b2" strokeWidth="1.5" />
            </g>
          )}

          {/* DRAGON HEAD HORNS (lvl 100+ Dragon Owl) */}
          {isLvl100 && (
            <g className="animate-fire-glow">
              {/* Left Horn */}
              <path d="M 68,64 C 54,32 30,38 18,48 C 34,54 52,58 68,64 Z" fill="#3b0764" stroke="#d946ef" strokeWidth="1.5" />
              {/* Right Horn */}
              <path d="M 132,64 C 146,32 170,38 182,48 C 166,54 148,58 132,64 Z" fill="#3b0764" stroke="#d946ef" strokeWidth="1.5" />
            </g>
          )}

          {/* MYSTICAL RUNIC RING (lvl 90+) */}
          {isLvl90 && (
            <g className="animate-nebula-spin" opacity="0.8">
              <circle cx="100" cy="115" r="62" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,8" className="drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            </g>
          )}

          {/* FEET / CLAWS EVOLUTION */}
          {isLvl100 ? (
            // Scaly Dragon Claws
            <>
              <path d="M 72,160 Q 72,168 85,168 Q 90,160 85,158" fill="#d946ef" />
              <path d="M 115,160 Q 115,168 128,168 Q 130,160 125,158" fill="#d946ef" />
            </>
          ) : (
            // Normal feet
            <>
              <ellipse cx={feetLeftX} cy={feetY} rx="10" ry="6" fill="#f59e0b" />
              <ellipse cx={feetRightX} cy={feetY} rx="10" ry="6" fill="#f59e0b" />
            </>
          )}
          {renderShoes(feetLeftX, feetRightX, feetY)}

          {/* EYES EVOLUTION */}
          <g className={cn("transition-all duration-300", isSleeping && "opacity-80")}>
            {/* Eye Sockets */}
            <circle cx="76" cy="98" r="16" fill="white" />
            <circle cx="124" cy="98" r="16" fill="white" />

            {isSleeping ? (
              // Sleeping eyes (lines)
              <>
                <path d="M 66,98 Q 76,106 86,98" stroke="#1e1b4b" strokeWidth="3" fill="none" />
                <path d="M 114,98 Q 124,106 134,98" stroke="#1e1b4b" strokeWidth="3" fill="none" />
              </>
            ) : isSad ? (
              // Sad / tired eyes
              <>
                <circle cx="76" cy="100" r="8" fill="#1e1b4b" />
                <circle cx="124" cy="100" r="8" fill="#1e1b4b" />
                <path d="M 63,88 L 83,93" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 137,88 L 117,93" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 68,112 Q 76,117 84,112" stroke="#818cf8" strokeWidth="1.5" fill="none" />
                <path d="M 116,112 Q 124,117 132,112" stroke="#818cf8" strokeWidth="1.5" fill="none" />
              </>
            ) : isLvl100 ? (
              // Dragon glowing slit eyes
              <>
                <circle cx="76" cy="98" r="10" fill="#d946ef" className="animate-pulse" />
                <circle cx="124" cy="98" r="10" fill="#d946ef" className="animate-pulse" />
                {/* Slit Pupils */}
                <ellipse cx="76" cy="98" rx="2" ry="7" fill="#0f172a" />
                <ellipse cx="124" cy="98" rx="2" ry="7" fill="#0f172a" />
                <circle cx="74" cy="95" r="2" fill="white" />
                <circle cx="122" cy="95" r="2" fill="white" />
              </>
            ) : (
              // Regular eyes
              <>
                <circle cx="76" cy="98" r="8" fill={isLvl60 ? "#7c3aed" : "#1e1b4b"} />
                <circle cx="124" cy="98" r="8" fill={isLvl60 ? "#7c3aed" : "#1e1b4b"} />
                <circle cx="74" cy="95" r="2.5" fill="white" />
                <circle cx="122" cy="95" r="2.5" fill="white" />
              </>
            )}
          </g>

          {/* Beak */}
          <polygon points="94,105 106,105 100,119" fill="#fbbf24" />

          {/* LEVEL BADGE */}
          <g transform="translate(100, 155)">
            <rect x="-18" y="-8" width="36" height="16" rx="6" fill="#1e1b4b" stroke={isLvl100 ? "#d946ef" : "#818cf8"} strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffedd5" fontSize="10" fontWeight="bold">Lvl {level}</text>
          </g>

          {/* Accessories Anchors */}
          {renderHat(hatX, hatY)}
          {renderGlasses(glassesX, glassesY)}
        </g>
      </svg>
    );
  };

  // SVG Render of Mascot Dino
  // SVG Render of Mascot Dino
  const renderDino = () => {
    const isLvl15 = level >= 15;
    const isLvl30 = level >= 30;
    const isLvl45 = level >= 45;
    const isLvl60 = level >= 60;
    const isLvl75 = level >= 75;
    const isLvl90 = level >= 90;
    const isLvl100 = level >= 100;

    let bodyColor = "#10b981";
    let backPlatesColor = "#059669";
    let bellyColor = "#a7f3d0";
    let eyeColor = "#064e3b";

    if (isLvl100) {
      bodyColor = "#1e1b4b";
      backPlatesColor = "#ef4444";
      bellyColor = "#f87171";
      eyeColor = "#ef4444";
    } else if (isLvl90) {
      bodyColor = "#022c22";
      backPlatesColor = "#fbbf24";
      bellyColor = "#6ee7b7";
      eyeColor = "#34d399";
    } else if (isLvl75) {
      bodyColor = "#475569";
      backPlatesColor = "#cbd5e1";
      bellyColor = "#94a3b8";
      eyeColor = "#0f172a";
    } else if (isLvl60) {
      bodyColor = "#b45309";
      backPlatesColor = "#ea580c";
      bellyColor = "#ffedd5";
      eyeColor = "#78350f";
    } else if (isLvl45) {
      bodyColor = "#0f766e";
      backPlatesColor = "#0d9488";
      bellyColor = "#cbd5e1"; // Steel plate visual
      eyeColor = "#115e59";
    } else if (isLvl30) {
      bodyColor = "#047857";
      backPlatesColor = "#34d399";
      bellyColor = "#a7f3d0";
      eyeColor = "#064e3b";
    } else if (isLvl15) {
      bodyColor = "#059669";
      backPlatesColor = "#10b981";
      bellyColor = "#a7f3d0";
      eyeColor = "#064e3b";
    }

    // Dynamic face and accessory coordinates for Dino based on physical evolution
    let eyesY = 74;
    let mouthY = 85;
    if (isLvl100) {
      eyesY = 54;
      mouthY = 68;
    } else if (isLvl90) {
      eyesY = 72;
      mouthY = 83;
    } else if (isLvl75) {
      eyesY = 72;
      mouthY = 83;
    } else if (isLvl60) {
      eyesY = 70;
      mouthY = 81;
    } else if (isLvl30) {
      eyesY = 72;
      mouthY = 83;
    }

    let hatX = 100;
    let hatY = eyesY - 26;
    let glassesX = 105;
    let glassesY = eyesY - 9; // align glasses center with eyes
    let necklaceX = 98;
    let necklaceY = isLvl100 ? 95 : eyesY + 18;
    let feetLeftX = 80;
    let feetRightX = 112;
    let feetY = 162;

    // Dynamic viewBox to prevent wing/tail clipping
    let viewBox = "0 0 200 200";
    if (isLvl100) {
      viewBox = "-60 -60 320 320";
    } else if (isLvl90) {
      viewBox = "-45 -45 290 290";
    } else if (isLvl60) {
      viewBox = "-30 -30 260 260";
    }

    return (
      <svg viewBox={viewBox} style={{ overflow: 'visible' }} className="w-full h-full">
        <defs>
          <radialGradient id="dinoDragonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45"/>
            <stop offset="60%" stopColor="#ea580c" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="95" cy="170" rx="50" ry="8" fill="rgba(0,0,0,0.3)" />

        {/* Ambient Volcanic Aura for level 100 */}
        {isLvl100 && (
          <circle cx="100" cy="115" r="75" fill="url(#dinoDragonGlow)" className="animate-pulse" />
        )}

        <g className={cn(
          "transition-all duration-500 origin-bottom",
          isPetting && "animate-bounce",
          isTalking && "scale-y-105",
          isSleeping && "translate-y-1",
          !isPetting && !isTalking && !isSleeping && "animate-breathing"
        )}>
          {/* Dragon wings behind body (lvl 100+) */}
          {isLvl100 && !equippedCosmetics.wings && (
            <g className="animate-dragon-wings">
              {/* Left Wing */}
              <path d="M 65,110 C 15,65 -5,100 -25,90 C -15,125 25,125 65,110 Z" fill="#4c0519" stroke="#ef4444" strokeWidth="2" />
              {/* Right Wing */}
              <path d="M 125,110 C 175,65 195,100 215,90 C 205,125 165,125 125,110 Z" fill="#4c0519" stroke="#ef4444" strokeWidth="2" />
            </g>
          )}

          {/* Equipped Wings */}
          {renderWings(95, 115)}

          {/* Tail Evolution */}
          {isLvl100 ? (
            // Long spiked dragon tail
            <path d="M 60 135 C 20 150, -5, 110, -15 130 C -25 150, 10 175, 65 150" fill={bodyColor} stroke="#ef4444" strokeWidth="1.5" />
          ) : isLvl90 ? (
            // Cyber blade tail
            <path d="M 60 135 C 25 140, 5 110, 0 125 C -5 138, 20 160, 65 150" fill={bodyColor} stroke="#22d3ee" strokeWidth="1" />
          ) : isLvl75 ? (
            // Spiky Stegosaur Tail
            <path d="M 60 135 C 25 145, 15 115, 8 128 C 3 138, 25 165, 65 150" fill={bodyColor} />
          ) : isLvl60 ? (
            // Magma flame tail
            <path d="M 60 135 C 28 142, 18 118, 12 128 C 6 138, 28 160, 65 150" fill={bodyColor} />
          ) : isLvl45 ? (
            // Plated armored tail
            <path d="M 60 135 C 28 142, 18 118, 12 128 Q 6 138 65 150" fill={bodyColor} stroke="#475569" strokeWidth="1.5" />
          ) : isLvl30 ? (
            // Slender kid tail
            <path d="M 60 135 C 32 142, 22 122, 16 130 C 12 138, 32 158, 65 150" fill={bodyColor} />
          ) : (
            // Baby tail
            <path d="M 60 135 C 30 145, 20 120, 15 130 C 10 140, 30 160, 65 150" fill={bodyColor} />
          )}
          
          {/* Tail fire (lvl 60+) */}
          {isLvl60 && (
            <g transform={isLvl100 ? "translate(-18, 124)" : isLvl90 ? "translate(3, 122)" : isLvl75 ? "translate(10, 125)" : "translate(15, 126)"} className="animate-fire-glow">
              <circle cx="0" cy="0" r="12" fill="#ef4444" opacity="0.8" />
              <circle cx="0" cy="0" r="7" fill="#f97316" />
              <circle cx="0" cy="0" r="3" fill="#fbbf24" />
            </g>
          )}

          {/* Tail Spikes (lvl 75+) */}
          {isLvl75 && (
            <g transform={isLvl100 ? "translate(-12, 128)" : isLvl90 ? "translate(1, 126)" : "translate(10, 129)"}>
              <polygon points="-6,-6 -16,0 -6,6 0,0" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            </g>
          )}

          {/* Back plates / Spikes (lvl 30+ has larger spikes) */}
          {isLvl30 ? (
            <>
              <polygon points="46,88 24,72 52,76" fill={backPlatesColor} stroke={isLvl100 ? "#ef4444" : "none"} strokeWidth="1" />
              <polygon points="54,108 30,92 60,96" fill={backPlatesColor} stroke={isLvl100 ? "#ef4444" : "none"} strokeWidth="1" />
              <polygon points="58,124 34,108 66,112" fill={backPlatesColor} stroke={isLvl100 ? "#ef4444" : "none"} strokeWidth="1" />
            </>
          ) : (
            <>
              <polygon points="50,90 40,82 55,80" fill={backPlatesColor} />
              <polygon points="58,110 46,102 62,100" fill={backPlatesColor} />
              <polygon points="62,125 50,118 68,115" fill={backPlatesColor} />
            </>
          )}

          {/* PHYSICAL BODY/HEAD EVOLUTION */}
          {isLvl100 ? (
            // Volcanic Dragon Body/Head
            <>
              {/* Dragon Neck + Head */}
              <path d="M 70,85 C 60,40 140,30 145,75 C 145,95 125,105 115,140 Q 110,155 120,165 C 105,168 75,165 75,145 C 75,130 70,105 70,85" fill={bodyColor} stroke="#ef4444" strokeWidth="1.5" />
            </>
          ) : isLvl90 ? (
            // Cyber slender dinosaur
            <path d="M 70 85 C 70 45, 130 45, 130 85 C 130 100, 120 120, 115 140 Q 110 155, 120 165 C 100 168, 75 165, 75 145 C 75 130, 70 105, 70 85" fill={bodyColor} />
          ) : isLvl75 ? (
            // Spikosaur Dino: spiky shoulder contours
            <path d="M 64,82 C 64,40 136,40 136,82 C 136,100 125,120 118,142 Q 110,158 122,165 C 98,168 68,165 70,145 C 70,125 64,102 64,82" fill={bodyColor} />
          ) : isLvl60 ? (
            // Fire Magma Dino shape
            <path d="M 65,80 C 65,40 135,40 135,80 C 135,98 124,118 118,140 Q 112,156 122,165 C 100,168 70,165 72,145 C 72,125 65,102 65,80" fill={bodyColor} />
          ) : isLvl45 ? (
            // Heavy Armored Dino
            <path d="M 68 85 C 68 48, 132 48, 132 85 C 132 102, 122 122, 116 142 Q 112 156, 122 165 C 100 168, 72 165, 72 145 C 72 130, 68 105, 68 85" fill={bodyColor} />
          ) : isLvl30 ? (
            // Apprentice Dino: neck beginning to lengthen, posture upright
            <path d="M 66,80 C 66,42 134,42 134,80 C 134,95 124,115 116,138 C 110,154 122,158 112,165 C 95,168 74,165 74,145 C 74,125 66,100 66,80" fill={bodyColor} />
          ) : isLvl15 ? (
            // Horned slightly larger Dino
            <path d="M 69 85 C 69 49, 131 49, 131 85 C 131 100, 121 120, 115 140 C 110 155, 120 160, 110 165 C 95 168, 74 165, 74 145 C 74 130, 69 105, 69 85" fill={bodyColor} />
          ) : (
            // Baby Dino (Chubby, smaller head/body)
            <path d="M 72 95 C 72 65, 128 65, 128 95 C 128 108, 118 122, 114 138 C 110 150, 118 155, 108 160 C 96 163, 76 160, 76 142 C 76 130, 72 112, 72 95" fill={bodyColor} />
          )}

          {/* DINO BELLY EVOLUTION */}
          {isLvl100 ? (
            // Magma Lava Belly
            <path d="M 85 95 C 85 80, 115 80, 115 95 C 115 110, 110 130, 105 145 C 98 152, 90 148, 88 135 C 85 120, 85 110, 85 95" fill="#f87171" stroke="#ef4444" strokeWidth="2.5" />
          ) : isLvl45 ? (
            // Steel breast plate
            <path d="M 85 95 C 85 80, 115 80, 115 95 C 115 110, 110 130, 105 145 C 98 152, 90 148, 88 135 C 85 120, 85 110, 85 95" fill={bellyColor} stroke="#475569" strokeWidth="2" />
          ) : (
            // Regular belly
            <path d="M 85 95 C 85 80, 115 80, 115 95 C 115 110, 110 130, 105 145 C 98 152, 90 148, 88 135 C 85 120, 85 110, 85 95" fill={bellyColor} />
          )}

          {/* Cybernetic details (lvl 90+) */}
          {isLvl90 && !isLvl100 && (
            <>
              <path d="M 88,110 L 112,110" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3,3" className="animate-pulse" />
              <path d="M 92,125 L 108,125" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3,3" className="animate-pulse" />
            </>
          )}

          {/* Volcanic magma cracks (lvl 100+) */}
          {isLvl100 && (
            <>
              <path d="M 78,105 L 85,115 L 75,122" fill="none" stroke="#dc2626" strokeWidth="3" />
              <path d="M 122,105 L 115,115 L 125,122" fill="none" stroke="#dc2626" strokeWidth="3" />
            </>
          )}

          {/* Necklace slot */}
          {renderNecklace(necklaceX, necklaceY)}

          {/* Tiny Arms */}
          <path d="M 72 108 Q 60 105 58 111" stroke={isLvl100 ? "#ef4444" : isLvl45 ? "#047857" : "#059669"} strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M 124 108 Q 136 105 138 111" stroke={isLvl100 ? "#ef4444" : isLvl45 ? "#047857" : "#059669"} strokeWidth="5.5" strokeLinecap="round" fill="none" />

          {/* Feet */}
          <path d="M 75 160 Q 75 168 85 168 Q 90 160 85 158" fill={isLvl100 ? "#0f172a" : "#059669"} />
          <path d="M 105 160 Q 105 168 115 168 Q 120 160 115 158" fill={isLvl100 ? "#0f172a" : "#059669"} />
          {renderShoes(feetLeftX, feetRightX, feetY)}

          {/* Nose Horn (lvl 15+) */}
          {isLvl15 && !isLvl75 && !isLvl100 && (
            <polygon points={`124,${eyesY - 4} 136,${eyesY - 8} 126,${eyesY + 2}`} fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          )}

          {/* Level 75 Spikosaur Horns (Triceratops-like) */}
          {isLvl75 && !isLvl100 && (
            <>
              {/* Nose Horn */}
              <polygon points={`124,${eyesY - 4} 136,${eyesY - 8} 126,${eyesY + 2}`} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              {/* Eyebrow Horns */}
              <polygon points={`88,${eyesY - 10} 82,${eyesY - 24} 94,${eyesY - 14}`} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              <polygon points={`122,${eyesY - 10} 128,${eyesY - 24} 116,${eyesY - 14}`} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            </>
          )}

          {/* DRAGON HEAD HORNS (lvl 100+ Dragon) */}
          {isLvl100 && (
            <g className="animate-fire-glow">
              <path d={`M 80,${eyesY - 12} Q 62,${eyesY - 37} 45,${eyesY - 27} Q 65,${eyesY - 20} 80,${eyesY - 12}`} fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
              <path d={`M 120,${eyesY - 12} Q 138,${eyesY - 37} 155,${eyesY - 27} Q 135,${eyesY - 20} 120,${eyesY - 12}`} fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
            </g>
          )}

          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d={`M 85 ${eyesY + 1} Q 92 ${eyesY + 8} 100 ${eyesY + 1}`} stroke={eyeColor} strokeWidth="3" fill="none" />
              <path d={`M 110 ${eyesY + 1} Q 118 ${eyesY + 8} 125 ${eyesY + 1}`} stroke={eyeColor} strokeWidth="3" fill="none" />
            </>
          ) : isSad ? (
            <>
              <ellipse cx="92" cy={eyesY} rx="7" ry="9" fill={eyeColor} />
              <ellipse cx="118" cy={eyesY} rx="7" ry="9" fill={eyeColor} />
              <path d={`M 82 ${eyesY - 11} L 95 ${eyesY - 7}`} stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
              <path d={`M 128 ${eyesY - 11} L 115 ${eyesY - 7}`} stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : isLvl100 ? (
            // Dragon slit eyes
            <>
              <ellipse cx="92" cy={eyesY} rx="8" ry="8" fill="#fbbf24" className="animate-pulse" />
              <ellipse cx="118" cy={eyesY} rx="8" ry="8" fill="#fbbf24" className="animate-pulse" />
              {/* Slit */}
              <line x1="92" y1={eyesY - 6} x2="92" y2={eyesY + 6} stroke="#000" strokeWidth="2.5" />
              <line x1="118" y1={eyesY - 6} x2="118" y2={eyesY + 6} stroke="#000" strokeWidth="2.5" />
            </>
          ) : (
            <>
              <circle cx="92" cy={eyesY} r="8" fill={eyeColor} />
              <circle cx="118" cy={eyesY} r="8" fill={eyeColor} />
              <circle cx="90" cy={eyesY - 3} r="2.5" fill="white" />
              <circle cx="116" cy={eyesY - 3} r="2.5" fill="white" />
            </>
          )}

          {/* Cheeks */}
          <circle cx="82" cy={eyesY + 6} r="4" fill="#f87171" opacity="0.6" />
          <circle cx="126" cy={eyesY + 6} r="4" fill="#f87171" opacity="0.6" />

          {/* Cute Mouth */}
          {isSleeping ? (
            <path d={`M 102 ${eyesY + 11} Q 106 ${eyesY + 13} 110 ${eyesY + 11}`} stroke={isLvl100 ? "#ef4444" : "#064e3b"} strokeWidth="2" fill="none" />
          ) : isTalking ? (
            <ellipse cx="106" cy={eyesY + 14} rx="5" ry="4" fill={isLvl100 ? "#ef4444" : "#7f1d1d"} />
          ) : (
            <path d={`M 102 ${eyesY + 11} Q 106 ${eyesY + 16} 110 ${eyesY + 11}`} stroke={isLvl100 ? "#ef4444" : "#064e3b"} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}

          {/* Volcanic fire breath sparkles (lvl 100+) */}
          {isLvl100 && (
            <circle cx="108" cy="92" r="4.5" fill="#fbbf24" className="animate-ping" />
          )}

          {/* LEVEL BADGE */}
          <g transform="translate(100, 155)">
            <rect x="-18" y="-8" width="36" height="16" rx="6" fill="#064e3b" stroke={isLvl100 ? "#ef4444" : "#34d399"} strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="bold">Lvl {level}</text>
          </g>

          {/* Accessories Anchors */}
          {renderHat(hatX, hatY)}
          {renderGlasses(glassesX, glassesY)}
        </g>
      </svg>
    );
  };

  // SVG Render of Mascot Kitty
  // SVG Render of Mascot Kitty
  const renderKitty = () => {
    const isLvl15 = level >= 15;
    const isLvl30 = level >= 30;
    const isLvl45 = level >= 45;
    const isLvl60 = level >= 60;
    const isLvl75 = level >= 75;
    const isLvl90 = level >= 90;
    const isLvl100 = level >= 100;

    let bodyColor = "#f97316";
    let earsColor = "#d97706";
    let tummyColor = "#ffedd5";
    let feetColor = "#ea580c";

    if (isLvl100) {
      bodyColor = "#fffbeb";
      earsColor = "#fef3c7";
      tummyColor = "#fef3c7";
      feetColor = "#fef3c7";
    } else if (isLvl90) {
      bodyColor = "#faf5ff";
      earsColor = "#f3e8ff";
      tummyColor = "#f3e8ff";
      feetColor = "#faf5ff";
    } else if (isLvl75) {
      bodyColor = "#cbd5e1";
      earsColor = "#94a3b8";
      tummyColor = "#f1f5f9";
      feetColor = "#94a3b8";
    } else if (isLvl60) {
      bodyColor = "#be185d";
      earsColor = "#9d174d";
      tummyColor = "#fdf2f8";
      feetColor = "#9d174d";
    } else if (isLvl45) {
      bodyColor = "#701a75";
      earsColor = "#4a044e";
      tummyColor = "#fdf4ff";
      feetColor = "#4a044e";
    } else if (isLvl30) {
      bodyColor = "#db2777";
      earsColor = "#be185d";
      tummyColor = "#fdf2f8";
      feetColor = "#be185d";
    } else if (isLvl15) {
      bodyColor = "#ea580c";
      earsColor = "#c2410c";
      tummyColor = "#ffedd5";
      feetColor = "#c2410c";
    }

    // Dynamic head parameters based on milestone posture shifts
    let headY = 92;
    let headR = 38;
    if (isLvl100) {
      headY = 80;
      headR = 32;
    } else if (isLvl90) {
      headY = 83;
      headR = 33;
    } else if (isLvl75) {
      headY = 85;
      headR = 34;
    } else if (isLvl60) {
      headY = 87;
      headR = 35;
    } else if (isLvl45) {
      headY = 89;
      headR = 36;
    } else if (isLvl30) {
      headY = 91;
      headR = 37;
    } else if (isLvl15) {
      headY = 93;
      headR = 38;
    }

    // Dynamic coordinates for Kitty cosmetics based on head height
    let hatX = 100;
    let hatY = headY - headR;
    let glassesX = 100;
    let glassesY = headY - 10; // align with eyes Y
    let necklaceX = 100;
    let necklaceY = headY + headR - 10;
    let feetLeftX = 78;
    let feetRightX = 122;
    let feetY = 162;

    // Dynamic viewBox to prevent wing/tail clipping
    let viewBox = "0 0 200 200";
    if (isLvl100) {
      viewBox = "-60 -60 320 320";
    } else if (isLvl90) {
      viewBox = "-45 -45 290 290";
    } else if (isLvl60) {
      viewBox = "-30 -30 260 260";
    }

    return (
      <svg viewBox={viewBox} style={{ overflow: 'visible' }} className="w-full h-full">
        <defs>
          <radialGradient id="kittyGoddessGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45"/>
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="100" cy="170" rx="45" ry="7" fill="rgba(0,0,0,0.3)" />

        {/* Ambient Divine Aura for level 100 */}
        {isLvl100 && (
          <circle cx="100" cy="115" r="75" fill="url(#kittyGoddessGlow)" className="animate-pulse" />
        )}

        <g className={cn(
          "transition-all duration-500 origin-bottom",
          isPetting && "animate-bounce",
          isTalking && "scale-y-105",
          isSleeping && "translate-y-1",
          !isPetting && !isTalking && !isSleeping && "animate-breathing"
        )}>
          {/* Equipped Wings */}
          {renderWings(100, 130)}

          {/* Seraphim angel wings (lvl 100+) */}
          {isLvl100 && !equippedCosmetics.wings && (
            <g className="animate-archangel">
              {/* Left Golden Wing */}
              <path d="M 60,100 C 15,40 5,60 -25,75 C -5,115 30,115 60,100" fill="#fbbf24" opacity="0.9" stroke="#f59e0b" strokeWidth="2" />
              {/* Right Golden Wing */}
              <path d="M 140,100 C 185,40 195,60 225,75 C 205,115 170,115 140,100" fill="#fbbf24" opacity="0.9" stroke="#f59e0b" strokeWidth="2" />
            </g>
          )}

          {/* Seraphim wings (lvl 45+) */}
          {isLvl45 && !isLvl100 && !equippedCosmetics.wings && (
            <g className="animate-butterfly">
              <path d="M 60,120 C 40,110 35,130 55,135 Z" fill="#fef08a" opacity="0.85" />
              <path d="M 140,120 C 160,110 165,130 145,135 Z" fill="#fef08a" opacity="0.85" />
            </g>
          )}

          {/* Multiple Tails Evolution */}
          {isLvl100 ? (
            // Six majestic goddess tails fanning out
            <g className="animate-archangel">
              {/* Tail 1 (Left far) */}
              <path d="M 135,140 C 165,110 170,60 145,45 C 130,55 140,95 135,140" fill="#fffbeb" opacity="0.6" stroke="#fbbf24" strokeWidth="0.8" />
              {/* Tail 2 (Left mid) */}
              <path d="M 138,140 C 180,120 185,75 165,60 C 150,70 155,105 138,140" fill="#fffbeb" opacity="0.75" stroke="#fbbf24" strokeWidth="0.8" />
              {/* Tail 3 (Left close) */}
              <path d="M 140,140 C 185,130 195,95 180,80 C 165,85 168,115 140,140" fill="#fffbeb" opacity="0.9" stroke="#fbbf24" strokeWidth="0.8" />
              {/* Tail 4 (Right close) */}
              <path d="M 140,140 C 190,145 200,110 188,95 C 175,95 170,120 140,140" fill="#fffbeb" opacity="0.9" stroke="#fbbf24" strokeWidth="0.8" />
              {/* Tail 5 (Right mid) */}
              <path d="M 138,140 C 182,155 190,125 182,110 C 170,110 162,128 138,140" fill="#fffbeb" opacity="0.75" stroke="#fbbf24" strokeWidth="0.8" />
              {/* Tail 6 (Right far) */}
              <path d="M 135,140 C 165,165 175,140 170,125 C 160,120 152,132 135,140" fill="#fffbeb" opacity="0.6" stroke="#fbbf24" strokeWidth="0.8" />
            </g>
          ) : isLvl90 ? (
            // Triple tails (Nekomata style)
            <>
              <path d="M 140,140 C 160,135 170,105 162,95 C 155,90 150,110 143,130" fill={feetColor} opacity="0.75" />
              <path d="M 140,140 C 170,145 180,115 178,105 C 170,95 160,115 143,130" fill={feetColor} opacity="0.75" />
              <path d="M 140,140 C 165,140 175,110 170,100 C 165,90 155,110 143,130" fill={feetColor} />
            </>
          ) : isLvl75 ? (
            // Triple tails
            <>
              <path d="M 140,140 C 160,135 170,105 162,95 C 155,90 150,110 143,130" fill={feetColor} opacity="0.75" />
              <path d="M 140,140 C 170,145 180,115 178,105 C 170,95 160,115 143,130" fill={feetColor} opacity="0.75" />
            </>
          ) : isLvl45 ? (
            // Double tails
            <>
              <path d="M 140,140 C 160,135 170,105 162,95 C 155,90 150,110 143,130" fill={feetColor} opacity="0.75" />
              <path d="M 140,140 C 165,140 175,110 170,100 C 165,90 155,110 143,130" fill={feetColor} />
            </>
          ) : (
            // Baby tail
            <path d="M 140 140 C 165 140, 175 110, 170 100 C 165 90, 155 110, 143 130" fill={feetColor} />
          )}

          {/* Goddess Scarf Ribbon (lvl 100+) */}
          {isLvl100 && (
            <path d="M 45,125 Q 100,162 155,125 Q 185,100 172,140 Q 100,172 28,140 Q 15,100 45,125" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.85" className="animate-float" />
          )}

          {/* PHYSICAL BODY EVOLUTION */}
          {isLvl100 ? (
            // Slender Goddess Body
            <ellipse cx="100" cy="126" rx="42" ry="32" fill={bodyColor} stroke="#fbbf24" strokeWidth="1.5" />
          ) : isLvl90 ? (
            // Fluffy mystical body
            <ellipse cx="100" cy="128" rx="43" ry="33" fill={bodyColor} />
          ) : isLvl75 ? (
            // Valkyrie body
            <ellipse cx="100" cy="128" rx="43" ry="31" fill={bodyColor} />
          ) : isLvl60 ? (
            // Sorceress body
            <ellipse cx="100" cy="130" rx="44" ry="32" fill={bodyColor} />
          ) : isLvl45 ? (
            // Slender body
            <ellipse cx="100" cy="132" rx="44" ry="32" fill={bodyColor} />
          ) : isLvl30 ? (
            // Mystic body
            <ellipse cx="100" cy="132" rx="40" ry="29" fill={bodyColor} />
          ) : isLvl15 ? (
            // Kid body
            <ellipse cx="100" cy="135" rx="38" ry="28" fill={bodyColor} />
          ) : (
            // Kitten round body
            <ellipse cx="100" cy="138" rx="35" ry="26" fill={bodyColor} />
          )}
          
          {/* Tummy patch */}
          {isLvl100 ? (
            <ellipse cx="100" cy="134" rx="26" ry="18" fill={tummyColor} />
          ) : isLvl45 ? (
            <ellipse cx="100" cy="138" rx="27" ry="18" fill={tummyColor} />
          ) : (
            <ellipse cx="100" cy="142" rx="24" ry="16" fill={tummyColor} />
          )}

          {/* Valkyrie chest plate (lvl 75+) */}
          {isLvl75 && !isLvl100 && (
            <path d="M 85,128 Q 100,145 115,128 L 110,136 Q 100,146 90,136 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.2" />
          )}

          {/* Necklace slot */}
          {renderNecklace(necklaceX, necklaceY)}

          {/* PHYSICAL HEAD EVOLUTION */}
          <circle cx="100" cy={headY} r={headR} fill={bodyColor} stroke={isLvl100 ? "#fbbf24" : "none"} strokeWidth={1} />

          {/* EARS EVOLUTION */}
          {isLvl100 ? (
            // Goddess Feathery Ears
            <>
              <polygon points={`68,${headY - 9} 50,${headY - 45} 82,${headY - 18}`} fill={earsColor} stroke="#fbbf24" strokeWidth="1" />
              <polygon points={`68,${headY - 9} 56,${headY - 38} 78,${headY - 18}`} fill="#fff" />
              <polygon points={`132,${headY - 9} 150,${headY - 45} 118,${headY - 18}`} fill={earsColor} stroke="#fbbf24" strokeWidth="1" />
              <polygon points={`132,${headY - 9} 144,${headY - 38} 122,${headY - 18}`} fill="#fff" />
            </>
          ) : (
            // Normal Ears
            <>
              <polygon points={`68,${headY - 17} 58,${headY - 47} 85,${headY - 24}`} fill={earsColor} />
              <polygon points={`68,${headY - 17} 62,${headY - 40} 80,${headY - 24}`} fill="#fecaca" />
              <polygon points={`132,${headY - 17} 142,${headY - 47} 115,${headY - 24}`} fill={earsColor} />
              <polygon points={`132,${headY - 17} 138,${headY - 40} 120,${headY - 24}`} fill="#fecaca" />
            </>
          )}

          {/* Valkyrie ear wings (lvl 75+) */}
          {isLvl75 && !isLvl100 && (
            <>
              <path d={`M 58,${headY - 47} Q 46,${headY - 57} 42,${headY - 47} Q 50,${headY - 45} 58,${headY - 47}`} fill="#cbd5e1" stroke="#fbbf24" strokeWidth="0.8" />
              <path d={`M 142,${headY - 47} Q 154,${headY - 57} 158,${headY - 47} Q 150,${headY - 45} 142,${headY - 47}`} fill="#cbd5e1" stroke="#fbbf24" strokeWidth="0.8" />
            </>
          )}

          {/* GODDESS HALO (lvl 100+) */}
          {isLvl100 && (
            <g className="animate-halo" transform={`translate(100, ${headY - 44})`}>
              <ellipse cx="0" cy="0" rx="30" ry="9" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.95" />
              <ellipse cx="0" cy="0" rx="30" ry="9" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
            </g>
          )}

          {/* Crystal tiara (lvl 60+) */}
          {isLvl60 && !isLvl100 && (
            <path d={`M 90,${headY - 26} L 88,${headY - 34} L 95,${headY - 31} L 100,${headY - 41} L 105,${headY - 31} L 112,${headY - 34} L 110,${headY - 26} Z`} fill="#ec4899" stroke="#cbd5e1" strokeWidth="1" />
          )}

          {/* Ribbon neck collar (lvl 15+) */}
          {isLvl15 && !isLvl100 && (
            <g>
              <rect x="86" y={headY + headR - 18} width="28" height="4" fill="#f43f5e" rx="2" />
              <circle cx="100" cy={headY + headR - 16} r="3" fill="#fbbf24" className="animate-pulse" />
            </g>
          )}

          {/* Forehead Moon (lvl 30+) */}
          {isLvl30 && (
            <path d={`M 97,${headY - 12} A 3,3 0 0,0 103,${headY - 12} A 2.2,2.2 0 0,1 97,${headY - 12}`} fill={isLvl90 ? "#a855f7" : "#fbbf24"} opacity="0.9" />
          )}

          {/* Feet */}
          <ellipse cx={feetLeftX} cy={feetY} rx="10" ry="7" fill={feetColor} />
          <ellipse cx={feetRightX} cy={feetY} rx="10" ry="7" fill={feetColor} />
          {renderShoes(feetLeftX, feetRightX, feetY)}
          
          {/* Paws front */}
          {isLvl100 ? (
            <>
              <circle cx="86" cy="140" r="7" fill={tummyColor} />
              <circle cx="114" cy="140" r="7" fill={tummyColor} />
            </>
          ) : (
            <>
              <circle cx="88" cy="148" r="8" fill={tummyColor} />
              <circle cx="112" cy="148" r="8" fill={tummyColor} />
            </>
          )}

          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d={`M 78 ${headY} Q 86 ${headY + 6} 94 ${headY}`} stroke="#78350f" strokeWidth="2.5" fill="none" />
              <path d={`M 106 ${headY} Q 114 ${headY + 6} 122 ${headY}`} stroke="#78350f" strokeWidth="2.5" fill="none" />
            </>
          ) : isSad ? (
            <>
              <circle cx="85" cy={headY - 1} r="7" fill="#78350f" />
              <circle cx="115" cy={headY - 1} r="7" fill="#78350f" />
              <path d={`M 77 ${headY - 10} Q 85 ${headY - 7} 93 ${headY - 10}`} stroke="#78350f" strokeWidth="2" fill="none" />
              <path d={`M 123 ${headY - 10} Q 115 ${headY - 7} 107 ${headY - 10}`} stroke="#78350f" strokeWidth="2" fill="none" />
            </>
          ) : isLvl100 ? (
            // Goddess eyes with gold/amber glow and shine
            <>
              <circle cx="85" cy={headY - 7} r="9" fill="#fbbf24" className="animate-pulse" />
              <circle cx="115" cy={headY - 7} r="9" fill="#fbbf24" className="animate-pulse" />
              <circle cx="85" cy={headY - 7} r="5" fill="#b45309" />
              <circle cx="115" cy={headY - 7} r="5" fill="#b45309" />
              <circle cx="83" cy={headY - 10} r="2.2" fill="white" />
              <circle cx="113" cy={headY - 10} r="2.2" fill="white" />
            </>
          ) : (
            <>
              <circle cx="85" cy={headY - 1} r="8" fill={isLvl60 ? "#db2777" : "#78350f"} />
              <circle cx="115" cy={headY - 1} r="8" fill={isLvl60 ? "#db2777" : "#78350f"} />
              <circle cx="83" cy={headY - 4} r="2.5" fill="white" />
              <circle cx="113" cy={headY - 4} r="2.5" fill="white" />
            </>
          )}

          {/* Nose & Mouth */}
          <polygon points={`98,${headY + 6} 102,${headY + 6} 100,${headY + 9}`} fill="#f43f5e" />
          <path d={`M 97 ${headY + 11} Q 100 ${headY + 14} 103 ${headY + 11}`} stroke="#78350f" strokeWidth="1.5" fill="none" />

          {/* Whiskers */}
          <line x1="58" y1={headY + 6} x2="42" y2={headY + 4} stroke="#78350f" strokeWidth="1.5" />
          <line x1="58" y1={headY + 12} x2="40" y2={headY + 13} stroke="#78350f" strokeWidth="1.5" />
          
          <line x1="142" y1={headY + 6} x2="158" y2={headY + 4} stroke="#78350f" strokeWidth="1.5" />
          <line x1="142" y1={headY + 12} x2="160" y2={headY + 13} stroke="#78350f" strokeWidth="1.5" />

          {/* LEVEL BADGE */}
          <g transform="translate(100, 155)">
            <rect x="-18" y="-8" width="36" height="16" rx="6" fill="#78350f" stroke={isLvl100 ? "#fbbf24" : "#ea580c"} strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffedd5" fontSize="10" fontWeight="bold">Lvl {level}</text>
          </g>

          {/* Accessories Anchors */}
          {renderHat(hatX, hatY)}
          {renderGlasses(glassesX, glassesY)}
        </g>
      </svg>
    );
  };

  // Cosmetic Renderer: Hat
  const renderHat = (cx: number, cy: number) => {
    const hat = equippedCosmetics.hat;
    if (!hat) return null;

    switch (hat) {
      case 'phoenix_tiara':
        return (
          <g transform={`translate(${cx}, ${cy - 2})`}>
            <g className="drop-shadow-[0_0_10px_rgba(249,115,22,0.9)] animate-fire-glow">
              {/* Tiara Base */}
              <path d="M -16 2 L -18 -6 L -8 -1 L 0 -12 L 8 -1 L 18 -6 L 16 2 Z" fill="#fbbf24" stroke="#ea580c" strokeWidth="1.5" />
              {/* Center Ruby */}
              <polygon points="0,-1 3,3 0,7 -3,3" fill="#ef4444" />
              {/* Floating Flames */}
              <circle cx="-10" cy="-10" r="1.5" fill="#f97316" className="animate-phoenix-ember" style={{ animationDelay: '100ms' }} />
              <circle cx="10" cy="-12" r="1.8" fill="#fbbf24" className="animate-phoenix-ember" style={{ animationDelay: '400ms' }} />
              <circle cx="0" cy="-16" r="2.2" fill="#ef4444" className="animate-phoenix-ember" style={{ animationDelay: '200ms' }} />
            </g>
          </g>
        );
      case 'goddess_laurel':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
              {/* Wreath branches */}
              <path d="M -20 2 Q -22 -10 -4 -8 Q 0 -10 4 -8 Q 22 -10 20 2" fill="none" stroke="#d97706" strokeWidth="2.5" />
              {/* Gold Leaves */}
              <path d="M -18 -6 Q -14 -12 -12 -5" fill="#fbbf24" />
              <path d="M -10 -8 Q -6 -14 -5 -7" fill="#fbbf24" />
              <path d="M -2 -9 Q 2 -15 3 -8" fill="#fbbf24" />
              <path d="M 6 -8 Q 10 -14 11 -7" fill="#fbbf24" />
              <path d="M 14 -6 Q 18 -12 16 -5" fill="#fbbf24" />
              {/* Falling light particles */}
              <circle cx="-15" cy="5" r="1.2" fill="#fff" className="animate-goddess-leaf" style={{ animationDelay: '0ms' }} />
              <circle cx="15" cy="8" r="1.5" fill="#fff" className="animate-goddess-leaf" style={{ animationDelay: '500ms' }} />
              <circle cx="0" cy="12" r="1" fill="#fff" className="animate-goddess-leaf" style={{ animationDelay: '1000ms' }} />
            </g>
          </g>
        );
      case 'ufo_hat':
        return (
          <g transform={`translate(${cx}, ${cy - 12})`}>
            {/* Pulsing Green Tractor Beam */}
            <polygon points="-35,65 -10,12 10,12 35,65" fill="rgba(34,197,94,0.18)" className="animate-ufo-beam pointer-events-none" />
            <g className="animate-halo">
              {/* UFO Body */}
              <ellipse cx="0" cy="8" rx="22" ry="5.5" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              {/* Glass Dome */}
              <path d="M -10 6 C -10 -4, 10 -4, 10 6 Z" fill="rgba(34,197,94,0.7)" stroke="#22c55e" strokeWidth="1.5" />
              {/* Little Alien head silhouette inside dome */}
              <circle cx="0" cy="3" r="2.5" fill="#15803d" />
              {/* UFO lights */}
              <circle cx="-14" cy="8" r="1.5" fill="#fbbf24" className="animate-pulse" />
              <circle cx="-7" cy="9" r="1.5" fill="#ec4899" className="animate-pulse" style={{ animationDelay: '150ms' }} />
              <circle cx="0" cy="9.5" r="1.5" fill="#22c55e" className="animate-pulse" style={{ animationDelay: '300ms' }} />
              <circle cx="7" cy="9" r="1.5" fill="#3b82f6" className="animate-pulse" style={{ animationDelay: '450ms' }} />
              <circle cx="14" cy="8" r="1.5" fill="#fbbf24" className="animate-pulse" style={{ animationDelay: '600ms' }} />
            </g>
          </g>
        );
      case 'angel_halo':
        return (
          <g transform={`translate(${cx}, ${cy - 12})`}>
            <g className="drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-halo">
              {/* Oval ring of the halo */}
              <ellipse cx="0" cy="0" rx="20" ry="6" fill="none" stroke="#fbbf24" strokeWidth="4.5" />
              <ellipse cx="0" cy="0" rx="20" ry="6" fill="none" stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />
              {/* Glow particles */}
              <circle cx="-15" cy="-2" r="1.2" fill="#fff" className="animate-ping" />
              <circle cx="15" cy="2" r="1.2" fill="#fff" className="animate-ping" />
            </g>
          </g>
        );
      case 'dragon_horns':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="drop-shadow-[0_0_10px_rgba(239,68,68,0.85)] animate-fire-glow">
              {/* Left horn */}
              <path d="M -18 4 Q -35 -15 -28 -32 Q -22 -20 -10 -2 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
              <path d="M -18 4 Q -30 -12 -25 -26 C -22 -16 -12 -2 -18 4" fill="#f87171" opacity="0.6" />
              
              {/* Right horn */}
              <path d="M 18 4 Q 35 -15 28 -32 Q 22 -20 10 -2 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
              <path d="M 18 4 Q 30 -12 25 -26 C 22 -16 12 -2 18 4" fill="#f87171" opacity="0.6" />
            </g>
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
      case 'tech_visor':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="drop-shadow-[0_0_10px_rgba(34,197,94,0.85)]">
              {/* Visor shield */}
              <polygon points="-26,-4 26,-4 24,7 -24,7" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="2" />
              {/* Binary matrix elements */}
              <text x="-18" y="4" fill="#4ade80" fontSize="5" fontFamily="monospace" opacity="0.8" className="animate-pulse">01</text>
              <text x="10" y="4" fill="#4ade80" fontSize="5" fontFamily="monospace" opacity="0.8" className="animate-pulse" style={{ animationDelay: '500ms' }}>10</text>
              {/* Scanline */}
              <line x1="-23" y1="1" x2="23" y2="1" stroke="#a7f3d0" strokeWidth="1" className="animate-scan" />
            </g>
          </g>
        );
      case 'hypno_glasses':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            {/* Left Frame & Spiral */}
            <g transform="translate(-18, 0)">
              <circle cx="0" cy="0" r="11" fill="#000" stroke="#d946ef" strokeWidth="2.5" />
              <g className="animate-hypno-spin">
                {/* Spiral path */}
                <path d="M 0 0 Q -3 -3 -5 0 Q -7 3 -4 6 Q 0 8 5 4 Q 8 -2 3 -7 Q -4 -9 -9 -4 Q -12 3 -5 10 Q 3 13 10 5" fill="none" stroke="#d946ef" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </g>
            {/* Right Frame & Spiral */}
            <g transform="translate(18, 0)">
              <circle cx="0" cy="0" r="11" fill="#000" stroke="#d946ef" strokeWidth="2.5" />
              <g className="animate-hypno-spin">
                {/* Spiral path */}
                <path d="M 0 0 Q -3 -3 -5 0 Q -7 3 -4 6 Q 0 8 5 4 Q 8 -2 3 -7 Q -4 -9 -9 -4 Q -12 3 -5 10 Q 3 13 10 5" fill="none" stroke="#d946ef" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </g>
            {/* Bridge */}
            <rect x="-8" y="-2" width="16" height="3" fill="#d946ef" rx="1" />
          </g>
        );
      case 'steampunk_goggles':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="animate-steampunk">
              {/* Left gear lens */}
              <g transform="translate(-18, 0)">
                <circle cx="0" cy="0" r="10" fill="#78350f" stroke="#d97706" strokeWidth="2.5" />
                {[...Array(6)].map((_, i) => (
                  <rect key={i} x="-2" y="-13" width="4" height="4" fill="#d97706" transform={`rotate(${i * 60})`} />
                ))}
                <circle cx="0" cy="0" r="7" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-pulse" />
                <circle cx="0" cy="0" r="3" fill="#f59e0b" />
              </g>
              {/* Right gear lens */}
              <g transform="translate(18, 0)">
                <circle cx="0" cy="0" r="10" fill="#78350f" stroke="#d97706" strokeWidth="2.5" />
                {[...Array(6)].map((_, i) => (
                  <rect key={i} x="-2" y="-13" width="4" height="4" fill="#d97706" transform={`rotate(${i * 60 + 30})`} />
                ))}
                <circle cx="0" cy="0" r="7" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-pulse" />
                <circle cx="0" cy="0" r="3" fill="#f59e0b" />
              </g>
              {/* Bridge */}
              <rect x="-8" y="-2" width="16" height="3.5" fill="#d97706" rx="1" />
              {/* Strap */}
              <path d="M -28 0 Q -38 -5 -40 -1" fill="none" stroke="#78350f" strokeWidth="2" />
              <path d="M 28 0 Q 38 -5 40 -1" fill="none" stroke="#78350f" strokeWidth="2" />
            </g>
          </g>
        );
      case 'starry_shades':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="animate-starry">
              {/* Left Star */}
              <polygon points="-28,4 -22,4 -20,-2 -18,4 -12,4 -17,8 -15,14 -20,10 -25,14 -23,8" fill="rgba(236,72,153,0.3)" stroke="#ec4899" strokeWidth="2" />
              {/* Right Star */}
              <polygon points="12,4 18,4 20,-2 22,4 28,4 23,8 25,14 20,10 15,14 17,8" fill="rgba(236,72,153,0.3)" stroke="#ec4899" strokeWidth="2" />
              {/* Bridge */}
              <path d="M -12 4 C -6 1, 6 1, 12 4" fill="none" stroke="#ec4899" strokeWidth="2" />
              {/* Glint line */}
              <line x1="-24" y1="2" x2="-16" y2="10" stroke="#fff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
              <line x1="16" y1="2" x2="24" y2="10" stroke="#fff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            </g>
          </g>
        );
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

  // Cosmetic Renderer: Wings (Rendered behind the body)
  const renderWings = (cx: number, cy: number) => {
    const wings = equippedCosmetics.wings;
    if (!wings) return null;

    switch (wings) {
      case 'void_wings':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="animate-void-wing">
              {/* Left Wing - shifted to -40 for high visibility */}
              <g transform="translate(-40, -5) scale(-1.2, 1.2)" className="drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
                {/* Dark Nebula Feather Outlines */}
                <path d="M 0 0 C -25 -25, -65 -35, -85 -15 C -75 5, -45 15, 0 5" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
                <path d="M -10 -5 C -35 -20, -60 -20, -75 -5 C -65 5, -35 10, 0 5" fill="#3b0764" opacity="0.8" />
                <path d="M -20 -8 C -40 -15, -55 -10, -60 0 C -50 5, -35 5, 0 2" fill="rgba(168,85,247,0.4)" />
                {/* Star sparkles */}
                <circle cx="-50" cy="-15" r="1.5" fill="#fff" className="animate-pulse" />
                <circle cx="-30" cy="-5" r="1" fill="#fff" className="animate-pulse" style={{ animationDelay: '400ms' }} />
                <polygon points="-65,-8 -63,-6 -65,-4 -67,-6" fill="#f472b6" className="animate-pulse" />
              </g>
              {/* Right Wing - shifted to 40 for high visibility */}
              <g transform="translate(40, -5) scale(1.2, 1.2)" className="drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
                <path d="M 0 0 C -25 -25, -65 -35, -85 -15 C -75 5, -45 15, 0 5" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
                <path d="M -10 -5 C -35 -20, -60 -20, -75 -5 C -65 5, -35 10, 0 5" fill="#3b0764" opacity="0.8" />
                <path d="M -20 -8 C -40 -15, -55 -10, -60 0 C -50 5, -35 5, 0 2" fill="rgba(168,85,247,0.4)" />
                {/* Star sparkles */}
                <circle cx="-50" cy="-15" r="1.5" fill="#fff" className="animate-pulse" />
                <circle cx="-30" cy="-5" r="1" fill="#fff" className="animate-pulse" style={{ animationDelay: '400ms' }} />
                <polygon points="-65,-8 -63,-6 -65,-4 -67,-6" fill="#f472b6" className="animate-pulse" />
              </g>
            </g>
          </g>
        );
      case 'phoenix_wings':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="animate-phoenix">
              {/* Left phoenix wing - shifted from -18 to -40 for high visibility */}
              <g transform="translate(-40, -5) scale(-1, 1)">
                <path d="M 0 10 C -25 35, -45 -10, -60 -25 C -40 -15, -20 -15, -5 0 C -25 -25, -40 -35, -50 -45 C -35 -25, -20 -20, 0 -10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
                <path d="M -10 -5 C -25 -10, -40 -25, -45 -35 C -35 -20, -20 -15, -5 -8 Z" fill="#f97316" opacity="0.8" />
                <path d="M -8 2 C -18 5, -28 -5, -35 -15 C -25 -8, -15 -5, -3 0 Z" fill="#fbbf24" opacity="0.9" />
              </g>
              {/* Right phoenix wing - shifted from 18 to 40 for high visibility */}
              <g transform="translate(40, -5)">
                <path d="M 0 10 C -25 35, -45 -10, -60 -25 C -40 -15, -20 -15, -5 0 C -25 -25, -40 -35, -50 -45 C -35 -25, -20 -20, 0 -10 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
                <path d="M -10 -5 C -25 -10, -40 -25, -45 -35 C -35 -20, -20 -15, -5 -8 Z" fill="#f97316" opacity="0.8" />
                <path d="M -8 2 C -18 5, -28 -5, -35 -15 C -25 -8, -15 -5, -3 0 Z" fill="#fbbf24" opacity="0.9" />
              </g>
            </g>
          </g>
        );
      case 'butterfly_wings':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="animate-butterfly">
              {/* Left butterfly wing - shifted from -14 to -36 */}
              <g transform="translate(-36, 5) scale(-1, 1)">
                <path d="M 0 0 C -20 20, -45 25, -45 5 C -45 -15, -30 -30, -5 -15" fill="rgba(168,85,247,0.7)" stroke="#a855f7" strokeWidth="2" />
                <path d="M -5 -15 C -20 -35, -40 -40, -40 -25 C -40 -10, -20 -5, 0 0" fill="rgba(236,72,153,0.7)" stroke="#ec4899" strokeWidth="2" />
                <circle cx="-25" cy="-20" r="4" fill="#fff" opacity="0.5" />
                <circle cx="-28" cy="6" r="3" fill="#fff" opacity="0.5" />
              </g>
              {/* Right butterfly wing - shifted from 14 to 36 */}
              <g transform="translate(36, 5)">
                <path d="M 0 0 C -20 20, -45 25, -45 5 C -45 -15, -30 -30, -5 -15" fill="rgba(168,85,247,0.7)" stroke="#a855f7" strokeWidth="2" />
                <path d="M -5 -15 C -20 -35, -40 -40, -40 -25 C -40 -10, -20 -5, 0 0" fill="rgba(236,72,153,0.7)" stroke="#ec4899" strokeWidth="2" />
                <circle cx="-25" cy="-20" r="4" fill="#fff" opacity="0.5" />
                <circle cx="-28" cy="6" r="3" fill="#fff" opacity="0.5" />
              </g>
            </g>
          </g>
        );
      case 'cyber_wings':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="animate-cyber">
              {/* Left cyber wing - shifted from -16 to -38 */}
              <g transform="translate(-38, -2) scale(-1, 1)">
                <polygon points="0,0 -20,-15 -50,-10 -40,5 -15,5" fill="rgba(6,182,212,0.6)" stroke="#22d3ee" strokeWidth="1.5" />
                <polygon points="-10,-10 -35,-30 -55,-25 -40,-10" fill="rgba(6,182,212,0.4)" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M 0 -2 L -15 -12 L -35 -12" fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />
                <circle cx="-35" cy="-12" r="1.5" fill="#fff" />
              </g>
              {/* Right cyber wing - shifted from 16 to 38 */}
              <g transform="translate(38, -2)">
                <polygon points="0,0 -20,-15 -50,-10 -40,5 -15,5" fill="rgba(6,182,212,0.6)" stroke="#22d3ee" strokeWidth="1.5" />
                <polygon points="-10,-10 -35,-30 -55,-25 -40,-10" fill="rgba(6,182,212,0.4)" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M 0 -2 L -15 -12 L -35 -12" fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />
                <circle cx="-35" cy="-12" r="1.5" fill="#fff" />
              </g>
            </g>
          </g>
        );
      case 'archangel_wings':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="animate-archangel">
              {/* Left wing - massive golden feather design */}
              <g transform="translate(-40, -10) scale(-1.2, 1.2)">
                <path d="M 0 0 C -30 -30, -70 -40, -90 -20 C -80 0, -50 10, 0 5" fill="#fef08a" stroke="#fbbf24" strokeWidth="2" />
                <path d="M -10 -5 C -40 -25, -70 -25, -80 -10 C -70 5, -40 10, 0 5" fill="#ffffff" opacity="0.9" />
                <path d="M -20 -8 C -45 -20, -65 -15, -70 -5 C -60 5, -45 5, 0 2" fill="#fef08a" opacity="0.8" />
                <path d="M -30 2 C -40 15, -45 15, -40 2" fill="#ffffff" stroke="#fbbf24" strokeWidth="1" />
                <path d="M -50 0 C -60 12, -65 12, -60 0" fill="#ffffff" stroke="#fbbf24" strokeWidth="1" />
                <path d="M -70 -5 C -80 8, -83 8, -78 -5" fill="#ffffff" stroke="#fbbf24" strokeWidth="1" />
              </g>
              {/* Right wing - massive golden feather design */}
              <g transform="translate(40, -10) scale(1.2, 1.2)">
                <path d="M 0 0 C -30 -30, -70 -40, -90 -20 C -80 0, -50 10, 0 5" fill="#fef08a" stroke="#fbbf24" strokeWidth="2" />
                <path d="M -10 -5 C -40 -25, -70 -25, -80 -10 C -70 5, -40 10, 0 5" fill="#ffffff" opacity="0.9" />
                <path d="M -20 -8 C -45 -20, -65 -15, -70 -5 C -60 5, -45 5, 0 2" fill="#fef08a" opacity="0.8" />
                <path d="M -30 2 C -40 15, -45 15, -40 2" fill="#ffffff" stroke="#fbbf24" strokeWidth="1" />
                <path d="M -50 0 C -60 12, -65 12, -60 0" fill="#ffffff" stroke="#fbbf24" strokeWidth="1" />
                <path d="M -70 -5 C -80 8, -83 8, -78 -5" fill="#ffffff" stroke="#fbbf24" strokeWidth="1" />
              </g>
            </g>
          </g>
        );
      case 'dragon_wings':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <g className="animate-dragon-wings">
              {/* Left wing - massive demonic spiky wing design */}
              <g transform="translate(-40, -5) scale(-1.3, 1.3)">
                <path d="M 0 0 L -30 -25 L -75 -15 L -60 10 L -35 5 L -10 15 Z" fill="#1e1b4b" stroke="#311042" strokeWidth="2" />
                <path d="M 0 0 C -15 -10, -25 -20, -30 -25 C -45 -20, -65 -15, -75 -15 C -65 -2, -60 5, -60 10 C -50 8, -40 5, -35 5 C -25 8, -15 12, 0 0 Z" fill="#991b1b" opacity="0.95" />
                <path d="M 0 0 L -30 -25 L -75 -15" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
                <polygon points="-30,-25 -28,-28 -32,-28" fill="#ef4444" />
                <polygon points="-75,-15 -78,-17 -76,-13" fill="#ef4444" />
              </g>
              {/* Right wing - massive demonic spiky wing design */}
              <g transform="translate(40, -5) scale(1.3, 1.3)">
                <path d="M 0 0 L -30 -25 L -75 -15 L -60 10 L -35 5 L -10 15 Z" fill="#1e1b4b" stroke="#311042" strokeWidth="2" />
                <path d="M 0 0 C -15 -10, -25 -20, -30 -25 C -45 -20, -65 -15, -75 -15 C -65 -2, -60 5, -60 10 C -50 8, -40 5, -35 5 C -25 8, -15 12, 0 0 Z" fill="#991b1b" opacity="0.95" />
                <path d="M 0 0 L -30 -25 L -75 -15" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
                <polygon points="-30,-25 -28,-28 -32,-28" fill="#ef4444" />
                <polygon points="-75,-15 -78,-17 -76,-13" fill="#ef4444" />
              </g>
            </g>
          </g>
        );
      default:
        return null;
    }
  };

  // Cosmetic Renderer: Necklace (Rendered on body but below head)
  const renderNecklace = (cx: number, cy: number) => {
    const necklace = equippedCosmetics.necklace;
    if (!necklace) return null;

    switch (necklace) {
      case 'dragon_pearl':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            {/* Jade chain */}
            <path d="M -22 -6 Q 0 16 22 -6" fill="none" stroke="#059669" strokeWidth="2.5" />
            {/* Glowing Pearl */}
            <g transform="translate(0, 9)">
              {/* Expanding Ripple Ring */}
              <circle cx="0" cy="0" r="10" fill="none" stroke="#34d399" strokeWidth="1" className="animate-pearl-pulse" />
              {/* Pearl Core */}
              <circle cx="0" cy="0" r="5" fill="#6ee7b7" stroke="#047857" strokeWidth="1.5" className="drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
              <circle cx="-1.5" cy="-1.5" r="1" fill="#fff" opacity="0.8" />
            </g>
          </g>
        );
      case 'phoenix_amulet':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            {/* Chain */}
            <path d="M -22 -6 Q 0 16 22 -6" fill="none" stroke="#ea580c" strokeWidth="2.2" />
            <path d="M -22 -6 Q 0 16 22 -6" fill="none" stroke="#f97316" strokeWidth="0.8" />
            
            {/* Amulet Center */}
            <g transform="translate(0, 8)" className="drop-shadow-[0_0_8px_rgba(234,88,12,0.95)]">
              {/* Flame aura shape */}
              <path d="M 0,-10 C -6,-4 -8,0 -8,5 C -8,10 -4,12 0,12 C 4,12 8,10 8,5 C 8,0 6,-4 0,-10 Z" fill="#ea580c" className="animate-fire-glow" />
              {/* Glowing Ruby Core */}
              <polygon points="0,-6 -5,1 0,8 5,1" fill="#fef08a" stroke="#f97316" strokeWidth="1" />
              
              {/* Floating embers (little animated circles) */}
              <circle cx="-5" cy="-8" r="1.5" fill="#f97316" className="animate-phoenix-ember" style={{ animationDelay: '0ms' }} />
              <circle cx="5" cy="-12" r="1.2" fill="#fbbf24" className="animate-phoenix-ember" style={{ animationDelay: '300ms' }} />
              <circle cx="0" cy="-15" r="1.8" fill="#ef4444" className="animate-phoenix-ember" style={{ animationDelay: '600ms' }} />
            </g>
          </g>
        );
      case 'ruby_pendant':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <path d="M -22 -6 Q 0 14 22 -6" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <g transform="translate(0, 7)">
              <g className="animate-ruby">
                <path d="M 0,-4 C -3,-8 -8,-8 -8,-4 C -8,-1 0,5 0,7 C 0,5 8,-1 8,-4 C 8,-8 3,-8 0,-4 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                <circle cx="-2" cy="-4" r="1.5" fill="#fff" opacity="0.7" />
              </g>
            </g>
          </g>
        );
      case 'crystal_collar':
        return (
          <g transform={`translate(${cx}, ${cy})`}>
            <path d="M -20 -4 Q 0 10 20 -4" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            <path d="M -20 -4 Q 0 10 20 -4" fill="none" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
            <g className="animate-crystal">
              <polygon points="0,5 -3,11 0,16 3,11" fill="#bae6fd" stroke="#0284c7" strokeWidth="0.8" />
              <polygon points="-8,3 -10,8 -8,12 -6,8" fill="#bae6fd" stroke="#0284c7" strokeWidth="0.8" transform="rotate(-15, -8, 3)" />
              <polygon points="8,3 6,8 8,12 10,8" fill="#bae6fd" stroke="#0284c7" strokeWidth="0.8" transform="rotate(15, 8, 3)" />
            </g>
          </g>
        );
      default:
        return null;
    }
  };

  // Cosmetic Renderer: Shoes (Rendered on top of feet)
  const renderShoes = (leftCx: number, rightCx: number, cy: number) => {
    const shoes = equippedCosmetics.shoes;
    if (!shoes) return null;

    switch (shoes) {
      case 'lightning_cleats':
        return (
          <g>
            {/* Left Cleat */}
            <g transform={`translate(${leftCx}, ${cy})`}>
              <path d="M -11 -6 L -11 3 C -11 6, -8 7, 2 7 C 9 7, 11 5, 11 1 C 11 -2, 6 -3, 6 -6 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <path d="M -11 3 L 11 3" stroke="#eab308" strokeWidth="2.5" />
              {/* Animated Jagged Lightning */}
              <g className="animate-spark-flash" transform="translate(0, -6)">
                <path d="M -6 0 L 0 -8 L -2 -3 L 6 -12 L 0 -4 L 2 -8 Z" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
              </g>
            </g>
            {/* Right Cleat */}
            <g transform={`translate(${rightCx}, ${cy})`}>
              <g transform="scale(-1, 1)">
                <path d="M -11 -6 L -11 3 C -11 6, -8 7, 2 7 C 9 7, 11 5, 11 1 C 11 -2, 6 -3, 6 -6 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                <path d="M -11 3 L 11 3" stroke="#eab308" strokeWidth="2.5" />
                {/* Animated Jagged Lightning */}
                <g className="animate-spark-flash" transform="translate(0, -6)" style={{ animationDelay: '200ms' }}>
                  <path d="M -6 0 L 0 -8 L -2 -3 L 6 -12 L 0 -4 L 2 -8 Z" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
                </g>
              </g>
            </g>
          </g>
        );
      case 'hover_boots':
        return (
          <g>
            {/* Left Boot */}
            <g transform={`translate(${leftCx}, ${cy})`}>
              <g transform="translate(0, 6)">
                <g className="animate-hover-boot">
                  <path d="M -6 0 Q 0 16 6 0 Q 3 8 0 4 Q -3 8 -6 0" fill="#f97316" />
                  <path d="M -3 0 Q 0 10 3 0" fill="#f59e0b" />
                </g>
              </g>
              <path d="M -12 -8 L -12 2 C -12 6, -6 6, 2 6 C 10 6, 12 4, 12 0 L 12 -4 L 6 -4 L 6 -8 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
              <rect x="-8" y="-6" width="10" height="2" fill="#0891b2" />
            </g>
            {/* Right Boot */}
            <g transform={`translate(${rightCx}, ${cy})`}>
              <g transform="translate(0, 6)">
                <g className="animate-hover-boot">
                  <path d="M -6 0 Q 0 16 6 0 Q 3 8 0 4 Q -3 8 -6 0" fill="#f97316" />
                  <path d="M -3 0 Q 0 10 3 0" fill="#f59e0b" />
                </g>
              </g>
              <path d="M -12 -4 L -12 0 C -12 4, -10 6, -2 6 C 6 6, 12 6, 12 2 L 12 -8 L 6 -8 L 6 -4 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
              <rect x="-2" y="-6" width="10" height="2" fill="#0891b2" />
            </g>
          </g>
        );
      case 'golden_sneakers':
        return (
          <g>
            {/* Left Sneaker */}
            <g transform={`translate(${leftCx}, ${cy})`}>
              <g transform="translate(-10, -6)">
                <g className="animate-sneaker-wing">
                  <path d="M 0 0 C -6 -6, -12 -2, -10 4 C -6 2, -2 2, 0 0" fill="#fff" stroke="#d97706" strokeWidth="1" />
                  <path d="M 0 2 C -4 -2, -8 0, -7 4" fill="none" stroke="#d97706" strokeWidth="0.8" />
                </g>
              </g>
              <path d="M -11 -6 L -11 3 C -11 6, -8 7, 2 7 C 9 7, 11 5, 11 1 C 11 -2, 6 -3, 6 -6 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <path d="M -11 3 L 11 3" stroke="#fff" strokeWidth="2.5" />
              <line x1="-3" y1="-3" x2="3" y2="-1" stroke="#fff" strokeWidth="1.5" />
              <line x1="-1" y1="-6" x2="5" y2="-4" stroke="#fff" strokeWidth="1.5" />
            </g>
            {/* Right Sneaker */}
            <g transform={`translate(${rightCx}, ${cy})`}>
              <g transform="translate(10, -6) scale(-1, 1)">
                <g className="animate-sneaker-wing">
                  <path d="M 0 0 C -6 -6, -12 -2, -10 4 C -6 2, -2 2, 0 0" fill="#fff" stroke="#d97706" strokeWidth="1" />
                  <path d="M 0 2 C -4 -2, -8 0, -7 4" fill="none" stroke="#d97706" strokeWidth="0.8" />
                </g>
              </g>
              <path d="M -11 -6 L -6 -3 C -6 -2, -11 -2, -11 1 C -11 5, -9 7, -2 7 C 8 7, 11 3, 11 -6 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <path d="M -11 3 L 11 3" stroke="#fff" strokeWidth="2.5" />
              <line x1="-3" y1="-1" x2="3" y2="-3" stroke="#fff" strokeWidth="1.5" />
              <line x1="-5" y1="-4" x2="1" y2="-6" stroke="#fff" strokeWidth="1.5" />
            </g>
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
    <div className={cn(
      "relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center",
      className || "min-h-[300px]"
    )}>
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

      {/* Mascot Layer - made completely responsive using w-[82%] h-[82%] aspect-square */}
      <div className={cn(
        "relative w-[82%] h-[82%] aspect-square z-20 transition-all duration-300 select-none flex items-center justify-center",
        isSleeping && "brightness-75"
      )}>
        {renderPetMascot()}
      </div>
    </div>
  );
}
