'use client';

import OpenCodeExperience from '../opencode/OpenCodeExperience';
import LandingContent from './LandingContent';

const navigation = [
  { label: 'Leaderboard', href: '/user/leaderboard/Opencode' },
  { label: 'FAQ', href: '/faq' },
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
        ctaHref="/user/leaderboard/Opencode"
        skipTargetId="opencode-content"
        quality="auto"
        navigation={navigation}
      />

      {/* Content section below the cinematic hero */}
      <LandingContent />
    </>
  );
}
