import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { type BlogPostPreview } from "@/lib/data/blog-posts";

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getExcerpt(content: string, maxLength: number = 100): string {
  const plain = content.replace(/[#*\[\]|`-]/g, "").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + "\u2026";
}

export function RelatedPosts({ posts }: { posts: BlogPostPreview[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border/60">
      <h2 className="text-xl font-bold tracking-tight mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
          >
            <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
              <span className="text-3xl opacity-20">
                {post.category === "guides"
                  ? "\uD83D\uDCD6"
                  : post.category === "comparison"
                    ? "\u2696\uFE0F"
                    : "\uD83D\uDCDD"}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
              <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {getExcerpt(post.content)}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-xs font-medium text-primary hover:underline"
              >
                Read More
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
