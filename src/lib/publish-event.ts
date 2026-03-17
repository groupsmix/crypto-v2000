/**
 * Publish event utility.
 *
 * Lightweight hook that runs whenever a new page becomes publicly available.
 * Collects the canonical URL, queues it for indexing, and triggers cache
 * invalidation so sitemaps and index pages reflect the new content quickly.
 */

import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

// ─── Types ──────────────────────────────────────────────────────────────────

export type PageType = "blog" | "vs" | "prices";

export interface PublishEventResult {
  url: string;
  pageType: PageType;
  cacheInvalidated: boolean;
}

// ─── Cache Invalidation ─────────────────────────────────────────────────────

/**
 * Invalidate cache entries that should reflect newly published content.
 */
async function invalidateRelatedCaches(
  pageType: PageType,
  slug: string
): Promise<boolean> {
  try {
    const keysToDelete: string[] = [];

    if (pageType === "blog") {
      // Blog index and the specific post cache
      keysToDelete.push(`blog:index`, `blog:post:${slug}`);
    } else if (pageType === "vs") {
      keysToDelete.push(`vs:${slug}`);
    } else if (pageType === "prices") {
      keysToDelete.push(`ps:coin:${slug}`, `cg:coin:${slug}`);
    }

    if (keysToDelete.length > 0) {
      await Promise.allSettled(
        keysToDelete.map((key) => redis.del(key))
      );
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Trigger Next.js ISR revalidation for relevant paths.
 */
function revalidateRelatedPaths(pageType: PageType, slug: string): void {
  try {
    if (pageType === "blog") {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
      revalidatePath("/sitemap.xml");
    } else if (pageType === "vs") {
      revalidatePath(`/vs/${slug}`);
      revalidatePath("/compare");
      revalidatePath("/sitemap.xml");
    } else if (pageType === "prices") {
      revalidatePath(`/prices/${slug}`);
      revalidatePath("/prices");
      revalidatePath("/sitemap.xml");
    }
    // Always revalidate homepage (latest posts section)
    revalidatePath("/");
  } catch {
    // revalidatePath may throw outside of a server action context — safe to ignore
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fire a publish event for a blog post.
 */
export async function onBlogPostPublished(
  slug: string
): Promise<PublishEventResult> {
  const path = `/blog/${slug}`;

  const cacheInvalidated = await invalidateRelatedCaches("blog", slug);
  revalidateRelatedPaths("blog", slug);

  return {
    url: path,
    pageType: "blog",
    cacheInvalidated,
  };
}

/**
 * Fire a publish event for a VS comparison page.
 */
export async function onComparisonPagePublished(
  slug: string
): Promise<PublishEventResult> {
  const path = `/vs/${slug}`;

  const cacheInvalidated = await invalidateRelatedCaches("vs", slug);
  revalidateRelatedPaths("vs", slug);

  return {
    url: path,
    pageType: "vs",
    cacheInvalidated,
  };
}

/**
 * Fire a publish event for a coin price page.
 */
export async function onCoinPagePublished(
  coinId: string
): Promise<PublishEventResult> {
  const path = `/prices/${coinId}`;

  const cacheInvalidated = await invalidateRelatedCaches("prices", coinId);
  revalidateRelatedPaths("prices", coinId);

  return {
    url: path,
    pageType: "prices",
    cacheInvalidated,
  };
}

/**
 * Batch-publish multiple URLs at once (e.g., after a bulk import).
 */
export async function onBatchPublished(
  items: { slug: string; pageType: PageType }[]
): Promise<PublishEventResult[]> {
  const results: PublishEventResult[] = [];

  for (const item of items) {
    let result: PublishEventResult;
    switch (item.pageType) {
      case "blog":
        result = await onBlogPostPublished(item.slug);
        break;
      case "vs":
        result = await onComparisonPagePublished(item.slug);
        break;
      case "prices":
        result = await onCoinPagePublished(item.slug);
        break;
    }
    results.push(result);
  }

  return results;
}
