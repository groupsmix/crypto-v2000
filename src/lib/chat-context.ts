import { prisma } from "@/lib/prisma";

export type ExchangeContext = {
  name: string;
  slug: string;
  score: number;
  description: string | null;
  affiliateUrl: string | null;
  supportedCoinsCount: number;
  kycRequired: boolean;
  spotAvailable: boolean;
  futuresAvailable: boolean;
  fees: {
    spotMakerFee: number;
    spotTakerFee: number;
    futuresMakerFee: number | null;
    futuresTakerFee: number | null;
  } | null;
  offers: { offerText: string; bonusAmount: number | null }[];
};

export type BlogContext = {
  title: string;
  slug: string;
  category: string | null;
  content: string;
};

const fallbackExchangeContext: ExchangeContext[] = [
  {
    name: "Binance",
    slug: "binance",
    score: 9.5,
    description: "World's largest cryptocurrency exchange by trading volume.",
    affiliateUrl: "#",
    supportedCoinsCount: 400,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.02, futuresTakerFee: 0.04 },
    offers: [{ offerText: "Get 20% off trading fees", bonusAmount: 100 }],
  },
  {
    name: "Coinbase",
    slug: "coinbase",
    score: 9.0,
    description: "Most trusted US-based cryptocurrency exchange.",
    affiliateUrl: "#",
    supportedCoinsCount: 250,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: false,
    fees: { spotMakerFee: 0.4, spotTakerFee: 0.6, futuresMakerFee: null, futuresTakerFee: null },
    offers: [{ offerText: "Earn $10 in Bitcoin on sign up", bonusAmount: 10 }],
  },
  {
    name: "Kraken",
    slug: "kraken",
    score: 8.8,
    description: "Veteran exchange with robust security and competitive fees.",
    affiliateUrl: "#",
    supportedCoinsCount: 200,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    fees: { spotMakerFee: 0.16, spotTakerFee: 0.26, futuresMakerFee: 0.02, futuresTakerFee: 0.05 },
    offers: [],
  },
  {
    name: "Bybit",
    slug: "bybit",
    score: 8.7,
    description: "Fast-growing derivatives exchange with deep liquidity.",
    affiliateUrl: "#",
    supportedCoinsCount: 500,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.01, futuresTakerFee: 0.06 },
    offers: [{ offerText: "Deposit bonus up to $30,000", bonusAmount: 30000 }],
  },
  {
    name: "KuCoin",
    slug: "kucoin",
    score: 8.5,
    description: "Global exchange with extensive altcoin selection.",
    affiliateUrl: "#",
    supportedCoinsCount: 700,
    kycRequired: false,
    spotAvailable: true,
    futuresAvailable: true,
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.02, futuresTakerFee: 0.06 },
    offers: [{ offerText: "Up to $500 sign-up bonus", bonusAmount: 500 }],
  },
];

const fallbackBlogContext: BlogContext[] = [
  {
    title: "Best Crypto Exchanges in 2026: Complete Comparison Guide",
    slug: "best-crypto-exchanges-2026",
    category: "guides",
    content: "Compare the top exchanges across fees, security, supported coins, and user experience.",
  },
  {
    title: "Crypto Trading Fees Explained: Maker vs Taker and How to Save",
    slug: "crypto-trading-fees-explained",
    category: "education",
    content: "Understanding trading fees is crucial for maximizing your returns in cryptocurrency trading.",
  },
  {
    title: "How to Choose a Crypto Exchange: A Beginner's Checklist",
    slug: "how-to-choose-a-crypto-exchange",
    category: "guides",
    content: "If you're new to cryptocurrency, choosing your first exchange can feel overwhelming.",
  },
];

export async function getExchangeContext(): Promise<ExchangeContext[]> {
  try {
    const exchanges = await prisma.exchange.findMany({
      orderBy: { score: "desc" },
      take: 10,
      include: {
        fees: {
          select: {
            spotMakerFee: true,
            spotTakerFee: true,
            futuresMakerFee: true,
            futuresTakerFee: true,
          },
        },
        offers: {
          where: { isActive: true },
          select: { offerText: true, bonusAmount: true },
        },
      },
    });

    if (exchanges.length === 0) return fallbackExchangeContext;
    return exchanges;
  } catch {
    return fallbackExchangeContext;
  }
}

export async function getBlogContext(): Promise<BlogContext[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: {
        title: true,
        slug: true,
        category: true,
        content: true,
      },
    });

    if (posts.length === 0) return fallbackBlogContext;

    return posts.map((p) => ({
      ...p,
      content: p.content.substring(0, 300),
    }));
  } catch {
    return fallbackBlogContext;
  }
}

export function formatExchangeContext(exchanges: ExchangeContext[]): string {
  return exchanges
    .map((e) => {
      let info = `**${e.name}** (Score: ${e.score}/10, Slug: ${e.slug})`;
      info += `\n  - ${e.description || "No description"}`;
      info += `\n  - Coins: ${e.supportedCoinsCount}, KYC: ${e.kycRequired ? "Yes" : "No"}, Spot: ${e.spotAvailable ? "Yes" : "No"}, Futures: ${e.futuresAvailable ? "Yes" : "No"}`;
      if (e.fees) {
        info += `\n  - Fees: Spot Maker ${e.fees.spotMakerFee}% / Taker ${e.fees.spotTakerFee}%`;
        if (e.fees.futuresMakerFee !== null) {
          info += `, Futures Maker ${e.fees.futuresMakerFee}% / Taker ${e.fees.futuresTakerFee}%`;
        }
      }
      if (e.offers.length > 0) {
        info += `\n  - Current offers: ${e.offers.map((o) => o.offerText).join("; ")}`;
      }
      info += `\n  - Detail page: /exchanges/${e.slug}`;
      if (e.affiliateUrl && e.affiliateUrl !== "#") {
        info += `\n  - Affiliate signup: ${e.affiliateUrl}`;
      }
      return info;
    })
    .join("\n\n");
}

export function formatBlogContext(posts: BlogContext[]): string {
  return posts
    .map(
      (p) =>
        `- "${p.title}" (/${p.slug}) [${p.category || "uncategorized"}]: ${p.content}`
    )
    .join("\n");
}
