import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const exchangeId = searchParams.get("exchange_id");
  const sourcePage = searchParams.get("source_page") || "unknown";
  const userId = searchParams.get("user_id") || null;
  const ipHashParam = searchParams.get("ip_hash") || null;

  if (!exchangeId) {
    return NextResponse.json(
      { error: "exchange_id is required" },
      { status: 400 }
    );
  }

  // Derive ip_hash from request headers if not provided
  const ipHash =
    ipHashParam ||
    hashString(
      request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );

  let affiliateUrl = "#";

  try {
    // Look up the exchange to get its affiliate URL
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      select: { affiliateUrl: true },
    });

    if (exchange?.affiliateUrl) {
      affiliateUrl = exchange.affiliateUrl;
    }

    // Record the click
    await prisma.affiliateClick.create({
      data: {
        exchangeId,
        sourcePage,
        userId,
        ipHash,
      },
    });
  } catch {
    // Even if DB write fails, still redirect the user
  }

  return NextResponse.redirect(affiliateUrl, { status: 302 });
}

// Simple hash function for IP anonymization
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
