import { prisma } from "@/lib/prisma";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type ClicksByExchange = {
  exchangeId: string;
  exchangeSlug: string;
  exchangeName: string;
  totalClicks: number;
};

export type ClicksBySource = {
  sourceType: string;
  totalClicks: number;
};

export type ClicksBySourcePath = {
  sourcePath: string;
  totalClicks: number;
};

export type RecentClick = {
  id: string;
  exchangeName: string;
  exchangeSlug: string;
  sourceType: string;
  sourcePath: string;
  destinationUrl: string;
  clickedAt: Date;
  ipHash: string;
  country: string | null;
  referrer: string | null;
};

export type RevenueSnapshot = {
  totalConversions: number;
  totalEstimatedRevenue: number;
};

export type AffiliateAnalytics = {
  totalClicks: number;
  clicksByExchange: ClicksByExchange[];
  clicksBySource: ClicksBySource[];
  clicksBySourcePath: ClicksBySourcePath[];
  recentClicks: RecentClick[];
  revenue: RevenueSnapshot;
};

// ─── Data Fetching ──────────────────────────────────────────────────────────────

export async function getAffiliateAnalytics(): Promise<AffiliateAnalytics> {
  try {
    const [
      totalClicks,
      clicksByExchangeRaw,
      clicksBySourceRaw,
      clicksBySourcePathRaw,
      recentClicksRaw,
      revenueAgg,
    ] = await Promise.all([
      prisma.affiliateClick.count(),

      prisma.affiliateClick.groupBy({
        by: ["exchangeId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      prisma.affiliateClick.groupBy({
        by: ["sourceType"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      prisma.affiliateClick.groupBy({
        by: ["sourcePath"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),

      prisma.affiliateClick.findMany({
        take: 30,
        orderBy: { clickedAt: "desc" },
        include: {
          exchange: { select: { name: true, slug: true } },
        },
      }),

      prisma.affiliateClick.aggregate({
        _sum: {
          conversionCount: true,
          estimatedRevenue: true,
        },
      }),
    ]);

    // Resolve exchange names for the grouped data
    const exchangeIds = clicksByExchangeRaw.map((r) => r.exchangeId);
    const exchanges = await prisma.exchange.findMany({
      where: { id: { in: exchangeIds } },
      select: { id: true, slug: true, name: true },
    });
    const exchangeMap = new Map(
      exchanges.map((e) => [e.id, { name: e.name, slug: e.slug }])
    );

    const clicksByExchange: ClicksByExchange[] = clicksByExchangeRaw.map((r) => ({
      exchangeId: r.exchangeId,
      exchangeSlug: exchangeMap.get(r.exchangeId)?.slug || "",
      exchangeName: exchangeMap.get(r.exchangeId)?.name || "Unknown",
      totalClicks: r._count.id,
    }));

    const clicksBySource: ClicksBySource[] = clicksBySourceRaw.map((r) => ({
      sourceType: r.sourceType,
      totalClicks: r._count.id,
    }));

    const clicksBySourcePath: ClicksBySourcePath[] = clicksBySourcePathRaw
      .filter((r) => r.sourcePath !== "")
      .map((r) => ({
        sourcePath: r.sourcePath,
        totalClicks: r._count.id,
      }));

    const recentClicks: RecentClick[] = recentClicksRaw.map((r) => ({
      id: r.id,
      exchangeName: r.exchange.name,
      exchangeSlug: r.exchange.slug,
      sourceType: r.sourceType,
      sourcePath: r.sourcePath,
      destinationUrl: r.destinationUrl,
      clickedAt: r.clickedAt,
      ipHash: r.ipHash,
      country: r.country,
      referrer: r.referrer,
    }));

    const revenue: RevenueSnapshot = {
      totalConversions: revenueAgg._sum.conversionCount ?? 0,
      totalEstimatedRevenue: revenueAgg._sum.estimatedRevenue ?? 0,
    };

    return {
      totalClicks,
      clicksByExchange,
      clicksBySource,
      clicksBySourcePath,
      recentClicks,
      revenue,
    };
  } catch {
    return {
      totalClicks: 0,
      clicksByExchange: [],
      clicksBySource: [],
      clicksBySourcePath: [],
      recentClicks: [],
      revenue: { totalConversions: 0, totalEstimatedRevenue: 0 },
    };
  }
}
