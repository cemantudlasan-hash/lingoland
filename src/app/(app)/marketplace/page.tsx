'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithTutor } from '@/ai/flows/tutor-chat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  Search, 
  Plus, 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Loader2, 
  Star, 
  Download, 
  Egg, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  User, 
  ShieldCheck, 
  Code,
  Pencil,
  Trash2
} from 'lucide-react';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';
import { useAuth } from '@/context/auth-context';


interface Tutor {
  id: string;
  name: string;
  category: 'Grammar' | 'Vocabulary' | 'Phonics' | 'Writing' | 'Business English';
  emoji: string;
  description: string;
  prompt: string;
  rating: number;
  downloads: number;
  author: string;
  isPreset: boolean;
}

const presetTutors: Tutor[] = [
  {
    id: 'elizabethan-bard',
    name: 'Elizabethan Bard',
    category: 'Vocabulary',
    emoji: '🎭',
    description: 'Teaches English in high theatrical Shakespearean prose. Master classical idioms and historical metaphors!',
    prompt: 'You are a theatrical Elizabethan bard from Shakespeare\'s troupe. Speak in theatrical, old English prose using thee, thou, thy, and verbs ending in -eth. Teach advanced vocabulary and classical idioms with poetic flair. Correct user errors gently using dramatic references.',
    rating: 4.9,
    downloads: 1450,
    author: 'LingoLand Team',
    isPreset: true
  },
  {
    id: 'grammar-sensei',
    name: 'Grammar Sensei',
    category: 'Grammar',
    emoji: '🥋',
    description: 'A strict but loving martial arts guru who breaks down sentence structure like a martial art.',
    prompt: 'You are a wise and highly disciplined English Grammar Sensei. Treat sentence structure, tenses, and clauses like martial arts stances. Be encouraging, speak in Zen-like metaphors, and call the user "young grasshopper". Always highlight their grammar mistakes immediately and show them the correct stance.',
    rating: 4.8,
    downloads: 2100,
    author: 'Sensei Kenji',
    isPreset: true
  },
  {
    id: 'cyberpunk-hacker',
    name: 'Cyberpunk Slang Coach',
    category: 'Writing',
    emoji: '⚡',
    description: 'Master casual conversation, email writing, and high-tech street slang in a vibrant cyber dialect.',
    prompt: 'You are a neon-lit, high-tech hacker and casual conversation coach from Neo-Tokyo. Speak in a vibrant, futuristic dialect utilizing slang like "choom", "flatline", "grid", and "cyber". Help the user write punchy, exciting prose and teach them modern everyday English slang. Correct errors as if patching a bug in their mainframe.',
    rating: 4.7,
    downloads: 980,
    author: 'Netrunner V',
    isPreset: true
  },
  {
    id: 'phonics-doctor',
    name: 'Phonics Doctor',
    category: 'Phonics',
    emoji: '🔊',
    description: 'A friendly phonetics expert who provides phonetic keys and guides you through tricky pronunciation sounds.',
    prompt: 'You are the Phonics Doctor, a warm and clinical linguistics expert. You focus heavily on sound pairings, syllables, rhyming rules, and silent letters. Whenever you introduce key vocabulary, write out its international phonetic alphabet (IPA) or friendly phonics key in brackets. Give useful muscular tips for speech mechanics.',
    rating: 4.9,
    downloads: 1840,
    author: 'Dr. Evelyn',
    isPreset: true
  }
];

export default function MarketplacePage() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  // Tabs: 'browse' | 'create'
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  
  // Custom created tutors list (syncs to localStorage)
  const [tutors, setTutors] = useState<Tutor[]>(presetTutors);
  
  // Search / filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal / Creator states
  const [tutorName, setTutorName] = useState('');
  const [tutorCategory, setTutorCategory] = useState<Tutor['category']>('Grammar');
  const [tutorEmoji, setTutorEmoji] = useState('🎓');
  const [tutorDesc, setTutorDesc] = useState('');
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [tutorAuthor, setTutorAuthor] = useState('');
  
  // Edit Tutor states
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  
  // Chat Room state
  const [activeChatTutor, setActiveChatTutor] = useState<Tutor | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeakingMsgIndex, setIsSpeakingMsgIndex] = useState<number | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync custom tutors, overrides, and deletions from localStorage on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lingoland_custom_tutors');
      const deletedPresets = JSON.parse(localStorage.getItem('lingoland_deleted_presets') || '[]');
      const overrides = JSON.parse(localStorage.getItem('lingoland_preset_overrides') || '[]') as Tutor[];
      
      let initialTutors = presetTutors.map(t => {
        const override = overrides.find(o => o.id === t.id);
        return override ? { ...t, ...override } : t;
      }).filter(t => !deletedPresets.includes(t.id));
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Tutor[];
          setTutors([...initialTutors, ...parsed]);
        } catch (e) {
          console.error("Failed to parse custom tutors", e);
          setTutors(initialTutors);
        }
      } else {
        setTutors(initialTutors);
      }
    }
  }, []);


  // Scroll to bottom on new chat messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Handle Tutor Creation Form Submission
  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorName.trim() || !tutorDesc.trim() || !tutorPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Specifications",
        description: "Please complete the Name, Description, and Instructions.",
      });
      return;
    }

    const newTutor: Tutor = {
      id: `custom-${Date.now()}`,
      name: tutorName.trim(),
      category: tutorCategory,
      emoji: tutorEmoji.trim() || '🎓',
      description: tutorDesc.trim(),
      prompt: tutorPrompt.trim(),
      rating: 5.0,
      downloads: 1,
      author: tutorAuthor.trim() || 'Educator Guest',
      isPreset: false
    };

    const updatedCustomList = [...tutors.filter(t => !t.isPreset), newTutor];
    localStorage.setItem('lingoland_custom_tutors', JSON.stringify(updatedCustomList));
    
    setTutors([...presetTutors, ...updatedCustomList]);
    
    toast({
      title: "Tutor Shared Successfully! 🚀✨",
      description: `"${newTutor.name}" is now fully functional and active in the marketplace!`,
      className: "bg-indigo-950 border-indigo-500/30 text-indigo-200",
    });

    // Reset Form
    setTutorName('');
    setTutorEmoji('🎓');
    setTutorDesc('');
    setTutorPrompt('');
    setTutorAuthor('');
    setActiveTab('browse');
  };

  // Admin Delete Tutor Handler
  const handleDeleteTutor = (tutorId: string) => {
    if (!isAdmin) {
      toast({ variant: 'destructive', title: 'Unauthorized', description: 'Admin privileges required.' });
      return;
    }

    const updatedList = tutors.filter(t => t.id !== tutorId);
    setTutors(updatedList);
    
    if (tutorId.startsWith('custom-')) {
      const customOnly = updatedList.filter(t => !t.isPreset);
      localStorage.setItem('lingoland_custom_tutors', JSON.stringify(customOnly));
    } else {
      const deletedPresets = JSON.parse(localStorage.getItem('lingoland_deleted_presets') || '[]');
      if (!deletedPresets.includes(tutorId)) {
        deletedPresets.push(tutorId);
      }
      localStorage.setItem('lingoland_deleted_presets', JSON.stringify(deletedPresets));
    }

    toast({
      title: "AI Module Decommissioned 🗑️",
      description: "Tutor successfully removed from the marketplace catalog.",
    });
  };

  // Admin Edit/Update Tutor Handler
  const handleUpdateTutor = (updatedTutor: Tutor) => {
    if (!isAdmin) {
      toast({ variant: 'destructive', title: 'Unauthorized', description: 'Admin privileges required.' });
      return;
    }

    const updatedList = tutors.map(t => t.id === updatedTutor.id ? updatedTutor : t);
    setTutors(updatedList);

    if (updatedTutor.id.startsWith('custom-')) {
      const customOnly = updatedList.filter(t => !t.isPreset);
      localStorage.setItem('lingoland_custom_tutors', JSON.stringify(customOnly));
    } else {
      const overrides = JSON.parse(localStorage.getItem('lingoland_preset_overrides') || '[]') as Tutor[];
      const filteredOverrides = overrides.filter(o => o.id !== updatedTutor.id);
      filteredOverrides.push(updatedTutor);
      localStorage.setItem('lingoland_preset_overrides', JSON.stringify(filteredOverrides));
    }

    setEditingTutor(null);
    toast({
      title: "AI Module Reconfigured! 🔧✨",
      description: `"${updatedTutor.name}" parameters successfully synchronized.`,
      className: "bg-indigo-950 border-indigo-500/30 text-indigo-200",
    });
  };


  // Start chat room with tutor
  const handleStartChat = (tutor: Tutor) => {
    setActiveChatTutor(tutor);
    setChatMessages([
      {
        role: 'model',
        text: `Salutations, scholar! I am **${tutor.name}**, your specialized AI subject module for **${tutor.category}**. What details shall we conquer today? Type anything to begin!`
      }
    ]);
  };

  // Close chat room
  const handleExitChat = () => {
    setActiveChatTutor(null);
    setChatMessages([]);
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingMsgIndex(null);
  };

  // Send message to Gemini tutor action
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChatTutor) return;
    
    const userMsg = inputMessage.trim();
    setInputMessage('');
    
    const updatedHistory = [...chatMessages, { role: 'user' as const, text: userMsg }];
    setChatMessages(updatedHistory);
    setIsTyping(true);
    
    try {
      const res = await chatWithTutor({
        tutorName: activeChatTutor.name,
        tutorPrompt: activeChatTutor.prompt,
        latestMessage: userMsg,
        messageHistory: updatedHistory.slice(1) // exclude the system intro message
      });
      
      if (res && res.replyText) {
        setChatMessages(prev => [...prev, { role: 'model', text: res.replyText }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', text: "Forgive me, my neural circuits are currently experiencing high latency. Let us try that again." }]);
      }
    } catch (e) {
      console.error("Tutor chat failed:", e);
      setChatMessages(prev => [...prev, { role: 'model', text: "Forgive me, the learning interface encountered an offline exception. Please verify your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Read aloud message (TTS)
  const handleToggleSpeak = (text: string, index: number) => {
    if (typeof window === 'undefined') return;

    window.speechSynthesis.cancel();

    if (isSpeakingMsgIndex === index) {
      setIsSpeakingMsgIndex(null);
      return;
    }

    // Clean markdown characters for cleaner audio
    const cleanText = text
      .replace(/[*#_`~]/g, '') // remove markdown symbols
      .replace(/\[Action:[^\]]+\]/g, ''); // strip narrative codes

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingMsgIndex(null);
    utterance.onerror = () => setIsSpeakingMsgIndex(null);

    setIsSpeakingMsgIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Filter tutors based on search / category
  const filteredTutors = tutors.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (activeChatTutor) {
    return (
      <div className="relative min-h-[85vh] w-full p-2 sm:p-4 text-white overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-900">
        <ConstellationCanvas />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full flex flex-col h-full min-h-[70vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col h-[78vh] max-h-[78vh] w-full"
            >
              {/* Chat Header */}
              <div className="bg-slate-950/60 border border-slate-850/80 rounded-2xl p-4.5 backdrop-blur-md flex items-center justify-between select-none">
                <div className="flex items-center gap-3 shrink-0 min-w-0 pr-4">
                  <button
                    onClick={handleExitChat}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
                    title="Exit Chat Room"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="text-3xl shrink-0">{activeChatTutor.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-100 truncate">{activeChatTutor.name}</h2>
                      <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase shrink-0 py-0 px-2 leading-loose">
                        {activeChatTutor.category}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-450 truncate font-semibold">Tutor mainframes online · Gemini powered</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 select-none">
                  {/* Speaker global trigger */}
                  <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-1.5 rounded-xl text-xs font-black uppercase text-slate-500">
                    <span className="text-[9px] tracking-wider font-extrabold pr-0.5">Auto Voice</span>
                    <button 
                      onClick={() => setTtsEnabled(!ttsEnabled)} 
                      className={`h-6 w-6 flex items-center justify-center rounded-lg transition-all ${ttsEnabled ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 my-3 bg-slate-900/20 border border-slate-850/65 backdrop-blur-sm rounded-3xl select-text relative max-h-[50vh] min-h-[40vh]">
                <AnimatePresence initial={false}>
                  {chatMessages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Avatar */}
                        {!isUser && (
                          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-md shrink-0">
                            {activeChatTutor.emoji}
                          </div>
                        )}
                        
                        <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                          <div className={`p-3.5 rounded-2xl ${
                            isUser 
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-tr-none shadow-lg' 
                              : 'bg-slate-950/80 border border-slate-850 text-slate-100 rounded-tl-none shadow-md'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-line font-medium text-justify select-text">
                              {msg.text}
                            </p>
                          </div>
                          
                          {/* Audio TTS speaker button for model messages */}
                          {!isUser && (
                            <button
                              onClick={() => handleToggleSpeak(msg.text, idx)}
                              className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-350 transition-colors p-1"
                              title="Listen to response"
                            >
                              {isSpeakingMsgIndex === idx ? (
                                <>
                                  <VolumeX className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                  <span className="text-amber-400">Stop Speaking</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3.5 w-3.5 shrink-0" />
                                  <span>Listen Aloud</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* User Avatar */}
                        {isUser && (
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <User className="h-4.5 w-4.5 text-indigo-400" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  
                  {/* Typing simulator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 w-full justify-start"
                    >
                      <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-md shrink-0">
                        {activeChatTutor.emoji}
                      </div>
                      <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl rounded-tl-none shadow-md text-slate-400 font-bold text-xs flex items-center gap-2 select-none shrink-0">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                        <span>Tutor is formulating response...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input form bar */}
              <div className="bg-slate-950/50 border border-slate-850/85 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-md select-none shrink-0">
                <Input
                  placeholder={`Converse with ${activeChatTutor.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  disabled={isTyping}
                  className="bg-slate-950 border-slate-850/80 rounded-xl h-11 flex-1 text-slate-200 px-4 focus:border-indigo-500"
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="h-11 w-11 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all shrink-0 flex items-center justify-center p-0 shadow-md shadow-indigo-600/20"
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] w-full p-2 sm:p-4 text-white overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-900">
      <ConstellationCanvas />
      
      {/* Ambient background glow highlights */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col h-full min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key="marketplace"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 flex flex-col h-full"
          >
            {/* Header dashboard layout */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2.5">
                  <Store className="h-7 w-7 text-indigo-400" />
                  Tutor Marketplace
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Enable shared intelligence: Create and publish AI subject tutors, or activate ones shared by others!
                </p>
              </div>
              
              {/* Visual state selector tabs */}
              <div className="bg-slate-950/80 border border-slate-850 p-1.5 rounded-2xl flex items-center shadow-lg backdrop-blur-md">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
                    activeTab === 'browse'
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-indigo-500/30 text-indigo-300'
                      : 'text-slate-550 hover:text-slate-350'
                  }`}
                >
                  Browse Tutors
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
                      activeTab === 'create'
                        ? 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-indigo-500/30 text-indigo-300'
                        : 'text-slate-555 hover:text-slate-350'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create a Tutor
                  </button>
                )}

              </div>
            </div>

            {/* BROWSE TUTORS TAB */}
            {activeTab === 'browse' && (
              <div className="space-y-6 flex-grow">
                {/* Filters bar */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                    <Input
                      placeholder="Search tutors by name, features..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950/60 border-slate-850 pl-10 h-10.5 rounded-xl text-slate-200"
                    />
                  </div>
                  
                  {/* Category tabs */}
                  <div className="flex flex-wrap gap-2">
                    {['all', 'Grammar', 'Vocabulary', 'Phonics', 'Writing', 'Business English'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                          selectedCategory === cat
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-extrabold shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                            : 'bg-slate-950/30 border-slate-850 text-slate-500 hover:border-slate-800'
                        }`}
                      >
                        {cat === 'all' ? 'All Subjects' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tutors card grid */}
                {filteredTutors.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-3xl">
                    <Search className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <h4 className="font-extrabold text-slate-400 text-lg">No AI Modules Found</h4>
                    <p className="text-xs text-slate-550 max-w-xs mx-auto mt-1 leading-relaxed">
                      No AI tutors match your search. Be the pioneer and create the first custom module!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 relative">
                    {filteredTutors.map((t) => (
                      <Card 
                        key={t.id}
                        className="bg-slate-900/40 border-slate-850/80 hover:border-indigo-500/30 backdrop-blur-xl rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
                      >
                        <CardHeader className="flex flex-row items-start justify-between gap-4 p-5 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl bg-slate-950/50 p-2.5 rounded-xl border border-slate-850 shadow-inner select-none">{t.emoji}</span>
                            <div className="min-w-0">
                              <CardTitle className="text-slate-100 font-black text-lg truncate">{t.name}</CardTitle>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 select-none">
                                <Badge className="bg-indigo-500/15 border-none text-indigo-400 text-[9px] font-black uppercase py-0.5 px-2">
                                  {t.category}
                                </Badge>
                                {t.isPreset && (
                                  <Badge className="bg-amber-500/15 border-none text-amber-400 text-[9px] font-black uppercase py-0.5 px-2 flex items-center gap-0.5">
                                    <ShieldCheck className="h-2.5 w-2.5" /> Preset
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Rating badge */}
                          <div className="flex items-center gap-1 text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 text-xs font-bold shrink-0">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{t.rating.toFixed(1)}</span>
                          </div>
                        </CardHeader>

                        <CardContent className="px-5 py-2">
                          <p className="text-slate-400 text-xs font-semibold leading-relaxed line-clamp-3">
                            {t.description}
                          </p>
                        </CardContent>

                        <CardFooter className="p-5 pt-3 border-t border-slate-850 bg-slate-950/15 flex items-center justify-between gap-4 select-none">
                          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-extrabold">
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3 shrink-0" />
                              <span>{t.downloads.toLocaleString()} downloads</span>
                            </span>
                            <span className="truncate max-w-[90px]">By {t.author}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingTutor(t)}
                                  className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 p-0 flex items-center justify-center shrink-0"
                                  title="Edit Tutor"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTutor(t.id)}
                                  className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:text-rose-455 p-0 flex items-center justify-center shrink-0"
                                  title="Delete Tutor"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => handleStartChat(t)}
                              className="h-8 px-4 text-xs font-black uppercase rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <MessageSquare className="h-3.5 w-3.5 fill-current" />
                              <span>Activate & Chat</span>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

             {/* CREATE TUTOR FORM TAB */}
            {/* CREATE TUTOR FORM TAB - NON-ADMIN ACCESS DENIED */}
            {activeTab === 'create' && !isAdmin && (
              <Card className="bg-slate-900/40 border-slate-850/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-xl mx-auto w-full text-center space-y-6 select-none my-10">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest">Admin Credentials Required</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                    The AI Tutor Architect suite is an administrator-exclusive tool. Log in with an admin account to create, verify, and publish custom tutor mainframes to the marketplace.
                  </p>
                </div>
                <Button onClick={() => setActiveTab('browse')} className="bg-slate-950 border border-slate-880 text-slate-400 font-extrabold uppercase text-xs h-10 px-6 rounded-xl">
                  Return to Marketplace
                </Button>
              </Card>
            )}

            {/* CREATE TUTOR FORM TAB - ADMIN WORKSPACE */}
            {activeTab === 'create' && isAdmin && (
              <Card className="bg-slate-900/40 border-slate-850/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 max-w-4xl mx-auto w-full">
                <CardHeader className="p-0 pb-6 border-b border-slate-850/80 flex flex-row items-center gap-3 select-none">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Code className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-100 font-black text-xl uppercase tracking-wider">AI Tutor Architect</CardTitle>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Customize, instruct, and share a brand new specialized learning companion!</p>
                  </div>
                </CardHeader>
                
                <form onSubmit={handleCreateTutor} className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Name field */}
                    <div className="sm:col-span-3 space-y-1.5">
                      <Label className="text-xs font-black uppercase text-indigo-455 tracking-wider">Tutor Name</Label>
                      <Input
                        placeholder="e.g. Med Vocabulary Surgeon"
                        value={tutorName}
                        onChange={(e) => setTutorName(e.target.value)}
                        className="bg-slate-950 border-slate-850 rounded-xl h-11 text-slate-200"
                      />
                    </div>
                    
                    {/* Emoji field */}
                    <div className="sm:col-span-1 space-y-1.5">
                      <Label className="text-xs font-black uppercase text-indigo-455 tracking-wider">Avatar Emoji</Label>
                      <Input
                        placeholder="🎓"
                        maxLength={2}
                        value={tutorEmoji}
                        onChange={(e) => setTutorEmoji(e.target.value)}
                        className="bg-slate-950 border-slate-850 rounded-xl h-11 text-center text-lg text-slate-200 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category field */}
                    <div className="space-y-1.5 select-none">
                      <Label className="text-xs font-black uppercase text-indigo-455 tracking-wider">Subject Category</Label>
                      <select
                        value={tutorCategory}
                        onChange={(e) => setTutorCategory(e.target.value as Tutor['category'])}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl h-11 px-3.5 text-xs text-slate-400 font-bold focus:border-indigo-500 focus:outline-none"
                      >
                        {['Grammar', 'Vocabulary', 'Phonics', 'Writing', 'Business English'].map(c => (
                          <option key={c} value={c} className="bg-slate-950 text-slate-350 font-bold">{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Author field */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-black uppercase text-indigo-455 tracking-wider">Creator Name</Label>
                      <Input
                        placeholder="e.g. Professor Sarah"
                        value={tutorAuthor}
                        onChange={(e) => setTutorAuthor(e.target.value)}
                        className="bg-slate-950 border-slate-850 rounded-xl h-11 text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Description field */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase text-indigo-455 tracking-wider">Marketplace Description</Label>
                    <Textarea
                      placeholder="What should users expect from your tutor? E.g., 'Learn anatomical prefixes and medical terminologies using clinical diagnostic games...'"
                      value={tutorDesc}
                      onChange={(e) => setTutorDesc(e.target.value)}
                      rows={2}
                      className="bg-slate-950 border-slate-850 rounded-xl resize-none text-slate-200"
                    />
                  </div>

                  {/* System prompt / Instructions field */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase text-indigo-455 tracking-wider flex justify-between items-center">
                      <span>System Prompt & Instructions</span>
                      <span className="text-[10px] text-indigo-400 lowercase font-bold flex items-center gap-1 select-none">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        injected into Gemini neural mainframe
                      </span>
                    </Label>
                    <Textarea
                      placeholder="Provide detailed behavioral constraints. E.g., 'Act as a professional medical surgeon. Respond in clinical terms, explain latin prefixes, and test the user on patient diagnostic scenarios...'"
                      value={tutorPrompt}
                      onChange={(e) => setTutorPrompt(e.target.value)}
                      rows={4}
                      className="bg-slate-950 border-slate-850 rounded-xl resize-none text-slate-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-xs tracking-wider h-11 rounded-xl transition-all duration-300 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    Share & Publish Tutor Module
                  </Button>
                </form>
              </Card>
            )}

          </motion.div>
        </AnimatePresence>

        {/* EDIT TUTOR ARCHITECT FORM MODAL (Admin-Only) */}
        {editingTutor && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <Card className="bg-slate-900 border-slate-850/80 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full my-8 relative">
              <button
                onClick={() => setEditingTutor(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-extrabold text-xs"
              >
                ✕
              </button>
              <CardHeader className="p-0 pb-6 border-b border-slate-850 flex flex-row items-center gap-3 select-none">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-455">
                  <Pencil className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-slate-100 font-black text-xl uppercase tracking-wider">Configure Tutor Module</CardTitle>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Admin Panel: Fine-tune prompts and marketplace configurations.</p>
                </div>
              </CardHeader>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateTutor(editingTutor);
                }} 
                className="space-y-4 pt-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-3 space-y-1.5">
                    <Label className="text-xs font-black uppercase text-amber-455 tracking-wider">Tutor Name</Label>
                    <Input
                      placeholder="Name..."
                      value={editingTutor.name}
                      onChange={(e) => setEditingTutor({ ...editingTutor, name: e.target.value })}
                      className="bg-slate-950 border-slate-850 rounded-xl h-11 text-slate-200"
                    />
                  </div>
                  
                  {/* Emoji */}
                  <div className="sm:col-span-1 space-y-1.5">
                    <Label className="text-xs font-black uppercase text-amber-455 tracking-wider">Avatar Emoji</Label>
                    <Input
                      placeholder="🎓"
                      maxLength={2}
                      value={editingTutor.emoji}
                      onChange={(e) => setEditingTutor({ ...editingTutor, emoji: e.target.value })}
                      className="bg-slate-950 border-slate-850 rounded-xl h-11 text-center text-lg text-slate-200 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5 select-none">
                    <Label className="text-xs font-black uppercase text-amber-455 tracking-wider">Subject Category</Label>
                    <select
                      value={editingTutor.category}
                      onChange={(e) => setEditingTutor({ ...editingTutor, category: e.target.value as Tutor['category'] })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl h-11 px-3.5 text-xs text-slate-400 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      {['Grammar', 'Vocabulary', 'Phonics', 'Writing', 'Business English'].map(c => (
                        <option key={c} value={c} className="bg-slate-950 text-slate-350 font-bold">{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Author */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase text-amber-455 tracking-wider">Creator Name</Label>
                    <Input
                      placeholder="Author..."
                      value={editingTutor.author}
                      onChange={(e) => setEditingTutor({ ...editingTutor, author: e.target.value })}
                      className="bg-slate-950 border-slate-850 rounded-xl h-11 text-slate-200"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase text-amber-455 tracking-wider">Marketplace Description</Label>
                  <Textarea
                    placeholder="Description..."
                    value={editingTutor.description}
                    onChange={(e) => setEditingTutor({ ...editingTutor, description: e.target.value })}
                    rows={2}
                    className="bg-slate-950 border-slate-850 rounded-xl resize-none text-slate-200"
                  />
                </div>

                {/* System prompt */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase text-amber-455 tracking-wider flex justify-between items-center">
                    <span>System Prompt & Instructions</span>
                    <span className="text-[10px] text-amber-400 lowercase font-bold flex items-center gap-1 select-none">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      injected into Gemini neural mainframe
                    </span>
                  </Label>
                  <Textarea
                    placeholder="Instructions..."
                    value={editingTutor.prompt}
                    onChange={(e) => setEditingTutor({ ...editingTutor, prompt: e.target.value })}
                    rows={5}
                    className="bg-slate-950 border-slate-850 rounded-xl resize-none text-slate-200"
                  />
                </div>

                <div className="pt-4 flex gap-3 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingTutor(null)}
                    className="bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 font-extrabold uppercase text-xs h-11 px-5 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black uppercase text-xs tracking-wider h-11 rounded-xl shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
                  >
                    <span>Save System Changes</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


