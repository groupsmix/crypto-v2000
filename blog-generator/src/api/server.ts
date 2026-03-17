import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { generateDraft } from "../lib/generator";
import {
  saveDraft,
  listPosts,
  listPostsByStatus,
  loadPost,
  saveRunLog,
} from "../lib/storage";
import { validateInput } from "../lib/validator";
import {
  schedulePost,
  unschedulePost,
  publishPostNow,
  runScheduledPublishing,
} from "../lib/scheduler";
import type { GenerateInput, RunLog } from "../lib/types";

const PORT = parseInt(process.env.PORT || "4100", 10);
const API_SECRET = process.env.API_SECRET || "";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `run_${timestamp}${random}`;
}

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}

function authenticate(req: IncomingMessage): boolean {
  if (!API_SECRET) return true;
  const auth = req.headers.authorization;
  return auth === `Bearer ${API_SECRET}`;
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

async function handleHealth(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  json(res, 200, {
    status: "ok",
    service: "cryptocompare-blog-generator",
    timestamp: new Date().toISOString(),
  });
}

async function handleGetPosts(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "GET") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const posts = listPosts();
    json(res, 200, { posts, count: posts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(res, 500, { error: message });
  }
}

async function handleGetPostBySlug(
  req: IncomingMessage,
  res: ServerResponse,
  slug: string
): Promise<void> {
  if (req.method !== "GET") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const post = loadPost(slug);
    if (!post) {
      json(res, 404, { error: `Post with slug "${slug}" not found` });
      return;
    }
    json(res, 200, { post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(res, 500, { error: message });
  }
}

async function handleTrigger(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!authenticate(req)) {
    json(res, 401, { error: "Unauthorized" });
    return;
  }

  const runId = generateId();
  const startedAt = new Date().toISOString();
  const generatedSlugs: string[] = [];
  const errors: string[] = [];

  try {
    const rawBody = await parseBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};

    // Support single topic or array of topics
    let inputs: GenerateInput[];
    if (Array.isArray(body.topics)) {
      inputs = body.topics.map((t: string | GenerateInput) =>
        typeof t === "string" ? { topic: t } : t
      );
    } else if (body.topic) {
      inputs = [
        {
          topic: body.topic,
          keyword: body.keyword,
          coinOrExchange: body.coinOrExchange,
          articleType: body.articleType,
        },
      ];
    } else {
      json(res, 400, {
        error: 'Request must include "topic" (string) or "topics" (array)',
      });
      return;
    }

    // Validate all inputs
    for (const input of inputs) {
      const validationErrors = validateInput(input);
      if (validationErrors.length > 0) {
        json(res, 400, { error: "Validation failed", details: validationErrors });
        return;
      }
    }

    // Generate drafts
    for (const input of inputs) {
      try {
        console.log(`[Trigger] Generating draft for: ${input.topic}`);
        const draft = await generateDraft(input);
        saveDraft(draft);
        generatedSlugs.push(draft.slug);
        console.log(`[Trigger] Draft saved: ${draft.slug}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to generate "${input.topic}": ${msg}`);
        console.error(`[Trigger] Error: ${msg}`);
      }
    }

    const status =
      errors.length === 0
        ? "completed"
        : generatedSlugs.length > 0
          ? "partial"
          : "failed";

    const runLog: RunLog = {
      id: runId,
      type: "generation",
      startedAt,
      finishedAt: new Date().toISOString(),
      input: inputs.length === 1 ? inputs[0] : inputs,
      generatedSlugs,
      status,
      errors,
    };

    saveRunLog(runLog);

    json(res, 200, {
      success: status !== "failed",
      runId,
      generatedSlugs,
      status,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Trigger] Fatal error:", message);

    const runLog: RunLog = {
      id: runId,
      type: "generation",
      startedAt,
      finishedAt: new Date().toISOString(),
      input: [],
      generatedSlugs,
      status: "failed",
      errors: [message],
    };
    saveRunLog(runLog);

    json(res, 500, { success: false, error: message });
  }
}

// ─── Scheduling & Publishing Handlers ────────────────────────────────────────

async function handleSchedule(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!authenticate(req)) {
    json(res, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const rawBody = await parseBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    if (!body.slug || !body.scheduledFor) {
      json(res, 400, { error: '"slug" and "scheduledFor" are required' });
      return;
    }
    const post = schedulePost(body.slug, body.scheduledFor);
    json(res, 200, { success: true, post: { slug: post.slug, status: post.status, scheduledFor: post.scheduledFor } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(res, 400, { error: message });
  }
}

async function handleUnschedule(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!authenticate(req)) {
    json(res, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const rawBody = await parseBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    if (!body.slug) {
      json(res, 400, { error: '"slug" is required' });
      return;
    }
    const post = unschedulePost(body.slug);
    json(res, 200, { success: true, post: { slug: post.slug, status: post.status } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(res, 400, { error: message });
  }
}

async function handlePublishNow(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!authenticate(req)) {
    json(res, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const rawBody = await parseBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    if (!body.slug) {
      json(res, 400, { error: '"slug" is required' });
      return;
    }
    const post = publishPostNow(body.slug);
    json(res, 200, { success: true, post: { slug: post.slug, status: post.status, publishedAt: post.publishedAt } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(res, 400, { error: message });
  }
}

async function handleRunScheduled(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!authenticate(req)) {
    json(res, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const runLog = runScheduledPublishing();
    json(res, 200, {
      success: runLog.status !== "failed",
      runId: runLog.id,
      affectedSlugs: runLog.affectedSlugs,
      status: runLog.status,
      errors: runLog.errors.length > 0 ? runLog.errors : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(res, 500, { error: message });
  }
}

async function handleGetScheduled(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const posts = listPostsByStatus("scheduled");
    json(res, 200, { posts, count: posts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(res, 500, { error: message });
  }
}

async function handleGetPublished(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const posts = listPostsByStatus("published");
    json(res, 200, { posts, count: posts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(res, 500, { error: message });
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://cryptoranked.xyz")
    .split(",")
    .map((o) => o.trim());
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    if (pathname === "/health") {
      await handleHealth(req, res);
    } else if (pathname === "/api/posts" && !pathname.includes("/api/posts/")) {
      await handleGetPosts(req, res);
    } else if (pathname.startsWith("/api/posts/")) {
      const slug = pathname.replace("/api/posts/", "");
      if (!slug) {
        json(res, 400, { error: "Slug parameter is required" });
      } else {
        await handleGetPostBySlug(req, res, slug);
      }
    } else if (pathname === "/api/trigger") {
      await handleTrigger(req, res);
    } else if (pathname === "/api/schedule") {
      await handleSchedule(req, res);
    } else if (pathname === "/api/unschedule") {
      await handleUnschedule(req, res);
    } else if (pathname === "/api/publish-now") {
      await handlePublishNow(req, res);
    } else if (pathname === "/api/run-scheduled") {
      await handleRunScheduled(req, res);
    } else if (pathname === "/api/scheduled") {
      await handleGetScheduled(req, res);
    } else if (pathname === "/api/published") {
      await handleGetPublished(req, res);
    } else {
      json(res, 404, { error: "Not found" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("[Server] Unhandled error:", message);
    json(res, 500, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`[BlogGenerator] Server running on http://localhost:${PORT}`);
  console.log(`[BlogGenerator] Endpoints:`);
  console.log(`  GET  /health            - Health check`);
  console.log(`  GET  /api/posts         - List all posts`);
  console.log(`  GET  /api/posts/:slug   - Get post by slug`);
  console.log(`  POST /api/trigger       - Generate draft(s)`);
  console.log(`  POST /api/schedule      - Schedule a post`);
  console.log(`  POST /api/unschedule    - Unschedule a post`);
  console.log(`  POST /api/publish-now   - Publish a post immediately`);
  console.log(`  POST /api/run-scheduled - Run scheduled publishing`);
  console.log(`  GET  /api/scheduled     - List scheduled posts`);
  console.log(`  GET  /api/published     - List published posts`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("[BlogGenerator] Shutting down...");
  server.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
