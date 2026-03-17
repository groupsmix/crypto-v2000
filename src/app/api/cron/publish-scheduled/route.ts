import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onBlogPostPublished } from "@/lib/publish-event";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "";

/**
 * GET /api/cron/publish-scheduled
 *
 * Called by Cloudflare Worker Cron Trigger (or any external scheduler).
 * Finds all blog posts where scheduledFor <= now and publishedAt is null,
 * then publishes them.
 *
 * Protected by CRON_SECRET — pass it as ?secret=... or Authorization: Bearer ...
 */
export async function GET(request: NextRequest) {
  // --- Auth ---
  if (CRON_SECRET) {
    const url = new URL(request.url);
    const querySecret = url.searchParams.get("secret");
    const bearerToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (querySecret !== CRON_SECRET && bearerToken !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // --- Find & publish scheduled posts ---
  const now = new Date();

  const posts = await prisma.blogPost.findMany({
    where: {
      publishedAt: null,
      scheduledFor: { lte: now },
    },
  });

  if (posts.length === 0) {
    return NextResponse.json({ published: 0 });
  }

  const published: string[] = [];

  for (const post of posts) {
    await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        publishedAt: post.scheduledFor ?? now,
        scheduledFor: null,
      },
    });

    // Fire publish event (cache invalidation, etc.)
    await onBlogPostPublished(post.slug).catch(() => {});

    published.push(post.slug);
  }

  return NextResponse.json({ published: published.length, slugs: published });
}
