'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
}

export default function BlurText({
  text = '',
  delay = 55,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
}: BlurTextProps) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // If reduced motion is preferred, render visible immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      if (onAnimationComplete) onAnimationComplete();
      return;
    }

    const timer = setTimeout(() => {
      setInView(true);
      if (onAnimationComplete) {
        const totalDuration = (animateBy === 'words' ? text.split(' ').length : text.length) * delay + 650;
        setTimeout(onAnimationComplete, totalDuration);
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [animateBy, delay, onAnimationComplete, text]);

  const elements = useMemo(() => {
    return animateBy === 'words' ? text.split(' ') : text.split('');
  }, [text, animateBy]);

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {elements.map((segment, index) => (
        <span
          key={index}
          style={{
            transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * delay}ms, filter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * delay}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * delay}ms`,
            opacity: inView ? 1 : 0,
            filter: inView ? 'blur(0px)' : 'blur(6px)',
            transform: inView
              ? 'translate3d(0, 0, 0)'
              : `translate3d(0, ${direction === 'top' ? '-8px' : '8px'}, 0)`,
          }}
          className="inline-block"
        >
          {segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
}
