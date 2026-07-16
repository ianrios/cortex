# Dogfood: petal migration to brickwall

Status: planned 2026-07-15; zero-context review done same day, verdict
"implement with amendments" — all amendments folded below.

## Goal

Replace petal's `scripts/validate-doc-lines.js` and
`scripts/check-no-eslint-disable.js` with `@ianrios/brickwall` installed
from a `pnpm pack` tarball. Semantics must match or be deliberately more
lenient; NEVER force green by raising budgets. Config friction found here
is the roadmap — log every missing knob in cortex `.ai/WORK.md`.

## Facts (verified first-hand, 2026-07-15)

- petal passes both scripts today. Git-visible md files: 28 → 24 counted
  after `.github` ignore + `docs/completed` archive (limit 25).
- Story-tier dirs: `docs/stories`, `docs/notes`; archival:
  `docs/completed`. No CHANGELOGs, no `.next`, `.pnpm-store` empty,
  `.claude/worktrees` gitignored.
- petal is a pnpm monorepo (Node >= 24, pnpm 10) with UNIFORM budgets —
  the ratified per-path-overrides feature is NOT needed here.
- Its lint chain: `eslint . && markdownlint … && node scripts/… &&
  node scripts/… && knip …` (knip runs with `--exclude binaries`).
- Pre-existing dirty state: deleted `.vscode/settings.json` (not ours;
  leave untouched, exclude from any commit).

## Changes (in /Users/ianrios/Sites/petal)

0. Provenance: `pnpm build && pnpm pack` fresh in packages/brickwall;
   `tar -tzf` sanity check that dist/cli.js and README are current.
1. Copy the packed tarball to `petal/vendor/ianrios-brickwall-0.0.0.tgz`;
   `pnpm add -D -w file:vendor/ianrios-brickwall-0.0.0.tgz` (relative
   path so the repo stays reproducible; snapshot-publish replaces this
   later).
2. Root `brickwall.config.json`:
   `{ "storyDirs": ["docs/stories", "docs/notes"],
      "archiveDirs": ["docs/completed"] }` — everything else defaults.
3. `package.json` lint script: replace the two `node scripts/…` calls
   with `brickwall` (keep position: after markdownlint, before knip).
4. `git rm scripts/validate-doc-lines.js scripts/check-no-eslint-disable.js`
   (keep `scripts/setup.sh`).

## Semantic deltas (accepted, documented — not bugs)

- Trailing newline no longer counts as a line (petal counted it) —
  budgets one line more lenient.
- Walker is `git ls-files` (sees untracked-not-ignored; skips gitignored)
  vs petal's fs walk. `.claude`/`.vscode` now never scanned (petal's
  eslint-disable checker used to walk them).
- The deleted eslint-disable script self-exempted by filename; moot now.
- storyDirs/archiveDirs are root-relative prefixes; petal matched
  `/stories/`, `/notes/`, `/completed/` at ANY depth. Equivalent for
  petal's actual layout (all at fixed paths outside ignored dirs).
- Test files (`*.test.*`/`*.spec.*`) escape brickwall's eslint-disable
  ban entirely (filtered before ANY check); petal's checker scanned
  them. Petal's 11 test files are clean today, so green is unaffected —
  but this is guard-weakening, and brickwall's README claim ("any code
  file") is wrong. Both go to the friction log as cortex work.
- `docs/completed` escapes the eslint-disable ban under brickwall
  (archiveDirs skip it); petal's checker scanned it. Md-only dir — moot.
- Petal's excludes were substring matches (`includes('dist')`);
  brickwall segment-matches — stricter on names like `distance.ts`.
  No such files exist.

## Verification

- Mid-migration red is expected: brickwall flags
  `scripts/check-no-eslint-disable.js:52` until step 4 deletes it —
  verify only after step 4.
- `pnpm lint` in petal green end-to-end (eslint → markdownlint →
  brickwall → knip); `pnpm typecheck && pnpm test` untouched and green.
- Violation smoke test: temporarily add a 300-line doc and an
  eslint-disable comment in a NON-TEST code file → brickwall exit 1
  naming both → revert. (Headroom note: md-count is 24/25, smoke doc
  makes exactly 25 — doc-size is the intended trigger.)
- `npx brickwall --all` in petal: EXPECT exit 1 (stale gitignored
  worktree `.claude/worktrees/epic-shamir-*` full of doc copies, plus
  docs/completed with archive disabled); run with `|| true`, record
  output in cortex WORK.md.
- Confirm no budget number was raised anywhere.
- Commit in petal (Claude trailer): config, package.json, lockfile,
  vendor tarball, script deletions — EXCLUDING the pre-existing .vscode
  deletion.

## Friction log seed (already known; verify + extend during migration)

1. ignoreDirs/exemptFiles overrides are wholesale — no "extend defaults"
   syntax (adding one entry means restating all 11 defaults).
2. archiveDirs/storyDirs lack bare-name any-depth matching (ignoreDirs
   has it) — asymmetric config semantics; petal's originals were
   any-depth substring matches.
3. brickwall violation messages lack the remediation guidance petal had
   ("Use progressive disclosure and consolidate duplicates").
4. Test files escape the eslint-disable ban (design question: should the
   ban be total?) and the README overclaims "any code file".
5. Tarball-in-place updates: pnpm pins the tarball integrity hash in the
   lockfile — repacking to the same path needs a fresh `pnpm add` +
   lockfile commit (snapshot releases will fix this properly).
6. Deleted-but-unstaged tracked md/code file → unhandled ENOENT in
   readAll (git ls-files --cached still lists it) — should be a clean
   exit 2 or a skip.
