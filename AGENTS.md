# Agent Instructions

Cortex is an agent-agnostic developer toolkit (context budgets, quality
harnesses, agent workflow patterns) built as a pnpm monorepo in TypeScript.
This file is the entry point for every coding agent (Claude Code, Codex, …).

## Session startup

1. Read `.ai/CONTEXT.md`, `.ai/WORK.md`, `.ai/RULES.md` in that order.
2. Read `.ai/ANTI-PATTERNS.md` — failures that already burned time.
3. For the current mission read `docs/EXTRACTION_PLAN.md`; check
   `.ai/specs/` and `.ai/plans/` for anything relevant to the request.
4. Interview Ian only if genuine ambiguity remains. Group questions.

## Operating model

Ian directs, reviews, and approves; agents own implementation, refactors,
and documentation. Non-trivial work gets a plan in `.ai/plans/`,
peer-reviewed by a zero-context subagent before implementation. New
direction needs Ian's explicit approval ("whatever is better" is not
approval); phases inside an approved plan proceed autonomously.

## Quality gates

Once Phase 1 lands: `pnpm check` (format → typecheck → lint → cortex's own
budget checks) and `pnpm test` must pass. Passing gates is necessary, not
sufficient — behavior gets verified by running the CLI against fixtures.

## Structure

- `docs/EXTRACTION_PLAN.md` — founding plan, phases, provenance
- `docs/ROADMAP.md` — watch-list of decisions and traps
- `docs/roadmap/agent-governance/` — imported WRC specs (roadmap material)
- `docs/archive/` — pre-pivot runtime-vision docs (historical, do not obey)
- `packages/` — engine packages (Phase 1+: `brickwall`, the context limiter)
- `.ai/` — repo-owned agent context (this repo dogfoods its own convention)

## Context budgets (dogfooded)

Root and `.ai/` core docs: max 80 lines. `docs/**`, `.ai/plans/**`,
`.ai/specs/**`: max 280. `docs/archive/**`, `docs/roadmap/agent-governance/**`,
`.ai/completed/**`: exempt (imported/archived records). Finished plans are
`git mv`'d to `.ai/completed/`, and their epic section folds to one line.
