import { LingoPetType, StarterLine, EvolutionBranch, PetLearningStats, UserPet } from '@/lib/types';

export interface PetEvolutionNode {
  id: LingoPetType;
  name: string;
  speciesName: string;
  tier: 1 | 2 | 3;
  branch?: EvolutionBranch;
  branchName?: string;
  focus: string;
  triggerCondition: string;
  description: string;
  statBonusTitle: string;
  statBonusDesc: string;
  themeColor: string;
  badgeBg: string;
  badgeBorder: string;
  icon: string;
}

export interface StarterTree {
  id: StarterLine;
  name: string;
  element: string;
  learningFocus: string;
  lore: string;
  icon: string;
  accentColor: string;
  bannerGradient: string;
  tier1: PetEvolutionNode;
  branchA: {
    trackName: string;
    triggerSummary: string;
    tier2: PetEvolutionNode;
    tier3: PetEvolutionNode;
  };
  branchB: {
    trackName: string;
    triggerSummary: string;
    tier2: PetEvolutionNode;
    tier3: PetEvolutionNode;
  };
}

export const STARTER_TREES: Record<StarterLine, StarterTree> = {
  floby: {
    id: 'floby',
    name: 'FLOBY',
    element: 'Earth & Vocabulary Line',
    learningFocus: 'Vocabulary memory, reading comprehension, and study diligence.',
    lore: 'Nurtured in the Lexicon Groves, Floby absorbs vocabulary root words from ancient soil.',
    icon: '🌿',
    accentColor: '#10b981',
    bannerGradient: 'from-emerald-950 via-teal-900 to-green-950',
    tier1: {
      id: 'floby',
      name: 'Floby',
      speciesName: 'The Seedling',
      tier: 1,
      focus: 'Vocabulary Seedling',
      triggerCondition: 'Starter Companion Selection',
      description: "A tiny, round, acorn-like creature with sprouts on its head, big curious eyes, and clutching a tiny letter 'A'. It carries a tiny leaf backpack.",
      statBonusTitle: 'Vocab Bud',
      statBonusDesc: '+5% quiz score bonus on all vocabulary exercises.',
      themeColor: '#10b981',
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/30 text-emerald-300',
      icon: '🌱'
    },
    branchA: {
      trackName: 'Study Track (Lexicon & Books)',
      triggerSummary: 'High Vocab Quiz Scores & Mastered Lexicon Words',
      tier2: {
        id: 'tome-tortoise',
        name: 'Tome-Tortoise',
        speciesName: 'The Lexicon Scholar',
        tier: 2,
        branch: 'A',
        branchName: 'Study Track',
        focus: 'Vocabulary Study & Memory Retention',
        triggerCondition: 'High Vocab Quiz Score (≥80% Avg) & 20+ Mastered Words',
        description: "A chunky, armored tortoise wearing a small explorer's backpack, with leafy, scroll-like plates on its shell. It holds a magnifying glass and can often be seen resting on a book.",
        statBonusTitle: 'Lexicon Armor',
        statBonusDesc: '+12% Vocab Recall & immune to first quiz mistake daily.',
        themeColor: '#10b981',
        badgeBg: 'bg-emerald-500/20',
        badgeBorder: 'border-emerald-500/40 text-emerald-300',
        icon: '🐢'
      },
      tier3: {
        id: 'lore-drake',
        name: 'Lore-Drake',
        speciesName: 'The Sovereign Lexicon Dragon',
        tier: 3,
        branch: 'A',
        branchName: 'Study Track',
        focus: 'Comprehensive Lexicon Mastery',
        triggerCondition: 'Mastering Lexicon Unit & Level 30+ (Study Track)',
        description: "A majestic, gentle dragon-like beast with wings and back plates made of old books and leafy foliage. Surrounded by glowing, floating alphabets, it wears spectacles and carries a spellbook on its side.",
        statBonusTitle: 'Universal Scholar',
        statBonusDesc: '+20% Vocab Recall, Double Daily Quiz Coins, and glowing alphabet runes.',
        themeColor: '#059669',
        badgeBg: 'bg-emerald-500/25',
        badgeBorder: 'border-emerald-400 text-emerald-200',
        icon: '🐉'
      }
    },
    branchB: {
      trackName: 'Speed & Arcade Track',
      triggerSummary: 'Speed Play & Flashcard mini-games',
      tier2: {
        id: 'seed-rooter',
        name: 'Seed-Rooter',
        speciesName: 'The Flashcard Sprinter',
        tier: 2,
        branch: 'B',
        branchName: 'Arcade Track',
        focus: 'Rapid Vocab Recall & Speed Games',
        triggerCondition: 'Arcade Play & Speed Flashcards (15+ completed games)',
        description: 'A speedy, badger/squirrel-like creature with busy tails made of thick grass, always clutching an open diary or notebook.',
        statBonusTitle: 'Swift Scribe',
        statBonusDesc: '+10% Speed Trivia response timer & +5% energy conservation.',
        themeColor: '#84cc16',
        badgeBg: 'bg-lime-500/20',
        badgeBorder: 'border-lime-500/40 text-lime-300',
        icon: '🐿️'
      },
      tier3: {
        id: 'terra-keeper',
        name: 'Terra-Keeper',
        speciesName: 'The Golden Quill Guardian',
        tier: 3,
        branch: 'B',
        branchName: 'Arcade Track',
        focus: 'Nature Guardian of Speed Vocab',
        triggerCondition: 'Speed Trivia High Streaks & Level 30+ (Arcade Track)',
        description: "A large, friendly forest Guardian draped in flowering vines and moss, wielding a massive golden fountain pen staff to 'write' on the ground.",
        statBonusTitle: 'Natural Pacer',
        statBonusDesc: '+15% Speed Trivia, +10% Energy Recovery rate, and golden vine write-trail.',
        themeColor: '#65a30d',
        badgeBg: 'bg-lime-500/25',
        badgeBorder: 'border-lime-400 text-lime-200',
        icon: '🌳'
      }
    }
  },

  pip: {
    id: 'pip',
    name: 'PIP',
    element: 'Air & Phonics Line',
    learningFocus: 'Speaking, listening, and accurate pronunciation.',
    lore: 'Born in the Acoustic Zephyrs, Pip captures every nuanced phoneme with supersonic ears.',
    icon: '🎵',
    accentColor: '#0ea5e9',
    bannerGradient: 'from-sky-950 via-cyan-900 to-blue-950',
    tier1: {
      id: 'pip',
      name: 'Pip',
      speciesName: 'The Songbird',
      tier: 1,
      focus: 'Phonics & Listening',
      triggerCondition: 'Starter Companion Selection',
      description: 'A fluffy, round blue chick with tiny wing-buds and huge, oversized headphones on its head. It chirps with soundwave patterns when happy.',
      statBonusTitle: 'Eartune',
      statBonusDesc: '+5% listening exercise bonus & audio playback speed controls.',
      themeColor: '#0ea5e9',
      badgeBg: 'bg-sky-500/15',
      badgeBorder: 'border-sky-500/30 text-sky-300',
      icon: '🐥'
    },
    branchA: {
      trackName: 'Listening & Pronunciation Track',
      triggerSummary: 'Phonics challenges and speaking achievements',
      tier2: {
        id: 'echo-grif',
        name: 'Echo-Grif',
        speciesName: 'The Phonic Griffin',
        tier: 2,
        branch: 'A',
        branchName: 'Pronunciation Track',
        focus: 'Vocal Phoneme Accuracy & Nuance',
        triggerCondition: 'Pronunciation Milestones (20+ speech tasks ≥85% accuracy)',
        description: 'A proud, small griffin with feathery headphones and wingtips shaped like soundwaves, vocalizing with expressive, singing chirps.',
        statBonusTitle: 'Sonic Resonance',
        statBonusDesc: '+12% Speaking Accuracy & highlights subtle phoneme flaws.',
        themeColor: '#38bdf8',
        badgeBg: 'bg-cyan-500/20',
        badgeBorder: 'border-cyan-500/40 text-cyan-300',
        icon: '🦅'
      },
      tier3: {
        id: 'acu-maestro',
        name: 'Acu-Maestro',
        speciesName: 'The Harmonic Grand Griffin',
        tier: 3,
        branch: 'A',
        branchName: 'Pronunciation Track',
        focus: 'Speech Master Vocal Orchestra',
        triggerCondition: 'Speech Master Unlock & Level 30+ (Listening Track)',
        description: 'A magnificent, lion-griffin beast with large acoustic/musical soundwave-patterned wings, metallic feathers, and floating audio-visual magical trails like musical bars.',
        statBonusTitle: 'Grand Vocalist',
        statBonusDesc: '+25% Speech Accuracy & active "Aura of Pronunciation" real-time correction guide.',
        themeColor: '#0284c7',
        badgeBg: 'bg-sky-500/25',
        badgeBorder: 'border-sky-400 text-sky-200',
        icon: '🦁'
      }
    },
    branchB: {
      trackName: 'Speed & Sprint Performance Track',
      triggerSummary: 'Listening Streak and timed phonics sprints',
      tier2: {
        id: 'chirp-wing',
        name: 'Chirp-Wing',
        speciesName: 'The Sonic Swiftbird',
        tier: 2,
        branch: 'B',
        branchName: 'Performance Track',
        focus: 'High-Tempo Listening & Reaction Sprints',
        triggerCondition: 'Listening Streak (7-day daily audio challenge & timed runs)',
        description: 'A swift, sleek blue bird with sonic trails behind its tail, always in motion.',
        statBonusTitle: 'Audio Jet',
        statBonusDesc: '+10% audio sprint score & instant audio replay without penalty.',
        themeColor: '#60a5fa',
        badgeBg: 'bg-blue-500/20',
        badgeBorder: 'border-blue-500/40 text-blue-300',
        icon: '🕊️'
      },
      tier3: {
        id: 'sonic-storm',
        name: 'Sonic-Storm',
        speciesName: 'The Azure Tempest Phoenix',
        tier: 3,
        branch: 'B',
        branchName: 'Performance Track',
        focus: 'Sound Wave Flight & Timed Phonics Mastery',
        triggerCondition: 'Sonic Sprint Master & Level 30+ (Sprint Track)',
        description: 'A sleek, phoenix-like bird made of azure wind and sound waves, with glowing musical notes trailing its flight.',
        statBonusTitle: 'Resonance',
        statBonusDesc: '+15% Listening Score, +20% Quiz XP bonus, and floating musical bar trail.',
        themeColor: '#3b82f6',
        badgeBg: 'bg-blue-500/25',
        badgeBorder: 'border-blue-400 text-blue-200',
        icon: '🪶'
      }
    }
  },

  igni: {
    id: 'igni',
    name: 'IGNI',
    element: 'Fire & Grammar Line',
    learningFocus: 'Sentence structure, typing, creative writing, and gamified challenges.',
    lore: 'Sparked within the Forge of Syntax, Igni illuminates complex grammar rules with fiery quills.',
    icon: '🔥',
    accentColor: '#f97316',
    bannerGradient: 'from-amber-950 via-orange-950 to-red-950',
    tier1: {
      id: 'igni',
      name: 'Igni',
      speciesName: 'The Sparks',
      tier: 1,
      focus: 'Grammar & Writing Seed',
      triggerCondition: 'Starter Companion Selection',
      description: "A tiny, fiery kitten with a flame for a tail-tip, wearing a small wizard's apprentice cap. Sparks fly when it's excited.",
      statBonusTitle: 'Quick Spark',
      statBonusDesc: '+5% grammar-based quiz bonus & highlights conjunctions.',
      themeColor: '#f97316',
      badgeBg: 'bg-orange-500/15',
      badgeBorder: 'border-orange-500/30 text-orange-300',
      icon: '🐱'
    },
    branchA: {
      trackName: 'Composition & Sentence Structure Track',
      triggerSummary: 'Multi-sentence building, typing tests, and correct grammar',
      tier2: {
        id: 'spark-fox',
        name: 'Spark-Fox',
        speciesName: 'The Syntax Fox',
        tier: 2,
        branch: 'A',
        branchName: 'Composition Track',
        focus: 'Punctuation, Clauses & Syntax Logic',
        triggerCondition: 'Correct Sentence Writing (25+ correct compound sentences)',
        description: 'A sleek, two-tailed fire fox wearing magical spectacles, carrying scroll cases and surrounded by sparks shaped like punctuation marks (e.g., ! and ?).',
        statBonusTitle: 'Punctuation Glow',
        statBonusDesc: '+12% Sentence Crafting XP & identifies run-on sentences.',
        themeColor: '#fb923c',
        badgeBg: 'bg-orange-500/20',
        badgeBorder: 'border-orange-500/40 text-orange-300',
        icon: '🦊'
      },
      tier3: {
        id: 'rune-stalker',
        name: 'Rune-Stalker',
        speciesName: 'The Ancient Grammar Wolf',
        tier: 3,
        branch: 'A',
        branchName: 'Composition Track',
        focus: 'Mastery of Complex Sentence Patterns',
        triggerCondition: 'Mastery of Sentence Patterns & Level 30+ (Structure Track)',
        description: 'A majestic, flame-furred wolf/fox with ornate scroll-harnesses, glowing rune-like grammar patterns on its back, and a blazing quill-like tail.',
        statBonusTitle: 'Prose Mastery',
        statBonusDesc: '+30% Grammar Quests bonus & unlocks a unique Flaming Chat Bubble Aura.',
        themeColor: '#ea580c',
        badgeBg: 'bg-orange-500/25',
        badgeBorder: 'border-orange-400 text-orange-200',
        icon: '🐺'
      }
    },
    branchB: {
      trackName: 'Arcade & Game Mode Track',
      triggerSummary: 'Daily Streak and Arcade Challenge runs',
      tier2: {
        id: 'ember-scribe',
        name: 'Ember-Scribe',
        speciesName: 'The Flame Ferret Scribe',
        tier: 2,
        branch: 'B',
        branchName: 'Arcade Track',
        focus: 'Rapid Typing & Gamified Syntax Challenges',
        triggerCondition: 'Speed Grammar Challenges & 15+ Arcade Runs',
        description: 'A mischievous fire ferret with ink-stained paws and a blazing quill, always juggling letters and writing spark-patterns.',
        statBonusTitle: 'Ink & Cinder',
        statBonusDesc: '+10% Typing Speed quiz time bonus & extra combo points in arcade games.',
        themeColor: '#f59e0b',
        badgeBg: 'bg-amber-500/20',
        badgeBorder: 'border-amber-500/40 text-amber-300',
        icon: '🦦'
      },
      tier3: {
        id: 'pyro-phoenix',
        name: 'Pyro-Phoenix',
        speciesName: 'The Syntax Firebird',
        tier: 3,
        branch: 'B',
        branchName: 'Arcade Track',
        focus: 'Grammar Blitz & Arcade Mastery',
        triggerCondition: 'Arcade Speed Records & Level 30+ (Game Mode Track)',
        description: 'A grand firebird with scroll-patterned feathers, generating colorful, sparking grammar glyphs from its wings.',
        statBonusTitle: 'Blink Ignite',
        statBonusDesc: '+15% Arcade Speed bonus & 25% chance to earn a "Free Skip Token" on difficult questions.',
        themeColor: '#d97706',
        badgeBg: 'bg-amber-500/25',
        badgeBorder: 'border-amber-400 text-amber-200',
        icon: '🔥'
      }
    }
  }
};

// Flattened dictionary of all 15 pet nodes for quick lookup
export const ALL_EVOLUTION_NODES: Record<string, PetEvolutionNode> = {
  // Floby line
  floby: STARTER_TREES.floby.tier1,
  'tome-tortoise': STARTER_TREES.floby.branchA.tier2,
  'lore-drake': STARTER_TREES.floby.branchA.tier3,
  'seed-rooter': STARTER_TREES.floby.branchB.tier2,
  'terra-keeper': STARTER_TREES.floby.branchB.tier3,
  // Pip line
  pip: STARTER_TREES.pip.tier1,
  'echo-grif': STARTER_TREES.pip.branchA.tier2,
  'acu-maestro': STARTER_TREES.pip.branchA.tier3,
  'chirp-wing': STARTER_TREES.pip.branchB.tier2,
  'sonic-storm': STARTER_TREES.pip.branchB.tier3,
  // Igni line
  igni: STARTER_TREES.igni.tier1,
  'spark-fox': STARTER_TREES.igni.branchA.tier2,
  'rune-stalker': STARTER_TREES.igni.branchA.tier3,
  'ember-scribe': STARTER_TREES.igni.branchB.tier2,
  'pyro-phoenix': STARTER_TREES.igni.branchB.tier3,
};

/**
 * Identify which starter tree a petType belongs to
 */
export function getStarterLineForPet(petType: LingoPetType): StarterLine | null {
  if (['floby', 'tome-tortoise', 'lore-drake', 'seed-rooter', 'terra-keeper'].includes(petType)) {
    return 'floby';
  }
  if (['pip', 'echo-grif', 'acu-maestro', 'chirp-wing', 'sonic-storm'].includes(petType)) {
    return 'pip';
  }
  if (['igni', 'spark-fox', 'rune-stalker', 'ember-scribe', 'pyro-phoenix'].includes(petType)) {
    return 'igni';
  }
  return null;
}

/**
 * Get active pet node details
 */
export function getPetNodeDetails(petType: LingoPetType): PetEvolutionNode | null {
  return ALL_EVOLUTION_NODES[petType] || null;
}

/**
 * Determine eligibility for evolving to target branch and tier based on level and learning behaviors
 */
export function evaluateBranchEligibility(
  pet: UserPet,
  targetBranch: EvolutionBranch,
  targetTier: 2 | 3,
  starterOverride?: StarterLine
): { eligible: boolean; reasons: string[]; currentProgress: number } {
  const starter = starterOverride || pet.starterLine || getStarterLineForPet(pet.petType) || 'floby';
  const tree = STARTER_TREES[starter];
  const stats = pet.learningStats || {};

  const reasons: string[] = [];
  let score = 0;
  let maxScore = 100;

  // Level requirement
  const minLevel = targetTier === 2 ? 15 : 30;
  if (pet.level < minLevel) {
    reasons.push(`Requires companion Level ${minLevel} (Current: ${pet.level})`);
  } else {
    score += 40;
  }

  // Branch-specific learning behavior triggers
  if (starter === 'floby') {
    if (targetBranch === 'A') {
      // Study track: High Vocab Quiz Score & Mastered Words
      const vocabScore = stats.vocabScore || 0;
      const mastered = stats.masteredWords || 0;
      const targetScore = targetTier === 2 ? 75 : 85;
      const targetMastered = targetTier === 2 ? 15 : 35;

      if (vocabScore < targetScore) {
        reasons.push(`Vocab quiz average of ${targetScore}% required (Current: ${vocabScore}%)`);
      } else {
        score += 30;
      }
      if (mastered < targetMastered) {
        reasons.push(`${targetMastered} Mastered Words required (Current: ${mastered})`);
      } else {
        score += 30;
      }
    } else {
      // Arcade track: Speed play & flashcard games
      const speedCount = (stats.speedTriviaPlayed || 0) + (stats.arcadeRuns || 0);
      const targetRuns = targetTier === 2 ? 10 : 25;
      if (speedCount < targetRuns) {
        reasons.push(`${targetRuns} Speed Trivia & Arcade runs required (Current: ${speedCount})`);
      } else {
        score += 60;
      }
    }
  } else if (starter === 'pip') {
    if (targetBranch === 'A') {
      // Phonics & pronunciation track
      const speechAcc = stats.speechAccuracy || 0;
      const targetAcc = targetTier === 2 ? 75 : 85;
      if (speechAcc < targetAcc) {
        reasons.push(`Speech pronunciation accuracy of ${targetAcc}% required (Current: ${speechAcc}%)`);
      } else {
        score += 60;
      }
    } else {
      // Sprint & listening streak track
      const streak = stats.listeningStreak || 0;
      const targetStreak = targetTier === 2 ? 5 : 10;
      if (streak < targetStreak) {
        reasons.push(`${targetStreak}-Day Listening Challenge Streak required (Current: ${streak})`);
      } else {
        score += 60;
      }
    }
  } else if (starter === 'igni') {
    if (targetBranch === 'A') {
      // Composition & sentence structure track
      const sentences = stats.sentenceWritingCount || 0;
      const targetCount = targetTier === 2 ? 15 : 35;
      if (sentences < targetCount) {
        reasons.push(`${targetCount} Validated Compound Sentences required (Current: ${sentences})`);
      } else {
        score += 60;
      }
    } else {
      // Game mode & speed grammar challenges track
      const arcade = (stats.arcadeRuns || 0) + (stats.grammarQuestsCompleted || 0);
      const targetArcade = targetTier === 2 ? 12 : 30;
      if (arcade < targetArcade) {
        reasons.push(`${targetArcade} Speed Grammar runs & Quests required (Current: ${arcade})`);
      } else {
        score += 60;
      }
    }
  }

  const eligible = reasons.length === 0;
  return {
    eligible,
    reasons,
    currentProgress: Math.min(100, Math.max(10, score))
  };
}
