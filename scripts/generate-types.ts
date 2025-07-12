#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface WordPressEndpoint {
  description: string;
  methods: string[];
  endpoints: Array<{
    methods: string[];
    args: Record<string, any>;
  }>;
  schema?: {
    $schema: string;
    title: string;
    type: string;
    properties: Record<string, any>;
  };
}

interface WordPressRoutes {
  namespace: string;
  routes: Record<string, WordPressEndpoint>;
}

class WordPressTypeGenerator {
  private baseUrl: string;
  private outputDir: string;

  constructor(baseUrl: string, outputDir: string = 'src/types') {
    this.baseUrl = baseUrl;
    this.outputDir = outputDir;
  }

  async generateTypes(): Promise<void> {
    console.log('🚀 Starting WordPress type generation...');

    try {
      // Create output directory if it doesn't exist
      mkdirSync(this.outputDir, { recursive: true });

      // Fetch WordPress API routes
      const routes = await this.fetchRoutes();

      // Generate base types
      const baseTypes = await this.generateBaseTypes(routes);

      // Generate post types
      const postTypes = await this.generatePostTypes();

      // Generate ACF field types if ACF is available
      const acfTypes = await this.generateACFTypes();

      // Write types to files
      this.writeTypesToFiles(baseTypes, postTypes, acfTypes);

      console.log('✅ WordPress types generated successfully!');
    } catch (error) {
      console.error('❌ Error generating types:', error);
      process.exit(1);
    }
  }

  private async fetchRoutes(): Promise<WordPressRoutes[]> {
    const response = await fetch(`${this.baseUrl}/wp-json/`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch WordPress routes: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.routes ? Object.values(data.routes) : [];
  }

  private async generateBaseTypes(routes: WordPressRoutes[]): Promise<string> {
    let types = `// Generated WordPress Types - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}

export interface WordPressResponse<T> {
  data: T;
  headers: Record<string, string>;
  status: number;
}

export interface WordPressError {
  code: string;
  message: string;
  data?: {
    status: number;
    params?: Record<string, string>;
    details?: Record<string, any>;
  };
}

export interface WordPressRendered {
  rendered: string;
  protected?: boolean;
}

export interface WordPressGuid {
  rendered: string;
}

export interface WordPressTitle {
  rendered: string;
}

export interface WordPressContent {
  rendered: string;
  protected?: boolean;
}

export interface WordPressExcerpt {
  rendered: string;
  protected?: boolean;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: Record<string, string>;
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text: string;
  caption?: WordPressRendered;
  description?: WordPressRendered;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: Record<string, {
      file: string;
      width: number;
      height: number;
      mime_type: string;
      source_url: string;
    }>;
  };
}

export interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
}

export interface WordPressTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WordPressEmbedded {
  author?: WordPressAuthor[];
  "wp:featuredmedia"?: WordPressMedia[];
  "wp:term"?: WordPressCategory[][];
}

`;

    return types;
  }

  private async generatePostTypes(): Promise<string> {
    try {
      // Fetch all post types
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/types`);
      if (!response.ok) {
        throw new Error(`Failed to fetch post types: ${response.statusText}`);
      }

      const postTypes = await response.json();
      let types = `// Post Types\n\n`;

      for (const [key, type] of Object.entries(
        postTypes as Record<string, any>
      )) {
        const capitalizedName = this.capitalize(key);

        types += `export interface WordPress${capitalizedName} {
  id: number;
  date: string;
  date_gmt: string;
  guid: WordPressGuid;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: WordPressTitle;
  content: WordPressContent;
  excerpt: WordPressExcerpt;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky?: boolean;
  template: string;
  format?: string;
  meta: Record<string, any>;
  categories?: number[];
  tags?: number[];
  _links: Record<string, any>;
  _embedded?: WordPressEmbedded;
`;

        // Add custom fields if available
        types += `  acf?: Record<string, any>;\n`;
        types += `}\n\n`;
      }

      return types;
    } catch (error) {
      console.warn(
        '⚠️  Could not fetch post types, using default types:',
        error
      );
      return `// Default Post Types (fallback)

export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: WordPressGuid;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: WordPressTitle;
  content: WordPressContent;
  excerpt: WordPressExcerpt;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _links: Record<string, any>;
  _embedded?: WordPressEmbedded;
  acf?: Record<string, any>;
}

export interface WordPressPage {
  id: number;
  date: string;
  date_gmt: string;
  guid: WordPressGuid;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: WordPressTitle;
  content: WordPressContent;
  excerpt: WordPressExcerpt;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: Record<string, any>;
  parent: number;
  menu_order: number;
  _links: Record<string, any>;
  _embedded?: WordPressEmbedded;
  acf?: Record<string, any>;
}

`;
    }
  }

  private async generateACFTypes(): Promise<string> {
    try {
      // Try to fetch ACF field groups
      const response = await fetch(
        `${this.baseUrl}/wp-json/acf/v3/field-groups`
      );
      if (!response.ok) {
        console.warn('⚠️  ACF API not available, skipping ACF types');
        return '';
      }

      const fieldGroups = await response.json();
      let types = `// ACF Field Types\n\n`;

      if (Array.isArray(fieldGroups)) {
        for (const group of fieldGroups) {
          const groupName = this.sanitizeFieldName(group.title);

          // Fetch fields for this group
          const fieldsResponse = await fetch(
            `${this.baseUrl}/wp-json/acf/v3/field-groups/${group.id}/fields`
          );
          if (fieldsResponse.ok) {
            const fields = await fieldsResponse.json();

            types += `export interface ACF${groupName} {\n`;

            if (Array.isArray(fields)) {
              for (const field of fields) {
                const fieldType = this.getACFFieldType(field.type);
                const fieldName = this.sanitizeFieldName(field.name);
                const optional = field.required ? '' : '?';

                types += `  ${fieldName}${optional}: ${fieldType};\n`;
              }
            }

            types += `}\n\n`;
          }
        }
      }

      return types;
    } catch (error) {
      console.warn('⚠️  Could not fetch ACF types:', error);
      return '';
    }
  }

  private getACFFieldType(acfType: string): string {
    const typeMap: Record<string, string> = {
      text: 'string',
      textarea: 'string',
      number: 'number',
      email: 'string',
      url: 'string',
      password: 'string',
      image: 'WordPressMedia',
      file: 'WordPressMedia',
      select: 'string',
      checkbox: 'string[]',
      radio: 'string',
      true_false: 'boolean',
      post_object: 'WordPressPost',
      page_link: 'string',
      link: '{ title: string; url: string; target: string }',
      taxonomy: 'WordPressCategory[]',
      user: 'WordPressAuthor',
      google_map: '{ lat: number; lng: number; address: string }',
      date_picker: 'string',
      date_time_picker: 'string',
      time_picker: 'string',
      color_picker: 'string',
      wysiwyg: 'string',
      oembed: 'string',
      gallery: 'WordPressMedia[]',
      relationship: 'WordPressPost[]',
      repeater: 'Record<string, any>[]',
      flexible_content: 'Record<string, any>[]',
      clone: 'Record<string, any>',
      group: 'Record<string, any>',
    };

    return typeMap[acfType] || 'any';
  }

  private sanitizeFieldName(name: string): string {
    // Remove special characters and make camelCase
    return name
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_')
      .replace(/^(\d)/, '_$1') // Prefix with underscore if starts with number
      .split('_')
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private writeTypesToFiles(
    baseTypes: string,
    postTypes: string,
    acfTypes: string
  ): void {
    // Write main types file
    const mainTypes = baseTypes + postTypes + acfTypes;
    writeFileSync(join(this.outputDir, 'wordpress.d.ts'), mainTypes);

    // Write index file
    const indexContent = `// WordPress Types Index
export * from './wordpress';
`;
    writeFileSync(join(this.outputDir, 'index.ts'), indexContent);

    console.log(`📝 Types written to ${this.outputDir}/`);
  }
}

// Run the generator
const generator = new WordPressTypeGenerator(
  process.env.WP_API_URL || 'http://localhost:8080'
);

generator.generateTypes().catch(console.error);
