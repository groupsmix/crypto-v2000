/**
 * Indexing trigger utility.
 *
 * Lightweight module for preparing URL submission payloads for search engine
 * indexing APIs. Does not hardwire any specific paid service — instead provides
 * a clean interface so Google Indexing API (or other services) can be plugged
 * in later without touching the rest of the codebase.
 *
 * Usage:
 *   import { createIndexingPayloads, IndexingProvider } from "@/lib/indexing";
 *
 *   const payloads = createIndexingPayloads(urls);
 *   await provider.submitBatch(payloads);
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cryptocompare.ai";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type IndexingAction = "URL_UPDATED" | "URL_DELETED";

export interface IndexingPayload {
  /** Fully qualified URL to submit */
  url: string;
  /** Action type (update or delete) */
  type: IndexingAction;
  /** ISO 8601 timestamp when the payload was created */
  createdAt: string;
}

export interface IndexingResult {
  url: string;
  success: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Abstract interface for an indexing provider.
 * Implement this to integrate with Google Indexing API, IndexNow, Bing, etc.
 */
export interface IndexingProvider {
  /** Human-readable name of the provider */
  name: string;
  /** Submit a single URL for indexing */
  submit(payload: IndexingPayload): Promise<IndexingResult>;
  /** Submit a batch of URLs for indexing */
  submitBatch(payloads: IndexingPayload[]): Promise<IndexingResult[]>;
}

// ─── Payload Builder ────────────────────────────────────────────────────────────

/**
 * Create indexing payloads from a list of URL paths (relative or absolute).
 */
export function createIndexingPayloads(
  urls: string[],
  action: IndexingAction = "URL_UPDATED"
): IndexingPayload[] {
  const now = new Date().toISOString();

  return urls.map((url) => ({
    url: url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`,
    type: action,
    createdAt: now,
  }));
}

/**
 * Build a list of all public SEO-relevant URL paths for the site.
 * Useful for triggering a full re-index after a deployment or content update.
 */
export function getPublicUrlPaths(): string[] {
  return [
    "/",
    "/prices",
    "/compare",
    "/blog",
    "/tools",
    "/tools/fee-calculator",
    "/tools/profit-calculator",
    "/tools/dca-calculator",
    "/tools/converter",
    "/tools/portfolio-tracker",
  ];
}

// ─── Noop Provider (for development / testing) ──────────────────────────────────

/**
 * A no-op provider that logs payloads without submitting them.
 * Useful during development and as a reference implementation.
 */
export class NoopIndexingProvider implements IndexingProvider {
  name = "noop";

  async submit(payload: IndexingPayload): Promise<IndexingResult> {
    return {
      url: payload.url,
      success: true,
      statusCode: 200,
    };
  }

  async submitBatch(payloads: IndexingPayload[]): Promise<IndexingResult[]> {
    return payloads.map((p) => ({
      url: p.url,
      success: true,
      statusCode: 200,
    }));
  }
}

// ─── Google Indexing API Stub ────────────────────────────────────────────────────

/**
 * Stub for Google Indexing API integration.
 *
 * To enable:
 * 1. Create a Google Cloud service account with Indexing API access
 * 2. Verify site ownership in Google Search Console
 * 3. Set GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON environment variable
 * 4. Implement the submit/submitBatch methods using the Google API client
 *
 * Reference: https://developers.google.com/search/apis/indexing-api/v3/quickstart
 */
export class GoogleIndexingProvider implements IndexingProvider {
  name = "google-indexing-api";

  async submit(payload: IndexingPayload): Promise<IndexingResult> {
    // TODO: Implement using googleapis npm package when ready
    // const auth = new google.auth.GoogleAuth({ ... });
    // const indexing = google.indexing({ version: 'v3', auth });
    // await indexing.urlNotifications.publish({ requestBody: { url, type } });
    return {
      url: payload.url,
      success: false,
      error: "Google Indexing API integration not yet configured",
    };
  }

  async submitBatch(payloads: IndexingPayload[]): Promise<IndexingResult[]> {
    const results: IndexingResult[] = [];
    for (const payload of payloads) {
      results.push(await this.submit(payload));
    }
    return results;
  }
}

// ─── IndexNow Stub ──────────────────────────────────────────────────────────────

/**
 * Stub for IndexNow protocol (supported by Bing, Yandex, Seznam, Naver).
 *
 * To enable:
 * 1. Generate an API key at https://www.indexnow.org/
 * 2. Host the key file at /{key}.txt on your domain
 * 3. Set INDEXNOW_API_KEY environment variable
 */
export class IndexNowProvider implements IndexingProvider {
  name = "indexnow";

  async submit(payload: IndexingPayload): Promise<IndexingResult> {
    const apiKey = process.env.INDEXNOW_API_KEY;
    if (!apiKey) {
      return {
        url: payload.url,
        success: false,
        error: "INDEXNOW_API_KEY environment variable not set",
      };
    }

    // TODO: Implement when ready
    // POST https://api.indexnow.org/IndexNow
    // { host, key, keyLocation, urlList }
    return {
      url: payload.url,
      success: false,
      error: "IndexNow integration not yet configured",
    };
  }

  async submitBatch(payloads: IndexingPayload[]): Promise<IndexingResult[]> {
    const results: IndexingResult[] = [];
    for (const payload of payloads) {
      results.push(await this.submit(payload));
    }
    return results;
  }
}
