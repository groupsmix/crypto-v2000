import { prisma } from "@/lib/prisma";

export type BlogPostPreview = {
  slug: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  publishedAt: Date | null;
};

const fallbackPosts: BlogPostPreview[] = [
  {
    slug: "best-crypto-exchanges-2026",
    title: "Best Crypto Exchanges in 2026: Complete Comparison Guide",
    content:
      "Choosing the right cryptocurrency exchange is one of the most important decisions for any crypto trader or investor. In this comprehensive guide, we compare the top exchanges across fees, security, supported coins, and user experience.",
    category: "guides",
    tags: ["exchanges", "comparison", "guide", "2026"],
    publishedAt: new Date("2026-01-15"),
  },
  {
    slug: "crypto-trading-fees-explained",
    title: "Crypto Trading Fees Explained: Maker vs Taker and How to Save",
    content:
      "Understanding trading fees is crucial for maximizing your returns in cryptocurrency trading. This guide breaks down the different fee structures used by major exchanges.",
    category: "education",
    tags: ["fees", "trading", "education", "maker-taker"],
    publishedAt: new Date("2026-02-10"),
  },
  {
    slug: "how-to-choose-a-crypto-exchange",
    title: "How to Choose a Crypto Exchange: A Beginner's Checklist",
    content:
      "If you're new to cryptocurrency, choosing your first exchange can feel overwhelming. This beginner-friendly checklist will help you find the perfect platform.",
    category: "guides",
    tags: ["beginners", "guide", "security", "kyc"],
    publishedAt: new Date("2026-03-01"),
  },
];

export async function getLatestBlogPosts(
  limit: number = 3
): Promise<BlogPostPreview[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        slug: true,
        title: true,
        content: true,
        category: true,
        tags: true,
        publishedAt: true,
      },
    });

    if (posts.length === 0) {
      return fallbackPosts;
    }

    return posts;
  } catch {
    return fallbackPosts;
  }
}
