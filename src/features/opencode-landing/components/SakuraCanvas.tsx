"use client";

import React, { useEffect, useRef } from "react";

interface SakuraCanvasProps {
  active?: boolean;
  className?: string;
  petalCount?: number;
  position?: "fixed" | "absolute";
  colors?: string[];
}

interface Petal {
  x: number;
  y: number;
  z: number;
  size: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotationSpeedX: number;
  rotationSpeedY: number;
  rotationSpeedZ: number;
  opacity: number;
  color: string;
}

const PETAL_COLORS = [
  "rgba(184, 229, 213, 0.85)", // Crisp Mint (#B8E5D5)
  "rgba(88, 185, 154, 0.80)",  // Glowing Emerald (#58B99A)
  "rgba(212, 241, 231, 0.80)", // Soft Mint Frost (#D4F1E7)
  "rgba(62, 168, 137, 0.75)",  // Deep Luminous Emerald (#3EA889)
  "rgba(244, 241, 232, 0.85)", // Soft Moonlit White (#F4F1E8)
  "rgba(217, 226, 232, 0.80)", // Cool Misty Blue-White (#D9E2E8)
  "rgba(143, 175, 196, 0.75)", // Soft Desaturated Moon-Blue (#8FAFC4)
];

export default function SakuraCanvas({
  active = true,
  className = "",
  petalCount = 55,
  position = "fixed",
  colors,
}: SakuraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number }>({
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      if (position === "absolute" && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
        height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
      } else {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Track mouse movement with relative canvas offsets
    let lastMouseX = -9999;
    let lastMouseY = -9999;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      mouseRef.current.vx = (currentX - lastMouseX) * 0.3;
      mouseRef.current.vy = (currentY - lastMouseY) * 0.3;
      mouseRef.current.x = currentX;
      mouseRef.current.y = currentY;
      lastMouseX = currentX;
      lastMouseY = currentY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      mouseRef.current.vx = 0;
      mouseRef.current.vy = 0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Initialize Petals
    const activeColors = colors && colors.length > 0 ? colors : PETAL_COLORS;
    const petals: Petal[] = [];
    const createPetal = (randomY = true): Petal => ({
      x: Math.random() * (width + 200) - 100,
      y: randomY ? Math.random() * height : -30,
      z: Math.random() * 0.8 + 0.4, // Depth factor
      size: Math.random() * 10 + 10,
      speedX: Math.random() * 1.5 + 0.8, // Breeze from left to right
      speedY: Math.random() * 1.8 + 1.0, // Gentle downward drift
      speedZ: Math.random() * 0.02 - 0.01,
      rotationX: Math.random() * Math.PI * 2,
      rotationY: Math.random() * Math.PI * 2,
      rotationZ: Math.random() * Math.PI * 2,
      rotationSpeedX: (Math.random() - 0.5) * 0.04,
      rotationSpeedY: (Math.random() - 0.5) * 0.05,
      rotationSpeedZ: (Math.random() - 0.5) * 0.03,
      opacity: Math.random() * 0.4 + 0.5,
      color: activeColors[Math.floor(Math.random() * activeColors.length)],
    });

    for (let i = 0; i < petalCount; i++) {
      petals.push(createPetal(true));
    }

    // Draw realistic notched cherry blossom petal shape
    const drawPetal = (
      p: Petal,
      context: CanvasRenderingContext2D,
      time: number
    ) => {
      context.save();
      context.translate(p.x, p.y);

      // Simulate 3D tumbling rotation
      const scaleX = Math.cos(p.rotationY) * p.z;
      const scaleY = Math.sin(p.rotationX) * p.z;
      context.rotate(p.rotationZ);
      context.scale(scaleX, scaleY);

      context.fillStyle = p.color;
      context.globalAlpha = p.opacity;

      // Authentic Sakura petal geometry with notched tip
      context.beginPath();
      context.moveTo(0, -p.size);
      context.bezierCurveTo(
        p.size * 0.7,
        -p.size * 0.7,
        p.size * 0.8,
        p.size * 0.5,
        0,
        p.size
      );
      context.bezierCurveTo(
        -p.size * 0.8,
        p.size * 0.5,
        -p.size * 0.7,
        -p.size * 0.7,
        0,
        -p.size
      );

      // Delicate notch at the tip
      context.arc(0, -p.size, p.size * 0.15, 0, Math.PI, true);
      context.fill();

      // Subtle translucent vein down the center
      context.strokeStyle = "rgba(255, 255, 255, 0.35)";
      context.lineWidth = 0.7;
      context.beginPath();
      context.moveTo(0, -p.size * 0.7);
      context.lineTo(0, p.size * 0.7);
      context.stroke();

      context.restore();
    };

    let tick = 0;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      petals.forEach((p) => {
        drawPetal(p, ctx, 0);
      });
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      if (active) {
        // Decay mouse wind velocity gradually
        mouseRef.current.vx *= 0.92;
        mouseRef.current.vy *= 0.92;

        petals.forEach((p, idx) => {
          // Natural swaying flutter
          const naturalWind = Math.sin(tick * 0.02 + idx) * 0.6;
          p.x += (p.speedX + naturalWind) * p.z;
          p.y += p.speedY * p.z;

          p.rotationX += p.rotationSpeedX;
          p.rotationY += p.rotationSpeedY;
          p.rotationZ += p.rotationSpeedZ;

          // Mouse wind interaction (repulsion & turbulence)
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 180 && dist > 0) {
            const force = (1 - dist / 180) * 8;
            p.x += (dx / dist) * force + mouseRef.current.vx * 0.5;
            p.y += (dy / dist) * force + mouseRef.current.vy * 0.5;
            p.rotationSpeedZ += 0.02;
          }

          // Wrap around edges
          if (p.y > height + 30) {
            Object.assign(p, createPetal(false));
          }
          if (p.x > width + 100) {
            p.x = -50;
          } else if (p.x < -100) {
            p.x = width + 50;
          }

          drawPetal(p, ctx, tick);
        });
      } else {
        // Motion paused: render petals statically in place
        petals.forEach((p) => {
          drawPetal(p, ctx, tick);
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, petalCount, position, colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${
        position === "absolute" ? "absolute inset-0" : "fixed inset-0"
      } z-20 ${className}`}
    />
  );
}
