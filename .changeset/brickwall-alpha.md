---
"@ianrios/brickwall": minor
---

First alpha of the context limiter. One selector grammar
(`{ dirs?, patterns? }`) defines what counts as docs vs code
(`matches`) and per-scope line budgets (`tiers`); doc count, doc/code
line sizes, and a configurable `bannedPragmas` substring ban (tests and
exempt files included — only archives escape). Exemption is lifecycle,
not inline: `archiveDirs` are the silent archival valve, per-file
exemptions pass but WARN as visible debt (stale entries and dead tiers
warn too). Diff mode is the no-flag default (checks only files changed
vs `--base`, default HEAD; doc count and warnings stay repo-wide);
`--full` checks everything — use it in CI and git hooks; `--audit`
is a shields-off full-scope walk. `--json` emits the stable
`{ violations, warnings, mode }` machine surface; exit codes 0/1/2.
