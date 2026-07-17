# @ianrios/brickwall

Hand-maintained until the first Changesets release; generated entries
will be prepended above by `changeset version`.

## Unreleased (pre-publish)

- 2026-07-15 — BREAKING: `--json` output was a bare violations array, now
  `{ violations, warnings }`; `exemptDirs` renamed `archiveDirs`. Added
  `--all`, the warnings channel, default ignores `.vscode`/`.codex`/`.cursor`.
