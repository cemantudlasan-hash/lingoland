'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Coins, Sparkles, Maximize, Smile, Volume2, ArrowRight } from 'lucide-react';

interface DialogueNode {
  id: number;
  characterText: string;
  expression: 'happy' | 'waving' | 'talking' | 'sad' | 'thinking';
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

const DIALOGUE_NODES: DialogueNode[] = [
  {
    id: 1,
    characterText: "Hello there! Welcome to LingoLand Academy! 🌟 I'm Professor Lexi. How do you do?",
    expression: 'waving',
    options: [
      { text: "How do you do? I'm excited to learn!", isCorrect: true, feedback: "Perfect! 'How do you do?' is a polite, traditional reply to match my greeting." },
      { text: "I do good, and you?", isCorrect: false, feedback: "Not quite. While common, 'I do good' is grammatically informal. 'How do you do?' is the standard response here." },
      { text: "What's up, dude?", isCorrect: false, feedback: "A bit too informal for greeting a teacher or professor in a classroom context!" }
    ]
  },
  {
    id: 2,
    characterText: "Excellent! Let's practice phonics. Which word has the short /æ/ vowel sound as in 'apple'?",
    expression: 'thinking',
    options: [
      { text: "Car 🚗", isCorrect: false, feedback: "Close, but 'Car' has the long /ɑː/ sound." },
      { text: "Cat 🐱", isCorrect: true, feedback: "Spot on! 'Cat' matches the short /æ/ sound perfectly!" },
      { text: "Cake 🍰", isCorrect: false, feedback: "Incorrect. 'Cake' features the long /eɪ/ sound." }
    ]
  },
  {
    id: 3,
    characterText: "Wonderful! If you want to politely interrupt someone to ask a question, what should you say?",
    expression: 'talking',
    options: [
      { text: "Hey! Listen to me!", isCorrect: false, feedback: "Too aggressive and impolite." },
      { text: "Excuse me, may I ask a quick question?", isCorrect: true, feedback: "Outstanding! This is the most polite and natural way to interrupt someone." },
      { text: "Move aside, please.", isCorrect: false, feedback: "Impolite and socially awkward." }
    ]
  }
];

export function CharacterConversations3D({ onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [currentNodeIdx, setCurrentNodeIdx] = React.useState(0);
  const [gameState, setGameState] = React.useState<'idle' | 'playing' | 'feedback' | 'completed'>('idle');
  const [selectedOptionIdx, setSelectedOptionIdx] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [speakActive, setSpeakActive] = React.useState(false);

  const activeNode = DIALOGUE_NODES[currentNodeIdx];

  const handleStart = () => {
    setGameState('playing');
    setCurrentNodeIdx(0);
    setSelectedOptionIdx(null);
    setScore(0);
    
    // Play greeting
    speakText(DIALOGUE_NODES[0].characterText);
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stop previous
      setSpeakActive(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakActive(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionClick = (idx: number) => {
    if (gameState !== 'playing') return;
    setSelectedOptionIdx(idx);
    setGameState('feedback');

    const opt = activeNode.options[idx];
    if (opt.isCorrect) {
      setScore(prev => prev + 30);
    }

    speakText(opt.feedback);
  };

  const handleNext = () => {
    if (currentNodeIdx < DIALOGUE_NODES.length - 1) {
      const nextIdx = currentNodeIdx + 1;
      setCurrentNodeIdx(nextIdx);
      setSelectedOptionIdx(null);
      setGameState('playing');
      speakText(DIALOGUE_NODES[nextIdx].characterText);
    } else {
      setGameState('completed');
      // Trigger coins drop
      window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
        detail: { state: 'finished' }
      }));
    }
  };

  const currentExpression = React.useMemo(() => {
    if (gameState === 'completed') return 'happy';
    if (gameState === 'feedback' && selectedOptionIdx !== null) {
      return activeNode.options[selectedOptionIdx].isCorrect ? 'happy' : 'sad';
    }
    return activeNode.expression;
  }, [gameState, currentNodeIdx, selectedOptionIdx]);

  return (
    <div className="flex flex-col items-center bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[550px]">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-900 pb-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl">
            <MessageSquare className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent">Interactive Character Conversations</h2>
            <p className="text-xs text-slate-400">Talk to Professor Lexi, learn conversational social cues and perfect phonetics!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <button onClick={onToggleFullscreen} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800/50 transition-colors">
              <Maximize className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md my-auto space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 blur opacity-40 animate-pulse" />
              <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
                <MessageSquare className="h-16 w-16 text-purple-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Social Conversations 3D</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interact with highly expressive 3D character avatars! Perfect your pronunciation, learn essential polite expressions, and clear speaking challenges.
              </p>
            </div>
            <button
              onClick={handleStart}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black uppercase text-sm tracking-widest rounded-2xl transition-all shadow-[0_4px_25px_rgba(168,85,247,0.25)] hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Smile className="h-4 w-4" />
              Talk to Lexi
            </button>
          </motion.div>
        )}

        {(gameState === 'playing' || gameState === 'feedback') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-6 z-10"
          >
            {/* Left 3D Character Viewport (Skeletal Avatar) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/60 border border-slate-900 rounded-3xl p-6 relative overflow-hidden min-h-[300px]">
              
              {/* Score HUD */}
              <div className="absolute top-4 left-4 flex gap-1.5 items-center text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full z-20">
                <Coins className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>Score: {score} XP</span>
              </div>

              {/* Vector 3D Character Layout Stage */}
              <div className="w-[180px] h-[200px] flex items-center justify-center relative select-none [perspective:800px] mt-6">
                
                {/* 3D Container */}
                <div 
                  className="relative [transform-style:preserve-3d] w-full h-full flex flex-col items-center justify-center transition-all duration-500"
                  style={{ transform: 'rotateY(-10deg) rotateX(10deg)' }}
                >
                  
                  {/* Stand shadow floor */}
                  <div className="absolute w-28 h-6 bg-slate-900/60 rounded-full blur-[2px] bottom-1" />

                  {/* Character Body Skeletal SVGs */}
                  <div className="w-full flex flex-col items-center justify-center relative [transform-style:preserve-3d]">
                    
                    {/* Head */}
                    <motion.div 
                      animate={
                        currentExpression === 'waving' 
                          ? { rotateZ: [-4, 4, -4], y: [0, -2, 0] } 
                          : currentExpression === 'happy' 
                          ? { y: [0, -6, 0] } 
                          : { y: [0, -1, 0] }
                      }
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border border-purple-400/40 relative flex items-center justify-center shadow-lg"
                    >
                      {/* Glasses */}
                      <div className="absolute top-6 w-14 h-4 flex justify-between px-1 z-10">
                        <div className="w-5.5 h-4 border-2 border-slate-900 rounded-md bg-cyan-400/20" />
                        <div className="w-1.5 h-1 border-b-2 border-slate-900 self-center" />
                        <div className="w-5.5 h-4 border-2 border-slate-900 rounded-md bg-cyan-400/20" />
                      </div>

                      {/* Eyes / Face Expressions */}
                      <div className="absolute top-8 flex gap-5 z-20">
                        {/* Left Eye */}
                        <motion.div 
                          animate={{ scaleY: [1, 0.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 4.5, delay: 0.5 }} 
                          className="w-2 h-2 bg-white rounded-full flex items-center justify-center"
                        >
                          <div className="w-1 h-1 bg-black rounded-full" />
                        </motion.div>

                        {/* Right Eye */}
                        <motion.div 
                          animate={{ scaleY: [1, 0.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 4.5, delay: 0.5 }} 
                          className="w-2 h-2 bg-white rounded-full flex items-center justify-center"
                        >
                          <div className="w-1 h-1 bg-black rounded-full" />
                        </motion.div>
                      </div>

                      {/* Mouth Shape */}
                      <motion.div 
                        animate={
                          speakActive || currentExpression === 'talking'
                            ? { scaleY: [0.3, 1.2, 0.3], borderRadius: ['2px', '50%', '2px'] }
                            : currentExpression === 'happy'
                            ? { scale: 1.1 }
                            : {}
                        }
                        transition={{ repeat: Infinity, duration: 0.25 }}
                        className={cn(
                          "absolute bottom-4 w-4 h-1.5 bg-slate-950 transition-all rounded-full border-t border-red-500/30",
                          currentExpression === 'happy' && "h-3 border-b-2 border-red-400 bg-slate-950",
                          currentExpression === 'sad' && "h-1 border-t-2 border-slate-800 bg-transparent rounded-none"
                        )}
                      />
                    </motion.div>

                    {/* Waving Arm / Shoulders */}
                    <div className="w-24 h-16 bg-indigo-950/80 border border-indigo-500/20 rounded-t-3xl mt-1.5 relative [transform-style:preserve-3d] flex justify-between px-2">
                      {/* Left Arm Waving */}
                      <motion.div 
                        animate={currentExpression === 'waving' ? { rotateZ: [-20, 45, -20] } : {}}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        style={{ originX: 0, originY: 0 }}
                        className="w-4 h-12 bg-gradient-to-b from-purple-500 to-indigo-600 border border-purple-400/20 absolute -left-3 top-1.5 rounded-full"
                      />
                      
                      {/* Right Arm */}
                      <div className="w-4 h-12 bg-gradient-to-b from-purple-500 to-indigo-600 border border-purple-400/20 absolute -right-3 top-1.5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Dialogue Panel */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Character speech bubble */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative min-h-[100px] flex flex-col justify-center shadow-xl">
                {/* Speaking indicator */}
                <div className="flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-purple-400 mb-1 cursor-pointer" onClick={() => speakText(activeNode.characterText)}>
                  <span>Professor Lexi</span>
                  <Volume2 className={cn("h-3.5 w-3.5", speakActive && "animate-bounce")} />
                </div>
                <p className="text-sm font-semibold leading-relaxed text-slate-100 italic">
                  "{activeNode.characterText}"
                </p>
                <div className="absolute top-1/2 -left-2.5 w-3 h-3 bg-slate-900 border-l border-b border-slate-800 transform -translate-y-1/2 rotate-45 hidden md:block" />
              </div>

              {/* Dialog Options */}
              <div className="space-y-3.5">
                <AnimatePresence mode="wait">
                  {gameState === 'playing' ? (
                    <motion.div 
                      key="options"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-2.5"
                    >
                      {activeNode.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(idx)}
                          className="w-full text-left p-4 bg-slate-950/60 hover:bg-slate-900 border border-slate-900 hover:border-purple-500/30 rounded-2xl text-xs font-bold transition-all hover:translate-x-1 active:scale-[0.99] flex items-center justify-between group"
                        >
                          <span className="text-slate-300 group-hover:text-white transition-colors">{opt.text}</span>
                          <span className="text-[10px] text-slate-600 group-hover:text-purple-400 transition-colors uppercase font-black">Choose</span>
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    selectedOptionIdx !== null && (
                      <motion.div 
                        key="feedback"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                      >
                        <div className={cn(
                          "border p-4 rounded-2xl flex flex-col gap-1.5 shadow-md",
                          activeNode.options[selectedOptionIdx].isCorrect 
                            ? "border-emerald-500/20 bg-emerald-500/[0.01]" 
                            : "border-rose-500/20 bg-rose-500/[0.01]"
                        )}>
                          <span className={cn(
                            "text-[9px] uppercase font-black tracking-widest",
                            activeNode.options[selectedOptionIdx].isCorrect ? "text-emerald-400" : "text-rose-400"
                          )}>
                            {activeNode.options[selectedOptionIdx].isCorrect ? "Correct Response! 🎉" : "Incorrect response"}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                            {activeNode.options[selectedOptionIdx].feedback}
                          </p>
                        </div>

                        <button
                          onClick={handleNext}
                          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98"
                        >
                          <span>{currentNodeIdx < DIALOGUE_NODES.length - 1 ? "Next Dialogue" : "Finish Conversation"}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md my-auto space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur opacity-40 animate-pulse" />
              <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
                <Smile className="h-16 w-16 text-emerald-400 animate-bounce" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Conversation Complete!</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stunning speaking and social competency! You cleared the entire interactive 3D dialogue session with Professor Lexi, mastered all grammar cues, and claimed max Lingo-Coins.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 flex items-center justify-center gap-3">
              <Coins className="h-6 w-6 text-amber-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Lingo-Coins claimed</span>
                <span className="text-xl font-black text-amber-300 block leading-tight">+{score} Lingo-Coins</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Start New Dialogue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
