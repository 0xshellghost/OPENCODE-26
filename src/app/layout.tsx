import { Poppins, Cinzel, Noto_Serif_JP } from 'next/font/google';
import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import AppWrappers from './AppWrappers';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const cinzel = Cinzel({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
});

const notoSerifJp = Noto_Serif_JP({
  weight: ['300', '400', '500', '600', '700', '900'],
  subsets: ['latin'], // Next.js supports subsetting this for latin, kanji/kana need specific configuration but default subset handles the basics well for Next.js 13+
  display: 'swap',
  variable: '--font-noto-serif-jp',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://opencode.iiita.ac.in'),
  title: { default: 'OpenCode 2026 — Learn. Contribute. Belong.', template: '%s | OpenCode 2026' },
  description: 'Discover OpenCode 2026 by GeekHaven. Explore open-source events, meet fellow contributors, follow the leaderboards, and build something that matters.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'OpenCode 2026 — Guided by Yuzuki',
    description: 'A month-long open-source celebration where students collaborate with maintainers to build, fix, and improve real-world projects.',
    url: 'https://opencode.iiita.ac.in',
    siteName: 'OpenCode 2026',
    images: [
      {
        url: '/Logo/OpenCode-White.png', // Fallback until a dedicated OG banner is designed
        width: 1200,
        height: 630,
        alt: 'OpenCode 2026 Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenCode 2026',
    description: 'A month-long open-source celebration where students collaborate with maintainers to build, fix, and improve real-world projects.',
    creator: '@GeekHaven',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#15151e' }, { media: '(prefers-color-scheme: light)', color: '#eee6e7' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${cinzel.variable} ${notoSerifJp.variable}`} suppressHydrationWarning>
      <body id="root"><AppWrappers>{children}</AppWrappers></body>
    </html>
  );
}
