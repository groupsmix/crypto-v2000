"use client";

import { useState, useMemo } from "react";

type ChartProps = {
  prices: [number, number][]; // [timestamp, price]
};

const TIME_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All", days: -1 },
] as const;

function formatChartPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
}

function formatChartDate(timestamp: number, compact: boolean = false): string {
  const date = new Date(timestamp);
  if (compact) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PriceChart({ prices }: ChartProps) {
  const [selectedRange, setSelectedRange] = useState(1); // 30D default

  const filteredPrices = useMemo(() => {
    const range = TIME_RANGES[selectedRange];
    if (range.days === -1) return prices;

    const cutoff = Date.now() - range.days * 24 * 60 * 60 * 1000;
    return prices.filter(([ts]) => ts >= cutoff);
  }, [prices, selectedRange]);

  const chartData = useMemo(() => {
    if (filteredPrices.length < 2) return null;

    const priceValues = filteredPrices.map(([, p]) => p);
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    const range = max - min || 1;

    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 10, bottom: 30, left: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Sample points to avoid too many SVG elements
    const step = Math.max(1, Math.floor(filteredPrices.length / 200));
    const sampled = filteredPrices.filter((_, i) => i % step === 0);

    const points = sampled.map(([ts, p], i) => ({
      x: padding.left + (i / (sampled.length - 1)) * chartW,
      y: padding.top + chartH - ((p - min) / range) * chartH,
      price: p,
      timestamp: ts,
    }));

    const linePath = points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`).join(" ");

    // Gradient area
    const areaPath = `${linePath} L ${points[points.length - 1].x},${padding.top + chartH} L ${points[0].x},${padding.top + chartH} Z`;

    const firstPrice = sampled[0][1];
    const lastPrice = sampled[sampled.length - 1][1];
    const isPositive = lastPrice >= firstPrice;

    // Y-axis labels (5 levels)
    const yLabels = Array.from({ length: 5 }, (_, i) => {
      const val = min + (range * i) / 4;
      const y = padding.top + chartH - (i / 4) * chartH;
      return { value: val, y };
    });

    // X-axis labels (5 dates)
    const xLabels = Array.from({ length: 5 }, (_, i) => {
      const idx = Math.floor((i / 4) * (sampled.length - 1));
      return {
        timestamp: sampled[idx][0],
        x: padding.left + (idx / (sampled.length - 1)) * chartW,
      };
    });

    return { linePath, areaPath, isPositive, yLabels, xLabels, width, height, padding, chartH };
  }, [filteredPrices]);

  if (!chartData) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
        No chart data available.
      </div>
    );
  }

  const strokeColor = chartData.isPositive ? "#22c55e" : "#ef4444";
  const gradientId = chartData.isPositive ? "chartGradientGreen" : "chartGradientRed";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-6 space-y-4">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Price Chart</h3>
        <div className="flex gap-1">
          {TIME_RANGES.map((range, idx) => (
            <button
              key={range.label}
              onClick={() => setSelectedRange(idx)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedRange === idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} className="w-full min-w-[400px]">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {chartData.yLabels.map((label, i) => (
            <line
              key={i}
              x1={chartData.padding.left}
              y1={label.y}
              x2={chartData.width - chartData.padding.right}
              y2={label.y}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <path d={chartData.areaPath} fill={`url(#${gradientId})`} />

          {/* Line */}
          <path d={chartData.linePath} fill="none" stroke={strokeColor} strokeWidth="2" />

          {/* Y-axis labels */}
          {chartData.yLabels.map((label, i) => (
            <text
              key={i}
              x={chartData.padding.left + 4}
              y={label.y - 6}
              fill="currentColor"
              opacity="0.4"
              fontSize="10"
              fontFamily="monospace"
            >
              {formatChartPrice(label.value)}
            </text>
          ))}

          {/* X-axis labels */}
          {chartData.xLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={chartData.padding.top + chartData.chartH + 20}
              fill="currentColor"
              opacity="0.4"
              fontSize="10"
              textAnchor="middle"
            >
              {formatChartDate(label.timestamp, true)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
