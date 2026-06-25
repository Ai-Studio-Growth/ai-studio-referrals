# Release Process

Owner: VP Engineering. Approved by the **Release Council** (VP Eng + QA + DevOps + Docs).
Trunk-based: we release by **tagging `main`**. See also [releases/](../releases/README.md) and
[versioning](../releases/versioning.md).

## Versioning

- **Semantic Versioning** `MAJOR.MINOR.PATCH` (currently `0.1.0`).
  - MAJOR: breaking change to public API / DB contract (requires ADR + migration).
  - MINOR: backward-compatible feature.
  - PATCH: backward-compatible fix.

## Release flow

```
feature/* ─► PR ─► main ─► (optional release/X.Y.Z for stabilization) ─► tag vX.Y.Z ─► deploy
```

## Steps

1. **Stabilize.** `main` is always releasable. If last-mile hardening is needed without
   freezing the trunk, cut an optional `release/X.Y.Z` from `main` for fixes/docs/version bump.
2. **Gate (Release Council):**
   - DevOps: green CI (`Typecheck & build`) + lint + tests.
   - QA: acceptance criteria covered, no open Sev-1/Sev-2.
   - Security: no unresolved security findings.
   - Docs: changelog + docs updated.
3. **Bump & changelog.** Update `package.json` version and
   [`CHANGELOG`](../releases/changelog.md).
4. **Tag.** Tag `vX.Y.Z` (annotated) on `main` (after merging the `release/*` branch, if used).
5. **Deploy.** DevOps runs `prisma migrate deploy` then ships. Verify health.
6. **Post-release.** Monitor; any urgent issue → `hotfix/*` (PR straight back to `main`).

## Hotfixes

Branch `hotfix/X.Y.(Z+1)` from `main`, fix, gate (abbreviated), open an expedited PR to `main`,
tag, and deploy.

## Rollback

Every release is a tag; rollback = redeploy the previous tag. DB migrations must be
backward-compatible so a redeploy of the prior version is safe (see
[database standards](database-standards.md)).
