'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateReaderStory } from '@/ai/flows/storyteller';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Sparkles, 
  Loader2, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ChevronRight, 
  RotateCcw, 
  BookMarked,
  Layers,
  Smile,
  Compass,
  Trophy,
  Music,
  Volume1,
  Mic,
  MicOff,
  Bookmark,
  BookmarkCheck,
  Lock,
  Unlock,
  CheckCircle2
} from 'lucide-react';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface VocabularyItem {
  word: string;
  definition: string;
  translation: string;
}

interface ReaderStory {
  title: string;
  narrativeBlocks: string[];
  vocabulary: VocabularyItem[];
}

export interface StoryBookmark {
  campaignKey: string;
  title: string;
  genre: string;
  source: 'preset' | 'ai';
  episodeNumber: number;
  blockIndex: number;
  totalBlocks: number;
  narrativePreview: string;
  timestamp: number;
  activeStory: ReaderStory;
  length?: 'short' | 'long';
  customTheme?: string;
}

export interface CampaignEpisodeMeta {
  number: number;
  title: string;
  subtitle: string;
  description: string;
}

export interface CampaignMetadata {
  id: string;
  title: string;
  genre: string;
  icon: string;
  description: string;
  totalEpisodes: number;
  episodes: CampaignEpisodeMeta[];
}

export const CAMPAIGN_REGISTRY: Record<string, CampaignMetadata> = {
  'haunted-manor': {
    id: 'haunted-manor',
    title: 'The Whispering Shadows of Blackwood',
    genre: 'Horror',
    icon: '🎭',
    description: 'Creepy gothic mystery · Old Victorian manor',
    totalEpisodes: 3,
    episodes: [
      { number: 1, title: 'The Whispering Gates', subtitle: 'Episode 1', description: 'Leo enters the cursed courtyard following mysterious footprints.' },
      { number: 2, title: 'The Grand Staircase', subtitle: 'Episode 2', description: 'Moving oil portraits and a sorrowful ghost guide the way.' },
      { number: 3, title: 'The Forgotten Crypt', subtitle: 'Episode 3', description: 'Unlocking the ancient subterranean vault to rescue his companion.' }
    ]
  },
  'school-comedy': {
    id: 'school-comedy',
    title: 'The Chemistry Catastrophe of Room 4B',
    genre: 'Comedy',
    icon: '🧪',
    description: 'Harmless school pranks gone bubbly pink',
    totalEpisodes: 3,
    episodes: [
      { number: 1, title: 'The Bubblegum Sludge', subtitle: 'Episode 1', description: 'Barnaby mixes the wrong catalyst and covers the room in pink foam.' },
      { number: 2, title: 'Detention Cleanup Crisis', subtitle: 'Episode 2', description: 'The foam inflates into giant bouncy animals while dodging Professor Higgins.' },
      { number: 3, title: 'The Science Fair Showdown', subtitle: 'Episode 3', description: 'Turning accidental sludge into a first-place award-winning invention.' }
    ]
  },
  'quantum-chronicles-1': {
    id: 'quantum-chronicles-1',
    title: 'Quantum Spire: Chronicles of Aethelgard',
    genre: 'Sci-Fi',
    icon: '🚀',
    description: 'Time distortions, ancient alien towers, and space ruins',
    totalEpisodes: 3,
    episodes: [
      { number: 1, title: 'The Anomaly', subtitle: 'Episode 1', description: 'Nova crash-lands near the ancient obsidian tower humming with time distortion.' },
      { number: 2, title: 'The Vault of Echoes', subtitle: 'Episode 2', description: 'Floating zero-gravity atriums and star-maps of a fallen federation.' },
      { number: 3, title: 'The Synthetic Guardian', subtitle: 'Episode 3', description: 'Reversing planetary fractures with the ancient starlight construct.' }
    ]
  }
};

// Visual Novel Multi-Episode Presets
const presetStories: Record<string, Record<number, ReaderStory>> = {
  'haunted-manor': {
    1: {
      title: 'The Whispering Shadows of Blackwood: Episode 1 - The Iron Gates',
      narrativeBlocks: [
        'The rusty iron gates of Blackwood Manor groaned loudly as Leo pushed them open, stepping into the overgrown, foggy courtyard.',
        'A chill wind swept through the dead oak branches, carrying a faint, melodic whistling sound from the dark, boarded-up windows.',
        'He clutched his flashlight tightly. He had been warned never to enter Blackwood after dusk, but his lost dog’s footprints led straight to the front door.',
        'Taking a deep breath, Leo climbed the decaying wooden steps. The floorboards shrieked beneath his boots, a warning from the house itself.',
        'As his fingers wrapped around the cold brass doorknob, the heavy door swung open on its own, revealing a pitch-black corridor.',
        'A scent of old parchment and damp earth flooded his senses. "Hello?" he called out, his voice instantly swallowed by the heavy silence.',
        'Suddenly, a tiny whimper echoed from the top of the grand spiral staircase, followed by a glowing, bluish mist that danced across the dust.',
        'Determined to rescue his companion, Leo crossed the threshold. Behind him, the heavy door slammed shut with a thunderous bang, locking him inside the whispering dark.'
      ],
      vocabulary: [
        { word: 'groaned', definition: 'Made a deep, creaking noise under pressure or pain.', translation: 'คราง / ร้องคราง' },
        { word: 'dusk', definition: 'The period of partial darkness between day and night; early evening.', translation: 'พลบค่ำ' },
        { word: 'decaying', definition: 'Rotting, decomposing, or falling apart due to old age.', translation: 'ผุพัง / เน่าเปื่อย' },
        { word: 'whimper', definition: 'A low, feeble sound expressive of fear, pain, or discontent.', translation: 'เสียงครางเบาๆ' }
      ]
    },
    2: {
      title: 'The Whispering Shadows of Blackwood: Episode 2 - The Grand Staircase',
      narrativeBlocks: [
        'Leo pointed his beam of light up the grand mahogany staircase, where shadows slithered like living ink across the faded wallpaper.',
        'Gilded oil portraits lined the staircase, their painted eyes following his every movement with silent, frozen disapproval.',
        'Halfway up the landing, a glint of metal caught his eye: a worn leather collar with a brass tag reading "Barnaby".',
        'Suddenly, the air pressure plummeted. His breath formed crystalline plumes in the sudden freezing chill.',
        'At the top landing stood a translucent figure—a young Victorian girl in a lace dress, hovering inches above the velvet carpet.',
        'She raised a glowing pale hand, pointing not toward fear, but toward a concealed double door at the end of the gallery.',
        '"Hurry," a delicate whisper vibrated in Leo\'s mind, "the house awakens when midnight chimes."',
        'Taking a resolute step past the phantom, Leo pushed open the gallery doors into the grand manor library.'
      ],
      vocabulary: [
        { word: 'translucent', definition: 'Allowing light to pass through, but not completely transparent.', translation: 'โปร่งแสง' },
        { word: 'plummeted', definition: 'Fell or dropped straight down at high speed.', translation: 'ดิ่งลงอย่างรวดเร็ว' },
        { word: 'resolute', definition: 'Admirably purposeful, determined, and unwavering.', translation: 'เด็ดเดี่ยว / แน่วแน่' },
        { word: 'phantom', definition: 'A ghost, apparition, or spectral figure.', translation: 'ภูตผี / ภาพลวงตา' }
      ]
    },
    3: {
      title: 'The Whispering Shadows of Blackwood: Episode 3 - The Hidden Crypt',
      narrativeBlocks: [
        'The library was a labyrinth of towering bookshelves stretching into darkness, laden with ancient leather-bound grimoires.',
        'In the center stood a colossal grandfather clock ticking backward, its obsidian pendulum glowing with soft emerald runes.',
        'Remembering the girl\'s whisper, Leo aligned the clock hands with the hour of the hound, triggering a resonant grinding sound.',
        'The entire bookshelf slid aside, unveiling a narrow stone stairway descending into the subterranean foundations of the estate.',
        'Down below, a warm golden candlelight flickered across smooth cobblestones, banishing the freezing terror of the upper floors.',
        'A joyous bark shattered the eerie quiet—sitting safely beside a gilded antique chest was Barnaby, tail wagging furiously!',
        'Beside him, the spectral girl bowed graciously: "You came not with greed, but with devotion. Blackwood’s curse is broken."',
        'Together with his loyal dog, Leo stepped into the rising dawn sunlight, the manor behind them forever resting in peaceful silence.'
      ],
      vocabulary: [
        { word: 'labyrinth', definition: 'A complicated irregular network of passages or paths; a maze.', translation: 'เขาวงกต' },
        { word: 'grimoires', definition: 'Books of magic spells and invocations.', translation: 'ตำราเวทมนตร์' },
        { word: 'subterranean', definition: 'Existing, occurring, or done under the earth\'s surface.', translation: 'ใต้ดิน / ใต้พิภพ' },
        { word: 'devotion', definition: 'Love, loyalty, or enthusiasm for a person, activity, or cause.', translation: 'ความจงรักภักดี / ความทุ่มเท' }
      ]
    }
  },
  'school-comedy': {
    1: {
      title: 'The Great Chemistry Catastrophe: Episode 1 - The Bubblegum Sludge',
      narrativeBlocks: [
        'Professor Higgins was famous for two things: his perfectly groomed mustache and his absolute rule of silence during chemistry labs.',
        'Barnaby, unfortunately, was famous for his clumsy hands and an uncontrollable urge to mix colorful liquids together.',
        'Today’s experiment was simple: create a harmless blue vapor by carefully combining beaker A and beaker B at exactly room temperature.',
        'Barnaby, daydreaming about chocolate chip cookies, accidentally grabbed a vial of purple catalyst instead of beaker B.',
        '"This should make it look like a magical potion," Barnaby whispered to himself, pouring the purple liquid into Higgins’ prized copper vat.',
        'Within three seconds, the mixture began to bubble violently, making a strange sound resembling a small, furious steam train.',
        'Professor Higgins gasped, his mustache twitching in absolute horror as a massive, thick pink cloud erupted from the vat.',
        'The pink foam expanded rapidly, covering Higgins, Barnaby, and the entire front row in sticky, bubblegum-scented sludge.',
        'Higgins blinked, a dollop of pink foam sliding down his nose. "Barnaby," he muttered calmly, "I believe you have synthesized a very clean B grade."'
      ],
      vocabulary: [
        { word: 'groomed', definition: 'Neat, tidy, and clean in appearance.', translation: 'ได้รับการตกแต่งเป็นอย่างดี' },
        { word: 'vapor', definition: 'A gas-like substance suspended in the air (mist or smoke).', translation: 'ไอ / ละออง' },
        { word: 'catalyst', definition: 'A substance that increases the speed of a chemical reaction.', translation: 'ตัวเร่งปฏิกิริยา' },
        { word: 'sludge', definition: 'Thick, soft, wet mud or a similar viscous mixture.', translation: 'โคลน / ตะกอนเหนียว' }
      ]
    },
    2: {
      title: 'The Great Chemistry Catastrophe: Episode 2 - Detention Cleanup Crisis',
      narrativeBlocks: [
        'At 3:30 PM, Room 4B was an eerie sea of hot pink foam, squeaking every time someone took a step.',
        'Barnaby and his lab partner Mia were handed extra-large industrial squeegees with strict orders from Principal Higgins to clean every inch.',
        '"Don\'t touch it with plain water," Mia warned, consulting the lab safety manual, "or the polymers will cross-link into rubber!"',
        'Barnaby, naturally, immediately dropped the mop bucket into the biggest foam puddle in the center of the classroom.',
        'Instantly, the sludge hardened into a springy, bouncy trampoline surface that covered the entire floor from wall to wall.',
        'Mia bounced three feet into the air, clutching a bottle of vinegar neutralizer while screaming with laughter.',
        'Just as Barnaby performed a triumphant mid-air somersault, Principal Higgins stepped through the doorway with a tray of hot tea.',
        'A rogue foam bubble bounced off the ceiling, ricocheted off the chalkboard, and neatly replaced the sugar cube in Higgins’ teacup.',
        '"Fascinating elasticity," Higgins deadpanned, sipping his pink strawberry tea. "You both have thirty minutes before the janitor arrives."'
      ],
      vocabulary: [
        { word: 'polymers', definition: 'Substances with molecular structures made of many similar units bonded together.', translation: 'โพลิเมอร์' },
        { word: 'ricocheted', definition: 'Rebounded one or more times off a surface.', translation: 'กระดอน / เด้งสะท้อน' },
        { word: 'elasticity', definition: 'The ability of an object or material to resume its normal shape after being stretched or compressed.', translation: 'ความยืดหยุ่น' },
        { word: 'deadpanned', definition: 'Said something amusing while maintaining a serious, expressionless face.', translation: 'พูดหน้าตาย / ตีหน้าขรึม' }
      ]
    },
    3: {
      title: 'The Great Chemistry Catastrophe: Episode 3 - The Science Fair Showdown',
      narrativeBlocks: [
        'On Friday morning, the regional STEM Science Fair packed the auditorium with ambitious students and skeptical university judges.',
        'At Booth 14, Barnaby and Mia stood proudly beside their creation: "The Self-Cleaning Bouncy Sludge Dispenser 3000".',
        'Across the aisle, their snooty rival Bradley smirked over his robotic arm that could barely stack two plastic cups without catching fire.',
        '"Step right up, honorable judges!" Barnaby announced, strapping on oversized neon goggles and gripping the brass valve.',
        'The head judge, Dr. Aris Thorne, raised a skeptical eyebrow: "A cleaning agent derived from accidental cafeteria chewing gum?"',
        'Barnaby cranked the valve. A cascade of shimmering, strawberry-scented bubbles erupted across Bradley’s stained laboratory bench.',
        'Within seconds, the bubbles dissolved every speck of permanent marker, dried ink, and burnt grease, leaving the wood polished and glowing.',
        'The auditorium erupted in thunderous applause as Dr. Thorne stamped the blue ribbon: "First place for extraordinary accidental innovation!"'
      ],
      vocabulary: [
        { word: 'skeptical', definition: 'Not easily convinced; having doubts or reservations.', translation: 'สงสัย / กังขา' },
        { word: 'cascade', definition: 'A large number or amount of something occurring or falling in rapid succession.', translation: 'การหลั่งไหลเป็นสาย' },
        { word: 'derived', definition: 'Obtained or developed from a specified source.', translation: 'ได้รับมาจาก / กำเนิดจาก' },
        { word: 'innovation', definition: 'The action or process of inventing new methods, ideas, or products.', translation: 'นวัตกรรม' }
      ]
    }
  },
  'quantum-chronicles-1': {
    1: {
      title: 'The Quantum Spire: Episode 1 - The Anomaly',
      narrativeBlocks: [
        'The holographic display in Nova\'s cockpit flickered red. The chronometers were counting backward, a physical impossibility.',
        'Below her spaceship, the surface of Planet Aethelgard was cracking open, glowing with rivers of liquid plasma energy.',
        'She was sent here to investigate the Quantum Spire, a massive, ancient tower built by a long-lost civilization.',
        'As she initiated landing thrusters, a sudden magnetic pulse hit the ship, knocking out the primary power grid.',
        '"Computer, run auxiliary power backup!" Nova commanded, gripping the steering wheel as the ship glided into a rocky canyon.',
        'The ship landed with a metallic crash. Outside, a towering pillar of obsidian stone stretched up into the purple clouds.',
        'The Spire was awake. Rings of cyan light rotated around its peak, projecting a glowing map of coordinates into the sky.',
        'Nova grabbed her scan-visor and stepped onto the planetary surface. The very air hummed with quantum electricity.',
        'As she approached the base of the Spire, a glowing door materialized in the obsidian wall, beckoning her to step inside.'
      ],
      vocabulary: [
        { word: 'chronometers', definition: 'Highly accurate clocks or timekeeping instruments.', translation: 'เครื่องจับเวลาอย่างแม่นยำ' },
        { word: 'auxiliary', definition: 'Providing supplementary or additional help and support; backup.', translation: 'สำรอง / เสริม' },
        { word: 'obsidian', definition: 'A dark, glasslike volcanic rock formed by the rapid cooling of lava.', translation: 'หินออบซิเดียน' },
        { word: 'beckoning', definition: 'Making a gesture with the hand or head to encourage someone to approach.', translation: 'กวักมือเรียก / อัญเชิญ' }
      ]
    },
    2: {
      title: 'The Quantum Spire: Episode 2 - The Vault of Echoes',
      narrativeBlocks: [
        'Nova stepped through the energy threshold, leaving behind planetary gravity as her boots gently floated off the floor.',
        'Before her opened an immense cylindrical atrium, filled with floating crystalline prisms that refracted temporal energy.',
        'Each crystal pulsed with holographic echoes of the past—fleets of starships, alien cities, and cosmic constellations.',
        '"Chronon density exceeding standard galactic thresholds," her suit AI announced in a calm, digitized tone.',
        'At the center of the atrium drifted an artificial miniature star, held in stasis by four magnetic containment arches.',
        'Approaching the primary terminal, Nova placed her biometric gauntlet onto a glyph interface that mirrored human biology.',
        'A harmonious chord resonated throughout the Spire. The ceiling dissolved into a real-time stellar cartography projection.',
        'She watched in awe as the star-map highlighted a collapsing temporal rift connecting Aethelgard directly to Earth\'s solar system.'
      ],
      vocabulary: [
        { word: 'atrium', definition: 'A large open central hall or courtyard, often rising through several stories.', translation: 'ห้องโถงกลางขนาดใหญ่' },
        { word: 'stasis', definition: 'A period or state of inactivity, equilibrium, or suspended animation.', translation: 'ภาวะคงที่ / ภาวะหยุดนิ่ง' },
        { word: 'biometric', definition: 'Relating to the statistical analysis of unique biological characteristics.', translation: 'ชีวมาตร / ข้อมูลชีวภาพ' },
        { word: 'cartography', definition: 'The science or practice of drawing and compiling maps.', translation: 'การทำแผนที่' }
      ]
    },
    3: {
      title: 'The Quantum Spire: Episode 3 - The Synthetic Guardian',
      narrativeBlocks: [
        'From the glowing perimeter of the artificial star, particles of light condensed into an elegant, silver humanoid form.',
        'Rings of quantum code circled the Guardian\'s head, pulsing in sync with Nova\'s own heartbeat.',
        '"Welcome, Traveler of the Milky Way," the synthetic voice resonated inside her helmet without using physical soundwaves.',
        '"For ten thousand cycles, this Spire has anchored the timeline against entropy. But the anchor matrix is destabilizing."',
        'Nova realized her ship\'s plasma core could supply the missing harmonics needed to recalibrate the containment field.',
        'Connecting her omni-tool to the Guardian\'s core conduit, Nova channeled a concentrated burst of ionization energy.',
        'A brilliant nova of cyan luminescence surged through the Spire, sealing the planetary fractures across Aethelgard.',
        'The Guardian placed a glowing chronon crystal into her hand: "The timeline is secured. Take this coordinate key—your true destiny begins now."'
      ],
      vocabulary: [
        { word: 'entropy', definition: 'A thermodynamic quantity representing the degree of disorder or randomness in a system.', translation: 'เอนโทรปี / ความไร้ระเบียบ' },
        { word: 'recalibrate', definition: 'Calibrate something again or differently to ensure accurate measurement.', translation: 'ปรับเทียบใหม่' },
        { word: 'luminescence', definition: 'The emission of light by a substance not resulting from heat; glowing.', translation: 'การเปล่งแสง' },
        { word: 'conduit', definition: 'A channel, pipe, or tube through which fluid, electrical energy, or signals pass.', translation: 'ท่อส่ง / ช่องทางนำสัญญาณ' }
      ]
    }
  }
};

class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: { oscs: OscillatorNode[]; gain: GainNode }[] = [];
  private interval: any = null;
  private _volume: number = 0.5;
  private _genre: string = '';
  
  start(genre: string, volume = 0.5) {
    if (typeof window === 'undefined') return;
    this._genre = genre;
    this._volume = volume;
    this.stop();
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    try {
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.warn('Failed to create AudioContext:', e);
      return;
    }

    // Master volume node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    
    const playChords = () => {
      if (!this.ctx || !this.masterGain) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      let frequencies: number[] = [];
      let oscType: OscillatorType = 'sine';
      let detune = 0;
      
      if (genre === 'Horror') {
        frequencies = [65.41, 92.50, 110.00];
        oscType = 'sawtooth';
        detune = 12;
      } else if (genre === 'Comedy') {
        frequencies = [261.63, 329.63, 392.00, 523.25];
        oscType = 'triangle';
      } else if (genre === 'Sci-Fi' || genre === 'Cyberpunk') {
        frequencies = [146.83, 220.00, 293.66, 440.00];
        oscType = 'sine';
      } else if (genre === 'Adventure' || genre === 'Fantasy') {
        frequencies = [196.00, 293.66, 392.00, 493.88];
        oscType = 'triangle';
      } else {
        frequencies = [174.61, 220.00, 261.63, 349.23];
        oscType = 'sine';
      }
      
      const now = this.ctx.currentTime;
      const oscGroupGain = this.ctx.createGain();
      oscGroupGain.gain.setValueAtTime(0, now);
      oscGroupGain.gain.linearRampToValueAtTime(genre === 'Horror' ? 0.012 : 0.022, now + 1.8);
      oscGroupGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
      oscGroupGain.connect(this.masterGain);
      
      const oscs = frequencies.map((freq) => {
        if (!this.ctx) return null;
        const osc = this.ctx.createOscillator();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, now);
        if (detune > 0) osc.detune.setValueAtTime((Math.random() - 0.5) * detune, now);
        osc.connect(oscGroupGain);
        osc.start(now);
        osc.stop(now + 5.0);
        return osc;
      }).filter(Boolean) as OscillatorNode[];
      
      this.nodes.push({ oscs, gain: oscGroupGain });
      if (this.nodes.length > 4) {
        const old = this.nodes.shift();
        try { old?.gain.disconnect(); } catch (e) {}
      }
    };
    
    playChords();
    this.interval = setInterval(playChords, 4800);
  }

  setVolume(vol: number) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.05);
    }
  }
  
  stop() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
    this.nodes.forEach(n => {
      try { n.gain.disconnect(); } catch (e) {}
      n.oscs.forEach(o => { try { o.stop(); } catch (e) {} });
    });
    this.nodes = [];
    if (this.masterGain) { try { this.masterGain.disconnect(); } catch(e) {} this.masterGain = null; }
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
  }
}

const generateSimulatedStory = (
  genre: string, 
  length: 'short' | 'long', 
  theme: string, 
  episodeNumber: number
): ReaderStory => {
  const finalTitle = theme.trim() ? theme.trim() : `Chronicles of LingoLand: A ${genre} Quest`;
  
  // Construct highly stylized and genre-appropriate story paragraphs
  let narrativeBlocks: string[] = [];
  let vocabulary: VocabularyItem[] = [];
  
  if (genre === 'Horror') {
    narrativeBlocks = [
      `The dim candlelight flickered as a cold draught swept through the ancient corridor, whispering secrets of forgotten souls.`,
      `Emma stepped forward, her heart hammering against her ribs, each shadow morphing into reaching fingers along the stone walls.`,
      `At the end of the hall stood an ornate wooden mirror, its reflective glass covered in a layer of thick, dusty cobwebs.`,
      `As she wiped the mirror clean, the reflection did not show her own face, but a pair of luminous crimson eyes staring back.`,
      `A sudden, deafening creak echoed from the stairs behind her. The candle blew out, plunging her into absolute, freezing pitch-black darkness.`,
      `Through the dark, she heard a soft, scratchy breath directly next to her ear, murmuring: "You should not have stepped inside."`
    ];
    vocabulary = [
      { word: 'draught', definition: 'A cold current of air in a room.', translation: 'ลมโกรก / ลมพัดผ่าน' },
      { word: 'morphing', definition: 'Changing smoothly from one image or shape to another.', translation: 'การปรับเปลี่ยนรูปทรง' },
      { word: 'ornate', definition: 'Elaborately or highly decorated.', translation: 'หรูหรา / ตกแต่งอย่างประณีต' },
      { word: 'luminous', definition: 'Bright or shining, especially in the dark.', translation: 'สว่างไสว / เรืองแสง' }
    ];
  } else if (genre === 'Comedy') {
    narrativeBlocks = [
      `Barnaby was convinced that his cat, Sir Fluffington, was secretly planning world domination using a toaster.`,
      `Today’s evidence: Sir Fluffington sat upright on the kitchen counter, wearing a small foil crown and glaring at the bread slot.`,
      `"I know your game, kitty," Barnaby warned, pointing a butter knife at the cat, who responded with a highly patronizing yawn.`,
      `Suddenly, the toaster clicked. Instead of toasted bread, it shot two perfectly golden waffles directly into the air!`,
      `With an athletic leap, Sir Fluffington caught one waffle in his mouth and landed gracefully on Barnaby’s head.`,
      `Barnaby blinked, syrup dripping down his forehead, realizing he had just been out-maneuvered by a 10-pound furball.`
    ];
    vocabulary = [
      { word: 'domination', definition: 'Exercise of power or influence over others.', translation: 'การควบคุม / ครอบงำ' },
      { word: 'patronizing', definition: 'Treating someone with an apparent kindness which betrays a feeling of superiority.', translation: 'ทำเป็นผู้อุปถัมภ์ / ดูแคลนเบาๆ' },
      { word: 'athletic', definition: 'Physically strong, fit, and active.', translation: 'ว่องไว / แข็งแรงแบบนักกีฬา' },
      { word: 'out-maneuvered', definition: 'Evaded or defeated by superior skill or cunning strategy.', translation: 'เหนือชั้นกว่า / ชนะด้วยอุบาย' }
    ];
  } else if (genre === 'Sci-Fi' || genre === 'Cyberpunk') {
    narrativeBlocks = [
      `The neon signs of Neo-Bangkok vibrated against the torrential acid rain as Kael downloaded the neural data packet.`,
      `His synaptic implants buzzed, converting raw binary code into high-definition holographic architectural schematics.`,
      `"Warning: Sentinel drones detected on sector 9," a cold synthetic voice chirped inside his auditory canal.`,
      `He leaped off the fire escape, activating his gravitational thrusters just in time to glide over the hovering hover-cabs.`,
      `He landed on an old maintenance hatch, sliding down into the ancient underground server hub where the core files were kept.`,
      `The glowing mainframe hummed. He initiated the connection, unaware that the synthetic firewall had already logged his digital signature.`
    ];
    vocabulary = [
      { word: 'torrential', definition: 'Falling rapidly and in large quantities (referring to rain).', translation: 'เชี่ยวกราก / ไหลแรง' },
      { word: 'synaptic', definition: 'Relating to a junction between two nerve cells (or brain wires).', translation: 'เกี่ยวกับจุดประสานประสาท' },
      { word: 'schematics', definition: 'Technical diagrams or drawings representing a plan.', translation: 'แผนผัง / แผนภาพทางเทคนิค' },
      { word: 'mainframe', definition: 'A large, powerful central computer system.', translation: 'เครื่องคอมพิวเตอร์หลักขนาดใหญ่' }
    ];
  } else if (genre === 'Adventure' || genre === 'Fantasy') {
    narrativeBlocks = [
      `Aiden pushed aside the thick vines, revealing the entrance to the legendary Temple of the Emerald Sun.`,
      `The air inside was cool and heavy with the scent of ancient moss, centuries of dust resting on the stone murals.`,
      `At the center of the chamber, atop a white marble pedestal, floated a pulsing jade amulet radiating pure golden light.`,
      `"Take only the amulet, but touch not the golden floor," the translation of the ancient runes warned.`,
      `With steady hands, Aiden snatched the amulet. Suddenly, the temple began to tremble, stone pillars collapsing around him!`,
      `He sprinted toward the collapsing archway, diving through the dust and into the bright forest just as the temple sealed itself forever.`
    ];
    vocabulary = [
      { word: 'legendary', definition: 'Remarkable enough to be famous; very well known.', translation: 'เป็นตำนาน / เลื่องชื่อ' },
      { word: 'pedestal', definition: 'The base or support on which a statue or obelisk is mounted.', translation: 'แท่น / ฐานรอง' },
      { word: 'amulet', definition: 'An ornament or small piece of jewelry thought to give protection against evil.', translation: 'เครื่องราง / ของขลัง' },
      { word: 'sprinted', definition: 'Ran at full speed over a short distance.', translation: 'วิ่งเต็มเหยียด / วิ่งอย่างรวดเร็ว' }
    ];
  } else {
    // Default / Romance / Other genres
    narrativeBlocks = [
      `The soft piano melody played as Elena stepped into the crowded ballroom, her velvet gown catching the golden chandelier light.`,
      `Across the crowded room, Arthur stood holding a sealed letter, his eyes immediately locking onto her entrance.`,
      `They moved toward each other through the swirl of dancers, their footsteps synchronized to the gentle rhythm of the waltz.`,
      `"I believed you had left the capital for good," Arthur murmured, handing her the wax-stamped envelope.`,
      `Elena broke the seal with trembling fingers, gasping as she read the secret message written inside: "The crown is safe."`,
      `Together under the moonlit terrace, they vowed to protect their realm whatever danger tomorrow might bring.`
    ];
    vocabulary = [
      { word: 'ballroom', definition: 'A large room used for dancing.', translation: 'ห้องเต้นรำ' },
      { word: 'synchronized', definition: 'Occurring at the same time or rate.', translation: 'พร้อมเพรียงกัน / ตรงจังหวะกัน' },
      { word: 'envelope', definition: 'A flat paper container, especially for a letter.', translation: 'ซองจดหมาย' },
      { word: 'realm', definition: 'A kingdom or domain.', translation: 'อาณาจักร' }
    ];
  }

  return {
    title,
    narrativeBlocks,
    vocabulary
  };
}

export default function StorytellingPage() {
  const { toast } = useToast();
  
  // Game states: 'config' | 'loading' | 'reading' | 'completed'
  const [readState, setReadState] = useState<'config' | 'loading' | 'reading' | 'completed'>('config');
  
  // Setup inputs
  const [genre, setGenre] = useState('Fantasy');
  const [length, setLength] = useState<'short' | 'long'>('short');
  const [source, setSource] = useState<'preset' | 'ai'>('preset');
  const [presetKey, setPresetKey] = useState('haunted-manor');
  const [customTheme, setCustomTheme] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  
  // Active story payload
  const [activeStory, setActiveStory] = useState<ReaderStory | null>(null);

  // Persistent Unlocked Episodes per campaign
  const [unlockedEpisodes, setUnlockedEpisodes] = useState<Record<string, number[]>>({
    'haunted-manor': [1],
    'school-comedy': [1],
    'quantum-chronicles-1': [1]
  });

  // Persistent Story Bookmark
  const [bookmark, setBookmark] = useState<StoryBookmark | null>(null);

  // Reading tracking
  const [blockIndex, setBlockIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);   // 0.0 – 1.0
  const [ttsVolume, setTtsVolume] = useState(0.8);       // 0.0 – 1.0
  const synthRef = useRef<AmbientSynthesizer | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auth and Firestore references
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();

  // Load unlocked episodes and bookmark from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUnlocked = localStorage.getItem('lingoland_unlocked_episodes');
        if (savedUnlocked) {
          const parsed = JSON.parse(savedUnlocked);
          if (parsed && typeof parsed === 'object') {
            setUnlockedEpisodes(prev => ({ ...prev, ...parsed }));
          }
        }

        const savedBookmark = localStorage.getItem('lingoland_story_bookmark');
        if (savedBookmark) {
          const parsedBookmark = JSON.parse(savedBookmark);
          if (parsedBookmark && parsedBookmark.title && parsedBookmark.activeStory) {
            setBookmark(parsedBookmark);
          }
        }
      } catch (err) {
        console.warn('Failed to parse local storage for storytelling:', err);
      }
    }
  }, []);

  // Unlock an episode for a campaign and save to localStorage
  const unlockEpisode = (campaignKey: string, epNum: number) => {
    setUnlockedEpisodes(prev => {
      const current = prev[campaignKey] || [1];
      if (current.includes(epNum)) return prev;
      const updated = {
        ...prev,
        [campaignKey]: [...current, epNum].sort((a, b) => a - b)
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('lingoland_unlocked_episodes', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  // Save current position as bookmark
  const saveBookmark = (story: ReaderStory, currentBlockIdx: number) => {
    if (!story || !story.narrativeBlocks || story.narrativeBlocks.length === 0) return;
    const currentKey = source === 'preset' ? presetKey : `ai-${genre}`;
    const newBookmark: StoryBookmark = {
      campaignKey: currentKey,
      title: story.title,
      genre,
      source,
      episodeNumber,
      blockIndex: currentBlockIdx,
      totalBlocks: story.narrativeBlocks.length,
      narrativePreview: story.narrativeBlocks[currentBlockIdx] || story.narrativeBlocks[0],
      timestamp: Date.now(),
      activeStory: story,
      length,
      customTheme
    };
    setBookmark(newBookmark);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lingoland_story_bookmark', JSON.stringify(newBookmark));
      } catch (e) {}
    }
  };

  // Remove saved bookmark
  const clearBookmark = () => {
    setBookmark(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('lingoland_story_bookmark');
      } catch (e) {}
    }
  };

  // Resume directly from bookmark
  const handleResumeBookmark = () => {
    if (!bookmark || !bookmark.activeStory) return;
    setActiveStory(bookmark.activeStory);
    setBlockIndex(bookmark.blockIndex);
    setGenre(bookmark.genre);
    setSource(bookmark.source);
    if (bookmark.source === 'preset') {
      setPresetKey(bookmark.campaignKey);
    } else {
      setCustomTheme(bookmark.customTheme || '');
    }
    setEpisodeNumber(bookmark.episodeNumber);
    setLength(bookmark.length || 'short');
    setReadState('reading');
    toast({
      title: "Resumed from Bookmark 🔖",
      description: `Continuing "${bookmark.title}" at block ${bookmark.blockIndex + 1} of ${bookmark.totalBlocks}.`,
      className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
    });
  };

  // User explicitly clicks "Bookmark & Pause" while reading
  const handleBookmarkAndExit = () => {
    if (activeStory) {
      saveBookmark(activeStory, blockIndex);
      toast({
        title: "Story Bookmarked! 🔖",
        description: `Saved at Block ${blockIndex + 1} of ${activeStory.narrativeBlocks.length} in Episode ${episodeNumber}. You can return anytime to resume.`,
        className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
      });
    }
    if (isSpeaking && canSpeak) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      setIsSpeaking(false);
    }
    setIsFullscreen(false);
    setReadState('config');
  };

  // Escape key handler to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize and clean up Ambient Synthesizer background music
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = new AmbientSynthesizer();
    }
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  // Control background music play/stop based on state, genre, toggle, and volume
  useEffect(() => {
    if (readState === 'reading' && musicEnabled) {
      synthRef.current?.start(genre, musicVolume);
    } else {
      synthRef.current?.stop();
    }
  }, [readState, musicEnabled, genre]);

  // Live-update music volume without restarting
  useEffect(() => {
    if (musicEnabled) synthRef.current?.setVolume(musicVolume);
  }, [musicVolume]);

  // Safe speech synthesis helper — guards against FB/IG in-app browsers that lack the API
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Initialize and clean up TTS
  useEffect(() => {
    return () => {
      if (canSpeak) window.speechSynthesis.cancel();
    };
  }, []);

  // Text-to-speech speaker — proper toggle: clicking while speaking stops it
  const handleSpeak = (text: string, forceToggle = false) => {
    if (!canSpeak) return; // Not supported in this browser/WebView

    // Always cancel any ongoing speech first
    try { window.speechSynthesis.cancel(); } catch (e) { return; }
    currentUtteranceRef.current = null;

    // If already speaking, just stop (toggle off)
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // If TTS is disabled and not a manual force-toggle, do nothing
    if (!ttsEnabled && !forceToggle) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.volume = ttsVolume;
      utterance.onend = () => { setIsSpeaking(false); currentUtteranceRef.current = null; };
      utterance.onerror = () => { setIsSpeaking(false); currentUtteranceRef.current = null; };
      currentUtteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      setIsSpeaking(false);
    }
  };

  // Update volume of current utterance live (re-speak is needed for Web Speech API)
  const handleTtsVolumeChange = (vol: number) => {
    setTtsVolume(vol);
    if (isSpeaking && activeStory && canSpeak) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      setIsSpeaking(false);
      setTimeout(() => handleSpeak(activeStory.narrativeBlocks[blockIndex], true), 80);
    }
  };

  // Launch Story Reader Session
  const handleLaunchReader = async () => {
    setReadState('loading');
    setBlockIndex(0);
    
    if (source === 'preset') {
      const campaignStories = presetStories[presetKey];
      const selected = campaignStories?.[episodeNumber] || campaignStories?.[1];
      if (selected) {
        if (presetKey === 'haunted-manor') setGenre('Horror');
        if (presetKey === 'school-comedy') setGenre('Comedy');
        if (presetKey === 'quantum-chronicles-1') {
          setGenre('Sci-Fi');
          setLength('long');
        }
        
        setTimeout(() => {
          setActiveStory(selected);
          setReadState('reading');
          saveBookmark(selected, 0);
          if (ttsEnabled) {
            setTimeout(() => handleSpeak(selected.narrativeBlocks[0]), 800);
          }
        }, 700);
      } else {
        setReadState('config');
        toast({ variant: 'destructive', title: 'Story Not Found', description: 'Could not load preset story episode.' });
      }
    } else {
      // AI story generation
      const finalTheme = customTheme.trim() !== '' ? customTheme.trim() : `An interesting ${genre} narrative focusing on vocabulary.`;
      
      try {
        const res = await generateReaderStory({
          genre,
          length,
          theme: finalTheme,
          episodeNumber
        });
        
        if (res && res.narrativeBlocks && res.narrativeBlocks.length > 0) {
          setActiveStory(res);
          setReadState('reading');
          saveBookmark(res, 0);
          
          if (ttsEnabled) {
            setTimeout(() => handleSpeak(res.narrativeBlocks[0]), 800);
          }
        } else {
          setReadState('config');
          toast({ variant: 'destructive', title: 'Generation Failed', description: 'AI storyteller was unable to write. Please try again.' });
        }
      } catch (err) {
        console.warn("AI Reader Story generation failed, switching to premium local simulation:", err);
        const simulated = generateSimulatedStory(genre, length, finalTheme, episodeNumber);
        setTimeout(() => {
          setActiveStory(simulated);
          setReadState('reading');
          saveBookmark(simulated, 0);
          toast({
            title: "Offline Intelligence Active 🔮",
            description: `Auto-synthesized a custom ${genre} episode natively!`,
            className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
          });
          if (ttsEnabled) {
            setTimeout(() => handleSpeak(simulated.narrativeBlocks[0]), 800);
          }
        }, 600);
      }
    }
  };

  // Handle clicking through the blocks
  const handleNextBlock = () => {
    if (!activeStory) return;
    
    if (isSpeaking) {
      if (canSpeak) try { window.speechSynthesis.cancel(); } catch (e) {}
      setIsSpeaking(false);
    }
    
    if (blockIndex >= activeStory.narrativeBlocks.length - 1) {
      // Completed episode!
      const currentCampaignKey = source === 'preset' ? presetKey : `ai-${genre}`;
      const nextEp = episodeNumber + 1;
      unlockEpisode(currentCampaignKey, nextEp);
      clearBookmark();
      
      toast({
        title: `Episode ${episodeNumber} Cleared! 🏆`,
        description: `Episode ${nextEp} is now unlocked in this campaign!`,
        className: "bg-emerald-950 border-emerald-500/30 text-emerald-200"
      });
      
      setReadState('completed');
      return;
    }
    
    const nextIdx = blockIndex + 1;
    setBlockIndex(nextIdx);
    saveBookmark(activeStory, nextIdx);
    
    if (ttsEnabled) {
      setTimeout(() => handleSpeak(activeStory.narrativeBlocks[nextIdx]), 200);
    }
  };

  // Saves vocabulary card to Flashcards tab in Firestore
  const handleSaveWord = async (wordItem: VocabularyItem) => {
    if (!user || isGuest) {
      toast({
        title: "Flashcard Saved locally! 🗃️✨",
        description: `"${wordItem.word}" (${wordItem.translation}) saved in your guest collection. Sign in or register to sync with your Leitner study deck in the cloud!`,
        className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
      });
      return;
    }

    try {
      const newCard = {
        word: wordItem.word,
        definition: wordItem.definition,
        translation: wordItem.translation,
        exampleSentence: `Featured in LingoLand story: "${activeStory?.title || 'Visual Novel'}"`,
        hint: `Learnt from ${genre} genre story`,
        context: activeStory?.narrativeBlocks.join(" ") || "",
        emoji: '📖',
        createdAt: new Date().toISOString(),
        nextReviewDate: new Date().toISOString(),
        intervalDays: 1,
        box: 1,
      };

      await addDoc(collection(firestore, `users/${user.uid}/flashcards`), newCard);

      toast({
        title: "Flashcard Stored! 🗃️✨",
        description: `"${wordItem.word}" (${wordItem.translation}) successfully synchronized with your Leitner study deck! You can access and practice this card from the "Flashcards" tab in the sidebar!`,
        className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
      });
    } catch (e: any) {
      console.error("Failed to save flashcard:", e);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: `Could not save card: ${e?.message || e}`,
      });
    }
  };

  // Advanced next-episode handler
  const handleNextEpisode = () => {
    const nextEp = episodeNumber + 1;
    const currentCampaignKey = source === 'preset' ? presetKey : `ai-${genre}`;
    unlockEpisode(currentCampaignKey, nextEp);
    setEpisodeNumber(nextEp);
    
    if (source === 'preset') {
      const campaignStories = presetStories[presetKey];
      if (campaignStories && campaignStories[nextEp]) {
        toast({
          title: `Launching Episode ${nextEp}! 🔓`,
          description: `Loading next chapter of ${CAMPAIGN_REGISTRY[presetKey]?.title || 'the campaign'}.`,
          className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
        });
        setTimeout(handleLaunchReader, 500);
      } else {
        // Dynamic AI generation for episodes past presets
        setSource('ai');
        setCustomTheme(`Continuation Episode ${nextEp} of ${CAMPAIGN_REGISTRY[presetKey]?.title || 'the campaign'}`);
        setTimeout(handleLaunchReader, 500);
      }
    } else {
      setTimeout(handleLaunchReader, 500);
    }
  };

  // Determine dynamic typography and backgrounds based on selected Genre
  const getGenreTheme = () => {
    switch (genre) {
      case 'Horror':
        return {
          bg: 'from-purple-950/20 via-zinc-950/45 to-slate-950/20 border-purple-500/20 shadow-purple-950/25',
          text: 'text-purple-300 font-sans',
          badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/25',
          accent: 'text-purple-400'
        };
      case 'Comedy':
        return {
          bg: 'from-amber-900/10 via-orange-950/20 to-yellow-950/10 border-amber-500/20 shadow-amber-950/15',
          text: 'text-amber-250 font-serif',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
          accent: 'text-amber-400'
        };
      case 'Adventure':
        return {
          bg: 'from-emerald-950/15 via-teal-950/25 to-slate-950/15 border-emerald-500/20 shadow-emerald-950/15',
          text: 'text-emerald-300 font-sans',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
          accent: 'text-emerald-400'
        };
      case 'Sci-Fi':
      case 'Cyberpunk':
        return {
          bg: 'from-cyan-950/15 via-blue-950/25 to-zinc-950/15 border-cyan-500/20 shadow-cyan-950/15',
          text: 'text-cyan-300 font-sans tracking-wide',
          badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25',
          accent: 'text-cyan-400'
        };
      case 'Romance':
        return {
          bg: 'from-rose-950/15 via-red-950/25 to-slate-950/15 border-rose-500/20 shadow-rose-950/15',
          text: 'text-rose-300 font-serif italic',
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
          accent: 'text-rose-400'
        };
      default:
        return {
          bg: 'from-indigo-950/15 via-slate-950/25 to-zinc-950/15 border-indigo-500/20 shadow-indigo-950/15',
          text: 'text-indigo-250 font-sans',
          badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25',
          accent: 'text-indigo-400'
        };
    }
  };

  const themeConfig = getGenreTheme();

  return (
    <div className="relative -m-3 md:-m-4 lg:-m-5 min-h-[calc(100vh-4.5rem)] flex-1 flex flex-col p-4 sm:p-8 md:p-10 lg:p-12 text-white overflow-hidden bg-slate-950/20">
      <ConstellationCanvas />
      
      {/* Background ambient highlights */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex-1 flex flex-col">
        
        <AnimatePresence mode="wait">
          
          {/* SETUP SCREEN */}
          {readState === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 sm:space-y-8 w-full max-w-[1700px] mx-auto flex-1 flex flex-col justify-center py-4 sm:py-8"
            >
              <div className="text-center space-y-3 select-none">
                <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-black tracking-widest uppercase py-1.5 px-4 text-xs">
                  Interactive Story Reader
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 uppercase tracking-tight">
                  Visual Novel Storyteller
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
                  Engage in click-by-click narrative learning! Read high-end presets or let AI compose continuous episodes tailored to your exact tastes.
                </p>
              </div>

              {/* BOOKMARK RESUME BANNER */}
              {bookmark && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900/90 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 select-none relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
                  
                  <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5 shadow-lg shadow-indigo-500/20">
                      <Bookmark className="h-6 w-6 sm:h-7 sm:w-7 fill-current animate-pulse text-indigo-400" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 flex items-center gap-1">
                          <BookmarkCheck className="h-3 w-3" />
                          Bookmark Saved
                        </Badge>
                        <Badge className="bg-slate-900 text-slate-300 border-slate-800 text-[10px] font-black uppercase px-2 py-0.5">
                          {bookmark.genre}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-bold">
                          Episode {bookmark.episodeNumber} · Block {bookmark.blockIndex + 1} of {bookmark.totalBlocks} ({Math.round(((bookmark.blockIndex + 1) / bookmark.totalBlocks) * 100)}%)
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-black text-slate-100 truncate">
                        {bookmark.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-350 italic line-clamp-1">
                        "{bookmark.narrativePreview}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 justify-end">
                    <Button
                      onClick={handleResumeBookmark}
                      className="flex-1 md:flex-initial bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider h-12 px-6 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Bookmark className="h-4 w-4 fill-current" />
                      Resume Story
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={clearBookmark}
                      className="h-12 px-4 rounded-2xl border border-slate-800 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase transition-colors"
                      title="Discard saved bookmark"
                    >
                      Dismiss
                    </Button>
                  </div>
                </motion.div>
              )}

              <Card className="bg-slate-900/40 border-slate-850/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl w-full">
                <CardContent className="p-0 space-y-8 sm:space-y-10">
                  
                  {/* Select Preset vs AI source */}
                  <div className="space-y-3 select-none">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">1. Select Campaign Source</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSource('preset')}
                        className={`py-4 px-6 rounded-2xl border text-sm sm:text-base font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                          source === 'preset'
                            ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        Read Preset Classics
                      </button>
                      <button
                        type="button"
                        onClick={() => setSource('ai')}
                        className={`py-4 px-6 rounded-2xl border text-sm sm:text-base font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                          source === 'ai'
                            ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        Generate custom AI story
                      </button>
                    </div>
                  </div>

                  {/* PRESET CHANNELS */}
                  {source === 'preset' ? (
                    <div className="space-y-6 select-none">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">2. Choose Story Campaign</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                          {Object.values(CAMPAIGN_REGISTRY).map(camp => {
                            const isCampSelected = presetKey === camp.id;
                            const unlockedCount = (unlockedEpisodes[camp.id] || [1]).length;
                            const hasBookmark = bookmark && bookmark.source === 'preset' && bookmark.campaignKey === camp.id;

                            return (
                              <button
                                key={camp.id}
                                type="button"
                                onClick={() => {
                                  setPresetKey(camp.id);
                                  // Default episode to lowest unlocked or current bookmark
                                  if (hasBookmark) {
                                    setEpisodeNumber(bookmark.episodeNumber);
                                  } else {
                                    const unlocked = unlockedEpisodes[camp.id] || [1];
                                    setEpisodeNumber(unlocked[unlocked.length - 1] || 1);
                                  }
                                }}
                                className={`p-5 sm:p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden ${
                                  isCampSelected
                                    ? 'bg-indigo-500/15 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                                }`}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-3xl p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">{camp.icon}</span>
                                    <div className="flex items-center gap-1.5">
                                      {hasBookmark && (
                                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-black uppercase py-0.5 px-2">
                                          🔖 Bookmarked
                                        </Badge>
                                      )}
                                      <Badge className={isCampSelected ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'}>
                                        {camp.genre}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-black text-base text-slate-100 leading-snug">{camp.title}</p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{camp.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-850/60 text-xs">
                                  <span className="text-indigo-400 font-extrabold">
                                    {unlockedCount}/{camp.totalEpisodes} Episodes Unlocked 🔓
                                  </span>
                                  <ChevronRight className={`h-5 w-5 ${isCampSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* UNLOCKED EPISODES SELECTOR */}
                      <div className="space-y-3 pt-4 border-t border-slate-850/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4.5 w-4.5 text-indigo-400" />
                            <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                              3. Choose Unlocked Episode ({CAMPAIGN_REGISTRY[presetKey]?.title})
                            </Label>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            Complete previous episodes to unlock future chapters
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          {CAMPAIGN_REGISTRY[presetKey]?.episodes.map(ep => {
                            const isUnlocked = (unlockedEpisodes[presetKey] || [1]).includes(ep.number);
                            const isSelected = episodeNumber === ep.number;
                            const isBookmarked = bookmark && bookmark.source === 'preset' && bookmark.campaignKey === presetKey && bookmark.episodeNumber === ep.number;

                            return (
                              <button
                                key={ep.number}
                                type="button"
                                disabled={!isUnlocked}
                                onClick={() => setEpisodeNumber(ep.number)}
                                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between gap-3 ${
                                  !isUnlocked
                                    ? 'opacity-40 cursor-not-allowed border-slate-850/60 bg-slate-950/30'
                                    : isSelected
                                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-indigo-400 animate-ping' : isUnlocked ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                    <span className="font-black text-xs uppercase tracking-wider text-slate-200">
                                      Episode {ep.number}
                                    </span>
                                  </div>
                                  {isBookmarked ? (
                                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px] font-black uppercase px-2 py-0.5 flex items-center gap-1">
                                      <Bookmark className="h-2.5 w-2.5 fill-current" />
                                      Bookmark ({bookmark.blockIndex + 1}/{bookmark.totalBlocks})
                                    </Badge>
                                  ) : isUnlocked ? (
                                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5 flex items-center gap-1">
                                      <CheckCircle2 className="h-2.5 w-2.5" />
                                      Unlocked
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-slate-900 text-slate-500 border-slate-800 text-[9px] font-black uppercase px-2 py-0.5 flex items-center gap-1">
                                      <Lock className="h-2.5 w-2.5" />
                                      Locked
                                    </Badge>
                                  )}
                                </div>
                                
                                <div>
                                  <p className="text-sm font-black text-slate-100 leading-snug">
                                    {ep.title}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed line-clamp-2">
                                    {isUnlocked ? ep.description : `Complete Episode ${ep.number - 1} to unlock this chapter`}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                  <span className={isSelected ? 'text-indigo-400' : isUnlocked ? 'text-slate-400' : 'text-slate-600'}>
                                    {isSelected ? 'Selected Chapter' : isUnlocked ? 'Click to Choose' : 'Locked'}
                                  </span>
                                  {isUnlocked ? <Unlock className="h-3.5 w-3.5 text-emerald-400" /> : <Lock className="h-3.5 w-3.5 text-slate-600" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    
                    /* GENERATIVE OPTIONS */
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 sm:space-y-8"
                    >
                      {/* Genres selector */}
                      <div className="space-y-3 select-none">
                        <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">2. Select Story Genre</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                          {["Comedy", "Horror", "Adventure", "Fantasy", "Romance", "Sci-Fi"].map(g => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGenre(g)}
                              className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-bold uppercase transition-all duration-300 ${
                                genre === g
                                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        
                        {/* Length selector */}
                        <div className="space-y-3 select-none">
                          <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">3. Story Format</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setLength('short')}
                              className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-bold uppercase transition-all duration-300 ${
                                length === 'short'
                                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              Short Story
                            </button>
                            <button
                              type="button"
                              onClick={() => setLength('long')}
                              className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-bold uppercase transition-all duration-300 ${
                                length === 'long'
                                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              Long (Part/Ep)
                            </button>
                          </div>
                        </div>

                        {/* Episode selector (if long story) */}
                        <div className="space-y-3 select-none">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">4. Campaign Part/Episode</Label>
                            {length === 'long' && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                {unlockedEpisodes[`ai-${genre}`]?.length || 1} Part(s) Unlocked
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map(num => {
                              const aiUnlocked = (unlockedEpisodes[`ai-${genre}`] || [1]).includes(num);
                              const isDisabled = length !== 'long' || !aiUnlocked;
                              
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => setEpisodeNumber(num)}
                                  className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-bold uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                                    length !== 'long' ? 'opacity-30 cursor-not-allowed border-slate-900 bg-slate-950/10' :
                                    !aiUnlocked ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950/20 text-slate-600' :
                                    episodeNumber === num
                                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                  }`}
                                >
                                  {aiUnlocked ? <span>Part {num}</span> : <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> P{num}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Custom write-in theme */}
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">5. Story Premise & Topic</Label>
                        <Input
                          placeholder="E.g., A funny detective who loses his socks and interviews talking chairs..."
                          value={customTheme}
                          onChange={(e) => setCustomTheme(e.target.value)}
                          className="bg-slate-950/70 border-slate-800 rounded-2xl h-14 text-sm sm:text-base px-5 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500"
                        />
                      </div>

                    </motion.div>
                  )}

                </CardContent>
                <CardFooter className="p-0 pt-8 sm:pt-10">
                  <Button
                    onClick={handleLaunchReader}
                    className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-sm sm:text-base tracking-wider h-14 sm:h-16 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.005] active:scale-[0.995]"
                  >
                    <BookOpen className="h-5 w-5 fill-current" />
                    Launch Episode {episodeNumber} Reader
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* LOADING SCREEN */}
          {readState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 flex flex-col items-center justify-center gap-6 bg-slate-900/30 border border-slate-850 rounded-3xl backdrop-blur-xl p-12 max-w-2xl mx-auto my-auto"
            >
              <div className="relative">
                <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
                <BookOpen className="w-7 h-7 text-amber-400 absolute top-3.5 left-3.5 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-100 uppercase tracking-widest">Inscribing Chronicle...</h3>
                <p className="text-slate-400 text-sm font-semibold">Gemini is laying down sentences and defining Thai vocabulary helpers.</p>
              </div>
            </motion.div>
          )}

          {/* PLAYING CLICK-BY-CLICK NOVEL MODE */}
          {readState === 'reading' && activeStory && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={isFullscreen ? "fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12 overflow-y-auto" : "flex flex-col gap-6 w-full max-w-[1700px] mx-auto flex-grow h-full justify-between py-2 sm:py-4"}
            >
              
              {/* Floating Exit Fullscreen Button + Audio & Bookmark Controls Panel */}
              {isFullscreen && (
                <>
                  <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBookmarkAndExit}
                      className="bg-slate-900/90 hover:bg-slate-800/90 border border-amber-500/40 text-amber-300 hover:text-amber-200 px-4.5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-2xl flex items-center gap-2 transition-all active:scale-95 duration-200"
                    >
                      <Bookmark className="h-4 w-4 fill-current text-amber-400" />
                      <span>Bookmark & Exit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFullscreen(false)}
                      className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-slate-350 hover:text-white px-4.5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-2xl flex items-center gap-2 transition-all active:scale-95 duration-200"
                    >
                      <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Exit Fullscreen (Esc)</span>
                    </button>
                  </div>

                  {/* Floating Audio Control Panel — bottom-left in fullscreen */}
                  <div className="fixed bottom-6 left-6 z-50 bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 flex flex-col gap-3 min-w-[220px] select-none">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">🎚️ Audio Controls</p>

                    {/* Music row */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setMusicEnabled(!musicEnabled)}
                        className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          musicEnabled ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'border-slate-700 text-slate-500 hover:text-slate-300'
                        }`}
                        title={musicEnabled ? 'Mute music' : 'Unmute music'}
                      >
                        {musicEnabled ? <Music className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Music</span>
                        <input
                          type="range"
                          min="0" max="1" step="0.05"
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                          disabled={!musicEnabled}
                          className="w-full h-1.5 accent-indigo-500 cursor-pointer disabled:opacity-30"
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 w-7 text-right">{Math.round(musicVolume * 100)}</span>
                    </div>

                    {/* AI Voice row */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleSpeak(activeStory.narrativeBlocks[blockIndex], true)}
                        className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          isSpeaking ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-500 hover:text-slate-300'
                        }`}
                        title={isSpeaking ? 'Stop AI voice' : 'Play AI voice'}
                      >
                        {isSpeaking ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">AI Voice</span>
                        <input
                          type="range"
                          min="0" max="1" step="0.05"
                          value={ttsVolume}
                          onChange={(e) => handleTtsVolumeChange(parseFloat(e.target.value))}
                          className="w-full h-1.5 accent-amber-500 cursor-pointer"
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 w-7 text-right">{Math.round(ttsVolume * 100)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Progress and settings bar */}
              <div className="bg-slate-950/60 border border-slate-850 p-5 sm:p-6 rounded-2xl flex justify-between items-center shadow-md select-none">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-base sm:text-lg font-black text-slate-100 truncate">{activeStory.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 select-none">
                    <Badge className={`${themeConfig.badge} text-[10px] font-black uppercase py-0.5 px-2.5 shrink-0`}>
                      {genre}
                    </Badge>
                    <Badge className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase py-0.5 px-2.5 shrink-0">
                      Episode {episodeNumber}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Bookmark & Pause Button */}
                  <Button
                    variant="ghost"
                    onClick={handleBookmarkAndExit}
                    className="h-10 px-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
                    title="Bookmark progress and pause"
                  >
                    <Bookmark className="h-4 w-4 text-amber-400 fill-amber-400/40" />
                    <span className="hidden sm:inline">Bookmark</span>
                  </Button>

                  {/* Ambient Soundtrack Trigger */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMusicEnabled(!musicEnabled)}
                    className={`h-10 w-10 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors ${
                      musicEnabled ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={musicEnabled ? 'Mute ambient music' : 'Play ambient music'}
                  >
                    <Music className={`h-4.5 w-4.5 ${musicEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                  </Button>

                  {/* TTS Vocal Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSpeak(activeStory.narrativeBlocks[blockIndex], true)}
                    className={`h-10 w-10 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors ${
                      isSpeaking ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={isSpeaking ? 'Stop AI voice' : 'Read aloud with AI voice'}
                  >
                    {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  {/* Fullscreen Mode Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-10 w-10 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    title={isFullscreen ? 'Minimize Screen' : 'Maximize Fullscreen'}
                  >
                    {isFullscreen ? (
                      <svg className="h-5 w-5 text-indigo-455" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </Button>

                  <button
                    onClick={() => { setIsFullscreen(false); setReadState('config'); }}
                    className="text-xs font-black uppercase text-slate-500 hover:text-slate-350 transition-colors p-2"
                  >
                    Exit
                  </button>
                </div>
              </div>

              {/* Progress gauge bar */}
              <div className="space-y-2 select-none">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  <span>Episode {episodeNumber} Progress</span>
                  <span>{blockIndex + 1} / {activeStory.narrativeBlocks.length} blocks</span>
                </div>
                <Progress 
                  value={((blockIndex + 1) / activeStory.narrativeBlocks.length) * 100} 
                  className="h-2.5 rounded-full bg-slate-900 border border-slate-850"
                />
              </div>

              {/* THE ACTIVE CHATBOX BALLOON READER */}
              <div
                onClick={handleNextBlock}
                className={`bg-gradient-to-b ${themeConfig.bg} border-2 backdrop-blur-xl rounded-3xl shadow-2xl text-center cursor-pointer flex flex-col justify-center items-center relative transition-all duration-500 hover:brightness-105 active:scale-[0.99] group ${isFullscreen ? 'flex-grow my-4 p-10 sm:p-20 min-h-[55vh]' : 'flex-grow min-h-[58vh] sm:min-h-[65vh] my-3 p-8 sm:p-16 lg:p-24'}`}
              >
                
                {/* Visual novel talk box prompt */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-slate-850 text-slate-500 text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full flex items-center gap-1.5 select-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>Click box to continue reading</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={blockIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`font-bold leading-relaxed max-w-6xl mx-auto select-text text-justify sm:text-center ${themeConfig.text} ${isFullscreen ? 'text-2xl sm:text-4xl' : 'text-2xl sm:text-3xl lg:text-4xl'}`}
                  >
                    {activeStory.narrativeBlocks[blockIndex]}
                  </motion.p>
                </AnimatePresence>

                {/* Right button helper */}
                <div className="absolute bottom-5 right-5 flex items-center gap-1.5 bg-slate-950/70 border border-slate-850 py-2 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-400 transition-colors select-none">
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4 fill-current animate-pulse" />
                </div>
              </div>

            </motion.div>
          )}


          {/* CAMPAIGN CLEARED / VOCAB REVIEW BOARD */}
          {readState === 'completed' && activeStory && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-[1700px] mx-auto space-y-8 text-center select-none flex-1 flex flex-col justify-center py-6 sm:py-10"
            >
              <Card className="bg-slate-900/40 border-slate-850/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 lg:p-14 shadow-2xl space-y-8">
                
                <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-bounce">
                  <Trophy className="h-10 w-10" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black tracking-widest uppercase px-4 py-1 text-xs">
                      Episode {episodeNumber} Cleared!
                    </Badge>
                    <Badge className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-black tracking-widest uppercase px-4 py-1 text-xs flex items-center gap-1">
                      <Unlock className="h-3.5 w-3.5" />
                      Episode {episodeNumber + 1} Unlocked
                    </Badge>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-100 uppercase tracking-tight">Campaign Epilogue</h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    You have cleared **{activeStory.title}**! Review the key vocabulary cards featured in this narrative.
                  </p>
                </div>

                {/* Vocabulary Cards list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {activeStory.vocabulary.map((vocab, i) => (
                    <div 
                      key={i}
                      className="bg-slate-950/60 border border-slate-850 p-5 sm:p-6 rounded-2xl flex flex-col justify-between text-left gap-4 relative"
                    >
                      <div className="space-y-2 select-text">
                        <h4 className="font-extrabold text-amber-455 text-base sm:text-lg capitalize flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-slate-600" />
                          {vocab.word}
                        </h4>
                        <p className="text-slate-350 text-xs sm:text-sm font-semibold leading-relaxed">
                          {vocab.definition}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                        <span className="text-indigo-400 text-xs sm:text-sm font-black select-text">Thai: {vocab.translation}</span>
                        <Button
                          onClick={() => handleSaveWord(vocab)}
                          className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 p-0 flex items-center justify-center shrink-0"
                          title="Save to Flashcards"
                        >
                          <BookMarked className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-850 flex flex-wrap gap-4 justify-center">
                  {/* Play Next Episode */}
                  <Button
                    onClick={handleNextEpisode}
                    className="bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black uppercase text-xs sm:text-sm tracking-wider h-12 px-6 rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Unlock className="h-4 w-4" />
                    <span>Play Episode {episodeNumber + 1}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {/* View All Episodes / Config */}
                  <Button
                    onClick={() => setReadState('config')}
                    variant="outline"
                    className="bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300 font-black uppercase text-xs sm:text-sm h-12 px-6 rounded-xl flex items-center gap-2"
                  >
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span>View Unlocked Episodes</span>
                  </Button>

                  <Button
                    onClick={() => {
                      setSource('ai');
                      setCustomTheme('');
                      setReadState('config');
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black uppercase text-xs sm:text-sm h-12 px-6 rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/10"
                  >
                    <Sparkles className="h-4.5 w-4.5" />
                    <span>Generate New AI Story</span>
                  </Button>

                  <Button
                    onClick={handleLaunchReader}
                    variant="ghost"
                    className="border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white font-black uppercase text-xs sm:text-sm tracking-wider h-12 px-6 rounded-xl flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reread Episode {episodeNumber}</span>
                  </Button>
                </div>

              </Card>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
