# Roadmap & Things To Pay Attention To

Phase sequencing lives in [EXTRACTION_PLAN.md](EXTRACTION_PLAN.md). This doc
is the watch-list: decisions and traps for building a public toolkit, keyed
to what is NOT already familiar from in-house npm package work.

## Packaging & publishing (differs from Nexus/in-house)

- **Public scope setup.** `@ianrios/*` requires `npm publish --access public`
  (scoped packages default to private and the publish fails confusingly).
- **Versioning: use Changesets.** In-house monorepos often version by fiat;
  public consumers need semver discipline. `pnpm` + `@changesets/cli` gives
  per-package versions, changelogs, and a release PR flow. Snapshot releases
  (`changeset version --snapshot`) cover the fast-dogfood loop without
  burning real versions.
- **Publish from CI, not laptops.** GitHub Actions + npm provenance (OIDC
  `--provenance`) gives supply-chain attestation for free and removes local
  npm tokens. Set this up before the first real publish, not after.
- **ESM-only, Node >= 20.** Ship ESM with `"type": "module"`, real `exports`
  maps, and `engines`. Dual CJS/ESM builds are a maintenance tax not worth
  paying for a new CLI-first tool in 2026.
- **The bin is the API.** Once anyone else installs it, CLI flags, config
  keys, exit codes, and output format are all breaking-change surface.
  Design `--json` output early so the human-readable format stays free to
  change.

## Design traps specific to this toolkit

- **Config discovery.** Follow the cosmiconfig convention (`brickwall.config.*`,
  `package.json` key) but keep the schema tiny and versioned. Every config key
  added is forever.
- **Walker correctness.** Respect `.gitignore` (use `git ls-files` when in a
  repo, fs walk fallback otherwise), handle pnpm workspaces (nested
  `node_modules`, symlinks), and Windows paths. This is where naive
  file-walking tools die in other people's repos.
- **Budgets need escape valves that are visible, not silent.** The archival
  exemption (`completed/`, `archive/`) is the pattern: content leaves the
  budget by moving through a lifecycle, never by an inline "ignore this file"
  comment (that's the eslint-disable failure mode reinvented).
- **Keep adapters thin.** The moment the Claude plugin contains logic instead
  of pointers, Codex users fork behavior and the agent-agnostic claim dies.
- **Genericization tax.** Extract the portfolio's numbers as defaults, not
  laws. Every default must be overridable; every check must be disableable
  per-repo in config (visibly), or adopters bounce.

## Quality & trust (what makes strangers adopt it)

- **Test the toolkit against fixture repos.** Unit tests for pure checks plus
  integration tests that run the CLI against `fixtures/violating-repo/` and
  assert exact output. The portfolio's drift-checks are unit-tested; keep
  that bar.
- **The toolkit must pass itself.** Cortex CI runs cortex. A context-budget
  tool with a bloated docs folder is dead on arrival.
- **README per package.** npm renders the package README, not the repo one.
  The brickwall README is the product page — the mastering-limiter story
  belongs there.
- **LICENSE, CONTRIBUTING, issue templates** before sharing the link, not
  after the first issue. MIT is in place; swap if desired.
- **No telemetry, no network calls.** State it in the README. For a tool that
  runs inside private repos, this is a trust feature worth advertising.

## Community & maintenance (new territory)

- **Contributors change the calculus.** Every accepted PR is API surface to
  maintain. Prefer "config over code" contributions early; land a
  CONTRIBUTING.md that says what the project will NOT accept (new required
  config, network features, per-file inline ignores).
- **Drift between your repos and the package is signal.** When petal needs a
  config the package lacks, that's the roadmap writing itself. Log these in
  `.ai/WORK.md` open questions rather than patching one-off forks.
- **Naming/branding consistency.** Pick `brickwall` (or successor) once and
  use it in bin name, config file, violation prefix, and docs. Renames after
  publish are painful.
- **Announce with the story, not the feature list.** The extraction
  narrative (four repos, what failed, what survived) is the differentiator
  against generic "AI workflow" repos.

## Learning goals alignment (Ian: infrastructure/architecture growth)

This project exercises exactly the target skills: package architecture and
API design, CI/CD release engineering (Actions, provenance, changesets),
cross-platform CLI tooling, and multi-repo dependency management — the same
shape as platform teams maintaining internal tooling at scale. Treat each
phase's infra decisions as deliberate practice: write a short ADR in
`docs/adr/` for anything with a real alternative.

## Later / speculative

- Agent governance validators (`docs/roadmap/agent-governance/`) — the WRC
  authority model as a real library, once the workflow patterns have miles
  on them.
- `cortex init --diff` template drift viewer.
- A docs site, if adoption warrants it.
