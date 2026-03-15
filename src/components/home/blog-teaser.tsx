import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { type BlogPostPreview } from "@/lib/data/blog-posts";

function getExcerpt(content: string, maxLength: number = 120): string {
  const plain = content.replace(/[#*\[\]|`-]/g, "").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + "…";
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogTeaser({ posts }: { posts: BlogPostPreview[] }) {
  return (
    <Section>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Latest from the Blog
            </h2>
            <p className="text-muted-foreground">
              Expert guides, reviews, and insights for smarter trading.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
            <Link href="/blog">
              View All Posts
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
            >
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <span className="text-4xl opacity-30">📝</span>
              </div>

              <div className="p-5 space-y-3">
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  {post.category && (
                    <span className="flex items-center gap-1 capitalize">
                      <Tag className="h-3 w-3" />
                      {post.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {getExcerpt(post.content)}
                </p>

                {/* Read more */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Read More
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
