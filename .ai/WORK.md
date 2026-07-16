Current focus:

- NEXT SESSION: interview-first — read
  .ai/plans/2026-07-16-interview-handoff.md before anything else
- ALPHA REACHED (2026-07-16): Phase 1.1 landed, brickwall dogfooded in
  petal + ianrios.github.io, snapshot flow verified, CI workflow in.
  Publish: Ian decided NEITHER yet (2026-07-16) — keep vendored tarballs
  until the friction backlog shrinks; commands live in
  .ai/completed/2026-07-16-alpha-plumbing.md when wanted.

Done:

- Phase 0: repo reset, founding plan, `.ai/` skeleton (2026-07-15)
- Phase 1: `@ianrios/brickwall` — built, verified, Ian-ratified (2026-07-15)
- Phase 1.1: warnings channel, exemptFiles on code-size, `--all` audit,
  `archiveDirs` rename, new default ignores; `--json` now
  `{ violations, warnings }` (breaking, in README changelog) (2026-07-15)
- Walker fix: unstaged deletions crashed readAll — found live in petal,
  fixed + regression test (d2277f4). 97 tests.
- Dogfood petal (petal f5575d0): scripts deleted, tarball dep, 4-line
  config, all gates green, no budget raised (2026-07-15)
- Dogfood ianrios.github.io (b27ab5a): structural checks → brickwall
  (scss 600 map; data.ts/adminData.ts as visible exemption-debt — the
  ratified case working); 13 drift checks stay in trimmed validate.ts;
  all gates + break-tests green, no budget raised (2026-07-16)
- Alpha plumbing (885bb75): changesets access=public +
  useCalculatedVersion, publishConfig, alpha changeset, CI workflow
  (node 20/24: install → build → check). Snapshot dry-run produced
  0.1.0-alpha-*; fresh-clone CI simulation green (2026-07-16)

Not in scope right now:

- Phases 2–5 (drift harness, baseline/scaffolder, workflow kit, migration)
- Agent governance validators (roadmap only)
- Preset layer (brickwall/multiband/soft) — future phase
- Docs site (README/docs-in-repo first)

Open questions (dogfood friction = roadmap input; details in archived plans):

- Tag vs snapshot-publish for the alpha (Ian) + publish order (open)
- No "extend defaults" syntax — hypothesized in both migrations, needed
  in NEITHER; keep watching before designing it
- archiveDirs/storyDirs root-prefix-only vs ignoreDirs any-depth bare
  names — asymmetric matching semantics
- Violation messages carry no remediation guidance (petal's script had it)
- Test files escape the eslint-disable ban; README overclaims — should
  the ban be total? (portfolio also skipped tests, petal did not)
- Naive pragma regex flags comments MENTIONING the ban — bit the
  portfolio migration itself; migration docs should warn
- Tarball-in-place updates need fresh add (integrity pins, both pms) —
  snapshot releases are the real fix
- `pnpm add -w` transiently broke petal eslint type resolution until a
  follow-up `pnpm install` — watch for recurrence
- `--all` drowns in stale-artifact noise — BACKLOG janitor-agent evidence
- Per-repo Node engines bit both migrations — USAGE.md agent section
  should say "honor .nvmrc/engines before installing"

Resolved this session: `archiveDirs` rename DONE; suspicious-ignore
heuristic NOT built (janitor agent stays in BACKLOG.md).

Next session input: .ai/specs/cleanup.md — Ian's pre-release cleanup +
design questions (2026-07-16); presets metaphor retracted (BACKLOG.md);
X article consumed into ians-brain.md and discarded per Ian's directive.
