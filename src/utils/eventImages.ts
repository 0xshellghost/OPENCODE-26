/**
 * Utility helpers to resolve banner/cover images and logo images for events.
 */

export function resolveImageUrl(rawUrl?: string, fallbackUrl: string = ''): string {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return fallbackUrl;
  }

  const trimmed = rawUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('/images/') || trimmed.startsWith('/img/')) {
    return trimmed;
  }

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
  if (trimmed.startsWith('/')) {
    return backendUrl ? `${backendUrl}${trimmed}` : trimmed;
  }

  return backendUrl ? `${backendUrl}/${trimmed}` : `/${trimmed}`;
}

export function getEventCoverImage(event: any): string | undefined {
  if (!event || typeof event !== 'object') return undefined;

  // Single string properties
  const candidates = [
    event.coverImageURL,
    event.coverImageUrl,
    event.coverImage,
    event.coverUrl,
    event.coverURL,
    event.cover,
    event.bannerImageURL,
    event.bannerImageUrl,
    event.bannerImage,
    event.bannerUrl,
    event.bannerURL,
    event.banner,
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (c && typeof c === 'object' && typeof c.url === 'string' && c.url.trim()) return c.url.trim();
  }

  // Array properties (backend may return coverImagesURL: [{ url: '...' }] or string[])
  const arrayCandidates = [
    event.coverImagesURL,
    event.coverImagesUrl,
    event.coverImages,
    event.coverImageURLs,
    event.coverImageUrls,
    event.bannerImages,
    event.bannerImagesURL,
    event.covers,
  ];

  for (const arr of arrayCandidates) {
    if (Array.isArray(arr) && arr.length > 0) {
      for (const item of arr) {
        if (typeof item === 'string' && item.trim()) return item.trim();
        if (item && typeof item === 'object') {
          const url = item.url || item.imageUrl || item.imageURL || item.src;
          if (typeof url === 'string' && url.trim()) return url.trim();
        }
      }
    }
  }

  return undefined;
}

export function getEventLogoImage(event: any): string | undefined {
  if (!event || typeof event !== 'object') return undefined;

  const candidates = [
    event.logoImageURL,
    event.logoImageUrl,
    event.logoImage,
    event.logoUrl,
    event.logoURL,
    event.logo,
    event.avatarUrl,
    event.avatar,
    event.iconUrl,
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (c && typeof c === 'object' && typeof c.url === 'string' && c.url.trim()) return c.url.trim();
  }

  return undefined;
}
