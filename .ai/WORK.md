Current focus:

- HANDOFF: fresh orchestrator session takes over — read
  .ai/plans/2026-07-15-alpha-handoff.md first
- Phase 1.1 is planned + amended, NOT reviewed or implemented (first
  review attempt died to a session limit; rerun before implementing)

Done:

- Phase 0: repo reset, founding plan, `.ai/` skeleton (2026-07-15)
- Phase 1: `@ianrios/brickwall` — built, verified, tested by Ian and
  ratified with the name (2026-07-15)

Not in scope right now:

- Phases 2–5 (drift harness, baseline/scaffolder, workflow kit, migration)
- Agent governance validators (roadmap only)
- Publishing to npm (dogfood via workspace/pack first)
- Preset layer (brickwall/multiband/soft modes) — future phase
- Docs site (README/docs-in-repo first; Pages/Starlight later if ever)

Open questions:

- Standalone publish order (Ian: no preference yet)
- Rename `exemptDirs` → `archiveDirs` pre-publish? (taxonomy honesty;
  see Phase 1.1 plan amendments)
- Suspicious-ignore heuristic vs future janitor agent (see BACKLOG.md)
