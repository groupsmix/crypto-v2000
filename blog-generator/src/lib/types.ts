export type PostStatus = "draft" | "scheduled" | "published";

export type Post = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  body: string;
  tags: string[];
  category: string;
  canonicalPath: string;
  internalLinks: string[];
  featuredImagePrompt: string;
  createdAt: string;
  status: PostStatus;
  scheduledFor: string | null;
  publishedAt: string | null;
};

/** @deprecated Use Post instead */
export type Draft = Post;

export type GenerateInput = {
  topic: string;
  keyword?: string;
  coinOrExchange?: string;
  articleType?: string;
};

export type RunLogType = "generation" | "scheduling" | "publishing" | "unscheduling";

export type RunLog = {
  id: string;
  type: RunLogType;
  startedAt: string;
  finishedAt: string;
  input?: GenerateInput | GenerateInput[];
  generatedSlugs?: string[];
  affectedSlugs?: string[];
  status: "completed" | "failed" | "partial";
  errors: string[];
};
