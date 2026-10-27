'use client';

import React from 'react';

interface ShinyTextProps {
  text?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shineColor?: string;
  baseColor?: string;
}

export default function ShinyText({
  text,
  children,
  disabled = false,
  speed = 4,
  className = '',
  shineColor,
  baseColor,
}: ShinyTextProps) {
  const content = text || children;

  if (disabled) {
    return <span className={className}>{content}</span>;
  }

  const effectiveBase = baseColor || 'var(--shiny-base, var(--accent))';
  const effectiveShine = shineColor || 'var(--shiny-highlight, #FFFFFF)';

  return (
    <span
      className={`inline-block relative overflow-hidden ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, ${effectiveBase} 0%, ${effectiveShine} 50%, ${effectiveBase} 100%)`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: `shiny-text ${speed}s linear infinite`,
      }}
    >
      {content}
    </span>
  );
}
