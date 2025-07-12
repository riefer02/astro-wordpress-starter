import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: number;
  title: { rendered: string };
  slug: string;
  excerpt: { rendered: string };
  date: string;
}

interface SearchPostsProps {
  wpApiUrl?: string;
}

export default function SearchPosts({
  wpApiUrl = "/wp-json",
}: SearchPostsProps) {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPosts = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${wpApiUrl}/wp/v2/posts?search=${encodeURIComponent(
          query
        )}&per_page=10`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const results = await response.json();
      setPosts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchPosts();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={searchPosts} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {posts.length === 0 && !loading && query && (
        <div className="text-center py-8 text-muted-foreground">
          No posts found for "{query}"
        </div>
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                <a
                  href={`/posts/${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title.rendered}
                </a>
              </CardTitle>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString()}
                </time>
                <Badge variant="outline">Search Result</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
