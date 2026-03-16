import type { Metadata } from "next";
import { Database } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ExchangeManager } from "@/components/admin/exchange-manager";

export const metadata: Metadata = {
  title: "Manage Exchanges",
  description: "Create, edit, and delete exchange listings.",
};

export const dynamic = "force-dynamic";

async function getExchanges() {
  try {
    return await prisma.exchange.findMany({
      orderBy: { score: "desc" },
      include: {
        fees: true,
        offers: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function AdminExchangesPage() {
  const exchanges = await getExchanges();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Exchanges</h1>
            <p className="text-sm text-muted-foreground">
              {exchanges.length} exchange{exchanges.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>
      </div>

      <ExchangeManager exchanges={JSON.parse(JSON.stringify(exchanges))} />
    </div>
  );
}
