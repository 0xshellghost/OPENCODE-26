/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Code,
  GitPullRequest,
  Trophy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BlurText from "./BlurText";

const SafeAnimatePresence = AnimatePresence as React.FC<React.PropsWithChildren<any>>;

const contributorSteps = [
  {
    number: "01",
    icon: Search,
    title: "Claim Issue",
    description:
      "Browse our curated repositories and find an issue that excites you. From starter-friendly 'good-first-issue' tags to complex architectural features, pick what challenges you most.",
  },
  {
    number: "02",
    icon: Code,
    title: "Solve & Collaborate",
    description:
      "Dive into the codebase with confidence. Maintainers and peers are actively available in dedicated Discord channels to brainstorm approaches, troubleshoot blockers, and review logic.",
  },
  {
    number: "03",
    icon: GitPullRequest,
    title: "Submit PR",
    description:
      "Push clean commits and open your Pull Request. Experience professional code review, learn automated CI/CD practices, and refine your code to meet production repository standards.",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Climb Leaderboard",
    description:
      "Watch your PR get merged! Points are automatically allocated to your profile on the live leaderboard. Compete with builders nationwide for cash prizes, swag kits, and certificates.",
  },
];

interface Dimensions {
  rx: number;
  ry: number;
  cardW: number;
  cardH: number;
  isMobile: boolean;
  isTablet: boolean;
}

// Shortest signed angular delta between two angles (in radians)
function getShortestAngleDelta(from: number, to: number) {
  const diff = (to - from) % (2 * Math.PI);
  return ((diff + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
}

/**
 * Photorealistic Celestial Moon with Volumetric Light & Dotted Orbit Rings
 * Uses authentic transparent astronomical lunar photography (/images/realistic-moon-transparent.png)
 * Concentric dotted and dashed celestial orbits around the moon.
 * No black borders, no dark circles, no sticker effect.
 * Features "OpenCode Journey" caption below the moon.
 */
function RealisticMoon({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none pointer-events-none ${className}`}>
      {/* Moon Orb & Dotted Orbit Rings Container (perfectly concentric) */}
      <div className="relative w-22 h-22 sm:w-28 sm:h-28 flex items-center justify-center">
        {/* 1. Deep Atmospheric Moonlight Bloom */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.4, 0.65, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-56 h-56 sm:w-68 sm:h-68 rounded-full bg-[radial-gradient(circle,rgba(244,241,232,0.38)_0%,rgba(184,229,213,0.18)_38%,rgba(88,185,154,0.06)_55%,transparent_75%)] filter blur-2xl"
        />

        {/* 2. Dotted & Dashed Circular Orbits around the Moon */}
        <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-dashed border-[#58B99A]/30 animate-[spin_120s_linear_infinite] pointer-events-none" />
        <div className="absolute w-34 h-34 sm:w-42 sm:h-42 rounded-full border border-dotted border-[#B8E5D5]/25 animate-[spin_90s_linear_infinite_reverse] pointer-events-none" />

        {/* 3. Core Lunar Light Corona */}
        <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.55)_0%,rgba(244,241,232,0.25)_45%,transparent_70%)] filter blur-md" />

        {/* 4. The Pure Transparent Photorealistic Moon (Zero black borders) */}
        <img
          src="/images/realistic-moon-transparent.png"
          alt="Luminous Moon"
          className="w-full h-full object-contain drop-shadow-[0_0_18px_rgba(244,241,232,0.65)] drop-shadow-[0_0_40px_rgba(184,229,213,0.35)] pointer-events-none select-none"
        />
      </div>

      {/* 5. Text below Moon: OpenCode Journey */}
      <div className="mt-2.5 sm:mt-3 text-center">
        <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#F4F1E8] font-zen drop-shadow-[0_2px_8px_rgba(7,19,31,0.95)]">
          OpenCode Journey
        </span>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);

  const [dimensions, setDimensions] = useState<Dimensions>({
    rx: 380,
    ry: 165,
    cardW: 310,
    cardH: 250,
    isMobile: false,
    isTablet: false,
  });

  const steps = contributorSteps;

  // Refs for continuous 60fps RAF orbit
  const angleRef = useRef<number>(Math.PI / 2); // Initial angle has Card 0 at front (bottom)
  const targetAngleRef = useRef<number | null>(null);
  const isHoveredRef = useRef<boolean>(false);
  const pauseUntilRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reqIdRef = useRef<number | null>(null);

  // Responsive geometry updater
  const updateDimensions = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    if (w < 768) {
      setDimensions({
        rx: 0,
        ry: 0,
        cardW: 0,
        cardH: 0,
        isMobile: true,
        isTablet: false,
      });
    } else if (w < 1024) {
      setDimensions({
        rx: 230,
        ry: 135,
        cardW: 245,
        cardH: 245,
        isMobile: false,
        isTablet: true,
      });
    } else if (w < 1280) {
      setDimensions({
        rx: 330,
        ry: 155,
        cardW: 280,
        cardH: 250,
        isMobile: false,
        isTablet: false,
      });
    } else {
      setDimensions({
        rx: 380,
        ry: 165,
        cardW: 310,
        cardH: 250,
        isMobile: false,
        isTablet: false,
      });
    }
  }, []);

  useEffect(() => {
    const animId = requestAnimationFrame(() => {
      updateDimensions();
    });
    window.addEventListener("resize", updateDimensions);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

  // Smooth ease-out rotation to bring card k to the front
  const rotateToCard = useCallback((k: number) => {
    // Front position is theta = PI/2 (at bottom y = +Ry)
    // Card k's angle is theta_k = angle + k * (PI / 2)
    // So target angle = PI/2 - k * (PI / 2)
    const target = Math.PI / 2 - (k * Math.PI) / 2;
    targetAngleRef.current = target;
    pauseUntilRef.current = Date.now() + 1800; // Pause briefly for 1.8s then resume revolving
  }, []);

  // Continuous 60fps RAF orbital animation loop
  useEffect(() => {
    if (dimensions.isMobile) return;

    const animate = () => {
      const now = Date.now();

      // If transitioning to a target card
      if (targetAngleRef.current !== null) {
        const delta = getShortestAngleDelta(angleRef.current, targetAngleRef.current);
        if (Math.abs(delta) > 0.002) {
          angleRef.current += delta * 0.095; // Critically damped ease-out glide along the ellipse
        } else {
          angleRef.current = targetAngleRef.current;
          targetAngleRef.current = null;
          pauseUntilRef.current = now + 1800; // 1.8s brief pause after landing in front before resuming orbit
        }
      } else if (!isHoveredRef.current && now > pauseUntilRef.current) {
        // Continuous, majestic orbital drift (pauses when user hovers a card)
        angleRef.current += 0.0024;
      }

      const currentAngle = angleRef.current;
      let bestDist = Infinity;
      let currentFront = 0;

      // Update card transforms directly on DOM elements for 60/120fps zero-lag execution
      for (let i = 0; i < 4; i++) {
        const cardEl = cardRefs.current[i];
        if (!cardEl) continue;

        // Card angle along the ellipse
        const theta = currentAngle + (i * Math.PI) / 2;

        // Coordinates along the ellipse
        const x = dimensions.rx * Math.cos(theta);
        const y = dimensions.ry * Math.sin(theta);

        // Depth factor d in [0, 1] based on vertical perspective sin(theta)
        const sinVal = Math.sin(theta);
        const d = (sinVal + 1) / 2; // 1 at front (bottom), 0 at back (top)

        // Track closest card to front (theta = PI/2)
        const distToFront = Math.abs(getShortestAngleDelta(theta, Math.PI / 2));
        if (distToFront < bestDist) {
          bestDist = distToFront;
          currentFront = i;
        }

        const scale = dimensions.isTablet
          ? 0.74 + (1.02 - 0.74) * d
          : 0.76 + (1.05 - 0.76) * d;

        const opacity = 0.5 + (1.0 - 0.5) * d;
        const zIndex = Math.round(10 + 20 * d);

        // Hardware-accelerated GPU transform
        cardEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        cardEl.style.opacity = `${opacity}`;
        cardEl.style.zIndex = `${zIndex}`;

        // Dynamic styling for active vs background cards
        const isFrontCard = distToFront < 0.28;
        if (isFrontCard) {
          cardEl.style.borderColor = "rgba(88, 185, 154, 0.65)";
          cardEl.style.boxShadow =
            "0 20px 50px -15px rgba(7,19,31,0.95), 0 0 35px rgba(88,185,154,0.25)";
          cardEl.style.cursor = "default";
        } else {
          cardEl.style.borderColor = "rgba(174, 188, 199, 0.2)";
          cardEl.style.boxShadow = "0 12px 30px -10px rgba(7,19,31,0.85)";
          cardEl.style.cursor = "pointer";
        }
      }

      if (currentFront !== activeIndexRef.current) {
        activeIndexRef.current = currentFront;
        setActiveIndex(currentFront);
      }

      reqIdRef.current = requestAnimationFrame(animate);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [dimensions.isMobile, dimensions.rx, dimensions.ry, dimensions.isTablet]);

  return (
    <section
      id="how-it-works"
      className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 bg-[#0B1C2A] scroll-mt-20 overflow-hidden"
    >
      {/* =========================================================================
          ATMOSPHERIC JAPANESE NIGHT LANDSCAPE BACKGROUND
          Matching the exact opacity, darkness, and aesthetic of the About section.
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Japanese Moonlit Mountain Landscape Artwork */}
        <img
          src="/images/how-it-works-bg.png"
          alt="Japanese Moonlit Mountain Pathway"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 sm:opacity-60 scale-105 pointer-events-none transition-opacity"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
          }}
        />

        {/* Deep Dark Indigo/Navy overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1C2A]/90 via-[#0B1C2A]/60 to-[#0B1C2A]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[#0B1C2A]/30 pointer-events-none" />

        {/* Ambient Ground Mist drifting softly */}
        <motion.div
          animate={{ x: [-25, 25, -25], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 bottom-12 h-44 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(143,175,196,0.18),transparent_75%)] pointer-events-none"
        />

        {/* Seamless Environmental Transitions at Top & Bottom (Cascading into #07131F) */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#0B1C2A] via-[#0B1C2A]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent via-[#081827]/70 to-[#07131F] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(88,185,154,0.06)_0%,transparent_75%)] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#F4F1E8] tracking-tight font-zen"
          >
            How{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F4F1E8] via-[#D9E2E8] to-[#B8E5D5]">
              OpenCode Works
            </span>
          </h2>

          <div className="mt-3">
            <BlurText
              text="From finding your first beginner issue to shipping production code and climbing the leaderboard, OpenCode is structured for maximum impact."
              className="text-base sm:text-lg text-[#AEBCC7] leading-relaxed justify-center text-center"
              delay={25}
            />
          </div>
        </div>

        {/* =========================================================================
            CINEMATIC CONTINUOUS ORBITAL JOURNEY COMPOSITION
            Desktop & Tablet: Real-time 60fps orbital physics with Realistic Moon
            ========================================================================= */}
        {!dimensions.isMobile ? (
          <div className="relative w-full max-w-6xl mx-auto h-[570px] sm:h-[620px] select-none">
            {/* Faint Glowing Orbital Elliptical Path behind cards */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
              viewBox="0 0 1000 620"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="journeyOrbitalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#58B99A" stopOpacity="0.38" />
                  <stop offset="30%" stopColor="#8FAFC4" stopOpacity="0.18" />
                  <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.32" />
                  <stop offset="70%" stopColor="#8FAFC4" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#58B99A" stopOpacity="0.38" />
                </linearGradient>
                <filter id="journeyGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Faint ambient glow halo along the orbital path */}
              <ellipse
                cx="500"
                cy="310"
                rx={dimensions.rx}
                ry={dimensions.ry}
                fill="none"
                stroke="url(#journeyOrbitalGrad)"
                strokeWidth="4"
                opacity="0.3"
                filter="url(#journeyGlow)"
              />

              {/* Precise dashed orbital track */}
              <ellipse
                cx="500"
                cy="310"
                rx={dimensions.rx}
                ry={dimensions.ry}
                fill="none"
                stroke="url(#journeyOrbitalGrad)"
                strokeWidth="1.5"
                strokeDasharray="6 10"
                opacity="0.65"
              />
            </svg>

            {/* Central Visual: Realistic Moon with English Typography */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15">
              <RealisticMoon />
            </div>

            {/* Continuous Orbiting Cards */}
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  onClick={() => rotateToCard(index)}
                  style={{
                    width: dimensions.cardW,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: -dimensions.cardH / 2,
                    marginLeft: -dimensions.cardW / 2,
                    willChange: "transform, opacity",
                  }}
                  className="rounded-2xl p-5 sm:p-6 select-none border transition-colors duration-300 bg-gradient-to-b from-[#102535]/92 via-[#0D2233]/88 to-[#07131F]/95 backdrop-blur-xl group"
                >
                  {/* Top Sheen Line */}
                  <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#B8E5D5]/80 to-transparent rounded-t-2xl pointer-events-none" />

                  <div className="relative z-10">
                    {/* Header: Icon + Non-overlapping Step Number */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#0B1C2A]/90 border border-[#8FAFC4]/25 text-[#58B99A] group-hover:text-[#B8E5D5] group-hover:border-[#58B99A]/60 flex items-center justify-center transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Clean Number without overlapping step text */}
                      <span className="px-3 py-1 rounded-lg text-sm font-mono font-bold tracking-wider text-[#B8E5D5] bg-[#102535]/80 border border-[#58B99A]/40 shadow-[0_0_10px_rgba(88,185,154,0.2)]">
                        {step.number}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-[#F4F1E8] group-hover:text-[#B8E5D5] transition-colors font-zen tracking-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#AEBCC7] leading-relaxed line-clamp-4">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             MOBILE RESPONSIVE JOURNEY: Controlled Stacked/Interactive Carousel
             Preserves the Realistic Moon & Clean Numbering on Mobile
             ========================================================================= */
          <div className="max-w-md mx-auto">
            {/* Realistic Moon Header on Mobile */}
            <div className="mb-6 pt-2">
              <RealisticMoon />
            </div>

            {/* Active Card with Swipe Gesture Support */}
            <div className="relative min-h-[290px]">
              <SafeAnimatePresence exitBeforeEnter>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.28 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_e, { offset, velocity }) => {
                    const swipe = offset.x;
                    if (swipe < -40 || velocity.x < -300) {
                      rotateToCard((activeIndex + 1) % steps.length);
                    } else if (swipe > 40 || velocity.x > 300) {
                      rotateToCard((activeIndex - 1 + steps.length) % steps.length);
                    }
                  }}
                  className="rounded-2xl border border-[#58B99A]/60 bg-gradient-to-b from-[#102535]/92 via-[#0D2233]/88 to-[#07131F]/95 p-6 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(7,19,31,0.95),0_0_30px_rgba(88,185,154,0.2)] select-none"
                >
                  {/* Top Sheen */}
                  <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#B8E5D5]/80 to-transparent rounded-t-2xl pointer-events-none" />

                  {(() => {
                    const StepIcon = steps[activeIndex].icon;
                    return (
                      <div className="relative z-10">
                        {/* Header: Icon + Non-overlapping Step Number */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl bg-[#0B1C2A]/90 border border-[#58B99A]/60 text-[#B8E5D5] flex items-center justify-center shadow-[0_0_15px_rgba(88,185,154,0.25)]">
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <span className="px-3 py-1 rounded-lg text-sm font-mono font-bold tracking-wider text-[#B8E5D5] bg-[#102535]/80 border border-[#58B99A]/40 shadow-[0_0_10px_rgba(88,185,154,0.2)]">
                            {steps[activeIndex].number}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-[#F4F1E8] font-zen tracking-tight">
                          {steps[activeIndex].title}
                        </h3>

                        <p className="text-sm text-[#AEBCC7] leading-relaxed">
                          {steps[activeIndex].description}
                        </p>
                      </div>
                    );
                  })()}
                </motion.div>
              </SafeAnimatePresence>
            </div>
          </div>
        )}

        {/* =========================================================================
            NAVIGATION CONTROLS: Increased distance below cards with instruction to the right
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-12 sm:mt-16 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => rotateToCard((activeIndex - 1 + steps.length) % steps.length)}
                className="p-2 sm:p-2.5 rounded-full bg-[#102535]/85 hover:bg-[#153045] border border-[#8FAFC4]/25 hover:border-[#58B99A]/60 text-[#AEBCC7] hover:text-[#B8E5D5] transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => rotateToCard((activeIndex + 1) % steps.length)}
                className="p-2 sm:p-2.5 rounded-full bg-[#102535]/85 hover:bg-[#153045] border border-[#8FAFC4]/25 hover:border-[#58B99A]/60 text-[#AEBCC7] hover:text-[#B8E5D5] transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Next step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs sm:text-sm font-mono text-[#AEBCC7] select-none px-3.5 py-1.5 rounded-full bg-[#102535]/70 border border-[#8FAFC4]/25 shadow-sm backdrop-blur-md">
              Step <span className="text-[#B8E5D5] font-bold">{activeIndex + 1}</span> of{" "}
              {steps.length}
            </span>
          </div>

          {/* Instruction to the right of arrows on desktop/tablet */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#8FAFC4]/80 font-mono tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58B99A]/80 animate-pulse" />
            <span>Click on any card to bring it in front</span>
          </div>
        </div>

        {/* =========================================================================
            CONTEXTUAL CALL TO ACTION
            ========================================================================= */}
        <div className="mt-12 sm:mt-14 text-center">
          <a
            href="https://discord.gg/SxBATvUPnC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#B8E5D5] hover:bg-[#A3DAC7] px-7 py-3 text-sm font-semibold text-[#0C1C2C] shadow-lg shadow-[#58B99A]/20 transition-all cursor-pointer font-zen"
          >
            Get Started on Discord
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Seamless Atmosphere Transition Overlay into Projects (#07131F) */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#07131F]/50 to-[#07131F] pointer-events-none z-20" />
    </section>
  );
}
