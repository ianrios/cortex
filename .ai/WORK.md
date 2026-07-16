Current focus:

- Alpha session (2026-07-15/16), driven by
  .ai/plans/2026-07-15-alpha-handoff.md. Remaining: alpha plumbing
  (changeset snapshot version + CI workflow; tag-vs-snapshot = Ian).

Done:

- Phase 0: repo reset, founding plan, `.ai/` skeleton (2026-07-15)
- Phase 1: `@ianrios/brickwall` — built, verified, Ian-ratified (2026-07-15)
- Phase 1.1: warnings channel, exemptFiles on code-size, `--all` audit,
  `archiveDirs` rename, new default ignores; `--json` now
  `{ violations, warnings }` (breaking, noted in README changelog).
  Plan folded to .ai/completed/ (2026-07-15).
- Walker fix: unstaged deletions of tracked files crashed readAll —
  found live in petal, fixed + regression test (d2277f4). 97 tests.
- Dogfood petal (petal f5575d0): local scripts deleted; tarball dep +
  4-line config. All gates green, no budget raised. `--all`: exit 1
  (stale worktree docs, completed sizes, coverage pragma hits).
- Dogfood ianrios.github.io (b27ab5a): structural checks → brickwall
  (scss 600 per-extension map; data.ts/adminData.ts as visible
  exemption-debt warnings — the ratified case, works as designed); 13
  drift checks stay in validate.ts (trimmed 288→~180 lines). All gates
  green, drift + structural break-tests fire, no budget raised.
  `--all`: exit 1 — 80 md vs 25, 31 doc-size (completed docs land in
  default tier). Plans + delta records: .ai/completed/.

Not in scope right now:

- Phases 2–5 (drift harness, baseline/scaffolder, workflow kit, migration)
- Agent governance validators (roadmap only)
- Publishing to npm (dogfood via workspace/pack first)
- Preset layer (brickwall/multiband/soft modes) — future phase
- Docs site (README/docs-in-repo first; Pages/Starlight later if ever)

Open questions (dogfood friction = roadmap input; details in archived plans):

- Standalone publish order (Ian: no preference yet)
- Tag vs snapshot-publish for the alpha (handoff says: Ian's call)
- No "extend defaults" syntax for ignoreDirs/exemptFiles — hypothesized
  in both migrations, actually needed in NEITHER (defaults sufficed);
  keep watching before designing it
- archiveDirs/storyDirs are root-prefix-only; ignoreDirs bare names
  match any depth — asymmetric matching semantics
- Violation messages carry no remediation guidance (petal's script had it)
- Test files escape the eslint-disable ban; README overclaims ("any
  code file") — should the ban be total? (portfolio also skipped tests
  there, petal did not)
- Naive pragma regex flags comments MENTIONING the ban — bit the
  migration itself (validate.ts header comment had to be reworded);
  documented-deliberate, but migration docs should warn
- Tarball-in-place updates: pnpm needs fresh `pnpm add` (integrity
  pin); npm same-version repack risks EINTEGRITY/stale cache — snapshot
  releases are the real fix
- `pnpm add -w` in petal transiently broke eslint vitest-type
  resolution until a follow-up `pnpm install` — watch for recurrence
- `--all` drowns in stale-artifact noise (worktrees, coverage, build,
  archived docs in default tier) — evidence for BACKLOG janitor agent
- Per-repo Node engines (petal 24, portfolio 20) — USAGE.md agent
  section should say "honor .nvmrc/engines before installing"

Resolved this session: `archiveDirs` rename DONE; suspicious-ignore
heuristic NOT built (janitor agent stays in BACKLOG.md).
