/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GitPullRequest,
  Users,
  Trophy,
  HeartHandshake,
} from "lucide-react";
import BlurText from "./BlurText";
import SakuraCanvas from "./SakuraCanvas";

const highlights = [
  {
    icon: GitPullRequest,
    number: "01",
    badge: "Hands-on",
    tag: "Version Control",
    title: "Hands-on Production Git",
    description:
      "Move beyond toy tutorials. Participants clone real-world repositories, resolve authentic maintainer issues, and learn industrial git rebase and review workflows.",
  },
  {
    icon: Users,
    number: "02",
    badge: "Mentorship",
    tag: "Mentorship",
    title: "1-on-1 Senior Mentorship",
    description:
      "Every project is led by experienced maintainers, GSoC scholars, and IIITA alumni who provide line-by-line feedback on every submitted PR.",
  },
  {
    icon: Trophy,
    number: "03",
    badge: "Competition",
    tag: "Competition",
    title: "Gamified Leaderboard",
    description:
      "Real-time point scoring for merged contributions encourages consistent shipping while keeping the environment collaborative, supportive, and fun.",
  },
  {
    icon: HeartHandshake,
    number: "04",
    badge: "Future",
    tag: "Career Pipeline",
    title: "Career & Tech Pipeline",
    description:
      "High-velocity contributions showcase your real-world engineering skills, helping you stand out for summer internships and open source fellowships.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-24 sm:py-28 bg-[#07131F] scroll-mt-20 overflow-hidden"
    >
      {/* =========================================================================
          ATMOSPHERIC JAPANESE NIGHT LANDSCAPE
          Directly extends the physical scenery from the Hero section:
          Visible moonlit mountains, pagodas, village lanterns, mist, and sakura petals.
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Japanese Hero Landscape Image — seamless continuation from StatsRibbon */}
        <img
          src="/images/hero-japanese-bg.jpg"
          alt="Japanese Night Landscape"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 sm:opacity-60 scale-105 pointer-events-none transition-opacity"
        />

        {/* Deep Dark Indigo/Navy gradient tint — keeps text ultra-readable while landscape shines through */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07131F]/90 via-[#07131F]/60 to-[#07131F]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[#07131F]/30 pointer-events-none" />

        {/* Glowing Japanese Night Moon Haze in Upper Sky */}
        <div className="absolute top-8 right-10 sm:right-32 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-[radial-gradient(circle,rgba(244,241,232,0.25)_0%,rgba(184,229,213,0.12)_40%,transparent_70%)] filter blur-2xl pointer-events-none" />
        <div className="absolute top-14 right-16 sm:right-40 w-20 h-20 rounded-full bg-[#F4F1E8]/20 filter blur-sm pointer-events-none border border-[#F4F1E8]/15" />

        {/* Ambient Ground Mist & Mountain Fog Layers drifting softly */}
        <motion.div
          animate={{ x: [-35, 35, -35], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 bottom-10 h-52 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(143,175,196,0.22),transparent_75%)] pointer-events-none"
        />
        <motion.div
          animate={{ x: [30, -30, 30], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 bottom-28 h-40 bg-[radial-gradient(ellipse_60%_50%_at_30%_50%,rgba(88,185,154,0.16),transparent_70%)] pointer-events-none"
        />

        {/* Seamless Environmental Transition at bottom: dissolves into HowItWorks (#0B1C2A) */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 sm:h-64 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(7, 19, 31, 0.35) 25%, rgba(11, 28, 42, 0.85) 70%, #0B1C2A 100%)"
          }}
        />

        {/* Drifting Cherry Blossom Petals */}
        <SakuraCanvas
          active={true}
          position="absolute"
          petalCount={28}
          className="opacity-55 pointer-events-none z-1"
        />
      </div>

      {/* =========================================================================
          CONTENT CONTAINER
          ========================================================================= */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#F4F1E8] tracking-wide font-cormorant drop-shadow-[0_4px_30px_rgba(7,19,31,0.95)]"
          >
            About{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F4F1E8] via-[#D9E2E8] to-[#B8E5D5]">
              OpenCode
            </span>
          </h2>

          <div className="mt-4">
            <BlurText
              text="OpenCode is the annual month-long open source festival organized by GeekHaven, the official technical society of IIIT Allahabad. We bridge the gap between enthusiastic learners and production software engineering."
              className="text-base sm:text-lg text-[#AEBCC7] leading-relaxed font-zen max-w-2xl mx-auto drop-shadow-sm justify-center text-center"
              delay={25}
            />
          </div>
        </div>

        {/* Feature Highlights Grid (Floating Translucent Glass Panels) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 max-w-6xl mx-auto">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            const isStaggered = index % 2 === 1;

            return (
              <div
                key={item.title}
                className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-[#AEBCC7]/25 hover:border-[#58B99A]/70 bg-[#0C1F2E]/65 hover:bg-[#0E2638]/80 p-6 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_-15px_rgba(7,19,31,0.95),inset_0_1px_1px_rgba(255,255,255,0.14)] hover:shadow-[0_24px_60px_-15px_rgba(7,19,31,0.95),0_0_35px_rgba(88,185,154,0.22),0_0_15px_rgba(139,92,246,0.15)] hover:-translate-y-2 hover:scale-[1.015] transition-all duration-300 ${
                  isStaggered ? "lg:translate-y-3" : ""
                }`}
              >
                {/* Luminous Top Glass Highlight Line */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#B8E5D5]/50 to-transparent group-hover:via-[#58B99A]/90 transition-all duration-500 rounded-t-3xl" />

                {/* Soft Radial Ambient Glow on Hover */}
                <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_20%_20%,rgba(88,185,154,0.14),rgba(143,175,196,0.08),transparent_65%)] pointer-events-none" />

                {/* Background Watermark Index */}
                <div className="absolute top-4 right-5 text-4xl sm:text-5xl font-black font-mono text-[#8FAFC4]/15 group-hover:text-[#58B99A]/30 transition-colors pointer-events-none select-none">
                  {item.number}
                </div>

                <div>
                  {/* Top Header Pill with Kanji and Tag */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#102535] to-[#081521] border border-[#58B99A]/40 text-[#B8E5D5] flex items-center justify-center group-hover:scale-110 group-hover:border-[#58B99A] group-hover:shadow-[0_0_20px_rgba(88,185,154,0.35)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#102535]/80 border border-[#8FAFC4]/25 text-[10px] font-semibold text-[#B8E5D5] tracking-wider uppercase font-mono">
                      {item.badge}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#F4F1E8] mb-2.5 group-hover:text-[#B8E5D5] transition-colors font-zen tracking-tight">
                    {item.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-xs sm:text-sm text-[#AEBCC7] leading-relaxed group-hover:text-[#E2E8F0] transition-colors font-zen">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
