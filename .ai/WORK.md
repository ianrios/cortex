Current focus:

- Ian's review of Phase 1 (built, gates green, awaiting his approval —
  gates passing is not done)

In progress:

- (nothing until Phase 1 is ratified)

Done:

- Phase 0: repo reset, founding plan, `.ai/` skeleton (2026-07-15)
- Phase 1 implementation: `@ianrios/brickwall` + monorepo scaffold,
  79 tests, repo passes its own limiter via `pnpm check` (2026-07-15)

Not in scope right now:

- Phases 2–5 (drift harness, baseline/scaffolder, workflow kit, migration)
- Agent governance validators (roadmap only)
- Publishing to npm (dogfood via workspace / github: installs first)

Open questions (all Ian's — see plan's "Open decisions"):

- Ratify `brickwall`; standalone publish order
- Per-file code-size exemptions: allowed config pattern or banned?
- Monorepo config model: root-wide vs per-package
- Default ignore set + CHANGELOG exemption ratification
