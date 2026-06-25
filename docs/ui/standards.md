# UI/UX Standards & Design System

Owner: UI/UX. Frontend composes features from these; do not fork primitives or hardcode
tokens.

## Design tokens

- Tokens (color, radius, depth) are CSS variables in
  [`globals.css`](../../src/app/globals.css) and [`tailwind.config.ts`](../../tailwind.config.ts).
- **Never hardcode colors** in feature code. Use tokens so light/dark and white-label theming
  work everywhere.
- White-label per org via `Org.logoUrl`, `brandColor`, `accentColor`, `customDomain`.

## Visual language

- Bento-grid layout, soft glassmorphism, tasteful gradients, rounded geometry.
- Full **dark/light** mode (toggle in every shell). Respect `prefers-reduced-motion`.
- Micro-interactions: count-up stats, confetti on copy/convert, hover states, skeleton
  loaders. Motion is additive, never required to understand the UI.

## Accessibility (WCAG-minded)

- Sufficient contrast in both themes; verify token pairs.
- Semantic HTML, keyboard navigability, visible focus, labelled controls.
- Honor `prefers-reduced-motion` — gate animations behind it.
- Mobile-responsive: collapsible drawers, touch targets ≥ 44px.

## Components

- Primitives live in [`src/components/ui.tsx`](../../src/components/ui.tsx) — owned by UI/UX.
- Need a new primitive? UI/UX designs it once and shares it. No one-off duplicates (a
  duplicate is a review-blocking defect).
- Feature components compose primitives; they live in `src/components/**` (Frontend) and use
  tokens only.

## Review

UI/UX reviews token, primitive, and `tailwind.config.ts` changes, and checks contrast, focus,
reduced-motion, and white-label correctness on new UI.
