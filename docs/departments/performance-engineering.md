# Department — Performance Engineering

## Mission

Keep the platform fast under load: sub-100ms referral redirects, snappy dashboards,
efficient queries, and a caching strategy that scales with tenants and traffic.

## Responsibilities

- Own performance budgets and the [performance standards](../standards/performance-standards.md).
- Own the caching strategy for `/r/[code]` (edge `s-maxage` + `stale-while-revalidate`) and
  async click writes.
- Own query performance: indexing strategy on hot tables (`Click`, `Conversion`, `Referral`),
  N+1 prevention, pagination correctness.
- Run the Performance Review gate.

## Owned modules

- `src/app/r/[code]/route.ts` — caching behavior (co-owned with Backend).
- Indexing strategy in `prisma/schema.prisma` (proposes indexes; Architecture+DB approve shape).
- Query patterns in `src/lib/stats.ts` and paginated API list endpoints (review authority).

## Coding responsibilities

- Caching headers, memoization, query optimization, batching.
- Load/performance test harnesses (with QA).

## Review responsibilities

- Review hot-path changes (redirect, conversions, list endpoints, analytics).
- Verify pagination is indexed and bounded; verify no unbounded queries.
- Verify rate limiting is in place and backed by durable storage in production.

## Escalation rules

- Performance budget regression → block merge; escalate to owning department + Architecture.
- Production latency Sev-2 → coordinate with DevOps on mitigation (cache, scale, throttle).
