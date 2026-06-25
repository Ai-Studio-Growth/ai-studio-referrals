# Database Standards

Owner: Software Architecture (Data). Implemented with Prisma; SQLite locally, Postgres in
production.

## Schema

- Single source of truth: `prisma/schema.prisma`. All schema changes are Architecture + Data
  reviewed, with Security (isolation) and Performance (indexing) co-review.
- Core entities: `Org`, `Membership`, `Account`, `ApiKey`, `Campaign`, `EndUser`, `Referral`,
  `Click`, `Conversion`, `Reward`, `Payout`, `FraudFlag`, `AuditLog`, notifications.
- **Tenancy:** every tenant-owned table carries `orgId`. No table mixes tenants without an
  explicit scope column.
- **Portability:** keep the schema portable (string-encoded enums + app-level zod validation)
  so SQLite→Postgres stays clean.

## Migrations

- Local dev uses `prisma db push`. **Production uses migrations:** `prisma migrate deploy`.
- Every schema change ships a migration; never hand-edit production schema.
- Migrations are forward-only and backward compatible within a deprecation window. Destructive
  changes (drop/rename) require an ADR and a two-step migrate (add new → backfill → switch →
  remove old).
- DevOps executes migrations; Architecture owns their shape.

## Indexing & performance

- Index hot query paths: `Click`, `Conversion`, `Referral` lookups by `orgId`, code, and
  time. Pagination must hit an index.
- No unbounded queries; list endpoints are server-side paginated and bounded (see
  [audit.ts](../../src/lib/audit.ts) `pageSize` clamp as the pattern: clamp 1–100).
- Performance Engineering co-reviews index changes.

## Access rules

- Application code talks to the DB only through the Prisma client in `src/lib/db.ts`.
- Every query is `orgId`-scoped unless it is an audited super_admin cross-tenant view.
- Secrets and tokens are never stored in plaintext — store hashes (e.g. SHA-256 of session
  tokens, scrypt for passwords). See [security standards](security-standards.md).

## Seed data

- `prisma/seed.ts` provides realistic demo data. Changes to seed assumptions are QA-reviewed
  (tests may depend on them).
