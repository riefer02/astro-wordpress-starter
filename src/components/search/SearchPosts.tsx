import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { wp } from '@/lib/wordpress';
import type { WordPressPost } from '@/types/wordpress';

interface SearchPostsProps {
  className?: string;
}

export default function SearchPosts({ className }: SearchPostsProps) {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPosts = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await wp.searchPosts(query, { per_page: 10 });
      setPosts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPosts();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className || ''}`}>
      <Card>
        <CardHeader>
          <CardTitle>Search Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Search for posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchPosts} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {posts.length === 0 && !loading && query && (
            <p className="text-gray-500 text-center py-8">
              No posts found for &quot;{query}&quot;
            </p>
          )}
        </CardContent>
      </Card>

      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Found {posts.length} result{posts.length !== 1 ? 's' : ''}
          </h3>
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-lg hover:text-blue-600">
                      <a href={`/posts/${post.slug}`}>
                        {stripHtml(post.title.rendered)}
                      </a>
                    </h4>
                    <Badge variant="secondary">{formatDate(post.date)}</Badge>
                  </div>
                  <p className="text-gray-600 line-clamp-3">
                    {stripHtml(post.excerpt.rendered)}
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <a href={`/posts/${post.slug}`}>Read more →</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
