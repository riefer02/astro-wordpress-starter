import type { APIRoute } from 'astro';
import { wp } from '../../../lib/wordpress';
import type { UpdateProfileData } from '../../../types';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // Get auth token from cookies
    const token = cookies.get('wp_auth_token')?.value;
    if (!token) {
      return redirect('/login?error=Please log in to update your profile');
    }

    // Parse form data
    const formData = await request.formData();
    const firstName = formData.get('first-name') as string;
    const lastName = formData.get('last-name') as string;
    const displayName = formData.get('display-name') as string;
    const email = formData.get('email') as string;

    // Validate required fields
    if (!email) {
      return redirect('/profile?error=Email is required');
    }

    const updateData: UpdateProfileData = {
      first_name: firstName?.trim() || '',
      last_name: lastName?.trim() || '',
      display_name: displayName?.trim() || '',
      email: email.trim(),
    };

    // Attempt profile update
    const updatedUser = await wp.updateProfile(token, updateData);

    if (updatedUser.id) {
      // Success - redirect back to profile with success message
      return redirect('/profile?message=Profile updated successfully');
    } else {
      throw new Error('Profile update failed');
    }
  } catch (error) {
    console.error('Profile update API error:', error);

    // Extract error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to update profile. Please try again.';

    // Redirect back to profile with error
    return redirect(`/profile?error=${encodeURIComponent(errorMessage)}`);
  }
};
