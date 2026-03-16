import fs from "fs";
import path from "path";
import type { Post, PostStatus, RunLog } from "./types";

const DATA_DIR = path.resolve(__dirname, "../../data");
const POSTS_DIR = path.join(DATA_DIR, "posts");
const RUNS_DIR = path.join(DATA_DIR, "runs");

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export function savePost(post: Post): void {
  ensureDir(POSTS_DIR);
  const filePath = path.join(POSTS_DIR, `${post.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(post, null, 2), "utf-8");
}

/** @deprecated Use savePost instead */
export const saveDraft = savePost;

export function slugExists(slug: string): boolean {
  const filePath = path.join(POSTS_DIR, `${slug}.json`);
  return fs.existsSync(filePath);
}

export function loadPost(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Post;
}

/** @deprecated Use loadPost instead */
export const loadDraft = loadPost;

export function listPosts(): Post[] {
  ensureDir(POSTS_DIR);
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
    return JSON.parse(raw) as Post;
  });
}

/** @deprecated Use listPosts instead */
export const listDrafts = listPosts;

export function listPostsByStatus(status: PostStatus): Post[] {
  return listPosts().filter((p) => p.status === status);
}

export function listScheduledDue(): Post[] {
  const now = new Date();
  return listPostsByStatus("scheduled").filter((p) =>
    p.scheduledFor ? new Date(p.scheduledFor) <= now : false
  );
}

// ─── Runs ────────────────────────────────────────────────────────────────────

export function saveRunLog(run: RunLog): void {
  ensureDir(RUNS_DIR);
  const filePath = path.join(RUNS_DIR, `${run.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(run, null, 2), "utf-8");
}

export function loadRunLog(id: string): RunLog | null {
  const filePath = path.join(RUNS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as RunLog;
}

export function listRunLogs(): RunLog[] {
  ensureDir(RUNS_DIR);
  const files = fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith(".json"));
  return files
    .map((f) => {
      const raw = fs.readFileSync(path.join(RUNS_DIR, f), "utf-8");
      return JSON.parse(raw) as RunLog;
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}
