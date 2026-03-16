export type Draft = {
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
  status: "draft";
};

export type GenerateInput = {
  topic: string;
  keyword?: string;
  coinOrExchange?: string;
  articleType?: string;
};

export type RunLog = {
  id: string;
  startedAt: string;
  finishedAt: string;
  input: GenerateInput | GenerateInput[];
  generatedSlugs: string[];
  status: "completed" | "failed" | "partial";
  errors: string[];
};
