'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, FastForward, RotateCcw, X } from 'lucide-react';
import { YUZUKI_CHARACTER, YUZUKI_STORY_LINES } from '../../content/yuzuki-story';
import styles from './yuzuki-guide.module.css';

export interface YuzukiStoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reducedMotion?: boolean;
}

export default function YuzukiStoryPanel({
  isOpen,
  onClose,
  reducedMotion = false,
}: YuzukiStoryPanelProps) {
  const [visibleCount, setVisibleCount] = useState<number>(reducedMotion ? YUZUKI_STORY_LINES.length : 1);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Line-by-line sequential reveal based on line length
  useEffect(() => {
    if (!isOpen) return;

    if (reducedMotion) {
      setVisibleCount(YUZUKI_STORY_LINES.length);
      return;
    }

    if (visibleCount >= YUZUKI_STORY_LINES.length) {
      return;
    }

    const prevLine = YUZUKI_STORY_LINES[visibleCount - 1];
    // Delay = 700ms + 26ms per character
    const delay = 700 + prevLine.length * 26;

    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 1, YUZUKI_STORY_LINES.length));
    }, delay);

    return () => clearTimeout(timer);
  }, [isOpen, visibleCount, reducedMotion]);

  // Focus trap & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;

        const focusables = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isComplete = visibleCount >= YUZUKI_STORY_LINES.length;

  const handleSkip = () => {
    setVisibleCount(YUZUKI_STORY_LINES.length);
  };

  const handleReplay = () => {
    setVisibleCount(1);
  };

  return (
    <>
      {/* Blurred & dimmed backdrop */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Story dialog panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="yuzuki-dialog-title"
        className={styles.scrollPanel}
      >
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerHanko} aria-hidden="true">
              <span>桜</span>
              <span>守</span>
            </div>
            <div>
              <h2 id="yuzuki-dialog-title" className={styles.headerName}>
                {YUZUKI_CHARACTER.name}
              </h2>
              <p className={styles.headerSubtitle}>{YUZUKI_CHARACTER.subtitle}</p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close story"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Story Content */}
        <div className={styles.panelBody}>
          {YUZUKI_STORY_LINES.slice(0, visibleCount).map((line, index) => {
            const isFirst = index === 0;
            const isCurrent = index === visibleCount - 1 && !isComplete;

            return (
              <p
                key={index}
                className={`${styles.storyLine} ${isFirst ? styles.firstStoryLine : ''}`}
              >
                {line}
                {isCurrent && (
                  <span className={styles.blinkingDot} aria-hidden="true" />
                )}
              </p>
            );
          })}

          {/* Ending Actions (after last line appears) */}
          {isComplete && (
            <div className={styles.endingSection}>
              <a href={YUZUKI_CHARACTER.ctaHref} className={styles.contributeButton}>
                <span>{YUZUKI_CHARACTER.ctaText}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <p className={styles.endingNote}>{YUZUKI_CHARACTER.endingNote}</p>
            </div>
          )}
        </div>

        {/* Footer Controls: Skip or Replay */}
        <div className={styles.panelFooter}>
          {!isComplete ? (
            <button
              type="button"
              className={styles.controlButton}
              onClick={handleSkip}
            >
              <span>Skip</span>
              <FastForward size={14} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className={styles.controlButton}
              onClick={handleReplay}
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Replay story</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
