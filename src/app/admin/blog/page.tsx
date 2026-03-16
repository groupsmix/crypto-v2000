import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlogManager } from "@/components/admin/blog-manager";

export const metadata: Metadata = {
  title: "Manage Blog Posts",
  description: "Create and manage blog content.",
};

export const dynamic = "force-dynamic";

async function getBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Manager</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} post{posts.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      <BlogManager posts={JSON.parse(JSON.stringify(posts))} />
    </div>
  );
}
