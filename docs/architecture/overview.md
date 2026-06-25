# Architecture Overview

Ai Studio Referrals is a **multi-tenant, config-driven referral engine** built on Next.js 15
(App Router), TypeScript, Tailwind, and Prisma. SQLite for zero-config local dev; Postgres
for production. This document is the canonical description of the system. **Do not redesign
it — propose an [ADR](#architecture-decision-records-adrs).**

## Principles

1. **Config over code.** A business launches a program by creating a `Campaign`. The engine
   reads trigger/reward/eligibility/attribution config at runtime. Adding a business or offer
   requires **zero engine changes**.
2. **Multi-tenant isolation.** Every row is scoped to an `Org`. Cross-tenant access is a
   Sev-1 defect.
3. **Swappable adapters.** Payouts, messaging, auth providers, e-commerce, CRM, and analytics
   live behind interfaces with safe console fallbacks.
4. **Defense in depth.** Edge `middleware.ts` does a fast cookie check; layouts do full
   cryptographic session validation via `requireSession()`.
5. **Audit everything.** Every state transition writes an `AuditLog` row.
6. **Backward compatibility.** Public API, DB schema, and shared contracts never break without
   a migration + version bump.

## Layered view

```
┌──────────────────────────────────────────────────────────────────┐
│  Presentation — src/app/** (route groups) + src/components/**      │
│  (marketing) (auth) (app) (platform) · join · r · api · widget.js  │
├──────────────────────────────────────────────────────────────────┤
│  Application — server actions (*/actions.ts) + API routes (/api)   │
├──────────────────────────────────────────────────────────────────┤
│  Domain — src/lib/referral/** (engine, codes, fraud, rewards)      │
│           src/lib/config/** · stats · money · notifications · audit│
├──────────────────────────────────────────────────────────────────┤
│  Integration — src/lib/adapters/** (payouts, messaging, auth)      │
├──────────────────────────────────────────────────────────────────┤
│  Platform — auth/session/password · api-auth · db (Prisma)         │
├──────────────────────────────────────────────────────────────────┤
│  Data — prisma/schema.prisma (SQLite → Postgres)                   │
└──────────────────────────────────────────────────────────────────┘
```

See the [module map](module-map.md) for path-level ownership and the
[data flow](data-flow.md) for the conversion lifecycle.

## Tenancy & roles

A single `Account` table backs three roles, each routed to its own area and guarded at the
edge and per-page:

- **super_admin** → `/platform` — cross-tenant operations.
- **advertiser** → `/admin`, `/settings` — owns an `Org` workspace.
- **referrer** → `/dashboard`, `/leaderboard` — sees only their own data.

## Conversion lifecycle (the core flow)

```
click → /r/[code] 302 (async click write + attribution cookie)
event → POST /api/conversions (or inbound webhook)
        ├─ match trigger event & idempotency key
        ├─ attribute (explicit code → device/IP within window)
        ├─ fraud screen (self-referral, velocity, device, disposable email)
        │     high → reject · medium → manual review · clean → approve
        ├─ resolve rewards (base + milestone + referee), put on hold
        └─ audit log every step
hold matures → reward cleared → wallet credited → payout requested → paid
```

## Architecture Decision Records (ADRs)

Any change to architecture, a shared contract, or a cross-cutting concern requires an ADR.

**ADR location:** `docs/architecture/adr/NNNN-title.md`
**Template:**

```markdown
# ADR-NNNN: <title>
- Status: Proposed | Accepted | Superseded by ADR-XXXX
- Date: YYYY-MM-DD
- Deciders: <roles>

## Context
What problem, what constraints, what forces.

## Decision
What we will do.

## Consequences
Tradeoffs, migration impact, backward-compatibility, what becomes easier/harder.

## Alternatives considered
Options rejected and why.
```

ADRs are approved by the **Architecture Council** (chaired by ARC-001). Breaking changes
additionally require Executive Office sign-off and a migration plan.

## Non-negotiable invariants

- Every query is scoped by `orgId` unless it is an explicit super_admin cross-tenant view.
- Every mutation is idempotent where it can be replayed (use idempotency keys).
- Every mutation writes an audit row.
- No secrets in code; adapters fall back to console stubs when unconfigured.
- Public API responses are versioned and backward compatible.
