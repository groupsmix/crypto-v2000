/**
 * Indexing queue service.
 *
 * Lightweight queue backed by Prisma/PostgreSQL for tracking URLs
 * that need to be submitted for search engine indexing.
 *
 * Statuses: pending → submitted | failed
 */

import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cryptocompare.ai";

export type PageType = "blog" | "vs" | "prices";

export type QueueItemStatus = "pending" | "submitted" | "failed";

export interface QueueItem {
  id: string;
  url: string;
  canonicalUrl: string;
  pageType: PageType;
  status: QueueItemStatus;
  attempts: number;
  lastAttemptAt: Date | null;
  submittedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
}

// ─── Validation ─────────────────────────────────────────────────────────────

function isValidPageType(type: string): type is PageType {
  return ["blog", "vs", "prices"].includes(type);
}

function buildCanonicalUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Queue Operations ───────────────────────────────────────────────────────

/**
 * Add a URL to the indexing queue. Deduplicates by canonical URL —
 * if a pending entry already exists for the same canonical URL, it is skipped.
 * If a previously submitted/failed entry exists, it is reset to pending.
 */
export async function enqueueUrl(
  path: string,
  pageType: string
): Promise<{ queued: boolean; reason?: string }> {
  if (!isValidPageType(pageType)) {
    return { queued: false, reason: `Invalid page type: ${pageType}` };
  }

  const canonicalUrl = buildCanonicalUrl(path);

  if (!isValidUrl(canonicalUrl)) {
    return { queued: false, reason: `Invalid URL: ${canonicalUrl}` };
  }

  try {
    const existing = await prisma.indexingQueueItem.findUnique({
      where: { canonicalUrl },
    });

    if (existing) {
      if (existing.status === "pending") {
        return { queued: false, reason: "Already pending" };
      }

      // Re-queue previously submitted or failed items
      await prisma.indexingQueueItem.update({
        where: { canonicalUrl },
        data: {
          status: "pending",
          errorMessage: null,
        },
      });
      return { queued: true, reason: "Re-queued (was " + existing.status + ")" };
    }

    await prisma.indexingQueueItem.create({
      data: {
        url: path,
        canonicalUrl,
        pageType,
        status: "pending",
        attempts: 0,
      },
    });

    return { queued: true };
  } catch (err) {
    return {
      queued: false,
      reason: err instanceof Error ? err.message : "Database error",
    };
  }
}

/**
 * Fetch pending queue items, optionally limited.
 */
export async function getPendingItems(
  limit: number = 50
): Promise<QueueItem[]> {
  return prisma.indexingQueueItem.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: limit,
  }) as Promise<QueueItem[]>;
}

/**
 * Fetch recent queue items across all statuses for admin visibility.
 */
export async function getRecentItems(
  limit: number = 20
): Promise<QueueItem[]> {
  return prisma.indexingQueueItem.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  }) as Promise<QueueItem[]>;
}

/**
 * Get queue summary counts.
 */
export async function getQueueSummary(): Promise<{
  pending: number;
  submitted: number;
  failed: number;
  total: number;
}> {
  const [pending, submitted, failed, total] = await Promise.all([
    prisma.indexingQueueItem.count({ where: { status: "pending" } }),
    prisma.indexingQueueItem.count({ where: { status: "submitted" } }),
    prisma.indexingQueueItem.count({ where: { status: "failed" } }),
    prisma.indexingQueueItem.count(),
  ]);

  return { pending, submitted, failed, total };
}

/**
 * Mark an item as submitted.
 */
export async function markSubmitted(id: string): Promise<void> {
  await prisma.indexingQueueItem.update({
    where: { id },
    data: {
      status: "submitted",
      submittedAt: new Date(),
      lastAttemptAt: new Date(),
      attempts: { increment: 1 },
      errorMessage: null,
    },
  });
}

/**
 * Mark an item as failed with an error message.
 */
export async function markFailed(id: string, error: string): Promise<void> {
  await prisma.indexingQueueItem.update({
    where: { id },
    data: {
      status: "failed",
      lastAttemptAt: new Date(),
      attempts: { increment: 1 },
      errorMessage: error,
    },
  });
}

/**
 * Get failed items for retry or visibility.
 */
export async function getFailedItems(
  limit: number = 20
): Promise<QueueItem[]> {
  return prisma.indexingQueueItem.findMany({
    where: { status: "failed" },
    orderBy: { lastAttemptAt: "desc" },
    take: limit,
  }) as Promise<QueueItem[]>;
}
