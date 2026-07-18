# Cortex Founding Plan: the Extraction

Status: approved by Ian, 2026-07-15. This is the founding document; update it
as phases complete (fold finished phases to one line, per the `.ai/` lifecycle).

## Origin

Four repos evolved one system of thought, in order:

1. **WRC** — deterministic agent governance on paper: authority model,
   deny-by-default field permissions, status transition matrices, append-only
   agent logs, a pure validation contract. Specced, never implemented.
2. **petal** — enforced quality gates: strictTypeChecked ESLint, banned
   `eslint-disable` (checked by script), knip, coverage floors, and the first
   doc/code line-budget validator.
3. **clinical-quality-dashboard** — formalized agent roles: planning-agent and
   execution-agent prompt templates, retro-first documentation, the mandatory
   zero-context peer-review subagent, "harden tooling" as a standing step.
4. **ianrios.github.io** — the synthesis: orchestrator model with scoped
   implementation subagents, explicit approval semantics, ANTI-PATTERNS.md as
   behavioral memory, and 13 drift checks that make design-system promises
   machine-checkable (registry keys ARE the violation-type union).

Each repo kept the previous one's ideas and hardened them. Cortex extracts the
working parts into one installable, agent-agnostic system.

## What gets extracted

| Idea | Source | Destination |
| ---- | ------ | ----------- |
| Context budgets (md count, doc/code line caps, archival lifecycle) | petal + portfolio `validate` scripts | Engine: context limiter package |
| Drift-check harness (registry pattern, pure checks, IO shell) | portfolio `scripts/drift-checks.ts` + `validate.ts` | Engine: harness package; project checks stay userland |
| Strict lint baseline (strictTypeChecked, no-disable, knip; prettier-first ordering is portfolio practice) | petal + portfolio configs | Engine: shareable presets |
| Agent workflow kit (plan/execute/peer-review prompts, approval semantics, anti-patterns log, retro loop) | clinical `prompts/` + portfolio `.ai/` | Patterns: vendored markdown |
| `.ai/` directory convention (CONTEXT/WORK/RULES/ANTI-PATTERNS, plans → completed) | WRC + portfolio | Patterns: `cortex init` scaffold |
| Agent governance (authority model, transitions, validation contract) | WRC `.ai/ops/` | Roadmap only — `docs/roadmap/agent-governance/`. Untested workflows are not extracted; preserved as the long-term direction. |

## Distribution model: split by volatility

The "npm package vs framework docs" tension dissolves by splitting material
by how it changes:

- **Generic runnable logic** — identical across repos except constants →
  versioned packages. Fix once, every repo updates. (eslint-config model.)
- **Repo-owned content** — CLAUDE/AGENTS.md, `.ai/` files, project drift
  checks, anti-patterns → vendored by `cortex init`; the repo owns it and
  drift is a feature. An `init --diff` can show divergence from current
  templates when resync is wanted. (shadcn model.)
- **Adapters** — Claude Code plugin, Codex config → thin shims that reference
  the other layers. Pointers, never copies: this is what keeps cortex
  agent-agnostic as models and tools change.

Dogfooding before publish: consume via `pnpm` workspace locally; from other
repos use `pnpm pack` tarballs or Changesets snapshot releases (a plain
`npm i github:...` cannot install a workspace subpackage or build `dist/`).
No publish cadence pressure until the config surface stabilizes.

## Naming

Monorepo and scope: **`@ianrios/cortex`** (decided).

Context limiter package: proposed **`brickwall`** (`@ianrios/brickwall`).
Rationale: in mastering, a brickwall limiter is a limiter with an effectively
infinite ratio — an absolute ceiling nothing passes. That is exactly what
hard-error budgets are. "Limiter" alone reads as API rate limiting in the
node ecosystem; "brickwall" keeps the mastering metaphor, is memorable, and
the tagline writes itself: *a brickwall limiter for your repo's context —
hard ceilings on docs and code so agents never clip.* Alternatives
considered: `headroom` (taken by a scroll library; softer metaphor),
`context-limiter` (descriptive, forgettable, rate-limit collision).

## Phases

### Phase 0 — Reset cortex ✅ DONE (2026-07-15)

Runtime-vision docs archived to `docs/archive/`; WRC governance specs ported
to `docs/roadmap/agent-governance/`; new README, this plan, ROADMAP,
AGENTS.md/CLAUDE.md, `.ai/` skeleton; budgets honored manually pending the
Phase 1 checker.

### Phase 1 — Context limiter (flagship)

Extract the structural half of the portfolio's `validate.ts` (md-count,
doc-size, code-size, and the eslint-disable scan — all four live in
brickwall) into `packages/brickwall`:

- Config semantics (peer-reviewed 2026-07-15): **ignoreDirs** are never
  walked (defaults include `node_modules`, `.git`, `dist`, `.changeset`,
  `.claude`, `.github`); **archiveDirs** are the archival escape valve,
  walked but exempt from every check and count (petal semantics, not the
  portfolio's count-only variant); **exemptFiles** (default `CHANGELOG.md`)
  covers generated, monotonically-growing files; **storyDirs** get the
  280-line tier. All defaults overridable, all visible in config.
- `budgets.codeLines` accepts a number or per-extension map (the portfolio
  needs `.scss: 600` at migration time — designed now, not retrofitted).
- Walker: `git ls-files --cached --others --exclude-standard` (untracked
  files must be seen) with fs fallback; posix-normalized paths so config
  prefixes behave on Windows.
- CLI (`brickwall` bin; a `cortex` umbrella bin is a Phase 3 decision):
  exit 0 pass / 1 violations / 2 config-or-usage error; grouped
  `[type] message` output; `--json` is the stable machine surface (exact-
  asserted in tests; human output stays free to change).
- Pure check functions, zero runtime dependencies (a trust feature —
  decided), unit + fixture-repo integration tests, ESM, Node >= 20
  (develop on 24).

Deliberately first: highest-conviction idea, most generic, independently
shareable even if nothing else ships.

### Phase 2 — Drift-check harness ✅ DONE (2026-07-17)

`@ianrios/drift` extracted (runChecks/formatChecks: key-union typing,
per-check error isolation, exit 0/1/2 — ADR 0004); portfolio's 13 checks
migrated as the first userland consumer, all verdict paths verified live.
Record: `.ai/completed/2026-07-17-phase-2-drift.md`.

### Phase 3 — Repo baseline + scaffolder ✅ DONE (2026-07-17)

`@ianrios/eslint-config` (generic strict core, projectService on) +
`@ianrios/cortex` (`cortex init`: never-overwrite `.ai/` skeleton,
AGENTS/CLAUDE pair, resolved brickwall config, gate starters; umbrella
bin is scaffolding-only — ADR 0005). Named deviations from the original
text: BACKLOG ships instead of WORKFLOW/BUGS (WORKFLOW is Phase 4
material); prettier/markdownlint/knip ship as vendored TEMPLATES, not
preset packages (repo-owned on landing — the volatility split applied);
husky wiring documented, never automated. `bannedPragmas` and
resolved-array init landed with Phase 1's rev 4. Still open from the
original scope: budget-import from existing lint configs. Record:
`.ai/completed/2026-07-17-phase-3-baseline-init.md`.

### Phase 4 — Agent workflow kit

Genericize into the patterns layer, naming sources precisely: clinical's
planning/execution prompt templates AND its retro-first mechanics (retro
written before the plan, before/after metrics table, "harden tooling" as a
standing step — the most novel piece), plus the portfolio's `.ai/WORKFLOW.md`
(orchestrator vs file-allowlisted subagents, fold rules, doc-update
checklist) and approval semantics + anti-patterns model. Ship the Claude
Code plugin adapter (`/plan`, `/execute`, `/retro` commands loading vendored
prompts; hook running the engine checks).

### Phase 5 — Dogfood migration

Convert petal and ianrios.github.io to consume the engine, deleting their
local script copies. Divergence between their configs is the test of whether
the config surface is right. Then WRC and the other repos.

### Roadmap (not scheduled)

Agent governance validators — see `docs/roadmap/agent-governance/README.md`.

## Decisions (ratified by Ian, 2026-07-15)

- **`brickwall` ratified** as the package name — and reframed as one MODE
  of the limiter; presets (brickwall/multiband/soft) are a future config
  layer (see `.ai/specs/ians-brain.md`). MIT stays. Publish order: open.
- **Per-file exemptions: allowed but WARNED.** Visible config exemptions
  (data manifests etc.) pass with a printed warning — exemption debt that
  forces eventual restructure. Archival archiveDirs stay silent (they ARE
  the designed lifecycle).
- **Monorepo model (delegated to Claude): one root config with per-path
  override sections** (ESLint-flat-config style `overrides: [{dirs,
  budgets…}]`), not nested per-package files. One source of truth to
  audit, works for partial installs, matches Ian's instinct for "one file
  with sections per sub-repo". Implement when petal migration needs it.
- **Default ignores**: `.claude`, `.codex`, `.cursor`, `.vscode`,
  `.github`, `.changeset` + CHANGELOG exemption — revisable over time.
  Plus a **`--all` superadmin flag** scanning everything (agents may hide
  docs in ignored dirs to bypass the checks; audit view required).

## Peer review record

Founding docs reviewed by a zero-context agent on 2026-07-15; all blocking
findings folded above. Condensed record: `.ai/completed/2026-07-15-plan-review.md`.
