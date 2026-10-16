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
  const sparksRef = useRef<
    Array<{
      x: number;
      y: number;
      angle: number;
      startTime: number;
    }>
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const distance = progress * sparkRadius;
        const currentSize = sparkSize * (1 - progress);

        const x = spark.x + Math.cos(spark.angle) * distance;
        const y = spark.y + Math.sin(spark.angle) * distance;

        ctx.fillStyle = sparkColor;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, currentSize / 2), 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, duration]);

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
    },
    [sparkCount]
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
