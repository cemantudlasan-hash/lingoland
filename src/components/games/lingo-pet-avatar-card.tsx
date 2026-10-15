'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LINGOPET_DATA, getEvolutionPetMeta } from '@/lib/pet-config';
import { UserPet, LingoPetType } from '@/lib/types';
import { LingoPet3D } from '@/components/games/lingo-pet-3d';
import { Heart, Zap, Sparkles, ChevronRight, Check, Shuffle, X, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface LingoPetAvatarCardProps {
  pet: UserPet;
  onPet?: () => void;
  onFeed?: () => void;
  isPetting?: boolean;
  isSleeping?: boolean;
  isTalking?: boolean;
  className?: string;
  onSwitchMode?: () => void;
  isEditingName?: boolean;
  tempPetName?: string;
  setTempPetName?: (val: string) => void;
  handleSavePetName?: () => void;
  handleRandomizeName?: () => void;
  setIsEditingName?: (val: boolean) => void;
  personalityMeta?: { name: string; icon: string; badgeClass: string };
  onPersonalityClick?: () => void;
}

export function LingoPetAvatarCard({
  pet,
  onPet,
  onFeed,
  isPetting = false,
  isSleeping = false,
  isTalking = false,
  className,
  onSwitchMode,
  isEditingName = false,
  tempPetName = '',
  setTempPetName,
  handleSavePetName,
  handleRandomizeName,
  setIsEditingName,
  personalityMeta,
  onPersonalityClick,
}: LingoPetAvatarCardProps) {
  const [localInteracting, setLocalInteracting] = useState(false);
  const [localSpeech, setLocalSpeech] = useState<string | null>(null);

  const meta = getEvolutionPetMeta(pet.petType);
  const starter = meta?.starter || LINGOPET_DATA[pet.starterLine || 'floby'] || LINGOPET_DATA.floby;
  const currentStage = meta?.stage || starter.stages.tier1;

  const handlePetAction = () => {
    setLocalInteracting(true);
    setLocalSpeech(`*Purrs happily!* +10 Mood! You're an incredible study partner! ✨`);
    setTimeout(() => {
      setLocalInteracting(false);
    }, 1200);
    if (onPet) onPet();
  };

  const handleFeedAction = () => {
    setLocalSpeech(`Yum! Restored +15 Energy! Ready for more English challenges! ⚡`);
    if (onFeed) onFeed();
  };

  const speechText = localSpeech || (
    isSleeping
      ? "Zzz... Resting to regain energy. Wake me up with a quiz!"
      : isTalking
      ? "I love learning with you! Let's conquer another quiz milestone!"
      : `Ready for ${starter.element} practice! Let's level up together!`
  );

  return (
    <div className={cn(
      "w-full rounded-3xl bg-[#0b0f19] border border-[#1e293b] p-5 md:p-6 shadow-2xl text-white font-sans relative overflow-hidden transition-all duration-500",
      className
    )}>
      {/* Dynamic Element Ambient Glow */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[100px] opacity-25 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: starter.color }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: starter.color }}
      />

      {/* Header Info */}
      <div className="flex justify-between items-start mb-4 relative z-10 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isEditingName && setTempPetName && handleSavePetName && setIsEditingName ? (
              <div className="flex items-center gap-1 bg-slate-950 border border-indigo-500/60 rounded-xl p-1 shadow-lg">
                <input
                  type="text"
                  value={tempPetName}
                  onChange={(e) => setTempPetName(e.target.value)}
                  placeholder="Pet nickname..."
                  maxLength={20}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePetName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  className="bg-transparent text-xs sm:text-sm font-black text-white px-2 py-0.5 focus:outline-none w-28 sm:w-36"
                />
                {handleRandomizeName && (
                  <button
                    type="button"
                    onClick={handleRandomizeName}
                    title="Randomize cute name"
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-300 transition-colors"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSavePetName}
                  title="Save name"
                  className="p-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  title="Cancel"
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/name">
                <h2 className="text-xl md:text-2xl font-black tracking-wide text-white drop-shadow-md">
                  {pet.petName || currentStage.title}
                </h2>
                {setIsEditingName && (
                  <button
                    type="button"
                    onClick={() => {
                      if (setTempPetName) setTempPetName(pet.petName);
                      setIsEditingName(true);
                    }}
                    title="Rename your companion"
                    className="text-slate-500 hover:text-indigo-400 opacity-60 group-hover/name:opacity-100 transition-all p-1 hover:bg-slate-800/60 rounded-md"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            <span
              className="text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-sm uppercase tracking-wider"
              style={{
                backgroundColor: `${starter.color}15`,
                borderColor: `${starter.color}40`,
                color: starter.color
              }}
            >
              {starter.element}
            </span>

            {personalityMeta && onPersonalityClick && (
              <button
                type="button"
                onClick={onPersonalityClick}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm",
                  personalityMeta.badgeClass
                )}
                title="Click to view personality"
              >
                <span>{personalityMeta.icon}</span>
                <span className="truncate max-w-[100px]">{personalityMeta.name}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {currentStage.desc}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border animate-pulse shadow-sm"
            style={{
              backgroundColor: `${starter.color}20`,
              borderColor: `${starter.color}50`,
              color: starter.color
            }}
          >
            ● 3D Active Avatar
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] font-bold text-slate-300">
            <span>✨</span> Drag to Rotate
          </span>
        </div>
      </div>

      {/* Main Avatar Showcase Viewport */}
      <div className="relative w-full h-80 sm:h-88 rounded-2xl bg-gradient-to-b from-[#131b2e] via-[#0d1424] to-[#090d16] border border-slate-800/80 flex items-center justify-center overflow-hidden group shadow-inner">
        {/* Ambient Pedestal Light */}
        <div
          className="absolute bottom-6 w-56 h-10 rounded-full blur-xl opacity-50 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: starter.color }}
        />
        <div
          className="absolute bottom-9 w-36 h-4 rounded-full blur-sm opacity-70 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: starter.color }}
        />

        {/* Floating Speech Bubble */}
        <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl max-w-[80%] pointer-events-none">
          <p className="text-xs text-slate-100 font-semibold leading-relaxed flex items-start gap-1.5">
            <span className="shrink-0 text-sm">💬</span>
            <span className="line-clamp-2">{speechText}</span>
          </p>
          <div className="absolute left-6 -bottom-1.5 w-3 h-3 bg-slate-900 border-r border-b border-slate-700/80 rotate-45" />
        </div>

        {/* Ultra-Realistic 3D / 4D / 5D Interactive WebGL Mascot with Wearable Equipment */}
        <div
          onClick={handlePetAction}
          className="relative w-full h-full z-10 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        >
          <LingoPet3D
            petType={pet.petType}
            level={pet.level}
            energy={pet.energy}
            mood={pet.mood}
            equippedCosmetics={pet.equippedCosmetics}
            isPetting={localInteracting || isPetting}
            isSleeping={isSleeping}
            isTalking={isTalking}
            className="w-full h-full min-h-[300px]"
          />
        </div>

        {/* Sleep Zzz Overlay */}
        {isSleeping && (
          <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-20">
            <div className="absolute top-1/4 right-1/4 flex flex-col gap-1 text-slate-300 font-black text-xl select-none">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>Z</span>
              <span className="animate-bounce ml-3 text-2xl" style={{ animationDelay: '300ms' }}>z</span>
              <span className="animate-bounce ml-6 text-3xl" style={{ animationDelay: '600ms' }}>z</span>
            </div>
          </div>
        )}

        {/* Stage Stat Power Badge in Viewport */}
        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-3 py-1 rounded-xl text-xs font-mono font-bold text-emerald-400 shadow-lg flex items-center gap-1.5 z-20">
          <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span>{currentStage.bonus}</span>
        </div>

        {/* Pet Name & Tier Watermark in Viewport */}
        <div className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider text-slate-500 z-20">
          Tier {currentStage.tier} • {currentStage.title}
        </div>
      </div>

      {/* Pet Stats Progress Bars */}
      <div className="mt-5 space-y-3">
        {/* Energy */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Energy (Consistency)
            </span>
            <span className="font-mono text-slate-200">{pet.energy} / 100</span>
          </div>
          <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
              style={{ width: `${Math.max(0, Math.min(100, pet.energy))}%` }}
            />
          </div>
        </div>

        {/* Intelligence / Mastery */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Intelligence (Platform Accuracy)
            </span>
            <span className="font-mono text-slate-200">{pet.intelligence} / 100</span>
          </div>
          <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
            <div
              className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${Math.max(0, Math.min(100, pet.intelligence))}%` }}
            />
          </div>
        </div>

        {/* Mood */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" /> Mood (Happiness)
            </span>
            <span className="font-mono text-slate-200">{pet.mood} / 100</span>
          </div>
          <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
              style={{ width: `${Math.max(0, Math.min(100, pet.mood))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={handlePetAction}
          disabled={isSleeping}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-sm font-bold text-slate-200 hover:text-white transition-all active:scale-95 disabled:opacity-50 shadow-md"
        >
          <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
          <span>Pet Mascot (+Mood)</span>
        </button>
        <button
          onClick={handleFeedAction}
          disabled={isSleeping}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 shadow-md"
        >
          <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
          <span>Feed Snack (15 🪙)</span>
        </button>
      </div>
    </div>
  );
}
