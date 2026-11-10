/**
 * Returns the base URL for API calls.
 * - Client-side (browser): returns '' (empty string) so requests use relative URLs
 *   and go through Next.js rewrites, avoiding CORS entirely.
 * - Server-side (SSR/API routes): returns the full NEXT_PUBLIC_BACKEND_URL
 *   since server-to-server calls don't have CORS restrictions.
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URLs (proxied via Next.js rewrites)
    return '';
  }
  // Server-side: use full backend URL
  return (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/+$/, '');
}
