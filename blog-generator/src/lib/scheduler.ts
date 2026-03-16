import { loadPost, savePost, listScheduledDue, saveRunLog } from "./storage";
import type { Post, RunLog } from "./types";

function generateRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `run_${timestamp}${random}`;
}

/**
 * Schedule a post for future publishing.
 */
export function schedulePost(slug: string, scheduledFor: string): Post {
  const post = loadPost(slug);
  if (!post) {
    throw new Error(`Post not found: "${slug}"`);
  }
  if (post.status === "published") {
    throw new Error(`Cannot schedule already published post: "${slug}"`);
  }

  const scheduledDate = new Date(scheduledFor);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error(`Invalid ISO datetime: "${scheduledFor}"`);
  }
  if (scheduledDate <= new Date()) {
    throw new Error(`scheduledFor must be a future datetime. Got: "${scheduledFor}"`);
  }

  post.status = "scheduled";
  post.scheduledFor = scheduledDate.toISOString();
  savePost(post);
  return post;
}

/**
 * Unschedule a post, reverting it back to draft.
 */
export function unschedulePost(slug: string): Post {
  const post = loadPost(slug);
  if (!post) {
    throw new Error(`Post not found: "${slug}"`);
  }
  if (post.status !== "scheduled") {
    throw new Error(`Post "${slug}" is not scheduled (current status: ${post.status})`);
  }

  post.status = "draft";
  post.scheduledFor = null;
  savePost(post);
  return post;
}

/**
 * Publish a post immediately. Works for draft or scheduled posts only.
 */
export function publishPostNow(slug: string): Post {
  const post = loadPost(slug);
  if (!post) {
    throw new Error(`Post not found: "${slug}"`);
  }
  if (post.status === "published") {
    throw new Error(`Post "${slug}" is already published`);
  }

  post.status = "published";
  post.publishedAt = new Date().toISOString();
  post.scheduledFor = null;
  savePost(post);
  return post;
}

/**
 * Run the scheduled publishing pipeline.
 * Finds all posts with status=scheduled and scheduledFor <= now,
 * then publishes them.
 */
export function runScheduledPublishing(): RunLog {
  const runId = generateRunId();
  const startedAt = new Date().toISOString();
  const affectedSlugs: string[] = [];
  const errors: string[] = [];

  const duePosts = listScheduledDue();

  for (const post of duePosts) {
    try {
      post.status = "published";
      post.publishedAt = new Date().toISOString();
      savePost(post);
      affectedSlugs.push(post.slug);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to publish "${post.slug}": ${msg}`);
    }
  }

  const status =
    errors.length === 0
      ? "completed"
      : affectedSlugs.length > 0
        ? "partial"
        : duePosts.length === 0
          ? "completed"
          : "failed";

  const runLog: RunLog = {
    id: runId,
    type: "publishing",
    startedAt,
    finishedAt: new Date().toISOString(),
    affectedSlugs,
    status,
    errors,
  };

  saveRunLog(runLog);
  return runLog;
}
