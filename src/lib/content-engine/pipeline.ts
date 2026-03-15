import { prisma } from "@/lib/prisma";
import { logToRun, updateRunStatus } from "./logger";
import { fetchTrendingTopics } from "./news-fetcher";
import { generateArticle } from "./article-generator";
import { generateFeaturedImage } from "./image-generator";
import { insertInternalLinks } from "./internal-linker";

export type PipelineOptions = {
  topicLimit?: number;
  publishAsDraft?: boolean;
};

export type PipelineResult = {
  runId: string;
  topicsFetched: number;
  articlesCreated: number;
  imagesGenerated: number;
  errorCount: number;
  status: "completed" | "failed";
};

/**
 * Run the full content generation pipeline:
 * 1. Fetch trending topics from NewsAPI
 * 2. Generate articles with Claude
 * 3. Insert internal links
 * 4. Generate featured images with Stable Diffusion
 * 5. Save to database
 */
export async function runContentPipeline(
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const { topicLimit = 3, publishAsDraft = true } = options;

  // Create automation run record
  const run = await prisma.automationRun.create({
    data: {
      jobType: "content-generation",
      status: "running",
      startedAt: new Date(),
    },
  });

  const runId = run.id;
  let articlesCreated = 0;
  let imagesGenerated = 0;
  let errorCount = 0;

  try {
    await logToRun(runId, "info", "Content pipeline started", {
      topicLimit,
      publishAsDraft,
    });

    // Step 1: Fetch trending topics
    const topics = await fetchTrendingTopics(runId, topicLimit);
    await updateRunStatus(runId, "running", { topicsFetched: topics.length });

    if (topics.length === 0) {
      await logToRun(runId, "warn", "No topics fetched, pipeline ending early");
      await updateRunStatus(runId, "completed", {
        completedAt: new Date(),
        resultSummary: "No topics available for article generation.",
      });
      return {
        runId,
        topicsFetched: 0,
        articlesCreated: 0,
        imagesGenerated: 0,
        errorCount: 0,
        status: "completed",
      };
    }

    // Step 2-5: Process each topic
    for (const topic of topics) {
      try {
        await logToRun(runId, "info", `Processing topic: ${topic.title}`);

        // Check for duplicate slug
        const existingSlug = topic.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 80);

        const existing = await prisma.blogPost.findUnique({
          where: { slug: existingSlug },
        });

        if (existing) {
          await logToRun(runId, "warn", `Skipping duplicate topic: ${topic.title}`, {
            existingSlug,
          });
          continue;
        }

        // Generate article with Claude
        const article = await generateArticle(runId, topic);
        if (!article) {
          errorCount++;
          await updateRunStatus(runId, "running", { errorCount });
          continue;
        }

        // Check for duplicate slug from generated article
        const existingArticle = await prisma.blogPost.findUnique({
          where: { slug: article.slug },
        });

        if (existingArticle) {
          // Append timestamp to make unique
          article.slug = `${article.slug}-${Date.now()}`;
        }

        // Insert internal links
        const linkedContent = await insertInternalLinks(runId, article.content);

        // Generate featured image
        let featuredImage: string | null = null;
        try {
          featuredImage = await generateFeaturedImage(runId, article.title, article.slug);
          if (featuredImage) {
            imagesGenerated++;
          }
        } catch (imgError) {
          const imgMessage = imgError instanceof Error ? imgError.message : String(imgError);
          await logToRun(runId, "warn", `Image generation failed (non-fatal): ${imgMessage}`);
        }

        // Save to database
        await prisma.blogPost.create({
          data: {
            slug: article.slug,
            title: article.title,
            content: linkedContent,
            metaTitle: article.metaTitle,
            metaDescription: article.metaDescription,
            featuredImage,
            category: article.category,
            tags: article.tags,
            publishedAt: publishAsDraft ? null : new Date(),
          },
        });

        articlesCreated++;
        await updateRunStatus(runId, "running", {
          articlesCreated,
          imagesGenerated,
        });

        await logToRun(runId, "info", `Article saved: ${article.title}`, {
          slug: article.slug,
          publishedAsDraft: publishAsDraft,
          hasImage: !!featuredImage,
        });
      } catch (topicError) {
        errorCount++;
        const message = topicError instanceof Error ? topicError.message : String(topicError);
        await logToRun(runId, "error", `Failed to process topic: ${message}`, {
          topic: topic.title,
        });
        await updateRunStatus(runId, "running", { errorCount });
      }
    }

    // Finalize
    const summary = `Generated ${articlesCreated} article(s), ${imagesGenerated} image(s). ${errorCount} error(s).`;
    await updateRunStatus(runId, "completed", {
      articlesCreated,
      imagesGenerated,
      errorCount,
      completedAt: new Date(),
      resultSummary: summary,
    });
    await logToRun(runId, "info", `Pipeline completed: ${summary}`);

    return {
      runId,
      topicsFetched: topics.length,
      articlesCreated,
      imagesGenerated,
      errorCount,
      status: "completed",
    };
  } catch (fatalError) {
    const message = fatalError instanceof Error ? fatalError.message : String(fatalError);
    await logToRun(runId, "error", `Pipeline fatal error: ${message}`);
    await updateRunStatus(runId, "failed", {
      errorCount: errorCount + 1,
      completedAt: new Date(),
      resultSummary: `Pipeline failed: ${message}`,
    });

    return {
      runId,
      topicsFetched: 0,
      articlesCreated,
      imagesGenerated,
      errorCount: errorCount + 1,
      status: "failed",
    };
  }
}
