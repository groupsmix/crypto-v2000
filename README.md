# CryptoCompare

A crypto exchange comparison platform built with Next.js 14 (App Router). Compare fees, features, and signup bonuses across top cryptocurrency exchanges.

**Live:** [https://cryptocompare.ai](https://cryptocompare.ai)

## Features

- **Exchange Comparisons** -- Side-by-side fee, feature, and bonus comparisons
- **Live Prices** -- Real-time cryptocurrency prices via CoinGecko
- **Exchange Reviews** -- Individual exchange detail pages with scores and offers
- **Blog** -- Guides, reviews, and educational content (DB + external source)
- **RSS Feed** -- `/feed.xml` for blog subscribers
- **Newsletter** -- Email subscription stored in PostgreSQL
- **Search** -- Cmd+K command palette for quick navigation
- **Tools** -- Fee calculator, profit calculator, DCA simulator, converter, portfolio tracker

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Upstash Redis (HTTP-based)
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Cloudflare Pages (via OpenNext)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `BLOG_SOURCE_URL` | External blog generator service URL |
| `BLOG_SOURCE_SECRET` | Bearer token for blog source API |

## Project Structure

```
src/
  app/            # Next.js App Router pages & API routes
  components/     # React components (ui/, layout/, home/, exchange/, etc.)
  config/         # Site configuration
  lib/            # Data access, utilities, affiliate logic
prisma/           # Prisma schema & migrations
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
```
