import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Star, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Track your favorite cryptocurrencies and monitor price changes.",
};

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard/watchlist");
  }

  const watchlistItems = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            Track your favorite cryptocurrencies
          </p>
        </div>
        <a
          href="/prices"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Coins
        </a>
      </div>

      {watchlistItems.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Coin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {watchlistItems.map((item) => (
                <tr key={item.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">
                    {item.coinName}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground uppercase">
                    {item.coinSymbol}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Add cryptocurrencies to your watchlist to track their prices and get updates.
          </p>
          <a
            href="/prices"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Browse Prices
          </a>
        </div>
      )}
    </div>
  );
}
