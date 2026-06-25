# Branching Strategy

Owner: DevOps. **Trunk-based development on `main`.** `main` is the single long-lived branch;
everything else is short-lived and merges back to `main` via PR.

## Long-lived branch

| Branch | Purpose | Protection |
| --- | --- | --- |
| `main` | The trunk. Always releasable. Tagged per release. | PR + green CI + CODEOWNERS review (advisory on the Free plan; see [github-org.md](../company/github-org.md)) |

> There is **no `develop` branch** — we ship from `main`. A `release/*` branch is cut from
> `main` only when a release needs stabilization while `main` keeps moving.

## Short-lived branches

| Pattern | From → into | Used by |
| --- | --- | --- |
| `feature/<area>-<slug>` | `main` → `main` | Feature work (e.g. `feature/referral-tiers`) |
| `fix/<area>-<slug>` | `main` → `main` | Non-urgent bug fixes |
| `hotfix/<version>` | `main` → `main` | Urgent production fixes |
| `release/<version>` | `main` → `main` (tag) | Optional release stabilization |
| `arch/*`, `sec/*`, `ops/*`, `perf/*`, `qa/*`, `docs/*` | `main` → `main` | Dept-specific work (see [employee directory](../employees/README.md)) |

> The branch you start on dictates ownership. Branch prefixes map to departments in the
> employee directory — use your assigned prefix.

## Flow

```
feature/* ─┐
fix/*      ─┼─► PR ─► main ─► tag vX.Y.Z ─► deploy
arch/* …   ─┘                 ▲
hotfix/*  ──────► PR ─────────┘
release/* (optional, cut from main for stabilization) ─► main ─► tag
```

## Rules

- Branch from the latest `main`; rebase on `main` frequently to reduce drift.
- Keep branches short-lived; **one PR = one logical change**. Delete branches after merge.
- Everything reaches `main` through a PR — no direct commits to `main`.
- A `release/*` branch (when used) is feature-frozen: only fixes, docs, and version bumps,
  then tag on `main`.
- Hotfixes branch from `main` and merge straight back via an expedited PR.
