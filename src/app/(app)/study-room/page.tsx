'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, GraduationCap, Lock, LogIn, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';
import Link from 'next/link';

const STUDIO_URL = 'https://studio--lingoland-kpvxp.us-central1.hosted.app';

export default function StudyRoomPage() {
  const { user, isLoading, isGuest } = useAuth();
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleReload = () => {
    setIframeLoading(true);
    setIframeError(false);
    setReloadKey(k => k + 1);
  };

  // Show loading spinner while auth state is resolving
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  // Show login-required screen for guests or unauthenticated users
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

  // Authenticated users — show the study room
  return (
    <div className="relative min-h-[88vh] w-full p-2 sm:p-4 text-white overflow-hidden bg-slate-950/20 rounded-3xl border border-slate-900 flex flex-col gap-3">
      <ConstellationCanvas />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top action bar */}
      <div className="relative z-10 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-black text-white uppercase tracking-widest">Acoustic Study Room</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            title="Reload"
            className="p-2 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white text-xs font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Full Screen
          </a>
        </div>
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 backdrop-blur-md">
        {/* Loading spinner */}
        <AnimatePresence mode="wait">
          {iframeLoading && !iframeError && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col justify-center items-center bg-slate-950/90 z-20 gap-3"
            >
              <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
                Loading Study Room...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error / blocked fallback */}
        {iframeError && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-950/90 z-20 gap-5 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-amber-400" />
            <div>
              <p className="text-white font-black text-lg">Study Room blocked by browser</p>
              <p className="text-slate-400 text-sm mt-1 max-w-sm">
                Your browser is blocking the embedded view. Open it in a new tab for the full experience.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={handleReload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <a
                href={STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold transition-all shadow-[0_0_20px_theme(colors.indigo.500/0.35)]"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </a>
            </div>
          </div>
        )}

        {/* Embedded Study Room */}
        <iframe
          key={reloadKey}
          src={STUDIO_URL}
          title="Acoustic Study Room"
          className="w-full h-[85vh] border-0 rounded-2xl"
          allow="microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write; autoplay"
          onLoad={() => setIframeLoading(false)}
          onError={() => { setIframeLoading(false); setIframeError(true); }}
        />
      </div>
    </div>
  );
}
