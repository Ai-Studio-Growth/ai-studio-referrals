# Git Workflow

Owner: DevOps. The end-to-end mechanics. Rules: [git standards](../standards/git-standards.md);
model: [branching strategy](../standards/branching-strategy.md). **Trunk-based on `main`.**

## Branches

- `main` — the trunk; always releasable, tagged per release.
- `feature/*`, `fix/*` — from `main`, back to `main` via PR.
- `hotfix/*` — from `main`, expedited PR back to `main`.
- `release/*` — optional stabilization branch cut from `main`, merged back and tagged.
- Department prefixes (`arch/*`, `sec/*`, `ops/*`, `perf/*`, `qa/*`, `docs/*`) per the
  [employee directory](../employees/README.md).

## Day-to-day flow

```
1. git checkout main && git pull
2. git checkout -b feature/<area>-<slug>
3. ... commit in small, conventional commits ...
4. git push -u origin feature/<area>-<slug>
5. open PR → main  (use the PR template)
6. address reviews from the required owners (code-ownership map)
7. CI green + reviews resolved → squash-merge to main
8. delete the branch
```

## Pull Request process

1. Open against `main` with the [PR template](pull-request-template.md). Link the spec.
2. **Self-review first.** CODEOWNERS auto-requests the **owners** of every touched path
   (code-ownership map) — including mandatory co-reviewers (Security for auth, Architecture
   for contracts, etc.).
3. Reviewers respond within one business day. Blocking concerns → "request changes".
4. Resolve all threads; keep CI green.
5. Merge when reviews are resolved. (On the Free plan CODEOWNERS review is advisory, not
   enforced — see [github-org.md](../company/github-org.md); don't self-merge unreviewed code.)

## Merge strategy

- **Feature/fix → main:** squash merge (clean, one logical change per PR).
- **release → main** and **hotfix → main:** merge commit (preserve the release boundary).
- Never force-push `main`. Rebase only your own feature branch.

## Versioning & tagging

See [versioning](../releases/versioning.md). Releases are annotated tags `vX.Y.Z` on `main`.
