'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

  const launchStudyRoom = () => {
    window.open(STUDIO_URL, '_blank', 'noopener,noreferrer');
    setLaunched(true);
  };

  // Auto-launch hint on first load for authenticated users
  useEffect(() => {
    if (user && !isGuest) {
      // Pre-warm the URL so opening is instant
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = STUDIO_URL;
      document.head.appendChild(link);
    }
  }, [user, isGuest]);

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
      <div className="relative min-h-[88vh] w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-900 text-white p-8">
        <ConstellationCanvas />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
            <h2 className="text-3xl font-black tracking-tight text-white">Acoustic Study Room</h2>
            <p className="text-sm text-indigo-300 font-semibold uppercase tracking-widest">Members Only</p>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            The Acoustic Study Room is an exclusive feature for registered users.
            Sign in with your LingoLandVerse account to unlock AI-powered lessons,
            text-to-speech practice, and live progress tracking.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {['AI Text-to-Speech', 'Live Lessons', 'Progress Tracking', 'Multi-Language'].map((feat) => (
              <span key={feat} className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-950/60 border border-indigo-500/20 text-indigo-300">
                {feat}
              </span>
            ))}
          </div>

          <Link
            href="/auth"
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_24px_theme(colors.indigo.500/0.35)] transition-all duration-200 hover:scale-105 active:scale-95"
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
    <div className="relative min-h-[88vh] w-full overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-900 text-white flex flex-col">
      <ConstellationCanvas />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-10 p-6 sm:p-12 text-center">

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
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Acoustic Study Room
            </h1>
            <p className="text-indigo-300 font-semibold text-sm uppercase tracking-widest">
              AI-Powered Language Learning
            </p>
          </div>

          <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
            Explore <span className="text-white font-bold">7 languages</span>, 
            complete <span className="text-white font-bold">33 interactive modules</span>, 
            and practice real conversations with AI text-to-speech in your own dedicated study environment.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-black text-white uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Launch button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3"
        >
          <button
            id="launch-study-room-btn"
            onClick={launchStudyRoom}
            className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 hover:bg-right text-white font-black text-lg shadow-[0_0_40px_theme(colors.indigo.500/0.5)] hover:shadow-[0_0_60px_theme(colors.indigo.500/0.7)] transition-all duration-300 hover:scale-105 active:scale-95 border border-indigo-400/30"
          >
            <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            {launched ? 'Open Again →' : 'Launch Study Room'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          {launched ? (
            <p className="text-xs text-emerald-400 font-bold animate-pulse">
              ✓ Study Room opened in a new tab!
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Opens in a new tab for the best experience
            </p>
          )}
        </motion.div>

      </div>
    </div>
  );
}
