import * as React from 'react';
import { LingoPetType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LingoPet3D } from '@/components/games/lingo-pet-3d';

interface StarterVisualProps {
  petType: LingoPetType;
  level: number;
  energy: number;
  mood: number;
  isSleeping?: boolean;
  isPetting?: boolean;
  isTalking?: boolean;
  equippedCosmetics?: {
    hat?: string;
    glasses?: string;
    necklace?: string;
    shoes?: string;
    wings?: string;
    costume?: string;
  };
  className?: string;
}

export const STARTER_PET_TYPES: LingoPetType[] = [
  'floby', 'tome-tortoise', 'lore-drake', 'seed-rooter', 'terra-keeper',
  'pip', 'echo-grif', 'acu-maestro', 'chirp-wing', 'sonic-storm',
  'igni', 'spark-fox', 'rune-stalker', 'ember-scribe', 'pyro-phoenix'
];

export function StarterPetRenderer({
  petType,
  level,
  energy,
  mood,
  isSleeping = false,
  isPetting = false,
  isTalking = false,
  equippedCosmetics = {},
  className = ''
}: StarterVisualProps) {
  if (!STARTER_PET_TYPES.includes(petType)) {
    return null;
  }

  // Dynamic Element Accent Glow
  const elementColor = 
    ['floby', 'tome-tortoise', 'lore-drake', 'seed-rooter', 'terra-keeper'].includes(petType)
      ? '#22c55e'
      : ['pip', 'echo-grif', 'acu-maestro', 'chirp-wing', 'sonic-storm'].includes(petType)
      ? '#38bdf8'
      : '#f97316';

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center select-none overflow-hidden group", className)}>
      {/* Subtle Pedestal Glow */}
      <div 
        className="absolute bottom-1 w-3/4 h-2 rounded-full blur-md opacity-40 transition-opacity group-hover:opacity-75"
        style={{ backgroundColor: elementColor }}
      />
      <LingoPet3D
        petType={petType}
        level={level}
        energy={energy}
        mood={mood}
        equippedCosmetics={equippedCosmetics}
        isSleeping={isSleeping}
        isPetting={isPetting}
        isTalking={isTalking}
        hideHint={true}
        className="w-full h-full"
      />
    </div>
  );
}