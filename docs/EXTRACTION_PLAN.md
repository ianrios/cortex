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
| Strict lint baseline (strictTypeChecked, no-disable, knip, prettier-first ordering) | petal + portfolio configs | Engine: shareable presets |
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

Dogfooding before publish: consume via `pnpm` workspace locally and
`npm i github:ianrios/cortex` from other repos. No publish cadence pressure
until the config surface stabilizes.

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
AGENTS.md/CLAUDE.md, `.ai/` skeleton; repo dogfoods its own budgets.

### Phase 1 — Context limiter (flagship)

Extract the structural half of the portfolio's `validate.ts` (md-count,
doc-size, code-size, eslint-disable scan) into `packages/brickwall`:

- Config file with budgets, tier overrides (story/spec dirs), exemption dirs
  (archives), ignore dirs; sane defaults matching the portfolio's numbers.
- Walker respects `.gitignore` (prefer `git ls-files` with fs fallback).
- CLI (`brickwall` bin + `cortex check` alias later): exit 1 on violations,
  grouped `[type] message` output, `--json` for tooling.
- Pure check functions, unit tests over fixtures, ESM, Node >= 20.

Deliberately first: highest-conviction idea, most generic, independently
shareable even if nothing else ships.

### Phase 2 — Drift-check harness

Extract the registry/runner pattern (registry keys are the violation-type
union; pure checks take parsed data, return message arrays; IO lives in the
shell). Portfolio's 13 token checks stay in the portfolio as the first
userland consumer — that migration proves the plugin API is real.

### Phase 3 — Repo baseline + scaffolder

Shareable ESLint strictTypeChecked flat config, prettier/knip presets,
husky/lint-staged wiring, and `cortex init`: vendors the `.ai/` skeleton and
AGENTS.md/CLAUDE.md starters. Honors the copy-then-edit rule — templates are
real files copied in, never regenerated from scratch.

### Phase 4 — Agent workflow kit

Genericize the clinical planning/execution/peer-review prompt templates and
the portfolio's orchestration + approval semantics + anti-patterns model into
the patterns layer. Ship the Claude Code plugin adapter (`/plan`, `/execute`,
`/retro` commands loading vendored prompts; hook running the engine checks).

### Phase 5 — Dogfood migration

Convert petal and ianrios.github.io to consume the engine, deleting their
local script copies. Divergence between their configs is the test of whether
the config surface is right. Then WRC and the other repos.

### Roadmap (not scheduled)

Agent governance validators — see `docs/roadmap/agent-governance/README.md`.

## Open decisions

- Ratify `brickwall` (Ian).
- License: MIT placed as default; swap if desired.
- Whether brickwall publishes standalone before the cortex umbrella does.
