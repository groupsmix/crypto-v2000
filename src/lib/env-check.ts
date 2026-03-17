/**
 * Validates that critical environment variables are set at startup.
 * Call this in server-side code to fail fast if configuration is missing.
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required: { key: string; hint: string }[] = [
    {
      key: "DATABASE_URL",
      hint: "PostgreSQL connection string (e.g. postgresql://user:pass@host:5432/db)",
    },
  ];

  const warnings: { key: string; hint: string }[] = [
    {
      key: "UPSTASH_REDIS_REST_URL",
      hint: "Required for caching. Without it, every API call hits the origin.",
    },
    {
      key: "UPSTASH_REDIS_REST_TOKEN",
      hint: "Required for caching. Without it, every API call hits the origin.",
    },
    {
      key: "BLOG_SOURCE_URL",
      hint: "Required for fetching published blog posts from the blog generator service.",
    },
  ];

  const missing: string[] = [];

  for (const { key, hint } of required) {
    if (!process.env[key]) {
      missing.push(key);
      console.error(`[ENV] MISSING REQUIRED: ${key} — ${hint}`);
    }
  }

  for (const { key, hint } of warnings) {
    if (!process.env[key]) {
      console.warn(`[ENV] MISSING OPTIONAL: ${key} — ${hint}`);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[ENV] ${missing.length} required environment variable(s) are missing. The application may not function correctly.`
    );
  }

  return { valid: missing.length === 0, missing };
}
