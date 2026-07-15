Current focus:

- Phase 1: context limiter engine (`packages/brickwall`)

In progress:

- Monorepo scaffold (pnpm workspace, changesets, vitest)
- Port of portfolio validate.ts structural checks into configurable package

Done:

- Phase 0: repo reset, founding plan, `.ai/` skeleton (2026-07-15)

Not in scope right now:

- Phases 2–5 (drift harness, baseline/scaffolder, workflow kit, migration)
- Agent governance validators (roadmap only)
- Publishing to npm (dogfood via workspace / github: installs first)

Open questions (all Ian's — see plan's "Open decisions"):

- Ratify `brickwall`; standalone publish order
- Per-file code-size exemptions: allowed config pattern or banned?
- Monorepo config model: root-wide vs per-package
- Default ignore set + CHANGELOG exemption ratification
