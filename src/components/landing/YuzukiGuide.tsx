'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Flower2 } from 'lucide-react';
import { YUZUKI_CHARACTER } from '../../content/yuzuki-story';
import styles from './yuzuki-guide.module.css';

// Lazy-load the story panel code so it does not block initial hero paint or animations
const YuzukiStoryPanel = dynamic(() => import('./YuzukiStoryPanel'), {
  ssr: false,
});

export interface YuzukiGuideProps {
  chapter?: number;
  pointerX?: number;
  pointerY?: number;
  progress?: number;
  reducedMotion?: boolean;
  /** Callback fired whenever the story panel opens or closes */
  onOpenChange?: (open: boolean) => void;
}

export default function YuzukiGuide({
  chapter = 0,
  pointerX = 0,
  pointerY = 0,
  progress = 0,
  reducedMotion = false,
  onOpenChange,
}: YuzukiGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Visible on chapter 0 & 1, subtly fades out as user advances deep into journey
  const isVisible = chapter <= 1 && progress < 0.42;

  const openStory = useCallback((e?: React.SyntheticEvent | Event) => {
    if (e && 'currentTarget' in e) {
      lastActiveElementRef.current = (e.currentTarget as HTMLElement) || (document.activeElement as HTMLElement | null);
    } else {
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    }
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const closeStory = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
    // Return focus to the trigger element that opened it
    setTimeout(() => {
      lastActiveElementRef.current?.focus();
    }, 40);
  }, [onOpenChange]);

  // Global triggers: custom event & anchor links (#meet-yuzuki, [data-open-yuzuki="true"])
  useEffect(() => {
    const handleGlobalTrigger = () => openStory();
    window.addEventListener('opencode:open-yuzuki', handleGlobalTrigger);

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const trigger = target.closest<HTMLElement>('a[href="#meet-yuzuki"], [data-open-yuzuki="true"]');
      if (trigger) {
        e.preventDefault();
        openStory(e);
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      window.removeEventListener('opencode:open-yuzuki', handleGlobalTrigger);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [openStory]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={styles.root}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* ─── a) Name banner (far right top) ─── */}
      <button
        type="button"
        className={styles.banner}
        onClick={openStory}
        aria-label="Meet Yuzuki, your guide"
        style={{
          opacity: isOpen ? 0.3 : 1,
        }}
      >
        {/* Solid, elegant hiragana: ゆづき */}
        <div className={styles.bannerChars} aria-hidden="true">
          <span>ゆ</span>
          <span>づ</span>
          <span>き</span>
        </div>

        {/* Pink Hanko Seal: 桜守 (cherry blossom keeper) */}
        <div className={styles.hankoSeal} aria-hidden="true">
          <div className={styles.hankoText}>
            <span>桜</span>
            <span>守</span>
          </div>
        </div>

        {/* Small widely-spaced uppercase name */}
        <span className={styles.bannerEn}>{YUZUKI_CHARACTER.name}</span>
      </button>

      {/* ─── b) Petal hotspot (beside her shoulder, never on face/body) ─── */}
      <button
        type="button"
        className={styles.hotspot}
        onClick={openStory}
        aria-label="Meet Yuzuki, your guide"
        style={{
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? 'none' : 'auto',
        }}
      >
        <span className={styles.hotspotDotWrap}>
          <span className={styles.hotspotPing} aria-hidden="true" />
          <span className={styles.hotspotDot} aria-hidden="true">
            <Flower2 size={11} strokeWidth={2} />
          </span>
        </span>
        <span className={styles.hotspotPill}>
          <span>Meet {YUZUKI_CHARACTER.name}</span>
          <span className={styles.hotspotArrow} aria-hidden="true">→</span>
        </span>
      </button>

      {/* ─── Artwork Click Area (tapping her artwork layer triggers story) ─── */}
      <button
        type="button"
        className={styles.artworkTrigger}
        onClick={openStory}
        aria-label="Meet Yuzuki, your guide"
        title="Meet Yuzuki, your guide"
        tabIndex={-1}
        style={{ display: isOpen ? 'none' : 'block' }}
      />

      {/* ─── Section 3: The Story Interaction (Paper Scroll Panel) ─── */}
      {isOpen && (
        <YuzukiStoryPanel
          isOpen={isOpen}
          onClose={closeStory}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}
