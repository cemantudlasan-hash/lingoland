'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Coins, Gift, CalendarDays } from 'lucide-react';
import type { UserPet } from '@/lib/types';

export function DailyLoginModal() {
  const { user, isGuest, isLoading } = useAuth();
  const firestore = useFirestore();

  const [showModal, setShowModal] = React.useState(false);
  const [streakCount, setStreakCount] = React.useState(1);
  const [rewardAmount, setRewardAmount] = React.useState(0);
  const [isClaiming, setIsClaiming] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) return;

    const checkDailyLogin = async () => {
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      const defaultPet: UserPet = {
        userId: user?.uid || 'guest',
        petType: 'owl',
        petName: 'Lingo',
        level: 1,
        xp: 150,
        energy: 85,
        intelligence: 60,
        mood: 75,
        coins: 120,
        unlockedCosmetics: [],
        equippedCosmetics: {},
        currentBackground: 'cozy-room',
        lastActive: new Date().toISOString(),
      };

      if (isGuest || !user || !firestore) {
        // Guest user daily check-in (stored in localStorage)
        if (typeof window === 'undefined') return;
        const local = localStorage.getItem('lingoland_guest_pet');
        let petData: UserPet = defaultPet;

        if (local) {
          try {
            petData = JSON.parse(local) as UserPet;
          } catch (e) {
            petData = defaultPet;
          }
        }

        // Check if already claimed today
        if (petData.lastLoginDate === todayStr) {
          return;
        }

        // Calculate streak
        let newStreak = 1;
        if (petData.lastLoginDate === yesterdayStr) {
          newStreak = ((petData.loginStreakCount || 0) % 7) + 1;
        }

        // Calculate reward
        let reward = 10.0;
        if (newStreak < 7) {
          // Days 1-6: Random float between 1.00 and 2.00
          reward = parseFloat((Math.random() * 1.0 + 1.0).toFixed(2));
        }

        const updatedPet: UserPet = {
          ...petData,
          coins: parseFloat(((petData.coins || 0) + reward).toFixed(2)),
          lastLoginDate: todayStr,
          loginStreakCount: newStreak,
          lastActive: new Date().toISOString(),
        };

        localStorage.setItem('lingoland_guest_pet', JSON.stringify(updatedPet));
        setStreakCount(newStreak);
        setRewardAmount(reward);
        setShowModal(true);
        return;
      }

      // Authenticated user daily check-in (Firestore transactional read-write)
      try {
        const petRef = doc(firestore, 'user_pets', user.uid);
        const docSnap = await getDoc(petRef);
        let petData = defaultPet;

        if (docSnap.exists()) {
          petData = docSnap.data() as UserPet;
        }

        // Check if already checked in today
        if (petData.lastLoginDate === todayStr) {
          return;
        }

        // Calculate consecutive streak
        let newStreak = 1;
        if (petData.lastLoginDate === yesterdayStr) {
          newStreak = ((petData.loginStreakCount || 0) % 7) + 1;
        }

        // Calculate reward
        let reward = 10.0;
        if (newStreak < 7) {
          // Days 1-6: Random float between 1.00 and 2.00
          reward = parseFloat((Math.random() * 1.0 + 1.0).toFixed(2));
        }

        setIsClaiming(true);

        const updatedPet: UserPet = {
          ...defaultPet,
          ...petData,
          coins: parseFloat(((petData.coins || 0) + reward).toFixed(2)),
          lastLoginDate: todayStr,
          loginStreakCount: newStreak,
          lastActive: new Date().toISOString(),
        };

        // Write to user_pets
        await setDoc(petRef, updatedPet, { merge: true });

        // Double-write sync active companion fields to user profile doc for public read access
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          activePetType: updatedPet.petType || 'owl',
          activePetLevel: updatedPet.level || 1,
          activePetCosmetics: updatedPet.equippedCosmetics || {},
        }, { merge: true });

        setStreakCount(newStreak);
        setRewardAmount(reward);
        setShowModal(true);
        setIsClaiming(false);
      } catch (e) {
        console.error("Daily login check-in error:", e);
        setIsClaiming(false);
      }
    };

    // Small delay to ensure DB and Auth profiles are loaded fully
    const timer = setTimeout(() => {
      checkDailyLogin();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, isGuest, firestore, isLoading]);

  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Semi-transparent blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          onClick={handleClose}
        />

        {/* Glassmorphic Modal Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-slate-950/80 border border-slate-800/80 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl text-center z-10 overflow-hidden"
          style={{
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.02)',
          }}
        >
          {/* Confetti Sparks (Pure CSS Animations) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-phoenix-ember"
                style={{
                  top: '90%',
                  left: `${10 + i * 5.5}%`,
                  backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#38bdf8' : '#f43f5e',
                  animationDuration: `${1.5 + Math.random() * 1.5}s`,
                  animationDelay: `${i * 100}ms`,
                  boxShadow: '0 0 6px currentColor',
                }}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon and Title */}
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-bounce">
              <Gift className="h-10 w-10 text-amber-400" />
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-indigo-400 tracking-tight uppercase">
            Daily Login Reward!
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Log in once per day to keep your companion energized and earn valuable Lingo-Coins.
          </p>

          {/* Coin reward showcase */}
          <div className="my-6 bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-inner">
            <div className="h-10 w-10 bg-amber-400/20 rounded-full flex items-center justify-center animate-pulse">
              <Coins className="h-6 w-6 text-amber-400 filter drop-shadow-[0_0_8px_#f59e0b]" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Day {streakCount} Reward Claimed</span>
              <span className="text-2xl font-black text-amber-300 tracking-tight">
                +{rewardAmount.toFixed(2)} <span className="text-sm font-semibold text-slate-300">Lingo-Coins</span>
              </span>
            </div>
          </div>

          {/* 7-Day Progression Roster */}
          <div className="grid grid-cols-7 gap-1.5 my-5">
            {[...Array(7)].map((_, idx) => {
              const dayNum = idx + 1;
              const isClaimed = dayNum < streakCount;
              const isToday = dayNum === streakCount;
              const isDay7 = dayNum === 7;

              return (
                <div
                  key={dayNum}
                  className={`relative p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                    isToday
                      ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)] scale-105'
                      : isClaimed
                      ? 'bg-indigo-950/20 border-indigo-500/30 opacity-70'
                      : 'bg-slate-900/30 border-slate-900 opacity-50'
                  }`}
                >
                  <span className="text-[8px] font-extrabold uppercase tracking-wide text-slate-400">D{dayNum}</span>

                  <div className="my-1 flex items-center justify-center h-6 w-6">
                    {isClaimed ? (
                      <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                    ) : isToday ? (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Coins className="h-5 w-5 text-amber-400 filter drop-shadow-[0_0_6px_#f59e0b]" />
                      </motion.div>
                    ) : isDay7 ? (
                      <Gift className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Coins className="h-4 w-4 text-slate-500" />
                    )}
                  </div>

                  <span className={`text-[8px] font-bold ${isToday ? 'text-amber-300' : 'text-slate-400'}`}>
                    {isDay7 ? '10' : '1-2'}
                  </span>

                  {isToday && (
                    <span className="absolute -top-1 px-1 bg-amber-500 text-slate-950 text-[5px] font-black uppercase rounded-full tracking-wide">
                      New
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <button
            onClick={handleClose}
            className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 hover:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.35)] transform active:scale-95"
          >
            Collect & Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
