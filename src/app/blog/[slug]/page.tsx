import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  Tag, 
  BookOpen, 
  Rocket, 
  Share2, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { getAllBlogPosts, getBlogPostBySlug, BlogPost } from '@/data/blog-posts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Static Generation for all dynamic blog routes
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 2. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | LingoLandVerse',
      description: 'The requested educational article could not be located.',
    };
  }

  const siteUrl = 'https://www.lingolandverse.com';
  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | LingoLandVerse Educational Blog`,
    description: post.meta_description,
    keywords: [...post.tags, post.category, 'ESL Learning', 'Language Acquisition', 'LingoLandVerse'],
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.meta_description,
      url: articleUrl,
      siteName: 'LingoLandVerse',
      type: 'article',
      publishedTime: post.published_date,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description,
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

// Simple Markdown Formatter Helper
function renderMarkdownContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    // Code block toggle
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="my-6 p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm font-mono overflow-x-auto shadow-inner"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`space-${index}`} className="h-4" />);
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-xl sm:text-2xl font-bold text-cyan-300 mt-8 mb-3 tracking-tight">
          {line.replace('### ', '')}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-2xl sm:text-3xl font-black text-white mt-12 mb-4 tracking-tight border-b border-white/[0.08] pb-3">
          {line.replace('## ', '')}
        </h2>
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="my-5 p-4 sm:p-5 rounded-2xl bg-cyan-950/30 border-l-4 border-cyan-400 text-slate-200 italic text-sm sm:text-base leading-relaxed"
        >
          {line.replace('> ', '').replace(/\*/g, '')}
        </blockquote>
      );
      return;
    }

    // Bullet Points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={`li-${index}`} className="ml-6 text-slate-300 text-sm sm:text-base leading-relaxed list-disc my-1.5 marker:text-cyan-400">
          {line.replace(/^[-*]\s+/, '')}
        </li>
      );
      return;
    }

    // Horizontal Rule
    if (line.startsWith('---')) {
      elements.push(<hr key={`hr-${index}`} className="my-8 border-white/10" />);
      return;
    }

    // Standard Paragraph
    elements.push(
      <p key={`p-${index}`} className="text-slate-300 text-sm sm:text-base leading-relaxed my-3 font-normal">
        {line}
      </p>
    );
  });

  return elements;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Related articles (matching same category or other articles)
  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  // Schema.org Article Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description,
    datePublished: post.published_date,
    dateModified: post.published_date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LingoLandVerse Educational Consortium',
      url: 'https://www.lingolandverse.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.lingolandverse.com/favicon.ico',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.lingolandverse.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
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

      {/* 2. Breadcrumb & Navigation Bar */}
      <section className="border-b border-white/[0.08] bg-slate-950/40 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-300 font-medium truncate max-w-[150px] sm:max-w-[250px]">{post.category}</span>
          </div>
        </div>
      </section>

      {/* 3. Article Core Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <article className="space-y-8">
          {/* Article Header */}
          <header className="space-y-6 pb-8 border-b border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                {post.category}
              </span>
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {post.read_time}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Published {post.published_date}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Author Byline Box */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-sm shrink-0">
                CA
              </div>
              <div>
                <div className="text-sm font-bold text-white">{post.author.name}</div>
                <div className="text-xs text-slate-400">{post.author.role}</div>
              </div>
            </div>
          </header>

          {/* Article Lead Summary */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-indigo-950/20 border border-cyan-500/20 text-slate-200 text-base sm:text-lg leading-relaxed font-medium">
            <strong>Key Thesis:</strong> {post.summary}
          </div>

          {/* Main Article Body (High text-to-code ratio) */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            {renderMarkdownContent(post.content)}
          </div>

          {/* Article Footer: Tags & Author Bio */}
          <footer className="pt-10 mt-12 border-t border-white/[0.08] space-y-8">
            {/* Tags list */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Indexed Topics:
              </span>
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-300 font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Creator / Author Bio Box */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-300 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-lg shrink-0 shadow-lg">
                CA
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Written by {post.author.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold">
                    Verified Creator
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {post.author.bio}
                </p>
              </div>
            </div>

            {/* Call to Action Box: Play games / Explore apps */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-cyan-950/60 border border-cyan-500/30 text-center space-y-4 shadow-2xl">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Experience These Principles in Action
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Explore LingoLandVerse&apos;s 26 gamified micro-apps, including the Space Debris Sweeper, Acoustic Study Room, and 79+ classroom arcade worlds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/apps"
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition-all shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                >
                  Explore All 26 Menus
                </Link>
                <Link
                  href="/study-room"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold text-xs transition-all"
                >
                  Open Study Room
                </Link>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section aria-label="Related Articles" className="pt-16 mt-16 border-t border-white/[0.08] space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Recommended Further Reading</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group block p-5 rounded-2xl bg-slate-950/60 border border-white/[0.08] hover:border-cyan-400/40 hover:bg-slate-900/60 transition-all duration-300"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                    {related.category}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
                    <span>{related.read_time}</span>
                    <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
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
