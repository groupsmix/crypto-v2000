/**
 * Standalone worker script for the content generation queue.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' src/lib/queue/start-worker.ts
 *
 * This process should be run separately from the Next.js app.
 * In production, use a process manager like PM2 or deploy as a separate service.
 */

import "dotenv/config";
import { createContentWorker } from "./worker";
import { setupScheduledJob } from "./content-queue";

async function main() {
  console.log("[StartWorker] Initializing content generation worker...");

  // Set up the daily scheduled job
  await setupScheduledJob();

  // Start the worker
  const worker = createContentWorker();

  // Graceful shutdown
  const shutdown = async () => {
    console.log("[StartWorker] Shutting down worker...");
    await worker.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log("[StartWorker] Worker is running. Press Ctrl+C to stop.");
}

main().catch((err) => {
  console.error("[StartWorker] Fatal error:", err);
  process.exit(1);
});
