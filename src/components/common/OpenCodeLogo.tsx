'use client';

import React, { useState, useEffect } from 'react';
import { useColorMode } from '@chakra-ui/react';

interface OpenCodeLogoProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export default function OpenCodeLogo({
  className = '',
  width = 38,
  height = 38,
  color,
  alt = "OpenCode '26 Logo",
  style = {},
}: OpenCodeLogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let isLight = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { colorMode } = useColorMode();
    isLight = mounted && colorMode === 'light';
  } catch {
    isLight = false;
  }

  const logoSrc = isLight
    ? '/Logo/opencode-emblem-light.png'
    : '/Logo/opencode-emblem-dark.png';

  const defaultFilter = isLight
    ? 'drop-shadow(0 1px 2px rgba(31, 122, 94, 0.25))'
    : 'drop-shadow(0 0 8px rgba(88, 185, 154, 0.45)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))';

  return (
    <img
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        filter: defaultFilter,
        transition: 'filter 0.3s ease, transform 0.2s ease',
        ...style,
      }}
    />
  );
}
