<?php

/**
 * Plugin Name: Headless CORS
 * Description: Enables CORS headers for headless WordPress usage
 * Version: 1.0
 * Author: Astro WordPress Starter
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Enable CORS for REST API
add_action('rest_api_init', function () {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
});

// Handle preflight requests
add_action('init', function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 86400');
        status_header(200);
        exit;
    }
});
