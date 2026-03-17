/**
 * Unified price data service.
 *
 * Primary: CoinGecko API (via src/lib/data/coingecko.ts)
 * Fallback: CryptoCompare free API
 *
 * All public functions try CoinGecko first. If it fails (rate-limit, downtime,
 * network error), they fall back to CryptoCompare and normalize the response
 * into the same types the rest of the app already uses.
 */

import { redis } from "@/lib/redis";
import type { CoinMarket, CoinDetail, MarketChart } from "@/lib/data/coingecko";
import {
  getTop200 as cgGetTop200,
  getCoinDetail as cgGetCoinDetail,
  getMarketChart as cgGetMarketChart,
} from "@/lib/data/coingecko";

// ─── CryptoCompare Config ────────────────────────────────────────────────────

const CC_BASE = "https://min-api.cryptocompare.com/data";

const CACHE_TTL_LIST = 600; // 10 minutes for coin list
const CACHE_TTL_COIN = 300; // 5 minutes for coin data

// ─── Cache Helpers ───────────────────────────────────────────────────────────

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
    }
  } catch {
    // Redis unavailable
  }
  return null;
}

async function setCache(key: string, data: unknown, ttl: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttl });
  } catch {
    // Redis unavailable
  }
}

// ─── CryptoCompare Helpers ───────────────────────────────────────────────────

async function ccFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${CC_BASE}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`CryptoCompare API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// CryptoCompare response types (subset we use)
type CCTopCoinRaw = {
  CoinInfo: {
    Id: string;
    Name: string;
    FullName: string;
    ImageUrl: string;
  };
  RAW?: {
    USD?: {
      PRICE: number;
      MKTCAP: number;
      TOTALVOLUME24HTO: number;
      HIGH24HOUR: number;
      LOW24HOUR: number;
      CHANGEPCT24HOUR: number;
      CHANGE24HOUR: number;
      SUPPLY: number;
      MKTCAPPENALTY: number;
    };
  };
};

type CCTopListResponse = {
  Data: CCTopCoinRaw[];
};

type CCHistoResponse = {
  Data: {
    Data: { time: number; close: number; high: number; low: number; open: number; volumefrom: number; volumeto: number }[];
  };
};

/**
 * Map CryptoCompare top-list entry → CoinMarket (CoinGecko-compatible).
 */
function ccToCoinMarket(raw: CCTopCoinRaw, rank: number): CoinMarket {
  const usd = raw.RAW?.USD;
  return {
    id: raw.CoinInfo.Name.toLowerCase(),
    symbol: raw.CoinInfo.Name.toLowerCase(),
    name: raw.CoinInfo.FullName,
    image: raw.CoinInfo.ImageUrl
      ? `https://www.cryptocompare.com${raw.CoinInfo.ImageUrl}`
      : "",
    current_price: usd?.PRICE ?? 0,
    market_cap: usd?.MKTCAP ?? 0,
    market_cap_rank: rank,
    total_volume: usd?.TOTALVOLUME24HTO ?? 0,
    high_24h: usd?.HIGH24HOUR ?? null,
    low_24h: usd?.LOW24HOUR ?? null,
    price_change_24h: usd?.CHANGE24HOUR ?? null,
    price_change_percentage_24h: usd?.CHANGEPCT24HOUR ?? null,
    circulating_supply: usd?.SUPPLY ?? null,
    total_supply: null,
    max_supply: null,
    ath: null,
    ath_change_percentage: null,
    ath_date: null,
    sparkline_in_7d: { price: [] },
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch top coins list. Tries CoinGecko first, falls back to CryptoCompare.
 * Result is cached for 10 minutes.
 */
export async function getTopCoins(): Promise<CoinMarket[]> {
  const cacheKey = "ps:top-coins";
  const cached = await getCached<CoinMarket[]>(cacheKey);
  if (cached) return cached;

  // Try CoinGecko
  try {
    const coins = await cgGetTop200();
    if (coins.length > 0) {
      await setCache(cacheKey, coins, CACHE_TTL_LIST);
      return coins;
    }
  } catch {
    // CoinGecko failed, try fallback
  }

  // Fallback: CryptoCompare
  try {
    const data = await ccFetch<CCTopListResponse>(
      "/top/mktcapfull?limit=100&tsym=USD"
    );
    const coins = data.Data.map((raw, i) => ccToCoinMarket(raw, i + 1));
    if (coins.length > 0) {
      await setCache(cacheKey, coins, CACHE_TTL_LIST);
    }
    return coins;
  } catch {
    // Both APIs failed — return empty array (pages handle this gracefully)
    return [];
  }
}

/**
 * Fetch detailed info for a specific coin. Tries CoinGecko first, falls back
 * to CryptoCompare with a simplified CoinDetail shape.
 */
export async function getCoinData(coinId: string): Promise<CoinDetail | null> {
  const cacheKey = `ps:coin:${coinId}`;
  const cached = await getCached<CoinDetail>(cacheKey);
  if (cached) return cached;

  // Try CoinGecko
  try {
    const coin = await cgGetCoinDetail(coinId);
    if (coin) {
      await setCache(cacheKey, coin, CACHE_TTL_COIN);
      return coin;
    }
  } catch {
    // CoinGecko failed
  }

  // Fallback: CryptoCompare — build a minimal CoinDetail from price data
  try {
    const symbol = coinId.toUpperCase();
    const data = await ccFetch<{
      RAW?: Record<string, { USD?: CCTopCoinRaw["RAW"]["USD"] }>;
      DISPLAY?: Record<string, { USD?: Record<string, string> }>;
    }>(`/pricemultifull?fsyms=${symbol}&tsyms=USD`);

    const raw = data.RAW?.[symbol]?.USD;
    if (!raw) return null;

    const detail: CoinDetail = {
      id: coinId,
      symbol: coinId,
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      description: { en: "" },
      image: { large: "", small: "", thumb: "" },
      market_cap_rank: null,
      market_data: {
        current_price: { usd: raw.PRICE },
        market_cap: { usd: raw.MKTCAP },
        total_volume: { usd: raw.TOTALVOLUME24HTO },
        high_24h: { usd: raw.HIGH24HOUR },
        low_24h: { usd: raw.LOW24HOUR },
        price_change_percentage_24h: raw.CHANGEPCT24HOUR,
        price_change_percentage_7d: null,
        price_change_percentage_30d: null,
        circulating_supply: raw.SUPPLY,
        total_supply: null,
        max_supply: null,
        ath: { usd: 0 },
        ath_change_percentage: { usd: 0 },
        ath_date: { usd: "" },
        atl: { usd: 0 },
        atl_date: { usd: "" },
        fully_diluted_valuation: { usd: null },
      },
      tickers: [],
      links: {
        homepage: [],
        blockchain_site: [],
        repos_url: { github: [] },
      },
      categories: [],
    };

    await setCache(cacheKey, detail, CACHE_TTL_COIN);
    return detail;
  } catch {
    return null;
  }
}

/**
 * Fetch price chart data. Tries CoinGecko first, falls back to CryptoCompare
 * histoday endpoint.
 */
export async function getCoinChart(
  coinId: string,
  days: number = 90
): Promise<MarketChart | null> {
  // Try CoinGecko
  try {
    const chart = await cgGetMarketChart(coinId, days);
    if (chart && chart.prices.length > 0) return chart;
  } catch {
    // CoinGecko failed
  }

  // Fallback: CryptoCompare histoday
  try {
    const symbol = coinId.toUpperCase();
    const data = await ccFetch<CCHistoResponse>(
      `/v2/histoday?fsym=${symbol}&tsym=USD&limit=${days}`
    );

    const entries = data.Data?.Data ?? [];
    if (entries.length === 0) return null;

    const chart: MarketChart = {
      prices: entries.map((e) => [e.time * 1000, e.close]),
      market_caps: entries.map((e) => [e.time * 1000, 0]),
      total_volumes: entries.map((e) => [e.time * 1000, e.volumeto]),
    };

    return chart;
  } catch {
    return null;
  }
}
