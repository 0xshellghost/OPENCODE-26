'use client';

import React from 'react';

interface ShinyTextProps {
  text?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shineColor?: string;
}

export default function ShinyText({
  text,
  children,
  disabled = false,
  speed = 4,
  className = '',
  shineColor = 'rgba(255, 248, 237, 0.95)',
}: ShinyTextProps) {
  const content = text || children;

  if (disabled) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span
      className={`inline-block relative overflow-hidden ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(232, 141, 114, 0.45) 0%, ${shineColor} 50%, rgba(232, 141, 114, 0.45) 100%)`,
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
