# Git Workflow

Owner: DevOps. The end-to-end mechanics. Rules: [git standards](../standards/git-standards.md);
model: [branching strategy](../standards/branching-strategy.md).

## Branches

- `main` — production, always releasable, tagged.
- `develop` — integration, next release.
- `feature/*`, `fix/*` — from `develop`, back to `develop`.
- `release/*` — from `develop`, to `main`, back-merged to `develop`.
- `hotfix/*` — from `main`, to `main`, back-merged to `develop`.
- Department prefixes (`arch/*`, `sec/*`, `ops/*`, `perf/*`, `qa/*`, `docs/*`) per the
  [employee directory](../employees/README.md).

## Day-to-day flow

```
1. git checkout develop && git pull
2. git checkout -b feature/<area>-<slug>
3. ... commit in small, conventional commits ...
4. git push -u origin feature/<area>-<slug>
5. open PR → develop  (use the PR template)
6. address reviews from the required owners (code-ownership map)
7. CI green + required approvals → squash-or-merge to develop
8. delete the branch
```

## Pull Request process

1. Open against `develop` with the [PR template](pull-request-template.md). Link the spec.
2. **Self-review first.** Then request the **owners** of every touched path (code-ownership
   map) — including mandatory co-reviewers (Security for auth, Architecture for contracts,
   etc.).
3. Reviewers respond within one business day. Blocking concerns → "request changes".
4. Resolve all threads; keep CI green.
5. Merge when all required approvals are in. No self-merge of unreviewed code.

## Merge strategy

- **Feature → develop:** squash merge (clean, one logical change per PR).
- **release → main** and **hotfix → main:** merge commit (preserve the release boundary).
- **Back-merge main → develop:** merge commit, same day as release/hotfix.
- Never force-push shared branches. Rebase only your own feature branch.

## Versioning & tagging

See [versioning](../releases/versioning.md). Releases are annotated tags `vX.Y.Z` on `main`.
