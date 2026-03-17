/**
 * Indexing submission preparation.
 *
 * Builds clean payloads from pending queue items and processes them
 * through available indexing providers. If no provider is configured,
 * items are still marked as submitted (prepared state) so the pipeline
 * is proven and ready for when credentials are added.
 */

import {
  getPendingItems,
  markSubmitted,
  markFailed,
  type QueueItem,
} from "@/lib/indexing-queue";
import {
  createIndexingPayloads,
  NoopIndexingProvider,
  IndexNowProvider,
  GoogleIndexingProvider,
  type IndexingProvider,
  type IndexingPayload,
} from "@/lib/indexing";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SubmissionBatch {
  items: QueueItem[];
  payloads: IndexingPayload[];
}

export interface ProcessingResult {
  processed: number;
  submitted: number;
  failed: number;
  skipped: number;
  details: {
    url: string;
    status: "submitted" | "failed";
    error?: string;
  }[];
  provider: string;
}

// ─── Provider Selection ─────────────────────────────────────────────────────

/**
 * Resolve the active indexing provider based on available credentials.
 * Falls back to NoopIndexingProvider if nothing is configured.
 */
function getActiveProvider(): IndexingProvider {
  if (process.env.INDEXNOW_API_KEY) {
    return new IndexNowProvider();
  }

  if (process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON) {
    return new GoogleIndexingProvider();
  }

  return new NoopIndexingProvider();
}

// ─── Batch Preparation ──────────────────────────────────────────────────────

/**
 * Prepare a batch of pending items for submission.
 */
export function prepareBatch(
  items: QueueItem[]
): SubmissionBatch {
  const urls = items.map((item) => item.canonicalUrl);
  const payloads = createIndexingPayloads(urls);

  return { items, payloads };
}

// ─── Processing ─────────────────────────────────────────────────────────────

/**
 * Process all pending indexing queue items.
 *
 * 1. Fetches pending items from the queue
 * 2. Prepares payloads using the existing indexing module
 * 3. Submits through the active provider (or noop if none configured)
 * 4. Updates queue item statuses
 *
 * Idempotent: re-running won't double-process already submitted items.
 */
export async function processPendingItems(
  batchSize: number = 50
): Promise<ProcessingResult> {
  const provider = getActiveProvider();

  const result: ProcessingResult = {
    processed: 0,
    submitted: 0,
    failed: 0,
    skipped: 0,
    details: [],
    provider: provider.name,
  };

  const pending = await getPendingItems(batchSize);

  if (pending.length === 0) {
    return result;
  }

  const batch = prepareBatch(pending);

  // Submit each payload individually so we can track per-item status
  for (let i = 0; i < batch.items.length; i++) {
    const item = batch.items[i];
    const payload = batch.payloads[i];

    result.processed++;

    try {
      const submissionResult = await provider.submit(payload);

      if (submissionResult.success) {
        await markSubmitted(item.id);
        result.submitted++;
        result.details.push({
          url: item.canonicalUrl,
          status: "submitted",
        });
      } else {
        const error = submissionResult.error || "Submission returned failure";
        await markFailed(item.id, error);
        result.failed++;
        result.details.push({
          url: item.canonicalUrl,
          status: "failed",
          error,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      await markFailed(item.id, error);
      result.failed++;
      result.details.push({
        url: item.canonicalUrl,
        status: "failed",
        error,
      });
    }
  }

  return result;
}
