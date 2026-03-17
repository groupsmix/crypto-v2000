# Deployment Guide

## Cloudflare Pages (Production)

### Prerequisites

- Node.js 20+
- Wrangler CLI (`npm i -g wrangler`)
- Cloudflare account with Pages project configured
- PostgreSQL database accessible from Cloudflare Workers
- Upstash Redis account (recommended)

### Build & Deploy

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build for Cloudflare Pages
npm run pages:build

# Deploy
npx wrangler pages deploy .open-next/assets --project-name=cryptocompare-ai
```

### Worker Bundle

The Cloudflare Worker entry point (`worker/index.ts`) is minimal (~1.5KB) and uses only native `fetch` and `Response` APIs. No external SDKs are imported.

### Environment Variables on Cloudflare

Set these in Cloudflare Pages dashboard under Settings > Environment Variables:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Database Migrations

```bash
# Run migrations against production database
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

## Local Development

```bash
# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## Automation Workflows

### GitHub Actions

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `main-platform-ci.yml` | Push/PR to `main` (non-blog paths) | Lint + Build verification |
| `blog-generator-ci.yml` | Push/PR to `main` (blog-generator paths) | Lint + Build for blog generator |
| `publish-scheduled-posts.yml` | Every 30 minutes (cron) | Publishes scheduled blog posts, commits changes |

### Blog Publishing Pipeline

1. Blog generator creates posts with `scheduledPublishDate`
2. GitHub Actions cron job runs `node dist/cli.js run-scheduled` every 30 minutes
3. Published posts are committed back to the repository
4. The platform fetches published posts via `BLOG_SOURCE_URL`
