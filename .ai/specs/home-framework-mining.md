# Mining Candidates: the Deleted Home-Directory Framework

Status: findings recorded 2026-07-15; awaiting Ian's direction on what to mine.

A machine sweep found that `/Users/ianrios` (a git repo, branch
`personal-mac-2`) once contained a mature cross-IDE agent framework built
over ~40 days and deliberately pruned in commit `667d051` ("save",
2026-05-19, deleted ~61k lines). Everything is recoverable via
`git show f506851:<path>` in `~`. It was deleted as steering bloat — by its
own context-budget rules — so the default is to mine ideas, not resurrect
wholesale. Extraction candidates, ranked by fit with the cortex plan:

## Strong fit (fills gaps in existing phases)

- **Canonical cross-agent build pipeline** (`.agents/tooling/`,
  `scripts/ide-build.sh`, spec at
  `agent-plans/research/REF-canonical-format-spec.md`): one
  markdown+frontmatter source (`inclusion: auto|fileMatch|manual`) fanned
  out to Claude Code, Cursor `.mdc`, Kiro, Antigravity, Codex, with
  "generated, do not edit" boundaries. This IS the Adapters layer,
  previously built and battle-tested — direct input to Phase 4.
- **Token/spend-aware context governance** (`steering-health.sh --tokens`,
  `rule-context-budget.md`, `check-context.sh --ide <agent>` with
  WARNING/CRITICAL on window usage and daily spend): richer sibling of
  brickwall — possible post-Phase-1 `--tokens` mode or companion check.
- **Plan-bookkeeping linter** (`groom-plans.sh`: misfiled/duplicate plans,
  stale worktrees, malformed status metadata, IDEAS.md size cap): a drift
  checker over the `.ai/` lifecycle itself — natural Phase 2 userland
  check, or a brickwall sibling.

## Worth mining (pattern-layer material)

- **8-stage build pipeline** (`build-1-create-plan` … `build-8-apply-pr-
  feedback`) with plan-compression and "deslop" passes — superset of the
  clinical 3-stage model; merge best parts into Phase 4 prompts.
- **"Grill me" adversarial plan-interview skill** and
  `ask-agent-about-itself.md` — cheap, novel, packageable as skills.
- **Prefix skill taxonomy** (`know-*`, `rule-*`, `prefer-*`, `run-*`) with
  add-vs-consolidate hygiene rule — naming convention for the plugin.
- **Plan-size → model-routing ladder** (XS→haiku … L→sonnet-then-opus) and
  session cost ledger (`session-telemetry.sh`, `cost-ledger.jsonl`).
- **Phase locking** (`phase-lock.sh`, JSON lockfiles, 4h staleness) for
  concurrent agents on one machine — niche but unsolved elsewhere.

## Live survivors (extract regardless)

- **`safe_rm()`** in `~/.zsh_aliases` (~L913): shell circuit breaker
  blocking recursive deletes under protected paths without
  `ALLOW_DESTRUCTIVE=1` — dotfiles snippet for the patterns layer.
- **`~/README.md`**: machine-level agent-onboarding doc (protected-list +
  rationale + "rules for agents adding targets" template) — a home-dir
  AGENTS.md pattern nothing in the four repos covers.
- Dead pointers to clean up: `ai`/`aib`/`aip`/`aiprep`/`aimon` aliases and
  a `claude /run-session-retro` permission reference scripts deleted in
  `667d051`.

## Also found

- Orchestrator autonomy ladder (7 milestones, propose-mode → unattended)
  in `agent-plans/backlog/HOME-orchestrator/` — companion to the WRC
  governance roadmap item.
- A written steering-compression A/B experiment protocol — evidence-based
  method worth repeating for brickwall's default numbers.
- The other ~12 Sites repos and `~/.codex` contain nothing extractable
  (vendor-shipped only); `testing-context` is a 2021 React Context demo.

## Decision needed (Ian)

Which of these to mine now vs. leave in history; whether the canonical
cross-agent pipeline becomes the Phase 4 foundation; whether dead aliases
get cleaned or revived.
