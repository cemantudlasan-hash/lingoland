'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  Filter,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { getAllBlogPosts, getBlogCategories, BlogPost } from '@/data/blog-posts';

const POSTS_PER_PAGE = 6;

export default function BlogIndexPage() {
  const allPosts = useMemo(() => getAllBlogPosts(), []);
  const categories = useMemo(() => getBlogCategories(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered Articles based on search and category
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesTitle = post.title.toLowerCase().includes(query);
      const matchesSummary = post.summary.toLowerCase().includes(query);
      const matchesTags = post.tags.some((t) => t.toLowerCase().includes(query));
      const matchesAuthor = post.author.name.toLowerCase().includes(query);

      return matchesCategory && (matchesTitle || matchesSummary || matchesTags || matchesAuthor);
    });
  }, [allPosts, searchQuery, selectedCategory]);

  // Reset to page 1 when query or category changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE) || 1;
  const paginatedPosts = useMemo(() => {
    const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const featuredPost = allPosts[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Public Header */}
      <PublicHeader />

      {/* 2. Hero Header Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-white/[0.08] bg-gradient-to-b from-indigo-950/30 via-slate-950/60 to-[#030712]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-600/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Educational Universe Blog &bull; Open Academic Knowledge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Cognitive Science, Gamification &amp; <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              The Art of English Fluency
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover peer-reviewed SLA insights, SuperMemo-2 spaced repetition research, affective filter reduction techniques, and interactive strategies for learners and modern educators.
          </p>

          {/* Search Bar Input */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-cyan-400/70 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search articles by grammar topic, CEFR level, memory science, or keyword..."
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

      {/* 3. Main Content & Directory Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Category Filters Bar */}
        <section aria-label="Article Categories" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter Category:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
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

        {/* Highlighted Featured Post (Shown when on page 1 with no search active) */}
        {currentPage === 1 && !searchQuery && selectedCategory === 'All' && featuredPost && (
          <section aria-label="Featured Article">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900/70 to-indigo-950/40 p-6 sm:p-10 shadow-2xl transition-all duration-300 hover:border-cyan-400/60 hover:-translate-y-1"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                    <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-wider">
                      Featured Investigation
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {featuredPost.read_time}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {featuredPost.published_date}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight leading-snug">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {featuredPost.summary}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-xs">
                      CA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{featuredPost.author.name}</div>
                      <div className="text-[11px] text-slate-400">{featuredPost.author.role}</div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-start lg:justify-end">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-400 text-slate-950 font-black text-xs shadow-lg group-hover:bg-cyan-300 group-hover:gap-3 transition-all">
                    <span>Read Full Paper</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Results Count & Filter Status */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredPosts.length}</strong> published educational articles
            {selectedCategory !== 'All' && <span> in <span className="text-cyan-400 font-bold">{selectedCategory}</span></span>}
            {searchQuery && <span> matching &ldquo;<span className="text-white">{searchQuery}</span>&rdquo;</span>}
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {/* Articles Grid */}
        {paginatedPosts.length > 0 ? (
          <section aria-label="Articles Grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {paginatedPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-slate-950/60 backdrop-blur-xl p-6 hover:border-cyan-400/40 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1.5 shadow-xl"
              >
                <div className="space-y-4">
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 font-bold border border-cyan-500/20 text-[11px]">
                      {post.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {post.read_time}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight leading-snug line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metadata & Link */}
                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/30 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                      {post.author.name.charAt(0)}
                    </div>
                    <span className="text-[11px] truncate max-w-[120px]">{post.author.name}</span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-slate-900/30">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No articles found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              We couldn&apos;t find any articles matching your search criteria. Try a different search term or category.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav aria-label="Blog Pagination" className="pt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pageNumber
                    ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                    : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </main>

      {/* 4. Public Footer */}
      <PublicFooter />
    </div>
  );
}
