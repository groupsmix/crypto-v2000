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
