'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Compass, ArrowRight, Sparkles, Clock, Award, Layers, ShieldCheck } from 'lucide-react';
import { getAllBlogPosts } from '@/data/blog-posts';
import { getAllApps } from '@/data/apps-directory';
import { articles } from '@/lib/articles';

export function AdSenseEducationalHub() {
  const featuredPosts = getAllBlogPosts().slice(0, 6);
  const featuredApps = getAllApps().slice(0, 9);
  const readingPassages = [
    ...articles.beginner.slice(0, 2),
    ...articles.intermediate.slice(0, 2),
    ...articles.advanced.slice(0, 2),
  ];

  return (
    <section
      aria-label="LingoLandVerse Educational Curriculum, Research Articles, and Learning Directory"
      className="relative z-20 w-full mx-auto pt-6 pb-8 space-y-8 border-t border-cyan-500/20 mt-6"
    >
      {/* 1. Pedagogical Overview & CEFR Curriculum Matrix */}
      <div className="w-full rounded-3xl border border-cyan-500/35 bg-slate-950/90 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-[0_0_50px_rgba(6,182,212,0.18)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/15 pb-6">
          <div className="space-y-2.5 max-w-4xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-300" /> Open Educational Curriculum &amp; SLA Research Hub
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Science-Backed English Language Acquisition &amp; Interactive Classroom Tools
            </h2>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
              Created by educator and technologist <strong className="text-cyan-300 font-bold">Ceman Tudlasan</strong>, LingoLandVerse integrates{' '}
              <strong className="text-white font-bold">SuperMemo-2 (SM-2) Spaced Repetition</strong>,{' '}
              <strong className="text-white font-bold">Dr. Stephen Krashen&apos;s Affective Filter Hypothesis</strong>, and{' '}
              <strong className="text-white font-bold">CEFR-aligned (A1–C2) interactive micro-learning</strong> into a unified platform for independent learners and ESL classroom teachers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              Read All Research Articles
            </Link>
            <Link
              href="/apps"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-cyan-200 border border-cyan-400/40 font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-[1.02]"
            >
              <Layers className="w-4 h-4 text-cyan-300" />
              Browse All 26 Learning Apps
            </Link>
          </div>
        </div>

        {/* Three Core Pedagogical Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/25 shadow-lg space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-sm sm:text-base">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <h3>CEFR A1–C2 Structured Progression</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Every reading passage, grammar drill, and speaking lab simulation is calibrated to Common European Framework of Reference for Languages (CEFR) benchmarks—guiding students from foundational A1 phonetics and core vocabulary to C1/C2 academic discourse and idiomatic fluency.
            </p>
          </article>

          <article className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-teal-500/25 shadow-lg space-y-2.5">
            <div className="flex items-center gap-2 text-teal-300 font-extrabold text-sm sm:text-base">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <h3>SuperMemo-2 Spaced Repetition</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              To overcome Hermann Ebbinghaus&apos;s Forgetting Curve, our Smart-Review Asteroids calculate each learner&apos;s personal Easiness Factor and schedule active retrieval reviews at the exact cognitive threshold before memory decay occurs.
            </p>
          </article>

          <article className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-500/25 shadow-lg space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm sm:text-base">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <h3>9 Multilingual Certification Tracks</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Beyond English, learners can study structured syllabi and take comprehensive certification exams across English, Thai, Korean, Japanese, Mandarin Chinese, Spanish, French, German, and Vietnamese inside the Acoustic Study Room.
            </p>
          </article>
        </div>
      </div>

      {/* 2. Featured Original Educational Articles (Wrapped in high-contrast container so header is 100% readable) */}
      <div className="w-full rounded-3xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-5">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300 block mb-1">
              Peer-Reviewed Pedagogy &amp; Applied Linguistics
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <BookOpen className="w-6 h-6 text-cyan-400 shrink-0" />
              Featured Language Acquisition &amp; Teaching Articles
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1.5 font-medium">
              In-depth guides on cognitive memory science, ESL classroom pedagogy, and English grammar mastery.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-xs sm:text-sm font-extrabold text-cyan-200 hover:text-white transition-all shrink-0 self-start sm:self-auto"
          >
            View All 22 Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredPosts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col justify-between rounded-2xl border border-white/15 bg-slate-900/90 p-5 sm:p-6 hover:border-cyan-400/60 transition-all shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-200 font-bold border border-cyan-400/30 text-[11px]">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {post.read_time}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-cyan-300 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-200 font-semibold">By {post.author.name}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-extrabold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                >
                  Read Full Study <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 3. Graded ESL Reading Passages & Curriculum Apps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graded Reading Passages */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block mb-0.5">
                CEFR A1–C2 Graded Reader
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">Graded ESL Reading Comprehension Library</h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Contextual reading passages with vocabulary glossaries across Beginner, Intermediate, and Advanced levels.
              </p>
            </div>
            <Link
              href="/reader"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-xs font-extrabold text-emerald-200 hover:text-white shrink-0 transition-all"
            >
              Open Reader Hub &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {readingPassages.map((article) => (
              <Link
                key={article.slug}
                href={`/reader/${article.slug}`}
                className="p-4 rounded-2xl bg-slate-900/90 border border-white/15 hover:border-cyan-400/50 transition-all space-y-1.5 group shadow-md"
              >
                <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 flex items-center justify-between gap-2">
                  <span className="truncate">{article.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{article.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Interactive Learning Modules & Classroom Tools */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block mb-0.5">
                26 Specialized Learning Modules
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">Interactive Learning &amp; Teacher Suite</h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Explore syllabus blueprints, learning objectives, and classroom instructions for our 26 educational tools.
              </p>
            </div>
            <Link
              href="/apps"
              className="px-3.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-xs font-extrabold text-indigo-200 hover:text-white shrink-0 transition-all"
            >
              All 26 Apps &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {featuredApps.map((app) => (
              <Link
                key={app.id}
                href={`/apps/${app.id}`}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 hover:border-cyan-400/50 transition-all space-y-1.5 group shadow-md"
              >
                <div className="text-xs sm:text-sm font-extrabold text-cyan-200 group-hover:text-white truncate">{app.name}</div>
                <div className="text-[11px] text-slate-200 line-clamp-2 leading-snug">{app.learning_objectives}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Trust, E-E-A-T & Editorial Standards Banner */}
      <div className="w-full rounded-2xl border border-white/15 bg-slate-950/90 backdrop-blur-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-200 shadow-lg">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Curriculum Quality Guarantee:</strong> All lessons, graded readers, and classroom tools follow our CEFR A1–C2 Editorial &amp; Pedagogical Standards.
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0 font-bold">
          <Link href="/editorial-policy" className="text-cyan-300 hover:text-white underline">
            Editorial Policy
          </Link>
          <span className="text-slate-600">•</span>
          <Link href="/about" className="text-cyan-300 hover:text-white underline">
            About the Creator
          </Link>
          <span className="text-slate-600">•</span>
          <Link href="/contact" className="text-cyan-300 hover:text-white underline">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
