# Release Process

Owner: VP Engineering. Approved by the **Release Council** (VP Eng + QA + DevOps + Docs).
See also [releases/](../releases/README.md) and [versioning](../releases/versioning.md).

## Versioning

- **Semantic Versioning** `MAJOR.MINOR.PATCH` (currently `0.1.0`).
  - MAJOR: breaking change to public API / DB contract (requires ADR + migration).
  - MINOR: backward-compatible feature.
  - PATCH: backward-compatible fix.

## Release train

```
develop ──► release/X.Y.Z ──► (stabilize) ──► merge to main ──► tag vX.Y.Z ──► deploy
                                                     └──► back-merge to develop
```

## Steps

1. **Cut.** VP Eng creates `release/X.Y.Z` from `develop`. Feature freeze begins.
2. **Stabilize.** Only fixes, docs, version bump on the release branch.
3. **Gate (Release Council):**
   - DevOps: green build + lint + tests in CI.
   - QA: acceptance criteria covered, no open Sev-1/Sev-2.
   - Security: no unresolved security findings.
   - Docs: changelog + docs updated.
4. **Bump & changelog.** Update `package.json` version and
   [`CHANGELOG`](../releases/changelog.md).
5. **Merge & tag.** Merge to `main`, tag `vX.Y.Z` (annotated).
6. **Deploy.** DevOps runs `prisma migrate deploy` then ships. Verify health.
7. **Back-merge.** Merge `main` back into `develop`.
8. **Post-release.** Monitor; any urgent issue → `hotfix/*`.

## Hotfixes

Branch `hotfix/X.Y.(Z+1)` from `main`, fix, gate (abbreviated), tag, deploy, back-merge to
`develop` same day.

## Rollback

Every release is a tag; rollback = redeploy the previous tag. DB migrations must be
backward-compatible so a redeploy of the prior version is safe (see
[database standards](database-standards.md)).
