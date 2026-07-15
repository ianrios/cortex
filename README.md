# Cortex

An agent-agnostic developer toolkit: context budgets, quality harnesses, and
agent workflow patterns — extracted from real projects, not invented in a vacuum.

Cortex installs into any repo and gives coding agents (Claude Code, Codex,
whatever comes next) hard guardrails and proven workflows instead of
hand-wavy instructions.

## The three layers

| Layer        | What                                                        | Ships as                    |
| ------------ | ----------------------------------------------------------- | --------------------------- |
| **Engine**   | Runnable, generic checks: context limiter, code-size caps, drift-check harness, lint presets | Versioned npm packages (`@ianrios/*`) |
| **Patterns** | Repo-owned content: `.ai/` convention, prompt templates, anti-patterns log | Vendored by `cortex init` (shadcn model — drift is expected) |
| **Adapters** | Per-tool shims: Claude Code plugin, Codex config, git hooks  | Thin pointers to layers 1–2, never copies |

## Why

Agents fail in repeatable ways: they bloat docs until context drowns, disable
lint rules instead of fixing code, declare work done when checks pass, and
forget every lesson between sessions. Each cortex tool closes one of those
failure modes with a deterministic check or a written-down workflow.

The flagship is the **context limiter** (proposed name: `brickwall`): a hard
ceiling on markdown file count and file line lengths, paired with an archival
lifecycle, so a repo's agent-loadable context stays bounded forever.

## Status

Phase 0 (repo reset + founding plan) complete. Phase 1 (context limiter
engine) in progress. See [docs/EXTRACTION_PLAN.md](docs/EXTRACTION_PLAN.md)
and [docs/ROADMAP.md](docs/ROADMAP.md).

## Provenance

Extracted from four working repos where these ideas were invented and
battle-tested: a record-label OS (agent governance), a generative plant toy
(quality gates + doc budgets), a clinical dashboard (planning/execution agent
roles), and a portfolio site (orchestration + 13 self-verifying drift checks).

Cortex dogfoods itself: this repo runs under its own budgets and `.ai/`
convention. Start at [AGENTS.md](AGENTS.md).

## License

MIT
