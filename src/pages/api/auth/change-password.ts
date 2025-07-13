import type { APIRoute } from 'astro';
import { wp } from '../../../lib/wordpress';
import type { ChangePasswordData } from '../../../types';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // Get auth token from cookies
    const token = cookies.get('wp_auth_token')?.value;
    if (!token) {
      return redirect('/login?error=Please log in to change your password');
    }

    // Parse form data
    const formData = await request.formData();
    const currentPassword = formData.get('current-password') as string;
    const newPassword = formData.get('new-password') as string;
    const confirmNewPassword = formData.get('confirm-new-password') as string;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return redirect('/profile?error=All password fields are required');
    }

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      return redirect('/profile?error=New passwords do not match');
    }

    // Validate password strength (basic check)
    if (newPassword.length < 6) {
      return redirect(
        '/profile?error=New password must be at least 6 characters long'
      );
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return redirect(
        '/profile?error=New password must be different from current password'
      );
    }

    const passwordData: ChangePasswordData = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    // Attempt password change
    await wp.changePassword(token, passwordData);

    // Success - redirect back to profile with success message
    return redirect('/profile?message=Password changed successfully');
  } catch (error) {
    console.error('Password change API error:', error);

    // Extract error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to change password. Please try again.';

    // Redirect back to profile with error
    return redirect(`/profile?error=${encodeURIComponent(errorMessage)}`);
  }
};
