import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { getAllBlogPosts } from "@/lib/data/blog-posts";

export const metadata: Metadata = {
  title: "Manage Blog Posts",
  description: "Create and manage blog content.",
};

function formatDate(date: Date | null): string {
  if (!date) return "Draft";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminBlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <Section>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Admin
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Blog Posts
                </h1>
                <p className="text-sm text-muted-foreground">
                  {posts.length} published post{posts.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button size="sm" disabled>
              <Plus className="h-4 w-4 mr-1.5" />
              New Post
            </Button>
          </div>
        </div>

        {/* Posts table */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Published
                  </th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.slug}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground capitalize">
                        {post.category || "uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" disabled className="h-7 text-xs">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Full blog post editor will be available in a future update.
        </p>
      </div>
    </Section>
  );
}
