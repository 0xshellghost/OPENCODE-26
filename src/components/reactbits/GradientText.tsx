'use client';

import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#B8E5D5', '#D4F0E7', '#58B99A', '#B8E5D5'],
  animationSpeed = 6,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <span
      className={`relative inline-block font-bold bg-clip-text text-transparent bg-[length:300%_100%] animate-gradient ${className}`}
      style={gradientStyle}
    >
      {children}
    </span>
  );
}
