'use client';

import * as React from 'react';
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
import { Loader2, Sparkles, CheckCircle, XCircle, Repeat, Maximize, Minimize, Thermometer, Trophy, Droplets, Box, Wind, Zap, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SkillLevel } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type State = 'Solid' | 'Liquid' | 'Gas' | 'Plasma';
type GameState = 'idle' | 'instructions' | 'selecting_difficulty' | 'playing' | 'answered' | 'finished';

interface Substance {
  name: string;
  state: State;
  description: string;
  explanation: string;
  level: number;
}

const SUBSTANCES: Substance[] = [
  // LEVEL 1: BEGINNER (Rigid Solids, Simple Fluids, Pure Airs)
  { name: "Ice Cube", state: "Solid", description: "Water in a frozen state at 0°C.", explanation: "Solids have a definite shape and volume because particles are closely packed.", level: 1 },
  { name: "Juice", state: "Liquid", description: "A refreshing drink found in a glass.", explanation: "Liquids have a definite volume but take the shape of their container.", level: 1 },
  { name: "Oxygen", state: "Gas", description: "The air we breathe to survive.", explanation: "Gases have no definite shape or volume and expand to fill any space.", level: 1 },
  { name: "Iron Bar", state: "Solid", description: "A heavy metal rod used in construction.", explanation: "Metal at room temperature is a solid with strong intermolecular forces.", level: 1 },
  { name: "Milk", state: "Liquid", description: "A white fluid produced by mammals.", explanation: "Milk is a liquid that flows and can be poured.", level: 1 },
  { name: "Steam", state: "Gas", description: "Visible water vapor coming from a boiling kettle.", explanation: "Steam is water in its gaseous phase.", level: 1 },
  { name: "Wooden Table", state: "Solid", description: "A common piece of furniture made from trees.", explanation: "Wood is a solid material with a rigid structure.", level: 1 },
  { name: "Rainwater", state: "Liquid", description: "Water falling from clouds in the sky.", explanation: "Rain is liquid water that forms when water vapor condenses.", level: 1 },
  { name: "Helium", state: "Gas", description: "The invisible stuff inside a floating party balloon.", explanation: "Helium is a light gas that is less dense than air.", level: 1 },
  { name: "Granite Rock", state: "Solid", description: "A hard, natural stone found in mountains.", explanation: "Rocks are solids composed of minerals.", level: 1 },
  { name: "Brick", state: "Solid", description: "A red block of baked clay used to build walls.", explanation: "Bricks are sturdy, dense solids with fixed atomic shapes.", level: 1 },
  { name: "Ice Cream", state: "Solid", description: "A cold, solid dairy treat that melts if left in the sun.", explanation: "Although soft, ice cream starts as a structured solid holding its shape.", level: 1 },
  { name: "Chocolate Bar", state: "Solid", description: "A sweet solid candy that turns liquid when heated.", explanation: "Cocoa fats form a crystal solid lattice structure at room temperatures.", level: 1 },
  { name: "Gold Coin", state: "Solid", description: "A round piece of precious metal used as currency.", explanation: "Pure metals at room temperatures maintain a rigid crystalline solid state.", level: 1 },
  { name: "Carbon Dioxide", state: "Gas", description: "The invisible gas that humans breathe out.", explanation: "Carbon dioxide is a gaseous compound that disperses widely in rooms.", level: 1 },
  { name: "Water Vapor", state: "Gas", description: "Water in its invisible gaseous state in the atmosphere.", explanation: "Humidity is caused by gaseous water dispersed throughout air.", level: 1 },
  { name: "Nitrogen", state: "Gas", description: "The most abundant gas in Earth's atmosphere.", explanation: "Over 78% of Earth's atmosphere is composed of diatomic nitrogen gas.", level: 1 },
  { name: "Coffee", state: "Liquid", description: "A warm morning drink brewed from roasted beans.", explanation: "Coffee is an aqueous liquid solution that flows freely.", level: 1 },
  { name: "Cooking Oil", state: "Liquid", description: "A greasy liquid used to fry food in a pan.", explanation: "Lipid cooking oils are liquid fats with flexible molecular bonds.", level: 1 },
  { name: "Ocean Water", state: "Liquid", description: "Salty water that fills the world's seas.", explanation: "Marine water is a vast liquid body containing dissolved minerals.", level: 1 },
  { name: "Vinegar", state: "Liquid", description: "A sour liquid used in salad dressings.", explanation: "Vinegar is a liquid solution of acetic acid and water.", level: 1 },
  { name: "Plastic Ruler", state: "Solid", description: "A straight, rigid tool used to measure lines.", explanation: "Synthetic polymers form strong, durable solid matrices.", level: 1 },
  { name: "Copper Wire", state: "Solid", description: "A flexible orange metal wire that conducts electricity.", explanation: "Copper atoms form a metallic solid lattice allowing electron flow.", level: 1 },
  { name: "Soda", state: "Liquid", description: "A fizzy carbonated drink in a can.", explanation: "Soda is a liquid containing dissolved carbon dioxide gas bubbles.", level: 1 },

  // LEVEL 2: INTERMEDIATE (Viscous Fluids, High Heat, Basic Ionized Gases)
  { name: "Lava", state: "Liquid", description: "Molten rock expelled from a volcano.", explanation: "Lava is rock so hot that it has melted into a flowing liquid.", level: 2 },
  { name: "Dry Ice", state: "Solid", description: "Frozen carbon dioxide that turns straight into gas.", explanation: "Dry ice is solid CO2 that undergoes sublimation directly to gas.", level: 2 },
  { name: "Mercury", state: "Liquid", description: "The only metal that is liquid at room temperature.", explanation: "Mercury has unique electron bounds keeping it liquid at 25°C.", level: 2 },
  { name: "Neon Sign Glow", state: "Plasma", description: "The bright light inside a neon tube when electrified.", explanation: "Plasma is ionized gas, common in neon signs and fluorescent lights.", level: 2 },
  { name: "Honey", state: "Liquid", description: "A thick, sticky substance made by bees.", explanation: "Honey is a high-viscosity liquid that flows extremely slowly.", level: 2 },
  { name: "Propane", state: "Gas", description: "A fuel often used for portable stoves and grills.", explanation: "Propane is stored as liquid under pressure but exits as gas.", level: 2 },
  { name: "Molten Gold", state: "Liquid", description: "Gold heated to over 1,064°C until it flows.", explanation: "Even metals become liquid when they reach their melting point.", level: 2 },
  { name: "Compressed Air", state: "Gas", description: "Air kept at high pressure in a steel tank.", explanation: "Gases can be compressed into small, pressurized canisters.", level: 2 },
  { name: "Solder", state: "Solid", description: "A metal alloy melted to join electrical wires.", explanation: "Solder is a solid metal wire that melts easily under iron tips.", level: 2 },
  { name: "Butter", state: "Liquid", description: "A fat that is solid in the fridge but liquid on a hot pan.", explanation: "Butter is a lipid emulsion that melts into liquid at body temperature.", level: 2 },
  { name: "Maple Syrup", state: "Liquid", description: "A thick, sugary tree sap poured on pancakes.", explanation: "Maple syrup is a viscous sugar-water liquid solution.", level: 2 },
  { name: "Glycerin", state: "Liquid", description: "A sweet, clear, viscous liquid used in soaps.", explanation: "Glycerin is a thick trihydroxy alcohol in a liquid state.", level: 2 },
  { name: "Natural Gas", state: "Gas", description: "Methane gas piped into homes for heating and cooking.", explanation: "Methane is a clean-burning, colorless fossil gas.", level: 2 },
  { name: "Chlorine Gas", state: "Gas", description: "A toxic, pale green gas used to disinfect pools.", explanation: "Halogen chlorine is a dense gas at standard conditions.", level: 2 },
  { name: "Carbon Monoxide", state: "Gas", description: "An odorless, colorless, toxic gas produced by combustion.", explanation: "Carbon monoxide is an invisible gas that binds to blood hemoglobin.", level: 2 },
  { name: "Argon Gas", state: "Gas", description: "An inert gas used inside double-pane windows.", explanation: "Noble argon gas provides insulating barriers inside window glass.", level: 2 },
  { name: "Welding Spark", state: "Plasma", description: "Superheated gas generated during metal welding.", explanation: "Welding arcs generate superheated ionized gas columns (plasma).", level: 2 },
  { name: "Fluorescent Tube Glow", state: "Plasma", description: "Ionized gas inside office lighting bulbs.", explanation: "Mercury vapor is ionized into plasma to emit ultraviolet rays.", level: 2 },
  { name: "Solar Wind", state: "Plasma", description: "A stream of charged particles released from the Sun.", explanation: "The solar wind consists of high-energy protons and electrons in a plasma state.", level: 2 },
  { name: "Plasma TV Screen", state: "Plasma", description: "Charged gas cells that display images on older flat screens.", explanation: "Tiny gas chambers are electrically ionized into glowing plasma pixels.", level: 2 },
  { name: "Perfume Spray", state: "Gas", description: "A scented aerosol mist sprayed from a bottle.", explanation: "Perfume droplets quickly evaporate into gas molecules to scent rooms.", level: 2 },
  { name: "Gasoline", state: "Liquid", description: "A volatile petroleum fuel pumped into cars.", explanation: "Gasoline is a highly flammable organic liquid mixture.", level: 2 },

  // LEVEL 3: ADVANCED (Extreme Pressures, Stellar Plasmas, Exotic Physics)
  { name: "Lightning Bolt", state: "Plasma", description: "A massive discharge of electricity in the atmosphere.", explanation: "Lightning is a naturally occurring plasma channel on Earth.", level: 3 },
  { name: "The Sun's Core", state: "Plasma", description: "The center of our star where fusion occurs.", explanation: "Stars are primarily composed of plasma due to extreme gravity and heat.", level: 3 },
  { name: "Aurora Borealis", state: "Plasma", description: "The 'Northern Lights' seen in the polar skies.", explanation: "Auroras are caused by space particles ionizing the upper atmosphere into plasma.", level: 3 },
  { name: "Molten Glass", state: "Liquid", description: "Glass heated to over 1000°C so it can be shaped.", explanation: "Glass becomes an amorphous liquid when heated sufficiently.", level: 3 },
  { name: "Diamond", state: "Solid", description: "One of the hardest known natural materials.", explanation: "Diamonds are solid carbon arranged in a highly rigid crystal lattice.", level: 3 },
  { name: "Welding Arc", state: "Plasma", description: "The super-hot spark used to join pieces of metal.", explanation: "The intense heat of an electric arc ionizes surrounding air into plasma.", level: 3 },
  { name: "Stellar Nebula", state: "Plasma", description: "A giant cloud of ionized dust and gas in deep space.", explanation: "Astronomical nebulae are made of hot, glowing interstellar plasma.", level: 3 },
  { name: "Comet Tail", state: "Plasma", description: "Charged particles blown off a comet by solar radiation.", explanation: "Solar winds ionize comet gases, creating a brilliant glowing plasma tail.", level: 3 },
  { name: "Thermonuclear Fire", state: "Plasma", description: "The extreme plasma state achieved during a fusion blast.", explanation: "Nuclear explosions generate temperatures that ionize all matter into plasma.", level: 3 },
  { name: "Liquid Nitrogen", state: "Liquid", description: "Nitrogen cooled to -196°C until it turns fluid.", explanation: "Cryogenic liquid nitrogen is a freezing liquid that boils at room temperature.", level: 3 },
  { name: "Molten Quartz", state: "Liquid", description: "Quartz sand heated to over 1,700°C.", explanation: "High heat breaks silica crystalline bonds into liquid quartz glass.", level: 3 },
  { name: "Solid Methane", state: "Solid", description: "Methane frozen solid on the surface of Pluto.", explanation: "Pluto's extreme -220°C temperatures freeze volatile methane into ice solids.", level: 3 },
  { name: "Metallic Hydrogen", state: "Solid", description: "Hydrogen squeezed under immense pressure in Jupiter's core.", explanation: "High planetary gravity squeezes gaseous hydrogen into a solid metal lattice.", level: 3 },
  { name: "Aerogel", state: "Solid", description: "An ultra-light, synthetic solid made of silica and air.", explanation: "Often called 'frozen smoke', aerogel is a rigid solid with 99.8% air voids.", level: 3 },
  { name: "Superheated Steam", state: "Gas", description: "Steam heated past its boiling point, completely dry and invisible.", explanation: "Dry steam contains no liquid moisture, existing purely as gas.", level: 3 },
  { name: "Xenon Flash", state: "Plasma", description: "Ionized xenon gas in high-intensity camera flashes.", explanation: "Electricity creates a sudden plasma discharge within xenon chambers.", level: 3 },
  { name: "Interstellar Medium", state: "Plasma", description: "Sparse ionized gas that fills the space between star systems.", explanation: "Interstellar voids are filled with extremely low-density hot plasma.", level: 3 },
  { name: "Tokamak Fusion Plasma", state: "Plasma", description: "Hydrogen gas confined magnetically and heated to 100 million °C.", explanation: "Tokamaks heat and hold hydrogen isotope plasmas for fusion research.", level: 3 },
  { name: "Halogen Light Arc", state: "Plasma", description: "The intense light arc inside a halogen projector lamp.", explanation: "Electric currents ionize gas particles into high-temperature plasma light.", level: 3 },
  { name: "Graphene Sheet", state: "Solid", description: "A single layer of carbon atoms arranged in a honeycomb lattice.", explanation: "Graphene is a super-strong two-dimensional carbon solid.", level: 3 }
];

const STATE_ICONS = {
  Solid: Box,
  Liquid: Droplets,
  Gas: Wind,
  Plasma: Zap
};

const backgroundFloats = [
  { emoji: '🧊', left: '8%', size: '22px', duration: '14s', delay: '0s' },
  { emoji: '💧', left: '18%', size: '30px', duration: '18s', delay: '2s' },
  { emoji: '💨', left: '82%', size: '26px', duration: '15s', delay: '1s' },
  { emoji: '⚡', left: '90%', size: '34px', duration: '19s', delay: '4s' },
  { emoji: '⚛️', left: '26%', size: '24px', duration: '13s', delay: '5s' },
  { emoji: '🧪', left: '72%', size: '28px', duration: '16s', delay: '3s' }
];

export function StatesOfMatter({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [difficulty, setDifficulty] = React.useState<SkillLevel>('beginner');
  const [round, setRound] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [currentSubstance, setCurrentSubstance] = React.useState<Substance | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [usedSubstances, setUsedSubstances] = React.useState<string[]>([]);
  const [particles, setParticles] = React.useState<any[]>([]);
  const [triggerShake, setTriggerShake] = React.useState(false);

  const { toast } = useToast();
  const game = getGameBySlug(slug);
  const { user } = useAuth();
  const firestore = useFirestore();

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const generateRound = (level: SkillLevel, history: string[]) => {
    const levelThreshold = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;
    
    // Exact match filter for beginner/intermediate to avoid bleed-through
    let pool = SUBSTANCES.filter(s => {
      if (level === 'beginner') return s.level === 1;
      if (level === 'intermediate') return s.level === 2;
      return s.level === 3;
    });

    // Fallback if history consumes pool
    const unvisited = pool.filter(s => !history.includes(s.name));
    const finalPool = unvisited.length > 0 ? unvisited : pool;
    
    const target = finalPool[Math.floor(Math.random() * finalPool.length)];
    setCurrentSubstance(target);
    setIsCorrect(null);
    setParticles([]);
    setUsedSubstances([...history, target.name]);
    setGameState('playing');
  };

  const handleStartGame = (level: SkillLevel) => {
    setDifficulty(level);
    setScore(0);
    setRound(1);
    setUsedSubstances([]);
    generateRound(level, []);
  };

  const handleAnswer = (choice: State) => {
    if (gameState !== 'playing' || !currentSubstance) return;
    const correct = choice === currentSubstance.state;
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 10);

      // Particle Shower Generation
      const emojisPool = ['⚛️', '🧪', '🔥', '💧', '💨', '⚡', '⭐', '🪙'];
      const colorsPool = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];
      const newParticles = Array.from({ length: 30 }).map((_, i) => {
        const angle = (i * 12 * Math.PI) / 180 + (Math.random() * 0.2 - 0.1);
        const distance = Math.floor(Math.random() * 120) + 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 40;
        
        return {
          id: Math.random() + i,
          tx: `${tx}px`,
          ty: `${ty}px`,
          color: colorsPool[Math.floor(Math.random() * colorsPool.length)],
          emoji: emojisPool[Math.floor(Math.random() * emojisPool.length)],
          size: Math.floor(Math.random() * 16) + 16,
          delay: `${Math.random() * 0.15}s`,
          duration: `${Math.random() * 0.8 + 1.2}s`
        };
      });
      setParticles(newParticles);
    } else {
      setTriggerShake(true);
      setTimeout(() => setTriggerShake(false), 500);
    }
    setGameState('answered');

    setTimeout(() => {
      if (round < 10) {
        setRound((r) => r + 1);
        generateRound(difficulty, usedSubstances);
      } else {
        setGameState('finished');
        logAnalyticsEvent(firestore, user?.uid || 'guest', {
          type: 'game_played',
          details: { 
            slug: game?.slug || 'states-of-matter', 
            score: score + (correct ? 10 : 0), 
            difficulty 
          }
        });
        toast({
          title: 'Research Session Completed! 🏆🔬',
          description: 'You completed States of Matter. Earned Lingo-Coins and pet stats.',
        });
      }
    }, 2500);
  };

  if (!game) return null;

  return (
    <div className={cn(
      "w-full relative min-h-[40rem] flex flex-col justify-center items-center",
      isFullscreen ? "min-h-screen bg-slate-950 p-4 sm:p-8" : "py-4"
    )}>
      <style>{`
        @keyframes matter-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes matter-pop {
          0% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes matter-float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
        }
        @keyframes matter-particle-fly {
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
        @keyframes matter-glow-coin {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)); }
        }
        .matter-animate-shake {
          animation: matter-shake 0.5s ease-in-out;
        }
        .matter-animate-pop {
          animation: matter-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .matter-animate-float {
          animation: matter-float 14s ease-in-out infinite;
        }
        .matter-glow-coin {
          animation: matter-glow-coin 2s infinite ease-in-out;
        }
        .matter-particle {
          position: absolute;
          animation: matter-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 50;
        }
      `}</style>

      {/* Floating Background Chemistry Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        {backgroundFloats.map((item, i) => (
          <div
            key={i}
            className="matter-animate-float absolute bottom-[-40px]"
            style={{
              left: item.left,
              fontSize: item.size,
              animationDuration: item.duration,
              animationDelay: item.delay,
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      <Card className={cn(
          "w-full transition-all duration-500 flex flex-col overflow-hidden z-10 relative",
          isFullscreen 
              ? "min-h-[90vh] rounded-2xl border-border/20 max-w-5xl bg-card/95 justify-center shadow-2xl" 
              : "max-w-4xl mx-auto bg-card/85 backdrop-blur-sm border-border/25 shadow-xl",
          triggerShake && "matter-animate-shake"
        )}>
        <CardHeader className="text-center relative border-b border-white/5">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
          {!isFullscreen && (
              <div className="flex justify-center mb-2">
                  <Thermometer className="w-12 h-12 text-primary animate-pulse" />
              </div>
          )}
          <CardTitle className={cn("font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500", isFullscreen ? "text-5xl" : "text-3xl")}>{game.title}</CardTitle>
          <CardDescription className={cn(isFullscreen && "text-xl mt-2")}>{game.description}</CardDescription>
          {gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty' && (
              <div className="flex justify-center gap-2 pt-2">
                  <Badge variant="outline" className={cn("font-bold uppercase", isFullscreen && "text-lg px-6 py-1")}>{difficulty}</Badge>
                  <Badge variant="secondary" className={cn("font-bold", isFullscreen && "text-lg px-6 py-1")}>Round {round}/10</Badge>
              </div>
          )}
        </CardHeader>

        <CardContent className={cn(
            "space-y-6 text-center flex flex-col items-center justify-center relative",
            isFullscreen ? "min-h-[55vh] max-w-4xl mx-auto w-full px-12" : "min-h-[28rem] p-6"
        )}>
          {gameState === "idle" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
              {isDailyBonus && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-amber-500/20 animate-pulse mb-2">
                  <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                  ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
                </Badge>
              )}
              <p className={cn("text-muted-foreground font-semibold", isFullscreen ? "text-2xl" : "text-base")}>Analyze and identify substances across Solids, Liquids, Gases, and Plasmas.</p>
              <Button onClick={() => setGameState('instructions')} size={isFullscreen ? "lg" : "default"} className={cn("bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-black shadow-lg hover:scale-105 active:scale-95 transition-all", isFullscreen && "h-14 rounded-xl text-xl px-12")}>
                <Sparkles className={cn("mr-3", isFullscreen ? "h-6 w-6" : "h-4 w-4")} />
                Initialize Laboratory
              </Button>
            </div>
          )}

          {gameState === "instructions" && (
               <div className={cn(
                   "flex flex-col items-center justify-center gap-6 text-center bg-muted/60 backdrop-blur-sm rounded-2xl border border-border/20 shadow-xl mx-auto animate-in fade-in duration-300",
                   isFullscreen ? "p-12 max-w-2xl scale-105" : "p-8 max-w-xl"
               )}>
                  <h3 className={cn("font-black uppercase tracking-wider text-center text-primary", isFullscreen ? "text-3xl" : "text-xl")}>MISSION BRIEFING</h3>
                  <div className={cn("text-left space-y-3 font-medium text-muted-foreground", isFullscreen ? "text-lg" : "text-sm")}>
                      <p className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">1</span>
                        <span>You will be presented with a scientific substance or physical phenomenon.</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">2</span>
                        <span>Analyze its chemical properties and determine its current state of matter.</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">3</span>
                        <span>Choose between Solid, Liquid, Gas, or Plasma options.</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-black shrink-0">4</span>
                        <span>Complete all 10 analysis rounds to record your laboratory points.</span>
                      </p>
                  </div>
                  <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold", isFullscreen && "h-14 rounded-xl text-xl")}>Enter Lab</Button>
              </div>
          )}

          {gameState === "selecting_difficulty" && (
               <div className="flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in duration-300">
                  <p className={cn("text-muted-foreground font-black uppercase tracking-widest text-xs", isFullscreen ? "text-xl" : "text-xs")}>Choose Analysis Tier</p>
                  <div className="grid grid-cols-1 gap-3 w-full">
                      {["beginner", "intermediate", "advanced"].map(level => (
                          <Button key={level} onClick={() => handleStartGame(level as SkillLevel)} size="lg" variant="outline" className={cn("h-16 text-xl font-bold uppercase tracking-widest border-2 hover:border-primary hover:bg-primary/5 transition-all", isFullscreen && "h-20 rounded-xl text-2xl")}>{level}</Button>
                      ))}
                  </div>
              </div>
          )}

          {(gameState === "playing" || gameState === "answered") && currentSubstance && (
              <div className="w-full flex flex-col items-center gap-8 max-w-4xl relative">
                  {/* Confetti Particles Container */}
                  {particles.map((p) => (
                    <span
                      key={p.id}
                      className="matter-particle"
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

                  <div className={cn(
                      "w-full bg-muted/40 backdrop-blur-sm p-8 rounded-3xl border-2 border-primary/20 text-center shadow-lg flex flex-col items-center select-none relative",
                      isCorrect === true ? "border-green-500 bg-green-500/10 matter-animate-pop" : "",
                      isCorrect === false ? "border-red-500 bg-red-500/10" : "",
                      isFullscreen ? "p-12 px-16" : "p-6"
                  )}>
                      <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-2 block">IDENTIFY THE STATE:</span>
                      <h2 className={cn("font-black uppercase italic leading-none mb-3 text-foreground tracking-tight", isFullscreen ? "text-5xl" : "text-3xl")}>{currentSubstance.name}</h2>
                      <p className={cn("font-semibold text-muted-foreground", isFullscreen ? "text-xl" : "text-base")}>{currentSubstance.description}</p>
                  </div>

                  <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4 w-full z-10 relative")}>
                      {(["Solid", "Liquid", "Gas", "Plasma"] as State[]).map(state => {
                          const IconComponent = STATE_ICONS[state];
                          return (
                              <Button
                                  key={state}
                                  variant={gameState === 'answered' ? (state === currentSubstance.state ? 'secondary' : 'outline') : 'outline'}
                                  onClick={() => handleAnswer(state)}
                                  className={cn(
                                      "h-auto flex flex-col gap-3 py-6 rounded-2xl border-2 transition-all shadow-md font-bold uppercase tracking-wider",
                                      isFullscreen ? "py-8 text-xl" : "text-sm",
                                      gameState === 'answered' && state === currentSubstance.state && "bg-green-500 text-white border-green-400 scale-105",
                                      gameState === 'playing' && "hover:scale-105 hover:border-primary active:scale-95"
                                  )}
                                  disabled={gameState === 'answered'}
                              >
                                  <IconComponent className={cn(isFullscreen ? "h-8 w-8" : "h-6 w-6")} />
                                  {state}
                              </Button>
                          )
                      })}
                  </div>

                  {gameState === 'answered' && (
                      <Alert className={cn(
                          "w-full border-2 transition-all duration-300 shadow-lg text-left",
                          isCorrect ? "bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400" : "bg-destructive/10 border-destructive/40 text-destructive",
                          isFullscreen && "p-6 rounded-2xl"
                      )}>
                          {isCorrect ? <CheckCircle className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                          <AlertTitle className="font-black uppercase tracking-wider">{isCorrect ? "SYNCHRONIZATION COMPLETE" : "DATA CORRUPTION DETECTED"}</AlertTitle>
                          <AlertDescription className="mt-1">
                              <p className={cn("font-semibold text-foreground")}>{currentSubstance.explanation}</p>
                          </AlertDescription>
                      </Alert>
                  )}
              </div>
          )}

          {gameState === "finished" && (
              <div className="text-center flex flex-col items-center gap-6 w-full max-w-xl mx-auto px-4 py-6 animate-in fade-in duration-500">
                  <Trophy className={cn("text-amber-400 animate-bounce", isFullscreen ? "h-36 w-36" : "h-20 w-20")} />
                  <div className="space-y-1">
                      <h2 className={cn("font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 animate-pulse", isFullscreen ? "text-5xl" : "text-4xl")}>RESEARCH COMPLETE</h2>
                      <p className={cn("font-black text-primary uppercase", isFullscreen ? "text-2xl" : "text-xl")}>Final Score: {score}/100</p>
                  </div>

                  {/* Daily Bonus Claimed Banner */}
                  {isDailyBonus && (
                    <div className="relative w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 overflow-hidden animate-in zoom-in-95 duration-500 my-2 z-10">
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-2 left-6 text-sm animate-bounce" style={{ animationDelay: '100ms' }}>🪙</div>
                        <div className="absolute bottom-4 right-12 text-sm animate-bounce" style={{ animationDelay: '300ms' }}>⭐</div>
                        <div className="absolute top-6 right-8 text-sm animate-bounce" style={{ animationDelay: '500ms' }}>🪙</div>
                        <div className="absolute bottom-2 left-10 text-sm animate-bounce" style={{ animationDelay: '700ms' }}>⭐</div>
                      </div>
                      <div className="matter-glow-coin bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
                        <Coins className="h-10 w-10 fill-amber-950 text-amber-950 animate-spin" style={{ animationDuration: '5s' }} />
                        <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-background shadow">
                          CLAIMED
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-amber-400 tracking-wide uppercase">Daily Bonus Coins Claimed!</h3>
                      <p className="text-sm font-semibold text-muted-foreground text-center max-w-xs leading-relaxed">
                        You completed the Daily Game and earned <span className="text-yellow-400 font-black">+{dailyBonusAmount} Lingo-Coins</span> for your pet!
                      </p>
                    </div>
                  )}

                  <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className={cn("bg-gradient-to-r from-teal-500 to-indigo-600 font-bold z-10 shadow-lg hover:scale-105 active:scale-95 transition-all", isFullscreen && "h-14 px-10 text-lg rounded-xl")}>
                      <Repeat className={cn("mr-3", isFullscreen ? "h-5 w-5" : "h-4 w-4")} /> Re-Initialize Session
                  </Button>
              </div>
          )}
        </CardContent>

        <CardFooter className={cn("flex justify-between border-t border-white/5 p-6 z-10 relative", isFullscreen && "pb-10 max-w-5xl mx-auto w-full")}>
          <Button variant="outline" asChild size={isFullscreen ? "lg" : "default"} className={cn(isFullscreen && "h-12 px-8 text-lg font-bold rounded-xl")}>
            <Link href="/games">Abort Mission</Link>
          </Button>
          {(gameState !== 'idle' && gameState !== 'instructions' && gameState !== 'selecting_difficulty') && <p className="font-black text-primary uppercase tracking-wider">Research Points: {score}</p>}
        </CardFooter>
      </Card>
    </div>
  );
}
