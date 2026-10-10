'use client';

import { useEffect, useRef, useState } from 'react';
import { Flower2 } from 'lucide-react';
import styles from './yuzuki-presence.module.css';

export interface YuzukiPresenceProps {
  /** Current scroll chapter index (0–4). Controls visibility/opacity. */
  chapter?: number;
  /** Mouse pointer X in normalised range [-1, 1]. Drives subtle parallax. */
  pointerX?: number;
  /** Mouse pointer Y in normalised range [-1, 1]. Drives subtle parallax. */
  pointerY?: number;
  /** Overall scroll progress 0→1. Used for fade-out timing. */
  progress?: number;
  /** Whether the user prefers reduced motion. */
  reducedMotion?: boolean;
}

/**
 * **Yuzuki — Queen of Sakura**
 *
 * A floating character nameplate that overlays the cinematic hero,
 * introducing Yuzuki (ゆづき) as the narrative mascot of OpenCode.
 *
 * - Chapter 0–1: Full presence with nameplate + lore
 * - Chapter 2: Fades to just the sakura crest glow
 * - Chapter 3–4: Hidden (returns as an attribution in the finale, handled separately)
 */
export default function YuzukiPresence({
  chapter = 0,
  pointerX = 0,
  pointerY = 0,
  progress = 0,
  reducedMotion = false,
}: YuzukiPresenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay mount animation slightly so the loader exit finishes first
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Apply subtle mouse parallax (only for fine pointers / non-reduced-motion)
  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;
    const el = containerRef.current;
    const x = pointerX * 6; // max ±6px shift
    const y = pointerY * 4; // max ±4px shift
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, [pointerX, pointerY, reducedMotion]);

  // Derive visibility from chapter / progress
  // Ch 0-1 → full opacity, Ch 2 → fade to crest only, Ch 3+ → hidden
  const isVisible = chapter <= 2 && progress < 0.6;
  const isCrestOnly = chapter === 2 || progress > 0.38;

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className={styles.presence}
      style={{
        opacity: isVisible ? (isCrestOnly ? 0.5 : 1) : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.8s ease, transform 0.15s ease-out',
      }}
      aria-hidden={!isVisible}
    >
      {/* Main nameplate card */}
      <div className={styles.nameplate}>
        {/* Sakura crest icon */}
        <div className={styles.crest}>
          <Flower2 size={24} strokeWidth={1.4} />
        </div>

        {/* Identity text block */}
        {!isCrestOnly && (
          <div className={styles.identity}>
            <span className={styles.nameJp}>ゆづき</span>
            <span className={styles.nameEn}>YUZUKI</span>
            <div className={styles.title}>
              <span className={styles.titleLine} />
              <span className={styles.titleText}>Queen of Sakura</span>
            </div>
          </div>
        )}

        {/* Vertical Japanese accent (right edge) */}
        {!isCrestOnly && (
          <span className={styles.verticalAccent} aria-hidden="true">
            桜の女王
          </span>
        )}
      </div>

      {/* Lore line below the card */}
      {!isCrestOnly && (
        <p className={styles.lore}>
          Guardian of the cherry blossoms, she watches over every creator's first step.
        </p>
      )}
    </div>
  );
}
