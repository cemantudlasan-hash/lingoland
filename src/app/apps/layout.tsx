import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Public Apps & Educational Tools Directory (All 26 Menus) | LingoLandVerse',
  description: 'Explore the complete directory of LingoLandVerse educational micro-apps, arcade games, teacher tools, and syllabus suites. Learn syntax with Space Debris Sweeper, practice dialogue in Alien Market Trader, and master CEFR grammar.',
  keywords: [
    'ESL Apps',
    'Classroom Games',
    'Space Debris Sweeper',
    'Alien Market Trader',
    'Acoustic Study Room',
    'Language Learning Apps',
    'LingoLandVerse Apps'
  ],
  openGraph: {
    title: 'Public Apps & Educational Tools Directory | LingoLandVerse',
    description: 'Explore the 26 gamified micro-apps and classroom suites of LingoLandVerse before logging in.',
    url: 'https://www.lingolandverse.com/apps',
    siteName: 'LingoLandVerse',
    type: 'website',
  },
};

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
