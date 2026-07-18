# Phase 3: repo baseline + scaffolder (2026-07-17)

Status: peer-reviewed (zero-context); 3 blocking + 11 advisory findings
folded. Proceeds autonomously; names + umbrella decision to Ian's veto.

## Two packages, split by volatility

### A. `@ianrios/eslint-config` — the generic strict core

From petal's proven config: strictTypeChecked + stylisticTypeChecked
scoped to `**/*.{ts,tsx}`, js.configs.recommended + node/es2024 globals
for `**/*.js`, and the strictness rules (inline consistent-type-imports,
no-floating-promises, no-non-null-assertion, no-explicit-any, max-len
80, no-console warn). SHIPS `projectService: true` (peer review B1 —
strictTypeChecked errors without type info; projectService works
without tsconfigRootDir). Does NOT ship: React/a11y/testing plugins,
ignores, browser globals — repo choices, spread on top.
Plain ESM `.js`, no build/tsconfig (`pnpm -r` skips undefined
scripts — verified). peerDeps: `eslint >=9 <10` (max-len is
deprecated-but-present in 9; @stylistic migration is future work),
`typescript-eslint >=8`, `@eslint/js`, `globals`, `typescript >=5`.
Test: vitest configless on plain .js — import export, assert shape +
key rules; peers are the package's own devDeps.

### B. `@ianrios/cortex` — the `cortex` bin and `init`

`cortex init [--dir <path>]` (dir created if missing) scaffolds the
repo-owned layer, per-file NEVER-overwrite (skip + report):

- `.ai/`: CONTEXT, WORK, RULES, ANTI-PATTERNS, BACKLOG (+ plans/specs/
  completed with .gitkeep). Genericization BOUNDED (peer review):
  ANTI-PATTERNS template keeps exactly the transferable lessons
  (inline escape hatches; checks-pass ≠ done; folding replaces, never
  decorates; no blanket `git add -A`; copy-then-edit over regenerate)
  — named incidents, commits, and Ian-specific entries stay here.
  RULES keeps the generic core; CONTEXT/WORK/BACKLOG are skeletons.
- `AGENTS.md` starter + `CLAUDE.md` pointer (this repo's pattern).
- `brickwall.config.json` with FULLY-RESOLVED arrays; drift-guarded by
  a test that imports DEFAULT_CONFIG from brickwall (devDependency —
  runtime deps stay zero) and deep-equals the template JSON. No inline
  config literal in the test (the pragma scan covers test files).
- Starters `.prettierrc.json`, `.markdownlint.cjs`, `knip.json` from
  petal verbatim; knip's entry paths become placeholder VALUES
  (`["src/index.ts"]`) — strict JSON, no comments (B3); the init
  self-test parses every scaffolded JSON/cjs config.
- Report pair-prints wiring gaps (e.g. CLAUDE.md skipped but AGENTS.md
  created → "check CLAUDE.md points at AGENTS.md").

Exit codes (public API): 0 done, 2 usage, 1 runtime fs failure
(caught, one-line message). Zero runtime deps. `files: ["dist",
"templates"]`; templates resolved via import.meta.url; brickwall's
isMainModule pattern copied.

### Umbrella-bin decision → ADR 0005

`cortex` owns SCAFFOLDING ONLY; no `cortex check`. Fair alternative
(peer review): one command spanning all engines is genuinely simpler
for adopters — rejected because check composition already lives in
package.json per USAGE's compose-your-own doctrine, and an umbrella
would be a second definition of what "check" means. Tripwire: revisit
when a third engine ships. Ian may veto.

## Verification

- Self-test: init into temp dir → run workspace brickwall dist
  `--full` there → EXIT 0 (fresh scaffold passes its own budgets);
  every scaffolded config parses (JSON.parse / require).
- Never-overwrite: init twice; second run all-skipped, byte-identical.
- Drift guard as above. Tests need a built dist (CI builds first).
- CI floor proof (B2): `node packages/cortex/dist/cli.js init --dir
  "$(mktemp -d)"` on node 20 — real behavior, no --help flag invented.

## Named deviations from the founding text (fold into EXTRACTION_PLAN)

BACKLOG ships instead of WORKFLOW/BUGS (WORKFLOW is Phase 4 material;
BACKLOG is cortex's real convention). Prettier/knip/markdownlint ship
as vendored TEMPLATES, not preset packages — they are repo-owned the
moment they land (shadcn model); only the eslint core is versioned
logic. Accepted gaps, named: templates targeting default-ignored paths
would be checked nowhere (none ship today); `.cjs/.mjs` are not
default code extensions, so `.markdownlint.cjs` is unscanned anywhere.

## Budgets

Doc count hits EXACTLY 25/25 with the two READMEs + ADR 0005; folding
this plan to completed/ at session end frees one. Both READMEs ≤ 80.
`packages/cortex/templates` joins cortex's own ignoreDirs (visible);
the self-test is the compensating control.

## Out of scope

`init --diff` (roadmap); coverage-floor guidance (one line in USAGE);
husky/lint-staged automation (document only — never touch consumers'
hooks uninvited); petal/portfolio eslint migration (Phase 5 dogfood).

## Done means

Both packages green; all verification bullets passing; ADR 0005;
EXTRACTION_PLAN Phase 3 folded WITH deviations named; changesets; CI
floor proof extended; Ian shown names + umbrella decision.
