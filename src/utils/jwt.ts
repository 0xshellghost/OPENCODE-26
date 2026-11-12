export interface JWTPayload {
  roles?: {
    isAdmin?: boolean;
    isMentor?: boolean;
    [key: string]: any;
  };
  id?: string;
  githubId?: string;
  exp?: number;
  [key: string]: any;
}

export function isTokenActive(token: string | null | undefined): boolean {
  const payload = parseJwt(token);
  if (!payload) return false;
  if (typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 > Date.now();
}

/**
 * Safely decodes a JWT token on the client side.
 */
export function parseJwt(token: string | null | undefined): JWTPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    const binaryStr = atob(base64);
    try {
      const jsonPayload = decodeURIComponent(
        binaryStr
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return JSON.parse(binaryStr);
    }
  } catch (err) {
    console.error('Failed to parse JWT token:', err);
    return null;
  }
}

/**
 * Checks whether the current user is an admin from their stored JWT.
 */
export function isAdminUser(token?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  const authToken = token !== undefined ? token : localStorage.getItem('token');
  const payload = parseJwt(authToken);
  return Boolean(payload?.roles?.isAdmin);
}
