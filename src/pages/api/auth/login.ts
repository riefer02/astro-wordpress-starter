import type { APIRoute } from 'astro';
import { wp } from '../../../lib/wordpress';
import type { LoginCredentials } from '../../../types';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // Parse form data
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const redirectTo = (formData.get('redirect') as string) || '/profile';

    // Validate required fields
    if (!username || !password) {
      return redirect(
        `/login?error=${encodeURIComponent('Username and password are required')}`
      );
    }

    const credentials: LoginCredentials = {
      username: username.trim(),
      password,
    };

    // Attempt login
    const authResult = await wp.login(credentials);

    if (authResult.token) {
      // Set secure HTTP-only cookie
      cookies.set('wp_auth_token', authResult.token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 14, // 14 days
        sameSite: 'lax',
        secure: import.meta.env.PROD,
        httpOnly: true,
      });

      // Success - redirect to intended destination
      return redirect(redirectTo);
    } else {
      throw new Error('Login failed: No token received');
    }
  } catch (error) {
    console.error('Login API error:', error);

    // Extract error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Login failed. Please check your credentials.';

    // Redirect back to login with error
    return redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
  }
};
