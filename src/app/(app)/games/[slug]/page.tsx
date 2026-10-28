import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allGames } from "@/lib/games";
import { GameClientWrapper } from "./game-client-wrapper";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allGames.map((game) => ({
    slug: game.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = allGames.find((g) => g.slug === slug);

  if (!game) {
    return {
      title: "Learning Module Not Found | LingoLandVerse",
      description: "The requested interactive educational game could not be found.",
    };
  }

  const cefrLabel =
    game.level === "beginner"
      ? "CEFR A1–A2"
      : game.level === "intermediate"
      ? "CEFR B1–B2"
      : "CEFR C1–C2";

  const siteUrl = "https://www.lingolandverse.com";
  const pageUrl = `${siteUrl}/games/${game.slug}`;

  return {
    title: `${game.title} — Interactive ${game.subject.toUpperCase()} & ${game.focus} Game (${cefrLabel}) | LingoLandVerse`,
    description: `${game.description} Play ${game.title} on LingoLandVerse and explore our complete ${cefrLabel} classroom teacher guide and lesson plan for ${game.focus}.`,
    keywords: [
      game.title,
      game.focus,
      game.subject,
      cefrLabel,
      "ESL Interactive Game",
      "Classroom Smartboard Activity",
      "LingoLandVerse",
    ],
    openGraph: {
      title: `${game.title} | LingoLandVerse Educational Game`,
      description: game.description,
      url: pageUrl,
      siteName: "LingoLandVerse",
      type: "website",
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = allGames.find((g) => g.slug === slug);

  if (!game) {
    notFound();
  }

  const cefrLabel =
    game.level === "beginner"
      ? "CEFR A1–A2"
      : game.level === "intermediate"
      ? "CEFR B1–B2"
      : "CEFR C1–C2";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: game.title,
    description: game.description,
    educationalLevel: cefrLabel,
    learningResourceType: "Interactive Educational Game & Lesson Guide",
    teaches: `${game.subject} - ${game.focus}`,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: "Ceman Tudlasan",
    },
    publisher: {
      "@type": "EducationalOrganization",
      name: "LingoLandVerse",
      url: "https://www.lingolandverse.com",
    },
    url: `https://www.lingolandverse.com/games/${game.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GameClientWrapper slug={slug} />
    </>
  );
}
