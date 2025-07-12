#!/bin/bash

# WordPress Development Setup Script
# This script sets up a complete WordPress development environment

set -e

echo "🚀 Setting up WordPress development environment..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Make init script executable
chmod +x init-wordpress.sh

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v

# Start the containers
echo "🐳 Starting WordPress and MySQL containers..."
docker-compose up -d

echo "⏳ Waiting for WordPress to be ready..."
sleep 30

# Check if WordPress is accessible
echo "🔍 Checking WordPress availability..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8080 > /dev/null; then
        echo "✅ WordPress is ready!"
        break
    fi
    
    echo "   Attempt $((attempt + 1))/$max_attempts - WordPress not ready yet, waiting..."
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ WordPress failed to start after $max_attempts attempts"
    exit 1
fi

# Run WordPress initialization
echo "🔧 Initializing WordPress..."
docker-compose exec -T wordpress bash /usr/local/bin/init-wordpress.sh

echo "✅ WordPress development environment is ready!"
echo ""
echo "🎯 Access URLs:"
echo "   WordPress Admin: http://localhost:8080/wp-admin"
echo "   Username: admin"
echo "   Password: password"
echo "   REST API: http://localhost:8080/wp-json"
echo "   Sample Posts: http://localhost:8080/wp-json/wp/v2/posts"
echo ""
echo "🔄 To restart the environment:"
echo "   npm run wp:local"
echo ""
echo "🛑 To stop the environment:"
echo "   npm run wp:stop"
echo ""
echo "📝 Update your .env file with:"
echo "   WP_LOCAL_API_URL=http://localhost:8080/wp-json" 