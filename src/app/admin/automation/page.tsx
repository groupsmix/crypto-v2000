import type { Metadata } from "next";
import {
  Bot,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TriggerButton } from "./trigger-button";

export const metadata: Metadata = {
  title: "Content Automation",
  description: "View and manage automated content generation runs.",
};

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(start: Date | null, end: Date | null): string {
  if (!start) return "—";
  const endTime = end ? new Date(end).getTime() : Date.now();
  const durationMs = endTime - new Date(start).getTime();
  const seconds = Math.floor(durationMs / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

type StatusConfig = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  colorClass: string;
  bgClass: string;
};

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle2,
        label: "Completed",
        colorClass: "text-green-600 dark:text-green-400",
        bgClass: "bg-green-100 dark:bg-green-900/30",
      };
    case "failed":
      return {
        icon: XCircle,
        label: "Failed",
        colorClass: "text-red-600 dark:text-red-400",
        bgClass: "bg-red-100 dark:bg-red-900/30",
      };
    case "running":
      return {
        icon: Loader2,
        label: "Running",
        colorClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-100 dark:bg-blue-900/30",
      };
    default:
      return {
        icon: Clock,
        label: "Pending",
        colorClass: "text-yellow-600 dark:text-yellow-400",
        bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
      };
  }
}

async function getAutomationRuns() {
  try {
    return await prisma.automationRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  } catch {
    return [];
  }
}

async function getAutomationStats() {
  try {
    const [totalRuns, completedRuns, totalArticles, totalImages] =
      await Promise.all([
        prisma.automationRun.count(),
        prisma.automationRun.count({ where: { status: "completed" } }),
        prisma.automationRun.aggregate({ _sum: { articlesCreated: true } }),
        prisma.automationRun.aggregate({ _sum: { imagesGenerated: true } }),
      ]);

    return {
      totalRuns,
      completedRuns,
      totalArticles: totalArticles._sum.articlesCreated ?? 0,
      totalImages: totalImages._sum.imagesGenerated ?? 0,
    };
  } catch {
    return { totalRuns: 0, completedRuns: 0, totalArticles: 0, totalImages: 0 };
  }
}

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

export default async function AutomationPage() {
  const [runs, stats] = await Promise.all([
    getAutomationRuns(),
    getAutomationStats(),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Content Automation
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered content generation pipeline
            </p>
          </div>
        </div>
        <TriggerButton />
      </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Play}
            label="Total Runs"
            value={stats.totalRuns}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completedRuns}
          />
          <StatCard
            icon={FileText}
            label="Articles Generated"
            value={stats.totalArticles}
          />
          <StatCard
            icon={ImageIcon}
            label="Images Generated"
            value={stats.totalImages}
          />
        </div>

        {/* Runs Table */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Automation Runs
            </h2>
          </div>

          {runs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bot className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>No automation runs yet.</p>
              <p className="mt-1">
                Click &ldquo;Run Now&rdquo; to trigger the content generation
                pipeline.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Started
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Duration
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Topics
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Articles
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Images
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Errors
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => {
                    const statusConfig = getStatusConfig(run.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={run.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgClass} ${statusConfig.colorClass}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(run.startedAt)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDuration(run.startedAt, run.completedAt)}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums">
                          {run.topicsFetched}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums font-medium">
                          {run.articlesCreated}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums">
                          {run.imagesGenerated}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {run.errorCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                              <AlertTriangle className="h-3 w-3" />
                              {run.errorCount}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">
                          {run.resultSummary ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Logs */}
        {runs.length > 0 && runs[0].logs.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="p-4 border-b border-border/40">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Latest Run Logs
              </h2>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {runs[0].logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 text-xs font-mono p-2 rounded ${
                    log.level === "error"
                      ? "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300"
                      : log.level === "warn"
                        ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300"
                        : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <span className="shrink-0 uppercase font-bold w-12">
                    [{log.level}]
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {new Date(log.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      <p className="text-center text-xs text-muted-foreground">
        The content engine runs daily at 6:00 AM UTC when the worker is
        active. You can also trigger runs manually.
      </p>
    </div>
  );
}
