import { NextResponse } from "next/server";
import { runContentPipeline } from "@/lib/content-engine/pipeline";

/**
 * POST /api/content-engine/trigger
 *
 * Manually trigger the content generation pipeline.
 * Supports two modes:
 * - "queue": Add to BullMQ queue (requires worker running)
 * - "direct": Run pipeline directly in this request (default)
 *
 * Body: { topicLimit?: number, publishAsDraft?: boolean, mode?: "queue" | "direct" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const topicLimit = typeof body.topicLimit === "number" ? body.topicLimit : 3;
    const publishAsDraft = body.publishAsDraft !== false;
    const mode = body.mode === "queue" ? "queue" : "direct";

    if (mode === "queue") {
      // Dynamic import to avoid loading BullMQ in serverless environments
      const { triggerManualJob } = await import("@/lib/queue/content-queue");
      const jobId = await triggerManualJob({ topicLimit, publishAsDraft });

      return NextResponse.json({
        success: true,
        mode: "queue",
        jobId,
        message: "Job added to queue. It will be processed by the worker.",
      });
    }

    // Direct execution mode
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
