# Branching Strategy

Owner: DevOps. A trunk-based-with-release-branches model.

## Long-lived branches

| Branch | Purpose | Protection |
| --- | --- | --- |
| `main` | Production. Always releasable. Tagged per release. | Protected; PR + green CI + Release Council |
| `develop` | Integration. Next release accumulates here. | Protected; PR + green CI + owner review |

## Short-lived branches

| Pattern | From → into | Used by |
| --- | --- | --- |
| `feature/<area>-<slug>` | `develop` → `develop` | Feature work (e.g. `feature/referral-tiers`) |
| `fix/<area>-<slug>` | `develop` → `develop` | Non-urgent bug fixes |
| `release/<version>` | `develop` → `main` (+ back-merge to `develop`) | Release stabilization |
| `hotfix/<version>` | `main` → `main` (+ back-merge to `develop`) | Urgent production fixes |
| `arch/*`, `sec/*`, `ops/*`, `perf/*`, `qa/*`, `docs/*` | `develop` → `develop` | Dept-specific work (see [employee directory](../employees/README.md)) |

> The branch you start on dictates ownership. Branch prefixes map to departments in the
> employee directory — use your assigned prefix.

## Flow

```
feature/* ─┐
fix/*     ─┼─► develop ─► release/x.y.z ─► main ─► tag vX.Y.Z
arch/* …  ─┘                   │                      │
                               └──── back-merge ──────┴──► develop
hotfix/* ─────────────────────────────► main ─► tag, back-merge ► develop
```

## Rules

- Branch from the correct base (`develop` for features, `main` for hotfixes).
- Keep branches short-lived; rebase on `develop` frequently to reduce drift.
- Delete branches after merge.
- A release branch is feature-frozen — only fixes, docs, and version bumps.
- Hotfixes are the only path to `main` outside a release; they must be back-merged to
  `develop` the same day.
