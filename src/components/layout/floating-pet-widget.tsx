'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function FloatingPetWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();

  const [isOpen, setIsOpen] = React.useState(false);
  const [petType, setPetType] = React.useState<'owl' | 'dino' | 'kitty'>('owl');
  const [petName, setPetName] = React.useState<string>('Lingo');
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

  // Listen to custom speech bubble messages from Firestore
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

  // Determine visibility and load pet data
  React.useEffect(() => {
    // Do not show on auth pages or directly on the pet page
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
              if (parsed.petName) setPetName(parsed.petName);
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
          if (data.petName) setPetName(data.petName);
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

  // Simplified vector illustrations for the mini floating avatar
  const renderMiniMascot = () => {
    switch (petType) {
      case 'dino':
        return (
          <svg viewBox="0 0 100 100" className="w-12 h-12">
            <path d="M 30 55 C 30 25, 70 25, 70 55 C 70 65, 65 80, 60 90 C 55 95, 45 95, 40 90 C 35 80, 30 65, 30 55" fill="#10b981" />
            <path d="M 40 62 C 40 50, 60 50, 60 62 C 60 70, 55 85, 50 90 C 45 85, 40 70, 40 62" fill="#a7f3d0" />
            <circle cx="43" cy="48" r="6" fill="#064e3b" />
            <circle cx="57" cy="48" r="6" fill="#064e3b" />
            <circle cx="41" cy="46" r="2" fill="white" />
            <circle cx="55" cy="46" r="2" fill="white" />
            <path d="M 47 55 Q 50 58 53 55" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'kitty':
        return (
          <svg viewBox="0 0 100 100" className="w-12 h-12">
            <polygon points="25,38 15,15 40,32" fill="#d97706" />
            <polygon points="25,38 20,20 35,32" fill="#fecaca" />
            <polygon points="75,38 85,15 60,32" fill="#d97706" />
            <polygon points="75,38 80,20 65,32" fill="#fecaca" />
            <circle cx="50" cy="50" r="28" fill="#f97316" />
            <ellipse cx="50" cy="58" r="18" ry="12" fill="#ffedd5" />
            <circle cx="40" cy="45" r="5" fill="#78350f" />
            <circle cx="60" cy="45" r="5" fill="#78350f" />
            <circle cx="38" cy="43" r="1.5" fill="white" />
            <circle cx="58" cy="43" r="1.5" fill="white" />
            <polygon points="48,51 52,51 50,53" fill="#f43f5e" />
            <path d="M 47 55 Q 50 58 53 55" stroke="#78350f" strokeWidth="1.5" fill="none" />
            <line x1="22" y1="52" x2="8" y2="50" stroke="#78350f" strokeWidth="1.2" />
            <line x1="22" y1="57" x2="8" y2="58" stroke="#78350f" strokeWidth="1.2" />
            <line x1="78" y1="52" x2="92" y2="50" stroke="#78350f" strokeWidth="1.2" />
            <line x1="78" y1="57" x2="92" y2="58" stroke="#78350f" strokeWidth="1.2" />
          </svg>
        );
      case 'owl':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-12 h-12">
            <polygon points="25,35 20,15 45,30" fill="#4f46e5" />
            <polygon points="75,35 80,15 55,30" fill="#4f46e5" />
            <circle cx="50" cy="55" r="32" fill="#6366f1" />
            <circle cx="50" cy="62" r="22" fill="#e0e7ff" />
            <circle cx="38" cy="48" r="11" fill="white" />
            <circle cx="62" cy="48" r="11" fill="white" />
            <circle cx="38" cy="48" r="6" fill="#1e1b4b" />
            <circle cx="62" cy="48" r="6" fill="#1e1b4b" />
            <circle cx="36" cy="46" r="2" fill="white" />
            <circle cx="60" cy="46" r="2" fill="white" />
            <polygon points="46,53 54,53 50,62" fill="#fbbf24" />
          </svg>
        );
    }
  };

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
            className="w-16 h-16 md:w-20 md:h-20 rounded-full cursor-pointer bg-gradient-to-br from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center relative border-2 border-indigo-400 shadow-2xl transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] group"
          >
            {/* Close Button */}
            <button
              ref={closeBtnRef}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-950/80 border border-slate-800 hover:bg-rose-950/80 hover:border-rose-800 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors shadow opacity-0 group-hover:opacity-100 focus:opacity-100 z-55"
              title="Close companion"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Mascot Vector Render */}
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              {renderMiniMascot()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
