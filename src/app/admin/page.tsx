import type { Metadata } from "next";
import Link from "next/link";
import {
  Database,
  FileText,
  BarChart3,
  Users,
  Bot,
  MousePointerClick,
  TrendingUp,
  Activity,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing CryptoCompare AI.",
};

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  try {
    const [
      totalExchanges,
      totalBlogPosts,
      publishedBlogPosts,
      totalClicks,
      totalUsers,
      totalAutomationRuns,
      completedRuns,
      failedRuns,
      recentClicks,
    ] = await Promise.all([
      prisma.exchange.count(),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { publishedAt: { not: null } } }),
      prisma.affiliateClick.count(),
      prisma.user.count(),
      prisma.automationRun.count(),
      prisma.automationRun.count({ where: { status: "completed" } }),
      prisma.automationRun.count({ where: { status: "failed" } }),
      prisma.affiliateClick.findMany({
        take: 5,
        orderBy: { clickedAt: "desc" },
        include: { exchange: { select: { name: true } } },
      }),
    ]);

    return {
      totalExchanges,
      totalBlogPosts,
      publishedBlogPosts,
      totalClicks,
      totalUsers,
      totalAutomationRuns,
      completedRuns,
      failedRuns,
      recentClicks,
    };
  } catch {
    return {
      totalExchanges: 0,
      totalBlogPosts: 0,
      publishedBlogPosts: 0,
      totalClicks: 0,
      totalUsers: 0,
      totalAutomationRuns: 0,
      completedRuns: 0,
      failedRuns: 0,
      recentClicks: [] as { id: string; exchange: { name: string }; sourcePage: string; clickedAt: Date }[],
    };
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color = "text-primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  href: string;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border/60 bg-card p-5 space-y-2 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your CryptoCompare AI platform
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Total Exchanges"
          value={stats.totalExchanges}
          href="/admin/exchanges"
        />
        <StatCard
          icon={FileText}
          label="Blog Posts"
          value={`${stats.publishedBlogPosts} / ${stats.totalBlogPosts}`}
          href="/admin/blog"
          color="text-blue-500"
        />
        <StatCard
          icon={MousePointerClick}
          label="Affiliate Clicks"
          value={stats.totalClicks.toLocaleString()}
          href="/admin/affiliate"
          color="text-green-500"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          href="/admin/users"
          color="text-purple-500"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Bot}
          label="Automation Runs"
          value={stats.totalAutomationRuns}
          href="/admin/automation"
        />
        <StatCard
          icon={TrendingUp}
          label="Completed Jobs"
          value={stats.completedRuns}
          href="/admin/automation"
          color="text-green-500"
        />
        <StatCard
          icon={Activity}
          label="Failed Jobs"
          value={stats.failedRuns}
          href="/admin/automation"
          color="text-red-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Affiliate Activity */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Recent Affiliate Clicks
            </h2>
          </div>
          {stats.recentClicks.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No affiliate clicks recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {stats.recentClicks.map((click) => (
                <div
                  key={click.id}
                  className="px-4 py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">{click.exchange.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {click.sourcePage}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(click.clickedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="text-sm font-semibold">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { title: "Manage Exchanges", href: "/admin/exchanges", icon: Database },
              { title: "Write Blog Post", href: "/admin/blog", icon: FileText },
              { title: "View Analytics", href: "/admin/affiliate", icon: BarChart3 },
              { title: "Run Automation", href: "/admin/automation", icon: Bot },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 rounded-lg border border-border/40 px-4 py-3 text-sm font-medium hover:bg-muted/50 hover:border-primary/30 transition-all"
              >
                <action.icon className="h-4 w-4 text-muted-foreground" />
                {action.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
