# Version Roadmap

Owner: Product. Semantic versioning (see [release process](../standards/release-process.md)).

| Version | Theme | Highlights | Status |
| --- | --- | --- | --- |
| **v0.1** | Foundation | Engine, rewards, fraud, RBAC, API, console, analytics, notifications | ✅ current |
| **v0.2** | Trust & observability | Audit log UI, durable (Redis) rate limiting, Postgres migration path, expanded tests | 🚧 |
| **v0.3** | Experimentation | A/B testing UI, cohort & retention analytics, reward simulation | 📋 planned |
| **v0.4** | Verticals | Industry packs (SaaS, e-commerce, fintech), template gallery | 📋 planned |
| **v0.5** | Ecosystem | Marketplace v1 (adapters + templates), partner webhooks | 📋 planned |
| **v0.6** | Intelligence | AI campaign recommendations, fraud-model upgrade, anomaly detection | 📋 planned |
| **v1.0** | GA | SLA-grade reliability, full docs, certified integrations, security audit | 🎯 target |

## Entry/exit criteria per version

- Every version exits only when the [Definition of Done](../standards/definition-of-done.md)
  holds for all its features and the [release gate](../standards/release-process.md) passes.
- MAJOR bumps (breaking API/schema) require an ADR + migration + deprecation window.

## Dependencies

Build order is governed by [module-dependencies.md](module-dependencies.md). Notably:
durable rate limiting and Postgres (v0.2) precede marketplace scale (v0.5); audit log (v0.2)
underpins AI explainability (v0.6).
