"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, RotateCcw, Volume2, VolumeX, Maximize2, HelpCircle, 
  ChevronRight, Coins, ArrowLeft, BookOpen, Compass, Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { audioEngine } from "../AudioEngine";
import { ETYMOLOGY_EXPEDITION_WORDS, EtymologyWord } from "@/lib/new-games-data";
import { getDailyMissions, getDailyBonusGame } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function EtymologyExpedition({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<EtymologyWord | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDaily, setIsDaily] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    const dailyMissions = getDailyMissions();
    const { slug: dailyBonusSlug } = getDailyBonusGame();
    const isDailyGame = dailyMissions.some(m => m.slug === slug) || dailyBonusSlug === slug;
    setIsDaily(isDailyGame);
  }, [slug]);
  
  // Selection slots
  const [selectedPrefix, setSelectedPrefix] = useState<string | null>(null);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [selectedSuffix, setSelectedSuffix] = useState<string | null>(null);

  // Decks for selection
  const [prefixDeck, setPrefixDeck] = useState<string[]>([]);
  const [rootDeck, setRootDeck] = useState<string[]>([]);
  const [suffixDeck, setSuffixDeck] = useState<string[]>([]);

  const [isMuted, setIsMuted] = useState(false);
  const [gateState, setGateState] = useState<"locked" | "unlocking" | "opened" | "shaking">("locked");
  const [gameFinished, setGameFinished] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // Meanings database for hover tooltips
  const PART_MEANINGS: Record<string, string> = {
    // Prefixes
    "re": "again, back",
    "un": "not, opposite of",
    "dis": "not, apart, away",
    "sub": "under, below",
    "pre": "before",
    "in": "in, into or not",
    "ex": "out, beyond",
    "trans": "across, through",
    "bio": "life",
    "chrono": "time",
    "sym": "together, with",
    "contra": "against",
    "de": "down, off, remove",
    "multi": "many",
    "inter": "between",
    "[None]": "No prefix / Empty",

    // Roots
    "play": "engage in activity for enjoyment",
    "happy": "feeling pleasure or contentment",
    "teach": "impart knowledge or skills",
    "help": "give assistance or support",
    "like": "find agreeable or friendly",
    "way": "road, path, or track",
    "care": "feel concern or interest",
    "view": "look at or inspect",
    "pain": "physical or mental suffering",
    "usual": "habitual or common",
    "port": "carry, move, or convey",
    "dict": "say, speak, or tell",
    "vis": "see or perceive",
    "rupt": "break, burst, or tear",
    "mar": "sea or pool",
    "struct": "build, arrange, or assemble",
    "scrib": "write or carve",
    "destruct": "demolish, break down",
    "sphere": "globe, ball, or round body",
    "meter": "measure",
    "path": "feeling, suffering, emotion",
    "press": "squeeze, push down",
    "cultur": "grow, till, or cultivate",
    "stell": "star",
    "grade": "step, degree, or slope",

    // Suffixes
    "er": "person who does this action",
    "ful": "full of, characterized by",
    "less": "without, free from",
    "ion": "act, process, state of",
    "ible": "capable of, fit for",
    "ive": "tending to, having nature of",
    "y": "state, condition, or quality",
    "al": "relating to, action of",
    "ar": "relating to, like",
    "able": "able to be"
  };

  // Fisher-Yates Shuffle
  const shuffle = (array: string[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Dynamic selector deck compiler
  const setupDecks = useCallback((wordObj: EtymologyWord) => {
    // Get lists of all parts across difficulty to pick distractors
    const allMatches = ETYMOLOGY_EXPEDITION_WORDS.filter(w => w.difficulty === wordObj.difficulty);
    
    // Prefix distractor pool
    const prefixes = Array.from(new Set(allMatches.map(w => w.prefix).filter(p => p !== wordObj.prefix && p !== "")));
    const prefSelected = shuffle(prefixes).slice(0, 2);
    prefSelected.push(wordObj.prefix === "" ? "[None]" : wordObj.prefix);
    setPrefixDeck(shuffle(prefSelected));

    // Root distractor pool
    const roots = Array.from(new Set(allMatches.map(w => w.root).filter(r => r !== wordObj.root)));
    const rootSelected = shuffle(roots).slice(0, 2);
    rootSelected.push(wordObj.root);
    setRootDeck(shuffle(rootSelected));

    // Suffix distractor pool
    const suffixes = Array.from(new Set(allMatches.map(w => w.suffix).filter(s => s !== wordObj.suffix && s !== "")));
    const suffSelected = shuffle(suffixes).slice(0, 2);
    suffSelected.push(wordObj.suffix === "" ? "[None]" : wordObj.suffix);
    setSuffixDeck(shuffle(suffSelected));
  }, []);

  // Load word challenge
  const loadWord = useCallback((diff: "beginner" | "intermediate" | "advanced", idx: number) => {
    const matchedWords = ETYMOLOGY_EXPEDITION_WORDS.filter(w => w.difficulty === diff);
    let wordObj: EtymologyWord;

    if (idx < matchedWords.length) {
      wordObj = matchedWords[idx];
    } else {
      // Fallback loop to prevent index out of bounds (avoids repetition)
      wordObj = matchedWords[idx % matchedWords.length];
    }

    setCurrentWord(wordObj);
    setSelectedPrefix(null);
    setSelectedRoot(null);
    setSelectedSuffix(null);
    setGateState("locked");
    setupDecks(wordObj);
  }, [setupDecks]);

  const handleStart = (diff: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(diff);
    setScore(0);
    setLevelIndex(0);
    setGameFinished(false);
    setCoinsEarned(0);
    audioEngine.playMove();
    loadWord(diff, 0);

    window.dispatchEvent(new CustomEvent('lingoland_game_started_hijack'));
  };

  const handleMuteToggle = () => {
    const nextMute = audioEngine.toggleMute();
    setIsMuted(nextMute);
  };

  const handleResetSlots = () => {
    audioEngine.playMove();
    setSelectedPrefix(null);
    setSelectedRoot(null);
    setSelectedSuffix(null);
  };

  // Evaluate word assembly
  const handleDecode = () => {
    if (!currentWord) return;

    // Check if slots are filled (roots are mandatory, prefixes/suffixes can be empty if word demands it)
    if (!selectedRoot) {
      setGateState("shaking");
      audioEngine.playIncorrect();
      setTimeout(() => setGateState("locked"), 800);
      return;
    }

    const compiledPrefix = (selectedPrefix === "[None]" || !selectedPrefix) ? "" : selectedPrefix;
    const compiledSuffix = (selectedSuffix === "[None]" || !selectedSuffix) ? "" : selectedSuffix;

    const isMatch = 
      compiledPrefix === currentWord.prefix &&
      selectedRoot === currentWord.root &&
      compiledSuffix === currentWord.suffix;

    if (isMatch) {
      setGateState("unlocking");
      audioEngine.playCorrect();
      setScore(prev => prev + 1);

      const reward = isDaily ? (difficulty === "beginner" ? 1.5 : difficulty === "intermediate" ? 3.0 : 5.0) : 0;
      setCoinsEarned(prev => prev + reward);
      window.dispatchEvent(new CustomEvent('lingoland_game_answered_hijack'));

      setTimeout(() => {
        setGateState("opened");
      }, 1000);

      setTimeout(() => {
        const nextIdx = levelIndex + 1;
        if (nextIdx >= 5) {
          setGameFinished(true);
          audioEngine.playLevelSuccess();
          window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
            detail: { state: 'finished' }
          }));
        } else {
          setLevelIndex(nextIdx);
          loadWord(difficulty!, nextIdx);
        }
      }, 2200);
    } else {
      setGateState("shaking");
      audioEngine.playIncorrect();
      setTimeout(() => setGateState("locked"), 1000);
    }
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col justify-between relative overflow-hidden transition-all duration-500",
        isFullscreen
          ? "min-h-screen h-screen rounded-none border-none p-6 sm:p-8 bg-[#1a120b] text-amber-100"
          : "min-h-[calc(100vh-8rem)] lg:min-h-[580px] rounded-3xl p-6 border border-amber-900/35 shadow-2xl bg-[#1a120b] text-amber-100"
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.1),transparent)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-amber-950 pb-4 z-10">
        <div className="flex items-center gap-3">
          {difficulty ? (
            <button
              onClick={() => setDifficulty(null)}
              className="p-2 hover:bg-[#2c1d11] rounded-xl transition border border-amber-900/30"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400" />
            </button>
          ) : (
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-250 bg-clip-text text-transparent">
              Etymology Expedition
            </h1>
            <p className="text-[10px] text-amber-400/70 font-medium">Decode ancient ruins by building morphological words</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHelp(true)}
            className="h-9 w-9 text-amber-400 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMuteToggle}
            className="h-9 w-9 text-amber-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </Button>
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-9 w-9 text-amber-400 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-grow flex flex-col justify-center items-center py-4 z-10">
        <AnimatePresence mode="wait">
          {!difficulty ? (
            /* Select Difficulty */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-md text-center flex flex-col gap-6"
              key="difficulty-selection"
            >
              <div className="space-y-2">
                <Compass className="h-12 w-12 text-amber-400 mx-auto animate-pulse" />
                <h2 className="text-2xl font-black tracking-tight uppercase">Select Expedition Ruins</h2>
                <p className="text-sm text-amber-400/60 font-medium">Solve the morphological glyphs to slide open the temple gates.</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleStart("beginner")}
                  className="w-full bg-[#24170d]/60 border border-amber-950 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">Ruins of Giza</span>
                    <h3 className="font-bold text-slate-200">Beginner - Basic Affixes</h3>
                    <p className="text-xs text-amber-400/50 mt-0.5">Simple English roots with common prefixes or suffixes</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-amber-600 group-hover:text-amber-400 transition" />
                </button>

                <button
                  onClick={() => handleStart("intermediate")}
                  className="w-full bg-[#24170d]/60 border border-amber-950 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">Petra Subtropolis</span>
                    <h3 className="font-bold text-slate-200">Intermediate - Latin Derivatives</h3>
                    <p className="text-xs text-amber-400/50 mt-0.5">Latin roots with prefix-suffix combinations</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-amber-600 group-hover:text-amber-400 transition" />
                </button>

                <button
                  onClick={() => handleStart("advanced")}
                  className="w-full bg-[#24170d]/60 border border-amber-950 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">Athens Temple</span>
                    <h3 className="font-bold text-slate-200">Advanced - Greek Etymology</h3>
                    <p className="text-xs text-amber-400/50 mt-0.5">Greek/Latin roots, double prefixes, complex morphology</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-amber-600 group-hover:text-amber-400 transition" />
                </button>
              </div>
            </motion.div>
          ) : gameFinished ? (
            /* Finished screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md space-y-6"
              key="game-finished"
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg animate-pulse">
                <Key className="h-10 w-10 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Ancient Vault Decoded!</h2>
                <p className="text-sm text-amber-400/60 font-medium">All hieroglyphic doors solved. The treasure chamber is open!</p>
              </div>

              <div className={cn("bg-[#26180e] border border-amber-950 p-5 rounded-2xl grid gap-4", isDaily ? "grid-cols-2" : "grid-cols-1")}>
                <div className={cn("text-center", isDaily && "border-r border-amber-950/60")}>
                  <span className="text-[10px] uppercase font-black text-amber-400">Vaults Opened</span>
                  <p className="text-3xl font-black text-slate-100">{score}/5</p>
                </div>
                {isDaily && (
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-black text-amber-400 font-mono">Coins Claimed</span>
                    <p className="text-3xl font-black text-amber-400 flex items-center justify-center gap-1">
                      <Coins className="h-6 w-6 fill-amber-400 text-amber-500" />
                      +{coinsEarned.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDifficulty(null)}
                  className="flex-grow py-3 rounded-xl bg-[#26180e] border border-amber-900/30 text-sm font-black uppercase tracking-wider hover:bg-[#332215] transition"
                >
                  Change Level
                </button>
                <button
                  onClick={() => handleStart(difficulty)}
                  className="flex-grow py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 transition"
                >
                  Expedite Again
                </button>
              </div>
            </motion.div>
          ) : (
            /* Active Game */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col gap-6"
              key="active-game"
            >
              {/* Progress and Coin Stats */}
              <div className="flex justify-between items-center bg-[#24170d]/60 border border-amber-950 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-amber-400/80">Ruined Gate</span>
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/10">
                    {levelIndex + 1} / 5
                  </span>
                </div>

                {isDaily ? (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Coins className="h-4 w-4 fill-amber-400 text-amber-500" />
                    <span className="text-xs font-bold font-mono">+{coinsEarned.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="w-12" />
                )}
              </div>

              {/* Temple Gate & Slate Canvas */}
              <div className="relative w-full h-48 bg-[#21150c]/80 border border-amber-950/60 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
                {/* Ancient Temple Pillars */}
                <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-amber-950 bg-[repeating-linear-gradient(45deg,#24170d,#24170d_10px,#1a1008_10px,#1a1008_20px)] opacity-40" />
                <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-amber-950 bg-[repeating-linear-gradient(45deg,#24170d,#24170d_10px,#1a1008_10px,#1a1008_20px)] opacity-40" />

                {/* Sliding door animation panels */}
                <motion.div
                  animate={
                    gateState === "unlocking" ? { x: -80, opacity: 0.8 } :
                    gateState === "opened" ? { x: -140, opacity: 0 } :
                    gateState === "shaking" ? { x: [-4, 4, -4, 4, 0] } : { x: 0, opacity: 1 }
                  }
                  transition={{ duration: gateState === "unlocking" ? 0.8 : 0.4 }}
                  className="absolute left-8 right-1/2 top-0 bottom-0 bg-[#291e14] border-r border-amber-900/30 flex items-center justify-end pr-4 z-20 shadow-md shadow-black/80"
                >
                  <div className="w-1.5 h-16 bg-amber-950 border border-amber-900/40 rounded-full" />
                </motion.div>
                <motion.div
                  animate={
                    gateState === "unlocking" ? { x: 80, opacity: 0.8 } :
                    gateState === "opened" ? { x: 140, opacity: 0 } :
                    gateState === "shaking" ? { x: [-4, 4, -4, 4, 0] } : { x: 0, opacity: 1 }
                  }
                  transition={{ duration: gateState === "unlocking" ? 0.8 : 0.4 }}
                  className="absolute right-8 left-1/2 top-0 bottom-0 bg-[#291e14] border-l border-amber-900/30 flex items-center justify-start pl-4 z-20 shadow-md shadow-black/80"
                >
                  <div className="w-1.5 h-16 bg-amber-950 border border-amber-900/40 rounded-full" />
                </motion.div>

                {/* Inside Temple Reveal: Success Graphic */}
                {gateState === "opened" && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="z-10 flex flex-col items-center gap-1.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-black uppercase text-emerald-400 font-mono tracking-widest">Door Unlocked!</span>
                    <p className="text-[10px] text-slate-400 italic">"{currentWord?.funFact || "Morphological lock opened."}"</p>
                  </motion.div>
                )}

                {/* Definition Glyph Display */}
                {gateState !== "opened" && (
                  <div className="absolute top-4 left-10 right-10 text-center z-10 bg-[#160e08]/90 border border-amber-950 p-3 rounded-2xl">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono">Tomb Translation:</span>
                    </div>
                    <p className="text-xs text-amber-100 font-bold leading-normal">{currentWord?.definition}</p>
                  </div>
                )}

                {/* Active Slots Display */}
                {gateState !== "opened" && (
                  <div className="absolute bottom-4 left-10 right-10 flex justify-center gap-3 z-10">
                    {/* Prefix Slot */}
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={() => setSelectedPrefix(null)}
                        className={`w-20 h-10 rounded-lg border border-dashed flex items-center justify-center text-xs font-mono font-black uppercase tracking-wider relative cursor-pointer ${
                          selectedPrefix 
                            ? "bg-amber-500/10 border-amber-400 text-amber-300" 
                            : "border-amber-950 text-amber-950 hover:border-amber-900/40 hover:text-amber-900"
                        }`}
                      >
                        {selectedPrefix ? `${selectedPrefix}-` : "Prefix"}
                      </div>
                    </div>

                    {/* Root Slot */}
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={() => setSelectedRoot(null)}
                        className={`w-20 h-10 rounded-lg border border-dashed flex items-center justify-center text-xs font-mono font-black uppercase tracking-wider relative cursor-pointer ${
                          selectedRoot 
                            ? "bg-amber-500/15 border-amber-400 text-amber-350 font-black" 
                            : "border-amber-950 text-amber-950 hover:border-amber-900/40 hover:text-amber-900"
                        }`}
                      >
                        {selectedRoot ? `-${selectedRoot}-` : "Root"}
                      </div>
                    </div>

                    {/* Suffix Slot */}
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={() => setSelectedSuffix(null)}
                        className={`w-20 h-10 rounded-lg border border-dashed flex items-center justify-center text-xs font-mono font-black uppercase tracking-wider relative cursor-pointer ${
                          selectedSuffix 
                            ? "bg-amber-500/10 border-amber-400 text-amber-300" 
                            : "border-amber-950 text-amber-950 hover:border-amber-900/40 hover:text-amber-900"
                        }`}
                      >
                        {selectedSuffix ? `-${selectedSuffix}` : "Suffix"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selection cards board */}
              <div className="space-y-4 pt-2">
                {/* Prefix selector */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 font-mono">Available Prefixes</span>
                  <div className="flex gap-2 flex-wrap">
                    {prefixDeck.map((p) => (
                      <button
                        key={p}
                        disabled={selectedPrefix === p || gateState !== "locked"}
                        onClick={() => { audioEngine.playMove(); setSelectedPrefix(p); }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-black transition-all active:scale-95 duration-150 relative group ${
                          selectedPrefix === p 
                            ? "bg-[#18110b] border-amber-950 text-amber-950 scale-95 cursor-not-allowed opacity-30" 
                            : "bg-[#2d1f14] border-amber-900/40 text-amber-250 hover:border-amber-500"
                        }`}
                      >
                        {p}
                        {/* Custom tooltip hover */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-[#120b06] border border-amber-950 text-amber-300 text-[8px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap">
                          {PART_MEANINGS[p] || "unknown"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Root selector */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 font-mono">Available Roots (Core meaning)</span>
                  <div className="flex gap-2 flex-wrap">
                    {rootDeck.map((r) => (
                      <button
                        key={r}
                        disabled={selectedRoot === r || gateState !== "locked"}
                        onClick={() => { audioEngine.playMove(); setSelectedRoot(r); }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-black transition-all active:scale-95 duration-150 relative group ${
                          selectedRoot === r 
                            ? "bg-[#18110b] border-amber-950 text-amber-950 scale-95 cursor-not-allowed opacity-30" 
                            : "bg-[#332215] border-amber-900/40 text-amber-200 hover:border-amber-400"
                        }`}
                      >
                        {r}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-[#120b06] border border-amber-950 text-amber-300 text-[8px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap">
                          {PART_MEANINGS[r] || "unknown"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suffix selector */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 font-mono">Available Suffixes</span>
                  <div className="flex gap-2 flex-wrap">
                    {suffixDeck.map((s) => (
                      <button
                        key={s}
                        disabled={selectedSuffix === s || gateState !== "locked"}
                        onClick={() => { audioEngine.playMove(); setSelectedSuffix(s); }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-black transition-all active:scale-95 duration-150 relative group ${
                          selectedSuffix === s 
                            ? "bg-[#18110b] border-amber-950 text-amber-950 scale-95 cursor-not-allowed opacity-30" 
                            : "bg-[#2d1f14] border-amber-900/40 text-amber-250 hover:border-amber-500"
                        }`}
                      >
                        {s}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-[#120b06] border border-amber-950 text-amber-300 text-[8px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap">
                          {PART_MEANINGS[s] || "unknown"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action layout */}
              <div className="flex items-center gap-3 pt-3 border-t border-amber-950/60">
                <button
                  onClick={handleResetSlots}
                  disabled={gateState !== "locked"}
                  className="px-4 py-2.5 rounded-xl border border-amber-905 hover:bg-[#2c1d11] text-xs font-black uppercase text-amber-500 hover:text-white transition disabled:opacity-50"
                >
                  Clear Slate
                </button>

                <button
                  onClick={handleDecode}
                  disabled={!selectedRoot || gateState !== "locked"}
                  className={`flex-grow py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md ${
                    selectedRoot && gateState === "locked"
                      ? "bg-gradient-to-r from-amber-500 to-orange-550 hover:scale-[1.01] text-slate-950"
                      : "bg-[#2a1b10] border border-amber-950 text-amber-950/45 cursor-not-allowed shadow-none"
                  }`}
                >
                  {gateState === "unlocking" ? "Unlocking Gate..." : "Decode Glyphs"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Help Overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0e0a06]/98 z-50 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-amber-950 pb-2">
                <HelpCircle className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-black">Explorer Translation Guide</h3>
              </div>

              <div className="space-y-3 text-xs text-amber-100/90 leading-relaxed overflow-y-auto max-h-[360px]">
                <p>Welcome, Expedition Leader! Your objective is to rebuild words from their morphological parts to match the translation prompts on the ancient stone slab.</p>
                
                <div className="bg-[#1f150e] p-3 rounded-lg border border-amber-950 space-y-2">
                  <span className="font-bold text-amber-400 block font-mono">Morphology Blueprint:</span>
                  <p>1. **Prefixes**: Attached to the front of a word to alter its direction or negation (e.g. `re-` = again).</p>
                  <p>2. **Roots**: The core semantic meaning of the word (e.g. `-struct-` = build).</p>
                  <p>3. **Suffixes**: Appended to the end to change tense, part of speech, or agent (e.g. `-ion` = act/state).</p>
                </div>

                <ul className="list-disc pl-4 space-y-1.5">
                  <li>Read the translation prompt and hover over runes at the bottom to inspect their semantic meanings.</li>
                  <li>Click available parts to slide them into the tablet slots. Note: Some words do not require prefixes or suffixes, so choose the **[None]** rune!</li>
                  <li>Click **Decode Glyphs** once the slots are set. A correct solution slides open the ruins gates to advance.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black uppercase text-slate-350 hover:bg-slate-850 transition mt-4"
            >
              Return to Ruins
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
