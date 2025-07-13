import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  try {
    // Clear the authentication cookie
    cookies.delete('wp_auth_token', { path: '/' });

    // Redirect to login with success message
    return redirect('/login?message=You have been signed out successfully');
  } catch (error) {
    console.error('Logout API error:', error);

    // Even if there's an error, clear the cookie and redirect
    cookies.delete('wp_auth_token', { path: '/' });
    return redirect('/login?error=Logout completed with errors');
  }
};

// Also support GET for simple logout links
export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('wp_auth_token', { path: '/' });
  return redirect('/login?message=You have been signed out successfully');
};
