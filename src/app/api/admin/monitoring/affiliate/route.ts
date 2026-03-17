import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    // Resolve exchange names
    const exchangeIds = topExchangesRaw.map((r) => r.exchangeId);
    const exchanges = await prisma.exchange.findMany({
      where: { id: { in: exchangeIds } },
      select: { id: true, name: true, slug: true },
    });
    const exchangeMap = new Map(
      exchanges.map((e) => [e.id, { name: e.name, slug: e.slug }])
    );

    const topExchanges = topExchangesRaw.map((r) => ({
      exchangeName: exchangeMap.get(r.exchangeId)?.name || "Unknown",
      exchangeSlug: exchangeMap.get(r.exchangeId)?.slug || "",
      clicks: r._count.id,
    }));

    const topSourcePages = topSourcePagesRaw
      .filter((r) => r.sourcePath !== "")
      .map((r) => ({
        path: r.sourcePath,
        clicks: r._count.id,
      }));

    return NextResponse.json({
      totalClicks,
      clicks24h,
      topExchanges,
      topSourcePages,
      empty: totalClicks === 0,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      totalClicks: 0,
      clicks24h: 0,
      topExchanges: [],
      topSourcePages: [],
      empty: true,
      error: err instanceof Error ? err.message : "Database error",
      checkedAt: new Date().toISOString(),
    });
  }
}
