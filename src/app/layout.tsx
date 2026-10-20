

import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import AppWrappers from './AppWrappers';

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
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#07131F' }, { media: '(prefers-color-scheme: light)', color: '#F0F4F3' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Shippori+Mincho:wght@500;600&display=swap"
        />
      </head>
      <body id="root"><AppWrappers>{children}</AppWrappers></body>
    </html>
  );
}
