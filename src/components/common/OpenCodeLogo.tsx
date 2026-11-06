import React from 'react';

interface OpenCodeLogoProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
  alt?: string;
}

export default function OpenCodeLogo({
  className = '',
  width = 30,
  height = 30,
  color,
  alt = "OpenCode '26 Logo",
}: OpenCodeLogoProps) {
  return (
    <img
      src="/Logo/opencode-logo.png"
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
      }}
    />
  );
}
