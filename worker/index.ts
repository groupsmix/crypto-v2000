/**
 * Cloudflare Worker entry point.
 *
 * This worker handles edge-side logic for the CryptoCompare AI platform.
 * It runs on Cloudflare's global network alongside the Pages deployment.
 *
 * Current responsibilities:
 *   - Placeholder for future edge caching, API proxying, and A/B testing
 *
 * The main Next.js app is deployed via Cloudflare Pages using OpenNext.
 * This worker can be used for additional edge functionality outside of
 * what the Pages deployment handles.
 */

export interface Env {
  // Add KV, D1, R2, or other bindings here as needed
  // BLOG_CACHE: KVNamespace;
}

export default {
  async fetch(
    request: Request,
    _env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/worker/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "cryptocompare-ai-worker",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Placeholder: future routes can be added here
    // e.g., /worker/cache, /worker/proxy, etc.

    return new Response("Not Found", { status: 404 });
  },

  // Placeholder for scheduled (cron) triggers
  // async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  //   // Future: trigger blog generation, cache warming, etc.
  // },
};
