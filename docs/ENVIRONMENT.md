# Environment Variables

## Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth JWT signing. Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical URL of the app (e.g., `https://cryptocompare.ai`) |

## Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `UPSTASH_REDIS_REST_URL` | `""` | Upstash Redis HTTP endpoint for caching |
| `UPSTASH_REDIS_REST_TOKEN` | `""` | Upstash Redis auth token |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public-facing app URL (used for SEO, canonical URLs) |
| `NODE_ENV` | `development` | Environment mode |
| `BLOG_SOURCE_URL` | — | Blog generator API URL for fetching published posts |
| `BLOG_GENERATOR_URL` | — | Blog generator service URL for triggering generation |
| `BLOG_GENERATOR_SECRET` | — | Shared secret for authenticating blog generator requests |

## Notes

- Redis is optional; the app degrades gracefully without it (no caching, direct API calls)
- Blog integration variables are only needed if the blog-generator service is deployed
- See `.env.example` for a template
