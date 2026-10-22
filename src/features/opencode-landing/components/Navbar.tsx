"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Volume2,
  VolumeX,
  Film,
  Trophy,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { openCinematicLanding } from "./CinematicIntro";
import { cn } from "../utils/cn";
import { useAuth } from "contexts/AuthContext";

interface NavItem {
  name: string;
  href: string;
  isSection?: boolean;
}

const navItems: NavItem[] = [
  { name: "How it works", href: "#how-it-works", isSection: true },
  { name: "Projects", href: "#projects", isSection: true },
  { name: "Testimonials", href: "#testimonials", isSection: true },
  { name: "FAQ", href: "#faq", isSection: true },
];

export default function Navbar({ className }: { className?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroMuted, setHeroMuted] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Mount check for consistent client rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Audio synchronization with BackgroundAudio
  useEffect(() => {
    const handleSoundState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isMuted: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isMuted === "boolean") {
        setHeroMuted(customEvent.detail.isMuted);
      }
    };

    window.addEventListener("hero-sound-state", handleSoundState);
    window.dispatchEvent(new CustomEvent("query-hero-sound"));

    return () => {
      window.removeEventListener("hero-sound-state", handleSoundState);
    };
  }, []);

  const toggleHeroSound = () => {
    setHeroMuted((prev) => !prev);
    window.dispatchEvent(new CustomEvent("toggle-hero-sound"));
  };

  // Scroll threshold for compact capsule styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-aware Active Section Indicator via IntersectionObserver
  useEffect(() => {
    const sectionIds = ["how-it-works", "projects", "testimonials", "faq"];

    const isIntroBlocking = () => {
      const portal = document.getElementById("cinematic-landing-portal");
      return !!portal && portal.style.display !== "none" && !portal.classList.contains("opacity-0");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (isIntroBlocking()) {
          setActiveSection(null);
          return;
        }

        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length > 0) {
          intersecting.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActiveSection(`#${intersecting[0].target.id}`);
        } else if (window.scrollY < 350) {
          setActiveSection(null);
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -45% 0px",
        threshold: [0, 0.15, 0.3, 0.5, 0.7],
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleIntroEnter = () => {
      if (window.scrollY < 350) setActiveSection(null);
    };

    const handleIntroOpen = () => {
      setActiveSection(null);
    };

    window.addEventListener("landing-page-entered", handleIntroEnter);
    window.addEventListener("open-cinematic-landing", handleIntroOpen);

    return () => {
      observer.disconnect();
      window.removeEventListener("landing-page-entered", handleIntroEnter);
      window.removeEventListener("open-cinematic-landing", handleIntroOpen);
    };
  }, []);

  // Outside click & Escape key dismissal for mobile navigation
  useEffect(() => {
    if (!isMenuOpen) return;

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
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.isSection) {
      if (pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(item.href.replace("#", ""));
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
          setActiveSection(item.href);
        }
      } else {
        e.preventDefault();
        router.push(`/${item.href}`);
      }
    }
    setIsMenuOpen(false);
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection(null);
    }
    setIsMenuOpen(false);
  };

  const isCompact = scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-2 sm:pt-6 pointer-events-none transition-all duration-500",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3.5 w-full mx-auto max-w-7xl">
        {/* Main Navbar Capsule */}
        <nav
          className={cn(
            "pointer-events-auto flex items-center justify-between transition-all duration-500",
            "backdrop-blur-md bg-[#07131F]/80 border border-[#AEBCC7]/15",
            isCompact
              ? "flex-1 max-w-5xl rounded-full px-4 sm:px-6 py-2 shadow-[0_0_30px_rgba(7,19,31,0.8)] bg-[#07131F]/90 border border-[#AEBCC7]/20"
              : "flex-1 max-w-6xl rounded-[2.75rem] px-5 sm:px-8 py-3.5 shadow-[0_20px_80px_-50px_rgba(7,19,31,0.7)] bg-[#07131F]/80 border border-[#AEBCC7]/15"
          )}
        >
          {/* Left: Brand Title */}
          <Link
            href="/"
            onClick={handleBrandClick}
            className="flex items-center group shrink-0"
          >
            <span className="text-lg sm:text-xl font-bold text-[#F4F1E8] tracking-tight group-hover:opacity-90 transition-opacity">
              OpenCode<span className="text-[#B8E5D5]">&apos;26</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation Links + Leaderboard + Auth */}
          <div className="hidden lg:flex items-center gap-1 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-[#AEBCC7]/15 bg-[#0B1C2A]/60 shadow-inner">
            {/* In-page section buttons */}
            {navItems.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <button
                  key={item.name}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "relative z-10 px-3 py-1.5 text-xs xl:text-sm font-medium rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58B99A]/50",
                    isActive
                      ? "text-[#F4F1E8] bg-[#102535] border border-[#58B99A]/40 shadow-sm shadow-[#58B99A]/20 font-semibold"
                      : "text-[#AEBCC7] hover:text-[#F4F1E8] hover:bg-[#102535]/50 border border-transparent"
                  )}
                >
                  <span>{item.name}</span>
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-[1px] h-4 bg-[#AEBCC7]/20 mx-1 shrink-0" />

            {/* Leaderboard Link */}
            <Link
              href="/user/leaderboard/Opencode"
              className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-sm font-medium rounded-full transition-all duration-200 cursor-pointer text-[#AEBCC7] hover:text-[#F4F1E8] hover:bg-[#102535]/50 border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58B99A]/50"
            >
              <Trophy className="w-3.5 h-3.5 text-[#58B99A]" />
              <span>Leaderboard</span>
            </Link>

            {/* Dynamic Authentication Action Pill */}
            <Link
              href={mounted && isLoggedIn ? "/user/profile" : "/auth/sign-in"}
              className={cn(
                "relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58B99A]/50",
                mounted && isLoggedIn
                  ? "bg-[#58B99A]/15 text-[#B8E5D5] border border-[#58B99A]/30 hover:bg-[#58B99A]/25"
                  : "bg-[#B8E5D5] text-[#0C1C2C] hover:bg-[#A3DAC7] shadow-md shadow-[#58B99A]/20"
              )}
            >
              {mounted && isLoggedIn ? (
                <>
                  <UserRound className="w-3.5 h-3.5 text-[#B8E5D5]" />
                  <span>Profile</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              ref={toggleButtonRef}
              onClick={toggleMenu}
              className="text-[#AEBCC7] hover:text-[#F4F1E8] p-2 rounded-full bg-[#102535]/55 border border-[#AEBCC7]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58B99A]/50 transition-colors cursor-pointer"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-[#F4F1E8]" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Standalone Control Capsules: Play Trailer & Sound */}
        <div className="pointer-events-auto shrink-0 flex items-center gap-2 sm:gap-2.5">
          {/* Play Trailer Button */}
          <button
            type="button"
            onClick={() => openCinematicLanding()}
            className={cn(
              "group flex items-center gap-2 rounded-full border border-[#AEBCC7]/20 bg-[#102535]/70 hover:bg-[#102535]/95 text-xs sm:text-sm font-semibold text-[#F4F1E8] backdrop-blur-md shadow-lg shadow-[#07131F]/80 hover:border-[#58B99A]/45 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58B99A]/50",
              isCompact
                ? "px-3 sm:px-3.5 py-2.5"
                : "px-3.5 sm:px-4 py-3 sm:py-3.5"
            )}
            title="Play cinematic trailer"
          >
            <Film className="w-4 h-4 text-[#58B99A] transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden md:inline text-[#F4F1E8]">Play Trailer</span>
          </button>

          {/* Sound Switch Button */}
          <button
            type="button"
            onClick={toggleHeroSound}
            className={cn(
              "group flex items-center gap-2 rounded-full border border-[#AEBCC7]/20 bg-[#102535]/70 hover:bg-[#102535]/95 text-xs sm:text-sm font-semibold text-[#F4F1E8] backdrop-blur-md shadow-lg shadow-[#07131F]/80 hover:border-[#58B99A]/45 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58B99A]/50",
              isCompact
                ? "px-3 sm:px-3.5 py-2.5"
                : "px-3.5 sm:px-4 py-3 sm:py-3.5"
            )}
            title={heroMuted ? "Turn background audio on" : "Turn background audio off"}
          >
            {heroMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-[#718394] transition-colors group-hover:text-[#58B99A]" />
                <span className="hidden md:inline text-[#AEBCC7] group-hover:text-[#F4F1E8] transition-colors">
                  Sound Off
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#58B99A] animate-pulse" />
                <span className="hidden md:inline text-[#F4F1E8]">Sound On</span>
                <span className="hidden md:flex items-end gap-0.5 h-3 ml-0.5">
                  <span className="w-0.5 bg-[#58B99A] animate-pulse h-2.5" />
                  <span className="w-0.5 bg-[#58B99A] animate-pulse h-1.5" />
                  <span className="w-0.5 bg-[#58B99A] animate-pulse h-3" />
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Robust CSS Transitions */}
      <div
        id="mobile-nav-menu"
        ref={mobileMenuRef}
        role="dialog"
        aria-label="Mobile Navigation Menu"
        className={cn(
          "pointer-events-auto lg:hidden mt-3 w-full max-w-5xl mx-auto rounded-2xl backdrop-blur-2xl bg-[#0B1C2A]/95 border border-[#AEBCC7]/20 p-4 space-y-2 shadow-2xl transition-all duration-300 ease-out",
          isMenuOpen
            ? "opacity-100 translate-y-0 visible pointer-events-auto"
            : "opacity-0 -translate-y-4 invisible pointer-events-none"
        )}
      >
        {/* In-page section buttons */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <button
                key={item.name}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  "w-full text-left rounded-xl px-4 py-2.5 text-sm sm:text-base font-medium transition-all cursor-pointer flex items-center justify-between",
                  isActive
                    ? "text-[#F4F1E8] bg-[#102535] border border-[#58B99A]/40 font-semibold"
                    : "text-[#AEBCC7] hover:text-[#F4F1E8] hover:bg-[#102535]/60"
                )}
              >
                <span>{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58B99A]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#AEBCC7]/15 my-2" />

        {/* Portal Links: Leaderboard & Auth */}
        <div className="space-y-2 pt-1">
          <Link
            href="/user/leaderboard/Opencode"
            onClick={() => setIsMenuOpen(false)}
            className="w-full text-left text-[#AEBCC7] hover:text-[#F4F1E8] hover:bg-[#102535]/60 rounded-xl px-4 py-2.5 text-sm sm:text-base font-medium transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-[#58B99A]" />
              <span>Leaderboard</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#718394]" />
          </Link>

          <Link
            href={mounted && isLoggedIn ? "/user/profile" : "/auth/sign-in"}
            onClick={() => setIsMenuOpen(false)}
            className={cn(
              "w-full text-left rounded-xl px-4 py-2.5 text-sm sm:text-base font-semibold transition-all flex items-center justify-between",
              mounted && isLoggedIn
                ? "bg-[#58B99A]/15 text-[#B8E5D5] border border-[#58B99A]/30 hover:bg-[#58B99A]/25"
                : "bg-[#B8E5D5] text-[#0C1C2C] hover:bg-[#A3DAC7] shadow-md shadow-[#58B99A]/20"
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
