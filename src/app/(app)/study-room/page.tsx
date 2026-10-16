'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, GraduationCap, Lock, LogIn, ExternalLink,
  BookOpen, MessageCircle, Globe, Brain, Mic, Headphones,
  Sparkles, ChevronRight, Zap, RotateCw, Maximize2
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';
import Link from 'next/link';

const STUDY_ROOM_LOCAL_PATH = '/study-room-app/index.html';

export default function StudyRoomPage() {
  const { user, isLoading, isGuest } = useAuth();
  const [iframeKey, setIframeKey] = useState(0);

  const handleOpenExternal = () => {
    window.open(STUDY_ROOM_LOCAL_PATH, '_blank', 'noopener,noreferrer');
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  // ── LOGGED OUT (neither user nor guest) ─────────────────────────────────────
  if (!user && !isGuest) {
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

  // ── AUTHENTICATED: DIRECT IN-APP SYLLABUS GATEWAY HUB ────────────────────────
  return (
    <div className="relative min-h-[88vh] w-full flex flex-col gap-3 flex-1">
      {/* Top Cockpit Navigation & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
        <div className="flex items-center gap-2.5">
          <Badge className="bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-indigo-200 border-indigo-400/40 text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Syllabus Gateway Hub</span>
          </Badge>
          {isGuest && (
            <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30 bg-amber-500/10 font-bold">
              Guest Mode
            </Badge>
          )}
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
            Acoustic Language Learning & Certification Suite
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReload}
            className="h-8 px-2.5 text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10 rounded-xl transition-all"
            title="Reload Study Room"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1 text-indigo-400" />
            <span className="text-[11px]">Reload</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenExternal}
            className="h-8 px-3 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all hover:scale-105 active:scale-95"
            title="Open in Full Screen Tab"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-[11px]">Full Screen Tab</span>
          </Button>
        </div>
      </div>

      {/* Embedded Study Room: 100% Reliable, Zero White Screen on Android, iOS & Mac OS */}
      <div className="w-full flex-1 min-h-[82vh] sm:min-h-[88vh] rounded-3xl border-2 border-indigo-500/30 overflow-hidden bg-slate-950 shadow-[0_10px_40px_rgba(0,0,0,0.6)] relative">
        <iframe
          key={iframeKey}
          id="study-room-frame"
          src={STUDY_ROOM_LOCAL_PATH}
          title="Acoustic Study Room - Syllabus Gateway Hub"
          className="w-full h-full min-h-[82vh] sm:min-h-[88vh] border-0 bg-slate-50"
          allow="microphone; speech-synthesis; clipboard-write; autoplay"
        />
      </div>
    </div>
  );
}
