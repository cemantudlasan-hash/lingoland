import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  FileCheck2,
  Users,
  ArrowLeft,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Editorial Policy, Curriculum Standards & AI Governance | LingoLandVerse",
  description:
    "Learn how LingoLandVerse develops, verifies, and maintains CEFR-aligned ESL reading passages, long-form linguistic articles, and interactive classroom modules.",
  alternates: {
    canonical: "https://www.lingolandverse.com/editorial-policy",
  },
};

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      <PublicHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Flight Deck
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Curriculum Quality &amp; E-E-A-T Standards
          </span>
        </div>

        <section className="rounded-3xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl p-8 sm:p-12 shadow-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <FileCheck2 className="w-3.5 h-3.5" /> Pedagogical Integrity &amp; Editorial Governance
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Editorial Policy &amp; Curriculum Standards
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            LingoLandVerse is committed to publishing authentic, pedagogically rigorous, and classroom-tested educational resources for English as a Second Language (ESL) learners and teachers worldwide.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/75 p-8 sm:p-10 space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-cyan-400" />
              1. Alignment with International Language Frameworks (CEFR A1–C2)
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every reading passage, grammar module, and lexical drill published on LingoLandVerse is mapped to the <strong>Common European Framework of Reference for Languages (CEFR)</strong> as well as regional secondary school standards (including Thai O-NET and Cambridge English qualifications):
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-300">
              <li className="p-4 rounded-2xl bg-slate-900/70 border border-white/10">
                <strong className="text-emerald-400 block mb-1">Beginner (CEFR A1–A2)</strong>
                High-frequency everyday vocabulary, present/past simple tenses, concrete reading narratives (150–300 words), and phonetic decoding.
              </li>
              <li className="p-4 rounded-2xl bg-slate-900/70 border border-white/10">
                <strong className="text-cyan-400 block mb-1">Intermediate (CEFR B1–B2)</strong>
                Complex clauses, conditionals, passive voice, idiomatic expressions, and expository reading passages (350–600 words).
              </li>
              <li className="p-4 rounded-2xl bg-slate-900/70 border border-white/10">
                <strong className="text-indigo-400 block mb-1">Advanced (CEFR C1–C2)</strong>
                Academic discourse, rhetorical debate, nuanced register shifts, etymology, and analytical texts.
              </li>
            </ul>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              2. Human Authorship &amp; Classroom Verification
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our long-form articles in the <Link href="/blog" className="text-cyan-400 underline">Educational Universe Blog</Link>, graded reading stories in the <Link href="/reader" className="text-cyan-400 underline">ESL Reader</Link>, and 26 application guides are authored and curated under the supervision of founder and ESL educator <strong>Ceman Tudlasan</strong>. Materials are grounded in established Second Language Acquisition (SLA) research, including Stephen Krashen&apos;s <em>Affective Filter Hypothesis</em>, Piotr Wozniak&apos;s <em>SuperMemo-2 (SM-2)</em> spaced repetition algorithm, and task-based language teaching (TBLT).
            </p>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-400" />
              3. Responsible Use of AI &amp; Automated Learning Tools
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              LingoLandVerse provides interactive AI-assisted tools (such as contextual flashcard generation, pronunciation feedback, and conversational roleplay). To maintain educational quality and safety:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc list-inside">
              <li>Core curriculum articles, reading passages, and exam banks are statically curated and editorially reviewed rather than auto-generated on the fly.</li>
              <li>Interactive AI prompts are strictly constrained to age-appropriate, classroom-safe educational guidance.</li>
              <li>Community submissions in the Peer Tutor Marketplace undergo manual administrator moderation before becoming visible to students.</li>
            </ul>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              4. Ongoing Curation &amp; Corrections Policy
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We continuously audit our question banks, reading passages, and lesson modules for grammatical accuracy, cultural sensitivity, and pedagogical clarity. Educators and learners can report any content issue via our <Link href="/contact" className="text-cyan-400 underline">Contact Us</Link> page for prompt review and correction.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
