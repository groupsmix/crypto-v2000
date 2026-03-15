import { prisma } from "@/lib/prisma";

export type ExchangeWithOffers = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  affiliateUrl: string | null;
  score: number;
  description: string | null;
  supportedCoinsCount: number;
  offers: {
    offerText: string;
    bonusAmount: number | null;
    isActive: boolean;
  }[];
};

const fallbackExchanges: ExchangeWithOffers[] = [
  {
    id: "1",
    slug: "binance",
    name: "Binance",
    logoUrl: "/images/exchanges/binance.png",
    affiliateUrl: "#",
    score: 9.5,
    description: "World's largest cryptocurrency exchange by trading volume.",
    supportedCoinsCount: 400,
    offers: [{ offerText: "Get 20% off trading fees", bonusAmount: 100, isActive: true }],
  },
  {
    id: "2",
    slug: "coinbase",
    name: "Coinbase",
    logoUrl: "/images/exchanges/coinbase.png",
    affiliateUrl: "#",
    score: 9.0,
    description: "Most trusted US-based cryptocurrency exchange.",
    supportedCoinsCount: 250,
    offers: [{ offerText: "Earn $10 in Bitcoin on sign up", bonusAmount: 10, isActive: true }],
  },
  {
    id: "3",
    slug: "kraken",
    name: "Kraken",
    logoUrl: "/images/exchanges/kraken.png",
    affiliateUrl: "#",
    score: 8.8,
    description: "Veteran exchange with robust security and competitive fees.",
    supportedCoinsCount: 200,
    offers: [],
  },
  {
    id: "4",
    slug: "bybit",
    name: "Bybit",
    logoUrl: "/images/exchanges/bybit.png",
    affiliateUrl: "#",
    score: 8.7,
    description: "Fast-growing derivatives exchange with deep liquidity.",
    supportedCoinsCount: 500,
    offers: [{ offerText: "Deposit bonus up to $30,000", bonusAmount: 30000, isActive: true }],
  },
  {
    id: "5",
    slug: "kucoin",
    name: "KuCoin",
    logoUrl: "/images/exchanges/kucoin.png",
    affiliateUrl: "#",
    score: 8.5,
    description: "Global exchange with extensive altcoin selection.",
    supportedCoinsCount: 700,
    offers: [{ offerText: "Up to $500 sign-up bonus", bonusAmount: 500, isActive: true }],
  },
];

export async function getTopExchanges(): Promise<ExchangeWithOffers[]> {
  try {
    const exchanges = await prisma.exchange.findMany({
      orderBy: { score: "desc" },
      take: 5,
      include: {
        offers: {
          where: { isActive: true },
          select: {
            offerText: true,
            bonusAmount: true,
            isActive: true,
          },
        },
      },
    });

    if (exchanges.length === 0) {
      return fallbackExchanges;
    }

    return exchanges;
  } catch {
    return fallbackExchanges;
  }
}

export async function getFeaturedExchanges(): Promise<ExchangeWithOffers[]> {
  const exchanges = await getTopExchanges();
  return exchanges.slice(0, 4);
}

// ─── Compare Page Types & Data ─────────────────────────────────────────────────

export type ExchangeForComparison = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  affiliateUrl: string | null;
  score: number;
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
  offers: {
    offerText: string;
    bonusAmount: number | null;
    isActive: boolean;
  }[];
};

const fallbackExchangesForComparison: ExchangeForComparison[] = [
  {
    id: "1",
    slug: "binance",
    name: "Binance",
    logoUrl: "/images/exchanges/binance.png",
    affiliateUrl: "#",
    score: 9.5,
    supportedCoinsCount: 400,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.02, futuresTakerFee: 0.04 },
    offers: [{ offerText: "Get 20% off trading fees", bonusAmount: 100, isActive: true }],
  },
  {
    id: "2",
    slug: "coinbase",
    name: "Coinbase",
    logoUrl: "/images/exchanges/coinbase.png",
    affiliateUrl: "#",
    score: 9.0,
    supportedCoinsCount: 250,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: false,
    fees: { spotMakerFee: 0.4, spotTakerFee: 0.6, futuresMakerFee: null, futuresTakerFee: null },
    offers: [{ offerText: "Earn $10 in Bitcoin on sign up", bonusAmount: 10, isActive: true }],
  },
  {
    id: "3",
    slug: "kraken",
    name: "Kraken",
    logoUrl: "/images/exchanges/kraken.png",
    affiliateUrl: "#",
    score: 8.8,
    supportedCoinsCount: 200,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    fees: { spotMakerFee: 0.16, spotTakerFee: 0.26, futuresMakerFee: 0.02, futuresTakerFee: 0.05 },
    offers: [],
  },
  {
    id: "4",
    slug: "bybit",
    name: "Bybit",
    logoUrl: "/images/exchanges/bybit.png",
    affiliateUrl: "#",
    score: 8.7,
    supportedCoinsCount: 500,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.01, futuresTakerFee: 0.06 },
    offers: [{ offerText: "Deposit bonus up to $30,000", bonusAmount: 30000, isActive: true }],
  },
  {
    id: "5",
    slug: "kucoin",
    name: "KuCoin",
    logoUrl: "/images/exchanges/kucoin.png",
    affiliateUrl: "#",
    score: 8.5,
    supportedCoinsCount: 700,
    kycRequired: false,
    spotAvailable: true,
    futuresAvailable: true,
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.02, futuresTakerFee: 0.06 },
    offers: [{ offerText: "Up to $500 sign-up bonus", bonusAmount: 500, isActive: true }],
  },
];

// ─── Exchange Detail Page Types & Data ──────────────────────────────────────────

export type ExchangeDetail = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  affiliateUrl: string | null;
  score: number;
  foundedYear: number | null;
  headquarters: string | null;
  description: string | null;
  supportedCoinsCount: number;
  kycRequired: boolean;
  spotAvailable: boolean;
  futuresAvailable: boolean;
  updatedAt: Date;
  fees: {
    spotMakerFee: number;
    spotTakerFee: number;
    futuresMakerFee: number | null;
    futuresTakerFee: number | null;
    withdrawalFee: number | null;
  } | null;
  offers: {
    offerText: string;
    bonusAmount: number | null;
    isActive: boolean;
  }[];
};

const fallbackExchangeDetails: Record<string, ExchangeDetail> = {
  binance: {
    id: "1",
    slug: "binance",
    name: "Binance",
    logoUrl: "/images/exchanges/binance.png",
    affiliateUrl: "https://www.binance.com/en/register?ref=EXAMPLE1",
    score: 9.5,
    foundedYear: 2017,
    headquarters: "George Town, Cayman Islands",
    description:
      "Binance is the world's largest cryptocurrency exchange by trading volume, offering a wide range of crypto assets, spot and futures trading, staking, and more. Founded in 2017 by Changpeng Zhao, Binance has grown into the most liquid and feature-rich exchange in the industry. The platform supports hundreds of trading pairs and offers advanced order types, margin trading, and an extensive derivatives market. Binance also provides educational resources, a built-in wallet, and its own blockchain ecosystem (BNB Chain).",
    supportedCoinsCount: 400,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    updatedAt: new Date("2026-03-15T10:05:00Z"),
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.02, futuresTakerFee: 0.04, withdrawalFee: 0.0005 },
    offers: [{ offerText: "Get 20% off trading fees with our referral link", bonusAmount: 100, isActive: true }],
  },
  coinbase: {
    id: "2",
    slug: "coinbase",
    name: "Coinbase",
    logoUrl: "/images/exchanges/coinbase.png",
    affiliateUrl: "https://www.coinbase.com/join/EXAMPLE2",
    score: 9.0,
    foundedYear: 2012,
    headquarters: "San Francisco, USA",
    description:
      "Coinbase is the most trusted US-based cryptocurrency exchange, known for its user-friendly interface, regulatory compliance, and strong security measures. As a publicly traded company (NASDAQ: COIN), Coinbase offers unmatched transparency and is fully licensed in all US states. The platform caters to beginners with a simple buy/sell interface, while Coinbase Advanced provides professional-grade trading tools.",
    supportedCoinsCount: 250,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: false,
    updatedAt: new Date("2026-03-15T10:05:00Z"),
    fees: { spotMakerFee: 0.4, spotTakerFee: 0.6, futuresMakerFee: null, futuresTakerFee: null, withdrawalFee: 0.0 },
    offers: [{ offerText: "Earn $10 in Bitcoin when you sign up and trade $100", bonusAmount: 10, isActive: true }],
  },
  kraken: {
    id: "3",
    slug: "kraken",
    name: "Kraken",
    logoUrl: "/images/exchanges/kraken.png",
    affiliateUrl: "https://www.kraken.com/sign-up?ref=EXAMPLE3",
    score: 8.8,
    foundedYear: 2011,
    headquarters: "San Francisco, USA",
    description:
      "Kraken is a veteran exchange known for its robust security, extensive fiat currency support, and advanced trading features including margin and futures trading. Founded in 2011, Kraken has never been hacked and is one of the most respected exchanges in the industry. It offers a wide range of fiat currencies for deposits and withdrawals, making it ideal for international traders.",
    supportedCoinsCount: 200,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    updatedAt: new Date("2026-03-15T10:05:00Z"),
    fees: { spotMakerFee: 0.16, spotTakerFee: 0.26, futuresMakerFee: 0.02, futuresTakerFee: 0.05, withdrawalFee: 0.00015 },
    offers: [],
  },
  bybit: {
    id: "4",
    slug: "bybit",
    name: "Bybit",
    logoUrl: "/images/exchanges/bybit.png",
    affiliateUrl: "https://www.bybit.com/register?ref=EXAMPLE5",
    score: 8.7,
    foundedYear: 2018,
    headquarters: "Dubai, UAE",
    description:
      "Bybit is a fast-growing derivatives exchange offering perpetual contracts, spot trading, and NFT marketplace, popular among advanced traders for its deep liquidity. Founded in 2018, Bybit has quickly risen to become one of the top derivatives exchanges globally, with a focus on user experience and professional-grade trading tools.",
    supportedCoinsCount: 500,
    kycRequired: true,
    spotAvailable: true,
    futuresAvailable: true,
    updatedAt: new Date("2026-03-15T10:05:00Z"),
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.01, futuresTakerFee: 0.06, withdrawalFee: 0.0002 },
    offers: [{ offerText: "Deposit bonus up to $30,000 for new users", bonusAmount: 30000, isActive: true }],
  },
  kucoin: {
    id: "5",
    slug: "kucoin",
    name: "KuCoin",
    logoUrl: "/images/exchanges/kucoin.png",
    affiliateUrl: "https://www.kucoin.com/r/EXAMPLE4",
    score: 8.5,
    foundedYear: 2017,
    headquarters: "Seychelles",
    description:
      "KuCoin is a global exchange known for its extensive altcoin selection, competitive fees, and innovative features like trading bots and lending services. With over 700 supported coins, KuCoin offers one of the widest selections of tradeable assets in the industry. The exchange is especially popular among altcoin traders looking for early-stage projects.",
    supportedCoinsCount: 700,
    kycRequired: false,
    spotAvailable: true,
    futuresAvailable: true,
    updatedAt: new Date("2026-03-15T10:05:00Z"),
    fees: { spotMakerFee: 0.1, spotTakerFee: 0.1, futuresMakerFee: 0.02, futuresTakerFee: 0.06, withdrawalFee: 0.0004 },
    offers: [{ offerText: "Up to $500 sign-up bonus for new users", bonusAmount: 500, isActive: true }],
  },
};

export async function getExchangeBySlug(slug: string): Promise<ExchangeDetail | null> {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { slug },
      include: {
        fees: {
          select: {
            spotMakerFee: true,
            spotTakerFee: true,
            futuresMakerFee: true,
            futuresTakerFee: true,
            withdrawalFee: true,
          },
        },
        offers: {
          where: { isActive: true },
          select: {
            offerText: true,
            bonusAmount: true,
            isActive: true,
          },
        },
      },
    });

    if (!exchange) {
      return fallbackExchangeDetails[slug] ?? null;
    }

    return exchange;
  } catch {
    return fallbackExchangeDetails[slug] ?? null;
  }
}

export async function getSimilarExchanges(
  currentSlug: string
): Promise<ExchangeWithOffers[]> {
  try {
    const exchanges = await prisma.exchange.findMany({
      where: { slug: { not: currentSlug } },
      orderBy: { score: "desc" },
      take: 3,
      include: {
        offers: {
          where: { isActive: true },
          select: {
            offerText: true,
            bonusAmount: true,
            isActive: true,
          },
        },
      },
    });

    if (exchanges.length === 0) {
      return fallbackExchanges.filter((e) => e.slug !== currentSlug).slice(0, 3);
    }

    return exchanges;
  } catch {
    return fallbackExchanges.filter((e) => e.slug !== currentSlug).slice(0, 3);
  }
}

export async function getAllExchangesForComparison(): Promise<ExchangeForComparison[]> {
  try {
    const exchanges = await prisma.exchange.findMany({
      orderBy: { score: "desc" },
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
          select: {
            offerText: true,
            bonusAmount: true,
            isActive: true,
          },
        },
      },
    });

    if (exchanges.length === 0) {
      return fallbackExchangesForComparison;
    }

    return exchanges;
  } catch {
    return fallbackExchangesForComparison;
  }
}
