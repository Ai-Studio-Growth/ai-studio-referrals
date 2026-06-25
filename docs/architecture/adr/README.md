# Architecture Decision Records (ADRs)

Owner: Software Architecture. ADRs capture significant, hard-to-reverse decisions. Any change
to architecture, a shared contract (DB schema, public API, `src/lib/config/**` types), a
module boundary, or anything that could break an integrator **requires an ADR** accepted by
the Architecture Council.

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-engineering-operating-system.md) | Establish the engineering operating system | Accepted |

## Process

1. Copy the template below to `NNNN-title.md` (next number).
2. Set status `Proposed`; open a PR; request the Architecture Council.
3. On acceptance, set status `Accepted` and add it to the index above.
4. Superseded decisions link forward (`Superseded by ADR-XXXX`).

## Template

```markdown
# ADR-NNNN: <title>
- Status: Proposed | Accepted | Superseded by ADR-XXXX
- Date: YYYY-MM-DD
- Deciders: <roles>

## Context
What problem, what constraints, what forces.

## Decision
What we will do.

## Consequences
Tradeoffs, migration impact, backward compatibility, what becomes easier/harder.

## Alternatives considered
Options rejected and why.
```
