# Dynamic WordPress Type Generation

This project includes a powerful type generation system that automatically creates TypeScript types from your WordPress REST API endpoints, including custom post types and ACF (Advanced Custom Fields) fields.

## 🚀 Quick Start

### 1. Configure Your WordPress URL

Create a `.env` file in your project root:

```bash
# Local WordPress (default)
WP_API_URL=http://localhost:8080

# Or your production WordPress URL
WP_API_URL=https://your-wordpress-site.com
```

### 2. Generate Types

Run the type generation script:

```bash
npm run types:generate
```

This will create type definitions in `src/types/wordpress.d.ts` based on your WordPress installation.

### 3. Use the Generated Types

```typescript
import { wp } from './lib/wordpress';
import type { WordPressPost, WordPressPage } from './types';

// Fetch posts with full type safety
const posts: WordPressPost[] = await wp.fetchPosts({
  per_page: 10,
  status: 'publish',
});

// Access ACF fields with type safety
const post = await wp.fetchPost('my-post-slug');
if (post?.acf) {
  // ACF fields are typed based on your field groups
  console.log(post.acf.my_custom_field);
}
```

## 🔧 Available Scripts

- `npm run types:generate` - Generate types from WordPress API
- `npm run types:watch` - Watch for changes and regenerate types
- `npm run build` - Build the project (includes type generation)

## 📋 What Gets Generated

### Base Types

- `WordPressPost` - Standard WordPress post type
- `WordPressPage` - WordPress page type
- `WordPressAuthor` - Author information
- `WordPressMedia` - Media/attachment details
- `WordPressCategory` - Category taxonomy
- `WordPressTag` - Tag taxonomy
- `WordPressError` - Error handling

### Custom Post Types

The generator automatically detects and creates types for:

- Custom post types registered in WordPress
- Each custom post type gets its own interface (e.g., `WordPressProduct`, `WordPressEvent`)

### ACF Field Types

If ACF (Advanced Custom Fields) is installed, the generator creates:

- Typed interfaces for each field group
- Proper TypeScript types for each field type:
  - `text` → `string`
  - `number` → `number`
  - `true_false` → `boolean`
  - `image` → `WordPressMedia`
  - `repeater` → `Record<string, any>[]`
  - And many more...

## 🎯 WordPress Client Features

The enhanced WordPress client provides:

### Basic Fetching

```typescript
// Fetch multiple posts
const posts = await wp.fetchPosts();

// Fetch single post by slug
const post = await wp.fetchPost('my-post-slug');

// Fetch post by ID
const post = await wp.fetchPostById(123);
```

### Advanced Filtering

```typescript
// Search posts
const results = await wp.searchPosts('search term');

// Filter by category
const posts = await wp.getPostsByCategory(5);

// Filter by tag
const posts = await wp.getPostsByTag(12);

// Filter by author
const posts = await wp.getPostsByAuthor(1);

// Complex filtering
const posts = await wp.fetchPosts({
  per_page: 20,
  categories: [1, 2, 3],
  orderby: 'date',
  order: 'desc',
  meta_key: 'featured',
  meta_value: 'true',
});
```

### Custom Post Types

```typescript
// Fetch custom post type
const products = await wp.fetchCustomPosts('products');

// With filtering
const featuredProducts = await wp.fetchCustomPosts('products', {
  meta_key: 'featured',
  meta_value: 'true',
});
```

### Error Handling

```typescript
try {
  const post = await wp.fetchPost('non-existent');
} catch (error) {
  if (error.code === 'fetch_error') {
    console.log('Post not found:', error.message);
  }
}
```

## 🔄 Automatic Type Updates

### In Development

The types are automatically regenerated when you run `npm run dev` or `npm run build`.

### In Production

Types are generated during the build process, ensuring your production build has the latest types.

## 🛠️ Customization

### Custom Field Types

You can extend the type generator to handle custom field types by modifying the `getACFFieldType` method in `scripts/generate-types.ts`.

### Additional Post Types

The generator automatically detects all registered post types. No manual configuration needed!

### Cache Control

The WordPress client includes intelligent caching:

- 5-minute cache by default
- Cache per endpoint and parameters
- Manual cache clearing: `wp.clearCache()`
- Cache statistics: `wp.getCacheStats()`

## 🚨 Important Notes

1. **Generated files are ignored by git** - The `wordpress.d.ts` file is generated automatically and should not be manually edited.

2. **WordPress must be running** - The type generator needs to connect to your WordPress instance to fetch the API schema.

3. **ACF Pro recommended** - For advanced ACF field types, ACF Pro provides better REST API support.

4. **Environment variables** - Make sure to set `WP_API_URL` in your environment or `.env` file.

## 🔍 Troubleshooting

### "WordPress routes not found"

- Ensure your WordPress site is running
- Check your `WP_API_URL` is correct
- Verify REST API is enabled in WordPress

### "ACF types not generated"

- Ensure ACF plugin is installed and activated
- Check that field groups exist in your WordPress admin
- Verify ACF REST API is enabled

### "Types not updating"

- Run `npm run types:generate` manually
- Clear cache with `wp.clearCache()`
- Check for WordPress API errors in the console

## 🎉 Benefits

- **Type Safety**: Full TypeScript support for all WordPress data
- **Auto-completion**: IDE suggestions for all WordPress fields
- **Error Prevention**: Catch type mismatches at compile time
- **Scalability**: Automatically handles new custom fields and post types
- **Performance**: Built-in caching reduces API calls
- **Developer Experience**: No manual type maintenance required
