'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

type JapaneseBackgroundVariant = 'events' | 'leaderboard' | 'faq' | 'auth' | 'home' | 'winners' | 'milestones' | 'profile';

export default function JapaneseBackground({ variant, children }: { variant: JapaneseBackgroundVariant; children: ReactNode }) {
  const image = ['faq', 'profile', 'milestones'].includes(variant) ? 'kyoto-garden' : variant === 'auth' ? 'kyoto-torii' : 'kyoto-evening';
  return (
    <div className={`japanese-page oc-scene-${variant}`}>
      <div className="oc-scenery" aria-hidden="true">
        <Image src={`/images/${image}.png`} alt="" fill priority sizes="100vw" quality={85} />
        <div className="oc-scene-overlay" />
      </div>
      <div className="oc-scene-content">{children}</div>
    </div>
  );
}
