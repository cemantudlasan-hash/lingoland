export interface PetStageData {
  id: string;
  stageKey: string;
  title: string;
  image: string;
  bonus: string;
  desc: string;
  tier: 1 | 2 | 3;
}

export interface StarterTreeData {
  id: 'floby' | 'pip' | 'igni';
  name: string;
  element: string;
  color: string;
  glowColor: string;
  stages: Record<string, PetStageData>;
}

export const LINGOPET_DATA: Record<string, StarterTreeData> = {
  floby: {
    id: "floby",
    name: "Floby",
    element: "Earth & Vocabulary",
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.4)",
    stages: {
      tier1: {
        id: "floby",
        stageKey: "tier1",
        title: "Floby",
        image: "/lingopets/floby.png",
        bonus: "+5% Quiz Score",
        desc: "Curious seedling clutching the letter A.",
        tier: 1,
      },
      // Branch A: Study Track
      tier2_study: {
        id: "tome-tortoise",
        stageKey: "tier2_study",
        title: "Tome-Tortoise",
        image: "/lingopets/tome-tortoise.png",
        bonus: "+15% Vocab Recall",
        desc: "Carrying ancestral knowledge and scrolls.",
        tier: 2,
      },
      tier3_study: {
        id: "lore-drake",
        stageKey: "tier3_study",
        title: "Lore-Drake",
        image: "/lingopets/lore-drake.png",
        bonus: "+20% Vocab Recall & Double Quiz Coins",
        desc: "Majestic guardian surrounded by flying runes.",
        tier: 3,
      },
      // Branch B: Speed / Arcade Track
      tier2_arcade: {
        id: "seed-rooter",
        stageKey: "tier2_arcade",
        title: "Seed-Rooter",
        image: "/lingopets/seed-rooter.png",
        bonus: "+10% Speed Trivia",
        desc: "Rapid runner equipped with an explorer pack.",
        tier: 2,
      },
      tier3_arcade: {
        id: "terra-keeper",
        stageKey: "tier3_arcade",
        title: "Terra-Keeper",
        image: "/lingopets/terra-keeper.png",
        bonus: "+15% Speed Trivia & +10% Energy Recovery",
        desc: "Forest colossus wielding a golden fountain pen.",
        tier: 3,
      }
    }
  },
  pip: {
    id: "pip",
    name: "Pip",
    element: "Air & Phonics",
    color: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.4)",
    stages: {
      tier1: {
        id: "pip",
        stageKey: "tier1",
        title: "Pip",
        image: "/lingopets/pip.png",
        bonus: "+5% Listening Score",
        desc: "Fluffy chick with oversized studio headphones.",
        tier: 1,
      },
      tier2_phonics: {
        id: "echo-grif",
        stageKey: "tier2_phonics",
        title: "Echo-Grif",
        image: "/lingopets/echo-grif.png",
        bonus: "+15% Speech Accuracy",
        desc: "Griffin fledgling with soundwave plumage.",
        tier: 2,
      },
      tier3_phonics: {
        id: "acu-maestro",
        stageKey: "tier3_phonics",
        title: "Acu-Maestro",
        image: "/lingopets/acu-maestro.png",
        bonus: "+25% Speech Accuracy & Aura of Pronunciation",
        desc: "Grand acoustic beast commanding symphonic waves.",
        tier: 3,
      },
      tier2_speed: {
        id: "chirp-wing",
        stageKey: "tier2_speed",
        title: "Chirp-Wing",
        image: "/lingopets/chirp-wing.png",
        bonus: "+10% Listening Speed",
        desc: "Swift avian leaving azure trails in flight.",
        tier: 2,
      },
      tier3_speed: {
        id: "sonic-storm",
        stageKey: "tier3_speed",
        title: "Sonic-Storm",
        image: "/lingopets/sonic-storm.png",
        bonus: "+15% Listening Score & +20% Quiz XP",
        desc: "Radiant storm-bird composed of pure harmonic sound.",
        tier: 3,
      }
    }
  },
  igni: {
    id: "igni",
    name: "Igni",
    element: "Fire & Grammar",
    color: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.4)",
    stages: {
      tier1: {
        id: "igni",
        stageKey: "tier1",
        title: "Igni",
        image: "/lingopets/igni.png",
        bonus: "+5% Grammar Quests",
        desc: "Sparks fly when excited, apprentice wizard cap.",
        tier: 1,
      },
      tier2_grammar: {
        id: "spark-fox",
        stageKey: "tier2_grammar",
        title: "Spark-Fox",
        image: "/lingopets/spark-fox.png",
        bonus: "+15% Grammar Quests",
        desc: "Sleek flame fox surrounded by punctuation runes.",
        tier: 2,
      },
      tier3_grammar: {
        id: "rune-stalker",
        stageKey: "tier3_grammar",
        title: "Rune-Stalker",
        image: "/lingopets/rune-stalker.png",
        bonus: "+30% Grammar Quests & Flaming Chat Aura",
        desc: "Mystic beast draped in ancient syntactic scrolls.",
        tier: 3,
      },
      tier2_arcade: {
        id: "ember-scribe",
        stageKey: "tier2_arcade",
        title: "Ember-Scribe",
        image: "/lingopets/ember-scribe.png",
        bonus: "+10% Arcade Speed",
        desc: "Mischievous ferret writing spark glyphs.",
        tier: 2,
      },
      tier3_arcade: {
        id: "pyro-phoenix",
        stageKey: "tier3_arcade",
        title: "Pyro-Phoenix",
        image: "/lingopets/pyro-phoenix.png",
        bonus: "+15% Arcade Speed & Free Skip Token",
        desc: "Immortal firebird igniting words into living spells.",
        tier: 3,
      }
    }
  }
};

/**
 * Lookup helper to find the stage data and starter tree from any petType string
 */
export function getEvolutionPetMeta(petType: string): { starter: StarterTreeData; stage: PetStageData } | null {
  const normType = petType.toLowerCase().replace(/_/g, '-');
  for (const starterKey of Object.keys(LINGOPET_DATA)) {
    const starter = LINGOPET_DATA[starterKey];
    for (const stageKey of Object.keys(starter.stages)) {
      const stage = starter.stages[stageKey];
      if (stage.id === normType || stageKey === normType) {
        return { starter, stage };
      }
    }
  }
  return null;
}
