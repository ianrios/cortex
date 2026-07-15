Current focus:

- Alpha session (2026-07-15), driven by
  .ai/plans/2026-07-15-alpha-handoff.md. Queue: dogfood petal →
  dogfood ianrios.github.io → alpha plumbing (snapshot version + CI).

Done:

- Phase 0: repo reset, founding plan, `.ai/` skeleton (2026-07-15)
- Phase 1: `@ianrios/brickwall` — built, verified, tested by Ian and
  ratified with the name (2026-07-15)
- Phase 1.1: warnings channel (exemption-debt/stale-exemption),
  exemptFiles on code-size, `--all` full-scope audit, `exemptDirs` →
  `archiveDirs` rename, default ignores += .vscode/.codex/.cursor;
  `--json` now `{ violations, warnings }` (breaking, pre-publish; noted
  in package README changelog). 96 tests. Plan + review record folded to
  .ai/completed/ (2026-07-15). `--all` at repo root exits 1 (archived
  docs over 280, violating test fixture) — expected, the audit working.

Not in scope right now:

- Phases 2–5 (drift harness, baseline/scaffolder, workflow kit, migration)
- Agent governance validators (roadmap only)
- Publishing to npm (dogfood via workspace/pack first)
- Preset layer (brickwall/multiband/soft modes) — future phase
- Docs site (README/docs-in-repo first; Pages/Starlight later if ever)

Open questions:

- Standalone publish order (Ian: no preference yet)
- Tag vs snapshot-publish for the alpha (handoff says: Ian's call)

Resolved this session (2026-07-15): `archiveDirs` rename DONE (reviewer
recommended, Ian had proposed it); suspicious-ignore heuristic NOT built
(reviewer confirmed inverted incentive + false positives; janitor agent
stays in BACKLOG.md).
