import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/content-engine/runs
 *
 * Fetch recent automation runs with their logs.
 * Query params: limit (default 10), includelogs (default false)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "10", 10),
      50
    );
    const includeLogs = searchParams.get("includelogs") === "true";

    const runs = await prisma.automationRun.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: includeLogs
        ? {
            logs: {
              orderBy: { createdAt: "asc" },
              take: 100,
            },
          }
        : undefined,
    });

    return NextResponse.json({ runs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ContentEngine] Runs fetch error:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
