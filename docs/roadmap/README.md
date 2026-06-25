# Product Roadmap

Owner: Product Management. This is the source of truth for where Ai Studio Referrals is going.

## Vision & Mission

See [vision & mission](../company/vision-mission.md). In short: **make word-of-mouth growth
programmable** for any business, delivered by a self-managing engineering org.

## Core modules (today, v0.1)

| Module | Status | Owner |
| --- | --- | --- |
| Config-driven campaign engine | ✅ shipped | Backend |
| Codes, clicks, attribution | ✅ shipped | Backend |
| Fraud screening | ✅ shipped | AI + Backend |
| Reward resolution (double-sided, milestones) | ✅ shipped | Backend |
| Payout adapters | ✅ shipped | Integrations |
| Multi-tenant auth + RBAC | ✅ shipped | Security |
| Public REST API + widget | ✅ shipped | Backend |
| Platform console (super_admin) | ✅ shipped | Frontend |
| Analytics (funnel, K-factor, CAC) | ✅ shipped | Backend |
| In-app notifications | ✅ shipped | Backend/Frontend |
| **Audit log** | 🚧 in progress (`feat/audit-log`) | Backend/Security |

## Sub-documents

| Doc | What |
| --- | --- |
| [version-roadmap.md](version-roadmap.md) | Versioned plan v0.1 → v1.0+ |
| [growth-strategy.md](growth-strategy.md) | How we grow the product & adoption |
| [release-strategy.md](release-strategy.md) | Cadence and train model |
| [module-dependencies.md](module-dependencies.md) | Build order & dependency graph |
| [industry-packs.md](industry-packs.md) | Vertical config templates |
| [marketplace-strategy.md](marketplace-strategy.md) | Adapter & template marketplace |
| [ai-strategy.md](ai-strategy.md) | AI-native growth features |

## Three horizons

- **H1 (Now):** harden core — finish audit log, durable rate limiting, Postgres path, test
  coverage.
- **H2 (Next):** industry packs, A/B testing UI, cohort analytics, marketplace v1.
- **H3 (Later):** AI-native growth — campaign recommendations, anomaly detection,
  self-optimizing rewards.
