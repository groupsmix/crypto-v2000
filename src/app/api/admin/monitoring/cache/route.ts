import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

type CacheEntry = {
  key: string;
  label: string;
  exists: boolean;
  ttl: number | null;
  lastUpdated: string | null;
  sizeHint: string | null;
};

async function checkCacheKey(key: string, label: string): Promise<CacheEntry> {
  try {
    const [exists, ttl, value] = await Promise.all([
      redis.exists(key),
      redis.ttl(key),
      redis.get(key),
    ]);

    let sizeHint: string | null = null;
    if (value) {
      const str = typeof value === "string" ? value : JSON.stringify(value);
      const bytes = new TextEncoder().encode(str).length;
      sizeHint =
        bytes > 1024
          ? `${(bytes / 1024).toFixed(1)} KB`
          : `${bytes} bytes`;
    }

    return {
      key,
      label,
      exists: exists === 1,
      ttl: ttl > 0 ? ttl : null,
      lastUpdated: null,
      sizeHint,
    };
  } catch {
    return {
      key,
      label,
      exists: false,
      ttl: null,
      lastUpdated: null,
      sizeHint: null,
    };
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let redisReachable = false;
  try {
    await redis.ping();
    redisReachable = true;
  } catch {
    // Redis unreachable
  }

  const cacheChecks: CacheEntry[] = [];

  if (redisReachable) {
    const entries = await Promise.all([
      checkCacheKey("ps:top-coins", "Prices List (top coins)"),
      checkCacheKey("ps:coin:bitcoin", "Sample Coin Page (bitcoin)"),
      checkCacheKey("cg:markets:1:100", "CoinGecko Markets Page 1"),
      checkCacheKey("cg:coin:bitcoin", "CoinGecko Coin Detail (bitcoin)"),
      checkCacheKey("cg:chart:bitcoin:30", "CoinGecko Chart (bitcoin 30d)"),
    ]);
    cacheChecks.push(...entries);
  }

  return NextResponse.json({
    redisReachable,
    entries: cacheChecks,
    checkedAt: new Date().toISOString(),
  });
}
