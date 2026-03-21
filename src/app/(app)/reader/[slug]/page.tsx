
import { getArticleBySlug } from "@/lib/articles";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArticleViewTracker } from './article-view-tracker';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ArticleViewTracker article={article} />
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/reader">
            <ArrowLeft className="mr-2" /> Back to Reader
          </Link>
        </Button>
      </div>
      <article className="space-y-6">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {article.title}
          </h1>
           <p className="text-lg text-muted-foreground">{article.description}</p>
        </header>

        <Image
          src={article.image}
          alt={article.title}
          width={800}
          height={400}
          className="w-full rounded-lg object-cover"
          data-ai-hint={article.imageHint}
        />
        
        <div className="bg-card/80 backdrop-blur-sm border border-border/20 rounded-lg p-6">
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground text-lg leading-relaxed whitespace-pre-line">
                {article.content}
            </div>
        </div>
      </article>
    </div>
  );
}

    