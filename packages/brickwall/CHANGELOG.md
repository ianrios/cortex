# @ianrios/brickwall

Hand-maintained until the first Changesets release; generated entries
will be prepended above by `changeset version`.

## Unreleased (pre-publish)

- 2026-07-17 — BREAKING, the rev 4 config surface (ratified name-by-name;
  design record in the cortex repo, `.ai/plans/2026-07-16-config-surface.md`):
  - Config: flat `budgets`/`storyDirs`/`codeExtensions`/`banEslintDisable`
    replaced by symmetric `docs`/`code` groups with one selector grammar
    (`matches`, `tiers`); `bannedPragmas` list; `testFilePatterns`. Old
    keys fail loudly as unknown.
  - Behavior: DIFF mode is the no-flag default (`--base`, default HEAD);
    `--full` is the old default behavior; `--all` renamed `--audit`.
    Dir-entry grammar unified: a BARE single-segment entry in
    `archiveDirs`/`ignoreDirs`/tier dirs now matches at any depth
    (archiveDirs were previously root-prefix-only) — prefix `/` to
    root-anchor.
    Test files and `exemptFiles` no longer escape the pragma scan; the
    scan is a bare substring match (no comment parsing). New
    `stale-tier` warning. Doc count + warnings repo-wide in every mode.
  - `--json`: adds `mode`; violation types `md-count`→`doc-count`,
    `eslint-disable`→`banned-pragma`.
- 2026-07-15 — BREAKING: `--json` output was a bare violations array, now
  `{ violations, warnings }`; `exemptDirs` renamed `archiveDirs`. Added
  `--all`, the warnings channel, default ignores `.vscode`/`.codex`/`.cursor`.
