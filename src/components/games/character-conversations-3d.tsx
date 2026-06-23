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
import { shuffleArray } from "@/lib/shuffle";

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

function VisorEyes({ expression, speakActive }: { expression: string; speakActive: boolean }) {
  if (expression === 'happy') {
    return (
      <svg className="w-14 h-7 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        <path d="M20,32 Q30,12 40,32" />
        <path d="M60,32 Q70,12 80,32" />
      </svg>
    );
  }
  if (expression === 'sad') {
    return (
      <svg className="w-14 h-7 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        <path d="M20,18 Q30,38 40,18" />
        <path d="M60,18 Q70,38 80,18" />
      </svg>
    );
  }
  if (expression === 'thinking') {
    return (
      <svg className="w-14 h-7 text-purple-400 drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        <line x1="20" y1="25" x2="45" y2="25" />
        <line x1="55" y1="25" x2="80" y2="25" />
      </svg>
    );
  }
  if (speakActive || expression === 'talking') {
    return (
      <svg className="w-14 h-7 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        <motion.line 
          x1="25" y1="12" x2="25" y2="38" 
          animate={{ y1: [12, 6, 18, 12], y2: [38, 44, 32, 38] }} 
          transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut" }} 
        />
        <motion.line 
          x1="42" y1="18" x2="42" y2="32" 
          animate={{ y1: [18, 12, 22, 18], y2: [32, 38, 28, 32] }} 
          transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut", delay: 0.08 }} 
        />
        <motion.line 
          x1="58" y1="18" x2="58" y2="32" 
          animate={{ y1: [18, 22, 12, 18], y2: [32, 28, 38, 32] }} 
          transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut", delay: 0.15 }} 
        />
        <motion.line 
          x1="75" y1="12" x2="75" y2="38" 
          animate={{ y1: [12, 18, 6, 12], y2: [38, 32, 44, 38] }} 
          transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut", delay: 0.22 }} 
        />
      </svg>
    );
  }
  return (
    <svg className="w-14 h-7 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" viewBox="0 0 100 50">
      <motion.ellipse 
        cx="30" cy="25" rx="7" ry="7" 
        fill="currentColor"
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }} 
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.93, 0.96, 1] }}
      />
      <motion.ellipse 
        cx="70" cy="25" rx="7" ry="7" 
        fill="currentColor"
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }} 
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.93, 0.96, 1], delay: 0.15 }}
      />
    </svg>
  );
}

function ClefAvatar({ expression, speakActive }: { expression: string; speakActive: boolean }) {
  const themeColor = React.useMemo(() => {
    if (expression === 'sad') return { glow: 'rgba(96,165,250,0.4)', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' };
    if (expression === 'thinking') return { glow: 'rgba(192,132,252,0.4)', text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' };
    if (speakActive || expression === 'talking') return { glow: 'rgba(52,211,153,0.4)', text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
    return { glow: 'rgba(34,211,238,0.4)', text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' };
  }, [expression, speakActive]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      <div className="absolute bottom-2 flex flex-col items-center pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ boxShadow: `0 0 20px ${themeColor.glow}` }}
          className={cn("w-36 h-10 rounded-full border-2 bg-slate-900/60 [transform:rotateX(75deg)] transition-colors duration-500", themeColor.border)}
        />
        <div className={cn("w-20 h-6 rounded-full border border-dashed -mt-8 [transform:rotateX(75deg)] opacity-40 transition-colors duration-500", themeColor.border)} />
        <div className="w-48 h-56 bg-gradient-to-t from-cyan-500/10 via-cyan-500/5 to-transparent blur-md -mt-20 [clip-path:polygon(25%_0%,_75%_0%,_100%_100%,_0%_100%)] opacity-80" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: -50, opacity: [0, 0.8, 0] }}
          transition={{ repeat: Infinity, duration: 6, delay: 0.5 }}
          className={cn("absolute left-10 text-[10px] font-mono", themeColor.text)}
        >
          {"{ }"}
        </motion.div>
        <motion.div 
          initial={{ y: 180, opacity: 0 }}
          animate={{ y: -20, opacity: [0, 0.7, 0] }}
          transition={{ repeat: Infinity, duration: 5, delay: 2.2 }}
          className={cn("absolute right-12 text-[9px] font-mono", themeColor.text)}
        >
          {"</>"}
        </motion.div>
        <motion.div 
          initial={{ y: 190, opacity: 0 }}
          animate={{ y: -40, opacity: [0, 0.5, 0] }}
          transition={{ repeat: Infinity, duration: 7, delay: 4.1 }}
          className={cn("absolute left-1/4 text-[8px] font-mono", themeColor.text)}
        >
          {"ai"}
        </motion.div>
      </div>

      <div className="relative flex flex-col items-center justify-center [transform-style:preserve-3d] z-10">
        <motion.div
          animate={{
            y: [-12, -18, -12],
            rotateZ: [0, 360],
            rotateX: [65, 65]
          }}
          transition={{
            y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
            rotateZ: { repeat: Infinity, duration: 10, ease: "linear" }
          }}
          className={cn("absolute -top-6 w-20 h-20 rounded-full border border-dashed transition-colors duration-500", themeColor.border)}
        />

        <motion.div 
          animate={{
            y: [-6, 6, -6],
            rotateZ: expression === 'waving' ? [-3, 3, -3] : [-1, 1, -1]
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-24 h-24 rounded-[36px] bg-slate-900 border-2 border-slate-700/80 relative flex flex-col items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.5),_inset_0_2px_4px_rgba(255,255,255,0.05)] p-2"
        >
          <div className="absolute top-1 left-3 right-3 h-5 bg-gradient-to-b from-white/10 to-transparent rounded-t-[20px]" />
          
          <div className="absolute -top-3 w-1.5 h-4 bg-slate-800 border-r border-slate-700 rounded-full flex flex-col items-center">
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn("w-3 h-3 rounded-full -mt-2.5 transition-colors duration-500", 
                expression === 'sad' ? 'bg-blue-400' :
                expression === 'thinking' ? 'bg-purple-400' :
                speakActive || expression === 'talking' ? 'bg-emerald-400' : 'bg-cyan-400'
              )}
            />
          </div>

          <div className="absolute -left-2 w-2.5 h-8 rounded-l-xl bg-slate-800 border-l border-y border-slate-700 flex items-center justify-center">
            <div className={cn("w-1 h-4 rounded-full transition-colors duration-500", 
              expression === 'sad' ? 'bg-blue-500' :
              expression === 'thinking' ? 'bg-purple-500' :
              speakActive || expression === 'talking' ? 'bg-emerald-500' : 'bg-cyan-500'
            )} />
          </div>
          <div className="absolute -right-2 w-2.5 h-8 rounded-r-xl bg-slate-800 border-r border-y border-slate-700 flex items-center justify-center">
            <div className={cn("w-1 h-4 rounded-full transition-colors duration-500", 
              expression === 'sad' ? 'bg-blue-500' :
              expression === 'thinking' ? 'bg-purple-500' :
              speakActive || expression === 'talking' ? 'bg-emerald-500' : 'bg-cyan-500'
            )} />
          </div>

          <div className="w-full h-16 rounded-2xl bg-black border border-slate-850 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[size:100%_3px] pointer-events-none opacity-20" />
            <VisorEyes expression={expression} speakActive={speakActive} />
          </div>
        </motion.div>

        <div className="w-6 h-3 bg-slate-850 border-x border-slate-700/80 -mt-0.5 z-0" />

        <motion.div
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.15 }}
          className="w-28 h-18 bg-slate-900 border-2 border-slate-700/80 rounded-b-[32px] rounded-t-[8px] relative flex items-center justify-center p-3 shadow-lg z-10"
        >
          <div className="absolute inset-1.5 rounded-b-[28px] rounded-t-[4px] border border-slate-880 bg-slate-950/40" />

          <div className="relative w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner overflow-hidden">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute inset-0 border border-dotted border-cyan-500/10 rounded-full"
            />
            <motion.div
              animate={{
                scale: speakActive ? [0.95, 1.25, 0.95] : [0.9, 1.05, 0.9],
                opacity: speakActive ? [0.8, 1, 0.8] : [0.5, 0.75, 0.5],
              }}
              transition={{ repeat: Infinity, duration: speakActive ? 0.75 : 2, ease: "easeInOut" }}
              className={cn("w-5.5 h-5.5 rounded-full blur-[1px] transition-colors duration-500", 
                expression === 'sad' ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' :
                expression === 'thinking' ? 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]' :
                speakActive || expression === 'talking' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' :
                'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
              )}
            />
          </div>

          <motion.div
            animate={expression === 'waving' ? {
              rotateZ: [-10, -50, -15, -50, -15, -10],
              y: [-1, -2, -1]
            } : {
              rotateZ: [0, -4, 0]
            }}
            transition={{ repeat: Infinity, duration: expression === 'waving' ? 1.5 : 4 }}
            style={{ originX: 0.9, originY: 0.1 }}
            className="absolute -left-4 top-2.5 w-3.5 h-12 bg-slate-900 border border-slate-700/80 rounded-full flex flex-col justify-between py-1 px-0.5 shadow-md"
          >
            <div className={cn("w-full h-1.5 rounded-full transition-colors duration-500", 
              expression === 'sad' ? 'bg-blue-500/40' :
              expression === 'thinking' ? 'bg-purple-500/40' :
              speakActive || expression === 'talking' ? 'bg-emerald-500/40' : 'bg-cyan-500/40'
            )} />
            <div className={cn("w-full h-1.5 rounded-full transition-colors duration-500", 
              expression === 'sad' ? 'bg-blue-500/40' :
              expression === 'thinking' ? 'bg-purple-500/40' :
              speakActive || expression === 'talking' ? 'bg-emerald-500/40' : 'bg-cyan-500/40'
            )} />
          </motion.div>

          <motion.div
            animate={{
              rotateZ: [0, 4, 0]
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{ originX: 0.1, originY: 0.1 }}
            className="absolute -right-4 top-2.5 w-3.5 h-12 bg-slate-900 border border-slate-700/80 rounded-full flex flex-col justify-between py-1 px-0.5 shadow-md"
          >
            <div className={cn("w-full h-1.5 rounded-full transition-colors duration-500", 
              expression === 'sad' ? 'bg-blue-500/40' :
              expression === 'thinking' ? 'bg-purple-500/40' :
              speakActive || expression === 'talking' ? 'bg-emerald-500/40' : 'bg-cyan-500/40'
            )} />
            <div className={cn("w-full h-1.5 rounded-full transition-colors duration-500", 
              expression === 'sad' ? 'bg-blue-500/40' :
              expression === 'thinking' ? 'bg-purple-500/40' :
              speakActive || expression === 'talking' ? 'bg-emerald-500/40' : 'bg-cyan-500/40'
            )} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

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
            options: shuffleArray(result.options.map(opt => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              feedback: opt.explanation
            })))
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
    // 1. Strict pool matches both category and difficulty filters
    let strictPool = [...CONVERSATION_DATA] as ConversationNode[];
    if (selectedDifficulty !== 'all') {
      strictPool = strictPool.filter(n => n.difficulty === selectedDifficulty);
    }
    if (selectedCategory !== 'all') {
      strictPool = strictPool.filter(n => n.category === selectedCategory);
    }

    // Shuffle strict pool
    const selectedNodes: ConversationNode[] = strictPool.sort(() => 0.5 - Math.random());

    // 2. If we need more nodes, get nodes matching category (any difficulty)
    if (selectedNodes.length < roundsCount && selectedDifficulty !== 'all') {
      let categoryPool = CONVERSATION_DATA.filter(n => 
        (selectedCategory === 'all' || n.category === selectedCategory) &&
        !selectedNodes.some(s => s.id === n.id)
      );
      categoryPool.sort(() => 0.5 - Math.random());
      for (const node of categoryPool) {
        if (selectedNodes.length >= roundsCount) break;
        selectedNodes.push(node);
      }
    }

    // 3. If we still need more nodes, get nodes matching difficulty (any category)
    if (selectedNodes.length < roundsCount && selectedCategory !== 'all') {
      let difficultyPool = CONVERSATION_DATA.filter(n => 
        (selectedDifficulty === 'all' || n.difficulty === selectedDifficulty) &&
        !selectedNodes.some(s => s.id === n.id)
      );
      difficultyPool.sort(() => 0.5 - Math.random());
      for (const node of difficultyPool) {
        if (selectedNodes.length >= roundsCount) break;
        selectedNodes.push(node);
      }
    }

    // 4. If we still need more nodes, pull from any remaining nodes
    if (selectedNodes.length < roundsCount) {
      let generalPool = CONVERSATION_DATA.filter(n => !selectedNodes.some(s => s.id === n.id));
      generalPool.sort(() => 0.5 - Math.random());
      for (const node of generalPool) {
        if (selectedNodes.length >= roundsCount) break;
        selectedNodes.push(node);
      }
    }

    // 5. In the absolute fallback case (if total pool is extremely small and we must repeat), duplicate
    let finalNodes = [...selectedNodes];
    while (finalNodes.length < roundsCount && finalNodes.length > 0) {
      finalNodes.push(finalNodes[Math.floor(Math.random() * finalNodes.length)]);
    }

    if (finalNodes.length === 0) {
      toast({
        variant: "destructive",
        title: "No scenarios found",
        description: "The database is empty.",
      });
      setGameState('idle');
      return;
    }

    // Slice to exactly roundsCount just in case
    const shuffled = finalNodes.slice(0, roundsCount);

    const mapped: DialogueNode[] = shuffled.map((n, idx) => ({
      id: n.id,
      scenario: `Topic: ${n.category} (${n.difficulty.toUpperCase()})`,
      characterText: n.characterText,
      expression: n.expression,
      options: shuffleArray(n.options)
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
            <p className="text-xs text-slate-400">Talk to Clef the AI, learn conversational social cues and perfect phonetics!</p>
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
                    <p><strong>Goal</strong>: Clef will prompt you with conversational questions. Pick the response that showcases correct grammar, appropriate context, and polite social cues.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">2</span>
                    <p><strong>Text-to-Speech</strong>: Press the speaker button <Volume2 className="h-3.5 w-3.5 inline text-indigo-400 mx-0.5" /> next to the character's name to hear Clef read the dialogue aloud. Great for practicing listening skills!</p>
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
              <p className="text-xs text-slate-500">Clef is configuring your speech prompts...</p>
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
              {/* Left Side: Modernized Clef AI Hologram Stage */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/40 border border-slate-900/80 rounded-3xl p-6 relative overflow-hidden min-h-[300px] shadow-inner">
                {/* 3D Stage Container */}
                <div 
                  className="relative [transform-style:preserve-3d] w-full h-full flex flex-col items-center justify-center transition-all duration-500"
                  style={{ transform: 'rotateY(-12deg) rotateX(10deg)' }}
                >
                  <ClefAvatar expression={currentExpression} speakActive={speakActive} />
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
                    <span>Clef</span>
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
              <p className="text-xs text-slate-400">Performance summary with Clef</p>
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
                        Clef: "{item.characterText}"
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
