import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  BarChart3,
  Globe,
  Hash,
  DollarSign,
  Activity,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { getCoinDetail, getMarketChart } from "@/lib/data/coingecko";
import { PriceChart } from "@/components/prices/price-chart";

export const revalidate = 300; // ISR: revalidate every 5 minutes

type PageProps = {
  params: Promise<{ coin: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { coin: coinId } = await params;
  const coin = await getCoinDetail(coinId);

  if (!coin) {
    return { title: "Coin Not Found" };
  }

  const price = coin.market_data.current_price.usd;
  const priceFormatted =
    price >= 1
      ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
      : `$${price.toFixed(6)}`;

  return {
    title: `${coin.name} (${coin.symbol.toUpperCase()}) Price — ${priceFormatted}`,
    description: `${coin.name} live price is ${priceFormatted}. View ${coin.symbol.toUpperCase()} market cap, volume, 24h change, price chart, and exchange availability on CryptoCompare AI.`,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return `$${price.toFixed(6)}`;
}

function formatLargeNumber(num: number | null): string {
  if (num === null || num === undefined) return "—";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function formatSupply(num: number | null): string {
  if (num === null || num === undefined) return "—";
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  return num.toLocaleString();
}

function formatPercent(pct: number | null): string {
  if (pct === null || pct === undefined) return "—";
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

function PercentBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-medium ${
        isPositive ? "text-green-500" : "text-red-500"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      {subValue && (
        <div className="text-xs text-muted-foreground">{subValue}</div>
      )}
    </div>
  );
}

// ─── Known exchange mappings for affiliate links ────────────────────────────────

const KNOWN_EXCHANGES: Record<string, { slug: string; name: string }> = {
  binance: { slug: "binance", name: "Binance" },
  gdax: { slug: "coinbase", name: "Coinbase" },
  coinbase_exchange: { slug: "coinbase", name: "Coinbase" },
  kraken: { slug: "kraken", name: "Kraken" },
  bybit_spot: { slug: "bybit", name: "Bybit" },
  kucoin: { slug: "kucoin", name: "KuCoin" },
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default async function CoinDetailPage({ params }: PageProps) {
  const { coin: coinId } = await params;
  const [coin, chartData] = await Promise.all([
    getCoinDetail(coinId),
    getMarketChart(coinId, 90),
  ]);

  if (!coin) {
    notFound();
  }

  const md = coin.market_data;
  const price = md.current_price.usd;
  const change24h = md.price_change_percentage_24h;

  // Schema markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${coin.name} Price`,
    description: `Live ${coin.name} (${coin.symbol.toUpperCase()}) price, market data, and exchange availability.`,
    mainEntity: {
      "@type": "ExchangeRateSpecification",
      currency: coin.symbol.toUpperCase(),
      currentExchangeRate: {
        "@type": "UnitPriceSpecification",
        price: price,
        priceCurrency: "USD",
      },
    },
  };

  // Get unique exchanges from tickers
  const exchangeMap = new Map<string, { name: string; volume: number; trustScore: string | null; tradeUrl: string | null; slug: string | null }>();
  for (const ticker of coin.tickers) {
    const id = ticker.market.identifier;
    const existing = exchangeMap.get(id);
    const known = KNOWN_EXCHANGES[id];
    if (existing) {
      existing.volume += ticker.volume;
    } else {
      exchangeMap.set(id, {
        name: ticker.market.name,
        volume: ticker.volume,
        trustScore: ticker.trust_score,
        tradeUrl: ticker.trade_url,
        slug: known?.slug ?? null,
      });
    }
  }
  const exchanges = Array.from(exchangeMap.values())
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 15);

  // Strip HTML from description
  const description = coin.description.en
    .replace(/<[^>]*>/g, "")
    .substring(0, 500);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section>
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href="/prices"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Prices
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {coin.image.large && (
                <img
                  src={coin.image.large}
                  alt={coin.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {coin.name}
                  </h1>
                  <span className="text-sm font-medium text-muted-foreground uppercase bg-muted/60 px-2 py-0.5 rounded">
                    {coin.symbol.toUpperCase()}
                  </span>
                  {coin.market_cap_rank && (
                    <span className="text-xs text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                      #{coin.market_cap_rank}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xl font-bold tabular-nums">
                    {formatPrice(price)}
                  </span>
                  <PercentBadge value={change24h} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              icon={DollarSign}
              label="Market Cap"
              value={formatLargeNumber(md.market_cap.usd)}
            />
            <StatCard
              icon={Activity}
              label="24h Volume"
              value={formatLargeNumber(md.total_volume.usd)}
            />
            <StatCard
              icon={BarChart3}
              label="24h Range"
              value={`${formatPrice(md.low_24h.usd)} – ${formatPrice(md.high_24h.usd)}`}
            />
            <StatCard
              icon={Hash}
              label="Circulating"
              value={formatSupply(md.circulating_supply)}
              subValue={
                md.max_supply
                  ? `Max: ${formatSupply(md.max_supply)}`
                  : undefined
              }
            />
            <StatCard
              icon={TrendingUp}
              label="ATH"
              value={formatPrice(md.ath.usd)}
              subValue={<PercentBadge value={md.ath_change_percentage.usd} />}
            />
            <StatCard
              icon={Globe}
              label="7d / 30d"
              value={formatPercent(md.price_change_percentage_7d)}
              subValue={formatPercent(md.price_change_percentage_30d)}
            />
          </div>

          {/* Price Chart */}
          {chartData && chartData.prices.length > 0 && (
            <PriceChart prices={chartData.prices} />
          )}

          {/* Exchanges */}
          {exchanges.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Exchanges Supporting {coin.name}
              </h2>
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 font-medium">
                          Exchange
                        </th>
                        <th className="text-right py-3 px-4 font-medium">
                          Volume
                        </th>
                        <th className="text-center py-3 px-4 font-medium hidden sm:table-cell">
                          Trust
                        </th>
                        <th className="text-right py-3 px-4 font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchanges.map((ex) => (
                        <tr
                          key={ex.name}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">
                            {ex.slug ? (
                              <Link
                                href={`/exchanges/${ex.slug}`}
                                className="hover:text-primary transition-colors"
                              >
                                {ex.name}
                              </Link>
                            ) : (
                              ex.name
                            )}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                            {ex.volume >= 1e6
                              ? `${(ex.volume / 1e6).toFixed(2)}M`
                              : ex.volume >= 1e3
                                ? `${(ex.volume / 1e3).toFixed(1)}K`
                                : ex.volume.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center hidden sm:table-cell">
                            {ex.trustScore === "green" && (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="High trust" />
                            )}
                            {ex.trustScore === "yellow" && (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500" title="Medium trust" />
                            )}
                            {ex.trustScore === "red" && (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Low trust" />
                            )}
                            {!ex.trustScore && (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {ex.slug ? (
                              <Link href={`/exchanges/${ex.slug}`}>
                                <Button size="sm" variant="default" className="h-7 text-xs">
                                  Visit Exchange
                                </Button>
                              </Link>
                            ) : ex.tradeUrl ? (
                              <a
                                href={ex.tradeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                  Trade
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </a>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-7 text-xs" disabled>
                                N/A
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">About {coin.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
                {coin.description.en.length > 500 && "..."}
              </p>
            </div>
          )}

          {/* Links */}
          {coin.links.homepage[0] && (
            <div className="flex flex-wrap gap-2">
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/60 rounded-full px-3 py-1"
              >
                <Globe className="h-3 w-3" />
                Website
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {coin.links.blockchain_site[0] && (
                <a
                  href={coin.links.blockchain_site[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/60 rounded-full px-3 py-1"
                >
                  Explorer
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {coin.links.repos_url.github[0] && (
                <a
                  href={coin.links.repos_url.github[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/60 rounded-full px-3 py-1"
                >
                  GitHub
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Data provided by CoinGecko. Prices update every 5 minutes.
          </p>
        </div>
      </Section>
    </>
  );
}
