'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Flower2, Menu, Pause, Play, RotateCcw, X } from 'lucide-react'
import IndiaMap from './IndiaMap'
import YuzukiPresence from '../landing/YuzukiPresence'
import { useSakura } from 'contexts/SakuraContext'
import { chapters, defaultAssets, defaultNavigation, selfHostedAssets, type OpenCodeExperienceProps, type SceneParameters } from './experience-config'
import styles from './opencode-experience.module.css'

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start))
const chapterStarts = [0, 0.23, 0.56, 0.73, 0.93]
type SceneController = { invalidate: () => void; dispose: () => void }

export default function OpenCodeExperience({
  id, title = 'OPENCODE', year = 2026, eyebrow = 'Where tradition meets creation',
  description = 'A new season of ideas, collaboration, and open-source possibilities.',
  assets, navigation = defaultNavigation, ctaLabel = 'Discover OpenCode', ctaHref = '#about',
  skipTargetId, className = '', quality = 'auto', onComplete,
}: OpenCodeExperienceProps) {
  const instanceId = useId()
  const rootId = id || `opencode-${instanceId}`
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const canvasHost = useRef<HTMLDivElement>(null)
  const heroArt = useRef<HTMLDivElement>(null)
  const passageArt = useRef<HTMLDivElement>(null)
  const mist = useRef<HTMLDivElement>(null)
  const night = useRef<HTMLDivElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const passageCopy = useRef<HTMLDivElement>(null)
  const finale = useRef<HTMLDivElement>(null)
  const map = useRef<HTMLDivElement>(null)
  const progressLine = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const scene = useRef<SceneController | null>(null)
  const parameters = useRef<SceneParameters>({ progress: 0, paused: false, pointerX: 0, pointerY: 0 })
  const completed = useRef(false)
  const completionCallback = useRef(onComplete)
  const [chapter, setChapter] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [ready, setReady] = useState(false)
  const [graphicsUnavailable, setGraphicsUnavailable] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [pointerState, setPointerState] = useState({ x: 0, y: 0 })
  completionCallback.current = onComplete

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setReduced(query.matches); setReady(true) }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (finale.current) finale.current.inert = !reduced && chapter < 4
  }, [reduced, chapter])

  const { enabled: sakuraEnabled } = useSakura()

  useEffect(() => {
    parameters.current.paused = paused || reduced || !sakuraEnabled
    scene.current?.invalidate()
  }, [paused, reduced, sakuraEnabled])

  useEffect(() => {
    if (!ready || reduced || !canvasHost.current || !sakuraEnabled) {
      if (scene.current) {
        scene.current.dispose()
        scene.current = null
      }
      return
    }
    let cancelled = false
    let controller: SceneController | null = null
    const host = canvasHost.current
    import('./OpenCodeScene').then(({ createPetalScene }) => {
      if (cancelled) return
      try {
        controller = createPetalScene(host, parameters.current, quality, () => setGraphicsUnavailable(true))
        scene.current = controller
      } catch {
        host.replaceChildren()
        setGraphicsUnavailable(true)
      }
    }).catch(() => { if (!cancelled) setGraphicsUnavailable(true) })
    return () => { cancelled = true; controller?.dispose(); scene.current = null }
  }, [ready, reduced, quality, sakuraEnabled])

  useEffect(() => {
    if (!ready || !root.current) return
    if (reduced) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !completed.current) { completed.current = true; completionCallback.current?.() }
      }, { threshold: 0.5 })
      if (finale.current) observer.observe(finale.current)
      return () => observer.disconnect()
    }
    let cancelled = false
    let revert: (() => void) | undefined
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current) return
      gsap.registerPlugin(ScrollTrigger)
      const context = gsap.context(() => {
        const clock = { progress: 0 }
        const palette = getComputedStyle(root.current!)
        const paper = palette.getPropertyValue('--oc-paper').trim()
        const ink = palette.getPropertyValue('--oc-ink').trim()
        let currentChapter = -1
        const draw = () => {
          const p = clock.progress
          parameters.current.progress = p
          const nextChapter = p < 0.18 ? 0 : p < 0.38 ? 1 : p < 0.63 ? 2 : p < 0.83 ? 3 : 4
          if (nextChapter !== currentChapter) { currentChapter = nextChapter; setChapter(nextChapter) }
          const fog = range(p, 0.31, 0.43) * (1 - range(p, 0.49, 0.63))
          gsap.set(stage.current, { '--oc-interface': gsap.utils.interpolate(paper, ink, clamp(fog * 1.5)) })
          gsap.set(heroArt.current, { scale: 1.025 + p * 0.6, xPercent: -p * 7, opacity: p < 0.46 ? 1 : 0 })
          gsap.set(passageArt.current, { scale: 1.08 + range(p, 0.46, 0.8) * 0.22, opacity: p >= 0.46 ? 1 : 0 })
          gsap.set(mist.current, { opacity: fog })
          gsap.set(night.current, { opacity: range(p, 0.6, 0.85) * 0.98 })
          gsap.set(intro.current, { opacity: 1 - range(p, 0.13, 0.28), y: -range(p, 0.13, 0.3) * 70 })
          gsap.set(passageCopy.current, { opacity: range(p, 0.46, 0.53) * (1 - range(p, 0.6, 0.68)), y: (1 - range(p, 0.46, 0.57)) * 24 })
          gsap.set(finale.current, { opacity: range(p, 0.72, 0.87), y: (1 - range(p, 0.72, 0.87)) * 36 })
          gsap.set(map.current, { rotateX: (1 - range(p, 0.67, 0.92)) * 52, rotateZ: (1 - range(p, 0.67, 0.92)) * -14, scale: 0.8 + range(p, 0.67, 0.92) * 0.2 })
          gsap.set(progressLine.current, { scaleY: p })
          setScrollProgress(p)
          if (p >= 0.9 && !completed.current) { completed.current = true; completionCallback.current?.() }
          scene.current?.invalidate()
        }
        gsap.to(clock, {
          progress: 1, ease: 'none', onUpdate: draw,
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.65, invalidateOnRefresh: true },
        })
        draw()
      }, root)
      revert = () => context.revert()
    }).catch(() => { if (!cancelled) setReduced(true) })
    return () => { cancelled = true; revert?.() }
  }, [ready, reduced])

  const scrollToChapter = (value: number, focusStart = false) => {
    const section = root.current
    if (!section) return
    if (reduced && value > 0) {
      setMenuOpen(false)
      finale.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
      return
    }
    const top = section.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + (section.offsetHeight - (stage.current?.offsetHeight || window.innerHeight)) * value, behavior: reduced ? 'auto' : 'smooth' })
    if (focusStart) titleRef.current?.focus({ preventScroll: true })
    setMenuOpen(false)
  }
  const skip = () => {
    const target = document.getElementById(skipTargetId) || root.current?.nextElementSibling
    if (!(target instanceof HTMLElement)) return
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    setMenuOpen(false)
  }
  const handleImageFailure = (element: HTMLImageElement, fallback: string) => {
    if (!element.dataset.fallback) { element.dataset.fallback = 'true'; element.src = fallback }
    else element.style.visibility = 'hidden'
  }

  return (
    <section ref={root} id={rootId} className={`${styles.experience} ${className}`} data-reduced={reduced} data-paused={paused || reduced} aria-label="OpenCode cinematic experience">
      <div ref={stage} className={styles.stage} onPointerMove={(event) => {
        if (paused || reduced || !matchMedia('(pointer: fine)').matches) return
        const bounds = event.currentTarget.getBoundingClientRect()
        const px = (event.clientX - bounds.left) / bounds.width * 2 - 1
        const py = (event.clientY - bounds.top) / bounds.height * 2 - 1
        parameters.current.pointerX = px
        parameters.current.pointerY = py
        setPointerState({ x: px, y: py })
      }} onPointerLeave={() => { parameters.current.pointerX = 0; parameters.current.pointerY = 0; setPointerState({ x: 0, y: 0 }) }}>
        <div className={styles.scenery} aria-hidden="true">
          <div ref={heroArt} className={styles.heroArt}>
            {/* Plain images keep this component independent of the host framework and image configuration. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assets?.hero || defaultAssets.hero} alt="" width="1568" height="875" fetchPriority="high" onError={(e) => handleImageFailure(e.currentTarget, selfHostedAssets.hero)} />
          </div>
          <div ref={passageArt} className={styles.passageArt}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assets?.passage || defaultAssets.passage} alt="" width="1568" height="875" loading="lazy" decoding="async" onError={(e) => handleImageFailure(e.currentTarget, selfHostedAssets.passage)} />
          </div>
          <div className={styles.readability} />
          <div ref={mist} className={styles.mist} />
          <div ref={night} className={styles.night} />
        </div>
        <div ref={canvasHost} className={styles.canvas} aria-hidden="true" />

        {/* Yuzuki — Queen of Sakura character presence */}
        <YuzukiPresence
          chapter={chapter}
          pointerX={pointerState.x}
          pointerY={pointerState.y}
          progress={scrollProgress}
          reducedMotion={reduced}
        />

        <header className={styles.header}>
          <a className={styles.wordmark} href={`#${rootId}`} aria-label="OpenCode, back to the beginning" onClick={(e) => { e.preventDefault(); scrollToChapter(0, true) }}>
            <Flower2 size={23} strokeWidth={1.6} aria-hidden="true" /><span>OPENCODE</span>
          </a>
          <nav className={styles.desktopNav} aria-label="Main navigation">
            {navigation.map((item) => <a key={`${item.label}-${item.href}`} href={item.href}>{item.label}</a>)}
          </nav>
          <button className={styles.enterButton} onClick={() => scrollToChapter(0.56)}>Enter experience <ArrowRight size={17} aria-hidden="true" /></button>
          <button className={styles.menuButton} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls={`${instanceId}-menu`} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          {menuOpen && <nav id={`${instanceId}-menu`} className={styles.mobileNav} aria-label="Mobile navigation" onKeyDown={(e) => { if (e.key === 'Escape') { setMenuOpen(false); stage.current?.querySelector<HTMLButtonElement>(`[aria-controls="${instanceId}-menu"]`)?.focus() } }}>
            {navigation.map((item) => <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowRight size={17} /></a>)}
            <button onClick={() => scrollToChapter(0.56)}>Enter experience <ArrowRight size={17} /></button>
          </nav>}
        </header>

        <div ref={intro} className={styles.intro} aria-hidden={!reduced && chapter > 1}>
          <div className={styles.japanese} aria-hidden="true"><span>桜と創造</span><span className={styles.seal}>創</span></div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 ref={titleRef} tabIndex={-1} className={styles.title}>{title}<span>{year}</span></h1>
            <p className={styles.mantra}>Ideate <span>/</span> Build <span>/</span> Create</p>
            <p className={styles.heroDescription}>{description}</p>
          </div>
        </div>

        <div ref={passageCopy} className={styles.passageCopy} aria-hidden={chapter !== 2}>
          <p className={styles.eyebrow}>Beyond the familiar</p>
          <h2>Follow your curiosity.</h2>
          <p>Every great idea begins with a journey.</p>
        </div>

        <div ref={finale} className={styles.finale} aria-hidden={!reduced && chapter < 4}>
          <div ref={map} className={styles.map}><IndiaMap /></div>
          <div className={styles.finaleCopy}>
            <p className={styles.eyebrow}>Open source. Open possibilities.</p>
            <h2>Created together.<br /><span>Without boundaries.</span></h2>
            <p>From a spark of curiosity to a community of creators. Wherever you are, your next chapter starts here.</p>
            <a className={styles.finalCta} href={ctaHref} tabIndex={!reduced && chapter < 4 ? -1 : undefined}>{ctaLabel}<ArrowRight size={18} aria-hidden="true" /></a>
            <button className={styles.replay} tabIndex={!reduced && chapter < 4 ? -1 : undefined} onClick={() => scrollToChapter(0, true)}><RotateCcw size={15} aria-hidden="true" /> Replay the journey</button>
            <p style={{ marginTop: '18px', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, opacity: 0.5, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <Flower2 size={13} strokeWidth={1.4} style={{ color: '#e9a7b2' }} aria-hidden="true" />
              Guided by Yuzuki
            </p>
          </div>
        </div>

        <nav className={styles.chapters} aria-label="Experience chapters">
          <span className={styles.chapterLabel}>{chapters[chapter]}</span>
          <div className={styles.chapterTrack}><span ref={progressLine} /></div>
          {chapters.map((name, index) => <button key={name} className={chapter === index ? styles.activeChapter : ''} aria-label={`Chapter ${index + 1}: ${name}`} aria-current={chapter === index ? 'step' : undefined} onClick={() => scrollToChapter(chapterStarts[index])}>{String(index + 1).padStart(2, '0')}</button>)}
        </nav>

        <div className={styles.bottomBar}>
          <button className={styles.scrollCue} onClick={() => chapter === 4 ? skip() : scrollToChapter(chapterStarts[Math.min(chapter + 1, 4)])}>
            <span className={styles.scrollCircle}><ArrowDown size={17} strokeWidth={1.2} aria-hidden="true" /></span>
            <span>{chapter === 4 ? 'Discover OpenCode' : 'Scroll to explore'}</span>
          </button>
          <p className={styles.journeyCaption}>A new season of creation</p>
          <div className={styles.motionControls}>
            {!reduced && !graphicsUnavailable && <button className={styles.motionButton} aria-pressed={paused} aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'} title="Pauses ambient petals. Scroll still changes chapters." onClick={() => setPaused(!paused)}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}<span>Motion {paused ? 'off' : 'on'}</span></button>}
            <button className={styles.skipButton} onClick={skip}>Skip intro <ArrowRight size={14} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
