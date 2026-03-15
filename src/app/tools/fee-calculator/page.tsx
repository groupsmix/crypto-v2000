"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Info,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

// ─── Exchange Fee Data ────────────────────────────────────────────────────────

type ExchangeFees = {
  name: string;
  slug: string;
  spotMaker: number;
  spotTaker: number;
  futuresMaker: number | null;
  futuresTaker: number | null;
  hasFutures: boolean;
};

const EXCHANGES: ExchangeFees[] = [
  { name: "Binance", slug: "binance", spotMaker: 0.1, spotTaker: 0.1, futuresMaker: 0.02, futuresTaker: 0.04, hasFutures: true },
  { name: "Coinbase", slug: "coinbase", spotMaker: 0.4, spotTaker: 0.6, futuresMaker: null, futuresTaker: null, hasFutures: false },
  { name: "Kraken", slug: "kraken", spotMaker: 0.16, spotTaker: 0.26, futuresMaker: 0.02, futuresTaker: 0.05, hasFutures: true },
  { name: "Bybit", slug: "bybit", spotMaker: 0.1, spotTaker: 0.1, futuresMaker: 0.01, futuresTaker: 0.06, hasFutures: true },
  { name: "KuCoin", slug: "kucoin", spotMaker: 0.1, spotTaker: 0.1, futuresMaker: 0.02, futuresTaker: 0.06, hasFutures: true },
];

type OrderType = "maker" | "taker";
type Market = "spot" | "futures";

function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function FeeCalculatorPage() {
  const [tradeSize, setTradeSize] = useState("10000");
  const [selectedExchange, setSelectedExchange] = useState(0);
  const [orderType, setOrderType] = useState<OrderType>("taker");
  const [market, setMarket] = useState<Market>("spot");

  const exchange = EXCHANGES[selectedExchange];

  const result = useMemo(() => {
    const size = parseFloat(tradeSize) || 0;
    if (size <= 0) return null;

    let feeRate: number;
    if (market === "spot") {
      feeRate = orderType === "maker" ? exchange.spotMaker : exchange.spotTaker;
    } else {
      const fm = orderType === "maker" ? exchange.futuresMaker : exchange.futuresTaker;
      if (fm === null) return null;
      feeRate = fm;
    }

    const feeAmount = (size * feeRate) / 100;
    const netAmount = size - feeAmount;

    return { feeRate, feeAmount, netAmount, size };
  }, [tradeSize, orderType, market, exchange]);

  // Compare across all exchanges
  const comparison = useMemo(() => {
    const size = parseFloat(tradeSize) || 0;
    if (size <= 0) return [];

    return EXCHANGES.map((ex) => {
      let feeRate: number | null;
      if (market === "spot") {
        feeRate = orderType === "maker" ? ex.spotMaker : ex.spotTaker;
      } else {
        feeRate = orderType === "maker" ? ex.futuresMaker : ex.futuresTaker;
      }
      if (feeRate === null) return { ...ex, feeRate: null, feeAmount: null };
      return { ...ex, feeRate, feeAmount: (size * feeRate) / 100 };
    }).sort((a, b) => (a.feeAmount ?? Infinity) - (b.feeAmount ?? Infinity));
  }, [tradeSize, orderType, market]);

  return (
    <Section>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Trading Fee Calculator
              </h1>
              <p className="text-sm text-muted-foreground">
                Calculate exact trading fees across top exchanges
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="rounded-xl border border-border/60 bg-card p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trade Details
            </h2>

            {/* Trade Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trade Size (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={tradeSize}
                  onChange={(e) => setTradeSize(e.target.value)}
                  placeholder="10000"
                  min="0"
                  step="100"
                  className="w-full rounded-lg border border-border/60 bg-background pl-7 pr-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
              <div className="flex gap-2">
                {[1000, 5000, 10000, 50000, 100000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setTradeSize(String(v))}
                    className="text-xs px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Exchange */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Exchange</label>
              <select
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(Number(e.target.value))}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                {EXCHANGES.map((ex, i) => (
                  <option key={ex.slug} value={i}>{ex.name}</option>
                ))}
              </select>
            </div>

            {/* Market Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Market</label>
              <div className="grid grid-cols-2 gap-2">
                {(["spot", "futures"] as Market[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarket(m)}
                    disabled={m === "futures" && !exchange.hasFutures}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      market === m
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {m === "spot" ? "Spot" : "Futures"}
                  </button>
                ))}
              </div>
              {market === "futures" && !exchange.hasFutures && (
                <p className="text-xs text-yellow-500">
                  {exchange.name} does not support futures trading.
                </p>
              )}
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium">Order Type</label>
                <div className="group relative">
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-popover border border-border text-xs text-muted-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    <strong>Maker:</strong> You add liquidity (limit orders). <strong>Taker:</strong> You remove liquidity (market orders). Maker fees are usually lower.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["maker", "taker"] as OrderType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      orderType === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Fee Breakdown — {exchange.name}
              </h2>

              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Fee Rate</p>
                      <p className="text-2xl font-bold tabular-nums">{result.feeRate}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Fee Amount</p>
                      <p className="text-2xl font-bold tabular-nums text-red-500">
                        {formatUSD(result.feeAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-border/60 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Trade Size</span>
                      <span className="text-sm font-medium tabular-nums">{formatUSD(result.size)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">Fee ({result.feeRate}%)</span>
                      <span className="text-sm font-medium tabular-nums text-red-500">-{formatUSD(result.feeAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/60">
                      <span className="text-sm font-medium">Net Amount</span>
                      <span className="text-base font-bold tabular-nums">{formatUSD(result.netAmount)}</span>
                    </div>
                  </div>

                  <Link href={`/exchanges/${exchange.slug}`}>
                    <Button className="w-full mt-2" size="sm">
                      Visit {exchange.name}
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  Enter a trade size to calculate fees.
                </p>
              )}
            </div>

            {/* Comparison */}
            {comparison.length > 0 && parseFloat(tradeSize) > 0 && (
              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-semibold">Fee Comparison</h3>
                </div>
                <div className="space-y-2">
                  {comparison.map((ex, i) => (
                    <div
                      key={ex.slug}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                        i === 0 ? "bg-green-500/10" : "bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {i === 0 && (
                          <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-medium">
                            Lowest
                          </span>
                        )}
                        <span className="text-sm font-medium">{ex.name}</span>
                      </div>
                      <div className="text-right">
                        {ex.feeAmount !== null ? (
                          <div>
                            <span className="text-sm font-medium tabular-nums">{formatUSD(ex.feeAmount)}</span>
                            <span className="text-xs text-muted-foreground ml-1">({ex.feeRate}%)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
