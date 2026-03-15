"use client";

import { useState, useMemo } from "react";
import { Section } from "@/components/ui/section";
import {
  Calendar,
  TrendingUp,
  Info,
  DollarSign,
  Layers,
} from "lucide-react";

function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Interval = "daily" | "weekly" | "biweekly" | "monthly";

const INTERVALS: { label: string; value: Interval; daysPerPeriod: number }[] = [
  { label: "Daily", value: "daily", daysPerPeriod: 1 },
  { label: "Weekly", value: "weekly", daysPerPeriod: 7 },
  { label: "Bi-weekly", value: "biweekly", daysPerPeriod: 14 },
  { label: "Monthly", value: "monthly", daysPerPeriod: 30 },
];

// Simulated historical average prices (monthly) for common coins
const COIN_PRESETS: { id: string; name: string; symbol: string; currentPrice: number; yearAgoPrice: number }[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", currentPrice: 87432, yearAgoPrice: 62000 },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", currentPrice: 3241, yearAgoPrice: 3100 },
  { id: "solana", name: "Solana", symbol: "SOL", currentPrice: 142, yearAgoPrice: 95 },
  { id: "binancecoin", name: "BNB", symbol: "BNB", currentPrice: 612, yearAgoPrice: 380 },
  { id: "cardano", name: "Cardano", symbol: "ADA", currentPrice: 0.45, yearAgoPrice: 0.58 },
  { id: "ripple", name: "XRP", symbol: "XRP", currentPrice: 0.62, yearAgoPrice: 0.55 },
];

export default function DCACalculatorPage() {
  const [investmentAmount, setInvestmentAmount] = useState("100");
  const [interval, setInterval] = useState<Interval>("weekly");
  const [duration, setDuration] = useState("12"); // months
  const [selectedCoin, setSelectedCoin] = useState(0);

  const coin = COIN_PRESETS[selectedCoin];

  const result = useMemo(() => {
    const amount = parseFloat(investmentAmount) || 0;
    const months = parseInt(duration) || 0;
    if (amount <= 0 || months <= 0) return null;

    const intervalInfo = INTERVALS.find((i) => i.value === interval)!;
    const totalDays = months * 30;
    const numPurchases = Math.floor(totalDays / intervalInfo.daysPerPeriod);
    if (numPurchases <= 0) return null;

    const totalInvested = amount * numPurchases;

    // Simulate DCA: price linearly interpolates from yearAgoPrice to currentPrice
    // This is a simplification for demonstration
    let totalCoins = 0;
    const purchases: { period: number; price: number; coins: number; totalCoins: number; totalInvested: number }[] = [];

    for (let i = 0; i < numPurchases; i++) {
      const progress = i / (numPurchases - 1 || 1);
      // Simulate price variation: linear trend with some noise
      const priceRatio = coin.yearAgoPrice + (coin.currentPrice - coin.yearAgoPrice) * progress;
      // Add simulated volatility (±10%)
      const noise = 1 + (Math.sin(i * 2.7) * 0.1);
      const price = priceRatio * noise;
      const coins = amount / price;
      totalCoins += coins;
      purchases.push({
        period: i + 1,
        price,
        coins,
        totalCoins,
        totalInvested: amount * (i + 1),
      });
    }

    const currentValue = totalCoins * coin.currentPrice;
    const averageCost = totalInvested / totalCoins;
    const pnl = currentValue - totalInvested;
    const roi = (pnl / totalInvested) * 100;

    return {
      numPurchases,
      totalInvested,
      totalCoins,
      averageCost,
      currentValue,
      pnl,
      roi,
      isProfit: pnl >= 0,
      purchases,
    };
  }, [investmentAmount, interval, duration, coin]);

  // Mini chart from purchases
  const chartPoints = useMemo(() => {
    if (!result || result.purchases.length < 2) return null;
    const values = result.purchases.map((p) => p.totalCoins * coin.currentPrice);
    const invested = result.purchases.map((p) => p.totalInvested);
    const max = Math.max(...values, ...invested);
    const width = 600;
    const height = 200;

    const valuePoints = values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - (v / max) * height * 0.9 - 10;
        return `${x},${y}`;
      })
      .join(" ");

    const investedPoints = invested
      .map((v, i) => {
        const x = (i / (invested.length - 1)) * width;
        const y = height - (v / max) * height * 0.9 - 10;
        return `${x},${y}`;
      })
      .join(" ");

    return { valuePoints, investedPoints, width, height };
  }, [result, coin]);

  return (
    <Section>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                DCA Calculator
              </h1>
              <p className="text-sm text-muted-foreground">
                Dollar-Cost Averaging — see how regular investments accumulate over time
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="rounded-xl border border-border/60 bg-card p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              DCA Parameters
            </h2>

            {/* Coin */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Coin</label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(Number(e.target.value))}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                {COIN_PRESETS.map((c, i) => (
                  <option key={c.id} value={i}>{c.name} ({c.symbol})</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Investment per Purchase (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="100"
                  min="1"
                  step="any"
                  className="w-full rounded-lg border border-border/60 bg-background pl-7 pr-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
              <div className="flex gap-2">
                {[25, 50, 100, 250, 500, 1000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setInvestmentAmount(String(v))}
                    className="text-xs px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Interval */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium">Purchase Interval</label>
                <div className="group relative">
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-popover border border-border text-xs text-muted-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    How often you purchase. Weekly or monthly are most common DCA strategies.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {INTERVALS.map((i) => (
                  <button
                    key={i.value}
                    onClick={() => setInterval(i.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      interval === i.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (months)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12"
                min="1"
                max="120"
                className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
              <div className="flex gap-2">
                {[3, 6, 12, 24, 36, 60].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDuration(String(v))}
                    className="text-xs px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {v}mo
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wider">Total Invested</span>
                    </div>
                    <p className="text-lg font-bold tabular-nums">{formatUSD(result.totalInvested)}</p>
                    <p className="text-xs text-muted-foreground">{result.numPurchases} purchases</p>
                  </div>
                  <div className={`rounded-xl border p-4 space-y-1 ${
                    result.isProfit ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                  }`}>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wider">Current Value</span>
                    </div>
                    <p className="text-lg font-bold tabular-nums">{formatUSD(result.currentValue)}</p>
                    <p className={`text-xs font-medium ${result.isProfit ? "text-green-500" : "text-red-500"}`}>
                      {result.isProfit ? "+" : ""}{formatUSD(result.pnl)} ({result.roi.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Layers className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wider">Total {coin.symbol}</span>
                    </div>
                    <p className="text-lg font-bold tabular-nums">
                      {result.totalCoins < 1
                        ? result.totalCoins.toFixed(6)
                        : result.totalCoins.toFixed(4)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wider">Avg Cost</span>
                    </div>
                    <p className="text-lg font-bold tabular-nums">{formatUSD(result.averageCost)}</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {formatUSD(coin.currentPrice)}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                {chartPoints && (
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                    <h3 className="text-sm font-semibold">Portfolio Growth</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-primary rounded" /> Value
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-muted-foreground rounded" /> Invested
                      </span>
                    </div>
                    <svg viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`} className="w-full">
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        points={chartPoints.investedPoints}
                      />
                      <polyline
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        points={chartPoints.valuePoints}
                      />
                    </svg>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Simulated using interpolated price data. Actual results will vary. Past performance does not guarantee future results.
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
                Configure your DCA strategy to see projected results.
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
