"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  featuredImage: string | null;
  category: string | null;
  tags: string[];
  publishedAt: string | null;
  scheduledFor: string | null;
  createdAt: string;
};

type PublishMode = "draft" | "now" | "scheduled";

type PostFormData = {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  category: string;
  tags: string;
  publishMode: PublishMode;
  scheduledFor: string;
};

function getEmptyForm(): PostFormData {
  return {
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    featuredImage: "",
    category: "",
    tags: "",
    publishMode: "draft",
    scheduledFor: "",
  };
}

function postToForm(post: BlogPost): PostFormData {
  let publishMode: PublishMode = "draft";
  if (post.publishedAt) {
    publishMode = "now";
  } else if (post.scheduledFor) {
    publishMode = "scheduled";
  }

  return {
    title: post.title,
    slug: post.slug,
    content: post.content,
    metaTitle: post.metaTitle || "",
    metaDescription: post.metaDescription || "",
    featuredImage: post.featuredImage || "",
    category: post.category || "",
    tags: post.tags.join(", "),
    publishMode,
    scheduledFor: post.scheduledFor
      ? new Date(post.scheduledFor).toISOString().slice(0, 16)
      : "",
  };
}

function formatDate(date: string | null): string {
  if (!date) return "Draft";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BlogManager({ posts: initialPosts }: { posts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<PostFormData>(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateForm(field: keyof PostFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(getEmptyForm());
    setIsCreating(true);
    setError(null);
  }

  function startEdit(post: BlogPost) {
    setIsCreating(false);
    setEditingId(post.id);
    setForm(postToForm(post));
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setIsCreating(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const url = isCreating
        ? "/api/admin/blog"
        : `/api/admin/blog/${editingId}`;
      const method = isCreating ? "POST" : "PUT";

      const payload = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        featuredImage: form.featuredImage,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        publish: form.publishMode === "now",
        scheduledFor:
          form.publishMode === "scheduled" && form.scheduledFor
            ? new Date(form.scheduledFor).toISOString()
            : null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": window.__ADMIN_PW ?? "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save post");
        return;
      }

      if (isCreating) {
        setPosts((prev) => [data.post, ...prev]);
      } else {
        setPosts((prev) =>
          prev.map((p) => (p.id === editingId ? data.post : p))
        );
      }

      cancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Password": window.__ADMIN_PW ?? "" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete");
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const showForm = isCreating || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={startCreate} disabled={showForm}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Post
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isCreating ? "New Blog Post" : "Edit Blog Post"}
            </h2>
            <Button variant="ghost" size="sm" onClick={cancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateForm("slug", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Category</span>
              <input
                type="text"
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</span>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Meta Title</span>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => updateForm("metaTitle", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Featured Image URL</span>
              <input
                type="text"
                value={form.featuredImage}
                onChange={(e) => updateForm("featuredImage", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Meta Description</span>
            <textarea
              value={form.metaDescription}
              onChange={(e) => updateForm("metaDescription", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Content (Markdown)</span>
            <textarea
              value={form.content}
              onChange={(e) => updateForm("content", e.target.value)}
              rows={12}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="space-y-3">
            <span className="text-xs font-medium text-muted-foreground">Publish</span>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  checked={form.publishMode === "draft"}
                  onChange={() => updateForm("publishMode", "draft")}
                  className="border-input"
                />
                <span className="text-sm">Save as Draft</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  checked={form.publishMode === "now"}
                  onChange={() => updateForm("publishMode", "now")}
                  className="border-input"
                />
                <span className="text-sm">Publish Now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  checked={form.publishMode === "scheduled"}
                  onChange={() => updateForm("publishMode", "scheduled")}
                  className="border-input"
                />
                <span className="text-sm">Schedule</span>
              </label>
            </div>

            {form.publishMode === "scheduled" && (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Scheduled Date &amp; Time</span>
                <input
                  type="datetime-local"
                  value={form.scheduledFor}
                  onChange={(e) => updateForm("scheduledFor", e.target.value)}
                  className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={cancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">Title</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Published</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No blog posts found. Create your first post above.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium line-clamp-1">{post.title}</p>
                      <p className="text-xs text-muted-foreground">/{post.slug}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground capitalize">
                        {post.category || "uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {post.publishedAt ? (
                        <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Published
                        </span>
                      ) : post.scheduledFor ? (
                        <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Scheduled {formatDate(post.scheduledFor)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(post)}
                        disabled={showForm}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
