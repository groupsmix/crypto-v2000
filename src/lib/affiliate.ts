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
  | "vs-page-bottom"
  | "exchange-detail"
  | "exchange-detail-offer"
  | "blog-post"
  | "blog-sidebar"
  | "prices-page"
  | "prices-page-cta"
  | "tools-page"
  | "compare"
  | "unknown";

export type PageType =
  | "homepage"
  | "vs-page"
  | "prices-page"
  | "blog-post"
  | "exchange-detail"
  | "tools-page"
  | "compare";

interface ClickUrlOptions {
  /** Exchange slug (e.g. "binance") */
  exchangeSlug: string;
  /** Source type classification */
  sourceType: SourceType;
  /** The page path where the click originated (e.g. "/vs/binance-vs-coinbase") */
  sourcePath?: string;
  /** Page type classification for tracking (e.g. "vs-page", "prices-page") */
  pageType?: PageType;
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

  if (options.pageType) {
    params.set("page_type", options.pageType);
  }

  if (options.campaignTag) {
    params.set("campaign", options.campaignTag);
  }

  return `/api/click?${params.toString()}`;
}
