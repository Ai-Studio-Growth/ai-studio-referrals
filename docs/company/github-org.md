# GitHub Organization — ai-studio-growth

Owner: Executive Office + DevOps. Records how AI Studio Growth is structured on GitHub and the
runbook to stand it up. Decision: [ADR-0002](../architecture/adr/0002-github-org-umbrella.md).

## Model

`ai-studio-growth` is the **GitHub organization** (the company). Code is organized
**one repository per product** — not one repo per feature.

```
github.com/ai-studio-growth/
├─ ai-studio-referrals    # this product (transfer of kishore9490/ai-studio-referrals)
├─ marketing-site         # only if it deploys independently
└─ <future products>
```

**When does something get its own repo?** Only when it is an *independently-deployable unit*:
a standalone service (e.g. an AI microservice), a client SDK, the marketing site, or shared
infra/tooling. **App features of an existing product never get their own repo** — they ship as
`Campaign` config + adapters + modules inside that product's repo (see
[architecture standards](../standards/architecture-standards.md)).

## Teams (back the CODEOWNERS handles)

The 14 [departments](../departments/README.md) map 1:1 to GitHub teams. These resolve the
`@ai-studio-growth/<team>` handles in [`.github/CODEOWNERS`](../../.github/CODEOWNERS).

| Team slug | Department | Lead |
| --- | --- | --- |
| `@ai-studio-growth/executive` | Executive Office | EXE-001 |
| `@ai-studio-growth/product` | Product Management | PM-001 |
| `@ai-studio-growth/architecture` | Software Architecture | ARC-001 |
| `@ai-studio-growth/backend` | Backend Engineering | ENG-001 |
| `@ai-studio-growth/frontend` | Frontend Engineering | FE-001 |
| `@ai-studio-growth/ai` | AI Engineering | AI-001 |
| `@ai-studio-growth/devops` | DevOps | OPS-001 |
| `@ai-studio-growth/security` | Security | SEC-001 |
| `@ai-studio-growth/qa` | QA | QA-001 |
| `@ai-studio-growth/documentation` | Documentation | DOC-001 |
| `@ai-studio-growth/ui-ux` | UI/UX | UX-001 |
| `@ai-studio-growth/performance` | Performance Engineering | PERF-001 |
| `@ai-studio-growth/integrations` | Integrations | INT-001 |
| `@ai-studio-growth/customer-success` | Customer Success Engineering | CSE-001 |

## Setup runbook

### 1. Create the organization (web UI — not scriptable)
GitHub does not allow creating an org via API/CLI. Go to
**https://github.com/account/organizations/new**, pick the Free plan, name it
**`ai-studio-growth`**.

### 2. Create the 14 teams (CLI, after the org exists)
```bash
for t in executive product architecture backend frontend ai devops security \
         qa documentation ui-ux performance integrations customer-success; do
  gh api -X POST orgs/ai-studio-growth/teams -f name="$t" -f privacy=closed
done
```

### 3. Transfer this repo into the org (preserves history/issues/PRs/stars)
```bash
gh api -X POST repos/kishore9490/ai-studio-referrals/transfer \
  -f new_owner=ai-studio-growth
```
Then re-point local clones:
```bash
git remote set-url origin https://github.com/ai-studio-growth/ai-studio-referrals.git
```
(The old `kishore9490/...` URL auto-redirects, but update remotes anyway.)

### 4. Wire ownership & protection
- CODEOWNERS already references the team slugs above — it activates once the teams exist.
- Add each team to the repo with the right role (e.g. `architecture`, `security` →
  maintain/admin where appropriate):
  ```bash
  gh api -X PUT orgs/ai-studio-growth/teams/backend/repos/ai-studio-growth/ai-studio-referrals \
    -f permission=push
  ```
- Enable branch protection on `main` and `develop` (require PR, CODEOWNERS review, green CI) per
  the [branching strategy](../standards/branching-strategy.md) and
  [release process](../standards/release-process.md).

### 5. (Optional) Org-level `.github` repo
If a second product appears, create `ai-studio-growth/.github` to share org-wide community
health files (default PR template, profile). Until then, this repo's `.github/` is the source.

## Notes

- The product remains **`ai-studio-referrals`**; the company/org is **`ai-studio-growth`**.
  Don't conflate the two (see [company overview](overview.md)).
- Transferring a repo and creating an org are outward-facing and hard to undo — do them
  deliberately. DevOps owns this runbook.
