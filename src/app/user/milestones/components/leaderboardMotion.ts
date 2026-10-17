import { Variants, Transition } from 'framer-motion';

/**
 * Centered Coverflow Carousel Spring
 * Hard requirement: stiffness ~260, damping ~28
 */
export const coverflowSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
};

/**
 * Returns coverflow visual properties based on card offset from active index
 */
export function getCoverflowCardStyle(offset: number, isMobile: boolean) {
  if (offset === 0) {
    return {
      x: '0%',
      scale: 1,
      rotateY: 0,
      opacity: 1,
      zIndex: 10,
      pointerEvents: 'auto' as const,
      visibility: 'visible' as const,
    };
  }

  if (offset === -1) {
    return {
      x: isMobile ? '-84%' : '-68%',
      scale: isMobile ? 0.88 : 0.85,
      rotateY: 9,
      opacity: isMobile ? 0.45 : 0.5,
      zIndex: 5,
      pointerEvents: 'auto' as const,
      visibility: 'visible' as const,
    };
  }

  if (offset === 1) {
    return {
      x: isMobile ? '84%' : '68%',
      scale: isMobile ? 0.88 : 0.85,
      rotateY: -9,
      opacity: isMobile ? 0.45 : 0.5,
      zIndex: 5,
      pointerEvents: 'auto' as const,
      visibility: 'visible' as const,
    };
  }

  // Cards further away are hidden
  return {
    x: offset < 0 ? (isMobile ? '-140%' : '-120%') : (isMobile ? '140%' : '120%'),
    scale: 0.7,
    rotateY: offset < 0 ? 12 : -12,
    opacity: 0,
    zIndex: 1,
    pointerEvents: 'none' as const,
    visibility: 'hidden' as const,
  };
}

/**
 * Main container variant for podium and rank rows content.
 * Gets variants={podiumContentContainerVariants} initial="hidden" animate="show" key={weekId}
 */
export const podiumContentContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      duration: 0.2,
      staggerChildren: 0.05,
    },
  },
};

/**
 * Children variants: each child only gets variants={item}, no own initial or animate
 */

// 2nd Place Block
export const podiumBlock2ItemVariants: Variants = {
  hidden: { y: 60, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 220, damping: 22, delay: 0.05 },
  },
};

// 3rd Place Block
export const podiumBlock3ItemVariants: Variants = {
  hidden: { y: 60, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 220, damping: 22, delay: 0.2 },
  },
};

// 1st Place Block (rises last)
export const podiumBlock1ItemVariants: Variants = {
  hidden: { y: 80, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20, delay: 0.35 },
  },
};

// 2nd Avatar (drops in after 2nd block)
export const avatar2ItemVariants: Variants = {
  hidden: { y: -24, opacity: 0, scale: 0.7 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 18, delay: 0.18 },
  },
};

// 3rd Avatar (drops in after 3rd block)
export const avatar3ItemVariants: Variants = {
  hidden: { y: -24, opacity: 0, scale: 0.7 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 18, delay: 0.32 },
  },
};

// 1st Avatar (drops in after 1st block)
export const avatar1ItemVariants: Variants = {
  hidden: { y: -30, opacity: 0, scale: 0.7 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 18, delay: 0.48 },
  },
};

// Crown on #1: small bounce
export const crownItemVariants: Variants = {
  hidden: { y: -20, opacity: 0, scale: 0.4 },
  show: {
    y: [ -20, 2, -4, 0 ],
    opacity: 1,
    scale: 1,
    transition: { duration: 0.48, delay: 0.62, ease: 'easeOut' },
  },
};

export const crownFloatVariants: Variants = {
  animate: {
    y: [0, -3.5, 0],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Rank rows list container (40ms stagger)
export const rankRowsListVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.5,
    },
  },
};

// Individual rank row item
export const rankRowSingleItemVariants: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

/**
 * Tab indicator transition for segmented control
 */
export const tabIndicatorTransition: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
};

/**
 * 7 subtle Sakura Petals configuration
 */
export interface SakuraPetalConfig {
  x: number;
  startY: number;
  endY: number;
  startRotate: number;
  endRotate: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}

export const SAKURA_PETALS: SakuraPetalConfig[] = [
  { x: 12, startY: -10, endY: 520, startRotate: 15, endRotate: 180, duration: 6.8, delay: 0.2, size: 10, opacity: 0.32 },
  { x: 28, startY: -20, endY: 560, startRotate: 45, endRotate: 240, duration: 8.4, delay: 1.5, size: 12, opacity: 0.38 },
  { x: 46, startY: -15, endY: 530, startRotate: -20, endRotate: 160, duration: 7.4, delay: 0.8, size: 9, opacity: 0.28 },
  { x: 64, startY: -25, endY: 570, startRotate: 60, endRotate: 310, duration: 8.8, delay: 2.2, size: 11, opacity: 0.34 },
  { x: 79, startY: -10, endY: 520, startRotate: -15, endRotate: 190, duration: 7.2, delay: 1.1, size: 10, opacity: 0.28 },
  { x: 88, startY: -20, endY: 550, startRotate: 30, endRotate: 220, duration: 8.0, delay: 2.8, size: 12, opacity: 0.38 },
  { x: 37, startY: -30, endY: 540, startRotate: 0, endRotate: 180, duration: 9.2, delay: 3.5, size: 8, opacity: 0.24 },
];

export const petalVariants: Variants = {
  initial: (petal: SakuraPetalConfig) => ({
    y: petal.startY,
    opacity: 0,
    rotate: petal.startRotate,
    x: 0,
  }),
  animate: (petal: SakuraPetalConfig) => ({
    y: petal.endY,
    opacity: [0, petal.opacity, petal.opacity, 0],
    rotate: petal.endRotate,
    x: [0, 12, -10, 8, 0],
    transition: {
      duration: petal.duration,
      delay: petal.delay,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
};
