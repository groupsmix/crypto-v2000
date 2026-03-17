# CryptoCompare.ai Architecture

## Overview

CryptoCompare.ai is a cryptocurrency comparison platform built with Next.js 14 (App Router), deployed on Cloudflare Pages with a lightweight Cloudflare Worker entry point. It provides real-time price data, coin comparisons, blog content, and affiliate monetization.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2 (App Router) |
| Database | PostgreSQL via Prisma ORM |
| Cache | Upstash Redis (HTTP-based) |
| Auth | NextAuth.js (JWT strategy, 30-day sessions) |
| Deployment | Cloudflare Pages + Worker |
| Styling | Tailwind CSS + shadcn/ui components |
| Blog Content | Standalone blog-generator service (Node.js CLI) |

## Directory Structure

```
crypto-v2000/
  src/
    app/              # Next.js App Router pages
      (public)/       # Public-facing pages (prices, vs, blog)
      admin/          # Protected admin pages (monitoring, settings)
      api/            # API routes (auth, admin, affiliate tracking)
    components/       # React components (ui/, shared)
    config/           # Environment configuration
    lib/              # Shared utilities (prisma, redis, auth, seo)
  worker/             # Cloudflare Worker entry point (~1.5KB)
  prisma/             # Database schema and migrations
  public/             # Static assets (robots.txt, sitemap, icons)
  blog-generator/     # Git submodule — standalone blog CLI
```

## Key Patterns

### Caching Strategy

- **ISR (Incremental Static Regeneration)**: Used on high-traffic pages (`/prices`, `/vs`) with `revalidate` intervals
- **Redis cache**: API responses cached in Upstash Redis with TTL-based expiry
- **Stale fallback**: API failures serve stale cached data when available

### Route Protection

- **Middleware** (`src/middleware.ts`): Protects `/dashboard`, `/admin`, and `/api/admin` routes
- **Admin routes**: Require authenticated user with `role === "admin"`
- **Dashboard routes**: Require any authenticated user

### Security Headers

Applied globally via `next.config.mjs`:
- Content-Security-Policy (strict)
- Strict-Transport-Security (HSTS with preload)
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Permissions-Policy

### Blog Integration

The platform fetches blog content from the standalone `blog-generator` service:
- `BLOG_SOURCE_URL`: Read-only endpoint for fetching published posts
- `BLOG_GENERATOR_URL`: Trigger endpoint for generating new content
- Posts are published via GitHub Actions scheduled workflow

### Monitoring

Admin monitoring page (`/admin/monitoring`) provides real-time health checks:
- API health (CoinGecko, CryptoCompare)
- Redis cache health
- Blog publishing status
- Affiliate click tracking
- Trend system status (price data freshness)

## Deployment Flow

1. `npm run build` — Standard Next.js build
2. `npm run pages:build` — OpenNext Cloudflare adapter build
3. Deploy `.open-next/assets` to Cloudflare Pages via Wrangler
