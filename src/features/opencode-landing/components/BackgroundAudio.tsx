"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Check if user previously set a sound preference
    const storedMuted = typeof window !== "undefined" ? sessionStorage.getItem("opencode_sound_muted") : null;
    const initialMuted = storedMuted === "true";
    audio.muted = initialMuted;
    setIsMuted(initialMuted);

    // Synchronize state to listeners (Navbar sound button, etc.)
    const notifyState = (mutedState: boolean) => {
      window.dispatchEvent(
        new CustomEvent("hero-sound-state", { detail: { isMuted: mutedState } })
      );
    };

    // Start background audio playback
    const startAudio = () => {
      if (!audio) return;
      audio.muted = initialMuted;
      audio.play().then(() => {
        notifyState(initialMuted);
      }).catch(() => {
        // If unmuted autoplay blocked by browser policy before user gesture:
        audio.muted = true;
        setIsMuted(true);
        notifyState(true);
        audio.play().catch(() => {});
      });
    };

    // When trailer finishes or user enters the site
    const handleLandingEntered = () => {
      if (!audio) return;
      audio.currentTime = 0;
      startAudio();
    };

    // If trailer is opened, pause background music
    const handleTrailerOpened = () => {
      if (audio) {
        audio.pause();
      }
    };

    // Handle audio completion (no loop)
    const handleEnded = () => {
      if (!audio) return;
      audio.muted = true;
      setIsMuted(true);
      notifyState(true);
    };

    // Toggle sound requested from top-right Sound Button
    const handleToggleSound = () => {
      if (!audio) return;
      const nextMuted = !audio.muted;
      audio.muted = nextMuted;
      setIsMuted(nextMuted);
      sessionStorage.setItem("opencode_sound_muted", String(nextMuted));
      notifyState(nextMuted);
      if (!nextMuted) {
        if (audio.ended || (audio.duration && audio.currentTime >= audio.duration - 0.1)) {
          audio.currentTime = 0;
        }
        audio.play().catch(() => {});
      }
    };

    // Query state requested by components mounting
    const handleQuerySound = () => {
      if (audio) {
        notifyState(audio.muted);
      }
    };

    // Unlock unmuted audio on first user gesture if browser blocked unmuted autoplay
    const handleFirstGesture = () => {
      if (!audio) return;
      const currentStored = sessionStorage.getItem("opencode_sound_muted");
      if (currentStored !== "true" && audio.muted && !audio.ended) {
        audio.muted = false;
        setIsMuted(false);
        notifyState(false);
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      }
    };

    // Check if cinematic landing trailer is currently active in the DOM
    const landingPortal = document.getElementById("cinematic-landing-portal");
    if (!landingPortal) {
      // Direct visit or trailer already dismissed
      startAudio();
    }

    audio.addEventListener("ended", handleEnded);
    window.addEventListener("landing-page-entered", handleLandingEntered);
    window.addEventListener("open-cinematic-landing", handleTrailerOpened);
    window.addEventListener("toggle-hero-sound", handleToggleSound);
    window.addEventListener("query-hero-sound", handleQuerySound);

    window.addEventListener("click", handleFirstGesture, { once: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });

    return () => {
      audio.removeEventListener("ended", handleEnded);
      window.removeEventListener("landing-page-entered", handleLandingEntered);
      window.removeEventListener("open-cinematic-landing", handleTrailerOpened);
      window.removeEventListener("toggle-hero-sound", handleToggleSound);
      window.removeEventListener("query-hero-sound", handleQuerySound);
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/audio/bgm.m4a"
      preload="auto"
      className="hidden"
    />
  );
}
