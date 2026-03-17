/**
 * Cloudflare Worker — Cron Trigger for publishing scheduled blog posts.
 *
 * Setup:
 *   1. Create a new Worker in Cloudflare dashboard (or use wrangler)
 *   2. Set environment variables:
 *      - SITE_URL: your production URL (e.g. https://cryptocompare.ai)
 *      - CRON_SECRET: must match CRON_SECRET in your Next.js .env
 *   3. Add a Cron Trigger: e.g. "* / 5 * * * *" (every 5 minutes)
 *
 * The worker calls GET /api/cron/publish-scheduled with the CRON_SECRET
 * passed as a Bearer token in the Authorization header (not as a query
 * parameter, to avoid leaking the secret in logs and Referer headers).
 */

export default {
  async scheduled(event, env) {
    const url = `${env.SITE_URL}/api/cron/publish-scheduled`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "CronPublishWorker/1.0",
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });

    const data = await res.json();
    console.log(`[cron-publish] status=${res.status}`, data);
  },
};
