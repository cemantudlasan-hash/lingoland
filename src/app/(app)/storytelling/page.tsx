'use client';

import React, { useState, useEffect } from 'react';
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
  Trophy
} from 'lucide-react';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';

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

// Visual Novel Default Presets (for zero-latency instant play!)
const presetStories: Record<string, ReaderStory> = {
  'haunted-manor': {
    title: 'The Whispering Shadows of Blackwood Manor',
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
  'school-comedy': {
    title: 'The Great Chemistry Catastrophe of Room 4B',
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
  'quantum-chronicles-1': {
    title: 'The Quantum Spire: Episode 1 - The Anomaly',
    narrativeBlocks: [
      'The holographic display in Nova\'s cockpit flickered red. The chronometers were counting backward, a physical impossibility.',
      'Below her spaceship, the surface of Planet Aethel gard was cracking open, glowing with rivers of liquid plasma energy.',
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
  }
};

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
  
  // Reading tracking
  const [blockIndex, setBlockIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize and clean up TTS
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-to-speech speaker
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !ttsEnabled) return;
    
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Launch Story Reader Session
  const handleLaunchReader = async () => {
    setReadState('loading');
    setBlockIndex(0);
    
    if (source === 'preset') {
      const selected = presetStories[presetKey];
      if (selected) {
        // Preset stories have fixed genres for consistency
        if (presetKey === 'haunted-manor') setGenre('Horror');
        if (presetKey === 'school-comedy') setGenre('Comedy');
        if (presetKey === 'quantum-chronicles-1') {
          setGenre('Sci-Fi');
          setEpisodeNumber(1);
          setLength('long');
        }
        
        setTimeout(() => {
          setActiveStory(selected);
          setReadState('reading');
          if (ttsEnabled) {
            setTimeout(() => handleSpeak(selected.narrativeBlocks[0]), 800);
          }
        }, 800);
      } else {
        setReadState('config');
        toast({ variant: 'destructive', title: 'Story Not Found', description: 'Could not load preset story.' });
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
          
          if (ttsEnabled) {
            setTimeout(() => handleSpeak(res.narrativeBlocks[0]), 800);
          }
        } else {
          setReadState('config');
          toast({ variant: 'destructive', title: 'Generation Failed', description: 'AI storyteller was unable to write. Please try again.' });
        }
      } catch (err) {
        console.error("AI Reader Story generation failed:", err);
        setReadState('config');
        toast({ variant: 'destructive', title: 'Channel Offline', description: 'AI storyteller could not compile. Check your API Keys.' });
      }
    }
  };

  // Handle clicking through the blocks
  const handleNextBlock = () => {
    if (!activeStory) return;
    
    if (isSpeaking) {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    if (blockIndex >= activeStory.narrativeBlocks.length - 1) {
      // Completed story!
      setReadState('completed');
      return;
    }
    
    const nextIdx = blockIndex + 1;
    setBlockIndex(nextIdx);
    
    if (ttsEnabled) {
      setTimeout(() => handleSpeak(activeStory.narrativeBlocks[nextIdx]), 200);
    }
  };

  // Simulates saving new vocabulary card to Flashcards tab
  const handleSaveWord = (wordItem: VocabularyItem) => {
    toast({
      title: "Flashcard Stored! 🗃️✨",
      description: `"${wordItem.word}" (${wordItem.translation}) saved in your Leitner study collection.`,
      className: "bg-indigo-950 border-indigo-500/30 text-indigo-200"
    });
  };

  // Advanced next-episode handler
  const handleNextEpisode = () => {
    if (source === 'preset' && presetKey === 'quantum-chronicles-1') {
      toast({
        title: "Episode 2 Materializing... 🚀",
        description: "Moving down Planet Aethelgard coordinates. Generating Episode 2!",
      });
      // Set AI generation mode for episode 2
      setSource('ai');
      setPresetKey('');
      setGenre('Sci-Fi');
      setCustomTheme('Episode 2 of the Quantum Spire: Nova steps inside the obsidian doors and encounters a floating synthetic guardian.');
      setEpisodeNumber(2);
      setLength('long');
      setTimeout(handleLaunchReader, 1500);
    } else {
      // Increment episode count
      const nextEp = episodeNumber + 1;
      setEpisodeNumber(nextEp);
      handleLaunchReader();
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
    <div className="relative min-h-[85vh] w-full p-2 sm:p-4 text-white overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-900">
      <ConstellationCanvas />
      
      {/* Background ambient highlights */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col h-full min-h-[70vh]">
        
        <AnimatePresence mode="wait">
          
          {/* SETUP SCREEN */}
          {readState === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 max-w-5xl mx-auto w-full"
            >
              <div className="text-center space-y-2 select-none">
                <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-black tracking-widest uppercase py-1 px-3">
                  Interactive Story Reader
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 uppercase tracking-tight">
                  Visual Novel Storyteller
                </h1>
                <p className="text-slate-400 text-sm max-w-lg mx-auto font-medium leading-relaxed">
                  Engage in click-by-click narrative learning! Read high-end presets or let AI compose continuous episodes tailored to your exact tastes.
                </p>
              </div>

              <Card className="bg-slate-900/40 border-slate-850/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
                <CardContent className="p-0 space-y-6">
                  
                  {/* Select Preset vs AI source */}
                  <div className="space-y-2 select-none">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">1. Select Campaign Source</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSource('preset')}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold uppercase transition-all duration-300 ${
                          source === 'preset'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                            : 'bg-slate-950/30 border-slate-850 text-slate-500 hover:border-slate-800'
                        }`}
                      >
                        Read Preset Classics
                      </button>
                      <button
                        type="button"
                        onClick={() => setSource('ai')}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold uppercase transition-all duration-300 ${
                          source === 'ai'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                            : 'bg-slate-950/30 border-slate-850 text-slate-500 hover:border-slate-800'
                        }`}
                      >
                        Generate custom AI story
                      </button>
                    </div>
                  </div>

                  {/* PRESET CHANNELS */}
                  {source === 'preset' ? (
                    <div className="space-y-3 select-none">
                      <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">2. Choose Story Campaign</Label>
                      <div className="grid gap-3">
                        <button
                          type="button"
                          onClick={() => setPresetKey('haunted-manor')}
                          className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-4 ${
                            presetKey === 'haunted-manor'
                              ? 'bg-indigo-500/10 border-indigo-500'
                              : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🎭</span>
                              <p className="font-extrabold text-sm text-slate-100">The Whispering Shadows of Blackwood</p>
                            </div>
                            <p className="text-xs text-slate-450 mt-1 font-semibold">Horror · Short Story · Creepy gothic mystery</p>
                          </div>
                          <ChevronRight className={`h-5 w-5 ${presetKey === 'haunted-manor' ? 'text-indigo-455' : 'text-slate-600'}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPresetKey('school-comedy')}
                          className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-4 ${
                            presetKey === 'school-comedy'
                              ? 'bg-indigo-500/10 border-indigo-500'
                              : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🧪</span>
                              <p className="font-extrabold text-sm text-slate-100">The Chemistry Catastrophe of Room 4B</p>
                            </div>
                            <p className="text-xs text-slate-450 mt-1 font-semibold">Comedy · Short Story · Harmless school pranks gone pink</p>
                          </div>
                          <ChevronRight className={`h-5 w-5 ${presetKey === 'school-comedy' ? 'text-indigo-455' : 'text-slate-600'}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPresetKey('quantum-chronicles-1')}
                          className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-4 ${
                            presetKey === 'quantum-chronicles-1'
                              ? 'bg-indigo-500/10 border-indigo-500'
                              : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🚀</span>
                              <p className="font-extrabold text-sm text-slate-100">Quantum Spire: Episode 1 - The Anomaly</p>
                            </div>
                            <p className="text-xs text-slate-450 mt-1 font-semibold">Sci-Fi · Serial Campaign · Time distortions and space ruins</p>
                          </div>
                          <ChevronRight className={`h-5 w-5 ${presetKey === 'quantum-chronicles-1' ? 'text-indigo-455' : 'text-slate-600'}`} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    
                    /* GENERATIVE OPTIONS */
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      {/* Genres selector */}
                      <div className="space-y-2 select-none">
                        <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">2. Select Story Genre</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {["Comedy", "Horror", "Adventure", "Fantasy", "Romance", "Sci-Fi"].map(g => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGenre(g)}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all duration-300 ${
                                genre === g
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                  : 'bg-slate-950/30 border-slate-850 text-slate-550 hover:border-slate-800'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Length selector */}
                        <div className="space-y-2 select-none">
                          <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">3. Story Format</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setLength('short')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all duration-300 ${
                                length === 'short'
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                  : 'bg-slate-950/30 border-slate-850 text-slate-500 hover:border-slate-800'
                              }`}
                            >
                              Short Story
                            </button>
                            <button
                              type="button"
                              onClick={() => setLength('long')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all duration-300 ${
                                length === 'long'
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                  : 'bg-slate-950/30 border-slate-850 text-slate-500 hover:border-slate-800'
                              }`}
                            >
                              Long (Part/Ep)
                            </button>
                          </div>
                        </div>

                        {/* Episode selector (if long story) */}
                        <div className="space-y-2 select-none">
                          <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">4. Campaign Part/Episode</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map(num => (
                              <button
                                key={num}
                                type="button"
                                disabled={length !== 'long'}
                                onClick={() => setEpisodeNumber(num)}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all duration-300 ${
                                  length !== 'long' ? 'opacity-30 cursor-not-allowed border-slate-900 bg-slate-950/10' :
                                  episodeNumber === num
                                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                    : 'bg-slate-950/30 border-slate-850 text-slate-500 hover:border-slate-850'
                                }`}
                              >
                                Part {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Custom write-in theme */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">5. Story Premise & Topic</Label>
                        <Input
                          placeholder="E.g., A funny detective who loses his socks and interviews talking chairs..."
                          value={customTheme}
                          onChange={(e) => setCustomTheme(e.target.value)}
                          className="bg-slate-950 border-slate-850 rounded-xl h-11 text-slate-200"
                        />
                      </div>

                    </motion.div>
                  )}

                </CardContent>
                <CardFooter className="p-0 pt-6">
                  <Button
                    onClick={handleLaunchReader}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-xs tracking-wider h-11.5 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="h-4.5 w-4.5 fill-current" />
                    Launch Interactive Reader
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
              className="text-center py-20 flex flex-col items-center justify-center gap-4 bg-slate-900/30 border border-slate-850 rounded-3xl backdrop-blur-xl p-8"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <BookOpen className="w-6 h-6 text-amber-400 absolute top-3 left-3 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest">Inscribing Chronicle...</h3>
                <p className="text-slate-400 text-xs font-semibold">Gemini is laying down sentences and defining Thai vocabulary helpers.</p>
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
              className={isFullscreen ? "fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12 overflow-y-auto" : "flex flex-col gap-5 max-w-6xl mx-auto w-full"}
            >
              
              {/* Progress and settings bar */}
              <div className="bg-slate-950/60 border border-slate-850 p-4.5 rounded-2xl flex justify-between items-center shadow-md select-none">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
                    <h3 className="text-sm font-black text-slate-100 truncate">{activeStory.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 select-none">
                    <Badge className={`${themeConfig.badge} text-[9px] font-black uppercase py-0.5 px-2 shrink-0`}>
                      {genre}
                    </Badge>
                    {length === 'long' && (
                      <Badge className="bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-black uppercase py-0.5 px-2 shrink-0">
                        Part {episodeNumber}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* TTS Vocal Trigger */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSpeak(activeStory.narrativeBlocks[blockIndex])}
                    className="h-9 w-9 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    title={isSpeaking ? "Mute" : "Listen aloud"}
                  >
                    {isSpeaking ? <VolumeX className="h-4.5 w-4.5 text-amber-400" /> : <Volume2 className="h-4.5 w-4.5" />}
                  </Button>

                  {/* Fullscreen Mode Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-9 w-9 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    title={isFullscreen ? "Minimize Screen" : "Maximize Fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg className="h-4.5 w-4.5 text-indigo-455" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </Button>

                  <button
                    onClick={() => {
                      setIsFullscreen(false);
                      setReadState('config');
                    }}
                    className="text-xs font-black uppercase text-slate-500 hover:text-slate-350 transition-colors p-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Progress gauge bar */}
              <div className="space-y-1.5 select-none">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  <span>Story Progress</span>
                  <span>{blockIndex + 1} / {activeStory.narrativeBlocks.length} blocks</span>
                </div>
                <Progress 
                  value={((blockIndex + 1) / activeStory.narrativeBlocks.length) * 100} 
                  className="h-2 rounded-full bg-slate-900 border border-slate-850"
                />
              </div>

              {/* THE ACTIVE CHATBOX BALLOON READER */}
              <div
                onClick={handleNextBlock}
                className={`bg-gradient-to-b ${themeConfig.bg} border-2 backdrop-blur-xl rounded-3xl shadow-2xl text-center cursor-pointer flex flex-col justify-center items-center relative transition-all duration-500 hover:brightness-105 active:scale-[0.99] group ${isFullscreen ? 'flex-grow my-4 p-10 sm:p-20 min-h-[48vh]' : 'min-h-[30vh] sm:min-h-[36vh] p-8 sm:p-14'}`}
              >
                
                {/* Visual novel talk box prompt */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-slate-850 text-slate-500 text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-full flex items-center gap-1 select-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span>Click box to continue reading</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={blockIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`font-bold leading-relaxed max-w-4xl mx-auto select-text text-justify sm:text-center ${themeConfig.text} ${isFullscreen ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}
                  >
                    {activeStory.narrativeBlocks[blockIndex]}
                  </motion.p>
                </AnimatePresence>

                {/* Right button helper */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-950/70 border border-slate-850 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-400 transition-colors select-none">
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5 fill-current animate-pulse" />
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
              className="max-w-5xl mx-auto w-full space-y-6 text-center select-none"
            >
              <Card className="bg-slate-900/40 border-slate-850/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
                
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-bounce">
                  <Trophy className="h-8 w-8" />
                </div>
                
                <div className="space-y-2">
                  <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black tracking-widest uppercase px-3 py-0.5">
                    Quest Read Complete
                  </Badge>
                  <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tight">Campaign Epilogue</h2>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                    You have read to the end of **{activeStory.title}**! Review the key vocabulary cards featured in this narrative.
                  </p>
                </div>

                {/* Vocabulary Cards list */}
                <div className="grid gap-3 pt-3">
                  {activeStory.vocabulary.map((vocab, i) => (
                    <div 
                      key={i}
                      className="bg-slate-950/60 border border-slate-850 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-left gap-3 relative"
                    >
                      <div className="space-y-1 pr-6 select-text">
                        <h4 className="font-extrabold text-amber-455 text-base capitalize flex items-center gap-1.5">
                          <BookOpen className="h-4.5 w-4.5 text-slate-600" />
                          {vocab.word}
                        </h4>
                        <p className="text-slate-350 text-xs font-semibold leading-relaxed">
                          {vocab.definition}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-900 pt-3.5 sm:pt-0 shrink-0">
                        <span className="text-indigo-400 text-xs font-black select-text">Thai: {vocab.translation}</span>
                        <Button
                          onClick={() => handleSaveWord(vocab)}
                          className="h-7 w-7 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 p-0 flex items-center justify-center shrink-0"
                          title="Save to Flashcards"
                        >
                          <BookMarked className="h-3.5 w-3.5 fill-current" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-850 flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setSource('ai');
                      setCustomTheme('');
                      setReadState('config');
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black uppercase text-xs h-11 px-6 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate New AI Story</span>
                  </Button>

                  <Button
                    onClick={() => setReadState('config')}
                    variant="outline"
                    className="bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-455 font-black uppercase text-xs h-11 px-6 rounded-xl"
                  >
                    Change Genre / Preset
                  </Button>
                  
                  {length === 'long' && (
                    <Button
                      onClick={handleNextEpisode}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-xs tracking-wider h-11 px-6 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1"
                    >
                      <span>Unlock Episode {episodeNumber + 1}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {length === 'short' && (
                    <Button
                      onClick={handleLaunchReader}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-xs tracking-wider h-11 px-6 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reread Story</span>
                    </Button>
                  )}
                </div>

              </Card>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
