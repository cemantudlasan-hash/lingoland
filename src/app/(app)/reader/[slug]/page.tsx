"use client";

import { getArticleBySlug } from "@/lib/articles";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { ArticleViewTracker } from './article-view-tracker';
import { ConstellationCanvas } from "@/components/ui/constellation-canvas";

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  // Calculate estimated reading time (approx 200 words per minute)
  const wordCount = article.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="relative min-h-[85vh] w-full py-4 px-2 md:px-6">
      <ConstellationCanvas />
      
      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        
        {/* Back navigation */}
        <div className="flex justify-between items-center">
          <Button asChild variant="outline" className="bg-slate-900/60 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-300 shadow-md">
            <Link href="/reader" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Reader
            </Link>
          </Button>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 bg-slate-900/50 border border-slate-850 px-3 py-1.5 rounded-xl backdrop-blur-sm select-none">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-pink-400" />
              {readingTime} min read
            </span>
          </div>
        </div>

        {/* Article content block */}
        <article className="bg-slate-900/40 border border-slate-850/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 overflow-hidden">
          <ArticleViewTracker article={article} />

          <header className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight font-sans bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              {article.title}
            </h1>
            <p className="text-base md:text-lg text-slate-350 font-medium leading-relaxed border-l-2 border-indigo-500/50 pl-4 text-slate-350">
              {article.description}
            </p>
          </header>

          {/* Featured Image */}
          <div className="relative w-full h-[240px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 group">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              data-ai-hint={article.imageHint}
              priority
            />
            {/* Ambient vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
          </div>
          
          {/* Prose Content */}
          <div className="bg-slate-950/30 border border-slate-900/80 rounded-2xl p-6 md:p-8">
            <div className="text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium antialiased space-y-4 selection:bg-indigo-500/30 selection:text-white">
              {article.content}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}