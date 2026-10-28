import React from 'react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="relative z-20 w-full border-t border-white/[0.08] bg-slate-950/80 backdrop-blur-xl py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        {/* Brand & Mission Statement */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center md:text-left">
          <Link href="/" className="font-bold text-white hover:text-cyan-400 transition-colors">
            © 2026 LingoLandVerse
          </Link>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400">
            Public Educational Universe for ESL Cadets &amp; Global Educators
          </span>
        </div>

        {/* Global Compliance & Discovery Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 font-medium">
          <Link
            href="/apps"
            className="text-slate-300 hover:text-cyan-400 hover:underline transition-colors"
          >
            Explore Apps &amp; Tools (All 26 Menus)
          </Link>
          <Link
            href="/blog"
            className="text-slate-300 hover:text-cyan-400 hover:underline transition-colors"
          >
            Educational Universe Blog
          </Link>
          <Link
            href="/about"
            className="text-slate-300 hover:text-cyan-400 hover:underline transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/editorial-policy"
            className="text-slate-300 hover:text-cyan-400 hover:underline transition-colors"
          >
            Editorial Policy
          </Link>
          <Link
            href="/contact"
            className="text-slate-300 hover:text-cyan-400 hover:underline transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/terms"
            className="text-slate-300 hover:text-cyan-400 hover:underline transition-colors"
          >
            Terms and Conditions
          </Link>
          <Link
            href="/privacy-policy"
            className="text-slate-300 hover:text-cyan-400 hover:underline transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
