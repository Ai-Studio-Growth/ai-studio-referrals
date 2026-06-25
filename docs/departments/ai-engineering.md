# Department — AI Engineering

## Mission

Make the platform intelligent: improve fraud detection, power campaign recommendations and
anomaly detection, and build AI-native growth features — always behind clean interfaces,
explainable, and respecting tenant data boundaries.

## Responsibilities

- Own the fraud-scoring logic and its evolution (heuristics today, models tomorrow).
- Build AI-assisted features: campaign config recommendations, reward optimization,
  conversion anomaly detection (see [AI strategy](../roadmap/ai-strategy.md)).
- Define interfaces for any model/provider so they are swappable like other adapters.
- Ensure AI features are explainable and never act on cross-tenant data.

## Owned modules

- `src/lib/referral/fraud.ts` — co-owned with Backend (AI owns scoring strategy; Backend owns
  integration into the conversion pipeline).
- Future `src/lib/ai/**` adapters (recommendations, scoring) — primary owner.

## Coding responsibilities

- Scoring/heuristic logic and, later, model-backed adapters behind interfaces.
- Feature flags and safe fallbacks (AI off → deterministic baseline still works).

## Review responsibilities

- Review changes to fraud scoring and any AI-driven decision path.
- Verify explainability: every automated decision records its reason in the audit log.
- Verify tenant isolation in any data used for inference or training.

## Escalation rules

- A model wants production data → Security + Privacy review mandatory.
- AI decision affects money (rewards/payouts) → Backend + Security co-review; must be
  reversible and audited.

## Standards

When building AI features, default to the latest Claude models and follow the
[claude-api reference](../standards/coding-standards.md#external-services). Provider choice
is an adapter decision, not an engine decision.
