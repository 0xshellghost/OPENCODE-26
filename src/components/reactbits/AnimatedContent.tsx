'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  animateOpacity?: boolean;
  scale?: number;
}

export default function AnimatedContent({
  children,
  distance = 30,
  direction = 'vertical',
  reverse = false,
  duration = 0.6,
  delay = 0,
  className = '',
  animateOpacity = true,
  scale = 1,
}: AnimatedContentProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const mult = reverse ? -1 : 1;
  const transformStart =
    direction === 'vertical'
      ? `translate3d(0, ${mult * distance}px, 0)`
      : `translate3d(${mult * distance}px, 0, 0)`;

  const transformValue = inView
    ? 'translate3d(0, 0, 0) scale(1)'
    : `${transformStart} scale(${scale})`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: transformValue,
        opacity: inView || !animateOpacity ? 1 : 0,
        transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
