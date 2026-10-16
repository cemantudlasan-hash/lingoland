'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Rocket, Play, LogIn, ArrowRight } from 'lucide-react';

interface AppLaunchButtonProps {
  launchUrl: string;
  appName: string;
}

export function AppLaunchButton({ launchUrl, appName }: AppLaunchButtonProps) {
  const router = useRouter();
  const { user, isGuest } = useAuth();

  const handleLaunch = () => {
    // If user is authenticated (registered pilot or active session), route immediately into the app matrix
    if (user && !isGuest) {
      router.push(launchUrl);
      return;
    }

    // For unauthenticated users or guest mode wanting to access protected flight deck, redirect to login with return parameter
    const redirectParam = encodeURIComponent(launchUrl);
    router.push(`/auth?redirect=${redirectParam}`);
  };

  return (
    <button
      onClick={handleLaunch}
      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
    >
      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
      <span>Launch App on Flight Deck</span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
