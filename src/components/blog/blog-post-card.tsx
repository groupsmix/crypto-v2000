import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { type BlogPostPreview } from "@/lib/data/blog-posts";

function getExcerpt(content: string, maxLength: number = 140): string {
  const plain = content.replace(/[#*\[\]|`-]/g, "").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + "\u2026";
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogPostCard({ post }: { post: BlogPostPreview }) {
  const excerpt = post.metaDescription || getExcerpt(post.content);

  return (
    <article className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
      {/* Featured image or gradient placeholder */}
      {post.featuredImage ? (
        <div className="h-44 overflow-hidden relative">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
          <span className="text-5xl opacity-20">
            {post.category === "guides"
              ? "\uD83D\uDCD6"
              : post.category === "comparison"
                ? "\u2696\uFE0F"
                : "\uD83D\uDCDD"}
          </span>
        </div>
      )}

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
            <Link
              href={`/blog?category=${post.category}`}
              className="flex items-center gap-1 capitalize hover:text-primary transition-colors"
            >
              <Tag className="h-3 w-3" />
              {post.category}
            </Link>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {excerpt}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

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
  );
}
