<?php

/**
 * Plugin Name: Headless CORS & Authentication
 * Description: Enables CORS headers and custom authentication endpoints for headless WordPress usage
 * Version: 2.0
 * Author: Astro WordPress Starter
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * CORS Configuration
 */
// Enable CORS for REST API
add_action('rest_api_init', function () {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce');
    header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages');
});

// Handle preflight requests
add_action('init', function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce');
        header('Access-Control-Max-Age: 86400');
        status_header(200);
        exit;
    }
});

/**
 * Custom Authentication Endpoints
 */
class HeadlessAuth {

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        // User registration endpoint
        register_rest_route('auth/v1', '/register', array(
            'methods' => 'POST',
            'callback' => array($this, 'register_user'),
            'permission_callback' => '__return_true',
            'args' => array(
                'username' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_user'
                ),
                'email' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_email'
                ),
                'password' => array(
                    'required' => true,
                    'type' => 'string'
                ),
                'first_name' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'last_name' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));

        // User profile endpoint
        register_rest_route('auth/v1', '/profile', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_user_profile'),
            'permission_callback' => array($this, 'is_user_logged_in')
        ));

        // Update user profile endpoint
        register_rest_route('auth/v1', '/profile', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_user_profile'),
            'permission_callback' => array($this, 'is_user_logged_in'),
            'args' => array(
                'first_name' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'last_name' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'email' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_email'
                )
            )
        ));

        // Change password endpoint
        register_rest_route('auth/v1', '/change-password', array(
            'methods' => 'POST',
            'callback' => array($this, 'change_password'),
            'permission_callback' => array($this, 'is_user_logged_in'),
            'args' => array(
                'current_password' => array(
                    'required' => true,
                    'type' => 'string'
                ),
                'new_password' => array(
                    'required' => true,
                    'type' => 'string'
                )
            )
        ));
    }

    /**
     * Register a new user
     */
    public function register_user($request) {
        $username = $request['username'];
        $email = $request['email'];
        $password = $request['password'];
        $first_name = $request['first_name'] ?? '';
        $last_name = $request['last_name'] ?? '';

        // Validate required fields
        if (empty($username) || empty($email) || empty($password)) {
            return new WP_Error('missing_fields', 'Username, email, and password are required.', array('status' => 400));
        }

        // Check if username already exists
        if (username_exists($username)) {
            return new WP_Error('username_exists', 'Username already exists.', array('status' => 400));
        }

        // Check if email already exists
        if (email_exists($email)) {
            return new WP_Error('email_exists', 'Email already exists.', array('status' => 400));
        }

        // Validate email format
        if (!is_email($email)) {
            return new WP_Error('invalid_email', 'Invalid email format.', array('status' => 400));
        }

        // Create user
        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            return $user_id;
        }

        // Set additional user meta
        if (!empty($first_name)) {
            update_user_meta($user_id, 'first_name', $first_name);
        }
        if (!empty($last_name)) {
            update_user_meta($user_id, 'last_name', $last_name);
        }

        // Get user data
        $user = get_user_by('id', $user_id);

        return array(
            'success' => true,
            'message' => 'User registered successfully',
            'user' => array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'first_name' => get_user_meta($user->ID, 'first_name', true),
                'last_name' => get_user_meta($user->ID, 'last_name', true),
                'display_name' => $user->display_name,
                'roles' => $user->roles
            )
        );
    }

    /**
     * Get user profile
     */
    public function get_user_profile($request) {
        $user = wp_get_current_user();

        return array(
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'first_name' => get_user_meta($user->ID, 'first_name', true),
            'last_name' => get_user_meta($user->ID, 'last_name', true),
            'display_name' => $user->display_name,
            'roles' => $user->roles,
            'registered_date' => $user->user_registered
        );
    }

    /**
     * Update user profile
     */
    public function update_user_profile($request) {
        $user = wp_get_current_user();
        $user_id = $user->ID;

        $update_data = array('ID' => $user_id);

        if (!empty($request['email'])) {
            if (!is_email($request['email'])) {
                return new WP_Error('invalid_email', 'Invalid email format.', array('status' => 400));
            }

            // Check if email already exists for another user
            $existing_user = get_user_by('email', $request['email']);
            if ($existing_user && $existing_user->ID !== $user_id) {
                return new WP_Error('email_exists', 'Email already exists.', array('status' => 400));
            }

            $update_data['user_email'] = $request['email'];
        }

        // Update user
        $result = wp_update_user($update_data);

        if (is_wp_error($result)) {
            return $result;
        }

        // Update meta fields
        if (!empty($request['first_name'])) {
            update_user_meta($user_id, 'first_name', $request['first_name']);
        }
        if (!empty($request['last_name'])) {
            update_user_meta($user_id, 'last_name', $request['last_name']);
        }

        return array(
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $this->get_user_profile($request)
        );
    }

    /**
     * Change user password
     */
    public function change_password($request) {
        $user = wp_get_current_user();
        $current_password = $request['current_password'];
        $new_password = $request['new_password'];

        // Verify current password
        if (!wp_check_password($current_password, $user->user_pass, $user->ID)) {
            return new WP_Error('invalid_password', 'Current password is incorrect.', array('status' => 400));
        }

        // Update password
        wp_set_password($new_password, $user->ID);

        return array(
            'success' => true,
            'message' => 'Password changed successfully'
        );
    }

    /**
     * Check if user is logged in
     */
    public function is_user_logged_in() {
        return is_user_logged_in();
    }
}

// Initialize the authentication class
new HeadlessAuth();
