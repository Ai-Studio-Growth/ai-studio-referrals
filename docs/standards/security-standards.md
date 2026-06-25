# Security Standards

Owner: Security. Security has **veto power** over any change that weakens the posture below.
These standards codify what the codebase already does — follow the existing code.

## Authentication

- **Passwords** are hashed with **scrypt** (memory-hard, per-user random salt, constant-time
  verification). Never stored or logged in plaintext. Server-side strength policy enforced.
  See [`src/lib/password.ts`](../../src/lib/password.ts).
- **Sessions**: a 256-bit random token in an **httpOnly, SameSite=Lax, Secure** (prod) cookie.
  Only the **SHA-256 hash** of the token is persisted, so a DB leak can't be replayed.
- **Two-layer guard** (defense in depth): edge [`middleware.ts`](../../src/middleware.ts)
  does a fast cookie-presence check; the app layout does full cryptographic validation via
  `requireSession()`.
- **Brute-force protection**: per-IP+email sliding-window lockout; generic "invalid email or
  password"; constant-time verify even for unknown emails.
- Login/signup/logout are **server actions** (same-origin enforced by Next.js).

## Authorization (RBAC)

- Three roles: `super_admin`, `advertiser`, `referrer`. Each reaches only its own area.
- Authorize on **every** protected page and API route — never rely on the UI hiding a link.
- Cross-tenant access is exclusively in the RBAC-guarded platform console and is audited.

## Tenant isolation

- Every query is `orgId`-scoped. A cross-tenant read outside the console is a **Sev-1**.
- Derive tenant from the session/API key, never from client-supplied `orgId`.

## Secrets

- No secrets in code. All provider config is environment-driven (`.env.example` is the
  contract). Unconfigured adapters fall back to safe console stubs.
- Rotate on exposure; exposure triggers incident response.

## Input & output

- Validate all input at trust boundaries with zod.
- Verify webhook signatures. Treat all inbound data as hostile.
- Never leak internals in errors; fail closed.

## Audit

- Every state transition writes an `AuditLog` row. The audit trail is a security control;
  removing or weakening it requires Security approval.

## Incident response

1. **Detect & declare.** Anyone can declare a Sev-1 (breach, cross-tenant leak, credential
   exposure, data loss). Notify Security Lead + Executive Office.
2. **Contain.** Revoke/rotate affected credentials and sessions; disable the affected path.
3. **Eradicate & recover.** Patch root cause; verify with Security + QA.
4. **Audit & learn.** Reconstruct from the audit log; write a blameless post-mortem; file
   follow-up ADRs/standards changes.

## Review authority

Mandatory Security review on any change to auth, sessions, RBAC, middleware, secret handling,
or tenant-scoping. Security may block a merge that reduces the security posture.
