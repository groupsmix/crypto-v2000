-- CreateTable
CREATE TABLE "exchanges" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "affiliate_url" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "founded_year" INTEGER,
    "headquarters" TEXT,
    "description" TEXT,
    "supported_coins_count" INTEGER NOT NULL DEFAULT 0,
    "kyc_required" BOOLEAN NOT NULL DEFAULT false,
    "spot_available" BOOLEAN NOT NULL DEFAULT true,
    "futures_available" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_fees" (
    "id" TEXT NOT NULL,
    "exchange_id" TEXT NOT NULL,
    "spot_maker_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spot_taker_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "futures_maker_fee" DOUBLE PRECISION,
    "futures_taker_fee" DOUBLE PRECISION,
    "withdrawal_fee" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_offers" (
    "id" TEXT NOT NULL,
    "exchange_id" TEXT NOT NULL,
    "offer_text" TEXT NOT NULL,
    "bonus_amount" DOUBLE PRECISION,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_clicks" (
    "id" TEXT NOT NULL,
    "exchange_id" TEXT NOT NULL,
    "source_page" TEXT NOT NULL,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "ip_hash" TEXT NOT NULL,

    CONSTRAINT "affiliate_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "featured_image" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_comparisons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exchange_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coin_symbol" TEXT NOT NULL,
    "target_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_jobs" (
    "id" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "result_summary" TEXT,

    CONSTRAINT "automation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exchanges_slug_key" ON "exchanges"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_fees_exchange_id_key" ON "exchange_fees"("exchange_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "exchange_fees" ADD CONSTRAINT "exchange_fees_exchange_id_fkey" FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_exchange_id_fkey" FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_exchange_id_fkey" FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_comparisons" ADD CONSTRAINT "saved_comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
