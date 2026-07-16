Current focus:

- Alpha session (2026-07-15), driven by
  .ai/plans/2026-07-15-alpha-handoff.md. Queue: dogfood
  ianrios.github.io → alpha plumbing (snapshot version + CI).

Done:

- Phase 0: repo reset, founding plan, `.ai/` skeleton (2026-07-15)
- Phase 1: `@ianrios/brickwall` — built, verified, Ian-ratified (2026-07-15)
- Phase 1.1: warnings channel, exemptFiles on code-size, `--all` audit,
  `archiveDirs` rename, new default ignores; `--json` now
  `{ violations, warnings }` (breaking, noted in README changelog).
  96 tests. Plan folded to .ai/completed/ (2026-07-15).
- Walker fix: unstaged deletions of tracked files crashed readAll
  (ENOENT) — found live in petal, fixed + regression test (d2277f4).
- Dogfood petal (2026-07-15, petal f5575d0): both local scripts deleted;
  tarball dep + 4-line config (storyDirs/archiveDirs). All gates green,
  no budget raised. `--all` there: exit 1 — 38 md vs 25, stale
  gitignored worktree docs, docs/completed sizes, coverage/*
  eslint-disable. Plan + full delta record: .ai/completed/.

Not in scope right now:

- Phases 2–5 (drift harness, baseline/scaffolder, workflow kit, migration)
- Agent governance validators (roadmap only)
- Publishing to npm (dogfood via workspace/pack first)
- Preset layer (brickwall/multiband/soft modes) — future phase
- Docs site (README/docs-in-repo first; Pages/Starlight later if ever)

Open questions (petal friction = roadmap input; details in archived plan):

- Standalone publish order (Ian: no preference yet)
- Tag vs snapshot-publish for the alpha (handoff says: Ian's call)
- No "extend defaults" syntax — adding one ignoreDirs entry means
  restating all 11 defaults
- archiveDirs/storyDirs are root-prefix-only; ignoreDirs bare names
  match any depth — asymmetric matching semantics
- Violation messages carry no remediation guidance (petal's script said
  "use progressive disclosure and consolidate duplicates")
- Test files escape the eslint-disable ban entirely; README overclaims
  ("any code file") — should the ban be total?
- Tarball-in-place updates need a fresh `pnpm add` (lockfile pins the
  integrity hash) — snapshot releases are the real fix
- `pnpm add -w` in petal transiently broke eslint vitest-type resolution
  until a follow-up `pnpm install` — watch whether it recurs
- `--all` usefulness drowns in stale-artifact noise (worktrees,
  coverage) — evidence for the BACKLOG janitor agent

Resolved this session (2026-07-15): `archiveDirs` rename DONE; suspicious-
ignore heuristic NOT built (janitor agent stays in BACKLOG.md).
