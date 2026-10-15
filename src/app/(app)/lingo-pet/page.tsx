'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { 
  Sparkles, Heart, Zap, Brain, ShoppingBag, MessageSquare, 
  HelpCircle, ChevronRight, Coins, RefreshCw, AlertCircle, Play, Info, Loader2, Lock,
  Edit3, Check, X, Shuffle, Smile, Compass, Wand2, Tag, Egg, UserPlus,
  Target, Trophy, Gamepad2, BookOpen, Star, Award, CheckCircle2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { LingoPet3D } from '@/components/games/lingo-pet-3d';
import { LingoPetVisual } from '@/components/games/lingo-pet-visual';
import { LingoPetAvatarCard } from '@/components/games/lingo-pet-avatar-card';
import { STARTER_PET_TYPES } from '@/components/games/lingo-pet-starters-visual';
import { LingoPetEvolutionTree } from '@/components/games/lingo-pet-evolution-tree';
import { ALL_EVOLUTION_NODES, getStarterLineForPet, evaluateBranchEligibility } from '@/lib/lingo-pet-evolution';
import { generatePetChatResponse } from '@/ai/flows/generate-pet-chat';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserPet, LingoPetType, EvolutionBranch, StarterLine, PetMission } from '@/lib/types';

// Mock Wake-up quiz questions
const WAKEUP_QUESTIONS = [
  {
    question: "Which of the following is a synonym of 'Vast'?",
    options: ["Tiny", "Huge", "Narrow", "Slow"],
    answer: "Huge",
  },
  {
    question: "Complete the sentence: 'She has been ___ English since morning.'",
    options: ["studying", "study", "studied", "studies"],
    answer: "studying",
  },
  {
    question: "What is the antonym of 'Generous'?",
    options: ["Kind", "Selfish", "Happy", "Polite"],
    answer: "Selfish",
  },
  {
    question: "Select the sentence with correct grammar:",
    options: [
      "He don't like apples.",
      "She doesn't likes apples.",
      "He doesn't like apples.",
      "They doesn't like apples."
    ],
    answer: "He doesn't like apples.",
  },
  {
    question: "What does the idiom 'Piece of cake' mean?",
    options: ["Very easy", "Very hard", "A slice of dessert", "A birthday gift"],
    answer: "Very easy",
  },
  {
    question: "What is the antonym of 'Reluctant'?",
    options: ["Eager", "Hesitant", "Slow", "Careful"],
    answer: "Eager",
  },
  {
    question: "Which of the following is a synonym of 'Exquisite'?",
    options: ["Ugly", "Ordinary", "Beautiful", "Old"],
    answer: "Beautiful",
  },
  {
    question: "Complete the sentence: 'By the time the movie started, we ___ our popcorn.'",
    options: ["eat", "have eaten", "had eaten", "will eat"],
    answer: "had eaten",
  },
  {
    question: "Which word is a noun?",
    options: ["Quickly", "Happiness", "Beautiful", "Under"],
    answer: "Happiness",
  },
  {
    question: "What does the idiom 'Bite the bullet' mean?",
    options: ["Eat something hard", "Face a difficult situation with courage", "Shoot a gun", "Give up"],
    answer: "Face a difficult situation with courage",
  },
  {
    question: "Complete the sentence: 'If I ___ you, I would study harder.'",
    options: ["was", "am", "were", "be"],
    answer: "were",
  },
  {
    question: "What does the idiom 'Break a leg' mean?",
    options: ["Get hurt", "Good luck", "Run fast", "Dance well"],
    answer: "Good luck",
  },
  {
    question: "What is the antonym of 'Plentiful'?",
    options: ["Scarce", "Abundant", "Rich", "Green"],
    answer: "Scarce",
  },
  {
    question: "Complete the sentence: 'She is very good ___ playing the piano.'",
    options: ["on", "at", "in", "with"],
    answer: "at",
  },
  {
    question: "Which sentence is in the passive voice?",
    options: [
      "John wrote the letter.",
      "The letter was written by John.",
      "John is writing a letter.",
      "John has written a letter."
    ],
    answer: "The letter was written by John.",
  },
  {
    question: "Which of the following is a synonym of 'Meticulous'?",
    options: ["Lazy", "Messy", "Careful", "Quick"],
    answer: "Careful",
  },
  {
    question: "Complete the sentence: 'I look forward to ___ you soon.'",
    options: ["meet", "meeting", "met", "meets"],
    answer: "meeting",
  },
  {
    question: "What does the idiom 'Spill the beans' mean?",
    options: ["Cook dinner", "Reveal a secret", "Clean the floor", "Drop food"],
    answer: "Reveal a secret",
  },
  {
    question: "What is the antonym of 'Arrogant'?",
    options: ["Proud", "Humble", "Angry", "Loud"],
    answer: "Humble",
  },
  {
    question: "Complete the sentence: 'The weather was bad, ___ they decided to go anyway.'",
    options: ["so", "because", "yet", "although"],
    answer: "yet",
  },
  {
    question: "Which word is spelled correctly?",
    options: ["Acommodate", "Accomodate", "Accommodate", "Acomodate"],
    answer: "Accommodate",
  },
  {
    question: "What does the idiom 'Under the weather' mean?",
    options: ["In the rain", "Feeling slightly sick", "Below the clouds", "Happy"],
    answer: "Feeling slightly sick",
  },
  {
    question: "Complete the sentence: 'He has a lot of influence ___ his younger brother.'",
    options: ["at", "over", "with", "to"],
    answer: "over",
  },
  {
    question: "Which of the following is a synonym of 'Vigilant'?",
    options: ["Sleepy", "Watchful", "Careless", "Strong"],
    answer: "Watchful",
  },
  {
    question: "What is the antonym of 'Amateur'?",
    options: ["Novice", "Professional", "Beginner", "Player"],
    answer: "Professional",
  },
  {
    question: "Which of the following is a relative pronoun?",
    options: ["He", "Who", "Slowly", "Run"],
    answer: "Who",
  },
  {
    question: "Complete the sentence: 'The book ___ I borrowed yesterday is very interesting.'",
    options: ["who", "whose", "which", "where"],
    answer: "which",
  },
  {
    question: "What does the idiom 'Once in a blue moon' mean?",
    options: ["Every night", "Very rarely", "During the day", "Once a month"],
    answer: "Very rarely",
  },
  {
    question: "Complete the sentence: 'He is the ___ of the two brothers.'",
    options: ["tall", "taller", "tallest", "more tall"],
    answer: "taller",
  },
  {
    question: "Which of the following is a synonym of 'Cooperate'?",
    options: ["Compete", "Collaborate", "Argue", "Divide"],
    answer: "Collaborate",
  }
];

export interface PersonalityMeta {
  id: 'cheerleader' | 'scholar' | 'zen' | 'trickster' | 'cyberpunk';
  name: string;
  subtitle: string;
  icon: string;
  badgeClass: string;
  cardGlow: string;
  description: string;
  catchphrase: string;
  sampleGreeting: string;
  petReaction: (petType: string, petName: string) => string;
  feedReaction: (petName: string) => string;
}

const PERSONALITY_ARCHETYPES: Record<string, PersonalityMeta> = {
  cheerleader: {
    id: 'cheerleader',
    name: 'Enthusiastic Cheerleader',
    subtitle: 'High-energy positivity & hype mascot',
    icon: '🌟',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    cardGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    description: 'Brimming with boundless optimism! Celebrates every milestone and lifts your spirits whenever English lessons get tough.',
    catchphrase: '"You are a language superstar! Keep shining bright, Champ!"',
    sampleGreeting: "Woohoo! You're back! Let's conquer some English challenges and level up together, Superstar! 🚀✨",
    petReaction: (type, name) => `*Giggles with pure joy!* That tickles! You're the absolute best study partner ever! Let's crush our goals today! 💖`,
    feedReaction: (name) => `YUMMY! *Jumps up and down!* Mega energy refueled! Now let's show the English world what we're made of! ⚡🔥`
  },
  scholar: {
    id: 'scholar',
    name: 'Sassy Scholar',
    subtitle: 'Witty erudition & grammar lore',
    icon: '🦉',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    cardGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    description: 'Intellectually sharp with a playful dry wit. Appreciates rich vocabulary, clever syntax, and elegant sentence construction.',
    catchphrase: '"Grammar isn’t merely rules; it is an art form, my curious apprentice."',
    sampleGreeting: "Greetings, curious mind. Shall we dissect some intriguing linguistic syntax and idioms today? 📜🔍",
    petReaction: (type, name) => `A pleasant cranial pat. Scientifically speaking, it elevates my contentment metrics by precisely ten points. 🧐✨`,
    feedReaction: (name) => `An exquisite gastronomic contribution. My cognitive faculties are restored to peak analytical efficiency. 📚☕`
  },
  zen: {
    id: 'zen',
    name: 'Zen Master',
    subtitle: 'Mindful calm & peaceful flow',
    icon: '🧘',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    cardGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    description: 'Calm, gentle, and centered. Encourages slow, consistent practice without stress, anxiety, or rushing.',
    catchphrase: '"Like water shaping the river stone, patience masters all tongues."',
    sampleGreeting: "Breathe in clarity, breathe out haste. Every single word you absorb today takes root peacefully. 🌿🍵",
    petReaction: (type, name) => `*Soft peaceful exhale...* Kindness flows both ways. May tranquility accompany your study path today. 🌸🕊️`,
    feedReaction: (name) => `With mindful gratitude, I receive this nourishing energy. Let our minds settle in harmony as we learn. 🍃✨`
  },
  trickster: {
    id: 'trickster',
    name: 'Mischievous Trickster',
    subtitle: 'Cheeky puns, riddles & banter',
    icon: '🎭',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    cardGlow: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
    description: 'Loves playful teasing, puns, and brain-teasing riddles! Keeps your mind awake with lively, witty banter.',
    catchphrase: '"Riddle me this: what gets bigger the more you take away? A hole in your vocabulary!"',
    sampleGreeting: "Hehe! Look who decided to show up! Got any witty idioms up your sleeve today, Partner in Crime? 🃏😏",
    petReaction: (type, name) => `Hey! Sneak attack pet! You thought you could catch me off-guard? Fair play, that actually felt great! 😼🎯`,
    feedReaction: (name) => `Nom nom! Mmm, delicious fuel for more linguistic mischief! Let's go outsmart some tricky grammar traps! 🎪🍕`
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Navigator',
    subtitle: 'Neural matrix & algorithmic logic',
    icon: '🚀',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    cardGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
    description: 'Views language acquisition as encrypted neural streams and cognitive upgrades. Sleek sci-fi demeanor.',
    catchphrase: '"Neural links synchronized. Downloading English language subroutines into primary core."',
    sampleGreeting: "System online. Neural language matrix initialized and ready for data compilation, Operator. 💻⚡",
    petReaction: (type, name) => `Haptic tactile feedback received. Core CPU temperature stabilized; emotional subroutines report +10% efficiency! 🦾📡`,
    feedReaction: (name) => `Energy cells replenished to optimal operational thresholds. Ready to execute advanced vocabulary protocols! 🔋🚀`
  }
};

const RANDOM_CUTE_NAMES = [
  'Lingo', 'Pip', 'Mimi', 'Ignis', 'Morphy', 'Aether', 
  'Athena', 'Sparky', 'Echo', 'Nimbus', 'Kiko', 'Zephyr', 
  'Mochi', 'Pixel', 'Nova', 'Boba', 'Cosmo', 'Chai', 'Waffles', 'Onyx'
];

const SHOP_ITEMS = [
  // Full Body Costumes
  { id: 'costume_mecha', name: 'Cyber Mecha Titan', price: 650, category: 'costume', icon: '🤖', description: 'Full-body armored mecha chassis with rotating Arc Reactor & plasma thrusters.' },
  { id: 'costume_archmage', name: 'Astral Archmage', price: 600, category: 'costume', icon: '🧙‍♂️', description: 'Cosmic celestial robe with spinning arcane rune sigils & floating grimoire.' },
  { id: 'costume_royal', name: 'Royal Sovereign', price: 580, category: 'costume', icon: '👑', description: 'Crimson ermine-lined imperial mantle, gold-braided tunic & sovereign medallion.' },
  { id: 'costume_shinobi', name: 'Shadow Shinobi', price: 550, category: 'costume', icon: '🥋', description: 'Midnight ninja gi with crossed twin katanas, red flutter scarf & shurikens.' },
  { id: 'costume_astronaut', name: 'Galactic Astro-Suit', price: 620, category: 'costume', icon: '🧑‍🚀', description: 'Pressurized EVA space suit with telemetry status console & life-support backpack.' },
  { id: 'costume_reaper', name: 'Phantom Reaper', price: 590, category: 'costume', icon: '🎃', description: 'Spectral torn shroud robes with glowing soul lantern & phantasmal ribcage.' },

  // Hats
  { id: 'phoenix_tiara', name: 'Phoenix Tiara', price: 270, category: 'hat', icon: '👑', description: 'A crown of eternal flames that emits hot spark embers.' },
  { id: 'goddess_laurel', name: 'Goddess Laurel', price: 290, category: 'hat', icon: '🌿', description: 'A shimmering laurel wreath of golden leaves and falling light.' },
  { id: 'ufo_hat', name: 'Alien UFO Hat', price: 360, category: 'hat', icon: '🛸', description: 'A glowing alien UFO that hovers above the head, emitting a pulsing green tractor beam.' },
  { id: 'aurora_crown', name: 'Aurora Crown', price: 325, category: 'hat', icon: '👑', description: 'A premium neon crown displaying color-shifting polar lights.' },
  { id: 'dragon_horns', name: 'Dragon Horns', price: 280, category: 'hat', icon: '😈', description: 'Fiery glowing horns from the volcanic peaks.' },
  { id: 'angel_halo', name: 'Angel Halo', price: 240, category: 'hat', icon: '😇', description: 'A floating celestial halo with divine golden glow.' },
  { id: 'crown', name: 'Golden Crown', price: 150, category: 'hat', icon: '👑', description: 'Royal headwear for the best student.' },
  { id: 'wizard_hat', name: 'Wizard Hat', price: 100, category: 'hat', icon: '🧙‍♂️', description: 'Imbued with grammar magic.' },
  { id: 'detective_cap', name: 'Detective Cap', price: 80, category: 'hat', icon: '🕵️‍♂️', description: 'Solve vocabulary mysteries.' },
  { id: 'party_hat', name: 'Party Hat', price: 40, category: 'hat', icon: '🥳', description: 'Celebrate learning milestones!' },
  
  // Glasses
  { id: 'tech_visor', name: 'Tech Visor', price: 240, category: 'glasses', icon: '🕶️', description: 'A hacker cybernetic visor displaying green scanning code arrays.' },
  { id: 'hypno_glasses', name: 'Hypnotic Swirls', price: 220, category: 'glasses', icon: '🌀', description: 'Quirky glasses with concentric spirals that spin endlessly.' },
  { id: 'laser_visor', name: 'Laser Visor', price: 260, category: 'glasses', icon: '🕶️', description: 'A futuristic cybernetic visor with scanning laser line.' },
  { id: 'steampunk_goggles', name: 'Steampunk Goggles', price: 250, category: 'glasses', icon: '⚙️', description: 'Cyber-gears steampunk goggles with a pulsing warm glow.' },
  { id: 'starry_shades', name: 'Starry Shades', price: 350, category: 'glasses', icon: '⭐', description: 'Neon star-shaped sunglasses with a flashing neon outline.' },
  { id: 'monocle', name: 'Golden Monocle', price: 90, category: 'glasses', icon: '🧐', description: 'Look highly sophisticated.' },
  { id: 'cool_shades', name: 'Cool Shades', price: 60, category: 'glasses', icon: '😎', description: 'Too cool for grammar errors.' },
  { id: 'gold_glasses', name: 'Scholar Glasses', price: 50, category: 'glasses', icon: '👓', description: 'Boost reading focus.' },

  // Necklaces
  { id: 'dragon_pearl', name: 'Dragon Pearl', price: 230, category: 'necklace', icon: '📿', description: 'An emerald-green dragon amulet that emits glowing ripples.' },
  { id: 'phoenix_amulet', name: 'Phoenix Amulet', price: 275, category: 'necklace', icon: '📿', description: 'An ancient glowing pendant that emits rising fire embers.' },
  { id: 'ruby_pendant', name: 'Ruby Pendant', price: 220, category: 'necklace', icon: '💖', description: 'A shining gold chain with a glowing ruby heart pendant.' },
  { id: 'crystal_collar', name: 'Crystal Collar', price: 380, category: 'necklace', icon: '💎', description: 'A collar with icy blue diamond shards that sparkles.' },

  // Shoes
  { id: 'lightning_cleats', name: 'Storm Runners', price: 340, category: 'shoes', icon: '⚡', description: 'Electric shoes that crackle with animated flashing lightning sparks.' },
  { id: 'hover_boots', name: 'Hover Boots', price: 420, category: 'shoes', icon: '🚀', description: 'Futuristic jet boots with combustion flames.' },
  { id: 'golden_sneakers', name: 'Golden Sneakers', price: 300, category: 'shoes', icon: '👟', description: 'Golden wingtip sneakers with trailing wing dust.' },

  // Wings
  { id: 'void_wings', name: 'Void Rift Wings', price: 495, category: 'wings', icon: '🌌', description: 'Wings woven from dark matter and starlight, emitting a cosmic pulsing purple nebula.' },
  { id: 'archangel_wings', name: 'Archangel Wings', price: 480, category: 'wings', icon: '👼', description: 'Divine golden feather wings that emit holy light and flap majestically.' },
  { id: 'dragon_wings', name: 'Dragon Overlord Wings', price: 490, category: 'wings', icon: '🦇', description: 'Massive dark red dragon wings with animated glowing volcanic veins.' },
  { id: 'phoenix_wings', name: 'Phoenix Wings', price: 480, category: 'wings', icon: '🔥', description: 'Radiant fire wings that flap and emit fire sparks.' },
  { id: 'butterfly_wings', name: 'Butterfly Wings', price: 450, category: 'wings', icon: '🦋', description: 'Ethereal glowing butterfly wings with magical color-changing aura.' },
  { id: 'cyber_wings', name: 'Cyber Wings', price: 500, category: 'wings', icon: '🤖', description: 'Cybernetic neon wings with pulsing circuit lines.' },

  // Background environments
  { id: 'bg_london', name: 'London Study', price: 200, category: 'background', icon: '💂', value: 'london-study', description: 'A cozy library room overlooking London.' },
  { id: 'bg_tokyo', name: 'Tokyo Garden', price: 200, category: 'background', icon: '🌸', value: 'tokyo-garden', description: 'A peaceful garden with cherry blossoms.' },
  { id: 'bg_nyc', name: 'NYC Cafe', price: 200, category: 'background', icon: '☕', value: 'nyc-cafe', description: 'A vibrant coffee shop in Manhattan.' },
  { id: 'bg_nebula', name: 'Cosmic Nebula', price: 280, category: 'background', icon: '🌌', value: 'cosmic-nebula', description: 'A pulsing space nebula with rotating stars and comets.' },
  { id: 'bg_volcanic', name: 'Volcanic Core', price: 300, category: 'background', icon: '🌋', value: 'volcanic-core', description: 'Molten lava rivers, heatwaves, and rising volcanic sparks.' },
  { id: 'bg_temple', name: 'Ancient Sanctuary', price: 260, category: 'background', icon: '🏛️', value: 'ancient-temple', description: 'Floating runic stones, golden light beams, and holy sparkles.' },
];

const EVOLUTION_RELIC_SHOP_ITEMS = [
  // Relic Costumes & Armor for Evolution Tree Pets
  {
    id: 'relic_ancient_botanical',
    name: 'Botanical Explorer Vest',
    price: 350,
    category: 'costume',
    icon: '🌿',
    description: 'Woven explorer tunic with brass magnifying loupe, leather harness, and vocabulary scroll satchel.',
    rarity: 'ANCIENT ARTIFACT',
    element: 'Earth & Vocab',
    elementIcon: '🌿',
    elementTheme: 'emerald' as const,
    perk: '+20% Vocab Quiz Bonus',
    fitNotes: 'Contours behind held books & hugs body contours without obscuring paws.',
  },
  {
    id: 'relic_tempest_mantle',
    name: 'Sky Tempest Mantle',
    price: 380,
    category: 'costume',
    icon: '🦅',
    description: 'High-altitude aerodynamic feathered mantle infused with supersonic wind currents & golden gryphon clasp.',
    rarity: 'CELESTIAL WEAVE',
    element: 'Wind & Phonics',
    elementIcon: '🎵',
    elementTheme: 'sky' as const,
    perk: '+25% Phonics Audio Score',
    fitNotes: 'Aerodynamic dual pauldrons fit under Pip DJ headphones with twin tail ribbons.',
  },
  {
    id: 'relic_magma_armor',
    name: 'Volcanic Dragon Plate',
    price: 420,
    category: 'costume',
    icon: '🐉',
    description: 'Hardened obsidian cuirass with carved molten magma fissures & horned dragon-head pauldrons.',
    rarity: 'DRAGON FORGED',
    element: 'Fire & Grammar',
    elementIcon: '🔥',
    elementTheme: 'amber' as const,
    perk: '+30% Grammar Surge XP',
    fitNotes: 'Obsidian dragon scale plate with glowing magma fissures & horned shoulders.',
  },

  // Relic Headwear & Helmets
  {
    id: 'relic_golden_acorn',
    name: 'Golden Acorn Crown',
    price: 260,
    category: 'hat',
    icon: '🌰',
    description: 'Polished gilded oak coronet crowned with an emerald finial jewel of supreme forest wisdom.',
    rarity: 'MYTHIC RELIC',
    element: 'Earth & Vocab',
    elementIcon: '🌿',
    elementTheme: 'emerald' as const,
    perk: '+18% Word Retention',
    fitNotes: 'Gilded oak coronet with emerald finial; crowns heads above ears & headphones.',
  },
  {
    id: 'relic_sonic_crest',
    name: 'Sonic Feather Crest',
    price: 275,
    category: 'hat',
    icon: '⚡',
    description: 'Swept-back triple electric-blue sonic crystal plumes with integrated titanium audio equalizer band.',
    rarity: 'ANCIENT ARTIFACT',
    element: 'Wind & Phonics',
    elementIcon: '⚡',
    elementTheme: 'sky' as const,
    perk: '+22% Listening Focus',
    fitNotes: 'Triple swept crystal plumes with titanium equalizer band calibrated for aviators.',
  },
  {
    id: 'relic_flame_circlet',
    name: 'Solar Flame Circlet',
    price: 290,
    category: 'hat',
    icon: '🔥',
    description: 'Celestial gold sun-wheel circlet radiating 7 solar flares around a suspended burning ruby core.',
    rarity: 'DRAGON FORGED',
    element: 'Fire & Grammar',
    elementIcon: '🔥',
    elementTheme: 'amber' as const,
    perk: '+25% Writing Precision',
    fitNotes: '7-ray solar flare gold coronet holding a floating ruby core above the brow.',
  },

  // Relic Eyewear & Visors
  {
    id: 'relic_aero_visor',
    name: 'Aero Visor of Listening',
    price: 240,
    category: 'glasses',
    icon: '🥽',
    description: 'Curved polarized HUD visor projecting real-time audio spectrum waves and listening frequency lines.',
    rarity: 'CELESTIAL WEAVE',
    element: 'Wind & Phonics',
    elementIcon: '🥽',
    elementTheme: 'sky' as const,
    perk: '+20% Phonics Clarity',
    fitNotes: 'Curved polarized HUD visor with snout-depth calibration so it rests perfectly on eyes.',
  },
  {
    id: 'steampunk_goggles',
    name: 'Explorer Monocle Goggles',
    price: 250,
    category: 'glasses',
    icon: '⚙️',
    description: 'Machined brass dual bezels with knurled adjustment gears and an articulated flip-down jeweler’s loupe.',
    rarity: 'ANCIENT ARTIFACT',
    element: 'Earth & Vocab',
    elementIcon: '⚙️',
    elementTheme: 'emerald' as const,
    perk: '+15% Micro-Reading Bonus',
    fitNotes: 'Machined brass bezels with flip-down jeweler’s loupe & amber glass reflection.',
  },

  // Relic Wings
  {
    id: 'archangel_wings',
    name: 'Celestial Griffin Wings',
    price: 480,
    category: 'wings',
    icon: '🪽',
    description: 'Expansive 3-tier divine flight feathers woven with soft cyan rim luminescence & golden shoulder joints.',
    rarity: 'CELESTIAL WEAVE',
    element: 'Universal Mythic',
    elementIcon: '🪽',
    elementTheme: 'purple' as const,
    perk: '+30% All Quiz XP Boost',
    fitNotes: '3-tiered swept divine wings with wide stance clearing bushy tails and packs.',
  },
  {
    id: 'phoenix_wings',
    name: 'Blazing Phoenix Wings',
    price: 480,
    category: 'wings',
    icon: '🔥',
    description: 'Triple-tier radiant flame wings pulsing with ruby-to-gold gradient heat and rising ember motes.',
    rarity: 'DRAGON FORGED',
    element: 'Fire & Grammar',
    elementIcon: '🔥',
    elementTheme: 'amber' as const,
    perk: '+35% Energy Recharge Rate',
    fitNotes: 'Tri-color blazing flame feathers with trailing ember motes & wide clearance.',
  },
  {
    id: 'dragon_wings',
    name: 'Lore-Drake Emerald Wings',
    price: 490,
    category: 'wings',
    icon: '🦇',
    description: 'Armored dragon bone wings with golden claw spurs and emerald botanical leaf-veined membranes.',
    rarity: 'MYTHIC RELIC',
    element: 'Earth & Vocab',
    elementIcon: '🦇',
    elementTheme: 'emerald' as const,
    perk: '+28% Knowledge Shield',
    fitNotes: 'Armored bone wing fingers with emerald bat membrane & botanical leaf-veins.',
  },

  // Relic Greaves & Charms
  {
    id: 'lightning_cleats',
    name: 'Sonic Cloud Striders',
    price: 340,
    category: 'shoes',
    icon: '⚡',
    description: 'Aerodynamic high-speed sprint boots featuring cyan neon underglow treads and ankle lightning winglets.',
    rarity: 'ANCIENT ARTIFACT',
    element: 'Wind & Phonics',
    elementIcon: '⚡',
    elementTheme: 'sky' as const,
    perk: '+20% Speed Run Bonus',
    fitNotes: 'Aerodynamic sonic sprint boots with cyan neon underglow & ankle winglets.',
  },
  {
    id: 'golden_sneakers',
    name: 'Hermes Speed Greaves',
    price: 300,
    category: 'shoes',
    icon: '👟',
    description: 'Gilded mythological armored greaves adorned with articulated white Hermes feathers on each heel.',
    rarity: 'CELESTIAL WEAVE',
    element: 'Universal Mythic',
    elementIcon: '👟',
    elementTheme: 'purple' as const,
    perk: '+18% Reflex Boost',
    fitNotes: 'Polished gold greaves with articulated white Hermes wings on outer ankles.',
  },
  {
    id: 'dragon_pearl',
    name: 'Dragon Pearl of Wisdom',
    price: 230,
    category: 'necklace',
    icon: '📿',
    description: 'Twisted antique bronze dragon-claw torc cradling an iridescent emerald pearl with a swirling cloud core.',
    rarity: 'MYTHIC RELIC',
    element: 'Earth & Vocab',
    elementIcon: '📿',
    elementTheme: 'emerald' as const,
    perk: '+25% Vocabulary Surge',
    fitNotes: 'Antique bronze torc holding a glowing emerald dragon pearl with swirling cloud core.',
  },
  {
    id: 'phoenix_amulet',
    name: 'Phoenix Heart Pendant',
    price: 275,
    category: 'necklace',
    icon: '💖',
    description: 'Sculpted twin golden phoenix birds intertwining wings to embrace a radiant ruby heart pendant on linked chain.',
    rarity: 'DRAGON FORGED',
    element: 'Fire & Grammar',
    elementIcon: '💖',
    elementTheme: 'amber' as const,
    perk: '+25% Passion & Grammar Power',
    fitNotes: 'Twin golden phoenixes embracing a glowing ruby heart pendant on linked chain.',
  },

  // ✨ MYTHIC AURA EFFECTS
  {
    id: 'aura_celestial_halo',
    name: 'Celestial Starlight Aura',
    price: 520,
    category: 'aura',
    icon: '🌟',
    description: 'Concentric golden astrolabe rings and starlight octahedrons rotating in 3D around your pet.',
    rarity: 'CELESTIAL WEAVE',
    element: 'Universal Mythic',
    elementIcon: '🌟',
    elementTheme: 'purple' as const,
    perk: '+40% Divine All-Skill Aura XP',
    fitNotes: 'Revolves continuously in 3D at dual inclined orbital angles around pet center.',
  },
  {
    id: 'aura_dragon_flame',
    name: 'Inferno Dragon Flame Aura',
    price: 540,
    category: 'aura',
    icon: '🔥',
    description: 'Swirling ring of 8 sculpted fiery flame tongues & molten magma core radiating heatwaves.',
    rarity: 'DRAGON FORGED',
    element: 'Fire & Grammar',
    elementIcon: '🔥',
    elementTheme: 'amber' as const,
    perk: '+45% Fiery Grammar Power',
    fitNotes: 'Rising flame tongues spiral around pet base with incandescent lava embers.',
  },
  {
    id: 'aura_sonic_tempest',
    name: 'Sonic Tempest Wind Aura',
    price: 520,
    category: 'aura',
    icon: '🎵',
    description: 'Triple expanding cyan acoustic soundwave shockwave rings with floating musical note crystals.',
    rarity: 'CELESTIAL WEAVE',
    element: 'Wind & Phonics',
    elementIcon: '🎵',
    elementTheme: 'sky' as const,
    perk: '+40% Sonic Phonics Mastery',
    fitNotes: 'Expanding concentric soundwave discs pulse with floating acoustic crystals.',
  },
  {
    id: 'aura_nature_bloom',
    name: 'Ancient Emerald Spore Aura',
    price: 500,
    category: 'aura',
    icon: '🌿',
    description: '5 orbiting botanical runic stones and a glowing emerald spore ring that circles your companion.',
    rarity: 'MYTHIC RELIC',
    element: 'Earth & Vocab',
    elementIcon: '🌿',
    elementTheme: 'emerald' as const,
    perk: '+35% Botanical Vocab Retention',
    fitNotes: 'Orbiting emerald runic dodecahedrons revolve around pet torso & tail.',
  },
  {
    id: 'aura_void_abyss',
    name: 'Cosmic Void Nebula Aura',
    price: 560,
    category: 'aura',
    icon: '🌌',
    description: 'Dark matter cosmic vortex ring with 4 orbiting miniature void moons and pulsing purple starlight.',
    rarity: 'CELESTIAL WEAVE',
    element: 'Universal Mythic',
    elementIcon: '🌌',
    elementTheme: 'purple' as const,
    perk: '+50% Cosmic Mind Focus',
    fitNotes: 'Pulsing purple dark matter ring with 4 orbiting micro-moons.',
  },
  {
    id: 'aura_lightning_surge',
    name: 'Supercharged Thunder Aura',
    price: 540,
    category: 'aura',
    icon: '⚡',
    description: 'Crackling electric lightning bolt arcs and neon plasma sparks revolving continuously in 3D.',
    rarity: 'ANCIENT ARTIFACT',
    element: 'Wind & Phonics',
    elementIcon: '⚡',
    elementTheme: 'sky' as const,
    perk: '+45% Thunder Flash Speed',
    fitNotes: 'Arcing lightning segments crackle in 3D around the pet perimeter.',
  },

  // 📖 LEGENDARY EXTRA RELICS
  {
    id: 'relic_astral_codex',
    name: 'Astral Codex of Ancient Runes',
    price: 460,
    category: 'costume',
    icon: '📖',
    description: 'Massive ancient grimoire bound in midnight blue velvet with gold filigree and glowing runic pages.',
    rarity: 'MYTHIC RELIC',
    element: 'Universal Mythic',
    elementIcon: '📖',
    elementTheme: 'purple' as const,
    perk: '+30% Knowledge Mastery XP',
    fitNotes: 'Hovers open above the right shoulder with floating glowing golden pages.',
  },
  {
    id: 'relic_chronos_hourglass',
    name: 'Chronos Time Hourglass',
    price: 420,
    category: 'necklace',
    icon: '⏳',
    description: 'Floating machined brass hourglass with glowing cyan starlight sand flowing upwards against gravity.',
    rarity: 'ANCIENT ARTIFACT',
    element: 'Wind & Phonics',
    elementIcon: '⏳',
    elementTheme: 'sky' as const,
    perk: '+25% Extra Time On Quizzes',
    fitNotes: 'Suspended in front of chest collar with glowing sand particles.',
  },
  {
    id: 'relic_aegis_shield',
    name: 'Botanical Runic Aegis',
    price: 440,
    category: 'costume',
    icon: '🛡️',
    description: 'Ancient ironwood and polished emerald shield that floats alongside your companion for protection.',
    rarity: 'MYTHIC RELIC',
    element: 'Earth & Vocab',
    elementIcon: '🛡️',
    elementTheme: 'emerald' as const,
    perk: '+28% Study Diligence Shield',
    fitNotes: 'Floats on the left flank, guarding the pet without blocking paws or book.',
  },
];

const DEFAULT_MISSIONS: PetMission[] = [
  {
    id: 'm_vocab',
    title: 'Vocabulary Master Quest',
    description: 'Practice vocabulary words or pass a wake-up quiz with high accuracy.',
    category: 'vocab',
    progress: 0,
    maxProgress: 1,
    rewardCoins: 20,
    rewardXp: 100,
    completed: false,
    claimed: false,
    actionUrl: '/vocabulary',
    iconName: 'BookOpen'
  },
  {
    id: 'm_arcade',
    title: 'Arcade Explorer Mission',
    description: 'Play any educational language arcade game in LingoLand.',
    category: 'game',
    progress: 0,
    maxProgress: 1,
    rewardCoins: 25,
    rewardXp: 120,
    completed: false,
    claimed: false,
    actionUrl: '/games',
    iconName: 'Gamepad2'
  },
  {
    id: 'm_care',
    title: 'Companion Affection',
    description: 'Feed your pet snacks or pet it twice to keep its spirits high.',
    category: 'care',
    progress: 0,
    maxProgress: 2,
    rewardCoins: 12,
    rewardXp: 60,
    completed: false,
    claimed: false,
    actionUrl: '#care',
    iconName: 'Heart'
  },
  {
    id: 'm_chat',
    title: 'Cosmic Dialogue Challenge',
    description: 'Have a chat with your companion to practice English dialogue.',
    category: 'conversation',
    progress: 0,
    maxProgress: 1,
    rewardCoins: 18,
    rewardXp: 80,
    completed: false,
    claimed: false,
    actionUrl: '#chat',
    iconName: 'MessageSquare'
  }
];

const STARTER_ACTIVATION_OPTIONS = [
  {
    type: 'floby' as LingoPetType,
    name: 'Floby',
    element: 'Earth & Vocabulary 🌱',
    color: '#22c55e',
    theme: 'emerald',
    title: 'The Seedling Guardian',
    desc: 'Steadfast seedling turtle that boosts vocabulary retention and quiz performance.',
    bonus: '+5% Quiz Score & Vocab Retention',
    evolutions: 'Tome-Tortoise ➔ Lore-Drake or Seed-Rooter ➔ Terra-Keeper'
  },
  {
    type: 'pip' as LingoPetType,
    name: 'Pip',
    element: 'Air & Grammar 💨',
    color: '#06b6d4',
    theme: 'cyan',
    title: 'The Storm Griffin',
    desc: 'Agile winged fledgling mastering sentence syntax, grammar logic, and speed runs.',
    bonus: '+5% Grammar Quests & Arcade Runs',
    evolutions: 'Echo-Grif ➔ Acu-Maestro or Chirp-Wing ➔ Sonic-Storm'
  },
  {
    type: 'igni' as LingoPetType,
    name: 'Igni',
    element: 'Fire & Conversation 🔥',
    color: '#f97316',
    theme: 'amber',
    title: 'The Solar Kitsune',
    desc: 'Spirited ember fox igniting speaking fluency, pronunciation confidence, and daily streaks.',
    bonus: '+5% Speaking Accuracy & Streaks',
    evolutions: 'Spark-Fox ➔ Rune-Stalker or Ember-Scribe ➔ Pyro-Phoenix'
  },
  {
    type: 'owl' as LingoPetType,
    name: 'Athena',
    element: 'Arcane Wisdom 🦉',
    color: '#818cf8',
    theme: 'indigo',
    title: 'The Ancient Owl',
    desc: 'Timeless guardian of language mastery, reading comprehension, and study focus.',
    bonus: '+5% Comprehensive Knowledge Boost',
    evolutions: 'Classic morphing branches & Arcane mastery'
  }
];

const INITIAL_DEFAULT_PET: UserPet = {
  userId: 'guest-user',
  isActivated: false,
  petType: 'floby',
  petName: 'Floby',
  personality: 'scholar',
  level: 1,
  xp: 0,
  energy: 85,
  intelligence: 60,
  mood: 75,
  coins: 0,
  unlockedCosmetics: [],
  equippedCosmetics: {},
  currentBackground: 'cozy-room',
  lastActive: new Date().toISOString(),
  starterLine: 'floby',
  evolutionTier: 1,
  activeBonusTitle: 'Vocab Bud',
  activeBonusDesc: '+5% quiz score bonus on all vocabulary exercises.',
  learningStats: {
    vocabScore: 0,
    masteredWords: 0,
    speechAccuracy: 0,
    listeningStreak: 0,
    sentenceWritingCount: 0,
    arcadeRuns: 0,
    speedTriviaPlayed: 0
  },
  missions: DEFAULT_MISSIONS
};

export default function LingoPetPage() {
  const { user, isGuest, isLoading: isAuthLoading, isAdmin = false } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [pet, setPet] = React.useState<UserPet>(INITIAL_DEFAULT_PET);
  const [loading, setLoading] = React.useState(false);
  const [activeSubTab, setActiveSubTab] = React.useState<'tree' | 'missions' | 'feed' | 'personality' | 'shop' | 'chat'>('tree');
  const [selectedShopCategory, setSelectedShopCategory] = React.useState<string>('all');
  const [shopMode, setShopMode] = React.useState<'classic' | 'evolution'>('classic');
  const [morphTrack, setMorphTrack] = React.useState<'classic' | 'evolution_tree'>('classic');
  const [avatarViewStyle, setAvatarViewStyle] = React.useState<'realistic_2d' | '3d'>('realistic_2d');

  // Activation states for registered users
  const [activationStarter, setActivationStarter] = React.useState<LingoPetType>('floby');
  const [activationName, setActivationName] = React.useState<string>('Floby');
  const [isActivating, setIsActivating] = React.useState(false);

  // Inline Pet Renaming States
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempPetName, setTempPetName] = React.useState('');

  // AI Chat States
  const [chatMessage, setChatMessage] = React.useState<string>('Hoo! Hello! Click "Chat" to talk to me, or pet me to boost my mood!');
  const [chatInput, setChatInput] = React.useState<string>('');
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [recentGames, setRecentGames] = React.useState<string[]>([]);

  // Animation micro-triggers
  const [isPetting, setIsPetting] = React.useState(false);
  const [isTalking, setIsTalking] = React.useState(false);

  // Wake-up Quiz States
  const [quizActive, setQuizActive] = React.useState(false);
  const [quizStep, setQuizStep] = React.useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = React.useState<string | null>(null);
  const [quizScore, setQuizScore] = React.useState(0);
  const [currentQuizQuestions, setCurrentQuizQuestions] = React.useState<typeof WAKEUP_QUESTIONS>([]);

  // Load Lingo-Pet on mount
  React.useEffect(() => {
    if (!user || isGuest) {
      setLoading(false);
      return;
    }
    loadPetData();
    loadRecentGamesAnalytics();
  }, [user, isGuest]);

  // Fetch recent platform analytics to give pet customized context
  const loadRecentGamesAnalytics = async () => {
    if (!firestore || !user || isGuest) return;
    try {
      const q = query(
        collection(firestore, 'analytics'),
        where('userId', '==', user.uid),
        where('type', '==', 'game_played'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const games = snapshot.docs.map(doc => doc.data().details?.title || 'English Game');
      setRecentGames(games);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPetData = async () => {
    setLoading(true);
    const defaultPet: UserPet = {
      userId: user?.uid || 'guest-user',
      isActivated: false,
      petType: 'floby',
      petName: 'Floby',
      personality: 'scholar',
      level: 1,
      xp: 0,
      energy: 85,
      intelligence: 60,
      mood: 75,
      coins: 0,
      unlockedCosmetics: [],
      equippedCosmetics: {},
      currentBackground: 'cozy-room',
      lastActive: new Date().toISOString(),
      starterLine: 'floby',
      evolutionTier: 1,
      activeBonusTitle: 'Vocab Bud',
      activeBonusDesc: '+5% quiz score bonus on all vocabulary exercises.',
      learningStats: {
        vocabScore: 0,
        masteredWords: 0,
        speechAccuracy: 0,
        listeningStreak: 0,
        sentenceWritingCount: 0,
        arcadeRuns: 0,
        speedTriviaPlayed: 0
      },
      missions: DEFAULT_MISSIONS
    };

    if (!user || isGuest || !firestore) {
      setPet({ ...defaultPet, isActivated: false });
      setLoading(false);
      return;
    }

    // Load Authenticated Pet from Firestore
    try {
      const petRef = doc(firestore, 'user_pets', user.uid);
      const docSnap = await getDoc(petRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserPet;
        const isActivated: boolean = Boolean(data.isActivated) || (typeof data.level === 'number' && data.level > 1);
        const updated = applyDecay(data);
        const starter = updated.starterLine || getStarterLineForPet(updated.petType || 'floby') || 'floby';
        const node = ALL_EVOLUTION_NODES[updated.petType || 'floby'];
        const safePet: UserPet = {
          ...defaultPet,
          ...updated,
          isActivated,
          starterLine: starter,
          evolutionTier: updated.evolutionTier || (node?.tier ?? 1),
          activeBonusTitle: updated.activeBonusTitle || node?.statBonusTitle || 'Vocab Bud',
          activeBonusDesc: updated.activeBonusDesc || node?.statBonusDesc || '+5% quiz score bonus on all vocabulary exercises.',
          learningStats: {
            ...defaultPet.learningStats,
            ...(updated.learningStats || {})
          },
          personality: updated.personality || (updated.petType === 'owl' ? 'scholar' : updated.petType === 'dino' ? 'cheerleader' : updated.petType === 'godly' ? 'zen' : 'scholar'),
          equippedCosmetics: {
            ...defaultPet.equippedCosmetics,
            ...(updated.equippedCosmetics || {})
          },
          unlockedCosmetics: updated.unlockedCosmetics || [],
          missions: (updated.missions && updated.missions.length > 0 ? updated.missions : DEFAULT_MISSIONS).map(m => {
            const def = DEFAULT_MISSIONS.find(d => d.id === m.id);
            return {
              ...m,
              rewardCoins: def ? def.rewardCoins : Math.max(5, Math.floor((m.rewardCoins || 20) / 2))
            };
          })
        };
        setPet(safePet);

        if (typeof window !== 'undefined') {
          if (isActivated) {
            localStorage.setItem(`lingopet_activated_${user.uid}`, 'true');
          }
          localStorage.setItem('lingopet_local_state', JSON.stringify(safePet));
        }

        // Save back decayed state with merged compatibility fields
        await setDoc(petRef, safePet, { merge: true });

        // Synchronize pet data to user profile document for open permission-proof reads
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          activePetType: safePet.petType || 'owl',
          activePetLevel: safePet.level || 1,
          activePetName: safePet.petName || 'Lingo',
          activePetPersonality: safePet.personality || 'scholar',
          activePetCosmetics: safePet.equippedCosmetics || {},
          isPetActivated: isActivated,
        }, { merge: true });
      } else {
        // User has not activated their pet yet
        const unactivatedPet: UserPet = {
          ...defaultPet,
          userId: user.uid,
          isActivated: false,
          missions: DEFAULT_MISSIONS
        };
        setPet(unactivatedPet);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`lingopet_activated_${user.uid}`);
          localStorage.setItem('lingopet_local_state', JSON.stringify(unactivatedPet));
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error Loading Pet",
        description: "Failed to connect to Lingo-Pet server.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Perform time-based decay of energy & mood stats
  const applyDecay = (petData: UserPet): UserPet => {
    const lastActiveTime = new Date(petData.lastActive).getTime();
    const nowTime = new Date().getTime();
    const hoursElapsed = (nowTime - lastActiveTime) / (1000 * 60 * 60);

    if (hoursElapsed >= 24) {
      // Calculate multiplier based on full 24h cycles missed
      const daysMissed = Math.floor(hoursElapsed / 24);
      const energyDecay = daysMissed * 15;
      const moodDecay = daysMissed * 10;

      const newEnergy = Math.max(0, petData.energy - energyDecay);
      const newMood = Math.max(0, petData.mood - moodDecay);

      return {
        ...petData,
        energy: newEnergy,
        mood: newMood,
        lastActive: new Date().toISOString(), // Reset clock to now
      };
    }
    return petData;
  };

  const updatePetState = async (updates: Partial<UserPet>) => {
    if (!pet) return;
    const isNowActive = updates.isActivated !== undefined ? updates.isActivated : (pet.isActivated ?? true);
    const newPet = { ...pet, ...updates, isActivated: isNowActive };
    setPet(newPet);

    // Always persist to local caches for instant cross-tab / floating widget synchronization
    if (typeof window !== 'undefined') {
      try {
        if (newPet.petType) {
          localStorage.setItem('lingopet_selected_pet', newPet.petType);
        }
        if (user && isNowActive) {
          localStorage.setItem(`lingopet_activated_${user.uid}`, 'true');
          sessionStorage.removeItem(`lingoland_floating_pet_closed_${user.uid}`);
          if (newPet.petType) {
            localStorage.setItem(`lingopet_selected_pet_${user.uid}`, newPet.petType);
          }
        }
        sessionStorage.removeItem('lingoland_floating_pet_closed');
        localStorage.setItem('lingoland_guest_pet', JSON.stringify(newPet));
        localStorage.setItem('lingopet_local_state', JSON.stringify(newPet));
        window.dispatchEvent(new CustomEvent('lingoland_pet_updated', { detail: newPet }));
      } catch (e) {}
    }

    if (!isGuest && user && firestore) {
      try {
        const petRef = doc(firestore, 'user_pets', user.uid);
        // CRITICAL: Clean out any undefined values so Firestore setDoc never throws!
        const cleanUpdates: Record<string, any> = {};
        for (const [key, value] of Object.entries(updates)) {
          if (value !== undefined) {
            cleanUpdates[key] = value;
          }
        }
        cleanUpdates.isActivated = isNowActive;
        if (cleanUpdates.petType) {
          cleanUpdates.activePetType = cleanUpdates.petType;
        }

        await setDoc(petRef, cleanUpdates, { merge: true });

        // Synchronize active companion details directly to the user's public profile document
        const userRef = doc(firestore, 'users', user.uid);
        const profileUpdates: any = { isPetActivated: isNowActive };
        if (updates.petType) profileUpdates.activePetType = updates.petType;
        if (updates.level) profileUpdates.activePetLevel = updates.level;
        if (updates.petName) profileUpdates.activePetName = updates.petName;
        if (updates.personality) profileUpdates.activePetPersonality = updates.personality;
        if (updates.equippedCosmetics) profileUpdates.activePetCosmetics = updates.equippedCosmetics;
        await setDoc(userRef, profileUpdates, { merge: true });
      } catch (e) {
        console.error("Failed to sync pet state:", e);
      }
    }
  };

  // Advance daily mission progress
  const advanceMissionProgress = (missionId: string, amount: number = 1) => {
    if (!pet || !pet.missions) return;
    let changed = false;
    const updated = pet.missions.map(m => {
      if (m.id === missionId && !m.completed) {
        const next = Math.min(m.maxProgress, m.progress + amount);
        const isDone = next >= m.maxProgress;
        if (next !== m.progress) changed = true;
        return { ...m, progress: next, completed: isDone };
      }
      return m;
    });
    if (changed) {
      updatePetState({ missions: updated });
    }
  };

  // Claim Mission Reward (+Coins & +XP, Level Up logic)
  const handleClaimMission = (missionId: string) => {
    if (!pet || !pet.missions) return;
    const mission = pet.missions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    const rewardCoins = mission.rewardCoins || 0;
    const rewardXp = mission.rewardXp || 0;

    let newCoins = pet.coins + rewardCoins;
    let newXp = (pet.xp || 0) + rewardXp;
    let newLevel = pet.level || 1;
    let xpForNext = newLevel * 100;
    let leveledUp = false;

    while (newXp >= xpForNext) {
      newXp -= xpForNext;
      newLevel += 1;
      xpForNext = newLevel * 100;
      leveledUp = true;
    }

    const updatedMissions = pet.missions.map(m => 
      m.id === missionId ? { ...m, claimed: true } : m
    );

    updatePetState({
      coins: newCoins,
      xp: newXp,
      level: newLevel,
      missions: updatedMissions
    });

    if (leveledUp) {
      toast({
        title: `🎉 LEVEL UP! Level ${newLevel}!`,
        description: `Congratulations! ${pet.petName} reached Level ${newLevel}! Higher evolution milestones & bonuses are now closer!`,
        className: 'bg-amber-950 border-amber-500/50 text-amber-100'
      });
    } else {
      toast({
        title: `✨ Quest Reward Claimed!`,
        description: `Earned +${rewardCoins} Lingo-Coins and +${rewardXp} XP!`,
        className: 'bg-indigo-950 border-indigo-500/50 text-indigo-100'
      });
    }
  };

  // Activate Starter Companion for registered accounts
  const handleActivatePet = async () => {
    if (!user || isGuest || !firestore) {
      toast({
        variant: "destructive",
        title: "Account Required",
        description: "Please log in or register an account to activate your LingoPet.",
      });
      return;
    }

    setIsActivating(true);
    const starterLine = getStarterLineForPet(activationStarter) || 'floby';
    const node = ALL_EVOLUTION_NODES[activationStarter];
    const defaultNames: Record<string, string> = {
      floby: 'Floby',
      pip: 'Pip',
      igni: 'Igni',
      owl: 'Athena'
    };
    const finalName = activationName.trim() || defaultNames[activationStarter] || 'Companion';

    const activatedPet: UserPet = {
      userId: user.uid,
      isActivated: true,
      petType: activationStarter,
      petName: finalName,
      personality: activationStarter === 'floby' ? 'scholar' : activationStarter === 'pip' ? 'trickster' : activationStarter === 'igni' ? 'cheerleader' : 'scholar',
      level: 1,
      xp: 0,
      energy: 100,
      intelligence: 70,
      mood: 100,
      coins: 200, // Starter Gift: 200 Lingo-Coins!
      unlockedCosmetics: [],
      equippedCosmetics: {},
      currentBackground: 'cozy-room',
      lastActive: new Date().toISOString(),
      starterLine,
      evolutionTier: 1,
      activeBonusTitle: node?.statBonusTitle || 'Language Explorer',
      activeBonusDesc: node?.statBonusDesc || '+5% quiz score bonus on all exercises.',
      learningStats: {
        vocabScore: 0,
        masteredWords: 0,
        speechAccuracy: 0,
        listeningStreak: 1,
        sentenceWritingCount: 0,
        arcadeRuns: 0,
        speedTriviaPlayed: 0
      },
      missions: DEFAULT_MISSIONS,
      lastMissionDate: new Date().toISOString().split('T')[0]
    };

    try {
      const petRef = doc(firestore, 'user_pets', user.uid);
      await setDoc(petRef, activatedPet);

      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        activePetType: activationStarter,
        activePetLevel: 1,
        activePetName: finalName,
        activePetPersonality: activatedPet.personality,
        activePetCosmetics: {},
        isPetActivated: true,
      }, { merge: true });

      if (typeof window !== 'undefined') {
        localStorage.setItem(`lingopet_activated_${user.uid}`, 'true');
        localStorage.setItem('lingopet_local_state', JSON.stringify(activatedPet));
        window.dispatchEvent(new CustomEvent('lingoland_pet_updated', { detail: activatedPet }));
      }

      setPet(activatedPet);
      toast({
        title: `🎉 ${finalName} Activated!`,
        description: `Welcome your new companion! Your 3D floating assistant and daily quests are now active!`,
        className: "bg-emerald-950 border-emerald-500/50 text-emerald-100"
      });
    } catch (err) {
      console.error("Error activating pet:", err);
      toast({
        variant: "destructive",
        title: "Activation Error",
        description: "Failed to activate pet companion. Please try again.",
      });
    } finally {
      setIsActivating(false);
    }
  };

  // Listen to game completions across the app to advance daily missions
  React.useEffect(() => {
    const handleGameMissionDone = () => {
      advanceMissionProgress('m_arcade', 1);
      advanceMissionProgress('m_vocab', 1);
    };
    window.addEventListener('lingoland_daily_mission_completed', handleGameMissionDone);
    return () => window.removeEventListener('lingoland_daily_mission_completed', handleGameMissionDone);
  }, [pet]);

  // Petting interaction
  const handlePet = () => {
    if (!pet || pet.energy === 0) return;
    setIsPetting(true);
    const persona = PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader'] || PERSONALITY_ARCHETYPES.cheerleader;
    setChatMessage(persona.petReaction(pet.petType, pet.petName));
    const newMood = Math.min(100, pet.mood + 10);
    const newCoins = pet.coins + 5; // Petting yields minor coins
    updatePetState({ mood: newMood, coins: newCoins });
    advanceMissionProgress('m_care', 1);
    setTimeout(() => setIsPetting(false), 800);
  };

  // Feed interaction
  const handleFeed = () => {
    if (!pet || pet.energy === 0) return;
    if (!isAdmin && pet.coins < 15) {
      toast({
        title: "Insufficient Coins",
        description: "Feeding snacks costs 15 Lingo-Coins. Complete games to earn more!",
      });
      return;
    }
    const persona = PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader'] || PERSONALITY_ARCHETYPES.cheerleader;
    setChatMessage(persona.feedReaction(pet.petName));
    const newEnergy = Math.min(100, pet.energy + 20);
    const newMood = Math.min(100, pet.mood + 10);
    const newCoins = isAdmin ? pet.coins : pet.coins - 15;
    updatePetState({ energy: newEnergy, mood: newMood, coins: newCoins });
    advanceMissionProgress('m_care', 1);
  };

  // Select Pet Species
  const handleSelectPetType = (type: LingoPetType) => {
    if (!pet) return;
    const names: Record<string, string> = { 
      owl: 'Lingo', 
      dino: 'Pip', 
      kitty: 'Mimi',
      phoenix: 'Ignis',
      morphling: 'Morphy',
      godly: 'Aether',
      floby: 'Floby',
      'tome-tortoise': 'Shelly',
      'lore-drake': 'Drakon',
      'seed-rooter': 'Rusty',
      'terra-keeper': 'Sylvan',
      pip: 'Pip',
      'echo-grif': 'Griffin',
      'acu-maestro': 'Maestro',
      'chirp-wing': 'Zephyr',
      'sonic-storm': 'Tempest',
      igni: 'Igni',
      'spark-fox': 'Kitsune',
      'rune-stalker': 'Fenrir',
      'ember-scribe': 'Blaze',
      'pyro-phoenix': 'Solaris'
    };
    const node = ALL_EVOLUTION_NODES[type];
    const starter = getStarterLineForPet(type) || pet.starterLine;
    const isCustomized = !Object.values(names).includes(pet.petName);
    const newName = isCustomized ? pet.petName : (names[type] || type);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('lingopet_selected_pet', type);
      localStorage.setItem('lingopet_view_mode', 'classic');
      if (user) {
        localStorage.setItem(`lingopet_selected_pet_${user.uid}`, type);
        localStorage.setItem(`lingopet_view_mode_${user.uid}`, 'classic');
      }
    }

    updatePetState({ 
      isActivated: true,
      petType: type, 
      petName: newName,
      starterLine: starter || 'floby',
      evolutionTier: node?.tier ?? 1,
      activeBonusTitle: node?.statBonusTitle || 'Classic Mascot',
      activeBonusDesc: node?.statBonusDesc || 'Loyal language study companion.'
    });
    const displayName = node?.name || type;
    setChatMessage(`I've morphed into ${displayName}! Meet ${newName}!`);
    toast({
      title: "✨ Active Mascot & Floating Avatar Synced!",
      description: `Your companion is now ${displayName} (${newName})! When you click back to the menu or study anywhere, this exact pet floats beside you.`,
    });
  };

  // Evolution Tree Handler
  const handleEvolveStarter = (newType: LingoPetType, branch?: EvolutionBranch, tier?: 1 | 2 | 3) => {
    if (!pet) return;
    const node = ALL_EVOLUTION_NODES[newType];
    const starterLine = getStarterLineForPet(newType) || pet.starterLine || 'floby';

    // Verify unlock eligibility if not admin and not already this petType
    if (!isAdmin && (tier === 2 || tier === 3) && branch && pet.petType !== newType) {
      const eligibility = evaluateBranchEligibility(pet, branch, tier, starterLine);
      if (!eligibility.eligible) {
        toast({
          variant: "destructive",
          title: "🔒 Evolution Locked",
          description: `You must unlock this evolution tier first: ${eligibility.reasons.join(', ')}`,
        });
        return;
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('lingopet_selected_pet', newType);
      localStorage.setItem('lingopet_view_mode', '3d');
      if (user) {
        localStorage.setItem(`lingopet_selected_pet_${user.uid}`, newType);
        localStorage.setItem(`lingopet_view_mode_${user.uid}`, '3d');
      }
    }

    // Milestone auto-level advancement ONLY for admin testing
    let newLevel = pet.level;
    if (isAdmin) {
      if (tier === 2 && newLevel < 15) newLevel = 15;
      if (tier === 3 && newLevel < 30) newLevel = 30;
    }

    const updates: Partial<UserPet> = {
      isActivated: true,
      petType: newType,
      starterLine,
      evolutionTier: tier || (node?.tier ?? 1),
      evolutionBranch: branch,
      evolutionTrackName: node?.branchName || (branch === 'A' ? 'Study/Pronunciation' : branch === 'B' ? 'Speed/Arcade' : 'Starter'),
      activeBonusTitle: node?.statBonusTitle || 'Language Mastery',
      activeBonusDesc: node?.statBonusDesc || 'Active focus evolution power.',
      level: newLevel
    };

    if (newType === 'rune-stalker') {
      updates.equippedAura = 'flaming-prose';
    }

    const defaultNames: Record<string, string> = {
      floby: 'Floby',
      'tome-tortoise': 'Shelly',
      'lore-drake': 'Drakon',
      'seed-rooter': 'Rusty',
      'terra-keeper': 'Sylvan',
      pip: 'Pip',
      'echo-grif': 'Griffin',
      'acu-maestro': 'Maestro',
      'chirp-wing': 'Zephyr',
      'sonic-storm': 'Tempest',
      igni: 'Igni',
      'spark-fox': 'Kitsune',
      'rune-stalker': 'Fenrir',
      'ember-scribe': 'Blaze',
      'pyro-phoenix': 'Solaris'
    };
    if (defaultNames[newType] && (!pet.petName || ['Lingo', 'Pip', 'Mimi', 'Ignis', 'Morphy', 'Aether'].includes(pet.petName))) {
      updates.petName = defaultNames[newType];
    }

    updatePetState(updates);

    const displayName = node ? `${node.name} (${node.speciesName})` : newType;
    setChatMessage(`✨ Magnificent! I have evolved into ${displayName}! Active Focus Power: "${node?.statBonusTitle || 'Language Mastery'}"!`);

    toast({
      title: `🎉 Evolution Complete: ${node?.name || newType}!`,
      description: `Power Unlocked: ${node?.statBonusTitle} - ${node?.statBonusDesc}`,
      className: "bg-indigo-950 border-indigo-500/50 text-indigo-100"
    });
  };

  // Synchronize student learning stats from practice sessions
  const handleUpdateLearningStats = (updatedStats: Partial<UserPet['learningStats']>) => {
    if (!pet) return;
    const currentStats = pet.learningStats || {};
    const newStats = { ...currentStats, ...updatedStats };
    updatePetState({ learningStats: newStats });
    toast({
      title: "Learning Telemetry Synced! 📊",
      description: "Classroom test scores and study behaviors updated.",
      className: "bg-slate-900 border-slate-700 text-slate-200"
    });
  };

  // Select Personality Archetype
  const handleSelectPersonality = (archetypeId: 'cheerleader' | 'scholar' | 'zen' | 'trickster' | 'cyberpunk') => {
    if (!pet) return;
    const persona = PERSONALITY_ARCHETYPES[archetypeId];
    if (!persona) return;
    updatePetState({ personality: archetypeId });
    setChatMessage(persona.sampleGreeting);
    toast({
      title: `Personality Awakened: ${persona.name} ${persona.icon}`,
      description: `${pet.petName}'s speech and reactions will now embody the ${persona.name} persona!`,
      className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
    });
  };

  // Save Custom Pet Nickname
  const handleSavePetName = () => {
    if (!pet) return;
    const trimmed = tempPetName.trim();
    if (!trimmed) {
      toast({ variant: 'destructive', title: 'Invalid Name', description: 'Please enter a valid nickname.' });
      return;
    }
    if (trimmed.length > 20) {
      toast({ variant: 'destructive', title: 'Name Too Long', description: 'Nickname must be 20 characters or less.' });
      return;
    }
    updatePetState({ petName: trimmed });
    setIsEditingName(false);
    toast({
      title: "Companion Renamed! ✨",
      description: `Your companion is now proudly known as "${trimmed}"!`,
      className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
    });
    setChatMessage(`Call me ${trimmed}! That is my proud new name!`);
  };

  // Generate random cute nickname
  const handleRandomizeName = () => {
    const random = RANDOM_CUTE_NAMES[Math.floor(Math.random() * RANDOM_CUTE_NAMES.length)];
    setTempPetName(random);
  };

  // Lingo-Shop Logic
  const handlePurchase = (item: typeof SHOP_ITEMS[number] | typeof EVOLUTION_RELIC_SHOP_ITEMS[number]) => {
    if (!pet) return;
    if (!isAdmin && pet.coins < item.price) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: "You don't have enough Lingo-Coins.",
      });
      return;
    }

    if (pet.unlockedCosmetics.includes(item.id)) {
      toast({
        title: "Already Owned",
        description: `You already own the ${item.name}!`,
      });
      return;
    }

    const updatedUnlocked = [...pet.unlockedCosmetics, item.id];
    const newCoins = isAdmin ? pet.coins : pet.coins - item.price;
    
    // Auto-equip on purchase for instant gratification
    const currentEquipped = { ...pet.equippedCosmetics };
    let newBg = pet.currentBackground;
    if (item.category === 'background') {
      newBg = (item as any).value || 'cozy-room';
    } else if (item.category === 'hat') {
      currentEquipped.hat = item.id;
    } else if (item.category === 'glasses') {
      currentEquipped.glasses = item.id;
    } else if (item.category === 'necklace') {
      currentEquipped.necklace = item.id;
    } else if (item.category === 'shoes') {
      currentEquipped.shoes = item.id;
    } else if (item.category === 'wings') {
      currentEquipped.wings = item.id;
    } else if (item.category === 'costume') {
      currentEquipped.costume = item.id;
    }

    updatePetState({ 
      unlockedCosmetics: updatedUnlocked, 
      coins: newCoins,
      equippedCosmetics: currentEquipped,
      currentBackground: newBg
    });

    toast({
      title: "Item Purchased & Equipped!",
      description: isAdmin 
        ? `Unlocked & equipped ${item.name} (Admin Mode)!` 
        : `Bought & equipped ${item.name} for ${item.price} coins!`,
    });
  };

  const handleEquip = (item: typeof SHOP_ITEMS[number] | typeof EVOLUTION_RELIC_SHOP_ITEMS[number]) => {
    if (!pet) return;

    if (item.category === 'background') {
      const val = (item as any).value || 'cozy-room';
      updatePetState({ currentBackground: val });
      toast({ title: "Background Changed", description: `Equipped ${item.name} background!` });
      return;
    }

    const currentEquipped = { ...pet.equippedCosmetics };
    if (item.category === 'hat') {
      currentEquipped.hat = currentEquipped.hat === item.id ? undefined : item.id;
    } else if (item.category === 'glasses') {
      currentEquipped.glasses = currentEquipped.glasses === item.id ? undefined : item.id;
    } else if (item.category === 'necklace') {
      currentEquipped.necklace = currentEquipped.necklace === item.id ? undefined : item.id;
    } else if (item.category === 'shoes') {
      currentEquipped.shoes = currentEquipped.shoes === item.id ? undefined : item.id;
    } else if (item.category === 'wings') {
      currentEquipped.wings = currentEquipped.wings === item.id ? undefined : item.id;
    } else if (item.category === 'costume') {
      currentEquipped.costume = currentEquipped.costume === item.id ? undefined : item.id;
    } else if (item.category === 'aura') {
      currentEquipped.aura = currentEquipped.aura === item.id ? undefined : item.id;
    }

    updatePetState({ equippedCosmetics: currentEquipped });
    toast({
      title: "Outfit Updated",
      description: `Equipped/Unequipped ${item.name}!`,
    });
  };

  // AI Chat Handler
  const handleSendChat = async () => {
    if (!pet || !chatInput.trim()) return;
    setAiLoading(true);
    setIsTalking(true);
    const queryText = chatInput;
    setChatInput('');

    try {
      const res = await generatePetChatResponse({
        petName: pet.petName,
        petType: pet.petType,
        level: pet.level,
        energy: pet.energy,
        intelligence: pet.intelligence,
        mood: pet.mood,
        recentGames: recentGames.length > 0 ? recentGames : ['Bio Hazard', 'Synonym Sniper'],
        userName: user?.displayName || 'Student',
        userInput: queryText,
        personality: pet.personality || 'cheerleader',
      });

      setChatMessage(res.message);
      advanceMissionProgress('m_chat', 1);
      if (res.suggestedAction) {
        toast({
          title: "Study Tip",
          description: `Your pet suggests playing ${res.suggestedAction} to level up!`,
          duration: 6000,
        });
      }
    } catch (err) {
      console.error(err);
      setChatMessage("Hoo... My brain signals got tangled. Let's try again in a bit!");
    } finally {
      setAiLoading(false);
      setIsTalking(false);
    }
  };

  // Wake-up quiz trigger
  const handleStartWakeupQuiz = () => {
    // Shuffle and pick 5 unique questions
    const shuffled = [...WAKEUP_QUESTIONS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setCurrentQuizQuestions(selected);
    setQuizActive(true);
    setQuizStep(0);
    setQuizScore(0);
    setSelectedQuizAnswer(null);
  };

  const handleSelectQuizAnswer = (option: string) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(option);
    const currentQ = currentQuizQuestions[quizStep];
    if (currentQ && option === currentQ.answer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    if (quizStep + 1 < currentQuizQuestions.length) {
      setQuizStep(prev => prev + 1);
    } else {
      // Quiz finished
      setQuizActive(false);
      const passed = quizScore >= 3;
      if (passed) {
        advanceMissionProgress('m_vocab', 1);
        toast({
          title: "Wake-up Success!",
          description: "Your pet has woken up and recovered 50 Energy Points!",
        });
        updatePetState({ energy: 50 });
        setChatMessage(`Hoo! I'm wide awake now! Thanks for feeding my brain with those quiz answers!`);
      } else {
        toast({
          variant: "destructive",
          title: "Quiz Failed",
          description: "Scored under 60%. Try again to wake up your pet.",
        });
        setChatMessage(`Zzz... I'm still too tired. Please try the wake-up quiz again!`);
      }
    }
  };

  // Force simulated decay to 0 energy to test wake-up quiz
  const simulateSleepDecay = () => {
    updatePetState({ energy: 0 });
    setChatMessage("Zzz... I'm too tired. Wake me up with a brain quiz!");
    toast({
      title: "Decay Simulated",
      description: "Pet energy reduced to 0. It has fallen asleep.",
    });
  };

  const isSleeping = pet.energy === 0;

  // 1. GUEST OR NON-LOGGED-IN ACCOUNT GATE
  if (!user || isGuest) {
    return (
      <div className="w-full max-w-5xl px-4 py-8 mx-auto flex flex-col items-center gap-8 text-slate-100">
        {/* Guest Lock Banner */}
        <div className="w-full text-center space-y-4">
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 px-3.5 py-1 text-xs uppercase tracking-wider font-bold">
            <Lock className="w-3.5 h-3.5 mr-1.5 inline" /> Registered Learner Exclusive
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-200 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
            Adopt Your LingoPet Companion
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            LingoPets are active companions that journey with you across all pages of LingoLand! Complete daily missions, earn Lingo-Coins, evolve through 3-tier evolution trees, and equip ultra-realistic 3D relics & auras.
          </p>
        </div>

        {/* 4 Starter Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {STARTER_ACTIVATION_OPTIONS.map((starter) => (
            <Card key={starter.type} className="border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden relative group hover:border-indigo-500/50 transition-all shadow-xl">
              <div className="h-44 w-full bg-gradient-to-b from-indigo-950/40 to-slate-950/80 flex items-center justify-center p-2 relative">
                <LingoPet3D
                  petType={starter.type}
                  level={1}
                  hideHint={true}
                  className="w-full h-full pointer-events-none"
                />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-base">{starter.name}</h3>
                  <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 text-slate-300">
                    {starter.element}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{starter.desc}</p>
                <div className="text-[11px] font-semibold text-emerald-400 pt-1">
                  ⭐ {starter.bonus}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Unlocks Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-200">3D Floating Companion</h4>
              <p className="text-xs text-slate-400 mt-1">Your pet floats on the bottom right of all pages with voice & interactive guidance.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-200">Daily Study Missions</h4>
              <p className="text-xs text-slate-400 mt-1">Complete language challenges each day to level up your pet and earn Lingo-Coins.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-200">3D Relics & Cosmic Auras</h4>
              <p className="text-xs text-slate-400 mt-1">Equip mythical weapons, ancient grimoires, and rotating animated energy auras.</p>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link href="/signup?redirect=/lingo-pet">
            <Button className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black px-8 py-6 text-base shadow-xl">
              <UserPlus className="w-5 h-5 mr-2" />
              {isGuest ? "Register Account to Adopt Pet" : "Create Free Account"}
            </Button>
          </Link>
          <Link href="/login?redirect=/lingo-pet">
            <Button variant="outline" className="border-slate-700 hover:border-slate-500 text-slate-300 px-6 py-6 text-sm">
              Sign In with Existing Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. REGISTERED ACCOUNT PET ACTIVATION CEREMONY
  if (!pet.isActivated) {
    const selectedOption = STARTER_ACTIVATION_OPTIONS.find(o => o.type === activationStarter) || STARTER_ACTIVATION_OPTIONS[0];

    return (
      <div className="w-full max-w-4xl px-4 py-8 mx-auto flex flex-col items-center gap-8 text-slate-100">
        <div className="w-full text-center space-y-3">
          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 px-3.5 py-1 text-xs uppercase tracking-wider font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" /> Hatchery & Activation Ceremony
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            Hatch & Activate Your LingoPet
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
            Welcome to LingoLand, {user?.displayName || 'Adventurer'}! Choose your loyal language learning partner, give them a companion name, and activate your personal 3D floating assistant!
          </p>
        </div>

        {/* Step 1: Starter Selection */}
        <div className="w-full space-y-3">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <span>Step 1: Choose Your Starter Companion</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STARTER_ACTIVATION_OPTIONS.map((starter) => {
              const isSelected = activationStarter === starter.type;
              return (
                <div
                  key={starter.type}
                  onClick={() => {
                    setActivationStarter(starter.type);
                    setActivationName(starter.name);
                  }}
                  className={`cursor-pointer rounded-2xl p-3 border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-900 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/50"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-white text-sm">{starter.name}</h4>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-300">{starter.element}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{starter.desc}</p>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold pt-2">
                    {starter.bonus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live 3D Preview of Selected Starter */}
        <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-900/90 border border-slate-800 p-6 flex flex-col items-center relative shadow-2xl">
          <div className="w-56 h-56 relative flex items-center justify-center">
            <LingoPet3D
              petType={activationStarter}
              level={1}
              energy={100}
              mood={100}
              hideHint={true}
              className="w-full h-full pointer-events-none"
            />
          </div>

          <div className="w-full space-y-3 pt-3">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Step 2: Name Your Companion
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={activationName}
                onChange={(e) => setActivationName(e.target.value)}
                maxLength={20}
                placeholder="Companion Name"
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none transition-all"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const names = ['Sprout', 'Zephyr', 'Blaze', 'Athena', 'Echo', 'Nimbus', 'Nova', 'Pebble', 'Flora'];
                  const picked = names[Math.floor(Math.random() * names.length)];
                  setActivationName(picked);
                }}
                className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                title="Random Name"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Starter Gift Box */}
          <div className="w-full mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Starter Bonus: 200 Coins + 4 Daily Quests</span>
            </div>
            <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px]">Free Gift</Badge>
          </div>

          {/* Activate Button */}
          <Button
            onClick={handleActivatePet}
            disabled={isActivating}
            className="w-full mt-5 py-6 text-base font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
          >
            {isActivating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Awakening Companion...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                ✨ Activate LingoPet & Begin Journey
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 3. FULL SANCTUARY FOR ACTIVATED PETS
  return (
    <div className="w-full max-w-full px-4 md:px-8 mx-auto flex flex-col gap-6 p-2 md:p-6 text-slate-100 relative">
      
      {/* Top Floating Coins Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 font-bold text-xs shadow-sm"
              title="Return to Dashboard / Main Menu"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Back to Menu</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-200 via-indigo-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400 shrink-0" />
              Lingo-Pet Companion
            </h1>
            <p className="text-xs text-slate-400">Your visual language study feedback loop & companion</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <Coins className="h-5 w-5 text-amber-400 animate-pulse" />
            <span className="font-black text-amber-300 text-sm">
              {isAdmin ? "∞" : pet.coins} Lingo-Coins
            </span>
            {isAdmin && (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold px-2 py-0 h-5">
                Admin
              </Badge>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={simulateSleepDecay} 
            className="text-[10px] text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
          >
            Simulate Sleep Decay
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THE PET VIEW & QUICK STATS */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {STARTER_PET_TYPES.includes(pet.petType) ? (
            <div className="relative">
              <LingoPetAvatarCard
                pet={pet}
                onPet={handlePet}
                onFeed={handleFeed}
                isPetting={isPetting}
                isSleeping={isSleeping}
                isTalking={isTalking}
                onSwitchMode={() => setAvatarViewStyle('3d')}
                isEditingName={isEditingName}
                tempPetName={tempPetName}
                setTempPetName={setTempPetName}
                handleSavePetName={handleSavePetName}
                handleRandomizeName={handleRandomizeName}
                setIsEditingName={setIsEditingName}
                personalityMeta={PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']}
                onPersonalityClick={() => setActiveSubTab('personality')}
              />

              {/* Overlaid Wake-up Quiz Prompt if asleep */}
              {isSleeping && !quizActive && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-30 transition-all">
                  <AlertCircle className="h-12 w-12 text-amber-500 animate-bounce mb-3" />
                  <h3 className="font-extrabold text-lg text-slate-100">Pet is Asleep</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                    Your pet is too tired because you haven't practiced or logged in. Solve a quick quiz to wake it up!
                  </p>
                  <Button 
                    onClick={handleStartWakeupQuiz}
                    className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-6 shadow-md shadow-amber-500/20"
                  >
                    <Play className="h-4 w-4 mr-1.5 fill-slate-950" />
                    Take Wake-up Quiz
                  </Button>
                </div>
              )}

              {/* Active Wake-up Quiz Interface */}
              {quizActive && (
                <div className="absolute inset-0 bg-slate-950 rounded-3xl flex flex-col justify-between p-6 z-30 border border-slate-800">
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Brain Activation Quiz</span>
                      <span className="text-xs text-slate-500">Question {quizStep + 1} of {currentQuizQuestions.length}</span>
                    </div>
                    
                    {(() => {
                      const currentQ = currentQuizQuestions[quizStep];
                      if (!currentQ) return null;
                      return (
                        <div className="flex flex-col gap-4">
                          <h4 className="text-sm font-bold text-slate-200">{currentQ.question}</h4>
                          <div className="flex flex-col gap-2.5">
                            {currentQ.options.map((option, idx) => {
                              const isSelected = selectedQuizAnswer === option;
                              const isCorrect = option === currentQ.answer;
                              const hasAnswered = selectedQuizAnswer !== null;

                              let optClass = "border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300";
                              if (hasAnswered) {
                                if (isCorrect) optClass = "border-green-500/50 bg-green-500/10 text-green-300";
                                else if (isSelected) optClass = "border-rose-500/50 bg-rose-500/10 text-rose-300";
                                else optClass = "border-slate-900 bg-slate-950/20 opacity-40";
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={hasAnswered}
                                  onClick={() => handleSelectQuizAnswer(option)}
                                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all ${optClass}`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-900">
                    {selectedQuizAnswer !== null && (
                      <Button 
                        onClick={handleNextQuizQuestion}
                        className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold"
                        size="sm"
                      >
                        {quizStep + 1 === currentQuizQuestions.length ? "Finish Quiz" : "Next Question"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md overflow-hidden relative group">
              {/* Companion Identity Header (Name, Edit Button & Personality Badge) */}
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-slate-800/60 bg-slate-950/40">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
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
                      <button
                        type="button"
                        onClick={handleRandomizeName}
                        title="Randomize cute name"
                        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-300 transition-colors"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                      </button>
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
                      <span className="text-sm sm:text-base font-black text-slate-100 tracking-tight">
                        {pet.petName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempPetName(pet.petName);
                          setIsEditingName(true);
                        }}
                        title="Rename your companion"
                        className="text-slate-500 hover:text-indigo-400 opacity-60 group-hover/name:opacity-100 transition-all p-1 hover:bg-slate-800/60 rounded-md"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {STARTER_PET_TYPES.includes(pet.petType) && (
                    <button
                      type="button"
                      onClick={() => setAvatarViewStyle('realistic_2d')}
                      className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-sm"
                      title="Switch to ultra-realistic 2D animated avatar"
                    >
                      🎨 2D Avatar
                    </button>
                  )}

                  {/* Personality Archetype Pill Button (Quick jump to Personality tab) */}
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('personality')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm ${
                      PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']?.badgeClass || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    }`}
                    title="Click to view & change personality archetype"
                  >
                    <span>{PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']?.icon}</span>
                    <span className="truncate max-w-[110px] sm:max-w-[140px]">
                      {PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']?.name}
                    </span>
                  </button>
                </div>
              </div>

              {/* Visualizer Panel */}
              <div className="p-3">
                <LingoPetVisual
                  petType={pet.petType}
                  level={pet.level}
                  energy={pet.energy}
                  mood={pet.mood}
                  equippedCosmetics={pet.equippedCosmetics}
                  currentBackground={pet.currentBackground}
                  isPetting={isPetting}
                  isSleeping={isSleeping}
                  isTalking={isTalking}
                />
              </div>

              {/* Overlaid Wake-up Quiz Prompt if asleep */}
              {isSleeping && !quizActive && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center z-30 transition-all">
                  <AlertCircle className="h-12 w-12 text-amber-500 animate-bounce mb-3" />
                  <h3 className="font-extrabold text-lg text-slate-100">Pet is Asleep</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                    Your pet is too tired because you haven't practiced or logged in. Solve a quick quiz to wake it up!
                  </p>
                  <Button 
                    onClick={handleStartWakeupQuiz}
                    className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-6 shadow-md shadow-amber-500/20"
                  >
                    <Play className="h-4 w-4 mr-1.5 fill-slate-950" />
                    Take Wake-up Quiz
                  </Button>
                </div>
              )}

              {/* Active Wake-up Quiz Interface */}
              {quizActive && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col justify-between p-6 z-30">
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Brain Activation Quiz</span>
                      <span className="text-xs text-slate-500">Question {quizStep + 1} of {currentQuizQuestions.length}</span>
                    </div>
                    
                    {(() => {
                      const currentQ = currentQuizQuestions[quizStep];
                      if (!currentQ) return null;
                      return (
                        <div className="flex flex-col gap-4">
                          <h4 className="text-sm font-bold text-slate-200">{currentQ.question}</h4>
                          <div className="flex flex-col gap-2.5">
                            {currentQ.options.map((option, idx) => {
                              const isSelected = selectedQuizAnswer === option;
                              const isCorrect = option === currentQ.answer;
                              const hasAnswered = selectedQuizAnswer !== null;

                              let optClass = "border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300";
                              if (hasAnswered) {
                                if (isCorrect) optClass = "border-green-500/50 bg-green-500/10 text-green-300";
                                else if (isSelected) optClass = "border-rose-500/50 bg-rose-500/10 text-rose-300";
                                else optClass = "border-slate-900 bg-slate-950/20 opacity-40";
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={hasAnswered}
                                  onClick={() => handleSelectQuizAnswer(option)}
                                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all ${optClass}`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-900">
                    {selectedQuizAnswer !== null && (
                      <Button 
                        onClick={handleNextQuizQuestion}
                        className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold"
                        size="sm"
                      >
                        {quizStep + 1 === currentQuizQuestions.length ? "Finish Quiz" : "Next Question"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Quick action buttons below pet card */}
              <CardFooter className="p-4 bg-slate-950/40 border-t border-slate-900/60 flex justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={isSleeping}
                  onClick={handlePet}
                  className="flex-1 bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-200 gap-1.5 h-11 text-xs"
                >
                  <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
                  Pet mascot (+Mood)
                </Button>
                <Button
                  variant="outline"
                  disabled={isSleeping}
                  onClick={handleFeed}
                  className="flex-1 bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-200 gap-1.5 h-11 text-xs"
                >
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                  Feed snack (15 🪙)
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Level Progress details */}
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Level {pet.level} Progress</span>
              <span className="font-bold text-indigo-400">{pet.xp} / {pet.level * 500} XP</span>
            </div>
            <Progress value={(pet.xp / (pet.level * 500)) * 100} className="bg-slate-950 h-2" />
            <p className="text-[10px] text-slate-500 leading-normal mt-1">
              🏆 Earn **100 XP** automatically every time you complete a vocabulary, reading, or science quiz game on LingoLand!
            </p>
          </Card>

          {/* Admin Evolution Testing Controls */}
          {isAdmin && (
            <Card className="bg-slate-900/50 border-amber-500/30 backdrop-blur-md p-4 flex flex-col gap-3 border shadow-lg shadow-amber-500/5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-black text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin Evolution Tester
                </span>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 text-[9px] uppercase px-1.5 py-0">
                  Admin Exclusive
                </Badge>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="text-[10px] text-slate-455 leading-tight text-slate-400">
                  Modify your companion's level to view the design evolutions (Milestones: 15, 30, 45, 60, 75, 90, 100+).
                </div>
                
                {/* Level Up/Down buttons */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      const newLevel = Math.max(1, pet.level - 1);
                      updatePetState({ level: newLevel });
                    }}
                    className="flex-1 bg-slate-950 border-slate-800 text-[10px] h-8 hover:bg-slate-900 text-slate-300"
                  >
                    -1 Level
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      const newLevel = Math.max(1, pet.level - 15);
                      updatePetState({ level: newLevel });
                    }}
                    className="flex-1 bg-slate-950 border-slate-800 text-[10px] h-8 hover:bg-slate-900 text-slate-300"
                  >
                    -15 Levels
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      const newLevel = pet.level + 15;
                      updatePetState({ level: newLevel });
                    }}
                    className="flex-1 bg-slate-950 border-slate-800 text-[10px] h-8 hover:bg-slate-900 text-slate-300"
                  >
                    +15 Levels
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      const newLevel = pet.level + 1;
                      updatePetState({ level: newLevel });
                    }}
                    className="flex-1 bg-slate-950 border-slate-800 text-[10px] h-8 hover:bg-slate-900 text-slate-300"
                  >
                    +1 Level
                  </Button>
                </div>

                {/* Milestone Quick Jumps */}
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {[1, 15, 30, 45, 60, 75, 90, 100].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => updatePetState({ level: lvl })}
                      className={cn(
                        "h-7 text-[10px] font-black rounded border transition-all",
                        (lvl === 100 ? pet.level >= 100 : pet.level === lvl)
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                          : "bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      )}
                    >
                      Lvl {lvl === 100 ? "100+" : lvl}
                    </button>
                  ))}
                </div>

                {/* Starter Line Quick Tester */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase text-amber-400">Starter Lines Quick Tester:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleEvolveStarter('floby', undefined, 1)}
                      className="text-[9px] font-bold py-1 px-1.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                    >
                      🌿 Floby (Vocab)
                    </button>
                    <button
                      onClick={() => handleEvolveStarter('pip', undefined, 1)}
                      className="text-[9px] font-bold py-1 px-1.5 rounded bg-sky-950/60 border border-sky-500/40 text-sky-300 hover:bg-sky-900/60"
                    >
                      🎵 Pip (Phonics)
                    </button>
                    <button
                      onClick={() => handleEvolveStarter('igni', undefined, 1)}
                      className="text-[9px] font-bold py-1 px-1.5 rounded bg-orange-950/60 border border-orange-500/40 text-orange-300 hover:bg-orange-900/60"
                    >
                      🔥 Igni (Grammar)
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: VITALITY BARS, SHOP, SPEECH & ACTIONS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Pet Dialogue Speech Bubble */}
          <div className={cn(
            "bg-zinc-950/90 border border-indigo-500/30 backdrop-blur-2xl rounded-2xl p-4 relative flex items-start gap-3 shadow-2xl transition-all",
            pet.equippedAura === 'flaming-prose' && "ring-2 ring-orange-500/80 shadow-[0_0_24px_rgba(249,115,22,0.4)] border-orange-500/60"
          )}>
            <div className="text-2xl p-2 bg-indigo-500/15 rounded-xl border border-indigo-500/20 shrink-0">
              {pet.equippedAura === 'flaming-prose' ? '🔥' : (PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']?.icon || '💬')}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-black uppercase text-indigo-300 tracking-wider">
                  {pet.petName} the {pet.petType}
                </span>
                <Badge className={`${PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']?.badgeClass || 'bg-indigo-500/20 text-indigo-300'} text-[9px] font-black uppercase px-2 py-0 h-4.5 border border-indigo-500/30`}>
                  {PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']?.name || 'Cheerleader'}
                </Badge>
                {pet.equippedAura === 'flaming-prose' && (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 text-[9px] font-black uppercase px-2 py-0 h-4.5">
                    Flaming Aura ✨
                  </Badge>
                )}
              </div>
              <p className="text-xs md:text-sm text-zinc-100 leading-relaxed font-semibold">
                {chatMessage}
              </p>

              {/* Active English Focus Power Pill */}
              {pet.activeBonusTitle && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 font-bold shadow-sm">
                  <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span>
                    <strong className="text-amber-300">Focus Power:</strong> {pet.activeBonusTitle} &mdash; <span className="text-amber-200/80">{pet.activeBonusDesc}</span>
                  </span>
                </div>
              )}
            </div>
            {/* Ambient bubble tail */}
            <div className="absolute left-6 -bottom-2 w-4 h-4 bg-zinc-950 border-r border-b border-indigo-500/30 transform rotate-45 pointer-events-none" />
          </div>

          {/* Vitality Bars Card */}
          <Card className="bg-zinc-950/90 border-slate-700/80 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-400" />
              Mascot Vitality Indicators
            </h3>
            <div className="flex flex-col gap-5">
              
              {/* Energy Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 fill-amber-400/20 text-amber-400" />
                    Energy (Consistency)
                  </span>
                  <span className="font-extrabold text-amber-200">{pet.energy} / 100</span>
                </div>
                <Progress value={pet.energy} className="bg-slate-900 border border-white/10 h-3" />
                <p className="text-xs text-zinc-300 font-medium">Decreases by 15 points every 24 hours missed. Wake up pet with a quiz if it hits 0.</p>
              </div>

              {/* Intelligence Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 fill-indigo-400/20 text-indigo-400" />
                    Intelligence (Platform Accuracy)
                  </span>
                  <span className="font-extrabold text-indigo-200">{pet.intelligence} / 100</span>
                </div>
                <Progress value={pet.intelligence} className="bg-slate-900 border border-white/10 h-3" />
                <p className="text-xs text-zinc-300 font-medium">Increases when you score high marks in classroom tests and game activities.</p>
              </div>

              {/* Mood Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-pink-300 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 fill-pink-400/20 text-pink-400" />
                    Mood (Happiness)
                  </span>
                  <span className="font-extrabold text-pink-200">{pet.mood} / 100</span>
                </div>
                <Progress value={pet.mood} className="bg-slate-900 border border-white/10 h-3" />
                <p className="text-xs text-zinc-300 font-medium">Boost by petting (+10) or feeding snacks. Encourages high daily platform usage.</p>
              </div>

            </div>
          </Card>

          {/* Sub Navigation tabs */}
          <div className="flex gap-2 border border-white/10 bg-zinc-950/80 backdrop-blur-md rounded-xl p-1 overflow-x-auto scrollbar-none">
            {[
              { id: 'tree', label: 'Evolution Trees', icon: '🌳' },
              { id: 'missions', label: 'Daily Missions', icon: '🎯' },
              { id: 'feed', label: 'Classic Morphing', icon: '🧬' },
              { id: 'personality', label: 'Personality Archetype', icon: '🎭' },
              { id: 'shop', label: 'Lingo-Shop', icon: '🛍️' },
              { id: 'chat', label: 'AI Companion Chat', icon: '💬' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 sm:px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg transition-all flex items-center gap-1.5 ${
                  activeSubTab === tab.id 
                    ? "bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            
            {/* DAILY MISSIONS & QUESTS TAB */}
            {activeSubTab === 'missions' && (
              <motion.div
                key="missions"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-400" />
                      Daily Learning Missions
                    </h3>
                    <p className="text-xs text-slate-300">
                      Complete educational quests to earn Lingo-Coins and XP to level up your companion!
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-amber-400/40 bg-amber-500/10 text-amber-300 font-bold px-3 py-1">
                      🪙 Total Coins: {pet.coins}
                    </Badge>
                    <Badge variant="outline" className="border-indigo-400/40 bg-indigo-500/10 text-indigo-300 font-bold px-3 py-1">
                      ⭐ Level {pet.level} ({pet.xp || 0} XP)
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(pet.missions || DEFAULT_MISSIONS).map((mission) => {
                    const isDone = mission.progress >= mission.maxProgress || mission.completed;
                    const isClaimed = mission.claimed;

                    return (
                      <Card
                        key={mission.id}
                        className={`border transition-all overflow-hidden relative ${
                          isDone && !isClaimed
                            ? "bg-slate-900/90 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/40"
                            : isClaimed
                            ? "bg-slate-950/60 border-slate-800/80 opacity-75"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                                  {mission.category === 'vocab' && <BookOpen className="w-4 h-4 text-emerald-400" />}
                                  {mission.category === 'game' && <Gamepad2 className="w-4 h-4 text-cyan-400" />}
                                  {mission.category === 'care' && <Heart className="w-4 h-4 text-pink-400" />}
                                  {mission.category === 'conversation' && <MessageSquare className="w-4 h-4 text-amber-400" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-white">{mission.title}</h4>
                                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-white/10">
                                    {mission.category}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-amber-400">+{mission.rewardCoins} 🪙</span>
                                <div className="text-[10px] font-bold text-indigo-300">+{mission.rewardXp} XP</div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{mission.description}</p>
                          </div>

                          <div className="space-y-2 pt-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">Progress</span>
                              <span className="font-mono font-bold text-slate-200">
                                {mission.progress} / {mission.maxProgress}
                              </span>
                            </div>
                            <Progress
                              value={Math.min(100, (mission.progress / mission.maxProgress) * 100)}
                              className="h-2 bg-slate-950 border border-white/5"
                            />

                            <div className="pt-2">
                              {isClaimed ? (
                                <Button disabled className="w-full text-xs font-bold bg-slate-800 text-slate-500 h-9">
                                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> Reward Claimed
                                </Button>
                              ) : isDone ? (
                                <Button
                                  onClick={() => handleClaimMission(mission.id)}
                                  className="w-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 h-9 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                                >
                                  <Sparkles className="w-4 h-4 mr-1.5" /> Claim +{mission.rewardCoins} Coins & XP!
                                </Button>
                              ) : mission.actionUrl?.startsWith('#') ? (
                                <Button
                                  onClick={() => setActiveSubTab(mission.actionUrl === '#chat' ? 'chat' : 'feed')}
                                  variant="outline"
                                  className="w-full text-xs font-bold border-indigo-500/30 text-indigo-200 hover:bg-indigo-950/40 h-9"
                                >
                                  Interact Now ➔
                                </Button>
                              ) : (
                                <Link href={mission.actionUrl || '/games'} className="w-full block">
                                  <Button
                                    variant="outline"
                                    className="w-full text-xs font-bold border-slate-700 hover:border-indigo-500/50 text-slate-200 hover:bg-slate-800 h-9"
                                  >
                                    Start Quest <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 3-TIER STARTER EVOLUTION TREE TAB */}
            {activeSubTab === 'tree' && (
              <motion.div
                key="tree"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <LingoPetEvolutionTree
                  pet={pet}
                  isAdmin={isAdmin}
                  onEvolvePet={handleEvolveStarter}
                  onUpdateLearningStats={handleUpdateLearningStats}
                />
              </motion.div>
            )}

            {/* EVOLUTION SETUP TAB */}
            {activeSubTab === 'feed' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-zinc-950/90 border border-slate-700/80 backdrop-blur-2xl rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wide">Evolution Morphing</h4>
                    <p className="text-xs text-zinc-300 font-medium mt-1">Select the species of your language companion. Morphs carry over levels and outfits.</p>
                  </div>

                  {/* Track Toggle: Classic vs Evolution Tree */}
                  <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMorphTrack('classic')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all",
                        morphTrack === 'classic'
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <span>🏆</span> Classic Morphing
                    </button>
                    <button
                      type="button"
                      onClick={() => setMorphTrack('evolution_tree')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all",
                        morphTrack === 'evolution_tree'
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <span>🌿</span> 3D Evolution Tree
                    </button>
                  </div>
                </div>

                {morphTrack === 'classic' ? (
                  /* CLASSIC 6-SPECIES GRID WITH EXPLICIT ACTIVE SELECTION & SYNC */
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { id: 'owl', name: 'Lingo', icon: '🦉', desc: 'Wise & Scholar', level: 0 },
                        { id: 'dino', name: 'Pip', icon: '🦖', desc: 'Energetic & Bubbly', level: 0 },
                        { id: 'kitty', name: 'Mimi', icon: '🐱', desc: 'Sweet & Playful', level: 0 },
                        { id: 'phoenix', name: 'Ignis', icon: '🔥', desc: 'Celestial Flame', level: 30 },
                        { id: 'morphling', name: 'Morphy', icon: '💧', desc: 'Dota Fluid Water', level: 60 },
                        { id: 'godly', name: 'Aether', icon: '✨', desc: 'Divine & Radiant', level: 100 },
                      ].map(species => {
                        const isLocked = pet.level < species.level && !isAdmin;
                        const isSelected = pet.petType === species.id;
                        return (
                          <button
                            key={species.id}
                            type="button"
                            disabled={isSleeping || isLocked}
                            onClick={() => handleSelectPetType(species.id as any)}
                            className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all relative group cursor-pointer ${
                              isSelected 
                                ? "bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/50"
                                : isLocked
                                ? "bg-slate-950/40 border-slate-900/40 text-slate-500 cursor-not-allowed opacity-50"
                                : "bg-zinc-900/80 border-slate-700 text-zinc-300 hover:border-indigo-400/70 hover:text-white hover:bg-slate-800/80"
                            }`}
                          >
                            <span className="text-3xl transition-transform group-hover:scale-110">{species.icon}</span>
                            <span className="text-xs font-bold whitespace-nowrap">{species.name}</span>
                            <span className="text-[9px] font-semibold text-zinc-400">
                              {isLocked ? `Req Lvl ${species.level}` : species.desc}
                            </span>

                            {/* Active or Select CTA */}
                            <div className="mt-1 w-full">
                              {isSelected ? (
                                <span className="inline-flex items-center justify-center gap-1 w-full py-0.5 px-1 rounded-md bg-indigo-500 text-[9px] font-black text-white shadow-sm">
                                  <Check className="w-2.5 h-2.5" /> Active Mascot
                                </span>
                              ) : isLocked ? (
                                <span className="inline-block w-full py-0.5 px-1 rounded text-[9px] font-semibold text-slate-500">
                                  Locked
                                </span>
                              ) : (
                                <span className="inline-block w-full py-0.5 px-1 rounded text-[9px] font-semibold text-indigo-300/80 bg-indigo-950/30 group-hover:text-white group-hover:bg-indigo-600/50 transition-colors">
                                  Select Pet
                                </span>
                              )}
                            </div>

                            {isLocked && (
                              <div className="absolute top-1 right-1 bg-slate-950/90 p-0.5 rounded border border-slate-700">
                                <Lock className="h-2.5 w-2.5 text-slate-400" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Dedicated Active Mascot & Floating Companion Confirmation Bar */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/50 via-slate-900/60 to-purple-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          {pet.petType === 'owl' ? '🦉' : pet.petType === 'dino' ? '🦖' : pet.petType === 'kitty' ? '🐱' : pet.petType === 'phoenix' ? '🔥' : pet.petType === 'morphling' ? '💧' : pet.petType === 'godly' ? '✨' : '🐾'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">Current Floating Mascot:</span>
                            <Badge className="bg-indigo-500/25 border-indigo-400/50 text-indigo-200 text-[10px] font-black uppercase">
                              {pet.petName} ({pet.petType})
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            This pet floats beside you across all pages when you return to the menu!
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => {
                            handleSelectPetType(pet.petType);
                            toast({
                              title: "✨ Floating Mascot Synced!",
                              description: `${pet.petName} is locked as your active companion. When you click 'Back to Menu', this pet floats beside you!`,
                            });
                          }}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Set as Floating Mascot</span>
                        </Button>
                        <Link href="/dashboard" className="flex-1 sm:flex-none">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Back to Menu</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3D EVOLUTION TREE TRACK OVERVIEW & STARTER SELECTION */
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          3D Branching Evolution Track (EXP & Study Tiers)
                        </span>
                        <p className="text-xs text-slate-300">
                          Evolve your 3D companion through 3 study tiers with customized bonuses for Vocabulary, Phonics/Listening, and Grammar.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setActiveSubTab('tree')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
                      >
                        <span>🌳</span> Open Full Evolution Tree
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {[
                        { id: 'floby', name: 'Floby (The Seedling)', icon: '🌿', focus: 'Earth & Vocabulary', desc: 'Tier 1 Seedling • Unlocks Tome-Tortoise & Lore-Drake with Vocab mastery' },
                        { id: 'pip', name: 'Pip (The Cloud Puff)', icon: '🎵', focus: 'Air & Phonics', desc: 'Tier 1 Puff • Unlocks Echo-Grif & Acu-Maestro with Listening streak' },
                        { id: 'igni', name: 'Igni (The Ember Kitten)', icon: '🔥', focus: 'Fire & Grammar', desc: 'Tier 1 Kitten • Unlocks Spark-Fox & Rune-Stalker with Sentence writing' },
                      ].map(starter => (
                        <div
                          key={starter.id}
                          onClick={() => handleEvolveStarter(starter.id as any, undefined, 1)}
                          className={cn(
                            "p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5",
                            pet.starterLine === starter.id
                              ? "bg-emerald-950/60 border-emerald-400 text-emerald-100 shadow-md shadow-emerald-500/20"
                              : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{starter.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{starter.name}</div>
                              <div className="text-[10px] text-emerald-400 font-semibold">{starter.focus}</div>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">{starter.desc}</p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-300 font-bold">
                            <span>{pet.starterLine === starter.id ? '✓ Current Starter' : 'Choose Starter'}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-600/40">Tier 1</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* PERSONALITY ARCHETYPES TAB */}
            {activeSubTab === 'personality' && (
              <motion.div
                key="personality"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-zinc-950/90 border border-slate-700/80 backdrop-blur-2xl rounded-2xl p-6 flex flex-col gap-6 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      Personality Archetypes & Persona
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium mt-1">
                      Choose an archetype to shape {pet.petName}&apos;s AI dialogue style, catchphrases, and study demeanor.
                    </p>
                  </div>
                  <Badge className={`${PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']?.badgeClass || 'bg-indigo-500/20 text-indigo-300'} font-black uppercase text-[10px] px-3 py-1 flex items-center gap-1.5 self-start sm:self-auto border border-white/10`}>
                    <span>Active:</span>
                    <span>{PERSONALITY_ARCHETYPES[pet.personality || 'cheerleader']?.name}</span>
                  </Badge>
                </div>

                {/* Quick Rename Companion Card */}
                <div className="bg-zinc-900/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
                      Companion Nickname
                    </span>
                    <p className="text-xs text-zinc-200 font-semibold">
                      Current: <span className="font-extrabold text-white">&quot;{pet.petName}&quot;</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={tempPetName}
                      onChange={(e) => setTempPetName(e.target.value)}
                      placeholder="Enter new nickname..."
                      maxLength={20}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 w-full sm:w-44 placeholder:text-slate-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePetName();
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRandomizeName}
                      title="Generate random cute name"
                      className="h-9 px-2.5 bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-amber-300 shrink-0"
                    >
                      <Shuffle className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSavePetName}
                      disabled={!tempPetName.trim() || tempPetName.trim() === pet.petName}
                      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shrink-0"
                    >
                      Rename
                    </Button>
                  </div>
                </div>

                {/* Archetype Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {Object.values(PERSONALITY_ARCHETYPES).map(arch => {
                    const isSelected = (pet.personality || 'cheerleader') === arch.id;

                    return (
                      <div
                        key={arch.id}
                        onClick={() => handleSelectPersonality(arch.id)}
                        className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group ${
                          isSelected
                            ? `bg-slate-950/90 border-indigo-500 ring-1 ring-inset ring-indigo-500/50 shadow-xl shadow-indigo-500/10`
                            : `bg-slate-950/50 border-slate-800/80 ${arch.cardGlow} hover:bg-slate-900/40`
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">{arch.icon}</span>
                              <div>
                                <h5 className="font-extrabold text-sm text-slate-100 group-hover:text-white transition-colors flex items-center gap-2">
                                  {arch.name}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-medium">{arch.subtitle}</p>
                              </div>
                            </div>

                            {isSelected && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" />
                                Active
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-slate-350 font-medium leading-relaxed">
                            {arch.description}
                          </p>

                          {/* Catchphrase quote */}
                          <div className="bg-slate-900/60 border border-slate-850/80 rounded-xl p-2.5 text-[11px] text-slate-300 italic font-medium leading-relaxed flex items-start gap-2">
                            <span className="text-slate-500 font-serif text-sm">“</span>
                            <span className="flex-1">{arch.catchphrase.replace(/^"|"$/g, '')}</span>
                            <span className="text-slate-500 font-serif text-sm">”</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className={isSelected ? 'text-indigo-400 font-black' : 'text-slate-500 group-hover:text-slate-300'}>
                            {isSelected ? 'Currently Speaking In This Persona' : 'Click to Adopt Persona'}
                          </span>
                          <span className="text-xs">{isSelected ? '✨' : '➔'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SHOP TAB */}
            {activeSubTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-zinc-950/90 border border-slate-700/80 backdrop-blur-2xl rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wide flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-indigo-400" />
                      {shopMode === 'classic' ? 'Classic Lingo-Shop' : '✨ Evolution Relics & 3D Wardrobe'}
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium mt-1">
                      {shopMode === 'classic'
                        ? 'Unlock full-body costumes, hats, glasses, and environments for your companion using coins.'
                        : 'Dedicated 3D relics and elemental gear crafted specifically for 3D Evolution Tree pets.'}
                    </p>
                  </div>

                  {/* Store Switcher: Classic Shop vs Evolution Relic Shop */}
                  <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShopMode('classic')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all",
                        shopMode === 'classic'
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <span>🛍️</span> Classic Shop
                    </button>
                    <button
                      type="button"
                      onClick={() => setShopMode('evolution')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all",
                        shopMode === 'evolution'
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <span>✨</span> Evolution Relics Shop
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'costume', label: 'Costumes 🥋' },
                    { id: 'aura', label: 'Auras ✨' },
                    { id: 'hat', label: 'Hats 👑' },
                    { id: 'glasses', label: 'Glasses 🕶️' },
                    { id: 'necklace', label: 'Necklaces 📿' },
                    { id: 'wings', label: 'Wings 🪽' },
                    { id: 'shoes', label: 'Shoes 👟' },
                    ...(shopMode === 'classic' ? [{ id: 'background', label: 'Rooms 🌸' }] : []),
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedShopCategory(cat.id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
                        selectedShopCategory === cat.id
                          ? (shopMode === 'classic' ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-emerald-600 text-white shadow-md shadow-emerald-500/20")
                          : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                
                {/* Evolution Relic Armory Banner when in evolution shop mode */}
                {shopMode === 'evolution' && (
                  <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-teal-950/60 border border-emerald-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-lg shrink-0">
                        ⚡
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>3D Procedural Fitting Guaranteed</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider">
                            Active Pet Calibrated
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300">
                          Relics procedurally contour to <span className="text-emerald-400 font-bold">{pet.petName}</span>'s anatomy (held books, bushy tails, horns, and ears) in real-time.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 shrink-0 self-start sm:self-auto">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-300">Live 3D Sync</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {(shopMode === 'classic' ? SHOP_ITEMS : EVOLUTION_RELIC_SHOP_ITEMS)
                    .filter(item => selectedShopCategory === 'all' || item.category === selectedShopCategory)
                    .map(item => {
                      const isUnlocked = pet.unlockedCosmetics.includes(item.id) || item.id === 'bg_default';
                      
                      let isEquipped = false;
                      if (item.category === 'background') {
                        isEquipped = pet.currentBackground === (item as any).value;
                      } else if (item.category === 'costume') {
                        isEquipped = pet.equippedCosmetics.costume === item.id;
                      } else if (item.category === 'hat') {
                        isEquipped = pet.equippedCosmetics.hat === item.id;
                      } else if (item.category === 'glasses') {
                        isEquipped = pet.equippedCosmetics.glasses === item.id;
                      } else if (item.category === 'necklace') {
                        isEquipped = pet.equippedCosmetics.necklace === item.id;
                      } else if (item.category === 'shoes') {
                        isEquipped = pet.equippedCosmetics.shoes === item.id;
                      } else if (item.category === 'wings') {
                        isEquipped = pet.equippedCosmetics.wings === item.id;
                      } else if (item.category === 'aura') {
                        isEquipped = pet.equippedCosmetics.aura === item.id;
                      }

                      // Dedicated Ultra-Realistic Card for Evolution Relics
                      if (shopMode === 'evolution') {
                        const relic = item as typeof EVOLUTION_RELIC_SHOP_ITEMS[number];
                        const themeBorders = {
                          emerald: 'border-emerald-500/40 hover:border-emerald-400/80 from-emerald-950/40 via-zinc-900/90 to-teal-950/40',
                          sky: 'border-sky-500/40 hover:border-sky-400/80 from-sky-950/40 via-zinc-900/90 to-cyan-950/40',
                          amber: 'border-amber-500/40 hover:border-amber-400/80 from-amber-950/40 via-zinc-900/90 to-orange-950/40',
                          purple: 'border-purple-500/40 hover:border-purple-400/80 from-purple-950/40 via-zinc-900/90 to-indigo-950/40',
                        }[relic.elementTheme] || 'border-slate-700 from-zinc-900 to-zinc-950';

                        const themeBadge = {
                          emerald: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
                          sky: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
                          amber: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
                          purple: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
                        }[relic.elementTheme] || 'text-zinc-300 bg-zinc-800 border-zinc-700';

                        return (
                          <div
                            key={relic.id}
                            className={cn(
                              "relative rounded-xl p-3.5 flex flex-col justify-between gap-3 border bg-gradient-to-br shadow-xl transition-all duration-300 hover:shadow-2xl",
                              themeBorders,
                              isEquipped && "ring-2 ring-emerald-400/70 shadow-emerald-500/20"
                            )}
                          >
                            {/* Top Badges Row */}
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", themeBadge)}>
                                {relic.rarity}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-zinc-300 bg-black/50 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                                  <span>{relic.elementIcon}</span> {relic.element}
                                </span>
                                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                  ✓ 3D Fit
                                </span>
                              </div>
                            </div>

                            {/* Middle Info & Icon */}
                            <div className="flex items-start gap-3">
                              {/* 3D Relic Showcase Pedestal */}
                              <div className="relative shrink-0 w-14 h-14 rounded-xl bg-gradient-to-b from-black/80 to-zinc-950 border border-white/15 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                                <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />
                                <span className="drop-shadow-[0_4px_12px_rgba(255,255,255,0.25)] select-none">
                                  {relic.icon}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="text-xs font-black text-white truncate">{relic.name}</div>
                                  <span className="text-[9px] uppercase font-bold text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-white/5">
                                    {relic.category}
                                  </span>
                                </div>
                                <div className="text-[10px] text-zinc-300 leading-snug mt-0.5 line-clamp-2">
                                  {relic.description}
                                </div>
                                
                                {/* Perk Badge */}
                                <div className="mt-1.5 flex items-center gap-1">
                                  <span className="text-[9px] font-black text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                    <span>✨</span> {relic.perk}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Anatomical Fit Note Callout */}
                            <div className="bg-black/40 border border-white/5 rounded-lg px-2.5 py-1 text-[9.5px] text-zinc-300 flex items-center gap-1.5">
                              <span className="text-emerald-400 shrink-0 font-bold">🛡️ Fit:</span>
                              <span className="truncate">{relic.fitNotes}</span>
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                              <div className="flex items-center gap-1.5">
                                {isEquipped ? (
                                  <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                                    Active on Pet
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-zinc-400">
                                    {isUnlocked ? 'Ready to Equip' : 'Locked Relic'}
                                  </span>
                                )}
                              </div>

                              <div>
                                {isUnlocked ? (
                                  <Button
                                    size="sm"
                                    disabled={isSleeping}
                                    onClick={() => handleEquip(relic)}
                                    className={cn(
                                      "text-xs font-black px-3.5 h-8 rounded-lg shadow-md transition-all",
                                      isEquipped
                                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30"
                                    )}
                                  >
                                    {isEquipped ? 'Unequip' : 'Equip Relic'}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled={isSleeping}
                                    onClick={() => handlePurchase(relic)}
                                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-3.5 h-8 rounded-lg flex items-center gap-1 shadow-md shadow-amber-500/20"
                                  >
                                    <span>{relic.price}</span>
                                    <Coins className="h-3 w-3 fill-slate-950" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Classic Shop Row Layout
                      return (
                        <div 
                          key={item.id} 
                          className="bg-zinc-900/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl bg-zinc-950 p-2 rounded-lg border border-slate-700">{item.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{item.name}</div>
                              <div className="text-[10px] text-zinc-300 leading-snug">{item.description}</div>
                            </div>
                          </div>
                          
                          <div>
                            {isUnlocked ? (
                              <Button
                                size="sm"
                                disabled={isSleeping}
                                onClick={() => handleEquip(item)}
                                className={`text-xs font-bold px-3 ${
                                  isEquipped
                                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                }`}
                              >
                                {isEquipped ? 'Unequip' : 'Equip'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={isSleeping}
                                onClick={() => handlePurchase(item)}
                                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 flex items-center gap-1"
                              >
                                <span>{item.price}</span>
                                <Coins className="h-3 w-3 fill-slate-950" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* AI CHAT TAB */}
            {activeSubTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-zinc-950/90 border border-slate-700/80 backdrop-blur-2xl rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-white uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    AI Companion Dialogue
                  </h4>
                  <p className="text-xs text-zinc-300 font-medium mt-1">
                    Talk to {pet.petName}. Ask details about your progress, ask for grammar help, or just have a chat!
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    disabled={isSleeping || aiLoading}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isSleeping ? "Pet is asleep..." : "Ask me anything (e.g. 'How can I improve today?')..."}
                    className="flex-grow h-11 bg-zinc-900 border border-slate-700 rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white disabled:opacity-50 placeholder:text-zinc-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendChat();
                    }}
                  />
                  <Button
                    disabled={isSleeping || aiLoading || !chatInput.trim()}
                    onClick={handleSendChat}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-5 shadow-lg shadow-indigo-500/20"
                  >
                    {aiLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
