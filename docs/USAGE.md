# Using brickwall

brickwall is a standalone static check — like a linter, it owns nothing
about your build. You run it wherever you already run checks. It never
touches the network, reads only your working tree, and exits 0/1/2
(pass / budgets exceeded / config-or-usage error).

## Standalone (the normal case)

```bash
npx brickwall            # human output (verdict, then ⚠ warnings)
npx brickwall --json     # stable machine output: { violations, warnings }
npx brickwall --all      # full-scope audit — NOT a CI gate (see below)
npx brickwall --config path/to/brickwall.config.json
```

Zero config works: defaults are the numbers proven in the source repos
(25 active markdown files, 80 lines per doc, 280 for story/spec dirs, 250
per code file). Add `brickwall.config.json` (or a `"brickwall"` key in
package.json — not both) to override. See the package README for the full
schema.

## Where it runs (all optional — bring your own setup)

brickwall does not replace your typecheck, tests, or ESLint. It slots in
at any or all of three points:

1. **Locally / pre-commit** — husky or lint-staged:
   `"pre-commit": "npx brickwall"`. Catches budget creep before it lands.
2. **CI** — one step in your existing workflow:
   `- run: npx brickwall` after checkout. This is the classic CI gate.
3. **Inside the agent loop** — the placement that makes it different from
   a normal linter. Example: a Claude Code hook (PostToolUse or Stop) that
   runs `npx brickwall` so an agent that just wrote a 400-line doc gets
   the violation as feedback in the same session, instead of a human
   discovering it at review time. Any agent CLI with hooks/gates can do
   the same; that is why the CLI has a `--json` mode and stable exit
   codes.

This repo's own `pnpm check` chains typecheck → tests → brickwall because
cortex is a code repo that also dogfoods its own limiter. Consumers are
NOT expected to adopt that chain — compose your own.

## The lifecycle, not just the limits

The numbers only work with the archival flow they were designed around:

- Finished plans/specs move (`git mv`) into an archive dir
  (`archiveDirs`: `.ai/completed/`, `docs/archive/`) — they leave the
  budget by moving through a lifecycle, never via an inline ignore
  comment.
- Epics fold completed phases to a single line pointing at the archive.
- One fact lives in one file; docs state non-obvious constraints only.
- Per-file exemptions (`exemptFiles`) are allowed everywhere but custom
  entries print a warning — visible exemption debt, never an exit-code
  change. A stale entry (matching nothing) warns too: remove it.
- `--all` is the superadmin audit: an fs walk skipping only
  `node_modules` and `.git`, with `ignoreDirs`, `archiveDirs`, and
  `exemptFiles` disabled. Gitignored files, build output, and test
  fixtures WILL show up — that is the point. Use it to review what the
  normal run is shielding; do not wire it into CI.

## For agents installing this for a human

Machine-readable onboarding is a design goal. Current install path:

1. `npm i -D @ianrios/brickwall` (once published; today: `pnpm pack` from
   this monorepo and install the tarball).
2. Create `brickwall.config.json` only if the defaults need overriding;
   prefer defaults.
3. Wire ONE integration point from the list above — ask the human which;
   do not modify their existing scripts without asking.
4. Run `npx brickwall`; if the repo fails immediately, propose an archival
   structure (`docs/archive/`, `.ai/completed/`) rather than raising
   budgets.
