'use client';

import React from 'react';
import { useColorMode } from '@chakra-ui/react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  lightColors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = '',
  colors,
  lightColors,
  animationSpeed = 6,
  showBorder = false,
}: GradientTextProps) {
  const { colorMode } = useColorMode();
  const isLight = colorMode === 'light';

  const defaultDarkColors = ['#B8E5D5', '#D4F0E7', '#58B99A', '#B8E5D5'];
  const defaultLightColors = ['#0F766E', '#134E4A', '#0D9488', '#0F766E'];

  const resolvedColors = isLight
    ? (lightColors || defaultLightColors)
    : (colors || defaultDarkColors);

  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${resolvedColors.join(', ')})`,
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
