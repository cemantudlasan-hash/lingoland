'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { 
  Sparkles, Heart, Zap, Brain, ShoppingBag, MessageSquare, 
  HelpCircle, ChevronRight, Coins, RefreshCw, AlertCircle, Play, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { LingoPetVisual } from '@/components/games/lingo-pet-visual';
import { generatePetChatResponse } from '@/ai/flows/generate-pet-chat';
import type { UserPet } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Wake-up quiz questions
const WAKEUP_QUESTIONS = [
  {
    question: "Which of the following is a synonym of 'Vast'?",
    options: ["Tiny", "Huge", "Narrow", "Slow"],
    answer: "Huge",
  },
  {
    question: "Complete the sentence: 'She has been ___ English since morning.'",
    options: ["studying", "study", "studied", "studies"],
    answer: "studying",
  },
  {
    question: "What is the antonym of 'Generous'?",
    options: ["Kind", "Selfish", "Happy", "Polite"],
    answer: "Selfish",
  },
  {
    question: "Select the sentence with correct grammar:",
    options: [
      "He don't like apples.",
      "She doesn't likes apples.",
      "He doesn't like apples.",
      "They doesn't like apples."
    ],
    answer: "He doesn't like apples.",
  },
  {
    question: "What does the idiom 'Piece of cake' mean?",
    options: ["Very easy", "Very hard", "A slice of dessert", "A birthday gift"],
    answer: "Very easy",
  },
  {
    question: "What is the antonym of 'Reluctant'?",
    options: ["Eager", "Hesitant", "Slow", "Careful"],
    answer: "Eager",
  },
  {
    question: "Which of the following is a synonym of 'Exquisite'?",
    options: ["Ugly", "Ordinary", "Beautiful", "Old"],
    answer: "Beautiful",
  },
  {
    question: "Complete the sentence: 'By the time the movie started, we ___ our popcorn.'",
    options: ["eat", "have eaten", "had eaten", "will eat"],
    answer: "had eaten",
  },
  {
    question: "Which word is a noun?",
    options: ["Quickly", "Happiness", "Beautiful", "Under"],
    answer: "Happiness",
  },
  {
    question: "What does the idiom 'Bite the bullet' mean?",
    options: ["Eat something hard", "Face a difficult situation with courage", "Shoot a gun", "Give up"],
    answer: "Face a difficult situation with courage",
  },
  {
    question: "Complete the sentence: 'If I ___ you, I would study harder.'",
    options: ["was", "am", "were", "be"],
    answer: "were",
  },
  {
    question: "What does the idiom 'Break a leg' mean?",
    options: ["Get hurt", "Good luck", "Run fast", "Dance well"],
    answer: "Good luck",
  },
  {
    question: "What is the antonym of 'Plentiful'?",
    options: ["Scarce", "Abundant", "Rich", "Green"],
    answer: "Scarce",
  },
  {
    question: "Complete the sentence: 'She is very good ___ playing the piano.'",
    options: ["on", "at", "in", "with"],
    answer: "at",
  },
  {
    question: "Which sentence is in the passive voice?",
    options: [
      "John wrote the letter.",
      "The letter was written by John.",
      "John is writing a letter.",
      "John has written a letter."
    ],
    answer: "The letter was written by John.",
  },
  {
    question: "Which of the following is a synonym of 'Meticulous'?",
    options: ["Lazy", "Messy", "Careful", "Quick"],
    answer: "Careful",
  },
  {
    question: "Complete the sentence: 'I look forward to ___ you soon.'",
    options: ["meet", "meeting", "met", "meets"],
    answer: "meeting",
  },
  {
    question: "What does the idiom 'Spill the beans' mean?",
    options: ["Cook dinner", "Reveal a secret", "Clean the floor", "Drop food"],
    answer: "Reveal a secret",
  },
  {
    question: "What is the antonym of 'Arrogant'?",
    options: ["Proud", "Humble", "Angry", "Loud"],
    answer: "Humble",
  },
  {
    question: "Complete the sentence: 'The weather was bad, ___ they decided to go anyway.'",
    options: ["so", "because", "yet", "although"],
    answer: "yet",
  },
  {
    question: "Which word is spelled correctly?",
    options: ["Acommodate", "Accomodate", "Accommodate", "Acomodate"],
    answer: "Accommodate",
  },
  {
    question: "What does the idiom 'Under the weather' mean?",
    options: ["In the rain", "Feeling slightly sick", "Below the clouds", "Happy"],
    answer: "Feeling slightly sick",
  },
  {
    question: "Complete the sentence: 'He has a lot of influence ___ his younger brother.'",
    options: ["at", "over", "with", "to"],
    answer: "over",
  },
  {
    question: "Which of the following is a synonym of 'Vigilant'?",
    options: ["Sleepy", "Watchful", "Careless", "Strong"],
    answer: "Watchful",
  },
  {
    question: "What is the antonym of 'Amateur'?",
    options: ["Novice", "Professional", "Beginner", "Player"],
    answer: "Professional",
  },
  {
    question: "Which of the following is a relative pronoun?",
    options: ["He", "Who", "Slowly", "Run"],
    answer: "Who",
  },
  {
    question: "Complete the sentence: 'The book ___ I borrowed yesterday is very interesting.'",
    options: ["who", "whose", "which", "where"],
    answer: "which",
  },
  {
    question: "What does the idiom 'Once in a blue moon' mean?",
    options: ["Every night", "Very rarely", "During the day", "Once a month"],
    answer: "Very rarely",
  },
  {
    question: "Complete the sentence: 'He is the ___ of the two brothers.'",
    options: ["tall", "taller", "tallest", "more tall"],
    answer: "taller",
  },
  {
    question: "Which of the following is a synonym of 'Cooperate'?",
    options: ["Compete", "Collaborate", "Argue", "Divide"],
    answer: "Collaborate",
  }
];

const SHOP_ITEMS = [
  // Hats
  { id: 'aurora_crown', name: 'Aurora Crown', price: 325, category: 'hat', icon: '👑', description: 'A premium neon crown displaying color-shifting polar lights.' },
  { id: 'dragon_horns', name: 'Dragon Horns', price: 280, category: 'hat', icon: '😈', description: 'Fiery glowing horns from the volcanic peaks.' },
  { id: 'angel_halo', name: 'Angel Halo', price: 240, category: 'hat', icon: '😇', description: 'A floating celestial halo with divine golden glow.' },
  { id: 'crown', name: 'Golden Crown', price: 150, category: 'hat', icon: '👑', description: 'Royal headwear for the best student.' },
  { id: 'wizard_hat', name: 'Wizard Hat', price: 100, category: 'hat', icon: '🧙‍♂️', description: 'Imbued with grammar magic.' },
  { id: 'detective_cap', name: 'Detective Cap', price: 80, category: 'hat', icon: '🕵️‍♂️', description: 'Solve vocabulary mysteries.' },
  { id: 'party_hat', name: 'Party Hat', price: 40, category: 'hat', icon: '🥳', description: 'Celebrate learning milestones!' },
  
  // Glasses
  { id: 'laser_visor', name: 'Laser Visor', price: 260, category: 'glasses', icon: '🕶️', description: 'A futuristic cybernetic visor with scanning laser line.' },
  { id: 'monocle', name: 'Golden Monocle', price: 90, category: 'glasses', icon: '🧐', description: 'Look highly sophisticated.' },
  { id: 'cool_shades', name: 'Cool Shades', price: 60, category: 'glasses', icon: '😎', description: 'Too cool for grammar errors.' },
  { id: 'gold_glasses', name: 'Scholar Glasses', price: 50, category: 'glasses', icon: '👓', description: 'Boost reading focus.' },

  // Background environments
  { id: 'bg_london', name: 'London Study', price: 200, category: 'background', icon: '💂', value: 'london-study', description: 'A cozy library room overlooking London.' },
  { id: 'bg_tokyo', name: 'Tokyo Garden', price: 200, category: 'background', icon: '🌸', value: 'tokyo-garden', description: 'A peaceful garden with cherry blossoms.' },
  { id: 'bg_nyc', name: 'NYC Cafe', price: 200, category: 'background', icon: '☕', value: 'nyc-cafe', description: 'A vibrant coffee shop in Manhattan.' },
];

export default function LingoPetPage() {
  const { user, isGuest, isAdmin = false } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [pet, setPet] = React.useState<UserPet | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeSubTab, setActiveSubTab] = React.useState<'feed' | 'shop' | 'chat'>('feed');

  // AI Chat States
  const [chatMessage, setChatMessage] = React.useState<string>('Hoo! Hello! Click "Chat" to talk to me, or pet me to boost my mood!');
  const [chatInput, setChatInput] = React.useState<string>('');
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [recentGames, setRecentGames] = React.useState<string[]>([]);

  // Animation micro-triggers
  const [isPetting, setIsPetting] = React.useState(false);
  const [isTalking, setIsTalking] = React.useState(false);

  // Wake-up Quiz States
  const [quizActive, setQuizActive] = React.useState(false);
  const [quizStep, setQuizStep] = React.useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = React.useState<string | null>(null);
  const [quizScore, setQuizScore] = React.useState(0);
  const [currentQuizQuestions, setCurrentQuizQuestions] = React.useState<typeof WAKEUP_QUESTIONS>([]);

  // Load Lingo-Pet on mount
  React.useEffect(() => {
    loadPetData();
    loadRecentGamesAnalytics();
  }, [user, isGuest]);

  // Fetch recent platform analytics to give pet customized context
  const loadRecentGamesAnalytics = async () => {
    if (!firestore || !user || isGuest) return;
    try {
      const q = query(
        collection(firestore, 'analytics'),
        where('userId', '==', user.uid),
        where('type', '==', 'game_played'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const games = snapshot.docs.map(doc => doc.data().details?.title || 'English Game');
      setRecentGames(games);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPetData = async () => {
    setLoading(true);
    const defaultPet: UserPet = {
      userId: user?.uid || 'guest',
      petType: 'owl',
      petName: 'Lingo',
      level: 1,
      xp: 150,
      energy: 85,
      intelligence: 60,
      mood: 75,
      coins: 120, // Default coins to buy some initial shop cosmetics
      unlockedCosmetics: [],
      equippedCosmetics: {},
      currentBackground: 'cozy-room',
      lastActive: new Date().toISOString(),
    };

    if (isGuest || !user || !firestore) {
      // Load Guest Pet from Local Storage
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('lingoland_guest_pet');
        if (local) {
          try {
            const parsed = JSON.parse(local) as UserPet;
            const updated = applyDecay(parsed);
            setPet(updated);
            localStorage.setItem('lingoland_guest_pet', JSON.stringify(updated));
          } catch (e) {
            setPet(defaultPet);
            localStorage.setItem('lingoland_guest_pet', JSON.stringify(defaultPet));
          }
        } else {
          setPet(defaultPet);
          localStorage.setItem('lingoland_guest_pet', JSON.stringify(defaultPet));
        }
      }
      setLoading(false);
      return;
    }

    // Load Authenticated Pet from Firestore
    try {
      const petRef = doc(firestore, 'user_pets', user.uid);
      const docSnap = await getDoc(petRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserPet;
        const updated = applyDecay(data);
        setPet(updated);
        // Save back decayed state
        await setDoc(petRef, updated, { merge: true });
      } else {
        setPet(defaultPet);
        await setDoc(petRef, defaultPet);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error Loading Pet",
        description: "Failed to connect to Lingo-Pet server.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Perform time-based decay of energy & mood stats
  const applyDecay = (petData: UserPet): UserPet => {
    const lastActiveTime = new Date(petData.lastActive).getTime();
    const nowTime = new Date().getTime();
    const hoursElapsed = (nowTime - lastActiveTime) / (1000 * 60 * 60);

    if (hoursElapsed >= 24) {
      // Calculate multiplier based on full 24h cycles missed
      const daysMissed = Math.floor(hoursElapsed / 24);
      const energyDecay = daysMissed * 15;
      const moodDecay = daysMissed * 10;

      const newEnergy = Math.max(0, petData.energy - energyDecay);
      const newMood = Math.max(0, petData.mood - moodDecay);

      return {
        ...petData,
        energy: newEnergy,
        mood: newMood,
        lastActive: new Date().toISOString(), // Reset clock to now
      };
    }
    return petData;
  };

  const updatePetState = async (updates: Partial<UserPet>) => {
    if (!pet) return;
    const newPet = { ...pet, ...updates };
    setPet(newPet);

    if (isGuest || !user || !firestore) {
      localStorage.setItem('lingoland_guest_pet', JSON.stringify(newPet));
    } else {
      try {
        const petRef = doc(firestore, 'user_pets', user.uid);
        await setDoc(petRef, updates, { merge: true });
      } catch (e) {
        console.error("Failed to sync pet state:", e);
      }
    }
  };

  // Petting interaction
  const handlePet = () => {
    if (!pet || pet.energy === 0) return;
    setIsPetting(true);
    setChatMessage(`${pet.petType === 'owl' ? 'Hoo!' : pet.petType === 'dino' ? 'Rawr!' : 'Meow!'} That tickles! Let's study English!`);
    const newMood = Math.min(100, pet.mood + 10);
    const newCoins = pet.coins + 5; // Petting yields minor coins
    updatePetState({ mood: newMood, coins: newCoins });
    setTimeout(() => setIsPetting(false), 800);
  };

  // Feed interaction
  const handleFeed = () => {
    if (!pet || pet.energy === 0) return;
    if (!isAdmin && pet.coins < 15) {
      toast({
        title: "Insufficient Coins",
        description: "Feeding snacks costs 15 Lingo-Coins. Complete games to earn more!",
      });
      return;
    }
    setChatMessage(`Nom Nom Nom... Yummy! I feel full of energy now!`);
    const newEnergy = Math.min(100, pet.energy + 20);
    const newMood = Math.min(100, pet.mood + 10);
    const newCoins = isAdmin ? pet.coins : pet.coins - 15;
    updatePetState({ energy: newEnergy, mood: newMood, coins: newCoins });
  };

  // Select Pet Species
  const handleSelectPetType = (type: 'owl' | 'dino' | 'kitty') => {
    if (!pet) return;
    const names = { owl: 'Lingo', dino: 'Pip', kitty: 'Mimi' };
    updatePetState({ petType: type, petName: names[type] });
    setChatMessage(`I've evolved into an ${type}! Meet ${names[type]}!`);
  };

  // Lingo-Shop Logic
  const handlePurchase = (item: typeof SHOP_ITEMS[number]) => {
    if (!pet) return;
    if (!isAdmin && pet.coins < item.price) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: "You don't have enough Lingo-Coins.",
      });
      return;
    }

    if (pet.unlockedCosmetics.includes(item.id)) {
      toast({
        title: "Already Owned",
        description: `You already own the ${item.name}!`,
      });
      return;
    }

    const updatedUnlocked = [...pet.unlockedCosmetics, item.id];
    const newCoins = isAdmin ? pet.coins : pet.coins - item.price;
    updatePetState({ unlockedCosmetics: updatedUnlocked, coins: newCoins });
    toast({
      title: "Item Purchased!",
      description: isAdmin 
        ? `Unlocked ${item.name} for free (Admin Mode)!` 
        : `Bought ${item.name} for ${item.price} coins!`,
    });
  };

  const handleEquip = (item: typeof SHOP_ITEMS[number]) => {
    if (!pet) return;

    if (item.category === 'background') {
      const val = item.value || 'cozy-room';
      updatePetState({ currentBackground: val });
      toast({ title: "Background Changed", description: `Equipped ${item.name} background!` });
      return;
    }

    const currentEquipped = { ...pet.equippedCosmetics };
    if (item.category === 'hat') {
      currentEquipped.hat = currentEquipped.hat === item.id ? undefined : item.id;
    } else if (item.category === 'glasses') {
      currentEquipped.glasses = currentEquipped.glasses === item.id ? undefined : item.id;
    }

    updatePetState({ equippedCosmetics: currentEquipped });
    toast({
      title: "Outfit Updated",
      description: `Equipped/Unequipped ${item.name}!`,
    });
  };

  // AI Chat Handler
  const handleSendChat = async () => {
    if (!pet || !chatInput.trim()) return;
    setAiLoading(true);
    setIsTalking(true);
    const queryText = chatInput;
    setChatInput('');

    try {
      const res = await generatePetChatResponse({
        petName: pet.petName,
        petType: pet.petType,
        level: pet.level,
        energy: pet.energy,
        intelligence: pet.intelligence,
        mood: pet.mood,
        recentGames: recentGames.length > 0 ? recentGames : ['Bio Hazard', 'Synonym Sniper'],
        userName: user?.displayName || 'Student',
        userInput: queryText,
      });

      setChatMessage(res.message);
      if (res.suggestedAction) {
        toast({
          title: "Study Tip",
          description: `Your pet suggests playing ${res.suggestedAction} to level up!`,
          duration: 6000,
        });
      }
    } catch (err) {
      console.error(err);
      setChatMessage("Hoo... My brain signals got tangled. Let's try again in a bit!");
    } finally {
      setAiLoading(false);
      setIsTalking(false);
    }
  };

  // Wake-up quiz trigger
  const handleStartWakeupQuiz = () => {
    // Shuffle and pick 5 unique questions
    const shuffled = [...WAKEUP_QUESTIONS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setCurrentQuizQuestions(selected);
    setQuizActive(true);
    setQuizStep(0);
    setQuizScore(0);
    setSelectedQuizAnswer(null);
  };

  const handleSelectQuizAnswer = (option: string) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(option);
    const currentQ = currentQuizQuestions[quizStep];
    if (currentQ && option === currentQ.answer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    if (quizStep + 1 < currentQuizQuestions.length) {
      setQuizStep(prev => prev + 1);
    } else {
      // Quiz finished
      setQuizActive(false);
      const passed = quizScore >= 3;
      if (passed) {
        toast({
          title: "Wake-up Success!",
          description: "Your pet has woken up and recovered 50 Energy Points!",
        });
        updatePetState({ energy: 50 });
        setChatMessage(`Hoo! I'm wide awake now! Thanks for feeding my brain with those quiz answers!`);
      } else {
        toast({
          variant: "destructive",
          title: "Quiz Failed",
          description: "Scored under 60%. Try again to wake up your pet.",
        });
        setChatMessage(`Zzz... I'm still too tired. Please try the wake-up quiz again!`);
      }
    }
  };

  // Force simulated decay to 0 energy to test wake-up quiz
  const simulateSleepDecay = () => {
    updatePetState({ energy: 0 });
    setChatMessage("Zzz... I'm too tired. Wake me up with a brain quiz!");
    toast({
      title: "Decay Simulated",
      description: "Pet energy reduced to 0. It has fallen asleep.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
          <span className="text-sm text-slate-400">Loading Lingo-Pet companion...</span>
        </div>
      </div>
    );
  }

  if (!pet) return null;

  const isSleeping = pet.energy === 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-2 md:p-6 text-slate-100 relative">
      
      {/* Top Floating Coins Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-200 via-indigo-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2.5">
            <Sparkles className="h-7 w-7 text-indigo-400" />
            Lingo-Pet Companion
          </h1>
          <p className="text-xs text-slate-400">Your visual language study feedback loop & companion</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <Coins className="h-5 w-5 text-amber-400 animate-pulse" />
            <span className="font-black text-amber-300 text-sm">
              {isAdmin ? "∞" : pet.coins} Lingo-Coins
            </span>
            {isAdmin && (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold px-2 py-0 h-5">
                Admin
              </Badge>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={simulateSleepDecay} 
            className="text-[10px] text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
          >
            Simulate Sleep Decay
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THE PET VIEW & QUICK STATS */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md overflow-hidden relative group">
            {/* Visualizer Panel */}
            <div className="p-3">
              <LingoPetVisual
                petType={pet.petType}
                level={pet.level}
                energy={pet.energy}
                mood={pet.mood}
                equippedCosmetics={pet.equippedCosmetics}
                currentBackground={pet.currentBackground}
                isPetting={isPetting}
                isSleeping={isSleeping}
                isTalking={isTalking}
              />
            </div>

            {/* Overlaid Wake-up Quiz Prompt if asleep */}
            {isSleeping && !quizActive && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center z-30 transition-all">
                <AlertCircle className="h-12 w-12 text-amber-500 animate-bounce mb-3" />
                <h3 className="font-extrabold text-lg text-slate-100">Pet is Asleep</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                  Your pet is too tired because you haven't practiced or logged in. Solve a quick quiz to wake it up!
                </p>
                <Button 
                  onClick={handleStartWakeupQuiz}
                  className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-6 shadow-md shadow-amber-500/20"
                >
                  <Play className="h-4 w-4 mr-1.5 fill-slate-950" />
                  Take Wake-up Quiz
                </Button>
              </div>
            )}

            {/* Active Wake-up Quiz Interface */}
            {quizActive && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col justify-between p-6 z-30">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Brain Activation Quiz</span>
                    <span className="text-xs text-slate-500">Question {quizStep + 1} of {currentQuizQuestions.length}</span>
                  </div>
                  
                  {(() => {
                    const currentQ = currentQuizQuestions[quizStep];
                    if (!currentQ) return null;
                    return (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-sm font-bold text-slate-200">{currentQ.question}</h4>
                        <div className="flex flex-col gap-2.5">
                          {currentQ.options.map((option, idx) => {
                            const isSelected = selectedQuizAnswer === option;
                            const isCorrect = option === currentQ.answer;
                            const hasAnswered = selectedQuizAnswer !== null;

                            let optClass = "border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300";
                            if (hasAnswered) {
                              if (isCorrect) optClass = "border-green-500/50 bg-green-500/10 text-green-300";
                              else if (isSelected) optClass = "border-rose-500/50 bg-rose-500/10 text-rose-300";
                              else optClass = "border-slate-900 bg-slate-950/20 opacity-40";
                            }

                            return (
                              <button
                                key={idx}
                                disabled={hasAnswered}
                                onClick={() => handleSelectQuizAnswer(option)}
                                className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all ${optClass}`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-900">
                  {selectedQuizAnswer !== null && (
                    <Button 
                      onClick={handleNextQuizQuestion}
                      className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold"
                      size="sm"
                    >
                      {quizStep + 1 === currentQuizQuestions.length ? "Finish Quiz" : "Next Question"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Quick action buttons below pet card */}
            <CardFooter className="p-4 bg-slate-950/40 border-t border-slate-900/60 flex justify-between gap-3">
              <Button
                variant="outline"
                disabled={isSleeping}
                onClick={handlePet}
                className="flex-1 bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-200 gap-1.5 h-11 text-xs"
              >
                <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
                Pet mascot (+Mood)
              </Button>
              <Button
                variant="outline"
                disabled={isSleeping}
                onClick={handleFeed}
                className="flex-1 bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-200 gap-1.5 h-11 text-xs"
              >
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                Feed snack (15 🪙)
              </Button>
            </CardFooter>
          </Card>

          {/* Level Progress details */}
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Level {pet.level} Progress</span>
              <span className="font-bold text-indigo-400">{pet.xp} / {pet.level * 500} XP</span>
            </div>
            <Progress value={(pet.xp / (pet.level * 500)) * 100} className="bg-slate-950 h-2" />
            <p className="text-[10px] text-slate-500 leading-normal mt-1">
              🏆 Earn **100 XP** and **10 Coins** automatically every time you complete a vocabulary, reading, or science quiz game on LingoLand!
            </p>
          </Card>
        </div>

        {/* RIGHT COLUMN: VITALITY BARS, SHOP, SPEECH & ACTIONS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Pet Dialogue Speech Bubble */}
          <div className="bg-indigo-650/15 border border-indigo-500/20 rounded-2xl p-4 relative flex items-start gap-3 shadow-inner">
            <div className="text-2xl p-2 bg-indigo-500/10 rounded-xl">💬</div>
            <div className="flex-grow">
              <div className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider mb-1">
                {pet.petName} the {pet.petType}
              </div>
              <p className="text-xs md:text-sm text-indigo-200/90 leading-relaxed font-medium">
                {chatMessage}
              </p>
            </div>
            {/* Ambient bubble tail */}
            <div className="absolute left-6 -bottom-2 w-4 h-4 bg-indigo-950/90 border-r border-b border-indigo-500/20 transform rotate-45 pointer-events-none" />
          </div>

          {/* Vitality Bars Card */}
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md p-6">
            <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-400" />
              Mascot Vitality Indicators
            </h3>
            <div className="flex flex-col gap-4">
              
              {/* Energy Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 fill-amber-400/20" />
                    Energy (Consistency)
                  </span>
                  <span className="font-bold text-amber-300">{pet.energy} / 100</span>
                </div>
                <Progress value={pet.energy} className="bg-slate-950 h-2.5" />
                <p className="text-[9px] text-slate-500">Decreases by 15 points every 24 hours missed. Wake up pet with a quiz if it hits 0.</p>
              </div>

              {/* Intelligence Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 fill-indigo-400/20" />
                    Intelligence (Platform Accuracy)
                  </span>
                  <span className="font-bold text-indigo-300">{pet.intelligence} / 100</span>
                </div>
                <Progress value={pet.intelligence} className="bg-slate-950 h-2.5" />
                <p className="text-[9px] text-slate-500">Increases when you score high marks in classroom tests and game activities.</p>
              </div>

              {/* Mood Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-pink-400 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 fill-pink-400/20" />
                    Mood (Happiness)
                  </span>
                  <span className="font-bold text-pink-300">{pet.mood} / 100</span>
                </div>
                <Progress value={pet.mood} className="bg-slate-950 h-2.5" />
                <p className="text-[9px] text-slate-500">Boost by petting (+10) or feeding snacks. Encourages high daily platform usage.</p>
              </div>

            </div>
          </Card>

          {/* Sub Navigation tabs */}
          <div className="flex gap-2 border-b border-slate-800/80 p-0.5">
            {(['feed', 'shop', 'chat'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-2 text-xs font-bold capitalize border-b-2 transition-all ${
                  activeSubTab === tab 
                    ? "border-indigo-500 text-indigo-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === 'feed' ? 'Evolution Setup' : tab === 'shop' ? 'Lingo-Shop' : 'AI Companion Chat'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            
            {/* EVOLUTION SETUP TAB */}
            {activeSubTab === 'feed' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-slate-300 uppercase tracking-wide">Evolution Morphing</h4>
                  <p className="text-xs text-slate-400 mt-1">Select the species of your language companion. Morphs carry over levels and outfits.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'owl', name: 'Lingo the Owl', icon: '🦉', desc: 'Wise & Scholar' },
                    { id: 'dino', name: 'Pip the Dino', icon: '🦖', desc: 'Energetic & Bubbly' },
                    { id: 'kitty', name: 'Mimi the Kitty', icon: '🐱', desc: 'Sweet & Playful' },
                  ].map(species => (
                    <button
                      key={species.id}
                      disabled={isSleeping}
                      onClick={() => handleSelectPetType(species.id as any)}
                      className={`p-4 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                        pet.petType === species.id 
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-3xl">{species.icon}</span>
                      <span className="text-xs font-bold">{species.name}</span>
                      <span className="text-[9px] opacity-70">{species.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SHOP TAB */}
            {activeSubTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-indigo-400" />
                    Lingo Cosmetics Store
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Unlock hats, glasses, and environments using platform achievements coins.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {SHOP_ITEMS.map(item => {
                    const isUnlocked = pet.unlockedCosmetics.includes(item.id) || item.id === 'bg_default';
                    
                    let isEquipped = false;
                    if (item.category === 'background') {
                      isEquipped = pet.currentBackground === item.value;
                    } else if (item.category === 'hat') {
                      isEquipped = pet.equippedCosmetics.hat === item.id;
                    } else if (item.category === 'glasses') {
                      isEquipped = pet.equippedCosmetics.glasses === item.id;
                    }

                    return (
                      <div 
                        key={item.id} 
                        className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl bg-slate-900 p-2 rounded-lg border border-slate-800">{item.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-200">{item.name}</div>
                            <div className="text-[10px] text-slate-500 leading-snug">{item.description}</div>
                          </div>
                        </div>
                        
                        <div>
                          {isUnlocked ? (
                            <Button
                              size="sm"
                              disabled={isSleeping}
                              onClick={() => handleEquip(item)}
                              className={`text-xs font-bold px-3 ${
                                isEquipped
                                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
                              }`}
                            >
                              {isEquipped ? 'Unequip' : 'Equip'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={isSleeping}
                              onClick={() => handlePurchase(item)}
                              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 flex items-center gap-1"
                            >
                              <span>{item.price}</span>
                              <Coins className="h-3 w-3 fill-slate-950" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* AI CHAT TAB */}
            {activeSubTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    AI Companion Dialogue
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Talk to {pet.petName}. Ask details about your progress, ask for grammar help, or just have a chat!
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    disabled={isSleeping || aiLoading}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isSleeping ? "Pet is asleep..." : "Ask me anything (e.g. 'How can I improve today?')..."}
                    className="flex-grow h-11 bg-slate-950 border border-slate-850 rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-100 disabled:opacity-50 placeholder:text-slate-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendChat();
                    }}
                  />
                  <Button
                    disabled={isSleeping || aiLoading || !chatInput.trim()}
                    onClick={handleSendChat}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-5"
                  >
                    {aiLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
