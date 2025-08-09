#!/bin/bash

# WordPress Development Setup Script
# This script sets up a complete WordPress development environment

set -e

echo "🚀 Setting up WordPress development environment..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Compose command helper (supports docker-compose v1 and docker compose v2)
compose_cmd() {
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  elif docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  else
    echo "❌ Neither docker-compose nor docker compose found. Please install Docker Desktop or docker-compose."
    exit 1
  fi
}

# Read only the needed variables from ../.env without sourcing (handles spaces safely)
read_env_var() {
  # usage: read_env_var VAR_NAME DEFAULT_VALUE
  var_name="$1"
  default_value="$2"
  if [ -f ../.env ]; then
    value=$(grep -E "^${var_name}=" ../.env | tail -n1 | cut -d'=' -f2-)
    # Trim surrounding quotes if present
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    if [ -n "$value" ]; then
      echo "$value"
      return 0
    fi
  fi
  echo "$default_value"
}

# Effective values (fallback to common defaults if env not set)
MYSQL_USER_EFF=${MYSQL_USER:-$(read_env_var MYSQL_USER wordpress)}
MYSQL_PASSWORD_EFF=${MYSQL_PASSWORD:-$(read_env_var MYSQL_PASSWORD wordpress)}
MYSQL_DATABASE_EFF=${MYSQL_DATABASE:-$(read_env_var MYSQL_DATABASE wordpress)}
WORDPRESS_DB_PASSWORD_EFF=${WORDPRESS_DB_PASSWORD:-$(read_env_var WORDPRESS_DB_PASSWORD "$MYSQL_PASSWORD_EFF")}

# Warn if WordPress DB password and MySQL password differ (likely misconfig)
if [ -n "${WORDPRESS_DB_PASSWORD_EFF}" ] && [ "${WORDPRESS_DB_PASSWORD_EFF}" != "${MYSQL_PASSWORD_EFF}" ]; then
  echo "⚠️  Warning: WORDPRESS_DB_PASSWORD and MYSQL_PASSWORD differ. WordPress may fail to connect to MySQL."
fi

# Stop any existing containers (preserve data volumes)
echo "🛑 Stopping existing containers..."
compose_cmd --env-file ../.env down

# Start the containers
echo "🐳 Starting WordPress and MySQL containers..."
compose_cmd --env-file ../.env up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if MySQL is ready
echo "🔍 Checking MySQL availability..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if compose_cmd --env-file ../.env exec -T db mysql -u"${MYSQL_USER_EFF}" -p"${MYSQL_PASSWORD_EFF}" -e "SELECT 1" "${MYSQL_DATABASE_EFF}" > /dev/null 2>&1; then
        echo "✅ MySQL is ready!"
        break
    fi
    
    echo "   Attempt $((attempt + 1))/$max_attempts - MySQL not ready yet, waiting..."
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ MySQL failed to start after $max_attempts attempts"
    exit 1
fi

# Wait for WordPress to fully install itself
echo "🔍 Waiting for WordPress to complete installation..."
max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
    # Check if WordPress installation page is NOT showing (means it's installed)
    if curl -s http://localhost:8080 | grep -q "wp-admin/install.php" 2>/dev/null; then
        echo "   Attempt $((attempt + 1))/$max_attempts - WordPress still installing, waiting..."
        sleep 10
        attempt=$((attempt + 1))
    else
        echo "✅ WordPress installation completed!"
        break
    fi
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ WordPress installation timed out after $max_attempts attempts"
    exit 1
fi

# WordPress initialization functions
wp_cli() {
    # Use wp-cli container with profile (should not recreate existing containers)
    compose_cmd --env-file ../.env --profile cli run --rm wp-cli wp "$@" --allow-root --path=/var/www/html
}

# Wait for wp-cli to be able to connect to database
echo "🔍 Checking wp-cli database connectivity..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if wp_cli config path 2>/dev/null; then
        echo "✅ wp-cli can connect to database!"
        break
    fi
    
    echo "   Attempt $((attempt + 1))/$max_attempts - wp-cli database not ready, waiting..."
    sleep 10
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ wp-cli database connection failed after $max_attempts attempts"
    exit 1
fi

# Run WordPress initialization
echo "🔧 Initializing WordPress..."

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
wp_cli rewrite structure '/%postname%/' --hard || true

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
wp_cli plugin install all-in-one-wp-migration --activate || true

# Install JWT Authentication plugin for headless authentication
echo "🔐 Installing JWT Authentication plugin..."
wp_cli plugin install jwt-authentication-for-wp-rest-api --activate || true

# Activate our custom CORS plugin
echo "🌐 Activating CORS plugin..."
wp_cli plugin activate headless-cors || true

# Set some useful options
echo "⚙️ Configuring WordPress options..."
wp_cli option update show_on_front 'posts' || true
wp_cli option update posts_per_page 10 || true
wp_cli option update use_smilies 0 || true
wp_cli option update default_ping_status 'closed' || true
wp_cli option update default_comment_status 'closed' || true

# JWT Authentication is configured via environment variables in docker-compose.yml
echo "✅ JWT Authentication configured via environment variables"

echo "✅ WordPress development environment is ready!"
echo ""
echo "🎯 Access URLs:"
echo "   WordPress Admin: http://localhost:8080/wp-admin"
echo "   Username: admin"
echo "   Password: password"
echo "   REST API: http://localhost:8080/wp-json/wp/v2"
echo "   Sample Posts: http://localhost:8080/wp-json/wp/v2/posts"
echo "   Sample Pages: http://localhost:8080/wp-json/wp/v2/pages"
echo "   JWT Login: http://localhost:8080/wp-json/jwt-auth/v1/token"
echo "   User Registration: http://localhost:8080/wp-json/auth/v1/register"
echo "   MySQL Database: localhost:3328 (wordpress/wordpress)"
echo ""
echo "🔄 To restart the environment:"
echo "   npm run wp:local"
echo ""
echo "🛑 To stop the environment:"
echo "   npm run wp:stop"
echo ""
echo "📝 Update your .env file with:"
echo "   WP_LOCAL_API_URL=http://localhost:8080/wp-json"
echo ""
echo "🚀 Ready for Astro development!" 