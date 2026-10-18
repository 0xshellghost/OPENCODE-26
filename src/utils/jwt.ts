export interface JWTPayload {
  roles?: {
    isAdmin?: boolean;
    isMentor?: boolean;
    [key: string]: any;
  };
  id?: string;
  githubId?: string;
  [key: string]: any;
}

/**
 * Safely decodes a JWT token on the client side.
 */
export function parseJwt(token: string | null | undefined): JWTPayload | null {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
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
