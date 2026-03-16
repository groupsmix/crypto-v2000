import type { Draft, GenerateInput } from "./types";
import { slugExists } from "./storage";

export function validateInput(input: GenerateInput): string[] {
  const errors: string[] = [];
  if (!input.topic || input.topic.trim().length === 0) {
    errors.push("Topic is required and cannot be empty.");
  }
  if (input.articleType) {
    const validTypes = ["guide", "comparison", "analysis", "news", "education", "review"];
    if (!validTypes.includes(input.articleType)) {
      errors.push(`Invalid articleType "${input.articleType}". Valid types: ${validTypes.join(", ")}`);
    }
  }
  return errors;
}

export function validateDraft(draft: Draft): string[] {
  const errors: string[] = [];
  const required: Array<keyof Draft> = [
    "title",
    "slug",
    "metaTitle",
    "metaDescription",
    "excerpt",
    "body",
    "category",
    "canonicalPath",
    "createdAt",
  ];

  for (const field of required) {
    const value = draft[field];
    if (typeof value === "string" && value.trim().length === 0) {
      errors.push(`Required field "${field}" is empty.`);
    }
  }

  if (!draft.tags || draft.tags.length === 0) {
    errors.push("Tags array must have at least one tag.");
  }

  return errors;
}

export function ensureUniqueSlug(baseSlug: string): string {
  let slug = baseSlug;
  let counter = 1;
  while (slugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}
