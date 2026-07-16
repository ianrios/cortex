# Dogfood: ianrios.github.io structural checks → brickwall

Status: planned 2026-07-15; zero-context review done same day, verdict
"implement with amendments" — folded below (mainly trim precision).

## Goal

Replace ONLY the structural checks in `scripts/validate.ts` (md-count,
doc-size, code-size incl. the scss tier, eslint-disable) with
`@ianrios/brickwall` from the packed tarball. The 13 drift checks STAY —
they are Phase 2 userland material. Never force green by raising budgets.

## Facts (verified first-hand, 2026-07-15)

- `npm run lint` green today (`eslint . && tsx scripts/validate.ts &&
  knip`). npm repo (package-lock.json), engines node >=20, .nvmrc 20.19.
- Active md: 17/25 (63 more in .ai/completed). Tight greens: CLAUDE.md
  and .ai/WORKFLOW.md at 80/80; .ai/specs/imagebox-epic.md 276/280;
  _atoms.scss 597/600.
- Over-250 code: src/data.ts (265) and src/pages/admin/adminData.ts
  (562) — the ratified per-file-exemption case; validate.ts (288)
  currently self-exempts, shrinks to ~180 after the structural cut.
- `.firebase/` is tracked but holds one `.cache` file — no md/code
  extension, so NO ignoreDirs override is needed (defaults suffice;
  build/coverage gitignored; .claude/.vscode hold only json).
- No untracked-unignored files; no CHANGELOGs.
- Portfolio's structural checks already excluded test files from the
  eslint-disable scan — petal's guard-weakening delta does NOT recur.

## Changes (in /Users/ianrios/Sites/ianrios.github.io)

1. Copy fresh tarball to `vendor/ianrios-brickwall-0.0.0.tgz`;
   `npm i -D file:vendor/ianrios-brickwall-0.0.0.tgz`.
2. Root `brickwall.config.json`:
   budgets.codeLines = { ".ts": 250, ".tsx": 250, ".js": 250,
   ".jsx": 250, ".scss": 600 }; codeExtensions = those five;
   storyDirs = [".ai/plans", ".ai/specs"]; archiveDirs =
   [".ai/completed"]; exemptFiles = ["src/data.ts",
   "src/pages/admin/adminData.ts"] (exact paths — no basename blast
   radius; the two expected exemption-debt warnings ARE the ratified
   visible-debt design).
3. `scripts/validate.ts`: delete the four structural checks and their
   scaffolding — MAX_* consts, countLines, selfPath, completedPrefix,
   DATA_FILES/isDataFile, mdFiles/activeMdFiles/storyPrefixes, the four
   check blocks INCLUDING the `// [eslint-disable]` header comment (the
   last pragma-shaped line in tracked code), and the hand-declared
   structural ViolationType literals (type becomes
   `keyof typeof driftChecks` — valid alone). KEEP walkDir, IGNORE_DIRS,
   CODE_EXTS, allFiles, codeFiles — the drift section consumes them
   (scssAll, srcTsxFiles). Required knock-ons for compilation under
   strictTypeChecked/noUnusedLocals: strip `f !== selfPath` from the
   codeFiles filter (safe — srcTsxFiles only takes src/*.tsx); delete
   the `fileURLToPath` import and drop `relative` from the path import;
   fix the now-stale registry comment ("only the four structural lint
   names are declared by hand"). Header comment updated: structural
   checks live in brickwall now.
4. `package.json` lint: `eslint . && brickwall && tsx scripts/validate.ts
   && knip --no-config-hints`.

## Semantic deltas (accepted, documented)

- `.ai/completed/` docs were still size-checked at the 280 tier (the
  count-only variant); brickwall archiveDirs exempt them from
  EVERYTHING — the ratified petal semantics, deliberately more lenient.
- `.scss` joins codeExtensions, so scss files are now scanned for
  eslint-disable too (was size-only) — stricter; no pragma exists in
  any scss file, stays green.
- validate.ts loses its self-exemption (brickwall has none) — fine
  post-trim at ~180 lines. The pragma-matching regex and the
  'eslint-disable' type literal leave the file with change 3, so
  brickwall's scan of it stays clean.
- exemptFiles override drops the CHANGELOG.md default (wholesale
  override — known friction); no CHANGELOGs exist here.
- Walker: git ls-files vs fs walk; tracked `.firebase/*.cache` is
  walked but matches no check.
- Reverse walker delta: `.claude`/`.vscode`/`.github` are now IGNORED
  (validate.ts walked them) — only json there today, but future
  `.claude/skills/*.md` would silently stop counting toward md-count.
- exemptFiles does NOT escape the eslint-disable scan (matches the old
  isDataFile semantics exactly — it only skipped code-size).
- Under `--all`, the 63 completed docs land in the DEFAULT 80 tier
  (storyDirs don't cover .ai/completed), and the on-disk gitignored
  `build/` is walked (single-line bundles — no size hits).

## Verification

- `npm run lint` green end-to-end; `npm run typecheck` (covers scripts/
  — proves the trimmed file compiles) and `npm test` green. Normal
  brickwall run prints EXACTLY two exemption-debt warnings (data.ts,
  adminData.ts), exit 0.
- Drift checks still fire post-trim: break one fed by the KEPT
  scaffolding (semantic-html via srcTsxFiles — e.g. a raw `<div>` where
  a semantic tag is required) → validate.ts exit 1 → revert.
- Structural smoke: 300-line doc + 601-line scss file → brickwall
  exit 1 naming both → revert.
- `npx brickwall --all` — expect exit 1 (63 completed docs, archive
  disabled); run with `|| true`, record output in cortex WORK.md.
- No budget number raised; scss stays 600 (the TODO comment about scss
  hackiness moves to brickwall config as a per-extension entry — the
  designed-for case).
- Commit (Claude trailer): config, package.json, package-lock.json,
  vendor tarball, validate.ts.

## Friction watch-list for this migration

Portfolio-specific candidates to confirm or refute: npm same-version
tarball refresh (package-lock pins the integrity hash → EINTEGRITY or a
silently stale npm-cache copy on repack at 0.0.0); knip's bin→package
mapping for `brickwall` (fallback: one `ignoreBinaries` line, never a
budget change); whether exact-path exemptFiles entries read clearly in
warnings; whether dropping the CHANGELOG default via override surprises.
