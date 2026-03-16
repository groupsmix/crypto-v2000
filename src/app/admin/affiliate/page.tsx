import type { Metadata } from "next";
import { BarChart3, MousePointerClick, Globe, Clock } from "lucide-react";
import {
  getAffiliateAnalytics,
  type ClicksByExchange,
  type ClicksBySource,
} from "@/lib/data/affiliate-analytics";


export const metadata: Metadata = {
  title: "Affiliate Analytics",
  description: "View affiliate click tracking analytics.",
};

// ─── Bar Chart (CSS-based) ──────────────────────────────────────────────────────

function HorizontalBarChart({
  data,
  labelKey,
  valueKey,
  color = "bg-primary",
}: {
  data: { label: string; value: number }[];
  labelKey: string;
  valueKey: string;
  color?: string;
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No data yet. Clicks will appear here once users start clicking CTA buttons.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span>{labelKey}</span>
        <span>{valueKey}</span>
      </div>
      {data.map((item) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[200px]">
                {item.label}
              </span>
              <span className="font-bold tabular-nums">{item.value}</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${color} transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// ─── Source Label Helper ────────────────────────────────────────────────────────

function formatSourcePage(source: string): string {
  const labels: Record<string, string> = {
    homepage: "Homepage Table",
    "homepage-featured": "Featured Cards",
    compare: "Compare Page",
    "exchange-detail": "Exchange Detail",
    "exchange-detail-offer": "Exchange Detail (Offer)",
    unknown: "Unknown",
  };
  return labels[source] || source;
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default async function AffiliateAnalyticsPage() {
  const analytics = await getAffiliateAnalytics();

  const exchangeChartData = analytics.clicksByExchange.map(
    (r: ClicksByExchange) => ({
      label: r.exchangeName,
      value: r.totalClicks,
    })
  );

  const sourceChartData = analytics.clicksBySource.map(
    (r: ClicksBySource) => ({
      label: formatSourcePage(r.sourcePage),
      value: r.totalClicks,
    })
  );

  const topExchange =
    analytics.clicksByExchange.length > 0
      ? analytics.clicksByExchange[0].exchangeName
      : "—";

  const topSource =
    analytics.clicksBySource.length > 0
      ? formatSourcePage(analytics.clicksBySource[0].sourcePage)
      : "—";

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Affiliate Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Track affiliate click performance across the platform
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MousePointerClick}
          label="Total Clicks"
          value={analytics.totalClicks.toLocaleString()}
        />
        <StatCard
          icon={BarChart3}
          label="Exchanges Clicked"
          value={analytics.clicksByExchange.length}
        />
        <StatCard
          icon={Globe}
          label="Top Source"
          value={topSource}
        />
        <StatCard
          icon={MousePointerClick}
          label="Top Exchange"
          value={topExchange}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clicks by Exchange */}
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Clicks by Exchange
          </h2>
          <HorizontalBarChart
            data={exchangeChartData}
            labelKey="Exchange"
            valueKey="Clicks"
            color="bg-primary"
          />
        </div>

        {/* Clicks by Source Page */}
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Clicks by Source Page
          </h2>
          <HorizontalBarChart
            data={sourceChartData}
            labelKey="Source"
            valueKey="Clicks"
            color="bg-blue-500"
          />
        </div>
      </div>

      {/* Recent Click Activity */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Recent Click Activity
        </h2>

        {analytics.recentClicks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No clicks recorded yet. Affiliate click activity will appear here in real-time.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Exchange
                  </th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Source Page
                  </th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    IP Hash
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {analytics.recentClicks.map((click) => (
                  <tr
                    key={click.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="py-3 font-medium">{click.exchangeName}</td>
                    <td className="py-3 text-muted-foreground">
                      {formatSourcePage(click.sourcePage)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(click.clickedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">
                      {click.ipHash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
