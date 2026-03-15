import Anthropic from "@anthropic-ai/sdk";
import { logToRun } from "./logger";
import type { TrendingTopic } from "./news-fetcher";

export type GeneratedArticle = {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
};

/**
 * Generate a full blog article using Claude API based on a trending topic.
 * Produces 1500-2000 word articles with SEO metadata.
 */
export async function generateArticle(
  runId: string,
  topic: TrendingTopic
): Promise<GeneratedArticle | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    await logToRun(runId, "error", "ANTHROPIC_API_KEY not configured");
    return null;
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are an expert cryptocurrency and blockchain content writer for CryptoCompare AI, a leading crypto exchange comparison platform. Your articles are:
- Informative, accurate, and well-researched
- Written in a professional but accessible tone
- SEO-optimized with proper heading structure (H2, H3)
- Between 1500-2000 words
- Formatted in Markdown

Important guidelines:
- Use ## for main sections and ### for subsections
- Include bullet points and numbered lists where appropriate
- Add a clear introduction and conclusion
- Reference specific exchanges (Binance, Coinbase, Kraken, Bybit, KuCoin) naturally where relevant
- Include practical advice and actionable takeaways
- Do NOT include the title as an H1 heading (it will be rendered separately)`;

  const userPrompt = `Write a comprehensive blog article based on this trending crypto topic:

Title/Topic: ${topic.title}
Context: ${topic.description}
Source: ${topic.source}

After the article content, provide the following metadata in a JSON block wrapped in \`\`\`json tags:
{
  "metaTitle": "SEO-optimized title (50-60 chars)",
  "metaDescription": "Compelling meta description (150-160 chars)",
  "category": "one of: guides, education, comparison, news, analysis",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "suggestedSlug": "url-friendly-slug"
}`;

  try {
    await logToRun(runId, "info", `Generating article for topic: ${topic.title}`);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      await logToRun(runId, "error", "Claude returned no text content");
      return null;
    }

    const fullResponse = textBlock.text;
    const parsed = parseArticleResponse(fullResponse, topic);

    await logToRun(runId, "info", `Article generated: ${parsed.title}`, {
      wordCount: parsed.content.split(/\s+/).length,
      slug: parsed.slug,
      category: parsed.category,
    });

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logToRun(runId, "error", `Claude API error: ${message}`, {
      topic: topic.title,
    });
    return null;
  }
}

function parseArticleResponse(
  response: string,
  topic: TrendingTopic
): GeneratedArticle {
  // Extract JSON metadata block
  const jsonMatch = response.match(/```json\s*([\s\S]*?)```/);
  let metadata = {
    metaTitle: "",
    metaDescription: "",
    category: "news",
    tags: [] as string[],
    suggestedSlug: "",
  };

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      metadata = {
        metaTitle: parsed.metaTitle ?? "",
        metaDescription: parsed.metaDescription ?? "",
        category: parsed.category ?? "news",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        suggestedSlug: parsed.suggestedSlug ?? "",
      };
    } catch {
      // Use defaults if JSON parsing fails
    }
  }

  // Extract article content (everything before the JSON block)
  let content = response;
  if (jsonMatch) {
    content = response.substring(0, jsonMatch.index).trim();
  }

  // Generate slug from suggested or topic title
  const slug =
    metadata.suggestedSlug ||
    topic.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80);

  // Fallback meta title/description if not provided
  const metaTitle =
    metadata.metaTitle || topic.title.substring(0, 60);
  const metaDescription =
    metadata.metaDescription ||
    topic.description.substring(0, 160) ||
    `Read about ${topic.title} on CryptoCompare AI.`;

  return {
    title: topic.title,
    slug,
    content,
    metaTitle,
    metaDescription,
    category: metadata.category,
    tags: metadata.tags,
  };
}
