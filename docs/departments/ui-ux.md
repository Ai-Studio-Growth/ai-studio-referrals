# Department — UI/UX

## Mission

Own the design language that makes Ai Studio Referrals feel premium: the token system,
component primitives, motion, accessibility, and white-label theming — consistent across
every surface and every tenant brand.

## Responsibilities

- Own the design system: tokens (color, radius, depth), typography, spacing.
- Own accessibility standards (WCAG-minded contrast, focus, `prefers-reduced-motion`).
- Own the component primitive library and its API; Frontend composes features from it.
- Own white-label theming behavior across light/dark and per-org branding.

## Owned modules

- `src/app/globals.css`, `tailwind.config.ts` — **design tokens, primary owner**.
- `src/components/ui.tsx` and shared primitives (buttons, cards, glass, counters, charts
  shells) — primary owner.
- Motion/interaction patterns (`framer-motion`, `canvas-confetti` usage conventions).

## Coding responsibilities

- Token definitions, primitive components, and their variants.
- Accessibility utilities and motion-safe patterns.

## Review responsibilities

- Review any change to tokens, primitives, or `tailwind.config.ts`.
- Verify new UI meets contrast, focus, and reduced-motion requirements.
- Verify white-label correctness (no hardcoded brand colors in feature code).

## Escalation rules

- Feature needs a new primitive → UI/UX designs it once, shared; no one-off duplicates.
- Token change with wide blast radius → Architecture Council notified (visual regression risk).

See the [UI/UX standards](../ui/standards.md).
