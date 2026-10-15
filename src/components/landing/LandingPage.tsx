'use client';

import OpenCodeExperience from '../opencode/OpenCodeExperience';
import LandingContent from './LandingContent';
import ThemeToggle from 'components/japanese/ThemeToggle';
import SakuraToggle from 'components/common/SakuraToggle';

const GITHUB_LOGIN_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/github`;

const navigation = [
  { label: 'Leaderboard', href: '/user/leaderboard' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Sign In with GitHub', href: GITHUB_LOGIN_URL },
];

export default function LandingPage() {
  const yuzukiJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'OpenCode 2026',
    description: 'A season of ideas, collaboration, and open-source possibilities — guided by Yuzuki.',
    organizer: { '@type': 'Organization', name: 'GeekHaven, IIIT Allahabad' },
    character: {
      '@type': 'Thing',
      name: 'Yuzuki',
      alternateName: 'ゆづき',
      description: 'An original character created for Opencode 2026, inspired by Japanese cherry blossom folklore.',
      additionalProperty: { '@type': 'PropertyValue', name: 'role', value: 'Guide of the season' },
    },
  };

  return (
    <>
      {/* Yuzuki character SEO metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(yuzukiJsonLd) }}
      />
      <OpenCodeExperience
        id="opencode"
        ctaLabel="Explore the leaderboard"
        ctaHref="/user/leaderboard"
        skipTargetId="opencode-content"
        quality="auto"
        navigation={navigation}
      />

      <div className="oc-landing-theme flex items-center gap-2">
        <SakuraToggle />
        <ThemeToggle />
      </div>

      {/* Content section below the cinematic hero */}
      <LandingContent />
    </>
  );
}
