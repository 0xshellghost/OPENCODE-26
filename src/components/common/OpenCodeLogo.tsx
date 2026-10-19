import React from 'react';
import { opencodeTokens } from 'theme/opencode-tokens';

interface OpenCodeLogoProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}

export default function OpenCodeLogo({ className = '', width = 30, height = 30, color = 'var(--accent, #B8E5D5)' }: OpenCodeLogoProps) {
  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        maskImage: "url('/Logo/OpenCode-White.png')",
        WebkitMaskImage: "url('/Logo/OpenCode-White.png')",
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
      aria-label="OpenCode Logo"
      role="img"
    />
  );
}
