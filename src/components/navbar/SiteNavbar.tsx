'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Volume2,
  VolumeX,
  Film,
  UserRound,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from 'contexts/AuthContext';
import { useFeatures } from 'contexts/FeaturesContext';
import ThemeToggle from 'components/japanese/ThemeToggle';
import SakuraToggle from 'components/common/SakuraToggle';
import OpenCodeLogo from 'components/common/OpenCodeLogo';

function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/user/events' },
  { label: 'Leaderboard', href: '/user/leaderboard/Opencode' },
  { label: 'RPlace Canvas', href: '/user/rplace' },
  { label: 'Winners', href: '/user/winners' },
  { label: 'Milestones', href: '/user/milestones' },
  { label: 'Repositories', href: '/user/repos' },
  { label: 'FAQ', href: '/faq' },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { features } = useFeatures();

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroMuted, setHeroMuted] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeNavigation = navigation.filter((item) => {
    if (item.href === '/user/winners' && !features.showWinners) return false;
    if (item.href === '/user/milestones' && !features.showMilestones) return false;
    if (item.href === '/user/leaderboard/Opencode' && !features.showLeaderboard) return false;
    if (item.href === '/user/repos' && !features.showRepositories) return false;
    if (item.href === '/user/rplace' && !features.showRPlace) return false;
    return true;
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Synchronize audio on homepage
  useEffect(() => {
    if (pathname !== '/') return;
    const handleSoundState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isMuted: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isMuted === 'boolean') {
        setHeroMuted(customEvent.detail.isMuted);
      }
    };

    window.addEventListener('hero-sound-state', handleSoundState);
    window.dispatchEvent(new CustomEvent('query-hero-sound'));

    return () => {
      window.removeEventListener('hero-sound-state', handleSoundState);
    };
  }, [pathname]);

  const toggleHeroSound = () => {
    setHeroMuted((prev) => !prev);
    window.dispatchEvent(new CustomEvent('toggle-hero-sound'));
  };

  const openTrailer = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cinematic-landing'));
    }
  };

  // Close mobile navigation on click outside or escape key, and trap focus
  useEffect(() => {
    if (!isMenuOpen) return;

    // Body scroll lock on mobile when menu is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus first focusable element inside mobile menu
    const timer = setTimeout(() => {
      if (mobileMenuRef.current) {
        const firstFocusable = mobileMenuRef.current.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 50);

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        toggleButtonRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && mobileMenuRef.current) {
        const focusable = Array.from(
          mobileMenuRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null); // only visible elements

        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.includes('/leaderboard')) return pathname?.includes('/leaderboard');
    return pathname?.startsWith(href);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-2 sm:pt-3 pointer-events-none transition-all duration-300">
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mx-auto max-w-[1440px]">
        {/* Main Capsule Navbar */}
        <nav
          className={cn(
            "pointer-events-auto flex items-center justify-between transition-all duration-300 oc-capsule-navbar min-w-0",
            scrolled
              ? "flex-1 max-w-5xl rounded-full px-3.5 sm:px-5 py-2 shadow-2xl"
              : "flex-1 max-w-6xl rounded-[2.75rem] px-4 sm:px-6 py-2.5 sm:py-3 shadow-xl"
          )}
        >
          {/* Left: Brand Title with Logo */}
          <Link
            href="/"
            className="flex items-center group shrink-0 gap-2 sm:gap-2.5 pr-1"
            onClick={() => {
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              setIsMenuOpen(false);
            }}
          >
            <OpenCodeLogo width={24} height={24} className="oc-brand-mark transition-transform group-hover:scale-105 shrink-0" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--fg)] group-hover:opacity-90 transition-opacity whitespace-nowrap">
              OpenCode<span className="text-[var(--accent)]">&apos;26</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation Links Pill */}
          <div className="hidden xl:flex items-center gap-0.5 xl:gap-1 backdrop-blur-xl px-2 py-1 xl:px-2.5 xl:py-1 rounded-full oc-capsule-pill shadow-inner shrink min-w-0 mx-1 sm:mx-2">
            {activeNavigation.map((item) => {
              const isActive = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "relative z-10 px-2 xl:px-2.5 2xl:px-3 py-1 text-xs xl:text-[13px] font-medium rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 oc-capsule-link whitespace-nowrap shrink-0",
                    isActive
                      ? "text-[var(--fg)] bg-[var(--surface-2)] border border-[var(--border-accent)] shadow-sm shadow-[var(--accent-soft)] font-semibold"
                      : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] border border-transparent"
                  )}
                >
                  {item.label === 'RPlace Canvas' ? (
                    <>
                      <span className="hidden 2xl:inline">RPlace Canvas</span>
                      <span className="2xl:hidden">RPlace</span>
                    </>
                  ) : item.label === 'Repositories' ? (
                    <>
                      <span className="hidden 2xl:inline">Repositories</span>
                      <span className="2xl:hidden">Repos</span>
                    </>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions (Sakura, Theme, Auth, Mobile Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <SakuraToggle />
              <ThemeToggle />
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[var(--border)] mx-0.5 shrink-0" />

            {/* Dynamic Sign In / Profile action pill */}
            <Link
              href={mounted && isLoggedIn ? "/user/profile" : "/auth/sign-in"}
              aria-current={pathname?.startsWith('/user/profile') || pathname?.startsWith('/auth') ? 'page' : undefined}
              className={cn(
                "relative z-10 flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 shrink-0 whitespace-nowrap",
                mounted && isLoggedIn
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-accent)] hover:bg-[var(--accent-soft)]/80"
                  : "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] shadow-md shadow-[var(--accent-soft)]"
              )}
            >
              {mounted && isLoggedIn ? (
                <>
                  <UserRound className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Profile</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <div className="xl:hidden flex items-center shrink-0">
              <button
                ref={toggleButtonRef}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="text-[var(--muted)] hover:text-[var(--fg)] p-1.5 sm:p-2 rounded-full bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 transition-colors cursor-pointer"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav-menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-[var(--fg)]" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Standalone Control Capsules: Play Trailer & Sound (shown on landing page) */}
        {pathname === "/" && (
          <div className="pointer-events-auto shrink-0 hidden md:flex items-center gap-1.5 sm:gap-2">
            {/* Play Trailer Button */}
            <button
              type="button"
              onClick={openTrailer}
              className={cn(
                "group flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs sm:text-sm font-semibold text-[var(--fg)] backdrop-blur-md shadow-lg hover:border-[var(--border-accent)] transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 shrink-0",
                scrolled
                  ? "px-2.5 sm:px-3 py-2"
                  : "px-3 sm:px-3.5 py-2.5"
              )}
              title="Play cinematic trailer"
            >
              <Film className="w-4 h-4 text-[var(--accent-bold)] transition-transform duration-300 group-hover:scale-110 shrink-0" />
              <span className="hidden xl:inline text-[var(--fg)] whitespace-nowrap">Play Trailer</span>
            </button>

            {/* Sound Switch Button */}
            <button
              type="button"
              onClick={toggleHeroSound}
              className={cn(
                "group flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs sm:text-sm font-semibold text-[var(--fg)] backdrop-blur-md shadow-lg hover:border-[var(--border-accent)] transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 shrink-0",
                scrolled
                  ? "px-2.5 sm:px-3 py-2"
                  : "px-3 sm:px-3.5 py-2.5"
              )}
              title={heroMuted ? "Turn background audio on" : "Turn background audio off"}
            >
              {heroMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-[var(--subtle)] transition-colors group-hover:text-[var(--accent)] shrink-0" />
                  <span className="hidden xl:inline text-[var(--muted)] group-hover:text-[var(--fg)] transition-colors whitespace-nowrap">
                    Sound Off
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[var(--accent-bold)] animate-pulse shrink-0" />
                  <span className="hidden xl:inline text-[var(--fg)] whitespace-nowrap">Sound On</span>
                  <span className="hidden xl:flex items-end gap-0.5 h-3 ml-0.5">
                    <span className="w-0.5 bg-[var(--accent-bold)] animate-pulse h-2.5" />
                    <span className="w-0.5 bg-[var(--accent-bold)] animate-pulse h-1.5" />
                    <span className="w-0.5 bg-[var(--accent-bold)] animate-pulse h-3" />
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        id="mobile-nav-menu"
        ref={mobileMenuRef}
        role="dialog"
        aria-label="Mobile Navigation Menu"
        className={cn(
          "pointer-events-auto xl:hidden mt-3 w-full max-w-5xl mx-auto rounded-2xl backdrop-blur-2xl bg-[var(--bg-2)]/95 border border-[var(--border)] p-4 space-y-2 shadow-2xl transition-all duration-300 ease-out",
          isMenuOpen
            ? "opacity-100 translate-y-0 visible pointer-events-auto"
            : "opacity-0 -translate-y-4 invisible pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-2 sm:hidden">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">Controls</span>
          <div className="flex items-center gap-2">
            <SakuraToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-1">
          {activeNavigation.map((item) => {
            const isActive = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "w-full text-left rounded-xl px-4 py-2.5 text-sm sm:text-base font-medium transition-all cursor-pointer flex items-center justify-between",
                  isActive
                    ? "text-[var(--fg)] bg-[var(--surface-2)] border border-[var(--border-accent)] font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)]"
                )}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-bold)]" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="h-px bg-[var(--line)] my-2" />

        <div className="space-y-2 pt-1">
          {pathname === "/" && (
            <div className="flex items-center gap-2 pt-1 pb-2">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openTrailer();
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold text-[var(--fg)] bg-[var(--surface-2)] border border-[var(--border)]"
              >
                <Film className="w-3.5 h-3.5 text-[var(--accent-bold)]" />
                <span>Play Trailer</span>
              </button>
              <button
                type="button"
                onClick={toggleHeroSound}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold text-[var(--fg)] bg-[var(--surface-2)] border border-[var(--border)]"
              >
                {heroMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[var(--subtle)]" />
                    <span>Sound Off</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[var(--accent-bold)]" />
                    <span>Sound On</span>
                  </>
                )}
              </button>
            </div>
          )}

          <Link
            href={mounted && isLoggedIn ? "/user/profile" : "/auth/sign-in"}
            onClick={() => setIsMenuOpen(false)}
            className={cn(
              "w-full text-left rounded-xl px-4 py-2.5 text-sm sm:text-base font-semibold transition-all flex items-center justify-between",
              mounted && isLoggedIn
                ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-accent)] hover:bg-[var(--accent-soft)]/80"
                : "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] shadow-md shadow-[var(--accent-soft)]"
            )}
          >
            <div className="flex items-center gap-2.5">
              <UserRound className="w-4 h-4" />
              <span>{mounted && isLoggedIn ? "My Profile" : "Sign In to OpenCode"}</span>
            </div>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
