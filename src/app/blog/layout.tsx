import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Educational Universe Blog | ESL Pedagogy & Gamification | LingoLandVerse',
  description: 'Explore research-backed ESL methodologies, SuperMemo-2 spaced repetition, affective filter reduction, classroom acoustic management, and gamified language acquisition strategies.',
  keywords: [
    'ESL Blog',
    'English Language Learning',
    'Gamified Learning',
    'Spaced Repetition SM-2',
    'Affective Filter',
    'Phonetics Labs',
    'CEFR Roadmap',
    'LingoLandVerse'
  ],
  openGraph: {
    title: 'Educational Universe Blog | LingoLandVerse',
    description: 'Pedagogical research, cognitive science, and interactive strategies for ESL learners and modern educators.',
    url: 'https://www.lingolandverse.com/blog',
    siteName: 'LingoLandVerse',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Educational Universe Blog | LingoLandVerse',
    description: 'Pedagogical research and gamified language learning insights.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
