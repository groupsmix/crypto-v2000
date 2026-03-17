import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onBlogPostPublished } from "@/lib/publish-event";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        featuredImage: body.featuredImage || null,
        category: body.category || null,
        tags: body.tags || [],
        publishedAt: body.publish ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null,
      },
    });

    // Fire publish event if the post was just published
    if (body.publish && post.slug) {
      await onBlogPostPublished(post.slug).catch(() => {});
    }

    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
