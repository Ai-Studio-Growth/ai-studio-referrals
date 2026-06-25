# Pull Request Template

Owner: DevOps. Copy this into every PR description. (Also suitable as
`.github/pull_request_template.md`.)

```markdown
## What & why
<One paragraph: what this changes and the problem it solves. Link the spec/issue.>

## Affected modules & owners
<List touched paths and the owning department(s) from the code-ownership map.>

## Type
- [ ] feat  - [ ] fix  - [ ] perf  - [ ] refactor  - [ ] docs  - [ ] test  - [ ] chore  - [ ] sec

## Development workflow stages (check those that apply and pass)
- [ ] 1 Product Review
- [ ] 2 Architecture Review (ADR linked if a shared contract changed)
- [ ] 3 Database Review (migration planned)
- [ ] 4 Security Review
- [ ] 5 Backend Development
- [ ] 6 Frontend Development
- [ ] 7 AI Integration
- [ ] 8 QA
- [ ] 9 Performance Review
- [ ] 10 Documentation
- [ ] 11 Release Approval (at release time)

## Definition of Done
- [ ] Spec & acceptance criteria met
- [ ] Config-driven (no engine fork) or ADR linked
- [ ] Tenant-safe (orgId-scoped); inputs validated (zod)
- [ ] Idempotent where replayable; audited (AuditLog)
- [ ] No secrets in code; auth/RBAC unaffected or Security-approved
- [ ] Reuse-checked (no duplication; boundaries respected)
- [ ] Tests added/updated and green
- [ ] Within performance budget; queries paginated & indexed
- [ ] Docs/README/API/module map updated in this PR
- [ ] Backward compatible (or ADR + migration + version bump)

## How tested
<Commands run, scenarios covered, and the result. Paste relevant output.>

## Screenshots / API samples
<For UI or API changes.>

## Reviewers requested
<Required owners + mandatory co-reviewers per the code-ownership map.>
```
