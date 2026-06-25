# Departments

AI Studio Growth is organized into 14 departments. Each has a charter defining its
**mission, responsibilities, owned modules, coding & review responsibilities, and
escalation rules**. Module ownership here is authoritative — it determines who may merge
changes to which files (see [code ownership](../employees/README.md#code-ownership-map)).

| # | Department | Charter | Lead | Primary owned area |
| --- | --- | --- | --- | --- |
| 1 | Executive Office | [charter](executive-office.md) | CTO (EXE-001) | Operating system, ADRs, councils |
| 2 | Product Management | [charter](product-management.md) | PM-001 | Roadmap, specs, campaign config intent |
| 3 | Software Architecture | [charter](software-architecture.md) | ARC-001 | Architecture, ADRs, shared contracts |
| 4 | Backend Engineering | [charter](backend-engineering.md) | ENG-001 | Referral engine, rewards, fraud, API |
| 5 | Frontend Engineering | [charter](frontend-engineering.md) | FE-001 | App routes, dashboards, components |
| 6 | AI Engineering | [charter](ai-engineering.md) | AI-001 | AI features, fraud scoring, recommendations |
| 7 | DevOps | [charter](devops.md) | OPS-001 | Build, deploy, env, observability |
| 8 | Security | [charter](security.md) | SEC-001 | Auth, sessions, RBAC, secrets, audit |
| 9 | QA | [charter](qa.md) | QA-001 | Test strategy, regression, release gates |
| 10 | Documentation | [charter](documentation.md) | DOC-001 | `/docs`, API docs, READMEs |
| 11 | UI/UX | [charter](ui-ux.md) | UX-001 | Design system, tokens, accessibility |
| 12 | Performance Engineering | [charter](performance-engineering.md) | PERF-001 | Latency, caching, query perf |
| 13 | Integrations | [charter](integrations.md) | INT-001 | Adapters: payouts, messaging, webhooks |
| 14 | Customer Success Engineering | [charter](customer-success-engineering.md) | CSE-001 | Support tooling, debugging, onboarding |

## Charter template

Every department charter follows the same shape so they are comparable and complete:

1. **Mission** — why the department exists, in one paragraph.
2. **Responsibilities** — the ongoing work it owns.
3. **Owned modules** — exact paths in the repo this department is accountable for.
4. **Coding responsibilities** — what this department writes.
5. **Review responsibilities** — what this department must review before merge.
6. **Escalation rules** — when and to whom to escalate.

## Ownership principles

- **One module, one owning department.** Shared files have an explicit primary owner.
- **Cross-module changes require the owning department's review.** No exceptions for
  shared contracts (DB schema, public API, auth, design tokens).
- **Escalation flows up the [org chart](../company/org-chart.md)** and sideways to the
  relevant council for cross-functional disputes.
