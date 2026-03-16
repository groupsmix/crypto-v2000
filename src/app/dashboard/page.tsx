import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Star, GitCompareArrows, Bell, TrendingUp } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your CryptoCompare AI dashboard - view saved comparisons, watchlists, and price alerts.",
};

async function getDashboardData(userId: string) {
  const [savedComparisonsCount, watchlistCount, alertsCount] = await Promise.all([
    prisma.savedComparison.count({ where: { userId } }),
    prisma.watchlist.count({ where: { userId } }),
    prisma.priceAlert.count({ where: { userId } }),
  ]);

  return { savedComparisonsCount, watchlistCount, alertsCount };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const { savedComparisonsCount, watchlistCount, alertsCount } =
    await getDashboardData(session.user.id);

  const displayName = session.user.name || session.user.email.split("@")[0];

  const stats = [
    {
      label: "Watchlist Items",
      value: watchlistCount,
      icon: Star,
      href: "/dashboard/watchlist",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Saved Comparisons",
      value: savedComparisonsCount,
      icon: GitCompareArrows,
      href: "/dashboard/saved-comparisons",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Price Alerts",
      value: alertsCount,
      icon: Bell,
      href: "/dashboard/alerts",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your crypto tracking activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/compare"
            className="flex items-center gap-3 rounded-lg border border-border p-4 hover:border-primary/30 hover:bg-accent/50 transition-colors"
          >
            <GitCompareArrows className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Compare Exchanges</p>
              <p className="text-xs text-muted-foreground">
                Side-by-side exchange comparison
              </p>
            </div>
          </a>
          <a
            href="/prices"
            className="flex items-center gap-3 rounded-lg border border-border p-4 hover:border-primary/30 hover:bg-accent/50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">View Prices</p>
              <p className="text-xs text-muted-foreground">
                Live cryptocurrency prices
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Activity placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No recent activity yet.</p>
          <p className="text-xs mt-1">
            Start comparing exchanges and adding coins to your watchlist!
          </p>
        </div>
      </div>
    </div>
  );
}
