/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { testimonialsData, TestimonialItem } from "../data/testimonialsData";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Briefcase,
  Compass,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import SakuraCanvas from "./SakuraCanvas";

const filterCategories = ["All Stories", "Winner", "Internship", "Mentor"] as const;

export function Testimonials() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Stories");
  const [isAutoDrifting] = useState<boolean>(true);

  const reelRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef<boolean>(false);
  const isTouchingRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftStartRef = useRef<number>(0);
  const dragDistanceRef = useRef<number>(0);

  // Filter stories based on selected pill
  const filteredStories = useMemo(() => {
    return testimonialsData.filter((item) => {
      if (selectedCategory === "All Stories") return true;
      return item.tag === selectedCategory;
    });
  }, [selectedCategory]);

  // For the continuous infinite cinematic reel, repeat items 3 times so wrapping is completely seamless
  const reelStories = useMemo(() => {
    if (filteredStories.length === 0) return [];
    // Ensure sufficient width for seamless infinite loop on ultra-wide screens
    const repeats = Math.max(3, Math.ceil(9 / filteredStories.length));
    return Array.from({ length: repeats }, () => filteredStories).flat();
  }, [filteredStories]);

  // Center the scroll track when category changes
  useEffect(() => {
    if (reelRef.current) {
      const el = reelRef.current;
      requestAnimationFrame(() => {
        if (!el) return;
        const totalSets = reelStories.length / (filteredStories.length || 1);
        const oneSetWidth = el.scrollWidth / totalSets;
        if (oneSetWidth > 0) {
          el.scrollLeft = oneSetWidth;
        }
      });
    }
  }, [selectedCategory, filteredStories.length, reelStories.length]);

  const isManualScrollingRef = useRef<boolean>(false);
  const manualScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth continuous cinematic auto-drift via requestAnimationFrame
  useEffect(() => {
    const el = reelRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (
        isAutoDrifting &&
        !isHoveredRef.current &&
        !isTouchingRef.current &&
        !isDraggingRef.current &&
        !isManualScrollingRef.current &&
        el
      ) {
        const totalSets = reelStories.length / (filteredStories.length || 1);
        const oneSetWidth = el.scrollWidth / totalSets;
        if (oneSetWidth > 0) {
          // Slow, elegant cinematic drifting (~30px per sec)
          el.scrollLeft += delta * 30;

          // Seamless wrapping
          if (el.scrollLeft >= oneSetWidth * (totalSets - 1)) {
            el.scrollLeft -= oneSetWidth;
          } else if (el.scrollLeft <= oneSetWidth * 0.1) {
            el.scrollLeft += oneSetWidth;
          }
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      if (manualScrollTimerRef.current) {
        clearTimeout(manualScrollTimerRef.current);
      }
    };
  }, [isAutoDrifting, filteredStories.length, reelStories.length]);

  // Manual scroll controls with smooth scroll and auto-drift pause
  const scrollNext = () => {
    const el = reelRef.current;
    if (!el) return;

    // Pause auto-drift while smooth manual scrolling executes
    isManualScrollingRef.current = true;
    if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1200);

    const item = el.querySelector<HTMLElement>("[data-reel-item]");
    const shift = item ? item.offsetWidth + 32 : 620;

    const totalSets = reelStories.length / (filteredStories.length || 1);
    const oneSetWidth = el.scrollWidth / totalSets;
    if (oneSetWidth > 0 && el.scrollLeft >= oneSetWidth * (totalSets - 1.2)) {
      el.scrollLeft -= oneSetWidth;
    }

    el.scrollBy({ left: shift, behavior: "smooth" });
  };

  const scrollPrev = () => {
    const el = reelRef.current;
    if (!el) return;

    // Pause auto-drift while smooth manual scrolling executes
    isManualScrollingRef.current = true;
    if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1200);

    const item = el.querySelector<HTMLElement>("[data-reel-item]");
    const shift = item ? item.offsetWidth + 32 : 620;

    const totalSets = reelStories.length / (filteredStories.length || 1);
    const oneSetWidth = el.scrollWidth / totalSets;
    if (oneSetWidth > 0 && el.scrollLeft <= oneSetWidth * 0.2) {
      el.scrollLeft += oneSetWidth;
    }

    el.scrollBy({ left: -shift, behavior: "smooth" });
  };

  // Mouse Drag to scroll (cinematic filmstrip scrubbing)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!reelRef.current) return;
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    startXRef.current = e.pageX - reelRef.current.offsetLeft;
    scrollLeftStartRef.current = reelRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !reelRef.current) return;
    e.preventDefault();
    const x = e.pageX - reelRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    dragDistanceRef.current += Math.abs(walk);
    reelRef.current.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Tag configuration helper
  const getTagMeta = (tag: TestimonialItem["tag"]) => {
    switch (tag) {
      case "Winner":
        return {
          icon: Trophy,
          badgeColor: "text-[#58B99A]",
          border: "border-[#58B99A]/30",
          bg: "bg-[#58B99A]/15",
          label: "Leaderboard Champion",
        };
      case "Internship":
        return {
          icon: Briefcase,
          badgeColor: "text-[#38BDF8]",
          border: "border-[#38BDF8]/30",
          bg: "bg-[#38BDF8]/15",
          label: "Career Milestone",
        };
      case "Mentor":
        return {
          icon: Compass,
          badgeColor: "text-[#C084FC]",
          border: "border-[#C084FC]/30",
          bg: "bg-[#C084FC]/15",
          label: "Guiding Light",
        };
      case "Partner":
        return {
          icon: Sparkles,
          badgeColor: "text-[#FCD34D]",
          border: "border-[#FCD34D]/30",
          bg: "bg-[#FCD34D]/15",
          label: "Ecosystem Partner",
        };
      default:
        return {
          icon: Sparkles,
          badgeColor: "text-[#B8E5D5]",
          border: "border-[#B8E5D5]/30",
          bg: "bg-[#B8E5D5]/15",
          label: "Contributor",
        };
    }
  };

  return (
    <section
      id="testimonials"
      className="relative w-full py-24 sm:py-32 bg-[#07131F] border-b border-[#AEBCC7]/15 scroll-mt-20 overflow-hidden select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. Japanese Night Atmosphere & Full-Bleed Landscape Scenery
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Full-bleed Japanese Mountain Pagoda Night Landscape Artwork */}
        <img
          src="/images/japanese-pagoda.jpg"
          alt="Japanese Pagoda Night Landscape"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 sm:opacity-55 scale-105 pointer-events-none transition-opacity duration-700"
        />

        {/* Deep Dark Indigo / Navy Gradient Tints — keeps text ultra-readable while landscape shines through */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07131F]/90 via-[#07131F]/65 to-[#07131F]/95 pointer-events-none" />
        <div className="absolute inset-0 bg-[#07131F]/30 pointer-events-none" />

        {/* Lunar Light Glow Bloom in Upper Sky */}
        <div className="absolute top-6 right-[15%] w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(244,241,232,0.18)_0%,rgba(184,229,213,0.08)_40%,transparent_70%)] filter blur-3xl pointer-events-none" />

        {/* Ambient Ground Mist & Mountain Fog Layers drifting softly */}
        <motion.div
          animate={{ x: [-30, 30, -30], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 bottom-10 h-64 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(143,175,196,0.2),transparent_75%)] pointer-events-none"
        />
        <motion.div
          animate={{ x: [25, -25, 25], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 top-1/3 h-52 bg-[radial-gradient(ellipse_75%_50%_at_60%_50%,rgba(88,185,154,0.12),transparent_70%)] pointer-events-none"
        />

        {/* Seamless Top & Bottom Transition Gradients to neighboring sections */}
        <div className="absolute inset-x-0 top-0 h-56 sm:h-72 bg-gradient-to-b from-[#07131F] via-[#07131F]/95 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(88,185,154,0.06),transparent_75%)] pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#07131F] via-[#07131F]/80 to-transparent pointer-events-none z-10" />

        {/* Drifting Cherry Blossom Petals */}
        <SakuraCanvas
          active={true}
          position="absolute"
          petalCount={24}
          className="opacity-45 pointer-events-none z-1"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Section Header & Japanese Memoir Framing
      ───────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-4">
          {/* Heading */}
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#F4F1E8] tracking-tight font-cormorant text-center"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F4F1E8] via-[#D9E2E8] to-[#B8E5D5]">
              Echoes of the OpenCode Journey
            </span>
          </h2>

          {/* Subtitle - Centered */}
          <div className="mt-3 flex justify-center text-center">
            <p
              className="text-base sm:text-lg text-[#AEBCC7] max-w-2xl mx-auto leading-relaxed font-sans text-center"
            >
              Stories, breakthroughs, and milestones from developers, winners, and mentors who ventured through OpenCode.
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. Category Filters Navbar (Centered)
        ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10 max-w-4xl mx-auto">
          {filterCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "text-[#0C1C2C]"
                    : "text-[#AEBCC7] hover:text-[#F4F1E8] bg-[#102535]/55 border border-[#AEBCC7]/15 hover:border-[#58B99A]/45"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="testimonialFilterTab"
                    className="absolute inset-0 rounded-full bg-[#B8E5D5] shadow-md shadow-[#58B99A]/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Cinematic Horizontal Reel View (Only View)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden group/reel my-4">
          {/* Navigation Controls: Arrows together with "click to drift" text on their right, positioned on the right */}
          <div
            onMouseEnter={() => {
              isHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
            }}
            className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 select-none"
          >
            <div className="flex items-center justify-end gap-5 sm:gap-6">
              {/* Arrows together */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="p-2 sm:p-2.5 rounded-full bg-[#0B1C2A]/80 border border-[#8FAFC4]/25 hover:border-[#58B99A]/60 text-[#AEBCC7] hover:text-[#F4F1E8] hover:bg-[#58B99A]/15 transition-all cursor-pointer active:scale-95 shadow-md shadow-[#07131F]/50"
                  aria-label="Previous Memoir"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollNext}
                  className="p-2 sm:p-2.5 rounded-full bg-[#0B1C2A]/80 border border-[#8FAFC4]/25 hover:border-[#58B99A]/60 text-[#AEBCC7] hover:text-[#F4F1E8] hover:bg-[#58B99A]/15 transition-all cursor-pointer active:scale-95 shadow-md shadow-[#07131F]/50"
                  aria-label="Next Memoir"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Drift text on the right with comfortable gap */}
              <span
                onClick={scrollNext}
                className="text-xs sm:text-sm text-[#8FAFC4] hover:text-[#B8E5D5] font-zen tracking-wider cursor-pointer transition-colors"
              >
                click to drift
              </span>
            </div>
          </div>

          {/* Left & Right Panoramic Edge Fade Masks */}
          <div className="pointer-events-none absolute left-0 top-12 bottom-12 w-8 sm:w-28 md:w-40 bg-gradient-to-r from-[#07131F] via-[#07131F]/80 to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-12 bottom-12 w-8 sm:w-28 md:w-40 bg-gradient-to-l from-[#07131F] via-[#07131F]/80 to-transparent z-20" />

          {/* The Horizontal Reel Scroll Track */}
          <div
            ref={reelRef}
            onMouseEnter={() => {
              isHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
              handleMouseUpOrLeave();
            }}
            onTouchStart={() => {
              isTouchingRef.current = true;
            }}
            onTouchEnd={() => {
              isTouchingRef.current = false;
            }}
            onTouchCancel={() => {
              isTouchingRef.current = false;
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            className="flex items-stretch gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-6 px-6 sm:px-16 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {reelStories.map((item: TestimonialItem, idx: number) => {
              const tagConfig = getTagMeta(item.tag);
              const TagIcon = tagConfig.icon;

              return (
                <div
                  key={`${item.id}-reel-${idx}`}
                  data-reel-item
                  className="relative w-[85vw] sm:w-[500px] md:w-[580px] lg:w-[640px] shrink-0 snap-center rounded-2xl sm:rounded-3xl border border-[#8FAFC4]/20 hover:border-[#58B99A]/50 bg-gradient-to-br from-[#0B1C2A]/85 via-[#0E2235]/70 to-[#07131F]/90 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(7,19,31,0.9),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:shadow-[0_24px_60px_-10px_rgba(88,185,154,0.22),0_0_35px_rgba(139,92,246,0.18)] hover:-translate-y-1 transition-all duration-500 overflow-hidden group select-none min-h-[300px] sm:min-h-[320px]"
                >
                  {/* Subtle Japanese landscape texture watermark inside panel */}
                  <div className="absolute inset-0 rounded-[inherit] bg-[url('/images/japanese-theme-1.jpg')] bg-cover bg-center opacity-[0.04] mix-blend-luminosity pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-700" />

                  {/* Soft ambient violet & cyan radial glow in corners */}
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#58B99A]/15 to-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                  <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-[#38BDF8]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                  {/* Top Row: Category Tag + Monumental Quote Glyph */}
                  <div className="relative z-10 flex items-start justify-between gap-4 mb-2 sm:mb-2.5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {/* Category Tag Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tagConfig.bg} ${tagConfig.border} ${tagConfig.badgeColor}`}
                      >
                        <TagIcon className="w-3 h-3" />
                        <span>{item.tag}</span>
                      </span>
                    </div>

                    {/* Large Quotation Typography */}
                    <div className="relative font-cormorant text-5xl sm:text-6xl text-[#58B99A]/30 group-hover:text-[#58B99A]/50 transition-colors leading-none select-none font-serif shrink-0 -mt-2 -mr-1">
                      “
                    </div>
                  </div>

                  {/* Middle Body: The Memoir Quote - brought upwards into optical center of card */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center -mt-3.5 sm:-mt-5 mb-1.5 sm:mb-2">
                    <p className="font-zen text-sm sm:text-base md:text-lg lg:text-[19px] text-[#F4F1E8]/95 leading-relaxed font-normal">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Bottom Row: Author profile & Achievement metadata */}
                  <div className="relative z-10 pt-4 sm:pt-5 border-t border-[#8FAFC4]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mt-3">
                    {/* Author Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#58B99A]/50 ring-2 ring-[#07131F] shadow-md shrink-0">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          className="object-cover pointer-events-none"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-[#F4F1E8] group-hover:text-[#B8E5D5] transition-colors truncate font-zen">
                          {item.name}
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#8FAFC4] font-medium truncate font-zen">
                          {item.company || item.role}
                        </p>
                      </div>
                    </div>

                    {/* Right: Milestone Pill & Profile Link */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {item.prsOrPoints && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#07131F]/80 border border-[#8FAFC4]/25 text-[#B8E5D5] text-xs font-semibold shadow-inner">
                          <Sparkles className="w-3 h-3 text-[#58B99A]" />
                          <span>{item.prsOrPoints}</span>
                        </span>
                      )}

                      {/* External Link button */}
                      <a
                        href={item.blogUrl || "https://github.com/opencodeiiita"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (dragDistanceRef.current > 6) e.preventDefault();
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-[#07131F]/80 hover:bg-[#58B99A]/20 border border-[#8FAFC4]/20 hover:border-[#58B99A]/50 text-[#8FAFC4] hover:text-[#B8E5D5] transition-all cursor-pointer"
                        title="View Story / Profile"
                        aria-label={`View story of ${item.name}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
    </section>
  );
}

export default Testimonials;
