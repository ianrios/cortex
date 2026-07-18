# ADR 0003: one selector grammar for section membership and tiers

Date: 2026-07-17. Status: accepted (Ian, after the scss-600 triple-check).

## Decision

Config is two symmetric sections (`docs`, `code`), each `{ matches,
maxLines, tiers }` plus one domain key (`docs.maxCount`,
`code.testFilePatterns`). A selector `{ dirs?, patterns? }` — ANY entry
within a field, ALL present fields — defines membership (`matches`,
any selector claims) and tiers (selector + `maxLines`, first match in
config order). Cross-section precedence: a `dirs` claim beats
patterns-only, deeper matched dir wins, ties are loud per-file errors.
Empty `matches` is a config error. Custom tiers matching nothing warn
`stale-tier`; default tiers stay silent.

## Alternatives rejected

- **Per-extension suffix map** (`codeLines: { ".scss": 600 }`): a second
  resolution rule (longest-suffix + coverage validation) alongside tier
  order, and `extname()` can't express `*.storybook.py` vs `*.py`.
- **Separate `extensions` key**: bare `.md` already normalizes to the
  pattern `*.md` — a second spelling of the same fact, drift waiting.
- **Overlap = always error, no precedence**: killed the whole-docs-dir
  case (real docs dirs contain `.ts` examples, which the global code
  patterns also claim).

## Consequences accepted

- A dirs-only docs selector claims binaries (counted, line-checked) —
  documented, pair `patterns` for mixed dirs.
- Two-rung precedence is more rules than "always error", in exchange
  for the two use cases the grammar exists to serve.
