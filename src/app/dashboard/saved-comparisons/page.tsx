import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { GitCompareArrows, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export const metadata: Metadata = {
  title: "Saved Comparisons",
  description: "View and manage your saved exchange comparisons.",
};

export default async function SavedComparisonsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard/saved-comparisons");
  }

  const savedComparisons = await prisma.savedComparison.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Comparisons</h1>
          <p className="text-muted-foreground mt-1">
            Your saved exchange comparisons
          </p>
        </div>
        <a
          href="/compare"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Comparison
        </a>
      </div>

      {savedComparisons.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {savedComparisons.map((comparison) => (
            <div
              key={comparison.id}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-blue-500/10">
                    <GitCompareArrows className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {comparison.exchangeIds.length} exchanges compared
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saved on {new Date(comparison.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={`/compare?exchanges=${comparison.exchangeIds.join(",")}`}
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <GitCompareArrows className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">No saved comparisons</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Compare crypto exchanges side-by-side and save your comparisons for later.
          </p>
          <a
            href="/compare"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Compare Exchanges
          </a>
        </div>
      )}
    </div>
  );
}
