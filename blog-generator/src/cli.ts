import "dotenv/config";
import { generateDraft } from "./lib/generator";
import { saveDraft, listDrafts, loadDraft, saveRunLog } from "./lib/storage";
import { validateInput } from "./lib/validator";
import type { GenerateInput, RunLog } from "./lib/types";

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

  list
      List all saved drafts (slug, title, date, status).

  show --slug="<slug>"
      Display a draft by its slug.

  help
      Show this help message.

Options:
  --topic     Topic for the article (required for generate)
  --keyword   Optional primary SEO keyword
  --coin      Optional coin or exchange name to focus on
  --type      Optional article type: guide, comparison, analysis, news, education, review
  --slug      Draft slug (required for show)
  --topics    Topic string (repeatable for generate-many)
`);
}

function parseArgs(args: string[]): Map<string, string[]> {
  const parsed = new Map<string, string[]>();
  for (const arg of args) {
    const eqIndex = arg.indexOf("=");
    if (arg.startsWith("--") && eqIndex > -1) {
      const key = arg.substring(2, eqIndex);
      const value = arg.substring(eqIndex + 1).replace(/^["']|["']$/g, "");
      const existing = parsed.get(key) || [];
      existing.push(value);
      parsed.set(key, existing);
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

function cmdList(): void {
  const drafts = listDrafts();
  if (drafts.length === 0) {
    console.log("No drafts found in data/posts/.");
    return;
  }

  console.log(`Found ${drafts.length} draft(s):\n`);
  console.log(
    "SLUG".padEnd(45) +
      "TITLE".padEnd(50) +
      "CATEGORY".padEnd(15) +
      "CREATED"
  );
  console.log("-".repeat(130));

  for (const draft of drafts) {
    const slug = draft.slug.substring(0, 43).padEnd(45);
    const title = draft.title.substring(0, 48).padEnd(50);
    const category = draft.category.padEnd(15);
    const created = draft.createdAt.substring(0, 19);
    console.log(`${slug}${title}${category}${created}`);
  }
}

function cmdShow(args: Map<string, string[]>): void {
  const slug = args.get("slug")?.[0];
  if (!slug) {
    console.error('Error: --slug="<slug>" is required.');
    process.exitCode = 1;
    return;
  }

  const draft = loadDraft(slug);
  if (!draft) {
    console.error(`Draft not found: ${slug}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Title: ${draft.title}`);
  console.log(`Slug: ${draft.slug}`);
  console.log(`Status: ${draft.status}`);
  console.log(`Category: ${draft.category}`);
  console.log(`Tags: ${draft.tags.join(", ")}`);
  console.log(`Meta Title: ${draft.metaTitle}`);
  console.log(`Meta Description: ${draft.metaDescription}`);
  console.log(`Excerpt: ${draft.excerpt}`);
  console.log(`Canonical: ${draft.canonicalPath}`);
  console.log(`Internal Links: ${draft.internalLinks.join(", ") || "none"}`);
  console.log(`Image Prompt: ${draft.featuredImagePrompt}`);
  console.log(`Created: ${draft.createdAt}`);
  console.log(`Word Count: ${draft.body.split(/\s+/).length}`);
  console.log(`\n--- Body ---\n`);
  console.log(draft.body);
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
      cmdList();
      break;
    case "show":
      cmdShow(args);
      break;
    case "help":
    default:
      printUsage();
      break;
  }
}

main();
