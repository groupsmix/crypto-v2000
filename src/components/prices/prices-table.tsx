"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import type { CoinMarket } from "@/lib/data/coingecko";

type SortField = "market_cap_rank" | "current_price" | "price_change_percentage_24h" | "market_cap" | "total_volume";
type SortDir = "asc" | "desc";

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (price >= 0.01) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function MiniSparkline({ prices, isPositive }: { prices: number[]; isPositive: boolean }) {
  if (!prices || prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const width = 100;
  const height = 32;

  // Sample ~30 points for the sparkline
  const step = Math.max(1, Math.floor(prices.length / 30));
  const sampled = prices.filter((_, i) => i % step === 0);

  const points = sampled
    .map((p, i) => {
      const x = (i / (sampled.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-[100px] h-[32px]">
      <polyline
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

export function PricesTable({ coins }: { coins: CoinMarket[] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("market_cap_rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return coins;
    return coins.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [coins, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (sortDir === "asc") return (aVal as number) - (bVal as number);
      return (bVal as number) - (aVal as number);
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "market_cap_rank" ? "asc" : "desc");
    }
  }

  function SortableHeader({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) {
    const isActive = sortField === field;
    return (
      <th
        className={`py-3 px-4 font-medium cursor-pointer select-none hover:text-foreground transition-colors ${className ?? ""}`}
        onClick={() => toggleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {children}
          <ArrowUpDown className={`h-3 w-3 ${isActive ? "text-primary" : "text-muted-foreground/50"}`} />
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border/60 bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
        />
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {sorted.length} of {coins.length} coins
      </p>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <SortableHeader field="market_cap_rank" className="text-left w-12">#</SortableHeader>
                <th className="text-left py-3 px-4 font-medium">Coin</th>
                <SortableHeader field="current_price" className="text-right">Price</SortableHeader>
                <SortableHeader field="price_change_percentage_24h" className="text-right">24h %</SortableHeader>
                <SortableHeader field="market_cap" className="text-right hidden sm:table-cell">Market Cap</SortableHeader>
                <SortableHeader field="total_volume" className="text-right hidden md:table-cell">Volume (24h)</SortableHeader>
                <th className="text-right py-3 px-4 font-medium hidden lg:table-cell">7d Chart</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((coin) => {
                const change = coin.price_change_percentage_24h ?? 0;
                const isPositive = change >= 0;

                return (
                  <tr
                    key={coin.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4 text-muted-foreground tabular-nums">
                      {coin.market_cap_rank ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/prices/${coin.id}`}
                        className="flex items-center gap-2.5 hover:text-primary transition-colors"
                      >
                        {coin.image && (
                          <img
                            src={coin.image}
                            alt={coin.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                            loading="lazy"
                          />
                        )}
                        <span className="font-medium">{coin.name}</span>
                        <span className="text-xs text-muted-foreground uppercase">
                          {coin.symbol}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {formatPrice(coin.current_price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${
                          isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(change).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                      {formatLargeNumber(coin.market_cap)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-muted-foreground hidden md:table-cell">
                      {formatLargeNumber(coin.total_volume)}
                    </td>
                    <td className="py-3 px-4 text-right hidden lg:table-cell">
                      <div className="flex justify-end">
                        <MiniSparkline
                          prices={coin.sparkline_in_7d?.price ?? []}
                          isPositive={isPositive}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No coins found matching &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
