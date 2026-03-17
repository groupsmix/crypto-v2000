import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const sourceType = searchParams.get("source_type") || "unknown";
  const sourcePath = searchParams.get("source_path") || "";
  const pageType = searchParams.get("page_type") || null;
  const campaignTag = searchParams.get("campaign") || null;

  if (!slug) {
    return NextResponse.json(
      { error: "Exchange slug is required" },
      { status: 400 }
    );
  }

  // Derive ip_hash from request headers (SHA-256 with server-side salt)
  const ipHash = await hashString(
    request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"
  );

  // Extract attribution metadata
  const userAgent = request.headers.get("user-agent") || null;
  const referrer = request.headers.get("referer") || null;
  // Cloudflare / Vercel / common CDN country header
  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    null;

  let affiliateUrl: string | null = null;

  try {
    // Look up the exchange by slug
    const exchange = await prisma.exchange.findUnique({
      where: { slug },
      select: { id: true, slug: true, affiliateUrl: true },
    });

    if (!exchange) {
      return NextResponse.json(
        { error: `Exchange not found: ${slug}` },
        { status: 404 }
      );
    }

    affiliateUrl = exchange.affiliateUrl;

    if (!affiliateUrl) {
      return NextResponse.json(
        { error: `No affiliate URL configured for ${slug}` },
        { status: 404 }
      );
    }

    // Record the click (non-blocking-safe: errors here must not break redirect)
    try {
      await prisma.affiliateClick.create({
        data: {
          exchangeId: exchange.id,
          exchangeSlug: slug,
          sourcePage: sourceType, // backward compat with old field
          sourceType,
          sourcePath,
          pageType,
          destinationUrl: affiliateUrl,
          campaignTag,
          ipHash,
          userAgent: userAgent ? userAgent.slice(0, 512) : null,
          referrer: referrer ? referrer.slice(0, 1024) : null,
          country,
        },
      });
    } catch {
      // Logging failure must not prevent the redirect
    }

    return NextResponse.redirect(affiliateUrl, { status: 302 });
  } catch {
    // If exchange lookup itself failed but we have a URL, still redirect
    if (affiliateUrl) {
      return NextResponse.redirect(affiliateUrl, { status: 302 });
    }
    return NextResponse.json(
      { error: "Failed to process affiliate click" },
      { status: 500 }
    );
  }
}

/**
 * Hash a string (e.g. an IP address) using SHA-256 with a server-side salt.
 * This produces a one-way hash that cannot be reversed via a simple lookup
 * table, unlike the previous djb2 hash which had only ~4 billion outputs.
 */
async function hashString(str: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT || "crypto-v2000-default-salt";
  const data = new TextEncoder().encode(salt + str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
