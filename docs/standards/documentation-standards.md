# Documentation Standards

Owner: Documentation.

## The rule

**If behavior changes, docs change in the same PR.** Documentation reviews can block a merge
that ships behavior without updating docs.

## What to document

- **Public surface**: API endpoints, request/response shapes, the embeddable widget, env vars.
- **Architecture**: any ADR-worthy change updates `docs/architecture/**`.
- **Modules**: a new module gets an entry in the [module map](../architecture/module-map.md)
  and the [code-ownership map](../employees/README.md#code-ownership-map).
- **Operating system**: changes to standards/workflows update the relevant `docs/` file.

## Style

- Markdown. Concise, scannable: tables over prose where it helps.
- **Link, don't duplicate.** One source of truth per fact; cross-link the rest.
- Code references are clickable relative paths with optional line suffix —
  e.g. `[audit.ts](../../src/lib/audit.ts)`. Verify they resolve.
- Use the product's real terms (`Org`, `EndUser`, `Conversion`, …). Match the README.
- Absolute dates, not relative ("2026-06-25", not "today").

## Structure

- Every department charter follows the shared template (mission → responsibilities → owned
  modules → coding → review → escalation).
- Every standard names its owner at the top.
- The `docs/README.md` index links everything; new docs get an index entry.

## Review

- Documentation reviews every PR's doc diff for accuracy and dead links.
- Stale docs are a defect: when you touch a module, fix the docs you notice are wrong.
