import type { Draft, GenerateInput } from "./types";
import { insertInternalLinks, buildImagePrompt } from "./linker";
import { toSlug, ensureUniqueSlug, validateDraft } from "./validator";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicResponse = {
  content: Array<{ type: string; text?: string }>;
};

function getSystemPrompt(input: GenerateInput): string {
  const articleType = input.articleType || "guide";
  const coinContext = input.coinOrExchange
    ? `\nFocus on: ${input.coinOrExchange}`
    : "";
  const keywordContext = input.keyword
    ? `\nPrimary SEO keyword: ${input.keyword}`
    : "";

  return `You are an expert cryptocurrency and blockchain content writer for CryptoCompare AI, a leading crypto exchange comparison platform.

Your task is to write a ${articleType} article. Follow these rules strictly:
- Write between 1200 and 1800 words
- Use SEO-oriented structure with clear headings (## for H2, ### for H3)
- Include bullet points and numbered lists where appropriate
- Write a clear introduction and conclusion
- Reference specific exchanges (Binance, Coinbase, Kraken, Bybit, KuCoin) naturally where relevant
- Include practical advice and actionable takeaways
- Do NOT include the title as an H1 heading (it will be rendered separately)
- Format everything in clean Markdown${coinContext}${keywordContext}

Important: Naturally mention relevant coin price pages, exchange comparison pages, and related blog topics in the text so internal links can be inserted later. For example, mention "Bitcoin" or "Ethereum" by name, and reference exchange comparisons like "Binance vs Coinbase" where relevant.`;
}

function getUserPrompt(input: GenerateInput): string {
  return `Write a comprehensive blog article about: ${input.topic}

After the article content, provide the following metadata in a JSON block wrapped in \`\`\`json tags:
{
  "metaTitle": "SEO-optimized title (50-60 chars)",
  "metaDescription": "Compelling meta description (150-160 chars)",
  "excerpt": "A 1-2 sentence summary for previews (under 200 chars)",
  "category": "one of: guide, comparison, analysis, news, education, review",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggestedSlug": "url-friendly-slug",
  "suggestedTitle": "Full article title"
}`;
}

function parseResponse(
  raw: string,
  input: GenerateInput
): Omit<Draft, "createdAt" | "status"> {
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);

  let metadata = {
    metaTitle: "",
    metaDescription: "",
    excerpt: "",
    category: input.articleType || "guide",
    tags: [] as string[],
    suggestedSlug: "",
    suggestedTitle: "",
  };

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      metadata = {
        metaTitle: typeof parsed.metaTitle === "string" ? parsed.metaTitle : "",
        metaDescription:
          typeof parsed.metaDescription === "string"
            ? parsed.metaDescription
            : "",
        excerpt: typeof parsed.excerpt === "string" ? parsed.excerpt : "",
        category: typeof parsed.category === "string" ? parsed.category : input.articleType || "guide",
        tags: Array.isArray(parsed.tags)
          ? parsed.tags.filter((t: unknown) => typeof t === "string")
          : [],
        suggestedSlug:
          typeof parsed.suggestedSlug === "string" ? parsed.suggestedSlug : "",
        suggestedTitle:
          typeof parsed.suggestedTitle === "string" ? parsed.suggestedTitle : "",
      };
    } catch {
      // Use defaults if JSON parsing fails
    }
  }

  // Extract body content (everything before the JSON block)
  let body = raw;
  if (jsonMatch && jsonMatch.index !== undefined) {
    body = raw.substring(0, jsonMatch.index).trim();
  }

  // Insert internal links
  const { linkedContent, links } = insertInternalLinks(body);
  body = linkedContent;

  const title = metadata.suggestedTitle || input.topic;
  const baseSlug = metadata.suggestedSlug || toSlug(title);
  const slug = ensureUniqueSlug(baseSlug);

  const metaTitle = metadata.metaTitle || title.substring(0, 60);
  const metaDescription =
    metadata.metaDescription ||
    `Read about ${title} on CryptoCompare AI.`.substring(0, 160);
  const excerpt =
    metadata.excerpt ||
    metaDescription.substring(0, 200);

  const canonicalPath = `/blog/${slug}`;
  const internalLinks = links.map((l) => l.url);
  const featuredImagePrompt = buildImagePrompt(title, metadata.category);

  return {
    title,
    slug,
    metaTitle,
    metaDescription,
    excerpt,
    body,
    tags: metadata.tags.length > 0 ? metadata.tags : [input.topic.toLowerCase()],
    category: metadata.category,
    canonicalPath,
    internalLinks,
    featuredImagePrompt,
  };
}

/**
 * Generate a single blog draft from a topic input.
 * Uses the Anthropic Messages API via direct HTTP fetch.
 */
export async function generateDraft(input: GenerateInput): Promise<Draft> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Please configure it in your .env file."
    );
  }

  const systemPrompt = getSystemPrompt(input);
  const userPrompt = getUserPrompt(input);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as AnthropicResponse;
  const textBlock = data.content.find((block) => block.type === "text");

  if (!textBlock || !textBlock.text) {
    throw new Error("Anthropic API returned no text content.");
  }

  const parsed = parseResponse(textBlock.text, input);

  const draft: Draft = {
    ...parsed,
    createdAt: new Date().toISOString(),
    status: "draft",
  };

  // Validate the draft
  const errors = validateDraft(draft);
  if (errors.length > 0) {
    console.warn(`[Generator] Draft validation warnings: ${errors.join("; ")}`);
  }

  return draft;
}
