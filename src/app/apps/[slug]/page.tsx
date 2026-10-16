import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Gamepad2, 
  Rocket, 
  BookOpen, 
  Target, 
  HelpCircle, 
  Play,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { getAllApps, getAppBySlug, AppDirectoryItem } from '@/data/apps-directory';
import { AppLaunchButton } from './app-launch-button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Static parameter pre-generation for all 26 apps
export async function generateStaticParams() {
  const apps = getAllApps();
  return apps.map((app) => ({
    slug: app.id,
  }));
}

// 2. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    return {
      title: 'App Not Found | LingoLandVerse',
      description: 'The requested educational application could not be found.',
    };
  }

  const siteUrl = 'https://www.lingolandverse.com';
  const pageUrl = `${siteUrl}/apps/${app.id}`;

  return {
    title: `${app.name} (${app.category}) | LingoLandVerse Flight Deck`,
    description: `${app.description} Learn ${app.target_rules.join(', ')} with CEFR level ${app.cefr_level} alignment.`,
    keywords: [
      app.name,
      app.category,
      ...app.target_rules,
      'ESL Learning Game',
      'Classroom Module',
      'LingoLandVerse'
    ],
    openGraph: {
      title: `${app.name} | LingoLandVerse Educational App`,
      description: app.learning_objectives,
      url: pageUrl,
      siteName: 'LingoLandVerse',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: app.name,
      description: app.description,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function AppDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const allApps = getAllApps();
  const relatedApps = allApps
    .filter((a) => a.id !== app.id && a.category === app.category)
    .slice(0, 3);

  // Schema.org SoftwareApplication / LearningResource JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: app.name,
    description: app.description,
    educationalLevel: app.cefr_level,
    learningResourceType: 'Interactive Game / Learning Module',
    competencyRequired: app.target_rules.join(', '),
    teaches: app.learning_objectives,
    url: `https://www.lingolandverse.com/apps/${app.id}`,
    provider: {
      '@type': 'Organization',
      name: 'LingoLandVerse Educational Consortium',
      url: 'https://www.lingolandverse.com',
    },
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Public Header */}
      <PublicHeader />

      {/* 2. Breadcrumb Navigation */}
      <section className="border-b border-white/[0.08] bg-slate-950/40 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All 26 Menus</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/apps" className="hover:text-white transition-colors">Apps</Link>
            <span>/</span>
            <span className="text-slate-300 font-medium truncate max-w-[150px] sm:max-w-[250px]">{app.name}</span>
          </div>
        </div>
      </section>

      {/* 3. Main App Profile Showcase */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* App Hero Card */}
        <section className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-indigo-950/40 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 font-extrabold border border-cyan-400/40 text-xs uppercase tracking-wider">
                {app.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 text-xs">
                CEFR Benchmark: {app.cefr_level}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Flight Deck Integration</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {app.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
              {app.description}
            </p>
          </div>

          {/* Interactive Launch Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <AppLaunchButton 
              launchUrl={app.launch_url} 
              appName={app.name} 
            />

            <Link
              href="/blog"
              className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 font-bold text-xs sm:text-sm text-center transition-all"
            >
              Read Pedagogical Research
            </Link>
          </div>
        </section>

        {/* Scannable Spec Cards (Learning Objectives, Target Rules, How-to-Play) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Learning Objectives */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Pedagogical Learning Objectives</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Targeted Language Outcomes
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {app.learning_objectives}
            </p>
            <div className="pt-2">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-white block">Key Feature Scaffolding:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-400">
                  {app.key_features.map((feat) => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Target Rules & Syntax */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Syllabus Target Rules</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Core Syntactic Focus Areas
            </h2>
            <div className="space-y-2.5 pt-1">
              {app.target_rules.map((rule) => (
                <div
                  key={rule}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">
                    {rule}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Card 3: Step-by-Step How to Play / Operation Guide */}
        <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Operational Blueprint &bull; How to Play</span>
          </div>

          <h2 className="text-2xl font-black text-white">
            Step-by-Step Flight Instructions
          </h2>

          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/20 border border-amber-500/20 text-slate-200 text-sm sm:text-base leading-relaxed">
            {app.how_to_play}
          </div>
        </section>

        {/* Related Apps in Same Category */}
        {relatedApps.length > 0 && (
          <section className="pt-8 border-t border-white/[0.08] space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>More Modules in {app.category}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedApps.map((related) => (
                <Link
                  key={related.id}
                  href={`/apps/${related.id}`}
                  className="group block p-5 rounded-2xl bg-slate-950/60 border border-white/[0.08] hover:border-cyan-400/40 hover:bg-slate-900/60 transition-all duration-300"
                >
                  <span className="text-[10px] font-bold text-amber-400 block mb-1">
                    CEFR {related.cefr_level}
                  </span>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {related.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {related.description}
                  </p>
                  <div className="text-[11px] text-cyan-400 font-bold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect Specs</span>
                    <span>&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 4. Public Footer */}
      <PublicFooter />
    </div>
  );
}
