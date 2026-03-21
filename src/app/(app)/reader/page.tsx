
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { articles as initialArticlesData } from "@/lib/articles";
import type { Article } from "@/lib/articles";
import { generateArticle } from "@/ai/flows/generate-article";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Hourglass, Target, Lightbulb, BookOpenCheck, Feather, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SkillLevel } from "@/ai/flows/types";
import { cn } from "@/lib/utils";


type ArticleCategory = keyof typeof initialArticlesData;
const LOCAL_STORAGE_KEY = 'lingoland_reader_articles';


function ArticleList({ category, articles, onGenerate, isLoading }: { category: ArticleCategory, articles: Article[], onGenerate: (category: ArticleCategory) => void, isLoading: boolean }) {
  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
  ];
  const icons = [Hourglass, Target, Lightbulb, BookOpenCheck, Feather, Brain];
  
  return (
    <div className="space-y-6 pt-6">
        <div className="flex justify-end">
             <Button onClick={() => onGenerate(category)} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <Wand2 className="mr-2"/>}
                {isLoading ? 'Generating...' : 'Generate New Article'}
            </Button>
        </div>
        {articles.length === 0 && !isLoading ? (
            <div className="text-center text-muted-foreground py-12">
                <p>No articles in this category yet. Generate one to get started!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article: Article, index: number) => {
                    const color = colors[index % colors.length];
                    const Icon = icons[index % icons.length];

                    return (
                        <div key={article.slug} className="space-y-3 group">
                            <Link href={`/reader/${article.slug}`} className="block">
                                <div className="flex bg-card rounded-lg shadow-lg overflow-hidden h-full min-h-[200px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                    {/* Left Bar */}
                                    <div className="flex-shrink-0 flex">
                                        <div className={cn("w-3", color)}></div>
                                        <div className="w-20 bg-muted p-4 flex flex-col items-center justify-center space-y-4">
                                            <span className="text-2xl font-bold text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                                            <Icon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="p-6 flex flex-col">
                                        <CardDescription className="text-sm flex-grow">{article.description}</CardDescription>
                                    </div>
                                </div>
                            </Link>
                             <h3 className="text-center font-bold text-lg text-foreground/90 group-hover:text-primary transition-colors px-2">{article.title}</h3>
                        </div>
                    )
                })}
                {isLoading && <>
                    <ArticleSkeleton />
                    <ArticleSkeleton />
                    <ArticleSkeleton />
                </>}
            </div>
        )}
    </div>
  );
}

function ArticleSkeleton() {
    return (
        <div className="space-y-3">
            <div className="flex bg-card rounded-lg shadow-lg overflow-hidden h-[200px]">
                <div className="flex-shrink-0 flex">
                    <Skeleton className="w-3 h-full" />
                    <div className="w-20 bg-muted p-4 flex flex-col items-center justify-center space-y-4">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
                <div className="p-6 space-y-2 flex-grow">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
            <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
    )
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
                // Combine user-generated articles with the (potentially updated) initial articles
                const allForCategory = [...userGenerated, ...initialArticlesData[category]];
                
                // Ensure no duplicates in the final list for a category
                mergedArticles[category] = allForCategory.filter((article, index, self) =>
                    index === self.findIndex((a) => (
                        a.slug === article.slug
                    ))
                );
            }

            setArticles(mergedArticles);
            // Update localStorage with the clean, merged data
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedArticles));

        } else {
            // First time load, just use initial data
            setArticles(initialArticlesData);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialArticlesData));
        }
    } catch (e) {
        console.error("Failed to process articles from localStorage", e);
        // Fallback to initial data if something goes wrong
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
        } else {
            throw new Error("Generated article is missing.")
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
    <Tabs defaultValue="beginner" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="beginner">Beginner</TabsTrigger>
        <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
  );
}
