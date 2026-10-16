import React from 'react';
import Link from 'next/link';
import { FileText, Gamepad2, Sparkles, LayoutDashboard, ShieldAlert, ArrowLeft, CheckCircle2, UserCheck, Scale } from 'lucide-react';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';

export const metadata = {
  title: 'Terms and Conditions | LingoLandVerse',
  description: 'Official Terms and Conditions, Acceptable Use Policy, and Rules of Conduct for LingoLandVerse Interactive Games, AI Tools, and Virtual Dashboard Features.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="relative min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <ConstellationCanvas />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Flight Deck
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Effective Date: October 2026
          </span>
        </div>

        {/* Hero Header */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Scale className="w-3.5 h-3.5" /> Academic Flight Protocol
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Terms &amp; Conditions of Service
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              These terms outline the rules of conduct, platform responsibilities, and intellectual property standards for exploring LingoLandVerse&apos;s interactive games, generative AI tools, and virtual classroom dashboard features.
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-8 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">01.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, registering for, or using <strong>LingoLandVerse.com</strong> (referred to as &quot;the Service&quot;, &quot;Platform&quot;, &quot;we&quot;, or &quot;us&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
            </p>
            <p>
              If you do not agree with any part of these terms, you must discontinue your use of the platform immediately.
            </p>
          </section>

          {/* Section 2: Interactive Games Rules of Conduct (EXPLICIT USER REQUIREMENT) */}
          <section className="space-y-3 p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              Rules of Conduct for Interactive Games (79+ Worlds)
            </h2>
            <p className="font-semibold text-white text-xs">
              LingoLandVerse provides an extensive suite of 79+ gamified ESL mechanics—including Tense Runners, Asteroid Vocabulary Interceptors, Grammar Tug-of-War, and Sentence Builders. All pilots must adhere to strict standards of fair play:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
              <li>
                <strong>Fair Play &amp; Anti-Cheating:</strong> You may not use automated scripts, macros, packet injectors, bot software, memory modification tools, or browser exploits to artificially inflate game scores, speed runs, or leaderboard rankings.
              </li>
              <li>
                <strong>Community Sportsmanship:</strong> In multiplayer, PvP, or competitive arcade modes, pilots must treat fellow students with dignity. Unsportsmanlike conduct, spamming, exploiting glitches, or griefing other learners is strictly prohibited.
              </li>
              <li>
                <strong>Integrity of Academic Competitions:</strong> Any participant caught manipulating response timers, quiz submissions, or exam sheets will have their game records reset and may face permanent suspension from global leaderboards.
              </li>
            </ul>
          </section>

          {/* Section 3: AI Tools Rules of Conduct (EXPLICIT USER REQUIREMENT) */}
          <section className="space-y-3 p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
            <h2 className="text-xl font-bold text-indigo-300 flex items-center gap-2 border-b border-indigo-500/20 pb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Rules of Conduct for AI Tools &amp; Speech Synthesis
            </h2>
            <p className="font-semibold text-white text-xs">
              Our platform features cutting-edge pedagogical AI features, including the Exercise Generator, Roleplay Workspace, Storytelling Studio, and Acoustic Speech Synthesis.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
              <li>
                <strong>Acceptable Prompt Policy:</strong> You agree not to input prompts designed to generate, encourage, or facilitate hate speech, harassment, sexually explicit material, violence, deceptive academic dishonesty, or malicious code.
              </li>
              <li>
                <strong>Educational Nature of AI Outputs:</strong> AI-generated lessons, vocabulary suggestions, and conversational feedback are designed for language instruction. While calibrated for high accuracy, language learners should verify nuances with their human instructors.
              </li>
              <li>
                <strong>Voice &amp; Audio Usage:</strong> Our speech synthesis tools are provided to illustrate pronunciation, phonetic tones, and mouth articulation. Re-broadcasting, harvesting raw synthetic audio at scale, or misrepresenting AI voices as living individuals is forbidden.
              </li>
            </ul>
          </section>

          {/* Section 4: Virtual Dashboard Features (EXPLICIT USER REQUIREMENT) */}
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <LayoutDashboard className="w-5 h-5 text-cyan-400" />
              Rules for Virtual Dashboard, Pets &amp; Whiteboards
            </h2>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong>1. Virtual Progression &amp; Currency:</strong> All companion pets (Lingo-Pet), XP points, coins, badges, and streaks are virtual motivational items intended purely for educational engagement. They possess no monetary cash value, cannot be redeemed for real-world currency, and cannot be traded outside LingoLandVerse.
              </p>
              <p>
                <strong>2. Shared Collective Whiteboard &amp; Study Room:</strong> The Acoustic Study Room whiteboard is a collaborative public space for sharing vocabulary tips, grammar inquiries, and phonetic notes. You may not post commercial advertising, unsolicited links, derogatory language, or personal contact details. Moderators reserve the right to delete non-compliant notes.
              </p>
              <p>
                <strong>3. Language Completion Certificates:</strong> Official certificates awarded upon passing language exams (Thai, Korean, Japanese, English, French, Spanish, Chinese, Vietnamese, German) certify completion of syllabus exercises. They may not be forged, altered, or redistributed with false scoring credentials.
              </p>
            </div>
          </section>

          {/* Section 5: Account Security */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">05.</span> Pilot Account Responsibility
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your session. If you suspect unauthorized access to your account, you agree to notify platform administration immediately.
            </p>
          </section>

          {/* Section 6: Intellectual Property */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">06.</span> Intellectual Property Rights
            </h2>
            <p>
              All original visual assets, sound design, game source code, curriculum taxonomies, UI components, and space universe lore are the exclusive intellectual property of <strong>LingoLandVerse</strong> and creator <strong>Cem Antudlasan</strong>. You may not reproduce, decompile, scrape, or distribute these materials without explicit prior written authorization.
            </p>
          </section>

          {/* Section 7: Disclaimers & Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">07.</span> Disclaimer of Warranties &amp; Liability
            </h2>
            <p className="text-xs text-slate-400">
              LingoLandVerse is provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis for educational enrichment. While we strive for 100% server availability and pedagogical precision, we make no guarantees that the service will be uninterrupted, error-free, or compatible with every legacy browser. Under no circumstances shall LingoLandVerse or its creator be liable for any direct, indirect, incidental, or consequential damages resulting from your use of or inability to access the platform.
            </p>
          </section>

          {/* Section 8: Termination & Contact */}
          <section className="space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" /> Account Termination &amp; Questions
            </h2>
            <p className="text-xs text-slate-300">
              We reserve the right to suspend or terminate accounts that persistently violate these rules of conduct. For inquiries regarding these terms:
            </p>
            <div className="pt-2 text-xs space-y-1 text-slate-300 font-mono">
              <p><strong className="text-white">Administrator:</strong> Cem Antudlasan</p>
              <p><strong className="text-white">Email:</strong> <a href="mailto:cemantudlasan@gmail.com" className="text-cyan-400 underline">cemantudlasan@gmail.com</a></p>
              <p><strong className="text-white">Website:</strong> <a href="https://lingolandverse.com" className="text-cyan-400 underline">https://lingolandverse.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
