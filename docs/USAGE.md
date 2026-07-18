# Using brickwall

brickwall is a standalone static check — like a linter, it owns nothing
about your build. It never touches the network, reads only your working
tree, and exits 0/1/2 (pass / budgets exceeded / config-or-usage error).

## Modes

- `npx brickwall` — **diff mode, the default**. Built for the agent
  loop and big repos: a 30k-file repo checks a 3-file change in the
  time it takes to read 3 files.
- `npx brickwall --full` — **the mode for CI and git hooks** (why: the
  package README and ADR 0001).
- `npx brickwall --audit` — the superadmin view: what is the normal
  run shielding? Never wire it into CI.

Exact mode semantics live in the package README — one home, no drift.

## Where it runs (all optional — bring your own setup)

1. **Inside the agent loop** — the placement that makes it different
   from a linter. A Claude Code hook (PostToolUse or Stop) running
   `npx brickwall` gives an agent that just wrote a 400-line doc the
   violation as same-session feedback. Diff mode makes this fast
   anywhere; `--json` and stable exit codes make it machine-readable.
2. **Pre-commit/pre-push** — `npx brickwall --full`.
3. **CI** — one step after checkout: `- run: npx brickwall --full`.

## Example configs (three real shapes)

**1. Zero config** — the proven defaults (the numbers live in the
package README's schema block, one home):

```json
{}
```

**2. Multiband by file type** (a portfolio SPA: scss carve-out at 600,
everything else 250):

```jsonc
{
  "code": {
    "matches": [{ "patterns": [".ts", ".tsx", ".js", ".jsx", ".scss"] }],
    "maxLines": 250,
    "tiers": [{ "patterns": [".scss"], "maxLines": 600 }]
  },
  "docs": { "tiers": [{ "dirs": [".ai/plans", ".ai/specs"], "maxLines": 280 }] },
  "exemptFiles": ["src/data.ts"]   // visible debt: warns on every run
}
```

**3. Dir-centric docs** (everything under `docs/` is documentation —
any extension; html elsewhere stays code): a `dirs` claim beats the
patterns-only code claim, so `docs/example.ts` is budgeted as a doc:

```jsonc
{
  "docs": {
    "matches": [{ "dirs": ["/docs"] }, { "patterns": [".md"] }],
    "maxLines": 120,
    "tiers": []
  },
  "code": { "matches": [{ "patterns": [".ts", ".js", ".html"] }] }
}
```

## The lifecycle, not just the limits

- Finished plans/specs `git mv` into an archive dir (`archiveDirs`) —
  content leaves the budget through a lifecycle, never via an inline
  ignore comment. Epics fold completed phases to one line.
- One fact lives in one file; docs state non-obvious constraints only.
- `exemptFiles` pass size/count checks but custom entries WARN
  (`exemption-debt`; stale entries warn `stale-exemption` — delete
  them). A tier matching nothing warns `stale-tier`. Warnings never
  change the exit code; they are the visible-debt channel.
- Nothing escapes the pragma scan except `archiveDirs` — not tests,
  not `exemptFiles`. Pragma-bearing test DATA belongs in fixture files
  under a visibly-ignored dir (this repo: `packages/brickwall/test/
  fixtures`); pragma VALUES your code must name belong in data files
  (this repo keeps defaults in `banned-pragmas.json`).

## For agents installing this for a human

1. `npm i -D @ianrios/brickwall` (once published; today: `pnpm pack`
   from this monorepo and install the tarball).
2. Honor `.nvmrc`/`engines` before installing anything.
3. Prefer zero config; override only what the repo's reality demands,
   and never raise budgets silently — propose archival structure first.
4. Wire ONE integration point from the list above — ask the human
   which; remember `--full` for hooks/CI, bare diff mode for the loop.
