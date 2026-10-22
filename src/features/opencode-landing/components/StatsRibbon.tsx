"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import CountUp from "./CountUp";

const stats = [
  { label: "Active Participants", value: 1000, suffix: "+" },
  { label: "PRs Merged", value: 3700, suffix: "+" },
  { label: "Projects & Tracks", value: 25, suffix: "+" },
];

const ecosystemLogos = [
  { name: "GitHub", src: "/logos_github.svg", width: 110, height: 35 },
  { name: "DigitalOcean", src: "/logos_digital-ocean.svg", width: 140, height: 35 },
  { name: "Solana", src: "/logos_solana.svg", width: 110, height: 35 },
  { name: "Filecoin", src: "/logos_filecoin.svg", width: 110, height: 35 },
  { name: "Replit", src: "/logos_replit.svg", width: 110, height: 35 },
  { name: "Polygon Labs", src: "/logos_polygon.svg", width: 110, height: 35 },
  { name: "Taskade", src: "/logos_taskade.svg", width: 110, height: 35 },
  { name: "JetBrains", src: "/images/jetbrains.png", width: 110, height: 35 },
];

export default function StatsRibbon() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative z-20 py-14 sm:py-18 bg-[#07131F] overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Animated Counter Cards (Translucent Floating Glass Panels) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {stats.map((item, index) => (
            <div
              key={item.label}
              style={{
                transitionDelay: `${index * 120}ms`,
              }}
              className={`group relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-[#AEBCC7]/15 bg-gradient-to-b from-[#102535]/50 via-[#0D2233]/40 to-[#07131F]/60 p-6 sm:p-7 text-center backdrop-blur-xl shadow-[0_16px_40px_-15px_rgba(7,19,31,0.95),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-700 ease-out hover:-translate-y-1.5 hover:border-[#58B99A]/50 hover:shadow-[0_20px_50px_-20px_rgba(88,185,154,0.22)] ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Luminous Top Glass Sheen Line */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#B8E5D5]/40 to-transparent group-hover:via-[#58B99A]/80 transition-all duration-500 rounded-t-3xl" />
              <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(88,185,154,0.12),transparent_70%)] pointer-events-none" />

              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4F1E8] tracking-tight">
                <CountUp
                  to={item.value}
                  duration={1.8}
                  separator=","
                  startWhen={isInView}
                  className="inline-block"
                />
                <span className="text-[#B8E5D5] ml-0.5">{item.suffix}</span>
              </div>
              <span className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-[#AEBCC7]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Trust Ribbon */}
        <div
          style={{ transitionDelay: "360ms" }}
          className={`mt-12 max-w-6xl mx-auto rounded-2xl sm:rounded-3xl border border-[#AEBCC7]/15 bg-[#102535]/40 px-6 py-6 sm:py-7 backdrop-blur-xl shadow-lg shadow-[#07131F]/50 transition-all duration-700 ease-out ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D9E2E8]">
              <span className="h-2 w-2 rounded-full bg-[#58B99A] animate-pulse" />
              Supported &amp; Trusted by Developer Ecosystems
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-85">
            {ecosystemLogos.map((logo) => (
              <div
                key={logo.name}
                className="h-8 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="max-h-7 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
