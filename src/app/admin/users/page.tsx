import type { Metadata } from "next";
import { Users, Shield, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "User Management",
  description: "View and manage user accounts.",
};

export const dynamic = "force-dynamic";

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            savedComparisons: true,
            priceAlerts: true,
            watchlists: true,
            affiliateClicks: true,
          },
        },
      },
    });
    return users;
  } catch {
    return [];
  }
}

async function getUserStats() {
  try {
    const [totalUsers, adminUsers, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);
    return { totalUsers, adminUsers, recentUsers };
  } catch {
    return { totalUsers: 0, adminUsers: 0, recentUsers: 0 };
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminUsersPage() {
  const [users, stats] = await Promise.all([getUsers(), getUserStats()]);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            {stats.totalUsers} registered user{stats.totalUsers !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Users
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Admins
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.adminUsers}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              New (30 days)
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.recentUsers}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-center py-3 px-4 font-medium">Comparisons</th>
                <th className="text-center py-3 px-4 font-medium">Alerts</th>
                <th className="text-center py-3 px-4 font-medium">Watchlist</th>
                <th className="text-center py-3 px-4 font-medium">Clicks</th>
                <th className="text-left py-3 px-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium">{user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground">
                          User
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">
                      {user._count.savedComparisons}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">
                      {user._count.priceAlerts}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">
                      {user._count.watchlists}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums">
                      {user._count.affiliateClicks}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Role management (promote/demote) will be available in a future update.
        To set a user as admin, update their role directly in the database.
      </p>
    </div>
  );
}
