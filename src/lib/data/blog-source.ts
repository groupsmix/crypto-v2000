/**
 * Blog Source — fetches published posts from Project 1 (Blog Generator).
 *
 * Uses the BLOG_SOURCE_URL environment variable to locate the Blog Generator
 * API. Falls back gracefully (returns null) when the service is unreachable.
 *
 * All fetch calls use Next.js revalidation for lightweight ISR caching.
 */

import type { BlogPostPreview, BlogPostFull } from "./blog-posts";

const REVALIDATE_SECONDS = 60; // ISR: revalidate every 60 seconds

function getBlogSourceUrl(): string | null {
  const url = process.env.BLOG_SOURCE_URL;
  if (!url) return null;
  // Strip trailing slash
  return url.replace(/\/+$/, "");
}

// ─── Project 1 Post shape (from blog-generator) ─────────────────────────────

interface P1Post {
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
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function toPreview(p: P1Post): BlogPostPreview {
  return {
    slug: p.slug,
    title: p.title,
    content: p.body,
    category: p.category || null,
    tags: p.tags ?? [],
    publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
    featuredImage: null, // Project 1 only has featuredImagePrompt, not a URL
    metaDescription: p.metaDescription || null,
  };
}

function toFull(p: P1Post): BlogPostFull {
  return {
    id: p.slug, // Project 1 uses slug as identifier
    slug: p.slug,
    title: p.title,
    content: p.body,
    metaTitle: p.metaTitle || null,
    metaDescription: p.metaDescription || null,
    featuredImage: null,
    category: p.category || null,
    tags: p.tags ?? [],
    publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
    createdAt: new Date(p.createdAt),
    canonicalPath: p.canonicalPath || null,
  };
}

// ─── Fetch helpers ───────────────────────────────────────────────────────────

/**
 * Fetch all published posts from Project 1, sorted by publishedAt descending.
 * Returns null if the source is unavailable.
 */
export async function fetchPublishedPosts(): Promise<BlogPostPreview[] | null> {
  const base = getBlogSourceUrl();
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/published`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return null;

    const data: { posts: P1Post[]; count: number } = await res.json();

    const previews = data.posts
      .filter((p) => p.status === "published")
      .map(toPreview)
      .sort((a, b) => {
        const aTime = a.publishedAt?.getTime() ?? 0;
        const bTime = b.publishedAt?.getTime() ?? 0;
        return bTime - aTime;
      });

    return previews;
  } catch {
    return null;
  }
}

/**
 * Fetch a single published post by slug from Project 1.
 * Returns null if the source is unavailable or the post is not published.
 */
export async function fetchPublishedPostBySlug(
  slug: string
): Promise<BlogPostFull | null> {
  const base = getBlogSourceUrl();
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return null;

    const data: { post: P1Post } = await res.json();

    // Only return published posts
    if (data.post.status !== "published") return null;

    return toFull(data.post);
  } catch {
    return null;
  }
}

/**
 * Fetch unique categories from published posts.
 * Returns null if the source is unavailable.
 */
export async function fetchPublishedCategories(): Promise<string[] | null> {
  const posts = await fetchPublishedPosts();
  if (!posts) return null;

  const cats = new Set<string>();
  for (const p of posts) {
    if (p.category) cats.add(p.category);
  }
  return Array.from(cats).sort();
}

/**
 * Fetch unique tags from published posts.
 * Returns null if the source is unavailable.
 */
export async function fetchPublishedTags(): Promise<string[] | null> {
  const posts = await fetchPublishedPosts();
  if (!posts) return null;

  const tagSet = new Set<string>();
  for (const p of posts) {
    for (const t of p.tags) {
      tagSet.add(t);
    }
  }
  return Array.from(tagSet).sort();
}
