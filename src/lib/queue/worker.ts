import { Worker, Job } from "bullmq";
import { createRedisConnection } from "./connection";
import { CONTENT_QUEUE_NAME, type ContentJobData } from "./content-queue";
import { runContentPipeline } from "../content-engine/pipeline";

/**
 * Create and start the content generation worker.
 * This processes jobs from the content-generation queue.
 */
export function createContentWorker(): Worker<ContentJobData> {
  const connection = createRedisConnection();

  const worker = new Worker<ContentJobData>(
    CONTENT_QUEUE_NAME,
    async (job: Job<ContentJobData>) => {
      console.log(
        `[Worker] Processing job ${job.id}: ${job.name} (attempt ${job.attemptsMade + 1})`
      );

      const result = await runContentPipeline({
        topicLimit: job.data.topicLimit ?? 3,
        publishAsDraft: job.data.publishAsDraft ?? true,
      });

      console.log(
        `[Worker] Job ${job.id} ${result.status}: ${result.articlesCreated} articles, ${result.imagesGenerated} images, ${result.errorCount} errors`
      );

      if (result.status === "failed" && result.articlesCreated === 0) {
        throw new Error(`Pipeline failed with ${result.errorCount} errors`);
      }

      return result;
    },
    {
      connection,
      concurrency: 1, // Process one job at a time
      limiter: {
        max: 1,
        duration: 60000, // Max 1 job per minute
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`
    );
  });

  worker.on("error", (err) => {
    console.error(`[Worker] Worker error: ${err.message}`);
  });

  console.log("[Worker] Content generation worker started");

  return worker;
}
