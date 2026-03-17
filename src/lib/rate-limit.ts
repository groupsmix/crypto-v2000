/**
 * Redis-backed rate limiter using @upstash/ratelimit.
 *
 * Works correctly across Cloudflare Workers isolates and
 * multi-instance deployments (unlike the previous in-memory Map).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

export type RateLimitConfig = {
  /** Maximum number of requests in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Check if a request from the given identifier is allowed.
 *
 * Uses a sliding-window algorithm backed by Upstash Redis.
 * Falls back to allowing the request if Redis is unavailable
 * so that a Redis outage does not block all traffic.
 *
 * @param identifier - Unique key for the client (e.g. IP hash, user ID)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and remaining quota
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
      analytics: false,
      prefix: "ratelimit",
    });

    const result = await ratelimit.limit(identifier);

    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch {
    // If Redis is down, allow the request (fail-open)
    return {
      allowed: true,
      remaining: config.limit,
      resetAt: Date.now() + config.windowSeconds * 1000,
    };
  }
}

/**
 * Extract a client identifier from request headers for rate limiting.
 */
export function getClientIdentifier(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
