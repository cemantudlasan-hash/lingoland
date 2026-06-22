'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Coins, 
  Sparkles, 
  Maximize, 
  Minimize, 
  Smile, 
  Volume2, 
  ArrowRight, 
  Info, 
  Award, 
  BookOpen, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  PlayCircle,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { generateConversationChallenge } from "@/ai/flows/generate-conversation-challenge";
import { CONVERSATION_DATA, type ConversationNode } from "@/lib/game-data";

interface DialogueNode {
  id: number;
  scenario?: string;
  characterText: string;
  expression: 'happy' | 'waving' | 'talking' | 'sad' | 'thinking';
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
}

interface HistoryItem {
  scenario?: string;
  characterText: string;
  selectedText: string;
  correctText: string;
  isCorrect: boolean;
  feedback: string;
}

const CATEGORIES = [
  'Restaurant', 'Travel', 'Work', 'School', 'Social', 'Emergency', 'Shopping', 'Family', 'Hobbies', 'Technology'
] as const;

export function CharacterConversations3D({ onToggleFullscreen }: { slug: string; onToggleFullscreen?: () => void }) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { toast } = useToast();

  // Game configuration states
  const [gameMode, setGameMode] = React.useState<'offline' | 'ai'>('offline');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [roundsCount, setRoundsCount] = React.useState<number>(5);
  const [activeTab, setActiveTab] = React.useState<'play' | 'guide'>('play');

  // Gameplay states
  const [currentNodeIdx, setCurrentNodeIdx] = React.useState(0);
  const [gameState, setGameState] = React.useState<'idle' | 'loading' | 'playing' | 'feedback' | 'completed'>('idle');
  const [selectedOptionIdx, setSelectedOptionIdx] = React.useState<number | null>(null);
  const [speakActive, setSpeakActive] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [activeNodes, setActiveNodes] = React.useState<DialogueNode[]>([]);
  const [sessionHistory, setSessionHistory] = React.useState<HistoryItem[]>([]);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Speak functionality
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        setSpeakActive(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.onend = () => setSpeakActive(false);
        utterance.onerror = (err) => {
          console.error("SpeechSynthesisUtterance error:", err);
          setSpeakActive(false);
        };
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("SpeechSynthesis failed:", err);
        setSpeakActive(false);
      }
    }
  };

  // Helper to fetch/generate dialogue nodes
  const prepareGameSession = async () => {
    setGameState('loading');
    setScore(0);
    setCurrentNodeIdx(0);
    setSelectedOptionIdx(null);
    setSessionHistory([]);

    if (gameMode === 'ai') {
      try {
        const generatedNodes: DialogueNode[] = [];
        // Generate sequentially up to roundsCount
        for (let i = 0; i < roundsCount; i++) {
          const mappedCategory = selectedCategory === 'all' 
            ? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
            : selectedCategory as any;
          const mappedDifficulty = selectedDifficulty === 'all'
            ? ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any
            : selectedDifficulty as any;

          const result = await generateConversationChallenge({
            difficulty: mappedDifficulty,
            category: mappedCategory,
            usedScenarios: generatedNodes.map(n => n.scenario || ''),
          });

          generatedNodes.push({
            id: Date.now() + i,
            scenario: result.scenario,
            characterText: result.characterLine,
            expression: ['talking', 'thinking', 'waving'][Math.floor(Math.random() * 3)] as any,
            options: result.options.map(opt => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              feedback: opt.explanation
            }))
          });
        }

        setActiveNodes(generatedNodes);
        setGameState('playing');
        setTimeout(() => speakText(generatedNodes[0].characterText), 200);
      } catch (error) {
        console.error("Genkit AI Generation Failed, falling back to local pool:", error);
        toast({
          title: "AI Offline Fallback 💡",
          description: "Could not contact Gemini server. Gracefully loaded pre-designed scenarios.",
        });
        loadOfflineScenarios();
      }
    } else {
      loadOfflineScenarios();
    }
  };

  const loadOfflineScenarios = () => {
    let pool = [...CONVERSATION_DATA] as ConversationNode[];

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      pool = pool.filter(n => n.difficulty === selectedDifficulty);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      pool = pool.filter(n => n.category === selectedCategory);
    }

    if (pool.length === 0) {
      toast({
        variant: "destructive",
        title: "No scenarios found",
        description: "Try widening your category or difficulty filters.",
      });
      setGameState('idle');
      return;
    }

    // Shuffle and slice
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, roundsCount);
    const mapped: DialogueNode[] = shuffled.map((n, idx) => ({
      id: n.id,
      scenario: `Topic: ${n.category} (${n.difficulty.toUpperCase()})`,
      characterText: n.characterText,
      expression: n.expression,
      options: n.options
    }));

    setActiveNodes(mapped);
    setGameState('playing');
    setTimeout(() => speakText(mapped[0].characterText), 200);
  };

  const handleOptionClick = (idx: number) => {
    if (gameState !== 'playing') return;
    setSelectedOptionIdx(idx);
    setGameState('feedback');

    const currentNode = activeNodes[currentNodeIdx];
    const optionSelected = currentNode.options[idx];

    if (optionSelected.isCorrect) {
      setScore(prev => prev + 1);
    }

    // Record history
    const historyItem: HistoryItem = {
      scenario: currentNode.scenario,
      characterText: currentNode.characterText,
      selectedText: optionSelected.text,
      correctText: currentNode.options.find(o => o.isCorrect)?.text || '',
      isCorrect: optionSelected.isCorrect,
      feedback: optionSelected.feedback
    };
    setSessionHistory(prev => [...prev, historyItem]);

    speakText(optionSelected.feedback);
  };

  const handleNext = () => {
    if (currentNodeIdx < activeNodes.length - 1) {
      const nextIdx = currentNodeIdx + 1;
      setCurrentNodeIdx(nextIdx);
      setSelectedOptionIdx(null);
      setGameState('playing');
      speakText(activeNodes[nextIdx].characterText);
    } else {
      endGameSession();
    }
  };

  // Gracefully end and trigger coins/rewards
  const endGameSession = () => {
    setGameState('completed');
    
    // Trigger parent controller event
    window.dispatchEvent(new CustomEvent('lingoland_game_completed_hijack', {
      detail: { state: 'finished' }
    }));
  };

  const activeNode = activeNodes[currentNodeIdx] || null;

  const currentExpression = React.useMemo(() => {
    if (gameState === 'completed') return 'happy';
    if (gameState === 'feedback' && selectedOptionIdx !== null && activeNode) {
      return activeNode.options[selectedOptionIdx].isCorrect ? 'happy' : 'sad';
    }
    return activeNode ? activeNode.expression : 'happy';
  }, [gameState, currentNodeIdx, selectedOptionIdx, activeNode]);

  // Performance Rating based on score
  const ratingData = React.useMemo(() => {
    if (sessionHistory.length === 0) return { title: 'Unknown', desc: 'No dialogues completed.' };
    const pct = (score / sessionHistory.length) * 100;
    if (pct === 100) return { title: 'Dojo Grandmaster 🏆', desc: 'Perfect social competency, impeccable grammar and phrasing!' };
    if (pct >= 80) return { title: 'Elite Communicator 🌟', desc: 'Outstanding conversational skills. Very polite and natural.' };
    if (pct >= 50) return { title: 'Conversationalist 👍', desc: 'Good responses overall. Pay close attention to subtle grammar rules.' };
    return { title: 'Social Explorer 🗺️', desc: 'Keep practicing. Pay attention to the distinction between formal and informal cues.' };
  }, [score, sessionHistory]);

  return (
    <div className={cn(
      "w-full transition-all duration-500 flex flex-col items-center bg-slate-950 text-white relative overflow-hidden",
      isFullscreen 
        ? "min-h-screen rounded-none border-none p-8 max-w-none justify-center" 
        : "max-w-4xl mx-auto rounded-3xl p-6 border border-slate-800 shadow-2xl min-h-[620px]"
    )}>
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-900 pb-4 mb-6 z-10 shrink-0">
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
              {isFullscreen ? <Minimize className="h-4.5 w-4.5" /> : <Maximize className="h-4.5 w-4.5" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* State 1: CONFIG / IDLE */}
        {gameState === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full flex flex-col items-center z-10 flex-grow"
          >
            {/* Tabs Selector */}
            <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/50 mb-6 gap-1 w-full max-w-md">
              <button 
                onClick={() => setActiveTab('play')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                  activeTab === 'play' ? "bg-indigo-650 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <PlayCircle className="h-4 w-4" />
                Configure Session
              </button>
              <button 
                onClick={() => setActiveTab('guide')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                  activeTab === 'guide' ? "bg-indigo-650 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Info className="h-4 w-4" />
                Dojo Guide
              </button>
            </div>

            {activeTab === 'guide' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-slate-900/40 border border-slate-905 p-6 rounded-3xl space-y-5 text-left shadow-2xl"
              >
                <h3 className="text-lg font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <BookOpen className="h-5 w-5" /> How to Play & Game Mechanics
                </h3>
                <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                  <div className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">1</span>
                    <p><strong>Goal</strong>: professor Lexi will prompt you with conversational questions. Pick the response that showcases correct grammar, appropriate context, and polite social cues.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">2</span>
                    <p><strong>Text-to-Speech</strong>: Press the speaker button <Volume2 className="h-3.5 w-3.5 inline text-indigo-400 mx-0.5" /> next to the character's name to hear Professor Lexi read the dialogue aloud. Great for practicing listening skills!</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">3</span>
                    <p><strong>Mode Options</strong>: Choose <strong>Offline Mode</strong> for quick play using our pool of 40+ curated scenarios, or use <strong>AI Generator</strong> to dynamically create fresh real-time roleplay topics using Gemini.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">4</span>
                    <p><strong>End Conversation</strong>: Want to leave early? Click the <strong>End early</strong> button at any time during play to terminate the session and view your scorecard with final stats and coin drops.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => setActiveTab('play')}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all"
                  >
                    Got It, Let's Play!
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-6 shadow-2xl"
              >
                {/* Mode Selector */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Dialogue Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setGameMode('offline')}
                      className={cn(
                        "py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                        gameMode === 'offline' 
                          ? "bg-purple-650/15 border-purple-500 text-purple-300"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                      )}
                    >
                      Offline Curated (40+ Scenes)
                    </button>
                    <button 
                      onClick={() => setGameMode('ai')}
                      className={cn(
                        "py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                        gameMode === 'ai' 
                          ? "bg-purple-650/15 border-purple-500 text-purple-300"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                      Gemini Generator
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Difficulty Selector */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Difficulty</label>
                    <select 
                      value={selectedDifficulty} 
                      onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                      className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                    >
                      <option value="all">All Tiers</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Category Selector */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Category</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                    >
                      <option value="all">All Sectors</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rounds Selector */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Session Duration</label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map((rounds) => (
                      <button
                        key={rounds}
                        onClick={() => setRoundsCount(rounds)}
                        className={cn(
                          "flex-1 py-2.5 border rounded-xl text-xs font-black transition-all",
                          roundsCount === rounds 
                            ? "bg-indigo-600 border-indigo-500 text-white" 
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        )}
                      >
                        {rounds} Rounds
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={prepareGameSession}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black uppercase text-sm tracking-widest rounded-2xl transition-all shadow-[0_4px_25px_rgba(168,85,247,0.25)] hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
                  >
                    {gameMode === 'ai' ? <Sparkles className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} /> : <PlayCircle className="h-4 w-4" />}
                    {gameMode === 'ai' ? "Generate AI Dialogue" : "Start Learning Session"}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* State 2: LOADING */}
        {gameState === 'loading' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col items-center justify-center text-center space-y-6 z-10"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
            </div>
            <div className="space-y-1.5 animate-pulse">
              <h4 className="text-sm font-black uppercase text-indigo-400 tracking-widest">Dojo Synthesis active</h4>
              <p className="text-xs text-slate-500">Professor Lexi is configuring your speech prompts...</p>
            </div>
          </motion.div>
        )}

        {/* State 3 & 4: PLAYING & FEEDBACK */}
        {(gameState === 'playing' || gameState === 'feedback') && activeNode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col flex-grow z-10"
          >
            {/* Round & Score HUD Header */}
            <div className="w-full flex items-center justify-between gap-4 mb-5 text-xs font-bold font-mono">
              <span className="text-slate-400">ROUND {currentNodeIdx + 1} OF {activeNodes.length}</span>
              
              {/* Progress bar */}
              <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden mx-4 max-w-md">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentNodeIdx + (gameState === 'feedback' ? 1 : 0)) / activeNodes.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-amber-400">SCORE: {score}</span>
                <button 
                  onClick={endGameSession}
                  className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 font-bold font-mono text-[10px] uppercase tracking-wider rounded-lg px-2.5 py-1.5 flex items-center gap-1 transition-all"
                  title="Terminate the session early"
                >
                  <LogOut className="h-3 w-3" />
                  End Early
                </button>
              </div>
            </div>

            {/* Scenario Header */}
            {activeNode.scenario && (
              <div className="w-full bg-slate-900/35 border border-slate-900 rounded-2xl px-4 py-3 mb-5 text-left text-xs leading-relaxed text-indigo-200 font-medium flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>{activeNode.scenario}</p>
              </div>
            )}

            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow">
              {/* Left Side: 3D Character Avatar Stage */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/60 border border-slate-900/60 rounded-3xl p-6 relative overflow-hidden min-h-[260px]">
                {/* 3D Container */}
                <div 
                  className="relative [transform-style:preserve-3d] w-full h-full flex flex-col items-center justify-center transition-all duration-500"
                  style={{ transform: 'rotateY(-10deg) rotateX(10deg)' }}
                >
                  <div className="absolute w-28 h-6 bg-slate-900/60 rounded-full blur-[2px] bottom-1" />

                  {/* Character Skeletal Model */}
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

                      {/* Eyes */}
                      <div className="absolute top-8 flex gap-5 z-20">
                        <motion.div 
                          animate={{ scaleY: [1, 0.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 4.5, delay: 0.5 }} 
                          className="w-2 h-2 bg-white rounded-full flex items-center justify-center"
                        >
                          <div className="w-1 h-1 bg-black rounded-full" />
                        </motion.div>
                        <motion.div 
                          animate={{ scaleY: [1, 0.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 4.5, delay: 0.5 }} 
                          className="w-2 h-2 bg-white rounded-full flex items-center justify-center"
                        >
                          <div className="w-1 h-1 bg-black rounded-full" />
                        </motion.div>
                      </div>

                      {/* Mouth */}
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
                      <motion.div 
                        animate={currentExpression === 'waving' ? { rotateZ: [-20, 45, -20] } : {}}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        style={{ originX: 0, originY: 0 }}
                        className="w-4 h-12 bg-gradient-to-b from-purple-500 to-indigo-600 border border-purple-400/20 absolute -left-3 top-1.5 rounded-full"
                      />
                      <div className="w-4 h-12 bg-gradient-to-b from-purple-500 to-indigo-600 border border-purple-400/20 absolute -right-3 top-1.5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Speech & Options Panel */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {/* Character Dialogue Bubble */}
                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 relative min-h-[100px] flex flex-col justify-center shadow-xl">
                  <div 
                    className="flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-purple-400 mb-1 cursor-pointer w-fit hover:text-purple-300 transition-colors" 
                    onClick={() => speakText(activeNode.characterText)}
                  >
                    <span>Professor Lexi</span>
                    <Volume2 className={cn("h-3.5 w-3.5", speakActive && "animate-bounce")} />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-100 italic">
                    "{activeNode.characterText}"
                  </p>
                  <div className="absolute top-1/2 -left-2.5 w-3 h-3 bg-slate-900 border-l border-b border-slate-850 transform -translate-y-1/2 rotate-45 hidden md:block" />
                </div>

                {/* Dialog Options or Feedback */}
                <div className="space-y-3.5 flex-grow flex flex-col justify-end">
                  <AnimatePresence mode="wait">
                    {gameState === 'playing' ? (
                      <motion.div 
                        key="options"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-2.5 w-full"
                      >
                        {activeNode.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            className="w-full text-left p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-900 hover:border-purple-500/30 rounded-2xl text-xs font-bold transition-all hover:translate-x-1 active:scale-[0.99] flex items-center justify-between group shadow-inner"
                          >
                            <span className="text-slate-300 group-hover:text-white transition-colors pr-4">{opt.text}</span>
                            <span className="text-[10px] text-slate-650 group-hover:text-purple-400 transition-colors uppercase font-black shrink-0">Choose</span>
                          </button>
                        ))}
                      </motion.div>
                    ) : (
                      selectedOptionIdx !== null && (
                        <motion.div 
                          key="feedback"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-4 w-full"
                        >
                          <div className={cn(
                            "border p-4 rounded-2xl flex flex-col gap-1.5 shadow-md text-left",
                            activeNode.options[selectedOptionIdx].isCorrect 
                              ? "border-emerald-500/20 bg-emerald-500/[0.02]" 
                              : "border-rose-500/20 bg-rose-500/[0.02]"
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
                            <span>{currentNodeIdx < activeNodes.length - 1 ? "Next Dialogue" : "Finish Conversation"}</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* State 5: COMPLETED SCORECARD */}
        {gameState === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full flex flex-col items-center z-10 flex-grow max-w-2xl mx-auto space-y-6"
          >
            {/* Scorecard Header */}
            <div className="relative text-center w-full flex flex-col items-center">
              <div className="absolute -top-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-650 blur-xl opacity-30 h-24 w-24 pointer-events-none" />
              <div className="relative p-5 bg-slate-900 border border-slate-800 rounded-full mb-3 shadow-2xl">
                <Award className="h-10 w-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Conversation Report</h3>
              <p className="text-xs text-slate-400">Performance summary with Professor Lexi</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-4 w-full bg-slate-900/30 p-5 rounded-2xl border border-slate-900 shadow-inner">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Correct</span>
                <span className="text-2xl font-black text-white mt-1">{score} / {sessionHistory.length}</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-900">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Accuracy</span>
                <span className="text-2xl font-black text-white mt-1">
                  {sessionHistory.length > 0 ? Math.round((score / sessionHistory.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-black text-slate-450 tracking-wider flex items-center gap-1">
                  <Coins className="h-3 w-3 text-amber-500" /> Coins
                </span>
                <span className="text-2xl font-black text-amber-400 mt-1">+{score * 2}</span>
              </div>
            </div>

            {/* Performance Review Quote */}
            <div className="w-full bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-xl text-center">
              <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-1">{ratingData.title}</p>
              <p className="text-xs text-slate-300 leading-normal font-semibold">"{ratingData.desc}"</p>
            </div>

            {/* Scrollable Dialogue History Review */}
            {sessionHistory.length > 0 && (
              <div className="w-full text-left space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-widest px-1">Conversation log review</h4>
                <div className="w-full max-h-56 overflow-y-auto space-y-2.5 pr-1.5 border border-slate-900/60 rounded-xl bg-slate-950/40 p-3 shadow-inner">
                  {sessionHistory.map((item, idx) => (
                    <div key={idx} className="border-b border-slate-900 last:border-0 pb-3 last:pb-0 space-y-2">
                      {item.scenario && (
                        <span className="text-[9px] uppercase font-bold text-indigo-400/80 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                          {item.scenario}
                        </span>
                      )}
                      <p className="text-xs text-slate-450 italic leading-snug">
                        Professor Lexi: "{item.characterText}"
                      </p>
                      
                      <div className="space-y-1 pl-2 border-l-2 border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs">
                          {item.isCorrect ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-400" />
                          )}
                          <span className={item.isCorrect ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            You replied: "{item.selectedText}"
                          </span>
                        </div>
                        {!item.isCorrect && (
                          <p className="text-[11px] text-slate-400">
                            Correct was: "{item.correctText}"
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500 italic">
                          Feedback: {item.feedback}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restart Buttons */}
            <div className="w-full flex gap-3 pt-2 shrink-0">
              <button 
                onClick={prepareGameSession} 
                className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Restart Session
              </button>
              <button 
                onClick={() => setGameState('idle')}
                className="flex-1 py-3.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Configure New Game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
