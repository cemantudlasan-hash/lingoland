"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, RotateCcw, Volume2, VolumeX, Maximize2, HelpCircle, 
  ChevronRight, Coins, Flame, ArrowLeft, Lightbulb, Play, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { audioEngine } from "../AudioEngine";
import { EQUATION_ALCHEMIST_DATA, AlchemistChallenge } from "@/lib/new-games-data";
import { getDailyMissions, getDailyBonusGame } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Token = { type: 'number'; value: number } | { type: 'operator'; value: string };

export function EquationAlchemist({ slug, onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<AlchemistChallenge | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
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
  const [availableNumbers, setAvailableNumbers] = useState<{ id: string; value: number; used: boolean }[]>([]);
  const [availableOperators, setAvailableOperators] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [cauldronState, setCauldronState] = useState<"idle" | "brewing" | "success" | "fail">("idle");
  const [expressionValue, setExpressionValue] = useState<number | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // Parse and safely evaluate mathematical expression built of tokens using Shunting-Yard
  const evaluateTokens = useCallback((tokens: Token[]): number | null => {
    try {
      if (tokens.length === 0) return null;

      // Basic grammar check: operator cannot be first or last (unless it is parentheses)
      // and cannot have consecutive numbers or operators (except parentheses)
      let openParens = 0;
      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok.type === 'operator') {
          if (tok.value === '(') openParens++;
          else if (tok.value === ')') {
            openParens--;
            if (openParens < 0) return null;
          }
        }
      }
      if (openParens !== 0) return null;

      const outputQueue: any[] = [];
      const operatorStack: string[] = [];
      const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok.type === 'number') {
          outputQueue.push(tok.value);
        } else if (tok.value === '(') {
          operatorStack.push('(');
        } else if (tok.value === ')') {
          while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
            outputQueue.push(operatorStack.pop());
          }
          operatorStack.pop(); // Remove '('
        } else {
          while (
            operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1] !== '(' &&
            precedence[operatorStack[operatorStack.length - 1]] >= precedence[tok.value]
          ) {
            outputQueue.push(operatorStack.pop());
          }
          operatorStack.push(tok.value);
        }
      }

      while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op === '(' || op === ')') return null;
        outputQueue.push(op);
      }

      const stack: number[] = [];
      for (let i = 0; i < outputQueue.length; i++) {
        const val = outputQueue[i];
        if (typeof val === 'number') {
          stack.push(val);
        } else {
          if (stack.length < 2) return null;
          const b = stack.pop()!;
          const a = stack.pop()!;
          if (val === '+') stack.push(a + b);
          else if (val === '-') stack.push(a - b);
          else if (val === '*') stack.push(a * b);
          else if (val === '/') {
            if (b === 0) return null;
            stack.push(a / b);
          }
        }
      }

      if (stack.length !== 1) return null;
      return parseFloat(stack[0].toFixed(2));
    } catch (e) {
      return null;
    }
  }, []);

  // Update live evaluation whenever the expression changes
  useEffect(() => {
    const value = evaluateTokens(selectedTokens);
    setExpressionValue(value);
  }, [selectedTokens, evaluateTokens]);

  // Procedural generator to generate solvable challenges of specific difficulty
  const generateProceduralChallenge = useCallback((diff: "beginner" | "intermediate" | "advanced", index: number): AlchemistChallenge => {
    let numbers: number[] = [];
    let target = 0;
    let operators: string[] = [];

    if (diff === "beginner") {
      // 3 numbers, simple + and -
      const n1 = Math.floor(Math.random() * 8) + 2;
      const n2 = Math.floor(Math.random() * 8) + 2;
      const n3 = Math.floor(Math.random() * 8) + 2;
      numbers = [n1, n2, n3];
      const op1 = Math.random() > 0.5 ? "+" : "-";
      const op2 = Math.random() > 0.5 ? "+" : "-";
      
      let temp = n1;
      if (op1 === "+") temp += n2; else temp -= n2;
      if (op2 === "+") temp += n3; else temp -= n3;
      
      // Make sure target is positive and within range
      if (temp <= 0) {
        target = n1 + n2 + n3;
      } else {
        target = temp;
      }
    } else if (diff === "intermediate") {
      // 4 numbers, +, -, * and brackets
      const n1 = Math.floor(Math.random() * 12) + 2;
      const n2 = Math.floor(Math.random() * 8) + 2;
      const n3 = Math.floor(Math.random() * 6) + 2;
      const n4 = Math.floor(Math.random() * 5) + 1;
      numbers = [n1, n2, n3, n4];
      
      // Target could be structured like (n1 + n2) * n3 - n4
      target = (n1 + n2) * n3 - n4;
      if (target <= 0 || target > 200) {
        target = n1 * n2 + n3 - n4;
      }
    } else {
      // Advanced: 4-5 numbers, +, -, *, /, brackets
      const n1 = Math.floor(Math.random() * 20) + 5;
      const n2 = Math.floor(Math.random() * 10) + 2;
      const n3 = Math.floor(Math.random() * 8) + 2;
      const n4 = Math.floor(Math.random() * 6) + 2;
      const n5 = Math.floor(Math.random() * 4) + 1;
      numbers = [n1, n2, n3, n4, n5];
      
      target = Math.floor(((n1 - n2) * n3 + n4) / n5);
      if (target <= 0 || target > 300) {
        target = (n1 + n2) * n3 - n4 * n5;
      }
    }

    return {
      id: `ea-gen-${diff}-${index}`,
      numbers,
      target,
      difficulty: diff,
      hints: ["Trust your alchemist training!", `Combine components to synthesize exactly ${target}.`]
    };
  }, []);

  // Load challenge based on difficulty and level index
  const loadChallenge = useCallback((diff: "beginner" | "intermediate" | "advanced", index: number) => {
    // Filter standard challenges
    const standardMatches = EQUATION_ALCHEMIST_DATA.filter(c => c.difficulty === diff);
    let challenge: AlchemistChallenge;

    if (index < standardMatches.length) {
      challenge = standardMatches[index];
    } else {
      // Generate dynamically to avoid repetition
      challenge = generateProceduralChallenge(diff, index);
    }

    setCurrentChallenge(challenge);
    setAvailableNumbers(challenge.numbers.map((n, i) => ({ id: `num-${i}`, value: n, used: false })));
    setShowHint(false);
    setSelectedTokens([]);
    setCauldronState("idle");

    // Configure available operator reagents based on difficulty
    if (diff === "beginner") {
      setAvailableOperators(["+", "-"]);
    } else if (diff === "intermediate") {
      setAvailableOperators(["+", "-", "*", "(", ")"]);
    } else {
      setAvailableOperators(["+", "-", "*", "/", "(", ")"]);
    }
  }, [generateProceduralChallenge]);

  // Start game with difficulty
  const handleStart = (diff: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(diff);
    setScore(0);
    setLevelIndex(0);
    setGameFinished(false);
    setCoinsEarned(0);
    audioEngine.playMove();
    loadChallenge(diff, 0);

    // Track game started for analytics
    window.dispatchEvent(new CustomEvent('lingoland_game_started_hijack'));
  };

  const handleMuteToggle = () => {
    const nextMute = audioEngine.toggleMute();
    setIsMuted(nextMute);
  };

  // Add a number to expression
  const addNumberToken = (numId: string, val: number) => {
    audioEngine.playMove();
    setAvailableNumbers(prev => prev.map(n => n.id === numId ? { ...n, used: true } : n));
    setSelectedTokens(prev => [...prev, { type: 'number', value: val }]);
  };

  // Add an operator to expression
  const addOperatorToken = (op: string) => {
    audioEngine.playMove();
    setSelectedTokens(prev => [...prev, { type: 'operator', value: op }]);
  };

  // Remove last token
  const handleUndo = () => {
    if (selectedTokens.length === 0) return;
    audioEngine.playMove();
    const lastToken = selectedTokens[selectedTokens.length - 1];
    setSelectedTokens(prev => prev.slice(0, -1));

    if (lastToken.type === 'number') {
      // Find the first matching number in availability that is currently marked used and restore it
      setAvailableNumbers(prev => {
        const indexToRestore = prev.findIndex(n => n.value === lastToken.value && n.used);
        if (indexToRestore !== -1) {
          return prev.map((n, i) => i === indexToRestore ? { ...n, used: false } : n);
        }
        return prev;
      });
    }
  };

  // Clear expression
  const handleClear = () => {
    audioEngine.playMove();
    setSelectedTokens([]);
    setAvailableNumbers(prev => prev.map(n => ({ ...n, used: false })));
  };

  // Transmute (Submit solution)
  const handleTransmute = () => {
    if (!currentChallenge) return;
    
    // In advanced mode, all numbers must be used
    if (difficulty === "advanced" && availableNumbers.some(n => !n.used)) {
      setCauldronState("fail");
      audioEngine.playIncorrect();
      setTimeout(() => setCauldronState("idle"), 1200);
      return;
    }

    setCauldronState("brewing");
    
    setTimeout(() => {
      if (expressionValue === currentChallenge.target) {
        // Success
        setCauldronState("success");
        audioEngine.playCorrect();
        setScore(prev => prev + 1);

        // Add drops based on difficulty (only if it is daily mission)
        const coinsReward = isDaily ? (difficulty === "beginner" ? 1.5 : difficulty === "intermediate" ? 3.0 : 5.0) : 0;
        setCoinsEarned(prev => prev + coinsReward);

        // Track answer event
        window.dispatchEvent(new CustomEvent('lingoland_game_answered_hijack'));

        setTimeout(() => {
          const nextIndex = levelIndex + 1;
          if (nextIndex >= 5) {
            // End Game after 5 levels
            setGameFinished(true);
            audioEngine.playLevelSuccess();
            window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
              detail: { state: 'finished' }
            }));
          } else {
            setLevelIndex(nextIndex);
            loadChallenge(difficulty!, nextIndex);
          }
        }, 1500);
      } else {
        // Fail
        setCauldronState("fail");
        audioEngine.playIncorrect();
        setTimeout(() => setCauldronState("idle"), 1500);
      }
    }, 1200);
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col justify-between relative overflow-hidden transition-all duration-500",
        isFullscreen
          ? "min-h-screen h-screen rounded-none border-none p-6 sm:p-8 bg-slate-950 text-white"
          : "min-h-[calc(100vh-112px)] rounded-3xl p-6 border border-slate-800 shadow-2xl bg-slate-950 text-white"
      )}
    >
      {/* Background Star field effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 z-10">
        <div className="flex items-center gap-3">
          {difficulty ? (
            <button
              onClick={() => setDifficulty(null)}
              className="p-2 hover:bg-slate-900 rounded-xl transition border border-slate-800/60"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Equation Alchemist
            </h1>
            <p className="text-[10px] text-slate-400">Brew mathematical solutions using PEMDAS reagents</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHelp(true)}
            className="h-9 w-9 text-slate-400 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMuteToggle}
            className="h-9 w-9 text-slate-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </Button>
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-9 w-9 text-slate-400 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-grow flex flex-col justify-center items-center py-6 z-10">
        <AnimatePresence mode="wait">
          {!difficulty ? (
            /* Choose Difficulty screen */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-md text-center flex flex-col gap-6"
              key="difficulty-selection"
            >
              <div className="space-y-2">
                <Flame className="h-12 w-12 text-indigo-400 mx-auto animate-pulse" />
                <h2 className="text-2xl font-black tracking-tight">Select Transmutation Level</h2>
                <p className="text-sm text-slate-400">Choose your difficulty level.{isDaily && " Higher difficulties offer greater coin drops."}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleStart("beginner")}
                  className="w-full bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Beginner</span>
                    <h3 className="font-bold text-slate-200">Novice Cauldron</h3>
                    <p className="text-xs text-slate-500 mt-0.5">3 numbers, basic addition & subtraction (+, -)</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition" />
                </button>

                <button
                  onClick={() => handleStart("intermediate")}
                  className="w-full bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Intermediate</span>
                    <h3 className="font-bold text-slate-200">Adept Alchemist</h3>
                    <p className="text-xs text-slate-500 mt-0.5">4 numbers, adds multiplication & brackets (*, (), +, -)</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition" />
                </button>

                <button
                  onClick={() => handleStart("advanced")}
                  className="w-full bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="text-left">
                    <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Advanced</span>
                    <h3 className="font-bold text-slate-200">Grand Magister</h3>
                    <p className="text-xs text-slate-500 mt-0.5">5 numbers, all operators (+, -, *, /), must use all numbers</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-rose-400 transition" />
                </button>
              </div>
            </motion.div>
          ) : gameFinished ? (
            /* Game completed screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md space-y-6"
              key="game-finished"
            >
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center justify-center mx-auto shadow-lg">
                <Sparkles className="h-10 w-10 text-indigo-400 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Transmutation Complete!</h2>
                <p className="text-sm text-slate-400">All cauldron potion goals solved with mathematical precision.</p>
              </div>

              <div className={cn("bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl grid gap-4", isDaily ? "grid-cols-2" : "grid-cols-1")}>
                <div className={cn("text-center", isDaily && "border-r border-slate-800")}>
                  <span className="text-[10px] uppercase font-black text-indigo-400">Potions Brewed</span>
                  <p className="text-3xl font-black text-slate-100">{score}/5</p>
                </div>
                {isDaily && (
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-black text-amber-400">Lingo Coins Drops</span>
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
                  className="flex-grow py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black uppercase tracking-wider hover:bg-slate-850 transition"
                >
                  Change Level
                </button>
                <button
                  onClick={() => handleStart(difficulty)}
                  className="flex-grow py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-95 transition"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          ) : (
            /* Active Game Screen */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col gap-6"
              key="active-game"
            >
              {/* Progress and Target stats */}
              <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Potion</span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/10">
                    {levelIndex + 1} / 5
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-1.5 rounded-full shadow-inner">
                  <span className="text-xs text-indigo-300 font-extrabold uppercase">Target Value:</span>
                  <span className="text-lg font-black text-indigo-400 font-mono">{currentChallenge?.target}</span>
                </div>

                {isDaily ? (
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 fill-amber-400 text-amber-500" />
                    <span className="text-xs text-amber-400 font-bold">+{coinsEarned.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="w-16" />
                )}
              </div>

              {/* Cauldron Visual Area */}
              <div className="relative w-full h-44 bg-slate-900/20 border border-slate-850 rounded-3xl flex flex-col items-center justify-center overflow-hidden shadow-inner">
                {/* Cauldron Brewing smoke particles */}
                {cauldronState === "brewing" && (
                  <div className="absolute bottom-16 flex justify-center gap-2">
                    <motion.div animate={{ y: -60, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.0 }} className="w-3 h-3 bg-purple-500 rounded-full blur-sm" />
                    <motion.div animate={{ y: -70, opacity: 0 }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-4 h-4 bg-indigo-500 rounded-full blur-sm" />
                    <motion.div animate={{ y: -65, opacity: 0 }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.4 }} className="w-2.5 h-2.5 bg-pink-500 rounded-full blur-sm" />
                  </div>
                )}
                {cauldronState === "success" && (
                  <div className="absolute bottom-16 flex justify-center">
                    <motion.div animate={{ scale: [1, 2], opacity: 0 }} className="w-16 h-16 bg-emerald-500 rounded-full blur-md" />
                  </div>
                )}

                {/* Cauldron Body */}
                <motion.div 
                  animate={
                    cauldronState === "brewing" ? { y: [0, -4, 0], rotate: [-1, 1, -1] } : 
                    cauldronState === "success" ? { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] } :
                    cauldronState === "fail" ? { x: [-5, 5, -5, 5, 0] } : {}
                  }
                  transition={{ duration: 0.4, repeat: cauldronState === "brewing" ? Infinity : 0 }}
                  className="relative w-28 h-24 mt-2"
                >
                  {/* Potion fluid at top of cauldron */}
                  <div className={`absolute top-1 left-2.5 right-2.5 h-4 rounded-full blur-[1px] transition-colors duration-500 z-10 ${
                    cauldronState === "success" ? "bg-emerald-400" :
                    cauldronState === "fail" ? "bg-rose-500" :
                    cauldronState === "brewing" ? "bg-indigo-400" : "bg-purple-650"
                  }`}>
                    {/* Bubbles */}
                    <div className="absolute inset-0 flex justify-around items-center">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-ping" />
                      <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce delay-100" />
                    </div>
                  </div>

                  {/* Cauldron Metal Container */}
                  <div className="w-full h-full bg-slate-900 rounded-b-[40px] rounded-t-[10px] border-[3px] border-slate-750 shadow-lg relative flex flex-col justify-center items-center">
                    <div className="w-30 h-3 bg-slate-800 rounded-full absolute -top-1 border border-slate-700 shadow-md" />
                    {/* Cauldron Emblem */}
                    <Flame className={`h-6 w-6 mt-2 transition-colors duration-500 ${
                      cauldronState === "success" ? "text-emerald-400 fill-emerald-500/20" :
                      cauldronState === "fail" ? "text-rose-500 fill-rose-500/20" :
                      cauldronState === "brewing" ? "text-indigo-400 animate-pulse" : "text-purple-400/50"
                    }`} />
                  </div>
                </motion.div>

                {/* Live Formula Display */}
                <div className="absolute top-3 left-3 right-3 text-center min-h-[36px]">
                  {selectedTokens.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center items-center">
                      {selectedTokens.map((t, idx) => (
                        <span 
                          key={idx}
                          className={`text-sm px-2 py-0.5 rounded-lg font-mono font-bold shadow-sm ${
                            t.type === 'number' 
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {t.value}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Drag or click reagents below to fill cauldron...</span>
                  )}
                </div>

                {/* Evaluated Value HUD */}
                <div className="absolute bottom-2.5 right-4 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Current Yield:</span>
                  <span className={`text-sm font-black font-mono tracking-wider ${
                    expressionValue === currentChallenge?.target ? "text-emerald-400 animate-pulse" :
                    expressionValue === null ? "text-slate-500" : "text-amber-400"
                  }`}>
                    {expressionValue !== null ? expressionValue : "?"}
                  </span>
                </div>

                {/* Hint Button */}
                <button
                  onClick={() => setShowHint(prev => !prev)}
                  className="absolute bottom-2 left-4 text-xs font-black text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Hint
                </button>
              </div>

              {/* Hint Text Area */}
              {showHint && currentChallenge && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-3.5 text-xs text-indigo-300 flex items-start gap-2.5"
                >
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black uppercase tracking-wider block mb-1">Alchemy Secret:</span>
                    <p>{currentChallenge.hints[score % currentChallenge.hints.length]}</p>
                  </div>
                </motion.div>
              )}

              {/* Formula Building Block Panel */}
              <div className="space-y-4">
                {/* Numbers Deck */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Material Numbers (Use once)</span>
                  <div className="flex gap-2.5 flex-wrap">
                    {availableNumbers.map((n) => (
                      <button
                        key={n.id}
                        disabled={n.used || cauldronState === "brewing"}
                        onClick={() => addNumberToken(n.id, n.value)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-extrabold text-base border transition-all duration-200 active:scale-95 ${
                          n.used 
                            ? "bg-slate-900 border-slate-905 text-slate-650 opacity-40 cursor-not-allowed scale-95" 
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/40 hover:-translate-y-0.5 shadow-md shadow-indigo-950/20"
                        }`}
                      >
                        {n.value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operators Reagents Deck */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Operator Reagents</span>
                  <div className="flex gap-2.5 flex-wrap">
                    {availableOperators.map((op) => (
                      <button
                        key={op}
                        disabled={cauldronState === "brewing"}
                        onClick={() => addOperatorToken(op)}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-850 hover:-translate-y-0.5 text-slate-300 font-mono font-bold text-base transition-all duration-200 active:scale-95 shadow-sm"
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cauldron Action HUD */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-900">
                <button
                  onClick={handleClear}
                  disabled={cauldronState === "brewing"}
                  className="px-4 py-2.5 rounded-xl border border-slate-850 hover:bg-slate-900 text-xs font-black uppercase text-slate-400 hover:text-white transition disabled:opacity-50"
                >
                  Dump Mix
                </button>
                <button
                  onClick={handleUndo}
                  disabled={selectedTokens.length === 0 || cauldronState === "brewing"}
                  className="p-2.5 rounded-xl border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition disabled:opacity-50 flex items-center justify-center"
                  title="Undo last token"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={handleTransmute}
                  disabled={selectedTokens.length === 0 || cauldronState === "brewing" || expressionValue === null}
                  className={`flex-grow py-3 rounded-xl text-slate-950 font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-md ${
                    expressionValue === currentChallenge?.target && cauldronState !== "brewing"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:scale-[1.02] shadow-emerald-950/20"
                      : "bg-indigo-500 hover:bg-indigo-400 text-slate-950 disabled:bg-slate-850 disabled:text-slate-600 disabled:shadow-none disabled:border-none border border-indigo-400/20"
                  }`}
                >
                  {cauldronState === "brewing" ? "Transmuting..." : "Transmute Potion"}
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
            className="absolute inset-0 bg-slate-950/95 z-50 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <HelpCircle className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-black">Cauldron Lab Instructions</h3>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[360px]">
                <p>Welcome to the Alchemist Laboratory! Your objective is to formulate mathematical equations that evaluate exactly to the target value.</p>
                
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 block">PEMDAS Rules Apply:</span>
                  <p>Operations are evaluated in standard precedence order: Brackets <code className="text-slate-200">()</code> first, then Multiplication <code className="text-slate-200">*</code> and Division <code className="text-slate-200">/</code>, then Addition <code className="text-slate-200">+</code> and Subtraction <code className="text-slate-200">-</code>.</p>
                </div>

                <ul className="list-disc pl-4 space-y-1.5">
                  <li>Select **Material Numbers** from the inventory deck. Each number card can be added to the cauldron only once.</li>
                  <li>Intersperse **Operator Reagents** to string them into expressions. Operator runes can be used infinitely.</li>
                  <li>Click **Transmute Potion** when the current yield matches the target.</li>
                  <li>In **Advanced Level**, you must use all numbers in the equation to successfully complete the transmutation.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black uppercase text-slate-350 hover:bg-slate-850 transition mt-4"
            >
              Return to Cauldron
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
