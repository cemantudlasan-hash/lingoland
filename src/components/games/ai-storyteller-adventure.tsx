'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStoryChapter } from '@/ai/flows/storyteller';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Compass, 
  Sparkles, 
  Loader2, 
  ShieldAlert, 
  Coins, 
  ArrowRight, 
  Key, 
  Trophy, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  RefreshCw,
  Play
} from 'lucide-react';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';

interface Choice {
  label: string;
  description: string;
  challengeSentence: string;
  correctAnswer: string;
}

const defaultThemes = [
  "Tame a legendary fire dragon",
  "Discover the hidden Atlantis temple",
  "Escape from a mysterious quantum prison",
  "Unmask the syndicate boss in a neon cyberpunk metropolis",
  "Retrieve the lost artifact of eternity"
];

export function AiStorytellerAdventure({ slug, onToggleFullscreen }: { slug?: string; onToggleFullscreen?: () => void }) {
  const { toast } = useToast();
  
  // Game state manager
  const [gameState, setGameState] = useState<'setup' | 'loading' | 'playing' | 'lock' | 'completed' | 'error'>('setup');
  
  // Setup inputs
  const [genre, setGenre] = useState('Fantasy');
  const [theme, setTheme] = useState(defaultThemes[0]);
  const [customTheme, setCustomTheme] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // Core narrative states
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [choices, setChoices] = useState<Choice[]>([]);
  const [previousStory, setPreviousStory] = useState('');
  
  // Interactive grammar lock states
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [lockInput, setLockInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  
  // Sound controls (Text to Speech)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);


  // Initialize TTS
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !ttsEnabled) return;
    
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for language learners
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Launch initial chapter
  const handleStartGame = async () => {
    const finalTheme = customTheme.trim() !== '' ? customTheme.trim() : theme;
    
    setGameState('loading');
    setChapterNumber(1);
    setPreviousStory('');
    setCoins(0);
    setXp(0);
    
    try {
      const res = await generateStoryChapter({
        genre,
        theme: finalTheme,
        chapterNumber: 1,
        difficulty
      });
      
      if (res) {
        setChapterTitle(res.chapterTitle);
        setStoryText(res.storyText);
        setChoices(res.choices);
        setPreviousStory(res.storyText);
        setGameState('playing');
        
        // Auto-read chapter title and opening text
        if (ttsEnabled) {
          setTimeout(() => handleSpeak(`${res.chapterTitle}. ${res.storyText}`), 800);
        }
      } else {
        setGameState('error');
      }
    } catch (err) {
      console.error("Failed to generate chapter 1:", err);
      setGameState('error');
    }
  };

  // Normalize string comparisons to make grammar checking user-friendly
  const normalizeSentence = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?']/g, "") // strip punctuation
      .replace(/\s+/g, " ") // normalize spacing
      .trim();
  };

  // Select a branch path to unlock
  const handleSelectChoice = (choice: Choice) => {
    setSelectedChoice(choice);
    setLockInput('');
    setAttempts(0);
    setShowHint(false);
    setGameState('lock');
  };

  // Solve the grammar lock
  const handleSolveLock = async () => {
    if (!selectedChoice) return;
    
    const userAns = normalizeSentence(lockInput);
    const correctAns = normalizeSentence(selectedChoice.correctAnswer);
    
    if (userAns === correctAns) {
      // Success! Correct grammar!
      toast({
        title: "Riddle Unlocked! 🔑✨",
        description: "Excellent grammar! You earned +10 Lingo-Coins and +20 XP!",
        className: "bg-emerald-950 border-emerald-500/30 text-emerald-200",
      });
      
      const newCoins = coins + 10;
      const newXp = xp + 20;
      setCoins(newCoins);
      setXp(newXp);
      
      // Update cumulative story log
      const updatedStory = `${previousStory}\n\n[Action: ${selectedChoice.label}]\n\n`;
      setPreviousStory(updatedStory);
      
      // Check if we hit the story climax (Chapter 4)
      if (chapterNumber >= 4) {
        handleEndStory(updatedStory);
        return;
      }
      
      // Transition to loading the next chapter
      setGameState('loading');
      const nextChapter = chapterNumber + 1;
      setChapterNumber(nextChapter);
      
      try {
        const res = await generateStoryChapter({
          genre,
          theme: customTheme.trim() !== '' ? customTheme.trim() : theme,
          chapterNumber: nextChapter,
          difficulty,
          previousStory: updatedStory,
          userChoice: selectedChoice.label
        });
        
        if (res) {
          setChapterTitle(res.chapterTitle);
          setStoryText(res.storyText);
          setChoices(res.choices);
          setPreviousStory(prev => `${prev}${res.storyText}`);
          setSelectedChoice(null);
          setGameState('playing');
          
          if (ttsEnabled) {
            setTimeout(() => handleSpeak(`${res.chapterTitle}. ${res.storyText}`), 800);
          }
        } else {
          setGameState('error');
        }
      } catch (err) {
        console.error("Failed to load next chapter:", err);
        setGameState('error');
      }
    } else {
      // Mistake made
      setAttempts(prev => prev + 1);
      toast({
        variant: "destructive",
        title: "Grammar Lock Destabilized! ❌",
        description: "The lock did not open. Try checking your verb agreement, prepositions, or spellings!",
      });
      
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  // Conclude the adventure
  const handleEndStory = (fullNarrative: string) => {
    setGameState('completed');
    
    // Dispatch standard Classroom Game Completed custom event so that they get rewards docked naturally!
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
        detail: { state: 'finished' }
      }));
    }
  };

  return (
    <div className="relative min-h-[92vh] w-full flex flex-col items-center justify-start p-3 sm:p-6 text-white overflow-hidden select-none bg-slate-950/10 rounded-3xl border border-slate-900/60">
      <ConstellationCanvas />
      
      {/* Background radial highlights */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col gap-6">

        
        <AnimatePresence mode="wait">
          
          {/* SETUP SCREEN */}
          {gameState === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="text-center space-y-2">
                <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-black tracking-widest uppercase py-1 px-3">
                  Classroom RPG Game
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 uppercase tracking-tight">
                  AI Choose-Your-Own Adventure
                </h1>
                <p className="text-slate-400 text-sm max-w-lg mx-auto font-medium leading-relaxed">
                  Design a custom adventure quest, pick your genre, and unlock story paths by completing grammar challenges!
                </p>
              </div>

              <Card className="bg-slate-900/40 border-slate-850/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8">
                <CardContent className="space-y-6 p-0">
                  
                  {/* Genre Selections */}
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">1. Select Story Genre</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {["Fantasy", "Sci-Fi", "Cyberpunk", "Mystery", "Mythical", "Adventure"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGenre(g)}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold uppercase transition-all duration-300 ${
                            genre === g
                              ? 'bg-gradient-to-r from-purple-500/25 to-indigo-600/25 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                              : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Themes Select */}
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">2. Select Your Quest Goal</Label>
                    <div className="grid gap-2">
                      {defaultThemes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTheme(t);
                            setCustomTheme('');
                          }}
                          className={`p-3.5 rounded-xl border text-left text-sm font-bold transition-all duration-300 flex items-center gap-3 ${
                            theme === t && customTheme === ''
                              ? 'bg-indigo-500/10 border-indigo-500/60 text-slate-200'
                              : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-350'
                          }`}
                        >
                          <Sparkles className={`h-4.5 w-4.5 shrink-0 ${theme === t && customTheme === '' ? 'text-amber-400' : 'text-slate-600'}`} />
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Custom Theme option */}
                    <div className="space-y-1 pt-2">
                      <Label className="text-xs font-bold text-slate-500">Or write your own custom quest theme:</Label>
                      <Input
                        placeholder="e.g., Finding a lost puppy in a haunted candy store..."
                        value={customTheme}
                        onChange={(e) => setCustomTheme(e.target.value)}
                        className="bg-slate-950 border-slate-850 rounded-xl h-11 text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Difficulty Setting */}
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider">3. Grammar Difficulty Lock</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["easy", "medium", "hard"] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`py-2 px-4 rounded-xl border text-xs font-bold uppercase transition-all duration-300 ${
                            difficulty === d
                              ? d === 'easy' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                : d === 'medium' ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                                : 'bg-rose-500/10 border-rose-505 text-rose-400'
                              : 'bg-slate-950/50 border-slate-850 text-slate-500 hover:border-slate-800'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                </CardContent>
                <CardFooter className="p-0 pt-6">
                  <Button
                    onClick={handleStartGame}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm uppercase tracking-wider h-12 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                  >
                    <Play className="h-4.5 w-4.5 fill-current" />
                    Begin Story Adventure
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* LOADING SCREEN */}
          {gameState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 flex flex-col items-center justify-center gap-4 bg-slate-900/30 border border-slate-850 rounded-3xl backdrop-blur-xl p-8"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <Compass className="w-6 h-6 text-amber-400 absolute top-3 left-3 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest">Proceduralizing Narrative...</h3>
                <p className="text-slate-400 text-xs font-semibold">Gemini is sketching out the next chapter and formulating grammar locks.</p>
              </div>
            </motion.div>
          )}

          {/* PLAYING SCREEN */}
          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full space-y-4"
            >
              {/* Stats / Header bar */}
              <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-4 backdrop-blur-md flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">Chapter {chapterNumber} of 4</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    <Coins className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-amber-300 font-extrabold text-xs">+{coins} Lingo-Coins</span>
                  </div>
                  {onToggleFullscreen && (
                    <button onClick={onToggleFullscreen} className="text-slate-400 hover:text-slate-200 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Chapter narrative Card */}
              <Card className="bg-slate-900/40 border-slate-850/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl relative">
                <CardHeader className="border-b border-slate-850 bg-slate-950/40 flex flex-row items-center justify-between py-5 px-6">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-indigo-300 to-indigo-400 tracking-wide">
                      {chapterTitle}
                    </CardTitle>
                    <CardDescription className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-0.5">{genre} Quest</CardDescription>
                  </div>
                  
                  {/* TTS Control Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSpeak(storyText)}
                    className="h-9 w-9 rounded-xl border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    title={isSpeaking ? "Pause Audio" : "Read Chapter Aloud"}
                  >
                    {isSpeaking ? <VolumeX className="h-4.5 w-4.5 text-amber-400" /> : <Volume2 className="h-4.5 w-4.5" />}
                  </Button>
                </CardHeader>
                <CardContent className="py-6 px-6 sm:px-8 space-y-4 select-text">
                  <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line font-medium text-justify">
                    {storyText}
                  </p>
                </CardContent>
              </Card>

              {/* Choices list */}
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-indigo-400 tracking-widest pl-1 select-none">
                  Choose Your Next Action Path:
                </Label>
                <div className="grid gap-2.5">
                  {choices.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectChoice(c)}
                      className="group bg-slate-900/50 hover:bg-indigo-900/10 border border-slate-850 hover:border-indigo-500/40 p-4 rounded-2xl text-left transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            Path {i + 1}
                          </Badge>
                          <p className="font-extrabold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {c.label}
                          </p>
                        </div>
                        <p className="text-slate-450 text-xs font-medium truncate pr-4">
                          {c.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* GRAMMAR LOCK PUZZLE */}
          {gameState === 'lock' && selectedChoice && (
            <motion.div
              key="lock"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <Card className="bg-slate-900/50 border-slate-850/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
                <CardHeader className="p-0 border-b border-slate-800/60 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                        Grammar Lock: {selectedChoice.label}
                      </CardTitle>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Solve the linguistic challenge to progress down this story branch!</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 space-y-6">
                  
                  {/* The incorrect sentence container */}
                  <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 text-center space-y-3 relative overflow-hidden shadow-inner select-text">
                    <div className="absolute top-0 left-0 bg-rose-500/10 text-rose-400 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-br-lg border-r border-b border-rose-500/20 flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      Grammar Error
                    </div>
                    <span className="text-xs text-slate-500 font-black tracking-wider uppercase block pt-1 select-none">Incorrect Sentence:</span>
                    <h3 className="text-xl md:text-2xl font-black text-rose-300 italic leading-snug tracking-wide">
                      "{selectedChoice.challengeSentence}"
                    </h3>
                  </div>

                  {/* Input field */}
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-wider pl-1">Type the corrected version:</Label>
                    <Input
                      placeholder="Type the complete, grammatically correct sentence..."
                      value={lockInput}
                      onChange={(e) => setLockInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSolveLock(); }}
                      className="bg-slate-950 border-slate-850 rounded-xl h-12 text-slate-200 px-4 text-base focus:border-indigo-500"
                    />
                  </div>

                  {/* Hint overlay */}
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl text-xs leading-relaxed text-indigo-300"
                    >
                      <span className="font-black text-[10px] tracking-wider uppercase text-amber-400 block mb-1">💡 Memory Aid Hint:</span>
                      To pick this lock, pay close attention to **verb conjugation**, **common prepositions**, or **irregular plurals**. 
                      <span className="block mt-1 font-bold text-slate-400">Target Correct Answer contains: "{selectedChoice.correctAnswer}"</span>
                    </motion.div>
                  )}

                </CardContent>

                <CardFooter className="p-0 pt-4 flex gap-3 select-none">
                  <Button
                    variant="outline"
                    onClick={() => setGameState('playing')}
                    className="bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 font-extrabold uppercase text-xs px-5 rounded-xl h-11"
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={handleSolveLock}
                    disabled={!lockInput.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-xs tracking-wider rounded-xl h-11 shadow-md shadow-indigo-600/20"
                  >
                    Unlock Chapter Path
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* QUEST COMPLETED */}
          {gameState === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center"
            >
              <Card className="bg-slate-900/50 border-slate-850/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 space-y-8 relative overflow-hidden">
                {/* Confetti particles background */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                
                <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-bounce">
                  <Trophy className="h-10 w-10" />
                </div>
                
                <div className="space-y-3">
                  <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black tracking-widest uppercase px-3 py-1">
                    Quest Cleared
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-purple-200 uppercase tracking-tight leading-none">
                    Campaign Completed!
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    You navigated the story perfectly and bypassed all grammar locks! Your classroom pet levels up.
                  </p>
                </div>

                {/* Score tally */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl">
                    <Coins className="h-6 w-6 text-amber-400 fill-amber-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Lingo-Coins Earned</p>
                    <p className="text-2xl font-black text-amber-300">+{coins}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl">
                    <Trophy className="h-6 w-6 text-indigo-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 font-black tracking-wider uppercase">XP Earned</p>
                    <p className="text-2xl font-black text-indigo-300">+{xp}</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-center select-none">
                  <Button
                    onClick={() => setGameState('setup')}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-xs tracking-wider px-8 rounded-xl h-11 shadow-md shadow-indigo-600/25"
                  >
                    Play Another Quest
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ERROR SCREEN */}
          {gameState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 flex flex-col items-center justify-center gap-6 bg-slate-900/30 border border-slate-850 rounded-3xl backdrop-blur-xl p-8"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest">Generative Channel Offline</h3>
                <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                  Could not retrieve the adventure chapter from Genkit. Please check your Gemini API Keys or internet connection, and try again!
                </p>
              </div>
              <Button
                onClick={() => setGameState('setup')}
                className="bg-slate-950 border border-slate-800 text-slate-300"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Return to Setup
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
        
      </div>
    </div>
  );
}
