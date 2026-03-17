import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onBlogPostPublished } from "@/lib/publish-event";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        featuredImage: body.featuredImage || null,
        category: body.category || null,
        tags: body.tags || [],
        publishedAt: body.publish ? new Date() : null,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      },
    });

    // Fire publish event if the post was published
    if (body.publish && post.slug) {
      await onBlogPostPublished(post.slug).catch(() => {});
    }

    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
