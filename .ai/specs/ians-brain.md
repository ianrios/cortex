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

## Use within the development chain

It is possible that people could run the tools (specifically brickwall, but any/all) in the following locations: in the agent loop, in the git hook on commit, in the ci/cd process as part of the merge / deploy strategy. This enables us to add more or less filtering and limiting depending on where we are in the process. Perhaps during agent development, the brickwall acts as a warning system, limiting up to a point but not being so rigid. Pre commit hook, it checks the docs folders and confirms files are limited, forcing agents to move them to the correct location and mark files as complete. On merge / deploy, it limits what gets built, removing documentation and product knowledge from the src dist. I imagine there are more ways to organize this and also ways to leverage the config and our scripts to know when and where to do what, and also configure how similar each of those steps looks.

## Brickwall config settings

I imagine we need to allow users to be able to configure their limits for character count (possibly pulled from eslint config if it exists (or other known and widely used configs for other ts packages or different languages entirely) or overridden in the brickwall config) and file count and line count in files for the various types of files (docs vs code at the very rudimentary level) and directories (everyone has different systems and if we start a new repo from scratch, that could potentially look very different from an existing legacy codebase that immediately fails the brickwall limit) - i know this is the fact looking at ianrios.github.io, petal, wrc, and my other repos (which we need to make sure we dogfood for all of them), and I will try to look for other repos that I own (or dont own) and attempt to dogfood the brickwall package with the new repos to see what fits and what fails. I see a world where there are a lot more config settings than what already exists, as well as a lot of config settings that already exist but probably need to be cleaned up due to only mainly being used on a small codebase and not a org scale repo like a true service or api layer

## Git aware brickwall

I see a world where upon running brickwall, it could be useful to specifically add a flag or something to only compare the current diff of the branch you are on to the previous commit, or something like that, could be helpful for developers who have thousands of files in their repo and dont want to run the whole suite on just their pr.

## Memory folding as a product (2026-07-16)

The session-close practice — short-term findings folded into long-term
homes (anti-patterns, friction lists, this file, agent-local memory) —
is not a habit, it is a CRITICAL CORTEX PIECE: buildable, shippable,
consumed by every agent using cortex. Left-shifting knowledge so future
agents never re-hit the same wall. Process now specced in
.ai/specs/memory-folding.md; tool version in BACKLOG (retro agent +
janitor territory).

## The Great Flattening (X article, read 2026-07-16, file discarded per Ian)

The myprasanna article behind the deleted-framework lesson. Its claims
that matter for cortex (rest is Vorflux marketing):

- "Every model release eats the layer beneath it" — labs ship your
  hand-rolled mechanics as defaults next quarter. The two things labs
  structurally can't ship: YOUR judgment encoded where it executes, and
  cross-lab neutrality. Cortex is exactly those two: repo-owned encoded
  judgment (budgets, anti-patterns, workflows) + agent-agnostic adapters.
- Docs decay, harnesses don't: "write principles in a doc and they decay
  the day after; put them in the harness and it applies that judgment a
  thousand times." Brickwall = docs that gate instead of decay.
- Cross-lab adversarial review (a different model family tears the work
  apart) is the check no lab will ship — supports the zero-context
  peer-review pattern and Ian's multi-provider subagent vision.
- Six-bottleneck taxonomy (machine, planning, orchestration, testing,
  review, merge) — useful frame for the Phase 4 workflow kit.

## File compression

Known set of rules to remove prose. What if agents wrote as though sentences can’t be summarized? read: https://www.saveourenvironment.ca/Several%20Short%20Sentences%20About%20Writing%20-%20Verlyn%20Klinkenborg.pdf
If we follow these practices, plans and other docs can be trimmed using these rules. The planning agent should know these rules. The compression agent (when brickwall says files are too long or need to be compressed) should know these rules. We must always use progressive disclosure to avoid duplicating prose across multiple files, which will naturally help reduce prose and cut down file counts. Code snippets have no business living in documentation. Deep link to code examples instead.

## Site/publishing posture

No wheel reinvention: README + docs in the monorepo first, maybe a GitHub
Pages static splash later, open to existing toolkit-site solutions
(Starlight/VitePress class), possibly just GitHub wiki long-term.

## The session cycle is a product (2026-07-17 close-out)

Start session → interview → plan/implement/iterate (any order) →
retro/handoff → HUMAN GAP → next session. The gap is load-bearing:
(1) compaction degrades in-session memory — critical details lost,
agents hallucinate; clean sessions beat one compacted one. (2) No
active session FORCES the human dev steps: read the code yourself,
test it yourself, write durable repo notes (not chat), be critical,
ponder architecture with time (even the session-limit reset is
thinking time). Ship this cycle as cortex tooling — pairs with
memory-folding and a handoff-prompt agent.

## Agents ship with deterministic backbones, or not at all (2026-07-17)

Never ship an agent that is only agent.md + skill files. Every shipped
agent gets real code with true logical outputs the agent runs without
the human re-explaining (brickwall is the model). A prompt-builder
agent needs a prompt registry/catalog updated per generation, plus
evals over template variants. Prove the agent beats not-using-it.
Cortex is a real terminal-usable toolkit Ian could drive without AI;
agents are the speed layer, not the substance.

## Cross-repo is the norm, not the edge (2026-07-17)

Ten years of jobs, every one required simultaneous commits across
multiple branches of multiple repos (ui-1/ui-2, an api per ui,
microservices per api, in-house design-library → component-lib → ui
chains) plus reviewing teammates' branches in parallel; worktrees only
arrived in the last year (via Claude). An orchestrator operating at
Sites/*, one monorepo, or one subpackage must know WHICH docs and
rules bind at its scope. Real spec territory.

## Init as investigation (2026-07-17)

The template file NAMES are not gospel. `cortex init` on a legacy repo
could be an agent flow: interview + investigate the repo, discover
existing fragmented docs already playing these roles, build only what
is missing. Blank-vs-seeded templates should be a user choice on
fresh repos.

## useful doc about current state of agentic coding

/Users/ianrios/Sites/cortex/.ai/specs/The Great Flattening (x article).md
