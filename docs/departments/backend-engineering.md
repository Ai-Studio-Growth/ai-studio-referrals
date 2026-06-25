# Department — Backend Engineering

## Mission

Build and maintain the heart of the platform: the config-driven referral engine, reward
resolution, fraud screening, conversion lifecycle, and the public API — correct, idempotent,
tenant-isolated, and fully audited.

## Responsibilities

- Own the referral engine and its correctness: codes, clicks, attribution, conversions,
  rewards, audit.
- Own the public REST API (`/api/**`) and its contracts, pagination, and rate limiting.
- Implement campaign configuration logic proposed by Product / Architecture.
- Maintain idempotency and the conversion lifecycle described in the [README](../../README.md#conversion-lifecycle).

## Owned modules

- `src/lib/referral/**` — `engine.ts`, `codes.ts`, `fraud.ts`, `rewards.ts` (primary owner).
- `src/lib/stats.ts`, `src/lib/money.ts`, `src/lib/api-auth.ts`, `src/lib/audit.ts`,
  `src/lib/notifications.ts`, `src/lib/db.ts`.
- `src/app/api/**` — referrals, conversions, campaigns, payouts, webhooks.
- `src/app/r/[code]/route.ts` (with Performance for caching), `src/app/widget.js/route.ts`.
- `src/lib/config/campaign-config.ts` — co-owned with Architecture (Backend implements).

## Coding responsibilities

- All engine, API, and server-side business logic.
- Database queries and Prisma usage (schema *changes* go through Architecture + Database).
- Server actions backing app UI (`src/app/**/actions.ts`) for data mutations.

## Review responsibilities

- Review all changes to `src/lib/**` and `src/app/api/**`.
- Review any code that writes to `Reward`, `Conversion`, `Payout`, or `FraudFlag`.
- Verify idempotency keys, tenant scoping (`orgId`), and audit logging on every mutation.

## Escalation rules

- Schema change needed → open Database Review with Architecture before coding.
- Auth/RBAC/session touch points → Security review required (cannot self-approve).
- Cross-tenant data concern → Sev-1, escalate to Security + Executive Office immediately.

## Restricted areas (require approval)

Authentication & sessions (`src/lib/auth*.ts`, `src/lib/password.ts`, `src/middleware.ts`),
database **core schema** (`prisma/schema.prisma`), and the UI component library
(`src/components/**`) — Backend cannot modify these without the owning department's review.
