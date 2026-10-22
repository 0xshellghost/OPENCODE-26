"use client";

import React, { useState, useEffect } from "react";
import { motion, useViewportScroll, useSpring } from "framer-motion";

interface JourneyStage {
  id: string;
  step: string;
  title: string;
  desc: string;
  targetId: string;
}

const STAGES: JourneyStage[] = [
  {
    id: "tradition",
    step: "01",
    title: "Tradition",
    desc: "Heritage & Foundational Ethos",
    targetId: "about",
  },
  {
    id: "exploration",
    step: "02",
    title: "Exploration",
    desc: "Tasks, Tracks & Mentorship",
    targetId: "how-it-works",
  },
  {
    id: "discovery",
    step: "03",
    title: "Discovery",
    desc: "Real-World Repositories",
    targetId: "projects",
  },
  {
    id: "community",
    step: "04",
    title: "Community",
    desc: "Student Voices & Stories",
    targetId: "testimonials",
  },
  {
    id: "opensource",
    step: "05",
    title: "Open Source",
    desc: "Global Community Ecosystem",
    targetId: "faq",
  },
];

export default function GlobalJourney() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Global document scroll tracking using Framer Motion v4 useViewportScroll
  const { scrollYProgress } = useViewportScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 26,
    restDelta: 0.001,
  });

  // Track active section as user scrolls through the site
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;

      // Reveal quietly after user scrolls past top of hero
      setIsVisible(scrollY > 120);

      const viewCenter = scrollY + windowH * 0.35;

      const mapping = [
        { id: "hero", index: 0 },
        { id: "stats", index: 0 },
        { id: "about", index: 0 },
        { id: "how-it-works", index: 1 },
        { id: "projects", index: 2 },
        { id: "testimonials", index: 3 },
        { id: "faq", index: 4 },
        { id: "footer", index: 4 },
      ];

      for (let i = mapping.length - 1; i >= 0; i--) {
        const el = document.getElementById(mapping[i].id);
        if (el) {
          const top = el.offsetTop;
          if (viewCenter >= top - 60) {
            setActiveStageIndex(mapping[i].index);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToStage = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <aside
      aria-label="Journey index"
      className={`fixed left-5 lg:left-8 top-1/2 -translate-y-1/2 z-30 select-none pointer-events-none transition-all duration-700 hidden lg:block ${
        isVisible ? "opacity-75 hover:opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Top subtle moonlit seal knot */}
        <div className="w-1.5 h-1.5 rounded-full bg-[#B8E5D5]/50 mb-2" />

        {/* Quiet vertical thread track */}
        <div className="relative w-[1px] h-[340px] bg-[#8FAFC4]/15">
          {/* Illuminated thread progress */}
          <motion.div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#B8E5D5]/70 via-[#AEBCC7]/60 to-[#B8E5D5]/80 origin-top"
            style={{
              scaleY: smoothProgress,
              height: "100%",
            }}
          />

          {/* Stages positioned along the vertical thread */}
          {STAGES.map((stage, idx) => {
            const isActive = activeStageIndex === idx;
            const isPast = activeStageIndex > idx;
            const isHovered = hoveredIndex === idx;
            const topPercent = (idx / (STAGES.length - 1)) * 100;

            return (
              <div
                key={stage.id}
                style={{ top: `${topPercent}%` }}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => scrollToStage(stage.targetId)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  aria-label={`Go to ${stage.title}`}
                  className="group relative flex items-center justify-center p-1.5 cursor-pointer focus:outline-none"
                >
                  {/* Quiet pearl node dot */}
                  <div
                    className={`rounded-full transition-all duration-500 ${
                      isActive
                        ? "w-2.5 h-2.5 bg-[#B8E5D5] ring-2 ring-[#B8E5D5]/30 ring-offset-2 ring-offset-[#07131F]"
                        : isPast
                        ? "w-1.5 h-1.5 bg-[#8FAFC4]/70"
                        : "w-1.5 h-1.5 bg-[#8FAFC4]/25 group-hover:bg-[#8FAFC4]/60 group-hover:scale-125"
                    }`}
                  />

                  {/* Stage Label: Clean English typography */}
                  <div
                    className={`absolute left-5 flex items-center gap-1.5 pl-2 transition-all duration-300 pointer-events-none whitespace-nowrap ${
                      isActive || isHovered
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-1"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-[#8FAFC4]/60">
                      {stage.step}
                    </span>
                    <span className="text-[#8FAFC4]/30 text-[10px]">·</span>
                    <span
                      className={`text-xs font-cormorant tracking-widest uppercase transition-colors ${
                        isActive
                          ? "text-[#F4F1E8] font-semibold"
                          : "text-[#AEBCC7]/70"
                      }`}
                    >
                      {stage.title}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom subtle ink drop mark */}
        <div className="w-1 h-1 rounded-full bg-[#8FAFC4]/30 mt-2" />
      </div>
    </aside>
  );
}
