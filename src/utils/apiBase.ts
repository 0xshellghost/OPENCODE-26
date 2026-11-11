/**
 * Returns the base URL for API calls directly to the backend server.
 */
export function getApiBase(): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.geekhaven.in';
  return backendUrl.replace(/\/+$/, '');
}

