import type { Metadata } from "next";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { Section } from "@/components/ui/section";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import {
  getAllBlogPosts,
  getAllCategories,
  getAllTags,
} from "@/lib/data/blog-posts";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Latest news, guides, and insights about crypto exchanges, trading fees, and the best platforms.",
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description:
      "Expert guides, exchange reviews, and crypto trading insights to help you make smarter decisions.",
    type: "website",
  },
};

interface BlogPageProps {
  searchParams: {
    category?: string;
    tag?: string;
    search?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const [posts, categories, tags] = await Promise.all([
    getAllBlogPosts({
      category: searchParams.category,
      tag: searchParams.tag,
      search: searchParams.search,
    }),
    getAllCategories(),
    getAllTags(),
  ]);

  const hasFilters = searchParams.category || searchParams.tag || searchParams.search;

  return (
    <Section>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Blog
          </h1>
          <p className="text-muted-foreground">
            Expert guides, exchange reviews, and crypto trading insights to help
            you make smarter decisions.
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <BlogFilters
            categories={categories}
            tags={tags}
            activeCategory={searchParams.category}
            activeTag={searchParams.tag}
            activeSearch={searchParams.search}
          />
        </Suspense>

        {/* Posts grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">
              {hasFilters
                ? "No articles found matching your filters."
                : "No blog posts published yet."}
            </p>
            {hasFilters && (
              <a
                href="/blog"
                className="text-sm text-primary hover:underline"
              >
                Clear filters and view all posts
              </a>
            )}
          </div>
        )}

        {/* Post count */}
        {posts.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Showing {posts.length} article{posts.length !== 1 ? "s" : ""}
            {hasFilters ? " (filtered)" : ""}
          </p>
        )}
      </div>
    </Section>
  );
}
