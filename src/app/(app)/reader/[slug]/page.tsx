import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "@/lib/articles";
import { ReaderArticleClient } from "./reader-article-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = [
    ...articles.beginner,
    ...articles.intermediate,
    ...articles.advanced,
  ];
  return all.map((article) => ({
    slug: article.slug,
  }));
}

function getArticleCategoryLabel(slug: string): string {
  if (articles.beginner.some((a) => a.slug === slug)) return "CEFR A1–A2 (Beginner)";
  if (articles.intermediate.some((a) => a.slug === slug)) return "CEFR B1–B2 (Intermediate)";
  if (articles.advanced.some((a) => a.slug === slug)) return "CEFR C1–C2 (Advanced)";
  return "CEFR Graded Reader";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Reading Passage Not Found | LingoLandVerse",
      description: "The requested graded ESL reading passage could not be found.",
    };
  }

  const levelLabel = getArticleCategoryLabel(slug);
  const siteUrl = "https://www.lingolandverse.com";
  const pageUrl = `${siteUrl}/reader/${article.slug}`;

  return {
    title: `${article.title} — ${levelLabel} ESL Reading & Vocabulary Guide | LingoLandVerse`,
    description: `${article.description} Read the full ${levelLabel} graded English passage "${article.title}" with key vocabulary notes, comprehension questions, and interactive flashcards.`,
    keywords: [
      article.title,
      levelLabel,
      "ESL Graded Reader",
      "English Reading Comprehension",
      "Vocabulary Study Guide",
      "LingoLandVerse",
    ],
    openGraph: {
      title: `${article.title} | Graded ESL Reading Passage`,
      description: article.description,
      url: pageUrl,
      siteName: "LingoLandVerse",
      type: "article",
      images: [{ url: article.image, alt: article.title }],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const levelLabel = getArticleCategoryLabel(slug);
  const allArticles = [
    ...articles.beginner,
    ...articles.intermediate,
    ...articles.advanced,
  ];
  const relatedArticles = allArticles
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  const wordCount = article.content.split(/\s+/).length;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${article.title} — Graded ESL Reading Passage`,
    description: article.description,
    educationalLevel: levelLabel,
    learningResourceType: "Reading Passage & Study Guide",
    inLanguage: "en",
    wordCount,
    author: {
      "@type": "Person",
      name: "Ceman Tudlasan",
    },
    publisher: {
      "@type": "EducationalOrganization",
      name: "LingoLandVerse",
      url: "https://www.lingolandverse.com",
    },
    url: `https://www.lingolandverse.com/reader/${article.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReaderArticleClient
        article={article}
        levelLabel={levelLabel}
        relatedArticles={relatedArticles}
      />
    </>
  );
}
