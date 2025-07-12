#!/bin/bash

# WordPress Auto-Configuration Script
# This script runs after WordPress is installed to set up a development environment

# Wait for WordPress to be ready
sleep 30

# Function to run wp-cli commands
wp_cli() {
    docker-compose exec -T wp-cli wp "$@" --allow-root --path=/var/www/html
}

# Check if WordPress is already configured
if wp_cli core is-installed 2>/dev/null; then
    echo "WordPress is already configured, skipping setup..."
    exit 0
fi

echo "Setting up WordPress for development..."

# Install WordPress with default settings
wp_cli core install \
    --url="http://localhost:8080" \
    --title="Astro WordPress Development" \
    --admin_user="admin" \
    --admin_password="password" \
    --admin_email="admin@example.com"

# Install and activate useful plugins for headless development
wp_cli plugin install \
    custom-post-type-ui \
    advanced-custom-fields \
    --activate

# Set pretty permalinks
wp_cli rewrite structure '/%postname%/'

# Create sample content
wp_cli post create \
    --post_type=post \
    --post_title="Welcome to Astro WordPress" \
    --post_content="This is a sample post created automatically for development. You can see this content in your Astro frontend via the WordPress REST API." \
    --post_status=publish

wp_cli post create \
    --post_type=post \
    --post_title="Another Sample Post" \
    --post_content="This is another sample post to demonstrate multiple posts in your Astro frontend. The WordPress REST API makes it easy to fetch and display content." \
    --post_status=publish

# Create sample pages
wp_cli post create \
    --post_type=page \
    --post_title="About Us" \
    --post_content="This is the about page content. You can fetch pages using the WordPress REST API at /wp-json/wp/v2/pages" \
    --post_status=publish

wp_cli post create \
    --post_type=page \
    --post_title="Contact" \
    --post_content="Contact us at info@example.com or call (555) 123-4567" \
    --post_status=publish

# Enable CORS for headless usage
wp_cli config set WP_DEBUG true
wp_cli config set WP_DEBUG_LOG true
wp_cli config set WP_DEBUG_DISPLAY false

echo "WordPress setup completed!"
echo "Admin URL: http://localhost:8080/wp-admin"
echo "Username: admin"
echo "Password: password"
echo "API URL: http://localhost:8080/wp-json" 