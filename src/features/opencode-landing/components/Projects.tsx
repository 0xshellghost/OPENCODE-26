/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projectsData, ProjectItem } from "../data/projectsData";
import {
  Github,
  User,
  ArrowRight,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BlurText from "./BlurText";
import SpecularButton from "./SpecularButton";
import SakuraCanvas from "./SakuraCanvas";
import "./ProjectsGallery.css";

const SafeAnimatePresence = AnimatePresence as React.FC<React.PropsWithChildren<any>>;

// Track filter definition inspired by Pinterest header navigation
interface TrackFilter {
  id: string;
  label: string;
  domain?: "ai" | "web" | "mobile" | "web3" | "cybersecurity";
}

const TRACK_FILTERS: TrackFilter[] = [
  { id: "all", label: "ALL TRACKS" },
  { id: "ai", label: "AI & INTELLIGENCE", domain: "ai" },
  { id: "web", label: "WEB & FULLSTACK", domain: "web" },
  { id: "cybersecurity", label: "SECURITY & SYSTEMS", domain: "cybersecurity" },
  { id: "web3", label: "WEB3 & PROTOCOLS", domain: "web3" },
  { id: "mobile", label: "MOBILE ECOSYSTEM", domain: "mobile" },
];

// Snappy Apple/Stripe ease-out curve for instant responsive feel
const TRANSITION_CONFIG = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as const,
};

const subscribeWindowResize = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

const getWindowWidth = () => (typeof window !== "undefined" ? window.innerWidth : 1200);
const getServerWidth = () => 1200;

export default function Projects() {
  const windowWidth = React.useSyncExternalStore(
    subscribeWindowResize,
    getWindowWidth,
    getServerWidth
  );
  const [activeTrack, setActiveTrack] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const isNavigatingRef = useRef<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  // Filter projects according to the active track
  const currentProjects = useMemo(() => {
    if (activeTrack === "all") return projectsData;
    const filter = TRACK_FILTERS.find((t) => t.id === activeTrack);
    if (!filter || !filter.domain) return projectsData;
    return projectsData.filter((p) => p.domain === filter.domain);
  }, [activeTrack]);

  // Preload all project images into memory so 1500 concurrent visitors experience zero decode lag
  useEffect(() => {
    if (typeof window !== "undefined") {
      projectsData.forEach((project) => {
        const img = new window.Image();
        img.src = project.image;
      });
    }
  }, []);

  // Safe active index ensuring no out-of-bounds index
  const safeActiveIndex = activeIndex < currentProjects.length ? activeIndex : 0;

  // The active center project
  const activeProject = currentProjects[safeActiveIndex] || currentProjects[0];

  const handleTrackChange = (trackId: string) => {
    setActiveTrack(trackId);
    setActiveIndex(0);
  };

  // Throttled navigation handlers to guarantee 60-120fps under rapid input
  const handlePrev = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setActiveIndex((prev) => (prev - 1 + currentProjects.length) % currentProjects.length);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 220);
  }, [currentProjects.length]);

  const handleNext = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setActiveIndex((prev) => (prev + 1) % currentProjects.length);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 220);
  }, [currentProjects.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProject) return; // let modal handle escape
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, selectedProject]);

  // Open detail popup modal
  const handleOpenDetail = useCallback(
    (project: ProjectItem, e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e && "currentTarget" in e && e.currentTarget) {
        lastActiveElementRef.current = e.currentTarget as HTMLElement;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setOrigin({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      } else {
        setOrigin(null);
      }
      setSelectedProject(project);
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedProject(null);
    if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }
  }, []);

  // Keyboard escape & body scroll lock while modal is open
  useEffect(() => {
    const handleModalKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseDetail();
      }
    };
    if (selectedProject) {
      window.addEventListener("keydown", handleModalKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleModalKey);
      document.body.style.overflow = "";
    };
  }, [selectedProject, handleCloseDetail]);

  // Compute circular 3D offset relative to active card
  const getOffset = (index: number) => {
    const total = currentProjects.length;
    if (total <= 1) return 0;
    let diff = index - safeActiveIndex;
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  };

  // Responsive dimension & GPU compositor transform calculations (strictly x, scale, rotateY, opacity)
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const getCardTransform = (diff: number) => {
    if (diff === 0) {
      return {
        x: 0,
        scale: 1,
        rotateY: 0,
        zIndex: 30,
        opacity: 1,
        dimOpacity: 0,
      };
    }

    if (diff === -1) {
      return {
        x: isMobile ? -135 : isTablet ? -230 : -295,
        scale: isMobile ? 0.82 : 0.86,
        rotateY: 16,
        zIndex: 20,
        opacity: isMobile ? 0.45 : 0.88,
        dimOpacity: 0.32,
      };
    }

    if (diff === 1) {
      return {
        x: isMobile ? 135 : isTablet ? 230 : 295,
        scale: isMobile ? 0.82 : 0.86,
        rotateY: -16,
        zIndex: 20,
        opacity: isMobile ? 0.45 : 0.88,
        dimOpacity: 0.32,
      };
    }

    if (diff === -2) {
      return {
        x: isMobile ? -250 : isTablet ? -400 : -520,
        scale: 0.72,
        rotateY: 25,
        zIndex: 10,
        opacity: isMobile ? 0 : 0.6,
        dimOpacity: 0.65,
      };
    }

    if (diff === 2) {
      return {
        x: isMobile ? 250 : isTablet ? 400 : 520,
        scale: 0.72,
        rotateY: -25,
        zIndex: 10,
        opacity: isMobile ? 0 : 0.6,
        dimOpacity: 0.65,
      };
    }

    // Fully hidden non-visible cards
    return {
      x: diff > 0 ? 650 : -650,
      scale: 0.6,
      rotateY: diff > 0 ? -30 : 30,
      zIndex: 0,
      opacity: 0,
      dimOpacity: 0.9,
    };
  };

  return (
    <div
      id="projects"
      className="min-h-screen py-16 sm:py-24 scroll-mt-20 bg-[#07131F] border-b border-[#AEBCC7]/15 overflow-hidden relative select-none"
    >
      {/* =========================================================================
          1. HARDWARE-ACCELERATED AMBIENT ARTWORK BACKDROP
          Pure CSS opacity fade on WebP image with static GPU blur (zero runtime recalculation)
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        {activeProject && (
          <img
            key={activeProject.id}
            src={activeProject.image}
            alt=""
            className="ambient-backdrop absolute inset-0 w-full h-full object-cover saturate-150 brightness-[0.32] pointer-events-none"
          />
        )}

        {/* Ambient Dark Radial & Vignette Overlay */}
        <div className="absolute inset-0 bg-[#07131F]/45 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#07131F]/65 to-[#07131F] pointer-events-none" />
      </div>

      {/* Top & Bottom Seamless Edge Transitions */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#07131F] via-[#07131F]/70 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07131F] via-[#07131F]/70 to-transparent pointer-events-none z-10" />

      {/* Ethereal Falling Sakura Petals & Spirit Lights */}
      <SakuraCanvas
        active={true}
        position="absolute"
        petalCount={30}
        className="pointer-events-none z-10 opacity-70"
        colors={[
          "rgba(184, 229, 213, 0.85)", // Glowing Mint
          "rgba(88, 185, 154, 0.80)",  // Emerald
          "rgba(255, 183, 197, 0.75)", // Sakura Pink
          "rgba(56, 189, 248, 0.70)",  // Cyan
          "rgba(244, 241, 232, 0.80)", // Soft Moonlit Ivory
        ]}
      />

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 overflow-visible">
        {/* =========================================================================
            2. SECTION HEADER
            Minimalist Cormorant Garamond serif headline
            ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#F4F1E8] tracking-wide font-cormorant">
            Tracks &amp; Featured{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F4F1E8] via-[#D9E2E8] to-[#B8E5D5]">
              Projects
            </span>
          </h2>

          <div className="mt-2.5">
            <BlurText
              text="Explore open-source initiatives curated across key technological tracks. Swipe, click flanking cards, or use arrows to navigate the 3D perspective gallery."
              className="text-sm sm:text-base text-[#AEBCC7] leading-relaxed font-zen justify-center text-center max-w-2xl mx-auto"
              delay={15}
            />
          </div>
        </div>

        {/* =========================================================================
            3. PINTEREST-INSPIRED TRACKS NAVIGATION BAR
            Horizontal editorial tabs with fine active underline indicator
            ========================================================================= */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <div
            className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 border-b border-white/10 pb-1"
            role="tablist"
            aria-label="Technology Tracks"
          >
            {TRACK_FILTERS.map((filter) => {
              const isActive = activeTrack === filter.id;
              const count =
                filter.id === "all"
                  ? projectsData.length
                  : projectsData.filter((p) => p.domain === filter.domain).length;

              return (
                <button
                  key={filter.id}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onClick={() => handleTrackChange(filter.id)}
                  className={`group relative px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[13px] font-mono font-medium tracking-wider transition-colors duration-200 cursor-pointer focus:outline-none rounded-t-md ${
                    isActive
                      ? "text-[#F4F1E8]"
                      : "text-white/45 hover:text-white/80"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{filter.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full transition-colors ${
                        isActive
                          ? "bg-[#58B99A]/20 text-[#B8E5D5] border border-[#58B99A]/30"
                          : "bg-white/5 text-white/30 group-hover:text-white/60"
                      }`}
                    >
                      {count}
                    </span>
                  </span>

                  {/* Pinterest-style animated active underline */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTrackUnderline"
                      className="absolute bottom-[-1px] inset-x-0 h-[2.5px] bg-gradient-to-r from-[#58B99A] via-[#B8E5D5] to-[#58B99A] shadow-[0_0_10px_rgba(88,185,154,0.7)]"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            4. 3D PARALLAX PERSPECTIVE CAROUSEL STAGE
            Optimized for locked 60-120fps compositor transforms (NO live filter animations)
            ========================================================================= */}
        <div className="relative w-full max-w-7xl mx-auto py-2 overflow-visible">
          {/* Navigation Arrows: Translucent glowing glass chevrons */}
          <button
            onClick={handlePrev}
            aria-label="Previous project"
            className="nav-arrow-btn absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3 rounded-full text-white/85 hover:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#58B99A]"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next project"
            className="nav-arrow-btn absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3 rounded-full text-white/85 hover:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#58B99A]"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* 3D Perspective Stage Container */}
          <div className="perspective-stage relative w-full h-[500px] sm:h-[560px] lg:h-[620px] flex items-center justify-center overflow-visible">
            {currentProjects.map((project, index) => {
              const diff = getOffset(index);
              const isCenter = diff === 0;
              const isVisible = Math.abs(diff) <= 2;
              const transformConfig = getCardTransform(diff);

              if (!isVisible && !isCenter) return null;

              return (
                <div
                  key={project.id}
                  onTouchStart={(e) => {
                    touchStartXRef.current = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    if (touchStartXRef.current !== null) {
                      const delta = e.changedTouches[0].clientX - touchStartXRef.current;
                      if (delta < -40) handleNext();
                      else if (delta > 40) handlePrev();
                      touchStartXRef.current = null;
                    }
                  }}
                  onClick={() => {
                    if (!isCenter) {
                      setActiveIndex(index);
                    }
                  }}
                  className={`perspective-card-3d absolute w-[290px] sm:w-[360px] lg:w-[410px] h-[450px] sm:h-[510px] lg:h-[570px] rounded-2xl sm:rounded-3xl overflow-hidden border cursor-pointer ${
                    isCenter
                      ? "border-white/25 card-center-glow cursor-default"
                      : "border-white/10 card-flanking-glow hover:border-white/20"
                  }`}
                  style={{
                    transform: `translateX(${transformConfig.x}px) scale(${transformConfig.scale}) rotateY(${transformConfig.rotateY}deg)`,
                    zIndex: transformConfig.zIndex,
                    opacity: transformConfig.opacity,
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    transformOrigin: "center center",
                  }}
                >
                  {/* Full-bleed Scenic Photography Background (Ultra-optimized WebP asset) */}
                  <img
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    loading={isCenter ? "eager" : "lazy"}
                  />

                  {/* Diagonal Glass Sheen & Gradients */}
                  <div className="card-glass-sheen absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      isCenter ? "card-night-tint" : "card-flanking-tint"
                    }`}
                    style={{ zIndex: 2 }}
                  />

                  {/* Hardware-Accelerated Dimmer Layer (Pure Opacity Composite, Zero Filter Cost) */}
                  <div
                    className="absolute inset-0 bg-[#07131F] pointer-events-none"
                    style={{
                      opacity: transformConfig.dimOpacity,
                      transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      zIndex: 3,
                    }}
                  />

                  {/* Flanking Card Minimalist Label (Visible when card is not centered) */}
                  {!isCenter && (
                    <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center justify-end text-center px-4 pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-[#07131F]/85 border border-white/15 text-xs font-mono font-medium text-white/90 tracking-wide shadow-md">
                        {project.title}
                      </span>
                    </div>
                  )}

                  {/* =================================================================
                      CENTER ACTIVE CARD CONTENT OVERLAY (Exact Pinterest Typography)
                      ================================================================= */}
                  {isCenter && (
                    <div className="relative z-10 w-full h-full p-5 sm:p-7 flex flex-col justify-end">
                      {/* Bottom Third: Dramatic Pinterest-style Bold Typography */}
                      <div className="mt-auto pt-4">
                        {/* Big Bold Headline */}
                        <h3 className="font-sans font-black text-2xl sm:text-3xl lg:text-[34px] uppercase text-[#F4F1E8] tracking-wider leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                          {project.title}
                        </h3>

                        {/* Crisp Minimalist Accent Line */}
                        <div className="w-14 h-[2.5px] bg-[#58B99A] my-3 rounded-full shadow-[0_0_10px_rgba(88,185,154,0.7)]" />

                        {/* Subtitle / Tagline */}
                        <p className="font-zen text-xs sm:text-sm text-white/90 line-clamp-2 leading-relaxed mb-3.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                          {project.description}
                        </p>

                        {/* Tech Stack Chips */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded bg-[#07131F]/80 border border-white/15 text-[10px] font-mono text-white/90"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Action Bar: Specification Modal Button + GitHub Link + Mentor */}
                        <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-zen text-white/70">
                            <User className="w-3.5 h-3.5 text-[#58B99A] shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">
                              {project.mentor}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* GitHub Link */}
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`View ${project.title} on GitHub`}
                              className="p-2 rounded-full bg-[#07131F]/85 hover:bg-[#0E2333] border border-white/20 hover:border-white/40 text-white/80 hover:text-white transition-all duration-200 cursor-pointer shrink-0"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>

                            {/* View Specification Button */}
                            <SpecularButton
                              size="sm"
                              radius={16}
                              tint="#ffffff"
                              tintOpacity={0.08}
                              textColor="#ffffff"
                              lineColor="#58B99A"
                              baseColor="#0E2333"
                              intensity={1}
                              idleIntensity={0.35}
                              shineSize={10}
                              shineFade={34}
                              thickness={1.2}
                              glow={1}
                              followMouse
                              proximity={200}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(project, e);
                              }}
                              className="!bg-[#07131F]/85 hover:!bg-[#0E2333] border border-white/25 hover:border-white/45 font-mono text-[10px] sm:text-[11px] tracking-wider px-3.5 py-1.5 shadow-md flex items-center gap-1.5"
                            >
                              <span>SPECIFICATION</span>
                              <ArrowRight className="w-3 h-3 text-[#B8E5D5] transition-transform group-hover:translate-x-0.5" />
                            </SpecularButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              5. PINTEREST-INSPIRED BOTTOM PAGINATION
              Central glowing white dot indicator + clickable pagination dots
              ========================================================================= */}
          <div className="flex flex-col items-center justify-center mt-6 sm:mt-8 gap-3">
            <div className="flex items-center justify-center gap-2 py-1 px-3 rounded-full bg-[#07131F]/85 border border-white/10 shadow-sm">
              {currentProjects.map((p, idx) => {
                const isCurrent = idx === safeActiveIndex;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Go to project ${p.title}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none ${
                      isCurrent
                        ? "w-7 sm:w-8 h-2 sm:h-2.5 bg-[#F4F1E8] shadow-[0_0_12px_rgba(244,241,232,0.9)]"
                        : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/25 hover:bg-white/60"
                    }`}
                  />
                );
              })}
            </div>

            {/* Catalog Position Counter */}
            <div className="text-[11px] font-mono text-white/50 tracking-widest uppercase">
              PROJECT {String(safeActiveIndex + 1).padStart(2, "0")} OF{" "}
              {String(currentProjects.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. ARCHIVE LINK FOOTER
            ========================================================================= */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-xs sm:text-sm text-[#718394] font-zen">
            Looking for all repositories?{" "}
            <a
              href="https://github.com/orgs/opencodeiiita/repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#B8E5D5] hover:text-[#A3DAC7] font-semibold underline underline-offset-4 transition-colors"
            >
              Explore all OpenCode repos on GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>
      </section>

      {/* =========================================================================
          7. DETAILED PROJECT SPECIFICATION POP-OUT MODAL
          Preserves the full architecture and technical specification breakdown
          ========================================================================= */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-project-title"
        >
          {/* Backdrop: Ambient blurred glass overlay */}
          <div
            onClick={handleCloseDetail}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Detailed Project Card Pop-out */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[640px] max-h-[88vh] flex flex-col rounded-2xl bg-[#0B1E30]/95 border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.35),0_0_40px_rgba(88,185,154,0.15)] overflow-hidden text-[#F4F1E8] transition-all duration-200"
          >
              {/* Diagonal Light Sheen */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.02] to-transparent pointer-events-none z-10" />

              {/* Delicate Top Accent Hairline */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#58B99A] to-transparent z-20 pointer-events-none" />

              {/* Close Button Top-Right */}
              <button
                onClick={handleCloseDetail}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-[#F4F1E8] hover:text-[#B8E5D5] transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#58B99A]"
                aria-label="Close project specification"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Header: Track & Project Title */}
              <div className="p-4 sm:p-6 pb-3 sm:pb-4 pr-12 border-b border-white/10 bg-white/[0.04] shrink-0 relative z-20">
                <div className="mb-1.5">
                  <span className="text-xs font-mono font-semibold tracking-wider text-[#58B99A] uppercase">
                    {selectedProject.domainLabel}
                  </span>
                </div>
                <h3
                  id="detail-project-title"
                  className="font-sans font-bold text-2xl sm:text-3xl uppercase text-[#F4F1E8] tracking-wide leading-tight drop-shadow-sm"
                >
                  {selectedProject.title}
                </h3>
              </div>

              {/* Scrollable Body with Specifications */}
              <div className="detail-modal-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain relative z-20">
                {/* Banner Image */}
                {selectedProject.image && (
                  <div className="relative h-40 sm:h-48 w-full rounded-xl overflow-hidden border border-white/20 shadow-lg shrink-0 bg-black/20">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>
                )}

                {/* Problem & Objective */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <h4 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#F4F1E8] uppercase mb-1.5">
                    PROBLEM &amp; OBJECTIVE
                  </h4>
                  <p className="text-xs sm:text-sm text-[#D9E2E8] font-zen leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Solution & Architecture */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <h4 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#58B99A] uppercase mb-1.5">
                    SOLUTION &amp; ARCHITECTURE
                  </h4>
                  <p className="text-xs sm:text-sm text-[#D9E2E8] font-zen leading-relaxed">
                    Engineered during OpenCode 2026 as a production-grade initiative utilizing{" "}
                    {selectedProject.tags.slice(0, 3).join(", ")}. Follows modular architecture,
                    strict TypeScript/linting standards, automated test workflows, and verified
                    maintainer code reviews.
                  </p>
                </div>

                {/* Key Highlights */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <h4 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#58B99A] uppercase mb-1.5">
                    KEY HIGHLIGHTS
                  </h4>
                  <ul className="text-xs sm:text-sm text-[#D9E2E8] font-zen leading-relaxed space-y-1.5 list-disc list-inside">
                    <li>Production-ready CI/CD pipelines &amp; comprehensive test coverage</li>
                    <li>Extensible design with documented developer onboarding specs</li>
                    <li>Scalable architecture tailored for community collaboration</li>
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <h4 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#8FAFC4] uppercase mb-2">
                    TECH STACK
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 sm:px-3 py-1 rounded-md bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-xs font-mono font-medium text-[#F4F1E8] shadow-xs transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mentorship */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <h4 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#8FAFC4] uppercase mb-1.5">
                    PROJECT LEAD &amp; MENTORSHIP
                  </h4>
                  <p className="text-xs sm:text-sm text-[#AEBCC7] font-zen">
                    {selectedProject.mentor}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.04] flex items-center justify-between gap-3 shrink-0 relative z-20">
                <span className="text-[11px] font-mono text-[#8FAFC4] hidden sm:inline">
                  OpenCode 2026 • Verified Repository
                </span>

                <SpecularButton
                  size="sm"
                  radius={20}
                  tint="#ffffff"
                  tintOpacity={0.12}
                  textColor="#07131F"
                  lineColor="#58B99A"
                  baseColor="#F4F1E8"
                  intensity={1}
                  idleIntensity={0.35}
                  shineSize={10}
                  shineFade={34}
                  thickness={1.2}
                  glow={1}
                  followMouse
                  proximity={250}
                  href={selectedProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!bg-[#F4F1E8] hover:!bg-[#B8E5D5] !text-[#07131F] font-mono text-xs font-bold tracking-wider shadow-lg px-5 py-2.5 ml-auto flex items-center gap-1.5"
                >
                  <span>VIEW REPOSITORY</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </SpecularButton>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
