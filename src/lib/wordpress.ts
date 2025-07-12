interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

interface WordPressPage {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  slug: string;
  date: string;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

class WordPressClient {
  private baseUrl: string;
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchPosts(
    params: { page?: number; per_page?: number } = {}
  ): Promise<WordPressPost[]> {
    const cacheKey = `posts-${JSON.stringify(params)}`;

    // Simple 5-minute cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }

    const url = new URL(`${this.baseUrl}/wp/v2/posts`);
    url.searchParams.append("_embed", "wp:featuredmedia");
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const posts = await response.json();
    this.cache.set(cacheKey, { data: posts, timestamp: Date.now() });
    return posts;
  }

  async fetchPost(slug: string): Promise<WordPressPost | null> {
    const cacheKey = `post-${slug}`;

    // Simple 5-minute cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }

    const url = `${this.baseUrl}/wp/v2/posts?slug=${slug}&_embed=wp:featuredmedia`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const posts = await response.json();
    const post = posts[0] || null;

    this.cache.set(cacheKey, { data: post, timestamp: Date.now() });
    return post;
  }

  async fetchPage(slug: string): Promise<WordPressPage | null> {
    const cacheKey = `page-${slug}`;

    // Simple 5-minute cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }

    const url = `${this.baseUrl}/wp/v2/pages?slug=${slug}&_embed=wp:featuredmedia`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const pages = await response.json();
    const page = pages[0] || null;

    this.cache.set(cacheKey, { data: page, timestamp: Date.now() });
    return page;
  }

  async fetchPages(
    params: { page?: number; per_page?: number } = {}
  ): Promise<WordPressPage[]> {
    const cacheKey = `pages-${JSON.stringify(params)}`;

    // Simple 5-minute cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }

    const url = new URL(`${this.baseUrl}/wp/v2/pages`);
    url.searchParams.append("_embed", "wp:featuredmedia");
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.statusText}`);
    }

    const pages = await response.json();
    this.cache.set(cacheKey, { data: pages, timestamp: Date.now() });
    return pages;
  }
}

export const wp = new WordPressClient(
  import.meta.env.WP_API_URL || "https://your-wordpress-site.com/wp-json"
);

export type { WordPressPost, WordPressPage };
