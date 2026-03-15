import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Bell, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Price Alerts",
  description: "Manage your cryptocurrency price alerts and notifications.",
};

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard/alerts");
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Price Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Get notified when prices hit your targets
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors opacity-50 cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          <Plus className="h-4 w-4" />
          New Alert
        </button>
      </div>

      {alerts.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Coin
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Target Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium uppercase">
                    {alert.coinSymbol}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono">
                    ${alert.targetPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">No price alerts</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Set price alerts to get notified when your favorite cryptocurrencies reach your target price.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Alert creation coming soon
          </p>
        </div>
      )}
    </div>
  );
}
