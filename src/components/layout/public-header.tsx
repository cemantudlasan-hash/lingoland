'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rocket, BookOpen, Grid, Sparkles, LogIn, ArrowRight } from 'lucide-react';

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.7)] group-hover:drop-shadow-[0_0_22px_rgba(56,189,248,0.9)] transition-all">
              <span className="text-white">lingoland</span>
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Verse
              </span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold">
            <Link
              href="/apps"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname.startsWith('/apps')
                  ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                  : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Apps Directory</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">26</span>
            </Link>

            <Link
              href="/blog"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname.startsWith('/blog')
                  ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                  : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Educational Blog</span>
            </Link>

            <Link
              href="/about"
              className="text-slate-300 hover:text-cyan-300 transition-colors"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              className="text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Contact
            </Link>

            <Link
              href="/study-room"
              className="text-slate-300 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Study Room</span>
            </Link>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/games"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-all hover:scale-105"
          >
            <span>79+ Games</span>
          </Link>

          <Link
            href="/auth"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Pilot Sign-In</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
