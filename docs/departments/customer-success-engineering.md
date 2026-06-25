# Department — Customer Success Engineering

## Mission

Be the engineering bridge to customers: build the tooling that lets us onboard tenants,
debug their issues safely, and turn support signal into product improvements — without ever
crossing tenant data boundaries.

## Responsibilities

- Own internal support/debugging tooling and runbooks.
- Own tenant onboarding flows and the self-service quality bar (signup → first campaign).
- Triage customer-reported issues, reproduce them, and route to the owning department.
- Own the community and in-app help feedback loop.

## Owned modules

- `src/app/community/**`, `src/components/community-composer.tsx` (with Frontend).
- Onboarding paths: `src/app/(auth)/signup/**` flow quality (with Security + Frontend).
- Support runbooks under `docs/` (operational guides).
- Read-only diagnostic views in the platform console (with Frontend; Security-reviewed for
  tenant isolation).

## Coding responsibilities

- Support tooling, diagnostic read-only views, runbooks.
- Onboarding UX glue and self-service guardrails.

## Review responsibilities

- Review onboarding and community changes for clarity and safety.
- Verify any diagnostic tool is read-only and tenant-scoped (no cross-tenant exposure).

## Escalation rules

- Reproduced customer bug → file with owning department, attach repro + audit trail.
- Any tool that could read across tenants → **Security review mandatory** before merge.
- Recurring customer pain → feed to Product for roadmap consideration.
