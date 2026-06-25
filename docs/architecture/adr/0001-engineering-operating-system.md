# ADR-0001: Establish the engineering operating system

- Status: Accepted
- Date: 2026-06-25
- Deciders: Executive Office (CTO), Architecture Council

## Context

Ai Studio Referrals is a production-grade, multi-tenant, config-driven referral platform with
a substantial existing architecture (referral engine, adapters, multi-tenant auth, public API,
premium UI). The organization needs to scale to many contributors — human and AI — without
eroding code quality, architectural integrity, or the config-driven core. Ad-hoc process does
not scale and risks engine forks, breaking changes, tenant-isolation regressions, and
duplicated code.

## Decision

Establish a documentation-first **engineering operating system** under `docs/`, comprising:

- **14 departments** with charters (mission, responsibilities, owned modules, coding/review
  responsibilities, escalation).
- An **employee directory** (AI workforce) with explicit branch, code, and review ownership,
  and a path-level **code-ownership map**.
- A **standards rulebook** (coding, architecture, database, API, git, branching, security,
  performance, testing, documentation, release, review, Definition of Done).
- **Architecture docs** (overview, module map, data flow) and this **ADR** process.
- A **roadmap** (vision, versions, growth, industry packs, marketplace, AI strategy).
- **Workflows** (git, 11-stage development workflow, sprint management, AI workforce rules,
  PR template).

The operating system **extends** the repository (new `docs/` tree) and changes **no** existing
application code.

## Consequences

- Every contributor has an unambiguous source of truth for ownership, standards, and process.
- Reviews route by the code-ownership map; sensitive paths (auth, schema, money, contracts)
  get mandatory co-reviewers and, where relevant, departmental veto.
- Changing architecture or shared contracts now requires an ADR — slightly more ceremony, but
  it protects the config-driven core and backward compatibility.
- The operating system itself is versioned and evolves only via PR + Architecture Council
  (and Executive Office for the operating-system docs).

## Alternatives considered

- **Lightweight CONTRIBUTING.md only** — rejected: insufficient to encode ownership,
  multi-department review routing, and the config-driven guardrails at the needed fidelity.
- **Tooling-enforced policy first (CODEOWNERS, CI) without docs** — rejected: enforcement
  without a written rationale produces cargo-cult compliance. Docs come first; CODEOWNERS and
  CI are generated *from* this operating system (DevOps owns that follow-up).
