type InternalLink = {
  text: string;
  url: string;
};

const COIN_KEYWORDS: Record<string, string> = {
  bitcoin: "/prices/bitcoin",
  btc: "/prices/bitcoin",
  ethereum: "/prices/ethereum",
  eth: "/prices/ethereum",
  solana: "/prices/solana",
  sol: "/prices/solana",
  cardano: "/prices/cardano",
  ada: "/prices/cardano",
  xrp: "/prices/xrp",
  ripple: "/prices/xrp",
  dogecoin: "/prices/dogecoin",
  doge: "/prices/dogecoin",
  polkadot: "/prices/polkadot",
  dot: "/prices/polkadot",
  avalanche: "/prices/avalanche",
  avax: "/prices/avalanche",
  chainlink: "/prices/chainlink",
  link: "/prices/chainlink",
  litecoin: "/prices/litecoin",
  ltc: "/prices/litecoin",
};

const EXCHANGE_COMPARISONS: Record<string, string> = {
  "binance vs coinbase": "/vs/binance-vs-coinbase",
  "binance vs kraken": "/vs/binance-vs-kraken",
  "coinbase vs kraken": "/vs/coinbase-vs-kraken",
  "binance vs bybit": "/vs/binance-vs-bybit",
  "coinbase vs bybit": "/vs/coinbase-vs-bybit",
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Insert internal links into markdown content.
 * Links only the first occurrence of each keyword to avoid over-linking.
 * Returns the modified content and a list of inserted links.
 */
export function insertInternalLinks(content: string): {
  linkedContent: string;
  links: InternalLink[];
} {
  let result = content;
  const links: InternalLink[] = [];

  // Link coin/crypto mentions to /prices/[coin]
  const linkedCoins = new Set<string>();
  for (const [keyword, url] of Object.entries(COIN_KEYWORDS)) {
    if (linkedCoins.has(url)) continue;

    const regex = new RegExp(
      `(?<!\\[)(?<!/)\\b(${escapeRegex(keyword)})\\b(?![^\\[]*\\])(?!/)`,
      "i"
    );
    const match = regex.exec(result);
    if (match) {
      const original = match[1];
      const link = `[${original}](${url})`;
      result =
        result.substring(0, match.index) +
        link +
        result.substring(match.index + original.length);
      links.push({ text: original, url });
      linkedCoins.add(url);
    }
  }

  // Link exchange comparison mentions to /vs/[slug]
  for (const [phrase, url] of Object.entries(EXCHANGE_COMPARISONS)) {
    const regex = new RegExp(
      `(?<!\\[)\\b(${escapeRegex(phrase)})\\b(?![^\\[]*\\])`,
      "i"
    );
    const match = regex.exec(result);
    if (match) {
      const original = match[1];
      const link = `[${original}](${url})`;
      result =
        result.substring(0, match.index) +
        link +
        result.substring(match.index + original.length);
      links.push({ text: original, url });
    }
  }

  return { linkedContent: result, links };
}

/**
 * Build a featured image prompt based on the article topic.
 */
export function buildImagePrompt(title: string, category: string): string {
  const cleanTitle = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .toLowerCase()
    .trim();

  return [
    `Professional digital illustration for a cryptocurrency blog article about "${cleanTitle}".`,
    `Category: ${category}.`,
    "Modern, clean design with subtle blockchain and crypto elements.",
    "Abstract geometric shapes, gradient colors in blue and purple tones.",
    "Professional financial technology aesthetic.",
    "High quality, 4K, sharp details, no text or watermarks.",
  ].join(" ");
}
