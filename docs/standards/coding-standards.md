# Coding Standards

Owner: Software Architecture. Applies to all code in this repository.

## Language & style

- **TypeScript, strict.** No `any` without a written justification comment. Prefer precise
  types and `zod` schemas at trust boundaries (API bodies, webhook payloads, config).
- **Match the surrounding code.** Naming, comment density, and idiom should be
  indistinguishable from neighboring files. The codebase is the style guide.
- **Functional and explicit.** Pure functions for domain logic; side effects at the edges
  (routes, actions, adapters).
- **No magic values.** Constants live in `src/lib/constants.ts` or a local `const`.

## Naming

- Files: kebab-case (`campaign-config.ts`). React components: PascalCase exports.
- Variables/functions: camelCase. Types/interfaces: PascalCase. No Hungarian notation.
- Domain terms match the schema: `Org`, `EndUser`, `Referral`, `Conversion`, `Reward`,
  `Payout`, `FraudFlag`, `AuditLog`.

## Reuse before building

- **Search first.** Before writing a helper, component, or adapter, search for an existing
  one. Duplication is a review-blocking defect.
- Compose features from `src/components/ui.tsx` primitives — don't fork primitives.
- Use existing adapters (`src/lib/adapters/**`) rather than calling providers directly.

## Server vs client

- Default to **Server Components**. Add `"use client"` only when interactivity requires it.
- Never leak server-only logic or secrets into client components.
- Data mutations from the UI go through **server actions** (`*/actions.ts`) or the API —
  never direct DB access from a client component.

## Domain rules (non-negotiable)

- **Scope by `orgId`.** Every query and mutation is tenant-scoped unless it is an explicit,
  RBAC-guarded super_admin cross-tenant view.
- **Idempotency.** Replayable mutations (conversions, webhooks) use idempotency keys.
- **Audit.** Every state transition writes an `AuditLog` row via the engine's audit path.
- **Validate input** with zod at every trust boundary.
- **Money** goes through `src/lib/money.ts`; never do ad-hoc currency math.

## Errors

- Fail closed. On auth/validation failure return generic, non-leaky errors (e.g. "invalid
  email or password").
- Throw typed errors in the domain; translate to HTTP status at the route boundary.
- Never swallow errors silently; log with context (no secrets, no PII in plaintext).

## External services

- All third-party calls go through an adapter with an env-driven config and a safe console
  fallback. No secrets in code.
- **AI/LLM work:** default to the latest Claude models; provider selection is an adapter
  decision. Consult the claude-api reference before integrating.

## Formatting & lint

- `npm run lint` must pass. Respect the repo's ESLint/TS config; do not disable rules
  inline without justification.
- Keep imports ordered; use the `@/` path alias as the codebase does.
