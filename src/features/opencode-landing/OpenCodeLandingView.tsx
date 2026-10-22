"use client";

import React from "react";
import "./styles/fonts.css";
import styles from "./styles/opencode-landing.module.css";
import CinematicIntro from "./components/CinematicIntro";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import BackgroundAudio from "./components/BackgroundAudio";
import GlobalJourney from "./components/GlobalJourney";
import StatsRibbon from "./components/StatsRibbon";
import AboutSection from "./components/AboutSection";
import HowItWorks from "./components/HowItWorks";
import Projects from "./components/Projects";
import { Testimonials } from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function OpenCodeLandingView() {
  return (
    <div className={`${styles.landingRoot} opencode-landing-root relative w-full overflow-x-hidden selection:bg-[#B8E5D5]/30 selection:text-[#F4F1E8]`}>
      <BackgroundAudio />
      <div className="relative w-full flex items-center justify-center">
        <Navbar />
      </div>
      <main className="w-full">
        <CinematicIntro />
        <GlobalJourney />
        <HeroSection />
        <StatsRibbon />
        <AboutSection />
        <HowItWorks />
        <Projects />
        <Testimonials />
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}
