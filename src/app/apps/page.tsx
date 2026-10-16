'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Grid, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Gamepad2, 
  Award,
  Layers
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { getAllApps, getAllCategories, AppDirectoryItem } from '@/data/apps-directory';

export default function AppsDirectoryPage() {
  const allApps = useMemo(() => getAllApps(), []);
  const categories = useMemo(() => getAllCategories(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredApps = useMemo(() => {
    return allApps.filter((app) => {
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesName = app.name.toLowerCase().includes(query);
      const matchesDesc = app.description.toLowerCase().includes(query);
      const matchesObjectives = app.learning_objectives.toLowerCase().includes(query);
      const matchesRules = app.target_rules.some((r) => r.toLowerCase().includes(query));

      return matchesCategory && (matchesName || matchesDesc || matchesObjectives || matchesRules);
    });
  }, [allApps, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Public Header */}
      <PublicHeader />

      {/* 2. Hero Header Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-white/[0.08] bg-gradient-to-b from-indigo-950/30 via-slate-950/60 to-[#030712]">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-600/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Public App &amp; Game Directory &bull; 26 Integrated Menus</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Explore All 26 Educational Apps &amp; <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Gamified Learning Matrix Modules
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Crawl, inspect, and explore the learning objectives, pedagogical target rules, and operational blueprints for all 26 flight deck micro-apps before initiating your pilot journey.
          </p>

          {/* Search Bar Input */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-cyan-400/70 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by app name, grammar rules, CEFR objectives..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-xl backdrop-blur-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Directory Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        {/* Category Filters Bar */}
        <section aria-label="App Categories" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Category Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/[0.08] hover:border-cyan-500/30'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Displaying <strong className="text-white">{filteredApps.length}</strong> of {allApps.length} verified educational apps
            {selectedCategory !== 'All' && <span> in <span className="text-cyan-400 font-bold">{selectedCategory}</span></span>}
          </span>
          <span className="hidden sm:inline">Click any app card to view syllabus &amp; launch instructions</span>
        </div>

        {/* Grid of Apps */}
        {filteredApps.length > 0 ? (
          <section aria-label="Apps Grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-slate-950/60 backdrop-blur-xl overflow-hidden hover:border-cyan-400/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1.5 shadow-xl"
              >
                {/* Header Band */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/20 text-[11px]">
                      {app.category}
                    </span>
                    <span className="text-[11px] font-bold text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      CEFR {app.cefr_level}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                    <Link href={`/apps/${app.id}`}>
                      {app.name}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                    {app.description}
                  </p>

                  {/* Target Grammar Badges */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Target Rules &amp; Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.target_rules.slice(0, 3).map((rule) => (
                        <span
                          key={rule}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                        >
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-4 border-t border-white/[0.06] bg-slate-900/40 flex items-center justify-between">
                  <Link
                    href={`/apps/${app.id}`}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    View Specs &rarr;
                  </Link>

                  <Link
                    href={`/apps/${app.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-400/15 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 font-bold text-xs border border-cyan-400/30 hover:border-cyan-400 transition-all"
                  >
                    <span>Launch Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-slate-900/30">
            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No applications match your search</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Try adjusting your query or resetting category filters to browse all 26 modules.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* 4. Public Footer */}
      <PublicFooter />
    </div>
  );
}
