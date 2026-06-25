# AI Strategy

Owner: AI Engineering. Make the platform intelligent without compromising tenant isolation,
explainability, or the config-driven core.

## Principles

- **AI is an adapter, not the engine.** Models sit behind interfaces and can be swapped or
  turned off; a deterministic baseline always works.
- **Explainable by default.** Every automated decision records its reason in the `AuditLog`.
- **Tenant-safe.** No inference or training crosses tenant boundaries without explicit
  Security + Privacy review.
- **Reversible where money is involved.** AI may *recommend*; money actions stay auditable and
  reversible (Backend + Security co-review).
- **Latest models.** Default to the latest Claude models; see the
  [coding standards](../standards/coding-standards.md#external-services).

## Roadmap of AI features

| Feature | Horizon | What |
| --- | --- | --- |
| **Fraud model upgrade** | v0.6 | Move fraud screening from heuristics to a scored model behind the existing `fraud.ts` interface; keep deterministic fallback |
| **Campaign recommendations** | v0.6 | Suggest trigger/reward/eligibility config from a tenant's historical performance |
| **Anomaly detection** | v0.6 | Flag conversion/click anomalies (sudden velocity, geo shifts) to the fraud queue |
| **Reward optimization** | H3 | Recommend reward levels that maximize K-factor within budget |
| **Self-optimizing campaigns** | H3 | Auto-tune A/B variants within guardrails (human-approved) |

## Guardrails

- Feature-flagged; off → baseline behavior unchanged.
- Human-in-the-loop for any money-affecting or campaign-changing action.
- All AI decisions audited and explainable; subject to the
  [AI Engineering charter](../departments/ai-engineering.md) review rules.
