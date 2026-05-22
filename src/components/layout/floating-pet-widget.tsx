'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LingoPetVisual } from '@/components/games/lingo-pet-visual';

export function FloatingPetWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();

  const [isOpen, setIsOpen] = React.useState(false);
  const [petType, setPetType] = React.useState<'owl' | 'dino' | 'kitty'>('owl');
  const [petLevel, setPetLevel] = React.useState(1);
  const [equippedCosmetics, setEquippedCosmetics] = React.useState<{
    hat?: string;
    glasses?: string;
    necklace?: string;
    shoes?: string;
    wings?: string;
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
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
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

  // Determine visibility and load pet data (including equipped cosmetics)
  React.useEffect(() => {
    const isAuthPage = pathname?.includes('/auth') || pathname?.includes('/login') || pathname?.includes('/signup');
    const isPetPage = pathname === '/lingo-pet';
    let isClosedThisSession = false;
    if (typeof window !== 'undefined') {
      const closeKey = user ? `lingoland_floating_pet_closed_${user.uid}` : (isGuest ? 'lingoland_floating_pet_closed_guest' : 'lingoland_floating_pet_closed');
      isClosedThisSession = sessionStorage.getItem(closeKey) === 'true';
    }

    if (isAuthPage || isPetPage || isClosedThisSession || (!user && !isGuest)) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    const loadWidgetPet = async () => {
      if (isGuest || !user || !firestore) {
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('lingoland_guest_pet');
          if (local) {
            try {
              const parsed = JSON.parse(local);
              if (parsed.petType) setPetType(parsed.petType);
              if (parsed.level) setPetLevel(parsed.level);
              if (parsed.equippedCosmetics) setEquippedCosmetics(parsed.equippedCosmetics);
            } catch (e) {}
          }
        }
        return;
      }

      try {
        const petRef = doc(firestore, 'user_pets', user.uid);
        const docSnap = await getDoc(petRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.petType) setPetType(data.petType);
          if (data.level) setPetLevel(data.level);
          if (data.equippedCosmetics) setEquippedCosmetics(data.equippedCosmetics);
        }
      } catch (e) {
        console.error("Error loading floating pet widget data:", e);
      }
    };

    loadWidgetPet();
  }, [user, isGuest, firestore, pathname]);

  // Alternate dialogue text
  React.useEffect(() => {
    if (!isOpen || messages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTextIdx(prev => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen, messages.length]);

  const handleNavigate = () => {
    router.push('/lingo-pet');
  };

  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const btn = closeBtnRef.current;
    if (!btn) return;

    const stop = (e: Event) => {
      e.stopPropagation();
    };

    const handleCloseNative = (e: Event) => {
      e.stopPropagation();
      setIsOpen(false);
      if (typeof window !== 'undefined') {
        const closeKey = user ? `lingoland_floating_pet_closed_${user.uid}` : (isGuest ? 'lingoland_floating_pet_closed_guest' : 'lingoland_floating_pet_closed');
        sessionStorage.setItem(closeKey, 'true');
      }
    };

    btn.addEventListener('click', handleCloseNative);
    btn.addEventListener('pointerdown', stop);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('mousedown', stop);
    btn.addEventListener('mouseup', stop);
    btn.addEventListener('touchstart', stop);
    btn.addEventListener('touchend', stop);

    return () => {
      btn.removeEventListener('click', handleCloseNative);
      btn.removeEventListener('pointerdown', stop);
      btn.removeEventListener('pointerup', stop);
      btn.removeEventListener('mousedown', stop);
      btn.removeEventListener('mouseup', stop);
      btn.removeEventListener('touchstart', stop);
      btn.removeEventListener('touchend', stop);
    };
  }, [isOpen, user, user?.uid, isGuest]);

  return (
    <AnimatePresence>
      {isOpen && (
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
            onTap={handleNavigate}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full cursor-pointer bg-gradient-to-br from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center relative border-2 border-indigo-400 shadow-2xl transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] group overflow-hidden"
          >
            {/* Close Button */}
            <button
              ref={closeBtnRef}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-950/80 border border-slate-800 hover:bg-rose-950/80 hover:border-rose-800 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors shadow opacity-0 group-hover:opacity-100 focus:opacity-100 z-[55]"
              title="Close companion"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Full Pet Avatar with Equipped Cosmetics */}
            <div className="w-full h-full pointer-events-none p-1.5 flex items-center justify-center">
              <LingoPetVisual
                petType={petType}
                level={petLevel}
                energy={100}
                mood={100}
                equippedCosmetics={equippedCosmetics}
                currentBackground="cozy-room"
                isPetting={false}
                isSleeping={false}
                isTalking={false}
                className="min-h-0 w-full h-full border-none shadow-none bg-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
