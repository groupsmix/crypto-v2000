/**
 * Affiliate click-tracking utilities.
 *
 * All affiliate CTA buttons route through /api/click which records the click
 * in the database and then 302-redirects the user to the exchange's affiliate URL.
 */

export type SourceType =
  | "homepage"
  | "homepage-featured"
  | "vs-page"
  | "exchange-detail"
  | "exchange-detail-offer"
  | "blog-post"
  | "prices-page"
  | "tools-page"
  | "compare"
  | "unknown";

interface ClickUrlOptions {
  /** Exchange slug (e.g. "binance") */
  exchangeSlug: string;
  /** Source type classification */
  sourceType: SourceType;
  /** The page path where the click originated (e.g. "/vs/binance-vs-coinbase") */
  sourcePath?: string;
  /** Optional campaign tag for tracking campaigns */
  campaignTag?: string;
}

/**
 * Build the affiliate click-tracking URL that routes through /api/click.
 *
 * The API handler records the click in the database and then 302-redirects
 * the user to the exchange's affiliate URL.
 */
export function buildClickUrl(options: ClickUrlOptions): string {
  const params = new URLSearchParams({
    slug: options.exchangeSlug,
    source_type: options.sourceType,
  });

  if (options.sourcePath) {
    params.set("source_path", options.sourcePath);
  }

  if (options.campaignTag) {
    params.set("campaign", options.campaignTag);
  }

  return `/api/click?${params.toString()}`;
}
