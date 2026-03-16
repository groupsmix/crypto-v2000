import type { Metadata } from "next";
import {
  Search,
  Globe,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "SEO Overview",
  description: "Monitor SEO health, sitemap, and metadata status.",
};

export const dynamic = "force-dynamic";

type MetadataStatus = {
  total: number;
  withMetaTitle: number;
  withMetaDescription: number;
  withFeaturedImage: number;
};

async function getSeoData() {
  try {
    const [exchangeCount, blogPosts, publishedPosts] = await Promise.all([
      prisma.exchange.count(),
      prisma.blogPost.findMany({
        select: {
          slug: true,
          title: true,
          metaTitle: true,
          metaDescription: true,
          featuredImage: true,
          publishedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.blogPost.count({ where: { publishedAt: { not: null } } }),
    ]);

    const metadataStatus: MetadataStatus = {
      total: blogPosts.length,
      withMetaTitle: blogPosts.filter((p) => p.metaTitle).length,
      withMetaDescription: blogPosts.filter((p) => p.metaDescription).length,
      withFeaturedImage: blogPosts.filter((p) => p.featuredImage).length,
    };

    return { exchangeCount, blogPosts, publishedPosts, metadataStatus };
  } catch {
    return {
      exchangeCount: 0,
      blogPosts: [] as { slug: string; title: string; metaTitle: string | null; metaDescription: string | null; featuredImage: string | null; publishedAt: Date | null }[],
      publishedPosts: 0,
      metadataStatus: { total: 0, withMetaTitle: 0, withMetaDescription: 0, withFeaturedImage: 0 },
    };
  }
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ) : (
    <XCircle className="h-4 w-4 text-red-400" />
  );
}

function MetricCard({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const isGood = pct >= 80;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {isGood ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        )}
      </div>
      <p className="text-2xl font-bold">
        {value} / {total}
      </p>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isGood ? "bg-green-500" : "bg-yellow-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{pct}% complete</p>
    </div>
  );
}

export default async function AdminSeoPage() {
  const { exchangeCount, blogPosts, publishedPosts, metadataStatus } = await getSeoData();

  const sitemapPages = [
    { path: "/", label: "Homepage", indexed: true },
    { path: "/compare", label: "Compare Exchanges", indexed: true },
    { path: "/exchanges", label: "Exchanges Directory", indexed: true },
    { path: "/prices", label: "Crypto Prices", indexed: true },
    { path: "/blog", label: "Blog Index", indexed: true },
    { path: "/tools", label: "Crypto Tools", indexed: true },
    { path: "/learn", label: "Learning Center", indexed: true },
  ];

  const dynamicPages = [
    { type: "Exchange Pages", count: exchangeCount, pattern: "/exchanges/[slug]" },
    { type: "Blog Posts", count: publishedPosts, pattern: "/blog/[slug]" },
    { type: "Coin Prices", count: 0, pattern: "/prices/[coin]" },
  ];

  const totalIndexablePages =
    sitemapPages.length +
    exchangeCount +
    publishedPosts;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO Overview</h1>
          <p className="text-sm text-muted-foreground">
            Monitor sitemap coverage, metadata, and indexing status
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Indexable Pages
            </span>
          </div>
          <p className="text-2xl font-bold">{totalIndexablePages}</p>
        </div>
        <MetricCard
          label="Meta Titles"
          value={metadataStatus.withMetaTitle}
          total={metadataStatus.total}
        />
        <MetricCard
          label="Meta Descriptions"
          value={metadataStatus.withMetaDescription}
          total={metadataStatus.total}
        />
        <MetricCard
          label="Featured Images"
          value={metadataStatus.withFeaturedImage}
          total={metadataStatus.total}
        />
      </div>

      {/* Sitemap Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Static Pages */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Static Pages
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {sitemapPages.map((page) => (
              <div
                key={page.path}
                className="px-4 py-3 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <StatusIcon ok={page.indexed} />
                  <span className="font-medium">{page.label}</span>
                </div>
                <code className="text-xs text-muted-foreground font-mono">
                  {page.path}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Pages */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Dynamic Pages
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {dynamicPages.map((page) => (
              <div
                key={page.pattern}
                className="px-4 py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium">{page.type}</p>
                  <code className="text-xs text-muted-foreground font-mono">
                    {page.pattern}
                  </code>
                </div>
                <span className="text-lg font-bold">{page.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Post Metadata Audit */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            Blog Post SEO Audit
          </h2>
        </div>
        {blogPosts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No blog posts to audit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium">Post</th>
                  <th className="text-center py-3 px-4 font-medium">Meta Title</th>
                  <th className="text-center py-3 px-4 font-medium">Meta Desc</th>
                  <th className="text-center py-3 px-4 font-medium">Image</th>
                  <th className="text-center py-3 px-4 font-medium">Published</th>
                  <th className="text-right py-3 px-4 font-medium">Preview</th>
                </tr>
              </thead>
              <tbody>
                {blogPosts.map((post) => (
                  <tr
                    key={post.slug}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium line-clamp-1">{post.title}</p>
                      <code className="text-[10px] text-muted-foreground">
                        /blog/{post.slug}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusIcon ok={!!post.metaTitle} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusIcon ok={!!post.metaDescription} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusIcon ok={!!post.featuredImage} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusIcon ok={!!post.publishedAt} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Sitemap generation and search console integration can be configured in Settings.
      </p>
    </div>
  );
}
