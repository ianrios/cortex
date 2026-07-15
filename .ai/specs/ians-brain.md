# Extract From Ian's Brain

Standing capture of concepts Ian has developed over years of practice, so
zero-context agents stop asking him to re-explain. Update every session
where he drops a new one. Source: direct conversation, 2026-07-15.

## The mastering metaphor is a system, not a name

Music production maps onto context engineering end-to-end: ideas,
arrangement, mixing, mastering. Brickwall (hard-fail limiting) is ONE MODE
of a limiter, not the whole product. Users should eventually select
presets/styles:

- **brickwall** — hard ceiling, exit-1 enforcement, zero leeway (the "any"
  lint rule, banned eslint-disable: totally forced)
- **multiband** — different ranges per band: unique budgets per file type,
  directory, or anti-pattern (the portfolio repo is a multiband limiter —
  scss 600, ts 250, docs 80/280)
- **soft/invisible limiting or compression** — agents get flexibility up
  to N lines/files, warnings before errors, "compaction" over rejection

Rigid vs loose presets serve different developers. Preset = named config
bundle. Design config so presets can layer on later without breaking keys.

## History: the deleted home framework (~/.git, f506851)

Tried a machine-wide agent framework once; threw it away deliberately:

- 100+ skills, all always-loaded, no progressive disclosure — cost more
  tokens than it saved ("which was dumb" — his words)
- Frontier labs bake in the homebrewed solutions we build at home, so
  custom harnesses deprecate on every model release (ref:
  https://x.com/myprasanna/status/2077065557204222238)
- Lesson: learn the tools' internals and build WITH them, not against;
  develop the knack for when to build a skill vs workflow vs custom agent
  vs handoff to a different agent
- Token/spend-estimating tooling got hand-wavy across model generations;
  prefer hard facts: /context, built-in TUI tools, controlling which files
  and instructions agents may load
- safe_rm anecdote: agents don't break the blocker, they social-engineer
  Ian to add paths to the allowlist. Guardrails move pressure, not intent.
- The 8-stage build pipeline is still used conceptually today (flavors of
  it live in the four source repos) — will certainly be a cortex package.

## Lost work assets (confiscated machine, layoff) — rebuild candidates

Never made it to the home repo; concepts survive in Ian's head only:

- Prompt-template + prompt-authoring engineer agent
- Support-rotation agent with scoped access to Jira, AWS, Datadog
- Distributed-repos agent: worktree-fluent, skills scoped to own runtime

## Long-term product vision: prebuilt role agents

Cortex evolves to ship specific agents for specific problems, each with
its own steering, workflows, and skills: an orchestration agent (the main
cortex driver) distinct from a planning agent, distinct from
implementation agents — the parent agent that authored a plan delegates
and watches many subagents (at minimum one per plan phase, plus auditors
and refiners). Role separation is the product, not a usage tip.

## Machine-readable onboarding

Docs should let OTHER PEOPLE'S agents install and configure cortex
packages, with explicit human-input points (shell script prompts, TUI
steps like npm init). Documentation is also dogfood: written, pruned, and
drift-checked by the tools themselves. Docs serve: (1) Ian developing
cortex with agents, (2) agent-driven install/config for consumers, (3)
non-Ian contributors extending it (e.g. Go/Python paths — brickwall is
already language-agnostic in principle, only TS exists locally to test
against), (4) dogfooding, (5) accurate current-state at publish time.

## Bypass-resistance ("superadmin view")

Agents will eventually write skills/docs into ignored folders to dodge the
checks. There must be a flag that scans the ENTIRE repo scope, ignoring
the ignore/exempt lists, as an audit view.

## Dir taxonomy (2026-07-15, round 2)

Three classes, not two: **ignored** (node_modules, .vscode — not content),
**archival** (.ai/completed — content that exited via lifecycle), and
gray-zone dirs like .github (actions/templates are real content; ignoring
it is a default, not a truth). An ignore entry nested in a source tree
(`src/components/docs`) is a red flag. Ian's instinct: maybe don't build
prescriptive heuristics — ship a **janitor agent** package that inspects
ignored dirs and config intelligently instead. He self-checks
prescriptiveness constantly ("or am I being too prescriptive?") — the
deleted-framework lesson applied forward.

## Site/publishing posture

No wheel reinvention: README + docs in the monorepo first, maybe a GitHub
Pages static splash later, open to existing toolkit-site solutions
(Starlight/VitePress class), possibly just GitHub wiki long-term.
