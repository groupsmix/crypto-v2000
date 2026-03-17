import type { MetadataRoute } from "next";
import { getAllExchangeSlugs, getAllVsPairs } from "@/lib/data/vs-comparisons";
import { prisma } from "@/lib/prisma";
import { getTopCoins } from "@/lib/price-service";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cryptocompare.ai";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5-minute ISR — new posts appear in sitemap quickly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/compare`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/prices`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/fee-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/tools/profit-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/tools/dca-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/tools/converter`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/tools/portfolio-tracker`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Exchange pages
  let exchangeSlugs: string[] = [];
  try {
    exchangeSlugs = await getAllExchangeSlugs();
  } catch {
    exchangeSlugs = ["binance", "coinbase", "kraken", "bybit", "kucoin"];
  }

  const exchangePages: MetadataRoute.Sitemap = exchangeSlugs.map((slug) => ({
    url: `${BASE_URL}/exchanges/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // VS comparison pages
  let vsPairs: string[] = [];
  try {
    vsPairs = await getAllVsPairs();
  } catch {
    vsPairs = [];
  }

  const vsPages: MetadataRoute.Sitemap = vsPairs.map((slug) => ({
    url: `${BASE_URL}/vs/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog posts
  let blogSlugs: { slug: string; publishedAt: Date | null }[] = [];
  try {
    blogSlugs = await prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    blogSlugs = [];
  }

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt || now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Coin price pages
  let coinIds: string[] = [];
  try {
    const coins = await getTopCoins();
    coinIds = coins.map((c) => c.id);
  } catch {
    coinIds = [];
  }

  const coinPages: MetadataRoute.Sitemap = coinIds.map((id) => ({
    url: `${BASE_URL}/prices/${id}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...exchangePages, ...vsPages, ...blogPages, ...coinPages];
}
