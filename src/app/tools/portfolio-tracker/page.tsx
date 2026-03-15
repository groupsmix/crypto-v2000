"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  image: string;
};

type Holding = {
  coinId: string;
  quantity: number;
};

type PortfolioEntry = Holding & {
  coin: CoinPrice | null;
  value: number;
  allocation: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "cryptocompare_portfolio";

const CHART_COLORS = [
  "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#10b981",
  "#f97316", "#06b6d4", "#ec4899", "#84cc16", "#6366f1",
  "#14b8a6", "#e11d48",
];

const FALLBACK_COINS: CoinPrice[] = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 87432, price_change_percentage_24h: 2.34, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3241, price_change_percentage_24h: -1.12, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "binancecoin", symbol: "bnb", name: "BNB", current_price: 612, price_change_percentage_24h: 0.87, image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  { id: "solana", symbol: "sol", name: "Solana", current_price: 142, price_change_percentage_24h: 3.45, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { id: "ripple", symbol: "xrp", name: "XRP", current_price: 0.62, price_change_percentage_24h: -0.54, image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { id: "cardano", symbol: "ada", name: "Cardano", current_price: 0.45, price_change_percentage_24h: 1.23, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin", current_price: 0.082, price_change_percentage_24h: 1.5, image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { id: "polkadot", symbol: "dot", name: "Polkadot", current_price: 7.2, price_change_percentage_24h: -1.4, image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" },
  { id: "avalanche-2", symbol: "avax", name: "Avalanche", current_price: 36.5, price_change_percentage_24h: 2.2, image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  { id: "chainlink", symbol: "link", name: "Chainlink", current_price: 14.8, price_change_percentage_24h: 1.02, image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png" },
];

function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Pie Chart SVG ────────────────────────────────────────────────────────────

function PieChartSVG({ entries }: { entries: PortfolioEntry[] }) {
  const validEntries = entries.filter((e) => e.value > 0);
  if (validEntries.length === 0) return null;

  const total = validEntries.reduce((sum, e) => sum + e.value, 0);
  const size = 200;
  const center = size / 2;
  const radius = 80;

  let currentAngle = -Math.PI / 2;
  const slices = validEntries.map((entry, i) => {
    const fraction = entry.value / total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + fraction * 2 * Math.PI;
    currentAngle = endAngle;

    const largeArc = fraction > 0.5 ? 1 : 0;
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const path =
      validEntries.length === 1
        ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`
        : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path,
      color: CHART_COLORS[i % CHART_COLORS.length],
      label: entry.coin?.symbol.toUpperCase() ?? "?",
      percentage: (fraction * 100).toFixed(1),
    };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-48 h-48">
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            stroke="hsl(var(--card))"
            strokeWidth="2"
          />
        ))}
        {/* Center label */}
        <circle cx={center} cy={center} r="40" fill="hsl(var(--card))" />
        <text x={center} y={center - 6} textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="600">
          Total
        </text>
        <text x={center} y={center + 10} textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.7">
          {formatUSD(total)}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="font-medium">{s.label}</span>
            <span className="text-muted-foreground">{s.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PortfolioTrackerPage() {
  const [coins, setCoins] = useState<CoinPrice[]>(FALLBACK_COINS);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // New holding form
  const [newCoinId, setNewCoinId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  // Load holdings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHoldings(JSON.parse(saved));
      }
    } catch {
      // Skip
    }
  }, []);

  // Save holdings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
    } catch {
      // Skip
    }
  }, [holdings]);

  // Fetch live prices
  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false"
      );
      if (res.ok) {
        const data = await res.json();
        setCoins(data);
        setLastUpdated(new Date());
      }
    } catch {
      // Use fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Build portfolio entries
  const portfolio = useMemo((): PortfolioEntry[] => {
    const entries = holdings.map((h) => {
      const coin = coins.find((c) => c.id === h.coinId) ?? null;
      const value = coin ? h.quantity * coin.current_price : 0;
      return { ...h, coin, value, allocation: 0 };
    });

    const total = entries.reduce((sum, e) => sum + e.value, 0);
    for (const e of entries) {
      e.allocation = total > 0 ? (e.value / total) * 100 : 0;
    }

    return entries.sort((a, b) => b.value - a.value);
  }, [holdings, coins]);

  const totalValue = portfolio.reduce((sum, e) => sum + e.value, 0);

  // Weighted 24h change
  const weighted24hChange = useMemo(() => {
    if (totalValue === 0) return 0;
    let weightedSum = 0;
    for (const e of portfolio) {
      const change = e.coin?.price_change_percentage_24h ?? 0;
      weightedSum += change * (e.value / totalValue);
    }
    return weightedSum;
  }, [portfolio, totalValue]);

  function addHolding() {
    const qty = parseFloat(newQuantity);
    if (!newCoinId || !qty || qty <= 0) return;

    // Check if already exists
    const existing = holdings.find((h) => h.coinId === newCoinId);
    if (existing) {
      setHoldings(
        holdings.map((h) =>
          h.coinId === newCoinId ? { ...h, quantity: h.quantity + qty } : h
        )
      );
    } else {
      setHoldings([...holdings, { coinId: newCoinId, quantity: qty }]);
    }

    setNewCoinId("");
    setNewQuantity("");
  }

  function removeHolding(coinId: string) {
    setHoldings(holdings.filter((h) => h.coinId !== coinId));
  }

  function updateQuantity(coinId: string, quantity: number) {
    if (quantity <= 0) {
      removeHolding(coinId);
      return;
    }
    setHoldings(
      holdings.map((h) => (h.coinId === coinId ? { ...h, quantity } : h))
    );
  }

  // Available coins to add (not already in portfolio)
  const availableCoins = coins.filter(
    (c) => !holdings.some((h) => h.coinId === c.id)
  );

  return (
    <Section>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Portfolio Tracker
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your crypto holdings with live prices. Saved locally in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Portfolio Value
            </p>
            <p className="text-2xl font-bold tabular-nums">{formatUSD(totalValue)}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              24h Change
            </p>
            <div className="flex items-center gap-2">
              {weighted24hChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <p className={`text-2xl font-bold tabular-nums ${weighted24hChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {weighted24hChange >= 0 ? "+" : ""}{weighted24hChange.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Assets
            </p>
            <p className="text-2xl font-bold tabular-nums">{holdings.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Holdings List + Add */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add Holding */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Add Holding</h3>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <select
                  value={newCoinId}
                  onChange={(e) => setNewCoinId(e.target.value)}
                  className="flex-1 min-w-[140px] rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                >
                  <option value="">Select coin...</option>
                  {availableCoins.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder="Quantity"
                  min="0"
                  step="any"
                  className="w-32 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
                <Button onClick={addHolding} size="sm" disabled={!newCoinId || !newQuantity}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Holdings Table */}
            {portfolio.length > 0 ? (
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 font-medium">Asset</th>
                        <th className="text-right py-3 px-4 font-medium">Price</th>
                        <th className="text-right py-3 px-4 font-medium">Quantity</th>
                        <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Value</th>
                        <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">24h</th>
                        <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Allocation</th>
                        <th className="text-right py-3 px-4 font-medium w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((entry) => {
                        const change = entry.coin?.price_change_percentage_24h ?? 0;
                        return (
                          <tr key={entry.coinId} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {entry.coin?.image && (
                                  <img src={entry.coin.image} alt={entry.coin.name} width={24} height={24} className="rounded-full" loading="lazy" />
                                )}
                                <div>
                                  <span className="font-medium">{entry.coin?.name ?? entry.coinId}</span>
                                  <span className="text-xs text-muted-foreground ml-1 uppercase">
                                    {entry.coin?.symbol}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums">
                              {entry.coin
                                ? formatUSD(entry.coin.current_price)
                                : "—"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input
                                type="number"
                                value={entry.quantity}
                                onChange={(e) =>
                                  updateQuantity(entry.coinId, parseFloat(e.target.value) || 0)
                                }
                                min="0"
                                step="any"
                                className="w-24 text-right rounded border border-border/60 bg-background px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/30"
                              />
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums font-medium hidden sm:table-cell">
                              {formatUSD(entry.value)}
                            </td>
                            <td className="py-3 px-4 text-right hidden sm:table-cell">
                              <span className={`font-medium tabular-nums ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums text-muted-foreground hidden md:table-cell">
                              {entry.allocation.toFixed(1)}%
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => removeHolding(entry.coinId)}
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                title="Remove"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-card p-12 text-center space-y-2">
                <PieChart className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  No holdings yet. Add coins above to start tracking your portfolio.
                </p>
              </div>
            )}
          </div>

          {/* Chart Sidebar */}
          <div className="space-y-4">
            {portfolio.length > 0 && totalValue > 0 && (
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold">Portfolio Distribution</h3>
                <PieChartSVG entries={portfolio} />
              </div>
            )}

            {/* Refresh */}
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {lastUpdated
                    ? `Prices updated ${lastUpdated.toLocaleTimeString()}`
                    : "Using cached prices"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={fetchPrices}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Holdings are saved in your browser&apos;s local storage. Data is not shared with any server.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
