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
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { logAnalyticsEvent, getDailyBonusGame } from '@/lib/analytics';
import { shuffleArray } from '@/lib/shuffle';

type GameState = 'idle' | 'playing' | 'finished' | 'instructions';

interface VocabItem {
  word: string;
  hint: string;
}

const MASTER_VOCAB: VocabItem[] = [
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
  { word: "Veterinarian", hint: "An animal doctor." },
  { word: "Tour Guide", hint: "A person who shows visitors interesting places." },
  { word: "Architect", hint: "A person who designs buildings and plans their construction." },
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
  { word: "Plumber", hint: "A person who fits and repairs pipes and heating systems." },
  { word: "Baker", hint: "Someone who makes bread, cakes, and pastries in an oven." },
  { word: "Detective", hint: "An investigator who searches for clues to solve crimes." },
  { word: "Tailor", hint: "A person whose occupation is making or altering clothes." },
  { word: "Florist", hint: "Someone who sells and arranges cut flowers and plants." },
  { word: "Web Developer", hint: "A programmer who creates and maintains websites." },
  { word: "Gardener", hint: "A person who cares for plants, lawns, and flowers in a garden." },
  { word: "Judge", hint: "A public official appointed to decide cases in a law court." },
  { word: "Athlete", hint: "A person who is trained in or good at sports or exercises." },
];

const GAME_WORDS_COUNT = 8;

const BACKGROUND_FLOATS = [
  { char: '📖', left: '8%', size: '20px', duration: '12s', delay: '0s' },
  { char: '✏️', left: '20%', size: '22px', duration: '14s', delay: '3s' },
  { char: '📚', left: '80%', size: '18px', duration: '10s', delay: '1s' },
  { char: '🌟', left: '92%', size: '24px', duration: '15s', delay: '5s' },
  { char: '🪙', left: '12%', size: '26px', duration: '13s', delay: '6s' },
  { char: '🎓', left: '78%', size: '28px', duration: '16s', delay: '2s' },
  { char: '🧠', left: '25%', size: '20px', duration: '9s', delay: '4s' },
];

export function VocabFlipper3D({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [gameState, setGameState] = React.useState<GameState>('idle');
  const [vocabList, setVocabList] = React.useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [particles, setParticles] = React.useState<any[]>([]);

  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const game = getGameBySlug(slug);

  const { slug: dailyBonusSlug, bonusAmount: dailyBonusAmount } = getDailyBonusGame();
  const isDailyBonus = slug === dailyBonusSlug;

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const startNewGame = () => {
    const shuffled = shuffleArray([...MASTER_VOCAB]);
    const subset = shuffled.slice(0, GAME_WORDS_COUNT);
    setVocabList(subset);
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    setParticles([]);
    setGameState('playing');
  };

  const handleFlipCard = () => {
    if (vocabList.length === 0 || gameState !== 'playing') return;
    
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    // If flipped to reveal the answer, generate correct sparks and add score
    if (nextFlipped) {
      setScore(s => s + 100);

      // Generate visual particle bursts
      const emojisPool = ['📚', '✏️', '📖', '🌟', '🪙', '✨', '🧠', '🎓'];
      const colorsPool = ['#a855f7', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];
      const newParticles = Array.from({ length: 25 }).map((_, i) => {
        const angle = (i * 14.4 * Math.PI) / 180 + (Math.random() * 0.2 - 0.1);
        const distance = Math.floor(Math.random() * 120) + 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 80;
        
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
    }
  };

  const handleNextWord = () => {
    if (currentIndex + 1 < vocabList.length) {
      setIsFlipped(false);
      setParticles([]);
      // Wait for flip back animation to complete
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    } else {
      setGameState('finished');
      logAnalyticsEvent(firestore, user?.uid || 'guest', {
        type: 'game_played',
        details: { slug: game?.slug || 'vocab-flipper-3d', score: score + 100, difficulty: 'beginner' }
      });
      toast({
        title: "All Cards Cleared! 🏆✨",
        description: "Great job matching definitions to words! Coins and pet stats updated.",
      });
    }
  };

  if (!game) return null;

  return (
    <div className={cn(
      "w-full relative min-h-[40rem] flex flex-col justify-center items-center",
      isFullscreen ? "min-h-screen bg-slate-950 p-4 sm:p-8" : "py-4"
    )}>
      <style>{`
        @keyframes flipper-float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.35; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
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
          0%, 100% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)); }
        }
        .flipper-animate-float {
          animation: flipper-float 15s ease-in-out infinite;
        }
        .flipper-glow-coin {
          animation: flipper-glow-coin 2s infinite ease-in-out;
        }
        .flipper-particle {
          position: absolute;
          animation: flipper-particle-fly var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) var(--delay) forwards;
          pointer-events: none;
          z-index: 50;
        }
      `}</style>

      {/* Floating Background Materials */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        {BACKGROUND_FLOATS.map((item, i) => (
          <div
            key={i}
            className="flipper-animate-float absolute bottom-[-40px]"
            style={{
              left: item.left,
              fontSize: item.size,
              animationDuration: item.duration,
              animationDelay: item.delay,
            }}
          >
            {item.char}
          </div>
        ))}
      </div>

      <Card className={cn(
        "w-full overflow-hidden bg-card/90 backdrop-blur-md border-border/20 shadow-2xl relative transition-all duration-500 z-10",
        isFullscreen ? "h-screen rounded-none border-none" : "max-w-4xl mx-auto rounded-xl border"
      )}>
        <CardHeader className="text-center pb-2 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-auto p-2 gap-1 text-muted-foreground hover:text-foreground z-[100]"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase">{isFullscreen ? 'Exit' : 'Full'}</span>
          </Button>
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/20 rounded-full">
              <Rotate3d className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter italic uppercase text-white">3D VOCAB FLIPPER</CardTitle>
          <CardDescription className="text-gray-300 font-medium">Reveal vocabulary cards and build semantic memory.</CardDescription>
        </CardHeader>

        <CardContent className={cn(
          "flex flex-col items-center justify-center relative p-6 overflow-hidden select-none touch-none",
          isFullscreen ? "min-h-[calc(100vh-200px)]" : "min-h-[500px]"
        )}>
          {/* Particle Burst Container */}
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

          {gameState === 'idle' && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
              {isDailyBonus && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-none flex items-center gap-1.5 py-1.5 px-4 shadow-lg shadow-amber-500/20 animate-pulse mb-2">
                  <Coins className="h-4 w-4 fill-slate-950 animate-bounce" />
                  ⭐ Daily Bonus: Earn +{dailyBonusAmount} Coins!
                </Badge>
              )}
              <Button onClick={() => setGameState('instructions')} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-transform font-bold text-white shadow-xl shadow-indigo-500/20">
                INITIALIZE INTERFACE
              </Button>
            </div>
          )}

          {gameState === 'instructions' && (
            <div className="max-w-md space-y-6 text-center animate-in fade-in zoom-in duration-300 px-6">
              <div className="bg-muted/50 p-6 rounded-2xl border-2 border-primary/20 backdrop-blur-sm shadow-inner">
                <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-widest">MISSION PROTOCOL</h3>
                <ul className="text-left space-y-3 text-sm font-medium text-gray-200">
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/40 flex items-center justify-center text-xs text-white shrink-0">1</span>
                    <span>Read the <strong>Definition</strong> shown on the card.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/40 flex items-center justify-center text-xs text-white shrink-0">2</span>
                    <span>Click/Tap the card to rotate it in 3D and reveal the answer.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/40 flex items-center justify-center text-xs text-white shrink-0">3</span>
                    <span>Advance through all {GAME_WORDS_COUNT} terms to complete the mission!</span>
                  </li>
                </ul>
              </div>
              <Button onClick={startNewGame} size="lg" className="w-full bg-primary hover:bg-primary/90 font-black tracking-widest">
                START SESSION
              </Button>
            </div>
          )}

          {gameState === 'playing' && vocabList[currentIndex] && (
            <div className={cn(
              "w-full flex flex-col items-center gap-8 relative transition-all duration-300",
              isFullscreen ? "max-w-5xl" : "max-w-xl"
            )}>
              {/* Words remaining widget */}
              <div className="bg-black/40 px-6 py-2 rounded-full border border-white/10 shadow-lg text-sm text-gray-300 font-bold uppercase tracking-wider">
                Card {currentIndex + 1} of {vocabList.length}
              </div>

              {/* 3D Flipping Flashcard */}
              <div 
                onClick={handleFlipCard}
                className={cn(
                  "w-full cursor-pointer transition-all duration-300",
                  isFullscreen ? "aspect-[16/10]" : "aspect-[5/3]"
                )}
                style={{ perspective: '1200px' }}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                  {/* Front: Definition */}
                  <div
                    className="absolute inset-0 w-full h-full bg-white/10 border-2 border-white/20 rounded-3xl p-8 flex flex-col justify-center items-center text-center backdrop-blur-md shadow-2xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className={cn("font-black uppercase text-primary tracking-[0.2em] transition-all", isFullscreen ? "text-sm mb-6" : "text-[10px] mb-4")}>Definition</span>
                    <p className={cn("font-bold text-white italic leading-tight transition-all", isFullscreen ? "text-3xl md:text-4xl px-8" : "text-xl md:text-2xl")}>
                      "{vocabList[currentIndex].hint}"
                    </p>
                    <span className={cn("font-bold text-gray-400 animate-pulse transition-all", isFullscreen ? "text-xs mt-10" : "text-[9px] mt-6")}>TAP TO FLIP 🔄</span>
                  </div>

                  {/* Back: Answer */}
                  <div
                    className="absolute inset-0 w-full h-full bg-white text-primary border-4 border-primary/50 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-2xl"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className={cn("font-black uppercase text-primary/75 tracking-[0.2em] transition-all", isFullscreen ? "text-sm mb-6" : "text-[10px] mb-4")}>Vocabulary Word</span>
                    <h2 className={cn("font-extrabold uppercase tracking-tight text-primary transition-all", isFullscreen ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl")}>
                      {vocabList[currentIndex].word}
                    </h2>
                    <span className={cn("font-bold text-muted-foreground transition-all", isFullscreen ? "text-xs mt-10" : "text-[9px] mt-6")}>TAP CARD TO FLIP BACK</span>
                  </div>
                </motion.div>
              </div>

              {/* Next word button */}
              <div className="h-16 flex items-center">
                <AnimatePresence>
                  {isFlipped && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Button 
                        onClick={handleNextWord} 
                        className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-bold px-8 py-6 rounded-full text-lg shadow-lg flex items-center gap-2"
                      >
                        <span>Next Word</span>
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-xl mx-auto py-6">
              <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce" />
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white">ALL CARDS REVEALED</h2>
                <p className="text-gray-300 font-medium text-lg">Completed: <span className="text-primary text-3xl font-black">{score} pts</span></p>
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
                  <div className="flipper-glow-coin bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 relative">
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

              <div className="flex gap-4 z-10 relative">
                <Button onClick={startNewGame} size="lg" className="rounded-full px-8 font-bold bg-primary text-white hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                  <RotateCcw className="mr-2 w-5 h-5" /> PLAY AGAIN
                </Button>
                <Button variant="outline" onClick={() => setGameState('idle')} size="lg" className="rounded-full px-8 font-bold border-white/20 text-white hover:bg-white/10">
                  <RotateCcw className="mr-2 w-5 h-5" /> RE-CONFIGURE
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-black/40 p-6 flex justify-between items-center border-t border-white/10">
          <div className="flex gap-2">
              <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
                <Link href="/games">EXIT TO MENU</Link>
              </Button>
              {gameState === 'playing' && (
                <Button variant="secondary" onClick={startNewGame} className="font-bold">
                  <RotateCcw className="mr-2 w-4 h-4" /> RESTART CARDSET
                </Button>
              )}
          </div>
          {gameState === 'playing' && (
            <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest">
              <span>CARD {currentIndex + 1} / {vocabList.length}</span>
              <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_10px_#8b5cf6]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentIndex / vocabList.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
