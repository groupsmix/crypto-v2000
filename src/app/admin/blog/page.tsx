import type { Metadata } from "next";
import { FileText, Bot } from "lucide-react";
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

async function getAIContentQueue() {
  try {
    return await prisma.automationRun.findMany({
      where: { status: { in: ["pending", "running"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch {
    return [];
  }
}

export default async function AdminBlogPage() {
  const [posts, aiQueue] = await Promise.all([
    getBlogPosts(),
    getAIContentQueue(),
  ]);

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

      {/* AI Content Queue */}
      {aiQueue.length > 0 && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-500" />
            AI Content Generation Queue
          </h3>
          <div className="space-y-2">
            {aiQueue.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {run.jobType} - {run.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(run.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BlogManager posts={JSON.parse(JSON.stringify(posts))} />
    </div>
  );
}
