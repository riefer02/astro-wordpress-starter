/**
 * Authentication utilities for managing JWT tokens and auth state
 */

/**
 * Get JWT token from cookies
 */
export function getAuthToken(): string | null {
  const match = document.cookie.match(/wp_auth_token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Set JWT token in cookies
 */
export function setAuthToken(token: string, expiresInDays: number = 7): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + expiresInDays);

  document.cookie = `wp_auth_token=${token}; path=/; expires=${expires.toUTCString()}; samesite=lax; secure=${location.protocol === 'https:'}`;
}

/**
 * Remove JWT token from cookies
 */
export function removeAuthToken(): void {
  document.cookie = 'wp_auth_token=; path=/; max-age=0; samesite=lax';
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Redirect to login page if not authenticated
 */
export function requireAuth(redirectTo: string = '/login'): boolean {
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

/**
 * Redirect to profile page if already authenticated
 */
export function redirectIfAuthenticated(
  redirectTo: string = '/profile'
): boolean {
  if (isAuthenticated()) {
    window.location.href = redirectTo;
    return true;
  }
  return false;
}
