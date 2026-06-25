# Performance Standards

Owner: Performance Engineering.

## Budgets

| Path | Budget |
| --- | --- |
| `/r/[code]` referral redirect | < 100ms server time; edge-cacheable |
| Public API list endpoints | < 300ms p95; always paginated & indexed |
| Conversion ingestion | < 500ms p95 including fraud screen |
| Dashboard/admin first load | < 2.5s LCP on mid-tier hardware |

Budgets are gates: a PR that regresses a budget is blocked until resolved.

## Caching

- `/r/[code]` uses edge caching (`s-maxage` + `stale-while-revalidate`) and writes clicks
  **asynchronously** for sub-100ms redirects.
- Cache only what is safe to cache; never cache tenant-private data across tenants.

## Queries

- No unbounded queries. Every list is paginated with a clamped `pageSize` (1–100) and an
  index behind it.
- Prevent N+1: use Prisma `include`/`select` deliberately; batch where possible (see the
  `Promise.all` pattern in [`audit.ts`](../../src/lib/audit.ts)).
- Index hot lookups on `orgId`, code, and time columns.

## Rate limiting

- API is rate-limited per key (token bucket). The in-memory bucket is demo-only; **production
  must back it with Redis/edge KV**.

## Measurement

- Hot paths ship with timing/observability hooks (with DevOps).
- Performance reviews load-test the redirect, conversion, and list paths before release.

## Review authority

Performance reviews all hot-path changes and may block merges that breach a budget or
introduce unbounded/un-indexed queries.
