-- CreateTable
CREATE TABLE "indexing_queue_items" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonical_url" TEXT NOT NULL,
    "page_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indexing_queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "indexing_queue_items_canonical_url_key" ON "indexing_queue_items"("canonical_url");

-- CreateIndex
CREATE INDEX "indexing_queue_items_status_idx" ON "indexing_queue_items"("status");

-- CreateIndex
CREATE INDEX "indexing_queue_items_created_at_idx" ON "indexing_queue_items"("created_at");
