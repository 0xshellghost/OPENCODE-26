

import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import AppWrappers from './AppWrappers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://opencode.iiita.ac.in'),
  title: { default: 'OpenCode 2026 - Learn. Contribute. Belong.', template: '%s | OpenCode 2026' },
  description: 'Discover OpenCode 2026 by GeekHaven. Explore open-source events, meet fellow contributors, follow the leaderboards, and build something that matters.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'OpenCode 2026 - Guided by Yuzuki',
    description: 'A month-long open-source celebration where students collaborate with maintainers to build, fix, and improve real-world projects.',
    url: 'https://opencode.iiita.ac.in',
    siteName: 'OpenCode 2026',
    images: [
      {
        url: '/Logo/opencode-logo.png',
        width: 925,
        height: 964,
        alt: "OpenCode '26 Logo",
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
    images: ['/Logo/opencode-logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07131F',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning><AppWrappers>{children}</AppWrappers></body>
    </html>
  );
}
