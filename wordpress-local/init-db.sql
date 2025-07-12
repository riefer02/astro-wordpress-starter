-- Database initialization for WordPress development
-- This ensures consistent database setup across all environments

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS wordpress;

-- Use the wordpress database
USE wordpress;

-- Set timezone
SET time_zone = '+00:00';

-- Create additional development users if needed
-- (WordPress will create its own tables on first run) 