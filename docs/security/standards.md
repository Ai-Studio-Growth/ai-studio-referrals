# Security Reference — Threat Model & Incident Response

Owner: Security. The **controls** are in
[standards/security-standards.md](../standards/security-standards.md); this page holds the
**threat model** and **incident response** runbook.

## Threat model (STRIDE-lite)

| Threat | Surface | Mitigation |
| --- | --- | --- |
| **Spoofing** | Login, sessions | scrypt passwords, 256-bit session token (only SHA-256 hash stored), constant-time verify |
| **Tampering** | API, webhooks | zod validation, API-key auth, webhook signature verification |
| **Repudiation** | Any mutation | append-only `AuditLog` on every state transition |
| **Information disclosure** | Multi-tenant data | `orgId` scoping; cross-tenant read = Sev-1; generic errors |
| **Denial of service** | Public API, redirect | per-key token-bucket rate limiting; edge-cached redirect |
| **Elevation of privilege** | RBAC | per-page + per-route authz; two-layer guard (middleware + `requireSession()`) |

## Trust boundaries

- **Client ↔ server**: every server action is same-origin; every API route authenticates and
  validates input.
- **Server ↔ third party**: only via adapters; secrets are env-driven, never in code.
- **Tenant ↔ tenant**: enforced by `orgId` scoping; only the RBAC-guarded platform console
  crosses tenants, and it is audited.

## Incident response

Severity: **Sev-1** = breach, cross-tenant leak, credential exposure, or data loss.

1. **Declare.** Anyone may declare. Notify the Security Lead (SEC-001) and the Executive
   Office immediately.
2. **Contain.** Rotate/revoke affected credentials and sessions; disable the affected path or
   feature flag it off.
3. **Eradicate.** Patch the root cause; Security + QA verify the fix.
4. **Recover.** Restore service; confirm tenant isolation intact.
5. **Reconstruct.** Use the `AuditLog` to establish the timeline and blast radius.
6. **Learn.** Blameless post-mortem within 48h; file follow-up ADRs / standards updates;
   add a regression test.

## Reporting

Security issues are reported privately to the Security Lead, never in a public issue. Do not
include live secrets in reports — reference the audit row.
