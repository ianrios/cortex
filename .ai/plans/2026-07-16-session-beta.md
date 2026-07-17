# Session beta (2026-07-16): interview outcomes → chores + proposal scope

Status: peer-reviewed (zero-context, 2026-07-16): no blocking findings;
advisories folded below.
Source: interview with Ian this session. Everything below is HIS
ratified direction; implementation details are mine to execute.

## Decisions ratified in the interview

1. **Changelog cutover today**: the `## Changelog (pre-publish)` section
   leaves `packages/brickwall/README.md`; a real
   `packages/brickwall/CHANGELOG.md` becomes the single source of truth
   (hand-written until first publish, Changesets prepends after).
2. **Arrays-replace semantics stay** (no `extends` syntax yet), but the
   silence goes: README documents replace-semantics explicitly, and
   `cortex init` (Phase 3) must write full resolved arrays into
   generated configs so nothing invisible can be lost.
3. **Nothing silently escapes the pragma ban**: test files currently
   bypass `checkEslintDisable` because they are filtered before any code
   check. Fix the behavior, don't soften the README claim. Test-file
   pattern becomes config (`testFilePatterns`-class key). Design in the
   config-surface proposal; implement after ratification.
4. **`bannedPragmas` generalization** (eslint-disable → per-language
   pragma list: `@ts-nocheck`, `# noqa`, `biome-ignore`, …) is the
   long-term shape; record as insight in EXTRACTION_PLAN Phase 3
   alongside "read limits from existing lint configs".
5. **Pattern-level budgets**: `extname()`-only resolution can't express
   `*.storybook.py: 500` vs `.py: 250`. Design the config shape now
   (proposal), even if implementation lands later.
6. **Diff-only as the primary no-flag mode** (direction locked; exact
   flag names to ratify): default run checks the branch diff; full-repo
   and superadmin scans move behind flags. `--json` follows the same
   default. Naming must not collide with the existing `--all`.
7. **Naming redesign approved to propose**: big-picture renames
   (`storyDirs`→`docDirs` class, budget-key restructure so the
   md/story/count relationship is self-evident), ratified name-by-name
   by Ian before any implementation.
8. **NDA dogfood rule**: production repos Ian forks for dogfooding are
   test subjects, never sources. Nothing enters cortex: no code, paths,
   company or product names. Findings recorded generically.
9. **No synthetic-repo generator** — benchmark on real repos from Ian's
   external drive when connected ("tokenmaxxing" avoided).
10. **Server-runner agent**: petal's `setup.sh` (node preflight +
    install guidance) is the concrete example; roadmap it in BACKLOG.
11. **Janitor vs already-drifted docs**: workflow framing ratified —
    deterministic candidate-finding → cluster claims → HUMAN ratifies
    the canonical version → agent rewrites losers into deep links.
    Ratification step is non-negotiable. Fold into BACKLOG janitor entry.

## Workstream A — chores (implement after peer review)

### A1. Changelog cutover

- Create `packages/brickwall/CHANGELOG.md` with the existing entry from
  the README section (keep dates/BREAKING wording verbatim).
- Delete the `## Changelog (pre-publish)` section from the README.
- `CHANGELOG.md` is already in default `exemptFiles` (basename match, any
  depth; default entries warn-silent); no config change, no md-count hit.
- Ordering (peer review): README is at exactly 80/80 lines — the A1
  deletion must land before or with the A2 addition, never after.

### A2. README replace-semantics note

- In the README Config section, state explicitly: array keys
  (`storyDirs`, `archiveDirs`, `exemptFiles`, `ignoreDirs`,
  `codeExtensions`) REPLACE the defaults when set — they do not extend
  them; `budgets` merges per key. One or two lines, no new section.

### A3. Doc folds (one fact, one home)

- `.ai/BACKLOG.md`: (a) extend janitor entry with the drifted-docs
  workflow framing from decision 11 — compressed hard, the file mandates
  near-one-line entries; (b) add server-runner agent entry (env
  preflight / setup.sh example, ties to per-repo-node friction).
- `docs/EXTRACTION_PLAN.md` Phase 3: one-line named insights ONLY, with
  pointers — bannedPragmas generalization, config-from-existing-sources
  (Ian's words stay in ians-brain.md, no restating), and `cortex init`
  writes fully-resolved arrays (decision 2's durable home per peer
  review — a transient proposal doc is not one).
- `.ai/RULES.md` repo-specific: add the NDA dogfood rule (decision 8).
- `.ai/WORK.md`: current focus → this session; move answered open
  questions (test-file escape, extend-defaults) to point at this plan
  and the config-surface proposal; stay ≤ 80 lines.
- Retire the finished interview handoff: `git mv
  .ai/plans/2026-07-16-interview-handoff.md .ai/completed/`; WORK.md's
  stale "NEXT SESSION" pointer goes with the current-focus rewrite.

### A4. Verify + commit

- `pnpm check` and `pnpm test` green; brickwall run on cortex itself
  green (README shrinks, one md file added — md-count must still pass).
- Stage by explicit path (never `git add -A`), commit with the Claude
  trailer, push, confirm CI goes green.

## Workstream B — config-surface redesign proposal (separate doc)

`.ai/plans/2026-07-16-config-surface.md`, covering as ONE coherent
design (keys must not fight each other): renames (decision 7),
`bannedPragmas` (4), `testFilePatterns` + ban-escape fix (3),
pattern-level budgets (5), diff-only default + flag naming (6),
replace-semantics visibility in `cortex init` (2). Each item: current
name/behavior → proposed → why → migration cost. Zero-context peer
review, then present to Ian for name-by-name ratification. NO
implementation this session unless Ian ratifies and context allows.

## Out of scope today

- Implementing any rename or behavior change from Workstream B.
- Benchmarking (blocked on external drive) and new dogfood migrations.
- Round-2 interview topics not yet discussed (.ai/ audience & cortex
  init UX, monorepo/multi-repo semantics, custom agents with scoped
  skills, file compression, AGENTS.md rigidity) — Ian steers when.

## Verification

- All gates green locally; CI green on push.
- Peer reviewer confirms: no decision above is mine where the handoff
  says it is Ian's; no doc fold duplicates a fact across files.
