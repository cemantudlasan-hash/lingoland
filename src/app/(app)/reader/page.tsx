"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { articles as initialArticlesData } from "@/lib/articles";
import type { Article } from "@/lib/articles";
import { generateArticle } from "@/ai/flows/generate-article";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Hourglass, Target, Lightbulb, BookOpenCheck, Feather, Brain, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ConstellationCanvas } from "@/components/ui/constellation-canvas";

type ArticleCategory = keyof typeof initialArticlesData;
const LOCAL_STORAGE_KEY = 'lingoland_reader_articles';

interface ArticleListProps {
  category: ArticleCategory;
  articles: Article[];
  onGenerate: (category: ArticleCategory) => void;
  isLoading: boolean;
}

function ArticleList({ category, articles, onGenerate, isLoading }: ArticleListProps) {
  const icons = [Hourglass, Target, Lightbulb, BookOpenCheck, Feather, Brain];

  // Map category to color styling tokens
  const categoryThemes = {
    beginner: {
      accent: "bg-emerald-500",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
      text: "text-emerald-400 group-hover:text-emerald-300",
      border: "border-emerald-500/10 group-hover:border-emerald-500/30",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
    },
    intermediate: {
      accent: "bg-indigo-500",
      glow: "shadow-[0_0_12px_rgba(99,102,241,0.4)]",
      text: "text-indigo-400 group-hover:text-indigo-300",
      border: "border-indigo-500/10 group-hover:border-indigo-500/30",
      bgGradient: "from-indigo-500/10 to-purple-500/5",
    },
    advanced: {
      accent: "bg-pink-500",
      glow: "shadow-[0_0_12px_rgba(236,72,153,0.4)]",
      text: "text-pink-400 group-hover:text-pink-300",
      border: "border-pink-500/10 group-hover:border-pink-500/30",
      bgGradient: "from-pink-500/10 to-rose-500/5",
    },
  };

  const theme = categoryThemes[category];

  return (
    <div className="space-y-6 pt-6 relative z-10">
      <div className="flex justify-end">
        <Button 
          onClick={() => onGenerate(category)} 
          disabled={isLoading}
          className={cn(
            "relative overflow-hidden font-bold h-11 px-6 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 shadow-md",
            category === 'beginner' 
              ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 border-emerald-500/30 text-white shadow-emerald-500/10 hover:shadow-emerald-500/20"
              : category === 'intermediate'
              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 border-indigo-500/30 text-white shadow-indigo-500/10 hover:shadow-indigo-500/20"
              : "bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 border-pink-500/30 text-white shadow-pink-500/10 hover:shadow-pink-500/20"
          )}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          {isLoading ? 'Synthesizing...' : 'Generate New Article'}
        </Button>
      </div>

      {articles.length === 0 && !isLoading ? (
        <div className="text-center text-slate-400 py-16 bg-slate-900/20 backdrop-blur-md rounded-2xl border border-slate-800/40">
          <Sparkles className="h-10 w-10 text-indigo-400/40 mx-auto mb-3" />
          <p className="text-base font-semibold">No articles in this category yet.</p>
          <p className="text-xs text-slate-500 mt-1">Click the button above to generate a new AI story!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: Article, index: number) => {
            const Icon = icons[index % icons.length];

            return (
              <div key={article.slug} className="space-y-4 group">
                <Link href={`/reader/${article.slug}`} className="block">
                  <div className={cn(
                    "flex bg-slate-900/40 border backdrop-blur-md rounded-2xl overflow-hidden h-full min-h-[180px] transition-all duration-500 hover:shadow-xl",
                    theme.border
                  )}>
                    {/* Left neon indicator bar and icon panel */}
                    <div className="flex-shrink-0 flex">
                      <div className={cn("w-1.5 transition-all duration-500 group-hover:scale-y-105", theme.accent, theme.glow)}></div>
                      <div className="w-20 bg-slate-950/40 p-4 flex flex-col items-center justify-center space-y-4 border-r border-slate-900/60">
                        <span className="text-2xl font-black text-slate-600 select-none tracking-tight">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <Icon className={cn("h-7 w-7 transition-transform duration-500 group-hover:scale-110", theme.text)} />
                      </div>
                    </div>
                    {/* Description Content */}
                    <div className="p-5 flex flex-col justify-center flex-grow bg-gradient-to-br from-transparent to-slate-950/25">
                      <CardDescription className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                        {article.description}
                      </CardDescription>
                    </div>
                  </div>
                </Link>
                <h3 className="text-center font-extrabold text-lg text-slate-100/90 group-hover:text-white transition-colors px-2 font-sans tracking-wide">
                  {article.title}
                </h3>
              </div>
            );
          })}
          {isLoading && (
            <>
              <ArticleSkeleton />
              <ArticleSkeleton />
              <ArticleSkeleton />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex bg-slate-900/20 border border-slate-800/40 rounded-2xl overflow-hidden h-[180px] backdrop-blur-md">
        <div className="flex-shrink-0 flex">
          <Skeleton className="w-1.5 h-full bg-slate-800" />
          <div className="w-20 bg-slate-950/20 p-4 flex flex-col items-center justify-center space-y-4">
            <Skeleton className="h-6 w-8 bg-slate-800" />
            <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />
          </div>
        </div>
        <div className="p-5 space-y-3 flex-grow justify-center flex flex-col">
          <Skeleton className="h-3.5 w-full bg-slate-800" />
          <Skeleton className="h-3.5 w-5/6 bg-slate-800" />
          <Skeleton className="h-3.5 w-4/5 bg-slate-800" />
        </div>
      </div>
      <Skeleton className="h-5 w-2/3 mx-auto bg-slate-800 rounded-md" />
    </div>
  );
}

export default function ReaderPage() {
  const [articles, setArticles] = useState<Record<ArticleCategory, Article[]>>(initialArticlesData);
  const [loadingCategory, setLoadingCategory] = useState<ArticleCategory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedArticlesJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      const initialSlugs = new Set([
        ...initialArticlesData.beginner.map(a => a.slug),
        ...initialArticlesData.intermediate.map(a => a.slug),
        ...initialArticlesData.advanced.map(a => a.slug),
      ]);

      if (storedArticlesJSON) {
        const storedArticles: Record<ArticleCategory, Article[]> = JSON.parse(storedArticlesJSON);
        const mergedArticles = { ...initialArticlesData };

        for (const category of ['beginner', 'intermediate', 'advanced'] as ArticleCategory[]) {
          const userGenerated = storedArticles[category]?.filter(a => !initialSlugs.has(a.slug)) || [];
          const allForCategory = [...userGenerated, ...initialArticlesData[category]];
          
          mergedArticles[category] = allForCategory.filter((article, index, self) =>
            index === self.findIndex((a) => (
              a.slug === article.slug
            ))
          );
        }

        setArticles(mergedArticles);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedArticles));
      } else {
        setArticles(initialArticlesData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialArticlesData));
      }
    } catch (e) {
      console.error("Failed to process articles from localStorage", e);
      setArticles(initialArticlesData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialArticlesData));
    }
  }, []);

  useEffect(() => {
    try {
      if (articles !== initialArticlesData) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
      }
    } catch(e) {
      console.error("Failed to save articles to localStorage", e);
    }
  }, [articles]);

  const handleGenerateArticle = async (category: ArticleCategory) => {
    setLoadingCategory(category);
    try {
      const existingTitles = articles[category].map(a => a.title);
      const result = await generateArticle({ difficulty: category, existingTitles });
      
      if (result.article) {
        const newArticle: Article = {
          ...result.article,
          slug: result.article.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
          image: `https://picsum.photos/seed/${Math.random()}/600/400`,
        };
        
        setArticles(prevArticles => ({
          ...prevArticles,
          [category]: [newArticle, ...prevArticles[category]]
        }));

        toast({
          title: "Article Generated!",
          description: `Successfully synthesized: "${result.article.title}"`
        });
      } else {
        throw new Error("Generated article is missing.");
      }
    } catch (e) {
      console.error("Failed to generate article:", e);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate a new article. Please try again."
      });
    } finally {
      setLoadingCategory(null);
    }
  };

  return (
    <div className="relative min-h-[80vh] w-full">
      <ConstellationCanvas />
      
      <Tabs defaultValue="beginner" className="w-full relative z-10">
        <TabsList className="grid w-full grid-cols-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-1.5 h-14 backdrop-blur-md shadow-2xl">
          <TabsTrigger 
            value="beginner"
            className="rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 text-slate-400 hover:text-slate-200 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30"
          >
            Beginner
          </TabsTrigger>
          <TabsTrigger 
            value="intermediate"
            className="rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 text-slate-400 hover:text-slate-200 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30"
          >
            Intermediate
          </TabsTrigger>
          <TabsTrigger 
            value="advanced"
            className="rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 text-slate-400 hover:text-slate-200 data-[state=active]:bg-pink-500/10 data-[state=active]:text-pink-400 data-[state=active]:border data-[state=active]:border-pink-500/30"
          >
            Advanced
          </TabsTrigger>
        </TabsList>
        <TabsContent value="beginner">
          <ArticleList 
            category="beginner" 
            articles={articles.beginner} 
            onGenerate={handleGenerateArticle}
            isLoading={loadingCategory === 'beginner'}
          />
        </TabsContent>
        <TabsContent value="intermediate">
          <ArticleList 
            category="intermediate" 
            articles={articles.intermediate} 
            onGenerate={handleGenerateArticle}
            isLoading={loadingCategory === 'intermediate'}
          />
        </TabsContent>
        <TabsContent value="advanced">
          <ArticleList 
            category="advanced" 
            articles={articles.advanced} 
            onGenerate={handleGenerateArticle}
            isLoading={loadingCategory === 'advanced'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
