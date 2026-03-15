import { redis } from "@/lib/redis";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CoinMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number | null;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
  ath_date: string | null;
  sparkline_in_7d?: { price: number[] };
};

export type CoinDetail = {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { large: string; small: string; thumb: string };
  market_cap_rank: number | null;
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    price_change_percentage_30d: number | null;
    circulating_supply: number | null;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_date: { usd: string };
    fully_diluted_valuation: { usd: number | null };
  };
  tickers: CoinTicker[];
  links: {
    homepage: string[];
    blockchain_site: string[];
    repos_url: { github: string[] };
  };
  categories: string[];
};

export type CoinTicker = {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    has_trading_incentive: boolean;
  };
  last: number;
  volume: number;
  trust_score: string | null;
  trade_url: string | null;
};

export type MarketChart = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

// ─── Cache Helpers ────────────────────────────────────────────────────────────

const CACHE_TTL_MARKETS = 120; // 2 minutes
const CACHE_TTL_DETAIL = 300; // 5 minutes
const CACHE_TTL_CHART = 600; // 10 minutes

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
    }
  } catch {
    // Redis unavailable, skip cache
  }
  return null;
}

async function setCache(key: string, data: unknown, ttl: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttl });
  } catch {
    // Redis unavailable, skip cache
  }
}

// ─── API Fetchers ─────────────────────────────────────────────────────────────

async function coingeckoFetch<T>(path: string): Promise<T> {
  const url = `${COINGECKO_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Fetch top coins by market cap. Returns up to 200 coins.
 * Cached in Redis for 2 minutes.
 */
export async function getMarkets(page: number = 1, perPage: number = 100): Promise<CoinMarket[]> {
  const cacheKey = `cg:markets:${page}:${perPage}`;
  const cached = await getCached<CoinMarket[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await coingeckoFetch<CoinMarket[]>(
      `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`
    );
    await setCache(cacheKey, data, CACHE_TTL_MARKETS);
    return data;
  } catch {
    return getFallbackMarkets();
  }
}

/**
 * Fetch top 200 coins (2 pages of 100).
 */
export async function getTop200(): Promise<CoinMarket[]> {
  const [page1, page2] = await Promise.all([
    getMarkets(1, 100),
    getMarkets(2, 100),
  ]);
  return [...page1, ...page2];
}

/**
 * Fetch detailed info for a specific coin by its CoinGecko ID.
 * Cached in Redis for 5 minutes.
 */
export async function getCoinDetail(coinId: string): Promise<CoinDetail | null> {
  const cacheKey = `cg:coin:${coinId}`;
  const cached = await getCached<CoinDetail>(cacheKey);
  if (cached) return cached;

  try {
    const data = await coingeckoFetch<CoinDetail>(
      `/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`
    );
    await setCache(cacheKey, data, CACHE_TTL_DETAIL);
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch market chart data for a coin (price history).
 * Cached in Redis for 10 minutes.
 */
export async function getMarketChart(
  coinId: string,
  days: number = 30
): Promise<MarketChart | null> {
  const cacheKey = `cg:chart:${coinId}:${days}`;
  const cached = await getCached<MarketChart>(cacheKey);
  if (cached) return cached;

  try {
    const data = await coingeckoFetch<MarketChart>(
      `/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    await setCache(cacheKey, data, CACHE_TTL_CHART);
    return data;
  } catch {
    return null;
  }
}

// ─── Fallback Data ────────────────────────────────────────────────────────────

function getFallbackMarkets(): CoinMarket[] {
  return [
    { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", current_price: 87432.1, market_cap: 1720000000000, market_cap_rank: 1, total_volume: 32000000000, high_24h: 88100, low_24h: 86200, price_change_24h: 1200, price_change_percentage_24h: 2.34, circulating_supply: 19600000, total_supply: 21000000, max_supply: 21000000, ath: 108000, ath_change_percentage: -19, ath_date: "2025-01-20T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "ethereum", symbol: "eth", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", current_price: 3241.55, market_cap: 390000000000, market_cap_rank: 2, total_volume: 18000000000, high_24h: 3300, low_24h: 3180, price_change_24h: -36, price_change_percentage_24h: -1.12, circulating_supply: 120000000, total_supply: null, max_supply: null, ath: 4891, ath_change_percentage: -34, ath_date: "2021-11-10T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "binancecoin", symbol: "bnb", name: "BNB", image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", current_price: 612.8, market_cap: 91000000000, market_cap_rank: 3, total_volume: 1800000000, high_24h: 620, low_24h: 605, price_change_24h: 5.3, price_change_percentage_24h: 0.87, circulating_supply: 149000000, total_supply: 149000000, max_supply: 200000000, ath: 793, ath_change_percentage: -23, ath_date: "2024-12-04T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "solana", symbol: "sol", name: "Solana", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png", current_price: 142.3, market_cap: 68000000000, market_cap_rank: 4, total_volume: 3200000000, high_24h: 148, low_24h: 138, price_change_24h: 4.7, price_change_percentage_24h: 3.45, circulating_supply: 478000000, total_supply: 590000000, max_supply: null, ath: 294, ath_change_percentage: -52, ath_date: "2025-01-19T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "ripple", symbol: "xrp", name: "XRP", image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", current_price: 0.62, market_cap: 35000000000, market_cap_rank: 5, total_volume: 1400000000, high_24h: 0.64, low_24h: 0.61, price_change_24h: -0.003, price_change_percentage_24h: -0.54, circulating_supply: 56000000000, total_supply: 100000000000, max_supply: 100000000000, ath: 3.84, ath_change_percentage: -84, ath_date: "2018-01-07T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "cardano", symbol: "ada", name: "Cardano", image: "https://assets.coingecko.com/coins/images/975/large/cardano.png", current_price: 0.45, market_cap: 16000000000, market_cap_rank: 6, total_volume: 450000000, high_24h: 0.46, low_24h: 0.44, price_change_24h: 0.005, price_change_percentage_24h: 1.23, circulating_supply: 35600000000, total_supply: 45000000000, max_supply: 45000000000, ath: 3.1, ath_change_percentage: -85, ath_date: "2021-09-02T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "dogecoin", symbol: "doge", name: "Dogecoin", image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png", current_price: 0.082, market_cap: 12000000000, market_cap_rank: 7, total_volume: 600000000, high_24h: 0.085, low_24h: 0.08, price_change_24h: 0.001, price_change_percentage_24h: 1.5, circulating_supply: 143000000000, total_supply: null, max_supply: null, ath: 0.74, ath_change_percentage: -89, ath_date: "2021-05-08T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "polkadot", symbol: "dot", name: "Polkadot", image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png", current_price: 7.2, market_cap: 10000000000, market_cap_rank: 8, total_volume: 320000000, high_24h: 7.4, low_24h: 7.0, price_change_24h: -0.1, price_change_percentage_24h: -1.4, circulating_supply: 1400000000, total_supply: 1400000000, max_supply: null, ath: 55, ath_change_percentage: -87, ath_date: "2021-11-04T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "avalanche-2", symbol: "avax", name: "Avalanche", image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png", current_price: 36.5, market_cap: 14000000000, market_cap_rank: 9, total_volume: 520000000, high_24h: 37.8, low_24h: 35.2, price_change_24h: 0.8, price_change_percentage_24h: 2.2, circulating_supply: 380000000, total_supply: 720000000, max_supply: 720000000, ath: 146, ath_change_percentage: -75, ath_date: "2021-11-21T00:00:00Z", sparkline_in_7d: { price: [] } },
    { id: "chainlink", symbol: "link", name: "Chainlink", image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png", current_price: 14.8, market_cap: 9200000000, market_cap_rank: 10, total_volume: 410000000, high_24h: 15.2, low_24h: 14.5, price_change_24h: 0.15, price_change_percentage_24h: 1.02, circulating_supply: 620000000, total_supply: 1000000000, max_supply: 1000000000, ath: 53, ath_change_percentage: -72, ath_date: "2021-05-10T00:00:00Z", sparkline_in_7d: { price: [] } },
  ];
}
