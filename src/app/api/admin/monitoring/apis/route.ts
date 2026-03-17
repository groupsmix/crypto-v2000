import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type ApiStatus = {
  name: string;
  url: string;
  reachable: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  error: string | null;
};

async function checkApi(name: string, url: string): Promise<ApiStatus> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;

    return {
      name,
      url,
      reachable: res.ok,
      statusCode: res.status,
      responseTimeMs,
      error: res.ok ? null : `HTTP ${res.status} ${res.statusText}`,
    };
  } catch (err) {
    return {
      name,
      url,
      reachable: false,
      statusCode: null,
      responseTimeMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blogSourceUrl = process.env.BLOG_SOURCE_URL || "";

  const checks: Promise<ApiStatus>[] = [
    checkApi(
      "CoinGecko (primary)",
      "https://api.coingecko.com/api/v3/ping"
    ),
    checkApi(
      "CryptoCompare (fallback)",
      "https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=1"
    ),
  ];

  if (blogSourceUrl) {
    checks.push(
      checkApi("Blog Source (Project 1)", `${blogSourceUrl}/api/published`)
    );
  }

  const results = await Promise.all(checks);

  // If blog source is not configured, add an entry indicating that
  if (!blogSourceUrl) {
    results.push({
      name: "Blog Source (Project 1)",
      url: "not configured",
      reachable: false,
      statusCode: null,
      responseTimeMs: null,
      error: "BLOG_SOURCE_URL environment variable not set",
    });
  }

  return NextResponse.json({
    apis: results,
    checkedAt: new Date().toISOString(),
  });
}
