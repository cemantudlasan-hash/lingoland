'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, GraduationCap, Lock, LogIn, ExternalLink,
  BookOpen, MessageCircle, Globe, Brain, Mic, Headphones,
  Sparkles, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';
import Link from 'next/link';

const STUDIO_URL = 'https://studio--lingoland-kpvxp.us-central1.hosted.app';

const FEATURES = [
  { icon: Globe,       label: '7 Languages',        desc: 'Thai, Korean, Japanese, French, Spanish, Chinese & Vietnamese' },
  { icon: Brain,       label: '33 Modules',          desc: 'Vocabulary, grammar, conversation & culture lessons' },
  { icon: Sparkles,    label: '330 Quiz Questions',  desc: 'Interactive quizzes with detailed explanations' },
  { icon: Mic,         label: 'Text-to-Speech',      desc: 'Listen to every dialogue line with AI voice' },
  { icon: MessageCircle, label: 'Conversations',     desc: 'Real-life dialogue scenarios for every language' },
  { icon: Zap,         label: 'XP & Progress',       desc: 'Earn XP, track streaks and completed modules' },
];

export default function StudyRoomPage() {
  const { user, isLoading, isGuest } = useAuth();
  const [launched, setLaunched] = useState(false);
  const [studyRoomUrl, setStudyRoomUrl] = useState(STUDIO_URL);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setStudyRoomUrl(process.env.NEXT_PUBLIC_STUDY_ROOM_URL || 'http://localhost:3000');
      }
    }
  }, []);

  const launchStudyRoom = () => {
    window.open(studyRoomUrl, '_blank', 'noopener,noreferrer');
    setLaunched(true);
  };

  // Auto-launch hint on first load for authenticated users
  useEffect(() => {
    if (user && !isGuest && studyRoomUrl) {
      // Pre-warm the URL so opening is instant
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = studyRoomUrl;
      document.head.appendChild(link);
    }
  }, [user, isGuest, studyRoomUrl]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  // ── GUEST / LOGGED OUT ──────────────────────────────────────────────────────
  if (!user || isGuest) {
    return (
      <div className="relative min-h-[88vh] w-full flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-2xl rounded-3xl border border-indigo-500/25 text-white p-6 sm:p-8 pb-28 sm:pb-12 shadow-2xl">
        <ConstellationCanvas />
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center gap-6 max-w-md text-center"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_48px_theme(colors.indigo.500/0.4)] border border-indigo-500/30">
              <GraduationCap className="w-11 h-11 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white break-words">Acoustic Study Room</h2>
            <p className="text-sm text-indigo-300 font-bold uppercase tracking-widest">Members Only</p>
          </div>

          <p className="text-sm text-zinc-300 font-medium leading-relaxed">
            The Acoustic Study Room is an exclusive feature for registered users.
            Sign in with your LingoLandVerse account to unlock AI-powered lessons,
            text-to-speech practice, and live progress tracking.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {['AI Text-to-Speech', 'Live Lessons', 'Progress Tracking', 'Multi-Language'].map((feat) => (
              <span key={feat} className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-200">
                {feat}
              </span>
            ))}
          </div>

          <Link
            href="/auth"
            className="flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_24px_theme(colors.indigo.500/0.35)] transition-all duration-200 hover:scale-105 active:scale-95 w-full max-w-xs sm:w-auto"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Access
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── AUTHENTICATED LAUNCHER ──────────────────────────────────────────────────
  return (
    <div className="relative min-h-[88vh] w-full bg-zinc-950/90 backdrop-blur-2xl rounded-3xl border border-indigo-500/25 text-white flex flex-col shadow-2xl flex-1">
      <ConstellationCanvas />
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-8 sm:gap-10 p-4 sm:p-12 pb-28 sm:pb-16 text-center">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-[0_0_60px_theme(colors.indigo.500/0.5)] border border-indigo-400/30">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent break-words">
              Acoustic Study Room
            </h1>
            <p className="text-indigo-200 font-bold text-sm uppercase tracking-widest drop-shadow-sm">
              AI-Powered Language Learning
            </p>
          </div>

          <p className="text-zinc-200 text-sm sm:text-base max-w-lg leading-relaxed font-medium drop-shadow-sm">
            Explore <span className="text-white font-extrabold">7 languages</span>, 
            complete <span className="text-white font-extrabold">33 interactive modules</span>, 
            and practice real conversations with AI text-to-speech in your own dedicated study environment.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col gap-1.5 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-white/15 hover:border-indigo-500/60 hover:bg-zinc-850/90 transition-all text-left shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-black text-white uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Launch button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3 w-full"
        >
          <button
            id="launch-study-room-btn"
            onClick={launchStudyRoom}
            className="group relative flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-sm sm:w-auto px-6 sm:px-10 py-3.5 sm:py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 hover:bg-right text-white font-black text-base sm:text-lg shadow-[0_0_40px_theme(colors.indigo.500/0.5)] hover:shadow-[0_0_60px_theme(colors.indigo.500/0.7)] transition-all duration-300 hover:scale-105 active:scale-95 border border-indigo-400/30"
          >
            <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
            <span>{launched ? 'Open Again →' : 'Launch Study Room'}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
          </button>

          {launched ? (
            <p className="text-xs text-emerald-400 font-bold animate-pulse">
              ✓ Study Room opened in a new tab!
            </p>
          ) : (
            <p className="text-xs text-zinc-400 font-medium">
              Opens in a new tab for the best experience
            </p>
          )}
        </motion.div>

      </div>
    </div>
  );
}
