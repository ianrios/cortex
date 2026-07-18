Current focus:

- NEXT SESSION: interview-first — read
  .ai/plans/2026-07-18-interview-handoff.md before anything else;
  Ian's own review lands in .ai/specs/current-state-review.md.

- PHASES 2+3 DONE (2026-07-17): @ianrios/drift (portfolio validate.ts
  is the proof, 221911f); @ianrios/eslint-config + @ianrios/cortex
  (`cortex init`, scaffolding-only bin — ADR 0005; init self-test:
  fresh scaffold passes brickwall --full). "drift" name RATIFIED;
  cortex/eslint-config names + ADR 0005 await Ian's veto.
- Rev 4 config surface DONE + dogfooded: petal 4956a28, portfolio
  2b3c1de, both pushed. NEXT: drive-repo dogfood queue (standing
  regression suite per Ian), then round-2 interview.
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
- Sweep findings 2026-07-17: pragma ban has NO gradual-adoption path
  (fix or `[]` only) — most legacy repos carry pragmas; a warn-mode is
  a candidate, not designed. 4 of 7 repos' only doc violation was an
  oversized README (~140 lines) — do defaults want a README tier?
  Diff-mode is THE legacy onboarding recipe — promote in USAGE.
- `--all` drowns in stale-artifact noise — BACKLOG janitor-agent evidence
- Per-repo Node engines bit both migrations — USAGE.md agent section
  should say "honor .nvmrc/engines before installing"

Resolved 2026-07-16 (details in archived session-beta plan): extend
defaults NOT built; pragma-ban test escape closed; changelog cut over;
portfolio's kept scripts intentional (became Phase 2 userland).

Round-2 interview HELD at session close (2026-07-17): answers folded
into ians-brain.md (4 new sections) + BACKLOG (7 new entries);
cleanup.md consumed → completed/. Names all ratified. Doc count at
25/25 with Ian's two working specs as visible exemption-debt.
