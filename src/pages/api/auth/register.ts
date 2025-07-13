import type { APIRoute } from 'astro';
import { wp } from '../../../lib/wordpress';
import type { RegisterCredentials } from '../../../types';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    // Parse form data
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    const firstName = formData.get('first-name') as string;
    const lastName = formData.get('last-name') as string;

    // Validate required fields
    if (!username || !email || !password) {
      return redirect(
        `/register?error=${encodeURIComponent('Username, email, and password are required')}`
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return redirect(
        `/register?error=${encodeURIComponent('Passwords do not match')}`
      );
    }

    // Validate password strength (basic check)
    if (password.length < 6) {
      return redirect(
        `/register?error=${encodeURIComponent('Password must be at least 6 characters long')}`
      );
    }

    const credentials: RegisterCredentials = {
      username: username.trim(),
      email: email.trim(),
      password,
      first_name: firstName?.trim() || '',
      last_name: lastName?.trim() || '',
    };

    // Attempt registration
    const response = await wp.register(credentials);

    if (response.success && response.user?.id) {
      // Success - redirect to login with success message
      const successMessage = `Account created successfully! Welcome ${response.user.display_name || username}. Please log in.`;
      return redirect(`/login?message=${encodeURIComponent(successMessage)}`);
    } else {
      throw new Error('Registration failed: User not created');
    }
  } catch (error) {
    console.error('Registration API error:', error);

    // Extract error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.';

    // Redirect back to register with error
    return redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
  }
};
