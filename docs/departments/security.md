# Department — Security

## Mission

Protect tenants, users, money, and data. Own authentication, sessions, RBAC, secret
handling, fraud-policy guardrails, the audit trail, and incident response. Security has
veto power over any change that weakens the platform's safety.

## Responsibilities

- Own authentication, password hashing, sessions, and the edge/app two-layer guard.
- Own RBAC: the three roles (super_admin / advertiser / referrer) and per-area access.
- Own the threat model, security standards, and incident response.
- Own the **audit log** as a control (Backend implements writes; Security owns the policy
  that every state transition is audited).
- Run the Security Review gate.

## Owned modules

- `src/lib/auth.ts`, `src/lib/auth-actions.ts`, `src/lib/password.ts`, `src/lib/session.ts`
  — primary owner.
- `src/middleware.ts` — primary owner (edge guard).
- `src/app/(auth)/**` (auth flows; UI co-owned with Frontend).
- RBAC enforcement points across `(app)`, `(platform)` layouts (review authority).
- Audit policy over `src/lib/audit.ts` (Backend implements; Security approves).

## Coding responsibilities

- Auth, session, password, and middleware code.
- Security headers, CSRF/same-origin enforcement, rate-limit policy for auth.
- Brute-force lockout and constant-time verification logic.

## Review responsibilities

- **Mandatory review** on any change to auth, sessions, RBAC, middleware, or secret handling.
- Review any new data path for tenant isolation and least privilege.
- Review every endpoint for authn + authz + input validation (zod) + audit.

## Escalation rules

- Suspected breach, cross-tenant leak, or credential exposure → **Sev-1**, invoke
  [incident response](../security/standards.md#incident-response), notify Executive Office.
- Disagreement on a security tradeoff → Security Council; Security holds veto on merges that
  reduce the security posture.
