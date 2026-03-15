"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
};

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,ripple,cardano&order=market_cap_desc&per_page=6&page=1&sparkline=false";

const fallbackData: CoinPrice[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", current_price: 87432.1, price_change_percentage_24h: 2.34, image: "" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", current_price: 3241.55, price_change_percentage_24h: -1.12, image: "" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", current_price: 612.8, price_change_percentage_24h: 0.87, image: "" },
  { id: "solana", symbol: "SOL", name: "Solana", current_price: 142.3, price_change_percentage_24h: 3.45, image: "" },
  { id: "ripple", symbol: "XRP", name: "XRP", current_price: 0.62, price_change_percentage_24h: -0.54, image: "" },
  { id: "cardano", symbol: "ADA", name: "Cardano", current_price: 0.45, price_change_percentage_24h: 1.23, image: "" },
];

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function CryptoTicker() {
  const [coins, setCoins] = useState<CoinPrice[]>(fallbackData);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(COINGECKO_URL);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: CoinPrice[] = await res.json();
      setCoins(
        data.map((c) => ({
          ...c,
          symbol: c.symbol.toUpperCase(),
        }))
      );
      setLastUpdated(new Date());
    } catch {
      // Keep fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <div className="border-y border-border/40 bg-muted/30">
      <div className="mx-auto max-w-screen-2xl px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex shrink-0 items-center gap-1.5 border-r border-border/40 pr-4">
            <RefreshCw
              className={`h-3.5 w-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`}
            />
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Live Prices
            </span>
          </div>

          <div className="flex items-center gap-6">
            {coins.map((coin) => {
              const isPositive = coin.price_change_percentage_24h >= 0;
              return (
                <div
                  key={coin.id}
                  className="flex shrink-0 items-center gap-2"
                >
                  <span className="text-xs font-semibold">
                    {coin.symbol}
                  </span>
                  <span className="text-xs text-foreground">
                    {formatPrice(coin.current_price)}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>

          {lastUpdated && (
            <span className="ml-auto shrink-0 text-xs text-muted-foreground whitespace-nowrap hidden md:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
