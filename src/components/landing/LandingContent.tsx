'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaCode, FaUsers, FaTrophy, FaArrowRight } from 'react-icons/fa';
import styles from './landing-content.module.css';

export default function LandingContent() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll(`.${styles.fadeInUp}`);
      elements.forEach((el) => observer.observe(el));

      const cards = contentRef.current.querySelectorAll(`.${styles.featureCard}`);
      const handlePointerMove = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        target.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 10).toFixed(1)}deg) rotateY(${((x - 0.5) * 12).toFixed(1)}deg) translateY(-4px)`;
        target.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        target.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      };
      const handlePointerLeave = (e: PointerEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.style.transform = '';
      };
      cards.forEach((card) => {
        card.addEventListener('pointermove', handlePointerMove as EventListener);
        card.addEventListener('pointerleave', handlePointerLeave as EventListener);
      });

      return () => {
        observer.disconnect();
        cards.forEach((card) => {
          card.removeEventListener('pointermove', handlePointerMove as EventListener);
          card.removeEventListener('pointerleave', handlePointerLeave as EventListener);
        });
      };
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div id="opencode-content" tabIndex={-1} ref={contentRef} style={{ background: 'var(--bg)', position: 'relative', zIndex: 10, outline: 'none' }}>
      {/* 1. STATS BAR */}
      <div className={`${styles.statsBar} ${styles.fadeInUp}`}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>1.2k+</div>
          <div className={styles.statLabel}>Participants</div>
        </div>
        <div className={`${styles.statItem} ${styles.statItemPrimary}`}>
          <div className={styles.statNumber}>165</div>
          <div className={styles.statLabel}>Repositories</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>3.4k</div>
          <div className={styles.statLabel}>PRs Merged</div>
        </div>
      </div>

      {/* 2. WHAT IS OPENCODE (FEATURES) */}
      <section className={styles.section}>
        <div className={`${styles.sectionEyebrow} ${styles.fadeInUp}`}>The Experience</div>
        <h2 className={`${styles.sectionHeading} ${styles.fadeInUp}`}>
          Build something that matters.
        </h2>
        <p className={`${styles.sectionDescription} ${styles.fadeInUp}`}>
          OpenCode is a month-long open-source celebration where students collaborate with maintainers to build, fix, and improve real-world projects.
        </p>

        <div className={`${styles.featuresGrid} ${styles.fadeInUp}`}>
          <div className={`${styles.featureCard} ${styles.featureCardTeal}`}>
            <div className={styles.featureIcon}><FaCode size={20} /></div>
            <h3 className={styles.featureTitle}>Real-World Coding</h3>
            <p className={styles.featureDescription}>
              Step out of the classroom and dive into production codebases. Fix bugs, add features, and learn best practices.
            </p>
          </div>
          <div className={`${styles.featureCard} ${styles.featureCardCyan}`}>
            <div className={styles.featureIcon}><FaUsers size={20} /></div>
            <h3 className={styles.featureTitle}>Vibrant Community</h3>
            <p className={styles.featureDescription}>
              Join a network of passionate developers. Get mentored by experienced maintainers and collaborate with peers.
            </p>
          </div>
          <div className={`${styles.featureCard} ${styles.featureCardAmber}`}>
            <div className={styles.featureIcon}><FaTrophy size={19} /></div>
            <h3 className={styles.featureTitle}>Earn Rewards</h3>
            <p className={styles.featureDescription}>
              Every merged PR earns you points. Climb the leaderboard, unlock exclusive badges, and win exciting prizes.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TIMELINE */}
      <section className={styles.section}>
        <div className={`${styles.sectionEyebrow} ${styles.fadeInUp}`}>The Journey</div>
        <h2 className={`${styles.sectionHeading} ${styles.fadeInUp}`}>
          Your path to open source.
        </h2>
        <p className={`${styles.sectionDescription} ${styles.fadeInUp}`}>
          Four weeks of intense collaboration, learning, and building. Here is how the season unfolds.
        </p>

        <div className={`${styles.timeline} ${styles.fadeInUp}`}>
          <div className={styles.timelineItem} data-active="true">
            <div className={styles.timelineDot} />
            <div className={styles.timelineDate}>Phase 1 — Registration</div>
            <h3 className={styles.timelineTitle}>The Awakening</h3>
            <p className={styles.timelineDescription}>
              Sign up, set up your GitHub profile, and get ready. Maintainers prepare their repositories with starter issues for beginners.
            </p>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <div className={styles.timelineDate}>Phase 2 — Week 1 & 2</div>
            <h3 className={styles.timelineTitle}>First Blood</h3>
            <p className={styles.timelineDescription}>
              The coding begins! Start with &quot;good first issues&quot;, learn the contribution workflow, and get your first PR merged.
            </p>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <div className={styles.timelineDate}>Phase 3 — Week 3 & 4</div>
            <h3 className={styles.timelineTitle}>Deep Dive</h3>
            <p className={styles.timelineDescription}>
              Tackle complex features, optimize performance, and collaborate on architecture. The leaderboard heats up.
            </p>
          </div>
          <div className={`${styles.timelineItem} ${styles.timelineItemGold}`}>
            <div className={styles.timelineDot} />
            <div className={styles.timelineDate}>Phase 4 — Closing</div>
            <h3 className={styles.timelineTitle}>The Sakura Festival</h3>
            <p className={styles.timelineDescription}>
              Closing ceremony, final leaderboard reveal, project showcases, and prize distribution.
            </p>
          </div>
        </div>
      </section>

      {/* 4. JOIN CTA */}
      <section className={`${styles.joinCta} ${styles.fadeInUp}`}>
        <h2 className={styles.joinHeading}>
          Ready to make your <span>mark</span>?
        </h2>
        <p className={styles.joinDescription}>
          Join thousands of developers in the largest open-source celebration. Your first contribution is just a click away.
        </p>
        <Link href="/auth/register" className={styles.joinButton}>
          Join OpenCode 2026 <FaArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
