# Database Reference & Standards

Owner: Software Architecture (Data). The **rules** live in
[standards/database-standards.md](../standards/database-standards.md); this page is the
**entity reference** for `prisma/schema.prisma`.

## Entities

| Entity | Purpose | Tenant key |
| --- | --- | --- |
| `Org` | Tenant workspace (advertiser); white-label fields (`logoUrl`, `brandColor`, …) | self |
| `Membership` | Links accounts to orgs with a role | `orgId` |
| `Account` | A login (super_admin / advertiser / referrer) | via membership |
| `ApiKey` | Per-org API credential (`rl_live_…`) | `orgId` |
| `Campaign` | Config-driven program: trigger, rewards, eligibility, attribution, A/B | `orgId` |
| `EndUser` | A referrer/referee profile | `orgId` |
| `Referral` | A referrer's referral (code, links) | `orgId` |
| `Click` | A tracked click on a referral link | `orgId` |
| `Conversion` | A trigger event attributed to a referral | `orgId` |
| `Reward` | Resolved reward (hold → cleared) for referrer/referee | `orgId` |
| `Payout` | A payout request and its state | `orgId` |
| `FraudFlag` | A fraud screening result requiring review | `orgId` |
| `AuditLog` | Append-only record of every state transition | `orgId` |

## Rules of thumb

- Every tenant-owned row has `orgId`. Query scoping is mandatory (see
  [security standards](../standards/security-standards.md#tenant-isolation)).
- String-encoded enums + zod validation keep the schema **portable** (SQLite → Postgres).
- Hot lookups (`Click`, `Conversion`, `Referral` by `orgId`/code/time) are indexed;
  pagination hits an index.
- Secrets/tokens stored as hashes only (SHA-256 session token, scrypt password).
- Local: `prisma db push`. Production: `prisma migrate deploy` (forward-only, backward
  compatible within a deprecation window).

## Changing the schema

1. Propose shape (Architecture + Data) — ADR if it's a contract change.
2. Co-review: Security (isolation), Performance (indexing), Backend (queries), QA (seed/tests).
3. Add migration; destructive changes use the two-step add→backfill→switch→remove pattern.
4. DevOps executes `prisma migrate deploy` at release.
