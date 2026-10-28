'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Compass, ArrowRight, Sparkles, CheckCircle2, Clock, Award, Layers } from 'lucide-react';
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
      className="relative z-20 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-10 space-y-12 border-t border-cyan-500/15 mt-8"
    >
      {/* 1. Pedagogical Overview & CEFR Curriculum Matrix */}
      <div className="rounded-3xl border border-cyan-500/25 bg-slate-950/80 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <GraduationCap className="w-3.5 h-3.5" /> Open Educational Curriculum &amp; SLA Research Hub
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Science-Backed English Language Acquisition &amp; Interactive Classroom Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Created by educator and technologist <strong>Ceman Tudlasan</strong>, LingoLandVerse integrates{' '}
              <strong>SuperMemo-2 (SM-2) Spaced Repetition</strong>,{' '}
              <strong>Dr. Stephen Krashen&apos;s Affective Filter Hypothesis</strong>, and{' '}
              <strong>CEFR-aligned (A1–C2) interactive micro-learning</strong> into a unified platform for independent learners and ESL classroom teachers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              <BookOpen className="w-4 h-4" />
              Read All Research Articles
            </Link>
            <Link
              href="/apps"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all"
            >
              <Layers className="w-4 h-4" />
              Browse All 26 Learning Apps
            </Link>
          </div>
        </div>

        {/* Three Core Pedagogical Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <h3>CEFR A1–C2 Structured Progression</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every reading passage, grammar drill, and speaking lab simulation is calibrated to Common European Framework of Reference for Languages (CEFR) benchmarks—guiding students from foundational A1 phonetics and core vocabulary to C1/C2 academic discourse and idiomatic fluency.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <h3>SuperMemo-2 Spaced Repetition</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To overcome Hermann Ebbinghaus&apos;s Forgetting Curve, our Smart-Review Asteroids calculate each learner&apos;s personal Easiness Factor and schedule active retrieval reviews at the exact cognitive threshold before memory decay occurs.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <h3>9 Multilingual Certification Tracks</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Beyond English, learners can study structured syllabi and take comprehensive certification exams across English, Thai, Korean, Japanese, Mandarin Chinese, Spanish, French, German, and Vietnamese inside the Acoustic Study Room.
            </p>
          </article>
        </div>
      </div>

      {/* 2. Featured Original Educational Articles (From blog-posts.ts) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Featured Language Acquisition &amp; Teaching Articles
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              In-depth guides on cognitive memory science, ESL classroom pedagogy, and English grammar mastery.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View All Articles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredPosts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/75 backdrop-blur-xl p-5 hover:border-cyan-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/20">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {post.read_time}
                  </span>
                </div>
                <h3 className="text-base font-black text-white leading-snug hover:text-cyan-300 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">By {post.author.name}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                >
                  Read Article <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 3. Graded ESL Reading Passages & Curriculum Apps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graded Reading Passages */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/75 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-lg font-black text-white">Graded ESL Reading Comprehension Library</h3>
              <p className="text-xs text-slate-400">
                Contextual reading passages with vocabulary scaffolding across Beginner, Intermediate, and Advanced levels.
              </p>
            </div>
            <Link href="/reader" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 shrink-0">
              Open Reader Hub &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {readingPassages.map((article) => (
              <Link
                key={article.slug}
                href={`/reader/${article.slug}`}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-cyan-500/30 transition-all space-y-1"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span className="truncate">{article.title}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{article.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Interactive Learning Modules & Classroom Tools */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/75 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-lg font-black text-white">Interactive Learning &amp; Teacher Suite</h3>
              <p className="text-xs text-slate-400">
                Explore syllabus blueprints, learning objectives, and classroom instructions for our 26 educational tools.
              </p>
            </div>
            <Link href="/apps" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 shrink-0">
              All 26 Apps &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {featuredApps.map((app) => (
              <Link
                key={app.id}
                href={`/apps/${app.id}`}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-cyan-500/30 transition-all space-y-1"
              >
                <div className="text-xs font-bold text-cyan-300 truncate">{app.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2">{app.learning_objectives}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
