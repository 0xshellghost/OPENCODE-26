export type OpenCodeQuality = 'auto' | 'low' | 'high'
export type OpenCodeAssets = { hero: string; passage: string }
export type OpenCodeNavigationItem = { label: string; href: string }
export type OpenCodeExperienceProps = {
  id?: string
  title?: string
  year?: string | number
  eyebrow?: string
  description?: string
  assets?: Partial<OpenCodeAssets>
  navigation?: OpenCodeNavigationItem[]
  ctaLabel?: string
  ctaHref?: string
  skipTargetId: string
  className?: string
  quality?: OpenCodeQuality
  onComplete?: () => void
}

export const defaultAssets: OpenCodeAssets = {
  hero: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero_Master-gUcO2MPaKziIA08kt3OHQJDzgq04No.jpeg',
  passage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OPENCODE_2026_HERO_START-DZfLv7VSExDCCd6vlBuBKD0tdHsQEL.jpeg',
}
export const selfHostedAssets: OpenCodeAssets = {
  hero: '/images/opencode/hero-master.jpeg',
  passage: '/images/opencode/hero-start.jpeg',
}
export const defaultNavigation: OpenCodeNavigationItem[] = [
  { label: 'Leaderboard', href: '/user/leaderboard' },
  { label: 'FAQ', href: '/faq' },
]
export const chapters = ['Arrival', 'Departure', 'Passage', 'Convergence', 'Together']
export type SceneParameters = { progress: number; paused: boolean; pointerX: number; pointerY: number }
