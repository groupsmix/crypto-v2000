import "dotenv/config";
import { generateDraft } from "./lib/generator";
import {
  saveDraft,
  listPosts,
  listPostsByStatus,
  loadPost,
  saveRunLog,
} from "./lib/storage";
import { validateInput } from "./lib/validator";
import {
  schedulePost,
  unschedulePost,
  publishPostNow,
  runScheduledPublishing,
} from "./lib/scheduler";
import type { GenerateInput, RunLog, PostStatus } from "./lib/types";

function generateRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `run_${timestamp}${random}`;
}

function printUsage(): void {
  console.log(`
Blog Generator CLI

Usage:
  ts-node src/cli.ts <command> [options]
  node dist/cli.js <command> [options]

Commands:
  generate --topic="<topic>" [--keyword="<kw>"] [--coin="<name>"] [--type="<type>"]
      Generate a single blog draft.

  generate-many --topics="<topic1>" --topics="<topic2>" ...
      Generate multiple blog drafts from a list of topics.

  list [--status="<status>"]
      List all posts, optionally filtered by status (draft, scheduled, published).

  show --slug="<slug>"
      Display a post by its slug.

  schedule --slug="<slug>" --datetime="<ISO datetime>"
      Schedule a draft for future publishing.

  unschedule --slug="<slug>"
      Unschedule a post, reverting it to draft.

  publish-now --slug="<slug>"
      Publish a post immediately.

  run-scheduled [--dry-run]
      Run the scheduled publishing pipeline (publish all due posts).
      With --dry-run, reports what would be published without making changes.

  help
      Show this help message.

Options:
  --topic     Topic for the article (required for generate)
  --keyword   Optional primary SEO keyword
  --coin      Optional coin or exchange name to focus on
  --type      Optional article type: guide, comparison, analysis, news, education, review
  --slug      Post slug (required for show, schedule, unschedule, publish-now)
  --topics    Topic string (repeatable for generate-many)
  --status    Filter by status: draft, scheduled, published (for list)
  --datetime  ISO datetime for scheduling (required for schedule)
  --dry-run   Dry-run mode for run-scheduled (no file changes)
`);
}

function parseArgs(args: string[]): Map<string, string[]> {
  const parsed = new Map<string, string[]>();
  for (const arg of args) {
    if (!arg.startsWith("--")) continue;
    const eqIndex = arg.indexOf("=");
    if (eqIndex > -1) {
      const key = arg.substring(2, eqIndex);
      const value = arg.substring(eqIndex + 1).replace(/^["']|["']$/g, "");
      const existing = parsed.get(key) || [];
      existing.push(value);
      parsed.set(key, existing);
    } else {
      // Boolean flag (e.g. --dry-run)
      const key = arg.substring(2);
      if (!parsed.has(key)) {
        parsed.set(key, ["true"]);
      }
    }
  }
  return parsed;
}

async function cmdGenerate(args: Map<string, string[]>): Promise<void> {
  const topic = args.get("topic")?.[0];
  if (!topic) {
    console.error('Error: --topic="<topic>" is required.');
    process.exitCode = 1;
    return;
  }

  const input: GenerateInput = {
    topic,
    keyword: args.get("keyword")?.[0],
    coinOrExchange: args.get("coin")?.[0],
    articleType: args.get("type")?.[0],
  };

  const validationErrors = validateInput(input);
  if (validationErrors.length > 0) {
    console.error("Validation errors:");
    validationErrors.forEach((e) => console.error(`  - ${e}`));
    process.exitCode = 1;
    return;
  }

  const runId = generateRunId();
  const startedAt = new Date().toISOString();

  console.log(`[CLI] Generating draft for: "${topic}"...`);

  try {
    const draft = await generateDraft(input);
    saveDraft(draft);

    const runLog: RunLog = {
      id: runId,
      type: "generation",
      startedAt,
      finishedAt: new Date().toISOString(),
      input,
      generatedSlugs: [draft.slug],
      status: "completed",
      errors: [],
    };
    saveRunLog(runLog);

    console.log(`[CLI] Draft generated successfully!`);
    console.log(`  Title: ${draft.title}`);
    console.log(`  Slug: ${draft.slug}`);
    console.log(`  Category: ${draft.category}`);
    console.log(`  Tags: ${draft.tags.join(", ")}`);
    console.log(`  Word count: ${draft.body.split(/\s+/).length}`);
    console.log(`  Saved to: data/posts/${draft.slug}.json`);
    console.log(`  Run log: data/runs/${runId}.json`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[CLI] Generation failed: ${message}`);

    const runLog: RunLog = {
      id: runId,
      type: "generation",
      startedAt,
      finishedAt: new Date().toISOString(),
      input,
      generatedSlugs: [],
      status: "failed",
      errors: [message],
    };
    saveRunLog(runLog);

    process.exitCode = 1;
  }
}

async function cmdGenerateMany(args: Map<string, string[]>): Promise<void> {
  const topics = args.get("topics");
  if (!topics || topics.length === 0) {
    console.error('Error: at least one --topics="<topic>" is required.');
    process.exitCode = 1;
    return;
  }

  const runId = generateRunId();
  const startedAt = new Date().toISOString();
  const generatedSlugs: string[] = [];
  const errors: string[] = [];

  console.log(`[CLI] Generating ${topics.length} draft(s)...`);

  for (const topic of topics) {
    const input: GenerateInput = { topic };
    const validationErrors = validateInput(input);
    if (validationErrors.length > 0) {
      const msg = `Skipping "${topic}": ${validationErrors.join("; ")}`;
      console.error(`  ${msg}`);
      errors.push(msg);
      continue;
    }

    try {
      console.log(`  Generating: "${topic}"...`);
      const draft = await generateDraft(input);
      saveDraft(draft);
      generatedSlugs.push(draft.slug);
      console.log(`  Done: ${draft.slug} (${draft.body.split(/\s+/).length} words)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Failed "${topic}": ${message}`);
      console.error(`  Error: ${topic}: ${message}`);
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
    input: topics.map((t) => ({ topic: t })),
    generatedSlugs,
    status,
    errors,
  };
  saveRunLog(runLog);

  console.log(`\n[CLI] Done. ${generatedSlugs.length}/${topics.length} drafts generated.`);
  console.log(`  Run log: data/runs/${runId}.json`);

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

function cmdList(args: Map<string, string[]>): void {
  const statusFilter = args.get("status")?.[0] as PostStatus | undefined;

  const posts = statusFilter
    ? listPostsByStatus(statusFilter)
    : listPosts();

  if (posts.length === 0) {
    const label = statusFilter ? `${statusFilter} posts` : "posts";
    console.log(`No ${label} found in data/posts/.`);
    return;
  }

  const label = statusFilter ? `${statusFilter} post(s)` : "post(s)";
  console.log(`Found ${posts.length} ${label}:\n`);
  console.log(
    "SLUG".padEnd(40) +
      "TITLE".padEnd(40) +
      "STATUS".padEnd(12) +
      "SCHEDULED FOR".padEnd(22) +
      "PUBLISHED AT"
  );
  console.log("-".repeat(130));

  for (const post of posts) {
    const slug = post.slug.substring(0, 38).padEnd(40);
    const title = post.title.substring(0, 38).padEnd(40);
    const status = post.status.padEnd(12);
    const scheduled = (post.scheduledFor ? post.scheduledFor.substring(0, 19) : "-").padEnd(22);
    const published = post.publishedAt ? post.publishedAt.substring(0, 19) : "-";
    console.log(`${slug}${title}${status}${scheduled}${published}`);
  }
}

function cmdShow(args: Map<string, string[]>): void {
  const slug = args.get("slug")?.[0];
  if (!slug) {
    console.error('Error: --slug="<slug>" is required.');
    process.exitCode = 1;
    return;
  }

  const post = loadPost(slug);
  if (!post) {
    console.error(`Post not found: ${slug}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Title: ${post.title}`);
  console.log(`Slug: ${post.slug}`);
  console.log(`Status: ${post.status}`);
  console.log(`Category: ${post.category}`);
  console.log(`Tags: ${post.tags.join(", ")}`);
  console.log(`Meta Title: ${post.metaTitle}`);
  console.log(`Meta Description: ${post.metaDescription}`);
  console.log(`Excerpt: ${post.excerpt}`);
  console.log(`Canonical: ${post.canonicalPath}`);
  console.log(`Internal Links: ${post.internalLinks.join(", ") || "none"}`);
  console.log(`Image Prompt: ${post.featuredImagePrompt}`);
  console.log(`Scheduled For: ${post.scheduledFor || "not scheduled"}`);
  console.log(`Published At: ${post.publishedAt || "not published"}`);
  console.log(`Created: ${post.createdAt}`);
  console.log(`Word Count: ${post.body.split(/\s+/).length}`);
  console.log(`\n--- Body ---\n`);
  console.log(post.body);
}

function cmdSchedule(args: Map<string, string[]>): void {
  const slug = args.get("slug")?.[0];
  const datetime = args.get("datetime")?.[0];
  if (!slug || !datetime) {
    console.error('Error: --slug="<slug>" and --datetime="<ISO datetime>" are required.');
    process.exitCode = 1;
    return;
  }

  try {
    const post = schedulePost(slug, datetime);
    console.log(`[CLI] Post scheduled successfully!`);
    console.log(`  Slug: ${post.slug}`);
    console.log(`  Status: ${post.status}`);
    console.log(`  Scheduled For: ${post.scheduledFor}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[CLI] Scheduling failed: ${message}`);
    process.exitCode = 1;
  }
}

function cmdUnschedule(args: Map<string, string[]>): void {
  const slug = args.get("slug")?.[0];
  if (!slug) {
    console.error('Error: --slug="<slug>" is required.');
    process.exitCode = 1;
    return;
  }

  try {
    const post = unschedulePost(slug);
    console.log(`[CLI] Post unscheduled successfully!`);
    console.log(`  Slug: ${post.slug}`);
    console.log(`  Status: ${post.status}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[CLI] Unscheduling failed: ${message}`);
    process.exitCode = 1;
  }
}

function cmdPublishNow(args: Map<string, string[]>): void {
  const slug = args.get("slug")?.[0];
  if (!slug) {
    console.error('Error: --slug="<slug>" is required.');
    process.exitCode = 1;
    return;
  }

  try {
    const post = publishPostNow(slug);
    console.log(`[CLI] Post published successfully!`);
    console.log(`  Slug: ${post.slug}`);
    console.log(`  Status: ${post.status}`);
    console.log(`  Published At: ${post.publishedAt}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[CLI] Publishing failed: ${message}`);
    process.exitCode = 1;
  }
}

function cmdRunScheduled(args: Map<string, string[]>): void {
  const dryRun = args.has("dry-run");
  if (dryRun) {
    console.log(`[CLI] Running scheduled publishing (DRY RUN)...`);
  } else {
    console.log(`[CLI] Running scheduled publishing...`);
  }

  const runLog = runScheduledPublishing(dryRun);

  if (runLog.affectedSlugs && runLog.affectedSlugs.length > 0) {
    const verb = dryRun ? "Would publish" : "Published";
    console.log(`[CLI] ${verb} ${runLog.affectedSlugs.length} post(s):`);
    for (const slug of runLog.affectedSlugs) {
      console.log(`  - ${slug}`);
    }
  } else {
    console.log(`[CLI] No posts due for publishing.`);
  }

  if (runLog.errors.length > 0) {
    console.error(`[CLI] Errors:`);
    for (const err of runLog.errors) {
      console.error(`  - ${err}`);
    }
  }

  if (!dryRun) {
    console.log(`  Run log: data/runs/${runLog.id}.json`);
  }
  console.log(`  Status: ${runLog.status}`);
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const command = rawArgs.find((a) => !a.startsWith("--")) || "help";
  const args = parseArgs(rawArgs);

  switch (command) {
    case "generate":
      await cmdGenerate(args);
      break;
    case "generate-many":
      await cmdGenerateMany(args);
      break;
    case "list":
      cmdList(args);
      break;
    case "show":
      cmdShow(args);
      break;
    case "schedule":
      cmdSchedule(args);
      break;
    case "unschedule":
      cmdUnschedule(args);
      break;
    case "publish-now":
      cmdPublishNow(args);
      break;
    case "run-scheduled":
      cmdRunScheduled(args);
      break;
    case "help":
    default:
      printUsage();
      break;
  }
}

main();
