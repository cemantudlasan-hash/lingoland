
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
  title: 'LingoLandVerse',
  description: 'Learn ESL with interactive games and exercises.',
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
        {isLiveAdSense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body suppressHydrationWarning>
        <PlexusBackground />
        <div id="root">
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
