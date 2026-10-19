'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function ClickSpark({
  sparkColor = '#e88d72',
  sparkSize = 6,
  sparkRadius = 26,
  sparkCount = 8,
  duration = 450,
  children,
  className = '',
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);
  const sparksRef = useRef<
    Array<{
      x: number;
      y: number;
      angle: number;
      startTime: number;
    }>
  >([]);

  const propsRef = useRef({ sparkColor, sparkSize, sparkRadius, duration });
  useEffect(() => {
    propsRef.current = { sparkColor, sparkSize, sparkRadius, duration };
  }, [sparkColor, sparkSize, sparkRadius, duration]);

  const startAnimation = useCallback(() => {
    if (animIdRef.current !== null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { sparkColor: color, sparkSize: size, sparkRadius: radius, duration: dur } = propsRef.current;

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= dur) return false;

        const progress = elapsed / dur;
        const distance = progress * radius;
        const currentSize = size * (1 - progress);

        const x = spark.x + Math.cos(spark.angle) * distance;
        const y = spark.y + Math.sin(spark.angle) * distance;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, currentSize / 2), 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      if (sparksRef.current.length > 0) {
        animIdRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animIdRef.current = null;
      }
    };

    animIdRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animIdRef.current !== null) {
        cancelAnimationFrame(animIdRef.current);
        animIdRef.current = null;
      }
    };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const now = performance.now();
      const newSparks = Array.from({ length: sparkCount }).map((_, i) => ({
        x: clickX,
        y: clickY,
        angle: (i * 2 * Math.PI) / sparkCount + (Math.random() - 0.5) * 0.4,
        startTime: now,
      }));

      sparksRef.current.push(...newSparks);
      startAnimation();
    },
    [sparkCount, startAnimation]
  );

  return (
    <div className={`relative ${className}`} onClick={handleClick}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      />
      {children}
    </div>
  );
}
