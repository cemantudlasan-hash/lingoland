
import type {Metadata} from 'next';
import './globals.css';
import { AuthProviderWrapper } from '@/context/auth-provider-wrapper';
import { PT_Sans, Roboto, Lato, Montserrat } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase';
import PlexusBackground from '@/components/layout/PlexusBackground';
import Script from 'next/script';

const ptSans = PT_Sans({ 
    subsets: ['latin'], 
    variable: '--font-pt-sans',
    weight: ['400', '700']
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['400', '700'],
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['400', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '700'],
});

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
    <html lang="en" suppressHydrationWarning className={`${ptSans.variable} ${roboto.variable} ${lato.variable} ${montserrat.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Silence third-party browser extension hydration warnings (e.g. Bitdefender bis_skin_checked)
              (function() {
                if (typeof window !== 'undefined') {
                  const origError = console.error;
                  console.error = function(...args) {
                    const msg = typeof args[0] === 'string' ? args[0] : '';
                    if (msg.includes('bis_skin_checked') || (args[1] && typeof args[1] === 'string' && args[1].includes('bis_skin_checked'))) {
                      return;
                    }
                    origError.apply(console, args);
                  };
                  // Also strip any pre-injected bis_skin_checked attributes
                  const clean = () => {
                    try {
                      document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                    } catch(e) {}
                  };
                  clean();
                  window.addEventListener('DOMContentLoaded', clean, { once: true });
                }
              })();
            `,
          }}
        />
        {/* Structured Data for Google Search & AdSense Publisher Verification */}
        <script
          type="application/ld+json"
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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9029482278295441"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
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
