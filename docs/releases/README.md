# Releases

Owner: VP Engineering. How we version, tag, and record what shipped.

- **Process:** [standards/release-process.md](../standards/release-process.md)
- **Strategy & cadence:** [roadmap/release-strategy.md](../roadmap/release-strategy.md)
- **Versioning:** [versioning.md](versioning.md)
- **Changelog:** [changelog.md](changelog.md)

## At a glance

```
feature/* ─► PR ─► main ─► (optional release/X.Y.Z) ─► tag vX.Y.Z ─► deploy
```

A release is approved by the **Release Council** (VP Eng + QA + DevOps + Docs) only when the
[Definition of Done](../standards/definition-of-done.md) holds and CI is green.
