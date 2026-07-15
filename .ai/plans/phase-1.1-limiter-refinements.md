# Phase 1.1 — Limiter Refinements (Ian's ratified decisions)

Status: planned 2026-07-15. No code in this plan; intent only.

## Problem

Ian ratified three behaviors Phase 1 lacks: (1) per-file exemptions must
be allowed everywhere but WARN as visible debt, (2) a superadmin scan that
ignores the ignore/exempt lists (agents may hide docs in ignored dirs to
bypass budgets), (3) broader default ignores (`.vscode`, `.codex`,
`.cursor`).

## Changes

1. **Warnings channel** (`packages/brickwall/src/checks.ts`, `run.ts`,
   `cli.ts`, `index.ts`): a run result gains `warnings` alongside
   `violations`. Warnings never affect the exit code. Human output prints
   a `⚠` block after the verdict; `--json` emits
   `{ violations: [...], warnings: [...] }` — a BREAKING change to the
   JSON shape (was a bare array; acceptable pre-publish, do it now not
   later). Update exact-assert tests.
2. **exemptFiles applies to code-size too** (currently doc-size/md-count
   only), so data manifests (`data.ts`, `adminData.ts` pattern) can be
   exempted visibly. Every exemptFiles entry NOT in the built-in defaults
   (`CHANGELOG.md`) that matches at least one scanned file yields one
   warning naming the shielded files ("exemption debt: restructure
   eventually"). Entries matching nothing also warn (stale exemption).
   Default entries stay silent. exemptDirs stay silent (they are the
   designed archival lifecycle, not debt).
3. **`--all` flag** (`walk.ts`, `run.ts`, `cli.ts`): scan with ignoreDirs,
   exemptDirs, and exemptFiles disabled (only `.git` stays excluded; use
   fs walk, since git ls-files can't see into e.g. gitignored dirs).
   Exit codes keep normal semantics — it is an audit view; violations
   found there are real output. Human header notes "full-scope audit".
4. **Defaults**: ignoreDirs += `.vscode`, `.codex`, `.cursor`.
5. **Docs**: update package README (warnings, --all, new JSON shape) and
   root `docs/USAGE.md` (already drafted; verify accuracy against
   implementation).

## Files

`packages/brickwall/src/{checks,run,cli,walk,index}.ts`, tests alongside,
`packages/brickwall/README.md`, `docs/USAGE.md`.

## Risks

- JSON shape break: coordinated now, before any consumer exists.
- `--all` + fs-walk must not explode on huge node_modules: still skip
  `.git` and symlinked dirs; document that --all walks node_modules by
  design (that's the audit point) but consider a sanity note in README.
  DECISION: --all skips `node_modules` and `.git` only — hiding docs in
  node_modules is not a realistic agent bypass; everything else is walked.

## Verification

- Unit: warning generation (custom entry matching files / matching
  nothing / default entry silent), exemptFiles-on-code-size, --all
  discovering a violation inside `.claude/` fixture.
- Integration: fixture repo with a doc hidden in an ignored dir — normal
  run exit 0, `--all` run exit 1.
- Self-check: `pnpm check` still green at repo root; `--all` at repo root
  reported (expected: violations in .claude/.github if any — document
  actual result).
