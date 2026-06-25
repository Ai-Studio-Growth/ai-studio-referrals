# Vision, Mission & Strategy

## Vision

Make word-of-mouth growth **programmable** for every business on earth.

## Mission

Build and operate the most flexible, secure, and observable referral infrastructure on the
market, delivered by a self-managing engineering organization.

## Strategic pillars

1. **Config-driven engine** — businesses launch programs by creating a Campaign, never by
   editing engine code. This is our core moat and must be protected in every decision.
2. **Multi-tenancy & isolation** — every tenant (`Org`) is cryptographically and logically
   isolated. Cross-tenant leakage is a Sev-1.
3. **Integration breadth** — payouts, messaging, auth, e-commerce, CRM, and analytics are
   all swappable adapters. We win by integrating with everything.
4. **Trust & safety** — fraud screening, audit logging, and reward holds are first-class,
   not afterthoughts.
5. **Premium experience** — the UI is a differentiator: bento layouts, dark/light, motion,
   accessibility.

## Three-horizon strategy

| Horizon | Focus | Examples |
| --- | --- | --- |
| **H1 — Now** | Harden the core engine, ship audit log, stabilize API | Audit log, rate limiting, Postgres path |
| **H2 — Next** | Industry packs, marketplace, deeper analytics | Vertical templates, AB testing UI, cohort analytics |
| **H3 — Later** | AI-native growth, self-optimizing campaigns | AI campaign recommendations, anomaly detection |

See the full [product roadmap](../roadmap/README.md).

## What we will not do

- We will **not** fork the engine per customer. Everything is config + adapters.
- We will **not** store secrets in code or plaintext credentials anywhere.
- We will **not** ship breaking changes to the public API without versioning + migration.
- We will **not** let a feature merge without docs and tests.
