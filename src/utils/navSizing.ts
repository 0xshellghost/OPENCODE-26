export interface NavDensityConfig {
  tier: 'few' | 'medium' | 'many' | 'maximum';
  pillClasses: string;
  buttonClasses: string;
}

/**
 * Intelligently distributes navbar button space based on the count of active navigation items:
 * - 3–4 items: Buttons expand with generous padding and min-width to utilize available navbar space.
 * - 5–6 items: Balanced intermediate padding and min-width.
 * - 7–8 items: Compact padding and tight gap to maintain breathing room.
 * - 9+ items: Maximum density with optimized padding and gap to prevent any wrapping or overflow.
 */
export function getNavSizing(count: number): NavDensityConfig {
  if (count <= 4) {
    return {
      tier: 'few',
      pillClasses: 'gap-1.5 xl:gap-2.5 2xl:gap-3 px-2 py-1 xl:px-3 xl:py-1.5',
      buttonClasses:
        'px-4 xl:px-5 2xl:px-6 py-1.5 xl:py-2 text-xs xl:text-sm font-medium min-w-[78px] xl:min-w-[96px] 2xl:min-w-[110px]',
    };
  }
  if (count <= 6) {
    return {
      tier: 'medium',
      pillClasses: 'gap-1 xl:gap-1.5 2xl:gap-2 px-1.5 py-1 xl:px-2.5 xl:py-1.25',
      buttonClasses:
        'px-3 xl:px-3.5 2xl:px-4 py-1.25 xl:py-1.5 text-xs xl:text-[13px] 2xl:text-sm font-medium min-w-[66px] xl:min-w-[76px] 2xl:min-w-[84px]',
    };
  }
  if (count <= 8) {
    return {
      tier: 'many',
      pillClasses: 'gap-0.5 xl:gap-1 2xl:gap-1.5 px-1.5 py-1 xl:px-2 xl:py-1',
      buttonClasses:
        'px-2 xl:px-2.5 2xl:px-3 py-1 xl:py-1 text-xs xl:text-[13px] font-medium min-w-0',
    };
  }
  return {
    tier: 'maximum',
    pillClasses: 'gap-0 xl:gap-0.5 2xl:gap-1 px-1 py-1 xl:px-1.5 xl:py-1',
    buttonClasses:
      'px-1.5 xl:px-2 2xl:px-2.5 py-1 text-xs xl:text-[12.5px] 2xl:text-[13px] font-medium min-w-0',
  };
}
