# Backlog

Items deliberately deferred to dedicated sessions. One line each; expand
into `.ai/plans/` only when picked up.

- **Rebuild-candidates roadmap section** (Ian, dedicated fresh-agent
  session): promote the lost work-machine agents from
  `.ai/specs/ians-brain.md` (prompt-authoring engineer, support-rotation
  agent w/ Jira+AWS+Datadog, worktree-fluent distributed-repos agent)
  into a real `docs/ROADMAP.md` section with scoping.
- **Janitor agent package**: a shipped cortex agent that audits ignore/
  exempt config for suspicious entries and inspects what accumulates in
  ignored dirs — Ian's alternative to over-prescriptive built-in
  heuristics (see Phase 1.1 plan amendments). For already-drifted docs
  (ratified 2026-07-16): find duplicate-claim candidates
  deterministically → cluster → Ian ratifies the canonical version →
  rewrite losers into deep links. Ratification is non-negotiable.
- **Server-runner agent**: environment preflight + repo bootstrap —
  honor .nvmrc/engines, install, dev-server up/down; petal's
  `scripts/setup.sh` is the concrete example, and per-repo Node engines
  bit both dogfood migrations (Ian, 2026-07-16).
- **Enforcement-style config bundles** (post-first-publish): rigid vs
  loose named presets. Ian RETRACTED the mastering-metaphor naming
  (brickwall/multiband/soft) on 2026-07-16 — "corny", prefer clear names
  over one-domain whimsy; see .ai/specs/cleanup.md item on naming.
- **8-stage build pipeline package**: Ian still uses it conceptually;
  recover spec from `~` repo commit `f506851` when the workflow-kit
  phase starts.
- **Steering-compression A/B protocol**: repeat the deleted-framework
  experiment to validate brickwall's default numbers with evidence.
- **Memory-fold tool** (Ian, 2026-07-16: "a critical piece of the cortex
  toolkit"): codify the session-close practice in
  .ai/specs/memory-folding.md into something all cortex-consuming agents
  run — converting session findings into durable docs/memories (left
  shift). Pairs with clinical's retro-first mechanics and the janitor.
- **Session-cycle tooling** (Ian, 2026-07-17): the start/interview/work/
  retro/handoff/human-gap loop as a shippable system (see ians-brain.md
  for why the gap is load-bearing).
- **Shipped-agent catalog doc**: outline every niche agent from the
  chats (peer reviewer + janitor first — Ian ratified), each with its
  deterministic backbone per ians-brain.md; no md-only agents.
- **Cross-repo coordination spec**: scope-aware rules/docs resolution
  for multi-repo + worktree + monorepo work (ians-brain.md has the
  real-world shapes).
- **Toolchain map**: which companion tools run where (eslint, prettier,
  knip, tsc, vitest, husky, renovate, e2e, CI, …), collision notes
  (line-LENGTH is eslint/markdownlint/prettier's axis; brickwall counts
  LINES — different dimensions), and missing-tool assumptions. Ian's
  "fedex packaging" question, 2026-07-17.
- **Pre-release polish**: de-Ian the shipped surfaces (41 refs), README
  tone, legacy-doc deletion, ASCII-brain branding
  (.ai/specs/cortex-brain-example.md; "cortex" spelled in negative
  space; 3D rotation is a stretch goal).
- **Investigator runs** (Ian queued, 2026-07-17): (a) agent
  context-ingestion research to cite behind the default budgets;
  (b) token/emoji/CJK "compression" myths with tokenizer receipts.
- **Archive consolidation** (next session): one top-level archive/ for
  .ai/completed + docs/archive; delete fully-out-of-scope archives
  (git history keeps them).
