'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGameBySlug } from '@/lib/games';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../ui/card';
import { Button } from '../ui/button';
import { 
  Trophy, 
  Sparkles, 
  Maximize, 
  Minimize, 
  Rotate3d,
  Coins,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  Volume1,
  CheckCircle2,
  Flame,
  Zap,
  ShieldCheck,
  Play,
  Layers,
  Activity,
  Check,
  X,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';
import { shuffleArray } from '@/lib/shuffle';
import confetti from 'canvas-confetti';

type GameState = 'idle' | 'instructions' | 'category_selection' | 'playing' | 'finished';

interface VocabItem {
  word: string;
  hint: string;
  category?: string;
}

const CATEGORIES: Record<string, { label: string; icon: string; items: VocabItem[] }> = {
  jobs: {
    label: "Jobs & Occupations",
    icon: "💼",
    items: [
      { word: "Doctor", hint: "A person who treats sick people in a hospital." },
      { word: "Teacher", hint: "Someone who helps students learn in a classroom." },
      { word: "Engineer", hint: "A person who designs and builds complex machines or bridges." },
      { word: "Chef", hint: "A professional who cooks food in a restaurant." },
      { word: "Pilot", hint: "A person who flies airplanes." },
      { word: "Farmer", hint: "Someone who grows crops and raises animals." },
      { word: "Police Officer", hint: "A person whose job is to keep the community safe." },
      { word: "Astronaut", hint: "A person who travels into outer space." },
      { word: "Artist", hint: "Someone who creates paintings or sculptures." },
      { word: "Mechanic", hint: "A person who repairs cars and vehicles." },
      { word: "Veterinarian", hint: "An animal doctor who treats sick pets." },
      { word: "Tour Guide", hint: "A person who shows visitors interesting places." },
      { word: "Architect", hint: "A person who designs buildings and plans construction." },
      { word: "Journalist", hint: "A person who writes news stories or reports for media." },
      { word: "Musician", hint: "Someone who plays a musical instrument or writes songs." },
      { word: "Scientist", hint: "A researcher who studies the natural world through experiments." },
      { word: "Firefighter", hint: "A brave person who puts out fires and rescues people." },
      { word: "Dentist", hint: "A medical specialist who takes care of teeth and gums." },
      { word: "Librarian", hint: "A person in charge of managing books in a library." },
      { word: "Photographer", hint: "A person who takes high-quality pictures with a camera." },
      { word: "Carpenter", hint: "A skilled worker who makes or repairs wooden structures." },
      { word: "Actor", hint: "A person who performs in plays, movies, or television shows." },
      { word: "Electrician", hint: "A specialist who installs and repairs electrical wiring." },
      { word: "Plumber", hint: "A person who fits and repairs pipes and water systems." },
      { word: "Baker", hint: "Someone who makes bread, cakes, and pastries in an oven." },
      { word: "Detective", hint: "An investigator who searches for clues to solve crimes." },
      { word: "Tailor", hint: "A person whose occupation is making or altering clothes." },
      { word: "Florist", hint: "Someone who sells and arranges cut flowers and plants." },
      { word: "Web Developer", hint: "A programmer who creates and maintains websites." },
      { word: "Gardener", hint: "A person who cares for plants, lawns, and flowers in a garden." },
      { word: "Judge", hint: "A public official appointed to decide cases in a law court." },
      { word: "Athlete", hint: "A person who is trained in or good at sports or exercises." },
    ]
  },
  animals: {
    label: "Animals & Wildlife",
    icon: "🦁",
    items: [
      { word: "Lion", hint: "A large wild cat known as the king of the jungle." },
      { word: "Elephant", hint: "A huge mammal with a long trunk and large tusks." },
      { word: "Giraffe", hint: "An animal with a very long neck and spotted fur." },
      { word: "Penguin", hint: "A black and white flightless bird that swims in cold oceans." },
      { word: "Kangaroo", hint: "An Australian animal that hops and carries its baby in a pouch." },
      { word: "Dolphin", hint: "An intelligent marine mammal known for its playful behavior." },
      { word: "Owl", hint: "A nocturnal bird of prey with large eyes and silent flight." },
      { word: "Octopus", hint: "A sea creature with eight long arms and a soft body." },
      { word: "Bear", hint: "A large, heavy mammal with thick fur and a short tail." },
      { word: "Eagle", hint: "A large bird of prey with sharp eyesight and a strong beak." },
      { word: "Tiger", hint: "A large wild cat with orange and black stripes." },
      { word: "Whale", hint: "The largest marine mammal living in the ocean." },
      { word: "Monkey", hint: "A clever animal with a tail, known for climbing trees." },
      { word: "Fox", hint: "A small wild dog known for its cleverness and bushy tail." },
      { word: "Cheetah", hint: "The fastest land animal, covered in black spots." },
      { word: "Shark", hint: "A large ocean predator with sharp teeth and a cartilage skeleton." },
      { word: "Frog", hint: "An amphibian with long back legs for jumping." },
      { word: "Koala", hint: "An Australian tree-dwelling animal that eats eucalyptus leaves." },
      { word: "Bee", hint: "A flying insect that makes honey and pollinates flowers." },
      { word: "Butterfly", hint: "An insect with large, colorful wings." },
    ]
  },
  food: {
    label: "Food & Drinks",
    icon: "🍕",
    items: [
      { word: "Bread", hint: "A baked staple food made from flour, water, and yeast." },
      { word: "Pizza", hint: "An Italian dish with a flat crust, tomato sauce, and cheese." },
      { word: "Apple", hint: "A round fruit with red or green skin and crisp sweet flesh." },
      { word: "Chocolate", hint: "A sweet brown treat made from roasted cacao seeds." },
      { word: "Coffee", hint: "A popular hot drink brewed from roasted aromatic beans." },
      { word: "Milk", hint: "A white liquid produced by cows, rich in calcium." },
      { word: "Cheese", hint: "A dairy food made from milk curds, solid or soft." },
      { word: "Banana", hint: "A long curved yellow fruit with soft sweet flesh." },
      { word: "Rice", hint: "A staple grain cooked by boiling or steaming." },
      { word: "Soup", hint: "A warm liquid dish made with vegetables, meat, or broth." },
      { word: "Orange", hint: "A round citrus fruit with sweet juicy segments." },
      { word: "Burger", hint: "A sandwich consisting of a cooked patty inside a sliced bun." },
      { word: "Salad", hint: "A dish of mixed fresh vegetables, often with dressing." },
      { word: "Water", hint: "The clear liquid essential for all living organisms." },
      { word: "Ice Cream", hint: "A sweet frozen dessert made from milk fat and cream." },
      { word: "Tea", hint: "A hot drink made by infusing dried leaves in boiled water." },
      { word: "Honey", hint: "A sweet sticky liquid made by bees from flower nectar." },
      { word: "Cookie", hint: "A small, flat baked sweet dessert." },
      { word: "Pasta", hint: "An Italian dish made from dough boiled in water." },
      { word: "Potato", hint: "A starchy tuber vegetable cooked in many different ways." },
    ]
  },
  places: {
    label: "Places & Buildings",
    icon: "🏛️",
    items: [
      { word: "Hospital", hint: "A medical facility where sick people are treated by doctors." },
      { word: "School", hint: "An institution where students go to learn from teachers." },
      { word: "Library", hint: "A building containing collections of books to read or borrow." },
      { word: "Restaurant", hint: "A place where people pay to sit and eat cooked meals." },
      { word: "Airport", hint: "A complex where commercial airplanes take off and land." },
      { word: "Bakery", hint: "A shop that makes and sells fresh bread and pastries." },
      { word: "Museum", hint: "A building where historical or scientific objects are displayed." },
      { word: "Park", hint: "A public green area used for recreation and nature walks." },
      { word: "Hotel", hint: "An establishment providing lodging and meals for travelers." },
      { word: "Gym", hint: "A facility equipped with machines for physical exercise." },
      { word: "Supermarket", hint: "A large store selling groceries and household goods." },
      { word: "Theater", hint: "A hall where plays, movies, or musical shows are performed." },
      { word: "Bank", hint: "A financial institution that securely manages money and loans." },
      { word: "Zoo", hint: "A facility where wild animals are kept for public viewing." },
      { word: "Pharmacy", hint: "A store where medicines are dispensed and sold." },
      { word: "Police Station", hint: "The headquarters of local law enforcement officers." },
      { word: "Fire Station", hint: "A building where emergency firefighters and trucks are based." },
      { word: "Post Office", hint: "A facility where mail and packages are processed and sent." },
      { word: "Stadium", hint: "A large open arena used for major sports and concerts." },
      { word: "Castle", hint: "A large fortified stone building from medieval times." },
    ]
  },
  transportation: {
    label: "Transportation & Vehicles",
    icon: "🚀",
    items: [
      { word: "Airplane", hint: "A winged aircraft powered by jet engines or propellers." },
      { word: "Bicycle", hint: "A two-wheeled vehicle propelled by foot pedals." },
      { word: "Car", hint: "A four-wheeled motor vehicle for road transportation." },
      { word: "Train", hint: "A connected series of carriages moving on a railway track." },
      { word: "Bus", hint: "A large passenger vehicle designed to carry the public." },
      { word: "Ship", hint: "A large vessel for transporting cargo across deep oceans." },
      { word: "Helicopter", hint: "An aircraft with overhead rotors that can hover in place." },
      { word: "Submarine", hint: "A naval vessel capable of underwater navigation." },
      { word: "Rocket", hint: "A spacecraft propelled by high-speed exhaust into orbit." },
      { word: "Motorcycle", hint: "A motorized two-wheeled vehicle." },
      { word: "Tractor", hint: "A heavy farm vehicle used to pull agricultural machinery." },
      { word: "Truck", hint: "A large motor vehicle built for transporting heavy freight." },
      { word: "Ambulance", hint: "An emergency vehicle equipped to transport patients." },
      { word: "Taxi", hint: "A private vehicle with a driver hired for designated trips." },
      { word: "Sailboat", hint: "A boat propelled primarily by wind pushing against sails." },
      { word: "Hot Air Balloon", hint: "A large envelope filled with heated air that floats." },
      { word: "Scooter", hint: "A lightweight vehicle with two small wheels and a footboard." },
      { word: "Ferry", hint: "A boat that carries passengers and cars across water bodies." },
      { word: "Skateboard", hint: "A wooden board mounted on four wheels, ridden standing." },
      { word: "Space Shuttle", hint: "A reusable orbital spacecraft designed for space missions." },
    ]
  },
  space: {
    label: "Space & Astronomy",
    icon: "🪐",
    items: [
      { word: "Planet", hint: "A large celestial body orbiting around a star." },
      { word: "Sun", hint: "The glowing star situated at the center of our Solar System." },
      { word: "Moon", hint: "The natural rocky satellite orbiting Earth." },
      { word: "Star", hint: "A massive glowing sphere of hot plasma in outer space." },
      { word: "Galaxy", hint: "A gravitationally bound system of billions of stars." },
      { word: "Comet", hint: "An icy celestial body that develops a glowing tail near stars." },
      { word: "Asteroid", hint: "A minor rocky planet orbiting the inner Solar System." },
      { word: "Astronaut", hint: "A person trained to command or fly spacecraft." },
      { word: "Telescope", hint: "An optical instrument that magnifies distant astronomical objects." },
      { word: "Gravity", hint: "The invisible universal force that pulls masses together." },
      { word: "Orbit", hint: "The gravitationally curved path of an object around a point in space." },
      { word: "Meteor", hint: "A bright streak of light from a burning particle in the atmosphere." },
      { word: "Black Hole", hint: "A cosmic region where gravity is so strong nothing escapes." },
      { word: "Constellation", hint: "A recognized pattern of stars in the night sky." },
      { word: "Nebula", hint: "An interstellar cloud of dust, hydrogen, and helium gases." },
      { word: "Spaceship", hint: "A craft or machine designed to operate in outer space." },
      { word: "Saturn", hint: "The second-largest planet in the Solar System, famous for rings." },
      { word: "Mars", hint: "The fourth planet from the Sun, known as the Red Planet." },
      { word: "Eclipse", hint: "An astronomical event where one celestial object blocks another." },
      { word: "Satellite", hint: "An artificial object placed into orbit around a planet." },
    ]
  }
};

const BACKGROUND_FLOATS = [
  { char: '📖', left: '6%', size: '22px', duration: '13s', delay: '0s' },
  { char: '✏️', left: '16%', size: '20px', duration: '15s', delay: '3s' },
  { char: '📚', left: '84%', size: '24px', duration: '12s', delay: '1s' },
  { char: '🌟', left: '92%', size: '22px', duration: '16s', delay: '5s' },
  { char: '🪙', left: '10%', size: '26px', duration: '14s', delay: '6s' },
  { char: '🎓', left: '76%', size: '26px', duration: '17s', delay: '2s' },
  { char: '🧠', left: '26%', size: '22px', duration: '11s', delay: '4s' },
  { char: '🪐', left: '68%', size: '24px', duration: '15s', delay: '7s' },
  { char: '✨', left: '42%', size: '20px', duration: '12s', delay: '2.5s' },
];

export function VocabFlipper3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [vocabList, setVocabList] = React.useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [masteredCount, setMasteredCount] = React.useState(0);
  const [roundsCount, setRoundsCount] = React.useState<number>(8);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [particles, setParticles] = React.useState<any[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = React.useState<string>("mix");

  // Audio & Voice Engine States
  const [isMuted, setIsMuted] = React.useState(false);
  const [autoPronounce, setAutoPronounce] = React.useState(true);
  const [previewFlipped, setPreviewFlipped] = React.useState(false);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

  // Web Audio Synthesizer SFX
  const playSfx = React.useCallback((type: 'click' | 'flip' | 'master' | 'again' | 'win') => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'master') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.04);
          gain.gain.setValueAtTime(0.14, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.22);
        });
      } else if (type === 'again') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'win') {
        [440, 554.37, 659.25, 880, 1108.73].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.2, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.32);
        });
      }
    } catch (e) {
      // AudioContext unavailable
    }
  }, [isMuted]);

  // Text-To-Speech (TTS) pronunciation function
  const speakWord = React.useCallback((word: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  }, []);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Confetti on win
  React.useEffect(() => {
    if (gameState === 'finished') {
      playSfx('win');
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { x: 0.5, y: 0.6 }
      });
    }
  }, [gameState, playSfx]);

  const startNewGame = (categoryKey: string, countOverride?: number) => {
    playSfx('click');
    const targetCount = countOverride || roundsCount;
    setSelectedCategoryKey(categoryKey);
    let pool: VocabItem[] = [];

    if (categoryKey === "mix") {
      Object.keys(CATEGORIES).forEach((key) => {
        const catItems = CATEGORIES[key].items.map(item => ({ ...item, category: CATEGORIES[key].label }));
        pool = [...pool, ...catItems];
      });
    } else if (CATEGORIES[categoryKey]) {
      pool = CATEGORIES[categoryKey].items.map(item => ({ ...item, category: CATEGORIES[categoryKey].label }));
    }

    const shuffled = shuffleArray([...pool]);
    const subset = shuffled.slice(0, targetCount);
    setVocabList(subset);
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setMasteredCount(0);
    setParticles([]);
    setGameState('playing');
  };

  const handleFlipCard = () => {
    if (vocabList.length === 0 || gameState !== 'playing') return;
    
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    playSfx('flip');

    // If flipped to reveal the word, optionally pronounce with TTS
    if (nextFlipped) {
      const currentWord = vocabList[currentIndex]?.word;
      if (currentWord && autoPronounce) {
        speakWord(currentWord);
      }
    }
  };

  const handleMastered = () => {
    playSfx('master');
    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);
    setMasteredCount(m => m + 1);
    setScore(s => s + 100 + (newStreak > 1 ? (newStreak - 1) * 20 : 0));

    // Particle Burst
    const emojisPool = ['🌟', '🧠', '✨', '🪙', '📚', '🎯', '💡'];
    const colorsPool = ['#a855f7', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#06b6d4'];
    const newParticles = Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 15 * Math.PI) / 180 + (Math.random() * 0.2 - 0.1);
      const distance = Math.floor(Math.random() * 110) + 70;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 60;
      
      return {
        id: Math.random() + i,
        tx: `${tx}px`,
        ty: `${ty}px`,
        color: colorsPool[Math.floor(Math.random() * colorsPool.length)],
        emoji: emojisPool[Math.floor(Math.random() * emojisPool.length)],
        size: Math.floor(Math.random() * 14) + 16,
        delay: `${Math.random() * 0.1}s`,
        duration: `${Math.random() * 0.6 + 0.9}s`
      };
    });
    setParticles(newParticles);

    // Proceed to next card
    handleNextWord();
  };

  const handlePracticeAgain = () => {
    playSfx('again');
    setStreak(0);
    // Proceed to next card without bonus points
    handleNextWord();
  };

  const handleNextWord = () => {
    if (currentIndex + 1 < vocabList.length) {
      setIsFlipped(false);
      setTimeout(() => {
        setParticles([]);
        setCurrentIndex(prev => prev + 1);
      }, 260);
    } else {
      setGameState('finished');
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: { slug: game?.slug || 'vocab-flipper-3d', score: score + 100, difficulty: 'standard' }
      });
      toast({
        title: "Deck Decrypted! 🏆✨",
        description: "Great job mastering vocabulary terms! Experience and coins logged.",
      });
    }
  };

  // Keyboard navigation for active card flipping
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        return;
      }
      if (gameState !== 'playing' || !vocabList[currentIndex]) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlipCard();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (vocabList[currentIndex]) {
          speakWord(vocabList[currentIndex].word);
        }
      } else if (isFlipped) {
        if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePracticeAgain();
        } else if (e.key === '2' || e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          handleMastered();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isFlipped, currentIndex, vocabList, streak, bestStreak, speakWord]);

  if (!game) return null;

  const currentItem = vocabList[currentIndex];
  const activeCategoryLabel = selectedCategoryKey === "mix" 
    ? (currentItem?.category || "Mix Sector") 
    : CATEGORIES[selectedCategoryKey]?.label || "Vocabulary";

  return (
    <div className={cn(
      "w-full flex-1 min-h-[calc(100dvh-4.5rem)] flex flex-col justify-start items-center select-none relative",
      isFullscreen ? "h-screen max-h-screen overflow-hidden bg-slate-950 p-0" : "p-0"
    )}>
      <style>{`
        @keyframes flipper-float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.35; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-240px) rotate(360deg); opacity: 0; }
        }
        @keyframes flipper-particle-fly {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translate(0, 0) scale(1.4) rotate(45deg);
          }
          100% {
            transform: translate(var(--tx-end), var(--ty-end)) scale(0.3) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes flipper-glow-coin {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.5)); }
          50% { filter: drop-shadow(0 0 25px rgba(168, 85, 247, 0.95)); }
        }
        .flipper-animate-float {
          animation: flipper-float 14s ease-in-out infinite;
        }
        .flipper-glow-coin {
          animation: flipper-glow-coin 2s infinite ease-in-out;
        }
        .flipper-particle {
          position: absolute;
          animation: flipper-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 9999;
        }
        .cyber-grid-floor-flipper {
          background-size: 45px 45px;
          background-image: 
            linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px);
        }
      `}</style>

      {/* Ambient Cyber Grid & Glow Fields */}
      <div className="absolute inset-0 cyber-grid-floor-flipper pointer-events-none z-0 opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-purple-500/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-600/10 blur-[140px] pointer-events-none z-0" />

      {/* Floating Background Materials */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        {BACKGROUND_FLOATS.map((item, i) => (
          <div
            key={i}
            className="flipper-animate-float absolute bottom-[-50px] font-mono select-none"
            style={{
              left: item.left,
              fontSize: item.size,
              animationDuration: item.duration,
              animationDelay: item.delay,
              filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.5))'
            }}
          >
            {item.char}
          </div>
        ))}
      </div>

      <Card className={cn(
        "w-full flex-1 min-h-[calc(100dvh-4.5rem)] bg-slate-950/85 backdrop-blur-2xl border-purple-500/30 shadow-2xl relative transition-all duration-500 z-10 flex flex-col justify-between overflow-hidden",
        isFullscreen ? "h-screen w-screen rounded-none border-none" : "rounded-2xl md:rounded-3xl border-2"
      )}>
        {/* Futuristic Cyber Header - Mobile Responsive */}
        <CardHeader className="p-2.5 sm:p-5 relative border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-md shrink-0">
          {/* Top Row: Back to Games + System Tag + Action Controls inline without overlapping */}
          <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 px-2 text-purple-300 hover:text-white hover:bg-purple-500/15 rounded-lg border border-purple-500/25 text-xs font-bold shrink-0"
              >
                <Link href="/games" className="flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono uppercase font-black">Games</span>
                </Link>
              </Button>

              <div className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/70 border border-purple-400/30 text-purple-300 font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider truncate max-w-[220px] sm:max-w-none">
                <ShieldCheck className="w-3 h-3 text-purple-400 shrink-0 animate-pulse" />
                <span className="truncate">NEURAL 3D FLIPPER</span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 sm:px-2 text-purple-300/80 hover:text-purple-100 hover:bg-purple-500/10 rounded-lg border border-purple-500/20 text-xs"
                onClick={() => setAutoPronounce(!autoPronounce)}
                title={autoPronounce ? "Voice Pronounce: ON" : "Voice Pronounce: OFF"}
              >
                <Volume1 className={cn("h-3.5 w-3.5", autoPronounce ? "text-purple-400" : "text-slate-500")} />
                <span className="text-[9px] font-mono uppercase hidden sm:inline ml-1">{autoPronounce ? 'Voice' : 'No Voice'}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 sm:px-2 text-purple-300/80 hover:text-purple-100 hover:bg-purple-500/10 rounded-lg border border-purple-500/20 text-xs"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-500" /> : <Volume2 className="h-3.5 w-3.5 text-purple-400" />}
                <span className="text-[9px] font-mono uppercase hidden sm:inline ml-1">{isMuted ? 'Muted' : 'Sound'}</span>
              </Button>

              {onToggleFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 sm:px-2 text-purple-300/80 hover:text-purple-100 hover:bg-purple-500/10 rounded-lg border border-purple-500/20 text-xs"
                  onClick={onToggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                  <span className="text-[9px] font-mono uppercase hidden sm:inline ml-1">{isFullscreen ? 'Exit' : 'Full'}</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-2 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 rounded-xl sm:rounded-2xl border border-purple-400/30 shadow-lg shadow-purple-500/20">
                <Rotate3d className="w-4 h-4 sm:w-7 sm:h-7 text-purple-400 animate-pulse" />
              </div>
              <CardTitle className="text-lg sm:text-3xl md:text-4xl font-black tracking-tight italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                3D Vocab Flipper
              </CardTitle>
            </div>

            <CardDescription className={cn(
              "text-purple-200/70 font-medium text-[11px] sm:text-xs mt-1 max-w-xl",
              gameState === 'playing' ? "hidden sm:block" : "block"
            )}>
              Reveal holographic vocabulary cards, listen to authentic pronunciations, and forge long-term semantic memory.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-start relative p-3 sm:p-6 transition-all duration-300 flex-1 overflow-y-auto w-full">
          {/* Particle Burst Elements */}
          {particles.map((p) => (
            <span
              key={p.id}
              className="flipper-particle"
              style={{
                '--tx-end': p.tx,
                '--ty-end': p.ty,
                '--dur': p.duration,
                '--delay': p.delay,
                fontSize: `${p.size}px`,
                color: p.color,
                left: '50%',
                top: '50%',
              } as React.CSSProperties}
            >
              {p.emoji}
            </span>
          ))}

          {/* ===================== COMMAND DECK LOBBY (IDLE) ===================== */}
          {gameState === 'idle' && (
            <div className="w-full max-w-6xl flex flex-col gap-5 sm:gap-7 animate-in fade-in duration-500 py-1 sm:py-3">
              {/* Daily Bonus Banner if active */}
              {isDailyBonus && (
                <div className="w-full bg-gradient-to-r from-purple-500/15 via-indigo-500/20 to-pink-500/15 border-2 border-purple-400/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3.5 backdrop-blur-xl">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-gradient-to-tr from-purple-400 to-indigo-500 text-slate-950 rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center shrink-0">
                      <Coins className="h-7 w-7 fill-slate-950 animate-bounce" />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-400/20 border border-purple-400/40 text-[9px] font-black uppercase text-purple-300 tracking-wider">
                        ⭐ DAILY FLIGHT DIRECTIVE ACTIVE
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase">
                        Lexicon Vault Daily Drop
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-200/70 font-medium">
                        Master the holographic flashcard set today to harvest <span className="text-purple-300 font-black">+{dailyBonusAmount} Lingo-Coins</span> for your companion pet!
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500 text-slate-950 font-black px-4 py-2 text-xs uppercase tracking-widest shadow-lg shadow-purple-500/30 shrink-0">
                    +{dailyBonusAmount} COINS REWARD
                  </Badge>
                </div>
              )}

              {/* Telemetry Stat Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 w-full">
                <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400 shrink-0">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-purple-300/60 font-bold">Total Vocabulary</div>
                    <div className="text-base sm:text-lg font-black text-white font-mono">130+ Terms</div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400 shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-indigo-300/60 font-bold">Retention Engine</div>
                    <div className="text-base sm:text-lg font-black text-white font-mono">3D Spatial & TTS</div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-pink-500/20 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-pink-500/15 border border-pink-400/30 text-pink-400 shrink-0">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-pink-300/60 font-bold">Best Streak</div>
                    <div className="text-base sm:text-lg font-black text-white font-mono">{bestStreak}x Multiplier</div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-emerald-300/60 font-bold">Sector Status</div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">6 DECKS READY</div>
                  </div>
                </div>
              </div>

              {/* 3-Column Command Cards Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
                
                {/* CARD 1: SECTOR & CARD DEPLOYMENT */}
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-purple-500/30 hover:border-purple-400/60 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-all duration-300 group">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono text-[10px] uppercase tracking-wider">
                        Deck Selector
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                        Deploy Card Deck
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Choose a specialized vocabulary sector or mix all sectors together for a dynamic session.
                      </p>
                    </div>

                    {/* Sector Pills Grid */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-purple-400">
                        <span>Select Sector</span>
                        <span className="text-slate-400 font-bold">{selectedCategoryKey.toUpperCase()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playSfx('click');
                            setSelectedCategoryKey('mix');
                          }}
                          className={cn(
                            "py-2 px-2.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 truncate text-left",
                            selectedCategoryKey === 'mix'
                              ? "bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)] font-black"
                              : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          <span>✨</span>
                          <span className="truncate">All Mix Sector</span>
                        </button>
                        {Object.keys(CATEGORIES).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              playSfx('click');
                              setSelectedCategoryKey(key);
                            }}
                            className={cn(
                              "py-2 px-2.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 truncate text-left",
                              selectedCategoryKey === key
                                ? "bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)] font-black"
                                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                            )}
                          >
                            <span>{CATEGORIES[key].icon}</span>
                            <span className="truncate">{CATEGORIES[key].label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Quantity Selector */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-purple-400">
                        <span>Deck Size</span>
                        <span className="text-slate-400 font-bold">{roundsCount} TERMS</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[5, 8, 10, 15, 20].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              playSfx('click');
                              setRoundsCount(r);
                            }}
                            className={cn(
                              "py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer text-center",
                              roundsCount === r
                                ? "bg-purple-500/30 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-5 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => startNewGame(selectedCategoryKey)}
                      className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>START 3D FLIPPER ({roundsCount} CARDS)</span>
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        setGameState('instructions');
                      }}
                      className="w-full py-1.5 text-xs font-mono font-bold text-purple-400/70 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      View Decryption Protocol & Hotkeys →
                    </button>
                  </div>
                </div>

                {/* CARD 2: PRONUNCIATION & AUDIO INTELLIGENCE */}
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-indigo-500/30 hover:border-indigo-400/60 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-all duration-300 group">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono text-[10px] uppercase tracking-wider">
                        Phonics & Audio
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                        Audio Intelligence
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Native speech synthesis reads words aloud to build authentic phonetics and accent precision.
                      </p>
                    </div>

                    {/* Speech Settings Toggles */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-800">
                      <div 
                        onClick={() => setAutoPronounce(!autoPronounce)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Volume1 className="w-4 h-4 text-indigo-400" />
                          <div>
                            <div className="text-xs font-bold text-white">Auto Pronounce On Flip</div>
                            <div className="text-[10px] text-slate-400">Speak English words automatically</div>
                          </div>
                        </div>
                        <div className={cn(
                          "w-10 h-6 rounded-full transition-colors flex items-center p-1",
                          autoPronounce ? "bg-indigo-600 justify-end" : "bg-slate-800 justify-start"
                        )}>
                          <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </div>
                      </div>

                      <div 
                        onClick={() => setIsMuted(!isMuted)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Zap className="w-4 h-4 text-indigo-400" />
                          <div>
                            <div className="text-xs font-bold text-white">Synthesizer SFX</div>
                            <div className="text-[10px] text-slate-400">Tactile card swooshes & chimes</div>
                          </div>
                        </div>
                        <div className={cn(
                          "w-10 h-6 rounded-full transition-colors flex items-center p-1",
                          !isMuted ? "bg-indigo-600 justify-end" : "bg-slate-800 justify-start"
                        )}>
                          <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </div>
                      </div>
                    </div>

                    {/* Phonics quick test button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          playSfx('master');
                          speakWord("Spectacular Vocabulary");
                        }}
                        className="w-full py-2.5 px-4 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Test Voice Audio: "Spectacular Vocabulary"</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-indigo-300/80">
                    <span>Speech Synthesis v2</span>
                    <span className="font-bold text-emerald-400">● ACTIVE</span>
                  </div>
                </div>

                {/* CARD 3: INTERACTIVE 3D FLASHCARD PREVIEW */}
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-pink-500/30 hover:border-pink-400/60 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-all duration-300 group">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-pink-500/15 border border-pink-400/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                        <Rotate3d className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                      </div>
                      <Badge className="bg-pink-500/10 text-pink-300 border border-pink-500/30 font-mono text-[10px] uppercase tracking-wider">
                        Interactive 3D
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                        3D Card Mechanics
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Cards rotate on their Y-axis in 3D perspective space with holographic lighting.
                      </p>
                    </div>

                    {/* Interactive Mini-Card Model */}
                    <div 
                      onClick={() => {
                        playSfx('flip');
                        setPreviewFlipped(!previewFlipped);
                        if (!previewFlipped && autoPronounce) {
                          speakWord("Astronaut");
                        }
                      }}
                      className="w-full h-32 rounded-2xl bg-slate-950 border border-pink-500/30 overflow-hidden relative cursor-pointer select-none group/mini shadow-inner"
                      style={{ perspective: '900px' }}
                      title="Click to flip preview card"
                    >
                      <motion.div
                        className="w-full h-full relative"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={{ rotateY: previewFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                      >
                        {/* Front Preview */}
                        <div 
                          className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 p-4 flex flex-col items-center justify-center text-center border border-pink-500/30 rounded-2xl"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <span className="text-[9px] font-mono font-bold text-pink-400 uppercase tracking-widest mb-1">CLUE</span>
                          <span className="text-xs font-semibold text-slate-200 italic px-2">"A person who travels into outer space."</span>
                          <span className="text-[8px] font-mono text-slate-400 mt-2">TAP TO FLIP 🔄</span>
                        </div>

                        {/* Back Preview */}
                        <div 
                          className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-4 flex flex-col items-center justify-center text-center border-2 border-purple-400 rounded-2xl shadow-xl"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <span className="text-[9px] font-mono font-bold text-purple-300 uppercase tracking-widest mb-1">WORD REVEALED</span>
                          <span className="text-xl font-black text-white uppercase tracking-tight">ASTRONAUT</span>
                          <span className="text-[8px] font-mono text-emerald-400 mt-1">✓ SOUND & TTS READY</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Protocol Quick Rules */}
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">1</span>
                        <span>Read clue definition & attempt mental recall.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">2</span>
                        <span>Tap card or press <strong>[Space]</strong> to flip 3D card.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">3</span>
                        <span>Press <strong>[1] Review</strong> or <strong>[2] Mastered</strong>.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-pink-300/80">
                    <span>Card Physics</span>
                    <span className="font-bold">Holographic 3D</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== INSTRUCTIONS BRIEFING ===================== */}
          {gameState === 'instructions' && (
            <div className="w-full max-w-4xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-300 px-3 py-2">
              <div className="bg-slate-950/90 p-5 sm:p-8 rounded-3xl border-2 border-purple-500/30 shadow-2xl relative overflow-hidden text-left">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                        Lexicon Protocol Manual
                      </h3>
                      <p className="text-xs text-purple-300/60 font-mono">
                        3D SEMANTIC MEMORY & RETRIEVAL PRACTICE DIRECTIVE
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono text-[10px]">
                    PROTOCOL v2.5
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
                  <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase font-mono">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs">1</span>
                      <span>Read Clue Definition</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Study the target definition displayed on the front card. Formulate the English term in your mind prior to turning the card.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase font-mono">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
                      <span>Execute 3D Flip</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Tap the card or press the <strong>[Spacebar]</strong>. Watch the card smoothly pivot in 3D to reveal the vocabulary term.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase font-mono">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                      <span>Listen & Self-Assess</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Listen to authentic audio with the <strong>[S]</strong> key. Mark <strong>[2] Mastered</strong> if you knew it, or <strong>[1] Review</strong> to reinforce.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase font-mono">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs">4</span>
                      <span>Streak Bonuses</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Continuous consecutive masteries ignite your streak multiplier, yielding extra coins for your companion pet.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
                  <Button 
                    onClick={() => startNewGame(selectedCategoryKey)} 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-black tracking-widest py-5 sm:py-6 border border-purple-400/40 shadow-lg cursor-pointer text-sm sm:text-base rounded-2xl"
                  >
                    <Play className="w-5 h-5 fill-white mr-2" />
                    COMMENCE DECK RUN ({roundsCount} CARDS)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setGameState('idle')}
                    className="border-slate-800 text-slate-400 hover:text-white rounded-2xl py-5 sm:py-6 px-6 font-bold cursor-pointer"
                  >
                    ← Back to Command Deck
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== ACTIVE PLAYING STAGE ===================== */}
          {gameState === 'playing' && currentItem && (
            <div className={cn(
              "w-full flex flex-col items-center gap-3 sm:gap-5 relative transition-all duration-300",
              isFullscreen ? "max-w-5xl" : "max-w-3xl"
            )}>
              {/* Cockpit Telemetry Header - Single Row Mobile First */}
              <div className="w-full bg-slate-900/90 border border-purple-500/30 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 backdrop-blur-xl shadow-xl flex items-center justify-between gap-2">
                {/* Left: Card counter & Deck Sector */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                  <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/40 px-2 sm:px-3 py-1 rounded-lg text-purple-300 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <span>CARD {currentIndex + 1}/{vocabList.length}</span>
                  </div>
                  <Badge className="bg-slate-800/80 text-purple-300 border border-purple-500/20 uppercase font-mono text-[9px] sm:text-[10px] tracking-wider py-0.5 sm:py-1 px-1.5 sm:px-2.5 truncate max-w-[110px] sm:max-w-none">
                    {activeCategoryLabel}
                  </Badge>
                </div>

                {/* Center: Segmented Progress Bar (desktop/tablet) */}
                <div className="hidden sm:flex items-center gap-1 flex-1 max-w-xs mx-3">
                  {vocabList.map((_, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300 border",
                        idx < currentIndex 
                          ? "bg-purple-400 border-purple-300 shadow-[0_0_8px_#c084fc]" 
                          : idx === currentIndex
                          ? "bg-purple-500/40 border-purple-400 animate-pulse"
                          : "bg-slate-950/80 border-slate-800"
                      )}
                    />
                  ))}
                </div>

                {/* Right: Mastered Counter & Streak */}
                <div className="flex items-center gap-1.5 sm:gap-3 ml-auto shrink-0">
                  {streak >= 2 && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-orange-500/40 px-2 py-0.5 rounded-lg text-orange-400 font-mono text-[10px] sm:text-xs font-black uppercase animate-pulse">
                      <Flame className="w-3 h-3 fill-orange-500" />
                      <span>{streak}x</span>
                    </div>
                  )}
                  <div className="bg-slate-950/90 border border-purple-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-black font-mono text-white">
                    SCORE: <span className="text-purple-400 text-xs sm:text-sm">{score}</span>
                  </div>
                </div>
              </div>

              {/* 3D Flashcard Container */}
              <div 
                onClick={handleFlipCard}
                className={cn(
                  "w-full cursor-pointer select-none transition-all duration-300 relative group",
                  isFullscreen ? "aspect-[21/10] min-h-[280px] sm:min-h-[400px]" : "aspect-[16/11] sm:aspect-[16/10] min-h-[240px] sm:min-h-[340px]"
                )}
                style={{ perspective: '1400px' }}
                title="Click or tap to flip card"
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
                >
                  {/* FRONT: DEFINITION CLUE */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 border-2 border-purple-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col justify-between items-center text-center backdrop-blur-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Top Bar of Front Card */}
                    <div className="w-full flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider">
                        <BookOpen className="w-3 h-3 text-purple-400" />
                        <span>DEFINITION CLUE</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {currentIndex + 1} of {vocabList.length}
                      </span>
                    </div>

                    {/* Definition Text Clue */}
                    <div className="my-auto px-2 sm:px-6">
                      <p className={cn(
                        "font-extrabold text-white italic leading-snug drop-shadow-md select-text",
                        isFullscreen ? "text-2xl sm:text-4xl px-4" : "text-lg sm:text-2xl md:text-3xl"
                      )}>
                        "{currentItem.hint}"
                      </p>
                      <div className="mt-2 text-[11px] font-mono text-purple-300/60 font-bold uppercase tracking-widest">
                        Sector: {currentItem.category || activeCategoryLabel}
                      </div>
                    </div>

                    {/* Bottom Prompt */}
                    <div className="w-full flex items-center justify-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-purple-400/80 uppercase tracking-widest animate-pulse">
                      <span>TAP CARD OR PRESS [SPACE] TO REVEAL WORD</span>
                      <span>🔄</span>
                    </div>
                  </div>

                  {/* BACK: VOCABULARY WORD ANSWER */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-950/95 via-purple-950/95 to-slate-950/95 border-2 border-indigo-400/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col justify-between items-center text-center shadow-[0_0_60px_rgba(99,102,241,0.35)] overflow-hidden"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    {/* Top Bar of Back Card */}
                    <div className="w-full flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-400/50 text-indigo-300 font-mono text-[9px] sm:text-xs font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>VOCABULARY DECRYPTED</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(currentItem.word);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 text-indigo-200 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Pronounce again"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-300" />
                        <span>[S] SPEAK</span>
                      </button>
                    </div>

                    {/* Vocabulary Word Display */}
                    <div className="my-auto px-2">
                      <h2 className={cn(
                        "font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200 drop-shadow-[0_0_35px_rgba(168,85,247,0.7)] select-text",
                        isFullscreen ? "text-4xl sm:text-7xl" : "text-3xl sm:text-5xl md:text-6xl"
                      )}>
                        {currentItem.word}
                      </h2>
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 text-[10px] sm:text-xs font-mono text-indigo-300">
                        <span>Category: {currentItem.category || activeCategoryLabel}</span>
                      </div>
                    </div>

                    {/* Bottom Prompt */}
                    <div className="w-full flex items-center justify-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-indigo-300/80 uppercase tracking-widest">
                      <span>TAP CARD TO FLIP BACK • ASSESS RECALL BELOW</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action Deck & Assessment Controls */}
              <div className="w-full max-w-2xl flex flex-col items-center gap-2.5 sm:gap-3">
                {!isFlipped ? (
                  <button
                    onClick={handleFlipCard}
                    className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl sm:rounded-2xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-purple-400/40"
                  >
                    <span>FLIP TO REVEAL WORD 🔄</span>
                    <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded bg-black/30 border border-white/20">
                      SPACE
                    </span>
                  </button>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={handlePracticeAgain}
                      className="w-full sm:w-1/2 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-rose-500/30 hover:border-rose-400 text-rose-300 hover:text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <span>STILL LEARNING</span>
                      <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-400">
                        [1]
                      </span>
                    </button>

                    <button
                      onClick={handleMastered}
                      className="w-full sm:w-1/2 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 border border-emerald-400/40 animate-pulse"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-white text-emerald-600" />
                      <span>MASTERED! (+100 PTS)</span>
                      <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/20 text-white">
                        [2] / ENTER
                      </span>
                    </button>
                  </div>
                )}

                {/* Keyboard Shortcuts Hint Bar (desktop) */}
                <div className="hidden sm:flex items-center justify-center gap-2 text-[11px] font-mono text-purple-300/50 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Shortcuts: [Space] Flip Card • [1] Review • [2] / [Enter] Mastered • [S] Pronounce</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VICTORY FINISHED STATE ===================== */}
          {gameState === 'finished' && (
            <div className="flex flex-col items-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
              <div className="p-3 sm:p-4 bg-gradient-to-tr from-purple-500/20 via-indigo-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl border border-purple-400/40 shadow-2xl relative">
                <Trophy className="w-16 h-16 sm:w-28 sm:h-28 text-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] animate-bounce" />
              </div>

              <div className="text-center space-y-1.5 sm:space-y-2">
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-400/40 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest px-3 py-0.5 sm:py-1">
                  LEXICON COMPLETED • NEURAL RETENTION LOCKED
                </Badge>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-white">
                  Deck Cleared
                </h2>
                <p className="text-slate-400 font-medium text-xs sm:text-base">
                  Studied {vocabList.length} vocabulary terms from <span className="text-purple-300 font-bold uppercase">{activeCategoryLabel}</span>.
                </p>
              </div>

              {/* Score & Streak Stats Card */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full bg-slate-900/80 border border-purple-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-xl text-center">
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-400 font-bold">Total Score</div>
                  <div className="text-lg sm:text-2xl font-black text-purple-400 font-mono">{score}</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-400 font-bold">Mastered</div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">{masteredCount}/{vocabList.length}</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-400 font-bold">Best Streak</div>
                  <div className="text-lg sm:text-2xl font-black text-amber-400 font-mono">{bestStreak}x</div>
                </div>
              </div>

              {isDailyBonus && (
                <div className="relative w-full bg-gradient-to-r from-purple-500/10 via-indigo-500/20 to-purple-500/10 border-2 border-purple-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-2 sm:gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-1 z-10">
                  <div className="flipper-glow-coin bg-gradient-to-tr from-purple-400 to-indigo-500 text-slate-950 p-3 sm:p-4 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 relative">
                    <Coins className="h-7 w-7 sm:h-10 sm:w-10 fill-purple-950 text-purple-950 animate-spin" style={{ animationDuration: '5s' }} />
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-900 shadow">
                      CLAIMED
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-purple-400 tracking-wide uppercase">Daily Bonus Harvested!</h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-400 text-center max-w-xs leading-relaxed">
                    You cleared the Daily Vocab Deck and earned <span className="text-purple-400 font-black">+{dailyBonusAmount} Lingo-Coins</span> for your companion pet!
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center z-10 relative mt-1 sm:mt-2 w-full sm:w-auto">
                <Button 
                  onClick={() => startNewGame(selectedCategoryKey)} 
                  size="lg" 
                  className="rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-6 font-bold bg-purple-600 hover:bg-purple-500 text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/25 border border-purple-500/30 cursor-pointer text-xs sm:text-sm"
                >
                  <RotateCcw className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> RE-FLIP DECK
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setGameState('idle')} 
                  size="lg" 
                  className="rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-6 font-bold border-purple-500/30 text-purple-400 hover:bg-purple-500/10 cursor-pointer text-xs sm:text-sm"
                >
                  ← Back to Command Deck
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Tactical Cockpit Footer - Mobile First Single Row */}
        <CardFooter className="bg-slate-950/90 p-2.5 sm:p-4 flex items-center justify-between gap-2 border-t border-purple-500/20">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" asChild className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 font-bold cursor-pointer rounded-xl text-xs h-8 px-2.5">
              <Link href="/games">EXIT</Link>
            </Button>
            {gameState === 'playing' && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => startNewGame(selectedCategoryKey)} 
                className="font-bold border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 cursor-pointer rounded-xl text-xs h-8 px-2"
              >
                <RotateCcw className="mr-1 w-3 h-3" /> <span className="hidden sm:inline">RESTART DECK</span><span className="sm:hidden">RESTART</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {gameState === 'playing' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400/80 uppercase">
                <span className="text-[10px] sm:text-xs">{currentIndex + 1}/{vocabList.length}</span>
                <div className="w-16 sm:w-28 h-2 bg-purple-950/60 rounded-full overflow-hidden border border-purple-500/20">
                  <motion.div 
                    className="h-full bg-purple-400 shadow-[0_0_10px_#a855f7]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / vocabList.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
