'use client';

import React, { useState } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

export const AVATAR_COLORS = [
  '#2A5A68', // Teal
  '#853D3D', // Maroon
  '#BD5319', // Terracotta
  '#2E5C4E', // Forest green
  '#4A3B69', // Deep violet
  '#594A2B', // Warm ochre
  '#2B4C6F', // Deep navy slate
];

export function getAvatarColor(identifier?: string): string {
  if (!identifier) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name?: string, fallbackId?: string): string {
  const target = (name || '').trim() || (fallbackId || '').trim() || '??';
  const parts = target.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return target.slice(0, 2).toUpperCase();
}

export interface ContributorAvatarProps extends Omit<BoxProps, 'fontSize'> {
  name?: string;
  githubid?: string;
  avatarUrl?: string;
  size?: string | number;
  fontSize?: string | number;
  bg?: string;
  boxShadow?: string;
}

/**
 * Universal ContributorAvatar component that directly requests GitHub profile images
 * and cleanly falls back to two-letter initials with zero browser alt-text distortion
 * and no placeholder fallback images.
 */
export default function ContributorAvatar({
  name,
  githubid,
  avatarUrl,
  size = '38px',
  fontSize = '13px',
  bg,
  boxShadow,
  ...boxProps
}: ContributorAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Directly load the user's GitHub avatar if githubid exists; otherwise check avatarUrl
  const imageSrc = githubid?.trim()
    ? `https://github.com/${githubid.trim()}.png`
    : (avatarUrl && avatarUrl !== 'null' && avatarUrl !== 'undefined' ? avatarUrl.trim() : undefined);

  const initials = getInitials(name, githubid);
  const circleBg = bg || getAvatarColor(name || githubid);

  return (
    <Box
      w={size}
      h={size}
      minW={size}
      minH={size}
      borderRadius="full"
      bg={circleBg}
      color="#FFFFFF"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize={fontSize}
      fontWeight="700"
      fontFamily="var(--f-body)"
      letterSpacing="0.04em"
      overflow="hidden"
      boxShadow={boxShadow || '0 2px 8px rgba(0,0,0,0.25)'}
      flexShrink={0}
      position="relative"
      userSelect="none"
      {...boxProps}
    >
      {imageSrc && !hasError ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </Box>
  );
}
