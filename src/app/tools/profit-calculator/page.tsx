"use client";

import { useState, useMemo } from "react";
import { Section } from "@/components/ui/section";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Info,
} from "lucide-react";

function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProfitCalculatorPage() {
  const [buyPrice, setBuyPrice] = useState("40000");
  const [sellPrice, setSellPrice] = useState("50000");
  const [quantity, setQuantity] = useState("0.5");
  const [feePercent, setFeePercent] = useState("0.1");

  const result = useMemo(() => {
    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;
    const qty = parseFloat(quantity) || 0;
    const fee = parseFloat(feePercent) || 0;

    if (buy <= 0 || qty <= 0) return null;

    const totalInvestment = buy * qty;
    const totalReturn = sell * qty;
    const buyFee = (totalInvestment * fee) / 100;
    const sellFee = (totalReturn * fee) / 100;
    const totalFees = buyFee + sellFee;
    const grossPnL = totalReturn - totalInvestment;
    const netPnL = grossPnL - totalFees;
    const roi = totalInvestment > 0 ? (netPnL / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      totalReturn,
      grossPnL,
      buyFee,
      sellFee,
      totalFees,
      netPnL,
      roi,
      isProfit: netPnL >= 0,
    };
  }, [buyPrice, sellPrice, quantity, feePercent]);

  return (
    <Section>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Profit / Loss Calculator
              </h1>
              <p className="text-sm text-muted-foreground">
                Calculate your net profit or loss including trading fees
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="rounded-xl border border-border/60 bg-card p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trade Details
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buy Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="40000"
                  min="0"
                  step="any"
                  className="w-full rounded-lg border border-border/60 bg-background pl-7 pr-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sell Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="50000"
                  min="0"
                  step="any"
                  className="w-full rounded-lg border border-border/60 bg-background pl-7 pr-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.5"
                min="0"
                step="any"
                className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium">Trading Fee (%)</label>
                <div className="group relative">
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 rounded-lg bg-popover border border-border text-xs text-muted-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    Applied to both buy and sell transactions. Typical exchange fees: 0.1% – 0.6%.
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  placeholder="0.1"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full rounded-lg border border-border/60 bg-background px-4 pr-8 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                {[0.1, 0.2, 0.4, 0.6, 1.0].map((v) => (
                  <button
                    key={v}
                    onClick={() => setFeePercent(String(v))}
                    className="text-xs px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Hero P/L */}
                <div
                  className={`rounded-xl border p-6 space-y-2 ${
                    result.isProfit
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-red-500/30 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {result.isProfit ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span>Net {result.isProfit ? "Profit" : "Loss"}</span>
                  </div>
                  <p
                    className={`text-3xl font-bold tabular-nums ${
                      result.isProfit ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {result.isProfit ? "+" : ""}
                    {formatUSD(result.netPnL)}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      result.isProfit ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ROI: {result.roi >= 0 ? "+" : ""}
                    {result.roi.toFixed(2)}%
                  </p>
                </div>

                {/* Breakdown */}
                <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Investment</span>
                      <span className="font-medium tabular-nums">{formatUSD(result.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Return (gross)</span>
                      <span className="font-medium tabular-nums">{formatUSD(result.totalReturn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross P/L</span>
                      <span className={`font-medium tabular-nums ${result.grossPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {result.grossPnL >= 0 ? "+" : ""}{formatUSD(result.grossPnL)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Buy Fee ({feePercent}%)</span>
                        <span className="font-medium tabular-nums text-red-500">-{formatUSD(result.buyFee)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Sell Fee ({feePercent}%)</span>
                        <span className="font-medium tabular-nums text-red-500">-{formatUSD(result.sellFee)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Total Fees</span>
                        <span className="font-medium tabular-nums text-red-500">-{formatUSD(result.totalFees)}</span>
                      </div>
                    </div>
                    <div className="border-t border-border/60 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Net P/L</span>
                        <span className={`font-bold tabular-nums ${result.isProfit ? "text-green-500" : "text-red-500"}`}>
                          {result.isProfit ? "+" : ""}{formatUSD(result.netPnL)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
                Enter trade details to calculate profit/loss.
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
