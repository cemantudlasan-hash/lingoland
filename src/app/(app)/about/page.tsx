'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Rocket, 
  Sparkles, 
  Compass, 
  GraduationCap, 
  Globe2, 
  Mail, 
  ShieldCheck, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Heart, 
  Gamepad2, 
  Headphones, 
  Award, 
  BookOpen, 
  Users 
} from 'lucide-react';
import { ConstellationCanvas } from '@/components/ui/constellation-canvas';

export default function AboutUsPage() {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) return;

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
    }, 800);
  };

  return (
    <div className="relative min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <ConstellationCanvas />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Flight Deck
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            About Us &amp; Creator Registry
          </span>
        </div>

        {/* Hero Banner */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl p-8 sm:p-12 shadow-[0_0_60px_rgba(6,182,212,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <Rocket className="w-3.5 h-3.5" /> The Story &amp; Philosophy of LingoLandVerse
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Pioneering the Future of ESL Language Immersion
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              LingoLandVerse was founded by educator and technologist <strong>Cem Antudlasan</strong> to transform second-language acquisition from rigid rote memorization into an interstellar adventure powered by gaming mechanics, acoustic soundscapes, and companion motivation.
            </p>
          </div>
        </div>

        {/* ── SECTION 1: EDUCATIONAL PHILOSOPHY BEHIND THE ESL SPACE UNIVERSE ── */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">Pedagogical Framework</span>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-cyan-400" />
              The Educational Philosophy Behind Our ESL Space Universe
            </h2>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            In second-language acquisition research, linguist Stephen Krashen proposed the <em>&quot;Affective Filter Hypothesis&quot;</em>: when learners experience stress, fear of making mistakes, or classroom monotony, an emotional barrier impedes language processing. Traditional ESL worksheets and passive flashcards often exacerbate this barrier.
          </p>

          <p className="text-sm text-slate-300 leading-relaxed">
            <strong>LingoLandVerse solves this by re-contextualizing education inside a space exploration universe.</strong> When a student logs on, they are not taking a test—they are a <em>Cosmic Cadet</em> operating navigation dials, decoding alien radio transmissions, and piloting spacecraft through linguistic asteroid fields. The anxiety disappears, and natural curiosity takes over.
          </p>

          {/* 4 Pillars Grid */}
          <div className="grid md:grid-cols-2 gap-4 pt-3">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                1. Gamified Intuition (79+ Worlds)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rather than memorizing abstract grammar rules, students play fast-paced arcade runners, sentence-building puzzles, and vocabulary tug-of-war where grammatical syntax becomes an intuitive game mechanic.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Headphones className="w-5 h-5 text-indigo-400" />
                2. Acoustic Phonetics &amp; Soundscapes
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our Acoustic Study Room pairs speech synthesis with synthesized 40Hz Gamma binaural beats and calming pink-noise rain, creating optimal cognitive focus states while students practice phonetic mouth shapes and tones.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-pink-300 font-bold text-sm">
                <Heart className="w-5 h-5 text-pink-400" />
                3. Companion Growth &amp; Spaced Repetition
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every pilot nurtures a digital companion (Lingo-Pet). As students maintain daily study streaks and master syllabus cards, their companion levels up, anchoring emotional commitment to lifelong learning habits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <Award className="w-5 h-5 text-emerald-400" />
                4. CEFR Standards &amp; Verified Credentialing
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every syllabus follows Common European Framework of Reference (CEFR A1–C2) standards. Completing our 40-question assessments awards authentic, printable Certificates of Completion.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: ABOUT THE CREATOR & TEAM (GOOGLE ADSENSE TRANSPARENCY REQUIREMENT) ── */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">Entity &amp; Leadership Proof</span>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              About the Creator &amp; Team
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[2px] shrink-0 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center text-center p-2">
                <span className="text-2xl font-black text-cyan-400 font-display">CA</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Founder</span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <h3 className="text-lg font-black text-white tracking-tight">
                Cem Antudlasan
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Founder, Lead Educational Technologist &amp; Full-Stack Architect
              </p>
              <p>
                Cem Antudlasan is an educator and software engineer dedicated to building immersive educational technology. Observing how modern students struggled with disengagement in conventional language learning apps, Cem architected LingoLandVerse as an open, free, and deeply engaging metaverse that combines gaming mechanics with acoustic phonetics.
              </p>
              <p className="text-xs text-slate-400">
                Operating under the <strong>LingoLandVerse Educational Consortium</strong>, Cem directly manages platform infrastructure, curriculum alignment, soundscape synthesis algorithms, and academic compliance.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Entity Registration</span>
              <span className="text-xs font-bold text-white block">LingoLandVerse Educational Consortium</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Direct Creator Contact</span>
              <span className="text-xs font-bold text-cyan-300 block font-mono">cemantudlasan@gmail.com</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Linguistic Verification</span>
              <span className="text-xs font-bold text-white block">Native Academic Review Network</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: CONTACT US (FORM & DIRECT CHANNELS) ── */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">Inquiries &amp; Partnerships</span>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-cyan-400" />
              Contact Us
            </h2>
            <p className="text-xs text-slate-400">
              Have feedback, curriculum suggestions, school partnership requests, or advertising inquiries? Reach out to our team directly.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact Details Column */}
            <div className="md:col-span-2 space-y-4 text-xs text-slate-300">
              <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
                  Official Channels
                </span>
                <div className="space-y-2">
                  <p>
                    <strong className="text-white block">Creator &amp; Inquiries:</strong>
                    <a href="mailto:cemantudlasan@gmail.com" className="text-cyan-400 hover:underline font-mono">
                      cemantudlasan@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong className="text-white block">Response Time:</strong>
                    <span>Typically within 24 to 48 hours</span>
                  </p>
                  <p>
                    <strong className="text-white block">Supported Languages:</strong>
                    <span>English, Thai, Korean, Japanese, and partner dialects</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Google AdSense Verified Entity
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  LingoLandVerse is an independently engineered educational platform complying with Google AdSense quality guidelines and privacy standards.
                </p>
              </div>
            </div>

            {/* Direct Message Form Column */}
            <div className="md:col-span-3">
              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h3 className="text-lg font-bold text-white">Transmission Received! 🛸</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Thank you for reaching out to the LingoLandVerse team. Your message has been routed to Cem Antudlasan and you will receive a response shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-cyan-400 underline hover:text-cyan-300 pt-2"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Captain Sarah Jenkins"
                        className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="e.g. sarah@academy.edu"
                        className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. ESL Classroom Partnership / Technical Question"
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Share your feedback, ideas, or questions with our creator..."
                      className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Transmitting Message...' : 'Send Message to Team'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
