# API Standards

Owner: Backend Engineering. Applies to `src/app/api/**` and webhooks.

## Authentication

- Public API authenticates with `Authorization: Bearer <api_key>` (`rl_live_…`).
- Keys are validated and rate-limited per key via a token bucket
  ([`src/lib/api-auth.ts`](../../src/lib/api-auth.ts)). Back the bucket with Redis/edge KV in
  production.
- App-internal mutations use server actions (same-origin), not the public API.

## Conventions

- **REST + JSON.** Resource-oriented paths: `/api/referrals`, `/api/conversions`,
  `/api/campaigns`, `/api/payouts`, `/api/webhooks/[provider]`.
- **Validate every body with zod** before doing work. Reject malformed input with 400 and a
  non-leaky message.
- **Tenant scope** is derived from the API key's `Org` — never trust an `orgId` in the body.
- **Pagination:** list endpoints take `page` & `pageSize`, return `{ rows, total, page,
  pageSize, totalPages }`, and clamp `pageSize` (1–100). Queries must be indexed.

## Idempotency

- Mutating endpoints that can be retried (`/api/conversions`, inbound webhooks) require an
  `idempotencyKey`. Replays return the original result, never double-effect.

## Errors

| Status | When |
| --- | --- |
| 400 | Validation failure (zod) |
| 401 | Missing/invalid API key |
| 403 | Authenticated but not allowed (RBAC / cross-tenant) |
| 404 | Resource not found *within the caller's tenant* |
| 409 | Idempotency / conflict |
| 429 | Rate limit exceeded |
| 5xx | Server error (never leak internals) |

Error body shape: `{ "error": "<machine_code>", "message": "<human readable, non-leaky>" }`.

## Versioning & compatibility

- The public API is **backward compatible**. Additive changes only without a version bump.
- Breaking changes require an ADR, a new version namespace, and a deprecation window.
- Webhooks verify provider signatures and are idempotent.

## Auditing

- Every mutating endpoint writes an `AuditLog` row (actor = API key/Org, action, entity,
  metadata).
