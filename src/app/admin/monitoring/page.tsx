import type { Metadata } from "next";
import {
  Activity,
  Database,
  Globe,
  MousePointerClick,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const metadata: Metadata = {
  title: "Platform Monitoring",
  description: "Lightweight monitoring view for platform health.",
};

export const dynamic = "force-dynamic";

// ─── Types ──────────────────────────────────────────────────────────────────

type CacheEntry = {
  key: string;
  label: string;
  exists: boolean;
  ttl: number | null;
  sizeHint: string | null;
};

type ApiStatus = {
  name: string;
  url: string;
  reachable: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  error: string | null;
};

type AffiliateData = {
  totalClicks: number;
  clicks24h: number;
  topExchanges: { exchangeName: string; clicks: number }[];
  topSourcePages: { path: string; clicks: number }[];
  empty: boolean;
};

type BlogData = {
  totalPosts: number;
  publishedPosts: number;
  latestPublished: { slug: string; title: string; publishedAt: Date | null }[];
  latestRuns: {
    id: string;
    jobType: string;
    status: string;
    articlesCreated: number;
    errorCount: number;
    startedAt: Date | null;
    completedAt: Date | null;
  }[];
  sourceReachable: boolean | null;
  sourceError: string | null;
};

// ─── Data Fetching ──────────────────────────────────────────────────────────

async function getBlogData(): Promise<BlogData> {
  let totalPosts = 0;
  let publishedPosts = 0;
  let latestPublished: BlogData["latestPublished"] = [];
  let latestRuns: BlogData["latestRuns"] = [];

  try {
    [totalPosts, publishedPosts] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { publishedAt: { not: null } } }),
    ]);

    const posts = await prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { slug: true, title: true, publishedAt: true },
    });
    latestPublished = posts;
  } catch {
    // DB unavailable
  }

  try {
    const runs = await prisma.automationRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        jobType: true,
        status: true,
        articlesCreated: true,
        errorCount: true,
        startedAt: true,
        completedAt: true,
      },
    });
    latestRuns = runs;
  } catch {
    // No automation runs table or DB unavailable
  }

  // Check Project 1 reachability
  const blogSourceUrl = process.env.BLOG_SOURCE_URL || "";
  let sourceReachable: boolean | null = null;
  let sourceError: string | null = null;

  if (blogSourceUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${blogSourceUrl}/api/published`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeout);
      sourceReachable = res.ok;
      if (!res.ok) sourceError = `HTTP ${res.status}`;
    } catch (err) {
      sourceReachable = false;
      sourceError = err instanceof Error ? err.message : "Unreachable";
    }
  } else {
    sourceError = "BLOG_SOURCE_URL not configured";
  }

  return {
    totalPosts,
    publishedPosts,
    latestPublished,
    latestRuns,
    sourceReachable,
    sourceError,
  };
}

async function getCacheHealth(): Promise<{
  redisReachable: boolean;
  entries: CacheEntry[];
}> {
  let redisReachable = false;
  try {
    await redis.ping();
    redisReachable = true;
  } catch {
    return { redisReachable: false, entries: [] };
  }

  async function check(key: string, label: string): Promise<CacheEntry> {
    try {
      const [exists, ttl, value] = await Promise.all([
        redis.exists(key),
        redis.ttl(key),
        redis.get(key),
      ]);
      let sizeHint: string | null = null;
      if (value) {
        const str = typeof value === "string" ? value : JSON.stringify(value);
        const bytes = new TextEncoder().encode(str).length;
        sizeHint =
          bytes > 1024
            ? `${(bytes / 1024).toFixed(1)} KB`
            : `${bytes} bytes`;
      }
      return { key, label, exists: exists === 1, ttl: ttl > 0 ? ttl : null, sizeHint };
    } catch {
      return { key, label, exists: false, ttl: null, sizeHint: null };
    }
  }

  const entries = await Promise.all([
    check("ps:top-coins", "Prices List (top coins)"),
    check("ps:coin:bitcoin", "Sample Coin Page (bitcoin)"),
    check("cg:markets:1:100", "CoinGecko Markets Page 1"),
    check("cg:coin:bitcoin", "CoinGecko Coin Detail (bitcoin)"),
    check("cg:chart:bitcoin:30", "CoinGecko Chart (bitcoin 30d)"),
  ]);

  return { redisReachable, entries };
}

async function getApiHealth(): Promise<ApiStatus[]> {
  async function checkApi(name: string, url: string): Promise<ApiStatus> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeout);
      return {
        name,
        url,
        reachable: res.ok,
        statusCode: res.status,
        responseTimeMs: Date.now() - start,
        error: res.ok ? null : `HTTP ${res.status} ${res.statusText}`,
      };
    } catch (err) {
      return {
        name,
        url,
        reachable: false,
        statusCode: null,
        responseTimeMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  const blogSourceUrl = process.env.BLOG_SOURCE_URL || "";

  const checks = [
    checkApi("CoinGecko (primary)", "https://api.coingecko.com/api/v3/ping"),
    checkApi(
      "CryptoCompare (fallback)",
      "https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=1"
    ),
  ];

  if (blogSourceUrl) {
    checks.push(
      checkApi("Blog Source (Project 1)", `${blogSourceUrl}/api/published`)
    );
  } else {
    checks.push(
      Promise.resolve({
        name: "Blog Source (Project 1)",
        url: "not configured",
        reachable: false,
        statusCode: null,
        responseTimeMs: null,
        error: "BLOG_SOURCE_URL not set",
      })
    );
  }

  return Promise.all(checks);
}

async function getAffiliateData(): Promise<AffiliateData> {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalClicks, clicks24h, topExchangesRaw, topSourcePagesRaw] =
      await Promise.all([
        prisma.affiliateClick.count(),
        prisma.affiliateClick.count({
          where: { clickedAt: { gte: twentyFourHoursAgo } },
        }),
        prisma.affiliateClick.groupBy({
          by: ["exchangeId"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        }),
        prisma.affiliateClick.groupBy({
          by: ["sourcePath"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        }),
      ]);

    const exchangeIds = topExchangesRaw.map((r) => r.exchangeId);
    const exchanges = await prisma.exchange.findMany({
      where: { id: { in: exchangeIds } },
      select: { id: true, name: true },
    });
    const exchangeMap = new Map(exchanges.map((e) => [e.id, e.name]));

    return {
      totalClicks,
      clicks24h,
      topExchanges: topExchangesRaw.map((r) => ({
        exchangeName: exchangeMap.get(r.exchangeId) || "Unknown",
        clicks: r._count.id,
      })),
      topSourcePages: topSourcePagesRaw
        .filter((r) => r.sourcePath !== "")
        .map((r) => ({
          path: r.sourcePath,
          clicks: r._count.id,
        })),
      empty: totalClicks === 0,
    };
  } catch {
    return {
      totalClicks: 0,
      clicks24h: 0,
      topExchanges: [],
      topSourcePages: [],
      empty: true,
    };
  }
}

// ─── UI Components ──────────────────────────────────────────────────────────

function StatusBadge({ ok, label }: { ok: boolean; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        ok
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {label || (ok ? "OK" : "FAIL")}
    </span>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  warning,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden ${
        warning ? "border-red-500/40" : "border-border/60"
      }`}
    >
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        <Icon
          className={`h-4 w-4 ${
            warning ? "text-red-500" : "text-muted-foreground"
          }`}
        />
        <h2 className="text-sm font-semibold">{title}</h2>
        {warning && (
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 ml-auto" />
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function MonitoringPage() {
  const [blogData, cacheHealth, apiHealth, affiliateData] = await Promise.all([
    getBlogData(),
    getCacheHealth(),
    getApiHealth(),
    getAffiliateData(),
  ]);

  const hasApiFailures = apiHealth.some((a) => !a.reachable);
  const hasCacheIssues =
    !cacheHealth.redisReachable ||
    cacheHealth.entries.some((e) => !e.exists);
  const hasBlogIssues =
    blogData.sourceReachable === false || blogData.publishedPosts === 0;
  const hasAffiliateIssues = affiliateData.empty;

  const overallHealthy =
    !hasApiFailures && !hasCacheIssues && !hasBlogIssues && !hasAffiliateIssues;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Platform Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lightweight health overview &mdash; all sections in one place.
          </p>
        </div>
        <div className="text-right">
          <StatusBadge
            ok={overallHealthy}
            label={overallHealthy ? "ALL SYSTEMS OK" : "ISSUES DETECTED"}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            {new Date().toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {/* Failure Summary */}
      {!overallHealthy && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Active Issues
          </div>
          <ul className="text-sm text-red-600/80 dark:text-red-400/80 list-disc list-inside space-y-0.5">
            {hasApiFailures && (
              <li>
                External API failures:{" "}
                {apiHealth
                  .filter((a) => !a.reachable)
                  .map((a) => a.name)
                  .join(", ")}
              </li>
            )}
            {!cacheHealth.redisReachable && <li>Redis is unreachable</li>}
            {cacheHealth.redisReachable &&
              cacheHealth.entries.some((e) => !e.exists) && (
                <li>
                  Missing cache entries:{" "}
                  {cacheHealth.entries
                    .filter((e) => !e.exists)
                    .map((e) => e.label)
                    .join(", ")}
                </li>
              )}
            {blogData.sourceReachable === false && (
              <li>Project 1 blog source unreachable: {blogData.sourceError}</li>
            )}
            {blogData.publishedPosts === 0 && (
              <li>No published blog posts found</li>
            )}
            {hasAffiliateIssues && <li>No affiliate click data recorded</li>}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Blog Publishing Status */}
        <SectionCard
          title="Blog Publishing Status"
          icon={FileText}
          warning={hasBlogIssues}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Total Posts</p>
                <p className="text-xl font-bold">{blogData.totalPosts}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-xl font-bold">{blogData.publishedPosts}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Project 1 Source
              </p>
              {blogData.sourceReachable === null ? (
                <p className="text-xs text-muted-foreground">
                  {blogData.sourceError || "Not checked"}
                </p>
              ) : (
                <StatusBadge
                  ok={blogData.sourceReachable}
                  label={
                    blogData.sourceReachable
                      ? "Reachable"
                      : blogData.sourceError || "Unreachable"
                  }
                />
              )}
            </div>

            {blogData.latestPublished.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Latest Published Posts
                </p>
                <div className="space-y-1">
                  {blogData.latestPublished.map((post) => (
                    <div
                      key={post.slug}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="truncate max-w-[70%]" title={post.title}>
                        {post.title}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {blogData.latestRuns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Latest Automation Runs
                </p>
                <div className="space-y-1">
                  {blogData.latestRuns.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-1">
                        <StatusBadge
                          ok={run.status === "completed"}
                          label={run.status}
                        />
                        <span className="text-muted-foreground">
                          {run.jobType}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {run.articlesCreated} created
                        {run.errorCount > 0 && (
                          <span className="text-red-500 ml-1">
                            {run.errorCount} errors
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* B. Cache Health */}
        <SectionCard
          title="Cache Health"
          icon={Database}
          warning={hasCacheIssues}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Redis Connection
              </p>
              <StatusBadge
                ok={cacheHealth.redisReachable}
                label={cacheHealth.redisReachable ? "Connected" : "Unreachable"}
              />
            </div>

            {cacheHealth.redisReachable ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground">
                      <th className="text-left py-2 pr-2 font-medium">
                        Cache Entry
                      </th>
                      <th className="text-left py-2 px-2 font-medium">
                        Status
                      </th>
                      <th className="text-left py-2 px-2 font-medium">TTL</th>
                      <th className="text-left py-2 pl-2 font-medium">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cacheHealth.entries.map((entry) => (
                      <tr
                        key={entry.key}
                        className="border-b border-border/20"
                      >
                        <td className="py-2 pr-2">
                          <div className="font-medium">{entry.label}</div>
                          <div className="text-muted-foreground font-mono text-[10px]">
                            {entry.key}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <StatusBadge
                            ok={entry.exists}
                            label={entry.exists ? "HIT" : "MISS"}
                          />
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">
                          {entry.ttl ? `${entry.ttl}s` : "—"}
                        </td>
                        <td className="py-2 pl-2 text-muted-foreground">
                          {entry.sizeHint || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-red-500">
                Cannot check cache entries — Redis is unreachable. Verify
                UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
              </p>
            )}
          </div>
        </SectionCard>

        {/* C. Affiliate Activity */}
        <SectionCard
          title="Affiliate Activity"
          icon={MousePointerClick}
          warning={hasAffiliateIssues}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Total Clicks</p>
                <p className="text-xl font-bold">
                  {affiliateData.totalClicks.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Last 24h</p>
                <p className="text-xl font-bold">
                  {affiliateData.clicks24h.toLocaleString()}
                </p>
              </div>
            </div>

            {affiliateData.empty ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                No affiliate click data recorded yet.
              </p>
            ) : (
              <>
                {affiliateData.topExchanges.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Top Clicked Exchanges
                    </p>
                    <div className="space-y-1">
                      {affiliateData.topExchanges.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <span>{ex.exchangeName}</span>
                          <span className="text-muted-foreground font-mono">
                            {ex.clicks.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {affiliateData.topSourcePages.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Top Source Pages
                    </p>
                    <div className="space-y-1">
                      {affiliateData.topSourcePages.map((sp, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <span
                            className="truncate max-w-[70%] font-mono"
                            title={sp.path}
                          >
                            {sp.path}
                          </span>
                          <span className="text-muted-foreground font-mono">
                            {sp.clicks.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </SectionCard>

        {/* D. API Health */}
        <SectionCard
          title="API Health"
          icon={Globe}
          warning={hasApiFailures}
        >
          <div className="space-y-2">
            {apiHealth.map((api, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  api.reachable
                    ? "border-border/40"
                    : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{api.name}</span>
                  <StatusBadge ok={api.reachable} />
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  {api.statusCode && <span>HTTP {api.statusCode}</span>}
                  {api.responseTimeMs !== null && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {api.responseTimeMs}ms
                    </span>
                  )}
                </div>
                {api.error && (
                  <p className="mt-1 text-xs text-red-500">{api.error}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
