import { logToRun } from "./logger";

export type TrendingTopic = {
  title: string;
  description: string;
  source: string;
  url: string;
};

const NEWSAPI_BASE = "https://newsapi.org/v2";

/**
 * Fetch trending crypto topics from NewsAPI.
 * Returns up to `limit` unique topics suitable for article generation.
 */
export async function fetchTrendingTopics(
  runId: string,
  limit: number = 3
): Promise<TrendingTopic[]> {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    await logToRun(runId, "warn", "NEWSAPI_KEY not configured, using fallback topics");
    return getFallbackTopics(limit);
  }

  try {
    const queries = [
      "cryptocurrency AND (bitcoin OR ethereum OR regulation)",
      "crypto exchange AND (launch OR update OR hack)",
      "blockchain AND (DeFi OR NFT OR stablecoin)",
    ];

    const allTopics: TrendingTopic[] = [];

    for (const query of queries) {
      const params = new URLSearchParams({
        q: query,
        language: "en",
        sortBy: "publishedAt",
        pageSize: "5",
        apiKey,
      });

      const response = await fetch(`${NEWSAPI_BASE}/everything?${params}`, {
        headers: { "User-Agent": "CryptoCompareAI/1.0" },
      });

      if (!response.ok) {
        await logToRun(runId, "warn", `NewsAPI request failed: ${response.status}`, {
          query,
          status: response.status,
        });
        continue;
      }

      const data = await response.json();
      const articles = data.articles ?? [];

      for (const article of articles) {
        if (article.title && article.title !== "[Removed]") {
          allTopics.push({
            title: article.title,
            description: article.description ?? "",
            source: article.source?.name ?? "Unknown",
            url: article.url ?? "",
          });
        }
      }
    }

    // Deduplicate by title similarity and limit
    const unique = deduplicateTopics(allTopics);
    const selected = unique.slice(0, limit);

    await logToRun(runId, "info", `Fetched ${selected.length} trending topics from NewsAPI`, {
      totalFetched: allTopics.length,
      afterDedup: unique.length,
      selected: selected.length,
    });

    if (selected.length === 0) {
      await logToRun(runId, "warn", "No topics from NewsAPI, using fallbacks");
      return getFallbackTopics(limit);
    }

    return selected;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logToRun(runId, "error", `NewsAPI fetch failed: ${message}`);
    return getFallbackTopics(limit);
  }
}

function deduplicateTopics(topics: TrendingTopic[]): TrendingTopic[] {
  const seen = new Set<string>();
  return topics.filter((topic) => {
    const normalized = topic.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function getFallbackTopics(limit: number): TrendingTopic[] {
  const fallbacks: TrendingTopic[] = [
    {
      title: "Bitcoin Price Analysis: What Traders Need to Know",
      description: "An in-depth look at Bitcoin's current price action and what it means for traders.",
      source: "CryptoCompare AI",
      url: "",
    },
    {
      title: "Top Crypto Exchanges Compared: Security and Fees in Focus",
      description: "A comparison of the leading cryptocurrency exchanges focusing on security measures and fee structures.",
      source: "CryptoCompare AI",
      url: "",
    },
    {
      title: "DeFi vs Traditional Exchanges: The Future of Crypto Trading",
      description: "Exploring how decentralized finance is reshaping the cryptocurrency trading landscape.",
      source: "CryptoCompare AI",
      url: "",
    },
    {
      title: "Cryptocurrency Regulation Updates: What Investors Should Know",
      description: "The latest regulatory developments affecting cryptocurrency markets worldwide.",
      source: "CryptoCompare AI",
      url: "",
    },
    {
      title: "Ethereum Layer 2 Solutions: Reducing Costs for Crypto Traders",
      description: "How Layer 2 scaling solutions are making Ethereum more accessible and affordable.",
      source: "CryptoCompare AI",
      url: "",
    },
  ];

  return fallbacks.slice(0, limit);
}
