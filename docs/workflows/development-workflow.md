# Development Workflow

Owner: Software Architecture. Every feature passes through these stages. **No feature is
complete until every applicable stage passes** (see
[Definition of Done](../standards/definition-of-done.md)).

## The 11 stages

| # | Stage | Gatekeeper | Pass criteria |
| --- | --- | --- | --- |
| 1 | **Product Review** | Product (PM-001) | Clear spec + acceptance criteria; config-driven (no engine fork) |
| 2 | **Architecture Review** | Architecture (ARC-001) | Fits boundaries; ADR if it touches a shared contract |
| 3 | **Database Review** | Architecture (ARC-002) | Schema change reviewed; migration planned; `orgId`-scoped |
| 4 | **Security Review** | Security (SEC-001) | Authn/z, secrets, tenant isolation, audit verified |
| 5 | **Backend Development** | Backend (ENG-001) | Engine/API logic; idempotent; validated; audited |
| 6 | **Frontend Development** | Frontend (FE-001) | UI built from primitives; RBAC-guarded; a11y |
| 7 | **AI Integration** | AI (AI-001) | If applicable: behind interface, explainable, fallback |
| 8 | **QA** | QA (QA-001) | Tests proportional to risk; acceptance criteria covered; green |
| 9 | **Performance Review** | Performance (PERF-001) | Within budget; paginated & indexed; hot paths checked |
| 10 | **Documentation** | Docs (DOC-001) | Docs/README/API/module map updated in the PR |
| 11 | **Release Approval** | Release Council | DoD holds; CI green; changelog updated |

> Not every feature needs every stage (e.g. a docs-only change skips 3/5/6/7/9), but the
> **gatekeeper decides** whether their stage applies — authors don't skip stages unilaterally.

## Flow

```
Product ─► Architecture ─► Database ─► Security ─┐
                                                 ▼
        Backend ─► Frontend ─► AI ─► QA ─► Performance ─► Documentation ─► Release
```

## Rules

- A stage can send work back. Address the feedback; don't re-request verbatim.
- Cross-department changes need the owning department's review at the relevant stage.
- Security and Architecture hold veto where their standards are at stake.
- Track stage status on the PR (checklist in the [PR template](pull-request-template.md)).
