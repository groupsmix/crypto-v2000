import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


/**
 * POST /api/content-engine/trigger
 *
 * Manually trigger the content generation pipeline.
 * Requires admin authentication.
 *
 * Runs the pipeline directly in this request.
 * For queue-based execution, use the standalone worker process
 * (npm run worker:start) which uses BullMQ + ioredis (Node.js only).
 *
 * Body: { topicLimit?: number, publishAsDraft?: boolean }
 */
export async function POST(request: Request) {
  // Require admin authentication
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const topicLimit = typeof body.topicLimit === "number" ? body.topicLimit : 3;
    const publishAsDraft = body.publishAsDraft !== false;

    // Dynamic import to avoid pulling Node.js-only content-engine deps into the edge bundle at build time
    const { runContentPipeline } = await import(
      "@/lib/content-engine/pipeline"
    );
    const result = await runContentPipeline({ topicLimit, publishAsDraft });

    return NextResponse.json({
      success: result.status === "completed",
      mode: "direct",
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ContentEngine] Trigger error:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
