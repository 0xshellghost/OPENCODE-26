'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, Copy, Flower2 } from 'lucide-react'
import styles from './preview-overview.module.css'

const integrationCode = `import OpenCodeExperience from '@/components/opencode/OpenCodeExperience'

export default function LandingPage() {
  return (
    <>
      <OpenCodeExperience
        ctaLabel="Explore the leaderboard"
        ctaHref="/user/leaderboard"
        skipTargetId="opencode-overview"
        quality="auto"
      />
      <section id="opencode-overview" tabIndex={-1}>
        {/* Preserve your existing landing content here. */}
      </section>
    </>
  )
}`

export default function PreviewOverview() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const copy = async () => {
    try { await navigator.clipboard.writeText(integrationCode); setCopyState('copied') }
    catch { setCopyState('error') }
  }
  return (
    <section id="about" tabIndex={-1} className={styles.overview} aria-labelledby="overview-title">
      <div className={styles.overviewTop}>
        <p className={styles.eyebrow}>The next chapter is yours</p>
        <div className={styles.overviewHeading}>
          <h2 id="overview-title">Small beginnings.<br /><span>Extraordinary possibilities.</span></h2>
          <p>OpenCode is a celebration of learning by doing. Bring your curiosity, share what you know, and create something that goes beyond you.</p>
        </div>
      </div>
      <div className={styles.features}>
        <section id="events">
          <p className={styles.eyebrow}>Events</p>
          <h3>Find your people.</h3>
          <p>A place to exchange ideas, meet fellow builders, and discover new ways of thinking.</p>
          <a href="#schedule">Explore what comes next <ArrowUpRight size={16} aria-hidden="true" /></a>
        </section>
        <section id="challenges">
          <p className={styles.eyebrow}>Challenges</p>
          <h3>Build beyond the expected.</h3>
          <p>Turn a question into a contribution. Learn in the open and make progress, one idea at a time.</p>
          <a href="#integration">Explore this experience <ArrowUpRight size={16} aria-hidden="true" /></a>
        </section>
        <section id="sponsors">
          <p className={styles.eyebrow}>Community & partners</p>
          <h3>Grow something together.</h3>
          <p>Great communities are built on shared possibility. Official partners will be announced by the OpenCode organizers.</p>
        </section>
      </div>
      <section id="schedule" className={styles.schedule}>
        <div><p className={styles.eyebrow}>Stay curious</p><h3>A new season is taking shape.</h3></div>
        <p>The official event schedule and challenge details will be published by the organizers. This preview introduces the experience, not a live event calendar.</p>
      </section>
      <details id="integration" className={styles.integration}>
        <summary><span>Bring this experience to your site</span><span>Integration guide <ArrowUpRight size={17} aria-hidden="true" /></span></summary>
        <div className={styles.integrationBody}>
          <p>This is a standalone preview. Copy <code>components/opencode</code> and <code>public/images/opencode</code> into your Next.js project via GitHub or the project&apos;s shadcn CLI installation option. The isolated CSS Module inherits your site&apos;s font.</p>
          <p>Runtime dependencies: <code>three</code>, <code>gsap</code>, <code>d3-geo</code>, and <code>lucide-react</code>. TypeScript also needs <code>@types/three</code> and <code>@types/d3-geo</code>. Reuse compatible packages already installed in your host.</p>
          <div className={styles.codeHeader}><span>LandingPage.tsx</span><button onClick={copy}>{copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}{copyState === 'copied' ? 'Copied' : 'Copy example'}</button></div>
          <pre><code>{integrationCode}</code></pre>
          <p role="status">{copyState === 'error' ? 'Clipboard unavailable. Select and copy the example above.' : copyState === 'copied' ? 'Integration example copied to clipboard.' : ''}</p>
          <p>Replace only the existing hero and unmount PixelBlast there. Preserve your providers, authentication, following content, and leaderboard. Pass your existing destinations through <code>navigation</code>. The CTA above targets your real leaderboard route; this preview uses the overview instead.</p>
          <p>Source URLs are the default. For self-hosting, pass <code>{'assets={selfHostedAssets}'}</code> from <code>experience-config.ts</code>. The supplied Yuzuki cutout is intentionally not overlaid: the scenery already includes her.</p>
          <p>Map: public-domain <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth</a> 1:50m data via world-atlas, projected with d3-geo. Dataset islands are retained. Generalized de facto boundaries are illustrative, not an authoritative political map; confirm the required boundary convention before production use. No markers represent participant locations.</p>
        </div>
      </details>
      <footer className={styles.footer}><a href="#opencode"><Flower2 size={21} aria-hidden="true" />GEEKHAVEN <span>2026</span></a><p>Ideate. Build. Create.</p><a href="#opencode">Back to the beginning <ArrowUpRight size={16} aria-hidden="true" /></a></footer>
    </section>
  )
}
