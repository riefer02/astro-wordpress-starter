# Astro WordPress Starter

A modern, fast, and developer-friendly template for building headless WordPress sites with Astro, React, and Shadcn/ui.

## 🚀 Features

- **⚡ Fast**: Built with Astro for optimal performance
- **🎨 Modern UI**: Shadcn/ui components with Tailwind CSS
- **⚛️ React Integration**: Interactive components where needed
- **🔧 TypeScript**: Full type safety
- **🐳 Docker Ready**: Local WordPress development environment
- **📱 Responsive**: Mobile-first design
- **🔍 SEO Optimized**: Built-in SEO best practices
- **🔌 WordPress API**: Easy integration with WordPress REST API

## 📦 What's Included

- **Astro 5.x+** - Static site generation with partial hydration
- **React 19** - Client-side interactivity
- **Shadcn/ui** - Modern, accessible component library
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety
- **Docker Setup** - Local WordPress development
- **WordPress API Client** - TypeScript client with caching

## 🛠️ Project Structure

```
astro-wordpress-starter/
├── src/
│   ├── components/          # Astro components
│   │   ├── ui/             # Shadcn/ui components
│   │   └── react/          # React interactive components
│   ├── layouts/            # Page layouts
│   ├── pages/              # Astro pages/routes
│   ├── lib/                # WordPress API client & utilities
│   └── styles/             # Global styles
├── wordpress-local/        # Local WordPress Docker setup
│   └── docker-compose.yml  # WordPress + MySQL
├── public/                 # Static assets
├── astro.config.mjs        # Astro configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json
```

## 🚀 Quick Start

**TL;DR: Copy env file → Start WordPress → Run dev server → Everything should work! 🤞**

### 1. Clone & Install

```bash
git clone https://github.com/your-org/astro-wordpress-starter.git
cd astro-wordpress-starter
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
# Copy environment variables from example
cp .env.example .env
```

The `.env.example` file includes all the necessary configuration for local development with Docker.

### 3. Start WordPress

```bash
# This sets up everything you need - WordPress, database, plugins, sample content
npm run wp:setup
```

This will:

- Start WordPress on http://localhost:8080
- Auto-configure admin user (admin/password)
- Install useful plugins (ACF, Custom Post Types, etc.)
- Set up CORS for headless usage
- Create sample content

### 4. Generate Types (Optional but Recommended)

```bash
# Generate TypeScript types from your WordPress API
npm run types:generate
```

This creates type-safe interfaces for your WordPress content, including custom post types and ACF fields.

### 5. Start Development Server

```bash
# In a new terminal window
npm run dev
```

Visit `http://localhost:4321` - your site should be running with WordPress content!

### 6. Access WordPress Admin

- **WordPress Admin**: http://localhost:8080/wp-admin
- **Username**: admin
- **Password**: password
- **REST API**: http://localhost:8080/wp-json

---

**That's it!** If you run into issues, check the troubleshooting section below.

## 🐳 Local WordPress Development

### First-time Setup

```bash
# Complete setup (only needed once)
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

### Team Collaboration

```bash
# Create database backup for sharing
npm run wp:backup

# Restore database from backup
npm run wp:restore

# Clean restart (removes all data)
npm run wp:clean
```

**Data Persistence**: Your WordPress data is automatically saved in Docker volumes and won't be lost when containers restart!

## 🔧 Configuration

### WordPress API Client

The WordPress API client is configured in `src/lib/wordpress.ts`:

```typescript
export const wp = new WordPressClient(
  import.meta.env.WP_API_URL || 'https://your-wordpress-site.com/wp-json'
);
```

### Environment Variables

- `WP_API_URL`: Your WordPress site's API URL
- `WP_LOCAL_API_URL`: Local WordPress API URL (optional)

## 📝 Usage Examples

### Fetching Posts

```typescript
import { wp } from '@/lib/wordpress';

// Get recent posts
const posts = await wp.fetchPosts({ per_page: 10 });

// Get a specific post
const post = await wp.fetchPost('post-slug');

// Get pages
const pages = await wp.fetchPages();
```

### Using Components

```astro
---
import PostCard from '@/components/PostCard.astro';
import SearchPosts from '@/components/react/SearchPosts';
import { wp } from '@/lib/wordpress';

const posts = await wp.fetchPosts({ per_page: 6 });
---

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.map((post) => <PostCard post={post} />)}
</div>

<SearchPosts client:load wpApiUrl={import.meta.env.WP_API_URL} />
```

## 🎨 Styling

The template uses Tailwind CSS and Shadcn/ui components. You can customize:

### Tailwind Configuration

Edit `tailwind.config.js` to customize colors, fonts, and other design tokens.

### Shadcn/ui Components

Add more components:

```bash
npx shadcn@latest add button card input badge
```

## 🏗️ Building & Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify settings

### Deploy to Vercel

1. Connect your repository to Vercel
2. Vercel will automatically detect Astro
3. Add environment variables in Vercel settings

## 🔍 SEO Features

- Meta tags and Open Graph
- Canonical URLs
- Structured markup ready
- Sitemap generation
- Fast loading times

## 📚 Learn More

- [Astro Documentation](https://astro.build)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Tips

- Use `client:load` directive for React components that need interactivity
- WordPress API responses are cached for 5 minutes to improve performance
- The template works with any WordPress site that has the REST API enabled
- For better performance, consider using WordPress with WP GraphQL plugin

## 🆘 Troubleshooting

### CORS Issues

If you encounter CORS issues, add this to your WordPress theme's `functions.php`:

```php
add_action('rest_api_init', function () {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
});
```

### WordPress API Not Working

1. Ensure WordPress REST API is enabled
2. Check that the API URL is correct
3. Verify that the WordPress site is accessible
4. Check for any authentication requirements

---

Built with ❤️ using Astro, React, and Shadcn/ui
