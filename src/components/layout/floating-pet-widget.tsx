'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LingoPet3D } from '@/components/games/lingo-pet-3d';
import { LingoPetVisual } from '@/components/games/lingo-pet-visual';
import { LingoPetType } from '@/lib/types';

const CLASSIC_PET_TYPES: LingoPetType[] = ['owl', 'dino', 'kitty', 'phoenix', 'morphling', 'godly'];

// In-memory session tracking: Keeps the pet hidden across all page navigations when closed by the user.
// Automatically resets to false when the user refreshes the page, revisits the site, or logs in again.
let isPetClosedInCurrentSession = false;

// Clear any stale sessionStorage flags on fresh page load/refresh/revisit
if (typeof window !== 'undefined') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('lingoland_floating_pet_closed')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch (e) {}
}

const MOTIVATIONAL_PRESETS = [
  "Believe in yourself! You're doing amazing! 🌟",
  "Every mistake is a step closer to learning! 🚀",
  "Keep going! I am so proud of your progress! 💖",
  "You're capable of incredible things! ✨",
  "Learning is a superpower, and you've got it! 🧠",
  "Take a deep breath. You're doing just fine! 🌿",
  "Small steps every day lead to big results! 📈",
  "Your hard work is paving the way to success! 🏆",
  "Stay positive, work hard, make it happen! 💪",
  "Mistakes are proof that you are trying! 🎨"
];

function getOrbStyles(type: string) {
  if (['igni', 'spark-fox', 'rune-stalker', 'ember-scribe', 'pyro-phoenix', 'dragon', 'phoenix'].includes(type)) {
    return 'bg-gradient-to-br from-slate-950/95 via-amber-950/80 to-rose-950/95 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.55)] hover:shadow-[0_0_35px_rgba(245,158,11,0.85)]';
  }
  if (['floby', 'tome-tortoise', 'lore-drake', 'seed-rooter', 'terra-keeper', 'dino'].includes(type)) {
    return 'bg-gradient-to-br from-slate-950/95 via-emerald-950/80 to-teal-950/95 border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.55)] hover:shadow-[0_0_35px_rgba(16,185,129,0.85)]';
  }
  if (['pip', 'echo-grif', 'acu-maestro', 'chirp-wing', 'sonic-storm', 'owl'].includes(type)) {
    return 'bg-gradient-to-br from-slate-950/95 via-cyan-950/80 to-sky-950/95 border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.55)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)]';
  }
  if (['kitty'].includes(type)) {
    return 'bg-gradient-to-br from-slate-950/95 via-pink-950/80 to-rose-950/95 border-2 border-pink-400/80 shadow-[0_0_25px_rgba(244,114,182,0.55)] hover:shadow-[0_0_35px_rgba(244,114,182,0.85)]';
  }
  if (['godly'].includes(type)) {
    return 'bg-gradient-to-br from-slate-950/95 via-yellow-950/80 to-amber-950/95 border-2 border-yellow-300/90 shadow-[0_0_30px_rgba(253,224,71,0.65)] hover:shadow-[0_0_40px_rgba(253,224,71,0.95)]';
  }
  if (['morphling'].includes(type)) {
    return 'bg-gradient-to-br from-slate-950/95 via-blue-950/80 to-teal-950/95 border-2 border-blue-400/80 shadow-[0_0_25px_rgba(59,130,246,0.55)] hover:shadow-[0_0_35px_rgba(59,130,246,0.85)]';
  }
  return 'bg-gradient-to-br from-slate-950/95 via-indigo-950/80 to-purple-950/95 border-2 border-indigo-400/80 shadow-[0_0_25px_rgba(99,102,241,0.55)] hover:shadow-[0_0_35px_rgba(99,102,241,0.85)]';
}

export function FloatingPetWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isActivated, setIsActivated] = React.useState(false);
  const [petType, setPetType] = React.useState<LingoPetType>('owl');
  const [viewMode, setViewMode] = React.useState<'classic' | '3d'>('classic');
  const [petLevel, setPetLevel] = React.useState(1);
  const [equippedCosmetics, setEquippedCosmetics] = React.useState<{
    hat?: string;
    glasses?: string;
    necklace?: string;
    shoes?: string;
    wings?: string;
    costume?: string;
    aura?: string;
  }>({});
  const [currentTextIdx, setCurrentTextIdx] = React.useState(0);
  const [dragBounds, setDragBounds] = React.useState({ left: -400, right: 20, top: -600, bottom: 20 });

  const [messages, setMessages] = React.useState<string[]>([
    "Hello, how's your day? 🌟",
    "Visit me, you can feed me! 🍪"
  ]);

  // Adjust bounds dynamically on resize
  React.useEffect(() => {
    const updateBounds = () => {
      if (typeof window !== 'undefined') {
        setDragBounds({
          left: -window.innerWidth + 100,
          right: 20,
          top: -window.innerHeight + 100,
          bottom: 20
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Listen to custom speech bubble messages from Firestore (admin-managed)
  React.useEffect(() => {
    if (!firestore) return;
    const widgetDocRef = doc(firestore, 'announcements', 'floating_pet_widget');
    const unsubscribe = onSnapshot(widgetDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let fetchedMessages = data.messages && Array.isArray(data.messages) && data.messages.length > 0
          ? data.messages
          : ["Hello, how's your day? 🌟", "Visit me, you can feed me! 🍪"];
        
        if (data.useMotivational) {
          fetchedMessages = [...fetchedMessages, ...MOTIVATIONAL_PRESETS];
        }
        
        setMessages(fetchedMessages);
      }
    }, (error) => {
      console.error("Error listening to floating pet widget custom messages:", error);
    });
    return () => unsubscribe();
  }, [firestore]);

  // Reset index when messages change to avoid out of bounds
  React.useEffect(() => {
    setCurrentTextIdx(0);
  }, [messages]);

  // Track user login state to reset closed flag when user logs in again
  const prevUserUidRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (user?.uid && user.uid !== prevUserUidRef.current) {
      isPetClosedInCurrentSession = false;
      prevUserUidRef.current = user.uid;
    }
    if (!user) {
      prevUserUidRef.current = null;
    }
  }, [user?.uid]);

  // Listen for reset events (e.g. from auth login)
  React.useEffect(() => {
    const handleReset = () => {
      isPetClosedInCurrentSession = false;
    };
    window.addEventListener('lingoland_pet_reset_closed', handleReset);
    return () => window.removeEventListener('lingoland_pet_reset_closed', handleReset);
  }, []);

  // Determine visibility and load pet data (including equipped cosmetics)
  React.useEffect(() => {
    const isAuthPage = pathname?.includes('/auth') || pathname?.includes('/login') || pathname?.includes('/signup');
    const isPetPage = pathname === '/lingo-pet';

    const syncFromPetObject = (data: any) => {
      if (!data) return;
      const storedActivated = typeof window !== 'undefined' && user ? localStorage.getItem(`lingopet_activated_${user.uid}`) === 'true' : false;
      const active = data.isActivated === true || storedActivated || (data.level && data.level > 1) || (data.xp && data.xp > 100);
      setIsActivated(active);

      if (!isAuthPage && !isPetPage && !!user && !isGuest && active && !isPetClosedInCurrentSession) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }

      // Check explicit local storage override first to prevent stale sync
      const explicitSelected = typeof window !== 'undefined' 
        ? (localStorage.getItem(`lingopet_selected_pet_${user?.uid}`) || localStorage.getItem('lingopet_selected_pet'))
        : null;
      const targetPetType = (explicitSelected || data.activePetType || data.petType) as LingoPetType;
      if (targetPetType) setPetType(targetPetType);
      if (data.level) setPetLevel(data.level);
      if (data.equippedCosmetics) setEquippedCosmetics(data.equippedCosmetics);

      const storedView = typeof window !== 'undefined'
        ? (localStorage.getItem(`lingopet_view_mode_${user?.uid}`) || localStorage.getItem('lingopet_view_mode'))
        : null;
      const effectiveView = (storedView || data.viewMode || (CLASSIC_PET_TYPES.includes(targetPetType) ? 'classic' : '3d')) as 'classic' | '3d';
      setViewMode(effectiveView);
    };

    const loadWidgetPet = async () => {
      let petActivated = false;
      // Check localStorage first
      if (typeof window !== 'undefined') {
        try {
          const actFlag = localStorage.getItem(`lingopet_activated_${user?.uid}`);
          const local = localStorage.getItem('lingopet_local_state');
          if (local) {
            const parsed = JSON.parse(local);
            if (actFlag === 'true' || parsed.isActivated) {
              petActivated = true;
            }
            syncFromPetObject({ ...parsed, isActivated: petActivated });
          } else if (actFlag === 'true') {
            petActivated = true;
            setIsActivated(true);
            if (!isAuthPage && !isPetPage && !!user && !isGuest && !isPetClosedInCurrentSession) {
              setIsOpen(true);
            }
          }
        } catch (e) {}
      }

      if (!firestore || !user || isGuest) return;

      try {
        const petRef = doc(firestore, 'user_pets', user.uid);
        const docSnap = await getDoc(petRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          syncFromPetObject(data);
        }
      } catch (e) {
        console.error("Error loading floating pet widget data:", e);
      }
    };

    loadWidgetPet();

    // Live real-time listener for pet activation, evolution tree choices, classic morphing, aura effects and accessories
    const handlePetUpdated = (e: any) => {
      const detail = e?.detail;
      const storedAct = typeof window !== 'undefined' && user ? localStorage.getItem(`lingopet_activated_${user.uid}`) === 'true' : false;
      const isNowActive = detail?.isActivated === true || storedAct || (detail?.level && detail.level > 1);
      
      if (isNowActive) {
        setIsActivated(true);
        if (!isAuthPage && !isPetPage && !!user && !isGuest && !isPetClosedInCurrentSession) {
          setIsOpen(true);
        }
        if (typeof window !== 'undefined') {
          if (user) {
            localStorage.setItem(`lingopet_activated_${user.uid}`, 'true');
          }
        }
      }
      syncFromPetObject(detail);
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (
        e.key === 'lingopet_local_state' || 
        e.key === `lingopet_activated_${user?.uid}` || 
        e.key === 'lingopet_selected_pet' ||
        e.key === `lingopet_selected_pet_${user?.uid}` ||
        e.key === 'lingopet_view_mode' ||
        e.key === `lingopet_view_mode_${user?.uid}`
      ) {
        try {
          if (e.key === `lingopet_activated_${user?.uid}` && e.newValue === 'true') {
            setIsActivated(true);
            if (!isAuthPage && !isPetPage && !!user && !isGuest && !isPetClosedInCurrentSession) {
              setIsOpen(true);
            }
          }
          if ((e.key === 'lingopet_selected_pet' || e.key === `lingopet_selected_pet_${user?.uid}`) && e.newValue) {
            setPetType(e.newValue as LingoPetType);
          }
          if ((e.key === 'lingopet_view_mode' || e.key === `lingopet_view_mode_${user?.uid}`) && e.newValue) {
            setViewMode(e.newValue as 'classic' | '3d');
          }
          if (e.newValue && (e.key === 'lingopet_local_state')) {
            syncFromPetObject(JSON.parse(e.newValue));
          }
        } catch (err) {}
      }
    };

    // Real-time Firestore snapshot listeners for instantaneous multi-tab / cross-device updates
    let unsubscribePet: (() => void) | null = null;
    let unsubscribeUser: (() => void) | null = null;

    if (firestore && user && !isGuest) {
      try {
        const petDocRef = doc(firestore, 'user_pets', user.uid);
        unsubscribePet = onSnapshot(petDocRef, (snap) => {
          if (snap.exists()) {
            syncFromPetObject(snap.data());
          }
        });

        const userDocRef = doc(firestore, 'users', user.uid);
        unsubscribeUser = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const uData = snap.data();
            if (uData.activePetType) {
              setPetType(uData.activePetType);
            }
          }
        });
      } catch (err) {}
    }

    window.addEventListener('lingoland_pet_updated', handlePetUpdated);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      if (unsubscribePet) unsubscribePet();
      if (unsubscribeUser) unsubscribeUser();
      window.removeEventListener('lingoland_pet_updated', handlePetUpdated);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [user, isGuest, firestore, pathname]);

  // Alternate dialogue text randomly
  React.useEffect(() => {
    if (!isOpen || messages.length === 0) return;
    const interval = setInterval(() => {
      if (messages.length <= 1) return;
      setCurrentTextIdx(prev => {
        let nextIdx = Math.floor(Math.random() * messages.length);
        while (nextIdx === prev && messages.length > 1) {
          nextIdx = Math.floor(Math.random() * messages.length);
        }
        return nextIdx;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen, messages.length]);

  const handleNavigate = () => {
    router.push('/lingo-pet');
  };

  const handleClose = (e?: React.SyntheticEvent | Event) => {
    if (e) {
      e.stopPropagation();
    }
    isPetClosedInCurrentSession = true;
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && isActivated && (
        <motion.div
          drag
          dragMomentum={true}
          dragElastic={0.05}
          dragConstraints={dragBounds}
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.5, y: 100 }}
          className="fixed bottom-6 right-6 z-[100] flex flex-col items-center select-none"
        >
          {/* Conversation Bubble */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 px-4 py-2 rounded-2xl bg-slate-900/95 border border-slate-800 text-slate-100 shadow-xl max-w-[200px] text-center relative font-medium text-xs leading-normal"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTextIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {messages[currentTextIdx]}
              </motion.div>
            </AnimatePresence>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-800 rotate-45" />
          </motion.div>

          {/* Floating/Breathing Avatar Container */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative group flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-950/90 border border-slate-700 hover:bg-rose-950 hover:border-rose-600 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-all shadow-md opacity-85 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 z-[110] active:scale-90"
              title="Close companion"
              aria-label="Close companion"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* 3D / 2D Celestial Crystal Orb Container */}
            <div
              onClick={handleNavigate}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${getOrbStyles(petType)}`}
              title="Click to visit your Pet Sanctuary!"
            >
              {CLASSIC_PET_TYPES.includes(petType) || viewMode === 'classic' ? (
                /* 2D Classic Morphing Avatar with full fidelity (Level milestone color, glasses, wings, armor, etc.) */
                <div className="w-full h-full pointer-events-none flex items-center justify-center p-2 relative z-10 scale-95">
                  <LingoPetVisual
                    petType={petType}
                    level={petLevel}
                    energy={100}
                    mood={100}
                    equippedCosmetics={equippedCosmetics}
                    currentBackground="transparent"
                    force2D={true}
                    hideBackground={true}
                    hideModeToggle={true}
                    className="w-full h-full min-h-0 bg-transparent shadow-none border-none pointer-events-none rounded-full"
                  />
                </div>
              ) : (
                /* Full Live 3D Interactive Animated Model with Relics and Auras */
                <div className="w-full h-full pointer-events-none flex items-center justify-center">
                  <LingoPet3D
                    petType={petType}
                    level={petLevel}
                    energy={100}
                    mood={100}
                    equippedCosmetics={equippedCosmetics}
                    hideHint={true}
                    className="w-full h-full border-none shadow-none bg-transparent"
                  />
                </div>
              )}

              {/* Crystal Spherical Glass Shine & Celestial Ring Overlays */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/20 pointer-events-none" />
              <div className="absolute inset-0 rounded-full border border-white/25 pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
