import { defineMiddleware } from 'astro:middleware';
import { wp } from './lib/wordpress';
import type { User, AuthError } from './types';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/callback',
  '/about',
  '/contact',
  '/posts',
  '/posts/*',
  '/404',
  '/500',
];

// Check if route is public (doesn't require auth)
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === pathname) return true;
    if (route.endsWith('/*')) {
      const basePath = route.slice(0, -2);
      return pathname.startsWith(basePath);
    }
    return false;
  });
}

// Check if route should redirect authenticated users
function shouldRedirectAuthenticated(pathname: string): boolean {
  return ['/login', '/register'].includes(pathname);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, locals, redirect, url } = context;

  // Initialize auth state
  locals.user = null;
  locals.isAuthenticated = false;
  locals.isLoading = false;
  locals.error = null;

  // Get JWT token from cookies
  const token = cookies.get('wp_auth_token')?.value;

  if (token) {
    try {
      // Validate token and get user data
      const validationResult = await wp.validateToken(token);

      // Check if token is valid (WordPress returns code: "jwt_auth_valid_token")
      if (
        validationResult.code === 'jwt_auth_valid_token' &&
        validationResult.data?.status === 200
      ) {
        // Token is valid, get user profile
        const userProfile = await wp.getUserProfile(token);

        // Set authentication state
        locals.user = userProfile;
        locals.isAuthenticated = true;

        // If user is already authenticated and trying to access login/register
        if (shouldRedirectAuthenticated(url.pathname)) {
          return redirect('/profile');
        }
      }
    } catch (error) {
      // Token is invalid or expired
      console.error('Auth middleware error:', error);

      // Clear invalid token
      cookies.delete('wp_auth_token', { path: '/' });

      // Set error state
      locals.error = (error as AuthError).message || 'Authentication failed';
    }
  }

  // Check if route requires authentication
  if (!isPublicRoute(url.pathname) && !locals.isAuthenticated) {
    // Store intended destination for redirect after login
    cookies.set('redirect_after_login', url.pathname, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
      maxAge: 60 * 10, // 10 minutes
    });

    return redirect('/login');
  }

  return next();
});
