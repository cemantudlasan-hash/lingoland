"use client";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Dna, Sparkles, Timer, Trophy, Repeat, Maximize, Minimize, Bug, Fish, Bird, PawPrint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { logAnalyticsEvent } from "@/lib/analytics";

type Environment = "Deep Sea" | "Coastal" | "Tropical Forest" | "Arid Desert" | "Tundra" | "High Mountain";
type Adaptation = "Gills" | "Fin" | "Lungs" | "Wings" | "Thick Fur" | "Camouflage" | "Nocturnal" | "Water Storage";

interface Stage {
  environment: Environment;
  description: string;
  correctAdaptation: Adaptation;
  options: Adaptation[];
  creatureType: "aquatic" | "amphibian" | "terrestrial" | "aerial";
}

const STAGES: Stage[] = [
  {
    environment: "Deep Sea",
    description: "The pressure is immense and light is non-existent. How will your organism survive?",
    correctAdaptation: "Gills",
    options: ["Lungs", "Gills", "Wings", "Thick Fur"],
    creatureType: "aquatic",
  },
  {
    environment: "Coastal",
    description: "Your organism is moving into shallower waters. Movement is key. What feature is needed?",
    correctAdaptation: "Fin",
    options: ["Fin", "Thick Fur", "Nocturnal", "Water Storage"],
    creatureType: "aquatic",
  },
  {
    environment: "Tropical Forest",
    description: "Trees are everywhere. To find food and escape predators, moving between trees is a must.",
    correctAdaptation: "Wings",
    options: ["Water Storage", "Gills", "Wings", "Nocturnal"],
    creatureType: "aerial",
  },
  {
    environment: "Arid Desert",
    description: "Water is scarce and the sun is brutal. Survival depends on resource management.",
    correctAdaptation: "Water Storage",
    options: ["Thick Fur", "Water Storage", "Gills", "Lungs"],
    creatureType: "terrestrial",
  },
  {
    environment: "Tundra",
    description: "The temperature has dropped far below freezing. Heat loss is your biggest threat.",
    correctAdaptation: "Thick Fur",
    options: ["Camouflage", "Fin", "Thick Fur", "Wings"],
    creatureType: "terrestrial",
  }
];

export function EvolutionExpedition({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "finished" | "instructions">("idle");
  const [currentStageIndex, setCurrentStageIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isWrong, setIsWrong] = React.useState(false);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  const currentStage = STAGES[currentStageIndex];

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleAdaptation = (adaptation: Adaptation) => {
    if (adaptation === currentStage.correctAdaptation) {
      setScore(prev => prev + 200);
      toast({
        title: "Successfully Adapted!",
        description: `Your organism developed ${adaptation} and survived.`,
        className: "bg-green-600 text-white",
      });
      
      if (currentStageIndex < STAGES.length - 1) {
        setCurrentStageIndex(prev => prev + 1);
      } else {
        setGameState("finished");
        if (firestore && game) {
          logAnalyticsEvent(firestore, user?.uid || 'guest', {
            type: 'game_played',
            details: { slug: game.slug, title: game.title, score: score + 200 }
          });
        }
      }
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
      toast({
        title: "Evolution Failed",
        description: `${adaptation} was not sufficient for this environment.`,
        variant: "destructive",
      });
      setScore(prev => Math.max(0, prev - 50));
    }
  };

  const CreatureIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "aquatic": return <Fish className="h-full w-full" />;
      case "aerial": return <Bird className="h-full w-full" />;
      case "terrestrial": return <PawPrint className="h-full w-full" />;
      default: return <Bug className="h-full w-full" />;
    }
  };

  if (!game) return null;

  return (
    <Card className={cn(
      "w-full transition-all duration-500 flex flex-col overflow-y-auto bg-emerald-950 border-none",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "max-w-4xl mx-auto h-[750px] shadow-2xl"
    )}>
      {/* Dynamic Evolution Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage?.environment || 'bg'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: currentStage?.environment === "Deep Sea" ? 'radial-gradient(circle, #064e3b 0%, #020617 100%)' :
                          currentStage?.environment === "Tropical Forest" ? 'radial-gradient(circle, #065f46 0%, #042f2e 100%)' :
                          currentStage?.environment === "Arid Desert" ? 'radial-gradient(circle, #78350f 0%, #451a03 100%)' :
                          currentStage?.environment === "Tundra" ? 'radial-gradient(circle, #1e3a8a 0%, #0f172a 100%)' :
                          '#064e3b'
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/evolution/1200/800')] opacity-10 mix-blend-overlay" />
      </div>

      <CardHeader className="z-10 bg-emerald-900/40 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
                <Dna className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
                <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter">Evolution Expedition</CardTitle>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Biological Adaptation Mission</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-[10px] font-bold text-white/30 uppercase">Genetic Points</p>
                <p className="text-3xl font-black text-white tabular-nums">{score}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white" onClick={onToggleFullscreen}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-8 z-10 relative overflow-y-auto">
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-12"
            >
              <div className="relative">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-emerald-500/30 blur-[120px] rounded-full"
                />
                <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] italic">
                    Evolve<br/><span className="text-emerald-400 not-italic">or Parish</span>
                </h2>
              </div>
              <p className="text-emerald-100/60 max-w-md mx-auto text-xl font-medium">
                The earth is changing. You must master DNA rewriting to survive the eras.
              </p>
              <Button 
                onClick={() => setGameState('instructions')} 
                className="h-24 px-16 text-3xl font-black bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-[32px] shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                BEGIN EPOCH
              </Button>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-emerald-900/20 backdrop-blur-2xl border border-white/10 p-12 rounded-[50px] max-w-2xl w-full shadow-2xl"
            >
              <h3 className="text-4xl font-black text-white uppercase mb-8 italic">Mission Strategy</h3>
              <div className="space-y-8 text-xl text-emerald-100/70 font-medium">
                <div className="flex gap-6 items-start">
                  <div className="h-10 w-10 bg-emerald-500 text-emerald-950 flex items-center justify-center rounded-2xl font-black shrink-0">I</div>
                  <p>Study the environment's hazards carefully. Every epoch has a unique survival requirement.</p>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="h-10 w-10 bg-emerald-500 text-emerald-950 flex items-center justify-center rounded-2xl font-black shrink-0">II</div>
                  <p>Select the biological adaptation that grants your organism the best chance of survival.</p>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="h-10 w-10 bg-emerald-500 text-emerald-950 flex items-center justify-center rounded-2xl font-black shrink-0">III</div>
                  <p>Complete all 5 major evolutionary leaps to reach the apex of life.</p>
                </div>
              </div>
              <Button onClick={() => setGameState('playing')} className="w-full mt-12 h-20 text-2xl font-black bg-white text-emerald-900 hover:bg-emerald-400 hover:text-emerald-950 transition-colors uppercase tracking-widest rounded-3xl">
                I am Ready to Survive
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && (
            <div className="w-full h-full flex flex-col items-center justify-between py-8">
               <div className="text-center space-y-4 max-w-2xl">
                  <motion.div
                    key={currentStage.environment}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 uppercase tracking-[0.3em] font-black px-4 py-1">
                        Environment: {currentStage.environment}
                    </Badge>
                    <p className="text-3xl font-bold text-white leading-tight px-4">
                        {currentStage.description}
                    </p>
                  </motion.div>
               </div>

               <div className="relative h-64 w-64 flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                        scale: isWrong ? [1, 1.2, 1] : [1, 1.05, 1],
                        rotate: isWrong ? [0, 5, -5, 0] : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "relative z-10 w-48 h-48 filter transition-all duration-700",
                        isWrong ? "text-red-400" : "text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]"
                    )}
                  >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStage.creatureType}
                            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 1.5, rotate: 20 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-full h-full"
                        >
                            <CreatureIcon type={currentStage.creatureType} />
                        </motion.div>
                    </AnimatePresence>
                  </motion.div>
                  
                  {/* DNA Spiral Rings */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-emerald-500/20 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border-2 border-dotted border-emerald-400/10 rounded-full"
                  />
               </div>

               <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
                  {currentStage.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Button
                            onClick={() => handleAdaptation(opt)}
                            className="w-full h-24 text-2xl font-black bg-emerald-900/40 hover:bg-emerald-500 text-white border-b-8 border-emerald-900 hover:border-emerald-600 rounded-[32px] transition-all hover:-translate-y-2 group overflow-hidden relative"
                        >
                            <span className="relative z-10 uppercase tracking-tighter italic">{opt}</span>
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-t from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100"
                            />
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="w-full max-w-4xl px-12 space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-emerald-400/50 uppercase tracking-[0.5em]">
                    <span>Evolutionary Progress</span>
                    <span>Epoch {currentStageIndex + 1}/5</span>
                  </div>
                  <div className="h-2 bg-emerald-900/50 rounded-full overflow-hidden border border-emerald-500/10">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStageIndex) / STAGES.length) * 100}%` }}
                        className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                    />
                  </div>
               </div>
            </div>
          )}

          {gameState === "finished" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="relative mb-8">
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-yellow-400/20 blur-[80px] rounded-full"
                />
                <Trophy className="h-40 w-40 text-yellow-400 mx-auto relative drop-shadow-2xl" />
              </div>
              <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter mb-2">Apex Lifeform</h2>
              <p className="text-emerald-400 text-xl font-bold uppercase tracking-widest mb-12">Evolutionary Journey Concluded</p>
              
              <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-[40px] p-10 mb-12 backdrop-blur-3xl shadow-2xl">
                <div className="space-y-1">
                    <p className="text-xs font-black text-emerald-100/30 uppercase tracking-widest mb-2">Genetic Superiority Index</p>
                    <p className="text-8xl font-black text-emerald-400 tabular-nums">{score}</p>
                </div>
              </div>

              <div className="flex gap-6">
                <Button onClick={() => { setScore(0); setCurrentStageIndex(0); setGameState('idle'); }} className="h-20 px-12 text-2xl font-black bg-emerald-500 text-emerald-950 hover:bg-emerald-400 rounded-3xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95">
                    <Repeat className="h-8 w-8" /> RE-EVOLVE
                </Button>
                <Button variant="outline" asChild className="h-20 px-12 text-2xl font-black border-white/20 text-white hover:bg-white/10 rounded-3xl transition-all hover:scale-105">
                    <Link href="/games">EXIT BIOME</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="z-10 bg-emerald-950/80 backdrop-blur-md border-t border-white/5 py-4 flex justify-between items-center">
        <div className="text-emerald-100/20 text-[10px] font-black uppercase tracking-[0.5em]">
            Evolution Expedition // Genome Link Alpha
        </div>
        <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-ping" />
                <span className="text-emerald-400/60 text-[10px] font-black uppercase">DNA: STABLE</span>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
