# Sprint Management

Owner: VP Engineering. Two-week sprints aligned to the
[release train](../roadmap/release-strategy.md).

## Sprint board columns

`Backlog → Requirements → Architecture → Development → Code Review → QA → Documentation →
Deployment → Done`

A card moves right only when its current column's exit criteria are met (which map to the
[development workflow](development-workflow.md) stages).

## Ceremonies

| Ceremony | When | Output |
| --- | --- | --- |
| Sprint planning | Day 1 | Committed sprint scope from prioritized backlog |
| Daily async standup | Daily | Progress, blockers, plan (written) |
| Backlog refinement | Mid-sprint | Specs ready, estimates, dependencies surfaced |
| Sprint review | Last day | Demo against acceptance criteria |
| Retrospective | Last day | Action items to improve the operating system |

## Sprint template

```markdown
# Sprint <N> — <YYYY-MM-DD> → <YYYY-MM-DD>
**Theme:** <release theme / version>
**Release target:** vX.Y.Z

## Goals
- [ ] <goal 1>

## Committed work
| Card | Owner (employee ID) | Stage | DoD | Notes |
| --- | --- | --- | --- | --- |
| <feature> | ENG-001 | Development | ☐ | |

## Dependencies / risks
- <dependency or risk + mitigation>

## Definition of Done reminder
Every card must satisfy docs/standards/definition-of-done.md before it is Done.
```

## Backlog item template

```markdown
## <title>
- **Requester / dept:** 
- **Problem & value:** 
- **Acceptance criteria:** (testable bullets)
- **Config-driven?** (must be config/adapter, or link an ADR)
- **Affected modules / owners:** (from the code-ownership map)
- **Dependencies:** 
- **Estimate:** 
```

## Estimation

Relative story points (1, 2, 3, 5, 8). Anything ≥ 8 is split. A card with an unresolved
dependency or missing spec stays in Requirements, not Development.
