"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
};

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,polkadot&order=market_cap_desc&per_page=8&page=1&sparkline=false";

const fallbackCoins: CoinPrice[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", current_price: 87432.1, price_change_percentage_24h: 2.34 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", current_price: 3241.55, price_change_percentage_24h: -1.12 },
  { id: "binancecoin", symbol: "BNB", name: "BNB", current_price: 612.8, price_change_percentage_24h: 0.87 },
  { id: "solana", symbol: "SOL", name: "Solana", current_price: 142.3, price_change_percentage_24h: 3.45 },
  { id: "ripple", symbol: "XRP", name: "XRP", current_price: 0.62, price_change_percentage_24h: -0.54 },
  { id: "cardano", symbol: "ADA", name: "Cardano", current_price: 0.45, price_change_percentage_24h: 1.23 },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", current_price: 0.082, price_change_percentage_24h: 4.12 },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", current_price: 7.45, price_change_percentage_24h: -0.98 },
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

export function TrendingCoins() {
  const [coins, setCoins] = useState<CoinPrice[]>(fallbackCoins);

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
    } catch {
      // Keep fallback data
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <Section>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trending Coins
            </h2>
            <p className="text-muted-foreground">
              Live prices updated every 60 seconds.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
          >
            <Link href="/prices">
              All Prices
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {coins.map((coin) => {
            const isPositive = coin.price_change_percentage_24h >= 0;
            return (
              <Link
                key={coin.id}
                href={`/prices/${coin.id}`}
                className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold">{coin.symbol}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {coin.name}
                  </span>
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {formatPrice(coin.current_price)}
                </p>
                <div
                  className={`flex items-center gap-1 mt-1 text-sm font-medium ${
                    isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
