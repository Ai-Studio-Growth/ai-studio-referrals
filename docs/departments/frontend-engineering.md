# Department — Frontend Engineering

## Mission

Deliver the premium, accessible, multi-tenant UI across every role surface — platform
console, advertiser admin, referrer dashboard, marketing, and onboarding — fast, responsive,
and white-label aware.

## Responsibilities

- Build and maintain the App Router route groups and their pages.
- Implement role-scoped UI honoring RBAC (super_admin / advertiser / referrer).
- Wire UI to server actions and the API; handle loading, error, and empty states.
- Implement white-label theming (`Org.logoUrl`, `brandColor`, `accentColor`).

## Owned modules

- `src/app/(app)/**`, `src/app/(platform)/**`, `src/app/(auth)/**`, `src/app/(marketing)/**`
  (page composition; marketing copy co-owned with Product/Docs).
- `src/app/join/**`, `src/app/community/**`, `src/app/profile/**`.
- `src/app/layout.tsx`, `src/components/*-shell.tsx`, `src/components/providers.tsx`.
- Feature components in `src/components/**` (with UI/UX owning the design-system primitives).

## Coding responsibilities

- React Server/Client components, page layouts, client interactivity.
- Form wiring to server actions; client-side validation mirroring server rules.
- Accessibility implementation (semantic markup, focus, reduced-motion).

## Review responsibilities

- Review all changes under `src/app/**` page/layout files and `src/components/**`.
- Verify RBAC guards on every protected page (defense in depth with middleware).
- Verify no secrets or server-only logic leak into client components.

## Escalation rules

- Design-token or primitive changes → UI/UX review required.
- Data-shape needs from the API → request via Backend; do not reach around the API.
- Auth-gated routing changes → Security review.

## Restricted areas (require approval)

Auth/session/middleware, database schema, and the design-token layer
(`src/app/globals.css`, `tailwind.config.ts`) — UI/UX owns tokens.
