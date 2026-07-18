Current focus:

- PHASE 2 DONE (2026-07-17): @ianrios/drift extracted, portfolio's
  validate.ts migrated as first userland consumer (221911f), all
  verdict paths verified live. ADR 0004. Plans archived to completed/.
- Rev 4 config surface DONE + dogfooded: petal 4956a28, portfolio
  2b3c1de, both PUSHED (Ian approved). NEXT: drive-repo dogfooding
  (queue in .ai/specs/dogfood-queue.md), Phase 3 when Ian steers.
- Deferred perf items (do with benchmark evidence): precompile selector
  normalization out of per-file hot loops; merge diff mode's duplicate
  ls-files spawn; audit-shield handling as effective-config.
- Scale MEASURED 2026-07-17 (NDA repos, recorded generically): 31k-file
  non-git monolith full run 4.1s; 2k-file git repo 0.9s. Rust question
  closed by numbers. Dogfood queue: .ai/specs/dogfood-queue.md (public
  half; NDA half lives on the drive per RULES.md).
- ALPHA state (2026-07-16): brickwall dogfooded in petal +
  ianrios.github.io, snapshot flow verified, CI green. Publish: NEITHER
  yet — vendored tarballs until the friction backlog shrinks; commands
  in .ai/completed/2026-07-16-alpha-plumbing.md.

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
- Violation messages carry no remediation guidance (petal's script had it)
- Naive pragma regex flags comments MENTIONING the ban — bit the
  portfolio migration itself; migration docs should warn
- Tarball-in-place updates need fresh add (integrity pins, both pms) —
  snapshot releases are the real fix
- `pnpm add -w` transiently broke petal eslint type resolution until a
  follow-up `pnpm install` — watch for recurrence
- `--all` drowns in stale-artifact noise — BACKLOG janitor-agent evidence
- Per-repo Node engines bit both migrations — USAGE.md agent section
  should say "honor .nvmrc/engines before installing"

Resolved 2026-07-16 (interview; details in session-beta plan): extend
defaults NOT built — replace semantics documented, init writes resolved
arrays; test-file escape from the pragma ban WILL close +
testFilePatterns config (config-surface proposal); changelog cut over
to packages/brickwall/CHANGELOG.md; portfolio's kept scripts confirmed
intentional (Phase 2 userland).

Still to interview (round 2): .ai/ audience + cortex init UX,
monorepo/multi-repo semantics, custom agents w/ scoped skills, file
compression, AGENTS.md rigidity, arborist collab, branding, cleanup.md
de-Ian-ing/README tone/legacy-doc deletion.
