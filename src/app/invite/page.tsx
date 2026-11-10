import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { InvitePageClient } from './invite-page-client';
import {
  GraduationCap,
  Sparkles,
  Gamepad2,
  BookOpen,
  Presentation,
  Globe,
  CheckCircle2,
  Rocket,
  Users,
  QrCode,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Invite Teachers & Students | Free Classroom ESL, Math & Science Games | LingoLandVerse',
  description:
    'Invite fellow teachers, school departments, and students to LingoLandVerse! Get a printable Classroom Smartboard QR Code, 1-click social invitations, and free access to 79+ CEFR A1-C2 games and AI teaching tools.',
  keywords: [
    'invite teachers ESL games',
    'free classroom games for teachers and students',
    'interactive smartboard games ESL',
    'CEFR A1 C2 English games free',
    'AI lesson plan generator for teachers',
    'gamified English learning platform',
    'LingoLandVerse classroom invite',
  ],
  openGraph: {
    title: 'Join LingoLandVerse — 79+ Free Interactive Classroom Games & AI Teacher Suite',
    description:
      'Teachers & Students: Play 79+ interactive ESL, Math, and Science games, generate AI slide decks in seconds, and project instant Smartboard activities for free!',
    url: 'https://www.lingolandverse.com/invite',
    type: 'website',
  },
};

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-[#040711] text-white flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-6xl space-y-16">
        {/* Hero Banner */}
        <section className="text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Educator & Student Ambassador Hub
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-headline tracking-tight leading-tight">
            Bring <span className="text-cyan-400">LingoLandVerse</span> to Every{' '}
            <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Classroom & Student
            </span>
          </h1>

          <p className="text-slate-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            Help teachers save hours of lesson prep and give students a safe, gamified universe to master{' '}
            <strong className="text-white">English (CEFR A1–C2), Math, Science, and Coding</strong>. Share a direct invitation link, project the classroom QR code on your smartboard, or spread the word on social media!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all"
            >
              <Rocket className="w-4 h-4" /> Launch Cosmic Cockpit
            </Link>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-black uppercase tracking-wider text-xs sm:text-sm transition-all"
            >
              <Gamepad2 className="w-4 h-4 text-cyan-400" /> Browse All 79+ Games
            </Link>
          </div>
        </section>

        {/* Interactive Share & QR Hub Client Component */}
        <InvitePageClient />

        {/* Why Teachers & Students Love LingoLandVerse */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* For Teachers Card */}
          <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950 border border-amber-400/30 p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <GraduationCap className="w-4 h-4" /> Why Teachers Share LingoLandVerse
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-headline text-white">
              Zero Prep Time. Maximum Classroom Engagement.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Designed by educators for modern classrooms, LingoLandVerse turns any smartboard, projector, or computer lab into an interactive learning mission.
            </p>
            <ul className="space-y-3 text-sm text-slate-200">
              {[
                '79+ Ready-to-Play ESL, Grammar, Vocabulary, Math & Science Games',
                'CEFR A1 to C2 Filtering + Dedicated Young Learners (Pre-A1) Mode',
                'AI Presentation Maker, Exam Creator, & Printable Worksheet Studio',
                'Classroom Smartboard Timers, Random Name Wheel & Team Scoreboards',
                'No Student Accounts Required for Instant Guest Classroom Play',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students Card */}
          <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-slate-950 border border-cyan-400/30 p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-widest">
              <Users className="w-4 h-4" /> Why Students Invite Their Friends
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-headline text-white">
              Learn Like Playing an Arcade Adventure.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Students earn XP, unlock cosmic badges, and raise their own evolving 3D Lingo-Pet companion while mastering real academic skills.
            </p>
            <ul className="space-y-3 text-sm text-slate-200">
              {[
                'Raise & Evolve a 3D Lingo-Pet Companion with Lingo-Coins',
                '3D Cosmic Explorer, Word Safari, Jeopardy & Synonym Sprints',
                'Interactive Reading Lab with Instant Tap-to-Translate Dictionary',
                'AI Roleplay Simulator & Pronunciation Coach with Instant Feedback',
                'Earn +15 Bonus Lingo-Coins Daily by Inviting Classmates!',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

