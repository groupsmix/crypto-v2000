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
 * The worker calls GET /api/cron/publish-scheduled?secret=<CRON_SECRET>
 * on your Next.js app, which publishes any posts whose scheduledFor <= now.
 */

export default {
  async scheduled(event, env) {
    const url = `${env.SITE_URL}/api/cron/publish-scheduled?secret=${env.CRON_SECRET}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "CronPublishWorker/1.0" },
    });

    const data = await res.json();
    console.log(`[cron-publish] status=${res.status}`, data);
  },
};
