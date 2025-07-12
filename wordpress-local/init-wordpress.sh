#!/bin/bash

# WordPress Auto-Configuration Script
# This script sets up WordPress with sample content for development

set -e

echo "🔧 Configuring WordPress for development..."

# Wait for WordPress to be ready
echo "⏳ Waiting for WordPress to be ready..."
sleep 15

# Function to run wp-cli commands
wp_cli() {
    docker-compose run --rm wp-cli wp "$@" --allow-root --path=/var/www/html
}

# Check if WordPress is already installed
echo "🔍 Checking if WordPress is installed..."
if wp_cli core is-installed 2>/dev/null; then
    echo "✅ WordPress is already installed!"
else
    echo "📦 Installing WordPress..."
    wp_cli core install \
        --url="http://localhost:8080" \
        --title="Astro WordPress Development" \
        --admin_user="admin" \
        --admin_password="password" \
        --admin_email="admin@example.com" \
        --skip-email
fi

# Set pretty permalinks for REST API
echo "🔗 Setting up permalinks..."
wp_cli rewrite structure '/%postname%/' --hard

# Create sample content
echo "📝 Creating sample content..."

# Create sample posts
wp_cli post create \
    --post_type=post \
    --post_title="Welcome to Astro WordPress" \
    --post_content="<h2>Welcome to your new headless WordPress setup!</h2><p>This is a sample post created automatically for development. You can see this content in your Astro frontend via the WordPress REST API.</p><p>Key features of this setup:</p><ul><li>WordPress REST API enabled</li><li>CORS configured for headless usage</li><li>Sample content for testing</li><li>Development-ready configuration</li></ul>" \
    --post_status=publish \
    --post_author=1 || true

wp_cli post create \
    --post_type=post \
    --post_title="Building with Astro and WordPress" \
    --post_content="<h2>Modern Development Stack</h2><p>This template combines the power of WordPress as a headless CMS with Astro's modern frontend capabilities.</p><p>Benefits include:</p><ul><li>Fast static site generation</li><li>Familiar WordPress admin interface</li><li>TypeScript support</li><li>Modern component architecture</li></ul>" \
    --post_status=publish \
    --post_author=1 || true

wp_cli post create \
    --post_type=post \
    --post_title="REST API Integration" \
    --post_content="<h2>Seamless API Integration</h2><p>Access your WordPress content through the REST API endpoints:</p><ul><li><code>/wp-json/wp/v2/posts</code> - All posts</li><li><code>/wp-json/wp/v2/pages</code> - All pages</li><li><code>/wp-json/wp/v2/media</code> - Media files</li></ul>" \
    --post_status=publish \
    --post_author=1 || true

# Create sample pages
echo "📄 Creating sample pages..."
wp_cli post create \
    --post_type=page \
    --post_title="About Us" \
    --post_content="<h2>About Our Organization</h2><p>This is the about page content. You can fetch pages using the WordPress REST API at <code>/wp-json/wp/v2/pages</code>.</p><p>This page demonstrates how to handle static content in your headless WordPress setup.</p>" \
    --post_status=publish \
    --post_author=1 || true

wp_cli post create \
    --post_type=page \
    --post_title="Contact" \
    --post_content="<h2>Get in Touch</h2><p>Contact us at <strong>info@example.com</strong> or call <strong>(555) 123-4567</strong>.</p><p>This contact page shows how to structure contact information in your headless WordPress site.</p>" \
    --post_status=publish \
    --post_author=1 || true

# Install useful plugins for headless development
echo "🔌 Installing useful plugins..."
wp_cli plugin install custom-post-type-ui --activate || true
wp_cli plugin install advanced-custom-fields --activate || true

# Activate our custom CORS plugin
echo "🌐 Activating CORS plugin..."
wp_cli plugin activate headless-cors || true

# Set some useful options
echo "⚙️ Configuring WordPress options..."
wp_cli option update show_on_front 'posts'
wp_cli option update posts_per_page 10
wp_cli option update use_smilies 0
wp_cli option update default_ping_status 'closed'
wp_cli option update default_comment_status 'closed'

echo "✅ WordPress setup completed successfully!"
echo ""
echo "🎯 Access URLs:"
echo "   WordPress Admin: http://localhost:8080/wp-admin"
echo "   Username: admin"
echo "   Password: password"
echo "   REST API: http://localhost:8080/wp-json/wp/v2"
echo "   Sample Posts: http://localhost:8080/wp-json/wp/v2/posts"
echo "   Sample Pages: http://localhost:8080/wp-json/wp/v2/pages"
echo ""
echo "🚀 Ready for Astro development!" 