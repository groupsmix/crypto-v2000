/**
 * Read-only API client for fetching published blog posts from Project 1 (blog-generator).
 *
 * This module fetches published content from the blog generator service
 * and maps it to Project 2's internal types. It never writes back.
 */

import type { BlogPostPreview, BlogPostFull } from "@/lib/data/blog-posts";

// ─── Configuration ───────────────────────────────────────────────────────────

const BLOG_SOURCE_URL = process.env.BLOG_SOURCE_URL || "";
const BLOG_SOURCE_SECRET = process.env.BLOG_SOURCE_SECRET || "";

const REVALIDATE_SECONDS = 300; // 5-minute ISR cache

/** Build common fetch headers (auth + cache). */
function sourceHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  if (BLOG_SOURCE_SECRET) {
    headers["Authorization"] = `Bearer ${BLOG_SOURCE_SECRET}`;
  }
  return headers;
}

// ─── Project 1 Post Shape ────────────────────────────────────────────────────

type SourcePost = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  body: string;
  tags: string[];
  category: string;
  canonicalPath: string;
  internalLinks: string[];
  featuredImagePrompt: string;
  createdAt: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor: string | null;
  publishedAt: string | null;
};

// ─── Type Mapping ────────────────────────────────────────────────────────────

function toPreview(post: SourcePost): BlogPostPreview {
  return {
    slug: post.slug,
    title: post.title,
    content: post.excerpt || post.body.slice(0, 300),
    category: post.category || null,
    tags: post.tags ?? [],
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
    featuredImage: null,
    metaDescription: post.metaDescription || null,
  };
}

function toFull(post: SourcePost): BlogPostFull {
  return {
    id: `source-${post.slug}`,
    slug: post.slug,
    title: post.title,
    content: post.body,
    metaTitle: post.metaTitle || null,
    metaDescription: post.metaDescription || null,
    featuredImage: null,
    category: post.category || null,
    tags: post.tags ?? [],
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
    createdAt: new Date(post.createdAt),
    canonicalPath: post.canonicalPath || null,
  };
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

/**
 * Fetch all published posts from Project 1, sorted by publishedAt descending.
 * Returns null if the source is not configured or unavailable.
 */
export async function fetchPublishedPosts(): Promise<BlogPostPreview[] | null> {
  if (!BLOG_SOURCE_URL) return null;

  try {
    const res = await fetch(`${BLOG_SOURCE_URL}/api/published`, {
      headers: sourceHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const posts: SourcePost[] = data.posts ?? [];

    return posts
      .filter((p) => p.status === "published")
      .sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() -
          new Date(a.publishedAt ?? 0).getTime()
      )
      .map(toPreview);
  } catch {
    return null;
  }
}

/**
 * Fetch a single published post by slug from Project 1.
 * Returns null if the source is not configured, the post doesn't exist, or is not published.
 */
export async function fetchPostBySlug(
  slug: string
): Promise<BlogPostFull | null> {
  if (!BLOG_SOURCE_URL) return null;

  try {
    const res = await fetch(`${BLOG_SOURCE_URL}/api/posts/${encodeURIComponent(slug)}`, {
      headers: sourceHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const post: SourcePost | undefined = data.post;

    if (!post || post.status !== "published") return null;

    return toFull(post);
  } catch {
    return null;
  }
}
