import { logToRun } from "./logger";

type ExchangeLink = {
  name: string;
  slug: string;
  keywords: string[];
};

/**
 * Known exchanges and the keywords that should trigger internal linking.
 */
const EXCHANGE_LINKS: ExchangeLink[] = [
  {
    name: "Binance",
    slug: "binance",
    keywords: ["binance", "bnb", "binance exchange"],
  },
  {
    name: "Coinbase",
    slug: "coinbase",
    keywords: ["coinbase", "coinbase exchange", "coinbase pro"],
  },
  {
    name: "Kraken",
    slug: "kraken",
    keywords: ["kraken", "kraken exchange"],
  },
  {
    name: "Bybit",
    slug: "bybit",
    keywords: ["bybit", "bybit exchange"],
  },
  {
    name: "KuCoin",
    slug: "kucoin",
    keywords: ["kucoin", "ku coin", "kucoin exchange"],
  },
];

/**
 * Insert internal links to relevant exchange pages within article content.
 * Only links the first occurrence of each exchange name to avoid over-linking.
 */
export async function insertInternalLinks(
  runId: string,
  content: string
): Promise<string> {
  let linkedContent = content;
  let linksInserted = 0;

  for (const exchange of EXCHANGE_LINKS) {
    // Skip if already linked (contains a markdown link to this exchange)
    if (linkedContent.includes(`(/exchanges/${exchange.slug})`)) {
      continue;
    }

    // Find the first occurrence of the exchange name that is NOT inside:
    // - A markdown link [...](...) 
    // - A heading ## or ###
    // - Already bold **...**
    for (const keyword of exchange.keywords) {
      // Case-insensitive match for the keyword, but NOT inside a markdown link or heading
      const regex = new RegExp(
        `(?<!\\[)(?<!\\*\\*)(?<!#+ )\\b(${escapeRegex(keyword)})\\b(?![^\\[]*\\])(?!\\*\\*)`,
        "i"
      );

      const match = regex.exec(linkedContent);
      if (match) {
        const originalText = match[1];
        const link = `[${originalText}](/exchanges/${exchange.slug})`;
        linkedContent =
          linkedContent.substring(0, match.index) +
          link +
          linkedContent.substring(match.index + originalText.length);
        linksInserted++;
        break; // Only link first occurrence per exchange
      }
    }
  }

  // Also add a comparison page link if the article discusses multiple exchanges
  const exchangesMentioned = EXCHANGE_LINKS.filter((e) =>
    content.toLowerCase().includes(e.name.toLowerCase())
  );

  if (exchangesMentioned.length >= 2) {
    const hasCompareLink = linkedContent.includes("(/compare)");
    if (!hasCompareLink) {
      // Add a contextual CTA before the conclusion or at the end
      const conclusionIndex = linkedContent.search(/^## Conclusion/im);
      const ctaBlock = `\n\n> **Compare Exchanges:** Use our [exchange comparison tool](/compare) to see how these platforms stack up side by side.\n\n`;

      if (conclusionIndex > -1) {
        linkedContent =
          linkedContent.substring(0, conclusionIndex) +
          ctaBlock +
          linkedContent.substring(conclusionIndex);
      } else {
        linkedContent += ctaBlock;
      }
      linksInserted++;
    }
  }

  await logToRun(runId, "info", `Inserted ${linksInserted} internal links`, {
    exchangesMentioned: exchangesMentioned.map((e) => e.name),
  });

  return linkedContent;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
