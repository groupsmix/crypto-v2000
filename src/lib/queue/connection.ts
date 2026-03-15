import IORedis from "ioredis";

/**
 * Shared ioredis connection for BullMQ.
 * Uses REDIS_URL env var (standard TCP Redis, not Upstash HTTP).
 */
export function createRedisConnection(): IORedis {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times: number) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
  });
}
