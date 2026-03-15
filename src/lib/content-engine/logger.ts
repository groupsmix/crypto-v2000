import { prisma } from "@/lib/prisma";

export type LogLevel = "info" | "warn" | "error";

export async function logToRun(
  runId: string,
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.automationLog.create({
      data: {
        runId,
        level,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // Fallback to console if DB logging fails
    console.error(`[AutomationLog] Failed to persist log: ${message}`);
  }
}

export async function updateRunStatus(
  runId: string,
  status: string,
  updates?: {
    topicsFetched?: number;
    articlesCreated?: number;
    imagesGenerated?: number;
    errorCount?: number;
    resultSummary?: string;
    startedAt?: Date;
    completedAt?: Date;
  }
): Promise<void> {
  await prisma.automationRun.update({
    where: { id: runId },
    data: {
      status,
      ...updates,
    },
  });
}
