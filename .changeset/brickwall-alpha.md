---
"@ianrios/brickwall": minor
---

First alpha of the context limiter: hard budgets on markdown count,
doc/code line sizes (per-extension maps), and a total ban on
eslint-disable pragmas. Exemption is lifecycle, not inline: archiveDirs
are the silent archival valve, per-file exemptions pass but WARN as
visible debt (stale entries warn too). `--all` gives a full-scope audit
that ignores every ignore/exempt list. `--json` emits the stable
`{ violations, warnings }` machine surface; exit codes 0/1/2.
