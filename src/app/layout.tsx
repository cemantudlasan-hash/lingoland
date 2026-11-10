import type {Metadata} from 'next';
import './globals.css';
import { AuthProviderWrapper } from '@/context/auth-provider-wrapper';
import { FirebaseClientProvider } from '@/firebase';
import { SeasonalThemeProvider } from '@/context/seasonal-theme-context';
import { SeasonalEffectsLayer } from '@/components/seasonal/SeasonalEffectsLayer';
import PlexusBackground from '@/components/layout/PlexusBackground';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.lingolandverse.com'),
  title: {
    default: 'LingoLandVerse | Free Interactive ESL, Math & Science Games for Teachers & Students',
    template: '%s | LingoLandVerse',
  },
  description:
    'Free interactive educational universe for teachers and students: 79+ CEFR A1–C2 ESL, Math & Science classroom games, AI slide deck & exam generator, SuperMemo-2 flashcards, graded reading lab, and Lingo-Pet companion.',
  publisher: 'LingoLandVerse',
  authors: [{ name: 'Ceman Tudlasan' }],
  keywords: [
    'ESL games for teachers',
    'free classroom games for students',
    'interactive smartboard games ESL',
    'English grammar games online free',
    'CEFR A1 A2 B1 B2 C1 C2 games',
    'spaced repetition vocabulary flashcards',
    'SuperMemo-2 ESL',
    'AI lesson plan and presentation maker for teachers',
    'graded reading comprehension ESL',
    'gamified math and science games for kids',
    'LingoLandVerse',
  ],
  alternates: {
    canonical: 'https://www.lingolandverse.com',
  },
  openGraph: {
    type: 'website',
    title: 'LingoLandVerse | 79+ Free Interactive Classroom Games & AI Teacher Suite',
    description:
      'Invite your teachers and students! Play 79+ CEFR-aligned ESL, Math & Science games, project instant Smartboard activities, and generate AI lessons for free.',
    siteName: 'LingoLandVerse',
    url: 'https://www.lingolandverse.com',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LingoLandVerse | 79+ Free Interactive Classroom Games & AI Suite',
    description:
      '100% Free for Teachers & Students: 79+ ESL, Math & Science classroom games, CEFR Reading Lab, AI Slide Deck Maker & 3D Lingo-Pets.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9029482278295441';
  const isLiveAdSense = adsenseClientId && adsenseClientId !== 'ca-pub-XXXXXXXXXXXXXXXX';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=PT+Sans:wght@400;700&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {/* Strip & silence third-party browser extension attributes (e.g. Bitdefender bis_skin_checked, bis_use) */}
        <script
          id="extension-hydration-cleaner"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;

                // 1. Filter out browser extension hydration mismatch noise from developer console
                const origError = console.error;
                console.error = function(...args) {
                  const str = args.map(a => {
                    if (typeof a === 'string') return a;
                    if (a && a.message) return a.message;
                    try { return JSON.stringify(a); } catch(e) { return String(a || ''); }
                  }).join(' ');
                  if (
                    str.includes('bis_skin_checked') ||
                    str.includes('bis_use') ||
                    str.includes('chrome-extension://') ||
                    str.includes('data-dynamic-id')
                  ) {
                    return;
                  }
                  origError.apply(console, args);
                };

                // 2. Prevent setAttribute from adding bis_skin_checked or bis_use
                try {
                  const origSet = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked' || name === 'bis_use') return;
                    return origSet.call(this, name, val);
                  };
                } catch(e) {}

                // 3. Continuously clean any attributes injected before/during hydration
                try {
                  const cleanNode = (node) => {
                    if (!node || node.nodeType !== 1) return;
                    if (node.hasAttribute('bis_skin_checked')) node.removeAttribute('bis_skin_checked');
                    if (node.hasAttribute('bis_use')) node.removeAttribute('bis_use');
                  };
                  const observer = new MutationObserver((mutations) => {
                    for (let i = 0; i < mutations.length; i++) {
                      const m = mutations[i];
                      if (m.type === 'attributes' && (m.attributeName === 'bis_skin_checked' || m.attributeName === 'bis_use')) {
                        m.target.removeAttribute(m.attributeName);
                      } else if (m.type === 'childList') {
                        for (let j = 0; j < m.addedNodes.length; j++) {
                          cleanNode(m.addedNodes[j]);
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    childList: true,
                    attributeFilter: ['bis_skin_checked', 'bis_use']
                  });
                } catch(e) {}
              })();
            `,
          }}
        />

        {/* Structured Data for Google Search & AdSense Publisher Verification */}
        <script
          id="structured-data-jsonld"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'EducationalOrganization',
                  name: 'LingoLandVerse',
                  url: 'https://www.lingolandverse.com',
                  founder: {
                    '@type': 'Person',
                    name: 'Ceman Tudlasan',
                    jobTitle: 'Lead Educational Technologist',
                  },
                  description:
                    'Interactive ESL and multilingual learning platform combining SuperMemo-2 spaced repetition, CEFR-aligned lessons, graded reading comprehension, and 79+ educational classroom games.',
                },
                {
                  '@type': 'WebSite',
                  name: 'LingoLandVerse',
                  url: 'https://www.lingolandverse.com',
                },
                {
                  '@type': 'WebApplication',
                  name: 'LingoLandVerse Classroom & Self-Study Suite',
                  url: 'https://www.lingolandverse.com',
                  applicationCategory: 'EducationalApplication',
                  operatingSystem: 'All',
                  isAccessibleForFree: true,
                  educationalUse: [
                    'Classroom Smartboard Game',
                    'ESL Vocabulary & Grammar Practice',
                    'Reading Comprehension',
                    'AI Lesson & Presentation Generation',
                    'Self-Directed Student Study',
                  ],
                  audience: {
                    '@type': 'EducationalAudience',
                    educationalRole: ['teacher', 'student'],
                  },
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                },
              ],
            }),
          }}
        />

        {/* Google AdSense */}
        {isLiveAdSense && (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        <PlexusBackground />
        <div id="root" suppressHydrationWarning className="relative z-10">
          <FirebaseClientProvider>
              <AuthProviderWrapper>
                  <SeasonalThemeProvider>
                      <SeasonalEffectsLayer />
                      {children}
                  </SeasonalThemeProvider>
              </AuthProviderWrapper>
          </FirebaseClientProvider>
        </div>
      </body>
    </html>
  );
}
