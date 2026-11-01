import type {Metadata} from 'next';
import './globals.css';
import { AuthProviderWrapper } from '@/context/auth-provider-wrapper';
import { FirebaseClientProvider } from '@/firebase';
import PlexusBackground from '@/components/layout/PlexusBackground';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'LingoLandVerse | Interactive ESL Learning Universe & Classroom Suite',
  description:
    'Master English and 9 world languages with 79+ CEFR-aligned interactive ESL games, SuperMemo-2 spaced repetition, graded reading comprehension, and AI classroom tools created by Ceman Tudlasan.',
  publisher: 'LingoLandVerse',
  authors: [{ name: 'Ceman Tudlasan' }],
  keywords: [
    'ESL learning',
    'English grammar games',
    'spaced repetition vocabulary',
    'SuperMemo-2 ESL',
    'CEFR English lessons',
    'interactive classroom tools',
    'LingoLandVerse',
  ],
  openGraph: {
    type: 'website',
    title: 'LingoLandVerse | Interactive ESL Learning Universe & Classroom Suite',
    description:
      'Master English and 9 world languages with 79+ CEFR-aligned interactive ESL games, SuperMemo-2 spaced repetition, and graded reading comprehension.',
    siteName: 'LingoLandVerse',
    url: 'https://www.lingolandverse.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LingoLandVerse | Interactive ESL Learning Universe & Classroom Suite',
    description:
      'Master English and 9 world languages with 79+ CEFR-aligned interactive ESL games, SuperMemo-2 spaced repetition, and graded reading comprehension.',
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
                  {children}
              </AuthProviderWrapper>
          </FirebaseClientProvider>
        </div>
      </body>
    </html>
  );
}
