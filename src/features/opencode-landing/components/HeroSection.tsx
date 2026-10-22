"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import SakuraCanvas from "./SakuraCanvas";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import SpecularButton from "./SpecularButton";

export default function HeroSection() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isFrozen, setIsFrozen] = useState(false);

  useEffect(() => {
    const handleLandingEntered = () => {
      if (heroVideoRef.current) {
        heroVideoRef.current.currentTime = 0;
        heroVideoRef.current.play().catch(() => {});
        setIsFrozen(false);
      }
    };

    window.addEventListener("landing-page-entered", handleLandingEntered);

    const checkAndPlay = () => {
      const landingElem = document.getElementById("cinematic-landing-portal");
      if (!landingElem && heroVideoRef.current) {
        heroVideoRef.current.play().catch(() => {});
      }
    };

    const timer = setTimeout(checkAndPlay, 400);

    return () => {
      window.removeEventListener("landing-page-entered", handleLandingEntered);
      clearTimeout(timer);
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = heroVideoRef.current;
    if (video && video.duration) {
      if (video.currentTime >= video.duration - 0.15) {
        video.pause();
        setIsFrozen(true);
      }
    }
  };

  const handleVideoEnded = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.pause();
    }
    setIsFrozen(true);
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[52rem] flex-col items-center justify-center overflow-hidden bg-[#07131F] pt-36 pb-20 sm:pt-44 sm:pb-24 lg:pb-28"
    >
      {/* Cinematic Japanese Hero Entry Video Background with Smooth Organic Dissolve */}
      <div
        className="absolute inset-0 z-0 select-none overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.85) 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.85) 75%, transparent 100%)",
        }}
      >
        {/* Frozen Background Image (Shows the exact final scene when video finishes or as fallback) */}
        <img
          src="/images/hero-japanese-bg.jpg"
          alt="Japanese Village Night Background"
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 ${
            isFrozen ? "opacity-100" : "opacity-0"
          }`}
        />

        <video
          ref={heroVideoRef}
          poster="/images/hero-japanese-bg.jpg"
          playsInline
          muted
          autoPlay
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          className={`w-full h-full object-cover object-center pointer-events-none transition-opacity duration-500 ${
            isFrozen ? "opacity-0" : "opacity-100"
          }`}
        >
          <source src="/videos/ending.mp4" type="video/mp4" />
        </video>
        {/* Subtle dark tint to ensure headline text readability */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Deep, seamless multi-stop gradient transition into the section below */}
        <div
          className="absolute inset-x-0 bottom-0 h-72 sm:h-96 md:h-[32rem] pointer-events-none"
          style={{
            background: "linear-gradient(to top, #07131F 0%, rgba(7, 19, 31, 0.95) 25%, rgba(7, 19, 31, 0.65) 55%, rgba(7, 19, 31, 0.2) 80%, transparent 100%)"
          }}
        />

        {/* Ambient night mist layer */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 sm:h-64 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(143, 175, 196, 0.08), transparent 75%)"
          }}
        />
      </div>

      {/* Floating Cherry Blossom Petals in Hero Background - continues flowing at all times */}
      <SakuraCanvas
        active={true}
        petalCount={48}
        position="absolute"
        className="z-10 pointer-events-none"
      />

      <div className="relative z-30 mx-auto flex max-w-5xl flex-col items-center px-4 sm:px-6 text-center">
        {/* Registration & Event Status Ribbon */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 rounded-full border border-[#58B99A]/30 bg-[#102535]/55 px-3 sm:px-4 py-1.5 sm:py-2 text-[10.5px] sm:text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#D9E2E8] backdrop-blur-md shadow-lg shadow-[#07131F]/70 whitespace-nowrap max-w-full">
            <Sparkles className="h-3.5 w-3.5 text-[#58B99A] animate-pulse shrink-0" />
            <span className="truncate">OpenCode 2026 • GeekHaven IIITA</span>
            <span className="hidden sm:inline text-[#718394]">•</span>
            <span className="hidden sm:inline text-[#B8E5D5] font-bold">Registration Live</span>
          </div>
        </div>

        {/* High-Impact Headline (Racing Sans One Font) */}
        <h1 className="mt-6 sm:mt-8 text-3xl sm:text-5xl md:text-6xl lg:text-[4.75rem] leading-[1.14] text-[#F4F1E8] drop-shadow-[0_4px_30px_rgba(7,19,31,0.95)] max-w-full break-words">
          <span className="font-racing uppercase tracking-[0.02em] sm:tracking-[0.04em]">
            START YOUR{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F4F1E8] via-[#D9E2E8] to-[#B8E5D5]">
              OPEN SOURCE ODYSSEY
            </span>
          </span>
          <span className="block mt-4 sm:mt-5 font-cormorant text-sm sm:text-lg md:text-xl lg:text-2xl font-medium uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#D9E2E8] drop-shadow-[0_2px_16px_rgba(7,19,31,0.9)]">
            FUELING THE NEXT WAVE OF OPEN TECH
          </span>
        </h1>

        {/* Subtext */}
        <p className="font-zen mt-6 text-base sm:text-lg md:text-xl text-[#AEBCC7] max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_14px_rgba(7,19,31,0.9)]">
          A month-long open source celebration by{" "}
          <span className="font-semibold text-[#F4F1E8]">GeekHaven, IIITA</span> bringing together{" "}
          <span className="font-semibold text-[#B8E5D5]">1,000+ student developers</span> and
          seasoned open-source maintainers from across the globe.
        </p>

        {/* Brand Tagline */}
        <div className="mt-6">
          <h3 className="font-cormorant text-xs sm:text-sm md:text-base font-medium uppercase tracking-[0.22em] sm:tracking-[0.26em] text-[#8FAFC4] drop-shadow-[0_2px_12px_rgba(7,19,31,0.9)] select-none">
            OPEN SOURCE <span className="text-[#58B99A] mx-1.5">•</span> OPEN MINDS
          </h3>
        </div>

        {/* Action CTAs */}
        <div className="mt-14 sm:mt-18 md:mt-20 flex flex-col items-center justify-center gap-4 sm:gap-5 w-full">
          {/* Contributor & Explore Projects */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            {/* Primary CTA: Contributor */}
            <SpecularButton
              size="lg"
              radius={24}
              tint="#B8E5D5"
              tintOpacity={0.16}
              textColor="#0C1C2C"
              lineColor="#ffffff"
              baseColor="#B8E5D5"
              intensity={1}
              idleIntensity={0.35}
              shineSize={10}
              shineFade={34}
              thickness={1.2}
              glow={1}
              followMouse
              proximity={250}
              href="/auth/register"
              className="!bg-[#B8E5D5] hover:!bg-[#A3DAC7] !text-[#0C1C2C] font-semibold text-sm sm:text-base shadow-lg shadow-[#58B99A]/20"
            >
              <Terminal className="w-4 h-4 text-[#0C1C2C]" />
              <span>Join as Contributor</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#0C1C2C]" />
            </SpecularButton>

            {/* Secondary CTA: Explore Projects */}
            <SpecularButton
              size="lg"
              radius={24}
              tint="#ffffff"
              tintOpacity={0.06}
              textColor="#F4F1E8"
              lineColor="#58B99A"
              baseColor="#102535"
              intensity={1}
              idleIntensity={0.35}
              shineSize={10}
              shineFade={34}
              thickness={1.2}
              glow={1}
              followMouse
              proximity={250}
              href="#projects"
              className="!bg-[#102535]/80 hover:!bg-[#102535] !text-[#F4F1E8] font-semibold text-sm sm:text-base border border-[#58B99A]/50 backdrop-blur-md"
            >
              <span>Explore Projects</span>
            </SpecularButton>
          </div>
        </div>
      </div>

    </section>
  );
}
