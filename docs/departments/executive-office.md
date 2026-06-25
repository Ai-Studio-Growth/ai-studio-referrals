# Department — Executive Office

## Mission

The Executive Office owns the **engineering operating system** itself: the standards,
councils, and decision processes that let hundreds of contributors work in one repository
without losing quality or coherence. It does not ship features; it makes feature delivery
fast, safe, and consistent.

## Responsibilities

- Define and evolve the company [vision & strategy](../company/vision-mission.md).
- Own this `/docs` operating system and approve changes to it.
- Chair the Architecture, Security, and Release councils.
- Approve [ADRs](../architecture/overview.md#architecture-decision-records-adrs) that change
  cross-cutting architecture.
- Resolve cross-department ownership disputes.
- Own headcount/role design — the [employee directory](../employees/README.md) structure.

## Owned modules

- `docs/` (this operating system) — primary owner.
- Root-level governance files: `README.md` (product), `.gitattributes`, repo settings.

> The Executive Office owns *process and structure*, not application code. It reviews but
> does not author feature modules.

## Coding responsibilities

- Repository governance config (CI policy, branch protection, CODEOWNERS).
- Templates: PR template, sprint template, ADR template.

## Review responsibilities

- Final approval on changes to `docs/standards/**` and `docs/architecture/**`.
- Tie-breaking review on any change touching two or more departments' owned modules.

## Escalation rules

- Escalation terminus: disputes that no council can resolve land here.
- Sev-1 incidents (security breach, cross-tenant leak, data loss) are reported to the
  Executive Office immediately and trigger [incident response](../security/standards.md#incident-response).
