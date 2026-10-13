"use client";

import { shuffleArray } from "@/lib/shuffle";

import * as React from "react";
import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Dna, Sparkles, Timer, Trophy, Repeat, Maximize, Minimize, Bug, Fish, Bird, PawPrint, BookOpen } from "lucide-react";
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

const ALL_STAGES: Stage[] = [
  { environment: "Deep Sea", description: "The pressure is immense and light is non-existent. How will your organism survive?", correctAdaptation: "Gills", options: ["Lungs", "Gills", "Wings", "Thick Fur"], creatureType: "aquatic" },
  { environment: "Coastal", description: "Your organism is moving into shallower waters. Movement is key. What feature is needed?", correctAdaptation: "Fin", options: ["Fin", "Thick Fur", "Nocturnal", "Water Storage"], creatureType: "aquatic" },
  { environment: "Tropical Forest", description: "Trees are everywhere. To find food and escape predators, moving between trees is a must.", correctAdaptation: "Wings", options: ["Water Storage", "Gills", "Wings", "Nocturnal"], creatureType: "aerial" },
  { environment: "Arid Desert", description: "Water is scarce and the sun is brutal. Survival depends on resource management.", correctAdaptation: "Water Storage", options: ["Thick Fur", "Water Storage", "Gills", "Lungs"], creatureType: "terrestrial" },
  { environment: "Tundra", description: "The temperature has dropped far below freezing. Heat loss is your biggest threat.", correctAdaptation: "Thick Fur", options: ["Camouflage", "Fin", "Thick Fur", "Wings"], creatureType: "terrestrial" },
  { environment: "High Mountain", description: "Oxygen is thin and predators circle above. You need to blend in with the rocky snowy peaks.", correctAdaptation: "Camouflage", options: ["Gills", "Water Storage", "Camouflage", "Fin"], creatureType: "terrestrial" },
  { environment: "Tropical Forest", description: "The forest floor is incredibly dangerous during the day. How do you forage safely?", correctAdaptation: "Nocturnal", options: ["Nocturnal", "Gills", "Fin", "Thick Fur"], creatureType: "terrestrial" },
  { environment: "Deep Sea", description: "Bioluminescent predators are hunting you. You need to hide in the pitch black water.", correctAdaptation: "Camouflage", options: ["Camouflage", "Lungs", "Wings", "Thick Fur"], creatureType: "aquatic" },
  { environment: "Arid Desert", description: "The scorching sun makes daytime travel impossible. When will you hunt?", correctAdaptation: "Nocturnal", options: ["Water Storage", "Nocturnal", "Gills", "Fin"], creatureType: "terrestrial" },
  { environment: "Coastal", description: "You are venturing onto the tidal rocks. You need to breathe air for short periods.", correctAdaptation: "Lungs", options: ["Gills", "Fin", "Lungs", "Wings"], creatureType: "amphibian" },
  { environment: "Tundra", description: "The snowy landscape makes you an easy target for wolves. How do you hide?", correctAdaptation: "Camouflage", options: ["Water Storage", "Camouflage", "Fin", "Gills"], creatureType: "terrestrial" },
  { environment: "High Mountain", description: "You need to migrate across deep chasms efficiently.", correctAdaptation: "Wings", options: ["Thick Fur", "Fin", "Water Storage", "Wings"], creatureType: "aerial" },
  { environment: "Deep Sea", description: "You need to swim faster to catch nimble prey in the dark depths.", correctAdaptation: "Fin", options: ["Fin", "Thick Fur", "Wings", "Lungs"], creatureType: "aquatic" },
  { environment: "Tropical Forest", description: "Heavy rains cause constant flooding. You must survive both on land and in giant puddles.", correctAdaptation: "Lungs", options: ["Gills", "Lungs", "Thick Fur", "Nocturnal"], creatureType: "amphibian" },
  { environment: "Arid Desert", description: "Predators can spot you from miles away on the flat dunes. Avoid detection.", correctAdaptation: "Camouflage", options: ["Water Storage", "Camouflage", "Gills", "Lungs"], creatureType: "terrestrial" }
];

export function EvolutionExpedition({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<"idle" | "playing" | "finished" | "instructions">("idle");
  const [currentStageIndex, setCurrentStageIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isWrong, setIsWrong] = React.useState(false);

  const [sessionStages, setSessionStages] = React.useState<Stage[]>(ALL_STAGES.slice(0, 5));
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  React.useEffect(() => {
    if (gameState === "idle") {
      const shuffled = shuffleArray([...ALL_STAGES]).slice(0, 5);
      setSessionStages(shuffled);
    }
  }, [gameState]);

  const currentStage = sessionStages[currentStageIndex];
  
  // Prevent crash if currentStage is completely missing somehow
  if (!currentStage && gameState === "playing") return null;

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
      
      if (currentStageIndex < sessionStages.length - 1) {
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
      "w-full transition-all duration-500 flex flex-col overflow-y-auto overflow-x-hidden max-w-full bg-emerald-950 border-none",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "w-full flex-1 min-h-[calc(100dvh-4.5rem)] rounded-2xl md:rounded-3xl shadow-2xl justify-between"
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

      <CardHeader className="z-10 bg-emerald-900/40 backdrop-blur-md border-b border-white/5 p-3 sm:p-6 w-full max-w-full">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="icon" asChild className="text-white/50 hover:text-white mr-1 sm:mr-2 shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                <Link href="/games">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
            </Button>
            <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-xl shrink-0">
                <Dna className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-400" />
            </div>
            <div className="min-w-0">
                <CardTitle className="text-sm sm:text-2xl font-black text-white uppercase tracking-tight sm:tracking-tighter truncate">Evolution Expedition</CardTitle>
                <p className="text-[9px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider sm:tracking-widest">Biological Adaptation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <div className="text-right">
                <p className="text-[7px] sm:text-[10px] font-bold text-white/30 uppercase">Genetic Points</p>
                <p className="text-sm sm:text-3xl font-black text-white tabular-nums leading-none">{score}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white h-8 w-8 sm:h-10 sm:w-10" onClick={onToggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(
        "flex-grow flex flex-col items-center justify-center p-4 sm:p-8 z-10 relative overflow-y-auto overflow-x-hidden max-w-full",
        isFullscreen ? "p-4 sm:p-8" : "w-full flex-1 min-h-[calc(100dvh-16rem)]"
      )}>
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-6 sm:space-y-12"
            >
              <div className="relative">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-emerald-500/30 blur-[120px] rounded-full"
                />
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight sm:leading-[0.85] italic">
                    Evolve<br/><span className="text-emerald-400 not-italic">or Perish</span>
                </h2>
              </div>
              <p className="text-emerald-100/60 max-w-md mx-auto text-sm sm:text-xl font-medium">
                The earth is changing. You must master DNA rewriting to survive the eras.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
                <Button 
                  onClick={() => setGameState('instructions')} 
                  variant="outline"
                  className="w-full sm:w-auto h-12 sm:h-20 px-6 sm:px-8 text-sm sm:text-xl font-black border-2 border-emerald-400/50 text-emerald-300 hover:bg-emerald-900/60 rounded-2xl sm:rounded-3xl transition-all"
                >
                  <BookOpen className="mr-2 h-4 w-4 sm:h-6 sm:w-6" /> HOW TO PLAY
                </Button>
                <Button 
                  onClick={() => setGameState('playing')} 
                  className="w-full sm:w-auto h-12 sm:h-20 px-8 sm:px-12 text-base sm:text-2xl font-black bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  BEGIN EPOCH
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-emerald-900/20 backdrop-blur-2xl border border-white/10 p-6 sm:p-12 rounded-3xl sm:rounded-[50px] max-w-2xl w-full shadow-2xl"
            >
              <h3 className="text-2xl sm:text-4xl font-black text-white uppercase mb-4 sm:mb-8 italic">How to Play</h3>
              <div className="space-y-4 sm:space-y-8 text-sm sm:text-xl text-emerald-100/70 font-medium">
                <div className="flex gap-4 sm:gap-6 items-start">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-emerald-500 text-emerald-950 flex items-center justify-center rounded-xl sm:rounded-2xl font-black shrink-0 text-sm sm:text-base">I</div>
                  <p>Study the environment's hazards carefully. Every epoch has a unique survival requirement.</p>
                </div>
                <div className="flex gap-4 sm:gap-6 items-start">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-emerald-500 text-emerald-950 flex items-center justify-center rounded-xl sm:rounded-2xl font-black shrink-0 text-sm sm:text-base">II</div>
                  <p>Select the biological adaptation that grants your organism the best chance of survival.</p>
                </div>
                <div className="flex gap-4 sm:gap-6 items-start">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-emerald-500 text-emerald-950 flex items-center justify-center rounded-xl sm:rounded-2xl font-black shrink-0 text-sm sm:text-base">III</div>
                  <p>Complete all 5 major evolutionary leaps to reach the apex of life.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-12">
                <Button onClick={() => setGameState('idle')} variant="outline" className="w-1/3 h-12 sm:h-16 text-sm sm:text-lg font-black border-white/20 text-white hover:bg-white/10 uppercase tracking-wider rounded-xl sm:rounded-2xl">
                  Back
                </Button>
                <Button onClick={() => setGameState('playing')} className="w-2/3 h-12 sm:h-16 text-base sm:text-xl font-black bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-lg">
                  Start Evolution
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === "playing" && (
            <div className="w-full h-full flex flex-col items-center justify-between py-4 sm:py-8 gap-4 sm:gap-6">
               <div className="text-center space-y-2 sm:space-y-4 max-w-2xl">
                  <motion.div
                    key={currentStage.environment}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1 sm:space-y-2"
                  >
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black px-3 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                        Environment: {currentStage.environment}
                    </Badge>
                    <p className="text-lg sm:text-3xl font-bold text-white leading-snug sm:leading-tight px-2 sm:px-4">
                        {currentStage.description}
                    </p>
                  </motion.div>
               </div>

               <div className="relative h-44 w-44 sm:h-64 sm:w-64 flex items-center justify-center my-2 sm:my-0">
                  <motion.div 
                    animate={{ 
                        scale: isWrong ? [1, 1.2, 1] : [1, 1.05, 1],
                        rotate: isWrong ? [0, 5, -5, 0] : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "relative z-10 w-32 h-32 sm:w-48 sm:h-48 filter transition-all duration-700",
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

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full max-w-3xl">
                  {currentStage.options.map((opt, i) => (
                    <motion.div
                        key={opt}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Button
                            onClick={() => handleAdaptation(opt)}
                            className="w-full h-14 sm:h-24 text-base sm:text-2xl font-black bg-emerald-900/40 hover:bg-emerald-500 text-white border-b-4 sm:border-b-8 border-emerald-900 hover:border-emerald-600 rounded-2xl sm:rounded-[32px] transition-all hover:-translate-y-1 sm:hover:-translate-y-2 group overflow-hidden relative"
                        >
                            <span className="relative z-10 uppercase tracking-tighter italic">{opt}</span>
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-t from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100"
                            />
                        </Button>
                    </motion.div>
                  ))}
               </div>

               <div className="w-full max-w-4xl px-4 sm:px-12 space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-emerald-400/50 uppercase tracking-[0.3em] sm:tracking-[0.5em]">
                    <span>Evolutionary Progress</span>
                    <span>Epoch {currentStageIndex + 1}/5</span>
                  </div>
                  <div className="h-2 bg-emerald-900/50 rounded-full overflow-hidden border border-emerald-500/10">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStageIndex) / sessionStages.length) * 100}%` }}
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
              className="text-center p-4"
            >
              <div className="relative mb-4 sm:mb-8">
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-yellow-400/20 blur-[80px] rounded-full"
                />
                <Trophy className="h-24 w-24 sm:h-40 sm:w-40 text-yellow-400 mx-auto relative drop-shadow-2xl" />
              </div>
              <h2 className="text-3xl sm:text-7xl font-black text-white uppercase italic tracking-tighter mb-2">Apex Lifeform</h2>
              <p className="text-emerald-400 text-sm sm:text-xl font-bold uppercase tracking-widest mb-6 sm:mb-12">Evolutionary Journey Concluded</p>
              
              <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-3xl sm:rounded-[40px] p-6 sm:p-10 mb-6 sm:mb-12 backdrop-blur-3xl shadow-2xl">
                <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs font-black text-emerald-100/30 uppercase tracking-widest mb-1 sm:mb-2">Genetic Superiority Index</p>
                    <p className="text-5xl sm:text-8xl font-black text-emerald-400 tabular-nums">{score}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
                <Button onClick={() => { setScore(0); setCurrentStageIndex(0); setGameState('idle'); }} className="h-14 sm:h-20 px-8 sm:px-12 text-lg sm:text-2xl font-black bg-emerald-500 text-emerald-950 hover:bg-emerald-400 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95">
                    <Repeat className="h-5 w-5 sm:h-8 sm:w-8" /> RE-EVOLVE
                </Button>
                <Button variant="outline" asChild className="h-14 sm:h-20 px-8 sm:px-12 text-lg sm:text-2xl font-black border-white/20 text-white hover:bg-white/10 rounded-2xl sm:rounded-3xl transition-all hover:scale-105">
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
