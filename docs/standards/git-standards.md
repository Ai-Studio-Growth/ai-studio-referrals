# Git Standards

Owner: DevOps. See also the [branching strategy](branching-strategy.md) and
[git workflow](../workflows/git-workflow.md).

## Commits

- **Conventional Commits.** `type(scope): subject` — e.g.
  `feat(notifications): in-app notification center with unread state`.
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `sec`.
- Scope is the module/department area (`referral`, `api`, `ui`, `auth`, `adapters`, …).
- Subject: imperative mood, ≤ 72 chars, no trailing period.
- Body explains **why**, not just what. Reference the issue/spec.

## Commit hygiene

- Small, focused commits. One logical change per commit.
- Never commit secrets, `.env`, or `dev.db` data dumps. `.env.example` is the only env file
  tracked.
- Don't commit generated artifacts or `node_modules`.
- Respect `.gitattributes` (line-ending normalization) — already configured.

## Co-authorship & signing

- AI-authored commits end with the required co-author trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Do not bypass hooks (`--no-verify`) or signing unless explicitly authorized. If a hook
  fails, fix the cause.

## Branches & PRs

- Branch from `develop`; name per the [branching strategy](branching-strategy.md)
  (`feature/…`, `fix/…`, `hotfix/…`, `release/…`).
- One PR = one reviewable unit. Keep diffs focused; unrelated cleanups go in their own PR.
- Never force-push shared branches (`main`, `develop`, `release/*`). Rebase your own feature
  branch only.

## What not to do

- No direct commits to `main` or `develop` — always via PR.
- No history rewrites on shared branches.
- No committing another team's module without their review on the PR.
