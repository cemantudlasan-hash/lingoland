'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X, Check, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration warning:', err);
        });
    }

    // 2. Check if already installed / standalone
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // 3. Detect iOS Safari
      const ua = window.navigator.userAgent.toLowerCase();
      const isAppleIos = /iphone|ipad|ipod/.test(ua);
      setIsIos(isAppleIos);

      // Check if user previously dismissed prompt
      const dismissed = localStorage.getItem('lingolandverse_pwa_dismissed');
      if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // 4. Capture native Chromium install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] LingoLandVerse successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('lingolandverse_pwa_dismissed', String(Date.now()));
    } catch {}
  };

  // If already running standalone inside app or installed, don't show prompt
  if (isStandalone || isInstalled) {
    return null;
  }

  // If not eligible or dismissed, don't show full banner
  if (!deferredPrompt && !isIos) {
    return null;
  }

  if (isDismissed && !showIosGuide) {
    return null;
  }

  return (
    <>
      {/* Floating PWA Install Banner */}
      <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[400px] z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden">
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-slate-950/95 via-indigo-950/90 to-purple-950/95 p-4 shadow-2xl backdrop-blur-xl">
          {/* Cosmic Glow Accent */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-indigo-400/40 shadow-lg bg-[#1a194d] flex items-center justify-center p-0.5">
              <img
                src="/icons/icon-192x192.png"
                alt="LingoLandVerse App Icon"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Install App
                </span>
                <span className="text-xs text-slate-400 font-medium">Phone &amp; Desktop</span>
              </div>

              <h4 className="text-sm font-bold text-white mt-0.5">
                Install LingoLandVerse
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                Enjoy full-screen smartboard games, instant loading, and quick offline access.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="h-8 px-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:via-purple-500 hover:to-pink-400 text-white font-semibold text-xs shadow-md shadow-indigo-500/30 cursor-pointer gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 px-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Safari "Add to Home Screen" Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="relative w-full max-w-sm rounded-2xl border border-indigo-500/40 bg-slate-950 p-5 shadow-2xl">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden relative shrink-0 border border-indigo-500/30 bg-[#1a194d] p-1">
                <img
                  src="/icons/icon-192x192.png"
                  alt="LingoLandVerse App Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Add LingoLandVerse to your home screen</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <span>
                  1. Tap the <strong className="text-white">Share</strong> icon in Safari's bottom toolbar.
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>
                  2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>
                  3. Tap <strong className="text-white">Add</strong> in the top-right corner to finish!
                </span>
              </div>
            </div>

            <Button
              className="w-full mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs h-9"
              onClick={() => setShowIosGuide(false)}
            >
              Got it!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
