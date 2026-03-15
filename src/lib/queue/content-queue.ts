import { Queue } from "bullmq";
import { createRedisConnection } from "./connection";

export const CONTENT_QUEUE_NAME = "content-generation";

export type ContentJobData = {
  topicLimit?: number;
  publishAsDraft?: boolean;
  triggeredBy?: string; // "scheduler" | "manual"
};

let contentQueueInstance: Queue<ContentJobData> | null = null;

/**
 * Get or create the content generation queue.
 * Uses a singleton pattern to avoid creating multiple connections.
 */
export function getContentQueue(): Queue<ContentJobData> {
  if (!contentQueueInstance) {
    const connection = createRedisConnection();
    contentQueueInstance = new Queue<ContentJobData>(CONTENT_QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 60000, // 1 min initial delay, exponential backoff
        },
        removeOnComplete: {
          count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
          count: 50, // Keep last 50 failed jobs
        },
      },
    });
  }
  return contentQueueInstance;
}

/**
 * Add the daily scheduled content generation job.
 * Runs once per day at 6:00 AM UTC.
 */
export async function setupScheduledJob(): Promise<void> {
  const queue = getContentQueue();

  // Remove existing repeatable jobs to avoid duplicates
  const existingJobs = await queue.getRepeatableJobs();
  for (const job of existingJobs) {
    await queue.removeRepeatableByKey(job.key);
  }

  // Add daily scheduled job
  await queue.add(
    "daily-content-generation",
    {
      topicLimit: 3,
      publishAsDraft: true,
      triggeredBy: "scheduler",
    },
    {
      repeat: {
        pattern: "0 6 * * *", // Every day at 6:00 AM UTC
      },
    }
  );

  console.log("[ContentQueue] Daily content generation scheduled for 6:00 AM UTC");
}

/**
 * Trigger a manual content generation job.
 */
export async function triggerManualJob(
  options?: Partial<ContentJobData>
): Promise<string> {
  const queue = getContentQueue();

  const job = await queue.add("manual-content-generation", {
    topicLimit: options?.topicLimit ?? 3,
    publishAsDraft: options?.publishAsDraft ?? true,
    triggeredBy: "manual",
  });

  return job.id ?? "unknown";
}
