import type { Metadata } from "next";
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from "lucide-react";
import {
  getQueueSummary,
  getRecentItems,
  getFailedItems,
} from "@/lib/indexing-queue";

export const metadata: Metadata = {
  title: "Indexing Queue",
  description: "Monitor and manage the URL indexing queue.",
};

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    pending: { icon: Clock, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
    submitted: { icon: CheckCircle2, color: "bg-green-500/10 text-green-600 dark:text-green-400" },
    failed: { icon: XCircle, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  };

  const { icon: Icon, color } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

export default async function IndexingPage() {
  let summary = { pending: 0, submitted: 0, failed: 0, total: 0 };
  let recentItems: Awaited<ReturnType<typeof getRecentItems>> = [];
  let failedItems: Awaited<ReturnType<typeof getFailedItems>> = [];

  try {
    [summary, recentItems, failedItems] = await Promise.all([
      getQueueSummary(),
      getRecentItems(20),
      getFailedItems(10),
    ]);
  } catch {
    // DB unavailable
  }

  const hasIssues = summary.failed > 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Send className="h-6 w-6" />
            Indexing Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            URL indexing queue status and management.
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>
            {new Date().toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="mt-1">
            POST /api/admin/indexing/process to trigger
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{summary.total}</p>
        </div>
        <div className={`rounded-xl border p-4 ${summary.pending > 0 ? "border-yellow-500/40 bg-yellow-500/5" : "border-border/60 bg-card"}`}>
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">{summary.pending}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">Submitted</p>
          <p className="text-2xl font-bold">{summary.submitted}</p>
        </div>
        <div className={`rounded-xl border p-4 ${summary.failed > 0 ? "border-red-500/40 bg-red-500/5" : "border-border/60 bg-card"}`}>
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold">{summary.failed}</p>
        </div>
      </div>

      {/* Failed Items Warning */}
      {hasIssues && failedItems.length > 0 && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Failed Items ({failedItems.length})
          </div>
          <div className="space-y-1">
            {failedItems.map((item) => (
              <div key={item.id} className="text-xs flex items-center justify-between">
                <span className="font-mono truncate max-w-[60%]">{item.canonicalUrl}</span>
                <span className="text-red-500 truncate max-w-[35%]" title={item.errorMessage || undefined}>
                  {item.errorMessage || "Unknown error"} (attempts: {item.attempts})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Items Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border/40">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Recent Queue Items</h2>
        </div>
        {recentItems.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No items in the indexing queue yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground">
                  <th className="text-left py-2 px-4 font-medium">URL</th>
                  <th className="text-left py-2 px-2 font-medium">Type</th>
                  <th className="text-left py-2 px-2 font-medium">Status</th>
                  <th className="text-left py-2 px-2 font-medium">Attempts</th>
                  <th className="text-left py-2 px-2 font-medium">Created</th>
                  <th className="text-left py-2 px-4 font-medium">Last Attempt</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item) => (
                  <tr key={item.id} className="border-b border-border/20">
                    <td className="py-2 px-4 font-mono truncate max-w-[300px]" title={item.canonicalUrl}>
                      {item.url}
                    </td>
                    <td className="py-2 px-2">
                      <span className="rounded bg-muted px-1.5 py-0.5">{item.pageType}</span>
                    </td>
                    <td className="py-2 px-2">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{item.attempts}</td>
                    <td className="py-2 px-2 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 px-4 text-muted-foreground">
                      {item.lastAttemptAt
                        ? new Date(item.lastAttemptAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
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
