# Organization Chart

```
                          ┌─────────────────────────┐
                          │     Executive Office     │
                          │  CTO · VP Eng · Chief     │
                          │  Architect                │
                          └────────────┬─────────────┘
                                       │
   ┌───────────────┬───────────────┬───┴───────────┬───────────────┬───────────────┐
   │               │               │               │               │               │
┌──┴───┐      ┌────┴────┐    ┌──────┴─────┐   ┌─────┴────┐    ┌──────┴─────┐  ┌──────┴─────┐
│Product│      │Software │    │  Backend   │   │ Frontend │    │     AI     │  │  DevOps    │
│  Mgmt │      │ Arch.   │    │ Engineering│   │   Eng.   │    │ Engineering│  │            │
└───────┘      └─────────┘    └────────────┘   └──────────┘    └────────────┘  └────────────┘

   ┌───────────────┬───────────────┬───────────────┬───────────────┬───────────────┐
   │               │               │               │               │               │
┌──┴───┐      ┌────┴────┐    ┌──────┴─────┐   ┌─────┴────┐    ┌──────┴─────┐  ┌──────┴─────┐
│Security│     │   QA    │    │Documentation│  │  UI/UX   │    │Performance │  │Integrations│
│        │     │         │    │             │  │          │    │Engineering │  │            │
└────────┘     └─────────┘    └─────────────┘  └──────────┘    └────────────┘  └────────────┘

                          ┌─────────────────────────┐
                          │ Customer Success Eng.    │
                          └─────────────────────────┘
```

## Reporting lines

| Department | Reports to | Lead role |
| --- | --- | --- |
| Executive Office | Board / Founder | CTO (EXE-001) |
| Product Management | Executive Office | Head of Product (PM-001) |
| Software Architecture | Executive Office | Chief Architect (ARC-001) |
| Backend Engineering | Software Architecture | Backend Lead (ENG-001) |
| Frontend Engineering | Software Architecture | Frontend Lead (FE-001) |
| AI Engineering | Software Architecture | AI Lead (AI-001) |
| DevOps | Executive Office | DevOps Lead (OPS-001) |
| Security | Executive Office | Security Lead (SEC-001) |
| QA | Executive Office | QA Lead (QA-001) |
| Documentation | Product Management | Docs Lead (DOC-001) |
| UI/UX | Product Management | Design Lead (UX-001) |
| Performance Engineering | Software Architecture | Performance Lead (PERF-001) |
| Integrations | Software Architecture | Integrations Lead (INT-001) |
| Customer Success Engineering | Executive Office | CSE Lead (CSE-001) |

## Councils (cross-functional)

- **Architecture Council** — Chief Architect + all department leads. Approves ADRs,
  resolves cross-module disputes, owns the [architecture standards](../standards/architecture-standards.md).
- **Security Council** — Security Lead + Backend Lead + DevOps Lead. Owns threat model and
  incident response.
- **Release Council** — VP Eng + QA Lead + DevOps Lead + Docs Lead. Approves releases per
  the [release process](../standards/release-process.md).

See full roster in the [employee directory](../employees/README.md).
