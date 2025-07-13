import type {
  WordPressPost,
  WordPressPage,
  WordPressError,
  WordPressEmbedded,
  User,
  AuthToken,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileData,
  ChangePasswordData,
  AuthResponse,
  AuthError,
  JWTValidationResponse,
} from '../types';

interface FetchOptions {
  page?: number;
  per_page?: number;
  search?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
  include?: number[];
  exclude?: number[];
  offset?: number;
  slug?: string;
  status?: string;
  categories?: number[];
  tags?: number[];
  author?: number;
  before?: string;
  after?: string;
  meta_key?: string;
  meta_value?: string;
  [key: string]: any;
}

class WordPressClient {
  private baseUrl: string;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl: string) {
    // Clean up the base URL and ensure it's properly formatted
    this.baseUrl = this.normalizeBaseUrl(baseUrl);
  }

  private normalizeBaseUrl(url: string): string {
    // Remove trailing slash
    url = url.replace(/\/$/, '');

    // If the URL already contains /wp-json, use it as-is
    if (url.includes('/wp-json')) {
      return url;
    }

    // Otherwise, add /wp-json
    return `${url}/wp-json`;
  }

  private async fetchWithError<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: WordPressError = {
        code: errorData.code || 'fetch_error',
        message:
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        data: {
          status: response.status,
          ...errorData.data,
        },
      };
      throw error;
    }

    return response.json();
  }

  private getCacheKey(
    endpoint: string,
    params: Record<string, any> = {}
  ): string {
    return `${endpoint}-${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private buildUrl(endpoint: string, params: FetchOptions = {}): string {
    const url = new URL(`${this.baseUrl}/wp/v2/${endpoint}`);

    // Always embed media and author by default
    if (!params._embed) {
      url.searchParams.append('_embed', 'wp:featuredmedia,author');
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          url.searchParams.append(key, value.join(','));
        } else {
          url.searchParams.append(key, value.toString());
        }
      }
    });

    return url.toString();
  }

  /**
   * Fetch multiple posts with filtering and pagination
   */
  async fetchPosts(params: FetchOptions = {}): Promise<WordPressPost[]> {
    const cacheKey = this.getCacheKey('posts', params);
    const cached = this.getFromCache<WordPressPost[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const url = this.buildUrl('posts', params);
    const posts = await this.fetchWithError<WordPressPost[]>(url);

    this.setCache(cacheKey, posts);
    return posts;
  }

  /**
   * Fetch a single post by slug
   */
  async fetchPost(slug: string): Promise<WordPressPost | null> {
    const cacheKey = this.getCacheKey('post', { slug });
    const cached = this.getFromCache<WordPressPost | null>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const url = this.buildUrl('posts', { slug });
    const posts = await this.fetchWithError<WordPressPost[]>(url);
    const post = posts[0] || null;

    this.setCache(cacheKey, post);
    return post;
  }

  /**
   * Fetch a single post by ID
   */
  async fetchPostById(id: number): Promise<WordPressPost | null> {
    const cacheKey = this.getCacheKey('post', { id });
    const cached = this.getFromCache<WordPressPost | null>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const url = this.buildUrl(`posts/${id}`);
    try {
      const post = await this.fetchWithError<WordPressPost>(url);
      this.setCache(cacheKey, post);
      return post;
    } catch (error) {
      if ((error as WordPressError).data?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetch multiple pages with filtering and pagination
   */
  async fetchPages(params: FetchOptions = {}): Promise<WordPressPage[]> {
    const cacheKey = this.getCacheKey('pages', params);
    const cached = this.getFromCache<WordPressPage[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const url = this.buildUrl('pages', params);
    const pages = await this.fetchWithError<WordPressPage[]>(url);

    this.setCache(cacheKey, pages);
    return pages;
  }

  /**
   * Fetch a single page by slug
   */
  async fetchPage(slug: string): Promise<WordPressPage | null> {
    const cacheKey = this.getCacheKey('page', { slug });
    const cached = this.getFromCache<WordPressPage | null>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const url = this.buildUrl('pages', { slug });
    const pages = await this.fetchWithError<WordPressPage[]>(url);
    const page = pages[0] || null;

    this.setCache(cacheKey, page);
    return page;
  }

  /**
   * Fetch posts from a custom post type
   */
  async fetchCustomPosts<T = any>(
    postType: string,
    params: FetchOptions = {}
  ): Promise<T[]> {
    const cacheKey = this.getCacheKey(postType, params);
    const cached = this.getFromCache<T[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const url = this.buildUrl(postType, params);
    const posts = await this.fetchWithError<T[]>(url);

    this.setCache(cacheKey, posts);
    return posts;
  }

  /**
   * Search posts across all content
   */
  async searchPosts(
    query: string,
    params: FetchOptions = {}
  ): Promise<WordPressPost[]> {
    return this.fetchPosts({ ...params, search: query });
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(
    categoryId: number,
    params: FetchOptions = {}
  ): Promise<WordPressPost[]> {
    return this.fetchPosts({ ...params, categories: [categoryId] });
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(
    tagId: number,
    params: FetchOptions = {}
  ): Promise<WordPressPost[]> {
    return this.fetchPosts({ ...params, tags: [tagId] });
  }

  /**
   * Get posts by author
   */
  async getPostsByAuthor(
    authorId: number,
    params: FetchOptions = {}
  ): Promise<WordPressPost[]> {
    return this.fetchPosts({ ...params, author: authorId });
  }

  /**
   * Clear the cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Authentication Methods
   */

  /**
   * Login user with username/password and get JWT token
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const url = `${this.baseUrl}/jwt-auth/v1/token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AuthError = {
        code: errorData.code || 'login_failed',
        message: errorData.message || 'Login failed',
        data: {
          status: response.status,
          ...errorData.data,
        },
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<JWTValidationResponse> {
    const url = `${this.baseUrl}/jwt-auth/v1/token/validate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AuthError = {
        code: errorData.code || 'token_invalid',
        message: errorData.message || 'Token validation failed',
        data: {
          status: response.status,
          ...errorData.data,
        },
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/v1/register`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AuthError = {
        code: errorData.code || 'registration_failed',
        message: errorData.message || 'Registration failed',
        data: {
          status: response.status,
          ...errorData.data,
        },
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Get current user profile (requires authentication)
   */
  async getUserProfile(token: string): Promise<User> {
    const url = `${this.baseUrl}/auth/v1/profile`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AuthError = {
        code: errorData.code || 'profile_fetch_failed',
        message: errorData.message || 'Failed to fetch profile',
        data: {
          status: response.status,
          ...errorData.data,
        },
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Update user profile (requires authentication)
   */
  async updateProfile(
    token: string,
    data: UpdateProfileData
  ): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/v1/profile`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AuthError = {
        code: errorData.code || 'profile_update_failed',
        message: errorData.message || 'Failed to update profile',
        data: {
          status: response.status,
          ...errorData.data,
        },
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Change user password (requires authentication)
   */
  async changePassword(
    token: string,
    data: ChangePasswordData
  ): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/v1/change-password`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AuthError = {
        code: errorData.code || 'password_change_failed',
        message: errorData.message || 'Failed to change password',
        data: {
          status: response.status,
          ...errorData.data,
        },
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Make authenticated request to any endpoint
   */
  async authenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: AuthError = {
        code: errorData.code || 'request_failed',
        message: errorData.message || 'Request failed',
        data: {
          status: response.status,
          ...errorData.data,
        },
      };
      throw error;
    }

    return response.json();
  }
}

// Create and export the WordPress client instance
export const wp = new WordPressClient(
  import.meta.env.WP_API_URL || 'http://localhost:8080'
);

// Export types for convenience
export type { WordPressPost, WordPressPage, WordPressError, WordPressEmbedded };
export type { FetchOptions };
