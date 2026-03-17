import { redis } from "@/lib/redis";

/**
 * Shared Redis cache helpers.
 * Used by coingecko.ts, price-service.ts, and any other module that needs
 * simple key-value caching with TTL.
 */

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
    }
  } catch {
    // Redis unavailable, skip cache
  }
  return null;
}

export async function setCache(key: string, data: unknown, ttl: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttl });
  } catch {
    // Redis unavailable, skip cache
  }
}
