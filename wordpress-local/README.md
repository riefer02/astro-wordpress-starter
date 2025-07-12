# WordPress Development Environment

This directory contains a complete WordPress development environment using Docker. It's designed for smooth team collaboration and persistent data management.

## 🚀 Quick Start

### First-time Setup

```bash
# Run the complete setup (includes WordPress installation and sample content)
npm run wp:setup
```

### Daily Development

```bash
# Start WordPress environment
npm run wp:local

# Stop WordPress environment
npm run wp:stop

# View logs
npm run wp:logs
```

## 🎯 Access Points

After setup, you can access:

- **WordPress Admin**: http://localhost:8080/wp-admin
- **Username**: admin
- **Password**: password
- **REST API**: http://localhost:8080/wp-json
- **Sample Posts**: http://localhost:8080/wp-json/wp/v2/posts

## 📁 Data Persistence

Data is automatically persisted using Docker volumes:

- `wp_content` - WordPress uploads, themes, plugins
- `db_data` - MySQL database data

**Your data won't be lost when containers restart!**

## 👥 Team Collaboration

### For New Team Members

1. Clone the repository
2. Run `npm install`
3. Run `npm run wp:setup`
4. Start developing with `npm run dev`

### Sharing Database State

```bash
# Create a backup of current database
npm run wp:backup

# Restore database from backup
npm run wp:restore
```

### Sharing wp-content

The `wp-content` folder is persistent via Docker volumes. To share uploads/themes:

1. Copy files to your local `wp-content` folder
2. They'll be automatically available in the container

## 🛠️ Available Scripts

| Script               | Description                                   |
| -------------------- | --------------------------------------------- |
| `npm run wp:setup`   | Complete first-time setup with sample content |
| `npm run wp:local`   | Start WordPress containers                    |
| `npm run wp:stop`    | Stop WordPress containers                     |
| `npm run wp:restart` | Restart WordPress containers                  |
| `npm run wp:logs`    | View WordPress logs                           |
| `npm run wp:clean`   | Clean up all containers and volumes           |
| `npm run wp:backup`  | Export database to backup.sql                 |
| `npm run wp:restore` | Import database from backup.sql               |

## 🔧 Configuration

### Environment Variables

Update your `.env` file in the project root:

```bash
WP_API_URL=http://localhost:8080/wp-json
```

### WordPress Configuration

WordPress is automatically configured with:

- **Debug mode enabled** for development
- **CORS headers** for headless usage
- **Pretty permalinks** enabled
- **Useful plugins** installed and activated

### Pre-installed Plugins

- Custom Post Type UI
- Advanced Custom Fields
- WP CORS

## 🐳 Docker Services

- **wordpress**: WordPress 6.x with Apache
- **db**: MySQL 8.0 database
- **wp-cli**: WordPress CLI for management

## 📝 Sample Content

The setup automatically creates:

- **2 sample posts** for testing
- **2 sample pages** (About, Contact)
- **Proper permalinks** structure

## 🆘 Troubleshooting

### WordPress not accessible

```bash
# Check container status
npm run wp:logs

# Restart containers
npm run wp:restart
```

### Database connection errors

```bash
# Clean restart
npm run wp:clean
npm run wp:setup
```

### Permission issues

```bash
# Fix file permissions
docker-compose exec wordpress chown -R www-data:www-data /var/www/html
```

### Need to reset everything?

```bash
# Nuclear option - removes all data
npm run wp:clean
npm run wp:setup
```

## 🔄 Backup Strategy

### Regular Backups

```bash
# Create daily backup
npm run wp:backup

# Backup files are saved as wordpress-local/backup.sql
```

### Version Control

- Database backups can be committed to version control
- wp-content uploads are persistent via Docker volumes
- Configuration is stored in version-controlled files

## 💡 Pro Tips

1. **Use WP-CLI**: Access WordPress CLI with `docker-compose exec wordpress wp --allow-root`
2. **Import/Export**: Use backup/restore scripts for sharing database state
3. **Plugin Development**: Mount your plugins directly into wp-content
4. **Theme Development**: Mount your themes directly into wp-content
5. **API Testing**: Use http://localhost:8080/wp-json/wp/v2/ endpoints
